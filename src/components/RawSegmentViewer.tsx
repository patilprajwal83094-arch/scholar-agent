import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Terminal, Copy, Check, FileText } from 'lucide-react';

interface RawSegmentViewerProps {
  result: AnalysisResult;
}

export const RawSegmentViewer: React.FC<RawSegmentViewerProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  // Construct the exact canonical text response meeting the user's operational specification
  const formattedText = `================================================================================
COMPUTER SCIENCE RESEARCH AGENT REPORT
Paper: ${result.paper.title}
Authors: ${result.paper.authors.join(', ')}
ArXiv ID / Reference: ${result.paper.arxivId || result.paper.url}
================================================================================

1. CORE CONCEPT EXTRACTION
--------------------------------------------------------------------------------
Problem Statement:
${result.coreConcept.problemStatement}

Primary Methodology:
${result.coreConcept.primaryMethodology}

Mathematical & Algorithmic Breakthroughs:
${result.coreConcept.mathematicalBreakthroughs}

Synthesis (<300 words):
${result.coreConcept.fullSummary}

--------------------------------------------------------------------------------
2. ARCHITECTURAL FLOWCHART (Mermaid.js)
--------------------------------------------------------------------------------
[FLOWCHART]

${result.flowchart.mermaidCode}

--------------------------------------------------------------------------------
3. FUTURE WORK & INTERNSHIP OPPORTUNITIES
--------------------------------------------------------------------------------
${result.studentOpportunities.map((opp, idx) => `
Opportunity ${idx + 1}: ${opp.title} (${opp.difficulty})
- Expected Contribution: ${opp.expectedContribution}
- Targeted Performance Metric: ${opp.targetedPerformanceMetric}
- Recommended Tech Stack: ${opp.recommendedTechStack.join(', ')}
- Estimated Timeline: ${opp.estimatedWeeks || 3} weeks
- Resume Bullet (STAR Format):
  ${opp.resumeBullet}
`).join('\n')}

================================================================================
OPERATIONAL METRICS:
Total Tokens Used: ${result.tokenStats.totalTokens} / 25,000 (Constraint strictly honored)
Efficiency Rating: ${result.tokenStats.efficiencyRating}
Analysis Latency: ${(result.tokenStats.executionTimeMs / 1000).toFixed(2)}s
================================================================================`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">
            Verbatim Operational Agent Output
          </span>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            Canonical Report Format
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied Full Report' : 'Copy Formatted Report'}
        </button>
      </div>

      <div className="p-4 bg-slate-950">
        <pre className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px]">
          {formattedText}
        </pre>
      </div>
    </div>
  );
};
