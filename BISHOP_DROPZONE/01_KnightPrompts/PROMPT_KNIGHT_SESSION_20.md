# KNIGHT SESSION 20 — Launch Runway: Cephas Full Deploy, Pathway QA, Opening Gambit Ready

## Mission
This is the launch runway. Three phases, executed in order:
1. **Full Cephas content deployment** — all 241+ docs live, searchable, styled
2. **Pathway QA** — every route works, every initiative loads, every feature functions as advertised
3. **Opening Gambit readiness** — media, social, letters all staged and SEC-clean

After this session, we launch.

## Prerequisites
- Migrations 000001–000020 all live on Supabase
- Session 19 scaffolds in place: CephasGatewayPage, UnderTheHoodPage, FlyOnTheWallPage, component scaffolds, cephas_ingest_registry.cjs
- Platform running at `LianaBanyanPlatform/platform/`

---

## PHASE 1: Full Cephas Content Deployment

### 1A. Run and verify content ingestion

```bash
cd platform && node scripts/cephas_ingest_registry.cjs
```

Verify:
- All academic papers ingested with `style: 'clean_academic'`
- All letters, system docs, initiative content ingested with `style: 'pudding'`
- Full-text search returns results for key terms ("Marks", "Coverage Minutes", "BandWagon", "Steward")
- No duplicate slugs, no missing titles

### 1B. Build category listing pages

Wire these routes (Session 19 prompt specified them but only gateway + UTH + FOTW were built):

```
/cephas/papers/          → Academic paper listing with version toggle
/cephas/papers/:slug     → Individual paper (clean academic styling)
/cephas/letters/         → Crown letter & outreach listing by recipient
/cephas/letters/:slug    → Individual letter (pudding styling)
/cephas/systems/         → System design docs listing
/cephas/systems/:slug    → Individual system doc (pudding)
/cephas/initiatives/     → Initiative content listing (link to Sweet Sixteen)
/cephas/initiatives/:slug → Individual initiative (pudding)
/cephas/innovations/     → Innovation registry (searchable cards)
/cephas/articles/        → Articles & thought leadership
/cephas/vault/           → Vault archive browser
/cephas/search           → Full-text search across all content
```

### 1C. Wire pudding-style components

Take the Session 19 scaffolds and make them functional:
- `ScrollySection` — scrollytelling with sticky graphics panel
- `FlipCard` — click/tap to reveal (replaces Hugo flipblock shortcodes)
- `PullQuote` — highlighted Founder quotes with attribution
- `InnovationCard` — expandable card showing innovation ID, description, patent bag, status
- `LetterHeader` — recipient name, role/Crown title, initiative association
- `TimelineEntry` — date + event for Fly on the Wall entries
- `InitiativeCard` — Sweet Sixteen initiative with status indicator

### 1D. Wire clean academic components

- `AcademicHeader` — title, author, date, innovation IDs, target journal
- `AbstractBlock` — highlighted abstract with border
- `CitationBlock` — proper academic citation format
- `InnovationClaimList` — numbered claims (MDP-001, MR-001, GI-001, etc.)
- `VersionToggle` — switch between Academic / TLDR / 6th Grade versions (same slug, different content)

### 1E. Populate Under the Hood metadata

For each document in the registry, populate:
- `technical_summary` — 1-2 sentence explanation of what this document covers technically
- `innovation_ids` — array of innovation IDs referenced (e.g., ["MDP-001", "MDP-020"])
- `related_patents` — USPTO application numbers where applicable
- `system_components` — platform systems referenced (e.g., ["coverage_minutes", "round_table", "harper_guild"])
- `implementation_status` — 'live', 'planned', or 'in_development'

### 1F. Populate Fly on the Wall metadata

For each document:
- `creation_context` — when/why created
- `bishop_session` — which Bishop session touched it (e.g., "Session 12")
- `knight_session` — which Knight session deployed it (e.g., "Session 19")
- `decision_log` — key decisions (e.g., ["Founder directed pudding styles for non-papers", "SEC language audited Session 12"])

### 1G. Press Junket page

Build `/cephas/press-junket` per MEDIA_DEPLOYMENT_MATRIX.md:
- Published articles (with Credit voting)
- Pending submissions
- Embargoed content
- Press kit download (logo, Founder bio, key facts)

---

## PHASE 2: Pathway QA — Full Platform Verification

### 2A. Route audit

Verify every route loads without errors. Test:

**Core pages:**
- `/` (landing/front page)
- `/about`
- `/terms-of-service`
- `/privacy-policy`

**Onboarding:**
- `/red-carpet` (Red Carpet welcome ceremony)
- `/welcome-gate` (Welcome Gate)

**Initiatives (all 16):**
- `/initiatives/lets-make-dinner`
- `/initiatives/lets-get-groceries`
- `/initiatives/lets-go-shopping`
- `/initiatives/lets-make-bread`
- `/initiatives/defense-klaus`
- `/initiatives/harper-guild`
- `/initiatives/jukebox`
- `/initiatives/lifeline-medications`
- `/initiatives/rally-group`
- `/initiatives/vsl`
- `/initiatives/msa`
- `/initiatives/didasko`
- `/initiatives/brass-tacks`
- `/initiatives/household-concierge`
- `/initiatives/power-to-the-people`
- `/initiatives/hexisle`

**Features:**
- `/bandwagon` (BandWagon project backing)
- `/steward` (Steward system)
- `/creator-pitch` (Creator Draft Pick)
- `/creator-showcase` (Creator profiles)
- `/crew-call` (Modular Manufacturing recruitment)
- `/cue-cards` (Cue Card deck)
- `/treasure-map` (Treasure Map discovery)
- `/bounty-board` (Bounty Board)
- `/patent-portfolio` (Patent Portfolio)
- `/economic-laws` (Economic Laws)
- `/tower-of-peace` (Tower of Peace cue cards)
- `/fly-on-the-wall` (Fly on the Wall)
- `/cephas` + all sub-routes

**Auth flows:**
- Signup → email confirmation → Red Carpet
- Login → dashboard
- OAuth (if wired)

### 2B. Feature verification

For each major feature, verify the happy path works:
- BandWagon: can browse projects, see backing tiers
- Steward: can view proposals listing
- Creator: can view showcase, see pitch page
- Bounty: can browse bounties, see XP display with box notation
- Cue Cards: deck displays, cards are shareable
- Treasure Map: loads, shows initiative paths

### 2C. Sweet Sixteen consistency check

Cross-reference `SWEET_SIXTEEN_CANONICAL.md` against:
- Crow's Nest navigation (all 16 present)
- Initiative routes (all 16 load)
- Initiative content pages on Cephas (all 16 have content)

### 2D. SEC language sweep

Run a final sweep of ALL user-facing text for prohibited terms:
- "equity" (should be "participation")
- "invest" / "investment" (should be "sponsor" / "contribute" / "back")
- "ROI" / "returns" (should be "service value" / "utility benefit")
- "shares" / "ownership" (should be "membership participation" / "service units")
- "profit" / "dividend" (should be "platform benefit" / "service credit")
- "revenue share" (should be "deferred payment for services rendered")

**KNOWN ISSUES TO FIX:**
- `SOCIAL_LINKEDIN_LAUNCH_POST.md` — contains "Actual ownership" and "real equity" via blockchain medallions. Change to "membership participation" and "service allocation authority"
- `SOCIAL_TWITTER_LAUNCH_THREAD.md` — Tweet 5 references "equity" and "ownership stakes." Change to "participation" and "governance rights"

### 2E. EIN/Wyoming verification

Confirm EIN (41-2797446) and "Wyoming C-Corp" have been removed from all public-facing pages EXCEPT TermsOfService.tsx and PrivacyPolicy.tsx. Bishop Session 12 made these edits — verify they're committed and deployed.

### 2F. Footer consistency

All footers should now show:
```
© 2026 Liana Banyan Corporation
```
No EIN. No Wyoming. Verify across all page components.

---

## PHASE 3: Opening Gambit Ready

### 3A. Letter staging

Per OPENING_GAMBIT_BISHOP_ANALYSIS.md, verify all letters are:
- Updated to 16 initiatives (was 14/15 in earlier versions)
- SEC-language clean
- Innovation count updated to 1,662
- EIN/Wyoming removed from any letter content
- Sorted by flag (AA/AB/AC/BA/BB/BC/T/H)

**Day 1 letters (17 total):**
- AA (morning): MacKenzie Scott, Michael Seibel, Hacker News, Product Hunt
- AB (afternoon): Sal Khan, Cory Doctorow, Casey Newton, TechCrunch, The Verge
- AC (evening): Trebor Scholz, Nathan Schneider, Molly White, Ars Technica

**Day 2 letters (30 total):**
- BA through BC: Dale Dougherty, Maneet Chauhan, Jose Andres, Mary Beth Laughton, Taylor Swift, Simon Sinek, Seth Godin, Esther Perel, academics, journalists, media pitches

**Trigger-based (17):** Fire on signup milestones (Buffett at 100 signups, etc.)
**Hold (9):** Reserved for strategic timing

### 3B. Social media staging

Prepare for deployment:
- **LinkedIn post** — SEC-clean version ready. Posting: Tuesday-Thursday, 8-10 AM or 5-6 PM
- **Twitter/X thread** — 15 tweets, SEC-clean. Schedule: 2:00 PM CST, every 5 minutes
- **Medium articles** — Scott open letter, Buffett open letter, Ruprecht article ready for self-publish

### 3C. Kickstarter Campaign #1 readiness

Per KICKSTARTER_CREATIVE_DIRECTION.md:
- SlottedTop campaign (Innovation #1552)
- Video closing sequence: Product → Shane Acker "9" quote → "No Atomo. Superman!" → Logo
- Alpha pricing: $1/year first 10,000 (vs. $5 standard)
- $500 Fiverr budget for campaign video

### 3D. Press Junket verification

Verify `/cephas/press-junket` is live with:
- Press kit (logo, Founder bio, key facts sheet)
- Publication targets listed
- Golden Key embed system documented

### 3E. Innovation count propagation

Verify 1,662 appears consistently across:
- Platform source (check any innovation count displays)
- .cursor/rules
- MILESTONE_HANDOFF_MARCH_2026.md (already updated by Session 19)
- Any public-facing pages that display innovation count

---

## DEPLOYMENT CHECKLIST

- [ ] Run content ingestion script
- [ ] Verify all documents in cephas_content_registry
- [ ] Build all Cephas category pages
- [ ] Wire pudding-style components (functional, not just scaffold)
- [ ] Wire clean academic components (functional)
- [ ] Populate Under the Hood metadata
- [ ] Populate Fly on the Wall metadata
- [ ] Build Press Junket page
- [ ] Route audit (all routes load)
- [ ] Feature verification (happy paths work)
- [ ] Sweet Sixteen consistency check
- [ ] SEC language sweep (fix LinkedIn + Twitter)
- [ ] EIN/Wyoming removal verified
- [ ] Footer consistency verified
- [ ] Letters updated (16 initiatives, 1,662 innovations, SEC-clean)
- [ ] Social media posts SEC-clean and staged
- [ ] Kickstarter creative direction confirmed
- [ ] Press Junket page live
- [ ] Innovation count propagated to 1,662 everywhere
- [ ] Final deploy to Firebase

---

## CRITICAL NUMBERS TO VERIFY EVERYWHERE

| Number | Meaning | Verify In |
|--------|---------|-----------|
| 1,662 | Total innovations | Platform, letters, social, press kit |
| 1,336 | Filed patent claims | Patent portfolio page, letters |
| 6 | Provisional applications | Patent portfolio page |
| 16 | Sweet Sixteen initiatives | Crow's Nest, letters, social |
| 83.3% | Creator retention | Front page, letters, social |
| Cost + 20% | Platform margin | Front page, letters, social |
| $5/year | Membership | Cue cards, social, letters |

---

## AFTER THIS SESSION

Launch sequence:
1. Deploy to Firebase
2. Fire Day 1 letters (AA → AB → AC)
3. Post LinkedIn + Twitter
4. Self-publish Medium articles
5. Submit to publications
6. Fire Day 2 letters (BA → BB → BC)
7. Monitor triggers (Buffett at 100 signups)
8. Launch Kickstarter Campaign #1 (SlottedTop)

---

*Generated by Bishop Session 12 — March 14, 2026*
*This is the launch runway. After Knight 20, we go.*
*FOR THE KEEP.*
