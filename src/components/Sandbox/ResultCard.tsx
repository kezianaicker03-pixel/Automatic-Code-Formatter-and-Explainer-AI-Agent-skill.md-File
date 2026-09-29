import React, { useState } from 'react';
import { ValidationReport } from '../../types';
import { CheckCircle2, XCircle, ShieldAlert, Cpu, Copy, Check, FileJson, AlertCircle, ArrowRight } from 'lucide-react';

interface ResultCardProps {
  report: ValidationReport | null;
}

export const ResultCard: React.FC<ResultCardProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!report) return null;

  const isAccept = report.overallResult === 'ACCEPT';

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border p-6 shadow-2xl transition-all ${
        isAccept
          ? 'bg-slate-900/90 border-emerald-500/40 shadow-emerald-500/5'
          : 'bg-slate-900/90 border-rose-500/40 shadow-rose-500/5'
      }`}
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
              isAccept ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'
            }`}
          >
            {isAccept ? <CheckCircle2 className="w-8 h-8 stroke-[2.5]" /> : <XCircle className="w-8 h-8 stroke-[2.5]" />}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="text-2xl font-black tracking-tight text-slate-100">
                GATEKEEPER DECISION: {report.overallResult}
              </h3>
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${
                  isAccept
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                Threat: {report.aiAnalysis.threatLevel}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 font-mono">
              Report ID: {report.id} • SHA-256: {report.checksumSha256.substring(0, 16)}...
            </p>
          </div>
        </div>

        {/* Confidence Badge & Speed */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">AI Confidence</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{report.aiAnalysis.confidenceScore}%</span>
          </div>
          <button
            onClick={() => setShowJson(!showJson)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-all"
          >
            <FileJson className="w-4 h-4 text-emerald-400" />
            <span>{showJson ? 'Hide JSON Audit' : 'View Audit Record'}</span>
          </button>
        </div>
      </div>

      {/* AI Reasoning & Summary */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>AI Agent Security Synthesis</span>
            </h4>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-sm text-slate-200 leading-relaxed">
              {report.aiAnalysis.summary}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Detailed Reasoning Points:</h4>
            <ul className="space-y-2">
              {report.aiAnalysis.reasoning.map((point, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Remediation & Status */}
        <div className="space-y-4">
          {report.aiAnalysis.remediationAdvice && (
            <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5 mb-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Remediation Advice</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{report.aiAnalysis.remediationAdvice}</p>
            </div>
          )}

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>File Size:</span>
              <span className="font-mono text-slate-200">{(report.fileSize / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Latency:</span>
              <span className="font-mono text-slate-200">{report.totalDurationMs} ms</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Client Subject:</span>
              <span className="font-mono text-slate-200">{report.authSubject}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Target Pipeline Action:</span>
              <span className={isAccept ? 'font-bold text-emerald-400' : 'font-bold text-rose-400'}>
                {isAccept ? 'FORWARD TO ENDPOINT' : 'BLOCK & DROP PAYLOAD'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Raw JSON Audit Drawer */}
      {showJson && (
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 font-mono">Structured Audit Log JSON Record</span>
            <button
              onClick={handleCopyJson}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-72">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
