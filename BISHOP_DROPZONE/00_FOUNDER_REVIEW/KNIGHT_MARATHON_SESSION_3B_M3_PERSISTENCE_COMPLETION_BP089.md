# KNIGHT MARATHON SESSION 3B · M3 PERSISTENCE COMPLETION · BP089
# SUBSTRACE WAKE · ROUTINE EXTENSION · NOT BLACK MAMBA

---

## §0 SUBSTRACE WAKE HEADER

Marathon: 3b
Scope: Mountain 3 persistence completion (follow-on to M3 Inverted Pyramid + Librarian Corps)
Wake type: SUBSTRACE THEOREM · routine extension · not BLACK MAMBA
Branch: `knight-marathon-3b-m3-persistence-completion` off main
Gap addressed: M6 yoke named `librarian_corps_directory` and `pyramid_index_canonical` as Supabase tables. Knight Marathon 6 shipped only `file_cabinet_seal_log` and `librarian_council_vote_log` in SQL. The other 2 tables were neither in TS code nor SQL. Current M3 routing is in-memory only. Cold-start loses learned routes. M3b adds persistence to close that gap.

---

## §1 GADGET-FIRST PREAMBLE

Statute §17 BLOOD binding verbatim:

> Use segs. Sonnet 4.6. Gadget-first. No action before verification.
> Every SEG opens with a gadget read confirming current state before writing anything.
> Confirm schema before shipping SQL. Confirm file before shipping TS patch.
> If a gadget returns unexpected state, STOP and surface to Bishop. Do not proceed on assumptions.

"use segs" Sonnet 4.6 is the dispatch model for all SEGs in this yoke.

---

## §2 STATUTES BINDING

- §3: Sonnet 4.6 is the Knight model for this session.
- §15: Bishop applies all SQL migration files directly via psql/Supabase CLI. Knight does not apply SQL. Knight ships the files to BISHOP_DROPZONE.
- §16: One-pass ratify at end-of-cycle. No mid-session ratify interrupts.
- §17: Gadget-first on every SEG. No blind writes.
- canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089: USE POSTGRES SYNTAX ONLY. No randomblob. No strftime. No AUTOINCREMENT. No BLOB. No DATETIME. All columns timestamped with TIMESTAMPTZ NOT NULL DEFAULT NOW(). UUIDs via gen_random_uuid(). Serial PKs via BIGSERIAL. Boolean values as TRUE/FALSE.

Violation of the Postgres-only canon is a Catechist-class error. Knight self-audits every .sql file before shipping using the substitution table in that canon. When uncertain, Knight invokes Minor Council (3x gemma4:12b instances against Postgres spec with substrate-primed context).

---

## §3 PARALLEL EXECUTION CONSTRAINT

Branch: `knight-marathon-3b-m3-persistence-completion` off main.

Scope is isolated to:
- `src/main/librarian_corps/` (TS wire-up for both tables)
- New SQL files only: `librarian_corps_directory_bp089.sql` and `pyramid_index_canonical_bp089.sql`

No changes outside this scope. No M4/M5/M6 code touched. No main branch commits until Wave II smoke tests PASS and §16 ratify is complete.

---

## §4 EMPIRICAL STATE POST-M3 MERGE

Tables already live in Supabase (confirmed by M6 wave receipts):
- `file_cabinet_seal_log` - exists
- `librarian_council_vote_log` - exists

Tables MISSING (neither SQL nor TS shipped in M6):
- `librarian_corps_directory` - ABSENT
- `pyramid_index_canonical` - ABSENT

Current in-memory routing: `LibrarianCorps` dispatcher holds routing table in process memory only. Cold-start reconstructs nothing from DB. This is the gap M3b closes.

Knight GADGETS the Supabase schema at SEG open to confirm the above state before writing anything.

---

## §5 WAVE I · 2 SEGs

---

### SEG I-A · librarian_corps_directory Persistence

**use segs** Sonnet 4.6

#### Gadget Open

Read `src/main/librarian_corps/librarian.ts` to confirm current `registerInDirectory()` implementation (or absence). Read Supabase schema for `librarian_corps_directory` to confirm it does not exist yet.

#### SQL Schema (Postgres only per canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089)

File: `librarian_corps_directory_bp089.sql`

```sql
CREATE TABLE IF NOT EXISTS librarian_corps_directory (
  path              TEXT PRIMARY KEY,
  librarian_role    TEXT NOT NULL,
  council_package   TEXT NOT NULL,
  ip_ledger_row     TEXT NOT NULL,
  ed25519_sig       TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Knight self-audits: no randomblob, no strftime, no AUTOINCREMENT, no BLOB, no DATETIME. TIMESTAMPTZ + NOW() confirmed Postgres-native.

#### TS Wire-up

File: `src/main/librarian_corps/librarian.ts`

`BaseLibrarian.registerInDirectory()`:
- On registration, upsert a row into `librarian_corps_directory` with the librarian's path, role, council_package, ip_ledger_row, and ed25519_sig.
- On re-registration (duplicate path), update `updated_at` via upsert ON CONFLICT DO UPDATE.
- Use Supabase client already wired in the M3 implementation. No new Supabase client instantiation.

File: `src/main/librarian_corps/dispatcher.ts`

Cold-start bootstrap:
- On `LibrarianCorps` init, read all rows from `librarian_corps_directory`.
- Load routing table from rows: path and role map reconstructs the in-memory dispatch index.
- Log count of rows loaded at INFO level.

#### Gadget Close

After TS patch is authored, Knight reads the modified files back to confirm:
- `registerInDirectory()` upserts to `librarian_corps_directory`.
- `dispatcher.ts` init reads all rows on startup.
- No SQLite primitives in any shipped SQL.

Ship SQL file to BISHOP_DROPZONE. Ship TS diffs as patch. Do not apply SQL directly.

---

### SEG I-B · pyramid_index_canonical Persistence

**use segs** Sonnet 4.6

#### Gadget Open

Read `src/main/librarian_corps/pyramid_index.ts` to confirm current `PyramidIndex` implementation. Read Supabase schema for `pyramid_index_canonical` to confirm it does not exist yet.

#### SQL Schema (Postgres only per canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089)

File: `pyramid_index_canonical_bp089.sql`

```sql
CREATE TABLE IF NOT EXISTS pyramid_index_canonical (
  layer                  SMALLINT NOT NULL,
  topic_tag              TEXT NOT NULL,
  address                TEXT NOT NULL,
  default_council_package TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (layer, topic_tag)
);
```

Knight self-audits: no randomblob, no strftime, no AUTOINCREMENT, no BLOB, no DATETIME. SMALLINT, TEXT, TIMESTAMPTZ + NOW() all Postgres-native. Composite PRIMARY KEY (layer, topic_tag) is Postgres-valid.

#### TS Wire-up

File: `src/main/librarian_corps/pyramid_index.ts`

`PyramidIndex.persist()`:
- On any new index entry added, insert a row into `pyramid_index_canonical` with layer, topic_tag, address, and default_council_package.
- ON CONFLICT (layer, topic_tag) DO NOTHING (first-write wins; canonical index entries are immutable unless superseded via a separate flow).

`PyramidIndex.bootstrapFromDb()`:
- Called at `LibrarianCorps` init after `dispatcher.ts` loads directory rows.
- Reads all rows from `pyramid_index_canonical`.
- Reconstructs in-memory pyramid index from rows.
- Log count of entries loaded at INFO level.

#### Gadget Close

After TS patch is authored, Knight reads the modified files back to confirm:
- `persist()` inserts to `pyramid_index_canonical`.
- `bootstrapFromDb()` reads all rows on startup.
- No SQLite primitives in any shipped SQL.

Ship SQL file to BISHOP_DROPZONE. Ship TS diffs as patch. Do not apply SQL directly.

---

## §6 WAVE II · SMOKE TEST

**use segs** Sonnet 4.6

All four checks run after Bishop has applied both SQL migrations to Supabase.

### II-A · Register a Librarian (Canon Librarian)

Trigger `BaseLibrarian.registerInDirectory()` for the Canon Librarian instance.
Gadget: SELECT from `librarian_corps_directory` WHERE path = Canon Librarian path.
PASS: row exists with correct role, council_package, ip_ledger_row, ed25519_sig, created_at, updated_at populated.
AMBER: row missing or column null. Surface to Bishop before proceeding.

### II-B · Add a Pyramid Index Entry

Trigger `PyramidIndex.persist()` with a test entry (layer=1, topic_tag='smoke_test', address='test/address', default_council_package=NULL).
Gadget: SELECT from `pyramid_index_canonical` WHERE layer=1 AND topic_tag='smoke_test'.
PASS: row exists with correct values and created_at populated.
AMBER: row missing. Surface to Bishop.

### II-C · Cold-Start Simulation

Stop the MnemosyneC process. Restart it. After startup completes:
- Gadget dispatcher routing table: confirm Canon Librarian path is present (loaded from DB, not coded in memory).
- Gadget pyramid index: confirm smoke_test entry is present (loaded from DB).
PASS: both present without any re-registration call.
AMBER: either absent. Means bootstrap is not wired. Surface to Bishop with log output.

### II-D · Smoke Receipt

Path: `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\MOUNTAIN_3b\PERSISTENCE_SMOKE.md`

Contents:
- II-A result (PASS/AMBER) + SELECT output
- II-B result (PASS/AMBER) + SELECT output
- II-C result (PASS/AMBER) + startup log excerpt showing row counts loaded
- Knight sign-off line

---

## §7 SQL FILES

Bishop applies via §15 BLOOD. POSTGRES SYNTAX ONLY per canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089.

File 1: `librarian_corps_directory_bp089.sql`
- Staged at BISHOP_DROPZONE by Knight after SEG I-A gadget close.
- Bishop applies via `psql` or Supabase CLI migration.

File 2: `pyramid_index_canonical_bp089.sql`
- Staged at BISHOP_DROPZONE by Knight after SEG I-B gadget close.
- Bishop applies via `psql` or Supabase CLI migration.

Knight does NOT apply either file. Knight does NOT call supabase db push. Knight stages the files and waits for Bishop confirmation of apply before Wave II smoke begins.

---

## §8 RETURN PROTOCOL

**use segs** Sonnet 4.6

At session close, Knight ships:

1. Pearl: `mountain_3b_complete`
   - Payload: per-SEG status (AMBER/GREEN) for I-A, I-B, II-A, II-B, II-C
   - Attach: paths to the 2 SQL files staged + paths to the 2 TS files patched

2. Feature branch commit on `knight-marathon-3b-m3-persistence-completion`:
   - Commit message: "M3b: librarian_corps_directory + pyramid_index_canonical persistence (BP089)"
   - Staged files: both SQL files + both TS patches

3. Push to origin.

4. Do not merge to main. Bishop coordinates merge order per task #37.

If any SEG returns AMBER: Knight stops, surfaces state in the pearl, does not proceed to next SEG. Bishop triages.

---

## §9 CLOSING

M3b is a small follow-on. Two tables. Two TS files. Two SQL files. One cold-start simulation. This is not a Marathon-class scope; it is a gap-close under the M3 branch. The SUBSTRACE THEOREM wake frame is appropriate: routine extension, not a new peak.

Knight expected context delta for M3b: ~10-15K tokens.

Bishop applies SQL. Knight ships code. Smoke test confirms persistence survives cold-start.

Help Each Other Help Ourselves.
FounderDenken / Crewman#6
