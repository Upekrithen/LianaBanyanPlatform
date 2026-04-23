---
knight_session: K443
bishop_session: B117
complexity_tier: MODERATE
estimated_duration_hours: 1.5
recommended_model: sonnet-4.6
escalation_trigger: "If frontmatter parser grows to 50+ lines or toast WinRT layer needs debugging, escalate to opus-4.7"
---
# Knight K443 — Automated Model-Router PowerShell Wrapper for Knight Dispatch
## B117, April 23, 2026 — DISPATCH-READY

**Status:** Dispatch-ready. Independent of K441 / K442 / K438. Can run any time.

**Prerequisite reads:** BRIDLE Rules 1–7. Minimum: `BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_K*_B*.md` (look at several recent prompt structures), Cursor's model-picker documentation, PowerShell scripting conventions used in this repo (look at existing `.ps1` files if any exist under `platform/scripts/` or the LianaBanyanPlatform root).

**Priority:** Medium-High. Founder burns time per-session on manual model selection; automating saves real minutes per dispatch and reduces false-economy (Haiku when Opus was needed, or Opus-over-spend on simple tasks).

**Estimated Knight session:** 1.5–2 hours.

---

## Why this Knight

Per B117 Founder observation: *"how in the world do I know [which model to pick] in advance? Rather: Can we make something automatic so that it will use the cheaper Sonnet 4.6 until it needs Opus 4.7?"*

Current state:
- Every Knight prompt drafted by Bishop is a Markdown file in `BISHOP_DROPZONE/01_KnightPrompts/`.
- Founder manually opens Cursor, selects a model, pastes the prompt.
- Model selection is guesswork — Founder can't know which task is "complex enough" to warrant Opus until mid-session.
- Cost impact: routine Sonnet work costs $5–20/session; complex Opus work costs $50–120/session; mixing is wasteful.

Bishop B117 proposed a **complexity-tier field embedded in every Knight prompt** that Founder matches to the right model. This is Option A (manual but decided-once-per-prompt). K443 implements **Option B: PowerShell wrapper that reads the tier field and launches Cursor with the pre-selected model.**

---

## Scope

### Half A — Tier-field convention in Knight prompts

Declare a standard YAML frontmatter block at the top of every Knight prompt going forward. Bishop will author per this convention; K443 implements the reader.

```yaml
---
knight_session: K443
bishop_session: B117
complexity_tier: SIMPLE  # SIMPLE | MODERATE | COMPLEX
estimated_duration_hours: 1.5
recommended_model: sonnet-4.6  # haiku-4.5 | sonnet-4.6 | opus-4.6 | opus-4.7
escalation_trigger: "If more than 3 files need simultaneous edits, escalate to opus-4.7"
---
```

Retroactively adding this to existing K-prompts is NOT required; the wrapper handles absent frontmatter by defaulting to sonnet-4.6 and warning the operator.

### Half B — PowerShell wrapper `knight-dispatch.ps1`

Ship at `C:\Users\Administrator\Documents\LianaBanyanPlatform\scripts\knight-dispatch.ps1` (create `scripts/` if absent).

Behavior:

```powershell
knight-dispatch.ps1 -PromptFile PROMPT_KNIGHT_K443_B117.md
# 1. Parse YAML frontmatter
# 2. Extract recommended_model
# 3. Open Cursor with the prompt file + the pre-selected model
# 4. Output: "Dispatching K443 to Sonnet 4.6 (complexity: SIMPLE). Escalation trigger: {...}"
```

Cursor command-line-interface must support model-preselection. If it does not, fall back to:
- Copy the prompt content to clipboard
- Open Cursor
- Show the operator a popup with the recommended model name to manually pick
- Log the dispatch event to `scripts/knight_dispatch.log.jsonl`

### Half C — Observable dispatch log

Every wrapper invocation appends a JSONL line to `scripts/knight_dispatch.log.jsonl`:

```json
{
  "ts": "2026-04-23T14:30:22Z",
  "prompt_file": "PROMPT_KNIGHT_K443_B117.md",
  "knight_session": "K443",
  "bishop_session": "B117",
  "complexity_tier": "SIMPLE",
  "recommended_model": "sonnet-4.6",
  "launched_via": "cursor-cli",
  "estimated_duration_hours": 1.5
}
```

Purpose:
1. Post-hoc observability — which complexity tier produced which outcome? Bishop can grep the log after a month and validate tier recommendations against actual session costs.
2. Tier-accuracy feedback loop — if SIMPLE-tier sessions regularly require upgrading to Opus mid-session, that's a signal to Bishop that the tier scoring rubric needs adjustment.

### Half D — Fallback to manual picker

If Cursor CLI doesn't support model-preselection today (likely — document this), the wrapper MUST:
1. Parse the prompt
2. Open it in Cursor
3. Display a clearly-visible message to operator: "**RECOMMENDED MODEL: Sonnet 4.6** (complexity: SIMPLE). If this task escalates to 3+ files in one edit, switch to Opus 4.7."

Either via Windows toast notification, or terminal output, or both. Operator still picks; but the picker decision is informed not guessed.

---

## Acceptance criteria

- [ ] YAML frontmatter convention documented in `scripts/KNIGHT_PROMPT_CONVENTIONS.md` (new file) or as a header comment in `knight-dispatch.ps1`
- [ ] `knight-dispatch.ps1 -PromptFile <path>` parses frontmatter, extracts tier + model, and either preselects in Cursor OR displays recommendation prominently
- [ ] Dispatch log `scripts/knight_dispatch.log.jsonl` is created and appended atomically per invocation
- [ ] Wrapper handles absent frontmatter with a clearly-worded warning + sensible default (sonnet-4.6)
- [ ] Wrapper handles unknown `recommended_model` values with a clearly-worded error + default
- [ ] End-to-end test: `knight-dispatch.ps1 -PromptFile PROMPT_KNIGHT_K443_B117.md` runs without errors, opens Cursor, logs the dispatch
- [ ] Documentation in `scripts/README.md` or `knight-dispatch.ps1` header comment explaining usage

---

## Non-goals

- **Do NOT implement a smart-routing LLM that classifies prompts on the fly.** That's Option C (LLM-router). Scope creep. Leave for a future K-session if Founder decides the YAML-frontmatter Option B isn't enough.
- **Do NOT backfill tier fields into existing K-prompts.** Bishop adds the field to new prompts from B118 onward; K443 wrapper handles absent-field gracefully.
- **Do NOT modify Cursor itself or ship Cursor plugins.** Pure-PowerShell wrapper outside of Cursor's install surface. If Cursor CLI doesn't support model preselection, fall back to operator message; do not try to patch Cursor's binary.
- **Do NOT open multiple Cursor windows.** Each dispatch opens a single Cursor instance or adds to an existing one — Founder's choice, declared via a wrapper flag.

---

## Dependencies + sequencing

- **Independent.** No dependency on K441, K442, K436, K437, or any Bishop work.
- **Can run in parallel with any other Knight session.**
- **Once complete**, Bishop starts adding the YAML frontmatter convention to every new K-prompt from B118 onward. Existing prompts unchanged.

---

## Reporting requirements (BRIDLE Rule 7)

1. Cursor CLI exploration — what model-preselection interface exists today? Document exactly.
2. Wrapper behavior on each of: SIMPLE / MODERATE / COMPLEX tiers; and on absent-frontmatter; and on unknown-model
3. Test log output from 3–5 dispatch invocations (use existing K-prompts with manually-added frontmatter for the test)
4. Commit SHA(s)
5. Any tier-vs-model mapping Knight thinks Bishop should adjust (e.g., if Cursor's Sonnet 4.6 is actually called `claude-sonnet-4.5-latest` internally, document)

---

## Optional — Half E (low priority, Knight's call)

If time permits: extend the dispatch log to include post-session cost tracking. Operator runs `knight-dispatch.ps1 -Finalize <knight_session_id> -ActualCost 23.50` at session close; the wrapper enriches the JSONL line. Gives Bishop empirical tier-vs-cost data for tuning.

Not required for K443 acceptance. Good future hook.

---

## Complexity rubric (for Bishop's use in future prompts)

| Tier | Criteria | Recommended model | Typical cost |
|---|---|---|---|
| SIMPLE | One file. Trivial logic. Docs/config/hygiene. No tests required. | haiku-4.5 or sonnet-4.6 | $1–5 |
| MODERATE | 3–10 files. Tests required. Standard library usage. No novel design choices. | sonnet-4.6 | $5–20 |
| COMPLEX | 10+ files OR novel architecture OR multi-hour session OR multi-module integration OR cross-module refactor | opus-4.7 | $30–120 |

K443 itself is MODERATE. K436 was COMPLEX. K441 and K442 are MODERATE. K438 will be COMPLEX.

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). Automation for the model-picker problem Founder flagged in B117: "how in the world do I know that in advance?" Answer: Bishop scores the tier at prompt-authoring time; wrapper acts on the score; Founder doesn't have to guess.*
