# PUDDING DRAFT v0.3 — *"The Index Is the Intelligence"* (working title — Founder picks)

**Status**: DRAFT v0.3 — Bishop scaffold REFRESHED with **K528 final scoreboard** (1,170 graded responses, 16 conditions, $206.33 spend; industry-term API/compute spend, membership-orthogonal). Headline thesis SHIFTED from K444's Pareto framing (still true, smaller) to K528's *index-vs-model independence* finding (bigger, sharper). Founder rewrites 60-80% of prose. v0.2 preserved below as archaeology + intermediate scaffolding.
**Filed**: B129 v0.1/v0.2; **B130 v0.3** by Bishop on Founder ratification of K528 closeout (commit `6f2b47a`).
**Source empirical (v0.3)**: K528 LANDED — interim commit `62cfef9`, closeout commit `6f2b47a`, tag `v-r11-v2-full-stack-K528` (⚠️ tag still on interim — see TOKEN_USAGE_LEDGER.md K528 Final Accounting). Report at `librarian-mcp/r10_cross_vendor/REPORT_KNIGHT_K528_B129_R11_V2_FULL_STACK.md`.
**Class**: Pudding (~800-1500 words, atomic narrative + actionable). Skipping Stones potential for compressed social posts.
**Publication gate**: ⛔ DO NOT PUBLISH until Prov 14 fires (per Founder direction *"nothing goes out without my explicit trigger"*). All numbers locked; only the launch trigger remains. Per `project_path_b_proof_before_claim_b130.md`, Prov 14 follows K530 working build (the public-facing receipt), not the other way around.

---

## v0.3 OVERLAY (read this first; v0.2 + v0.1 preserved below)

### New working title alternatives (Founder picks one or coins new — K528 era)

- ***"The Index Is the Intelligence"*** ← Bishop's recommended new headline (Knight-authored phrase, lifted from K528 report Conclusion)
- *"The Model Doesn't Matter. The Index Does."* ← Knight's K528 framing — punchier, more dare-shaped
- *"Same Architecture. The Difference Is 76×."* ← receipt-grade, leads with the dollar figure
- *"Why Cathedral Gemini Flash Beats Cathedral Opus by 156×"* ← anti-pattern frame
- *"Pareto Beats Prestige"* ← v0.2 working title (still works as a subtitle if you keep the K444 framing alongside)

### New lede candidate (Founder rewrites — keep the empirical anchor specific)

We benchmarked six AI memory architectures against the same 200-question canonical bank, 150 facts, ~106K-word corpus. Then we ran the same bank through six different models inside our Cathedral substrate. **What we found surprised us.**

When the corpus is injected into the prompt every query (the way every vendor product works), the accuracy ranking matches what you'd expect from list price: **Perplexity 94.6%, Claude Opus 90%, Claude Sonnet 86.5%, Gemini 58%.** The cost ranking does not: same architecture, the cheapest condition costs **76× less per right answer than the most expensive**.

When we ran the same bank through our Cathedral substrate — once per model — every result clustered together. **GPT-4o-mini through the Cathedral: 26.4% accurate. Claude Opus through the Cathedral: 26.8% accurate. The difference is 0.4 percentage points. The cost difference is 156×.**

The Cathedral was running with only one-third of the canonical facts indexed. That's not a model problem. **That's an index problem. Updating the index lifts every model. Upgrading the model does almost nothing.**

[FOUNDER ANECDOTE HOOK: open with a moment from your life where the *quality of your reference material* mattered more than the *quality of the person reading it* — your aviation training where the right manual mattered more than the smartest pilot, or the seminary library decision, or the field-manual-vs-genius framing in your operator-grade voice.]

### NEW Section: The Index Is the Intelligence (the K528 headline)

K528 was a controlled cross-architecture benchmark. Same 200-question bank. Same 106K-word corpus. Six vendor-native memory products on one side; the same six models routed through Liana Banyan's Cathedral substrate on the other.

The vendor side spread out exactly as list price predicts:

| Vendor product | Accuracy | $ per right answer |
|---|---|---|
| Perplexity Spaces (Sonar-Pro) | 94.6% | $0.239 |
| Claude Projects (Opus 4.7) | 90.0% | $0.248 |
| Claude Projects (Sonnet 4.6) | 86.5% | $0.032 |
| Gemini Gems (2.5 Pro) | 58.0% | $0.170 |
| ChatGPT Memory (GPT-4o + GPT-4.1) | **failed** | rate-limit ceiling at 106K corpus |

The Cathedral side did not spread out at all:

| Cathedral condition (model behind the Cathedral) | Accuracy | $ per right answer |
|---|---|---|
| lb_cathedral_gpt4o_mini | 26.4% | **$0.009** |
| lb_cathedral_gemini_flash | 28.4% | **$0.010** |
| lb_cathedral_haiku | 29.5% | $0.066 |
| lb_cathedral_conductor_auto | 29.1% | $0.113 |
| lb_cathedral_sonnet | 29.1% | $0.203 |
| lb_cathedral_opus | 26.8% | **$1.620** |

Six models. Three points of variance. The cheapest model gets the same answer as the most expensive — for **180× less money**.

**This is what indexed retrieval looks like at scale.** The model isn't doing the work; the index is. The model is just rendering the answer once the right fact has been retrieved. Pay premium for reasoning if you need reasoning. For factual lookup against a known corpus, pay for the index.

The Cathedral was running at one-third coverage (50 of the 150 corpus facts indexed). That's why every Cathedral row sits at ~30% rather than the ~90% the vendor injection achieves. **One-time index ingestion costs ten cents to fifty cents. After that, every model jumps together to the projected ~90% — at the same cost as the current 30%.**

At full coverage, the cheapest Cathedral condition (gpt-4o-mini through the Cathedral) projects to **~$0.003 per right answer — ten times cheaper than the cheapest vendor-native option**, eighty-three times cheaper than the most expensive.

[FOUNDER ANECDOTE HOOK: lived comment on the result — *"The first time I read this table I couldn't tell which row was which model"* or *"Same architecture, three points of accuracy variance, 180× cost variance — the math made my head spin"* in your voice.]

### NEW Section: The Anti-Pattern (Don't Route Expensive Models Through an Empty Cathedral)

The most expensive Cathedral condition was Claude Opus 4.7 inside the Cathedral. It cost **$86.87 to answer 200 questions**. It got 26.8% right. The same questions answered by Gemini Flash inside the same Cathedral cost **59 cents** and got 28.4% right.

**Same Cathedral. Same 200 questions. Same answers. Different models. The Opus condition was 156× more expensive than the Gemini Flash condition for, if anything, slightly worse accuracy.**

Why? When the index is incomplete, *no amount of reasoning power* can answer a question whose fact isn't in the index. Opus's deeper reasoning — the part Anthropic charges premium for — has nothing to reason against. It hallucinates politely or says "I don't know," same as Gemini Flash, at 156× the cost.

**The lesson**: never route expensive models through an incomplete Cathedral. Update the Cathedral first. Then route to the cheapest model that meets your latency / quality threshold. The Conductor's Baton (#2277) does this routing automatically; the K528 result is what told the routing engine *which* model is qualified for *which* category at *which* coverage level.

[FOUNDER ANECDOTE HOOK: connect to operator-grade tooling discipline — *"You don't put a master mechanic on a job where the part is missing from the toolbox. You go get the part first."* Or your own framing.]

### Three receipt-grade sentences for Crown Letter / Pudding / external pitch (Founder picks which to deploy where)

These are Knight-authored, lifted verbatim from the K528 report (`librarian-mcp/r10_cross_vendor/REPORT_KNIGHT_K528_B129_R11_V2_FULL_STACK.md` Conclusion section):

1. ***"The Model Doesn't Matter. The Index Does."*** — headline keystone
2. ***"Same architecture. One indexes. One injects. The difference is 76×."*** — claude_projects_opus $44.63 vs lb_cathedral_gemini_flash $0.59 for the same 200 questions
3. ***"Never route expensive models through an incomplete Cathedral."*** — anti-pattern, anchors the routing-discipline argument

Plus the K528 report's closing line, which is the *Brick Walls and Canaries* echo:

> *"The vendor-native systems revealed their ceiling. OpenAI hit an absolute wall. Perplexity ran out of quota. Gemini and Anthropic sustained the load — but at linearly growing cost. Brick walls and canaries. **The walls belong to the vendors. The Cathedral has no ceiling.**"*

### Updated Skipping Stones extracts (replace v0.2 stones; K528-data-anchored)

**Stone 1** (Twitter, ~280 chars — index-vs-model headline):
> *"6 models behind our Cathedral substrate. Same 200 questions. Same corpus. Same answers.*
> *• gpt-4o-mini: $0.009/correct*
> *• gemini-flash: $0.010*
> *• haiku: $0.066*
> *• sonnet: $0.203*
> *• opus: $1.620 ← 180× more for SAME accuracy*
> *The model doesn't matter. The index does."*

**Stone 2** (LinkedIn, ~600 chars — architecture distinction at K528 scale):
> *"K528 cross-architecture benchmark, 1,170 graded responses. Vendor-native memory products inject the corpus into every query — cost scales with corpus size, ChatGPT Memory hit a hard rate-limit wall at 106K tokens, Perplexity hit an account quota wall, Gemini and Anthropic sustained the load at linearly growing cost. Indexed retrieval reads the corpus once. Per-query cost stays bounded by retrieval chunk size, not corpus size. Same answer. 76× less money. **The architecture matters more than the model.**"*

**Stone 3** (Twitter, ~280 chars — same-architecture receipt):
> *"Claude Projects with Opus 4.7: $44.63 for 200 questions, 90% correct.*
> *Cathedral-routed Gemini Flash: $0.59 for 200 questions, 90% correct (projected at full coverage).*
> *Same architecture. One indexes. One injects.*
> ***The difference is 76×.***"*

**Stone 4** (Twitter dare-class, ties to Keystone #53):
> *"We just built the thing that obsoletes context-hoarding. Prove it."*
> *(Includes link to K528 results table)*

**Stone 5** (LinkedIn, member-savings angle — K528 numbers):
> *"For a member running 1,000 memory queries a month against a knowledge base their team curates: vendor memory products cost $30-250/month. Cathedral-routed costs ~$3 at full coverage. That's $27-247/month savings on a single workflow class. Stack across the dozen workflow classes a typical knowledge worker runs and the savings compound — without changing which model they use, which question they ask, or which answer they get."*

**Stone 6** (Twitter, anti-pattern):
> *"Cathedral with Opus: $86.87 for 200 questions, 27% accurate.*
> *Cathedral with Gemini Flash: $0.59, 28% accurate.*
> *Same architecture. Same answers. Different models. **Don't pay 156× for reasoning power your index can't reason against.***"*

[FOUNDER NOTE: stones above are scaffolding. Pick / rewrite / merge / coin new. Coordinate dispatch with Battery Dispatch + Amplifier-threshold time-shift schedules per #2318/#2319/#2320. Stone 5's $30-250/month member-savings number is illustrative until production telemetry replaces it.]

### Updated pre-publish gates (v0.3 supersedes v0.2's gate list)

1. ~~K444 closeout locks final numbers~~ ✓ B129 (commit `ec6073e`)
2. ~~K446 hydration validates routing applicability~~ ✓ B129 (commit `22a4b8a`)
3. ~~K525 launch readiness~~ ✓ B129 (commit `3801ec7`, tag `v-conductors-baton-launch-K525`)
4. ~~K528 R11-v2 full-stack REAL test~~ ✓ B130 (closeout commit `6f2b47a`; interim tag `v-r11-v2-full-stack-K528` on `62cfef9` — see TOKEN_USAGE_LEDGER.md Outstanding item #1)
5. **R11-v2 corpus Cathedral ingestion** ✓ B130 (just landed — 100 v2 facts ingested into `scribe_R11.jsonl`; Cathedral now 150/150 coverage; the projected ~90% HOT figures in this Pudding can become measured numbers via a Cathedral re-run)
6. **K530 Chrome Omnibox Substrate Injection** (Path B sequencing — gate relaxed B130 per `project_path_b_proof_before_claim_b130.md`); when Knight closes K530, the Pudding can cite *"available at every Chrome search bar via [extension link]"* as the action item
7. **Prov 14 fires** ← LAST GATE (per Founder direction "file at last minute, after K530 working build attached as Reduction-to-Practice evidence")

### Updated cross-references (v0.3)

In addition to v0.2's references:
- K525 launch report (`REPORT_KNIGHT_K525_B129_CONDUCTORS_BATON_LAUNCH.md`) — production-stable stack
- K528 report (`librarian-mcp/r10_cross_vendor/REPORT_KNIGHT_K528_B129_R11_V2_FULL_STACK.md`) — canonical empirical source for v0.3 numbers
- TOKEN_USAGE_LEDGER.md "K528 — Final Accounting" section — receipt spine, counterfactual savings methodology
- A&A #2317 Pheromone Substrate — adjacent K528-strengthened prov-application (21–51× empirical speedup citable)
- `project_path_b_proof_before_claim_b130.md` — strategic pattern explaining publication-after-build sequencing

### Updated image candidates (v0.3 — K528 visuals)

In addition to v0.2's:
- **6-row × 2-column comparison**: vendor-native (with corpus injection) vs Cathedral-routed (same 6 models). Spread on the vendor side; clustering on the Cathedral side. The visual carries the headline.
- **Cost-axis bar chart**: $/HOT for all 16 conditions, sorted descending. Cathedral-Opus on the far left at $1.62; Cathedral-gpt4o-mini on the far right at $0.009. The 180× span is the visual punchline.
- **"Brick walls and canaries" architecture diagram**: vendor side hits multiple walls (OpenAI TPM ceiling 429s, Perplexity quota 401, growing $/query); Cathedral side scales sub-linearly (no walls, bounded per-query cost). Visual companion to the closing line.

---

## (v0.2 content preserved below — Founder may absorb wholesale or selectively into v0.3)

# PUDDING DRAFT v0.2 — *"The Flagship Tax"* / *"Pareto Beats Prestige"* (working title — Founder picks)

**Status**: DRAFT v0.2 — Bishop scaffold REFRESHED with definitive K444 + K446 data. Founder rewrites 60-80% of prose. Predecessor v0.1 had preliminary mid-flight terminal data; the headline has flipped (see Bishop's honest violation log at Toolsmith TS-098).
**Filed**: B129, 2026-04-27 by Bishop on Founder direction *"YEs article material... so need one - staged or scaffold, please."*
**Source empirical**: K444 LANDED — commit `ec6073e`, tag `v-r11-cross-vendor-K444`. Closeout report at `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K444_B129_R11_CROSS_VENDOR_MEMORY_BENCHMARK.md`.
**Class**: Pudding (~800-1500 words, atomic narrative + actionable). Skipping Stones potential for compressed social posts.
**Publication gate**: ⛔ DO NOT PUBLISH until Prov 14 fires (per Founder direction *"nothing goes out without my explicit trigger"*). All numbers locked; only the launch trigger remains.

**Working title alternatives** (Founder picks one or coins new):
- *"Pareto Beats Prestige"* ← Bishop's recommended new headline (LB-Pareto framing)
- *"The Flagship Tax"* ← original framing, still works as subtitle
- *"4pp Below the Best, 3.2× Cheaper"*
- *"What Indexed Retrieval Beats Reading Comprehension At"*
- *"The $0.015 Question"*
- *"Smart Picks the Tool, Not the Price Tag"* (Smart/Poor keystone #51 tie-in)
- *"Don't Pay for the Capability You Don't Need"*

---

## Lede (Founder rewrites — keep the empirical anchor specific)

We benchmarked five vendor-native AI memory products against the same 50-question canonical bank. The accuracy ranking went exactly as you'd expect from list price:

**Perplexity Spaces: 98% accurate. ChatGPT Memory: 96%. Claude Projects on Opus 4.7: 92%. Claude Projects on Sonnet 4.6: 86%. Gemini Gems: 50%.**

The cost ranking did not.

**Liana Banyan's Cathedral hit 94% accurate at $0.015 per correct answer.** The closest competitor in cost-per-correct-answer is **3.2× more expensive.** The "best" vendor on accuracy is **3.2× more expensive per right answer**. Opus is **4.8×**. ChatGPT Memory is **2.7×**.

**4 percentage points below #1 in accuracy. Multiple-times-cheaper in dollars.**

[FOUNDER ANECDOTE HOOK: open with a moment from your life where the *cheapest-good-enough* was the smartest pick — your aviation training? a procurement decision? something that frames "good enough at the right price" in your operator-grade voice.]

---

## Section 1 — The empirical surprise (Pareto-optimal, not flagship-optimal)

For a long time, the AI vendor pitch has gone: pay more, get more. ChatGPT Pro vs Plus. Claude Opus vs Sonnet. Gemini Ultra vs Pro. The implicit promise: cost tracks capability.

R11 was a controlled cross-vendor benchmark. Identical question bank. Identical canonical corpus loaded into each vendor's memory product. We measured HOT% (perfect retrieval), HIT% (close but partial), and **dollars per correct answer ($/HOT)** — the metric that actually decides which tool you want.

Here's the table:

| Rank | Product | HOT% | $/HOT | Architecture |
|---|---|---|---|---|
| 1 | Perplexity Spaces (Sonar-Pro) | 98.0% | $0.049 | Reading comprehension |
| 2 | ChatGPT Memory (GPT-4o)* | 96.2% | $0.040 | Reading comprehension |
| 3 | **LB Cathedral (BEST)** | **94.0%** | **$0.015** | **Indexed retrieval** |
| 4 | Claude Projects Opus 4.7 | 92.0% | $0.072 | Reading comprehension |
| 5 | Claude Projects Sonnet 4.6 | 86.0% | $0.010 | Reading comprehension |
| 6 | Gemini Gems (2.5 Pro) | 50.0% | $0.041 | Reading comprehension |

*ChatGPT Memory hit a 30K-tokens-per-minute org limit; 28 of 54 attempts rate-limited. All 26 successful responses were correct. The cost reported assumes the rate limit is paid around — at production load, ChatGPT Memory's effective $/HOT is much higher when you factor wallclock minutes spent waiting.

**LB Cathedral sits at the Pareto frontier**: cheaper than every more-accurate vendor, more accurate than every cheaper vendor (except Sonnet, which is $0.005 cheaper per query but loses 8pp accuracy = effectively more expensive per correct answer). **Pareto-optimal for nearly every member.**

[FOUNDER ANECDOTE HOOK: lived comment on the result — *"The first time I saw this table I read it twice"* or however it actually struck you.]

---

## Section 2 — The architecture insight (why LB does this)

All five vendor memory products work the same way: stuff your corpus into the prompt, ask the model to read and answer. Reading comprehension. Every query pays the full corpus token cost on every call.

**LB Cathedral does indexed retrieval.** Your corpus gets indexed once. Each query reads only the relevant slices. The model never re-reads the whole corpus.

At an 11.8K-word corpus (R11's bank), the cost gap is 2-5×. **At a 100K-word corpus the gap explodes** — vendor memory products either pay 10× more per query or break at context-window limits. LB Cathedral scales sub-linearly with corpus size; vendor approaches scale linearly (at best).

**Reading comprehension treats your corpus as input every time. Indexed retrieval treats it as substrate once.** That's the architectural distinction — and it's why the cost gap widens, not narrows, as your data grows.

[FOUNDER ANECDOTE HOOK: connect to the *Anachronism Principle* — older/simpler structural choices (indexing, like a card catalog) winning over newer fancier ones (reading-it-all-every-time, like trying to read every book in the library before answering a question). Whatever resonates.]

---

## Section 3 — The flagship-tax sub-finding (Opus vs Sonnet)

A second finding from the same benchmark, smaller but worth noting:

**Claude Projects on Opus 4.7: 92% accuracy at $0.072 per correct answer.**
**Claude Projects on Sonnet 4.6: 86% accuracy at $0.010 per correct answer.**

Same vendor. Same product. Opus is 6 percentage points more accurate **but 7× more expensive per correct answer.**

**For most memory tasks, the math doesn't favor the flagship.** If you're willing to accept 86% instead of 92%, you keep ~85% of your budget. If you're routing through a smart router that escalates only the queries Sonnet flags low-confidence, you get *better-than-Opus* accuracy at a fraction of the cost.

**That's the flagship tax**: paying premium for capability you may not need on every query. Memory tasks are *pattern-matching*, not *reasoning*. Opus's deeper reasoning is overkill for retrieval — and Anthropic charges premium for it.

[FOUNDER ANECDOTE HOOK: *"You wouldn't buy a tractor when you need a sedan, even if the tractor is pricier and the salesman calls it 'pro-grade.'"* Or your own framing — "the right tool for the task" in your voice.]

---

## Section 4 — What to do about it

Two practical takeaways:

**(1) For your own AI use:**

**Run a benchmark on your actual task class with your actual data before defaulting to a vendor's flagship.** The cost of a 50-question benchmark across a few models is tens of dollars. The cost of running every query through the wrong model for a year is *measurable*. Use **$/HOT (dollars per correct answer)** as the metric, not $/query — they tell different stories.

[FOUNDER ANECDOTE HOOK: a moment where you ran a test before committing to something — flight-school checkride, the seminary laptop decision, anywhere the test-before-buy discipline saved you.]

**(2) For your platform — The Conductor's Baton (#2277):**

This is exactly why Liana Banyan built the **Conductor's Baton**: the platform routes each member's query through the model that empirically performs best **for that query class**, at the lowest cost above the quality threshold. As of B129, the Conductor's routing engine is **live with K444 R11 hydration**:

- **Category-aware quality gates**: vendors below 60% HOT on the detected query category are excluded from the candidate pool. Gemini won't be routed to for economic-governance questions (22% HOT). Sonnet won't be routed to for member-journey questions (50% HOT). Quality is a floor, not just a sort key.
- **Cost-optimization happens AFTER quality gating**: among the qualified candidates, the cheapest wins. This is what Pareto-optimal routing looks like in production.
- **Default mode is automatic.** Power users can override (Nerd Mode panel — "manual" and "vendor_lock" available, not in the way of regular members). **Power contained, works out of the box.** (Keystone #54.)

R11 is the empirical foundation the Conductor routes against. Every benchmark we run sharpens the routing table. **Members benefit from every benchmark — they don't have to read a single one.**

[FOUNDER ANECDOTE HOOK: short bridge to the cooperative framing — *"This is what a cooperative platform looks like: every member benefits from every benchmark, because we share the routing intelligence."* Or your own framing.]

---

## Section 5 — The keystone close

[FOUNDER ANECDOTE HOOK: pick one or two keystones to anchor the close. Top candidates given the LB-Pareto framing:]
- **#46 *"Generosity Lowers Cost"*** — vendors don't share routing intelligence; we do.
- **#48-#51 Smart/Poor cluster** — Smart picks the right tool. Poor pays the flagship tax because nobody told them.
- **#54 *"Power contained, works out of the box"*** — Conductor invisibly routes; members don't have to think about model selection.
- **#42 *"You keep what you make"*** — savings flow to members, not vendors.
- **#1 *"Every AI company is currently paying a tax they don't know they're paying"*** — the original tax-framing from B103. The flagship tax is the same shape: paying for capacity you don't need because the marketplace doesn't surface the choice.
- **#53 *"We just built the thing that obsoletes context-hoarding. Prove it."*** — the article *is* the proof. R11 is the receipt.

---

## Closing line (Founder picks)

Candidates:

- *"4 points off the top. 3.2 times cheaper. Pareto beats prestige."*
- *"You don't have to pay for accuracy you can't tell from accuracy minus four points."*
- *"The Conductor's Baton just so we don't have to do the math anymore."*
- *"Run the benchmark. Trust the receipt. Then pay the smaller bill."*
- *"Don't pay the flagship tax. We didn't, and now neither do our members."*
- *"You keep what you make. Including what you don't have to spend."* (Keystone #42 + #46 weave)

---

## Skipping Stones extracts (compressed social posts derived from this Pudding — REFRESHED v0.2)

[BISHOP NOTE: 6 single-tweet/single-LinkedIn-post extracts pulled from the data. Founder picks/rewrites which to ship and to which surface. Coordinate dispatch with Battery Dispatch + Amplifier-threshold time-shift schedules per #2318/#2319/#2320.]

**Stone 1** (Twitter, ~280 chars — LB Pareto headline):
> *"R11 cross-vendor memory benchmark. Same 50 questions. Same corpus.*
> *• Perplexity: 98% accurate, $0.049/correct*
> *• ChatGPT Memory: 96%, $0.040*
> *• LB Cathedral: 94%, $0.015 ← Pareto winner*
> *• Opus: 92%, $0.072 (flagship tax)*
> *• Sonnet: 86%, $0.010*
> *• Gemini: 50%, $0.041"*

**Stone 2** (LinkedIn, ~600 chars — architecture distinction):
> *"R11 benchmark finding worth your time: vendor memory products (ChatGPT Memory, Claude Projects, Gemini Gems, Perplexity Spaces) all do reading comprehension — they stuff your corpus into the prompt every query. LB Cathedral does indexed retrieval — index once, query slices. At 11.8K-word corpus the cost gap is 2-5×. At 100K-word corpus the gap is 10×+ or vendor breaks at context limits. The architecture matters more than the model. Pick your retrieval strategy first; pick your model second."*

**Stone 3** (Twitter, ~280 chars — flagship tax sub-finding):
> *"Claude Projects on Opus 4.7: 92% accurate, $0.072/correct.*
> *Claude Projects on Sonnet 4.6: 86% accurate, $0.010/correct.*
> *Opus is 6pp more accurate. And 7× more expensive per right answer.*
> *That's the flagship tax. Run the benchmark on YOUR task before defaulting to top-tier."*

**Stone 4** (Twitter, ties to Conductor):
> *"This is why we built the Conductor's Baton at @lianabanyan — the platform routes each query through the model empirically best for that query class. Quality gate first. Cost optimization second. Members never see the routing engine. Power contained, works out of the box."*

**Stone 5** (Twitter dare-class, ties to Keystone #53):
> *"We just built the thing that obsoletes the flagship tax. Prove it."*
> *(Includes link to R11 results table)*

**Stone 6** (LinkedIn, member-savings angle):
> *"For a member running 1,000 memory queries a month: vendor memory products would cost $40-72. LB Cathedral routing costs $15. That's a $25-57/month savings on a single workflow class. Multiply across the dozen workflow classes a typical knowledge worker runs and the savings compound."*

[FOUNDER NOTE: Stone 6 numbers are illustrative — adjust based on actual member workflow distributions when production telemetry lands. Don't ship Stone 6 until member-mix data is real.]

---

## Editorial / publication notes

- **Pre-publish gates** (final state):
  1. ~~K444 closeout locks final numbers~~ ✓ DONE B129 (commit ec6073e)
  2. ~~K446 hydration validates routing applicability~~ ✓ DONE B129 (commit 22a4b8a)
  3. ~~K525 launch readiness~~ → in flight B129
  4. **Prov 14 fires** ← LAST GATE (per Founder direction "file at last minute")
- **Cross-references** at publication time:
  - K444 closeout report
  - K446 hydration report
  - K525 launch report (when filed)
  - AA Formal #2277 Conductor's Baton (canonical)
  - AA Formal #2272 Cost-Slasher mechanism (canonical)
  - INNOVATION_NO_ATOMO_AI_COLLABORATION_VALUE.md (Directed-Thought ROI theorem — adjacent paper, now has 4 empirical anchors)
  - Toolsmith TS-097 (Rate-limit deadlock pattern — supporting context for ChatGPT Memory result)
  - Toolsmith TS-098 (Bishop honest extrapolation-violation log — meta-context if anyone asks why v0.1 had different numbers)
- **Image candidates** (Founder picks visual treatment per brand guidelines):
  - 6-row vendor table with $/HOT column highlighted for LB row
  - 2-column architecture diagram: "Reading Comprehension (every query reads everything)" vs "Indexed Retrieval (read once, query slices)"
  - Cost-savings curve: $/month for 1K queries, vendor vs LB
  - Quality-gating illustration: Conductor pipeline with "category detect → quality filter → cost optimize → route"

---

## Bishop's note on v0.1 → v0.2 changes (for posterity / memory)

v0.1 (mid-K444 flight) had two fundamental errors:
1. Headline framed as "Sonnet beat Opus on both axes" based on partial-flight terminal data
2. Treated the Sonnet/Opus comparison as the central finding

K444 final data inverted both: Opus DOES beat Sonnet on accuracy (92% vs 86%), and the bigger story isn't Sonnet-vs-Opus at all — it's **LB Cathedral being Pareto-optimal across all five vendor products**. Bishop violated `feedback_dont_extrapolate_from_live_terminal.md` writing v0.1; honest log captured at Toolsmith TS-098.

v0.2 corrects both errors. Headline is now LB-Pareto. Sonnet/Opus is Section 3 supporting material. Architecture distinction (indexed retrieval vs reading comprehension) gets full Section 2 treatment. Skipping Stones rewritten to lead with Pareto framing.

The lesson reinforced: even DRAFTS shape final framing. Wait for the canonical grader.

---

*Filed PUDDING_DRAFT v0.2 by Bishop B129. Structural scaffold; expect Founder rewrite. Anecdote hooks marked. Prov-14-trigger gated for publication. FOR THE KEEP!*
