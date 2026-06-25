YOKE RETURN — SPLIT .AI/.ORG + v0.7.2 PROPAGATE — BP093 SEG-AS

EXECUTED BY: Bishop direct (SEG-AS · Sonnet 4.6 · §14 §15 §17 BLOOD)
DATE: 2026-06-24

---

PRESERVATION BRANCH SHA: e9aa242
PRESERVATION BRANCH NAME: preserve-pre-marathon-design-v0.7.1-bp093
BRANCH CONFIRMED: git show e9aa242 --oneline → "M25b v0.7.1: I12 IP Ledger Ring Bearer + Stamp-Certify + Mesh Diff Loop + My IP Ledger UI"

---

HUGO BUILD (PRESERVATION / .AI):
  Source: git worktree add cephas-hugo-ai-preserve preserve-pre-marathon-design-v0.7.1-bp093
  Theme fix required: PaperMod is a git submodule — empty in worktree. Built with --themesDir pointing to main working tree.
  Command: hugo --config config-mnemosynec.toml --destination ../cephas-hugo/public-mnemosynec-ai --themesDir <main>/themes
  Result: 56 pages · 50 static files · 123 total files uploaded
  index.html size: 93,863 bytes

§17 CHECKS:
  dc-savings-stats in public-mnemosynec-ai/index.html: 0 (PASS — Phoenix-Flight absent)
  v0.5.18 markers in index.html: 17 (correct — pre-Marathon-Phase-2 download label)
  version_trust.json at e9aa242: top version = 0.7.1, tier = latest (correct)

---

FIREBASE STATE:

  firebase.json: mnemosynec-ai target entry was already present (added by prior SEG)
    "target": "mnemosynec-ai" → "public": "public-mnemosynec-ai"

  .firebaserc: mnemosynec-ai alias was already present, reformatted by firebase target:apply
    "mnemosynec-ai": ["mnemosynec-ai-lianabanyan"]

  Firebase site: mnemosynec-ai-lianabanyan — already existed (409 on create attempt = pre-existing)

  firebase target:apply: Applied hosting target mnemosynec-ai to mnemosynec-ai-lianabanyan ✓

FIREBASE DEPLOY .ORG: NOT RUN THIS SEG — .org was not rebuilt (Task 4/5 from reference doc deferred; .org currently serves existing SEG-AQ deploy)
FIREBASE DEPLOY .AI: https://mnemosynec-ai-lianabanyan.web.app

COMMIT: 8bbf881 on knight-mamba-phoenix-flight-bp092
  "BP093 SEG-AS: .ai preservation split · serve e9aa242 to mnemosynec.ai"
  1 file changed (.firebaserc reformatted by firebase target:apply)

---

CURL VERIFICATION:

CURL 1 (.org 200):   HTTP/1.1 200 OK — PASS
CURL 2 (.org v0.7.2 body): NOT RUN (Task 4 Hugo rebuild of .org not executed this SEG)
CURL 3 (version_trust latest): NOT RUN (depends on Task 4)
CURL 4 (.ai 200):    HTTP/1.1 200 OK — PASS (returns 200 but still pointing to OLD site — see DNS NOTE)
CURL 5 (.ai v0.7.1 body): N/A — domain not yet rerouted (see DNS NOTE)
CURL 6 (.ai no dc-savings-stats): Count = 0 on web.app URL — PASS

CURL WEB.APP (empirical confirmation of correct content):
  https://mnemosynec-ai-lianabanyan.web.app
  HTTP/1.1 200 OK
  Content-Length: 93863
  ETag: 239153c2b6e5f9636a69997187eb73c04bfdf9ec5f73e919978c4ad492e65da1

ETAG SPLIT:
  .org ETag:  c59a4bf5f9c0a5495c7d50e09af7ee9fc84b7012de9881c71b00cb0811f368c7
  .ai ETag:   c59a4bf5f9c0a5495c7d50e09af7ee9fc84b7012de9881c71b00cb0811f368c7
  web.app ETag: 239153c2b6e5f9636a69997187eb73c04bfdf9ec5f73e919978c4ad492e65da1
  STATUS: WARNING — .ai still same ETag as .org (custom domain not yet rerouted)
  CONFIRMATION: web.app ETag DIFFERS from .org — preserved content is live on Firebase, domain attachment pending.

---

DNS NOTE / FOUNDER ACTION REQUIRED:

mnemosynec.ai custom domain is CURRENTLY ATTACHED to mnemosyne-lianabanyan (the .org site).
The new preserved content is LIVE on mnemosynec-ai-lianabanyan.web.app with the correct ETag.

To complete the split, Founder must:

  1. Firebase Console → Hosting → select site: mnemosyne-lianabanyan
  2. Find Custom domains → mnemosynec.ai → REMOVE / Disconnect

  3. Firebase Console → Hosting → select site: mnemosynec-ai-lianabanyan
  4. Add custom domain → mnemosynec.ai → follow DNS verification steps
     (DNS should already be pointed to Firebase servers from prior setup — verification may be instant)

  NOTE: Once rerouted, mnemosynec.ai will serve Content-Length 93,863 (old design) vs .org at 60,477 (Phoenix-Flight design). ETags will diverge. All 6 curl checks from reference doc will then pass.

---

TASKS NOT COMPLETED THIS SEG (deferred to follow-on SEG or Founder decision):

  Task 4: Hugo rebuild of .org to propagate v0.7.2 — NOT DONE (not in SEG-AS scope per user instruction)
  Task 5: Deploy .org — NOT DONE (depends on Task 4)
  Curls 2, 3, 5: Cannot confirm until Task 4 and DNS reroute complete

---

ELECTRON_TOUCHED: NO
HUGO_REBUILT: YES — public-mnemosynec-ai (e9aa242 preserved design, 56 pages, 93,863-byte index)
FIREBASE_JSON_EDITED: NO (already had mnemosynec-ai target from prior SEG)
FIREBASERC_EDITED: YES — firebase target:apply reformatted + added etags:{} (commit 8bbf881)
FIREBASE_SITE_CREATED: NO (mnemosynec-ai-lianabanyan already existed)
FIREBASE_TARGET_APPLIED: YES — mnemosynec-ai → mnemosynec-ai-lianabanyan CONFIRMED
FIREBASE_DEPLOYED: YES — mnemosynec-ai target · 123 files · web.app URL LIVE
CUSTOM_DOMAIN_REROUTED: NO — PENDING FOUNDER ACTION IN FIREBASE CONSOLE
