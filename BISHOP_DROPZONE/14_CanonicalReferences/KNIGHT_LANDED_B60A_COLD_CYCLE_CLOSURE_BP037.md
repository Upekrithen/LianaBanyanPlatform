# KNIGHT LANDED — B60-A Cold-Cycle Closure (Shadow E-Sprite / E-Spider)

**Landed:** BP037 (2026-05-11) Knight Sonnet 4.6
**Commit SHA:** `96c04dfddf7e3d31eeadf3c9559449c71ac2efb5`
**Canon anchor:** LB-STACK-0160 (Shadow E-Sprites + E-Spiders) + Slipstream L4 (LB-STACK-0163)
**Prompt source:** `BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_B60_A_COLD_CYCLE_CLOSURE_SHADOW_SPRITE_SPIDER_LAUNCH_BLOCKER_BP037.md`

---

## Done Definition Check

| Condition | Status |
|---|---|
| Cold-start path closed (G-COLD-START PASS) | ✓ PASS |
| Update path closed (G-UPDATE PASS) | ✓ PASS |
| Borrow path closed (G-BORROW PASS) | ✓ PASS |
| Warm-path 203x regression still passes (G-WARM-REGRESSION PASS) | ✓ PASS |
| Integration test PASS (G-INTEGRATION) | ✓ PASS |
| SR-020 KNIGHT_LANDED Eblet authored | ✓ this file |
| Yoke LANDED receipt sent to Bishop | ✓ (see KNIGHT_BISHOP_MESSAGES.md) |

**Result: B60-A COMPLETE. v1.0 substrate-side launch blocker REMOVED.**

---

## G-Gate Evidence

### G-COLD-START ✓ PASS
**Gate:** clean cluster boot → Sprite negotiates first-success delivery → state-coherence assertion holds (no race on dual-deliver)

**Implementation:** `sprite_registry.ts` — `coldStartHandshake()` method added to `SpriteRegistry` class.
- Purges stale residual substrate state (old `.recall`, `.delivered.json`, `.recalled.json` files from prior crashed runs)
- Ensures destination dropzone exists
- Runs a single-Sprite canary dispatch from cold
- State-coherence assertion: with `redundancy_count=1`, verifies **zero** `.recalled.json` zombie-sibling files exist (the `.recall` broadcast file IS expected as the delivery signal; only sibling recalls indicate a race condition)

**Test output:**
```
[PASS] G-COLD-START: Cold-start: Sprite spin-up from clean cluster → first-success delivery
       {"canary_delivered":true,"state_coherence_ok":true,"canary_latency_ms":2,"stale_files_cleared":0}
```

---

### G-UPDATE ✓ PASS
**Gate:** in-flight Sprite gets upstream-update notification → resigned + Sprite-B re-fires from updated state; no zombie deliveries.

**Implementation:** `sprite_registry.ts` — `updateDispatch()` method added to `SpriteRegistry` class.
- Checks `this.active.has(dispatch_id)` for in-flight state
- Checks receipt dir for already-settled dispatches (idempotent path)
- If in-flight: calls `this.recall(originalId, 'update_resign')` → cancels original Sprites → spawns fresh dispatch with updated package path
- Resolution codes: `'resigned_and_refired'` | `'already_settled'` | `'not_found'`
- Writes `UpdateReceipt` to substrate receipt dir for audit

**Test output:**
```
[PASS] G-UPDATE: Update path: in-flight Sprite resigned + re-fired, no zombie
       {"resolution":"resigned_and_refired","new_dispatch_id":"upd-upd-test-mp1ok0k4",
        "v1_on_disk":false,"v2_on_disk":true,"errors_in_receipt":[]}
```

v1 (original) was recalled before delivery; v2 (updated) landed cleanly. No zombie copies.

---

### G-BORROW ✓ PASS
**Gate:** cross-cluster Sprite borrows pane → blink-phase completes → lease auto-releases → pane re-available within ≤1 blink interval

**Implementation:** new file `src/main/celpane_lease.ts`
- `acquirePaneLease(opts)` — writes `<lease_id>.lease.json` to `~/.lb_substrate/pane_leases/`, schedules `setTimeout` auto-release at `blink_duration_ms`
- `waitForRelease(leaseId)` — polls substrate (5 ms tick) until `.released.json` appears; fallback force-release at 2× blink window
- `releasePaneLease(leaseId)` — manual early release; cancels timer
- `purgeStalePaneLeases()` — crash-recovery: scans for expired non-released leases, force-releases all
- `listActivePaneLeases()` — returns non-released leases for status inspection
- Substrate layout: `~/.lb_substrate/pane_leases/<lease_id>.lease.json` + `<lease_id>.released.json`

**Test output (blink = 80 ms):**
```
[PASS] G-BORROW: Borrow path: cross-cluster pane lease auto-releases within ≤1 blink
       {"lease_id":"505070da-5974-41f9-8bd0-0c26b2e5da34","blink_duration_ms":80,
        "wait_ms":99,"auto_released":true,"release_latency_ms":8,
        "pane_still_leased_post_release":false}
```

Release latency 8 ms (≤ 1 blink interval). Pane available immediately after.

---

### G-WARM-REGRESSION ✓ PASS
**Gate:** the 203x warm-path tests still pass post-cold-cycle changes (no regression)

Re-ran T1–T4 from `tests/sprite-scripted-v1/test_sprite_scripted_v1.ts`:
```
[PASS] T1: Single-Sprite cross-cluster delivery (Bishop -> Knight)
[PASS] T2: 3-Sprite redundancy race — first wins, 2 recalled
[PASS] T3: Throughput — 20 sequential dispatches  (30,769 pkg/min)
[PASS] T4: Intra-cluster delivery rejected (Sprite scope rule)
4/4 passed
```

Cold-cycle additions are purely additive (new methods, new file); existing `dispatchSprites` / `recall` / `enqueue` paths untouched.

---

### G-INTEGRATION ✓ PASS
**Gate:** end-to-end cold→warm→update→borrow flow across a single Sprite/Spider lifecycle

```
[PASS] G-INTEGRATION: Integration: cold→warm→update→borrow full lifecycle
       {"cold_delivered":true,"warm_dispatches":5,"update_resolution":"resigned_and_refired",
        "borrow_auto_released":true}
```

Full lifecycle verified in a single test registry instance:
1. `coldStartHandshake()` → canary delivers, coherence OK
2. 5 warm dispatches → all succeed
3. `updateDispatch()` on in-flight → `resigned_and_refired`, v2 lands, no zombie
4. `acquirePaneLease()` / `waitForRelease()` → auto-released within 2× blink

---

## Files Touched

| File | Change |
|---|---|
| `amplify-computer/src/main/sprite_registry.ts` | Added: `ColdStartReceipt`, `UpdateReceipt`, `UpdateResolution` types; `coldStartHandshake()` and `updateDispatch()` methods in `SpriteRegistry` class |
| `amplify-computer/src/main/celpane_lease.ts` | NEW: Borrow path — `PaneLease`, `PaneLeaseReceipt` types; `acquirePaneLease`, `releasePaneLease`, `waitForRelease`, `purgeStalePaneLeases`, `listActivePaneLeases` |
| `amplify-computer/tests/test_cold_cycle_b60a.ts` | NEW: 5-gate test harness (G-COLD-START, G-UPDATE, G-BORROW, G-WARM-REGRESSION, G-INTEGRATION) |
| `amplify-computer/dist/main/sprite_registry.js` | Compiled output (updated) |
| `amplify-computer/dist/main/celpane_lease.js` | Compiled output (new) |

---

## Test Run Statistics

```
Suite: cold-cycle-b60a
Session: BP037
Bushel: 60-A
Pass count: 5/5
All pass: true
Wall time: ~3.1 s
Substrate root: isolated tmpdir (cleaned per run)
```

---

## Canon Impact

- **LB-STACK-0160** (Shadow E-Sprites + E-Spiders): cold-cycle paths now closed. B60 fully LANDED.
- **Slipstream L4 (LB-STACK-0163)**: CelPane borrow-path lease mechanics implemented; substrate IS the bus for pane lease arbitration (no SSE, no broker — only files under `pane_leases/`).
- **B61 Wave Generator**: unblocked. Founder may authorize start after session boundary.

---

## Yoke Receipt Reference

Written to `KNIGHT_BISHOP_MESSAGES.md` — B60-A LANDED entry with commit SHA and G-gate evidence.

---

*Knight Sonnet 4.6, BP037, 2026-05-11. WE Grind Salt.*
