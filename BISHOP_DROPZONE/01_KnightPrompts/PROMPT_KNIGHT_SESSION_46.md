# Knight Session 46 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: TBD (Knight 45 latest)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Priority: Task A first, then Task B.

> **NotCents Economy context**: The three-currency system (Credits/Marks/Joules) is branded "The NotCents Economy." The Anvil (Ↄ‖) is the currency symbol. "Powered by NotCents™" should be in the site footer.

---

## TASK A: MoneyPenny Q&A Intelligence → Supabase Wiring

### Context

Bishop built `src/pages/MoneyPennyQA.tsx` and `src/lib/moneyPennyQAService.ts` with sample data. These pages currently work off local/mock data. This task creates the Supabase tables, wires the service layer to real queries, and seeds production-ready sample data.

MoneyPenny is the platform's AI concierge — she handles incoming questions across all channels, classifies them, detects novelty, and awards Marks for worthwhile new questions. Milestone reports track aggregate Q&A health at every 100-question mark.

### Steps:

1. **Create migration** `20260319000021_qa_entries.sql` for `qa_entries` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `question_text` (text, NOT NULL)
   - `answer_text` (text, NOT NULL)
   - `asker_name` (text, NOT NULL)
   - `asker_email` (text, nullable)
   - `asker_user_id` (uuid, FK to auth.users, nullable)
   - `channel` (text, NOT NULL, CHECK in ('website', 'social_media', 'email', 'in_platform', 'discord'))
   - `classification` (text, NOT NULL, CHECK in ('worthwhile', 'duplicate', 'throwaway', 'flamer', 'troll', 'bot'), default 'worthwhile')
   - `is_novel` (boolean, NOT NULL, default true)
   - `marks_awarded` (numeric, NOT NULL, default 0)
   - `follow_up_received` (boolean, NOT NULL, default false)
   - `follow_up_marks_awarded` (numeric, NOT NULL, default 0)
   - `ai_responder` (text, NOT NULL, default 'MoneyPenny')
   - `status` (text, NOT NULL, CHECK in ('pending_review', 'approved', 'rejected', 'sent', 'followed_up'), default 'pending_review')
   - `similar_question_ids` (uuid[], nullable)
   - `created_at` (timestamptz, NOT NULL, default now())
   - `reviewed_at` (timestamptz, nullable)
   - `sent_at` (timestamptz, nullable)
   - `follow_up_at` (timestamptz, nullable)

2. **Create migration** `20260319000022_qa_milestone_reports.sql` for `qa_milestone_reports` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `milestone` (integer, NOT NULL, UNIQUE)
   - `reached_at` (timestamptz, NOT NULL, default now())
   - `total_questions` (integer, NOT NULL)
   - `worthwhile_count` (integer, NOT NULL, default 0)
   - `duplicate_count` (integer, NOT NULL, default 0)
   - `throwaway_count` (integer, NOT NULL, default 0)
   - `flamer_count` (integer, NOT NULL, default 0)
   - `troll_count` (integer, NOT NULL, default 0)
   - `bot_count` (integer, NOT NULL, default 0)
   - `follow_up_rate` (numeric, NOT NULL, default 0)
   - `total_marks_awarded` (numeric, NOT NULL, default 0)
   - `top_categories` (jsonb, NOT NULL, default '[]')
   - `avg_response_time_seconds` (integer, NOT NULL, default 0)

3. **Create migration** `20260319000023_qa_question_signatures.sql` for `qa_question_signatures` table (novelty detection):
   - `id` (uuid, PK, default gen_random_uuid())
   - `question_hash` (text, NOT NULL, UNIQUE — normalized lowercase trimmed hash)
   - `first_asked_by` (uuid, FK to auth.users, nullable)
   - `first_qa_entry_id` (uuid, FK to qa_entries, NOT NULL)
   - `created_at` (timestamptz, NOT NULL, default now())

4. **RLS policies**:
   - `qa_entries`: Admin can SELECT/INSERT/UPDATE/DELETE all rows. Regular authenticated users can SELECT rows where `asker_user_id = auth.uid()`. No public access.
   - `qa_milestone_reports`: SELECT for all authenticated users (publicly readable within the platform). INSERT/UPDATE/DELETE admin only.
   - `qa_question_signatures`: Admin can CRUD all. No user access needed (internal novelty detection table).

5. **Seed data**: Insert 25 sample Q&A entries spanning:
   - All 5 channels (website, social_media, email, in_platform, discord)
   - All 6 classifications (majority worthwhile, a few duplicates, one throwaway, one flamer, one troll, one bot)
   - Mix of novel and non-novel questions
   - Some with follow-ups, some without
   - Various statuses across the pipeline
   - Corresponding question_signatures for all novel entries
   - One milestone report at the 100-question mark with realistic aggregate stats

6. **Wire `src/lib/moneyPennyQAService.ts`** to Supabase:
   - Replace any mock/sample data with real Supabase queries
   - The novelty check function should: normalize the question text (lowercase, trim whitespace), hash it, query `qa_question_signatures` for a match. If no match exists, the question is novel.
   - Fetch functions should respect RLS (admin sees all, user sees own)
   - Milestone report fetch should be a simple SELECT (publicly readable)

7. **Verify** `MoneyPennyQA.tsx` renders correctly with live data. Fix any type mismatches between the existing UI and the new Supabase schema.

---

## TASK B: Social Media Command Center → Supabase Wiring

### Context

Bishop built `src/pages/MoneyPennySocial.tsx` and `src/lib/socialMediaService.ts`. This is MoneyPenny's social media monitoring dashboard — it tracks mentions, comments, DMs, and other interactions across all social channels, assigns priority/sentiment, and generates daily digests.

### Steps:

1. **Create migration** `20260319000024_social_interactions.sql` for `social_interactions` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `channel` (text, NOT NULL, CHECK in ('twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'discord', 'reddit', 'youtube'))
   - `interaction_type` (text, NOT NULL, CHECK in ('mention', 'comment', 'dm', 'reply', 'tag', 'review', 'share'))
   - `author_name` (text, NOT NULL)
   - `author_handle` (text, NOT NULL)
   - `author_followers` (integer, NOT NULL, default 0)
   - `content` (text, NOT NULL)
   - `sentiment` (text, NOT NULL, CHECK in ('positive', 'neutral', 'negative', 'hostile'), default 'neutral')
   - `priority` (text, NOT NULL, CHECK in ('urgent', 'high', 'medium', 'low', 'ignore'), default 'medium')
   - `category` (text, NOT NULL, CHECK in ('question', 'praise', 'complaint', 'feature_request', 'partnership_inquiry', 'press', 'spam', 'troll', 'general'), default 'general')
   - `draft_response` (text, nullable)
   - `response_status` (text, NOT NULL, CHECK in ('new', 'ai_drafted', 'pending_review', 'approved', 'published', 'rejected', 'no_response_needed'), default 'new')
   - `ai_notes` (text, nullable)
   - `related_qa_id` (uuid, FK to qa_entries, nullable)
   - `received_at` (timestamptz, NOT NULL, default now())
   - `reviewed_at` (timestamptz, nullable)
   - `published_at` (timestamptz, nullable)

2. **Create migration** `20260319000025_social_daily_digests.sql` for `social_daily_digests` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `digest_date` (date, NOT NULL, UNIQUE)
   - `total_interactions` (integer, NOT NULL, default 0)
   - `requires_response` (integer, NOT NULL, default 0)
   - `highlights` (text[], NOT NULL, default '{}')
   - `channel_breakdown` (jsonb, NOT NULL, default '{}')
   - `created_at` (timestamptz, NOT NULL, default now())

3. **RLS policies**:
   - `social_interactions`: Admin only for all operations (SELECT/INSERT/UPDATE/DELETE). No regular user access — this is an internal operations tool.
   - `social_daily_digests`: Admin only for all operations.

4. **Seed data**: Insert 20 sample social interactions spanning:
   - At least 5 different channels
   - Mix of interaction types
   - Varied sentiments and priorities (include at least 1 urgent, 2 high)
   - Several with AI-drafted responses at various stages
   - At least 1 linked to a qa_entry (via related_qa_id)
   - 1 daily digest for today's date with channel_breakdown as `{"twitter": 5, "instagram": 4, "discord": 3, ...}`

5. **Wire `src/lib/socialMediaService.ts`** to Supabase:
   - Replace mock/sample data with real Supabase queries
   - Admin-only access enforced via RLS
   - Daily digest should upsert (insert if none exists for today, update if it does)

6. **Verify** `MoneyPennySocial.tsx` renders correctly with live data. Fix any type mismatches.

---

## Standard Knight Instructions

- **Build check**: Run `npm run build` before every commit. Fix any errors.
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md` with what you built.
- **Commits**: Separate commits per task (one for Task A, one for Task B).
- **Deploy**: Deploy to Firebase when both tasks complete.
- **Patterns**: Follow existing codebase patterns for components, hooks, and Supabase queries.
- **Migration numbering**: Continues sequentially from 20260319000021 (Session 45 used 000017-000020).
- **NotCents branding**: Use Anvil symbol (Ↄ‖) for currency displays. "Powered by NotCents™" in footer.

**FOR THE KEEP!**
