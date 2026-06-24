/**
 * empress-ip-ledger-hook · BP092
 * Ring Bearer IP Ledger write hook for empress_proposals.
 *
 * Canon refs:
 *   - §16 Ring Bearer IP Ledger pattern (append-only, no delete)
 *   - canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086
 *   - Postgres-only syntax (gen_random_uuid, TIMESTAMPTZ, BYTEA)
 *   - replication_status='local' — frontier mesh replication deferred (frontier bug open per MEMORY)
 *
 * Trigger: Called via Supabase webhook on empress_proposals INSERT.
 * Env vars required:
 *   EMPRESS_LEDGER_SIGNING_KEY — Ed25519 private key (base64-encoded 32-byte seed)
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — provided automatically by Supabase runtime
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SIGNING_KEY_B64 = Deno.env.get("EMPRESS_LEDGER_SIGNING_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

/** Deterministic SHA-256 hex of JSON payload. */
async function sha256Hex(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const hashBuf = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Ed25519 sign. Returns base64 signature or empty string on failure. */
async function ed25519Sign(message: string, keyB64: string): Promise<string> {
  if (!keyB64) return "";
  try {
    const seedBytes = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
    const keyPair = await crypto.subtle.importKey(
      "raw",
      seedBytes,
      { name: "Ed25519" },
      false,
      ["sign"],
    );
    const msgBytes = new TextEncoder().encode(message);
    const sigBuf = await crypto.subtle.sign({ name: "Ed25519" }, keyPair, msgBytes);
    return btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
  } catch (err) {
    console.warn("[empress-ip-ledger-hook] Ed25519 sign failed:", err);
    return "";
  }
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
  }

  /* Supabase webhooks wrap the row in { type, table, record, old_record } */
  const record = (body.record ?? body) as {
    id?: string;
    member_id?: string;
    proposed_name?: string;
    appearance_image_url?: string;
    created_at?: string;
  };

  const proposalId = record.id;
  const memberId = record.member_id;
  const proposedName = record.proposed_name;
  const appearanceUrl = record.appearance_image_url ?? null;
  const createdAt = record.created_at ?? new Date().toISOString();

  if (!proposalId || !memberId || !proposedName) {
    return new Response(
      JSON.stringify({ error: "missing_required_fields", received: record }),
      { status: 400 },
    );
  }

  /* Build deterministic payload for hashing (field ordering matters) */
  const hashPayload = JSON.stringify({
    id: proposalId,
    member_id: memberId,
    proposed_name: proposedName,
    appearance_image_url: appearanceUrl,
    created_at: createdAt,
  });

  const payloadHash = await sha256Hex(hashPayload);

  /* Ed25519 signature — if key missing, log warning and proceed unsigned */
  if (!SIGNING_KEY_B64) {
    console.warn("[empress-ip-ledger-hook] EMPRESS_LEDGER_SIGNING_KEY not set — writing unsigned entry");
  }
  const signature = await ed25519Sign(hashPayload, SIGNING_KEY_B64);

  /* INSERT into ip_ledger (append-only · Federal Body Cam doctrine) */
  const { data: ledgerRow, error: ledgerErr } = await supabase
    .from("ip_ledger")
    .insert({
      ring_bearer_id: memberId,
      entry_type: "empress_proposal",
      payload_hash: payloadHash,
      payload_json: {
        subject_type: "empress_proposal",
        subject_id: proposalId,
        proposed_name: proposedName,
        appearance_image_url: appearanceUrl,
        created_at: createdAt,
        signed_by: "empress-ip-ledger-hook",
        replication_status: "local",
      },
      ed25519_sig: signature,
      stamped_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (ledgerErr) {
    console.error("[empress-ip-ledger-hook] ip_ledger INSERT failed:", ledgerErr);
    return new Response(JSON.stringify({ error: "ledger_insert_failed", detail: ledgerErr.message }), { status: 500 });
  }

  /* UPDATE empress_proposals.ip_ledger_hash */
  const { error: updateErr } = await supabase
    .from("empress_proposals")
    .update({ ip_ledger_hash: payloadHash })
    .eq("id", proposalId);

  if (updateErr) {
    console.warn("[empress-ip-ledger-hook] ip_ledger_hash update failed:", updateErr);
    /* Non-fatal — ledger row is written; hash backfill can retry */
  }

  /* Emit MIC broadcast event (Ed25519 signed per canon_mic_stamped BP086) */
  const micEvent = {
    event: "empress_proposal_registered",
    proposal_id: proposalId,
    ledger_hash: payloadHash,
    ledger_id: ledgerRow?.id,
    signed: !!signature,
    campaign_headline: "Name the Empress. STOP the Nothing.",
    timestamp: new Date().toISOString(),
  };

  const micSig = await ed25519Sign(JSON.stringify(micEvent), SIGNING_KEY_B64);

  /* Fire MIC broadcast — non-blocking, failure doesn't fail the hook */
  supabase.functions.invoke("mic-broadcast", {
    body: {
      event_type: "empress_proposal_registered",
      payload: micEvent,
      ed25519_sig: micSig,
    },
  }).catch((err: unknown) => {
    console.warn("[empress-ip-ledger-hook] MIC broadcast failed (non-fatal):", err);
  });

  return new Response(
    JSON.stringify({
      ok: true,
      ledger_id: ledgerRow?.id,
      payload_hash: payloadHash,
      signed: !!signature,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
