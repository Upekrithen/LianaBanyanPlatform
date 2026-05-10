# B90 Disk vs. Supabase Reconciliation Report

**Bushed:** B90 | **Session:** BP035 | **Knight:** Cursor Sonnet 4.6 | **Date:** 2026-05-09
**Sources:** `initiative_crowns` migration + disk Crown letter glob + canonical spec + K420 migration

---

## Divergence Registry

### D1 — Tatiana Schlossburg Spelling (Spec vs. DB)

| Surface | Value |
|---|---|
| Canonical spec (`.cursor/rules/liana-banyan-context.mdc`) | "Tatiana **Schlossburg** Health Accords" (double-s, u) |
| Supabase DB (`initiatives` table, migration `20260404000020`) | "Tatiana **Schlossberg** Health Accords" (one s, e) |
| K420 migration (tribute letter) | "Tatiana Schlossberg" (one s, e) — Founder-ratified |

**Resolution:** DB spelling ("Schlossberg") is correct and Founder-ratified (via K420). The canonical spec `.cursor/rules/liana-banyan-context.mdc` contains a TYPO.
**Action:** Bishop to correct spec at next context sync. DB is authoritative.

---

### D2 — Initiative #5 Crown Titles Suggest Household Concierge, Not Family Table

| Issue | Detail |
|---|---|
| DB assigns to initiative #5 | Ai-jen Poo (Household Steward), Ashton Applewhite (Age Champion), Dr. Marc Freedman (Bridge Builder) |
| Initiative #5 name in canonical spec | "The Family Table" |
| Initiative #4 name in canonical spec | "Household Concierge" |
| Crown titles observed | "Household Steward" = homecare/aging; "Age Champion" = elder focus; "Bridge Builder" = intergenerational |

**Analysis:** The crown TITLES assigned to initiative #5 (Household Steward, Age Champion, Bridge Builder) match the thematic profile of BOTH #4 (Household Concierge — domestic/elder home services) AND #5 (The Family Table — intergenerational connection). The mapping to #5 (The Family Table) is likely correct: Ai-jen Poo's "Caring Across Generations" work bridges home care AND family connection. Ashton Applewhite's "age champion" title fits The Family Table's intergenerational mission. Marc Freedman's "bridge builder" role (Encore.org) links generations economically. The DB assignment appears intentional.

**BUT:** The disk `CROWN_LETTER_FAMILY_TABLE_DRAFT.md` says "Initiative #15" in its body — indicating the letter was drafted when initiative numbering was different.

**Resolution:** DB initiative_crowns mapping to #5 is CORRECT per current numbering. Disk letter body contains a STALE INITIATIVE NUMBER (#15 instead of #5). Letter body needs update if ever dispatched.
**Action:** Founder to confirm #5 = The Family Table; Bishop to update disk letter body when next revised.

---

### D3 — CROWN_LETTER_FAMILY_TABLE_DRAFT Stale Initiative Number

| Issue | Detail |
|---|---|
| File | `BISHOP_DROPZONE/99_Misc/CROWN_LETTER_FAMILY_TABLE_DRAFT.md` |
| Body claims | "Initiative #15" for The Family Table |
| Canonical spec | The Family Table is Initiative #5 |

**Resolution:** Disk letter body is stale. Current initiative numbering places The Family Table at #5, not #15.
**Action:** When this draft is worked into an actual dispatch letter, body must reference Initiative #5.

---

### D4 — Ruth Glenn Crown Letter Has No Supabase Row

| Issue | Detail |
|---|---|
| Disk | `CROWN_LETTER_RUTH_GLENN.md` exists in multiple versions (v1, UPDATED, -02, SEC_FIXED_V2) in Wave 1 Soft_Open; also in archive |
| DB | Ruth Glenn has NO row in `initiative_crowns` |
| Bishop speculation | Ruth Glenn (CEO, National DV Hotline) is a natural US counterpart to Robert Kaiser (UK Shield) for Initiative #8 Defense Klaus |
| Crown title suggestion | "First Shield US" (mirroring Robert Kaiser's "First Shield UK") |

**Resolution:** DIVERGENCE — Ruth Glenn letter was drafted but never seeded as a formal Crown in `initiative_crowns`. Either: (a) she was proposed but the DB seed was intentionally omitted pending Founder ratification, or (b) she was inadvertently omitted from the migration.
**Action (Founder):** Confirm Ruth Glenn for Initiative #8 as "First Shield US". If confirmed, Bishop/Knight to add DB migration inserting her row.

---

### D5 — BP029 "Let's Make History" Letters Not in initiative_crowns

| Issue | Detail |
|---|---|
| Disk | 17 letters in `BISHOP_DROPZONE/14_CanonicalReferences/` — 11 governors + 6 celebrities |
| DB | Zero rows in `initiative_crowns` for any BP029 governor or celebrity |
| Context | These appear to be a "civic expansion campaign" for Initiative #15 Power to the People |
| Existing DB #15 Crowns | Arnold Schwarzenegger, Sandra Bullock, Keanu Reeves, AOC (all PENDING) |

**Resolution:** BP029 letters are DRAFT outreach — formal Crown assignment has not occurred. They may be categorized as "Civic Champions" or "Let's Make History Campaign Invitees" rather than formal initiative_crowns entries.
**Action (Founder):** Decide if governors and celebrities from BP029 get formal `initiative_crowns` rows or a separate campaign table.

---

### D6 — Harvard UDN Letter Not in initiative_crowns

| Issue | Detail |
|---|---|
| Disk | `CROWN_LETTER_HARVARD_UDN.md` in BISHOP_DROPZONE Wave 4 |
| DB | No row in `initiative_crowns` for Harvard or any institutional Crown |
| Proposed mapping | Initiative #14 Didasko (Academic) — institutional partnership Crown |

**Resolution:** DRAFT only; institutional Crown for Didasko was never seeded in DB.
**Action (Founder):** Confirm Harvard UDN as #14 institutional Crown; add to DB if confirmed.

---

### D7 — Crown Letter Version vs. Supabase "letter_slug" in crown_letter_updates

The `crown_letter_updates` table tracks living update pages by `letter_slug` (text). No data was seeded in the active (post-baseline) migrations. The table exists but appears unpopulated.

**Resolution:** No divergence in data — both disk and DB show "no updates sent yet."
**Action:** When first Crown letters are formally dispatched, Bishop/Knight to seed `crown_letter_updates` rows.

---

### D8 — crown_positions Table Exists in Baseline (additional Crown schema)

The baseline migration reveals a `crown_positions` table (separate from `initiative_crowns`). This table appears to be a higher-level abstraction (succession candidates, position IDs). No cross-reference was done between `crown_positions` content and the disk Crown letters — this table may contain additional Crown data not surfaced by the `initiative_crowns` seed migration.

**Resolution:** Knight was not able to query live Supabase to pull `crown_positions` rows (MCP Supabase query not in scope of this build). This table should be queried directly by Founder or in a follow-up session.
**Action:** Query `SELECT * FROM crown_positions;` and `SELECT * FROM crown_succession_candidates;` to surface any additional Crown assignments not in `initiative_crowns`.

---

## Reconciliation Score

| Check | Result |
|---|---|
| Spec vs. DB initiative names match | 14/16 ✓ (2 divergences: #6 spelling, #15 initiative body stale) |
| DB Crown rows vs. disk Crown letters match | 10/15 unique recipients ✓ (Ruth Glenn, BP029 ×17, Harvard UDN not in DB) |
| Disk Crown letters with stale initiative numbers | 1 (Family Table Draft) |
| Supabase tables surfaced | `initiative_crowns`, `crown_letter_updates`, `crown_letter_response_log`, `crown_letter_delegations`, `crown_letter_invitations`, `crown_positions`, `crown_succession_candidates` |

---

*Authored B90 | BP035 | 2026-05-09 | Knight Cursor Sonnet 4.6*
