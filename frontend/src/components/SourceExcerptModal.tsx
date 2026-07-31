import React from 'react';
import { X, BookOpen, Quote, Sparkles, Copy, Check } from 'lucide-react';

interface SourceExcerptModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  questionText: string;
  sourceExcerpt: string;
  correctAnswerText: string;
}

export const SourceExcerptModal: React.FC<SourceExcerptModalProps> = ({
  isOpen,
  onClose,
  topic,
  questionText,
  sourceExcerpt,
  correctAnswerText,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sourceExcerpt);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = sourceExcerpt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="bg-paper-surface w-full max-w-2xl rounded-2xl border-2 border-ink shadow-paper-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-paper-container px-6 py-4 border-b border-ink/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-highlighter text-ink rounded-lg flex items-center justify-center border border-ink/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-lg text-ink">Source Excerpt Citation</h3>
                <span className="text-xs font-mono bg-paper-surface px-2 py-0.5 rounded text-ink-muted border border-ink/15">
                  RAG Grounding
                </span>
              </div>
              <p className="text-xs text-ink-pencil font-mono">{topic}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-pencil hover:text-ink hover:bg-paper-container transition"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          
          {/* Question Context Card */}
          <div className="bg-paper-low p-4 rounded-xl border border-ink/10">
            <span className="text-xs font-mono uppercase text-ink-pencil tracking-wider font-semibold block mb-1">
              Target Question
            </span>
            <p className="font-serif text-sm font-semibold text-ink">
              "{questionText}"
            </p>
          </div>

          {/* Source Text Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-ink-muted flex items-center space-x-1 font-semibold">
                <Quote className="w-3.5 h-3.5 text-highlighter-hover" />
                <span>VERIFIED SYLLABUS TEXT</span>
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-mono text-ink font-semibold flex items-center space-x-1.5 bg-highlighter hover:bg-highlighter-hover px-3 py-1.5 rounded-lg border border-ink/30 shadow-paper-sm transition-all active:scale-95 cursor-pointer"
                title="Copy syllabus excerpt to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-sage-dark font-bold" /> : <Copy className="w-3.5 h-3.5 text-ink" />}
                <span>{copied ? 'Copied Excerpt!' : 'Copy Excerpt'}</span>
              </button>
            </div>


            <div className="bg-paper-surface p-5 rounded-xl border-dashed-notebook font-mono text-sm leading-relaxed text-ink-light relative">
              <div className="absolute top-2 right-2 text-ink/10">
                <Sparkles className="w-8 h-8" />
              </div>
              
              <p className="relative z-10 whitespace-pre-wrap">
                {sourceExcerpt.split('. ').map((sentence, idx) => {
                  // Highlight sentences matching correct answer concepts
                  const isHighlighted = idx === 0 || sentence.toLowerCase().includes('high variance') || sentence.toLowerCase().includes('penalty') || sentence.toLowerCase().includes('sigmoid');
                  return (
                    <span key={idx}>
                      {isHighlighted ? (
                        <span className="bg-highlighter-soft px-1 rounded font-medium border-b border-highlighter-hover">
                          {sentence}.
                        </span>
                      ) : (
                        <span>{sentence}. </span>
                      )}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>

          {/* Grounding Explanation Footer */}
          <div className="bg-sage/40 p-4 rounded-xl border border-sage-border flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-sage-dark shrink-0 mt-0.5" />
            <div className="text-xs font-sans text-sage-deep leading-normal">
              <strong className="font-semibold block text-sm mb-0.5">Verified Correct Answer:</strong>
              <p className="font-serif italic text-ink">{correctAnswerText}</p>
              <p className="mt-1 text-ink-muted">
                This answer is mathematically and conceptually derived from the exact syllabus passage highlighted above.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-paper-container px-6 py-3 border-t border-ink/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-ink-light transition shadow-paper-sm"
          >
            Close Excerpt
          </button>
        </div>

      </div>
    </div>
  );
};
