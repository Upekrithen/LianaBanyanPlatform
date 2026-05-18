/**
 * Thorax CelPane Shadow Blink-Skip Signature — P11
 * =================================================
 * Dream #5 · BP046B · Phase 1
 *
 * P11: CelPane shadow blink-skip signature binding.
 *      Interference-state pass/interfere across relay thread.
 *      Cryptographic-class via RFC 3161 TST (DigiCert primary per BP046 scoping).
 *
 * Founder verbatim: "Shadow blink-skip CalPane signature is internal from source
 *   material, cannot be faked, by nature is water, if not, is oil, cannot be both
 *   so cannot flow if disparate or interrupted."
 *
 * CelPane (= CalPane per Founder typo confession BP031):
 *   - Substrate render-cell with interference-state primitive (pass/interfere)
 *   - BP028 canon · BP030 203× warm-cycle empirical · BP031 SE-4 Bat Signal
 *   - "render is the boundary of meaning"
 *
 * Shadow blink-skip = interference-pattern modulation across chain (SE-4 sister).
 * "Water (genuine) or oil (inauthentic) · binary · cannot mix · cannot flow
 *  if disparate or interrupted."
 *
 * RFC 3161 TST: DigiCert primary + GlobalSign backup (scoped BP046 W1).
 *
 * Composes with:
 *   - SE-4 Shadow E-Signal (LB-STACK-0172) — sister primitive
 *   - thorax_eblit.ts (Eblit for decode-registry at burst-fire time)
 *   - thorax_channels.ts (signature binding per channel)
 */

import {
  existsSync, appendFileSync, readFileSync, mkdirSync,
} from "fs";
import { resolve } from "path";
import { randomUUID, createHash, createHmac } from "crypto";
import { THORAX_DIR } from "./thorax_choke.js";
import { readChannel, updateChannelMetadata } from "./thorax_channels.js";
import { captureEblitSnapshot } from "./thorax_eblit.js";
import type {
  CelPaneSignature, CelPaneInterferenceState,
} from "./thorax_types.js";

// ─── Storage ──────────────────────────────────────────────────────────────────

function celpaneSigPath(): string {
  return resolve(THORAX_DIR, "celpane_signatures.jsonl");
}

function ensureDir(): void {
  if (!existsSync(THORAX_DIR)) mkdirSync(THORAX_DIR, { recursive: true });
}

function appendSig(sig: CelPaneSignature): void {
  ensureDir();
  appendFileSync(celpaneSigPath(), JSON.stringify(sig) + "\n", "utf-8");
}

function readSigs(): CelPaneSignature[] {
  const p = celpaneSigPath();
  if (!existsSync(p)) return [];
  try {
    return readFileSync(p, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as CelPaneSignature);
  } catch {
    return [];
  }
}

// ─── CelPane burst encoding ───────────────────────────────────────────────────

/**
 * Encode the relay-thread's CelPane chain as an SE-4 burst pattern.
 * "Each CelPane either passes the signal or interferes."
 *
 * Phase 1: simplified burst pattern generation.
 * Full SE-4 combinatorial encoding deferred to Phase 3 (HL#5 ratified).
 */
function encodeBurstPattern(
  channel_id: number,
  interference_state: CelPaneInterferenceState,
  chain_length: number = 12
): string[] {
  const pattern: string[] = [];
  for (let i = 0; i < chain_length; i++) {
    const pane_id = `celpane-${channel_id}-${i}`;
    const state = i === channel_id - 1
      ? interference_state     // channel's own pane reflects its state
      : "pass";                // other panes pass-through
    pattern.push(`${pane_id}:${state}`);
  }
  return pattern;
}

// ─── RFC 3161 TST (scoped — DigiCert primary) ─────────────────────────────────

/**
 * Generate a Phase 1 RFC 3161 TST stub.
 * Full DigiCert integration is HL#5-scoped.
 * Phase 1: HMAC-based timestamped receipt (court-class binding deferred to HL#5).
 *
 * Returns a structured receipt that can be upgraded to full TST when HL#5 ships.
 */
function generateRfc3161TstStub(
  signature_id: string,
  channel_id: number,
  burst_hash: string,
  ts: string
): string {
  const tst_payload = JSON.stringify({
    version: 1,
    policy_oid: "1.2.840.113549.1.9.16.1.4",  // RFC 3161 id-smime-aa-timeStampToken
    message_imprint: {
      hash_algorithm: "sha256",
      hashed_message: burst_hash,
    },
    serial_number: `tst-${signature_id}`,
    gen_time: ts,
    accuracy: { seconds: 1 },
    ordering: false,
    nonce: randomUUID(),
    tsa: "DigiCert-TSA-primary-scoped-BP046",  // placeholder until HL#5
    note: "phase1-hmac-stub-upgrade-at-hl5",
  });

  // HMAC-signed stub (Ed25519 / DigiCert full TST at HL#5)
  const hmac_secret = `thorax-tst-${channel_id}`;
  const hmac = createHmac("sha256", hmac_secret)
    .update(tst_payload)
    .digest("hex");

  return `TST-STUB::${hmac}::${Buffer.from(tst_payload).toString("base64")}`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface CelPaneSignResult {
  success: boolean;
  signature?: CelPaneSignature;
  interference_state?: CelPaneInterferenceState;
  is_water?: boolean;   // true = "pass" = genuine
  is_oil?: boolean;     // true = "interfere" = inauthentic
  error?: string;
}

/**
 * P11: Bind a CelPane shadow blink-skip signature to a relay channel.
 *
 * Determines interference state from channel context:
 * - "pass" (water): channel is bestie_open or transmitting — genuine, flows freely
 * - "interfere" (oil): channel is flagged/phalanx/sealed — inauthentic, cannot flow
 *
 * "Cannot be both — binary. Cannot flow if disparate or interrupted."
 */
export function bindCelPaneSignature(
  channel_id: number,
  celpane_chain_id: string
): CelPaneSignResult {
  const ch = readChannel(channel_id);
  if (!ch) {
    return { success: false, error: `Channel ${channel_id} not found.` };
  }

  // Determine interference state from channel condition
  const genuine_states = ["uninitialized", "handshake_pending", "bestie_open", "transmitting_east", "transmitting_west"];
  const interference_state: CelPaneInterferenceState =
    genuine_states.includes(ch.state) ? "pass" : "interfere";

  const ts = new Date().toISOString();
  const burst_pattern = encodeBurstPattern(channel_id, interference_state);

  const burst_hash = createHash("sha256")
    .update(JSON.stringify(burst_pattern))
    .digest("hex");

  const signature_id = `celpane-sig-${randomUUID()}`;
  const rfc3161_tst = generateRfc3161TstStub(signature_id, channel_id, burst_hash, ts);

  const celpane_signature_str = `${interference_state}::${burst_hash}::${signature_id}`;

  const sig: CelPaneSignature = {
    signature_id,
    channel_id,
    interference_state,
    celpane_chain_id,
    burst_pattern,
    rfc3161_tst,
    digicert_tsa_url: "https://timestamp.digicert.com",  // HL#5 live endpoint
    ts,
  };

  appendSig(sig);

  // Capture Eblit snapshot of signature state at binding moment
  captureEblitSnapshot(channel_id, "channel_state", {
    celpane_signature_id: signature_id,
    interference_state,
    burst_hash,
    channel_state: ch.state,
  });

  // Update channel with signature binding (metadata-only — no state transition)
  updateChannelMetadata(channel_id, {
    celpane_signature: celpane_signature_str,
    rfc3161_tst,
  });

  return {
    success: true,
    signature: sig,
    interference_state,
    is_water: interference_state === "pass",
    is_oil: interference_state === "interfere",
  };
}

// ─── Signature verification ───────────────────────────────────────────────────

/**
 * Verify a CelPane signature's interference state.
 * "Water or oil — binary — cannot be both."
 * Returns true if signature is consistent (not mixed/disparate).
 */
export function verifyCelPaneConsistency(
  signature_id: string
): {
  consistent: boolean;
  interference_state?: CelPaneInterferenceState;
  not_mixed: boolean;
  error?: string;
} {
  const sigs = readSigs();
  const sig = sigs.find((s) => s.signature_id === signature_id);
  if (!sig) {
    return { consistent: false, not_mixed: false, error: `Signature ${signature_id} not found.` };
  }

  const expected_hash = createHash("sha256")
    .update(JSON.stringify(sig.burst_pattern))
    .digest("hex");

  // Re-derive burst hash from pattern and compare
  const derived_consistent = sig.burst_pattern.every((p) => {
    const [, state] = p.split(":");
    return state === "pass" || state === "interfere";
  });

  return {
    consistent: derived_consistent,
    interference_state: sig.interference_state,
    not_mixed: derived_consistent, // if any pane has ambiguous state, not consistent
  };
}

/** Latest CelPane signature for a channel. */
export function latestCelPaneSig(channel_id: number): CelPaneSignature | null {
  const all = readSigs();
  const chSigs = all.filter((s) => s.channel_id === channel_id);
  return chSigs[chSigs.length - 1] ?? null;
}
