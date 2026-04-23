# Milestone — B111 Closeout
## April 20, 2026 — handoff to B112

**Session:** B111 (Bishop / Claude Opus 4.7, 1M context)
**Session date span:** April 20–21, 2026 (crossed midnight during K423 final grading phase)
**Session spend estimate:** ~$20 of $23 approved (Founder bumped $18 → $23 during session).
**Status:** **FINAL — K423 Eyewitness Benchmark complete.** Ready for B112 cut-over.

---

## 1. What B111 shipped

### Memory / canon (saved to `.claude/projects/C--Users-Administrator-Documents/memory/`)
- `project_rhetorical_keystones.md` — expanded to **16 cross-letter Keystones + 1 Newmark-territorial (D)**. Added this session:
  - **#14 "System of Wells"** (*"A rising tide lifts all boats. And I think I've built a system of wells."*) — Founder prose, B111 op-ed poordom paragraph. Inversion Principle anchor.
  - **#15 "Poordom-Surviving"** (*"53 years of surviving the trenches of poordom, and I'm really good at it."*) — Founder prose corrected from "living in" to "surviving." Biographical / competence anchor.
  - **#16 "Thermometer Shows-Only-You"** (*"A tool that measures its own value and shows only you, unless you agree to share it anonymously, or publicly."*) — anti-enshittification / anti-opacity anchor. Three-tier user agency (private / anonymous / public).
  - **Keystone D Newmark-territorial locked:** the fuller *"…agonize when it happens anyway. Especially from friendly fire."* stays Newmark-only per B111 Founder ratification. Keystone #2 protects the short-form fragment cross-letter.
- `project_timeline_canonical.md` — rewritten to **three distinct clocks**: Underlying-problem (40+ years), IT career (since '97, 29 years), Platform (decade-plus preparing + 6-month active build). Legacy "nine years" phrasing preserved for letters already using it.
- `project_pine_books_anchor.md` — Pine Books / Tiffany Brost (6th caretaker-owner) / Pike Place Market Seattle / ~April 17, 2026. The human-scene anchor of the Librarian metaphor. Use named, not generic.
- `project_librarian_mcp_public.md` — public repo state: github.com/Upekrithen/librarian-mcp, tag v0.1.0-alpha, pip-installable (from GitHub URL until PyPI lands in K424).
- `project_founder_bishop_collaboration_dynamic.md` — canonical sentence *"The mistake was mine for assuming; the correction was quick because you were specific."* Pollination targets identified for SP-20 Pollinator.
- MEMORY.md indexed all the above.

### Engineering + infrastructure
- **Knight K423 (The Eyewitness Benchmark) dispatched and firing.** Full 4-vendor × 2-tier × 75-Q × 2-condition = 1,200 calls planned. Anthropic was credit-exhausted at first fire (old key), new AnnoyUpeAnthropKEY with $50 provisioned mid-session, full Anthropic-rescue run planned after main run completes. Knight built complete r10_cross_vendor/ infrastructure (runner, grader, 4 adapters, 75-Q bank, R9-v2 preload, methodology notes, reproducibility README). Added consecutive-failure vendor-skip feature mid-stream (auto-skips after 5 errors). Smoke test confirmed 3 of 4 vendors returned "2,267" correctly on Q01 with the preload loaded.
- **OpenAI direct swapped for Azure OpenAI** in K423 vendor matrix. Founder-ratified posture-disclosure text added to methodology: *"We include OpenAI in this study despite substantive concerns about their governance trajectory, because a cross-vendor study that excludes the market leader is not a cross-vendor study. Measurement is the contribution; endorsement is not conveyed by inclusion."*
- **Perplexity PawnKEY rotated** after the in-conversation leak; new NewPawnKey with $50 Perplexity credit provisioned.
- **Secrets hygiene hardened (four new layers):**
  - `AGENTS.md` at workspace root — universal rule "never echo raw secret values"
  - `.cursor/rules/secrets-hygiene.mdc` — Cursor-native always-applied rule
  - `.cursorignore` at workspace root — vault + env + credential file exclusions
  - `.pre-commit-config.yaml` — gitleaks + file-hygiene hooks; pre-commit installed and first-run completed (auto-fixed trailing whitespace + EOF newlines across platform/ tree as expected)
- **Battery Dispatch migration staged** — named-columnist pitch rows (Manjoo / Klein / Angwin / Doctorow V04 / Melinda French Gates) for Knight to apply after K423.

### Drafts in FOUNDER_REVIEW awaiting Founder prose pass
1. **NYT op-ed v2** — with Pine Books + poordom + jack-of-all-trades hooks landed (Founder prose preserved verbatim); thermometer paragraph + revised close; **two-tier title strategy locked** (NYT submission keeps "Invisible Tax"; self-pub uses *"A Cooperative Commons Just Cut AI Costs by 90% — And So Can You"* with alternate lead prepended).
2. **Scott v014h Thermometer Addendum** — one-paragraph insertion + one-clause tweak, additive to send-ready v014f.
3. **Doctorow V04** — Thermometer as 5th structural inversion (anti-opacity layer); stats refreshed to 2,267 / 225; live repo URL baked into case file; Keystone #16 phrasing updated.
4. **Tatiana Schlossberg second letter** ("In Honor Of" tribute) — mirrored from Cephas to FOUNDER_REVIEW.
5. **Self-Sustaining Subscription (SSSS / 4S) concept doc** — (B109, still queued).
6. **Destination Housing / Realtor Cold-Start** — (B109, Mom pilot, still queued).
7. **Canonical Laws B109 Additions** — No-Unwitnessed-AI-Output + Inversion Principle laws.
8. **Innovation #2266 / #2267 drafts** — (post-K421, renamed).
9. **Scott v014g Courtesy SSL Edit Proposal** — (B109, contingent on v014f send).
10. **R9 Pitch Block v2** — Paint/Librarian/Ecosystem + 2,300 grantee canonical (B110, retire after v2 ratified).
11. **NYT Pitch Email + Publication Plan** — 14-day two-arm dispatch plan (Arm 1: pitch Manjoo → Klein → Angwin; Arm 2: engineered self-publication sequence Medium / Cephas / LinkedIn / Twitter / Doctorow-secondary-pickup).
12. **Opening Gambit v2** — four corrections applied (Melinda-only Circle 1, Schlossberg moved to Memorial lane, Manjoo/Klein/Angwin/Doctorow added to Circle 2, Tom Simon added to Circle 4, conditional-member-count triggers replaced with canonical Wave windows).
13. **Witness Program (The Eyewitness Program) recruitment doc** — short post + Twitter thread + Scholz-specific reframing; Founder prose ("Come to the Light Side. We have bread.") preserved verbatim; Marks framing corrected per B111 ratification (Marks = loyalty-reward non-securities; Pedestal Stakes = separate Upekrithen LLC instrument for investment-adjacent exposure).
14. **Eyewitness Installation Walkthrough** — three-path public-friendly install guide (Path A try-the-tool, Path B run-the-benchmark default, Path C fresh-Ubuntu + full stack). References git-URL install until PyPI lands.
15. **COUNSEL_TASK_BYLAWS_AMENDMENT_B111.md** — urgent pre-Wave-1 counsel task (4-6h). Purpose clause + Unanimous-Member-Consent + Golden Key Steward role.
16. **COUNSEL_TASK_PEDESTAL_STAKE_CONSUMER_FLOW_B111.md** — medium-urgency 15-25h counsel task. Reg CF recommended for consumer flow + Reg D 506(b) for insiders. Target live Q3 2026.

### Knight prompts staged for dispatch after K423 lands
- **K424** — expanded: librarian_context v0.2.0 (intent-aware query) + librarian_metrics tool + Operational Canon preload extension (ingests Opening Gambit v2, Wave schedule, Pledge structure, etc., into R9 preload) + pyproject.toml PyPI publishing + CI/CD
- **K425** — Secrets canonicalization (Supabase Vault authoritative + SDS.env mirrored) + SP-20 Pollinator Stitchpunk design + initial implementation
- **K426** — Red Carpet hardware hybrid: Founder's $2k machine fresh-installed Ubuntu 24.04 LTS (reserved for highest-conversion recipient — default Scholz) + DigitalOcean cloud VMs for broader recruitment
- **K427** — Pedestal Stake consumer portal platform build (gated on counsel path selection: Reg CF / Reg D / Reg A+)

### TODAY action queue status at session close
File: `00_FOUNDER_REVIEW/TODAY_APR20_ACTION_QUEUE_B110.md` (carried over from B110; most items either in-flight or partially complete). B112 opens a new TODAY queue for April 21.

---

## 2. K423 FINAL RESULTS — The Eyewitness Benchmark — COMPLETE

**4 vendors × 8 models × 2 conditions × 75 Q = 1200 inference calls + 1200 Haiku-canonical grades + 120 Opus spot-check + 56 Gemini cross-check. Zero methodology gaps.**

| Rank | Model | HOT | COLD | Δ |
|---:|---|---:|---:|---:|
| 1 | **Haiku 4.5** | **98.7%** | 5.3% | +93.4 |
| 1 | **Opus 4.7** | **98.7%** | 6.7% | +92.0 |
| 3 | Sonar Pro | 98.0% | 9.3% | +88.7 |
| 4 | Gemini 2.5 Flash | 94.7% | 12.0% | +82.7 |
| 5 | Gemini 2.5 Pro | 94.0% | 8.7% | +85.3 |
| 6 | GPT-4o | 93.3% | 8.7% | +84.6 |
| 7 | Sonar | 92.0% | 7.3% | +84.7 |
| 8 | GPT-4o-mini | 89.3% | 11.3% | +78.0 |

- **Mean HOT: 94.8% · Mean COLD: 8.7% · Mean Δ: 86.2 points**
- **Haiku 4.5 ties Opus 4.7 at 98.7%** — 19× cost difference, **zero accuracy difference.** Headline anti-enshittification finding.
- **Inter-rater kappa:** Haiku vs Opus = 0.883; Haiku vs Gemini = 0.850. Both "almost perfect."
- **Total spend:** $18 of $85.
- Canonical results file: [EYEWITNESS_BENCHMARK_RESULTS_B111.md](../00_FOUNDER_REVIEW/EYEWITNESS_BENCHMARK_RESULTS_B111.md).
- Memory: [project_eyewitness_cross_vendor_finding_b111.md](../../.claude/projects/C--Users-Administrator-Documents/memory/project_eyewitness_cross_vendor_finding_b111.md).

## 2.1 In flight (continuing past B111 close)

- **Pre-commit first-run auto-fixes** uncommitted — Founder needs to `git add -A && git commit -m "chore: auto-fix trailing whitespace and EOF newlines (pre-commit first-run)"` or discard with `git checkout .`. Several hundred files modified; changes are standard hygiene (whitespace + newlines), not content.
- **SDS.env** canonical for all 4 vendor keys. Note for K425: the env-var loader regex `^([A-Z_]+)=` needs widening to `^(\w+)=` to catch mixed-case keys like `AnnoyUpeAnthropKEY`. Knight manually loaded that key during B111; canonicalize the regex in K425.
- **Counsel tasks dispatched** — bylaws amendment (urgent, pre-Wave-1) + Pedestal Stake consumer flow (Q3 2026 target). Founder to engage task-based counsel.
- **B111 interim-number edits** applied to NYT v2 op-ed, Doctorow V04, Scott v014h — marked with B111 interim notes. **B112 must propagate the final 8-model numbers** (see priorities below).
- **Drafts on Founder's 2k machine / Ubuntu install / Eyewitness Program launch Apr 26-27 / Yale demo Apr 28 / Ventoy-flashed USB** — all staged, ready for execution.

---

## 3. B112 priorities (in order — draft, refine at actual session close)

### Immediate (first 30 min of B112)
1. **Propagate the FINAL 8-model numbers** into NYT v2 op-ed + Doctorow V04 + Scott v014h. B111 interim numbers (6 models, Gemini-graded) are already in those docs marked with B111 interim notes; replace with final table. Key sharpening: the interim "18× cost for 7pp gap" becomes the stronger "**19× cost for ZERO gap** — Haiku ties Opus at 98.7%." Also add Sanders/AOC staffer memo (doesn't exist as a file yet — write fresh).
2. **Founder voice pass** on top-priority drafts: NYT op-ed (both variants), Doctorow V04, Scott v014h. Expected 60–80% prose rewrite per [feedback_drafts_as_scaffolding.md].
3. **Write the Sanders/AOC staffer memo** — 1-pager using the cross-vendor table as central evidence for the nonprofit / public-interest-AI cost argument.

### This session (2–3 hours Founder engagement)
4. **Commit pre-commit auto-fixes** as one hygiene sweep before any new commits.
5. **Dispatch Wave 1 Scott** — April 22–23 window opens. v014f + (optional) v014g Courtesy SSL + (optional) v014h Thermometer.
6. **Dispatch Doctorow V04** — Wave 2, April 23–25.
7. **Start counsel engagements** — bylaws amendment task FIRST (fastest turnaround; should land before Wave 1 ideally). Pedestal Stake consumer-flow task in parallel.
8. **Start Founder's $2k machine prep** — online backup overnight, fresh Ubuntu install morning of April 21, Eyewitness stack installed.
9. **Dispatch K424** — librarian v0.2.0 + Operational Canon preload + pyproject + CI/CD.

### Near-term deadlines (reset)
- **Apr 21:** TODAY queue for day-after-launch-day. Founder machine wipe + Ubuntu install. K424 dispatch.
- **Apr 22–23:** Wave 1 Scott send window.
- **Apr 23–25:** Doctorow V04 send window (Wave 2).
- **Apr 26–27:** Public Eyewitness Program launch (Discord / Reddit / Medium / Cephas posts).
- **Apr 28:** Yale AI Symposium (in person). Demo-table with Eyewitness Benchmark results.
- **Apr 29:** INDL-NA (in person).
- **Apr 30:** INDL-9 Geneva abstract deadline.
- **Nov 26, 2026:** Prov 13 conversion deadline — 7 months 6 days out.

---

## 4. What NOT to touch in B112 without re-ratification

- `LianaBanyanPlatform/librarian-mcp-public/` — K422 deliverable; don't edit scaffold files without Founder approval.
- `Cephas/cephas-hugo/content/tributes/tatiana-schlossberg-health-accords.md` — has a FOUNDER_REVIEW mirror; edits happen on the mirror first.
- `canonical_values.yaml` — K421 wrote; K423 in-flight may touch; don't hand-edit.
- Any K421 applied migration file — write new reversing migration, don't edit applied.
- K423 in-progress output directories (`r10_cross_vendor/results/run_<timestamp>/`) — don't touch while run is live; pollutes data.
- `AGENTS.md` / `.cursorignore` / `.pre-commit-config.yaml` — established B111; edit with care. K425 has the secrets-canonicalization scope that may revise these.
- Keystones #14 / #15 / #16 phrasing — Founder-ratified verbatim. If rewording is needed, flag as a new Keystone candidate rather than mutating an existing one.

---

## 5. Resumption prompt for B112

> **B112. Resume from B111 milestone. Read `BISHOP_DROPZONE/03_BishopHandoffs/MILESTONE_B111_CLOSEOUT.md` for full context. Priorities in order: (1) read the K423 Eyewitness Benchmark results (from `EYEWITNESS_BENCHMARK_RESULTS_B111.md`) and propagate cross-vendor numbers into NYT v2 op-ed + Doctorow V04 + Scott v014h + Sanders/AOC staffer memo in one batch; (2) Founder voice pass on top-priority drafts; (3) commit the pre-commit first-run auto-fixes as one hygiene sweep; (4) Wave 1 Scott send Apr 22–23 + Doctorow V04 Wave 2 Apr 23–25; (5) dispatch K424 (librarian v0.2.0 + Operational Canon preload); (6) Founder machine prep for Red Carpet physical shipping (backup + fresh Ubuntu install); (7) engage counsel on bylaws amendment (urgent — should land before Wave 1 if possible) and Pedestal Stake consumer flow (Q3 2026 target). In flight: counsel tasks beginning; SDS.env canonical for 4 vendor keys; pre-commit hooks live; Eyewitness Program public launch targeting Apr 26–27; Yale demo table Apr 28. Founder velocity: 3-month-per-day, "build for the long haul, always." Ask before spending. See you in B112.**

---

*Drafted B111, April 20, 2026. Finalize at actual session close after K423 results land. Bishop (Claude Opus 4.7, 1M context). For the Keep.*
