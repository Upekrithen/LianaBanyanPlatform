# REPORT: Knight K483 — Sculptor Prototype: First Empirical Reduction-to-Practice of #2297

**Session:** K483 · Bishop B123  
**Date:** 2026-04-24  
**Status:** CLEAN LANDING — 6/6 verification checks passed  
**Predecessor:** K482 (Root Miner Prototype — #2296 first reduction to practice)  
**Architecture reference:** INNOVATION_THRESH_2297_B123_SCULPTORS_IP_AS_FILTER.md  
**Keystone #28:** *"They do what IP does — pass it on, as a filter."*

---

## Executive Summary

K483 reduced Crown Jewel #2297 (Sculptors: IP-as-Filter) to empirical first practice. A three-mode Sculptor class was built in `librarian-mcp/sculptors/`, instantiated as three distinct cathedral-profile Sculptors (public-wide / technical-deep / private-founder), and run against the full K482 bedrock output (2,275 tablets across 12 Miner bedrock files). All six verification criteria passed. Keystone #28 was empirically instantiated: tablet `LB-CAT.M-0001.b.c-T0073` is property of private-founder's cathedral but not of public-wide's — same bedrock, different property-status per audience.

---

## Phase A — Sculptor Class Scaffolding

### Files created

| File | Purpose |
|------|---------|
| `librarian-mcp/sculptors/sculptor.py` | Core Sculptor class (three-mode) |
| `librarian-mcp/sculptors/run_sculptor.py` | Phase B runner + Phase C inline verification |
| `librarian-mcp/sculptors/cathedral_profiles.json` | Per-cathedral profile configs (3 cathedrals) |
| `librarian-mcp/sculptors/cathedral_demand_profile.json` | Mock demand profiles (Fates-via-Hounds interface spec) |
| `librarian-mcp/sculptors/__init__.py` | Package init |

### Three-mode structure (per Founder B123 clarification)

**Anticipate mode (always-on, mocked):**
- Consumes per-cathedral `DemandProfile` (mock JSON; interface spec documented for K486+ live replacement)
- Builds corpus-level keyword pool from all bedrock tablets
- Pre-ranks every tablet by composite anticipation score: `0.5*demand_match + 0.3*distinctiveness + 0.2*depth_fit`
- Populates `_anticipation_ranks[tablet_id]` dict used by Lachesis

**Curate mode (Three-Fates-mirror):**
- **Clotho** (`_clotho_extract`): extracts `{primary_theme, secondary_themes, scope_class, distinctiveness, keyword_count}` per tablet
- **Lachesis** (`_lachesis_score`): scores via `0.4*demand + 0.3*anticipation + 0.2*distinctiveness + 0.1*depth_bonus`, with hard scope gate (score=0.0 if scope_class not in allowed set)
- **Atropos** (`_atropos_dispatch`): dispatches (include) if `score >= cathedral.min_score`, cuts otherwise

**Sculpt mode (active craft):**
- `summary`: 200-char brief per tablet, sorted by Lachesis score (public-wide)
- `full_tablet`: complete tablet content, sorted by score (technical-deep)
- `per_topic_rollup`: tablets grouped by primary_theme, per-topic avg_score + top_keywords + rollup_text (private-founder)

### Required mechanisms — all implemented

| Mechanism | Implementation |
|-----------|---------------|
| Scope-filter (3 classes) | `public` / `guild` / `private` — inferred via keyword-overlap heuristic; hard gate in Lachesis |
| Provenance-chain append | Curate appends `sculptor_id`; sculpt appends `sculpt:{sculptor_id}` — two distinct events |
| Cathedral-profile config | `CathedralProfile` dataclass from `cathedral_profiles.json` |
| Filter-decision log | Append-only JSONL at `librarian-mcp/sculptors/filter_decision_log.jsonl` |

---

## Phase B — First Sculpt on K482 Bedrock

### Input

- **Bedrock files:** 12 Miner JSONL files (Root + 4 daughters + 7 second-generation daughters)
- **Total tablets:** 2,275 across all files

### Sculptor instances

| Sculptor | Cathedral | Scope allowed | Min score | Sculpt form |
|----------|-----------|---------------|-----------|-------------|
| SC-001 | public-wide | `[public]` | 0.08 | summary |
| SC-002 | technical-deep | `[public, guild]` | 0.12 | full_tablet |
| SC-003 | private-founder | `[public, guild, private]` | 0.10 | per_topic_rollup |

### Results

| Sculptor | Cathedral | Included | Excluded | Inclusion rate |
|----------|-----------|----------|----------|---------------|
| SC-001 | public-wide | 1,768 | 507 | 77.7% |
| SC-002 | technical-deep | 1,259 | 1,016 | 55.3% |
| SC-003 | private-founder | 2,032 | 243 | 89.3% |

**Ordering by scope permissiveness:** `public-wide (77.7%) < technical-deep (55.3%) — EXCEPTION; private-founder (89.3%)` ← Note below.

> **Observation:** SC-002 (technical-deep) is the most selective Sculptor despite having 2 of 3 scope classes allowed. Root cause: its demand profile heavily weights technical/architectural topics, and many tablets in the Bishop-memory corpus are not technical-architectural in nature (they are project notes, feedback entries, biographical content). Scope permissiveness and demand-match are independent dimensions — technical-deep is domain-selective, not just scope-selective. This is architecturally interesting: the filter IS the intellectual property mechanism, not just an access control list.

**Filter-decision log:** 6,825 entries (3 Sculptors × 2,275 tablets), each recording `{sculptor_id, tablet_id, decision, scope_class, lachesis_score, reason, depth_level, anticipation_rank, timestamp}`.

**Output artifacts:**
- `librarian-mcp/sculptors/outputs/SC-001_public-wide.json`
- `librarian-mcp/sculptors/outputs/SC-002_technical-deep.json`
- `librarian-mcp/sculptors/outputs/SC-003_private-founder.json`

---

## Phase C — Verification

All six checks passed (6/6 — Clean Landing).

| # | Check | Result |
|---|-------|--------|
| 1 | Sculptor class instantiates with per-cathedral profile | PASS |
| 2 | Curate + sculpt modes produce audience-differentiated output | PASS |
| 3 | Scope-filter enforcement empirically demonstrated | PASS (77.7% < 89.3%) |
| 4 | Filter-decision log is audit-complete | PASS (6,825 entries) |
| 5 | Provenance chain Root → Miner → Sculptor → output | PASS |
| 6 | IP-as-filter keystone #28 instantiation | PASS |

**Provenance chain sample:**  
Tablet `LB-CAT.M-0001-T0042` output in public-wide artifact:  
`["LB-CAT.M-0001", "SC-001", "sculpt:SC-001"]`

**IP-as-filter keystone example:**  
Tablet `LB-CAT.M-0001.b.c-T0073` —  
- Included by `private-founder` (SC-003)  
- Excluded by `public-wide` (SC-001)  
Same bedrock, different property-status. Keystone #28 instantiated.

---

## Phase D — Open Questions Surfaced

### 1. Scope metadata should be on Miner tablets (not inferred by Sculptor)

K482 bedrock tablets lack a `scope_class` field. K483 infers scope at Sculptor-ingest using keyword heuristics. For production, the Miner should tag scope at tablet-write time (it has better context: source file path, directory classification, content type). **Flag for Founder:** update #2296 Miner spec to include `scope_class` in the bedrock tablet schema.

### 2. Demand profile granularity

Current: one demand profile per cathedral (topic weights). Alternative: per-session demand profile (what is Cathedral A asking about this week vs last week?). K483 mock treats demand as static. Production with live Fates-via-Hounds telemetry would provide session-level demand signals — Sculptor could adapt within a session.

### 3. Per-topic rollup at scale

private-founder per_topic_rollup produced 182 distinct topics from 2,032 tablets — near-unique topics per tablet in many cases. Production rollup at 65GB corpus scale would need: (a) minimum-count threshold per topic, (b) topic-clustering to merge near-synonyms, (c) canonical topic taxonomy. The #2258 Catacombs/Alexandrian Library generalization is the right architecture for this.

### 4. min_score calibration

public-wide at min_score=0.08 included 77.7% of all tablets — too permissive for a "public-facing" cathedral. Recommended: raise to 0.15 for production to make public delivery meaningfully selective. Operator guide: lower min_score = more permissive; raise for narrower cathedral audiences.

### 5. Anticipate mode mock-to-live replacement path

Mock interface: `cathedral_demand_profile.json` → `DemandProfile.from_dict()`.  
Live replacement (K486+): Hounds deliver telemetry → `DemandProfile.from_live_telemetry(hounds_payload)`.  
The `DemandProfile.demand_score()` method is stable at the interface boundary; only the constructor changes. No Sculptor class modification required.

---

## Success Criteria Status

1. Sculptor class instantiates with cathedral-profile. ✅
2. Curate + sculpt modes produce audience-differentiated output from same bedrock. ✅
3. Scope-filter enforcement empirically demonstrated (inclusion per public, exclusion per private). ✅
4. Provenance chain continuity Root → Miner → Sculptor → output. ✅
5. Filter-decision log audit-complete and queryable. ✅
6. IP-as-filter keystone instantiation demonstrated by a same-bedrock-different-property-status example. ✅

**6/6 — Clean Landing.**

---

## Architecture proof-chain status

| Session | Innovation | Status |
|---------|-----------|--------|
| K482 | #2296 Miners — Living Pyramid of Roots | Reduced to practice |
| K483 | #2297 Sculptors — IP-as-Filter | Reduced to practice |
| K484+ | Helm PWA shell | Pending |
| K485+ | Tower-of-Peace integration | Pending |
| K486+ | Three Fates / Hounds live wiring | Pending |

---

*K483 complete. The filter becomes property. Pass it on.*  
— Knight K483 · Bishop B123
