# MNEMOSYNEC_ORG_DNS_GATE_BP085

**Status: GATE CLEARED — DNS already active. No Founder action required.**

---

## DNS Probe Results (2026-06-18)

Both mnemosynec.org and mnemosynec.ai are already pointing to Firebase Hosting (`199.36.158.100`). The domains are already connected as custom domains to the `mnemosyne-lianabanyan` Firebase Hosting site.

| Domain | Type | Value | TTL | Status |
|--------|------|-------|-----|--------|
| mnemosynec.org | A | 199.36.158.100 | 1800 | ✅ ACTIVE |
| mnemosynec.ai | A | 199.36.158.100 | 1800 | ✅ ACTIVE |

---

## What This Means

The DNS gate that the Yoke anticipated needing Founder action for is already cleared. Both domains resolve to Firebase infrastructure, both are confirmed to serve identical mnemosynec site content (59207 bytes, HTTP 200 on all paths).

---

## If DNS Ever Needs to Be Re-Pointed (Reference Only)

Standard Firebase Hosting DNS records for mnemosynec.org would be:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 151.101.1.195 | 3600 |
| A | @ | 151.101.65.195 | 3600 |
| CNAME | www | mnemosyne-lianabanyan.web.app. | 3600 |
| TXT | @ | [Firebase verification token — from Console custom domain wizard] | 3600 |

> TXT verification token is obtained from:
> https://console.firebase.google.com/project/lianabanyan-403dc/hosting
> → Add custom domain → mnemosynec.org → copy the displayed TXT token

**The current active IP `199.36.158.100` is the Firebase legacy IP. If Firebase instructs using the 151.101.x.x IPs, use those. The current records are working — do not change unless Firebase console reports a custom domain verification issue.**

---

*BP085 · Knight (Cursor) · Sonnet 4.6 · 2026-06-18*
