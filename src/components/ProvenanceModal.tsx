import React from 'react';
import { X, Search, FileText, CheckCircle, Database, Cpu, Compass } from 'lucide-react';
import { ProvenanceTrace } from '../types';

interface ProvenanceModalProps {
  trace: ProvenanceTrace | null;
  onClose: () => void;
}

export const ProvenanceModal: React.FC<ProvenanceModalProps> = ({ trace, onClose }) => {
  if (!trace) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                Evidence Provenance (Section 18 Spec)
              </span>
              <span className="text-xs font-mono text-slate-400">
                Confidence: {Math.round(trace.confidence * 100)}%
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Why Does Dijkstra Believe This?
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Complete traceable lineage from raw student reflection to AI diagnosis
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Layer Trace Lineage */}
        <div className="mt-5 space-y-4 font-mono text-xs">
          
          {/* Layer 4: AI Inference */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 relative">
            <div className="flex items-center gap-2 text-purple-400 font-semibold mb-1">
              <Cpu className="w-4 h-4" />
              <span>Layer 4 — AI Diagnostic Inference</span>
            </div>
            <p className="text-slate-200 mt-1 font-sans text-sm">
              "{trace.diagnosisIssue}"
            </p>
            <p className="text-slate-400 text-[11px] mt-1 italic">
              {trace.aiInference}
            </p>
          </div>

          <div className="flex justify-center -my-2">
            <span className="text-slate-500 font-bold">▲ backed by</span>
          </div>

          {/* Layer 3: Deterministic Computed Evidence */}
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-800/40">
            <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
              <Database className="w-4 h-4" />
              <span>Layer 3 — Programmatic Derived Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px] mt-1">
              <div>Subject: <strong className="text-white">{trace.subject}</strong></div>
              <div>Chapter: <strong className="text-white">{trace.chapter}</strong></div>
              <div>Computed Accuracy: <strong className="text-white">{trace.computedAccuracy}</strong></div>
              <div>Total Time Leaked: <strong className="text-rose-400">{trace.timeLostTotalMin} min</strong></div>
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <span className="text-slate-500 font-bold">▲ normalized from</span>
          </div>

          {/* Layer 2: Normalized Error Record */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Layer 2 — Normalized Error Classification</span>
            </div>
            <div className="text-slate-300 text-[11px] mt-1">
              Error Type: <span className="uppercase font-bold text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">{trace.normalizedErrorType}</span>
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <span className="text-slate-500 font-bold">▲ extracted from</span>
          </div>

          {/* Layer 1: Source Student Reflection Note */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
              <div className="flex items-center gap-2 text-amber-400">
                <FileText className="w-4 h-4" />
                <span>Layer 1 — Physical Notebook Observation</span>
              </div>
              <span className="text-[10px] text-slate-500">{trace.sourceImageName || 'Physical Error Notebook'}</span>
            </div>
            <p className="text-amber-200/90 text-xs font-sans mt-2 bg-slate-900/80 p-2.5 rounded border border-slate-800 italic">
              "{trace.sourceNotebookNote}"
            </p>
          </div>

        </div>

        {/* Footer Note */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-400">
          <span>AI conclusions never overwrite historical ground truth.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close Trace
          </button>
        </div>

      </div>
    </div>
  );
};
