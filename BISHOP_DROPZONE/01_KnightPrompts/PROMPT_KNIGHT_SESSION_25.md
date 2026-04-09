# KNIGHT SESSION 25 — Outbound Megaphone + Landing Page Restoration

## PRIORITY: Fix the megaphone first, then the front door.

**Context:** Bishop Session 12 continued. All anecdotes are written into articles. Golden keys are assigned and embedded. Comprehension quizzes written for Scott and Buffett letters. Dispatch queue seed SQL ready. This session wires it all together.

---

## BLOCK 1: OUTBOUND DISPATCH — SEED THE QUEUE (Priority: IMMEDIATE)

### Task 1.1: Run Dispatch Seed SQL
- File: `BISHOP_DROPZONE/DISPATCH_SEED_ALL_ARTICLES.sql`
- Run against `outbound_dispatch` table
- Verify: 18 new rows inserted (21 total with existing 3)
- Do NOT duplicate existing Dead Internet / Moo / CFA entries

### Task 1.2: Medium Publishing (Manual Path)
- Medium has removed self-service Integration Tokens from Settings > Security
- The `medium-publish` edge function still works IF Founder creates token
- **Fallback**: Founder publishes articles manually via Medium's Write button
- **Action**: Update `UniversalDispatch.tsx` to show "Copy to Clipboard" button for Medium channel when MEDIUM_INTEGRATION_TOKEN is not set
- When token IS set, existing dispatch-executor flow handles it automatically

### Task 1.3: Wire dispatch-executor to EXISTING Social Infrastructure

**CRITICAL CONTEXT: The social media infrastructure is ALREADY BUILT.** Do NOT rebuild it.

Existing edge functions (ALL DEPLOYED):
- `social-post/index.ts` — immediate posting to any platform
- `process-scheduled-posts/index.ts` — 5-min cron batch publisher
- `social-oauth-callback/index.ts` — OAuth flow handler
- `refresh-social-tokens/index.ts` — hourly token refresh

Existing client libraries:
- `src/lib/socialOAuth.ts` — multi-account OAuth (up to 6 per platform)
- `src/lib/socialPlugSystem.ts` — universal plug management
- `src/lib/tiktokOAuth.ts` — TikTok PKCE helper

DB tables (ALL MIGRATED):
- `member_social_accounts` — encrypted OAuth token storage
- `member_scheduled_posts` — scheduling queue
- `user_social_plugs` — plug preferences
- `social_shares` — analytics tracking
- `social_plug_features` — platform config

**Platforms ALREADY configured with OAuth:**
| Platform | OAuth | Client ID | Status |
|----------|-------|-----------|--------|
| Twitter/X | OAuth 2.0 PKCE | `ZGtXVFBWbkQwX2NDTkEzcFB0NHQ6MTpjaQ` | READY |
| LinkedIn | OAuth 2.0 | `86n87d8akglgc9` | READY |
| Facebook | OAuth 2.0 | `1943465610387846` (Meta App) | READY |
| Instagram | Meta OAuth | Same Meta App | READY (images required) |
| TikTok | OAuth 2.0 PKCE | `awno36mdbpmqnox5` | READY (video only) |
| Threads | Meta OAuth | Same Meta App | READY |
| Bluesky | AT Protocol | `lianabanyan.bsky.social` | READY |
| Imgur | OAuth 2.0 | Set but needs secret | PARTIAL |

**NEW platform to add:**
- `mastodon` (me.dm) — Mastodon API, token in DoubleSecret
  - API base: `https://me.dm/api/v1/statuses`
  - Auth: Bearer token from MASTODON_ACCESS_TOKEN
  - Set in Supabase: `npx supabase secrets set MASTODON_ACCESS_TOKEN=<token_from_DoubleSecret>`
  - Max 500 chars per status, thread via `in_reply_to_id`
  - Add to `social-post` edge function as new platform handler
  - Add to `social_plug_features` seed data
  - Add to `socialPlugSystem.ts` (already lists Mastodon in supported platforms)

**The actual task for Knight 25:**
1. Wire `dispatch-executor` to call `social-post` for cross-posting
   - When an article dispatch is stamped + fired, auto-create `member_scheduled_posts` entries for each platform in the `cross_post` array
   - `social-post` and `process-scheduled-posts` handle the actual posting
   - Do NOT duplicate posting logic — use the existing infrastructure
2. Add Mastodon (me.dm) support to `social-post` edge function
3. Add `cephas` channel to `dispatch-executor` (flag content in `cephas_content_registry`)
4. For channels without connected accounts: show "Copy to Clipboard" in UniversalDispatch.tsx
5. Pre-formatted text template (500-char version for Mastodon/Bluesky, full for others):
  ```
  {title}

  {first_paragraph_or_subtitle}

  Read more: {article_url}

  #lianabanyan {tags}
  ```

**SECURITY NOTE:** Client secrets (Twitter, LinkedIn, Facebook) are currently in `.env` file.
These MUST be moved to Supabase Edge Function secrets and removed from `.env`.
This is a pre-existing issue, not new — but fix it in this session.

### Task 1.4: Cue Card System Integration
- Each dispatched article should auto-generate a shareable Cue Card entry
- Wire to existing `hofund_cue_cards` table
- Cue Card format: article title, one-line hook, QR code to article URL, golden key hint
- Cue Cards appear in the $5/year deck

---

## BLOCK 2: GOLDEN KEY AUTO-EMBED ON DISPATCH (Priority: HIGH)

### Task 2.1: Update `treasureKeyEmbed.ts`
Add a new function: `registerDispatchKeys()`

```typescript
/**
 * When an article is dispatched, register its golden key in treasure_keys.
 * Pull key metadata from outbound_dispatch.metadata JSONB field.
 *
 * Fields from metadata:
 * - golden_key: string (e.g., "PERSIST")
 * - key_tier: "fledgling" | "flight" | "murder"
 * - key_method: "natural" | "acrostic" | "hidden_text" | "puzzle"
 * - feathers: number
 *
 * For comprehension_quiz type:
 * - golden_key_type: "comprehension_quiz"
 * - quiz_path: path to quiz file
 */
export async function registerDispatchKeys(dispatchId: string): Promise<void> {
  // 1. Read outbound_dispatch row
  // 2. Parse metadata JSONB
  // 3. If golden_key exists: INSERT into treasure_keys
  // 4. If golden_key_type === "comprehension_quiz": INSERT into paper_quizzes
  // 5. Mark dispatch as key_registered: true in metadata
}
```

### Task 2.2: Wire to dispatch-executor
- After successful dispatch, call `registerDispatchKeys()`
- This ensures keys are discoverable in GoldenKeyQuest only AFTER the article is live
- Prevents keys from appearing before their containing article is published

### Task 2.3: Quiz Registration for Scott/Buffett
- Quiz files: `BISHOP_DROPZONE/QUIZ_SCOTT_OPEN_LETTER.md` and `QUIZ_BUFFETT_OPEN_LETTER.md`
- Parse question pool from markdown into `paper_quiz_questions` table
- 8 questions per letter, present 5 random, 2 Marks per correct
- Self-attest path: 10 Marks for reading (honor system)
- Max 3 attempts, best score counts

---

## BLOCK 3: LANDING PAGE RESTORATION (Priority: MEDIUM)

### Founder Directive (Bishop recommendation, Founder approved):

> "Keep WelcomeGate as first-visit-only. After first visit, go straight to the original design.
> The HEOHO + Hero flip + Fable + keyhole should be what returning visitors see.
> Re-enable the Hero card flip. The flip IS the progressive disclosure."

### Task 3.1: WelcomeGate — First Visit Only, 30 Seconds
- Keep WelcomeGate for `lb_visit_count === 0` ONLY
- Simplify to Fable (Tab 1) as primary/only view — remove Tabs 2 and 3
- The Fable IS the orientation. 30 frames, subtitles, done.
- After Fable completes or user clicks Enter: dismiss gate permanently, navigate to `/`
- Set `lb_welcome_gate_dismissed = true` after first dismissal

### Task 3.2: Returning Visitors → Original Design
- When `lb_visit_count > 0` (returning unauthenticated visitor):
  - Skip WelcomeGate entirely
  - Skip PortalGatewayPage
  - Load Index.tsx PublicLandingView directly
  - HEOHO text visible, Hero card active, Fable accessible via Watch

### Task 3.3: Re-enable Hero Card Flip
- In Index.tsx, remove the "flip disabled in professional mode" guard
- The Hero card should flip when user clicks Watch
- Both Enter and Watch buttons remain visible after flip
- The Fable plays on the back of the Hero card (30 frames)

### Task 3.4: Restore Keyhole in O
- The keyhole SVG in the "O" of "Ourselves" should be visible and clickable
- Clicking it opens the DurinsDoor dialog (Hofund code entry)
- This is the progressive disclosure entry point — "if you know, you know"

### Task 3.5: Remove PortalGatewayPage for Unauthenticated
- PortalGateway's 4 doors (Earn/Build/Launch/Sponsor) should only appear for AUTHENTICATED users
- Unauthenticated users get the HEOHO landing → progressive disclosure → DurinsDoor path
- Authenticated users can still access Portal if they navigate there directly

---

## BLOCK 4: EMAIL DISPATCH (Priority: MEDIUM)

### Task 4.1: Outreach Email via dispatch-executor
- The `send-transactional-email` edge function already supports outreach type
- Wire `dispatch-executor` to fire outreach emails for `channel: "email"` dispatches
- Moo and CFA outreach emails are already in the queue as drafts
- When Founder stamps them, dispatch-executor sends via existing email infrastructure

### Task 4.2: Email Templates for Article Links
- When an article is published to Medium, auto-draft an email dispatch:
  - Subject: article title
  - Body: first paragraph + "Read more on Medium: {url}"
  - Recipient list: from outreach contacts or newsletter subscribers
  - Status: draft (requires Founder stamp before sending)

---

## DELIVERABLES CHECKLIST

- [ ] 18 new dispatch queue entries seeded
- [ ] UniversalDispatch.tsx: "Copy to Clipboard" fallback for channels without API tokens
- [ ] dispatch-executor: wire to existing social-post edge function for cross-posting
- [ ] social-post: add Mastodon (me.dm) as new platform handler
- [ ] social_plug_features: seed Mastodon platform config
- [ ] SECURITY: move client secrets from .env to Supabase Edge Function secrets
- [ ] dispatch-executor: cephas channel (flag in cephas_content_registry)
- [ ] treasureKeyEmbed.ts: registerDispatchKeys() function
- [ ] dispatch-executor: auto-register keys after successful dispatch
- [ ] Quiz questions for Scott letter seeded in paper_quiz_questions
- [ ] Quiz questions for Buffett letter seeded in paper_quiz_questions
- [ ] WelcomeGate: first-visit-only, Fable-only, 30-second experience
- [ ] Index.tsx: returning visitors see PublicLandingView directly
- [ ] Hero card flip re-enabled
- [ ] Keyhole in O restored and clickable
- [ ] PortalGatewayPage: authenticated-only
- [ ] Cue Card auto-generation on dispatch
- [ ] Email dispatch wiring for outreach channel

---

## FILES TO MODIFY

| File | Changes |
|------|---------|
| `src/components/WelcomeGate.tsx` | First-visit-only, remove Tabs 2-3, Fable-only |
| `src/pages/Index.tsx` | Re-enable Hero flip, restore keyhole, skip gate for returning |
| `src/pages/PortalGateway.tsx` | Authenticated-only guard |
| `src/components/UniversalDispatch.tsx` | Copy-to-clipboard fallback, cue card generation |
| `src/lib/treasureKeyEmbed.ts` | registerDispatchKeys() |
| `platform/supabase/functions/dispatch-executor/` | Wire to social-post for cross-posting, cephas channel |
| `platform/supabase/functions/social-post/` | Add Mastodon (me.dm) platform handler |
| `src/lib/paperQuiz.ts` | Load Scott/Buffett quiz data |
| `src/App.tsx` | Routing guard changes for PortalGateway |
| `platform/.env` | REMOVE client secrets (move to Supabase secrets) |

## NEW FILES

| File | Purpose |
|------|---------|
| `BISHOP_DROPZONE/DISPATCH_SEED_ALL_ARTICLES.sql` | Queue seed (READY — run this) |
| `BISHOP_DROPZONE/QUIZ_SCOTT_OPEN_LETTER.md` | Scott quiz questions (READY — parse and seed) |
| `BISHOP_DROPZONE/QUIZ_BUFFETT_OPEN_LETTER.md` | Buffett quiz questions (READY — parse and seed) |

---

## CRITICAL CONTEXT

### Updated Innovation Count: 1,662
### Updated Valuation: $630,000 (Cost + 20%)
### Patent Claims: 1,336 across 7 provisionals (update any old references)

### Anecdotes Now Embedded In:
| Anecdote | Article |
|----------|---------|
| Jeep of Theseus | Ludicrous Speed |
| No Brakes | Dead Internet Defense |
| How to Learn to Swim | Unlimited Throws + Boaz Principle (secondary) |
| Not Around: Through | Ambassador of the Quan |
| Rooster Tail | Ruprecht is the New Quan |
| Christmas Eve 1992 | Not Left or Right. Forward. + Canada 40K (secondary) |

### Golden Key Assignments:
| Article | Key | Tier | Method |
|---------|-----|------|--------|
| Scott Letter | QUIZ | — | Comprehension |
| Buffett Letter | QUIZ | — | Comprehension |
| Dead Internet | PROACTIVE | Flight | Acrostic |
| Unlimited Throws | PERSIST | Flight | Acrostic |
| Ambassador of Quan | TOGETHER | Flight | Acrostic |
| Ruprecht | EARNED | Flight | Acrostic |
| Not Left/Right | FORWARD | Fledgling | Natural |
| Canada 40K | RESCUE | Fledgling | Natural |
| Ludicrous Speed | BOOTSTRAP | Fledgling | Natural |
| HIVI | VOTE | Fledgling | Natural |
| Midas Touch | GOLD | Fledgling | Natural (DONE) |
| Code-Breakers | HUNT | Flight | Acrostic (DONE) |
| AI/Husky | SPEAK | Fledgling | Natural (DONE) |
| Anti-Extractive | FLOOR | Fledgling | Natural |
| ROI Predictability | CERTAINTY | Flight | Acrostic |

### Social Media Infrastructure (ALREADY BUILT — DO NOT REBUILD)
- 8 platforms configured: Twitter, LinkedIn, Facebook, Instagram, TikTok, Threads, Bluesky, Imgur
- Edge functions deployed: social-post, process-scheduled-posts, social-oauth-callback, refresh-social-tokens
- Client libraries: socialOAuth.ts, socialPlugSystem.ts, tiktokOAuth.ts
- DB tables: member_social_accounts, member_scheduled_posts, user_social_plugs, social_shares
- Multi-account support: up to 6 accounts per platform per user
- NEW: Mastodon (me.dm) — token in DoubleSecret, needs Supabase secret + social-post handler

### Canonical Scott Letter
- The correct version is "Cardboard Boots: An Open Letter to MacKenzie Scott"
- Path: `Cephas/cephas-hugo/content/letters/circle-1-investors/mackenzie-scott-cardboard-boots.md`
- NOT `ARTICLE_MEDIUM_SCOTT_OPEN_LETTER.md` (that's an earlier cut)
- Quiz references the canonical version

### Founder Action Items (NOT Knight's job):
- Set MASTODON_ACCESS_TOKEN in Supabase secrets (from DoubleSecret)
- Connect social accounts via OAuth (Twitter, LinkedIn, etc.) through the platform UI
- Stamp dispatch queue items for sending
- Medium articles: copy-paste via Write button (Medium killed API tokens)
- SECURITY: Approve moving client secrets from .env to Supabase secrets

---

## GIT COMMITS
```
Session 25: dispatch queue seeded, landing page restored, golden key pipeline
Session 25: quiz system for open letters, cue card auto-generation
```

---

*Generated by Bishop — March 15, 2026*
*Chain: Bishop008 → Bishop009 → this prompt*
*FOR THE KEEP.*
