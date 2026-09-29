import React, { useState } from 'react';
import { SecurityRulesConfig } from '../../types';
import { Settings, Save, Check, RefreshCw, Shield, Sliders, AlertTriangle } from 'lucide-react';

interface RulesManagerProps {
  currentRules: SecurityRulesConfig;
  onUpdateRules: (newRules: SecurityRulesConfig) => void;
}

export const RulesManager: React.FC<RulesManagerProps> = ({ currentRules, onUpdateRules }) => {
  const [rules, setRules] = useState<SecurityRulesConfig>({ ...currentRules });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [requiredKeysInput, setRequiredKeysInput] = useState(
    rules.customRules.requiredJsonKeys.join(', ')
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...rules,
      customRules: {
        ...rules.customRules,
        requiredJsonKeys: requiredKeysInput.split(',').map((s) => s.trim()).filter(Boolean)
      }
    };
    onUpdateRules(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <span>Gatekeeper Policy & Rules Customizer</span>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Configure live security controls, schema constraints, and AI Agent sensitivity modes without redeploying code.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-xl flex items-center space-x-1.5 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Policies Saved & Active!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Structural & Storage Rules */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
            1. Structural & Size Bounds
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Maximum Allowed File Size (Bytes)
            </label>
            <select
              value={rules.maxSizeBytes}
              onChange={(e) => setRules({ ...rules, maxSizeBytes: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
            >
              <option value={512 * 1024}>512 KB</option>
              <option value={1 * 1024 * 1024}>1 MB</option>
              <option value={2 * 1024 * 1024}>2 MB (Recommended)</option>
              <option value={5 * 1024 * 1024}>5 MB</option>
              <option value={10 * 1024 * 1024}>10 MB</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Mandatory JSON Schema Required Keys (Comma-separated)
            </label>
            <input
              type="text"
              value={requiredKeysInput}
              onChange={(e) => setRequiredKeysInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500/60"
              placeholder="transaction_id, timestamp, merchant_id"
            />
          </div>

          <div className="pt-2 space-y-3">
            <label className="flex items-center space-x-3 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={rules.requireAuthHeader}
                onChange={(e) => setRules({ ...rules, requireAuthHeader: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-slate-300">Require Bearer Token Authorization Header</span>
            </label>

            <label className="flex items-center space-x-3 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={rules.requireHmacSignature}
                onChange={(e) => setRules({ ...rules, requireHmacSignature: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-slate-300">Enforce Cryptographic HMAC SHA-256 Digest Header</span>
            </label>
          </div>
        </div>

        {/* Panel 2: Threat Detection & AI Sensitivity */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
            2. Threat Protection Controls
          </h3>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={rules.blockExecutables}
                onChange={(e) => setRules({ ...rules, blockExecutables: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-slate-300 font-semibold">Block Binary Executables (ClamAV Magic Byte Scanning)</span>
            </label>

            <label className="flex items-center space-x-3 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={rules.detectSqlInjection}
                onChange={(e) => setRules({ ...rules, detectSqlInjection: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-slate-300">Scan for SQL Injection Payload Vectors (SELECT, DROP, UNION)</span>
            </label>

            <label className="flex items-center space-x-3 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={rules.detectXss}
                onChange={(e) => setRules({ ...rules, detectXss: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-slate-300">Scan for Cross-Site Scripting (XSS / &lt;script&gt; tags)</span>
            </label>
          </div>

          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              AI Agent Heuristic Strictness Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['LENIENT', 'BALANCED', 'PARANOID'] as const).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setRules({ ...rules, aiStrictness: level })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    rules.aiStrictness === level
                      ? 'bg-slate-800 text-emerald-400 border-emerald-500/60 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Apply Policy Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
