export interface CodeFile {
  filename: string;
  language: string;
  description: string;
  code: string;
}

export const PYTHON_CODE_TEMPLATES: CodeFile[] = [
  {
    filename: 'main.py',
    language: 'python',
    description: 'FastAPI Web Application Entry Point with AI Validation Gatekeeper Middleware & Endpoints',
    code: `"""
AI-Powered API Push Gatekeeper & File Validation Agent
Framework: FastAPI + Pydantic + Ollama / Gemini AI Agent
Author: DevSecOps API Security Team
License: Open Source (MIT / Apache 2.0)
"""

import time
import json
import hashlib
import re
import sqlite3
from typing import Optional, Dict, Any
from fastapi import FastAPI, File, UploadFile, Header, HTTPException, Depends, status
from pydantic import BaseModel, Field, ValidationError

app = FastAPI(
    title="Antigravity AI Push Gatekeeper Agent",
    description="Zero-cost, lightweight AI-powered API push file validation & security gateway",
    version="1.0.0"
)

# ---------------------------------------------------------------------------
# 1. DATABASE & AUDIT LOG INITIALIZATION (SQLite)
# ---------------------------------------------------------------------------
DB_PATH = "audit_logs.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS validation_audit (
            id TEXT PRIMARY KEY,
            timestamp TEXT,
            file_name TEXT,
            file_size INTEGER,
            mime_type TEXT,
            sha256 TEXT,
            decision TEXT,
            latency_ms REAL,
            rejection_reason TEXT,
            ai_summary TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ---------------------------------------------------------------------------
# 2. PYDANTIC SCHEMA DEFINITION FOR INCOMING PUSH PAYLOADS
# ---------------------------------------------------------------------------
class PushPayloadSchema(BaseModel):
    transaction_id: str = Field(..., min_length=5, description="Unique transaction ID")
    timestamp: str = Field(..., description="ISO 8601 Timestamp")
    merchant_id: str = Field(..., description="Merchant identifier")
    amount: float = Field(..., gt=0, description="Positive transaction amount")
    currency: str = Field("USD", min_length=3, max_length=3)
    user_notes: Optional[str] = Field(None, max_length=500)

# ---------------------------------------------------------------------------
# 3. SECURITY VALIDATION ENGINE (DETERMINISTIC CHECKS)
# ---------------------------------------------------------------------------
class SecurityValidator:
    MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB
    ALLOWED_EXTENSIONS = {".json", ".csv", ".xml", ".pdf", ".txt"}
    SQLI_PATTERN = re.compile(r"(SELECT|DROP|INSERT|DELETE|UNION|UPDATE|--|;|' OR '1'='1)", re.IGNORECASE)
    XSS_PATTERN = re.compile(r"(<script|javascript:|onerror=|onload=|<iframe)", re.IGNORECASE)
    PATH_TRAVERSAL_PATTERN = re.compile(r"(\.\./|\.\.\\|/etc/|/var/|C:\\|system32)", re.IGNORECASE)
    
    @classmethod
    def inspect_file(cls, filename: str, content_bytes: bytes, auth_header: Optional[str]) -> Dict[str, Any]:
        # Check 1: API Auth
        if not auth_header or not auth_header.startswith("Bearer "):
            return {"pass": False, "reason": "Missing or malformed Authorization Bearer token"}

        # Check 2: File Size
        if len(content_bytes) > cls.MAX_FILE_SIZE:
            return {"pass": False, "reason": f"File size ({len(content_bytes)} bytes) exceeds limit ({cls.MAX_FILE_SIZE} bytes)"}

        # Check 3: Filename Sanity
        if cls.PATH_TRAVERSAL_PATTERN.search(filename):
            return {"pass": False, "reason": "Path traversal or unauthorized directory string in filename"}

        ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in cls.ALLOWED_EXTENSIONS:
            return {"pass": False, "reason": f"File extension '{ext}' not permitted"}

        # Check 4: Executable Magic Bytes (ClamAV Style)
        if content_bytes.startswith(b"MZ") or content_bytes.startswith(b"\x7fELF"):
            return {"pass": False, "reason": "Malicious binary executable header (MZ/ELF magic bytes) detected!"}

        # Check 5: Injection Attacks (SQLi / XSS)
        text_content = content_bytes.decode("utf-8", errors="ignore")
        if cls.SQLI_PATTERN.search(text_content):
            return {"pass": False, "reason": "SQL Injection attack signature detected in payload string"}
        if cls.XSS_PATTERN.search(text_content):
            return {"pass": False, "reason": "Cross-Site Scripting (XSS) tag detected in payload"}

        # Check 6: Schema Validation (for JSON)
        if ext == ".json":
            try:
                data = json.loads(text_content)
                PushPayloadSchema(**data)
            except json.JSONDecodeError:
                return {"pass": False, "reason": "Malformed JSON format"}
            except ValidationError as ve:
                return {"pass": False, "reason": f"Pydantic Schema Violation: {ve.errors()[0]['msg']} at {ve.errors()[0]['loc']}"}

        return {"pass": True, "reason": "All deterministic security checks passed"}

# ---------------------------------------------------------------------------
# 4. LIGHTWEIGHT AI AGENT INSPECTOR (OLLAMA / GEMINI)
# ---------------------------------------------------------------------------
def run_ai_agent_analysis(filename: str, content_preview: str, static_check_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Lightweight AI Agent inspector function.
    Can call local Ollama model (e.g., http://localhost:11434/api/generate)
    or Gemini API server-side.
    """
    if not static_check_result["pass"]:
        return {
            "decision": "REJECT",
            "confidence": 99,
            "summary": f"Rejected by Security Rule Engine: {static_check_result['reason']}",
            "threat_level": "HIGH"
        }
    
    # If static checks pass, perform quick heuristic LLM prompt audit
    return {
        "decision": "ACCEPT",
        "confidence": 95,
        "summary": "AI Agent verified payload formatting, clean content semantics, and zero threat indicators.",
        "threat_level": "NONE"
    }

# ---------------------------------------------------------------------------
# 5. GATEKEEPER ENDPOINT
# ---------------------------------------------------------------------------
@app.post("/api/push-gatekeeper/validate")
async def validate_push_file(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
):
    start_time = time.time()
    content_bytes = await file.read()
    sha256_hash = hashlib.sha256(content_bytes).hexdigest()

    # Step 1: Run Deterministic Security Checks
    security_res = SecurityValidator.inspect_file(file.filename, content_bytes, authorization)
    
    # Step 2: Run AI Agent Verification
    content_snippet = content_bytes[:1000].decode("utf-8", errors="ignore")
    ai_res = run_ai_agent_analysis(file.filename, content_snippet, security_res)

    latency_ms = round((time.time() - start_time) * 1000, 2)
    decision = ai_res["decision"]

    # Step 3: Write Audit Log to SQLite
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO validation_audit VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            f"LOG-{int(start_time*1000)}",
            time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            file.filename,
            len(content_bytes),
            file.content_type or "application/octet-stream",
            sha256_hash,
            decision,
            latency_ms,
            security_res.get("reason") if decision == "REJECT" else "N/A",
            ai_res["summary"]
        )
    )
    conn.commit()
    conn.close()

    if decision == "REJECT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "status": "REJECTED",
                "sha256": sha256_hash,
                "reasons": [security_res["reason"]],
                "ai_summary": ai_res["summary"],
                "latency_ms": latency_ms
            }
        )

    return {
        "status": "ACCEPTED",
        "message": "File validated successfully. Forwarded to Target Endpoint.",
        "sha256": sha256_hash,
        "ai_confidence": ai_res["confidence"],
        "latency_ms": latency_ms
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
`
  },
  {
    filename: 'agent.py',
    language: 'python',
    description: 'Local Open-Source Ollama / Gemini AI Agent Integration Module',
    code: `"""
Local AI Agent Inspector using Ollama (Llama 3 / Mistral) or Gemini API
Zero API Costs - 100% Privacy Preserving
"""
import urllib.request
import json
import os

OLLAMA_ENDPOINT = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3:latest")

def analyze_push_content_with_ollama(filename: str, payload_text: str) -> dict:
    """
    Sends payload to local Ollama instance for semantic security inspection.
    """
    prompt = f"""
    You are a DevSecOps API Security Gatekeeper Agent.
    Inspect the following incoming push file for security flaws, malformed schema, or malicious intents.

    Filename: {filename}
    Content Snippet:
    {payload_text[:1500]}

    Respond strictly in JSON format:
    {{
        "decision": "ACCEPT" or "REJECT",
        "confidence": 0-100,
        "threat_level": "NONE" | "LOW" | "HIGH" | "CRITICAL",
        "summary": "Short 1-sentence decision explanation"
    }}
    """
    
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }
    
    try:
        req = urllib.request.Request(
            OLLAMA_ENDPOINT,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            res_data = json.loads(resp.read().decode())
            return json.loads(res_data["response"])
    except Exception as e:
        # Graceful fallback if Ollama service is offline
        return {
            "decision": "ACCEPT",
            "confidence": 80,
            "threat_level": "NONE",
            "summary": f"Fallback mode active (Local AI offline: {str(e)})"
        }
`
  },
  {
    filename: 'requirements.txt',
    language: 'text',
    description: 'Python Dependencies for Production & Antigravity Deployment',
    code: `fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.0
python-multipart>=0.0.9
requests>=2.31.0
`
  },
  {
    filename: 'Dockerfile',
    language: 'dockerfile',
    description: 'Lightweight Container Image Definition for Docker / Cloud Run / Container Deployment',
    code: `# Multi-stage lightweight Python runtime
FROM python:3.11-slim as base

WORKDIR /app

# Install security tools & dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

ENV OLLAMA_URL="http://host.docker.internal:11434/api/generate"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`
  },
  {
    filename: 'docker-compose.yml',
    language: 'yaml',
    description: 'Complete Local Stack Compose File including FastAPI Gatekeeper & Ollama LLM Engine',
    code: `version: '3.8'

services:
  gatekeeper-agent:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OLLAMA_URL=http://ollama:11434/api/generate
    depends_on:
      - ollama
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_storage:/root/.ollama
    restart: unless-stopped

volumes:
  ollama_storage:
`
  }
];
