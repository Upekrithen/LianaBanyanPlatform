/**
 * CoopMeshActivity — M22 §6 "Cooperative Mesh Activity" Settings section
 * BP091 · v0.6.0 · Shows live peer roster, MIC PRIMARY/SHADOWS, per-peer Marks balance
 */
import { useState, useEffect } from "react";
import { Activity, Server, Cpu, Zap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PeerSummary {
  peer_id: string;
  wan_soccerball_id: string;
  machine_label: string;
  ram_tier: string;
  model: string;
  last_seen_at: string;
  role: string;           // 'worker' | 'MIC' | 'stale'
  marks_total: number;
  last_task_at: string | null;
}

interface ActivitySummary {
  status: string;
  peers: PeerSummary[];
  total_marks: number;
  error?: string;
}

const TIER_COLORS: Record<string, string> = {
  ULTRA: "text-violet-600 dark:text-violet-400",
  FULL:  "text-blue-600 dark:text-blue-400",
  CORE:  "text-emerald-600 dark:text-emerald-400",
  LITE:  "text-amber-600 dark:text-amber-400",
  NANO:  "text-slate-500 dark:text-slate-400",
};

function formatRelative(isoString: string | null): string {
  if (!isoString) return "—";
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return `${Math.round(diff / 3600)}h ago`;
}

export function CoopMeshActivity() {
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await (window as unknown as { electron?: { ipcRenderer?: { invoke: (ch: string) => Promise<ActivitySummary> } } })
        .electron?.ipcRenderer?.invoke('mesh:get-activity-summary');
      setSummary(result ?? null);
    } catch (err) {
      setSummary({ status: 'error', peers: [], total_marks: 0, error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const primaryPeer = summary?.peers.find(p => p.role === 'MIC');

  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            COOPERATIVE MESH ACTIVITY
          </h3>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 text-slate-500", loading && "animate-spin")} />
        </button>
      </div>

      {summary?.status === 'error' && (
        <p className="text-xs text-red-500">{summary.error}</p>
      )}

      {!summary && !loading && (
        <p className="text-xs text-slate-400">Click refresh to load mesh activity.</p>
      )}

      {summary?.peers && summary.peers.length > 0 && (
        <>
          {/* Active Peers */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Active Peers ({summary.peers.length})
            </p>
            {summary.peers.map(peer => (
              <div key={peer.peer_id} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 min-w-0">
                  <Cpu className="w-3 h-3 shrink-0 text-slate-400" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {peer.machine_label}
                  </span>
                  <span className={cn("text-xs font-mono shrink-0", TIER_COLORS[peer.ram_tier?.toUpperCase()] ?? "text-slate-400")}>
                    {peer.ram_tier?.toUpperCase()}
                  </span>
                  {peer.role === 'MIC' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded font-medium">
                      MIC PRIMARY
                    </span>
                  )}
                  {peer.role === 'SHADOW' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded font-medium">
                      SHADOW
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-[11px] text-slate-400">{formatRelative(peer.last_task_at)}</span>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    {peer.marks_total} <span className="text-[10px] text-slate-400">Marks</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Fleet Summary */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{summary.peers.length}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Peers Online</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-500">{summary.total_marks}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total Marks</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-violet-500" />
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {primaryPeer?.machine_label ?? 'No MIC'}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">MIC Primary</p>
            </div>
          </div>
        </>
      )}

      {summary?.peers && summary.peers.length === 0 && (
        <div className="text-center py-4">
          <Server className="w-6 h-6 mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-400">No active peers in mesh.</p>
          <p className="text-[11px] text-slate-300 mt-1">Install MnemosyneC on other machines to join the cooperative.</p>
        </div>
      )}
    </div>
  );
}

export default CoopMeshActivity;
