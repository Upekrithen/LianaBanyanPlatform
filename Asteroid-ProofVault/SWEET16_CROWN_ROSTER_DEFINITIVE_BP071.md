# Sweet-16 + Political Expedition Council ΓÇö DEFINITIVE ROSTER (BP071)

**Source of truth:** the Supabase React app + DB migrations (per `canon_cephas_real_source_is_supabase_react_app...bp071`). NOT Hugo (frozen/drifted), and NOT `get_initiative` (confirmed STALE ΓÇö see drift table). Compiled by Bishop SEG from `InitiativeProjectsPage.tsx` SWEET_SIXTEEN array + individual pages + seed/reconciliation migrations (B076 `20260404000020`, bp038 `20260511210000`/`20260511230000`, bp039 `20260512043600`, base seed `20260209000007`). 2026-06-02.

## The Sweet-16 (current canonical order + crowns)

| # | Name | Crown Holder | Status |
|---|------|--------------|--------|
| 1 | Let's Make Dinner | Maneet Chauhan | offered |
| 2 | Let's Get Groceries | **Stacy Mitchell** (Jos├⌐ Andr├⌐s superseded) | pending |
| 3 | Let's Go Shopping | Mary Beth Laughton | offered |
| 4 | Household Concierge | Marie Kondo | pending |
| 5 | The Family Table | Ai-jen Poo ┬╖ Ashton Applewhite ┬╖ Dr. Marc Freedman | pending |
| 6 | Tatiana Schlossberg Health Accords | **VACANT ΓÇö TRIBUTE-class** | vacant |
| 7 | MSA (Medical Savings Accounts) | Cathie Mahon | pending |
| 8 | Defense Klaus | Robert Kaiser | pending |
| 9 | Rally Group | Kimberly A. Williams | offered |
| 10 | VSL | **Jessica Jackley** (NOT Mahon ΓÇö get_initiative is stale here) | pending |
| 11 | Let's Make Bread | Muhammad Yunus | pending |
| 12 | Harper Guild | Bren├⌐ Brown | pending |
| 13 | JukeBox | Taylor Swift | offered |
| 14 | Didasko | Sal Khan | offered |
| 15 | Power to the People (Political Expedition) | 30-member Council (below) | pending |
| 16 | Brass Tacks | Dale Dougherty | pending |

## #15 Political Expedition ΓÇö what it includes
React app (`PowerToThePeoplePage.tsx`, xrayId `political-expedition-hub`): the **Switzerland Protocol** civic-engagement infrastructure (non-partisan; track what officials DO), with 5 functional tabs: **Dashboard ┬╖ Representatives ┬╖ Legislation ┬╖ Civic Scorecard/XP ┬╖ Coverage Minutes** (citizen-journalism timer). "Tereno" is NOT part of #15 ΓÇö it's HexIsle gaming-cert vocabulary, unrelated.

### The 30-member Political Expedition Council (all status: pending ΓÇö members ELECT from this slate)
1 Arnold Schwarzenegger ┬╖ 2 Sandra Bullock ┬╖ 3 Keanu Reeves ┬╖ 4 Alexandria Ocasio-Cortez ┬╖ 5 Dolly Parton ┬╖ 6 Robert De Niro ┬╖ 7 Sylvester Stallone ┬╖ 8 Aziz Ansari ┬╖ 9 Seth Rogen (HELD) ┬╖ 10 Keke Palmer (HELD) ┬╖ 11 Matthew McConaughey ┬╖ 12 Mike Rowe ┬╖ 13 Denzel Washington ┬╖ 14 Dwayne Johnson ┬╖ 15 Sam Elliott ┬╖ 16 Gary Sinise ┬╖ 17 Tom Hanks ┬╖ 18 Rita Wilson ┬╖ 19 Anne Hathaway ┬╖ 20 Morgan Freeman ┬╖ 21 Jamie Lee Curtis ┬╖ 22 Julia Roberts ┬╖ 23 Jennifer Aniston ┬╖ 24 Woody Harrelson ┬╖ 25 Claire Danes ┬╖ 26 Kurt Russell ┬╖ 27 Michelle Pfeiffer ┬╖ 28 Henry Cavill ┬╖ 29 Mark Wahlberg ┬╖ 30 John Cena.

## DRIFT TABLE (what was wrong, and the truth)
- **#7 = MSA** (Medical Savings Accounts), confirmed by `MSAPage.tsx` "Initiative #7." The lexicon's "Tereno" was wrong ΓÇö Tereno is HexIsle-only.
- **`get_initiative` gadget is STALE** for #10 (returns Mahon; DB truth = Jackley). Trust DB/migrations over the gadget.
- **VSL name is unresolved even in the React app:** h1 says "Vouched Short Loans," overlay/tagline say "Voucher Short Loans," DB `name` = just "VSL." Founder-authoritative = **"Vouch Short Loans."** None of the three on-disk variants match ΓÇö needs a ratified migration to set `name = 'VSL (Vouch Short Loans)'`.
- **#15 tagline** "Not Left. Not Right. Forward." = RETIRED (Forward Party collision); current = "Not left or right. Simply effective." ΓÇö not yet written into the DB/React row.
- **#6 slug** may carry the typo `schlossburg` (double-s); name column corrected to "Schlossberg" (single s) by bp039-part4. Verify slug.
- **#2** Jos├⌐ Andr├⌐s superseded by Stacy Mitchell ("Founder direct: Stacy Mitchell. Hands down.").

## NEEDS LOCKING (DB migrations ΓÇö Knight, next session)
1. VSL ΓåÆ set `name = 'VSL (Vouch Short Loans)'`.
2. #6 slug typo `schlossburg ΓåÆ schlossberg` (verify + fix).
3. #15 tagline ΓåÆ "Not left or right. Simply effective."
4. Investigate why `get_initiative` returned stale #10 (gadget reads a cached/snapshot view vs live DB).

*This roster is the input for the canonical initiative REORDER (pending the Founder's wanted order from the reorder-finder SEG).*
