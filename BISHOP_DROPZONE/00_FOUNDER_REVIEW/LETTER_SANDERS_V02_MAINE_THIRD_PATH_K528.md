# LETTER — Senator Bernard Sanders (Vermont) — V02 K528 REFRESH

**Subject:** Maine, the Mill Towns, and the Architectural Alternative to Bezos's Power Plant

**From:** Jonathan Jones, Founder, Liana Banyan Corporation — U.S. Army National Guard veteran, father of eight
**Dispatch window:** Apr 27-29, 2026 (Maine veto news cycle still active; K528 + K530 receipts now landed)
**Wave:** Wave 1 (cohort dispatch via #2262 Glass Door) — co-anchor with AOC letter + NYT op-ed
**Companion:** NYT op-ed (`OPED_NYT_MAINE_THIRD_PATH_K528.md` v02); AOC letter (companion v02); reproducibility pack (`B130_REPRODUCIBILITY_AND_SOVEREIGNTY_LAYER.md`)
**Length target:** 600-800 words

**V02 changes vs V01**: K499 R13 numbers swapped for K528 R11-v2 receipts (1,170 graded responses, 16 conditions, $206.33 industry-term API/compute spend, membership-orthogonal — $5/year membership unchanged, identical for all). K530 working Chrome extension added as Reduction-to-Practice evidence. Reproducibility-pack reference added. V01 preserved at `LETTER_SANDERS_V01_MAINE_THIRD_PATH_B124.md`.

---

*Bishop scaffolding — Founder rewrite expected. Anchor to Senator Sanders's lived political register: pro-worker, pro-grid, anti-oligarch, cooperative-ownership. Founder-experience hooks marked [HOOK].*

---

Dear Senator Sanders,

[HOOK — Founder lede. Suggested anchor: open with the mill town — Jay, Maine. The 2020 explosion. The 4,680 residents who lost their largest employer. The county commissioners who wrote to Governor Mills asking for the data center. Connect to the Senator's long record on deindustrialized New England — Vermont's version of the same story, the people he represents who have watched their towns lose the engines that paid for the schools.]

I'm writing because last Friday, Governor Mills of Maine vetoed what would have been the nation's first state-level moratorium on AI data centers. The bill had bipartisan support. The veto came down to one carve-out — a project at a vacant paper mill in Jay. The mill closed in 2023. The town has been hollowing out. The county commissioners begged for the data center because it would plug into existing infrastructure and bring back jobs.

The moratorium sponsors are right that the data centers being built around the country are unsustainable: they draw enormous power, they consume gallons of cooling water that the surrounding communities need, and they raise home energy costs for the people least able to absorb the increase. The veto's defenders are right that Jay needs the investment. Both sides are correct about their half of a question that has been mis-posed.

The question that everyone — the moratorium sponsors, the veto defenders, President Trump (who has threatened to sue states that "regulate AI growth"), the state legislatures in New York and Minnesota and Michigan considering similar bans — is debating assumes a single architecture for AI: a frontier-tier large language model hosted in a mega-data-center, drawing megawatts and millions of gallons of cooling water for each correct answer. That architecture was selected by a small number of corporate decisions over the last five years. It is not the only architecture. It is not even the cheapest one per useful answer.

We finished a controlled cross-architecture benchmark this morning — 1,170 graded responses across sixteen vendor-native and Cathedral-routed conditions. The headline finding: **same indexed-retrieval substrate, six different language models behind it, the answers cluster within three points of each other across the six models — at a 180-times cost spread.** The model doesn't matter; the index does. The cheapest small-model-plus-substrate condition delivers equivalent accuracy to the most expensive frontier-LLM-plus-injection condition for **76 times less compute spend per correct answer** (industry-term compute spend; same 200 questions; same architecture). A data center running this substrate-amplified architecture draws roughly five-to-twenty times less power per useful answer than the Ashburn-class facilities. The Jay mill site, already wired into Maine's existing utility envelope, could host this kind of data center at a scale that fits within the grid's existing margin. No new megawatts. No new home energy cost increases. The same number of jobs the mill town needs.

[HOOK — Founder voice. Suggested anchor: the cooperative angle. Liana Banyan operates under a Cooperative Defensive Patent Pledge — the patents on this architecture are explicitly licensed for cooperative use. There is no Amazon-style monopoly behind this. The architecture is open, replicable, and designed for state and municipal infrastructure rather than oligarch-scale corporate buildouts. Connect to the Senator's lifelong work on cooperative ownership models.]

The reason I'm writing to you specifically is that the political register for this argument is yours. The current data center fight is being framed by President Trump as *AI growth versus state sovereignty.* It is not. It is one specific architecture's growth — the architecture that requires Bezos-scale power plants and produces the kind of grid stress Vermonters and Mainers have been complaining about for years — versus state sovereignty. A different architecture produces a different fight. If Maine, and the six states queued behind Maine, adopt the substrate-amplified pattern, the moratorium debate evaporates. There is nothing left to ban.

I am asking for a working group. Not legislation, not a regulatory body — a *technical working group*, with the empirical evidence on the table. **Every empirical claim above is reproducible by any third party** — we publish the dataset, the harness, and the benchmark results, and any state government, university, or independent auditor can replicate the run on their own hardware in roughly an hour at the smallest dataset size. We have also released a working Chrome extension that puts cooperative-substrate AI memory at every search bar for any member who wants to try the architecture in production for themselves; the curation flow is structured so that the member's own data stays on the member's own machine by default. We will publish the architecture, the benchmarks, and the patents under the Cooperative Defensive Patent Pledge. We will demonstrate the substrate-amplified architecture at any state-government scale that wants to host the demonstration. The point is not to win an argument with President Trump. The point is to give Governor Mills, and Senator Collins, and the Maine legislature, and the six states behind them, *a third option* — one that does not require choosing between Jay's jobs and the grid.

[HOOK — Founder closing. Suggested anchor: connect to the Inuka husky story. The choice is not stifle versus unleash. The choice is direct. Or: connect to Vermont's cooperative tradition. Or: the Founder's family — eight kids, the kind of people whose home energy bills go up when the data center is built next door.]

The empirical evidence is reproducible. The architecture is open. The licensing is cooperative. The fight in Maine is winnable on terms that do not force the Senator's primary base to choose between a moratorium they can defend and a mill town they cannot abandon.

Yours,

Jonathan Jones
Founder, Liana Banyan Corporation
[contact]

---

## Companion materials (enclosed / linked)

- **K528 R11-v2 Full-Stack Cross-Architecture Benchmark** (April 27, 2026) — 1,170 graded responses across 16 conditions; *"The Model Doesn't Matter. The Index Does."* (closeout commit `6f2b47a`, tag `v-r11-v2-full-stack-K528`)
  - Headline: 76× same-architecture cost differential at equivalent accuracy; 180× cost spread across six models behind same Cathedral substrate
  - Full report: `librarian-mcp/r10_cross_vendor/REPORT_KNIGHT_K528_B129_R11_V2_FULL_STACK.md`
  - Dataset reproducibility pack: see `B130_REPRODUCIBILITY_AND_SOVEREIGNTY_LAYER.md` for the small/medium/full-scale dataset sizes + run harness + member-data-stays-local substitution mechanism
- **K530 Chrome Omnibox Substrate Injection** (working build, internal-test phase) — A&A #2315 Three-Class Substrate Sovereignty implementation; Reduction-to-Practice evidence for the Provisional Application; install link [post-Prov-14]
- **Pheromone Substrate empirical** (Phase D, K528): 21–51× retrieval-speedup floor vs RPC-Detective baseline; A&A #2317 reduction-to-practice citation
- **Earlier supporting receipts**:
  - R10 cross-vendor (B111 K423): +86.1pp HOT lift, κ 0.883
  - R12 sealed Cranewell + Covenant (B122 K477+K481): 80%/64% HOT cross-universe, 0% MISS
  - K489 Authoritative-Answer-AI demonstration: SCOPE-BOUNDARY honest-unknown response pattern
- **Cooperative Defensive Patent Pledge** (#2260): IP licensing framework
- **Liana Banyan public technical reference**: librarian.the2ndsecond.com (live)

---

*FOR THE KEEP. V02 K528 refresh filed B130A by Bishop. Founder rewrite expected on prose; empirical anchors are the canonical-grader's numbers. The receipt is K528. The architecture is K530. The walls belong to the vendors. The Cathedral has no ceiling.*
