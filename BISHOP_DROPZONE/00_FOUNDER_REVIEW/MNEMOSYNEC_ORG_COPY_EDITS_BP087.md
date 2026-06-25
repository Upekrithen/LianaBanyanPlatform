# MNEMOSYNEC.ORG COPY EDITS -- BP087 SEG-Z
**Deliverable class:** Paste-ready BEFORE/AFTER copy edits, surface companion to SEG-W (licensing) and SEG-Y (design system + components)
**Session:** BP087
**Segment:** SEG-Z (Sonnet 4.6)
**Date:** 2026-06-19
**Cross-reference:** SEG-Y Component IDs A/B/C/D/E/F; SEG-W licensing crystallization canon

---

## HARD CONSTRAINTS (read before applying any edit)

1. All copy uses "Dr. Mnemosynec" for the persona; "MnemosyneC" for the product/OS overlay. Never "Mnemo" on user-facing surfaces. (SEG-X naming lock, BP087)
2. NO em-dashes anywhere in copy. Use commas, colons, semicolons, or em-dash-free restructuring.
3. Cooperative-class register: empirical, no hype, caveats stated aloud.
4. All numbers verbatim from canonical sources. No invented benchmarks. (97.1% MMLU-Pro is the canonical receipt.)
5. "Dr. Mnemosynec" with lowercase 'c' is the persona spelling. "MnemosyneC" with uppercase 'C' is the product spelling.

---

## EDIT SUMMARY TABLE

| Edit | Location | Action | SEG-Y Component |
|------|----------|--------|-----------------|
| 1 | Hero / screenshot slot | Remove placeholder text; substitute mascot image tag | Component A (hero) |
| 2 | "Just Add Salt" section | Add bridge paragraph + sharpen heading | Component B (benchmark bar) |
| 3 | Membership CTA | Reframe $5/year as cooperative membership, not opt-in afterthought | Component E (join modal) |
| 4 | Download section | Elevate SmartScreen callout to dedicated callout box | Component F (callout) |
| 5 | Lifecycle section | Open with SEG-Y flow diagram + Plain English one-liner | Component C (lifecycle flow) |
| 6 | Architecture stack | Add Plain English one-liners per Reader / Verifier / Accumulator | Component D (architecture) |
| 7 | Benchmark section | Replace stacked text with SVG bar chart + Plain English caption | Component B (benchmark bar) |
| 8 (revised) | License mentions (site-wide) | Correct licensing language; add Section 13 + 30-day offer + /licensing footer link | none (copy only) -- SEG-AA, SEG-BB |
| 9 (revised) | Installer click-through | Add commercial offer notice mid-flow; update Section 13 language | none (installer UI) -- SEG-AA, SEG-BB |
| 10 | Naming sweep | Dr. Mnemosynec / MnemosyneC surface sweep with rules table | none (copy-wide) |
| 11 | /licensing page (new) | Recipe for Cephas/Hugo team; acceptance criteria; cross-refs SEG-Y T1 §7C | Components A, F, G -- SEG-AA, SEG-BB |

---

## EDIT 1 -- Bury the Placeholder

**Location:** Hero section, screenshot/demo image slot

**BEFORE:**
```
Screenshot pending -- Founder to provide
```

**AFTER (if screenshot still does not exist at build time):**
```html
<img
  src="/img/mascots/dr-mnemosynec.png"
  alt="Dr. Mnemosynec, the persona of the MnemosyneC cooperative substrate."
  class="hero-mascot"
  width="800"
  height="600"
/>
```

**Plain paste (no screenshot, no mascot yet):**
```
[REMOVE THE LINE ENTIRELY. Leave the slot empty rather than publishing a placeholder.]
```

**Notes for implementer:**
- The mascot image path is `/img/mascots/dr-mnemosynec.png`. Drop the asset there.
- Alt text is required. Do not shorten it.
- If neither screenshot nor mascot exists at build time, remove the `<img>` tag and let the hero section render without an image rather than showing placeholder text to visitors.
- SEG-Y Component A governs the hero layout. The image slot dimensions are set there.

---

## EDIT 2 -- Bridge "Just Add Salt"

**Location:** Section heading and lead-in, "Just Add Salt" content block

**BEFORE:**
```
## Just Add Salt. How to Get the Right Answer.
## 97.1% MMLU-Pro
```

**AFTER:**
```
## Just Add Salt. Get the Right Answer.

Salt is what we call the substrate. The model is the broth. Without salt the broth is bland and you keep tasting the same misses. Add salt and the broth tastes like dinner. The numbers say the same thing.

## 97.1% MMLU-Pro Recall

Gemma 4 12B with the substrate. Same model, same questions, same hardware. The substrate is what changed.
```

**Notes for implementer:**
- The bridge paragraph is new. It lives between the two headings.
- "97.1% MMLU-Pro Recall" replaces "97.1% MMLU-Pro" -- "Recall" is added for precision.
- The attribution line ("Gemma 4 12B with the substrate...") is new and replaces any unlabeled number that currently floats without context.
- This section feeds into the SEG-Y Component B SVG bar chart (see Edit 7). The heading and bridge paragraph appear above the chart.
- No em-dashes in any of this copy. Confirmed.

---

## EDIT 3 -- $5/Year Cooperative Reframe

**Location:** Membership / join CTA, wherever the $5/year line appears

**BEFORE:**
```
Optionally join the Cooperative Universal Substrate™ for $5 a year. Not required.
```

**AFTER:**
```
Join the Cooperative Universal Substrate for $5 a year. One vote, shared substrate, 83.3% of every dollar back to workers, builders, and creators. Personal use is free under SSPL v1; the $5 makes you a member.
```

**Notes for implementer:**
- Remove "Optionally" and "Not required." Both phrases undercut the value of membership.
- Remove the (TM) symbol from inline copy. Trademark notice lives in the footer and on /licensing, not in CTAs.
- The three clauses ("One vote... 83.3%... Personal use is free...") are the canonical value stack. Do not reorder them.
- 83.3% is the canonical worker-pay figure (Food Node Pricing canon, BP086). Do not change it.
- "SSPL v1" is spelled with a lowercase v. Confirm in final copy.
- SEG-Y Component E governs the join modal layout. This copy slots into the benefit body there.

---

## EDIT 4 -- SmartScreen Callout Elevation

**Location:** Download page, immediately below the primary download button

**BEFORE:**
```
[SmartScreen explanation buried at bottom of page in body copy]
```

**AFTER (callout box, SEG-Y Component F format):**

```
+------------------------------------------------------------------+
|  WHY DOES WINDOWS SHOW A WARNING?                                |
|                                                                  |
|  Dr. Mnemosynec is signed by Liana Banyan Corporation. Windows  |
|  SmartScreen has not yet flipped its trust flag for new          |
|  publishers. Click "More info" then "Run anyway" to install.     |
|  The signature is good; SmartScreen will accept it over time.   |
|                                                                  |
|  [inline screenshot: SmartScreen More info / Run anyway flow]    |
+------------------------------------------------------------------+
```

**HTML paste-ready (SEG-Y Component F callout):**
```html
<div class="callout callout--warning" id="smartscreen-callout">
  <h3 class="callout__headline">Why does Windows show a warning?</h3>
  <p class="callout__body">
    Dr. Mnemosynec is signed by Liana Banyan Corporation. Windows SmartScreen
    has not yet flipped its trust flag for new publishers. Click
    <strong>"More info"</strong> then <strong>"Run anyway"</strong> to install.
    The signature is good; SmartScreen will accept it over time.
  </p>
  <figure class="callout__figure">
    <img
      src="/img/docs/smartscreen-more-info-run-anyway.png"
      alt="Windows SmartScreen dialog showing the More info link and Run anyway button."
      width="520"
      height="320"
    />
    <figcaption>Click "More info" (left), then "Run anyway" (right).</figcaption>
  </figure>
</div>
```

**Notes for implementer:**
- This callout must appear IMMEDIATELY below the download button, not at the bottom of the page.
- The screenshot asset path is `/img/docs/smartscreen-more-info-run-anyway.png`. Capture the actual SmartScreen dialog and drop it there.
- SEG-Y Component F defines `.callout`, `.callout--warning`, `.callout__headline`, `.callout__body`, `.callout__figure`. Wire those class names to the design system tokens, not to inline styles.
- Remove the old buried body-copy version once this callout is live.

---

## EDIT 5 -- Lifecycle Visual Anchor

**Location:** Lifecycle section (Pheromones to Stone Tablets), opening of that section

**BEFORE:**
```
[4 paragraphs of prose describing Pheromones to Stone Tablets, no diagram]
```

**AFTER:**
```
## How a Claim Becomes Permanent

[SEG-Y Component C flow diagram inserted here]

Most claims die. The few that survive get stamped in stone.

[existing 4 paragraphs of prose follow, unchanged, as expanded detail below the diagram]
```

**HTML paste-ready (diagram anchor):**
```html
<section class="lifecycle-section">
  <h2 class="lifecycle-section__title">How a Claim Becomes Permanent</h2>

  <!-- SEG-Y Component C: lifecycle flow diagram SVG -->
  <figure class="lifecycle-section__diagram">
    <div id="lifecycle-flow-diagram">
      <!-- Component C SVG rendered by design system here -->
    </div>
    <figcaption class="lifecycle-section__plain-english">
      Most claims die. The few that survive get stamped in stone.
    </figcaption>
  </figure>

  <!-- existing 4 paragraphs of prose, unchanged -->
  <div class="lifecycle-section__prose">
    [PASTE EXISTING 4 PARAGRAPHS HERE]
  </div>
</section>
```

**Notes for implementer:**
- The Plain English one-liner ("Most claims die. The few that survive get stamped in stone.") goes in the `<figcaption>`, immediately below the diagram, above the prose block.
- The title "How a Claim Becomes Permanent" is new. If a section heading already exists, replace it with this text.
- SEG-Y Component C owns the flow diagram SVG. Do not redraw it here; reference it.
- Do not truncate or rewrite the existing 4 paragraphs. They are the expanded prose. They stay below the diagram.

---

## EDIT 6 -- Architecture Stack Plain English Summaries

**Location:** Architecture section, Reader / Verifier / Accumulator expanded subsections

**BEFORE:**
```
[Each subsection opens with its technical name and detailed description, no Plain English one-liner]
```

**AFTER -- Reader subsection:**
```
### Reader

Reads your question. Local or cloud, you pick.

[existing Reader description text follows]
```

**AFTER -- Verifier subsection:**
```
### Verifier

Three parallel checks. Two must agree. Wrong answers never get stored.

[existing Verifier description text follows]
```

**AFTER -- Accumulator subsection:**
```
### Accumulator

Stamped and signed. Append-only. Never edited, never deleted.

[existing Accumulator description text follows]
```

**HTML paste-ready (pattern for each subsection):**
```html
<section class="arch-subsection" id="arch-reader">
  <h3 class="arch-subsection__name">Reader</h3>
  <p class="arch-subsection__plain-english">
    Reads your question. Local or cloud, you pick.
  </p>
  <div class="arch-subsection__detail">
    [PASTE EXISTING READER DESCRIPTION HERE]
  </div>
</section>

<section class="arch-subsection" id="arch-verifier">
  <h3 class="arch-subsection__name">Verifier</h3>
  <p class="arch-subsection__plain-english">
    Three parallel checks. Two must agree. Wrong answers never get stored.
  </p>
  <div class="arch-subsection__detail">
    [PASTE EXISTING VERIFIER DESCRIPTION HERE]
  </div>
</section>

<section class="arch-subsection" id="arch-accumulator">
  <h3 class="arch-subsection__name">Accumulator</h3>
  <p class="arch-subsection__plain-english">
    Stamped and signed. Append-only. Never edited, never deleted.
  </p>
  <div class="arch-subsection__detail">
    [PASTE EXISTING ACCUMULATOR DESCRIPTION HERE]
  </div>
</section>
```

**Notes for implementer:**
- The Plain English one-liner sits between the subsection heading and the existing technical description. Do not replace the technical description; add before it.
- SEG-Y Component D governs the architecture stack layout. Use `.arch-subsection` and `.arch-subsection__plain-english` per that component spec.
- The three one-liners are locked. Do not paraphrase or shorten them.

---

## EDIT 7 -- Headline Benchmark Numbers

**Location:** Benchmark section, currently four stacked text blocks

**BEFORE:**
```
[Four stacked text blocks showing benchmark numbers without a visual chart]
```

**AFTER:**
```
Same models. Same questions. The substrate is what changed. The bar on the right is what your AI does with memory.

[SEG-Y Component B SVG bar chart inserted here]
```

**HTML paste-ready:**
```html
<section class="benchmark-section">
  <p class="benchmark-section__caption">
    Same models. Same questions. The substrate is what changed.
    The bar on the right is what your AI does with memory.
  </p>

  <!-- SEG-Y Component B: SVG bar chart -->
  <figure class="benchmark-section__chart">
    <div id="benchmark-bar-chart">
      <!-- Component B SVG rendered by design system here -->
    </div>
  </figure>
</section>
```

**Notes for implementer:**
- The Plain English caption goes ABOVE the chart, not below.
- Remove the four stacked text blocks entirely once the chart is live. The chart carries the numbers.
- SEG-Y Component B owns the SVG bar chart. Reference it; do not redraw inline.
- The caption is two sentences. Both stay. Do not merge into one sentence.
- All numbers in the chart must be verbatim from canonical sources. The primary canonical number is 97.1% MMLU-Pro (Gemma 4 12B with substrate, BP087).

---

## EDIT 8 (revised) -- Licensing Language Correction (per SEG-W canon + SEG-AA + SEG-BB)

**Canon refs:** `canon_android_of_ai_four_layer_licensing_model_bp087` (SEG-AA), `canon_30_day_commercial_license_offer_letter_campaign_bp087` (SEG-BB)

**Location:** All site surfaces that mention the license (homepage, download page, about page, footer)

**BEFORE:**
```
FREE (SSPL license) to use FOREVER.
```

**AFTER (homepage license mention block, short form):**
```
Free under SSPL v1 for personal and cooperative use. Library extractions available under Apache 2.0 for for-profit AI integrations. Section 13 (SaaS clause) of SSPL applies if you wrap it as a service. Patent peace via Cooperative Defensive Pledge #2260 covers all users. Trademarks remain with Upekrithen LLC. Commercial licensing inquiries welcome at hello at upekrithen dot com -- 50 percent discount for a 5-year term if accepted within 30 days of your offer letter; the term decays one year per additional 30-day delay window until the offer closes after day 150.
```

**Footer addendum (add alongside or below existing footer links):**
```html
<a href="/licensing" class="footer__link">Licensing</a>
```

**Footer link text:** "Licensing"
**Footer link destination:** `/licensing`

**Notes for implementer:**
- The /licensing page is specified in SEG-Y T1 §7C (this session). It must exist and resolve at both `/licensing` and `/license` before this footer link goes live.
- "SSPL v1" lowercase v. "Apache 2.0" is the canonical Apache license shorthand.
- "Pledge #2260" is the canonical shorthand for the Cooperative Defensive Patent Pledge.
- Upekrithen LLC is the canonical trademark holder. Do not substitute Liana Banyan Corporation here.
- The four trademarks (MnemosyneC, Dr. Mnemosynec, Liana Banyan, Cephas) are canonical as of BP087. Do not add or remove without Founder ratify.
- Remove "FOREVER" and ALL-CAPS formatting from the BEFORE version. Cooperative-class register is empirical, not hype.
- The 30-day 50% discount line is new as of SEG-BB. It belongs in the license mention copy site-wide during the active campaign window. Remove after the campaign closes or replace with "Commercial licensing inquiries welcome at hello@upekrithen.com."
- "hello@upekrithen.com" is the canonical commercial licensing contact. Do not use a Liana Banyan Corporation address here.

---

## EDIT 9 (revised) -- Install-Time Click-Through (per SEG-W canon section 4 + SEG-AA + SEG-BB)

**Canon refs:** `canon_android_of_ai_four_layer_licensing_model_bp087` (SEG-AA), `canon_30_day_commercial_license_offer_letter_campaign_bp087` (SEG-BB)

**Location:** Installer, first-run screen presented before MnemosyneC initializes

**This is installer UI prose, not website copy. Provide to the installer build team verbatim.**

---

**Screen 1 -- Welcome and License**

**Header (top of screen):**
```
Welcome to MnemosyneC. Dr. Mnemosynec is here to give your AI memory.
```

**Body (mid-screen):**
```
This software is free under the Server Side Public License (SSPL v1) for personal and cooperative use. If you wrap it as a service for paying customers, SSPL Section 13 requires you to open-source your service stack OR obtain a commercial license. Library extractions are available under Apache 2.0 for for-profit AI integrations.
```

**Commercial offer notice (below body, highlighted -- amber background or amber left-border box):**
```
Commercial AI vendors: a 50 percent discount on commercial licensing for a 5-year term is available within 30 days of your offer letter receipt. Each additional 30-day delay reduces the discount term by 1 year. See mnemosynec.org/licensing for the schedule.
```

**Patent notice (below offer notice):**
```
Patent Pledge #2260: by installing, you acknowledge that any patent litigation against a cooperative member revokes your patent peace.
```

**Warranty disclaimer (bottom of body, smaller text, muted color):**
```
This software is provided as-is, without warranty of any kind. Use at your own discretion.
```

**Checkbox label (single checkbox, required before Continue is enabled):**
```
I have read and agree to the license terms above.
```

**Continue button:** Enabled only after the checkbox is checked. Label: "Continue"

**Link below Continue button:**
```
Read the full SSPL, Apache 2.0 extractions list, Pledge #2260, and TUP at mnemosynec.org/licensing.
```

---

**Installer implementation notes:**
- The "Continue" button must be disabled (grayed out, not clickable) until the checkbox is checked. This is a hard requirement per SEG-W canon section 4.
- The link to mnemosynec.org/licensing must open in the system browser, not in an embedded view.
- No second screen required at this time. Single screen with all five text blocks plus checkbox plus Continue plus link.
- The commercial offer notice is new as of SEG-BB. It sits between the body copy and the patent notice. Style it with an amber left border or amber background tint to distinguish it from the general license prose. Do not hide or minimize it; commercial AI vendors are the target audience for this notice.
- Do not add an "I Decline" button that exits silently. If the user declines, they have not completed installation. The installer should explain that declining means not installing and offer to close.
- Warranty disclaimer must be visually distinct (smaller text, muted color) but still readable. It cannot be hidden.
- The offer notice text "50% discount on commercial licensing" must remain verbatim. Do not paraphrase or round.
- After the 30-day campaign window closes, remove the offer notice block from future installer builds. The remaining copy is permanent.

---

## EDIT 11 -- /licensing Page on mnemosynec.org (new page)

**Canon refs:** `canon_android_of_ai_four_layer_licensing_model_bp087` (SEG-AA), `canon_30_day_commercial_license_offer_letter_campaign_bp087` (SEG-BB)

**Location:** New Hugo content page, `content/licensing/_index.md` or `content/licensing.md`

**This is a recipe handed to the Cephas/Hugo team. Layout is specified in SEG-Y T1 §7C. This edit records the copy requirements and acceptance criteria.**

---

**Page front matter (Hugo):**
```yaml
---
title: "Licensing"
description: "MnemosyneC is licensed under SSPL v1 for personal and cooperative use, Apache 2.0 for library extractions, and commercially via Upekrithen LLC. Pledge #2260 covers patent peace for all users."
aliases: ["/license"]
layout: "licensing"
---
```

**Page copy summary (full copy in SEG-Y T1 §7C HTML skeleton):**

Section 1 (Hero): Eyebrow "Licensing." Headline "How MnemosyneC is licensed." One-liner verbatim: "Free under SSPL for everyone. Apache for library extractions. Patent peace via Pledge #2260. Trademarks held by Upekrithen LLC."

Section 2 (4-layer table): Four rows. Columns: Layer, License, Who it serves, What it requires. Rows verbatim as specified in SEG-Y T1 §7C Section 2. No additions, no removals without Founder ratify.

Section 3 (Android-of-AI): Component A flip card. Front: "We use the Android licensing model." with four-part mapping (SSPL node, cooperative substrate, Pledge #2260, TUP trademarks). Back: link to BP087 Android-of-AI canon eblet slug `canon_android_of_ai_four_layer_licensing_model_bp087`.

Section 4 (SSPL Section 13): Component F callout. Title: "What Section 13 means in practice." Body verbatim from SEG-Y T1 §7C Section 4.

Section 5 (Commercial Offer): Component G offer card from SEG-Y T1 §7B (amended BP087 decay schedule). The card now renders the full 5-window decay schedule per the amended Component G spec: Block A (OFFER WINDOW eyebrow, 50 percent headline, "Term decays from 5 years to 1 year as you wait" subheadline) followed by Block B (6-row decay table with amber active-row highlight on Window 1, progressive dimming through Window 5, strikethrough on the closed row). Countdown badge dynamic. CTA `mailto:hello@upekrithen.com`. Saladin-mercy pill present.

Section 6 (Pledge #2260): Component F callout (green variant). Title: "Patent peace, conditional." Body verbatim from SEG-Y T1 §7C Section 6.

Section 7 (Trademarks): Component F callout (teal/info variant). Title: "Trademarks belong to Upekrithen LLC." Body verbatim from SEG-Y T1 §7C Section 7.

Section 8 (FAQ): Three Component A flip cards. Questions and answers verbatim from SEG-Y T1 §7C Section 8.

Section 9 (Contact + Liturgy): Contact CTA to `hello@upekrithen.com`. Closing liturgy 4-line block verbatim. FounderDenken/Crewman #6 byline. Footer links including "Licensing" self-link.

---

**Acceptance criteria (DO NOT mark this edit complete until all pass):**

1. `mnemosynec.org/licensing` loads and serves the page content above.
2. `mnemosynec.org/license` redirects to or serves identical content (Hugo alias confirmed).
3. The "Licensing" anchor appears in the footer of every cooperative-class page: homepage, about, join, download. (Not required on: API docs, settings, error pages.)
4. Component G countdown badge is dynamic, not static. Renders the correct remaining days at visit time.
5. All three FAQ flip cards flip and return correctly on click.
6. The Android-of-AI flip card (Section 3) flips and returns correctly on click.
7. The commercial offer notice in the installer (Edit 9) links to this page at `mnemosynec.org/licensing`.
8. Zero em-dashes in rendered page copy.
9. All canon eblet slugs cited in flip card back faces are correct as of SEG-AA and SEG-BB.

---

**Notes for implementer:**
- The full HTML skeleton with all CSS and JS is in SEG-Y T1 §7C. This edit is the copy record and acceptance gate. Hugo team should pull the skeleton from T1 §7C, not rewrite from this summary.
- Component G (offer card) is in SEG-Y T1 §7B. Paste it directly into Section 5.
- Component A (flip card) JS is the single `flipCard(cardId)` function from §2. Include it once per page.
- Component F (callout) CSS is in §7. Use `.callout`, `.callout--info`, `.callout--green` variants as specified.
- The Pledge #2260 "2,700+" figure is the canonical claim count as of BP087. Do not round or abbreviate.
- Do not publish the commercial offer section (Section 5 / Component G) before the 30-day campaign is active. Campaign start date is Founder-set per SEG-BB canon.

---

## EDIT 10 -- Dr. Mnemosynec Naming Surface Sweep

**Scope:** All user-facing copy on mnemosynec.org and in the installer

**Rules table (apply in this priority order):**

| Surface | Correct form | Notes |
|---------|-------------|-------|
| Hero headline | Dr. Mnemosynec | "Your AI has Amnesia. Dr. Mnemosynec has the Cure." (already canonical) |
| Onboarding | Dr. Mnemosynec | "Meet Dr. Mnemosynec" (canonical) |
| Settings tab labels | MnemosyneC | Product name, not persona name. Do not change to Dr. Mnemosynec. |
| About page intro | Both | "Dr. Mnemosynec is the persona; MnemosyneC is the operating system overlay." |
| Installer welcome screen | Dr. Mnemosynec | "Dr. Mnemosynec is here to give your AI memory." |
| Footer copyright | MnemosyneC | Product name. |
| License copy | MnemosyneC | Product name in SSPL/Apache references. |
| Error messages | MnemosyneC | Product name in technical error strings. |
| Marketing CTAs | Dr. Mnemosynec | Persona is the face of marketing. |
| API documentation | MnemosyneC | Product name in technical docs. |

**Specific replacements for implementer:**

BEFORE (any occurrence):
```
Mnemo
```
AFTER (user-facing copy):
```
Dr. Mnemosynec [if persona context] OR MnemosyneC [if product context]
```
NEVER use "Mnemo" as a standalone word in user-facing copy.

BEFORE (about page):
```
MnemosyneC is [any description that conflates product and persona]
```
AFTER (about page):
```
Dr. Mnemosynec is the persona; MnemosyneC is the operating system overlay.
```

**Notes for implementer:**
- Run a site-wide text search for "Mnemo" and audit each instance before replacing.
- "MnemosyneC" with uppercase C at the end is the product spelling. Do not lowercase the final C.
- "Dr. Mnemosynec" with lowercase c at the end is the persona spelling. Do not uppercase the final c.
- These are two different spellings of two different things. Both are correct in their context.

---

## CLOSING BLOCK (all cooperative-class pages)

**Location:** Bottom of homepage, about page, and join page

**Apply this block verbatim at the bottom of each cooperative-class page:**

```
Let's Help Each Other Help Ourselves.
Coffee is for Closers. Help Yourself.
```

**HTML paste-ready:**
```html
<footer class="page-closing-liturgy">
  <p class="page-closing-liturgy__line">Let's Help Each Other Help Ourselves.</p>
  <p class="page-closing-liturgy__line">Coffee is for Closers. Help Yourself.</p>
</footer>
```

**Notes for implementer:**
- This block appears on: homepage, about page, join page. Not on technical docs, licensing page, settings, or API documentation.
- The Lightbulb tagline (Option A) is reserved for the NYT op-ed close per prior BP087 ratify. Do not use Option A on cooperative-class pages.
- Both lines are canonical (BP086 HARD CANON). Do not paraphrase, shorten, or reorder.
- "Coffee is for Closers. Help Yourself." is the substrate market sales tagline, subverting the Alec Baldwin "Coffee's for closers" line. The canonical form uses "Coffee is for Closers" (not "Coffee's for Closers") in the cooperative surface version.

---

## EM-DASH AUDIT CONFIRMATION

This document contains zero em-dashes. All em-dash-free alternatives used:
- Commas for appositive clauses
- Semicolons for joined independent clauses
- Colons for lead-ins
- Sentence breaks for strong pauses

Implementer: before publishing any copy from this document, run a search for the Unicode em-dash character (U+2014) and the HTML entity (ampersand-mdash-semicolon) to confirm none were introduced during paste operations.

---

## SEG-Y COMPONENT CROSS-REFERENCE

| SEG-Y Component | Role | Edits that reference it |
|----------------|------|------------------------|
| Component A | Hero layout and image slot | Edit 1, Edit 11 (FAQ flip cards on /licensing) |
| Component B | SVG bar chart (benchmark numbers) | Edit 2, Edit 7 |
| Component C | Lifecycle flow diagram (Pheromones to Stone Tablets) | Edit 5 |
| Component D | Architecture stack (Reader / Verifier / Accumulator) | Edit 6 |
| Component E | Join modal (membership benefits) | Edit 3 |
| Component F | Callout box (SmartScreen warning, SSPL Section 13, Pledge 2260, TUP) | Edit 4, Edit 11 |
| Component G | Commercial license offer card (new, BP087 SEG-CC) | Edit 11 (/licensing page Section 5) |

SEG-AA handles: Android-of-AI four-layer licensing model canon; amends §7 and §8 of the Android-of-AI canon eblet.

SEG-BB handles: 30-day commercial license offer letter campaign canon; 50% FRAND discount window.

SEG-CC (this session, companion to SEG-AA/BB) handles: Component G offer card, /licensing page recipe (T1 §7B/§7C), Edit 8 revision, Edit 9 revision, Edit 11 new.

SEG-W handles: licensing crystallization baseline, Android-of-AI model plain English explanation, SSPL / Apache 2.0 structural distinctions, Pledge #2260 language.

SEG-X handles: "Dr. Mnemosynec" naming lock canon, persona vs product distinction canon.

SEG-Z (this file) handles: surface copy for all 11 edits, paste-ready BEFORE/AFTER, installer click-through prose, naming sweep rules, /licensing page acceptance criteria.

---

*SEG-Z amended by SEG-CC. BP087. 2026-06-19. Sonnet 4.6. Zero em-dashes confirmed.*
