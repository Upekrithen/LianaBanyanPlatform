# Knight Session 45 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: TBD (Knight 44 latest)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Priority: Task A first, then Task B.

> **NotCents Economy context**: The three-currency system (Credits/Marks/Joules) is branded "The NotCents Economy." The Anvil (Ↄ‖) is the currency symbol. "Powered by NotCents™" should be in the site footer.

---

## TASK A: Coverage Minutes Dashboard (Muffled Rule)

### Context

The Muffled Rule: speaking is gated by listening. You earn coverage minutes by actively participating (attending discussions, reading proposals, QA). You spend them by speaking (posting in forums, debate participation, proposal submissions). This prevents filibustering and ensures every voice gets a turn.

**Key mechanics:**
- 3-minute chunks: speaking time is allocated in 3-minute blocks to prevent monologues
- 180-minute daily cap: no one can dominate for more than 3 hours in a day
- 90-day expiry: minutes expire on a rolling 90-day window — use them or lose them
- This is one of the 22 Muffled Rule innovations (MR-001 through MR-022)

### Steps:

1. **Create migration** `20260319000017_coverage_minutes.sql` for `coverage_minutes` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL, UNIQUE)
   - `minutes_earned` (numeric, default 0)
   - `minutes_spent` (numeric, default 0)
   - `earned_events` (jsonb, default '[]')
   - `spent_events` (jsonb, default '[]')
   - `last_earned_at` (timestamptz, nullable)
   - `last_spent_at` (timestamptz, nullable)

2. **Create migration** `20260319000018_coverage_minute_transactions.sql` for `coverage_minute_transactions` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL)
   - `transaction_type` (text, NOT NULL, CHECK in ('earned', 'spent'))
   - `minutes` (numeric, NOT NULL)
   - `context` (text, NOT NULL — 'discussion', 'proposal', 'debate', 'qa', 'forum_post', 'reading')
   - `expires_at` (timestamptz, NOT NULL — calculated as created_at + 90 days)
   - `created_at` (timestamptz, default now())

3. **RLS policies**:
   - `coverage_minutes`: Users can SELECT/INSERT/UPDATE their own row (`auth.uid() = user_id`). No DELETE.
   - `coverage_minute_transactions`: Users can SELECT/INSERT their own transactions. No UPDATE/DELETE (immutable log).

4. **Seed data**: Insert sample coverage minutes for 8 users. Include a mix of high-balance earners, near-cap spenders, and members with expiring minutes.

5. **Check if `src/pages/CoverageMinutesDashboard.tsx` exists.** If yes, enhance with features below. If no, create it at route `/coverage-minutes`.

6. **Coverage Minutes Dashboard page content:**

   **Header:**
   - "Coverage Minutes — Listen First, Speak Second"

   **Your Balance Card:**
   - Three-stat display:
     - Minutes Earned (green, up arrow icon)
     - Minutes Spent (amber, down arrow icon)
     - Available Balance (large, primary color) = earned - spent (considering expiry)
   - Expiry warning: if any minutes expire within 7 days, show alert: "X minutes expiring in Y days"
   - Visual: circular progress ring or gauge showing available vs. total earned

   **3-Minute Chunk Timer:**
   - Large visual countdown timer (circular or linear progress)
   - Shows 3:00 → 0:00 countdown when active speaking session
   - States: Idle (gray), Active (green, counting down), Paused (amber, at chunk boundary)
   - "Start Speaking" button → begins 3-minute countdown
   - Auto-pause at 0:00 with "Your 3-minute chunk has ended"
   - "Request Another Chunk" button → starts a new 3-minute block (deducts 3 from balance)
   - "End Session" button → stops timer, records minutes spent

   **180-Minute Daily Cap Indicator:**
   - Horizontal progress bar showing minutes used today vs. 180 cap
   - Color transitions: green (0-60), yellow (60-120), amber (120-150), red (150-180)
   - "X minutes remaining today" text
   - When cap reached: "Daily cap reached. Come back tomorrow." (disabled timer)

   **Activity Log:**
   - Table of recent transactions
   - Columns: Date, Type (Earned/Spent), Minutes, Context, Expires At
   - Earned rows in green text, Spent rows in amber text
   - Expired rows in gray strikethrough
   - Filter: Earned only, Spent only, All
   - Pagination

   **90-Day Expiry Timeline:**
   - Visual timeline or calendar view showing when minutes expire
   - Grouped by week: "This week: X minutes expiring", "Next week: Y minutes", etc.
   - Oldest minutes highlighted first (FIFO — first earned, first to expire)

   **"How It Works" Section:**
   - Collapsible explainer card:
     - "Earn minutes by listening: attending discussions, reading proposals, participating in QA"
     - "Spend minutes by speaking: posting in forums, debate participation, proposal submissions"
     - "3-minute chunks prevent filibustering — say what matters, then yield the floor"
     - "180-minute daily cap ensures everyone gets a turn"
     - "Minutes expire after 90 days — engage consistently to maintain your balance"
     - The Muffled Rule philosophy: "In a world of endless noise, the platform rewards those who listen."

7. **Add route** to `App.tsx` if creating new: `/coverage-minutes` → `CoverageMinutesDashboard`
8. **Add sidebar navigation** entry

---

## TASK B: Vouched By / Recommended By System

### Context

The Vouch system is the trust infrastructure for Crown Letter delegation. When a Crown Letter recipient receives their invitation, they can: Accept (take the role), Delegate (pass to someone better suited, with personal introduction), Pass Along (forward without endorsement), or Recommend (suggest someone without personal intro). This creates branching delegation chains that map the trust network.

"Unknown Needs Discovery" is a key feature: experts in the chain can flag needs the Founder hasn't recognized yet (e.g., "you'll also need a shipping logistics expert").

### Steps:

1. **Create migration** `20260319000019_vouches.sql` for `vouches` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `voucher_user_id` (uuid, FK to auth.users, NOT NULL)
   - `vouchee_name` (text, NOT NULL)
   - `vouchee_email` (text, nullable)
   - `vouch_type` (text, NOT NULL, CHECK in ('vouch', 'recommend'))
   - `relationship` (text, NOT NULL)
   - `reason` (text, NOT NULL)
   - `strength` (integer, NOT NULL, CHECK (strength >= 1 AND strength <= 5))
   - `original_crown_letter_id` (uuid, nullable)
   - `status` (text, NOT NULL, CHECK in ('pending', 'accepted', 'declined', 'expired'), default 'pending')
   - `created_at` (timestamptz, default now())

2. **Create migration** `20260319000020_crown_letter_delegations.sql` for `crown_letter_delegations` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `letter_id` (uuid, NOT NULL)
   - `from_user_id` (uuid, FK to auth.users, NOT NULL)
   - `to_user_id` (uuid, FK to auth.users, nullable)
   - `to_name` (text, NOT NULL)
   - `to_email` (text, nullable)
   - `action` (text, NOT NULL, CHECK in ('accept', 'delegate', 'pass_along', 'recommend'))
   - `message` (text)
   - `created_at` (timestamptz, default now())

3. **RLS policies**:
   - `vouches`: Voucher can CRUD own vouches (`auth.uid() = voucher_user_id`). Users can SELECT vouches made FOR them (match on email via auth.users lookup or direct `vouchee_name` match). No DELETE by non-admin.
   - `crown_letter_delegations`: Participants can SELECT rows where they are `from_user_id` or `to_user_id`. `from_user_id` can INSERT. No UPDATE/DELETE.

4. **Seed data**: Insert a sample vouch chain:
   - User A vouches for User B (strength 5, "vouch")
   - User B recommends User C (strength 3, "recommend")
   - User A vouches for User D (strength 4, "vouch")
   - Insert corresponding crown_letter_delegations showing a delegation chain:
     - Letter L1: Founder → User A (accept)
     - Letter L1: User A → User B (delegate, with message)
     - Letter L1: User B → User C (recommend)
     - Letter L2: Founder → User D (accept)
     - Letter L2: User D → User E (pass_along)

5. **Create `src/pages/VouchSystem.tsx`** at route `/vouch`:

   **Header:**
   - "Vouch & Recommend — Your Word Is Your Bond"

   **Your Vouches Section:**
   - Two tabs or card groups:
     - **People You've Vouched For** (personal introduction provided):
       - Card per vouchee: name, relationship, reason, strength (1-5 stars), status badge, date
     - **People You've Recommended** (suggested without personal intro):
       - Card per recommendee: name, reason, strength, status badge, date
   - Third section: **People Who Vouched/Recommended YOU**
     - Cards showing who endorsed you, their relationship note, and strength

   **Vouch/Recommend Form:**
   - "Vouch For Someone" / "Recommend Someone" toggle (two modes)
   - Fields:
     - Recipient name (required)
     - Email or contact info (optional)
     - Your relationship to them (required, text)
     - Why you're vouching/recommending (required, textarea)
     - Strength slider: 1 ("Worth a look") to 5 ("I stake my reputation on this person")
     - If vouch: "I will personally introduce this person" checkbox (required for vouch type)
     - If recommend: "I suggest the team reach out" (automatic)
   - Submit: "Send Vouch" or "Send Recommendation"

   **Delegation Chain Visualization:**
   - Tree/graph view showing how Crown Letters flow through the network
   - Each node: person's name, their action (Accept/Delegate/Pass Along/Recommend), date
   - Branching where one letter spawns multiple delegations
   - Your position highlighted in any chains you participate in
   - Color coding: Accept = green, Delegate = blue, Pass Along = gray, Recommend = amber
   - Interactive: click a node to see the full vouch/delegation details

   **Unknown Needs Discovery Panel:**
   - Card or section within the delegation view
   - "Spot a Gap?" prompt — experts can flag roles or needs the platform hasn't identified
   - Form: "What role or expertise is needed?" + "Why?" + "Know someone?" (optional vouch)
   - List of discovered needs, attributed to the expert who identified them

   **Trust Metrics Sidebar:**
   - Your vouch success rate: "X% of people you vouched for have contributed positively"
   - Network reach: "Your vouches connect to X people across Y chains"
   - Vouch strength average: your average strength rating given
   - Vouches received: how many people have vouched for YOU and average strength

6. **Add route** to `App.tsx`: `/vouch` → `VouchSystem`
7. **Add sidebar navigation** entry

---

## Standard Knight Instructions

- **Build check**: Run `npm run build` before every commit. Fix any errors.
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md` with what you built.
- **Commits**: Separate commits per task (one for Task A, one for Task B).
- **Deploy**: Deploy to Firebase when both tasks complete.
- **Patterns**: Follow existing codebase patterns for components, hooks, and Supabase queries.
- **Migration numbering**: Continues sequentially from 20260319000017 (Session 42 used 000007-000010, Session 43 used 000011-000012, Session 44 used 000013-000016).
- **NotCents branding**: Use Anvil symbol (Ↄ‖) for currency displays. "Powered by NotCents™" in footer.

**FOR THE KEEP!**
