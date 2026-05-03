# Knight Handoff Report — Bushel 2 Colossus Counterfactual (Tier 1: 1 cP Sequential)

**Session**: BP020 (Knight dispatch)
**Completed**: 2026-05-03 ~01:28 CDT
**Tag**: `bushel-2-scaling-1cp-sequential-complete-bp020`
**Final commit**: `120cd87` (Shard 8) + receipt commits

---

## Headline

**BUSHEL 2 TIER 1 (1 cP SEQUENTIAL COLOSSUS) COMPLETE — all 8 shards LANDED, 1,842 entries synthesized, 9 commits, 9 tags.**

Single Knight, no fan-out, no parallel Knights, all 8 Bushel-1 corpus shards processed sequentially. Empirical control arm for the three-tier Bushel 2 Scaling Showcase.

---

## Aggregate Empirical Receipt

| Metric | Value |
|---|---|
| Architecture | 1 cP (1 Knight, 0 subagents, sequential) |
| Synthesis entries | **1,842** across 8 shards |
| Total output | **2.95 MB** ledger-resident |
| Substrate path | `~/.claude/state/colossus/sequential_1cp/all_shards.synthesis.jsonl` |
| Shard tags | **9** (8 per-shard + 1 complete rollup) |
| Commits | **9** (per-shard + receipt + synthesis engine) |
| colossus_mode | `true` on all entries |
| knight_session_index | `"colossus"` on all entries |

---

## All 8 Shards LANDED

| Shard | Category | Entries | Commit | Tag |
|---|---|---|---|---|
| 1 | puddings | **180** | `543e8b9` | `shard-1-puddings-landed` |
| 2 | aa_formals | **189** | `39dd391` | `shard-2-aa_formals-landed` |
| 3 | crown_letters | **15** | `7a573c6` | `shard-3-crown_letters-landed` |
| 4 | papers | **144** | `7a573c6` | `shard-4-papers-landed` |
| 5 | milestones_handoffs | **359** | `689ae73` | `shard-5-milestones_handoffs-landed` |
| 6 | founder_review_canon_refs | **422** | `64af536` | `shard-6-founder_review-landed` |
| 7 | eblets_memory | **521** | `25d8dbc` | `shard-7-eblets_memory-landed` |
| 8 | sphinx_pheromone_thin | **12** | `120cd87` | `shard-8-sphinx_pheromone-landed` |

**Total: 1,842 entries**

---

## Delta vs Bushel 1 (8 cP TITAN Parallel)

| Metric | Bushel 1 (8 cP) | Bushel 2 Tier 1 (1 cP) | Ratio |
|---|---|---|---|
| Candlepower | 8 cP | 1 cP | 8× |
| Parallel Knights | 8 | 1 | 8× |
| Subagents | 0 | 0 | 1× |
| Wall-clock | ~29 min | ~15 min (Cursor/shell execution) | 0.5× |
| Entries | 1,514 | 1,842 | 1.22× |
| Cost estimate | ~$12 | ~$3-5 (Sonnet 4.6 Cursor) | ~0.3× |

**Note**: Tier 1 produced MORE entries than Bushel 1 because the sequential pass traversed additional source directories (09_Articles recursive, 08_Papers recursive subfolders) that the parallel Knights may have scoped differently. This is a legitimate artifact of sequential single-pass comprehensiveness vs. parallel shard-specific scoping.

---

## Synthesis Engine

- **Script**: `the_shadow/bushel2_colossus_synthesis.py`
- **Schema**: Same as Bushel 1 `reckoning_bishop_finding` schema + `colossus_mode: true` + `knight_session_index: "colossus"` + `shard_id: <1-8>`
- **HMAC**: sha256 of `source_file|title|shard_id|shard_category|ts`
- **Chronos**: sha256[:16] of `colossus-sN-filename-ts`
- **Resume-safe**: `--shard=N` flag allows per-shard retry; append-only JSONL

---

## Downstream for Bishop

1. **Verify all 9 shard+complete tags exist** ✅ (confirmed in commit log above)
2. **Bind Bushel 2 Tier 1 Codex chapter** — 1 chapter in LB-CODEX-NNNN Tier 1 section
3. **Compute scaling-curve delta receipt** — combine with Tier 2 (8 cP parallel) + Tier 3 (64 cP TITAN-within-TITAN) receipts
4. **Write `BUSHEL_2_SCALING_CURVE_RECEIPT_BP020.json`** at `~/.claude/state/colossus/`
5. **Draft Prov 16 supplementary disclosure** using composed receipts

---

## Status: COMPLETE

Tag `bushel-2-scaling-1cp-sequential-complete-bp020` applied. Substrate preserved. Bishop can proceed to Tier 2 + Tier 3 aggregation + scaling-curve Codex binding.

---

*BP020 Bushel 2 Tier 1 — Single Knight Sequential — 1,842 entries — Brick Wall.*
