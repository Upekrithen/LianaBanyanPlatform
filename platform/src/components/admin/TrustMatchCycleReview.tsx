/**
 * TRUST MATCH CYCLE REVIEW UI — Phase E.3 (K501)
 * ================================================
 * Curator-facing page at /admin/trust_match_cycles.
 * Lists detected closed cycles with members + total stake + recency.
 *
 * Curator verdicts:
 *   - legitimate_collaboration: no action (verified project contributors)
 *   - under_investigation: continued monitoring
 *   - coordinated_ring: consequences staged (Founder confirms before applying)
 *
 * GUARDRAIL: consequences_applied is set only after Founder sign-off.
 * This component NEVER auto-applies consequences.
 */

import React, { useState } from "react";
import type {
  TrustMatchCycleAuditRow,
  CycleCuratorVerdict,
} from "../../lib/trust_match/cycleDetector";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CycleWithMemberNames extends TrustMatchCycleAuditRow {
  member_names: string[];   // display names resolved from member_ids
}

interface TrustMatchCycleReviewProps {
  cycles: CycleWithMemberNames[];
  onSubmitVerdict: (
    cycleId: string,
    verdict: Exclude<CycleCuratorVerdict, "pending">,
    notes: string,
  ) => Promise<void>;
  isSubmitting?: boolean;
}

// ── Verdict badge ─────────────────────────────────────────────────────────────

function CycleVerdictBadge({ verdict }: { verdict: CycleCuratorVerdict }) {
  const styles: Record<CycleCuratorVerdict, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    legitimate_collaboration: "bg-green-100 text-green-800 border-green-300",
    under_investigation: "bg-blue-100 text-blue-800 border-blue-300",
    coordinated_ring: "bg-red-100 text-red-800 border-red-300",
  };
  const labels: Record<CycleCuratorVerdict, string> = {
    pending: "Pending Review",
    legitimate_collaboration: "Legitimate Collaboration",
    under_investigation: "Under Investigation",
    coordinated_ring: "Coordinated Ring",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[verdict]}`}>
      {labels[verdict]}
    </span>
  );
}

// ── Cycle length indicator ────────────────────────────────────────────────────

function CycleLengthPip({ length }: { length: number }) {
  const colors = { 3: "bg-orange-500", 4: "bg-red-500", 5: "bg-red-700" };
  const color = colors[length as 3 | 4 | 5] ?? "bg-gray-500";
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold ${color}`}>
      {length}
    </span>
  );
}

// ── Single cycle card ─────────────────────────────────────────────────────────

function CycleCard({
  cycle,
  onSubmitVerdict,
  isSubmitting,
}: {
  cycle: CycleWithMemberNames;
  onSubmitVerdict: TrustMatchCycleReviewProps["onSubmitVerdict"];
  isSubmitting: boolean;
}) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleVerdict(verdict: Exclude<CycleCuratorVerdict, "pending">) {
    setSubmitting(true);
    try {
      await onSubmitVerdict(cycle.id, verdict, notes);
    } finally {
      setSubmitting(false);
    }
  }

  const firstDetected = new Date(cycle.first_detected_at);
  const daysSinceDetection = Math.floor(
    (Date.now() - firstDetected.getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CycleLengthPip length={cycle.cycle_length} />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {cycle.cycle_length}-Member Ring
            </h3>
            <p className="text-xs text-gray-500">
              First detected {daysSinceDetection === 0 ? "today" : `${daysSinceDetection}d ago`}
              {" · "}Last seen {new Date(cycle.last_seen_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <CycleVerdictBadge verdict={cycle.curator_verdict} />
      </div>

      {/* Members + stake */}
      <div className="bg-gray-50 rounded-md p-3 space-y-2">
        <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">Members in cycle</h4>
        <div className="flex flex-wrap gap-2">
          {cycle.member_names.map((name, i) => (
            <span
              key={cycle.cycle_member_ids[i]}
              className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-800 font-medium"
            >
              {name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm mt-2">
          <span className="text-gray-500">Total staked:</span>
          <span className="font-semibold text-gray-900">{cycle.total_stake_marks.toLocaleString()} Marks</span>
        </div>
      </div>

      {/* Prior curator notes */}
      {cycle.curator_notes && (
        <div className="bg-blue-50 rounded-md p-3">
          <p className="text-xs text-gray-500">Curator notes:</p>
          <p className="text-sm text-gray-800 mt-0.5">{cycle.curator_notes}</p>
        </div>
      )}

      {/* Verdict controls (only for pending) */}
      {cycle.curator_verdict === "pending" && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context for this verdict…"
              disabled={submitting || isSubmitting}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleVerdict("legitimate_collaboration")}
              disabled={submitting || isSubmitting}
              className="flex-1 min-w-[140px] px-3 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ✓ Legitimate Collaboration
            </button>
            <button
              onClick={() => handleVerdict("under_investigation")}
              disabled={submitting || isSubmitting}
              className="flex-1 min-w-[140px] px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🔍 Under Investigation
            </button>
            <button
              onClick={() => handleVerdict("coordinated_ring")}
              disabled={submitting || isSubmitting}
              className="flex-1 min-w-[140px] px-3 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ✗ Coordinated Ring
            </button>
          </div>
          <p className="text-xs text-gray-400">
            "Coordinated ring" consequences are staged for Founder confirmation before applying.
          </p>
        </>
      )}
    </div>
  );
}

// ── Main review page ──────────────────────────────────────────────────────────

export function TrustMatchCycleReview({
  cycles,
  onSubmitVerdict,
  isSubmitting = false,
}: TrustMatchCycleReviewProps) {
  const pending = cycles.filter((c) => c.curator_verdict === "pending");
  const reviewed = cycles.filter((c) => c.curator_verdict !== "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Trust Match Cycle Review</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Closed cycles (3–5 members) detected in the Trust Match bond graph.
            All consequences require curator verdict + Founder confirmation.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-red-600">{pending.length}</p>
          <p className="text-xs text-gray-500">pending review</p>
        </div>
      </div>

      {pending.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-sm text-gray-500">No pending cycle reviews. Graph is clean.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Pending ({pending.length})</h3>
          {pending.map((cycle) => (
            <CycleCard
              key={cycle.id}
              cycle={cycle}
              onSubmitVerdict={onSubmitVerdict}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}

      {reviewed.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Reviewed ({reviewed.length})</h3>
          {reviewed.map((cycle) => (
            <CycleCard
              key={cycle.id}
              cycle={cycle}
              onSubmitVerdict={onSubmitVerdict}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
