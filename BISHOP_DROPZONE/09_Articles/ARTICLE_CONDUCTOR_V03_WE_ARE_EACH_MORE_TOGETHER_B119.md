# We Are Each More, Together
## Why Your Next AI Tool Shouldn't Ask You to Shift Gears

*Op-Ed — April 2026 — V03 Bishop structural pass — Founder rewrite expected per `feedback_drafts_as_scaffolding.md`*
*Target: consumer tech press (Verge, Hard Fork, Platformer, Stratechery). Secondary: cooperative-economic outlets (NYT op-ed, The Atlantic, Doctorow). Tertiary: AI-industry publications (Simon Willison, Ben Thompson).*
*V03 changes from V02 marked with `[V03]`. New title elevates the cooperative thesis; automatic-transmission metaphor retained as subtitle hook. Network-effects section is the new structural backbone.*

---

[FOUNDER ANECDOTE HOOK: open with a moment — maybe the one where you bounced between ChatGPT and Claude on the same question, paid twice, got the wrong answer from one, or the first time you showed someone the $19× cost delta and watched their face]

Right now, every time you ask an AI something, you're shifting gears.

You're picking between ChatGPT and Claude and Gemini and Perplexity. Between the free tier and the paid tier. Between the fast model and the smart model. Between the one that remembers your projects and the one that has live web search. You probably have two or three subscriptions. You've definitely asked one tool a question it was bad at, paid for a wrong answer, and re-asked the same thing to a different tool.

Drivers in 1950 knew that feeling. Shifting a manual transmission required attention every time you changed speed. You had to know the engine, know the road, know the clutch. You were always half-thinking about what the car needed next.

Then Detroit invented the automatic transmission, and most drivers never shifted again.

**We built the automatic transmission for AI.**

The user is still driving. You still decide what question to ask, what problem to solve, what tone to take. That part is always going to be yours. But you shouldn't have to pick which model answers each query any more than you should have to pick which gear to be in. Our tool picks. You drive.

And if you *prefer* manual — some people do; I'm one of them; I drive stick-shift by choice — there's a switch on the dashboard. Go right ahead. The automatic is the default, not the only option.

---

## How much are you overpaying?

Here's the number that made us build it.

We benchmarked eight AI models from four vendors on twelve hundred test questions. Single-blind. Double-graded. Academic-publishable methodology. On the hard questions that require a lot of context, Anthropic's Claude Haiku scored **98.7%** accuracy at **$0.0067 per query**. Anthropic's Claude Opus — their premium, expensive model — scored **the same 98.7%**, at **$0.1289 per query**.

Nineteen times the cost. Same accuracy.

For a mid-sized nonprofit with fifty case managers each running maybe twenty AI-assisted queries a day, that's the difference between a **$1,700 annual AI bill and a $33,500 annual AI bill**. For a freelancer doing research, it's the difference between spending **$10 a month and spending $190**. The savings are there to be had. But only if something is watching — query by query, task by task — to route you to the right model.

That's what a good automatic transmission does. It watches your foot on the gas, the grade of the hill, the load in the bed, and it picks the right gear. The driver never thinks about it. The engine always runs at its efficient RPM.

Our tool — we call it **The Conductor** internally, after the person who doesn't play an instrument but cues each section of the orchestra to come in when the music needs them — does the same thing for your AI use. It watches the question you're asking, the context the tool has on you, the class of problem you're in, and it picks the cheapest AI model in the world that will answer that specific question correctly.

Sometimes that's Haiku. Sometimes it's Gemini Flash. Sometimes it's Opus. Sometimes it's GPT-5 for code, or Perplexity for research-with-citations. You never have to think about it.

---

## [V03 — NEW SECTION] Why "together" is the word that matters

The title of this piece says *we are each more, together.* Most op-eds about cooperative software say that and leave it as a feeling. I want to show you where the word *more* lands, concretely, across this platform — because it doesn't mean one thing. It means five things, and they stack.

**1. More users means a smarter router.** This is the most technical version. Every query the Conductor handles contributes one anonymous data point about which vendor won which kind of question. A single user generates maybe 4,000 of those per year. Ten thousand users generate 40 million. A hundred thousand generate 400 million. The router's ranking table gets sharper with every member who joins. Not because anyone sees your queries — we use cryptographic hashes, not the queries themselves — but because the *shape* of what wins what is a collective fact. A solo user cannot know that. A cooperative can.

**2. More users means more Scribes in the Cathedral.** This is the version that matters for memory. Our platform maintains a shared library of provenance-tracked content — what we call the Scribe Cathedral. Each Scribe covers a domain (engineering, decisions, design, finance, story). When we ran a controlled experiment last quarter, adding three more Scribes lifted our AI answer accuracy by nineteen percentage points in categories that had coverage and left uncovered categories flat. The mechanism is visible; the effect is bounded; the fix is durable. **More members means more Scribes to cover more domains. More Scribes means more accuracy. More accuracy means less wasted spend on wrong answers. Every new member improves the answer quality for every existing member.**

**3. More users means more marketplace volume — and volume discounts flow back.** This is the version that matters for every good and service on the platform. When you order prints from Printful through a LB node, or print-on-demand canisters for your guild, or subscribe to a service a cooperative member offers, the platform aggregates those orders. Volume brings cost down. That savings is mechanical — not a discount we decide to offer, but a cost we no longer pay. The Cost+20% structural bylaw means you see the reduction directly: our margin stays at 20% above actual cost, so when volume lowers cost, your price drops. *Every member who joins lowers the price for every existing member.* The kitchen economics behind Stone Soup are the same math as every modern supply chain — but on this platform, the aggregated buying power belongs to the members, not a middleman siphon.

**4. More users means more voice at the table.** Every member holds one share in the governance. When we dispatch a Glass Door letter — our public-by-default outreach mechanism — the members vote whether it goes. Ten members voting have a tin ear. Ten thousand have a chord. A hundred thousand have an instrument the outside world actually has to answer to. This isn't voting theater. Crown Letters to backers and patrons in the last year ran with the assumption that the signatory speaks for *someone.* In a cooperative of fifty, the signatory speaks for fifty. In a cooperative of fifty thousand, the signatory speaks for fifty thousand. The math of attention shifts.

**5. More users means a larger patent bucket protecting everyone.** The intellectual property filed under the platform is held in three structured buckets — one of which is a shared pool that every member draws defensive benefit from. Every innovation filed is one more piece of shared armor against predatory copying. When a competitor tries to patent-troll any member, they face the whole bucket, not one creator. *The larger the membership, the more filings, the thicker the armor.*

Now read those five again. Each one is true on its own. **But notice what they compound to when you stack them.** A new member joins → the router gets sharper, the Cathedral gets denser, the marketplace volume drops prices, the governance voice grows, and the defensive patent bucket thickens — all in the same signup. One $5-a-year action. Five compounding benefits. Not for the platform — *for every other member.* And because every benefit reciprocates, the new member gets the four benefits the *previous* members already built up, too.

This is what people mean when they say a cooperative is more than the sum of its parts. Usually that sentence is a mood. Here it's arithmetic.

**We are each more, together.** The phrase isn't a feeling. It's a description of what the system does.

---

## "But doesn't the AI company pick for me?"

No. The AI company picks *within their own product.* That's the part most people don't realize.

Claude's Memory lives inside Claude. ChatGPT's Memory lives inside ChatGPT. Gemini's Gems live inside Gemini. Perplexity's Spaces live inside Perplexity. Each one is a walled garden. Inside it, the vendor routes intelligently. **Outside it, they don't talk to each other, because they can't.** Anthropic's router can't send a query to OpenAI and see if OpenAI does the job cheaper, because Anthropic is a competitor to OpenAI and their legal terms of service forbid exactly that comparison.

Only a company that sits *outside* any single vendor can route across vendors. That company needs to be neutral — structurally, not rhetorically. It needs to have no reason to favor Anthropic over OpenAI over Google over Perplexity. It needs to be accountable to the people whose queries it routes, not to the vendors whose services it buys.

That's a cooperative platform. We happen to be one. [FOUNDER ANECDOTE HOOK: you've written elsewhere about why cooperative *structure* is the only way to stay neutral. The AI routing use-case might be the cleanest example of that general principle. Worth a sentence connecting back?]

---

## [V03 — NEW SECTION] Don't take my word for it — the whole industry is asking for this

Docker surveyed more than 800 developers, DevOps engineers, and technical leaders about the state of agentic AI this year. The answers don't need interpretation; they need to be read out loud:

- **Seventy-six percent** of respondents report active concerns about vendor lock-in. In France it's 88%. In Japan 83%. In the United Kingdom 82%. ^[Docker, *State of Agentic AI*, 2026]
- **Forty-five percent** say ensuring AI tools are "secure, trusted, and enterprise-ready" is the single hardest challenge they face in scaling AI.
- **Forty-four percent** report they struggle to find trustworthy Model Context Protocol servers — the open standard that's becoming the backbone of how AI agents talk to external tools.
- **Forty percent** name security as the number-one blocker to scaling agents, period.
- The survey's own framing line, verbatim: *"Effective agent development is about context engineering. This means giving the right prompt, with the right tools and data, to the right LLM."*

And AI researcher Andrej Karpathy, cited in the same report, describes this not as a "year of agents" but as a **decade-long transformation.** ^[Karpathy, *via The Decoder, 2025*]

Read those numbers with our platform in mind. **Vendor lock-in is the problem.** The Conductor is the answer — structurally vendor-neutral because a cooperative cannot be acquired or favor-captured. **Context engineering is the job.** The Scribe Cathedral is the instrument — provenance-tracked, member-contributed, measurably accurate. **Trustworthy MCP servers are missing.** We ship one on PyPI today, six months ahead of the 44% asking for one.

The industry named the gaps. The cooperative answer already exists. That's what V03 of this essay is now trying to tell you.

---

## How it gets smarter

Here's the part that makes the math really work. Every fiftieth question the Conductor handles, it sends *in parallel* to three different vendors and watches which one produced the best answer. Not secretly — members can see this happening on their dashboard. The extra queries cost pennies, amortized across the other forty-nine that used the default. But those pennies buy something valuable: fresh, real-world data about which vendor wins which kind of question *this month.*

Last month it was Haiku for retrieval-heavy work. Next month, maybe a new Anthropic model ships that beats it. The month after, maybe Google releases something cheap and fast. The Conductor keeps up. Your routing gets sharper while you sleep.

And because this is a cooperative — because every member who uses it contributes anonymized routing data to the collective ranking — the Conductor gets smarter the more members there are. A single user couldn't collect enough data to know which vendor wins which class. Ten thousand users can. A hundred thousand users can set the table for the next million.

**No AI vendor can do this.** They'd need to see their competitors' traffic. They'd never get it.

---

## What this is not

- It isn't a wrapper that adds a 20% markup to your AI bill. We charge **$5 a year** for cooperative membership. The cost savings from the routing are yours.
- It isn't a new AI model. It's a better way to use the ones that exist.
- It isn't trapping your data somewhere you can't get to. You can install the whole thing on your own machine and keep using it after you cancel. **That's not a policy — that's a design commitment.** The tool ships with a standalone reader so you can use your accumulated context forever, with any AI that comes along later, no vendor required.

---

## What I lose by picking auto

Not much. You give up the dopamine of having found the cleverest model for a specific query. You give up the feeling that you're on top of AI cost management. You lose the argument with your skeptical friend who says "but how does it KNOW." (Answer: it doesn't always know; it has a confidence interval for every decision; it tells you when it's guessing.)

In exchange, you stop thinking about AI infrastructure. You think about the thing you were trying to do in the first place.

---

## The dashboard is the pitch

The real evidence isn't this essay. It's the monthly report that shows up in your account:

> *This month the Conductor made 4,318 routing decisions for you. It sent 72% of your queries to Haiku, 19% to Gemini Flash, 6% to Opus, and 3% to GPT-5 for code. You spent $34.72 in AI inference costs. If you'd run every one of those queries on Opus alone, you'd have spent $541.20. If you'd run every one on GPT-4o-mini alone, you'd have gotten 11 wrong answers, costing you an estimated three hours of rework.*

That's the **Thermometer principle** applied to AI spend: the meter runs on your terminal, not in our marketing. You check your savings against your own books. We never have to ask you to take our word for anything.

---

## If you're already an AI power user

You might prefer stick-shift. Good. Flip the toggle to **Manual** and the Conductor shows you its recommendation alongside a picker — you override whenever you want. For ninety-nine percent of your queries you'll agree with the recommendation. For the other one percent, you're the driver, and the driver always wins.

If you're a regulated organization that needs every query logged to a single vendor for audit purposes, flip to **Vendor-Lock** and the Conductor only considers the vendor you declare. Same transmission, manual gear ratio, locked.

**Auto for most people. Manual for those who prefer it. Fixed gear for those who need it. Three modes, one driver, always you.**

---

## The bigger claim

Every few years a piece of software shifts from "thing you operate" to "thing that operates itself." Spell-check. Autocorrect. GPS routing. Autopilot lanes on highways. Each one looked like a toy before it became infrastructure. Each one had a period where early adopters said *"but I prefer the manual version"* and they were right for themselves and wrong about the general public.

Your AI use in 2026 is at that inflection point. Manual model selection is where spellcheck was in 1995 — technically optional, increasingly embarrassing if you don't have it.

**The question isn't whether someone builds the automatic transmission for AI. The question is whether it's built by a vendor who wants to keep you in their walled garden, or by a cooperative that keeps your memory portable and your router neutral.**

We built ours the second way. It's a member-owned cooperative. $5 a year. Thirty-six production systems in the background. Fourteen provisional patent applications backing the architecture. Member-owned memory. Vendor-neutral routing. Open-source codepath under AGPL. Commercial license available for companies that need it.

[FOUNDER ANECDOTE HOOK: Close with the founder-voice — why this specifically, why now, why this structure. One or two sentences of personal stake. The kind of line that makes a skeptical reader decide the tool might be worth trying.]

You're driving. You always will be.

We just built the transmission.

And because this one runs on a cooperative — because every new driver makes the engine smarter, the parts cheaper, and the road wider for everyone else — we can say something a solo-vendor AI tool can never say without lying:

**We are each more, together.**

---

**Jonathan Jones**
Founder & General Manager, Liana Banyan Corporation
U.S. Army National Guard veteran. Father of eight.
Founder@LianaBanyan.com | 406-578-1232

**Learn more / join:** [lianabanyan.com/companion](https://lianabanyan.com/companion)

---

*Not left or right. Forward.*

---

**Word count:** ~2,450 (V02 was ~1,770; V03 adds ~680 via two new sections — network-effects taxonomy and Docker-industry-data corroboration)

**Target:** consumer tech press (primary) + cooperative-economic outlets (secondary) + AI-industry publications (tertiary, new in V03). Pitch list in companion doc.

**Angle:** automatic transmission for AI as the mass-market framing; cooperative-economic structural moat as the "why they can't copy" kicker; **network-effects taxonomy** as the "why it gets better not worse at scale" proof. Title "We Are Each More, Together" is Founder-originated keystone (B119) promoted from tagline-candidate to primary title.

**Keystones used:** automatic transmission (B117 canonical), Thermometer (#16), "Not left or right. Forward.", **"We are each more, together." (B119, intended-as-title subclass, first of class)**.

**Supersedes:** V02 structural scaffolding — V03 title promoted, two new load-bearing sections added, V02 prose otherwise preserved for Founder to rewrite.

**V03 structural changes from V02:**
- Title changed from "The Automatic Transmission for AI" → "We Are Each More, Together" (subtitle "Why Your Next AI Tool Shouldn't Ask You to Shift Gears" preserves V02's hook).
- NEW section "Why 'together' is the word that matters" — enumerates five compounding network-effects lanes across LB (router data, Scribe Cathedral, marketplace volume discounts, governance voice, patent bucket). This is the structural backbone Founder requested: showing the keystone is arithmetic, not mood.
- NEW section "Don't take my word for it — the whole industry is asking for this" — cites Docker 2026 State of Agentic AI report (76% lock-in, 45% trust gap, 44% MCP trust, context-engineering-verbatim quote, Karpathy decade-not-year). Positions LB as the already-built answer to named gaps.
- Closing keystone line "We are each more, together." added as the final beat after the transmission close.
- Patent count bumped 13 → 14 provisional applications (Prov 14 filing today, per B119).
- Version stamp updated; V01/V02 preserved as-is.

**Follow-on:** companion technical brief V03 (when Founder authorizes) — same Docker-data + network-effects additions but aimed at Willison / HN. Canada 40K op-ed V03 still carried separate track.

---

*Drafted B119, April 23, 2026. Bishop V03 structural pass on V02 B118 scaffolding. Title promoted to Founder keystone. Network-effects taxonomy is the new structural core. Car metaphor is canonical (Founder-ratified B117); orchestra metaphor is the internal-mythology framing for A&A #2277. This article uses the car metaphor throughout for consumer accessibility, with Founder keystone elevating the cooperative thesis to primary position.*
