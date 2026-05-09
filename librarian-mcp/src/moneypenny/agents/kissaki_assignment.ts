/**
 * MoneyPenny Kissaki Guild Assignment (§7 / LB-STACK-0167, Bushel 82, BP034)
 * Maps MoneyPenny roles to Kissaki rank and substrate AI.
 */

import type { CallerClass, KissakiRank, KissakiAssignment } from "../types.js";

export type MoneyPennyRole =
  | "inbound_triage"
  | "substantive_engager_b_tier"
  | "substantive_engager_a_tier"
  | "mcci_compressor"
  | "resurrection_synthesizer"
  | "founder_transition_author"
  | "edge_case_escalator"
  ;

const ROLE_TO_ASSIGNMENT: Record<MoneyPennyRole, KissakiAssignment> = {
  inbound_triage: {
    rank: "APPRENTICE",
    role: "Inbound triage — fast classification",
    substrate_ai: "claude-sonnet-4-6",
    context_depth: "fast_classify",
  },
  substantive_engager_b_tier: {
    rank: "JOURNEYMAN",
    role: "Substantive Engager (B-tier hold)",
    substrate_ai: "claude-sonnet-4-6",
    context_depth: "full_canon",
  },
  substantive_engager_a_tier: {
    rank: "MASTER",
    role: "Substantive Engager (A-tier holdover)",
    substrate_ai: "claude-opus-4-7",
    context_depth: "deep_synthesis",
  },
  mcci_compressor: {
    rank: "APPRENTICE",
    role: "MCCI Context Compressor (volume)",
    substrate_ai: "claude-sonnet-4-6",
    context_depth: "fast_classify",
  },
  resurrection_synthesizer: {
    rank: "JOURNEYMAN",
    role: "Thread resurrection synthesizer",
    substrate_ai: "claude-sonnet-4-6",
    context_depth: "full_canon",
  },
  founder_transition_author: {
    rank: "MASTER",
    role: "Founder transition packet author",
    substrate_ai: "claude-opus-4-7",
    context_depth: "deep_synthesis",
  },
  edge_case_escalator: {
    rank: "KISSAKI",
    role: "Edge-case escalation — Founder direct",
    substrate_ai: "founder-direct",
    context_depth: "founder_direct",
  },
};

export function getAssignment(role: MoneyPennyRole): KissakiAssignment {
  return ROLE_TO_ASSIGNMENT[role];
}

export function getKissakiAssignment(role: MoneyPennyRole): KissakiAssignment {
  return ROLE_TO_ASSIGNMENT[role];
}

export function engagerRoleForCallerClass(callerClass: CallerClass): MoneyPennyRole {
  switch (callerClass) {
    case "WARREN_BUFFETT":
    case "FAMILY":
      return "edge_case_escalator";
    case "MACKENZIE_SCOTT":
    case "COUNSEL":
      return "substantive_engager_a_tier";
    case "PRESS":
    case "TALENTS_PRACTITIONER":
    case "UNKNOWN":
    case "INTERNAL_AI":
      return "substantive_engager_b_tier";
  }
}

export function getEngagerAssignment(callerClass: CallerClass): KissakiAssignment {
  return getAssignment(engagerRoleForCallerClass(callerClass));
}

export function listAllAssignments(): Array<KissakiAssignment & { mp_role: MoneyPennyRole }> {
  return (Object.entries(ROLE_TO_ASSIGNMENT) as Array<[MoneyPennyRole, KissakiAssignment]>).map(
    ([mp_role, assignment]) => ({ ...assignment, mp_role }),
  );
}
