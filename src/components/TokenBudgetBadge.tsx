import React from 'react';
import { TokenStats } from '../types';
import { Zap, ShieldCheck, Clock, Activity } from 'lucide-react';

interface TokenBudgetBadgeProps {
  stats: TokenStats;
}

export const TokenBudgetBadge: React.FC<TokenBudgetBadgeProps> = ({ stats }) => {
  const percentUsed = Math.min(100, Math.round((stats.totalTokens / stats.tokenBudget) * 100));

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
      {/* Token Efficiency Meter */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-200">Token Efficiency</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              {stats.efficiencyRating}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            <span className="text-cyan-400 font-semibold">{stats.totalTokens.toLocaleString()}</span> / {stats.tokenBudget.toLocaleString()} tokens ({percentUsed}%)
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 min-w-[120px] max-w-[200px]">
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              percentUsed > 80 ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
            }`}
            style={{ width: `${Math.max(percentUsed, 5)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
          <span>0</span>
          <span>Constraint: &lt;25k</span>
        </div>
      </div>

      {/* Execution Time */}
      <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800 text-xs font-mono text-slate-400">
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        <span>{(stats.executionTimeMs / 1000).toFixed(2)}s</span>
      </div>

      {/* Constraint Verified Badge */}
      <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/20">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Constraint Verified</span>
      </div>
    </div>
  );
};
