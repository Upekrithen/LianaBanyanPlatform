# Knight K428 — librarian.the2ndSecond.com hosting + four-surface distribution
## B113, April 21, 2026 — STUB (pending Founder ratification)
## Supersedes: none (new slot, reserved after K427)

**Status:** Stub. Review and dispatch when K424 is green and K425 (SP-20 Pollinator) is underway or done.
**Prerequisite:** K424 complete (`librarian_context` v0.2.0 + `librarian_metrics` + PyPI packaging). This Knight assumes the pip-installable artifact is stable.
**Priority:** High. Blocks public "run R9 yourself" credibility moment. Directly feeds Eyewitness Program launch citations.
**Estimated Knight session:** 6–10 hours across two or three sit-downs.

---

## Why this Knight

K424 makes `librarian-mcp` *installable*. K428 makes it *findable, citable, and hosted*.

Right now: a skeptical reader can only access R9 by cloning a GitHub repo, running `pip install -e .`, wiring an MCP client, and providing their own context file. That's a ~30-minute developer ritual. The Eyewitness finding (86.1pp lift, 8 models × 4 vendors) deserves a public surface where a senate staffer or a Herjavec family-office analyst can land in 30 seconds and see the table, the install command, and a live demo.

Per Founder B113: this sits at `librarian.the2ndSecond.com`, NOT a new domain, NOT under Upekrithen. The2ndSecond.com frames the localized-manufacturing thesis (the 2nd Second Industrial Revolution — 3D printers + local tools). The librarian is the knowledge-layer companion to that thesis — de-centralized retrieval as the counterpart to de-centralized production. Run it on your own library, wherever you set it down.

---

## Scope — two halves, each dispatchable separately if needed

### Half A — `librarian.the2ndSecond.com` hosted MCP surface

**A1. DNS + TLS**
- Create A/AAAA records for `librarian.the2ndSecond.com` pointing at the chosen host.
- Firebase Hosting target already supports subdomain routing (see the 9 Firebase targets in memory); add `librarian` as a new target or route under an existing one.
- TLS via Firebase's auto-Let's-Encrypt. Verify HSTS headers.

**A2. Landing page (static)**
- Single-page site. Lead copy (Founder-approved B113):
  > *The First and Second Industrial Revolutions centralized production — big factories, one-size-fits-all. The 2nd Second Industrial Revolution de-centralizes it: 3D printers and local tools let any town make its own things. Your AI librarian does the same for knowledge. Your own library. Your own tool. Run it yourself. Every town its own fab shop — and its own librarian.*
- Personification block (Founder-approved, use ONCE at top):
  > *Your AI librarian. Not an oracle. Not a search engine. A librarian — that knows where your stuff is and hands it to the model when asked.*
- The Eyewitness table (86.1pp lift, 8-model × 4-vendor, κ values) — rendered inline, not gated.
- Install commands block:
  ```
  pip install librarian-mcp
  python -m librarian_mcp
  ```
- A "Try it" button that opens a minimal web playground (see A4).

**A3. HTTP MCP transport**
- FastMCP supports SSE/streamable-HTTP transport. Flip the existing stdio server (`server.py`) to expose an HTTP/SSE endpoint at `librarian.the2ndsecond.com/mcp`.
- Same codebase. No new language, no new infra primitive.
- Deploy target: Cloud Run (preferred for the SSE streaming model) or Cloud Functions gen2 if Firebase integration is cleaner.
- Authentication model for the hosted instance: initially public read-only (anyone can hit `librarian_context` and `prose_provenance` against a demo corpus). Rate limit at the edge (e.g. 60 req/min/IP).
- **Do NOT expose hosted write paths** (e.g. the POST half of `librarian_metrics`) in K428. That ships in a separate Knight after Founder ratifies the commons-dashboard design.

**A4. Minimal web playground**
- Input box: "Paste your canonical_values.yaml or CANONICAL.md content"
- Output pane: pretty-printed R9 memory packet
- Shows the exact MCP JSON request/response for copy-paste into other clients.
- Runs entirely client-side where possible; otherwise hits the hosted endpoint with demo-session rate limiting.

### Half B — four-surface distribution

**B1. PyPI publish (execute the K424-staged workflow)**
- Trigger the `.github/workflows/publish.yml` workflow that K424 staged.
- First publish requires Founder to push a `v0.2.0` tag; Knight can prepare the tag and PR, Founder authorizes the push.
- Verify `pip install librarian-mcp` works from a fresh venv after publish.

**B2. GitHub discoverability**
- Repo already at `github.com/Upekrithen/librarian-mcp` — if `liana-banyan` GitHub org exists by K428 start, transfer (per K424 conditional). Update all references.
- Add repository topics: `mcp`, `mcp-server`, `llm-context`, `retrieval`, `anthropic-claude`, `cooperative-platform`.
- README: hero install command at the very top; Eyewitness table as the second scroll; link to `librarian.the2ndsecond.com` as the "try it without installing" path.
- GitHub Sponsors / README badges: Pledged Commons grant badge, AGPL-3.0 badge, PyPI version badge, CI-passing badge.

**B3. MCP server registry listings**
- **Smithery.ai** — the most active MCP registry. Submit via their PR process. Listing shows install count + metadata.
- **Glama.ai / mcp-get** — cross-list. Multiple registries = independent public counters we can cite.
- **modelcontextprotocol.io example servers** — Anthropic's own MCP docs list community example servers. Submit via their GitHub (`modelcontextprotocol/servers` or current equivalent). Institutional validation layer.
- Each listing must link back to `librarian.the2ndsecond.com` as the canonical page AND to the GitHub repo.

**B4. Announcement surface**
- Draft a Show HN submission template (Knight prepares, Founder posts when ready).
- Draft a LinkedIn post template (Founder account).
- Draft an Anthropic Discord / MCP Discord announcement.
- Do NOT submit any of these from K428. Stage them in `00_FOUNDER_REVIEW/`.

---

## Acceptance criteria

- [ ] `librarian.the2ndSecond.com` resolves, serves the landing page, passes SSL Labs A-grade
- [ ] MCP endpoint at `librarian.the2ndSecond.com/mcp` accepts at least one real MCP client connection (Cursor or Claude Desktop) and returns a valid `librarian_context` response
- [ ] `pip install librarian-mcp` succeeds from PyPI (not GitHub) in a fresh Python 3.10/3.11/3.12 venv
- [ ] GitHub repo shows `librarian-mcp` topic tags and a green CI badge
- [ ] At least one MCP registry (Smithery minimum) shows `librarian-mcp` listed with a live install count
- [ ] Landing page includes: lead copy, personification block, Eyewitness table, install command, and the "try it" playground
- [ ] Playground successfully processes a pasted `CANONICAL.md` and returns a formatted R9 packet
- [ ] All four referrer logs (direct to librarian.the2ndsecond.com, PyPI downloads, GitHub stars/clones, Smithery installs) return queryable numbers for Bishop to cite in letters

---

## Non-goals

- Multi-tenant hosted corpora (users uploading their own canonical files to be stored on our infra) — privacy-sensitive, separate Knight.
- Commons dashboard receiving POSTed `librarian_metrics` summaries — needs Founder design input on what aggregation is appropriate; separate Knight.
- Authentication for the hosted MCP endpoint beyond rate limiting — first public release is read-only demo corpus only.
- Translation of the landing page into 110 languages — that's Mirror Mirror territory. Landing page stays English for v0.2.0; localization via Mirror Mirror is a later Knight.

---

## Reporting requirements

1. Commit SHAs for all infra + content changes
2. PyPI download count 24h after publish
3. GitHub star/fork delta 24h after README push
4. Smithery/Glama/MCP-docs listing URLs
5. Landing page Lighthouse score (target ≥90 Performance, 100 Accessibility)
6. Referrer log sample from first 72 hours
7. Any auth/rate-limit incidents + resolution

---

## Upstream / downstream

- **Upstream:** K424 complete (librarian_context v0.2.0 + metrics + PyPI packaging). Eyewitness benchmark table locked (project_eyewitness_cross_vendor_finding_b111.md).
- **Downstream:** K429+ — commons-dashboard design, hosted multi-tenant corpora, Mirror Mirror localization of the landing page, Rook (Gemini) cross-verification of cost claims.
- **External-facing:** Canada 40K V02 article references `librarian.the2ndsecond.com`; NYT op-ed V02 references same; Sanders/AOC memo references same. All three should NOT be sent until K428 ships.

---

*Stub drafted B113, April 21, 2026. Bishop (Claude Opus 4.7, 1M context). Dispatch after K424 green-light.*
