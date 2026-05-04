/**
 * Codex Serial Atomic-Reservation Primitive — Bushel 32 / BP022
 * ==============================================================
 * Atomically reserves the next available LB-CODEX-NNNN serial.
 *
 * Contract:
 *   1. Read the codex ledger; find max(bound, reserved) serial.
 *   2. Allocate next: max + 1.
 *   3. Write reservation row to ledger BEFORE returning.
 *   4. Return reserved serial to caller.
 *
 * Race-safety strategy:
 *   - Module-level async mutex (Promise queue) serializes concurrent calls
 *     within the single Node.js event loop.
 *   - File-lock (lock-file pattern using fs.open O_EXCL) guards against
 *     concurrent MCP server processes on the same machine.
 *
 * Eliminates the recurring Codex-collision class (5+ empirical instances
 * tracked: Bushels 11/15/18/9/12/13/19 on serials 0032-0034).
 *
 * Default TTL for unbound reservations: 7 days.
 */

import { randomUUID } from "crypto";
import { openSync, closeSync, unlinkSync, existsSync } from "fs";
import { resolve } from "path";
import {
  CODEX_DIR,
  ensureCodexDir,
  appendReservationEntry,
  readAllReservationEntries,
  getReservationById,
  findMaxAllocatedSerial,
  type CodexReservation,
} from "./schema.js";
import { getCodexById } from "./schema.js";
import { emitPheromone } from "../scribes/pheromone.js";

// ─── Default TTL ──────────────────────────────────────────────────────────────

export const RESERVATION_TTL_DAYS = 7;

// ─── Lock file path ───────────────────────────────────────────────────────────

const LOCK_FILE = resolve(CODEX_DIR, "serial_allocator.lock");
const LOCK_TIMEOUT_MS = 5_000;
const LOCK_POLL_MS = 50;

// ─── In-process async mutex ───────────────────────────────────────────────────
// Node.js is single-threaded, but async operations can interleave. The mutex
// prevents two concurrent async calls from reading the ledger simultaneously
// before either has written its reservation row.

let _mutexQueue: Promise<void> = Promise.resolve();

function withMutex<T>(fn: () => Promise<T>): Promise<T> {
  const next = _mutexQueue.then(() => fn());
  // Replace the queue tail with a version that ignores errors (prevents queue stall)
  _mutexQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

// ─── File lock (cross-process safety) ────────────────────────────────────────

async function acquireFileLock(): Promise<void> {
  ensureCodexDir();
  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      // O_EXCL: fails atomically if file already exists (cross-process safe)
      const fd = openSync(LOCK_FILE, "wx");
      closeSync(fd);
      return; // acquired
    } catch {
      // Lock file exists — poll
      await new Promise((res) => setTimeout(res, LOCK_POLL_MS));
    }
  }
  // Stale lock: remove and retry once
  if (existsSync(LOCK_FILE)) {
    try { unlinkSync(LOCK_FILE); } catch { /* ignore */ }
    const fd = openSync(LOCK_FILE, "wx");
    closeSync(fd);
  }
}

function releaseFileLock(): void {
  try {
    if (existsSync(LOCK_FILE)) unlinkSync(LOCK_FILE);
  } catch { /* ignore */ }
}

// ─── Reservation result types ─────────────────────────────────────────────────

export interface ReservationSuccess {
  serial: string;
  reserved_ts: string;
  reservation_id: string;
  reservation: CodexReservation;
}

export type ReservationResult = ReservationSuccess | { error: string };

export interface BindReservationResult {
  success: boolean;
  reservation_id: string;
  serial: string;
  bound_codex_id: string;
  bound_ts: string;
}

// ─── Core: reserveNextSerial ──────────────────────────────────────────────────

/**
 * Atomically reserves the next available Codex serial.
 * Returns the reserved serial + reservation metadata.
 * Guaranteed no-collision within a single process; file-lock protects
 * against concurrent processes.
 */
export function reserveNextSerial(
  reserved_by: string,
  intended_title: string,
  intended_session: string,
  intended_bushel: number,
): Promise<ReservationResult> {
  return withMutex(async () => {
    await acquireFileLock();
    try {
      const max = findMaxAllocatedSerial();
      const next = max + 1;
      const serial = `LB-CODEX-${String(next).padStart(4, "0")}`;
      const reserved_ts = new Date().toISOString();
      const reservation_id = randomUUID();

      // Compute expiry (TTL from now)
      const expires = new Date(Date.now() + RESERVATION_TTL_DAYS * 24 * 60 * 60 * 1000);

      const reservation: CodexReservation = {
        type: "reservation",
        serial,
        reserved_by,
        intended_title,
        intended_session,
        intended_bushel,
        reserved_ts,
        reservation_id,
        status: "reserved",
        expires_ts: expires.toISOString(),
      };

      appendReservationEntry(reservation);

      emitPheromone(
        "CodexReservation",
        `codex_reserve_${serial}_${reservation_id.slice(0, 8)}`,
        `codex serial reserved ${serial} by ${reserved_by} bushel:${intended_bushel} atomic-allocation collision-class-closed`,
        { cathedral: "knight", flavorClass: { domain: "codex", cognition: "building-in-public" } },
      );

      return { serial, reserved_ts, reservation_id, reservation };
    } finally {
      releaseFileLock();
    }
  });
}

// ─── bindReservation ─────────────────────────────────────────────────────────

/**
 * Transitions a reservation from status="reserved" to status="bound".
 * Called after codex_bind() succeeds — links the reservation to the bound Codex.
 */
export async function bindReservation(
  reservation_id: string,
  bound_codex_id: string,
): Promise<BindReservationResult | { error: string }> {
  const reservation = getReservationById(reservation_id);
  if (!reservation) {
    return { error: `Reservation '${reservation_id}' not found. Must reserve before binding.` };
  }
  if (reservation.status === "bound") {
    return { error: `Reservation '${reservation_id}' is already bound to '${reservation.bound_codex_id}'.` };
  }
  if (reservation.status === "expired") {
    return { error: `Reservation '${reservation_id}' has expired. Reserve a new serial.` };
  }

  const codex = getCodexById(bound_codex_id);
  if (!codex) {
    return { error: `Codex '${bound_codex_id}' not found in ledger.` };
  }
  if (codex.status !== "bound") {
    return { error: `Codex '${bound_codex_id}' has status '${codex.status}'; must be 'bound' before linking reservation.` };
  }

  const bound_ts = new Date().toISOString();
  const updated: CodexReservation = {
    ...reservation,
    status: "bound",
    bound_codex_id,
    bound_ts,
  };
  appendReservationEntry(updated);

  emitPheromone(
    "CodexReservation",
    `codex_reservation_bound_${reservation_id.slice(0, 8)}`,
    `codex reservation bound ${reservation.serial} → ${bound_codex_id} by ${reservation.reserved_by}`,
    { cathedral: "knight", flavorClass: { domain: "codex", cognition: "building-in-public" } },
  );

  return {
    success: true,
    reservation_id,
    serial: reservation.serial,
    bound_codex_id,
    bound_ts,
  };
}

// ─── expireReservations ───────────────────────────────────────────────────────

/**
 * Sweeps all "reserved" entries past their expires_ts and transitions them
 * to "expired", releasing the serial back to the pool.
 * Returns the count of reservations expired.
 */
export async function expireReservations(ttl_days?: number): Promise<{ expired_count: number; expired: string[] }> {
  const now = Date.now();
  const ttlMs = (ttl_days ?? RESERVATION_TTL_DAYS) * 24 * 60 * 60 * 1000;
  const reservations = readAllReservationEntries();
  const expired: string[] = [];

  for (const r of reservations) {
    if (r.status !== "reserved") continue;
    const expiresAt = r.expires_ts
      ? new Date(r.expires_ts).getTime()
      : new Date(r.reserved_ts).getTime() + ttlMs;
    if (now >= expiresAt) {
      const updated: CodexReservation = {
        ...r,
        status: "expired",
        expires_ts: new Date().toISOString(),
      };
      appendReservationEntry(updated);
      expired.push(r.serial);
    }
  }

  return { expired_count: expired.length, expired };
}

// ─── queryReservations ────────────────────────────────────────────────────────

export interface ReservationQueryFilter {
  status?: CodexReservation["status"];
  reserved_by?: string;
  intended_bushel?: number;
}

export function queryReservations(filter: ReservationQueryFilter): CodexReservation[] {
  return readAllReservationEntries().filter((r) => {
    if (filter.status && r.status !== filter.status) return false;
    if (filter.reserved_by && r.reserved_by !== filter.reserved_by) return false;
    if (filter.intended_bushel !== undefined && r.intended_bushel !== filter.intended_bushel) return false;
    return true;
  });
}
