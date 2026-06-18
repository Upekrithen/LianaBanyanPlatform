# Yoke Return — I9.5 Deploy Fix · BP087

**Mission:** Fix half-shipped v0.5.8 deploy — Bishop §14 catch
**Agent:** Knight BP087 · Sonnet 4.6
**Completed:** 2026-06-18T23:12:31Z

---

## Artifact

**Path:** `Cephas/cephas-hugo/static/download/MnemosyneC-Setup-0.5.8.exe`
**Size:** 539,916,017 bytes ✓ (matches expected 539,916,017)

**SHA512 base64 (first 20 chars):** `1F2bfm5J8ckO+X5tyoVE...`
**Full SHA512 base64:** `1F2bfm5J8ckO+X5tyoVENU9rV8Ps5KZbhrLO0ldOZK6xHqv3kGF5ZnB7vi6dXk/sxyNRmvES4omVUSz0PAgtsA==`

---

## Deploy Commands Used (exact)

```powershell
# Step 1: Hugo build with mnemosynec config (populates public-mnemosynec/)
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"; hugo --minify --config config-mnemosynec.toml

# Step 2: Deploy only the mnemosyne hosting target (skips broken museum target)
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"; firebase deploy --only hosting:mnemosyne
```

**Deploy output summary:**
- `hosting[mnemosyne-lianabanyan]: found 235 files in public-mnemosynec`
- `uploading new files [0/2] → [2/2]` — only latest.yml + exe re-uploaded (hash dedup saved rest)
- `release complete` · exit code 0

---

## Four Curl Checks — ALL GREEN

### CHECK 1: mnemosynec.ai latest.yml
```
version: 0.5.8
files:
  - url: MnemosyneC-Setup-0.5.8.exe
    sha512: 1F2bfm5J8ckO+X5tyoVENU9rV8Ps5KZbhrLO0ldOZK6xHqv3kGF5ZnB7vi6dXk/sxyNRmvES4omVUSz0PAgtsA==
    size: 539916017
path: MnemosyneC-Setup-0.5.8.exe
sha512: 1F2bfm5J8ckO+X5tyoVENU9rV8Ps5KZbhrLO0ldOZK6xHqv3kGF5ZnB7vi6dXk/sxyNRmvES4omVUSz0PAgtsA==
releaseDate: '2026-06-18T00:00:00.000Z'
```
**RESULT: ✅ version: 0.5.8**

### CHECK 2: mnemosynec.org latest.yml
```
version: 0.5.8
files:
  - url: MnemosyneC-Setup-0.5.8.exe
    sha512: 1F2bfm5J8ckO+X5tyoVENU9rV8Ps5KZbhrLO0ldOZK6xHqv3kGF5ZnB7vi6dXk/sxyNRmvES4omVUSz0PAgtsA==
    size: 539916017
path: MnemosyneC-Setup-0.5.8.exe
sha512: 1F2bfm5J8ckO+X5tyoVENU9rV8Ps5KZbhrLO0ldOZK6xHqv3kGF5ZnB7vi6dXk/sxyNRmvES4omVUSz0PAgtsA==
releaseDate: '2026-06-18T00:00:00.000Z'
```
**RESULT: ✅ version: 0.5.8**

### CHECK 3: mnemosynec.ai installer HEAD
```
HTTP/1.1 200 OK
Content-Length: 539916017
Cache-Control: public, max-age=3600
Content-Disposition: attachment
Content-Type: application/octet-stream
Etag: "0bc6a7dc5e78ea679efb2a3a5c5a43fb7f63fa8758e2872a4dc33ba6eaf89ed1"
Last-Modified: Thu, 18 Jun 2026 23:10:51 GMT
X-Lb-Phase: release
X-Lb-Version: v0.2.0
X-Cache: HIT
```
**RESULT: ✅ HTTP 200 · 539,916,017 bytes**

### CHECK 4: mnemosynec.org installer HEAD
```
HTTP/1.1 200 OK
Content-Length: 539916017
Cache-Control: public, max-age=3600
Content-Disposition: attachment
Content-Type: application/octet-stream
Etag: "0bc6a7dc5e78ea679efb2a3a5c5a43fb7f63fa8758e2872a4dc33ba6eaf89ed1"
Last-Modified: Thu, 18 Jun 2026 23:10:51 GMT
X-Lb-Phase: release
X-Lb-Version: v0.2.0
X-Cache: HIT
```
**RESULT: ✅ HTTP 200 · 539,916,017 bytes**

---

## Root Cause Analysis

### Why the I9 download target didn't update

**Two-step failure:**

**Step 1 — Initial `firebase deploy` (all targets) failed on `museum` target:**
```
Error: Task 3ff6a6e6b9b298442e4b4d2b2adcf07b959400724d2de192236331e91ec9f452 failed:
retries exhausted after 6 attempts, with error:
The "paths[1]" argument must be of type string. Received undefined
```
This caused the full deploy to abort with exit code 1, preventing `mnemosyne` target from being reached.

**Step 2 — Follow-up `firebase deploy --only hosting:cephas,hosting:mnemosyne` (22:29 UTC):**
The deploy succeeded, but `public-mnemosynec/` at that time still contained the _old_ Hugo build output from before `latest.yml` was updated to v0.5.8. The `mnemosyne` target served `public-mnemosynec/` — which had `latest.yml` pointing to v0.5.7.

**Root cause chain:**
1. `static/download/latest.yml` was updated to v0.5.8 ✓
2. `hugo --minify` (default config) built `public/` correctly — v0.5.8 ✓
3. **`hugo --minify --config config-mnemosynec.toml` was NOT run** after updating latest.yml
4. `public-mnemosynec/download/latest.yml` remained at v0.5.7 from an older build
5. Deploy uploaded v0.5.7 `latest.yml` to `mnemosyne-lianabanyan` CDN
6. Live domains continued to serve v0.5.7

### Fix applied (I9.5)
1. Confirmed `static/download/latest.yml` = v0.5.8 (already correct)
2. Ran `hugo --minify --config config-mnemosynec.toml` → rebuilt `public-mnemosynec/` fresh
3. Confirmed `public-mnemosynec/download/latest.yml` = v0.5.8
4. Deployed `firebase deploy --only hosting:mnemosyne` (museum target excluded)
5. All 4 curl checks GREEN

---

## Ready to Signal Relaunch?

**YES — all 4 checks GREEN. v0.5.8 is live on both domains.**
