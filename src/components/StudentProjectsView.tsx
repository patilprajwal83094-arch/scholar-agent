import React, { useState } from 'react';
import { StudentOpportunity } from '../types';
import { Sparkles, Briefcase, Cpu, Gauge, Layers, Copy, Check, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface StudentProjectsViewProps {
  opportunities: StudentOpportunity[];
  paperTitle: string;
}

export const StudentProjectsView: React.FC<StudentProjectsViewProps> = ({ opportunities, paperTitle }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(opportunities[0]?.id || 1);

  const handleCopyBullet = async (id: number, bullet: string) => {
    try {
      await navigator.clipboard.writeText(bullet);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400';
      case 'Intermediate':
        return 'bg-sky-950/60 border-sky-500/30 text-sky-400';
      case 'Advanced':
        return 'bg-purple-950/60 border-purple-500/30 text-purple-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Step 3: Future Work & 3rd-Year CS Student Internship Opportunities
            </h3>
            <p className="text-xs text-slate-400">
              3 concrete, realistic extensions optimized for SWE & AI research resumes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            {opportunities.length} Actionable Projects
          </span>
        </div>
      </div>

      {/* Projects List */}
      <div className="p-6 space-y-5">
        {opportunities.map((proj, idx) => {
          const isExpanded = expandedId === proj.id;
          return (
            <div
              key={proj.id || idx}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-slate-950/90 border-cyan-500/40 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-500/20'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : proj.id)}
                className="p-4 cursor-pointer flex items-center justify-between gap-4 select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 text-xs font-mono font-bold text-cyan-400 border border-slate-700">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300">
                      {proj.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {proj.expectedContribution}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${getDifficultyBadge(proj.difficulty)}`}>
                    {proj.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    ~{proj.estimatedWeeks || 3} wks
                  </span>
                  <button className="p-1 text-slate-400 hover:text-slate-200">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 space-y-4 text-xs">
                  {/* The 3 Core Requirements: Contribution, Metric, Tech Stack */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                    {/* Expected Contribution */}
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-cyan-400 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Expected Contribution
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {proj.expectedContribution}
                      </p>
                    </div>

                    {/* Targeted Performance Metric */}
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-emerald-400 mb-1.5">
                        <Gauge className="w-3.5 h-3.5" />
                        Targeted Performance Metric
                      </div>
                      <p className="text-slate-300 leading-relaxed font-mono">
                        {proj.targetedPerformanceMetric}
                      </p>
                    </div>

                    {/* Recommended Tech Stack */}
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-indigo-400 mb-1.5">
                        <Cpu className="w-3.5 h-3.5" />
                        Recommended Tech Stack
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {proj.recommendedTechStack.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 rounded font-mono text-[11px]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Implementation Roadmap */}
                  {proj.implementationPlan && proj.implementationPlan.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        Execution Roadmap & Milestones
                      </div>
                      <ol className="space-y-1.5 pl-4 list-decimal list-outside text-slate-300 leading-relaxed">
                        {proj.implementationPlan.map((step, sIdx) => (
                          <li key={sIdx} className="pl-1">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Resume Bullet Point Generator (STAR Format) */}
                  <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        Resume Ready Impact Bullet (STAR Format)
                      </span>
                      <button
                        onClick={() => handleCopyBullet(proj.id, proj.resumeBullet)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 rounded border border-emerald-500/40 transition"
                      >
                        {copiedId === proj.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-300" />
                            <span>Copied to Clipboard</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Bullet</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/80 font-mono text-[11px] text-emerald-200/90 border border-emerald-900/30 leading-relaxed">
                      {proj.resumeBullet}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
