/**
 * MARK QUALITY AUDIT PANEL — Phase D.2 UI (K501)
 * ================================================
 * Lists pending Mark quality audits for the logged-in high-Rep auditor.
 * Shows transaction details, both members' history, deliverable evidence.
 * Verdict buttons: legitimate / inflated / disputed + notes field.
 *
 * GUARDRAIL: Verdicts are staged for curator confirmation.
 * This component does NOT directly apply consequences.
 */

import React, { useState } from "react";
import type { MarkQualityAudit, MarkAuditVerdict } from "../../lib/marks/markQualityAudit";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuditWithContext extends MarkQualityAudit {
  transaction_amount_marks: number;
  sender_username: string;
  receiver_username: string;
  sender_xp: number;
  receiver_xp: number;
  deliverable_description: string | null;
}

interface MarkQualityAuditPanelProps {
  audits: AuditWithContext[];
  onSubmitVerdict: (
    auditId: string,
    verdict: Exclude<MarkAuditVerdict, "pending">,
    notes: string,
  ) => Promise<void>;
  isSubmitting?: boolean;
}

// ── Verdict badge ─────────────────────────────────────────────────────────────

function VerdictBadge({ verdict }: { verdict: MarkAuditVerdict }) {
  const styles: Record<MarkAuditVerdict, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    legitimate: "bg-green-100 text-green-800 border-green-300",
    inflated: "bg-red-100 text-red-800 border-red-300",
    disputed: "bg-orange-100 text-orange-800 border-orange-300",
  };
  const labels: Record<MarkAuditVerdict, string> = {
    pending: "Pending Review",
    legitimate: "Legitimate",
    inflated: "Inflated",
    disputed: "Disputed",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[verdict]}`}>
      {labels[verdict]}
    </span>
  );
}

// ── Single audit card ─────────────────────────────────────────────────────────

function AuditCard({
  audit,
  onSubmitVerdict,
  isSubmitting,
}: {
  audit: AuditWithContext;
  onSubmitVerdict: MarkQualityAuditPanelProps["onSubmitVerdict"];
  isSubmitting: boolean;
}) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleVerdict(verdict: Exclude<MarkAuditVerdict, "pending">) {
    setSubmitting(true);
    try {
      await onSubmitVerdict(audit.id, verdict, notes);
    } finally {
      setSubmitting(false);
    }
  }

  const assignedAt = new Date(audit.assigned_at);
  const daysAssigned = Math.floor((Date.now() - assignedAt.getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysAssigned >= 5;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Audit #{audit.id.slice(0, 8)}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Assigned {daysAssigned === 0 ? "today" : `${daysAssigned}d ago`}
            {isUrgent && (
              <span className="ml-2 text-red-600 font-medium">⚠ Expires soon</span>
            )}
          </p>
        </div>
        <VerdictBadge verdict={audit.verdict} />
      </div>

      {/* Transaction details */}
      <div className="bg-gray-50 rounded-md p-3 space-y-2">
        <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">Transaction</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-gray-500">Amount</span>
          <span className="font-semibold text-gray-900">{audit.transaction_amount_marks} Marks</span>
          <span className="text-gray-500">Sender</span>
          <span className="text-gray-900">{audit.sender_username} <span className="text-gray-400">({audit.sender_xp} XP)</span></span>
          <span className="text-gray-500">Receiver</span>
          <span className="text-gray-900">{audit.receiver_username} <span className="text-gray-400">({audit.receiver_xp} XP)</span></span>
        </div>
        {audit.deliverable_description && (
          <div className="mt-2">
            <span className="text-xs text-gray-500">Deliverable: </span>
            <span className="text-xs text-gray-800">{audit.deliverable_description}</span>
          </div>
        )}
      </div>

      {/* Notes field */}
      {audit.verdict === "pending" && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Audit notes (optional but helpful for disputed verdicts)
            </label>
            <textarea
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe any patterns, context, or reasoning…"
              disabled={submitting || isSubmitting}
            />
          </div>

          {/* Verdict buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleVerdict("legitimate")}
              disabled={submitting || isSubmitting}
              className="flex-1 min-w-[120px] px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ✓ Legitimate
            </button>
            <button
              onClick={() => handleVerdict("inflated")}
              disabled={submitting || isSubmitting}
              className="flex-1 min-w-[120px] px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ✗ Inflated
            </button>
            <button
              onClick={() => handleVerdict("disputed")}
              disabled={submitting || isSubmitting}
              className="flex-1 min-w-[120px] px-4 py-2 text-sm font-medium rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ? Disputed
            </button>
          </div>

          <p className="text-xs text-gray-400">
            Verdicts are staged for curator confirmation. Consequences are not applied automatically.
          </p>
        </>
      )}

      {/* Closed audit summary */}
      {audit.verdict !== "pending" && audit.notes && (
        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-xs text-gray-500">Auditor notes:</p>
          <p className="text-sm text-gray-800 mt-1">{audit.notes}</p>
        </div>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function MarkQualityAuditPanel({
  audits,
  onSubmitVerdict,
  isSubmitting = false,
}: MarkQualityAuditPanelProps) {
  const pending = audits.filter((a) => a.verdict === "pending");
  const completed = audits.filter((a) => a.verdict !== "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Mark Quality Audit Panel</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Review randomly-sampled Mark transactions for potential inflation.
            All verdicts are reviewed by a curator before consequences apply.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">{pending.length}</p>
          <p className="text-xs text-gray-500">pending review</p>
        </div>
      </div>

      {pending.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-sm text-gray-500">No pending audits. Check back later.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Pending ({pending.length})</h3>
          {pending.map((audit) => (
            <AuditCard
              key={audit.id}
              audit={audit}
              onSubmitVerdict={onSubmitVerdict}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Completed ({completed.length})</h3>
          {completed.map((audit) => (
            <AuditCard
              key={audit.id}
              audit={audit}
              onSubmitVerdict={onSubmitVerdict}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
