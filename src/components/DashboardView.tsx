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
  Plus
} from 'lucide-react';
import { SystemAnalytics, PreparationWeek, StudyDay } from '../types';

interface DashboardViewProps {
  analytics: SystemAnalytics;
  currentWeek: PreparationWeek;
  studyDays: StudyDay[];
  onOpenNewDay: () => void;
  onNavigateToReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  currentWeek,
  studyDays,
  onOpenNewDay,
  onNavigateToReport
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

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Cycle Status & Action Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-cyan-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                {currentWeek.id}
              </span>
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
              Feedback Loop Status: Active. Prioritizing deterministic tracking with verifiable AI diagnostic reasoning.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewDay}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs font-mono tracking-wide shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              + Submit Day
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
              Your preparation instrumentation system is fresh and ready.
            </p>
            <p className="text-slate-400 text-xs font-sans mt-0.5">
              • Submit your external API keys in <strong className="text-cyan-300">AI Setup & Keys</strong> (one for OCR vision, one for thinking).<br />
              • Click <strong className="text-cyan-300">+ Submit Day</strong> to record daily hours, accuracy, and handwritten notebook reflections.
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
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Critical (≥2 gaps / leaked marks)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Warning
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Strong
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
            <div className="space-y-2">
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
                      'bg-slate-700'
                    }`} />
                  </div>
                  {c.wrong > 0 && (
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>{c.wrong} errors logged</span>
                      <span>{c.totalTimeLostMinutes}m lost</span>
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
            <div className="space-y-2">
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
                      'bg-slate-700'
                    }`} />
                  </div>
                  {c.wrong > 0 && (
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>{c.wrong} errors logged</span>
                      <span>{c.totalTimeLostMinutes}m lost</span>
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
            <div className="space-y-2">
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
                      'bg-slate-700'
                    }`} />
                  </div>
                  {c.wrong > 0 && (
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>{c.wrong} errors logged</span>
                      <span>{c.totalTimeLostMinutes}m lost</span>
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
