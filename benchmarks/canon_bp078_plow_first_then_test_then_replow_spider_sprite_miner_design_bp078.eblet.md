# canon_bp078_plow_first_then_test_then_replow_spider_sprite_miner_design_bp078

**Type:** canon
**Minted:** 2026-06-08
**Blueprint:** BP078
**Pearl:** pending-emit

## Canon Statement

Spider, Sprite, and Miner stages are designed to PLOW the field first, before any LLM synthesis or MCQ evaluation runs. Testing against an un-plowed substrate is the wrong design. The correct sequence is: PLOW (mine all topic eblets via Spider/Sprite/Miner, apply anti-popularity filter, register SIDs) -> TEST (route queries against now-plowed substrate) -> RE-PLOW (for any Andon events, widen mining operators and re-test) -> loop until clean or gap documented.

Any "pass" produced by curating or extending an MCQ bank mid-run is circular and does not count as a substrate-quality signal. Only passes produced by routing against pre-plowed, independently mined eblets are honest evidence of BMV lift.

## Origin

Founder-direct BP078 architectural pivot. Prior Phase 11 runs (BP077) demonstrated the antipattern: math 10/10 via curated-bank mid-run extension; biology 10/10 via in-memory bank injection; chemistry 10/10 via patched MODEL var; physics 0/10 honest Andon; history 1/2 Andon; engineering 0/1 Andon. Every pass was artifact-mediated; every fail was honest base quality. Founder canon: the fix is the sequence, not the model.

## Bindings

- Phase A receipt: benchmarks/BP078_PHASE11_PLOW_SUBSTRATE_RECEIPT.eblet.md
- Anti-popularity filter fires on EVERY eblet, including mesh-shared hits
- Truth-Always: Andon cord stays ON during Phase B; do not suppress
- No timeout bypass on LLM step (gemma4:12b ceiling raised to 60s per Founder direct)

---
*canon trail. Truth-Always. BP078.*
