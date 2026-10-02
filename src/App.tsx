import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DailyLogView } from './components/DailyLogView';
import { WeeklyReportView } from './components/WeeklyReportView';
import { BenchmarkView } from './components/BenchmarkView';
import { CurriculumView } from './components/CurriculumView';
import { ProvenanceModal } from './components/ProvenanceModal';
import { NewWeekModal } from './components/NewWeekModal';
import { 
  PreparationWeek, 
  StudyDay, 
  WeeklyAiReport, 
  SystemAnalytics, 
  BenchmarkTest, 
  ProvenanceTrace 
} from './types';
import { INITIAL_WEEKS, INITIAL_STUDY_DAYS, INITIAL_AI_REPORTS } from './data/seedData';

export function App() {
  const [weeks, setWeeks] = useState<PreparationWeek[]>(INITIAL_WEEKS);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('2026-W40');
  const [studyDays, setStudyDays] = useState<StudyDay[]>(INITIAL_STUDY_DAYS);
  const [activeReport, setActiveReport] = useState<WeeklyAiReport | null>(INITIAL_AI_REPORTS['2026-W39'] || null);
  const [feedbackLoopEnabled, setFeedbackLoopEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

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
        if (Array.isArray(dData) && dData.length > 0) setStudyDays(dData);
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
      chapterMetrics: [
        { subject: 'Physics', chapter: 'Rotational Motion', attempts: 32, correct: 22, wrong: 10, accuracy: 68, conceptErrors: 1, applicationErrors: 6, executionErrors: 2, selectionErrors: 1, totalTimeLostMinutes: 16, status: 'critical' },
        { subject: 'Physics', chapter: 'Electrostatics', attempts: 26, correct: 20, wrong: 6, accuracy: 77, conceptErrors: 3, applicationErrors: 1, executionErrors: 2, selectionErrors: 0, totalTimeLostMinutes: 8, status: 'warning' },
        { subject: 'Physics', chapter: 'Current Electricity', attempts: 24, correct: 22, wrong: 2, accuracy: 92, conceptErrors: 0, applicationErrors: 1, executionErrors: 1, selectionErrors: 0, totalTimeLostMinutes: 3, status: 'strong' },
        { subject: 'Chemistry', chapter: 'Coordination Compounds', attempts: 28, correct: 21, wrong: 7, accuracy: 75, conceptErrors: 4, applicationErrors: 2, executionErrors: 1, selectionErrors: 0, totalTimeLostMinutes: 9, status: 'critical' },
        { subject: 'Chemistry', chapter: 'Organic Alcohols, Phenols & Ethers', attempts: 30, correct: 23, wrong: 7, accuracy: 76, conceptErrors: 1, applicationErrors: 4, executionErrors: 2, selectionErrors: 0, totalTimeLostMinutes: 7, status: 'warning' },
        { subject: 'Chemistry', chapter: 'Chemical Bonding & Molecular Structure', attempts: 34, correct: 31, wrong: 3, accuracy: 91, conceptErrors: 0, applicationErrors: 2, executionErrors: 1, selectionErrors: 0, totalTimeLostMinutes: 2, status: 'strong' },
        { subject: 'Mathematics', chapter: 'Integral Calculus (Indefinite & Definite)', attempts: 29, correct: 18, wrong: 11, accuracy: 62, conceptErrors: 1, applicationErrors: 3, executionErrors: 2, selectionErrors: 5, totalTimeLostMinutes: 24, status: 'critical' },
        { subject: 'Mathematics', chapter: 'Coordinate Geometry (Conics & Lines)', attempts: 25, correct: 19, wrong: 6, accuracy: 76, conceptErrors: 0, applicationErrors: 2, executionErrors: 3, selectionErrors: 1, totalTimeLostMinutes: 6, status: 'warning' },
        { subject: 'Mathematics', chapter: 'Vectors & 3D Geometry', attempts: 22, correct: 19, wrong: 3, accuracy: 86, conceptErrors: 0, applicationErrors: 1, executionErrors: 2, selectionErrors: 0, totalTimeLostMinutes: 4, status: 'strong' }
      ]
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
