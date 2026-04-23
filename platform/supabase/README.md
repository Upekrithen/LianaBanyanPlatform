# Supabase — Platform DB

## Migration baseline (B119 K451)

The migration chain was baselined on 2026-04-23 via `supabase db dump --schema-only` of
production. All pre-2026-04-22 migrations live in `_archive_legacy_pre_baseline/` for audit;
they are not replayed by `supabase db reset`.

If you need to rebuild prod from zero (rare — schema bugs in the archive), run archived
migrations manually in timestamp order and expect ordering errors in the 20260209000003-5
block. These are tracked for a future K453+ audit session.

Default local dev: `supabase db reset` starts from `00000000000000_baseline.sql`. This is
the desired and supported flow.

## Live migration chain (post-baseline)

| File | Description |
|---|---|
| `00000000000000_baseline.sql` | Production schema snapshot (83 733 lines, 2026-04-23) |
| `20260422100001_k427_entity_membership.sql` | Entity membership tier tables |
| `20260422100002_k427_pedestal_stake_regcf.sql` | Pedestal Stake / Reg CF consumer portal |
| `20260422230001_k431_upekrithen_schema_pedestal_stake.sql` | Upekrithen-scoped Pedestal Stake tables |
| `20260423000001_k432_pedestal_apply_flow_columns.sql` | Apply-flow columns and RLS |
| `20260423010001_k433_admin_compliance_dashboard.sql` | Admin/compliance dashboard RLS |
| `20260423020001_k438a_cathedral_schema.sql` | Member Cathedral schema and RLS |

All post-baseline migrations are idempotent against the baseline (DROP POLICY IF EXISTS /
CREATE TABLE IF NOT EXISTS / DROP TRIGGER IF EXISTS patterns throughout).

## pgTAP tests

Two test suites in `tests/`:

| File | Cases | Description |
|---|---|---|
| `cathedral_rls_pgtap.sql` | 7 | Cathedral RLS policy enforcement |
| `cathedral_starter_pack_pgtap.sql` | 7 | Starter-pack seed + keyword smoke check |

Run locally: `supabase test db` (stack must be up via `supabase start`).
CI: `supabase-pgtap.yml` fires on every push/PR touching `platform/supabase/**`.
