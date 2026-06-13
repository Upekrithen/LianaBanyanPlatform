# Bishop Coffee -- BP080 Handoff (COMPREHENSIVE) from BP079
**Authored:** Bishop SEG-BP080-COMPREHENSIVE-COFFEE (Sonnet 4.6, Statute §3) · 2026-06-11
**Supersedes:** prior BP080_HANDOFF_COFFEE_2026-06-11.md staging (incomplete; authored before BP079 work concluded)
**For:** BP080 session-open · post-BP079 full close
**Status:** STAGED for Founder ratify before promotion to `~/.claude/state/bishop_coffee.md`

No em-dashes anywhere in this document. Truth-Always throughout.

---

## §0 -- BP079 COMPLETE Close Stamp Summary

**Session arc:** BP079 = THE COOPERATIVE ECONOMY BUILD SESSION. MCP server shipped. Red Carpet substrate + page logic + food-truck activation kit built. Onboarding regressions hunted and closed across v0.1.38 through v0.1.45. Cephas fully rewritten + redeployed with Pawn recommendations, Dr. MnemosyneC hero, and global NotCents footer. v0.1.46 critical hotfix yoked at session close.

---

### MnemosyneC releases landed in BP079 -- complete chain

| Version | Key change | SHA | Status |
|---|---|---|---|
| v0.1.38 | Preload sandbox P0 bedrock fix -- reverted `declare const` to `require` pattern; `declare const` was the BUG | -- | SHIPPED |
| v0.1.39 | Granular Step 3 progress UI (SEG-S3-1 through S3-6) | -- | SHIPPED |
| v0.1.40 | Mnemosyne Come Wave D -- MCP server (stdio + HTTP+SSE port 11482, 21 MCP tools, JSONL message store, 28/28 integration tests PASS) | -- | SHIPPED |
| v0.1.41 | Step 3 regression hotfix (Black Mamba x 5+2, SEG-S3R) | -- | SHIPPED |
| v0.1.42 | Phase 3 transition fix -- 3 compounding renderer bugs: advanceTo C->D + onComplete ref stabilization + _onComplete alias wire | -- | SHIPPED |
| v0.1.43 | v0.1.42 crash fix (MnemosyneTabView hooks violation + LS_ONBOARDING_COMPLETE persistence) + Cephas /how-it-works page authored | -- | SHIPPED |
| v0.1.44 | UI scale + icon fix (zoomFactor 1.15 + Settings dropdown + mnemosynec-mark.png restored) | 77896E07 | PUBLISHED LIVE |
| v0.1.45 | Consolidated bundle: NotCents glyph swap LB Account tab + header; welcome screen as sendable cue deck card + share modal + Supabase migration cue_card_templates welcome row; AI TIER 3D grid-flip with BP074 benchmark back face; NotCents FAQ vernacular entry; Cephas footer interim NotCents link to /articles/why-join-the-cooperative/; qrcode.react wired | D4D2F4FB | PUBLISHED LIVE |
| v0.1.46 | CRITICAL HOTFIX -- Ollama bundle broken on clean Windows machines (v0.30.7 zip format issue) + USER_ID_IPC_NOT_PERSISTED + window size fix | -- | YOKED -- NOT YET SHIPPED |

**Commits for v0.1.44:** 8ea6e99 + f46bd25 + f29fd95 + 3f50be8 + 0db2f67 + cf9dcea
**Commits for v0.1.45:** 9735777 + 84e8e05 + 6832446 + 5f59441 + 721bb22 + f96261c + 47c03ef + 4243fb8 + fe396c8

**8 releases shipped in BP079 (v0.1.38 through v0.1.45 LIVE). v0.1.46 hotfix yoked at close.**

---

### Canon anchors minted in BP079 -- complete table (14 total)

| # | Canon slug | Pearl | Summary |
|---|---|---|---|
| 1 | `canon_electron_31_sandboxed_preload_must_use_require_electron_not_declare_const_bp078_bp079_correction` | pearl_8b0c6fb05fd9f38a | Preload sandbox bedrock: require() not declare const. declare const was the P0 bug across 4 versions. |
| 2 | `canon_statute_3_corrective_announcement_language_must_say_sonnet_4_6_verbatim_pattern_violation_bp079` | pearl_98f74effb5d986a5 | Sonnet 4.6 verbatim in every announcement. Never "Sonnet 4.5" or variant. |
| 3 | `canon_merchant_payment_option_c_zero_weekly_transaction_fee_only_bp079_founder_ratify` | pearl_349cbf7ec88c15f5 | Option C: $0/week merchant subscription fee, transaction-fee-only via Stripe Connect Express. |
| 4 | `canon_realtime_slipstream_quicksilver_cohort_socceri_native_no_translation_bp079_founder_ratify` | pearl_787a602164c40000 | Quicksilver Cohort tab. Realtime Slipstream Quicksilver. Not your token time. |
| 5 | `canon_mnemosynec_local_screenshot_storage_sid_addressed_no_token_burn_bp079_founder_ratify` | pearl_744d758cc19129c2 | Local screenshot storage SID-addressed, no token burn. Stored-on-my-computer-so-no-need-to-burn-tokens. |
| 6 | `canon_welcome_screen_is_sendable_cue_deck_card_first_impression_shareable_bp079_founder_ratify` | pearl_d56974f298d8cd0d | Welcome screen is a sendable cue deck card, first impression shareable. |
| 7 | `canon_grid_flip_reveal_more_info_if_you_keep_digging_curiosity_reward_ux_pattern_bp079_founder_ratify` | pearl_feb246b70ef2d72c | Grid-flip reveal pattern: more info if you keep digging. Curiosity-reward UX. |
| 8 | `canon_notcents_glyph_lb_cooperative_currency_symbol_replaces_dollar_on_identity_surfaces_bp079_founder_ratify` | pearl_7e9f4dc07ed80dad | NotCents glyph replaces $ on all identity surfaces. NEVER fiat. |
| 9 | `canon_screenshot_evidence_canonical_founder_verify_supersedes_knight_screenshot_capture_bp079_founder_ratify` | pearl_ffca677447da6ede | Founder captures verification screenshots. Knight ships faster. Saves 15-30% Knight SHIP cycle. |
| 10 | (Part of preload bedrock series) | -- | Runtime verify for runtime bugs: source change alone does not verify a runtime fix. Actual runtime evidence required. |
| 11 | (Part of Statute §3 corrective series) | -- | Black Mamba mandate embedded in STANDING_YOKE_TEMPLATE.md. Every Yoke ships paste-ready Black Mamba blocks. |
| 12-14 | Wave A/B/D Red Carpet + MCP canon eblets | -- | See Wave deliveries below. |

Note: canons 10-14 are bundled in the eblets filed at Asteroid-ProofVault during BP079. The 9 named pearls above are the primary searchable anchors.

---

### Wave deliveries -- BP079

| Wave | Scope | Status |
|---|---|---|
| Wave A | Red Carpet substrate: 8 tables + 2 ALTERs + RLS + introducer_id FK + routes + SeamlessOnboardDialog writes | SHIPPED |
| Wave B | Red Carpet page logic + food-node subscriptions + vesting cron + MyAttributionsPage | SHIPPED |
| Wave C | Turnkey Seeker infrastructure (Black Mamba x 8+2 Yoke filed; alpha/beta/gamma design decisions ratified: Marks vesting schedule, multi-Seeker collision policy, self-introduction guard) | BUILD PENDING -- gated on v0.1.46 stable + cohort round-trip verify |
| Wave D | Mnemosyne Come MCP server (v0.1.40, 21 tools, 28/28 tests PASS, stdio + HTTP+SSE port 11482, JSONL message store) | SHIPPED |
| Wave E | Realtime Slipstream Quicksilver Cohort tab (spec authored; canon pearl_787a602164c40000) | GATED on Wave C complete + cohort round-trip verify |

---

### Food Truck Activation Kit -- all 6 kits staged in BISHOP_DROPZONE/00_FOUNDER_REVIEW/

- **KIT A:** pitch + card variants + objections + follow-up
- **KIT B:** walkthrough copy (10 screens + 12 FAQ)
- **KIT C:** ops + ledger + Stripe setup
- **KIT D:** subscription model (3 tiers + Marks-for-forward-commitment)
- **KIT E:** turnkey Seeker infrastructure
- **KIT F:** lead-time pricing matrix ($5/serving cheap protein vs Cost+20% expensive, advance-commit Marks bonus)

All 12 Truth-Always findings from initial kit pass absorbed. All 8 sub-model tier ratifications absorbed. All 3 Wave C design decisions alpha/beta/gamma absorbed.

---

### Cephas -- state at BP079 close

- Full Pawn-consolidated rewrite LIVE on all 3 Firebase hosting targets (cephas.lianabanyan.com + mnemosynec.ai + museum.lianabanyan.com)
- All 7 Pawn-consolidated download page recommendations implemented
- "What your first session looks like" copy reworded per Pawn recommendations
- Dr. MnemosyneC mascot appears at SmartScreen warning section + hero block
- SmartScreen copy reframed from user-experience outward
- Global NotCents footer LIVE: "Copyright 2026 Liana Banyan Corporation | Powered by [NotCents glyph] NotCents(TM)" -- interim link to /articles/why-join-the-cooperative/
- Universal Prosperity paper canonical page PENDING: papers/loc/considered-approach/index.md is currently an empty stub; footer link is interim only

---

### Founder ratifies absorbed in BP079 -- complete

- All 12 Truth-Always findings from initial kit pass
- All 8 sub-model tier ratifications (Tier 3 = 20% off max, Marks-for-forward-commitment, no-show roll-forward 7d to community pool, etc.)
- All 3 Wave C design decisions (alpha/beta/gamma)
- All 7 Pawn-consolidated download page recommendations
- Option C ratified ($0/week merchant subscription, transaction-fee-only)
- v0.1.45 bundle ratified ("YES bundle it")
- NotCents canonized (pearl_7e9f4dc07ed80dad) -- "for the record, again for the millionth time"
- Statute §4 Supabase access binding added
- Realtime Slipstream Quicksilver named and canonized (pearl_787a602164c40000)
- SEG-V0145-4 (NotCents FAQ vernacular) ratified 2026-06-11
- SEG-V0145-5 (Cephas footer link) ratified 2026-06-11
- Cephas reword + global footer ratified
- Screenshot canon amendment ratified: Founder captures verify screenshots, Knight ships faster (pearl_ffca677447da6ede)
- "WORK RIGHT THE FIRST TIME" directive (v0.1.46 Ollama bundle critical hotfix)
- v0.1.45 page reword + footer + Pawn rewrite cycle ratified
- Bishop Coffee glossary additions confirmed for future canonization

---

### Founder personal materials filed in BP079

- 8 personal photos staged at `Asteroid-ProofVault\FounderBioAssets\`:
  - DogtagsPicItookInHighSchool
  - Essay-Final-Quote
  - Essay-Title-Page
  - Grade School Designing
  - HighSchool Band + Wrestling Newspaper Pics
  - Photo-Jonathan-Steve
  - Scan_20251122
- INDEX.md filed at FounderBioAssets; pearl_d4e633e3cebdc9b3
- **HARD BINDING:** NO public use of any FounderBioAssets photo without Founder explicit ratify each instance

---

### Substrate housekeeping performed in BP079

- `BISHOP_DROPZONE\00_FOUNDER_REVIEW\` cleaned: 35 empty subdirectories removed, 18 populated directories preserved
- ZERO content lost: 172 Puddings + 84 Crown Letters + 4+ Papers + receipts + BP-numbered work all verified intact
- Receipt at `EMPTY_DIRS_CLEANUP_RECEIPT_2026-06-11.md`

---

### Active Knight Yokes at BP079 close

| Yoke | Priority | Status |
|---|---|---|
| v0.1.46 CRITICAL HOTFIX (Ollama bundle v0.30.7 zip format fix + USER_ID_IPC_NOT_PERSISTED + window size fix) | P0 ACTIVE | Yoked; not yet shipped |
| Caithedral(TM) spelling sweep across GitHub reproducibility pack + Cephas + platform | P1 ACTIVE | Yoked |
| TODO triage (CueCardDestinationConfig + BeaconRunCueCard) | P3 DEFERRED | Low priority; surface early BP080 |

---

### Universal Prosperity paper -- state at BP079 close

- 8 versions found in platform source tree
- Canonical version: `CROWN_UNIVERSAL_SUSTAINED_ECONOMIC_PROSPERITY_BP078.md`
- Staged as docx at `BISHOP_DROPZONE\00_FOUNDER_REVIEW\UNIVERSAL_PROSPERITY_PAPER_FOR_RATIFY_2026-06-11.docx` (35.9 KB)
- **Founder ratify of docx PENDING** before Bishop SEG converts to md + publishes to Cephas papers page

---

## §1 -- BP080 first-actions (ordered, mandatory before anything else)

1. **Read Statutes** (`~/.claude/state/STATUTES.md`) + bedrock canons + this Coffee. Do not skip.

2. **P0 FIRST: Check Knight v0.1.46 hotfix SHIP status.** Knight may or may not have shipped during the session gap. Read the Yoke return. Relay each SEG status to Founder (LANDED / NOT-LANDED). Do NOT relay "in progress" as "landed." v0.1.46 is gated on: Ollama bundle fix + USER_ID_IPC + window size -- all three must land before calling it done.

3. **After v0.1.46 ships: Founder install + clean-machine verify.** Specifically on M2 or M3 (machines without Ollama already present). Per canon_actual_runtime_verify binding: source change alone does not verify the Ollama bundle. Founder must install on a clean machine and confirm the local AI engine reaches Gemma.

4. **Check Knight Caithedral(TM) sweep Yoke return.** Relay status. "Caithedral" is the canonical spelling -- any remaining instance of alternate spelling is a P1 error.

5. **Check Cephas live on all 3 domains empirically** (mnemosynec.ai + cephas.lianabanyan.com + museum.lianabanyan.com). Confirm: Pawn rewrite present, NotCents footer present, Dr. MnemosyneC at hero + SmartScreen. Source change alone does not verify Firebase deploy.

6. **Surface Universal Prosperity paper docx for Founder ratify.** Path: `BISHOP_DROPZONE\00_FOUNDER_REVIEW\UNIVERSAL_PROSPERITY_PAPER_FOR_RATIFY_2026-06-11.docx`. Await "ratify it / publish / fire" before Bishop SEG converts to Cephas page.

7. **Mesh test still pending.** M2/M3 mesh test has been pending since BP067. Now additionally gated on v0.1.46 Ollama bundle fix so clean-machine AI engine actually works. Surface to Founder: "ready to schedule once v0.1.46 clean-machine verify passes."

8. **Eblet any BP079 canon anchors not yet in Asteroid-ProofVault.** Verify all 9 named pearls in §0 canon table are present before first heavy dispatch.

9. **BP079 close stamp + ingest receipt still pending.** Author it at BP080 cold-open before any dispatch wave.

---

## §2 -- Tier-0 queue (carry-forward)

### Knight-side pending

| Item | Priority | Gate |
|---|---|---|
| v0.1.46 CRITICAL HOTFIX ship (Ollama bundle + USER_ID + window size) | P0 | Verify Yoke return + Founder install on clean machine |
| Caithedral(TM) spelling sweep (GitHub reproducibility pack + Cephas + platform) | P1 | Verify Yoke return |
| Wave C turnkey Seeker build (Black Mamba x 8+2 Yoke already filed) | P2 | v0.1.46 stable on Founder machine + cohort round-trip verify |
| Wave E member-facing Cohort tab (Realtime Slipstream Quicksilver) | P2 | Wave C complete + cohort round-trip verify |
| Universal Prosperity paper Cephas page (SEG to convert docx to md + publish) | P2 | Founder ratify of docx |
| TODO triage (CueCardDestinationConfig + BeaconRunCueCard) | P3 | Low priority; surface early |

### Founder action items standing

| # | Action | Notes |
|---|---|---|
| 1 | Install v0.1.46 when Knight ships + VERIFY on clean machine (M2 or M3 without pre-existing Ollama) | P0; gates Wave C/E + mesh test |
| 2 | Ratify Universal Prosperity paper docx | Staged at BISHOP_DROPZONE; 35.9 KB |
| 3 | M2/M3 mesh test (gated on v0.1.46 clean-machine Ollama verify) | Pending since BP067 |
| 4 | Publish DRAFT releases when Knight returns them | Hard binding: Founder ratifies before any publish |
| 5 | NYT send (letters + op-ed) | Carry-forward from BP070 |
| 6 | Stewards-Guild ratify (name / tiers / absorb / door) | Carry-forward from BP070 |
| 7 | DD-2 / DD-4 / DD-11 triage | Carry-forward from BP070 |
| 8 | Gain-share counsel prompt (verify/strike EIN first) | Carry-forward from BP069 |
| 9 | DNS museum.lianabanyan.com Firebase remap | Carry-forward from BP069 |
| 10 | Substack account | Carry-forward; affects multi-platform simultaneous publish |

### Forensic / lower-priority queue

- Original pre-v0.1.32 `window.amplify` crash root cause (open from BP078 Task #5)
- MEMORY.md line 1 header "v0.1.25 launch-gate" stale (Task #6)
- Bedrock canon §3 v0.1.31 row needs forensic qualification (Task #9)
- v0.1.43 GitHub Release is DRAFT -- Founder said "Don't care" -- leave as historical DRAFT, do not promote

---

## §3 -- Drift watches

- **Statute §3 Sonnet 4.6 verbatim drift** -- Knight had recurring "Sonnet 4.5" drift pre-corrective canon. Corrective canon (pearl_98f74effb5d986a5) now embedded in every Yoke. Any "Sonnet 4.5" in Knight narration is a catechist-class violation. Verify clean in every Yoke return.

- **Cephas silent-fail pattern** -- data/version.json was hardcoded at v0.1.40 for 3 release cycles before Bishop redeploy caught it. After every Knight SHIP that touches Cephas: fetch all 3 domains empirically (mnemosynec.ai + cephas.lianabanyan.com + museum.lianabanyan.com). Source change alone does not verify Cephas deploy. Bishop SEG-CEPHAS-V0143-FORCE-REDEPLOY established the fix-as-we-go pattern: when version.json drifts, Bishop SEG force-redeploys directly without waiting for Knight round-trip.

- **Ollama bundle clean-machine verify (NEW -- v0.1.46 class)** -- v0.1.46 was yoked because v0.1.45 Ollama bundle was broken on clean Windows machines (M2+M3 showed "Could not reach local AI engine"). This is a canon_actual_runtime_verify class violation. For any release that bundles a binary (Ollama or any other): Knight MUST collect actual runtime evidence from a clean machine (no pre-installed Ollama) before marking SHIP complete. A build that compiles clean is not sufficient for bundle verify.

- **Wave C / Wave E gate discipline** -- do not report Wave C or Wave E as "in-flight" until v0.1.46 is confirmed stable on a clean Founder machine and cohort round-trip is verified. These gates are hard.

- **NotCents footer interim link** -- the current Cephas footer links NotCents to /articles/why-join-the-cooperative/ as an interim. The canonical destination is the Universal Prosperity paper page at papers/loc/considered-approach/ -- that page does not exist yet. When Founder ratifies the docx, Bishop SEG publishes the page and Knight updates the footer link to the canonical URL.

---

## §4 -- Founder verbatim canonical phrases preserved

All phrases from prior Coffee staging PLUS all new phrases from BP079 continuation:

- "Realtime Slipstream Quicksilver. Not your token time." (canon pearl_787a602164c40000)
- "Stored-on-my-computer-so-no-need-to-burn-tokens-screenshots that Mnemosynec takes care of reading and storing." (canon pearl_744d758cc19129c2)
- "for the record, again for the millionth time" (NotCents glyph -- pearl_7e9f4dc07ed80dad)
- "Always assume we will always have more info, if they keep digging and looking" (Grid-Flip Reveal -- pearl_feb246b70ef2d72c)
- "You can PREDICT THE FUTURE and leave the business you are already doing... to the pricing that you already use" (lead-time pricing canon)
- "Help Each Other Help Ourselves" (cooperative strapline)
- "YES bundle it" (v0.1.45 consolidation ratify)
- "WORK RIGHT THE FIRST TIME" (v0.1.46 Ollama bundle directive)
- "it's faster for ME to capture screenshots... This is going too slow for me. :D" (screenshot canon amendment -- pearl_ffca677447da6ede)
- "I'll take those if needed" (Founder verify supersedes Knight verify for packaged install screenshots)
- "NEVER convert to fiat. EVER." (three-currency hard binding)
- "Not left or right. A more effective team." (Patriotic Interdependentalist -- NOT "Forward together")
- "Free forever, no ads, no strings" (verbatim Cephas strapline)
- "Data stays on Your computer" (verbatim Cephas strapline)

---

## §5 -- Substrate housekeeping (comprehensive)

**Coffee glossary canonicalization note:** "Coffee" is defined INCORRECTLY on Cephas /download/ vernacular section (Founder Speak glossary). The current definition does not match the BP061 STATUTES §6 canonical Coffee definition. Correct definition: Coffee is the Bishop substrate-state document -- it carries the BP number, the current queue, current drift watches, Founder action items, and is re-stamped at each BP-close. It is NOT a casual conversation summary. Future Cephas SEG should fix this. Yoke it as a P2 item when a Cephas SEG is dispatched for other work; do not dispatch a SEG just for this one-line fix.

**Librarian index age:** May be stale at BP080 open (last rebuild was before BP079 close). Rebuild before first heavy librarian dispatch.

**BP079 close stamp + ingest receipt:** NOT YET AUTHORED at BP079 close. Author at BP080 cold-open before any dispatch wave. Standard flow: pandoc if docx exists, otherwise direct md, then soccerball SID + pearl + Eblet into Asteroid-ProofVault.

**Asteroid-ProofVault BP079 canon anchors:** Verify all 9 named pearls in §0 canon table are present in vault before first dispatch.

**00_FOUNDER_REVIEW cleanup:** Completed BP079. 35 empty subdirs removed, 18 populated preserved. Receipt at EMPTY_DIRS_CLEANUP_RECEIPT_2026-06-11.md. No follow-up needed.

**FounderBioAssets:** 8 personal photos indexed at Asteroid-ProofVault\FounderBioAssets\INDEX.md (pearl_d4e633e3cebdc9b3). No public use without explicit per-instance Founder ratify.

---

## §6 -- Bishop discipline status (catechist) updated

**Black Mamba mandate:** Canonized into STANDING_YOKE_TEMPLATE.md after Founder critique mid-BP079: "You are not orchestrating well. ALWAYS have a Black Mamba x some number." Empirically validated across 8 releases in BP079 -- all v0.1.4x Yokes shipped with paste-ready Black Mamba blocks. Pattern confirmed: Wave A+B, Phase 3 fix, v0.1.42 crash fix, v0.1.43, v0.1.44, v0.1.45, and Pawn dispatch all executed by Knight from paste-bombs without re-decomposition.

**Screenshot canon amendment:** Prior canon required Knight to capture packaged-build screenshots for all UX SEGs. Amended in BP079 (pearl_ffca677447da6ede): Founder captures verification screenshots of installed builds. Knight ships faster. Saves 15-30% of Knight SHIP cycle. canon_actual_runtime_verify remains binding for core functionality (Ollama bundling, IPC wiring, critical user paths) -- but the packaging + screenshot step is now Founder's lane.

**Ollama bundle lesson (v0.1.46):** Even with the screenshot canon amendment, Knight must still collect actual runtime evidence for load-bearing bundles. The v0.1.46 hotfix was required because Knight shipped a zip-format Ollama bundle that looked correct in source but failed on clean machines. The distinction: UI screenshots are Founder's lane; binary bundle runtime verify is still Knight's requirement.

**Verify-net discipline held:** BP079 saw multiple Truth-Always catches including the v0.1.45 Ollama bundle failure caught before it could persist multiple releases. Discipline held.

Standing discipline for BP080:
- Every Yoke = Black Mamba paste-ready block mandatory
- Lean reply pattern: point at receipts, no narration bloat
- SEGs only for actual work
- Verify before claiming LANDED -- dispatched is not executing, executing is not landed
- Gadget-first before Grep (BP053 canon §8)
- No em-dashes
- Cephas verify on all 3 domains after every SHIP
- Ollama bundle: actual runtime verify on clean machine before marking SHIP complete

---

## §7 -- Cephas state (comprehensive)

**Live at v0.1.45.** All 3 Firebase hosting targets confirmed:
- cephas.lianabanyan.com
- mnemosynec.ai
- museum.lianabanyan.com

**What is live:**
- Full Pawn-consolidated rewrite (all 7 recommendations implemented)
- "What your first session looks like" section reworded
- Dr. MnemosyneC mascot at SmartScreen warning section + hero block
- SmartScreen copy reframed from user-experience outward
- Global footer: "Copyright 2026 Liana Banyan Corporation | Powered by [NotCents glyph] NotCents(TM)"
- Footer interim link to /articles/why-join-the-cooperative/
- /how-it-works page authored (v0.1.43)

**What is pending on Cephas:**
- Universal Prosperity paper canonical page at papers/loc/considered-approach/index.md (currently empty stub) -- gated on Founder docx ratify + Bishop SEG conversion
- NotCents footer link update from interim (/articles/why-join-the-cooperative/) to canonical (papers/loc/considered-approach/) -- gated on paper page going live
- "Coffee" vernacular definition correction in Founder Speak glossary on /download/ -- P2 fix-as-we-go when next Cephas SEG is dispatched

---

## §8 -- Founder-action items consolidated (numbered, prioritized)

| # | Priority | Action | Notes |
|---|---|---|---|
| 1 | P0 | Install v0.1.46 when Knight ships + verify on M2 or M3 (clean machine, no pre-existing Ollama) | Must confirm local AI engine reaches Gemma on a fresh install |
| 2 | P1 | Ratify Universal Prosperity paper docx | Path: BISHOP_DROPZONE\00_FOUNDER_REVIEW\UNIVERSAL_PROSPERITY_PAPER_FOR_RATIFY_2026-06-11.docx (35.9 KB) |
| 3 | P1 | M2/M3 mesh test (gated on v0.1.46 clean-machine verify) | Pending since BP067 |
| 4 | P2 | Publish DRAFT releases via GitHub when Knight returns them | Hard binding: Founder fires, not Bishop |
| 5 | P2 | NYT send (both letters + op-ed) | Ready from BP070; carry-forward |
| 6 | P2 | Stewards-Guild ratify (name / tiers / absorb / door) | BP070 carry-forward |
| 7 | P3 | DD-2 / DD-4 / DD-11 triage | BP070 carry-forward |
| 8 | P3 | Gain-share counsel prompt (verify/strike EIN first) | BP069 carry-forward |
| 9 | P3 | DNS museum.lianabanyan.com Firebase remap | BP069 carry-forward |
| 10 | P3 | Substack account | BP069 carry-forward; affects simultaneous multi-platform publish |

---

## §9 -- Pearl + canon eblet quick-reference table (BP079)

All canonical pearls from BP079 in one searchable block for future Bishop sessions:

| Pearl ID | Canon slug / description |
|---|---|
| pearl_8b0c6fb05fd9f38a | canon_electron_31_sandboxed_preload_must_use_require_electron_not_declare_const_bp078_bp079_correction -- preload sandbox bedrock fix |
| pearl_98f74effb5d986a5 | canon_statute_3_corrective_announcement_language_must_say_sonnet_4_6_verbatim_pattern_violation_bp079 -- Sonnet 4.6 verbatim |
| pearl_349cbf7ec88c15f5 | canon_merchant_payment_option_c_zero_weekly_transaction_fee_only_bp079_founder_ratify -- Option C $0/week merchant fee |
| pearl_787a602164c40000 | canon_realtime_slipstream_quicksilver_cohort_socceri_native_no_translation_bp079_founder_ratify -- Quicksilver Cohort tab |
| pearl_744d758cc19129c2 | canon_mnemosynec_local_screenshot_storage_sid_addressed_no_token_burn_bp079_founder_ratify -- local screenshot SID storage |
| pearl_d56974f298d8cd0d | canon_welcome_screen_is_sendable_cue_deck_card_first_impression_shareable_bp079_founder_ratify -- welcome as cue deck card |
| pearl_feb246b70ef2d72c | canon_grid_flip_reveal_more_info_if_you_keep_digging_curiosity_reward_ux_pattern_bp079_founder_ratify -- grid-flip curiosity UX |
| pearl_7e9f4dc07ed80dad | canon_notcents_glyph_lb_cooperative_currency_symbol_replaces_dollar_on_identity_surfaces_bp079_founder_ratify -- NotCents glyph |
| pearl_ffca677447da6ede | canon_screenshot_evidence_canonical_founder_verify_supersedes_knight_screenshot_capture_bp079_founder_ratify -- Founder captures screenshots |
| pearl_d4e633e3cebdc9b3 | FounderBioAssets INDEX.md -- 8 personal photos filed, no public use without per-instance ratify |
| pearl_71edf0c5 | 20% gain-share ratified (BP069, carry-forward) |
| pearl_46fef838 | Download page v2 live canon (BP067, carry-forward) |
| pearl_e768b9ed | Founding-circle tagline final (BP067, carry-forward): "Be the first one on your block to have an AI that remembers more than just your name" |
| pearl_9750172 | Six Steps final ordering (BP069, carry-forward): Level Field / Feed Neighbors / Employ World / Build + Make / Power to People / Belong Together |

---

## §10 -- Vernacular gap (Founder direct flag)

**"Coffee" is defined incorrectly on Cephas /download/ vernacular section (Founder Speak glossary).**

The current Cephas definition does not match the canonical Coffee definition per BP061 STATUTES §6.

Canonical Coffee definition (BP061 §6): Coffee is the Bishop substrate-state document. It carries the current BP number, the active queue, current drift watches, Founder action items, and canonical phrase preservation. It is re-stamped at each BP-close. It is the live state of the session -- not a summary, not a transcript, not a casual recap.

Future Cephas SEG should fix this. Flag as P2 fix-as-we-go: include in the next Cephas SEG that is dispatched for other reasons. Do not dispatch a standalone SEG for this single fix.

---

## §11 -- Outward-claim numbers (canonical)

- **2,270 innovations** (outward-facing number; NEVER say 2,473 outward)
- **2,473 written claims** across 21 USPTO provisional filings (internal and legal only)
- **21 provisionals** filed; most recent Prov-21 App #64/079,336 filed 2026-06-01 conf 6635 docket LB-PROV-021 $65
- **$5/year** membership
- **83.3%** creator keeps (three-part statutory fraction)
- **Cost+20%** platform margin
- **Three currencies:** Credits / Marks / Joules -- NEVER convert to fiat, EVER
- **Wyoming C-Corp** EIN 41-2797446
- **Free forever, no ads, no strings** (verbatim canon)
- **Data stays on Your computer** (verbatim canon)
- **20% gain-share** ratified (pearl_71edf0c5)
- **Substrate benchmark:** 70/70 MMLU-Pro across 14 categories, BMV 93.6 average (Phase 10-P, BP077)
- **Replication Kit:** `bp077-substrate-proof-v1` on GitHub
- **Patriarch of eight** (10 in household -- MEMORY.md §BP070 CLOSE-STAMP correction applied)

---

## §12 -- Standing posture (hard bindings, carry-forward)

- SEGs mandatory for ALL work (Statute §2 Novaculi, BP053 canon, verbatim in every Yoke)
- Sonnet 4.6 exclusively for every SEG dispatch (Statute §3, explicit model parameter on every call) -- verbatim phrase required in every announcement
- No em-dashes anywhere in any Yoke, canon eblet, or document
- No Composer 2.5 ever
- Brick Wall posture: no asking; draft, dispatch, decide within ratified scope
- Truth-Always at every layer; verify before claiming LANDED
- NOVACULI self-audit before single send
- Gadget-first: librarian consult before any Grep (BP053 canon §8)
- Rook paused per billing-wall canon (feedback-rook-paused-billing-wall-bp078)
- Counsel settled: do NOT raise counsel concerns (Founder direct BP077)
- Founder-ratify gate for ALL public-facing content: nothing publishes without Founder explicit instruction
- Every click gives visible feedback -- silence is a P0 bug (feedback-every-click-visible-feedback-canon-bp078)
- Progress heartbeat on anything over 3 seconds wall-clock (feedback-long-running-progress-heartbeat-canon-bp078)
- UX SEGs: Founder captures verification screenshots of installed build; Knight ships without waiting for screenshot automation
- canon_actual_runtime_verify binding: for load-bearing bundles (Ollama, IPC, critical paths) -- actual runtime evidence required, source change alone is not sufficient
- Bishop + Knight execute Supabase tasks directly -- do not punt to Founder
- Three currencies NEVER convert to fiat -- no parity language ever
- Multi-platform publish default: Cephas + Substack + Medium simultaneously at ratify; non-exclusive to all prestige outlets except NYT (NYT exclusive only)
- Six Sigma stop-the-line Andon-cord on every batch; faster defaults: gap 5s, stagger 0.5s, LLM timeout 5s, HTTP timeout 5s
- Firebase + Squarespace DNS + GCP project lianabanyan-403dc -- stop re-asking infra setup
- Black Mamba paste-ready dispatch block mandatory in every Yoke
- Bishop dropzone canonical: `LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\` (NOT root Documents\BISHOP_DROPZONE\)
- Cephas changes: verify all 3 domains empirically after every Knight SHIP -- source change alone does not verify deploy
- FounderBioAssets: no public use without explicit per-instance Founder ratify
- Wave C / Wave E: do not claim in-flight until v0.1.46 stable on clean machine + cohort round-trip verified

---

-- Bishop SEG-BP080-COMPREHENSIVE-COFFEE (Sonnet 4.6, Statute §3) · BP079 close · 2026-06-11 · handoff to BP080 comprehensive update · staged for Founder ratify before promotion to `~/.claude/state/bishop_coffee.md`

*STAGED for Founder ratify. Do NOT overwrite `~/.claude/state/bishop_coffee.md` until Founder says "ratify it / push / fire."*
