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
import { StudyDay, ErrorRecord, ExamFocus, DayType, ErrorType, ConfidenceLevel, DailyTask, AuthUser } from '../types';
import { CANONICAL_CURRICULUM } from '../data/seedData';
import { DailyGoalsTracker } from './DailyGoalsTracker';
import { DiagnosticMistakeLogger } from './DiagnosticMistakeLogger';

interface DailyLogViewProps {
  studyDays: StudyDay[];
  currentWeekId: string;
  feedbackLoopEnabled: boolean;
  onSaveDay: (newDay: Partial<StudyDay>) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  currentUser?: AuthUser | null;
}

export const DailyLogView: React.FC<DailyLogViewProps> = ({
  studyDays,
  currentWeekId,
  feedbackLoopEnabled,
  onSaveDay,
  isModalOpen,
  setIsModalOpen,
  currentUser
}) => {
  const [expandedDayId, setExpandedDayId] = useState<string | null>(studyDays[0]?.id || null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [examFocus, setExamFocus] = useState<ExamFocus>('JEE');
  const [dayType, setDayType] = useState<DayType>('NORMAL');
  const [context, setContext] = useState('');
  const [currentTasks, setCurrentTasks] = useState<DailyTask[]>([]);
  
  // Time metrics
  const [targetHours, setTargetHours] = useState('');
  const [availableHours, setAvailableHours] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [testingHours, setTestingHours] = useState('');
  const [analysisHours, setAnalysisHours] = useState('');
  const [otherHours, setOtherHours] = useState('');

  // Question metrics
  const [questionsAttempted, setQuestionsAttempted] = useState('');
  const [questionsCorrect, setQuestionsCorrect] = useState('');
  const [questionsWrong, setQuestionsWrong] = useState('');
  const [questionsSkipped, setQuestionsSkipped] = useState('');
  const [guessedQuestions, setGuessedQuestions] = useState('');

  // Zero-AI Diagnostic error records staged for this day session
  const [sessionErrors, setSessionErrors] = useState<ErrorRecord[]>([]);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fast Calculation Helpers (Zero-AI, Instant Client Computations)
  const sumDetailedHours = ((parseFloat(testingHours) || 0) + (parseFloat(analysisHours) || 0) + (parseFloat(otherHours) || 0)).toFixed(1);
  const attNum = parseInt(questionsAttempted, 10) || 0;
  const corNum = parseInt(questionsCorrect, 10) || 0;
  const skipNum = parseInt(questionsSkipped, 10) || 0;
  const calcWrong = Math.max(0, attNum - corNum - skipNum);
  const liveAccuracy = attNum > 0 ? Math.round((corNum / attNum) * 100) : null;

  const handleAutoSumHours = () => {
    setActualHours(sumDetailedHours);
  };

  const handleAutoWrong = () => {
    setQuestionsWrong(calcWrong.toString());
  };

  const applyTimePreset = (preset: 'standard' | 'school' | 'mock' | 'clear') => {
    if (preset === 'standard') {
      setTargetHours('6.0');
      setAvailableHours('6.0');
      setActualHours('6.0');
      setTestingHours('3.0');
      setAnalysisHours('2.0');
      setOtherHours('1.0');
      setDayType('NORMAL');
    } else if (preset === 'school') {
      setTargetHours('3.5');
      setAvailableHours('4.0');
      setActualHours('3.5');
      setTestingHours('2.0');
      setAnalysisHours('1.5');
      setOtherHours('0.0');
      setDayType('SCHOOL_HEAVY');
    } else if (preset === 'mock') {
      setTargetHours('8.0');
      setAvailableHours('8.0');
      setActualHours('8.0');
      setTestingHours('4.0');
      setAnalysisHours('3.0');
      setOtherHours('1.0');
      setDayType('SCHOOL_TEST');
    } else {
      setTargetHours('');
      setAvailableHours('');
      setActualHours('');
      setTestingHours('');
      setAnalysisHours('');
      setOtherHours('');
      setQuestionsAttempted('');
      setQuestionsCorrect('');
      setQuestionsWrong('');
      setQuestionsSkipped('');
      setGuessedQuestions('');
    }
  };

  const handleSubmitDay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const dayId = `day_${Date.now()}`;

    // Restrict raw notebook photo strictly to this device/browser
    if (uploadedImageBase64) {
      try {
        localStorage.setItem(`device_photo_${dayId}`, uploadedImageBase64);
      } catch (err) {
        console.warn('Local device storage limit reached for photo:', err);
      }
    }

    try {
      await onSaveDay({
        id: dayId,
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
        // Photos remain local to the device; host receives structured data only
        notebookImages: [],
        errorRecords: sessionErrors,
        dailyTasks: currentTasks,
        feedbackLoopEnabledOnSubmit: feedbackLoopEnabled
      });
      setIsModalOpen(false);
      // Reset form
      setSessionErrors([]);
      setUploadedImageBase64(null);
      setContext('');
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
          Record New Day
        </button>
      </div>

      {/* Daily Study Goals & To-Do Tracker (Interactive Planner & Progress Tracker) */}
      <DailyGoalsTracker
        selectedDate={date}
        onDateChange={setDate}
        onTasksChange={setCurrentTasks}
        userId={currentUser?.id}
      />

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

                    {/* Daily Tasks / Goals Logged for this Day */}
                    {day.dailyTasks && day.dailyTasks.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-cyan-400" />
                            Session Study Goals ({day.dailyTasks.filter(t => t.completed).length}/{day.dailyTasks.length} Completed)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                          {day.dailyTasks.map(task => (
                            <div 
                              key={task.id} 
                              className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                                task.completed ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {task.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />}
                                <span className={`truncate text-[11px] ${task.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                                  {task.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 shrink-0">{task.targetMinutes}m</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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

                    {/* Device-Local Photo Attachment */}
                    {(() => {
                      const localPhoto = typeof window !== 'undefined' ? localStorage.getItem(`device_photo_${day.id}`) : null;
                      if (!localPhoto) return null;
                      return (
                        <div className="pt-3 border-t border-slate-800/80">
                          <span className="text-[11px] font-mono text-slate-400 font-semibold flex items-center gap-1.5 mb-2">
                            <Camera className="w-3.5 h-3.5 text-cyan-400" />
                            Notebook Scan (Stored on this browser / device only)
                          </span>
                          <div className="border border-slate-800 rounded-lg overflow-hidden max-w-sm bg-black/40">
                            <img 
                              src={localPhoto} 
                              alt="Local Notebook Scan" 
                              className="max-h-56 object-contain rounded"
                            />
                            <div className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 border-t border-slate-800 flex justify-between items-center">
                              <span>🔒 Device Local</span>
                              <span>Not stored on cloud host</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
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

              {/* 1-Click Quick Time Presets */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Rapid Day Presets:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyTimePreset('standard')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 hover:text-cyan-300 text-slate-300 text-[11px] transition-all"
                  >
                    Standard 6h Day
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTimePreset('school')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 hover:text-cyan-300 text-slate-300 text-[11px] transition-all"
                  >
                    School Day 3.5h
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTimePreset('mock')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 hover:text-cyan-300 text-slate-300 text-[11px] transition-all"
                  >
                    Full Mock 8h
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTimePreset('clear')}
                    className="px-2 py-1 rounded-lg bg-slate-900/60 border border-slate-800 hover:text-rose-400 text-slate-500 text-[11px] transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Time Breakdown (Section 8 Spec: Target, Available, Actual must not be conflated) */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 flex items-center justify-between">
                  <span>Three-Layer Study Time (Hours)</span>
                  <div className="flex items-center gap-3">
                    {parseFloat(sumDetailedHours) > 0 && (
                      <button
                        type="button"
                        onClick={handleAutoSumHours}
                        className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline font-normal"
                      >
                        ⚡ Sum Details into Actual ({sumDetailedHours}h)
                      </button>
                    )}
                    <span className="text-[10px] text-cyan-400 font-normal">Section 8 Rule: Never conflate</span>
                  </div>
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
                <div className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 flex items-center justify-between">
                  <span>Questions Attempted & Accuracy</span>
                  <div className="flex items-center gap-2">
                    {liveAccuracy !== null && (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        liveAccuracy >= 75 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        liveAccuracy >= 50 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        🎯 Accuracy: {liveAccuracy}% ({corNum}/{attNum})
                      </span>
                    )}
                    {attNum > 0 && corNum > 0 && (
                      <button
                        type="button"
                        onClick={handleAutoWrong}
                        className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline font-normal"
                      >
                        Auto-Compute Wrong ({calcWrong})
                      </button>
                    )}
                  </div>
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

              {/* Diagnostic Mistake & Error Vault Logger (Zero-AI Dependent, 100% Reliable) */}
              <DiagnosticMistakeLogger
                errors={sessionErrors}
                onErrorsChange={setSessionErrors}
                attachedPhoto={uploadedImageBase64}
                onAttachPhoto={setUploadedImageBase64}
              />

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
