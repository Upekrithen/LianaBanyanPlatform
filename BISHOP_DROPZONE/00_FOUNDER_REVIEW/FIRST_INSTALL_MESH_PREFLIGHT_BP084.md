---
title: "First-Install Live Mesh — Preflight Checklist · BP084"
date: 2026-06-16
session: BP084
model: "Sonnet 4.6"
---

# 🚀 First-Install Live Mesh — Preflight Checklist
## BP084 · Knight (Sonnet 4.6) · June 16, 2026

> **Knight cannot do F1-F6. These are Founder-only actions.**
> Do all of these BEFORE Knight can run SEG-1 on M0.

---

## 🔴 F-Actions — Founder Must Complete Before SEG-1

| # | Action | Where | Status | Est. Time |
|---|---|---|---|---|
| **F1** | Squarespace DNS → fix `_acme-challenge.relay` TXT record. The name must be `_acme-challenge.relay` NOT `_acme-challenge.relay.lianabanyan.com` (Bishop diagnosed this morning). Drop the `.lianabanyan.com` suffix — Squarespace appends the domain automatically. | Squarespace DNS panel | ⬜ PENDING | 30 sec |
| **F2** | Supabase Dashboard → Settings → Custom Domains → `relay.lianabanyan.com` → click "Verify". Dialog should turn GREEN after F1 propagates (~1–5 min). | app.supabase.com → lianabanyan-403dc | ⬜ PENDING | 1 min after F1 |
| **F3** | Supabase SQL Editor → paste full contents of `platform/supabase/migrations/20260615000001_peer_presence.sql` → Run. Creates `peer_presence` and `wan_relay_routed` tables. | app.supabase.com → SQL Editor | ⬜ PENDING | 2 min |
| **F4** | Supabase SQL Editor → paste full contents of `platform/supabase/migrations/20260616000002_substrate_awakens.sql` → Run. Creates `substrate_awakens_registrations`, `substrate_awakens_replicators`, and `peer_presence` (merged). | app.supabase.com → SQL Editor | ⬜ PENDING | 2 min |
| **F5** | Supabase Dashboard → Edge Functions → Secrets → confirm `COMMENTS_HMAC_SECRET` is set. (Per BP084 earlier — already done. Just verify it's still there.) | app.supabase.com → Edge Functions → Secrets | ⬜ VERIFY | Already done |
| **F6** | Supabase Dashboard → Database → Replication → Tables → enable Realtime on: `peer_presence` AND `substrate_awakens_registrations`. | app.supabase.com → Database → Replication | ⬜ PENDING | 1 min |

**⚠️ F3 note:** The two migrations both create `peer_presence` — run F3 first, then F4. The `CREATE TABLE IF NOT EXISTS` guard prevents double-create, but F4 adds more fields. Run them in order.

---

## 🔴 CRITICAL PRE-FLIGHT FINDING: v0.5.0 Binary Not Built

**Knight has confirmed:**
- `package.json` version: `0.5.0` ✅ (source is correct)
- Latest binary on disk: `MnemosyneC-Setup-0.4.3.exe`
- **No `MnemosyneC-Setup-0.5.0.exe` or `.sha256` found anywhere in workspace**
- Latest release artifacts: `release/v0147_release_notes.md`

**This means:** The yoke says "download v0.5.0 from mnemosynec.ai" but **v0.5.0 has not been built yet.** There is nothing to download.

**Founder action needed (F0 — before all other F-actions):**

| # | Action | Command |
|---|---|---|
| **F0** | Build v0.5.0 binary from source | `cd C:\Users\Administrator\Documents\LianaBanyanPlatform; npm run dist:win` |

This runs the full build + electron-builder pipeline. Takes ~10-20 minutes. Produces `MnemosyneC-Setup-0.5.0.exe` in `dist/` or `release/`.

After build completes, Knight can upload to mnemosynec.ai and SEG-1 can proceed.

**Alternative:** Knight can run the SEG-3 Join Live Event UI work FIRST (code changes), then Founder builds v0.5.0 with the new UI already included. This is the recommended order — build AFTER Knight lands the Join Live Event changes.

---

## ✅ What's Already Ready (Knight Confirmed)

| Component | Status |
|---|---|
| `wan-relay-publish` Edge Function | ✅ Written, handles peer_presence upsert |
| `register-SubstrateAwakens` Edge Function | ✅ Written, generates HMAC token, sends email |
| `peer_presence` migration SQL (F3) | ✅ Exists at canonical path |
| `substrate_awakens` migration SQL (F4) | ✅ Exists at canonical path |
| LAN/WAN relay infrastructure in app | ✅ `relay-client.ts`, `wan_escalation.ts`, `community-connect.ts` all present |
| RAM tier detection | ✅ `ram_detector.ts` — auto-detects lightweight/standard/premium/heavy |
| App version in package.json | ✅ `0.5.0` |

## ❌ What's Missing (Knight Is Building Now)

| Component | Status |
|---|---|
| Join Live Event IPC handlers | 🔄 Building (SEG-3 subagent) |
| Join Live Event UI panel | 🔄 Building (SEG-3 subagent) |
| SEG-2 relay smoke test script | 🔄 Building (SEG-2 subagent) |
| v0.5.0 binary | ❌ NOT BUILT — requires `npm run dist:win` |
| relay.lianabanyan.com TLS verified | ❌ Blocked on F1+F2 |
| peer_presence table in production | ❌ Blocked on F3+F4 |

---

## Recommended Sequence

```
F0: npm run dist:win  ← Build v0.5.0 (10-20 min, start now)
          ↓
F1: Fix Squarespace DNS (_acme-challenge.relay — 30 sec)
F2: Verify relay.lianabanyan.com in Supabase (1 min after F1)
F3: Run peer_presence migration (2 min)
F4: Run substrate_awakens migration (2 min)
F5: Verify COMMENTS_HMAC_SECRET is set
F6: Enable Realtime on both tables (1 min)
          ↓
SEG-1: Install v0.5.0 on M0 (5 min)
SEG-2: Run relay smoke test script
SEG-3: Verify Join Live Event UI works
          ↓
SEG-4: Install on M1/M2/M3 (5-line card each)
SEG-5: Send sons the 5-line card
SEG-6: Run distributed plow with all 6 peers
```

---

*Knight (Sonnet 4.6) · BP084 · 2026-06-16*
