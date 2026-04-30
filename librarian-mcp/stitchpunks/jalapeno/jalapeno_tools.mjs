/**
 * Jalapeño List + Tarzan Vine MCP Tools — KN003 / BP002
 *
 * Jalapeño List: Founder Top Priority To-Do List. Structured queue for high-leverage
 * tasks and insights. Named by Founder (B133 turn 14): "keep it on Jalapeno List."
 *
 * Tarzan Vine: The substrate vine for swinging between Jalapeños — the MCP toolchain
 * that lets agents query, add, and transition entries without losing momentum between
 * tasks (Stay-Warm Discipline / W-008 Round the Horn canon).
 *
 * Stone Tablet Imperative: all writes are append-only. Current state is computed
 * deterministically from the transitions log. No in-place edits ever.
 *
 * Storage:
 *   librarian-mcp/stitchpunks/jalapeno/jalapeno_list.jsonl   — item records
 *   librarian-mcp/stitchpunks/jalapeno/jalapeno_transitions.jsonl — transition records
 *   (Legacy data: jalapeno_vine/jalapeno_list.jsonl — read on fallback; never written)
 *
 * Legal state transitions:
 *   pending → in_progress | blocked | superseded
 *   in_progress → done | blocked | superseded
 *   blocked → in_progress | superseded
 *
 * Wisdom Guide: read-only query against project_founder_wisdom_guide_collection_b134.md
 * (W-001 through W-016). Embedded canonical entries for fast query; falls back to
 * file read when env WISDOM_GUIDE_PATH is set.
 *
 * Toolsmith log: TS-JALAPENO-TARZAN-VINE-KN003-BP002
 */

import { readFile, appendFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Paths ──────────────────────────────────────────────────────────────────────

export const JALAPENO_DIR = resolve(__dirname);
export const LIST_PATH = resolve(__dirname, "jalapeno_list.jsonl");
export const TRANSITIONS_PATH = resolve(__dirname, "jalapeno_transitions.jsonl");

// Legacy read-only path (existing data from jalapeno_vine)
const LEGACY_LIST_PATH = resolve(__dirname, "..", "jalapeno_vine", "jalapeno_list.jsonl");

function isoNow() {
  return new Date().toISOString();
}

// ── Stone Tablet append ────────────────────────────────────────────────────────

async function appendRecord(filePath, record) {
  try {
    await appendFile(filePath, JSON.stringify(record) + "\n", "utf-8");
  } catch {}
}

// ── Read all item lines from list file (+ legacy fallback) ────────────────────

function readLines(filePath) {
  if (!existsSync(filePath)) return [];
  try {
    return readFileSync(filePath, "utf-8").trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function parseLines(lines) {
  return lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

/** Read all item records from list (primary + legacy). */
export function readAllItems() {
  const primaryLines = readLines(LIST_PATH);
  const legacyLines = existsSync(LEGACY_LIST_PATH) ? readLines(LEGACY_LIST_PATH) : [];
  const all = parseLines([...legacyLines, ...primaryLines]);
  // Items only (not header/transition records from legacy)
  return all.filter(r => r.type === "item" && r.id);
}

/** Read all transition records (primary transitions file + legacy transitions in list). */
export function readAllTransitions() {
  const transLines = readLines(TRANSITIONS_PATH);
  const legacyLines = existsSync(LEGACY_LIST_PATH) ? readLines(LEGACY_LIST_PATH) : [];
  const allLegacy = parseLines(legacyLines).filter(r => r.type === "transition");
  const allNew = parseLines(transLines);
  return [...allLegacy, ...allNew];
}

// ── ID generation ──────────────────────────────────────────────────────────────

export function getNextId() {
  const items = readAllItems();
  const existingNums = items
    .map(i => { const m = String(i.id || "").match(/^J-(\d+)$/); return m ? parseInt(m[1]) : 0; })
    .filter(n => n > 0);
  const max = existingNums.length > 0 ? Math.max(...existingNums) : 0;
  return `J-${max + 1}`;
}

// ── State computation ──────────────────────────────────────────────────────────

/** Legal transitions per state machine. */
export const LEGAL_TRANSITIONS = {
  "pending":     ["in_progress", "blocked", "superseded"],
  "in_progress": ["done", "blocked", "superseded"],
  "blocked":     ["in_progress", "superseded"],
  // Terminal states: done, superseded — no transitions allowed
};

/**
 * Compute the current status of an item by replaying its transition log.
 * Returns the most recent status, or "pending" if no transitions exist.
 */
export function computeCurrentState(itemId) {
  const transitions = readAllTransitions().filter(t => t.id === itemId);
  if (transitions.length === 0) {
    const items = readAllItems();
    const item = items.find(i => i.id === itemId);
    return item ? (item.status || "pending") : null;
  }
  transitions.sort((a, b) => (a.ts || "").localeCompare(b.ts || ""));
  return transitions[transitions.length - 1].status;
}

// ── Jalapeño tools ─────────────────────────────────────────────────────────────

/**
 * add_jalapeno: Append a new item with auto-ID + timestamp + status=pending.
 */
export async function addJalapeno({ title, context = "", category = "general", source_session = "", topic_tags = [] }) {
  if (!title) throw new Error("title is required");
  const id = getNextId();
  const record = {
    type: "item",
    id,
    ts: isoNow(),
    added_by: "tarzan-vine",
    title,
    context,
    category,
    source_session,
    topic_tags: Array.isArray(topic_tags) ? topic_tags : [topic_tags].filter(Boolean),
    status: "pending",
  };
  await appendRecord(LIST_PATH, record);
  return { id, status: "pending", ts: record.ts, title };
}

/**
 * query_jalapeno: Filter items by status / topic_tag / date range.
 * Returns items with their computed current state.
 */
export function queryJalapeno({ status, topic_tag, since, until, limit = 50 } = {}) {
  const items = readAllItems();

  let filtered = items.map(item => ({
    ...item,
    current_status: computeCurrentState(item.id),
  }));

  if (status) filtered = filtered.filter(i => i.current_status === status);
  if (topic_tag) filtered = filtered.filter(i =>
    (i.topic_tags || []).some(t => t.toLowerCase().includes(topic_tag.toLowerCase())) ||
    (i.category || "").toLowerCase().includes(topic_tag.toLowerCase())
  );
  if (since) filtered = filtered.filter(i => (i.ts || "") >= since);
  if (until) filtered = filtered.filter(i => (i.ts || "") <= until);

  return filtered.slice(0, limit);
}

/**
 * transition_jalapeno: Append a legal state transition to the transitions log.
 * Rejects illegal transitions without appending.
 */
export async function transitionJalapeno(itemId, to_status, transition_reason = "") {
  if (!itemId) throw new Error("id is required");
  if (!to_status) throw new Error("to_status is required");

  const items = readAllItems();
  if (!items.find(i => i.id === itemId)) throw new Error(`Item ${itemId} not found`);

  const from_status = computeCurrentState(itemId);
  const legalMoves = LEGAL_TRANSITIONS[from_status] || [];

  if (!legalMoves.includes(to_status)) {
    throw new Error(
      `Illegal transition: ${itemId} is currently "${from_status}"; ` +
      `cannot transition to "${to_status}". ` +
      `Legal moves: ${legalMoves.length > 0 ? legalMoves.join(", ") : "(none — terminal state)"}`
    );
  }

  const record = {
    type: "transition",
    id: itemId,
    ts: isoNow(),
    from_status,
    status: to_status,
    transition_reason,
    transitioned_by: "tarzan-vine",
  };
  await appendRecord(TRANSITIONS_PATH, record);
  return { id: itemId, from_status, to_status, ts: record.ts };
}

// ── Wisdom Guide ───────────────────────────────────────────────────────────────

/** Embedded canonical W-NNN entries for fast query. */
export const WISDOM_GUIDE_EMBEDDED = [
  { id: "W-001", line: "Never accept a No from someone who can't give you a Yes to begin with.", topic: ["gatekeeper", "rejection", "authority", "outreach"], source: "Founder family canon", when_to_deploy: "Cold-outreach; gatekeeper rejection; bureaucratic friction; press/publication gatekeeping" },
  { id: "W-002", line: "Your competitors can't say no without conceding they planned to fast-follow.", topic: ["partnership", "ip", "trap", "negotiation"], source: "B134 turn 14/16", when_to_deploy: "Partnership design; public articulation of terms; press defense" },
  { id: "W-003", line: "Stop Gating On Counsel (BRIDLE v11 Rule 11A).", topic: ["counsel", "bridle", "rule", "authority"], source: "B133 turn 19/21", when_to_deploy: "Any scaffold with counsel-gate language — replace with Founder-fire" },
  { id: "W-004", line: "Build for the long haul AND fix along the way.", topic: ["architecture", "velocity", "fix", "build"], source: "B130", when_to_deploy: "Quick-fix vs proper-rebuild decisions; deferral temptation" },
  { id: "W-005", line: "Speak friend, and enter.", topic: ["cooperative", "entry", "transparency", "membership"], source: "B130 LB Frame canon", when_to_deploy: "Cephas content; Crown Letters; countering 'what's the catch?' framing" },
  { id: "W-006", line: "Never say non-blocking.", topic: ["shipping", "integration", "discipline", "deferral"], source: "B106-era feedback", when_to_deploy: "Whenever deferred integration tempts as 'non-blocking'" },
  { id: "W-007", line: "She has skill and my chi.", topic: ["family", "partnership", "capability", "energy"], source: "B133 turn 33", when_to_deploy: "Founder-voice content; cooperative-pair-bonded framing" },
  { id: "W-008", line: "Round the Horn / Leave the lights on. (Stay-Warm Discipline)", topic: ["warm", "cost", "cycle", "architecture", "pre-staging"], source: "B132 + B134", when_to_deploy: "K-prompt bundle design; Six Cylinder Protocol; any shut-down-between-phases temptation" },
  { id: "W-009", line: "While they're rebooting, we're already through the storm.", topic: ["competitive", "warm", "substrate", "cathedral"], source: "B134 turn 14/16 — Pied Piper anchor", when_to_deploy: "Foundation paper; WIRED/MIT TR pitch; press defense on model releases" },
  { id: "W-010", line: "Hard to argue with yourself. (Symmetric-Offer Principle)", topic: ["offer", "symmetric", "design", "contract"], source: "B134 turn 16", when_to_deploy: "Every offer/contract/partnership design; Crown Letter ask" },
  { id: "W-011", line: "All the Peoples.", topic: ["global", "cooperative", "inclusive", "cap"], source: "B134 turn 16 CAP", when_to_deploy: "Foundation paper; global strategy; defense against US-only critique" },
  { id: "W-012", line: "All the ants can work alongside the Grasshoppers and still be profitable for all. Interdependency.", topic: ["cooperative", "surplus", "economics", "parable", "zero-sum"], source: "B134 turn 16", when_to_deploy: "Defense against free-rider / socialism critique; cooperative-economics framing" },
  { id: "W-013", line: "I am a One Shot Hunter. You owe it to your prey to be an expert at your craft so as to ensure the least or nonexistent pain.", topic: ["precision", "craftsmanship", "outreach", "hunter", "spot-on"], source: "B134 turn 18 — Founder biography", when_to_deploy: "Every drafting/dispatch/publication/Founder-fire moment" },
  { id: "W-014", line: "Nobility is how you treat others that can do nothing for you and especially are affected by your choices and actions.", topic: ["ethics", "nobility", "asymmetric", "power", "foundation"], source: "B134 turn 18", when_to_deploy: "Any decision affecting parties who cannot evaluate or reciprocate" },
  { id: "W-015", line: "Borrow not a few.", topic: ["abundance", "pre-staging", "biblical", "execution"], source: "BP001 turn 20 — biblical canon (2 Kings 4:3)", when_to_deploy: "Pre-Staging Architecture; vessel preparation; when tempted to under-prepare" },
  { id: "W-016", line: "If you had struck five or six times, you would have annihilated Syria.", topic: ["execution", "volleys", "discipline", "arrows", "biblical"], source: "BP001 turn 20 — biblical canon (2 Kings 13:19)", when_to_deploy: "Full-execution discipline; 'don't save arrows'; when tempted to under-execute" },
];

/** Read Wisdom Guide from file (WISDOM_GUIDE_PATH env), or fall back to embedded. */
async function loadWisdomGuide() {
  // Always start with embedded canonical entries (guaranteed to have correct line values).
  // Optionally extend with file-parsed entries for any W-NNN not already in embedded.
  const filePath = process.env.WISDOM_GUIDE_PATH ||
    join(process.env.HOME || process.env.USERPROFILE || "", ".claude", "projects",
      "C--Users-Administrator-Documents", "memory", "project_founder_wisdom_guide_collection_b134.md");
  try {
    if (existsSync(filePath)) {
      const text = readFileSync(filePath, "utf-8");
      const embeddedIds = new Set(WISDOM_GUIDE_EMBEDDED.map(e => e.id));
      const extra = [];
      const sections = text.split(/###\s+(W-\d{3})/g);
      for (let i = 1; i < sections.length; i += 2) {
        const wid = sections[i].trim();
        if (embeddedIds.has(wid)) continue; // already covered by embedded
        const body = sections[i + 1] || "";
        const firstLine = body.split("\n").find(l => l.trim().length > 2) || "";
        const line = firstLine.replace(/^[^"]*"([^"]+)".*$/, "$1") || firstLine.trim();
        if (line) extra.push({ id: wid, line, topic: [], source: "file", when_to_deploy: "" });
      }
      return [...WISDOM_GUIDE_EMBEDDED, ...extra];
    }
  } catch {}
  return WISDOM_GUIDE_EMBEDDED;
}

/**
 * query_wisdom_guide: Query W-NNN by exact ID or topic/keyword match.
 * Read-only — never appends to the Wisdom Guide.
 */
export async function queryWisdomGuide({ id, topic, limit = 10 } = {}) {
  const guide = await loadWisdomGuide();

  if (id) {
    const match = guide.find(e => e.id.toLowerCase() === id.toLowerCase());
    return match ? [match] : [];
  }

  if (topic) {
    const q = topic.toLowerCase();
    return guide.filter(e =>
      e.line.toLowerCase().includes(q) ||
      (e.topic || []).some(t => t.toLowerCase().includes(q)) ||
      (e.when_to_deploy || "").toLowerCase().includes(q)
    ).slice(0, limit);
  }

  return guide.slice(0, limit);
}

// ── MCP tool descriptors ───────────────────────────────────────────────────────

export const JALAPENO_TOOLS = [
  {
    name: "add_jalapeno",
    description: "Add a new item to the Jalapeño List (Founder Top Priority To-Do). Auto-ID J-NNN, status=pending, timestamp appended. Stone Tablet: append-only.",
    inputSchema: {
      type: "object",
      properties: {
        title:          { type: "string", description: "Short descriptive title for the item" },
        context:        { type: "string", description: "Full context, rationale, and scope" },
        category:       { type: "string", description: "Category: audit | publish | outreach | legal | substrate | general" },
        source_session: { type: "string", description: "Source session ID (e.g. B135 turn 5)" },
        topic_tags:     { type: "array", items: { type: "string" }, description: "Optional topic tags for filtering" },
      },
      required: ["title"],
    },
  },
  {
    name: "query_jalapeno",
    description: "Query Jalapeño List items with optional filters. Returns items with computed current_status (replayed from transitions log).",
    inputSchema: {
      type: "object",
      properties: {
        status:    { type: "string", description: "Filter by status: pending | in_progress | done | blocked | superseded" },
        topic_tag: { type: "string", description: "Filter by topic tag or category (substring match)" },
        since:     { type: "string", description: "ISO timestamp filter: only items added at or after this time" },
        until:     { type: "string", description: "ISO timestamp filter: only items added at or before this time" },
        limit:     { type: "number", description: "Max results (default 50)", default: 50 },
      },
      required: [],
    },
  },
  {
    name: "transition_jalapeno",
    description: "Transition a Jalapeño item to a new state. Appends to transitions log (Stone Tablet). Illegal transitions are rejected without modifying state.",
    inputSchema: {
      type: "object",
      properties: {
        id:                 { type: "string", description: "Jalapeño item ID (e.g. J-3)" },
        to_status:          { type: "string", description: "Target status: in_progress | done | blocked | superseded" },
        transition_reason:  { type: "string", description: "Reason for the transition" },
      },
      required: ["id", "to_status"],
    },
  },
  {
    name: "query_wisdom_guide",
    description: "Query Founder Wisdom Guide (W-001 through W-016+) by ID (e.g. W-013) or topic/keyword. Read-only. Returns maxim line, context, and when-to-deploy.",
    inputSchema: {
      type: "object",
      properties: {
        id:    { type: "string", description: "Exact W-NNN ID (e.g. W-001, W-013)" },
        topic: { type: "string", description: "Topic or keyword for fuzzy match (e.g. gatekeeper, hunter, nobility)" },
        limit: { type: "number", description: "Max results for topic search (default 10)", default: 10 },
      },
      required: [],
    },
  },
];
