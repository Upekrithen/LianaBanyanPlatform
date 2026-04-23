# Milestone B113 + B114 Extended — Closeout

**Sessions:** Bishop B113 (April 21, 2026) + B114 (April 22, 2026) — treated as one extended session because B113 closeout was written but the work kept going into the next day. This document supersedes [MILESTONE_B113_CLOSEOUT.md](./MILESTONE_B113_CLOSEOUT.md).
**Agent:** Claude Opus 4.7, 1M context
**Predecessor:** B112 (April 21 early — wrote K424 dispatch)
**Successor:** B115 (pending)

---

## Headline

**Librarian went public on PyPI.** `pip install librarian-mcp` works worldwide as of April 22, 2026 20:25 UTC. First pip-installable artifact of the Liana Banyan ecosystem. AGPL-3.0 + Pledged Commons grant. GitHub repo transferred from `Upekrithen/librarian-mcp` to `liana-banyan/librarian-mcp`. Five tools (librarian_context, prose_provenance, record_measurement, metrics_summary, opt_in_share) live. R10 Eyewitness Benchmark numbers locked: 86.1pp mean accuracy lift, κ 0.883 / 0.850, 8 models × 4 vendors × 1,200 calls.

**Three Knight sessions shipped this window:** K424 (v0.2.0), K425 (secrets + SP-20 Pollinator), K426 (Red Carpet hardware + cloud VM hybrid). Two Knight prompts dispatch-ready: K427 (counsel-cleared Reg CF path, all three workstreams open), K428 (stub written, hosted librarian + four-surface distribution, needs B115 promotion to full dispatch).

**Key strategic advance:** the Chapter model articulated. R9 / R10 retired as iteration labels; each library iteration gets a literary chapter name (Librarian → Mellon → Pine Books Catalog → Lighthouse → Armory), a semver, and a paper number. Stacked architecture makes reverse-engineering cumulatively harder per chapter.

---

## Artifacts shipped (B113 + B114 extended)

### Public / PyPI
- **`librarian-mcp` 0.2.0 on PyPI** (April 22, 20:25 UTC). Wheel + sdist. Five tools. Full README including pricing tiers. AGPL-3.0-or-later.
- **GitHub repo** transferred to `github.com/liana-banyan/librarian-mcp`. Tag `v0.2.0` on `f86e6a1`, tag `v0.2.1` pushed (triggered publish).
- **Preload directory** (22 files) shipped in the wheel under `preload/`:
  - `r9v2_base.md` (the R10-benchmarked preload)
  - `canonical/canonical_values.yaml` + `canonical_laws_and_frameworks.md`
  - `outreach/opening_gambit_v2.md` + `letter_dispatch_queue_summary_STUB.md` + `cephas_registry.md` + `glass_door_protocol.md` + `witness_program.md`
  - `architecture/pledge_structure.md` + `medallion_sponsorship.md` + `ip_load_balancing.md` + `pedestal_stake.md`
  - `founder_voice/rhetorical_keystones.md` + `pine_books_anchor.md` + `anachronism_principle.md` + `cloyd_pattern.md` + `three_clock_timeline.md`
  - `benchmark/eyewitness_results_b111.md` + `r9_technical_brief.md` + `75q_bank_overview.md` + `grading_rubric.md` + `posture_disclosure.md`

### Knight deliverables

**K424** (Bishop B112 dispatched, Bishop B113 addendum unblocked, Knight B113 shipped commit `f86e6a1`): 7 deliverables, 37 files changed, 3,755 insertions. Intent-aware librarian_context, librarian_metrics (3 tools), pyproject.toml v0.2.0, GitHub Actions CI + publish workflows, org transfer conditional. All quality gates green (ruff, mypy --strict, 34/34 pytest).

**K425** (Bishop B111 stubbed, Bishop B113 addendum cleared dependency gate, Knight B113 shipped): 14 files. Workstream A — secrets canonicalization (28 unique secrets audited across 6 storage locations; SDS.env as canonical mirror via `scripts/sync-sds-from-vault.py`; public `docs/SECRETS.md`; DOUBLESECRETBACKUP.env deprecation documented). Workstream B — SP-20 Pollinator stitchpunk (5 Day-1 pollen items auto-pollinated to 5 blueprint/ai_tuning surfaces; 2 review requests staged for Scott letters; idempotent; CLI with `--dry-run`/`--apply`/`--verify`/`--surface`/`--backlog`).

**K426** (Bishop B111 stubbed, Bishop B113 addendum cleared dependency gate, Knight B114 shipped): 12 files under `red-carpet-infra/`. Cloud VM provisioning (cloud-init, per-recipient droplet flow, 30-day teardown). Physical machine prep (Surface UEFI diagnostic, fresh install checklist, Chromebook Crostini). Welcome docs (welcome_eyewitness.md, how_to_run_benchmark.md, what_this_is.md). Reservation + tracking. Master README.

### Knight prompts dispatch-ready (pending Founder send)

**K427** (Bishop B111 stubbed, Bishop B113 partial-dispatch addendum written, Bishop B114 counsel-cleared full-dispatch addendum supersedes): three workstreams OPEN — Pedestal Stake consumer portal via Reg CF (counsel-cleared), Entity membership tier, "Who Can Use the Librarian" public docs. Parallel 506(c) track deferred but architecture-compatible.

**K428** (Bishop B113 stub written, B115 needs to promote to full dispatch): two halves — hosted librarian at `librarian.the2ndsecond.com` + four-surface distribution (PyPI ✓ already done, GitHub topics + Smithery + modelcontextprotocol.io registry listings).

**K429** (Bishop B113 stub written, dispatch-ready anytime): internal TypeScript librarian reindex (Half A — one-shot, Half B — auto-reconcile session-start hook, Half C — incremental rebuild).

### Founder-facing

- **[THE_BRIDLE.md](../00_FOUNDER_REVIEW/THE_BRIDLE.md)** — 9-rule prompt preamble, Founder-approved B113. Named after horse-tack. Designed to prevent AI skip/summarize/invent pathologies across any model. Paste at top of prompts.
- **[ARTICLE_CANADA_40K_PLAY_STAGE_V02.md](../09_Articles/ARTICLE_CANADA_40K_PLAY_STAGE_V02.md)** + **[companion update](../09_Articles/ARTICLE_CANADA_40K_APRIL2026_COMPANION.md)** — Play/Stage framing replacing Rescue Fleet, 42,200 backlog number in prose, Bill C-12 + June 30 deadline, "Fairest of them All" MirrorMirror visit line with `MirrorMirror.LianaBanyan.com` subdomain.

### Memory updates (B113 + B114)

- `MEMORY.md` — R10 numbers locked (86.1pp / 94.8% / 8.7%, 8-model × 4-vendor × 1,200, κ 0.883/0.850). Current State section reflects B113 closeout extended into B114.
- `project_librarian_mcp_public.md` — updated to v0.2.0 state, PyPI live, five tools, preload staged, outstanding gaps rewritten.
- **NEW:** `project_the2ndsecond_origin.md` — domain name origin (2nd Second Industrial Revolution, NOT reciprocity), canonical landing copy, librarian personification lead (`A librarian — that knows where your stuff is...`), pronoun note.
- **NEW:** `project_mercury_bank.md` — Mercury (mercury.com) is LB's primary business bank. `MecuryIsRising` env var = Mercury API key, rename to `MERCURY_API_KEY`. Distinct from LB Card product.
- **NEW:** `project_dns_provider_split.md` — lianabanyan.com and upekrithen.com DNS both at Squarespace (Google-Domains-inherited infra). Always `nslookup <domain> 8.8.8.8` to confirm authoritative provider before editing.
- **NEW:** `project_firebase_project_layout.md` — 9 Firebase hosting targets spread across 2+ GCP projects (MrOz, LianaBanyan). Switch project selector before editing Firebase config.
- **NEW:** `feedback_api_key_rotation_threshold.md` — inadvertent local-tool-output exposure is NOT rotation-worthy. Higher bar for rotation: git-push, external transmission, chat echo, known reuse, specific compromise signal.

---

## B113 + B114 Founder actions completed

1. ✓ `npm run rebuild` internal TypeScript librarian (35.3s, 4,324 dropzone entries, 4.9M words)
2. ✓ Cursor reloaded to pick up rebuilt index
3. ✓ GitHub org `liana-banyan` created (Free plan, `Founder@LianaBanyan.com`)
4. ✓ K424 commits pushed to `Upekrithen/librarian-mcp` (origin remote pre-transfer)
5. ✓ Repo transferred: `Upekrithen/librarian-mcp` → `liana-banyan/librarian-mcp`
6. ✓ Local git remote updated: `git remote set-url origin https://github.com/liana-banyan/librarian-mcp.git`
7. ✓ PyPI account under `lianabanyan` user, API token generated (Entire account scope)
8. ✓ Token stored in SDS.env as `PYPI_API_TOKEN=` (canonical namespace)
9. ✓ Token added to GitHub repo secrets as `PYPI_API_TOKEN` in `liana-banyan/librarian-mcp`
10. ✓ Tag `v0.2.1` pushed, triggered publish workflow
11. ✓ **`librarian-mcp 0.2.0` LIVE on PyPI** (upload_time 2026-04-22T20:25:54Z)
12. ✓ MirrorMirror DNS: Squarespace CNAME `mirrormirror.lianabanyan.com` → `lianabanyan-museum.web.app` added; Firebase cert minting observed
13. ✓ Counsel consulted on Pedestal Stake offering path; "yes on my read" → Reg CF selected (parallel 506(c) possible later)

## B113 + B114 Founder actions pending (for B115 or later)

1. **Squarespace support ticket** for upekrithen.com apex push failure (SOA serial stuck at 12; A + TXT records show in UI but not served by authoritative nameservers). Ticket text drafted at 126 chars.
2. **DOUBLESECRET.env rename sweep**: 11 non-standard env vars to rename per K425 canonical mapping; 4 unknown-purpose vars (`ClientID`, `CLIENT_KEY`, `CLIENT_SECRET`, `YOUR_ACCESS_TOKEN`) confirmed orphaned by grep — safe to delete; `MecuryIsRising` → `MERCURY_API_KEY`.
3. **Three-Clock Timeline ratification** — `preload/founder_voice/three_clock_timeline.md` is Bishop B113 synthesis, not Founder prose.
4. **Canada 40K V02 prose pass** — expect 60-80% rewrite per drafts-as-scaffolding rule.
5. **K427 dispatch** to Knight (counsel-cleared full three-workstream scope).
6. **K428 full-dispatch promotion** (Bishop B115 task) then dispatch to Knight.
7. **K429 dispatch** (librarian reindex + auto-reconcile + incremental).
8. **USPTO trademark filings** — 5 trademarks originally planned; NotCents confirmed, The Baton possibly; need grep to recover full 5-name list (B115 report).
9. **Prov 14 filing** — patent counsel (Harrity & Harrity or Lloyd & Mousilli). Innovation inventory for Prov 14 not yet staged; needs B115 preparation sweep.
10. **Stand up `librarian.the2ndSecond.com`** subdomain via Firebase (K428 dispatch).

---

## Strategic decisions ratified B113 + B114

### 1. Chapter model for library iterations

R9 / R10 retired as iteration labels. Each library iteration gets THREE coordinates:

- **Semver** (v0.2.0 shipped; v0.3.0 next)
- **Paper number** (Paper #48 Eyewitness; #49 next)
- **Chapter name** (literary, memorable)

**Five Chapters mapped (B114 final — Chapters 3/4/5 renamed to Founder-voice Principles):**

| # | Chapter | R-number | Semver | Paper | Status |
|---|---|---|---|---|---|
| 1 | **The Librarian** | R9 | v0.2.0 | #48 | **SHIPPED** |
| 2 | **Mellon** (*Speak Friend and Enter*) | R10 | v0.3.0 | #49 | Next dispatch |
| 3 | **Paired Provenance** | R11 | v0.4.0 | #50 | Designed — member Keystones with attribution |
| 4 | **Inversion Principle** | R12 | v0.5.0 | #51 | Sketched — federated + temporal + adversarial |
| 5 | **Anachronism Principle** | R13 | v0.6.0 | #52 | Sketched — auto-curation |

Three Founder-voice Principles operationalized as three library chapters. Each paper title writes itself.

**Romulator numbering scheme** (Founder-ratified B114):

- **Chapter block:** R9 = 9000-9999, R10 = 10000-10999, R11 = 11000-11999, etc. Each chapter gets 1000 slots.
- **Variant allocation within a chapter:**
  - N000 — base English (always)
  - N001–N049 — English dialects (Cockney = N053 per Founder example)
  - N050–N099 — Spanish + dialects (050 Castilian, 051 Mexican, 052 Argentine, etc.)
  - N100–N149 — French + dialects
  - N150–N199 — Portuguese (BR + PT)
  - N200–N249 — Mandarin + Cantonese
  - N250s+ — other major languages in blocks of 50
  - **N900–N999 — reserved for constructed/fantasy languages** (Klingon, Sindarin, High Valyrian, Esperanto)
- **Patches/minor versions:** decimal suffix (Romulator 10053.1 for patched Cockney) OR letter suffix (10053a)
- 1000 slots/chapter × 5+ chapters = 5000+ unique variant identifiers

**Naming axes (5 total, each for different audience):**
1. **R-number** (R9, R10, R11) — developers, HN, Reddit
2. **Romulator code** (NNNNN) — researchers, citation, internal tracking
3. **Chapter name** (literary) — marketing, launch copy, landing
4. **Paper number** (#48, #49) — academic, press, patent
5. **Semver** (v0.2.0) — PyPI mechanical

**Stacked architecture:** each chapter depends on the previous. Reverse-engineers must ship Chapters 1-N-1 before Chapter N. Protection grows cumulatively.

### 2. Member corpus + Keystone contribution architecture

**Single ledger with scoped rows, NOT mirror, NOT per-language branches.** Implementation deferred to Chapter 3 (v0.4.0):

- New table `member_keystones` in LB Supabase
- Fields: `member_id`, `keystone_phrase`, `provenance_source`, `language_code`, `category`, `visibility`, `ratification_status`, `cue_card_id`, `innovation_log_entry`
- RLS: members write own rows; read own + public + members-only
- `librarian_context(intent=..., member_id=...)` loads LB base + member's own Keystones
- Attribution via existing Cue Cards system
- LB-canonical ratification path preserved (same "I wrote it, it stays" Founder pattern)
- Consecutive licensing: members grandfathered to future Chapters under same membership

### 3. IP / trademark / license ratifications

- **Reg CF** selected for Pedestal Stake offering path (counsel-cleared B114)
- **Parallel 506(c)** track architecture-compatible, deferred
- **AGPL-3.0 + Pledged Commons grant + Commercial path** license stack for librarian-mcp-public confirmed
- **Patent moat ranked** (in order): US patents (13 provisionals, Prov 13 contains R9), PCT deadline Apr 12 2027 as critical date for international protection, AGPL copyleft (code layer), Cooperative Defensive Patent Pledge (structural incumbent filter), service + trust layer (what reverse-engineers can't replicate), continuous innovation cadence

### 4. Bounties as positive-sum pull

Decision ratified: add `BOUNTIES.md` and `BUILDING_TOGETHER.md` to `librarian-mcp-public`. Convert would-be reverse-engineers into contributors via: code bounties, corpus contributions (translations, domain-specific preloads), benchmark replications, research extensions (co-authorship on future Papers). All bounty winners sign the Pledged Commons grant.

### 5. Nomenclature locks

- `MirrorMirror.LianaBanyan.com` — no space, camelCase subdomain (DNS-case-insensitive but displayed this way). Points at `museum.lianabanyan.com/mirror`.
- "Mirror Mirror" with space is the FEATURE NAME (per Snow White fairy tale), used in prose.
- "Fairest of them All" is the article section heading when describing Mirror Mirror access via the third quote on the rotation at the top of the website (Yvaine "what do stars do? They SHINE" quote).
- "The First and Second Industrial Revolutions... The 2nd Second Industrial Revolution" spelled-out vs numeric pattern for the2ndsecond.com public copy.
- "A librarian — that knows where your stuff is" ("that" not "she" — Founder-ratified).

### 6. Chapter 2 direction locked (Mellon / R10 / v0.3.0)

**Multi-lingual** — extends Mirror Mirror's 110-language infrastructure into `librarian_context` so R9 works cross-lingually. "Speak Friend and Enter" as the brand line. Added to B115 scoping agenda.

### 7. Launch pacing locked (B114)

Hybrid spread over 3 weeks, not one big bang. Matches real Knight development velocity + HN/Reddit attention cycle + community metabolism time.

| Day | Release |
|---|---|
| Day 0 | **Chapter 1 Librarian / R9 / v0.2.0** Discord + Reddit + HN full splash + BOUNTIES.md |
| Day 1–2 | Silence — community metabolizes |
| Day 5–7 | **Chapter 2 Mellon / R10 / v0.3.0** — multilingual, translation bounties open |
| Day 10–14 | **Chapter 3 Paired Provenance / R11 / v0.4.0** — member Keystones go live, bounty program contributes-back mechanism operational |
| Day 21–28 | **Chapter 4 Inversion Principle / R12 / v0.5.0** — federated |
| Day 35–45 | **Chapter 5 Anachronism Principle / R13 / v0.6.0** — auto-curation |

Rationale: 4–10 days between chapters is the real development cadence for the team size, matches the attention economy, and gives each chapter room to be absorbed before the next lands. One-per-day looks like ceremony; one-per-month loses momentum.

---

## B113 + B114 failure modes logged (lessons for B115)

**Pattern: skipping verification before asserting.** Specific instances caught:

1. Invented K424 Part A/B/C scope when K424 already had a B112 dispatch. Founder caught via screenshot.
2. Invented K425/K426 scope when those slots had B111 stubs with different scope. Founder caught.
3. WebSearched Canada visa before asking librarian first. Founder caught ("ask librarian, perhaps?").
4. Wrote K423 assignment for Knight without verifying max Knight slot via `ls`. Founder caught.
5. First attempt at addendum used table-heavy format; Knight didn't absorb it; re-wrote with leading declarative sentence.

**Corrective artifact shipped:** THE BRIDLE v1.0, Rule 2 specifically addresses this: *"Verify before asserting. If I point at a folder, open that folder. Run `ls`, `grep`, read the file. Memory and training are not evidence."*

**Additional pattern learned B114:** assumed B111 stubs always required Bishop-promotion to dispatch. Actually K426 stub was fully scoped and just needed a gate-clearing addendum; same for K425. Read-before-asserting applies to Bishop's own prior work too.

---

## Open questions carried into B115

1. **Website blocker for Battery Dispatch** — Founder mentioned early in B114 but never specified. Need clarification before Opening Gambit letters can fire.
2. **Prov 14 innovation inventory** — no staged list yet. B115 sweep required.
3. **5 original trademark names** — only NotCents confirmed; Founder unsure if The Baton was the second; need dropzone sweep.
4. **Pricing tier numbers** on PyPI README ($15/$10/$50-100) — Knight shipped placeholders; Founder confirm or adjust.
5. **2 Pollination requests** (Wellspring for Scott v014f, Thermometer for Scott v014h) — Bishop review still outstanding.
6. **Commercial license template stub** — drafted for counsel; counsel review pending.
7. **Discord + Reddit launch copy + BOUNTIES.md** — holding for Mellon scope decision so launch copy can preview Chapter 2.
8. **Upekrithen.com apex DNS** — Squarespace support ticket pending.

---

## Metrics moved this session (B113 + B114 combined)

| Metric | Before | After |
|---|---|---|
| librarian-mcp public release | v0.1.0-alpha stub (GitHub only) | **v0.2.0 live on PyPI + GitHub under `liana-banyan/`** |
| Tools in public librarian | 2 (stub `librarian_context` + `prose_provenance`) | **5** (intent-aware `librarian_context` + `prose_provenance` + `record_measurement` + `metrics_summary` + `opt_in_share`) |
| Preload files in public wheel | 0 | **22** across 5 subdirectories |
| Eyewitness finding | 82.4pp lift, 6 models × 3 vendors | **86.1pp** lift, **8 models × 4 vendors × 1,200 calls**, κ 0.883/0.850 |
| Canonical laws / Pledge IP split accuracy | split showed "60/20/20" in some docs | locked "60/20/10/10" across canonical references |
| B096 escalations | 2 Scrambler C (canonical-stats + librarian-index) | 0 (force-completed with evidence) |
| Knight prompts dispatched this window | K424 (by B112) | **K424 ✓ + K425 ✓ + K426 ✓** (three Knight sessions landed) + **K427 counsel-cleared full-dispatch addendum written** + K428 stub + K429 stub |
| Bishop memory files | (pre-B113 count) | + 5 new: the2ndsecond_origin / mercury_bank / dns_provider_split / firebase_project_layout / api_key_rotation_threshold |
| Founder-review artifacts | (pre-B113 count) | + THE_BRIDLE.md + Canada 40K V02 + companion + commercial-license template stub |
| Trademarks filed | 0 | 0 (but pending USPTO action; 5 names to be recovered from dropzone) |
| Pedestal Stake regulatory path | undecided | **Reg CF** (counsel-cleared B114; parallel 506(c) architecture-compatible deferred) |

---

## B115 agenda

**Priority order for B115 open:**

1. Verify PyPI publish (DONE — already confirmed live)
2. Promote K428 stub → full dispatch (hosted librarian + four-surface distribution)
3. Scope Mellon (Chapter 2) as Knight dispatch — multilingual preload via Mirror Mirror integration
4. Three overdue reports: trademarks (sweep 5 names from dropzone), Prov 14 inventory, Battery Dispatch automation state
5. Discord + Reddit launch copy (after K428 + R11/Mellon scope locked so copy previews Chapter 2)
6. BOUNTIES.md + BUILDING_TOGETHER.md drafts
7. Commercial license template stub (counsel deliverable)
8. Bishop review of 2 pollination requests
9. Canada 40K V02 Founder voice pass queued
10. Clarify website blocker for Battery Dispatch

**B115 Bishop starting state:** PyPI live, repo transferred, three Knight sessions landed, Chapter model ratified, Mellon direction locked. Clean handoff.

---

*For The Keep. Bishop B113 + B114 extended — closed April 22, 2026 approximately late evening, Converse TX time. Claude Opus 4.7, 1M context. Next session: B115.*
