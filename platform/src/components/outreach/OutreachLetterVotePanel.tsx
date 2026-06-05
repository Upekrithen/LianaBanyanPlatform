/**
 * OutreachLetterVotePanel — Authenticated member voting interface
 * =================================================================
 * K412 / B099 — Innovation #2262 The Glass Door
 *
 * Six vote types with optional fields. Upsert-based (change vote anytime).
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { OutreachVote, OutreachVerdict } from "@/hooks/useOutreachLetters";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const VOTE_OPTIONS: { value: string; label: string; description: string; color: string }[] = [
  { value: "approve", label: "Approve", description: "Send this letter as written", color: "#4ade80" },
  { value: "request_edit", label: "Request Edit", description: "Suggest changes before sending", color: "#f59e0b" },
  { value: "delay", label: "Delay", description: "Postpone dispatch by N days", color: "#3b82f6" },
  { value: "redirect", label: "Redirect", description: "Suggest a different recipient", color: "#8b5cf6" },
  { value: "veto", label: "Veto", description: "Block this letter from being sent", color: "#ef4444" },
  { value: "abstain", label: "Abstain", description: "Counted but not for or against", color: "#64748b" },
];

export function OutreachLetterVotePanel({
  letterId,
  votes,
  verdict,
  onVote,
}: {
  letterId: string;
  votes: OutreachVote[];
  verdict: OutreachVerdict | null;
  onVote: (
    voteType: string,
    opts?: {
      comment?: string;
      proposed_edit?: string;
      proposed_delay_days?: number;
      proposed_redirect_recipient?: string;
    },
  ) => Promise<unknown>;
}) {
  const { user } = useAuth();
  const existingVote = votes.find((v) => v.member_id === user?.id);

  const [selected, setSelected] = useState<string>(existingVote?.vote_type || "");
  const [comment, setComment] = useState(existingVote?.comment || "");
  const [proposedEdit, setProposedEdit] = useState(existingVote?.proposed_edit || "");
  const [delayDays, setDelayDays] = useState<number>(existingVote?.proposed_delay_days || 7);
  const [redirectRecipient, setRedirectRecipient] = useState(existingVote?.proposed_redirect_recipient || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <div
        className="rounded-lg p-4 text-center"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-sm text-slate-400">
          Sign in to vote on this letter.
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    await onVote(selected, {
      comment: comment || undefined,
      proposed_edit: selected === "request_edit" ? proposedEdit : undefined,
      proposed_delay_days: selected === "delay" ? delayDays : undefined,
      proposed_redirect_recipient: selected === "redirect" ? redirectRecipient : undefined,
    });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div
      className="rounded-xl border"
      style={{
        borderColor: "rgba(212,168,83,0.12)",
        background: "linear-gradient(180deg, rgba(10,22,40,0.95) 0%, rgba(13,31,60,0.95) 100%)",
      }}
    >
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <h4 className="text-sm font-semibold" style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}>
          Cast Your Vote
        </h4>
        {existingVote && (
          <p className="text-[10px] text-slate-500 mt-0.5">
            You previously voted: <span style={{ color: "#d4a853" }}>{existingVote.vote_type}</span> — you can change your vote
          </p>
        )}
        {/* Scope 3: "if you vote for a letter, it is also sent to you" note */}
        <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: "#94a3b8" }}>
          If you vote to approve this letter, a copy will also be sent to you --
          so you can see exactly what was dispatched on behalf of the cooperative.
        </p>
      </div>

      <div className="px-4 py-3 space-y-2">
        {VOTE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors"
            style={{
              background: selected === opt.value ? `${opt.color}11` : "transparent",
              border: `1px solid ${selected === opt.value ? opt.color + "33" : "transparent"}`,
            }}
          >
            <input
              type="radio"
              name="vote"
              value={opt.value}
              checked={selected === opt.value}
              onChange={() => setSelected(opt.value)}
              className="mt-0.5 accent-amber-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium" style={{ color: opt.color }}>
                {opt.label}
              </span>
              <p className="text-[11px] text-slate-500">{opt.description}</p>
            </div>
          </label>
        ))}

        {/* Conditional fields */}
        {selected === "request_edit" && (
          <textarea
            value={proposedEdit}
            onChange={(e) => setProposedEdit(e.target.value)}
            placeholder="Describe your suggested edit..."
            rows={3}
            className="w-full mt-2 p-2 rounded text-sm bg-transparent border"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "#e2e8f0" }}
          />
        )}

        {selected === "delay" && (
          <div className="flex items-center gap-2 mt-2">
            <label className="text-xs text-slate-400">Delay by</label>
            <input
              type="number"
              min={1}
              max={90}
              value={delayDays}
              onChange={(e) => setDelayDays(parseInt(e.target.value) || 7)}
              className="w-16 p-1 rounded text-sm text-center bg-transparent border"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "#e2e8f0" }}
            />
            <span className="text-xs text-slate-400">days</span>
          </div>
        )}

        {selected === "redirect" && (
          <input
            type="text"
            value={redirectRecipient}
            onChange={(e) => setRedirectRecipient(e.target.value)}
            placeholder="Suggested alternative recipient..."
            className="w-full mt-2 p-2 rounded text-sm bg-transparent border"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "#e2e8f0" }}
          />
        )}

        {/* Comment (always available) */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional comment..."
          rows={2}
          className="w-full mt-2 p-2 rounded text-sm bg-transparent border"
          style={{ borderColor: "rgba(255,255,255,0.08)", color: "#e2e8f0" }}
        />

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
            style={{
              background: selected ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.05)",
              color: selected ? "#d4a853" : "#64748b",
              border: `1px solid ${selected ? "rgba(212,168,83,0.3)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {submitting ? "Submitting..." : existingVote ? "Update Vote" : "Submit Vote"}
          </button>
          {submitted && (
            <span className="text-xs flex items-center gap-1" style={{ color: "#4ade80" }}>
              <CheckCircle2 className="w-3 h-3" /> Vote recorded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
