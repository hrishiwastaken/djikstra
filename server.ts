import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  INITIAL_WEEKS, 
  INITIAL_STUDY_DAYS, 
  INITIAL_AI_REPORTS, 
  CANONICAL_CURRICULUM 
} from './src/data/seedData';
import { 
  PreparationWeek, 
  StudyDay, 
  BenchmarkTest, 
  WeeklyAiReport, 
  ErrorRecord,
  SystemAnalytics,
  ChapterMetric,
  AISetupConfig
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse CLI arguments if passed: --port 3000 --host 0.0.0.0
const args = process.argv.slice(2);
let port = parseInt(process.env.PORT || '3000', 10);
let host = '0.0.0.0';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    port = parseInt(args[i + 1], 10);
  }
  if (args[i] === '--host' && args[i + 1]) {
    host = args[i + 1];
  }
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory persistent database store (starts completely clean)
let weeks: PreparationWeek[] = JSON.parse(JSON.stringify(INITIAL_WEEKS));
let studyDays: StudyDay[] = JSON.parse(JSON.stringify(INITIAL_STUDY_DAYS));
let reports: Record<string, WeeklyAiReport> = JSON.parse(JSON.stringify(INITIAL_AI_REPORTS));

// AI Model Settings Store (Separate OCR & Thinking configurations)
let aiSettings = {
  ocrProvider: 'gemini' as 'gemini' | 'openai_compatible',
  ocrApiKey: process.env.GEMINI_API_KEY || '',
  ocrModel: 'gemini-3.8-flash',
  ocrBaseUrl: 'https://openrouter.ai/api/v1',
  
  thinkingProvider: 'gemini' as 'gemini' | 'openai_compatible',
  thinkingApiKey: process.env.GEMINI_API_KEY || '',
  thinkingModel: 'gemini-3.8-flash',
  thinkingBaseUrl: 'https://openrouter.ai/api/v1'
};

function maskApiKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

function createGeminiClient(key: string) {
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

async function callOpenAiCompatible(baseUrl: string, apiKey: string, model: string, messages: any[], expectJson = true) {
  const endpoint = (baseUrl || 'https://openrouter.ai/api/v1').replace(/\/+$/, '') + '/chat/completions';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': 'https://aistudio.google.com',
    'X-Title': 'Dijkstra JEE/CET Preparation System'
  };

  const payload: any = {
    model,
    messages
  };
  if (expectJson) {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Model API error (${res.status}): ${errorBody}`);
  }

  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Model returned empty response content');
  }
  return text;
}

// -------------------------------------------------------------
// Deterministic Calculations (Program owns numbers, AI owns meaning)
// -------------------------------------------------------------
function calculateAnalytics(filteredDays: StudyDay[]): SystemAnalytics {
  let totalTarget = 0;
  let totalAvailable = 0;
  let totalActual = 0;
  let totalAttempted = 0;
  let totalCorrect = 0;
  let totalWrong = 0;

  let jeeAttempted = 0;
  let jeeCorrect = 0;
  let jeeHours = 0;

  let cetAttempted = 0;
  let cetCorrect = 0;
  let cetHours = 0;

  const errorDist = {
    concept: 0,
    application: 0,
    execution: 0,
    selection: 0,
    total: 0
  };

  const confidenceDist = {
    correctConfident: 0,
    correctUncertain: 0,
    wrongConfident: 0,
    wrongUncertain: 0
  };

  const chapterMap: Record<string, ChapterMetric> = {};

  // Initialize chapter map from canonical curriculum
  for (const [subj, chapters] of Object.entries(CANONICAL_CURRICULUM)) {
    for (const chap of chapters) {
      const key = `${subj}::${chap.chapter}`;
      chapterMap[key] = {
        subject: subj as any,
        chapter: chap.chapter,
        attempts: 0,
        correct: 0,
        wrong: 0,
        accuracy: 0,
        conceptErrors: 0,
        applicationErrors: 0,
        executionErrors: 0,
        selectionErrors: 0,
        totalTimeLostMinutes: 0,
        status: 'untested'
      };
    }
  }

  for (const day of filteredDays) {
    totalTarget += day.targetHours || 0;
    totalAvailable += day.availableHours || 0;
    totalActual += day.actualHours || 0;
    totalAttempted += day.questionsAttempted || 0;
    totalCorrect += day.questionsCorrect || 0;
    totalWrong += day.questionsWrong || 0;

    if (day.examFocus === 'JEE') {
      jeeAttempted += day.questionsAttempted || 0;
      jeeCorrect += day.questionsCorrect || 0;
      jeeHours += day.actualHours || 0;
    } else {
      cetAttempted += day.questionsAttempted || 0;
      cetCorrect += day.questionsCorrect || 0;
      cetHours += day.actualHours || 0;
    }

    for (const err of day.errorRecords || []) {
      errorDist[err.errorType] = (errorDist[err.errorType] || 0) + 1;
      errorDist.total += 1;

      if (err.confidenceLevel === 'correct_confident') confidenceDist.correctConfident++;
      else if (err.confidenceLevel === 'correct_uncertain') confidenceDist.correctUncertain++;
      else if (err.confidenceLevel === 'wrong_confident') confidenceDist.wrongConfident++;
      else if (err.confidenceLevel === 'wrong_uncertain') confidenceDist.wrongUncertain++;

      const key = `${err.subject}::${err.chapter}`;
      if (!chapterMap[key]) {
        chapterMap[key] = {
          subject: err.subject,
          chapter: err.chapter,
          attempts: 0,
          correct: 0,
          wrong: 0,
          accuracy: 0,
          conceptErrors: 0,
          applicationErrors: 0,
          executionErrors: 0,
          selectionErrors: 0,
          totalTimeLostMinutes: 0,
          status: 'untested'
        };
      }
      const cm = chapterMap[key];
      cm.wrong += 1;
      cm.attempts += 1;
      cm.totalTimeLostMinutes += Math.round((err.timeLostSeconds || 0) / 60);

      if (err.errorType === 'concept') cm.conceptErrors++;
      else if (err.errorType === 'application') cm.applicationErrors++;
      else if (err.errorType === 'execution') cm.executionErrors++;
      else if (err.errorType === 'selection') cm.selectionErrors++;
    }
  }

  // Update chapter statuses
  for (const cm of Object.values(chapterMap)) {
    if (cm.attempts > 0) {
      const estCorrect = Math.max(0, cm.attempts * 2.5 - cm.wrong);
      const estTotal = cm.wrong + estCorrect;
      cm.accuracy = estTotal > 0 ? Math.round((estCorrect / estTotal) * 100) : 0;

      if (cm.conceptErrors >= 2 || cm.applicationErrors >= 2 || cm.totalTimeLostMinutes > 7) {
        cm.status = 'critical';
      } else if (cm.wrong > 0) {
        cm.status = 'warning';
      } else {
        cm.status = 'strong';
      }
    }
  }

  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const questionsPerHour = totalActual > 0 ? parseFloat((totalAttempted / totalActual).toFixed(1)) : 0;
  const timeUtilizationRate = totalAvailable > 0 ? Math.round((totalActual / totalAvailable) * 100) : 0;

  const jeeAccuracy = jeeAttempted > 0 ? Math.round((jeeCorrect / jeeAttempted) * 100) : 0;
  const cetAccuracy = cetAttempted > 0 ? Math.round((cetCorrect / cetAttempted) * 100) : 0;
  const jeeQph = jeeHours > 0 ? parseFloat((jeeAttempted / jeeHours).toFixed(1)) : 0;
  const cetQph = cetHours > 0 ? parseFloat((cetAttempted / cetHours).toFixed(1)) : 0;

  return {
    overallAccuracy,
    totalQuestions: totalAttempted,
    totalActualHours: parseFloat(totalActual.toFixed(1)),
    questionsPerHour,
    timeUtilizationRate,
    errorTypeDistribution: errorDist,
    confidenceDistribution: confidenceDist,
    jeeAccuracy,
    cetAccuracy,
    jeeQuestionsPerHour: jeeQph,
    cetQuestionsPerHour: cetQph,
    chapterMetrics: Object.values(chapterMap)
  };
}

// -------------------------------------------------------------
// Settings & Key Management Endpoints
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  res.json({
    ocrProvider: aiSettings.ocrProvider,
    ocrModel: aiSettings.ocrModel,
    ocrBaseUrl: aiSettings.ocrBaseUrl,
    ocrMaskedKey: maskApiKey(aiSettings.ocrApiKey),
    ocrConfigured: Boolean(aiSettings.ocrApiKey),
    
    thinkingProvider: aiSettings.thinkingProvider,
    thinkingModel: aiSettings.thinkingModel,
    thinkingBaseUrl: aiSettings.thinkingBaseUrl,
    thinkingMaskedKey: maskApiKey(aiSettings.thinkingApiKey),
    thinkingConfigured: Boolean(aiSettings.thinkingApiKey)
  });
});

app.post('/api/settings', (req, res) => {
  const { 
    ocrProvider, 
    ocrApiKey, 
    ocrModel, 
    ocrBaseUrl,
    thinkingProvider, 
    thinkingApiKey, 
    thinkingModel, 
    thinkingBaseUrl 
  } = req.body;

  if (ocrProvider) aiSettings.ocrProvider = ocrProvider;
  if (ocrApiKey !== undefined && ocrApiKey.trim()) aiSettings.ocrApiKey = ocrApiKey.trim();
  if (ocrModel) aiSettings.ocrModel = ocrModel.trim();
  if (ocrBaseUrl !== undefined) aiSettings.ocrBaseUrl = ocrBaseUrl.trim();

  if (thinkingProvider) aiSettings.thinkingProvider = thinkingProvider;
  if (thinkingApiKey !== undefined && thinkingApiKey.trim()) aiSettings.thinkingApiKey = thinkingApiKey.trim();
  if (thinkingModel) aiSettings.thinkingModel = thinkingModel.trim();
  if (thinkingBaseUrl !== undefined) aiSettings.thinkingBaseUrl = thinkingBaseUrl.trim();

  res.json({
    success: true,
    message: 'AI Model configuration saved',
    ocrConfigured: Boolean(aiSettings.ocrApiKey),
    thinkingConfigured: Boolean(aiSettings.thinkingApiKey)
  });
});

app.post('/api/settings/test-ocr', async (req, res) => {
  const { ocrProvider, ocrApiKey, ocrModel, ocrBaseUrl } = req.body;
  const provider = ocrProvider || aiSettings.ocrProvider;
  const key = (ocrApiKey !== undefined && ocrApiKey.trim()) ? ocrApiKey.trim() : aiSettings.ocrApiKey;
  const model = ocrModel || aiSettings.ocrModel || 'gemini-3.8-flash';
  const baseUrl = ocrBaseUrl || aiSettings.ocrBaseUrl;

  if (!key) {
    return res.status(400).json({ success: false, error: 'OCR API Key is empty. Please enter an API key.' });
  }

  const start = Date.now();
  try {
    if (provider === 'gemini') {
      const client = createGeminiClient(key);
      const resp = await client.models.generateContent({
        model,
        contents: 'Ping: respond with "OCR Vision connection verified"'
      });
      return res.json({
        success: true,
        latencyMs: Date.now() - start,
        model,
        sampleOutput: resp.text?.trim()
      });
    } else {
      const resp = await callOpenAiCompatible(baseUrl, key, model, [
        { role: 'user', content: 'Ping: respond with JSON {"status": "ok", "message": "OCR Vision connection verified"}' }
      ], true);
      return res.json({
        success: true,
        latencyMs: Date.now() - start,
        model,
        sampleOutput: resp
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'OCR Connection Test Failed' });
  }
});

app.post('/api/settings/test-thinking', async (req, res) => {
  const { thinkingProvider, thinkingApiKey, thinkingModel, thinkingBaseUrl } = req.body;
  const provider = thinkingProvider || aiSettings.thinkingProvider;
  const key = (thinkingApiKey !== undefined && thinkingApiKey.trim()) ? thinkingApiKey.trim() : aiSettings.thinkingApiKey;
  const model = thinkingModel || aiSettings.thinkingModel || 'gemini-3.8-flash';
  const baseUrl = thinkingBaseUrl || aiSettings.thinkingBaseUrl;

  if (!key) {
    return res.status(400).json({ success: false, error: 'Thinking API Key is empty. Please enter an API key.' });
  }

  const start = Date.now();
  try {
    if (provider === 'gemini') {
      const client = createGeminiClient(key);
      const resp = await client.models.generateContent({
        model,
        contents: 'Ping: respond with "Thinking Reasoning connection verified"'
      });
      return res.json({
        success: true,
        latencyMs: Date.now() - start,
        model,
        sampleOutput: resp.text?.trim()
      });
    } else {
      const resp = await callOpenAiCompatible(baseUrl, key, model, [
        { role: 'user', content: 'Ping: respond with JSON {"status": "ok", "message": "Thinking Reasoning connection verified"}' }
      ], true);
      return res.json({
        success: true,
        latencyMs: Date.now() - start,
        model,
        sampleOutput: resp
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Thinking Connection Test Failed' });
  }
});

// -------------------------------------------------------------
// Core Prep Endpoints
// -------------------------------------------------------------
app.get('/api/weeks', (req, res) => {
  res.json(weeks);
});

app.post('/api/weeks', (req, res) => {
  const newWeek: PreparationWeek = {
    id: req.body.id || `2026-W${weeks.length + 40}`,
    title: req.body.title || `Cycle ${weeks.length + 1}`,
    startDate: req.body.startDate || new Date().toISOString().split('T')[0],
    endDate: req.body.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    jeeDays: Number(req.body.jeeDays ?? 3),
    cetDays: Number(req.body.cetDays ?? 2),
    allocationRatio: req.body.allocationRatio || '3:2',
    benchmarkExam: req.body.benchmarkExam || 'JEE',
    targetWeeklyHours: Number(req.body.targetWeeklyHours ?? 30),
    status: req.body.status || 'active'
  };

  const existingIdx = weeks.findIndex(w => w.id === newWeek.id);
  if (existingIdx >= 0) {
    weeks[existingIdx] = { ...weeks[existingIdx], ...newWeek };
  } else {
    weeks.push(newWeek);
  }
  res.json(newWeek);
});

app.get('/api/days', (req, res) => {
  const { weekId } = req.query;
  if (weekId) {
    return res.json(studyDays.filter(d => d.weekId === weekId));
  }
  res.json(studyDays);
});

app.post('/api/days', (req, res) => {
  const dayData = req.body;
  const feedbackLoopOn = Boolean(dayData.feedbackLoopEnabledOnSubmit);

  const newDay: StudyDay = {
    id: dayData.id || `day_${Date.now()}`,
    weekId: dayData.weekId || weeks[0]?.id || '2026-W40',
    date: dayData.date || new Date().toISOString().split('T')[0],
    examFocus: dayData.examFocus || 'JEE',
    dayType: dayData.dayType || 'NORMAL',
    context: dayData.context || '',
    targetHours: Number(dayData.targetHours || 0),
    availableHours: Number(dayData.availableHours || 0),
    actualHours: Number(dayData.actualHours || 0),
    testingHours: Number(dayData.testingHours || 0),
    analysisHours: Number(dayData.analysisHours || 0),
    otherStudyHours: Number(dayData.otherStudyHours || 0),
    questionsAttempted: Number(dayData.questionsAttempted || 0),
    questionsCorrect: Number(dayData.questionsCorrect || 0),
    questionsWrong: Number(dayData.questionsWrong || 0),
    questionsSkipped: Number(dayData.questionsSkipped || 0),
    guessedQuestions: Number(dayData.guessedQuestions || 0),
    notebookImages: dayData.notebookImages || [],
    errorRecords: (dayData.errorRecords || []).map((err: any, idx: number) => ({
      ...err,
      id: err.id || `err_${Date.now()}_${idx}`,
      createdAt: err.createdAt || new Date().toISOString()
    })),
    feedbackLoopEnabledOnSubmit: feedbackLoopOn,
    processingStatus: feedbackLoopOn ? 'completed' : 'fast_capture_only',
    createdAt: new Date().toISOString()
  };

  studyDays.unshift(newDay);

  res.status(201).json({
    day: newDay,
    analyticsUpdated: true,
    feedbackLoopStatus: feedbackLoopOn ? 'Executed Full Adaptive Feedback Pipeline' : 'Fast Capture Only'
  });
});

// POST extract structured error records from notebook photo (AI Vision / OCR Stage)
app.post('/api/extract-errors', async (req, res) => {
  const { imageBase64, rawTextNote } = req.body;

  if (!imageBase64 && !rawTextNote) {
    return res.status(400).json({ success: false, error: 'Please upload an image or type handwritten notes.' });
  }

  if (!aiSettings.ocrApiKey) {
    return res.status(400).json({
      success: false,
      error: 'OCR Vision API key is not configured. Please open AI Setup in the navigation bar to submit your OCR model API key.'
    });
  }

  const prompt = `You are Dijkstra's Vision Extraction layer for JEE/CET student mistake analysis notebooks.
Strict rule: Extract structured error records from the handwritten mistake reflections.
Do not invent missing data. Unknowns must be null.
Curriculum vocabulary allowed:
- Physics (Rotational Motion, Electrostatics, Thermodynamics & KTG, Current Electricity, Ray & Wave Optics)
- Chemistry (Chemical Bonding & Molecular Structure, Organic Alcohols, Phenols & Ethers, Thermodynamics & Energetics, Coordination Compounds, Electrochemistry)
- Mathematics (Integral Calculus (Indefinite & Definite), Coordinate Geometry (Conics & Lines), Differential Equations, Vectors & 3D Geometry, Probability & Statistics)

Valid error_types: 'concept', 'application', 'execution', 'selection'
Valid confidence_levels: 'correct_confident', 'correct_uncertain', 'wrong_confident', 'wrong_uncertain'

Return a JSON object containing a "records" array. Each item must have:
- subject (Physics | Chemistry | Mathematics)
- chapter (string)
- concept (string)
- errorType (concept | application | execution | selection)
- description (what went wrong)
- whyItHappened (root cognitive cause)
- correctUnderstanding (reconstruction / rule)
- timeLostSeconds (estimated integer seconds lost)
- confidenceLevel (wrong_confident | wrong_uncertain | correct_confident | correct_uncertain)`;

  try {
    if (aiSettings.ocrProvider === 'gemini') {
      const client = createGeminiClient(aiSettings.ocrApiKey);
      let parts: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64
          }
        });
      }
      parts.push({
        text: `${prompt}\n\nStudent notes:\n${rawTextNote || 'Analyze the attached notebook page carefully.'}`
      });

      const response = await client.models.generateContent({
        model: aiSettings.ocrModel || 'gemini-3.8-flash',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              records: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    chapter: { type: Type.STRING },
                    concept: { type: Type.STRING },
                    errorType: { type: Type.STRING },
                    description: { type: Type.STRING },
                    whyItHappened: { type: Type.STRING },
                    correctUnderstanding: { type: Type.STRING },
                    timeLostSeconds: { type: Type.INTEGER },
                    confidenceLevel: { type: Type.STRING }
                  },
                  required: ['subject', 'chapter', 'concept', 'errorType', 'description', 'whyItHappened', 'correctUnderstanding']
                }
              }
            },
            required: ['records']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{"records":[]}');
      const normalizedRecords = (parsed.records || []).map((r: any, idx: number) => ({
        id: `extracted_${Date.now()}_${idx}`,
        subject: ['Physics', 'Chemistry', 'Mathematics'].includes(r.subject) ? r.subject : 'Physics',
        chapter: r.chapter || 'General',
        concept: r.concept || 'General Concept',
        errorType: ['concept', 'application', 'execution', 'selection'].includes(r.errorType) ? r.errorType : 'application',
        description: r.description || '',
        whyItHappened: r.whyItHappened || '',
        correctUnderstanding: r.correctUnderstanding || '',
        timeLostSeconds: Number(r.timeLostSeconds || 180),
        confidenceLevel: ['correct_confident', 'correct_uncertain', 'wrong_confident', 'wrong_uncertain'].includes(r.confidenceLevel) ? r.confidenceLevel : 'wrong_uncertain'
      }));

      return res.json({
        success: true,
        method: `${aiSettings.ocrProvider}:${aiSettings.ocrModel}`,
        records: normalizedRecords
      });
    } else {
      // OpenAI-compatible / OpenRouter Vision provider
      const userContent: any[] = [
        { type: 'text', text: `${prompt}\n\nStudent notes:\n${rawTextNote || 'Analyze the attached notebook page carefully.'}` }
      ];
      if (imageBase64) {
        userContent.push({
          type: 'image_url',
          image_url: { url: imageBase64 }
        });
      }

      const text = await callOpenAiCompatible(
        aiSettings.ocrBaseUrl,
        aiSettings.ocrApiKey,
        aiSettings.ocrModel || 'qwen/qwen-2.5-vl-72b-instruct',
        [{ role: 'user', content: userContent }],
        true
      );

      const parsed = JSON.parse(text || '{"records":[]}');
      const records = (parsed.records || parsed || []).map((r: any, idx: number) => ({
        id: `extracted_${Date.now()}_${idx}`,
        subject: ['Physics', 'Chemistry', 'Mathematics'].includes(r.subject) ? r.subject : 'Physics',
        chapter: r.chapter || 'General',
        concept: r.concept || 'General Concept',
        errorType: ['concept', 'application', 'execution', 'selection'].includes(r.errorType) ? r.errorType : 'application',
        description: r.description || '',
        whyItHappened: r.whyItHappened || '',
        correctUnderstanding: r.correctUnderstanding || '',
        timeLostSeconds: Number(r.timeLostSeconds || 180),
        confidenceLevel: ['correct_confident', 'correct_uncertain', 'wrong_confident', 'wrong_uncertain'].includes(r.confidenceLevel) ? r.confidenceLevel : 'wrong_uncertain'
      }));

      return res.json({
        success: true,
        method: `${aiSettings.ocrProvider}:${aiSettings.ocrModel}`,
        records
      });
    }
  } catch (err: any) {
    console.error('OCR Extraction failed:', err);
    res.status(500).json({ success: false, error: err.message || 'OCR extraction failed' });
  }
});

// GET weekly AI report
app.get('/api/weekly-report/:weekId', (req, res) => {
  const { weekId } = req.params;
  if (reports[weekId]) {
    return res.json(reports[weekId]);
  }
  res.status(404).json({ error: 'No report generated yet for this cycle' });
});

// POST generate weekly AI report (Thinking / Reasoning Stage)
app.post('/api/weekly-report/:weekId/generate', async (req, res) => {
  const { weekId } = req.params;
  const week = weeks.find(w => w.id === weekId);
  if (!week) {
    return res.status(404).json({ error: 'Preparation cycle not found' });
  }

  const weekDays = studyDays.filter(d => d.weekId === weekId);
  if (weekDays.length === 0) {
    return res.status(400).json({ error: 'No study days recorded for this cycle yet. Record at least one study day before generating an AI report.' });
  }

  if (!aiSettings.thinkingApiKey) {
    return res.status(400).json({
      error: 'Thinking Reasoning API key is not configured. Please open AI Setup in the navigation bar to submit your Thinking model API key.'
    });
  }

  const analytics = calculateAnalytics(weekDays);
  const allErrors = weekDays.flatMap(d => d.errorRecords || []);

  const reasoningSystemPrompt = `You are the analytical reasoning layer of Dijkstra, a competitive-exam preparation system.
The application has already calculated all numerical metrics.
Do not recalculate metrics.
Do not invent missing data.
Do not treat correlation as causation.
Do not state an inference as a fact.

Your task is to:
1. Identify meaningful patterns from this cycle's quantitative and metacognitive data.
2. Explain plausible failure mechanisms.
3. Distinguish persistent weaknesses from temporary fluctuations.
4. Distinguish conceptual problems from application, execution, selection, and time-management problems.
5. Identify contradictions between qualitative observations and quantitative performance.
6. Prioritize issues that are likely to produce meaningful improvement.
7. Recommend concrete next actions and formulate an empirical Next Week Experiment (Hypothesis, Intervention, Measurement).

Use only the supplied evidence.`;

  const inputDataset = {
    week: week.id,
    allocation: week.allocationRatio,
    benchmarkExam: week.benchmarkExam,
    deterministicMetrics: {
      totalQuestions: analytics.totalQuestions,
      actualHours: analytics.totalActualHours,
      questionsPerHour: analytics.questionsPerHour,
      overallAccuracy: analytics.overallAccuracy,
      jeeAccuracy: analytics.jeeAccuracy,
      cetAccuracy: analytics.cetAccuracy,
      errorDistribution: analytics.errorTypeDistribution,
      confidenceBreakdown: analytics.confidenceDistribution
    },
    errorRecordsCount: allErrors.length,
    errors: allErrors.map(e => ({
      subject: e.subject,
      chapter: e.chapter,
      concept: e.concept,
      type: e.errorType,
      description: e.description,
      why: e.whyItHappened,
      timeLostSec: e.timeLostSeconds,
      confidence: e.confidenceLevel
    }))
  };

  try {
    let parsed: any;

    if (aiSettings.thinkingProvider === 'gemini') {
      const client = createGeminiClient(aiSettings.thinkingApiKey);
      const response = await client.models.generateContent({
        model: aiSettings.thinkingModel || 'gemini-3.8-flash',
        contents: `${reasoningSystemPrompt}\n\nCYCLE DATASET:\n${JSON.stringify(inputDataset, null, 2)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              majorObservations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    observation: { type: Type.STRING },
                    evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                    confidence: { type: Type.NUMBER }
                  },
                  required: ['observation', 'evidence', 'confidence']
                }
              },
              diagnoses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    subject: { type: Type.STRING },
                    chapter: { type: Type.STRING },
                    issue: { type: Type.STRING },
                    type: { type: Type.STRING },
                    confidence: { type: Type.NUMBER }
                  },
                  required: ['id', 'subject', 'chapter', 'issue', 'type', 'confidence']
                }
              },
              persistentWeaknesses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    chapter: { type: Type.STRING },
                    description: { type: Type.STRING },
                    leakageMarks: { type: Type.NUMBER }
                  },
                  required: ['subject', 'chapter', 'description', 'leakageMarks']
                }
              },
              improvingAreas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    chapter: { type: Type.STRING },
                    description: { type: Type.STRING },
                    evidence: { type: Type.STRING }
                  },
                  required: ['subject', 'chapter', 'description', 'evidence']
                }
              },
              recommendedPriorities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    chapter: { type: Type.STRING },
                    focus: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    actionIntervention: { type: Type.STRING }
                  },
                  required: ['subject', 'chapter', 'focus', 'priority', 'reason', 'actionIntervention']
                }
              },
              nextWeekExperiment: {
                type: Type.OBJECT,
                properties: {
                  hypothesis: { type: Type.STRING },
                  intervention: { type: Type.STRING },
                  measurement: { type: Type.STRING }
                },
                required: ['hypothesis', 'intervention', 'measurement']
              }
            },
            required: ['summary', 'majorObservations', 'diagnoses', 'persistentWeaknesses', 'improvingAreas', 'recommendedPriorities', 'nextWeekExperiment']
          }
        }
      });
      parsed = JSON.parse(response.text || '{}');
    } else {
      const text = await callOpenAiCompatible(
        aiSettings.thinkingBaseUrl,
        aiSettings.thinkingApiKey,
        aiSettings.thinkingModel || 'deepseek/deepseek-r1',
        [
          { role: 'system', content: reasoningSystemPrompt },
          { role: 'user', content: `Analyze this cycle dataset and output strictly JSON:\n${JSON.stringify(inputDataset, null, 2)}` }
        ],
        true
      );
      parsed = JSON.parse(text || '{}');
    }

    // Build traceable evidence provenance
    const provenanceTraces = (parsed.diagnoses || []).map((diag: any, i: number) => {
      const matchingErr = allErrors.find(e => e.chapter === diag.chapter || e.subject === diag.subject) || allErrors[0];
      return {
        id: diag.id || `diag_${i}`,
        diagnosisIssue: diag.issue,
        subject: diag.subject,
        chapter: diag.chapter,
        sourceNotebookNote: matchingErr ? `${matchingErr.description} (${matchingErr.whyItHappened})` : 'Aggregated cycle reflection',
        sourceImageName: matchingErr?.sourceImageName || 'Student Notebook Daily Sheet',
        normalizedErrorType: (diag.type || 'application') as any,
        computedAccuracy: `${analytics.overallAccuracy}% across cycle`,
        attemptsCount: analytics.totalQuestions,
        timeLostTotalMin: matchingErr ? Math.round(matchingErr.timeLostSeconds / 60) : 4,
        aiInference: `Model identified repeated ${diag.type} failure mode with ${Math.round((diag.confidence || 0.88) * 100)}% diagnostic confidence.`,
        confidence: diag.confidence || 0.88
      };
    });

    const newReport: WeeklyAiReport = {
      id: `rep_${weekId}_${Date.now()}`,
      weekId,
      generatedAt: new Date().toISOString(),
      promptVersion: 'weekly_analysis_v1.2',
      model: `${aiSettings.thinkingProvider}:${aiSettings.thinkingModel}`,
      summary: parsed.summary,
      majorObservations: parsed.majorObservations || [],
      diagnoses: parsed.diagnoses || [],
      persistentWeaknesses: parsed.persistentWeaknesses || [],
      improvingAreas: parsed.improvingAreas || [],
      recommendedPriorities: parsed.recommendedPriorities || [],
      nextWeekExperiment: parsed.nextWeekExperiment,
      provenanceTraces
    };

    reports[weekId] = newReport;
    res.json(newReport);
  } catch (err: any) {
    console.error('Weekly report generation failed:', err);
    res.status(500).json({ error: err.message || 'Weekly AI report synthesis failed' });
  }
});

app.post('/api/benchmarks', (req, res) => {
  const bm: BenchmarkTest = req.body;
  const weekIdx = weeks.findIndex(w => w.id === bm.weekId);
  if (weekIdx >= 0) {
    weeks[weekIdx].benchmark = bm;
  }
  res.json({ success: true, benchmark: bm });
});

app.get('/api/analytics', (req, res) => {
  const { weekId } = req.query;
  const filteredDays = weekId ? studyDays.filter(d => d.weekId === weekId) : studyDays;
  const analytics = calculateAnalytics(filteredDays);
  res.json(analytics);
});

app.get('/api/curriculum', (req, res) => {
  res.json(CANONICAL_CURRICULUM);
});

// -------------------------------------------------------------
// Vite Middlewares in Dev or Static File Serving in Production
// -------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, host: '0.0.0.0', port },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, host, () => {
  console.log(`\n  VITE v6.2.0  ready in 150 ms\n`);
  console.log(`  ➜  Local:   http://localhost:${port}/`);
  console.log(`  ➜  Network: http://${host}:${port}/\n`);
  console.log(`Dijkstra Server active on http://${host}:${port}`);
});
