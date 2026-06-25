Sonnet 4.6

YOKE: KNIGHT_YOKE_MNEMOSYNEC_TURNKEY_JOIN_SURFACE_BP085
STATUS: COMPLETE

Gate — member_profiles exists: YES
  — Verified via `npx supabase db query --linked` against ruuxzilgmuwddcofqecc
Gate — Wave 2 (.org parity): GREEN (confirmed prior)
Gate — Membership-Fix yoke return: PRESENT
  — `BISHOP_DROPZONE/00_FOUNDER_REVIEW/KNIGHT_YOKE_MEMBERSHIP_JOIN_PAY_FIX_P0_BLOCKER_BP085.md`

---

## SEG-1: Site Audit

| File Path | What it is | Join CTA (pre-Yoke) |
|---|---|---|
| `Cephas/cephas-hugo/config-mnemosynec.toml` | MnemosyneC site config + menus | nav-join entry existed but pointed to external `https://lianabanyan.com/join` |
| `layouts/partials/mnemosynec-homepage.html` | Custom homepage partial (isMnemosynec=true path) | `/join/` link in About section only (line ~1147); no CTA in nav-links or hero |
| `themes/PaperMod/layouts/partials/header.html` | Site-wide nav header (PaperMod) | Menu driven by `site.Menus.main`; no Join button styling |
| `layouts/partials/extend_footer.html` | Site-wide custom footer | No join link |
| `layouts/join/` | Join layout directory | Empty (no HTML files) |
| `content-mnemosynec/` | MnemosyneC content dir | No join section |

Key discovery: `create-mnemosynec-checkout` Edge Function (deployed 2026-06-15) has `CORS: "*"` and creates Stripe Embedded Checkout sessions. Stripe publishable key already in `config-mnemosynec.toml` as `params.stripePk`. → Option A viable at zero CORS cost.

---

## SEG-2: Join CTA Injections

**2A. Top-nav button:**
- `config-mnemosynec.toml` — changed `nav-join` name from "Join" → "Join — $5/yr" and URL from external → `/join/` [weight=6]
- `layouts/partials/extend_head.html` — added CSS block (isMnemosynec-gated) targeting `#menu a[href$="/join/"]` as gold filled button (#d69e2e background, #0a1628 text, border-radius 6px, font-weight 700)
- Verified in live HTML: `href=https://mnemosynec.ai/join/ title="Join - $5/yr"` — minifier drops quote chars (keepQuotes=false), link present

**2B. Homepage hero secondary CTA:**
- `layouts/partials/mnemosynec-homepage.html` — added `.mn-hero-join-cta-wrap` + `<a href="/join/" class="hero-join-cta">Join the Cooperative — $5/yr</a>` below download block
- CSS added: outlined gold button, visually subordinate to download, stacks block on mobile ≤720px
- Also added to `mn-hp-nav-links` paragraph: `· <a href="/join/"><strong>Join — $5/yr</strong></a>`

**2C. Footer link:**
- `layouts/partials/extend_footer.html` — appended `| <a href="/join/">Join the Cooperative</a>` in gold dotted-underline style

| Injection | File | Approx line |
|---|---|---|
| Nav button (config) | `config-mnemosynec.toml` | line 96–99 |
| Nav button (CSS) | `layouts/partials/extend_head.html` | lines 1–30 (new block) |
| Hero CTA | `layouts/partials/mnemosynec-homepage.html` | after download block (hero-join-cta-wrap) |
| Nav-links paragraph | `layouts/partials/mnemosynec-homepage.html` | mn-hp-nav-links section |
| Footer link | `layouts/partials/extend_footer.html` | line 8 (appended) |

---

## SEG-3: Option A — Native Join Page with Stripe Embedded Checkout

**Rationale:** `create-mnemosynec-checkout` Edge Function deployed 2026-06-15 with `CORS: "*"`. Stripe publishable key (`pk_live_51...`) and supabase functions URL already in `config-mnemosynec.toml` params. CORS plumbing = zero hours. Option A chosen.

**Files created:**
- `content-mnemosynec/join/_index.md` — frontmatter: title/description/layout=join
- `layouts/join/list.html` — full join page with Stripe embedded checkout
  - "Join the Cooperative" h1 headline
  - "$5/yr — one membership, one vote" subtitle
  - Bullet list: One vote · Workers keep the majority · Built in Public (link to /proofs/) · Permission to Board · Cooperative Defensive Patent Pledge
  - Join button launches embedded Stripe checkout via `create-mnemosynec-checkout` Edge Function
  - JS: fetch clientSecret → `stripe.initEmbeddedCheckout` → mount to `#join-stripe-container`
  - return_url: `window.location.origin + '/join/success/'`
  - Price: `price_1TjVRjRlWRgRXQ3YAjBRw8o8` ($5/yr cooperative membership, from Edge Function)
- `content-mnemosynec/join/success/_index.md` — frontmatter: layout=join-success
- `layouts/join/join-success.html` — "You're in. Welcome to the Cooperative." success page

**Stripe price in use:** `price_1TjVRjRlWRgRXQ3YAjBRw8o8` (from `create-mnemosynec-checkout/index.ts` line 53)
**Edge Function:** `create-mnemosynec-checkout` at `https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/create-mnemosynec-checkout`

---

## SEG-4: Copy Review

| Item | Status | Notes |
|---|---|---|
| "Join the Cooperative" headline (not "Subscribe") | PASS | `<h1>Join the Cooperative</h1>` |
| $5/yr verbatim | PASS | "$5/yr — one membership, one vote" + button text "Join the Cooperative — $5/yr" |
| "Built in Public" tagline/link | PASS | "Built in Public — every proof is published" (links to /proofs/) |
| "Permission to Board" reference | PASS | "Permission to Board. Your membership is your seat at the table." |
| NO 83.3% on join page | PASS (fixed) | Initially flagged — removed. Now reads "Workers keep the majority" |
| No horizontal scroll on any new surface | PASS | `overflow-x: hidden` on html/body in all new layouts |
| No "subscription"/"service"/"platform" words | PASS | Uses "Cooperative" throughout; "Annual renewal" used in trust line (not "subscription") |
| "Cooperative" framing confirmed | PASS | "Join the Cooperative", "member-owner", "Cooperative Defensive Patent Pledge" |

---

## SEG-5: Build + Deploy + 5 Sharps

**Build:** `hugo --minify --config config-mnemosynec.toml`
- Exit code: 0
- Pages: 50 (up from prior count — join/ and join/success/ added)
- Build time: ~35s

**Deploy:** `firebase deploy --only hosting:mnemosyne -P default`
- Exit code: 0 (completed after large file upload)
- Hosting URL: https://mnemosyne-lianabanyan.web.app
- Release: complete

### 5 Sharps

| Sharp | Target | Expected | Status |
|-------|--------|----------|--------|
| S1 | mnemosynec.ai/join/ | HTTP 200 | ✅ GREEN — 200 |
| S2 | mnemosynec.org/join/ | HTTP 200 | ✅ GREEN — 200 |
| S3 | mnemosynec.ai/ homepage | HTTP 200 | ✅ GREEN — 200 |
| S4 | Nav /join/ link in homepage HTML | Present | ✅ GREEN — `href=https://mnemosynec.ai/join/` present (minifier drops quotes per keepQuotes=false) |
| S5 | Footer /join/ text in homepage HTML | Present | ✅ GREEN — "Join the Cooperative" text found in footer |

All 5 Sharps GREEN.

---

## Checklist

- [x] Gate condition confirmed — member_profiles EXISTS; membership-fix yoke return PRESENT
- [x] SEG-1 audit table — 6 files audited, paths confirmed
- [x] SEG-2 diff summary — 5 injection points across 3 files + config
- [x] SEG-3 option chosen — Option A (native Stripe Embedded Checkout); rationale: CORS already *, Edge Function live, Stripe PK in config
- [x] SEG-4 copy review — 8 items checked, 83.3% flag self-corrected before deploy
- [x] SEG-5 Sharps — all 5 GREEN
- [x] "Sonnet 4.6" verbatim
- [x] No horizontal scroll on any new surface
- [x] $5/yr verbatim present on join surface
- [x] "Cooperative" framing confirmed — no "subscription", "platform", "service"
