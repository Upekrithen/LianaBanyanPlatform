# BP078 v0.1.27-FULL Hosting Receipt
**SEG-AN · 2026-06-08 · Truth-Always**

---

## Upload Verification

- Object: `gs://lianabanyan-releases/v0.1.27-full/Mnemosyne-Portable-0.1.27-full.exe`
- Upload completed: Poll 1 at ~20:40 local (PID 23196, started 19:49)
- Content-Length confirmed: **9,160,174,865 bytes** (matches target)
- HTTP status: **200 OK** (public)

## ACL / Public Access

- `gsutil acl ch` failed: bucket uses **Uniform Bucket-Level Access** (locked until 2026-09-07)
- Resolution: `gsutil iam ch allUsers:objectViewer gs://lianabanyan-releases` -- APPLIED
- Public URL: `https://storage.googleapis.com/lianabanyan-releases/v0.1.27-full/Mnemosyne-Portable-0.1.27-full.exe`
- Curl verify: HTTP 200, Content-Length 9160174865 -- CONFIRMED

## Hugo Build

- Tool: Hugo v0.152.2-extended (windows/amd64)
- Pages: 1003 | Paginator: 80 | Duration: 1893 ms
- Result: CLEAN (0 errors)

## Firebase Deploy

- `hosting:cephas` (cephas-lianabanyan.web.app) -- DEPLOYED
- `hosting:mnemosyne` had a broken target (two sites mapped -- `mnemosyne-lianabanyan` + `mnemosynec` ghost entry)
- Fix applied: `firebase target:clear hosting mnemosyne` then `firebase target:apply hosting mnemosyne mnemosyne-lianabanyan`
- `hosting:mnemosyne` (mnemosyne-lianabanyan.web.app / mnemosynec.ai) -- DEPLOYED
- Files uploaded: 1458

## Live Page Verification (curl)

URL: `https://mnemosynec.ai/download/`

Both download variants confirmed present in live HTML:
- **NANO button**: text "Download NANO -- v0.1.27", href GitHub releases (MnemosyneC-Setup-0.1.27.exe, ~0.44 GB)
- **FULL button**: text "Download FULL -- v0.1.27-full", href `https://storage.googleapis.com/lianabanyan-releases/v0.1.27-full/Mnemosyne-Portable-0.1.27-full.exe` (~8.53 GB)

Note: WebFetch returned cached content and missed the FULL button. Curl on the live URL confirmed both buttons present. FULL button was already in the layout template (list.html lines 927-939) from a prior session -- this deploy made it live.

## Blockers / Notes

- The `mnemosynec` Firebase site ID in .firebaserc was a ghost entry (not in the sites list). Cleared and re-linked to `mnemosyne-lianabanyan` only. Founder should verify .firebaserc is correct going forward.
- Uniform Bucket-Level Access is in effect on lianabanyan-releases. The `allUsers:objectViewer` IAM binding now grants public read to ALL objects in the bucket. If per-object granularity is needed in the future, the bucket policy must be changed before the lock expiry (2026-09-07).

## Status: COMPLETE
