# KNIGHT SESSION 200 — Elbow Grease Badge + Printable Cue Cards + Golden Key Overlay
## Priority: HIGH — Bridges earning, outreach, and discovery into unified system
## Bishop B052
## Depends on: K197 (Trail Map), K198 (Tour Packages), K199 (Prize Panel)
## Innovations: #2123 (Crown Jewel), #2124, #2125

---

## CONTEXT

Three features that complete the member experience loop:

1. **Elbow Grease Badge** — Every activity shows its effort level (1-10) and reward. Click to flip and see process + earnings comparison.
2. **Printable Cue Cards** — Members print business cards with QR codes to hand to businesses they want to recruit. Scan → Red Carpet.
3. **Golden Key Codebreaker Overlay** — Clicking a Golden Key in content opens the Notes Overlay in Codebreaker mode. Type answer → earn Marks.

---

## TASK 1: Elbow Grease Badge Component

**New file:** `platform/src/components/effort/ElbowGreaseBadge.tsx`

### Props
```typescript
interface ElbowGreaseBadgeProps {
  level: number;           // 1-10
  size?: 'sm' | 'md' | 'lg';  // 16px, 32px, 64px
  showLabel?: boolean;     // show "Level X" text
  soloEarning?: string;    // for flip side
  crewEarning?: string;    // for flip side
  processSteps?: string[]; // for flip side
}
```

### Effort Scale Data

**New file:** `platform/src/data/elbowGreaseScale.ts`

```typescript
export const ELBOW_GREASE_LEVELS = [
  { level: 1, name: 'Browse', description: 'Read articles, explore pages, take tours', marksRange: '1-10', color: '#86efac' },
  { level: 2, name: 'Engage', description: 'Give feedback, hit 100 Marks, drop beacons', marksRange: '10-25', color: '#6ee7b7' },
  { level: 3, name: 'Research', description: 'Find businesses online, send Cue Cards, Codebreakers', marksRange: '25-50', color: '#fbbf24' },
  { level: 4, name: 'Create', description: 'Design icons, write content, build Brand packages', marksRange: '50-100', color: '#f59e0b' },
  { level: 5, name: 'Scout', description: 'Bounty Photography in person, Pearl Diver deal logging', marksRange: '100-200', color: '#f97316' },
  { level: 6, name: 'Pitch', description: 'Walk into business with Red Carpet card, make the pitch', marksRange: '200-350', color: '#ef4444' },
  { level: 7, name: 'Launch', description: 'Start project, set up storefront, accept payments', marksRange: '350-500', color: '#dc2626' },
  { level: 8, name: 'Captain', description: 'Build crew (Oar Slots), manage Node', marksRange: '500-750', color: '#a855f7' },
  { level: 9, name: 'Forge', description: 'Cold Start initiative — 10 businesses, crew, revenue', marksRange: '750-1000', color: '#7c3aed' },
  { level: 10, name: 'Founder', description: 'Multiple Nodes, train Captains, expand cities', marksRange: '1000+', color: '#4f46e5' },
];
```

### Badge Behavior
- **Default state:** Oil can icon + level number. Tooltip on hover: level name + description.
- **On click:** Card flips (CSS 3D transform, `perspective` + `rotateY`):
  - **Front**: Oil can + "Elbow Grease Level {X}: {Name}" + Marks range
  - **Back**: Process steps (numbered list) + solo vs. crew earning comparison (if provided)
- **Click again** or **click outside**: Flips back.

### Icon
Use a placeholder SVG oil can until the Lark bounty is fulfilled (`LARK_ELBOW_GREASE_OIL_CAN_ICON_B052.md`). The Lark is OPEN — any member can design the icon for 50 Marks.

Placeholder SVG should be a simple oil can silhouette in the level's color.

### X-Ray Integration
In `XRayOverlay.tsx`, add the `ElbowGreaseBadge` to each annotated element's info panel. Pull the effort level from `xrayGlossary.ts` (add `elbowGreaseLevel: number` to each glossary entry).

---

## TASK 2: Printable Cue Card Generator

**Modify:** `platform/src/pages/tools/CueCardGenerator.tsx`

### New Feature: "Print as Business Card"

Add a button below the existing Cue Card preview: **"🖨️ Print as Business Card"**

When clicked:
1. Generates a 3.5" × 2" business-card layout
2. Contains:
   - Member's Brand/logo (from Design Crew) OR default LB logo
   - Target business name (from Cue Card form)
   - QR code encoding: `https://lianabanyan.com/red-carpet?for={business-slug}&from={member-slug}`
   - Tagline: "Help Each Other Help Ourselves."
   - Small text: "Scan to learn how [Business Name] can earn more with the cooperative."
   - Member name + optional phone/email
3. Opens browser print dialog with card-sized layout
4. Also offers "Download as PDF" using existing html2canvas/jsPDF

### QR Code Library
Use `qrcode.react` (or `qrcode`) — check if already in dependencies. If not, add it.

```bash
npm install qrcode.react
```

### Card Layout Component

**New file:** `platform/src/components/cue-cards/PrintableCueCard.tsx`

```tsx
interface PrintableCueCardProps {
  businessName: string;
  businessSlug: string;
  memberName: string;
  memberSlug: string;
  memberBrandUrl?: string;  // logo from Design Crew
  memberContact?: string;   // optional phone/email
}
```

Renders a 3.5" × 2" div with:
- Top: Logo (member Brand or LB default)
- Middle: Business name + QR code side by side
- Bottom: Tagline + member info
- Print-optimized CSS: `@media print { ... }`

---

## TASK 3: Golden Key Codebreaker Overlay Mode

### Concept
When a user clicks a Golden Key icon embedded in content, instead of navigating to `/golden-keys`, it opens the **Notes Overlay** in a special "Codebreaker" mode — gold-themed instead of amber-themed.

### Changes to NotesOverlay

**Modify:** `platform/src/components/tour/NotesOverlay.tsx`

Add a `mode` prop:
```typescript
interface NotesOverlayProps {
  // existing props...
  mode?: 'notes' | 'codebreaker';
  keyHint?: string;        // hint text for codebreaker mode
  keyId?: string;          // treasure_keys.id for validation
}
```

**Codebreaker mode differences:**
- Title bar: Gold background (`bg-amber-500/20`) instead of cyan, shows "🔑 Codebreaker" instead of "Notes:"
- Textarea placeholder: "Type the key word..." instead of "Write your feedback..."
- Submit button: "Unlock 🔑" instead of "Ok"
- On submit: validate answer against `treasure_keys` table via `key_submissions` insert
  - Correct: Show "🎉 KEY FOUND! +{feathers} Feathers" with confetti animation
  - Incorrect: Show hint text + "Try again"
- Color scheme: Gold/amber instead of cyan/teal

### Changes to NotesOverlayContext

**Modify:** `platform/src/contexts/NotesOverlayContext.tsx`

Add `openCodebreaker` function:
```typescript
interface NotesOverlayState {
  openNotes: (slug: string, title: string, detailLevel?: string) => void;
  openCodebreaker: (keyId: string, hint: string, documentTitle: string) => void;
}
```

### Changes to TreasureKeyMarker

**Modify:** `platform/src/lib/treasureKeyEmbed.ts`

The `TreasureKeyMarker` component currently renders as a hidden/styled element. Add an onClick handler:

```tsx
const { openCodebreaker } = useNotesOverlay();

const handleClick = () => {
  openCodebreaker(config.keyId, config.hint, config.documentName);
};
```

This means clicking any Golden Key in any content → overlay opens → type answer → earn.

### Global N Key Update

Update the N key handler in `NotesOverlayContext.tsx`:
- N → opens Notes mode (already done in B052)
- When a key is focused/hovered and N is pressed → opens Codebreaker mode
- This is a nice-to-have; primary trigger is clicking the key icon

---

## TASK 4: Migration

```sql
-- K200: Elbow Grease + Printable Cue Cards + Golden Key overlay
-- No new tables needed — uses existing:
-- - xray_daily_stats (for X-Ray badge rendering)
-- - treasure_keys, key_submissions (for Codebreaker)
-- - cue_card_share_clicks (for print tracking)
-- - user_preferences (for trail marker, already exists)

-- Add elbow_grease_level to innovation_log for categorization
ALTER TABLE innovation_log ADD COLUMN IF NOT EXISTS elbow_grease_level INTEGER DEFAULT 1;

-- Update platform_canonical
UPDATE platform_canonical SET value = 2124, updated_at = now()
WHERE key = 'innovation_count' AND value::int < 2124;

UPDATE platform_canonical SET value = 167, updated_at = now()
WHERE key = 'crown_jewel_count';

UPDATE platform_canonical SET value = 2097, updated_at = now()
WHERE key = 'formal_claims_count';

-- Log innovations
INSERT INTO innovation_log (innovation_number, title, description, category, status, is_crown_jewel)
VALUES
(2123, 'Elbow Grease Visual Effort Scale', 'Ten-level effort classification with flippable badge showing process and cooperative earnings comparison, integrated with X-Ray Goggles.', 'user_experience', 'implemented', true),
(2124, 'Printable Cue Card Business Cards', 'Member-generated print-ready business cards with Red Carpet QR codes for business recruitment.', 'outreach', 'implemented', false),
(2125, 'Golden Key Codebreaker Overlay Mode', 'Notes Overlay Codebreaker mode triggered by clicking Golden Key icons in content, with answer validation and Marks earning.', 'engagement', 'implemented', false)
ON CONFLICT (innovation_number) DO NOTHING;
```

---

## VERIFICATION

1. **Elbow Grease Badge**: Render at sm/md/lg sizes. Click to flip. Shows level name + Marks range on front, process + earnings on back.
2. **X-Ray Integration**: Each glossary entry shows its Elbow Grease badge in the info panel.
3. **Printable Cue Card**: Fill in business name → click Print → browser shows 3.5×2" card with QR code → QR encodes correct Red Carpet URL.
4. **Download PDF**: Same card downloads as PDF.
5. **Golden Key Click**: Click any TreasureKeyMarker in content → Codebreaker overlay opens (gold theme) → type answer → correct = feathers earned → incorrect = hint shown.
6. **N key**: Still opens regular Notes overlay. Golden Key click opens Codebreaker mode specifically.

---

## DEPLOY

```powershell
cd platform; npm run build; firebase deploy --only hosting -P default
```

---

*Knight Session 200 — Bishop B052*
*Oil can. Business card. Golden Key.*
*Effort has a scale. Outreach has a card. Discovery has a reward.*
*FOR THE KEEP!*
