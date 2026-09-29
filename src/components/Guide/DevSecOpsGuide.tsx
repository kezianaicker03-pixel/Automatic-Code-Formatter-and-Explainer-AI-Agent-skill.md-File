import React, { useState } from 'react';
import { DELIVERABLE_SECTIONS } from '../../data/deliverables';
import { FileText, ChevronDown, ChevronRight, CheckCircle2, Shield, Wrench, AlertTriangle, Rocket, Terminal } from 'lucide-react';

export const DevSecOpsGuide: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string>(DELIVERABLE_SECTIONS[0].id);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <span>DevSecOps Deliverables & Technical Documentation</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Complete architectural manual, workflow breakdown, free tool matrices, security controls, and deployment instructions for Antigravity.
        </p>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-4">
        {DELIVERABLE_SECTIONS.map((section) => {
          const isOpen = expandedSection === section.id;

          return (
            <div
              key={section.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedSection(isOpen ? '' : section.id)}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 font-bold flex items-center justify-center font-mono text-sm border border-slate-700">
                    {section.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{section.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{section.summary}</p>
                  </div>
                </div>

                <div className="text-slate-400">
                  {isOpen ? <ChevronDown className="w-5 h-5 text-emerald-400" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </button>

              {isOpen && (
                <div className="p-6 pt-2 border-t border-slate-800 space-y-4 bg-slate-950/60">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Key Highlights</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {section.highlights.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technical Details</h4>
                    <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2 whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800">
                      {section.details}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
