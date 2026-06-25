# SPEC: Join My Crew / Substrate Network Referral Feature
**Bishop SEG-BE · BP093 · Sonnet 4.6 · 2026-06-24**
**Status: STAGED FOR FOUNDER REVIEW — gates before Knight build**

---

## 1. Overview

"Join My Crew" is a seeding primitive embedded in the mnemosynec.org brochure that lets any visitor invite people to MnemosyneC and optionally link them as members of the inviter's Substrate Network. Two send modes exist: the default fires a referral email from Dr. MnemosyneC on the inviter's behalf (low friction, no email auth required); the opt-in mode sends from the inviter's own address and embeds their socceriHash node coordinate so new signups are attributed to the inviter's machine as their initial MIC. For every referred person who converts, the inviting member accrues toward Medallion/Sponsor/Influencer tier thresholds (one level of separation only, no cascade). This feature turns every satisfied user into a seeding agent, closes the attribution loop in Supabase, and provides the cooperative's first structured referral receipt trail.

---

## 2. UI: Where It Lives

The feature replaces and expands the existing "Share This" widget located immediately below the `Dr. MnemosyneC / Memory specialist` caption on the brochure hero section (index.html lines 922-970). The existing widget is a single-email form posting to the `share-from-mnemosynec` edge function with no attribution. The new widget occupies the same slot.

**Visual layout (prose description, no Hugo rendering required):**

```
[ Dr. MnemosyneC image ]
   Dr. MnemosyneC
   Memory specialist

+------------------------------------------+
|  JOIN MY CREW                            |
|                                          |
|  [Toggle: OFF = Dr. MnemosyneC sends     |
|           ON  = Send from my address ]   |
|                                          |
|  Your name / handle  [_______________]   |
|  (shown in message body, toggle-OFF only)|
|                                          |
|  Message  [textarea, pre-filled, edit]   |
|                                          |
|  Explainer  [textarea, pre-filled, edit] |
|  (includes mnemosynec.org link)          |
|                                          |
|  To: [email 1]  [+ Add another] (max 10) |
|      [email 2]                           |
|      ...                                 |
|                                          |
|  [  Send Invites --> ]                   |
|                                          |
|  (When toggle ON: "Your socceriHash      |
|  node address is embedded so recipients  |
|  can join your Substrate Network.")      |
+------------------------------------------+
```

On mobile, the widget stacks below the mascot image per the existing `@media (max-width: 600px)` breakpoint.

---

## 3. UI: Toggle Behavior

**Toggle OFF (default):**
- Label: "Send via Dr. MnemosyneC"
- Sender field renders: inviter name/handle input (used in email body attribution only, not verified)
- Email body reads: "[Name] thought you should see this."
- The sender address displayed to recipients is a noreply@mnemosynec.org domain address
- No socceriHash payload embedded
- No MIC designation triggered

**Toggle ON ("Become part of my Substrate Network"):**
- Label: "Send from my address / Join my Substrate Network"
- Sender field is replaced by: inviter's confirmed email display (requires the inviter to have provided and confirmed their email; if not, a prompt appears: "Confirm your email first to use this mode")
- Email body shifts to "Join My Crew" framing (see Section 4 for placeholder copy)
- The inviter's socceriHash is embedded as a machine-readable payload in the email footer (e.g. a signed URL query parameter: `?ref_node=<socceriHash>&ref_member=<uuid>`)
- Sending path: either SendGrid On-Behalf-Of (preferred) or mailto: handoff (fallback; see Section 5)
- Label below send button: "Your node address is embedded. Recipients who sign up join your Substrate Network."

**What changes visually on toggle:**
- Toggle OFF: Name/handle input visible; sender attribution line shows "(Sends from Dr. MnemosyneC)"
- Toggle ON: Name/handle hidden; sender confirmation line shows "(Sends from your address)"; Substrate Network explanation paragraph appears

---

## 4. UI: Form Fields

| Field | Toggle OFF | Toggle ON | Notes |
|---|---|---|---|
| Your name / handle | Visible, required | Hidden | Used in email body only |
| Message textarea | Pre-filled, editable | Pre-filled (different copy), editable | See placeholder copy below |
| Explainer textarea | Pre-filled, editable | Pre-filled, editable | Always contains mnemosynec.org link |
| Email list | Up to 10 addresses, one per line or add-another buttons | Same | Client-side validation: valid email format, deduplicate |
| Toggle | OFF / ON | same | |
| Send button | "Send Invites" | "Send Invites" | Disabled until at least 1 valid email |

**Placeholder copy (Founder ratifies before build):**

Toggle OFF message pre-fill:
> "I use MnemosyneC to give my AI a real memory. It works on your own computer, free, no account required. I thought you should see it."

Toggle ON message pre-fill:
> "I'm building out my Substrate Network on MnemosyneC. If you join through this link, you'll be part of my crew -- and that makes the whole network a little smarter for all of us."

Explainer (both modes, pre-filled):
> "MnemosyneC is a free, local-first AI memory layer. SHA-256 stamped. No cloud. No ads. Optionally join the cooperative for $5/year. Learn more at mnemosynec.org"

---

## 5. Backend: Email Send Infrastructure

**Two paths:**

### Path A -- Toggle OFF (Dr. MnemosyneC sender)
- Sender: `noreply@mnemosynec.org` (or `dr.mnemosynec@mnemosynec.org`)
- Service: **Resend** (recommended -- simpler API than SendGrid, flat fee, good deliverability, already works well with Supabase Edge Functions via fetch; if Founder has existing SendGrid account in use, use SendGrid instead to avoid two vendor relationships)
- Call: Supabase Edge Function `join-my-crew-send` (replaces or extends existing `share-from-mnemosynec`)
- Attribution: inviter name string embedded in body; referral row written to `referrals` table (Section 6)
- Loop: for each recipient email, one send + one referral row

### Path B -- Toggle ON (user as sender)
Two sub-options:

**B1 -- SendGrid/Resend On-Behalf-Of:**
- Email technically sent by Resend infrastructure but `From:` shows inviter's address
- Requires: inviter email confirmed (edge function checks `member_profiles.email_confirmed = true`)
- Deliverability risk: inviter's domain may not have SPF/DKIM for mnemosynec infrastructure
- Tradeoff: cleaner UX, no client dependency, but some spam filter risk on inviter side

**B2 -- mailto: handoff (client-side fallback):**
- Edge function returns pre-composed email body and recipient list
- Browser opens `mailto:` link with pre-filled To, Subject, Body
- User's own email client sends it
- Tradeoff: no server-side send confirmation, no guaranteed delivery tracking, no referral-sent timestamp until recipient signs up. Simple to build, zero vendor risk.

**Recommendation for v1:** Build B2 (mailto: fallback) first as the toggle-ON path. It removes all sender-auth complexity for v1. Edge function still records the referral row with `mode = substrate-network` and `sent_at = now()` before returning the mailto: payload. Upgrade to B1 (On-Behalf-Of) in v2 once Founder confirms sender domain setup.

---

## 6. Backend: Supabase Schema Additions

All SQL targets Postgres. No SQLite primitives.

### New table: `referrals`

```sql
CREATE TABLE referrals (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_member_id  uuid REFERENCES member_profiles(id) ON DELETE SET NULL,
  referrer_name_anon  text,                    -- toggle-OFF: unverified name string
  recipient_email     text NOT NULL,
  socceri_node_hash   text,                    -- toggle-ON only: inviter's socceriHash (SHA-512 hex)
  ref_member_uuid     uuid,                    -- toggle-ON only: inviter's member_profiles.id snapshot
  mode                text NOT NULL CHECK (mode IN ('dr-mnemosynec', 'substrate-network')),
  message_sent        text,
  explainer_sent      text,
  sent_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  signup_member_id    uuid REFERENCES member_profiles(id) ON DELETE SET NULL,
  signed_up_at        TIMESTAMPTZ,
  attribution_expired boolean NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_referrals_referrer    ON referrals (referrer_member_id, signed_up_at);
CREATE INDEX idx_referrals_recipient   ON referrals (recipient_email);
CREATE INDEX idx_referrals_signup      ON referrals (signup_member_id);
CREATE INDEX idx_referrals_mode_sent   ON referrals (mode, sent_at DESC);
```

### Additions to `member_profiles`

```sql
ALTER TABLE member_profiles
  ADD COLUMN IF NOT EXISTS referred_by_member_id   uuid REFERENCES member_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referred_by_referral_id uuid REFERENCES referrals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referrer_attribution_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tier_at_referral_signup text;   -- snapshot of inviter's tier at time of signup
```

`referrer_attribution_count` is maintained by the RPC below (not a generated column) to avoid complex triggers.

### RPC: `record_referral_signup`

```sql
CREATE OR REPLACE FUNCTION record_referral_signup(
  p_recipient_email   text,
  p_signup_member_id  uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_referral referrals%ROWTYPE;
BEGIN
  -- Find the most recent unexpired referral for this email
  SELECT * INTO v_referral
  FROM referrals
  WHERE recipient_email = p_recipient_email
    AND signup_member_id IS NULL
    AND attribution_expired = false
    AND sent_at > now() - INTERVAL '<N_DAYS> days'  -- N_DAYS = Founder-ratified attribution window
  ORDER BY sent_at DESC
  LIMIT 1;

  IF v_referral.id IS NULL THEN
    RETURN;  -- No qualifying referral found
  END IF;

  -- Link the signup
  UPDATE referrals
  SET signup_member_id = p_signup_member_id,
      signed_up_at     = now()
  WHERE id = v_referral.id;

  -- Stamp the new member's profile
  UPDATE member_profiles
  SET referred_by_member_id   = v_referral.referrer_member_id,
      referred_by_referral_id = v_referral.id,
      tier_at_referral_signup = (
        SELECT <tier_column>         -- column name TBD per SEG-BC findings
        FROM member_profiles
        WHERE id = v_referral.referrer_member_id
      )
  WHERE id = p_signup_member_id;

  -- Increment inviter's attribution count
  UPDATE member_profiles
  SET referrer_attribution_count = referrer_attribution_count + 1
  WHERE id = v_referral.referrer_member_id;
END;
$$;
```

### RLS sketch

```sql
-- referrals: referrer can see their own rows; service role can write
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY referrals_select_own ON referrals
  FOR SELECT TO authenticated
  USING (referrer_member_id = auth.uid());

CREATE POLICY referrals_insert_service ON referrals
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY referrals_update_service ON referrals
  FOR UPDATE TO service_role USING (true);
```

---

## 7. Logic: MIC Designation

When a user sends with toggle ON, their socceriHash (SHA-512 of their peer payload, hex-encoded, per BP087 `Keys and Engines` implementation) is embedded in the invite as a signed URL parameter: `?ref_node=<socceriHash>&ref_member=<uuid>`.

When the recipient installs MnemosyneC and launches for the first time, the installer or first-run flow reads the ref_node parameter (passed through the signup URL or stored in a browser cookie during signup). The recipient's local MnemosyneC instance sets the inviter's socceriHash as its initial MIC target for the first heartbeat cycle.

The MIC designation is soft: the new peer can rotate MIC freely after initial setup via existing MIC rotation / escalation cascade logic (per KNIGHT_MARATHON_SESSION_22_AMENDMENT_MIC_ROTATION_ESCALATION_CASCADE_BP091). The referrer relationship in `referrals` persists for attribution purposes regardless of subsequent MIC changes. MIC designation is an operational hint, not a permanent lock.

**If socceriHash is absent or invalid:** new peer initializes with default MIC selection logic (no referral MIC set).

---

## 8. Logic: Medallion/Sponsor/Influencer Thresholds

<SEG-BC OUTPUT INTEGRATION POINT>

The `referrer_attribution_count` column on `member_profiles` is the trigger metric. When it crosses thresholds defined by SEG-BC's findings, the inviter's tier escalates to Medallion, then Sponsor, then Influencer (names subject to Founder ratify with SEG-BC output).

Tier escalation is evaluated:
- On every call to `record_referral_signup`
- By a scheduled edge function or Supabase cron job (daily sweep for expiry + recalculation)

Thresholds, benefit descriptions, and whether the escalation is permanent or rolling-window are deferred to SEG-BC.

---

## 9. Logic: One-Level-of-Separation Rule

The referral chain is capped at exactly one level. If Member A invites Member B, and Member B later invites Member C:

- Member A gets attribution credit for B's signup (direct referral).
- Member A gets **zero** attribution credit for C's signup (second-level, blocked).
- Member B gets attribution credit for C's signup (direct referral for B).

This is enforced structurally: `record_referral_signup` only looks at the `referrals` table rows where `referrer_member_id` is a direct inviter. There is no recursive lookup, no upline walk, no tree traversal. The schema has no `parent_referrer_id` column and will never have one.

A comment in the RPC SECURITY DEFINER block documents this explicitly to prevent future drift.

---

## 10. Logic: Attribution Timestamps and Canonical Signup Window

A referral row qualifies for attribution only if the recipient signs up within N days of `sent_at`.

**Suggested default: 90 days.** Founder ratifies before build.

After the window expires:
- The `attribution_expired` column is set to `true` by a scheduled sweep job.
- The referral row is preserved for audit but no longer eligible for `record_referral_signup` attribution.
- If the recipient signs up after expiry, they sign up as an organic member with no referrer linked.

The sweep job runs once daily via Supabase pg_cron or an edge function on a cron schedule.

---

## 11. Surface: Bounty Poster Connection

When toggle ON is active, the invite email can optionally include a link to the inviter's city bounty poster (from SEG-BD's 12 Cities + NOIDS poster work). The "Join My Crew" email body can include a line:

> "Here's what we're building in [City]: [Bounty Poster Link]"

This is configured as an optional extra field in the form ("Include my city bounty poster link" checkbox, pre-filled if the inviter's city is detected from their member profile). The poster URL is passed to the edge function along with the message body and included in the email as a linked callout block.

For v1, this is a manual URL field (inviter pastes their poster link). Auto-detection from member_profiles city data is a v2 enhancement.

---

## 12. Open Questions for Founder

1. **Email sender for toggle ON:** On-Behalf-Of (Resend/SendGrid B1) or mailto: handoff (B2) for v1? Recommendation is B2 (mailto: handoff) for build simplicity.
2. **socceriHash format in invite URL:** Pass raw SHA-512 hex, or encode as base64url for shorter URLs? Does the installer already parse a ref_node parameter from a URL, or does this need to be built from scratch?
3. **Default message copy:** Are the placeholder texts in Section 4 approved, or does Founder want to draft the canonical pre-fills?
4. **Attribution window in days:** 90 days recommended. Founder ratifies.
5. **Threshold table:** Awaiting SEG-BC output. Does attribution count apply only when referred member becomes a paid $5/yr member, or does any signup (free install, no cooperative join) count?
6. **Tier benefit names:** Medallion / Sponsor / Influencer confirmed as the right names for this referral-tier track, or does SEG-BC use different naming?
7. **Referrer identity in toggle-OFF mode:** Is an unverified name/handle field acceptable, or should toggle-OFF require the inviter to be a logged-in member (member_profiles.id known)?
8. **MIC parameter delivery:** Does the recipient's socceriHash ref arrive via signup URL (browser-based flow), or via the MnemosyneC installer (CLI flag)? This changes where the parameter is read and stored.
9. **Resend vs SendGrid:** Does Founder have an existing Resend or SendGrid account for mnemosynec.org? Determines which service to wire.
10. **Bounty poster field in v1:** Include the optional poster link input in v1 form, or defer entirely to v2?
11. **Maximum email recipients:** 10 is the suggested cap. Is this the right limit? Any rate-limit concern at the edge function level?

---

## 13. Build Sequence

Proposed order for Knight when Founder gives go-ahead:

1. **Supabase schema migration** -- `referrals` table + `member_profiles` columns + `record_referral_signup` RPC + RLS policies + indexes
2. **Email infrastructure** -- wire Resend (or SendGrid) to `join-my-crew-send` edge function; replace existing `share-from-mnemosynec` or extend it
3. **UI form on brochure** -- replace existing Share This widget with new Join My Crew widget; client-side validation for up to 10 emails; toggle logic; mobile breakpoint
4. **Backend endpoint** -- edge function `join-my-crew-send`: receives form payload, writes referral row(s), dispatches emails (toggle-OFF) or returns mailto: payload (toggle-ON)
5. **Signup-side RPC linkage** -- call `record_referral_signup` during member account creation flow (wherever a new member_profiles row is inserted); read ref_node and ref_member from signup URL params if present
6. **Attribution expiry sweep** -- pg_cron or scheduled edge function; marks `attribution_expired = true` on rows past window
7. **Tier accrual logic** -- evaluate `referrer_attribution_count` against SEG-BC threshold table; update inviter's tier field when thresholds crossed
8. **Bounty poster integration** -- optional URL field in form; embed in email callout block (v1 = manual URL paste)

Estimated Knight build time for v1 (rough): **12-18 hours** of focused Marathon time across 2-3 sessions. Schema + edge function = 3-4 hrs. UI widget = 2-3 hrs. Signup linkage + sweep = 2-3 hrs. Tier accrual (pending SEG-BC) = 2-3 hrs. Integration test = 2-3 hrs.

---

## 14. Not in v1

The following are explicitly out of scope for the first build:

- MLM cascade (referrer of referrer attribution) -- structurally blocked by design
- A/B-testable explainer variants
- Multi-language email templates
- Auto-detection of inviter's city for bounty poster link
- SendGrid On-Behalf-Of sender mode (B1) -- deferred to v2
- Referral dashboard / leaderboard showing inviter how many signups they've generated
- Email open/click tracking (deliverability analytics)
- Referral code / short link alternative to email form

---

## Gadget Findings Summary

| Claim | Finding | Source |
|---|---|---|
| SOCCERI address format | SHA-512 of peer payload bytes, lowercase hex, per BP087 Keys and Engines | KNIGHT_YOKE_BLACK_MAMBA_KEYS_AND_ENGINES_FRAME_TO_FRAME_WILDFIRE_PROPAGATION_BP087_WAVE_4.md |
| MIC definition | Machine Initial Controller; staggered per peer count and capability; rotatable; shared via socceri/eblit/pheromone blips | KNIGHT_MARATHON_SESSION_22_AMENDMENT_MIC_ROTATION_ESCALATION_CASCADE_BP091.md |
| Existing referral schema | None found -- `referrals` table does not exist in live schema | Search across all .sql files BP093 |
| Existing share widget | Single-email form, no attribution, posts to `share-from-mnemosynec` edge function | index.html lines 923-970 |
| peer_presence columns | circle_of_influence, reputation, artifact_server_address exist; no referral columns | 20260620220301_peer_presence_circle_columns_BISHOP_APPLY.sql |
| SEG-BC threshold output | Not yet present in BISHOP_DROPZONE/00_FOUNDER_REVIEW | Directory scan BP093 |
| Medallion/Sponsor/Influencer model | Influence-not-profit, receipts not securities, no cash redemption | BACKER_BENEFITS_MEDALLIONS_JOULES_CODIFIED.md |

---

*Spec gates on Founder ratify before Knight build commences. No Hugo rendering, no Firebase deploy, no migration apply until Founder go-ahead.*

*SEG-BE · BP093 · For Alford.*
