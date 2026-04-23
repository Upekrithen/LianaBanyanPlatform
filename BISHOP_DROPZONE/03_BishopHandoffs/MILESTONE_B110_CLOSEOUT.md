# Milestone — B110 Closeout
## April 20, 2026 — handoff to B111

**Session:** B110 (Bishop / Claude Opus 4.7, 1M context)
**Session spend estimate:** ~$16.75 of $18 approved. Reserve ~$1.25 for any short follow-ups.
**Status:** Clean close. B111 opens next session.

---

## 1. What B110 shipped

### Memory / canon (saved to `.claude/projects/C--Users-Administrator-Documents/memory/`)
- `project_paint_can_metaphor.md` — Paint/Brush/Can + Flatbed + Stitchpunks. Structural inversion (labor-cost redirection), not rhetorical. Exemplar of Inversion Principle.
- `project_librarian_bookstore_metaphor.md` — Librarian = small-bookstore-owner who walks to the shelf on 2 words of title.
- `project_ecosystem_a_la_carte_pledge.md` — Pledge as synergistic ecosystem AND à la carte. "Add W, save $Y more" prompt. Choice-first.
- `project_rhetorical_keystones.md` — working registry. **12 ratified**; 1 pending Founder (D = Newmark-territorial vs cross-letter); 1 pending (G = "The way I learned things affected WHETHER I learned them"); 4 archive candidates (incl. "Please. :D" Scholz, "Remember the Cant" Doctorow).
- `project_cloyd_pattern.md` — Pre-extended trust repaid through demonstrated labor. Mr. Cloyd / Courtesy SSL / SSSS / Destination Housing unified. Founder-ratified; personal compensation intent to Cloyd family noted.
- `project_anachronism_principle.md` — Design method. 8 biographical instances (shape-note / aviation / saxophone 13th→1st / typing 15→55 wpm / 1997 internet call / seminary laptop / Cloyd layaway / Pre-BASIC with Cory). Founder-ratified.
- `feedback_build_for_long_haul.md` — "I always choose to BUILD FOR THE LONG HAUL." Durable > shortcut.
- `feedback_cephas_mirror_to_review.md` — Cephas drafts auto-mirror to FOUNDER_REVIEW for prose pass.
- MEMORY.md indexed all the above.

### Engineering
- **SP-18 Prose Provenance System** (`librarian-mcp/stitchpunks/sp18_prose_provenance.py`)
  - Deterministic Keystone + canonical-number + structure checks
  - Doc-type profiles: `letter` / `scaffold` / `proposal` / `tribute` / `generic` (per-type weights + check toggles)
  - Opus grader live (wired to Anthropic API via LockBox SDS.env; prompt caching on system prompt)
  - 3 empirical live runs committed; false-positive classes from day 1 resolved
- **Librarian MCP public repo** scaffolded at `LianaBanyanPlatform/librarian-mcp-public/`
  - README (measured claim, tiered pricing, MCP-first positioning)
  - LICENSE (AGPL-3.0 + Pledged Commons grant + Commercial path)
  - `src/librarian_mcp_server.py` (2 tools: `librarian_context` [stub → v0.2.0] + `prose_provenance` [live])
  - `docs/why-this-matters.md` (AI-policy page for Sanders/AOC datacenter-moratorium counter-example)
- **K420 → K421 executed** (Knight sessions, all green)
  - canonical count 2263 → 2267 (innovation), 222 → 225 (Crown Jewels) — **math check resolved B110 close: Founder explicitly ratified #2266/#2267 CJ status. "Explicitly, Yes. :D" No rollback needed; 225 stands.**
  - Initiative count 14/15 → 16 in letter_dispatch_queue (~16 rows fixed)
  - Gates HOLD enforced at 6 locations (absence)
  - Tatiana variant reconciliation: "In Honor Of" tribute = send-ready; missing second-letter file CREATED by Bishop at Cephas tributes path + mirrored to FOUNDER_REVIEW
  - #2263 + #2266 + #2267 INSERT migrations written (K421 wrote; K422 will apply)

### In flight (continuing past B110 close)
- **Knight K422** dispatched: (a) operationalize `librarian-mcp-public` repo (git init + `pip install mcp` + push to GitHub + tag v0.1.0-alpha), (b) apply K421's 5 unran migrations, (c) compile PROV_14_FILING_INVENTORY_B110.md, (d) standby for website issues
- **Pawn B70** dispatched: USPTO TM filing briefing / Sanders+AOC bills + staff contacts / Yale Apr 28 reg / INDL-NA + INDL-9 urgency / patent counsel fast-track for Prov 14 TODAY

### Drafts in FOUNDER_REVIEW awaiting Founder prose pass
1. **NYT op-ed scaffold** (~970 words, thesis A+C, 7 Keystones marked)
2. **R9 Pitch Block v2** (Paint/Librarian/Ecosystem + 2,300 grantee canonical)
3. **Tatiana second letter** ("to those who continue her work"; mirrored to FOUNDER_REVIEW)
4. SSSS Concept (B109)
5. Destination Housing / Mom letter (B109)
6. Canonical Laws B109 Additions (2 new laws)
7. Innovation #2266/#2267 Drafts (renamed post-K421)
8. Scott v014g Courtesy SSL Edit Proposal
9. R9 Pitch v1 (B109; retire after v2 ratified)

### TODAY action queue
Saved at `BISHOP_DROPZONE/00_FOUNDER_REVIEW/TODAY_APR20_ACTION_QUEUE_B110.md` — Founder / Bishop / Knight / Pawn lanes + deadlines table.

---

## 2. B111 priorities (in order)

### Immediate (20 min)
1. ✅ #2266/#2267 CJ status — Founder-ratified at B110 close ("Explicitly, Yes. :D"). 225 Crown Jewels canonical.
2. **Confirm Keystone D decision** (Newmark-territorial ◐ vs cross-letter ✓)
3. **Ratify or defer Keystone G** ("The way I learned things affected WHETHER I learned them")
4. **Enumerate website issues** so Knight K422 has a testing list

### This session (2-3 hours Founder engagement)
5. **Update NYT op-ed + Scott letter + Doctorow letter** with the thermometer framing Founder ratified late B110:
   - Thermometer = local-only token-savings meter; no registration gate; optional opt-in for commons dashboard
   - NYT: *"Every user has a personal meter — run it, check our math"* framing
   - Scott: *"Grantees see their own savings; self-evidencing grant case"*
   - Doctorow: anti-enshittification lead — *"A tool that measures its own value and shows the number to YOU"*
6. **Yale demo-table story** (Apr 28, 8 days) — Librarian MCP demo pitch, dashboard screenshot, Pledge one-pager
7. **Sanders/AOC staffer memo** (pending Pawn B70 contact list return) — 1-pager framing the measured counter-example
8. **Stage Knight K423** for (a) full R9 memory-packet architecture in `librarian_context` v0.2.0, (b) new `librarian_metrics` tool (local-JSONL, opt-in upload), (c) pyproject.toml + pip-installable packaging

### Near-term deadlines (from TODAY queue)
- **Apr 20 (TODAY):** Prov 14 filed, 2 TMs filed, Yale registered — Founder-external actions, Pawn B70 supporting
- **Apr 22–23:** Wave 1 Scott letter send window opens
- **Apr 28:** Yale AI Symposium (in person)
- **Apr 29:** INDL-NA (in person)
- **Apr 30:** INDL-9 Geneva abstract deadline
- **Nov 26, 2026:** Prov 13 conversion deadline — 7 months 6 days out

---

## 3. What NOT to touch in B111 without re-ratification

- `LianaBanyanPlatform/librarian-mcp-public/` — K422 is operationalizing; let it land the first public release before editing scaffold files
- `Cephas/cephas-hugo/content/tributes/tatiana-schlossberg-health-accords.md` — has a FOUNDER_REVIEW mirror; edits happen on the mirror first
- `canonical_values.yaml` — K421 just wrote it; K422 migrations will update DB to match; do not hand-edit
- Any K421 migration file — if rollback is needed, write a new migration that reverses, do not edit the applied one

---

## 4. Resumption prompt for B111

> **B111. Resume from B110 milestone. Read `BISHOP_DROPZONE/03_BishopHandoffs/MILESTONE_B110_CLOSEOUT.md` for full context. Priorities in order: (1) Founder ratifies or rolls back #2266/#2267 Crown Jewel self-promotion + Keystone D/G decisions + website issues list (~20 min); (2) update NYT op-ed + Scott letter + Doctorow letter with the thermometer framing (opt-in local meter, no registration gate); (3) Yale Apr 28 demo-table prep + Sanders/AOC staffer memo (using Pawn B70 return); (4) stage Knight K423 for full R9 architecture v0.2.0 in librarian_context + new librarian_metrics tool + pip-installable packaging. In flight: K422 (MCP repo + K421 migrations + Prov 14 inventory), Pawn B70 (USPTO + Sanders/AOC + Yale + counsel). Founder velocity: 3-month-per-day. Ask before spending. See you in B111.**

---

*Saved B110, April 20, 2026. Session clean. Architecture shipped. Dispatch queue live. For the Keep.*
