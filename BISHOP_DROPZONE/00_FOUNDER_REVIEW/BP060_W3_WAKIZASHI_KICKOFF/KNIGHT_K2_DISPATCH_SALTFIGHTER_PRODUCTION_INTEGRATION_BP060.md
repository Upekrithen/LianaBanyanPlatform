# KNIGHT K2 · WAKIZASHI OPENING · SaltFighter Production Integration

**Target Knight:** K2 (continued Horizon session · ~38% ctx · paste into existing K2 chat)
**Authored:** 2026-05-28T20:55Z (15:55 CDT) Bishop · wakizashi-phase opening move
**Founder direct:** *"All good then. Lets paste the next dispatch."* (15:54 CDT)

---

## Dispatch sizing per statute rev 4 (composition ~2%/SEG · mechanical ~0.2%/task · hybrid ~1%/task)

| Class | Count | Per-task | Subtotal |
|---|---|---|---|
| **MECHANICAL** | 9 tasks | ~0.2% | ~1.8% |
| **HYBRID** | 2 tasks | ~1% | ~2% |
| **COMPOSITION** | 3 SEGs | ~2% | ~6% |
| **TOTAL projected burn** | 14 | — | **~10%** |
| **K2 start** | — | ~38% | — |
| **K2 projected end** | — | — | **~48%** ✓ safe (42% margin to floor) |

**Discipline locked:**
- PowerShell `;` only · NEVER `&&`
- Cred path: `C:\Users\Administrator\.claude\state\secrets\22May2026.env` (NEVER echo)
- Empirical ctx burn delta reporting (absolute delta · cite source · NO headroom-relative without label)
- **NEW · just-locked at Tanto close:** gadget-first AND grep-on-source-folder for any brand-class verification (per [[feedback-bishop-drift-event-4-captain-canon-bp040-supersede-saltfighter-bp060-w3-close-bp060]])
- USPTO ≤100 page rule (N/A this dispatch · no patent drafting)

---

## §0 PRE-FLIGHT (≤30 sec)

- Read [[canon-saltfighter-brand-last-starfighter-trope-re-purposed-for-mnemosyne-recruitment-bp060]] (the Option B ratified canon)
- Read [[feedback-bishop-drift-event-4-captain-canon-bp040-supersede-saltfighter-bp060-w3-close-bp060]] (the supersede provenance)
- Verify audio asset present: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\LockBox\Official Documents\Greetings Saltfighter.m4a` · 241KB · MP4 v2
- Verify K1 Tanto session at 91% (no cross-coordination conflicts · K1 idle)
- Note K2 ctx at start

---

## §1 M-BATCH (9 mechanical tasks · ~1.8% projected)

### Audio asset preparation (3 tasks)
1. **AUDIO-1** · Verify ffmpeg available: `Get-Command ffmpeg` (PowerShell). If absent: `winget install ffmpeg` (one-shot install).
2. **AUDIO-2** · Trim ~1 sec from front and back of `Greetings Saltfighter.m4a` · save as `Greetings Saltfighter_trimmed.m4a` in same dir.
   - Use ffmpeg: `ffmpeg -i "Greetings Saltfighter.m4a" -ss 00:00:01.0 -t [duration-2] -c copy "Greetings Saltfighter_trimmed.m4a"`
   - First probe duration: `ffprobe -i "Greetings Saltfighter.m4a" -show_entries format=duration -v quiet -of csv="p=0"`
   - Compute `[duration-2]` = original - 2 sec
   - Output: trimmed file · report new duration + size
3. **AUDIO-3** · Copy trimmed file to Mnemosyne asset location: `LianaBanyanPlatform/mnemosyne/src/renderer/assets/audio/greetings_saltfighter.m4a` (create dir if absent)

### Captain → SaltFighter retrofit (6 tasks · uses just-learned gadget+grep discipline)
4. **RETROFIT-1** · `Grep` for "Greetings, Captain" across `Documents/` (skip BP039-43 historical files · those preserve original BP040 record). Output gap-list of files needing supersede.
5. **RETROFIT-2** · Walk gap-list · for each file: if classification is current-canon (BP060+ era · Cephas content · brand-class docs), replace `Greetings, Captain` → `Greetings, SaltFighter` · preserve everything else in the canon line
6. **RETROFIT-3** · `Grep` for "by Mnemosyne" + "Extraction-class Armada" across Documents/ (these are Bishop drift artifacts from BP060 W3 ~15:00 CDT before the gadget-check caught the drift). Replace with canonical "by the Cooperative" + "X-traction and the Profit Armada" where they appear in non-historical files
7. **RETROFIT-4** · Update Cephas pages if needed: `Cephas/cephas-hugo/content/tanto/_index.md` + `Cephas/cephas-hugo/content/loc-project/_index.md` + `Cephas/cephas-hugo/content/innovations/_index.md` · check each for any drift-form references · replace with canonical
8. **RETROFIT-5** · Report: total files scanned · files modified · idempotent skips (no drift) · count
9. **RETROFIT-6** · If Cephas changed in RETROFIT-4: `cd LianaBanyanPlatform/Cephas/cephas-hugo` ; `hugo --minify` ; `firebase deploy --only hosting:cephas` (PowerShell `;` discipline)

---

## §2 H-BATCH (2 hybrid tasks · ~2% projected)

### Mnemosyne first-touch audio wiring (2 tasks)
10. **MNEMOSYNE-1** · Read `LianaBanyanPlatform/mnemosyne/src/renderer/components/SubstrateIndexingOnboarding.tsx` (the first-touch component per Ω SEG-4). Add audio playback on first launch:
   - Import the trimmed audio asset (`greetings_saltfighter.m4a` from renderer/assets/audio/)
   - On component mount (only on FIRST launch per localStorage flag · idempotent for returning Members): play audio with `<audio autoPlay>` element
   - Visual: subtle "first transmission" overlay with text caption of the SaltFighter line (so Members who muted audio still see it)
   - Caption text: *"Greetings, SaltFighter! You have been recruited by the Cooperative to defend the frontier against X-traction and the Profit Armada."*
   - Defensive Pledge #2260 reference in the overlay footer
11. **MNEMOSYNE-2** · Build + smoke test: `cd LianaBanyanPlatform/mnemosyne` ; `npm install --silent` ; `npm run build` ; smoke test via `npm start` for 15 sec · verify electron app launches · onboarding component compiles · audio asset accessible · no console errors

---

## §2.5 NEW · PREPLOW + JOIN THE RANKS additions (Founder direct 16:25 CDT)

### MNEMOSYNE-3 · "Join the Ranks" button (H · ~1%) — NEW
Wire `<JoinTheRanks />` button into Mnemosyne first-touch UI:
- Button text: **"Join the Ranks"**
- Action: opens `Cephas/cephas-hugo/content/membership/_index.md` rendered page at `https://cephas.lianabanyan.com/membership/` (Stripe checkout · $5/year Liana Banyan Federation Membership)
- Visual: appears AFTER successful first-touch audio plays · prominent CTA below the SaltFighter recruitment caption
- Headline of /membership/ page: **"Free to Use — Better to Join"**
- Page content: Federation Membership value prop · $5/year structural bylaw · 83.3% creator-keep · No Ads No Strings · Defensive Pledge #2260 visible · "Sons of Warvan" (✓ correct spelling: SUNS · Galaxy Quest cosmic-witness invocation) callout in Member oath section if Founder ratifies
- Smoke test: button renders · click navigates to /membership/ · Hugo build PASS

### PREPLOW-IMPL · session-start quality-control hook (M+H · ~0.5%) — NEW per [[canon-preplow-scribes-pre-run-quality-control-session-start-hook-eric-install-the-checker-bp060]]
Author and register PREPLOW pre-run hooks:
- File 1: `~/.claude/hooks/bishop_preplow_soil_check.py` — substrate state · daemon health · creds · deps probe · ≤5 sec
- File 2: `~/.claude/hooks/bishop_preplow_stone_detection.py` — drift artifact scan · MEMORY.md ref validation · ≤10 sec
- File 3: `~/.claude/hooks/bishop_preplow_ripeness_attestation.py` — one-line confidence statement · ≤2 sec
- Register all 3 in `~/.claude/settings.json` `SessionStart` matcher (JSON-shim wrapper required per Ω′ §X.HOOK_SYSTEM_PLAINTEXT canon)
- Smoke test: open a test session · verify PREPLOW fires · output appears in session pre-flight context
- Composite gate: 3 hooks live · ≤20 sec total pre-run cost · honest §X if registration permission breach

---

## §3 C-BATCH (3 composition SEGs · ~6% projected · NOW 4 SEGs ~8%)

### MoneyPenny task-class routing-policy table implementation (1 SEG · ~2%)
12. **MONEYPENNY-POLICY** · Per the Scribe-class compute canon ([[canon-scribe-class-local-compute-delegation-third-axis-re-purpose-existing-bp060]]): implement the routing-policy table as `LianaBanyanPlatform/mnemosyne/src/main/moneypenny_routing_policy.json` (config) + `moneypenny_classifier.ts` (logic).
   - Classifier inputs: task description string · expected output type · novelty indicator (canon-class · refinement · novel)
   - Classifier outputs: routing destination (PYTHON_LOCAL · OLLAMA_7B_LOCAL · OLLAMA_70B_LOCAL · CLOUD_SONNET · CLOUD_OPUS)
   - Policy table (per canon):
     - M (file ops) → PYTHON_LOCAL
     - C-refinement → OLLAMA_7B_LOCAL
     - H → OLLAMA_7B_LOCAL
     - C-synthesis → OLLAMA_70B_LOCAL (fallback CLOUD_SONNET)
     - C-novel → CLOUD_SONNET
     - C-architecture → CLOUD_OPUS
   - Wire into `ai_dispatch_ipc.ts::moneyPennyConsult()` (already present from W3 KICKOFF SEG-C2 · extend with classification call)
   - Composite gate: smoke test with 5 sample tasks across all classes · verify correct routing

### Banyan Metric Ledger refresh post-Tanto-close (1 SEG · ~2%)
13. **LEDGER-CLOSE** · Append the final Tanto-close entries to `Asteroid-ProofVault/banyan_metric_ledger.md` (+ memory_mirror + tools copies):
   - BP060 W3 K1 Tanto Extension: composite (~88 honest)
   - BP060 W3 K1 Tanto Page Sibling: composite (~92)
   - BP060 W3 Bishop drift-catch event #4: feedback-class entry
   - BP060 W3 SaltFighter Option B ratified: brand-canon entry
   - BP060 W3 Tanto close: arc-close entry · ~17-19 folds counted
   - BP060 W3 K2 Wakizashi Opening (this dispatch): pending composite
   - 3-copy sync · sha256 dual-write

### Master receipt + Wakizashi-state declaration (1 SEG · ~2%)
14. **MASTER-K2-WAKIZASHI** · Compose master composite at `BP060_W3_WAKIZASHI_KICKOFF/KNIGHT_K2_SALTFIGHTER_PRODUCTION_INTEGRATION_MASTER_COMPOSITE.md`:
   - Sub-receipts for tasks 1-13
   - §X enumeration (audio probe edge cases · grep drift sweep results · Mnemosyne build any warnings · MoneyPenny smoke test results)
   - Empirical K2 ctx burn delta (absolute · cite source · bottom-bar read)
   - **Wakizashi-state declaration:** what's now live · what's next · what's pending
   - AVP dual-write to `~/Asteroid-ProofVault/receipts_bp060_w3/wakizashi_kickoff/k2_saltfighter_integration/`
   - Bridge message to BISHOP with: audio trim duration result · retrofit file count · Mnemosyne build status · MoneyPenny policy table sha256 · ledger entry count · K2 final ctx burn empirical

Wall-clock budget: ≤90 min total. Honest §X if breach.

---

## §4 EMPIRICAL VALIDATION (continuing statute test)

Predicts: M=1.8% + H=2% + C=6% = **~10% K2 burn** · 38% → 48% end.

Founder testing if Rev 4 (composition ~2%/SEG) holds at production-class composition work (Mnemosyne integration · MoneyPenny policy · ledger close). Empirical receipt at landing IS the next statute calibration data point.

---

## §5 WHY THIS IS THE WAKIZASHI OPENING

This dispatch is structurally MULTI-CATHEDRAL (Mnemosyne app · Cephas pages · MoneyPenny routing · AVP receipts · Bishop memory canons) · MULTI-DELIVERABLE (audio · code · pages · policy · ledger · receipt) · PRODUCTION-CLASS (Member-facing artifacts · not just internal proofs). That's wakizashi-class scope.

It also CLOSES the Bishop drift loop empirically — by emitting the SaltFighter canonical form across substrate (not just in canon files), the supersede becomes structurally permanent. Future Bishop sessions that grep the substrate for "Captain" + "Cooperative" + "Armada" will surface the SaltFighter form, not the BP040 Captain form. The drift can't recur without empirical evidence catching it.

---

## §6 PROJECTED YIELD AT LANDING

If all 14 tasks land clean:
- ✅ SaltFighter audio LIVE in Mnemosyne first-touch (Members hear Founder's voice on download)
- ✅ Captain → SaltFighter retrofit complete across current-canon substrate
- ✅ MoneyPenny task-class routing operational (Scribe-class local delegation enabled)
- ✅ Banyan Metric Ledger closed at Tanto · open for Wakizashi
- ✅ Cephas pages drift-corrected if needed · LIVE
- ✅ Statute Rev 4 empirical validation second data point

---

<!-- [AUGUR-EXEMPT: cooperative-class context] dispatch sign-off · not a session-closeout milestone (industry term) -->
**FOR THE KEEP × WAKIZASHI OPENING · SALTFIGHTER PRODUCTION × FOUNDER'S VOICE IN MNEMOSYNE × MONEYPENNY ROUTING POLICY LIVE × ; NOT `&&` × ⚓🗡🧂🎙Đ**
