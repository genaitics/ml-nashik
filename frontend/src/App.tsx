import React, { useState, useEffect } from 'react';
import { PageStep, UserRole, DocumentUploadResponse, Quiz, AnswerSubmit, EvaluationResult } from './types';
import { api } from './api/client';
import { Header } from './components/Header';
import { UploadPage } from './pages/UploadPage';
import { QuizPage } from './pages/QuizPage';
import { ResultsPage } from './pages/ResultsPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { ClassAnalyticsPage } from './pages/ClassAnalyticsPage';
import { ChatPage } from './pages/ChatPage';
import { TeacherQuizPreviewPage } from './pages/TeacherQuizPreviewPage';

export const App: React.FC = () => {
  // Restore initial state from localStorage if available
  const savedState = api.loadState();

  const [userRole, setUserRole] = useState<UserRole>(savedState?.userRole || 'teacher');
  const [step, setStep] = useState<PageStep>(
    savedState?.activeStep || (savedState?.userRole === 'student' ? 'student-dashboard' : 'teacher-dashboard')
  );
  const [documentData, setDocumentData] = useState<DocumentUploadResponse | null>(savedState?.documentData || null);
  const [quizData, setQuizData] = useState<Quiz | null>(savedState?.quizData || null);
  const [evaluationData, setEvaluationData] = useState<EvaluationResult | null>(savedState?.evaluationData || null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically save state changes to localStorage
  useEffect(() => {
    api.saveState({
      activeStep: step,
      userRole,
      documentData,
      quizData,
      evaluationData,
      documentId: documentData?.doc_id || null,
      quizId: quizData?.quiz_id || null,
      submissionId: evaluationData?.evaluation_id || null,
    });
  }, [step, userRole, documentData, quizData, evaluationData]);

  // Upload handler
  const handleUploadSuccess = (doc: DocumentUploadResponse) => {
    setDocumentData(doc);
  };


  const handleGenerateQuiz = async (selectedTopics?: string[]) => {
    if (!documentData) return;
    setIsGenerating(true);

    try {
      const quiz = await api.generateQuiz(documentData.doc_id, 5, selectedTopics);
      setQuizData(quiz);
      setStep(userRole === 'teacher' ? 'teacher-quiz-preview' : 'quiz');
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit quiz handler
  const handleSubmitQuiz = async (answers: AnswerSubmit[]) => {
    if (!quizData) return;
    setIsSubmitting(true);

    try {
      const evalResult = await api.submitQuiz({
        quiz_id: quizData.quiz_id,
        answers,
      });
      setEvaluationData(evalResult);
      setStep('results');
    } catch (err) {
      console.error('Quiz submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakeQuiz = () => {
    setStep('quiz');
  };

  const handleUploadNew = () => {
    setDocumentData(null);
    setQuizData(null);
    setEvaluationData(null);
    setStep('upload');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (newRole === 'teacher') {
      setStep('teacher-dashboard');
    } else {
      setStep('student-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-paper paper-texture text-ink font-sans flex flex-col selection:bg-highlighter selection:text-ink">
      
      {/* Top Header Navigation with Role Switcher */}
      <Header
        currentStep={step}
        userRole={userRole}
        onRoleChange={handleRoleChange}
        onNavigate={(newStep) => setStep(newStep)}
        documentData={documentData}
        quizData={quizData}
        evaluationData={evaluationData}
      />

      {/* Main Content Area with Smooth Slide/Fade Transitions */}
      <main className="flex-1 pb-16">
        <div key={step} className="animate-slide-fade">
          
          {step === 'teacher-dashboard' && (
            <TeacherDashboardPage
              onNavigate={(newStep) => setStep(newStep)}
              onUploadNew={() => setStep('upload')}
            />
          )}

          {step === 'class-analytics' && (
            <ClassAnalyticsPage
              onNavigate={(newStep) => setStep(newStep)}
              onUploadNew={() => setStep('upload')}
            />
          )}

          {step === 'student-dashboard' && (
            <StudentDashboardPage
              onNavigate={(newStep) => setStep(newStep)}
            />
          )}

          {(step === 'upload' || step === 'my-courses') && (
            <UploadPage
              onUploadSuccess={handleUploadSuccess}
              onGenerateQuiz={handleGenerateQuiz}
              isGenerating={isGenerating}
              uploadedDoc={documentData}
            />
          )}

          {step === 'teacher-quiz-preview' && (
            quizData ? (
              <TeacherQuizPreviewPage 
                quiz={quizData} 
                onAssignToClass={() => setStep('teacher-dashboard')}
                onReturnToDashboard={() => setStep('teacher-dashboard')}
              />
            ) : (
              <div className="max-w-xl mx-auto my-12 p-8 bg-paper-surface border-2 border-ink rounded-2xl text-center space-y-4 shadow-paper-sm">
                <h3 className="font-serif text-2xl font-bold text-ink">No Quiz to Preview</h3>
                <button
                  onClick={() => setStep('upload')}
                  className="bg-ink text-paper px-6 py-2.5 rounded-xl font-bold shadow-paper-sm hover:bg-ink-light transition-all text-sm"
                >
                  Return to Upload
                </button>
              </div>
            )
          )}

          {step === 'quiz' && (
            quizData ? (
              <QuizPage
                quiz={quizData}
                onSubmitQuiz={handleSubmitQuiz}
                isSubmitting={isSubmitting}
              />
            ) : (
              <div className="max-w-xl mx-auto my-12 p-8 bg-paper-surface border-2 border-ink rounded-2xl text-center space-y-4 shadow-paper-sm">
                <h3 className="font-serif text-2xl font-bold text-ink">No Active Quiz Generated</h3>
                <p className="text-sm font-sans text-ink-pencil">Please upload or select a syllabus to generate a quiz attempt.</p>
                <button
                  onClick={() => setStep('upload')}
                  className="bg-highlighter text-ink px-6 py-2.5 rounded-xl font-bold border-2 border-ink shadow-paper-sm hover:brightness-105 transition-all text-sm"
                >
                  Upload Syllabus
                </button>
              </div>
            )
          )}

          {step === 'results' && (
            evaluationData ? (
              <ResultsPage
                evaluation={evaluationData}
                onRetakeQuiz={handleRetakeQuiz}
                onUploadNew={handleUploadNew}
              />
            ) : (
              <div className="max-w-xl mx-auto my-12 p-8 bg-paper-surface border-2 border-ink rounded-2xl text-center space-y-4 shadow-paper-sm">
                <h3 className="font-serif text-2xl font-bold text-ink">No Evaluation Results Yet</h3>
                <p className="text-sm font-sans text-ink-pencil">Attempt a quiz to see your grounded RAG evaluation and citation analysis.</p>
                <button
                  onClick={() => setStep(userRole === 'teacher' ? 'teacher-dashboard' : 'student-dashboard')}
                  className="bg-ink text-paper px-6 py-2.5 rounded-xl font-bold shadow-paper-sm hover:bg-ink-light transition-all text-sm"
                >
                  Return to Dashboard
                </button>
              </div>
            )
          )}

          {step === 'chat' && (
            documentData ? (
              <ChatPage documentData={documentData} />
            ) : (
              <div className="max-w-xl mx-auto my-12 p-8 bg-paper-surface border-2 border-ink rounded-2xl text-center space-y-4 shadow-paper-sm">
                <h3 className="font-serif text-2xl font-bold text-ink">No Document Available</h3>
                <p className="text-sm font-sans text-ink-pencil">Please upload or select a syllabus to start the Q&A Chat.</p>
                <button
                  onClick={() => setStep('upload')}
                  className="bg-highlighter text-ink px-6 py-2.5 rounded-xl font-bold border-2 border-ink shadow-paper-sm hover:brightness-105 transition-all text-sm"
                >
                  Upload Syllabus
                </button>
              </div>
            )
          )}

        </div>
      </main>

      {/* Tactile Footer */}
      <footer className="border-t border-ink/15 py-6 bg-paper-surface/60">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs font-mono text-ink-pencil space-y-1">
          <p>Pariksha AI — Digital Study Guide</p>
          <p className="opacity-75">Tactile Minimalism Design • Dual Teacher & Student Portals</p>
        </div>
      </footer>

    </div>
  );
};

export default App;
