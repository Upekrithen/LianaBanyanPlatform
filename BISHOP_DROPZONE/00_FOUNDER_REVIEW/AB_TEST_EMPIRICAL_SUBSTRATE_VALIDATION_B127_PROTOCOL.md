# A/B Empirical Substrate-Savings Validation — Protocol

**Filed**: B127, 2026-04-26
**Status**: SCAFFOLD pending Founder ratification of task-selection + execution timing.
**Founder ratification (verbatim B127)**: "What we need is a task that I can run in Knight TWICE, one WITH and one WITHOUT Librarian running and Take the Temperature screenshot to show empirically that it is a WIN - and how much. Gotta do it before the Librarian Rule 001 takes effect though."

---

## Why now (urgency)

K520.5 First-Consult Edict landed B127. Librarian Rule 001 is now structurally enforced — every Knight tool call requires recent substrate consult. The "without Librarian" empirical baseline is therefore structurally blocked from this point forward UNLESS a controlled bypass mechanism exists.

This protocol designs the empirical-baseline measurement that defends the V2 tagline ("99 percent too much / 1 percent of the tokens cost") via DIRECT MEASUREMENT rather than extrapolation. Without this, Penny Saved paper Section 5 relies on theoretical compounding-multiplier math; with it, Section 5 has empirical headline numbers from a controlled experiment.

## The controlled-bypass requirement (K520.7 prereq)

K520.5 hook gates Bash + MCP-tool + Write + Edit on substrate-cache freshness. To run the WITHOUT condition, Knight needs the gate temporarily disabled. Two implementation paths:

### Path A — Env-var disable in the gate
Add to `bishop_librarian_gate.py`:
```python
if os.environ.get("LB_SUBSTRATE_GATE_TEST_MODE") == "1":
    if os.environ.get("LB_SUBSTRATE_GATE_TEST_AUTHORITY") == "<founder-signed-token>":
        # Log the skip-event to audit trail
        # Allow the tool call without substrate check
        pass
    else:
        # Reject — test mode requires authority signing
        ...
```
Hook bypass is SIGNED + AUDITED + TIME-LIMITED (auto-expires after 1 hour).

### Path B — Manual hook swap
Knight runs the WITHOUT condition with the hook script replaced by a no-op stub for the duration. Founder authorizes the swap; Knight restores after the test.

**Bishop pick: Path A** — sanctioned, auditable, structurally honest. Founder ratification gates the bypass; the audit trail makes it impossible to silently weaken Rule 001. Implementation: small Knight task (K520.7, ~30 min) extending K520.5 hook with the test-mode env-var check.

## Task selection criteria

The A/B task must:
1. **Moderate complexity** — representative of real Knight work, not toy
2. **Substrate-leveraged in WITH** — the WITH condition gains real value from canonical reference
3. **Doable WITHOUT** — Knight can attempt the WITHOUT condition (won't fail completely; just slower OR less accurate)
4. **Measurable correctness** — clear pass/fail criteria; not subjective
5. **Bounded scope** — completes in single Cursor session both conditions; does not exhaust context budget

## Three candidate tasks (Founder picks)

### Task A — Cathedral Effect Documentation (substrate-density showcase)
*Knight produces a 1-page summary of the Cathedral Effect empirical findings (R10 / R13 / K511) with cited evidence and key claim numbers.*
- WITH substrate: consult Eyewitness Scribe + canonical_values.yaml + B112/B125/B126 closeouts
- WITHOUT substrate: Knight has only the prompt; must reconstruct from web search OR fail honestly
- Correctness: must cite +86.1pp / +86.2pp / +80.0pp / 19x cost-delta accurately
- Estimated WITH: ~10 min, ~15K tokens. WITHOUT: ~30 min, ~45K tokens (or unable to complete accurately)

### Task B — New Canonical Field Addition (substrate-density + canonical-codegen showcase)
*Knight adds a new field to canonical_values.yaml and propagates through the codegen-canonical-hook + verify-canonical chain.*
- WITH substrate: instantly knows codegen pattern, verify-canonical rules, useCanonicalStats hook structure
- WITHOUT substrate: must read each file from scratch, infer pattern, attempt change, debug
- Correctness: rebuild succeeds; all surfaces agree; tests pass
- Estimated WITH: ~15 min, ~20K tokens. WITHOUT: ~50 min, ~80K tokens

### Task C — A&A Innovation Threshing (substrate-coverage + Founder-voice showcase)
*Knight drafts a short A&A scaffold for a hypothetical innovation — must use Founder voice register, cite anchor canonical refs, follow A&A formal structure.*
- WITH substrate: pulls FounderVoice Scribe + existing A&A patterns + canonical_values.yaml claim numbers
- WITHOUT substrate: generic patent-application prose with no LB-specific register
- Correctness: matches A&A formal structure (claims/lineage/source-utterance sections); uses Founder voice phrasing; cites accurate sister claims
- Estimated WITH: ~20 min, ~25K tokens. WITHOUT: ~45 min, ~60K tokens (output likely off-canon)

**Bishop recommendation: Task B (New Canonical Field Addition).** Most measurable correctness criterion (codegen succeeds OR fails); most representative of routine Knight work; clearest token-cost asymmetry between conditions. Tasks A and C have softer correctness criteria.

## Measurement protocol

For each condition (WITH and WITHOUT):

| Capture | Where |
|---|---|
| Cursor context-utilization screenshot at task-COMPLETE | Cursor bottom-right indicator |
| Cursor context-utilization screenshot at SESSION-END | Cursor bottom-right after Knight closes |
| Total input tokens spent | `mcp__librarian__substrate_savings_summary` post-session-end |
| Total output tokens spent | Same |
| Wall-clock duration | Knight session start → commit timestamp |
| Correctness verdict | Founder grades pass/fail against task criteria |
| Tool-call count | From Cursor agent transcript |
| Toolsmith-friction-rediscovery count (WITHOUT condition only) | Knight logs each "first time encountering" comment |

## Headline metrics

| Metric | Calculation |
|---|---|
| **Token compression ratio** | tokens_WITHOUT / tokens_WITH |
| **Wall-clock compression ratio** | duration_WITHOUT / duration_WITH |
| **Net USD savings** | (tokens_WITHOUT - tokens_WITH) × $/token (Sonnet rate) |
| **Correctness delta** | WITH-correctness vs WITHOUT-correctness (binary or ordinal) |
| **Friction-rediscovery count** | absolute count in WITHOUT (zero in WITH) |

If the empirical Token compression ratio comes back ≥ 5x with WITH-correctness ≥ WITHOUT-correctness, the V2 tagline ("1% of the tokens cost") is empirically supported within an order of magnitude. If ≥ 10x, fully supported.

## Execution sequence

1. **K520.7 LANDED** ✓ — controlled-bypass env-var operational (see K520.7 below)
2. Founder picks Task A / B / C from candidate list above
3. Bishop drafts the K-prompt for the task (one prompt; instructs Knight to run twice with env-var differing)
4. Knight Cursor session 1: WITH substrate (env-vars NOT set) — completes task, screenshots both moments
5. Founder enables test mode using the commands below (~2 min before next condition)
6. Knight Cursor session 2 (same or fresh session — Founder choice): WITHOUT substrate — completes task, screenshots
7. Test mode auto-expires after 1 hour; or disable with Remove-Item commands below
8. Bishop tabulates measurements; Founder arbitrates correctness; results filed at `EMPIRICAL_AB_RESULTS_B127.md`
9. Penny Saved paper Section 5 incorporates results

---

## K520.7 — How to Enable Test Mode (WITHOUT substrate condition)

**Step 1 — Generate a signed authority token (run once, in PowerShell):**

```powershell
python C:\Users\Administrator\.lb-session\generate_test_authority.py
```

This prints three `$env:` lines. Paste them into your terminal.

**Step 2 — Paste the three env-var commands output by the generator, e.g.:**

```powershell
$env:LB_SUBSTRATE_GATE_TEST_MODE         = "1"
$env:LB_SUBSTRATE_GATE_TEST_AUTHORITY    = "<64-char-token-from-generator>"
$env:LB_SUBSTRATE_GATE_TEST_ACTIVATED_AT = "<unix-epoch-from-generator>"
```

**Step 3 — Launch Cursor from the SAME terminal** (so env vars are inherited).

**Step 4 — Disable when done (or just wait 1 hour for auto-expire):**

```powershell
Remove-Item Env:\LB_SUBSTRATE_GATE_TEST_MODE
Remove-Item Env:\LB_SUBSTRATE_GATE_TEST_AUTHORITY
Remove-Item Env:\LB_SUBSTRATE_GATE_TEST_ACTIVATED_AT
```

**Audit trail** — every bypass event is logged to:
`C:\Users\Administrator\.lb-session\test_mode_audit.jsonl`

Inspect via MCP tool: `mcp__librarian__test_mode_audit_summary`

**Security note:** The generator writes only the SHA-256 hash of the token to disk — the raw token lives only in your shell session. BOTH the file and the matching env-var are required to bypass the gate. Auto-expires after 1 hour regardless.

## Filing target

Results memo at `BISHOP_DROPZONE/00_FOUNDER_REVIEW/EMPIRICAL_AB_RESULTS_B127.md` post-execution. Headline numbers feed:
- Penny Saved paper Section 5
- V2 tagline empirical defense
- R14 protocol Cathedral-Multi-Edict condition (uses these numbers as starting calibration)
- Token Pricing Gauge (#2309) initial training data
- Public proof at Librarian.LianaBanyan.com (cite the headline ratio)

## Open questions for Founder ratification

- Task pick: A, B, or C? (Bishop pick: B)
- Path A or Path B for controlled-bypass? (Bishop pick: A)
- Same Cursor session for both conditions, or fresh session per condition? (Bishop recommendation: same session for context-asymmetry honesty; both pay the same opening-context cost; only env-var differs)
- Any additional tasks to run for averaging? (Bishop recommendation: 1 task is enough for B127 V2-tagline defense; replication via R14 later)

---

---

## Status History

| K# | Date | Status | Note |
|----|------|--------|------|
| K520.5 | 2026-04-26 | LANDED | First-Consult Edict MVP — gate reads substrate_cache.json |
| K520.6 | 2026-04-26 | LANDED | Operational Gotchas Scribe — claimed writeSubstrateCache wired |
| K520.7 | 2026-04-26 | LANDED | Signed test-mode bypass — enables controlled A/B measurement |
| K520.8 | 2026-04-27 | LANDED | Cache write patch — closed wiring gap; 8/8 verifications pass |

**K520.8 root cause**: `writeSubstrateCache` existed and was called but had a silent `catch {}` — any runtime failure was invisible. Added explicit logging at every step, 50K char truncation on briefingText, and statSync round-trip self-test. End-to-end integration test confirms cache written on every `brief_me` call. The A/B bypass (K520.7) + cache wire (K520.8) are both now operational.

---

*Filed B127 by Bishop, 2026-04-26. Long Haul AND Fix Along the Way. Both, Always. Mean what you say, say what you mean.*
