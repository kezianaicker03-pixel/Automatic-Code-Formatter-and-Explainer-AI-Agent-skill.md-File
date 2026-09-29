import React, { useState } from 'react';
import { ArchitectureNode } from '../../types';
import { Globe, Shield, Cpu, CheckSquare, Database, ArrowRight, CheckCircle, XCircle, Server, Info } from 'lucide-react';

const NODES: ArchitectureNode[] = [
  {
    id: 'source',
    title: '1. Source System',
    subtitle: 'External Clients & Webhooks',
    description: 'Any external client, ERP integration, mobile app, or third-party partner pushing files or structured data payloads over HTTPS POST/PUT.',
    iconName: 'Globe',
    techStack: ['Webhooks', 'cURL', 'Postman', 'Enterprise ERPs'],
    role: 'Originates push files and API requests.'
  },
  {
    id: 'gateway',
    title: '2. API Gateway',
    subtitle: 'Edge Routing & DDoS Shield',
    description: 'Reverse proxy and edge security boundary handling TLS termination, rate limiting, and routing incoming push payload traffic to the gatekeeper service.',
    iconName: 'Shield',
    techStack: ['Nginx', 'Traefik', 'Cloudflare', 'Caddy'],
    role: 'Filters basic network floods and terminates HTTPS.'
  },
  {
    id: 'ai-agent',
    title: '3. AI Validation Agent',
    subtitle: 'Antigravity Gatekeeper Core',
    description: 'The primary AI orchestrator running inside Antigravity Cloud container runtime. Combines deterministic rule engines with LLM semantic reasoning.',
    iconName: 'Cpu',
    techStack: ['Antigravity AI Agent', 'FastAPI', 'Ollama (Local LLM)', 'Gemini 3.6 Flash'],
    role: 'Orchestrates security checks and semantic threat analysis.'
  },
  {
    id: 'engine',
    title: '4. Validation Engine',
    subtitle: 'Deterministic Rules & ClamAV',
    description: 'High-speed rule engine evaluating file formats, size bounds, Pydantic schemas, SQL injection patterns, and binary executable magic headers (MZ/ELF).',
    iconName: 'CheckSquare',
    techStack: ['Pydantic v2', 'ClamAV Signatures', 'Regex Analyzers', 'HMAC SHA-256'],
    role: 'Executes hard security and structural constraints in < 5ms.'
  },
  {
    id: 'audit',
    title: '5. Audit & Logging Store',
    subtitle: 'Zero-Cost Immutable Database',
    description: 'Lightweight SQLite audit store capturing SHA-256 signatures, client IP metadata, diagnostic check outcomes, and AI justification for compliance reporting.',
    iconName: 'Database',
    techStack: ['SQLite', 'JSON Audit Records', 'Structured Logging'],
    role: 'Provides immutable audit trail for DevSecOps compliance.'
  },
  {
    id: 'decision',
    title: '6. Accept / Reject Router',
    subtitle: 'Gatekeeper Enforcement Node',
    description: 'Final decision gatekeeper that returns HTTP 200 OK for accepted payloads or HTTP 400/403 with detailed remediation error feedback for rejected files.',
    iconName: 'CheckCircle',
    techStack: ['HTTP Status Codes', 'Generic Error Sanitizer'],
    role: 'Enforces ingress security decisions.'
  },
  {
    id: 'endpoint',
    title: '7. Target Endpoint',
    subtitle: 'Core Production Application',
    description: 'The internal business backend (e.g., database loader, inventory pipeline) that only receives pre-scanned, verified, safe push payloads.',
    iconName: 'Server',
    techStack: ['PostgreSQL', 'Microservices', 'Message Queues'],
    role: 'Processes clean production data without security risks.'
  }
];

export const ArchitectureDiagram: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(NODES[2]); // Default AI Agent

  return (
    <div className="space-y-6 text-slate-100">
      {/* Overview Banner */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <span>High-Level Gatekeeper Architecture</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
          Interactive representation of the 7-stage zero-cost file validation pipeline. Click any node to view plain-English architectural roles and technical specifications.
        </p>
      </div>

      {/* Visual Pipeline Map */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl overflow-x-auto">
        <div className="min-w-[850px] flex items-center justify-between py-6 px-4 relative">
          {/* Animated Connecting Line */}
          <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-800 -translate-y-1/2 -z-0">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse w-full" />
          </div>

          {NODES.map((node, index) => {
            const isSelected = selectedNode.id === node.id;
            const isAIAgent = node.id === 'ai-agent';

            return (
              <div key={node.id} className="relative z-10 flex flex-col items-center">
                <button
                  onClick={() => setSelectedNode(node)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 scale-110 ring-4 ring-emerald-500/30'
                      : isAIAgent
                      ? 'bg-slate-800 text-emerald-400 border-2 border-emerald-500/60 hover:scale-105'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:scale-105'
                  }`}
                >
                  <span className="font-bold text-base font-mono">{index + 1}</span>
                </button>
                <span className="text-xs font-semibold text-slate-200 mt-2 text-center max-w-[100px] line-clamp-2">
                  {node.title.replace(/^\d+\.\s*/, '')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono text-center max-w-[90px] truncate mt-0.5">
                  {node.subtitle}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Detail Panel */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">{selectedNode.title}</h3>
              <p className="text-xs text-emerald-400 font-mono">{selectedNode.subtitle}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Plain English Role & Function</h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {selectedNode.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Primary Security Responsibility</h4>
            <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
              {selectedNode.role}
            </p>
          </div>
        </div>

        {/* Tech Stack Box */}
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Recommended Free Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {selectedNode.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 text-slate-200 border border-slate-800 font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-right">
            <span className="text-[11px] text-slate-500 block">Antigravity Architecture Tier</span>
            <span className="text-xs font-bold text-emerald-400">Zero Licensing Cost</span>
          </div>
        </div>
      </div>
    </div>
  );
};
