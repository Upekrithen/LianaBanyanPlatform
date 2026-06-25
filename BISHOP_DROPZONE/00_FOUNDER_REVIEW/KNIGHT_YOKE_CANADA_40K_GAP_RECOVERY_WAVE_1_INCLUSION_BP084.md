# KNIGHT YOKE · Canada 40K Gap Recovery + Wave 1 Inclusion · BP084

**Session:** BP084
**Date:** 2026-06-15
**Founder ratify:** DIRECT — *"I need the Canada 40K gap to be filled. Also, dispatch SEG Teams of Detectives to find what we already did, because I feel like we already did it. both that and the under the hood. I'm generally right about such things. So yes task 9 do that."*

**Founder instinct verified by Detective TEAM:** half-right and honestly more.

---

## 🩸 HARD BINDING — Sonnet 4.6 SEGs only

**USE Sonnet 4.6 SEGs FOR ALL WORK. DO NOT USE COMPOSER 2.5 OR ANY OTHER MODEL.**

Every SEG `model: 'sonnet'`. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## Detective TEAM findings (Bishop relays)

**Artifact 1 — V02 article + Companion:** prose written INLINE in BP064.md (B113 session) at ~line 1710, never saved as standalone .md. RECOVERABLE from transcript.

**Artifact 2 — `canada-40k-integration.md` under-the-hood:** EXISTS at Stone Tablets path (8,347 bytes, 5/10/2026). Live Cephas `under-the-hood/` folder empty. RECOVERABLE by copy.

**V01 Rescue Fleet:** EXISTS at Stone Tablets (`Canada_40K_Rescue_Fleet.md`, 7,524 bytes). Earlier framing. Useful as fallback or companion.

---

## SEG-1 — Recover V02 + Companion from BP064 transcript (Sonnet 4.6 SEG)

**Source:** `C:\Users\Administrator\Documents\LianaBanyanKNIGHT\BP064.md` (or BP064.docx — convert with pandoc first if .docx). Start at line ~1710, read forward until the article text + companion are extracted.

**Recovery markers to find in transcript:**
- "Play/Stage" framing language
- "42,200" or "42200" in prose
- "Bill C-12" mention
- "June 30 deadline" mention
- "Yvaine" / "Mirror Mirror" / "Fairest of them All" section
- ~450-word companion piece (shorter, distinct from V02)

**Output paths (canonical):**
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\09_Articles\ARTICLE_CANADA_40K_PLAY_STAGE_V02.md`
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\09_Articles\ARTICLE_CANADA_40K_APRIL2026_COMPANION.md`

**Frontmatter for both:**
```yaml
---
title: "Canada 40K — You Have a Play. I Have a Stage."
date: 2026-04-23
status: founder-ratify-pending
class: news-response-letter
audience: displaced Canadian Start-Up Visa founders + tech press
recovered_from: BP064 transcript line ~1710 (originally written B113, never persisted as standalone file)
mimic-trunk-eligible: true
---
```

If the transcript text shows ambiguity / has redactions / is mid-conversation rather than a clean draft — DO NOT FABRICATE. Save what's literally there, flag missing sections as `<!-- TODO: complete from B113 conversation context -->`, and report in yoke-return that founder review is needed. Truth-Always.

---

## SEG-2 — Refresh V02 for current state (Sonnet 4.6 SEG)

The B113 transcript was April 2026. Now is June 2026 — Bill C-12 has received Royal Assent (2026-03-26). The article likely still references C-12 as pending. Update to past tense / "now in force." Keep the 42,200 number (still accurate per the Detective TEAM's findings).

Refresh the call-to-action footer:
- `lianabanyan.com/canada40k` (the React cue card page — already built)
- `Tech@CerosTechnology.com` (the new Ceros Technology hiring channel — directly relevant for displaced tech founders)
- Add reference to the BIGGEST Bounty Poster: `lianabanyan.com/bounties/mimic-trunks/` per [[canon-mimic-trunks-gate-and-tunnel-partner-cooperative-volume-benefits-bp084]]

Keep the Mirror Mirror / Yvaine framing if it's in the transcript. Hold to the original voice.

---

## SEG-3 — Restore under-the-hood page to live Cephas (Sonnet 4.6 SEG)

**Copy:**
```
FROM: C:\Users\Administrator\Documents\LianaBanyanOFFSITE\0 Stone Tablets Vault\Forager_Extractions_BP035\06_Hugo_Content\LianaBanyanPlatform\Cephas\cephas-hugo\content\under-the-hood\canada-40k-integration.md

TO:   C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content\under-the-hood\canada-40k-integration.md
```

After copy: Hugo build + deploy. Verify `https://cephas.lianabanyan.com/under-the-hood/canada-40k-integration/` returns HTTP/1.1 200 OK with body.

Also clean up the ghost directory at `LianaBanyanPlatform\static\cephas\under-the-hood\canada-40k-integration\` (empty dir, prior deploy artifact).

---

## SEG-4 — Create live Cephas appeal page (Sonnet 4.6 SEG)

The cephasIndex.json promises a URL `/cephas/letters/rescue-fleet/canada-40k-appeal` that currently 404s. Create the Hugo content file:

**Path:** `Cephas\cephas-hugo\content\letters\rescue-fleet\canada-40k-appeal.md`

Body: distillation of the V01 Rescue Fleet text (Stone Tablets has it intact at 7,524 bytes) — keep the original "Rescue Fleet" framing for this appeal version. The V02 Play/Stage is for op-ed publication; this Appeal is the broadcast call-to-displaced-founders.

After: Hugo build + deploy. Verify URL returns 200, not 404.

---

## SEG-5 — Confirm `lianabanyan.com/canada40k` route is wired (Sonnet 4.6 SEG)

The React cue card page at `LianaBanyanPlatform\platform\src\pages\cue-cards\Canada40K.tsx` is built and compiled. Verify:
- Route registered in React Router config
- `curl -sI https://lianabanyan.com/canada40k` returns HTTP/1.1 200 OK
- Body contains "Canada just canceled 40,000 startup visas"

If not wired, add to React Router. Build + deploy.

---

## SEG-6 — Mint Canada 40K campaign canon eblet (Sonnet 4.6 SEG)

**Path:** `Asteroid-ProofVault\state\eblets\CANON\canon_canada_40k_rescue_fleet_campaign_bp084.eblet.md`

Capture:
- Bill C-12 (2026-03-26 Royal Assent) — cancellation authority over ~42,200 Start-Up Visa applications
- Campaign artifacts inventory (V01 Rescue Fleet, V02 Play/Stage, Companion, under-the-hood integration, Canada40K.tsx cue card, appeal letter)
- Dispatch channel: public broadcast (Cephas + FounderDenken Substack + Medium per [[reference-substack-anchored-sequential-publish-order-bp083]]), NOT Gmail
- Composes with [[canon-mimic-trunks-gate-and-tunnel-partner-cooperative-volume-benefits-bp084]] — displaced SUV founders are EXACTLY the recruitment pool for Mimic Trunk partners and Ceros Technology hires
- Dispatch list problem flagged separately (sourcing decision still Founder's call: press-first vs. SUV-incubator partners vs. LinkedIn cold outreach)

---

## SEG-7 — Add Canada 40K to Battery Dispatch Wave 1 (Sonnet 4.6 SEG)

**Files to update:**
- `librarian-mcp-public\preload\outreach\opening_gambit_v2.md` — add Canada 40K as a NEW FIRST anchor of Wave 1 (BEFORE MacKenzie Scott personal Crown Letter). Reasoning: public broadcast provides air cover for the personal sends to follow.
- Battery Dispatch content registry (whatever the v0.3.0 implementation reads to build a wave): add Canada 40K V02 op-ed + Rescue Fleet appeal as Wave 1 items.

**Dispatch class:** `open-letter-broadcast` (NOT `crown-letter`). Channels per Substack-anchored sequential publish order canon:
1. Substack (FounderDenken) — fires first
2. Medium — cross-publishes immediately after with canonical-link footer
3. Cephas + lianabanyan.com — Hugo build synced with Substack publish moment
4. Battery Dispatch sequential adapter chain — Substack-success-webhook → Medium + Cephas

NOT Gmail (no single addressed recipient).

Founder ratify required BEFORE Wave 1 fires anything (BP078 explicit-ratify-before-publish HARD BINDING).

---

## SEG-8 — Deploy + BP080 4-Sharpening (Sonnet 4.6 SEG)

Use atomic-deploy.ps1 (v0.4.3 hardened). All Sharps literal HTTP 200 first hop.

**Sharps:**
- Sharp 1: `curl -sI https://cephas.lianabanyan.com/under-the-hood/canada-40k-integration/` → 200 + body grep "Canada 40K Integration"
- Sharp 2: `curl -sI https://cephas.lianabanyan.com/letters/rescue-fleet/canada-40k-appeal/` → 200 + body grep "Rescue Fleet"
- Sharp 3: `curl -sI https://lianabanyan.com/canada40k` → 200 + body grep "Canada just canceled 40,000 startup visas"
- Sharp 4: V02 article exists at canonical 09_Articles path + companion exists
- Sharp 5: Battery Dispatch Wave 1 plan lists Canada 40K as FIRST anchor
- Sharp 6: Canon eblet exists at canonical Vault path

NO COSMETIC-GREEN. NO TIMEOUT-SWALLOWED-YELLOW. HONEST RED if any 302 or 404.

---

## Open ratify gates (Bishop must surface to Founder pre-publish)

1. Dispatch list sourcing — press-first (publish + let displaced founders self-identify) vs. incubator-partner outreach vs. LinkedIn cold
2. MacKenzie Scott letter — still Wave 1 anchor? Or does Canada 40K bumping to first slot reshuffle the order?
3. Tunnel revenue share percentages in the Mimic Trunks canon (7 ratify gates listed there)
4. V02 Play/Stage publication outlet — Substack first (per canon), but also pitch to The Logic, TechCrunch, or Globe & Mail given Canadian angle?

---

## Yoke-return spec

Each SEG status + commits + 6 Sharps with literal HTTP codes + recovered file paths + verbatim "Sonnet 4.6".

**FOR THE KEEP.**
