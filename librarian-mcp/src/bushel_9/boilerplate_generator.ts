/**
 * Bushel 9 — Crown Letter Wave 1 Dispatch Coordination (BP021)
 * Phase C: Pedestal Forum + Crewman #6 boilerplate generator
 *
 * For each letter in the cohort, generates:
 *   1. Crewman #6 self-positioning paragraph (per founder_voice canon)
 *   2. Pedestal Forum invitation paragraph (per Mordecai-Esther Pedestal Forum canon)
 *
 * Canon sources:
 *   - founder_voice_bp021_additions_carrot_stick_crewman_6_sipping_ethereal_t.eblet.md
 *   - mordecai_esther_pedestal_forum_decree_composition_paper_collaboration_canon_bp021.eblet.md
 *   - pedestal_forum_section_11_boilerplate_for_all_save_the_world_papers_canon_bp021.eblet.md
 *
 * Output is formatted for Founder fire-time prose-pass.
 * Bishop scaffolds; Founder writes the actual prose. These are structural templates
 * that Founder replaces / rewrites at fire-time — per feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md.
 *
 * Authored BP021 turn 95 by Knight (Cursor / Sonnet 4.6) — Bushel 9 Phase C.
 */

import { WAVE_1_COHORT, WaveOneLetter, SAVE_THE_WORLD_PAPERS } from "./wave_1_cohort_manifest.js";

// ---------------------------------------------------------------------------
// Boilerplate output types
// ---------------------------------------------------------------------------

export interface LetterBoilerplate {
  recipientName: string;
  canonicalHandle: string;
  cohortClass: string;

  /**
   * Crewman #6 self-positioning paragraph.
   * Positions Founder as Crewman #6 — the one who built the ship and invites
   * qualified hands to crew it, not the one asking for permission to exist.
   * Per founder_voice_bp021_additions_carrot_stick_crewman_6_sipping_ethereal_t.eblet.md
   */
  crewman6Paragraph: string;

  /**
   * Pedestal Forum primary invitation paragraph.
   * Per Mordecai-Esther Pedestal Forum decree composition canon.
   * Invites recipient to co-equal authorship on the paired Save-the-World paper.
   */
  pedestalForumPrimaryParagraph: string;

  /** Secondary Pedestal Forum paragraph (when a second paper is paired) */
  pedestalForumSecondaryParagraph?: string;

  /**
   * WORTH-IT measured-posture framing addendum.
   * Only generated for WORTH-IT cohort letters.
   * Adds receipt-first + no-endorsement + no-response-required framing block.
   */
  worthItMeasuredPostureAddendum?: string;

  /** Structured output for Founder prose-pass reference */
  founderProsePassNote: string;
}

// ---------------------------------------------------------------------------
// Crewman #6 self-positioning paragraph generator
// ---------------------------------------------------------------------------

/**
 * Generates the Crewman #6 self-positioning paragraph.
 *
 * The Crewman #6 anchor (per canon): Founder is NOT asking for permission,
 * validation, or a seat at the table. Founder built the table. Crewman #6
 * positions the ask as an invitation to crew a ship that is already underway —
 * the carrot being co-equal authority; the stick being that the ship sails
 * regardless.
 *
 * This scaffold is intentionally terse — Founder rewrites in full voice at fire-time.
 */
function generateCrewman6Paragraph(letter: WaveOneLetter): string {
  const cohortPosture =
    letter.cohortClass === "WORTH-IT"
      ? "I'm not asking you to endorse us or agree with us. I'm inviting you to verify the methodology on your own machine, with your own keys, in about five minutes."
      : "I'm not asking for permission. The work is already underway.";

  return `[CREWMAN #6 — FOUNDER PROSE-PASS REQUIRED]

Structural scaffold (replace with Founder voice at fire-time):

"${letter.recipientName}, I am writing as the person who built this.

${cohortPosture}

[FOUNDER: insert Crewman #6 self-positioning in your voice here — the 'sipping ethereal tea' register, not the pitch-deck register. You are the one who built the ship. You are inviting a qualified hand to crew it. The invitation stands on the receipt, not on the ask.]

The work continues either way. The invitation is open."

---
Canon anchor: founder_voice_bp021_additions_carrot_stick_crewman_6_sipping_ethereal_t.eblet.md
Posture: ${letter.cohortClass === "WORTH-IT" ? "WORTH-IT measured (receipt-first, no-endorsement)" : "PLOW-AHEAD confident invitation"}`;
}

// ---------------------------------------------------------------------------
// Pedestal Forum invitation paragraph generator
// ---------------------------------------------------------------------------

/**
 * Generates a Pedestal Forum invitation paragraph for a given paper pairing.
 *
 * Per Mordecai-Esther Pedestal Forum Decree Composition Canon:
 * - The Pedestal Forum is the mechanism by which recipients can add their
 *   voice to an LB Save-the-World Series paper with co-equal authority.
 * - "Co-equal authority" means the recipient's contribution is not edited
 *   or mediated by LB — it appears under their name, beside the paper,
 *   on the platform they own a stake in as a member.
 * - The invitation is structural: the Forum URL exists whether or not the
 *   recipient accepts. Their absence is itself a data point for members.
 *
 * Per Section 11 boilerplate canon: each paper pairing gets one paragraph
 * with three structural beats: (1) what the paper argues, (2) what co-equal
 * authority means, (3) the URL stub.
 */
function generatePedestalForumParagraph(
  letter: WaveOneLetter,
  paperNumber: number,
  isPrimary: boolean
): string {
  const paperTitle = SAVE_THE_WORLD_PAPERS[paperNumber as keyof typeof SAVE_THE_WORLD_PAPERS];
  const urlStub = `/papers/${paperNumber}/pedestal-forum`;
  const ordinal = isPrimary ? "primary" : "secondary";

  return `[PEDESTAL FORUM INVITATION — PAPER ${paperNumber} (${ordinal.toUpperCase()}) — FOUNDER PROSE-PASS REQUIRED]

Paper: ${paperNumber}. ${paperTitle}
Pedestal Forum URL: lianabanyan.com${urlStub}

Structural scaffold (replace with Founder voice at fire-time):

"We have published a working paper — '${paperTitle}' — as part of the Liana Banyan Save-the-World Series. [FOUNDER: insert one-sentence summary of the paper's core argument in your voice.]

We are inviting ${letter.recipientName} to the Pedestal Forum for this paper. Co-equal authority means your contribution — if you choose to offer one — appears under your name, beside the paper, unmediated by us. You are not a blurb. You are a co-author of the public record.

The Forum is open at lianabanyan.com${urlStub}. Your absence from it is also a data point that members will see — not as a mark against you, but as a record of who was invited and who chose not to engage with the methodology at this stage.

[FOUNDER: close with the Crewman #6 register — confident, warm, not beseeching.]"

---
Canon anchor: mordecai_esther_pedestal_forum_decree_composition_paper_collaboration_canon_bp021.eblet.md
Section 11 boilerplate: pedestal_forum_section_11_boilerplate_for_all_save_the_world_papers_canon_bp021.eblet.md`;
}

// ---------------------------------------------------------------------------
// WORTH-IT measured-posture addendum
// ---------------------------------------------------------------------------

function generateWorthItAddendum(letter: WaveOneLetter): string {
  return `[WORTH-IT MEASURED-POSTURE ADDENDUM — FOUNDER PROSE-PASS REQUIRED]

Per B131 AOC V02 reframing pattern — applicable to all WORTH-IT recipients:

1. RECEIPT-FIRST: Lead with the reproducibility pack, not the invitation.
   "Run \`python run_benchmark.py --tier smoke\` from \`lb-reproducibility-pack/\` — verifies the methodology end-to-end in ~5 minutes for ~$0.50 vendor API spend against your own corpus, your own keys, your own machine."

2. NO-SHARED-CAUSE PHRASING: Drop any language that assumes shared political / ideological alignment.
   Replace with: "structurally compatible with [domain ${letter.recipientName} has publicly engaged]" + explicit "we are not asking for endorsement."

3. NO-RESPONSE-REQUIRED: "If the methodology doesn't replicate, here is our contact path. Otherwise, our work continues regardless of your response."

4. DEBATE-POSTURE BUFFER: For debate-prone recipients, the Pedestal Forum invitation is framed as peer review, not endorsement ask. "You are invited to critique the methodology publicly on the Forum. A rigorous critique under your name is more valuable to our members than a warm endorsement."

Per-recipient signal: ${letter.pawnComposite}
Pawn signal strength: ${letter.pawnSignalStrength}

---
Canon anchor: B131_WAVE1_LETTER_COHORT_RECONCILIATION_POST_KEIRSEY.md (AOC V02 section)`;
}

// ---------------------------------------------------------------------------
// Trebor Scholz special-case note
// ---------------------------------------------------------------------------

function generateTreborScholzNote(letter: WaveOneLetter): string | undefined {
  if (letter.canonicalHandle !== "trebor_scholz") return undefined;
  return `[TREBOR SCHOLZ — PEDESTAL FORUM PRIORITY NOTE]

Trebor Scholz is the Platform Cooperativism founder. The Mordecai-Esther Pedestal Forum mechanism lands directly for Trebor — more directly than for any other Wave 1 recipient.

Core frame (per Bushel 9 prompt, Phase D):
"We built the publication-class instantiation of platform cooperativism applied to publication itself. Your additions would have co-equal authority to ours."

This is not a metaphor — it is structurally true. The Pedestal Forum IS platform cooperativism applied to the paper-publication layer. Trebor did not build this specific mechanism; we did. But the intellectual heritage is Trebor's. Inviting him to the Forum is inviting him to see his own thesis instantiated in a domain (academic publication) he has not yet applied it to.

Paper pairings: Paper 1 (Economics) + Paper 8 (Engineering Conducted AI).
Both pairings are live at /papers/1/pedestal-forum and /papers/8/pedestal-forum.

Trebor Scholz Bishop scaffold: CROWN_LETTER_TREBOR_SCHOLZ_PEDESTAL_FORUM_BISHOP_SCAFFOLD_BP022.md (Phase D delivery)
Priority: Phase D = first delivery after Phase C boilerplates generated.`;
}

// ---------------------------------------------------------------------------
// Boilerplate generator — main function
// ---------------------------------------------------------------------------

export function generateLetterBoilerplate(letter: WaveOneLetter): LetterBoilerplate {
  const crewman6Paragraph = generateCrewman6Paragraph(letter);

  const pedestalForumPrimaryParagraph = generatePedestalForumParagraph(
    letter,
    letter.pedestalForumPrimary.paperNumber,
    true
  );

  const pedestalForumSecondaryParagraph = letter.pedestalForumSecondary
    ? generatePedestalForumParagraph(
        letter,
        letter.pedestalForumSecondary.paperNumber,
        false
      )
    : undefined;

  const worthItMeasuredPostureAddendum =
    letter.cohortClass === "WORTH-IT"
      ? generateWorthItAddendum(letter)
      : undefined;

  const treborNote = generateTreborScholzNote(letter);

  const founderProsePassNote = [
    `## Founder Prose-Pass Note — ${letter.recipientName}`,
    ``,
    `Cohort: ${letter.cohortClass} | Sub-Wave ${letter.subWave} | Priority ${letter.dispatchPriority}`,
    `Scaffold state: ${letter.scaffoldState} | Prose-pass state: ${letter.prosePassState}`,
    `Pawn composite: ${letter.pawnComposite} (${letter.pawnSignalStrength})`,
    ``,
    `Paper pairing(s):`,
    `  Primary: Paper ${letter.pedestalForumPrimary.paperNumber} — ${letter.pedestalForumPrimary.paperTitle}`,
    letter.pedestalForumSecondary
      ? `  Secondary: Paper ${letter.pedestalForumSecondary.paperNumber} — ${letter.pedestalForumSecondary.paperTitle}`
      : null,
    ``,
    `Per Founder Fire Code (BP020): Bishop scaffolds outline only. Founder writes ALL prose at fire-time.`,
    `Per feedback_letter_prose_pass_single_session.md: letters are single-session prose-pass at fire-time.`,
    ...(treborNote ? [``, treborNote] : []),
  ]
    .filter((l) => l !== null)
    .join("\n");

  return {
    recipientName: letter.recipientName,
    canonicalHandle: letter.canonicalHandle,
    cohortClass: letter.cohortClass,
    crewman6Paragraph,
    pedestalForumPrimaryParagraph,
    pedestalForumSecondaryParagraph,
    worthItMeasuredPostureAddendum,
    founderProsePassNote,
  };
}

// ---------------------------------------------------------------------------
// Batch generator — all 30 letters
// ---------------------------------------------------------------------------

export interface BoilerplateGenerationResult {
  generated: number;
  letters: LetterBoilerplate[];
  treborScholzBoilerplate: LetterBoilerplate | undefined;
}

export function generateAllBoilerplates(): BoilerplateGenerationResult {
  const letters = WAVE_1_COHORT.map(generateLetterBoilerplate);
  const treborScholzBoilerplate = letters.find(
    (b) => b.canonicalHandle === "trebor_scholz"
  );

  return {
    generated: letters.length,
    letters,
    treborScholzBoilerplate,
  };
}

// ---------------------------------------------------------------------------
// Formatted output for Founder review
// ---------------------------------------------------------------------------

export function formatBoilerplateForFounderReview(
  boilerplate: LetterBoilerplate
): string {
  const sections: string[] = [
    `# ${boilerplate.recipientName} — Boilerplate Scaffolds (Bushel 9 Phase C)`,
    ``,
    `**Cohort:** ${boilerplate.cohortClass}`,
    ``,
    `---`,
    ``,
    `## Section 1: Crewman #6 Self-Positioning`,
    ``,
    boilerplate.crewman6Paragraph,
    ``,
    `---`,
    ``,
    `## Section 2: Pedestal Forum Invitation (Primary)`,
    ``,
    boilerplate.pedestalForumPrimaryParagraph,
  ];

  if (boilerplate.pedestalForumSecondaryParagraph) {
    sections.push(
      ``,
      `---`,
      ``,
      `## Section 3: Pedestal Forum Invitation (Secondary)`,
      ``,
      boilerplate.pedestalForumSecondaryParagraph
    );
  }

  if (boilerplate.worthItMeasuredPostureAddendum) {
    sections.push(
      ``,
      `---`,
      ``,
      `## Section 4: WORTH-IT Measured-Posture Addendum`,
      ``,
      boilerplate.worthItMeasuredPostureAddendum
    );
  }

  sections.push(
    ``,
    `---`,
    ``,
    `## Founder Prose-Pass Reference`,
    ``,
    boilerplate.founderProsePassNote
  );

  return sections.join("\n");
}
