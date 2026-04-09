# Knight Session 39 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: TBD (Knight 38 latest)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Priority: Task A first, then Task B.

---

## TASK A: Daily News Supabase Wiring

### Context

Bishop built `src/pages/DailyNews.tsx` with sample slide data (a carousel-style news page for the cooperative). It needs real Supabase tables, seed data, and live wiring.

### Steps:

1. **Create migration** for `daily_news_slides` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `slide_type` (text, NOT NULL, CHECK in ('FEATURED_PRODUCT', 'NEW_MEMBER', 'MILESTONE', 'SHOWCASE_PROMOTION', 'ANNOUNCEMENT', 'BREAKING_NEWS'))
   - `title` (text, NOT NULL)
   - `subtitle` (text)
   - `description` (text)
   - `store_name` (text, nullable)
   - `product_name` (text, nullable)
   - `price` (numeric, nullable)
   - `currency_type` (text, default 'credit')
   - `cta_text` (text, nullable)
   - `cta_url` (text, nullable)
   - `badge_text` (text, nullable)
   - `is_active` (boolean, default true)
   - `display_date` (date, NOT NULL)
   - `sort_order` (integer, default 0)
   - `created_at` (timestamptz, default now())

2. **Create migration** for `showcase_promotions` table (paid feature slots):
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL)
   - `storefront_id` (uuid, FK to storefronts, nullable)
   - `slide_id` (uuid, FK to daily_news_slides, nullable)
   - `credits_paid` (numeric, NOT NULL)
   - `promotion_date` (date, NOT NULL)
   - `status` (text, NOT NULL, CHECK in ('pending', 'approved', 'active', 'expired'))
   - `created_at` (timestamptz, default now())

3. **RLS policies**:
   - `daily_news_slides`: All authenticated users can SELECT. Only admin (service role or designated admin check) can INSERT/UPDATE/DELETE.
   - `showcase_promotions`: Users can SELECT/INSERT/UPDATE/DELETE their own rows (`auth.uid() = user_id`). Admin can SELECT all.

4. **Seed data**: Extract the 8 sample slides from `DailyNews.tsx` and insert them as seed data in the migration.

5. **Wire DailyNews.tsx**: Replace inline `SAMPLE_SLIDES` (or equivalent) with a Supabase query. Keep sample data as fallback if the query returns empty or errors — same pattern as `DemandSignaling.tsx`.

---

## TASK B: Send Lists Supabase Wiring

### Context

Bishop built `src/pages/SendLists.tsx` with sample data. Send Lists is the system for managing outbound communications — cue cards, crown letters, event invitations, and announcements. It uses a Two-Stamp approval flow (stamp_1 → review → stamp_2 → send) with full audit trail. Wire it to Supabase.

### Steps:

1. **Create migration** for `send_lists` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL)
   - `name` (text, NOT NULL)
   - `list_type` (text, NOT NULL, CHECK in ('cue_card', 'crown_letter', 'event_invitation', 'announcement'))
   - `description` (text)
   - `status` (text, NOT NULL, CHECK in ('draft', 'stamp_1', 'review', 'stamp_2', 'sending', 'sent'), default 'draft')
   - `stamp_1_at` (timestamptz, nullable)
   - `stamp_2_at` (timestamptz, nullable)
   - `sent_at` (timestamptz, nullable)
   - `created_at` (timestamptz, default now())

2. **Create migration** for `send_list_recipients` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `send_list_id` (uuid, FK to send_lists, NOT NULL, ON DELETE CASCADE)
   - `recipient_name` (text, NOT NULL)
   - `delivery_method` (text, NOT NULL, CHECK in ('email', 'sms', 'in_platform'))
   - `delivery_address` (text)
   - `card_type` (text)
   - `status` (text, NOT NULL, CHECK in ('pending', 'sent', 'delivered', 'opened', 'failed'), default 'pending')
   - `sent_at` (timestamptz, nullable)

3. **Create migration** for `send_list_audit` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `send_list_id` (uuid, FK to send_lists, ON DELETE CASCADE)
   - `action` (text, NOT NULL) — values: 'stamp_1', 'stamp_2', 'send', 'cancel'
   - `performed_by` (uuid, FK to auth.users)
   - `performed_at` (timestamptz, default now())
   - `details` (jsonb)

4. **RLS policies**:
   - `send_lists`: Users can SELECT/INSERT/UPDATE/DELETE only their own rows (`auth.uid() = user_id`).
   - `send_list_recipients`: Users can SELECT/INSERT/UPDATE/DELETE where the parent `send_list_id` belongs to them (join to `send_lists` on `user_id = auth.uid()`).
   - `send_list_audit`: INSERT only for the list owner (join check). SELECT only for the list owner. No UPDATE or DELETE (append-only audit log).

5. **Wire SendLists.tsx**: Replace inline sample data with Supabase queries. Keep sample data as fallback — same pattern used across the codebase.

---

## Migration Numbering

Continue sequentially from Knight 38's latest migration number. Check `supabase/migrations/` for the current highest number before creating new files.

## Standard Instructions

- **Build check**: `npm run build` before committing
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md`
- **Commits**: Separate commits for Task A and Task B
- **Deploy**: Deploy to Firebase when both tasks complete
- **Patterns**: Follow existing codebase patterns — check `DemandSignaling.tsx` for the Supabase-with-fallback pattern

## Priority

**Task A first** (Daily News wiring), **then Task B** (Send Lists wiring).

---

**FOR THE KEEP!**
