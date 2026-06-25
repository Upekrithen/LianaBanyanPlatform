# KNIGHT YOKE · Ceros Technology Site + Email · BP084

**Session:** BP084
**Date:** 2026-06-15
**Founder ratify:** DIRECT — Ceros Technology, LLC site stand-up. Subsidiary of Upekrithen, LLC. Engineering studio for Liana Banyan cooperative substrate.

**Tagline (Founder ratified verbatim):** *"Ceros Technology architects and maintains the open cooperative substrate that powers Liana Banyan; Actively Recruiting."* — "Actively Recruiting" links to Bounty Posters.

---

## 🩸 HARD BINDING — Sonnet 4.6 SEGs only

**USE Sonnet 4.6 SEGs FOR ALL WORK. DO NOT USE COMPOSER 2.5 OR ANY OTHER MODEL.**

Every SEG `model: 'sonnet'`. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## Stack decision

**Hugo static site → Firebase Hosting target `cerostechnology` → DNS via Squarespace.**

Same stack Founder already masters via Cephas. Zero new infra. Same atomic-deploy.ps1 pattern reused.

---

## SEG-1 — Hugo scaffold (Sonnet 4.6 SEG)

**Path:** `C:\Users\Administrator\Documents\CerosTechnology\` (new sibling repo to LianaBanyanPlatform)

Hugo skeleton:
```
content/
  _index.md           # hero + tagline + 3-line pitch
  work/
    _index.md         # selected work (MnemosyneC platform)
    mnemosynec.md     # case study
    federation.md     # federation node frontier
  about/
    _index.md         # who we are + Upekrithen legal-footer
  contact/
    _index.md         # Tech@CerosTechnology.com only
layouts/
  _default/baseof.html
  index.html          # hero layout
  single.html         # case study layout
  partials/
    header.html
    footer.html       # legal footer with Upekrithen disclosure
static/
  fonts/
  img/
    ceros-mark.svg    # logo (Knight: design simple wordmark or commission later)
config.toml
firebase.json         # target cerostechnology → public/
```

---

## SEG-2 — Hero + tagline (Sonnet 4.6 SEG)

`content/_index.md` (verbatim, Founder-ratified):

```markdown
---
title: Ceros Technology
---

# Ceros Technology

**Ceros Technology architects and maintains the open cooperative substrate
that powers Liana Banyan; [Actively Recruiting](https://lianabanyan.com/bounties/).**

Engineering studio. Cooperative-class infrastructure.
Built for the long haul.
```

Hero design: dark background, large serif (or strong sans) for company name, italic tagline, primary CTA "Actively Recruiting" links to Bounty Posters at lianabanyan.com/bounties/.

---

## SEG-3 — Selected work page (Sonnet 4.6 SEG)

`content/work/_index.md` cites accomplishments earned through BP083:

- **MnemosyneC platform** — desktop AI with private substrate accumulator. 68/70 MMLU-Pro (97.1%) on consumer hardware, 14/14 domains GREEN, with self-policing Andon quarantines.
- **Federation Node Frontier** — Thorax-encrypted cooperative compute substrate (Capsules architecture). Machine-owner blind to renter contents; cooperative work-and-pay model.
- **MIC + Federated Andon + The Diagnosis + Just Add Salt** — four-pillar substrate architecture shipped 2026-06-15.
- **~431,865 canonicalized eblets** — proprietary verified-knowledge substrate accumulator.
- **Three-currency cooperative primitives** — Credits / Marks / Joules (substitution rails, no fiat coupling).
- **Patent provisional** — 34 innovation areas (status: in draft, ~50pp, target filing ~100pp).

Each line collapses to a case-study card with link to `/work/mnemosynec/` etc.

Per Founder canon: NO "© Ceros Technology" on the Liana Banyan public pages. Ceros credit lives here, on Ceros's own site, where it belongs.

---

## SEG-4 — About + legal footer (Sonnet 4.6 SEG)

`content/about/_index.md`:

```markdown
---
title: About
---

# About Ceros Technology

Founded by Liana Banyan. Engineering studio focused on cooperative-class
infrastructure — substrate primitives that members own, hardware that
members run, software licensed under terms that don't extract.

R&D partner to Liana Banyan Corporation.

Hiring senior engineers, CTO candidates, and partner shops.
[See open positions →](https://lianabanyan.com/bounties/)
```

`layouts/partials/footer.html` legal footer (small text, bottom of every page):

```html
<footer>
  <p class="legal">
    © 2026 Ceros Technology, LLC. All rights reserved.
    Ceros Technology, LLC is a subsidiary of Upekrithen, LLC.
  </p>
  <p class="contact">
    <a href="mailto:Tech@CerosTechnology.com">Tech@CerosTechnology.com</a>
  </p>
</footer>
```

---

## SEG-5 — Contact page (Sonnet 4.6 SEG)

`content/contact/_index.md`:

```markdown
---
title: Contact
---

# Contact

For engineering inquiries, partnerships, hiring:

**[Tech@CerosTechnology.com](mailto:Tech@CerosTechnology.com)**

For Liana Banyan member services or product questions, see
[lianabanyan.com](https://lianabanyan.com).
```

No phone, no address (per Founder direct: phone stays off the site).

---

## SEG-6 — Firebase target + deploy (Sonnet 4.6 SEG)

`firebase.json`:
```json
{
  "hosting": [
    {
      "target": "cerostechnology",
      "public": "public",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "headers": [
        { "source": "**", "headers": [{ "key": "Strict-Transport-Security", "value": "max-age=31556926" }] }
      ]
    }
  ]
}
```

`firebase target:apply hosting cerostechnology ceros-technology` (Firebase project site ID — Knight: confirm or create).

Deploy via atomic-deploy pattern. Sharp: `curl -sI https://ceros-technology.web.app/` returns HTTP/1.1 200 OK with hero body.

---

## SEG-7 — Custom domain wiring (Bishop-relayed Founder action)

**Founder DNS steps (NOT Knight-executable):**

1. Squarespace DNS panel for `cerostechnology.com` → add A records pointing to Firebase hosting IPs (Firebase provides — typically `199.36.158.100`)
2. Firebase Console → Hosting → Add custom domain → `cerostechnology.com` → verify TXT challenge
3. Add `www.cerostechnology.com` CNAME → `cerostechnology.com`

After SSL provisioning (~24h): `curl -sI https://cerostechnology.com/` returns HTTP/1.1 200 OK.

---

## SEG-8 — Google Workspace setup (Bishop-relayed Founder action)

Tech@CerosTechnology.com via Google Workspace ($6/user/month):

1. Sign up: workspace.google.com → Business Starter
2. Domain: cerostechnology.com (verify via TXT)
3. Add MX records at Squarespace DNS:
   - `1 ASPMX.L.GOOGLE.COM`
   - `5 ALT1.ASPMX.L.GOOGLE.COM`
   - `5 ALT2.ASPMX.L.GOOGLE.COM`
   - `10 ALT3.ASPMX.L.GOOGLE.COM`
   - `10 ALT4.ASPMX.L.GOOGLE.COM`
4. Add SPF: TXT `v=spf1 include:_spf.google.com ~all`
5. Add DKIM after Workspace dashboard generates key
6. Add DMARC: TXT `_dmarc` → `v=DMARC1; p=quarantine; rua=mailto:Tech@CerosTechnology.com`
7. Create user `Tech@CerosTechnology.com` in Workspace Admin

Knight: write the exact DNS records (with provided IPs/keys) into a card at `C:\Users\Administrator\Documents\CerosTechnology\DNS_SETUP_CARD.md` so Founder pastes-and-saves at Squarespace.

---

## Truth-Always Sharps

- Sharp 1: Hugo build succeeds, 0 errors
- Sharp 2: `firebase deploy --only hosting:cerostechnology` returns success
- Sharp 3: `curl -sI https://ceros-technology.web.app/` HTTP/1.1 200, body contains "Ceros Technology architects"
- Sharp 4: Body contains "Actively Recruiting" linking to lianabanyan.com/bounties/
- Sharp 5: Footer contains "© 2026 Ceros Technology, LLC" + "subsidiary of Upekrithen, LLC"
- Sharp 6: Body contains "Tech@CerosTechnology.com" mailto link
- Sharp 7: NO mention of "© Ceros Technology" on any Liana Banyan public page (Knight verifies via curl + grep on cephas.lianabanyan.com + lianabanyan.com)
- Sharp 8: DNS setup card exists at canonical path with EXACT records for Founder

---

## Yoke-return spec

SEG statuses + commits + 8 Sharps + Firebase project site ID + verbatim "Sonnet 4.6".

**FOR THE KEEP.**
