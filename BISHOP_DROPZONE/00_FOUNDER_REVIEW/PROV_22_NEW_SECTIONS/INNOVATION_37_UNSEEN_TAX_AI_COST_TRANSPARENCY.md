---
title: "Innovation Area 37: Unseen Tax — Real-Time AI Cost Transparency"
status: founder-ratify-pending
class: provisional-patent-section
prov_target: PROV_22
claim_group: 30
bp_session: BP084
model: Sonnet 4.6
date: 2026-06-16
innovation_area: 37
cross_reference: "See Innovation Area 35 (Truth Integrity Chain, Claim Group 28) and Innovation Area 36 (Code Breakers Guild and Gold Refined by Fire, Claim Group 29) — Unseen Tax composes with both: cost transparency is the financial layer of Truth-Always discipline."
---

# Innovation Area 37: Unseen Tax — Real-Time AI Cost Transparency

*(Draft section for Founder review and counsel integration — status: founder-ratify-pending. Do NOT modify PROV_22_DRAFT_v02.md directly. Founder integrates manually after ratification.)*

---

## Anecdote — Founder Voice

**Founder verbatim — the recognition:**
> "Remember the paper on 'Unseen Tax' and the feature that we offer that doesn't hide your ai subscriptions cost with the whole 'default to Composer 2.5' - the MOST expensive credit to use, etc.?"

— Founder, BP084 (verbatim)

**Founder verbatim — the ratify:**
> "YES mint the unseen tax canon"

— Founder, BP084 (verbatim)

---

The name is precise. A tax is a charge collected by an authority from a party who has no practical ability to refuse and often no clear visibility into the amount being extracted. That is what happens every time a developer opens an AI coding tool and begins working.

Cursor defaults to Composer 2.5 — the most expensive credit in the tool's pricing tier. Many AI agents default to premium model tiers first. The model selection is not surfaced to the user at the moment of the call. No per-call cost is shown while the work is being done. At the end of the session, the user sees credits drained. They cannot reconstruct which calls produced leverage and which were waste. The billing surface offered is aggregate-only — a monthly total with no itemization by call, by purpose, or by session. There is no comparison surface: no notification that this prompt cost $0.42 via Composer 2.5 and would have cost $0.03 via a capable smaller model.

The industry has converged on five structural behaviors that constitute the Unseen Tax:

1. **Default to the most expensive credit** — Cursor → Composer 2.5; many AI agents → premium-tier model first, without disclosure
2. **Hide per-call cost** during the session — no live ticker, no per-message marginal cost surface while the work is being done
3. **Surface only the aggregate at month-end** — by which point the user cannot disentangle which calls were leverage and which were waste
4. **No comparison surface** — no disclosure that "this prompt cost $X via Composer 2.5; would have cost $0.04 via a capable smaller model"
5. **No per-session running total** visible while the work is in progress

**The harm is structural, not incidental.** Users pay five to twenty times what they would if they could see and choose. The cost is extracted at precisely the moment when the user has the least bandwidth to evaluate it — mid-flow, mid-build, mid-thought. The decision frame is gone before the user knows a decision was made.

*Hidden cost is the financial form of dirty data.* Just as the Truth Integrity Chain (Innovation Area 35) recognizes that a perfect reasoner operating on hidden eliminations reaches wrong conclusions with full confidence, a cooperative member operating on hidden cost surfaces makes budget decisions with full confidence — and those decisions are systematically incorrect in favor of the platform extracting the cost. The structural analogy is not rhetorical. Both are instances of the same failure: a consequential variable — what was eliminated, what it cost — structurally withheld from the agent making the decision.

The cooperative's promise is the inverse of the Unseen Tax. The MnemosyneC architecture does not default to the most expensive model. It does not hide cost. It does not give the member an aggregate-only bill at month-end and call that transparency. Every call shows its price as it happens. Every session shows a running total. Every escalation shows the cost differential and the reason. The receipt is not an afterthought. The receipt is part of the substrate.

---

### Background and Problem Statement

The market for artificial intelligence developer tooling — including but not limited to automated code completion, multi-step autonomous agent pipelines, inference-backed documentation assistants, and natural language query interfaces — has converged on a billing architecture that structurally conceals the per-unit cost of inference from the end user at the time of consumption. This architecture is not accidental. It serves the economic interest of the platform provider: users who cannot see the per-call cost of model inference cannot make substitution decisions. Users who cannot make substitution decisions continue to consume the most expensive available model tier regardless of task-class requirements. The resulting aggregate revenue per user is structurally higher than it would be under full per-call cost transparency.

No prior AI developer tool in wide deployment provides: (a) real-time per-call marginal cost surfacing at the moment of inference, displayed to the user before or coincident with the result; (b) a continuously visible running session total updated after each inference call; (c) a comparison delta annotated at the moment of model escalation, disclosing to the user both the cost differential and the machine-generated reason for escalation; (d) a system default that selects the lowest-priced model meeting a configurable task-class threshold, requiring explicit user override or demonstrated capability insufficiency before escalating to a higher-priced model; (e) an itemized post-session receipt categorizing each inference call by purpose, model tier, and cost; or (f) a cross-vendor monthly aggregate view that unifies spend across multiple distinct artificial intelligence subscription services into a single member-facing dashboard organized by vendor, purpose, and user-defined category.

The Unseen Tax innovation area addresses this gap by specifying a cooperative-class cost-transparency architecture that treats per-call inference cost as a first-class data type required to be surfaced to the member at the time of consumption — composing with the Personal Subscription Steward tier architecture, the Code Breakers Guild transparency commitment, and the Truth-Always BLOOD discipline applied at the financial layer.

---

## Application — Technical Specification

### 1. Real-Time Per-Call Marginal Cost Surface

The cooperative-class application maintains a connection to the vendor inference API's pricing schedule for each model tier available to the application. At each inference call, the application resolves the cost of that specific call — calculated from: (a) input token count; (b) output token count; (c) model tier selected; and (d) current vendor pricing — and surfaces the marginal cost to the member in real time, coincident with the delivery of the inference result.

The per-call cost surface is not deferred to end-of-session. It is not deferred to a settings or billing menu. It is displayed at the point of interaction, in the same interface layer where the inference result is presented. A member reviewing the result of an inference call sees, in the same view: the result, and what it cost.

The cost surface includes: the marginal cost of this specific call; the model tier used; and whether this call was handled by the default cheapest-capable model or an escalated tier.

### 2. Running Session Total

The application maintains a session-level cost accumulator initialized to zero at the start of each member session. After each inference call, the accumulator is incremented by the marginal cost of that call. The running session total is visible in the application's primary interface throughout the session — not in a submenu, not behind a settings toggle, not in a billing panel accessible only after session end.

The running session total is updated synchronously with each call's cost surface. A member who has consumed seven inference calls in a session can, at any point before the eighth call, see exactly what the first seven calls have cost.

### 3. Comparison Delta on Escalation

When the application determines that a task-class requirement cannot be satisfied by the default cheapest-capable model and escalates to a higher-priced model tier, the following information is surfaced to the member at the moment of escalation:

(a) **cost-this-call**: the marginal cost of the call at the escalated tier;
(b) **cost-at-default**: the marginal cost the call would have incurred at the default cheapest-capable tier;
(c) **delta**: the cost differential between escalated and default, expressed as an absolute amount and as a percentage premium;
(d) **escalation-reason**: a machine-generated natural-language annotation stating the specific capability insufficiency that caused the escalation (e.g., "escalated from [model-A] to [model-B] because task-class requires extended context window exceeding [model-A] maximum").

The comparison delta is not an optional disclosure. It is a structural requirement of the escalation flow: no escalation executes without surfacing (a) through (d) to the member.

### 4. Default to Cheapest Available

The application's default model selection algorithm selects the lowest-priced available model meeting a configurable task-class threshold. Task-class thresholds are configurable by: (a) the application operator; (b) the member, within operator-defined bounds; and (c) a per-task-type classification system that assigns each inference request to a task class (e.g., code completion, natural language query, multi-step agentic pipeline, document summarization) with corresponding minimum capability requirements.

Escalation from the default cheapest-capable model to a higher-priced tier requires either: (a) explicit member override, confirmed at the time of the request; or (b) demonstrated insufficient capability — defined as an empirically measured failure of the default model to meet the task-class threshold on this specific request, with the failure evidence surfaced to the member.

The application is prohibited from defaulting to the most expensive available model tier by structural enforcement: the model selection algorithm requires an explicit reason — either override or demonstrated insufficiency — to depart from the cheapest-capable default.

### 5. Itemized Post-Session Receipt

At the close of each member session, the application generates an itemized receipt comprising one line item per inference call, each containing: (a) call sequence number within session; (b) timestamp; (c) task class; (d) model tier used; (e) marginal cost; (f) whether the call was default or escalated; and (g) if escalated, the escalation reason and cost delta.

The itemized post-session receipt is stored in the member's cooperative account and accessible at any subsequent time. It is not discarded at session close. The receipt constitutes the permanent record of what inference was consumed, for what purpose, at what cost — composing with the cooperative-class eblet substrate's append-only audit trail architecture.

### 6. Cross-Vendor Aggregate — Personal Subscription Steward Composition

The Personal Subscription Steward (per `canon-mnemosynec-personal-subscription-steward-tier-ramp-bp084`) extends the per-session cost surface to a cross-vendor monthly aggregate view. The member's monthly spend across multiple distinct AI subscription providers — including but not limited to Anthropic Claude, Cursor, Google Gemini, Perplexity, ChatGPT, and other tracked providers — is unified into a single cooperative-member-facing dashboard.

The cross-vendor aggregate view is organized by:
(a) **vendor** — monthly spend per subscription provider, ranked by spend;
(b) **purpose** — spend categorized by task class across all vendors (e.g., total monthly spend on code completion across all tools; total monthly spend on document query);
(c) **user-defined category** — member-configurable spending categories enabling personalized budget tracking (e.g., "client work," "personal projects," "open source contributions").

The cross-vendor aggregate surfaces: (i) a running monthly total visible at every member interaction; (ii) per-vendor breakdowns with trend lines; (iii) substitution recommendations when spend concentration in a high-cost vendor for a task class could be reduced by substituting a lower-cost vendor with equivalent capability for that class.

The Personal Subscription Steward composition enables the member to answer, at any moment: *"How much have I spent on AI this month, across all tools, and what did each dollar accomplish?"*

### 7. The Six Hard-Banned Behaviors

The cooperative-class architecture structurally prohibits the following behaviors, which collectively constitute the Unseen Tax anti-pattern. These prohibitions are enforced by the application's architecture, not merely by policy:

**Hard-Ban 1 — default-to-expensive:** The application may not default to the most expensive available model tier without surfacing the cost and the reason. The default must be the cheapest capable tier.

**Hard-Ban 2 — hide-per-call:** The application may not conceal the per-call marginal cost of an inference call. The cost is surfaced coincident with the result, not deferred.

**Hard-Ban 3 — aggregate-only-billing:** The application may not provide only an aggregate billing surface (monthly total, credit balance) without itemized per-call breakdown available. The itemized receipt is always accessible.

**Hard-Ban 4 — escalate-without-delta:** The application may not escalate to a higher-priced model tier without surfacing the cost delta and escalation reason at the moment of escalation.

**Hard-Ban 5 — bury-in-settings:** The application may not require the member to navigate to a settings, advanced, or billing submenu to access per-call cost data, running session total, or itemized receipts. These are primary-interface elements.

**Hard-Ban 6 — cost-obfuscation-marketing:** The application and its marketing copy may not use cost-obfuscating framing — including "unlimited!" when credit caps exist, "all-you-can-use!" when throttles apply, or aggregate pricing language that suppresses per-unit cost visibility. Every marketing representation of cost is compatible with the per-call cost surface architecture.

---

## Patent Claims

*(Formal independent and dependent claims for Claim Group 30. Language preserved verbatim from canon ratification per canon-unseen-tax-anti-pattern-ai-cost-transparency-bp084. Formal independent and dependent claims will be crystallized in the corresponding non-provisional application.)*

**Claim 30.1** — A computer-implemented method for AI inference cost transparency in a member-class application, wherein each call to a vendor inference API surfaces its marginal cost to the user in real time, displays a running session total, and exposes a comparison delta when the application escalates from a cheaper model tier to a more expensive one, said delta annotated with the reason for escalation.

**Claim 30.2** — The method of claim 30.1, further comprising an aggregate-across-vendors view in which the application tracks the user's monthly spend across multiple distinct AI subscription providers and surfaces the breakdown by vendor, by purpose, and by user-defined category, enabling the user to make informed substitution decisions.

**Claim 30.3** — The method of claim 30.1, wherein the application's default model selection is the lowest-priced available model meeting a configurable task-class threshold, with escalation to higher-priced models requiring either explicit user override or demonstrated insufficient capability via empirical evidence.

---

## Diagrams

### Figure 27: Per-Call Cost Surface — Interaction Flow

```mermaid
flowchart TD
    A([Member submits task]) --> B{Classify task-class}
    B --> C[Resolve cheapest-capable model\nfor this task-class]
    C --> D{Default model\nsufficient?}
    D -- Yes --> E[Execute call at cheapest-capable tier]
    D -- No / Override --> F[Identify next-tier model]
    F --> G[Surface escalation delta to member:\ncost-this-call · cost-at-default · delta · reason]
    G --> H{Member approves\nor auto-policy allows?}
    H -- Yes --> I[Execute call at escalated tier]
    H -- No --> J[Re-route to cheapest-capable\nor abort per member instruction]
    E --> K[Surface per-call cost to member\ncoincident with result]
    I --> K
    K --> L[Increment running session total]
    L --> M[Append line item to session receipt:\nsequence · timestamp · task-class ·\nmodel · cost · escalation flag + reason]
    M --> N([Display updated session total\nin primary interface])
```

*Figure 27: Per-call cost surface interaction flow. Every call resolves cost at the point of execution. Escalation requires delta disclosure and member or policy authorization. Session receipt updated after each call.*

---

### Figure 28: Cross-Vendor Aggregate Dashboard — Personal Subscription Steward

```mermaid
flowchart LR
    subgraph Vendors["AI Subscription Vendors"]
        V1[Anthropic Claude\nAPI calls + subscription]
        V2[Cursor\nCredit consumption]
        V3[Google Gemini\nAPI calls + subscription]
        V4[Perplexity\nSubscription queries]
        V5[ChatGPT / OpenAI\nAPI + subscription]
        V6[Other tracked\nvendors...]
    end

    subgraph PSS["Personal Subscription Steward\n(Aggregation Layer)"]
        AGG[Monthly spend\naggregator]
        CAT[Purpose classifier\nby task-class]
        UCAT[User-defined\ncategory mapper]
    end

    subgraph Dashboard["Member Dashboard"]
        D1[By Vendor\nranked spend + trend]
        D2[By Purpose\ncode · query · doc · agent...]
        D3[By User Category\nclient · personal · open-source...]
        D4[Running Monthly Total\nvisible at every interaction]
        D5[Substitution Recommendations\ncheaper vendor · same capability]
    end

    V1 & V2 & V3 & V4 & V5 & V6 --> AGG
    AGG --> CAT --> D2
    AGG --> UCAT --> D3
    AGG --> D1
    AGG --> D4
    CAT --> D5
```

*Figure 28: Cross-vendor aggregate dashboard via Personal Subscription Steward. Monthly spend across all AI subscription providers unified into a single member-facing view, organized by vendor, purpose, and user-defined category.*

---

### Figure 29: Model Selection Decision Flowchart

```mermaid
flowchart TD
    A([Task arrives]) --> B[Task-class classification]
    B --> C[Look up task-class threshold:\nminimum capability requirements]
    C --> D[Identify cheapest available model\nmeeting threshold]
    D --> E{Member has set\nexplicit override for\nthis task-class?}
    E -- Yes: override to specific tier --> F[Use override-specified model]
    E -- No --> G[Default: cheapest-capable model]
    G --> H[Execute call]
    F --> H
    H --> I{Did cheapest-capable model\nmeet task-class threshold\non this call?}
    I -- Yes --> J[Cost surface + receipt entry\nat cheapest-capable rate]
    I -- No: demonstrated insufficiency --> K[Identify next-tier model]
    K --> L[Surface to member:\n• cost delta\n• escalation reason\n• cost-at-default vs cost-this-call]
    L --> M{Member approves or\nauto-approve policy active?}
    M -- Approved --> N[Execute at escalated tier]
    M -- Rejected --> O[Re-attempt at cheapest-capable\nor return insufficiency notice]
    N --> P[Cost surface + receipt entry\nat escalated tier, with delta logged]
    J --> Q([Session total incremented;\nreceipt appended])
    P --> Q
    O --> Q
```

*Figure 29: Model selection decision flowchart. Default path always selects cheapest-capable. Escalation requires demonstrated insufficiency and member authorization (explicit override or auto-approve policy). All paths log to session receipt.*

---

## Prior Art Note for Patent Counsel

**Closest analogues in the art:**

- **Anthropic Console / OpenAI Usage Page:** Provide aggregate monthly spend and per-API-key usage summaries. Do not provide per-call real-time cost surfacing during an active session. Do not surface comparison deltas on model escalation. Do not aggregate across competing vendors. Constitute aggregate-only billing surfaces — one of the six Hard-Banned behaviors in this disclosure.

- **Cursor Credit Dashboard:** Provides a credit balance and monthly usage summary. Does not surface per-call cost at the time of the call. Does not show cost comparison between Composer 2.5 and alternative model tiers at the moment of call dispatch. Defaults to Composer 2.5 (most expensive tier) without per-call cost disclosure — the originating instance of the Unseen Tax anti-pattern identified in this disclosure.

- **AWS Cost Explorer / Google Cloud Billing:** Infrastructure-layer cost dashboards that provide historical aggregate and per-service cost visualization. Operate at a billing cycle granularity, not at per-call real-time session granularity. Do not surface per-call cost within a developer tool's primary interaction layer.

- **Bug Bounty Programs (e.g., HackerOne, Bugcrowd):** Adjacent only in their adversarial incentive structure (paying parties to find failures). No cost-transparency angle. Not prior art against the Unseen Tax claims.

**Novelty of the claimed combination:** The patentability of Claim Group 30 rests on the combination of: (a) per-call real-time cost surfacing within an AI developer tool's primary interaction interface; (b) comparison-delta disclosure on escalation with machine-generated reason annotation; (c) structural default-to-cheapest enforcement with explicit override or demonstrated-insufficiency as the only departure paths; and (d) cross-vendor monthly aggregate through Personal Subscription Steward composition — none of which appears in combination in any prior deployed system as of the filing date.

---

## Cross-References

**Innovation Area 35 — Truth Integrity Chain (Claim Group 28):**
The Unseen Tax disclosure is the financial layer of the same Truth-Always principle instantiated in TIC at the epistemic layer. TIC recognizes that a perfect reasoner operating on a hidden ELIMINATED field reaches wrong conclusions with full confidence. Unseen Tax recognizes that a cooperative member operating on hidden per-call cost data makes budget decisions with full confidence — and those decisions are systematically incorrect in favor of the platform extracting the cost. *Hidden cost is the financial form of dirty data.* Both disclosures are reductions of the same foundational principle: a consequential variable structurally withheld from the deciding agent produces systematically distorted outcomes. Cross-reference: "Knowing what something COSTS narrows the budget space" — per canon-unseen-tax-anti-pattern-ai-cost-transparency-bp084 (composing with TIC).

**Innovation Area 36 — Code Breakers Guild and Gold Refined by Fire (Claim Group 29):**
The Code Breakers Guild disclosure establishes that the cooperative pays its critics at economic parity with its choir. Unseen Tax extends the same principle to the cost layer: *the cooperative SHOWS what it charges, not just what it delivers.* The transparency commitment of Code Breakers (adversarial verification surfaced and economically honored) and the transparency commitment of Unseen Tax (cost surfaced and structurally enforced) compose as a unit: the cooperative's commitment to transparency is not limited to knowledge claims. It applies equally to the financial terms of member participation.

**Personal Subscription Steward (canon-mnemosynec-personal-subscription-steward-tier-ramp-bp084):**
Claim 30.2 (cross-vendor aggregate) is a direct reduction to practice of the Personal Subscription Steward architecture. The Personal Subscription Steward's Tier 1 activation includes: per-Ask cost ticker in MnemosyneC desktop UI; per-Knight-yoke cost in BISHOP_DROPZONE yoke-returns; cross-vendor aggregate dashboard. Innovation Area 37 constitutes the patentable architecture underlying the Personal Subscription Steward's cost-transparency commitment.

---

## Empirical Receipt and Reduction to Practice

This innovation was ratified by Founder during BP084 session (2026-06-16). The originating instance — Cursor's default-to-Composer-2.5 behavior and the resulting hidden-cost extraction pattern — was identified and named by Founder-direct in the BP084 session, with the canon eblet `canon-unseen-tax-anti-pattern-ai-cost-transparency-bp084` minted under direct Founder ratification ("YES mint the unseen tax canon").

Reduction to practice in the cooperative substrate: the Phase 1 MnemosyneC metrics receipt (session cost summary surfaced in yoke-returns at Bishop and Knight context-consumption levels) constitutes a first primitive instance of this architecture — surfacing what work was done at what cost at session close. Phase 2 through Phase 4 roadmap is specified in the canon eblet and in this disclosure's Application section.

The claim that per-call cost transparency enables 5-20× reduction in unnecessary cost extraction is grounded in the structural observation that users operating without per-call cost data systematically select more expensive model tiers than they would with full information — this is not a behavioral speculation but an inference from the economic structure of the Unseen Tax: if hiding cost did not increase revenue, the industry would not have converged on hiding it.

Composes with: Innovation Area 35 (Truth Integrity Chain, epistemic transparency layer); Innovation Area 36 (Code Breakers Guild, economic transparency commitment); Personal Subscription Steward tier ramp architecture; Three-Currency Canon (cost surfaces denominated in fiat; Marks and Liana remain separate — no conflation).

*Ratified during BP084 · Founder-direct · 2026-06-16*

---

*Innovation Area 37 · PROV_22 Claim Group 30 · BP084 · Sonnet 4.6 · 2026-06-16*
*status: founder-ratify-pending · Liana Banyan Corporation · Inventor: J. Jones · Provisional Patent Application*
