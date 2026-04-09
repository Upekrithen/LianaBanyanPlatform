# KNIGHT SESSION 294 — V2 Foundation Primitives
## Bishop B079 | April 4, 2026 | PHASE 0 of V2 Redesign

---

## MISSION

Build the shared foundation for all 36 v2 page redesigns: shell primitives (FocusShell, AppShell), design tokens, hero composition, proof strip, informative lock UX, sticky mobile CTA, VersionToggle, and `data-tour-target` hooks. Every downstream page (K295-K330) imports from this foundation.

**NO page rebuilds in this session.** Foundation only.

---

## CONTEXT

Pawn delivered 36 master design packets (B30/B31/B32/B35/B36/B37). Across all 36 pages the same ~10 primitives recur. Centralizing them now prevents drift, enforces doctrine, and makes Founder visual review deterministic.

See: `BISHOP_DROPZONE/V2_REDESIGN_IMPLEMENTATION_PLAN_B079.md` for the full phased roadmap.

---

## DELIVERABLES

### 1. Shell Primitives

**`src/components/shells/FocusShell.tsx`**
- Public/conversion pages (pre-auth, landing, membership, transparency)
- NO sidebar, NO persistent chrome
- Full-width hero slot, max-w content sections, centered CTAs
- Props: `{ children, hero?: ReactNode, seo?: SEOMeta }`

**`src/components/shells/AppShell.tsx`**
- Member workspaces (post-auth, dashboards, tools)
- Persistent sidebar + top bar + operational density
- Slots: hero (orientation card, not conversion), mainContent, rightRail?
- Props: `{ children, pageTitle, breadcrumbs?, rightRail? }`

Audit existing shell code in `src/layouts/` or wherever current shells live. If equivalents exist, upgrade them. Do not fork.

### 2. Hero Composition Component

**`src/components/v2/Hero.tsx`**
```tsx
type HeroProps = {
  eyebrow: string;
  headline: string;
  body: string;
  primaryCTA: { label: string; href?: string; onClick?: () => void };
  secondaryCTA?: { label: string; href?: string; onClick?: () => void };
  proofStrip?: string[]; // 3-5 items
  variant: 'focus' | 'app'; // focus = full viewport, app = orientation card
};
```
- `focus` variant: owns the viewport, typography scales up
- `app` variant: compact orientation strip, one dominant action
- Proof strip: horizontally scrollable chips on mobile

### 3. Proof Strip

**`src/components/v2/ProofStrip.tsx`**
- Horizontal chip list, max 5 items
- Mobile: swipeable scroll rail
- Accepts static strings or `{ icon, label }` objects

### 4. Informative Lock UX

**`src/components/v2/InformativeLock.tsx`**
- Replaces all "upgrade/premium/unlock" patterns
- Standard copy template: "Members can {action} here." (e.g. "respond", "launch", "transact")
- Props: `{ action: string; joinHref?: string }`
- NEVER uses: "upgrade", "premium", "unlock features", "paywall"

### 5. Sticky Mobile CTA

**`src/components/v2/StickyMobileCTA.tsx`**
- Fixed bottom bar, appears after first scroll (`IntersectionObserver`)
- Hidden on desktop (>=md breakpoint)
- One primary action, optional secondary

### 6. VersionToggle (for Cephas dual-render)

**`src/components/v2/VersionToggle.tsx`**
- Toggles between "At a Glance" / "Full Read" / "Academic" versions
- Props: `{ versions: Array<{ id: string; label: string }>; activeId: string; onChange }`
- Used by Cephas Gateway + all publication detail pages

### 7. Tour Anchor Hook

**`src/hooks/useTourTarget.ts`**
- Returns `data-tour-target` attribute object for element
- Usage: `<div {...useTourTarget('wallet')}>...</div>`
- K330 Guided Tour Overlay reads these anchors

### 8. Design Tokens (`src/styles/v2-tokens.css` or Tailwind theme extension)

- Currency colors: `--currency-credits`, `--currency-marks`, `--currency-joules` (distinct, non-crypto aesthetic)
- Semantic states: `--state-overdue` (amber, NEVER red), `--state-leading`, `--state-room-to-grow`
- Spacing scale: ensure mobile 16px gutter, desktop 24/32px
- `tabular-nums` utility class for all currency/balance displays
- `prefers-reduced-motion` respected (no parallax, simple fades)

### 9. Doctrine Documentation

**`src/components/v2/README.md`** — one-page doctrine card:
- 10 canonical design rules (copied from V2_REDESIGN_IMPLEMENTATION_PLAN_B079.md)
- Pre-completion checklist (price integrity, naming integrity, privacy, securities-safe, focal-point discipline, mobile CTA)
- Banned word list: upgrade, premium, unlock, equity, shares, dividends, ROI, invest, CEO, LLC

### 10. Storybook / Visual Harness (optional, nice-to-have)

If Storybook isn't wired, add a `/staff/v2-primitives` preview page that renders one example of each primitive with sample copy from Welcome Gate (B30).

---

## ACCEPTANCE

- [ ] `FocusShell` + `AppShell` exported from `src/components/shells/`
- [ ] All 7 v2 primitives compile with TypeScript, no `any`
- [ ] `Hero` component accepts both variants without breakage
- [ ] Banned word list enforced via eslint rule OR doctrine README reference
- [ ] Design tokens defined, `tabular-nums` applied to currency displays
- [ ] `npm run build` passes
- [ ] `/staff/v2-primitives` renders all primitives (or Storybook equivalent)
- [ ] Update `v2_redesign_tracker.notes` for all 36 pages: "Foundation available K294"

## DO NOT

- Do not rebuild any of the 36 pages in this session
- Do not modify existing page components that rely on current shells (that's migration, not foundation)
- Do not invent new design patterns — everything here is already in Pawn packets

---

*Bishop B079 — Phase 0 of V2 Redesign*
*Foundation primitives. Unblocks K295-K330.*
*FOR THE KEEP!*
