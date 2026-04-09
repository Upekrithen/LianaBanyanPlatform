# Knight Handoff: Phase 1 — Visual Unification Migration

## From: Bishop (Claude Desktop)
## To: Knight (Cursor)
## Date: March 19, 2026
## Priority: HIGH — Founder-approved plan, ready for execution

---

## What This Is

Mass CSS migration of ~160 pages from inconsistent styling to a unified portal palette system. This is mechanical builder work — open page, strip old styles, wrap in new layout, verify build, repeat.

## Prerequisites (Bishop will complete before handoff)

Bishop will create:
1. `src/components/PortalPageLayout.tsx` — the portal-aware page wrapper
2. `[data-portal]` CSS variable blocks in `src/index.css` — the 6 portal palettes

Knight's job is to USE these to migrate pages.

---

## The Migration Pattern

Every page follows the same pattern:

### BEFORE (typical dark page):
```tsx
const SomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl font-bold">Title</h1>
        <p className="text-slate-400">Description</p>
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
          Card content
        </div>
      </div>
    </div>
  );
};
```

### AFTER:
```tsx
import { PortalPageLayout } from '@/components/PortalPageLayout';

const SomePage = () => {
  return (
    <PortalPageLayout title="Title" maxWidth="lg">
      <p className="text-muted-foreground">Description</p>
      <Card>
        Card content
      </Card>
    </PortalPageLayout>
  );
};
```

### Color Replacement Map

| Old (remove) | New (use instead) |
|-------------|-------------------|
| `text-white` | `text-foreground` |
| `text-slate-400`, `text-slate-300` | `text-muted-foreground` |
| `text-slate-500`, `text-slate-600` | `text-muted-foreground/70` |
| `bg-slate-900`, `bg-slate-800` | `bg-background` |
| `bg-slate-800/30`, `bg-slate-700/20` | `bg-card` or `bg-muted` |
| `border-slate-700`, `border-slate-600` | `border-border` |
| `style={{ background: 'rgba(15,23,42,...)' }}` | `className="bg-card"` |
| `style={{ background: '#0a1628' }}` | Remove entirely (PortalPageLayout handles bg) |
| `bg-gradient-to-br from-slate-900...` | Remove entirely (PortalPageLayout handles bg) |
| `text-amber-400` (accent) | `text-primary` |
| `text-cyan-400` (accent) | `text-primary` |
| `bg-amber-500` (button) | `bg-primary` |
| `border-amber-500/30` | `border-primary/30` |

### Rules
1. NEVER change the content or logic of a page — only styling
2. NEVER touch `Index.tsx`, `GhostWorld.tsx`, `DurinsDoor.tsx`, `Senate.tsx`, `HexIsle*.tsx`, `TreasureMapGame.tsx`
3. If a page has custom interactive styling (hover effects, animations), preserve the LOGIC but use token colors
4. Run `npx tsc --noEmit` after every 10-15 page batch
5. Run `npx vite build` after each batch to verify no breakage

---

## Migration Order (by user visibility)

### Batch 1: Public explainer pages (Founder sees these daily)
- `src/pages/WhyNoAds.tsx`
- `src/pages/WhyNoVC.tsx`
- `src/pages/FAQ.tsx`
- `src/pages/CreatorPitchPage.tsx`
- `src/pages/FinancialTransparencyPage.tsx`

### Batch 2: Browse/discovery pages
- `src/pages/BrowseMarketplace.tsx`
- `src/pages/BrowseBusiness.tsx`
- `src/pages/CreatorShowcasePage.tsx`
- `src/pages/AcademicPapersDirectory.tsx`
- `src/pages/CephasGatewayPage.tsx`

### Batch 3: Initiative pages
- All files matching `src/pages/*Initiative*.tsx`
- All files matching `src/pages/LetsMake*.tsx`
- `src/pages/DefenseKlaus.tsx`
- `src/pages/HarperGuild.tsx`

### Batch 4: Economy/governance pages
- `src/pages/BandWagon.tsx`
- `src/pages/StewardDashboard.tsx`
- `src/pages/GleanersCorner.tsx`
- `src/pages/Economics.tsx`
- All governance pages

### Batch 5+: Everything else
- Dashboard pages, admin pages, tool pages
- These are protected routes, lower visibility

---

## Verification Per Batch

After each batch:
1. `npx tsc --noEmit` — must pass clean
2. `npx vite build` — must succeed
3. Spot-check 2-3 pages in browser (dev server) — confirm no hardcoded dark backgrounds bleed through
4. Confirm shadcn Card/Button/Badge components look correct

---

## Commit Convention

One commit per batch:
```
Knight [session]: Phase 1 Batch N — migrate [page list] to PortalPageLayout

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

---

## Questions? 

If a page has complex custom styling that doesn't fit the simple pattern above, SKIP it and note it in the commit message. Bishop will handle edge cases.
