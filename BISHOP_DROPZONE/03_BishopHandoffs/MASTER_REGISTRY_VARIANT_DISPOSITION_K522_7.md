# MASTER REGISTRY VARIANT DISPOSITION
## K522.7 Phase E
**Prepared by:** Knight (K522.7/B128, 2026-04-27)
**Files compared:**
- `Asteroid-ProofVault/00_MASTER_REFERENCES/FOUNDER_ANECDOTES_REGISTRY.md` (non-MASTER)
- `Asteroid-ProofVault/00_MASTER_REFERENCES/FOUNDER_ANECDOTES_REGISTRY_MASTER.md` (MASTER)

---

## Side-by-Side Count

| Attribute | REGISTRY.md | REGISTRY_MASTER.md |
|---|---|---|
| Last Updated | December 21, 2025 | February 21, 2026 |
| File size | 768 lines | 994 lines |
| Anecdotes in Quick Reference Table | 28 | 35 |
| Anecdotes with full prose | 26 (missing #24, #27 prose) | 33 (missing #24, #27 prose) |
| Entries NOT in other file | — (subset) | #29–#35 (7 additional entries) |

## Relationship Determination

**Verdict: OLDER VERSION — superseded.**

`FOUNDER_ANECDOTES_REGISTRY.md` is an earlier version of `FOUNDER_ANECDOTES_REGISTRY_MASTER.md`. Evidence:

1. **Date**: Dec 21, 2025 vs Feb 21, 2026 — REGISTRY predates MASTER by 2 months.
2. **Scope**: REGISTRY contains exactly anecdotes #1-#28; MASTER extends to #35 (seven new anecdotes added in the Feb 2026 update: #29 Learning to Swim, #30 Roommate's Suit, #31 Facebook Friend with Cancer, #32 Pet Antibiotics, #33 Grandpa's Bean Soup, #34 Fire Chief Mantra, #35 Starfish Story).
3. **Structure**: Both files share identical formatting — same section headers, same prose for anecdotes #1-#28. MASTER is the addition-only continuation.
4. **Naming**: The non-MASTER variant has no "MASTER" in its filename, consistent with being the pre-MASTER draft.

## Diff — Entries in REGISTRY_MASTER.md but NOT in REGISTRY.md

| # | Title | Added (estimated) |
|---|---|---|
| 29 | Learning to Swim (Captain Kirk) | Feb 21, 2026 |
| 30 | The Roommate's Suit (College) | Feb 21, 2026 |
| 31 | The Facebook Friend with Cancer | Feb 21, 2026 |
| 32 | Pet Antibiotics for My Daughter | Feb 21, 2026 |
| 33 | Grandpa's Bean Soup (The Depression Legacy) | Feb 21, 2026 |
| 34 | The Fire Chief Mantra | Feb 21, 2026 |
| 35 | The Starfish Story (Hemingway Version) | Feb 21, 2026 |

## Diff — Entries in REGISTRY.md but NOT in REGISTRY_MASTER.md

None. REGISTRY.md is a proper subset of REGISTRY_MASTER.md.

## Recommendation

**Archive** `FOUNDER_ANECDOTES_REGISTRY.md` by renaming to `FOUNDER_ANECDOTES_REGISTRY_LEGACY_DEC2025.md`.

Rationale:
- No unique content in the non-MASTER variant — every entry is in MASTER
- Having two files with similar names risks future sync scripts reading the wrong one
- The non-MASTER variant is 2 months stale and will become increasingly stale after K522.7 Founder pass brings MASTER to 41 entries

**Alternative:** Add a deprecation banner to REGISTRY.md (first line):
```
> ⚠️ SUPERSEDED — Use FOUNDER_ANECDOTES_REGISTRY_MASTER.md. This file was last updated 2025-12-21 and is missing anecdotes #29-#35.
```

**Knight does NOT rename or modify either file** — this recommendation is for Founder ratification.

## Ratification Needed

- [ ] Founder approves renaming `FOUNDER_ANECDOTES_REGISTRY.md` → `FOUNDER_ANECDOTES_REGISTRY_LEGACY_DEC2025.md`
- [ ] OR Founder approves adding deprecation banner to `FOUNDER_ANECDOTES_REGISTRY.md`
- [ ] OR Founder keeps both as-is (no action)

---

*Prepared K522.7/B128 — Knight reads and recommends; Founder ratifies. No files modified.*
