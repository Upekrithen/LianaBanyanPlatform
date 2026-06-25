# KNIGHT YOKE · MIGRATE 72 DRIFT FILES TO CANONICAL PATH · BP085
**Written by:** Bishop SEG · Sonnet 4.6 · 2026-06-17
**Yoke file:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_MIGRATE_72_DRIFT_FILES_BP085.md`

---

## MANDATORY PREAMBLE (BP084 HARD BINDING · READ BEFORE ANYTHING ELSE)

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## BP085 BLOOD · NEVER EXPOSE API OR SECRET KEYS EVER

BP085 §14 BLOOD — gadget-first before asking Founder to repeat. BP085 §15 BLOOD — Knight main thread for orchestration; spawn SEGs for substantive work.

**HARD BINDING · Knight AND all SEGs.**

Some files in the drift path may reference environment variable paths or contain references to API keys, tokens, secret paths, or credential names. The following rules apply absolutely — no exceptions:

- NEVER echo, print, log, copy, pipe, or display the CONTENTS of any secret or credential
- The path `C:\Users\Administrator\.claude\state\secrets\22May2026.env` is referable by path ONLY — contents are BLOOD-STATUTE FORBIDDEN
- If any migrated file's content appears to contain a literal key/token value, do NOT log that content — log filename + "content flagged" only
- Safe subshell pattern for any env loading: `(eval "$(grep -E '^VARNAME=' /path/.env)"; command)` — single-var extraction, zero credential exposure
- This binding applies to ALL 5 SEGs spawned in this Yoke

Composes with: [[canon-never-expose-api-secret-keys-bloodbinding-bp085]] · [[feedback_secrets_env_path_active_22may2026_never_expose_bp081]]

---

## MISSION SUMMARY

**Task:** Bulk migrate 72 historical files from the DRIFT path to the CANONICAL path.

**Drift path (source):**
`C:\Users\Administrator\Documents\BISHOP_DROPZONE\00_FOUNDER_REVIEW\`

**Canonical path (destination):**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\`

**File classes at drift path:**
- BP053/BP054/BP058/BP078-era historical documents
- Cold Opens
- Augur SUPERSEDE receipts
- Implementation specs

**Constraints (HARD):**
1. Do NOT touch any directory or file outside the two paths named above
2. Do NOT silently overwrite — log every action — Truth-Always
3. Do NOT delete a drift file until byte-equality of canonical copy is verified
4. Do NOT modify file content during migration
5. If any single move fails: HALT all subsequent moves — surface the error — do not continue
6. Honor SUPERSEDED stub pattern: if canonical already has a SUPERSEDED stub for a drift file, the drift copy is OLD — delete it without migrating
7. If conflicts surface requiring Founder decision: PAUSE — set status YELLOW — do not auto-resolve

**Outputs:**
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MIGRATION_INVENTORY_72_BP085.md` (SEG-1)
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MIGRATION_LOG_72_BP085.md` (SEG-4)
- Knight return summary (this thread)
- 5 Sharps GREEN table in return

---

## SEG-1 · INVENTORY + CLASSIFICATION

**Spawn:** Sonnet 4.6 SEG
**Mandate:** Glob drift path, classify every file, write inventory table.

### Instructions

1. List ALL files in `C:\Users\Administrator\Documents\BISHOP_DROPZONE\00_FOUNDER_REVIEW\` (non-recursive — top-level only unless subdirectories are found, in which case flag them separately)

2. For each file collect:
   - Filename (exact)
   - File size in bytes
   - Last-modified timestamp (ISO 8601)
   - BP-session prefix extracted from filename (BP053 / BP054 / BP058 / BP078 / other — scan filename for `BP0\d+` pattern)
   - File type/category heuristic (Cold Open / SUPERSEDE receipt / implementation spec / yoke / eblet / other)

3. For each file, check canonical path for same filename:
   - `Test-Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\<filename>"`
   - Classify:
     - **(a) SAFE** — no duplicate at canonical → ready to migrate
     - **(b) CONFLICT** — same filename exists at canonical → hold for SEG-2
     - **(c) SUPERSEDED** — canonical has a file matching pattern `SUPERSEDED_<filename>` or `<filename>.SUPERSEDED` or the file at canonical is a SUPERSEDE stub referencing this drift file → do not migrate, delete drift copy after SEG-2 confirms

4. Write full inventory table to:
   `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MIGRATION_INVENTORY_72_BP085.md`

   Table columns: `| Filename | Size (bytes) | Last Modified | BP-Session | Category | Classification |`

5. Append summary counts: total files · class (a) count · class (b) count · class (c) count

6. Return to Knight: summary counts only (do NOT paste full table into chat — file path is sufficient)

### PowerShell snippet (SEG-1 reference implementation)

```powershell
$drift = "C:\Users\Administrator\Documents\BISHOP_DROPZONE\00_FOUNDER_REVIEW"
$canonical = "C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW"

$files = Get-ChildItem -Path $drift -File
foreach ($f in $files) {
    $canonicalExists = Test-Path (Join-Path $canonical $f.Name)
    $supersededExists = Test-Path (Join-Path $canonical ("SUPERSEDED_" + $f.Name))
    # classify based on flags above
}
```

---

## SEG-2 · CONFLICT RESOLUTION DECISIONS

**Spawn:** Sonnet 4.6 SEG
**Prerequisite:** SEG-1 complete · class (b) CONFLICT list available
**Mandate:** For each conflict, compare copies and classify resolution. Surface Founder-decision items. Do NOT auto-overwrite.

### Instructions

1. Receive class (b) CONFLICT list from SEG-1

2. For each CONFLICT file, compare drift copy vs canonical copy:
   - Get-FileHash on both copies (SHA256) — if hashes match → **BYTE_IDENTICAL** → drift can be deleted
   - Compare last-modified timestamps: which is newer?
   - Compare file sizes: which is larger?

3. Classify each conflict into one of three resolutions:

   | Resolution | Condition | Action |
   |---|---|---|
   | **CANONICAL_WINS** | Canonical is newer AND larger OR hashes identical | Safe to delete drift copy — canonical already has the content |
   | **DRIFT_WINS** | Drift is newer AND larger → unique content likely | Flag for Founder decision — do NOT auto-overwrite |
   | **FOUNDER_DECISION** | Ambiguous (one newer, one larger; or unclear) | Flag for Founder decision — do NOT auto-overwrite |

4. Build conflict resolution table:

   ```
   | Filename | Drift Size | Drift Modified | Canonical Size | Canonical Modified | Hash Match | Resolution |
   ```

5. Surface all **DRIFT_WINS** and **FOUNDER_DECISION** rows in a clearly marked `## FOUNDER ACTION REQUIRED` section

6. If ANY Founder-decision items exist: set a YELLOW flag → Knight must PAUSE after SEG-2 and surface the flagged table to Founder before proceeding to SEG-3

7. Append conflict resolution table to `MIGRATION_INVENTORY_72_BP085.md`

8. Return to Knight: conflict count by resolution class · YELLOW flag status

---

## SEG-3 · EXECUTE SAFE MIGRATIONS

**Spawn:** Sonnet 4.6 SEG
**Prerequisite:** SEG-1 + SEG-2 complete · class (a) SAFE list confirmed · CANONICAL_WINS and BYTE_IDENTICAL deletes confirmed
**Gate:** If YELLOW flag raised in SEG-2, Founder must approve before SEG-3 proceeds on conflict files. SEG-3 may proceed immediately on class (a) SAFE files only.
**Mandate:** Execute moves with atomic verify-then-delete. Halt on any failure.

### Instructions

1. Process class (a) SAFE files first (no conflict):

   For each file:
   ```powershell
   $src = Join-Path $drift $filename
   $dst = Join-Path $canonical $filename
   
   # Step 1: Copy
   Copy-Item -Path $src -Destination $dst -Force:$false  # do NOT force-overwrite
   
   # Step 2: Verify byte equality
   $srcHash = (Get-FileHash -Path $src -Algorithm SHA256).Hash
   $dstHash = (Get-FileHash -Path $dst -Algorithm SHA256).Hash
   
   if ($srcHash -eq $dstHash) {
       # Step 3: Delete source only after verified
       Remove-Item -Path $src -Force
       # Log: MOVED_VERIFIED $filename
   } else {
       # HALT — hash mismatch
       Write-Error "HALT: Hash mismatch on $filename — src=$srcHash dst=$dstHash"
       exit 1  # Do NOT continue
   }
   ```

2. **HALT POLICY:** If any single file fails copy OR hash verification:
   - Log the failure immediately
   - Do NOT proceed to next file
   - Leave all remaining drift files untouched
   - Return HALT status to Knight with filename and error

3. Process CANONICAL_WINS deletes (from SEG-2): delete drift copy only — no copy needed (canonical already has it)
   - Verify canonical copy exists and is readable before deleting drift
   - Log each deletion as: `DRIFT_DELETED_CANONICAL_WINS $filename`

4. Process BYTE_IDENTICAL deletes: same as CANONICAL_WINS — delete drift, log

5. Do NOT touch FOUNDER_DECISION or DRIFT_WINS files — leave at drift path

6. Append each action to migration log as it happens (running log, not end-of-batch):
   `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MIGRATION_LOG_72_BP085.md`

   Log format per line:
   ```
   [ISO-TIMESTAMP] ACTION: MOVED_VERIFIED | filename.md | drift-hash=XXXX | canonical-hash=XXXX
   [ISO-TIMESTAMP] ACTION: DRIFT_DELETED_CANONICAL_WINS | filename.md
   [ISO-TIMESTAMP] ACTION: DRIFT_DELETED_BYTE_IDENTICAL | filename.md
   [ISO-TIMESTAMP] ACTION: SKIPPED_FOUNDER_DECISION | filename.md
   [ISO-TIMESTAMP] ACTION: HALT | filename.md | error=<message>
   ```

7. Return to Knight: files moved · files deleted (canonical wins) · files skipped (founder decision) · any HALT

---

## SEG-4 · FINAL STATE REPORT

**Spawn:** Sonnet 4.6 SEG
**Prerequisite:** SEG-3 complete (or halted — report actual state regardless)
**Mandate:** Enumerate both directories post-migration. Write migration log summary.

### Instructions

1. List current state of drift path:
   - Count remaining files
   - List each remaining filename + why it remains (FOUNDER_DECISION / HALT / SUPERSEDED_PRESERVED)

2. List canonical path:
   - Count total files
   - Spot-check: pick 5 filenames from the migration log's MOVED_VERIFIED list → confirm each is present at canonical (`Test-Path`)

3. Write final summary section to migration log:
   `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MIGRATION_LOG_72_BP085.md`

   Include:
   ```markdown
   ## MIGRATION SUMMARY · BP085
   - Migration date: [ISO date]
   - Files at drift path initially: [N]
   - Files MOVED_VERIFIED: [N]
   - Files DRIFT_DELETED_CANONICAL_WINS: [N]
   - Files DRIFT_DELETED_BYTE_IDENTICAL: [N]
   - Files SKIPPED_FOUNDER_DECISION: [N]
   - Files remaining at drift path: [N]
   - Migration status: COMPLETE / PARTIAL_YELLOW / HALTED
   ```

4. If migration status is PARTIAL_YELLOW: list exact filenames requiring Founder action

5. Return to Knight: full summary block (paste into return)

---

## SEG-5 · VERIFY + SHARPS

**Spawn:** Sonnet 4.6 SEG
**Prerequisite:** SEG-4 complete
**Mandate:** Spot-check 5 files, count check, return 5 Sharps table.

### Instructions

1. From the MOVED_VERIFIED list in migration log, select 5 files (spread across BP-session prefixes if possible — e.g., one BP053, one BP058, one BP078, etc.)

2. For each of the 5 spot-check files:
   - Confirm presence at canonical: `Test-Path` → must be TRUE
   - Confirm absence at drift: `Test-Path` → must be FALSE
   - Confirm hash match: `Get-FileHash` canonical vs the logged hash → must match
   - Result: PASS / FAIL

3. Count check:
   - Files at drift path NOW = (initial count) - (MOVED_VERIFIED count) - (DELETED count)
   - Verify actual `Get-ChildItem` count matches expected count
   - Result: PASS / FAIL

4. Return 5 Sharps table to Knight:

   | Sharp | Check | Status |
   |---|---|---|
   | Sharp-1 | 5-file spot-check: all at canonical, none at drift | GREEN / RED |
   | Sharp-2 | Drift path file count = expected post-migration remainder | GREEN / RED |
   | Sharp-3 | Migration log exists and is non-empty at canonical path | GREEN / RED |
   | Sharp-4 | Inventory file exists and is non-empty at canonical path | GREEN / RED |
   | Sharp-5 | No HALT events in migration log (or HALT surfaced and acknowledged) | GREEN / YELLOW |

5. If any Sharp is RED: surface specific failure — Knight does NOT declare complete

6. If FOUNDER_DECISION items remain unresolved: Sharp-5 = YELLOW · overall status = PARTIAL_YELLOW

---

## KNIGHT RETURN FORMAT

When all SEGs complete, Knight returns to Bishop with:

```
Sonnet 4.6

YOKE: KNIGHT_YOKE_MIGRATE_72_DRIFT_FILES_BP085
STATUS: [COMPLETE / PARTIAL_YELLOW / HALTED]

SEG-1: [N] files inventoried · [Na] safe · [Nb] conflict · [Nc] superseded
SEG-2: [N] conflicts resolved · [Nf] flagged for Founder · YELLOW=[Y/N]
SEG-3: [N] moved+verified · [N] drift-deleted · [N] skipped
SEG-4: Drift path now has [N] files · Canonical path has [N] files · Log written
SEG-5: 5/5 spot-checks PASS · count check PASS

SHARPS:
| Sharp | Check | Status |
|---|---|---|
| Sharp-1 | 5-file spot-check | GREEN |
| Sharp-2 | Drift count check | GREEN |
| Sharp-3 | Migration log present | GREEN |
| Sharp-4 | Inventory file present | GREEN |
| Sharp-5 | No unacknowledged HALTs | GREEN |

[If PARTIAL_YELLOW: list filenames awaiting Founder decision]

MIGRATION LOG: C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MIGRATION_LOG_72_BP085.md
INVENTORY: C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MIGRATION_INVENTORY_72_BP085.md
```

---

## FOUNDER GATE

If SEG-2 surfaces any FOUNDER_DECISION items:

Knight MUST stop and present the following to Founder before proceeding on conflict files:

```
FOUNDER GATE · BP085 MIGRATION
[N] files have conflicting versions at both drift and canonical paths.

Drift copy is NEWER or appears to have unique content for these files:
[table from SEG-2]

Please decide for each:
  (A) Keep canonical — delete drift copy
  (B) Keep drift — overwrite canonical with drift content
  (C) Keep both — rename drift copy with prefix DRIFT_ and migrate

Knight will resume SEG-3 conflict processing after your decision.
```

---

## PASTE-READY KNIGHT WAKE

Copy the block below verbatim into a new Knight session to execute this Yoke:

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

BP085 BLOOD: NEVER expose API or secret keys. Never echo, print, log, copy, pipe, or display the contents of any credential or secret. Path references are referable; credential contents are BLOOD-STATUTE FORBIDDEN. All SEGs bound.

Your Yoke is at:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_MIGRATE_72_DRIFT_FILES_BP085.md

Read the full Yoke file first. Then execute SEG-1 through SEG-5 in order, spawning Sonnet 4.6 SEGs for each. Pause at Founder Gate if SEG-2 raises a YELLOW flag. Return the Knight Return Format block when complete.
```

---

*Yoke composed by Bishop SEG · Sonnet 4.6 · BP085 · 2026-06-17*
*Composes with: [[canon-never-expose-api-secret-keys-bloodbinding-bp085]] · [[feedback_secrets_env_path_active_22may2026_never_expose_bp081]] · [[canon_knight_yoke_preamble_sonnet_46_segs_orchestrator_no_composer_bp084]] · [[feedback-only-sonnet-4-6-for-segs-ever-bp081]]*
