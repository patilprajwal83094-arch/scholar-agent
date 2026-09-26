import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Code, Eye, Download, AlertTriangle } from 'lucide-react';
import { FlowchartData } from '../types';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#090d16',
    primaryColor: '#1e293b',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#38bdf8',
    lineColor: '#64748b',
    secondaryColor: '#0f172a',
    tertiaryColor: '#1e1b4b',
  },
  securityLevel: 'loose',
});

interface FlowchartViewerProps {
  flowchart: FlowchartData;
}

export const FlowchartViewer: React.FC<FlowchartViewerProps> = ({ flowchart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [customCode, setCustomCode] = useState<string>(flowchart.mermaidCode);

  useEffect(() => {
    setCustomCode(flowchart.mermaidCode);
  }, [flowchart.mermaidCode]);

  useEffect(() => {
    let isMounted = true;

    async function renderMermaid() {
      setRenderError(null);
      try {
        const cleanCode = customCode.trim();
        if (!cleanCode) return;

        // Generate unique ID for rendering
        const id = 'mermaid-svg-' + Math.random().toString(36).substring(2, 9);
        const { svg } = await mermaid.render(id, cleanCode);

        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setRenderError(err?.message || 'Syntax error in Mermaid code');
        }
      }
    }

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [customCode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(customCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyRawSegment = async () => {
    try {
      const textToCopy = `[FLOWCHART]\n\n${customCode}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-architecture-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.4));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 gap-3">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-xs font-mono font-semibold rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
            [FLOWCHART]
          </span>
          <span className="text-sm font-semibold text-slate-200">
            System Architecture & Dataflow Graph (graph TD)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/60">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-slate-400 min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition ml-0.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle View / Edit */}
          <button
            onClick={() => setShowEditor(!showEditor)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
              showEditor
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
            }`}
          >
            {showEditor ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
            {showEditor ? 'View Graph' : 'Mermaid Editor'}
          </button>

          {/* Copy [FLOWCHART] text segment */}
          <button
            onClick={handleCopyRawSegment}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition"
            title="Copy exact [FLOWCHART] string segment"
          >
            {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedRaw ? 'Copied [FLOWCHART]' : 'Copy Segment'}
          </button>

          {/* Download SVG */}
          <button
            onClick={handleDownloadSVG}
            disabled={!svgContent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition disabled:opacity-50"
            title="Export high-resolution vector SVG"
          >
            <Download className="w-3.5 h-3.5" />
            Export SVG
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {showEditor ? (
        <div className="p-4 bg-slate-950">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">
              Live Mermaid.js Specification (graph TD without backticks):
            </span>
            <button
              onClick={handleCopyCode}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied code' : 'Copy code'}
            </button>
          </div>
          <textarea
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            rows={12}
            className="w-full font-mono text-xs bg-slate-900 border border-slate-800 rounded-lg p-3 text-emerald-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-y"
            placeholder="graph TD..."
          />
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="relative min-h-[380px] max-h-[620px] overflow-auto p-6 flex items-center justify-center bg-radial from-slate-900/60 to-slate-950"
      >
        {renderError ? (
          <div className="p-6 max-w-lg text-center bg-red-950/30 border border-red-800/40 rounded-xl">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-300 mb-2">Mermaid Rendering Notice</p>
            <p className="text-xs text-slate-400 font-mono mb-4 break-words">{renderError}</p>
            <button
              onClick={() => setShowEditor(true)}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
            >
              Open Live Editor to Adjust
            </button>
          </div>
        ) : svgContent ? (
          <div
            className="mermaid-viewport transition-transform origin-center"
            style={{ transform: `scale(${zoom})` }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm animate-pulse">
            Rendering architectural flowchart...
          </div>
        )}
      </div>

      {/* Nodes / Layers Breakdown Accordion if available */}
      {flowchart.nodesSummary && flowchart.nodesSummary.length > 0 && (
        <div className="border-t border-slate-800/80 bg-slate-950/40 p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <span>Component & Layer Drilldown</span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
              {flowchart.nodesSummary.length} nodes
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {flowchart.nodesSummary.map((node, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition text-xs"
              >
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5 font-mono mb-1">
                  <span className="text-slate-500">[{node.id}]</span>
                  <span>{node.name}</span>
                </div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  {node.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
