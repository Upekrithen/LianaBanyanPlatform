/**
 * Coroner Scribe — Substrate-discipline daemon (B85 / BP034 / LB-STACK-0171)
 *
 * Three modes:
 *   Mode 1 — Continuous observation: coroner_log_signal appends raw_signals.jsonl
 *   Mode 2 — Session-close roundup: aggregate signals → Markdown roundup
 *   Mode 3 — Founder-direct query: Blood Rules registry read
 *
 * Storage: ~/.claude/state/coroner_scribe/
 *   raw_signals.jsonl        — append-only failure signal log
 *   rules/BR-###_*.yaml      — individual Blood Rule files
 *   rules/INDEX.md           — auto-regenerated index
 *   roundups/CORONER_ROUNDUP_BP{NNN}.md — roundup reports
 *   inaugural_roundup_BP034.md           — inaugural review file
 *
 * Identity note: The Stitchpunk coroner (stitchpunks/coroner.ts) is a cross-vendor
 * inference test harness (K28 §6). THIS module is the substrate-discipline Scribe daemon.
 * They share Coroner identity but are distinct systems.
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

export const CORONER_BASE = resolve(homedir(), ".claude", "state", "coroner_scribe");
export const CORONER_RULES_DIR = resolve(CORONER_BASE, "rules");
export const CORONER_ROUNDUPS_DIR = resolve(CORONER_BASE, "roundups");
export const CORONER_SIGNALS_PATH = resolve(CORONER_BASE, "raw_signals.jsonl");
export const CORONER_INDEX_PATH = resolve(CORONER_RULES_DIR, "INDEX.md");

function ensureDir(p: string): void {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function ensureDirs(): void {
  ensureDir(CORONER_RULES_DIR);
  ensureDir(CORONER_ROUNDUPS_DIR);
}

// ─── Schema ───────────────────────────────────────────────────────────────

export interface BloodSignal {
  ts: string;
  source: string;           // "watchdog_dispatch" | "manual" | "coroner_first_gate" | "stitchpunk" | "founder_ratification"
  signal_class: string;     // "failure_event" | "secret_exposure" | "collision" | "speculative_floor" | "test_integrity" | "mechanism_miss"
  payload: string;
  rule_association?: string; // "BR-001" .. "BR-007"
  session?: string;
  failure_class?: string;
}

export interface BloodRuleEntry {
  id: string;               // BR-001 through BR-NNN
  rule_text: string;
  status: string;           // "pending" | "ratified"
  reminder_injection: string; // "enabled" | "disabled"
  anchor_pattern: string;
  authored_date: string;
}

export interface BloodQueryResult {
  rules: BloodRuleEntry[];
  total_rules: number;
  pending_ratification: number;
  ratified: number;
  recent_signals: BloodSignal[];
  top_load_bearing: BloodRuleEntry[];
  coroner_base: string;
}

export interface BloodRoundupResult {
  session_id: string;
  roundup_path: string;
  signal_count: number;
  rules_implicated: number;
  candidate_rules_surfaced: number;
  summary: string;
}

// ─── Mode 1: Log Signal ───────────────────────────────────────────────────

export function coronerLogSignal(
  signal: Omit<BloodSignal, "ts">
): { logged: true; signal_id: string; path: string } {
  ensureDirs();
  const ts = new Date().toISOString();
  const session = signal.session ?? "unknown";
  const signal_id = `BLOOD-${session}-${Date.now()}`;
  const entry: BloodSignal = { ts, ...signal };
  appendFileSync(CORONER_SIGNALS_PATH, JSON.stringify(entry) + "\n", "utf-8");
  return { logged: true, signal_id, path: CORONER_SIGNALS_PATH };
}

// ─── Mode 3: Query ────────────────────────────────────────────────────────

function parseRuleFromYaml(raw: string): Partial<BloodRuleEntry> {
  const get = (key: string): string => {
    const m = raw.match(new RegExp(`^\\s{2}${key}:\\s*"?([^"\\n]+)"?`, "m"));
    return m ? m[1].trim() : "";
  };
  return {
    id: get("id"),
    rule_text: get("rule_text"),
    status: get("ratification_status"),
    reminder_injection: get("reminder_injection"),
    anchor_pattern: get("anchor_pattern"),
    authored_date: get("authored_date"),
  };
}

export type QueryMode = "INDEX" | "RULE" | "BY_PATTERN" | "RECENT" | "RATIFIED_ONLY";

export interface QueryOpts {
  rule_id?: string;
  pattern?: string;
  limit?: number;
}

function loadAllRules(): BloodRuleEntry[] {
  const rules: BloodRuleEntry[] = [];
  if (!existsSync(CORONER_RULES_DIR)) return rules;
  const files = readdirSync(CORONER_RULES_DIR).filter(
    (f) => f.endsWith(".yaml") && f.startsWith("BR-")
  );
  for (const file of files.sort()) {
    try {
      const raw = readFileSync(resolve(CORONER_RULES_DIR, file), "utf-8");
      const parsed = parseRuleFromYaml(raw);
      if (parsed.id) rules.push(parsed as BloodRuleEntry);
    } catch { /* skip corrupt files */ }
  }
  return rules;
}

function loadRecentSignals(limit = 20): BloodSignal[] {
  if (!existsSync(CORONER_SIGNALS_PATH)) return [];
  const lines = readFileSync(CORONER_SIGNALS_PATH, "utf-8").trim().split("\n").filter(Boolean);
  const recent: BloodSignal[] = [];
  for (const line of lines.slice(-limit)) {
    try { recent.push(JSON.parse(line) as BloodSignal); } catch { /* skip */ }
  }
  return recent;
}

export function coronerQuery(mode: QueryMode, opts: QueryOpts = {}): BloodQueryResult {
  ensureDirs();
  let rules = loadAllRules();
  const recentSignals = loadRecentSignals(opts.limit ?? 20);

  if (mode === "RULE") {
    if (opts.rule_id) {
      rules = rules.filter((r) => r.id === opts.rule_id);
    }
  } else if (mode === "BY_PATTERN") {
    if (opts.pattern) {
      const pat = opts.pattern.toLowerCase();
      rules = rules.filter((r) => r.anchor_pattern.toLowerCase().includes(pat));
    }
  } else if (mode === "RECENT") {
    // rules unchanged; signals limited by opts.limit
  } else if (mode === "RATIFIED_ONLY") {
    rules = rules.filter((r) => r.status === "ratified");
  }
  // INDEX: all rules returned

  const pending = rules.filter((r) => r.status === "pending" || r.status === "pending ratification");
  const ratified = rules.filter((r) => r.status === "ratified");
  const topK = opts.limit ?? 5;
  const topLoadBearing = ratified.length >= topK
    ? ratified.slice(0, topK)
    : [...ratified, ...pending].slice(0, topK);

  return {
    rules,
    total_rules: rules.length,
    pending_ratification: pending.length,
    ratified: ratified.length,
    recent_signals: recentSignals.slice(-(opts.limit ?? 5)),
    top_load_bearing: topLoadBearing,
    coroner_base: CORONER_BASE,
  };
}

// ─── Mode 2: Roundup ──────────────────────────────────────────────────────

function clusterSignals(signals: BloodSignal[]): Map<string, BloodSignal[]> {
  const clusters = new Map<string, BloodSignal[]>();
  for (const sig of signals) {
    const cls = sig.signal_class || "uncategorized";
    const bucket = clusters.get(cls) ?? [];
    bucket.push(sig);
    clusters.set(cls, bucket);
  }
  return clusters;
}

export function coronerRoundup(sessionId: string, topK = 5): BloodRoundupResult {
  ensureDirs();

  const allSignals: BloodSignal[] = [];
  if (existsSync(CORONER_SIGNALS_PATH)) {
    const lines = readFileSync(CORONER_SIGNALS_PATH, "utf-8").trim().split("\n").filter(Boolean);
    for (const line of lines) {
      try { allSignals.push(JSON.parse(line) as BloodSignal); } catch { /* skip */ }
    }
  }

  const clusters = clusterSignals(allSignals);
  const allRules = loadAllRules();
  const pending = allRules.filter((r) => r.status === "pending" || r.status === "pending ratification");
  const ratified = allRules.filter((r) => r.status === "ratified");

  // Determine which rules appear in signals
  const implicated = new Set<string>();
  for (const sig of allSignals) {
    if (sig.rule_association) implicated.add(sig.rule_association);
  }

  // Candidate detection: signal classes that map to no existing BR
  const candidatePatterns: string[] = [];
  const unclassified = allSignals.filter((s) => !s.rule_association);
  if (unclassified.length >= 3) {
    candidatePatterns.push(`${unclassified.length} unclassified signals → candidate Blood Rule class emerging`);
  }

  const roundupPath = resolve(
    CORONER_ROUNDUPS_DIR,
    `CORONER_ROUNDUP_${sessionId}.md`
  );

  const lines: string[] = [
    `# Coroner Roundup — ${sessionId}`,
    ``,
    `**Generated:** ${new Date().toISOString()}`,
    `**Signal corpus:** ${allSignals.length} signals across ${clusters.size} failure classes`,
    `**BR inventory:** ${allRules.length} rules (${ratified.length} ratified, ${pending.length} pending)`,
    ``,
    `## Signal Clusters by Failure Class`,
    ``,
  ];

  const topClusters = [...clusters.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, topK);

  for (const [cls, sigs] of topClusters) {
    lines.push(`### ${cls} (${sigs.length} signals)`);
    const recent = sigs.slice(-3);
    for (const s of recent) {
      lines.push(`- \`${s.ts}\` [${s.source}] ${s.payload.slice(0, 120)}`);
    }
    lines.push("");
  }

  lines.push(`## Current BR Inventory`, ``);
  for (const rule of allRules) {
    lines.push(`- **${rule.id}** (${rule.status}): ${rule.rule_text.replace(/\n\s+/g, " ").slice(0, 120)}`);
  }

  lines.push(``, `## Candidate Blood Rules (New Patterns)`, ``);
  if (candidatePatterns.length === 0) {
    lines.push(`_No new candidates surfaced this roundup cycle._`);
  } else {
    for (const c of candidatePatterns) lines.push(`- ${c}`);
  }

  lines.push(``, `---`, `*You bleed for what matters.*`);

  writeFileSync(roundupPath, lines.join("\n"), "utf-8");

  // Regenerate INDEX after roundup
  regenerateCoronerIndex();

  return {
    session_id: sessionId,
    roundup_path: roundupPath,
    signal_count: allSignals.length,
    rules_implicated: implicated.size,
    candidate_rules_surfaced: candidatePatterns.length,
    summary: `Roundup complete. ${allSignals.length} signals, ${allRules.length} BR rules (${ratified.length} ratified). ${implicated.size} rules implicated. Roundup at ${roundupPath}`,
  };
}

// ─── INDEX Regeneration ───────────────────────────────────────────────────

export function regenerateCoronerIndex(): void {
  ensureDirs();
  const allRules = loadAllRules();
  const pending = allRules.filter((r) => r.status !== "ratified").length;

  const lines = [
    `# Coroner Scribe — Blood Rules Index`,
    ``,
    `**Auto-generated** — do not hand-edit. Regenerated by \`mcp__librarian__coroner_roundup\` at each session-close roundup.`,
    ``,
    `**Axis:** BLOOD  `,
    `**Canon:** LB-STACK-0171  `,
    `**Last regenerated:** ${new Date().toISOString()}`,
    ``,
    `---`,
    ``,
  ];

  for (const rule of allRules) {
    const slug = rule.rule_text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .slice(0, 40);
    const fileId = rule.id.toLowerCase().replace("-", "-");
    lines.push(`## ${rule.id} — ${rule.rule_text.replace(/\n\s+/g, " ").slice(0, 100)}`);
    lines.push(`- **Status:** ${rule.status === "ratified" ? "ratified" : "pending ratification"}`);
    lines.push(`- **Anchor:** ${rule.anchor_pattern.replace(/\n\s+/g, " ").slice(0, 120)}`);
    lines.push(`- **Reminder injection:** ${rule.reminder_injection}`);
    lines.push(`- **File:** \`${fileId}_${slug}.yaml\``);
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(`_${pending} Blood Rules await Founder ratification._`);
  lines.push(`_To ratify: "ratify BR-001 BR-002 BR-003 BR-004 BR-005 BR-006 BR-007" (selective subset OK)_`);

  writeFileSync(CORONER_INDEX_PATH, lines.join("\n"), "utf-8");
}

// ─── Ratification Handler ─────────────────────────────────────────────────

export function ratifyBloodRules(ruleIds: string[]): { ratified: string[]; not_found: string[] } {
  ensureDirs();
  const ratified: string[] = [];
  const not_found: string[] = [];

  if (!existsSync(CORONER_RULES_DIR)) return { ratified, not_found: ruleIds };
  const files = readdirSync(CORONER_RULES_DIR).filter(
    (f) => f.endsWith(".yaml") && f.startsWith("BR-")
  );

  for (const ruleId of ruleIds) {
    const file = files.find((f) => f.startsWith(ruleId + "_") || f.startsWith(ruleId.toLowerCase() + "_"));
    if (!file) {
      not_found.push(ruleId);
      continue;
    }
    const filePath = resolve(CORONER_RULES_DIR, file);
    try {
      let content = readFileSync(filePath, "utf-8");
      content = content.replace(
        /ratification_status:\s*pending/,
        "ratification_status: ratified"
      );
      content = content.replace(
        /reminder_injection:\s*disabled/,
        "reminder_injection: enabled"
      );
      writeFileSync(filePath, content, "utf-8");
      ratified.push(ruleId);

      // Log ratification event
      coronerLogSignal({
        source: "founder_ratification",
        signal_class: "failure_event",
        payload: `${ruleId} ratified. Reminder injection enabled.`,
        rule_association: ruleId,
        session: "ratification",
      });
    } catch { /* skip */ }
  }

  regenerateCoronerIndex();
  return { ratified, not_found };
}
