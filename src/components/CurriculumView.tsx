import React, { useState } from 'react';
import { 
  GitFork, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  Clock, 
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { StudyDay, ErrorRecord, ErrorType, ConfidenceLevel } from '../types';
import { CANONICAL_CURRICULUM } from '../data/seedData';

interface CurriculumViewProps {
  studyDays: StudyDay[];
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({ studyDays }) => {
  const [selectedSubject, setSelectedSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics');
  const [selectedChapter, setSelectedChapter] = useState<string>(CANONICAL_CURRICULUM.Physics[0].chapter);
  
  // Vault filters
  const [vaultSubjectFilter, setVaultSubjectFilter] = useState<string>('ALL');
  const [vaultTypeFilter, setVaultTypeFilter] = useState<string>('ALL');
  const [vaultConfidenceFilter, setVaultConfidenceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all errors across days
  const allErrors: ErrorRecord[] = studyDays.flatMap(d => d.errorRecords || []);

  const filteredErrors = allErrors.filter(err => {
    if (vaultSubjectFilter !== 'ALL' && err.subject !== vaultSubjectFilter) return false;
    if (vaultTypeFilter !== 'ALL' && err.errorType !== vaultTypeFilter) return false;
    if (vaultConfidenceFilter !== 'ALL' && err.confidenceLevel !== vaultConfidenceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        err.chapter.toLowerCase().includes(q) ||
        err.concept.toLowerCase().includes(q) ||
        err.description.toLowerCase().includes(q) ||
        err.whyItHappened.toLowerCase().includes(q) ||
        err.correctUnderstanding.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
            Canonical Knowledge Base · Section 14 Spec
          </span>
          <span className="text-xs font-mono text-slate-400">
            Shared Syllabus · Tagged by Examination Context
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Curriculum Hierarchy & Metacognitive Error Vault
        </h1>
        <p className="text-xs font-mono text-slate-400 mt-1 max-w-xl">
          The curriculum exists once. JEE and CET share chapter trees while performance measurements remain tagged by exam context.
        </p>
      </div>

      {/* Curriculum Explorer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Canonical Curriculum Explorer
        </h2>

        {/* Subject Pills */}
        <div className="flex gap-2">
          {(['Physics', 'Chemistry', 'Mathematics'] as const).map(subj => (
            <button
              key={subj}
              onClick={() => {
                setSelectedSubject(subj);
                setSelectedChapter(CANONICAL_CURRICULUM[subj][0].chapter);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                selectedSubject === subj
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Chapter list */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-2">
              Chapters ({CANONICAL_CURRICULUM[selectedSubject].length})
            </span>
            {CANONICAL_CURRICULUM[selectedSubject].map(chap => {
              const isSelected = selectedChapter === chap.chapter;
              const errorsInChapter = allErrors.filter(e => e.chapter === chap.chapter).length;

              return (
                <button
                  key={chap.chapter}
                  onClick={() => setSelectedChapter(chap.chapter)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-800/60' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate pr-2">{chap.chapter}</span>
                  {errorsInChapter > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-900/60 shrink-0">
                      {errorsInChapter} err
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Concept Detail */}
          <div className="md:col-span-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">{selectedSubject}</span>
                <h3 className="text-base font-bold text-white font-mono">{selectedChapter}</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Canonical Concepts: {CANONICAL_CURRICULUM[selectedSubject].find(c => c.chapter === selectedChapter)?.concepts.length || 0}
              </span>
            </div>

            <div className="space-y-2">
              {CANONICAL_CURRICULUM[selectedSubject]
                .find(c => c.chapter === selectedChapter)
                ?.concepts.map((concept, i) => (
                  <div key={i} className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-200 flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                      {concept}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400">
                      Shared JEE · CET
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filterable Error Database / Vault */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-rose-400" />
              Metacognitive Error Vault ({filteredErrors.length} records)
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Filter by error type, subject, or cognitive confidence state
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div>
            <label className="text-slate-500 block mb-1 text-[11px]">Subject</label>
            <select
              value={vaultSubjectFilter}
              onChange={(e) => setVaultSubjectFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
            >
              <option value="ALL">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 block mb-1 text-[11px]">Error Type</label>
            <select
              value={vaultTypeFilter}
              onChange={(e) => setVaultTypeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
            >
              <option value="ALL">All Error Types</option>
              <option value="concept">Concept Gap</option>
              <option value="application">Application Gap</option>
              <option value="execution">Execution Error</option>
              <option value="selection">Selection Error</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 block mb-1 text-[11px]">Confidence State</label>
            <select
              value={vaultConfidenceFilter}
              onChange={(e) => setVaultConfidenceFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
            >
              <option value="ALL">All Confidence States</option>
              <option value="wrong_confident">⚠ Dangerous Misconception (Wrong + Confident)</option>
              <option value="wrong_uncertain">Known Weakness (Wrong + Uncertain)</option>
              <option value="correct_uncertain">Lucky Guess (Correct + Uncertain)</option>
              <option value="correct_confident">Reliable (Correct + Confident)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 block mb-1 text-[11px]">Search Notes</label>
            <input
              type="text"
              placeholder="Search concepts, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
            />
          </div>
        </div>

        {/* Filtered Error Cards */}
        <div className="space-y-3 pt-2">
          {filteredErrors.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-xs font-mono text-slate-500">
              No matching errors found for the selected filters.
            </div>
          ) : (
            filteredErrors.map((err, i) => (
              <div 
                key={err.id || i}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      err.errorType === 'concept' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      err.errorType === 'application' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                      err.errorType === 'execution' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {err.errorType}
                    </span>
                    <span className="font-bold text-white">
                      {err.subject} · {err.chapter}
                    </span>
                    <span className="text-slate-400">({err.concept})</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span>Time lost: <strong className="text-rose-400">{Math.round(err.timeLostSeconds / 60)}m</strong></span>
                    <span className="text-slate-600">•</span>
                    <span className={`${err.confidenceLevel === 'wrong_confident' ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                      {err.confidenceLevel}
                    </span>
                  </div>
                </div>

                <p className="text-slate-200 font-sans text-xs">
                  {err.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                  <div className="bg-slate-900/60 p-2 rounded">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Why it happened:</span>
                    <span className="text-amber-300/90">{err.whyItHappened}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Correct Understanding:</span>
                    <span className="text-emerald-300/90">{err.correctUnderstanding}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
