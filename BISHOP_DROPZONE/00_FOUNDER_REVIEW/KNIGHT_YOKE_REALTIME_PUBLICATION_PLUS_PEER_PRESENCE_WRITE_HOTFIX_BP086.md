# KNIGHT YOKE — Realtime Publication + peer_presence Write Path Hotfix

**Session:** BP086 · **Filed:** 2026-06-18 · **Filed by:** Bishop (Sonnet 4.6 SEG)
**Queue:** Drop into ACTIVE Knight #1 session (running G/H). Do NOT spawn new Knight.

**Knight preamble:** Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER. You are orchestrator, not implementer. Spawn Sonnet 4.6 SEGs for substantive work. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

**Statutes:** BP085 §14+§15+§16 BLOOD · §4 secrets BLOOD.

---

## Root causes (Bishop §14 gadget-verified BP086)

**v0.5.3 shipped with em-dash sweep + anon-key fallback + tier column — but Pipeline tab STILL shows ● Disconnected on M0+M3 because:**

1. `help_messages` and `peer_presence` are NOT in the `supabase_realtime` publication. CDC feed never fires. Realtime subscribe silently times out.
2. `peer_presence` has **ZERO rows all time**. Either wan-relay-publish isn't actually writing to `peer_presence` (F3 smoke showed `peer_id: null` in response) OR desktop app isn't sending presence payloads. THUNDERCLAP A3 gate blocked.

Diagnosis report: `BISHOP_DROPZONE` SEG return from Bishop §14 gadget pass · 2026-06-18.

---

## SEG-I1 · ADD TABLES TO REALTIME PUBLICATION (2 minutes · IMMEDIATE)

**Trivial migration. Apply via psql safe-subshell pattern.**

Create migration file at `supabase/migrations/20260618000006_realtime_publication_help_and_presence.sql`:

```sql
-- Add help_messages + peer_presence to supabase_realtime publication
-- so Pipeline tab Realtime subscribe actually receives CDC events.
-- Without this, channel.subscribe() silently times out forever.

ALTER PUBLICATION supabase_realtime ADD TABLE public.help_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.peer_presence;
```

Apply via:
```
(eval "$(grep -E '^SUPABASE_DB_URL=' /c/Users/Administrator/.claude/state/secrets/22May2026.env)"; psql "$SUPABASE_DB_URL" -f supabase/migrations/20260618000006_realtime_publication_help_and_presence.sql)
```

Verify:
```
(eval "$(grep -E '^SUPABASE_DB_URL=' /c/Users/Administrator/.claude/state/secrets/22May2026.env)"; psql "$SUPABASE_DB_URL" -c "SELECT tablename FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename IN ('help_messages', 'peer_presence');")
```

Expected: 2 rows returned.

**Sharp I1:** REALTIME_PUBLICATION_FIXED = both tables in pg_publication_tables for supabase_realtime.

After SEG-I1 lands: M0+M3 Pipeline tab should immediately flip from ● Disconnected → ● Connected · Base on next launch (no app rebuild required — Realtime is server-side).

---

## SEG-I2 · DIAGNOSE peer_presence WRITE PATH

**Recon-only. Do NOT implement fixes — just gather facts. Bishop will compose I3 fix yoke based on I2's findings.**

Read in full:
1. `platform/supabase/functions/wan-relay-publish/index.ts` — the F3-patched version. Confirm whether it writes to `peer_presence` table at all, or only to `wan_relay_records`. If it writes presence, where, and what's the conditional gate?
2. `src/main/federation/peer-discovery.ts` and `peer_server.ts` (per F1 recon — these contain `tryPublish`/`getCurrentTier`) — confirm:
   - Is `tryPublish()` being CALLED on app start?
   - Where? (which IPC handler, which lifecycle hook?)
   - What does it actually POST to wan-relay-publish? (the payload shape)
3. `src/renderer/components/FederationPeerMeshPanel.tsx` (per F4c) — does it trigger any peer registration as a side-effect of mounting? Or is it polling-only?

Smoke test the live behavior:
- HTTP POST to `https://relay.lianabanyan.com/functions/v1/wan-relay-publish` with a representative presence payload (use a fake peer_id like `b086_diagnose_test`). Confirm whether (a) it returns 202 and (b) the row appears in `peer_presence` for that peer_id within 5 seconds:
  ```
  curl -X POST https://relay.lianabanyan.com/functions/v1/wan-relay-publish \
       -H "Content-Type: application/json" \
       -d '{"sid":"b086diagtest","presence":{"peer_id":"b086_diagnose_test","tier":"base","capabilities":{}}}'
  ```
- Then verify:
  ```
  (eval "$(grep -E '^SUPABASE_DB_URL=' /c/Users/Administrator/.claude/state/secrets/22May2026.env)"; psql "$SUPABASE_DB_URL" -c "SELECT peer_id, tier, last_seen_at FROM peer_presence WHERE peer_id='b086_diagnose_test';")
  ```
- Clean up: `DELETE FROM peer_presence WHERE peer_id='b086_diagnose_test';`

Write findings to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/PEER_PRESENCE_WRITE_PATH_DIAGNOSIS_BP086.md`:
- Does wan-relay-publish actually write to peer_presence? Y/N + line numbers
- Does the desktop app actually call wan-relay-publish on launch? Y/N + code locations
- Did the smoke POST land a row in peer_presence? Y/N
- ROOT CAUSE: 1-sentence
- RECOMMENDED FIX: code path + estimated effort

**Sharp I2:** WRITE_PATH_DIAGNOSED = diagnosis doc filed with concrete answers + root cause + recommended fix path.

---

## SEG-I3 (composed by Bishop after I2 returns)

Bishop will compose I3 based on I2's findings. Likely shapes:
- If wan-relay-publish doesn't write peer_presence → patch the Edge Function to UPSERT into peer_presence when presence payload detected
- If desktop doesn't call wan-relay-publish on launch → wire it (probably v0.5.4 hotfix)
- If both → both fixes

Knight: do NOT pre-emptively guess at I3. Report I2 cleanly, Bishop composes.

---

## Composition with current Knight #1 work

This yoke is independent of:
- Stream G (CT bounty wall copy apply — touches Cephas-hugo / cerostechnology repo)
- Stream H (firebase deploy health-check hook — touches ~/.claude/hooks/)

Fan freely. I1 is 2-minute SQL. I2 is recon. I3 will be small after I2 returns.

---

## Sharps return

| # | Sharp | Pass criterion |
|---|---|---|
| I1 | REALTIME_PUBLICATION_FIXED | help_messages + peer_presence both in pg_publication_tables for supabase_realtime |
| I2 | WRITE_PATH_DIAGNOSED | diagnosis doc with concrete answers · ROOT CAUSE · recommended fix path |

Knight reports I1 + I2 Sharps to Bishop. Bishop composes I3 after.

---

**Composed by Bishop BP086. Drop-in to Knight #1 G/H session.**
