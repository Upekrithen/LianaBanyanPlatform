# Knight K428 — B115 Full-Dispatch Addendum
## `librarian.the2ndSecond.com` hosting + three-surface distribution + community primers
## Supersedes (where conflicting): [K428 B113 stub](./PROMPT_KNIGHT_K428_B113_LIBRARIAN_HOSTED_AND_DISTRIBUTION.md)
## Bishop B115 — 2026-04-22

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

## What changed since the B113 stub

Read the B113 stub first. It still governs everything not superseded below. Reality moved forward; this addendum trims completed work out of scope and adds what B114 ratified.

**Already done (NOT in your scope — do not redo):**

1. **PyPI publish** — `librarian-mcp 0.2.0` is LIVE (upload_time 2026-04-22T20:25:54Z). `pip install librarian-mcp` works worldwide. Stub Half B1 is complete. Skip it.
2. **GitHub org transfer** — repo is at `github.com/liana-banyan/librarian-mcp`. Tag `v0.2.0` on commit `f86e6a1`, `v0.2.1` pushed. Local origin remote already updated.
3. **Preload shipped in the wheel** — 22 files under `preload/` across 5 subdirectories (canonical, outreach, architecture, founder_voice, benchmark). You don't need to add preload content; you need to serve it.
4. **PYPI_API_TOKEN** in GitHub repo secrets. CI/publish workflows `.github/workflows/ci.yml` + `publish.yml` already staged and green.
5. **MirrorMirror DNS pattern precedent** — `mirrormirror.lianabanyan.com` CNAME → `lianabanyan-museum.web.app` was set up via Squarespace + Firebase cert minting B113. You can follow the same pattern for `librarian.the2ndsecond.com` IF the DNS provider allows (see DNS open question below).

**Newly ratified B114 that this dispatch now covers:**

6. **BOUNTIES.md + BUILDING_TOGETHER.md** — ship with launch. Converts would-be reverse-engineers into contributors. Added as Half C below.
7. **Chapter model naming** — landing copy must use the five naming axes correctly. See §Nomenclature below.
8. **Chapter 2 Mellon preview** — landing page should hint at Chapter 2 coming ~Day 5-7 post-launch, without committing to a hard date.
9. **Hybrid launch pacing** — Day 0 is Chapter 1 / Librarian / R9 / v0.2.0. This hosted surface is the Day 0 anchor.

---

## Scope — three halves, dispatchable in order but ship together

### Half A — `librarian.the2ndSecond.com` hosted MCP surface

Stub §Half A still governs **content** (lead copy, personification block, Eyewitness table, install commands, playground). The changes below are infrastructure + what's now unblocked.

**A0. DNS and Firebase notes** (canonical + one open question):

- **DNS:** `the2ndsecond.com` DNS is at **Squarespace**, like every LB domain. Founder-confirmed B115. Squarespace acquired the Google Domains business, so any `ns-cloud-*.googledomains.com` strings you see are Squarespace-served legacy records, not a separate provider. DNS panel: `account.squarespace.com/domains/managed/the2ndsecond.com/dns/dns-settings`. Follow the MirrorMirror pattern: CNAME `librarian.the2ndsecond.com` → `<firebase-site-name>.web.app` (site name depends on the Firebase-project question below).
- **Firebase project selection — resolve before adding the subdomain** (do not guess). `.firebaserc` in `LianaBanyanPlatform/platform/.firebaserc` shows `the2ndsecond` is a target under BOTH `lianabanyan-403dc` (→ site `the2ndsecond-trunk`) AND `mroz-74540` (→ site `the2ndsecond`). Determine which site currently serves apex `the2ndsecond.com` in production via `firebase hosting:sites:list` under each project, report findings, and add the `librarian` subdomain under the SAME project that serves the apex. Do not create a third site.

**A1. DNS + TLS** (stub §A1 still governs; Squarespace-Firebase pattern per MirrorMirror precedent IF provider allows)

**A2. Landing page (static)** — stub §A2 still governs with these additions:

- **Navigation teaser** for Chapter 2: a single line under the Eyewitness table, no date:
  > *Chapter 1: The Librarian is here. Chapter 2 — Mellon (Speak Friend and Enter) — multilingual retrieval across 110 languages. Coming soon.*
- **BOUNTIES.md link** in the footer nav alongside GitHub and PyPI badges.
- **Chapter naming axes** must appear consistently — see §Nomenclature below.

**A3. HTTP MCP transport** — stub §A3 still governs. Implementation note: `server.py` already uses FastMCP. The transport flip is `mcp.run(transport="streamable-http", host="0.0.0.0", port=PORT)` in a new entrypoint, NOT a rewrite of the tool definitions. Keep the stdio entrypoint (`python -m librarian_mcp`) intact for pip users.

- **Cloud Run** is the deploy target. Cloud Functions gen2 has stricter SSE timeouts; Cloud Run handles long-lived streaming correctly. This matches the build-for-long-haul preference over shortcut.
- Public read-only. Rate limit 60 req/min/IP at the edge (Cloud Run ingress or a lightweight middleware).
- No write paths in this release. `record_measurement` / `metrics_summary` / `opt_in_share` remain local-only on pip installs; the hosted surface exposes only `librarian_context` + `prose_provenance`.
- Log referrer + user-agent to structured logs for citation-traffic reporting (B5 below).

**A4. Minimal web playground** — stub §A4 still governs. Single change: the playground's "See the MCP JSON" reveal pane should label output as `Romulator 9000` (the variant ID, matching the chapter model naming axes).

### Half B — three-surface distribution

Stub §B1 (PyPI) is DONE. Remaining:

**B2. GitHub discoverability** — stub §B2 still governs. Do:
- Add repository topics: `mcp`, `mcp-server`, `llm-context`, `retrieval`, `anthropic-claude`, `cooperative-platform`.
- README hero block: install command at the very top; Eyewitness table second scroll; "try it without installing" link to `librarian.the2ndsecond.com`.
- Badges row: PyPI version, AGPL-3.0, Pledged Commons grant, CI-passing, GitHub stars.
- README footer: link to BOUNTIES.md and BUILDING_TOGETHER.md.

**B3. MCP registry listings** — stub §B3 still governs. Submit in this order so later listings can cite earlier ones:
1. **Smithery.ai** first (highest-traffic registry; PR-based submission)
2. **Glama.ai / mcp-get** second (cross-listing)
3. **`modelcontextprotocol/servers` community servers list** third (institutional validation layer; Anthropic-adjacent repo)

Each listing must link to both `librarian.the2ndsecond.com` (canonical page) AND the `liana-banyan/librarian-mcp` GitHub repo.

**B4. Announcement templates — STAGE ONLY, DO NOT POST** — stub §B4 still governs. Drafts go to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/`:
- `K428_SHOW_HN_TEMPLATE.md`
- `K428_LINKEDIN_TEMPLATE.md` (Founder account)
- `K428_MCP_DISCORD_TEMPLATE.md`

All three must preview Chapter 2 Mellon without committing to a date, and must include the Eyewitness numbers (86.1pp / κ 0.883 / 8 models × 4 vendors × 1,200 calls) verbatim.

**B5. Citation-traffic instrumentation** — four referrer logs must return queryable numbers within 24 hours of each surface going live:
- Direct visits to `librarian.the2ndsecond.com`
- PyPI downloads (`pypistats librarian-mcp` or equivalent)
- GitHub stars/clones delta (API pull)
- Smithery install count (registry API)

Stage a small `scripts/pull_launch_metrics.py` in the repo that hits all four and prints a table. Bishop will cite this in Crown letters.

### Half C — community primers (NEW, B114 ratified)

**C1. BOUNTIES.md** — add to repo root at `github.com/liana-banyan/librarian-mcp`. Structure (you fill the body; Founder expects ~60-80% rewrite on prose per drafts-as-scaffolding):

- **Why bounties exist** — positive-sum pull: convert would-be reverse-engineers into contributors. AGPL + Pledged Commons + bounty = participation, not piracy.
- **Bounty classes:**
  1. **Code bounties** — specific open issues (start with ~5; mark `good-first-bounty` vs `deep-bounty`)
  2. **Corpus contributions** — translation preloads, domain-specific preloads, provenance-grading rubrics
  3. **Benchmark replications** — reproduce R10 on a new model or new vendor; earns co-citation in the next Paper
  4. **Research extensions** — novel analyses on published metrics; co-authorship on future Papers
- **Pledged Commons grant requirement** — all bounty winners sign. Link to the grant text.
- **Payment rails** — USD (Stripe/Wise/PayPal), Credits (when member portal opens), or platform swag. Founder approves rate per bounty.
- **What NOT to bounty** — anything that compromises safety, attribution, or canonical ratification path.

**C2. BUILDING_TOGETHER.md** — add to repo root. Structure:

- **Audience:** someone who wants to use the Librarian in their own project AND contribute back upstream. Not reverse-engineers.
- Sections: *Running it yourself* / *Adding your own preload* / *Running the benchmark on your own corpus* / *Contributing a translation* / *Reporting a drift finding* / *Becoming a Member Keystone contributor* (link to Chapter 3 Paired Provenance as "not yet shipped, coming v0.4.0")
- Tone: "every town its own fab shop — and its own librarian" (Founder-approved lead from the2ndsecond.com copy). Framed around the à-la-carte-ecosystem pledge (see `project_ecosystem_a_la_carte_pledge.md` in memory).
- Link from the hosted landing page footer.

**C3. Five `good-first-bounty` issues** — open on GitHub with labels + $ amounts. Stub the issue bodies; Bishop will review before posting. Candidates (pick your own five if better):
1. Add a new preload file under `preload/founder_voice/` from published Pudding texts
2. Add a translation preload (pick one of ES/FR/PT/ZH) of `r9v2_base.md`
3. Add a CLI flag to `record_measurement` for bulk JSONL import
4. Add a test case demonstrating `prose_provenance` catching a removed Rhetorical Keystone
5. Add a GitHub Action that runs `pytest` on PRs from non-org contributors

---

## Nomenclature (enforce across all deliverables)

Use the five naming axes consistently. Mixing them is fine; inventing a sixth is not.

| Axis | Value (Chapter 1) | Audience |
|---|---|---|
| Chapter name | **The Librarian** | Marketing, landing copy |
| R-number | **R9** | HN, Reddit, developer framing |
| Romulator code | **9000** (base English) | Researcher / citation / internal tracking |
| Paper number | **#48** Eyewitness | Academic, press |
| Semver | **v0.2.0** | PyPI mechanical |

**Chapter 2 preview language ONLY:** "Chapter 2 — Mellon (*Speak Friend and Enter*) — multilingual retrieval." No R-number publicly until it ships. No Romulator code. No Paper number.

**Domain spelling:** `librarian.the2ndSecond.com` (camelCase for display; DNS is case-insensitive). "The 2nd Second Industrial Revolution" (spelled-out-then-numeric pattern).

**Personification pronoun:** "A librarian — that knows where your stuff is" ("that", not "she"). Founder-ratified B113.

---

## Acceptance criteria (updated)

- [ ] `librarian.the2ndSecond.com` resolves, serves the landing page, passes SSL Labs A-grade
- [ ] MCP endpoint at `librarian.the2ndSecond.com/mcp` accepts a real MCP client connection (Cursor or Claude Desktop) and returns a valid `librarian_context` response
- [ ] `pip install librarian-mcp` still works from PyPI in a fresh Python 3.10/3.11/3.12 venv (regression check — it works today, don't break it)
- [ ] GitHub repo shows six topic tags, badges row, BOUNTIES.md link, BUILDING_TOGETHER.md link
- [ ] Smithery listing live with install count; Glama/mcp-get + `modelcontextprotocol/servers` PRs submitted
- [ ] Landing page includes: lead copy, personification block, Eyewitness table, install command, playground, Chapter 2 teaser, footer with BOUNTIES + BUILDING_TOGETHER links
- [ ] Playground successfully processes a pasted `CANONICAL.md` and returns a formatted packet
- [ ] BOUNTIES.md + BUILDING_TOGETHER.md drafts in repo root; five `good-first-bounty` issues stubbed
- [ ] `scripts/pull_launch_metrics.py` returns non-empty results for all four surfaces
- [ ] Three announcement templates staged in `00_FOUNDER_REVIEW/` (NOT posted)

---

## Non-goals (unchanged from stub + one addition)

Stub §Non-goals still governs. Plus:

- **No Chapter 2 Mellon work.** Do not add multilingual preload. Do not add language routing. Mellon is a separate Knight (K430 or later). Teaser-only on the landing page.
- **No member Keystone write paths.** Chapter 3 (v0.4.0). Separate Knight.
- **No bounty program automation.** Manual admin for first five bounties; automation is a later Knight after Founder sees the contribution flow actually work once.

---

## Reporting requirements

Stub §Reporting requirements still governs. Plus:

8. Screenshot of Smithery listing with install count ≥ 1 (you install it from your own workstation if needed to bootstrap the counter)
9. First three PRs or issues opened on the repo by non-org contributors (if any within 72 hours)
10. Any bounty claim attempts within 72 hours + your screening notes
11. Cloud Run cost line for first 72 hours (so Bishop can project monthly cost for Herjavec-family-office-style inquiries)
12. DNS provider confirmed for `the2ndsecond.com` (update `project_dns_provider_split.md` in Bishop memory — tell Bishop which line to add)

---

## Upstream / downstream

- **Upstream complete:** K424 (librarian-mcp v0.2.0 + PyPI), K425 (secrets + SP-20 Pollinator), K426 (Red Carpet infra). All shipped.
- **Runs in parallel with:** K427 (Pedestal Stake Reg CF consumer portal; counsel-cleared full dispatch ready). No resource conflict.
- **Downstream blocked until K428 ships:**
  - Canada 40K V02 article references `librarian.the2ndsecond.com` — article cannot send before hosted surface resolves
  - NYT op-ed V02 — same
  - Sanders / AOC memo — same
  - Discord + Reddit launch posts (B114 decision) — wait for this Knight's templates to be Founder-approved
  - K430+ Chapter 2 Mellon dispatch — depends on hosted surface proving durable for one week minimum
- **External-facing:** every Crown letter going out after K428 ships can cite "run it yourself in 30 seconds at librarian.the2ndsecond.com" as a hard-verification moment. Changes the bar on senate staffer / family-office outreach.

---

## Session hygiene (BRIDLE Rule 2 + Founder feedback)

Run the librarian before you start. At Knight session start, call `mcp__librarian__run_session_start` with `agent=KNIGHT`, `session_id=K428`, `task="K428 full dispatch — hosted librarian surface + three-surface distribution + bounty primers"`. Then `mcp__librarian__brief_me` with a task description matching this dispatch. Read everything before touching infra.

If any of the stub's nomenclature or scope conflicts with this addendum, this addendum wins. If anything in this addendum conflicts with THE BRIDLE, THE BRIDLE wins.

Expect 60-80% Founder rewrite on prose in landing copy, BOUNTIES.md, BUILDING_TOGETHER.md, and the three announcement templates. Your drafts are structural scaffolding — Founder owns the voice. Leave anecdote hooks where a Founder story would anchor the point (Cloyd layaway, Pine Books, the aviation/saxophone/shape-note examples).

**One launch. No shortcuts. Never say "non-blocking." Fix everything before reporting done.**

---

*B115 full-dispatch addendum written 2026-04-22 by Bishop (Claude Opus 4.7, 1M context). Supersedes the B113 stub where conflicting. Dispatch-ready pending Founder send.*
