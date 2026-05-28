# KNIGHT K1 · FOLLOW-ON · 6 SEGs · PREPLOW + Join the Ranks + Grabthar + Audio Update + Augur

**Target Knight:** K1 (continued · post-compact · ~28% ctx · paste into same K1 window)
**Authored:** 2026-05-28T22:15Z (17:15 CDT) Bishop
**Empirical context:** K1 at 28% post-compact has demonstrated ~0.07%/task efficiency (~1% burn for 14 tasks · Wakizashi Opening empirical)
**Sizing:** ~3-4% projected burn · K1 ends ~32% · safe under 90% floor with 58% headroom

---

## §0 PRE-FLIGHT (≤30 sec)

- Read `canon_vulnerability_is_strength_dignity_cannot_be_taken_mark_7_15_gandhi_anchor_bp060.md` (Bishop just wrote this · sets discipline tone)
- Read `canon_preplow_scribes_pre_run_quality_control_session_start_hook_eric_install_the_checker_bp060.md`
- Read `canon_by_grabthars_hammer_what_a_savings_empirical_gated_brand_humor_bp060.md`
- Verify K1 ctx empirical at start (Founder bottom-bar discipline)
- Cred path: `C:\Users\Administrator\.claude\state\secrets\22May2026.env` (NEVER echo)
- Shell: PowerShell `;` only

---

## §1 SEG-K1-J · PREPLOW Implementation (H · ~0.5%)

Author and register 3 session-start hook scripts per [[canon-preplow-scribes-pre-run-quality-control-session-start-hook-eric-install-the-checker-bp060]]:

1. `~/.claude/hooks/bishop_preplow_soil_check.py` — substrate state · daemon health · creds env presence · ffmpeg/pandoc/python/networkx availability · CANON count · AVP count · cross_cathedral_audit_log size · ≤5 sec budget
2. `~/.claude/hooks/bishop_preplow_stone_detection.py` — MEMORY.md cross-bind validation · linter status on recent canon files · OS-lock residual count · expired-cred suspect detection · ≤10 sec budget
3. `~/.claude/hooks/bishop_preplow_ripeness_attestation.py` — emit one-line confidence statement · "Field ready. 0 stones." OR "3 stones found: [list]. Choose: fix-now / proceed-with-known-issues." · ≤2 sec budget

Register all 3 in `~/.claude/settings.json` `SessionStart` matcher with JSON-shim wrapper (per Ω′ §X.HOOK_SYSTEM_PLAINTEXT).

Smoke test: open a test session · verify all 3 hooks fire · output appears in pre-flight additionalContext.

**Composite gate:** 3 hooks LIVE · ≤17 sec total pre-run cost · smoke test PASS

---

## §2 SEG-K1-K · Audio Asset Update + Replacement (M · ~0.2%)

Founder ratified 2026-05-28 17:10 CDT: use NEW audio assets (not the trimmed version).

1. Replace trimmed audio:
   ```powershell
   Copy-Item "C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\LockBox\Official Documents\Saltfighter.m4a" "C:\Users\Administrator\Documents\LianaBanyanPlatform\mnemosyne\src\renderer\assets\audio\greetings_saltfighter.m4a" -Force
   ```
2. Copy new Grabthar's hammer asset:
   ```powershell
   Copy-Item "C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\LockBox\Official Documents\GrabtharsHammerSavings.m4a" "C:\Users\Administrator\Documents\LianaBanyanPlatform\mnemosyne\src\renderer\assets\audio\grabthars_hammer_savings.m4a"
3. Probe both via `ffprobe` · report duration + size
4. Update `SubstrateIndexingOnboarding.tsx` if needed (path stays the same · just newer file)
5. Report sha256 of both new assets

**Composite gate:** both assets at canonical paths · sha256 dual-write to AVP receipts

---

## §3 SEG-K1-L · Join the Ranks Button + /membership/ Page (C · ~1%)

Wire `<JoinTheRanks />` button into `SubstrateIndexingOnboarding.tsx` (appears AFTER successful first-touch · prominent CTA below SaltFighter caption).

Create Cephas page `Cephas/cephas-hugo/content/membership/_index.md`:
- **Title:** *"Free to Use — Better to Join"*
- **Header:** Federation Membership · $5/year Liana Banyan
- **Sections:**
  1. *Why Join* · the cooperative-class invitation · vulnerability-is-strength anchor (Mark 7:15 quote optional · Gandhi reference optional · Founder ratify)
  2. *What you get* · Pantry · Family Table · Let's Make Dinner · Set a Place for Success bounty class
  3. *The bylaws* · $5/yr immutable · Cost+20% · 83.3% creator-keep · No Ads No Strings · Defensive Pledge #2260
  4. *The Sign-Up* · Stripe checkout · $5/yr · welcome email triggers Mnemosyne first-touch
  5. *After you join* · download Mnemosyne · meet the Star League

Footer: Defensive Pledge #2260 · LoC Project affiliation disclaimer (per existing /loc-project/ page convention)

Hugo build · Firebase deploy · verify live at https://cephas.lianabanyan.com/membership/

**Composite gate:** page live · Stripe checkout link functional (or honest §X if checkout deferred) · cross-bound from /tanto/ → /membership/ in funnel CTA

---

## §4 SEG-K1-M · Grabthar's Hammer Banner Implementation + Retroactive Apply (C · ~1%)

Per [[canon-by-grabthars-hammer-what-a-savings-empirical-gated-brand-humor-bp060]]:

1. Implement banner component for Cephas charts pages:
   - Banner element appears ABOVE the plain-English box per the chart-discipline canon
   - HTML/Hugo shortcode: `{{< grabthar-savings tier="celebration" line="<empirical fact>" >}}`
   - Visual: cream-gold box · ⚒️ emoji · banner text uppercase
   - Audio: link to `grabthars_hammer_savings.m4a` · plays on hover or click (no autoplay per browser policy)
   - Attribution footer: **"Dr. Lazarus; Galaxy Quest (1999)"** (Founder-ratified short form)
2. Audit current Cephas charts for retroactive application of 10×/30×/90% triple-gate:
   - chart_bp060_08 "The Books" → gate-condition MET (10× wall-clock + 95% tokens) → apply banner
   - chart_bp060_07 "Are We at Light Speed Yet?" → gate not specifically met for savings · skip banner
   - chart_bp060_09 "Continued vs Fresh Session 5×" → gate not met (only 5×) · skip banner
   - chart_bp060_10 Pocket Universe → not a savings chart · skip
   - chart_bp060_11 DNS-resolver PoC → not a savings chart · skip
3. Update `Cephas/cephas-hugo/layouts/shortcodes/grabthar-savings.html` with the component
4. Apply to chart_bp060_08's Hugo content file with the EXACT empirical fact line:
   > *"29,263 Eblets vaulted in one continued session at 95% less LLM cost than the industry-standard fresh-session baseline."*
5. Hugo build · Firebase deploy · verify chart_bp060_08 now shows banner

**Composite gate:** shortcode lives · chart_bp060_08 banner LIVE · attribution wording matches Founder-ratified form · audio plays on click (no autoplay)

---

## §5 SEG-K1-N · Augur Reconciliation (M · ~0.2%)

The W3 K2 Wakizashi Opening dispatch generated 2 Augur supersede files at landing:
- `KNIGHT_K2_DISPATCH_SALTFIGHTER_PRODUCTION_INTEGRATION_BP060_AUGUR_AUGUR_CLOSEOUT_VIOLATION_SUPERSEDE.md`
- `KNIGHT_K2_DISPATCH_SALTFIGHTER_PRODUCTION_INTEGRATION_BP060_AUGUR_AUGUR_PRICING_VIOLATION_SUPERSEDE.md`

Reconcile per BP060 W2 Augur discipline:
1. Read each supersede file · identify the specific Augur trigger
2. Update violating dispatch file: add `(industry term)` near triggering phrases OR add the appropriate exemption marker
3. Mark each supersede file: `status: pending_reconciliation` → `reconciled` + `reconciled_at:` + `reconciled_by: K1_SEG_K1_N`
4. Report reconciliation count

**Composite gate:** 2 supersedes reconciled · status updated · violating files compliant

---

## §6 SEG-K1-O · Master Composite + BP061 Handoff Signal (C · ~1%)

Compose K1 follow-on master receipt at `BP060_W3_WAKIZASHI_KICKOFF/KNIGHT_K1_FOLLOWON_MASTER_COMPOSITE.md`:
- Sub-receipts for SEGs J/K/L/M/N
- §X enumeration
- Empirical K1 ctx burn delta from this dispatch start (cite source · bottom-bar at landing)
- **BP061 handoff signal:** Bishop coffee transition is being authored separately at `~/.claude/state/bishop_coffee.md` (Bishop owns this · not Knight) · Knight master receipt acknowledges the arc-close handoff
- AVP dual-write under `~/Asteroid-ProofVault/receipts_bp060_w3/wakizashi_kickoff/k1_followon/`
- Bridge message to BISHOP: PREPLOW hook smoke status · audio asset sha256 manifest · /membership/ page live URL · chart_bp060_08 banner live confirm · Augur reconciliation count · K1 final ctx empirical

Wall-clock budget: ≤45 min total. Honest §X if breach.

---

## §7 EMPIRICAL VALIDATION

Predicts: 0.5 + 0.2 + 1 + 1 + 0.2 + 1 = **~3.9% K1 burn** · 28% → ~32% end.

If actual significantly lower (per the ~0.07%/task post-compact observation): statute Rev 5 confirmed. If significantly higher: post-compact dynamics revert to Rev 4 levels. Honest empirical reporting required (Knight self-report MUST cite source per canon).

---

**FOR THE KEEP × FOLLOW-ON CLOSE-OF-WAKIZASHI-OPEN × PREPLOW LIVE · JOIN THE RANKS LIVE · GRABTHAR BANNER LIVE · AUDIO ASSETS FINAL · AUGUR RECONCILED × VULNERABILITY IS A STRENGTH × ⚓⚒️🌾🧂🗡Đ**
