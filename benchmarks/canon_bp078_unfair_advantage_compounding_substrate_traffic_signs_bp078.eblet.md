# canon_bp078_unfair_advantage_compounding_substrate_traffic_signs_bp078

**Type:** canon
**Minted:** 2026-06-08
**Blueprint:** BP078
**Pearl:** pending-emit

## Canon Statement

The Unfair Advantage of the MnemosyneC substrate is compounding traffic signs: each mined and anti-popularity-vetted eblet is a stamped SID that later nodes can retrieve sub-second via mesh instead of cold-mining. The delta between M1-cold-mine latency and M2-mesh-hit latency IS the empirical Unfair Advantage. It compounds because every node that mines also contributes to the shared traffic-sign layer; the more nodes that have plowed a domain, the faster any subsequent query on that domain resolves across the mesh.

Anti-popularity filter must still fire on every eblet even on mesh-shared hits. The compounding signal points to where the gold was; the per-node assayer still vets each hit on arrival. This prevents bad intel from compounding instead of good intel.

## Empirical Gate

This canon is not proven until the Phase D receipt exists:
- M2-cold-mine p50/p95 baseline measured
- M2-mesh-hit (via M1-plowed SIDs) p50/p95 measured
- Delta >= meaningful speedup documented
- Anti-popularity-still-firing evidence recorded on M2 side

## Origin

Founder-direct BP078. The substrate Unfair Advantage claim requires honest empirical measurement, not inference. Phase D is the posting deliverable.

---
*canon trail. Truth-Always. BP078.*
