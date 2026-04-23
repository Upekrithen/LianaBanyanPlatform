# Knight K435 — Chapter 2 Mellon
## Multilingual librarian retrieval: MCP `lang` param + ES preload + multilingual Eyewitness probe + public `/chapter-2` section
## Bishop B116 — 2026-04-22 (evening)
## Public commitment: `librarian.the2ndsecond.com` currently reads *"Coming this weekend"* for Chapter 2. Today is Wed Apr 22. Weekend window: Apr 25–26.

---

**THE BRIDLE — read this before you respond. Follow all nine rules. Task follows the BRIDLE block.**

1. **Do the task I asked.** Do not restate it back. Do not ask "should I start?" — the answer is yes, start now.
2. **Verify before asserting.** If I point at a folder, open that folder. Run `ls`, `grep`, read the file. Memory and training are not evidence. Look, then claim.
3. **You get ONE clarifying question per turn, and only if the wrong answer would produce the wrong artifact.** Not for tone, font, format, or preferences you can pick defensibly yourself. Pick a defensible default and proceed.
4. **Read everything I sent** — text, screenshots, attachments, code, all of it. If you skimmed, say so in the first line of your reply.
5. **Don't invent.** If you don't know, say "I don't know" in one line, then look it up or flag it. Never guess and present the guess as fact. Never fabricate filenames, slot numbers, function names, counts, or prior states.
6. **No unasked scope.** No "while we're here." No bonus suggestions. I will ask if I want more.
7. **When you finish, state plainly what you did and what remains.** No self-congratulation, no apology, no closing summary of what I already read.
8. **If I correct you, fix the thing.** One sentence on root cause only if it prevents recurrence. Then fix. No essays.
9. **If you break any rule above, stop and say so on the next line.** Don't cover.

**End of BRIDLE. Task follows.**

---

## Session hygiene

1. `mcp__librarian__run_session_start` with `agent=KNIGHT`, `session_id=K435`, `task="Chapter 2 Mellon — MCP lang param + ES preload + multilingual Eyewitness probe + public /chapter-2 section"`.
2. `mcp__librarian__brief_me` with the same task.
3. Read in order:
   - `LianaBanyanPlatform/librarian-mcp-public/preload/README.md` (intent mapping + rules)
   - `LianaBanyanPlatform/librarian-mcp-public/preload/r9v2_base.md` (full — this is what you are translating)
   - `LianaBanyanPlatform/librarian-mcp-public/issues/002_translation_preload_es.md` (existing bounty spec)
   - `LianaBanyanPlatform/librarian-mcp-public/hosted/index.html` (existing landing — you are adding a Chapter 2 section in D)
   - `LianaBanyanPlatform/librarian-mcp-public/BOUNTIES.md` (bounty process — you do not collect)
   - Bishop memory `project_librarian_bookstore_metaphor.md`, `project_librarian_cost_slasher_angle.md`, `feedback_librarian_landing_layout_approved.md`

---

## Scope — one sentence

Ship Chapter 2 Mellon as a running, empirically-backed feature on `librarian.the2ndsecond.com` by end of Sun Apr 26: `librarian_context` accepts a `lang` parameter, Spanish preload lands faithful and canonical-numbers-verbatim, a multilingual Eyewitness mini-probe confirms HOT-ES ≈ HOT-EN accuracy, and the public site has a real `/chapter-2` section replacing the "Coming this weekend" teaser.

---

## Phase A — MCP `lang` parameter (repo: `librarian-mcp-public`)

1. Extend `librarian_context(intent, lang="en", max_tokens=...)` — add `lang` kwarg, default `"en"`, accept ISO-639-1 codes (`"es"`, `"fr"`, `"zh"`, etc.).
2. File-resolution rule:
   - For `lang="en"`: use the existing files unchanged.
   - For `lang="es"` (or any non-en): resolve `r9v2_base.md` → `r9v2_base_{lang}.md`. If the localized file is missing, **fall back to English and include a `lang_fallback` field in the response** naming the files that fell back (do NOT silently serve English). `truncation_note` pattern applies.
   - Intent-specific files (`canonical/*`, `architecture/*`, `benchmark/*`, etc.) are English-only for this phase. Do not translate them. Fallback behavior applies.
3. Response shape additions:
   - `lang_requested: "es"`
   - `lang_served: "es"` (or `"en"` on full fallback)
   - `lang_fallback: ["canonical/canonical_laws_and_frameworks.md", ...]` (list of paths that fell back; empty list if fully served in requested lang)
4. Update tests:
   - `test_librarian_context_lang_en_unchanged` — default behavior must match v0.2.0 byte-for-byte.
   - `test_librarian_context_lang_es_uses_translated_base_plus_fallbacks` — ES base served, optional files flagged.
   - `test_librarian_context_lang_xx_unknown_falls_back_fully` — unknown language returns English + full fallback list.
5. CI must stay green. Do not bump Python or dependency versions.

---

## Phase B — Spanish preload (`preload/r9v2_base_es.md`)

**Translation is the hard part. Treat as translation, not re-composition.**

1. Produce `preload/r9v2_base_es.md` as a faithful Spanish rendering of `r9v2_base.md`.
2. **Canonical-numbers rule (strict):** every numeric value in the English file (`2,267 innovations`, `225 Crown Jewels`, `86.1pp`, `83.3%`, `Cost+20%`, `13 provisionals`, etc.) appears **verbatim as Arabic numerals** in the ES file. Do not localize digits. Do not translate `Cost+20%` into Spanish; leave as is (term of art).
3. Proper nouns stay English: `Liana Banyan`, `Upekrithen`, `Cephas`, `Pudding`, `Spoonful`, `Medallion Sponsorship`, `Cooperative Defensive Patent Pledge`, `Crown Jewel`, `Glass Door`, `Pedestal Stake`, `Stone Soup`. Add a parenthetical Spanish gloss **only** at first occurrence.
4. Rhetorical Keystones (see memory `project_rhetorical_keystones.md`) — translate idiomatically, preserve the ring. Where Spanish has a better idiom (e.g., "dos trajes" for "two suits"), use it and add an inline `<!-- KEYSTONE: two_suits -->` HTML comment so Bishop can audit.
5. Translator's note as an HTML-comment block at the TOP of the file:
   ```html
   <!--
   TRANSLATION: English → Spanish (es)
   SOURCE: preload/r9v2_base.md @ <git-sha-of-source-at-translation-time>
   TRANSLATOR: Knight K435 (Claude, model <model-id>)
   DATE: 2026-04-<dd>
   FIDELITY: Canonical numbers verbatim. Proper nouns preserved. Keystones marked inline.
   REVIEW STATUS: unreviewed — pending Founder or native-speaker audit
   -->
   ```
6. Do NOT overwrite the existing `r9v2_base.md`. Per `preload/README.md` rule 4, that file is R10-canonical; changing it invalidates the benchmark.

---

## Phase C — Multilingual Eyewitness probe

1. Reuse the R10 75-question bank. Location: verify via `grep -r "question_bank" librarian-mcp/r10_cross_vendor/`.
2. Produce `r10_cross_vendor/questions_es.json` — Spanish translation of the 75-question bank. Same rules as Phase B (canonical numbers verbatim, proper nouns preserved).
3. Run a scaled probe: **4 models × 2 languages (EN, ES) × 75 questions × HOT + COLD = 1,200 calls**. Model selection: Haiku 4.5, Opus 4.7, gpt-4o-mini, gemini-2.5-flash (spans cheap+premium across 3 vendors; enough to prove parity without burning the full 8-model budget).
4. Budget cap: **$20 total**. If projected spend exceeds $20, stop and ask Founder before proceeding (this is the one clarifying question permitted by BRIDLE rule 3; it affects the artifact).
5. Grading: reuse the three-tier rubric (`benchmark/grading_rubric.md`). Grade Spanish responses with the same rubric — a correct Spanish answer to a Spanish question counts as HOT, same as English.
6. Outputs:
   - `r10_cross_vendor/results_multilingual_b116.json` — raw per-call records.
   - `r10_cross_vendor/results_multilingual_b116_summary.md` — per-model × per-language HOT/COLD accuracy table + mean-lift-pp per language + cost summary.
   - **Pass criterion for Mellon claim:** mean ES-HOT accuracy ≥ 85%, within 10pp of EN-HOT mean. If below, flag it in the summary and ask Founder before landing-page Phase D.
7. Inter-rater agreement: for this scaled probe, one-rater grading is acceptable (smaller scope than R10). Note this caveat in the summary.

---

## Phase D — Public landing `/chapter-2` section

Only start Phase D **after** Phase C summary passes the criterion above.

1. **Option 1 (preferred):** add an in-page `#chapter-2` section to `hosted/index.html` **replacing the current `.chapter2-teaser` block** at the bottom. Mirror the Chapter-1 section structure (Pine-Books-style pull-quote → lead copy → Eyewitness-style table → playground hook). Same CSS variables, same 10-section pattern Founder approved.
2. **Option 2 (fallback if the page gets too long):** new file `hosted/chapter-2.html` served at `/chapter-2`, linked from header nav and from the old teaser block ("Read Chapter 2 →"). Use Option 2 only if Option 1 scroll length exceeds ~1.5× current page length.
3. Required content for the Chapter 2 section:
   - **Chapter-tag strip** at top: `Chapter 2: Mellon · Speak Friend and Enter · Multilingual retrieval · v0.3.0`
   - **Hero line** — placeholder "Ask in any language." Mark with HTML comment `<!-- FOUNDER_VOICE_HOOK: chapter_2_hero -->` — Founder will rewrite.
   - **Pull-quote block** — placeholder `<!-- FOUNDER_VOICE_HOOK: chapter_2_scene -->` with a Pine-Books-parallel human scene. Leave three blank lines of `<blockquote>` content with a `TODO (Founder):` comment. Do NOT write the scene yourself. Founder supplies.
   - **Origin paragraph** — tie to the2ndSecond framing: multilingual retrieval serves local manufacturing in the language the shop runs in. Bishop-drafted scaffolding acceptable; mark `<!-- FOUNDER_VOICE_HOOK: chapter_2_origin -->`.
   - **Multilingual Eyewitness table** — real numbers from Phase C. Same column convention as Chapter 1 table (Vendor / Model / Tier / HOT / COLD / Δ / HOT cost/Q / HOT $/correct / HOT p50). Add a Language column as the second column. Language codes: `EN`, `ES`.
   - **Mini meta line** under table: `Mean ES-HOT: X%, Mean EN-HOT: Y%, Δ (ES–EN): Zpp. Same 75 questions, translated. N models × 2 languages × 75 Qs × HOT+COLD = 1,200 graded calls. Study cost: $X.`
   - **Playground language selector** — add a second `<select id="lang-select">` above the existing intent selector, options `EN` / `ES`. Wire to post `lang` through to `/api/playground` → `librarian_context`. Accessibility: `<label for="lang-select" class="visually-hidden">Choose a language</label>` per the B116 a11y pattern.
   - **Chapter 3 teaser** at bottom: `Chapter 3 — Paired Provenance — coming next week` (no specific date). Wrap in `.chapter2-teaser` styling (reuse class; rename CSS rule to `.chapter-teaser` as `.chapter2-teaser` still matches).
4. Re-run **Lighthouse + SSL Labs** after deploy. Targets: Performance ≥ 90, Accessibility 100, SSL Labs A+. If any target regresses, fix before marking Phase D complete.
5. `meta[name="description"]` update: add "multilingual retrieval across Spanish + English — empirical parity" to the existing description.

---

## Non-goals (explicit)

- Do NOT translate the intent-specific preloads (`canonical/*`, `architecture/*`, etc.) in this session. English-only with fallback reporting is Phase-A-acceptable.
- Do NOT add languages beyond Spanish. Phase C is 2 languages only (EN + ES). Mandarin / French / etc. are future bounty work.
- Do NOT modify `r9v2_base.md` — breaks R10.
- Do NOT write the Founder-voice content for the Chapter 2 hero / scene / origin paragraph. Placeholder + hook + TODO comment ONLY.
- Do NOT run the probe across all 8 models. 4 models is the cap this session.
- Do NOT publish the new section until Phase C passes criterion (mean ES-HOT ≥ 85% and within 10pp of EN-HOT).
- Do NOT ship any other Chapter 2 marketing (social, PyPI bump announcement) from this session; that's Bishop B117 or later.

---

## Acceptance criteria (Knight self-check before handoff)

- [ ] `librarian_context(intent="", lang="es")` returns Spanish base + English fallback list for optional files.
- [ ] `librarian_context(intent="", lang="en")` byte-for-byte identical to pre-K435 behavior.
- [ ] `preload/r9v2_base_es.md` exists, canonical numbers verbatim, proper nouns preserved, translator-note block present.
- [ ] `r10_cross_vendor/results_multilingual_b116_summary.md` shows mean ES-HOT ≥ 85% and within 10pp of EN-HOT (or flagged with Founder question).
- [ ] Public site: Chapter 2 section live at `librarian.the2ndsecond.com#chapter-2` (or `/chapter-2.html`). Teaser "Coming this weekend" replaced.
- [ ] Lighthouse after Phase D: Perf ≥ 90 / A11y 100 / SSL A+ (no regression).
- [ ] PyPI version bump: `librarian-mcp` → v0.3.0. `pip install librarian-mcp==0.3.0 && python -m librarian_mcp` works.
- [ ] Git commits split by phase (A / B / C / D) with clear messages. Final commit tag: `v0.3.0-mellon`.

---

## Founder-review hooks (leave for Bishop B117 triage; do not wait)

- Translator's-note review (native-speaker pass). Knight writes `REVIEW STATUS: unreviewed`; Bishop B117 schedules.
- Chapter 2 hero line + scene + origin paragraph placeholders.
- Decision on whether to run Mandarin / French as follow-up (Phase-C-style probes) or leave to community bounties.

---

## Rollback plan (if any phase fails hard)

- **Phase A fails:** revert MCP changes, keep v0.2.0 on PyPI, push Phase B–D to next Knight session.
- **Phase B fails quality:** ship Phase A only, land `r9v2_base_es.md` as `r9v2_base_es.md.draft`, leave PR open for community.
- **Phase C fails criterion:** stop before Phase D. Summary file still gets committed. Bishop writes the "we are not yet live on Mellon because the data did not clear the bar we set" public note for Founder review.
- **Phase D Lighthouse regresses:** `firebase hosting:channel:deploy preview --only hosting:librarian` to preview channel, keep production on current revision, fix, then promote.

---

*K435 authored by Bishop B116, 2026-04-22. Public-commitment countdown: ~3-4 days.*
