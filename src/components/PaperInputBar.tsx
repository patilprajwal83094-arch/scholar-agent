import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Link2, FileText, ArrowRight, Loader2, BookMarked, Compass } from 'lucide-react';
import { PresetPaper } from '../types';

interface PaperInputBarProps {
  onSubmit: (input: string, focus: string) => Promise<void>;
  isLoading: boolean;
  presets: PresetPaper[];
}

export const PaperInputBar: React.FC<PaperInputBarProps> = ({ onSubmit, isLoading, presets }) => {
  const [input, setInput] = useState<string>('https://arxiv.org/abs/2312.00752');
  const [targetFocus, setTargetFocus] = useState<string>('Systems & Edge ML');
  const [arxivPreview, setArxivPreview] = useState<{ title: string; authors: string[]; published: string } | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState<boolean>(false);

  // Auto-detect arXiv ID and fetch fast preview
  useEffect(() => {
    const match = input.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arXiv:)([0-9]{4}\.[0-9]{4,5})/i);
    if (match) {
      const arxivId = match[1];
      let active = true;
      setIsFetchingPreview(true);

      fetch(`/api/arxiv-lookup?q=${arxivId}`)
        .then(res => res.json())
        .then(data => {
          if (active && data.meta) {
            setArxivPreview({
              title: data.meta.title,
              authors: data.meta.authors || [],
              published: data.meta.published || '',
            });
          }
        })
        .catch(() => {
          if (active) setArxivPreview(null);
        })
        .finally(() => {
          if (active) setIsFetchingPreview(false);
        });

      return () => {
        active = false;
      };
    } else {
      setArxivPreview(null);
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input.trim(), targetFocus);
  };

  const handleSelectPreset = (preset: PresetPaper) => {
    setInput(preset.url);
    onSubmit(preset.url, targetFocus);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-cyan-400" />
              Academic Paper URL or arXiv Reference
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              Token-Efficient Ingestion (&lt;25,000 tokens)
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., https://arxiv.org/abs/2312.00752, https://arxiv.org/abs/1706.03762, or paper title..."
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3.5 pl-4 pr-32 text-sm text-slate-100 placeholder-slate-500 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs rounded-lg transition shadow-md shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing...</span>
                </>
              ) : (
                <>
                  <span>Analyze Paper</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live arXiv detected card */}
        {arxivPreview && (
          <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-1 rounded bg-cyan-500/20 text-cyan-300 shrink-0">
                <BookMarked className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="font-semibold text-cyan-200">{arxivPreview.title}</span>
                <span className="text-slate-400 ml-2 font-mono text-[11px]">
                  ({arxivPreview.authors.slice(0, 2).join(', ')}{arxivPreview.authors.length > 2 ? ' et al.' : ''}, {arxivPreview.published})
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-900/40 px-2 py-0.5 rounded border border-cyan-500/30 shrink-0 ml-2">
              arXiv Verified
            </span>
          </div>
        )}

        {/* Custom student focus filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Student Target Focus:</span>
            <select
              value={targetFocus}
              onChange={(e) => setTargetFocus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Systems & Edge ML">Systems & Edge Deployment</option>
              <option value="Model Architecture & Efficiency">Model Architecture & Efficiency</option>
              <option value="Distributed ML & Quantization">Quantization & Hardware Optimization</option>
              <option value="NLP & Alignment">NLP & Alignment (RLHF/DPO)</option>
              <option value="Computer Vision & Multimodal">Computer Vision & Multimodal</option>
              <option value="Algorithmic Foundations">General Software Engineering & ML</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Or try seminal benchmark:</span>
          </div>
        </div>

        {/* Presets chips */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/80">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
              <span className="font-medium">{preset.title.split(':')[0]}</span>
              <span className="text-[10px] text-slate-500 font-mono">[{preset.tag}]</span>
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
