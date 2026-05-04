/**
 * Bushel 9 — Crown Letter Wave 1 Dispatch Coordination (BP021)
 * Phase B: Dispatch-readiness checker
 *
 * For each letter in the cohort, verifies:
 *   1. Bishop scaffold drafted
 *   2. Founder prose-pass complete
 *   3. Glass Door Open Outreach #2327 stub URL exists
 *   4. Pedestal Forum URL for paired paper
 *
 * Gates G1-G6 evaluation logic also lives here.
 *
 * Authored BP021 turn 95 by Knight (Cursor / Sonnet 4.6) — Bushel 9 Phase B.
 */

import {
  WAVE_1_COHORT,
  WaveOneLetter,
  getCohortStats,
  getPedestalForumPriorityLetters,
  getLettersBySubWave,
} from "./wave_1_cohort_manifest.js";

// ---------------------------------------------------------------------------
// Readiness check types
// ---------------------------------------------------------------------------

export interface LetterReadinessCheck {
  id: number;
  recipientName: string;
  canonicalHandle: string;
  cohortClass: string;
  subWave: string;

  /** Check 1: Bishop scaffold at any state beyond "missing" */
  scaffoldDrafted: boolean;
  scaffoldState: string;

  /** Check 2: Founder prose-pass complete (founder_prose_done or dispatched) */
  founderProseDone: boolean;
  prosePassState: string;

  /** Check 3: Glass Door Open Outreach #2327 stub URL reserved or published */
  glassDoorStubExists: boolean;
  glassDoorState: string;

  /** Check 4: Primary Pedestal Forum URL stub generated */
  pedestalForumUrlStubExists: boolean;
  pedestalForumUrlStub: string;

  /** Check 5: Secondary Pedestal Forum URL stub (if applicable) */
  pedestalForumSecondaryUrlStubExists?: boolean;
  pedestalForumSecondaryUrlStub?: string;

  /** Check 6: Crewman #6 boilerplate paragraph generated (Phase C) */
  crewman6BoilerplateReady: boolean;

  /** Check 7: Primary Pedestal Forum boilerplate generated (Phase C) */
  pedestalForumBoilerplateReady: boolean;

  /**
   * Fully dispatch-ready = checks 1+2+3+4+6+7 all pass.
   * Check 5 (secondary pedestal) only gates recipients with a secondary pairing.
   */
  fullyDispatchReady: boolean;

  /** Blocking gaps — human-readable list of what remains */
  blockingGaps: string[];
}

export interface CohortReadinessSummary {
  totalLetters: number;
  fullyReady: number;
  scaffoldMissing: number;
  awaitingFounderProse: number;
  glassDoorNotStaged: number;
  crewman6Missing: number;
  pedestalForumBoilerplateMissing: number;
  letters: LetterReadinessCheck[];
  verificationGates: VerificationGateReport;
}

// ---------------------------------------------------------------------------
// Verification gates G1-G6
// ---------------------------------------------------------------------------

export interface VerificationGateReport {
  /** G1: 30 letter records in manifest (cohort coverage) */
  G1_cohortCoverage: { pass: boolean; found: number; required: number };

  /**
   * G2: Pedestal Forum URL stub per paper-pairing.
   * Every letter has at least one pedestalForumUrlStub.
   */
  G2_pedestalForumStubs: { pass: boolean; covered: number; total: number };

  /**
   * G3: Crewman #6 + Pedestal Forum boilerplate paragraphs generated.
   * Phase C outputs; will be false until Phase C runs.
   */
  G3_boilerplatesGenerated: { pass: boolean; crewman6Ready: number; pedestalForumReady: number; total: number };

  /**
   * G4: Trebor Scholz Crown Letter Bishop scaffold authored.
   * Special-case gate: scaffold must exist for trebor_scholz specifically.
   */
  G4_treborScholzScaffold: { pass: boolean; scaffoldState: string };

  /**
   * G5: Glass Door Open Outreach #2327 mechanism wired.
   * All letters must have at minimum a stub_reserved glassDoorState.
   */
  G5_glassDoorMechanism: { pass: boolean; wired: number; total: number };

  /**
   * G6: Codex draft reserved (binds at fire-time when letters dispatch).
   * Checked externally against BISHOP_DROPZONE/14_CanonicalReferences/.
   */
  G6_codexDraftReserved: { pass: boolean; note: string };

  /** Overall gate — all G1-G6 pass */
  allGatesGreen: boolean;
}

// ---------------------------------------------------------------------------
// Core checker
// ---------------------------------------------------------------------------

export function checkLetterReadiness(letter: WaveOneLetter): LetterReadinessCheck {
  const blockingGaps: string[] = [];

  const scaffoldDrafted = letter.scaffoldState !== "missing";
  if (!scaffoldDrafted) {
    blockingGaps.push(`scaffold: missing — Bishop scaffold not yet drafted`);
  }

  const founderProseDone =
    letter.prosePassState === "founder_prose_done" ||
    letter.prosePassState === "dispatched";
  if (!founderProseDone) {
    blockingGaps.push(
      `founder-prose: ${letter.prosePassState} — Founder prose-pass not complete (fires at fire-time per BP020 Fire Code)`
    );
  }

  const glassDoorStubExists =
    letter.glassDoorState === "stub_reserved" ||
    letter.glassDoorState === "published";
  if (!glassDoorStubExists) {
    blockingGaps.push(
      `glass-door: not_staged — Glass Door Open Outreach #2327 stub URL not yet reserved for Cephas publication`
    );
  }

  // Pedestal Forum primary stub is always present (generated from makeInvitation())
  const pedestalForumUrlStubExists =
    !!letter.pedestalForumPrimary.pedestalForumUrlStub;

  const pedestalForumSecondaryUrlStubExists = letter.pedestalForumSecondary
    ? !!letter.pedestalForumSecondary.pedestalForumUrlStub
    : undefined;

  const crewman6BoilerplateReady = letter.crewman6BoilerplateGenerated;
  if (!crewman6BoilerplateReady) {
    blockingGaps.push(
      `crewman-6: boilerplate paragraph not yet generated (Phase C)`
    );
  }

  const pedestalForumBoilerplateReady =
    letter.pedestalForumPrimary.boilerplateGenerated &&
    (letter.pedestalForumSecondary
      ? letter.pedestalForumSecondary.boilerplateGenerated
      : true);
  if (!pedestalForumBoilerplateReady) {
    blockingGaps.push(
      `pedestal-forum: boilerplate paragraph not yet generated (Phase C)`
    );
  }

  const fullyDispatchReady =
    scaffoldDrafted &&
    founderProseDone &&
    glassDoorStubExists &&
    pedestalForumUrlStubExists &&
    crewman6BoilerplateReady &&
    pedestalForumBoilerplateReady;

  return {
    id: letter.id,
    recipientName: letter.recipientName,
    canonicalHandle: letter.canonicalHandle,
    cohortClass: letter.cohortClass,
    subWave: letter.subWave,
    scaffoldDrafted,
    scaffoldState: letter.scaffoldState,
    founderProseDone,
    prosePassState: letter.prosePassState,
    glassDoorStubExists,
    glassDoorState: letter.glassDoorState,
    pedestalForumUrlStubExists,
    pedestalForumUrlStub: letter.pedestalForumPrimary.pedestalForumUrlStub,
    ...(letter.pedestalForumSecondary
      ? {
          pedestalForumSecondaryUrlStubExists,
          pedestalForumSecondaryUrlStub:
            letter.pedestalForumSecondary.pedestalForumUrlStub,
        }
      : {}),
    crewman6BoilerplateReady,
    pedestalForumBoilerplateReady,
    fullyDispatchReady,
    blockingGaps,
  };
}

// ---------------------------------------------------------------------------
// G1-G6 verification gates
// ---------------------------------------------------------------------------

function evaluateGates(checks: LetterReadinessCheck[]): VerificationGateReport {
  const G1_required = 30;
  const G1_found = WAVE_1_COHORT.length;
  const G1 = { pass: G1_found >= G1_required, found: G1_found, required: G1_required };

  const G2_covered = checks.filter((c) => c.pedestalForumUrlStubExists).length;
  const G2 = { pass: G2_covered === checks.length, covered: G2_covered, total: checks.length };

  const G3_crewman6 = checks.filter((c) => c.crewman6BoilerplateReady).length;
  const G3_pedestal = checks.filter((c) => c.pedestalForumBoilerplateReady).length;
  const G3 = {
    pass: G3_crewman6 === checks.length && G3_pedestal === checks.length,
    crewman6Ready: G3_crewman6,
    pedestalForumReady: G3_pedestal,
    total: checks.length,
  };

  const treborScholz = WAVE_1_COHORT.find(
    (l) => l.canonicalHandle === "trebor_scholz"
  );
  const G4_state = treborScholz?.scaffoldState ?? "missing";
  const G4 = {
    pass: G4_state !== "missing",
    scaffoldState: G4_state,
  };

  const G5_wired = checks.filter((c) => c.glassDoorStubExists).length;
  const G5 = { pass: G5_wired === checks.length, wired: G5_wired, total: checks.length };

  // G6 is checked externally by verifying the Codex draft file exists in BISHOP_DROPZONE/14_CanonicalReferences/
  const G6 = {
    pass: false, // updated to true at commit time when Codex draft is written
    note: "Codex draft reserved at Phase E commit time — will bind to actual dispatch fire-time",
  };

  const allGatesGreen =
    G1.pass && G2.pass && G3.pass && G4.pass && G5.pass && G6.pass;

  return { G1_cohortCoverage: G1, G2_pedestalForumStubs: G2, G3_boilerplatesGenerated: G3, G4_treborScholzScaffold: G4, G5_glassDoorMechanism: G5, G6_codexDraftReserved: G6, allGatesGreen };
}

// ---------------------------------------------------------------------------
// Full cohort readiness report
// ---------------------------------------------------------------------------

export function generateCohortReadinessReport(): CohortReadinessSummary {
  const checks = WAVE_1_COHORT.map(checkLetterReadiness);

  return {
    totalLetters: checks.length,
    fullyReady: checks.filter((c) => c.fullyDispatchReady).length,
    scaffoldMissing: checks.filter((c) => !c.scaffoldDrafted).length,
    awaitingFounderProse: checks.filter((c) => !c.founderProseDone).length,
    glassDoorNotStaged: checks.filter((c) => !c.glassDoorStubExists).length,
    crewman6Missing: checks.filter((c) => !c.crewman6BoilerplateReady).length,
    pedestalForumBoilerplateMissing: checks.filter(
      (c) => !c.pedestalForumBoilerplateReady
    ).length,
    letters: checks,
    verificationGates: evaluateGates(checks),
  };
}

// ---------------------------------------------------------------------------
// Sub-wave readiness helpers
// ---------------------------------------------------------------------------

export function getSubWaveReadiness(subWave: "1a" | "1b" | "1c" | "1d" | "2") {
  const letters = getLettersBySubWave(subWave);
  const checks = letters.map(checkLetterReadiness);
  return {
    subWave,
    total: checks.length,
    fullyReady: checks.filter((c) => c.fullyDispatchReady).length,
    scaffoldMissing: checks.filter((c) => !c.scaffoldDrafted).length,
    letters: checks,
  };
}

export function getPedestalForumPriorityReadiness() {
  const priorityLetters = getPedestalForumPriorityLetters();
  return priorityLetters.map(checkLetterReadiness);
}

// ---------------------------------------------------------------------------
// Human-readable report formatter
// ---------------------------------------------------------------------------

export function formatReadinessReport(report: CohortReadinessSummary): string {
  const lines: string[] = [
    "# Bushel 9 — Wave 1 Dispatch Readiness Report",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Cohort Summary",
    `- Total letters: ${report.totalLetters} (22 PLOW-AHEAD + 8 WORTH-IT)`,
    `- Fully dispatch-ready: ${report.fullyReady} / ${report.totalLetters}`,
    `- Scaffold missing: ${report.scaffoldMissing}`,
    `- Awaiting Founder prose-pass: ${report.awaitingFounderProse}`,
    `- Glass Door stub not staged: ${report.glassDoorNotStaged}`,
    `- Crewman #6 boilerplate missing: ${report.crewman6Missing}`,
    `- Pedestal Forum boilerplate missing: ${report.pedestalForumBoilerplateMissing}`,
    "",
    "## Verification Gates G1-G6",
    gateRow("G1", "30-letter cohort coverage", report.verificationGates.G1_cohortCoverage.pass, `found ${report.verificationGates.G1_cohortCoverage.found} / required ${report.verificationGates.G1_cohortCoverage.required}`),
    gateRow("G2", "Pedestal Forum URL stubs", report.verificationGates.G2_pedestalForumStubs.pass, `covered ${report.verificationGates.G2_pedestalForumStubs.covered} / ${report.verificationGates.G2_pedestalForumStubs.total}`),
    gateRow("G3", "Crewman #6 + Pedestal Forum boilerplates", report.verificationGates.G3_boilerplatesGenerated.pass, `crewman6 ${report.verificationGates.G3_boilerplatesGenerated.crewman6Ready}/${report.verificationGates.G3_boilerplatesGenerated.total} | pedestal ${report.verificationGates.G3_boilerplatesGenerated.pedestalForumReady}/${report.verificationGates.G3_boilerplatesGenerated.total}`),
    gateRow("G4", "Trebor Scholz scaffold", report.verificationGates.G4_treborScholzScaffold.pass, `state: ${report.verificationGates.G4_treborScholzScaffold.scaffoldState}`),
    gateRow("G5", "Glass Door Open Outreach #2327 wired", report.verificationGates.G5_glassDoorMechanism.pass, `wired ${report.verificationGates.G5_glassDoorMechanism.wired} / ${report.verificationGates.G5_glassDoorMechanism.total}`),
    gateRow("G6", "Codex draft reserved", report.verificationGates.G6_codexDraftReserved.pass, report.verificationGates.G6_codexDraftReserved.note),
    "",
    `### Overall: ${report.verificationGates.allGatesGreen ? "✅ ALL GATES GREEN" : "⏳ GATES PENDING"}`,
    "",
    "## Per-Letter Readiness",
  ];

  for (const check of report.letters) {
    const status = check.fullyDispatchReady ? "✅ READY" : "⏳ PENDING";
    lines.push(`### [${check.id}] ${check.recipientName} (${check.cohortClass} | Sub-Wave ${check.subWave}) — ${status}`);
    if (check.blockingGaps.length > 0) {
      for (const gap of check.blockingGaps) {
        lines.push(`  - ${gap}`);
      }
    }
  }

  return lines.join("\n");
}

function gateRow(
  gate: string,
  label: string,
  pass: boolean,
  detail: string
): string {
  return `- **${gate}** ${pass ? "✅" : "⏳"} ${label}: ${detail}`;
}
