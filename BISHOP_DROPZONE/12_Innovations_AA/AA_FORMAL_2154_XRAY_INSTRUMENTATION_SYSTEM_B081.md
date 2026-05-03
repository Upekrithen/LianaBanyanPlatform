---
name: X-Ray Instrumentation System
description: Platform-wide transparency system annotating DOM landmarks with data-xray-id attributes paired with a centralized glossary, enabling members to inspect platform structure, data flows, and cooperative economics through a visual overlay mode.
type: aa_formal
innovation_id: "2154"
ratification_session: B081
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - xray instrumentation system
  - data-xray-id dom annotation
  - member facing transparency overlay
  - aa formal 2154
  - platform structure transparency
  - xray glossary economic context
  - cooperative transparency feature
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A Formal — Innovation #2154
## X-Ray Instrumentation System
### Bishop B081 | April 5, 2026

---

## CLASSIFICATION

- **Innovation Number**: #2154
- **Crown Jewel**: YES
- **Domain**: platform_architecture, transparency
- **Patent Bag**: Prov 12 candidate (Transparency Infrastructure)
- **First Documented**: B080 (K320 X-Ray Instrumentation Sweep)
- **Implemented**: K294 Foundation + K320 cross-cutting sweep across all V2 pages

---

## DESCRIPTION

A platform-wide transparency system that annotates DOM landmarks with `data-xray-id` attributes paired with a centralized glossary (`xrayGlossary.ts`) providing structured explanations of every instrumented element. When the platform's X-Ray mode activates, cyan dashed outlines and label badges render on every instrumented landmark, revealing the platform's structure, purpose, and data flows in real-time as the member navigates.

This is not a developer tool or debug mode. It is a **member-facing transparency feature** that lets any participant understand what each part of the platform does, what data it shows, and how it connects to the cooperative's economics and governance.

---

## MECHANISM

1. Every significant UI element across all V2 pages receives a `data-xray-id` attribute (e.g., `data-xray-id="housing-waterwheel-breakdown"`, `data-xray-id="pioneer-reward-ladder"`).
2. The `xrayGlossary.ts` file maps each ID to a structured entry: name, description, data sources, economic connections, and governance implications.
3. When X-Ray mode is toggled ON (via the platform avatar toggle), CSS and JS render:
   - Cyan dashed outlines around every instrumented element
   - Floating label badges showing the element's glossary name
   - Click-to-expand panels showing the full glossary entry
4. X-Ray mode persists across page navigation via state management.
5. New pages and components are required to add glossary entries as part of the V2 build process (enforced by Knight prompt templates).

---

## PRIOR ART ASSESSMENT

**No known prior art for member-facing platform structure transparency.**

Browser DevTools expose DOM structure to developers. Accessibility tools expose semantic structure. No platform exposes its own internal structure, data flows, and economic connections to its members as a first-class feature. The closest analog is Wikipedia's "View source" but that shows markup, not structured explanations of purpose and economic function.

The combination of (a) systematic DOM annotation, (b) structured glossary with economic/governance context, (c) visual overlay rendering, and (d) member-facing (not developer-facing) positioning is novel.

---

## FORMAL CLAIMS

1. A cooperative platform transparency system comprising systematic DOM landmark annotations paired with a structured glossary, wherein activating a transparency mode renders visual indicators on annotated elements and provides structured explanations of each element's purpose, data sources, and economic connections to platform members.

2. A method of providing platform structure transparency to cooperative members comprising: annotating user interface elements with structured identifiers, maintaining a centralized glossary mapping each identifier to descriptions of purpose, data flows, and economic governance connections, and rendering visual overlay indicators with expandable explanation panels when a transparency mode is activated.

3. A cooperative platform architecture wherein every significant user interface element is annotated with a transparency identifier, said identifiers mapped to a glossary containing economic and governance context, enabling members to inspect the platform's structure and economic flows through a visual overlay system positioned as a member feature rather than a developer tool.
