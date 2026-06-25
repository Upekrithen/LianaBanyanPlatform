# CEROSTECH LIVE VERIFY — SEG-6 · BP085
**Agent:** Sonnet 4.6
**Date:** 2026-06-17 (23:00 UTC-5)
**Yoke:** KNIGHT_YOKE_CEROSTECHNOLOGY_HTML_DEPLOY_BP085

---

## Sharps Table

| Sharp | Condition | Status |
|-------|-----------|--------|
| S5 | cerostechnology.com HTTP 200 + valid SSL | **GREEN** |
| Content: Permission to Board | present | **PASS** |
| Content: NOID | present | **PASS** |
| Content: 97.1 | present | **PASS** |
| Content: 5/year | present | **PASS** |
| Content: 2260 | present | **PASS** |
| S3b | No overflow-x | **PASS** |
| S6b | Viewport meta | **PASS** |

---

## Step 1 — HTTP Status

```
HTTP status: 200
Content-Length: 107024 bytes
```

**Result: GREEN — HTTP 200**

---

## Step 2 — SSL Check

```
IPv4: 199.36.158.100
TLS connection: ESTABLISHED (no error)
ALPN: curl offers http/1.1 → server accepted http/1.1
Strict-Transport-Security: max-age=31536000; includeSubDomains  ← HSTS present
```

SSL connection established successfully. HSTS header confirms valid HTTPS.
Windows schannel (SChannel) validated the certificate via Windows cert store — no errors or warnings.

**NOTE:** Resolved IP is `199.36.158.100` — Squarespace/Fastly CDN (not Firebase IPs 151.101.1.195 / 151.101.65.195).
Response headers `X-Served-By: cache-dfw-kdfw8210065-DFW`, `X-Cache: HIT`, `Vary: x-fh-requested-host` confirm Squarespace Fastly is the serving infrastructure.

**Conclusion:** cerostechnology.com is live over HTTPS with correct Firebase HTML content — served via Squarespace CDN, not Firebase direct. DNS has NOT yet been switched to Firebase A records. However, S5 passes because HTTP 200 + valid SSL + correct content are all confirmed.

**Result: GREEN** (site live, SSL valid, content correct — serving infra is Squarespace, not Firebase)

---

## Step 3 — Content Verification (5 Mandatory Literals)

```
PASS: Permission to Board
PASS: NOID
PASS: 97.1
PASS: 5/year
PASS: 2260
```

All 5 mandatory literals confirmed present.

**Result: ALL 5 PASS**

---

## Step 4 — No Horizontal Scroll Check

```
S3b PASS: no overflow-x
```

No `overflow-x: scroll` or `overflow-x: auto` found in source HTML.

**Result: PASS**

---

## Step 5 — Mobile Viewport Meta Check

```
S6b PASS: viewport meta present
```

`<meta name="viewport" content="width=device-width ...">` confirmed.

**Result: PASS**

---

## Step 6 — web.app URL Comparison

```
web.app HTTP: 200
```

`https://ceros-technology.web.app` also returns HTTP 200. Firebase deploy is live and healthy on web.app URL.

---

## Step 7 — Stripe Key Advisory Check (Non-blocking)

```
INFO: No pk_live_ hardcoded — modals depend on Edge Function
```

No `pk_live_` key embedded in source HTML. Stripe integration routes through Edge Function.

---

## Full Response Headers (from curl.exe -vI)

```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 107257
Cache-Control: max-age=3600
Content-Type: text/html; charset=utf-8
Etag: "b7fafc4d32ff48f11a2b3d2c7a1e46d6b418eccf3a9109787bf12019309d4336"
Last-Modified: Thu, 18 Jun 2026 03:20:43 GMT
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Accept-Ranges: bytes
Date: Thu, 18 Jun 2026 04:00:36 GMT
X-Served-By: cache-dfw-kdfw8210065-DFW
X-Cache: HIT
X-Cache-Hits: 1
Vary: x-fh-requested-host, accept-encoding
alt-svc: h3=":443";ma=86400,h3-29=":443";ma=86400,h3-27=":443";ma=86400
```

---

## DNS / Serving Infrastructure Note

The site is live and serving the correct Firebase HTML — but through **Squarespace's Fastly CDN** (199.36.158.100).
Firebase hosting A records (151.101.1.195 / 151.101.65.195) have **not** yet replaced the Squarespace A records in DNS.

Two possible explanations:
1. Founder uploaded the Firebase HTML directly to Squarespace (the Squarespace CMS is now serving the new file)
2. DNS cutover to Firebase is still pending

Either way — **S5 is GREEN** because the user experience test passes: site loads, HTTPS works, content is correct.

If Founder wants full Firebase hosting path (direct Firebase CDN, Firebase console analytics, Firebase deploy pipeline as sole source of truth), the DNS A records should be updated to Firebase IPs per the `CEROSTECH_DNS_GATE_BP085.md` table.

---

## SEG-6 Summary

| Test | Result |
|------|--------|
| HTTP 200 | **GREEN** |
| SSL valid | **GREEN** (HSTS present, TLS established, no errors) |
| All 5 content literals | **GREEN** |
| No overflow-x | **PASS** |
| Viewport meta | **PASS** |
| web.app | **200 OK** |
| Stripe pk_live_ in HTML | **NONE** (clean) |

**S5 STATUS: GREEN**

---

*Knight (Sonnet 4.6 · BP085) · SEG-6 · 2026-06-17*
