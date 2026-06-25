# KNIGHT YOKE · CerosTechnology.com Rebuild · Become-the-Boss PM Hiring Portal · BP085

**Issued by:** Bishop (Sonnet 4.6 SEG)
**Date:** 2026-06-16
**BP:** BP085
**Status:** PASTE-READY — Founder Review Pending Gate Approvals

---

## PREAMBLE

**Sonnet 4.6 mandate (verbatim — HARD BINDING):**
> "Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report 'Sonnet 4.6' verbatim. BP081 BLOOD."

**Scope:** Rebuild cerostechnology.com as the cooperative Engineering Studio, Bounty Poster hub, and Become-the-Boss PM Hiring Portal. This site is a CT Member Business inheriting all Liana Banyan cooperative perks: 83.3% creator pay, Three-currency Substitution rail, Marks-backed payroll, IP-portfolio collateral, Tower of Peace /download/ dual-path distribution pattern where applicable.

**Truth-Always layer:** A separate deep-research agent produced a single-page HTML site structure (hero / Selected Work / Proofs / Patents / About / Recruiting / The Network). That output is a STARTING POINT only — NOT canon. Knight overlays LB canon throughout, does not defer to the HTML structure where it conflicts with MEMORY.md canons or BP084/BP085 minted canons. Every section goes live only after Founder ratify. BP078 BLOOD — no publish without explicit Founder ratify per piece.

---

## SEG DECOMPOSITION

Dependencies: SEG-1 must complete before SEG-2 through SEG-8 begin. SEG-2 through SEG-7 may run in parallel after SEG-1. SEG-8 gates on all prior SEGs.

---

### SEG-1 · Recon — Current cerostechnology.com State

**Goal:** Establish ground truth of what is deployed today before writing a single line of new code.

**Steps:**
1. Locate the cerostechnology.com repo. Check: local disk (common paths: `C:\Users\Administrator\Documents\LianaBanyanPlatform\`, any `ceros*` folder), Firebase hosting config (`firebase.json`, `.firebaserc`), and GitHub remote. If multiple candidates, list all — do NOT assume.
2. Pull/clone if needed. Read `firebase.json` + `.firebaserc` to confirm hosting project ID.
3. Read current `index.html` (or equivalent entry point) in full. Note: sections present, sections missing, any canon violations (horizontal scroll, raw email addresses, missing Marks/IP language).
4. Check deployed live site via `curl -s https://cerostechnology.com | head -100` for HTTP status + title tag.
5. List all assets (images, CSS, JS bundles) — flag any files >500KB that will need optimization.

**Output (write to disk):** `CEROSTECH_RECON_BP085.md` in `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` containing:
- Hosting confirmed: Firebase project ID
- Repo path on disk
- Current sections list
- Canon violations found
- Asset inventory with sizes
- Recommended carry-forward vs. replace per section

**SEG-1 is a gate.** Do NOT spawn SEG-2 through SEG-8 until this file exists and Knight has read it.

---

### SEG-2 · Hero Section

**Goal:** Mint the new hero with canonical tagline, stats row, and bioluminescent visual direction.

**Tagline (verbatim — do NOT paraphrase, reorder, or punctuate differently):**
> Permission to Board — Granted. Grab an Oar. Help make the Sails.

**Visual:** Bioluminescent Liana/Banyan network — deep-teal/midnight-blue field, glowing root-network tendrils, no photorealistic faces, no stock imagery. If an existing SVG/canvas asset exists from prior design work, carry it forward. If not, implement as a CSS/canvas animated gradient approximation; do NOT block ship on custom illustration.

**Stats row (four stats, horizontal on desktop / vertical stack on mobile — NEVER SCROLL SIDEWAYS canon applies):**
- 89% recall lift
- 21 patents filed
- 83.3% creator pay
- 1,116+ systems

**Subhead (one sentence):** Ground-floor invitation to the Substrate + Substrace Theorem revolution — build on infrastructure that remembers.

**CTA buttons:**
- Primary: "Explore the Work" (scrolls to Selected Work)
- Secondary: "Grab an Oar" (scrolls to Become-the-Boss Bounty Wall)

**Canon compliance checklist (SEG-2 must verify before marking done):**
- [ ] Tagline reads verbatim — character-for-character
- [ ] Stats row: no horizontal scroll on 320px viewport
- [ ] No `overflow-x: scroll` or `overflow-x: auto` on any element in hero section
- [ ] 83.3% (not "83", not "84", not "~83")

---

### SEG-3 · Selected Work Section

**Goal:** Four project cards with real links, real status badges, real receipts inline. No vaporware language.

**Cards (in order):**

1. **MnemosyneC** — Full-width feature card. Status badge: LIVE. Link: https://mnemosynec.ai. Descriptor: "AI-native memory substrate — Substrate Awakens launch 2026-06-20. 89.3% Claude recall · 93.3% GPT recall." Receipt anchor: link to /download/ Tower of Peace page.

2. **Liana Banyan** — Status badge: LIVE. Link: https://lianabanyan.com. Descriptor: "Cooperative platform hub — Capitalist Cooperative · 83.3% creator pay · Employ the World bounty system."

3. **Cephas / the2ndSecond** — Status badge: ACTIVE. Link: (pull from recon — confirm live URL). Descriptor: "Sequential publish adapter chain — Substack-anchored, Battery Dispatch wired (v0.3.0)."

4. **HexIsle** — Status badge: (pull from recon — confirm live URL and status; do NOT assume LIVE). Descriptor: (pull from recon — do NOT invent). If status unknown, badge = IN PROGRESS and note Founder gate required.

**Card layout:** CSS Grid, 2-col desktop / 1-col mobile. MnemosyneC card spans 2 columns (full-width feature). NEVER SCROLL SIDEWAYS.

**Founder gate dependency:** HexIsle status and descriptor must come from Founder confirm or recon — SEG-3 may render a placeholder card marked `[FOUNDER GATE REQUIRED]` and ship the other three.

---

### SEG-4 · Proof Wall

**Goal:** Six proof cards with evidence citations and CTAs to live diagnostic endpoints.

**Cards (verbatim stat labels — do not round, do not paraphrase):**

1. **89.3% Claude Recall Lift** — Source: MnemosyneC internal empirical. CTA: mnemosynec.ai/?diag=1
2. **93.3% GPT Recall Lift** — Source: MnemosyneC internal empirical. CTA: mnemosynec.ai/?diag=1
3. **20/20 Mesh Proof** — Source: distributed eval CLI methodology. CTA: mnemosynec.ai/download/
4. **Zero Data Lost · Storm Test** — Source: substrate Storm Test. CTA: mnemosynec.ai/download/
5. **K533 Public Pack** — Source: Package Store canonical public release. CTA: mnemosynec.ai/download/
6. **16.6ms Latency** — Source: substrate node latency empirical. CTA: mnemosynec.ai/?diag=1

**Layout:** CSS Grid 3-col desktop / 2-col tablet / 1-col mobile. NEVER SCROLL SIDEWAYS.

**Truth-Always constraint:** If any stat cannot be confirmed against a real receipt in the recon file, SEG-4 must flag it `[NEEDS RECEIPT — FOUNDER GATE]` rather than publish an unverified number.

---

### SEG-5 · Patent Portfolio Section

**Goal:** Table of IP domains + Pledge statement.

**Table structure (5 domain rows):**

| IP Domain | Provisional # | Status | Core Claim |
|---|---|---|---|
| Substrate Memory Architecture | (from MEMORY.md canon) | Filed | Persistent context accumulation across AI sessions |
| Truth Integrity Chain | PROV_22 (7pp head-start) | In Progress | Dependency-argument eblet + 12-loop Plow + Negative-Knowledge Tokens |
| Federated Node Frontier | (from MEMORY.md canon) | Filed | Cooperative mesh heartbeat + Thorax enforcement |
| Three-Currency Substitution Rail | (from MEMORY.md canon) | Filed | Fiat/Marks/Barter substitution without fiat-holding |
| Mimic Trunks Gate-and-Tunnel | (from MEMORY.md canon) | Filed | Partner cooperative volume benefit pattern |

**Note to Knight:** Pull exact provisional numbers from MEMORY.md canon eblets before rendering the table. Do NOT invent numbers. If a number is not confirmed in recon, leave the cell as `[CONFIRM]`.

**Pledge statement:** Pull the verbatim Pledge #2260 wording from MEMORY.md canon. DO NOT paraphrase. If the exact wording is not in scope at time of SEG-5 dispatch, Knight must query Bishop for the verbatim text before rendering this section. Rendering a paraphrase violates Truth-Always.

**Total count:** "21 patents filed" per stats row. If table shows fewer than 21 rows, add a note: "+ [N] additional provisionals — full list on request."

---

### SEG-6 · Become-the-Boss Bounty Wall

**Goal:** NEW section — the primary LB canon layer that the deep-research agent missed entirely. This is the cooperative hiring portal backed by Marks-based payroll and IP-portfolio collateral.

**Page-banner (Employ the World canon — verbatim above the bounty poster grid):**
> Employ the World

**Section header:** "Become the Boss — Your Way"

**Subhead:** "Three founding chapters are open. Run one. Earn in Marks. Own IP. Build on cooperative infrastructure."

**Three Founding Chapter Bounty Posters:**

---

**Poster 1 · 12 Cities Project**

- **Chapter name:** 12 Cities Project
- **What the PM runs:** Coordinates cooperative node launch across 12 metropolitan pilot cities. Owns city-lead recruitment, local Guild Chapter seeding, and regional Bounty Poster campaigns.
- **Marks-backed payroll terms:** [FOUNDER GATE — approve rate: Marks-per-month or Marks-per-deliverable before render]
- **IP-portfolio collateral note:** PM earns permanent attribution credit on all cooperative infrastructure improvements originating from their city chapter. Attribution minted on Immutable Blockchain IP Medallion.
- **Framing:** "You don't report to a board. You run the chapter. Marks back your payroll. The cooperative's IP portfolio backs your credibility."
- **Apply button:** Cooperative checkout system — [FOUNDER GATE — confirm Stripe/Substitution rail or dedicated portal before wiring]
- **Badge:** FOUNDING CHAPTER — OPEN

---

**Poster 2 · MnemosyneC Next Generation**

- **Chapter name:** MnemosyneC Next Generation
- **What the PM runs:** Owns the v0.5.x → v0.6.x → v0.7.x roadmap execution layer. Coordinates Knight Yoke dispatches for Personal Subscription Steward (T1/T2/T3), Package Store Bakery/Confectionary/Kitchen, and Constellation Switchboard UX.
- **Marks-backed payroll terms:** [FOUNDER GATE — approve rate]
- **IP-portfolio collateral note:** PM earns attribution credit on all MnemosyneC feature provisionals (PROV_22 + forward). First-100 Founding-Replicator status granted on acceptance.
- **Framing:** "You don't maintain the app. You drive what it becomes. 21 patents filed. The next batch has your name on them."
- **Apply button:** Cooperative checkout system — [FOUNDER GATE]
- **Badge:** FOUNDING CHAPTER — OPEN

---

**Poster 3 · NOIDs**

- **Chapter name:** NOIDs
- **What the PM runs:** [FOUNDER GATE — Founder to supply scope descriptor for NOIDs chapter before render. Bishop does not have sufficient canon to invent this accurately. Truth-Always: do not fabricate scope.]
- **Marks-backed payroll terms:** [FOUNDER GATE — approve rate]
- **IP-portfolio collateral note:** Attribution credit per cooperative IP Medallion standard.
- **Framing:** "Permission to Board — Granted. Grab an Oar." [FOUNDER GATE — full framing pending NOIDs scope confirm]
- **Apply button:** Cooperative checkout system — [FOUNDER GATE]
- **Badge:** FOUNDING CHAPTER — OPEN

---

**Break Off a Piece tagline (render below the three posters — verbatim):**
> Break off a Piece. Make it Yours by Rebuilding It Better. Show Off and Earn.

**Safe-firing addendum (render as small-print under tagline):**
> Code Breakers fire only on own server / computer / Mimic Trunk. Never on production canonicals.

**Layout:** Three poster cards in CSS Grid — 3-col desktop / 1-col mobile. Each card is a vertical flex column: badge → chapter name → scope → payroll terms → collateral note → framing → Apply button. NEVER SCROLL SIDEWAYS.

---

### SEG-7 · About / Network / Contact

**Goal:** Founder story, 5-property link card grid, contact form (no raw email — anti-spam), SEO meta, canonical cross-references.

**Founder card:**
- Name: [FOUNDER GATE — Denken / J Jones / other — Founder approves which name displays]
- Bio: Pull from established canon. Do NOT invent biographical claims not confirmed in MEMORY.md.
- Photo: Only if Founder has approved an image asset. If none confirmed, use an abstract geometric avatar consistent with bioluminescent visual theme.

**5-property link cards:**
1. mnemosynec.ai — "AI Memory Substrate · LIVE"
2. lianabanyan.com — "Cooperative Platform Hub · LIVE"
3. cerostechnology.com — "Engineering Studio · YOU ARE HERE"
4. Cephas / the2ndSecond — (URL from recon)
5. HexIsle — (URL + status from recon or Founder gate)

**Contact form:** Name + Email + Message fields. POST to a Supabase Edge Function endpoint (Knight: wire to existing social-oauth-callback infrastructure or create a dedicated `contact-form` Edge Function — do NOT use `mailto:` raw link). Anti-spam: honeypot field + rate-limit at Edge Function layer.

**SEO meta tags (render verbatim in `<head>`):**
```html
<title>Ceros Technology | Cooperative Infrastructure Engineering Studio</title>
<meta name="description" content="21 patents filed. 89.3% recall lift empirical. 83.3% creator pay. Cooperative engineering studio building substrate-OS infrastructure — MnemosyneC, Liana Banyan, and beyond.">
<link rel="canonical" href="https://cerostechnology.com/">
```

**Canonical cross-references (render in `<head>`):**
```html
<meta property="og:see_also" content="https://mnemosynec.ai">
<meta property="og:see_also" content="https://lianabanyan.com">
```

**Structured data:** Add `Organization` schema.org JSON-LD block with name, url, sameAs array pointing to mnemosynec.ai and lianabanyan.com.

---

### SEG-8 · Deploy + Sharps

**Goal:** Firebase deploy + 9-Sharp verification table returned in Yoke-return report.

**Deploy steps:**
1. Run `firebase deploy --only hosting` from repo root.
2. Confirm deploy receipt: Firebase CLI output URL + timestamp.
3. Wait 60 seconds for CDN propagation before running Sharps.

**9 Sharps (Knight must verify each and return GREEN/RED with evidence):**

| Sharp # | Check | Pass Condition |
|---|---|---|
| S1 | Hero loads | HTTP 200 + `<h1>` or hero section present in DOM within 3s |
| S2 | Tagline reads verbatim | Page source contains exact string: `Permission to Board — Granted. Grab an Oar. Help make the Sails.` |
| S3 | 4 work cards link out | All 4 `<a>` hrefs in Selected Work section return HTTP 200 (curl check) |
| S4 | 6 proof cards link out | All 6 proof card CTAs point to mnemosynec.ai endpoints; HTTP 200 on root domain |
| S5 | Patent table renders | Table with 5+ rows present in DOM; Pledge #2260 text present in source |
| S6 | 3 bounty posters render with checkout buttons live | 3 poster cards present; Apply buttons have href or onclick wired to checkout system (not `#` placeholder) |
| S7 | No horizontal scroll | `document.documentElement.scrollWidth <= window.innerWidth` at 320px viewport (use headless browser check or manual verify at 320px) |
| S8 | Meta tags present | `<title>` contains "Ceros Technology" + `<meta name="description">` present + `<link rel="canonical">` present |
| S9 | Canonical cross-refs resolve | mnemosynec.ai and lianabanyan.com both return HTTP 200 (confirms cross-ref targets are live) |

**Sharp S6 caveat:** If Founder gates on checkout-system Apply mechanism are not resolved before SEG-8, Apply buttons may render as `[GATE PENDING]` disabled state. S6 will return RED with note "Awaiting Founder Gate: checkout-system Apply mechanism." This is acceptable — deploy proceeds, Red Sharp logged, gate tracked.

---

## FOUNDER GATES

Mark each APPROVED / DECLINED / MODIFIED before Knight dispatches SEG-6 and SEG-7 fully.

- [ ] **GATE-1 · Tagline verbatim lock** — Approve final tagline wording: "Permission to Board — Granted. Grab an Oar. Help make the Sails." (Founder direct, locking here for record.)
- [ ] **GATE-2 · PM payroll rate** — Approve Marks-backed payroll structure: Marks-per-month OR Marks-per-deliverable? Specify rate if known, or authorize Knight to publish `[Rate — Apply to Negotiate]` placeholder.
- [ ] **GATE-3 · Chapter list** — Confirm: 12 Cities Project + MnemosyneC Next Generation + NOIDs = the three founding chapters at launch. Open more at launch or hold to these three?
- [ ] **GATE-4 · Checkout-system Apply mechanism** — Same Stripe/Substitution rail as cooperative checkout? Or dedicated application portal? Knight needs wiring spec before SEG-6 Apply buttons go live.
- [ ] **GATE-5 · Patent table scope** — Full 21-provisional list (all rows) OR 5-domain summary table with "+ N additional on request" note?
- [ ] **GATE-6 · Founder name on About card** — Which name displays: Denken / J Jones / other? Also: approve or decline founder photo asset for the card.
- [ ] **GATE-7 · NOIDs chapter scope** — Provide scope descriptor for NOIDs chapter PM role. Bishop does not have sufficient canon to render this accurately without Founder input. Truth-Always hard block on fabrication.
- [x] **GATE-8 · HexIsle status** — LOCKED by Founder direct BP085. HexIsle work card must lead with "Manufacturing BackBone for the Physical Decentralized Factory — 3D + SLS + Desktop Injection Molding". Live URL: hexisle.com. Detail copy TBD by Founder — placeholder ok. Canon eblet: `canon_hexisle_manufacturing_backbone_physical_decentralized_factory_bp085.eblet.md`.

---

## TRUTH-ALWAYS CONSTRAINTS

These are non-negotiable. Knight SEGs must verify each before any section goes to deploy.

- **83.3% creator pay** — Verbatim. Not "83%", not "84%", not "approximately 83%". The extra decimal is the receipt.
- **Cost+20% margin language** — Where margin language appears, verbatim from canon. Do not round, do not simplify.
- **Pledge #2260 wording** — Pull verbatim from MEMORY.md canon eblet. DO NOT paraphrase. If exact text is not accessible at dispatch time, Knight queries Bishop before rendering — never invents a paraphrase.
- **No tokens-as-securities language** — Marks are not tokens. Marks are not securities. No language that could be read as a securities offering. Cooperative Marks = internal unit of account + reputation weight. Legal review before any public-facing Marks-as-investment framing.
- **NEVER SCROLL SIDEWAYS** — Zero `overflow-x: scroll` or `overflow-x: auto` on any page element except code blocks. Verified at 320px viewport in Sharp S7.
- **Distribution dual-path** — Where download links appear: PRIMARY = self-hosted mnemosynec.ai/download/ (CTA button) + FALLBACK = small "Try the GitHub mirror →" link below. Both, not OR. Per BP081 distribution canon.
- **BP078 BLOOD** — No section goes live without explicit Founder ratify per piece. SEG-8 does not deploy until Founder has ratified each section OR explicitly authorized Knight to deploy with Red-Sharp gates marked.
- **Receipts only** — Every stat on the Proof Wall and in the stats row must have a traceable receipt in the recon file or MEMORY.md canon. No invented numbers. No rounded-for-marketing numbers.
- **No horizontal scroll on any homepage/product UI** — Applies to all breakpoints. Code blocks are the only exception per BP081 UX canon.

---

## RETURN-TO-BISHOP REPORT FORMAT

Knight Yoke-return MUST include all of the following — no abbreviated reports.

**Header:**
```
YOKE-RETURN · CEROSTECHNOLOGY REBUILD · BP085
Model: Sonnet 4.6
Date: [ISO date]
Status: [COMPLETE / PARTIAL — gates pending / BLOCKED]
```

**9 Sharps Table:**

| Sharp | Check | Status | Evidence |
|---|---|---|---|
| S1 | Hero loads | GREEN / RED | [URL + HTTP status + load time] |
| S2 | Tagline verbatim | GREEN / RED | [grep output or page-source snippet] |
| S3 | 4 work cards link out | GREEN / RED | [curl results for each href] |
| S4 | 6 proof cards link out | GREEN / RED | [curl results] |
| S5 | Patent table + Pledge | GREEN / RED | [DOM presence confirm + Pledge text first 10 words] |
| S6 | 3 bounty posters + checkout | GREEN / RED | [DOM presence + button state] |
| S7 | No horizontal scroll | GREEN / RED | [viewport test result at 320px] |
| S8 | Meta tags | GREEN / RED | [title + description + canonical snippets] |
| S9 | Canonical cross-refs | GREEN / RED | [HTTP 200 confirms for both domains] |

**Live URL:** https://cerostechnology.com (post-deploy)

**Screenshots:** If Knight can capture via headless browser or screen capture tool — attach or link. Not required to block return, but include if available.

**Founder Gates Status:**

| Gate | Status | Resolution |
|---|---|---|
| GATE-1 Tagline | [AUTO-RESOLVED / PENDING / DECLINED] | [how resolved or why pending] |
| GATE-2 PM payroll | [AUTO-RESOLVED / PENDING / DECLINED] | [details] |
| GATE-3 Chapter list | [AUTO-RESOLVED / PENDING / DECLINED] | [details] |
| GATE-4 Checkout Apply | [AUTO-RESOLVED / PENDING / DECLINED] | [details] |
| GATE-5 Patent scope | [AUTO-RESOLVED / PENDING / DECLINED] | [details] |
| GATE-6 Founder name | [AUTO-RESOLVED / PENDING / DECLINED] | [details] |
| GATE-7 NOIDs scope | [AUTO-RESOLVED / PENDING / DECLINED] | [details] |
| GATE-8 HexIsle status | [AUTO-RESOLVED / PENDING / DECLINED] | [details] |

**Any blockers / anomalies:** Freeform. Document anything that required a judgment call, any canon conflict encountered, any SEG that failed and how it was resolved.

---

*Yoke composed by Bishop SEG · Sonnet 4.6 · BP085 · 2026-06-16*
*No sub-agents used in Yoke composition. Knight dispatches SEGs per decomposition above.*
