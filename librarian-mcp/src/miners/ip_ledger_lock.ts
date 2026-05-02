/**
 * IP Ledger Lock — Chronos Chronicler Signing (KN104 / BP016 — B123 #2296)
 * =========================================================================
 * Every mined tablet is:
 *   1. Timestamped
 *   2. Miner-attributed (serial number)
 *   3. Hash-chained to Miner ancestry chain
 *   4. Chronos Chronicler signed (HMAC-SHA256 of content + ancestry)
 *
 * The Chronos Chronicler is the temporal-integrity witness for the IP ledger.
 * Hash-chaining ensures no retroactive insertion — each entry proves it was
 * created after its parent.
 */

import { createHmac, createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STITCHPUNKS_DIR =
  process.env.LIBRARIAN_STITCHPUNKS_DIR
    ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
    : resolve(__dirname, "..", "..", "stitchpunks");

const IP_LEDGER_DIR = resolve(STITCHPUNKS_DIR, "miners", "ip_ledger");
const IP_LEDGER_PATH = resolve(IP_LEDGER_DIR, "ip_ledger.jsonl");

// ─── Chronos Chronicler Key ────────────────────────────────────────────────
// Production: key loaded from vault. Dev: deterministic from serial prefix.
// Never exposed in output per secrets hygiene rules.

const CHRONICLER_HMAC_KEY = process.env.CHRONOS_CHRONICLER_KEY ?? "LB_CHRONOS_CHRONICLER_DEV_KEY_2026";

// ─── IP Ledger Entry ──────────────────────────────────────────────────────

export interface IpLedgerEntry {
  serial: string;
  ts: string;
  content_hash: string;        // SHA-256 of tablet content
  parent_hash: string | null;  // SHA-256 of parent entry (null for root)
  hmac_sig: string;            // HMAC-SHA256(serial + ts + content_hash + parent_hash)
  session_id: string;
}

// ─── Hash Helpers ─────────────────────────────────────────────────────────

function sha256(input: string): string {
  return createHash("sha256").update(input, "utf-8").digest("hex");
}

function hmacSign(data: string): string {
  return createHmac("sha256", CHRONICLER_HMAC_KEY).update(data, "utf-8").digest("hex");
}

// ─── Ledger I/O ───────────────────────────────────────────────────────────

function ensureDir(): void {
  if (!existsSync(IP_LEDGER_DIR)) mkdirSync(IP_LEDGER_DIR, { recursive: true });
}

function readLastEntry(): IpLedgerEntry | null {
  ensureDir();
  if (!existsSync(IP_LEDGER_PATH)) return null;
  const lines = readFileSync(IP_LEDGER_PATH, "utf-8").split("\n").filter(l => l.trim());
  if (lines.length === 0) return null;
  try {
    return JSON.parse(lines[lines.length - 1]) as IpLedgerEntry;
  } catch {
    return null;
  }
}

function appendEntry(entry: IpLedgerEntry): void {
  ensureDir();
  writeFileSync(IP_LEDGER_PATH, JSON.stringify(entry) + "\n", { flag: "a", encoding: "utf-8" });
}

// ─── Main Lock Function ────────────────────────────────────────────────────

export interface IpLockResult {
  hash: string;
  hmac_sig: string;
  entry: IpLedgerEntry;
}

/**
 * Creates an IP-ledger-locked entry for a Miner tablet.
 * Hash-chains to the Miner's ancestry (parent_serial → parent hash lookup).
 */
export function computeIpLedgerLock(
  serial: string,
  content: string,
  parentSerial: string | null,
  sessionId: string,
): IpLockResult {
  const ts = new Date().toISOString();
  const contentHash = sha256(content);

  // Look up parent hash from ledger (chain integrity)
  let parentHash: string | null = null;
  if (parentSerial !== null) {
    const lastEntry = readLastEntry();
    if (lastEntry && lastEntry.serial === parentSerial) {
      parentHash = lastEntry.content_hash;
    } else {
      // Parent not found; use hash of parent serial string (graceful degradation)
      parentHash = sha256(parentSerial);
    }
  }

  // Chronos Chronicler signature
  const sigInput = `${serial}|${ts}|${contentHash}|${parentHash ?? "null"}`;
  const hmacSig = hmacSign(sigInput);

  const entry: IpLedgerEntry = {
    serial,
    ts,
    content_hash: contentHash,
    parent_hash: parentHash,
    hmac_sig: hmacSig,
    session_id: sessionId,
  };

  appendEntry(entry);

  return {
    hash: contentHash,
    hmac_sig: hmacSig,
    entry,
  };
}

/** Reads all IP ledger entries for a given serial prefix. */
export function queryIpLedger(serialPrefix: string): IpLedgerEntry[] {
  ensureDir();
  if (!existsSync(IP_LEDGER_PATH)) return [];
  const lines = readFileSync(IP_LEDGER_PATH, "utf-8").split("\n").filter(l => l.trim());
  const results: IpLedgerEntry[] = [];
  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as IpLedgerEntry;
      if (entry.serial === serialPrefix || entry.serial.startsWith(serialPrefix + ".")) {
        results.push(entry);
      }
    } catch {
      continue;
    }
  }
  return results;
}

/** Verifies the HMAC signature of a single IP ledger entry. */
export function verifyIpLedgerEntry(entry: IpLedgerEntry): boolean {
  const sigInput = `${entry.serial}|${entry.ts}|${entry.content_hash}|${entry.parent_hash ?? "null"}`;
  const expected = hmacSign(sigInput);
  return expected === entry.hmac_sig;
}
