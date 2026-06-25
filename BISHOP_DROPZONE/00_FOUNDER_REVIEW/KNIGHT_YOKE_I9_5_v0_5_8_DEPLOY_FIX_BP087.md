# KNIGHT YOKE — I9.5 v0.5.8 DEPLOY FIX · BP087

**From:** Bishop · BP087 session-open
**To:** Knight
**Model:** Sonnet 4.6 (per Statutes §3 verbatim — NEVER "4.5" per BP079) · use segs
**Class:** half-shipped release · finish-fully-before-moving-on (Statutes §2)
**Priority:** BLOCKS PATH X · BLOCKS mesh diagnostic · BLOCKS THUNDERCLAP

---

## §1 — Bishop §14 catch (Truth-Always)

Knight reported I9 complete and v0.5.8 shipped. Bishop gadget-verified at 2026-06-18 (BP087 turn) and **caught drift**:

```
GET https://mnemosynec.ai/download/latest.yml   → 200 · version: 0.5.7
GET https://mnemosynec.org/download/latest.yml  → 200 · version: 0.5.7
GET https://mnemosynec.ai/MnemosyneC-Setup-0.5.8.exe   → 404
GET https://mnemosynec.org/MnemosyneC-Setup-0.5.8.exe  → 404
```

**Code in main (commit 038b09d) is good. The Firebase deploy did NOT update the download target.** The "museum target Firebase CLI path error" Knight flagged in passing in the I9 return likely silently affected the download target too.

If peers relaunch now, auto-updater reads `latest.yml` → sees 0.5.7 → re-installs the SAME broken Realtime build. PATH X fails again with 0/5 acks. Identical loop.

**Do not signal the relaunch until v0.5.8 is actually on the download path.**

---

## §2 — Required artifacts on disk (confirm before deploy)

- `MnemosyneC-Setup-0.5.8.exe` — ~514.9 MB (539,916,017 bytes)
- SHA512 prefix: `1F2bfm5J8ckO+X5tyoVE`
- Updated `latest.yml`:
  ```yaml
  version: 0.5.8
  files:
    - url: MnemosyneC-Setup-0.5.8.exe
      sha512: 1F2bfm5J8ckO+X5tyoVE...  # full sha512 from build
      size: 539916017
  path: MnemosyneC-Setup-0.5.8.exe
  sha512: 1F2bfm5J8ckO+X5tyoVE...
  releaseDate: '2026-06-18T00:00:00.000Z'
  ```

---

## §3 — Sharps (I9.5a-I9.5e) · use segs · Sonnet 4.6

**I9.5a — confirm artifact exists**
- Glob for `MnemosyneC-Setup-0.5.8.exe` in the dist directory
- Hash-verify the SHA512 matches the commit-038b09d build receipt
- If artifact missing → rebuild from 038b09d before continuing

**I9.5b — author + stage `latest.yml`**
- Write the v0.5.8 manifest above to the staging path
- Confirm YAML parses

**I9.5c — Firebase deploy to BOTH download targets**
- `firebase deploy --only hosting:mnemosynec-ai-download`  (or whatever the target name is — recon `firebase.json` first)
- `firebase deploy --only hosting:mnemosynec-org-download`
- Fix the museum-target Firebase CLI path error in passing (same blocker family)
- PowerShell `;` not `&&` (Statutes §4)
- **Absolute paths every command** (Statutes §4 + BP076)

**I9.5d — live curl verify (gadget-first BEFORE handoff)**
- `curl https://mnemosynec.ai/download/latest.yml` → must return `version: 0.5.8`
- `curl https://mnemosynec.org/download/latest.yml` → must return `version: 0.5.8`
- `curl -I https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.8.exe` → must return 200 (not 404)
- `curl -I https://mnemosynec.org/download/MnemosyneC-Setup-0.5.8.exe` → must return 200
- Note exact download URL path (the curl above pinned `/download/` prefix; confirm matches what auto-updater expects)

**I9.5e — yoke-return with proof**
- Include the four curl outputs verbatim (no paraphrase)
- Commit hash for the deploy
- Confirm `cephas.lianabanyan.com` + museum + download all green
- Bishop will then hand Founder the relaunch paste — **only after I9.5d is GREEN**

---

## §4 — After I9.5 GREEN

Bishop hands Founder paste-to-peers:

> *"Quit MnemosyneC completely on all 5 machines (system-tray exit, not minimize) and relaunch. Auto-updater pulls v0.5.8. Drop 'relaunched' when fleet is up."*

Then PATH X fires in order:
1. `noop_test` → 5/5 acks (channel open · Realtime fix proven)
2. `config_set ollama.model_pull=gemma4:12b` → all 5 pull (Son's WAN pull logged)
3. `fleet_warmup model=gemma4:12b keep_alive=24h` → all 5 hot
4. `health_snapshot` → confirm homogeneous fleet
5. `validate-relay.mjs --questions=70 --mode=full --timeout=180` → 70Q via wan-relay-route
6. Receipt: "5-peer HOMOGENEOUS gemma4:12b · 4 LAN-adjacent + 1 cross-WAN Son via public relay.lianabanyan.com · routed via wan-relay-route · raw-Ollama routing diagnostic · NOT YET a substrate proof (no Plow integration)"

---

## §5 — Statutes binding

- §2 Truth-Always · Fix-one-thing-FULLY-before-moving-on · Always-convenient · ALWAYS mint small canon eblet
- §3 Sonnet 4.6 verbatim
- §4 Absolute paths · PowerShell `;` not `&&` · NEVER touch `.claude/state/secrets/`
- §10 ISO-8601 UTC timestamp every artifact · Accuracy > Speed
- §12 Knight is the deployer · this yoke goes Knight-direct (not via Founder relay)
- BP076 Founder direct: full absolute path every file reference

---

## §6 — Canon eblet to mint at I9.5 close

`canon_half_shipped_release_disk_ahead_of_deploy_bishop_section14_catch_bp087.eblet.md`
- **Why:** v0.5.8 commit in main + binary on disk + `latest.yml` not actually deployed = silent regression that re-installs the broken build on next auto-update. Bishop must gadget-verify the LIVE manifest URL on every Knight "shipped" return.
- **How to apply:** every Knight release-complete return triggers a Bishop curl of `latest.yml` on every domain. Match `version:` field to claim verbatim. Mismatch = Bishop §14 catch; redeploy before signaling peers.

---

— Bishop · BP087 · 🌊⚓ · *Always convenient. Fix as we go. Build for the long haul.*
