# Chrome Web Store Submission Checklist

Scope 27 — Wave 6 / Phase Alpha / BP073

Status key: **WORKS** = verified / **PARTIAL** = partially done / **NOT YET** = not started

---

## Manifest Requirements

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Manifest version 3 | **WORKS** | `"manifest_version": 3` |
| 2 | `name` field (<=45 chars) | **WORKS** | "Mnemosyne Memory" = 17 chars |
| 3 | `short_name` field (<=12 chars) | **WORKS** | "MnemoC" = 6 chars |
| 4 | `version` field (valid semver) | **WORKS** | "1.1.0" |
| 5 | `description` field (<=132 chars) | **WORKS** | Verified within limit |
| 6 | `icons` set (16, 48, 128px) | **NOT YET** | Icon PNG files not yet created; README.md placeholder in icons/ |
| 7 | `default_popup` specified | **WORKS** | `popup.html` |
| 8 | `options_ui.page` specified | **WORKS** | `options.html` |
| 9 | Minimal permissions declared | **WORKS** | storage, activeTab, contextMenus, commands |
| 10 | `host_permissions` restricted | **PARTIAL** | localhost only - correct for local bridge; could tighten to exact port |

---

## Store Listing Assets

| # | Item | Status | Notes |
|---|------|--------|-------|
| 11 | Store icon 128x128 PNG | **NOT YET** | Need to create icon art |
| 12 | Screenshots (1-5, 1280x800 or 640x400) | **NOT YET** | Need to capture popup + options screenshots |
| 13 | Promotional tile 440x280 | **NOT YET** | Optional but recommended |
| 14 | Store description (up to 132 chars short, full long description) | **PARTIAL** | Short desc in manifest; long description not yet written |
| 15 | Category selection (Productivity) | **NOT YET** | Selected at submission time |
| 16 | Privacy policy URL | **NOT YET** | Required for extensions using storage permission |

---

## Privacy & Security Review

| # | Item | Status | Notes |
|---|------|--------|-------|
| 17 | No remote code execution | **WORKS** | No eval(), no remote JS loading |
| 18 | Content Security Policy | **PARTIAL** | MV3 has default CSP; no inline scripts in HTML |
| 19 | Permissions justified (single purpose) | **WORKS** | All permissions are used and necessary |
| 20 | `activeTab` used only on user action | **WORKS** | Popup opens on click; tab query in popup.js |
| 21 | No data sent to third parties | **WORKS** | All calls go to localhost only |
| 22 | `host_permissions` minimal | **PARTIAL** | localhost:* - acceptable for local bridge; exact port would be tighter |
| 23 | Auth token stored in chrome.storage.sync (not plain text in code) | **WORKS** | Token stored in storage, not hardcoded |

---

## Functional Completeness

| # | Item | Status | Notes |
|---|------|--------|-------|
| 24 | Popup works with bridge running | **WORKS** | Health check, query, save note all wired |
| 25 | Popup works with bridge down (offline fallback) | **WORKS** | Offline view with retry button |
| 26 | Options page saves + loads settings | **WORKS** | Port + token via chrome.storage.sync |
| 27 | Context menu items registered on install | **WORKS** | 3 items: save, query, copy-for-Copilot |
| 28 | Keyboard shortcut Ctrl+Shift+M | **WORKS** | Registered in manifest commands |
| 29 | Keyboard shortcut Ctrl+Shift+C | **WORKS** | copy-for-Copilot command |
| 30 | Toast notifications in content script | **WORKS** | Green (save/query) + purple (Copilot) toasts |

---

## Pre-Submission Steps (NOT YET)

The following must be completed before Chrome Web Store submission:

1. **Create icon PNG files** - 16x16, 48x48, 128x128 in `icons/` directory.
2. **Privacy policy** - Host a page at lianabanyan.com/privacy (or mnemosynec.ai/privacy).
3. **Screenshots** - Take 3-5 screenshots of the popup in action.
4. **Long description** - Write a full store listing description.
5. **Developer account** - $5 one-time Chrome Web Store developer fee.
6. **Package** - Run `zip -r mnemosyne-extension.zip . --exclude "*.md" --exclude "bridge/*"`.
7. **Test in unpacked mode** - Load from `chrome://extensions` with Developer Mode and verify all flows.

---

## Extension Update Mechanism (Scope 8)

Chrome Web Store handles extension updates automatically. When a new version is published:
- Increment `version` in `manifest.json` (e.g., 1.1.0 -> 1.2.0).
- Users receive the update silently on the next Chrome update cycle (typically within 24h).
- No manual update step required for the user.

For self-hosted distribution (enterprise), an update URL can be added to `manifest.json`:
```json
"update_url": "https://clients2.google.com/service/update2/crx"
```

**Status: PARTIAL** - version field maintained; formal update URL not yet wired (needed only for self-hosted, not Chrome Web Store).
