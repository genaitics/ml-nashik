import React, { useState } from 'react';
import { Quiz, AnswerSubmit } from '../types';
import { HelpCircle, ArrowLeft, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface QuizPageProps {
  quiz: Quiz;
  onSubmitQuiz: (answers: AnswerSubmit[]) => void;
  isSubmitting: boolean;
}

export const QuizPage: React.FC<QuizPageProps> = ({
  quiz,
  onSubmitQuiz,
  isSubmitting,
}) => {
  const storageKey = `edumentor_quiz_progress_${quiz.quiz_id}`;

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_idx`);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [userAnswers, setUserAnswers] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_ans`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_idx`, currentIndex.toString());
    } catch (err) {}
  }, [currentIndex, storageKey]);

  React.useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_ans`, JSON.stringify(userAnswers));
    } catch (err) {}
  }, [userAnswers, storageKey]);

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    try {
      localStorage.removeItem(`${storageKey}_idx`);
      localStorage.removeItem(`${storageKey}_ans`);
    } catch (err) {}

    const formattedAnswers: AnswerSubmit[] = quiz.questions.map((q) => ({
      question_id: q.id,
      selected_option: userAnswers[q.id] ?? -1,
    }));
    onSubmitQuiz(formattedAnswers);
  };


  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      
      {/* Quiz Header Info Bar */}
      <div className="bg-paper-surface p-4 sm:p-5 rounded-2xl border-2 border-ink shadow-paper-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-ink-pencil tracking-wider font-semibold block">
            CS402 Quiz Attempt
          </span>
          <h2 className="font-serif font-bold text-xl text-ink">
            {quiz.title}
          </h2>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-xs font-mono text-ink-pencil block">Questions Answered</span>
            <span className="text-sm font-mono font-bold text-ink">
              {answeredCount} / {totalQuestions}
            </span>
          </div>
          <div className="w-10 h-10 bg-highlighter text-ink rounded-full flex items-center justify-center font-mono font-bold border border-ink shadow-paper-sm">
            {currentIndex + 1}
          </div>
        </div>
      </div>

      {/* Question Progress Bar */}
      <div className="w-full bg-paper-container rounded-full h-3 border border-ink/20 p-0.5 overflow-hidden">
        <div 
          className="bg-ink h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-paper-surface rounded-2xl border-2 border-ink shadow-paper-lg p-6 sm:p-8 paper-margin-yellow relative space-y-6">
        
        {/* Question Topic & Step Indicator */}
        <div className="flex items-center justify-between border-b border-ink/15 pb-4">
          <span className="bg-paper-container text-ink-light px-3 py-1 rounded-lg text-xs font-mono border border-ink/15 flex items-center space-x-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-highlighter-hover" />
            <span>Topic: {currentQuestion.topic}</span>
          </span>

          <span className="text-xs font-mono text-ink-pencil">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        {/* Question Text */}
        <div className="py-2">
          <h3 className="font-serif font-semibold text-xl sm:text-2xl text-ink leading-snug">
            {currentQuestion.question}
          </h3>
        </div>

        {/* MCQ Options List */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((optionText, idx) => {
            const isSelected = userAnswers[currentQuestion.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start space-x-4 ${
                  isSelected
                    ? 'border-ink bg-highlighter-soft shadow-paper-md scale-[1.005]'
                    : 'border-ink/20 bg-paper-low hover:border-ink hover:bg-paper-container'
                }`}
              >
                {/* Option Letter Tag */}
                <span className={`w-8 h-8 rounded-lg font-mono font-bold text-sm flex items-center justify-center shrink-0 border transition-colors ${
                  isSelected
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-paper-surface text-ink border-ink/20'
                }`}>
                  {optionLetters[idx]}
                </span>

                {/* Option Content */}
                <div className="flex-1 pt-1 font-sans text-sm sm:text-base text-ink leading-relaxed">
                  {optionText}
                </div>

                {/* Selection Checkmark */}
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-ink shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Navigation Bar inside Question Card */}
        <div className="pt-6 border-t border-ink/15 flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center space-x-2 border ${
              currentIndex === 0
                ? 'text-ink-pencil/40 border-ink/10 cursor-not-allowed'
                : 'text-ink bg-paper-low hover:bg-paper-container border-ink/20'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Quick Jump Buttons */}
          <div className="hidden sm:flex items-center space-x-1.5">
            {quiz.questions.map((q, idx) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-md font-mono text-xs font-bold transition border ${
                    isCurrent
                      ? 'bg-highlighter text-ink border-ink'
                      : isAnswered
                      ? 'bg-sage text-sage-deep border-sage-dark/30'
                      : 'bg-paper-container text-ink-pencil border-ink/15'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-ink-light transition flex items-center space-x-2 shadow-paper-sm"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4 text-highlighter" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-highlighter hover:bg-highlighter-hover text-ink font-bold rounded-lg text-sm transition border-2 border-ink flex items-center space-x-2 shadow-paper-md"
            >
              <CheckCircle2 className="w-4 h-4 text-ink" />
              <span>{isSubmitting ? 'Evaluating Answers...' : 'Submit Quiz'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
