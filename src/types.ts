export type ExamFocus = 'JEE' | 'CET';

export type DayType = 
  | 'NORMAL' 
  | 'SCHOOL_HEAVY' 
  | 'SCHOOL_TEST' 
  | 'HOLIDAY' 
  | 'OTHER_CONSTRAINT';

export type ErrorType = 'concept' | 'application' | 'execution' | 'selection';

export type ConfidenceLevel = 
  | 'correct_confident' 
  | 'correct_uncertain' 
  | 'wrong_confident' 
  | 'wrong_uncertain';

export interface ErrorRecord {
  id: string;
  studyDayId?: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  chapter: string;
  concept: string;
  errorType: ErrorType;
  description: string;
  whyItHappened: string;
  correctUnderstanding: string;
  timeLostSeconds: number;
  confidenceLevel: ConfidenceLevel;
  sourceImageId?: string;
  sourceImageName?: string;
  createdAt: string;
}

export interface StudyDay {
  id: string;
  weekId: string;
  date: string;
  examFocus: ExamFocus;
  dayType: DayType;
  context?: string;
  
  // Time metrics (hours)
  targetHours: number;
  availableHours: number;
  actualHours: number;
  testingHours: number;
  analysisHours: number;
  otherStudyHours: number;
  
  // Question volume & accuracy
  questionsAttempted: number;
  questionsCorrect: number;
  questionsWrong: number;
  questionsSkipped: number;
  guessedQuestions: number;
  
  // Metacognitive data
  notebookImages: string[];
  errorRecords: ErrorRecord[];
  
  // Provenance & switch audit
  feedbackLoopEnabledOnSubmit: boolean;
  processingStatus: 'completed' | 'pending' | 'fast_capture_only';
  createdAt: string;
}

export interface SubjectBenchmarkBreakdown {
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
  maxScore: number;
  accuracy: number;
}

export interface BenchmarkTest {
  id: string;
  weekId: string;
  date: string;
  examType: ExamFocus;
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
  maximumScore: number;
  durationMinutes: number;
  subjectBreakdown: SubjectBenchmarkBreakdown[];
  notes?: string;
}

export interface PreparationWeek {
  id: string; // e.g., '2026-W40'
  title: string;
  startDate: string;
  endDate: string;
  jeeDays: number;
  cetDays: number;
  allocationRatio: '5:0' | '4:1' | '3:2' | '2:3' | '1:4' | '0:5';
  benchmarkExam: ExamFocus;
  benchmark?: BenchmarkTest;
  targetWeeklyHours: number;
  status: 'active' | 'completed' | 'upcoming';
}

export interface ProvenanceTrace {
  id: string;
  diagnosisIssue: string;
  subject: string;
  chapter: string;
  sourceNotebookNote: string;
  sourceImageName?: string;
  normalizedErrorType: ErrorType;
  computedAccuracy: string;
  attemptsCount: number;
  timeLostTotalMin: number;
  aiInference: string;
  confidence: number;
}

export interface WeeklyAiReport {
  id: string;
  weekId: string;
  generatedAt: string;
  promptVersion: string;
  model: string;
  summary: string;
  
  majorObservations: {
    observation: string;
    evidence: string[];
    confidence: number;
  }[];
  
  diagnoses: {
    id: string;
    subject: string;
    chapter: string;
    issue: string;
    type: ErrorType;
    confidence: number;
  }[];
  
  persistentWeaknesses: {
    subject: string;
    chapter: string;
    description: string;
    leakageMarks: number;
  }[];
  
  improvingAreas: {
    subject: string;
    chapter: string;
    description: string;
    evidence: string;
  }[];
  
  recommendedPriorities: {
    subject: string;
    chapter: string;
    focus: ErrorType;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    actionIntervention: string;
  }[];
  
  nextWeekExperiment: {
    hypothesis: string;
    intervention: string;
    measurement: string;
  };
  
  provenanceTraces: ProvenanceTrace[];
}

export interface ChapterMetric {
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  chapter: string;
  attempts: number;
  correct: number;
  wrong: number;
  accuracy: number;
  conceptErrors: number;
  applicationErrors: number;
  executionErrors: number;
  selectionErrors: number;
  totalTimeLostMinutes: number;
  status: 'critical' | 'warning' | 'strong' | 'untested';
}

export interface SystemAnalytics {
  overallAccuracy: number;
  totalQuestions: number;
  totalActualHours: number;
  questionsPerHour: number;
  timeUtilizationRate: number; // actual / available
  errorTypeDistribution: {
    concept: number;
    application: number;
    execution: number;
    selection: number;
    total: number;
  };
  confidenceDistribution: {
    correctConfident: number;
    correctUncertain: number; // potential lucky guesses
    wrongConfident: number;   // dangerous misconceptions
    wrongUncertain: number;   // acknowledged weaknesses
  };
  jeeAccuracy: number;
  cetAccuracy: number;
  jeeQuestionsPerHour: number;
  cetQuestionsPerHour: number;
  chapterMetrics: ChapterMetric[];
}
