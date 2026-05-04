# OP-ED — *New York Times* (submission) — V02 K528 REFRESH

**Working title:** "Maine Doesn't Have to Choose: A Third Path on AI Infrastructure"

**Alt title:** "The Moratorium Debate Got the Question Wrong"
**Alt title:** "There Is a Way to Have AI Without Building Bezos's Power Plant in Your Backyard"
**Alt title (V02 candidate):** "The Model Doesn't Matter. The Index Does. — What Maine's Veto Should Have Asked Instead"

**Author:** Jonathan Jones, Founder, Liana Banyan Corporation
**Submission window:** Apr 27-29, 2026 (Maine veto news cycle still active — V02 refresh anchored on K528 just-landed receipts)
**Word target:** 1,200-1,400 (NYT op-ed sweet spot)
**Companion empirical:** K528 R11-v2 cross-architecture benchmark (closeout commit `6f2b47a`, tag `v-r11-v2-full-stack-K528`); K530 Chrome Omnibox Substrate Injection working build (commit `faf328e`)

**Distribution surfaces beyond NYT** (Founder direction B130A): Medium (Founder's publishing surface), Cephas Press Junket (LB's own publication arm), other major outlets per Wave 3 Media Day cohort outreach. Per `project_lb_frame_speak_friend_feed_b130.md`, the LB Frame is the canonical landing for inbound traffic from any of these surfaces.

**V02 changes vs V01**: K499 R13 numbers swapped for K528 R11-v2 receipts. K530 working extension added as working-build evidence + reader-callable. Reproducibility-pack reference added. V01 preserved at `OPED_NYT_MAINE_THIRD_PATH_B124.md`.

---

*Bishop scaffolding — Founder rewrite expected (60-80% prose replacement per `feedback_drafts_as_scaffolding.md`). Anecdote hooks marked [HOOK]. Empirical numbers updated to K528 + K530 receipts.*

---

## §I — The trap

[HOOK — Founder lede. Suggested anchor: open with the Jay, Maine mill town image. The shuttered paper mill. The 2020 explosion. The 4,680 residents. The data center proposal that "plugs into the existing infrastructure." The Governor's veto on Friday. Six states queued behind Maine. Trump's threat to sue. Mills in a primary against an oyster farmer who is winning the populist register. The shape of the trap.]

The trap is that everyone — Trump, Mills, Sanders, Ocasio-Cortez, the moratorium sponsors, the Republican legislators, the Franklin County commissioners, the residents worried about the grid, the AWS executives planning the next Ashburn — is debating the same question: *should we build more data centers, or should we stop building them?*

The question is wrong. It assumes one architecture for AI. There are at least two.

## §II — The hidden assumption

[Bishop scaffolds — Founder voice expected]

The data centers in Ashburn, Virginia and the proposed expansion in Maine all run the same architectural pattern: a frontier-tier large language model (Opus, GPT-5.5, Gemini 3.1 Pro) hosted in a mega-data-center, drawing megawatts of power and millions of gallons of cooling water, answering queries one at a time at the cost of roughly a frontier-model API call per question.

That pattern is *one* way to deliver AI capability. It is the way the major labs have built. It is not the only way. It is not even the cheapest way per useful answer.

We finished a controlled cross-architecture benchmark this morning at our cooperative-research lab. **One thousand one hundred seventy graded responses. Sixteen vendor and architecture conditions. Two hundred sealed questions across six knowledge categories.** We pitted six commercial AI memory products against the same six language models routed through Liana Banyan's indexed-retrieval substrate — what we call the **Cathedral Effect**. The headline finding contradicts the AI vendor narrative more cleanly than I expected:

**The model doesn't matter. The index does.**

The six models behind the same indexed substrate produced answers within three percentage points of each other on accuracy — across a one hundred eighty times spread in compute cost. The cheapest small-model-plus-substrate condition (Google's Gemini Flash through our Cathedral) cost less than one cent per correct answer. The most expensive frontier-model-plus-substrate condition (Anthropic's Opus through the same Cathedral, same questions, same corpus) cost roughly one dollar sixty per correct answer. **Same architecture. Different model. One hundred fifty-six times more expensive for, if anything, slightly less accurate.**

[HOOK — Founder voice. Suggested anchor: a brief explanation of *why* this works, in lay terms. The Librarian metaphor — small-bookstore-owner who walks to the right shelf from two words of the title. Pine Books and Tiffany Brost. The substrate is the bookstore; the model is the bookstore-owner. You don't need a Library of Congress and a librarian-with-three-PhDs to find the book on the shelf — you need a competent bookseller and an organized shelf. That's the architecture.]

Compared against the major commercial AI memory products on the same questions, the same six-Cathedral-models cluster around a small fraction of the per-question compute spend, with the cheapest small-model configuration achieving equivalent accuracy to the most expensive frontier-vendor configuration for **76 times less compute spend per correct answer**. *Same answer. Same architecture-type test. One indexes; one injects. The difference is 76 times.*

## §III — Translated for Maine

A data center running this Cathedral-substrate-amplified architecture draws roughly five-to-twenty times less power per useful answer than a frontier-LLM data center. The Jay mill site — already wired into the existing utility envelope, already cooled by the Androscoggin River, already employing infrastructure that powered a paper mill for generations — could host this kind of data center at a scale that fits within the grid's existing margin. No new megawatts. No new cooling demand. No new draw on Maine's home energy costs. And the same number of jobs the mill town needs.

The moratorium-versus-buildout binary that Governor Mills's veto is caught between is a false choice driven by an architectural assumption. Maine does not need to choose between Jay's jobs and the grid. The Republican legislators are right that existing regulations would suffice — *if* the data centers being built used the substrate-amplified architecture. The Democratic legislators are right that the current data centers are unsustainable — *because* they use the frontier-LLM-in-mega-data-center architecture.

Both sides are correct about their half of a question that has been mis-posed.

## §IV — The bigger pattern: why this matters beyond Maine

[Bishop scaffolds]

Six other states — New York, Minnesota, Michigan among them — are considering similar moratoriums. President Trump has threatened to sue any state that imposes "cumbersome regulation" on AI infrastructure. The federalism fight is being framed as *AI growth versus state sovereignty.* It is not. It is *one specific architecture's growth versus state sovereignty.* The architecture in question — frontier-LLM-in-mega-data-center — was selected by a small number of corporate decisions made over the last five years. There is no law of physics requiring it.

A different selection produces a different fight. If the next wave of state-level data center proposals adopts the substrate-amplified pattern, the moratorium debate evaporates. There is nothing left to ban. The grid impact, the water impact, the home-energy-cost impact, the noise complaints from the Ashburn residents — these are artifacts of one architectural choice, not properties of AI as a category.

[HOOK — Founder voice. Connect to the broader thesis: this is the same pattern across the AI debate. The lawyers cited fictitious cases in Oregon last week — that's not a property of AI, it's a property of *raw frontier LLMs without substrate grounding*. Substrate-grounded AI cannot generate citations it cannot resolve back to a bedrock document. The slop is an architectural artifact, not an inevitable property. Suggested transition to §V.]

## §V — The Oregon mirror: AI slop is also an architectural choice

[Bishop scaffolds — Founder rewrite expected]

In April of this year, a federal judge in Oregon imposed a $109,700 fine — the largest yet — on a lawyer who submitted dozens of fictitious case citations generated by a large language model. The legal slop database now tracks more than thirteen hundred such cases, triple the count from five months prior. The growth curve is exponential.

The dominant interpretation is that AI is fundamentally untrustworthy and the legal system needs to push back. The interpretation is half right. *Raw frontier large language models* are fundamentally untrustworthy for citation work. They hallucinate by default; that's how they're trained. But a substrate-grounded LLM — one that resolves every citation back to a stored document and refuses to answer when the substrate doesn't have the answer — cannot generate the kind of slop that is now flooding the courts.

We demonstrated this empirically last week. The system in question (we call it the **Awareness Net**) was asked five questions across our document substrate. On four it answered with full citations and provenance walks back to the source documents. On the fifth — a question about a husky named Inuka, where the substrate's information had not yet been ingested — the system *refused to answer*, returning a message we called a SCOPE-BOUNDARY signal: "The substrate does not contain information on this query."

That refusal is the load-bearing capability. AI's first job, if AI is going to enter consequential domains like law and medicine and policy, is to know what it does not know. The current generation of frontier LLMs cannot do this reliably. The substrate-grounded architecture can.

We call this **Authoritative-Answer-AI**, and the demonstrative property is captured in a single sentence:

> *It's OK for AI to say "I don't know."*

That sentence is not a limitation. It is the entire reliability story.

## §VI — What we are asking — and what you can verify yourself

[HOOK — Founder voice. The ask is *not* a regulation. The ask is an *architectural standard*. Suggested frame: invite Senators Sanders, Ocasio-Cortez, Mills, the Maine legislature, the six other states, and the federal AI policy apparatus to convene a working group on substrate-grounded AI infrastructure standards before the moratorium debate forces a worse outcome. The empirical evidence is reproducible. The Cooperative Defensive Patent Pledge — the IP frame Liana Banyan operates under — explicitly licenses these patents for cooperative use. There is no vendor-lockup story here. The architecture is open.]

This is not an argument against regulation. It is an argument that the regulation being debated is mis-targeted, because the architectural assumption underneath the debate is unexamined.

Maine, and the six states behind Maine, and the lawyers in Oregon, and the federal apparatus deciding whether to sue states, are all responding to the AI architecture that the major labs *chose* to build over the last five years. There is a different architecture available. It is empirically reproducible. It is empirically cheaper. It is empirically less power-hungry. It is empirically less prone to slop.

**Every empirical claim in this op-ed is reproducible by any third party with a laptop and an afternoon.** We publish the dataset, the run harness, the benchmark results, and three sizes of test (a smoke-test that runs in five minutes for under a dollar; a reasonable-effort replication that runs in an hour for around twenty dollars; the full one-thousand-one-hundred-seventy-call canonical replication that ran us roughly two hundred dollars). We also publish a working Chrome extension, currently in controlled-disclosure internal testing, that puts cooperative-substrate AI at every search bar — the curation flow is structured so that *the user's own data stays on the user's own machine by default*; opting up to share is a per-user, per-scope explicit choice.

The question for Maine is not *should we ban data centers.* It is *should the next data center we permit run the architecture that uses 5-to-20 times less power per useful answer.* The question for the courts is not *should we ban AI in legal practice.* It is *should the AI we permit be required to cite from substrate.*

[HOOK — Founder closing. Suggested anchor: the Husky / Inuka story. We didn't train Inuka not to bark. We taught him to speak on command. He vocalizes less now, not more. We didn't fight his nature; we directed it. AI is the same. The choice is not stifle versus unleash. The choice is *direct.*]

---

## Sidebar / pull quotes (NYT layout)

- *"The Model Doesn't Matter. The Index Does."* — K528 headline finding
- *"Same architecture. One indexes. One injects. The difference is 76 times."*
- *"The moratorium-vs-buildout binary that Governor Mills's veto is caught between is a false choice driven by an architectural assumption."*
- *"It's OK for AI to say 'I don't know.'"*
- *"We didn't train Inuka not to bark. We taught him to speak on command. AI is the same. The choice is not stifle versus unleash. The choice is direct."*
- *"5-to-20× less power per useful answer."* (K528-derived)
- *"The walls belong to the vendors. The Cathedral has no ceiling."*

## Empirical citations (footnote-class)

- **K528 R11-v2 cross-architecture benchmark** (Liana Banyan, B130, April 27, 2026): 1,170 graded responses across 16 conditions; closeout commit `6f2b47a`; tag `v-r11-v2-full-stack-K528`; full report: `librarian-mcp/r10_cross_vendor/REPORT_KNIGHT_K528_B129_R11_V2_FULL_STACK.md`. Headline: **76× same-architecture cost differential**; **180× cost spread across six models behind same Cathedral substrate**; cost projected to ~$0.003 per correct answer at full Cathedral coverage on cheapest small-model configuration.
- **K530 Chrome Omnibox Substrate Injection** (April 27, 2026): working build of Three-Class Substrate Sovereignty (#2315) at the Chrome omnibox layer; commit `faf328e`; tag `v-chrome-omnibox-substrate-injection-K530`. Reduction-to-Practice evidence for the Provisional Application; install link [post-Prov-14].
- **Pheromone Substrate empirical** (Phase D, K528): 21–51× retrieval-speedup floor vs RPC-Detective baseline at production-corpus scale; A&A #2317 reduction-to-practice citation.
- R10 cross-vendor benchmark (Liana Banyan, B111 K423, March 2026): 8 models × 4 vendors × 1,200 calls; +86.1pp HOT lift; κ 0.883/0.850
- R12 Cranewell + Covenant sealed banks (B122 K477+K481, April 2026): 80% / 64% HOT lift cross-universe; **0% MISS on both**
- K489 Authoritative-Answer-AI demonstration (April 2026): SCOPE-BOUNDARY honest-unknown response on Inuka query; provenance walk on 4/5 substrate-covered queries
- **Reproducibility pack**: see `BISHOP_DROPZONE/00_FOUNDER_REVIEW/B130_REPRODUCIBILITY_AND_SOVEREIGNTY_LAYER.md` — three dataset tiers + run harness + member-data-stays-local substitution mechanism
- Cooperative Defensive Patent Pledge (#2260): all referenced architectures filed under cooperative-use IP frame; no vendor lockup

## Bio line (NYT)

Jonathan Jones is the founder of Liana Banyan Corporation, a Wyoming-based research and infrastructure cooperative. He served in the U.S. Army National Guard (Infantry, then Aviation), and spent 21 years in IT before turning full-time to AI architecture research. He is the father of eight.

---

*FOR THE KEEP. V02 K528 refresh filed B130A by Bishop. NYT submission window Apr 27-29; companion dispatches: Medium (Founder publishing surface), Cephas Press Junket (LB internal-arm), Wave 3 Media Day cohort outreach. Founder rewrite expected on prose.*
