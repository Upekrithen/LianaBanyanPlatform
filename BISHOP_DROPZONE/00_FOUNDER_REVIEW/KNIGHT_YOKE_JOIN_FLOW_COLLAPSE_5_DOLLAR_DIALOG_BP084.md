# KNIGHT YOKE · Join Flow Collapse · Single $5 Dialog · BP084

**Session:** BP084
**Date:** 2026-06-15
**Founder ratify:** DIRECT verbatim — *"It should not even come here. It should just open up a dialog box with credit card $5 Membership form - or redirect to it whatever is needed - so that they purchase it and then are right back where they wanted to be before having to join to see it. Simple. Turnkey. Easy. as few steps as possible."*

---

## 🩸 HARD BINDING — Sonnet 4.6 SEGs only

**USE Sonnet 4.6 SEGs FOR ALL WORK. DO NOT USE COMPOSER 2.5 OR ANY OTHER MODEL.**

Every SEG `model: 'sonnet'`. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## The bug (Founder screenshots 2026-06-15 18:57)

Three violations in one Join flow on `mnemosynec.ai/proofs/storm/`:

1. **Maybe-later** routes to gate page — WRONG, should inline-dismiss
2. **Join the Cooperative** green button routes to lianabanyan.com **"More Reasons"** page — WRONG, should never exist as a detour
3. **Bottom Join button** clicks → shows "processing" → does nothing — violates `feedback_every_click_visible_feedback_canon_bp078` HARD BINDING

This violates:
- BP078 every-click-visible-feedback canon (silent broken Join button)
- BP078 turnkey-conversion canon (Founder verbatim above)
- Intent capture at JOIN modal canon (`feedback_intent_capture_at_join_modal`) — the intent capture is supposed to be the ONLY detour, not "more reasons" pages

---

## Target behavior

**Gated page (e.g. `/proofs/storm/`)** → click `Join the Cooperative →` → **Stripe inline modal opens IMMEDIATELY in-place** (no navigation) with:
- $5 / year line item
- Three-option intent picker (per BP078 intent-capture canon) — inline in the modal, not a separate page
- Credit card form (Stripe Elements)
- Submit → on success → modal closes → page reloads with full content visible

**"Maybe later"** → modal dismisses inline, original gated state restored. No navigation.

ZERO detour pages. ZERO "more reasons" pages. ONE modal. THREE form fields.

---

## SEG-1 — Locate current Join handler (Sonnet 4.6 SEG)

Grep `mnemosynec.ai` + `lianabanyan.com` sources for the Join button handler. Likely paths:
- `Cephas\cephas-hugo\static\js\` (vanilla JS gate page)
- `Cephas\cephas-hugo\layouts\partials\` (Hugo partial for the gate card)
- `LianaBanyanPlatform\Cephas\cephas-hugo\public-mnemosynec\` (built output)
- Any embed of lianabanyan.com `marketplace` / "More Reasons" page

Report: file:line of current handler + what it currently does + where it routes.

---

## SEG-2 — Wire Stripe Checkout inline modal (Sonnet 4.6 SEG)

Use Stripe Checkout (server-redirect) or Stripe Elements (inline) — pick whichever lets us keep the user on the SAME PAGE.

**Recommended: Stripe Checkout in embedded mode** (`mode: 'embedded'`). Less custom UI work, fewer PCI surface concerns.

**Server endpoint** (Supabase Edge Function `create-checkout-session`):
- Input: `{intent: 'storm_test' | 'lean_ask' | 'other', return_url: <gated_page>}`
- Output: `{client_secret}` for embedded Checkout
- Stripe webhook on payment success → write member row to `members` table → email magic-link login

**Client embed:**
- Click `Join the Cooperative →` → fetch `/api/create-checkout-session` → mount Stripe embedded Checkout in modal overlay
- On Checkout `complete` event → close modal + reload current page (member now authenticated, gated content unlocks)

---

## SEG-3 — Inline intent capture (Sonnet 4.6 SEG)

Per `feedback_intent_capture_at_join_modal` BP078 canon — intent capture fires INSIDE the join flow, not before.

Add 3-option intent picker as Stripe Checkout custom field OR as a pre-checkout micro-step within the same modal:
- "I want to USE Mnemosyne for my own work"
- "I want to BUILD with Mnemosyne (developer / engineer)"
- "I want to CONTRIBUTE knowledge to the substrate"

Selection persists to member row.

---

## SEG-4 — Kill detour pages (Sonnet 4.6 SEG)

- Remove lianabanyan.com "Your Access Key" / "More Reasons" page from the Join click path (the page can still exist as `/marketplace/access-key` for direct-link visitors, but NO Join button anywhere routes there)
- Wire `Maybe later` to inline modal dismiss + state restore — NEVER navigate

---

## SEG-5 — Honor `every-click-feedback` canon (Sonnet 4.6 SEG)

The bottom Join button currently shows "processing" silently. After SEG-2 lands it should be deleted entirely (modal handles all flow). If kept for backup placement:
- Click → spinner + status text "Opening checkout…" (within 200ms)
- If checkout fails to load → visible red error toast, NOT silence
- Per BP078 canon: silence = broken by definition

---

## Truth-Always Sharps

- Sharp 1: From gated page, click Join → Stripe modal appears on SAME URL within 1s
- Sharp 2: Modal close (X or "Maybe later") restores gated state, no navigation
- Sharp 3: Successful $5 test payment via Stripe test card → modal closes → gated content visible
- Sharp 4: No request to `/marketplace/access-key` or any lianabanyan.com "More Reasons" page in network log
- Sharp 5: Browser DevTools shows zero silent clicks — every click produces visible feedback within 200ms

---

## Yoke-return spec

SEG statuses + commits + 5 Sharps with browser DevTools evidence + verbatim "Sonnet 4.6".

**FOR THE KEEP.**
