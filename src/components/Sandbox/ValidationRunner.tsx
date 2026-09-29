import React from 'react';
import { SecurityCheckResult } from '../../types';
import { CheckCircle2, XCircle, AlertTriangle, MinusCircle, Loader2, ShieldCheck } from 'lucide-react';

interface ValidationRunnerProps {
  checks: SecurityCheckResult[];
  isLoading: boolean;
  totalDurationMs?: number;
}

export const ValidationRunner: React.FC<ValidationRunnerProps> = ({ checks, isLoading, totalDurationMs }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center text-slate-100 shadow-xl">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 animate-bounce">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">AI Gatekeeper Inspection in Progress</h3>
        <p className="text-sm text-slate-400 mt-1">
          Evaluating file formats, binary magic headers, Pydantic schema rules, and Gemini LLM threat heuristics...
        </p>

        <div className="mt-6 max-w-md mx-auto">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse w-3/4 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!checks || checks.length === 0) return null;

  const passedCount = checks.filter((c) => c.status === 'PASS').length;
  const failedCount = checks.filter((c) => c.status === 'FAIL').length;
  const warnCount = checks.filter((c) => c.status === 'WARN').length;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold flex items-center space-x-2 text-slate-100">
            <span>Validation Engine Checklist</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {totalDurationMs} ms
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed status breakdown across all 12 security & structural checkpoints.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{passedCount} Passed</span>
          </span>
          {failedCount > 0 && (
            <span className="flex items-center space-x-1 text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
              <XCircle className="w-3.5 h-3.5" />
              <span>{failedCount} Failed</span>
            </span>
          )}
          {warnCount > 0 && (
            <span className="flex items-center space-x-1 text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{warnCount} Warnings</span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {checks.map((check) => {
          let Icon = CheckCircle2;
          let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          let badgeText = 'PASS';

          if (check.status === 'FAIL') {
            Icon = XCircle;
            colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
            badgeText = 'FAIL';
          } else if (check.status === 'WARN') {
            Icon = AlertTriangle;
            colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            badgeText = 'WARN';
          } else if (check.status === 'SKIPPED') {
            Icon = MinusCircle;
            colorClass = 'text-slate-500 bg-slate-800/40 border-slate-800';
            badgeText = 'SKIP';
          }

          return (
            <div
              key={check.id}
              className={`p-3.5 rounded-xl border flex items-start space-x-3 transition-all ${colorClass}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-200 truncate">{check.name}</span>
                  <span className="text-[10px] font-mono opacity-80 pl-2">{check.executionTimeMs.toFixed(1)}ms</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-snug">{check.message}</p>
                {check.details && (
                  <p className="text-[11px] font-mono text-slate-400 mt-1.5 p-1.5 bg-slate-950/60 rounded border border-slate-800/80 truncate">
                    {check.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
