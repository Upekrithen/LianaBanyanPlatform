---
knight_session: K438a
bishop_session: B117
complexity_tier: MODERATE
estimated_duration_hours: 3.0
recommended_model: sonnet-4.6
escalation_trigger: "If RLS policy design runs into a cross-member Guild-visibility question that can't be answered from this prompt + existing upekrithen schema pattern, stop and checkpoint"
---
# Knight K438a — Member Cathedral: Supabase Schema + UI Scaffold
## B117, April 23, 2026 — SELF-CONTAINED, LEAN DISPATCH

**Status:** Replaces the bloated original K438 prompt. Scope narrowed to Phase A (schema) + Phase B (UI scaffold) per Bishop's PATH-2 decision after Knight's BRIDLE checkpoint. Phases C/D/E/F/G deferred to K438b.

**Why this prompt is different:** The original K438 asked you to read 9 A&A Formals + K436 report + K437 summary before starting. That's ~8K+ lines of prereq. This prompt embeds the minimum architectural decisions inline so you can start coding immediately.

**Prerequisite git state (VERIFIED, do not re-check):**
- K441 merged: `d4621f8` (MCP auto-reload + gitignore)
- K442 merged: `f068439` (Letter predicate ladder)
- K443 merged: `06f83c1` (Model router wrapper)
- K437 SEALED-50: `8b11811` + expanded registry in `00a475e`, PASS +6.0pp → +19pp lenient
- `53eea1b` un-ignored `BISHOP_DROPZONE/12_Innovations_AA/` if you need the full A&A context, but you should NOT need to read them for K438a. Everything required is in this prompt.

**Complexity tier:** MODERATE → Sonnet 4.6 (not Opus). Narrower scope = cheaper model.

---

## Phase A — Supabase schema migration (one file)

Create **`platform/supabase/migrations/20260423_k438a_cathedral_schema.sql`** with:

### Schema + 5 tables

```sql
-- New schema (isolated from public + upekrithen)
CREATE SCHEMA IF NOT EXISTS cathedral;
GRANT USAGE ON SCHEMA cathedral TO authenticated;

-- Table 1: per-member Cathedral state
CREATE TABLE cathedral.member_cathedrals (
  member_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMPTZ,
  export_count INT NOT NULL DEFAULT 0,
  export_last_at TIMESTAMPTZ
);
ALTER TABLE cathedral.member_cathedrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY mc_self_select ON cathedral.member_cathedrals FOR SELECT USING (member_id = auth.uid());
CREATE POLICY mc_self_insert ON cathedral.member_cathedrals FOR INSERT WITH CHECK (member_id = auth.uid());
CREATE POLICY mc_self_update ON cathedral.member_cathedrals FOR UPDATE USING (member_id = auth.uid());

-- Table 2: per-member Scribe registry (each row = one Scribe)
CREATE TABLE cathedral.member_scribes (
  scribe_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  primary_field TEXT NOT NULL,
  adjacents JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{level: 2, field: "..."}, ...]
  keywords TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  share_level TEXT NOT NULL DEFAULT 'private' CHECK (share_level IN ('private','guild','tribe','commons')),
  share_target_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ms_member_idx ON cathedral.member_scribes(member_id);
CREATE INDEX ms_share_idx ON cathedral.member_scribes(share_level, share_target_id) WHERE share_level != 'private';
ALTER TABLE cathedral.member_scribes ENABLE ROW LEVEL SECURITY;
CREATE POLICY ms_self_crud ON cathedral.member_scribes FOR ALL USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid());
-- Shared Scribe visibility: others see them if share_level allows (stub — cross-member group-membership join deferred to K438b)
CREATE POLICY ms_shared_select ON cathedral.member_scribes FOR SELECT USING (share_level IN ('guild','tribe','commons'));

-- Table 3: append-only tablet entries
CREATE TABLE cathedral.scribe_entries (
  entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scribe_id UUID NOT NULL REFERENCES cathedral.member_scribes(scribe_id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT,
  observation TEXT NOT NULL,
  source TEXT,
  canonical_ref TEXT,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  shared BOOLEAN NOT NULL DEFAULT false  -- materialized at INSERT from Scribe's current share_level
);
CREATE INDEX se_scribe_ts_idx ON cathedral.scribe_entries(scribe_id, ts DESC);
CREATE INDEX se_member_idx ON cathedral.scribe_entries(member_id);
ALTER TABLE cathedral.scribe_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY se_self_insert ON cathedral.scribe_entries FOR INSERT WITH CHECK (member_id = auth.uid());
CREATE POLICY se_self_select ON cathedral.scribe_entries FOR SELECT USING (member_id = auth.uid());
CREATE POLICY se_shared_select ON cathedral.scribe_entries FOR SELECT USING (shared = true);
-- NO UPDATE, NO DELETE policy — append-only by omission

-- Table 4: Fates routing audit (per-member)
CREATE TABLE cathedral.fates_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  content_hash TEXT NOT NULL,
  themes JSONB NOT NULL DEFAULT '[]'::jsonb,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  dispatches JSONB NOT NULL DEFAULT '[]'::jsonb,
  coverage_gaps JSONB NOT NULL DEFAULT '[]'::jsonb
);
CREATE INDEX fl_member_ts_idx ON cathedral.fates_log(member_id, ts DESC);
ALTER TABLE cathedral.fates_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY fl_self_insert ON cathedral.fates_log FOR INSERT WITH CHECK (member_id = auth.uid());
CREATE POLICY fl_self_select ON cathedral.fates_log FOR SELECT USING (member_id = auth.uid());
-- NO UPDATE, NO DELETE

-- Table 5: SP-21 Tidbit verify-action ledger (per-member)
CREATE TABLE cathedral.tidbits (
  tidbit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  agent TEXT NOT NULL,
  session_id TEXT,
  category TEXT NOT NULL,
  observation TEXT NOT NULL,
  artifact_served TEXT,
  bridle_rule_invoked TEXT
);
CREATE INDEX tb_member_ts_idx ON cathedral.tidbits(member_id, ts DESC);
ALTER TABLE cathedral.tidbits ENABLE ROW LEVEL SECURITY;
CREATE POLICY tb_self_insert ON cathedral.tidbits FOR INSERT WITH CHECK (member_id = auth.uid());
CREATE POLICY tb_self_select ON cathedral.tidbits FOR SELECT USING (member_id = auth.uid());
-- NO UPDATE, NO DELETE
```

### Starter-pack Scribe seed function

```sql
-- Called on member enrollment (trigger or edge function)
CREATE OR REPLACE FUNCTION cathedral.seed_starter_pack(p_member_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO cathedral.member_scribes (member_id, name, primary_field, adjacents, keywords) VALUES
    (p_member_id, 'Work', 'your professional domain',
     '[{"level":2,"field":"current projects"},{"level":3,"field":"colleagues"},{"level":3,"field":"ongoing decisions"}]'::jsonb,
     ARRAY['work','project','colleague','deadline','meeting']),
    (p_member_id, 'Learning', 'what you are currently studying',
     '[{"level":2,"field":"course topics"},{"level":3,"field":"key insights"}]'::jsonb,
     ARRAY['learn','study','course','insight','read']),
    (p_member_id, 'Health', 'personal health context',
     '[{"level":2,"field":"medications"},{"level":3,"field":"providers"},{"level":4,"field":"appointments"}]'::jsonb,
     ARRAY['health','medication','doctor','appointment','symptom']),
    (p_member_id, 'Family', 'family members and relationships',
     '[{"level":2,"field":"birthdays"},{"level":3,"field":"traditions"},{"level":4,"field":"preferences"}]'::jsonb,
     ARRAY['family','birthday','tradition','preference','child']),
    (p_member_id, 'Projects', 'active personal projects',
     '[{"level":2,"field":"goals"},{"level":3,"field":"milestones"}]'::jsonb,
     ARRAY['project','goal','milestone','deadline','plan']);
  INSERT INTO cathedral.member_cathedrals (member_id) VALUES (p_member_id) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Migration acceptance

- [ ] `npx supabase db push --linked --include-all` succeeds cleanly
- [ ] `supabase.from('member_cathedrals').select()` from a test member session returns that member's row, not others
- [ ] `supabase.from('scribe_entries').update({observation: 'changed'})` FAILS with RLS violation (append-only enforcement)
- [ ] `SELECT cathedral.seed_starter_pack('<test-uuid>')` creates 5 Scribes + 1 member_cathedrals row

---

## Phase B — UI scaffold (6 routes, scaffolded-not-polished)

Create page shells at `platform/src/pages/cathedral/`. Each route renders a placeholder + reads the appropriate data. Final UX polish deferred to a post-K438b design pass.

**Routes:**

1. **`CathedralLanding.tsx`** at `/my/cathedral` — lists member's Scribes (query `cathedral.member_scribes WHERE member_id = auth.uid()`) + count of entries per Scribe + "Health card" (Scribe count, total entries, last activity)
2. **`NewScribe.tsx`** at `/my/cathedral/new` — form: name (text), primary_field (text), adjacents (repeating rows with level 2-12 dropdown + field text), keywords (tag input). Submit → INSERT into `cathedral.member_scribes`
3. **`TabletView.tsx`** at `/my/cathedral/:scribeId` — paginated entries (20/page) + search by keyword (ILIKE on observation) + "append new entry" form → INSERT into `cathedral.scribe_entries`
4. **`ShareSettings.tsx`** at `/my/cathedral/:scribeId/share` — radio: private / guild / tribe / commons. On change, UPDATE `cathedral.member_scribes.share_level`. Note: existing entries' `shared` flag stays at whatever value they had at insert (immutable per #2270 architectural decision)
5. **`CathedralExport.tsx`** at `/my/cathedral/export` — placeholder button "Export my Cathedral as ZIP" → stub edge function that logs intent; actual ZIP generation deferred to K438b Phase E
6. **`CathedralSettings.tsx`** at `/my/cathedral/settings` — tier upgrade CTA (stub button), sync preferences (stub toggle), "Delete all my Cathedral data" red button (stub — actual delete deferred to K438b with confirmation flow)

Wire into `AppShell.tsx` / router with authenticated-only guard. All routes require `auth.user` non-null.

**Starter-pack enrollment:** add a hook in the existing member-onboarding flow (locate via `platform/src/` search for "member enrollment" or "signup") that calls `supabase.rpc('seed_starter_pack', { p_member_id: newUser.id })` after signup completes.

**UI scaffold acceptance:**

- [ ] All 6 routes render without 500s on a test member
- [ ] Scribe creation form writes to DB; new Scribe appears on landing
- [ ] Tablet view shows paginated entries
- [ ] Share settings writes new `share_level` to DB
- [ ] Starter-pack function fires on new member signup; landing shows 5 starter Scribes

---

## Explicit DEFERRALS to K438b

Do NOT implement in K438a:

- ❌ Phase C: `member_consult_scribes` MCP tool (needs server.ts wiring — save for K438b)
- ❌ Phase D: Three Fates member-session integration (needs `fates_route` tool extension — K438b)
- ❌ Phase E: ZIP export + standalone reader + ZIP import (complex; K438b)
- ❌ Phase F: 22+ tests covering all phases (scaffold-specific tests OK for A+B; full suite K438b)
- ❌ Phase G: Companion CLI package (K445+)
- ❌ Cross-member Guild-visibility RLS (stub policy above is permissive for share_level != 'private'; fine-grained group-membership join deferred to K438b)
- ❌ Schema-level tests for cross-member access denial (K438b when the full RLS matrix lands)

If Knight finds itself thinking "I should just add X because it's easy" — STOP. Push to K438b instead. Scope discipline is the point.

---

## Commit + tag

```
git commit -m @'
K438a(B117): Cathedral schema + UI scaffold (Phase A + B only)

* New cathedral schema with 5 tables (member_cathedrals, member_scribes,
  scribe_entries, fates_log, tidbits) + RLS policies + append-only on
  entries/fates/tidbits by policy omission
* seed_starter_pack() function creates 5 starter Scribes on enrollment
  (Work / Learning / Health / Family / Projects)
* 6 React route shells at platform/src/pages/cathedral/ scaffolded with
  data reads + form writes; UX polish deferred
* Starter-pack enrollment hook wired into member signup flow
* Migration 20260423_k438a_cathedral_schema.sql staged

Scope-limited per Bishop PATH-2 decision after K438 checkpoint.
Phases C (MCP tool), D (Fates integration), E (Export/Import), F (full
test suite), G (Companion CLI) all deferred to K438b+.

Builds on K441 (d4621f8), K442 (f068439), K443 (06f83c1),
K437 SEALED-50 PASS (8b11811, tag v-scev1-b116). 

Co-Authored-By: Claude Sonnet 4.6 (Knight) <noreply@anthropic.com>
'@
```

**Target commit tag:** `v-member-cathedral-K438a`

---

## BRIDLE Rule 7 report requirements (keep brief)

1. Migration file path + applied state (`supabase db push` output)
2. Test-member RLS verification commands + outputs
3. 6 route file paths + rendering confirmation
4. Starter-pack seed verification (5 Scribes created on test signup)
5. Commit SHA + tag
6. Any schema decision you deviated from this prompt AND why (expected: zero deviations; this prompt is tight)
7. Any blocker encountered that pushes work to K438b beyond the already-declared deferrals

---

**Estimated effort:** 3 hours. Sonnet 4.6. Single Cursor session.

**If you find yourself at hour 4:** stop. Commit what's green. Report. K438b handles the rest.

**Proceed.**
