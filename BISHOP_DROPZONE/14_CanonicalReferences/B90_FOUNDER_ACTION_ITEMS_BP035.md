# B90 Founder Action Items — Crown × Sweet Sixteen

**Bushed:** B90 | **Session:** BP035 | **Knight:** Cursor Sonnet 4.6 | **Date:** 2026-05-09

This report surfaces every decision point that requires Founder ratification. Knight cannot proceed on these items without Founder input. Grouped by urgency.

---

## TIER 1 — CRITICAL (Blocking; requires Founder decision before Bishop can write)

### FA-01: Name the Living Crown for Initiative #6 — Tatiana Schlossberg Health Accords

**Issue:** Initiative #6 is named in honor of Tatiana Schlossberg, who is deceased. A LIVING Crown steward must be identified to champion this initiative.
**DB status:** No `initiative_crowns` row for #6.
**Existing:** "In Honor Of" tribute letter in progress (K420, Wave 2); Cephas tribute path established.
**Decision needed:** Who is the living Crown steward for the Health Accords? Options:
- A climate-health researcher (Tatiana's specialty from "Inconspicuous Consumption")
- A public health advocate
- A women's environmental health champion
**Action:** Founder names Crown → Bishop authors Crown letter → Knight seeds DB row.

---

### FA-02: Clarify MSA Initiative (#7) — What Does "MSA" Stand For?

**Issue:** "MSA" appears in the canonical Sweet Sixteen list with no definition accessible to Knight or surfaced in any context file. No Crown candidate can be identified without knowing the initiative scope.
**Decision needed:** Founder defines MSA — full name, mission, one-paragraph description.
**Action:** Founder clarifies → Bishop writes Crown stub → Crown candidate identified → letter authored.

---

### FA-03: Confirm Ruth Glenn for Initiative #8 Defense Klaus (US Shield)

**Issue:** Ruth Glenn (CEO, National Domestic Violence Hotline) has a Crown letter on disk (`CROWN_LETTER_RUTH_GLENN.md`, multiple versions including SEC_FIXED_V2) but NO row in `initiative_crowns`. Robert Kaiser is DB-assigned as "First Shield UK." The natural pairing is Ruth Glenn as "First Shield US."
**Decision needed:** Confirm Ruth Glenn as Co-Crown for Initiative #8 with title "First Shield US."
**Action:** Founder confirms → Knight adds DB migration for Ruth Glenn row #8 → Bishop updates letter to "offered" status.

---

## TIER 2 — HIGH PRIORITY (Crown absent; strong candidates exist on disk)

### FA-04: Confirm Crown for Initiative #11 — Let's Make Bread

**Issue:** Initiative #11 has no Crown. Molly Hemstreet (worker-cooperative bakery leader) has an archive Crown letter.
**Decision needed:** Is Molly Hemstreet the Crown for #11? Or another candidate?
**Action:** Founder confirms → Bishop reads archive letter → updates/authors Crown letter → Knight seeds DB row.

### FA-05: Confirm Crown for Initiative #13 — JukeBox

**Issue:** Initiative #13 has no Crown. Taylor Swift has archive Crown letters but their initiative mapping is unclear (cultural ambassador? JukeBox Crown?).
**Decision needed:** Is Taylor Swift's letter intended for #13 JukeBox? Or another initiative? Or advisory class?
**Action:** Founder clarifies → Bishop updates letter → Knight seeds DB row if confirmed.

### FA-06: Confirm Crown for Initiative #2 — Let's Get Groceries

**Issue:** Initiative #2 has no Crown. Muhammad Yunus (Grameen Bank) archive letter exists and is a candidate.
**Decision needed:** Name Crown for #2. Muhammad Yunus? Or another candidate?
**Action:** Founder names Crown → Bishop authors/revises letter → Knight seeds DB row.

### FA-07: Confirm Crown for Initiative #4 — Household Concierge

**Issue:** Initiative #4 has no Crown. Marie Kondo archive letter exists. Also — DB assigns "Household Steward"-type Crowns to #5 (The Family Table), which thematically could serve #4.
**Decision needed:** (a) Is Marie Kondo the Crown for #4? (b) Are Ai-jen Poo / Ashton Applewhite / Marc Freedman correctly assigned to #5, or should any of them shift to #4?
**Action:** Founder resolves #4 vs. #5 Crown assignment. Knight may need a DB migration to reassign rows if initiative numbering shifts.

---

## TIER 3 — MEDIUM PRIORITY (Crown mapping unclear; no immediate letter urgency)

### FA-08: Assign BP029 Governors + Celebrities to Initiative #15 (or Campaign Table)

**Issue:** 17 "Let's Make History" Crown letters (11 governors + 6 celebrities, BP029) are on disk in `BISHOP_DROPZONE/14_CanonicalReferences/` but NOT in `initiative_crowns`.
**Decision needed:** Should these 17 be (a) added to `initiative_crowns` for #15 as "Civic Champions," or (b) tracked in a separate campaign/outreach table?
**Action:** Founder decides classification → Knight adds appropriate DB migration.

### FA-09: Classify Advisory/Endorser Crown Letters

These recipients have Crown letters but no initiative mapping. Founder to classify each as: (a) initiative Crown for a specific initiative, (b) Platform Advisor (separate from initiative Crown system), or (c) Deprecated/archive only.

| Recipient | Best Match Initiative (Bishop suggestion) | Founder decision needed |
|---|---|---|
| MacKenzie Scott | Board Chair / General Philanthropy | Confirm: Board Chair class or initiative Crown? |
| Trebor Scholz | Platform Cooperative Advisor | Confirm: Advisor class or initiative Crown (#16 Brass Tacks)? |
| Michael Seibel | Investor/Advisor | Confirm: Investor class; no initiative Crown |
| Craig Newmark | #16 Brass Tacks or #2 | Assign initiative or advisory class |
| Jessica Jackley | #10 VSL or #2 | Assign initiative or advisory class |
| Alex Oshmyansky | #6 Health Accords or #4 | Assign initiative (especially relevant if #6 Crown candidate) |
| Robert Herjavec | Patent Advisor | Confirm: Patent revenue advisor; not initiative Crown |
| Olaf Scholz | #15 International | Confirm: International ambassador for #15 or advisory |
| Sallie Krawcheck | #10 VSL | Assign initiative or advisory class |
| Adria Powell | Unknown | Founder to identify initiative or advisory |
| Karla Hanson | Unknown | Founder to identify initiative or advisory |
| MariaElena Huambachano | Unknown | Founder to identify initiative or advisory |
| Anne Fishel | #5 The Family Table | Bishop recommends adding to `initiative_crowns` #5 |
| Harry Moser | #16 Brass Tacks | Bishop recommends adding to `initiative_crowns` #16 |
| Muhammad Yunus | #2 Let's Get Groceries | See FA-06 |
| Molly Hemstreet | #11 Let's Make Bread | See FA-04 |
| Marie Kondo | #4 Household Concierge | See FA-07 |
| Taylor Swift | #13 JukeBox | See FA-05 |

---

## TIER 4 — SPEC CORRECTIONS (Low urgency; cleanup)

### FA-10: Correct Tatiana Schlossberg Spelling in Canonical Spec

**Issue:** `.cursor/rules/liana-banyan-context.mdc` line 49 reads "Tatiana **Schlossburg**" — this is a TYPO. DB-correct (Founder-ratified via K420) is "Tatiana **Schlossberg**."
**Action:** Bishop updates canonical spec at next context sync session.

### FA-11: Update CROWN_LETTER_FAMILY_TABLE_DRAFT Stale Initiative Number

**Issue:** `CROWN_LETTER_FAMILY_TABLE_DRAFT.md` references "Initiative #15" for The Family Table. Current canonical numbering = #5.
**Action:** Bishop updates letter body reference when next revised.

---

## Summary Decision Count

| Tier | Count | Status |
|---|---|---|
| CRITICAL (Blocking) | 3 items (FA-01, FA-02, FA-03) | Awaiting Founder |
| HIGH (strong candidate exists) | 4 items (FA-04 – FA-07) | Awaiting Founder confirmation |
| MEDIUM (classification needed) | 2 items (FA-08, FA-09) | Awaiting Founder direction |
| SPEC CORRECTIONS | 2 items (FA-10, FA-11) | Bishop to action |

**Total decisions: 11**

---

*Authored B90 | BP035 | 2026-05-09 | Knight Cursor Sonnet 4.6*
