# Crown Roster — 7 Decisions WITH FULL CONTEXT (BP085)

**Purpose:** Founder asked for CONTEXT, not just A/B. Each decision below includes: what the conflict is (narrative, 3-5 sentences), what changes under each option, Bishop recommendation + reason, and a signoff line.

**After picks:** Bishop runs DB updates + canon eblet index updates + letter reassignments.

*Composed by: Sonnet 4.6 SEG · BP085 · 2026-06-17*

---

## Decision 1 — Initiative #2 · Let's Get Groceries / José Andrés

### The Conflict (what actually happened)

Session B89 (Bishop 89) read from disk files and found a fully composed Crown letter addressed to José Andrés, the Spanish-American chef and humanitarian who founded World Central Kitchen. B89 treated the letter's existence as ratification of intent and cited Andrés as the designated Crown for Initiative #2 (Let's Get Groceries — cooperative food sourcing). Session B90 then ran a Supabase gadget query against the live `initiative_crowns` table and found #2 listed as VACANT with no Crown row. The disk evidence (letter exists) and the DB evidence (VACANT) are in direct conflict. This can happen for two reasons: (a) Bishop composed the letter during an earlier session but the Founder never sent it, and the DB-seed step was never completed; or (b) the Founder sent the letter but the DB write was missed. The letter being on disk is evidence of INTENT, not of SENT or RATIFIED.

### What Changes Per Option

**Option A — Ratify Andrés:** Bishop adds a row to `initiative_crowns` for Initiative #2 with Crown = José Andrés, title = "Food Sourcing Crown," letter_status = "draft" (not sent). The disk letter is promoted to active status. Initiative #2 is no longer VACANT. The Founder would still need to decide whether to send the letter before the Andrés designation goes public.

**Option B — Leave VACANT:** `initiative_crowns` table stays as-is. The Andrés letter remains an archive draft. Initiative #2 is officially unassigned until the Founder either sends the letter or names a new Crown. Nothing changes on disk or in DB.

**Bishop Recommend:** A — The letter exists because the Founder wrote it (or authorized Bishop to write it) for this initiative. José Andrés's mission (feeding people through crises, cooperative food chain) is near-perfect alignment with a cooperative food sourcing initiative. The DB gap is a sync lag, not a reversal of intent. Ratify the intent and mark letter as draft-not-sent.

`Choice: ___`

---

## Decision 2 — Initiative #4 · Household Concierge / Marie Kondo

### The Conflict (what actually happened)

A Crown letter for Marie Kondo (`CROWN_LETTER_MARIE_KONDO-01.md`) was found in the archive folder during B89's disk sweep, suggesting the Founder at some point identified Kondo as the intended Crown for Initiative #4 (Household Concierge — home organization, tidying, household management services). B90's Supabase sweep returned #4 as VACANT, with Bishop B90 additionally flagging "no active letter" — meaning the letter had been explicitly classified as archive-only, not merely un-synced. The distinction matters: an un-synced letter is a DB lag; an explicitly archived letter may indicate the Founder reconsidered. Marie Kondo's public profile has also shifted since her KonMari peak — she is less publicly active and is now a mother of three who has famously said she has "kind of given up" on tidying. Whether this affects mission alignment is a Founder call, not a Bishop call.

### What Changes Per Option

**Option A — Keep Kondo as intended Crown:** Bishop re-activates the letter (moves from archive to active-draft status), adds a DB row for #4 with Crown = Marie Kondo, title = "Home Order Champion." Initiative #4 is no longer VACANT. Letter would still need to be sent before the designation goes public.

**Option B — Leave VACANT:** `initiative_crowns` stays as-is. Kondo letter stays archive-only. Initiative #4 is officially unassigned. Founder can name a new Crown when ready (or revisit Kondo later).

**Bishop Recommend:** Neutral — Founder calls. B90 explicitly classified the letter as archive-only, which is a stronger signal than a mere DB sync gap. Bishop cannot determine whether the Kondo designation lapsed (she is less publicly active) or was merely un-synced. If the Founder's intent is still Kondo, Option A is fast. If intent has changed, Option B is cleaner.

`Choice: ___`

---

## Decision 3 — Initiative #7 (MSA) vs #10 (VSL) · Cathie Mahon Split

### The Conflict (what actually happened)

Cathie Mahon is the President and CEO of Inclusiv (the national network of credit unions serving low-income communities). She appeared in Crown records twice across two sessions: B89 placed Mahon at VSL (#10 — Village Savings Loan, micro-finance and cooperative banking); B90 placed Mahon at MSA (#7 — My Savings Account, general savings and financial literacy). The Master Crown Registry already lists Jessica Jackley (co-founder of Kiva) as the canonical Crown for VSL (#10). A physical letter file exists on disk: `LETTERS_FOLDER__CROWN_MAHON_MSA_BP055.md` — this file's name explicitly tags Mahon to MSA (#7), not to VSL. The B89 VSL assignment was likely a session-drift misread. The B90 MSA assignment + the disk file name are in agreement.

### What Changes Per Option

**Option A — B90 split (Mahon=MSA, Jackley=VSL):** Both women get DB rows. Mahon = Initiative #7 (MSA), title "Treasury Keeper." Jackley = Initiative #10 (VSL), canonical per Master Registry. Both DB rows are clean. No initiative is VACANT. Conflict fully resolved.

**Option B — Mahon=VSL only, drop MSA:** Mahon is assigned to #10 only (reverting to B89). The `CROWN_MAHON_MSA_BP055.md` disk file becomes contradicted by the DB. Initiative #7 (MSA) stays VACANT.

**Bishop Recommend:** A — B90 is more recent and authoritative. The disk file `CROWN_MAHON_MSA_BP055.md` is explicit evidence that the MSA assignment is canonical (the filename encodes it). Jackley already holds VSL canonically per the Master Registry. Option A resolves the conflict cleanly with evidence on both sides; Option B contradicts the disk file.

`Choice: ___`

---

## Decision 4 — Initiative #11 (Let's Make Bread) vs #16 (Brass Tacks) · Dale Dougherty

### The Conflict (what actually happened)

Dale Dougherty is the founder of MAKE Magazine and the Maker Movement — the person most associated with hands-on building, DIY culture, and accessible manufacturing education. He appeared in Crown records for two different Initiatives in two different sessions: B89 assigned Dougherty to Initiative #11 (Let's Make Bread — business incubator / entrepreneurship development); B90 assigned Dougherty to Initiative #16 (Brass Tacks — maker culture, manufacturing skills, hardware literacy). These are two genuinely distinct initiatives. The question is whether one person can or should hold two Crown slots, or whether Dougherty belongs to exactly one initiative. The B90 assignment to Brass Tacks (#16) is more recent and is a stronger mission fit — MAKE Magazine is hardware-making culture by definition. The #11 business incubator assignment in B89 may have been a session-drift misread.

### What Changes Per Option

**Option A — Dougherty = #16 Brass Tacks ONLY (B90 authoritative):** One DB row: Dougherty → #16, title TBD (e.g., "Brass Tacks Crown"). Initiative #11 (Let's Make Bread) gets no Crown assigned — it becomes VACANT pending a new designation. Two initiatives, clean separation.

**Option B — Dougherty holds BOTH #11 and #16 (dual-Crown):** Two DB rows pointing to Dougherty. "Let's Make Bread" (incubation) and "Brass Tacks" (making) are both Dougherty-class. One person spans bread (incubation) and brass tacks (making). Precedent would be set for dual-Crown.

**Bishop Recommend:** A — B90 is more recent; Brass Tacks fits MAKE Magazine DNA most directly and unambiguously. Leaving #11 VACANT is cleaner than dual-Crown without a ratify receipt. Dual-Crown also sets precedent that could create governance complexity (one person voting in two initiative governance circles). Unless the Founder intends to establish dual-Crown as a pattern, keeping them separated is more conservative.

`Choice: ___`

---

## Decision 5 — Initiative #12 · Harper Guild / Brené Brown vs Robert Kaiser

### The Conflict (what actually happened)

Session B89 routed Robert Kaiser (journalist, former Washington Post associate editor) to Initiative #12 (Harper Guild — human resources, workplace ethics, HR reform). Session B90 routed Brené Brown (researcher, author, "Daring Greatly," vulnerability and courage in leadership) to #12 as "Harper Prime," while simultaneously routing Kaiser to Initiative #8 (Defense Klaus — safety, protection, first-shield work). The same session (B90) also confirmed that a Kaiser Crown letter exists for #8 with a DB row already present. This means B90 did not merely reassign Kaiser — it confirmed he has an independent, evidence-backed assignment to #8. The B89 Kaiser-to-#12 assignment appears to have been an earlier draft before #8 was formally designated. Brené Brown's expertise in workplace culture, shame resilience, and organizational courage is a strong fit for Harper Guild (HR + ethics + leadership culture). Kaiser's journalism/watchdog background is a stronger fit for Defense Klaus (accountability, protection, first-shield).

### What Changes Per Option

**Option A — Confirm B90 (Brown=#12, Kaiser=#8):** Brown gets a DB row for #12 Harper Guild, title "Harper Prime." Kaiser's existing #8 DB row stays as "First Shield UK." B89's Kaiser-to-#12 is corrected. Two clean, non-conflicting assignments.

**Option B — Revert to B89 (Kaiser=#12):** Kaiser reassigned from #8 back to #12. Brown is removed from #12 or left unassigned. Kaiser's #8 DB row would need to be deleted or reassigned. Initiative #8 (Defense Klaus) would lose its Crown.

**Bishop Recommend:** A — B90 is more recent and authoritative. Kaiser already has confirmed letter + DB row for #8 (Defense Klaus). Moving Kaiser back to #12 would leave #8 VACANT and contradict the disk evidence. Brown's expertise (workplace vulnerability, organizational culture) is a stronger fit for Harper Guild than Kaiser's watchdog/journalism background. Option A resolves both assignments cleanly with the best mission alignment.

`Choice: ___`

---

## Decision 6 — Initiative #13 · JukeBox / Taylor Swift Roadmap Status

### The Conflict (what actually happened)

Taylor Swift is listed as a draft Crown for Initiative #13 (JukeBox — music, arts, cultural expression). A fully composed Crown letter exists on disk: `WAVE_5__LETTER_TAYLOR_SWIFT_V04_CROWN.md` (version 4, indicating multiple revision passes). However, B90's Supabase sweep returned JukeBox as VACANT in `initiative_crowns`, and B90's session notes flagged JukeBox as "off public roadmap." The phrase "off public roadmap" is ambiguous: it could mean (a) JukeBox is permanently deprioritized and should be removed from the active 16; or (b) JukeBox is temporarily deferred and Swift's letter is held for a better launch moment (e.g., after Substrate Awakens ships, when the platform has more credibility to approach a celebrity-class Crown). The Swift letter being at version 4 suggests significant Founder investment in the initiative — four revision passes is not a casual effort. But "off public roadmap" is a strong signal that something changed.

### What Changes Per Option

**Option A — Keep JukeBox on active roadmap, Swift as draft Crown:** The initiative stays in the active 16. Swift's letter is held as active-draft (not sent). No DB row until Founder sends the letter. Initiative remains VACANT in DB. Option A changes nothing in DB — it just confirms the initiative is alive.

**Option B — Pull JukeBox from the active 16:** Initiative #13 is marked OFF-ROADMAP in the canon index. Swift letter is archived as dormant. JukeBox can be revived as a future initiative when the platform is larger and a celebrity-class outreach moment is appropriate.

**Bishop Recommend:** Neutral — Founder calls. B90's "off public roadmap" flag is a deliberate note, not a DB sync gap. If the Founder meant to deprioritize JukeBox, Option B is the honest action. If "off public roadmap" meant only that JukeBox should not be publicly announced yet (not that it was removed from the internal 16), Option A is correct. Only the Founder knows which interpretation is true.

`Choice: ___`

---

## Decision 7 — Initiative #8 · Defense Klaus / Ruth Glenn as US Shield

### The Conflict (what actually happened)

Initiative #8 (Defense Klaus) is framed as a domestic-violence and safety defense initiative. It currently has Robert Kaiser confirmed as the UK-side Crown ("First Shield UK" per Decision 5 above). During B90, Bishop identified Ruth Glenn — CEO of the National Domestic Violence Hotline — as a proposed US-side Crown counterpart. A Crown letter for Glenn already exists on disk: `WAVE_1__CROWN_LETTER_RUTH_GLENN_UPDATED.md` (with "UPDATED" in the name, indicating at least one revision pass). B90 flagged that Glenn had NOT yet been added to `initiative_crowns` in Supabase. The B90 session note explicitly said "should be added to initiative_crowns DB." So this is not a conflict between two sessions — it is a gap between the disk state (letter exists, intent clear) and the DB state (not yet seeded). The decision is whether to formally DB-seed Glenn now or hold until the letter is sent.

### What Changes Per Option

**Option A — Add Ruth Glenn to DB as US Shield Crown for #8:** Bishop inserts a new row in `initiative_crowns` for Initiative #8 with Crown = Ruth Glenn, title = "First Shield US," letter_status = "draft" (not sent). Initiative #8 now has two Crowns: Kaiser (UK) + Glenn (US). This is architecturally sound — Defense Klaus is a bilateral initiative (UK first-shield + US first-shield). Both letter statuses would be "draft" — neither sent yet, but both ratified as intent.

**Option B — Hold Glenn in draft-only status:** DB stays as single-Crown (#8 = Kaiser UK). Glenn's letter remains in the letters folder as a draft. No new DB row until the Founder sends the letter. Initiative #8 remains single-Crown.

**Bishop Recommend:** A — Mission fit is direct and undeniable: the CEO of the National Domestic Violence Hotline is the canonical US counterpart for a domestic-violence defense initiative. The letter exists (intent is established). B90 explicitly flagged this as a DB-add task. The disk evidence + B90 flag together constitute a clear ratify signal. A dual-Crown Defense Klaus (UK + US) is architecturally stronger than a single-Crown version.

`Choice: ___`

---

## After Your Picks

Bishop runs in one pass (per §16 One-Pass Ratify at End BLOOD):

1. Update the 16-initiatives canon eblet (flags → ratified, conflicts → resolved per each choice)
2. Update Supabase `initiative_crowns` DB rows per each A/B choice
3. Update any Crown letters affected by reassignments (Mahon → MSA letter active; Kaiser → #8 only; Brown → #12)
4. Confirm Master Letter Registry is consistent with all 7 resolutions
5. Pearl-emit updated canon eblet to substrate

*BP085 · Sonnet 4.6 SEG · 2026-06-17*
