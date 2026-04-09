# PROMPT_KNIGHT_SESSION_292 — Fingertips Pipeline Acceleration
## Bishop B078 | April 4, 2026
## Mission: Unblock the Corps → compiled_documents pipeline so frontend redesign can ship

---

## CONTEXT (read first)

The Stitchpunk Corps (SP-1 → SP-10) has analyzed 25,697 files and pushed 9,653 to the Supabase content_archive. But the Fingertips access layer — canonical, de-duplicated, taxonomy-aware content ready for frontend surfaces — is at ~1% capacity:

| Stage | Current | Target |
|---|---|---|
| Files analyzed (SP-1/SP-2) | 25,697 | 25,697 ✓ |
| Classified (SP-3) | 10,402 (40.5%) | ≥85% (21,800+) |
| Content in Supabase | 9,653 | 9,653 ✓ |
| Pipeline-bridged | 223 (2.3%) | ≥6,000 (60%+) |
| Compiled to canonical | 20 (~1.2%) | ≥1,000 (60%+) |
| Hash duplicates archived | 0 | 2,579 |

**Why this matters:** The Pawn-suggested frontend redesign depends on Fingertips to drive progressive disclosure (Skipping Stones), role-filtered content, Spice Rack taxonomy routing, and "All the Pudding" TV Guide population. With only 1% compiled, the redesign would hit mostly null cells. Ship this pipeline → unblock the redesign.

---

## WORKING DIRECTORY

- **Scripts:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp\stitchpunks\`
- **Data/state:** `librarian-mcp/stitchpunks/data/`
- **Edge fns:** `platform/supabase/functions/ingest-corps-content/`, `publish-approved-content/`
- **Migrations:** `platform/supabase/migrations/20260403000001_corps_staff_auto_wire.sql` (K281 baseline)
- **Tables:** `content_archive`, `domain_taxonomy_bridge`, `compiled_documents`

---

## PHASES

### Phase 1: Classification Catch-Up (15,295 uncategorized)

**Current state:** `data/classifier_assignments.json` shows `content_analyzed: false`, 15,295 files in `uncategorized_files`.

**Task:** Re-run SP-3 Classifier with content analysis enabled.

```bash
cd librarian-mcp/stitchpunks
python sp3_classifier.py --with-content-analysis --force
```

**If the script doesn't support `--with-content-analysis` flag:** patch it to read file content (not just filename) and classify against the 10 canonical sections. Batch in chunks of 500 to avoid memory blowup.

**Acceptance:**
- `data/classifier_assignments.json` updated
- `classified` count ≥ 21,800
- `uncategorized` count ≤ 3,900
- `content_analyzed: true`

### Phase 2: Pipeline Bridge Throughput (9,653 → 6,000+ bridged)

**Current state:** `data/pipeline_bridge_state.json` shows only 223 slugs bridged through `domain_taxonomy_bridge`. Last run 2026-04-03.

**Task:** Diagnose the bottleneck and batch-bridge the rest.

1. Read `sp10_pipeline_bridge.py` + `ingest-corps-content/index.ts` — identify why throughput is low
2. Check: is it rate-limiting, classification dependency, domain-mapping gaps, or missing source material?
3. Batch-run the bridge in chunks of 500, logging progress to `pipeline_bridge_log.json`
4. Target: bridge all content_archive items that have a valid domain classification

**Acceptance:**
- `data/pipeline_bridge_state.json` shows `bridged_slugs` ≥ 6,000
- `pipeline_bridge_log.json` captures any skipped items with reasons
- `domain_taxonomy_bridge` table query confirms match

### Phase 3: Compilation Acceleration (20 → 1,000+ compiled)

**Current state:** `compiled_documents` table has 20 rows (per Founder's Log B035, "Status counts: compiled: 20, pending: 1599").

**Task:** Batch-compile the pending 1,599 items.

1. Review `compilation_helper.py` and the edge function `publish-approved-content/index.ts`
2. Build a batch runner that pulls pending items from the compilation queue, compiles them into canonical form (merges variants, applies Founder Corrections, generates canonical markdown + SQL insert), and writes to `compiled_documents`
3. For duplicates (per Archivist report), compile the canonical version only and link duplicates to it
4. Run in batches of 100 with logging

**Acceptance:**
- `compiled_documents` row count ≥ 1,000
- Pending count ≤ 600
- Compilation log written to `data/compilation_progress.json`
- No row marked compiled without passing Founder Corrections validation

### Phase 4: Hash-Duplicate Cleanup (2,579 items)

**Current state:** `data/archivist_report.json` shows 2,579 hash duplicates identified but not archived.

**Task:** Archive the 2,579 byte-identical duplicates to a cold-storage location using `move_to_archive.py`.

1. For each hash-duplicate group, keep the file with the best name/location (heuristic: deepest in canonical dir, most recent, shortest name)
2. Move all other copies to `archive/hash_duplicates_b078/` with manifest
3. Update `cartographer_manifest.json` post-cleanup

**Acceptance:**
- `move_archive_manifest.json` B078 section shows 2,579 files moved
- Cartographer re-scan shows reduced total file count

---

## VERIFICATION (end of session)

Run a final report and save to `BISHOP_DROPZONE/99_Misc/FINGERTIPS_PIPELINE_STATUS_B078.md`:

```
Classification:   [before] → [after]   (target ≥85%)
Pipeline bridge:  [before] → [after]   (target ≥60%)
Compiled docs:    [before] → [after]   (target ≥60% of 1,619)
Hash dupes:       [before] → [after]   (target 2,579 archived)
```

---

## SCOPE DISCIPLINE

- **Do NOT** redesign the Corps architecture. Just push throughput.
- **Do NOT** delete anything outside `archive/hash_duplicates_b078/`.
- **Do NOT** alter canonical rules (Cost+20%, 83.3%, SEC language).
- **Preserve** all classifier assignments even if re-run produces different results; write new run to a timestamped file.
- **Idempotent reruns** — every script should resume from state, not restart from zero.

---

## TIMEOUT GUARDRAILS

- If any single batch takes > 10 minutes, save state and report back.
- If any phase can't hit its acceptance criteria cleanly, stop, document the blocker, and report findings.
- Edge function timeouts: apply the same two-phase pattern from K288 (cap immediate work, defer remainder with scheduled_for).

---

## WHAT THIS UNBLOCKS

Once complete (~60%+ compiled):
- Pawn-suggested frontend redesign can ship
- "All the Pudding" TV Guide populates from real data
- Spice Rack routing + Recipe Pot matching get usable inputs
- Progressive-disclosure content layers have content at each depth

---

*Bishop B078. Phase 1-4 with clear acceptance criteria. Resume-from-state scripts. Non-destructive. Unblocks the redesign.*
