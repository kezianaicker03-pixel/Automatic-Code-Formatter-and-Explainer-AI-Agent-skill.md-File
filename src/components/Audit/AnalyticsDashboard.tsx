import React from 'react';
import { ValidationReport } from '../../types';
import { ShieldCheck, ShieldAlert, Activity, Clock, BarChart3 } from 'lucide-react';

interface AnalyticsDashboardProps {
  logs: ValidationReport[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ logs }) => {
  const totalCount = logs.length;
  const acceptCount = logs.filter((l) => l.overallResult === 'ACCEPT').length;
  const rejectCount = logs.filter((l) => l.overallResult === 'REJECT').length;
  const passRate = totalCount > 0 ? Math.round((acceptCount / totalCount) * 100) : 100;

  const avgLatencyMs =
    totalCount > 0 ? Math.round(logs.reduce((acc, l) => acc + l.totalDurationMs, 0) / totalCount) : 0;

  // Threat Breakdown Counts
  const criticalThreats = logs.filter((l) => l.aiAnalysis.threatLevel === 'CRITICAL' || l.aiAnalysis.threatLevel === 'HIGH').length;
  const mediumThreats = logs.filter((l) => l.aiAnalysis.threatLevel === 'MEDIUM' || l.aiAnalysis.threatLevel === 'LOW').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-slate-100">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium block">Accepted Push Rate</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{passRate}%</span>
            <span className="text-xs text-slate-500 font-mono">({acceptCount}/{totalCount})</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium block">Blocked Threat Vectors</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-rose-400 font-mono">{rejectCount}</span>
            <span className="text-xs text-rose-500 font-mono">({criticalThreats} critical)</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium block">Avg Gatekeeper Latency</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-teal-400 font-mono">{avgLatencyMs}</span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium block">Audit Database State</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-purple-400 font-mono">{totalCount}</span>
            <span className="text-xs text-slate-400">records</span>
          </div>
        </div>
      </div>
    </div>
  );
};
