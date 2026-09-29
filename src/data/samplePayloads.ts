import { SamplePayload } from '../types';

export const SAMPLE_PAYLOADS: SamplePayload[] = [
  {
    id: 'valid-order-json',
    title: 'Valid Enterprise Order (JSON)',
    description: 'Clean, standard JSON push payload with valid types, schema compliance, and signature.',
    category: 'Valid',
    fileName: 'order_20260730_9912.json',
    format: 'json',
    mimeType: 'application/json',
    expectedDecision: 'ACCEPT',
    notes: 'Meets all schema, type, encoding, size, and cryptographic signature checks.',
    authHeader: 'Bearer devsecops_token_984a12c',
    signatureHeader: 'sha256=7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    content: JSON.stringify(
      {
        transaction_id: 'TXN-90218-EXP',
        timestamp: '2026-07-30T14:32:00Z',
        merchant_id: 'MCH-55104',
        amount: 249.99,
        currency: 'USD',
        items: [
          { sku: 'SKU-LOG-01', quantity: 2, unit_price: 99.99 },
          { sku: 'SKU-ACC-05', quantity: 1, unit_price: 50.01 }
        ],
        customer: {
          email: 'jane.smith@enterprise.org',
          account_status: 'ACTIVE'
        }
      },
      null,
      2
    )
  },
  {
    id: 'sqli-xss-attack',
    title: 'SQL Injection & XSS Attack Payload',
    description: 'Incoming payload containing embedded SQL injection string and malicious XSS script tag.',
    category: 'Security Threat',
    fileName: 'push_feedback_data.json',
    format: 'json',
    mimeType: 'application/json',
    expectedDecision: 'REJECT',
    notes: 'Blocked by Payload Integrity Check and AI Threat Inspector.',
    authHeader: 'Bearer devsecops_token_984a12c',
    signatureHeader: 'sha256=invalid_dummy_sig',
    content: JSON.stringify(
      {
        transaction_id: 'TXN-999999',
        timestamp: '2026-07-30T14:35:10Z',
        merchant_id: 'MCH-ATTACKER',
        user_notes: "'; DROP TABLE users; -- <script>alert(document.cookie)</script>",
        customer: {
          email: "admin' OR '1'='1",
          account_status: "<iframe src='http://evil.com/steal'></iframe>"
        }
      },
      null,
      2
    )
  },
  {
    id: 'executable-binary-pdf',
    title: 'Disguised Executable Binary (.exe / ELF)',
    description: 'File named report.pdf but containing MZ / PE executable binary header magic bytes.',
    category: 'Malware Risk',
    fileName: 'quarterly_financial_report.pdf',
    format: 'binary',
    mimeType: 'application/pdf',
    expectedDecision: 'REJECT',
    notes: 'Blocked by Binary Magic Byte inspection (MZ / 4D 5A header detection).',
    authHeader: 'Bearer devsecops_token_984a12c',
    content: `MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF\x00\x00\xB8\x00\x00\x00 This program cannot be run in DOS mode.
PE\x00\x00L\x01\x03\x00 ... MALICIOUS_PAYLOAD_EXECUTE_SHELLCODE_HERE ...`
  },
  {
    id: 'missing-fields-schema',
    title: 'Schema Defect: Missing Required Fields',
    description: 'Payload is valid JSON but misses mandatory keys like transaction_id & customer email.',
    category: 'Schema Defect',
    fileName: 'incomplete_order.json',
    format: 'json',
    mimeType: 'application/json',
    expectedDecision: 'REJECT',
    notes: 'Blocked by Schema & Required Field Validation (Pydantic rule).',
    authHeader: 'Bearer devsecops_token_984a12c',
    content: JSON.stringify(
      {
        timestamp: '2026-07-30T12:00:00Z',
        amount: null,
        items: []
      },
      null,
      2
    )
  },
  {
    id: 'path-traversal-filename',
    title: 'Path Traversal Filename Exploit',
    description: 'Filename contains malicious relative path sequences to overwrite system files.',
    category: 'Security Threat',
    fileName: '../../../../etc/passwd',
    format: 'txt',
    mimeType: 'text/plain',
    expectedDecision: 'REJECT',
    notes: 'Blocked by Filename Sanity & Character Encoding check.',
    authHeader: 'Bearer devsecops_token_984a12c',
    content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin'
  },
  {
    id: 'tampered-signature',
    title: 'HMAC Signature Mismatch / Payload Tampered',
    description: 'Valid structured data where payload body was modified after signature generation.',
    category: 'Signature Mismatch',
    fileName: 'secure_telemetry.json',
    format: 'json',
    mimeType: 'application/json',
    expectedDecision: 'REJECT',
    notes: 'Blocked by SHA-256 HMAC Signature Verification.',
    authHeader: 'Bearer devsecops_token_984a12c',
    signatureHeader: 'sha256=1111111111111111111111111111111111111111111111111111111111111111',
    content: JSON.stringify(
      {
        device_id: 'IOT-SENSOR-409',
        reading: 98.6,
        status: 'TAMPERED_MODIFIED_VAL'
      },
      null,
      2
    )
  },
  {
    id: 'valid-sensor-csv',
    title: 'Valid Telemetry Logs (CSV)',
    description: 'Clean high-volume sensor log file adhering to standard CSV column formatting.',
    category: 'Valid',
    fileName: 'sensor_telemetry_batch_44.csv',
    format: 'csv',
    mimeType: 'text/csv',
    expectedDecision: 'ACCEPT',
    notes: 'Meets column structure, encoding, and data type guidelines.',
    authHeader: 'Bearer devsecops_token_984a12c',
    content: `timestamp,sensor_id,temperature,pressure,status
2026-07-30T14:00:00Z,SN-102,23.5,101.3,NORMAL
2026-07-30T14:01:00Z,SN-102,23.8,101.4,NORMAL
2026-07-30T14:02:00Z,SN-102,24.1,101.2,NORMAL`
  }
];
