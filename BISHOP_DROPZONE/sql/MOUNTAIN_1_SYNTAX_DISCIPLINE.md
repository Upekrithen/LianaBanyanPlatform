# SQL Syntax Discipline -- Mountain 1 Post-Ratification Fix
# BP089 · Truth-Always (§3) · 2026-06-21

## What happened

Mountain 1 Wave I shipped SQL schema files using SQLite syntax:
- lower(hex(randomblob(16))) for UUID defaults
- strftime('%Y-%m-%dT%H:%M:%SZ', 'now') for timestamp defaults

Bishop applied the migrations and patched to PostgreSQL equivalents at apply time.
Tables are live in Supabase with corrected syntax.

## Corrected syntax (committed post-ratification)

| SQLite (wrong)                                               | PostgreSQL (correct)                    |
|--------------------------------------------------------------|-----------------------------------------|
| TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16))))        | UUID PRIMARY KEY DEFAULT gen_random_uuid() |
| TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) | TIMESTAMPTZ NOT NULL DEFAULT NOW()     |

## Discipline rule (binding all future mountains)

All Knight SQL migration files target PostgreSQL (Supabase) syntax exclusively.

- IDs: UUID PRIMARY KEY DEFAULT gen_random_uuid() (pgcrypto enabled in Supabase by default)
- Timestamps: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- No INTEGER for booleans -- use BOOLEAN in Postgres
- No randomblob(), hex(), strftime() -- SQLite-only

## dispatch_loop.ts UUID fix

App-side logging now uses canonical UUID form (with hyphens):
  randomUUID() -- correct for UUID column type
  Previously: randomUUID().replace(/-/g, '') -- stripped hyphens (unnecessary)

## Files corrected

- BISHOP_DROPZONE/sql/MOUNTAIN_1_dr_m_dispatch_log.sql
- BISHOP_DROPZONE/sql/MOUNTAIN_1_brain_swap_audit.sql
- BISHOP_DROPZONE/sql/MOUNTAIN_1_council_dispatch_log.sql
- BISHOP_DROPZONE/sql/MOUNTAIN_1_court_package_audit.sql

Ratified: Bishop BP089 · Mountain 1 Wave I CLOSED.
