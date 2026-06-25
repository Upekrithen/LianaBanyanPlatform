# PAWN V3 INJECTS BRIEF

**BP089 · 2026-06-20**
**Target file:** mnemosynec-design-demo-v2 (2).html
**Destination:** mnemosynec.org/ai live landing -- post-Trial 02, pre-promote

---

## §0 Header

These injects are applied AFTER Trial 02 receipt lands and BEFORE v2 is promoted to the live mnemosynec.org landing. Six discrete injects (INJ-A through INJ-F). The v2(2) base structure is preserved. These are additive injects plus one section replacement (Saladin to Healthy Self-Interest).

---

## §1 Six Injects

### INJ-A · Trial 02 Receipt Block

**Slot:** Alongside or replacing the existing Storm Test / Mesh Proof / Benchmark R10 proof cards.

**Action:** Add a "Trial 02 · 70Q Paired BLACK MAMBA" proof card.

**Placeholder content (wire actual numbers when receipt lands):**

> Trial 02 · 70Q Paired BLACK MAMBA
> [XX]/70 · Pass A: claude · Pass B: gemma4:12b
> 4-peer paired · 0 Anthropic API calls
> MMLU-Pro per-domain selection
> [XX.X]% accuracy

Wire the actual percentage numbers when the Trial 02 receipt is confirmed. Do not publish placeholder percentages.

---

### INJ-B · Frontier Mesh Section

**Slot:** Between Lifecycle and Proofs sections.

**Section header:** "Your Frame Is One Node of the Frontier Mesh."

**Body:**

Every Frame self-verifies. Every receipt is Ed25519-signed. Frames replicate peer-to-peer via the Stamp-Certified IP Ledger. Wildfire propagation between frames. No central server holds the truth. The mesh IS the redundancy. Your Frame is not a client connecting to a service -- it is a node in a cooperative frontier.

---

### INJ-C · Tagline Lock

**Slot:** Subtitle directly under H1 in the hero, OR as og:description / meta description in `<head>`.

**Required verbatim text:**

> The Substrate Cure to AI Amnesia

This string must appear verbatim at least once in the demo. Both slots (hero subtitle + meta description) are preferred.

---

### INJ-D · Substrate Compounding Chart SVG

**Slot (primary):** Under the Lifecycle "Stone Tablet" stage as proof that the architecture compounds.

**Slot (alternate):** In the "Memory That Actually Works" benchmark section.

**Action:** Embed the substrate-compounding-chart SVG inline. Do not hotlink. The chart demonstrates the compounding accuracy effect as receipt volume grows.

---

### INJ-E · Replace Saladin's Peace Block with Healthy Self-Interest Framing

**Action: REPLACE** (this is the one destructive inject -- strip and replace, not additive).

**Strip the following from any public-facing body copy:**
- Any "Mercy persists but diminishes" decay table
- Any "Don't integrate, accept inferiority" Saladin framing
- Any "Pledge #2260 mercy" presentation layer
- Any patriotic-grandiose or mercy-from-strength framing

**Replace with:**

**Header:** "Here's why this is a good deal for you."

**Bullet list of concrete wins for the AI company:**
- Cost reduction: substrate-verified retrieval replaces redundant inference cycles
- Throughput: receipt-bearing mesh cuts per-query latency at scale
- Accuracy: 97.1% MMLU-Pro with free local + substrate vs 75-86% flagship-alone
- Vendor-resilience: members who own their substrate are stickier than API renters
- Free user-acquisition channel: every cooperative member is a qualified lead
- Brand-defensive: integrating well is the better posture against the cooperative-class wave

**Keep:** Patent Pledge #2260 reference as the legal mechanism -- it is real and correct. The PRESENTATION changes; the legal anchor stays.

**Canon reference:** [[canon-healthy-self-interest-licensing-supersedes-saladins-peace-public-framing-bp089]]

---

### INJ-F · Add "Substrate Works Without MnemosyneC Running" Section

**Slot:** New section. Suggested placement: after Architecture, before Proofs. Alternative: a "Use It Anywhere" block appended after the main content.

**Section header:** "Substrate Works Without MnemosyneC Running."

**Body:**

The substrate is a cooperative but private shared mesh of knowledge. Bring your own AI. MnemosyneC is the easiest on-ramp -- not a requirement.

**Three tiers:**

**Tier 1 -- Free local model + substrate**
Cost: zero. Accuracy: 97.1% MMLU-Pro. Beats flagship-alone for everyday work. Start here.

**Tier 2 -- Flagship + substrate**
Fraction of the cost. Orders of magnitude faster. More accurate. Use when the task demands it. ("Broke the sound barrier.")

**Tier 3 -- Standalone substrate API**
Your tools, your workflow, your AI. The substrate is the portable layer underneath.

**Verbatim inequality (do not paraphrase):**
> Free WITH Substrate > Flagship WITHOUT Substrate

**Close:** "Win all around."

**Canon reference:** [[canon-substrate-portable-mesh-integrates-with-any-reasoning-model-free-or-flagship-bp089]]

---

## §2 Acceptance Checklist

| # | Check | Pass condition |
|---|-------|----------------|
| 1 | Trial 02 numbers populated | Actual % from receipt · no placeholder numbers published |
| 2 | Frontier mesh section present | "Your Frame Is One Node of the Frontier Mesh" header visible |
| 3 | Tagline verbatim | "The Substrate Cure to AI Amnesia" appears at least once |
| 4 | Compounding chart embedded | SVG inline · renders in browser |
| 5 | Zero Saladin references in public body | Grep for "Saladin" / "mercy" / "inferiority" in rendered HTML returns 0 |
| 6 | Healthy Self-Interest framing present | "Here's why this is a good deal for you" + bullet list present |
| 7 | Substrate-Works-Without-MnemosyneC section present | Section visible in page |
| 8 | Three tiers explained | Tier 1 / Tier 2 / Tier 3 all present with descriptions |
| 9 | "Bring your own AI" present | Phrase present verbatim or paraphrase-equivalent in section |
| 10 | Zero em-dashes | Grep for U+2014 in HTML source returns 0 |

---

## §3 Out of Scope

Everything not listed in INJ-A through INJ-F is out of scope for v3.

Specifically:
- Saladin's Pattern remains canonical INTERNAL doctrine -- this brief only corrects PUBLIC presentation
- No changes to authentication, routing, or backend
- No changes to the cooperative membership flow or Stripe integration
- No redesign of existing v2(2) layout or visual system

---

## §4 Notes for Pawn

The v3 injects are not destructive to the base structure. Existing v2(2) HTML, CSS, and JS stay intact. The six injects are:

- INJ-A: additive (new proof card)
- INJ-B: additive (new section)
- INJ-C: additive (tagline text in hero + meta)
- INJ-D: additive (SVG embed)
- INJ-E: REPLACEMENT (Saladin block out, Healthy Self-Interest in) -- only destructive inject
- INJ-F: additive (new section)

Apply in order A through F. Confirm each against the acceptance checklist before marking v3 ready for Founder review.
