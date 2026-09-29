export type FileFormat = 'json' | 'csv' | 'xml' | 'pdf' | 'txt' | 'binary';

export type CheckStatus = 'PASS' | 'FAIL' | 'WARN' | 'SKIPPED';

export interface SecurityCheckResult {
  id: string;
  name: string;
  category: 'Structure' | 'Security' | 'Integrity' | 'Authentication' | 'AI Inspection';
  status: CheckStatus;
  message: string;
  details?: string;
  executionTimeMs: number;
}

export interface AIAgentAnalysis {
  decision: 'ACCEPT' | 'REJECT';
  confidenceScore: number; // 0-100
  threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  reasoning: string[];
  remediationAdvice?: string;
  flaggedPatterns: string[];
}

export interface ValidationReport {
  id: string;
  timestamp: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  checksumSha256: string;
  overallResult: 'ACCEPT' | 'REJECT';
  totalDurationMs: number;
  checkResults: SecurityCheckResult[];
  aiAnalysis: AIAgentAnalysis;
  clientIp: string;
  authSubject?: string;
}

export interface SecurityRulesConfig {
  maxSizeBytes: number; // e.g. 5MB
  allowedFormats: FileFormat[];
  requireAuthHeader: boolean;
  requireHmacSignature: boolean;
  hmacSecret: string;
  strictSchemaValidation: boolean;
  blockExecutables: boolean;
  detectSqlInjection: boolean;
  detectXss: boolean;
  detectPathTraversal: boolean;
  rateLimitPerMinute: number;
  aiStrictness: 'LENIENT' | 'BALANCED' | 'PARANOID';
  aiModelName: string;
  customRules: {
    requiredJsonKeys: string[];
    forbiddenKeywords: string[];
  };
}

export interface SamplePayload {
  id: string;
  title: string;
  description: string;
  category: 'Valid' | 'Schema Defect' | 'Security Threat' | 'Malware Risk' | 'Signature Mismatch';
  fileName: string;
  format: FileFormat;
  mimeType: string;
  content: string;
  expectedDecision: 'ACCEPT' | 'REJECT';
  notes: string;
  authHeader?: string;
  signatureHeader?: string;
}

export interface ArchitectureNode {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  techStack: string[];
  role: string;
}
