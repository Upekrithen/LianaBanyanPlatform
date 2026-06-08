# Operator Rosters -- Note

**Truth-Always:** There are no separate operator roster files in this replication kit.

The per-domain Operator rosters are defined **inline** in `truth_single_giants_bp077.py` (the Staggered Swarm harness). They are not extracted as separate files because they are tightly coupled to the pipeline logic (hardness scoring, Tier thresholds, concurrent dispatch, FireGuard cadence).

## Covered domains (10)

| Domain | Roster location |
|---|---|
| `literary` | `truth_single_giants_bp077.py` (StaggeredSwarmScheduler) |
| `historical` | `truth_single_giants_bp077.py` |
| `mathematical` | `truth_single_giants_bp077.py` |
| `geodata` | `truth_single_giants_bp077.py` |
| `art` | `truth_single_giants_bp077.py` |
| `chemistry` | `truth_single_giants_bp077.py` |
| `music` | `truth_single_giants_bp077.py` |
| `physics_constant` | `truth_single_giants_bp077.py` |
| `bio_historical` | `truth_single_giants_bp077.py` |
| `linguistic_geo` | `truth_single_giants_bp077.py` |

## Tier structure

- **Tier 1:** 3 Operators per domain (baseline)
- **Tier 2:** 5 Operators per domain (standard swarm -- used by `--batch-mode`)
- **Tier 3:** 8 Operators per domain (full Shadow E-Giants mode)

`--batch-mode` forces `MIN_TIER=2` for all questions, ensuring at least 5 Operators
per domain regardless of the hardness qualifier's Tier assignment.

## Repository classes targeted by Operators

Each Operator targets a specific repository class with an associated reputation weight:
- Wikipedia (weight: 0.85)
- Wikidata structured queries (weight: 0.90)
- Primary texts (weight: 0.95+)
- Academic / structured knowledge bases (weight: 0.80-0.95)
- Secondary reference sources (weight: 0.70-0.80)

Source-class weights are static in this release (v1). Future versions may update
weights dynamically when sources are confirmed correct or contradicted.
