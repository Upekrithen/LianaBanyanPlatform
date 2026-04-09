# KNIGHT SESSION 294B — SP-11 Gold Panner Refinement + Dead-Bundle Cleanup + Innovation Cross-Ref
## Bishop B079 | April 5, 2026 | SP-11 B078 triage follow-up

---

## MISSION

Three linked cleanup tasks exposed by Bishop B079's triage of the SP-11 Gold Panner B078 output:

1. **Patch `sp11_gold_panner.py`** — pull canonicals from MCP/librarian (not hardcoded), widen metaphor-tag taxonomy to ~25, add source-exclusion + source-quality scoring, add first-person voice boost, filter Crown-Letter boilerplate
2. **Audit `Escape Velocity Site/dist-backup-prelaunch/`** — compiled JS shows stale creator-keep values (82%, 83%, 84%) across 21 hits. Confirm directory is dead, then purge or rebuild with canonical 83.3%
3. **Cross-reference Batch-14 sub-claims** against canonical innovation registry — 9 sub-claims may already be folded into parent innovations

---

## CONTEXT

Bishop B079 processed the SP-11 gold outputs and found:
- **0 net-new innovation candidates** (all 77 referenced numbers fall within #1000-#2129 ≤ canonical #2150). Registry coverage is complete.
- **43 contradictions flagged**, but script baselines are stale: it uses `2130` innovations / `16` initiatives / `83.3%` as hardcoded canonicals. Current canonical is **2,150 innovations**. Two actionable drift clusters remain:
  - `Escape Velocity Site/dist-backup-prelaunch/assets/*.js` bundles show 82%/83%/84% instead of 83.3% (21 hits, 6 files)
  - `ARCHIVE2April2026/CONTEXT_MANAGEMENT/*` and `Asteroid-ProofVault/09_CONTEXT_MANAGEMENT/*` snapshot files show old counts (leave as-is, these are frozen snapshots)
- **500 quotables surfaced, ~60% noise**: Bishop handoffs, Knight prompts, AA formals, and 26 interchangeable Crown-Letter "be the Crown of X" boilerplate lines were scored identically to founder-voice Circle letters. Only 13 quotes scored with 2+ metaphor tags because tag taxonomy is only {crown, pudding, railroad}.

Gold outputs: `librarian-mcp/stitchpunks/data/gold/`
Script: `librarian-mcp/stitchpunks/sp11_gold_panner.py`

---

## PART 1 — SP-11 Script Refinement

### 1A. Canonicals from MCP, not hardcoded

Replace hardcoded baselines with a resolver that reads from librarian indexes at run time:

```python
def load_canonicals():
    # Order of preference:
    # 1. librarian-mcp/indexes/canonical.json (if exists)
    # 2. librarian-mcp/indexes/overview.json
    # 3. Fallback to hardcoded defaults with warning
    ...
    return {
        "innovation_count": ...,  # currently 2150
        "initiative_count": ...,  # currently 16
        "crown_jewels": ...,      # currently 184
        "creator_keep_pct": "83.3%",
        "membership_price": "$5/year",
        "cost_plus_floor": "20%",
    }
```

If canonical file missing, log a WARN line and use fallbacks. Never silently use stale numbers.

### 1B. Source exclusion list (scanner input filter)

Skip these paths entirely from both innovation and quotable scans:

```python
EXCLUDED_PATH_PATTERNS = [
    "BISHOP_DROPZONE/PROMPT_KNIGHT_",
    "BISHOP_DROPZONE/PROMPT_PAWN_",
    "BISHOP_DROPZONE/BISHOP_HANDOFF_",
    "BISHOP_DROPZONE/PUDDING_",          # these are already distilled
    "BISHOP_DROPZONE/COMPILED_PUDDING_",
    "BISHOP_DROPZONE/HISTORY_PUDDING_",
    "BISHOP_DROPZONE/CANONICAL_STATS_UPDATE_",
    "AA_FORMAL_",
    "/assets/",                           # compiled JS bundles
    "dist-backup-",
    ".sql", ".tsx", ".ts", ".js", ".html",  # code artifacts only for innovation scan
]
```

Separate `EXCLUDED_FROM_QUOTABLES` (stricter) from `EXCLUDED_FROM_INNOVATIONS` (looser — keep code files to catch hardcoded violations).

### 1C. Source-quality scoring (quotables only)

Boost scores for founder-voice sources:

```python
QUALITY_BOOSTS = {
    "letters/circle-": +0.15,
    "LETTER_MACKENZIE_SCOTT": +0.12,
    "LETTER-MOLLY-WHITE": +0.10,
    "PITCH-INVESTOPEDIA": +0.10,
    "02_WRITTEN/01_Crown_Letters/": +0.08,
    "02_WRITTEN/05_Academic_Papers/": +0.08,
    "Cephas/cephas-hugo/content/": +0.06,
    "journals/": +0.10,
    "Founders_Journal": +0.10,
}
QUALITY_PENALTIES = {
    "PROMPT_KNIGHT_SESSION_": -0.20,
    "PROMPT_PAWN_": -0.20,
    "BISHOP_HANDOFF_": -0.15,
    "COMPILED_PUDDING_": -0.12,
    "HISTORY_PUDDING_": -0.12,
    "PROVISIONAL_": -0.10,
    "AA_FORMAL_": -0.15,
}
```

### 1D. Widen metaphor-tag taxonomy to ~25

Current tags: `crown`, `pudding`, `railroad`. Expand to:

```python
METAPHOR_TAGS = {
    "crown":        ["crown", "medallion", "fleet admiral", "mentor", "chancellor"],
    "pudding":      ["pudding", "proof is in the pudding", "this is not pudding", "start with pudding", "spoonful"],
    "ship":         ["ship", "harbor", "voyage", "captain", "fleet", "anchor", "mast"],
    "lighthouse":   ["lighthouse", "beacon", "ladder", "rung"],
    "waterwheel":   ["waterwheel", "water wheel", "millstone", "millrace"],
    "railroad":     ["railroad", "rail", "track", "locomotive", "caboose"],
    "canister":     ["canister", "injection mold", "hydraulic"],
    "battery":      ["battery dispatch", "burst", "pacing"],
    "kitchen":      ["kitchen", "table", "soup", "bread", "stone soup", "recipe", "pot", "spices", "popcorn", "ingredient"],
    "brick-wall":   ["brick wall", "starscreaming"],
    "harper":       ["harper", "cub harper", "bounty"],
    "steward":      ["steward", "ombudsperson"],
    "joule":        ["joule", "forever stamp", "surplus"],
    "ghost":        ["ghost credits", "ghost browse", "ghost world"],
    "spoonful":     ["spoonful of cephas", "skipping stone"],
    "currency":     ["credits", "marks", "cost+20", "83.3"],
    "family":       ["family table", "family fund", "family tribe"],
    "guild":        ["guild", "tribe", "charter", "stake"],
    "governance":   ["star chamber", "backer election", "areopagus", "five-rook"],
    "manufacturing":["design democracy", "pioneer node", "earn-down"],
    "adapt":        ["adapt score", "dependability", "timeliness"],
    "commerce":     ["storefront", "marketplace", "crew call", "red carpet"],
    "defense":      ["content shield", "dirty dozen", "ip governance"],
    "outreach":     ["cue card", "dispatch", "coalition", "bounty photography"],
    "founder":      ["founder", "general manager", "eight children", "veteran"],
}
```

Each quote is tagged with every family whose keyword list matches. Multi-tag quotes (>=2 families) get a +0.05 richness bonus.

### 1E. First-person voice detection (quotables bonus)

```python
FIRST_PERSON_PATTERNS = [
    r"\bI've built\b", r"\bI'm launching\b", r"\bI asked\b", r"\bwe built\b",
    r"\bI believe\b", r"\bI want you to\b", r"\bI'm writing\b", r"\bI know\b",
    r"\bMy\b", r"\bI decided\b", r"\bI chose\b",
]
```

First-person match = +0.08 score. Distinguishes founder-voice from scraped boilerplate.

### 1F. Crown-Letter boilerplate dedupe

Detect and collapse:
```python
CROWN_LETTER_STEMS = [
    r"I want you to be the \w+",
    r"be the Crown of",
    r"Fleet Admiral / Crown for",
    r"I'm asking you to be",
    r"Apothecary Mentor",
    r"Lender Mentor",
]
```

If a passage matches any stem, keep only the single highest-scoring instance across ALL Crown Letter files. All other matches with the same stem are dropped from the output.

### 1G. Output additions

Add to `quotable_passages_b079.json`:
- `quality_boosted_score` (post-boost)
- `base_score` (pre-boost)
- `source_quality_tier`: "founder_voice" | "high" | "medium" | "low" | "excluded"
- `first_person_detected`: bool

Add to `candidate_innovations_b079.json`:
- `canonical_number_present`: bool (is there a `#NNNN` in the passage?)
- `number_in_registry`: bool (does that number fall in canonical range?)
- `likely_net_new`: bool (no number AND heuristic score >= 0.60)

---

## PART 2 — Escape Velocity Dead-Bundle Audit

### 2A. Determine if `Escape Velocity Site/dist-backup-prelaunch/` is live

Check:
1. Any firebase.json / netlify.toml / deploy script references this path
2. Any symlinks pointing into this directory
3. Git log: last touched date and commit
4. Any README in `Escape Velocity Site/` describing this directory

If NOT referenced anywhere live and last modified > 60 days ago:
- Move directory to `Escape Velocity Site/_graveyard/dist-backup-prelaunch-$(date +%Y%m%d)/`
- Log move to `BISHOP_DROPZONE/LEFTOVER_FILES_B079.txt`

If referenced:
- STOP. Post to Bishop dropzone with dependency list. Do not auto-purge.
- Identify the source files that rebuild these bundles and verify they emit 83.3% correctly
- Rebuild bundles, commit, verify hash mismatch with old bundles

### 2B. Flag stale snapshot files (non-destructive)

For each file Bishop B079 flagged as a frozen snapshot (list in Part 2C), prepend a banner on READ (via a librarian middleware, not file mutation):

```
⚠ FROZEN SNAPSHOT — values in this file were canonical as of {date}.
Current canonical: see librarian-mcp get_canonical_numbers.
```

This belongs in librarian, not in file content. Add a `frozen_snapshots.json` index mapping path → snapshot_date.

### 2C. Files to mark as frozen snapshots

```
ARCHIVE2April2026/CONTEXT_MANAGEMENT/INNOVATION_COUNT_LOCATIONS.md         → frozen 2026-02
ARCHIVE2April2026/CONTEXT_MANAGEMENT/VERIFIED_INNOVATION_REGISTRY_FEB11_2026.md → frozen 2026-02-11
Asteroid-ProofVault/09_CONTEXT_MANAGEMENT/Context/INNOVATION_COUNT_LOCATIONS.md → frozen 2026-02
Asteroid-ProofVault/09_CONTEXT_MANAGEMENT/Context/VERIFIED_INNOVATION_REGISTRY_FEB11_2026.md → frozen 2026-02-11
ARCHIVE2April2026/HARDCODED_HANDOFF_CHECKPOINT.md                          → frozen 2026-01
ARCHIVE2April2026/milestones/MILESTONE_CHECKPOINT_006_DEC_10_2025.md       → frozen 2025-12-10
Asteroid-ProofVault/01_Blueprints/Milestones/MILESTONE_CHECKPOINT_006_DEC_10_2025.md → frozen 2025-12-10
Asteroid-ProofVault/01_Blueprints/01_Bishop_Sessions/BishopClaudeCode001.txt → frozen (session 1 date)
Asteroid-ProofVault/01_Blueprints/01_Bishop_Sessions/BishopClaudeCode002.txt → frozen
Asteroid-ProofVault/01_Blueprints/01_Bishop_Sessions/BishopClaudeCode003.txt → frozen
Asteroid-ProofVault/01_Blueprints/01_Bishop_Sessions/BishopClaudeCode004.txt → frozen
```

Whole directories `ARCHIVE2April2026/` and `_root_archive_b063/` can be blanket-marked frozen at their containing-directory level.

---

## PART 3 — Innovation Cross-Reference (Batch-14 Sub-Claims)

SP-11 surfaced 9 sub-claim rows from `batch-14-ready-to-file`. Cross-reference against canonical registry to determine if they are sub-claims of existing innovations or orphans:

| Sub-claim | Name | Likely parent innovation |
|-----------|------|-------------------------|
| A1 | Multi-Tier Steganographic Access Control System | ? (check #2118, #2120-range) |
| A2 | VIP Preview-to-Conversion Advantage System | ? (Ghost Browse adjacent) |
| A3 | Cross-Realm Treasure Hunt Engagement System | ? (Treasure Map #2144-ish) |
| A7 | Domain-Verified Public Invitation Claim System | ? (Cue Card / Red Carpet) |
| R1 | Adaptive Narrative Content Delivery | ? (Cephas / Beacon Runs) |
| R2 | Fractional IP Licensing / MARKS Tokenization | ? (Currency system) |
| R3 | Milestone-Based Revenue Clearing | ? (Creator economics) |
| R4 | Narrative-Driven HR / Skill Tree Certification | ? (ADAPT / Guild) |
| R5 | Cross-Kingdom Data Mesh | ? (Portal infrastructure) |

For each:
1. Search canonical registry (`librarian-mcp` → innovations index or `B044_INNOVATION_REGISTRY.json`) for matching claim language
2. If match found → log as `sub_claim_of: #NNNN`
3. If no match → flag as `POTENTIAL_NET_NEW` and route back to Bishop for promotion decision

Output: `BISHOP_DROPZONE/99_Misc/BATCH14_SUBCLAIM_CROSSREF_B079.md` — table with each sub-claim, parent candidate, match confidence, recommendation.

---

## DELIVERABLES

- [ ] `librarian-mcp/stitchpunks/sp11_gold_panner.py` — refined with Parts 1A-1G
- [ ] Re-run SP-11 end-to-end with refined heuristics, outputs to `data/gold/` with `_b079.json` suffix (preserve B078 as audit trail)
- [ ] `BISHOP_DROPZONE/99_Misc/GOLD_PANNER_REPORT_B079.md` with delta vs B078
- [ ] `librarian-mcp/indexes/frozen_snapshots.json` — snapshot registry
- [ ] `Escape Velocity Site/dist-backup-prelaunch/` — audited, either moved to `_graveyard/` or rebuilt
- [ ] `BISHOP_DROPZONE/LEFTOVER_FILES_B079.txt` — movement log
- [ ] `BISHOP_DROPZONE/99_Misc/BATCH14_SUBCLAIM_CROSSREF_B079.md` — 9-row decision table

## ACCEPTANCE

- [ ] SP-11 no longer uses hardcoded canonicals; reads from MCP or JSON index
- [ ] B079 quotable output has ≥80 unique, non-boilerplate founder-voice quotes scoring >=0.85 after quality boost
- [ ] B079 quotable output has zero `PROMPT_KNIGHT_`, zero `PROMPT_PAWN_`, zero `AA_FORMAL_`, zero `.js` asset bundle hits
- [ ] Metaphor tag coverage: >=150 unique quotes with 2+ tags (vs 13 in B078)
- [ ] `dist-backup-prelaunch/` resolved (moved OR rebuilt with 83.3%)
- [ ] All 9 batch-14 sub-claims have a cross-ref decision (sub_claim_of or POTENTIAL_NET_NEW)
- [ ] `npm run build` passes if any platform files touched

## DO NOT

- Do not delete `dist-backup-prelaunch/` outright — move to `_graveyard/` so it's recoverable
- Do not mutate frozen snapshot files — banner via librarian read-time only
- Do not promote any batch-14 sub-claim to a new canonical # in this session. Decisions are routed to Bishop, Bishop promotes.
- Do not collapse the B078 output files — keep them as audit trail

---

*Bishop B079 — SP-11 refinement, dead-bundle cleanup, innovation cross-ref*
*Unblocks: future SP-11 runs yield real founder-voice Spoonfuls + true net-new detection*
*FOR THE KEEP!*
