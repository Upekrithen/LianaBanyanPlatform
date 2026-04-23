---
knight_session: K442
bishop_session: B117
complexity_tier: MODERATE
estimated_duration_hours: 2.0
recommended_model: sonnet-4.6
escalation_trigger: "If predicate logic requires touching letter ingestion pipeline or Supabase schema, escalate to opus-4.7"
---
# Knight K442 — Letter Tracking: 3-State Predicate Refactor (Drafted / Locked / Dispatched)
## B117, April 23, 2026 — DISPATCH-READY

**Status:** Dispatch-ready. Can run after K441 lands, or parallel if Founder has capacity for two Cursor windows.

**Prerequisite reads:** BRIDLE Rules 1–7. Minimum: `librarian-mcp/touchstone/predicates/` (all current predicates), `librarian-mcp/touchstone/manifest.json`, `BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Apr12-13_Soft_Open/` (letter files), the existing `response_received_within` predicate code, and `MILESTONE_B116_CLOSEOUT.md` for TouchStone context.

**Priority:** High. Current single predicate produces 40 false-negatives on crown letters and 45 false-positives on brief_me's auto-complete heuristic. The mismatch is visible to Founder at every session and erodes trust in the ledger.

**Estimated Knight session:** 2–3 hours.

---

## Why this Knight — the predicate mismatch observed B117

B117 opening-pass observations:

- `mcp__librarian__brief_me` flags 45 crown letters as "POSSIBLY COMPLETED" based on file-in-approved-folder heuristic.
- `mcp__librarian__touchstone_verify` on the same letters returns **`FAILED: No letter_dispatched event found — cannot compute deadline`** for every one.
- Both are "right" under their own predicate: files exist in `BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Apr12-13_Soft_Open/` (12 SEC-fixed crown letters); zero letters have logged `letter_dispatched` events.
- Founder confirmed B117: "NONE have been sent."

The predicate conflates three distinct real-world states:

1. **Drafted** — file exists in approved folder (current heuristic in brief_me)
2. **Locked** — Founder has ratified the draft; ready-to-send (currently tracked via `letters.json.locked: 6`)
3. **Dispatched** — physical send happened; event logged (currently tracked via `letter_dispatched` event, which the `response_received_within` predicate requires as a prerequisite)

An additional fourth state is already tracked separately: **Response-received** (within deadline window).

---

## Scope — refactor predicates into explicit 3-state ladder

### Half A — New predicates

Write three new predicates in `librarian-mcp/touchstone/predicates/`:

1. **`letter_drafted.py`** (or `.ts` — match surrounding convention). Passes when a file exists under `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` or any subdirectory whose filename matches the deliverable recipient's name. Use fuzzy matching on the Deliverable.title recipient field (e.g., "Crown letter to Trebor Scholz" → look for files containing "TREBOR_SCHOLZ" or "SCHOLZ" with enough specificity to disambiguate from Olaf Scholz). Return (pass, reason) with the resolved file path in `reason` on pass.

2. **`letter_locked.py`** — Passes when `letters.json.<recipient>.status === "locked"` OR when a `letter_locked` event exists in the event ledger for the recipient. Distinct from drafted — this is Founder-ratification state.

3. **`letter_dispatched.py`** — Passes when a `letter_dispatched` event exists. Same logic the current `response_received_within` already uses internally; split out as its own predicate.

Keep **`response_received_within.py`** as-is semantically, but refactor internally to call `letter_dispatched` as a sub-check rather than handling the "no dispatch event" case itself.

### Half B — Per-deliverable predicate assignment

Update the TouchStone manifest schema so that each letter-deliverable has an **ordered predicate list** rather than a single predicate:

```json
{
  "id": "crown-letter-trebor-scholz",
  "predicates": [
    "letter_drafted",
    "letter_locked",
    "letter_dispatched",
    "response_received_within:14d"
  ]
}
```

Status resolution logic:
- If no predicates pass → `pending`
- If only `letter_drafted` passes → `drafted`
- If `letter_drafted` + `letter_locked` pass → `locked` (ready-to-send)
- If through `letter_dispatched` passes → `dispatched` (awaiting response)
- If `response_received_within` passes → `completed`

Expose the highest-passing predicate in `touchstone_verify` output so Founder sees `drafted`, `locked`, `dispatched`, `response_received` rather than just `FAILED` or `PASSED`.

### Half C — `brief_me` reconciliation

The existing "auto-complete candidate" heuristic in `brief_me` was previously based on file-existence. Update it to emit **the highest predicate passed** instead of the binary "POSSIBLY COMPLETED." Output should read:

```
### Letters state summary
- Drafted but not locked: 32
- Locked, awaiting dispatch: 6
- Dispatched, awaiting response: 0
- Response received: 0
```

…instead of `Auto-Complete Candidates: 45`. This alone ends the false-positive cycle.

### Half D — Migration of existing deliverables

For every existing deliverable in the TouchStone manifest:
- If `owner === "founder"` and title matches `Crown letter to *`: assign the 4-predicate ladder above with `14d` response window
- If `owner === "founder"` and title matches `Wave * letter` or similar outreach: same ladder but consider shorter (`7d`) window per Founder direction (default to `14d` if not specified)
- Other letter deliverables: case-by-case, leave alone unless trivially obvious

Produce a dry-run report first (no writes) listing proposed predicate-ladder changes per deliverable; Founder approves batch, then Knight applies.

---

## Acceptance criteria

- [ ] Three new predicate files compile and pass their own unit tests
- [ ] `touchstone_verify crown-letter-trebor-scholz` returns status `drafted` (with resolved file path) after refactor — not `FAILED`
- [ ] `touchstone_verify crown-letter-bill-gates` returns status `blocked` with reason `Epstein indefinite hold per MEMORY` — confirm a `blocked` status path exists or add one if not
- [ ] `brief_me` Letters summary block replaces the "POSSIBLY COMPLETED" block
- [ ] Existing `response_received_within`-based predicates on non-letter deliverables still work unchanged
- [ ] A regression test for: letter gets drafted, then locked, then dispatched, then response received — verifies each state transition advances the status correctly
- [ ] Dry-run migration report reviewed by Founder before live manifest write
- [ ] Test: a letter file that doesn't match any deliverable's recipient name stays at `pending` (no false positive)

---

## Non-goals

- **Do NOT** auto-dispatch any letter. Dispatch is Founder-triggered and logs the event manually via a script / CLI that Founder runs.
- **Do NOT** make the dispatch event log public. It's internal-only in this pass.
- **Do NOT** rewrite the event ledger schema (`letter_dispatched`, `letter_locked` event shapes). Reuse existing schema if present; only add if missing.
- **Do NOT** touch letter CONTENT files — K442 is predicate-layer only.
- **Do NOT** auto-mark Bill Gates as blocked without Founder-confirmed logic — predicate can include an explicit blocklist loaded from config OR from a `blocked` status field on the deliverable; prefer the latter for per-deliverable control. Update `crown-letter-bill-gates.status = "blocked"` explicitly in the migration.

---

## Dependencies + sequencing

- **K441 merged recommended but not required.** K441 touches indexer, K442 touches TouchStone predicates — different files. Parallel is safe.
- **K436 merged ✓** (Cathedral tools) — unrelated, no conflict
- **K437 running** (SCEV-1) — unrelated, no conflict

---

## Reporting requirements (BRIDLE Rule 7)

1. Pre-refactor state: counts of each `touchstone_list` status; counts of each `letters.json` status; example `touchstone_verify` output on 3 crown letters
2. Post-refactor state: same counts, plus new state breakdown (drafted/locked/dispatched/response-received)
3. Any predicates the refactor needed to LEAVE broken (e.g., non-letter deliverables the migration skipped)
4. Whether `brief_me` output cleanly integrates the new letter-state block
5. Commit SHA(s)

---

## Bonus — known factual corrections to fold in

- **Bill Gates** (deliverable `crown-letter-bill-gates` if it exists) — indefinite hold, Epstein reason. Status = `blocked`, not `pending`.
- **Melinda French Gates** — NOT on hold. Normal target. If a deliverable conflates them under just "Gates", split into two distinct deliverables.
- **12 Wave 1 SEC-clean letters** (Buffett / Scott / Khan / Newmark / Seibel / Simon / Dougherty / Glenn / Williams / Kaiser / T.Scholz / O.Scholz) are Founder-approved drafts living in `BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Apr12-13_Soft_Open/`. Migration should catch these as `locked` (or at minimum `drafted`), not `pending`.

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). Follow-on to Crown-letter disposition analysis in B117 opening pass. Resolves the predicate-mismatch observed across `brief_me` vs `touchstone_verify`.*
