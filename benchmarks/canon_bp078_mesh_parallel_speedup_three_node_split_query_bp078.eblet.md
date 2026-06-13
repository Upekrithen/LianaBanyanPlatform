# canon_bp078_mesh_parallel_speedup_three_node_split_query_bp078

**Type:** canon
**Minted:** 2026-06-08
**Blueprint:** BP078
**Pearl:** pending-emit

## Canon Statement

When three mesh nodes each plow a distinct subset of MMLU-Pro categories and then cross-query for the full 14-category coverage, the integrated wall-clock collapses by approximately 3x versus a single-node baseline. This is the decentralized aggregated speedup: no single node bears the full mining cost, and each node benefits from the substrate the others have plowed.

Suggested split (adjustable per hardware): M1 plows math + physics + chemistry + health + biology (5 categories); M2 plows psychology + history + law + philosophy + economics (5 categories); M3 plows engineering + business + other + cs (4 categories). Cross-query tests all 14 categories from any node, hitting mesh for out-of-local-substrate topics.

## Empirical Gate

This canon is proven only when the Phase E receipt (BP078_THREE_MACHINE_PARALLEL_PROOF_RECEIPT.eblet.md) documents:
- Per-node plow wall-clock
- Cross-mesh query p50 and p95 per category
- Total integrated test wall-clock vs single-node baseline
- Anti-popularity rejection counts per node
- M3 LAN endpoint confirmed or documented as gap

## LAN Endpoints (BP067 canon)

- M1: 192.168.86.30 (localhost)
- M2: 192.168.86.45
- M3: 192.168.86.64 (Founder confirmed all three ready per BP078 addendum 2026-06-08T21:11:40Z)

## Origin

Founder-direct BP078. Phase E was originally stretch-goal; Founder confirmed all three machines ready at 2026-06-08T21:11:40Z -- Phase E is now a required deliverable.

---
*canon trail. Truth-Always. BP078.*
