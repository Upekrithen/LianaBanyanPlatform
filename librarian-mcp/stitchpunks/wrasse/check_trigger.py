# Knight Prompt — K-MJ-MJ-02b-Final-MISS — Close Last K539 MISS Condition (B132)

======================================================================
WRASSE PRE-INJECTION v1.0.0 (K540/B132)
Session: K545-wrasse-on | Matches: 8 | Read BEFORE first reasoning step.
Pre-resolved triggers -- no need to re-derive these from scratch.
======================================================================

[W-013] CANONICAL_NUMBER: membership cost
  Canonical: $5 per year. IMMUTABLE — Founder-ratified. Never changes based on tier, platform size, or vendor costs. Industry-term: membership-orthogonal (platform pricing/vendor API costs are separate from LB membership price). Cite as: 'LB membership: $5/year, unchanged for all members.'

[W-019] VOCABULARY: Stone Tablet Imperative
  Operational discipline: every measurement run preserves full payload (all result files, graded JSONLs, cost logs), never deletes intermediates, and emits a Call Sign (git tag) at close. Reduction-to-practice for reproducibility claims. Each Stone Tablet is append-only (no in-place edits). A 'supersedes' field points to prior tablet's timestamp for corrections. Enforced in K490 mining runs, K535...

[W-020] VOCABULARY: Wrasse Scribe
  K540/B132 primitive — pre-injection registry preventing rote-cognition tax at agent-spawn boundaries. Registry at: librarian-mcp/stitchpunks/wrasse/wrasse_registry.jsonl. Trigger classes: k_prefix, ts_prefix, call_sign, vocabulary, file_path, canonical_number. Empirical anchor: ~22pp context delta at K539 session open. Founder 90% reduction claim. Provisional 15 candidate. Publication gate: HAR...

[W-021] VOCABULARY: Brick Wall Discipline
  Founder-mandatory (B132 reinvocation). Four hard prohibitions: (1) NO --no-verify under any circumstance. (2) NO mock-data when real-data is required. (3) NO test-stubbing to make a check pass. (4) NO shortcut around an Augur block — address the underlying cause. When a hook/Augur/pre-commit gate fires: STOP, diagnose root cause (TS-079/TS-100/TS-095), fix root cause, re-stage, re-commit. Never...

[W-033] K_PREFIX: K535 R11v2 Rich-Fact Indexing
  K535/B131 — R11v2 Rich-Fact Indexing. Root cause: max_entries=100 in both adapters silently cut off RC (positions 100-124) and HP (positions 125-149). Fix: max_entries 100->200. Results: 5-cond HOT 51.5-55%->82.5-86% (+30-32pp). RC: 31.9%->84.4% (+52.5pp). HP: 30.6%->84.7% (+54.1pp). Tag: v-r11v2-rich-fact-indexing-K535 (commit 5b26d7a). Known miss: RC-15 (grader case-sensitivity), HP-22 (phero...

[W-039] K_PREFIX: K539 MJ variant KP refinement
  K539/B131 — MJ variant KP refinement. Tag: v-mj-variant-kp-refinement-K539. LAST session before K540 (Wrasse Scribe MVP). Context screenshot showed 94%->27% context delta at session open = 22pp rote-cognition tax that Wrasse targets. Part of K523->K539 = 16 consecutive clean landings.

[W-059] VOCABULARY: R11 benchmark / R-series
  R11 = LB's internal benchmark series. R11-v3-RICH-FACT-K535v2 is current corpus ID (150 facts: 6 categories x 25 each). Categories: CS (Canonical Statistics), AM (Architecture Mechanics), EG (Economic Governance), MJ (Member Journey), RC (Regulatory Compliance), HP (Historical Precedent). 5-condition HOT% post-K535: 82.5-86% across all vendors. Question bank sealed: R11_QUESTION_BANK_SEALED_K47...

[W-062] VOCABULARY: brief_me / MoneyPenny / Librarian MCP
  brief_me(task) — single MCP tool call replacing get_system_overview + query_domain + get_architecture + check_consistency. Returns canonical numbers, matched domains (tables, functions, pages), related concepts, applicable rules, past work in ~600 words. Call at every session start with task description. Optional: moneypenny_checklist(task) for pre-flight validation; moneypenny_debrief(session_...

======================================================================
END WRASSE PRE-INJECTION -- proceed with task.
======================================================================


**Filed**: B132, 2026-04-29 by Bishop on Founder direction (post-K539 receipt review).
**Status**: STAGED — paste-ready for Founder fire-and-forget dispatch.
**Scope source**: K539 close report — MJ-02b condition reached 93.9% but did not clear the 100% Founder-stated goal; one remaining MISS class needs Knight investigation.
**Sequencing**: independent of K-Wrasse-Scribe (in flight) and K-Vendor-Layer-Tablet-Capture; can run in parallel.

**LB membership pricing**: unchanged at $5/year, identical for every member. Cost references in this prompt refer to vendor API spend (industry term, membership-orthogonal — pricing identical for all members at $5/year, unchanged).

---

## BRICK WALL DISCIPLINE

**Hard floors — cross any one and you HALT and report:**
1. **No `--no-verify`. Ever.** If a hook fails, fix the underlying issue.
2. **No silent corpus drift** — if you change R11 corpus content during MISS investigation, surface explicitly. Corpus changes invalidate prior K523-K539 receipts; that is a Founder-level decision, no