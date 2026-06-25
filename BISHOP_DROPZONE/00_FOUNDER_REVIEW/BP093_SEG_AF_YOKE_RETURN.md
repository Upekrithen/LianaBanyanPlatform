YOKE RETURN · BP093 · SEG-AF · v0.7.2 · 2026-06-24
═══════════════════════════════════════════════════════

BUILD
  v0.7.2 .exe size:          540,636,318 bytes (~515.6 MB) ✓ (≥515 MB threshold PASS)
  v0.7.2 SHA256:             13a73af1c4823442ebb7aea68e213c59378c19d9deb281d826aa4342f8722fcf
  Build commit sha:          52a4552 (feat(bp093-phase3): Minor Council receipt per iteration + validate-relay receipt schema)
  Version bump commit sha:   ff1a054 (chore(release): bump to v0.7.2 — BP093 Phase 3 Plow + Minor Council receipt)
  dist:win wall-clock:       ~47 sec (build elapsed_ms: 47169 per build log assert-ollama)
  ELECTRON_TOUCHED:          YES

TASK 1 WIRING VERIFICATION
  Hunk A (councilVotesPerIteration declaration):  PRESENT ✓
  Hunk B (per-iteration push inside council loop): PRESENT ✓
  Hunk C (iterations_run + council_votes_per_iteration in answer_json): PRESENT ✓
  validate-relay.mjs per_peer fields:              PRESENT ✓ (iterations_run + council_votes_per_iteration)

REDISTRIBUTION
  M0 (cb4ef450 · 192.168.86.30):   INSTALLED — app.asar SHA256 matches v0.7.2 release · last_seen: 2026-06-24T14:45:28 UTC
    NOTE: Installer ran silent /S; old MnemosyneC PIDs (2424/57116/70164) had to be killed to unblock it.
          app.asar confirmed matching v0.7.2 by SHA256 comparison.
          FOUNDER ACTION REQUIRED: Launch MnemosyneC on M0 (Start Menu shortcut or Desktop "MnemosyneC").
          Install path: C:\Program Files\Mnemosyne\MnemosyneC\MnemosyneC.exe
  M3 (d0b47bd0 · 192.168.86.156):  SMB FAILED (auth) — GitHub release URL provided · last_seen: 2026-06-24T14:45:24 UTC
          FOUNDER ACTION REQUIRED: Install from https://github.com/Upekrithen/LianaBanyanPlatform/releases/download/v0.7.2/MnemosyneC-Setup-0.7.2.exe
  M2 (88cbf6bd · 192.168.86.45):   SMB FAILED (auth) — GitHub release URL provided · last_seen: 2026-06-24T14:45:34 UTC
          FOUNDER ACTION REQUIRED: Install from https://github.com/Upekrithen/LianaBanyanPlatform/releases/download/v0.7.2/MnemosyneC-Setup-0.7.2.exe
  M1 (c532e740 · 192.168.86.64):   SMB FAILED (auth) — GitHub release URL provided · last_seen: 2026-06-24T14:44:46 UTC
          FOUNDER ACTION REQUIRED: Install from https://github.com/Upekrithen/LianaBanyanPlatform/releases/download/v0.7.2/MnemosyneC-Setup-0.7.2.exe
  MS (49f3e597 · WAN):             GitHub release ACTIVE · PENDING Founder install · last_seen: 2026-06-24T14:45:34 UTC
          FOUNDER ACTION REQUIRED: Install from https://github.com/Upekrithen/LianaBanyanPlatform/releases/download/v0.7.2/MnemosyneC-Setup-0.7.2.exe
  GitHub release v0.7.2:            ACTIVE (not draft) · https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/v0.7.2
  SMB LAN copy succeeded:           NO — all 3 LAN peers failed (auth error: "The user name or password is incorrect")

2Q SMOKE
  session_id:                relay-2026-06-24T14-47-01
  smoke wall-clock:          ~20.2 min (Phase 1: 19.2 min + Phase 2: ~1 min)
  Phase 1 exit code:         0 (validate-relay.mjs 2Q PASSED — ensemble 100% correct: Q01=B ✓, Q02=I ✓)
  Phase 2 exit code:         1 (round_up_sweep Ollama direct timeout, fell back to relay — non-critical)
  iterations_run populated:  0 of 5 peers · FAIL
  council_votes populated:   0 of 5 peers · FAIL
  total route rows (session): 20 (≥10 threshold PASS)
  GATE:                      FAIL → ROOT CAUSE: All 5 peers were running v0.7.1 code during smoke.
                             M0 install had not yet unblocked (old PIDs still running).
                             M1/M2/M3/MS not yet updated.
                             All relay_route_replies.answer_json rows show iterations_run=NULL,
                             council_votes_per_iteration=NULL — confirming old code path.

42Q THUNDERCLAP
  Status: NOT FIRED — 2Q Smoke gate FAIL (iterations_run NULL on all peers)
  Reason: Fleet not yet running v0.7.2. Smoke ran on v0.7.1 code.

═══════════════════════════════════════════════════════
FOUNDER ACTION REQUIRED — DO THESE IN ORDER:
═══════════════════════════════════════════════════════

STEP 1 — Launch MnemosyneC on M0 (this machine):
  Double-click Desktop shortcut "MnemosyneC"
  OR: Start → MnemosyneC
  OR: "C:\Program Files\Mnemosyne\MnemosyneC\MnemosyneC.exe"

STEP 2 — Install v0.7.2 on M1, M2, M3 (LAN machines):
  GitHub release URL: https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/v0.7.2
  Download: MnemosyneC-Setup-0.7.2.exe (SHA256: 13a73af1c4823442ebb7aea68e213c59378c19d9deb281d826aa4342f8722fcf)
  Install on each: run the installer, accept the prompts

STEP 3 — Install v0.7.2 on MS (WAN / external machine):
  Same GitHub release URL as above

STEP 4 — Wait ~5 minutes for all peers to check in and start the Plow loop

STEP 5 — Re-fire 2Q smoke:
  Double-click: C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\FIRE_M13c_SMOKE_2Q.cmd
  OR open native PowerShell and run FIRE_M13c_SMOKE_2Q_V001.ps1

STEP 6 — If 2Q smoke PASSES (iterations_run populated ≥3 of 5 peers):
  Fire 42Q THUNDERCLAP:
  Double-click: C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\FIRE_M13c.cmd

═══════════════════════════════════════════════════════
VERIFICATION GADGET (run after fleet updated + new session running):
═══════════════════════════════════════════════════════

After firing smoke, check via REST API or psql:
  SELECT route_id, peer_id,
         answer_json->>'iterations_run' AS iters,
         answer_json->'council_votes_per_iteration' AS council
  FROM relay_route_replies
  WHERE created_at > NOW() - INTERVAL '15 minutes'
  ORDER BY created_at DESC LIMIT 20;

PASS if: iterations_run NOT NULL for ≥3 of 5 peers per question
         council_votes_per_iteration array populated (not NULL)
         total rows ≥10

═══════════════════════════════════════════════════════
RECEIPTS & ARTIFACTS
═══════════════════════════════════════════════════════
  Smoke receipt:             C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\SMOKE_2Q_BP093_V001\SMOKE_2Q_BP093_V001_RECEIPT_2026-06-24T15-06-15.json
  Build log:                 C:\Users\Administrator\Documents\LianaBanyanPlatform\release\build_0.7.2_bp093.log
  Smoke Phase 1 log:         C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\m13c_smoke_2q_[timestamp].log
  Smoke Phase 2 log:         C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\m13c_smoke_2q_roundup_[timestamp].log
  version_trust.json:        Cephas/cephas-hugo/data/version_trust.json (v0.7.2 latest, v0.7.1 → historical)
  GitHub release:            https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/v0.7.2
