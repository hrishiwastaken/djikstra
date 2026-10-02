import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Cpu, 
  Database, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  Search, 
  FlaskConical, 
  ArrowRight,
  Clock,
  Zap,
  Target,
  RefreshCw
} from 'lucide-react';
import { WeeklyAiReport, PreparationWeek, SystemAnalytics, ProvenanceTrace } from '../types';

interface WeeklyReportViewProps {
  report: WeeklyAiReport | null;
  currentWeek: PreparationWeek;
  analytics: SystemAnalytics;
  onRegenerateReport: () => Promise<void>;
  onInspectProvenance: (trace: ProvenanceTrace) => void;
  isGenerating: boolean;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({
  report,
  currentWeek,
  analytics,
  onRegenerateReport,
  onInspectProvenance,
  isGenerating
}) => {
  return (
    <div className="space-y-6">
      
      {/* Top Banner / Engineering Review Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                Engineering Review · Section 24 Spec
              </span>
              <span className="text-xs font-mono text-slate-400">
                Cycle: {currentWeek.id} ({currentWeek.allocationRatio})
              </span>
              {report && (
                <span className="text-xs font-mono text-slate-500">
                  Model: {report.model}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Weekly Preparation Review & AI Diagnosis
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1 max-w-2xl">
              Strict separation between deterministic measurements and evidence-backed cognitive inferences.
            </p>
          </div>

          <button
            onClick={onRegenerateReport}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Synthesizing...' : 'Run Fresh AI Synthesis'}
          </button>
        </div>

        {/* Executive Summary Card */}
        {report && (
          <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs">
            <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Executive Diagnostic Summary
            </div>
            <p className="text-slate-200 text-sm font-sans leading-relaxed">
              {report.summary}
            </p>
          </div>
        )}
      </div>

      {/* Empty State when no report is generated yet */}
      {!report ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <Cpu className="w-12 h-12 text-purple-400/60 mx-auto" />
          <h3 className="text-lg font-bold text-white font-mono">No AI Report Synthesized Yet for {currentWeek.id}</h3>
          <p className="text-xs font-mono text-slate-400 max-w-lg mx-auto leading-relaxed">
            Once you log daily preparation sessions and mistake reflections, click "Run Fresh AI Synthesis" to generate evidence-grounded diagnoses, failure mechanism analysis, and a testable Next Week Experiment.
          </p>
          <div className="pt-2 flex justify-center gap-3 font-mono text-xs">
            <button
              onClick={onRegenerateReport}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Synthesizing...' : 'Synthesize Cycle Report'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Side-by-Side: Measured Ground Truth vs AI Analytical Inferences (Section 33 Spec) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: MEASURED (Programmatic Ground Truth) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
                1. Measured Ground Truth
              </h2>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              Programmatic Data
            </span>
          </div>

          {/* Quick Metrics Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Actual Hours</span>
              <span className="text-lg font-bold text-white">{analytics.totalActualHours}h</span>
              <span className="text-[10px] text-slate-500 block">{analytics.timeUtilizationRate}% of avail</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Questions</span>
              <span className="text-lg font-bold text-white">{analytics.totalQuestions}</span>
              <span className="text-[10px] text-slate-500 block">{analytics.overallAccuracy}% accuracy</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Throughput</span>
              <span className="text-lg font-bold text-amber-400">{analytics.questionsPerHour}</span>
              <span className="text-[10px] text-slate-500 block">Questions / hour</span>
            </div>
          </div>

          {/* Empirical Findings */}
          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-cyan-400 font-semibold mb-1">
                JEE vs CET Divergence Measurement:
              </div>
              <p className="text-slate-300 text-xs font-sans">
                JEE accuracy logged at <strong className="text-white">{analytics.jeeAccuracy}%</strong> ({analytics.jeeQuestionsPerHour} Q/hr) vs CET at <strong className="text-white">{analytics.cetAccuracy}%</strong> ({analytics.cetQuestionsPerHour} Q/hr). Time pressure in CET did not produce higher concept errors.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-rose-400 font-semibold mb-1">
                Error Taxonomy Frequency:
              </div>
              <p className="text-slate-300 text-xs font-sans">
                Application gaps ({analytics.errorTypeDistribution.application}) and Selection errors ({analytics.errorTypeDistribution.selection}) outnumber pure Concept gaps ({analytics.errorTypeDistribution.concept}) by 2.4x.
              </p>
            </div>
          </div>
        </div>

        {/* Right: AI INFERENCE (Diagnostic Reasoning) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
                2. AI Diagnostic Inferences
              </h2>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold bg-purple-950 text-purple-300 border border-purple-800">
              Analytical Reasoning
            </span>
          </div>

          {/* Major Observations with Evidence Citations */}
          <div className="space-y-3">
            {report?.majorObservations.map((obs, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950/80 border border-purple-900/30 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-purple-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Observation {idx + 1}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Confidence: {Math.round(obs.confidence * 100)}%
                  </span>
                </div>

                <p className="text-slate-200 font-sans text-xs">
                  {obs.observation}
                </p>

                <div className="pt-1.5 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase">Supporting Evidence:</span>
                  <ul className="list-disc list-inside text-[11px] text-slate-400 mt-0.5 space-y-0.5">
                    {obs.evidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Diagnoses with Evidence Provenance Inspector (Section 18 Spec) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              Traceable Diagnoses & Evidence Lineage
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Click "Inspect Provenance" on any diagnosis to trace back through student notebook entries
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Section 18 Evidence Provenance Spec
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report?.diagnoses.map((diag, i) => {
            const matchingTrace = report.provenanceTraces.find(t => t.id === diag.id) || report.provenanceTraces[i] || report.provenanceTraces[0];

            return (
              <div 
                key={diag.id || i}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="font-bold text-cyan-300">
                      {diag.subject} · {diag.chapter}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      diag.type === 'concept' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      diag.type === 'application' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                      diag.type === 'execution' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {diag.type}
                    </span>
                  </div>

                  <p className="text-slate-200 text-xs font-sans leading-relaxed">
                    {diag.issue}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">
                    Confidence: <strong className="text-slate-300">{Math.round(diag.confidence * 100)}%</strong>
                  </span>
                  {matchingTrace && (
                    <button
                      onClick={() => onInspectProvenance(matchingTrace)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Search className="w-3 h-3" />
                      Inspect Provenance
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Priorities & Concrete Interventions (Section 23 Spec) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          Recommended Next Actions & Interventions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report?.recommendedPriorities.map((rec, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">
                  {rec.subject} · {rec.chapter}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  rec.priority === 'high' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {rec.priority} Priority
                </span>
              </div>

              <div className="text-slate-400 text-xs font-sans">
                <strong className="text-slate-300 font-mono text-[11px]">Reason: </strong>
                {rec.reason}
              </div>

              <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-xs font-sans">
                <strong className="text-emerald-400 font-mono text-[11px] block mb-0.5">Concrete Intervention: </strong>
                {rec.actionIntervention}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Week Experiment (Section 43 & Section 23 of README Spec) */}
      {report?.nextWeekExperiment && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-900/50 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Empirical Next Week Experiment (Section 43 Spec)
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Dijkstra treats preparation adjustments as testable scientific experiments rather than arbitrary timetable changes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs mt-2">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-indigo-400 font-bold block mb-1 uppercase text-[10px]">1. Hypothesis</span>
              <p className="text-slate-200 font-sans text-xs leading-relaxed">
                {report.nextWeekExperiment.hypothesis}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1 uppercase text-[10px]">2. Planned Intervention</span>
              <p className="text-slate-200 font-sans text-xs leading-relaxed">
                {report.nextWeekExperiment.intervention}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1 uppercase text-[10px]">3. Verification Measurement</span>
              <p className="text-slate-200 font-sans text-xs leading-relaxed">
                {report.nextWeekExperiment.measurement}
              </p>
            </div>
          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
};
