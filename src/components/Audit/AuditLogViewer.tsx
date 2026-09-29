import React, { useState } from 'react';
import { ValidationReport } from '../../types';
import { Search, Filter, Download, Trash2, CheckCircle2, XCircle, FileText, ChevronRight } from 'lucide-react';

interface AuditLogViewerProps {
  logs: ValidationReport[];
  onClearLogs: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs, onClearLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACCEPT' | 'REJECT'>('ALL');
  const [selectedLog, setSelectedLog] = useState<ValidationReport | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.checksumSha256.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.overallResult === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'FileName', 'Size(KB)', 'MIME', 'Result', 'ThreatLevel', 'Latency(ms)', 'SHA256'];
    const rows = logs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.fileName}"`,
      (l.fileSize / 1024).toFixed(1),
      l.mimeType,
      l.overallResult,
      l.aiAnalysis.threatLevel,
      l.totalDurationMs,
      l.checksumSha256
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pushguard_audit_logs_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Actions */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>Audit Log Database (SQLite In-Memory Sync)</span>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Immutable verification trail recording all push file attempts, SHA-256 hashes, and AI decisions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCsv}
            disabled={logs.length === 0}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="flex items-center space-x-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/30 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by filename, ID, or hash..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Filter Decision:</span>
          {(['ALL', 'ACCEPT', 'REJECT'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Datatable */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No audit logs found matching your query.</p>
            <p className="text-xs text-slate-500 mt-1">Run a validation test in the Push Sandbox to generate real logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Timestamp & ID</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Size & Type</th>
                  <th className="py-3 px-4">Gatekeeper Decision</th>
                  <th className="py-3 px-4">Threat Level</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredLogs.map((log) => {
                  const isPass = log.overallResult === 'ACCEPT';

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-bold text-slate-200">{log.id}</div>
                        <div className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-200 font-semibold max-w-[180px] truncate">
                        {log.fileName}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        <div>{(log.fileSize / 1024).toFixed(1)} KB</div>
                        <div className="text-[10px] text-slate-500">{log.mimeType}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPass
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isPass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{log.overallResult}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="text-[11px] font-bold">{log.aiAnalysis.threatLevel}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">{log.totalDurationMs}ms</td>

                      <td className="py-3.5 px-4 text-right text-emerald-400">
                        <ChevronRight className="w-4 h-4 inline-block" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Detail Modal Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 font-mono">Audit Record #{selectedLog.id}</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-300"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Filename:</span>
                <span className="font-mono text-slate-200 font-bold">{selectedLog.fileName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Decision:</span>
                <span className={selectedLog.overallResult === 'ACCEPT' ? 'font-bold text-emerald-400' : 'font-bold text-rose-400'}>
                  {selectedLog.overallResult}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">SHA-256 Digest:</span>
                <span className="font-mono text-slate-300 text-[10px] break-all">{selectedLog.checksumSha256}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Timestamp:</span>
                <span className="font-mono text-slate-300">{selectedLog.timestamp}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">AI Agent Summary</h4>
              <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">
                {selectedLog.aiAnalysis.summary}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Passed & Failed Rules</h4>
              <div className="space-y-1.5">
                {selectedLog.checkResults.map((c) => (
                  <div key={c.id} className="text-xs flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-300 font-mono">{c.name}</span>
                    <span className={c.status === 'PASS' ? 'text-emerald-400 font-bold' : c.status === 'FAIL' ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
