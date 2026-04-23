# A&A Formal #2258 — Tower of Peace Base Interface (Three-Door Help Entry)

**Innovation #:** 2258 (promoted in B098 from B096 stub)
**Category:** Member Onboarding / Help Surface / Cooperative Query Architecture
**Crown Jewel:** YES (CJ candidate)
**Original Stub Session:** B096
**Formal Drafting Session:** B098
**Inventor:** Jonathan Jones, Founder, Liana Banyan Corporation
**Patent Relevance:** Prov 13 thresh
**Source Stub:** `BISHOP_DROPZONE/INNOVATION_STUBS_2237_2245_B096_CHESSBOARD.md`
**Related:** #2249 ROM-First AI Inference, #2257 The Glove (MoneyPenny), Tower of Peace production system

---

## TL;DR

A three-door entry architecture for the cooperative platform's member help surface (Tower of Peace), wherein members bring questions, grievances, and requests for help through three distinct channels: **(1) text message via Twilio, (2) email via webhook, (3) on-site chat via web UI**. All three channels route into the same ROM-first query pipeline (Innovation #2249), achieving approximately 70% cache hit rate on member help queries and producing per-query costs of roughly 10–15% of a naive AI-assistant implementation. **This is the architectural difference between a viable free tier and a dead one** for cooperative platforms at scale — the query cost must be low enough that AI-backed member help fits within the platform's cooperative economics without requiring paid tiers or extractive upsells.

---

## Independent Claim

**Claim 1.** A computer-implemented method for operating a member help surface on a cooperative platform with a three-door entry architecture, comprising:

(a) Exposing to cooperative members three distinct help-entry channels: a telephony messaging channel, an email webhook channel, and a web-based chat channel, all entering a member help surface functionally named the Tower of Peace;

(b) Routing all member help requests from all three channels into a unified query pipeline comprising a read-only-memory cache layer, a primary inference layer, and an optional cross-reference verification layer;

(c) Serving approximately seventy percent of member help requests from the read-only-memory cache layer without invoking the primary inference layer, consistent with the operational ratios of Innovation #2249;

(d) Routing approximately twenty-five percent of member help requests to the primary inference layer for genuine reasoning tasks;

(e) Routing approximately five percent of member help requests (high-stakes categories including financial, legal, governance, and crown-letter-related queries) additionally to a cross-reference inference layer for verification;

(f) Returning responses to members through the same channel from which the request originated, with persona continuity across channels.

**Dependent Claim 1.1** — The method of Claim 1, wherein the blended per-query cost of the three-door entry architecture is less than twenty percent of the per-query cost of an equivalent naive help architecture in which every request is routed directly to a primary inference layer.

**Dependent Claim 1.2** — The method of Claim 1, wherein the cooperative economics of the platform (specifically, the $5 per year membership and the Cost+20% platform margin constraint) are made operationally viable by the cost reduction achieved through the architecture.

**Dependent Claim 1.3** — The method of Claim 1, wherein the three channels share a common persona layer per Innovation #2257 (The Glove), ensuring that member interaction history is continuous across channels.

**Dependent Claim 1.4** — A system comprising a processor, three channel adapters, a unified query pipeline, and instructions stored on a non-transitory computer-readable medium which, when executed, cause the processor to perform the method of Claim 1 through Claim 1.3.

---

## Prior Art Distinction

Member help surfaces in traditional SaaS platforms (Intercom, Zendesk, Salesforce Service Cloud) route inquiries to human agents or to single-channel AI assistants without the specific three-channel unified architecture. AI-backed help systems at scale (ChatGPT Enterprise, Google Bard Business) operate on a single-channel model at per-query costs incompatible with cooperative free-tier economics. **No system combines (a) three-door entry across SMS/email/web chat, (b) ROM-first cooperative query pipeline with 70% cache hit rate, and (c) architectural cost economics specifically tuned to preserve a $5/year cooperative membership model.** The combination is novel in cooperative platform architecture.

---

## Cross-References

- **#2249 ROM-First AI Inference Cost Architecture** — the underlying query pipeline
- **#2257 The Glove (MoneyPenny Multi-Channel Persona Layer)** — persona layer sharing
- **Tower of Peace** — existing production help-surface metaphor this innovation extends

---

**FOR THE KEEP.**
