# Knight Session 40 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: TBD (Knight 39 latest)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Priority: Task A first, then Task B.

---

## TASK A: Store Templates System

### Context

Members who open storefronts in Main Square need a way to choose a visual layout. This feature builds a template gallery where cooperative members pick a pre-built store theme. The `template_id` column already exists on the `storefronts` table (added in Session 38) — this task creates the templates themselves and the selection UI.

### What to build:

1. **Create migration** for `store_templates` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `name` (text, NOT NULL)
   - `description` (text)
   - `theme_key` (text, NOT NULL, UNIQUE) — one of: 'artisan', 'market_stand', 'workshop', 'boutique', 'digital_den', 'kitchen_table'
   - `primary_color` (text)
   - `secondary_color` (text)
   - `accent_color` (text)
   - `font_family` (text)
   - `layout_type` (text, CHECK in ('grid', 'list', 'featured'))
   - `is_active` (boolean, default true)
   - `created_at` (timestamptz, default now())

2. **Seed all 6 templates** in the migration:

   | theme_key | name | primary | secondary | accent | font | layout |
   |---|---|---|---|---|---|---|
   | artisan | The Artisan | #8B4513 | #DEB887 | #D2691E | Georgia, serif | featured |
   | market_stand | The Market Stand | #2E7D32 | #E8F5E9 | #4CAF50 | Inter, sans-serif | grid |
   | workshop | The Workshop | #37474F | #263238 | #FF6F00 | Roboto Mono, monospace | grid |
   | boutique | The Boutique | #F8F0E3 | #FFFFFF | #C9A96E | Playfair Display, serif | featured |
   | digital_den | The Digital Den | #1A1A2E | #16213E | #0F3460 | Source Code Pro, monospace | list |
   | kitchen_table | The Kitchen Table | #FFF8E1 | #FFECB3 | #FF8F00 | Nunito, sans-serif | grid |

   Include descriptions:
   - The Artisan: "Warm earth tones with a craft-focused layout. Prominent product photos, handmade feel."
   - The Market Stand: "Clean and minimal with a farm-market feel. Green accents, fresh and inviting."
   - The Workshop: "Industrial maker aesthetic. Dark theme, tool-forward, built for builders."
   - The Boutique: "Elegant and refined. Light theme with serif fonts, perfect for fashion and lifestyle."
   - The Digital Den: "Tech-forward with gradient backgrounds. Code-inspired, built for digital creators."
   - The Kitchen Table: "Homey and warm. Food and recipe focus, yellows and oranges, feels like home."

3. **RLS policies**:
   - `store_templates`: All authenticated users can SELECT. Only admin can INSERT/UPDATE/DELETE.

4. **Create `src/pages/StoreTemplates.tsx`** at route `/store-templates`:
   - Gallery layout showing all 6 templates as preview cards
   - Each card displays: template name, description, color palette swatches (3 circles showing primary/secondary/accent), layout type badge, "Use This Template" button
   - Click a card to open a **template preview modal** — show a mockup of what the storefront would look like using that theme's colors, fonts, and layout
   - "Use This Template" saves the selected `template_id` to the user's storefront record via Supabase update
   - Show currently selected template with a checkmark/highlight
   - Fetch templates from Supabase with hardcoded fallback

5. **Add route** to `App.tsx`: `/store-templates` → `StoreTemplates`
6. **Add sidebar navigation** entry under the Main Square / Commerce section

---

## TASK B: Showcase Promotion Payment Flow

### Context

Members can purchase featured slots on The Daily News carousel to promote their stores. The `showcase_promotions` table was created in Session 39. This task builds the purchase UI.

### What to build:

1. **Create `src/pages/ShowcasePromotion.tsx`** at route `/showcase-promotion`:

   **Header section:**
   - Title: "Showcase Your Store on The Daily News"
   - Subtitle explaining the feature: "Get your store and products featured in the cooperative's daily news carousel. Seen by every member who visits."

   **Pricing tiers** (display using CurrencyAmount component if it exists, otherwise format with the Anvil symbol):
   - **Standard Slot** (1 day): 10 Credits — "One day in the spotlight"
   - **Featured Slot** (3 days): 25 Credits — "Three days of featured placement"
   - **Premium Slot** (7 days): 50 Credits — "A full week of premium visibility"
   - Each tier as a card with: tier name, duration, price, description, "Select" button
   - Selected tier highlighted

   **Configuration section** (appears after tier selection):
   - Date picker to choose promotion start date (minimum: tomorrow)
   - For multi-day tiers, show the full date range
   - Auto-populated preview of what their Daily News slide will look like:
     - Uses their store name, store description, and a featured product if available
     - Rendered in the same card style as `DailyNews.tsx` slides
   - Optional custom headline override (text input)

   **Confirmation section:**
   - Order summary: tier selected, date range, total cost
   - "As You Wish" button to confirm purchase (the canonical transaction confirmation phrase)
   - On confirmation: INSERT into `showcase_promotions` with status 'pending'
   - Show confirmation receipt: "Your showcase promotion has been submitted for review. You'll be notified when it goes live."

2. **Wire to Supabase**: INSERT into `showcase_promotions` table. SELECT user's existing promotions to show history/status at the bottom of the page.

3. **Add route** to `App.tsx`: `/showcase-promotion` → `ShowcasePromotion`
4. **Add sidebar navigation** entry near Daily News or Commerce section

---

## Migration Numbering

Continue sequentially from Knight 39's latest migration number. Check `supabase/migrations/` for the current highest number before creating new files.

## Standard Instructions

- **Build check**: `npm run build` before committing
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md`
- **Commits**: Separate commits for Task A and Task B
- **Deploy**: Deploy to Firebase when both tasks complete
- **Patterns**: Follow existing codebase patterns. Check `MainSquare.tsx`, `DailyNews.tsx`, and `DemandSignaling.tsx` for reference implementations.

## Priority

**Task A first** (Store Templates), **then Task B** (Showcase Promotion).

---

**FOR THE KEEP!**
