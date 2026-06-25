# YOKE RETURN — Homepage Hero Substrate Inline Link Restoration · BP084

**Agent:** Sonnet 4.6  
**Task:** Restore canonical three-sentence hero on mnemosynec.ai homepage  
**Commit:** `b691b06`  
**Timestamp:** 2026-06-16 (session BP084)

---

## SEG STATUS SUMMARY

| SEG | Title | Status |
|-----|-------|--------|
| SEG-1 | Locate hero source file | GREEN |
| SEG-2 | Restore three-sentence hero | GREEN |
| SEG-3 | Deploy via deploy-atomic.ps1 | GREEN |
| SEG-4 | Truth-Always Sharps | GREEN (4/5) · SEE NOTE |
| SEG-5 | Commit + push + yoke-return | GREEN |

---

## SEG-1: Source File Located

Primary source: `Cephas/cephas-hugo/layouts/partials/mnemosynec-homepage.html` (line 666)

Prior state (single h1, both sentences merged):
```html
<h1>Your AI has Amnesia. Dr.&nbsp;MnemosyneC&trade; has the Cure.</h1>
```

Target page `/how-to-read-the-substrate/` **confirmed present** at `content-mnemosynec/how-to-read-the-substrate/`.

---

## SEG-2: Restoration Applied

Surgical edit to `layouts/partials/mnemosynec-homepage.html`:

**Before:**
```html
<h1>Your AI has Amnesia. Dr.&nbsp;MnemosyneC&trade; has the Cure.</h1>
```

**After:**
```html
<h1>Your AI has Amnesia.<br>Dr.&nbsp;MnemosyneC&trade; has the Cure.<br><a href="/how-to-read-the-substrate/" class="mn-hero-substrate-link">Substrate.</a></h1>
```

Three sentences, same `<h1>` tag for uniform hero typography. `<br>` separates each sentence visually. Third sentence uses existing `.mn-hero-substrate-link` CSS class (`color: #5DBCD1 !important`) for blue/teal rendering. No horizontal scroll (BP081 canon preserved — `overflow-x: hidden` remains on html/body). Existing secondary body paragraph ("Every time you start a new session...") remains below as body text.

---

## SEG-3: Deploy

Command: `powershell -ExecutionPolicy Bypass -File scripts/deploy-atomic.ps1`

| Step | Result |
|------|--------|
| Hugo Cephas build | GREEN (1198 pages) |
| Hugo MnemosyneC build | GREEN (45 pages) |
| Firebase deploy mnemosyne-lianabanyan | GREEN |
| Firebase deploy cephas-lianabanyan | GREEN |
| AtomicDeploy OVERALL | GREEN — Both hosts verified at v0.5.0 |

---

## SEG-4: Truth-Always Sharps

All checks performed with `C:\Windows\System32\curl.exe` (not the PowerShell alias).

### Sharp 1 — `https://mnemosynec.ai/` href link present
```
Pattern: href=/how-to-read-the-substrate/
Result: GREEN — found in served HTML
```
(Note: Hugo minification strips attribute quotes; pattern checked without quotes — match confirmed.)

### Sharp 2 — `https://mnemosynec.ai/` Substrate link text present
```
Pattern: class=mn-hero-substrate-link>Substrate
Result: GREEN — Substrate link text confirmed in hero
```

### Sharp 3 — `https://mnemosynec.org/` mirror
```
Result: RED (INFRASTRUCTURE CAUSE — NOT CODE)

mnemosynec.org returns: Server: Squarespace
This domain is hosted on Squarespace, NOT Firebase.
deploy-atomic.ps1 deploys only: mnemosyne-lianabanyan (Firebase) and cephas-lianabanyan (Firebase).
The .org domain is a separate platform outside the Firebase deploy scope.
This SEG cannot deploy to Squarespace. Honest RED reported per Truth-Always.
```

### Sharp 4 — `https://mnemosynec.ai/` HTTP code
```
HTTP/1.1 200 OK — GREEN
```

### Sharp 5 — `https://mnemosynec.org/` HTTP code
```
HTTP/1.1 200 OK — GREEN (Squarespace is up; just not synced to our build)
```

---

## SEG-5: Commit + Push

```
Commit: b691b06
Message: BP084 restore 3-sentence hero: Amnesia / Cure / Substrate link
Files changed: Cephas/cephas-hugo/layouts/partials/mnemosynec-homepage.html (1 file, 1 insertion, 1 deletion)
Push: 7a7efc8..b691b06  main -> main — GREEN
```

Pre-commit hooks: gitleaks PASSED · block-large-files PASSED (only source file staged, not generated public/) · secrets PASSED.

---

## LIVE VERIFICATION (inline HTML from production)

From `https://mnemosynec.ai/` served HTML:
```html
<h1>Your AI has Amnesia.<br>Dr.&nbsp;MnemosyneC™ has the Cure.<br><a href=/how-to-read-the-substrate/ class=mn-hero-substrate-link>Substrate.</a></h1>
```

Three sentences confirmed live. Substrate link confirmed live. Blue teal class confirmed live.

---

## OUTSTANDING ACTION FOR FOUNDER

**mnemosynec.org (Squarespace):** This domain is on Squarespace and does not receive Firebase deploys. If Founder wants the .org mirror to reflect the same hero, the Squarespace site requires a manual edit by Founder via the Squarespace dashboard. Knight cannot push to Squarespace.

---

*Agent: Sonnet 4.6 · BP084 · 2026-06-16*
