import React from 'react';
import { 
  Activity, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ArrowUpRight, 
  TrendingUp, 
  Zap, 
  Compass, 
  FileText, 
  Plus,
  BarChart3,
  Flame,
  PieChart,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SystemAnalytics, PreparationWeek, StudyDay, AuthUser } from '../types';
import { DailyGoalsTracker } from './DailyGoalsTracker';

interface DashboardViewProps {
  analytics: SystemAnalytics;
  currentWeek: PreparationWeek;
  studyDays: StudyDay[];
  onOpenNewDay: () => void;
  onNavigateToReport: () => void;
  currentUser?: AuthUser | null;
  onNavigateToDailyLog?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  currentWeek,
  studyDays,
  onOpenNewDay,
  onNavigateToReport,
  currentUser,
  onNavigateToDailyLog
}) => {
  const targetWeeklyHours = currentWeek.targetWeeklyHours || 30;
  const hoursProgress = Math.min(100, Math.round((analytics.totalActualHours / targetWeeklyHours) * 100));

  const totalErrors = analytics.errorTypeDistribution.total || 1;
  const conceptPct = Math.round((analytics.errorTypeDistribution.concept / totalErrors) * 100);
  const appPct = Math.round((analytics.errorTypeDistribution.application / totalErrors) * 100);
  const execPct = Math.round((analytics.errorTypeDistribution.execution / totalErrors) * 100);
  const selPct = Math.round((analytics.errorTypeDistribution.selection / totalErrors) * 100);

  // Group chapters by subject
  const physicsChapters = analytics.chapterMetrics.filter(c => c.subject === 'Physics');
  const chemChapters = analytics.chapterMetrics.filter(c => c.subject === 'Chemistry');
  const mathChapters = analytics.chapterMetrics.filter(c => c.subject === 'Mathematics');

  // Visual trend data (last 7 study sessions)
  const recentSessions = [...studyDays].slice(0, 7).reverse();
  const maxDayHours = Math.max(6, ...recentSessions.map(d => Math.max(d.actualHours || 0, d.targetHours || 0)));

  // Subject question distribution
  const totalSubjectAttempts = analytics.chapterMetrics.reduce((acc, c) => acc + c.attempts, 0) || 1;
  const physicsAttempts = physicsChapters.reduce((acc, c) => acc + c.attempts, 0);
  const chemAttempts = chemChapters.reduce((acc, c) => acc + c.attempts, 0);
  const mathAttempts = mathChapters.reduce((acc, c) => acc + c.attempts, 0);
  const physicsPct = Math.round((physicsAttempts / totalSubjectAttempts) * 100);
  const chemPct = Math.round((chemAttempts / totalSubjectAttempts) * 100);
  const mathPct = Math.round((mathAttempts / totalSubjectAttempts) * 100);

  // Curricular Health Breakdown
  const criticalCount = analytics.chapterMetrics.filter(c => c.status === 'critical').length;
  const warningCount = analytics.chapterMetrics.filter(c => c.status === 'warning').length;
  const strongCount = analytics.chapterMetrics.filter(c => c.status === 'strong').length;
  const untestedCount = analytics.chapterMetrics.filter(c => c.status === 'untested').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Cycle Status & Action Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-cyan-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                {currentWeek.id}
              </span>
              {currentUser && (
                <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-md bg-slate-950/80 border border-cyan-800/50">
                  👋 Welcome, {currentUser.username}
                </span>
              )}
              <span className="text-xs font-mono text-slate-400">
                {currentWeek.startDate} → {currentWeek.endDate}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                Ratio {currentWeek.allocationRatio}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {currentWeek.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-mono">
              {currentUser 
                ? `Welcome back, ${currentUser.username}. Preparation telemetry is ready with isolated account storage.`
                : 'Feedback Loop Status: Active. Prioritizing deterministic tracking with verifiable AI diagnostic reasoning.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewDay}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs font-mono tracking-wide shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Submit Day
            </button>
            <button
              onClick={onNavigateToReport}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs font-mono border border-slate-700 flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              View Weekly Report
            </button>
          </div>
        </div>

        {/* Weekly Hours Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="text-slate-400">
              Study Volume: <strong className="text-cyan-300">{analytics.totalActualHours}h</strong> actual / {targetWeeklyHours}h target
            </span>
            <span className="text-slate-300 font-semibold">{hoursProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${hoursProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Clean Starting State Banner */}
      {studyDays.length === 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/50 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="space-y-1">
            <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block">
              Clean Start Active
            </span>
            <p className="text-white font-semibold text-sm">
              {currentUser ? `Welcome, ${currentUser.username}! Your database is initialized completely clean.` : 'Your preparation instrumentation system is fresh and ready.'}
            </p>
            <p className="text-slate-400 text-xs font-sans mt-0.5">
              • Submit your account API keys in <strong className="text-cyan-300">AI Setup & Keys</strong> (isolated strictly to your account).<br />
              • Click <strong className="text-cyan-300">Submit Day</strong> or <strong className="text-cyan-300">CSV Data</strong> to import past study records.
            </p>
          </div>
          <button
            onClick={onOpenNewDay}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold tracking-wide shrink-0 transition-all self-start sm:self-auto"
          >
            Record First Day
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Overall Accuracy */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Accuracy</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {analytics.overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
            <span className="text-emerald-400">●</span> {analytics.totalQuestions} questions logged
          </div>
        </div>

        {/* Question Throughput */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Throughput</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {analytics.questionsPerHour} <span className="text-sm font-normal text-slate-400">Q/hr</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Speed metric (Q attempted / hr)
          </div>
        </div>

        {/* JEE Context */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>JEE Performance</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-950 text-blue-300 rounded font-mono font-bold">JEE</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-300">
            {analytics.jeeAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {analytics.jeeQuestionsPerHour} Q/hr (Deep analysis)
          </div>
        </div>

        {/* CET Context */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>CET Performance</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded font-mono font-bold">CET</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-purple-300">
            {analytics.cetAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {analytics.cetQuestionsPerHour} Q/hr (Velocity & agility)
          </div>
        </div>

      </div>

      {/* Row 1.5: Visual Study Goals & 7-Day Velocity Burn-up Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Today's Daily Study Goals Tracker */}
        <div className="lg:col-span-1">
          <DailyGoalsTracker compact={true} onOpenDailyLog={onNavigateToDailyLog} />
        </div>

        {/* Widget 2: 7-Session Practice Volume & Velocity Visualizer */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-800/60 text-blue-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  Session Practice Velocity & Hours Burn-up
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Daily actual vs target hours, question volume, and precision
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span> Actual Hours
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-700"></span> Target Hours
              </span>
            </div>
          </div>

          {recentSessions.length === 0 ? (
            <div className="py-10 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 font-mono text-xs text-slate-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>No study sessions recorded yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">Submit your first day to populate the velocity telemetry.</p>
            </div>
          ) : (
            <div className="pt-2">
              <div className="h-44 flex items-end gap-3 sm:gap-6 justify-between px-2 border-b border-slate-800 pb-2">
                {recentSessions.map((session, idx) => {
                  const actualHeight = Math.min(100, Math.round(((session.actualHours || 0) / maxDayHours) * 100));
                  const targetHeight = Math.min(100, Math.round(((session.targetHours || 0) / maxDayHours) * 100));
                  const acc = session.questionsAttempted > 0 ? Math.round((session.questionsCorrect / session.questionsAttempted) * 100) : 0;
                  const qph = session.actualHours > 0 ? (session.questionsAttempted / session.actualHours).toFixed(0) : '0';

                  return (
                    <div key={session.id || idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                      
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-12 z-20 bg-slate-950 border border-slate-700 text-white text-[10px] font-mono px-2 py-1 rounded shadow-xl whitespace-nowrap">
                        {session.actualHours}h actual / {session.targetHours}h target · {session.questionsAttempted}Q ({acc}%)
                      </div>

                      {/* Accuracy Pill */}
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        acc >= 80 ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800/60' :
                        acc >= 60 ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-800/60' :
                        'text-amber-300 bg-amber-950/80 border border-amber-800/60'
                      }`}>
                        {acc}%
                      </span>

                      {/* Bars Container */}
                      <div className="w-full flex items-end justify-center gap-1.5 h-28">
                        {/* Target Bar Outline */}
                        <div 
                          className="w-2.5 sm:w-3.5 bg-slate-800/80 rounded-t-sm transition-all"
                          style={{ height: `${Math.max(8, targetHeight)}%` }}
                          title={`Target: ${session.targetHours}h`}
                        />
                        {/* Actual Bar */}
                        <div 
                          className="w-3.5 sm:w-5 bg-gradient-to-t from-cyan-600 to-blue-500 rounded-t-sm shadow-sm transition-all group-hover:from-cyan-400 group-hover:to-blue-400"
                          style={{ height: `${Math.max(10, actualHeight)}%` }}
                          title={`Actual: ${session.actualHours}h`}
                        />
                      </div>

                      {/* Date & Exam Badge */}
                      <div className="flex flex-col items-center text-center">
                        <span className="text-[10px] font-mono text-slate-300">
                          {session.date.slice(5)}
                        </span>
                        <span className={`text-[9px] font-mono font-semibold px-1 rounded ${
                          session.examFocus === 'JEE' ? 'text-blue-400' : 'text-purple-400'
                        }`}>
                          {session.examFocus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart Footnote */}
              <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-2 px-1">
                <span>Last {recentSessions.length} Study Days</span>
                <span>Average Speed: <strong className="text-cyan-300">{analytics.questionsPerHour} Q/hr</strong></span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Row 1.7: Subject Balance (3:2 Ratio) & Curricular Health Visual Spectrum */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Subject Question Allocation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              Curricular Subject Allocation (Physics · Chem · Math)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Ratio Target: <strong className="text-cyan-300">{currentWeek.allocationRatio}</strong>
            </span>
          </div>

          {/* Segmented Bar */}
          <div className="h-3.5 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800">
            <div style={{ width: `${physicsPct}%` }} className="bg-cyan-500 transition-all" title={`Physics: ${physicsPct}%`} />
            <div style={{ width: `${chemPct}%` }} className="bg-amber-500 transition-all" title={`Chemistry: ${chemPct}%`} />
            <div style={{ width: `${mathPct}%` }} className="bg-purple-500 transition-all" title={`Mathematics: ${mathPct}%`} />
          </div>

          {/* Subject Pills */}
          <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-900/40">
              <div className="flex justify-between items-center text-cyan-400 font-semibold mb-0.5">
                <span>Physics</span>
                <span>{physicsPct}%</span>
              </div>
              <span className="text-[10px] text-slate-400">{physicsAttempts} questions</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-amber-900/40">
              <div className="flex justify-between items-center text-amber-400 font-semibold mb-0.5">
                <span>Chemistry</span>
                <span>{chemPct}%</span>
              </div>
              <span className="text-[10px] text-slate-400">{chemAttempts} questions</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-purple-900/40">
              <div className="flex justify-between items-center text-purple-400 font-semibold mb-0.5">
                <span>Mathematics</span>
                <span>{mathPct}%</span>
              </div>
              <span className="text-[10px] text-slate-400">{mathAttempts} questions</span>
            </div>
          </div>
        </div>

        {/* Curricular Risk Spectrum */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Syllabus Coverage & Vulnerability Matrix
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {analytics.chapterMetrics.length} Chapters Total
            </span>
          </div>

          {/* Segmented Bar */}
          <div className="h-3.5 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800">
            <div style={{ width: `${(strongCount / analytics.chapterMetrics.length) * 100}%` }} className="bg-emerald-500 transition-all" title="Strong" />
            <div style={{ width: `${(warningCount / analytics.chapterMetrics.length) * 100}%` }} className="bg-amber-500 transition-all" title="Warning" />
            <div style={{ width: `${(criticalCount / analytics.chapterMetrics.length) * 100}%` }} className="bg-rose-500 transition-all" title="Critical" />
            <div style={{ width: `${(untestedCount / analytics.chapterMetrics.length) * 100}%` }} className="bg-slate-700 transition-all" title="Untested" />
          </div>

          {/* 4 Status Cards */}
          <div className="grid grid-cols-4 gap-2 font-mono text-xs pt-1">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-emerald-900/40 text-center">
              <span className="text-emerald-400 font-bold text-sm block">{strongCount}</span>
              <span className="text-[10px] text-slate-400">Strong</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/60 border border-amber-900/40 text-center">
              <span className="text-amber-400 font-bold text-sm block">{warningCount}</span>
              <span className="text-[10px] text-slate-400">Warning</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/60 border border-rose-900/40 text-center">
              <span className="text-rose-400 font-bold text-sm block">{criticalCount}</span>
              <span className="text-[10px] text-slate-400">Critical</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-slate-300 font-bold text-sm block">{untestedCount}</span>
              <span className="text-[10px] text-slate-500">Untested</span>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Row: Error Distribution & Latest Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Error Breakdown (Section 12 & 32 of README) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Error Classification Spectrum
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Metacognitive failure distribution across physical notebook records
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
              {totalErrors} errors cataloged
            </span>
          </div>

          {/* Stacked visual bar */}
          <div className="h-4 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800 mb-4">
            <div style={{ width: `${conceptPct}%` }} className="bg-purple-500 transition-all" title={`Concept Gap: ${conceptPct}%`} />
            <div style={{ width: `${appPct}%` }} className="bg-cyan-500 transition-all" title={`Application Gap: ${appPct}%`} />
            <div style={{ width: `${execPct}%` }} className="bg-amber-500 transition-all" title={`Execution Error: ${execPct}%`} />
            <div style={{ width: `${selPct}%` }} className="bg-rose-500 transition-all" title={`Selection Error: ${selPct}%`} />
          </div>

          {/* 4 Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            
            <div className="p-3 rounded-lg bg-slate-950/60 border border-purple-900/40">
              <div className="flex items-center justify-between text-purple-400 font-semibold mb-1">
                <span>Concept</span>
                <span>{conceptPct}%</span>
              </div>
              <div className="text-slate-400 text-[11px] leading-tight">
                Theory unknown or incomplete. Action: Learn theory.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-cyan-900/40">
              <div className="flex items-center justify-between text-cyan-400 font-semibold mb-1">
                <span>Application</span>
                <span>{appPct}%</span>
              </div>
              <div className="text-slate-400 text-[11px] leading-tight">
                Theory known, missed method. Action: Pattern recognition.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-amber-900/40">
              <div className="flex items-center justify-between text-amber-400 font-semibold mb-1">
                <span>Execution</span>
                <span>{execPct}%</span>
              </div>
              <div className="text-slate-400 text-[11px] leading-tight">
                Algebra, calculation, haste. Action: Precision drills.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-rose-900/40">
              <div className="flex items-center justify-between text-rose-400 font-semibold mb-1">
                <span>Selection</span>
                <span>{selPct}%</span>
              </div>
              <div className="text-slate-400 text-[11px] leading-tight">
                Poor time investment, sunk costs. Action: Abandonment cap.
              </div>
            </div>

          </div>

          {/* Confidence Spectrum Alert (Section 27 of README) */}
          <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              Cognitive Confidence State:
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-300">
                Confident Correct: <strong className="text-emerald-400">{analytics.confidenceDistribution.correctConfident}</strong>
              </span>
              <span className="text-slate-300" title="Possible lucky guess">
                Uncertain Correct: <strong className="text-amber-400">{analytics.confidenceDistribution.correctUncertain}</strong>
              </span>
              <span className="text-rose-400 font-semibold" title="High-priority misconception: answer was wrong but student was confident">
                ⚠ Dangerous Misconceptions (Wrong+Confident): <strong className="text-rose-300 underline">{analytics.confidenceDistribution.wrongConfident}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Latest Conclusive Benchmark (Section 7 & 25 of README) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Conclusive Feedback Signal
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800/60">
                {currentWeek.benchmark?.examType || currentWeek.benchmarkExam} Benchmark
              </span>
            </div>

            <h3 className="text-lg font-bold text-white">
              Weekly Benchmark Test
            </h3>
            
            {currentWeek.benchmark ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-mono text-white">
                    {currentWeek.benchmark.score}
                  </span>
                  <span className="text-slate-400 font-mono text-base">
                    / {currentWeek.benchmark.maximumScore}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50 ml-auto">
                    {Math.round((currentWeek.benchmark.score / currentWeek.benchmark.maximumScore) * 100)}%
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                  {currentWeek.benchmark.subjectBreakdown.map(sb => (
                    <div key={sb.subject} className="flex justify-between items-center">
                      <span className="text-slate-400">{sb.subject}</span>
                      <span className="font-semibold text-slate-200">
                        {sb.score} / {sb.maxScore} <span className="text-slate-400 font-normal">({sb.accuracy}%)</span>
                      </span>
                    </div>
                  ))}
                </div>

                {currentWeek.benchmark.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2.5 rounded border border-slate-800 font-mono">
                    "{currentWeek.benchmark.notes}"
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-6 text-center py-6 px-4 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-mono text-slate-400">
                  {currentWeek.benchmarkExam} benchmark scheduled for Sunday at cycle completion.
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  75 questions / 3 hours (JEE standard format)
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Principal feedback sensor</span>
            <span className="text-cyan-400">Section 7 Spec</span>
          </div>
        </div>

      </div>

      {/* Chapter Weakness Heatmap Matrix (Section 32 of README) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Curricular Weakness Matrix (Physics · Chemistry · Mathematics)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Empirical diagnostic state derived from daily error notebooks and timed questions
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
              Untested (0 logs)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Strong
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Warning
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Critical (≥2 gaps)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Physics Column */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-3.5">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="font-mono font-bold text-xs uppercase text-cyan-400 tracking-wider">Physics</span>
              <span className="text-[10px] font-mono text-slate-400">{physicsChapters.length} Chapters</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {physicsChapters.map(c => (
                <div 
                  key={c.chapter}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                    c.status === 'critical' ? 'bg-rose-950/30 border-rose-800/50 text-rose-200' :
                    c.status === 'warning' ? 'bg-amber-950/30 border-amber-800/50 text-amber-200' :
                    c.status === 'strong' ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200' :
                    'bg-slate-900/40 border-slate-800/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="truncate pr-2">{c.chapter}</span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      c.status === 'critical' ? 'bg-rose-500' :
                      c.status === 'warning' ? 'bg-amber-500' :
                      c.status === 'strong' ? 'bg-emerald-500' :
                      'bg-slate-600'
                    }`} />
                  </div>
                  {c.wrong > 0 ? (
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>{c.wrong} errors logged</span>
                      <span>{c.totalTimeLostMinutes}m lost</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>Untested</span>
                      <span>0m lost</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chemistry Column */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-3.5">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="font-mono font-bold text-xs uppercase text-emerald-400 tracking-wider">Chemistry</span>
              <span className="text-[10px] font-mono text-slate-400">{chemChapters.length} Chapters</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {chemChapters.map(c => (
                <div 
                  key={c.chapter}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                    c.status === 'critical' ? 'bg-rose-950/30 border-rose-800/50 text-rose-200' :
                    c.status === 'warning' ? 'bg-amber-950/30 border-amber-800/50 text-amber-200' :
                    c.status === 'strong' ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200' :
                    'bg-slate-900/40 border-slate-800/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="truncate pr-2">{c.chapter}</span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      c.status === 'critical' ? 'bg-rose-500' :
                      c.status === 'warning' ? 'bg-amber-500' :
                      c.status === 'strong' ? 'bg-emerald-500' :
                      'bg-slate-600'
                    }`} />
                  </div>
                  {c.wrong > 0 ? (
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>{c.wrong} errors logged</span>
                      <span>{c.totalTimeLostMinutes}m lost</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>Untested</span>
                      <span>0m lost</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mathematics Column */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-3.5">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="font-mono font-bold text-xs uppercase text-purple-400 tracking-wider">Mathematics</span>
              <span className="text-[10px] font-mono text-slate-400">{mathChapters.length} Chapters</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {mathChapters.map(c => (
                <div 
                  key={c.chapter}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                    c.status === 'critical' ? 'bg-rose-950/30 border-rose-800/50 text-rose-200' :
                    c.status === 'warning' ? 'bg-amber-950/30 border-amber-800/50 text-amber-200' :
                    c.status === 'strong' ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200' :
                    'bg-slate-900/40 border-slate-800/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="truncate pr-2">{c.chapter}</span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      c.status === 'critical' ? 'bg-rose-500' :
                      c.status === 'warning' ? 'bg-amber-500' :
                      c.status === 'strong' ? 'bg-emerald-500' :
                      'bg-slate-600'
                    }`} />
                  </div>
                  {c.wrong > 0 ? (
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>{c.wrong} errors logged</span>
                      <span>{c.totalTimeLostMinutes}m lost</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>Untested</span>
                      <span>0m lost</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
