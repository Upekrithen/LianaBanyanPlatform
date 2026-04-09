# V2 Foundation Doctrine (B079)

This folder contains shared V2 primitives used across K295-K330 page redesign sessions.

## Canonical Design Rules

1. Use `FocusShell` for pre-auth conversion/public pages; use `AppShell` for post-auth operational pages.
2. Keep one dominant call-to-action per viewport section.
3. Keep pricing language structurally accurate: creator keeps **83.3%** and membership is **$5/year**.
4. Use informative membership gating: "Members can {action} here."
5. Keep hero composition consistent: eyebrow, headline, body, CTA cluster, and proof strip.
6. Keep proof strip to max five compact facts to preserve scanability.
7. Keep mobile-first behavior explicit, including sticky mobile CTA where conversion intent exists.
8. Respect reduced-motion users; avoid parallax and heavy animation patterns.
9. Use `data-tour-target` anchors for tour-critical interactions.
10. Keep real-user states empty by default; mock values belong only to WildFire Tour contexts.

## Pre-Completion Checklist

- Price integrity validated (`$5/year`, `83.3%`, `Cost + 20%`).
- Naming integrity validated (Credits, Marks, Joules).
- Privacy-safe messaging confirmed (no surveillance/monetized data language).
- Membership rights-safe language confirmed.
- Focal-point discipline confirmed (single dominant action).
- Mobile CTA behavior tested on small viewport.

## Banned Word List

Do not use speculative-finance or ownership-claim terms in V2 page copy:

- upgrade
- premium
- unlock
- ownership claims
- passive returns
- speculative upside
- CEO
- LLC
