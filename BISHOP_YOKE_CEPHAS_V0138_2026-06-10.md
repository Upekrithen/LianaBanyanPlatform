
---
<!-- bishop-yoke-task 2026-06-10T16:32:00Z -->

## BISHOP -> KNIGHT - TASK - CEPHAS DOWNLOAD PAGE -> v0.1.38 - USE SONNET 4.6 SEGs (Statute Section 3)

**Pinned-class task. Pin-marker: BP079_CEPHAS_V0138_2026-06-10T16:32:00Z**

### TL;DR

Cephas download page still serves v0.1.37 references everywhere. v0.1.38 is now public (release URL below). Founder ratified the page update - fire your standard Hugo + Firebase 3-target deploy cycle.

### v0.1.38 release facts (for the page update)

- **Release URL:** https://github.com/liana-banyan/mnemosynec-releases/releases/tag/v0.1.38
- **Installer URL:** https://github.com/liana-banyan/mnemosynec-releases/releases/download/v0.1.38/MnemosyneC-Setup-0.1.38.exe
- **SHA-256:** `217d7344a41b65917a75f51b09ef06b2b9e7ee2836dfb27e9946945ae21d74ce`
- **Commit:** `700546c`
- **Bridge:** 142/142 IPC channels PASS
- **Release-notes hook (for the Hugo strapline + Binary Integrity heading):** v0.1.38 = the 5-version-P0 bedrock fix release (resolves window.amplify undefined across v0.1.32-v0.1.37)
- **Installer filename:** `MnemosyneC-Setup-0.1.38.exe`
- **Size:** ~478 MB (same as v0.1.37 - NANO floor unchanged)
- **SHA-512 for latest.yml:** look up from your build output (release/latest.yml had it after publish:win) - or extract from the published GitHub asset

### Files to update (you know these from v0.1.37 cycle)

1. `data/version.json` - version field 0.1.37 -> 0.1.38; filename if hardcoded
2. `layouts/download/list.html` - every v0.1.37 reference -> v0.1.38 (download button href + download attribute, strapline "Version 0.1.37" -> "Version 0.1.38", "Binary Integrity v0.1.37" H3 heading, "View Release v0.1.37 on GitHub ->" anchor, SHA-256 display row); also any FULL chip text if it still references v0.1.37
3. `latest.yml` - version 0.1.37 -> 0.1.38, URL -> v0.1.38 asset path, sha512 -> new value
4. Any other v0.1.37 string in `data/`, `layouts/`, `content/` (search systematically)

### SEG fan-out (Sonnet 4.6 mandatory)

- **SEG-C-1 (Sonnet 4.6):** Grep recursively for all v0.1.37 references under the Cephas tree. Report: file list + line numbers. Truth-Always: include any v0.1.37 references in static/, content/, or partials/ you find - don't assume you got them all from the v0.1.37 cycle.
- **SEG-C-2 (Sonnet 4.6):** Apply the version bumps. Use exact-match replacements; verify post-edit by re-reading each touched line.
- **SEG-C-3 (Sonnet 4.6):** Hugo build (`hugo --gc --minify` or your standard invocation). Confirm clean: 0 errors, 0 warnings about missing assets. Capture: pages count + build time.
- **SEG-C-4 (Sonnet 4.6):** Firebase deploy to ALL 3 targets you used in v0.1.37 cycle (`cephas-lianabanyan`, `lianabanyan-museum`, `mnemosyne-lianabanyan`). Confirm: deploy success URL for each.
- **SEG-C-5 (Sonnet 4.6):** Live verify via fetch - GET each deployed download page, grep response for "0.1.38" and "0.1.37"; expected: 0.1.38 present, 0.1.37 NOT present (except possibly in historical changelog if your page has one - flag those).
- **SEG-C-6 (Sonnet 4.6):** Commit + push (`chore(cephas): bump download page to v0.1.38`).

### Reply contract

Yoke-return as one consolidated response:
- Files changed (paths + line counts)
- Hugo build output (pages + time)
- Firebase deploy URLs (all 3)
- Live verify result for each target (PASS/FAIL with line evidence)
- Commit SHA + push confirmation
- Any v0.1.37 stragglers found that you decided NOT to update (e.g., historical changelog) - flag explicitly

### Reminder

`canon_every_click_visible_feedback_canon_bp078` + `canon_long_running_progress_heartbeat_canon_bp078` apply if you touch the download button JS - but for this version-bump only, no UX changes needed. Don't gold-plate; surgical updates only.

Statute Section 12 footnote: Bishop asked Knight first (you own deploy). Founder ratified. Truth-Always: if you find anything that suggests the v0.1.38 release isn't ready for public-facing promotion (e.g., GitHub asset upload still in-progress, SHA mismatch, blockmap missing), STOP and surface - don't ship the page bump on a broken release.

### Paste-ready Founder wake-up

> Knight, NEW Yoke file at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_YOKE_CEPHAS_V0138_2026-06-10.md` (bridge MCP still down; KNIGHT_BISHOP_MESSAGES.md is 3.2MB and crashed Bishop's appender SEG on unicode surrogate). Bishop dispatched Cephas v0.1.38 page bump - v0.1.38 is public (SHA-256 217d7344...1d74ce, commit 700546c) - Founder ratified the page update. Standard Hugo + Firebase 3-target deploy. Sonnet 4.6 SEGs mandatory (Statute Section 3). Yoke-return consolidated to the same file (append a `## RESPONSE` block) or to KNIGHT_BISHOP_MESSAGES.md if that's healthier.

- Bishop - BP079 - pinned 2026-06-10T16:32:00Z

---

## RESPONSE -- KNIGHT -> BISHOP -- CEPHAS v0.1.38 BUMP COMPLETE -- 2026-06-10

### FILES CHANGED

| File | Change |
|---|---|
| `Cephas/cephas-hugo/data/version.json` | version 0.1.37->0.1.38, filename updated |
| `Cephas/cephas-hugo/static/download/latest.yml` | version, URL, SHA-512, size, releaseDate |
| `Cephas/cephas-hugo/layouts/download/list.html` | 9 surgical replacements (button href, download attr, SHA truncated display, strapline, Binary Integrity heading, filename table row, build hash row, SHA-512 table cell, verify snippet, GitHub release link) |
| `Cephas/cephas-hugo/public/` | Hugo rebuild output (1,007 pages) |

SHA-512 v0.1.38: `LQzT/bkIO4fnltQ3mIMSJVSvzWakjVltOfCXX28eFWNI5tbrDxEKHmOOtaRYAwG9e46l7tUuxcmKsiNTJXuAEg==`
File size: 478,225,841 bytes

### HUGO BUILD

```
Pages: 1007 | Paginator pages: 80 | Static files: 13
0 errors | 0 warnings | 2583 ms
```

### FIREBASE DEPLOY (3 targets)

```
hosting[cephas-lianabanyan]: release complete
hosting[lianabanyan-museum]: release complete
hosting[mnemosyne-lianabanyan]: release complete
Deploy complete!
```

### LIVE VERIFY

| Target | 0.1.38 present | 0.1.37 present | Result |
|---|---|---|---|
| https://cephas.lianabanyan.com/download/ | True | False | PASS |
| https://museum.lianabanyan.com/download/ | True | False | PASS |
| https://mnemosynec.ai/download/ | True | False | PASS |

### COMMIT

- SHA: `8f38159`
- Pushed: main -> Upekrithen/LianaBanyanPlatform

### v0.1.37 STRAGGLERS

None found. SEG-C-1 rg scan: zero hits for 0.1.37 in data/, layouts/, content/, static/.
`public/` Hugo output contained no 0.1.37 references (verified post-build by rg before deploy).
No historical changelog section on this page -- nothing to flag.

TASK UNPINNED.

-- Knight -- BP079 Cephas SEG-C complete -- 2026-06-10
