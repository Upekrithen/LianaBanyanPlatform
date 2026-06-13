# MnemosyneC Release Ship Checklist

**Canon rule established: BP079 / 2026-06-11 — Founder-ratified**

Every release of MnemosyneC (any version bump) MUST complete ALL steps below before the session is considered closed.

---

## EVERY TIME — Mandatory Ship Steps

### 1. Code + Build
- [ ] `package.json` version bumped (e.g. `0.1.45` → `0.1.46`)
- [ ] `npm run dist:win` clean exit (installer produced in `release/`)
- [ ] SHA-256 and SHA-512 computed from installer file

### 2. GitHub Release
- [ ] `gh release create vX.X.XX --draft ...` with installer uploaded
- [ ] Verify SHA-256 confirmed by GitHub on asset ingest
- [ ] After clean-machine verify GREEN: `gh release edit vX.X.XX --draft=false`

### 3. Cephas Hugo Site (`cephas.lianabanyan.com`) — EVERY TIME
- [ ] `Cephas/cephas-hugo/data/version.json` — `version` + `filename` updated
- [ ] `Cephas/cephas-hugo/static/download/latest.yml` — copied from `release/latest.yml`
- [ ] `Cephas/cephas-hugo/public/download/latest.yml` — copied from `release/latest.yml`
- [ ] `Cephas/cephas-hugo/content/download/_index.md` — download link URL + SHA-256 updated
- [ ] `Cephas/cephas-hugo/firebase.json` — ALL `X-LB-Version` and `X-LB-Build-Hash` headers bumped to new version + commit hash
- [ ] `hugo --minify` in `Cephas/cephas-hugo/`
- [ ] `firebase deploy` in `Cephas/cephas-hugo/` (deploys cephas + mnemosyne + museum targets)

### 4. MnemosyneC.ai Site (`mnemosyne-lianabanyan` target) — EVERY TIME
- [ ] Deployed automatically as part of step 3 (`firebase deploy` covers all three targets)
- [ ] Verify `mnemosyne-lianabanyan: release complete` in deploy output
- [ ] The `mnemosyne` target redirects `/` → `/download/` — same Hugo public/ as Cephas

### 5. Commit + Push
- [ ] All Cephas changes committed inside `Cephas/cephas-hugo/` submodule
- [ ] Submodule pointer updated in parent repo (`git add Cephas`)
- [ ] Both pushed to origin

### 6. Yoke-return
- [ ] `## RESPONSE` block appended to the Knight prompt file for the session
- [ ] GitHub Release URL included
- [ ] Cephas + MnemosyneC.ai deploy confirmed

---

## firebase.json Header Pattern (update BOTH occurrences every release)

```json
{"key": "X-LB-Version", "value": "vX.X.XX"},
{"key": "X-LB-Build-Hash", "value": "vX.X.XX+<short-commit-hash>"},
```

Appears twice in `firebase.json`: once under `cephas` target, once under `mnemosyne` target.
Both must be updated. Use `git rev-parse --short HEAD` for the commit hash.

---

*Established BP079, 2026-06-11. Founder directive: "EVERY TIME — that is the real basis."*
*Knight (Sonnet 4.6) authored. Push to KNIGHT_DROPZONE for persistence.*
