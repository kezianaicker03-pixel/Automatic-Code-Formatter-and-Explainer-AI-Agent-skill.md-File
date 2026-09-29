import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { runSecurityEngine, DEFAULT_RULES } from "./src/utils/securityEngine.js";
import { SecurityRulesConfig, ValidationReport } from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.text({ limit: "10mb" }));

// Initialize Gemini API client if environment key exists
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// In-memory Audit Log Store & Rules Config
let auditLogs: ValidationReport[] = [];
let currentRules: SecurityRulesConfig = { ...DEFAULT_RULES };

// API Route 1: Validate Incoming Push Payload File
app.post("/api/validate", async (req, res) => {
  try {
    const { fileName, fileContent, mimeType, authHeader, signatureHeader } = req.body;

    if (!fileName || fileContent === undefined) {
      return res.status(400).json({ error: "fileName and fileContent are required parameters" });
    }

    // Step 1: Run Security Rule Engine
    const report = await runSecurityEngine(
      fileName,
      fileContent,
      mimeType || "application/json",
      authHeader,
      signatureHeader,
      currentRules
    );

    // Step 2: If Gemini API key is available, enhance with Server-Side Gemini AI Inspection
    if (ai) {
      try {
        const prompt = `
You are a Senior API Security Architect & DevSecOps Gatekeeper AI Agent.
Analyze the following incoming push file for subtle security vulnerabilities, malformed structure, prompt injections, or malicious intents.

File Details:
- Filename: ${fileName}
- MIME Type: ${mimeType || "application/json"}
- Content Snippet:
${fileContent.substring(0, 1500)}

Static Checks Result:
- Overall Status: ${report.overallResult}
- Failed Checks Count: ${report.checkResults.filter((c) => c.status === "FAIL").length}

Respond ONLY in valid JSON with this exact structure:
{
  "summary": "1-2 sentence executive summary of security findings",
  "threatLevel": "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidenceScore": 0 to 100,
  "reasoning": ["Point 1", "Point 2", "Point 3"],
  "remediationAdvice": "Clear remediation guidance if rejected"
}
`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const rawText = aiResponse.text?.trim() || "{}";
        const parsed = JSON.parse(rawText);

        if (parsed.summary) {
          report.aiAnalysis.summary = `[Gemini 3.6 Flash Verified] ${parsed.summary}`;
          report.aiAnalysis.threatLevel = parsed.threatLevel || report.aiAnalysis.threatLevel;
          report.aiAnalysis.confidenceScore = parsed.confidenceScore || report.aiAnalysis.confidenceScore;
          if (parsed.reasoning && Array.isArray(parsed.reasoning)) {
            report.aiAnalysis.reasoning = parsed.reasoning;
          }
          if (parsed.remediationAdvice) {
            report.aiAnalysis.remediationAdvice = parsed.remediationAdvice;
          }
        }
      } catch (geminiError: any) {
        console.warn("Gemini AI API call fallback:", geminiError?.message || geminiError);
        report.aiAnalysis.summary += " (Processed via deterministic security engine fallback)";
      }
    }

    // Write to audit store
    auditLogs.unshift(report);
    if (auditLogs.length > 500) auditLogs.pop(); // Keep last 500

    return res.json(report);
  } catch (error: any) {
    console.error("Validation error:", error);
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// API Route 2: Get Audit Logs
app.get("/api/audit-logs", (req, res) => {
  res.json({ logs: auditLogs });
});

// API Route 3: Clear Audit Logs
app.delete("/api/audit-logs", (req, res) => {
  auditLogs = [];
  res.json({ status: "ok", message: "Audit logs cleared." });
});

// API Route 4: Get/Update Rules Configuration
app.get("/api/rules", (req, res) => {
  res.json(currentRules);
});

app.post("/api/rules", (req, res) => {
  currentRules = { ...currentRules, ...req.body };
  res.json({ status: "ok", rules: currentRules });
});

// API Route 5: System Health & Status
app.get("/api/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    geminiEnabled: !!ai,
    rulesActive: Object.keys(currentRules).length,
    auditLogCount: auditLogs.length,
    timestamp: new Date().toISOString(),
  });
});

// Vite Development or Production Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI Push Gatekeeper Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
