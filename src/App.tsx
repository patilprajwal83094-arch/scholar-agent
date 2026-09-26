/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnalysisResult, PresetPaper } from './types';
import { DEFAULT_ANALYSIS } from './data/defaultAnalysis';
import { PaperInputBar } from './components/PaperInputBar';
import { PaperHeader } from './components/PaperHeader';
import { CoreConceptView } from './components/CoreConceptView';
import { FlowchartViewer } from './components/FlowchartViewer';
import { StudentProjectsView } from './components/StudentProjectsView';
import { TokenBudgetBadge } from './components/TokenBudgetBadge';
import { RawSegmentViewer } from './components/RawSegmentViewer';
import { ExportModal } from './components/ExportModal';
import { 
  Binary, 
  Share2, 
  Download, 
  History, 
  Terminal, 
  BookOpen, 
  GitGraph, 
  Briefcase, 
  Sparkles,
  AlertCircle,
  FileCheck,
  Check
} from 'lucide-react';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(() => {
    const saved = localStorage.getItem('scholar_agent_last_analysis');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fall back to default
      }
    }
    return DEFAULT_ANALYSIS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'concept' | 'flowchart' | 'opportunities' | 'raw'>('all');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [presets, setPresets] = useState<PresetPaper[]>([]);
  const [history, setHistory] = useState<Array<{ title: string; date: string; result: AnalysisResult }>>(() => {
    const saved = localStorage.getItem('scholar_agent_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Fetch preset papers on mount
  useEffect(() => {
    fetch('/api/presets')
      .then(res => res.json())
      .then(data => {
        if (data.presets) {
          setPresets(data.presets);
        }
      })
      .catch(err => console.warn('Could not fetch presets:', err));
  }, []);

  const handleAnalyzePaper = async (input: string, focus: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, targetFocus: focus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to analyze paper');
      }

      const data: AnalysisResult = await response.json();
      data.analyzedAt = new Date().toISOString();

      setAnalysisResult(data);
      localStorage.setItem('scholar_agent_last_analysis', JSON.stringify(data));

      // Append to history
      setHistory(prev => {
        const updated = [
          { title: data.paper.title, date: new Date().toLocaleDateString(), result: data },
          ...prev.filter(h => h.title !== data.paper.title).slice(0, 7),
        ];
        localStorage.setItem('scholar_agent_history', JSON.stringify(updated));
        return updated;
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'Error occurred while contacting research agent');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item: { result: AnalysisResult }) => {
    setAnalysisResult(item.result);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Binary className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">ScholarAgent</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
                  CS Research Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                System Architectures • Mermaid Flowcharts • Student Projects
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* History dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
              >
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">History</span>
                {history.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono flex items-center justify-center border border-cyan-500/30">
                    {history.length}
                  </span>
                )}
              </button>

              {showHistory && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800 mb-1">
                    Recently Analyzed Papers
                  </div>
                  {history.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-slate-500 text-center">No previous history</div>
                  ) : (
                    <div className="space-y-1">
                      {history.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => loadFromHistory(h)}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition truncate block"
                        >
                          <div className="font-semibold truncate">{h.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{h.date}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Export modal trigger */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Paper Input & Query Bar */}
        <PaperInputBar
          onSubmit={handleAnalyzePaper}
          isLoading={isLoading}
          presets={presets}
        />

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Analysis Failed: </span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 font-mono text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Skeleton Indicator */}
        {isLoading && (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">
              Agent Executing 3-Step Research Analysis...
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Extracting core problem statement & math breakthroughs (&lt;300w) • Synthesizing Mermaid architecture graph • Brainstorming 3rd-year CS resume projects
            </p>
            <div className="text-[11px] font-mono text-cyan-400">
              Enforcing token efficiency &lt; 25,000 tokens
            </div>
          </div>
        )}

        {/* Paper Header */}
        {!isLoading && analysisResult && (
          <>
            <PaperHeader paper={analysisResult.paper} />

            {/* Token Budget & Latency Live Monitor Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <TokenBudgetBadge stats={analysisResult.tokenStats} />

              {/* Step Navigation Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === 'all'
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All 3 Steps
                </button>
                <button
                  onClick={() => setActiveTab('concept')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === 'concept'
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>1. Core Concept</span>
                </button>
                <button
                  onClick={() => setActiveTab('flowchart')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === 'flowchart'
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GitGraph className="w-3.5 h-3.5" />
                  <span>2. [FLOWCHART]</span>
                </button>
                <button
                  onClick={() => setActiveTab('opportunities')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === 'opportunities'
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>3. Student Projects</span>
                </button>
                <button
                  onClick={() => setActiveTab('raw')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === 'raw'
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Raw Output</span>
                </button>
              </div>
            </div>

            {/* Tabbed Content Sections */}
            <div className="space-y-8">
              {/* Step 1: Core Concept Extraction */}
              {(activeTab === 'all' || activeTab === 'concept') && (
                <section>
                  <CoreConceptView
                    coreConcept={analysisResult.coreConcept}
                    paperTitle={analysisResult.paper.title}
                  />
                </section>
              )}

              {/* Step 2: Architectural Flowchart (Mermaid.js) */}
              {(activeTab === 'all' || activeTab === 'flowchart') && (
                <section>
                  <FlowchartViewer flowchart={analysisResult.flowchart} />
                </section>
              )}

              {/* Step 3: Student Development & Resume Opportunities */}
              {(activeTab === 'all' || activeTab === 'opportunities') && (
                <section>
                  <StudentProjectsView
                    opportunities={analysisResult.studentOpportunities}
                    paperTitle={analysisResult.paper.title}
                  />
                </section>
              )}

              {/* Verbatim Canonical Report Output */}
              {(activeTab === 'all' || activeTab === 'raw') && (
                <section>
                  <RawSegmentViewer result={analysisResult} />
                </section>
              )}
            </div>
          </>
        )}
      </main>

      {/* Export Modal */}
      {analysisResult && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          result={analysisResult}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            ScholarAgent • Advanced Computer Science Research & System Flowchart Engine
          </div>
          <div className="flex items-center gap-3">
            <span>Constraint: &lt;25,000 Tokens</span>
            <span>•</span>
            <span>Syntactically Valid Mermaid.js</span>
            <span>•</span>
            <span>3rd-Year CS Resume Projects</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
