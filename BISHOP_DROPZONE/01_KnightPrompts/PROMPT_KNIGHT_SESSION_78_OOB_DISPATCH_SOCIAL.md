# KNIGHT SESSION 78 — OOB Auto-Post + Dispatch Cron + Secrets Deployment

## Bishop: 023 | Innovation Count: 1,935 | Priority: PHASE 1 (Wire the Gaps)

---

> **GOAL**: Make Out of Bounds actually post to external platforms. Enable automated scheduled posting. Deploy secrets.
> 
> **CRITICAL UPDATE (Bishop 023 audit):** The social infrastructure is 90% built. SocialAccountsPage.tsx EXISTS. social-post edge function EXISTS (7 platforms). process-scheduled-posts EXISTS. moneypenny-auto-post EXISTS. socialOAuth.ts EXISTS. This session is WIRING ONLY — no new pages, no new functions from scratch.

---

## WHAT ALREADY EXISTS (DO NOT REBUILD)

| Component | File | Status |
|-----------|------|--------|
| Social Accounts Page | `src/pages/SocialAccountsPage.tsx` | BUILT — connect/disconnect, 7 platforms |
| Social Post Function | `supabase/functions/social-post/index.ts` | BUILT — Twitter, LinkedIn, Facebook, Bluesky, TikTok, Instagram, Threads |
| Scheduled Post Processor | `supabase/functions/process-scheduled-posts/index.ts` | BUILT — dual-table, 3-retry logic |
| MoneyPenny Auto-Post | `supabase/functions/moneypenny-auto-post/index.ts` | BUILT |
| Social OAuth Library | `src/lib/socialOAuth.ts` | BUILT — OAuth config for 8 platforms |
| Social Media Service | `src/lib/socialMediaService.ts` | BUILT — interactions, stats, digest |
| member_social_accounts table | Migration 20260213+ | LIVE — multi-account, RLS, triggers |
| member_scheduled_posts table | Migration 20260220+ | LIVE — full schema |

---

## TASK 1: Wire OOB "Post Now" to Existing social-post Function

### Current State
- `OutOfBoundsPage.tsx` (470 lines) has compose UI, plug management, draft saving
- Posts save to `oob_posts` with `target_plugs[]` (array of plug UUIDs)
- Currently: "Copy to Clipboard" + manual "Mark Posted" — NO auto-post
- `social-post` function already handles Twitter/LinkedIn/Facebook/Bluesky/TikTok/Instagram/Threads

### What to Build

Add a **"Post Now"** button next to "Copy to Clipboard" in `OutOfBoundsPage.tsx`:

1. Read the post's `target_plugs[]` → fetch matching `oob_plugs` records
2. For each plug, map platform to posting method:

**Platforms already in social-post (just call it):**
- Twitter, LinkedIn, Facebook, Bluesky, Threads, Instagram, TikTok
- Call: `supabase.functions.invoke('social-post', { body: { platform, text: title + "\n\n" + body } })`
- The function reads tokens from `member_social_accounts` automatically

**Add Reddit to social-post/index.ts:**
```typescript
case 'reddit':
  // POST https://oauth.reddit.com/api/submit
  // Headers: Authorization: bearer {access_token}, User-Agent: LianaBanyan/1.0
  // Body: { kind: "self", sr: metadata.subreddit || "cooperative", title, text: body }
```

**Add Discord to social-post/index.ts:**
```typescript
case 'discord':
  // Discord uses webhook URLs, not OAuth
  // POST {account.access_token} (which stores the webhook URL)
  // Body: { content: text.slice(0, 2000), username: "Liana Banyan" }
```

**Substack — NO API. Keep as clipboard-only:**
- Show toast: "Substack copied to clipboard — paste manually"

3. After attempts, update `oob_posts`:
```sql
UPDATE oob_posts SET status = 'posted',
  post_results = '{"twitter": {"success": true}, "discord": {"success": true}}'
WHERE id = post_id;
```

4. Show results toast per platform.

### Key Files to Modify
- `src/pages/OutOfBoundsPage.tsx` — Add "Post Now" button + dispatch logic
- `supabase/functions/social-post/index.ts` — Add Reddit + Discord cases (append to existing switch)

---

## TASK 2: Enable pg_cron for Scheduled Posts + MoneyPenny

### Current State
- Both functions EXIST and are PRODUCTION-READY
- Neither has a cron trigger — they never run automatically

### What to Build

**Migration: `20260323000014_enable_cron_jobs.sql`**

```sql
-- Enable pg_cron + pg_net if not already
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Process scheduled social media posts every 5 minutes
SELECT cron.schedule(
  'process-scheduled-posts',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/process-scheduled-posts',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- MoneyPenny auto-post approved drafts every 5 minutes (offset)
SELECT cron.schedule(
  'moneypenny-auto-post',
  '2-57/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/moneypenny-auto-post',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

**ALTERNATIVE** if pg_cron/pg_net aren't available: Set up cron jobs via Supabase Dashboard → Database → Cron Jobs.

---

## TASK 3: Deploy Supabase Secrets

The Founder has connected all social media accounts and has the Anthropic API key. Secrets need to be deployed to Supabase edge functions.

Read token values from `Asteroid-ProofVault/LockBox/DOUBLESECRET.env` and set them:

```bash
# From DOUBLESECRET.env — social platform tokens
npx supabase secrets set TWITTER_API_KEY="[from DOUBLESECRET]" --project-ref ruuxzilgmuwddcofqecc
npx supabase secrets set TWITTER_API_SECRET="[from DOUBLESECRET]" --project-ref ruuxzilgmuwddcofqecc
npx supabase secrets set TWITTER_ACCESS_TOKEN="[from DOUBLESECRET]" --project-ref ruuxzilgmuwddcofqecc
npx supabase secrets set TWITTER_ACCESS_SECRET="[from DOUBLESECRET]" --project-ref ruuxzilgmuwddcofqecc

# Anthropic key — used by moneypenny-sms and star-chamber-analyze
# Codebase already uses: Deno.env.get("ANTHROPIC_API_KEY")
npx supabase secrets set ANTHROPIC_API_KEY="[from DOUBLESECRET or Founder]" --project-ref ruuxzilgmuwddcofqecc

# Other social tokens as available in DOUBLESECRET.env
# TikTok, Resend, Pinata, etc.
```

**NOTE**: Knight should read DOUBLESECRET.env, extract the values, and run the `npx supabase secrets set` commands. Do NOT commit secrets to any file in the repo.

---

## DEPLOYMENT CHECKLIST

```bash
# 1. Build
npm run build

# 2. Deploy updated social-post function (Reddit + Discord added)
npx supabase functions deploy social-post --linked

# 3. Push cron migration
npx supabase db push --linked

# 4. Deploy secrets (Task 3)

# 5. Deploy to Firebase
firebase deploy --only hosting:production

# 6. Test
# - Create an OOB post targeting Discord (webhook URL in plug config)
# - Click "Post Now" → verify message appears in Discord channel
# - Check Supabase Dashboard → Cron Jobs → confirm both jobs listed
```

---

## INNOVATION COUNT
Unchanged: **1,935**

## FOR THE KEEP
