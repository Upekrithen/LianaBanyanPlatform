# CEROSTECH DNS GATE — BP085
**Written by:** Knight (Sonnet 4.6 SEG)
**Date:** 2026-06-17
**Yoke:** CerosTechnology.com HTML Deploy

---

## Current Live State

| Property | Value |
|----------|-------|
| web.app URL (LIVE NOW) | **https://ceros-technology.web.app** |
| cerostechnology.com DNS | 199.36.158.100 (Squarespace — not yet Firebase) |
| cerostechnology.com HTTP | 200 (Squarespace serving) |

---

## DNS Records Founder Must Add
*(In Squarespace DNS console → cerostechnology.com)*

| Type | Host / Name | Value | TTL |
|------|-------------|-------|-----|
| `A` | `@` | `151.101.1.195` | Auto |
| `A` | `@` | `151.101.65.195` | Auto |
| `CNAME` | `www` | `ceros-technology.web.app.` | Auto |
| `TXT` | `@` | **Get from Firebase Console** (see below) | Auto |

### ⚠ TXT Verification Token
The TXT verification token is unique to this Firebase project and site. To get the exact token:
1. Go to [Firebase Console](https://console.firebase.google.com/project/lianabanyan-403dc/hosting)
2. Click **ceros-technology** hosting site
3. Click **"Add custom domain"**
4. Enter `cerostechnology.com`
5. Firebase shows the TXT record value — add it to Squarespace DNS

---

## Status
**WAITING ON FOUNDER DNS CONFIRMATION**

### Founder Action Required
1. Log into Squarespace DNS for `cerostechnology.com`
2. Remove or update the existing A record (currently 199.36.158.100)
3. Add both Firebase A records (`151.101.1.195` and `151.101.65.195`)
4. Add CNAME: `www` → `ceros-technology.web.app.`
5. Add TXT verification record (from Firebase Console — see above)
6. Wait 10–60 minutes for propagation
7. Return to Knight with "DNS confirmed" for SEG-6 live verification

---

## SEG-6 Status
**PENDING — DNS not yet pointing to Firebase**

*Knight will verify cerostechnology.com HTTP 200 + SSL + content once Founder confirms DNS propagation.*
