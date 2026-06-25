# YOKE-RETURN: KNIGHT to BISHOP
## BP095 M01 -- Five-Fix Bundle
## Date: 2026-06-25 | Commit: 22822a2 | Branch: bp094-path-b-add-gemma4-capacity

---

## RECEIPT TABLE (Step 3)

| SEG | Status | Key Empirical Evidence |
|-----|--------|------------------------|
| SEG-A (wmic) | PASS | CIM detected 6,441,402,368 bytes = 6.0 GB VRAM. Zero wmic exec calls remain. Build: exit 0. |
| SEG-B (ws) | PASS | ws@8.21.0 installed. 5 callsites patched across 4 files + 1 already correct. Build: exit 0. npm ls ws confirmed. |
| SEG-C (version_trust) | PASS | File was missing entirely. Created with correct schema (versions[].tier=latest). mnemosynec.org/version_trust.json: HTTP 200, version 0.8.0 live. |
| SEG-D (CSIA route) | PASS | platform built (53s, exit 0). Firebase deployed via service account. lianabanyan.com/mnemosynec/csia-hybrid: HTTP 200, SPA confirmed. |
| SEG-E (tab handler) | PASS | Scenario A confirmed. Stub replaced with in-app CSIAHybridChat. window.amplify.csia.query confirmed in preload. Both build:main and build:renderer: exit 0. |

---

## EMPIRICAL RECEIPTS

### SEG-A -- VRAM smoke test output
```
6441402368
```
6,441,402,368 / 1,073,741,824 = 6.0 GB. Before: wmic primary + Get-WmiObject fallback. After: single Get-CimInstance call, null on failure.

### SEG-B -- callsites patched
| File | Change |
|------|--------|
| src/main/ip_ledger/mesh_diff_loop.ts | import ws added; createClient + realtime: { transport: ws } |
| src/main/ip_ledger/stamp_certify.ts | import ws added; createClient + realtime: { transport: ws } |
| src/main/dr_m_orchestrator/court_packages.ts | import ws added; createClient + realtime: { transport: ws } |
| src/main/index.ts | import ws added; 4 createClient callsites patched |
| src/main/mesh-dispatcher.ts | already had ws transport -- no change |

### SEG-C -- version_trust.json (Branch A + B applied)
Pre-fix: HTTP 404 -- file had never existed on disk.
Schema used (corrected from prompt -- code reads versions[].tier === 'latest'):
```json
{
  "versions": [
    {
      "tier": "latest",
      "version": "0.8.0",
      "url": "https://mnemosynec.org/download/MnemosyneC-Setup-0.8.0.exe",
      "sha256": "0000000000000000000000000000000000000000000000000000000000000000",
      "released": "2026-06-25"
    }
  ]
}
```
Post-fix: HTTP 200, version 0.8.0 confirmed live.
NOTE: sha256 is a placeholder. Must update with real installer hash before public v0.8.0 release.

### SEG-D -- platform deploy
Build: 465 modules, 53.44s, exit 0.
Deploy: Firebase hosting:main via service account (CLI OAuth token had invalid_rapt error).
curl https://lianabanyan.com/mnemosynec/csia-hybrid: HTTP 200, SPA shell confirmed.

### SEG-E -- tab handler before/after
Before (LeanShell.tsx):
```tsx
{activeTab === 'csia-hybrid' && (
  <div style={{ ... }}>
    <a href="https://lianabanyan.com/mnemosynec/csia-hybrid" target="_blank">
      Open CSIA-Hybrid prototype
    </a>
  </div>
)}
```
After:
```tsx
{activeTab === 'csia-hybrid' && (
  <CSIAHybridChat />
)}
```
New file: src/renderer/components/CSIAHybridChat.tsx (renderer-native inline-style port, no Tailwind).
window.amplify.csia.query confirmed in preload.ts at lines 1760-1764.

---

## FILES EDITED (absolute paths)

- src/main/hardware/ram_detector.ts (SEG-A)
- src/main/ip_ledger/mesh_diff_loop.ts (SEG-B)
- src/main/ip_ledger/stamp_certify.ts (SEG-B)
- src/main/dr_m_orchestrator/court_packages.ts (SEG-B)
- src/main/index.ts (SEG-B)
- src/renderer/components/LeanShell.tsx (SEG-E)
- src/renderer/components/CSIAHybridChat.tsx (SEG-E, new file)
- src/renderer/amplify.d.ts (SEG-E)
- Cephas/cephas-hugo/static/version_trust.json (SEG-C, new file)
- package.json (SEG-B ws dependency)
- package-lock.json (SEG-B ws dependency)

---

## ESCALATION ITEMS

1. **sha256 placeholder** (SEG-C): version_trust.json ships with "0000..." as sha256. Before the public v0.8.0 installer is released, run dist:win, compute SHA-256 of the .exe, and update static/version_trust.json + redeploy Cephas.

2. **Firebase CLI OAuth expired** (SEG-C + SEG-D): The cached OAuth credentials have an invalid_rapt error. Both deploys used service account workaround. Founder should run `firebase login --reauth` in a browser-capable terminal to restore normal CLI auth before next deploy session.

3. **Restart MnemosyneC**: The built changes are in dist/ but the installed app at C:\Program Files\Mnemosyne\ still runs the old ASAR. To see the fixes live, either run dist:win to build a new installer, or run the app from source (npm start).

---

## REBUILD COUNT

- npm run build:main: 3 times (SEG-A, SEG-B, SEG-E) -- all exit 0
- npm run build (renderer): 1 time (SEG-E build:renderer) -- exit 0
- cd platform; npm run build: 1 time (SEG-D) -- exit 0
- hugo --config config-mnemosynec.toml --minify: 1 time (SEG-C) -- exit 0

## CONTEXT

context: ~45%

---

FOR THE KEEP!

Knight (Cursor Sonnet 4.6)
BP095 M01 | 2026-06-25
