import { 
  DocumentUploadResponse, 
  Quiz, 
  QuizSubmission, 
  EvaluationResult,
  SavedAppState,
  TeacherDashboardData,
  StudentDashboardData,
  AISettings,
  ChatResponse
} from '../types';

const STORAGE_KEY = 'pariksha_app_state';
const AI_SETTINGS_KEY = 'pariksha_ai_settings';


const API_BASE = '/api';

export const api = {
  /**
   * Fetch Teacher Dashboard metrics & data
   */
  async fetchTeacherDashboard(): Promise<TeacherDashboardData> {
    const response = await fetch(`${API_BASE}/teacher/dashboard`);
    if (!response.ok) {
      throw new Error(`Teacher dashboard fetch failed with status ${response.status}`);
    }
    return await response.json();
  },

  /**
   * Fetch Student Dashboard metrics & data
   */
  async fetchStudentDashboard(): Promise<StudentDashboardData> {
    const response = await fetch(`${API_BASE}/student/dashboard`);
    if (!response.ok) {
      throw new Error(`Student dashboard fetch failed with status ${response.status}`);
    }
    return await response.json();
  },

  /**
   * Upload Syllabus File
   */
  async uploadSyllabus(file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}. Please ensure the backend is running.`);
    }

    return await response.json();
  },

  /**
   * Generate Quiz from Document
   */
  async generateQuiz(docId: string, numQuestions: number = 5): Promise<Quiz> {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_id: docId, num_questions: numQuestions }),
    });

    if (!response.ok) {
      throw new Error(`Generate quiz failed with status ${response.status}. Please check backend logs and ensure GEMINI_API_KEY is set.`);
    }

    return await response.json();
  },

  /**
   * Submit Quiz Answers & Get Evaluation
   */
  async submitQuiz(submission: QuizSubmission): Promise<EvaluationResult> {
    const response = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      throw new Error(`Submit failed with status ${response.status}. Please check backend logs.`);
    }

    return await response.json();
  },

  /**
   * Ask a question in the Q&A Chatbot
   */
  async askQuestion(docId: string, question: string, modelName?: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: docId, question, model_name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Ask question failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn('API /ask endpoint unreachable or failed.', err);
      return {
        answer: "I'm sorry, I couldn't connect to the AI model to answer your question at this time. Please make sure the backend is running.",
        source_chunks: [],
        model_name: modelName || 'Gemma 4 (Google GenAI)'
      };
    }
  },

  /**
   * Fetch specific evaluation by ID
   */
  async getEvaluation(evalId: string): Promise<EvaluationResult> {
    const response = await fetch(`${API_BASE}/evaluate/${evalId}`);
    if (!response.ok) {
      throw new Error(`Evaluation fetch failed with status ${response.status}`);
    }
    return await response.json();
  },

  /**
   * Save ongoing session state to localStorage
   */
  saveState(state: SavedAppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        lastUpdated: Date.now()
      }));
    } catch (err) {
      console.warn('Failed to save state to localStorage', err);
    }
  },

  /**
   * Restore session state from localStorage
   */
  loadState(): SavedAppState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SavedAppState;
    } catch (err) {
      console.warn('Failed to load state from localStorage', err);
      return null;
    }
  },

  /**
   * Load AI model & key settings from localStorage
   */
  getAISettings(): AISettings {
    try {
      const raw = localStorage.getItem(AI_SETTINGS_KEY);
      if (raw) {
        return JSON.parse(raw) as AISettings;
      }
    } catch (e) {
      console.warn('Failed to load AI settings', e);
    }
    return {
      model: 'Gemma 4 (Google GenAI)',
      apiKey: ''
    };
  },

  /**
   * Save AI model & key settings to localStorage
   */
  saveAISettings(settings: AISettings): void {
    try {
      localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save AI settings', e);
    }
  },

  /**
   * Clear session state from localStorage
   */
  clearState(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear state from localStorage', err);
    }
  }
};

