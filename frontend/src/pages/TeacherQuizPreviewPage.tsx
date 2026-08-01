import React from 'react';
import { Quiz } from '../types';
import { CheckCircle, Info } from 'lucide-react';

interface Props {
  quiz: Quiz;
  onAssignToClass: () => void;
  onReturnToDashboard: () => void;
}

export const TeacherQuizPreviewPage: React.FC<Props> = ({ quiz, onAssignToClass, onReturnToDashboard }) => {
  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      {/* Header */}
      <div className="bg-paper-surface border-2 border-ink p-8 rounded-3xl shadow-paper mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-serif font-bold text-ink mb-2">Quiz Preview: {quiz.title}</h2>
            <p className="text-ink-pencil font-sans text-sm">
              Review the generated questions and explanations before assigning to your class.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-paper rounded-full text-xs font-mono border-2 border-ink/20">
              {quiz.total_questions} Questions
            </span>
          </div>
        </div>
        
        <div className="mt-8 flex items-center gap-4">
          <button 
            onClick={onAssignToClass}
            className="bg-highlighter text-ink px-6 py-3 rounded-xl font-bold border-2 border-ink shadow-paper-sm hover:brightness-105 transition-all"
          >
            Assign to Class
          </button>
          <button 
            onClick={onReturnToDashboard}
            className="bg-ink text-paper px-6 py-3 rounded-xl font-bold shadow-paper-sm hover:bg-ink-light transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-8">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="bg-paper-surface border-2 border-ink rounded-2xl p-8 shadow-paper relative">
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-highlighter border-2 border-ink rounded-full flex items-center justify-center font-serif font-bold text-lg shadow-paper-sm z-10">
              {idx + 1}
            </div>

            <div className="mb-6 pl-4">
              <span className="inline-block px-3 py-1 bg-paper border border-ink/20 rounded-full text-[10px] font-mono text-ink-pencil uppercase tracking-wider mb-3">
                Topic: {q.topic}
              </span>
              <h3 className="text-xl font-serif font-bold text-ink leading-relaxed">
                {q.question}
              </h3>
            </div>

            {/* Options */}
            {q.type === 'mcq' || !q.type ? (
              <div className="space-y-3 mb-6">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correct_option;
                  return (
                    <div 
                      key={optIdx} 
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        isCorrect 
                          ? 'border-green-600 bg-green-50/50' 
                          : 'border-ink/10 bg-paper/30 opacity-60'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center font-bold font-mono text-sm border-2 ${
                        isCorrect ? 'border-green-600 text-green-700 bg-green-100' : 'border-ink/20 text-ink-pencil'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <div className={`flex-1 font-sans ${isCorrect ? 'text-green-900 font-medium' : 'text-ink'}`}>
                        {opt}
                      </div>
                      {isCorrect && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mb-6 p-4 border-2 border-green-600 bg-green-50/50 rounded-xl">
                <span className="block text-xs font-mono text-green-700 uppercase mb-2">Ideal Answer / Rubric:</span>
                <p className="font-sans text-green-900">{q.ideal_answer}</p>
              </div>
            )}

            {/* Explanation & Excerpt */}
            <div className="mt-6 pt-6 border-t-2 border-ink/10">
              <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border-2 border-blue-200">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold font-sans text-blue-900 mb-1">AI Explanation</h4>
                  <p className="text-sm font-sans text-blue-800/80 mb-4">{q.explanation}</p>
                  
                  <h4 className="text-sm font-bold font-sans text-blue-900 mb-1">Source Excerpt</h4>
                  <p className="text-sm font-serif italic text-blue-800/70">"{q.source_excerpt}"</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
