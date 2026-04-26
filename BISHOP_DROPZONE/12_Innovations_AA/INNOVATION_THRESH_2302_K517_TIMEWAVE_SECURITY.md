# THRESH — A&A #2302 — TimeWave Security

**Status:** SHIPPED (K517 reduction-to-practice, 2026-04-26)
**Class:** Crown Jewel candidate
**Filed:** B126 / K517
**A&A Domain:** Bishop Wing / Discipline Plane / Security

---

## What it is

**TimeWave Security** is an append-only security event log that captures every rejected tool-call action from the Bishop Wing Consensus Layer. It computes a stable pattern fingerprint for each rejected action (grouping actions by class — vendor-secret-rotation, force-push, schema-destruction, etc. — and file type), detects when a pattern class exceeds a rejection threshold (N=3 rejections), and injects a synthetic **TimeWave Security Augur** into the Consensus evaluation to escalate the next matching action to a block decision.

---

## Core mechanism

1. **Pattern hash computation** (`_compute_pattern_hash`): SHA256 of `category|file_extension` where category is the first TRIGGER_CATEGORY match. Groups "same class of action on same file type" independent of exact content — a deliberate attempt to rotate a different API key still hits the `vendor_secret_rotation` category.

2. **Append-only event log** (`security_events.jsonl`): every Wing-block and Dragonrider-reject is recorded. Only `"a"` (append) file mode is used; no API call ever overwrites existing entries.

3. **Pattern match + Synthetic Augur injection** (`match_security_pattern` → `AugurResult`): called BEFORE Consensus arbitration. If `prior_rejection_count >= PATTERN_MATCH_THRESHOLD` for this action class, a synthetic `AugurResult(augur_class="critical", signal="block")` is injected into the Augur results. Consensus sees it as a regular critical Augur — critical-override fires immediately.

4. **Per-Wing opt-in** (`timewave_security_enabled`, default `True`): Wings can disable the pattern signal if needed, but default-on provides defense-in-depth.

---

## K517 Reduction-to-Practice

**Implementation:** `discipline_wing/timewave_security.py`
**Verification:** `discipline_wing/tests_k517.py` — C.1 through C.10 (37/37 sub-checks PASSED)
**Performance:** p95 = 22.6ms on 10,000-event log (budget: 500ms — 22× faster)
**MCP Tool:** `timewave_security_events` (query with filter: source, pattern_hash, since_ts)

### Key verified behaviors
- C.1: Rejected action writes security event with correct source, pattern_hash, augur_ids
- C.2: N+ (≥3) rejections with same hash → pattern_detected=True, weight_bump > 0
- C.3: Single rejection → pattern_detected=False (no false positive)
- C.9: Log is append-only — query_events() never adds/removes lines; all original entries preserved
- C.10: 22.6ms p95 on 10k-entry log (500ms budget)

---

## Claim space

- Method for security-event logging wherein every Wing-rejected action is recorded with a pattern fingerprint, and when the fingerprint's rejection count reaches a threshold, a synthetic Augur signal escalates subsequent matching actions to block — without requiring any Augur rule author to write this pattern-matching logic
- Append-only audit guarantee: no event record is ever mutated or deleted via the provided API
- Threshold-based graduated escalation: below threshold = advisory (no injection); at/above threshold = critical block injection
- Per-Wing opt-in preserves architectural voluntarism

---

*Filed K517 / B126, 2026-04-26*
