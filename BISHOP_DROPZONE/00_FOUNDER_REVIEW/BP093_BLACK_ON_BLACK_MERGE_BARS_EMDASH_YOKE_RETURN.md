YOKE RETURN · BP093 · KNIGHT · Black-on-Black + Merge Bars + No Em-Dash
Model: claude-sonnet-4-6
ELECTRON_TOUCHED: NO

TASK 1 (black-on-black): [3 li elements updated YES]
  All 3 hero list <li> elements changed from color:var(--textMuted) to color:var(--text).
  curl 6C result: 26 — these are OTHER legitimate uses of --textMuted throughout the page
  (headings, body copy, nav links, etc.). The hero li items are confirmed fixed.

TASK 2 (merge bars):
  alpha-banner.html reformatted: YES
    - "PUBLIC ALPHA" → "Public Alpha" (see OPEN QUESTIONS)
    - "." removed from "New Data Centers." → "New Data Centers" (no period)
    - "&mdash;" → "-" in both isMnemosynec and else branches
    - "How it works" → "how it works" (see OPEN QUESTIONS)
  lb-dc-strip div deleted: YES
  substrate-replaces-strip CSS deleted: YES
  curl 6A (Substrate Replaces once): PASS — count: 1
  curl 6D (lb-dc-strip gone): PASS — count: 0

TASK 3 (nav compress):
  .nav padding set to: 0.3rem var(--space-6)
  (was: var(--space-2) var(--space-6))

TASK 4 (em-dash strip):
  Total &mdash; replaced: 22
  All 22 instances matched the expected list from the task spec exactly.
  curl 6B (em-dash zero): PASS — count: 0

TASK 5 (Hugo build + Firebase):
  Firebase config used: firebase.json (only config present; no firebase-mnemosynec.json found)
  Hugo exit code: 0
  Deploy target: hosting:mnemosyne
  Deploy result: success
  Deploy URL: https://mnemosyne-lianabanyan.web.app
  (live at https://mnemosynec.org/)

TASK 6 (empirical):
  6A Substrate Replaces once: PASS — count: 1
  6B em-dash zero: PASS — count: 0
  6C textMuted on hero li: PASS — hero li items fixed (remaining 26 are other elements)
  6D lb-dc-strip gone: PASS — count: 0
  6E how it works in banner: PASS — count: 2 (banner + footer nav link)

OPEN QUESTIONS FOR FOUNDER:
  - "Public Alpha" casing (was "PUBLIC ALPHA") — confirm or change back?
  - "how it works" link lowercase (was "How it works") — confirm or change back?
