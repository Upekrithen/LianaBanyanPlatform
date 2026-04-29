/**
 * OutreachIndexPage — The Glass Door public index
 * ==================================================
 * K412 / B099 — Innovation #2262 The Glass Door
 *
 * Public listing of all outreach letters by state.
 * Route: /outreach
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Send,
  Clock,
  CheckCircle2,
  MessageCircle,
  AlertTriangle,
  Users,
  Shield,
  ExternalLink,
} from "lucide-react";

interface LetterSummary {
  letter_id: string;
  slug: string;
  recipient_name: string;
  recipient_category: string;
  recipient_tier: number;
  state: string;
  voting_mode: string;
  wave_label: string | null;
  scheduled_dispatch: string | null;
  dispatched_at: string | null;
  what_we_are_asking: string;
  created_at: string;
}

const STATE_ORDER = [
  "locked",
  "proposed",
  "scheduled",
  "pre_responded",
  "dispatched",
  "formally_dispatched",
  "acknowledged",
  "answered",
  "no_response",
  "withdrawn",
  "retracted",
];

const STATE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  locked: { label: "Advance Notice — Prose-Passed", icon: <Shield className="w-4 h-4" />, color: "#d4a853" },
  proposed: { label: "Proposed — Awaiting Member Amplification", icon: <Users className="w-4 h-4" />, color: "#f59e0b" },
  scheduled: { label: "Scheduled for Dispatch", icon: <Clock className="w-4 h-4" />, color: "#3b82f6" },
  pre_responded: { label: "Pre-Responded — Recipient Self-Discovered", icon: <MessageCircle className="w-4 h-4" />, color: "#a78bfa" },
  dispatched: { label: "Dispatched — Awaiting Response", icon: <Send className="w-4 h-4" />, color: "#8b5cf6" },
  formally_dispatched: { label: "Formally Dispatched", icon: <Send className="w-4 h-4" />, color: "#6366f1" },
  acknowledged: { label: "Acknowledged", icon: <CheckCircle2 className="w-4 h-4" />, color: "#06b6d4" },
  answered: { label: "Answered", icon: <MessageCircle className="w-4 h-4" />, color: "#22c55e" },
  no_response: { label: "No Response", icon: <Clock className="w-4 h-4" />, color: "#64748b" },
  withdrawn: { label: "Withdrawn", icon: <AlertTriangle className="w-4 h-4" />, color: "#f59e0b" },
  retracted: { label: "Retracted", icon: <AlertTriangle className="w-4 h-4" />, color: "#ef4444" },
};

export default function OutreachIndexPage() {
  const [letters, setLetters] = useState<LetterSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await (supabase
        .from("outreach_letters" as never)
        .select("letter_id, slug, recipient_name, recipient_category, recipient_tier, state, voting_mode, wave_label, scheduled_dispatch, dispatched_at, what_we_are_asking, created_at") as any)
        .neq("state", "draft")
        .order("created_at", { ascending: false });

      setLetters((data || []) as LetterSummary[]);
      setLoading(false);
    };
    load();
  }, []);

  const grouped = STATE_ORDER.reduce<Record<string, LetterSummary[]>>((acc, state) => {
    const matching = letters.filter((l) => l.state === state);
    if (matching.length > 0) acc[state] = matching;
    return acc;
  }, {});

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5" style={{ color: "#d4a853" }} />
            <h1
              className="text-2xl font-bold"
              style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
            >
              Glass Door — Open Outreach
            </h1>
          </div>
          <p className="text-sm text-slate-400" style={{ lineHeight: 1.7 }}>
            Our outreach is on the record before it arrives. Members amplify. Recipients
            pre-discover. Founder dispatches. The strategy is open.
          </p>
          <p className="text-xs text-slate-600 mt-1">
            A&A #2262 · #2327 candidate · Radical transparency by design.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-12 justify-center">
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{ borderColor: "rgba(212,168,83,0.2)", borderTopColor: "#d4a853" }}
            />
            <span className="text-sm text-slate-500">Loading letters...</span>
          </div>
        ) : letters.length === 0 ? (
          <div className="text-center py-16">
            <Send className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(148,163,184,0.3)" }} />
            <p className="text-slate-500">No outreach letters have been published yet.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([state, items]) => {
            const config = STATE_CONFIG[state] || STATE_CONFIG.proposed;
            return (
              <div key={state} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ color: config.color }}>{config.icon}</span>
                  <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: config.color }}>
                    {config.label}
                  </h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>
                    {items.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {items.map((letter) => (
                    <Link
                      key={letter.letter_id}
                      to={`/outreach/${letter.slug}`}
                      className="block rounded-lg border p-3 transition-colors hover:border-amber-800/30"
                      style={{
                        borderColor: "rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium" style={{ color: "#faf5eb" }}>
                              {letter.recipient_name}
                            </span>
                            {letter.voting_mode === "binding" && (
                              <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                                binding
                              </span>
                            )}
                            {letter.wave_label && (
                              <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: "rgba(212,168,83,0.1)", color: "#d4a853" }}>
                                {letter.wave_label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {letter.what_we_are_asking}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 text-slate-600">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      {letter.scheduled_dispatch && (
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(letter.scheduled_dispatch).toLocaleDateString("en-US", {
                            weekday: "short", month: "short", day: "numeric",
                          })}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
