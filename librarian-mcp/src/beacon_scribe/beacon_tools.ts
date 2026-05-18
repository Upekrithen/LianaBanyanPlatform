/**
 * Beacon Scribe — 6 MCP tool implementations (BP046)
 * ====================================================
 * Tools: beacon_drop, beacon_list, beacon_query, beacon_compose,
 *        beacon_expire, beacon_intersect_chronos
 *
 * All tools follow the existing librarian MCP pattern (registered in server.ts
 * via registerTool). This module exports pure handler functions + Zod schemas.
 *
 * Spec: KNIGHT_IMPLEMENTATION_BEACON_SCRIBE_OPERATIONAL_SPEC_BP046.md §3–§9
 */

import { z } from "zod";
import { readdirSync, statSync, writeFileSync, mkdirSync } from "fs";
import { join, resolve as resolvePath, dirname } from "path";
import {
  getDb,
  newUUID,
  isValidSlug,
  resolveMarkerType,
  rowToBeacon,
  logAudit,
  runDaySeed,
  type AppliedBy,
  type EntityRef,
  type Beacon,
} from "./beacon_db.js";

// ─── Shared Zod schemas ──────────────────────────────────────────────────────

export const EntityRefSchema = z.object({
  entity_class: z
    .enum(["eblet", "tablet", "stone_tablet", "utterance", "raw_substrate"])
    .describe("Class of the entity being tagged"),
  entity_id: z
    .string()
    .min(1)
    .describe("Path or UUID of the entity (absolute path or UUID)"),
});

export const AppliedBySchema = z
  .enum(["founder", "bishop", "knight", "pawn", "rook", "auto_scribe"])
  .describe("Who is dropping this Beacon");

// ─── beacon_drop ─────────────────────────────────────────────────────────────

export const BeaconDropSchema = {
  marker_type: z
    .string()
    .min(1)
    .describe(
      "Beacon type slug (kebab-case). Alias-resolved automatically. Examples: golden-key-puzzle, strain-canon"
    ),
  applied_to: z
    .array(EntityRefSchema)
    .min(1)
    .describe("Entities to tag with this Beacon (min 1)"),
  applied_by: AppliedBySchema,
  description: z
    .string()
    .max(500)
    .optional()
    .describe("Optional prose description (≤500 chars)"),
  expires_at: z
    .string()
    .optional()
    .describe("Optional ISO8601 expiry timestamp; NULL = active-forever"),
  compose_with: z
    .array(z.string().uuid())
    .optional()
    .describe("Optional beacon_ids to compose with"),
  attributes: z
    .record(z.unknown())
    .optional()
    .describe("Optional sub-category attributes map"),
  ratified_by: z
    .enum(["founder", "bishop_pref", "auto"])
    .optional()
    .describe("Ratification status (default: null = unratified scaffold)"),
};

export interface BeaconDropResult {
  beacon_id: string;
  marker_type: string;
  applied_at: string;
}

export function handleBeaconDrop(args: {
  marker_type: string;
  applied_to: EntityRef[];
  applied_by: AppliedBy;
  description?: string;
  expires_at?: string;
  compose_with?: string[];
  attributes?: Record<string, unknown>;
  ratified_by?: "founder" | "bishop_pref" | "auto";
}): BeaconDropResult {
  ensureSeedRun();

  const markerType = resolveMarkerType(args.marker_type);
  if (!isValidSlug(markerType)) {
    throw new Error(
      `INVALID_MARKER_TYPE: "${markerType}" is not a valid kebab-case slug`
    );
  }
  if (!args.applied_to || args.applied_to.length === 0) {
    throw new Error(
      "EMPTY_APPLIED_TO: applied_to must contain at least one entity reference"
    );
  }

  const db = getDb();
  const id = newUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO beacons
      (beacon_id, marker_type, applied_to, applied_at, applied_by, expires_at,
       compose_with, description, ratified_by, attributes, superseded_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)
  `).run(
    id,
    markerType,
    JSON.stringify(args.applied_to),
    now,
    args.applied_by,
    args.expires_at ?? null,
    JSON.stringify(args.compose_with ?? []),
    args.description ?? null,
    args.ratified_by ?? null,
    args.attributes ? JSON.stringify(args.attributes) : null,
    now
  );

  if (args.compose_with && args.compose_with.length > 0) {
    for (const siblingId of args.compose_with) {
      addComposeEdge(db, id, siblingId);
    }
  }

  logAudit(id, "drop", { marker_type: markerType, applied_by: args.applied_by });
  emitChronosEvent(id, markerType, args.applied_to.length);

  return { beacon_id: id, marker_type: markerType, applied_at: now };
}

// ─── beacon_list ─────────────────────────────────────────────────────────────

export const BeaconListSchema = {
  marker_type: z
    .string()
    .optional()
    .describe("Filter by marker_type (alias-resolved)"),
  applied_to: EntityRefSchema.optional().describe(
    "Filter by a specific entity reference"
  ),
  applied_by: AppliedBySchema.optional().describe("Filter by who dropped it"),
  active_only: z
    .boolean()
    .optional()
    .default(true)
    .describe("Default true: exclude superseded + expired"),
  limit: z.number().int().min(1).max(500).optional().default(100),
  offset: z.number().int().min(0).optional().default(0),
};

export interface BeaconListResult {
  beacons: Beacon[];
  total_count: number;
}

export function handleBeaconList(args: {
  marker_type?: string;
  applied_to?: EntityRef;
  applied_by?: AppliedBy;
  active_only?: boolean;
  limit?: number;
  offset?: number;
}): BeaconListResult {
  ensureSeedRun();
  const db = getDb();
  const activeOnly = args.active_only !== false;
  const limit = args.limit ?? 100;
  const offset = args.offset ?? 0;

  const clauses: string[] = [];
  const params: unknown[] = [];

  if (args.marker_type) {
    clauses.push("marker_type = ?");
    params.push(resolveMarkerType(args.marker_type));
  }
  if (args.applied_by) {
    clauses.push("applied_by = ?");
    params.push(args.applied_by);
  }
  if (activeOnly) {
    clauses.push(
      "(superseded_by IS NULL AND (expires_at IS NULL OR expires_at > ?))"
    );
    params.push(new Date().toISOString());
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const allRows = db
    .prepare(`SELECT * FROM beacons ${where} ORDER BY applied_at DESC`)
    .all(...params) as Record<string, unknown>[];

  let filtered = allRows;
  if (args.applied_to) {
    const { entity_class, entity_id } = args.applied_to;
    filtered = allRows.filter((r) => {
      const arr: EntityRef[] = JSON.parse((r.applied_to as string) || "[]");
      return arr.some(
        (e) => e.entity_class === entity_class && e.entity_id === entity_id
      );
    });
  }

  const total_count = filtered.length;
  const page = filtered.slice(offset, offset + limit).map(rowToBeacon);
  return { beacons: page, total_count };
}

// ─── beacon_query ────────────────────────────────────────────────────────────

export const BeaconQuerySchema = {
  marker_type: z
    .string()
    .min(1)
    .describe(
      "marker_type to query (alias-resolved). Returns all tagged entities."
    ),
  active_only: z
    .boolean()
    .optional()
    .default(true)
    .describe("Default true: exclude superseded + expired"),
};

export interface BeaconQueryResult {
  entities: EntityRef[];
  beacon_count: number;
}

export function handleBeaconQuery(args: {
  marker_type: string;
  active_only?: boolean;
}): BeaconQueryResult {
  ensureSeedRun();
  const db = getDb();
  const markerType = resolveMarkerType(args.marker_type);
  const activeOnly = args.active_only !== false;
  const now = new Date().toISOString();

  let rows: Record<string, unknown>[];
  if (activeOnly) {
    rows = db
      .prepare(
        "SELECT applied_to FROM beacons WHERE marker_type = ? AND superseded_by IS NULL AND (expires_at IS NULL OR expires_at > ?)"
      )
      .all(markerType, now) as Record<string, unknown>[];
  } else {
    rows = db
      .prepare("SELECT applied_to FROM beacons WHERE marker_type = ?")
      .all(markerType) as Record<string, unknown>[];
  }

  const seen = new Set<string>();
  const entities: EntityRef[] = [];
  for (const r of rows) {
    const arr: EntityRef[] = JSON.parse((r.applied_to as string) || "[]");
    for (const e of arr) {
      const key = `${e.entity_class}::${e.entity_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        entities.push(e);
      }
    }
  }

  return { entities, beacon_count: rows.length };
}

// ─── beacon_compose ──────────────────────────────────────────────────────────

export const BeaconComposeSchema = {
  beacon_id_a: z.string().uuid().describe("First beacon UUID"),
  beacon_id_b: z.string().uuid().describe("Second beacon UUID"),
};

export interface BeaconComposeResult {
  beacon_id_a: string;
  beacon_id_b: string;
  composed: boolean;
}

export function handleBeaconCompose(args: {
  beacon_id_a: string;
  beacon_id_b: string;
}): BeaconComposeResult {
  ensureSeedRun();
  const db = getDb();

  const a = db
    .prepare("SELECT beacon_id FROM beacons WHERE beacon_id = ?")
    .get(args.beacon_id_a);
  const b = db
    .prepare("SELECT beacon_id FROM beacons WHERE beacon_id = ?")
    .get(args.beacon_id_b);
  if (!a || !b) {
    throw new Error(
      `BEACON_NOT_FOUND: one or both beacon_ids not found (${args.beacon_id_a}, ${args.beacon_id_b})`
    );
  }

  addComposeEdge(db, args.beacon_id_a, args.beacon_id_b);
  addComposeEdge(db, args.beacon_id_b, args.beacon_id_a);
  logAudit(args.beacon_id_a, "compose", { with: args.beacon_id_b });
  logAudit(args.beacon_id_b, "compose", { with: args.beacon_id_a });

  return {
    beacon_id_a: args.beacon_id_a,
    beacon_id_b: args.beacon_id_b,
    composed: true,
  };
}

function addComposeEdge(
  db: ReturnType<typeof getDb>,
  fromId: string,
  toId: string
): void {
  const row = db
    .prepare("SELECT compose_with FROM beacons WHERE beacon_id = ?")
    .get(fromId) as { compose_with: string } | undefined;
  if (!row) return;
  const existing: string[] = JSON.parse(row.compose_with || "[]");
  if (!existing.includes(toId)) {
    existing.push(toId);
    db.prepare(
      "UPDATE beacons SET compose_with = ? WHERE beacon_id = ?"
    ).run(JSON.stringify(existing), fromId);
  }
}

// ─── beacon_expire ───────────────────────────────────────────────────────────

export const BeaconExpireSchema = {
  beacon_id: z.string().uuid().describe("UUID of Beacon to expire"),
  expires_at: z
    .string()
    .optional()
    .describe("ISO8601 expiry timestamp; defaults to now()"),
  reason: z.string().optional().describe("Audit reason"),
};

export interface BeaconExpireResult {
  beacon_id: string;
  expired_at: string;
}

export function handleBeaconExpire(args: {
  beacon_id: string;
  expires_at?: string;
  reason?: string;
}): BeaconExpireResult {
  ensureSeedRun();
  const db = getDb();
  const expiredAt = args.expires_at ?? new Date().toISOString();

  const row = db
    .prepare("SELECT beacon_id FROM beacons WHERE beacon_id = ?")
    .get(args.beacon_id);
  if (!row) {
    throw new Error(`BEACON_NOT_FOUND: ${args.beacon_id}`);
  }

  db.prepare("UPDATE beacons SET expires_at = ? WHERE beacon_id = ?").run(
    expiredAt,
    args.beacon_id
  );
  logAudit(args.beacon_id, "expire", {
    expires_at: expiredAt,
    reason: args.reason,
  });

  return { beacon_id: args.beacon_id, expired_at: expiredAt };
}

// ─── beacon_intersect_chronos ────────────────────────────────────────────────

export const BeaconIntersectChronosSchema = {
  marker_types: z
    .array(z.string().min(1))
    .min(1)
    .describe(
      "Marker types to intersect (set-AND — entity must carry ALL). Alias-resolved."
    ),
  chronos_range: z
    .object({
      from: z.string().optional().describe("ISO8601 start (inclusive)"),
      to: z.string().optional().describe("ISO8601 end (inclusive)"),
      bp_session: z
        .string()
        .optional()
        .describe(
          "BP session ID (e.g. BP046_W1) — resolves to date range via Chronos"
        ),
    })
    .describe("Chronos time-range filter"),
  active_only: z
    .boolean()
    .optional()
    .default(true)
    .describe("Exclude superseded + expired"),
};

export interface BeaconIntersectChronosResult {
  entities: EntityRef[];
  beacon_hits: number;
  chronos_hits: number;
  intersection_count: number;
}

export function handleBeaconIntersectChronos(args: {
  marker_types: string[];
  chronos_range: { from?: string; to?: string; bp_session?: string };
  active_only?: boolean;
}): BeaconIntersectChronosResult {
  ensureSeedRun();
  const db = getDb();
  const activeOnly = args.active_only !== false;
  const now = new Date().toISOString();
  const { from, to } = args.chronos_range;

  if (args.chronos_range.bp_session && !from) {
    console.error(
      `[BeaconScribe] bp_session "${args.chronos_range.bp_session}" provided; ` +
      `full Chronos date-range resolution pending integration (§8)`
    );
  }

  const resolvedTypes = args.marker_types.map(resolveMarkerType);
  let entitySets: Map<string, EntityRef>[] | null = null;
  let totalBeaconHits = 0;

  for (const mt of resolvedTypes) {
    const clauses: string[] = ["marker_type = ?"];
    const params: unknown[] = [mt];
    if (activeOnly) {
      clauses.push(
        "(superseded_by IS NULL AND (expires_at IS NULL OR expires_at > ?))"
      );
      params.push(now);
    }
    if (from) {
      clauses.push("applied_at >= ?");
      params.push(from);
    }
    if (to) {
      clauses.push("applied_at <= ?");
      params.push(to);
    }

    const rows = db
      .prepare(
        `SELECT applied_to FROM beacons WHERE ${clauses.join(" AND ")}`
      )
      .all(...params) as Record<string, unknown>[];

    totalBeaconHits += rows.length;

    const entityMap = new Map<string, EntityRef>();
    for (const r of rows) {
      const arr: EntityRef[] = JSON.parse((r.applied_to as string) || "[]");
      for (const e of arr) {
        entityMap.set(`${e.entity_class}::${e.entity_id}`, e);
      }
    }

    if (entitySets === null) {
      entitySets = [entityMap];
    } else {
      entitySets.push(entityMap);
    }
  }

  if (!entitySets || entitySets.length === 0) {
    return {
      entities: [],
      beacon_hits: 0,
      chronos_hits: 0,
      intersection_count: 0,
    };
  }

  const firstSet = entitySets[0];
  const intersection: EntityRef[] = [];
  for (const [key, entity] of firstSet) {
    if (entitySets.every((s) => s.has(key))) {
      intersection.push(entity);
    }
  }

  return {
    entities: intersection,
    beacon_hits: totalBeaconHits,
    chronos_hits: intersection.length,
    intersection_count: intersection.length,
  };
}

// ─── beacon_project (§6 stub) ────────────────────────────────────────────────

export const BeaconProjectSchema = {
  substrate_marker_type: z
    .string()
    .min(1)
    .describe("Substrate Beacon marker_type to project"),
  platform_beacon_id: z
    .string()
    .optional()
    .describe("Platform-side Beacon ID to wire to"),
  active: z.boolean().describe("Set projection_active flag"),
  projected_by: AppliedBySchema,
};

export interface BeaconProjectResult {
  substrate_marker_type: string;
  platform_beacon_id: string | null;
  projection_active: boolean;
}

export function handleBeaconProject(args: {
  substrate_marker_type: string;
  platform_beacon_id?: string;
  active: boolean;
  projected_by: AppliedBy;
}): BeaconProjectResult {
  ensureSeedRun();
  const db = getDb();
  const mt = resolveMarkerType(args.substrate_marker_type);
  const now = new Date().toISOString();

  const existing = db
    .prepare(
      "SELECT * FROM beacon_platform_projections WHERE substrate_marker_type = ?"
    )
    .get(mt);

  if (existing) {
    db.prepare(
      "UPDATE beacon_platform_projections SET projection_active = ?, platform_beacon_id = ?, projected_at = ?, projected_by = ? WHERE substrate_marker_type = ?"
    ).run(
      args.active ? 1 : 0,
      args.platform_beacon_id ?? null,
      now,
      args.projected_by,
      mt
    );
  } else {
    db.prepare(
      "INSERT INTO beacon_platform_projections (substrate_marker_type, platform_beacon_id, projection_active, projected_at, projected_by) VALUES (?, ?, ?, ?, ?)"
    ).run(mt, args.platform_beacon_id ?? null, args.active ? 1 : 0, now, args.projected_by);
  }

  return {
    substrate_marker_type: mt,
    platform_beacon_id: args.platform_beacon_id ?? null,
    projection_active: args.active,
  };
}

// ─── Backfill scan + report (§9) ────────────────────────────────────────────

interface BackfillRule {
  marker_type: string;
  description: string;
  glob_hints: string[];
  base_dirs: string[];
}

const BACKFILL_RULES: BackfillRule[] = [
  {
    marker_type: "romulator-9000",
    description: "Romulator 9000 thread",
    glob_hints: ["ROMULATOR"],
    base_dirs: ["BISHOP_DROPZONE"],
  },
  {
    marker_type: "golden-key-puzzle",
    description: "Golden Key puzzle threads",
    glob_hints: ["GOLDEN_KEY", "TREASURE_HUNT"],
    base_dirs: ["BISHOP_DROPZONE"],
  },
  {
    marker_type: "marketing-cultural-anchor",
    description: "Crown letter threads",
    glob_hints: [
      "CROWN",
      "CUNNINGHAM",
      "KIMMEL",
      "COLBERT",
      "ATTENBOROUGH",
      "HASHIMOTO",
      "NEWMARK",
    ],
    base_dirs: ["BISHOP_DROPZONE"],
  },
  {
    marker_type: "prov-amendment-pending",
    description: "Prov 20 V2 thread",
    glob_hints: ["PROV_20"],
    base_dirs: ["BISHOP_DROPZONE"],
  },
  {
    marker_type: "helena-gate-blocking",
    description: "Helena 4-Frame gate thread",
    glob_hints: ["HELENA", "SAGA_13"],
    base_dirs: ["BISHOP_DROPZONE"],
  },
  {
    marker_type: "counsel-clearance-pending",
    description: "Trademark Cluster L 13 thread",
    glob_hints: ["TRADEMARK", "CLUSTER_L"],
    base_dirs: ["BISHOP_DROPZONE"],
  },
  {
    marker_type: "pixie-dust-mining",
    description: "Pixie Dust Mining canon",
    glob_hints: ["PIXIE_DUST"],
    base_dirs: ["BISHOP_DROPZONE"],
  },
  {
    marker_type: "historical-timeline-archive",
    description: "Historical Timeline archive",
    glob_hints: ["HISTORICAL_TIMELINE"],
    base_dirs: ["BISHOP_DROPZONE", "HistoricalTimeline"],
  },
];

export interface BackfillReport {
  total_files_scanned: number;
  total_beacons_dropped: number;
  by_marker_type: Record<string, { files: string[]; beacon_ids: string[] }>;
  report_path: string;
}

export function runBackfillScan(workspaceRoot: string): BackfillReport {
  ensureSeedRun();
  const reportPath = resolvePath(
    workspaceRoot,
    "BISHOP_DROPZONE",
    "00_FOUNDER_REVIEW",
    "BEACON_BACKFILL_REPORT_BP046.md"
  );
  const report: BackfillReport = {
    total_files_scanned: 0,
    total_beacons_dropped: 0,
    by_marker_type: {},
    report_path: reportPath,
  };

  for (const rule of BACKFILL_RULES) {
    const hits: string[] = [];
    for (const baseDir of rule.base_dirs) {
      const dir = resolvePath(workspaceRoot, baseDir);
      if (!pathExists(dir)) continue;
      walkDir(dir, (filePath) => {
        const upper = filePath.toUpperCase();
        if (
          rule.glob_hints.some((hint) => upper.includes(hint)) &&
          filePath.endsWith(".md")
        ) {
          hits.push(filePath);
          report.total_files_scanned++;
        }
      });
    }

    if (hits.length === 0) continue;

    report.by_marker_type[rule.marker_type] = {
      files: hits,
      beacon_ids: [],
    };

    for (const filePath of hits) {
      try {
        const result = handleBeaconDrop({
          marker_type: rule.marker_type,
          applied_to: [{ entity_class: "eblet", entity_id: filePath }],
          applied_by: "auto_scribe",
          description: `Backfill: ${rule.description}`,
        });
        report.by_marker_type[rule.marker_type].beacon_ids.push(
          result.beacon_id
        );
        report.total_beacons_dropped++;
      } catch (e) {
        console.error(
          `[BeaconScribe] Backfill drop failed for ${filePath}: ${(e as Error).message}`
        );
      }
    }
  }

  writeBackfillReport(report);
  return report;
}

function pathExists(p: string): boolean {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}

function walkDir(dir: string, cb: (filePath: string) => void): void {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(full, cb);
      } else if (entry.isFile()) {
        cb(full);
      }
    }
  } catch {
    // permission or path errors — skip silently
  }
}

function writeBackfillReport(report: BackfillReport): void {
  const dir = dirname(report.report_path);
  try {
    mkdirSync(dir, { recursive: true });
    const lines: string[] = [
      "# Beacon Backfill Report — BP046",
      "",
      `Generated: ${new Date().toISOString()}`,
      "",
      `**Total files scanned:** ${report.total_files_scanned}  `,
      `**Total Beacons dropped:** ${report.total_beacons_dropped}  `,
      "",
      "## Per Marker-Type",
      "",
    ];
    for (const [mt, data] of Object.entries(report.by_marker_type)) {
      lines.push(`### \`${mt}\``);
      lines.push(
        `${data.beacon_ids.length} Beacons dropped (ratified_by: null — Founder ratify pass pending)`
      );
      lines.push("");
      lines.push("**Files:**");
      for (const f of data.files) {
        lines.push(`- \`${f}\``);
      }
      lines.push("");
    }
    lines.push("---");
    lines.push(
      "*Founder ratify pass: review beacon_ids above and call `beacon_expire` or set ratified_by=founder per Beacon.*"
    );
    writeFileSync(report.report_path, lines.join("\n"), "utf-8");
  } catch (e) {
    console.error(
      `[BeaconScribe] Failed to write backfill report: ${(e as Error).message}`
    );
  }
}

// ─── Seed guard (lazy once-per-process) ─────────────────────────────────────

let _seedRan = false;
function ensureSeedRun(): void {
  if (_seedRan) return;
  try {
    runDaySeed();
  } catch (e) {
    console.error(
      `[BeaconScribe] Seed run failed (non-fatal): ${(e as Error).message}`
    );
  }
  _seedRan = true;
}

// ─── Chronos cross-ref event emit (§8 stub) ──────────────────────────────────

function emitChronosEvent(
  beaconId: string,
  markerType: string,
  appliedToCount: number
): void {
  // Stub: logs to beacon_audit_log as cross-ref until Chronos exposes a write API.
  // Full integration: write to Chronos JSONL store with event_type=beacon_dropped.
  try {
    logAudit(beaconId, "chronos_xref", {
      event_type: "beacon_dropped",
      marker_type: markerType,
      applied_to_count: appliedToCount,
      ts: new Date().toISOString(),
    });
  } catch {
    // non-fatal
  }
}
