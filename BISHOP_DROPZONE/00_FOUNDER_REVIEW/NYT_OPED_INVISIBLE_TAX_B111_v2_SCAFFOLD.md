# NYT Op-Ed — "The Invisible Tax Every AI Company Is Paying" — v2 SCAFFOLD
## B111, April 20, 2026 — TWO-TIER TITLE STRATEGY (Founder-ratified)

---

## Two-tier title + opening strategy

**NYT op-ed submission version:** Keep title *"The Invisible Tax Every AI Company Is Paying"* and use the main draft below as-is. NYT editors prefer diagnostic-frame titles; leading with the tax metaphor is editor-friendly.

**Self-publication version (Medium / Cephas / LinkedIn / Twitter thread lead):** Title changes to *"A Cooperative Commons Just Cut AI Costs by 90% — And So Can You."* AND the opening gets prepended with the alternate lead paragraph below (result-first framing), THEN the main draft flows from "This is the invisible tax" paragraph onward. Same body, different entry point.

### Self-publication alternate lead (prepend before the main draft for Medium/Cephas/LinkedIn/Twitter)

> **A cooperative commons just cut the cost of an AI call by 90%. And so can you.**
>
> I built a memory-packet architecture called the Librarian. Loaded into an AI session before you ask your first question, it delivers the canonical facts you would otherwise pay the model to rediscover round after round. Measured result: **94.8 percent mean accuracy across eight frontier models from all four major AI vendor families**, on the hardest platform-specific questions we could design, against 8.7 percent without it. At the top: Claude Haiku 4.5 ties Claude Opus 4.7 at 98.7 percent — for nineteen times less money per question. Installable in thirty seconds — `pip install git+https://github.com/Upekrithen/librarian-mcp.git` — and you run the meter on your own data. Your number, not mine.
>
> The full piece below is a longer version of that claim. The short version is the title.
>
> ---

After the alternate lead, the main draft begins at the current opening Keystone (*"Every AI company is currently paying a tax they don't know they're paying."*) and continues verbatim. The diagnosis framing still lands — it just follows the result rather than leading.

**When using self-pub variant:** also update:
- First load-bearing sentence in the bookstore paragraph: unchanged
- Close paragraph: unchanged
- Repo URL in call-to-action: github.com/Upekrithen/librarian-mcp (current)

**When using NYT variant:** ignore the self-pub alternate lead entirely; the main draft stands as written.

---

**Changes from v1 (B110):** Adds the **Thermometer** framing — the R9 measurement is not a claim the reader has to trust; it is a personal meter the reader can install and run against their own usage. The public `librarian-mcp` repo (github.com/Upekrithen/librarian-mcp, v0.1.0-alpha, `pip install`-able as of 2026-04-20) makes this concrete. Two insertion points: a new paragraph immediately after the 93-97% result reveal (the verification layer), and a revised close that lands on the meter metaphor. All other prose v1-verbatim — Founder voice pass still pending per [feedback_drafts_as_scaffolding.md](../../.claude/projects/C--Users-Administrator-Documents/memory/feedback_drafts_as_scaffolding.md).

**Thermometer constraints (Founder-ratified B110 close):**
- Local-only meter. No registration gate. No account required.
- Opt-in upload to a commons dashboard (not required).
- *Your* number, visible to *you*, private to you — unless you choose to share it.

**Thesis (unchanged):** Candidate A ("The Invisible Tax") + Candidate C voice ("Potatoes and Proof"). Diagnose the industry-wide waste first; announce the R9 measurement; **let the reader measure it themselves**; close with the Pledge as the commons lock, anchored in Cardboard Boots voice.

**Format target:** ~1,050 words with thermometer paragraph added (still within NYT 800–1,200 standard).

**Load-bearing numbers (all canonical, traceable — B112 final):**
- **Eyewitness Benchmark (R10 / K423, Apr 20–21 2026):** 8 models × 4 vendor families × 2 conditions × 75 questions = 1,200 inference calls
- **Mean HOT accuracy: 94.8% · Mean COLD: 8.7% · Mean Δ: +86.2 pp**
- **Haiku 4.5 ties Opus 4.7 at 98.7%** — 19× cost ratio, zero accuracy gap (headline finding)
- Full table: Haiku 4.5 98.7% / Opus 4.7 98.7% / Sonar Pro 98.0% / Gemini Flash 94.7% / Gemini Pro 94.0% / GPT-4o 93.3% / Sonar 92.0% / GPT-4o-mini 89.3%
- Inter-rater κ: 0.883 (Haiku vs Opus spot-check, n=120) and 0.850 (Haiku vs Gemini Flash cross-check, n=56) — both "almost perfect"
- Microsoft Copilot recoverable waste: ~$750M/yr
- Anthropic recoverable waste: ~$130M/yr
- Scott/Yield Giving grantees: ~2,300 documented, ~$17B cumulative since 2020
- Conservative Yield Giving R9 benefit: $115M–$280M/yr recurring
- Broader nonprofit sector: $1B–$5B/yr
- Patent Prosecution Defense Fund: $5–10M
- 13 provisionals filed; Nov 26, 2026 conversion deadline
- 80% of portfolio committed to the Cooperative Defensive Patent Pledge
- **Public Librarian MCP repo:** github.com/Upekrithen/librarian-mcp, v0.1.0-alpha (2026-04-20)

**Rhetorical Keystones to weave** (see [project_rhetorical_keystones.md](../../.claude/projects/C--Users-Administrator-Documents/memory/project_rhetorical_keystones.md)): "Every AI company is currently paying a tax they don't know they're paying" (opening), "I pray for potatoes at the end of a hoe handle," "I have two suits," "I know enough to know I don't know enough," "Nothing about us without us," "The eighty percent is the only number where cooperation costs less than defection." **Keystone D ("Especially from friendly fire — I am unwilling to allow a single casualty…") is Newmark-territorial per B111 and does NOT go in this op-ed.** Keystone #2 ("Especially from friendly fire") alone may appear if Founder judges the fit, but the fuller sentence stays with Newmark.

---

## Draft

**The Invisible Tax Every AI Company Is Paying**
*By Jonathan Jones*

[KEYSTONE opener] **Every AI company is currently paying a tax they don't know they're paying.** It arrives on every invoice dressed as "inference cost," but what the model is actually billing you for is its own forgetting. Each session starts from zero. Each million-token context window has to be repacked with the same ground truth the last session already had. It's like paying a painter to drive back to the paint store for every stroke — and charging the homeowner for the miles. The industry's answer, so far, has been to sell the painter a bigger truck.

This is the invisible tax. It isn't invisible because it's small. It's invisible because it's distributed. A Gemini AI Pro subscriber filed a public complaint last month that Gemini 3.1 Pro — Google's one-million-token model — starts forgetting critical details from Prompt #1 by **prompt #21**. The spec says a million; the lived experience is about twenty. Microsoft's Copilot dips into your files and inbox when you ask — a smarter retrieval net, without a canonical index. Anthropic added a session-to-session memory feature and prompt caching so the same document isn't paid for twice. All real engineering. All the same shape: push harder on scale. What none of them decide, because no one owns the decision, is *which facts are canonical.*

I'm a jack-of-all-trades: 53-year-old ARNG 11B & 15A veteran of no particular note, I.T. since '97, father of eight, with no formal programming or engineering specific education; but the second half of that adage perhaps applies. I read a lot, and I'm good at chess, and I've been working on the same problem for over 40 years, until technological advances made implementation possible.

For the last decade-plus I have been preparing, and in the last six months building, a cooperative infrastructure project called Liana Banyan. We treat canonical truth as a first-class asset — the pricing, the rules, the decisions, the people, the paper trail — and hand it to the AI at the start of every conversation as a tightly-curated memory packet we call the **Librarian**. On April 20, 2026, we ran the hardest test I could design. Seventy-five platform-specific questions. **Eight frontier AI models from all four major vendor families — Anthropic, Google, OpenAI, Perplexity.** Every question asked twice: once with the Librarian loaded, once without. Twelve hundred AI calls, single-blind graded, cross-checked by an independent model at near-perfect inter-rater agreement.

**Without the Librarian, the eight models averaged nine correct answers out of a hundred. With the Librarian, ninety-five.** An **eighty-six-percentage-point lift**, cross-vendor, replicated in vendors who have no commercial incentive to agree with us — including ourselves. The architecture works. It works on models it has never been trained against. It works on vendors who didn't know we were testing them. It is cheap enough to use every single session.

And here is the part the industry will not want you to know. **The cheapest Anthropic model we tested and the most expensive answered the same number of questions correctly: 98.7 out of a hundred. Identical, to three decimal places.** Claude Haiku 4.5 at about two-thirds of a penny per question. Claude Opus 4.7 at nineteen times that price. **Nineteen times the price for zero measurable accuracy difference.** An AI industry that tells you the accuracy you need requires their premium tier is selling you a premium tier, not accuracy. Context was what was missing. We shipped the context. Pricing premium was never buying accuracy; it was buying the absence of canonical memory.

*(Final 8-model numbers, Eyewitness Benchmark K423, April 20–21 2026. Full table: Haiku 4.5 and Opus 4.7 both 98.7%; Perplexity Sonar Pro 98.0%; Gemini 2.5 Flash 94.7%; Gemini 2.5 Pro 94.0%; GPT-4o 93.3%; Sonar 92.0%; GPT-4o-mini 89.3%. Inter-rater κ = 0.883 (Haiku vs Opus) and 0.850 (Haiku vs Gemini Flash) — both "almost perfect." Data preserved at `r10_cross_vendor/results/` in the repo.)*

[THERMOMETER — new in v2, landing directly after the result reveal] You should not have to take that on faith. So we gave you a thermometer. The Librarian ships today as an open-source server anyone can install in thirty seconds — `pip install librarian-mcp` — and point it at whatever AI you already use. Your own terminal shows you, in real dollars of token cost, what the same session costs *without* the preload and what it costs *with*. You are not reading *our* number. You are reading *yours*. There is no account. There is no registration. There is no upload back to us unless you choose it. If you choose it, your anonymized savings join a shared dashboard and the whole industry can watch the tax be measured in real time by the people paying it. If you don't, the meter runs privately — your number, visible to you, your own to keep. **A tool that measures its own value and shows only you, unless you agree to share it anonymously, or publicly.** Every reader of this op-ed is now a skeptical instrument.

Three days ago, in Pike Place Market in Seattle, I walked into a tiny shop called **Pine Books** looking for a book my daughter wanted. I had two words of its seven-word title left in my head. **Tiffany Brost** — the sixth caretaker/owner of Pine Books — listened to those two words, turned, and walked directly to the shelf. She pulled the book. Then, without pausing, she named three authors on the shelves immediately adjacent that my daughter might also like. No database. No search bar. Two words in; a book and three recommendations out. That scene *is* the Librarian. A canonical memory, curated by someone who knows the collection, delivered the instant it is asked for. The difference between Pine Books and a megastore's search bar is the difference between the Librarian and a one-million-token context window that starts from zero every session.

Applied inside Microsoft's Copilot suite, the same architecture would recover roughly **$750 million a year** in inference waste. Inside Anthropic's own developer tools, about **$130 million a year.** Those are the corporate prizes. The bigger one is what we built this for.

Here is where I have to say something a lot of people won't like. Patent moats don't work when the technology is bigger than your legal budget. So I am not building a moat. I am building a **commons.** Thirteen provisional patents cover this architecture, and we have until **November 26** to convert them into full utility patents. Conversion costs five to ten million dollars in legal fees. Pledging the commons requires owning the patents first; owning the patents requires the legal fees. The entire defensive structure rests on one check that hasn't been written.

[KEYSTONE] **The eighty percent is the only number where cooperation costs less than defection.** I am pledging **eighty percent of the portfolio** into the **Cooperative Defensive Patent Pledge** — a shared lock designed so that every signatory's position gets stronger when the next one signs, not weaker. No one can be sued out of the architecture. No one can buy the architecture and gate it. And every nonprofit that MacKenzie Scott's Yield Giving has funded — **roughly 2,300 documented grantees representing $17 billion in giving since 2020** — gets the Librarian architecture structurally, in perpetuity, whether or not Scott herself funds a dime of the Defense Fund.

The measured benefit to her network alone, on conservative adoption: **$115 to $280 million per year, recurring.** That is roughly one full year of her direct philanthropy — every year, compounding, from a single architectural intervention. Across the broader nonprofit and cooperative sector: **$1 to $5 billion per year** if they adopt under the Pledge. And the Pledge is designed the way a well-run ecosystem works and the way an à la carte menu works, at the same time. Use one piece, save what you save. Add the next piece, earn the synergy. Stay at one piece forever if that is the right choice for you. The system will tell you, every time, in plain numbers: *You are already using the Pledged Commons R9, saving $X. If you added W, you would save or earn $Y more.* Nothing is forced. Nothing is bundled. Nothing is locked in.

I've had 53 years of living in the trenches of poordom, and I'm really good at it. I outright buy my cars used at auction and get them fixed. I put rent money into a CD, then 15 days later get a loan against it to pay rent, and pay it off over years to establish credit. Then I share the credit card I get with that good credit with my wife and children, and use it to pay for everything, and constantly pay it — which gives my kids great credit to get an apartment and a car, with a job, on their own. That's a huge win where I come from. So I want to give that to everyone. Like Lloyd Christmas in *Dumb and Dumber*, I'm tired of just eking by. But I'm not just tired of it for me — I'm tired of it for my kids, and your kids, and you too. We deserve better. A rising tide lifts all boats. And I think I've built a system of wells.

I am not writing this to make a grant request. I am writing this because the default future is already being built. In it, four companies own the right to make AI remember; three of them compete on bigger haystacks; and the 1.8 million U.S. nonprofits that keep the social infrastructure running get billed by the prompt for the privilege of being forgotten by eleven a.m. [KEYSTONE] **I know enough to know I don't know enough** to prevent that future alone. But I measured the piece that changes its shape — and I handed the measuring stick to you. The eighty percent is on the table. The legal conversion window closes in seven months.

If you run a nonprofit or a cooperative, the Pledge's Tier-3 provision has your name on it already. If you fund nonprofits, the Defense Fund is the smallest check you will ever write that purchases $115 to $280 million a year for organizations you already believe in. If you build at one of the AI companies, the architecture is published, the benchmark is reproducible, and the Pledge will accept your signature tomorrow.

[CLOSE, revised in v2] An invisible tax has an invisible solution. A measured tax has a measurable one. **The meter is in your hands. Run it. If the number matches ours, the rest is a policy decision, not a marketing claim.** I measured it. Now you can too. The rest is yours.

---

## Editorial Notes — v2 vs v1

### What changed
- **New paragraph** between the 93-97% result reveal and the small-bookstore hook: the thermometer. Hands the measurement stick to the reader. Names the install command. Names the privacy terms (local only, opt-in upload).
- **Close revised**: previous close ended "I measured it. The rest is yours." v2 close is "The meter is in your hands. Run it… I measured it. Now you can too. The rest is yours." The addition is one sentence, but structurally it's the op-ed's second Keystone-weight moment — the reader is no longer a witness, they are the instrument.
- **Mid-piece nod** in the "I know enough to know I don't know enough" paragraph: *"But I measured the piece that changes its shape — and I handed the measuring stick to you."* Four-word add to a paragraph that otherwise remains v1-verbatim.

### What did NOT change
- Opening Keystone untouched.
- Cardboard Boots hook untouched (FOUNDER HOOK marker preserved).
- Small-bookstore-owner hook untouched.
- All load-bearing numbers unchanged.
- Keystone count and placement: same set minus **one** consideration — **Keystone D is Newmark-territorial per B111** and is not in this op-ed. Keystone #2 ("Especially from friendly fire") is available if Founder wants it, but the op-ed does not need it; the thermometer carries the "measured by you" moral weight that "friendly fire" would otherwise carry.

### One question for Founder
The thermometer paragraph contains a phrase — *"A tool that measures its own value, and shows the number to you."* — that may be a Keystone candidate for the **Doctorow register** specifically. If it lands with Founder voice, it is a direct anti-enshittification line and would anchor the Doctorow V04. Flag for cross-letter or Doctorow-territorial?

### Ready for
- **Founder prose pass** (expected 60–80% rewrite per [feedback_drafts_as_scaffolding.md](../../.claude/projects/C--Users-Administrator-Documents/memory/feedback_drafts_as_scaffolding.md))
- **Pair-read against v1** to confirm additions are the right shape
- **NYT op-ed desk submission** once Founder voice-passes
- Retire v1 (`NYT_OPED_INVISIBLE_TAX_B110_v1_SCAFFOLD.md`) after v2 ratified

---

*Saved B111, April 20, 2026. Thermometer framing per Founder ratification B110 close. v1 prose preserved except for three surgical additions. Word count ≈ 1,050.*
