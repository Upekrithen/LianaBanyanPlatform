# KNIGHT YOKE · I10.5 · RLS FIX + SILENT-CATCH FIX · BP087

**From:** Bishop · BP087 · §14 catch (confirmed via I10 + I10b probes)
**To:** Knight
**Class:** Surgical fix — unblocks BLACK MAMBA + future-proofs the channel
**Model:** Sonnet 4.6 verbatim (Statutes §3 · NEVER "4.5" per BP079) · **use segs**
**Priority:** UNBLOCKS BLACK MAMBA · UNBLOCKS THUNDERCLAP · UNBLOCKS PATH X

---

## §0 — Diagnostic closure (empirical, gadget-verified)

Bishop ran I10 probe + I10b probe with service-role key against the live DB. Findings:

**5 peers ALL alive on v0.5.8, env-loader working:**
- peer=cb4ef450 version=0.5.8 last_seen=3s ago
- peer=d0b47bd0 version=0.5.8 last_seen=42s ago
- peer=c532e740 version=0.5.8 last_seen=51s ago
- peer=49f3e597 version=0.5.8 last_seen=57s ago
- peer=88cbf6bd version=0.5.8 last_seen=60s ago

**7 broadcasts in `fleet_broadcast` lifetime · 1 ack ever (Knight's manual-probe-i10c from prior diagnostic).**

Eliminated: H1 (process), H2 (Realtime), H4 (env loader). **Confirmed: H3 (RLS deny on broadcast tables for anon role).** peer_presence anon-writes succeed; fleet_broadcast / fleet_broadcast_ack anon-reads/writes silently fail. Likely cause: tables were created via Supabase Studio SQL Editor with default `enable row level security` but no policies — Supabase default-denies any role without a matching policy.

**Composing drift surfaced (NOT this yoke's scope; flag-only):** the `mic-broadcast` Edge Function source AND the `fleet_broadcast` / `fleet_broadcast_ack` table migrations are NOT in the local `supabase/migrations/` folder. Schema lives in Studio, not git. Substrate-discipline violation. End-of-cycle canon mint queued: `canon_supabase_schema_must_live_in_git_not_studio_bp087`.

---

## §1 — Sharps (use segs · Sonnet 4.6 verbatim)

### I10.5a · Author + apply RLS migration

Author a new migration at `C:\Users\Administrator\Documents\LianaBanyanPlatform\supabase\migrations\20260619000000_fleet_broadcast_rls.sql`:

```sql
-- BP087 I10.5 · fleet_broadcast + fleet_broadcast_ack RLS policies
-- Issue: tables had RLS enabled but no policies → default-deny for anon role
-- Symptom: desktop v0.5.8 listeners (anon key) silently failed to read broadcasts or write acks
-- Composes with: BP086 MIC STAMPED canon (signature verification is I8 follow-on, NOT this migration)
-- Truth-Always: this enacts the v0.5.7-era design (unsigned channel); I8 adds Ed25519 verification on top

-- 1. Ensure RLS is enabled (no-op if already on)
alter table public.fleet_broadcast enable row level security;
alter table public.fleet_broadcast_ack enable row level security;

-- 2. anon read of ACTIVE broadcasts only, last 10 min (limits exposure surface)
drop policy if exists anon_read_active_recent_broadcasts on public.fleet_broadcast;
create policy anon_read_active_recent_broadcasts
  on public.fleet_broadcast
  for select
  to anon
  using (
    status = 'active'
    and created_at > now() - interval '10 minutes'
  );

-- 3. anon INSERT acks (write-only; no select required)
drop policy if exists anon_insert_acks on public.fleet_broadcast_ack;
create policy anon_insert_acks
  on public.fleet_broadcast_ack
  for insert
  to anon
  with check (true);

-- 4. anon UPDATE acks (for ON CONFLICT merge-duplicates pattern the listener uses)
drop policy if exists anon_update_acks on public.fleet_broadcast_ack;
create policy anon_update_acks
  on public.fleet_broadcast_ack
  for update
  to anon
  using (true)
  with check (true);

-- 5. service_role keeps full access (implicit; no policy needed — bypasses RLS by default)

-- Verification queries (run after apply):
--   select policyname, cmd, roles from pg_policies where tablename in ('fleet_broadcast','fleet_broadcast_ack');
--   -- expect 3 rows: anon_read_active_recent_broadcasts (select), anon_insert_acks (insert), anon_update_acks (update)
```

Apply via Supabase CLI (or manual SQL Editor if CLI not wired):
```
supabase db push
```

Or manual SQL Editor execute the migration contents verbatim.

**Constraint:** absolute paths (Statutes §4 + BP076). PowerShell `;` not `&&`.

### I10.5b · Fix the silent-catch swallows in the desktop listener

Edit `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts`:

**Change 1 · `postAck` (around L5383):**
```typescript
// BEFORE
}).catch(() => {});

// AFTER
}).then(async (res) => {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.warn(`[mic-broadcast] ack POST failed HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
}).catch((e) => {
  console.warn(`[mic-broadcast] ack POST threw: ${String(e).slice(0, 200)}`);
});
```

**Change 2 · `pollBroadcasts` (around L5636):**
```typescript
// BEFORE
} catch {
  // Silent — don't crash main process on poll error
}

// AFTER
} catch (e) {
  console.warn(`[mic-broadcast] poll failed: ${String(e).slice(0, 200)}`);
}

// Also: just before `if (!res.ok) return;` at L5612 — change to:
if (!res.ok) {
  const body = await res.text().catch(() => '');
  console.warn(`[mic-broadcast] poll HTTP ${res.status}: ${body.slice(0, 200)}`);
  return;
}
```

**Rationale:** silent catches are how this regression hid for hours. Per `canon_truth_always_*` + `canon_fix_as_we_go_build_for_the_long_haul_always_convenient_immutables_bp053` — fix STRUCTURALLY, not patch and move on. Logging the silence costs nothing and prevents the next BP087-class debug archaeology.

These log lines DO NOT need to ship to renderer / Founder UI. Main-process `console.warn` is fine — appears in app log file + Electron stderr.

### I10.5c · Re-fire noop_test (verify the fix lands)

After I10.5a + I10.5b merged and v0.5.9 deployed AND peers updated (auto_update broadcast can fire now that the channel works):

```powershell
node "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mic-broadcast\issue.mjs" --type=noop_test --version=0.5.9 --watch --poll-until=5 --timeout-s=60
```

**Expected:** 5/5 acks within 60s.

If 5/5 GREEN → channel proven live → I10.5 complete → BLACK MAMBA unblocked → ship the unfair-advantage stack wiring.
If still 0/5 or partial → return to Bishop with the new log output (the silent-catch fix means we'll have visibility this time).

### I10.5d · Auto-update broadcast (after I10.5c proves the channel)

Once noop_test 5/5 green confirms the channel is alive, fire ONE auto_update broadcast to bring all 5 peers to whatever version v0.5.9 ships AS. This is the LAST time anyone (peer or operator) has to touch a peer manually for a version bump — the v0.5.6→v0.5.7→v0.5.8 manual cycle ends here.

```powershell
node "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mic-broadcast\issue.mjs" --type=auto_update --version=0.5.9 --payload='{"version":"0.5.9","restart_mode":"prompt"}' --watch --poll-until=5
```

### I10.5e · Canon mint queue (Bishop mints at I10.5 close)

- `canon_fleet_broadcast_rls_policies_anon_role_required_v0_5_9_bp087` — the fix itself, document the design
- `canon_silent_catch_swallowed_rls_regression_log_the_silence_bp087` — the discipline lesson: never `.catch(() => {})` on a Supabase REST call without logging
- `canon_supabase_schema_must_live_in_git_not_studio_bp087` — the Drift caught: every Supabase Edge Function + table migration lives in `supabase/migrations/` and `supabase/functions/`, never authored only via Studio SQL Editor (Designed-to-be-Copied violation otherwise)

---

## §2 — BLACK MAMBA status update

After I10.5 returns GREEN:

The BLACK MAMBA yoke at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_BLACK_MAMBA_THUNDERCLAP_100_FULL_WIRING_BP087.md` is **UNBLOCKED**. Ship it as the next dispatch. v0.5.9 (this yoke's release) is the foundation v0.5.10 (MAMBA's release) builds on top of.

If Knight prefers to fold I10.5b silent-catch fix INTO the BLACK MAMBA v0.5.10 release (since v0.5.9 already touches the listener), do so — surface that decision in I10.5's return.

---

## §3 — Statutes binding

- §2 IMMUTABLES — fix-one-thing-FULLY-before-moving-on · ALWAYS mint small canon eblet · Truth-Always at every claim · BP053 fix-as-we-go (fix the silent catch INLINE, not "later")
- §3 SEGs Sonnet 4.6 verbatim
- §4 absolute paths · PowerShell `;` · secrets blacklist
- §6 supabase RLS discipline (this yoke IS the discipline enforcement)
- §12 Knight-direct
- BP076 absolute paths every file reference
- A14 BLOOD: Bishop gadget-verified before composing this yoke (probe-i10 + probe-i10b empirical evidence)
- A15 BLOOD: SEGs do the production
- A16 BLOOD: Founder ratifies the THUNDERCLAP receipt at end-of-cycle, NOT this yoke mid-flow

---

## §4 — Return format

Knight yoke return SHALL contain:

1. Migration file full absolute path
2. Migration apply confirmation (SQL execution log OR Supabase CLI output)
3. RLS policy verification query output (the `select policyname, cmd, roles from pg_policies WHERE ...` row dump)
4. v0.5.9 commit hash · tsc exit code (must be 0) · installer SHA512 + size
5. Firebase deploy commands run + 4-curl-check output verbatim (latest.yml + installer 200 on both `mnemosynec.ai` and `mnemosynec.org`)
6. noop_test fire log — 5/5 acks expected within 60s
7. auto_update fire log — 5/5 received within 60s
8. Decision on whether I10.5b silent-catch fix shipped in v0.5.9 OR deferred to v0.5.10 BLACK MAMBA
9. ISO-8601 UTC timestamps throughout

---

— Bishop · BP087 · 🌊⚓ · *Always convenient. Fix as we go. Log the silence. Truth-Always.*
