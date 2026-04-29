/**
 * OutreachLettersAdminPage — Founder letter lock console
 * =========================================================
 * K537 / B131 — Glass Door Open Outreach
 * Route: /admin/outreach-letters
 *
 * Founder-only UI for:
 *   - Viewing ALL outreach letters including drafts
 *   - Transitioning state: draft → locked → proposed → scheduled
 *   - Setting wave_label on letters for public Wave metadata
 *   - Quick-view dispatch window info
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Lock, Users, Clock, Send, AlertTriangle, ChevronDown } from "lucide-react";

interface AdminLetter {
  letter_id: string;
  slug: string;
  recipient_name: string;
  state: string;
  wave_label: string | null;
  voting_mode: string;
  scheduled_dispatch: string | null;
  created_at: string;
}

const STATE_TRANSITIONS: Record<string, string | null> = {
  draft: "locked",
  locked: "proposed",
  proposed: "scheduled",
  pre_responded: "formally_dispatched",
  scheduled: null,
  dispatched: null,
  formally_dispatched: null,
  acknowledged: null,
  answered: null,
  no_response: null,
  withdrawn: null,
  retracted: null,
};

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "#64748b" },
  locked: { label: "Locked ✓", color: "#d4a853" },
  proposed: { label: "Proposed", color: "#f59e0b" },
  scheduled: { label: "Scheduled", color: "#3b82f6" },
  pre_responded: { label: "Pre-Responded", color: "#a78bfa" },
  dispatched: { label: "Dispatched", color: "#8b5cf6" },
  formally_dispatched: { label: "Formally Dispatched", color: "#6366f1" },
  acknowledged: { label: "Acknowledged", color: "#06b6d4" },
  answered: { label: "Answered", color: "#22c55e" },
  no_response: { label: "No Response", color: "#94a3b8" },
  withdrawn: { label: "Withdrawn", color: "#f59e0b" },
  retracted: { label: "Retracted", color: "#ef4444" },
};

const NEXT_ACTION_LABELS: Record<string, string> = {
  locked: "Propose for member vote",
  proposed: "Schedule for dispatch",
  pre_responded: "Mark formally dispatched",
};

export default function OutreachLettersAdminPage() {
  const [letters, setLetters] = useState<AdminLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState<string | null>(null);
  const [editingWave, setEditingWave] = useState<string | null>(null);
  const [waveInput, setWaveInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data } = await (supabase
      .from("outreach_letters" as never)
      .select("letter_id, slug, recipient_name, state, wave_label, voting_mode, scheduled_dispatch, created_at") as any)
      .order("created_at", { ascending: false });
    setLetters((data || []) as AdminLetter[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleTransition = async (letter: AdminLetter) => {
    const next = STATE_TRANSITIONS[letter.state];
    if (!next) return;

    setTransitioning(letter.letter_id);
    setError(null);

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) { setError("Not authenticated"); setTransitioning(null); return; }

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lock-outreach-letter`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ letter_id: letter.letter_id, target_state: next }),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      setError(`Transition failed: ${data.error}`);
    } else {
      await load();
    }
    setTransitioning(null);
  };

  const handleWaveSave = async (letter: AdminLetter) => {
    await (supabase
      .from("outreach_letters" as never)
      .update({ wave_label: waveInput || null } as never) as any)
      .eq("letter_id", letter.letter_id);
    setEditingWave(null);
    await load();
  };

  const grouped = Object.entries(
    letters.reduce<Record<string, AdminLetter[]>>((acc, l) => {
      (acc[l.state] = acc[l.state] || []).push(l);
      return acc;
    }, {}),
  ).sort(([a], [b]) => {
    const order = ["draft", "locked", "proposed", "scheduled", "pre_responded", "dispatched", "formally_dispatched"];
    return (order.indexOf(a) ?? 99) - (order.indexOf(b) ?? 99);
  });

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5" style={{ color: "#d4a853" }} />
          <h1 className="text-xl font-bold" style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}>
            Glass Door — Letter Lock Console
          </h1>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Founder-only. Transition letters: draft → locked → proposed → scheduled.
          Locked letters are visible on the public Glass Door.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
            <AlertTriangle className="w-4 h-4 inline mr-1" /> {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : (
          grouped.map(([state, items]) => {
            const cfg = STATE_LABELS[state] || { label: state, color: "#94a3b8" };
            return (
              <div key={state} className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((letter) => {
                    const nextState = STATE_TRANSITIONS[letter.state];
                    const actionLabel = nextState ? (NEXT_ACTION_LABELS[letter.state] || `→ ${nextState}`) : null;
                    return (
                      <div
                        key={letter.letter_id}
                        className="rounded-lg p-3"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium" style={{ color: "#faf5eb" }}>
                                {letter.recipient_name}
                              </span>
                              <span className="text-[9px] font-mono text-slate-600">/{letter.slug}</span>
                            </div>

                            {/* Wave label editor */}
                            <div className="mt-1.5 flex items-center gap-2">
                              {editingWave === letter.letter_id ? (
                                <>
                                  <input
                                    type="text"
                                    value={waveInput}
                                    onChange={(e) => setWaveInput(e.target.value)}
                                    placeholder="e.g. Wave 1"
                                    className="px-2 py-0.5 text-xs rounded bg-transparent border w-28"
                                    style={{ borderColor: "rgba(255,255,255,0.15)", color: "#e2e8f0" }}
                                    autoFocus
                                  />
                                  <button onClick={() => handleWaveSave(letter)} className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(212,168,83,0.2)", color: "#d4a853" }}>Save</button>
                                  <button onClick={() => setEditingWave(null)} className="text-xs text-slate-600">Cancel</button>
                                </>
                              ) : (
                                <button
                                  onClick={() => { setEditingWave(letter.letter_id); setWaveInput(letter.wave_label || ""); }}
                                  className="text-[10px] flex items-center gap-1 text-slate-600 hover:text-slate-400 transition-colors"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                  {letter.wave_label ? (
                                    <span style={{ color: "#d4a853" }}>{letter.wave_label}</span>
                                  ) : (
                                    "Set wave label"
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Transition button */}
                          {actionLabel && (
                            <button
                              onClick={() => handleTransition(letter)}
                              disabled={transitioning === letter.letter_id}
                              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                              style={{
                                background: "rgba(212,168,83,0.12)",
                                border: "1px solid rgba(212,168,83,0.25)",
                                color: "#d4a853",
                              }}
                            >
                              {letter.state === "draft" ? <Lock className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                              {transitioning === letter.letter_id ? "..." : actionLabel}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
