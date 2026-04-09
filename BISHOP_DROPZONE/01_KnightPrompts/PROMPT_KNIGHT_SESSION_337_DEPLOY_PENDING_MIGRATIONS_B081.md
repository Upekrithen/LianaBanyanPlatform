# Knight Session K337 — Deploy Pending Migrations + Edge Functions
## Bishop B081 | April 5, 2026

---

## MISSION

Push all pending Supabase migrations and edge functions that have accumulated during the V2 build sprint (K295-K332 + B081). Nothing is live until this deploys.

## PENDING MIGRATIONS (verify list, may have grown)

Check `platform/supabase/migrations/` for all files with dates >= 20260405:

Known pending:
- `20260405000021_check_email_registered_rpc.sql` — CharacterAuthGate RPC
- `20260405000022_*` through `20260405000027_*` — V2 tracker status entries for K323-K332
- Any other migrations created during Phase 5-6

## PENDING EDGE FUNCTIONS

- `check_email_registered` — needs `supabase functions deploy check-email-registered`
- `compile-document-chunked` — if K333 built it, deploy it
- Verify all existing edge functions still deploy cleanly

## PROCEDURE

1. `cd platform`
2. `supabase db push` — apply all pending migrations
3. `supabase functions deploy` — deploy all edge functions
4. Verify RPC works: test `check_email_registered` with a known email
5. Verify compile-document still works: test with a small payload

## CONSTRAINTS

- Do NOT modify any migration files — just deploy them as-is
- If a migration fails, log the error and skip it — do not drop/recreate tables
- If an edge function fails to deploy, log it for Bishop to investigate

## VALIDATION

- All migrations applied without error
- All edge functions deployed
- `check_email_registered` RPC returns correct result for test email
- No broken pages on localhost after migration

---

*FOR THE KEEP!*
