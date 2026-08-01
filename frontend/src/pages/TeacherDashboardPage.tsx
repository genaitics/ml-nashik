import React, { useEffect, useState } from 'react';
import { PageStep, TeacherDashboardData } from '../types';
import { api } from '../api/client';
import { 
  Sparkles, 
  Upload, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  TrendingUp, 
  Lightbulb, 
  BookOpen, 
  CheckSquare, 
  AlignLeft, 
  PenTool, 
  Users, 
  MoreVertical,
  ArrowUpRight
} from 'lucide-react';

interface TeacherDashboardPageProps {
  onNavigate: (step: PageStep) => void;
  onUploadNew: () => void;
}

export const TeacherDashboardPage: React.FC<TeacherDashboardPageProps> = ({
  onNavigate,
  onUploadNew,
}) => {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Quick Quiz Architect state
  const [selectedFormats, setSelectedFormats] = useState({
    mcq: false,
    shortAnswer: true,
    longForm: false,
  });

  useEffect(() => {
    let isMounted = true;
    api.fetchTeacherDashboard()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load teacher dashboard:', err);
        if (isMounted) {
          setLoading(false);
          setError(true);
        }
      });
    return () => { isMounted = false; };
  }, []);

  const toggleFormat = (key: 'mcq' | 'shortAnswer' | 'longForm') => {
    setSelectedFormats((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-ink-muted" />
        <p className="font-mono text-sm text-ink-pencil">Loading Teacher Portal Metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4 text-center">
        <p className="font-serif text-2xl font-bold text-ink">No Data Yet</p>
        <p className="font-sans text-sm text-ink-pencil max-w-md">
          Connect your backend to load real class metrics, or upload a syllabus to get started.
        </p>
        <button
          onClick={onUploadNew}
          className="flex items-center space-x-2 bg-highlighter text-ink px-5 py-2.5 rounded-xl font-bold border-2 border-ink shadow-paper-sm hover:brightness-105 transition-all text-sm"
        >
          <Upload className="w-4 h-4" />
          <span>Upload First Syllabus</span>
        </button>
      </div>
    );
  }

  const overview = data?.classOverview;
  const syllabi = data?.syllabi || [];
  const recentQuizzes = data?.recentQuizzes || [];
  const insight = data?.insight;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-slide-fade">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-paper-surface p-6 rounded-2xl border-2 border-ink shadow-paper-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs uppercase bg-highlighter px-2 py-0.5 rounded text-ink font-bold border border-ink/20">
              Faculty Portal
            </span>
            <span className="text-xs font-mono text-ink-pencil">Academic Year 2024–2025</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-ink mt-1">
            Welcome, Prof. Aris
          </h1>
          <p className="text-sm font-sans text-ink-pencil mt-1">
            AI Syllabus-to-Quiz Insights & Class Diagnostics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onUploadNew}
            className="flex items-center space-x-2 bg-highlighter text-ink px-5 py-2.5 rounded-xl font-bold border-2 border-ink shadow-paper-sm hover:brightness-105 active:translate-y-0.5 transition-all text-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Syllabus</span>
          </button>
        </div>
      </div>

      {/* Hero Grid: Class Overview & Quick Quiz Architect */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Class Overview Card */}
        <div className="lg:col-span-1 bg-paper-surface border-2 border-ink rounded-2xl p-6 flex flex-col justify-between shadow-paper-sm relative overflow-hidden paper-margin-left">
          <div>
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs uppercase text-ink-pencil font-semibold tracking-wider">
                CLASS OVERVIEW
              </span>
              <span className="p-1.5 bg-paper-container rounded-lg border border-ink/15 text-ink">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-ink mt-2">
              {overview?.className || "Introduction to Ethics"}
            </h3>
            <p className="text-xs font-sans text-ink-pencil mt-0.5">
              {overview?.section || "Section B"} • {overview?.activeStudents || 32} Active Students
            </p>
          </div>

          <div className="my-6">
            <div className="flex items-baseline space-x-3">
              <span className="font-serif text-5xl font-bold text-ink">
                {overview?.avgScore || 84}%
              </span>
              <span className="text-xs font-mono font-bold text-sage-deep bg-sage px-2 py-0.5 rounded border border-sage-dark/20 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 inline" />
                <span>{overview?.scoreChange || "+3% vs last week"}</span>
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 w-full bg-paper-container h-2.5 rounded-full overflow-hidden border border-ink/10">
              <div 
                className="bg-ink h-full rounded-full transition-all duration-500"
                style={{ width: `${overview?.avgScore || 84}%` }}
              />
            </div>
          </div>

          <p className="text-xs font-sans text-ink-pencil italic leading-relaxed bg-paper-container/50 p-3 rounded-lg border border-ink/10">
            "{overview?.engagementMetric || "Student engagement with AI-generated feedback has increased by 12%."}"
          </p>
        </div>

        {/* Quick Quiz Architect Card */}
        <div className="lg:col-span-2 bg-paper-surface border-2 border-ink rounded-2xl p-6 shadow-paper-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-serif text-xl font-bold text-ink">Quick Quiz Architect</h3>
                  <Sparkles className="w-5 h-5 text-sage-dark animate-pulse" />
                </div>
                <p className="text-xs font-sans text-ink-pencil mt-0.5">
                  Select question formats to auto-generate from analyzed syllabi.
                </p>
              </div>
              <span className="text-xs font-mono bg-highlighter px-2.5 py-1 rounded font-bold text-ink border border-ink/20">
                AI Prompt Ready
              </span>
            </div>

            {/* Checkbox format options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              
              <label 
                onClick={() => toggleFormat('mcq')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  selectedFormats.mcq 
                    ? 'bg-highlighter/30 border-ink shadow-paper-sm' 
                    : 'bg-paper border-ink/20 hover:border-ink/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CheckSquare className={`w-5 h-5 ${selectedFormats.mcq ? 'text-ink' : 'text-ink-pencil'}`} />
                  <span className="text-[10px] font-mono bg-paper-container px-1.5 py-0.5 rounded text-ink-pencil">
                    10-20 Qs
                  </span>
                </div>
                <div>
                  <span className="font-bold text-sm text-ink block">Multiple Choice</span>
                  <p className="text-xs text-ink-pencil mt-1 leading-snug">
                    Broad knowledge & topic recall assessment.
                  </p>
                </div>
              </label>

              <label 
                onClick={() => toggleFormat('shortAnswer')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  selectedFormats.shortAnswer 
                    ? 'bg-highlighter/30 border-ink shadow-paper-sm' 
                    : 'bg-paper border-ink/20 hover:border-ink/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <AlignLeft className={`w-5 h-5 ${selectedFormats.shortAnswer ? 'text-ink' : 'text-ink-pencil'}`} />
                  <span className="text-[10px] font-mono bg-paper-container px-1.5 py-0.5 rounded text-ink-pencil">
                    3-5 Qs
                  </span>
                </div>
                <div>
                  <span className="font-bold text-sm text-ink block">Short Answer</span>
                  <p className="text-xs text-ink-pencil mt-1 leading-snug">
                    Module-grounded definitions & citations.
                  </p>
                </div>
              </label>

              <label 
                onClick={() => toggleFormat('longForm')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  selectedFormats.longForm 
                    ? 'bg-highlighter/30 border-ink shadow-paper-sm' 
                    : 'bg-paper border-ink/20 hover:border-ink/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <PenTool className={`w-5 h-5 ${selectedFormats.longForm ? 'text-ink' : 'text-ink-pencil'}`} />
                  <span className="text-[10px] font-mono bg-paper-container px-1.5 py-0.5 rounded text-ink-pencil">
                    1-2 Prompts
                  </span>
                </div>
                <div>
                  <span className="font-bold text-sm text-ink block">Long Form</span>
                  <p className="text-xs text-ink-pencil mt-1 leading-snug">
                    Critical thinking & synthesis essay prompts.
                  </p>
                </div>
              </label>

            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-ink/15">
            <div className="flex items-center space-x-2 text-xs font-mono text-ink-pencil">
              <BookOpen className="w-4 h-4 text-ink-muted" />
              <span>Targeting: CS402 Ethics Syllabus</span>
            </div>

            <button
              onClick={() => onNavigate('upload')}
              className="bg-ink text-paper px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-ink-light active:scale-95 transition-all text-sm shadow-paper-sm"
            >
              <span>Draft Quiz Draft</span>
              <ArrowRight className="w-4 h-4 text-highlighter" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Table & Sticky Notes Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Syllabi Table */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-serif text-xl font-bold text-ink">Academic Syllabi</h3>
              <span className="text-xs font-mono bg-paper-container px-2 py-0.5 rounded font-bold text-ink-pencil border border-ink/15">
                {syllabi.length} Files
              </span>
            </div>
            <button 
              onClick={onUploadNew}
              className="text-ink font-bold text-xs flex items-center space-x-1 hover:underline"
            >
              <span>Upload New</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-paper-surface border-2 border-ink rounded-2xl overflow-hidden shadow-paper-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-paper-container/70 border-b border-ink/15 text-xs font-mono uppercase text-ink-pencil">
                    <th className="px-6 py-3 font-semibold">Document Name</th>
                    <th className="px-6 py-3 font-semibold">Modules</th>
                    <th className="px-6 py-3 font-semibold">Last Modified</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10 text-sm font-sans">
                  {syllabi.map((s) => (
                    <tr key={s.id} className="hover:bg-paper-container/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-paper-container rounded-lg border border-ink/15 text-ink">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-ink">{s.name}</p>
                            <p className="text-xs font-mono text-ink-pencil">{s.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-ink-muted">
                        {s.modules}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-ink-pencil">
                        {s.lastModified}
                      </td>
                      <td className="px-6 py-4">
                        {s.status === 'Analyzed' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-sage text-sage-deep rounded-md font-mono text-xs font-bold border border-sage-dark/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Analyzed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md font-mono text-xs font-bold border border-amber-300">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => onNavigate('upload')}
                          className="text-ink-pencil hover:text-ink p-1.5 rounded-lg hover:bg-paper-container transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Column: Sticky Note & Recent Quizzes */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Sticky Note Insight Card */}
          <div className="sticky-note p-5 rounded-xl border border-amber-300 shadow-paper-sm space-y-3">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-amber-700" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-900">
                INSIGHT
              </span>
            </div>
            <p className="text-xs font-sans text-amber-950 leading-relaxed">
              {insight?.text || "Student performance in Module 4: Utilitarianism is 15% lower than average."}
            </p>
            <button
              onClick={() => onNavigate('upload')}
              className="w-full py-2 bg-amber-200/80 hover:bg-amber-300 text-amber-950 rounded-lg font-bold text-xs border border-amber-400 transition-colors shadow-sm"
            >
              Generate Focused Quiz
            </button>
          </div>

          {/* Source Excerpt Card */}
          <div className="bg-paper p-4 rounded-xl border-2 border-dashed border-ink/30 space-y-2">
            <span className="font-mono text-[10px] font-bold uppercase text-ink-pencil block">
              SOURCE EXCERPT
            </span>
            <blockquote className="font-mono text-xs text-ink-light bg-paper-container/50 p-2.5 rounded border border-ink/10 leading-relaxed italic">
              {insight?.sourceExcerpt || '"Utilitarianism posits that the moral course of action is the one that maximizes overall happiness..."'}
            </blockquote>
            <div className="text-right">
              <span className="text-[10px] font-mono text-ink-pencil italic">
                {insight?.sourceCitation || "— Philosophy Syllabus, p. 24"}
              </span>
            </div>
          </div>

          {/* Recent Quizzes List */}
          <div className="bg-paper-surface border-2 border-ink rounded-2xl p-5 shadow-paper-sm space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-pencil">
              RECENT QUIZZES
            </h4>
            <div className="space-y-3 divide-y divide-ink/10">
              {recentQuizzes.map((rq) => (
                <div 
                  key={rq.id}
                  onClick={() => onNavigate('results')}
                  className="pt-2 first:pt-0 flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-ink group-hover:underline">
                      {rq.title}
                    </p>
                    <p className="text-[10px] font-mono text-ink-pencil mt-0.5">
                      {rq.date} • {rq.completions} completions
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-ink bg-highlighter/60 px-2 py-0.5 rounded border border-ink/20">
                    {rq.avgScore}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default TeacherDashboardPage;
