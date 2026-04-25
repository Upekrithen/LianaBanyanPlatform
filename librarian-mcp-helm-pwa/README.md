# Helm PWA — V0 Skeleton

**K484 · B123 · Liana Banyan Corporation**

Local shell that all of LB lives in — starting as the shell that Librarian lives in.

> *"We hand them the reins of our very fast horse."*

---

## What Helm is

A local desktop application (Electron) that:

1. **Runs Librarian as a background daemon** — the `librarian-mcp-public` SSE server, always available, point your AI tool at `http://localhost:7711/sse`
2. **Ships minimal by default** — one thing on first launch: Librarian is running
3. **Opts in to modules** — each LB capability (Member Cathedral, Miner, Sculptor, etc.) is a module; off by default; user enables what they want
4. **Works in both Electron and browser** — same web UI codebase installs as a PWA in any browser (daemon supervision requires Electron; read-only UI works everywhere)

---

## Quick start (dev mode)

```powershell
# Prerequisites: Node 22+, Python 3.11+ with librarian-mcp installed
cd librarian-mcp-helm-pwa
npm install --legacy-peer-deps

# Desktop (Electron):
npm run dev

# Web only (browser PWA, no daemon):
npm run dev:web

# Production build:
npm run build
npx electron .
```

---

## Architecture

```
librarian-mcp-helm-pwa/
├── src/
│   ├── main/index.ts        # Electron main process — window + daemon supervisor
│   ├── preload/index.ts     # contextBridge API (window.helm.*)
│   └── renderer/            # React web app (works in Electron AND browser)
│       ├── src/
│       │   ├── App.tsx      # Root: sidebar nav + view routing
│       │   ├── components/  # StatusBar, HomeView, SettingsPanel, ModulesView
│       │   └── modules/     # Module registry + placeholder modules
│       └── index.html
├── daemon_wrapper.py        # Python: starts librarian-mcp SSE on configurable port
└── electron.vite.config.ts # electron-vite build config
```

### Process model

```
Electron shell (Node.js / main process)
  │
  ├── BrowserWindow (renderer) — React UI
  │     window.helm.* ← contextBridge → ipcMain handlers
  │
  └── ChildProcess — daemon_wrapper.py
        ├── librarian_mcp.server (FastMCP SSE)
        └── uvicorn on http://127.0.0.1:<port>
              GET  /sse        ← AI tool MCP connection
              POST /messages/  ← MCP messages
              GET  /mcp        ← streamable-http
```

### Supervision loop

- Daemon spawned on app start (800ms delay for window readiness)
- Crash → auto-restart after 5s
- Shell exit → SIGTERM to daemon → clean shutdown
- Restart count tracked and displayed in status bar

---

## Settings (persisted to `%APPDATA%/helm-pwa/helm-settings.json`)

| Setting | Default | Description |
|---------|---------|-------------|
| `cathedralDir` | `~/.librarian/` | Path to local Cathedral directory |
| `port` | `7711` | Librarian SSE server port |
| `pythonPath` | auto | Python executable (defaults to venv Python) |
| `startAtLogin` | `false` | Register Helm in Windows startup |
| `modules` | `{}` | Per-module enabled state |

---

## Module framework

See `MODULE_API.md` for the full registration spec.

V0 ships one built-in module: `member-cathedral-preview` (disabled by default). Enable it in the Modules panel to verify the framework works. The module shows a roadmap placeholder for K486+.

---

## Endpoints (when daemon is running)

| Endpoint | Transport | Use |
|----------|-----------|-----|
| `http://localhost:7711/sse` | SSE | AI tool MCP connection (Claude Desktop, Cursor, Cline) |
| `http://localhost:7711/messages/` | HTTP POST | MCP message submission |
| `http://localhost:7711/mcp` | streamable-HTTP | Alternative MCP transport |

---

## Roadmap

| Session | Feature |
|---------|---------|
| K485 | Comet Chrome extension → connects to daemon |
| K486 | Miner module — runs corpus mining on schedule |
| K487 | Sculptor module — filters bedrock per cathedral-profile |
| K488 | Member Cathedral panels, Pledge tools, Assignments Bank |
| K500+ | Mobile (Capacitor wrapper around same React web UI) |

---

## Mobile path (forward note)

The React renderer was built to work standalone in a browser. This makes it Capacitor-wrappable for iOS/Android at K500+ without rework. The `isElectron` flag gates all daemon-specific UI; in browser/Capacitor mode the UI degrades gracefully to read-only.

---

## Tech stack rationale (Electron over Tauri)

Chose Electron because:
1. Founder expressed preference for Electron by name
2. Mature Windows ecosystem — more examples, more supervisor patterns documented, fewer setup steps
3. No Rust toolchain required (Tauri requires Rust; Windows Rust setup adds wall-time risk for V0)
4. `child_process` supervision is well-tested in Node/Electron; equivalent in Tauri requires custom Rust IPC
5. Discord/Slack/Notion use Electron: proven at scale

Trade-off accepted: Electron ships a full Chromium runtime (~120MB install). For V0 skeleton this is fine. Tauri remains an option at K500+ if bundle size becomes a user concern.
