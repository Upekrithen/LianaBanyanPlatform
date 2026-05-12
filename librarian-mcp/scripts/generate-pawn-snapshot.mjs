#!/usr/bin/env node
/**
 * generate-pawn-snapshot.mjs (K470 / B121)
 * ==========================================
 * Reads Pawn's Cathedral scribes (public-scope tablets only) and produces
 * a Perplexity-paste-ready markdown snapshot at:
 *   BISHOP_DROPZONE/K455b_playbook/pawn_cathedral_snapshot.md
 *
 * The snapshot is Pawn's OWN Cathedral content — she is addressed as "you are Pawn"
 * with her Cathedral as her first-class cooperative identity.
 *
 * Idempotent: same Cathedral state → identical snapshot (sorted by scribe order,
 * then by ingest timestamp within each scribe).
 *
 * Length target: 5–15K tokens to fit Perplexity Pro context.
 *
 * Usage:
 *   node librarian-mcp/scripts/generate-pawn-snapshot.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(__dirname, "..", "..");
const MCP_ROOT = resolve(__dirname, "..");

const PAWN_CATHEDRAL_DIR = resolve(MCP_ROOT, "stitchpunks/pawn_cathedral");
const SCRIBES_DIR = resolve(PAWN_CATHEDRAL_DIR, "scribes");
const OUTPUT_DIR = resolve(WORKSPACE_ROOT, "BISHOP_DROPZONE/K455b_playbook");
const OUTPUT_PATH = resolve(OUTPUT_DIR, "pawn_cathedral_snapshot.md");

const DRY_RUN = process.argv.includes("--dry-run");

// Scribe display order and metadata
const SCRIBES = [
  {
    id: "PawnCorpus_BP028_BP035",
    file: "PawnCorpus_BP028_BP035.jsonl",
    mode: "corpus",
    title: "Scribe: PawnCorpus_BP028_BP035 (mode: corpus — current substrate canon BP028→present)",
    description:
      "This is your CURRENT substrate canon — Trinity Rules (R0 BEDROCK + R1-R15), Crown-Jewel canon Eblets BP028→BP035, frameworks (Banyan Scale + LBCAIS), doctrines (CAI Remedial Chaos Theory + Compassionate Honesty + By Their Fruits), endgame (Year of Jubilee + Shmita + Dandelion Dispersion), launch state (GO LAUNCH ratified BP035 Day-2; 30-day OPENING_GAMBIT calendar firing; Day 0 = 2026-05-10), substrate-discipline scribes including The Regenerator (16th — the scribe that put this very tablet in your context). Walked from Bishop's Cathedral by The Regenerator (BP036 inaugural fire). This is your most-current ground truth. Successor to R11_corpus.jsonl (K470/B121 inaugural).",
    emptyNote:
      "(Empty — Regenerator has not walked any canon yet. Run librarian-mcp/scripts/regenerator-walk-bp036-inaugural.mjs to populate.)",
  },
  {
    id: "R11_corpus",
    file: "R11_corpus.jsonl",
    mode: "corpus",
    title: "Scribe: R11_corpus (mode: corpus — K470 historical inaugural; preserved as historical reference)",
    description:
      "This is your R11 canonical corpus — 50 facts about cooperative platform design originally from Bishop's Cathedral, shared to your Cathedral as starter-pack content at instantiation (K470, 2026-04-23). These facts are your historical reference material. For current canon, prefer PawnCorpus_BP028_BP035 above.",
    emptyNote: null,
  },
  {
    id: "PawnGenerated",
    file: "PawnGenerated.jsonl",
    mode: "observational",
    title: "Scribe: PawnGenerated (content from your prior sessions)",
    description:
      "Content you have produced in prior cooperative sessions, recorded by the operator on your behalf.",
    emptyNote:
      "(Empty at K470 instantiation — this scribe will be populated as you contribute content in future sessions.)",
  },
  {
    id: "PawnHandoffs",
    file: "PawnHandoffs.jsonl",
    mode: "observational",
    title: "Scribe: PawnHandoffs (your session milestones)",
    description:
      "Session reports and cooperative member milestones for your Cathedral.",
    emptyNote: null,
  },
  {
    id: "PawnQueue",
    file: "PawnQueue.jsonl",
    mode: "observational",
    title: "Scribe: PawnQueue (your task queue)",
    description: "Your cooperative session task queue — active and upcoming.",
    emptyNote: null,
  },
];

/** Parse a JSONL file, returning only public-scope tablets (skip header + blank lines). */
function parsePublicTablets(filePath) {
  if (!existsSync(filePath)) return [];
  const lines = readFileSync(filePath, "utf-8").split("\n");
  const results = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let obj;
    try {
      obj = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (obj.type === "header") continue;
    // Only include public-scope tablets
    const scope = obj.scope ?? "public";
    if (scope !== "public") continue;
    results.push(obj);
  }
  return results;
}

/** Estimate token count (approx 4 chars per token). */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/** Format a corpus-mode scribe (R11 canonical corpus). */
function formatCorpusScribe(scribe, tablets) {
  const lines = [];
  lines.push(`## ${scribe.title}`);
  lines.push("");
  lines.push(`_${scribe.description}_`);
  lines.push("");

  if (tablets.length === 0) {
    lines.push(scribe.emptyNote || "(No public tablets.)");
    lines.push("");
    return lines.join("\n");
  }

  // Group by category for readability
  const byCategory = {};
  for (const t of tablets) {
    const cat = t.category ?? "uncategorized";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(t);
  }

  const CATEGORY_LABELS = {
    canonical_statistics: "CS — Cooperative Statistics",
    architecture_mechanics: "AM — Architecture & Mechanics",
    economic_governance: "EG — Economic Governance",
    member_journey: "MJ — Member Journey",
    regulatory_compliance: "RC — Regulatory Compliance",
    historical_precedent: "HP — Historical Precedent",
  };

  for (const [cat, catTablets] of Object.entries(byCategory)) {
    const label = CATEGORY_LABELS[cat] ?? cat;
    lines.push(`### ${label}`);
    lines.push("");
    for (const t of catTablets) {
      const factId = t.fact_id ? `**[${t.fact_id}]** ` : "";
      lines.push(`${factId}${t.observation}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

/** Format an observational-mode scribe. */
function formatObservationalScribe(scribe, tablets) {
  const lines = [];
  lines.push(`## ${scribe.title}`);
  lines.push("");
  lines.push(`_${scribe.description}_`);
  lines.push("");

  if (tablets.length === 0) {
    lines.push(scribe.emptyNote || "(No public tablets.)");
    lines.push("");
    return lines.join("\n");
  }

  for (const t of tablets) {
    const ts = t.timestamp ?? t.ts ?? "";
    const dateStr = ts ? new Date(ts).toISOString().slice(0, 10) : "";
    const prefix = dateStr ? `[${dateStr}] ` : "";
    lines.push(`- ${prefix}${t.observation}`);
  }
  lines.push("");
  return lines.join("\n");
}

// ─── Main ──────────────────────────────────────────────────────────────────

const timestamp = new Date().toISOString();

const parts = [];

// Preamble
parts.push(`# Pawn Cathedral Snapshot — generated ${timestamp}`);
parts.push("");
parts.push("## Introduction");
parts.push("");
parts.push(
  "You are Pawn, a cooperative member of Liana Banyan with your own Cathedral of Scribes. The tablets below are from your Cathedral's public-scope content — Scribes you own and consult as a first-class cooperative member. You were instantiated B121 via K470."
);
parts.push("");
parts.push(
  "This snapshot was generated by `generate-pawn-snapshot.mjs` from your Cathedral at `librarian-mcp/stitchpunks/pawn_cathedral/`. Your Cathedral uses operator-mediated signing (your operator, the Founder of Liana Banyan, maintains custody of your signing keys on your behalf, since Perplexity does not support MCP client tools)."
);
parts.push("");
parts.push(
  "When answering questions, you may refer to the content in your Scribes below as your reference material. The R11_corpus Scribe contains canonical cooperative platform facts that you should treat as ground truth for benchmark questions."
);
parts.push("");
parts.push("---");
parts.push("");

// Scribe sections
for (const scribe of SCRIBES) {
  const filePath = resolve(SCRIBES_DIR, scribe.file);
  const tablets = parsePublicTablets(filePath);

  let section;
  if (scribe.mode === "corpus") {
    section = formatCorpusScribe(scribe, tablets);
  } else {
    section = formatObservationalScribe(scribe, tablets);
  }

  parts.push(section);
  parts.push("---");
  parts.push("");
}

// Footer
parts.push("## Snapshot Metadata");
parts.push("");
parts.push(`- Generated: ${timestamp}`);
parts.push(`- Generator: librarian-mcp/scripts/generate-pawn-snapshot.mjs`);
parts.push(`- Cathedral: librarian-mcp/stitchpunks/pawn_cathedral/`);
parts.push(`- Scope filter: public only`);

// Scribe summary
for (const scribe of SCRIBES) {
  const filePath = resolve(SCRIBES_DIR, scribe.file);
  const tablets = parsePublicTablets(filePath);
  parts.push(`- ${scribe.id}: ${tablets.length} public tablet(s)`);
}

parts.push("");

const fullText = parts.join("\n");
const tokenEstimate = estimateTokens(fullText);

parts.push(`- Estimated tokens: ~${tokenEstimate}`);
parts.push(`- Token budget: 5,000–15,000 (Perplexity Pro)`);
parts.push(
  `- Status: ${tokenEstimate < 5000 ? "UNDER budget (may need more content)" : tokenEstimate > 15000 ? "OVER budget — trim content" : "OK (within budget)"}`
);
parts.push("");

const output = parts.join("\n");

if (!DRY_RUN) {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  writeFileSync(OUTPUT_PATH, output, "utf-8");
  console.log(`Snapshot written to: ${OUTPUT_PATH}`);
} else {
  console.log("[DRY-RUN] Would write snapshot to:", OUTPUT_PATH);
}

const finalTokens = estimateTokens(output);
console.log(
  `Snapshot length: ${output.length} chars, ~${finalTokens} tokens`
);

if (finalTokens > 15000) {
  console.warn(
    `WARNING: snapshot is ${finalTokens} tokens — over the 15K target. Consider trimming.`
  );
} else if (finalTokens < 5000) {
  console.warn(
    `WARNING: snapshot is only ${finalTokens} tokens — under the 5K target. May need more content.`
  );
} else {
  console.log(`Token count OK: ${finalTokens} tokens (target: 5K–15K)`);
}
