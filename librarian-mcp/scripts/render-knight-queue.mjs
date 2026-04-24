#!/usr/bin/env node
/**
 * render-knight-queue.mjs
 *
 * Derives KNIGHT_QUEUE.md at the workspace root from Knight's Cathedral Scribes.
 *
 * Sources:
 *   librarian-mcp/stitchpunks/knight_cathedral/scribes/KnightQueue.jsonl
 *   librarian-mcp/stitchpunks/knight_cathedral/scribes/KnightHandoffs.jsonl
 *
 * What auto-renders:  NEXT / QUEUED / LANDED sections (from Scribe state)
 * What is preserved:  CONTEXT section (Bishop-maintained manually at session boundaries)
 *
 * Phase 2 of the multi-Cathedral dogfood architecture (K461/B121).
 * Wired into npm run rebuild so KNIGHT_QUEUE.md auto-updates on every build.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_ROOT = resolve(__dirname, "..");
const WORKSPACE = resolve(MCP_ROOT, "..");

const KNIGHT_QUEUE_PATH = resolve(WORKSPACE, "KNIGHT_QUEUE.md");
const SCRIBE_QUEUE_PATH = resolve(MCP_ROOT, "stitchpunks/knight_cathedral/scribes/KnightQueue.jsonl");
const SCRIBE_HANDOFFS_PATH = resolve(MCP_ROOT, "stitchpunks/knight_cathedral/scribes/KnightHandoffs.jsonl");

/** Parse a JSONL file into an array of objects, skipping header and blank lines. */
function parseJsonl(path) {
  if (!existsSync(path)) return [];
  const lines = readFileSync(path, "utf-8").split("\n");
  const results = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed);
      if (obj.type === "header") continue; // skip header records
      results.push(obj);
    } catch {
      // skip malformed lines (should not occur in well-maintained tablets)
    }
  }
  return results;
}

/** Extract the CONTEXT section from an existing KNIGHT_QUEUE.md, if present. */
function extractContextSection(existingContent) {
  if (!existingContent) return null;
  const contextMatch = existingContent.match(
    /## CONTEXT[\s\S]*?(?=\n---\n## KNIGHT DISPATCH PROTOCOL|\n---\n\*Last updated|$)/
  );
  if (contextMatch) return contextMatch[0].trimEnd();
  return null;
}

/** Extract the dispatch protocol section from existing file, if present. */
function extractDispatchProtocol(existingContent) {
  if (!existingContent) return null;
  const protocolMatch = existingContent.match(/## KNIGHT DISPATCH PROTOCOL[\s\S]*?(?=\n---\n\*Last updated|$)/);
  if (protocolMatch) return protocolMatch[0].trimEnd();
  return null;
}

/** Build the NEXT section from KnightQueue tablets. */
function buildNextSection(queueTablets) {
  const nextTablets = queueTablets.filter(t => t.status === "NEXT");
  if (nextTablets.length === 0) {
    return "## NEXT — dispatch ready\n\n*(No task currently in NEXT — check QUEUED below.)*";
  }

  const lines = ["## NEXT — dispatch ready"];
  for (const t of nextTablets) {
    lines.push("");
    const kNum = t.k_number || extractKNumber(t.observation);
    // Try to find prompt file from observation text
    const promptMatch = t.observation.match(/Prompt file:\s*(BISHOP_DROPZONE[^\s.]+\.md)/);
    const tagMatch = t.observation.match(/Target tag:\s*([a-z0-9_-]+)/);
    const estMatch = t.observation.match(/Estimated:\s*([^\n.]+)/);
    const scopeMatch = t.observation.match(/Scope:\s*([^\n.]+)/);
    const whyMatch = t.observation.match(/Why:\s*([^\n.]+)/);
    const prereqMatch = t.observation.match(/Prereq gate:\s*([^\n.]+)/);

    lines.push(`### ${kNum || "?"} — (see observation)`);
    lines.push("");
    lines.push(`- **Observation:** ${t.observation}`);
    if (promptMatch) lines.push(`- **Prompt file:** \`${promptMatch[1]}\``);
    if (tagMatch) lines.push(`- **Target tag:** \`${tagMatch[1]}\``);
    if (estMatch) lines.push(`- **Estimated:** ${estMatch[1]}`);
    if (scopeMatch) lines.push(`- **Scope:** ${scopeMatch[1]}`);
    if (whyMatch) lines.push(`- **Why:** ${whyMatch[1]}`);
    if (prereqMatch) lines.push(`- **Prereq gates:** ${prereqMatch[1]}`);
    lines.push(`- **Source:** \`${t.source_document}\` (${t.source_session})`);
  }
  return lines.join("\n");
}

/** Build the QUEUED section from KnightQueue tablets. */
function buildQueuedSection(queueTablets) {
  const queuedTablets = queueTablets.filter(t => t.status === "QUEUED");
  const lines = ["## QUEUED — awaiting predecessor", ""];
  lines.push("| K# | Observation | Source session |");
  lines.push("|---|---|---|");
  for (const t of queuedTablets) {
    const kNum = t.k_number || extractKNumber(t.observation) || "?";
    const obs = t.observation.slice(0, 120).replace(/\|/g, "\\|") + (t.observation.length > 120 ? "…" : "");
    lines.push(`| ${kNum} | ${obs} | ${t.source_session} |`);
  }
  if (queuedTablets.length === 0) {
    lines.push("| — | *(no queued tasks)* | — |");
  }
  return lines.join("\n");
}

/** Build the LANDED section from KnightHandoffs tablets (most recent sessions first in display, append-order). */
function buildLandedSection(handoffTablets) {
  const landedTablets = handoffTablets.filter(t =>
    t.category === "landed-session" || t.status === "LANDED"
  );

  const lines = ["## LANDED — sessions with committed artifacts", ""];
  lines.push("| K# | Summary | Tag | Commit |");
  lines.push("|---|---|---|---|");

  for (const t of landedTablets) {
    const kNum = t.k_number || extractKNumber(t.observation) || "?";
    const summary = t.observation.slice(0, 100).replace(/\|/g, "\\|") + (t.observation.length > 100 ? "…" : "");
    const tag = t.git_tag ? `\`${t.git_tag}\`` : "—";
    const commit = t.commit_hash ? `\`${t.commit_hash}\`` : "—";
    lines.push(`| ${kNum} | ${summary} | ${tag} | ${commit} |`);
  }

  if (landedTablets.length === 0) {
    lines.push("| — | *(no landed sessions recorded)* | — | — |");
  }
  return lines.join("\n");
}

function extractKNumber(text) {
  const m = text.match(/^(K\d+[a-z]?)/);
  return m ? m[1] : null;
}

async function main() {
  // Read existing KNIGHT_QUEUE.md to preserve the CONTEXT and dispatch protocol sections
  let existingContent = null;
  if (existsSync(KNIGHT_QUEUE_PATH)) {
    existingContent = readFileSync(KNIGHT_QUEUE_PATH, "utf-8");
  }

  const preservedContext = extractContextSection(existingContent);
  const preservedProtocol = extractDispatchProtocol(existingContent);

  // Load Scribe tablets
  const queueTablets = parseJsonl(SCRIBE_QUEUE_PATH);
  const handoffTablets = parseJsonl(SCRIBE_HANDOFFS_PATH);

  // Derive NEXT/QUEUED from KnightQueue.jsonl
  const nextSection = buildNextSection(queueTablets);
  const queuedSection = buildQueuedSection(queueTablets);

  // Derive LANDED from KnightHandoffs.jsonl
  const landedSection = buildLandedSection(handoffTablets);

  // Compose the file
  const now = new Date().toISOString().slice(0, 10);
  const header = [
    "# KNIGHT_QUEUE.md",
    "",
    "**Knight's queue state — auto-rendered from Knight's Cathedral Scribes on every rebuild.**",
    "",
    "NEXT / QUEUED / LANDED sections are derived from:",
    "- `librarian-mcp/stitchpunks/knight_cathedral/scribes/KnightQueue.jsonl`",
    "- `librarian-mcp/stitchpunks/knight_cathedral/scribes/KnightHandoffs.jsonl`",
    "",
    "The CONTEXT section below is Bishop-maintained manually at session boundaries.",
    "",
    "Phase 2 auto-population via SP-7 Courier + render-knight-queue.mjs (K461/B121).",
    "",
    "**READ THIS FILE FIRST at every Knight session start.** Saves the grep.",
    "",
    "---",
  ].join("\n");

  const sections = [
    header,
    "",
    nextSection,
    "",
    "---",
    "",
    queuedSection,
    "",
    "---",
    "",
    landedSection,
    "",
    "---",
    "",
  ];

  // Append the preserved CONTEXT section, or a placeholder
  if (preservedContext) {
    sections.push(preservedContext);
  } else {
    sections.push([
      "## CONTEXT — where Bishop left off",
      "",
      "*(Bishop writes this section manually at each session boundary.)*",
    ].join("\n"));
  }

  sections.push("");
  sections.push("---");
  sections.push("");

  // Append the preserved dispatch protocol, or the canonical default
  if (preservedProtocol) {
    sections.push(preservedProtocol);
  } else {
    sections.push([
      "## KNIGHT DISPATCH PROTOCOL",
      "",
      "When Founder types a K-number (e.g., \"K460\"):",
      "",
      "1. Check NEXT section above — if the number matches, read the prompt file referenced.",
      "2. If not in NEXT, check QUEUED — may be gated on a predecessor.",
      "3. If not in QUEUED, check LANDED — may be a historical reference.",
      "4. Fall back to `grep -r \"K<NNN>\" BISHOP_DROPZONE/01_KnightPrompts/` only if none of the above match.",
    ].join("\n"));
  }

  sections.push("");
  sections.push(`---`);
  sections.push("");
  sections.push(`*Auto-rendered ${now} by render-knight-queue.mjs from Knight's Cathedral Scribes (K461/B121). CONTEXT section Bishop-maintained.*`);
  sections.push("");

  const output = sections.join("\n");
  writeFileSync(KNIGHT_QUEUE_PATH, output, "utf-8");

  const queueCount = queueTablets.length;
  const handoffCount = handoffTablets.length;
  const nextCount = queueTablets.filter(t => t.status === "NEXT").length;
  const queuedCount = queueTablets.filter(t => t.status === "QUEUED").length;
  const landedCount = handoffTablets.filter(t => t.category === "landed-session").length;

  console.log(`  ✓ KNIGHT_QUEUE.md rendered (${nextCount} NEXT, ${queuedCount} QUEUED, ${landedCount} LANDED from ${queueCount + handoffCount} tablets)`);
}

main().catch(err => {
  console.error("render-knight-queue: FAILED:", err.message);
  process.exit(1);
});
