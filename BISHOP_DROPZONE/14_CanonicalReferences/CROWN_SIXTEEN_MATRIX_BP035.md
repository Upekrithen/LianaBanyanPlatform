# Crown × Sweet Sixteen Matrix — Canonical Reference

**Bushed:** B90 | **Session:** BP035 | **Knight:** Cursor Sonnet 4.6 | **Date:** 2026-05-09
**Data sources:** Supabase `initiative_crowns` table (seed: migration `20260404000020_initiative_crowns_reconciliation.sql`) + disk Crown letter glob (615 file paths, deduplicated to unique recipients) + canonical spec `.cursor/rules/liana-banyan-context.mdc` lines 42-59.

---

## Status Key

| Symbol | Meaning |
|---|---|
| OFFERED | Crown letter drafted; formally offered; awaiting response |
| PENDING | Crown assignment identified; letter exists or in progress; not yet formally offered |
| TRIBUTE | Initiative named in honor of deceased; no living Crown; tribute letter in preparation |
| VACANT | No Crown assignment exists; no disk letter |
| NONE | No Crown on disk or in DB |
| DRAFT | Letter on disk; NOT yet in Supabase as formal assignment |

---

## The Matrix

| # | Initiative | Crown Recipient | Crown Title | DB Status | Disk Letter(s) | Supabase Row |
|---|---|---|---|---|---|---|
| **1** | **Let's Make Dinner** | Maneet Chauhan | Crown (Grand Chef) | `OFFERED` | `CROWN_LETTER_MANEET_CHAUHAN.md` (archive: v1, UPDATED, -02, V04) | `initiative_crowns` #1 row |
| **2** | **Let's Get Groceries** | *(none)* | — | `VACANT` | None found | Not seeded |
| **3** | **Let's Go Shopping** | Mary Beth Laughton | Crown | `OFFERED` | `CROWN_LETTER_MARY_BETH_LAUGHTON.md` (archive: v1, -02) | `initiative_crowns` #3 row |
| **4** | **Household Concierge** | *(none)* | — | `VACANT` | None (Marie Kondo in archive, no active letter) | Not seeded |
| **5** | **The Family Table** | Ai-jen Poo | Household Steward | `PENDING` | `CROWN_LETTER_AI_JEN_POO-01.md` (archive) | `initiative_crowns` #5 row-1 |
| **5** | **The Family Table** | Ashton Applewhite | Age Champion | `PENDING` | `CROWN_LETTER_ASHTON_APPLEWHITE-01.md` (archive) | `initiative_crowns` #5 row-2 |
| **5** | **The Family Table** | Dr. Marc Freedman | Bridge Builder | `PENDING` | `CROWN_LETTER_MARC_FREEDMAN-01.md` (archive) | `initiative_crowns` #5 row-3 |
| **6** | **Tatiana Schlossburg Health Accords** | *(Tatiana Schlossberg — deceased)* | In Honor Of | `TRIBUTE` | `tribute-tatiana-schlossberg-in-honor-of` (K420; Cephas path, not a Crown letter) | `helm_content_queue` (tribute_letter, Wave 2) |
| **7** | **MSA** | *(none)* | — | `VACANT` | None found | Not seeded |
| **8** | **Defense Klaus ("For Someone You Love")** | Robert Kaiser | First Shield UK | `PENDING` | `CROWN_LETTER_ROBERT_KAISER.md` (archive: v1, UPDATED, -02, SEC_FIXED_V2) | `initiative_crowns` #8 row |
| **8** | **Defense Klaus ("For Someone You Love")** | Ruth Glenn *(see §Divergence D5)* | *(US Shield — proposed)* | `DRAFT` | `CROWN_LETTER_RUTH_GLENN.md` (archive: v1, UPDATED, -02, SEC_FIXED_V2) | **NOT in `initiative_crowns`** |
| **9** | **Rally Group** | Kimberly A. Williams | Crown | `OFFERED` | `CROWN_LETTER_KIMBERLY_WILLIAMS.md` (archive: v1, UPDATED, -02, SEC_FIXED_V2, FINAL) | `initiative_crowns` #9 row |
| **10** | **VSL** | Cathie Mahon | Crown | `OFFERED` | `CROWN_LETTER_CATHIE_MAHON.md` (archive: v1, -02) | `initiative_crowns` #10 row |
| **11** | **Let's Make Bread** | *(none)* | — | `VACANT` | None found | Not seeded |
| **12** | **Harper Guild** | Brené Brown | Harper Prime | `PENDING` | `CROWN_LETTER_BRENE_BROWN-01.md` (archive) | `initiative_crowns` #12 row |
| **13** | **JukeBox** | *(none)* | — | `VACANT` | None found | Not seeded |
| **14** | **Didasko (Academic)** | Sal Khan | Chancellor | `OFFERED` | `CROWN_LETTER_SAL_KHAN_FINAL.md` (archive: v1, V02, VERSION_C, SEC_FIXED_V2) | `initiative_crowns` #14 row |
| **14** | **Didasko (Academic)** | Harvard/UDN *(institutional)* | *(Institutional Crown — proposed)* | `DRAFT` | `CROWN_LETTER_HARVARD_UDN.md` (BISHOP_DROPZONE) | **NOT in `initiative_crowns`** |
| **15** | **Power to the People** | Arnold Schwarzenegger | Crown (Door-Opener, Right) | `PENDING` | `CROWN_LETTER_SCHWARZENEGGER_POLITICAL_EXPEDITION.md` | `initiative_crowns` #15 row-1 |
| **15** | **Power to the People** | Sandra Bullock | Crown (Builder, Action) | `PENDING` | `CROWN_LETTER_SANDRA_BULLOCK_POLITICAL_EXPEDITION.md` | `initiative_crowns` #15 row-2 |
| **15** | **Power to the People** | Keanu Reeves | Crown (Builder, Culture) | `PENDING` | `CROWN_LETTER_KEANU_REEVES_POLITICAL_EXPEDITION.md` | `initiative_crowns` #15 row-3 |
| **15** | **Power to the People** | Alexandria Ocasio-Cortez | Crown (Door-Opener, Left) | `PENDING` | `CROWN_LETTER_AOC_POLITICAL_EXPEDITION.md` | `initiative_crowns` #15 row-4 |
| **15** | **Power to the People** | *(11 Governors + 6 celebrities — BP029 expansion)* | *(Civic Champions)* | `DRAFT` | `CROWN_LETTER_GOV_*_LETS_MAKE_HISTORY_BP029.md` (14_CanonicalReferences); `CROWN_LETTER_*_LETS_MAKE_HISTORY_BP029.md` | **NOT in `initiative_crowns`** |
| **16** | **Brass Tacks** | Dale Dougherty | Maker Mentor, Lord Banyan of Brass Tacks | `PENDING` | `CROWN_LETTER_DALE_DOUGHERTY.md` (archive: v1, FINAL, -02, SEC_FIXED_V2) | `initiative_crowns` #16 row |

---

## Crown Status Summary

| Status | Count (Initiatives affected) |
|---|---|
| OFFERED | 4 (Initiatives #1, #3, #9, #10, #14) |
| PENDING (in DB) | 5 Initiatives; 12 individual Crown rows (#5×3, #8, #12, #15×4, #16) |
| TRIBUTE | 1 (#6) |
| VACANT (no Crown, no disk) | 5 (#2, #4, #7, #11, #13) |
| DRAFT (disk only, not in DB) | 3 partial (#8 Ruth Glenn, #14 Harvard/UDN, #15 BP029 expansion) |

**10 of 16 Initiatives have at least one Crown assigned (in DB or on disk).**
**6 Initiatives have NO Crown of any kind.**

---

## Crown Letters on Disk NOT Mapped to Any Initiative

These Crown letters exist on disk but have NO initiative_crowns row in Supabase. They are advisory/endorser/investor/institutional class or require Founder assignment ratification.

| Recipient | Best Guess Initiative | Notes | Canonical Disk Path |
|---|---|---|---|
| MacKenzie Scott | Board Chair (general) | 9+ versions (v004–v014i); Board Chair / philanthropy; no initiative-specific mapping | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` |
| Trebor Scholz | Advisory (Pedestal Forum) | v14–v16 SEC-fixed; Pedestal Forum / cooperative economy expert; advisor class | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` + `14_CanonicalReferences/` |
| Michael Seibel | Advisory (Investor) | YC CEO; no initiative crown; investor/advisor outreach | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` |
| Tom Simon | Internal (CFO candidate) | Internal role recruitment letter; not an initiative Crown | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` |
| Dario Amodei (Anthropic) | CAI Licensing | CAI licensing; not an initiative Crown | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` |
| Craig Newmark | Advisory (#16 or general) | Craigslist founder; tech philanthropy; possible #16 Brass Tacks or #2 Let's Get Groceries | `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` Wave 1 |
| Ruth Glenn | #8 Defense Klaus (proposed) | CEO, National DV Hotline — natural US Shield for Defense Klaus; **should be in DB** | Wave 1 Soft_Open |
| Robert Herjavec | Advisory / Patent Revenue | Investor; patent revenue framing; not initiative Crown | Wave 5 |
| Olaf Scholz | #15 (political adjacent) | Former German Chancellor; political expedition international dimension | Wave 1 Soft_Open |
| Jessica Jackley | Advisory / #2 or #10 | Kiva co-founder; microlending; possible #10 VSL or #2 Let's Get Groceries alignment | Archive |
| Alex Oshmyansky | Advisory / #4 | Alfie Health / affordable medicine; possible Household Concierge (#4) or Health Accords (#6) | Archive |
| Adria Powell | Advisory | Unknown initiative mapping | Archive |
| Karla Hanson | Advisory | Unknown initiative mapping | Archive only |
| Marie Kondo | #4 Household Concierge | KonMari method; strong match for #4 Household Concierge; old letter in archive | Archive |
| MariaElena Huambachano | Advisory | Unknown initiative mapping | Archive only |
| Molly Hemstreet | #11 Let's Make Bread | Worker-owned bakery; natural match for #11 Let's Make Bread | Archive |
| Muhammad Yunus | #2 or #10 | Grameen Bank / microlending; strong match for #2 Let's Get Groceries or #10 VSL | Archive |
| Harry Moser | #16 Brass Tacks | Reshoring Initiative founder; manufacturing; possible #16 Brass Tacks | Archive |
| Sallie Krawcheck | #10 VSL or Advisory | Women's investing; possible VSL (#10) or Advisor | Archive |
| Taylor Swift | Advisory / Cultural | Cultural ambassador; no clear initiative mapping | Archive |
| Anne Fishel | #5 The Family Table | The Family Dinner Project founder; STRONG match for #5 The Family Table | Archive |
| Governors (11 BP029) | #15 Power to the People | LETS_MAKE_HISTORY civic campaign; political expedition expansion | `14_CanonicalReferences/` |
| Celebrities (6 BP029) | #15 Power to the People | LETS_MAKE_HISTORY campaign; Dave Bautista, Will Ferrell, Jim Carrey, Zach Galifianakis, Zoe Saldana, Kumail Nanjiani | `14_CanonicalReferences/` |
| Harvard UDN | #14 Didasko | University / academic institutional letter; Didasko alignment | BISHOP_DROPZONE Wave 4 |

---

*Authored B90 | BP035 | 2026-05-09 | Knight Cursor Sonnet 4.6*
