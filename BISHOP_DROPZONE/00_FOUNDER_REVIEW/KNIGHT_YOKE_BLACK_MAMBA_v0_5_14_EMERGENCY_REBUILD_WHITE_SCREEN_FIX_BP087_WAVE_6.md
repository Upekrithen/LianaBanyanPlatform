# KNIGHT YOKE -- BLACK MAMBA v0.5.14 EMERGENCY REBUILD · WHITE SCREEN FIX · BP087 WAVE 6
**Status: BRICK WALL PRE-AUTHORIZED · Founder review optional · Bishop patch already committed**
**Commit: 990c428e702d007d2a070a864f281f893131339c**
**Date: 2026-06-20**

---

## GADGET-FIRST PREAMBLE (canon_bp063 + STATUTES §17)

Discovery / lookup of substrate state:
- pheromone_query, search_knowledge, consult_scribes, pearl_decode, brief_me

FORBIDDEN for discovery: bash grep, find, Glob, PowerShell, Select-String

Shell ALLOWED ONLY for: psql per §15, curl per §14 REST, git mechanical, build/copy/deploy

Use segs Sonnet 4.6 verbatim for all stream execution.

---

## CONTEXT

Bishop SEG-UUU applied the P0 white-screen fix in BP087 session.

Root cause (SEG-TTT diagnosed): `src/renderer/lib/supabase.ts` called `createClient` at module-load
time. Node.js 20 threw "no native WebSocket" in the Electron renderer. Static import chain crashed:
`CompaniesJoiningInTab + PreferenceInferencePanel + MnemosyneTabView + App.tsx + main.tsx` --
React root never mounted -- blank white window on M0 + M3.

Bishop already applied:
1. `src/renderer/lib/supabase.ts` -- full lazy-init Proxy pattern (WRITE tool, full replace)
2. `.env` at repo root -- VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY (gitignored)
3. `vite.renderer.config.ts` -- envDir: resolve(__dirname, '.') added so Vite finds repo-root .env
4. `package.json` -- version bumped 0.5.13 -> 0.5.14
5. `CHANGELOG.md` -- v0.5.14 entry prepended
6. Committed + pushed to main (990c428)

Knight's job: rebuild the installer + redeploy + verify.

---

## STREAM SEG-WS-1 · npm run dist:win BUILD

**Goal**: produce `MnemosyneC-Setup-0.5.14.exe` + `latest.yml` + `.blockmap`

**Pre-checks (gadget-first)**:
- Verify `package.json` version reads "0.5.14" (Read tool)
- Verify `src/renderer/lib/supabase.ts` has `getSupabase()` function and Proxy export (Read tool)
- Verify `.env` exists at repo root with VITE_ prefix keys (Bash: `python3 -c "..."` size/prefix check, NO value echo)
- Verify `vite.renderer.config.ts` has `envDir` line (Read tool)

**Build command (Bash, from repo root)**:
```
cd /c/Users/Administrator/Documents/LianaBanyanPlatform
npm run dist:win 2>&1 | tail -50
```

**Assert post-build**:
```
ls -la /c/Users/Administrator/Documents/LianaBanyanPlatform/release/0.5.14/MnemosyneC-Setup-0.5.14.exe
ls -la /c/Users/Administrator/Documents/LianaBanyanPlatform/release/0.5.14/latest.yml
ls -la /c/Users/Administrator/Documents/LianaBanyanPlatform/release/0.5.14/*.blockmap
```

Expect: exe > 80MB, latest.yml present, blockmap present.

Assert latest.yml advertises 0.5.14:
```
python3 -c "content=open(r'C:\Users\Administrator\Documents\LianaBanyanPlatform\release\0.5.14\latest.yml').read(); print('version_line_ok=', 'version: 0.5.14' in content)"
```

**If build fails on assert-supabase-anon-key**: verify `.env` has VITE_SUPABASE_PUBLISHABLE_KEY
(Bishop already created it; build script `scripts/assert-supabase-anon-key.mjs` reads VITE_ vars).

---

## STREAM SEG-WS-2 · SEG-A3 DEPLOY CHAIN

**Goal**: copy installer + latest.yml + .blockmap to Cephas, Hugo build, Firebase deploy

**Step 1 -- copy artifacts to Cephas download folder**:
```
cp /c/Users/Administrator/Documents/LianaBanyanPlatform/release/0.5.14/MnemosyneC-Setup-0.5.14.exe \
   /c/Users/Administrator/Documents/LianaBanyanPlatform/Cephas/cephas-hugo/static/download/

cp /c/Users/Administrator/Documents/LianaBanyanPlatform/release/0.5.14/latest.yml \
   /c/Users/Administrator/Documents/LianaBanyanPlatform/Cephas/cephas-hugo/static/download/

cp /c/Users/Administrator/Documents/LianaBanyanPlatform/release/0.5.14/*.blockmap \
   /c/Users/Administrator/Documents/LianaBanyanPlatform/Cephas/cephas-hugo/static/download/
```

**Step 2 -- Hugo build**:
```
cd /c/Users/Administrator/Documents/LianaBanyanPlatform/Cephas/cephas-hugo
hugo --config config-mnemosynec.toml
```

**Step 3 -- Firebase deploy hosting:mnemosyne**:
```
cd /c/Users/Administrator/Documents/LianaBanyanPlatform/Cephas/cephas-hugo
firebase deploy --only hosting:mnemosyne
```

**Step 4 -- 4-curl gadget-verify**:
```
curl -sI https://mnemosynec.ai/download/latest.yml | head -5
curl -sI "https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.14.exe" | head -5
curl -sI "https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.14.exe.blockmap" | head -5
curl -sI https://mnemosynec.ai/download/ | head -5
```

Expect: all 4 return HTTP 200 (or 302 with 200 on follow). No 404.

**Step 5 -- verify latest.yml content on live CDN**:
```
curl -s https://mnemosynec.ai/download/latest.yml | python3 -c "import sys; content=sys.stdin.read(); print('live_version_0514=', '0.5.14' in content)"
```

Expect: `live_version_0514= True`

---

## STREAM SEG-WS-3 · AUTO-UPDATE VERIFICATION

**Goal**: confirm v0.5.14 latest.yml is properly served + auto-update notifies peers within 4 hours

**Knight checks**:
1. Confirm live `latest.yml` at mnemosynec.ai/download/latest.yml contains `version: 0.5.14`
2. Confirm SHA512 in latest.yml matches the built .exe (electron-builder sets this automatically)
3. Confirm releaseDate in latest.yml is set to 2026-06-20

**Peer fast-path install**:
- M0 (confirmed running v0.5.13) -- Founder clicks "Update" when auto-update notification fires
- M3 (confirmed running v0.5.13) -- same
- Auto-update uses Squirrel-Windows via electron-updater; checks latest.yml every 4 hours at startup
- For immediate test: restart MnemosyneC on M0 -- it will check for updates on launch

**Knight receipt**:
Report back:
- SEG-WS-1: build GREEN/RED + exe size + latest.yml version confirmed
- SEG-WS-2: all 4 curl checks 200 GREEN/RED
- SEG-WS-3: live latest.yml version + releaseDate confirmed
- Peer update status: auto-update fired on M0/M3 or Founder manual confirm pending

---

## CONSTRAINTS

- Sonnet 4.6 only
- NO em-dashes anywhere in output
- SECRETS BLACKLIST BLOOD: NEVER echo any secret value. Subshell-scoped. unset at end. Prefix+length checks only.
- §14: gadget-verify each file state before edit
- §15: Knight rebuilds + redeploys -- Bishop already patched source
- Hooks BLOOD: do NOT use --no-verify
- LAN-AS-WAN topology: all relay traffic via relay.lianabanyan.com (never LAN-shortcut)
- Do NOT close with "For Alford"

---

## RETURN FORMAT

Structured receipt table:
| Stream | Operation | Status | Evidence |
|--------|-----------|--------|----------|
| SEG-WS-1 | npm run dist:win | GREEN/RED | exe size, latest.yml version |
| SEG-WS-2 | Firebase deploy | GREEN/RED | 4-curl HTTP codes |
| SEG-WS-3 | Live CDN verify | GREEN/RED | live latest.yml version + releaseDate |

Plus: commit hash confirmed, Knight yoke receipt line.
