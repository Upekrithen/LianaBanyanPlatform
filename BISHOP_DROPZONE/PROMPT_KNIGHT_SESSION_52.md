# Knight Session 52 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: Latest from Session 51
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles THREE tasks. Priority order: A → B → C.

---

## TASK A: Edge Functions Phase 3 — Admin Notifications + Email Service

### Context

Three Edge Function TODOs have been pending since early sessions:
1. **Admin notification system** — Notify admins when key events occur (new user signup, dispute filed, production campaign completed, etc.)
2. **Email service** — Transactional emails for key user actions (welcome email, bounty completion, gift delivery confirmation)
3. **Twitter/X image uploads** — Social media posting with images (MoneyPenny auto-post needs this)

### Steps:

1. **Admin Notifications Edge Function** (`supabase/functions/admin-notify/`):
   - Create edge function that accepts event type + payload
   - Event types: `new_user`, `dispute_filed`, `campaign_complete`, `rls_violation`, `founder_override`
   - Sends notification to admin email (from `user_roles` where role = 'admin')
   - Uses Supabase's built-in email or a simple webhook
   - Add database trigger on relevant tables to call the function

2. **Email Service Edge Function** (`supabase/functions/send-email/`):
   - Template-based transactional emails
   - Templates: `welcome`, `bounty_complete`, `gift_delivered`, `stamp_verified`, `crew_accepted`
   - Uses Supabase's Resend integration or similar
   - Rate limiting: max 10 emails per user per hour

3. **Social Media Image Upload** (`supabase/functions/social-image-upload/`):
   - Accept image URL + caption + platform target
   - Upload image to Supabase Storage bucket `social-media-assets`
   - Return public URL for use in social API calls
   - Wire into existing MoneyPenny auto-post flow

### Verification:
- Each edge function deploys without errors
- Test invocation returns expected response
- Admin notification fires on test event

---

## TASK B: Proteus Anchor System

### Context

Innovation #1553 — the Proteus Anchor System. HexIsle is the inaugural Proteus. The concept: a "Proteus" is a product/system that can transform and adapt. The Anchor ties it to the cooperative's manufacturing backbone.

### Steps:

1. **Check** if any Proteus-related code already exists (search for "proteus" in the codebase)
2. **Create migration** `proteus_anchors` table:
   - `id`, `name`, `description`, `product_type`, `manufacturing_process`, `tereno_tier`, `anchor_status` (draft/active/legacy), `hexisle_compatible` boolean, `created_by`, timestamps
   - RLS: authenticated read, admin write
   - Seed with HexIsle as the first Proteus anchor

3. **Create service layer** `src/lib/proteusAnchorService.ts`:
   - Types, sample data, fetchAnchors, fetchAnchorById
   - Write operations: createAnchor, updateAnchorStatus

4. **Create page** `src/pages/ProteusAnchor.tsx`:
   - Display active Proteus anchors with manufacturing compatibility matrix
   - Show Tereno certification tier for each anchor
   - Link to HexIsle dashboard for the inaugural Proteus
   - Admin section for creating new anchors

5. **Wire route** `/proteus-anchor` in App.tsx and add to sidebar navigation

### Verification:
- Page loads at `/proteus-anchor`
- HexIsle shows as the first Proteus anchor
- TypeScript compiles with zero errors

---

## TASK C: Cephas Hugo Build + Deploy

### Context

Bishop just added 97 new letter files to `Cephas/cephas-hugo/content/letters/`. These need to be built and deployed.

### Steps:

1. **Navigate to** `Cephas/cephas-hugo/`
2. **Run Hugo build**: `hugo --minify` (or check if there's a build script in package.json)
3. **Deploy to Firebase**: `firebase deploy --only hosting:cephas` (check `firebase.json` for the correct target name)
4. **Verify**: Visit cephas-lianabanyan.web.app and confirm letters are browsable

If Hugo is not installed, install it first (`choco install hugo-extended` or download from gohugo.io).

### Verification:
- Hugo build succeeds with no errors
- `firebase deploy` completes
- Letters visible on cephas-lianabanyan.web.app/letters/

---

## Deploy

After all three tasks:
1. `git push origin main`
2. Deploy both targets: `firebase deploy`
3. Update `MILESTONE_HANDOFF_MARCH_2026.md` with session summary

**FOR THE KEEP!**
