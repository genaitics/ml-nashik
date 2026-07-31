import React, { useEffect, useState } from 'react';
import { PageStep, StudentDashboardData } from '../types';
import { api } from '../api/client';
import { SourceExcerptModal } from '../components/SourceExcerptModal';
import { 
  GraduationCap, 
  Lightbulb, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  Award, 
  Loader2, 
  PlusCircle, 
  BookOpen,
  Sparkles,
  Search
} from 'lucide-react';

interface StudentDashboardPageProps {
  onNavigate: (step: PageStep) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({
  onNavigate,
}) => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state for Grounding Review
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState({
    title: '',
    question: '',
    excerpt: '',
    answer: ''
  });

  useEffect(() => {
    let isMounted = true;
    api.fetchStudentDashboard()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load student dashboard:', err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleOpenGroundingModal = (title: string, score: number) => {
    setSelectedTopic({
      title: `${title} (${score}% Mastery)`,
      question: `How does ${title} connect to the core syllabus concepts in Advanced Linguistics?`,
      excerpt: `Section 4.2 Phrase Structure Rules: Syntactic trees recursively decompose sentence nodes S -> NP VP. "Recursive elements in NP structures were frequently mislabeled as adjunctive instead of complement-based." Verified grounding established from primary course reader.`,
      answer: `Correctly identifying complement structures in phrase tree nodes with precise RAG citation.`
    });
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-ink-muted" />
        <p className="font-mono text-sm text-ink-pencil">Loading Student Portal Metrics...</p>
      </div>
    );
  }

  const focus = data?.currentFocus;
  const recentPerf = data?.recentPerformance || [];
  const upcoming = data?.upcomingQuizzes || [];
  const gpa = data?.gpaGoal;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-slide-fade">
      
      {/* Hero Welcome Card */}
      <div className="bg-paper-surface border-2 border-ink rounded-2xl p-8 shadow-paper-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-mono text-xs uppercase bg-highlighter px-2.5 py-0.5 rounded text-ink font-bold border border-ink/20">
              Academic Year 2024–2025
            </span>
            <span className="text-xs font-mono text-ink-pencil">Course: {data?.courseName || "Advanced Linguistics"}</span>
          </div>

          <h1 className="font-serif text-4xl font-bold text-ink mb-3 tracking-tight">
            Welcome back, <span className="highlighter-effect">{data?.studentName || "Alex"}.</span>
          </h1>

          <p className="font-sans text-base text-ink-pencil leading-relaxed mb-6">
            You've mastered <strong className="text-ink font-semibold">{data?.curriculumMasteryPct || 64}%</strong> of the "{data?.courseName || "Advanced Linguistics"}" curriculum. Your next focus should be on syntactic structures to improve your upcoming midterm score.
          </p>

          {/* Curriculum Mastery Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center font-mono text-xs text-ink-pencil">
              <span>Curriculum Mastery</span>
              <span className="font-bold text-ink">{data?.curriculumMasteryPct || 64}% Mastered</span>
            </div>
            <div className="w-full bg-paper-container h-3 rounded-full overflow-hidden border border-ink/15">
              <div 
                className="bg-ink h-full rounded-full transition-all duration-500"
                style={{ width: `${data?.curriculumMasteryPct || 64}%` }}
              />
            </div>
          </div>
        </div>

        {/* Decorative background icon */}
        <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
          <GraduationCap className="w-64 h-64 text-ink" />
        </div>
      </div>

      {/* Main Grid: Current Focus & Recent Performance vs Upcoming Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Focus & Performance */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Current Focus Area Card */}
          <div className="bg-paper-surface border-2 border-ink rounded-2xl p-6 shadow-paper-sm paper-margin-yellow space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-highlighter/50 rounded-lg border border-ink/20 text-ink">
                  <Lightbulb className="w-5 h-5 text-amber-900" />
                </div>
                <h3 className="font-serif text-xl font-bold text-ink">Current Focus Area</h3>
              </div>
              <span className="font-mono text-xs bg-highlighter px-2.5 py-1 rounded font-bold text-ink border border-ink/20">
                High Priority
              </span>
            </div>

            <div className="bg-paper p-5 rounded-xl border border-ink/15 space-y-3">
              <h4 className="font-serif font-bold text-lg text-ink">
                {focus?.moduleTitle || "Module 4.2: Phrase Structure Rules"}
              </h4>
              <p className="font-sans text-sm text-ink-pencil leading-relaxed">
                {focus?.description || "Based on your last quiz, you struggled with recursive tree diagrams. Reviewing this will boost your overall Syntactic Logic score."}
              </p>

              {/* Dashed Code / Area of Improvement Box */}
              <div className="bg-paper-container p-4 rounded-xl border-2 border-dashed border-ink/30 font-mono text-xs text-ink-light space-y-1">
                <span className="text-[10px] text-ink-pencil block font-bold">
                  // Area of Improvement: Syntax Trees
                </span>
                <p className="italic">
                  "{focus?.areaOfImprovement || "Recursive elements in NP structures were frequently mislabeled as adjunctive instead of complement-based."}"
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('quiz')}
                  className="bg-ink text-paper px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:bg-ink-light active:scale-95 transition-all shadow-paper-sm w-full md:w-auto"
                >
                  <span>Start Review Session</span>
                  <ArrowRight className="w-4 h-4 text-highlighter" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Performance Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-ink">Recent Performance</h3>
              <span className="text-xs font-mono text-ink-pencil">
                Last 3 Quiz Attempts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {recentPerf.map((item) => {
                const isHigh = item.score >= 80;
                return (
                  <div 
                    key={item.id}
                    className="bg-paper-surface border-2 border-ink rounded-xl p-5 shadow-paper-sm hover:border-ink transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-base text-ink">{item.title}</h4>
                          <p className="font-mono text-xs text-ink-pencil">{item.takenDate}</p>
                        </div>
                        <span className={`font-mono text-lg font-bold px-2.5 py-0.5 rounded border ${
                          isHigh 
                            ? 'bg-sage text-sage-deep border-sage-dark/30' 
                            : 'bg-highlighter text-ink border-ink/20'
                        }`}>
                          {item.score}%
                        </span>
                      </div>

                      {/* Mini Score Bar */}
                      <div className="w-full bg-paper-container h-2 rounded-full overflow-hidden border border-ink/10 my-3">
                        <div 
                          className={`h-full rounded-full ${isHigh ? 'bg-sage-dark' : 'bg-ink'}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenGroundingModal(item.title, item.score)}
                      className="flex items-center space-x-1.5 text-xs font-bold text-ink hover:text-ink-light pt-2 hover:underline"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sage-dark" />
                      <span>Review Grounding Citation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {/* View Full History Button Card */}
              <div 
                onClick={() => onNavigate('results')}
                className="bg-paper border-2 border-dashed border-ink/30 rounded-xl p-5 shadow-sm hover:bg-paper-container/50 transition-all flex flex-col items-center justify-center cursor-pointer text-center group min-h-[140px]"
              >
                <PlusCircle className="w-7 h-7 text-ink-pencil group-hover:text-ink mb-1 transition-colors" />
                <span className="font-mono text-xs font-bold uppercase text-ink group-hover:underline">
                  View Full History
                </span>
                <p className="text-[10px] font-sans text-ink-pencil mt-1">
                  Access all citations & attempt archives
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Upcoming & Goals */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upcoming Quizzes Widget */}
          <div className="bg-paper-surface border-2 border-ink rounded-2xl p-6 shadow-paper-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-ink flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-ink-muted" />
                <span>Upcoming Quizzes</span>
              </h3>
              <span className="text-[10px] font-mono bg-paper-container px-2 py-0.5 rounded text-ink-pencil border border-ink/15">
                Next 30 Days
              </span>
            </div>

            <div className="space-y-3">
              {upcoming.map((uq) => (
                <div key={uq.id} className="flex items-center space-x-3 p-2.5 bg-paper rounded-xl border border-ink/15">
                  <div className="w-11 h-11 bg-ink text-paper rounded-lg flex flex-col items-center justify-center shrink-0 border border-ink font-mono">
                    <span className="text-[9px] uppercase font-bold text-highlighter leading-none">
                      {uq.month}
                    </span>
                    <span className="text-sm font-bold leading-tight">
                      {uq.day}
                    </span>
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-xs text-ink truncate" title={uq.title}>
                      {uq.title}
                    </h4>
                    <p className="text-[10px] font-mono text-ink-pencil">
                      {uq.course}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('quiz')}
              className="w-full py-2 bg-paper hover:bg-paper-container border-2 border-ink rounded-xl font-bold text-xs text-ink transition-colors shadow-paper-sm"
            >
              View All Test Dates
            </button>
          </div>

          {/* GPA Goal Progress Card */}
          <div className="bg-paper-surface border-2 border-ink rounded-2xl p-6 shadow-paper-sm space-y-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-highlighter-hover" />
              <span className="font-mono text-xs font-bold uppercase text-ink">
                {gpa?.title || "Goal: Semester Honor Roll"}
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="font-serif text-4xl font-bold text-ink">
                {gpa?.currentGpa || 3.8}
              </span>
              <span className="text-xs font-mono text-ink-pencil">
                / {gpa?.targetGpa || 4.0} GPA Target
              </span>
            </div>

            <div className="w-full bg-paper-container h-2.5 rounded-full overflow-hidden border border-ink/15">
              <div 
                className="bg-highlighter-hover h-full rounded-full"
                style={{ width: `${gpa?.progressPct || 85}%` }}
              />
            </div>

            <p className="text-xs font-sans italic text-ink-pencil leading-relaxed pt-1">
              {gpa?.quote || '"Keep up the momentum! You\'re in the top 5% of your cohort."'}
            </p>
          </div>

          {/* Quick Action Chips / Hashtags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['#Grammar', '#Logic', '#SyllabusReview', '#StudyPlan'].map((tag) => (
              <span 
                key={tag}
                onClick={() => onNavigate('quiz')}
                className="px-3 py-1.5 bg-paper-surface hover:bg-highlighter/40 border border-ink/20 rounded-full font-mono text-xs text-ink font-semibold cursor-pointer transition-colors shadow-paper-sm"
              >
                {tag}
              </span>
            ))}
          </div>

        </div>

      </div>

      {/* Grounding Citation Modal */}
      <SourceExcerptModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        topic={selectedTopic.title}
        questionText={selectedTopic.question}
        sourceExcerpt={selectedTopic.excerpt}
        correctAnswerText={selectedTopic.answer}
      />

    </div>
  );
};

export default StudentDashboardPage;
