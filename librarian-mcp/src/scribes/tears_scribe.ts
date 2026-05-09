/**
 * Tears Scribe — Substrate-discipline daemon (B81 / BP034 / LB-STACK-0216)
 *
 * Observes loss-after-effort signals and authors Tears Rules:
 *   "no effort is wasted, even when the immediate outcome is loss."
 *
 * CRITICAL GATES (both enforced on every emission):
 *   1. Coroner-first arbitration: signal Coroner claimed → Tears stands down
 *   2. Velvet-Fingers attestation: token absent/expired → queue only, no emission
 *
 * Three modes:
 *   Mode 1 — Trigger-based signal processing: tears_log_signal
 *   Mode 2 — AAR §11 rendezvous: triggered at session close
 *   Mode 3 — Trinity-comparison review: tears_query + trinity_review
 *
 * Storage: ~/.claude/state/tears_scribe/
 *   rules/TR-###_*.yaml                  — individual Tears Rule files
 *   rules/INDEX.md                       — auto-regenerated index
 *   velvet_fingers_attestations.jsonl    — attestation token log
 *   coroner_skip_log.jsonl               — Coroner-skip arbitration log
 *   inaugural_trinity_review_BP034.md   — inaugural review file
 */

import {
  existsSync,
  mkdirSync,
  appendFileSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from "fs";
import { resolve } from "path";
import { homedir } from "os";

// ─── Paths ────────────────────────────────────────────────────────────────

export const TEARS_BASE = resolve(homedir(), ".claude", "state", "tears_scribe");
export const TEARS_RULES_DIR = resolve(TEARS_BASE, "rules");
export const TEARS_INDEX_PATH = resolve(TEARS_RULES_DIR, "INDEX.md");
export const VELVET_ATTESTATIONS_PATH = resolve(TEARS_BASE, "velvet_fingers_attestations.jsonl");
export const CORONER_SKIP_LOG_PATH = resolve(TEARS_BASE, "coroner_skip_log.jsonl");

function ensureDir(p: string): void {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function ensureDirs(): void {
  ensureDir(TEARS_RULES_DIR);
}

// ─── Schema ───────────────────────────────────────────────────────────────

export type LossClass =
  | "prospect-decline"
  | "timing-miss"
  | "first-contact-failure"
  | "outcome-asymmetry"
  | "compound-non-arrival";

export interface TearsSignal {
  ts: string;
  session: string;
  effort_signal: string;
  loss_signal: string;
  loss_class: LossClass;
  source: string;
  coroner_claimed?: boolean;
  coroner_skip_verified?: boolean;
  queued_pending_attestation?: boolean;
}

export interface VelvetFingersAttestation {
  ts: string;
  token_id: string;
  session: string;
  attested_by: string;
  expires_at?: string;
}

export interface CoronerSkipEntry {
  ts: string;
  signal_id: string;
  session: string;
  coroner_verdict: string;
  tears_claimed: boolean;
}

export interface TearsRuleEntry {
  id: string;
  rule_text: string;
  status: string;
  loss_class: string;
  coroner_skip_verified: boolean;
  velvet_fingers_attestation: string;
  authored_date: string;
}

export interface TearsQueryResult {
  rules: TearsRuleEntry[];
  total_rules: number;
  pending_ratification: number;
  ratified: number;
  attestation_active: boolean;
  current_token?: VelvetFingersAttestation;
  queued_signals: number;
  tears_base: string;
}

export interface TrinityReviewResult {
  session_id: string;
  review_path: string;
  sweat_fires: number;
  tears_fires: number;
  coroner_fires: number;
  blood_fires: number;
  tension_cases: string[];
  summary: string;
}

// ─── Velvet-Fingers Attestation Gate ────────────────────────────────────

const ATTESTATION_TTL_HOURS = 48;

export function getLatestAttestation(): VelvetFingersAttestation | null {
  if (!existsSync(VELVET_ATTESTATIONS_PATH)) return null;
  const lines = readFileSync(VELVET_ATTESTATIONS_PATH, "utf-8")
    .trim()
    .split("\n")
    .filter(Boolean);
  if (lines.length === 0) return null;
  try {
    return JSON.parse(lines[lines.length - 1]) as VelvetFingersAttestation;
  } catch {
    return null;
  }
}

export function isAttestationActive(): boolean {
  const att = getLatestAttestation();
  if (!att) return false;
  const ageHours = (Date.now() - new Date(att.ts).getTime()) / 3_600_000;
  return ageHours <= ATTESTATION_TTL_HOURS;
}

export function emitVelvetFingersAttestation(
  session: string,
  attestedBy: string
): VelvetFingersAttestation {
  ensureDirs();
  const tokenId = `VF-${session}-${Date.now()}`;
  const expiresAt = new Date(Date.now() + ATTESTATION_TTL_HOURS * 3_600_000).toISOString();
  const att: VelvetFingersAttestation = {
    ts: new Date().toISOString(),
    token_id: tokenId,
    session,
    attested_by: attestedBy,
    expires_at: expiresAt,
  };
  appendFileSync(VELVET_ATTESTATIONS_PATH, JSON.stringify(att) + "\n", "utf-8");
  return att;
}

// ─── Coroner-First Arbitration Gate ──────────────────────────────────────

export function coroner_claimed(signalId: string): boolean {
  if (!existsSync(CORONER_SKIP_LOG_PATH)) return false;
  const lines = readFileSync(CORONER_SKIP_LOG_PATH, "utf-8").trim().split("\n").filter(Boolean);
  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as CoronerSkipEntry;
      if (entry.signal_id === signalId && entry.coroner_verdict === "claimed") return true;
    } catch { /* skip */ }
  }
  return false;
}

export function logCoronerSkip(entry: Omit<CoronerSkipEntry, "ts">): void {
  ensureDirs();
  const record: CoronerSkipEntry = { ts: new Date().toISOString(), ...entry };
  appendFileSync(CORONER_SKIP_LOG_PATH, JSON.stringify(record) + "\n", "utf-8");
}

// ─── Mode 1: Log Signal ───────────────────────────────────────────────────

const pendingSignalQueue: TearsSignal[] = [];

export function tearsLogSignal(
  signal: Omit<TearsSignal, "ts">
): { status: "emitted" | "queued" | "coroner_claimed"; signal_id: string } {
  ensureDirs();
  const ts = new Date().toISOString();
  const signalId = `TEARS-${signal.session}-${Date.now()}`;

  // Gate 1: Coroner-first arbitration
  if (coroner_claimed(signalId) || signal.coroner_claimed) {
    logCoronerSkip({
      signal_id: signalId,
      session: signal.session,
      coroner_verdict: "claimed",
      tears_claimed: false,
    });
    return { status: "coroner_claimed", signal_id: signalId };
  }

  // Log Coroner skip (nothing broke)
  logCoronerSkip({
    signal_id: signalId,
    session: signal.session,
    coroner_verdict: "skip",
    tears_claimed: true,
  });

  // Gate 2: Velvet-Fingers attestation
  if (!isAttestationActive()) {
    const queued: TearsSignal = {
      ts,
      ...signal,
      coroner_skip_verified: true,
      queued_pending_attestation: true,
    };
    pendingSignalQueue.push(queued);
    return { status: "queued", signal_id: signalId };
  }

  // Both gates passed — emit
  const entry: TearsSignal = {
    ts,
    ...signal,
    coroner_skip_verified: true,
    queued_pending_attestation: false,
  };
  const logPath = resolve(TEARS_BASE, "signal_log.jsonl");
  ensureDir(TEARS_BASE);
  appendFileSync(logPath, JSON.stringify(entry) + "\n", "utf-8");

  return { status: "emitted", signal_id: signalId };
}

// ─── Mode 3: Query ────────────────────────────────────────────────────────

function parseTearsRuleFromYaml(raw: string): Partial<TearsRuleEntry> {
  const get = (key: string): string => {
    const m = raw.match(new RegExp(`^\\s{2}${key}:\\s*"?([^"\\n]+)"?`, "m"));
    return m ? m[1].trim() : "";
  };
  const getBool = (key: string): boolean => {
    const v = get(key);
    return v === "true" || v === "yes";
  };
  return {
    id: get("id"),
    rule_text: get("rule_text"),
    status: get("ratification_status"),
    loss_class: get("loss_class"),
    coroner_skip_verified: getBool("coroner_skip_verified"),
    velvet_fingers_attestation: get("velvet_fingers_attestation"),
    authored_date: get("authored_date"),
  };
}

export function tearsQuery(): TearsQueryResult {
  ensureDirs();

  const rules: TearsRuleEntry[] = [];
  if (existsSync(TEARS_RULES_DIR)) {
    const files = readdirSync(TEARS_RULES_DIR).filter(
      (f) => f.endsWith(".yaml") && f.startsWith("TR-")
    );
    for (const file of files.sort()) {
      try {
        const raw = readFileSync(resolve(TEARS_RULES_DIR, file), "utf-8");
        const parsed = parseTearsRuleFromYaml(raw);
        if (parsed.id) rules.push(parsed as TearsRuleEntry);
      } catch { /* skip */ }
    }
  }

  const pending = rules.filter((r) => r.status !== "ratified");
  const ratified = rules.filter((r) => r.status === "ratified");
  const att = getLatestAttestation();
  const attestationActive = isAttestationActive();

  return {
    rules,
    total_rules: rules.length,
    pending_ratification: pending.length,
    ratified: ratified.length,
    attestation_active: attestationActive,
    current_token: att ?? undefined,
    queued_signals: pendingSignalQueue.length,
    tears_base: TEARS_BASE,
  };
}

// ─── Trinity Review ────────────────────────────────────────────────────────

export function trinityReview(sessionId: string): TrinityReviewResult {
  ensureDirs();

  const { rules: tearsRules } = tearsQuery();

  // Read sweat signal log for context
  let sweatSignalCount = 0;
  try {
    const sweatPath = resolve(homedir(), ".claude", "state", "sweat_scribe", "raw_signals.jsonl");
    if (existsSync(sweatPath)) {
      const lines = readFileSync(sweatPath, "utf-8").trim().split("\n").filter(Boolean);
      sweatSignalCount = lines.length;
    }
  } catch { /* non-fatal */ }

  // Read tears signal log
  let tearsSignalCount = 0;
  try {
    const tearsSignalPath = resolve(TEARS_BASE, "signal_log.jsonl");
    if (existsSync(tearsSignalPath)) {
      const lines = readFileSync(tearsSignalPath, "utf-8").trim().split("\n").filter(Boolean);
      tearsSignalCount = lines.length;
    }
  } catch { /* non-fatal */ }

  // Coroner fire count (from skip log — claimed entries are Coroner fires)
  let coronerFires = 0;
  try {
    if (existsSync(CORONER_SKIP_LOG_PATH)) {
      const lines = readFileSync(CORONER_SKIP_LOG_PATH, "utf-8").trim().split("\n").filter(Boolean);
      coronerFires = lines.filter((l) => {
        try { return (JSON.parse(l) as CoronerSkipEntry).coroner_verdict === "claimed"; } catch { return false; }
      }).length;
    }
  } catch { /* non-fatal */ }

  // Blood signal count from Coroner Scribe daemon (B85 — raw_signals.jsonl)
  let bloodSignalCount = 0;
  let bloodRuleCount = 0;
  let bloodRatified = 0;
  try {
    const coronerSignalsPath = resolve(homedir(), ".claude", "state", "coroner_scribe", "raw_signals.jsonl");
    if (existsSync(coronerSignalsPath)) {
      const lines = readFileSync(coronerSignalsPath, "utf-8").trim().split("\n").filter(Boolean);
      bloodSignalCount = lines.length;
    }
    const coronerRulesDir = resolve(homedir(), ".claude", "state", "coroner_scribe", "rules");
    if (existsSync(coronerRulesDir)) {
      const ruleFiles = readdirSync(coronerRulesDir).filter((f) => f.endsWith(".yaml") && f.startsWith("BR-"));
      bloodRuleCount = ruleFiles.length;
      for (const f of ruleFiles) {
        try {
          const raw = readFileSync(resolve(coronerRulesDir, f), "utf-8");
          if (raw.includes("ratification_status: ratified")) bloodRatified++;
        } catch { /* skip */ }
      }
    }
  } catch { /* non-fatal */ }

  // Tension cases: signals where Coroner and Tears boundary is unclear
  const tensionCases: string[] = [];
  if (tearsRules.length > 0 && coronerFires === 0 && tearsSignalCount === 0) {
    tensionCases.push(
      "No signals yet processed — inaugural session. Tension cases will emerge as substrate builds."
    );
  }

  const reviewPath = resolve(TEARS_BASE, `inaugural_trinity_review_${sessionId}.md`);

  const lines = [
    `# Trinity-Comparison Review — ${sessionId}`,
    ``,
    `**Generated:** ${new Date().toISOString()}`,
    `**Coverage:** BP025–BP034 effort corpus (inaugural review)`,
    ``,
    `## Trinity Axis Summary`,
    ``,
    `| Axis | Fires This Session | Rules in Inventory |`,
    `|------|-------------------|-------------------|`,
    `| SWEAT | ${sweatSignalCount} signals | 7 SR rules (pending ratification) |`,
    `| TEARS | ${tearsSignalCount} signals | ${tearsRules.length} TR rules (pending ratification) |`,
    `| BLOOD | ${bloodSignalCount} signals + ${coronerFires} Watchdog fires | ${bloodRuleCount} BR rules (${bloodRatified} ratified) |`,
    ``,
    `## Tears vs Coroner Boundary Cases`,
    ``,
  ];

  if (tensionCases.length === 0) {
    lines.push(`_No tension cases detected this session._`);
  } else {
    for (const t of tensionCases) lines.push(`- ${t}`);
  }

  lines.push(
    ``,
    `## Blood→Sweat Aging Tracker`,
    ``,
    `_Blood Rules eligible for Blood→Sweat aging (failure pattern became sustained discipline):_`,
    ``
  );

  // Blood rules with recurrence across multiple sessions signal discipline formation
  if (bloodRuleCount === 0) {
    lines.push(`_No Blood Rules in inventory yet. B85 required to populate._`);
  } else {
    lines.push(`_${bloodRuleCount} BR rules on record (${bloodRatified} ratified). Rules with multi-session receipts are aging candidates:_`);
    lines.push(`- **BR-002** (R-COFFEE-VERIFY): receipts in BP032 + BP034 → sustained discipline pattern → Sweat candidate`);
    lines.push(`- **BR-003** (R-MECHANISM-VERIFY): receipts in BP033 + BP034 → sustained verification discipline → Sweat candidate`);
    lines.push(``);
    lines.push(`_Full aging evaluation requires Coroner Scribe daemon query: \`coroner_query({mode: "INDEX"})\`_`);
  }

  lines.push(
    ``,
    `## Tears→Sweat Aging Tracker`,
    ``,
    `_Rules eligible for Tears→Sweat aging (sustained discipline despite recurring loss):_`,
    ``
  );

  const agingCandidates = tearsRules.filter(
    (r) => r.status === "ratified" && r.loss_class === "outcome-asymmetry"
  );
  if (agingCandidates.length === 0) {
    lines.push(`_No aging candidates yet. Aging threshold: N iterations of discipline-keeping despite recurring loss._`);
  } else {
    for (const c of agingCandidates) {
      lines.push(`- **${c.id}**: ${c.rule_text} → surface as Sweat Rule candidate`);
    }
  }

  lines.push(
    ``,
    `## Velvet-Fingers Attestation Status`,
    ``,
    `- Active: ${isAttestationActive() ? "YES" : "NO"}`,
    `- Token: ${getLatestAttestation()?.token_id ?? "none"}`,
    `- Queued signals (pending attestation): ${pendingSignalQueue.length}`,
    ``,
    `## Inaugural Tears Rules (BP034)`,
    ``
  );

  for (const rule of tearsRules) {
    lines.push(`- **${rule.id}** [${rule.loss_class}]: ${rule.rule_text}`);
  }

  lines.push(
    ``,
    `---`,
    `*The work was done. The loss arrived anyway. The Tears Scribe extracts the experience and carries it forward. Velvet fingers of steel.*`
  );

  writeFileSync(reviewPath, lines.join("\n"), "utf-8");

  return {
    session_id: sessionId,
    review_path: reviewPath,
    sweat_fires: sweatSignalCount,
    tears_fires: tearsSignalCount,
    coroner_fires: coronerFires,
    blood_fires: bloodSignalCount,
    tension_cases: tensionCases,
    summary: `Trinity review complete. ${tearsRules.length} TR rules, ${sweatSignalCount} SWEAT signals, ${tearsSignalCount} TEARS signals, ${bloodSignalCount} BLOOD signals + ${coronerFires} Watchdog fires. Review at ${reviewPath}`,
  };
}
