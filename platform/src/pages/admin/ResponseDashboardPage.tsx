/**
 * ResponseDashboardPage — /admin/response-dashboard
 * =====================================================
 * Founder-facing dashboard showing the state of all 42 Opening Gambit letters.
 * Replaces "hope Bishop/Founder remembers who needs what when."
 * K409 / B097 — Pitfall 3 response playbook wiring.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useResponseLedger, type LetterStatus } from "@/hooks/useResponseLedger";
import {
  Anchor, AlertTriangle, CheckCircle, Clock, Send, Mail, ArrowRight,
  BarChart3, RefreshCw,
} from "lucide-react";

const PHASE_MAP: Record<string, { phase: number; label: string; tier: string }> = {
  "Melinda French Gates": { phase: 1, label: "Board", tier: "T1" },
  "Craig Newmark": { phase: 1, label: "Board", tier: "T1" },
  "Erik Brynjolfsson": { phase: 1, label: "Board", tier: "T2" },
  "Nathan Schneider": { phase: 1, label: "Board", tier: "T2" },
  "Trebor Scholz": { phase: 1, label: "Board", tier: "T2" },
  "Cory Doctorow": { phase: 1, label: "Board", tier: "T2" },
  "Daron Acemoglu": { phase: 1, label: "Board", tier: "T2" },
  "Yochai Benkler": { phase: 1, label: "Board", tier: "T2" },
  "Julian Posada": { phase: 1, label: "Board", tier: "T2" },
  "Antonio Casilli": { phase: 2, label: "Validators", tier: "T2" },
  "Paola Ricaurte Quijano": { phase: 2, label: "Validators", tier: "T2" },
  "Netsaalem Gebrie": { phase: 2, label: "Validators", tier: "T2" },
  "Shoshana Zuboff": { phase: 2, label: "Validators", tier: "T2" },
  "Kate Raworth": { phase: 2, label: "Validators", tier: "T2" },
  "Mariana Mazzucato": { phase: 2, label: "Validators", tier: "T2" },
  "Juliet Schor": { phase: 2, label: "Validators", tier: "T2" },
  "Arun Sundararajan": { phase: 2, label: "Validators", tier: "T2" },
  "Douglas Rushkoff": { phase: 2, label: "Validators", tier: "T3" },
  "Howard Marks": { phase: 2, label: "Validators", tier: "T1" },
  "Seth Godin": { phase: 2, label: "Validators", tier: "T3" },
  "Li Jin": { phase: 2, label: "Validators", tier: "T1" },
  "Anand Giridharadas": { phase: 2, label: "Validators", tier: "T3" },
  "Esther Perel": { phase: 2, label: "Validators", tier: "T3" },
  "Kara Swisher": { phase: 3, label: "Amplifiers", tier: "T3" },
  "Ezra Klein": { phase: 3, label: "Amplifiers", tier: "T3" },
  "Nilay Patel": { phase: 3, label: "Amplifiers", tier: "T3" },
  "Hank Green": { phase: 3, label: "Amplifiers", tier: "T3" },
  "Paris Marx": { phase: 3, label: "Amplifiers", tier: "T3" },
  "Ed Zitron": { phase: 3, label: "Amplifiers", tier: "T3" },
  "Brian Merchant": { phase: 3, label: "Amplifiers", tier: "T3" },
  "Molly White": { phase: 3, label: "Amplifiers", tier: "T3" },
  "Tim Ingham": { phase: 3, label: "Amplifiers", tier: "T3" },
  "Kiko Martinez": { phase: 3, label: "Amplifiers", tier: "T3" },
  "Ai-jen Poo": { phase: 3, label: "Amplifiers", tier: "T3" },
  "Majora Carter": { phase: 3, label: "Amplifiers", tier: "T3" },
  "Simon Sinek": { phase: 3, label: "Amplifiers", tier: "T3" },
  "Taylor Swift": { phase: 4, label: "Stars", tier: "T5" },
  "Dolly Parton": { phase: 4, label: "Stars", tier: "T5" },
  "Jimmy Kimmel": { phase: 4, label: "Stars", tier: "T5" },
  "Pitbull": { phase: 4, label: "Stars", tier: "T5" },
  "Ziwe Fumudoh": { phase: 4, label: "Stars", tier: "T5" },
  "Bambu Lab": { phase: 4, label: "Partnership", tier: "T4" },
};

function StatusBadge({ status }: { status: LetterStatus }) {
  if (status.needs_followup) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
        <AlertTriangle className="w-3 h-3" /> NEEDS FOLLOWUP
      </span>
    );
  }
  if (status.overdue_response) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-orange-500/15 text-orange-400 border border-orange-500/30">
        <Clock className="w-3 h-3" /> 7d+ NO RESPONSE
      </span>
    );
  }
  if (status.followup_sent_at) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-green-500/15 text-green-400 border border-green-500/30">
        <CheckCircle className="w-3 h-3" /> COMPLETE
      </span>
    );
  }
  if (status.response_received_at) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
        <Mail className="w-3 h-3" /> RESPONDED
      </span>
    );
  }
  if (status.dispatched_at) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-slate-500/15 text-slate-400 border border-slate-500/30">
        <Send className="w-3 h-3" /> SENT
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-slate-800 text-slate-500 border border-slate-700">
      NOT SENT
    </span>
  );
}

export default function ResponseDashboardPage() {
  const { loading, getLetterStatuses, reload } = useResponseLedger();
  const [phaseFilter, setPhaseFilter] = useState<number | null>(null);
  const [alertOnly, setAlertOnly] = useState(false);

  const statuses = useMemo(() => getLetterStatuses(), [getLetterStatuses]);

  const filtered = useMemo(() => {
    let list = statuses;
    if (phaseFilter !== null) {
      list = list.filter((s) => PHASE_MAP[s.recipient_name]?.phase === phaseFilter);
    }
    if (alertOnly) {
      list = list.filter((s) => s.needs_followup || s.overdue_response);
    }
    return list;
  }, [statuses, phaseFilter, alertOnly]);

  const stats = useMemo(() => {
    const total = statuses.length;
    const dispatched = statuses.filter((s) => s.dispatched_at).length;
    const responded = statuses.filter((s) => s.response_received_at).length;
    const followedUp = statuses.filter((s) => s.followup_sent_at).length;
    const needsFollowup = statuses.filter((s) => s.needs_followup).length;
    const overdueResponse = statuses.filter((s) => s.overdue_response).length;
    return { total, dispatched, responded, followedUp, needsFollowup, overdueResponse };
  }, [statuses]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-bold text-white">Response Dashboard</h1>
          <span className="text-xs text-slate-500">42 Opening Gambit Letters</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reload}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/admin/response-log"
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30"
          >
            Log Response <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-slate-300" },
          { label: "Sent", value: stats.dispatched, color: "text-blue-400" },
          { label: "Responded", value: stats.responded, color: "text-green-400" },
          { label: "Followed Up", value: stats.followedUp, color: "text-emerald-400" },
          { label: "Needs F/U", value: stats.needsFollowup, color: "text-red-400" },
          { label: "7d+ Silent", value: stats.overdueResponse, color: "text-orange-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg px-3 py-2 text-center"
            style={{ background: "rgba(10,22,40,0.8)", border: "1px solid rgba(56,161,105,0.1)" }}
          >
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <button
          onClick={() => setPhaseFilter(null)}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            phaseFilter === null && !alertOnly
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              : "bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-slate-200"
          }`}
        >
          All ({stats.total})
        </button>
        {[1, 2, 3, 4].map((p) => {
          const label = p === 1 ? "Board" : p === 2 ? "Validators" : p === 3 ? "Amplifiers" : "Stars";
          const count = statuses.filter((s) => PHASE_MAP[s.recipient_name]?.phase === p).length;
          return (
            <button
              key={p}
              onClick={() => { setPhaseFilter(p); setAlertOnly(false); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                phaseFilter === p
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-slate-200"
              }`}
            >
              P{p} {label} ({count})
            </button>
          );
        })}
        <button
          onClick={() => { setAlertOnly(!alertOnly); setPhaseFilter(null); }}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            alertOnly
              ? "bg-red-500/20 text-red-400 border border-red-500/40"
              : "bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-slate-200"
          }`}
        >
          Alerts Only ({stats.needsFollowup + stats.overdueResponse})
        </button>
      </div>

      {/* Letter table */}
      {loading ? (
        <div className="text-xs text-slate-500 py-8 text-center">Loading ledger...</div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((s) => {
            const meta = PHASE_MAP[s.recipient_name];
            return (
              <div
                key={s.recipient_name}
                className="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:bg-white/[0.02]"
                style={{
                  background: s.needs_followup ? "rgba(239,68,68,0.04)" : "rgba(10,22,40,0.6)",
                  border: `1px solid ${s.needs_followup ? "rgba(239,68,68,0.2)" : "rgba(56,161,105,0.08)"}`,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col items-center w-8 flex-shrink-0">
                    <span className="text-[9px] text-slate-600 uppercase">P{meta?.phase}</span>
                    <span className="text-[9px] text-slate-600">{meta?.tier}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">{s.recipient_name}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2 flex-wrap">
                      {s.dispatched_at && (
                        <span>Sent {new Date(s.dispatched_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      )}
                      {s.hours_since_dispatch !== null && (
                        <span>&middot; {s.hours_since_dispatch < 24
                          ? `${Math.round(s.hours_since_dispatch)}h ago`
                          : `${Math.round(s.hours_since_dispatch / 24)}d ago`
                        }</span>
                      )}
                      {s.response_type && (
                        <span className="text-green-500">&middot; {s.response_type.replace(/_/g, " ")}</span>
                      )}
                      {s.response_summary && (
                        <span className="text-slate-600 truncate max-w-[200px]">&middot; {s.response_summary}</span>
                      )}
                    </div>
                  </div>
                </div>
                <StatusBadge status={s} />
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <Anchor className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-500">
            {alertOnly ? "No alerts — all clear." : "No letters match this filter."}
          </p>
        </div>
      )}
    </div>
  );
}
