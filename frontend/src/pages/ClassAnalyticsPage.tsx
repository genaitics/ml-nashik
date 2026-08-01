import React, { useState } from 'react';
import { PageStep, StudentAnalyticsItem } from '../types';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Brain, 
  Lightbulb, 
  ArrowRight, 
  BarChart3,
  Flame,
  ChevronRight,
  Filter,
  Download
} from 'lucide-react';

interface ClassAnalyticsPageProps {
  onNavigate: (step: PageStep) => void;
  onUploadNew?: () => void;
}

const ROSTER: StudentAnalyticsItem[] = [];

export const ClassAnalyticsPage: React.FC<ClassAnalyticsPageProps> = ({
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('All');
  const [selectedCourse, setSelectedCourse] = useState('Introduction to Ethics - Section B');

  const filteredRoster = ROSTER.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'All' || student.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Banner Header matching Stitch layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-paper-surface p-6 rounded-2xl border-2 border-ink shadow-paper-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs uppercase bg-highlighter px-2.5 py-0.5 rounded text-ink font-bold border border-ink/20">
              📊 Class Analytics & RAG Diagnostics
            </span>
            <span className="text-xs font-mono text-ink-pencil">Fall Semester 2026</span>
          </div>
          <div className="flex items-center space-x-3 mt-2">
            <h1 className="font-serif text-3xl font-bold text-ink">
              Class Analytics
            </h1>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-paper-container border border-ink/20 rounded-lg px-3 py-1 text-xs font-serif text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-ink"
            >
              <option>Introduction to Ethics - Section B</option>
              <option>CS402 Machine Learning - Section A</option>
              <option>LING 302 Syntactic Structures</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center space-x-2 bg-highlighter hover:bg-highlighter-hover text-ink px-4 py-2 rounded-xl font-bold border-2 border-ink shadow-paper-sm transition text-xs"
          >
            <span>+ Upload Syllabus</span>
          </button>
          <button
            onClick={() => alert('Exporting Class Analytics PDF/CSV summary...')}
            className="flex items-center space-x-2 bg-paper-low hover:bg-paper-container text-ink px-3.5 py-2 rounded-xl font-semibold border border-ink/20 shadow-paper-sm transition text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top Stats Grid matching Stitch 3-card design */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Class Average */}
        <div className="bg-paper-surface p-6 rounded-2xl border-2 border-ink shadow-paper-sm margin-strip-green flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-ink-pencil font-semibold tracking-wider">
                Class Average
              </span>
              <span className="p-1.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline space-x-3 mt-3">
              <span className="font-serif text-4xl font-bold text-ink">84%</span>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>+3% vs last week</span>
              </span>
            </div>
          </div>
          <p className="text-xs font-sans text-ink-pencil mt-4 pt-3 border-t border-ink/10">
            4% higher than departmental benchmark
          </p>
        </div>

        {/* Card 2: Participation Rate */}
        <div className="bg-paper-surface p-6 rounded-2xl border-2 border-ink shadow-paper-sm margin-strip-yellow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-ink-pencil font-semibold tracking-wider">
                Participation Rate
              </span>
              <span className="p-1.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline space-x-3 mt-3">
              <span className="font-serif text-4xl font-bold text-ink">92%</span>
              <span className="text-xs font-mono bg-highlighter px-2 py-0.5 rounded text-ink border border-ink/20 font-bold">
                High Activity
              </span>
            </div>
          </div>
          <p className="text-xs font-sans text-ink-pencil mt-4 pt-3 border-t border-ink/10">
            24 / 26 active students took recent quizzes
          </p>
        </div>

        {/* Card 3: Avg Time Per Quiz */}
        <div className="bg-paper-surface p-6 rounded-2xl border-2 border-ink shadow-paper-sm margin-strip-green flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-ink-pencil font-semibold tracking-wider">
                Avg. Time per Quiz
              </span>
              <span className="p-1.5 bg-paper-container border border-ink/15 rounded-lg text-ink">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline space-x-3 mt-3">
              <span className="font-serif text-4xl font-bold text-ink">18m</span>
              <span className="text-xs font-mono text-ink-pencil bg-paper-container px-2 py-0.5 rounded border border-ink/15">
                Target: 15-20m
              </span>
            </div>
          </div>
          <p className="text-xs font-sans text-ink-pencil mt-4 pt-3 border-t border-ink/10">
            Consistent with optimal reflection pacing
          </p>
        </div>

      </section>

      {/* Class Grade Distribution Chart & Mastery Breakdown */}
      <section className="bg-paper-surface border-2 border-ink rounded-2xl p-6 shadow-paper-md space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-ink/15 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-ink flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-ink-muted" />
              <span>Class Grade Distribution</span>
            </h3>
            <p className="text-xs font-sans text-ink-pencil mt-0.5">
              Empirical score distribution across all RAG syllabus evaluations
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-emerald-500 rounded" /> <span>A (90-100%): 45%</span></span>
            <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-highlighter rounded" /> <span>B (80-89%): 35%</span></span>
            <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-amber-400 rounded" /> <span>C (70-79%): 15%</span></span>
            <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-rose-500 rounded" /> <span>D/F (&lt;70%): 5%</span></span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="space-y-3">
          <div className="w-full bg-paper-container h-8 rounded-xl border border-ink/20 overflow-hidden flex p-1 space-x-1 shadow-inner">
            <div className="bg-emerald-500 h-full rounded-lg text-[10px] font-mono font-bold text-white flex items-center justify-center transition-all hover:brightness-110" style={{ width: '45%' }}>
              45% (A Grade)
            </div>
            <div className="bg-highlighter h-full rounded-lg text-[10px] font-mono font-bold text-ink flex items-center justify-center transition-all hover:brightness-110" style={{ width: '35%' }}>
              35% (B)
            </div>
            <div className="bg-amber-400 h-full rounded-lg text-[10px] font-mono font-bold text-ink flex items-center justify-center transition-all hover:brightness-110" style={{ width: '15%' }}>
              15% (C)
            </div>
            <div className="bg-rose-500 h-full rounded-lg text-[10px] font-mono font-bold text-white flex items-center justify-center transition-all hover:brightness-110" style={{ width: '5%' }}>
              5%
            </div>
          </div>
        </div>
      </section>

      {/* Syllabus Mastery Heatmap matching Stitch 4-card grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-ink flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-600" />
              <span>Syllabus Topic Mastery Heatmap</span>
            </h3>
            <p className="text-xs text-ink-pencil">Real-time mastery levels across course modules</p>
          </div>
          <button className="text-ink font-bold text-xs border-b-2 border-ink pb-0.5 flex items-center space-x-1 hover:text-ink-light">
            <span>Full Syllabus View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Module 1 */}
          <div className="bg-paper-surface p-5 rounded-2xl border-2 border-ink shadow-paper-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-xs text-ink-pencil uppercase">Module 1</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="font-serif font-bold text-ink text-base mb-3">Moral Foundations</h4>
            <div className="w-full bg-paper-container h-2.5 rounded-full overflow-hidden border border-ink/10">
              <div className="bg-emerald-700 h-full rounded-full" style={{ width: '88%' }} />
            </div>
            <div className="flex justify-between mt-2 font-mono text-xs">
              <span className="font-semibold text-emerald-800">High Mastery</span>
              <span className="font-bold text-ink">88%</span>
            </div>
          </div>

          {/* Module 2 */}
          <div className="bg-paper-surface p-5 rounded-2xl border-2 border-ink shadow-paper-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-xs text-ink-pencil uppercase">Module 2</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="font-serif font-bold text-ink text-base mb-3">Deontology & Duties</h4>
            <div className="w-full bg-paper-container h-2.5 rounded-full overflow-hidden border border-ink/10">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '76%' }} />
            </div>
            <div className="flex justify-between mt-2 font-mono text-xs">
              <span className="font-semibold text-emerald-800">Healthy</span>
              <span className="font-bold text-ink">76%</span>
            </div>
          </div>

          {/* Module 3 */}
          <div className="bg-paper-surface p-5 rounded-2xl border-2 border-amber-400 shadow-paper-sm relative overflow-hidden bg-amber-50/20">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-xs text-amber-900 uppercase font-bold">Module 3</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="font-serif font-bold text-ink text-base mb-3">Virtue Ethics</h4>
            <div className="w-full bg-paper-container h-2.5 rounded-full overflow-hidden border border-ink/10">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: '68%' }} />
            </div>
            <div className="flex justify-between mt-2 font-mono text-xs">
              <span className="font-semibold text-amber-800">Approaching</span>
              <span className="font-bold text-ink">68%</span>
            </div>
          </div>

          {/* Module 4 (Low Mastery Alert Card) */}
          <div className="bg-paper-surface p-5 rounded-2xl border-2 border-rose-400 shadow-paper-sm relative overflow-hidden bg-rose-50/30">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-xs text-rose-800 uppercase font-bold">Module 4</span>
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
            </div>
            <h4 className="font-serif font-bold text-ink text-base mb-3">Utilitarianism</h4>
            <div className="w-full bg-paper-container h-2.5 rounded-full overflow-hidden border border-ink/10">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: '45%' }} />
            </div>
            <div className="flex justify-between mt-2 font-mono text-xs">
              <span className="font-bold text-rose-700">Low Mastery</span>
              <span className="font-bold text-rose-800">45%</span>
            </div>
            <div className="mt-3 pt-1 text-center text-[10px] text-rose-800 font-mono font-bold uppercase tracking-wider bg-rose-100 py-1 rounded border border-rose-200">
              🚨 Requires Class Intervention
            </div>
          </div>

        </div>
      </section>

      {/* Middle Row: Student Roster Table & Weak Topic Vulnerability AI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Student Roster Progress Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-serif text-xl font-bold text-ink">
              Roster Performance & Vulnerability Table
            </h3>
            
            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-pencil" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-paper border border-ink/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-ink"
                />
              </div>

              {/* Risk Filter */}
              <div className="flex items-center space-x-1 bg-paper-container p-1 rounded-lg border border-ink/15 text-xs font-mono">
                <Filter className="w-3.5 h-3.5 text-ink-pencil ml-1" />
                <button
                  onClick={() => setFilterRisk('All')}
                  className={`px-2 py-0.5 rounded font-semibold ${filterRisk === 'All' ? 'bg-ink text-paper' : 'text-ink-pencil'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterRisk('At Risk')}
                  className={`px-2 py-0.5 rounded font-semibold ${filterRisk === 'At Risk' ? 'bg-rose-600 text-white' : 'text-ink-pencil'}`}
                >
                  At Risk
                </button>
              </div>
            </div>
          </div>

          <div className="bg-paper-surface border-2 border-ink rounded-2xl overflow-hidden shadow-paper-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-paper-container/70 border-b border-ink/15 text-xs font-mono uppercase text-ink-pencil">
                    <th className="px-5 py-3 font-semibold">Student Name</th>
                    <th className="px-5 py-3 font-semibold">Avg Score</th>
                    <th className="px-5 py-3 font-semibold">Completed</th>
                    <th className="px-5 py-3 text-right">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10 text-sm font-sans">
                  {filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-xs font-mono text-ink-pencil italic">
                        No student data available yet. Student results will appear here after quiz submissions.
                      </td>
                    </tr>
                  ) : filteredRoster.map((student) => (
                    <tr key={student.id} className="hover:bg-paper-container/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono font-bold text-xs ${student.avatarColor}`}>
                            {student.initials}
                          </div>
                          <span className="font-semibold text-ink">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-sm font-bold text-ink">
                        {student.avgScore}%
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-ink-muted">
                        {student.completedQuizzes}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                          student.riskLevel === 'On Track'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : student.riskLevel === 'Needs Support'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-600 text-white shadow-sm font-bold'
                        }`}>
                          {student.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI Top Misconceptions & Weak Topic Vulnerabilities (Margin Note Card) */}
        <div className="lg:col-span-1">
          <div className="sticky-note p-6 rounded-2xl border-2 border-amber-300 shadow-paper-md space-y-4 relative transform rotate-1">
            <div className="flex items-center justify-between">
              <span className="bg-amber-300 text-amber-950 font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                💡 AI Tutor Insights
              </span>
              <Brain className="w-5 h-5 text-amber-900" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg text-amber-950 leading-tight">
                Weak Topic Vulnerabilities
              </h3>
              <p className="text-xs text-amber-900/80 italic mt-0.5">
                Aggregated syllabus RAG evaluation errors
              </p>
            </div>

            <div className="space-y-4 pt-1">
              
              {/* Vulnerability 1 */}
              <div className="bg-paper/80 p-3.5 rounded-xl border border-amber-400/50 space-y-1.5">
                <div className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-bold text-xs text-ink">Utilitarian Paternalism</span>
                </div>
                <p className="font-mono text-[11px] text-ink-pencil bg-paper-container p-2 rounded border border-ink/10 leading-relaxed italic">
                  "Students confuse Mill's Higher Pleasures with qualitative intellectual elitism."
                </p>
                <p className="text-[10px] font-mono text-ink-pencil pt-0.5">
                  Syllabus Ref: <span className="font-bold underline text-ink cursor-pointer">Section 4.2 Qualitative Hedonism</span>
                </p>
              </div>

              {/* Vulnerability 2 */}
              <div className="bg-paper/80 p-3.5 rounded-xl border border-amber-400/50 space-y-1.5">
                <div className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-bold text-xs text-ink">Deontological Rigidity</span>
                </div>
                <p className="font-mono text-[11px] text-ink-pencil bg-paper-container p-2 rounded border border-ink/10 leading-relaxed italic">
                  "Equating Kantian Categorical Imperative with legal compliance vs moral autonomy."
                </p>
                <p className="text-[10px] font-mono text-ink-pencil pt-0.5">
                  Syllabus Ref: <span className="font-bold underline text-ink cursor-pointer">Section 2.1 The Good Will</span>
                </p>
              </div>

            </div>

            <button
              onClick={() => onNavigate('upload')}
              className="w-full mt-2 bg-ink text-paper hover:bg-ink-light py-2.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider transition shadow-paper-sm flex items-center justify-center space-x-2"
            >
              <span>Adjust Lesson Plan & Re-quiz</span>
              <ArrowRight className="w-4 h-4 text-highlighter" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ClassAnalyticsPage;
