# Mnemosynec Staged Launch Plan -- BP078

The full capability of Mnemosynec already exists in source. This plan governs WHEN each surface becomes visible to the user, not when we build it. We ship the product in layers, each layer earned by the user completing a real action. The recipe pattern: the ingredients were always there, we just do not put them on the counter until the cook is ready. The Atlas scheduling pattern: each feature unlocks as the user advances through a natural progression.

---

## Philosophy

- We already have most of the functionality. No new build gates required to execute this plan.
- Stage WHEN each surface appears, not WHEN we build it.
- Recipe pattern: the recipe ingredients exist in the pantry. We surface them when the user is cooking, not on arrival.
- Atlas scheduling pattern: features appear as the user moves forward, not all at once.
- Recruited milestone is the hinge. Before recruited: simple, single-focus, no noise. After recruited: the full tab UI becomes visible.
- Off-the-Street user lands on a clean Welcome flow. Nothing else. No tab bar. No settings gear. No money UI.

---

## Lifecycle Stages

**Stage A -- COLD**
A stranger lands on the app for the first time, or any user who has never completed a round trip. No history, no context, no trust established.

**Stage B -- CHOSEN**
The user has clicked a doorway card. They have declared intent. They are now on the layer 2 choice surface for their chosen path.

**Stage C -- ACTIVE**
The user has clicked a layer 2 choice and is running their first action. A benchmark is running, or an Ask box is live. Minimal surface. Single focus.

**Stage D -- RECRUITED**
The user has completed at least one successful round trip with the app: asked a question and received an answer, or completed one benchmark run. This is the hinge. Tabs unlock here for the first time.

**Stage E -- ENGAGED**
The user has opted into the $5/year membership, OR has accumulated more than 24 hours of cumulative usage. The cooperative layer becomes visible.

**Stage F -- COOPERATIVE**
The user has made their first substrate contribution or earned their first Mark. Full UI. Contribution metrics. Code Breaker Guild. Eblets. Advanced surfaces.

---

## Surface Map per Stage

**Stage A (Cold)**
Visible: Welcome view only. Hero line. Subline. Three bullets. Elephant mascot. Benchmark proof graphic. Two doorway cards. Mesh checkbox at bottom.
Hidden: All tabs. Settings gear. Any cooperative-class UI. Anything that asks for money or implies ongoing commitment.

**Stage B (Chosen)**
Visible: Layer 2 choice cards for the chosen doorway. A back-to-Welcome affordance.
Hidden: All tabs. Settings gear. The doorway card not chosen. Any cooperative-class UI.

**Stage C (Active)**
Visible: A minimal action surface. Ask box for the Use It path. Benchmark progress view for the Prove It path. A back-to-Welcome affordance.
Hidden: All tabs. Settings gear. Any cooperative-class UI.

**Stage D (Recruited)**
Visible: Tab bar unlocks for the first time. Four tabs visible plus More dropdown: Frame, AI, FAQ, Kitchen Table, More.
Hidden: $ LB Account tab. Settings gear (or hidden behind a subtle hint link). Cooperative membership UI. Marks, Credits, Joules. Mirror Clause UI. Any money ask.

**Stage E (Engaged)**
Visible: $ LB Account tab appears. Settings gear is visible. A "Join the cooperative" CTA appears in the Frame tab.
Hidden: Advanced Settings sections still collapsed by default. Cooperative earning details behind expand.

**Stage F (Cooperative)**
Visible: Full UI. Contribution metrics. Code Breaker Guild. Eblets. All advanced surfaces.
Hidden: Nothing structurally hidden. Advanced section still collapsed by default.

---

## Trigger Definitions

| Transition | Trigger |
|---|---|
| A to B | User clicks a doorway card |
| B to C | User clicks a layer 2 choice card |
| C to D | first_successful_round_trip event fires (ask + answer, or benchmark complete) |
| D to E | User opts into $5/year membership OR cumulative usage crosses 24 hours |
| E to F | User makes first substrate contribution OR earns first Mark |

---

## Persistence

localStorage keys:

- `mnemosynec_lifecycle_stage` -- current value: A / B / C / D / E / F
- `mnemosynec_lifecycle_history` -- array of objects: `{ stage, timestamp }`

Existing per-feature flags continue to work. Migration rule: if an older flag (bp067 first-run flag) is present but `mnemosynec_lifecycle_stage` is absent, treat as Stage A and show Welcome.

---

## Off-Ramp

At every stage, the user has a clear path back to Welcome. We do not strand anyone. If a user wants to change their AI choice or see the doorways again, they get there via Settings (once visible) or a visible "back" affordance in Stages A, B, C. The setting "Show Welcome Tour" is available at any stage once Settings is visible.

---

## Composes With

- BP073 Dr. MnemosyneC Amnesia / Substrate Cure canon
- BP074 son's character art canon (elephant mascot)
- BP076 SKU labels NANO / CORE / LITE / FULL canon (still canonical)
- BP078 Founder ratify on doorway design
- BP078 Pawn UX evaluation (Off-the-Street failure -- staged unlock is the structural fix)
- feedback-every-click-visible-feedback canon (every transition gives user feedback)
- feedback-ux-seg-screenshot-mandatory canon (every stage gets a screenshot in yoke return)

---

## Version Delivery Map

| Version | Stages Delivered |
|---|---|
| v0.1.35 | Stage A + Stage B (Welcome + Layer 2 choices, no tab unlock) |
| v0.1.36 | Stage C + recruitment trigger (C to D event, first round trip) |
| v0.1.37 | Stage D tab unlock (four tabs + More visible after recruited) |
| v0.1.38+ | Stage E ($ LB Account tab, cooperative CTA) and Stage F (full surfaces) |

The plan is additive. Each version ships cleanly without breaking prior stages. A user who installs v0.1.35 and upgrades to v0.1.37 will see their lifecycle stage preserved in localStorage and will not be reset unless they request it.

---

*BP078 -- Liana Banyan Platform -- Staged Launch Plan -- Founder-ratify required before distribution.*
