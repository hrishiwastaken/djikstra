import React, { useState, useRef } from 'react';
import { 
  Zap, 
  Table, 
  Plus, 
  Trash2, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ChevronRight,
  BookOpen,
  HelpCircle,
  FileText,
  Copy,
  X
} from 'lucide-react';
import { ErrorRecord, ErrorType, ConfidenceLevel } from '../types';
import { CANONICAL_CURRICULUM } from '../data/seedData';

interface DiagnosticMistakeLoggerProps {
  errors: ErrorRecord[];
  onErrorsChange: (errors: ErrorRecord[]) => void;
  onAttachPhoto?: (base64: string | null) => void;
  attachedPhoto?: string | null;
}

// Preset common causes for JEE / CET preparation
const COMMON_CAUSE_PRESETS: Record<ErrorType, { label: string; cause: string; takeaway: string }[]> = {
  execution: [
    { label: 'Calculation / Arithmetic Slip', cause: 'Arithmetic / algebraic computation mistake under speed pressure.', takeaway: 'Double-check intermediate calculations; do not skip algebra steps.' },
    { label: 'Sign Error (+/-)', cause: 'Inverted sign convention (e.g. thermodynamics work, coordinate signs).', takeaway: 'Write sign convention explicitly before substituting values.' },
    { label: 'Unit Conversion (cm vs m, eV vs J)', cause: 'Forgot to convert units to SI standard (e.g. cm to m, grams to kg, eV to Joules).', takeaway: 'Convert all given quantities to SI units in the very first step.' },
    { label: 'Misread Question (NOT / EXCEPT)', cause: 'Overlooked negative phrasing ("Which of the following is NOT correct?").', takeaway: 'Underline key condition words (NOT, EXCEPT, ALWAYS) while reading.' },
    { label: 'Rushed in Final 5 Mins', cause: 'Rushed execution due to timer anxiety.', takeaway: 'Maintain steady pacing; do not rush arithmetic in final minutes.' },
    { label: 'Option Bubbling / Typo Slip', cause: 'Solved correctly but selected or marked wrong option letter.', takeaway: 'Cross-check question number and option key before committing.' }
  ],
  concept: [
    { label: 'Formula Forgotten', cause: 'Could not recall exact formula / coefficients.', takeaway: 'Create flashcard for this formula and review in active recall cycles.' },
    { label: 'Fundamental Theory Unknown', cause: 'Underlying physical or chemical mechanism was never learned thoroughly.', takeaway: 'Re-read textbook/notes for this concept before attempting more problems.' },
    { label: 'Boundary Condition Missed', cause: 'Did not check constraints or edge cases (e.g. x > 0, domain limits).', takeaway: 'Always state domain, range, and physical boundary conditions upfront.' },
    { label: 'Sign Convention Misunderstood', cause: 'Conceptual confusion about physics sign conventions (e.g. optics, Lenz law).', takeaway: 'Study standard sign diagram rules and memorize physical reference frame.' }
  ],
  application: [
    { label: 'Failed Pattern Recognition', cause: 'Knew the theorem but failed to recognize this problem was an instance of it.', takeaway: 'Catalog this problem archetype in mistake notebook under problem patterns.' },
    { label: 'Applied Wrong Theorem', cause: 'Attempted to use inappropriate formula where conditions were not satisfied.', takeaway: 'Verify applicability conditions before invoking theorems (e.g. conservation laws).' },
    { label: 'Approximation Condition Invalid', cause: 'Made small-angle or binomial approximation where angle/delta was not small.', takeaway: 'Check if x << 1 holds before applying Taylor/binomial approximation.' },
    { label: 'Wrong System Boundary', cause: 'Selected system boundary that included unknown external forces.', takeaway: 'Draw clean Free Body Diagram (FBD) with explicit system boundaries.' }
  ],
  selection: [
    { label: 'Sunk Cost Trap (> 5 mins)', cause: 'Refused to abandon a difficult question after 3 minutes; wasted valuable time.', takeaway: 'Strict 2.5-minute abandonment rule: mark for review and move on.' },
    { label: 'Missed Easier Alternative', cause: 'Got bogged down on 1 tough question while 3 easy direct questions were left unread.', takeaway: 'Scan entire section first to pick high-yield easy questions.' },
    { label: 'Out-of-Syllabus / Low-Yield', cause: 'Attempted obscure, overly complex question of low exam probability.', takeaway: 'Stick to mainstream PYQ syllabus patterns.' },
    { label: 'Blind Guessing Under Panic', cause: 'Attempted low-probability guess resulting in negative marking penalty.', takeaway: 'Never guess unless at least 2 options are definitively eliminated.' }
  ]
};

export const DiagnosticMistakeLogger: React.FC<DiagnosticMistakeLoggerProps> = ({
  errors,
  onErrorsChange,
  onAttachPhoto,
  attachedPhoto
}) => {
  const [entryMode, setEntryMode] = useState<'guided' | 'batch' | 'paste'>('guided');

  // Fast Paste State (TSV / CSV / Text list from clipboard)
  const [pasteText, setPasteText] = useState('');
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  // Guided Form State
  const [subject, setSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics');
  const [chapter, setChapter] = useState<string>(CANONICAL_CURRICULUM.Physics[0]?.chapter || 'Kinematics');
  const [concept, setConcept] = useState<string>('');
  const [errorType, setErrorType] = useState<ErrorType>('execution');
  const [confidenceLevel, setConfidenceLevel] = useState<ConfidenceLevel>('wrong_uncertain');
  const [timeLostMinutes, setTimeLostMinutes] = useState<number>(3);
  const [description, setDescription] = useState<string>('');
  const [whyItHappened, setWhyItHappened] = useState<string>('');
  const [correctUnderstanding, setCorrectUnderstanding] = useState<string>('');
  
  // Batch Form State (Spreadsheet-like table)
  const [batchRows, setBatchRows] = useState<{
    qNum: string;
    subject: 'Physics' | 'Chemistry' | 'Mathematics';
    chapter: string;
    errorType: ErrorType;
    timeLostMinutes: number;
    quickNote: string;
  }[]>([
    { qNum: 'Q.1', subject: 'Physics', chapter: 'Kinematics', errorType: 'execution', timeLostMinutes: 2, quickNote: 'Calculation sign error' },
    { qNum: 'Q.2', subject: 'Chemistry', chapter: 'Thermodynamics', errorType: 'concept', timeLostMinutes: 3, quickNote: 'Forgot enthalpy definition' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // When subject changes, reset chapter
  const handleSubjectChange = (newSub: 'Physics' | 'Chemistry' | 'Mathematics') => {
    setSubject(newSub);
    const firstChap = CANONICAL_CURRICULUM[newSub]?.[0]?.chapter || 'General';
    setChapter(firstChap);
    const concepts = CANONICAL_CURRICULUM[newSub]?.find(c => c.chapter === firstChap)?.concepts || [];
    setConcept(concepts[0] || 'General Principle');
  };

  // When chapter changes, update concept suggestion
  const handleChapterChange = (newChap: string) => {
    setChapter(newChap);
    const concepts = CANONICAL_CURRICULUM[subject]?.find(c => c.chapter === newChap)?.concepts || [];
    setConcept(concepts[0] || 'General Principle');
  };

  // Handle Preset Chip Click
  const handleApplyPreset = (preset: { label: string; cause: string; takeaway: string }) => {
    setDescription(prev => prev ? prev : preset.label);
    setWhyItHappened(preset.cause);
    setCorrectUnderstanding(preset.takeaway);
  };

  // Add Guided Error to Vault
  const handleAddGuidedError = () => {
    const newErr: ErrorRecord = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      subject,
      chapter,
      concept: concept.trim() || 'General Principle',
      errorType,
      description: description.trim() || `${subject} - ${chapter} Mistake`,
      whyItHappened: whyItHappened.trim() || 'Execution or concept gap',
      correctUnderstanding: correctUnderstanding.trim() || 'Review fundamental rules and practice targeted PyQs',
      timeLostSeconds: timeLostMinutes * 60,
      confidenceLevel,
      createdAt: new Date().toISOString()
    };

    onErrorsChange([...errors, newErr]);

    // Clear form for next entry
    setDescription('');
    setWhyItHappened('');
    setCorrectUnderstanding('');
  };

  // Commit Batch Rows to Vault
  const handleCommitBatchRows = () => {
    const newRecords: ErrorRecord[] = batchRows.map((r, i) => ({
      id: `err_batch_${Date.now()}_${i}`,
      subject: r.subject,
      chapter: r.chapter,
      concept: 'Exam Question Analysis',
      errorType: r.errorType,
      description: `${r.qNum}: ${r.quickNote || 'Exam Mistake'}`,
      whyItHappened: r.quickNote || 'Execution / Concept gap',
      correctUnderstanding: 'Review chapter concepts and redo question without looking at solution.',
      timeLostSeconds: (r.timeLostMinutes || 2) * 60,
      confidenceLevel: 'wrong_uncertain',
      createdAt: new Date().toISOString()
    }));

    onErrorsChange([...errors, ...newRecords]);
    // Reset batch rows
    setBatchRows([
      { qNum: `Q.${errors.length + newRecords.length + 1}`, subject: 'Physics', chapter: 'Kinematics', errorType: 'execution', timeLostMinutes: 2, quickNote: '' }
    ]);
  };

  // Parse and commit pasted text (TSV from Excel/Sheets or comma-separated)
  const handleCommitPastedErrors = () => {
    if (!pasteText.trim()) {
      setPasteNotice('Please paste at least one line of text or table data.');
      return;
    }

    const lines = pasteText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'));

    const parsedRecords: ErrorRecord[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Delimiter detection: Tab or Comma or Semicolon or Pipe
      const delimiter = line.includes('\t') ? '\t' : line.includes('|') ? '|' : line.includes(';') ? ';' : ',';
      const parts = line.split(delimiter).map(p => p.trim());

      if (parts.length >= 2) {
        let qNum = '';
        let sub: 'Physics' | 'Chemistry' | 'Mathematics' = 'Physics';
        let chap = '';
        let errType: ErrorType = 'execution';
        let timeMins = 2;
        let note = '';

        const p0 = parts[0];
        // If first token is Q1, Q.1, 1, #1
        if (/^(Q\.?\s*\d+|\d+|#\d+)/i.test(p0) && parts.length >= 3) {
          qNum = p0;
          const rawSub = (parts[1] || '').toLowerCase();
          if (rawSub.includes('chem')) sub = 'Chemistry';
          else if (rawSub.includes('math')) sub = 'Mathematics';
          else sub = 'Physics';

          chap = parts[2] || CANONICAL_CURRICULUM[sub]?.[0]?.chapter || 'Kinematics';
          const rawType = (parts[3] || '').toLowerCase();
          if (rawType.includes('concept')) errType = 'concept';
          else if (rawType.includes('app')) errType = 'application';
          else if (rawType.includes('select')) errType = 'selection';
          else errType = 'execution';

          timeMins = parseInt(parts[4] || '2', 10) || 2;
          note = parts.slice(5).join('; ') || parts[3] || 'Mistake reflection';
        } else {
          // Format without Q number: Subject, Chapter, ErrorType, Minutes, Note
          const rawSub = p0.toLowerCase();
          if (rawSub.includes('chem')) sub = 'Chemistry';
          else if (rawSub.includes('math')) sub = 'Mathematics';
          else sub = 'Physics';

          chap = parts[1] || CANONICAL_CURRICULUM[sub]?.[0]?.chapter || 'Kinematics';
          const rawType = (parts[2] || '').toLowerCase();
          if (rawType.includes('concept')) errType = 'concept';
          else if (rawType.includes('app')) errType = 'application';
          else if (rawType.includes('select')) errType = 'selection';
          else errType = 'execution';

          timeMins = parseInt(parts[3] || '2', 10) || 2;
          note = parts.slice(4).join('; ') || 'Mistake reflection';
        }

        parsedRecords.push({
          id: `err_paste_${Date.now()}_${i}`,
          subject: sub,
          chapter: chap,
          concept: 'Diagnostic Fast Capture',
          errorType: errType,
          description: qNum ? `${qNum}: ${note}` : note,
          whyItHappened: note,
          correctUnderstanding: 'Redo without solution and verify physical boundary conditions.',
          timeLostSeconds: timeMins * 60,
          confidenceLevel: 'wrong_uncertain',
          createdAt: new Date().toISOString()
        });
      }
    }

    if (parsedRecords.length === 0) {
      setPasteNotice('Could not parse any valid mistake lines. Check format below.');
      return;
    }

    onErrorsChange([...errors, ...parsedRecords]);
    setPasteText('');
    setPasteNotice(`Successfully imported ${parsedRecords.length} error record(s) into vault!`);
    setTimeout(() => setPasteNotice(null), 4000);
  };

  const handleInsertPasteSample = () => {
    setPasteText(
      `Q.1, Physics, Kinematics, execution, 2, Sign flip when substituting g = -9.8 m/s²\n` +
      `Q.2, Chemistry, Thermodynamics, concept, 4, Confused state function vs path function in work definition\n` +
      `Q.3, Mathematics, Differential Calculus, application, 3, Did not test endpoints when finding local extremum\n` +
      `Q.4, Physics, Electrostatics, selection, 5, Spent 6 mins on tricky dipole integration instead of skipping`
    );
  };

  // Client-Side Canvas Image Compressor (Zero Server OCR, Zero Memory Spike)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Downscale image to max 1000px width/height for instant lightweight local storage
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1000;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          if (onAttachPhoto) {
            onAttachPhoto(compressedBase64);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveError = (id: string) => {
    onErrorsChange(errors.filter(e => e.id !== id));
  };

  // Summary counts
  const conceptCount = errors.filter(e => e.errorType === 'concept').length;
  const appCount = errors.filter(e => e.errorType === 'application').length;
  const execCount = errors.filter(e => e.errorType === 'execution').length;
  const selCount = errors.filter(e => e.errorType === 'selection').length;
  const totalMinutesLost = Math.round(errors.reduce((sum, e) => sum + (e.timeLostSeconds || 0), 0) / 60);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
      
      {/* Top Banner: Mode Tabs & Zero-AI Guarantee */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Diagnostic Mistake & Error Vault
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              100% Instant · Zero-AI Dependent
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Record metacognitive failures, classification taxonomy, and takeaways in under 30 seconds.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setEntryMode('guided')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              entryMode === 'guided'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Guided Rapid Triage</span>
          </button>
          <button
            type="button"
            onClick={() => setEntryMode('batch')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              entryMode === 'batch'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Quick Batch Table</span>
          </button>
          <button
            type="button"
            onClick={() => setEntryMode('paste')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              entryMode === 'paste'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Fast Paste (TSV / Notes)</span>
          </button>
        </div>
      </div>

      {/* MODE 1: Guided Rapid Triage */}
      {entryMode === 'guided' && (
        <div className="space-y-4">
          
          {/* Step 1: Subject & Chapter Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Subject Selector */}
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-[11px] font-mono font-semibold text-slate-400 block">
                1. Subject
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Physics', 'Chemistry', 'Mathematics'] as const).map(sub => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubjectChange(sub)}
                    className={`py-2 px-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                      subject === sub
                        ? sub === 'Physics' ? 'bg-cyan-950 text-cyan-300 border-cyan-700' :
                          sub === 'Chemistry' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                          'bg-purple-950 text-purple-300 border-purple-700'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sub === 'Mathematics' ? 'Math' : sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter Selector */}
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-[11px] font-mono font-semibold text-slate-400 block">
                2. Syllabus Chapter
              </label>
              <select
                value={chapter}
                onChange={(e) => handleChapterChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {CANONICAL_CURRICULUM[subject]?.map(c => (
                  <option key={c.chapter} value={c.chapter}>{c.chapter}</option>
                ))}
              </select>
            </div>

            {/* Concept / Sub-topic Input */}
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-[11px] font-mono font-semibold text-slate-400 block">
                3. Sub-Concept
              </label>
              <input
                type="text"
                list="concept-list"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Specific concept or topic..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <datalist id="concept-list">
                {CANONICAL_CURRICULUM[subject]
                  ?.find(c => c.chapter === chapter)
                  ?.concepts.map((cpt, i) => (
                    <option key={i} value={cpt} />
                  ))}
              </datalist>
            </div>

          </div>

          {/* Step 2: 4-Button Error Taxonomy Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold text-slate-400 block">
              4. Failure Mode Taxonomy (Section 12 Spec)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'concept', label: 'Concept Gap', desc: 'Theory unknown / missed rule', color: 'purple' },
                { type: 'application', label: 'Application Gap', desc: 'Knew theory, missed pattern', color: 'cyan' },
                { type: 'execution', label: 'Execution Slip', desc: 'Algebra, calculation, haste', color: 'amber' },
                { type: 'selection', label: 'Selection Trap', desc: 'Sunk cost, poor time allocation', color: 'rose' }
              ].map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setErrorType(item.type as ErrorType)}
                  className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                    errorType === item.type
                      ? item.color === 'purple' ? 'bg-purple-950/70 border-purple-500 text-purple-200 ring-1 ring-purple-500/30' :
                        item.color === 'cyan' ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/30' :
                        item.color === 'amber' ? 'bg-amber-950/70 border-amber-500 text-amber-200 ring-1 ring-amber-500/30' :
                        'bg-rose-950/70 border-rose-500 text-rose-200 ring-1 ring-rose-500/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="block font-bold text-xs">{item.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: One-Click Common Cause Presets */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
            <span className="text-[11px] font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              One-Click Quick Presets for {errorType.toUpperCase()}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CAUSE_PRESETS[errorType]?.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/60 hover:text-cyan-300 text-slate-300 text-[11px] font-mono transition-all"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Confidence & Time Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Confidence Quad Selector */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[11px] text-slate-400 font-semibold block">
                5. Metacognitive Confidence State
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { level: 'wrong_confident', label: 'Wrong + Confident', tag: 'Misconception ⚠', color: 'border-rose-800 text-rose-300 bg-rose-950/40' },
                  { level: 'wrong_uncertain', label: 'Wrong + Uncertain', tag: 'Known Gap', color: 'border-amber-800 text-amber-300 bg-amber-950/40' },
                  { level: 'correct_uncertain', label: 'Correct + Uncertain', tag: 'Lucky Guess', color: 'border-yellow-800 text-yellow-300 bg-yellow-950/40' },
                  { level: 'correct_confident', label: 'Correct + Confident', tag: 'Mastered', color: 'border-emerald-800 text-emerald-300 bg-emerald-950/40' }
                ].map(item => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setConfidenceLevel(item.level as ConfidenceLevel)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      confidenceLevel === item.level
                        ? `${item.color} font-bold ring-1 ring-cyan-400/40`
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-[11px]">{item.label}</span>
                    <span className="text-[10px] text-slate-500 block">{item.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Lost Selector */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                <span>6. Time Cost Wasted</span>
                <span className="text-rose-400 font-bold">{timeLostMinutes} Minutes lost</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[1, 2, 3, 5, 8].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTimeLostMinutes(mins)}
                    className={`py-2 rounded-lg border text-center transition-all ${
                      timeLostMinutes === mins
                        ? 'bg-rose-950 text-rose-300 border-rose-700 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              {/* Optional Local Notebook Photo Snapshot */}
              <div className="pt-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-mono flex items-center justify-center gap-2 transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{attachedPhoto ? 'Photo Attached (Change)' : 'Optional: Attach Notebook Solution Photo'}</span>
                </button>
                {attachedPhoto && (
                  <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">
                    <span>✓ Notebook photo compressed & saved locally</span>
                    <button
                      type="button"
                      onClick={() => onAttachPhoto && onAttachPhoto(null)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Step 5: Description & Golden Rule Takeaway Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold block">7. What Happened / Problem Note:</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Q.14: Substituted v = u + at without checking acceleration was constant"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-emerald-400 font-semibold block">8. Golden Rule / Repair Takeaway:</label>
              <input
                type="text"
                value={correctUnderstanding}
                onChange={(e) => setCorrectUnderstanding(e.target.value)}
                placeholder="e.g. Check if a = f(t). If a is non-uniform, must integrate a = dv/dt"
                className="w-full bg-slate-900 border border-emerald-900/60 rounded-lg p-2.5 text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Add Error Button */}
          <button
            type="button"
            onClick={handleAddGuidedError}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Mistake to Session Vault</span>
          </button>

        </div>
      )}

      {/* MODE 2: Quick Batch Table Entry */}
      {entryMode === 'batch' && (
        <div className="space-y-3 font-mono text-xs">
          <p className="text-slate-400 text-[11px]">
            Quickly log multiple wrong questions from a mock test in a single table:
          </p>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                <tr>
                  <th className="p-2.5 w-16">Q #</th>
                  <th className="p-2.5 w-28">Subject</th>
                  <th className="p-2.5 w-36">Chapter</th>
                  <th className="p-2.5 w-32">Error Type</th>
                  <th className="p-2.5 w-20">Time (m)</th>
                  <th className="p-2.5">Quick Note / Golden Rule</th>
                  <th className="p-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {batchRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.qNum}
                        onChange={(e) => {
                          const copy = [...batchRows];
                          copy[idx].qNum = e.target.value;
                          setBatchRows(copy);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-center text-slate-200"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={row.subject}
                        onChange={(e: any) => {
                          const copy = [...batchRows];
                          copy[idx].subject = e.target.value;
                          copy[idx].chapter = CANONICAL_CURRICULUM[e.target.value as 'Physics']?.[0]?.chapter || 'Kinematics';
                          setBatchRows(copy);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200 text-xs"
                      >
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Mathematics">Math</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <select
                        value={row.chapter}
                        onChange={(e) => {
                          const copy = [...batchRows];
                          copy[idx].chapter = e.target.value;
                          setBatchRows(copy);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200 text-xs truncate"
                      >
                        {CANONICAL_CURRICULUM[row.subject]?.map(c => (
                          <option key={c.chapter} value={c.chapter}>{c.chapter}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <select
                        value={row.errorType}
                        onChange={(e: any) => {
                          const copy = [...batchRows];
                          copy[idx].errorType = e.target.value;
                          setBatchRows(copy);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-cyan-300 font-semibold text-xs"
                      >
                        <option value="execution">Execution</option>
                        <option value="concept">Concept</option>
                        <option value="application">Application</option>
                        <option value="selection">Selection</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        max="15"
                        value={row.timeLostMinutes}
                        onChange={(e) => {
                          const copy = [...batchRows];
                          copy[idx].timeLostMinutes = parseInt(e.target.value, 10) || 1;
                          setBatchRows(copy);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-center text-rose-300"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.quickNote}
                        placeholder="Why wrong & golden rule takeaway..."
                        onChange={(e) => {
                          const copy = [...batchRows];
                          copy[idx].quickNote = e.target.value;
                          setBatchRows(copy);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => setBatchRows(batchRows.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setBatchRows([
                ...batchRows,
                { qNum: `Q.${batchRows.length + 1}`, subject: 'Physics', chapter: 'Kinematics', errorType: 'execution', timeLostMinutes: 2, quickNote: '' }
              ])}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Question Row</span>
            </button>

            <button
              type="button"
              onClick={handleCommitBatchRows}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/25"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Commit {batchRows.length} Row(s) to Vault</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: Fast Paste (TSV / CSV / Text list from clipboard) */}
      {entryMode === 'paste' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-slate-400 text-[11px]">
              Copy rows from Google Sheets, Excel, or your text notes and paste directly:
            </p>
            <button
              type="button"
              onClick={handleInsertPasteSample}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 underline text-left sm:text-right"
            >
              Insert Sample Practice Rows
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Format: Q#, Subject, Chapter, ErrorType, TimeLostMins, Reflection Note\nExample:\nQ.1, Physics, Kinematics, execution, 2, Sign flip when substituting g = -9.8\nQ.2, Chemistry, Thermodynamics, concept, 4, Confused state function vs path function`}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {pasteNotice && (
            <div className={`p-2.5 rounded-lg text-xs font-mono border ${
              pasteNotice.includes('Successfully')
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}>
              {pasteNotice}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-slate-500">
              💡 Supports Tab-delimited (Excel/Sheets), commas, or semicolons. 100% offline & instantaneous.
            </span>

            <button
              type="button"
              onClick={handleCommitPastedErrors}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/25"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Parse & Add All Lines to Vault</span>
            </button>
          </div>
        </div>
      )}

      {/* Review Vault Table: All errors staged for today's session */}
      <div className="pt-3 border-t border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <span className="font-bold text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Session Mistake Vault ({errors.length} errors staged)
          </span>

          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              {conceptCount} Concept
            </span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {appCount} Application
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              {execCount} Execution
            </span>
            <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              {selCount} Selection
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              {totalMinutesLost} min cost
            </span>
          </div>
        </div>

        {errors.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs font-mono text-slate-500">
            No mistakes added for this session yet. Use the Guided Triage or Quick Batch Table above to stage your error reflections.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {errors.map((err, idx) => (
              <div 
                key={err.id || idx}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3 text-xs font-mono hover:border-slate-700 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
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
                    <span className="text-rose-400 font-semibold text-[11px]">
                      +{Math.round((err.timeLostSeconds || 180) / 60)}m lost
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px]">
                    <strong className="text-slate-400">Note:</strong> {err.description}
                  </p>
                  
                  {err.correctUnderstanding && (
                    <p className="text-emerald-300 text-[11px]">
                      <strong className="text-emerald-400">Golden Rule:</strong> {err.correctUnderstanding}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveError(err.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                  title="Remove this error"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
