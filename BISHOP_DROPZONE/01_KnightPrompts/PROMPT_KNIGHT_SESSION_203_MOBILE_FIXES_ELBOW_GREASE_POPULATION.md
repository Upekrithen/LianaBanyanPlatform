# KNIGHT SESSION 203 — Mobile Responsive Fixes + Elbow Grease Population
## Priority: HIGH — Mobile experience is broken in key areas
## Bishop B053
## Depends on: K202 (Red Carpet DB), K200 (Elbow Grease Badge)

---

## CONTEXT

Three issues from B052 that need fixing:

1. **NotesOverlay** positions itself at `x: window.innerWidth - 400` — completely off-screen on mobile
2. **FeedbackTutorialOverlay + CrossPortalNav** crowd each other on the landing page
3. **elbowGreaseLevel** was added to the `XRayGlossaryEntry` interface but never populated on most entries

---

## TASK 1: NotesOverlay Mobile Fix

**Modify:** `platform/src/components/tour/NotesOverlay.tsx`

### Problem
Line ~33: `const [pos, setPos] = useState({ x: window.innerWidth - 400, y: 80 });`

On a 375px mobile screen, this sets x = -25. The 360px-wide panel is completely off-screen.

### Fix

Import the existing `useIsMobile` hook and conditionally position/size the overlay:

```typescript
import { useIsMobile } from '@/hooks/useIsMobile';

// Inside the component:
const isMobile = useIsMobile();

const [pos, setPos] = useState(() => ({
  x: isMobile ? 8 : window.innerWidth - 400,
  y: isMobile ? 60 : 80,
}));
```

### Mobile Layout Changes

When `isMobile` is true:
- **Width:** `w-[calc(100vw-16px)]` instead of `w-[360px]` — full width with 8px margins
- **Position:** Fixed to bottom of screen (`bottom: 0, left: 0, right: 0`) instead of draggable
- **Height:** Max 50vh so it doesn't cover the whole screen
- **Dragging:** Disabled on mobile (no onMouseDown handler)
- **Close button:** Larger touch target (44px minimum)

```tsx
// Simplified mobile layout
{isMobile ? (
  <div className="fixed bottom-0 left-0 right-0 z-[60] bg-zinc-900/95 border-t border-cyan-500/30 rounded-t-xl max-h-[50vh] overflow-y-auto p-4">
    {/* Title bar with close button */}
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-sm font-medium text-cyan-300">
        {mode === 'codebreaker' ? '🔑 Codebreaker' : `Notes: ${title}`}
      </h3>
      <button onClick={onClose} className="w-11 h-11 flex items-center justify-center text-zinc-400">
        ✕
      </button>
    </div>
    {/* Content */}
    <textarea ... className="w-full min-h-[100px] ..." />
    <button ... className="w-full mt-2 py-3 ...">{mode === 'codebreaker' ? 'Unlock 🔑' : 'Ok'}</button>
  </div>
) : (
  // Existing desktop draggable layout
  ...
)}
```

### Codebreaker Mode on Mobile
Same bottom-sheet pattern but with gold/amber theme instead of cyan:
- Border: `border-amber-500/30`
- Title text: `text-amber-300`
- Submit button: amber background

---

## TASK 2: Tutorial + CrossPortalNav Mobile Fix

**Problem:** On the landing page (`/`), `CrossPortalNav` renders at the top and `FeedbackTutorialOverlay` renders on top of it, creating a crowded stack above the hero content.

### Fix Option A: Hide CrossPortalNav during tutorial

**Modify:** `platform/src/components/CrossPortalNav.tsx`

Add a prop or context check:

```typescript
import { useIsMobile } from '@/hooks/useIsMobile';

export function CrossPortalNav() {
  const isMobile = useIsMobile();
  const pathname = useLocation().pathname;
  
  // On mobile landing page, collapse to icon-only mode
  if (isMobile && pathname === '/') {
    return (
      <nav className="flex items-center justify-center gap-2 py-1 px-2 bg-zinc-900/80 backdrop-blur-sm">
        {portals.map(p => (
          <a key={p.href} href={p.href} className="p-1.5" title={p.label}>
            <p.icon className="w-4 h-4 text-zinc-400" />
          </a>
        ))}
      </nav>
    );
  }
  
  // Existing full layout for desktop and non-landing pages
  return (/* existing JSX */);
}
```

### Fix Option B: Don't show tutorial on landing page at all

**Modify:** `platform/src/AppShell.tsx` (or wherever FeedbackTutorialOverlay is conditionally rendered)

The tutorial spotlight targets `[data-xray-id="welcomegate-fable"]` which is on the landing page. But on mobile, the fable card is below the fold and the tutorial arrow doesn't point to anything useful. 

Better approach: On mobile, only show the tutorial on pages where the target element is visible in the initial viewport (like `/helm` or content pages), not on `/`.

```typescript
const isMobile = useIsMobile();
const pathname = useLocation().pathname;

// Don't show tutorial overlay on mobile landing page — too crowded
const showTutorial = !tutorialDismissed && !(isMobile && pathname === '/');
```

### Recommended: Do BOTH fixes
- CrossPortalNav icon-only mode on mobile landing page (cleaner nav)
- Tutorial skips mobile landing page (less crowding)

---

## TASK 3: Populate elbowGreaseLevel on xrayGlossary Entries

**Modify:** `platform/src/data/xrayGlossary.ts`

The `elbowGreaseLevel` field exists on the interface but most entries don't have it set. Populate it based on the Elbow Grease scale:

| Level | Name | Activities |
|-------|------|-----------|
| 1 | Browse | Reading articles, exploring pages, taking tours |
| 2 | Engage | Giving feedback, hitting 100 Marks, dropping beacons |
| 3 | Research | Finding businesses online, sending Cue Cards, Codebreakers |
| 4 | Create | Designing icons, writing content, building Brand packages |
| 5 | Scout | Bounty Photography in person, Pearl Diver deal logging |
| 6 | Pitch | Walking into business with Red Carpet card |
| 7 | Launch | Starting project, setting up storefront |
| 8 | Captain | Building crew (Oar Slots), managing Node |
| 9 | Forge | Cold Start initiative |
| 10 | Founder | Multiple Nodes, train Captains |

### Assignment Rules

For EVERY entry in `XRAY_GLOSSARY`, add `elbowGreaseLevel` based on what the element represents:

**Level 1 (Browse):**
- `main-card`, `hero-card`, `hero-section`, `hero-flip-card`, `rotating-quotes` — these are just landing page reading
- Any Cephas content viewing elements
- Tour/walkthrough elements
- Trail Map viewing

**Level 2 (Engage):**
- `welcomegate-fable` — reading + understanding
- Beacon-related elements (dropping beacons)
- Feedback/notes elements
- Prize Panel viewing
- Mark milestone elements

**Level 3 (Research):**
- Pearl Diver elements
- Cue Card elements
- Golden Key/Codebreaker elements
- Business search elements

**Level 4 (Create):**
- Design pipeline elements
- Content creation elements
- Brand package elements
- Lark bounty elements

**Level 5 (Scout):**
- Bounty Photography elements
- In-person scouting elements
- Local business mapping

**Level 6 (Pitch):**
- Red Carpet elements
- Business pitch elements

**Level 7 (Launch):**
- Storefront elements
- Project launch elements
- Cold Start step 1-3

**Level 8 (Captain):**
- Crew management elements
- Oar Slots
- Captain dashboard elements

**Level 9-10:**
- Unlikely to appear in glossary (these are operational, not UI)

Go through EVERY entry in the glossary and add the appropriate level. If unsure, default to level 1.

### Display in X-Ray Overlay

**Modify:** `platform/src/components/builder/XRayOverlay.tsx`

When rendering the info panel for an annotated element, if the glossary entry has `elbowGreaseLevel`, render the `ElbowGreaseBadge` component:

```tsx
import { ElbowGreaseBadge } from '@/components/effort/ElbowGreaseBadge';

// In the info panel:
{entry.elbowGreaseLevel && (
  <div className="mt-2 flex items-center gap-2">
    <ElbowGreaseBadge level={entry.elbowGreaseLevel} size="sm" showLabel />
  </div>
)}
```

---

## VERIFICATION

1. **Mobile NotesOverlay:** On a 375px viewport, press N → overlay appears as bottom sheet, full width, max 50vh
2. **Mobile Codebreaker:** Click Golden Key on mobile → gold-themed bottom sheet
3. **Mobile Landing:** CrossPortalNav shows icon-only mode on mobile `/`
4. **Mobile Tutorial:** Tutorial does NOT appear on mobile landing page
5. **Desktop:** All existing behavior unchanged (draggable notes, full CrossPortalNav, tutorial on landing)
6. **Elbow Grease in X-Ray:** Toggle X-Ray → click any element → info panel shows Elbow Grease badge with correct level
7. **Badge click:** Click the badge → flips to show process + earnings

---

## DEPLOY

```powershell
cd platform; npm run build; firebase deploy --only hosting -P default
```

---

*Knight Session 203 — Bishop B053*
*Mobile works. Effort shows. No more off-screen panels.*
*FOR THE KEEP!*
