/**
 * CueCardVestingStatus — Compact Pied Piper tier-display widget (KN103/BP016)
 * Displays in LB Frame header. Shows librarian mode + vesting state at a glance.
 * Per feedback_no_human_characters.md: uses LB animal/insect mascot framing.
 */

import React from "react";

export type CueCardVestingState = "inactive" | "active" | "expiring_warning" | "expired";
export type LibrarianMode = "brittle" | "fluid";
export type CohortClass =
  | "lone_wolf"
  | "pied_piper_tier_1"
  | "pied_piper_tier_2_plus"
  | "federation_member"
  | "excalibur_class_subscriber";

export interface CueCardVestingStatusProps {
  cohortClass: CohortClass;
  librarianMode: LibrarianMode;
  vestingState?: CueCardVestingState;
  activeCueCardCount?: number;
  hoursUntilExpiry?: number | null;
  /** Compact mode hides the label text — icon only */
  compact?: boolean;
}

const COHORT_LABELS: Record<CohortClass, string> = {
  lone_wolf: "Lone Wolf",
  pied_piper_tier_1: "Pied Piper",
  pied_piper_tier_2_plus: "Pied Piper+",
  federation_member: "Federation",
  excalibur_class_subscriber: "Excalibur",
};

const MODE_COLORS: Record<LibrarianMode, string> = {
  brittle: "text-amber-600 bg-amber-50 border-amber-200",
  fluid: "text-emerald-700 bg-emerald-50 border-emerald-200",
};

const STATE_DOT_COLORS: Record<CueCardVestingState, string> = {
  inactive: "bg-gray-400",
  active: "bg-emerald-500",
  expiring_warning: "bg-amber-400 animate-pulse",
  expired: "bg-red-400",
};

export function CueCardVestingStatus({
  cohortClass,
  librarianMode,
  vestingState = "inactive",
  activeCueCardCount = 0,
  hoursUntilExpiry,
  compact = false,
}: CueCardVestingStatusProps) {
  const modeColorClass = MODE_COLORS[librarianMode];
  const dotColorClass = STATE_DOT_COLORS[vestingState];
  const label = COHORT_LABELS[cohortClass];
  const modeLabel = librarianMode === "fluid" ? "Fluid" : "Brittle";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium ${modeColorClass}`}
      title={`Librarian: ${modeLabel} | Cohort: ${label}${activeCueCardCount > 0 ? ` | ${activeCueCardCount} active Cue Card(s)` : ""}`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColorClass}`} />
      {!compact && (
        <>
          <span>{label}</span>
          <span className="opacity-60">·</span>
          <span>{modeLabel}</span>
          {cohortClass.startsWith("pied_piper") && activeCueCardCount > 0 && hoursUntilExpiry != null && (
            <>
              <span className="opacity-60">·</span>
              <span className="tabular-nums">
                {hoursUntilExpiry < 24
                  ? `${Math.floor(hoursUntilExpiry)}h left`
                  : `${Math.floor(hoursUntilExpiry / 24)}d left`}
              </span>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default CueCardVestingStatus;
