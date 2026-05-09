/**
 * Sweat Scribe — Substrate-discipline daemon (B80 / BP034 / LB-STACK-0215)
 *
 * Three modes:
 *   Mode 1 — Continuous observation: log_signal appends to raw_signals.jsonl
 *   Mode 2 — Weekly roundup: cluster signals; surface SR candidates; emit roundup .md
 *   Mode 3 — Founder-direct query: read SR inventory + recent receipts
 *
 * Storage: ~/.claude/state/sweat_scribe/
 *   raw_signals.jsonl          — append-only effort signal log
 *   rules/SR-###_*.yaml        — individual Sweat Rule files
 *   rules/INDEX.md             — auto-regenerated index
 *   roundups/SWEAT_ROUNDUP_BP{NNN}.md — weekly roundup reports
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

export const SWEAT_BASE = resolve(homedir(), ".claude", "state", "sweat_scribe");
export const SWEAT_RULES_DIR = resolve(SWEAT_BASE, "rules");
export const SWEAT_ROUNDUPS_DIR = resolve(SWEAT_BASE, "roundups");
export const SWEAT_SIGNALS_PATH = resolve(SWEAT_BASE, "raw_signals.jsonl");
export const SWEAT_INDEX_PATH = resolve(SWEAT_RULES_DIR, "INDEX.md");

function ensureDir(p: string): void {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function ensureDirs(): void {
  ensureDir(SWEAT_RULES_DIR);
  ensureDir(SWEAT_ROUNDUPS_DIR);
}

// ─── Schema ───────────────────────────────────────────────────────────────

export interface SweatSignal {
  ts: string;
  source: string;       // e.g. "drekaskip" | "git_commit" | "mcp_tool_call"
  signal_class: string; // e.g. "effort_marker" | "timing_delta" | "coffee_discipline"
  payload: string;
  session?: string;
}

export interface SweatRuleEntry {
  id: string;           // SR-001 through SR-NNN
  rule_text: string;
  status: string;       // "pending" | "ratified"
  reminder_injection: string; // "enabled" | "disabled"
  anchor_pattern: string;
  authored_date: string;
}

export interface SweatQueryResult {
  rules: SweatRuleEntry[];
  total_rules: number;
  pending_ratification: number;
  ratified: number;
  recent_signals: SweatSignal[];
  top_load_bearing: SweatRuleEntry[];
  sweat_base: string;
}

export interface SweatRoundupResult {
  session_id: string;
  roundup_path: string;
  signal_count: number;
  candidate_rules_surfaced: number;
  summary: string;
}

// ─── Mode 1: Log Signal ───────────────────────────────────────────────────

export function sweatLogSignal(signal: Omit<SweatSignal, "ts">): void {
  ensureDirs();
  const entry: SweatSignal = {
    ts: new Date().toISOString(),
    ...signal,
  };
  appendFileSync(SWEAT_SIGNALS_PATH, JSON.stringify(entry) + "\n", "utf-8");
}

// ─── Mode 3: Query ────────────────────────────────────────────────────────

function parseRuleFromYaml(raw: string): Partial<SweatRuleEntry> {
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

export function sweatQuery(topK = 5): SweatQueryResult {
  ensureDirs();

  const rules: SweatRuleEntry[] = [];

  if (existsSync(SWEAT_RULES_DIR)) {
    const files = readdirSync(SWEAT_RULES_DIR).filter(
      (f) => f.endsWith(".yaml") && f.startsWith("SR-")
    );
    for (const file of files.sort()) {
      try {
        const raw = readFileSync(resolve(SWEAT_RULES_DIR, file), "utf-8");
        const parsed = parseRuleFromYaml(raw);
        if (parsed.id) {
          rules.push(parsed as SweatRuleEntry);
        }
      } catch { /* skip corrupt files */ }
    }
  }

  const recentSignals: SweatSignal[] = [];
  if (existsSync(SWEAT_SIGNALS_PATH)) {
    const lines = readFileSync(SWEAT_SIGNALS_PATH, "utf-8").trim().split("\n").filter(Boolean);
    for (const line of lines.slice(-20)) {
      try {
        recentSignals.push(JSON.parse(line) as SweatSignal);
      } catch { /* skip */ }
    }
  }

  const pending = rules.filter((r) => r.status === "pending");
  const ratified = rules.filter((r) => r.status === "ratified");
  const topLoadBearing = ratified.length >= topK
    ? ratified.slice(0, topK)
    : [...ratified, ...pending].slice(0, topK);

  return {
    rules,
    total_rules: rules.length,
    pending_ratification: pending.length,
    ratified: ratified.length,
    recent_signals: recentSignals.slice(-5),
    top_load_bearing: topLoadBearing,
    sweat_base: SWEAT_BASE,
  };
}

// ─── Mode 2: Roundup ──────────────────────────────────────────────────────

function clusterSignals(signals: SweatSignal[]): Map<string, SweatSignal[]> {
  const clusters = new Map<string, SweatSignal[]>();
  for (const sig of signals) {
    const cls = sig.signal_class || "uncategorized";
    const bucket = clusters.get(cls) ?? [];
    bucket.push(sig);
    clusters.set(cls, bucket);
  }
  return clusters;
}

export function sweatRoundup(sessionId: string): SweatRoundupResult {
  ensureDirs();

  const allSignals: SweatSignal[] = [];
  if (existsSync(SWEAT_SIGNALS_PATH)) {
    const lines = readFileSync(SWEAT_SIGNALS_PATH, "utf-8").trim().split("\n").filter(Boolean);
    for (const line of lines) {
      try { allSignals.push(JSON.parse(line) as SweatSignal); } catch { /* skip */ }
    }
  }

  const clusters = clusterSignals(allSignals);
  const { rules, pending_ratification, ratified } = sweatQuery();

  const roundupPath = resolve(
    SWEAT_ROUNDUPS_DIR,
    `SWEAT_ROUNDUP_${sessionId}.md`
  );

  const lines: string[] = [
    `# Sweat Roundup — ${sessionId}`,
    ``,
    `**Generated:** ${new Date().toISOString()}`,
    `**Signal corpus:** ${allSignals.length} signals across ${clusters.size} discipline classes`,
    `**SR inventory:** ${rules.length} rules (${ratified} ratified, ${pending_ratification} pending)`,
    ``,
    `## Signal Clusters`,
    ``,
  ];

  for (const [cls, sigs] of clusters.entries()) {
    lines.push(`### ${cls} (${sigs.length} signals)`);
    const recent = sigs.slice(-3);
    for (const s of recent) {
      const summary = s.payload
        ? s.payload.slice(0, 120)
        : JSON.stringify(s).slice(0, 120);
      lines.push(`- \`${s.ts}\` [${s.source}] ${summary}`);
    }
    lines.push("");
  }

  lines.push(`## Current SR Inventory`, ``);
  for (const rule of rules) {
    lines.push(`- **${rule.id}** (${rule.status}): ${rule.rule_text}`);
  }

  lines.push(``, `## Candidate Sweat Rules (New Signals)`);
  const newCandidates: string[] = [];
  if (allSignals.length >= 5) {
    const effortClass = clusters.get("effort_marker") ?? [];
    if (effortClass.length >= 3) {
      newCandidates.push(`Sustained effort-marker cluster (${effortClass.length} signals) → candidate for promotion`);
    }
  }
  if (newCandidates.length === 0) {
    lines.push(``, `_No new candidates surfaced this roundup cycle. Existing SR inventory is current._`);
  } else {
    for (const c of newCandidates) lines.push(`- ${c}`);
  }

  lines.push(``, `---`, `*Sweat makes the grass grow green.*`);

  writeFileSync(roundupPath, lines.join("\n"), "utf-8");

  return {
    session_id: sessionId,
    roundup_path: roundupPath,
    signal_count: allSignals.length,
    candidate_rules_surfaced: newCandidates.length,
    summary: `Roundup complete. ${allSignals.length} signals, ${rules.length} SR rules (${ratified} ratified). Roundup at ${roundupPath}`,
  };
}

// ─── INDEX Regeneration ───────────────────────────────────────────────────

export function regenerateSweatIndex(): void {
  ensureDirs();
  const { rules } = sweatQuery();

  const lines = [
    `# Sweat Scribe — Rules Index`,
    ``,
    `**Auto-generated** — do not hand-edit. Regenerated by \`mcp__librarian__sweat_roundup\` at each session-close roundup.`,
    ``,
    `**Axis:** SWEAT  `,
    `**Canon:** LB-STACK-0215  `,
    `**Last regenerated:** ${new Date().toISOString()}`,
    ``,
    `---`,
    ``,
  ];

  for (const rule of rules) {
    lines.push(`## ${rule.id} — ${rule.rule_text}`);
    lines.push(`- **Status:** ${rule.status === "ratified" ? "ratified" : "pending ratification"}`);
    lines.push(`- **Anchor:** ${rule.anchor_pattern}`);
    lines.push(`- **Reminder injection:** ${rule.reminder_injection}`);
    lines.push(`- **File:** \`${rule.id.replace("-", "-").toLowerCase()}_${
      rule.rule_text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .slice(0, 40)
    }.yaml\``);
    lines.push(``);
  }

  const pending = rules.filter((r) => r.status !== "ratified").length;
  lines.push(`---`);
  lines.push(`_${pending} Sweat Rules await Founder ratification._`);
  lines.push(`_To ratify: "ratify SR-001 SR-002 ... SR-007" (selective subset OK)_`);

  writeFileSync(SWEAT_INDEX_PATH, lines.join("\n"), "utf-8");
}
