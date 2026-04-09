# Knight Session 161 — Pawn Compliance Polish + Guild Clarification

**Dispatched by:** Bishop (Foreman) | **Session:** B043 | **Date:** March 29, 2026
**Priority:** HIGH — Legal compliance improvements, zero ambiguity
**Estimated scope:** 2-3 hours, all small edits across existing files

---

## CONTEXT

Pawn completed 5 legal deliverables reviewing K153-K157 code. Most architecture is correct — Pawn flagged specific language softening and disclosure additions that Knight needs to patch. These are small edits with big risk reduction. Also includes one Cephas article clarification from Bishop's source audit.

---

## FEATURE A: Howey Language Softening (dispatchGuardrails.ts)

**File:** `src/lib/dispatchGuardrails.ts`

### A1. Add `#ad` disclosure to Battery Dispatch prefill content

**What:** When Battery Dispatch prefills social media content for sharing challenges or promotions, the prefilled text must include `#ad` and a short disclosure: "I earn Marks for sharing — this is incentivized content."

**Where:** The `adaptContentForPlatform()` function (line 63-75) already appends disclosure tags. Verify that ALL campaign types in TheBattery.tsx (little-red-hen, opening-gambit, grassroots-intelligence) pass disclosure tags when content is promotional.

**Check:** In `src/components/TheBattery.tsx`, the ARM/FIRE handler (lines 104-164) — ensure `disclosureTags: ['#ad', '#sponsored']` is passed for ALL campaign types, not just some.

### A2. Add MLM-prevention words to ALL platform avoidWords

**What:** The `DISCLOSURE_TEMPLATES` object (line 173+) has `avoidWords` for LinkedIn, YouTube, and Substack. Add these words to ALL three platforms if not already present:
- 'downline', 'ground floor', 'unlimited earning', 'guaranteed', 'will earn', 'life-changing income', 'join my team', 'financial freedom', 'residual income'

**Where:** Lines 176, 181, 185 — the `avoidWords` arrays for linkedin, youtube, substack.

**Verify:** LinkedIn already has most of these (line 176). YouTube and Substack only have the short list. Expand YouTube and Substack to match LinkedIn's full list.

---

## FEATURE B: Guest Wallet Disclaimers (ChallengePage.tsx)

**File:** `src/pages/ChallengePage.tsx`

### B1. Add disclaimer text to GuestParticipantCard

**What:** Add a legal disclaimer below the "Create Guest Wallet & Participate" button explaining:
- Guest Marks are non-transferable
- Guest Marks cannot be converted to cash
- Guest Marks expire after 90 days if unclaimed
- Marks are cooperative effort-recognition tokens, not securities

**Where:** After line 586 (after the Button closing tag), before the "Already have an account?" section (line 587), add:

```tsx
<p className="text-[10px] text-muted-foreground/60 leading-relaxed">
  Guest Marks are non-transferable cooperative effort-recognition tokens.
  They cannot be sold, traded, or converted to cash. Marks held in a Guest
  Wallet expire after 90 days. To claim Marks permanently, sign up for a
  $5/year membership. Marks are not securities, equity, or investment
  contracts of any kind.
</p>
```

### B2. Add disclaimer to post-creation confirmation

**What:** After guest wallet is created (the "submitted" state, lines 527-542), add similar disclaimer below the "Become a Member" button:

**Where:** After line 539 (after the Button), before the CardContent closing tag, add:

```tsx
<p className="text-[10px] text-muted-foreground/60 leading-relaxed mt-2">
  Guest Marks are non-transferable and expire in 90 days.
  They are cooperative effort-recognition tokens, not securities or cash equivalents.
</p>
```

---

## FEATURE C: Rename "Safe Harbor" Heading (BackerElectionPage.tsx)

**File:** `src/pages/BackerElectionPage.tsx`

### C1. Rename heading

**What:** Change "SEC Safe Harbor Notice" to "Legal Notice — Platform Credits Are Not Securities"

**Why:** "Safe Harbor" implies SEC approval/protection that doesn't exist. The content is a Howey test disavowal, not an actual SEC safe harbor filing. Pawn flagged this as misleading.

**Where:** Line 224:
- OLD: `<p className="font-medium text-xs text-foreground">SEC Safe Harbor Notice — Platform Credits Are Not Securities</p>`
- NEW: `<p className="font-medium text-xs text-foreground">Legal Notice — Platform Credits Are Not Securities</p>`

---

## FEATURE D: Guild Article Clarification (Cephas Registry)

### D1. Add Guild exclusivity sentence to article

**What:** The "Why Start a Guild?" article needs one clarifying sentence about Guild vs Tribe exclusivity.

**Where:** Find the `cephas_content_registry` row with `slug = 'why-start-a-guild'` and add this sentence to the `content_markdown` field, in the introduction or first section:

> "A member may belong to one Guild at a time (professional focus) but many Tribes simultaneously (personal connections)."

If the content_markdown is NULL (stored as file reference), update `CEPHAS_ARTICLE_WHY_START_A_GUILD.md` in BISHOP_DROPZONE instead and re-seed.

---

## FEATURE E: FL Compliance Monitor Table (NEW)

### E1. Create fl_compliance_monitor table

**What:** New migration for Florida Deceptive and Unfair Trade Practices Act (FDUTPA) compliance monitoring.

**Migration name:** `20260329000009_fl_compliance_monitor.sql`

```sql
-- FL FDUTPA Compliance Monitor
-- Tracks promotional content for state consumer protection compliance

CREATE TABLE IF NOT EXISTS fl_compliance_monitor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id UUID REFERENCES member_scheduled_posts(id),
  platform TEXT NOT NULL,
  content_preview TEXT,
  flagged_words TEXT[],
  disclosure_present BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'clean', 'flagged', 'remediated')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fl_compliance_monitor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage compliance" ON fl_compliance_monitor
  FOR ALL USING (is_admin());

CREATE INDEX idx_fl_compliance_status ON fl_compliance_monitor(status);
CREATE INDEX idx_fl_compliance_dispatch ON fl_compliance_monitor(dispatch_id);
```

### E2. Add participant_state column to challenge_completions

**What:** Track participant state (guest vs member) on challenge completions for compliance reporting.

Add to same migration:

```sql
ALTER TABLE challenge_completions
  ADD COLUMN IF NOT EXISTS participant_state TEXT DEFAULT 'member'
    CHECK (participant_state IN ('member', 'guest', 'anonymous'));
```

---

## DEPLOY CHECKLIST

1. [ ] Feature A: dispatchGuardrails.ts — expand avoidWords on YouTube/Substack templates
2. [ ] Feature A: TheBattery.tsx — verify all campaign types pass disclosure tags
3. [ ] Feature B: ChallengePage.tsx — add guest wallet disclaimers (2 locations)
4. [ ] Feature C: BackerElectionPage.tsx — rename "Safe Harbor" heading
5. [ ] Feature D: Guild article — add exclusivity clarification sentence
6. [ ] Feature E: New migration — fl_compliance_monitor + participant_state column
7. [ ] `supabase db push` — push migration
8. [ ] Verify all edits in dev preview
9. [ ] Deploy to all 8 Firebase targets

---

## DO NOT

- Do NOT change any economic mechanics (Cost+20%, 83.3%, one-way valve)
- Do NOT modify the Howey test analysis content — only rename the heading
- Do NOT add any new features beyond what's listed here
- Do NOT use prohibited financial terms (invest, equity, shares, dividends, ROI, crypto, blockchain)

---

## CANONICAL NUMBERS (verify at deploy)
- Innovation count: 2,062 (pending Rook extraction → ~2,080+)
- Production systems: 30
- Entity: Liana Banyan Corporation, EIN 41-2797446, Wyoming C-Corp
