# KNIGHT YOKE I7 — MIC Fleet Broadcast Channel + Auto-Update + v0.5.7

**Session:** BP086 · **Filed:** 2026-06-18 · **Filed by:** Bishop (Sonnet 4.6 SEG)
**Founder direct:** *"Can we not build into the MIC to automatically update the peers?"*
**Naming lock (Founder direct BP086):** MIC = **Machine In Charge** (the designated coordinator peer that issues fleet broadcasts on behalf of the cooperative substrate). NOT "Master In Cluster."

**Knight preamble:** Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER. Spawn Sonnet 4.6 SEGs for substantive work. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

**Statutes:** BP085 §14+§15+§16 BLOOD.

---

## Canon alignment

This is the MIC (Machine In Charge) primitive that has been spec'd but not yet shipped. Composes with:
- `canon_netlinkwebnode_mic_vendor_resilient_peer_cluster_bp085` (MIC = cluster coordinator)
- `canon_moneypenny_in_mnemosyne_founder_out_of_loop_autonomy_until_mnemosyne_come_bp061` (autonomy goal: Founder out of manual relay)
- `canon_thorax_defensive_architecture_phase_1_live_bp047` (heartbeat + cooperative auth layer)
- `canon_generic_connection_membership_base_tier_free_bp086` (Base tier peers participate in fleet ops)

The auto-update use case is the FIRST lever on a generic primitive. The channel handles any coordinated fleet operation.

---

## What it builds

### A. `fleet_broadcast` Supabase table

```sql
CREATE TABLE IF NOT EXISTS fleet_broadcast (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_type text NOT NULL CHECK (broadcast_type IN (
    'auto_update',           -- "pull this version + restart"
    'config_set',            -- "set this Ollama / app setting"
    'fleet_warmup',          -- "preload model"
    'health_snapshot',       -- "report your current state"
    'benchmark_run',         -- "run this benchmark NOW"
    'noop_test'              -- "ack only, for channel testing"
  )),
  target_tier text DEFAULT 'all' CHECK (target_tier IN ('all', 'base', 'member', 'premium')),
  target_peer_ids text[] DEFAULT NULL,  -- optional narrow targeting
  payload jsonb NOT NULL,
  issued_by text NOT NULL,              -- MIC peer_id or 'orchestrator'
  issued_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '5 minutes',
  status text DEFAULT 'open' CHECK (status IN ('open', 'completed', 'expired'))
);

CREATE TABLE IF NOT EXISTS fleet_broadcast_ack (
  broadcast_id uuid REFERENCES fleet_broadcast(id) ON DELETE CASCADE,
  peer_id text NOT NULL,
  ack_status text NOT NULL CHECK (ack_status IN ('received', 'processing', 'completed', 'failed', 'declined')),
  result jsonb,
  acked_at timestamptz DEFAULT now(),
  PRIMARY KEY (broadcast_id, peer_id)
);

CREATE INDEX idx_fleet_broadcast_open ON fleet_broadcast(status, expires_at) WHERE status = 'open';
CREATE INDEX idx_fleet_broadcast_ack_peer ON fleet_broadcast_ack(peer_id, acked_at DESC);

-- RLS
ALTER TABLE fleet_broadcast ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_broadcast_ack ENABLE ROW LEVEL SECURITY;

-- Anon SELECT (peers see broadcasts targeting them)
CREATE POLICY fleet_broadcast_anon_select ON fleet_broadcast FOR SELECT TO anon USING (true);
CREATE POLICY fleet_broadcast_ack_anon_insert ON fleet_broadcast_ack FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY fleet_broadcast_ack_anon_update ON fleet_broadcast_ack FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Service-role-only INSERT for broadcasts (only MIC/orchestrator can publish)
-- (No public INSERT policy; MIC writes via service_role from orchestrator's Edge Function)

-- Add to Realtime publication so peer subscribers fire on INSERT
ALTER PUBLICATION supabase_realtime ADD TABLE public.fleet_broadcast;
```

### B. `mic-broadcast` Edge Function

POST endpoint where MIC publishes a broadcast. Validates issuer, inserts into `fleet_broadcast`. Returns the broadcast_id.

Deploy: `npx supabase functions deploy mic-broadcast --project-ref ruuxzilgmuwddcofqecc --no-verify-jwt`

### C. Desktop app — broadcast listener + dispatcher

In `src/main/index.ts` (or a new `src/main/mic_broadcast_listener.ts`):

1. **On peer registration (after `registerPresenceConfig` + `startPeerServer`):** subscribe to Supabase Realtime channel for `fleet_broadcast` table INSERTs filtered by `(target_tier IN ('all', my_tier) OR target_peer_ids ? my_peer_id)`.

2. **On received broadcast:** dispatch by `broadcast_type`:

   **`auto_update`:**
   - payload: `{ version: "0.5.7", url: "https://mnemosynec.ai/download/latest.yml", restart_mode: "silent" | "prompt" | "queued" }`
   - Action: `autoUpdater.checkForUpdates()` → on download complete → if `restart_mode === 'silent'` AND peer is idle (no active Pipeline conversation), `autoUpdater.quitAndInstall(true, true)`. If `restart_mode === 'prompt'`, show modal "Update v0.5.7 ready. Restart now?" If `restart_mode === 'queued'`, store flag, apply on next user-initiated restart.
   - Ack: 'completed' after download succeeds (before restart) or 'failed' with error.

   **`config_set`:**
   - payload: `{ key: "ollama.keep_alive", value: "24h", scope: "ollama" | "app" }`
   - Action: apply config — `scope=ollama` issues POST to local Ollama API; `scope=app` updates app preferences.
   - Ack: 'completed' with new state confirmed.

   **`fleet_warmup`:**
   - payload: `{ model: "gemma4:12b", warmup_prompt: "ping" }`
   - Action: POST to local Ollama `/api/generate` with the warmup prompt to load model into VRAM.
   - Ack: 'completed' with load latency_ms.

   **`health_snapshot`:**
   - payload: `{}` (or filter spec)
   - Action: gather `{ ram_free, ollama_models, version, uptime_s, last_question_processed }` and ack with that as `result`.

   **`benchmark_run`:**
   - payload: `{ benchmark_id: "mmlu_pro_70", coordination_token: "<some_id>" }`
   - Action: signal peer to participate in synchronized benchmark via wan-relay-route.

   **`noop_test`:**
   - payload: `{ message: "channel test" }`
   - Action: ack only. For testing the broadcast pipeline.

3. **Acknowledgment write:** INSERT into `fleet_broadcast_ack` with status + result. Update on completion.

4. **Truth-Always discipline:** if peer is unable to satisfy a broadcast (e.g. update download failed, config invalid, ollama unreachable), ack with `failed` + explicit error in `result`. Never silently drop.

### D. MIC orchestrator CLI helper

`tools/mic-broadcast/issue.mjs` — small command-line wrapper Knight can use:

```bash
node tools/mic-broadcast/issue.mjs auto_update --version=0.5.7 --restart-mode=silent --target=all
node tools/mic-broadcast/issue.mjs config_set --key=ollama.keep_alive --value=24h --scope=ollama --target=all
node tools/mic-broadcast/issue.mjs fleet_warmup --model=gemma4:12b --target=premium
node tools/mic-broadcast/issue.mjs health_snapshot --target=all
node tools/mic-broadcast/issue.mjs noop_test --message="channel ack test" --target=all
```

POSTs to `mic-broadcast` Edge Function, polls `fleet_broadcast_ack` for results, prints summary table.

### E. v0.5.7 ship

Bump 0.5.6 → 0.5.7. Build `dist:win`. Ship to both `mnemosynec.ai` + `mnemosynec.org` (the I3c lesson — `static/download/latest.yml` is Hugo source). Update `latest.yml`. Firebase deploy.

---

## SEGs

### SEG-I7a · TABLES + RLS

Create migration `supabase/migrations/20260618000009_fleet_broadcast.sql` with the SQL above. Apply via psql safe-subshell. Verify both tables + indexes + RLS policies + Realtime publication addition.

**Sharp I7a:** TABLES_LIVE = both tables present, RLS enabled, Realtime sees `fleet_broadcast` in publication.

### SEG-I7b · EDGE FUNCTION mic-broadcast

Build + deploy `platform/supabase/functions/mic-broadcast/index.ts`. Accept POST `{broadcast_type, target_tier, target_peer_ids, payload, issued_by, ttl_minutes}`. Validate. Insert. Return `{broadcast_id, status: "open"}`.

**Sharp I7b:** EDGE_FN_LIVE = endpoint returns 201 with broadcast_id on smoke POST.

### SEG-I7c · DESKTOP LISTENER + 6 DISPATCHERS

Implement `src/main/mic_broadcast_listener.ts` (or extend `index.ts`). Subscribe to `fleet_broadcast` Realtime. Dispatch each broadcast_type to its handler. Write acks. tsc clean.

**Sharp I7c:** LISTENER_WIRED = 6 dispatch handlers present, ack mechanism wired, tsc clean.

### SEG-I7d · CLI HELPER

Build `tools/mic-broadcast/issue.mjs` — generic issuer that supports all 6 broadcast types via argv. Polls acks for 30s. Prints summary.

**Sharp I7d:** CLI_USABLE = `node issue.mjs noop_test --target=all` works end-to-end in dev.

### SEG-I7e · BUMP + BUILD v0.5.7

`package.json` 0.5.6 → 0.5.7. `npm run build:renderer && npm run build:main && npm run dist:win`. Verify installer exists.

**Sharp I7e:** V0_5_7_BUILT = installer present at release path, size + sha512 captured.

### SEG-I7f · SHIP v0.5.7 TO BOTH DOMAINS

Copy installer to both `static/download/` AND `public-mnemosynec/download/` (I3c lesson). Update `latest.yml` with v0.5.7 metadata. Hugo build. Firebase deploy. Verify 200 on both `.ai` AND `.org`.

**Sharp I7f:** V0_5_7_LIVE = mnemosynec.ai + mnemosynec.org both 200 on `/download/MnemosyneC-Setup-0.5.7.exe`, `latest.yml` advertises 0.5.7.

### SEG-I7g · FLEET-WIDE NOOP_TEST

Once v0.5.7 has propagated (Founder can either tell each peer to relaunch OR use this build to push subsequent updates — bootstrap problem: v0.5.6 doesn't have the listener yet, so first jump to v0.5.7 still needs manual relaunch):

After all 5 peers are on v0.5.7: issue `noop_test` broadcast. Confirm all 5 peers ack within 10s.

**Sharp I7g:** CHANNEL_PROVEN = 5/5 acks received, all status='completed', round-trip latency < 5s for LAN peers, < 10s for Son.

### SEG-I7h · DEMONSTRATE WITH AUTO_UPDATE TO v0.5.8 (future, optional)

When v0.5.8 ships in some future cycle, the MIC issues an `auto_update` broadcast — fleet self-updates without Founder touching any keyboard. **First proof point of MIC autonomy.**

---

## Bootstrap caveat

v0.5.6 (current) doesn't have the broadcast listener. To get the fleet onto v0.5.7 (which DOES), Founder still has to do one final manual relaunch round. After that, every subsequent version push is one broadcast away from fleet-wide rollout.

This is the canonical "build the autonomy ladder, then climb it once" — the manual step happens exactly once and never again.

---

## Sharps return

| # | Sharp | Pass criterion |
|---|---|---|
| I7a | TABLES_LIVE | fleet_broadcast + fleet_broadcast_ack tables + RLS + Realtime publication |
| I7b | EDGE_FN_LIVE | mic-broadcast endpoint live, smoke POST returns 201 |
| I7c | LISTENER_WIRED | desktop subscribes + dispatches 6 broadcast_types + writes acks |
| I7d | CLI_USABLE | `tools/mic-broadcast/issue.mjs` works for all 6 types |
| I7e | V0_5_7_BUILT | installer exists at release path |
| I7f | V0_5_7_LIVE | both domains 200, latest.yml advertises 0.5.7 |
| I7g | CHANNEL_PROVEN | fleet-wide noop_test ack from all peers within 10s |

---

## Composition

Independent of I5 (already done). Composes WITH I5: when a peer receives an auto_update broadcast, the underlying mechanism is the same Electron autoUpdater that v0.5.6 + earlier already use. We're just adding a "MIC can tell you to check now" wrapper.

Composes WITH `canon_thorax_defensive_architecture_phase_1_live_bp047`: the Thorax heartbeat verifies peers; the MIC broadcast TELLS them what to do. Both layers.

**Future cooperative members (any tier, any hardware, anywhere)** receive fleet broadcasts the same way Founder's fleet does. No special-casing. Base tier peers can be told to update; member tier can be told to participate in coordinated personalization sync; etc.

---

**Composed by Bishop BP086. The MIC primitive that closes the manual-relay gap.**
