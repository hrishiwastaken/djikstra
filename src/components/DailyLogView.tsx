import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Target, 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  Trash2, 
  AlertCircle, 
  FileText, 
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StudyDay, ErrorRecord, ExamFocus, DayType, ErrorType, ConfidenceLevel } from '../types';
import { NOTEBOOK_PHOTO_PRESETS, CANONICAL_CURRICULUM } from '../data/seedData';

interface DailyLogViewProps {
  studyDays: StudyDay[];
  currentWeekId: string;
  feedbackLoopEnabled: boolean;
  onSaveDay: (newDay: Partial<StudyDay>) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const DailyLogView: React.FC<DailyLogViewProps> = ({
  studyDays,
  currentWeekId,
  feedbackLoopEnabled,
  onSaveDay,
  isModalOpen,
  setIsModalOpen
}) => {
  const [expandedDayId, setExpandedDayId] = useState<string | null>(studyDays[0]?.id || null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [examFocus, setExamFocus] = useState<ExamFocus>('JEE');
  const [dayType, setDayType] = useState<DayType>('NORMAL');
  const [context, setContext] = useState('');
  
  // Time metrics
  const [targetHours, setTargetHours] = useState('6.0');
  const [availableHours, setAvailableHours] = useState('5.5');
  const [actualHours, setActualHours] = useState('5.0');
  const [testingHours, setTestingHours] = useState('3.0');
  const [analysisHours, setAnalysisHours] = useState('1.5');
  const [otherHours, setOtherHours] = useState('0.5');

  // Question metrics
  const [questionsAttempted, setQuestionsAttempted] = useState('45');
  const [questionsCorrect, setQuestionsCorrect] = useState('34');
  const [questionsWrong, setQuestionsWrong] = useState('8');
  const [questionsSkipped, setQuestionsSkipped] = useState('3');
  const [guessedQuestions, setGuessedQuestions] = useState('2');

  // Notebook upload / extraction
  const [selectedPresetId, setSelectedPresetId] = useState(NOTEBOOK_PHOTO_PRESETS[0].id);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [rawTextNote, setRawTextNote] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Confirmed / editable extracted records (Human review stage)
  const [extractedErrors, setExtractedErrors] = useState<ErrorRecord[]>([]);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle image upload from user computer / camera
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageBase64(reader.result as string);
        setSelectedPresetId('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Extraction (Stage A of Pipeline)
  const handleRunAiExtraction = async () => {
    setIsExtracting(true);
    try {
      const payload: any = {};
      if (uploadedImageBase64) {
        payload.imageBase64 = uploadedImageBase64;
      } else if (selectedPresetId) {
        payload.presetId = selectedPresetId;
      }
      if (rawTextNote) {
        payload.rawTextNote = rawTextNote;
      }

      const res = await fetch('/api/extract-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.records) {
        setExtractedErrors(data.records);
        setHasExtracted(true);
      }
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpdateExtractedField = (index: number, field: keyof ErrorRecord, value: any) => {
    setExtractedErrors(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveExtractedError = (index: number) => {
    setExtractedErrors(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddManualError = () => {
    const newErr: ErrorRecord = {
      id: `err_manual_${Date.now()}`,
      subject: 'Physics',
      chapter: 'Rotational Motion',
      concept: 'General Concept',
      errorType: 'application',
      description: '',
      whyItHappened: '',
      correctUnderstanding: '',
      timeLostSeconds: 180,
      confidenceLevel: 'wrong_uncertain',
      createdAt: new Date().toISOString()
    };
    setExtractedErrors(prev => [...prev, newErr]);
    setHasExtracted(true);
  };

  const handleSubmitDay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveDay({
        weekId: currentWeekId,
        date,
        examFocus,
        dayType,
        context,
        targetHours: parseFloat(targetHours) || 0,
        availableHours: parseFloat(availableHours) || 0,
        actualHours: parseFloat(actualHours) || 0,
        testingHours: parseFloat(testingHours) || 0,
        analysisHours: parseFloat(analysisHours) || 0,
        otherStudyHours: parseFloat(otherHours) || 0,
        questionsAttempted: parseInt(questionsAttempted, 10) || 0,
        questionsCorrect: parseInt(questionsCorrect, 10) || 0,
        questionsWrong: parseInt(questionsWrong, 10) || 0,
        questionsSkipped: parseInt(questionsSkipped, 10) || 0,
        guessedQuestions: parseInt(guessedQuestions, 10) || 0,
        notebookImages: uploadedImageBase64 ? [uploadedImageBase64] : (selectedPresetId ? [selectedPresetId] : []),
        errorRecords: extractedErrors,
        feedbackLoopEnabledOnSubmit: feedbackLoopEnabled
      });
      setIsModalOpen(false);
      // Reset form
      setHasExtracted(false);
      setExtractedErrors([]);
      setRawTextNote('');
      setUploadedImageBase64(null);
    } catch (err) {
      console.error('Failed to save day:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & New Day Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Daily Preparation Submissions & Notebook Digitizer
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Capture daily actual vs available time, question accuracy, and physical mistake notebook reflections.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs font-mono tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Record New Day
        </button>
      </div>

      {/* Logged Days List */}
      <div className="space-y-4">
        {studyDays.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-mono text-slate-300">No study days recorded for this cycle yet.</p>
            <p className="text-xs font-mono text-slate-500 mt-1">Click "+ Record New Day" above to log practice.</p>
          </div>
        ) : (
          studyDays.map(day => {
            const isExpanded = expandedDayId === day.id;
            const accuracy = day.questionsAttempted > 0 ? Math.round((day.questionsCorrect / day.questionsAttempted) * 100) : 0;
            const qph = day.actualHours > 0 ? (day.questionsAttempted / day.actualHours).toFixed(1) : '0';

            return (
              <div 
                key={day.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden transition-all hover:border-slate-700/80"
              >
                {/* Day Header Row */}
                <div 
                  onClick={() => setExpandedDayId(isExpanded ? null : day.id)}
                  className="p-4 cursor-pointer flex flex-wrap items-center justify-between gap-3 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                      day.examFocus === 'JEE' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      {day.examFocus}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono text-sm">{day.date}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                          {day.dayType}
                        </span>
                        {day.feedbackLoopEnabledOnSubmit && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                            Loop Active
                          </span>
                        )}
                      </div>
                      {day.context && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 font-mono">
                          {day.context}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-mono">
                    <div className="hidden sm:block text-right">
                      <div className="text-slate-400 text-[10px] uppercase">Hours</div>
                      <div className="text-slate-200 font-semibold">
                        <span className="text-cyan-400">{day.actualHours}h</span> / {day.availableHours}h avail
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-slate-400 text-[10px] uppercase">Questions</div>
                      <div className="text-slate-200 font-semibold">
                        {day.questionsCorrect}/{day.questionsAttempted} ({accuracy}%)
                      </div>
                    </div>

                    <div className="hidden md:block text-right">
                      <div className="text-slate-400 text-[10px] uppercase">Throughput</div>
                      <div className="text-amber-400 font-semibold">{qph} Q/hr</div>
                    </div>

                    <div className="text-right">
                      <div className="text-slate-400 text-[10px] uppercase">Errors</div>
                      <div className="text-rose-400 font-semibold">{day.errorRecords?.length || 0} cataloged</div>
                    </div>

                    <button className="text-slate-400 hover:text-white p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details & Metacognitive Error Records */}
                {isExpanded && (
                  <div className="p-4 bg-slate-950/70 border-t border-slate-800 space-y-4">
                    {/* Time breakdown details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-500">Target Hours:</span>
                        <div className="text-slate-200 font-semibold">{day.targetHours}h</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Testing Time:</span>
                        <div className="text-slate-200 font-semibold">{day.testingHours}h</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Analysis Time:</span>
                        <div className="text-slate-200 font-semibold">{day.analysisHours}h</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Questions Skipped:</span>
                        <div className="text-slate-200 font-semibold">{day.questionsSkipped} (Guessed: {day.guessedQuestions})</div>
                      </div>
                    </div>

                    {/* Error Records list */}
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase text-slate-300 mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        Notebook Error Analysis Records ({day.errorRecords?.length || 0})
                      </h4>

                      {day.errorRecords?.length === 0 ? (
                        <p className="text-xs font-mono text-slate-500 italic">No specific errors logged for this day.</p>
                      ) : (
                        <div className="space-y-2">
                          {day.errorRecords.map((err, i) => (
                            <div 
                              key={err.id || i}
                              className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    err.errorType === 'concept' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                                    err.errorType === 'application' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                                    err.errorType === 'execution' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                    'bg-rose-950 text-rose-300 border border-rose-800'
                                  }`}>
                                    {err.errorType}
                                  </span>
                                  <span className="font-bold text-slate-200">
                                    {err.subject} · {err.chapter}
                                  </span>
                                  <span className="text-slate-400 text-[11px]">
                                    ({err.concept})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                                  <span>Time cost: <strong className="text-rose-400">{Math.round(err.timeLostSeconds / 60)} min</strong></span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-slate-300">{err.confidenceLevel}</span>
                                </div>
                              </div>

                              <p className="text-slate-200 font-sans text-xs mt-1">
                                {err.description}
                              </p>

                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/60">
                                <div>
                                  <span className="text-slate-500">Why it happened: </span>
                                  <span className="text-amber-300/90">{err.whyItHappened}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Correct understanding: </span>
                                  <span className="text-emerald-300/90">{err.correctUnderstanding}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Day Submission Modal with Human Confirmation Step (Section 34 Spec) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                    Daily Input Pipeline
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    feedbackLoopEnabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {feedbackLoopEnabled ? 'Loop: ON (Full Adaptive Feedback)' : 'Loop: OFF (Fast Capture Only)'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">Record Daily Preparation</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDay} className="mt-5 space-y-6">
              
              {/* Context & Exam Focus Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Exam Focus</label>
                  <select
                    value={examFocus}
                    onChange={(e) => setExamFocus(e.target.value as ExamFocus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="JEE">JEE (Depth & Multi-concept)</option>
                    <option value="CET">CET (Velocity & Throughput)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Day Type</label>
                  <select
                    value={dayType}
                    onChange={(e) => setDayType(e.target.value as DayType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="NORMAL">NORMAL (Regular study)</option>
                    <option value="SCHOOL_HEAVY">SCHOOL_HEAVY (Constrained)</option>
                    <option value="SCHOOL_TEST">SCHOOL_TEST (Mock examination)</option>
                    <option value="HOLIDAY">HOLIDAY (Expanded window)</option>
                    <option value="OTHER_CONSTRAINT">OTHER_CONSTRAINT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Context Notes (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Lab practicals took 2 hours; focused exclusively on calculus drills."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Time Breakdown (Section 8 Spec: Target, Available, Actual must not be conflated) */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 flex items-center justify-between">
                  <span>Three-Layer Study Time (Hours)</span>
                  <span className="text-[10px] text-cyan-400 font-normal">Section 8 Rule: Never conflate</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-slate-500 block text-[11px] mb-1">Target</label>
                    <input
                      type="number"
                      step="0.1"
                      value={targetHours}
                      onChange={(e) => setTargetHours(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block text-[11px] mb-1">Available</label>
                    <input
                      type="number"
                      step="0.1"
                      value={availableHours}
                      onChange={(e) => setAvailableHours(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-cyan-400 font-semibold block text-[11px] mb-1">Actual Study</label>
                    <input
                      type="number"
                      step="0.1"
                      value={actualHours}
                      onChange={(e) => setActualHours(e.target.value)}
                      className="w-full bg-slate-900 border border-cyan-700/60 rounded-lg p-1.5 text-center text-cyan-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block text-[11px] mb-1">Testing</label>
                    <input
                      type="number"
                      step="0.1"
                      value={testingHours}
                      onChange={(e) => setTestingHours(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block text-[11px] mb-1">Analysis</label>
                    <input
                      type="number"
                      step="0.1"
                      value={analysisHours}
                      onChange={(e) => setAnalysisHours(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block text-[11px] mb-1">Other Theory</label>
                    <input
                      type="number"
                      step="0.1"
                      value={otherHours}
                      onChange={(e) => setOtherHours(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Questions Data */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase mb-3">
                  Questions Attempted & Accuracy
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-slate-400 block mb-1">Attempted</label>
                    <input
                      type="number"
                      value={questionsAttempted}
                      onChange={(e) => setQuestionsAttempted(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-emerald-400 block mb-1">Correct</label>
                    <input
                      type="number"
                      value={questionsCorrect}
                      onChange={(e) => setQuestionsCorrect(e.target.value)}
                      className="w-full bg-slate-900 border border-emerald-800 rounded-lg p-1.5 text-center text-emerald-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-rose-400 block mb-1">Wrong</label>
                    <input
                      type="number"
                      value={questionsWrong}
                      onChange={(e) => setQuestionsWrong(e.target.value)}
                      className="w-full bg-slate-900 border border-rose-800 rounded-lg p-1.5 text-center text-rose-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Skipped</label>
                    <input
                      type="number"
                      value={questionsSkipped}
                      onChange={(e) => setQuestionsSkipped(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-amber-400 block mb-1">Guessed</label>
                    <input
                      type="number"
                      value={guessedQuestions}
                      onChange={(e) => setGuessedQuestions(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-800 rounded-lg p-1.5 text-center text-amber-300"
                    />
                  </div>
                </div>
              </div>

              {/* Physical Notebook Mistake Analysis & OCR Stage */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      Physical Mistake Notebook Image & AI Extraction
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Digitizes metacognitive reflections, not raw questions (Section 11 Spec)
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleRunAiExtraction}
                    disabled={isExtracting}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-semibold flex items-center gap-2 shadow-md shadow-purple-900/30 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isExtracting ? 'Extracting...' : 'Extract Errors via AI'}
                  </button>
                </div>

                {/* Photo Preset Selector & Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="text-slate-400 block mb-1">Select Preset Sample Notebook Page:</label>
                    <select
                      value={selectedPresetId}
                      onChange={(e) => {
                        setSelectedPresetId(e.target.value);
                        setUploadedImageBase64(null);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    >
                      {NOTEBOOK_PHOTO_PRESETS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Or Upload Custom Photo / Camera:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-300 text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-300 hover:file:bg-slate-700"
                    />
                  </div>
                </div>

                {/* Optional free-text handwritten transcription */}
                <div>
                  <label className="text-slate-400 block text-xs font-mono mb-1">
                    Or Type Handwritten Notes Directly:
                  </label>
                  <textarea
                    rows={2}
                    value={rawTextNote}
                    onChange={(e) => setRawTextNote(e.target.value)}
                    placeholder="e.g. Q.14 Rotational Motion: Forgot friction provides torque about CM. Wrote a = g sinθ without (1 + I/mR²)."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Human Confirmation Table (Section 34 Spec: Human confirmation mandatory) */}
                <div className="pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Human Confirmation & Review Table ({extractedErrors.length} records)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddManualError}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Custom Error
                    </button>
                  </div>

                  {extractedErrors.length === 0 ? (
                    <div className="p-4 text-center bg-slate-900/40 rounded-lg border border-dashed border-slate-800 text-xs font-mono text-slate-500">
                      No errors extracted yet. Click "Extract Errors via AI" or select a preset to populate.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {extractedErrors.map((err, idx) => (
                        <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-700/80 text-xs font-mono space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <select
                              value={err.subject}
                              onChange={(e) => handleUpdateExtractedField(idx, 'subject', e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded p-1 text-slate-200"
                            >
                              <option value="Physics">Physics</option>
                              <option value="Chemistry">Chemistry</option>
                              <option value="Mathematics">Mathematics</option>
                            </select>

                            <input
                              type="text"
                              value={err.chapter}
                              placeholder="Chapter"
                              onChange={(e) => handleUpdateExtractedField(idx, 'chapter', e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded p-1 text-slate-200"
                            />

                            <select
                              value={err.errorType}
                              onChange={(e) => handleUpdateExtractedField(idx, 'errorType', e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded p-1 text-cyan-300 font-semibold"
                            >
                              <option value="concept">Concept Gap</option>
                              <option value="application">Application Gap</option>
                              <option value="execution">Execution Error</option>
                              <option value="selection">Selection Error</option>
                            </select>

                            <div className="flex items-center gap-2">
                              <select
                                value={err.confidenceLevel}
                                onChange={(e) => handleUpdateExtractedField(idx, 'confidenceLevel', e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded p-1 text-slate-200 flex-1 text-[11px]"
                              >
                                <option value="wrong_confident">Wrong + Confident (Misconception)</option>
                                <option value="wrong_uncertain">Wrong + Uncertain</option>
                                <option value="correct_confident">Correct + Confident</option>
                                <option value="correct_uncertain">Correct + Uncertain (Lucky)</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => handleRemoveExtractedError(idx)}
                                className="p-1 text-slate-400 hover:text-rose-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={err.description}
                            placeholder="What went wrong?"
                            onChange={(e) => handleUpdateExtractedField(idx, 'description', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <input
                              type="text"
                              value={err.whyItHappened}
                              placeholder="Why it happened"
                              onChange={(e) => handleUpdateExtractedField(idx, 'whyItHappened', e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded p-1 text-amber-300"
                            />
                            <input
                              type="text"
                              value={err.correctUnderstanding}
                              placeholder="Correct understanding / repair action"
                              onChange={(e) => handleUpdateExtractedField(idx, 'correctUnderstanding', e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded p-1 text-emerald-300"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  {feedbackLoopEnabled ? '⚡ Triggering full adaptive feedback upon commit' : '💾 Committing canonical records (fast capture mode)'}
                </span>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving Day...' : 'Commit Canonical Day'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
