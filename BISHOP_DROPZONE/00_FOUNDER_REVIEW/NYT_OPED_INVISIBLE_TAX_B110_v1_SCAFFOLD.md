# NYT Op-Ed — "The Invisible Tax Every AI Company Is Paying" — v1 SCAFFOLD
## B110, April 19, 2026

**Thesis:** Candidate A ("The Invisible Tax") + Candidate C voice ("Potatoes and Proof"). Diagnose the industry-wide waste first; announce the R9 measurement; close with the Pledge as the commons lock, anchored in Cardboard Boots voice.

**Format target:** ~1,000 words (NYT standard op-ed: 800–1,200). Byline: Jonathan Jones, Founder and General Manager, Liana Banyan.

**Scaffold note:** structural only. Expect 60–80% prose rewrite by Founder per [feedback_drafts_as_scaffolding.md](../../.claude/projects/C--Users-Administrator-Documents/memory/feedback_drafts_as_scaffolding.md). Anecdote hooks marked `[FOUNDER HOOK: ...]`. Rhetorical Keystones marked `[KEYSTONE: ...]`.

**Load-bearing numbers (all canonical, traceable):**
- R9 accuracy: 93.3% Haiku ±1.7%, 92.0% Sonnet, 97.3% Opus (Q01-corrected, B109)
- COLD baseline: ~8.2–9.3% across models
- Cost advantage: 4.3× more correct answers per dollar
- Microsoft Copilot recoverable waste: ~$750M/yr
- Anthropic recoverable waste: ~$130M/yr
- Scott/Yield Giving grantees: ~2,300 documented, ~$17B cumulative since 2020
- Conservative Yield Giving R9 benefit: $115M–$280M/yr recurring
- Broader nonprofit sector: $1B–$5B/yr
- Patent Prosecution Defense Fund: $5–10M
- 13 provisionals filed; Nov 26, 2026 conversion deadline
- 80% of portfolio committed to the Cooperative Defensive Patent Pledge

**Rhetorical Keystones to weave** (see [project_rhetorical_keystones.md](../../.claude/projects/C--Users-Administrator-Documents/memory/project_rhetorical_keystones.md)): "Every AI company is currently paying a tax they don't know they're paying" (opening), "I pray for potatoes at the end of a hoe handle," "I have two suits," "I know enough to know I don't know enough," "Nothing about us without us," "Especially from friendly fire," "The eighty percent is the only number where cooperation costs less than defection."

---

## Draft

**The Invisible Tax Every AI Company Is Paying**
*By Jonathan Jones*

[KEYSTONE opener] **Every AI company is currently paying a tax they don't know they're paying.** It arrives on every invoice dressed as "inference cost," but what the model is actually billing you for is its own forgetting. Each session starts from zero. Each million-token context window has to be repacked with the same ground truth the last session already had. The haystack grows; the needle still has to be found. The industry's answer, so far, has been to buy more hay.

This is the invisible tax. It isn't invisible because it's small. It's invisible because it's distributed. A Gemini AI Pro subscriber filed a public complaint last month that Gemini 3.1 Pro — Google's one-million-token model — starts forgetting critical details from Prompt #1 by **prompt #21**. The spec says a million; the lived experience is about twenty. Microsoft's Copilot dips into your files and inbox when you ask — a smarter retrieval net, without a canonical index. Anthropic added a session-to-session memory feature and prompt caching so the same document isn't paid for twice. All real engineering. All the same shape: push harder on scale. What none of them decide, because no one owns the decision, is *which facts are canonical.*

[FOUNDER HOOK: self-introduction in your voice — credentials by understatement. "I have two suits." "Veteran of no particular note." "Father of eight." Ground the reader quickly in who is actually writing this, before the numbers land. Two or three lines.]

For the last decade-plus I have been building a cooperative infrastructure project called Liana Banyan. We treat canonical truth as a first-class asset — the pricing, the rules, the decisions, the people, the paper trail — and hand it to the AI at the start of every conversation as a tightly-curated memory packet we call the **Librarian**. On April 18, we ran the hardest test I could design. Seventy-five platform-specific questions. Three different AIs — Haiku small, Sonnet mid, Opus large. Every question asked twice: once with the Librarian loaded, once without.

**Without the Librarian, the AIs answered about 8 out of 100 correctly. With the Librarian, between 93 and 97 out of 100 — across every AI we tested.** Four times more right answers per dollar of compute. The architecture works. It works on models it has never been trained against. It is cheap enough to use every single session.

[FOUNDER HOOK: the small-bookstore-owner scene — your daughter's book, the two words you remembered of the seven-word title, the owner's walk to the shelf, the three adjacent authors named without hesitation. That scene IS the Librarian. Concrete beats abstract.]

Applied inside Microsoft's Copilot suite, the same architecture would recover roughly **$750 million a year** in inference waste. Inside Anthropic's own developer tools, about **$130 million a year.** Those are the corporate prizes. The bigger one is what we built this for.

Here is where I have to say something a lot of people won't like. Patent moats don't work when the technology is bigger than your legal budget. So I am not building a moat. I am building a **commons.** Thirteen provisional patents cover this architecture, and we have until **November 26** to convert them into full utility patents. Conversion costs five to ten million dollars in legal fees. Pledging the commons requires owning the patents first; owning the patents requires the legal fees. The entire defensive structure rests on one check that hasn't been written.

[KEYSTONE] **The eighty percent is the only number where cooperation costs less than defection.** I am pledging **eighty percent of the portfolio** into the **Cooperative Defensive Patent Pledge** — a shared lock designed so that every signatory's position gets stronger when the next one signs, not weaker. No one can be sued out of the architecture. No one can buy the architecture and gate it. And every nonprofit that MacKenzie Scott's Yield Giving has funded — **roughly 2,300 documented grantees representing $17 billion in giving since 2020** — gets the Librarian architecture structurally, in perpetuity, whether or not Scott herself funds a dime of the Defense Fund.

The measured benefit to her network alone, on conservative adoption: **$115 to $280 million per year, recurring.** That is roughly one full year of her direct philanthropy — every year, compounding, from a single architectural intervention. Across the broader nonprofit and cooperative sector: **$1 to $5 billion per year** if they adopt under the Pledge. And the Pledge is designed the way a well-run ecosystem works and the way an à la carte menu works, at the same time. Use one piece, save what you save. Add the next piece, earn the synergy. Stay at one piece forever if that is the right choice for you. The system will tell you, every time, in plain numbers: *You are already using the Pledged Commons R9, saving $X. If you added W, you would save or earn $Y more.* Nothing is forced. Nothing is bundled. Nothing is locked in.

[FOUNDER HOOK — the Cardboard Boots anchor paragraph. Weave at least three Keystones here, unvarnished: "I pray for potatoes at the end of a hoe handle," "I have two suits," "nothing about us without us," "especially from friendly fire," "I know enough to know I don't know enough." This is the moral-weight center of the piece. Do not let this paragraph be polished; its power is that it isn't.]

I am not writing this to make a grant request. I am writing this because the default future is already being built. In it, four companies own the right to make AI remember; three of them compete on bigger haystacks; and the 1.8 million U.S. nonprofits that keep the social infrastructure running get billed by the prompt for the privilege of being forgotten by eleven a.m. [KEYSTONE] **I know enough to know I don't know enough** to prevent that future alone. But I measured the piece that changes its shape. The eighty percent is on the table. The legal conversion window closes in seven months.

If you run a nonprofit or a cooperative, the Pledge's Tier-3 provision has your name on it already. If you fund nonprofits, the Defense Fund is the smallest check you will ever write that purchases $115 to $280 million a year for organizations you already believe in. If you build at one of the AI companies, the architecture is published, the benchmark is reproducible, and the Pledge will accept your signature tomorrow.

An invisible tax has an invisible solution. A measured tax has a measurable one. I measured it. The rest is yours.

---

*Saved B110 as v1 scaffold. Thesis A+C Founder-directed. Numbers canonical; Keystones marked for Founder voice pass. Word count ≈ 970.*
