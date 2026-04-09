# KNIGHT SESSION 290 — What-If Commissions + Founder Contact Dashboard
## Bishop B076 | April 4, 2026
## Crown Jewel Innovation #2150 infrastructure
## Source: Founder direction B076

---

## Mission

Build the infrastructure for **What-If Commissions** (pre-drafted, on-the-spot role assignments Founder hands out during conversations) AND the **Founder Contact Dashboard** that surfaces commission options per-contact during scheduled calls.

This is a Founder-workflow-critical feature: right before a scheduled call, Founder should see the contact's Red Carpet, their Treasure Map options, and the pre-drafted What-If Commissions that fit them — all on one screen.

## Why This Matters

Founder is about to start having high-value conversations with makers, creators, and potential partners. Mid-conversation, the right move is sometimes: *"You know what, can you be in charge of that?"* That window closes fast. Having pre-drafted commissions + personalized materials ready on-screen turns conversations into on-the-spot deployments.

---

## Implementation

### Part 1 — What-If Commission Data Model

```sql
-- Pre-drafted commission templates (Bishop/Founder create these in advance)
CREATE TABLE IF NOT EXISTS public.whatif_commission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  commission_type TEXT NOT NULL CHECK (commission_type IN (
    'guild_sub_leader','captain_scoped','business_onboarder',
    'research_advisor','maker_prime','portal_steward','custom'
  )),
  domain_scope TEXT NOT NULL,
  authority_description TEXT NOT NULL,
  duration_default TEXT,
  platform_routing_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  guild_memberships_granted TEXT[] DEFAULT ARRAY[]::text[],
  red_carpet_template_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Issued commissions (when Founder actually grants one to a named person)
CREATE TABLE IF NOT EXISTS public.whatif_commissions_issued (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.whatif_commission_templates(id),
  recipient_name TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id),
  recipient_email TEXT,
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_in_conversation_id UUID REFERENCES public.founder_contacts(id),
  commitment_time TEXT,
  commitment_scope_limit TEXT,
  commitment_project_bounds TEXT,
  commitment_decision_level TEXT,
  status TEXT NOT NULL DEFAULT 'offered' CHECK (status IN (
    'offered','accepted','declined','active','completed','withdrawn'
  )),
  accepted_at TIMESTAMPTZ,
  signed_contract_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_whatif_issued_recipient ON public.whatif_commissions_issued(recipient_user_id);
CREATE INDEX idx_whatif_issued_status ON public.whatif_commissions_issued(status);
```

### Part 2 — Founder Contact Dashboard

```sql
-- Founder's contact roster with scheduling metadata
CREATE TABLE IF NOT EXISTS public.founder_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  contact_handle TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_user_id UUID REFERENCES auth.users(id),
  source_table TEXT,
  source_ref_id TEXT,
  relationship_stage TEXT NOT NULL DEFAULT 'prospect' CHECK (relationship_stage IN (
    'prospect','introduced','first_call_scheduled','in_discussion',
    'commissioned','active_partner','declined','dormant'
  )),
  next_action_summary TEXT,
  red_carpet_entry_id UUID,
  treasure_map_ids UUID[] DEFAULT ARRAY[]::uuid[],
  applicable_commission_template_ids UUID[] DEFAULT ARRAY[]::uuid[],
  notes TEXT,
  google_calendar_event_id TEXT,
  last_contacted_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_founder_contacts_next ON public.founder_contacts(next_scheduled_at);
CREATE INDEX idx_founder_contacts_stage ON public.founder_contacts(relationship_stage);

ALTER TABLE public.founder_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founder manages own contacts" ON public.founder_contacts
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.staff_members WHERE role = 'founder'));
```

### Part 3 — Dashboard Page

Create `platform/src/pages/staff/FounderContactDashboard.tsx`:

**Top section**: Today's Calls — sorted by `next_scheduled_at`.

For each call, show in a single "Call Prep Card":
- Contact name, handle, photo
- Relationship stage + next_action_summary
- **Red Carpet link** (if one exists) — "Preview their welcome"
- **Treasure Maps**: visual chips for each map_id that fits them
- **Applicable What-If Commissions**: visual chips for each commission template that fits — click to open the pre-drafted template with their name pre-filled
- **Past conversation notes**
- **Google Calendar event link**

**Middle section**: Commission-Ready panel — all pre-drafted templates at a glance, with "Issue Now" action that prompts for recipient.

**Bottom section**: Active Commissions — list of issued commissions with their current status.

### Part 4 — Google Calendar Sync

Existing infrastructure: `platform/src/lib/calendarSync.ts`, `calendar-sync-commerce` edge function, `useCalendarSync.ts` hook.

**Missing**: actual Google Calendar OAuth + bidirectional sync.

Implementation:
1. Add `google_calendar_refresh_token` to `staff_members` table (encrypted at rest)
2. OAuth2 flow for Founder to grant LB access to their Google Calendar
3. Edge function `sync-google-calendar` that:
   - Pulls upcoming events from Google Calendar
   - Matches events to `founder_contacts` by email/attendee
   - Updates `founder_contacts.next_scheduled_at` + `google_calendar_event_id`
4. On commission issuance, create Google Calendar event for the follow-up automatically

### Part 5 — MoneyPenny Integration

MoneyPenny is the existing AI agent that drafts emails, meeting prep, etc. Extend it to:
- Auto-generate call-prep briefs before scheduled calls
- Surface relevant past conversations, commissions, Treasure Maps
- Draft follow-up emails with commission PDF attached

Update: `platform/supabase/functions/moneypenny-ai-draft/index.ts`
- Add a `call-prep-brief` draft type
- Add a `commission-followup` draft type

### Part 6 — Commission Acceptance Flow

When a commission is accepted (signed digitally or Founder marks it accepted):

1. Update `whatif_commissions_issued.status = 'accepted'`
2. Trigger routing updates:
   - Insert `member_roles` entry with scope metadata
   - Update guild memberships per template
   - Activate Red Carpet personalization
3. Fire notification to Founder
4. Fire welcome notification to recipient with onboarding Treasure Map

### Part 7 — Seed Commission Templates

Seed 6 starter templates matching the Founder's current anticipation:

```sql
INSERT INTO public.whatif_commission_templates
  (title, commission_type, domain_scope, authority_description, duration_default)
VALUES
  ('Desktop Injection Facilitator', 'custom', 'Canister System — desktop injection mold program',
   'Lead desktop injection-molding R&D for Canister System. Authority to source equipment, test molds, publish findings to Makers Guild.',
   'Project-scoped'),
  ('Makers Guild Sub-Discipline Lead', 'guild_sub_leader', '3D Makers Guild — craft discipline',
   'Lead a specific craft discipline within 3D Makers Guild (SLA, CNC, FDM, laser, ceramics). Set standards, approve work, mentor members.',
   'Open-ended'),
  ('Business Onboarder', 'business_onboarder', 'Up to 10 businesses',
   'Onboard new businesses onto LB commerce portals. Authority over Cost+20% configuration, Guild placement, Captain assignment for assigned businesses.',
   'Open-ended'),
  ('Research Advisor', 'research_advisor', 'Specific research domain',
   'Advise on specific research area (cooperative economics, mechanical design, community trust architecture, etc.). Veto authority on published claims in domain.',
   'Open-ended'),
  ('Maker Prime (Tier 1)', 'maker_prime', 'One of the Factor-y 47 makers',
   'Represent a single Tier 1 maker brand across LB commerce portals. Coordinate production runs, author custom business plan updates.',
   'Ongoing'),
  ('Portal Steward', 'portal_steward', 'One portal (.com/.biz/.net/2ndsecond/hexisle/upekrithen)',
   'Operational steward for one commercial portal. Reports to Portal Crown if assigned. Deputy to Crown when no Crown holder seated.',
   'Project-scoped');
```

---

## Deliverables

1. **Migration**: `platform/supabase/migrations/20260404000040_whatif_commissions_and_founder_dashboard.sql`
2. **React page**: `platform/src/pages/staff/FounderContactDashboard.tsx`
3. **Edge functions**: `sync-google-calendar` + extend `moneypenny-ai-draft`
4. **OAuth flow**: Google Calendar auth for Founder account
5. **Seed data**: 6 starter commission templates
6. **Commission acceptance automation**: routing updates, Red Carpet activation, notifications
7. **Verification**: issue a test commission, verify all platform state updates fire

---

## Dependencies / Context

- **Innovation #2150**: `BISHOP_DROPZONE/INNOVATION_2150_WHATIF_COMMISSIONS_B076.md`
- **Template**: `BISHOP_DROPZONE/WHATIF_COMMISSION_TEMPLATE_B076.md`
- **Existing calendar infra**: `platform/src/lib/calendarSync.ts`, `calendar-sync-commerce` function, `useCalendarSync` hook
- **MoneyPenny**: `platform/supabase/functions/moneypenny-ai-draft/index.ts`
- **Treasure Map system**: existing
- **Red Carpet system**: existing (`redCarpetRecipients.ts`)
- **47 Factor-y Makers**: `maker_spotlights` table + `productionRunDraft.ts`

*Knight: execute end-to-end. This is Founder-workflow-critical for next phase of outreach. FOR THE KEEP.*
