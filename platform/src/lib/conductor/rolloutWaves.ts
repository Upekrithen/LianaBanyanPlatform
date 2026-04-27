/**
 * Conductor's Baton Rollout Waves
 * K525 · Phase D.1 · Innovation #2277
 *
 * Canonical wave configuration. Wave 1 member list LOCKED B129 per Founder
 * direction. The dispatcher (separate K-future, gated on Prov 14) reads this
 * file to know which members to enroll when CONDUCTOR_BATON_ENABLED flips.
 *
 * IMPORTANT — Publication hold:
 *   Wave 1 enrollment requires:
 *     1. Prov 14 FILED
 *     2. CONDUCTOR_BATON_ENABLED platform flag flipped to TRUE
 *     3. Founder explicit "fire Wave 1" greenlight
 *   Until all three hold, this file is documentation only. Importing it does
 *   not enroll anyone; the dispatcher must explicitly read WAVE_1_MEMBERS and
 *   call the enrollment API.
 */

// ---------------------------------------------------------------------------
// Wave 0 — Founder-only dogfood
// ---------------------------------------------------------------------------

/**
 * Wave 0 is identified by the Founder's auth.users id at the platform level.
 * This is intentionally NOT hardcoded here (the value lives in the Founder's
 * Supabase row); the dispatcher resolves it from the canonical members table.
 */
export const WAVE_0_DESCRIPTION =
  "Founder-only dogfood. Pre-Prov-14 enabled. 7-day soak before Wave 1.";

// ---------------------------------------------------------------------------
// Wave 1 — locked B129
// ---------------------------------------------------------------------------

/**
 * The 10 Wave 1 candidates LOCKED at B129 (April 27, 2026). Founder accepted
 * all 8 Bishop archetype suggestions (less Tatiana Schlossberg — deceased),
 * plus 3 additions from Bishop's expanded slate.
 *
 * The "name" field is the public name; "matchKey" is the canonical lookup
 * stem used to resolve the actual member id at enrollment time. Email and
 * physical address fields are deliberately NOT in this file — they belong to
 * the Founder's outreach playbook, not the platform code.
 *
 * Source-of-truth: PROMPT_KNIGHT_K525 resolved annotations + B129 hydration
 * notes (`feedback_wave_1_locked_B129.md`).
 */
export interface WaveMember {
  name: string;
  matchKey: string;
  archetype: string;
  rationale: string;
}

export const WAVE_1_MEMBERS: WaveMember[] = [
  {
    name: "Cory Doctorow",
    matchKey: "doctorow_cory",
    archetype: "Anti-enshittification advocate",
    rationale:
      "Author of the enshittification framework Liana Banyan's anti-enshittification " +
      "architecture is built against. Wave 1 acceptance signals the framework's " +
      "structural validity beyond commentary.",
  },
  {
    name: "Ethan Mollick",
    archetype: "AI-augmented work researcher",
    matchKey: "mollick_ethan",
    rationale:
      "Wharton professor, One Useful Thing newsletter. Mollick's work on " +
      "human-in-the-loop AI productivity benefits directly from Cathedral substrate. " +
      "He is a credible empirical-validation voice.",
  },
  {
    name: "Trebor Scholz",
    matchKey: "scholz_trebor",
    archetype: "Platform cooperativism founder",
    rationale:
      "Founder of platform cooperativism as a research field. Wave 1 enrollment " +
      "places Liana Banyan in his canon — a structural endorsement larger than any " +
      "individual review.",
  },
  {
    name: "Andrew McAfee",
    matchKey: "mcafee_andrew",
    archetype: "Second Machine Age co-author",
    rationale:
      "MIT digital economist. McAfee's audience is the centrist/business establishment " +
      "Liana Banyan's anti-extraction model needs to reach. Empirical bent matches " +
      "Cathedral benchmarks.",
  },
  {
    name: "Vigil family member (Founder picks)",
    matchKey: "vigil_family_pending",
    archetype: "Founder-relational pick",
    rationale:
      "Founder selects which Vigil family member to enroll. Family is in the " +
      "long-standing Anti-Enshittification Coalition orbit. Strengthens the relational " +
      "spine of Wave 1.",
  },
  {
    name: "Nathan Schneider",
    matchKey: "schneider_nathan",
    archetype: "Cooperative-economy scholar",
    rationale:
      "Author of \"Everything for Everyone\" and one of the loudest voices on " +
      "exit-to-community models. Direct academic vocabulary alignment with Liana " +
      "Banyan's cooperative substrate.",
  },
  {
    name: "MacKenzie Scott (via team)",
    matchKey: "scott_mackenzie",
    archetype: "Philanthropic accelerant",
    rationale:
      "Yield-Lab philanthropy model. Scott's grantmaking discovers structurally-sound " +
      "cooperative platforms; Wave 1 enrollment is a discovery vector. Outreach via " +
      "her team if direct access is unavailable.",
  },
  {
    name: "Anil Dash",
    matchKey: "dash_anil",
    archetype: "Web independence advocate",
    rationale:
      "Glitch founder, longtime advocate for indie web and platform accountability. " +
      "Conductor's Baton + Cathedral are exactly the kind of substrate-level " +
      "infrastructure Dash has been calling for.",
  },
  {
    name: "Yancey Strickler",
    matchKey: "strickler_yancey",
    archetype: "Bento-box / Metalabel founder",
    rationale:
      "Kickstarter co-founder; current work on Metalabel + Bento Society directly " +
      "parallels Liana Banyan's three-currency / multi-initiative architecture. Strong " +
      "structural fit.",
  },
  {
    name: "Casey Newton",
    matchKey: "newton_casey",
    archetype: "Tech-policy journalist",
    rationale:
      "Platformer newsletter; covers AI policy + platform behavior in depth. " +
      "Wave 1 enrollment + receipt-share visibility provides Newton with empirical " +
      "data for his beat.",
  },
];

// ---------------------------------------------------------------------------
// Wave 2 — full rollout
// ---------------------------------------------------------------------------

export const WAVE_2_DESCRIPTION =
  "Full member rollout. Default mode `auto`. Existing members notified via " +
  "Helm announcement banner. Triggers: Wave-1 telemetry green light + Founder " +
  "ratification.";

// ---------------------------------------------------------------------------
// Pledge tagline change (Phase D.3.2)
// ---------------------------------------------------------------------------

/**
 * The Pledge tagline change Founder ratified B129. Applied to the Pledge
 * surface only — the master brand tagline ("You build the Features — We're
 * building the Board.") stays canon.
 */
export const PLEDGE_TAGLINE_V2 = "Vendor-Neutral by Default";
export const PLEDGE_TAGLINE_V2_CONTEXT =
  "B129 Founder ratification: change Pledge tagline to 'Vendor-Neutral by Default'. " +
  "Master brand tagline unchanged. Apply on the Pledge surface when " +
  "CONDUCTOR_BATON_ENABLED flips at the platform level.";
