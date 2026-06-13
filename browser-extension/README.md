# MnemosyneC Browser Extension — v0.1.0 Scaffold

Chrome Manifest V3 extension that captures Q+A pairs from AI chat surfaces
(ChatGPT, Claude, Gemini) and routes them into your local MnemosyneC substrate.

**Status:** Scaffolding complete (BP081 K-3). Content scripts observe turns and
log to console. MCP routing wires in **v0.2.0 SEG-1**.

---

## Directory structure

```
browser-extension/
  manifest.json             ← MV3 manifest
  background/
    service_worker.js       ← message bus (stub routing)
  popup/
    popup.html              ← extension popup UI
    popup.js                ← status query on open
    popup.css               ← dark substrate theme
  content/
    chatgpt_com.js          ← ChatGPT turn observer
    claude_ai.js            ← Claude turn observer
    gemini_google_com.js    ← Gemini turn observer
  bridge/
    local_mcp_client.js     ← localhost:11456 MCP client stub
  icons/
    icon16.png              ← placeholder 1×1 PNG
    icon48.png              ← placeholder 1×1 PNG
    icon128.png             ← placeholder 1×1 PNG
  README.md                 ← this file
```

---

## Load in Chrome (developer mode)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `browser-extension/` folder

---

## Verify it works

### Content scripts
1. Open `https://chatgpt.com/` (or `claude.ai`, `gemini.google.com`)
2. Press **F12** → **Console** tab
3. Confirm:
   ```
   [MnemosyneC] Content script loaded on chatgpt.com
   [MnemosyneC] Observing ChatGPT turns...
   ```
4. Send a message in the chat — console should log `[MnemosyneC] Turn detected: ...`

### Popup
1. Click the MnemosyneC extension icon in the Chrome toolbar
2. Popup shows red dot + "MnemosyneC not running" (expected — server not running yet)
3. Status will go green when the MnemosyneC MCP server is running on `localhost:11456`

### Background service worker
1. On `chrome://extensions` page, click **Service Worker** link next to MnemosyneC
2. DevTools opens for the background worker
3. You should see: `[MnemosyneC] Background service worker started · v0.1.0`

---

## v0.2.0 TODOs (SEG-1)

- [ ] `content/*.js` — uncomment `chrome.runtime.sendMessage({ type: 'QA_CAPTURED', data: qa })`
- [ ] `background/service_worker.js` — import `bridge/local_mcp_client.js` and call `postQA()`
- [ ] `bridge/local_mcp_client.js` — real `fetch()` to `localhost:11456/mcp/record`
- [ ] Icons — replace 1×1 placeholders with branded 16/48/128px PNGs
- [ ] Add `notifications` permission for "eblet captured" toast feedback

---

## MCP server endpoint (v0.2.0 target)

The extension will POST to the MnemosyneC MCP server started by K-2:

```
POST http://localhost:11456/mcp/record
Content-Type: application/json

{
  "question": "...",
  "answer": "...",
  "provenance": "chatgpt.com"
}
```

---

*BP081 K-3 LANDED — Sonnet 4.6 — Caithedral discipline applied.*
