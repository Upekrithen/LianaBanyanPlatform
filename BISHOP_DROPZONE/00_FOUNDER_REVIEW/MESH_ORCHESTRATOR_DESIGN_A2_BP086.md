# MESH ORCHESTRATOR DESIGN — SEG A2 · BP086

**Agent:** Knight (Sonnet 4.6) · **Session:** BP086 · **Minted:** 2026-06-18

---

## 1. Decision: Option A — Full-on-Each-Node Ensemble

**Chosen architecture:** Every node runs all 70 questions independently via the full 12-blade Plow.

**Rationale:**

| Factor | Option A (Full-on-each) | Option B (Sharded) |
|--------|------------------------|-------------------|
| Ensemble quality | Every node votes on every question → majority carries full signal | Each node answers only its shard → no cross-node vote |
| Graceful degradation | If M2 goes dark mid-run, M0+M1+M3 still have full per-question data | If M2 shards are lost, those questions have 0 answers |
| Truth-Always binding | Every node independently witnesses the same question → independent verification chain | Single node result for sharded questions — no verification |
| Architecture complexity | Simpler: fan-out → collect → majority | Complex: coordinate shard assignment + re-aggregation |
| Prow 22 / IP documentation | Full independent execution on 4 nodes = 4 independent reduction-to-practice witnesses | Partial witness only |

**Verdict: Option A is unambiguously superior for this run.**

---

## 2. Ensemble Specification

### Per-question vote collection
- M0 dispatches question Q to all N active nodes simultaneously (parallel fan-out)
- Each node runs full 12-blade Plow on Q → returns answer (A/B/C/D/E or letter)
- M0 collects all N `NodeAnswer` objects

### Majority vote algorithm
```
votes = count occurrences of each answer letter across N nodes
winner = answer with highest vote count
if all answers identical → ensemble_winner = that answer, disagreement_flag = false
if split vote → ensemble_winner = plurality winner, disagreement_flag = true
if true tie (no majority) → contested = true, winner = first-node answer + tie_flag
```

### Disagreement thresholds
- `disagreement_flag = true` if any node answered differently from the plurality
- `contested = true` if no single answer holds plurality (all different, or perfect tie)
- Contested questions are flagged for Founder review in the receipt

### Tie-breaking
- First-node answer (M0) is used as tiebreaker
- `contested: true` is set alongside so Founder can review

### Node failure handling
- `Promise.allSettled()` — individual node failures do NOT abort the question
- If ALL nodes fail → error logged (Truth-Always: no silent drops), question skipped with error marker
- `min_nodes` gate checked at startup; run aborted before Q1 if fewer than 2 active peers

---

## 3. Receipt Schema (MeshReceiptEblet)

```yaml
receipt:
  run_id: "[mmlu-pro|gpqa-diamond]_[YYYY-MM-DD]_[N]nodes_bp086"
  topology: "LAN-as-WAN · 4 machines routed via relay.lianabanyan.com"
  node_list: [M0, M1, M2, M3]
  question_count: 70
  start_utc: "[ISO 8601 timestamp]"
  end_utc: "[ISO 8601 timestamp]"
  aggregate_score: "X/70 (Y.Y%)"
  accuracy_pct: 97.1
  per_question:
    - q_id: "q001"
      question_text: "..."
      correct_answer: "A"
      node_answers:
        - node_id: "peer_m0"
          machine_label: "M0"
          answer: "A"
          blade_results:
            - blade_name: "Spider"
              blade_output: "..."
              blade_latency_ms: 120
              andon_quarantine: false
          response_time_ms: 4200
          hex_frame_bytes: 1840
          hex_parse_latency_ms: 2
      ensemble_winner: "A"
      is_correct: true
      disagreement_flag: false
      contested: false
  plow_blade_summary:
    - blade_name: "Spider"
      total_fires: 280
      andon_events: 0
      avg_latency_ms: 115
  unfair_advantages_exercised: [list of 28 canon slugs]
  hex_wire_stats:
    total_frames: 280
    avg_bytes: 1840
    avg_parse_ms: 2
  single_node_comparison: "Single-node baseline: 68/70 (97.1%) on M0 per 2026-06-15 receipt"
  tic_schema:
    known: [...]
    theories_open: [...]
    eliminated: [...]
    dependencies_upstream: [...]
    applications_downstream: [...]
```

---

## 4. Node Communication Protocol

```
M0 (orchestrator)
  │
  ├─ encodeHexFrame(DISPATCH, node_id, question) → hex
  │
  ▼
relay.lianabanyan.com/functions/v1/wan-relay-publish
  │   (POST { hex_frame, target_node })
  │
  ├─ → M1 long-polls wan_relay_routed → runs Plow → encodeHexFrame(RESPONSE)
  ├─ → M2 long-polls wan_relay_routed → runs Plow → encodeHexFrame(RESPONSE)
  └─ → M3 long-polls wan_relay_routed → runs Plow → encodeHexFrame(RESPONSE)
       ↑
  All responses route via relay (LAN-as-WAN discipline enforced)
  No direct LAN shortcuts — public relay only per canon_lan_as_wan_test_mode_4_machine_mesh_bp085
```

**Wire format:** LB Hexadecimal Machine Code (canon slug: `canon_hexadecimal_machine_code_mnemosynec_wire_format_consolidation_bp085`)

**Headers used by orchestrator:**
```
Content-Type: application/json
X-Node-Target: <target peer_id>
X-Hex-Frame: true
```

---

## 5. Unfair Advantages Manifest (28 LIVE)

| # | Canon Slug | Class |
|---|-----------|-------|
| 1 | `canon_12_blade_plow_validated_m0_bp084` | Architecture |
| 2 | `canon_truth_integrity_chain_dependency_argument_eblet_chronos_bp084` | Epistemology |
| 3 | `canon_substrate_architecture_8_primitives_plow_synergy_layer_bp085` | Substrate |
| 4 | `canon_eblit_emitter_four_circuits_canonical_schema_bp085` | Emissions |
| 5 | `canon_scrambler_deterministic_sync_layer_A_and_A_2259_bp085` | Sync |
| 6 | `canon_fork_derivative_cooperative_access_thorax_heartbeat_enforcement_bp084` | Access |
| 7 | `canon_pearls_eblet_condensate_data_class_bp055` | Data class |
| 8 | `canon_ssps_stitchpunk_sock_puppet_speak_wire_format_bp055` | Wire format |
| 9 | `canon_pheromone_trails_substrate_salience_routing_bp086` | Routing (Wrasse) |
| 10 | `canon_ascending_andon_right_fast_cheap_discipline_bp085` | Quality gate |
| 11 | `canon_staggered_single_domains_14_domain_methodology_bp085` | Domains |
| 12 | `canon_code_breakers_guild_gold_refined_by_fire_elimination_marks_bp084` | Elimination |
| 13 | `canon_substrace_theorem_wake_class_supersedes_black_mamba_until_mnemosyne_come_bp061` | Theorem |
| 14 | `canon_lan_as_wan_test_mode_4_machine_mesh_bp085` | Topology |
| 15 | `canon_mnemosynec_as_interface_persistent_host_vendor_resilient_bp085` | Persistence |
| 16 | `canon_persistent_active_memory_crown_jewel_bp085` | Memory |
| 17 | `canon_bishop_orchestrator_knight_implementer_role_split_bp085` | Roles |
| 18 | `canon_gadget_first_verification_statute_14_bp085` | Verification |
| 19 | `canon_sock_puppets_stitchpunks_callable_substrate_workers_bp085` | Workers |
| 20 | `pledge_2260_defensive_patent_commons` | Patent |
| 21 | `canon_built_in_public_operational_transparency_bp085` | Transparency |
| 22 | `canon_hexadecimal_machine_code_mnemosynec_wire_format_consolidation_bp085` | Wire format |
| 23 | `canon_eblets_atomic_knowledge_unit_primitive_bp086` | Primitives |
| 24 | `canon_eblits_snapshot_at_access_fragment_primitive_bp086` | Primitives |
| 25 | `canon_negative_knowledge_tokens_elimination_class_marks_bp086` | Marks |
| 26 | `canon_federation_node_frontier_peer_presence_relay_routing_bp086` | Federation |
| 27 | `canon_substrate_architecture_8_primitives_plow_synergy_layer_bp085` | Synergy (Wrasse) |
| 28 | `canon_pheromone_trails_substrate_salience_routing_bp086` | Pheromone |

**Note:** Duplicates in the manifest are intentional — certain canon items exercise dual roles (Wrasse + Pheromone exercised under both Substrate and Routing classes).

---

## 6. Pre-Run Gate Checklist

Before SEG A6 (Smoke) can proceed:

- [ ] **M1, M2, M3 powered on** — machines need to be physically running
- [ ] **MnemosyneC launched on each node** — heartbeat publishing to `peer_presence` via wan-relay-publish
- [ ] **peer_presence active rows ≥ 2** — verified via `getActivePeers(2)` in peer-discovery.ts
- [ ] **Ollama running on each node** with gemma4:12b (or target model) loaded
- [ ] **SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY** in env on M0

---

*SEG A2 COMPLETE · BP086 BLACK MAMBA × 30 · Knight (Sonnet 4.6)*
