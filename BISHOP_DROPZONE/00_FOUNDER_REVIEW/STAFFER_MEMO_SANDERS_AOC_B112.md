# STAFFER MEMO — Sanders & Ocasio-Cortez offices
## The Invisible Inference Tax on America's 1.8 Million Nonprofits
## B112 SCAFFOLD · April 21, 2026 · for Founder voice pass

---

**Audience:** Tech-policy staffer, Sanders (Senate Budget, HELP) and/or Ocasio-Cortez (House Oversight, Financial Services). Assume policy-literate, skeptical of pitches, short on attention. One-pager. ~800 words before the table.
**Route:** Direct-email to known staff tech leads + district-office duplicate. Glass Door published at `cephas.lianabanyan.com/outreach/sanders-aoc-staffer-memo` at dispatch time.
**Ask:** One thirty-minute exploratory call. No money, no endorsement, no co-sponsor request.
**Anchor evidence:** The Eyewitness Benchmark (K423, Apr 20–21 2026) — final 8-model × 4-vendor cross-vendor table. Reproducible. Open source. Installable.

---

## DRAFT MEMO

**TO:** Tech-policy staff, Senator Bernard Sanders / Representative Alexandria Ocasio-Cortez
**FROM:** Jonathan Jones, Founder & General Manager, Liana Banyan Corporation
**DATE:** April 21, 2026
**RE:** A measured cost externality on U.S. public-interest infrastructure — and a commons remedy that already works across every major AI vendor

---

### The problem, named

America's 1.8 million nonprofits, cooperatives, and small public-interest institutions are quietly paying a structural tax on every AI-assisted task they perform. The tax is not a line item on any invoice. It is the cost of re-teaching the AI, session after session, the basic facts about the work the nonprofit does. Case files. Grant rules. Program criteria. Compliance language. Every conversation starts from zero. Every million-token context window gets re-packed with the same ground truth the last session already had. It's like paying a painter to drive back to the paint store for every stroke — and charging the homeowner for the miles. The industry's answer has been to sell the painter a bigger truck.

Public-interest workloads are the population that can least afford this. A 200-person nonprofit running 10,000 AI queries a day on premium-tier commercial AI, without canonical-memory tooling, runs **$20,000 to $40,000 a year** in inference cost alone — before staff time. Scale that to the sector: even conservatively, this is a **$1 to $5 billion per year** recurring cost absorbed by organizations funded by federal grants, private philanthropy, and donations small and large. It is a cost paid by every grant dollar that doesn't reach the program.

[FOUNDER PROSE HOOK — the rent-money-to-CD / cardboard-boots register: the poverty-fluent reader voice that turns the numeric argument into lived stakes. Suggested placement here — one paragraph, three to five sentences, in Founder's own words. Potatoes / hoe handle / system-of-wells keystones are available.]

### The measurement

On April 20–21, 2026, we ran the hardest cross-vendor test we could design. **Eight frontier AI models from all four major AI vendor families — Anthropic, Google, OpenAI, and Perplexity. Seventy-five platform-specific questions. Each question asked twice: once with our open-source memory-packet architecture (the Librarian) loaded as a system prompt, once without. Single-blind grading. Inter-rater kappa of 0.883 and 0.850 — "almost perfect" by the standard scale.**

| Rank | Model | HOT (w/ Librarian) | COLD (no Librarian) | Δ |
|:-:|---|:-:|:-:|:-:|
| 1 | Claude Haiku 4.5 | **98.7%** | 5.3% | +93.4 |
| 1 | Claude Opus 4.7 | **98.7%** | 6.7% | +92.0 |
| 3 | Perplexity Sonar Pro | 98.0% | 9.3% | +88.7 |
| 4 | Gemini 2.5 Flash | 94.7% | 12.0% | +82.7 |
| 5 | Gemini 2.5 Pro | 94.0% | 8.7% | +85.3 |
| 6 | GPT-4o | 93.3% | 8.7% | +84.6 |
| 7 | Perplexity Sonar | 92.0% | 7.3% | +84.7 |
| 8 | GPT-4o-mini | 89.3% | 11.3% | +78.0 |

**Mean HOT 94.8% · Mean COLD 8.7% · Mean Δ +86.2 percentage points. Cross-vendor. Replicable. Total benchmark cost: $18.**

### The finding the industry will not volunteer

Across the same vendor — Anthropic — **the cheapest model (Haiku 4.5, $0.0066/query) and the most expensive (Opus 4.7, $0.1272/query) scored identically at 98.7% accuracy. Nineteen times the price. Zero measurable accuracy difference.** Premium pricing in the AI sector is not buying accuracy when canonical memory is present. It is buying the absence of canonical memory — and charging the customer for the confusion. This is not theoretical. It is one line of a reproducible data table any reader of this memo can regenerate on their own hardware in forty minutes for eighteen dollars.

### The commons remedy

The Librarian architecture ships today as an open-source MCP server under AGPL-3.0 with a Cooperative Defensive Patent Pledge grant for public-interest use. **Thirteen patent provisionals have been filed on the underlying memory-architecture innovations (U.S. application 64/036,646 and twelve predecessors). Eighty percent of that portfolio is irrevocably pledged into the commons** in our corporate bylaws — meaning it cannot be revoked by a future acquirer, a future board, or a future founder. The nonprofit sector inherits the architecture, structurally, in perpetuity.

Repo: **github.com/Upekrithen/librarian-mcp** (v0.1.0-alpha, April 20, 2026). Install with `pip install git+https://github.com/Upekrithen/librarian-mcp.git` — under a minute. Runs on the user's machine. No registration. No account. No upload back to us unless the user chooses. Every reader of this memo is a potential skeptical instrument.

### Policy hooks — three sized for your calendar

1. **Hearing title (pocket):** *The Invisible Inference Tax — Measuring the AI Cost Externality on America's Public-Interest Sector.* One panel of nonprofit CIOs; one panel of AI vendor government-affairs leads; one demo of the Librarian thermometer running live on stage. Four witnesses total. Half a morning.
2. **GAO / CBO study ask:** a 180-day study quantifying cumulative AI inference spend by U.S. nonprofits and cooperatives at current trajectory, with the Eyewitness Benchmark methodology as a reference for counterfactual pricing.
3. **Legislative concept (sketch, not draft):** a procurement-side disclosure rule — federal contracts over $X in annual AI spend require vendors to publish whether canonical-memory preloading is available and at what price differential. Disclosure, not mandate.

### The patent-conversion window — for transparency

The thirteen provisionals convert to full utility patents by **November 26, 2026**. Conversion costs five to ten million dollars in legal fees. The commons lock in our bylaws is only enforceable on patents actually issued. There is a seven-month clock on whether this architecture becomes a pledged commons or an unfunded idea. I am not asking your offices for funding. I am noting the clock for context — and because a hearing before the deadline would be structurally timelier than one after.

### The ask

One thirty-minute exploratory call with whichever of your tech-policy team is closest to this cluster. No money. No endorsement. No co-sponsor request. If after that call your offices see nothing worth following up on, the platform is going to land regardless and your staff got an early look. If you do see something worth following up on, the case file is ready.

**Contact:** Founder@LianaBanyan.com · 406-578-1232 · Cephas.LianaBanyan.com

[FOUNDER PROSE CLOSE — one sentence or two in Founder's voice landing the "help each other help ourselves" register, or a poverty-fluent closer equivalent to the NYT "system of wells" paragraph. Not required to be long. Required to be his.]

Respectfully,

**Jonathan Jones**
Founder & General Manager, Liana Banyan Corporation
U.S. Army National Guard veteran (Infantry / Aviation)
Father of eight

---

## BISHOP DISPATCH NOTES (strip before send)

- **Two separate files at send:** clone this to `STAFFER_MEMO_SANDERS_B112.md` and `STAFFER_MEMO_AOC_B112.md` — each with office-specific salutation and one-sentence tailoring in the opening.
- **Sanders tailoring:** lead with the worker-cooperative structural frame (Sanders' S. 4017 context, his public cooperative-economics record). Cite the Cooperative Defensive Patent Pledge as the IP-governance mechanism.
- **AOC tailoring:** lead with the algorithmic-accountability / big-tech-extraction frame. Cite the cross-vendor finding as *empirical measurement of the exact mechanism she has been arguing against without numbers*.
- **Staff targets to research before send:** Warren Gunnels (Sanders Senate Budget), Sammy Dorsainvil / Alyssa Parker (AOC tech/oversight), plus district-office tech leads. Confirm via recent public reporting before dispatch — don't cold-name a staffer who left.
- **Glass Door publication path:** `cephas.lianabanyan.com/outreach/sanders-aoc-staffer-memo` — public by default per #2262 doctrine. Publish 24 hours before dispatch with scheduled-send timestamp visible.
- **Wave assignment:** Wave 2 or 3 depending on Scott / Doctorow landing. Not before Wave 1 — we don't want a policy-office memo out before the philanthropic anchors.
- **Counsel review trigger:** if either office replies with a hearing-witness request, counsel reviews sworn-testimony exposure before accept.
- **Success metric:** one 30-minute call with either office within 60 days. Bonus: staffer installs the Librarian on their own laptop during or after the call.
- **Helm Schedule task:** auto-create at dispatch with `fire_at = sent + 21 days`, `priority_tier = 3`, `source_kind = 'staffer_memo'`. Body: "Staffer-memo follow-up window. No follow-up unless staffer reaches out first. Monitor Budget/HELP committee releases and AOC Oversight releases for any Liana Banyan mention."

---

## KEYSTONE NOTES

- This memo avoids the Newmark-territorial "friendly fire" sentence (Keystone D) per B111 ratification.
- Uses cross-letter Keystones lightly — "measurement is the contribution" is the dominant register here, not "potatoes." Staffer memos earn their keep on numbers; Founder voice lands the lived-stakes paragraph and the close, not the body.
- If Founder voice pass lands the "system of wells" or "two suits" or "I know enough to know I don't know enough" in the hook or close, any of them fits. Flag if a memo-specific Keystone candidate emerges (e.g., *"Measurement is the contribution; endorsement is not conveyed by inclusion"* — currently the Eyewitness posture-disclosure sentence; could promote if Founder ratifies).

---

## READY FOR

- **Founder prose pass** on the two bracketed [FOUNDER PROSE …] inserts + light pass on the whole memo (expected 40–60% rewrite per [feedback_drafts_as_scaffolding.md](../../.claude/projects/C--Users-Administrator-Documents/memory/feedback_drafts_as_scaffolding.md); memos usually get lighter rewrite than letters because the register is tighter).
- **Two-office split** after voice pass — separate files, office-specific tailoring per the dispatch notes above.
- **Counsel review** (light) on the policy-hook wording before dispatch — nothing in the memo should read as a legislative ask.
- **Glass Door publication** 24 hours before send.
- **Dispatch window:** Wave 2 (Apr 23–25) soonest; more likely Wave 3 (Apr 26–28) depending on Scott / Doctorow landing.

---

*Saved B112, April 21, 2026. Cross-vendor evidence locked from K423 Eyewitness Benchmark. Scaffold only — prose ownership is Founder's per standing feedback.*
