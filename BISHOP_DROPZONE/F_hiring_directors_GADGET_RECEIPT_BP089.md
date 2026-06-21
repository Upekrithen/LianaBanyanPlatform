# Item F -- hiring_directors Gadget Receipt
# BP089 Marathon Session 2 -- 2026-06-20

## Gadget Result

**Branch:** B (table exists, columns absent)

**Table exists:** YES
Source: platform/supabase/migrations/20260618000002_hiring_directors_node_operator.sql

**Existing columns:**
- id (UUID, PK)
- user_id (UUID, NOT NULL, UNIQUE ref auth.users)
- project_count (INTEGER, DEFAULT 0)
- hired_user_count (INTEGER, DEFAULT 0)
- node_operator_status (BOOLEAN, DEFAULT false)
- created_at (TIMESTAMPTZ)
- last_updated (TIMESTAMPTZ)

**Missing columns (required by yoke):**
- peer_id -- ABSENT
- status -- ABSENT
- ratified_at -- ABSENT

## Action Taken

Branch B migration written:
- platform/supabase/migrations/20260620230400_I9_hiring_directors_schema.sql
- BISHOP_DROPZONE/I9_hiring_directors_schema.sql

Migration adds:
- peer_id TEXT DEFAULT NULL
- status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','pending','ratified'))
- ratified_at TIMESTAMPTZ DEFAULT NULL

Plus indexes on peer_id and status.

## Item F Status: AMBER (Branch B migration shipped -- Bishop apply pending)
