# KNIGHT SESSION 134 — MoneyPenny Gatekeeper
## 4-Tier AI Receptionist for Inbound Contact Screening
**Innovation:** #2021 | **Bishop:** 035 | **Date:** March 27, 2026

---

## CONTEXT
MoneyPenny already exists as an SMS notification system (Twilio + Supabase edge function `moneypenny-sms`). This session extends her into a GATEKEEPER — an AI receptionist that screens inbound contacts, classifies them into 4 tiers, and routes appropriately.

The Founder's original vision: "What if Robert Herjavec wanted to talk?" Someone NOT on the invite list needs a way through. MoneyPenny is that way.

## DELIVERABLES

### Deliverable 1: Migration
Create `20260327000005_moneypenny_gatekeeper.sql`:

**Table: moneypenny_contacts**
- id UUID PK
- contact_name TEXT NOT NULL
- contact_email TEXT
- contact_phone TEXT
- organization TEXT
- tier INTEGER NOT NULL CHECK (tier IN (1,2,3,4))
  - 1 = Known (invite list)
  - 2 = Recognized (notable person/org, priority routing)
  - 3 = Unknown-Relevant (needs review)
  - 4 = Spam/Irrelevant (auto-decline)
- classification_reason TEXT — why MoneyPenny classified at this tier
- routed_to UUID REFERENCES profiles(id) — which Captain/Founder receives it
- status TEXT CHECK (status IN ('pending','routed','responded','declined','archived'))
- inbound_channel TEXT CHECK (channel IN ('email','sms','web_form','cephas'))
- message_content TEXT — the actual inbound message
- context_brief TEXT — MoneyPenny's analysis/summary
- priority BOOLEAN DEFAULT false
- created_at TIMESTAMPTZ DEFAULT now()
- responded_at TIMESTAMPTZ
- RLS: Captains see contacts routed to them. Founder sees all.

**Table: moneypenny_known_contacts** (the invite list)
- id UUID PK
- owner_id UUID REFERENCES profiles(id) NOT NULL — whose list
- contact_name TEXT NOT NULL
- contact_email TEXT
- contact_phone TEXT
- organization TEXT
- notes TEXT
- created_at TIMESTAMPTZ DEFAULT now()
- UNIQUE(owner_id, contact_email)
- RLS: owner only

**Table: moneypenny_recognition_rules**
- id UUID PK
- pattern_type TEXT CHECK (type IN ('name','email_domain','organization','keyword'))
- pattern_value TEXT NOT NULL — e.g., "herjavec", "@herjavecgroup.com", "Shark Tank"
- tier_override INTEGER CHECK (tier IN (1,2,3))
- notes TEXT — "Robert Herjavec — Upekrithen LLC interest only, NOT for LB"
- created_at TIMESTAMPTZ DEFAULT now()
- RLS: Founder only for now

### Deliverable 2: Hooks
Create `platform/src/hooks/useMoneyPennyGatekeeper.ts`:
- useInboundContacts(status?) — query moneypenny_contacts with optional status filter
- useContactDetail(id) — single contact with full context brief
- useKnownContacts() — manage the invite list (CRUD)
- useRespondToContact() — mark as responded, add response notes
- useDeclineContact() — mark as declined
- usePromoteContact() — move from tier 3/4 to tier 1/2 (add to known contacts)
- useRecognitionRules() — manage recognition patterns (Founder only)

### Deliverable 3: MoneyPenny Inbox Page
Create `platform/src/pages/MoneyPennyInbox.tsx` at `/moneypenny/inbox`:
- **Protected route** (Captain+ only)
- Tab layout: Pending | Routed | Responded | Declined | All
- Each contact card shows:
  - Tier badge (color-coded: T1 green, T2 blue, T3 yellow, T4 red)
  - Contact name + organization
  - Channel icon (email/sms/web/cephas)
  - Priority flag if applicable
  - Context brief (MoneyPenny's analysis)
  - Message preview (first 100 chars)
- Click → full detail view with:
  - Full message
  - MoneyPenny's classification reasoning
  - Action buttons: Respond | Decline | Promote to Known | Archive

### Deliverable 4: MoneyPenny Contact Form
Create `platform/src/pages/ContactMoneyPenny.tsx` at `/contact`:
- **PUBLIC** (no auth required — this is how strangers reach out)
- Clean, professional form:
  - Name (required)
  - Email (required)
  - Organization (optional)
  - Subject/Reason dropdown: Partnership, Press, Speaking, Investment Inquiry, General, Other
  - Message (required, max 2000 chars)
  - "Your message will be reviewed by our team" (MoneyPenny IS the team)
- On submit: creates moneypenny_contacts record with tier=3 (unknown-relevant)
- Confirmation: "Thank you for reaching out. You'll hear back within 48 hours."

### Deliverable 5: Known Contacts Manager
Create `platform/src/pages/MoneyPennyContacts.tsx` at `/moneypenny/contacts`:
- **Protected route** (Captain+ only)
- List view of known contacts with search
- Add/edit/remove contacts
- Import from existing data (if applicable)
- Each contact shows: name, email, org, notes, date added

### Deliverable 6: Routes + Navigation
Add to App.tsx:
- `/contact` — Public ContactMoneyPenny
- `/moneypenny/inbox` — Protected MoneyPennyInbox
- `/moneypenny/contacts` — Protected MoneyPennyContacts

Add to UnifiedNavigation.tsx:
- "MoneyPenny Inbox" under admin/captain section (MessageSquare icon)

### Deliverable 7: Canonical Stats
Update useCanonicalStats.ts:
- innovationCount: current → current (no new innovations this session — implementing #2021)
- productionSystems: 27 (MoneyPenny already counted — this extends her)

## RULES
- Credits NEVER cash out. One-way valve. Irrevocable.
- LB Card funded separately, NOT from Credits.
- No securities language. "Investment Inquiry" in dropdown is for RECEIVING such inquiries, not making them.
- C+20 constitutional floor.
- Robert Herjavec note: Upekrithen LLC ONLY. LB does NOT take VC.
- MoneyPenny SMS is already live (Twilio). This EXTENDS her, doesn't replace her.

## BUILD ORDER
1. Migration → 2. Hooks → 3. Contact Form (public) → 4. Inbox → 5. Known Contacts → 6. Routes → 7. Stats → Build → Deploy

FOR THE KEEP!
