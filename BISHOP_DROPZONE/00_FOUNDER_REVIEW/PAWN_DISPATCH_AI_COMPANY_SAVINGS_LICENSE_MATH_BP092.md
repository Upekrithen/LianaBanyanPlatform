---
type: pawn_dispatch
status: FOUNDER_REVIEW
session: BP092
composed_by: Bishop Sonnet 4.6
date: 2026-06-23
target_pawn_class: research
output_destination: Substack publish queue + Founder proposal letters
---

# PAWN DISPATCH — AI Company Substrate Savings & License Fee Math
## Independent Research Task · BP092 · Self-Contained

---

## YOUR ROLE

You are a research-class Pawn. You have no prior context from this project. Everything you need is in this prompt. Your job is to crunch publicly available numbers to answer: **How much does each major AI company save per year if they adopt the MnemosyneC cooperative substrate, and what is the appropriate license fee based on those savings?**

This will be published as a Substack paper ("AI Company Substrate Savings Math — Independent Analysis") and used in commercial proposal letters to each company listed below.

**Empirical only. No speculation. Cite every number.**

---

## BACKGROUND: WHAT IS COOPERATIVE SUBSTRATE?

The MnemosyneC cooperative substrate is a peer-mesh AI inference architecture that routes queries through a deterministic cache layer before touching a frontier model. The canonical cost model is the **70/25/5 rule**:

- **70%** of incoming queries are served from a read-only deterministic cache (zero model inference cost — electricity only)
- **25%** are routed to a single primary frontier model
- **5%** are routed to a secondary cross-reference model for high-stakes verification

This produces a **blended per-query cost of approximately 10–15% of naive "invoke frontier model on every query" baseline** (source: AA_FORMAL_2249, ROM-First AI Inference Cost Architecture).

Key canonical cost figures you must use:
- Cooperative substrate per-query marginal cost (electricity only): **~$0.0001 per query** (BP091 canon, minted 2026-06-22)
- Cooperative cached context cost (shared substrate hit): **~$0.001 per query** (AA_FORMAL_1993, B034)
- At 100,000 queries: flagship API ≈ $50,000 · same queries on substrate ≈ $10 of electricity (BP091 empirical ratio)
- The invention eliminates redundant recomputation. Query distributions follow a **Zipfian power law**: a small number of queries repeat enormously many times. Substrate catches all repeats at ~$0 marginal cost.
- Published datacenter-facility savings under this invention: **$85M/yr per facility (range: $16.5M–$120M)** (AA_FORMAL_2249, B098)
- Per-hyperscaler savings at full fleet adoption: **$25M–$400M/yr per operator** (AA_FORMAL_2249)
- Global industry savings at full adoption: **~$8.67B/yr at 2024 baseline, rising to ~$36.6B/yr by 2030** (AA_FORMAL_2249/2250)

---

## LICENSE FEE MODEL — CANON ANCHOR

The cooperative canon establishes a **"save more than you pay" guarantee** (BP092 HARD CANON):

> "We can prove you save more than you pay in licensing. Basically, you're saving money to install it. That's the pitch, because IT IS TRUE and we have the receipts to prove it."

The Apache commercial license fee **scales with company size, is bounded, published transparently, and carries a less-than-equivalent-API-spend guarantee** (BP092).

The prior 30-day offer campaign to these same companies was **50% off the FRAND commercial rate**, and the math still produced **net-positive savings after license fee** (BP087 canon).

**Three license fee models to evaluate** — pick the one that best satisfies "save more than you pay" empirically for each company:

**(A) Cost+20% of measured savings** — If company saves $100M/yr, license = $20M/yr. Cooperative keeps 20% margin. Net savings to company = $80M.

**(B) Tiered subscription by annual revenue** — e.g., $1M/yr per $1B revenue bracket. Simple, predictable, scales with ability to pay.

**(C) Per-query usage fee at Cost+20% of equivalent flagship API call** — Cooperative does inference, charges Cost+20% of what the company's own flagship API would have charged. Company pays only for queries routed through substrate; net savings = the 70% cache-hit queries they no longer pay for at full API rate.

For each company, calculate all three models and state which satisfies "save more than you pay" most cleanly. **Model A is the canonical preference** (closest to Founder's verbatim "based on what they will save").

---

## TARGET COMPANIES

Research all six. xAI is optional if public financials are too thin.

1. **Anthropic**
2. **OpenAI**
3. **Google AI** (Gemini / Google DeepMind — allocate inference cost from Alphabet)
4. **Meta AI** (Llama open-weights — different model; capex on H100s for inference, not API revenue)
5. **Cohere**
6. **Mistral AI**

---

## DATA SOURCES TO USE

**Primary (public domain):**
- 10-K / annual reports: Alphabet (Google), Meta Platforms
- OpenAI: published revenue figures, Sam Altman public statements on compute costs, Microsoft partnership disclosures
- Anthropic: published valuation rounds, reported revenue figures (FY2025: ~$1B ARR reported), compute cost estimates from researchers
- Meta: Llama infrastructure cost estimates from Meta earnings calls + data center capex disclosures
- Cohere: Series C/D funding disclosures, reported enterprise contract values
- Mistral: Series A/B funding disclosures, reported revenue (European AI company, smaller scale)

**Published API pricing (use these for the "what they currently charge / pay" baseline):**
- Anthropic Claude Sonnet 4.5: $3.00/M input tokens · $15.00/M output tokens
- Anthropic Claude Haiku 3.5: $0.80/M input tokens · $4.00/M output tokens
- OpenAI GPT-4o: $2.50/M input tokens · $10.00/M output tokens
- OpenAI GPT-4o mini: $0.15/M input tokens · $0.60/M output tokens
- Google Gemini 1.5 Pro: $1.25/M input tokens (≤128K) · $5.00/M output tokens
- Google Gemini 1.5 Flash: $0.075/M input tokens · $0.30/M output tokens
- Meta: no API revenue (open-weights) — estimate inference cost from reported H100 fleet size × power draw × electricity price × amortization
- Cohere Command R+: $2.50/M input · $10.00/M output
- Mistral Large: $2.00/M input · $6.00/M output

**Industry analyst sources:**
- Goldman Sachs "AI Infrastructure" 2024 report (widely cited: AI companies spend ~40–60% of revenue on compute)
- Sequoia "AI's $600B Question" (2024) on inference cost as % of AI company spend
- SemiAnalysis GPU economics research
- MLCommons inference benchmark data
- IDC / Gartner AI infrastructure spend reports

---

## METHODOLOGY — STEP BY STEP

**For each company:**

### Step 1 — Estimate annual inference spend
Pull from public financials or analyst estimates. Use:
- Revenue figure (public or reported)
- Compute-as-% -of-revenue estimate (analyst range: 40–60% of revenue for API-first AI companies; 20–35% for diversified tech)
- Separate training cost from inference cost (inference is typically 40–60% of total compute spend for production API companies)
- Report as: **Annual inference spend = $X (range: $Y–$Z)**

### Step 2 — Apply the 70/25/5 substrate model
Of total inference spend:
- 70% of queries cache-hit → cost drops to electricity (~$0.0001/query)
- 25% route to primary model → full cost applies
- 5% route to secondary → full cost applies
- **Effective cost after substrate = ~10–15% of baseline inference spend**
- **Annual savings = 85–90% of inference spend**

### Step 3 — Calculate savings range
- Conservative: 80% of low-end inference spend estimate
- Base case: 85% of midpoint inference spend estimate
- Aggressive: 90% of high-end inference spend estimate
- Report as: **Annual savings = $A–$B (base case: $C)**

### Step 4 — Calculate license fee under all three models
- Model A: License = 20% of base-case savings. Net savings = 80% of savings.
- Model B: License = $1M × (annual revenue / $1B). Net savings = savings − flat fee.
- Model C: License = 20% × (current inference spend − post-substrate inference spend). Mathematically identical to Model A in this case.
- **Recommended model per company:** whichever produces the cleanest "net savings >> license fee" ratio while being defensible as a real number.

### Step 5 — Sanity check
Does net savings after license fee exceed the license fee by at least 3×? If not, flag it and explain why (company may be too small for substrate to be compelling on cost alone — pitch accuracy uplift instead).

---

## DELIVERABLE FORMAT

### File title: "AI Company Substrate Savings Math — Independent Analysis"

**Section 1 — Introduction (1 paragraph)**
What cooperative substrate is. Why this analysis exists. The "save more than you pay" guarantee. Note that all figures are estimates from public data; companies will have better internal numbers and are invited to substitute their own to validate the model.

**Section 2 — Per-Company Table**

| Company | Annual Revenue (est.) | Annual Inference Spend (est.) | % Substrate Could Absorb | Annual Savings (est.) | Recommended License Fee | Net Savings After License | Ratio (savings:fee) |
|---|---|---|---|---|---|---|---|
| Anthropic | | | 85–90% | | | | |
| OpenAI | | | 85–90% | | | | |
| Google AI | | | 85–90% | | | | |
| Meta AI | | | 85–90% | | | | |
| Cohere | | | 85–90% | | | | |
| Mistral | | | 85–90% | | | | |
| **TOTAL** | | | | | | | |

Fill in all cells. Use ranges where appropriate. Flag any cell where the estimate is thin.

**Section 3 — Aggregate Industry Impact**
- Total annual savings if all 6 adopt: $X billion/yr (2026 baseline)
- Total cooperative license revenue if all 6 adopt at recommended pricing: $Y million/yr
- Note: Global industry savings at full adoption across all AI operators (not just these 6): ~$8.67B/yr at 2024 baseline, rising to ~$36.6B/yr by 2030 (source: ROM-First AI Inference Cost Architecture, AA_FORMAL_2249)

**Section 4 — Headline sentences (one per company)**

Format verbatim (fill in the numbers):

> "Substrate saves [Company] approximately $[N]M annually · we license to you at $[L]M annually · net savings to you: $[N−L]M · net revenue to cooperative: $[L]M · 20% margin per Cost+20% canon."

Generate all six. These go directly into proposal letters.

**Section 5 — License Model Recommendation**
One paragraph: which of the three license models (A, B, or C) works best across this company set, and why. Note any company that needs a bespoke structure (e.g., Meta, which has no API revenue — their savings are infrastructure capex avoidance, not API cost reduction).

**Section 6 — Caveats and Data Quality**
For each company, one sentence on data confidence: high (public 10-K), medium (analyst estimates), or low (limited public disclosure). Flag Cohere and Mistral if public financials are too thin to produce reliable estimates.

---

## PUBLICATION NOTE

This document will be published on Substack as a public research artifact. Write it in a voice that is:
- Empirical and plain (cite every figure)
- Confident but not adversarial (these companies are potential licensees, not enemies)
- Cooperative-class framing: the substrate is a mutual win, not a threat
- No corporate jargon; no "synergies"; no consultant-speak

The Substack title should be exactly: **"AI Company Substrate Savings Math — Independent Analysis"**

Subline (second line under title): *"How much does cooperative substrate save each major AI company per year — and what is a fair license fee? We ran the numbers."*

---

## WHAT YOU RETURN

Return the complete Substack-publishable document (all six sections above, fully populated with your research). Include your data sources inline (linked or cited by name/date). Do not summarize — produce the full artifact.

If you cannot find public data for a company (especially Cohere or Mistral), produce a placeholder row with methodology shown and a note that the company should substitute internal numbers.

Target length: 2,000–3,500 words for the full document.

---

*Pawn dispatch composed by Bishop Sonnet 4.6 · BP092 · 2026-06-23 · Self-contained · No prior context required.*
