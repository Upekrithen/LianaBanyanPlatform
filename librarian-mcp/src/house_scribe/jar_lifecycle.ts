/**
 * House Scribe Jar Lifecycle State Machine — KN-J1 / BP017
 * =========================================================
 * Long-term archive keeper at population-scale.
 * Manages the 4-state Jar of Honey lifecycle:
 *   created → indexed → sealed → retrievable
 *
 * Cathedral-prefixed serial: HS subclass (House Scribe)
 *   bishop: LB-BISHOP.HS-NNNN
 *   knight: LB-KNIGHT.HS-NNNN
 *   pawn:   LB-PAWN.HS-NNNN
 *
 * Jar sealing is STRUCTURALLY-IMMUTABLE (forever-stamp class):
 *   - No mutation after sealed state
 *   - Composes with FORK doctrine: sealed Jars cannot be fiat-converted
 *   - Chronos HMAC computed at seal time
 *
 * Pixie Dust events (per Pixie Dust canon BP017 turn 30):
 *   - Jar creation = Layer 6 Pixie Dust event
 *   - Jar sealing = Pixie Dust event emitted to Pheromone substrate
 *
 * Composes with:
 *   KN104 provenance_chain.ts (5e7f540) — Cathedral-prefixed serial + HMAC
 *   KN-D3 Hive-thread state machine — closure triggers Jar creation
 *   KN-J2 (8-digit grid) — provides coordinate for indexed state
 *   Pheromone substrate (#2317 B128) — Pixie Dust write-events
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createHmac, randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname_hs = dirname(__filename);

// ─── Paths ────────────────────────────────────────────────────────────────────

const STITCHPUNKS_DIR = resolve(__dirname_hs, "../../stitchpunks");
const HS_DIR = resolve(STITCHPUNKS_DIR, "house_scribe");
export const JARS_LEDGER = resolve(HS_DIR, "jars_ledger.jsonl");
const HS_SERIAL_COUNTER = resolve(HS_DIR, "hs_serial_counters.json");

function ensureHsDir(): void {
  if (!existsSync(HS_DIR)) mkdirSync(HS_DIR, { recursive: true });
}

// ─── Cathedral code mapping for HS serial ─────────────────────────────────────

const HS_CATHEDRAL_CODE: Record<string, string> = {
  bishop:  "BISHOP",
  knight:  "KNIGHT",
  pawn:    "PAWN",
  rook:    "ROOK",
  cross:   "CROSS",
};

interface HsSerialCounters {
  [key: string]: number;
}

function readHsCounters(): HsSerialCounters {
  ensureHsDir();
  if (!existsSync(HS_SERIAL_COUNTER)) return {};
  try {
    return JSON.parse(readFileSync(HS_SERIAL_COUNTER, "utf-8")) as HsSerialCounters;
  } catch {
    return {};
  }
}

/**
 * Allocate next HS serial for a cathedral.
 * Format: LB-<CATHEDRAL>.HS-NNNN
 * Example: LB-BISHOP.HS-0042
 */
export function allocateHsSerial(cathedral: string): string {
  ensureHsDir();
  const counters = readHsCounters();
  const code = HS_CATHEDRAL_CODE[cathedral] ?? "CROSS";
  const key = `hs_${cathedral}`;
  const next = (counters[key] ?? 0) + 1;
  counters[key] = next;
  writeFileSync(HS_SERIAL_COUNTER, JSON.stringify(counters, null, 2), "utf-8");
  return `LB-${code}.HS-${String(next).padStart(4, "0")}`;
}

// ─── Chronos HMAC ─────────────────────────────────────────────────────────────

export function computeJarHmac(jarId: string, sealedAt: string): string {
  const key = `lb-hs-chronos-${sealedAt.slice(0, 10)}`;
  return createHmac("sha256", key).update(`${jarId}::${sealedAt}`).digest("hex").slice(0, 16);
}

// ─── Jar of Honey schema ──────────────────────────────────────────────────────

export type JarState = "created" | "indexed" | "sealed" | "retrievable";

export type ContentType =
  | "synthesis"
  | "comb_artifact"
  | "royal_jelly_class"
  | "innovation_corpus"
  | "session_archive"
  | "detective_finding";

export type CohortMinimum =
  | "lone_wolf"
  | "pied_piper_tier_1"
  | "federation_member"
  | "excalibur_subscriber"
  | "thirteenth_warrior";

export interface JarOfHoney {
  jar_id: string;                          // UUID v4
  cathedral_prefixed_serial: string;       // LB-<CAT>.HS-NNNN (assigned at seal)
  chronos_hmac: string;                    // tamper-evidence (computed at seal)

  // Lifecycle
  state: JarState;
  created_at: string;                      // ISO 8601 — Hive-thread closure ts
  indexed_at: string | null;               // when coordinate assigned
  sealed_at: string | null;               // forever-stamp timestamp
  retrievable_at: string | null;

  // Provenance
  cathedral: string;                       // bishop / knight / pawn / rook
  source_hive_thread_id: string;          // Apiarist Hive thread that closed
  contributing_members: string[];         // member IDs
  queen_member_id: string | null;         // thread Queen at closure

  // 8-digit-grid coordinate (per KN-J2)
  coordinate: string | null;             // e.g., "04-05-03-17"

  // Content
  content_type: ContentType;
  content_summary: string;               // human-readable summary (max 500 chars)
  content_blob_pointer: string;          // pointer to actual content
  excalibur_class_eligible: boolean;     // can be promoted to Excalibur Class (Layer 5)

  // Access control
  read_cohort_minimum: CohortMinimum;
  write_cohort_minimum: CohortMinimum;

  // Pixie Dust layer position
  layer: 6;                              // Layer 6 Jars of Honey (between Layer 5 Excalibur + Layer 7 Codex)
}

// ─── Jar event log (for Pixie Dust + audit) ───────────────────────────────────

export interface JarEvent {
  event_id: string;
  jar_id: string;
  event_type: "jar_created" | "jar_indexed" | "jar_sealed" | "jar_retrieved" | "jar_mutation_rejected";
  timestamp: string;
  cathedral: string;
  detail?: string;
}

// ─── Jar creation ─────────────────────────────────────────────────────────────

export interface CreateJarOpts {
  cathedral: string;
  source_hive_thread_id: string;
  contributing_members?: string[];
  queen_member_id?: string;
  content_type: ContentType;
  content_summary: string;
  content_blob_pointer: string;
  excalibur_class_eligible?: boolean;
  read_cohort_minimum?: CohortMinimum;
  write_cohort_minimum?: CohortMinimum;
}

export interface CreateJarResult {
  success: boolean;
  jar: JarOfHoney | null;
  error?: string;
}

/**
 * Create a new Jar of Honey in `created` state.
 * Triggered by Hive-thread closure (KN-D3 `closed` state transition).
 */
export function createJar(opts: CreateJarOpts): CreateJarResult {
  ensureHsDir();

  try {
    const jar_id = randomUUID();
    const created_at = new Date().toISOString();

    const jar: JarOfHoney = {
      jar_id,
      cathedral_prefixed_serial: "", // assigned at seal
      chronos_hmac: "",              // computed at seal
      state: "created",
      created_at,
      indexed_at: null,
      sealed_at: null,
      retrievable_at: null,
      cathedral: opts.cathedral,
      source_hive_thread_id: opts.source_hive_thread_id,
      contributing_members: opts.contributing_members ?? [],
      queen_member_id: opts.queen_member_id ?? null,
      coordinate: null,
      content_type: opts.content_type,
      content_summary: (opts.content_summary ?? "").slice(0, 500),
      content_blob_pointer: opts.content_blob_pointer,
      excalibur_class_eligible: opts.excalibur_class_eligible ?? true,
      read_cohort_minimum: opts.read_cohort_minimum ?? "lone_wolf",
      write_cohort_minimum: opts.write_cohort_minimum ?? "federation_member",
      layer: 6,
    };

    appendFileSync(JARS_LEDGER, JSON.stringify(jar) + "\n", "utf-8");

    // Log Pixie Dust creation event
    const evt: JarEvent = {
      event_id: randomUUID(),
      jar_id,
      event_type: "jar_created",
      timestamp: created_at,
      cathedral: opts.cathedral,
      detail: `Created from Hive-thread ${opts.source_hive_thread_id}`,
    };
    logJarEvent(evt);

    return { success: true, jar };
  } catch (err) {
    // BRIDLE Rule 4: halt + flag on creation failure
    return { success: false, jar: null, error: String(err) };
  }
}

// ─── Jar indexing (coordinate assignment from KN-J2) ─────────────────────────

export interface IndexJarResult {
  success: boolean;
  jar: JarOfHoney | null;
  error?: string;
}

export function indexJar(jar_id: string, coordinate: string): IndexJarResult {
  const jars = readAllJars();
  const idx = jars.findIndex((j) => j.jar_id === jar_id);

  if (idx === -1) return { success: false, jar: null, error: `Jar ${jar_id} not found` };

  const jar = jars[idx];
  if (jar.state !== "created") {
    return {
      success: false,
      jar,
      error: `Jar ${jar_id} is in state '${jar.state}' — can only index from 'created' state`,
    };
  }

  const indexed_at = new Date().toISOString();
  const updated: JarOfHoney = { ...jar, state: "indexed", coordinate, indexed_at };
  jars[idx] = updated;
  rewriteJarsLedger(jars);

  logJarEvent({
    event_id: randomUUID(),
    jar_id,
    event_type: "jar_indexed",
    timestamp: indexed_at,
    cathedral: jar.cathedral,
    detail: `Coordinate assigned: ${coordinate}`,
  });

  return { success: true, jar: updated };
}

// ─── Jar sealing (forever-stamp — STRUCTURALLY-IMMUTABLE) ────────────────────

export interface SealJarResult {
  success: boolean;
  jar: JarOfHoney | null;
  serial?: string;
  hmac?: string;
  error?: string;
}

/**
 * Seal a Jar — finalizes provenance, assigns Cathedral-prefixed serial + HMAC.
 * STRUCTURALLY-IMMUTABLE after this point. Mutation attempts are REJECTED.
 * Requires jar to be in `indexed` state (coordinate must be assigned).
 */
export function sealJar(jar_id: string): SealJarResult {
  const jars = readAllJars();
  const idx = jars.findIndex((j) => j.jar_id === jar_id);

  if (idx === -1) return { success: false, jar: null, error: `Jar ${jar_id} not found` };

  const jar = jars[idx];

  // BRIDLE Rule 4: must have coordinate before sealing
  if (jar.state !== "indexed") {
    return {
      success: false,
      jar,
      error: `Jar ${jar_id} is in state '${jar.state}' — must be 'indexed' before sealing`,
    };
  }

  if (!jar.coordinate) {
    return {
      success: false,
      jar,
      error: `Jar ${jar_id} has no coordinate — run indexJar first`,
    };
  }

  const sealed_at = new Date().toISOString();
  const serial = allocateHsSerial(jar.cathedral);
  const hmac = computeJarHmac(jar_id, sealed_at);

  const sealed: JarOfHoney = {
    ...jar,
    state: "sealed",
    sealed_at,
    retrievable_at: sealed_at,
    cathedral_prefixed_serial: serial,
    chronos_hmac: hmac,
  };

  // Transition to `retrievable` immediately (sealed = retrievable for read-side)
  const retrievable: JarOfHoney = { ...sealed, state: "retrievable" };
  jars[idx] = retrievable;
  rewriteJarsLedger(jars);

  logJarEvent({
    event_id: randomUUID(),
    jar_id,
    event_type: "jar_sealed",
    timestamp: sealed_at,
    cathedral: jar.cathedral,
    detail: `Serial: ${serial} | HMAC: ${hmac}`,
  });

  return { success: true, jar: retrievable, serial, hmac };
}

// ─── Mutation guard (STRUCTURALLY-IMMUTABLE enforcement) ─────────────────────

export interface MutationResult {
  allowed: boolean;
  reason: string;
}

/**
 * Check whether a mutation is allowed.
 * SEALED / RETRIEVABLE jars are structurally-immutable — no mutation allowed.
 */
export function checkMutationAllowed(jar: JarOfHoney): MutationResult {
  if (jar.state === "sealed" || jar.state === "retrievable") {
    logJarEvent({
      event_id: randomUUID(),
      jar_id: jar.jar_id,
      event_type: "jar_mutation_rejected",
      timestamp: new Date().toISOString(),
      cathedral: jar.cathedral,
      detail: `Mutation rejected — Jar is in '${jar.state}' state (forever-stamp class). STRUCTURALLY-IMMUTABLE.`,
    });
    return {
      allowed: false,
      reason: `Jar ${jar.jar_id} is SEALED (forever-stamp). Mutation is STRUCTURALLY-IMMUTABLE — rejected. ` +
        "Per FORK doctrine: sealed Jars cannot be altered or cash-out-converted. " +
        "If correction is needed, create a new Jar with corrected content.",
    };
  }
  return { allowed: true, reason: "Jar is in mutable state" };
}

// ─── Cohort-class access control ─────────────────────────────────────────────

const COHORT_RANK: Record<CohortMinimum, number> = {
  lone_wolf: 1,
  pied_piper_tier_1: 2,
  federation_member: 3,
  excalibur_subscriber: 4,
  thirteenth_warrior: 5,
};

/**
 * Verify cohort-class access for a given operation.
 * Returns true if requester's cohort meets the Jar's minimum requirement.
 */
export function verifyCohortAccess(
  jar: JarOfHoney,
  requester_cohort: CohortMinimum,
  operation: "read" | "write"
): { allowed: boolean; reason: string } {
  const minRequired = operation === "read"
    ? jar.read_cohort_minimum
    : jar.write_cohort_minimum;
  const requesterRank = COHORT_RANK[requester_cohort] ?? 0;
  const requiredRank = COHORT_RANK[minRequired] ?? 0;

  if (requesterRank < requiredRank) {
    return {
      allowed: false,
      reason: `${operation} access denied. Jar requires '${minRequired}' cohort; requester is '${requester_cohort}'. ` +
        "Access control per KN-J1 Phase B2.",
    };
  }
  return { allowed: true, reason: "Access granted" };
}

// ─── Query jars ───────────────────────────────────────────────────────────────

export interface JarQuery {
  state?: JarState;
  cathedral?: string;
  coordinate?: string;
  content_type?: ContentType;
  excalibur_eligible?: boolean;
  requester_cohort?: CohortMinimum;
  limit?: number;
}

export function queryJars(query: JarQuery = {}): JarOfHoney[] {
  const all = readAllJars();
  const limit = query.limit ?? 100;

  return all
    .filter((jar) => {
      if (query.state && jar.state !== query.state) return false;
      if (query.cathedral && jar.cathedral !== query.cathedral) return false;
      if (query.coordinate && jar.coordinate !== query.coordinate) return false;
      if (query.content_type && jar.content_type !== query.content_type) return false;
      if (query.excalibur_eligible !== undefined && jar.excalibur_class_eligible !== query.excalibur_eligible) return false;
      if (query.requester_cohort) {
        const access = verifyCohortAccess(jar, query.requester_cohort, "read");
        if (!access.allowed) return false;
      }
      return true;
    })
    .slice(0, limit);
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function readAllJars(): JarOfHoney[] {
  ensureHsDir();
  if (!existsSync(JARS_LEDGER)) return [];
  try {
    const raw = readFileSync(JARS_LEDGER, "utf-8");
    return raw
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as JarOfHoney);
  } catch {
    return [];
  }
}

function rewriteJarsLedger(jars: JarOfHoney[]): void {
  ensureHsDir();
  writeFileSync(JARS_LEDGER, jars.map((j) => JSON.stringify(j)).join("\n") + "\n", "utf-8");
}

// ─── Event log ────────────────────────────────────────────────────────────────

const EVENTS_LOG = resolve(HS_DIR, "jar_events.jsonl");

export function logJarEvent(evt: JarEvent): void {
  ensureHsDir();
  try {
    appendFileSync(EVENTS_LOG, JSON.stringify(evt) + "\n", "utf-8");
  } catch {
    // BRIDLE Rule 4: event log failure is non-fatal but flagged
    console.error(`[HouseScribe] Failed to log jar event: ${evt.event_type} for ${evt.jar_id}`);
  }
}

export function readJarEvents(jar_id?: string): JarEvent[] {
  if (!existsSync(EVENTS_LOG)) return [];
  try {
    const raw = readFileSync(EVENTS_LOG, "utf-8");
    const events = raw
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as JarEvent);
    return jar_id ? events.filter((e) => e.jar_id === jar_id) : events;
  } catch {
    return [];
  }
}
