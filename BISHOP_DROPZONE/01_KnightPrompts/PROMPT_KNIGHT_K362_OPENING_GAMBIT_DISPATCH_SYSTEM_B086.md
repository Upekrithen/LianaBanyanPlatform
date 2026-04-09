# Knight Session K362 — Opening Gambit Letter Dispatch System
# Bishop B086 | Priority: HIGH | Depends on: K360 (Battery Dispatch verified)

## CONTEXT
108 letters are drafted. The Opening Gambit compressed wave plan (B060) calls for 53 letters in 4 phases over 10-14 days. Founder must review + lock letters before send, but the SYSTEM for dispatching them needs to be built. Currently letters are Hugo files in `cephas/cephas-hugo/content/letters/` and DB entries — but there's no dispatch pipeline to actually deliver them.

The send-transactional-email edge function already works (4 cue card emails sent via B051/B052). This session builds the letter dispatch pipeline on top of that foundation.

## WHAT TO BUILD

### 1. Letter Dispatch Table
```sql
CREATE TABLE IF NOT EXISTS letter_dispatch_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID REFERENCES platform_canonical(id),
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  recipient_org TEXT,

  -- Dispatch config
  phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 4),
  wave_position INTEGER DEFAULT 0,
  dispatch_method TEXT DEFAULT 'email' CHECK (dispatch_method IN ('email', 'physical', 'both')),

  -- Status tracking
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'locked', 'queued', 'sent', 'delivered', 'bounced', 'responded')),
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES auth.users(id),
  queued_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  response_received_at TIMESTAMPTZ,

  -- Content
  subject_line TEXT,
  custom_intro TEXT,
  red_carpet_slug TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Tracking
  email_message_id TEXT,
  open_tracked BOOLEAN DEFAULT false,
  click_tracked BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_letter_dispatch_phase ON letter_dispatch_queue(phase, wave_position);
CREATE INDEX idx_letter_dispatch_status ON letter_dispatch_queue(status);
```

### 2. Letter Dispatch Dashboard
Create `LetterDispatchPage` (`/v2/ops/letter-dispatch`):
- **Phase View**: 4 columns (Phase 1: Crown+Academics, Phase 2: Industry, Phase 3: Political, Phase 4: Patron)
- Each letter card shows: recipient, org, status badge, Red Carpet link
- **Lock Button**: Founder locks individual letters (status: draft → locked)
- **Queue Button**: Founder queues locked letters for send (locked → queued)
- **Batch Actions**: "Lock All Phase 1", "Queue All Locked"
- **Send Preview**: before queueing, show email preview with subject + intro + letter body
- **Response Tracker**: mark responses (with date and notes)
- **Wave Matrix View**: timeline showing which letters go out on which day per the compressed wave plan

### 3. Letter Send Edge Function
Create `dispatch-letter` edge function:
- Takes `letter_dispatch_id`
- Fetches letter content from platform_canonical or Hugo file
- Calls `send-transactional-email` with type='letter'
- Personalizes: recipient name, custom intro, Red Carpet URL
- Updates dispatch status: queued → sent
- Records email_message_id for tracking
- Rate limit: max 10 letters per hour (reputation protection)

### 4. Red Carpet Auto-Link
Each letter gets a personalized Red Carpet URL:
- Format: `lianabanyan.com/RedCarpet/{recipientSlug}`
- B084 already created 5 Red Carpet entries for academics
- Auto-generate Red Carpet entry if one doesn't exist for the recipient
- Include in letter footer: "A personalized walkthrough has been prepared for you"

### 5. Response Playbook Integration
B058 created a response playbook. Wire it in:
- When a letter status changes to 'responded', show the playbook for that letter type
- Quick-response templates per category (interested, meeting request, declined, forwarded)
- Log all responses with timestamp and category

## FILES TO CREATE
- `platform/supabase/migrations/YYYYMMDDHHMMSS_k362_letter_dispatch.sql`
- `platform/supabase/functions/dispatch-letter/index.ts`
- `platform/src/pages/v2/ops/LetterDispatchPage.tsx`
- `platform/src/components/letters/LetterCard.tsx`
- `platform/src/components/letters/LetterPreviewModal.tsx`
- `platform/src/components/letters/WaveMatrixView.tsx`
- `platform/src/components/letters/ResponseTracker.tsx`

## CONSTRAINTS
- FOUNDER MUST LOCK each letter before it can be queued — NO auto-send
- Rate limit: 10 letters/hour maximum (email reputation)
- All letters SEC-clean (B084 verified all 12 Crown letters clean)
- Red Carpet URLs must use existing Red Carpet page system
- Response data is CONFIDENTIAL — admin-only RLS
- Physical mail dispatch is manual — just track status, don't automate printing
- Email subject lines: personalized, not generic (each letter has unique subject)

## DONE WHEN
- [ ] letter_dispatch_queue table created with proper RLS
- [ ] All 108 letters seeded into dispatch queue (draft status)
- [ ] Dashboard shows 4-phase view with lock/queue/send workflow
- [ ] Letter preview renders correctly before send
- [ ] dispatch-letter edge function sends via transactional email
- [ ] Red Carpet links auto-generated for recipients without them
- [ ] Response tracking works with category + notes
- [ ] Rate limiting enforced (10/hour)
- [ ] Wave Matrix view shows the compressed timeline
