# BP052 Supabase Security Remediation — 2026-05-22

**Project:** Liana Banyan Production (`ruuxzilgmuwddcofqecc`)
**Errors targeted:** 44 Security Advisor ERRORS
**Author:** Bishop-SEG-SUPA (Sonnet 4.6)

---

## Pre-Apply Checklist

- [ ] Take a manual DB backup or confirm Point-in-Time Recovery is on
- [ ] Screenshot the Security Advisor page BEFORE applying (baseline count: 44 errors)
- [ ] Test on a staging/shadow database if one is available
- [ ] Review each file in this PR with the Founder / Knight before applying to prod
- [ ] Confirm `supabase db push` or Supabase dashboard SQL editor is the apply method
- [ ] Note: File 3 (search_path lock) may surface broken SECURITY DEFINER functions — have rollback SQL ready

---

## Migration Files

### File 1: `20260522230000_enable_rls_on_public_tables.sql`
**Category:** RLS Disabled in Public
**Tables fixed:** `captain_level_requirements`, `librarian_section_map`, `lnc_ingest_manifests` (and `loc_ingest_manifests` if present)

**What it does:**
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on 3 tables
- Adds SELECT policy for `authenticated` on `captain_level_requirements` and `librarian_section_map` (both are read by frontend hooks and Edge functions using anon/user-role client)
- Adds service_role ALL policy on all 3 tables (write/admin access)
- `lnc_ingest_manifests` is service_role-only (no frontend reads detected)

**Policy decisions:**
- `captain_level_requirements`: authenticated read + service_role write. Config table with no PII. `useCaptain.ts` does `.select("*")` with user client.
- `librarian_section_map`: authenticated read + service_role write. `LibrarianDashboardPage.tsx` and `categorize-tour-note` Edge function both read this.
- `lnc_ingest_manifests`/`loc_ingest_manifests`: service_role only. LOC legislative ingest — backend-only table, no frontend reads detected.

**Rollback:**
```sql
ALTER TABLE public.captain_level_requirements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.librarian_section_map DISABLE ROW LEVEL SECURITY;
-- For lnc_ingest_manifests: DISABLE ROW LEVEL SECURITY if table exists
```

---

### File 2: `20260522230001_add_policy_for_pedestal_intermediary_config.sql`
**Category:** RLS Enabled No Policy
**Table fixed:** `pedestal_intermediary_config`

**What it does:**
- Adds a `service_role` ALL policy to unblock Edge function access
- Table already had RLS enabled (from baseline) but zero policies = deny-all

**Policy decision:**
- Service_role only. This table stores funding portal and broker-dealer API config (URLs, webhook endpoints, config JSON). Highly sensitive — no frontend access warranted. Supabase service_role client bypasses RLS by default via BYPASSRLS, so this policy is belt-and-suspenders and suppresses the advisor error.

**Rollback:**
```sql
DROP POLICY IF EXISTS "pedestal_intermediary_config_service_role_all" ON public.pedestal_intermediary_config;
```

---

### File 3: `20260522230002_lock_function_search_path.sql`
**Category:** Function Search Path Mutable
**Functions fixed:** ALL public schema functions (dynamic enumeration)

**What it does:**
- DO block iterates `pg_proc` for all public functions without `search_path` config
- Sets `search_path = ''` for SECURITY DEFINER functions (most secure)
- Sets `search_path = public` for SECURITY INVOKER functions
- Specifically named functions from Security Advisor screenshots are also fixed explicitly: `check_contribution_rate_limit`, `trg_neighborhood_content_shield`, `set_founder_hemispheric_aware`

**Risk:**
- SECURITY DEFINER functions with `search_path = ''` must use fully-qualified names. Most existing SECURITY DEFINER functions in the codebase already include `SET search_path = public` in their definition (from previous migrations). The DO block skips functions that already have `search_path` set.
- If a function breaks post-apply with "relation not found", it was using unqualified names. Fix: `ALTER FUNCTION public.fn_name() SET search_path = public` as a hotfix.

**Rollback (per function):**
```sql
ALTER FUNCTION public.function_name(args) RESET search_path;
-- or
ALTER FUNCTION public.function_name(args) SET search_path = public;
```

---

### File 4: `20260522230003_revoke_security_definer_views.sql`
**Category:** Security Definer View
**Views fixed:** 27 public views (dynamic enumeration + explicit list)

**What it does:**
- `ALTER VIEW public.<name> SET (security_invoker = on)` on all public views lacking this setting
- A second dynamic pass catches any views added after baseline
- Views **intentionally kept** as SECURITY DEFINER (they require cross-user aggregate access or are public dashboards):
  - `defense_klaus_cold_start_stats`
  - `defense_klaus_daisy_chain_stats`
  - `initiative_stats`
  - `node_status_dashboard`
  - `v_current_transparency_metrics`
  - `lmd_demand_summary`

**Why this matters:** SECURITY DEFINER views run as the view owner (postgres), bypassing RLS. A view querying a table with RLS would expose all rows to any caller. Setting `security_invoker = on` makes the view run as the calling role, so RLS applies correctly.

**Risk:** Views that join tables where the calling user has no RLS policy will return empty results instead of full data. This is correct behavior, not a bug. If a view breaks (returns unexpectedly empty), it means the underlying table has RLS that needs a policy for the view's use case.

**Rollback (per view):**
```sql
ALTER VIEW public.view_name RESET (security_invoker);
-- This restores SECURITY DEFINER behavior
```

---

### File 5: `20260522230004_fix_exposed_auth_users_view.sql`
**Category:** Exposed Auth Users
**Views fixed:** Any public view querying `auth.users` directly

**What it does:**
- Dynamic discovery: finds all public views referencing `auth.users` in their definition
- Sets `security_invoker = on` on each
- Revokes `SELECT` from `anon` role on each such view
- Revokes `SELECT` from `authenticated` for views with admin/audit/auth-scoped names
- Checks candidate names hinted in Security Advisor screenshots (`auth_in_degrees_doggett`, etc.)
- Safety net: revokes anon SELECT from ALL views that touch the `auth` schema

**Note:** The specific exposed-auth-users view may have been created directly on the production DB and is not tracked in migrations. If the view name is known, it should be DROPped and recreated as a proper SECURITY INVOKER view with only safe columns exposed. The dynamic approach here handles the case without requiring the exact name.

**If the view needs to be preserved** (e.g., an admin dashboard needing user emails), the correct approach is:
1. Keep it as SECURITY DEFINER
2. Revoke from anon/authenticated
3. Grant only to specific admin UUIDs or to a custom `admin` role

**Rollback:**
```sql
-- Restore anon SELECT if needed (not recommended for auth-exposing views)
GRANT SELECT ON public.<view_name> TO anon;
```

---

## Post-Apply Verification

1. Re-run Supabase Security Advisor → should drop from 44 errors to low single-digits
2. Verify the following pages/features still work:
   - Captain dashboard (reads `captain_level_requirements`)
   - Librarian dashboard (reads `librarian_section_map`)
   - Pedestal/fundraising pages (any Edge functions using `pedestal_intermediary_config`)
   - Views used in the frontend (check for unexpectedly empty data)
3. Run `supabase db diff` to confirm no unexpected schema drift
4. Check Supabase logs for any function errors (search_path issues surface as "relation does not exist")

---

## Canon Reference

This remediation follows the doctrine established in:
- `state/eblets/CANON/canon_supabase_rls_discipline_every_bishop_reads_bp051.eblet.md`
- RLS is the moat at the database layer — every table in `public` must have it enabled with at least a service_role policy before shipping.

---

## Uncertainty Flags for Founder/Knight Review

1. **`lnc_ingest_manifests` vs `loc_ingest_manifests`**: The Security Advisor shows `lnc_ingest_manifests` but the migration file `20260512150000_bp039_loc_ingest_schema.sql` creates `loc_ingest_manifests`. Both are handled with existence checks. Confirm the live table name by running `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%ingest_manifests%'` before applying.

2. **Exposed Auth Users view name**: The specific view causing the "Exposed Auth Users" error is not in the tracked migrations. File 5 uses dynamic discovery. If the view name is known, add it explicitly to the `_candidate_names` array in File 5 before applying.

3. **Security Definer functions with `search_path = ''`**: Any SECURITY DEFINER function that uses unqualified references to `auth.users` (e.g., `SELECT email FROM users WHERE id = ...` instead of `SELECT email FROM auth.users WHERE id = ...`) will break after File 3 is applied. Review post-apply function errors carefully. The `award_referral_bonus` function and similar functions that query `auth.users` inside SECURITY DEFINER bodies already use the qualified `auth.users` name — these are safe.

4. **Views kept as SECURITY DEFINER**: The 6 views listed as "kept" may still trigger Security Advisor warnings (not errors). If the advisor flags them as errors, revisit whether they need `security_invoker` with appropriate upstream RLS policies.
