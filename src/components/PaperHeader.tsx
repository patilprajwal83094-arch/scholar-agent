import React from 'react';
import { PaperMeta } from '../types';
import { ExternalLink, Calendar, Users, Award, Github, BookOpen } from 'lucide-react';

interface PaperHeaderProps {
  paper: PaperMeta;
}

export const PaperHeader: React.FC<PaperHeaderProps> = ({ paper }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          {paper.arxivId && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
              arXiv:{paper.arxivId}
            </span>
          )}
          {paper.venue && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-950/70 border border-indigo-500/30 text-indigo-400 flex items-center gap-1">
              <Award className="w-3 h-3" />
              {paper.venue}
            </span>
          )}
          {paper.year && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {paper.year}
            </span>
          )}
        </div>

        {/* Paper Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight leading-snug">
          {paper.title}
        </h1>

        {/* Authors and Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="line-clamp-1">{paper.authors.join(', ')}</span>
          </div>

          <div className="flex items-center gap-3">
            {paper.githubReference && (
              <a
                href={paper.githubReference}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded-lg border border-slate-700 transition"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Reference Repo</span>
              </a>
            )}
            {paper.url && (
              <a
                href={paper.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition"
              >
                <span>Original Paper</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
