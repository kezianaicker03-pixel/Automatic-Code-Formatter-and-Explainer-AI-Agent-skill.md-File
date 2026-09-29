import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PayloadInspector } from './components/Sandbox/PayloadInspector';
import { ValidationRunner } from './components/Sandbox/ValidationRunner';
import { ResultCard } from './components/Sandbox/ResultCard';
import { ArchitectureDiagram } from './components/Architecture/ArchitectureDiagram';
import { AuditLogViewer } from './components/Audit/AuditLogViewer';
import { AnalyticsDashboard } from './components/Audit/AnalyticsDashboard';
import { RulesManager } from './components/PolicyEditor/RulesManager';
import { PythonCodeViewer } from './components/CodeStudio/PythonCodeViewer';
import { DevSecOpsGuide } from './components/Guide/DevSecOpsGuide';
import { ValidationReport, SecurityRulesConfig } from './types';
import { runSecurityEngine, DEFAULT_RULES } from './utils/securityEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('sandbox');
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [auditLogs, setAuditLogs] = useState<ValidationReport[]>([]);
  const [rules, setRules] = useState<SecurityRulesConfig>(DEFAULT_RULES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [geminiActive, setGeminiActive] = useState<boolean>(false);

  // Load audit logs & rules from server on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.geminiEnabled) setGeminiActive(true);
      })
      .catch(() => setGeminiActive(false));

    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setAuditLogs(data.logs);
      })
      .catch((err) => console.log('Client fallback audit log store active.'));
  }, []);

  const handleRunValidation = async (
    fileName: string,
    fileContent: string,
    mimeType: string,
    authHeader?: string,
    signatureHeader?: string
  ) => {
    setIsLoading(true);
    setReport(null);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileContent,
          mimeType,
          authHeader,
          signatureHeader
        })
      });

      if (response.ok) {
        const data: ValidationReport = await response.json();
        setReport(data);
        setAuditLogs((prev) => [data, ...prev]);
      } else {
        // Fallback to client-side engine if server offline
        const localReport = await runSecurityEngine(
          fileName,
          fileContent,
          mimeType,
          authHeader,
          signatureHeader,
          rules
        );
        setReport(localReport);
        setAuditLogs((prev) => [localReport, ...prev]);
      }
    } catch (err) {
      // Local fallback
      const localReport = await runSecurityEngine(
        fileName,
        fileContent,
        mimeType,
        authHeader,
        signatureHeader,
        rules
      );
      setReport(localReport);
      setAuditLogs((prev) => [localReport, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = () => {
    fetch('/api/audit-logs', { method: 'DELETE' }).catch(() => {});
    setAuditLogs([]);
  };

  const handleUpdateRules = (newRules: SecurityRulesConfig) => {
    setRules(newRules);
    fetch('/api/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRules)
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        geminiActive={geminiActive}
        logCount={auditLogs.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: PUSH SANDBOX */}
        {activeTab === 'sandbox' && (
          <div className="space-y-8 animate-fade-in">
            <PayloadInspector onRunValidation={handleRunValidation} isLoading={isLoading} />

            {report && (
              <div className="space-y-8">
                <ResultCard report={report} />
                <ValidationRunner checks={report.checkResults} isLoading={isLoading} totalDurationMs={report.totalDurationMs} />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ARCHITECTURE FLOW */}
        {activeTab === 'architecture' && <ArchitectureDiagram />}

        {/* TAB 3: AUDIT DATABASE & ANALYTICS */}
        {activeTab === 'audit' && (
          <div className="space-y-8">
            <AnalyticsDashboard logs={auditLogs} />
            <AuditLogViewer logs={auditLogs} onClearLogs={handleClearLogs} />
          </div>
        )}

        {/* TAB 4: SECURITY POLICIES */}
        {activeTab === 'policy' && <RulesManager currentRules={rules} onUpdateRules={handleUpdateRules} />}

        {/* TAB 5: PYTHON EXPORT STUDIO */}
        {activeTab === 'code' && <PythonCodeViewer />}

        {/* TAB 6: DEVSECOPS GUIDE */}
        {activeTab === 'deliverables' && <DevSecOpsGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-6 text-slate-400 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 PushGuard AI Agent • Antigravity Security Infrastructure</p>
          <p className="font-mono text-[11px] text-slate-500">
            Open-Source • Zero Licensing Cost • Pydantic + Ollama / Gemini 3.6 Flash
          </p>
        </div>
      </footer>
    </div>
  );
}
