# BLACK MAMBA · YOKE 4 · BP087 WAVE 3
# PEARL + SUBSTRACE RLS · EBLIT MESH BROADCAST · SCRAMBLER CLEANUP · CHECKOUT DEDUPE
# 5 small-but-important closures

---

## §0 BRICK WALL PRE-AUTHORIZED SCOPE

Brick Wall pre-authorized scope verbatim:
- (a) pearl_share RLS: anon SELECT live rows + anon INSERT
- (b) substrace_wake_routes RLS: service_role full + anon SELECT own routes
- (c) Eblit mesh-broadcast type wiring: add 'eblit_emit' to VALID_TYPES + peer fan-out handler
- (d) Scrambler README: either add 5 missing .py stubs with TODO markers OR update README to match actual disk state - Knight recommends the honest README update, Founder confirms direction
- (e) create-mnemosynec-checkout: delete index (1).ts and index (2).ts (Windows Explorer duplicates, 2,871 bytes each, confirmed identical by SEG-JJ recon)

Knight ships .sql files for (a) and (b). Bishop applies via psql per §15. Knight does NOT execute psql.

---

## §1 CONTEXT

Wave 2 generated 9 yokes that all closed GREEN or AMBER. The tail of each yoke carried small follow-on items that did not fit neatly into any single yoke scope. This yoke collects 5 of those items into one tightly bounded closure pass. Each closure is independent; 5 SEGs run in parallel. The only coordination point is the shared commit at the end.

Item (a) and (b) are Supabase RLS policies delivered as .sql files for Bishop. Items (c), (d), and (e) are pure filesystem/code changes Knight executes directly. Together these 5 closures remove 5 items from the Wave 2 carry-forward list.

---

## §2 SEG FAN-OUT

use segs Sonnet 4.6 verbatim

All 5 SEGs may run in parallel. Each is fully independent.

**SEG-D1 · pearl_share RLS policies**

Knight reads the current pearl_share table definition from the codebase (look in supabase/migrations/ for the CREATE TABLE pearl_share statement).

Knight writes a new migration file:
Path: C:\Users\Administrator\Documents\LianaBanyanPlatform\supabase\migrations\[TIMESTAMP]_pearl_share_rls.sql

Content:
```sql
-- pearl_share RLS policies
-- BP087 Wave 3 · Knight ships · Bishop applies via psql

ALTER TABLE pearl_share ENABLE ROW LEVEL SECURITY;

-- anon can SELECT live rows (status = 'live')
CREATE POLICY "pearl_share_anon_select_live"
  ON pearl_share
  FOR SELECT
  TO anon
  USING (status = 'live');

-- anon can INSERT (new pearl shares submitted by unauthenticated members)
CREATE POLICY "pearl_share_anon_insert"
  ON pearl_share
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- service_role bypasses RLS (full access)
-- Note: service_role bypass is default in Supabase; no explicit policy needed.
-- If pearl_share uses a custom auth.uid() owner column, add an authenticated SELECT policy here.
-- Founder or Bishop confirms if owner-column policy is needed before apply.
```

Knight drops the .sql file to BISHOP_DROPZONE:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\[TIMESTAMP]_pearl_share_rls_BISHOP_APPLY.sql

Return: .sql file path + content verbatim + note if pearl_share has an owner column (check the CREATE TABLE definition).

**SEG-D2 · substrace_wake_routes RLS policies**

Knight reads the substrace_wake_routes table definition from supabase/migrations/.

Knight writes a new migration file:
Path: C:\Users\Administrator\Documents\LianaBanyanPlatform\supabase\migrations\[TIMESTAMP]_substrace_wake_routes_rls.sql

Content:
```sql
-- substrace_wake_routes RLS policies
-- BP087 Wave 3 · Knight ships · Bishop applies via psql

ALTER TABLE substrace_wake_routes ENABLE ROW LEVEL SECURITY;

-- service_role full access (bypass default; explicit for audit clarity)
CREATE POLICY "substrace_wake_routes_service_role_all"
  ON substrace_wake_routes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- anon SELECT own routes (identified by peer_id or node_id column)
-- If the table uses a different identity column, Bishop updates the USING clause before apply.
CREATE POLICY "substrace_wake_routes_anon_select_own"
  ON substrace_wake_routes
  FOR SELECT
  TO anon
  USING (peer_id = current_setting('request.headers', true)::json->>'x-peer-id');
```

Knight drops the .sql file to BISHOP_DROPZONE:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\[TIMESTAMP]_substrace_wake_routes_rls_BISHOP_APPLY.sql

Return: .sql file path + content verbatim + the identity column name found in the CREATE TABLE definition.

**SEG-D3 · Eblit mesh-broadcast type wiring**

Locate the MIC broadcast VALID_TYPES array in the codebase. Expected locations (check all):
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\mic-broadcast\
- C:\Users\Administrator\Documents\LianaBanyanPlatform\wan-relay-publish\
- C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\

Add 'eblit_emit' to the VALID_TYPES array (or equivalent constant).

Add a handler case for 'eblit_emit' that:
1. Receives the broadcast payload
2. Fans the payload to all connected peers via the same mechanism as 'eblet_sync' (mirror the eblet_sync handler exactly, changing the type string)
3. Logs: `[MIC] eblit_emit broadcast received, fanning to N peers`

If the codebase uses a switch statement for broadcast type dispatch, add a case 'eblit_emit' block. If it uses a handler map, add the 'eblit_emit' key.

After edits: run `npx tsc --noEmit` from the relevant directory. Gate: zero errors.

Return: file path modified + the added VALID_TYPES entry + the handler code added + tsc exit code.

**SEG-D4 · Scrambler README cleanup**

Locate: C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\scrambler\ (or equivalent Scrambler directory)

1. Read the README in that directory.
2. List all .py files documented in the README.
3. Run `Get-ChildItem *.py` (or equivalent) to list actual .py files on disk.
4. Report the delta: which files are documented but absent.

Knight's recommended action (Founder confirms before apply):
- OPTION 1 (honest README): Update README to list only the files that actually exist on disk. Add a section "## Planned modules (not yet implemented)" listing the 5 absent files with one-line descriptions of their intended purpose.
- OPTION 2 (stub files): Create the 5 missing .py files as minimal stubs: `# [filename] - TODO: implement\n# See README for intended purpose.\n`

Default recommendation: OPTION 1 (honest README). Reason: stubs with TODO markers inflate apparent project completeness without adding real value. An honest README is more useful than 5 empty files.

If Founder confirms OPTION 1 in session: apply it. If Founder confirms OPTION 2: apply it. If not yet confirmed: return the delta analysis and await Founder direction before editing.

Return: README path + delta analysis (documented vs on-disk) + recommended action + confirmation needed flag.

**SEG-D5 · create-mnemosynec-checkout duplicate file cleanup**

Locate the directory containing the duplicate files. Expected path based on SEG-JJ recon:
C:\Users\Administrator\Documents\LianaBanyanPlatform\supabase\functions\create-mnemosynec-checkout\

Files to delete:
- index (1).ts (2,871 bytes, Windows Explorer duplicate)
- index (2).ts (2,871 bytes, Windows Explorer duplicate)

Before deleting:
1. Confirm file sizes match: both should be exactly 2,871 bytes.
2. Confirm content matches index.ts: run a diff or hash comparison between index.ts, index (1).ts, and index (2).ts.
3. If sizes or content differ from 2,871 bytes / index.ts content: HALT. Return the file listing with sizes. Do not delete without confirmation.

If confirmed identical: delete both. `Remove-Item "index (1).ts"` and `Remove-Item "index (2).ts"`.

After deletion: confirm index.ts still exists and is untouched.

Return: pre-delete file listing with sizes + diff result (identical or not) + post-delete directory listing.

---

## §3 FILE TARGETS

New .sql files (Knight writes, Bishop applies):
- C:\Users\Administrator\Documents\LianaBanyanPlatform\supabase\migrations\[TIMESTAMP]_pearl_share_rls.sql
- C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\[TIMESTAMP]_pearl_share_rls_BISHOP_APPLY.sql
- C:\Users\Administrator\Documents\LianaBanyanPlatform\supabase\migrations\[TIMESTAMP]_substrace_wake_routes_rls.sql
- C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\[TIMESTAMP]_substrace_wake_routes_rls_BISHOP_APPLY.sql

Edited files:
- MIC broadcast VALID_TYPES file (path confirmed by SEG-D3)
- Scrambler README (path confirmed by SEG-D4, pending Founder direction)

Deleted files:
- C:\Users\Administrator\Documents\LianaBanyanPlatform\supabase\functions\create-mnemosynec-checkout\index (1).ts
- C:\Users\Administrator\Documents\LianaBanyanPlatform\supabase\functions\create-mnemosynec-checkout\index (2).ts

---

## §4 ACCEPTANCE GATES

Gate 1: pearl_share RLS .sql exists in supabase/migrations/ and in BISHOP_DROPZONE (SEG-D1).
Gate 2: substrace_wake_routes RLS .sql exists in supabase/migrations/ and in BISHOP_DROPZONE (SEG-D2).
Gate 3: 'eblit_emit' in VALID_TYPES + handler present + tsc exits 0 (SEG-D3).
Gate 4: Scrambler README delta analysis returned + Founder direction received or default OPTION 1 applied (SEG-D4).
Gate 5: index (1).ts and index (2).ts deleted, index.ts intact (SEG-D5).
Gate 6: git commit with all 5 closures (or partial commit for the code changes; .sql files go to BISHOP_DROPZONE for Bishop to apply then commit).

All 6 gates before Yoke 4 declared GREEN. If SEG-D4 awaits Founder direction, Yoke 4 is AMBER until README path is confirmed.

---

## §5 DRIFT SURFACE PROTOCOL (BP053 INLINE)

If pearl_share or substrace_wake_routes do not exist in supabase/migrations/: HALT on that item. Return what was found. Do not create tables. Return the drift to Founder.

If VALID_TYPES for MIC broadcast is not found in the expected directories: HALT. Return the directory listing of src/main/ and tools/. Do not guess at the file.

If Scrambler README delta shows fewer than 5 missing files (original brief said 5): return the actual delta. Do not invent missing files.

If index (1).ts or index (2).ts content differs from index.ts: HALT. Return the diff. Do not delete without Founder confirmation.

Drift = surface to Founder immediately. No silent workarounds.

---

## §6 COMPOSITION

Related canon slugs:
- canon_mic_machine_in_charge_naming_lock_bp086 (eblit_emit is a MIC broadcast type)
- canon_persistent_active_memory_crown_jewel_bp085 (eblit_emit broadcasts are part of Mnemo's memory propagation)
- canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086 (broadcast security: eblit_emit must carry same signature requirements as other MIC types)

---

## §7 RETURN TEMPLATE (BP053 §4)

Knight returns one block per SEG:

```
YOKE 4 RETURN · BP087 WAVE 3
SEG-D1: [GREEN|RED] · pearl_share RLS .sql: [path] · BISHOP_DROPZONE copy: [path] · owner column: ______
SEG-D2: [GREEN|RED] · substrace_wake_routes RLS .sql: [path] · BISHOP_DROPZONE copy: [path] · identity column: ______
SEG-D3: [GREEN|RED] · VALID_TYPES file: [path] · eblit_emit added: [YES|NO] · tsc exit: ______
SEG-D4: [GREEN|AMBER] · README path: [path] · missing files: [N] · option applied: [1|2|AWAITING FOUNDER]
SEG-D5: [GREEN|RED] · pre-delete sizes match 2871: [YES|NO] · content identical to index.ts: [YES|NO] · deleted: [YES|NO]
YOKE 4 STATUS: [GREEN|AMBER|RED]
AMBER/RED NOTES: ______
```

---

## §8 STATUTES BINDING HEADER

§2 IMMUTABLES: Knight does not apply Supabase migrations. .sql files go to BISHOP_DROPZONE for Bishop. Do not run psql. Do not alter relay topology or auth flows.

§3 SONNET 4.6 VERBATIM: use segs Sonnet 4.6 verbatim. All SEG workers run Sonnet 4.6. No model substitution.

§4 ABSOLUTE PATHS: All file operations use absolute paths as listed in §3. No relative paths.

§14 GADGET-FIRST: tsc --noEmit for SEG-D3. File size comparison for SEG-D5. No human-eyeball assertions for the gadget-verifiable gates.

§15 BISHOP-DIRECT-SUPABASE: Knight ships .sql for (a) and (b). Bishop applies via psql. Knight does not touch Supabase directly. This is non-negotiable.
