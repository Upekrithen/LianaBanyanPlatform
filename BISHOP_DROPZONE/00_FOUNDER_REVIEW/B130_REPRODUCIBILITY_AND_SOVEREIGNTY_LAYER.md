# B130 — Reproducibility + Member-Data-Sovereignty Layer

**Filed**: B130A, 2026-04-27 by Bishop on Founder direction.
**Founder direction (verbatim)**: *"We need to make all that available for proof — the screenshots, the files use as datasets — small to large, so that anyone can review and replicate EASILY, as well as Substitute in their OWN data — which STAYS on THEIR machine unless chosen otherwise, explicitly (And that would require a STAMP after become a member? I don't like that much barrier, but it is also VERY secure)."*

**Purpose**: define the canonical reproducibility-pack + member-data-sovereignty pattern that wraps every empirical receipt (K528, K530, K-future) into something a third party can review, replicate, AND substitute their own data into — with the substitute data STAYING on their machine by default and only escalating to shared scope through explicit, sovereign opt-in (Three-Class Substrate Sovereignty per #2315).

This document is **the architectural decision** for the reproducibility surface. Specific deliverables that implement the decision are scoped here for K-future dispatch (probably K533 or K534-class).

*(Augur tuners: $5/year membership unchanged, identical for all; "industry-term API/compute spend, membership-orthogonal" applies throughout.)*

---

## Why this layer exists

Every K-empirical-receipt the platform produces (K528 cross-architecture benchmark, K530 Chrome extension, K523 Pheromone Substrate, K525 Conductor's Baton stack, future R-series benchmarks) is published-with-claims. Founder direction extends this: published-with-claims is necessary but not sufficient. **Replicable-by-anyone, substitutable-with-their-own-data, sovereign-by-default** is the durable pattern.

Three integrated requirements:

1. **Reproducibility for proof** — anyone can take our receipts off the shelf, run them on their own machine, and verify or refute the empirical claims. This converts every claim into something an auditor / journalist / academic / state-government IT department can validate independently. *No appeal to authority; the receipt verifies itself.*
2. **Substitution for relevance** — anyone can replace our canonical corpus with their own corpus (their company's documents, their state legislature's records, their classroom curriculum, their family genealogy, anything) and get the same shape of architectural advantage measured against their own data. *The empirical claim generalizes; we just produced one set of numbers; theirs are their own.*
3. **Member-data-sovereignty by default** — when someone substitutes their own data, that data STAYS on their machine. No phone-home, no telemetry, no upload, no opt-out-required-to-be-private. The Three-Class architecture (#2315) holds: ephemeral-by-default, opt-up to Personal-Permanent (still local), explicit further opt-up to Shared-Permanent at member-chosen scope.

These three are the same pattern at three layers: **architectural-claim layer (anyone can verify), product-relevance layer (anyone can ask their own questions), member-sovereignty layer (anyone keeps control of their own answers).**

---

## Tiered dataset sizes (small → medium → full-scale)

The reproducibility pack ships **three dataset sizes** so a third party can pick the right tier for their available compute / time budget:

### Tier 1: Smoke-test (~2-5 minutes, sub-$1 compute spend, runs on a laptop)

- **Corpus**: 10-fact subset of R11-v2 (~5K words, ~10K tokens)
- **Question bank**: 20 sealed questions (3-4 per category)
- **Conditions**: 1 cold baseline + 1 vendor-native (claude_projects_sonnet) + 1 LB Cathedral (lb_cathedral_haiku) = 3 conditions × 20 questions = 60 calls
- **Estimated industry-term API/compute spend, membership-orthogonal**: ~$0.50-1.00 total
- **Wall-clock**: 2-5 minutes
- **Use case**: a journalist, a curious developer, a university teaching assistant who wants to confirm the receipts work as described before committing more time

### Tier 2: Reasonable-effort replication (~30-60 minutes, ~$10-30 compute spend, runs on standard dev machine)

- **Corpus**: 75-fact subset (the original R11-v1 50 facts + 25 selected R11-v2 facts; ~30K words, ~50K tokens)
- **Question bank**: 100 sealed questions (medium-depth coverage of all 6 categories)
- **Conditions**: 4 cold baselines + 3 vendor-native + 4 LB Cathedral = 11 conditions × 100 questions = 1,100 calls
- **Estimated industry-term API/compute spend, membership-orthogonal**: ~$10-30 total
- **Wall-clock**: 30-60 minutes
- **Use case**: an independent auditor, a state government IT team, a corporate evaluation, an academic doing follow-up research; produces statistically meaningful comparisons across architectures

### Tier 3: Full-scale K528 replication (~2-6 hours, ~$200-300 compute spend, requires standard API budgets)

- **Corpus**: full R11-v2 150-fact corpus (~58K words, ~106K tokens)
- **Question bank**: full 200 sealed questions
- **Conditions**: all 16 K528 conditions × 200 questions = 3,200 graded calls
- **Estimated industry-term API/compute spend, membership-orthogonal**: ~$200-300 total (matches K528's $206.33 actual spend)
- **Wall-clock**: 2-6 hours depending on rate limits
- **Use case**: replicate the K528 canonical benchmark exactly; produce numbers comparable to the published K528 receipts

---

## Substitution layer — anyone can put their own corpus + their own questions

For each tier, the harness exposes a **`--corpus <path>`** and **`--questions <path>`** flag. The default is the canonical R11-v2 corpus + question bank; substituting a member's own corpus + questions produces the same shape of architectural comparison applied to their own data.

**Sovereignty contract for substitution** (the load-bearing rule):

- The substituted corpus + questions STAY in the member's filesystem. They are not uploaded to any LB server, not telemetered, not phone-home'd, not analytics-tracked.
- The benchmark results (HOT% per condition, cost per condition, $/HOT comparison) are computed locally and written to local disk only. Same sovereignty guarantee.
- The harness's only outbound network calls are the API calls TO the AI vendors the member is benchmarking (Anthropic, OpenAI, Google, Perplexity), using the member's own API keys. LB infrastructure is not in the loop for those calls.
- Cathedral retrieval (when the member benchmarks their own corpus against the lb_cathedral_* conditions) happens via a local Cathedral instance the member runs on their own machine. The member's corpus becomes a member-private Scribe in their local Cathedral; no LB-side ingestion required.

**Result**: a member can run the K528 architectural-comparison benchmark on their company's confidential documents, their state's legislative records, or their family genealogy archive, and get the same shape of architectural-cost-advantage data — without any of that source content ever leaving their machine.

---

## Three-Class escalation (if the member chooses to share)

By default, substituted-corpus benchmarks are **Ephemeral** (in the strict #2315 sense — no record kept after the run). The member can optionally escalate per #2315:

**Personal-Permanent** (member opts up):
- The substituted corpus + benchmark results are saved to the member's local Cathedral as a member-private Scribe + a member-private benchmark-archive entry.
- Stays local; member can query their own benchmark history later, compare runs over time, build their own personal architectural-comparison record.
- No LB-side visibility; no Federation contribution.
- Membership status not required for Personal-Permanent (the member's local machine is the member's machine; no platform-side gating needed).

**Shared-Permanent** (member further opts up, scope-selected):
- The substituted corpus + benchmark results are routed to a chosen scope: Family Table / Guild / Tribe / Public Federation.
- **Stamp question (Founder direction):** *"And that would require a STAMP after become a member? I don't like that much barrier, but it is also VERY secure."*

  Bishop architectural read on the Stamp question:
  - **Personal-Permanent does NOT require Stamp.** It's purely the member's own machine; no platform-side gating needed; the Stamp would be friction without security benefit.
  - **Shared-Permanent at Family Table / Guild / Tribe scope does NOT require formal Stamp.** Member-attribution within the scope is enough; the scope's own membership rules govern access. Friction-low.
  - **Shared-Permanent at Public Federation scope SHOULD require Stamp.** The Stamp is the member-attribution-token that lets the public Federation Cathedral trust the contribution as member-vouched (vs. anonymous). Without Stamp, public-scope contributions land as anonymous and are weighted accordingly (similar to anonymous web edits — useful but skeptically).
  - Membership ($5/year, identical for all) is a low-friction prerequisite for Stamp issuance, NOT for any of the lower-scope sharing tiers. The Stamp barrier exists ONLY at the highest-scope (Public Federation) layer where attribution security matters.
  - Founder's instinct ("I don't like that much barrier") is right for the lower scopes. The Stamp barrier is appropriate ONLY where security matters most — at the Public Federation layer where one bad-actor contribution could pollute the shared substrate. Reframe in Founder voice: *"Free to substitute. Free to keep private. Free to share with your family. Free to share with your guild. The only place we ask for a Stamp is at the public square — because that's where one bad signature could fool everyone else."*

This Stamp-only-at-public-scope pattern preserves member sovereignty AND substrate trust; matches the Three-Class Substrate Sovereignty (#2315) pattern; aligns with the Year of Jubilee (#2308) reconciliation cycle for the Public Federation scope.

---

## What ships in the reproducibility pack

A single repo / download bundle named `lb-reproducibility-pack/` containing:

1. **`README.md`** — start-here, explains the three tiers, the sovereignty contract, and how to fire each tier
2. **`canonical_corpus_*.md`** — the three corpus tiers (smoke / reasonable / full-K528) at versioned paths
3. **`canonical_questions_*.json`** — sealed question banks (one per tier)
4. **`run_benchmark.py`** — single harness that reads `--tier`, `--conditions`, `--corpus`, `--questions`, `--out` flags; produces JSONL results + summary report
5. **`adapters/`** — vendor adapters (Claude, OpenAI, Gemini, Perplexity, Together AI 70B; same as K528) — member supplies API keys via `.env`
6. **`local_cathedral/`** — minimal Cathedral instance member can run locally (lb_cathedral_* conditions need this); standalone, no LB-server connection required
7. **`substitution_guide.md`** — how to swap your own corpus + your own questions; the sovereignty contract; the Three-Class escalation choices
8. **`k528_canonical_results/`** — the K528 published results in full (`results_r11v2_K528/` directory contents) for direct comparison against the member's own runs
9. **`screenshots/`** — Founder's hand-captured K528 progression screenshots (the empirical-provenance trail) at archive-quality resolution; functions as the Anachronism-Principle proof-of-work that humans observed each phase as it ran
10. **`LICENSE`** — Cooperative Defensive Patent Pledge (#2260) framework, plus the underlying code under permissive open-source license
11. **`CITATION.md`** — how to cite K528 + LB platform receipts in academic, journalistic, or policy work

---

## What this requires (K-future dispatch scope)

This document is the architectural decision. The implementation is K-future scope:

**K-future-A (probably K533-class — small)**: package the existing K528 datasets + harness into the tiered structure. ~4-8 hr Knight wallclock. Output: `lb-reproducibility-pack/` repo at small + reasonable tier; full-K528 tier mostly already exists at `librarian-mcp/r10_cross_vendor/`.

**K-future-B (probably K534-class — medium)**: build the local-Cathedral standalone instance for the substitution layer. The existing `librarian-mcp/` infrastructure does most of this; K534 packages it as a member-installable standalone. ~6-10 hr Knight wallclock.

**K-future-C (probably K535-class — small)**: Stamp infrastructure for Public Federation scope. ~4-6 hr Knight wallclock. Smallest if we reuse Three-Class Substrate Sovereignty (#2315) infrastructure already in K530 + planned K531.

**Order of operations**: K-future-A first (closest to existing artifacts; lowest risk). K-future-B after (substitution layer). K-future-C last (Stamp infrastructure; gated on member-onboarding flow being mature enough to support).

---

## Letter dispatch implications (immediate)

The B130A AOC + Sanders + NYT op-ed v02 letters reference this reproducibility-pack as a forward-looking deliverable. Reading from the AOC v02:

> *"Every empirical claim above is reproducible by any third party — we publish the dataset, the harness, and the benchmark results, and any state government, university, or independent auditor can replicate the run on their own hardware in roughly an hour at the smallest dataset size. We have also released a working Chrome extension that puts cooperative-substrate AI memory at every search bar for any member who wants to try the architecture in production for themselves; the curation flow is structured so that the member's own data stays on the member's own machine by default."*

This is currently **forward-looking** — the reproducibility-pack ships when K-future-A lands; until then, the K528 canonical results at `librarian-mcp/r10_cross_vendor/results_r11v2_K528/` are the de-facto pack (anyone could replicate by reading the K528 report + cloning the repo + running the existing scripts). Once K-future-A lands, the dispatched letters' references become directly install-and-run.

**Founder option**: dispatch the letters now with the forward-looking reproducibility-pack reference (acceptable per current state — the K528 report + repo content already enable replication by a competent third party); tighten to "here's the install link" when K-future-A lands.

---

## Cross-references

- A&A #2315 Three-Class Substrate Sovereignty — the canonical sovereignty contract this layer operationalizes
- A&A #2293 Member-Portability Covenant — the entity-graph framework for Family Table / Guild / Tribe scope sharing
- A&A #2308 Year of Jubilee — Shared-Permanent reconciliation cycle for Public Federation scope
- A&A #2260 Cooperative Defensive Patent Pledge — the IP licensing framework
- K528 R11-v2 Full-Stack REAL Test (commit `6f2b47a`, tag `v-r11-v2-full-stack-K528`) — the canonical empirical anchor this layer wraps
- K530 Chrome Omnibox Substrate Injection (commit `faf328e`, tag `v-chrome-omnibox-substrate-injection-K530`) — the Three-Class implementation already shipped at the Chrome layer
- `project_path_b_proof_before_claim_b130.md` — the Path B pattern this document operationalizes at the reproducibility layer
- `feedback_one_launch_no_shortcuts.md` — sovereignty contract is inviolable; no half-measures on member-data-stays-local default

---

*Filed B130A by Bishop on Founder direction. The receipts are K528 + K530. The reproducibility is K-future-A. The substitution layer is K-future-B. The Stamp at public-scope-only is K-future-C. The free-to-substitute-keep-private-share-with-your-people-Stamp-only-at-public-square framing is the canonical voice. Founder picks the dispatch sequencing.*
