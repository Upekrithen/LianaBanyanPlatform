# Crown Roster — 7 Pending Decisions (BP085)

Pick A or B per row. Each takes ~10 seconds. Bishop updates the index eblet + Supabase rows after you sign off.

---

## Decision 1 — #2 Let's Get Groceries / José Andrés
**Conflict:** B89 references `CROWN_LETTER_JOSE_ANDRES.md` (food sourcing Crown); B90 shows VACANT in Supabase DB.

**Option A** · Ratify José Andrés as Crown for #2. Bishop adds him to `initiative_crowns` DB with title "Food Sourcing Crown" and marks letter active.
**Option B** · Leave #2 VACANT for now. Archive the Andrés letter as draft-class; do not DB-seed until Founder sends the letter.

**Bishop recommend:** A — disk evidence (B89 letter citation + strong mission fit: food supply chain / cooperative food sourcing) supports ratification. Only blocker is DB lag, not intent.

`Choice: ___`

---

## Decision 2 — #4 Household Concierge / Marie Kondo
**Conflict:** `CROWN_LETTER_MARIE_KONDO-01.md` in archive (B89); B90 shows VACANT + "no active letter."

**Option A** · Keep Marie Kondo as intended Crown. Bishop re-activates letter, adds DB row with title "Home Order Champion."
**Option B** · Leave #4 VACANT. Kondo letter stays archive-only; Founder will name a new Crown when ready.

**Bishop recommend:** Neutral · Founder calls. B90 explicitly flagged "no active letter" — Bishop cannot determine whether the intent lapsed or was merely un-synced.

`Choice: ___`

---

## Decision 3 — #7 MSA vs #10 VSL / Cathie Mahon split
**Conflict:** B89 places Mahon at VSL (#10); B90 places Mahon at MSA (#7). Master Registry names Jessica Jackley as canonical VSL Crown.

**Option A** · Ratify B90 split: Mahon = MSA (#7, "Treasury Keeper"), Jackley = VSL (#10, canonical). Conflict resolved — both get DB rows.
**Option B** · Mahon = VSL (#10) only. Drop the MSA assignment; #7 stays VACANT until a new Crown is named.

**Bishop recommend:** A — B90 is more recent and authoritative; `LETTERS_FOLDER__CROWN_MAHON_MSA_BP055.md` exists on disk confirming the MSA association; Jackley already holds VSL canonically per Master Registry. Clean split with evidence on both sides.

`Choice: ___`

---

## Decision 4 — #11 Let's Make Bread vs #16 Brass Tacks / Dale Dougherty
**Conflict:** B89 assigns Dougherty to #11 (Let's Make Bread, business incubator); B90 assigns Dougherty to #16 (Brass Tacks, maker/manufacturing). Same person, two slots.

**Option A** · Dougherty = #16 Brass Tacks ONLY (B90 authoritative). #11 Let's Make Bread gets a VACANT Crown; these are two distinct initiatives.
**Option B** · Dougherty holds BOTH #11 and #16 — dual-initiative Crown, one person spanning bread (incubation) and brass tacks (making). Both DB rows point to Dougherty.

**Bishop recommend:** A — B90 is more recent; Brass Tacks fits MAKE Magazine DNA most directly. Leaving #11 VACANT is cleaner than dual-Crown without a ratify receipt.

`Choice: ___`

---

## Decision 5 — #12 Harper Guild / Brené Brown vs Robert Kaiser
**Conflict:** B89 routes Kaiser to #12 Harper Guild; B90 routes Brené Brown to #12 (Harper Prime) and Kaiser to #8 Defense Klaus (First Shield UK).

**Option A** · Confirm B90: Brown = #12 Harper Guild ("Harper Prime"), Kaiser = #8 Defense Klaus ("First Shield UK"). B89 mis-routing corrected.
**Option B** · Revert to B89: Kaiser = #12 Harper Guild. Brown is removed or reassigned elsewhere.

**Bishop recommend:** A — B90 is more recent and authoritative; Kaiser already holds a confirmed letter + DB row for #8 Defense Klaus; Brown's expertise (workplace culture, vulnerability, shame resilience) is a stronger mission fit for Harper Guild (HR + ethics) than for Defense Klaus.

`Choice: ___`

---

## Decision 6 — #13 JukeBox / Taylor Swift
**Conflict:** `WAVE_5__LETTER_TAYLOR_SWIFT_V04_CROWN.md` exists on disk; B90 marks JukeBox VACANT in Supabase and "off public roadmap."

**Option A** · Keep JukeBox on the roadmap. Swift stays draft Crown; initiative remains in the 16. Bishop holds the letter but does NOT DB-seed until Founder sends it.
**Option B** · Pull JukeBox from the active 16. Archive Swift letter as dormant; initiative marked OFF-ROADMAP in the index. Can be revived later.

**Bishop recommend:** Neutral · Founder calls. B90 explicitly flagged "off public roadmap" — Bishop cannot determine whether that was a permanent removal or a timing deferral.

`Choice: ___`

---

## Decision 7 — #8 Defense Klaus / Ruth Glenn as US Shield
**Conflict:** Ruth Glenn (CEO, National DV Hotline) proposed as US counterpart to Robert Kaiser (UK). Letter exists on disk (`WAVE_1__CROWN_LETTER_RUTH_GLENN_UPDATED.md`); NOT yet in Supabase `initiative_crowns`.

**Option A** · Add Ruth Glenn to DB as US Shield Crown for #8. Title: "First Shield US." Initiative gains a two-person Crown (Kaiser = UK, Glenn = US).
**Option B** · Hold Glenn in draft-only status. DB stays single-Crown (#8 = Kaiser UK) until Founder sends the letter to Glenn.

**Bishop recommend:** A — mission fit is direct (National DV Hotline CEO as US Shield for a domestic-abuse defense initiative); letter is already drafted and fixed; B90 explicitly flagged this as "should be added to initiative_crowns DB."

`Choice: ___`

---

## After your picks, Bishop runs:
1. Update the 16-initiatives canon eblet (flags → ratified, conflicts → resolved)
2. Update Supabase `initiative_crowns` DB rows per each A/B choice
3. Update any draft Crown letters affected by reassignments (Mahon → MSA, Kaiser → #8 only, Brown → #12)
4. Confirm Master Letter Registry consistent with all 7 resolutions

*BP085 · Sonnet 4.6 SEG · 2026-06-17*
