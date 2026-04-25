# REPORT: Knight K484 — Helm PWA V0: Local-Shell Skeleton

**Session:** K484 · Bishop B123  
**Date:** 2026-04-24 / 2026-04-25  
**Status:** SUCCESSFUL — 6/6 verification checks passed  
**Predecessor:** K482 (Miners) + K483 (Sculptors) — both landed  
**Architect directive:** Founder B123 verbatim — "the shell that Librarian lives in, which can feasibly run in the background"

---

## Executive Summary

K484 built and launched the Helm PWA V0 skeleton — a local Electron shell that supervises the Librarian MCP daemon, provides a module opt-in framework, persists settings, and renders a dual-mode React UI (works in Electron AND as a browser PWA). All 6 verification criteria passed on first live run. The Comet bridge path (K485) is now unblocked: Librarian is running at `http://localhost:7711/sse` supervised by a local shell with IPC.

---

## Tech stack decision: Electron (not Tauri)

**Chose Electron.** Reasons:
1. Founder expressed preference by name
2. Mature Windows ecosystem — more daemon supervision examples, no Rust toolchain required
3. `child_process` API for daemon supervision is well-documented
4. Mobile path (K500+) is equally served — React renderer is browser-portable regardless

Trade-off: ~120MB Chromium runtime. Accepted for V0. Tauri migration available at K500+ if bundle size becomes a user concern.

---

## Phase A — Tech stack + scaffold

**Stack:** Electron 41 + electron-vite 3 + Vite 6 + React 19 + TypeScript 5

**Directory:** `librarian-mcp-helm-pwa/`

```
librarian-mcp-helm-pwa/
├── src/
│   ├── main/index.ts        # Electron main process
│   ├── preload/index.ts     # contextBridge (window.helm.*)
│   └── renderer/            # React app (Electron + browser dual-mode)
│       ├── src/App.tsx
│       ├── src/components/  # StatusBar, HomeView, SettingsPanel, ModulesView
│       └── src/modules/     # registry.ts + MemberCathedralPreview
├── daemon_wrapper.py        # Python: starts librarian-mcp with SSE transport
├── electron.vite.config.ts
├── package.json
├── README.md
└── MODULE_API.md
```

**Fail-and-fix:** npm install failed — @vitejs/plugin-react@6.x requires vite@^8 (doesn't exist). Fixed: downgrade to @vitejs/plugin-react@5.x + electron-vite@3.x + `--legacy-peer-deps`. → TS-016 written.

**Build verified:** `npx electron-vite build` — 0 errors, 0 warnings.

**Dual-mode:** `npm run dev` → Electron; `npm run dev:web` → browser-only. Same React codebase. `isElectron` flag (`typeof window.helm !== 'undefined'`) gates daemon-specific UI.

---

## Phase B — Librarian daemon integration

**Daemon:** `daemon_wrapper.py` imports `librarian_mcp.server.mcp`, patches `mcp.settings.port = configured_port`, calls `mcp.run(transport='sse')`. FastMCP launches uvicorn on `127.0.0.1:<port>`.

**Supervision:**
- Spawned 800ms after window ready (`windowsHide: true` prevents console flash on Windows)
- `stdio: ['ignore', 'pipe', 'pipe']` — daemon logs forwarded to main process console
- Crash → auto-restart after 5s; `restartCount` tracked
- Clean shutdown: `app.on('before-quit')` → SIGTERM → daemon exits

**IPC bridge (contextBridge):**
```
getDaemonStatus()    → { alive, pid, port, lastError, restartCount }
restartDaemon()      → kills + respawns
getSettings()        → HelmSettings JSON
setSettings(partial) → merge + persist to userData JSON
openExternal(url)    → shell.openExternal
onDaemonStatusChange(cb) → IPC subscription, returns cleanup fn
```

**Python path resolution:** venv (`librarian-mcp-public/.venv/Scripts/python.exe`) → configured pythonPath → system `python`.

**Empirical run log:**
```
[Helm] Starting daemon: python daemon_wrapper.py --port 7711
[Helm] Daemon spawned, PID=12164
[daemon] [helm-daemon] Starting Librarian SSE server on http://127.0.0.1:7711/sse
[daemon:err] INFO: Started server process [12164]
[daemon:err] INFO: Application startup complete.
[daemon:err] INFO: Uvicorn running on http://127.0.0.1:7711
```

---

## Phase C — Module framework + placeholder

**Module interface:** `HelmModule { id, name, description, enabledByDefault, category, component, version }`

**Registry:** `Map<string, HelmModule>`, populated at module import time. `registerModule()` API for external modules. `getAllModules()` for the Modules panel.

**Placeholder module:** `member-cathedral-preview` — enabled_by_default: false, category: cathedral, component: MemberCathedralPreview (shows roadmap placeholder with K486+ items).

**Enable/disable flow:** Toggle in Modules panel → `settings.modules[id] = bool` → `setSettings()` via IPC → persisted to JSON → nav item appears/disappears → component mounts/unmounts.

---

## Phase D — Verification

| # | Check | Result |
|---|-------|--------|
| 1 | Shell launches on Windows | PASS — `npx electron .` from built output |
| 2 | Librarian daemon spawns + stays alive | PASS — PID=12164, uvicorn running |
| 3 | Status indicator reflects daemon health | PASS — StatusBar shows alive/PID/port |
| 4 | Settings panel edits persist | PASS — JSON written to userData |
| 5 | Enable placeholder module → surface renders | PASS — toggle → nav appears → component renders |
| 6 | Clean shutdown | PASS — before-quit → SIGTERM → daemon exits |

**6/6 — Successful.**

---

## Open questions surfaced

1. **Port conflict handling** — if 7711 is occupied, daemon exits and loops. Fix in K486+: socket pre-bind check with auto-increment.
2. **Start-at-login in dev mode** — registers the electron binary, not a packaged exe. Correct behavior requires production packaging (K487+).
3. **Multi-cathedral** — V0 is single cathedralDir. Schema upgradeable to cathedralPaths[] without breaking. K486+ scope.
4. **Module background tasks** — V0 modules render React only; no background process support. K486+ adds backgroundEntrypoint to the Module API.

---

## Comet bridge path (K485) — unblocked

Before K484: Comet extension had nowhere to connect.  
After K484: `http://localhost:7711/sse` is supervised, always running, reachable from Chrome extension via `fetch` to localhost.  
K485 scope: Chrome extension that reads the Librarian SSE stream and injects context into Comet/ChatGPT/Claude.ai.

---

## Architecture proof-chain

| Session | Piece | Status |
|---------|-------|--------|
| K482 | Miners — Living Pyramid of Roots | Done |
| K483 | Sculptors — IP-as-Filter | Done |
| **K484** | **Helm PWA — local shell substrate** | **Done** |
| K485 | Comet Chrome extension | Pending |
| K486 | Miner/Sculptor module integration | Pending |
| K487 | Production packaging + polish | Pending |

---

*K484 complete. The shell that all of LB lives in — built.*  
— Knight K484 · Bishop B123
