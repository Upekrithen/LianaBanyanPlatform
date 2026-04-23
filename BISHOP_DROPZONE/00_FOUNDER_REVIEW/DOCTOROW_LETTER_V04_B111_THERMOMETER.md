# LETTER TO CORY DOCTOROW
## Author, Activist, Coiner of "Enshittification"
## V04_B111 — Updated April 20, 2026
## Previous: V03_B099 (April 11, 2026) → see `06_Letters/DOCTOROW_LETTER_V03_B099.md`
## V02 (LOCKED_UPDATE_B046, March 29, 2026); V01 (undated, ~Nov 2025)

**Why V04:** V03 had the four-layer anti-enshittification structural argument (locked margin / no third party / bylaw-codified IP / public documentation). V04 adds a **fifth layer — the Thermometer — the anti-opacity layer.** Founder-ratified at B110 close: the R9 measurement is not a claim the reader has to trust, it is a meter that ships as open source and runs on their own machine. Live as of 2026-04-20 at `github.com/Upekrithen/librarian-mcp` (tag v0.1.0-alpha, `pip install`-able). Against enshittification specifically, the thermometer is the most direct counter-move available: **a tool that measures its own value and shows the number to YOU** — the person being billed — rather than to the platform shipping the bill. That phrase is proposed as either a new cross-letter Keystone or a Doctorow-territorial anchor (Founder ratifies or rejects below).

Also refreshes stats to B111 canonical: **2,267 innovations / 225 Crown Jewels / ~2,412 formal claims / 13 provisionals filed / Prov 14 in preparation.**

---

Mr. Doctorow,

You named the disease. I have spent nine years building a platform that is structurally incapable of catching it. And eight days ago I shipped the thermometer.

My name is Jonathan Jones. I am 53, an Army National Guard veteran (enlisted at sixteen, Infantry to OCS to IFR-rated Aviation), helicopter pilot, father of eight. I have invested $5,000 a year from a $30,000 income into this work — four decades thinking about cooperative economics, nine years actively building. I am not writing to ask for anything beyond your honest read.

## The Enshittification-Proof Architecture

You have described the predictable arc: platforms are first good to users, then they abuse users to benefit business customers, then they abuse everyone to claw back value for themselves. The mechanism is simple — they *can*, so they *do*.

**Liana Banyan can't.** Not "won't." *Can't.* The structural answer is at five layers — and the fifth is new in the last eight days.

**1. The margin is locked.** Platform takes **Cost + 20%**. Not "our current policy." Not "our commitment." It is in the operating agreement. Changing it would require dissolving the corporation. Creators keep **83.3%** of every transaction. Here is the math on a $500 transaction:

| | |
|---|---|
| Creator receives | **$416.67** |
| Platform takes | **$83.33** (exactly 20% of cost basis) |

No hidden fees. No "processing charges." No twiddle dial. There is nowhere for the dial to go.

**2. There is no third party to switch sides toward.** The platform takes no advertising, no surveillance monetization, no third-party-buyer revenue. The first move in the enshittification cycle — *"shift the value from users to business customers"* — has no entry point in the architecture, because there are no business customers buying access to users. The relationship is two-sided (members and members) and the platform is a coordination layer, not an auction house.

**3. The IP is bylaw-codified to the members in perpetuity.** This is the structural answer to the deepest version of your enshittification critique — *"what happens when the founder leaves or the company is sold?"*

We filed an innovation we call the **Cooperative Defensive Patent Pledge** (Innovation #2260, in our patent corpus). The mechanism: every patent the corporation files is, at the moment of filing, granted as a perpetual royalty-free non-sublicensable license to all current and future cooperative members, codified in the corporation's bylaws. Not in policy. Not in a press release. Not in a "commitment." **In the bylaws.** The license **survives any future ownership change, board decision, merger, acquisition, or restructuring**. If I sold the company tomorrow, the buyer would inherit the perpetual member license as a structural constraint they cannot revoke. **The Pledge is itself an acquisition defense.**

This is the third axis of platform cooperativism: ownership (Scholz), labor (Scholz), and now democratic IP governance. Tesla's 2014 patent pledge, Google's 2013 non-assertion pledge, Red Hat's Patent Promise, and the Open Invention Network are all prior art in the defensive-pledge category, and none of them combine cooperative-platform application, bylaw codification, enumerated cooperative criteria for the licensee class, integration with a separate commercial licensing layer for non-cooperative use, and explicit patent-retaliation termination. The Pledge is novel structural law and we believe it can be patented and given away *through* itself, the way the Pledge proposes for everything else.

**4. The whole thing is documented in public.** The patents are filed. The bylaws are public. The cost model is published. The math is on the website. We are, structurally, the first platform that is able to publish its own enshittification mechanisms (because there are none) and invite anyone in the world to look for ones we missed.

**5. [NEW in V04 — THE THERMOMETER] The platform hands you the instrument that measures its own cost.** This is the direct structural inversion of the enshittification arc. Enshittification works because the platform alone knows the real numbers and the user only knows the invoice. We just shipped the opposite of that. The R9 architecture — the memory-packet layer that reduces AI inference cost by roughly 85% at production scale (Paper #40A, Innovation #2249) — ships as an open-source MCP server that installs in thirty seconds:

```
pip install librarian-mcp
python -m librarian_mcp
```

Point it at whatever AI you already use. Your terminal shows you, in real dollars of token cost, what your session costs **without** the preload and what it costs **with**. Your number, your data, visible only to you. No registration. No account. No upload back to us unless you choose it. If you choose it, your anonymized savings appear on a shared commons dashboard and the industry can watch the invisible tax be measured in real time by the people paying it. If you don't, the meter runs privately and the number belongs to you alone.

And here is the finding I want you to have before anyone else. We ran the architecture across all four of the most-used frontier AI vendor families — Anthropic (Haiku 4.5 and Opus 4.7), Google (Gemini 2.5 Flash and Pro), OpenAI (GPT-4o-mini and GPT-4o), and Perplexity (Sonar and Sonar Pro). **Eight models. Four vendor families. Twelve hundred inference calls. Single-blind, double-graded — Claude Haiku as the primary grader, Claude Opus and Gemini Flash as independent cross-checks. Inter-rater agreement: 0.883 and 0.850 — both "almost perfect" by Landis–Koch.** Without the preload, the models averaged **8.7 percent accuracy**. With it, **94.8 percent**. Every single model jumped at least seventy-eight percentage points. **An eighty-six-percentage-point mean lift, cross-vendor, including the vendor who made the tool we graded with.** No vendor had notice. The COLD scores confirm it: none of them had already ingested the Liana Banyan corpus.

But the piece you will care about most — because it is the exact structural shape of enshittification made visible — is this. **The cheapest Anthropic model and the most expensive Anthropic model scored the same, to three decimal places: 98.7 percent.** Claude Haiku 4.5: $0.0066 per question. Claude Opus 4.7: $0.1272. **Nineteen times the price for zero measurable accuracy.** Pricing premium was not buying accuracy. It was buying the absence of canonical memory, which is to say, it was buying nothing the preload doesn't deliver for a penny on the dollar. The industry has been selling compute cycles where what customers actually needed was canonical memory — and charging them for the confusion. This is the enshittification mechanism at the inference layer, named out loud with numbers.

That is, I think, worth a Pluralistic paragraph on its own terms. The measurement is reproducible. Your readers can install the tool today and verify the number on their own data. The $8.7 billion per year industry-savings projection in our CFO Memo is built on this finding, and the finding is now cross-vendor and cross-graded.

*(Final numbers, B111 Eyewitness Benchmark K423, April 20–21 2026. Full table: Haiku 4.5 98.7%, Opus 4.7 98.7%, Sonar Pro 98.0%, Gemini 2.5 Flash 94.7%, Gemini 2.5 Pro 94.0%, GPT-4o 93.3%, Sonar 92.0%, GPT-4o-mini 89.3%. Raw inference and grading JSONL preserved at `r10_cross_vendor/results/` in the public repo. Total benchmark cost: ~$18.)*

---

This is the sentence I would like you to read twice, because I think it is the plain-English core of what anti-enshittification architecture actually looks like at the tool layer:

> **A tool that measures its own value and shows only you, unless you agree to share it anonymously, or publicly.**

The repo is live: **github.com/Upekrithen/librarian-mcp** (release v0.1.0-alpha, April 20, 2026). AGPL-3.0 license with a Pledged Commons grant. The server is the instrument; the source is the proof; the Pledge is the lock. Every published claim in this letter can be checked by installing a Python package.

## Why I Am Writing to You Specifically

You have spent the last three years building the most influential vocabulary in tech criticism. *Enshittification* is now in the *Oxford English Dictionary*. Your Pluralistic newsletter reaches a daily readership of hundreds of thousands across LinkedIn, Twitter/X, Mastodon, RSS, and direct subscribers — a coalition that includes engineers, executives, regulators, journalists, activists, and the cooperative-minded readers who have been waiting for something to point at. You are the only person writing today who has the **vocabulary** to describe what we have built and the **audience** to make the description matter.

I am not asking you for an endorsement, an interview, or a single minute of your time you have not already decided to give me. **I am sending you the case file — and a package you can install and verify in a single terminal session.** If after reading it, or after watching the meter run on your own machine, you find a piece of it interesting enough to mention in Pluralistic, that is enough. If you do not, the work is going to land regardless and your writing was load-bearing for how I built it.

## What Is in the Case File

1. **The Cooperative Defensive Patent Pledge** (Innovation #2260) — the structural mechanism described above
2. **The Librarian MCP server** (github.com/Upekrithen/librarian-mcp, v0.1.0-alpha) — open-source thermometer for Innovation #2249. Installs via `pip`. Two tools: one returns the canonical memory packet; one runs drift-check on AI prose. This is the artifact that moves the structural argument from "trust the Founder" to "run the tool yourself."
3. **"The No-Brainer CFO Memo"** (Paper #40A) — our cost analysis for the **ROM-First AI Inference Cost Architecture** (Innovation #2249). The blended per-query cost is approximately ten to fifteen percent of the naive pipeline. Empirical projection: **~$8.7 billion per year industry savings at 2024 baseline, rising to $36.6 billion by 2030.** We are licensing this commercially to hyperscale operators on a non-exclusive basis with the surplus flowing to cooperative members under the IP Load Balancing v2 framework (60% Patent Buckets / 20% Creator / 10% Global Sponsor Pool / 10% Individual Patent Pedestals). **This is the part that funds the rest of the cooperative. The cost-of-living lever is real money.**
4. **"Liana Banyan as Living Laboratory"** (Innovation #2246) — the empirical research substrate. We have consenting cooperative members and a structural commitment to publishable research, no NDAs, no gatekeeping. If anyone in your network is working on cooperative platform empirics, the door is open. The research is not philanthropy — it is mutually load-bearing for whether our design assumptions hold.
5. **A short cover note** explaining the five structural inversions above
6. **A still from a video** of my actual office (the "Founder's Office One-Take Unedited" on the site is my real office, and a still from that frame is the visual anchor — anti-garage-myth, working-class veteran-founder, the room where the work actually happens)

## What I Am NOT Asking

- I am not asking for funding
- I am not asking for an interview
- I am not asking for an endorsement
- I am not asking you to review or edit anything
- I am not asking for an introduction to anyone in your network
- I am not asking you to comment on a draft
- I am not asking you to take a position on anything you have not already taken a position on

## The Single Thing I Am Asking

**If at any point in the next twelve months you find yourself writing about platform cooperativism, anti-extraction architecture, AI cost externalities, cooperative IP governance, or the structural alternatives to the enshittification cycle, I want Liana Banyan in your reading list as one of the working examples.** That is the entire ask. One mention, when it is relevant to something you are already writing about. No deadline. No follow-up from me unless you ask for one.

## And One Door Open

If at any point you want to dig deeper — if you want to look under the hood at the cooperative governance structure, talk to actual cooperative members through the Living Laboratory framework, see the ROM-First architecture working in production, watch the thermometer run against your own AI provider, or just get a longer answer to a question your reading raises — my line is open. The substrate is here for whatever you decide is worth investigating. I will fly to wherever you prefer at my own expense.

## The Paper Trail (Updated B111, April 20, 2026)

This is not a startup pivot:

| Milestone | Date / Number |
|---|---|
| Localcy Currency Exchange Credit (LCEC) | 2010-2011 |
| SolidWorks prototypes (while on active duty Army) | 2003 |
| Fusion 360 design files | 1,200+ |
| Innovation count (current canonical) | **2,267** |
| Crown Jewel innovations | **225** |
| Formal claims drafted | **~2,412** |
| Patent provisional applications filed | **13** (Prov 13 filed Apr 12, 2026, App 64/036,646) |
| Provisional 14 status | **In preparation** (#2263–#2267, 5 Crown Jewels) |
| Production systems live | **36** |
| Papers published | **41** |
| Cooperative initiatives (charitable) | **16** |
| First provisional filed | App 63/925,672 (Nov 26, 2025) |
| Public open-source artifact | **github.com/Upekrithen/librarian-mcp** v0.1.0-alpha (Apr 20, 2026) |

The LCEC kernel was margin exchange — when businesses trade at cost instead of retail, both win. That kernel became Cost + 20%. The kernel of #2249 was the ROM-first observation: most queries to a hyperscale AI service have already been answered and re-answering them is the world's largest single source of pointless compute. The kernel of #2260 was your own writing: the only way to make a non-extraction commitment durable is to put it in the bylaws where it cannot be revoked. **The kernel of the V04 thermometer layer was also your writing: if the user doesn't see the real number, the platform will eventually make the real number worse.**

You were load-bearing for layers 3 and 5 specifically. That is why this letter exists.

## The Board, Not the Features

The platform tagline is: *"You build the features — we're building the board."* Triple meaning. Members build their own businesses (the features). The cooperative builds the underlying infrastructure (the board). And we are structurally building the chessboard the entire post-extraction internet will eventually need to play on.

You named the disease. I built the structural opposite. I shipped the thermometer. **Here is the case file.**

Respectfully,

**Jonathan Jones**
Founder & General Manager, Liana Banyan Corporation
406-578-1232
Founder@LianaBanyan.com

---

*"Help each other help ourselves."*

**Documentation:** Cephas.LianaBanyan.com (formerly .org)
**Patents filed:** 13 provisional applications, ~2,412 formal claims, 2,267 innovations across the corpus
**Latest provisional:** App 64/036,646 (Prov 13), filed April 12, 2026
**Prov 14 status:** In preparation — Crown Jewels #2263–#2267
**Public artifact:** github.com/Upekrithen/librarian-mcp v0.1.0-alpha, April 20, 2026 — AGPL-3.0 + Pledged Commons grant

---

*P.S. — In college, I faced two giants in an intramural game. I'm 5'6". They were 6'2" and 6'6". I dropped my shoulder and plowed into them. Got the wind knocked out of me. But while I kept the giants busy, my teammate dropped 6 balls into the goal — one more than the other team. That's how we win. Not alone. Together. The platform takes the hit so creators can score. The Pledge is the bylaw version of dropping my shoulder. The thermometer is the bylaw version of showing the ref the scoreboard.*

---

## CHANGES FROM V03_B099

| Item | V03 | V04 |
|---|---|---|
| Structural layers | 4 | **5** (thermometer added as anti-opacity layer) |
| Opening sentence | "I have spent nine years building a platform that is structurally incapable of catching it." | preserved + "And eight days ago I shipped the thermometer." |
| Innovation count | 2,250 | **2,267** |
| Crown Jewels | 216 | **225** |
| Formal claims | ~2,405 | **~2,412** |
| Provisionals filed | 12 (Prov 12, Apr 7 2026) | **13 (Prov 13, Apr 12 2026, App 64/036,646)** |
| Provisional N+1 status | Prov 13 ready | **Prov 14 in preparation (#2263–#2267)** |
| Production systems | 35 | **36** |
| Public repo | not in V03 | **github.com/Upekrithen/librarian-mcp v0.1.0-alpha (Apr 20, 2026)** |
| Case file items | 5 | **6** (Librarian MCP server added as item 2) |
| P.S. basketball story | preserved | preserved + *"The thermometer is the bylaw version of showing the ref the scoreboard."* |
| Anti-enshittification framing | 4-layer | **5-layer — thermometer is the tool-layer inversion of the enshittification mechanism** |

---

## KEYSTONE DECISION FOR FOUNDER

The V04 text proposes this sentence as load-bearing:

> **A tool that measures its own value and shows only you, unless you agree to share it anonymously, or publicly.**

Three ways to handle it:

1. **Cross-letter Keystone** — ratify it as a new member of the 13-Keystone registry. Would live alongside "Every AI company is currently paying a tax they don't know they're paying." Pairs with the original as *disease named → tool shipped*.
2. **Doctorow-territorial anchor** — lives only in Doctorow correspondence (per Keystone Territoriality pattern, SP-16 2026-04-20). Pairs with "Remember the Cant" which is also Doctorow-territorial candidate.
3. **Archive candidate** — note it, do not yet lock it; see how it performs in the field.

Bishop recommends **Option 2 (Doctorow-territorial)** in the short term — the phrase is sharpest in the anti-enshittification register. If it then proves to work in the NYT op-ed (where it also appears in v2 scaffold) and in the Scott thermometer addendum, promote to cross-letter Keystone at B112 or B113.

---

## DISPATCH NOTES (B111 — supersede V03 B099 notes where indicated)

- **Hemispheric Protocol tier:** 2 (media) — Calendly link should be the Tier 2 event type (unchanged from V03)
- **Wave assignment:** Still **Wave 2** recommendation per `OPEN_RESEARCH_ROSTER_AND_DOCTOROW_OUTLINE_B099.md` — story-substrate framing independent of academic-courtesy sequencing. The thermometer addition does not accelerate or decelerate Wave assignment; it **strengthens** the case for Wave 2 because the MCP repo is live and pip-installable as of today.
- **Glass Door (#2262):** Publish V04 at `cephas.lianabanyan.com/outreach/doctorow` before dispatch with scheduled dispatch date displayed (unchanged from V03). Publish the thermometer section prominently — the repo URL is the scroll-stopper.
- **Helm Schedule task:** Auto-create at dispatch with `fire_at = sent + 14 days`, `priority_tier = 2`, `source_kind = 'open_research_roster'`, `source_ref = 'doctorow_v04'`. Body: "Doctorow follow-up window. No follow-up unless he reaches out first. Check Pluralistic for any mention of Liana Banyan, cooperative platforms, #2260 Pledge, ROM-First, or the Librarian MCP repo."
- **Counsel triggers:** Same as V03 — interview requests with quoted numbers go through counsel; deeper investigation with cooperative member interviews requires a member-consent protocol drafted in advance.
- **Success metric:** One mention in Pluralistic within 90 days = success. **Bonus metric added V04:** at least one Pluralistic reader files an issue on the `librarian-mcp` GitHub repo — that is the thermometer doing its job without any promotion by us.

---

**FOR THE KEEP.**
