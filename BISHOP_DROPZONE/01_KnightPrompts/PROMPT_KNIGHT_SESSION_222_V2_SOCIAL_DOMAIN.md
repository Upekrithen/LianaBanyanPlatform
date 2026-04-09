# KNIGHT SESSION 222 — v2 Social Domain Migration
## Priority: HIGH | Complexity: VERY HIGH | Prerequisite: K209 (Currency)

---

## V1 INVENTORY
- **Tables (9+)**: user_social_plugs, member_social_accounts (multi-account, up to 6/platform), outbound_dispatch (8 statuses, founder stamp), social_interactions (8 channels, sentiment/priority), moneypenny_social_drafts, social_imports, creator_bridges, social_shares, social_frame_locks, social_plug_features, social_daily_digests
- **Edge Functions (12)**: moneypenny-ai-draft (Claude↔Perplexity fallback, 5 task types), moneypenny-auto-post (5-min cron), moneypenny-daily-digest (8 AM), moneypenny-intake (email classification), moneypenny-signal (Red Carpet processor), moneypenny-sms (Twilio SMS), social-post (9 platforms), social-oauth-callback (7 platforms), social-image-upload (5MB max), refresh-social-tokens (hourly cron), dispatch-executor, medium-publish
- **Pages (8)**: DispatchComposePage (11 platforms, 3 modes), DispatchQueuePage, MoneyPenny (hub), MoneyPennySocial, MoneypennyBriefing, MoneyPennyQA, SocialAccountsPage, SocialImportPage
- **Components (4)**: dispatch/StampToSendModal ("As You Wish" founder stamp), social-import/ (BookmarkletInstructions, ImportPreview, ImportToProjectWizard)
- **Lib (6)**: socialPlugSystem.ts (12 platforms), dispatchGuardrails.ts (per-platform rate limits), outboundDispatch.ts, socialMediaService.ts, socialOAuth.ts, moneyPennyQAService.ts

## V2 STRUCTURE
```
platform-v2/src/domains/social/
├── pages/
│   ├── DispatchComposePage.tsx     # 11 platforms, 3 dispatch modes (AppShell)
│   ├── DispatchQueuePage.tsx      # Queue with status tracking
│   ├── MoneyPennyPage.tsx         # AI assistant hub
│   ├── MoneyPennySocialPage.tsx   # Inbox + drafts + stats
│   ├── SocialAccountsPage.tsx     # OAuth for 10+ platforms
│   └── SocialImportPage.tsx       # Bookmarklet + URL paste
├── components/
│   ├── StampToSendModal.tsx       # "As You Wish" founder stamp
│   ├── DispatchStatusBadge.tsx, PlatformIcon.tsx
│   ├── MoneyPennyDraftCard.tsx, MoneyPennyInbox.tsx
│   └── SocialImportWizard.tsx
├── hooks/
│   ├── useDispatch.ts, useMoneyPenny.ts, useSocialAccounts.ts, useSocialImport.ts
├── lib/
│   ├── socialTypes.ts, platformRegistry.ts (12 platforms)
│   ├── dispatchGuardrails.ts (Standard/Elevated/High rate limits)
│   ├── dispatchWorkflow.ts (DRAFT→REVIEW→REVISION→STAMPED→QUEUED→DISPATCHED→TRACKED)
│   ├── emailClassification.ts (Crown/VIP→P1, Press→P1, Patent/Legal→P1, Member→P2, Support→P3)
│   └── moneyPennyService.ts (5 task types: qa, social, classify, briefing, summarize)
├── routes.tsx
└── index.ts
```

## KEY RULES
- **12 Platforms**: Twitter/X, TikTok, Instagram, LinkedIn, Facebook, Discord, Bluesky, Threads, Mastodon, YouTube, Substack, Imgur
- **Dispatch workflow**: DRAFT → REVIEW → REVISION → STAMPED ("As You Wish") → QUEUED → DISPATCHED → TRACKED
- **Guardrail levels**: Standard (Twitter, Discord), Elevated (Instagram, YouTube), High (TikTok)
- **MoneyPenny AI**: Claude↔Perplexity mutual fallback, 5 task types
- **"As You Wish"** = transaction/dispatch confirmation phrase

## MANDATORY: `cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js`

*FOR THE KEEP!*
