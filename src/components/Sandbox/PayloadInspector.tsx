import React, { useState } from 'react';
import { SAMPLE_PAYLOADS } from '../../data/samplePayloads';
import { SamplePayload, FileFormat } from '../../types';
import { FileCode, Upload, Play, ShieldAlert, Key, Lock, RefreshCw, FileText } from 'lucide-react';

interface PayloadInspectorProps {
  onRunValidation: (
    fileName: string,
    content: string,
    mimeType: string,
    authHeader?: string,
    signatureHeader?: string
  ) => void;
  isLoading: boolean;
}

export const PayloadInspector: React.FC<PayloadInspectorProps> = ({ onRunValidation, isLoading }) => {
  const [selectedPreset, setSelectedPreset] = useState<SamplePayload>(SAMPLE_PAYLOADS[0]);
  const [fileName, setFileName] = useState<string>(SAMPLE_PAYLOADS[0].fileName);
  const [mimeType, setMimeType] = useState<string>(SAMPLE_PAYLOADS[0].mimeType);
  const [authHeader, setAuthHeader] = useState<string>(SAMPLE_PAYLOADS[0].authHeader || 'Bearer devsecops_token_984a12c');
  const [signatureHeader, setSignatureHeader] = useState<string>(SAMPLE_PAYLOADS[0].signatureHeader || '');
  const [content, setContent] = useState<string>(SAMPLE_PAYLOADS[0].content);
  const [showAdvancedHeaders, setShowAdvancedHeaders] = useState<boolean>(false);

  const handleSelectPreset = (preset: SamplePayload) => {
    setSelectedPreset(preset);
    setFileName(preset.fileName);
    setMimeType(preset.mimeType);
    setAuthHeader(preset.authHeader || '');
    setSignatureHeader(preset.signatureHeader || '');
    setContent(preset.content);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMimeType(file.type || 'application/octet-stream');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text || '');
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunValidation(fileName, content, mimeType, authHeader, signatureHeader);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-100">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <span>Push Payload Inspector & Test Bench</span>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Select a test vector preset or supply a raw push file to execute inline AI Gatekeeper verification.
          </p>
        </div>

        {/* Custom Upload Button */}
        <label className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 cursor-pointer transition-all self-start md:self-auto">
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Upload Test File</span>
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Preset Selector Chips */}
      <div className="mt-5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 block">
          Select Security Test Case Vector:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_PAYLOADS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            const isPass = preset.expectedDecision === 'ACCEPT';

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-3 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/60 ring-1 ring-emerald-500/30 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-100 truncate pr-1">{preset.title}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight uppercase ${
                        isPass ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {preset.expectedDecision}
                    </span>
                  </div>
                  <p className="text-slate-400 line-clamp-2 text-[11px] leading-relaxed">{preset.description}</p>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  {preset.fileName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor & Metadata Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* File Details Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Target Filename</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500/60"
              placeholder="order.json"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Declared Content-Type / MIME</label>
            <input
              type="text"
              value={mimeType}
              onChange={(e) => setMimeType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500/60"
              placeholder="application/json"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Expected Test Decision</label>
            <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center justify-between font-medium">
              <span className="text-slate-300">{selectedPreset.category}</span>
              <span className={selectedPreset.expectedDecision === 'ACCEPT' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {selectedPreset.expectedDecision}
              </span>
            </div>
          </div>
        </div>

        {/* Collapsible Headers Section */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvancedHeaders(!showAdvancedHeaders)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{showAdvancedHeaders ? 'Hide API Headers' : 'Configure API Headers (Auth Token & HMAC Signature)'}</span>
          </button>

          {showAdvancedHeaders && (
            <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Authorization Header</label>
                <input
                  type="text"
                  value={authHeader}
                  onChange={(e) => setAuthHeader(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500/60"
                  placeholder="Bearer devsecops_token_984a12c"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">X-Signature (HMAC SHA-256 Digest)</label>
                <input
                  type="text"
                  value={signatureHeader}
                  onChange={(e) => setSignatureHeader(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500/60"
                  placeholder="sha256=7f83b1657ff1fc53b..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Payload Body TextArea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-400 block">
              Raw File Buffer / Payload Body Content ({new TextEncoder().encode(content).length} Bytes)
            </label>
            <span className="text-[11px] text-slate-500 font-mono">{selectedPreset.notes}</span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={9}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-emerald-300 font-mono leading-relaxed focus:outline-none focus:border-emerald-500/60 resize-y shadow-inner"
            placeholder="Paste raw file text or JSON payload here..."
            required
          />
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/10 ${
              isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer hover:shadow-emerald-500/25 active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                <span>Running AI Security Checks...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Validate Push File & Run AI Inspection</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
