# Knight Session K336 — V2 Visual Polish Pass
## Bishop B081 | April 5, 2026

---

## MISSION

Now that all 38 V2 pages are built (K295-K332), do a cross-cutting visual polish pass to ensure consistency across the full surface. This is NOT a redesign — it's a quality pass to catch drift that accumulated across 38 build sessions.

## CHECKLIST

### 1. Hero Copy Consistency
Verify every V2 page follows the exact hero pattern: eyebrow → headline → body → primary CTA → secondary CTA → proof strip. Check for:
- Missing eyebrows
- Inconsistent CTA button styling (should all use the same button variant)
- Proof strips that don't show 83.3% / Cost+20% where specified
- Any remaining SaaS language ("upgrade", "premium", "unlock")

### 2. AppShell Sidebar Consistency
- All AppShell pages should have sidebar items that highlight correctly on their route
- No orphaned or duplicate sidebar entries
- Mobile sidebar behavior consistent (hamburger menu, same animation)

### 3. InformativeLock Usage
- Verify all ghost/non-member surfaces use `InformativeLock` (not ad-hoc lock messaging)
- Lock messages should all follow "Members can {action} here" pattern

### 4. X-Ray Anchor Completeness
- Every V2 page should have at least 3 `data-xray-id` anchors
- All anchors should have corresponding entries in `xrayGlossary.ts`
- No orphaned glossary entries pointing to removed elements

### 5. Tour Target Completeness
- Every V2 page should have at least 1 `data-tour-target` anchor
- Tour targets should match the guided tour stop list in `useGuidedTour.ts`

### 6. Mobile Responsive Check
- Sticky bottom CTA on all FocusShell pages
- Cards stack vertically on mobile (no horizontal overflow)
- Text doesn't overflow containers

### 7. Color Consistency
- No red for negative states (amber only)
- Cyan for X-Ray/builder mode elements
- Amber for beacon/attention elements

## CONSTRAINTS

- Fix issues in-place — no new components, no architecture changes
- If a page needs more than cosmetic fixes, log it as a follow-up task rather than rebuilding

## VALIDATION

- `npm run build` passes
- Spot-check 5 random V2 pages at localhost for visual consistency

---

*FOR THE KEEP!*
