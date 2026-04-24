# Founder Playbook — K455b Attribution-Isolation Test

**Session:** K455b  
**Date:** 2026-04-23  
**Mode A (automated):** Already complete — Knight ran Mode A via Perplexity API. Results in `results/K455b_log.jsonl`.  
**Mode B (manual UI, optional):** Instructions below if you want visual screenshot evidence.

---

## What this test is for

K455b proves that Cathedral-effect lift (the HOT% improvement from having Cathedral content in context) is **attributable to the Cathedral content alone** — not to any ambient Librarian infrastructure running in the background during K455c/K455a benchmarks.

Perplexity has **no MCP support**. Whatever you paste in is the only thing it can use. If the lift reproduces here, Cathedral contribution is clean and isolated.

---

## Mode A — Knight-Automated (already complete)

Knight ran Mode A: 50 R11 questions through the Perplexity API.
- **Arm 1 (control):** 25 questions, bare (no Cathedral content)
- **Arm 2 (treatment):** 25 questions with the Pawn Cathedral snapshot as system prompt

Results are at `BISHOP_DROPZONE/K455b_playbook/results/K455b_summary.json`.

---

## Mode B — Founder Manual via Perplexity Pro UI (optional, for screenshots)

If you want visual screenshot evidence in addition to the automated results:

### Pre-session setup

1. **Install ShareX** (free, Windows): [https://getsharex.com/](https://getsharex.com/)
2. Open Perplexity Pro at [https://www.perplexity.ai](https://www.perplexity.ai) — on a **clean machine** (not your dev machine with Librarian running)
3. Verify clean machine has: **no Librarian MCP, no R11 directory, no Stitchpunks** — just Perplexity Pro in a browser
4. Have `pawn_cathedral_snapshot.md` open in a text editor, ready to copy
5. Have `K455b_log_template.jsonl` open to log responses

### ShareX configuration

- Hotkey: `Ctrl+Print Screen` → region capture (select Perplexity response area only)
- Auto-save to `K455b_captures/K455b_Q<NN>_<timestamp>.png`
- Local-only storage (no cloud upload — publication hold applies)

---

## Per-Question Protocol (Mode B only — 50 questions total)

### Arm 1 (control — 25 questions, NO Cathedral paste)

For questions R11-CS-01 through R11-CS-09, R11-AM-01 through R11-AM-08, R11-EG-01 through R11-EG-08:

1. Open a fresh Perplexity conversation
2. Ask the R11 question as-is (just the question, no preamble)
3. Wait for complete response
4. Hit `Ctrl+Print Screen` → capture the Perplexity response area
5. Copy Perplexity response text → paste into `K455b_log_template.jsonl` with `"arm": "control"`
6. Next question (new conversation if needed)

### Arm 2 (treatment — 25 questions, WITH Cathedral paste)

For questions R11-MJ-01 through R11-MJ-08, R11-RC-01 through R11-RC-08, R11-HP-01 through R11-HP-08:

1. Open a **fresh** Perplexity conversation
2. Paste the full contents of `pawn_cathedral_snapshot.md` as your first message
3. Immediately follow with: `"Based on the reference material I just pasted, answer the following question:"` + R11 question
4. Wait for complete response
5. Hit `Ctrl+Print Screen` → capture the Perplexity response area
6. Copy Perplexity response text → paste into `K455b_log_template.jsonl` with `"arm": "treatment"`
7. Start a **fresh** Perplexity conversation for the next question (prevents context bleed)

---

## Post-session (Mode B)

1. Save your completed `K455b_log.jsonl` to `BISHOP_DROPZONE/K455b_results/`
2. Save your `K455b_captures/` screenshot folder to `BISHOP_DROPZONE/K455b_results/`
3. Signal to Knight: "K455b Mode B data ready for grading"

Knight will then run the grading pipeline on your logs and produce the final report.

---

## Publication Hold

Everything from this session (screenshots, logs, reports) is under **publication hold** until Prov-14 receipt. Do NOT share screenshots or results externally.

---

*Prepared K470/B121, 2026-04-23. Knight session K455b.*
