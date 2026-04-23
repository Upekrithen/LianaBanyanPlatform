# A&A Formal #2277 — The Conductor: Vendor-Neutral Adaptive Model Router for Member Queries

**Innovation #:** 2277
**Category:** AI Infrastructure / Adaptive Routing / Vendor-Neutral Economics / Continuous Empirical Benchmarking
**Crown Jewel:** **YES — FOUNDER-RATIFIED B117**
**Bishop Session:** B117 (Formal draft). Originated: Founder strategic question during B117 post-K437-re-run exchange: *"can we make the 'choose the right model' code an integral part of cathedral? Maybe with a toggle switch so users can override into manual. And then we can REALLY test the Librarian AI Companion with the 4 majors, and allow it to choose which model to use. That would be pretty powerful to see."* Founder ratified name "**The Conductor**" same session with mythology-cue: *"First strings... now brass... now tympani!"*
**Date:** April 23, 2026
**Author:** Bishop (Claude Opus 4.7, 1M context)
**Patent Relevance:** **PRIMARY** — fresh inclusion in Prov 14 thresh. Strategic defense against AI-major native model-routing features that are structurally incapable of cross-vendor neutrality.
**Related:** #2275 (AI Companion Vendor-Neutral Bridge — the distribution vehicle), #2270 (Scribes Cathedral — the content substrate the Conductor routes over), #2269 (Three Fates Routing Pipeline — sibling routing primitive, different scale), #2272 (Cost-Slasher Claim Ladder — the claim this operationalizes at runtime), #2276 (Scribe Coverage Discovery — the diagnostic that parallels runtime routing-quality telemetry).
**Implementation artifact:** TBD (engineering K-session post-filing, likely K446). Design decisions captured in this A&A; Knight prompt to follow after Founder ratification locks the naming + toggle-mode semantics.

---

## TL;DR (2 lines)

**The Conductor** listens to a member's query, classifies it across a declared complexity taxonomy (retrieval-only / reasoning-required / creative / code-generation / multi-step-planning), and routes it to the empirically-best model-vendor pair (Anthropic / OpenAI / Google / Perplexity) for that class — with a **three-mode toggle** (auto-route / manual / vendor-lock) and a **continuous online benchmark** where every Nth query runs in parallel across multiple vendors to keep the routing-ranking self-correcting. Cost-Slasher becomes dynamic; R11 becomes infrastructure; vendor-lock becomes a member choice, not a platform constraint.

---

## Orchestra Metaphor (mythology-consistent with The Baton / The Anvil / The Fates / The Cathedral)

- **The Cathedral (#2270):** the sheet music. What the orchestra has memorized + can play from.
- **Models across vendors:** the instruments. Haiku = piccolo (bright, fast, small). Opus = full orchestra (rich, slow, expensive). Gemini Flash = flute (cheap, legato). GPT-5 = french horn. Sonar-Pro = strings section (research-first).
- **The Conductor:** the router. Doesn't play an instrument. Decides which section comes in when. "Now piccolo." "Now full brass." "Now tympani for the climax."
- **The Member:** the audience AND the first chair. Sets the program, decides what the orchestra plays, and hears the result.

The Conductor doesn't generate answers. The Conductor decides *which instrument generates the answer.* Every member's query is a passage; every passage has a best instrument for it; the Conductor knows which one — and learns as it listens.

---

## The Problem

Every member using AI today faces a three-way lose:

1. **Vendor lock-in is the default.** ChatGPT Memory lives in GPT. Claude Projects live in Claude. Gemini Gems live in Gemini. Perplexity Spaces live in Perplexity. A member who wants the right model for each task has to manually context-switch between four products, losing their memory state each time.
2. **Model selection is a guess at every query.** Even inside one vendor (e.g., Anthropic's Haiku 4.5 vs Sonnet 4.6 vs Opus 4.7), members either always use the most expensive (wasteful) or always use the cheapest (loses accuracy on hard queries) or try to guess per-query (cognitive tax).
3. **Marketing claims about cost are static.** "Haiku is 19× cheaper than Opus at equivalent accuracy on canonical-retrieval tasks" (Cost-Slasher #2272) is empirically true on our corpus — but a single-static-table claim doesn't *deliver* the savings to members. It tells them the savings exist; it doesn't realize them.

Existing solutions fail at least two of the three:

- **OpenRouter / Portkey / Together.ai:** cross-vendor API aggregators. Developer picks model or uses simple rules; no semantic query-classification; no continuous benchmarking; no member-facing cost-savings visibility; no cooperative-platform economics.
- **Martian router, LangChain routers:** ML-informed model routing within limited vendor sets; mostly dev-tooling, not member-product; no Cathedral integration; not cost-optimized per member.
- **AutoGPT / agent orchestrators:** specialist-agent routing patterns; task-level, not query-level; no vendor-neutrality; no per-member adaptation.

The gap: a **member-facing, cooperative-platform-integrated, Cathedral-aware, continuously-benchmarked, toggle-controlled, cross-vendor model router** that (a) classifies queries by complexity, (b) routes to empirically-best instrument, (c) exposes the savings to the member in real dollars, and (d) improves its own ranking over time via self-instrumenting telemetry.

---

## Mechanism

### Query arrival + Cathedral handshake

When a member submits a query to the Companion (#2275), the Conductor intercepts before any vendor API call:

1. **Cathedral consult (cheap).** `consult_scribes` (K436 MCP tool, extended to `member_consult_scribes` per K438) retrieves top-K relevant Scribe entries from the member's personal Cathedral + opted-in Guild/Commons.
2. **Complexity classification (cheap).** A small local classifier (~200-1000 tokens, possibly a Haiku-4.5 call OR a purely local heuristic depending on perf budget) tags the query along the declared complexity taxonomy:
   - `retrieval-only` — answer is substantively present in Cathedral content
   - `reasoning-required` — answer requires synthesis + inference beyond Cathedral content
   - `creative` — open-ended generation (writing, brainstorming, design)
   - `code-generation` — structured code output with correctness criteria
   - `multi-step-planning` — requires task decomposition + tool-use-like reasoning
   - Plus any additional classes Bishop + Founder ratify (pipeline supports taxonomy extension)

### Routing ranking (Conductor's decision logic)

A **ranking table** per (complexity-class × member-preference) stores the empirically-best model-vendor pair with confidence intervals. Initial values seeded from R11 benchmark (#K444); updated continuously from online benchmark mode (below).

Example ranking at B117 baseline (hypothetical, to be set empirically post-R11):

| Complexity class | Best model (auto) | Runner-up | Cost-delta evidence |
|---|---|---|---|
| retrieval-only | Haiku 4.5 + Cathedral | Gemini 2.5 Flash + Cathedral | 1.3× cheaper per correct |
| reasoning-required | Opus 4.7 + Cathedral | GPT-5 | 5× more accurate; costs 3× more |
| creative | Opus 4.7 | Sonnet 4.6 | Creative judgment is Opus's strength |
| code-generation | Sonnet 4.6 | GPT-5 | Near-tie on accuracy; Sonnet cheaper |
| multi-step-planning | Opus 4.7 | Sonnet 4.6 + extended thinking | Opus's tool-use planning is canonical |

The Conductor picks the best row for the query's class + applies the member's toggle.

### Three-mode toggle

Member selects per query OR globally:

1. **Auto-route (default).** Conductor picks the empirically-best model for the detected class. Cost-optimization on. Privacy: query shape tagged with class label only; no payload retained beyond session.
2. **Manual.** Conductor's recommendation is shown alongside a picker; member overrides. The recommendation is a suggestion, not a gate. Power-user friendly.
3. **Vendor-lock.** Member declares "always route to Anthropic" (or any declared vendor). Useful for regulated contexts (some orgs require single-vendor audit trails), privacy-maximalists, contract obligations.

### Vendor key management — two supported models

**Model A — BYOK (Bring Your Own Key):**
- Member supplies their own Anthropic / OpenAI / Google / Perplexity API keys via Companion settings
- Companion stores keys local-only (member's machine) or encrypted at rest (if they opt for LB-hosted Companion)
- Billing flows directly to member's vendor accounts; LB never sees payment
- Maximum privacy; maximum cost control; member is their own ops team

**Model B — LB-Proxy with usage-billing:**
- Member uses LB's consolidated vendor keys via an LB-hosted proxy
- Billing is per-query to the member's LB account (passed through at cost + Cost+20% margin, matching platform economics)
- Abstraction benefit: single invoice, no per-vendor account management
- Privacy trade: LB-proxy sees the query (subject to declared privacy policy, encrypted in transit, zero retention beyond session unless member opts in to Commons-content contribution per #2267)

Both models coexist — member chooses per Companion install. Default proposal: BYOK for the free tier; LB-Proxy for the $5/yr paid tier (as a convenience benefit, not a lock-in).

### Continuous online benchmark (every Nth query runs across multiple vendors)

The routing-ranking cannot be stale. Self-instrumenting protocol:

1. Every **Nth member query** (N declared; default proposal: N=50, so ~2% of queries) runs in parallel across the top-3 candidate models for that class
2. Responses are scored by a grading module (either R10 three-tier rubric for objective tasks, OR a preference-elicitation pass for subjective tasks — member rates "which answer was better?")
3. Scores feed the ranking table's confidence intervals; if a non-default model consistently beats the default, the Conductor promotes it
4. Parallel-run cost is amortized across the 49-other-queries that used the winning default — amortized cost per query stays close to single-vendor single-model cost
5. Aggregated anonymized routing telemetry (with member opt-in per #2260 Cooperative Defensive Patent Pledge framework) feeds the Commons Scribe for "which vendor wins which class" — future members inherit smarter-default Conductors

This is R11 as infrastructure, not experiment. Every month the Conductor's routing gets better without any Bishop/Knight intervention, because more queries = more data.

### Member-visible cost-savings report

Monthly dashboard shows:

- **Total spend this month:** $X.YY across Z vendors
- **Savings vs always-cheapest alternative** (e.g., "if you'd routed everything to GPT-4o-mini, you'd have spent $A — Conductor saved you $B")
- **Savings vs always-premium alternative** (e.g., "if you'd routed everything to Opus 4.7, you'd have spent $C — Conductor saved you $D")
- **Accuracy gain from Cathedral:** "On Cathedral-covered queries, you got +16.7pp accuracy lift vs no-Cathedral baseline"
- **Per-class breakdown** so the member can see "most of my work is retrieval-only → Conductor routed 82% of queries to Haiku → that's where your savings came from"

Transparency as a product feature. This is the Thermometer Keystone (#16) applied to cost: the meter is on the member's dashboard, not in our marketing.

### Cooperative-economic flywheel

The Conductor has the same participation-driven improvement property as the Cathedral (#2270 / #2276), but on a different axis:

- More Cathedral members → more query volume → more parallel-run telemetry → sharper ranking → better routing → lower costs → more value per membership → more members. The ranking table's accuracy scales with member count.
- AI-major competitors can't replicate: each major only sees their own traffic (by API ToS), so their router (if they built one) could never be cross-vendor. The Conductor can be cross-vendor *only because* a cooperative platform sits outside any single vendor's API perimeter.

**Quantified claim (forward-looking, testable post-K446):** Conductor-routed queries deliver mean cost-per-correct **50%+ cheaper** than single-vendor single-model routing at equivalent accuracy — AND this delta *widens* over time as the ranking sharpens.

---

## Novelty Analysis

### Prior art and gaps

| Prior art | What it does | What The Conductor adds |
|---|---|---|
| OpenRouter / Portkey / Together.ai | Cross-vendor API proxy | No query-class classification, no continuous benchmark, no member-facing cost report, no Cathedral integration, no cooperative economics |
| Martian router | ML-informed model selection | Dev-tooling, not member-product; no Cathedral; no toggle modes; no cooperative flywheel |
| LangChain / LlamaIndex routers | Keyword/rule-based LLM routing | Static rules; no online learning; no cross-vendor; no member-visible economics |
| Anthropic / OpenAI model-picker recommendations | "Use Sonnet for X, Opus for Y" static guides | Documentation; not runtime; no enforcement; single-vendor only |
| Agent orchestrators (AutoGPT, CrewAI) | Specialist-agent dispatch | Task-level, not query-level; no cross-vendor cost optimization; no Cathedral |
| Multi-armed-bandit learning systems | Explore/exploit over action space | Generic ML primitive; not applied to cross-vendor LLM routing with Cathedral integration |

### Novel combination

1. **Cathedral-aware routing classification.** The classifier knows whether Cathedral content substantively answers the query (retrieval-only → cheap model suffices) vs whether external reasoning is needed (complex model warranted). Existing routers don't consult a per-member knowledge substrate.
2. **Three-mode member toggle** (auto / manual / vendor-lock) with manual-picker-seeded-by-recommendation. Distinguishes the Conductor from both fully-automatic (opaque) and fully-manual (burden-shifted) alternatives.
3. **BYOK AND LB-proxy dual-key-management** architecture with member-chosen per install. Existing cross-vendor routers assume one model or the other; The Conductor supports both and lets the member pick.
4. **Continuous online benchmark as a first-class routing input** — every Nth query parallel-runs across vendors to keep the ranking fresh. Existing routers update rankings via offline eval runs; The Conductor updates them in production with amortized cost.
5. **Member-visible cost-savings dashboard** tied to Thermometer Keystone (#16) discipline — the savings claim is not marketing, it's the dashboard. Self-auditing at point-of-reader-contact per #2272.
6. **Cooperative-economic flywheel over vendor-agnostic telemetry** (Claim 10-class property matching #2276). AI majors cannot replicate because they only see their own traffic.
7. **Orchestra-instrument metaphor as pedagogical + user-interface anchor.** "The Conductor routes queries to the right instrument" is user-understandable without explaining ML; the UI labels can use instrument names (Haiku as piccolo, Opus as full orchestra) to make model choice legible to non-technical members.

### What we are NOT claiming

- Cross-vendor API aggregation is not novel.
- ML-based model routing is not novel.
- Continuous eval is not novel.
- Cost dashboards are not novel.
- **What is novel is the specific combination: (Cathedral-aware query classification) + (three-mode member toggle) + (BYOK + LB-proxy dual key management) + (continuous online benchmark as routing input) + (member-visible cost-savings dashboard) + (cooperative-economic flywheel via anonymized cross-vendor telemetry) + (orchestra-instrument metaphor as user-interface anchor), applied to LLM-query routing in a cooperative-platform member-product context.**

---

## Claims (proposed for Prov 14)

### Independent claims

**Claim 1 (Method).** A computer-implemented method for routing LLM queries from a cooperative-platform member to one of a plurality of vendor-hosted LLM services, comprising:

(a) upon receipt of a member query, consulting a per-member domain-indexed knowledge store (Cathedral) to determine retrieval-relevance between the query and stored member content;

(b) classifying the query into one of a declared taxonomy of complexity classes, the taxonomy comprising at least: a retrieval-only class, a reasoning-required class, a creative class, a code-generation class, and a multi-step-planning class, wherein the Cathedral consultation of step (a) informs the classification;

(c) selecting a model-vendor pair from a ranking table, the ranking table storing, per complexity class, at least one recommended model-vendor pair with an associated empirical performance score;

(d) applying a member-selected toggle state from at least: an auto-route state in which the selected pair from step (c) is used; a manual state in which the selected pair is surfaced as a recommendation and a member override is accepted; and a vendor-lock state in which only a declared subset of vendors is considered;

(e) routing the query to the resulting model-vendor pair via a key-management layer that supports at least: a first mode in which per-query API calls use member-supplied credentials, and a second mode in which per-query API calls use cooperative-platform-supplied credentials with usage billing to the member's platform account;

(f) on every Nth query (N declared), running the query in parallel across at least two candidate model-vendor pairs from the ranking table and updating the ranking table's empirical performance scores with the parallel-run outcomes.

**Claim 2 (Apparatus).** A system comprising: a Cathedral module implementing Claim 1(a); a classification module implementing Claim 1(b); a ranking table module implementing Claim 1(c); a toggle module implementing Claim 1(d); a key-management module implementing Claim 1(e) with dual-mode support; a continuous-benchmark module implementing Claim 1(f); and a member-facing cost-savings dashboard displaying per-period savings versus declared single-vendor baselines.

**Claim 3 (Cooperative-economic flywheel property).** The method of Claim 1 wherein aggregated routing telemetry across a plurality of cooperative-platform members — aggregated under declared consent-gating per cooperative-platform licensing terms — feeds the ranking table's empirical performance scores, such that the ranking table's accuracy monotonically improves with cooperative-platform membership growth, and such that this improvement property is structurally unavailable to any single-vendor LLM provider whose routing system would have visibility only into that vendor's own traffic.

### Dependent claims

- **Claim 4.** The method of Claim 1 wherein the complexity classification of step (b) is performed by a small local classifier whose inference cost is less than 10 percent of the subsequent routed-query inference cost, such that classification overhead does not defeat the cost-optimization objective.
- **Claim 5.** The method of Claim 1 wherein the ranking table further stores, per complexity class, at least two recommended model-vendor pairs with confidence intervals, and wherein the continuous-benchmark step of Claim 1(f) preferentially selects the two or three highest-confidence candidates for parallel runs.
- **Claim 6.** The method of Claim 1(d) wherein the manual state surfaces the auto-route recommendation to the member alongside a picker enumeration of alternative model-vendor pairs, such that the member's override decision is informed by the ranking table's recommendation rather than unassisted.
- **Claim 7.** The method of Claim 1(e) wherein the first mode (member-supplied credentials) stores keys locally on member-owned hardware by default, and the second mode (cooperative-platform-supplied credentials) is opt-in with explicit disclosure of privacy and billing implications at opt-in time.
- **Claim 8.** The method of Claim 1(f) wherein the parallel-run outcomes are scored via a declared rubric that distinguishes objectively-gradable tasks from subjectively-gradable tasks, with the member's preference signal incorporated as the grading source for the latter.
- **Claim 9.** The method of Claim 2 wherein the member-facing cost-savings dashboard further reports at least: savings versus always-cheapest-alternative, savings versus always-premium-alternative, per-complexity-class routing distribution, and accuracy lift attributable to Cathedral consultation.
- **Claim 10.** The method of Claim 1 wherein the model-vendor pair space comprises at least four vendor families (e.g., Anthropic / OpenAI / Google / Perplexity) and at least two tiers per vendor (cheap/fast and expensive/accurate), such that the routing decision is genuinely cross-vendor and not a single-vendor tier-picker.
- **Claim 11.** The method of Claim 3 wherein the aggregation consent-gating preserves per-member privacy by anonymizing per-query identifiers before aggregation, and wherein the cooperative-platform's licensing grant (per declared Cooperative Defensive Patent Pledge) explicitly covers this telemetry aggregation pattern.
- **Claim 12.** The method of Claim 1 wherein the routing decision, toggle state, and cost-savings report are exposed to the member via a user interface whose model labels use instrumentation-metaphor identifiers (e.g., "piccolo" for Haiku-class, "full orchestra" for Opus-class), rendering model selection legible to non-technical members without requiring ML literacy.

---

## Sequencing + Prerequisites

- **K438 Member Cathedral** must ship first (provides the `member_consult_scribes` MCP tool + per-member storage substrate that Claim 1(a) depends on)
- **K444 R11 benchmark** must run first (produces the seed ranking-table values Claim 1(c) initializes with)
- **K446 Conductor engineering** is the implementing K-session. Estimated 2 Knight sessions (routing + classification + key management is complex enough to warrant split)
- **R11 v2** re-runs with Conductor-augmented condition after K446 ships, producing the flywheel-verified numbers the marketing claim cites

**Target Conductor ship date:** ~3-4 weeks from B117 (post Prov 14 filing, post K438 member Cathedral, post K444 R11).

---

## Empirical substrate — what today already supports

- **K437 SEALED-50 post-B117-Scribe-expansion (commit `8b11811` + registry expansion in `00a475e`):** established that Cathedral content is the load-bearing input to Haiku's accuracy (+27.8pp lift on Cathedral-covered categories vs 0pp on uncovered). The Conductor's retrieval-only classification hypothesis rests on this: IF a query's answer is Cathedral-adjacent, THEN cheap model suffices.
- **R10 Eyewitness Benchmark (K423):** cross-vendor 8-model x 4-vendor data establishing that per-vendor per-model cost-vs-accuracy deltas are large and stable enough to route over. Gemini 2.5 Flash $0.0001 / COLD — Opus $0.1272 / HOT = 19x cost delta at identical 98.7% HOT accuracy is the canonical example the Conductor capitalizes on at runtime.
- **B064 Founder dialogue on trademark strategy (Librarian MCP trademark reasoning):** cross-vendor AI ecosystem fragmentation is accelerating; member-facing products need cross-vendor neutrality to remain relevant. Empirically-grounded strategic framing for why The Conductor is time-critical.

---

## Cross-References

1. **#2275 AI Companion Vendor-Neutral Bridge** — the distribution vehicle. The Conductor runs inside the Companion. Companion without Conductor = vendor-neutral memory only; Companion with Conductor = vendor-neutral memory + vendor-neutral query routing. The full vendor-neutral stack.
2. **#2270 Scribes Cathedral architecture** — the content substrate the Conductor's Claim 1(a) consults.
3. **#2269 Three Fates Routing Pipeline** — sibling routing primitive at a different scale. Fates route exchange-content to Scribes (ingest-side). Conductor routes queries to vendors (retrieve-side). Both use scoring + ranking but on orthogonal axes.
4. **#2272 Cost-Slasher Claim Ladder** — the static marketing claim this operationalizes at runtime. Cost-Slasher says "up to 95% cheaper"; Conductor delivers the savings per query.
5. **#2276 Scribe Coverage Discovery** — the diagnostic for Cathedral content gaps. Parallel: Claim 3's flywheel is the diagnostic for routing-ranking gaps. Both drive continuous improvement via empirical telemetry.
6. **Thermometer Keystone (#16)** — "A tool that measures its own value and shows only you, unless you agree to share." Conductor's cost-savings dashboard is the Thermometer applied to AI spend.
7. **#2260 Cooperative Defensive Patent Pledge** — licensing framework under which anonymized telemetry aggregation (Claim 11) operates.

---

## Pollination Checklist

- [x] Save as A&A formal in `12_Innovations_AA/` (this file)
- [ ] Add entry to `PROV_14_DRAFT.md` Section 2 for #2277 (B117 follow-on, same session)
- [ ] Update `MEMORY.md` canonical numbers: 2,269 → 2,270 innovations; 227 → 228 Crown Jewels
- [ ] Counsel review — specifically ask whether Claim 12's orchestra-metaphor UI labeling is patent-claimable as a method step or should be recharacterized as a user-interface convention
- [ ] K446 Knight prompt post-Prov-14-filing (rough scope: complexity classifier + ranking table + 3-mode toggle + BYOK/LB-proxy dual key management + benchmark harness + savings dashboard = 2 Knight sessions)
- [ ] Update Companion marketing copy at `librarian.the2ndsecond.com/companion` (when that page lands) to center the Cost-Slasher-delivered-dynamically-by-Conductor pitch
- [ ] Pair with R11 v2 paper outline — the paper that cites "LB Companion routed queries 50%+ cheaper than any single-vendor alternative at equivalent accuracy"

---

**Innovation count:** +1 (new canonical innovation ratified B117). **Total: 2,270 innovations.**
**Crown Jewels:** +1 (**#2277 RATIFIED B117 BY FOUNDER** — "The Conductor" name + orchestra mythology ratified in same exchange). **Total: 228 Crown Jewels.**
**Claims:** +12 claims (3 independent, 9 dependent) proposed for Prov 14.

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). Tenth A&A Formal of the Prov 14 thresh — the vendor-neutral adaptive router that turns the Cost-Slasher from a static claim into a live service, the Cathedral from retrieval-only into retrieval-plus-adaptive-compute, and the Companion from a vendor-bridge into a vendor-orchestrator. Founder's canonical phrasing ratified in-session: "First strings... now brass... now tympani!" The Conductor does not play an instrument. The Conductor decides which instrument plays. That distinction is the patent.*

**FOR THE KEEP.**
