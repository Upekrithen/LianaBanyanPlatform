# Knight Session 169 — Cue Cards Full Flow (DD-3 CRITICAL PATH)
## Bishop B047 | March 29, 2026
## Dirty Dozen Item 3: End-to-End Cue Card Experience

---

## CONTEXT

DD-3 is the Founder's third critical gate item:

> "Can I make Cue Cards and send them to my family so that they can test it for me now, and can they when there do everything as designed, and sign up, and xray goggle corrections or questions on each page with feedback tool and the overlay? And can they purchase the SlottedTop and sign up to use their 3D printer to start making prototypes, and can they sign up to make a project and choose a cue card to send out to their social media so that people will preorder and fund their project?"

K116 built the Turn-Key Project Templates + Cue Card Campaign System. This session COMPLETES the full flow by wiring all the gaps: Cue Card creation by the Founder, sharing/distribution, recipient journey, X-Ray feedback overlay, and the full loop from "receive Cue Card" to "funded project."

Call `brief_me("Cue Card full flow: creation, sharing, recipient onboarding, X-Ray feedback, project creation loop")` first.

---

## DELIVERABLE 1: Cue Card Creator Interface (Founder Side)

### Page: `/dashboard/cue-cards/create`

The Founder (or any Captain) needs to be able to CREATE and SHARE a personalized Cue Card.

**Step 1 — Choose Template**
- Show all 7 Cue Card Campaign templates from `cue_card_campaigns` table
- Each as a visual card with icon, title, craft type
- "Custom Cue Card" option (blank template)
- Select one -> moves to Step 2

**Step 2 — Personalize**
- Recipient name (optional — "Hey [Name]!" vs generic)
- Personal message (textarea, 280 char max)
- Which product/project to feature (select from your Turn-Key projects, or "General Invite")
- Call-to-action: dropdown ["Check This Out", "Join My Project", "Start Your Own", "Come See What We Built"]
- Preview card in real-time (right side on desktop, below on mobile)

**Step 3 — Generate Share Links**
- Unique short URL: `lianabanyan.com/c/[code]` (6-char alphanumeric)
- QR code generated (use existing QR infra from Durin's Door / #1987)
- Share buttons: Copy Link, Text Message, Email, WhatsApp, Social Media
- "Download QR" button (PNG, print-ready 300dpi)
- "Print Cue Card" button (generates a PDF card with QR, message, CTA — single page, A6 size)

### Migration: `20260329200000_cue_card_shares.sql`

```sql
CREATE TABLE IF NOT EXISTS cue_card_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  campaign_id UUID REFERENCES cue_card_campaigns(id),
  short_code TEXT UNIQUE NOT NULL,
  recipient_name TEXT,
  personal_message TEXT,
  featured_project_id UUID REFERENCES turnkey_projects(id),
  call_to_action TEXT DEFAULT 'Check This Out',
  
  -- Tracking
  views INT DEFAULT 0,
  signups INT DEFAULT 0,
  projects_created INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cue_card_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creator manages own shares" ON cue_card_shares FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Anyone can view for landing" ON cue_card_shares FOR SELECT USING (true);

CREATE INDEX idx_cue_card_shares_code ON cue_card_shares (short_code);
```

---

## DELIVERABLE 2: Cue Card Landing Page (Recipient Side)

### Route: `/c/:shortCode`

When someone receives a Cue Card link and clicks it:

1. **Landing Page** — personalized:
   - If `recipient_name`: "Hey [Name]! [Creator Name] sent you this."
   - Personal message displayed in a handwritten-style callout
   - Featured project card (if linked) with matched funding bar + Early Adopter slots
   - Big CTA button matching the `call_to_action` text
   - Platform overview section: "What is Liana Banyan?" with key stats (2,099 innovations, 161 Crown Jewels, 31 production systems)
   - "Explore as Ghost" option (no signup required — DD-5 ghost flow)

2. **Increment view counter** on page load

3. **Journey Fork:**
   - "Join [Creator]'s Project" → `/projects/[slug]` (direct to project backing)
   - "Start Your Own Project" → `/cue-cards/campaigns` (Cue Card library)
   - "Explore First" → Ghost mode entry (browse freely)
   - "Sign Up" → membership gate ($5/year)

4. **Track attribution:** When recipient signs up or creates a project, link back to this Cue Card share for Marks attribution to creator

---

## DELIVERABLE 3: X-Ray Feedback Overlay

### The X-Ray Goggle System

On EVERY page, members can activate the X-Ray overlay to submit feedback, corrections, or questions about what they see.

**Toggle:** Persistent floating button (bottom-right, below scroll) — goggles icon. Click to activate X-Ray mode.

**In X-Ray mode:**
- Page gets a subtle green tint overlay (10% opacity)
- Every interactive element gets a highlight border on hover
- Click anywhere on the page to drop a feedback pin
- Feedback pin opens a compact form:
  - Category: [Bug, Question, Suggestion, Correction, Praise] (radio buttons)
  - Text (textarea, 500 char max)
  - Screenshot capture (optional — use canvas API to capture viewport around pin location)
  - "Submit" button
- Pin stays visible with category-colored dot after submission
- Other users' pins are NOT visible (private to submitter + Founder)

### Migration: `20260329200001_xray_feedback.sql`

```sql
CREATE TABLE IF NOT EXISTS xray_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  page_url TEXT NOT NULL,
  page_title TEXT,
  category TEXT NOT NULL CHECK (category IN ('bug', 'question', 'suggestion', 'correction', 'praise')),
  message TEXT NOT NULL,
  pin_x FLOAT, -- percentage from left
  pin_y FLOAT, -- percentage from top
  screenshot_url TEXT,
  viewport_width INT,
  viewport_height INT,
  user_agent TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved', 'wontfix')),
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE xray_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users submit own feedback" ON xray_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own feedback" ON xray_feedback FOR SELECT USING (auth.uid() = user_id);
-- Founder sees all (add admin policy based on existing admin check pattern)
```

### Components:
- `XRayToggle.tsx` — floating button, placed in App.tsx layout (always present)
- `XRayOverlay.tsx` — the overlay mode with pin-drop and form
- `XRayFeedbackForm.tsx` — compact form at pin location
- `XRayAdminPanel.tsx` — Founder view of all feedback, filterable by page/category/status

### Admin Panel: `/dashboard/xray-feedback`
- Table of all feedback with page, category, message, status
- Filter by: page URL, category, status (new/reviewed/resolved)
- Click to see pin on the actual page (open in new tab with ?xray_pin=[id] to highlight)
- Resolve/wontfix buttons with resolution notes

---

## DELIVERABLE 4: Cue Card Dashboard (Creator View)

### Page: `/dashboard/cue-cards`

Show all Cue Cards the creator has shared:
- Card list with: recipient name, campaign type, short code, created date
- Stats per card: views, signups, projects created
- Totals row: "Your Cue Cards have been viewed [X] times, generated [Y] signups, and started [Z] projects"
- "Create New Cue Card" button
- Marks earned from Cue Card attribution displayed

---

## DELIVERABLE 5: Attribution Chain

When a recipient acts on a Cue Card:
1. **Signs up** → increment `cue_card_shares.signups`, award creator +5 Marks
2. **Creates a project** → increment `cue_card_shares.projects_created`, award creator +15 Marks
3. **Backs a project** → award referring creator +2 Marks

Attribution stored on `member_profiles.attribution_source` (existing field) with value = `cuecard:[short_code]`

**ONE LEVEL ONLY.** If Person A sends a Cue Card to Person B, and Person B creates their own Cue Card and sends to Person C — Person A gets NO attribution from Person C. This is the ONE LEVEL rule. Never 2nd-degree.

---

## DELIVERABLE 6: Navigation + Wiring

### Add to Helm page (or Dashboard):
- "My Cue Cards" → `/dashboard/cue-cards`
- "Create Cue Card" → `/dashboard/cue-cards/create`
- "X-Ray Feedback" → `/dashboard/xray-feedback` (admin only)

### Add to UnifiedNavigation:
- "Send a Cue Card" in the member actions section

### App.tsx Routes:
```tsx
<Route path="/c/:shortCode" element={<CueCardLanding />} />
<Route path="/dashboard/cue-cards" element={<ProtectedRoute><CueCardDashboard /></ProtectedRoute>} />
<Route path="/dashboard/cue-cards/create" element={<ProtectedRoute><CueCardCreator /></ProtectedRoute>} />
<Route path="/dashboard/xray-feedback" element={<ProtectedRoute><XRayAdminPanel /></ProtectedRoute>} />
```

---

## DELIVERABLE 7: Update Canonical Stats

```typescript
// useCanonicalStats.ts
crownJewels: 161,     // was 151
patentApplications: 11, // was 10 (verify not already updated)
patentClaims: 2081,     // was 1511
```

---

## TESTING CHECKLIST (DD-3 Gate)

- [ ] Founder can create a Cue Card with personal message and project link
- [ ] Cue Card generates unique short URL and QR code
- [ ] Share buttons work (copy, text, email, WhatsApp)
- [ ] QR code downloads as print-ready PNG
- [ ] Recipient clicking link sees personalized landing page
- [ ] View counter increments on landing page load
- [ ] Recipient can: join project, start own project, explore as ghost, or sign up
- [ ] X-Ray toggle appears on every page (floating button)
- [ ] X-Ray mode allows pin-drop feedback with category + message
- [ ] Feedback saved to DB with page URL and pin coordinates
- [ ] Admin can view all feedback at /dashboard/xray-feedback
- [ ] Cue Card dashboard shows stats (views, signups, projects)
- [ ] Attribution chain awards Marks correctly (ONE LEVEL ONLY)
- [ ] Full loop: Create Cue Card -> Send to family -> They click -> They sign up -> They start a project -> They send their own Cue Card
- [ ] Crown Jewels stat reads 161 everywhere
- [ ] All 8 Firebase targets deployed

---

## SEC RULES
- No securities language anywhere
- Credits are prepaid service access
- Cost+20% is exact (83.3% to provider)
- Sponsorship Marks are ONE LEVEL ONLY
- Credits NEVER cash out to fiat

## CRITICAL RULES
- Hugo is RELIC. All content from DB via React SPA.
- Helm = member's personal space. Bridge = project control panel.
- Entity: Liana Banyan Corporation, Wyoming C-Corp.

---

**FOR THE KEEP.**
