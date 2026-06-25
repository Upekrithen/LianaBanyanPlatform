# KNIGHT YOKE — Download Button "Done" Real-Completion Wiring

**Session:** BP086 · **Composed:** 2026-06-18 · **Origin:** Founder report — Download button on `mnemosynec.ai` flips to "✓ DOWNLOADED" 8 seconds after click, but the OS save-as dialog can appear 14+ seconds later. Users wonder if anything happened. Founder choice: **wire to actual completion** (not "extend the artificial timer").

**Knight preamble (BP084 HARD BINDING):** Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER. You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

**Statutes:** BP085 §14 BLOOD · §15 BLOOD · §16 BLOOD.

---

## Root cause (already gadgeted — do NOT re-recon)

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html` lines 1238–1276.

Two buttons affected:
- `id="mn-hero-dl-btn"` (hero section, line 693)
- `id="mn-install-dl-btn"` (install card section, line 1100)

Current code:
```js
setTimeout(function(){
  btn.dataset.state = 'downloaded';
  btn.textContent = '';
  var span2 = document.createElement('span');
  span2.innerHTML = btn.dataset.labelDownloaded;  // "✓ DOWNLOADED v0.5.x"
  btn.appendChild(span2);
  setTimeout(function(){
    delete btn.dataset.state; ...
  }, 30000);
}, 8000);   // ← fires 8s after click, disconnected from real download
```

The 8-second timer has zero relation to the actual binary transfer. On any connection that takes longer than 8s for the OS save dialog to appear, the button lies.

---

## Fix shape (Founder-selected: "the first one" = real-completion wiring)

Replace the `<a download>` mechanism with a `fetch()` + Blob URL pattern:

1. Click handler: call `fetch(installerUrl)` and capture the response
2. Pipe `response.body` through a `ReadableStream` reader to track bytes received
3. Update button label live: `"Downloading… 34%"` based on `loaded/total` from `Content-Length` header
4. On full blob assembly: `URL.createObjectURL(blob)` → create temporary `<a>` element → `.click()` to trigger OS save dialog
5. Only THEN set `btn.dataset.state = 'downloaded'` and show "✓ DOWNLOADED v0.5.x"
6. The existing 30-second reset to idle still applies after Done state

Edge cases to handle:
- `Content-Length` may be absent on some CDNs — fall back to byte-count without %, show `"Downloading… (12.3 MB)"` with running total
- Fetch failure → show `"Download failed — retry"` and revert state
- User cancels mid-download (no built-in way to cancel `fetch()` reading, but offer "Restart" if button reclicked)

**Performance note:** the v0.5.x installer is ~500 MB. Buffering 500 MB in browser JS heap is acceptable on desktop but may strain mobile/older devices. The OS save dialog fires AFTER full blob assembly, which means users see live progress but cannot abort. This is the trade-off Founder selected over the "8-second lie."

---

## SEGs (Sonnet 4.6 each)

### SEG-1 · Edit the click handler (both button instances)
1. Open `Cephas/cephas-hugo/layouts/partials/mnemosynec-homepage.html`
2. Replace the `<a id="mn-hero-dl-btn" download href="...">` with a `<button id="mn-hero-dl-btn" data-installer-url="...">`. Same for `mn-install-dl-btn`.
3. Rewrite the inline `<script>` block (lines ~1238–1276) to use the fetch+Blob pattern above
4. Preserve the 30-second idle-reset behavior
5. Preserve the `data-state` attribute pattern (used by existing CSS for visual states)
6. Add `aria-live="polite"` on the button so screen readers announce progress updates
7. Report: lines changed, lines added, lines removed

### SEG-2 · Build + deploy
1. `hugo --config config-mnemosynec.toml` (clean build)
2. Verify exit code 0
3. `firebase deploy --only hosting:mnemosynec-lianabanyan` (or canonical target name)
4. Verify deploy exit 0
5. Report: build output, deploy output, live URL

### SEG-3 · Live smoke test (read-mode in browser, no actual binary fetch)
1. `Invoke-WebRequest https://mnemosynec.ai/ -UseBasicParsing` and confirm response 200
2. Grep response HTML for: `data-installer-url=` (new attribute) and confirm BOTH button IDs present
3. Grep response HTML for: `setTimeout(...8000)` and confirm ABSENT (old code gone)
4. Grep response HTML for: `fetch(` and confirm PRESENT in the homepage JS block
5. Report: 5 Sharps GREEN/RED

---

## 5 Sharps

| # | Sharp | Pass criteria |
|---|---|---|
| 1 | Code rewrite | Both buttons use fetch+Blob pattern; old setTimeout(...8000) removed |
| 2 | Hugo build | Exit code 0, no warnings |
| 3 | Firebase deploy | Exit code 0, live |
| 4 | Live HTML check | `fetch(` present, `setTimeout(... 8000)` absent, both data-installer-url attrs present |
| 5 | Behavior verify | Founder M0 manual test: click button → see live "Downloading… X%" → save dialog appears → button shows ✓ DOWNLOADED only AFTER save dialog |

---

## Founder action after Knight returns GREEN

Click the download button on `mnemosynec.ai` from M0. Confirm:
- Button shows live progress (% or MB) while transferring
- Button does NOT say "Done" until the save dialog has actually appeared
- After save dialog appears, button shows "✓ DOWNLOADED v0.5.x"
- After 30 seconds, button resets to idle

If real-completion still feels off (e.g. progress stutters on slow CDN), v3 could add a streaming readableStream progress reader.

---

**Composed by Bishop BP086. Not yet dispatched. Awaiting Founder one-pass ratify per §16.**
