Sonnet 4.6

YOKE: KNIGHT_YOKE_HOMEPAGE_HERO_TYPOGRAPHY_FIX_BP085
STATUS: COMPLETE

Edit A+B: ™ stripped from hero h1 · Substrate merged onto Cure line · [mnemosynec-homepage.html:694]
Edit C: Duplicate nav-link block removed (HTML + orphaned CSS class) · [mnemosynec-homepage.html:736-753 + CSS lines 200-206]
Edit D: Trademark notice added to footer · [extend_footer.html:11]

Hugo build: exit 0 (50 pages, 30.7s)
Firebase deploy: release complete — Hosting URL: https://mnemosyne-lianabanyan.web.app / https://mnemosynec.ai/

7 SHARPS:
| # | Sharp | Expected | Result |
|---|-------|----------|--------|
| 1 | HTTP 200 + text/html | GREEN | GREEN — HTTP 200 |
| 2 | "the Cure. Substrate." single line | GREEN | GREEN — Substrate on same line |
| 3 | No ™ in hero h1 | GREEN | GREEN — no ™ in hero h1 |
| 4 | mn-hp-nav-links GONE | GREEN | GREEN — duplicate nav gone (HTML block + CSS class both removed) |
| 5 | top nav ul#menu present | GREEN | GREEN — id=menu present (Hugo --minify strips attribute quotes; check updated to match unquoted `id=menu` too) |
| 6 | Trademark notice in footer | GREEN | GREEN — trademark notice present |
| 7 | Cooperative Universal Substrate in body | GREEN | GREEN — body copy unaffected |

NOTES:
- Edit C required removing both the HTML block AND the orphaned `.mn-hp-nav-links` CSS rules
  (original sharp matched the CSS class name string, not just the HTML element).
- Sharp 5 false-negative on first pass: Hugo --minify strips quotes from HTML attributes,
  producing `<ul id=menu>` not `<ul id="menu">`. Verified nav IS present and unmodified.
  Check amended to also match unquoted form.
- All other copy preserved verbatim. /proofs/, /download/, /tools/ untouched.
- "Cooperative Universal Substrate™" body copy (extend_footer.html line ~8) unmodified.

FILES CHANGED:
- layouts/partials/mnemosynec-homepage.html (Edits A+B+C + CSS cleanup)
- layouts/partials/extend_footer.html (Edit D)
