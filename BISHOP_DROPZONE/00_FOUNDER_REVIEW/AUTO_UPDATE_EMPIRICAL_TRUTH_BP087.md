# AUTO-UPDATE EMPIRICAL TRUTH · BP087 · SEG-AAA · 2026-06-20

VERDICT: CASE B (partially automatic -- notification is automatic, but download requires one user click)

---

## What the code actually does

Source file: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\auto_updater.ts

Line 37: `private static readonly PERIODIC_CHECK_MS = 4 * 60 * 60 * 1000;` (4-hour poll interval)
Line 39: `private static readonly INITIAL_DELAY_MS = 30_000;` (30-second startup delay)
Lines 204-213: On every packaged app startup, a 30-second timer fires checkForUpdates(), then a 4-hour setInterval keeps polling forever while the app is running.
Line 138: `autoUpdater.autoDownload = false;` -- THIS IS THE CRITICAL LINE.

autoDownload is explicitly set to false. The comment block (lines 130-137) explains why: the binary is not code-signed, so silent auto-download would be a malware vector. The code will DETECT v0.5.13 automatically every 4 hours and fire a system notification ("MnemosyneC Update Available -- v0.5.13 is ready -- open MnemosyneC to download"). The user must then open the app and click one "Download" button. After download, autoInstallOnAppQuit = true (line 139), so the install lands on the next quit -- no second click needed.

---

## What is on the live download server right now

URL: https://mnemosynec.ai/download/latest.yml
HTTP 200 -- reachable -- 360 bytes
Current advertised version: 0.5.10 (as of 2026-06-20)
File: MnemosyneC-Setup-0.5.10.exe
Release date: 2026-06-18T00:00:00.000Z

v0.5.12 is NOT yet on the server. v0.5.13 is NOT yet on the server. The server is one full release behind what Knight has been building.

---

## The package.json publish block (lines 185-189)

```
"publish": {
  "provider": "generic",
  "url": "https://mnemosynec.ai/download/",
  "channel": "latest"
}
```

electron-updater reads the baked-in app-update.yml from the asar (set at build time). No runtime setFeedURL. Single source of truth is package.json build.publish.url.

---

## What this means for Founder

Knight's statement ("v0.5.13 can be installed on all the Machines") implied a fully manual round. That framing was incomplete but not wrong about the outcome.

Here is the precise breakdown:

WHAT IS AUTOMATIC: Once Knight deploys a new version to https://mnemosynec.ai/download/ (uploads the .exe, .exe.blockmap, and latest.yml), every peer running the app will detect the update within 4 hours of their last check (or 30 seconds after next launch). A system notification fires automatically. No user action needed to learn the update exists.

WHAT REQUIRES ONE CLICK: The actual download. Each peer must open the MnemosyneC app and click the Download button once. The install then applies on next quit automatically (autoInstallOnAppQuit = true).

WHAT IS NOT NEEDED: Running the Setup .exe installer by hand. The in-app updater handles the full download-and-replace cycle. No installer file needs to be distributed or run manually by peers.

CURRENT BLOCKER: latest.yml is on v0.5.10. Knight must publish v0.5.12 (and then v0.5.13) to https://mnemosynec.ai/download/ before the updater mechanism can deliver anything.

---

## Paste-ready note for Knight

Knight -- here is the empirical state of the auto-updater so your next yoke is precise:

v0.5.12 (and v0.5.13 built tonight) has a fully wired electron-updater with 4-hour polling. The mechanism works as follows:

1. App checks https://mnemosynec.ai/download/latest.yml every 4 hours (and 30 seconds after each launch).
2. When it sees a newer version it fires a system notification automatically. Zero user action required for detection.
3. The user must click ONE button ("Download") inside the app to pull the new binary. This is intentional -- autoDownload = false because the binary is not code-signed (see auto_updater.ts lines 130-138 for the safety rationale).
4. After download, the update installs on next quit automatically.

CURRENT SERVER STATE: latest.yml at https://mnemosynec.ai/download/latest.yml is on v0.5.10. You must publish v0.5.12 (and then v0.5.13) to the server. Use `npm run publish:win` (package.json line 26) which runs electron-builder --win --publish always. That uploads the .exe, .exe.blockmap, and latest.yml to the generic provider URL.

After you publish, peers do NOT need to run the Setup installer by hand. They will receive a notification within 4 hours (or on next app launch) and click Download. Framing in future yokes should say "deploy to server + one-click for each peer" rather than "manual install on all machines."

NEXT STEP FOR FULL AUTO-SILENT (no user click at all): Requires code signing (EV cert) + signed manifest. Not yet done. See auto_updater.ts lines 130-137 for the unlock conditions.

---

## Source citations (line numbers)

auto_updater.ts:5 -- startup flow comment ("App start -\> 30s delay -\> checkForUpdates()")
auto_updater.ts:14 -- `import { autoUpdater } from 'electron-updater'` (confirms electron-updater is wired)
auto_updater.ts:32-33 -- checkTimer + periodicTimer declared
auto_updater.ts:37 -- PERIODIC_CHECK_MS = 4 hours
auto_updater.ts:39 -- INITIAL_DELAY_MS = 30 seconds
auto_updater.ts:138 -- `autoUpdater.autoDownload = false` (critical constraint)
auto_updater.ts:139 -- `autoUpdater.autoInstallOnAppQuit = true`
auto_updater.ts:204-213 -- _scheduleInitialCheck() wires the 30s-then-4h timer
package.json:54 -- `"electron-updater": "^6.1.7"` (in dependencies, not devDependencies)
package.json:185-189 -- publish block: provider generic, url https://mnemosynec.ai/download/

---

SEG-AAA · Sonnet 4.6 · BP087 · READ-ONLY investigation · no code changes made
