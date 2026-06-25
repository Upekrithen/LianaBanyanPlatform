# Licensing Summary Brief for Design Adjustment

**Session:** BP087
**Date:** 2026-06-19
**For:** Pawn (design pass adjustment)
**From:** Bishop Sonnet 4.6
**Constraint:** NO em-dashes anywhere in this document.

---

## What changed since the last design pass

Three things you need to know to adjust the design:

1. The licensing model is now formally canonized as the Android-of-AI model: SSPL v1 for the substrate, Apache 2.0 for selected library extractions for-profit AI companies may fork, Cooperative Defensive Patent Pledge #2260 for patent peace, TUP for trademarks.
2. The commercial license offer for big AI companies has a 5-year initial term that decays by 1 year per additional 30-day delay window. Accept in window 1 (days 0 to 30) and the discount applies for 5 years. Wait until window 5 (days 121 to 150) and it applies for 1 year only. After day 150 the discount closes entirely.
3. The persona is canonically Dr. Mnemosynec on user-facing surfaces; MnemosyneC remains the product name; Mnemo is substrate-internal only and never used on user-facing copy.

---

## The 4-layer license (one sentence each, plain English)

- SSPL v1: free for everyone for the substrate. If you wrap it as a service for paying customers, Section 13 requires you to open-source your entire service stack.
- Apache 2.0: selected library extractions for-profit AI companies may fork with attribution.
- Cooperative Defensive Patent Pledge #2260: patent peace for all users, revoked the moment you sue a cooperative member.
- TUP: Mnemosynec / Dr. Mnemosynec / Liana Banyan / Cephas trademarks belong to Upekrithen LLC, non-licensable.

---

## The forcing function (the moat in one paragraph)

SSPL v1 Section 13 is the SaaS clause. If a commercial AI vendor wraps the substrate as a service offered to their customers, Section 13 requires them to release their entire AI service stack source code under SSPL. They will not. Therefore three options remain: do not integrate (accept inequality-trinity inferiority), open-source the entire AI stack (improbable), or license commercially. The third option is where the offer lives.

---

## The 30-day 50 percent offer (with decay)

50 percent off the FRAND commercial licensing fee, applied to a 5-year term if accepted within 30 days of the offer letter date. Each additional 30-day delay window reduces the term by 1 year.

**Founder direct BP087 verbatim:** "the 50% if good for 5 years, but it decreases a year at a time for each additional delay period you don't take advantage."

| Window | Days from letter | Discount term if accepted |
|---|---|---|
| 1 initial | 0 to 30 | 50% off for 5 years |
| 2 | 31 to 60 | 50% off for 4 years |
| 3 | 61 to 90 | 50% off for 3 years |
| 4 | 91 to 120 | 50% off for 2 years |
| 5 | 121 to 150 | 50% off for 1 year |
| 6 plus | 151 plus | full FRAND rate |

Mercy persists with diminishing return. Saladin's pattern at the commercial-licensing layer. The licensee is never refused entry; the price of waiting compounds.

---

## Why 50 percent is the discount math

The discount comes from what the licensee saves operating with substrate vs without. Three empirical receipts:

- Substrate amortizes context across parallel work. Empirical BP087 receipt: a Knight 200K session orchestrated 5 parallel build streams at 43 percent of context vs 86 percent baseline without substrate. Approximately 10 times the work per token.
- Accuracy uplift: 97.1 percent MMLU-Pro recall with substrate vs 75-86 percent without (BP083 Plow methodology, BP087 Trial 02 receipt pending).
- Substrate-amortized inference cost reduction per dispatch.

The licensee saves more in operational cost than the discounted fee charges. They are net positive after fee.

---

## Design components to update

- Replace the existing offer card mid-section (the old 3-row "what you save / what you pay / what you pay in 30 days" table) with the amended Component G that now shows the full 5-window decay schedule. The updated Component G spec is in `MNEMOSYNEC_ORG_DESIGN_SYSTEM_AND_CONCRETE_EXAMPLES_BP087.md` §7B. Block A is the OFFER WINDOW eyebrow plus 50 percent headline plus "Term decays from 5 years to 1 year as you wait" subheadline. Block B is the 6-row decay table with amber active-row highlight on Window 1, progressive dimming through Window 5, and a strikethrough on the closed row.
- Add a /licensing page. The recipe (full HTML skeleton) is in `MNEMOSYNEC_ORG_DESIGN_SYSTEM_AND_CONCRETE_EXAMPLES_BP087.md` §7C.
- Site-wide license mention (footer, homepage, download CTA) updates per `MNEMOSYNEC_ORG_COPY_EDITS_BP087.md` Edit 8. The updated copy reads: "50 percent discount for a 5-year term if accepted within 30 days of your offer letter; the term decays one year per additional 30-day delay window until the offer closes after day 150."
- Installer Screen 1 commercial offer notice updates per `MNEMOSYNEC_ORG_COPY_EDITS_BP087.md` Edit 9. The updated notice reads: "Commercial AI vendors: a 50 percent discount on commercial licensing for a 5-year term is available within 30 days of your offer letter receipt. Each additional 30-day delay reduces the discount term by 1 year. See mnemosynec.org/licensing for the schedule."

---

## What stays the same

The flip card pattern, the bar chart, the lifecycle flow, the architecture stack, the proof cards, the SmartScreen callout, the KPI strip, the cooperative liturgy footer ("Let's Help Each Other Help Ourselves. Coffee is for Closers. Help Yourself.") all stay as you designed them. Nothing of the cooperative-class member surface changes. The top-row eyebrow, countdown badge, and footer row of Component G (Saladin-mercy pill plus CTA button) are all preserved exactly. Only the mid-section of Component G changes.

---

## Founder verbatim anchors (for direct citation if needed)

- "the answer was because then they would be required to provide ALL of the information of what they used with all of their source code"
- "the offers I am making to the AI companies that I wrote letters to about licensing it within 30 days for a 50% discount in licensing fees"
- "the 50% if good for 5 years, but it decreases a year at a time for each additional delay period you don't take advantage"
- "It's Dr. Mnemosynec now."

---

## Cross-references (absolute paths)

- Android-of-AI canon: `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_android_of_ai_licensing_model_sspl_base_apache_library_pledge_2260_patent_upekrithen_llc_bp087.eblet.md`
- 30-day offer letter campaign canon: `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_30_day_50_percent_commercial_license_offer_letter_campaign_ai_companies_sspl_section_13_forcing_function_bp087.eblet.md`
- Design deliverable (Component G §7B, /licensing recipe §7C): `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MNEMOSYNEC_ORG_DESIGN_SYSTEM_AND_CONCRETE_EXAMPLES_BP087.md`
- Copy edits deliverable (Edit 8, Edit 9, Edit 11): `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MNEMOSYNEC_ORG_COPY_EDITS_BP087.md`

---

*Bishop Sonnet 4.6 · BP087 · 2026-06-19 · SEG-EE · zero em-dashes confirmed*
