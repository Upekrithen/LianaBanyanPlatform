---
name: Sovereignty-by-Construction Reproducibility Pack
description: A third-party-replicable architectural sovereignty verification harness with substitute-corpus benchmark, pure-Python local retrieval adapter, three-tier calibration ladder (smoke/reasonable/full_k528), and absence-of-symptoms contract enforcement proving member data cannot reach vendor infrastructure.
type: aa_formal
innovation_id: "2326"
ratification_session: B131
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - sovereignty by construction reproducibility pack
  - substitute corpus benchmark local execution
  - run it yourself for fifty cents
  - aa formal 2326
  - reproducibility pack b131 k533
  - third party verifiable sovereignty verification
  - absence of symptoms contract enforcement lb reproducibility
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL #2326 -- Sovereignty-by-Construction Reproducibility Pack (Substitute-Corpus Benchmark with Architecturally-Enforced Local-Only Execution)

**Filed**: B131, 2026-04-28 by Bishop on Founder direction *"Yes absorb and write, and ratify K533"* + *"YES it is, make the CJ for what ISN'T there - I nod; and run it yourself for .50 is gold."*
**Knight delivery**: K533 commit `8a582e0`, tag `v-reproducibility-pack-K533`, 48 files, 20,839 insertions, 10/10 C-phase checks PASS (C.6 load-bearing).
**Class**: Crown Jewel sibling to #2315 Three-Class Substrate Sovereignty. Independently patentable as a third-party-replicable architectural-sovereignty verification primitive.

**LB membership pricing**: unchanged at $5/year (membership-orthogonal). This filing concerns third-party-replicable benchmark-verification methodology — pricing identical for all members.

**Predecessors / sibling architecture**:
- A&A #2315 Three-Class Substrate Sovereignty (B130 — the *contract* this pack empirically verifies)
- A&A #2317 Pheromone Substrate (B128 — local-retrieval sub-ms substrate that local_cathedral_adapter.py instantiates without Node.js)
- K528 R11-v2 Cross-Vendor Benchmark (the canonical receipt corpus that full_k528/ tier mirrors)
- K530 lb-omnibox-extension/ (Path B build-before-file precedent — same internal-only-until-Prov-trigger gate)
- `project_path_b_proof_before_claim_b130.md` (the recursive pattern this filing extends to the *verification* layer)

---

## Why a separate CJ from #2315 (Founder confirmed B131: "make the CJ for what ISN'T there")

#2315 establishes the **policy contract** — Ephemeral / Personal-Permanent / Shared-Permanent classes, member-controlled curation, no-vendor-pull guarantees. #2326 establishes the **third-party-verifiable architectural enforcement** of that contract.

The structural distinction:
- #2315 says *"we don't pull member data into vendor walls."*
- #2326 says *"here's the substitute-corpus benchmark you can run on your own machine to prove we couldn't pull member data even if we wanted to — because there's no code path that could."*

#2315 is what we promise. #2326 is how a third party proves the promise without trusting us. The novel primitive — Founder-ratified — is **sovereignty enforced by structure-of-what's-missing** — verifiable by *absence-of-symptoms* (clearing API keys produces `EnvironmentError` after local retrieval succeeds, proving zero LB-server calls fired before the vendor-call boundary).

Independently patentable as a methodology/protocol claim distinct from the underlying contract.

---

## Claim 1 — Substitute-corpus benchmark protocol with sovereignty contract

The pack defines a benchmark methodology where a third-party replicator supplies:
- Their own corpus (`--corpus path/to/corpus.md`)
- Their own question bank (`--questions path/to/questions.json`)
- Their own vendor API keys (loaded from `.env`, never logged)
- Their own machine (results written to local disk only)

LB supplies:
- The harness (`run_benchmark.py` single entry point)
- Vendor adapters (ChatGPT-Memory, Claude-Projects, Gemini-Gems, Perplexity-Spaces)
- The Local Cathedral adapter (pure-Python BM25, in-process)
- Reference datasets at three calibration tiers (smoke / reasonable / full_k528)
- The expected-results contract (smoke + reasonable have alignment files; full_k528 has K528 canonical_results/)

The replicator runs `python run_benchmark.py --tier smoke --out results/smoke/` and obtains directly-comparable HOT% / cost / latency numbers without sending any data through LB-controlled infrastructure.

**Architectural property**: No LB-server endpoint participates in the benchmark run. The pack is self-contained from the replicator's machine.

---

## Claim 2 — Pure-Python local retrieval substrate (no Node.js, no daemon, no proxy)

`adapters/local_cathedral_adapter.py` instantiates a minimal in-process retrieval substrate using pure-Python BM25 over the supplied corpus. No Node.js dependency. No `127.0.0.1:7712` daemon. No external service. No proxy.

This is the structural innovation: the existing K530 Helm daemon at `127.0.0.1:7712` proves *local retrieval works for the member*; the K533 LocalCathedralClient proves *local retrieval works for the third-party replicator who has never installed any LB software*. Same architectural class, two operational profiles — one for runtime member experience, one for third-party verification.

The Pheromone Substrate (#2317) lineage is honored: BM25 over segmented markdown produces sub-second retrieval at 75-fact / 99-question / smoke-tier scale, and stays under acceptable wallclock at full_k528 scale (150 facts / 200 questions). The verification surface is the substrate itself, not a mock.

---

## Claim 3 — Sovereignty contract enforcement via absence-of-symptoms (C.6 load-bearing)

The pack ships with a load-bearing verification protocol (C.6 in the K533 verification suite):

1. Replicator clears all vendor API keys from `.env` (or never sets them)
2. Replicator runs `python run_benchmark.py --tier smoke --corpus sample_substitute_corpus/acme_corpus.md --questions sample_substitute_corpus/acme_questions.json`
3. **Expected outcome**: LocalCathedralClient indexes the substitute corpus (44 segments for Acme), surfaces the relevant passage for the question, then `EnvironmentError` fires at the vendor-call boundary with a message identifying the missing key
4. **Verification claim**: The `EnvironmentError` fires *after* successful local retrieval, proving the LocalCathedralClient code path completed *without any network call to any LB-server*. Network tracing during this run captures zero outbound packets to LB-controlled hostnames.

The sovereignty contract is enforced by **what isn't in the code** — there is no LB-server endpoint to call, so no policy decision can violate the contract. This is structurally stronger than a policy-enforced contract because policy is a runtime-evaluated rule that can be subverted by code paths the auditor missed; structural absence cannot.

---

## Claim 4 — Three-tier calibration ladder (smoke / reasonable / full_k528)

The pack ships three dataset tiers calibrated to replicator API spend (industry term, vendor compute cost — not LB membership pricing which stays $5/year for all):

| Tier | Facts | Questions | API spend | Wallclock | Purpose |
|---|---|---|---|---|---|
| **smoke** | 10 | 20 | ~$0.50 (vendor API) | ~5 min | Methodology-validation; first-time replicator confirms harness runs cleanly |
| **reasonable** | 75 | 99 (99/99 aligned) | ~$5–15 (vendor API) | ~30–60 min | Cost-conscious replication producing publishable numbers |
| **full_k528** | 150 | 200 + K528 canonical_results/ | ~$200 (vendor API) | ~6–10 hr | Direct comparison to LB's K528 cross-vendor benchmark |

This ladder is itself a methodology innovation: rather than offering a one-size-fits-all benchmark, the pack lets replicators self-select based on the question they're answering ("does the harness run?" / "is the methodology sound at small scale?" / "do my numbers match LB's canonical?"). Each tier is alignment-verified — `setup_datasets.py --verify-smoke` runs the alignment check before any vendor calls fire.

**The "$0.50 to verify it yourself" Founder-ratified posture**: smoke-tier API spend at consumer-scale puts the sovereignty-verification cost-of-entry at coffee-money level. Recipient-cost-of-verification approaches negligible.

---

## Claim 5 — Sample substitute corpus (Acme Cooperative) as sovereignty-verification fixture

The pack ships `sample_substitute_corpus/acme_corpus.md` (~20 facts about a fictitious "Acme Cooperative" entity) and `acme_questions.json` (30 questions against the Acme corpus). The Acme corpus is:

- **Fictitious by design** — no real LB data, no real LB members, no canonical-corpus overlap
- **Sovereignty-verification fixture** — running the harness against the Acme corpus is the canonical sovereignty test: if a network trace captures any outbound LB-server call during an Acme run, the contract is broken
- **Self-contained** — replicator can run the Acme corpus end-to-end without ever touching the canonical LB datasets

This makes the sovereignty contract testable by anyone with a Python environment and any single vendor API key. The verification compute spend (industry term, not LB pricing) is bounded (~$0.50 vendor API for the smoke tier on Acme), making the contract empirically falsifiable at consumer-scale spend.

---

## Claim 6 — Citation-grade methodology with canonical-result anchoring

The pack ships `CITATION.md` + the K528 `canonical_results/` corpus, enabling third-party replicators to produce numbers that anchor directly to LB's published K528 benchmark (16 conditions, 1,170 graded responses, 4 vendor classes, $206.33 vendor API spend). The architectural property:

- A replicator running `--tier full_k528` produces results in the same format as `librarian-mcp/r10_cross_vendor/results_r11v2_K528/`
- A direct diff against canonical_results/ produces a per-condition variance number (HOT% delta, cost delta, latency delta)
- The variance is auditable: small variance → LB's published number is replicable; large variance → either (a) replicator's vendor account state differs (caching, model version) or (b) LB's published number is wrong

This gives the replicator a **third-party-verifiable basis to either confirm or challenge** LB's published cross-vendor benchmark, anchored to a methodology the replicator controls end-to-end. Citation-grade in the academic sense: the data is the receipt; the methodology is the protocol; the substrate is open.

---

## Strategic implications (why this matters for Wave 1 + Prov 14 + the broader IP posture)

**Wave 1 letter cohort** — Every Wave 1 letter draft contained a "reproducibility pack forthcoming" asterisk. That asterisk now resolves to a concrete invocation: *"Run `python run_benchmark.py --tier smoke` in 5 minutes for ~$0.50 vendor API spend against your own corpus, confirm the methodology, then replicate at the tier you trust."* The rhetorical posture shifts from "trust us, evidence coming" to "here, prove it yourself before you decide whether to write back." Recipient-cost-of-verification drops to negligible. (Founder ratification B131: *"run it yourself for .50 is gold."*)

**Prov 14 application strengthening** — The application narrative for #2315 Three-Class Substrate Sovereignty now cites #2326 as the third-party-verifiable Reduction-to-Practice evidence of #2315's enforcement properties. USPTO examiners weight third-party-replicable architectural verification above policy-claims. This is the strongest possible evidence class: not screenshots, not narrative, not a working extension, but a *protocol any third party can run end-to-end without trusting the inventor*.

**Broader IP posture** — #2326 establishes a new evidentiary-class precedent for LB filings: when an architectural-sovereignty claim is made, ship the third-party-verification harness alongside the claim. Recursive applications:
- #2287 Synapses → ship a Synapses-verification harness (any party can run cross-Cathedral Synapses traffic capture against their own Cathedral pair)
- #2317 Pheromone Substrate → ship a Pheromone-Substrate-verification harness (any party can run BM25-vs-vendor-RAG over their own corpus)
- #2293 Member-Portability Covenant → ship a portability-verification harness (any party can extract their own data, re-import to a different LB-compatible substrate, verify equivalence)

The Sovereignty-by-Construction discipline is not just a K533 deliverable — it's a filing-class pattern Bishop will apply going forward.

---

## Reduction-to-Practice evidence (K533 deliverables)

| Surface | Path | Verification |
|---|---|---|
| Working pack root | `lb-reproducibility-pack/` | 48 files, 20,839 insertions |
| Single entry point | `run_benchmark.py` | `--tier` / `--corpus` / `--questions` / `--out` flags |
| Three dataset tiers | `datasets/{smoke,reasonable,full_k528}/` | smoke 20q, reasonable 99/99 aligned, full_k528 200q + K528 canonical_results/ |
| Pure-Python local retrieval | `adapters/local_cathedral_adapter.py` | BM25, no Node.js, no daemon |
| Vendor adapters | `adapters/{chatgpt_memory,claude_projects,gemini_gems,perplexity_spaces}_adapter.py` | K528 vendor adapters, copied untouched |
| Sample substitute corpus | `sample_substitute_corpus/{acme_corpus.md,acme_questions.json}` | Fictitious Acme Cooperative, 20 facts, 30 questions |
| Documentation | `README.md`, `INSTALL.md`, `SUBSTITUTION_GUIDE.md`, `LICENSE`, `CITATION.md` | Citation-grade methodology |
| Verification suite | C.1–C.10 (K533 close report) | 10/10 PASS, C.6 load-bearing |

Commit `8a582e0`. Tag `v-reproducibility-pack-K533`.

---

## Open scope (post-filing followups)

This filing locks priority date 2026-04-28. Open chapters Bishop acknowledges for post-filing fill-in:

- **K534 Local Cathedral dense-vector retrieval** — replace BM25 with sentence-transformers for closer parity to vendor-RAG; gates on dense-vector model selection (open-weights vs. local-only)
- **K535 Stamp for Public Federation** — third-party-replicable stamp-and-sign protocol so verified benchmark runs can be cryptographically pinned to LB-canonical anchors without LB-server participation
- **Citation policy formalization** — CITATION.md currently provides the methodology; a formal academic-citation policy (BibTeX entry, ORCID-anchored authorship, version-pinning) is K-future scope
- **Cross-vendor cost-tracking standardization** — vendor adapter cost-accounting varies across vendors; standardizing the cost-receipt format enables cleaner per-vendor variance analysis
- **Acme corpus expansion** — Acme is currently 20 facts / 30 questions; expanding to ~50 facts / 100 questions enables sovereignty-verification at the reasonable tier, not just smoke

These open chapters are stub-flagged; the core claims are independently patentable on their current scope.

---

## Provenance

- **Founder direction B131 (CJ ratification)**: *"Yes absorb and write, and ratify K533"* + *"YES it is, make the CJ for what ISN'T there - I nod; and run it yourself for .50 is gold."*
- **Founder direction B130 (Architecture A confirmation)**: *"Yes A!"* — confirming `lb-reproducibility-pack/` as top-level sibling to `lb-omnibox-extension/` in the main repo, internal-only until Prov 14 + Founder publication trigger
- **Knight delivery K533 (Sonnet 4.6, Cursor)**: commit `8a582e0`, tag `v-reproducibility-pack-K533`, 48 files, 20,839 insertions, all hooks passed, no `--no-verify` used
- **Verification suite C.1–C.10**: all 10 PASS; C.6 (sovereignty contract empirical verification) load-bearing
- **Sibling under**: #2315 Three-Class Substrate Sovereignty umbrella; co-citing #2317 Pheromone Substrate (local-retrieval lineage)
- **Path B sequence**: K530 (build) → K533 (third-party-verifiable verification harness) → Prov 14 (filing with both as Section 2 evidence) → public publication trigger (Web Store + Glass Door + Crown Letter inclusion)

---

*Filed #2326 by Bishop B131. Sovereignty enforced by structure-of-what's-missing. The receipt is auditable by anyone, anywhere, in five minutes for fifty cents (vendor API). LB membership pricing identical for all members at $5/year, unchanged. FOR THE KEEP!*
