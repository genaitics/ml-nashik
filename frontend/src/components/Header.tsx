import React, { useState, useEffect } from 'react';
import { PageStep, UserRole, DocumentUploadResponse, Quiz, EvaluationResult, AIModelChoice } from '../types';
import { api } from '../api/client';
import { 
  BookOpen, 
  FileCheck, 
  HelpCircle, 
  Award, 
  Sparkles, 
  LayoutDashboard,
  BarChart3,
  Settings,
  Key,
  Eye,
  EyeOff,
  X,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  currentStep: PageStep;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigate: (step: PageStep) => void;
  documentData: DocumentUploadResponse | null;
  quizData: Quiz | null;
  evaluationData: EvaluationResult | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  userRole,
  onRoleChange,
  onNavigate,
  documentData,
  quizData,
  evaluationData,
}) => {
  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModelChoice>('Gemma 4 (Google GenAI)');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load initial settings on mount
  useEffect(() => {
    const saved = api.getAISettings();
    if (saved) {
      setSelectedModel(saved.model || 'Gemma 4 (Google GenAI)');
      setApiKey(saved.apiKey || '');
    }
  }, []);

  const handleSaveSettings = () => {
    api.saveAISettings({
      model: selectedModel,
      apiKey: apiKey.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSettingsOpen(false);
    }, 1200);
  };

  return (
    <header className="bg-paper-surface border-b-2 border-ink sticky top-0 z-30 shadow-paper-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 md:py-0 md:h-20 gap-3 md:gap-0">
          
          {/* Logo & Brand Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => onNavigate(userRole === 'teacher' ? 'teacher-dashboard' : 'student-dashboard')}
          >
            <div className="w-11 h-11 bg-ink text-paper flex items-center justify-center rounded-lg shadow-paper-sm border border-ink">
              <BookOpen className="w-6 h-6 text-highlighter" />
            </div>
            <div>
              <span className="font-serif font-bold text-2xl text-ink tracking-tight">
                Pariksha <span className="text-ink font-light">AI</span>
              </span>
            </div>
          </div>

          {/* Center Action Group: Role Switcher */}
          <div className="flex items-center space-x-2">
            
            {/* Role Switcher Pill */}
            <div className="flex items-center bg-paper-container p-1 rounded-xl border border-ink/20 shadow-inner">
              <button
                onClick={() => {
                  onRoleChange('teacher');
                  if (currentStep !== 'teacher-dashboard') onNavigate('teacher-dashboard');
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  userRole === 'teacher'
                    ? 'bg-highlighter text-ink shadow-paper-sm border border-ink/30'
                    : 'text-ink-pencil hover:text-ink hover:bg-paper-surface/60'
                }`}
              >
                <span>👨‍🏫 Teacher</span>
              </button>

              <button
                onClick={() => {
                  onRoleChange('student');
                  if (currentStep !== 'student-dashboard') onNavigate('student-dashboard');
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  userRole === 'student'
                    ? 'bg-highlighter text-ink shadow-paper-sm border border-ink/30'
                    : 'text-ink-pencil hover:text-ink hover:bg-paper-surface/60'
                }`}
              >
                <span>🎓 Student</span>
              </button>
            </div>



            {/* 🔑 Settings Modal Trigger Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-paper-container hover:bg-paper-surface text-ink rounded-xl border border-ink/20 shadow-paper-sm transition-all"
              title="AI Model & Key Settings"
            >
              <Settings className="w-4 h-4 text-ink" />
            </button>

          </div>

          {/* Dynamic Navigation Tabs based on Active Role */}
          <nav className="flex items-center space-x-1 bg-paper-container p-1 rounded-xl border border-ink/15 overflow-x-auto custom-scrollbar">
            
            {userRole === 'teacher' ? (
              <>
                {/* Teacher Nav 1: Dashboard */}
                <button
                  onClick={() => onNavigate('teacher-dashboard')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    currentStep === 'teacher-dashboard'
                      ? 'bg-ink text-paper shadow-paper-sm'
                      : 'text-ink-muted hover:text-ink hover:bg-paper-surface/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                {/* Teacher Nav 2: Analytics (Stitch Screen 9267c1b28ef54830bcdeaddb6b22e4ce) */}
                <button
                  onClick={() => onNavigate('class-analytics')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    currentStep === 'class-analytics'
                      ? 'bg-ink text-paper shadow-paper-sm'
                      : 'text-ink-muted hover:text-ink hover:bg-paper-surface/60'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-highlighter" />
                  <span>Analytics</span>
                </button>

                {/* Teacher Nav 3: Syllabi Upload */}
                <button
                  onClick={() => onNavigate('upload')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    currentStep === 'upload'
                      ? 'bg-ink text-paper shadow-paper-sm'
                      : 'text-ink-muted hover:text-ink hover:bg-paper-surface/60'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Syllabi Upload</span>
                  {documentData && (
                    <span className="w-2 h-2 rounded-full bg-sage-dark animate-pulse" />
                  )}
                </button>

                {/* Teacher Nav 4: Quiz Generator */}
                <button
                  onClick={() => quizData && onNavigate('quiz')}
                  disabled={!quizData}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    currentStep === 'quiz'
                      ? 'bg-ink text-paper shadow-paper-sm'
                      : quizData
                      ? 'text-ink-muted hover:text-ink hover:bg-paper-surface/60'
                      : 'text-ink-pencil/40 cursor-not-allowed'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Quiz Generator</span>
                </button>

                {/* Teacher Nav 5: Class Results */}
                <button
                  onClick={() => evaluationData && onNavigate('results')}
                  disabled={!evaluationData}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    currentStep === 'results'
                      ? 'bg-ink text-paper shadow-paper-sm'
                      : evaluationData
                      ? 'text-ink-muted hover:text-ink hover:bg-paper-surface/60'
                      : 'text-ink-pencil/40 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Class Results</span>
                </button>
              </>
            ) : (
              <>
                {/* Student Nav 1: Dashboard */}
                <button
                  onClick={() => onNavigate('student-dashboard')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    currentStep === 'student-dashboard'
                      ? 'bg-ink text-paper shadow-paper-sm'
                      : 'text-ink-muted hover:text-ink hover:bg-paper-surface/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                {/* Student Nav 2: My Courses */}
                <button
                  onClick={() => onNavigate('my-courses')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    currentStep === 'my-courses' || currentStep === 'upload'
                      ? 'bg-ink text-paper shadow-paper-sm'
                      : 'text-ink-muted hover:text-ink hover:bg-paper-surface/60'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>My Courses</span>
                </button>

                {/* Student Nav 3: Quiz Attempt */}
                <button
                  onClick={() => quizData && onNavigate('quiz')}
                  disabled={!quizData}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    currentStep === 'quiz'
                      ? 'bg-ink text-paper shadow-paper-sm'
                      : quizData
                      ? 'text-ink-muted hover:text-ink hover:bg-paper-surface/60'
                      : 'text-ink-pencil/40 cursor-not-allowed'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Quiz Attempt</span>
                </button>

                {/* Student Nav 4: Progress & Citation */}
                <button
                  onClick={() => evaluationData && onNavigate('results')}
                  disabled={!evaluationData}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    currentStep === 'results'
                      ? 'bg-ink text-paper shadow-paper-sm'
                      : evaluationData
                      ? 'text-ink-muted hover:text-ink hover:bg-paper-surface/60'
                      : 'text-ink-pencil/40 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Progress & Citation</span>
                </button>

                {/* Student Nav 5: Q&A Chat */}
                <button
                  onClick={() => documentData && onNavigate('chat')}
                  disabled={!documentData}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    currentStep === 'chat'
                      ? 'bg-ink text-paper shadow-paper-sm'
                      : documentData
                      ? 'text-ink-muted hover:text-ink hover:bg-paper-surface/60'
                      : 'text-ink-pencil/40 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Q&A Chat</span>
                </button>
              </>
            )}

          </nav>

        </div>
      </div>

      {/* 🔑 AI Model & Key Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-paper-surface border-2 border-ink rounded-2xl max-w-lg w-full p-6 shadow-paper-lg space-y-6 relative animate-slide-fade">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-ink/15 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-highlighter text-ink rounded-xl border border-ink flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-ink">
                    🔑 AI Model & Key Settings
                  </h3>
                  <p className="text-xs font-sans text-ink-pencil">Configure Google GenAI models and custom API credentials</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg hover:bg-paper-container text-ink-pencil hover:text-ink transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Model Selection Radios */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-ink-pencil block">
                Select Active Model
              </label>

              <div className="space-y-2">
                {[
                  { name: 'Gemma 4 (Google GenAI)', desc: 'Optimized local/open model for fast grounding & syllabus indexing', recommended: true },
                  { name: 'Gemini 1.5 Flash', desc: 'Ultra-low latency Google GenAI model for live quizzes', recommended: false },
                  { name: 'Gemini 2.5 Flash', desc: 'Next-gen reasoning engine with 1M context window', recommended: false },
                ].map((m) => (
                  <div 
                    key={m.name}
                    onClick={() => setSelectedModel(m.name as AIModelChoice)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                      selectedModel === m.name
                        ? 'bg-highlighter/30 border-ink shadow-paper-sm'
                        : 'bg-paper border-ink/15 hover:border-ink/40'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="modelChoice" 
                      checked={selectedModel === m.name}
                      onChange={() => setSelectedModel(m.name as AIModelChoice)}
                      className="mt-1 accent-ink"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-ink">{m.name}</span>
                        {m.recommended && (
                          <span className="text-[10px] font-mono bg-ink text-paper px-2 py-0.5 rounded font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-sans text-ink-pencil mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom API Key Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-ink-pencil block">
                Custom Google GenAI API Key (Optional)
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 bg-paper border border-ink/30 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-pencil hover:text-ink"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] font-mono text-ink-pencil">
                Saved securely in browser localStorage. Leave empty to use system default.
              </p>
            </div>

            {/* Save Status Toast */}
            {saveSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-400 rounded-xl flex items-center space-x-2 text-emerald-900 text-xs font-mono font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Settings saved to localStorage successfully!</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-ink/15">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-paper-low hover:bg-paper-container text-ink rounded-lg font-medium text-xs font-mono transition border border-ink/20"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-ink text-paper hover:bg-ink-light rounded-lg font-mono text-xs font-bold transition shadow-paper-sm"
              >
                Save Settings
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};

export default Header;
