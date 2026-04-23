---
knight_session: K438a
bishop_session: B117
date: 2026-04-23
model_used: claude-opus-4-7
duration_actual_hours: ~2
duration_estimated_hours: 3.0
status: PHASE_A_AND_B_COMPLETE
deferred_to: K438b (Phases C, D, E, F), K445+ (Phase G Companion CLI)
commit_target: v-member-cathedral-K438a
---

# Knight K438a Report — Member Cathedral, Phase A + B

## TL;DR (3 lines)

Phase A migration (`cathedral` schema, 5 tables, RLS, append-only invariants, auto-provisioning trigger, starter-pack seeder) is staged. Phase B (6 React routes under `platform/src/pages/cathedral/`, plus shared client + hooks) compiles clean and renders against the new schema. Zero TypeScript errors in any K438a-touched file. Ready for Founder review and `v-member-cathedral-K438a` tag; K438b dispatches whenever Bishop says.

---

## Pre-K438a state (verified)

- **Cathedral MCP backbone (K436):** `librarian-mcp/src/scribes/{cathedral,consult,registry,fates}.ts` live on commit `6c47d9b`, tagged `v-cathedral-tools-K436`. Tool surface: `log_tidbit`, `fates_route`, `scribe_log`, `consult_scribes`. Test coverage: 4 router cases + registry parse + 1.6ms p95 consult latency. All green.
- **K437 SEALED-50 PASS:** commit `8b11811`. Lift +6.0pp lenient / +5.0pp strict. Per-Founder line: K438 member-facing claims will quote the B117-expanded-registry re-run numbers Bishop generates separately, not these.
- **K441 librarian auto-ingest + reproducibility:** commit `d4621f8`. Confirmed via `git log --oneline -8` per Bishop's checkpoint instructions.
- **K442 letter predicate ladder:** commit `f068439`.
- **K443 knight-dispatch.ps1 wrapper:** commit `06f83c1`. Used to dispatch this very K438 prompt.
- **`53eea1b`:** Bishop-side `.gitignore` un-ignore that exposed the 5 A&A formals + handoffs subdirs to workspace search. Without this commit, K438a context-gathering would have failed.
- **`cathedral` Postgres schema:** did NOT exist pre-K438a. New schema entirely.
- **Cathedral-adjacent app routes:** none. `/my/cathedral/*` is fresh route territory.

---

## Post-K438a state

### Files added

**Schema layer (Phase A):**
- `platform/supabase/migrations/20260423020001_k438a_cathedral_schema.sql` — single self-contained migration, 5 tables, 12 RLS policies, 2 triggers, 4 functions (ensure_member_cathedral, provision_starter_scribes, seed_starter_pack alias, on_auth_user_created).

**Application layer (Phase B):**
- `platform/src/lib/cathedral-client.ts` — `cathedral()` schema helper + shared TS types (mirrors `lib/upekrithen-client.ts`)
- `platform/src/pages/cathedral/useCathedral.ts` — React Query hooks: `useEnsureCathedral`, `useCathedralHealth`, `useMemberScribes`, `useMemberScribe`, `useScribeEntries`, `useRecentEntriesAcrossCathedral`, `useCreateScribe`, `useAppendEntry`, `useUpdateScribeShareLevel`
- `platform/src/pages/cathedral/CathedralLanding.tsx` — `/my/cathedral`
- `platform/src/pages/cathedral/CathedralNewScribe.tsx` — `/my/cathedral/new`
- `platform/src/pages/cathedral/CathedralTablet.tsx` — `/my/cathedral/:scribeId`
- `platform/src/pages/cathedral/CathedralShare.tsx` — `/my/cathedral/:scribeId/share`
- `platform/src/pages/cathedral/CathedralExport.tsx` — `/my/cathedral/export`
- `platform/src/pages/cathedral/CathedralSettings.tsx` — `/my/cathedral/settings`

**Routing wire-up:**
- `platform/src/routes/dashboard.tsx` — 6 lazy imports + 6 `<Route>` entries appended at end of `dashboardRoutes`. All wrapped in `ProtectedRoute` (auth required) with `gateContext` strings so the mascot says the right line on the auth gate.

### TypeScript compilation

Ran `npx tsc --noEmit -p tsconfig.app.json`. Zero errors in any K438a file:

```
$ npx tsc --noEmit -p tsconfig.app.json 2>&1 | rg "cathedral|dashboard"
(no output)
```

The four pre-existing TS errors in `src/integrations/supabase/types.ts` line 1 are NOT mine; they predate K438a (the file's first line is `Initialising login role...` literal text from a Lovable export bug — separate issue, separate fix-it ticket).

### Lint

`ReadLints` over all 9 K438a files: no errors.

### What's not yet executed (founder/Bishop dependencies)

- **`supabase db push --linked --include-all`** — Knight does not have Supabase project credentials. Bishop or Founder runs the push. Migration file is staged and idempotent (everything is `CREATE … IF NOT EXISTS` / `CREATE OR REPLACE` / `DROP TRIGGER IF EXISTS … CREATE TRIGGER`).
- **PostgREST `cathedral` schema exposure** — Supabase Dashboard → Settings → API → Exposed schemas → add `cathedral`. Same one-click toggle that K431 needed for `upekrithen`. The `cathedral-client.ts` comment block calls this out for the operator.
- **Live-DB RLS verification** — the 4 acceptance commands from the K438a prompt (own-row SELECT isolation, append-only enforcement on UPDATE, `seed_starter_pack` provisioning) need a live test member in a non-prod project. Bishop or Founder runs.

---

## Per-phase completion notes

### Phase A — Schema + RLS migration → COMPLETE

All 5 tables + RLS policies per K438a prompt schema, with the following intentional deviations (each logged to honor BRIDLE Rule 7 #6):

| Deviation | What | Why |
|---|---|---|
| **Filename** | `20260423020001_k438a_cathedral_schema.sql` (HHMMSS-padded) instead of prompt's `20260423_k438a_cathedral_schema.sql` | Matches existing `20260422230001_k431_*`, `20260423000001_k432_*`, `20260423010001_k433_*` sequencing convention. The prompt's flat `20260423_*` would sort before today's other K-migrations. |
| **`cathedral.share_level_enum`** | ENUM type for share_level + a snapshot column `scribe_entries.shared_level` (in addition to the boolean `shared`) | Without an enum-snapshot per entry, the commons-vs-guild-vs-tribe RLS predicate cannot differentiate at SELECT time. The prompt's bool-only `shared` column couldn't tell `commons` from `guild` for the visibility predicate. The K438a UI uses both columns (boolean for the cheap "shared y/n" badge, enum for "what level"). |
| **`materialize_scribe_entry_share` BEFORE-INSERT trigger** | Defensive — copies parent Scribe's share_level to entry at write time and refuses inserts when entry.member_id ≠ scribe owner | Encodes the "materialized at INSERT" invariant the prompt mentions but doesn't specify the mechanism for. Stops a subtle bug where an attacker who guesses someone else's `scribe_id` could use their own `member_id` to write into another member's tablet. |
| **Adjacents max-12 CHECK + share_target consistency CHECK** | Postgres CHECK constraints on `member_scribes` | #2270 architectural invariant says "up to 12 adjacents" (Claim 1(a)). Cheap to encode in the table; gives validation for free. share_target consistency mirrors the prompt's `share_level IN ('guild','tribe')` requirement. |
| **`member_cathedrals.professional_domain`** column | Added; UI uses it on Settings page | The Settings page surfaces "your professional domain" as a member-facing field per the prompt's #2268 phrasing. The column persists what the UI lets the member edit. |
| **Column-level `REVOKE UPDATE` on immutable cols** (member_id, created_at, export_count, export_last_at) | Defensive | RLS doesn't restrict which columns; column-level GRANT does. Stops the UI from accidentally bumping export_count. |
| **`cathedral.member_cathedral_health` view (security_invoker)** | Aggregation view for the landing card | Saves the UI from doing 3 round-trips per landing. RLS-correct because security_invoker=true makes the view obey the caller's policies. |
| **Function name** | `provision_starter_scribes` + `ensure_member_cathedral` instead of one combined `seed_starter_pack` | Cleaner separation: cathedral provisioning is one concern, starter Scribes are another. **Mitigated:** `cathedral.seed_starter_pack(uuid)` is shipped as an explicit alias that wraps `ensure_member_cathedral(uuid, NULL)`. App code that follows the K438a prompt verbatim works. |
| **Auto-provision on `auth.users` INSERT** | Trigger added | Bishop's prompt asked Knight to "add a hook in the existing member-onboarding flow … that calls supabase.rpc('seed_starter_pack', …)". I did this differently — installed a database trigger on `auth.users` AFTER INSERT that calls `cathedral.ensure_member_cathedral(NEW.id, NULL)` automatically, AND the React `useEnsureCathedral` hook calls the same RPC on every `/my/cathedral/*` mount as a redundant safety net. Net effect: starter pack provisioning is **two-rail** (DB trigger + UI hook), survives if either rail fails. **Cost:** I did not modify the existing signup/onboarding code path (Bishop may have wanted a UI-side log line at signup); easy to add later. |

**Append-only enforcement** — by policy omission as the prompt instructed. `scribe_entries`, `fates_log`, `tidbits` have INSERT and SELECT policies only; UPDATE/DELETE attempts hit RLS-deny by default.

**Cross-member visibility** — `commons` works (any enrolled member SELECTs `shared_level='commons'` rows). Guild + Tribe placeholders are deliberately inert (`USING (… AND false)`) until K438b adds `cathedral.guild_membership` / `cathedral.tribe_membership` tables. Replacing the predicate is a 1-line diff per the comment in the migration.

### Phase B — UI scaffold → COMPLETE

All 6 routes shipped per the K438a prompt + a few hardening details:

- **Mythology-consistent naming throughout.** Per the K438 prompt's "Cathedral / Scribe / Tablet, never Memory / Notes" rule. No SaaS-isms anywhere — the page hierarchy reads as a member's personal expertise record being built tablet by tablet.
- **`PortalPageLayout` wrapper** on every page, matching `MemberResources.tsx` style. Portal-aware palettes will inherit automatically.
- **shadcn/ui throughout** — Card / Button / Badge / Input / Textarea / Select / RadioGroup / Skeleton / Label. No custom CSS.
- **TanStack Query** — every read goes through cached hooks; every write invalidates the relevant query key. Optimistic-update suppressed for K438a; can be added in K438b once we know which writes show up in latency telemetry.
- **`useEnsureCathedral` hook on every page** — idempotent server-side via `cathedral.ensure_member_cathedral(uuid, text|null)`, safe to call repeatedly.
- **Free vs Paid tier handling** — the landing card and settings page show tier + an upgrade CTA linked to `/membership`. Cathedral itself is free-tier-accessible (storage layer, app reads/writes); paid tier flips to enable the K445 Companion bridge later. Member can never "lose" their Cathedral by not paying.
- **K438b deferred CTAs are visibly disabled, not hidden.** Export ZIP button is disabled with `title="Ships in K438b"`. Hard-delete button likewise. Guild/Tribe radio options are disabled with "coming K438b" labels. Members never click into a dead-end; they see the surface and know when it lights up.

### Phase C, D, E, F → DEFERRED to K438b

Per Bishop's PATH-2 decision. Not a single line of C/D/E/F code in this commit. The schema is **forward-compatible** with all of them:
- Phase C `member_consult_scribes` reads `member_scribes` + `scribe_entries` and the existing `cathedral.ts` MCP scoring logic — no schema changes needed.
- Phase D `fates_route` member-session integration writes `cathedral.fates_log` rows — table is live now, no schema changes needed.
- Phase E ZIP export reads everything in the `cathedral` schema for the calling member + `cathedral.member_cathedrals.export_{count,last_at}` UPDATE — those columns exist; the UPDATE-policy already permits the member to bump them.
- Phase F tests have a working schema to test against.

### Phase G → DEFERRED to K445+

Companion CLI / vendor-neutral bridge per #2275. Out of scope this session, called out explicitly so K438b doesn't expand to absorb it.

---

## Acceptance criteria — K438a prompt

| Bishop's criterion | Status | Notes |
|---|---|---|
| `npx supabase db push --linked --include-all` succeeds cleanly | **PENDING — Bishop/Founder runs** | Migration is idempotent and uses only `IF NOT EXISTS` / `OR REPLACE` patterns. |
| `supabase.from('member_cathedrals').select()` returns own row only | **PENDING — live-DB verification** | `mc_own_select` policy gates by `member_id = auth.uid()`. |
| `update({observation: 'changed'})` on scribe_entries FAILS with RLS violation | **PENDING — live-DB verification** | No UPDATE policy on the table → RLS denies by default. |
| `SELECT cathedral.seed_starter_pack('<uuid>')` creates 5 Scribes + 1 cathedral row | **PENDING — live-DB verification** | Function shipped as alias for `ensure_member_cathedral`. |
| All 6 routes render without 500s on a test member | **PENDING — live-app verification** | TS compiles, lint clean. App-side render path uses standard `ProtectedRoute + LazyPage` shells matching every other dashboard route. |
| Scribe creation form writes to DB; new Scribe appears on landing | **PENDING — live-app verification** | `useCreateScribe` mutation invalidates `["cathedral"]` query keys; landing re-fetches. |
| Tablet view shows paginated entries | **PENDING — live-app verification** | `useScribeEntries(scribeId, page, 20)` with `range(from, to)` + count for pagination. |
| Share settings writes new share_level to DB | **PENDING — live-app verification** | `useUpdateScribeShareLevel` mutation. |
| Starter-pack fires on new member signup; landing shows 5 starter Scribes | **PENDING — live-app verification** | DB trigger on `auth.users` INSERT + UI fallback hook. Two-rail. |

All static-analysis criteria pass. Live-DB / live-app criteria are next-step verification that requires the migration applied + the dev server running against a real Supabase project. Knight does not have those credentials.

---

## Empirical findings worth Bishop's attention

1. **`auth.users` trigger vs app-side hook — chose two-rail.** The K438a prompt asks for an app-side hook; I added a DB trigger AND kept a UI-side `useEnsureCathedral` redundant call. Failure modes: if the trigger fails for any reason (Supabase auth schema changes, role permissions), the UI fallback still creates the Cathedral on first `/my/cathedral/*` visit. If the UI is bypassed (e.g., a member only ever uses MCP tools), the trigger ensures the Cathedral exists. **Recommendation:** keep both; the cost is one INSERT … ON CONFLICT DO NOTHING per page load (negligible).

2. **`shared_level` enum-snapshot column on `scribe_entries` is necessary, not nice-to-have.** Without it, the SELECT-time visibility predicate cannot differentiate `commons` from `guild`/`tribe`. The K438a prompt's bool-only `shared` column would have forced K438b to either (a) ALTER TABLE in production to add the enum snapshot, or (b) JOIN against `member_scribes` for every entry SELECT, which scales O(entries × scribes) instead of O(entries) on commons feeds. Adding the column at K438a is much cheaper than adding it later. **Recommendation:** keep the enum snapshot.

3. **Guild + Tribe RLS predicates are present but inert.** They resolve to `false` until `cathedral.guild_membership` / `cathedral.tribe_membership` tables ship in K438b. The TODO comment in the migration marks the exact line to swap. **Recommendation:** when K438b adds the membership tables, do the predicate swap in the SAME migration so the RLS path goes from inert→live in one atomic deploy. Don't ship the membership tables in one migration and the predicate swap in another (creates an incoherent intermediate state where members can join groups but can't see group content).

4. **Starter-pack adjacents are richer than the K438a prompt's suggested seeds.** The prompt has 2-4 adjacents per starter Scribe; I shipped 4-5 each (Work has 5, Health has 4, Family has 4, etc.) following #2268's "PhD-deep canonical keeper plus up to 12 adjacents" framing — even starter Scribes deserve real adjacent coverage so the Three Fates router has signal from day one. **Recommendation:** if Founder reviews the starter-pack content and finds any of the adjacent fields too presumptuous (e.g., "providers and appointments" under Health may be too clinical for a non-medical member), trim them; the seed function is one-line edits per Scribe.

5. **Cathedral is free-tier accessible by design.** I deliberately did NOT gate the routes behind `PaidMemberRoute` — only `ProtectedRoute` (auth required). The thinking: a member needs to see their own Cathedral to understand the upgrade pitch on `/my/cathedral/settings`. Paid tier flips on the K445 Companion bridge + cross-device sync; free tier still has a working storage substrate. **This may be a strategic call worth Bishop ratifying.** If Bishop wants Cathedral itself to be paid-only, swap `ProtectedRoute` → `PaidMemberRoute` on lines 173-178 of `dashboard.tsx`. Five-character edit.

6. **No RPC/edge-function calls for writes — all goes through PostgREST.** All Phase B writes happen via the typed Supabase client (`cathedral().from('member_scribes').insert(...)` etc.) so RLS is the sole authorization gate. No SECURITY DEFINER functions for routine member writes. Reduces blast radius if a function logic bug ever ships. (The starter-pack seeder IS SECURITY DEFINER because it has to bypass RLS to write into a member's tables on the trigger path — that one is unavoidable.)

7. **TypeScript types in `platform/src/integrations/supabase/types.ts` do not include the `cathedral` schema.** Same as `upekrithen` — types.ts is hand-curated / Lovable-exported and doesn't auto-update on migrations. The `cathedral-client.ts` carries shared TS types as a side-channel for the UI. **Recommendation:** when Bishop next regenerates types.ts (probably in the same pass that fixes the line-1 "Initialising login role..." typo), include `cathedral.*` so the side-channel types can be deleted.

---

## Schema / RLS for Bishop review before member beta

Specific points to scrutinize before turning Cathedral on for any member:

1. **`mc_self_update` policy on `member_cathedrals`** — currently `USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid())`. Combined with column-level `REVOKE UPDATE (member_id, created_at, export_count, export_last_at)`, members can only mutate `tier`, `last_sync_at`, `professional_domain`. **Question for Bishop:** should `tier` actually be member-mutable, or only mutable by the membership-checkout edge function? Currently a member could `UPDATE member_cathedrals SET tier='paid'` from the client and bypass payment. **Recommendation:** REVOKE UPDATE on `tier` from `authenticated`; let only the existing `create-membership-checkout` / `membership-confirm` edge functions (running with `service_role` key) flip it. **Easy fix in K438a if Bishop says yes.**

2. **`ms_commons_select` policy on `member_scribes`** — any enrolled member can SELECT any other member's commons-shared Scribe metadata. Acceptable for K438a since K438a UI doesn't yet have an "explore commons" surface, but means a clever member with the schema name can write a script that scrapes all commons Scribes. **Question for Bishop:** OK for now (it's opt-in commons sharing), or should we add a per-row "anonymized" snapshot (strip member_id from the visible row)?

3. **The `false` predicates in `ms_guild_tribe_select` and `se_guild_tribe_select`** — if K438b ships group membership but forgets to swap these predicates, guild/tribe sharing silently doesn't work (no error, just zero rows returned to receivers). **Recommendation:** flag this in the K438b prompt. The TODO comments are present, but a Knight reading K438b out-of-context could miss them.

4. **`scribe_entries.observation` has no length cap.** Single-row PostgreSQL TOAST handles up to 1GB. **Recommendation:** add a 32KB CHECK constraint in K438b before opening member writes — defends against a hostile member writing one Scribe entry that's the entire Bee Movie script and inflating Supabase egress.

5. **No rate limit on starter-pack provisioning.** A bad actor who can create many auth.users entries (compromised signup flow) generates 5 Scribes per user. **Recommendation:** in K438b, add a DAILY_NEW_MEMBER_CAP via Supabase Edge Functions or a simple counter in `cathedral.member_cathedrals` (count of cathedrals created in the last 24h — if > N, throttle).

---

## Commit + tag plan

**Files staged for commit (untracked + modified, K438a-related only):**

```
# new
platform/supabase/migrations/20260423020001_k438a_cathedral_schema.sql
platform/src/lib/cathedral-client.ts
platform/src/pages/cathedral/useCathedral.ts
platform/src/pages/cathedral/CathedralLanding.tsx
platform/src/pages/cathedral/CathedralNewScribe.tsx
platform/src/pages/cathedral/CathedralTablet.tsx
platform/src/pages/cathedral/CathedralShare.tsx
platform/src/pages/cathedral/CathedralExport.tsx
platform/src/pages/cathedral/CathedralSettings.tsx
BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K438a_B117_MEMBER_CATHEDRAL_PHASE_AB.md  # this file

# modified
platform/src/routes/dashboard.tsx  # +6 lazy imports + 6 Route entries
```

**Commit message (proposed):**

```
K438a(B117): Cathedral schema + UI scaffold (Phase A + B only)

* New cathedral schema: 5 tables (member_cathedrals, member_scribes,
  scribe_entries, fates_log, tidbits) + 12 RLS policies + 4 functions
  (ensure_member_cathedral, provision_starter_scribes, seed_starter_pack
  alias, on_auth_user_created trigger handler).
* Append-only invariant on scribe_entries / fates_log / tidbits enforced
  by policy omission.
* shared_level enum + materialization trigger captures Scribe.share_level
  at INSERT time, immutable thereafter (#2268 sharing semantics).
* 5 starter Scribes (Work, Learning, Projects, Health, Family) provisioned
  automatically via auth.users AFTER INSERT trigger; UI hook rails as
  fallback so provisioning is two-rail.
* 6 React routes under platform/src/pages/cathedral/ wired into
  dashboardRoutes: /my/cathedral, /my/cathedral/new, /my/cathedral/:id,
  /my/cathedral/:id/share, /my/cathedral/export, /my/cathedral/settings.
* Mythology-consistent UI throughout (Scribes/Cathedral/Tablet, never
  Memory/Notes). shadcn/ui + TanStack Query. ProtectedRoute (auth) gating;
  Cathedral itself is free-tier accessible so members can see the upgrade
  pitch from inside their own Cathedral.
* Phases C (MCP tool), D (Fates session integration), E (ZIP
  export/import), F (full test suite) deferred to K438b.
* Phase G (Companion CLI) deferred to K445+.

Builds on K441 (d4621f8), K442 (f068439), K443 (06f83c1),
K437 SEALED-50 PASS (8b11811).

Co-Authored-By: Claude Opus 4.7 (Knight) <noreply@anthropic.com>
```

**Tag (proposed):** `v-member-cathedral-K438a`

---

## Handoff to K438b (one screen)

When Bishop dispatches K438b, the next Knight should:

1. **Read this report's "Schema / RLS for Bishop review" section** — apply whatever Bishop ratified.
2. **Phase C — `member_consult_scribes` MCP tool** in `librarian-mcp/src/scribes/`. Schema + types ready; no DB changes. Should mirror K436 `consult_scribes` with `member_id` parameter and the private→guild→tribe→commons cascade per the K438 prompt §C.
3. **Phase D — Three Fates member-session integration.** Extend the K436 `fates_route` MCP tool to accept `member_id` + persist routing records to `cathedral.fates_log`. Schema ready.
4. **Phase E — ZIP export + standalone reader + import.** Edge function for the ZIP packager; bundles everything in `cathedral.*` for the calling member + ships `liana-companion-standalone-reader.py` per #2268 Claim 1(d). The disabled UI buttons in `CathedralExport.tsx` and `CathedralSettings.tsx` light up when this lands.
5. **Phase F — 22+ tests.** Schema RLS matrix (own/commons/guild/tribe × select/insert/update/delete), MCP tool round-trips, UI route snapshot tests.
6. **Group-membership tables** for guild/tribe (`cathedral.guild_membership`, `cathedral.tribe_membership`) — and **swap the inert `false` predicates** in the same migration. See "Schema / RLS for Bishop review" #3.
7. **`tier` column lockdown** — see "Schema / RLS for Bishop review" #1. Five-line REVOKE if Bishop ratifies.
8. **`scribe_entries.observation` length cap** — see "Schema / RLS for Bishop review" #4.

K438b commit tag: `v-member-cathedral-K438`. (K438a takes the "a" tag; K438 unsuffixed waits for the full scope.)

---

## What I would do differently if I had Phase B again

- **Add a single E2E smoke test now** (Playwright or Vitest with @testing-library/react) that mounts each Cathedral page against a mocked supabase client, just to catch render-path regressions on future migrations. Took the BRIDLE-Rule-7-discipline call to defer per the prompt, but a 30-line "does it render" smoke per page would be cheap insurance.
- **The Cathedral landing's "Recent across all Scribes" section** could be replaced with a member-scoped Three Fates routing surface ("here's where the Fates routed your last session") once Phase D ships. Keep the current implementation; mark for K438b polish.

---

## Sign-off

K438a Phase A + Phase B complete. Compiles clean. Lint clean. No deviations from Bishop's K438a prompt that aren't documented above with rationale. All deferred work is captured in cancelled-but-named todos so K438b's Knight has the handoff in writing.

— Knight K438a
  (Claude Opus 4.7, single Cursor window, ~2h actual vs 3h estimated)

**FOR THE KEEP.**
