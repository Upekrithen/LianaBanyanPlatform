/**
 * WAVE 1 RED CARPET RECIPIENT RECORDS
 * ====================================
 * Per-recipient scaffold records for Crown Letter Wave 1 dispatch readiness.
 * 30 recipients: 22 PLOW-AHEAD + 8 WORTH-IT per B131 post-Keirsey reconciliation.
 *
 * Status: ALL scaffold-ready — Founder prose-pass activates welcome_copy at fire-time.
 * Bill Gates: EXCLUDED (Epstein-indefinite block per B131 Founder direction; absence-as-signal).
 * Melinda French Gates: IN (Priority 2 PLOW-AHEAD per B131).
 *
 * K-Red-Carpet-Wave-1-Verification-BP010
 * Sister scope: K-Wave-1-Distribution-Drafting #5 (commit 0dbed49)
 * Slug convention: <lastname>_<firstinitial> — matches letter scaffold filenames in
 *   BISHOP_DROPZONE/letters/wave_1/<slug>_SCAFFOLD_BP010.md
 *
 * Share-link pattern: https://lianabanyan.com/red-carpet/<slug>
 * Route: /red-carpet/:slug → RedCarpet.tsx (personalized crown-letter experience)
 */

export type TierClass =
  | 'nat-sec'
  | 'chip-maker'
  | 'robotics'
  | 'cooperative'
  | 'edu'
  | 'manufacturing'
  | 'enterprise'
  | 'academic'
  | 'media'
  | 'other';

export type FrameStrategy =
  | 'iron-egiant'
  | 'biology-roots-trunk'
  | 'v4-librarian'
  | 'ultravision'
  | 'dual-frame';

export type RecipientStatus =
  | 'scaffold-ready'
  | 'prose-pass-pending'
  | 'dispatched'
  | 'response-received';

export type WaveClass = 'PLOW-AHEAD' | 'WORTH-IT';

export interface Wave1RedCarpetRecord {
  recipient_slug: string;
  display_name: string;
  tier_class: TierClass;
  frame_strategy: FrameStrategy;
  wave_class: WaveClass;
  priority: number;
  /** STRUCTURAL PLACEHOLDER — Founder prose-pass at fire-time activates final copy. */
  welcome_copy: string;
  key_anchors: string[];
  /** STRUCTURAL PLACEHOLDER — from matching letter scaffold. */
  specific_ask: string;
  share_link: string;
  created_at: string;
  status: RecipientStatus;
  /** Corresponding ID in redCarpetRecipients.ts static registry, where applicable. */
  legacy_registry_id?: string;
}

// ─────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────

const CREATED_AT = '2026-05-01T20:00:00.000Z';
const BASE_URL = 'https://lianabanyan.com/red-carpet';

const STANDARD_KEY_ANCHORS: string[] = [
  'Behemoth Reborn declared $630K (Cost+20%); methodology floors $116M–$15.74B',
  'Cooperative Defensive Patent Pledge (#2260)',
  'Touchstone R10: +86.1pp mean lift / 8 models / 4 vendors / 1,200 calls',
  'K533 Reproducibility Pack: python run_benchmark.py --tier smoke for ~$0.50 vendor API spend / ~5 min',
  'Iron-E-Giant Federation live-deployment receipt (BP011)',
];

// ─────────────────────────────────────────────────────────
// WAVE 1 RECORDS — 30 RECIPIENTS
// ─────────────────────────────────────────────────────────

export const WAVE1_RED_CARPET_RECORDS: Wave1RedCarpetRecord[] = [

  // ══════════════════════════════════════════════════════
  // PLOW-AHEAD (22) — Sub-Wave 1a: Foundational Allies (Priority 1)
  // ══════════════════════════════════════════════════════

  {
    recipient_slug: 'buffett_w',
    display_name: 'Warren Buffett',
    tier_class: 'enterprise',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'PLOW-AHEAD',
    priority: 1,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — buffett_w: personalized welcome, enterprise/philanthropic tier, biology-roots-trunk frame, ISTJ/HIGH Keirsey. Reference letter date + cooperative-economics alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Constitutional DNA lock: Cost+20% platform margin — economics enforced by structure, not policy',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from buffett_w_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/buffett_w`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'warren-buffett',
  },
  {
    recipient_slug: 'doctorow_c',
    display_name: 'Cory Doctorow',
    tier_class: 'cooperative',
    frame_strategy: 'dual-frame',
    wave_class: 'PLOW-AHEAD',
    priority: 1,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — doctorow_c: personalized welcome, cooperative/media tier, biology-roots-trunk + UltraVision dual frame, INTJ/HIGH Keirsey. Reference enshittification canon alignment + UltraVision arc + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'UltraVision arc: From Jarvis to UltraVision — We Skipped Ultron (Marvel-literate developer frame)',
      'Platform cooperative: constitutionally locked against extraction — enshittification by design impossible',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from doctorow_c_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/doctorow_c`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'cory-doctorow',
  },
  {
    recipient_slug: 'schneider_n',
    display_name: 'Nathan Schneider',
    tier_class: 'cooperative',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'PLOW-AHEAD',
    priority: 1,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — schneider_n: personalized welcome, cooperative/academic tier, biology-roots-trunk frame, INFJ/MEDIUM Keirsey. Reference platform cooperative canon + member-ownership alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Member-owned cooperative: 83.3% to creators, governance rights to members from day one',
      'Cooperative Defensive Patent Pledge (#2260): IP as cooperative public good',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from schneider_n_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/schneider_n`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'nathan-schneider',
  },
  {
    recipient_slug: 'brynjolfsson_e',
    display_name: 'Erik Brynjolfsson',
    tier_class: 'academic',
    frame_strategy: 'dual-frame',
    wave_class: 'PLOW-AHEAD',
    priority: 1,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — brynjolfsson_e: personalized welcome, academic/AI-economics tier, biology-roots-trunk + V4 Librarian dual frame, INTJ/MEDIUM Keirsey. V03 J-Curve refresh confirmed. Reference J-Curve thesis alignment + Path B proof sequence + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'V4 Librarian tagline: AI-economics / technical-developer tier frame',
      'Path B: built working extension (K530) → reproducibility harness (K533) → THEN filed provisional',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from brynjolfsson_e_SCAFFOLD_BP010.md (V03 J-Curve refresh)]',
    share_link: `${BASE_URL}/brynjolfsson_e`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'erik-brynjolfsson',
  },

  // ── Sub-Wave 1b: High-Amplification (Priority 2) ─────────────────

  {
    recipient_slug: 'khan_s',
    display_name: 'Sal Khan',
    tier_class: 'edu',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'PLOW-AHEAD',
    priority: 2,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — khan_s: personalized welcome, edu tier, biology-roots-trunk frame, ENFJ/HIGH Keirsey. Reference Didasko cooperative education alignment + Crown Chancellor seat + Imagination Library parallel + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Didasko initiative: educators keep 83.3% — education without extraction',
      'Crown Chancellor seat: designed for professional leadership, not founder ego',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from khan_s_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/khan_s`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'sal-khan',
  },
  {
    recipient_slug: 'scott_m',
    display_name: 'MacKenzie Scott',
    tier_class: 'cooperative',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'PLOW-AHEAD',
    priority: 2,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — scott_m: personalized welcome, philanthropic/cooperative tier, biology-roots-trunk frame, INFJ/MEDIUM Keirsey. Reference trust-based giving + cooperative infrastructure as permanent public good + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Cooperative Defensive Patent Pledge (#2260): platform IP as cooperative public good, not enclosure',
      'Constitutional lock: Cost+20% cannot be changed by future governance capture',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from scott_m_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/scott_m`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'mackenzie-scott',
  },
  {
    recipient_slug: 'scholz_t',
    display_name: 'Trebor Scholz',
    tier_class: 'cooperative',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'PLOW-AHEAD',
    priority: 2,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — scholz_t: personalized welcome, cooperative/academic tier, biology-roots-trunk frame, INFJ/MEDIUM Keirsey. UPGRADED from WORTH-IT per Pawn signal. Reference platform cooperative canon + worker-ownership alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Platform cooperative architecture: member-owned, constitutionally locked at Cost+20%',
      'Cooperative Defensive Patent Pledge (#2260): worker-owned IP commons',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from scholz_t_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/scholz_t`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'trebor-scholz',
  },
  {
    recipient_slug: 'frenchgates_m',
    display_name: 'Melinda French Gates',
    tier_class: 'cooperative',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'PLOW-AHEAD',
    priority: 2,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — frenchgates_m: personalized welcome, philanthropic/cooperative tier, biology-roots-trunk frame, ENFJ/MEDIUM Keirsey. Priority 2 PLOW-AHEAD. Bill Gates excluded (Epstein-indefinite); Melinda French Gates IN per B131. Reference cooperative public-health + Pivotal Ventures alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Tatiana Schlossburg Health Accords: medicine at Cost+20% — cooperative health infrastructure',
      'Cooperative Defensive Patent Pledge (#2260): structural guarantee, not policy promise',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from frenchgates_m_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/frenchgates_m`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    // New record — no legacy registry entry
  },

  // ── Sub-Wave 1c: Academic / Intellectual Layer (Priority 3) ──────

  {
    recipient_slug: 'benkler_y',
    display_name: 'Yochai Benkler',
    tier_class: 'academic',
    frame_strategy: 'dual-frame',
    wave_class: 'PLOW-AHEAD',
    priority: 3,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — benkler_y: personalized welcome, academic/cooperative tier, biology-roots-trunk + UltraVision dual frame, INTP/HIGH Keirsey. Reference commons-based peer production alignment + sovereignty-by-construction + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'UltraVision arc: cooperative AI infrastructure — commons-based, not weaponized',
      'Sovereignty-by-construction: zero LB-server calls required to verify — structural guarantee',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from benkler_y_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/benkler_y`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'yochai-benkler',
  },
  {
    recipient_slug: 'marks_h',
    display_name: 'Howard Marks',
    tier_class: 'enterprise',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'PLOW-AHEAD',
    priority: 3,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — marks_h: personalized welcome, enterprise/finance tier, biology-roots-trunk frame, INTJ/MEDIUM Keirsey. Reference patient capital + second-order-thinking + Behemoth Reborn valuation alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Behemoth Reborn: $630K declared, $116M–$15.74B methodology floor — patient capital alignment',
      'Constitutional DNA lock: economics guaranteed by structure — second-order-thinking made structural',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from marks_h_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/marks_h`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'howard-marks',
  },
  {
    recipient_slug: 'raworth_k',
    display_name: 'Kate Raworth',
    tier_class: 'academic',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'PLOW-AHEAD',
    priority: 3,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — raworth_k: personalized welcome, academic/cooperative-economics tier, biology-roots-trunk frame, INFJ/MEDIUM Keirsey. Reference Doughnut Economics + regenerative model alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Biology-roots-trunk: cooperative roots, initiative trunk, creator fruits — regenerative economics',
      'Cost+20% constitutional lock: platform can never extract beyond this ceiling — distributive by design',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from raworth_k_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/raworth_k`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'kate-raworth',
  },
  {
    recipient_slug: 'perel_e',
    display_name: 'Esther Perel',
    tier_class: 'media',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'PLOW-AHEAD',
    priority: 3,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — perel_e: personalized welcome, media/relationship-psychology tier, biology-roots-trunk frame, ENFJ/MEDIUM Keirsey. Reference community-trust architecture + belonging-as-infrastructure + Harper Guild alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Harper Guild: trust architecture for communities — trained facilitators, cooperative culture maintenance',
      'Biology-roots-trunk: belonging and community as the fruit of cooperative infrastructure',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from perel_e_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/perel_e`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'esther-perel',
  },
  {
    recipient_slug: 'godin_s',
    display_name: 'Seth Godin',
    tier_class: 'media',
    frame_strategy: 'dual-frame',
    wave_class: 'PLOW-AHEAD',
    priority: 3,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — godin_s: personalized welcome, media/marketing tier, biology-roots-trunk + UltraVision dual frame, ENTP/HIGH Keirsey. Reference tribe-building + smallest-viable-audience + cooperative creator economy + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'UltraVision arc: cooperative AI amplifies human creativity — creator keeps 83.3%',
      'Creator keeps 83.3%: the smallest viable audience now earns what they deserve',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from godin_s_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/godin_s`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'seth-godin',
  },
  {
    recipient_slug: 'rushkoff_d',
    display_name: 'Douglas Rushkoff',
    tier_class: 'media',
    frame_strategy: 'dual-frame',
    wave_class: 'PLOW-AHEAD',
    priority: 3,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — rushkoff_d: personalized welcome, media/digital-theory tier, biology-roots-trunk + UltraVision dual frame, INTP/MEDIUM Keirsey. Reference Team Human + cooperative-infrastructure-as-counter-to-extraction + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'UltraVision arc: From Jarvis to UltraVision — We Skipped Ultron; Team Human wins',
      'Platform cooperative: extractive platforms vs. cooperative infrastructure with constitutional lock',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from rushkoff_d_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/rushkoff_d`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'douglas-rushkoff',
  },
  {
    recipient_slug: 'newmark_c',
    display_name: 'Craig Newmark',
    tier_class: 'media',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'PLOW-AHEAD',
    priority: 3,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — newmark_c: personalized welcome, media/journalism-philanthropy tier, biology-roots-trunk frame, ISTJ/MEDIUM Keirsey. Reference journalism co-ops + community infrastructure + creator-keeps-83.3%-for-local-journalism alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Harper Guild + cooperative journalism: community trust infrastructure at scale',
      'Creator keeps 83.3%: local journalism on cooperative infrastructure changes the economic model',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from newmark_c_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/newmark_c`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'craig-newmark',
  },

  // ── Sub-Wave 1d: Commentariat + Cultural (Priority 4–7) ──────────

  {
    recipient_slug: 'white_m',
    display_name: 'Molly White',
    tier_class: 'media',
    frame_strategy: 'ultravision',
    wave_class: 'PLOW-AHEAD',
    priority: 4,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — white_m: personalized welcome, media/tech-skeptic tier, UltraVision primary frame, INTJ/MEDIUM Keirsey. Reference Web3-skeptic ethos + proof-before-claim architecture + Path B sequence + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'UltraVision arc primary: built working extension (K530) before filing patent — proof-before-claim',
      'Sovereignty-by-construction: run with all vendor keys cleared to verify zero LB-server calls — structural',
      'Path B: K530 working extension → K533 reproducibility harness → Prov 14 filing sequence',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from white_m_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/white_m`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'molly-white',
  },
  {
    recipient_slug: 'green_h',
    display_name: 'Hank Green',
    tier_class: 'media',
    frame_strategy: 'dual-frame',
    wave_class: 'PLOW-AHEAD',
    priority: 4,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — green_h: personalized welcome, media/edu-science tier, UltraVision + biology dual frame, ENTP/HIGH Keirsey. Reference VidCon + creator-ownership + science communication alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'UltraVision arc: science communication + cooperative infrastructure = creator economy done right',
      'JukeBox + Didasko: creator keeps 83.3% across music and education',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from green_h_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/green_h`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'hank-green',
  },
  {
    recipient_slug: 'poo_aj',
    display_name: 'Ai-jen Poo',
    tier_class: 'cooperative',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'PLOW-AHEAD',
    priority: 4,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — poo_aj: personalized welcome, cooperative/labor-organizing tier, biology-roots-trunk frame, ENFJ/MEDIUM Keirsey. Reference NDWA labor-coalition + domestic-worker cooperative infrastructure + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Household Concierge initiative: domestic workers keep 83.3% — cooperative organizing infrastructure',
      'Creator keeps 83.3%: labor economics, not platform extraction',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from poo_aj_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/poo_aj`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'ai-jen-poo',
  },
  {
    recipient_slug: 'carter_m',
    display_name: 'Majora Carter',
    tier_class: 'cooperative',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'PLOW-AHEAD',
    priority: 4,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — carter_m: personalized welcome, cooperative/environmental-justice tier, biology-roots-trunk frame, ENFJ/MEDIUM Keirsey. Reference env-justice + community-development + TED/community alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Biology-roots-trunk: cooperative roots in community — environmental justice as the fruit',
      'Rally Group initiative: community infrastructure for disaster resilience and mutual aid',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from carter_m_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/carter_m`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'majora-carter',
  },
  {
    recipient_slug: 'parton_d',
    display_name: 'Dolly Parton',
    tier_class: 'media',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'PLOW-AHEAD',
    priority: 5,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — parton_d: personalized welcome, cultural/media tier, biology-roots-trunk frame (warm / accessible register), ESFJ/MEDIUM Keirsey. Reference Imagination Library + Dollywood community generosity alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Didasko: Imagination Library ethos at cooperative scale — knowledge shared, not gatekept',
      'Creator keeps 83.3%: artists and educators earn what they create',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from parton_d_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/parton_d`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'dolly-parton',
  },
  {
    recipient_slug: 'mcafee_a',
    display_name: 'Andrew McAfee',
    tier_class: 'academic',
    frame_strategy: 'dual-frame',
    wave_class: 'PLOW-AHEAD',
    priority: 7,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — mcafee_a: personalized welcome, academic/AI-economics tier, biology-roots-trunk + V4 Librarian dual frame, INTJ/MEDIUM Keirsey. Reference MIT collabs + More From Less thesis + cooperative dematerialization alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'V4 Librarian tagline: AI-economics / technical-developer tier frame',
      'Touchstone R10: +86.1pp lift — third-party-replicable benchmark, not claims',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from mcafee_a_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/mcafee_a`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    // New record — no legacy registry entry
  },
  {
    recipient_slug: 'mollick_e',
    display_name: 'Ethan Mollick',
    tier_class: 'academic',
    frame_strategy: 'dual-frame',
    wave_class: 'PLOW-AHEAD',
    priority: 7,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — mollick_e: personalized welcome, academic/AI-experimentation tier, V4 Librarian + UltraVision primary frame, ENTP/MEDIUM Keirsey. Reference open AI experimentation + Wharton educator + Co-Intelligence alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'V4 Librarian tagline: AI-economics frame — open AI experimentation context',
      'UltraVision arc primary: run_benchmark.py yourself — open-science / open-experimentation ethos',
      'K533 Reproducibility Pack: verifiable by any researcher, any machine, any keys',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from mollick_e_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/mollick_e`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    // New record — no legacy registry entry
  },

  // ══════════════════════════════════════════════════════
  // WORTH-IT (8) — Measured-posture dispatch
  // B131 template: (1) lead with repro-pack receipt, (2) no shared-political-cause framing,
  // (3) explicit no-response-required
  // ══════════════════════════════════════════════════════

  {
    recipient_slug: 'acemoglu_d',
    display_name: 'Daron Acemoglu',
    tier_class: 'academic',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'WORTH-IT',
    priority: 3,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — acemoglu_d: personalized welcome, academic/economics tier, biology-roots-trunk (MEASURED POSTURE) frame, INTJ/MEDIUM Keirsey. Lead with repro-pack receipt. No shared-political-cause framing. Explicit no-response-required. Reference institutions + technology + cooperative alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'K533 Reproducibility Pack: third-party-replicable — run on own machine, own keys, own corpus',
      'Sovereignty-by-construction: structural data-sovereignty guarantee, not policy',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from acemoglu_d_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/acemoglu_d`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'daron-acemoglu',
  },
  {
    recipient_slug: 'mazzucato_m',
    display_name: 'Mariana Mazzucato',
    tier_class: 'academic',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'WORTH-IT',
    priority: 3,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — mazzucato_m: personalized welcome, academic/mission-economy tier, biology-roots-trunk (MEASURED POSTURE) frame, ENTJ/MEDIUM Keirsey. Lead with repro-pack receipt. No shared-political-cause framing. Explicit no-response-required. Reference entrepreneurial-state + mission-economy + Cost+20% lock alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'K533 Reproducibility Pack: mission-economy verification — run the harness, evaluate the evidence',
      'Constitutional lock: Cost+20% — mission-driven economics enforced by structure, not policy',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from mazzucato_m_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/mazzucato_m`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'mariana-mazzucato',
  },
  {
    recipient_slug: 'giridharadas_a',
    display_name: 'Anand Giridharadas',
    tier_class: 'media',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'WORTH-IT',
    priority: 3,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — giridharadas_a: personalized welcome, media/commentariat tier, biology-roots-trunk (MEASURED POSTURE) frame, ENFJ/MEDIUM Keirsey. Lead with repro-pack receipt. No shared-political-cause framing. Explicit no-response-required. Reference Winners Take All + extractive-philanthropy criticism + structural-alternative alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Platform cooperative: structural alternative to extractive philanthropy — constitutional lock',
      'K533 Reproducibility Pack: open evidence — verify the claim before forming an opinion',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from giridharadas_a_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/giridharadas_a`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'anand-giridharadas',
  },
  {
    recipient_slug: 'klein_e',
    display_name: 'Ezra Klein',
    tier_class: 'media',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'WORTH-IT',
    priority: 4,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — klein_e: personalized welcome, media/policy-commentary tier, biology-roots-trunk (MEASURED POSTURE) frame, INTP/MEDIUM Keirsey. Lead with repro-pack receipt. No shared-political-cause framing. Explicit no-response-required. Reference abundance-agenda + cooperative policy alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'K533 Reproducibility Pack: ~$0.50 vendor API spend to verify — run before forming an opinion',
      'Cooperative Defensive Patent Pledge: aligned with abundance policy, not IP enclosure',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from klein_e_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/klein_e`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'ezra-klein',
  },
  {
    recipient_slug: 'patel_n',
    display_name: 'Nilay Patel',
    tier_class: 'media',
    frame_strategy: 'dual-frame',
    wave_class: 'WORTH-IT',
    priority: 4,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — patel_n: personalized welcome, media/tech-commentary tier, UltraVision + biology (MEASURED POSTURE) dual frame, ENTP/MEDIUM Keirsey. Lead with repro-pack receipt. No shared-political-cause framing. Explicit no-response-required. Reference The Verge + tech-accountability + open-verification alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'UltraVision arc: tech-accountability frame — built the working extension before the patent claim',
      'K533 Reproducibility Pack: open-source verification — any tech journalist can run the harness',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from patel_n_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/patel_n`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'nilay-patel',
  },
  {
    recipient_slug: 'sinek_s',
    display_name: 'Simon Sinek',
    tier_class: 'media',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'WORTH-IT',
    priority: 5,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — sinek_s: personalized welcome, media/enterprise-leadership tier, biology-roots-trunk (MEASURED POSTURE) frame, ENFJ/HIGH Keirsey. Lead with repro-pack receipt. No shared-political-cause framing. Explicit no-response-required. Reference Start With Why + infinite-game + cooperative-leadership alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Biology-roots-trunk: cooperative infrastructure as the infinite game — not extractive, not finite',
      'Constitutional lock: Cost+20% is the Why, built into the DNA — Start With Why, not Start With Policy',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from sinek_s_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/sinek_s`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'simon-sinek',
  },
  {
    recipient_slug: 'pitbull',
    display_name: 'Pitbull',
    tier_class: 'media',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'WORTH-IT',
    priority: 5,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — pitbull: personalized welcome, cultural/music-education tier, biology-roots-trunk (MEASURED POSTURE; music/edu entry) frame, ESFP/MEDIUM Keirsey. Lead with repro-pack receipt. No shared-political-cause framing. Explicit no-response-required. Reference SLAM! charter schools + JukeBox cooperative-music alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'JukeBox initiative: artists keep 83.3% — music rights returned to creators',
      'Didasko + SLAM! charter school ethos: education without extraction, cooperative infrastructure',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from pitbull_SCAFFOLD_BP010.md]',
    share_link: `${BASE_URL}/pitbull`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'pitbull',
  },
  {
    recipient_slug: 'ocasiocortez_a',
    display_name: 'Alexandria Ocasio-Cortez',
    tier_class: 'cooperative',
    frame_strategy: 'biology-roots-trunk',
    wave_class: 'WORTH-IT',
    priority: 6,
    welcome_copy: '[FOUNDER PROSE-PASS REQUIRED — ocasiocortez_a: personalized welcome, cooperative/civic tier, biology-roots-trunk (MEASURED POSTURE) frame, ENFJ/MEDIUM Keirsey. DOWNGRADED from PLOW-AHEAD per Pawn signal. V02 Maine Third-Path refresh + measured-posture reframing. Lead with repro-pack receipt. No shared-political-cause framing. Explicit no-response-required. Reference cooperative labor + structural alignment + specific ask from scaffold.]',
    key_anchors: [
      ...STANDARD_KEY_ANCHORS,
      'Cooperative Defensive Patent Pledge (#2260): structurally compatible with cooperative-economic frameworks',
      'K533 Reproducibility Pack: run on own machine — sovereignty-by-construction, not policy',
    ],
    specific_ask: '[FOUNDER PROSE-PASS REQUIRED — from ocasiocortez_a_SCAFFOLD_BP010.md (V02 Maine Third-Path refresh)]',
    share_link: `${BASE_URL}/ocasiocortez_a`,
    created_at: CREATED_AT,
    status: 'scaffold-ready',
    legacy_registry_id: 'alexandria-ocasio-cortez',
  },
];

// ─────────────────────────────────────────────────────────
// LOOKUP FUNCTIONS
// ─────────────────────────────────────────────────────────

/**
 * Look up a Wave 1 red carpet record by recipient slug (underscore convention).
 * Returns null if the slug is not in the Wave 1 cohort.
 */
export function findWave1RecordBySlug(slug: string): Wave1RedCarpetRecord | null {
  const normalized = slug.toLowerCase().trim();
  return WAVE1_RED_CARPET_RECORDS.find(r => r.recipient_slug === normalized) ?? null;
}

/**
 * Look up a Wave 1 red carpet record by legacy registry ID (hyphenated format).
 * Bridges the existing redCarpetRecipients.ts registry to Wave 1 records.
 */
export function findWave1RecordByLegacyId(legacyId: string): Wave1RedCarpetRecord | null {
  const normalized = legacyId.toLowerCase().trim();
  return WAVE1_RED_CARPET_RECORDS.find(r => r.legacy_registry_id === normalized) ?? null;
}

/**
 * Returns true if the given slug is a Wave 1 Crown Letter recipient.
 */
export function isWave1Recipient(slug: string): boolean {
  return findWave1RecordBySlug(slug) !== null;
}

// ─────────────────────────────────────────────────────────
// STATUS SUMMARY (Phase E Shutterbug)
// ─────────────────────────────────────────────────────────

export interface Wave1StatusSummary {
  total: number;
  byStatus: Record<RecipientStatus, number>;
  byWaveClass: Record<WaveClass, number>;
  slugList: string[];
}

export function getWave1StatusSummary(): Wave1StatusSummary {
  const total = WAVE1_RED_CARPET_RECORDS.length;

  const byStatus = WAVE1_RED_CARPET_RECORDS.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {}) as Record<RecipientStatus, number>;

  const byWaveClass = WAVE1_RED_CARPET_RECORDS.reduce<Record<string, number>>((acc, r) => {
    acc[r.wave_class] = (acc[r.wave_class] || 0) + 1;
    return acc;
  }, {}) as Record<WaveClass, number>;

  const slugList = WAVE1_RED_CARPET_RECORDS.map(r => r.recipient_slug);

  return { total, byStatus, byWaveClass, slugList };
}

// ─────────────────────────────────────────────────────────
// WAVE 1 SLUG → LEGACY ID MAP (for redCarpetRecipients.ts bridge)
// ─────────────────────────────────────────────────────────

/** Maps Wave 1 underscore slugs to hyphenated IDs in the existing static registry. */
export const WAVE1_SLUG_TO_LEGACY_ID: Record<string, string> = Object.fromEntries(
  WAVE1_RED_CARPET_RECORDS
    .filter(r => r.legacy_registry_id)
    .map(r => [r.recipient_slug, r.legacy_registry_id as string])
);
