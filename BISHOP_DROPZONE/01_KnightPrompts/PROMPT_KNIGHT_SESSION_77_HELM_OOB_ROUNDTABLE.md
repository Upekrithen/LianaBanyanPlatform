# KNIGHT SESSION 77 — Helm Actions + Out of Bounds Plugs + Round Table Text
## Priority: MEDIUM (no blockers — can run anytime)
## Estimated Effort: Medium session (3 tasks, moderate complexity)
## Prerequisites: Knight 75 COMPLETE. Knight 76 blocked on Stripe Issuing approval.

---

## CONTEXT

Session 75 delivered HEOHO banner, Amplifier clauses, and innovation count update. Session 76 is the LB Card (blocked on Stripe). This session wires three UI features that the Founder needs NOW for real-world operations.

---

## TASK 1: HELM ACTIONS (Founder Portfolio Pitch System)

**What**: A system for the Founder (and eventually all members) to store, access, and use action documents (pitches, checklists, scripts) from within the platform.

**Why**: The Founder is about to walk into La Capital del Sabor with a pitch. He needs to pull up the pitch script on his phone from the platform, not dig through files.

### Database

Create migration for `helm_actions` table:

```sql
CREATE TABLE helm_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'pitch',
  -- types: 'pitch', 'checklist', 'script', 'bounty', 'outreach'
  content JSONB NOT NULL,
  -- content structure:
  -- {
  --   "sections": [
  --     { "title": "The 30-Second Pitch", "body": "...", "type": "script" },
  --     { "title": "If They Ask Questions", "body": "...", "type": "faq" },
  --     { "title": "Leave-Behind", "body": "...", "type": "document" },
  --     { "title": "Preparation Checklist", "body": "...", "type": "checklist", "items": [...] },
  --     { "title": "After The Visit", "body": "...", "type": "checklist", "items": [...] }
  --   ],
  --   "target": "La Capital del Sabor",
  --   "target_type": "restaurant",
  --   "status": "ready"
  -- }
  tags TEXT[] DEFAULT '{}',
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: user can see own actions + admins see all
ALTER TABLE helm_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own helm actions" ON helm_actions
  FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users manage own helm actions" ON helm_actions
  FOR ALL USING (auth.uid() = user_id OR is_admin());
```

### Frontend

Create `HelmActionsPage.tsx` at `/dashboard/helm`:

1. **List view**: Cards showing title, type badge, target, status
2. **Detail view**: Swipeable sections (mobile-optimized, big text)
   - Script sections: large font, high contrast, readable at arm's length
   - FAQ sections: accordion/expandable
   - Checklist sections: tappable checkboxes (state saved to JSONB)
   - Document sections: formatted markdown
3. **Quick actions**: "Use This Pitch" button that opens detail in full-screen mobile mode

### Seed Data

Insert the La Capital del Sabor pitch as the first helm_action. Content is at `BISHOP_DROPZONE/PITCH_LA_CAPITAL_DEL_SABOR.md`. Parse into the JSONB structure above.

### Navigation

Add "Helm" to the Founder Portfolio sidebar (or wherever the Bridge/Founder tools live). Icon: compass or ship's wheel.

---

## TASK 2: OUT OF BOUNDS PLUG ARCHITECTURE

**What**: Compose once in Helm → post to multiple external platforms (Reddit, Discord, LB Pnyx).

**Why**: The Founder has 5 Reddit post templates ready (from innovation #1912). Needs to post them efficiently and track responses.

### Database

```sql
CREATE TABLE oob_plugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  platform TEXT NOT NULL, -- 'reddit', 'discord', 'pnyx', 'substack'
  platform_config JSONB NOT NULL,
  -- reddit: { "subreddits": ["r/cooperatives", "r/smallbusiness"], "username": "..." }
  -- discord: { "server_id": "...", "channel_ids": ["..."], "bot_token_ref": "..." }
  -- pnyx: { "room_ids": ["..."] }
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE oob_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  format_overrides JSONB DEFAULT '{}',
  -- per-platform formatting if needed
  target_plugs UUID[] NOT NULL, -- which plugs to post to
  status TEXT DEFAULT 'draft', -- 'draft', 'posted', 'partial', 'failed'
  post_results JSONB DEFAULT '{}',
  -- { "plug_id": { "url": "...", "status": "posted", "replies": 0 } }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS on both tables
ALTER TABLE oob_plugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE oob_posts ENABLE ROW LEVEL SECURITY;
-- Same pattern: user sees own + admin sees all
```

### Frontend

Create `OutOfBoundsPage.tsx` at `/dashboard/oob`:

1. **Compose view**: Title + body (markdown editor). Select target plugs (checkboxes). Format preview per platform.
2. **Plug management**: Add/configure plugs. For now, just store the config — actual API integration is Phase 2 (needs Reddit OAuth, Discord bot token).
3. **Response dashboard**: Unified view of replies from all platforms (Phase 2 — manual entry for now, API-driven later).

**Phase 1 (this session)**: Database, UI, compose + save drafts, plug configuration storage. Manual copy-paste to platforms with "Mark as Posted" button.

**Phase 2 (future)**: Reddit OAuth posting, Discord bot posting, Pnyx native posting, reply aggregation.

---

## TASK 3: ROUND TABLE TEXT DISCUSSION

**What**: Add real-time text discussion to the Crew Table / Round Table interface.

**Why**: When a team assembles around a Treasure Map, they need to communicate. Currently no in-app messaging for project teams.

### Database

```sql
CREATE TABLE round_table_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL, -- references the crew_tables or round_tables table
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'system', 'bounty_update', 'status_change'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rtm_table_id ON round_table_messages(table_id);
CREATE INDEX idx_rtm_created ON round_table_messages(created_at);

ALTER TABLE round_table_messages ENABLE ROW LEVEL SECURITY;
-- Only table members can read/write messages
CREATE POLICY "Table members see messages" ON round_table_messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM crew_table_members WHERE table_id = round_table_messages.table_id
    ) OR is_admin()
  );
CREATE POLICY "Table members post messages" ON round_table_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IN (
      SELECT user_id FROM crew_table_members WHERE table_id = round_table_messages.table_id
    )
  );
```

### Frontend

Add a chat panel to the existing Round Table / Crew Table component:

1. **Message list**: Scrollable, newest at bottom. System messages styled differently (bounty claimed, status changed, member joined).
2. **Input**: Text input + send button. Enter to send. No rich text needed (plain text + links).
3. **Real-time**: Use Supabase Realtime subscription on `round_table_messages` filtered by `table_id`.
4. **Notification**: Badge on Round Table icon when unread messages exist.

### Integration Points

- When a bounty is claimed on the table → system message auto-posted
- When a member joins/leaves → system message
- When Treasure Map step is completed → system message
- When project status changes → system message

---

## BUILD ORDER

1. Helm Actions (highest priority — Founder needs this for La Capital visit)
2. Round Table Text (enables team communication)
3. Out of Bounds Phase 1 (compose + save + manual posting)

---

## TESTING CHECKLIST

- [ ] Helm: Create action, view on mobile (Chrome DevTools mobile mode), swipe between sections
- [ ] Helm: Checklist items save state when tapped
- [ ] Helm: La Capital pitch seed data loads correctly
- [ ] Round Table: Send message, see it appear in real-time on second tab
- [ ] Round Table: System messages appear when bounty/status changes
- [ ] OOB: Create plug config, compose post, save as draft, mark as posted
- [ ] All: RLS prevents cross-user access
- [ ] All: Admin can see all records

---

## INNOVATION COUNT

Update `useCanonicalStats.ts`: 1,910 → 1,929
Update `CephasPressJunketPage.tsx`: check for any remaining stale counts

---

**FOR THE KEEP.**
