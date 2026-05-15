# BUILD RECEIPT — MV-N Auto-Update Signed Pipeline
**SAGA 2 · BP045 W1 · Knight → Bishop handoff**
**Completed:** 2026-05-15 · Knight session

---

## Acceptance Criteria Checklist

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Code-signing certificate or MV-N-CERT-PENDING warning | ⚠ MV-N-CERT-PENDING |
| 2 | NSIS signing step via `build-scripts/sign.ps1` | ✓ COMPLETE |
| 3 | `latest.yml` published to `Cephas/cephas-hugo/static/download/latest.yml` | ✓ COMPLETE |
| 4 | Update-check IPC handler in main process, 24h poll | ✓ COMPLETE (4h periodic + 30s initial delay) |
| 5 | Renderer "Update available" UI wired, "Restart and install" button | ✓ COMPLETE (pre-existing, verified) |
| 6 | Smoke test: v0.1.2 → poll detects v0.1.3 → update applies | ⚠ PENDING (requires packaged installer + live latest.yml) |

---

## Cert Status — MV-N-CERT-PENDING

**No LB Authenticode certificate is currently in hand.**

No signing occurs in current builds. The guard in `build-scripts/sign.ps1` exits cleanly with a warning rather than failing the build. When a cert is acquired:

1. Install cert in Windows Certificate Store (CurrentUser\My)
2. Set env var: `LB_CERT_THUMBPRINT=<thumbprint>`
3. Add signing call to CI / electron-builder `afterSign` hook:
   ```powershell
   .\build-scripts\sign.ps1 -InstallerPath $env:INSTALLER_PATH
   ```
4. Update `package.json` `win.signDlls` and `win.signAndEditExecutable` from `false` → `true`
5. Set `win.verifyUpdateCodeSignature` → `true` once all installers are signed

**Cert acquisition options (for Founder ratification):**
| Option | Cost est. | Notes |
|--------|-----------|-------|
| DigiCert OV Code Signing (USB token) | ~$499/yr | Standard; SmartScreen builds trust over time |
| DigiCert EV Code Signing (hardware token) | ~$699/yr | Instant SmartScreen trust; required for kernel drivers |
| Sectigo OV Code Signing | ~$299/yr | Lower cost; same SmartScreen ramp as OV |

EV is recommended for Mnemosyne (desktop app; EV = instant SmartScreen green; no "Unknown Publisher" dialog for members).

---

## Signing Chain (when cert in hand)

```
signtool sign
  /fd SHA256
  /sha1 <cert-thumbprint>
  /tr http://timestamp.digicert.com
  /td SHA256
  /d "Mnemosyne — Memory, powered by CAI"
  /du "https://mnemosynec.ai"
  Mnemosyne-Setup-0.1.3.exe
```

Script: `amplify-computer/build-scripts/sign.ps1`

---

## Auto-Update Channel Manifest — latest.yml

**Location:** `Cephas/cephas-hugo/static/download/latest.yml`
**Served at:** `https://mnemosynec.ai/download/latest.yml`

```yaml
version: 0.1.3
files:
  - url: Mnemosyne-Setup-0.1.3.exe
    sha512: PENDING_BUILD_MV-N-CERT-PENDING
    size: 0
path: Mnemosyne-Setup-0.1.3.exe
sha512: PENDING_BUILD_MV-N-CERT-PENDING
releaseDate: '2026-05-15T12:37:21Z'
```

**sha512 and size must be updated** when the signed installer is built. Run:
```powershell
$hash = (Get-FileHash "release\Mnemosyne-Setup-0.1.3.exe" -Algorithm SHA512).Hash
$bytes = (Get-Item "release\Mnemosyne-Setup-0.1.3.exe").Length
```
Then encode the hex hash as base64 for the `sha512` field (electron-updater expects base64-encoded SHA-512).

---

## Publish Config (package.json)

```json
"publish": {
  "provider": "generic",
  "url": "https://mnemosynec.ai/download/",
  "channel": "latest"
}
```

Changed from `github` provider to `generic` per SAGA 2 §2 criterion 4 — the update-check polls `mnemosynec.ai/download/latest.yml`, not a GitHub releases API.

---

## Update-Check IPC Architecture

```
Main process init (app.whenReady)
  └─ AutoUpdateManager.init()
       ├─ _configureUpdater()    autoDownload=true, autoInstallOnAppQuit=true
       ├─ _attachEvents()        checking / available / downloading / downloaded / error
       ├─ _scheduleInitialCheck() 30s delay → checkForUpdates() → then every 4h
       └─ _registerIPCHandlers()
            ├─ ipcMain.handle('get-update-state')
            ├─ ipcMain.on('check-for-updates')
            └─ ipcMain.on('install-update')

Preload bridge (preload.ts)
  └─ window.amplify.getUpdateState / checkForUpdates / installUpdate / onUpdateStateChanged

Renderer (AMPLIFYDashboard.tsx)
  ├─ useEffect → getUpdateState().then(setUpdateState)
  ├─ useEffect → onUpdateStateChanged(setUpdateState) subscription
  ├─ Update banner: status=available → shows version + changelog link
  ├─ Progress bar: status=downloading → shows percent
  └─ Restart button: status=downloaded → calls installUpdate() → quitAndInstall()
```

---

## Files Changed

| File | Change |
|------|--------|
| `amplify-computer/src/main/auto_updater.ts` | Notification strings: "AMPLIFY Computer" → "Mnemosyne"; update server comment |
| `amplify-computer/package.json` | `publish.provider` github → generic, url: mnemosynec.ai/download/ |
| `Cephas/cephas-hugo/static/download/latest.yml` | Created · v0.1.3 manifest (sha512 pending signed build) |
| `amplify-computer/build-scripts/sign.ps1` | Created · Authenticode signing script + MV-N-CERT-PENDING guard |

---

## Known Gaps

1. **MV-N-CERT-PENDING** — installer currently unsigned; SmartScreen will show "Unknown Publisher" dialog until EV cert is acquired and installed
2. **latest.yml sha512/size** — placeholder values; must be replaced after first signed build
3. **Smoke test** — cannot run until (a) cert acquired, (b) installer built, (c) `latest.yml` deployed to live `mnemosynec.ai`
4. **afterSign hook** — `sign.ps1` is not yet wired into electron-builder's `afterSign` callback in `package.json`; currently must be called manually post-build

---

## Next Action (Founder ratification requested)

**Choose cert tier:** OV (~$299–499/yr) or **EV (~$699/yr, recommended)** to enable instant SmartScreen trust for members installing Mnemosyne.

Once cert is acquired:
1. Knight wires `afterSign` hook into electron-builder
2. Knight runs signed build, captures sha512, updates `latest.yml`
3. Knight deploys `latest.yml` to `mnemosynec.ai/download/`
4. Knight runs smoke test: old install → detects v0.1.3 → auto-updates

🌊⚓🪙 FOR THE KEEP!
