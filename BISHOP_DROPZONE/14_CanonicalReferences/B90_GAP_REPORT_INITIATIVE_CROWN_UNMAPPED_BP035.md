# B90 Gap Report — Initiative × Crown Unmapped Analysis

**Bushed:** B90 | **Session:** BP035 | **Knight:** Cursor Sonnet 4.6 | **Date:** 2026-05-09
**Sources:** Supabase `initiative_crowns` + disk Crown letter glob + canonical spec

---

## Part A: Initiatives With NO Crown (6 of 16)

These 6 initiatives have zero Crown assignments in Supabase AND zero active Crown letters on disk.

| # | Initiative | DB Status | Disk Letter | Recommended Crown Class | Urgency |
|---|---|---|---|---|---|
| **2** | Let's Get Groceries | VACANT | None | Grocery/food access expert; cooperative food systems champion | HIGH — core marketplace initiative, no Crown |
| **4** | Household Concierge | VACANT | None | Home services / aging-in-place expert | HIGH — crown letters exist in archive (Marie Kondo, Ai-jen Poo adjacent) |
| **6** | Tatiana Schlossburg Health Accords | TRIBUTE | Tribute in prep (K420) | Named in honor of Tatiana Schlossberg (deceased). Need a living Crown steward to champion the initiative. | CRITICAL — Founder ratification required on tribute approach + steward identity |
| **7** | MSA | VACANT | None | Unknown — MSA initiative content needed to identify Crown class | BLOCKED — initiative description unknown to Knight; Founder must clarify scope |
| **11** | Let's Make Bread | VACANT | None | Maker / artisan / worker-owned baking or food production champion | MEDIUM — Molly Hemstreet (archive) is candidate |
| **13** | JukeBox | VACANT | None | Music industry / artist rights / independent artist champion | MEDIUM — no candidate identified on disk |

### §A Notes

**Initiative #6 — Tatiana Schlossburg Health Accords (CRITICAL)**
- K420 migration (BP109) established that Tatiana Schlossberg is deceased.
- The "Direct" variant letter was archived (do-not-dispatch).
- The approved send version is an "In Honor Of" tribute letter, Wave 2.
- The DB `initiative_crowns` table has NO entry for initiative #6.
- **Founder action required:** Who serves as living Crown steward for the Health Accords? Possible candidates: a public health figure, a climate-health researcher (Tatiana Schlossberg's specialty), or a women's health advocate. Founder must name this Crown.

**Initiative #7 — MSA (BLOCKED)**
- No Crown letter on disk. No DB entry.
- "MSA" is in the canonical Sweet Sixteen list but its full scope/description is not surfaced in the Knight-accessible spec.
- **Founder must clarify** MSA's purpose before Crown can be identified. (MSA = Mutual Support Agreement? Main Street Alliance? Military Service Accomodation?)

**Initiative #4 vs. Initiative #5 numbering note**
- Marie Kondo archive letter exists (household / organizing) but was never formalized. Strong candidate for #4 Household Concierge.
- The DB assigns "Household Steward"-titled Crowns to initiative #5 (The Family Table). See §D in the Reconciliation Report for full analysis.

---

## Part B: Crown Letters on Disk NOT Mapped to Any Initiative (23 unique recipients)

These recipients have Crown letters but NO `initiative_crowns` row in Supabase. They require Founder ratification to either: (a) assign to an initiative, (b) classify as advisory/endorser (non-initiative Crown), or (c) deprecate.

### B1 — Strong Initiative Mapping Candidates (Bishop recommends assignment)

| Recipient | Proposed Initiative | Rationale | Disk Letter |
|---|---|---|---|
| **Anne Fishel** | #5 The Family Table | Founder of The Family Dinner Project (Harvard Medical School); intergenerational dinner science; perfect alignment | Archive: `CROWN_LETTER_ANNE_FISHEL.md` |
| **Ruth Glenn** | #8 Defense Klaus | CEO, National Domestic Violence Hotline; US Shield counterpart to Robert Kaiser (UK Shield); natural dual-Crown for DV initiative | Wave 1: `CROWN_LETTER_RUTH_GLENN.md` (SEC_FIXED_V2) |
| **Marie Kondo** | #4 Household Concierge | KonMari method; household organization expert; strong #4 alignment | Archive only |
| **Molly Hemstreet** | #11 Let's Make Bread | Worker-cooperative bakery leader; maker economy alignment | Archive only |
| **Muhammad Yunus** | #2 Let's Get Groceries or #10 VSL | Grameen Bank founder; cooperative microfinance; strong alignment with either cooperative grocery access or VSL cooperative lending | Archive |
| **Harry Moser** | #16 Brass Tacks | Reshoring Initiative founder; American manufacturing; "Brass Tacks" maker/builder spirit | Archive |
| **Sallie Krawcheck** | #10 VSL | Ellevest founder; women's investing; cooperative savings alignment | Archive |

### B2 — Advisory / Endorser Class (non-initiative Crown; different classification)

| Recipient | Classification | Notes |
|---|---|---|
| MacKenzie Scott | Board Chair / Major Donor | Multiple versions (v004–v014i); Board Chair framing; philanthropic scale; not initiative-specific Crown |
| Trebor Scholz | Platform Advisor / Cooperative Economy | Pedestal Forum / platform cooperativism expert; advisor + Red Carpet endorser class |
| Michael Seibel | Investor/Advisor | YC CEO; investor outreach; not initiative Crown |
| Tom Simon | Internal CFO Candidate | Role recruitment letter; not Crown |
| Dario Amodei (Anthropic) | CAI Licensing Partner | Technology licensing; not initiative Crown |
| Craig Newmark | Tech Philanthropy Advisor | Craigslist founder; civic tech philanthropist; possible #16 or advisory |
| Robert Herjavec | Patent Revenue Advisor | Investor; not initiative Crown |
| Olaf Scholz | International Political Advisor | Former German Chancellor; #15 international dimension possible |
| Jessica Jackley | Kiva Advisor | Microlending; possible #10 VSL or #2 Let's Get Groceries advisory |
| Alex Oshmyansky | Health/Pharma Advisor | Affordable medicine; possible #6 Health Accords or #4 Household Concierge steward |
| Taylor Swift | Cultural Ambassador | No clear initiative; cultural endorser class |
| Adria Powell | Advisory | Unknown — Founder to classify |
| Karla Hanson | Advisory | Unknown — Founder to classify |
| MariaElena Huambachano | Advisory | Unknown — Founder to classify |

### B3 — BP029 "Let's Make History" Campaign (17 letters; #15 expansion not in DB)

The 17 BP029 LETS_MAKE_HISTORY letters (11 governors + 6 celebrities) are a civic expansion campaign for Initiative #15 Power to the People. They are NOT in the `initiative_crowns` DB table.

**Status:** DRAFT letters on disk in `BISHOP_DROPZONE/14_CanonicalReferences/`; not formally offered; not seeded in DB.
**Action required:** Founder to decide if BP029 governors/celebrities are (a) inserted into `initiative_crowns` for #15 as additional Civic Champions, or (b) tracked via separate campaign table.

Recipients: Gov. Murphy (NJ), Gov. Lamont (CT), Gov. Moore (MD), Gov. Ferguson (WA), Gov. Kotek (OR), Gov. Lujan Grisham (NM), Gov. Hochul (NY), Gov. Pritzker (IL), Gov. Whitmer (MI), Gov. Healey (MA), Gov. Polis (CO), Dave Bautista, Will Ferrell, Jim Carrey, Zach Galifianakis, Zoe Saldana, Kumail Nanjiani.

---

## Part C: Status Distribution Summary

| Crown Status | Count (individual Crown rows) |
|---|---|
| OFFERED (in DB) | 5 (Maneet Chauhan, Mary Beth Laughton, Kimberly Williams, Cathie Mahon, Sal Khan) |
| PENDING (in DB) | 12 (Ai-jen Poo, Ashton Applewhite, Marc Freedman, Robert Kaiser, Brené Brown, Schwarzenegger, Bullock, Reeves, AOC, Dale Dougherty) |
| DRAFT (disk only) | ~26 (Ruth Glenn, Anne Fishel, Marie Kondo, Molly Hemstreet, Harvard UDN, 17 BP029 letters, + misc advisory) |
| TRIBUTE | 1 (Initiative #6) |
| VACANT (nothing anywhere) | 4 (#2, #7, #11, #13) |

**10 of 16 Initiatives: Crown assigned in DB**
**1 of 16: Tribute status (#6)**
**5 of 16: Crown completely absent (#2, #4, #7, #11, #13)**

*Note: #4 has archival Crown letters (Marie Kondo) and DB Crowns adjacent to its scope (assigned to #5), creating a numbering ambiguity requiring Founder resolution.*

---

*Authored B90 | BP035 | 2026-05-09 | Knight Cursor Sonnet 4.6*
