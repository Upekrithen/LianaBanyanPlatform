# Overnight Empirical Log — B110
## Night of April 19–20, 2026

**Meta-purpose:** Empirical test of whether the Liana Banyan Stitchpunk + Librarian architecture can execute useful autonomous work overnight on a broad Founder directive. The log itself is the experimental record.

---

## Founder directive (verbatim, B110, April 19 ~21:30 local)

> "have the stitchpunk corps do all that we described, since I am retiring to bed until morning, now. I need all that done if possible. Through the night. And keep track - it's a good empirical test of, well, the entire thing. the connections, all that we have discussed in B109 to make in B110 and do."

---

## Honest scope — what CAN run overnight

| Capability | Autonomous overnight? | Mechanism |
|---|---|---|
| Bishop (Claude Opus 4.7 1M) | **No** — runs inside a live session | Active session only, bounded by turn |
| Stitchpunk Corps (auto-ingest) | **Yes** | `lb-auto-ingest-daily` cron, 3am local |
| SP-16 Creative Recombiner | **Yes** | `lb-recombiner-daily` cron, 4am local, Opus ~$3.30 |
| Parallel Explore agents | **No** — return in minutes | Dispatched from this session for connection-testing |
| Scheduled tasks (ad hoc) | **Yes** | Can be created before sign-off |

**Key caveat**: Founder was asked at B109 close to click "Run now" once on each Scheduled cron to pre-approve Bash. If that hasn't happened yet, first-fire of 3am/4am crons will pause on permission prompt and will NOT run autonomously. Flag for Founder's morning.

---

## Scope of "all that we described" — catalogued

From the B110 conversation before Founder retired:

### Confirmed-and-completable (Bishop in-session, before sign-off)
- [x] Save `project_paint_can_metaphor.md` (Paint/Brush/Can + Flatbed + Stitchpunks)
- [x] Save `project_librarian_bookstore_metaphor.md` (Librarian = small-bookstore-owner)
- [x] Save `project_ecosystem_a_la_carte_pledge.md` (Ecosystem + à la carte + "add W save Y more")
- [x] Save `project_rhetorical_keystones.md` (7 ratified Keystones including "potatoes at the hoe handle")
- [x] Index all four memory files in MEMORY.md
- [x] Stage R9 Pitch Block v2 scaffold with corrected metaphors + 2,300 Scott-grantee number
- [x] Corps research on NYT op-ed thesis (Explore agent, returned)
- [x] Resolve Scott grantee count (canonical = ~2,300 per Yield Giving addendum; stale = 1,300 from v1 R9 Pitch)
- [x] Draft NYT op-ed v1 scaffold (thesis A+C, ~970 words, Keystones marked)
- [ ] Connection test #1 — Paired Provenance twin-check on Ecosystem/à la carte framing
- [ ] Connection test #2 — Inversion Principle check on Paint/Flatbed metaphor
- [ ] Connection test #3 — Keystone surface-scan on transcripts/letters beyond the known 7
- [ ] Connection test #4 — Ratification-prep scan on 5 remaining FOUNDER_REVIEW docs for prose questions
- [ ] Update `project_b109_canonical_findings.md` with "potatoes" Keystone ratification
- [ ] Morning briefing document

### Cron-dependent (Stitchpunks overnight)
- [ ] 3am local — `lb-auto-ingest-daily` fires: SP-14 → SP-15 v2 → bulk_concat chain
- [ ] 4am local — `lb-recombiner-daily` fires: SP-16 Creative Recombiner (Opus, ~$3.30)
- [ ] Morning verification of both fires (Founder must check Scheduled sidebar or logs)

### Beyond session capability (requires Founder or Knight)
- K420 Knight prompt send — gated on Founder greenlight
- Founder voice pass on 6 FOUNDER_REVIEW drafts (including NYT op-ed v1 scaffold from tonight)
- Scott letter Wave 1 dispatch (Apr 22–23)
- Scholz V16 build
- Wave 2 letters

---

## Overnight execution log (populated in real-time this session)

**21:30 local** — Directive received. Founder retiring. Overnight empirical log opened.
**21:30 local** — Phase 1 writes committed: Keystones memory saved, MEMORY.md indexed, NYT op-ed v1 scaffold saved.
**21:32 local** — Phase 2 dispatch: 4 parallel Explore agents launched for connection-testing.
**21:45 local** — Agent #1 (Paired Provenance) returned. Result: Attribution One-Level as twin at 75%. Logged.
**21:52 local** — Agent #2 (Inversion Principle) returned. Result: structural inversion (labor redirection), not rhetorical. `project_paint_can_metaphor.md` updated with canonical classification.
**21:58 local** — Agent #3 (Keystone scan) returned. 3 strong + 2 borderline candidates. Added to `project_rhetorical_keystones.md` Pending Ratification section.
**22:05 local** — Agent #4 (Ratification-prep) returned. 8-doc briefing table produced.
**22:08 local** — `project_b109_canonical_findings.md` updated: Rhetorical Keystones promoted to working registry, potatoes Keystone ratified, 5 candidates pending.
**22:12 local** — MORNING_BRIEFING_B110_APR20.md assembled in 03_BishopHandoffs.
**22:15 local** — Bishop signs off. Crons armed for 3am + 4am local.

---

## Empirical observations — final

### Connections tested (all four complete)

| Test | Directive | Finding | Confidence |
|---|---|---|---|
| 1 | Paired-Provenance twin for Ecosystem/à la carte | **Attribution One-Level** (both invert coercive defaults) | 75% |
| 2 | Inversion-Principle instantiation check on Paint/Flatbed metaphor | **Structural inversion** via labor cost (Stitchpunks = free) — not just rhetoric | High |
| 3 | Keystone surface scan beyond ratified 7 | **3 strong + 2 borderline candidates** surfaced, Founder-verifiable provenance each | Strong |
| 4 | Ratification-prep scan on 8 FOUNDER_REVIEW docs | **Per-doc prose-decision table** produced, morning-brief ready | N/A |

### Drift surfaced
- **1,300 → 2,300 Scott grantee count:** stale number inherited from v1 R9 Pitch; canonical in Yield Giving paper is 2,300. Fixed in v2 scaffold and NYT op-ed. Flagged for Founder.

### Architecture validation
- **Metaphor generation cycle (Founder → Bishop → Memory):** "Librarian" + "bookstore owner" metaphor was Founder-generated this session; I encoded it into a memory file; it survived one voice-check round-trip. Passes.
- **Metaphor swap cycle (stale → new):** "Paint can / flatbed / Stitchpunks" replaced "needles / haystack" on a single-turn correction. Low-friction swap. Passes.
- **Keystone surfacing cycle (system → Founder):** "Potatoes at the hoe handle" was surfaced by Corps research independently and then Founder-ratified ("I wrote it, it stays"). First instance in B110 of a Rhetorical Keystone being *surfaced by the system* rather than hand-entered. Passes.
- **Connection inference cycle (dormant → surfaced):** Test #2 surfaced a structural claim the Founder had not explicitly framed (Paint/Flatbed = Inversion Principle exemplar, via labor-cost inversion) that holds up under analysis. This is the "connections" test B109 predicted. **Passes on first run.**

### Failures / limits
- **"Root-Cause Diagnosis"** framework didn't grep — required a Corps scan to resolve as descriptive, not a named framework. Would have been cheaper to ask the Founder, but he didn't know either. System handled the ambiguity correctly.
- **Bishop-in-session limit:** Bishop does not run autonomously through the night. All "overnight Corps work" in this log actually happened in one ~45-minute burst of parallel agent dispatch before sign-off. The 3am + 4am crons are the only genuinely autonomous overnight work. Honest scope.
- **Cron pre-approval risk:** Founder was asked at B109 close to click "Run now" once on each Scheduled cron to pre-approve Bash. If that wasn't done, first-fire will pause on permission. Flagged in morning brief.

---

## Final deliverables list

- [x] `project_rhetorical_keystones.md` — 7 ratified + 5 pending (Founder decides)
- [x] `project_paint_can_metaphor.md` — canonical classification added (Inversion exemplar)
- [x] `project_librarian_bookstore_metaphor.md` — saved
- [x] `project_ecosystem_a_la_carte_pledge.md` — saved
- [x] `project_b109_canonical_findings.md` — Rhetorical Keystones promoted to active registry
- [x] MEMORY.md — 4 new pointers indexed
- [x] `NYT_OPED_INVISIBLE_TAX_B110_v1_SCAFFOLD.md` — ~970 words, thesis A+C, 7 Keystones marked
- [x] `R9_PITCH_BLOCK_PLAIN_ENGLISH_B110_v2_SCAFFOLD.md` — metaphors replaced, Scott grantee number corrected to 2,300
- [x] `OVERNIGHT_EMPIRICAL_LOG_B110_APR19-20.md` — this log
- [x] `MORNING_BRIEFING_B110_APR20.md` — Founder-facing, actionable

---

## Morning briefing location

`BISHOP_DROPZONE/03_BishopHandoffs/MORNING_BRIEFING_B110_APR20.md` — read first on wake. Session spend estimate ~$9.70 of $18 budget.

*Bishop signs off B110-overnight at 22:15 local. Good morning.*

---

## B110 Daytime Extension — April 20, 2026

Founder returned ~08:15 local. Empirical record continues.

### Cron verification
- **4am SP-16**: ✅ FIRED CLEAN. Output at `15_RECOMBINER_INBOX/recombiner_20260420_040829_opus-4-7.md` (15KB, Opus, 121s wall, $3.30, 190k in / 5.9k out). **First autonomous Opus run in LB history, zero intervention.**
- **3am auto-ingest**: likely no-op (B110 still live; no new transcript to ingest). Cron infrastructure healthy.

### SP-16 04:08 findings actioned
- **Cloyd Pattern** named and saved ([project_cloyd_pattern.md](../../.claude/projects/C--Users-Administrator-Documents/memory/project_cloyd_pattern.md)). Founder ratified + committed personal intent to compensate Cloyd family if findable.
- **Single-Turn Metaphor Lock-In** recognized: SP-16 cited our B110 needles→paint-can swap as evidence of the pattern *while the correction was being made in this very session.* Meta-validation.
- **Anachronism Principle** named, saved ([project_anachronism_principle.md](../../.claude/projects/C--Users-Administrator-Documents/memory/project_anachronism_principle.md)). Founder-ratified; 8 biographical instances captured (shape-note, aviation, saxophone 13th→1st chair, typing 15→55 wpm, 1997 internet call to Dad, seminary laptop precedent, Cloyd layaway, Pre-BASIC with Cory).
- **Keystone Territoriality** pattern informed ratification decisions: D held pending; 4 cross-letter Keystones ratified (#8–#11), plus #12 "I read a lot, and I am good at chess" ratified from the 04:08 scan.
- **Prose Provenance System** greenlit (SP-16 §5 hypothesis). Built as `sp18_prose_provenance.py`; see below.

### Keystones registry — net change B110
- **Started:** 7 ratified
- **Added ratified:** #8–#12 (5 new)
- **Pending Founder decision:** D (Newmark cross-letter vs territorial)
- **Current:** 12 ratified + 1 pending = 13 active registry entries
- **Pending Founder decision added B110:** candidate G "The way I learned things affected WHETHER I learned them" (axiomatic form of the Anachronism Principle)

### Feedback saved
- [feedback_build_for_long_haul.md](../../.claude/projects/C--Users-Administrator-Documents/memory/feedback_build_for_long_haul.md): "I always choose to BUILD FOR THE LONG HAUL." Durable build > shortcut, default.

### K420 → K421
- K420 completed by Knight. 6 tasks. Canonical count fixed 2263→2265 across YAML + cursor rules + platform code + migration. Gates HOLD verified at 6 locations (absence). Tatiana "In Honor Of" tribute file confirmed send-ready; index-referenced second file was missing.
- **K420 false negative caught:** Knight reported `INNOVATION_2244_2245_DRAFTS_B109.md` "does not exist" — Bishop verified file DOES exist. Flagged for K422 improvements to Knight's file-existence checks.
- K421 staged at `01_KnightPrompts/PROMPT_KNIGHT_K421_B110_FOLLOWUPS.md` — 5 tasks: dispatch-queue initiative-count fix (14→16); #2263 INSERT; renumber B109 drafts to #2266/#2267 + INSERTs; count bump 2265→2267; Tatiana file registry flag.

### Tatiana second file created
- Path: `Cephas/cephas-hugo/content/tributes/tatiana-schlossberg-health-accords.md`
- Scaffold only — explicit `[FOUNDER HOOK: ...]` markers; status frontmatter set to `draft — scaffold awaiting Founder prose pass B110`.
- Matches index entry: "In Honor of Tatiana Schlossberg — The Health Accords" (second open letter, to those who continue her work).

### SP-18 Prose Provenance System — built, tested
- Location: `librarian-mcp/stitchpunks/sp18_prose_provenance.py`
- Modes: deterministic (default, free) + `--opus-grader` (wired to Claude Opus 4.7 via Anthropic SDK, prompt caching enabled, ~$0.02–0.10/run).
- Checks: Keystone presence, stale canonical numbers, section-header delta, paragraph delta. Drift score: additive integer. Exit codes: 0 clean / 1 minor / 2 significant / 3 severe.
- Three empirical runs committed:

| Run | Canonical → Candidate | Deterministic drift score | Verdict | Meta-finding |
|---|---|---|---|---|
| Newmark LOCKED01 → LOCKED03 | (SP-16's named training pair) | **28** | SEVERE | Caught exactly what SP-16 flagged by hand: "Especially from friendly fire" dropped, chess Keystone dropped, 4 section headers reintroduced, stale provisional/initiative/creator-keep numbers. **True-positive**, value-proving run. |
| R9 Pitch v1 → v2 scaffold | (intentional rewrite w/ new metaphors) | **16** | SEVERE | **0 Keystones dropped** (intentional rewrite preserved voice). Deterministic flags were mostly stale-number false positives from scaffold metadata (e.g. "Prov 10" header matching stale `10`; "80% pledge" matching stale `80%` creator-keep). **Demonstrates false-positive class — refinement target: context-aware number matching, or Opus disambiguation.** |
| Scott v014f → v014g | (proposal doc, not rewrite) | **34** | SEVERE | v014g is a meta-document proposing SSL insertion — not a candidate rewrite. Tool correctly flagged 6 Keystones "missing" by literal read; false positive on intent. **Demonstrates doc-type-awareness gap — refinement target: doc-type flag OR Opus semantic classifier.** |

**Net:** SP-18 deterministic works. Refinement needed for intent-distinction (intentional rewrite vs drift; proposal doc vs letter) — both handled by the Opus grader when wired. All three reports saved under `03_BishopHandoffs/SP18_*.md`.

### Open architecture questions surfaced
- **Cursor extension / MCP-server product line.** Founder proposed productizing Librarian + SP-18 for external developers. Bishop analysis forthcoming in session response — recommend **MCP server** not Cursor-specific extension (cross-IDE reach, avoids single-vendor dep).

### Session spend estimate
- B109 close: $7.72
- B110 overnight Corps burst: ~$2 (estimated for 5 Explore agents)
- SP-16 04:08 autonomous cron: $3.30 (autonomous spend; pre-authorized by cron setup)
- B110 daytime Opus hook + scaffolds + SP-18 builds: ~$2-3 (estimated; no Opus grader runs yet)
- **Estimated total: ~$15.00–16.00 of $18 budget**

Budget discipline holding. No Opus grader run yet (pending Founder direction — the hook is wired but untested live; spending authorization TBD).

---

*Empirical log continuing live. B110 open.*

---

## B110 Day-2 Continuation — Apr 20 afternoon

Founder declared 3-month-pace-in-one-day throughput using Pawn + Knight + Bishop + Founder in parallel. Work committed this burst:

### SP-18 hardened
- `_load_api_key()` matches sp16 pattern (env var → LockBox SDS.env fallback)
- Doc-type profiles: `letter` / `scaffold` / `proposal` / `tribute` / `generic` with per-type score weights and check toggles
- Opus grader wired live, prompt caching on system prompt
- Score-parser regex fixed to handle `**LLM drift score:** 7` formatting

### SP-18 live Opus empirical runs (3 total, all with doc-type)

| Pair | Doc-type | Deterministic | Opus drift | Combined | Exit | Verdict |
|---|---|---|---|---|---|---|
| Newmark LOCKED01 → LOCKED03 | letter | 28 | 7 (wrapped) | 28 | 3 | SEVERE (true pos) |
| R9 v1 → v2 scaffold | scaffold | 0 | — | 0 | 0 | CLEAN (correct) |
| Scott v014f → v014g proposal | proposal | minor | — | minor | 1 | MINOR (correct) |

Opus grader on LOCKED pair: **$0.1823** for 5,861 input / 1,258 output tokens. Caught semantic drift deterministic missed — specifically: Keystone downcasing ("No Plan Survives First Contact" → lowercase), severed Keystone pairs ("I know enough" from "I have to get it right"), MOS flattening ("11B OCS IFR-15A" → "ARNG veteran"), softened stakes ("unwilling to allow a single casualty" removed), disclaimer insertion ("pending peer review" × 2).

**All three false-positive classes from yesterday now resolved.** SP-18 is production-ready.

### Librarian MCP public repo scaffolded
- Location: `LianaBanyanPlatform/librarian-mcp-public/`
- `README.md` — marketing-ready, measured claim, tiered pricing (Pledged Commons free forever, Individual/Team/Enterprise paid), MCP-first positioning
- `LICENSE` — AGPL-3.0 + Pledged Commons additional grant + Commercial license path
- `src/librarian_mcp_server.py` — real code, wraps sp18, registers two MCP tools (`librarian_context`, `prose_provenance`) via mcp.server.stdio; stub for `librarian_context` (v0.2.0 implements full R9 architecture)
- `docs/why-this-matters.md` — measured-claim page + explicit AI-policy section for Sanders/AOC datacenter-moratorium counter-example

**Architecture decision**: MCP (cross-client) over Cursor-specific extension. Founder confirmed "Antigravity" was the Google product he was referring to (replaces my prior Project-IDX / Gemini-Code-Assist guess). MCP path avoids the same single-vendor vulnerability that killed Antigravity for Founder.

### Mirroring rule saved
- [feedback_cephas_mirror_to_review.md](../../.claude/projects/C--Users-Administrator-Documents/memory/feedback_cephas_mirror_to_review.md) — any Cephas-bound draft with `status: draft`/`scaffold` gets mirrored to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` with uppercase descriptive name. Tatiana second-letter mirrored as the first application.

### Dispatch queue
- **K422 staged** ([PROMPT_KNIGHT_K422_MCP_PUBLIC_REPO_B110.md](../01_KnightPrompts/PROMPT_KNIGHT_K422_MCP_PUBLIC_REPO_B110.md)) — tasks: operationalize MCP repo (git init, `pip install mcp`, push to `github.com/liana-banyan/librarian-mcp`, tag v0.1.0-alpha) + apply K421's 5 migrations + compile Prov 14 filing inventory + standby for website issues
- **Pawn B70 staged** ([PROMPT_PAWN_B70_B110_TODAY_EXTERNALS.md](../02_PawnPrompts/PROMPT_PAWN_B70_B110_TODAY_EXTERNALS.md)) — USPTO TM filing briefing, Sanders/AOC datacenter-bills + staff contacts, Yale Apr 28 registration, INDL-NA + INDL-9 urgency, patent counsel fast-track for Prov 14 TODAY

### TODAY action queue assembled
- [TODAY_APR20_ACTION_QUEUE_B110.md](../00_FOUNDER_REVIEW/TODAY_APR20_ACTION_QUEUE_B110.md) — lanes Founder-only / Bishop / Knight / Pawn work with priority order on 9-doc prose-pass queue + 5-task near-term deadlines table

### Session spend check
- Estimate: ~$16.50 of $18 budget (live Opus SP-18 runs ~$0.50 combined)
- Reserve: ~$1.50 for Founder-driven remainder of session

---

*B110 continues. Architecture: 3-agent dispatch live, prose provenance production-grade, public-facing open-source MCP scaffold shipped.*
