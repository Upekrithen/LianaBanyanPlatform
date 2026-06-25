# MESH ORCHESTRATOR RECON — BP086 SEG A1
**Agent:** Knight (Sonnet 4.6) · **Session:** BP086 · **Minted:** 2026-06-18

---

## 1. Plow Entry Point

**Path:** `tools/plow-cli/plow-cli-12blade.js`

**Version:** `12blade-bp084-corrected-v2`

**CLI usage:**
```
node plow-cli-12blade.js <shard.json> --model <model> --out <out.jsonl>
    --telemetry <telem.json> [--ollama http://localhost:11434]
    [--max-consequence-depth 3] [--vault <path>]
```

**Input format:**
```json
{
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "domain": "chemistry",
      "class": "KNOWN|THEORY_OPEN|ELIMINATED",
      "ground_truth": "optional preloaded fact",
      "pre_loaded_contradiction": { "known_fact": "...", "contradicts_theory": "..." },
      "downstream_seed": "optional ref for blade 12"
    }
  ]
}
```

**Output format:**
- **JSONL** (one JSON object per line) at `--out` path — each line is a `QuestionResult`
- **Telemetry JSON** at `--telemetry` path — full per-blade timing + blade fire counts

**Blade loop structure (12 blades, all fire per question unless skipped):**

| # | Name | Function | Conditional? |
|---|------|----------|--------------|
| 1 | **Spider** | Locate topic-relevant eblets in local vault index | Always |
| 2 | **Sprite** | Retrieve located eblets from storage | Always |
| 3 | **Specialists** | 9-Swarm: Wikipedia · Wikidata · arXiv · Ollama-synth | Always |
| 4 | **Miner** | Anti-popularity filter (weight ≥ 0.6 AND content ≥ 100 chars) | Always |
| 5 | **Saladin** | Adversarial Fence — challenge each candidate via Ollama | Always |
| 6 | **Furnace** | Angel of Death — top-6 survivors of Saladin | Always |
| 7 | **Three Fates** | 3-voter arbitration (temps 0.0 / 0.2 / 0.4 via Ollama) | Always |
| 8 | **Scribe** | BMV + concordance + gate outcomes + TIC eblet mint | Always |
| 9 | **Detective TEAM** | Root-cause gate fails + Federated Andon cord (3-tier) | Always |
| 10 | **Psionic** (CONSEQUENCE_TRACE) | Spawn consequence probes for THEORY_OPEN | If THEORY_OPEN |
| 11 | **Auditor** (ELIMINATION_VERIFY) | Walk substrate for contradictions → Code Breakers queue | If ELIMINATED |
| 12 | **Sentinel** (DEPENDENCY_PROPAGATION) | When KNOWN updates, flag downstream eblets | If KNOWN + downstream |

**Answers written to disk:**
- TIC eblets → `Asteroid-ProofVault/state/eblets/active/<type>_<slug>.json`
- Code Breaker queue → `Asteroid-ProofVault/state/eblets/code_breaker_queue.json`
- Review queue → `Asteroid-ProofVault/state/eblets/review_queue.json`
- Main results → JSONL at `--out` (default `validation_test_results.jsonl`)
- Telemetry → JSON at `--telemetry` (default `validation_test_telemetry.json`)

**Validation status:** M0 GREEN per `canon_12_blade_plow_validated_m0_bp084.eblet.md` (BP084). All 12 blades fired on 3-question test. BMV 56.8–63.4.

---

## 2. wan-relay-publish Handler

**Path:** `platform/supabase/functions/wan-relay-publish/index.ts`

**Endpoint:** `POST https://relay.lianabanyan.com/functions/v1/wan-relay-publish`

**Auth pattern:** No JWT. SID is the auth token (32-char hex, intentionally anonymous).

**Request payload schema (PeanutRoll):**
```json
{
  "v": 1,
  "s": "<32-char hex SID>",
  "p": ["string", "..."],
  "b": { "key": "string-value" },
  "ts": 1750000000000,
  "peer_id": "optional-node-identifier",
  "email_hash": "optional-sha256-of-email",
  "lan_addresses": ["192.168.1.x", "..."],
  "relay_session_id": "optional",
  "capabilities": { "any": "json-object" }
}
```

- `v`, `s`, `p`, `b`, `ts` are **required**
- `peer_id`, `email_hash`, `lan_addresses`, `relay_session_id`, `capabilities` are **optional** (BP084 SEG-2 presence extension)

**Response:**
- `202 { ok: true, sid: "<32-char hex>" }` on success
- `400 { ok: false, error: "..." }` on invalid payload
- `429 { ok: false, error: "..." }` on rate limit (10/IP/hr · 3/SID/hr)
- `500 { ok: false, error: "..." }` on server error

**Behavior:**
1. Upserts `wan_relay_records` keyed by SID + cooperative_epoch (daily)
2. If `peer_id` present → upserts `peer_presence` row

**Special headers (CORS):**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type, x-wan-sid
Access-Control-Allow-Methods: POST, OPTIONS
```

---

## 3. peer_presence Schema

**Migration:** `platform/supabase/migrations/20260615000001_peer_presence.sql`

**Table:** `peer_presence`

| Column | Type | Notes |
|--------|------|-------|
| `peer_id` | `text` | PRIMARY KEY — node identifier |
| `email_hash` | `text` | SHA-256 of email (privacy boundary — never raw) |
| `wan_soccerball_id` | `text` | SID from PeanutRoll |
| `lan_addresses` | `text[]` | LAN IPs (array) |
| `relay_session_id` | `text` | Relay session reference |
| `capabilities` | `jsonb` | Node capabilities JSON object |
| `last_seen_at` | `timestamptz` | DEFAULT now() — TTL anchor |

**Indexes:** `peer_presence_email_hash_idx`, `peer_presence_wan_soccerball_id_idx`

**TTL:** pg_cron job hard-deletes rows where `last_seen_at < now() - interval '5 minutes'`

**Also created in same migration:** `wan_relay_routed` table (encrypted in-flight payloads, 60s TTL)

**Node count query (no credentials needed via public count):** Requires service-role key — skip for unauthenticated recon.

---

## 4. Relay Health Check

**Target:** `https://relay.lianabanyan.com/functions/v1/wan-relay-publish`

**Method:** OPTIONS

**Result:**
```
StatusCode: 200 OK
CF-Ray: a0d937993c6b3acc-DFW
CF-Cache-Status: DYNAMIC
Access-Control-Allow-Origin: *
```

**STATUS: GREEN** ✅ — Relay is live, Cloudflare-fronted, CORS headers correct.

---

## 5. Summary

| Item | Status | Detail |
|------|--------|--------|
| Plow entry point | ✅ FOUND | `tools/plow-cli/plow-cli-12blade.js` · 12 blades confirmed |
| wan-relay-publish | ✅ FOUND | `platform/supabase/functions/wan-relay-publish/index.ts` |
| peer_presence schema | ✅ FOUND | 7 columns, TTL 5 min |
| Relay HTTP health | ✅ GREEN | HTTP 200 · CF-Ray DFW · CORS headers correct |

---

*SEG A1 COMPLETE · BP086 BLACK MAMBA × 30 · Knight (Sonnet 4.6)*
