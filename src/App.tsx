import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DailyLogView } from './components/DailyLogView';
import { WeeklyReportView } from './components/WeeklyReportView';
import { BenchmarkView } from './components/BenchmarkView';
import { CurriculumView } from './components/CurriculumView';
import { AISetupView } from './components/AISetupView';
import { ProvenanceModal } from './components/ProvenanceModal';
import { NewWeekModal } from './components/NewWeekModal';
import { 
  PreparationWeek, 
  StudyDay, 
  WeeklyAiReport, 
  SystemAnalytics, 
  BenchmarkTest, 
  ProvenanceTrace,
  ChapterMetric
} from './types';
import { INITIAL_WEEKS, INITIAL_STUDY_DAYS, INITIAL_AI_REPORTS, CANONICAL_CURRICULUM } from './data/seedData';

export function App() {
  const [weeks, setWeeks] = useState<PreparationWeek[]>(() => {
    try {
      const saved = localStorage.getItem('dijkstra_weeks');
      return saved ? JSON.parse(saved) : INITIAL_WEEKS;
    } catch {
      return INITIAL_WEEKS;
    }
  });

  const [selectedWeekId, setSelectedWeekId] = useState<string>('2026-W40');

  const [studyDays, setStudyDays] = useState<StudyDay[]>(() => {
    try {
      const saved = localStorage.getItem('dijkstra_days');
      return saved ? JSON.parse(saved) : INITIAL_STUDY_DAYS;
    } catch {
      return INITIAL_STUDY_DAYS;
    }
  });

  const [activeReport, setActiveReport] = useState<WeeklyAiReport | null>(null);
  const [feedbackLoopEnabled, setFeedbackLoopEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dijkstra_weeks', JSON.stringify(weeks));
    } catch (e) {
      console.warn('Failed to save weeks to localStorage:', e);
    }
  }, [weeks]);

  useEffect(() => {
    try {
      localStorage.setItem('dijkstra_days', JSON.stringify(studyDays));
    } catch (e) {
      console.warn('Failed to save days to localStorage:', e);
    }
  }, [studyDays]);

  // Modals
  const [isNewDayModalOpen, setIsNewDayModalOpen] = useState(false);
  const [isNewWeekModalOpen, setIsNewWeekModalOpen] = useState(false);
  const [activeProvenanceTrace, setActiveProvenanceTrace] = useState<ProvenanceTrace | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Compute analytics dynamically from active week's days
  const activeDays = studyDays.filter(d => d.weekId === selectedWeekId);
  const currentWeek = weeks.find(w => w.id === selectedWeekId) || weeks[0] || INITIAL_WEEKS[0];

  // Fetch initial data from server API
  const refreshData = async () => {
    try {
      const [weeksRes, daysRes] = await Promise.all([
        fetch('/api/weeks'),
        fetch('/api/days')
      ]);
      if (weeksRes.ok) {
        const wData = await weeksRes.json();
        if (Array.isArray(wData) && wData.length > 0) setWeeks(wData);
      }
      if (daysRes.ok) {
        const dData = await daysRes.json();
        if (Array.isArray(dData)) setStudyDays(dData);
      }
    } catch (err) {
      console.warn('Backend fetch failed, using memory state:', err);
    }
  };

  // Load report for the selected cycle
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/weekly-report/${selectedWeekId}`);
        if (res.ok) {
          const rep = await res.json();
          setActiveReport(rep);
        } else if (selectedWeekId === '2026-W39' && INITIAL_AI_REPORTS['2026-W39']) {
          setActiveReport(INITIAL_AI_REPORTS['2026-W39']);
        } else {
          setActiveReport(null);
        }
      } catch (err) {
        if (INITIAL_AI_REPORTS[selectedWeekId]) {
          setActiveReport(INITIAL_AI_REPORTS[selectedWeekId]);
        }
      }
    };
    fetchReport();
  }, [selectedWeekId]);

  useEffect(() => {
    refreshData();
  }, []);

  // Calculate local deterministic analytics
  const computeClientAnalytics = (days: StudyDay[]): SystemAnalytics => {
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

    const errorDist = { concept: 0, application: 0, execution: 0, selection: 0, total: 0 };
    const confDist = { correctConfident: 0, correctUncertain: 0, wrongConfident: 0, wrongUncertain: 0 };

    const chapterMap: Record<string, ChapterMetric> = {};

    // Initialize all chapters from CANONICAL_CURRICULUM
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

    for (const d of days) {
      totalTarget += d.targetHours || 0;
      totalAvailable += d.availableHours || 0;
      totalActual += d.actualHours || 0;
      totalAttempted += d.questionsAttempted || 0;
      totalCorrect += d.questionsCorrect || 0;
      totalWrong += d.questionsWrong || 0;

      if (d.examFocus === 'JEE') {
        jeeAttempted += d.questionsAttempted || 0;
        jeeCorrect += d.questionsCorrect || 0;
        jeeHours += d.actualHours || 0;
      } else {
        cetAttempted += d.questionsAttempted || 0;
        cetCorrect += d.questionsCorrect || 0;
        cetHours += d.actualHours || 0;
      }

      for (const err of d.errorRecords || []) {
        errorDist[err.errorType] = (errorDist[err.errorType] || 0) + 1;
        errorDist.total += 1;

        if (err.confidenceLevel === 'correct_confident') confDist.correctConfident++;
        else if (err.confidenceLevel === 'correct_uncertain') confDist.correctUncertain++;
        else if (err.confidenceLevel === 'wrong_confident') confDist.wrongConfident++;
        else if (err.confidenceLevel === 'wrong_uncertain') confDist.wrongUncertain++;

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
      } else {
        cm.status = 'untested';
      }
    }

    return {
      overallAccuracy: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0,
      totalQuestions: totalAttempted,
      totalActualHours: parseFloat(totalActual.toFixed(1)),
      questionsPerHour: totalActual > 0 ? parseFloat((totalAttempted / totalActual).toFixed(1)) : 0,
      timeUtilizationRate: totalAvailable > 0 ? Math.round((totalActual / totalAvailable) * 100) : 0,
      errorTypeDistribution: errorDist,
      confidenceDistribution: confDist,
      jeeAccuracy: jeeAttempted > 0 ? Math.round((jeeCorrect / jeeAttempted) * 100) : 0,
      cetAccuracy: cetAttempted > 0 ? Math.round((cetCorrect / cetAttempted) * 100) : 0,
      jeeQuestionsPerHour: jeeHours > 0 ? parseFloat((jeeAttempted / jeeHours).toFixed(1)) : 0,
      cetQuestionsPerHour: cetHours > 0 ? parseFloat((cetAttempted / cetHours).toFixed(1)) : 0,
      chapterMetrics: Object.values(chapterMap)
    };
  };

  const currentAnalytics = computeClientAnalytics(activeDays.length > 0 ? activeDays : studyDays);

  // Handlers
  const handleSaveDay = async (newDayData: Partial<StudyDay>) => {
    try {
      const res = await fetch('/api/days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDayData)
      });
      if (res.ok) {
        const data = await res.json();
        setStudyDays(prev => [data.day, ...prev]);
      } else {
        // Fallback local state
        const localDay: StudyDay = {
          id: `day_${Date.now()}`,
          weekId: newDayData.weekId || selectedWeekId,
          date: newDayData.date || new Date().toISOString().split('T')[0],
          examFocus: newDayData.examFocus || 'JEE',
          dayType: newDayData.dayType || 'NORMAL',
          context: newDayData.context,
          targetHours: newDayData.targetHours || 0,
          availableHours: newDayData.availableHours || 0,
          actualHours: newDayData.actualHours || 0,
          testingHours: newDayData.testingHours || 0,
          analysisHours: newDayData.analysisHours || 0,
          otherStudyHours: newDayData.otherStudyHours || 0,
          questionsAttempted: newDayData.questionsAttempted || 0,
          questionsCorrect: newDayData.questionsCorrect || 0,
          questionsWrong: newDayData.questionsWrong || 0,
          questionsSkipped: newDayData.questionsSkipped || 0,
          guessedQuestions: newDayData.guessedQuestions || 0,
          notebookImages: newDayData.notebookImages || [],
          errorRecords: newDayData.errorRecords || [],
          feedbackLoopEnabledOnSubmit: Boolean(newDayData.feedbackLoopEnabledOnSubmit),
          processingStatus: newDayData.feedbackLoopEnabledOnSubmit ? 'completed' : 'fast_capture_only',
          createdAt: new Date().toISOString()
        };
        setStudyDays(prev => [localDay, ...prev]);
      }
    } catch (err) {
      console.error('Save day error:', err);
    }
  };

  const handleSaveBenchmark = async (benchmark: BenchmarkTest) => {
    try {
      await fetch('/api/benchmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(benchmark)
      });
    } catch (e) {
      console.warn('Benchmark post failed:', e);
    }
    setWeeks(prev => prev.map(w => w.id === benchmark.weekId ? { ...w, benchmark } : w));
  };

  const handleUpdateAllocation = async (weekId: string, ratio: string, jeeDays: number, cetDays: number) => {
    const updated = weeks.find(w => w.id === weekId);
    if (updated) {
      const newWeekObj = { ...updated, allocationRatio: ratio as any, jeeDays, cetDays };
      try {
        await fetch('/api/weeks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newWeekObj)
        });
      } catch (e) {
        console.warn('Week allocation update failed:', e);
      }
      setWeeks(prev => prev.map(w => w.id === weekId ? newWeekObj : w));
    }
  };

  const handleSaveWeek = async (weekPartial: Partial<PreparationWeek>) => {
    try {
      const res = await fetch('/api/weeks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weekPartial)
      });
      if (res.ok) {
        const created = await res.json();
        setWeeks(prev => [...prev, created]);
        setSelectedWeekId(created.id);
      }
    } catch (err) {
      console.error('Save week error:', err);
    }
  };

  const handleRegenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch(`/api/weekly-report/${selectedWeekId}/generate`, {
        method: 'POST'
      });
      if (res.ok) {
        const reportData = await res.json();
        setActiveReport(reportData);
      }
    } catch (err) {
      console.error('Regenerate report failed:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Global Application Header */}
      <Header
        weeks={weeks}
        selectedWeekId={selectedWeekId}
        onSelectWeek={setSelectedWeekId}
        feedbackLoopEnabled={feedbackLoopEnabled}
        onToggleFeedbackLoop={setFeedbackLoopEnabled}
        onOpenNewWeekModal={() => setIsNewWeekModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            analytics={currentAnalytics}
            currentWeek={currentWeek}
            studyDays={activeDays}
            onOpenNewDay={() => setIsNewDayModalOpen(true)}
            onNavigateToReport={() => setActiveTab('weekly-report')}
          />
        )}

        {activeTab === 'daily-log' && (
          <DailyLogView
            studyDays={activeDays}
            currentWeekId={selectedWeekId}
            feedbackLoopEnabled={feedbackLoopEnabled}
            onSaveDay={handleSaveDay}
            isModalOpen={isNewDayModalOpen}
            setIsModalOpen={setIsNewDayModalOpen}
          />
        )}

        {activeTab === 'weekly-report' && (
          <WeeklyReportView
            report={activeReport}
            currentWeek={currentWeek}
            analytics={currentAnalytics}
            onRegenerateReport={handleRegenerateReport}
            onInspectProvenance={(trace) => setActiveProvenanceTrace(trace)}
            isGenerating={isGeneratingReport}
          />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkView
            currentWeek={currentWeek}
            weeks={weeks}
            onSaveBenchmark={handleSaveBenchmark}
            onUpdateAllocation={handleUpdateAllocation}
          />
        )}

        {activeTab === 'curriculum' && (
          <CurriculumView
            studyDays={studyDays}
          />
        )}

        {activeTab === 'ai-setup' && (
          <AISetupView
            onSettingsSaved={() => {
              refreshData();
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs font-mono text-slate-600">
        <p>Dijkstra · Adaptive JEE/CET Preparation & Performance Instrumentation System</p>
        <p className="text-[11px] text-slate-700 mt-0.5">Attempt → Measure → Diagnose → Repair → Retest → Adapt</p>
      </footer>

      {/* Traceable Evidence Provenance Modal */}
      <ProvenanceModal
        trace={activeProvenanceTrace}
        onClose={() => setActiveProvenanceTrace(null)}
      />

      {/* New Cycle Modal */}
      <NewWeekModal
        isOpen={isNewWeekModalOpen}
        onClose={() => setIsNewWeekModalOpen(false)}
        onSaveWeek={handleSaveWeek}
        existingCount={weeks.length}
      />

    </div>
  );
}
export default App;
