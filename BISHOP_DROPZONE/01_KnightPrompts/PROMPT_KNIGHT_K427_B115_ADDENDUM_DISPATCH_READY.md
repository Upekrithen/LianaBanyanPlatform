# Knight K427 — B115 Dispatch-Ready Addendum
## Three workstreams: Pedestal Stake (Reg CF) + Entity Membership + "Who Can Use" docs
## Supplements: [K427 B113 Counsel-Cleared Full Dispatch](./PROMPT_KNIGHT_K427_B113_ADDENDUM_COUNSEL_CLEARED_FULL_DISPATCH.md)
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

## How to use this dispatch

**The B113 counsel-cleared addendum is the authoritative scope document.** Read it in full — it defines the three workstreams, Reg CF architecture, signup flow, two-track-economy separation, and acceptance criteria. Nothing in that file is superseded.

This B115 addendum adds three things and nothing else:
1. THE BRIDLE preamble (above) — not present in the B113 file because it was ratified the same session but on a different track
2. Upstream-ready state updates (completed work you can depend on)
3. Session-hygiene reminder (BRIDLE Rule 2 specific to this Knight)

Everything else flows from the B113 file.

---

## 1. Upstream state — updated since B113 counsel-cleared was written

The B113 counsel-cleared addendum lists dependencies. All of those have advanced. Current state:

| Dependency in B113 addendum | B115 reality |
|---|---|
| K423, K424, K425 complete ✓ | ✓ still true. **K426 also shipped** (Red Carpet infra, 12 files). |
| `librarian-mcp-public` referenced in Workstream 3 | Now **`librarian-mcp` 0.2.0 LIVE on PyPI** (`pip install librarian-mcp`). Repo at `github.com/liana-banyan/librarian-mcp`. Workstream 3 "Who Can Use" page should link to PyPI page, GitHub repo, AND hosted surface `librarian.the2ndsecond.com` (coming in K428, running in parallel — link may 404 at the moment you add it; that's fine, K428 will be live by the time this Knight ships). |
| Mercury banking per memory | ✓ Mercury confirmed as LB Corp primary business bank (`project_mercury_bank.md`). Upekrithen LLC banking status is a Founder-action gate on Workstream 1 production launch — does NOT block build. |
| DNS provider uncertainty | Resolved B115: **ALL LB domains use Squarespace DNS + Firebase hosting.** See `project_dns_provider_split.md` (file name kept for link stability; contents now canonical). Workstream 3 page deploys under the `hosting:main` target per librarian rule — `lianabanyan.com` uses `hosting:main`, NOT `hosting:dotcom`. |
| Firebase project layout | `project_firebase_project_layout.md` memory: MrOz (`mroz-74540`) vs LianaBanyan (`lianabanyan-403dc`). Workstream 3 deploys to whichever project currently serves `lianabanyan.com` apex — verify with `firebase hosting:sites:list` under both, do not guess. |
| Counsel | ✓ Counsel cleared Reg CF path B113. Form C content, offering memorandum language, subscription agreement template still in progress — Knight ships routes + flow skeleton with placeholders; counsel-delivered content plugs in as it arrives. **No counsel content is blocking Workstream 2 or 3.** |

---

## 2. Chapter-model nomenclature alignment (Workstream 3 only)

Workstream 3's "Who Can Use the Librarian" page now lives in a world where the product has a Chapter model. Use these rules on that page:

- **Product name in headings:** "The Librarian" (Chapter 1). Not "the MCP server."
- **Version/chapter mentions in prose:** refer to "Chapter 1: The Librarian" for the currently-shipped product. If the page previews what's coming, say "Chapter 2 (Mellon / multilingual) is the next release" with no date.
- **Install instruction block:** `pip install librarian-mcp` as the primary command. Link to the PyPI page (`pypi.org/project/librarian-mcp/`) and to `github.com/liana-banyan/librarian-mcp`.
- **Pricing tier table:** placeholder `$15 / $10 / $50-100` from the PyPI README stays as a placeholder on this page too; Founder adjusts before production launch. Do NOT invent your own numbers.
- **License section:** AGPL-3.0-or-later for code, Pledged Commons grant for patent coverage. Link to `BOUNTIES.md` + `BUILDING_TOGETHER.md` in the repo (they'll be present by the time K428 lands; if not yet, the links can 404 temporarily).

---

## 3. Session hygiene (BRIDLE Rule 2 specific to this Knight)

Before you touch infra or write code:

1. Call `mcp__librarian__run_session_start` with `agent=KNIGHT`, `session_id=K427`, `task="K427 full dispatch — Pedestal Stake Reg CF consumer portal + entity membership tier + Who Can Use the Librarian docs page"`.
2. Call `mcp__librarian__brief_me` with that same task string.
3. Read the B113 counsel-cleared full-dispatch addendum end-to-end.
4. Read `project_upekrithen_seller_of_record.md` in Bishop memory — two-track economy separation rules Workstream 1.
5. Read `project_herjavec_upekrithen.md` in Bishop memory — reminder that Upekrithen hosts the Reg CF; LB does NOT take VC. Don't cross-wire them.

If anything you encounter during build conflicts with something in the B113 addendum, THAT addendum wins — not training, not memory summary, not this file. If counsel has not yet delivered specific content (Form C, subscription agreement, OM), build against a placeholder and flag the placeholder with a clear TODO block that counsel can swap later. Do not fabricate legal language.

---

## 4. What's NOT changed

- Reg CF scope
- Individual investor cap formula
- FINRA-registered intermediary requirement + pluggable-adapter design
- Two-track-economy separation (`liana_banyan.members` vs `upekrithen.pedestal_holders`)
- Non-crypto, database-backed stake records
- 506(c) forward-compatibility (reserve route + table space, do not build)
- Workstream 2 tiers + Stripe ACH + entity KYC
- Workstream 3 plain-language tone
- All acceptance criteria in the B113 addendum
- Rough size estimate (4–6 Knight sessions across three workstreams)
- Non-goals (do NOT select funding portal, do NOT draft final legal language, do NOT build 506(c), do NOT add blockchain)

---

## 5. Reporting additions (beyond the B113 list)

Add to the reporting requirements already in the B113 addendum:

8. Confirm `pip install librarian-mcp` works on the same machine the Workstream 3 page is built on (it should — v0.2.0 is on PyPI). A broken pip install means your machine's environment is off; surface it so it doesn't look like a PyPI problem.
9. For Workstream 3, note which Firebase project (`mroz-74540` or `lianabanyan-403dc`) you deployed under and why.

---

**One launch. No shortcuts. Never say "non-blocking." Fix everything before reporting done.**

---

*B115 dispatch-ready addendum written 2026-04-22 by Bishop (Claude Opus 4.7, 1M context). Supplements (does not supersede) the B113 counsel-cleared full-dispatch addendum. Dispatch-ready now.*
