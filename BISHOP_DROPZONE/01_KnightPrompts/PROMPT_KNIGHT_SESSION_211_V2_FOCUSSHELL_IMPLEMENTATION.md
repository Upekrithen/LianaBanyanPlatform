# KNIGHT SESSION 211 — v2 FocusShell Implementation (Pawn Design Spec)
## Priority: HIGH — Affects ALL FocusShell pages across every domain
## Source: Pawn UI/UX Audit (April 1, 2026) + Bishop B056
## Can run in PARALLEL with K208-K210 (no domain dependency)

---

## CONTEXT

Pawn audited the Build a Business page and identified the core presentation problem: **the page has strong content but the presentation fights itself.** Too many competing UI layers, mixed page modes (marketing hero + workspace dashboard), floating promo widget stealing focus from the hero CTA.

Pawn produced a complete redesign spec including an HTML/CSS scaffold. Bishop saved it to the v2 codebase. Your job: translate Pawn's scaffold into production React/Tailwind components.

**Reference files** (READ THESE FIRST):
- `platform-v2/src/app/FOCUS_SHELL_DESIGN_SPEC.md` — Full design spec with rules, spacing tokens, class structure
- `platform-v2/src/app/focus-shell-reference.html` — Pawn's complete HTML/CSS scaffold (open in browser to see it)
- `platform-v2/src/app/FocusShell.tsx` — Current stub (replace this)

---

## PAWN'S CORE PRINCIPLE

> "If this page's purpose is 'start a project,' then anything not directly helping that action should be muted, collapsed, or delayed."

> "Above the fold, show the offer. Below the fold, show the system."

---

## TASK 1: Build FocusShell Component

Replace the current stub `FocusShell.tsx` with a production component that implements Pawn's spec:

### What FocusShell DOES:
- Renders a slim global header (logo, search, profile — NO sidebar, NO bookshelf)
- Suppresses all workspace chrome (no floating widgets, no debug badges, no inventory panels)
- Provides a workspace drawer toggle (collapsed by default, slide-out on click)
- Sets up the focus-page CSS context (dark background, centered content, generous spacing)

### What FocusShell DOES NOT:
- No sidebar navigation
- No bookshelf rail
- No floating benefits/promo widgets
- No persistent left toolbar
- No "Design Mode" badges

### Component Structure:
```tsx
<FocusShell>
  <FocusHeader />          {/* Slim: logo, search, profile only */}
  <main>{children}</main>   {/* Full-width dark canvas */}
  <WorkspaceDrawer />       {/* Collapsed by default, toggle to open */}
</FocusShell>
```

---

## TASK 2: Build Hero Components

Create reusable hero components that any FocusShell page can compose:

```
platform-v2/src/shared/components/focus/
├── HeroStage.tsx        # Full-viewport dark container, centers content
├── HeroEyebrow.tsx      # Small badge above headline
├── HeroTitle.tsx        # Large headline, accent color spans
├── HeroBody.tsx         # Supporting copy, max-width ~48ch
├── HeroActions.tsx      # Primary + Secondary CTA row (stacks on mobile)
├── HeroProof.tsx        # Inline trust badges replacing floating widget
├── HeroScrollCue.tsx    # Subtle scroll indicator
├── ProcessSection.tsx   # Three-step process grid
├── ProcessCard.tsx      # Individual step card
└── index.ts             # Barrel exports
```

### Spacing (from Pawn's spec):
- Hero top padding: `py-20` (80px) desktop, `py-16` (64px) mobile
- Eyebrow to title: `mb-8` (32px)
- Title to body: `mt-8`
- Body to actions: `mt-8`
- Actions to proof: `mt-6`
- Hero to next section: `pt-20` minimum

### Responsive:
- Desktop: CTAs inline, proof badges inline, 3-column process grid
- Mobile (<980px): CTAs stacked full-width, proof badges stacked, single-column grid
- Mobile (<640px): Tighter padding, smaller section titles

---

## TASK 3: Build WorkspaceDrawer

The bookshelf/workspace rail becomes an optional slide-out drawer instead of a permanent column:

```tsx
// platform-v2/src/shared/components/layout/WorkspaceDrawer.tsx
interface WorkspaceDrawerProps {
  children?: ReactNode;
}
```

- Default: collapsed, only a small toggle button visible (fixed right edge)
- On click: slides in from right (380px width, `translateX` transition)
- Contains: Essentials, Initiatives, Halls modules (same content as v1 bookshelf)
- Mobile: toggle moves to bottom-right corner

---

## TASK 4: Rebuild Build-a-Business Page Using FocusShell

As the first FocusShell page, rebuild the Build a Business page following Pawn's exact layout:

1. `FocusShell` wrapper (no workspace chrome)
2. `HeroStage` with eyebrow "Build a Business"
3. Headline: "You Have a Play. I Have a Stage."
4. Body: "Launch your Keep for $5..."
5. Two CTAs: "Start Your Project" (primary), "Browse Examples" (secondary)
6. Inline proof strip: "$5 to launch", "Founder-equal terms", "No executive privilege"
7. Process section: 3 steps (Choose venture, Shape keep, Launch under equal terms)
8. Examples section: Creator Keep, Workshop Keep
9. Benefits section: Early commitment rewards, Transparent founder rules

---

## TASK 5: Update Existing FocusShell Pages

All pages currently using `<FocusShell>` in the membership domain (K207) should work with the new implementation:
- MembershipPage (FocusShell)
- MembershipGatePage (FocusShell)
- MemberAgreementPage (FocusShell)
- MembershipSuccessPage (FocusShell)

Verify these still render correctly with the updated shell.

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

```bash
cd librarian-mcp; npx tsc; node dist/indexer/buildIndex.js
```

---

## VERIFICATION

1. `npm run build` passes
2. Open `focus-shell-reference.html` in browser — compare with your React implementation
3. FocusShell pages show NO bookshelf, NO floating widgets, NO sidebar
4. WorkspaceDrawer opens/closes smoothly on toggle
5. Hero owns the viewport — one dominant headline, one dominant CTA group
6. Mobile: CTAs stack, drawer hidden, proof badges stack
7. Existing membership FocusShell pages still work
8. Librarian indexes rebuilt

---

## DESIGN RULES (from Pawn)
- One page, one first impression, one dominant action
- Above the fold: show the offer. Below the fold: show the system.
- Trust signals belong IN the story, not floating OVER it
- Hero container: max-width 760px, centered
- Only 2 CTAs visible above the fold — primary + secondary, nothing else
- No empty placeholder cards in first view
- No debug/design badges in user-facing view

---

*Bishop B056 — FocusShell Implementation from Pawn's Design Spec*
*One page. One first impression. One dominant action.*
*FOR THE KEEP!*
