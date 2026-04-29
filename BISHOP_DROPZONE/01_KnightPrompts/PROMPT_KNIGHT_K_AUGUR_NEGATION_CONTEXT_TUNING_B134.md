# K-Augur-Negation-Context-Tuning — B134

**Filed:** 2026-04-29 by Bishop on Founder direction (B134 turn 16, Option A)
**Founder direction:** *"Option A and C"* — Option A = re-tune Augur for negation context (NEW K-prompt; small)
**Class:** Hook-code refinement; reduces Augur-Securities-Language false-positive on anti-securities statements

---

## WRASSE PRE-INJECTION

| Trigger | Canonical |
|---|---|
| K-Augur-Negation-Context-Tuning | This prompt; B134; tunes ~/.claude/hooks/bishop_librarian_gate.py to suppress false-positives on negation contexts (e.g., "Zero Investors") |
| Augur-Securities-Language | Hook gate on PreToolUse Edit/Write; matches forbidden equity/investor/dividend/ROI/profit-share/investment-vehicle/ICO/token-sale terms; K514.5 + K527 + TS-092 prior tunings exempt specific contexts |
| Founder-mandatory feedback | feedback_canonical_single_source_of_truth.md, BRIDLE v11 Rule 11A (counsel-no-gate) + 11B (prose-pass-at-fire-time) |
| K547 alias-aware retrieval | Registry-Keyword-Extension method; same pattern (extend keyword/regex set with context-aware variants) applies here |

---

## SCOPE

The Augur-Securities-Language hook fires on literal substring match against the forbidden-terms list. It does NOT distinguish between:

- **Affirmative use** (predatory): *"join us as an investor and earn dividends"* — should fire
- **Negation use** (cooperative-coherent): *"we have zero investors and pay no dividends"* — should NOT fire

Empirical receipt (B134 turn 14): the Medium article DRAFT title *"15 Patents, Zero Investors — How Four AI Agents Built a Cooperative Platform"* and subtitle *"...zero investors."* triggered Augur-Securities on a literal substring match against "investors." This is structurally a false-positive: the prose is anti-securities (we EXPLICITLY do NOT have investors).

K514.5 and K527 already added context exemptions (investigate/investigation; ROI in AI-compute-economics context). This K-prompt extends that pattern to **negation context detection.**

## PHASES

### Phase A — Audit existing hook + add Phase A.0 brief_me

A.0: brief_me with task "K-Augur-Negation-Context-Tuning hook tuning audit; review K514.5 + K527 prior tunings + TS-092 ratification + feedback_canonical_single_source_of_truth.md"

A.1: Read `~/.claude/hooks/bishop_librarian_gate.py` — audit current Augur-Securities-Language regex / token detection logic.

A.2: Identify forbidden-term scan implementation (regex or substring) and any existing context-exemption logic (K514.5 + K527 anchors).

A.3: Document current behavior + proposed negation-detection layer at `BISHOP_DROPZONE/03_BishopHandoffs/K_AUGUR_NEGATION_CONTEXT_DECISION.md`.

**Bishop pause** — surface to Founder before Phase B implementation.

### Phase B — Implement negation-context detection

B.1: Add negation-context regex layer that suppresses false-positive when forbidden term appears in negation context. Target patterns:

- `\b(zero|no|never|never accept|never offer|don't|do not|cannot|won't|will not|free of|absence of)\s+(\w+\s+){0,3}(investor|investors|dividend|dividends|equity|equity stake|equity shares|shareholder|return on investment|ROI|profit share|investment opportunity|investment vehicle|investment scheme|investment fund|token sale|ICO)`
- Also: reverse-order phrasing `(invest|invested|investing)\s+(\w+\s+){0,5}(NOT|not|never|nothing|none|zero)` 
- Also: `(?i)without\s+(\w+\s+){0,3}(investors?|equity|dividends?|shareholders?)`

B.2: Add unit tests covering:
- Affirmative trigger: *"join us as an investor"* → fires (correct)
- Negation suppression: *"Zero Investors"* / *"zero investors"* / *"we have no investors"* → does NOT fire
- Edge case: *"investors are not welcome here"* → does NOT fire (negation downstream)
- Edge case: *"investors are required"* → fires (no negation)
- Boundary case: *"Investors? Never."* → does NOT fire (negation in adjacent clause)
- False-suppression check: *"limit investor approval"* / *"investor approval"* without negation → fires (correct)

B.3: Test against B134 turn 14 receipt — Medium article draft *"15 Patents, Zero Investors — How Four AI Agents Built a Cooperative Platform"* should NOT fire after fix.

### Phase C — Integration test + commit

C.1: Run all existing Augur tests to confirm no regression (existing K514.5 + K527 + TS-092 exemptions still work).

C.2: Synthetic-payload pipe-test with B134 turn 14 example payload.

C.3: Commit + tag.

## D.1 ARCHITECTURE DECISION (pre-ratified — proceed without pause)

**Pre-ratification:** Phase B regex-layer extension is the minimal-change-most-impact path. No engine code changes; no breaking changes to existing exemptions; pattern-match identical to K514.5 + K527 prior tunings.

**Knight default = Ⓐ regex extension layer.**

Alternative considered: full natural-language-detection (LLM-based negation) — over-engineered for this scope; defer to future K-prompt if regex-layer proves insufficient.

## CONSTRAINTS

- BRIDLE v11 enforced (Rule 11A no-counsel-gate; Rule 11B no-prose-pass-timing-pressure)
- Phase A.0 brief_me MANDATORY at start
- Stone Tablet Imperative — Decision artifact written before Phase B; no in-place hook destructive edits
- Reproducibility: every regex pattern test goes in unit-test file; future regressions surface immediately
- Brick Wall: no `--no-verify` on commit
- Tag-on-close mandate: `v-augur-negation-context-tuning-K<INTEGER>` (next consecutive K-num after K552)

## EXPECTED RECEIPTS

- 6+ unit tests green (3 affirmative-fire + 3 negation-suppress + 2 edge cases)
- B134 turn 14 receipt example does NOT fire after fix (regression test)
- All prior K514.5 + K527 + TS-092 tests still green
- Hook code change is small (~30 lines added; no removals; no existing-test changes)
- Commit + tag + reasoning trace

## STANDING ON

After Knight closes:
- Bishop verifies + ratifies
- Bishop applies retroactive fix to Medium article DRAFT mediumArticleDrafts.ts title + subtitle (the original Option C surgical-only-numbers edit can be extended to title/subtitle once Augur passes negation context)
- Toolsmith log entry: TS-AUGUR-NEGATION-CONTEXT-TUNING-K<NUM>-B134

Bishop standing by for closeout ratification.
