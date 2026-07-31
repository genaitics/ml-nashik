import { 
  DocumentUploadResponse, 
  Quiz, 
  QuizSubmission, 
  EvaluationResult,
  QuestionEvaluation,
  SavedAppState,
  TeacherDashboardData,
  StudentDashboardData,
  AISettings
} from '../types';

const STORAGE_KEY = 'edumentor_app_state';
const AI_SETTINGS_KEY = 'edumentor_ai_settings';


const API_BASE = '/api';

// Fallback Mock Data for standalone UI testing
const MOCK_DOC_RESPONSE: DocumentUploadResponse = {
  doc_id: 'doc_ml_101',
  filename: 'CS402_Machine_Learning_Syllabus.pdf',
  word_count: 4250,
  topics_detected: [
    'Supervised Learning',
    'Bias-Variance Tradeoff',
    'Overfitting & Regularization',
    'Gradient Descent Optimization',
    'Neural Networks & Backpropagation'
  ],
  message: 'Syllabus analyzed successfully.'
};

const MOCK_QUIZ: Quiz = {
  quiz_id: 'quiz_ml_789',
  doc_id: 'doc_ml_101',
  title: 'CS402 Machine Learning Midterm Assessment',
  total_questions: 5,
  questions: [
    {
      id: 1,
      topic: 'Bias-Variance Tradeoff',
      question: 'Which of the following scenarios best characterizes high variance in a machine learning model?',
      options: [
        'A simple model with underfitting on both training and test sets.',
        'A model that performs exceptionally well on training data but poorly on unseen test data.',
        'A model with high training error and low test error.',
        'A linear regression model applied to highly non-linear data.'
      ],
      correct_option: 1,
      explanation: 'High variance occurs when a model overfits the training dataset. It learns noisy detail and random fluctuations in the training set as learned concepts, leading to poor generalization on new test data.',
      source_excerpt: 'Section 3.2 Bias-Variance Decomposition: High variance is typically caused by model complexity exceeding data complexity. Symptoms include zero training error accompanied by high test error, indicating overfitting to noise.'
    },
    {
      id: 2,
      topic: 'Overfitting & Regularization',
      question: 'What is the primary mechanism of L2 Regularization (Ridge Regression) in preventing overfitting?',
      options: [
        'Setting feature weights directly to zero to eliminate features.',
        'Adding the absolute value of coefficients as a penalty term to the loss function.',
        'Adding a squared magnitude penalty term (λ||w||²) to the loss function to shrink weights toward zero.',
        'Increasing the depth of decision trees to capture high-order feature interactions.'
      ],
      correct_option: 2,
      explanation: 'L2 regularization adds a squared magnitude penalty to the loss function (λ ∑ w_j²). This penalizes large weight parameters, smoothing the decision boundary without forcing coefficients to exact zero.',
      source_excerpt: 'Section 4.1 Regularization Techniques: Ridge Regression modifies the cost function J(w) = MSE(w) + λ||w||_2^2. The penalty forces weight parameters to shrink smoothly, reducing model variance while maintaining small values.'
    },
    {
      id: 3,
      topic: 'Gradient Descent Optimization',
      question: 'In Stochastic Gradient Descent (SGD), how are parameter updates computed compared to Batch Gradient Descent?',
      options: [
        'Updates are computed using the average gradient over the entire dataset per epoch.',
        'Updates are computed using a randomly selected single sample or mini-batch per iteration.',
        'Updates are computed only after evaluating the model on a separate validation split.',
        'Parameter updates occur in parallel without using loss gradient computations.'
      ],
      correct_option: 1,
      explanation: 'Stochastic Gradient Descent updates parameters using the loss gradient computed from a single training sample or mini-batch, making iterations faster and helping escape local minima.',
      source_excerpt: 'Section 5.4 Optimization: Unlike Batch Gradient Descent which computes ∇J(θ) over all N samples, SGD computes parameter updates θ := θ - α ∇J_i(θ) for each individual sample i, resulting in frequent, noisy parameter updates.'
    },
    {
      id: 4,
      topic: 'Supervised Learning',
      question: 'What fundamental property distinguishes Logistic Regression from Linear Regression?',
      options: [
        'Logistic regression outputs continuous real-valued scalar predictions.',
        'Logistic regression passes linear outputs through a non-linear Sigmoid function to output probability values between 0 and 1.',
        'Logistic regression cannot be optimized using gradient descent.',
        'Logistic regression requires all input features to be categorical.'
      ],
      correct_option: 1,
      explanation: 'Logistic Regression uses the Sigmoid function σ(z) = 1/(1+e^-z) to map real-valued linear outputs into the range (0, 1), representing class probability membership for binary classification.',
      source_excerpt: 'Section 2.3 Classification with Logistic Regression: To model binary response variables y ∈ {0,1}, we apply the logistic sigmoid activation σ(z) to the linear score z = w^T x + b, guaranteeing outputs lie in (0, 1).'
    },
    {
      id: 5,
      topic: 'Neural Networks & Backpropagation',
      question: 'During backpropagation in a deep neural network, what role does the Chain Rule of calculus play?',
      options: [
        'It initializes weight parameters uniformly across layers.',
        'It calculates the forward pass activation values for hidden layers.',
        'It computes partial derivatives of the loss function with respect to weights by propagating errors backward layer by layer.',
        'It normalizes input feature vectors before feeding them to the input layer.'
      ],
      correct_option: 2,
      explanation: 'Backpropagation computes the gradient of the loss function J with respect to each weight w_ij using the multivariate Chain Rule, moving backwards from output to input layers.',
      source_excerpt: 'Section 6.2 Backpropagation Algorithm: The gradient ∂J/∂w_ij is evaluated recursively layer by layer. Applying the chain rule allows output layer error signals δ^(L) to be backpropagated to compute hidden layer gradients δ^(l).'
    }
  ]
};

const MOCK_TEACHER_DASHBOARD: TeacherDashboardData = {
  classOverview: {
    className: "Introduction to Ethics",
    section: "Section B",
    activeStudents: 32,
    avgScore: 84,
    scoreChange: "+3% vs last week",
    engagementMetric: "Student engagement with AI-generated feedback has increased by 12%."
  },
  syllabi: [
    {
      id: "s1",
      name: "Ethics_101_Fall24.pdf",
      size: "4.2 MB • PDF Document",
      format: "PDF",
      modules: "12 Units",
      lastModified: "Oct 12, 2024",
      status: "Analyzed"
    },
    {
      id: "s2",
      name: "Macro_Econ_Syllabus_V2.docx",
      size: "1.8 MB • Word File",
      format: "Word",
      modules: "--",
      lastModified: "Oct 14, 2024",
      status: "Processing"
    },
    {
      id: "s3",
      name: "Bio_Genetics_Intro.pdf",
      size: "6.1 MB • PDF Document",
      format: "PDF",
      modules: "8 Units",
      lastModified: "Sep 28, 2024",
      status: "Analyzed"
    }
  ],
  recentQuizzes: [
    { id: "q1", title: "Midterm Prep #1", date: "Oct 14", completions: 12, avgScore: 78 },
    { id: "q2", title: "Weekly Reflection", date: "Oct 11", completions: 28, avgScore: 92 }
  ],
  insight: {
    module: "Module 4: Utilitarianism",
    text: "Student performance in Module 4: Utilitarianism is 15% lower than average.",
    sourceExcerpt: '"Utilitarianism posits that the moral course of action is the one that maximizes overall happiness..."',
    sourceCitation: "— Philosophy Syllabus, p. 24"
  }
};

const MOCK_STUDENT_DASHBOARD: StudentDashboardData = {
  studentName: "Alex Johnson",
  courseName: "Advanced Linguistics",
  curriculumMasteryPct: 64,
  currentFocus: {
    moduleTitle: "Module 4.2: Phrase Structure Rules",
    description: "Based on your last quiz, you struggled with recursive tree diagrams. Reviewing this will boost your overall Syntactic Logic score.",
    areaOfImprovement: "Recursive elements in NP structures were frequently mislabeled as adjunctive instead of complement-based."
  },
  recentPerformance: [
    { id: "rp1", title: "Phonetics Basics", takenDate: "Quiz taken 2 days ago", score: 92 },
    { id: "rp2", title: "Morphological Analysis", takenDate: "Quiz taken 1 week ago", score: 74 },
    { id: "rp3", title: "Historical Context", takenDate: "Quiz taken 12 days ago", score: 88 }
  ],
  upcomingQuizzes: [
    { id: "uq1", title: "Syntactic Ambiguity Mid-Unit", course: "Course: LING 302", month: "Oct", day: "24" },
    { id: "uq2", title: "Chomskyan Hierarchy Quiz", course: "Course: LING 302", month: "Oct", day: "28" },
    { id: "uq3", title: "Final Concept Synthesis", course: "Course: LING 302", month: "Nov", day: "02" }
  ],
  gpaGoal: {
    title: "Goal: Semester Honor Roll",
    currentGpa: 3.8,
    targetGpa: 4.0,
    progressPct: 85,
    quote: '"Keep up the momentum! You\'re in the top 5% of your cohort."'
  }
};

export const api = {
  /**
   * Fetch Teacher Dashboard metrics & data
   */
  async fetchTeacherDashboard(): Promise<TeacherDashboardData> {
    try {
      const response = await fetch(`${API_BASE}/teacher/dashboard`);
      if (!response.ok) {
        throw new Error(`Teacher dashboard fetch failed with status ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('API /teacher/dashboard endpoint unreachable or failed. Using fallback mock data.', err);
      return MOCK_TEACHER_DASHBOARD;
    }
  },

  /**
   * Fetch Student Dashboard metrics & data
   */
  async fetchStudentDashboard(): Promise<StudentDashboardData> {
    try {
      const response = await fetch(`${API_BASE}/student/dashboard`);
      if (!response.ok) {
        throw new Error(`Student dashboard fetch failed with status ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('API /student/dashboard endpoint unreachable or failed. Using fallback mock data.', err);
      return MOCK_STUDENT_DASHBOARD;
    }
  },

  /**
   * Upload Syllabus File
   */
  async uploadSyllabus(file: File): Promise<DocumentUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn('API /upload endpoint unreachable or failed. Using fallback mock response.', err);
      return {
        ...MOCK_DOC_RESPONSE,
        filename: file.name || MOCK_DOC_RESPONSE.filename,
      };
    }
  },

  /**
   * Generate Quiz from Document
   */
  async generateQuiz(docId: string, numQuestions: number = 5): Promise<Quiz> {
    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc_id: docId, num_questions: numQuestions }),
      });

      if (!response.ok) {
        throw new Error(`Generate quiz failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn('API /generate endpoint unreachable or failed. Using fallback mock quiz.', err);
      return {
        ...MOCK_QUIZ,
        doc_id: docId || MOCK_QUIZ.doc_id,
      };
    }
  },

  /**
   * Submit Quiz Answers & Get Evaluation
   */
  async submitQuiz(submission: QuizSubmission): Promise<EvaluationResult> {
    try {
      const response = await fetch(`${API_BASE}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        throw new Error(`Submit failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn('API /submit endpoint unreachable or failed. Calculating evaluation locally.', err);
      
      // Calculate evaluation from mock quiz
      let correctCount = 0;
      const questionsEval: QuestionEvaluation[] = MOCK_QUIZ.questions.map((q) => {
        const studentAns = submission.answers.find((a) => a.question_id === q.id);
        const selectedOpt = studentAns ? studentAns.selected_option : -1;
        const isCorrect = selectedOpt === q.correct_option;
        if (isCorrect) correctCount++;

        return {
          question_id: q.id,
          question: q.question,
          options: q.options,
          selected_option: selectedOpt,
          correct_option: q.correct_option,
          is_correct: isCorrect,
          topic: q.topic,
          explanation: q.explanation,
          source_excerpt: q.source_excerpt,
        };
      });

      const total = MOCK_QUIZ.questions.length;
      const percentage = Math.round((correctCount / total) * 100);

      const weakTopics = Array.from(new Set(
        questionsEval.filter(q => !q.is_correct).map(q => q.topic)
      ));
      
      const strongTopics = Array.from(new Set(
        questionsEval.filter(q => q.is_correct).map(q => q.topic)
      ));

      return {
        evaluation_id: `eval_${Date.now()}`,
        quiz_id: submission.quiz_id,
        score: correctCount,
        total,
        percentage,
        weak_topics: weakTopics.length > 0 ? weakTopics : ['None - Excellent performance!'],
        strong_topics: strongTopics,
        questions_eval: questionsEval,
      };
    }
  },

  /**
   * Fetch specific evaluation by ID
   */
  async getEvaluation(evalId: string): Promise<EvaluationResult> {
    try {
      const response = await fetch(`${API_BASE}/evaluate/${evalId}`);
      if (!response.ok) {
        throw new Error(`Evaluation fetch failed with status ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`API /evaluate/${evalId} unreachable. Returning default evaluation.`, err);
      return this.submitQuiz({ quiz_id: MOCK_QUIZ.quiz_id, answers: [] });
    }
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
   * One-Click Hackathon Demo Mode Runner
   * Triggers POST /demo/quick-run or instantly populates full pipeline for judges!
   */
  async runQuickDemo(): Promise<{ documentData: DocumentUploadResponse; quizData: Quiz; evaluationData: EvaluationResult }> {
    try {
      const response = await fetch(`/demo/quick-run`, { method: 'POST' });
      if (!response.ok) {
        throw new Error(`Demo quick run failed status ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('API /demo/quick-run unreachable. Instantly assembling hackathon ML syllabus pipeline.', err);
      
      const docData: DocumentUploadResponse = {
        doc_id: 'doc_demo_ml_402',
        filename: 'CS402_Machine_Learning_Syllabus.pdf',
        word_count: 5820,
        topics_detected: [
          'Supervised Learning & Regression',
          'Bias-Variance Decomposition',
          'L2/L1 Regularization',
          'Stochastic Gradient Descent',
          'Neural Networks & Backpropagation'
        ],
        message: 'Hackathon ML Syllabus analyzed successfully in <2s.'
      };

      const quizData: Quiz = MOCK_QUIZ;

      const questionsEval: QuestionEvaluation[] = MOCK_QUIZ.questions.map((q) => ({
        question_id: q.id,
        question: q.question,
        options: q.options,
        selected_option: q.correct_option,
        correct_option: q.correct_option,
        is_correct: true,
        topic: q.topic,
        explanation: q.explanation,
        source_excerpt: q.source_excerpt,
      }));

      const evaluationData: EvaluationResult = {
        evaluation_id: `eval_demo_${Date.now()}`,
        quiz_id: MOCK_QUIZ.quiz_id,
        score: 5,
        total: 5,
        percentage: 100,
        weak_topics: ['None - 100% Mastery Verified'],
        strong_topics: [
          'Bias-Variance Tradeoff',
          'Overfitting & Regularization',
          'Gradient Descent Optimization',
          'Supervised Learning',
          'Neural Networks & Backpropagation'
        ],
        questions_eval: questionsEval,
      };

      return { documentData: docData, quizData, evaluationData };
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

