---
name: Tour Target Annotation System
description: Systematic approach annotating all platform page landmarks with data-tour-target attributes via a useTourTarget React hook, creating a maintainable bidirectional link between page content and guided tour overlays as a required build deliverable.
type: aa_formal
innovation_id: "2157"
ratification_session: B081
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - tour target annotation system
  - data-tour-target react hook
  - guided tour build annotation
  - aa formal 2157
  - usetour target hook
  - dual layer annotation xray tour
  - resilient guided tour architecture
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A Formal — Innovation #2157
## Tour Target Annotation System
### Bishop B081 | April 5, 2026

---

## CLASSIFICATION

- **Innovation Number**: #2157
- **Crown Jewel**: YES
- **Domain**: platform_architecture, onboarding
- **Patent Bag**: Prov 12 candidate (Guided Experience Infrastructure)
- **First Documented**: B079 (K294 Foundation Primitives)
- **Implemented**: K294 foundation hook, K320 sweep expanded to all V2 pages, K332 Guided Tour Overlay consumes annotations

---

## DESCRIPTION

A systematic approach to annotating all platform page landmarks with `data-tour-target` attributes via a dedicated React hook (`useTourTarget`), creating a maintainable bidirectional link between page content and guided tour overlays. Every V2 page registers its key landmarks during the build process, and the Guided Tour system (K332) consumes these annotations to anchor walkthrough steps to live page elements.

This system works in concert with the X-Ray Instrumentation System (#2154) — X-Ray provides transparency for exploration, Tour Targets provide structure for guided learning. Together they form a dual-layer annotation architecture: one for self-directed discovery, one for curated walkthroughs.

---

## MECHANISM

1. `useTourTarget(targetId: string)` React hook returns a ref that attaches `data-tour-target={targetId}` to the DOM element.
2. Every V2 page includes at least one tour target on its primary content area (e.g., `data-tour-target="housing"`, `data-tour-target="pioneers"`, `data-tour-target="wheels"`).
3. Key sub-components within pages also register tour targets (e.g., `data-tour-target="captain-priority-queue"`, `data-tour-target="wallet-currency-breakdown"`).
4. The Guided Tour Overlay (K332) queries `[data-tour-target]` attributes to anchor spotlight circles, tooltip positions, and step sequences to live page elements.
5. Tour sequences are defined as ordered lists of target IDs, allowing tours to be composed without hardcoding pixel positions or DOM paths.
6. If a target element is not found (page not loaded, component conditionally hidden), the tour step gracefully skips rather than breaking.
7. Knight prompt templates include tour target instrumentation as a required deliverable for every V2 page build.

---

## PRIOR ART ASSESSMENT

**No known prior art for build-time annotation-driven tour systems in cooperative platforms.**

Product tour libraries (Shepherd.js, Intro.js, React Joyride) attach to CSS selectors or DOM IDs. These are fragile — they break when selectors change. The `data-tour-target` approach creates a stable, semantic annotation layer that is:
- Declared by the component author during build (not bolted on after)
- Queryable by any tour system without coupling to implementation details
- Self-documenting via the `useTourTarget` hook pattern
- Resilient to component refactoring (target IDs are stable even if component internals change)

No known platform uses a dedicated hook + annotation pattern that makes tour targeting a required part of the component build process rather than a post-hoc addition.

---

## FORMAL CLAIMS

1. A cooperative platform guided experience system comprising a React hook that attaches semantic tour-target annotations to DOM elements during component rendering, a guided tour overlay that queries said annotations to anchor walkthrough steps, and a build process requirement ensuring every platform page includes tour-target annotations as a first-class deliverable.

2. A method of creating resilient guided tours in a cooperative platform comprising: providing a hook function that attaches stable semantic identifiers as data attributes to DOM elements, composing tour sequences as ordered lists of said identifiers, and resolving tour step positions at runtime by querying the annotation layer rather than hardcoding CSS selectors or DOM paths.

3. A dual-layer annotation architecture for a cooperative platform comprising: a first annotation layer (`data-xray-id`) providing member-facing transparency overlays for self-directed discovery, and a second annotation layer (`data-tour-target`) providing guided walkthrough anchors for curated learning experiences, both layers applied to the same page elements during the build process and consumed by independent overlay systems.
