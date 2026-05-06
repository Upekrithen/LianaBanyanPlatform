/**
 * FOREMAN Dashboard — [CAI] [B40]
 * ================================
 * Founder-only mission control at /foreman.
 * Shows: Agent cards, Bushel progress, Yoke feed, Queue panel.
 * Auto-refreshes every 10 seconds via get-foreman-status edge function.
 *
 * BP025 — Founder direct: "I prefer to SEE what is going on."
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  RefreshCw,
  Radio,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  List,
  MessageSquare,
  Activity,
  Layers,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AgentStatus {
  id: "bishop" | "knight" | "pawn" | "rook";
  display_name: string;
  status: "ACTIVE" | "STANDING_BY" | "OFFLINE";
  current_task: string;
  last_active: string | null;
  session_id: string | null;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(isoOrNull: string | null): string {
  if (!isoOrNull) return "never";
  const diff = Date.now() - new Date(isoOrNull).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const AGENT_COLORS: Record<string, string> = {
  bishop: "amber",
  knight: "cyan",
  pawn: "violet",
  rook: "emerald",
};

const AGENT_INITIALS: Record<string, string> = {
  bishop: "B",
  knight: "K",
  pawn: "P",
  rook: "R",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "text-green-400",
  STANDING_BY: "text-yellow-400",
  OFFLINE: "text-slate-600",
};

const STATUS_DOT: Record<string, string> = {
  ACTIVE: "bg-green-400 animate-pulse",
  STANDING_BY: "bg-yellow-400",
  OFFLINE: "bg-slate-600",
};

const BUSHEL_BORDER: Record<string, string> = {
  IN_PROGRESS: "border-yellow-500/40",
  LANDED: "border-green-500/30",
  BLOCKED: "border-red-500/40",
  QUEUED: "border-slate-700",
};

const BUSHEL_BG: Record<string, string> = {
  IN_PROGRESS: "bg-yellow-950/10",
  LANDED: "bg-green-950/10",
  BLOCKED: "bg-red-950/10",
  QUEUED: "bg-slate-900/40",
};

const YOKE_TYPE_COLORS: Record<string, string> = {
  TASK: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  RESPONSE: "bg-green-500/20 text-green-300 border-green-500/30",
  REPORT: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  INFO: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  ROGER: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-500/20 text-red-300 border-red-500/30",
  HIGH: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  NORMAL: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: AgentStatus }) {
  const color = AGENT_COLORS[agent.id] ?? "slate";
  const initials = AGENT_INITIALS[agent.id] ?? agent.id[0].toUpperCase();
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-2 min-w-0"
      style={{
        background: "rgba(10,18,32,0.8)",
        borderColor: `var(--tw-${color}-500, rgba(100,100,120,0.2))`,
        borderWidth: "1px",
        borderStyle: "solid",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-sm flex-shrink-0`}
          style={{ background: `rgba(var(--color-${color}-500-raw, 100,100,150), 0.15)`, border: `1px solid rgba(100,100,150,0.3)` }}
        >
          <span className={`text-${color}-400`}>{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200 truncate">{agent.display_name}</span>
            <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[agent.status]}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[agent.status]}`} />
              {agent.status.replace("_", " ")}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            last active: {relativeTime(agent.last_active)}
          </div>
        </div>
      </div>
      <div className="text-xs text-slate-400 leading-relaxed line-clamp-2 font-mono bg-slate-900/50 rounded px-2 py-1.5 min-h-[2rem]">
        {agent.current_task || "No recent task"}
      </div>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.min(1, current / total) : 0;
  const filled = Math.round(pct * 8);
  const bar = "█".repeat(filled) + "░".repeat(8 - filled);
  return (
    <span className="font-mono text-xs text-slate-400">
      [{bar}] {current}/{total}
    </span>
  );
}

function BushelCard({ bushel }: { bushel: BushelStatus }) {
  return (
    <div
      className={`rounded-xl border p-3 flex flex-col gap-2 ${BUSHEL_BORDER[bushel.status]} ${BUSHEL_BG[bushel.status]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-slate-500 font-mono flex-shrink-0">B{bushel.number}</span>
          <span className="text-sm font-semibold text-slate-200 truncate capitalize">{bushel.name}</span>
        </div>
        <span
          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
            bushel.status === "LANDED"
              ? "bg-green-500/20 text-green-400"
              : bushel.status === "IN_PROGRESS"
              ? "bg-yellow-500/20 text-yellow-400"
              : bushel.status === "BLOCKED"
              ? "bg-red-500/20 text-red-400"
              : "bg-slate-500/20 text-slate-500"
          }`}
        >
          {bushel.status.replace("_", " ")}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <ProgressBar current={bushel.phase_current} total={bushel.phase_total} />
        <span className="text-[10px] text-slate-500">{bushel.phase_label}</span>
      </div>
      {bushel.last_file_modified && (
        <div className="text-[10px] text-slate-600 font-mono">
          modified {relativeTime(bushel.last_file_modified)}
        </div>
      )}
    </div>
  );
}

function YokeMessageRow({ msg }: { msg: YokeMessage }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 cursor-pointer hover:bg-slate-900/70 transition-colors"
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start gap-2 flex-wrap">
        <span
          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${YOKE_TYPE_COLORS[msg.type] ?? YOKE_TYPE_COLORS.INFO}`}
        >
          {msg.type}
        </span>
        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
          {msg.from} → {msg.to}
        </span>
        <span className="text-[10px] text-slate-600 font-mono ml-auto flex-shrink-0">
          {relativeTime(msg.timestamp)}
        </span>
        <span className="ml-1 text-slate-600">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </div>
      <div className={`mt-1.5 font-mono text-xs text-slate-300 ${expanded ? "whitespace-pre-wrap break-words" : "truncate text-slate-400"}`}>
        {expanded ? msg.content_full : msg.content_preview}
      </div>
    </div>
  );
}

function QueueItemRow({ item, index }: { item: QueueItem; index: number }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 flex items-start gap-2 ${
        index === 0 ? "border-amber-500/30 bg-amber-950/10" : "border-slate-800 bg-slate-900/30"
      }`}
    >
      <span className="text-[10px] text-slate-600 font-mono w-5 flex-shrink-0 pt-0.5">
        {index + 1}.
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {index === 0 && (
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">NEXT UP</span>
          )}
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[item.priority]}`}
          >
            {item.priority}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{item.session}</span>
          {item.bushel_number && (
            <span className="text-[10px] text-cyan-600 font-mono">B{item.bushel_number}</span>
          )}
        </div>
        <div className="text-xs text-slate-300 font-mono truncate mt-0.5">
          {item.display_name}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ForemanDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [isFounder, setIsFounder] = useState<boolean | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [data, setData] = useState<ForemanStatus | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Role check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setRoleLoading(false); return; }
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setIsFounder(profile?.role === "founder");
      setRoleLoading(false);
    })();
  }, [user]);

  // ── Data fetch ──────────────────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("get-foreman-status");
      if (error) {
        setFetchError(error.message ?? "Edge function error");
      } else {
        setData(result as ForemanStatus);
        setFetchError(null);
        setLastFetch(new Date().toISOString());
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
      }
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Network error");
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!isFounder) return;
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 10_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isFounder, fetchStatus]);

  // ── Auth gates ──────────────────────────────────────────────────────────────
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (isFounder === false) return <Navigate to="/" replace />;

  // ── Active / queued bushels split ───────────────────────────────────────────
  const activeBushels = data?.bushels.filter((b) => b.status === "IN_PROGRESS" || b.status === "BLOCKED") ?? [];
  const queuedBushels = data?.bushels.filter((b) => b.status === "QUEUED").slice(0, 5) ?? [];
  const landedBushels = data?.bushels.filter((b) => b.status === "LANDED").slice(0, 5) ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* ── HEADER ── */}
      <div className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <h1 className="text-lg font-mono font-bold tracking-widest text-amber-400 uppercase">
              FOREMAN
            </h1>
            <span className="text-[10px] text-slate-600 font-mono hidden sm:block">
              mission control · BP025
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Live pulse indicator */}
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  pulse ? "bg-green-300" : "bg-green-500"
                } animate-pulse`}
              />
              <span className="text-[10px] text-slate-500 font-mono hidden sm:block">LIVE · 10s</span>
            </div>
            {lastFetch && (
              <span className="text-[10px] text-slate-600 font-mono hidden md:block">
                {relativeTime(lastFetch)}
              </span>
            )}
            <button
              onClick={fetchStatus}
              disabled={refreshing}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors disabled:opacity-50"
              title="Manual refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* ── Error banner ── */}
        {fetchError && (
          <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-300 font-mono">{fetchError}</span>
          </div>
        )}

        {data?.error_notes?.length > 0 && (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-950/10 px-4 py-2">
            {data.error_notes.map((note, i) => (
              <div key={i} className="text-xs text-yellow-600 font-mono">{note}</div>
            ))}
          </div>
        )}

        {/* ── SECTION 1: AGENT CARDS ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
              Agents
            </h2>
          </div>
          {data ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {data.agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {["bishop", "knight", "pawn", "rook"].map((id) => (
                <div key={id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 animate-pulse h-24" />
              ))}
            </div>
          )}
        </section>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          {/* LEFT: Bushel board + Yoke feed */}
          <div className="space-y-6">
            {/* ── SECTION 2: BUSHEL PROGRESS BOARD ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                  Bushel Progress
                </h2>
                {data && (
                  <span className="text-[10px] text-slate-600 font-mono">
                    {activeBushels.length} active · {queuedBushels.length} queued · {landedBushels.length} recently landed
                  </span>
                )}
              </div>

              {data ? (
                <div className="space-y-4">
                  {activeBushels.length > 0 && (
                    <div>
                      <div className="text-[10px] text-yellow-600 font-mono uppercase tracking-wider mb-2">In Progress</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {activeBushels.map((b) => <BushelCard key={b.number} bushel={b} />)}
                      </div>
                    </div>
                  )}
                  {queuedBushels.length > 0 && (
                    <div>
                      <div className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mb-2">Queued</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {queuedBushels.map((b) => <BushelCard key={b.number} bushel={b} />)}
                      </div>
                    </div>
                  )}
                  {landedBushels.length > 0 && (
                    <div>
                      <div className="text-[10px] text-green-800 font-mono uppercase tracking-wider mb-2">Recently Landed</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {landedBushels.map((b) => <BushelCard key={b.number} bushel={b} />)}
                      </div>
                    </div>
                  )}
                  {activeBushels.length === 0 && queuedBushels.length === 0 && landedBushels.length === 0 && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-8 text-center">
                      <CheckCircle2 className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 font-mono">No active Bushels detected</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/30 p-3 animate-pulse h-16" />
                  ))}
                </div>
              )}
            </section>

            {/* ── SECTION 3: YOKE MESSAGE FEED ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                  Yoke Feed
                </h2>
                {data && (
                  <span className="text-[10px] text-slate-600 font-mono">
                    last {data.yoke.length} messages · newest first
                  </span>
                )}
              </div>

              {data ? (
                <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                  {data.yoke.length > 0 ? (
                    data.yoke.map((msg, i) => <YokeMessageRow key={i} msg={msg} />)
                  ) : (
                    <div className="rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-8 text-center">
                      <Radio className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 font-mono">No Yoke messages parsed</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 animate-pulse h-12" />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: Queue panel */}
          <div className="space-y-6">
            {/* ── SECTION 4: QUEUE PANEL ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <List className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                  Knight Queue
                </h2>
                {data && (
                  <span className="text-[10px] font-mono font-bold text-amber-500 ml-auto">
                    {data.queue_count} items
                  </span>
                )}
              </div>

              {data ? (
                <div className="space-y-1.5 max-h-[800px] overflow-y-auto pr-1">
                  {data.queue.length > 0 ? (
                    data.queue.map((item, i) => (
                      <QueueItemRow key={item.filename} item={item} index={i} />
                    ))
                  ) : (
                    <div className="rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-8 text-center">
                      <CheckCircle2 className="w-6 h-6 text-green-800 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 font-mono">Queue clear</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/30 p-2.5 animate-pulse h-10" />
                  ))}
                </div>
              )}
            </section>

            {/* Wave Status Summary */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                  Wave Status
                </h2>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                {[
                  { wave: 1, label: "Wave 1 — Dagon/Ithaqua/Shub/Nyarl", status: "LANDED", detail: "Wave 1 Old Ones" },
                  { wave: 2, label: "Wave 2 — urSu/urZah/urUtt/urIm", status: "ACTIVE", detail: "Dark Crystal cohort" },
                  { wave: 3, label: "Wave 3", status: "QUEUED", detail: "Pending dispatch" },
                ].map((w) => (
                  <div key={w.wave} className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        w.status === "LANDED" ? "bg-green-500"
                        : w.status === "ACTIVE" ? "bg-yellow-400 animate-pulse"
                        : "bg-slate-600"
                      }`}
                    />
                    <span className="text-xs font-mono text-slate-400 flex-1 truncate">{w.label}</span>
                    <span
                      className={`text-[9px] font-bold uppercase ${
                        w.status === "LANDED" ? "text-green-500"
                        : w.status === "ACTIVE" ? "text-yellow-400"
                        : "text-slate-600"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Stat summary */}
            {data && (
              <section>
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                  <div className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mb-2">Summary</div>
                  {[
                    { label: "Queue depth", value: data.queue_count, color: "text-amber-400" },
                    { label: "Yoke messages", value: data.yoke.length, color: "text-cyan-400" },
                    { label: "Active Bushels", value: activeBushels.length, color: "text-yellow-400" },
                    { label: "Landed Bushels", value: data.bushels.filter(b => b.status === "LANDED").length, color: "text-green-400" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-mono">{s.label}</span>
                      <span className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-mono">Last updated</span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-600 font-mono">
                        <Clock className="w-3 h-3" />
                        {relativeTime(data.last_updated)}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
