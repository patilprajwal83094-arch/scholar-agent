import React, { useState } from 'react';
import { CoreConcept } from '../types';
import { BookOpen, CheckCircle2, Copy, Check, Lightbulb, Binary, Target } from 'lucide-react';

interface CoreConceptViewProps {
  coreConcept: CoreConcept;
  paperTitle: string;
}

export const CoreConceptView: React.FC<CoreConceptViewProps> = ({ coreConcept, paperTitle }) => {
  const [copied, setCopied] = useState(false);

  // Compute word count dynamically if not provided or to verify
  const words = coreConcept.fullSummary
    ? coreConcept.fullSummary.trim().split(/\s+/).length
    : (coreConcept.problemStatement + ' ' + coreConcept.primaryMethodology + ' ' + coreConcept.mathematicalBreakthroughs).trim().split(/\s+/).length;

  const isUnder300Words = words <= 300;

  const handleCopySummary = async () => {
    const text = `CORE CONCEPT EXTRACTION: ${paperTitle}\n\nProblem Statement:\n${coreConcept.problemStatement}\n\nPrimary Methodology:\n${coreConcept.primaryMethodology}\n\nMathematical & Algorithmic Breakthroughs:\n${coreConcept.mathematicalBreakthroughs}\n\nSummary:\n${coreConcept.fullSummary}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Step 1: Core Concept Extraction
            </h3>
            <p className="text-xs text-slate-400">
              High-efficiency distillation in plain, accessible language
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Word Count Constraint Compliance Pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
            isUnder300Words 
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{words} words</span>
            <span className="text-[10px] text-slate-400">(&lt; 300 words limit)</span>
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Synthesis'}
          </button>
        </div>
      </div>

      {/* Main accessible synthesis narrative */}
      <div className="p-6">
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-6 text-slate-200 text-sm leading-relaxed">
          <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-1.5">
            Synthesis in Accessible Terms
          </div>
          <p>{coreConcept.fullSummary}</p>
        </div>

        {/* 3 Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Problem Statement */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-rose-950/20 to-slate-900/60 border border-rose-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="p-1 rounded bg-rose-500/20 text-rose-400">
                  <Target className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  1. Problem Statement
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {coreConcept.problemStatement}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-rose-900/20 text-[11px] text-rose-400/80 font-mono">
              Core Bottleneck & Motivation
            </div>
          </div>

          {/* 2. Primary Methodology */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-cyan-950/20 to-slate-900/60 border border-cyan-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  2. Primary Methodology
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {coreConcept.primaryMethodology}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-cyan-900/20 text-[11px] text-cyan-400/80 font-mono">
              Architecture & Technique
            </div>
          </div>

          {/* 3. Mathematical & Algorithmic Breakthroughs */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-amber-950/20 to-slate-900/60 border border-amber-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                  <Binary className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  3. Mathematical Breakthroughs
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {coreConcept.mathematicalBreakthroughs}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-amber-900/20 text-[11px] text-amber-400/80 font-mono">
              Mathematical Foundation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
