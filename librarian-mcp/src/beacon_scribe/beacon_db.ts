/**
 * Beacon Scribe — SQLite persistence layer (BP046)
 * =================================================
 * Implements the beacons + beacon_aliases + beacon_platform_projections tables
 * using better-sqlite3 (accessed via createRequire for ESM compatibility).
 *
 * Storage: C:\Users\Administrator\.claude\state\beacons\beacons.sqlite
 * Schema: append-only supersede semantics (never hard-delete semantic fields).
 * Spec: KNIGHT_IMPLEMENTATION_BEACON_SCRIBE_OPERATIONAL_SPEC_BP046.md §1–§2
 */

import { createRequire } from "module";
import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import { homedir } from "os";

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BetterSQLite3: any = require("better-sqlite3");

// ─── Path constants ─────────────────────────────────────────────────────────

export const BEACONS_DIR = resolve(homedir(), ".claude", "state", "beacons");
export const BEACONS_DB_PATH = resolve(BEACONS_DIR, "beacons.sqlite");
export const BEACONS_SNAPSHOTS_DIR = resolve(BEACONS_DIR, "snapshots");

// ─── Types ───────────────────────────────────────────────────────────────────

export type AppliedBy =
  | "founder"
  | "bishop"
  | "knight"
  | "pawn"
  | "rook"
  | "auto_scribe";

export type RatifiedBy = "founder" | "bishop_pref" | "auto" | null;

export interface EntityRef {
  entity_class:
    | "eblet"
    | "tablet"
    | "stone_tablet"
    | "utterance"
    | "raw_substrate";
  entity_id: string;
}

export interface Beacon {
  beacon_id: string;
  marker_type: string;
  applied_to: EntityRef[];
  applied_at: string;
  applied_by: AppliedBy;
  expires_at: string | null;
  compose_with: string[];
  description: string | null;
  ratified_by: RatifiedBy;
  attributes: Record<string, unknown> | null;
  superseded_by: string | null;
  created_at: string;
}

export interface BeaconAlias {
  alias: string;
  canonical_marker_type: string;
  created_by: AppliedBy;
  created_at: string;
}

// ─── DB singleton ────────────────────────────────────────────────────────────

let _db: ReturnType<typeof BetterSQLite3> | null = null;

export function getDb(): ReturnType<typeof BetterSQLite3> {
  if (_db) return _db;
  mkdirSync(BEACONS_DIR, { recursive: true });
  mkdirSync(BEACONS_SNAPSHOTS_DIR, { recursive: true });
  _db = new BetterSQLite3(BEACONS_DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initSchema(_db);
  return _db;
}

// ─── Schema init (idempotent) ────────────────────────────────────────────────

function initSchema(db: ReturnType<typeof BetterSQLite3>): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS beacons (
      beacon_id      TEXT PRIMARY KEY NOT NULL,
      marker_type    TEXT NOT NULL,
      applied_to     TEXT NOT NULL DEFAULT '[]',   -- JSON array of EntityRef
      applied_at     TEXT NOT NULL,
      applied_by     TEXT NOT NULL,
      expires_at     TEXT,
      compose_with   TEXT NOT NULL DEFAULT '[]',   -- JSON array of UUIDs
      description    TEXT,
      ratified_by    TEXT,
      attributes     TEXT,                          -- JSON object
      superseded_by  TEXT,
      created_at     TEXT NOT NULL,
      FOREIGN KEY (superseded_by) REFERENCES beacons(beacon_id)
    );

    CREATE INDEX IF NOT EXISTS idx_beacons_marker_type  ON beacons(marker_type);
    CREATE INDEX IF NOT EXISTS idx_beacons_applied_at   ON beacons(applied_at);
    CREATE INDEX IF NOT EXISTS idx_beacons_applied_by   ON beacons(applied_by);
    CREATE INDEX IF NOT EXISTS idx_beacons_ratified_by  ON beacons(ratified_by);
    CREATE INDEX IF NOT EXISTS idx_beacons_superseded_by ON beacons(superseded_by);
    CREATE INDEX IF NOT EXISTS idx_beacons_expires_at   ON beacons(expires_at)
      WHERE expires_at IS NOT NULL;

    CREATE TABLE IF NOT EXISTS beacon_aliases (
      alias                  TEXT PRIMARY KEY,
      canonical_marker_type  TEXT NOT NULL,
      created_by             TEXT NOT NULL,
      created_at             TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS beacon_platform_projections (
      substrate_marker_type  TEXT PRIMARY KEY,
      platform_beacon_id     TEXT,
      projection_active      INTEGER NOT NULL DEFAULT 0,
      projected_at           TEXT,
      projected_by           TEXT
    );

    CREATE TABLE IF NOT EXISTS beacon_audit_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      beacon_id   TEXT NOT NULL,
      action      TEXT NOT NULL,   -- 'drop' | 'expire' | 'compose' | 'supersede'
      payload     TEXT,            -- JSON
      ts          TEXT NOT NULL
    );
  `);
}

// ─── UUID generator (crypto.randomUUID compat) ───────────────────────────────

export function newUUID(): string {
  // Node ≥ 15 has crypto.randomUUID; use it directly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis.crypto as any).randomUUID();
}

// ─── Slug validation ─────────────────────────────────────────────────────────

export function isValidSlug(s: string): boolean {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(s) || /^[a-z0-9]$/.test(s);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Alias resolution ────────────────────────────────────────────────────────

export function resolveMarkerType(raw: string): string {
  const db = getDb();
  const normalized = raw.toLowerCase().trim();
  const row = db
    .prepare("SELECT canonical_marker_type FROM beacon_aliases WHERE alias = ?")
    .get(normalized) as { canonical_marker_type: string } | undefined;
  if (row) return row.canonical_marker_type;
  // Auto-register slugified form as alias
  const slug = slugify(normalized);
  if (normalized !== slug) {
    db.prepare(
      "INSERT OR IGNORE INTO beacon_aliases (alias, canonical_marker_type, created_by, created_at) VALUES (?, ?, ?, ?)"
    ).run(normalized, slug, "auto_scribe", new Date().toISOString());
  }
  return slug;
}

// ─── Active filter helper ────────────────────────────────────────────────────

export function isActiveRow(row: {
  superseded_by: string | null;
  expires_at: string | null;
}): boolean {
  if (row.superseded_by) return false;
  if (row.expires_at && new Date(row.expires_at) <= new Date()) return false;
  return true;
}

// ─── Row → Beacon deserializer ───────────────────────────────────────────────

export function rowToBeacon(row: Record<string, unknown>): Beacon {
  return {
    beacon_id: row.beacon_id as string,
    marker_type: row.marker_type as string,
    applied_to: JSON.parse((row.applied_to as string) || "[]"),
    applied_at: row.applied_at as string,
    applied_by: row.applied_by as AppliedBy,
    expires_at: (row.expires_at as string) || null,
    compose_with: JSON.parse((row.compose_with as string) || "[]"),
    description: (row.description as string) || null,
    ratified_by: ((row.ratified_by as string) || null) as RatifiedBy,
    attributes: row.attributes ? JSON.parse(row.attributes as string) : null,
    superseded_by: (row.superseded_by as string) || null,
    created_at: row.created_at as string,
  };
}

// ─── Audit log ───────────────────────────────────────────────────────────────

export function logAudit(
  beaconId: string,
  action: string,
  payload?: unknown
): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO beacon_audit_log (beacon_id, action, payload, ts) VALUES (?, ?, ?, ?)"
  ).run(
    beaconId,
    action,
    payload ? JSON.stringify(payload) : null,
    new Date().toISOString()
  );
}

// ─── Day-1 seed (idempotent) ─────────────────────────────────────────────────

const DAY1_SEEDS: Array<{
  marker_type: string;
  description: string;
  ratified_by: RatifiedBy;
}> = [
  {
    marker_type: "golden-key-puzzle",
    description:
      "Treasure-Hunt golden-key thread (puzzle entities, clues, drop sites)",
    ratified_by: "founder",
  },
  {
    marker_type: "strain-canon",
    description:
      "Strain-classification canon entities (cooperative-onboarding strain class)",
    ratified_by: "founder",
  },
  {
    marker_type: "prov-amendment-pending",
    description: "Provisional patent amendments queued for filing",
    ratified_by: "founder",
  },
  {
    marker_type: "marketing-cultural-anchor",
    description:
      "Cultural-anchor entities for marketing/positioning (Kimmel/Cunningham/Newmark/etc.)",
    ratified_by: "founder",
  },
  {
    marker_type: "pixie-dust-mining",
    description: "Pixie-Dust-Mining substrate-value-extraction thread",
    ratified_by: "founder",
  },
  {
    marker_type: "cooperative-onboarding-class",
    description: "Onboarding flow + class-tier definitions",
    ratified_by: "founder",
  },
  {
    marker_type: "share-and-save",
    description: "Share-and-Save member-economics canon",
    ratified_by: "founder",
  },
  {
    marker_type: "helena-gate-blocking",
    description: "4-Frame Helena LIVE Launch Gate blockers (SAGA 13)",
    ratified_by: "founder",
  },
  {
    marker_type: "counsel-clearance-pending",
    description: "Items awaiting counsel HL#5 clearance",
    ratified_by: "founder",
  },
  {
    marker_type: "historical-timeline-archive",
    description: "Historical-Timeline archive integration anchors",
    ratified_by: "founder",
  },
];

export function runDaySeed(): { seeded: number; skipped: number } {
  const db = getDb();
  let seeded = 0;
  let skipped = 0;
  const now = new Date().toISOString();
  const checkStmt = db.prepare(
    "SELECT beacon_id FROM beacons WHERE marker_type = ? AND superseded_by IS NULL LIMIT 1"
  );
  const insertStmt = db.prepare(`
    INSERT INTO beacons
      (beacon_id, marker_type, applied_to, applied_at, applied_by, expires_at,
       compose_with, description, ratified_by, attributes, superseded_by, created_at)
    VALUES (?, ?, '[]', ?, 'auto_scribe', NULL, '[]', ?, ?, NULL, NULL, ?)
  `);
  for (const seed of DAY1_SEEDS) {
    const existing = checkStmt.get(seed.marker_type);
    if (existing) { skipped++; continue; }
    const id = newUUID();
    insertStmt.run(id, seed.marker_type, now, seed.description, seed.ratified_by, now);
    logAudit(id, "seed", { marker_type: seed.marker_type });
    seeded++;
  }
  return { seeded, skipped };
}
