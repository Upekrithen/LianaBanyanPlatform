# Battery Dispatch Legacy Migration Retirement Note
## Decision: RETIRE
**Authored:** K-C · BP058 W6 · Knight (Cursor/Sonnet 4.6) · 2026-05-25  
**Canon refs:** spec_spinout_04_battery_dispatch §6 · eblet-battery-dispatch-discord-plug-substrate-bp058 §3 forward-binding

---

## §1 Migrations Under Review

All 4 Battery Dispatch legacy migrations are in `platform/supabase/migrations/_archive_legacy_pre_baseline/`:

| File | Purpose |
|---|---|
| `20260404000030_battery_dispatch_platform_config.sql` | Platform config table for Battery Dispatch |
| `20260404000035_battery_dispatch_access_gating.sql` | Access gating logic |
| `20260404000036_battery_dispatch_access_trigger_compat.sql` | Trigger compatibility layer |
| `20260404000037_battery_dispatch_access_verification_b076.sql` | Access verification (b076 line) |

---

## §2 Decision: RETIRE

**Verdict: RETIRE — these migrations are pre-baseline and superseded.**

### Evidence

1. **Already archived** — All 4 files are in `_archive_legacy_pre_baseline/`, indicating they were intentionally archived when the current Supabase baseline was established. They have NOT run against the production schema.

2. **No active production Battery Dispatch dashboard** — Per spinout spec §6: "no live dashboard · Broadcast Scheduler engine not productized · no grid-signal adapter live · cost+20% settlement not wired." Battery Dispatch is a planned spinout, not a live production system.

3. **Canon spec §6 explicitly flags them** — spec_spinout_04_battery_dispatch.eblet.md §6 states: "access-gating migrations are pre-baseline (need re-validation against current supabase baseline)" and §7 move 1 says: "Resurrect/re-baseline the 4 legacy supabase migrations against current schema **or formally retire**."

4. **Drift Eblet forward-binding** — eblet-battery-dispatch-discord-plug-substrate-bp058 §5 forward-binding 3: "the 4 legacy migrations need re-validation against current Supabase baseline OR formal retirement (carry from BP052 spec §6)" — this note IS that formal retirement.

5. **Schema conflict risk** — Running these pre-baseline migrations against the current schema (post many subsequent migrations) would require careful audit for column conflicts, especially given the Discord plug migration (`20260307000016_substack_discord_plugs.sql`) which adds `webhook_url` to `user_social_plugs` — a table likely referenced by Battery Dispatch gating logic. Schema state diverged significantly.

---

## §3 What RETIRE Means

**RETIRE** here means:

- The 4 migrations remain in `_archive_legacy_pre_baseline/` as historical record (do NOT delete them)
- They are formally declared **will not be applied to production schema as-is**
- When Battery Dispatch V1 is productized (spinout spec §7 move 1 as a future session), new migrations will be authored against the then-current schema from scratch
- The Discord plug adapter (`plug_adapters/discord.ts`) and `social_plug_features` table already exist and are live — Battery Dispatch can build on THAT substrate when it's time

---

## §4 What Survives for Battery Dispatch

These are LIVE in the current substrate (empirically confirmed per eblet-battery-dispatch-discord-plug-substrate-bp058 §2):

| Asset | Status | Location |
|---|---|---|
| `social_plug_features` table with Discord row | LIVE | Current Supabase schema |
| `user_social_plugs.webhook_url` column | LIVE | Current Supabase schema |
| `plug_adapters/discord.ts` Edge Function | LIVE | `platform/supabase/functions/_shared/plug_adapters/discord.ts` |
| Journalism-bounty LB-included launch canon | RATIFIED | BP047 |
| Broadcast Scheduler™ sub-mark | RATIFIED | BP052 |
| Say It Fast™ compression discipline | RATIFIED | BP048 |
| `compile_battery_dispatch.py` build artifact | PRESENT | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` |
| `_battery_dispatch_style.css` | PRESENT | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` |

---

## §5 Next Actions When Battery Dispatch V1 Begins

1. Review the 4 archived migrations for INTENT (what tables/columns were designed)
2. Audit current schema for what already exists vs what needs to be added
3. Write fresh migrations with current naming conventions and timestamp format
4. Test against staging (mroz-74540) before production
5. Resurrect the Battery Dispatch UI spec from spec §5 member-facing surface candidates

---

*Retirement formally recorded per spec_spinout_04_battery_dispatch §6–7 · K-C BP058 W6*
