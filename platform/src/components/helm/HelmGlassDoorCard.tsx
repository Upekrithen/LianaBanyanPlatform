/**
 * HelmGlassDoorCard — Founder's Glass Door queue in Helm dashboard
 * ==================================================================
 * K412 / B099 — Innovation #2262 The Glass Door
 *
 * Shows pending outreach letters with vote tallies. Composes with
 * the K411 HelmScheduleCard on the Helm page.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield,
  Send,
  Clock,
  Users,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface GlassDoorSummary {
  letter_id: string;
  slug: string;
  recipient_name: string;
  state: string;
  voting_mode: string;
  scheduled_dispatch: string | null;
  recipient_tier: number;
}

interface VerdictSummary {
  total_votes: number;
  approve_count: number;
  veto_count: number;
  approval_pct: number;
  verdict: string;
}

export function HelmGlassDoorCard() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<GlassDoorSummary[]>([]);
  const [verdicts, setVerdicts] = useState<Record<string, VerdictSummary>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await (supabase
        .from("outreach_letters" as never)
        .select("letter_id, slug, recipient_name, state, voting_mode, scheduled_dispatch, recipient_tier") as any)
        .in("state", ["proposed", "scheduled"])
        .order("scheduled_dispatch", { ascending: true, nullsFirst: false });

      const items = (data || []) as GlassDoorSummary[];
      setLetters(items);

      const vMap: Record<string, VerdictSummary> = {};
      for (const l of items.slice(0, 10)) {
        const { data: v } = await (supabase as any).rpc("compute_outreach_letter_verdict", {
          p_letter_id: l.letter_id,
        });
        if (v?.[0]) vMap[l.letter_id] = v[0];
      }
      setVerdicts(vMap);
      setLoading(false);
    };

    load();
  }, [user]);

  if (!user) return null;

  return (
    <div
      className="rounded-xl border"
      style={{
        borderColor: "rgba(139,92,246,0.15)",
        background: "linear-gradient(180deg, rgba(10,22,40,0.95) 0%, rgba(13,31,60,0.95) 100%)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: "#a78bfa" }} />
          <h3
            className="text-sm font-semibold"
            style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
          >
            Glass Door Queue
          </h3>
        </div>
        <Link to="/outreach" className="text-[10px] flex items-center gap-0.5" style={{ color: "#a78bfa" }}>
          View all <ExternalLink className="w-2.5 h-2.5" />
        </Link>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {loading ? (
          <div className="flex items-center gap-2 py-4 justify-center">
            <div
              className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{ borderColor: "rgba(139,92,246,0.2)", borderTopColor: "#a78bfa" }}
            />
            <span className="text-xs text-slate-500">Loading queue...</span>
          </div>
        ) : letters.length === 0 ? (
          <div className="text-center py-4">
            <Send className="w-6 h-6 mx-auto mb-1.5" style={{ color: "rgba(148,163,184,0.3)" }} />
            <p className="text-xs text-slate-500">No letters in the queue.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {letters.map((l) => {
              const v = verdicts[l.letter_id];
              return (
                <Link
                  key={l.letter_id}
                  to={`/outreach/${l.slug}`}
                  className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{
                          background: l.state === "scheduled" ? "rgba(59,130,246,0.1)" : "rgba(245,158,11,0.1)",
                          color: l.state === "scheduled" ? "#60a5fa" : "#f59e0b",
                        }}
                      >
                        {l.state === "scheduled" ? "SCHED" : "PROP"}
                      </span>
                      <span className="text-sm font-medium truncate" style={{ color: "#faf5eb" }}>
                        {l.recipient_name}
                      </span>
                    </div>
                    {v && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Users className="w-3 h-3" />
                        {v.total_votes} vote{v.total_votes !== 1 ? "s" : ""}
                        {v.total_votes > 0 && (
                          <span style={{ color: v.verdict === "approved" ? "#4ade80" : v.verdict === "vetoed" ? "#f87171" : "#94a3b8" }}>
                            {v.approval_pct.toFixed(0)}% approve
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {l.scheduled_dispatch && (
                    <div className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(l.scheduled_dispatch).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
