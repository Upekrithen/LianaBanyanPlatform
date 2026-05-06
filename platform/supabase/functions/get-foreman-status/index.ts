/**
 * GET-FOREMAN-STATUS — [CAI] [B40] Bushel 40 FOREMAN Dashboard Data Layer
 * =========================================================================
 * Reads local filesystem state (Yoke feed, Bushel state, queue, etc.)
 * and returns structured JSON for the /foreman React dashboard.
 *
 * Founder-only: requires authenticated user with role === 'founder'.
 * Poll interval: 10 seconds from client.
 *
 * Data sources:
 *   1. Yoke feed   — KNIGHT_BISHOP_MESSAGES.md
 *   2. Bushel state — ~/.claude/state/bushel_*/
 *   3. Queue depth  — BISHOP_DROPZONE/01_KnightPrompts/ file list
 *   4. Git log      — last Knight commit
 *   5. Dropzone     — BISHOP_DROPZONE/02_PawnPrompts/ + 02_RookReturns/
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Path constants ───────────────────────────────────────────────────────────
const HOME = Deno.env.get("HOME") ?? "/root";
const PLATFORM_ROOT = Deno.env.get("PLATFORM_ROOT") ??
  "C:/Users/Administrator/Documents/LianaBanyanPlatform";

const YOKE_PATH = `${PLATFORM_ROOT}/KNIGHT_BISHOP_MESSAGES.md`;
const DROPZONE_KNIGHT = `${PLATFORM_ROOT}/BISHOP_DROPZONE/01_KnightPrompts`;
const DROPZONE_PAWN = `${PLATFORM_ROOT}/BISHOP_DROPZONE/02_PawnPrompts`;
const DROPZONE_ROOK = `${PLATFORM_ROOT}/BISHOP_DROPZONE/02_RookReturns`;
const STATE_DIR = `${HOME}/.claude/state`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface AgentStatus {
  id: "bishop" | "knight" | "pawn" | "rook";
  display_name: string;
  status: "ACTIVE" | "STANDING_BY" | "OFFLINE";
  current_task: string;
  last_active: string | null;   // ISO
  session_id: string | null;
  last_commit?: string | null;
}

interface BushelStatus {
  number: number;
  name: string;
  phase_current: number;
  phase_total: number;
  phase_label: string;
  status: "LANDED" | "IN_PROGRESS" | "BLOCKED" | "QUEUED";
  last_file_modified: string | null;
  prompt_file: string;
}

interface YokeMessage {
  type: "TASK" | "RESPONSE" | "REPORT" | "INFO" | "ROGER";
  from: string;
  to: string;
  timestamp: string | null;
  content_preview: string;
  content_full: string;
  status: string;
}

interface QueueItem {
  filename: string;
  display_name: string;
  priority: "CRITICAL" | "HIGH" | "NORMAL";
  session: string;
  bushel_number: number | null;
}

interface ForemanStatus {
  agents: AgentStatus[];
  bushels: BushelStatus[];
  yoke: YokeMessage[];
  queue: QueueItem[];
  queue_count: number;
  last_updated: string;
  error_notes: string[];
}

// ─── Utility: safe file read ──────────────────────────────────────────────────
async function readFileSafe(path: string): Promise<string | null> {
  try {
    return await Deno.readTextFile(path);
  } catch {
    return null;
  }
}

// ─── Utility: safe dir stat ───────────────────────────────────────────────────
async function statSafe(path: string): Promise<Deno.FileInfo | null> {
  try {
    return await Deno.stat(path);
  } catch {
    return null;
  }
}

// ─── Utility: list dir entries ────────────────────────────────────────────────
async function listDir(path: string): Promise<string[]> {
  const names: string[] = [];
  try {
    for await (const entry of Deno.readDir(path)) {
      names.push(entry.name);
    }
  } catch {
    // ignore
  }
  return names;
}

// ─── Yoke parser ─────────────────────────────────────────────────────────────
function parseYoke(raw: string): YokeMessage[] {
  const messages: YokeMessage[] = [];
  // Split on the --- separator blocks
  const blocks = raw.split(/\n---\n/);

  for (const block of blocks) {
    // Each message starts with ## [TYPE] FROM → TO or ## [TYPE] FROM → TO
    const headerMatch = block.match(
      /^##\s+\[([A-Z]+)\]\s+([\w\s/]+?)(?:\s*[→\->]+\s*([\w\s/]+))?\s*$/m
    );
    if (!headerMatch) continue;

    const rawType = (headerMatch[1] ?? "INFO").toUpperCase();
    const type: YokeMessage["type"] =
      rawType === "TASK" ? "TASK"
      : rawType === "RESPONSE" ? "RESPONSE"
      : rawType === "REPORT" ? "REPORT"
      : rawType === "ROGER" ? "ROGER"
      : "INFO";

    const fromRaw = headerMatch[2]?.trim() ?? "UNKNOWN";
    const toRaw = headerMatch[3]?.trim() ?? "ALL";

    // Parse from/to — they appear in the header like "BISHOP → KNIGHT"
    let from = fromRaw;
    let to = toRaw;

    // Also try inline "FROM → TO" on the ## line
    const inlineDir = block.match(/##\s+\[[A-Z]+\]\s+(BISHOP|KNIGHT|PAWN|ROOK)\s*[→>]+\s*(BISHOP|KNIGHT|PAWN|ROOK)/i);
    if (inlineDir) {
      from = inlineDir[1].toUpperCase();
      to = inlineDir[2].toUpperCase();
    }

    const timeMatch = block.match(/\*\*Time:\*\*\s*([^\n]+)/);
    const statusMatch = block.match(/\*\*Status:\*\*\s*([^\n]+)/);
    const timestamp = timeMatch ? timeMatch[1].trim() : null;
    const status = statusMatch ? statusMatch[1].trim() : "UNKNOWN";

    // Content = everything after Status line (skip header lines)
    const contentRaw = block
      .replace(/^##[^\n]+\n/, "")
      .replace(/\*\*Time:\*\*[^\n]+\n?/, "")
      .replace(/\*\*Status:\*\*[^\n]+\n?/, "")
      .trim();

    const content_full = contentRaw;
    const content_preview = contentRaw.slice(0, 120).replace(/\n/g, " ");

    if (content_full.length > 0 || timestamp) {
      messages.push({ type, from, to, timestamp, content_preview, content_full, status });
    }
  }

  return messages;
}

// ─── Queue parser ─────────────────────────────────────────────────────────────
function parseQueueItem(filename: string): QueueItem {
  // Extract session tag e.g. BP022, B133, BP025
  const sessionMatch = filename.match(/_(BP\d+|B\d+)[\._]/i);
  const session = sessionMatch ? sessionMatch[1].toUpperCase() : "UNKNOWN";

  // Extract Bushel number
  const bushelMatch = filename.match(/BUSHEL[_\-](\d+)/i);
  const bushel_number = bushelMatch ? parseInt(bushelMatch[1], 10) : null;

  // Priority heuristics
  const upper = filename.toUpperCase();
  const priority: QueueItem["priority"] =
    upper.includes("CRITICAL") ? "CRITICAL"
    : upper.includes("HIGH") || upper.includes("WAVE") || upper.includes("BUSHEL_40") ? "HIGH"
    : "NORMAL";

  // Display name: clean up filename
  const display_name = filename
    .replace(/^PROMPT_(KNIGHT|SHADOW)_/, "")
    .replace(/_(BP\d+|B\d+)\.md$/i, "")
    .replace(/_AUGUR_.*$/, "")
    .replace(/_/g, " ")
    .replace(/\.md$/i, "")
    .trim();

  return { filename, display_name, priority, session, bushel_number };
}

// ─── Bushel status detector ───────────────────────────────────────────────────
function extractBushelMeta(filename: string): { number: number; name: string } | null {
  const m = filename.match(/BUSHEL[_\-](\d+)[A-Z]?[_\-](.+?)(?:[_\-](BP|B)\d+)?\.md$/i);
  if (!m) return null;
  const number = parseInt(m[1], 10);
  const rawName = (m[2] ?? "").replace(/_/g, " ").replace(/AUGUR.*$/, "").trim();
  return { number, name: rawName };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const errorNotes: string[] = [];

  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Founder check ────────────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "founder") {
      return new Response(
        JSON.stringify({ success: false, error: "Founder access only" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 1. Parse Yoke feed ───────────────────────────────────────────────────
    const yokeRaw = await readFileSafe(YOKE_PATH);
    let yokeMessages: YokeMessage[] = [];
    if (yokeRaw) {
      yokeMessages = parseYoke(yokeRaw);
      // Newest first, last 20
      yokeMessages = yokeMessages.reverse().slice(0, 20);
    } else {
      errorNotes.push(`Yoke file not readable: ${YOKE_PATH}`);
    }

    // ── 2. Agent status from Yoke ────────────────────────────────────────────
    const allMessages = yokeRaw ? parseYoke(yokeRaw) : [];

    function lastMessageFrom(agentId: string): YokeMessage | undefined {
      const upperAgent = agentId.toUpperCase();
      // Scan from end (newest) — find last message from this agent
      for (let i = allMessages.length - 1; i >= 0; i--) {
        const m = allMessages[i];
        if (m.from.toUpperCase().includes(upperAgent)) return m;
      }
      return undefined;
    }

    function buildAgent(
      id: AgentStatus["id"],
      displayName: string,
      dropzonePath: string,
    ): AgentStatus {
      const lastMsg = lastMessageFrom(id);
      const lastActive = lastMsg?.timestamp ?? null;

      // Determine status: if last activity within 2h → ACTIVE, within 24h → STANDING_BY, else OFFLINE
      let status: AgentStatus["status"] = "OFFLINE";
      if (lastActive) {
        const diffMs = Date.now() - new Date(lastActive).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours < 2) status = "ACTIVE";
        else if (diffHours < 24) status = "STANDING_BY";
      }

      const current_task = lastMsg?.content_preview ?? "No recent activity";

      return {
        id,
        display_name: displayName,
        status,
        current_task,
        last_active: lastActive,
        session_id: null,
      };
    }

    // Bishop: last message sent FROM BISHOP
    const bishopAgent = buildAgent("bishop", "Bishop", "");

    // Knight: last message + check for recent files in dropzone
    const knightAgent = buildAgent("knight", "Knight (Cursor)", DROPZONE_KNIGHT);

    // Pawn: last dispatch in pawn dropzone
    const pawnFiles = await listDir(DROPZONE_PAWN);
    const pawnMsg = lastMessageFrom("pawn");
    const pawnAgent: AgentStatus = {
      id: "pawn",
      display_name: "Pawn (Perplexity)",
      status: pawnMsg ? (
        Date.now() - new Date(pawnMsg.timestamp ?? 0).getTime() < 48 * 3600000 ? "STANDING_BY" : "OFFLINE"
      ) : "OFFLINE",
      current_task: pawnMsg?.content_preview ?? (pawnFiles.length > 0 ? `${pawnFiles.length} dispatch files` : "No recent activity"),
      last_active: pawnMsg?.timestamp ?? null,
      session_id: null,
    };

    // Rook: check rook returns folder
    const rookFiles = await listDir(DROPZONE_ROOK);
    const rookMsg = lastMessageFrom("rook");
    const rookAgent: AgentStatus = {
      id: "rook",
      display_name: "Rook (Gemini)",
      status: rookMsg ? (
        Date.now() - new Date(rookMsg.timestamp ?? 0).getTime() < 48 * 3600000 ? "STANDING_BY" : "OFFLINE"
      ) : "OFFLINE",
      current_task: rookMsg?.content_preview ?? (rookFiles.length > 0 ? `${rookFiles.length} return files` : "No recent activity"),
      last_active: rookMsg?.timestamp ?? null,
      session_id: null,
    };

    const agents: AgentStatus[] = [bishopAgent, knightAgent, pawnAgent, rookAgent];

    // ── 3. Queue: Knight prompt files ────────────────────────────────────────
    const queueFiles = await listDir(DROPZONE_KNIGHT);
    const queueItems: QueueItem[] = queueFiles
      .filter((f) => f.endsWith(".md") && f.startsWith("PROMPT_") && !f.includes("_AUGUR_"))
      .map(parseQueueItem)
      .sort((a, b) => {
        const pri = { CRITICAL: 0, HIGH: 1, NORMAL: 2 };
        return pri[a.priority] - pri[b.priority];
      });

    // ── 4. Bushels: derive from queue files + state dirs ─────────────────────
    const bushelMap = new Map<number, BushelStatus>();

    // From queue files — active/queued bushels
    for (const item of queueItems) {
      if (item.bushel_number === null) continue;
      if (bushelMap.has(item.bushel_number)) continue;
      const meta = extractBushelMeta(item.filename);
      bushelMap.set(item.bushel_number, {
        number: item.bushel_number,
        name: meta?.name ?? item.display_name,
        phase_current: 1,
        phase_total: 4,
        phase_label: "Phase 1",
        status: "QUEUED",
        last_file_modified: null,
        prompt_file: item.filename,
      });
    }

    // Check state dirs for landed bushels
    const stateDirs = await listDir(STATE_DIR);
    for (const dirName of stateDirs) {
      const bushelMatch = dirName.match(/^bushel_(\d+)$/);
      if (!bushelMatch) continue;
      const num = parseInt(bushelMatch[1], 10);
      const dirPath = `${STATE_DIR}/${dirName}`;
      const files = await listDir(dirPath);
      const hasReceipt = files.some((f) =>
        f.toLowerCase().includes("receipt") || f.toLowerCase().includes("landed")
      );

      const entry = bushelMap.get(num);
      if (entry) {
        entry.status = hasReceipt ? "LANDED" : "IN_PROGRESS";
        entry.phase_current = hasReceipt ? entry.phase_total : 2;
      } else {
        // Landed bushel not in queue
        bushelMap.set(num, {
          number: num,
          name: `Bushel ${num}`,
          phase_current: hasReceipt ? 4 : 3,
          phase_total: 4,
          phase_label: hasReceipt ? "LANDED" : "Phase 3",
          status: hasReceipt ? "LANDED" : "IN_PROGRESS",
          last_file_modified: null,
          prompt_file: "",
        });
      }
    }

    // B40 itself is in-progress
    if (!bushelMap.has(40)) {
      bushelMap.set(40, {
        number: 40,
        name: "FOREMAN Dashboard Agent Activity",
        phase_current: 1,
        phase_total: 4,
        phase_label: "Phase 1 — Data Layer",
        status: "IN_PROGRESS",
        last_file_modified: new Date().toISOString(),
        prompt_file: "PROMPT_KNIGHT_BUSHEL_40_FOREMAN_DASHBOARD_AGENT_ACTIVITY_BP025.md",
      });
    } else {
      const b40 = bushelMap.get(40)!;
      b40.status = "IN_PROGRESS";
      b40.phase_current = 1;
    }

    // Sort bushels: IN_PROGRESS first, then QUEUED, then LANDED (descending number)
    const bushels = Array.from(bushelMap.values()).sort((a, b) => {
      const order = { IN_PROGRESS: 0, QUEUED: 1, BLOCKED: 2, LANDED: 3 };
      const oa = order[a.status] ?? 4;
      const ob = order[b.status] ?? 4;
      if (oa !== ob) return oa - ob;
      return b.number - a.number;
    });

    // ── 5. Assemble response ─────────────────────────────────────────────────
    const payload: ForemanStatus = {
      agents,
      bushels,
      yoke: yokeMessages,
      queue: queueItems,
      queue_count: queueItems.length,
      last_updated: new Date().toISOString(),
      error_notes: errorNotes,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err), error_notes: errorNotes }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
