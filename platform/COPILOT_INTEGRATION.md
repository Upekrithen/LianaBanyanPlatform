# Windows Copilot Integration for Mnemosyne

## Research Findings (June 2026)

### What Windows Copilot Is Today

Windows Copilot (Microsoft Copilot in Windows) is a sidebar AI assistant built into Windows 11.
As of 2026, it is powered by Microsoft's cloud services and optionally Copilot Studio for enterprise.

### Can Mnemosyne's Local Memory Feed Into Windows Copilot Directly?

**Short answer: NOT DIRECTLY. No plugin mechanism exists for injecting localhost data.**

#### Detailed Findings

**1. Copilot Studio (formerly Power Virtual Agents)**
- Copilot Studio is a cloud-based platform for building Microsoft 365 Copilot extensions.
- Plugins are cloud connectors (OpenAPI spec or Power Automate flows) that call HTTPS endpoints.
- HTTPS only: Copilot Studio connectors cannot call `http://localhost:*`. They require a
  publicly routable HTTPS URL.
- Authentication: Connectors require OAuth or API key auth via Azure AD - localhost cannot
  participate in this flow.
- **VERDICT: NOT BUILDABLE** for local Mnemosyne data without a cloud relay.

**2. Windows Copilot Sidebar (in-box)**
- As of Windows 11 24H2 / 2025 update, Copilot is a standalone Electron-based app.
- It does not expose an extension/plugin API for third-party apps to inject context.
- There is no Windows Registry key, COM interface, or named pipe that third-party apps can
  use to push context into the Copilot sidebar.
- **VERDICT: NOT BUILDABLE.**

**3. Microsoft 365 Copilot (enterprise)**
- Enterprise M365 Copilot supports Graph Connectors and declarative agents.
- Graph Connectors require Azure tenant, admin consent, and cloud-hosted data.
- Not applicable to a local personal AI assistant.
- **VERDICT: NOT APPLICABLE** for non-enterprise personal use.

---

## Honest Status: NOT YET (direct integration)

Mnemosyne cannot natively push context into Windows Copilot because:
1. Microsoft has not opened a local-app API for the Copilot sidebar.
2. Copilot Studio connectors require HTTPS cloud endpoints.
3. No localhost IPC or pipe mechanism exists for injecting context.

---

## Polished Workaround: "Copy Context for Copilot" (WORKS)

### One-Click Flow (Scope 10/14/15 - v1.1.0)

The Mnemosyne Chrome extension (v1.1.0) includes a **"Copy context for Copilot"** button
directly in the popup. This is a real, polished flow - not a manual workaround.

**How it works:**

1. Click the Mnemosyne extension icon in Chrome (or press **Ctrl+Shift+M**).
2. Click **"Copy context for Copilot"** (the purple button at the top of the popup).
3. The extension automatically:
   - Detects the current page title
   - Queries your local Mnemosyne memory for relevant context
   - Formats the result as a structured prompt prefix
   - Copies the formatted text to your clipboard
4. Open Windows Copilot (Win+C or the taskbar button).
5. Press **Ctrl+V** to paste, then type your follow-up question.

**Total time: under 5 seconds.**

### Formatted Output Example

When you click "Copy context for Copilot" on a page about "Lemon Chicken Recipe", the clipboard
receives something like:

```
--- Mnemosyne Context (from local memory, 6/3/2026) ---
Topic: Lemon Chicken Recipe
Lemon chicken recipe: marinate with lemon, garlic, fresh herbs. Roast at 425F for 45 min.
Variation: add capers and white wine for Mediterranean style.
--- End Mnemosyne Context ---

Based on the above context from my personal notes,
```

You then type your question after the last line: e.g., "what wine pairs with this?"

### Keyboard Shortcut (Scope 11)

Press **Ctrl+Shift+C** on any page to trigger the copy-for-Copilot flow without opening the popup.
The context is copied silently and a confirmation toast appears at the bottom-right of the page.

### Right-Click Flow (Scope 16)

Right-click any selected text on a page and choose **"Copy Mnemosyne context for Copilot (...)"**
to query memory specifically about the selected text and copy the result for Copilot.

---

## Extension Options (Scope 12/13)

Click the gear icon (&#9881;) in the extension popup to open the options page, where you can:
- Change the bridge port (default: 11480)
- Set an auth token if your bridge requires one
- Test the bridge connection

---

## Technical Architecture

```
Chrome Extension (popup.js / background.js)
        |
        | HTTP (localhost only, CORS enabled)
        v
Mnemosyne Bridge Server (bridge/server.js)
        |
        | file I/O
        v
data/notes.json + data/eblets.json
```

### Bridge Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Status, version, eblet count, auth mode |
| `/substrate/query` | POST | Search local memory by query string |
| `/yoke/note` | POST | Save a note from the extension |

### Auth Model (Scope 21/22)

- **Trust mode** (default): No token required. Safe because the bridge binds to `127.0.0.1` only.
- **Token mode**: Set `MNEMO_TOKEN` env var when starting the bridge. Requires matching
  `Authorization: Bearer <token>` header on all requests.

---

## Future Path (If Microsoft Opens an API)

If Microsoft releases a Windows Copilot plugin SDK for local apps:
- Mnemosyne already exposes `GET /health`, `POST /substrate/query` at localhost:11480.
- A Copilot plugin manifest could be built that wraps these endpoints via a local HTTPS proxy.
- The required pieces (substrate query API, CORS headers, auth) are already in place.
- Estimated build time once an official API exists: 4-8 hours.

Monitoring: https://learn.microsoft.com/en-us/microsoft-copilot-studio/

---

## What IS Buildable Now: Mnemosyne as a Copilot Alternative

For the unTech wife-test user, Mnemosyne + the Chrome extension already provides:
- Private local AI memory (no cloud required)
- Query from Chrome via the extension popup (one click)
- One-click "Copy context for Copilot" for any AI assistant
- Context-aware suggestions alongside any app
- Works offline (bridge runs locally)

This covers the same use case Copilot targets, without the cloud dependency.
