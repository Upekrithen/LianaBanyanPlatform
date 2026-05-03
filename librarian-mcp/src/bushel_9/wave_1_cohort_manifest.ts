/**
 * Bushel 9 — Crown Letter Wave 1 Dispatch Coordination (BP021)
 * Phase A: 30-letter cohort manifest
 *
 * Canonical source: B131_WAVE1_LETTER_COHORT_RECONCILIATION_POST_KEIRSEY.md
 * Pawn Keirsey returns: BISHOP_DROPZONE/02_PawnPrompts/PAWN_RETURN_KEIRSEY_RESEARCH_LETTER_RECIPIENTS_B130.md
 * Wave 1 = 22 PLOW-AHEAD + 8 WORTH-IT = 30 letters total (Sanders V02 excluded; Bill Gates BLOCKED)
 *
 * Canon anchors:
 *   - buffett_class_founder_letter_paper_canon_bp021.eblet.md
 *   - mordecai_esther_pedestal_forum_decree_composition_paper_collaboration_canon_bp021.eblet.md
 *   - founder_voice_bp021_additions_carrot_stick_crewman_6_sipping_ethereal_t.eblet.md
 *   - glass_door_canon_bp021.eblet.md — Glass Door Open Outreach #2327
 *   - B131_WAVE1_LETTER_COHORT_RECONCILIATION_POST_KEIRSEY.md
 *
 * Authored BP021 turn 95 by Knight (Cursor / Sonnet 4.6) — Bushel 9 Phase A.
 */

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export type CohortClass = "PLOW-AHEAD" | "WORTH-IT" | "BLOCKED";

/** Priority tier within the cohort (1 = highest amplification potential) */
export type DispatchPriority = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Sub-wave grouping per B131 dispatch sequence */
export type SubWave = "1a" | "1b" | "1c" | "1d" | "2";

/**
 * Prose-pass state per Founder Fire Code (BP020).
 * Bishop scaffolds; Founder writes prose at fire-time.
 */
export type ProsePassState =
  | "not_started"         // no scaffold yet
  | "scaffold_drafted"    // Bishop outline done; awaiting Founder prose-pass
  | "founder_prose_done"  // Founder has completed prose; dispatch-ready
  | "dispatched";         // letter has been sent

/** Whether the Bishop scaffold has been authored */
export type ScaffoldState = "missing" | "drafted" | "v02" | "v03" | "v04";

/** Glass Door Open Outreach #2327 publication status */
export type GlassDoorState =
  | "not_staged"          // no stub URL generated yet
  | "stub_reserved"       // URL slug reserved, not live
  | "published";          // live on Cephas under Advance Notice

/** The 12-paper Save-the-World Series identifiers */
export type PaperNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Keirsey / Pawn composite temperament signal */
export type PawnComposite =
  | "HUMBLE/GENEROUS/ALIGNED"
  | "HUMBLE/GENEROUS/STRONG_ALIGNMENT"
  | "BALANCED/FAIR/ALIGNED"
  | "BALANCED/FAIR/STRONG_ALIGNMENT"
  | "BALANCED/GENEROUS/WELCOMING"
  | "DEBATE_PRONE/GENEROUS_WITH_CREDIT"
  | "SHARP/DEBATE_PRONE/ASSERTIVE"
  | "SHARP/ARGUMENTATIVE/BRINKSMANSHIP"
  | "FLASHY/TRANSACTIONAL";

export interface PedestalForumInvitation {
  /** Paper number paired with this recipient */
  paperNumber: PaperNumber;
  /** Canonical paper title */
  paperTitle: string;
  /** Pedestal Forum URL stub (relative to lianabanyan.com) */
  pedestalForumUrlStub: string;
  /** Whether the boilerplate paragraph has been generated (Phase C) */
  boilerplateGenerated: boolean;
}

export interface WaveOneLetter {
  /** Sequential reference ID within Wave 1 cohort */
  id: number;
  /** Full recipient name */
  recipientName: string;
  /** Short canonical handle for internal file references */
  canonicalHandle: string;
  /** Pawn cohort classification post-Keirsey */
  cohortClass: CohortClass;
  /** Dispatch priority tier per B131 */
  dispatchPriority: DispatchPriority;
  /** Sub-wave grouping per B131 dispatch sequence */
  subWave: SubWave;
  /** Keirsey MBTI type (Pawn-surfaced or Bishop-estimated) */
  mbtiType: string;
  /** Pawn composite signal strength: HIGH / MEDIUM / LOW */
  pawnSignalStrength: "HIGH" | "MEDIUM" | "LOW";
  /** Pawn composite personality signal */
  pawnComposite: string;
  /** Current scaffold state */
  scaffoldState: ScaffoldState;
  /** Current prose-pass state */
  prosePassState: ProsePassState;
  /**
   * Glass Door Open Outreach #2327 state.
   * Decouples active dispatch from Cephas publication (per glass_door_canon_bp021.eblet.md).
   */
  glassDoorState: GlassDoorState;
  /** Primary Pedestal Forum invitation (one paper per letter minimum) */
  pedestalForumPrimary: PedestalForumInvitation;
  /** Optional secondary Pedestal Forum pairing (for recipients spanning two papers) */
  pedestalForumSecondary?: PedestalForumInvitation;
  /** Crewman #6 self-positioning paragraph generated (Phase C) */
  crewman6BoilerplateGenerated: boolean;
  /** Internal notes — these NEVER enter the published letter body */
  internalNotes?: string;
  /** K-session where the most recent draft was staged */
  draftSession?: string;
  /** Whether the recipient is flagged for Trebor Scholz-class Pedestal Forum priority */
  pedestalForumPriority: boolean;
}

// ---------------------------------------------------------------------------
// Paper title lookup
// ---------------------------------------------------------------------------

export const SAVE_THE_WORLD_PAPERS: Record<PaperNumber, string> = {
  1: "Universal Sustained Economic Prosperity",
  2: "DNA-Engineered AI",
  3: "Universal Abundant Low Cost Energy",
  4: "Abolishing World Hunger",
  5: "Decentralized Factory Manufacturing",
  6: "Resolving Political Conflict",
  7: "Health Care",
  8: "Engineering Conducted AI — The Substrate Orchestra in Symphony",
  9: "Universal Lifelong Learning",
  10: "Universal Cooperative Shelter",
  11: "Universal Caregiving",
  12: "Universal Earth Stewardship",
};

function makeInvitation(
  paperNumber: PaperNumber,
  boilerplateGenerated = false
): PedestalForumInvitation {
  return {
    paperNumber,
    paperTitle: SAVE_THE_WORLD_PAPERS[paperNumber],
    pedestalForumUrlStub: `/papers/${paperNumber}/pedestal-forum`,
    boilerplateGenerated,
  };
}

// ---------------------------------------------------------------------------
// Wave 1 cohort — 30 letters (22 PLOW-AHEAD + 8 WORTH-IT)
// ---------------------------------------------------------------------------

export const WAVE_1_COHORT: WaveOneLetter[] = [
  // =========================================================================
  // SUB-WAVE 1a — PLOW-AHEAD foundational allies (4 letters)
  // Highest-confidence Pawn signals + highest strategic value
  // =========================================================================

  {
    id: 1,
    recipientName: "Warren Buffett",
    canonicalHandle: "buffett",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 1,
    subWave: "1a",
    mbtiType: "ISTJ",
    pawnSignalStrength: "HIGH",
    pawnComposite: "humble / generous / gracious",
    scaffoldState: "drafted",
    prosePassState: "scaffold_drafted",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(1),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Anchor patron candidate. Buffett-class paper canon (buffett_class_founder_letter_paper_canon_bp021.eblet.md) applies. ISTJ: respect for institutional longevity + demonstrated results over claims.",
  },

  {
    id: 2,
    recipientName: "Cory Doctorow",
    canonicalHandle: "doctorow",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 1,
    subWave: "1a",
    mbtiType: "INTJ",
    pawnSignalStrength: "HIGH",
    pawnComposite: "balanced / generous / fair-critic / strong alignment",
    scaffoldState: "drafted",
    prosePassState: "scaffold_drafted",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(8),
    pedestalForumSecondary: makeInvitation(1),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: true,
    internalNotes: "Platform-coop publisher. Anti-enshittification thesis aligns directly. Paper 8 (Engineering Conducted AI) + Paper 1 pairing. Publisher → Pedestal Forum invitation is structurally tight.",
  },

  {
    id: 3,
    recipientName: "Nathan Schneider",
    canonicalHandle: "schneider",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 1,
    subWave: "1a",
    mbtiType: "INFJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "humble / generous / strong alignment",
    scaffoldState: "drafted",
    prosePassState: "scaffold_drafted",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(1),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Academic-commons authority. Cooperative economics domain — Paper 1 primary pairing. INFJ: mission-alignment framing most effective.",
  },

  {
    id: 4,
    recipientName: "Erik Brynjolfsson",
    canonicalHandle: "brynjolfsson",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 1,
    subWave: "1a",
    mbtiType: "INTJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "balanced / fair / aligned",
    scaffoldState: "v03",
    prosePassState: "scaffold_drafted",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(1),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "V03 J-Curve letter confirmed PLOW-AHEAD by Pawn (B131). J-Curve econ thesis ally. Update with K533 #2326 reproducibility pack cite per B131 post-K533 protocol.",
    draftSession: "K528",
  },

  // =========================================================================
  // SUB-WAVE 1b — PLOW-AHEAD high-amplification (4 letters)
  // =========================================================================

  {
    id: 5,
    recipientName: "Sal Khan",
    canonicalHandle: "khan",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 2,
    subWave: "1b",
    mbtiType: "ENFJ",
    pawnSignalStrength: "HIGH",
    pawnComposite: "humble / generous / aligned",
    scaffoldState: "drafted",
    prosePassState: "scaffold_drafted",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(9),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Self-discloses ENFJ. Khan Academy = living proof of cooperative-education model. Paper 9 (Universal Lifelong Learning) is the natural pairing. High amplification — ENFJ charisma propagates openly.",
  },

  {
    id: 6,
    recipientName: "MacKenzie Scott",
    canonicalHandle: "scott",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 2,
    subWave: "1b",
    mbtiType: "INFJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "humble / generous / aligned",
    scaffoldState: "drafted",
    prosePassState: "scaffold_drafted",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(1),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Philanthropic cooperative alignment. Paper 1 primary pairing. INFJ: mission-alignment + systemic-change framing. No-response-required framing especially important here.",
  },

  {
    id: 7,
    recipientName: "Trebor Scholz",
    canonicalHandle: "trebor_scholz",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 2,
    subWave: "1b",
    mbtiType: "INFJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "humble / generous / strong alignment",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(1),
    pedestalForumSecondary: makeInvitation(8),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: true,
    internalNotes: "UPGRADED B130A WORTH-IT → PLOW-AHEAD per Pawn B131. Platform Cooperativism founder. Mordecai-Esther Pedestal Forum mechanism lands directly with Trebor. Frame: 'We built the publication-class instantiation of platform cooperativism applied to publication itself. Your additions would have co-equal authority to ours.' Paper 1 + Paper 8 dual pairing. Trebor Scholz Bishop scaffold is PHASE D priority.",
  },

  {
    id: 8,
    recipientName: "Melinda French Gates",
    canonicalHandle: "melinda_gates",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 2,
    subWave: "1b",
    mbtiType: "ENFJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "balanced / generous / welcoming",
    scaffoldState: "drafted",
    prosePassState: "scaffold_drafted",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(7),
    pedestalForumSecondary: makeInvitation(9),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Paper 7 (Health Care) + Paper 9 (Lifelong Learning) pairing — Gates Foundation domains. ENFJ: generosity + welcoming. Refresh draft to cite K533 #2326 reproducibility pack.",
  },

  // =========================================================================
  // SUB-WAVE 1c — PLOW-AHEAD academic / intellectual layer (7 letters)
  // =========================================================================

  {
    id: 9,
    recipientName: "Yochai Benkler",
    canonicalHandle: "benkler",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 3,
    subWave: "1c",
    mbtiType: "INTP",
    pawnSignalStrength: "HIGH",
    pawnComposite: "humble / generous / strong alignment",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(1),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Commons-based peer production theorist. Paper 1 primary. INTP: evidence-and-mechanism framing. No-response-required framing appropriate for academic recipients.",
  },

  {
    id: 10,
    recipientName: "Howard Marks",
    canonicalHandle: "marks",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 3,
    subWave: "1c",
    mbtiType: "INTJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "balanced / fair / gracious",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(1),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Investment / economics domain. Paper 1. INTJ: systematic, evidence-based. Oaktree Capital — patient capital framing aligns with LB cooperative-build-rate.",
  },

  {
    id: 11,
    recipientName: "Kate Raworth",
    canonicalHandle: "raworth",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 3,
    subWave: "1c",
    mbtiType: "INFJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "humble / fair / strong alignment",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(1),
    pedestalForumSecondary: makeInvitation(12),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Doughnut Economics author. Paper 1 + Paper 12 (Earth Stewardship) dual pairing — doughnut model bridges economic and ecological floors/ceilings. INFJ: mission-driven systems thinker.",
  },

  {
    id: 12,
    recipientName: "Esther Perel",
    canonicalHandle: "perel",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 3,
    subWave: "1c",
    mbtiType: "ENFJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "balanced / generous / aligned",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(6),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Human relationships + conflict resolution domain. Paper 6 (Resolving Political Conflict) pairing — interpersonal conflict expertise maps to political-conflict paper. ENFJ: generous, aligned.",
  },

  {
    id: 13,
    recipientName: "Seth Godin",
    canonicalHandle: "godin",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 3,
    subWave: "1c",
    mbtiType: "ENTP",
    pawnSignalStrength: "HIGH",
    pawnComposite: "humble / generous / aligned",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(8),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Marketing / AI / tech creator-economy domain. Paper 8 (Engineering Conducted AI) pairing. ENTP self-identifies. High signal — generous with amplification. Short letter; lead with receipt.",
  },

  {
    id: 14,
    recipientName: "Douglas Rushkoff",
    canonicalHandle: "rushkoff",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 3,
    subWave: "1c",
    mbtiType: "INTP",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "balanced / fair / strong alignment",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(8),
    pedestalForumSecondary: makeInvitation(1),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Platform cooperativism + tech-critique domain. Paper 8 + Paper 1 pairing. Team Human / Survival of the Richest — anti-extraction thesis aligns directly with anti-enshittification architecture.",
  },

  {
    id: 15,
    recipientName: "Craig Newmark",
    canonicalHandle: "newmark",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 3,
    subWave: "1c",
    mbtiType: "ISTJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "humble / generous / aligned",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(1),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Funds journalism co-ops / public-interest tech. Paper 1 pairing. ISTJ: receipt-first framing. Craig Newmark Philanthropies → cooperative-commons overlap is structural.",
  },

  // =========================================================================
  // SUB-WAVE 1d — PLOW-AHEAD commentariat + cultural layer (7 letters)
  // =========================================================================

  {
    id: 16,
    recipientName: "Molly White",
    canonicalHandle: "molly_white",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 4,
    subWave: "1d",
    mbtiType: "INTJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "humble / generous",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(8),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Web3-skeptic, open-source ethos. Paper 8 (Engineering Conducted AI) pairing — her crypto-critique domain maps directly to structural-vs-hype framing. Lead with reproducibility pack.",
  },

  {
    id: 17,
    recipientName: "Hank Green",
    canonicalHandle: "hank_green",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 4,
    subWave: "1d",
    mbtiType: "ENTP",
    pawnSignalStrength: "HIGH",
    pawnComposite: "humble / generous / aligned",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(9),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Sci-vlogs + self-aware humor + creator economy. Paper 9 (Lifelong Learning) pairing. ENTP: high signal, generous with amplification. Crash Course + VidCon cooperative model resonates.",
  },

  {
    id: 18,
    recipientName: "Ai-jen Poo",
    canonicalHandle: "aijen_poo",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 4,
    subWave: "1d",
    mbtiType: "ENFJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "humble / generous / strong alignment",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(11),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "NDWA labor-organizing coalitions. Paper 11 (Universal Caregiving) is the direct pairing — domestic worker co-op advocacy maps exactly. ENFJ: welcoming, mission-driven.",
  },

  {
    id: 19,
    recipientName: "Majora Carter",
    canonicalHandle: "majora_carter",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 4,
    subWave: "1d",
    mbtiType: "ENFJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "balanced / fair / strong alignment",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(12),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Environmental justice + community development. Paper 12 (Universal Earth Stewardship) primary pairing. TED/community-building background — ENFJ welcoming, strong alignment.",
  },

  {
    id: 20,
    recipientName: "Dolly Parton",
    canonicalHandle: "dolly_parton",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 5,
    subWave: "1d",
    mbtiType: "ESFJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "humble / generous / aligned",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(9),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Dollywood Foundation + Imagination Library. Paper 9 (Lifelong Learning) pairing — 200M+ books donated, literacy mission maps directly. ESFJ: community-service orientation. Letter tone: warm + practical.",
  },

  {
    id: 21,
    recipientName: "Andrew McAfee",
    canonicalHandle: "mcafee",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 7,
    subWave: "1d",
    mbtiType: "INTJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "humble / fair",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(8),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "MIT collabs. Paper 8 (Engineering Conducted AI) pairing — AI + productivity domain. INTJ: evidence-first. More-from-Less framing resonates with Cost+20% model.",
  },

  {
    id: 22,
    recipientName: "Ethan Mollick",
    canonicalHandle: "mollick",
    cohortClass: "PLOW-AHEAD",
    dispatchPriority: 7,
    subWave: "1d",
    mbtiType: "ENTP",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "humble / generous / aligned",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(8),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Open AI experimentation + Wharton. Paper 8 pairing. ENTP: enthusiastic about novelty. Co-Intelligence framing — K533 reproducibility pack lead-in is natural hook.",
  },

  // =========================================================================
  // SUB-WAVE 2 — WORTH-IT measured-posture (8 letters)
  // After WORTH-IT template lands; receipt-first + no-response-required framing
  // =========================================================================

  {
    id: 23,
    recipientName: "Daron Acemoglu",
    canonicalHandle: "acemoglu",
    cohortClass: "WORTH-IT",
    dispatchPriority: 3,
    subWave: "2",
    mbtiType: "INTJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "debates rigorously but credits collaborators",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(1),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Rigorous debater; credits collaborators. Paper 1 (Economics) pairing. WORTH-IT template: receipt-first + no-endorsement framing. Power and Progress thesis overlap with governance architecture.",
  },

  {
    id: 24,
    recipientName: "Mariana Mazzucato",
    canonicalHandle: "mazzucato",
    cohortClass: "WORTH-IT",
    dispatchPriority: 3,
    subWave: "2",
    mbtiType: "ENTJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "sharp / debate-prone / assertive influence",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(1),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Mission-economy / state-innovation domain. Paper 1 pairing. ENTJ: debate-prone but assertive influence. WORTH-IT template: frame as structural peer review of mission-economy thesis, not endorsement ask.",
  },

  {
    id: 25,
    recipientName: "Anand Giridharadas",
    canonicalHandle: "giridharadas",
    cohortClass: "WORTH-IT",
    dispatchPriority: 3,
    subWave: "2",
    mbtiType: "ENFJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "sharp / debate-prone / amplifies voices",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(6),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Win-Win author / elites critique. Paper 6 (Resolving Political Conflict) pairing. ENFJ: amplifies voices despite sharp posture. WORTH-IT framing: 'We built the anti-elite-capture mechanism structurally — here's the receipt.'",
  },

  {
    id: 26,
    recipientName: "Ezra Klein",
    canonicalHandle: "ezra_klein",
    cohortClass: "WORTH-IT",
    dispatchPriority: 4,
    subWave: "2",
    mbtiType: "INTP",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "argumentative but guests return",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(6),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "NYT / Vox policy journalism. Paper 6 pairing. INTP: argument-driven but principled. WORTH-IT template: lead with the methodology receipt; invite verification — not position endorsement.",
  },

  {
    id: 27,
    recipientName: "Nilay Patel",
    canonicalHandle: "nilay_patel",
    cohortClass: "WORTH-IT",
    dispatchPriority: 4,
    subWave: "2",
    mbtiType: "ENTP",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "debate-prone / dynamic engagement",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(8),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "The Verge / tech journalism. Paper 8 pairing. ENTP: debate-prone, dynamic engagement. WORTH-IT template: short, receipt-first. Reproducibility pack is the hook — journalists verify.",
  },

  {
    id: 28,
    recipientName: "Simon Sinek",
    canonicalHandle: "simon_sinek",
    cohortClass: "WORTH-IT",
    dispatchPriority: 5,
    subWave: "2",
    mbtiType: "ENFJ",
    pawnSignalStrength: "HIGH",
    pawnComposite: "flashy / spotlight / motivates teams",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(6),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Start With Why / leadership domain. Paper 6 pairing. ENFJ: flashy/spotlight-hoarding tendency — WORTH-IT template: Crewman #6 self-positioning anchors the ask, explicit no-spotlight-transfer framing.",
  },

  {
    id: 29,
    recipientName: "Pitbull",
    canonicalHandle: "pitbull",
    cohortClass: "WORTH-IT",
    dispatchPriority: 5,
    subWave: "2",
    mbtiType: "ESFP",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "flashy / transactional / prolific collabs",
    scaffoldState: "missing",
    prosePassState: "not_started",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(6),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "Civic-cultural unity + collabs. Paper 6 (Political Conflict) pairing — Miami / multicultural unity narrative. ESFP: flashy/transactional. WORTH-IT: short letter, concrete, no ideology ask.",
  },

  {
    id: 30,
    recipientName: "Alexandria Ocasio-Cortez",
    canonicalHandle: "aoc",
    cohortClass: "WORTH-IT",
    dispatchPriority: 6,
    subWave: "2",
    mbtiType: "ENFJ",
    pawnSignalStrength: "MEDIUM",
    pawnComposite: "debate-prone / fiery / generous-with-credit / squad-building",
    scaffoldState: "v02",
    prosePassState: "scaffold_drafted",
    glassDoorState: "not_staged",
    pedestalForumPrimary: makeInvitation(6),
    crewman6BoilerplateGenerated: false,
    pedestalForumPriority: false,
    internalNotes: "DOWNGRADED B130A V02 PLOW-AHEAD → WORTH-IT per Pawn B131. Debate-prone but welcoming and generous with credit. Maine Third-Path V02 kept with measured-posture reframing per B131: (1) lead with receipt not invitation, (2) drop shared-political-cause phrasing, (3) explicit no-response-required. Sanders reaches AOC via indirect channel after AOC letter fires.",
    draftSession: "K528",
  },
];

// ---------------------------------------------------------------------------
// Cohort summary helpers
// ---------------------------------------------------------------------------

export function getPlowAheadLetters(): WaveOneLetter[] {
  return WAVE_1_COHORT.filter((l) => l.cohortClass === "PLOW-AHEAD");
}

export function getWorthItLetters(): WaveOneLetter[] {
  return WAVE_1_COHORT.filter((l) => l.cohortClass === "WORTH-IT");
}

export function getLettersBySubWave(subWave: SubWave): WaveOneLetter[] {
  return WAVE_1_COHORT.filter((l) => l.subWave === subWave);
}

export function getPedestalForumPriorityLetters(): WaveOneLetter[] {
  return WAVE_1_COHORT.filter((l) => l.pedestalForumPriority);
}

export function getCohortStats() {
  const plowAhead = getPlowAheadLetters();
  const worthIt = getWorthItLetters();
  return {
    total: WAVE_1_COHORT.length,
    plowAhead: plowAhead.length,
    worthIt: worthIt.length,
    scaffoldDrafted: WAVE_1_COHORT.filter(
      (l) => l.scaffoldState !== "missing"
    ).length,
    awaitingScaffold: WAVE_1_COHORT.filter(
      (l) => l.scaffoldState === "missing"
    ).length,
    founderProseReady: WAVE_1_COHORT.filter(
      (l) => l.prosePassState === "founder_prose_done"
    ).length,
    dispatched: WAVE_1_COHORT.filter(
      (l) => l.prosePassState === "dispatched"
    ).length,
    pedestalForumPriority: getPedestalForumPriorityLetters().length,
    subWave1a: getLettersBySubWave("1a").length,
    subWave1b: getLettersBySubWave("1b").length,
    subWave1c: getLettersBySubWave("1c").length,
    subWave1d: getLettersBySubWave("1d").length,
    subWave2: getLettersBySubWave("2").length,
  };
}
