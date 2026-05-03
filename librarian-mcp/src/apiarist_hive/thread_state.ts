/**
 * Apiarist Hive Thread-State Lifecycle — KN-D2 / BP018 Pod D
 * ============================================================
 * 4-state lifecycle: open → synthesizing → closed → sealed
 * Guarded transitions: only valid state-to-state moves permitted.
 *
 * Composes with:
 *   KN-J4 apiarist_hive_subscriber.ts (onThreadClosedWithSynthesis pattern)
 *   KN-D4 cross_frame_federation.ts (cross-frame hooks on close)
 *   KN-D5 uptime_cap.ts (50%-uptime cap per role per cycle)
 *   Pod-S Stats-Capture harness
 */

export type HiveThreadState = "open" | "synthesizing" | "closed" | "sealed";

export type BeeRole = "worker" | "drone" | "queen";

export interface BeeRoles {
  [member_id: string]: BeeRole;
}

export interface HiveThread {
  id: string;                          // LB-HIVE-NNNN serial
  topic: string;
  state: HiveThreadState;
  participants: string[];              // member IDs
  bee_role_assignments: BeeRoles;      // role per participant
  synthesis_target?: string;           // Jar ID (Pod-J KN-J1) when closed
  cross_frame_pointers?: string[];     // federation hooks (KN-D4)
  ts_opened: string;
  ts_closed?: string;
  ts_sealed?: string;
  cohort_class?: string;               // for federation eligibility (KN-D4)
}

// ─── Valid state transitions ──────────────────────────────────────────────────

export const VALID_TRANSITIONS: Record<HiveThreadState, HiveThreadState[]> = {
  open:         ["synthesizing"],
  synthesizing: ["closed"],
  closed:       ["sealed"],
  sealed:       [],  // terminal; no further transitions
};

export interface TransitionResult {
  success: boolean;
  thread?: HiveThread;
  error?: string;
  bridle_flag?: string;
}

/**
 * Attempt a state transition on a HiveThread.
 * Only valid forward transitions are allowed (backward transitions rejected).
 * Returns updated thread on success, error on failure.
 */
export function transitionState(
  thread: HiveThread,
  target: HiveThreadState
): TransitionResult {
  const allowed = VALID_TRANSITIONS[thread.state];

  if (!allowed.includes(target)) {
    return {
      success: false,
      error: `Invalid transition: ${thread.state} → ${target}. Allowed: ${allowed.join(", ") || "none (terminal state)"}`,
      bridle_flag: `HALT — invalid backward or nonsensical transition on thread ${thread.id}.`,
    };
  }

  const now = new Date().toISOString();
  const updated: HiveThread = { ...thread, state: target };

  if (target === "closed") {
    updated.ts_closed = now;
  }
  if (target === "sealed") {
    // synthesis_target must be populated before sealing
    if (!updated.synthesis_target) {
      return {
        success: false,
        error: `Thread ${thread.id} cannot be sealed without a synthesis_target (Jar ID).`,
        bridle_flag: "HALT — Jar ID required before sealing Hive thread.",
      };
    }
    updated.ts_sealed = now;
  }

  return { success: true, thread: updated };
}

/**
 * Validate bee_role_assignments:
 *   - Each participant must appear exactly once
 *   - Each role must be valid (worker / drone / queen)
 *   - There must be at most one queen
 */
export function validateRoleAssignments(
  participants: string[],
  bee_role_assignments: BeeRoles
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const member_id of participants) {
    if (!bee_role_assignments[member_id]) {
      errors.push(`Participant ${member_id} has no role assigned.`);
    } else {
      const role = bee_role_assignments[member_id];
      if (!["worker", "drone", "queen"].includes(role)) {
        errors.push(`Participant ${member_id} has invalid role: ${role}`);
      }
    }
  }

  const queens = Object.values(bee_role_assignments).filter((r) => r === "queen");
  if (queens.length > 1) {
    errors.push("At most one Queen is allowed per Hive thread.");
  }

  return { valid: errors.length === 0, errors };
}
