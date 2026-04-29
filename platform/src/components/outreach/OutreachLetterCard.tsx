/**
 * OutreachLetterCard — Public-facing Glass Door letter card
 * ===========================================================
 * K412 / B099 — Innovation #2262 The Glass Door
 *
 * Renders one outreach letter for the Cephas-style public view.
 * No auth required for reading. Voting requires authentication.
 */

import { useState } from "react";
import { OutreachLetter, OutreachVerdict, OutreachVote, OutreachResponse } from "@/hooks/useOutreachLetters";
import {
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Users,
  Shield,
} from "lucide-react";

const STATE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  proposed: { label: "Proposed", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  scheduled: { label: "Scheduled", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  dispatched: { label: "Dispatched", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  acknowledged: { label: "Acknowledged", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  answered: { label: "Answered", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  no_response: { label: "No Response", color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  withdrawn: { label: "Withdrawn", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  retracted: { label: "RETRACTED", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
};

const CATEGORY_LABELS: Record<string, string> = {
  crown_letter: "Crown Position Letter",
  research_invitation: "Research Invitation",
  press_pitch: "Press Pitch",
  partnership_ask: "Partnership Ask",
  patron_outreach: "Patron Outreach",
  media_pitch: "Media Pitch",
  follow_up: "Follow-Up",
  apology: "Apology",
  other: "Other",
};

function VerdictBar({ verdict }: { verdict: OutreachVerdict | null }) {
  if (!verdict || verdict.total_votes === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Users className="w-3.5 h-3.5" />
        <span>No votes yet</span>
      </div>
    );
  }

  const approveWidth = Math.max(verdict.approval_pct, 2);
  const vetoWidth = Math.max(verdict.veto_pct, 2);
  const otherWidth = Math.max(100 - verdict.approval_pct - verdict.veto_pct, 0);

  return (
    <div>
      <div className="flex items-center gap-2 text-xs mb-1.5">
        <Users className="w-3.5 h-3.5 text-slate-400" />
        <span style={{ color: "#94a3b8" }}>
          {verdict.total_votes} vote{verdict.total_votes !== 1 ? "s" : ""}
        </span>
        <span className="text-slate-600">|</span>
        <span style={{ color: "#4ade80" }}>{verdict.approval_pct.toFixed(0)}% approve</span>
        {verdict.veto_count > 0 && (
          <>
            <span className="text-slate-600">|</span>
            <span style={{ color: "#f87171" }}>{verdict.veto_pct.toFixed(0)}% veto</span>
          </>
        )}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div style={{ width: `${approveWidth}%`, background: "#4ade80" }} className="rounded-l-full" />
        {otherWidth > 0 && (
          <div style={{ width: `${otherWidth}%`, background: "rgba(148,163,184,0.3)" }} />
        )}
        {verdict.veto_count > 0 && (
          <div style={{ width: `${vetoWidth}%`, background: "#f87171" }} className="rounded-r-full" />
        )}
      </div>
    </div>
  );
}

export function OutreachLetterCard({
  letter,
  verdict,
  votes,
  responses,
  compact = false,
}: {
  letter: OutreachLetter;
  verdict: OutreachVerdict | null;
  votes: OutreachVote[];
  responses: OutreachResponse[];
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const state = STATE_CONFIG[letter.state] || STATE_CONFIG.proposed;
  const isRetracted = letter.state === "retracted";

  return (
    <div
      className="rounded-xl border transition-colors"
      style={{
        borderColor: isRetracted ? "rgba(239,68,68,0.3)" : "rgba(212,168,83,0.12)",
        background: isRetracted
          ? "linear-gradient(180deg, rgba(30,10,10,0.95) 0%, rgba(20,5,5,0.95) 100%)"
          : "linear-gradient(180deg, rgba(10,22,40,0.95) 0%, rgba(13,31,60,0.95) 100%)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: state.bg, color: state.color }}
              >
                {state.label}
              </span>
              <span className="text-[10px] text-slate-500">
                {CATEGORY_LABELS[letter.recipient_category] || letter.recipient_category}
              </span>
              {letter.voting_mode === "binding" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                  <Shield className="w-2.5 h-2.5 inline mr-0.5" />Binding
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold" style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}>
              {letter.recipient_name}
            </h3>
          </div>
          {letter.scheduled_dispatch && (
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {new Date(letter.scheduled_dispatch).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Retraction banner */}
      {isRetracted && (
        <div className="px-4 py-2" style={{ background: "rgba(239,68,68,0.08)", borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: "#f87171" }}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-semibold">This letter has been retracted by member vote.</span>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="px-4 py-3">
        {/* What we're asking */}
        <div className="mb-3">
          <h4 className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
            What we are asking
          </h4>
          <p className="text-sm" style={{ color: "#e2e8f0", lineHeight: 1.6 }}>
            {letter.what_we_are_asking}
          </p>
        </div>

        {letter.what_we_are_not_asking && (
          <div className="mb-3">
            <h4 className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
              What we are NOT asking
            </h4>
            <p className="text-sm text-slate-400" style={{ lineHeight: 1.6 }}>
              {letter.what_we_are_not_asking}
            </p>
          </div>
        )}

        {/* Vote tally */}
        <div className="my-3">
          <VerdictBar verdict={verdict} />
        </div>

        {/* Collapsible full text */}
        {!compact && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs mt-2 transition-colors"
            style={{ color: "#d4a853" }}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? "Hide full letter" : "Read full letter"}
          </button>
        )}

        {expanded && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {letter.why_this_recipient && (
              <div className="mb-3">
                <h4 className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                  Why this recipient
                </h4>
                <p className="text-sm text-slate-300" style={{ lineHeight: 1.6 }}>
                  {letter.why_this_recipient}
                </p>
              </div>
            )}
            <div className="prose prose-sm prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-slate-300" style={{ fontFamily: "Georgia, serif", lineHeight: 1.8 }}>
                {letter.full_text}
              </pre>
            </div>
          </div>
        )}

        {/* Responses */}
        {responses.length > 0 && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-semibold flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> Response{responses.length > 1 ? "s" : ""}
            </h4>
            {responses.map((r) => (
              <div key={r.response_id} className="mb-2 p-2 rounded" style={{ background: "rgba(34,197,94,0.06)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-emerald-400">
                    {new Date(r.response_received_at).toLocaleDateString()}
                  </span>
                  {r.response_classifier && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80" }}>
                      {r.response_classifier}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">{r.response_summary}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent comments */}
        {votes.filter((v) => v.comment).length > 0 && !compact && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-semibold">
              Member comments
            </h4>
            {votes
              .filter((v) => v.comment)
              .slice(0, 5)
              .map((v) => (
                <div key={v.vote_id} className="mb-2 text-xs">
                  <span className="font-medium" style={{ color: v.vote_type === "veto" ? "#f87171" : "#94a3b8" }}>
                    [{v.vote_type}]
                  </span>{" "}
                  <span className="text-slate-400">{v.comment}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
