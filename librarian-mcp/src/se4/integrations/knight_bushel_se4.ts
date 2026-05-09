/**
 * SE-4 Knight Bushel Sub-Shadow Integration (Tier 1 / B-SE4-1)
 * =============================================================
 * Wraps KNIGHT_BISHOP_MESSAGES entries with SE-4 envelopes.
 *
 * Integration point: writeKnightBishopMessage() — append se4: SE4Envelope
 * to the KNIGHT_BISHOP_MESSAGES.md entry, backward-compatible.
 *
 * Spec: PROMPT_KNIGHT_BUSHEL_SE4_RETROFIT_TIER_1_2_3_BP033.md §3 B-SE4-1 #2
 *   - Wrap every Bushel-fire SEG dispatch with SE4Envelope at origination
 *   - On completion: write KNIGHT_BISHOP_MESSAGES entry with se4 field
 *   - Bishop-side: parseKnightMessage — gracefully null if old-format
 *   - Collision-avoidance: registry rejects on cell_identities overlap
 *     (structurally impossible with single-bit allocation, but retry provided)
 *
 * File: KNIGHT_BISHOP_MESSAGES.md at repo root.
 */

import { appendFileSync, existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { signShadowOutput, verifyEnvelope, defaultKeyManager } from '../se4_hmac.js';
import { defaultRegistry } from '../se4_registry.js';
import type { SE4Envelope, SE4ShadowClass } from '../se4_envelope.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// KNIGHT_BISHOP_MESSAGES.md is at the workspace root (3 levels up from src/se4/integrations)
const WORKSPACE_ROOT = resolve(__dirname, '..', '..', '..', '..', '..');
const YOKE_PATH = resolve(WORKSPACE_ROOT, 'KNIGHT_BISHOP_MESSAGES.md');

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KnightBushelSE4Message {
  bushelId: string;
  status: 'LANDED' | 'FAILED' | 'PARTIAL';
  summary: string;
  parentShadowId?: string | null;
}

export interface KnightMessageParsed {
  raw: string;
  se4: SE4Envelope | null;
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Write a Knight Bushel completion entry to KNIGHT_BISHOP_MESSAGES.md
 * with an SE-4 envelope appended as a backward-compatible field.
 *
 * Called at Bushel landing — wraps the message payload with SE-4 and
 * appends the envelope as `**se4_envelope:** <json>` within the message.
 */
export function writeKnightBushelMessage(
  msg: KnightBushelSE4Message
): { entry: string; shadow_id: string; envelope: SE4Envelope } {
  const payload = {
    bushelId: msg.bushelId,
    status:   msg.status,
    summary:  msg.summary,
    ts:       new Date().toISOString(),
  };

  const { envelope, shadow_id } = signShadowOutput(
    'knight_bushel' as SE4ShadowClass,
    payload,
    {
      parentShadowId: msg.parentShadowId ?? null,
      registry:       defaultRegistry,
      keyManager:     defaultKeyManager,
    }
  );

  const ts       = new Date().toISOString();
  const envelopeJson = JSON.stringify(envelope);

  const entry = [
    '',
    '',
    `## [KNIGHT → BISHOP] SE4-WRAPPED — Bushel ${msg.bushelId}`,
    `**Time:** ${ts}`,
    `**Status:** ${msg.status}`,
    `**Bushel:** ${msg.bushelId}`,
    `**Shadow_class:** knight_bushel`,
    `**Shadow_id:** ${shadow_id}`,
    `**Signal_id:** ${envelope.signal_id}`,
    `**Epoch_id:** ${envelope.epoch_id}`,
    `**Cell_identities:** ${envelope.cell_identities.join(', ')}`,
    `**se4_envelope:** ${envelopeJson}`,
    '',
    '---',
    '',
    msg.summary.trim(),
    '',
    '---',
  ].join('\n');

  appendFileSync(YOKE_PATH, entry, 'utf-8');

  // Release shadow slot immediately after write (stateless message delivery)
  defaultRegistry.releaseId(shadow_id);

  return { entry, shadow_id, envelope };
}

// ─── Parse ────────────────────────────────────────────────────────────────────

/**
 * Parse a raw KNIGHT_BISHOP_MESSAGES.md entry block and extract its SE-4
 * envelope if present.
 *
 * Gracefully returns se4: null for old-format messages (pre-SE-4) — backward
 * compatible per spec: "existing Bishop readers ignore unknown fields."
 */
export function parseKnightMessage(raw: string): KnightMessageParsed {
  const match = raw.match(/\*\*se4_envelope:\*\*\s*(\{.+\})/);
  if (!match) return { raw, se4: null };

  try {
    const envelope = JSON.parse(match[1]) as SE4Envelope;
    return { raw, se4: envelope };
  } catch {
    return { raw, se4: null };
  }
}

/**
 * Read all entries from KNIGHT_BISHOP_MESSAGES.md and parse their SE-4
 * envelopes. Returns array of { raw_block, se4 | null }.
 */
export function readAndParseYoke(): KnightMessageParsed[] {
  if (!existsSync(YOKE_PATH)) return [];
  const content = readFileSync(YOKE_PATH, 'utf-8');
  // Split on '## [' header boundaries
  const blocks = content.split(/(?=\n## \[)/);
  return blocks.map((b) => parseKnightMessage(b));
}

// ─── HMAC verification on read ────────────────────────────────────────────────

export interface YokeVerifyResult {
  entry: KnightMessageParsed;
  hmacVerified: boolean | null; // null = no SE-4 envelope present
}

/**
 * Read the yoke file and verify HMAC on every SE-4-wrapped entry.
 * Entries that fail HMAC are flagged (not quarantined here — caller decides).
 *
 * Note: HMAC verification requires the same session key used to sign.
 * Cross-session verification will fail by design (per-session key rotation).
 */
export function verifyYokeEntries(): YokeVerifyResult[] {
  const entries = readAndParseYoke();
  return entries.map((entry) => {
    if (!entry.se4) return { entry, hmacVerified: null };

    // Reconstruct payload from envelope context
    const payload = {
      bushelId: entry.raw.match(/\*\*Bushel:\*\*\s*(.+)/)?.[1]?.trim() ?? '',
      status:   entry.raw.match(/\*\*Status:\*\*\s*(.+)/)?.[1]?.trim() ?? '',
      ts:       entry.raw.match(/\*\*Time:\*\*\s*(.+)/)?.[1]?.trim() ?? '',
    };

    const hmacVerified = verifyEnvelope(entry.se4, payload, defaultKeyManager);
    return { entry, hmacVerified };
  });
}
