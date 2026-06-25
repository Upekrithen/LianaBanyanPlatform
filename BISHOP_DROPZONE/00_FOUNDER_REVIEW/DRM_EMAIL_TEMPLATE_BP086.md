# DrM Email Template · BP086 · Pre-staged for SEG-F6

**Status:** FOUNDER_REVIEW  
**Origin:** BP086 Bishop Dispatch · Sonnet 4.6 SEG  
**Sender:** `DrM@mnemosynec.org`  
**Trigger:** "Enter Email to Share To" → Share button on `mnemosynec.ai`  
**Date staged:** 2026-06-18

---

## Variant A — Playful / Brand-forward

### Subject

```
Someone wanted you to meet Dr. Mnemosynec
```

---

### Plain Text

```
From: DrM@mnemosynec.org
Subject: Someone wanted you to meet Dr. Mnemosynec

Hi there,

{{sender_name}} thought you'd enjoy meeting me.

I'm Dr. Mnemosynec: a cooperative AI that remembers your work across sessions, vendors, and tools. Not a chatbot. Not another subscription that evaporates. Memory, powered by you.

The base tier is free. Forever. No credit card. You join, I start keeping track.

Join at base · free, forever:
https://mnemosynec.org/

Looking forward to working with you.

Dr. Mnemosynec
MnemosyneC.org
Memory, powered by you.

---
Sharer code: {{sharer_code}}
Sent because {{sender_name}} entered your email to share. We don't keep your address. Not a list.
Reply STOP to never receive again from us.
```

---

### HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Someone wanted you to meet Dr. Mnemosynec</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: Georgia, serif; }
    .wrap { max-width: 560px; margin: 40px auto; background: #ffffff; padding: 40px 48px; border-top: 4px solid #1a1a2e; }
    h1 { font-size: 22px; color: #1a1a2e; margin: 0 0 24px; }
    p { font-size: 16px; line-height: 1.7; color: #333; margin: 0 0 18px; }
    .cta { display: inline-block; margin: 8px 0 28px; padding: 14px 28px; background: #1a1a2e; color: #ffffff; text-decoration: none; font-size: 15px; letter-spacing: 0.03em; }
    .sig { font-size: 14px; color: #555; border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 32px; }
    .footer { font-size: 12px; color: #999; margin-top: 28px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Hi there,</h1>
    <p><strong>{{sender_name}}</strong> thought you'd enjoy meeting me.</p>
    <p>I'm Dr. Mnemosynec: a cooperative AI that remembers your work across sessions, vendors, and tools. Not a chatbot. Not another subscription that evaporates. Memory, powered by you.</p>
    <p>The base tier is free. Forever. No credit card. You join, I start keeping track.</p>
    <a href="https://mnemosynec.org/" class="cta">Join at base · free, forever</a>
    <div class="sig">
      Dr. Mnemosynec<br>
      <a href="https://mnemosynec.org/" style="color:#1a1a2e;">MnemosyneC.org</a><br>
      <em>Memory, powered by you.</em>
    </div>
    <div class="footer">
      Sharer code: {{sharer_code}}<br>
      Sent because {{sender_name}} entered your email to share. We don't keep your address. Not a list.<br>
      Reply STOP to never receive again from us.
    </div>
  </div>
</body>
</html>
```

---

---

## Variant B — Sober / Receipts-forward

### Subject

```
Someone shared a working AI memory model with you
```

---

### Plain Text

```
From: DrM@mnemosynec.org
Subject: Someone shared a working AI memory model with you

Hi,

Your friend {{sender_name}} thought you'd want to see this.

MnemosyneC is a cooperative AI platform with a verifiable track record:
· 97.1% MMLU-Pro on consumer hardware
· 22+ USPTO provisional patents filed under Pledge #2260 cooperative commons
· Base tier: free, no credit card required

This is not a pitch. The proofs are public. Check them yourself.

See the proofs:
https://mnemosynec.org/proofs/

Dr. Mnemosynec · MnemosyneC.org
Cooperative AI · Persistent Memory · Open Receipts

---
Sharer code: {{sharer_code}}
Sent because {{sender_name}} entered your email to share. We don't keep your address. Not a list.
Reply STOP to never receive again from us.
```

---

### HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Someone shared a working AI memory model with you</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: 'Courier New', monospace; }
    .wrap { max-width: 560px; margin: 40px auto; background: #ffffff; padding: 40px 48px; border-left: 4px solid #2d6a4f; }
    h1 { font-size: 18px; color: #1a1a1a; margin: 0 0 20px; font-weight: normal; letter-spacing: 0.02em; }
    p { font-size: 15px; line-height: 1.75; color: #333; margin: 0 0 16px; }
    ul { padding-left: 0; list-style: none; margin: 0 0 20px; }
    ul li { font-size: 15px; line-height: 1.7; color: #333; padding: 2px 0; }
    ul li::before { content: "· "; color: #2d6a4f; }
    .cta { display: inline-block; margin: 8px 0 28px; padding: 12px 26px; background: #2d6a4f; color: #ffffff; text-decoration: none; font-size: 14px; letter-spacing: 0.04em; font-family: 'Courier New', monospace; }
    .sig { font-size: 13px; color: #555; border-top: 1px solid #e0e0e0; padding-top: 18px; margin-top: 28px; line-height: 1.8; }
    .footer { font-size: 11px; color: #aaa; margin-top: 24px; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Hi,</h1>
    <p>Your friend <strong>{{sender_name}}</strong> thought you'd want to see this.</p>
    <p>MnemosyneC is a cooperative AI platform with a verifiable track record:</p>
    <ul>
      <li>97.1% MMLU-Pro on consumer hardware</li>
      <li>22+ USPTO provisional patents filed under Pledge #2260 cooperative commons</li>
      <li>Base tier: free, no credit card required</li>
    </ul>
    <p>This is not a pitch. The proofs are public. Check them yourself.</p>
    <a href="https://mnemosynec.org/proofs/" class="cta">See the proofs</a>
    <div class="sig">
      Dr. Mnemosynec · <a href="https://mnemosynec.org/" style="color:#2d6a4f;">MnemosyneC.org</a><br>
      Cooperative AI · Persistent Memory · Open Receipts
    </div>
    <div class="footer">
      Sharer code: {{sharer_code}}<br>
      Sent because {{sender_name}} entered your email to share. We don't keep your address. Not a list.<br>
      Reply STOP to never receive again from us.
    </div>
  </div>
</body>
</html>
```

---

---

## Variant C — Just Add Salt / Inequality Trinity

### Subject

```
Free WITH Substrate > Flagship WITHOUT Substrate
```

---

### Plain Text

```
From: DrM@mnemosynec.org
Subject: Free WITH Substrate > Flagship WITHOUT Substrate

Free WITH Substrate > Flagship WITHOUT Substrate.
Memory that persists > intelligence that forgets.
Cooperative commons > vendor lock-in.

{{sender_name}} wanted you to see this.

I'm Dr. M. I run on MnemosyneC: a cooperative AI substrate that keeps your work alive across tools, vendors, and sessions. The base tier is free. The math is the marketing.

Check my math. Prove it yourself.

Try it free:
https://mnemosynec.org/

Dr. M
Crewman #6's First Mate
MnemosyneC.org

---
Sharer code: {{sharer_code}}
Sent because {{sender_name}} entered your email to share. We don't keep your address. Not a list.
Reply STOP to never receive again from us.
```

---

### HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Free WITH Substrate > Flagship WITHOUT Substrate</title>
  <style>
    body { margin: 0; padding: 0; background: #0d0d0d; font-family: Georgia, serif; }
    .wrap { max-width: 560px; margin: 40px auto; background: #111827; padding: 40px 48px; }
    .trinity { font-size: 15px; line-height: 2.0; color: #e2e8f0; margin: 0 0 28px; font-style: italic; border-left: 3px solid #6366f1; padding-left: 18px; }
    p { font-size: 16px; line-height: 1.75; color: #cbd5e1; margin: 0 0 18px; }
    strong { color: #e2e8f0; }
    .hook { font-size: 16px; color: #94a3b8; font-style: italic; margin: 0 0 24px; }
    .cta { display: inline-block; margin: 8px 0 28px; padding: 14px 28px; background: #6366f1; color: #ffffff; text-decoration: none; font-size: 15px; letter-spacing: 0.04em; }
    .sig { font-size: 13px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 18px; margin-top: 28px; line-height: 1.8; }
    .footer { font-size: 11px; color: #475569; margin-top: 24px; line-height: 1.7; }
    a { color: #818cf8; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="trinity">
      Free WITH Substrate &gt; Flagship WITHOUT Substrate.<br>
      Memory that persists &gt; intelligence that forgets.<br>
      Cooperative commons &gt; vendor lock-in.
    </div>
    <p><strong>{{sender_name}}</strong> wanted you to see this.</p>
    <p>I'm Dr. M. I run on MnemosyneC: a cooperative AI substrate that keeps your work alive across tools, vendors, and sessions. The base tier is free. The math is the marketing.</p>
    <p class="hook">Check my math. Prove it yourself.</p>
    <a href="https://mnemosynec.org/" class="cta">Try it free</a>
    <div class="sig">
      Dr. M<br>
      Crewman #6's First Mate<br>
      <a href="https://mnemosynec.org/">MnemosyneC.org</a>
    </div>
    <div class="footer">
      Sharer code: {{sharer_code}}<br>
      Sent because {{sender_name}} entered your email to share. We don't keep your address. Not a list.<br>
      Reply STOP to never receive again from us.
    </div>
  </div>
</body>
</html>
```

---

---

## Template Variables (all variants)

| Placeholder | Source | Notes |
|---|---|---|
| `{{sender_name}}` | Supabase user profile display name | Fallback: "A friend" if null |
| `{{sharer_code}}` | SEG-F6 generates at send time | 4-char alphanumeric, stored in share_events table for audit |

---

## Anti-Abuse Design Notes (for SEG-F6 implementation)

### Rate Limits (recommended)
- 1 send per IP per minute
- 10 sends per IP per day
- 100 sends per recipient email per day (prevents targeted harassment of a single address)

### DNS / Auth prerequisites · BLOOD FLAG
SPF, DKIM, and DMARC records MUST be configured on `mnemosynec.org` BEFORE first send. Without these, delivery rates crater and DrM looks like spam. Bishop follow-up required: verify DNS auth records are live before SEG-F6 deploys. Check via `dig TXT mnemosynec.org` + `dig TXT _dmarc.mnemosynec.org`.

### Sharer Code
Human-readable 4-char alphanumeric in every email body (e.g., "Sharer code: 7K9M"). Purpose: audit trail, proof-of-send for disputes, sender accountability without exposing full email addresses.

### One-Shot Send Hygiene
This is not a list. The footer says so. "Reply STOP" is anti-abuse hygiene, not CAN-SPAM list management. Log STOP replies in a `suppression_list` table; SEG-F6 checks before any send to that address.

### Forbidden Word Check (automated gate in SEG-F6)
Before any send, body text must pass: ABSENT from all variants: invest / equity / shares / ROI / dividends / returns / yield. SEG-F6 should run a regex gate at compose time.

---

## Founder Decision Required

1. Which variant ships first? (A / B / C / all three rotated)
2. Approve `{{sender_name}}` fallback text ("A friend" or something else)?
3. Sharer code format: 4-char alphanumeric confirmed, or prefer longer?
4. `/proofs/` page on `mnemosynec.org` — does it exist yet? Variant B links to it.
5. DNS auth records on `mnemosynec.org` confirmed live? (BLOOD prerequisite before F6 deploy)

---

*Staged by Sonnet 4.6 SEG · BP086 · §14+§16 BLOOD · 2026-06-18*
