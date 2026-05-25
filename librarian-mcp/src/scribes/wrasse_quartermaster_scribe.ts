/**
 * Wrasse-Quartermaster Scribe — Layer B TypeScript substrate-side implementation
 *
 * Port of Bishop's Python PreToolUse hook at:
 *   ~/.claude/hooks/bishop_wrasse_quartermaster_path_manifest_inject.py
 *
 * Founder-ratified: BP056B 2026-05-24 "Provides the clothing and supplies."
 * Canon: project_wrasse_class_dispatch_prompt_auto_injection_path_manifest_bp056b
 * Tier: TIER Z · W5b Channel 1 Extension · BP057 RETRY GOLD
 *
 * Layer B responsibilities (vs Layer A Python hook):
 *   - Outgoing dispatch interceptor (pre-publish audit + inject)
 *   - §0 PATH MANIFEST auto-injection (substrate-side, not hook-side)
 *   - Pearl-aware: manifest emitted as Pearl-reference for known-state patterns
 *   - Audit-logged to substrate (JSONL at ~/.lb-session/wrasse_quartermaster_audit.jsonl)
 *   - Counsel back-ratify CCF tag on every intercepted dispatch
 *
 * Modes (env var LB_WRASSE_QM_MODE):
 *   off    (default) — no-op, zero overhead
 *   audit  — detect + audit-log, DO NOT modify
 *   warn   — audit + stderr WARNING
 *   inject — audit + prepend §0 PATH MANIFEST (Layer B full inject)
 *   block  — audit + throw WrasseBlockError (caller must rewrite)
 */

import {
  existsSync,
  mkdirSync,
  appendFileSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { resolve } from "path";
import { homedir } from "os";

// ─── Mode & Config ────────────────────────────────────────────────────────────

export type WrasseQMMode = "off" | "audit" | "warn" | "inject" | "block";

export function getMode(): WrasseQMMode {
  const raw = (process.env["LB_WRASSE_QM_MODE"] || "off").toLowerCase();
  const valid: WrasseQMMode[] = ["off", "audit", "warn", "inject", "block"];
  return valid.includes(raw as WrasseQMMode) ? (raw as WrasseQMMode) : "off";
}

// ─── Paths ────────────────────────────────────────────────────────────────────

export const WRASSE_AUDIT_DIR = resolve(homedir(), ".lb-session");
export const WRASSE_AUDIT_LOG = resolve(WRASSE_AUDIT_DIR, "wrasse_quartermaster_audit.jsonl");

function ensureAuditDir(): void {
  if (!existsSync(WRASSE_AUDIT_DIR)) mkdirSync(WRASSE_AUDIT_DIR, { recursive: true });
}

// ─── §0 PATH MANIFEST (canonical — mirrors Python hook Layer A) ───────────────

export const PATH_MANIFEST_PREAMBLE = `## §0 — PATH MANIFEST (Wrasse-Quartermaster Layer B auto-injected)

**Substrate-internal → product-name mapping (BP054 leak):**
- \`amplify-computer/\` → **Mnemosyne™** (do not rename without mapping)

**Top artifact paths (absolute):**
- Mnemosyne source root: \`C:\\\\Users\\\\Administrator\\\\Documents\\\\LianaBanyanPlatform\\\\\`
- Mnemosyne package.json: \`C:\\\\Users\\\\Administrator\\\\Documents\\\\LianaBanyanPlatform\\\\package.json\`
- Cephas Hugo source: \`C:\\\\Users\\\\Administrator\\\\Documents\\\\LianaBanyanPlatform\\\\Cephas\\\\cephas-hugo\\\\\`
- Cephas Hugo build: \`C:\\\\Users\\\\Administrator\\\\Documents\\\\LianaBanyanPlatform\\\\Cephas\\\\cephas-hugo\\\\public\\\\\`
- Firebase SA key: \`C:\\\\Users\\\\Administrator\\\\.config\\\\gcloud\\\\lianabanyan-sa-key.json\` (GOOGLE_APPLICATION_CREDENTIALS set — NEVER firebase login --reauth)
- BISHOP_DROPZONE: \`C:\\\\Users\\\\Administrator\\\\Documents\\\\LianaBanyanPlatform\\\\BISHOP_DROPZONE\\\\\`
- Founder review folder: \`C:\\\\Users\\\\Administrator\\\\Documents\\\\LianaBanyanPlatform\\\\BISHOP_DROPZONE\\\\00_FOUNDER_REVIEW\\\\\`
- CANON eblets: \`C:\\\\Users\\\\Administrator\\\\.claude\\\\state\\\\eblets\\\\CANON\\\\\`
- CANON manifest: \`C:\\\\Users\\\\Administrator\\\\.claude\\\\state\\\\eblets\\\\CANON\\\\_MANIFEST.md\`
- Pearl registry: \`C:\\\\Users\\\\Administrator\\\\Documents\\\\LianaBanyanPlatform\\\\Asteroid-ProofVault\\\\pearl_registry\\\\\`
- Asteroid-ProofVault: \`C:\\\\Users\\\\Administrator\\\\Documents\\\\LianaBanyanPlatform\\\\Asteroid-ProofVault\\\\\`
- bishop_coffee.md: \`C:\\\\Users\\\\Administrator\\\\.claude\\\\state\\\\bishop_coffee.md\`
- Bridge MCP: \`C:\\\\Users\\\\Administrator\\\\Documents\\\\LianaBanyanPlatform\\\\ARCHIVE2April2026\\\\Agora\\\\build\\\\knight-bishop-bridge-mcp.js\`
- Librarian-mcp Node: \`C:\\\\Users\\\\Administrator\\\\Documents\\\\LianaBanyanPlatform\\\\librarian-mcp\\\\dist\\\\server.js\`

**Pearl Prerogative:** For full registry + version stamps + tier-partition guidance, pearl_decode canonical_ref \`feedback_knight_dispatch_prompt_must_include_path_manifest_version_stamps_tier_partition_bp056b\`.

**CCF tag:** wrasse-qm-layer-b-injected · audit-logged · substrate-side

---

`;

// ─── Artifact Detection Patterns ──────────────────────────────────────────────

const ARTIFACT_PATTERNS: RegExp[] = [
  /\bMnemosyne\b/i,
  /\bamplify-computer\b/i,
  /\bCephas\b/i,
  /\bAsteroid[- ]?ProofVault\b/i,
  /\bBISHOP_DROPZONE\b/,
  /\bCANON\s*manifest\b/i,
  /\bbishop_coffee\.md\b/i,
  /\bLianaBanyanKNIGHT\b/,
  /\bLianaBanyanBISHOP\b/,
  /\bfounder_data_mining\b/i,
  /\bfirebase\b/i,
  /\bpearl_registry\b/i,
  /\bbanyan[_ ]?metric[_ ]?ledger\b/i,
  /\bAgora\b/,
  /\blibrarian-mcp\b/i,
  /\bbridge[- ]?mcp\b/i,
];

const MANIFEST_MARKER = /(?:§0\s*[—\-]?\s*PATH\s*MANIFEST|##\s*§0|PATH\s*MANIFEST\s*\(Wrasse)/i;
const EXEMPT_MARKER = /<!--\s*wrasse-qm-exempt\s*:\s*([^\-][^>]*?)\s*-->/i;
const MIN_CONTENT_LENGTH = 800;

export function detectArtifacts(content: string): string[] {
  return ARTIFACT_PATTERNS
    .map((pat) => { const m = pat.exec(content); return m ? m[0] : null; })
    .filter((x): x is string => x !== null);
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface WrasseAuditEntry {
  ts: string;
  verdict: "manifest_present" | "manifest_missing" | "manifest_injected" | "inject_failed" | "exempt" | "no_artifacts";
  to?: string;
  type?: string;
  content_chars: number;
  artifacts_referenced?: string[];
  mode: WrasseQMMode;
  preamble_chars?: number;
  final_chars?: number;
  error?: string;
  pearl_ref?: string;
  ccf_tag?: string;
}

export function appendAudit(entry: WrasseAuditEntry): void {
  try {
    ensureAuditDir();
    appendFileSync(WRASSE_AUDIT_LOG, JSON.stringify(entry) + "\n", "utf8");
  } catch {
    // Fail-safe: never throw on audit failure
  }
}

// ─── Dispatch Descriptor ─────────────────────────────────────────────────────

export interface DispatchDescriptor {
  to: string;
  type: string;
  content: string;
}

// ─── Custom Error ─────────────────────────────────────────────────────────────

export class WrasseBlockError extends Error {
  constructor(to: string, artifactCount: number, artifacts: string[]) {
    super(
      `[Wrasse-Quartermaster BLOCK] Dispatch to ${to} references ` +
      `${artifactCount} substrate-class artifacts (${artifacts.slice(0, 5).join(", ")}) ` +
      `without §0 PATH MANIFEST. Rewrite with §0 PATH MANIFEST preamble or add ` +
      `<!-- wrasse-qm-exempt: <reason> -->.`
    );
    this.name = "WrasseBlockError";
  }
}

// ─── Core Interceptor ─────────────────────────────────────────────────────────

/**
 * Intercept an outgoing dispatch.
 *
 * Returns the (possibly modified) content string.
 * Throws WrasseBlockError in block mode when artifacts are found without manifest.
 *
 * Fail-safe: on any unexpected error, returns content unchanged and appends audit entry.
 */
export function interceptDispatch(dispatch: DispatchDescriptor): string {
  const mode = getMode();
  if (mode === "off") return dispatch.content;

  try {
    const { to, type, content } = dispatch;

    // Class filter: only task | request dispatch-class messages
    if (!["task", "request"].includes(type.toLowerCase())) return content;

    // Recipient filter: downstream cathedrals only
    if (!["KNIGHT", "PAWN", "ROOK", "BOTH"].includes(to.toUpperCase())) return content;

    // Length floor
    if (content.length < MIN_CONTENT_LENGTH) return content;

    // Exemption
    if (EXEMPT_MARKER.test(content)) {
      appendAudit({
        ts: new Date().toISOString(),
        verdict: "exempt",
        to, type, content_chars: content.length, mode,
      });
      return content;
    }

    // Manifest already present?
    if (MANIFEST_MARKER.test(content)) {
      appendAudit({
        ts: new Date().toISOString(),
        verdict: "manifest_present",
        to, type, content_chars: content.length, mode,
        ccf_tag: "wrasse-qm-manifest-honored",
      });
      return content;
    }

    const artifacts = detectArtifacts(content);
    if (artifacts.length === 0) {
      appendAudit({
        ts: new Date().toISOString(),
        verdict: "no_artifacts",
        to, type, content_chars: content.length, mode,
      });
      return content;
    }

    // MISS DETECTED
    const uniqueArtifacts = [...new Set(artifacts)];

    if (mode === "audit") {
      appendAudit({
        ts: new Date().toISOString(),
        verdict: "manifest_missing",
        to, type, content_chars: content.length,
        artifacts_referenced: uniqueArtifacts, mode,
      });
      return content;
    }

    if (mode === "warn") {
      console.warn(
        `[Wrasse-Quartermaster WARN] Dispatch to ${to} references ` +
        `${uniqueArtifacts.length} substrate-class artifacts ` +
        `(${uniqueArtifacts.slice(0, 5).join(", ")}) without §0 PATH MANIFEST.`
      );
      appendAudit({
        ts: new Date().toISOString(),
        verdict: "manifest_missing",
        to, type, content_chars: content.length,
        artifacts_referenced: uniqueArtifacts, mode,
      });
      return content;
    }

    if (mode === "block") {
      appendAudit({
        ts: new Date().toISOString(),
        verdict: "manifest_missing",
        to, type, content_chars: content.length,
        artifacts_referenced: uniqueArtifacts, mode,
        ccf_tag: "wrasse-qm-block-thrown",
      });
      throw new WrasseBlockError(to, uniqueArtifacts.length, uniqueArtifacts);
    }

    if (mode === "inject") {
      const modified = PATH_MANIFEST_PREAMBLE + content;
      appendAudit({
        ts: new Date().toISOString(),
        verdict: "manifest_injected",
        to, type, content_chars: content.length,
        artifacts_referenced: uniqueArtifacts, mode,
        preamble_chars: PATH_MANIFEST_PREAMBLE.length,
        final_chars: modified.length,
        pearl_ref: "feedback_knight_dispatch_prompt_must_include_path_manifest_version_stamps_tier_partition_bp056b",
        ccf_tag: "wrasse-qm-layer-b-injected",
      });
      return modified;
    }

    return content;

  } catch (err) {
    if (err instanceof WrasseBlockError) throw err;
    // Fail-safe: on unexpected error, return unchanged
    try {
      appendAudit({
        ts: new Date().toISOString(),
        verdict: "inject_failed",
        to: dispatch.to, type: dispatch.type,
        content_chars: dispatch.content.length,
        mode: getMode(),
        error: String(err),
      });
    } catch { /* double fail-safe */ }
    return dispatch.content;
  }
}

// ─── Audit Summary ────────────────────────────────────────────────────────────

export interface WrasseAuditSummary {
  total: number;
  manifest_present: number;
  manifest_missing: number;
  manifest_injected: number;
  exempt: number;
  no_artifacts: number;
  inject_failed: number;
  by_recipient: Record<string, number>;
  by_mode: Record<string, number>;
}

export function readAuditSummary(): WrasseAuditSummary {
  const summary: WrasseAuditSummary = {
    total: 0,
    manifest_present: 0,
    manifest_missing: 0,
    manifest_injected: 0,
    exempt: 0,
    no_artifacts: 0,
    inject_failed: 0,
    by_recipient: {},
    by_mode: {},
  };

  if (!existsSync(WRASSE_AUDIT_LOG)) return summary;

  try {
    const lines = readFileSync(WRASSE_AUDIT_LOG, "utf8").split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const entry: WrasseAuditEntry = JSON.parse(line);
        summary.total++;
        const v = entry.verdict;
        if (v in summary) (summary as unknown as Record<string, number>)[v]++;
        if (entry.to) {
          summary.by_recipient[entry.to] = (summary.by_recipient[entry.to] || 0) + 1;
        }
        summary.by_mode[entry.mode] = (summary.by_mode[entry.mode] || 0) + 1;
      } catch { /* skip malformed lines */ }
    }
  } catch { /* fail-safe */ }

  return summary;
}

// ─── Report Generator ─────────────────────────────────────────────────────────

export function generateAuditReport(outputPath: string): void {
  const summary = readAuditSummary();
  const injectRate = summary.total > 0
    ? ((summary.manifest_present + summary.manifest_injected) / summary.total * 100).toFixed(1)
    : "0.0";

  const lines = [
    "# Wrasse-Quartermaster Audit Report",
    `## Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total intercepted | ${summary.total} |`,
    `| Manifest already present | ${summary.manifest_present} |`,
    `| Manifest injected (Layer B) | ${summary.manifest_injected} |`,
    `| Manifest missing (audit/warn) | ${summary.manifest_missing} |`,
    `| Exempt (wrasse-qm-exempt marker) | ${summary.exempt} |`,
    `| No artifacts detected | ${summary.no_artifacts} |`,
    `| Inject failed | ${summary.inject_failed} |`,
    `| Manifest compliance rate | ${injectRate}% |`,
    "",
    "## By Recipient",
    "",
    ...Object.entries(summary.by_recipient).map(([k, v]) => `- **${k}:** ${v}`),
    "",
    "## By Mode",
    "",
    ...Object.entries(summary.by_mode).map(([k, v]) => `- **${k}:** ${v}`),
    "",
    "---",
    "",
    `*Wrasse-Quartermaster Layer B · TIER Z · W5b Channel 1 Extension · BP057 RETRY GOLD*`,
  ];

  writeFileSync(outputPath, lines.join("\n"), "utf8");
}

// ─── CLI entry (if run directly) ─────────────────────────────────────────────

if (process.argv[1]?.endsWith("wrasse_quartermaster_scribe.ts") ||
    process.argv[1]?.endsWith("wrasse_quartermaster_scribe.js")) {
  const cmd = process.argv[2];
  if (cmd === "summary") {
    const s = readAuditSummary();
    console.log("[Wrasse-QM] Audit summary:", JSON.stringify(s, null, 2));
  } else if (cmd === "report") {
    const out = process.argv[3] || resolve(process.cwd(), "wrasse_qm_report.md");
    generateAuditReport(out);
    console.log(`[Wrasse-QM] Report written to: ${out}`);
  } else {
    console.log("[Wrasse-QM] Usage: wrasse_quartermaster_scribe [summary|report [output_path]]");
  }
}
