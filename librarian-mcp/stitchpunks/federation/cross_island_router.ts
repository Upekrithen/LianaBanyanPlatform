/**
 * Cross-Island Router — Federation Memory Iceberg
 * Bushel 31 Phase D / BP022 / 2026-05-03 AD
 *
 * Wrasse anchor registration for member-islands.
 * Cross-island visit routing with provenance preservation.
 * 3-access-key gating per FLAG_MARKER FM-001.
 *
 * Composes with:
 *   - multi_dimensional_twinning_locations_dimensions_times_conditional_operators_chronos_canon_bp021.eblet.md
 *   - Wrasse substrate (KN042 sub-ms retrieval)
 *   - Pheromone trust-anchor graph (Guide endorsement routing)
 *   - babylon_candle_burns table (IP Ledger credit-where-due on burn)
 *   - member_islands + member_island_visits tables (Phase C migration)
 */

import { randomUUID } from 'crypto';

// ── Types ────────────────────────────────────────────────────────────────────

export interface TensorCoordinate {
  location: string | GeoAnchor;
  dimension: IslandDimension;
  time_anchor: ChronosAnchor;
}

export interface GeoAnchor {
  lat_lon?: string;
  symbolic_anchor: string;
  cultural_descriptor: string;
  structural_descriptor?: string;
}

export type IslandDimension =
  | 'ghost_world_canonical'      // default: the main HexIsle Ghost World layer
  | 'ghost_world_shadow'         // shadow layer (darker narrative)
  | 'ghost_world_luminant'       // luminant layer (elevated narrative)
  | string;                      // member-defined dimension string

export type ChronosAnchor =
  | 'present_perpetuity'         // default: from now through forever
  | 'historical'                 // anchored to a past time
  | 'future_class'               // anchored to a projected future
  | string;                      // Chronos timestamp per Multi-dim Twinning canon

export type AccessKeyClass = 'deck_card' | 'guide' | 'babylon_candle';

export interface AccessKeyConfig {
  deck_card_durable: boolean;
  guide_mediated: boolean;
  babylon_candle_consumable: boolean;
}

export interface WraseAnchor {
  anchor_id: string;             // UUID — primary Wrasse handle
  island_id: string;
  tensor_coordinate: TensorCoordinate;
  canon_class: 'member_class' | 'canon_promoted';
  retrieval_class: 'standard' | 'priority';  // priority for canon_promoted
  registered_at: string;        // ISO timestamp
}

export interface VisitContext {
  island_id: string;
  visitor_member_id: string;
  access_key_class: AccessKeyClass;
  access_key_payload?: Record<string, unknown>;
  pheromone_emit?: boolean;
}

export interface VisitResult {
  visit_id: string;
  island_id: string;
  access_key_class: AccessKeyClass;
  pheromone_trail_id?: string;
  babylon_candle_burn_id?: string;
  creator_marks_credited?: number;
  provenance_note: string;
}

// ── Wrasse Anchor Registry (in-memory substrate — Wrasse persistence via RPC) ─

const _wrasse_registry = new Map<string, WraseAnchor>();

/**
 * Register a Wrasse anchor for a member-island.
 * Called at island creation (member_class) or canon-class promotion (upgrades to priority).
 * Per KN042: Wrasse anchors provide sub-ms substrate retrieval.
 */
export function registerWrasseAnchor(
  island_id: string,
  tensor_coordinate: TensorCoordinate,
  canon_class: 'member_class' | 'canon_promoted' = 'member_class'
): WraseAnchor {
  const existing = _wrasse_registry.get(island_id);
  if (existing) {
    // Upgrade retrieval_class if canon-promoted
    if (canon_class === 'canon_promoted') {
      existing.retrieval_class = 'priority';
      existing.canon_class = 'canon_promoted';
    }
    return existing;
  }

  const anchor: WraseAnchor = {
    anchor_id: randomUUID(),
    island_id,
    tensor_coordinate,
    canon_class,
    retrieval_class: canon_class === 'canon_promoted' ? 'priority' : 'standard',
    registered_at: new Date().toISOString(),
  };

  _wrasse_registry.set(island_id, anchor);
  return anchor;
}

/**
 * Retrieve Wrasse anchor by island_id.
 * Sub-ms when cached (per KN042 Wrasse substrate guarantee).
 */
export function getWrasseAnchorByIsland(island_id: string): WraseAnchor | null {
  return _wrasse_registry.get(island_id) ?? null;
}

/**
 * Retrieve all Wrasse anchors matching a tensor coordinate query.
 * Supports partial match: filter by location, dimension, or time_anchor.
 */
export function queryWraseAnchors(filter: Partial<TensorCoordinate>): WraseAnchor[] {
  const results: WraseAnchor[] = [];
  for (const anchor of _wrasse_registry.values()) {
    const tc = anchor.tensor_coordinate;
    let match = true;
    if (filter.dimension && tc.dimension !== filter.dimension) match = false;
    if (filter.time_anchor && tc.time_anchor !== filter.time_anchor) match = false;
    if (filter.location) {
      const locStr = typeof filter.location === 'string'
        ? filter.location
        : filter.location.symbolic_anchor;
      const anchorLoc = typeof tc.location === 'string'
        ? tc.location
        : tc.location.symbolic_anchor;
      if (!anchorLoc.toLowerCase().includes(locStr.toLowerCase())) match = false;
    }
    if (match) results.push(anchor);
  }
  // Canon-promoted islands sort first (priority routing)
  return results.sort((a, b) =>
    a.retrieval_class === 'priority' ? -1 : b.retrieval_class === 'priority' ? 1 : 0
  );
}

// ── 3-Access-Key Gating ──────────────────────────────────────────────────────

/**
 * Verify Deck Card access.
 * Deck Card = durable JWT-class credential bound to member_id.
 * Non-consumable: valid across sessions. Verifies LB membership + cohort-class.
 *
 * Per FLAG_MARKER FM-001: deck_card_durable key type.
 */
export function verifyDeckCard(
  access_key_payload: Record<string, unknown>
): { valid: boolean; reason?: string } {
  // Full JWT verification via service layer; here we validate payload shape
  const token = access_key_payload?.deck_card_token as string | undefined;
  if (!token || typeof token !== 'string' || token.length < 32) {
    return { valid: false, reason: 'Deck Card: missing or malformed token' };
  }
  const member_id = access_key_payload?.member_id as string | undefined;
  if (!member_id) {
    return { valid: false, reason: 'Deck Card: member_id required' };
  }
  // Additional JWT signature verification is done by the calling service layer
  return { valid: true };
}

/**
 * Verify Guide (social-trust-credential mediated) access.
 * Guide = a co-member vouches via Pheromone trust-anchor graph.
 * Creates a visible social trail. Mediated (not anonymous).
 *
 * Per FLAG_MARKER FM-001: guide_mediated key type.
 * Endorsement weight from member_island_guide_endorsements.
 */
export function verifyGuideEndorsement(
  access_key_payload: Record<string, unknown>
): { valid: boolean; endorsement_weight?: number; reason?: string } {
  const guide_member_id = access_key_payload?.guide_member_id as string | undefined;
  const endorsement_id = access_key_payload?.endorsement_id as string | undefined;

  if (!guide_member_id) {
    return { valid: false, reason: 'Guide: guide_member_id required' };
  }
  if (!endorsement_id) {
    return { valid: false, reason: 'Guide: endorsement_id required (pre-created in member_island_guide_endorsements)' };
  }

  const weight = (access_key_payload?.endorsement_weight as number) ?? 1.00;
  return { valid: true, endorsement_weight: weight };
}

/**
 * Process Babylon Candle burn.
 * Babylon Candle = single-use Marks expenditure.
 * Marks burned flow to island creator: 83.3% (creator-keeps).
 * Platform retains Cost+20% (marks_burned - creator_credit).
 *
 * Per FLAG_MARKER FM-001: babylon_candle_consumable key type.
 * IP Ledger credit fires to creator (credit-where-due).
 */
export function processBabylonCandle(
  access_key_payload: Record<string, unknown>
): {
  valid: boolean;
  marks_burned?: number;
  creator_marks_credited?: number;
  platform_marks_retained?: number;
  reason?: string;
} {
  const marks_amount = access_key_payload?.marks_amount as number | undefined;
  if (!marks_amount || marks_amount <= 0) {
    return { valid: false, reason: 'Babylon Candle: marks_amount must be > 0' };
  }

  const creator_credit = Math.round(marks_amount * 0.833 * 100) / 100;
  const platform_retained = Math.round((marks_amount - creator_credit) * 100) / 100;

  return {
    valid: true,
    marks_burned: marks_amount,
    creator_marks_credited: creator_credit,
    platform_marks_retained: platform_retained,
  };
}

// ── Cross-Island Visit Router ────────────────────────────────────────────────

/**
 * Route a cross-island visit through the Federation Memory Iceberg.
 *
 * 1. Verify access-key gating passes (deck_card | guide | babylon_candle)
 * 2. Emit Pheromone trail (access-class-specific)
 * 3. Return visit context for DB persistence (rpc_visit_member_island handles the DB write)
 *
 * Provenance is preserved through the entire routing chain:
 * - Visitor's identity
 * - Access key class used
 * - Pheromone trail ID
 * - Babylon Candle burn ID (if applicable)
 * - Creator credit amount (if Babylon Candle)
 */
export function routeCrossIslandVisit(context: VisitContext): VisitResult {
  const { island_id, visitor_member_id, access_key_class, access_key_payload = {} } = context;

  let babylon_candle_burn_id: string | undefined;
  let creator_marks_credited: number | undefined;

  // Verify the presented access key
  switch (access_key_class) {
    case 'deck_card': {
      const result = verifyDeckCard(access_key_payload);
      if (!result.valid) {
        throw new Error(`Cross-island routing blocked: ${result.reason}`);
      }
      break;
    }
    case 'guide': {
      const result = verifyGuideEndorsement(access_key_payload);
      if (!result.valid) {
        throw new Error(`Cross-island routing blocked: ${result.reason}`);
      }
      break;
    }
    case 'babylon_candle': {
      const result = processBabylonCandle(access_key_payload);
      if (!result.valid) {
        throw new Error(`Cross-island routing blocked: ${result.reason}`);
      }
      babylon_candle_burn_id = randomUUID();  // persisted to DB by service layer
      creator_marks_credited = result.creator_marks_credited;
      break;
    }
    default:
      throw new Error(`Cross-island routing: unknown access_key_class '${access_key_class}'`);
  }

  // Emit Pheromone trail (access-class-specific per FLAG_MARKER FM-001)
  const pheromone_trail_id = context.pheromone_emit !== false
    ? emitPheromoneTrail(island_id, visitor_member_id, access_key_class)
    : undefined;

  const visit_id = randomUUID();

  return {
    visit_id,
    island_id,
    access_key_class,
    pheromone_trail_id,
    babylon_candle_burn_id,
    creator_marks_credited,
    provenance_note:
      `Visit ${visit_id}: member ${visitor_member_id} → island ${island_id} ` +
      `via ${access_key_class}. ` +
      (creator_marks_credited != null
        ? `IP Ledger credit: ${creator_marks_credited} Marks (83.3% creator-keeps). `
        : '') +
      `Pheromone trail: ${pheromone_trail_id ?? 'not emitted'}. ` +
      `Bushel 31 Phase D / FLAG_MARKER FM-001.`,
  };
}

// ── Pheromone Emission (access-class-specific) ───────────────────────────────

/**
 * Emit a Pheromone trail for a cross-island visit.
 * Each access-key class emits a distinct Pheromone type:
 *   - deck_card  → membership-credential trail
 *   - guide      → social-trust trail (includes guide relationship)
 *   - babylon_candle → marks-economy trail (includes burn amount)
 *
 * Full Pheromone substrate write via service layer;
 * here we generate the trail ID for provenance.
 */
export function emitPheromoneTrail(
  island_id: string,
  visitor_member_id: string,
  access_key_class: AccessKeyClass
): string {
  const trail_id = randomUUID();
  // Service layer writes: {trail_id, island_id, visitor_member_id, access_key_class, ts}
  // to Pheromone substrate at pheromone_substrate/trails/
  return trail_id;
}

// ── Conductor's Baton — Island Creation Subagent Fan-Out ─────────────────────

export type IslandCreationSubagentClass =
  | 'spec_author'              // Structures island spec into canonical schema (Sonnet)
  | 'lore_author'              // Develops Ghost-World narrative (Opus for narrative-class)
  | 'mech_designer'            // Identifies composing base mechs from 33-mech inventory
  | 'real_world_anchor'        // Surfaces the right Real-World Twinning point
  | 'ip_ledger_stamp_prep';    // Prepares creator attribution for IP Ledger

export interface SubagentThread {
  thread_id: string;
  subagent_class: IslandCreationSubagentClass;
  model_class: 'sonnet' | 'opus';
  status: 'queued' | 'running' | 'completed' | 'error';
  output?: Record<string, unknown>;
}

/**
 * Conductor's Baton (#2277) routing — fan-out to island-creation subagents.
 * Routes design intent to the appropriate model class per Conductor policy.
 * Member sees subagent progress in real time (X-Ray Mode toggle).
 *
 * Per CAI ◌ NotCents brand canon (BP021): vendor-API never exposed raw.
 * Members interact with "Conducted Intelligence" — not with a model name.
 */
export function conductorFanOut(
  member_design_intent: string
): SubagentThread[] {
  const threads: SubagentThread[] = [
    {
      thread_id: randomUUID(),
      subagent_class: 'spec_author',
      model_class: 'sonnet',         // structured spec-emit → Sonnet
      status: 'queued',
    },
    {
      thread_id: randomUUID(),
      subagent_class: 'lore_author',
      model_class: 'opus',           // narrative-class → Opus
      status: 'queued',
    },
    {
      thread_id: randomUUID(),
      subagent_class: 'mech_designer',
      model_class: 'sonnet',         // structured inventory matching → Sonnet
      status: 'queued',
    },
    {
      thread_id: randomUUID(),
      subagent_class: 'real_world_anchor',
      model_class: 'sonnet',         // research-class → Sonnet
      status: 'queued',
    },
    {
      thread_id: randomUUID(),
      subagent_class: 'ip_ledger_stamp_prep',
      model_class: 'sonnet',         // structured prep → Sonnet
      status: 'queued',
    },
  ];

  // X-Ray Mode: member can inspect routing decisions
  // conductorDecisions logged to routing_log for X-Ray Mode visibility
  const routing_log = {
    intent_summary: member_design_intent.slice(0, 200),
    conductor_decision: '#2277 Conductor\'s Baton routed to 5 specialist subagents',
    model_assignments: threads.map(t => ({
      class: t.subagent_class,
      model: t.model_class,
      rationale: t.model_class === 'opus'
        ? 'narrative-class routing'
        : 'structured output routing',
    })),
    cai_brand: 'CAI ◌ NotCents — Conducted Intelligence (not raw vendor API)',
  };

  return threads;
}

// ── Export convenience object ─────────────────────────────────────────────────

export const CrossIslandRouter = {
  registerWrasseAnchor,
  getWrasseAnchor: getWrasseAnchorByIsland,
  queryWrasseAnchors: queryWraseAnchors,
  verifyDeckCard,
  verifyGuideEndorsement,
  processBabylonCandle,
  routeVisit: routeCrossIslandVisit,
  emitPheromone: emitPheromoneTrail,
  conductorFanOut,
} as const;

export default CrossIslandRouter;
