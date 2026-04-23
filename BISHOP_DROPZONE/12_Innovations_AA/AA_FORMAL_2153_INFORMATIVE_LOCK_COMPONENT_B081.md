# A&A Formal — Innovation #2153
## Informative Lock Component
### Bishop B081 | April 5, 2026

---

## CLASSIFICATION

- **Innovation Number**: #2153
- **Crown Jewel**: YES
- **Domain**: platform_architecture, membership
- **Patent Bag**: Prov 12 candidate (Cooperative UX Patterns)
- **First Documented**: B079 (V2 Redesign Implementation Plan, Rule 8)
- **Implemented**: K294 Foundation Primitives, used across all V2 pages

---

## DESCRIPTION

A UI component that replaces traditional SaaS paywall/lock patterns with cooperative, informative messaging. When a non-member or guest encounters a feature that requires membership, instead of seeing "Upgrade to Premium" or "Unlock this feature," they see a contextual explanation of what members can do at that surface.

The pattern: **"Members can {action} here."** — never punitive, never extractive, always informative.

Examples:
- "Members can respond, launch, and transact here."
- "Members can drop beacons on any page to save their place."
- "Members can submit proposals and vote in governance."

The component accepts a `gateContext` prop describing the specific action being locked, and renders it within a warm, explanatory frame that positions membership as participation rather than purchase.

---

## MECHANISM

1. `InformativeLock` component accepts `gateContext: string` describing the locked action.
2. Renders a styled panel with cooperative messaging: "{gateContext}" framed as capability, not restriction.
3. CTA leads to Membership page (FocusShell), never to a "pricing" or "plans" page.
4. No language from the SaaS vocabulary is permitted: no "upgrade," "premium," "unlock," "subscribe to access," "free tier," or "plan."
5. Visual treatment uses the platform's warm palette (amber accents), never red/warning colors.
6. Ghost Browse surfaces (Innovation #TBD) show 70% content with InformativeLock on the remaining 30%, demonstrating value before asking for participation.

---

## PRIOR ART ASSESSMENT

**No known prior art for this specific cooperative lock pattern.**

All major SaaS platforms (Slack, Notion, Figma, Canva) use punitive lock/paywall messaging: "Upgrade to Pro," "This feature requires a paid plan," "Unlock with Premium." Cooperative platforms (Stocksy, REI) use membership gates but with standard e-commerce "join to purchase" framing, not informative capability descriptions.

The combination of (a) contextual action description, (b) anti-SaaS language enforcement, (c) warm visual treatment, and (d) positioning membership as participation rather than purchase is novel.

---

## FORMAL CLAIMS

1. A cooperative platform access component that renders contextual descriptions of member capabilities at locked surfaces, wherein the component is structurally constrained to use informative cooperative language and prohibited from rendering extractive SaaS vocabulary including "upgrade," "premium," "unlock," and "subscribe to access."

2. A method of presenting access restrictions in a cooperative platform comprising: receiving a context description of the locked action, rendering said description as a member capability statement rather than a restriction notice, applying cooperative visual treatment excluding warning colors, and directing the call-to-action to a membership participation page rather than a pricing or plans page.

3. A user interface system for a cooperative platform wherein guest users viewing locked features are presented with warm, contextual descriptions of what participating members can do at that surface, combined with a content preview ratio that demonstrates value before requesting membership participation.
