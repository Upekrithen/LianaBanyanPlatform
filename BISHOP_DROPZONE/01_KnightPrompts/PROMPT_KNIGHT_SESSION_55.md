# Knight Session 55 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-19
**Base commit**: Latest from Session 50 (Bishop)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

**CRITICAL CONTEXT**: Bishop 014 (Session 50) delivered three features:
1. Maker Spotlight expanded to 47 makers (SAMPLE_SPOTLIGHTS in `makerSpotlightService.ts`)
2. Edge Functions Phase 3 — 3 new functions: `admin-notifications`, `send-transactional-email-v2`, `social-image-upload`
3. Proteus Anchor System — migration, service, page (`/proteus-anchor`), route wired

Do NOT rebuild these. This session wires and extends them.

---

## TASK A: Deploy MoneyPenny Edge Functions + Cron Wiring

### Context

`moneypenny-auto-post` and `moneypenny-intake` exist in `supabase/functions/` and are fully coded but have never been deployed or cron-wired. The MoneyPenny dashboard (`/moneypenny/qa` and `/moneypenny/social`) calls these functions. Wire them up.

### Steps:

1. **Deploy edge functions** to Supabase:
   ```bash
   supabase functions deploy moneypenny-auto-post
   supabase functions deploy moneypenny-intake
   supabase functions deploy moneypenny-daily-digest
   supabase functions deploy moneypenny-signal
   ```

2. **Set required secrets** (check with Founder first — do NOT commit secrets):
   - `TWITTER_BEARER_TOKEN`, `LINKEDIN_ACCESS_TOKEN`, `FACEBOOK_PAGE_TOKEN` — needed by auto-post
   - `GMAIL_PUBSUB_TOKEN` — needed by intake if using Gmail Pub/Sub mode

3. **Wire cron triggers** — Create migration `20260320000001_moneypenny_cron.sql`:
   ```sql
   -- Auto-post every 5 minutes (checks for approved drafts)
   SELECT cron.schedule('moneypenny-auto-post', '*/5 * * * *',
     $$SELECT net.http_post(
       url := current_setting('app.settings.supabase_url') || '/functions/v1/moneypenny-auto-post',
       headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
       body := '{}'::jsonb
     )$$
   );
   -- Daily digest at 7 AM UTC
   SELECT cron.schedule('moneypenny-daily-digest', '0 7 * * *',
     $$SELECT net.http_post(
       url := current_setting('app.settings.supabase_url') || '/functions/v1/moneypenny-daily-digest',
       headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
       body := '{}'::jsonb
     )$$
   );
   ```

4. **Wire MoneyPenny dashboard buttons** in `MoneyPennySocial.tsx`:
   - "Post Now" button → calls `moneypenny-auto-post` with specific `draftId`
   - "Refresh Inbox" button → calls `moneypenny-intake` manually
   - Show toast on success/error

5. **Verify**: Both functions respond to manual invocation, dashboard buttons work, cron schedules appear in `cron.job` table.

---

## TASK B: Deploy Bishop's New Edge Functions

### Context

Bishop 014 created three new edge functions in `supabase/functions/`:
- `admin-notifications/index.ts` — Alerts on new_user, dispute_filed, campaign_complete, rls_violation, founder_override
- `send-transactional-email-v2/index.ts` — Template-based emails (welcome, bounty_complete, gift_delivered, stamp_verified, crew_accepted)
- `social-image-upload/index.ts` — Upload images to Supabase Storage for social media posts

### Steps:

1. **Deploy all three**:
   ```bash
   supabase functions deploy admin-notifications
   supabase functions deploy send-transactional-email-v2
   supabase functions deploy social-image-upload
   ```

2. **Wire admin-notifications** into existing event handlers:
   - In `confirm-membership/index.ts`: After confirming, call `admin-notifications` with `event_type: 'new_user'`
   - In `process-vote-safe/index.ts`: On dispute, call with `event_type: 'dispute_filed'`

3. **Wire social-image-upload** into MoneyPenny Social:
   - Add "Attach Image" button to draft composer in `MoneyPennySocial.tsx`
   - Upload via `social-image-upload`, store returned URL in draft's `image_url` field
   - Pass image URL to `social-post` function when publishing

4. **Set required secrets**:
   - `ADMIN_NOTIFICATION_EMAIL` — Founder's notification email
   - `SENDGRID_API_KEY` or `RESEND_API_KEY` — for transactional emails (ask Founder which service)

### Verification:
- All 3 functions deploy without errors
- Admin notification fires on test membership confirmation
- Image upload returns a public URL

---

## TASK C: Proteus Anchor Supabase Wiring + Homepage Card

### Context

Bishop created the Proteus Anchor page at `/proteus-anchor` with sample data in `proteusAnchorService.ts`. This task wires it to Supabase and adds a homepage card.

### Steps:

1. **Push migration**: Bishop wrote `20260320000002_proteus_anchors.sql`. Apply it:
   ```bash
   supabase db push
   ```

2. **Wire service to Supabase**: In `proteusAnchorService.ts`, the fetch functions already have Supabase calls with sample fallback. Verify they work:
   - `fetchAnchors()` → returns from `proteus_anchors` table
   - `fetchAnchorById()` → single anchor lookup
   - `createAnchor()` → admin-only insert
   - `updateAnchorStatus()` → status transitions (draft → active → legacy)

3. **Add Proteus card to homepage** in the authenticated "Your Keep" view:
   - Add to the Quick Navigation grid alongside existing cards
   - Icon: Sparkles or Layers
   - Title: "Proteus Anchors"
   - Description: "Flagship products that anchor the cooperative's manufacturing backbone"
   - Link: `/proteus-anchor`

4. **Add to sidebar navigation**: Under the "Making" group, add "Proteus Anchors" with a link to `/proteus-anchor`

### Verification:
- `/proteus-anchor` page loads with HexIsle as first anchor
- Creating a new anchor (admin) persists to Supabase
- Homepage card links correctly
- Sidebar nav entry works

---

## Deploy

After all three tasks:
1. `git add -A && git commit -m "Session 55: MoneyPenny cron wiring, edge function deployment, Proteus homepage integration"`
2. `git push origin main`
3. `firebase deploy --only hosting:main`
4. Update `MILESTONE_HANDOFF_MARCH_2026.md` with session summary

**FOR THE KEEP!**
