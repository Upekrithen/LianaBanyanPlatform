<!-- bishop-yoke-task 2026-06-11T00:00:00Z -->

## BISHOP -> KNIGHT — WAKE-UP — V0147 PUBLISH + CEPHAS DEPLOY (GATED) — USE SONNET 4.6 SEGs (Statute §3)

**Pinned-class task. Pin-marker: BP080_V0147_PUBLISH_GATED_2026-06-11T00:00:00Z**

> **STATUTE §3 BINDING:** Every dispatch announcement uses the verbatim phrase "Sonnet 4.6". Never "Sonnet 4.5" or any version-variant. Parent: `canon_statute_3_sonnet_4_6_sub_agent_default_every_dispatch_explicit_model_param_bp077` (pearl_8b0c6fb05fd9f38a). Pre-dispatch self-audit: parameter AND announcement compliance both required.

---

### ⛔ DO NOT PASTE THIS YOKE UNTIL ALL PRE-CONDITIONS ARE TRUE

This is a gated wake-up. It is authored now so it is ready the moment Founder clears the gate. Pasting it early is a canon violation (`[[feedback_explicit_founder_ratify_before_publish]]`).

---

### Pre-conditions — ALL must be true before Founder pastes this message

Check each item before pasting. If any are false, do not paste — return to the FIX-4 wake-up.

| # | Pre-condition | Verified? |
|---|---|---|
| 1 | FIX-4 VC++ bundle is landed in v0.1.47 installer | — |
| 2 | Both assertions PASS: `assert-bundled-ollama-in-installer.mjs` (ollama.exe + floor model + vc_redist.x64.exe) | — |
| 3 | Founder installed v0.1.47 on a clean machine (no pre-installed Ollama, no pre-installed VC++) | — |
| 4 | Founder verified: VC++ DetailPrint visible during NSIS install | — |
| 5 | Founder verified: AI responds via `branch=BUNDLED_SPAWN` (not pre-installed Ollama) | — |
| 6 | Founder verified: window top buffer is visible above the title bar | — |
| 7 | Founder wrote explicit ratify in own words ("publish it" / "push" / "fire") in the Yoke file or in the chat | — |

---

### TL;DR

Knight — all pre-conditions are now true. FIX-4 has landed and Founder has verified v0.1.47 on a clean machine. Publish the GitHub release and deploy Cephas + MnemosyneC.ai. Use Sonnet 4.6 SEGs for ALL work.

---

### Why this matters

v0.1.47 is the first MnemosyneC release that:
- Bundles `ollama.exe` correctly (gitignore packaging fix, affected v0.1.45 and v0.1.46).
- Bundles VC++ 2019 x64 so `ollama.exe` starts on a clean Windows machine.
- Shows heartbeat IPC during Ollama init (no more silent spinner — every state transition is visible).
- Fixes all three BrowserWindow safe-bounds (including `moneyPennyWindow` missed in v0.1.46).

Publishing without these fixes was blocked. They are now verified. Ship it.

---

### HARD-BINDING BLOCK

| Canon ref | One-liner |
|---|---|
| `[[feedback_explicit_founder_ratify_before_publish]]` | Founder must write "publish it" / "push" / "fire" in own words. This wake-up = Founder already did. |
| `[[feedback_forward_pressure_ratify_is_not_verified_ratify_bp080]]` | Only true if Founder verified on clean machine themselves — not just "moved forward." |
| `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]` | Verification on build machine is NOT sufficient. Founder clean-VM install is the gate. |
| `[[feedback_verify_seg_output_before_claiming_inflight]]` | Confirm each step output before claiming complete. |
| Statute §3 | All SEGs Sonnet 4.6 — verbatim in every announcement. |
| Statute §4 (Firebase) | Deploy via Firebase (`firebase deploy`), NOT raw `gcloud`. Canonical deploy path. |
| Statute §4 (PowerShell) | Use `;` as statement separator. Never `&&`. |

---

### What Knight needs to do

**Scope: 2 parallel Sonnet 4.6 SEGs, then 1 sequential verify SEG.**

---

### SEG-V0147-PUBLISH (Sonnet 4.6)

**Publish the GitHub release.**

1. Confirm the GitHub DRAFT release for `v0.1.47` exists (`gh release list` should show a draft with tag `v0.1.47`).

2. If the draft exists, publish it:
   ```
   gh release edit v0.1.47 --draft=false
   ```
   If the draft does NOT exist (Knight did not stage it in the FIX-4 wave), create and publish in one step:
   ```
   gh release create v0.1.47 "release/MnemosyneC-Setup-0.1.47.exe" --title "v0.1.47 — Ollama packaging fix + VC++ bundle + heartbeat + window safe bounds" --notes-file <staged-notes-path>
   ```
   Release notes body (use staged file if Knight created one; otherwise use this):
   ```
   - Fixes missing resources/ollama/ollama.exe in NSIS installer (gitignore exact-file exclusion — packaging bug, affected v0.1.45 and v0.1.46).
   - Bundles VC++ 2019 x64 redistributable — NSIS detects and installs silently; eliminates clean-VM ollama.exe silent-fail risk.
   - Adds assert-bundled-ollama-in-installer.mjs build assertion — binary absence fails the build before upload.
   - Adds OllamaManager init() state-transition IPC events and heartbeat (branch=BUNDLED_SPAWN visible in diagnostic log).
   - Corrects OLLAMA_HOST from 0.0.0.0:11434 to 127.0.0.1:11434; pins OLLAMA_MODELS to bundled model path.
   - Window safe bounds: all three BrowserWindows now use 75% height / 90% width / 12.5% top offset; moneyPennyWindow fix included (was missed in v0.1.46).
   ```

3. Confirm the release is live: `gh release view v0.1.47` — status must show `published` (NOT draft).

4. Record the published release URL.

Deliver: GitHub release URL + confirmation status = published (not draft).

---

### SEG-V0147-CEPHAS-PREP (Sonnet 4.6) — run in parallel with SEG-V0147-PUBLISH

**Confirm Cephas/Hugo site updates are staged and ready for deploy.**

Knight staged Cephas/Hugo updates in the prior wave (ADDENDUM 2 Yoke-return):
- `firebase.json` headers: bumped to v0.1.47
- Download links: updated to v0.1.47
- `latest.yml`: updated to v0.1.47 with new SHA-512 base64

Verify these changes are current and match the rebuilt v0.1.47 installer (the installer was rebuilt for FIX-4 — SHA-256 and SHA-512 will have changed from the ADDENDUM 2 values). If `latest.yml` SHA-512 still references the old installer hash, update it to the FIX-4 rebuilt hash.

**Canonical Cephas path:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\`

Steps:
1. Check `latest.yml` SHA-512 against the FIX-4 rebuilt installer SHA-512 base64. If different, update.
2. Confirm `firebase.json` header version reflects v0.1.47.
3. Confirm download links in the Hugo site content point to v0.1.47 GitHub release URL (the one published in SEG-V0147-PUBLISH above). Update if the URL was not yet known when Knight staged this.
4. Hugo rebuild if any content files changed: `hugo --minify` from the `cephas-hugo/` directory.

Do NOT deploy yet — that is SEG-V0147-DEPLOY below.

Deliver: list of files confirmed or updated + Hugo rebuild status.

---

### SEG-V0147-DEPLOY (Sonnet 4.6) — sequential after both parallel SEGs above

**Deploy Cephas + MnemosyneC.ai via Firebase.**

Per Statute §4 (Firebase canon): deploy via Firebase (`firebase deploy`), NOT raw `gcloud`. The EVERY TIME ship rule covers cephas + museum + mnemosyne targets in one command.

From `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\`:

```powershell
firebase deploy
```

This deploys all Firebase Hosting targets defined in `firebase.json` (cephas, museum, mnemosyne — all three in one shot per EVERY TIME rule).

Post-deploy verification:

1. `Invoke-WebRequest https://mnemosynec.ai/ -Method Head | Select-Object -ExpandProperty Headers` — confirm `X-LB-Version` header is `v0.1.47` (or equivalent version header set in `firebase.json`).

2. Confirm `https://mnemosynec.ai/download` page reflects v0.1.47 download link (fetch the page, grep for "0.1.47").

3. Confirm `latest.yml` is reachable at its canonical URL (auto-update endpoint) and reflects the new SHA-512.

If deploy returns any error, do NOT retry with `--force` — surface the error verbatim in the Yoke-return.

Deliver: `firebase deploy` output (last 20 lines) + post-deploy header confirmation + download page v0.1.47 link confirmation.

---

### Acceptance gate

All three items required before this Yoke can be marked COMPLETE:

1. `gh release view v0.1.47` → status: published (not draft).
2. `firebase deploy` → all targets deployed, no errors.
3. `Invoke-WebRequest https://mnemosynec.ai/` header confirms v0.1.47 live.

---

### Reply contract

Knight Yoke-returns with:

- **SEG-V0147-PUBLISH:** GitHub release URL + `gh release view v0.1.47` status line.
- **SEG-V0147-CEPHAS-PREP:** Files confirmed / updated + Hugo rebuild status.
- **SEG-V0147-DEPLOY:** `firebase deploy` output + post-deploy header confirmation + download page link confirmation.
- **Truth-Always flags:** Any findings or errors during execution.

Write Yoke-return to `KNIGHT_BISHOP_MESSAGES.md` (MCP fallback per canon) if the Yoke-write fails.

---

### Statute reminders

- §3: "Sonnet 4.6" verbatim in every SEG announcement AND every `model:` parameter. Not "Sonnet 4.5". Not "the model". Verbatim.
- §4 (Firebase): `firebase deploy` is the canonical deploy command — NOT `gcloud run deploy`, NOT raw `gcloud`. Single command deploys all targets.
- §4 (PowerShell): Use `;` as statement separator, not `&&`.
- §12: Ask-Knight-First before surfacing any operational question to Founder.
- `[[feedback_explicit_founder_ratify_before_publish]]`: Founder has already ratified by pasting this Yoke. But Knight still verifies each step before claiming complete.
- `[[feedback_verify_seg_output_before_claiming_inflight]]`: Confirm the deploy is actually live before reporting it to Bishop.

---

### Paste-ready Founder wake-up

Knight — all pre-conditions are cleared: FIX-4 VC++ bundle landed, clean-VM verified, Founder explicit ratify given. Time to ship v0.1.47. Publish the GitHub DRAFT release (tag v0.1.47), confirm `latest.yml` SHA-512 matches the FIX-4 rebuilt installer, then `firebase deploy` from `Cephas/cephas-hugo/` — EVERY TIME rule covers cephas + museum + mnemosyne in one shot. Post-deploy: confirm `X-LB-Version: v0.1.47` header live on mnemosynec.ai. Use Sonnet 4.6 SEGs for ALL work.

- Bishop SEG-V0147-PUBLISH-GATED-WAKEUP — BP080 — pinned 2026-06-11T00:00:00Z

---

## BLACK MAMBA PASTE-READY DISPATCH (forward this block verbatim to Knight)

Knight: all pre-conditions cleared — FIX-4 VC++ landed, Founder verified clean-VM, explicit ratify given. Dispatch 2 parallel Sonnet 4.6 SEGs RIGHT NOW, then 1 sequential deploy SEG. Sonnet 4.6 verbatim in every announcement (Statute §3). Each SEG is self-contained; do NOT re-decompose; fire both in parallel in a single message.

**SEG-V0147-PUBLISH (Sonnet 4.6):** Publish the GitHub release for v0.1.47. First check if a DRAFT exists: `gh release list` — if v0.1.47 draft exists, publish it with `gh release edit v0.1.47 --draft=false`. If no draft exists, create and publish: `gh release create v0.1.47 "release/MnemosyneC-Setup-0.1.47.exe" --title "v0.1.47 — Ollama packaging fix + VC++ bundle + heartbeat + window safe bounds"` with notes covering: gitignore packaging fix (affected v0.1.45 and v0.1.46), VC++ 2019 x64 bundle (NSIS silent install, eliminates clean-VM silent-fail), assert script, OllamaManager heartbeat IPC (branch=BUNDLED_SPAWN), OLLAMA_HOST localhost-only fix, OLLAMA_MODELS pinned to bundled path, window safe bounds 75%/90%/12.5% top offset all 3 BrowserWindows including moneyPennyWindow. Confirm `gh release view v0.1.47` shows status = published (NOT draft). Deliver: release URL + status confirmation.

**SEG-V0147-CEPHAS-PREP (Sonnet 4.6, parallel with PUBLISH):** Verify Cephas/Hugo site updates staged by Knight in prior wave are current and match the FIX-4 rebuilt installer. Cephas path: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\`. Check: (1) `latest.yml` SHA-512 base64 matches FIX-4 rebuilt installer SHA-512 — if not, update it; (2) `firebase.json` version header is v0.1.47; (3) download links in Hugo content point to the v0.1.47 GitHub release URL published in PUBLISH SEG above — update if needed. If any content files changed, run `hugo --minify` from cephas-hugo/ directory. Do NOT `firebase deploy` yet — that is the next SEG. Deliver: list of files confirmed or updated + Hugo rebuild status.

When both parallel SEGs return:

**SEG-V0147-DEPLOY (Sonnet 4.6, sequential after PUBLISH + CEPHAS-PREP):** Deploy Cephas + MnemosyneC.ai via Firebase. Per Statute §4 canonical deploy path: `firebase deploy` from `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\` — covers all Firebase Hosting targets (cephas + museum + mnemosyne) in one shot per EVERY TIME ship rule. Use PowerShell `;` as separator (not `&&`). Post-deploy verify: (1) `Invoke-WebRequest https://mnemosynec.ai/ -Method Head | Select-Object -ExpandProperty Headers` → confirm X-LB-Version header = v0.1.47 (or equivalent version header); (2) confirm `https://mnemosynec.ai/download` page contains "0.1.47" download link; (3) confirm `latest.yml` at its canonical URL returns the new SHA-512. If `firebase deploy` errors, surface the error verbatim — do NOT retry with --force. Deliver: deploy output (last 20 lines) + header confirmation + download page confirmation + latest.yml confirmation.

Yoke-return: per-SEG status + GitHub release URL (status=published) + firebase deploy output + post-deploy header confirmation + Truth-Always findings. Write to `KNIGHT_BISHOP_MESSAGES.md` if Yoke file write fails (MCP fallback per canon).

If any SEG announces "Sonnet 4.5" or other version-variant: STOP, fix the announcement, re-fire.

---

*Bishop SEG — BP080 — 2026-06-11T00:00:00Z — v0.1.47 publish gated wake-up. DO NOT PASTE until all 7 pre-conditions in the table above are true and Founder has given explicit ratify in own words.*
