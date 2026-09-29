import React, { useState } from 'react';
import { PYTHON_CODE_TEMPLATES, CodeFile } from '../../data/codeTemplates';
import { Code, Copy, Check, Download, FileCode, Layers, Server } from 'lucide-react';

export const PythonCodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<CodeFile>(PYTHON_CODE_TEMPLATES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Code className="w-5 h-5 text-emerald-400" />
            <span>Python Export Studio & Production Codebase</span>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Complete, runnable Minimum Viable Implementation (MVI) in Python FastAPI, Pydantic, and local Ollama/Gemini AI Agent.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'Copied File!' : `Copy ${activeFile.filename}`}</span>
          </button>
          <button
            onClick={handleDownloadFile}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download {activeFile.filename}</span>
          </button>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 overflow-x-auto pb-2">
        {PYTHON_CODE_TEMPLATES.map((file) => {
          const isActive = activeFile.filename === file.filename;
          return (
            <button
              key={file.filename}
              onClick={() => setActiveFile(file)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file.filename}</span>
            </button>
          );
        })}
      </div>

      {/* Code Container */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">{activeFile.description}</span>
          <span className="text-slate-500 uppercase font-mono text-[10px]">{activeFile.language}</span>
        </div>

        <pre className="p-6 text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto max-h-[600px] bg-slate-950/80">
          <code>{activeFile.code}</code>
        </pre>
      </div>
    </div>
  );
};
