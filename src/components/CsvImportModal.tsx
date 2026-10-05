import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle2, AlertTriangle, X, Database, ArrowRight } from 'lucide-react';
import { StudyDay, ErrorRecord, ExamFocus, ErrorType } from '../types';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeekId: string;
  onImportDays: (days: Partial<StudyDay>[]) => Promise<void>;
  existingDays: StudyDay[];
}

interface ParsedRow {
  date: string;
  examFocus: ExamFocus;
  actualHours: number;
  questionsAttempted: number;
  questionsCorrect: number;
  questionsWrong: number;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  chapter: string;
  concept: string;
  errorType: ErrorType;
  description: string;
  whyItHappened: string;
  correctUnderstanding: string;
  timeLostSeconds: number;
  valid: boolean;
  errorNote?: string;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  currentWeekId,
  onImportDays,
  existingDays
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Sample CSV Template Generator
  const downloadTemplate = () => {
    const headers = [
      'Date',
      'ExamFocus',
      'ActualHours',
      'QuestionsAttempted',
      'QuestionsCorrect',
      'QuestionsWrong',
      'Subject',
      'Chapter',
      'Concept',
      'ErrorType',
      'Description',
      'WhyItHappened',
      'CorrectUnderstanding',
      'TimeLostSeconds'
    ];

    const sampleRow1 = [
      new Date().toISOString().split('T')[0],
      'JEE',
      '4.5',
      '40',
      '32',
      '8',
      'Physics',
      'Rotational Motion',
      'Parallel Axis Theorem',
      'application',
      'Forgot moment of inertia shift formula',
      'Applied I_cm directly without shifting',
      'Always add M*d^2 when axis is not at center of mass',
      '240'
    ];

    const sampleRow2 = [
      new Date().toISOString().split('T')[0],
      'CET',
      '3.5',
      '50',
      '44',
      '6',
      'Chemistry',
      'Thermodynamics',
      'Enthalpy of Reaction',
      'execution',
      'Calculation error on sign of exothermic delta H',
      'Rushed calculation in final 5 minutes',
      'Exothermic reaction requires negative sign convention',
      '120'
    ];

    const csvContent = [headers.join(','), sampleRow1.join(','), sampleRow2.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'dijkstra_study_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Existing Data to CSV
  const exportToCsv = () => {
    const headers = [
      'Date',
      'CycleId',
      'ExamFocus',
      'DayType',
      'ActualHours',
      'TargetHours',
      'QuestionsAttempted',
      'QuestionsCorrect',
      'QuestionsWrong',
      'ErrorCount',
      'Subject',
      'Chapter',
      'Concept',
      'ErrorType',
      'Description',
      'WhyItHappened',
      'CorrectUnderstanding',
      'TimeLostSeconds'
    ];

    const rows: string[] = [];

    existingDays.forEach(day => {
      if (day.errorRecords && day.errorRecords.length > 0) {
        day.errorRecords.forEach(err => {
          rows.push([
            day.date,
            day.weekId,
            day.examFocus,
            day.dayType,
            day.actualHours,
            day.targetHours,
            day.questionsAttempted,
            day.questionsCorrect,
            day.questionsWrong,
            day.errorRecords.length,
            `"${err.subject || ''}"`,
            `"${(err.chapter || '').replace(/"/g, '""')}"`,
            `"${(err.concept || '').replace(/"/g, '""')}"`,
            err.errorType,
            `"${(err.description || '').replace(/"/g, '""')}"`,
            `"${(err.whyItHappened || '').replace(/"/g, '""')}"`,
            `"${(err.correctUnderstanding || '').replace(/"/g, '""')}"`,
            err.timeLostSeconds || 0
          ].join(','));
        });
      } else {
        rows.push([
          day.date,
          day.weekId,
          day.examFocus,
          day.dayType,
          day.actualHours,
          day.targetHours,
          day.questionsAttempted,
          day.questionsCorrect,
          day.questionsWrong,
          0,
          '', '', '', '', '', '', '', 0
        ].join(','));
      }
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dijkstra_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV
  const parseCsvContent = (content: string) => {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setParsedRows([]);
      return;
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[\s_]/g, ''));
    
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV splitter supporting quoted text
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const values: string[] = [];
      let match;
      while ((match = regex.exec(lines[i])) !== null) {
        let val = match[1] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).replace(/""/g, '"');
        }
        values.push(val.trim());
        if (regex.lastIndex >= lines[i].length) break;
      }

      if (values.length < 3) continue;

      const getVal = (name: string, fallback = '') => {
        const idx = headers.indexOf(name.toLowerCase());
        return idx !== -1 && values[idx] !== undefined ? values[idx] : fallback;
      };

      const date = getVal('date', new Date().toISOString().split('T')[0]);
      const examRaw = getVal('examfocus', 'JEE').toUpperCase();
      const examFocus: ExamFocus = examRaw === 'CET' ? 'CET' : 'JEE';
      const actualHours = parseFloat(getVal('actualhours', '0')) || 0;
      const questionsAttempted = parseInt(getVal('questionsattempted', '0'), 10) || 0;
      const questionsCorrect = parseInt(getVal('questionscorrect', '0'), 10) || 0;
      const questionsWrong = parseInt(getVal('questionswrong', '0'), 10) || 0;

      const subjectRaw = getVal('subject', 'Physics');
      const subject: 'Physics' | 'Chemistry' | 'Mathematics' = 
        ['Chemistry', 'Mathematics'].includes(subjectRaw) ? subjectRaw as any : 'Physics';

      const chapter = getVal('chapter', 'General');
      const concept = getVal('concept', 'Fundamental Principle');
      const errTypeRaw = getVal('errortype', 'application').toLowerCase();
      const errorType: ErrorType = 
        ['concept', 'application', 'execution', 'selection'].includes(errTypeRaw) 
          ? errTypeRaw as ErrorType 
          : 'application';

      const description = getVal('description', '');
      const whyItHappened = getVal('whyithappened', '');
      const correctUnderstanding = getVal('correctunderstanding', '');
      const timeLostSeconds = parseInt(getVal('timelostseconds', '180'), 10) || 180;

      rows.push({
        date,
        examFocus,
        actualHours,
        questionsAttempted,
        questionsCorrect,
        questionsWrong,
        subject,
        chapter,
        concept,
        errorType,
        description,
        whyItHappened,
        correctUnderstanding,
        timeLostSeconds,
        valid: Boolean(date && chapter)
      });
    }

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCsvContent(text);
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setImportStatus(null);

    try {
      // Group parsed rows by date
      const daysByDate: Record<string, Partial<StudyDay>> = {};

      parsedRows.filter(r => r.valid).forEach(row => {
        if (!daysByDate[row.date]) {
          daysByDate[row.date] = {
            weekId: currentWeekId,
            date: row.date,
            examFocus: row.examFocus,
            dayType: 'NORMAL',
            context: 'Bulk imported via CSV',
            targetHours: Math.max(row.actualHours, 4),
            availableHours: Math.max(row.actualHours, 4),
            actualHours: row.actualHours,
            testingHours: parseFloat((row.actualHours * 0.6).toFixed(1)),
            analysisHours: parseFloat((row.actualHours * 0.4).toFixed(1)),
            otherStudyHours: 0,
            questionsAttempted: row.questionsAttempted,
            questionsCorrect: row.questionsCorrect,
            questionsWrong: row.questionsWrong,
            questionsSkipped: 0,
            guessedQuestions: 0,
            notebookImages: [],
            errorRecords: [],
            feedbackLoopEnabledOnSubmit: true
          };
        }

        if (row.description || row.whyItHappened) {
          const errRec: ErrorRecord = {
            id: `err_csv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            subject: row.subject,
            chapter: row.chapter,
            concept: row.concept,
            errorType: row.errorType,
            description: row.description || `${row.chapter} - ${row.concept}`,
            whyItHappened: row.whyItHappened || 'Unspecified execution gap',
            correctUnderstanding: row.correctUnderstanding || 'Review chapter fundamentals',
            timeLostSeconds: row.timeLostSeconds,
            confidenceLevel: 'wrong_uncertain',
            createdAt: new Date().toISOString()
          };
          daysByDate[row.date].errorRecords!.push(errRec);
        }
      });

      const daysToImport = Object.values(daysByDate);
      await onImportDays(daysToImport);

      setImportStatus(`Successfully imported ${daysToImport.length} study session(s) with ${parsedRows.length} record(s)!`);
      setTimeout(() => {
        onClose();
        setParsedRows([]);
        setCsvText('');
        setImportStatus(null);
      }, 1500);
    } catch (err: any) {
      setImportStatus(`Import failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                CSV Data Pipeline
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Bulk import past study logs or export your entire telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 pt-4 pb-2 shrink-0">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'import'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'export'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Export Telemetry
          </button>
        </div>

        {/* Content area */}
        <div className="overflow-y-auto flex-1 py-3 space-y-4 pr-1">
          {activeTab === 'import' ? (
            <>
              {/* Template Download Banner */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-200 block mb-0.5">
                    Need the formatted structure?
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 block">
                    Download the pre-configured CSV header template with example rows.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Template
                </button>
              </div>

              {/* Upload Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-cyan-950/10 group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".csv,text/csv" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mx-auto mb-2 transition-colors" />
                <span className="text-xs font-mono text-slate-300 font-semibold block mb-1">
                  Click to select CSV file from your device
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Standard comma-separated format (.csv)
                </span>
              </div>

              {/* Paste Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 font-semibold flex items-center justify-between">
                  <span>Or Paste CSV Text Directly:</span>
                  {csvText && (
                    <button 
                      onClick={() => { setCsvText(''); setParsedRows([]); }}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <textarea
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    parseCsvContent(e.target.value);
                  }}
                  rows={4}
                  placeholder="Date,ExamFocus,ActualHours,QuestionsAttempted,QuestionsCorrect,QuestionsWrong,Subject,Chapter,Concept,ErrorType..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Parsed Preview Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Preview: {parsedRows.filter(r => r.valid).length} Valid Row(s) Detected
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                    <table className="w-full text-[11px] font-mono text-left">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                        <tr>
                          <th className="p-2">Date</th>
                          <th className="p-2">Exam</th>
                          <th className="p-2">Subject · Chapter</th>
                          <th className="p-2">Questions</th>
                          <th className="p-2">Error Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {parsedRows.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="p-2 text-slate-300">{row.date}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                row.examFocus === 'JEE' ? 'bg-blue-950 text-blue-300' : 'bg-purple-950 text-purple-300'
                              }`}>
                                {row.examFocus}
                              </span>
                            </td>
                            <td className="p-2 text-slate-200">
                              {row.subject} · {row.chapter}
                            </td>
                            <td className="p-2 text-slate-400">
                              {row.questionsCorrect}/{row.questionsAttempted} ({row.actualHours}h)
                            </td>
                            <td className="p-2">
                              <span className="text-cyan-400 capitalize">{row.errorType}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importStatus && (
                <div className={`p-3 rounded-xl text-xs font-mono ${
                  importStatus.includes('failed') ? 'bg-rose-950/40 border border-rose-800 text-rose-300' : 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                }`}>
                  {importStatus}
                </div>
              )}
            </>
          ) : (
            /* Export Tab */
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4 text-center">
              <Database className="w-12 h-12 text-cyan-400 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-white font-mono mb-1">
                  Export Complete Preparation Telemetry
                </h3>
                <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
                  Export all your recorded study hours, question throughput, error records, and diagnosis history to a clean, standardized CSV file for offline backup or spreadsheets.
                </p>
              </div>

              <div className="py-2">
                <span className="text-xs font-mono text-cyan-300 font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  {existingDays.length} Study Days · {existingDays.reduce((acc, d) => acc + (d.errorRecords?.length || 0), 0)} Logged Errors
                </span>
              </div>

              <button
                type="button"
                onClick={exportToCsv}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-lg shadow-cyan-500/25 inline-flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Download Telemetry CSV
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'import' && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] font-mono text-slate-500">
              {parsedRows.length > 0 ? `${parsedRows.length} row(s) ready` : 'Upload or paste CSV to proceed'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedRows.length === 0 || isProcessing}
                onClick={handleCommitImport}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all disabled:opacity-40"
              >
                {isProcessing ? 'Importing...' : 'Commit CSV Import'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
