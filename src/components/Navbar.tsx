import React from 'react';
import { ShieldCheck, Cpu, Database, Settings, Code, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  geminiActive: boolean;
  logCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, geminiActive, logCount }) => {
  const navItems = [
    { id: 'sandbox', label: 'Push Sandbox', icon: ShieldCheck },
    { id: 'architecture', label: 'Architecture & Flow', icon: Cpu },
    { id: 'audit', label: 'Audit Database', icon: Database, badge: logCount },
    { id: 'policy', label: 'Security Policies', icon: Settings },
    { id: 'code', label: 'Python Export Studio', icon: Code },
    { id: 'deliverables', label: 'DevSecOps Guide', icon: FileText }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('sandbox')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  PushGuard AI
                </span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Antigravity Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Push File Validation & Security Gatekeeper</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Engine Status Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
              <div className={`w-2 h-2 rounded-full ${geminiActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-medium">
                {geminiActive ? 'Gemini 3.6 Flash Active' : 'Deterministic + Fallback'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-800 space-x-2 bg-slate-900/90 backdrop-blur">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
