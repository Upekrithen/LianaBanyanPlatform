# KNIGHT YOKE · BLACK MAMBA · 16-FOLDER DEFAULT + ALEXANDRIAN CATACOMBS
## BP087 · WAVE 5 · Sonnet 4.6

---

## GADGET-FIRST PREAMBLE (canon_bp063 + STATUTES §17 · BLOOD)

Discovery and substrate lookup order -- MANDATORY:
1. pheromone_query -- salience + category routing
2. search_knowledge -- eblet content search
3. consult_scribes -- scribe-layer recall
4. pearl_decode -- pearl payload decode
5. brief_me -- session bootstrap

FORBIDDEN for discovery: bash grep · find · Glob · PowerShell · Select-String
Shell ALLOWED ONLY: psql per §15 · curl per §14 REST · git mechanical · build/copy/deploy

Brick Wall pre-authorized scope -- Knight executes all SEG-CL-α through SEG-CL-η
without per-step Founder approval. Scope is bounded to files listed in §3 only.

use segs Sonnet 4.6 verbatim

---

## §0 MISSION STATEMENT

BLACK MAMBA Wave 5 wires the 16-Folder Substrate Default and the Alexandrian
Library Catacombs Mechanism into MnemosyneC. The cooperative gains a
self-growing, license-tier-aware, collectively corroborated knowledge library
organized by 14 MMLU-Pro academic domains plus USER and LIANA_BANYAN folders.
Composes with Wave 4 Keys and Engines (commit eb63ede) for byte distribution.

---

## §1 CONTEXT

The 16-Folder Substrate Default establishes a canonical directory layout under
~/.lb_substrate/ at first launch. Fourteen folders map directly to MMLU-Pro
academic categories (biology through psychology). Two additional folders serve
cooperative-specific purposes: 15_USER holds member-staged contributions
awaiting corroboration, and 16_LIANA_BANYAN holds canonical eblets sourced from
the CAI Bonfire research arm (Spinout 17, SSPL v1). Bootstrap is intentionally
lightweight -- only manifest.json and an empty ledger.jsonl are written per
folder at install time. Heavy content arrives later through the lazy Eblet
Package fetcher, which asks Circle of Influence peers first (via Wave 4 Keys
and Engines Wildfire propagation) before falling back to the server endpoint.

The Alexandrian Library Catacombs Mechanism defines how member-contributed
content earns its place in a named category folder. Contribution is not
self-certifying. Every candidate Eblet passes a 2-of-3 corroboration quorum:
Star Chamber multi-agent consensus analysis (all-Gemma or user-swappable brain
per BP087), Triple Scrambler reconciliation pass, and Keys and Engines hash
quorum. Only after 2-of-3 green does the Eblet publish to the target folder,
the folder manifest soccerball-hash updates, and Marks earn fires per the
BP086 activity rate table. Failures stay staged in 15_USER with an honest log
entry. License-tier-aware access gates for-profit entities through the 30-day
50%-offer commercial license layer while free-tier members (non-profit and
cooperative-member-at-cost-plus-20) retain full read and contribute access.

---

## §2 SEG FAN-OUT

use segs Sonnet 4.6 verbatim

### SEG-CL-alpha · Folder Bootstrap on First Launch

Purpose: Create all 16 Catacombs directories under ~/.lb_substrate/ at
first launch. Idempotent on subsequent launches.

Files (new):
- src/main/catacombs/folder_bootstrap.ts

Logic:
- On app first-launch signal (or missing ~/.lb_substrate/catacombs.bootstrapped flag)
  iterate the FOLDER_MANIFEST constant array and for each slug:
  - mkdir -p ~/.lb_substrate/<slug>/
  - write manifest.json with { slug, version: 1, soccerball_hash: null, eblet_count: 0, last_updated: null }
  - write ledger.jsonl as empty file
- Write ~/.lb_substrate/catacombs.bootstrapped sentinel after all 16 succeed
- Idempotent: if sentinel exists, return early without overwriting existing data

Constants (verbatim, order locked):
```
FOLDER_MANIFEST = [
  '01_biology',
  '02_business',
  '03_chemistry',
  '04_computer_science',
  '05_economics',
  '06_engineering',
  '07_health',
  '08_history',
  '09_law',
  '10_math',
  '11_other',
  '12_philosophy',
  '13_physics',
  '14_psychology',
  '15_USER',
  '16_LIANA_BANYAN'
]
```

Acceptance:
- Fresh install: all 16 directories exist under ~/.lb_substrate/
- Each contains manifest.json (valid JSON) + ledger.jsonl (empty or valid JSONL)
- Second launch: no directories overwritten, sentinel short-circuits

---

### SEG-CL-beta · Eblet Package Fetcher (Lazy + Background)

Purpose: Fetch per-category Eblet packages on demand or pre-fetch all 14.
Reuses Wave 4 Keys and Engines Wildfire propagation -- peer-first, server
fallback.

Files (new):
- src/main/catacombs/eblet_package_fetcher.ts

Logic:
- fetchCategoryPackage(slug: string): Promise<FetchResult>
  1. Emit Keys-and-Engines Circle-of-Influence query for bytes keyed to slug
  2. If peer returns bytes within timeout (3s default): write to ~/.lb_substrate/<slug>/
     update manifest.json (eblet_count, last_updated), emit pearl SOURCE=peer
  3. If no peer: curl GET <CAI_BONFIRE_ENDPOINT>/packages/<slug>.tar.gz
     verify hash from server manifest · write · update manifest.json
     emit pearl SOURCE=server
  4. prefetchAll(): fires fetchCategoryPackage for all 14 MMLU-Pro slugs
     concurrently with Promise.allSettled (failures do not block others)
- Expose IPC channel catacombs:fetch-package for renderer

Acceptance:
- Requesting physics package (13_physics): Keys-and-Engines Circle query fires
  first (observable in IPC trace or log)
- If a paired peer has the bytes: downloads from peer, NOT server
- If no peer: downloads from CAI Bonfire server endpoint
- prefetchAll: 14 concurrent requests, each independently succeeds or fails

---

### SEG-CL-gamma · MMLU-Pro Test Contribution Flow

Purpose: Member submits a candidate Eblet to a named category. System runs
2-of-3 corroboration before publishing.

Files (new):
- src/renderer/components/CatacombsContributePanel.tsx
- src/main/catacombs/contribute_to_category.ts

Contribution pipeline (contribute_to_category.ts):
1. Stage: write candidate Eblet JSON to 15_USER/<uuid>.staged.json +
   append staging row to 15_USER/ledger.jsonl
2. Star Chamber: call star-chamber-analyze with mesh_benchmark_verify payload
   containing the candidate Eblet content + target category slug.
   Capture: { verdict: 'GREEN'|'RED', confidence: number, notes: string }
3. Triple Scrambler: call reconcile.py with the staged file path.
   Capture: { verdict: 'GREEN'|'RED', delta_hash: string }
4. Keys and Engines hash quorum: call keysEnginesQuorum(staged_file_path,
   target_slug). Capture: { verdict: 'GREEN'|'RED', quorum_count: number }
5. Tally: count GREEN verdicts across steps 2/3/4.
   If count >= 2 (2-of-3 pass): publish
     - copy staged file to ~/.lb_substrate/<target_slug>/<uuid>.eblet.json
     - append publish row to <target_slug>/ledger.jsonl
     - call manifest_updater (SEG-CL-eta)
     - emit pearl CONTRIBUTE_RESULT=GREEN
     - fire attribution_log (SEG-CL-delta)
   If count < 2 (fail): stay staged
     - append fail row to 15_USER/ledger.jsonl with corroboration_scores
     - emit pearl CONTRIBUTE_RESULT=RED
     - log honestly: "Corroboration failed. Eblet remains staged in 15_USER."

CatacombsContributePanel.tsx:
- Inputs: category selector (14 MMLU-Pro slugs) + Eblet content textarea
  + optional title + submit button
- Shows live pipeline status for each of the 3 corroboration steps
  (pending / green / red chip per step)
- On GREEN: success message with target folder + soccerball-hash
- On RED: honest failure message + corroboration breakdown

Acceptance:
- Candidate Eblet submission triggers all 3 corroboration paths in sequence
- GREEN path: Eblet appears in target folder + manifest updated + pearl emitted
- RED path: Eblet stays in 15_USER/ledger.jsonl + honest log entry
- UI shows per-step status during pipeline run

---

### SEG-CL-delta · IP Ledger Contribution Attribution + Marks Earn

Purpose: Every published Eblet writes an attribution row to the IP Ledger and
fires Marks earn per the BP086 activity rate table.

Files (new):
- src/main/catacombs/attribution_log.ts
- platform/supabase/migrations/<ts>_catacombs_contributions.sql

attribution_log.ts:
- logAttribution(params: { member_id, category_slug, eblet_uuid,
    corroboration_score, star_chamber_verdict, scrambler_verdict,
    keys_engines_verdict, published_at }): Promise<void>
  1. Insert row into catacombs_contributions table (see .sql below)
  2. Call Marks earn: award 10% work-contribution rate per BP086 rate table
     (10 Marks base · adjusted by corroboration_score if table allows)
  3. Emit pearl ATTRIBUTION_LOGGED with member_id + marks_earned

catacombs_contributions.sql (Knight ships · Bishop applies via psql per §15):
```sql
CREATE TABLE IF NOT EXISTS catacombs_contributions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id        text NOT NULL,
  category_slug    text NOT NULL,
  eblet_uuid       uuid NOT NULL,
  corroboration_score  numeric(4,3) NOT NULL,
  star_chamber_verdict text NOT NULL CHECK (star_chamber_verdict IN ('GREEN','RED')),
  scrambler_verdict    text NOT NULL CHECK (scrambler_verdict IN ('GREEN','RED')),
  keys_engines_verdict text NOT NULL CHECK (keys_engines_verdict IN ('GREEN','RED')),
  marks_earned     numeric(10,4) NOT NULL DEFAULT 0,
  published_at     timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_catacombs_contributions_member
  ON catacombs_contributions (member_id);
CREATE INDEX IF NOT EXISTS idx_catacombs_contributions_category
  ON catacombs_contributions (category_slug);
```

Acceptance:
- Published Eblet: attribution row present in catacombs_contributions
- marks_earned > 0 and matches BP086 10% work rate
- Pearl ATTRIBUTION_LOGGED emitted with correct member_id

---

### SEG-CL-epsilon · License-Tier-Aware Folder Access

Purpose: Gate Catacombs access by member tier. Free tiers get full access.
For-profit-without-license sees offer prompt.

Files (new):
- src/main/catacombs/license_gate.ts

Logic:
- checkAccess(member_id: string, operation: 'read'|'contribute'):
    Promise<AccessResult>
  1. Fetch member tier from substrate: 'non_profit' | 'cooperative_member' |
     'for_profit_licensed' | 'for_profit_unlicensed'
  2. Free tiers ('non_profit', 'cooperative_member'): return { allowed: true }
  3. 'for_profit_licensed': return { allowed: true }
  4. 'for_profit_unlicensed':
     - 'read': return { allowed: true, gated: true, show_offer: true,
         offer_ref: 'canon_30_day_50_percent_commercial_license_offer' }
     - 'contribute': return { allowed: false, show_offer: true,
         offer_ref: 'canon_30_day_50_percent_commercial_license_offer' }
- licenseOfferPrompt(): returns the 30-day 50%-offer copy for UI display
  (compose with canon_30_day_50_percent_commercial_license_offer_letter_
  campaign_ai_companies_sspl_section_13_forcing_function_bp087)

Compose with:
- canon_android_of_ai_licensing_model_sspl_base_apache_library_pledge_2260_
  patent_upekrithen_llc_bp087
- canon_30_day_50_percent_commercial_license_offer_letter_campaign_ai_companies_
  sspl_section_13_forcing_function_bp087

Acceptance:
- Free-tier member: checkAccess returns { allowed: true } for read and contribute
- For-profit-unlicensed read: allowed: true, gated: true, show_offer: true
- For-profit-unlicensed contribute: allowed: false, show_offer: true
- Offer prompt copy references 30-day 50% commercial license

---

### SEG-CL-zeta · Settings UI: Pre-Fetch All 14 + Browse Catacombs

Purpose: Top-level Catacombs tab in MnemosyneTabView. Member browses all 16
folders, searches Eblets, contributes, and pre-fetches any or all categories.

Files (new):
- src/renderer/components/CatacombsTab.tsx
- src/renderer/components/CategoryBrowser.tsx

CatacombsTab.tsx:
- Renders as top-level tab inside MnemosyneTabView (add to tab registry)
- Shows 16 folder cards arranged in a grid (slug + eblet_count + last_updated
  pulled from manifest.json via IPC catacombs:get-manifest)
- "Pre-fetch All" button: fires IPC catacombs:prefetch-all (SEG-CL-beta
  prefetchAll) · shows per-folder progress chips
- Per-folder "Fetch" button for individual category pull
- Clicking a folder card opens CategoryBrowser for that slug
- License gate: if for-profit-unlicensed, show offer banner above grid
  (read allowed · contribute blocked with offer CTA)

CategoryBrowser.tsx:
- Props: categorySlug, displayName
- Lists Eblet entries from <slug>/ledger.jsonl via IPC catacombs:list-eblets
- Search bar: on input debounce 300ms, call pheromone_query with
  { category: slug, query: searchText } · render substrate hits above
  local ledger results
- "Contribute" button opens CatacombsContributePanel inline
- Each Eblet row shows: title · published_at · corroboration_score chip
  · soccerball-hash (truncated 8 chars)

Acceptance:
- Member clicks Catacombs tab: all 16 folder cards visible
- Pre-fetch All: fires 14 concurrent fetch calls, per-folder progress shown
- Category browser: search fires pheromone_query · returns substrate hits
- Contribute flow accessible from browser
- License banner shown for for-profit-unlicensed tier

---

### SEG-CL-eta · Folder-Manifest Soccerball-Hash Update on Publish

Purpose: After every successful publish to a category folder, recompute the
folder's soccerball-hash, update manifest.json, and emit the new hash to the
IP Ledger for Keys and Engines quorum verification.

Files (new):
- src/main/catacombs/manifest_updater.ts

Logic:
- updateManifest(categorySlug: string, newEbletUuid: string): Promise<string>
  1. Read all *.eblet.json files in ~/.lb_substrate/<categorySlug>/
  2. Sort by published_at ASC (deterministic order)
  3. Compute soccerball-hash: SHA-256 over the concatenation of all eblet_uuid
     values in sorted order (per BP063 Socceri naming canon)
  4. Update manifest.json: { soccerball_hash, eblet_count, last_updated: now() }
  5. Append to IP Ledger: { slug, soccerball_hash, eblet_count, recorded_at }
     via IPC or direct write to ~/.lb_substrate/ip_ledger.jsonl
  6. Emit pearl MANIFEST_UPDATED with { slug, soccerball_hash }
  7. Return soccerball_hash string

Keys and Engines quorum verify (compose with Wave 4 eb63ede):
- After updateManifest emits, paired peers can request the new soccerball_hash
  via Keys-and-Engines quorum call keysEnginesVerifyManifest(slug, hash)
- Quorum confirms: peer manifest hash matches local hash before sync proceeds

Acceptance:
- Publish to 13_physics: manifest.json updated with new soccerball_hash
- IP Ledger (ip_ledger.jsonl) has a new row for the update
- Pearl MANIFEST_UPDATED emitted
- Paired peer can call Keys-and-Engines quorum to verify hash before sync

---

## §3 FILE TARGETS (absolute paths)

All paths relative to project root. Knight uses absolute paths at runtime.

New files Knight creates:
```
src/main/catacombs/folder_bootstrap.ts
src/main/catacombs/eblet_package_fetcher.ts
src/main/catacombs/contribute_to_category.ts
src/main/catacombs/attribution_log.ts
src/main/catacombs/license_gate.ts
src/main/catacombs/manifest_updater.ts
src/renderer/components/CatacombsContributePanel.tsx
src/renderer/components/CatacombsTab.tsx
src/renderer/components/CategoryBrowser.tsx
platform/supabase/migrations/<ts>_catacombs_contributions.sql
```

Modified files (additive only):
```
src/renderer/components/MnemosyneTabView.tsx  (add CatacombsTab to tab registry)
src/main/index.ts                              (register IPC handlers for catacombs:*)
```

Runtime data paths (created by bootstrap, not committed):
```
~/.lb_substrate/01_biology/manifest.json
~/.lb_substrate/01_biology/ledger.jsonl
... (pattern repeats for all 16 folders)
~/.lb_substrate/catacombs.bootstrapped
~/.lb_substrate/ip_ledger.jsonl
```

IPC channel registry (add to main/index.ts handler block):
```
catacombs:bootstrap
catacombs:fetch-package   (slug)
catacombs:prefetch-all
catacombs:get-manifest    (slug)
catacombs:list-eblets     (slug)
catacombs:contribute      (slug, eblet_content, member_id)
catacombs:check-access    (member_id, operation)
```

---

## §4 ACCEPTANCE GATES (gadget-verifiable)

Gate 1 · Folder bootstrap
  - pheromone_query { event: 'catacombs_bootstrap_complete' } returns receipt
  - ~/.lb_substrate/ contains exactly 16 subdirectories
  - Each subdirectory has manifest.json (valid JSON) + ledger.jsonl

Gate 2 · Eblet Package Fetcher (Wildfire peer-first)
  - IPC trace shows Circle-of-Influence query fires before any curl call
  - If peer has bytes: SOURCE=peer in pearl receipt
  - If no peer: SOURCE=server in pearl receipt
  - prefetchAll: 14 independent fetch results in Promise.allSettled receipt

Gate 3 · Contribute pipeline (2-of-3 corroboration)
  - Submit candidate Eblet: three corroboration calls appear in IPC log
    in order (star-chamber, reconcile.py, keysEnginesQuorum)
  - GREEN path: Eblet file present in target category folder
  - GREEN path: manifest.json eblet_count incremented
  - GREEN path: pearl CONTRIBUTE_RESULT=GREEN emitted
  - RED path: 15_USER/ledger.jsonl has fail row with corroboration_scores
  - RED path: pearl CONTRIBUTE_RESULT=RED emitted
  - RED path: NO file in target category folder

Gate 4 · Attribution + Marks earn
  - Published Eblet: row in catacombs_contributions with correct member_id
  - marks_earned column > 0 matching BP086 10% work rate
  - Pearl ATTRIBUTION_LOGGED emitted with member_id

Gate 5 · License gate
  - Non-profit member: checkAccess('read') = { allowed: true } (no gating)
  - Cooperative member: checkAccess('contribute') = { allowed: true }
  - For-profit-unlicensed: checkAccess('read') = { allowed: true, gated: true }
  - For-profit-unlicensed: checkAccess('contribute') = { allowed: false }
  - UI: offer banner visible for for-profit-unlicensed tier

Gate 6 · Catacombs Settings tab + CategoryBrowser
  - CatacombsTab renders in MnemosyneTabView tab bar
  - 16 folder cards visible with eblet_count from manifest.json
  - Search in CategoryBrowser: pheromone_query fires (observable in IPC log)
  - Pre-fetch All button: 14 concurrent IPC calls fired

Gate 7 · Manifest soccerball-hash
  - Publish to 13_physics: manifest.json soccerball_hash changes
  - ip_ledger.jsonl has new row with matching hash
  - Pearl MANIFEST_UPDATED emitted
  - Keys-and-Engines quorum call keysEnginesVerifyManifest returns match

---

## §5 DRIFT SURFACE PROTOCOL (BP053 inline)

Knight MUST NOT:
- Alter Wave 4 Keys and Engines files (src/main/keys_and_engines/*) except
  to call exported functions. No internal edits to eb63ede-committed files.
- Change the FOLDER_MANIFEST constant order. Slugs are locked by this Yoke.
- Substitute a different corroboration mechanism for Star Chamber, Triple
  Scrambler, or Keys-and-Engines quorum. All 3 paths are required.
- Apply psql migrations directly. Knight ships the .sql file to
  platform/supabase/migrations/. Bishop applies via psql per §15.
- Infer member tier from local state. Always query substrate for live tier.
- Skip the sentinel check in folder_bootstrap.ts. Idempotency is a gate.

Drift signals (Bishop watches for):
- Any new file in src/main/catacombs/ not listed in §3 above
- Any manifest.json schema field added without updating this Yoke
- Any 4th corroboration step added to contribute_to_category.ts
- Any direct Supabase client call in Knight-authored catacombs files
  (must go through IPC + main process only)
- IP Ledger rows written with member_id = null (attribution leak)

On drift detected: Bishop flags to Founder before merge. Knight does not
self-correct past scope without a new Yoke.

---

## §6 COMPOSITION (canon slugs)

Parent canons (this Yoke implements):
- canon_16_folder_substrate_default_14_mmlu_pro_user_liana_banyan_eblet_packages_bp087
- canon_alexandrian_library_catacombs_collective_corroborated_user_contribution_substrate_growing_bp087

Byte distribution layer (Wave 4, already wired):
- canon_keys_and_engines_frame_to_frame_wildfire_propagation_2_of_3_ip_ledger_hash_quorum_bp087

Corroboration brain layer:
- canon_star_chamber_all_gemma_or_user_swappable_brain_swap_compose_bp087

License layer:
- canon_android_of_ai_licensing_model_sspl_base_apache_library_pledge_2260_patent_upekrithen_llc_bp087
- canon_30_day_50_percent_commercial_license_offer_letter_campaign_ai_companies_sspl_section_13_forcing_function_bp087

Economics:
- canon_marks_clearing_mechanisms_activity_rate_table_bp086

Canonical eblet source (folder 16):
- canon_cai_bonfire_project_spinout_17_standalone_above_sweet_16_sspl_ollama_bp086

---

## §7 RETURN TEMPLATE (BP053 §4 · empirical receipt only)

Knight returns this block verbatim after completing all SEG fan-out work.
No speculative claims. Empirical only.

```
WAVE_5_RETURN {
  yoke_ref:        "KNIGHT_YOKE_BLACK_MAMBA_16_FOLDER_DEFAULT_ALEXANDRIAN_CATACOMBS_BP087_WAVE_5"
  seg_completed:   []  // list SEG-CL-alpha through SEG-CL-eta as completed
  seg_failed:      []  // list any with reason
  files_created:   []  // absolute paths
  files_modified:  []  // absolute paths
  gate_results: {
    gate_1_bootstrap:        "GREEN|RED"
    gate_2_fetcher_wildfire: "GREEN|RED"
    gate_3_contribute:       "GREEN|RED"
    gate_4_attribution:      "GREEN|RED"
    gate_5_license:          "GREEN|RED"
    gate_6_tab_browser:      "GREEN|RED"
    gate_7_soccerball_hash:  "GREEN|RED"
  }
  sql_shipped:     "<ts>_catacombs_contributions.sql"  // path, Bishop applies
  pearls_emitted:  []  // list pearl slugs observed during implementation
  drift_notes:     ""  // honest description of any scope boundary touched
  em_dash_check:   "CLEAN"  // Knight verifies zero em-dashes in all new files
}
```

---

## §8 STATUTES BINDING HEADER

§2 IMMUTABLES
- Sonnet 4.6 only for all SEG execution in this wave
- No model substitution without Founder ratify
- 16 folder slugs are immutable as listed in §2 SEG-CL-alpha constants

§3 SONNET 4.6 VERBATIM
- use segs Sonnet 4.6 verbatim
- All SEG fan-out agents run Sonnet 4.6. No other model. No exception.

§4 ABSOLUTE PATHS
- All file paths in code, IPC handlers, and migration filenames must be
  absolute at runtime. No relative paths in production code.
- ~/.lb_substrate/ is expanded to the platform home directory at runtime.

§14 GADGET-FIRST (BLOOD)
- All substrate discovery in Knight-authored code must use:
  pheromone_query / search_knowledge / consult_scribes / pearl_decode / brief_me
- FORBIDDEN in Knight-authored catacombs code:
  bash grep · fs.readdirSync for discovery · find · glob pattern matching
  for substrate content · PowerShell · Select-String
- Shell use restricted to: psql (§15) · curl (REST calls) · git mechanical
  · build/copy/deploy operations

§15 BISHOP-DIRECT SUPABASE
- Knight ships platform/supabase/migrations/<ts>_catacombs_contributions.sql
- Knight does NOT apply migrations. Bishop applies via psql per §15 protocol.
- Knight does NOT instantiate a Supabase client in any catacombs file.
  All DB access goes through the established main-process DB layer.

§17 GADGET-FIRST DISCOVERY BLOOD
- Knight uses pheromone_query / search_knowledge / consult_scribes for all
  substrate state discovery during implementation.
- Never bash grep / find / Glob for substrate content.
- Violation of §17 is a BLOOD offense. Stop. Report to Bishop immediately.

---

*Yoke sealed BP087 · Wave 5 · Sonnet 4.6 · zero em-dashes*
