export interface DocumentUploadResponse {
  doc_id: string;
  filename: string;
  word_count: number;
  topics_detected: string[];
  message?: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct_option: number; // 0-indexed
  topic: string;
  explanation: string;
  source_excerpt: string;
}

export interface Quiz {
  quiz_id: string;
  doc_id: string;
  title: string;
  total_questions: number;
  questions: Question[];
}

export interface AnswerSubmit {
  question_id: number;
  selected_option: number;
}

export interface QuizSubmission {
  quiz_id: string;
  answers: AnswerSubmit[];
}

export interface QuestionEvaluation {
  question_id: number;
  question: string;
  options: string[];
  selected_option: number;
  correct_option: number;
  is_correct: boolean;
  topic: string;
  explanation: string;
  source_excerpt: string;
}

export interface EvaluationResult {
  evaluation_id: string;
  quiz_id: string;
  score: number;
  total: number;
  percentage: number;
  weak_topics: string[];
  strong_topics: string[];
  questions_eval: QuestionEvaluation[];
}

export type UserRole = 'teacher' | 'student';

export type PageStep = 
  | 'teacher-dashboard' 
  | 'student-dashboard' 
  | 'upload' 
  | 'quiz' 
  | 'results' 
  | 'my-courses'
  | 'class-analytics';

export type AIModelChoice = 'Gemma 4 (Google GenAI)' | 'Gemini 1.5 Flash' | 'Gemini 2.5 Flash';

export interface AISettings {
  model: AIModelChoice;
  apiKey: string;
}

export interface StudentAnalyticsItem {
  id: string;
  name: string;
  initials: string;
  avgScore: number;
  completedQuizzes: string;
  riskLevel: 'On Track' | 'Needs Support' | 'At Risk';
  avatarColor: string;
}


export interface SyllabusItem {
  id: string;
  name: string;
  size: string;
  format: 'PDF' | 'Word' | 'Text';
  modules: string;
  lastModified: string;
  status: 'Analyzed' | 'Processing';
}

export interface RecentQuizItem {
  id: string;
  title: string;
  date: string;
  completions: number;
  avgScore: number;
}

export interface TeacherDashboardData {
  classOverview: {
    className: string;
    section: string;
    activeStudents: number;
    avgScore: number;
    scoreChange: string;
    engagementMetric: string;
  };
  syllabi: SyllabusItem[];
  recentQuizzes: RecentQuizItem[];
  insight: {
    module: string;
    text: string;
    sourceExcerpt: string;
    sourceCitation: string;
  };
}

export interface RecentPerformanceItem {
  id: string;
  title: string;
  takenDate: string;
  score: number;
}

export interface UpcomingQuizItem {
  id: string;
  title: string;
  course: string;
  month: string;
  day: string;
}

export interface StudentDashboardData {
  studentName: string;
  courseName: string;
  curriculumMasteryPct: number;
  currentFocus: {
    moduleTitle: string;
    description: string;
    areaOfImprovement: string;
  };
  recentPerformance: RecentPerformanceItem[];
  upcomingQuizzes: UpcomingQuizItem[];
  gpaGoal: {
    title: string;
    currentGpa: number;
    targetGpa: number;
    progressPct: number;
    quote: string;
  };
}

export interface SavedAppState {
  activeStep: PageStep;
  userRole?: UserRole;
  documentData: DocumentUploadResponse | null;
  quizData: Quiz | null;
  evaluationData: EvaluationResult | null;
  documentId: string | null;
  quizId: string | null;
  submissionId: string | null;
  lastUpdated?: number;
}
