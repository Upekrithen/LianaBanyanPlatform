# LB Omnibox — Installation Guide (K530 Internal Build)

**Gate status:** Internal-only. Pre-Prov-14. Controlled-disclosure testers only.
`OMNIBOX_EXTENSION_PUBLISHED=false` — no Web Store submission until Prov 14 + Founder fire.

---

## Developer Mode Install (Chrome)

1. Open Chrome → navigate to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this directory: `lb-omnibox-extension/`
5. The extension appears in your toolbar — click the puzzle-piece icon → pin "LB Omnibox"

---

## What the extension does

**Substrate Injection (Cathedral Effect):**
- On AI vendor pages (Perplexity, Claude, ChatGPT, Gemini): intercepts outgoing query
  fetches and enriches them via the local Helm daemon at `127.0.0.1:7712/enrich`
  before they reach the vendor. If the daemon is offline, the original query passes
  through transparently (daemon-down safety guarantee).
- On search engines (Google, Bing, DuckDuckGo): extracts the query from the URL.

**Three-Class Curation Prompt (#2315):**
- ~2.5 seconds after a query is detected, a small overlay appears at the bottom-right
  of the page: *"Make a book of this search?"*
- **Default: Ephemeral** — dismiss the prompt (or do nothing) → no record is kept.
- **Personal-Permanent** — click "Save to my library" → entry stored in your extension's
  IndexedDB (private to your browser, member-private, not synced anywhere).
- **Shared-Permanent** — future K531; placeholder infrastructure in place.

**Privacy-by-default (B.8):**
- Incognito / private-browsing: always ephemeral, overlay never shown.
- Sensitive categories (medical, financial, legal, political): overlay suppressed by
  default; opt in per-category in Settings.

---

## Helm daemon (optional)

The Helm daemon (`librarian-mcp-helm-pwa/`) provides the enrichment at `127.0.0.1:7712`.
If it's not running, all queries still work — they just don't receive Cathedral Effect
enrichment. The Three-Class curation prompt works independently of the daemon.

To start the Helm daemon:
```powershell
cd librarian-mcp-helm-pwa
npm start
```

---

## Testing the Three-Class flow (C-phase verification targets)

| Check | Steps |
|-------|-------|
| C.1 Extension loads | Visit `chrome://extensions` → extension shows as enabled, no errors |
| C.2 MAIN-world override | Visit `https://www.perplexity.ai`, open DevTools → Console, run a query; look for `[OmniBridge] ✓ Perplexity query:` log |
| C.3 Default ephemeral | Run Google search, wait 5s, close overlay without clicking Save → open Library → 0 entries |
| C.4 Prompt appears | Run Google search → overlay appears at bottom-right after ~2.5s, dismissible without storing |
| C.5 Personal-Permanent | Click "Save to my library" → open popup → Library count increments; click "Open Library" → entry appears |
| C.6 Per-entry delete | In library, click 🗑 on an entry → confirm → entry gone; only audit-trail record remains |
| C.7 Forget Everything | In library, click "Forget Everything" → confirm → all entries purged |
| C.8 Incognito | Open incognito tab → Google search → NO curation overlay appears |
| C.9 Sensitive pattern | Google: "symptom of COVID" → NO curation overlay (medical category suppressed by default) |
| C.10 Settings toggle | Disable "Curation Prompts" in popup → run search → overlay no longer appears |

---

## Tag on close

```
v-chrome-omnibox-substrate-injection-K530
```

---

*K530 / B128 · Three-Class Substrate Sovereignty A&A #2315*
*Liana Banyan Corporation · Internal only · Pre-Prov-14*
*"The default is forgetting. The exceptions are yours to make."*
