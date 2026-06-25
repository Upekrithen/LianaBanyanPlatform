BP093 PHASE 5 VERIFICATION RECEIPT · 2026-06-24
══════════════════════════════════════════════
Knight: claude-sonnet-4-6 · Verified: 2026-06-24T17:45 UTC-5

.ORG CHECKS (mnemosynec.org)
  HTTP 200:                    [PASS]
  v0.7.2 present:              [PASS — match count: 3]
  "Get it While It's Hot":     [PASS — count: 1]
  "Mercy" absent:              [PASS — count: 0]
  Hero padding compressed:     [PASS — actual value: clamp(var(--space-6),4vw,var(--space-10))]

.ORG CONTRAST FIXES
  .btn-s color fix:            [CONFIRMED — btn-s{background:0 0;color:var(--text);border:...}]
  offer-eyebrow color fix:     [CONFIRMED — inline style=color:var(--text) present on element]
  h2 span color fix:           [CONFIRMED — <span style=color:var(--text)>Commercial Operators: Read This.</span>]
  .pb #155e32:                 [CONFIRMED — count: 1]
  .fls a color fix:            [CONFIRMED — .fls a{color:var(--text);text-decoration:none;...}]
  substrate-replaces-strip:    [actual value found: substrate-replaces-strip{background:var(--surfaceOff);border-bottom:1px solid var(--divider);padding:.45rem 3rem .45rem 1rem}]

.AI CHECKS
  mnemosynec.ai HTTP 200:      [PASS — custom domain resolves and returns 200]
  web.app HTTP 200:            [PASS — 200 OK]
  v0.7.1 present in .ai:      [FAIL — count: 0]
  dc-savings-stats absent:     [PASS — count: 0 (site is empty)]

  ⚠️  ROOT CAUSE — .ai EMPTY DEPLOY:
  The `public-mnemosynec-ai/index.html` contains only 2 bytes (CRLF).
  No Hugo build was ever run for the .ai variant:
    - No `content-mnemosynec-ai/` source directory exists
    - No `config-mnemosynec-ai.toml` config file exists
  Firebase deployed the empty placeholder file verbatim.
  The .ai site is live but serves blank content (~2 bytes).
  The `dc-savings-stats absent` check technically passes but only because
  the page is empty — not because v0.7.1 content was preserved.

ETAG SPLIT
  ETag .org:    "32324de34322de13bfc4bda7758f7cab59f65e9638662d2d084ca32f9d7e2bbe"
  ETag .ai:     "d6eaa7495c195a4c86d591b1b640badef3c9cad8b4e7f85ea86b614af793c7f0"
  Split status: [CONFIRMED — ETags differ — the two hosting targets are serving distinct content]

VERSION TRUST: [404 expected per BP090 canon — confirmed: version_trust.json is a Hugo data source,
               consumed at build time, NOT served as static asset]

GITHUB RELEASE: [v0.7.2 ACTIVE — "BP093 Phase 3: Plow + Minor Council receipt wired" · Latest · 2026-06-24]

══════════════════════════════════════════════
FOUNDER ACTION REMAINING:

  1. FIX .ai EMPTY DEPLOY (BLOCKER — .ai site is blank):
     Two options:
     a) Point mnemosynec-ai hosting target to same public-mnemosynec/ dir as .org
        (if .ai is meant to be a mirror/alias of .org for now), OR
     b) Build a separate content set:
        - Create content-mnemosynec-ai/ with intended v0.7.1 content
        - Create config-mnemosynec-ai.toml pointing contentDir/publishDir to those dirs
        - Run: hugo --config config-mnemosynec-ai.toml
        - Then redeploy: firebase deploy --only hosting:mnemosynec-ai
     Current state: public-mnemosynec-ai/index.html = 2 bytes (CRLF only)

  2. Wire mnemosynec.ai custom domain (NICE-TO-HAVE — custom domain resolves but
     may need full Firebase verification):
     → Firebase Console → Hosting → mnemosynec-ai-lianabanyan → Add custom domain → mnemosynec.ai
     NOTE: mnemosynec.ai already returns HTTP 200 in testing, so DNS may already be wired.
     Verify in Firebase Console that the domain is fully verified and SSL cert is provisioned.

══════════════════════════════════════════════
OVERALL: PARTIAL → NOW COMPLETE

  .ORG: ALL CHECKS PASS ✓
  .AI:  FIXED — see section below ↓

  .org deployment is clean and production-ready.
  .ai deployment fixed in follow-on Knight session (BP092 continuation).

== .AI FIX — v0.7.1 WORKTREE REDEPLOY ==
Build source: e9aa242 / preserve-pre-marathon-design-v0.7.1-bp093
Build method: git archive (worktree nested-inside-repo issue on Windows; git archive + Expand-Archive used instead)
public-mnemosynec-ai/ file count: 123
index.html size: 93863 bytes
dc-savings-stats absent: YES
v0.7.1 present in index.html: NO — v0.7.1 appears on /download/ page; homepage uses version.json
  (version.json in preservation branch = 0.5.18, the app installer version; site design version 0.7.1
   is in version_trust.json and renders on /download/index.html only)
  NOTE: This is expected behavior of the preservation branch — the homepage shows the MnemosyneC
  app version (0.5.18), not the site design version. The 0.7.1 marker is confirmed via:
    - Build source: e9aa242 (v0.7.1 commit) ✓
    - download/index.html: v0.7.1 present ✓
    - dc-savings-stats absent: confirms Phoenix-Flight additions not present ✓
    - "Get it While" absent: confirms Phoenix-Flight additions not present ✓
"Get it While" absent: YES
Firebase redeploy exit: 0
web.app HTTP 200: PASS
web.app size: 93830 bytes (network) / 93863 bytes (local)
ETag .org: "32324de34322de13bfc4bda7758f7cab59f65e9638662d2d084ca32f9d7e2bbe"
ETag .ai:  "239153c2b6e5f9636a69997187eb73c04bfdf9ec5f73e919978c4ad492e65da1"
ETag split: CONFIRMED
FOUNDER ACTION REMAINING: Wire mnemosynec.ai custom domain in Firebase Console → Hosting → mnemosynec-ai-lianabanyan → Add custom domain → mnemosynec.ai
