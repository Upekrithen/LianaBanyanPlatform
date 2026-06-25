---
title: Substrate Awakens — 12 Readiness Sharps
session: BP086
date: 2026-06-18
status: WORKING — Founder review required
governance: EVENT-DRIVEN not time-driven. All 12 must be GREEN before go/no-go fires Saturday 2026-06-20.
---

# Substrate Awakens · 12 Readiness Sharps

**Canon anchor:** "We don't ship the lie of a clean event. We ship the reality of a clean event."

If any Sharp is RED on Saturday morning, the event slips ONE day — not gets faked. Founder call per Sharp is final. This checklist is gadget-verifiable (§14 BLOOD) — Bishop does NOT ask Founder to re-confirm state that can be probed live.

---

## SHARP 1 — Two-Receipt Sequence: Cross-Machine THUNDERCLAP published BEFORE T-0

| Field | Detail |
|---|---|
| **Owner** | Bishop + Founder |
| **What it requires** | v0.5.3 ships, 4-machine fleet connects at `tier='base'`, THUNDERCLAP receipt minted and published to `mnemosynec.ai/proofs/` BEFORE Saturday T-0 |
| **Current status** | AMBER — v0.5.3 hotfix yoke active (BP086). Single-node 68/70 receipt is in hand. Cross-machine THUNDERCLAP blocked on v0.5.3 peer_presence base-tier unblock. |
| **Blocker** | v0.5.3 not yet shipped. peer_presence still gates Realtime on membership JWT (per BP086 BP canon). |
| **Pre-event verification** | `curl https://mnemosynec.ai/proofs/` — confirm cross-machine THUNDERCLAP receipt listed. Peer_presence rows for all 4 machines visible in Supabase table viewer. |

**Why this is Sharp 1:** The event proves a cooperative mesh works. If we have not run it ourselves successfully first (cross-machine), we are staging a demo of unverified infrastructure. Truth-Always BLOOD makes this non-negotiable.

---

## SHARP 2 — v0.5.3 Binary Built, Installer Hosted, Auto-Update Live

| Field | Detail |
|---|---|
| **Owner** | Knight (build) + Bishop (verify) |
| **What it requires** | v0.5.3 installer at `mnemosynec.ai/download/` — Windows + Mac builds. Auto-update from v0.5.2 tested. Replicators who download pre-event get v0.5.3 minimum. |
| **Current status** | AMBER — v0.5.3 hotfix yoke in progress per active Knight yoke. Binary not yet published. |
| **Blocker** | Knight yoke must complete tier-aware peer_presence registration + anon-key Realtime channel fix. |
| **Pre-event verification** | `curl -I https://mnemosynec.ai/download/MnemosyneC-0.5.3-Setup.exe` returns 200. Existing v0.5.2 install auto-updates and shows "Connected (Base)" green dot in Pipeline tab. |

---

## SHARP 3 — `relay.lianabanyan.com` Health + 200 Ride-Through Plan

| Field | Detail |
|---|---|
| **Owner** | Founder (DNS / infrastructure) + Bishop (monitoring) |
| **What it requires** | `relay.lianabanyan.com` responds 200 throughout event window. Fallback plan documented and staged for graceful degradation if relay drops mid-event. |
| **Current status** | GREEN (per BP085 — relay confirmed live). Ride-through plan: event continues in distributed-eval mode; Founder acknowledges live on dashboard; peers run CLI plow against their shards; results email-relayed. |
| **Blocker** | None confirmed. Pre-event load test needed (see Sharp 12). |
| **Pre-event verification** | `curl -I https://relay.lianabanyan.com` — confirm 200. Run at T-24h and T-2h before event. |

---

## SHARP 4 — Supabase `peer_presence` Table Migration Applied + Custom Domain TXT Verified

| Field | Detail |
|---|---|
| **Owner** | Bishop (migration) + Founder (Supabase credential push for env vars) |
| **What it requires** | `peer_presence` schema live with BP086 8-field spec: `peer_id · email_hash · wan_soccerball_id · lan_addresses · relay_session_id · capabilities · last_seen_at · state`. Anon-key INSERT permitted for `tier='base'` rows. Supabase custom domain TXT verified. |
| **Current status** | AMBER — schema may need amendment for `tier` field (BP086 adds tier-awareness post BP084 mint). Bishop must gadget-verify current schema. |
| **Blocker** | `tier` column may not yet exist. `COMMENTS_HMAC_SECRET` env var deployment (Sharp 5) blocks final Thorax auth path. |
| **Pre-event verification** | `psql $SUPABASE_DB_URL -c "\d peer_presence"` — confirm `tier` column present. Anon INSERT test: `psql $SUPABASE_DB_URL -c "INSERT INTO peer_presence (peer_id, tier, state) VALUES ('test-probe', 'base', 'active')"` succeeds, then DELETE. |

---

## SHARP 5 — `COMMENTS_HMAC_SECRET` Deployed in Supabase Env Vars

| Field | Detail |
|---|---|
| **Owner** | Founder (credential action — Bishop cannot push secrets) |
| **What it requires** | `COMMENTS_HMAC_SECRET` set in Supabase Edge Function environment. Required for Thorax auth path on `wan-relay-publish`. |
| **Current status** | AMBER — listed as a pre-event Sharp in BP084 canon. Bishop cannot gadget-verify secret values (§4 BLOOD). Founder confirms deployed or not. |
| **Blocker** | Founder action required. |
| **Pre-event verification** | Founder: Supabase Dashboard → Edge Functions → Environment Variables → confirm `COMMENTS_HMAC_SECRET` present (value never shown). Bishop can test the function endpoint returns expected auth behavior, not the key itself. |

---

## SHARP 6 — Public Dashboard Live at `mnemosynec.ai/live/substrate-awakens/`

| Field | Detail |
|---|---|
| **Owner** | Knight (build) + Bishop (verify) |
| **What it requires** | Hugo page deployed. Three panels functional: Constellation Map (peer_presence + tier badges) · Live Ticker (last 20 events) · Replicator Roster. WebSocket subscription to Supabase Realtime on `peer_presence`. Auto-refresh every 5s fallback. Mobile responsive. Overhead copy: "Permission to Board — Granted. Grab an Oar. Help Make the Sails." |
| **Current status** | RED — page does not yet exist. Dashboard spec is deliverable 2 in this packet. Knight yoke required to build it. |
| **Blocker** | Knight build yoke not yet dispatched for dashboard. peer_presence schema must be GREEN (Sharp 4) before dashboard Realtime subscription can be wired. |
| **Pre-event verification** | `curl -I https://mnemosynec.ai/live/substrate-awakens/` returns 200. WebSocket connection test: open in browser, confirm Realtime events appear when a test peer row is inserted into peer_presence. |

---

## SHARP 7 — Watch-and-Replicate Kit Assembled + Hosted at `/live/substrate-awakens/kit/`

| Field | Detail |
|---|---|
| **Owner** | Bishop (assemble kit contents) + Knight (host it) |
| **What it requires** | Kit includes: v0.5.3 installer link · `setup-helper.ps1` preflight (Node/Ollama/gemma4:12b check) · "Join the live mesh as a peer" registration form (pseudonym + generates heartbeat token). |
| **Current status** | RED — kit page not yet assembled or hosted. |
| **Blocker** | v0.5.3 must ship (Sharp 2). Registration form requires Sharp 8. |
| **Pre-event verification** | `curl -I https://mnemosynec.ai/live/substrate-awakens/kit/` returns 200. Download link for installer resolves. `setup-helper.ps1` executes without error on clean Windows 11 + Mac environment. |

---

## SHARP 8 — Registration Form Live + Email Delivery Tested

| Field | Detail |
|---|---|
| **Owner** | Knight (build) + Founder (email domain confirm) |
| **What it requires** | Registration form: pseudonym input + email field (optional — email hash only at base tier) → generates one-time heartbeat token tied to email hash → confirmation email sent. Token grants `tier='base'` peer_presence row on app launch. |
| **Current status** | RED — form not yet built. BP086 base-tier canon (no payment required for base registration) simplifies this: no Stripe checkout for base. |
| **Blocker** | Knight build + email delivery service confirmed. |
| **Pre-event verification** | Submit test registration → confirm email received with heartbeat token → launch app with token → confirm "Connected (Base)" green dot in Pipeline tab → confirm peer_presence row created. |

---

## SHARP 9 — Live Event Question Bank (Fresh, Separate from Tonight's 1,400q)

| Field | Detail |
|---|---|
| **Owner** | Bishop (compose question bank) + Founder (ratify before T-0) |
| **What it requires** | Fresh question bank for Substrate Awakens event. NOT a replay of the 1,400q distributed-eval run. Replicators see original questions they have not run before. Bank must be formatted for plow-cli.js dispatch. Domain coverage: at minimum 5 domains, 50q each minimum. |
| **Current status** | RED — event-specific question bank not yet composed. |
| **Blocker** | Founder ratify required (§16 one-pass at end of composition cycle). |
| **Pre-event verification** | Question bank file present on M0 at canonical path. `plow-cli.js --bank event-substrate-awakens.json --dry-run` completes without error. Bank contains no overlap with 1,400q distributed-eval bank (Bishop runs diff). |

---

## SHARP 10 — Pre-Event Marketing Wave Assets Staged + Awaiting Founder Fire

| Field | Detail |
|---|---|
| **Owner** | Bishop (draft) + Founder (ratify and fire, per BP078 explicit-ratify-before-publish) |
| **What it requires** | Substack (FounderDenken) anchor post drafted · Medium cross-publish draft · Cephas banner + lianabanyan.com homepage event banner · HN "Show HN" post drafted · Reddit r/LocalLLaMA + r/MachineLearning posts drafted. All staged. NONE published until Founder explicit fire. |
| **Current status** | AMBER — existing SUBSTRATE_AWAKENS_MARKETING_WAVE dropzone folder present (per directory listing). Contents may include earlier drafts. Bishop must verify they incorporate BP086 base-tier framing ("free base, paid premium") and v0.5.3 requirement. |
| **Blocker** | Founder ratify + explicit fire. BP086 base-tier messaging must be woven in — any draft that implies paid membership required for participation is outdated and must be corrected before publish. |
| **Pre-event verification** | Founder reads each asset and fires explicitly. Bishop confirms no "join to participate" language survives in final copy. |

---

## SHARP 11 — Crow Feather "First Live Mesh · Substrate Awakens" Achievement + First-100 Roster Slot Registered

| Field | Detail |
|---|---|
| **Owner** | Bishop (schema + eblet) + Knight (register in achievements system) |
| **What it requires** | Achievement registered in cooperative achievements system. Crow Feather eblet schema ready to instantiate per replicator post-event. First-100 Founding-Replicator roster slot created (separate record from Crow Feather). 100 Marks issuance logic staged in cooperative ledger. |
| **Current status** | RED — achievement not yet formally registered. Eblet schema is deliverable 5 in this packet. |
| **Blocker** | Achievements system must have a CREATE path that Bishop or Knight can call. Marks ledger must be capable of a 100-Mark issuance per peer_id. |
| **Pre-event verification** | Test achievement issuance via probe: create one test Crow Feather record, confirm it is queryable, confirm it references event receipt placeholder. Delete test record. Marks ledger test issuance: +100 Marks to test peer_id, confirm balance, reverse. |

---

## SHARP 12 — Dashboard Dry-Run + Load Test Completed

| Field | Detail |
|---|---|
| **Owner** | Knight (run load test) + Bishop (review results) |
| **What it requires** | Simulate 50+ simultaneous replicators connecting to dashboard. Confirm: WebSocket survives concurrent connections · aggregate ticker math stays honest under load · failure-mode banners trigger correctly on simulated peer dropout · mobile layout holds · no sideways scroll on any viewport. |
| **Current status** | RED — dashboard (Sharp 6) must be GREEN first. Load test cannot run on a page that does not exist. |
| **Blocker** | Depends on Sharp 6 (dashboard live) + Sharp 4 (peer_presence schema). |
| **Pre-event verification** | Load test script runs 50 simulated WebSocket connections. All 50 appear in constellation map. Dropout simulation triggers offline indicator correctly. Ticker count stays accurate. Bishop reviews load test log and signs off. |

---

## Summary — Current Status at T-2

| Sharp | Title | Status | Owner |
|---|---|---|---|
| 1 | Cross-machine THUNDERCLAP receipt before T-0 | AMBER | Bishop + Founder |
| 2 | v0.5.3 binary + installer + auto-update live | AMBER | Knight |
| 3 | relay.lianabanyan.com health + ride-through plan | GREEN | Founder + Bishop |
| 4 | peer_presence migration + tier field + custom domain | AMBER | Bishop + Founder |
| 5 | COMMENTS_HMAC_SECRET deployed | AMBER | Founder |
| 6 | Dashboard live at /live/substrate-awakens/ | RED | Knight |
| 7 | Watch-and-Replicate kit hosted | RED | Bishop + Knight |
| 8 | Registration form live + email tested | RED | Knight + Founder |
| 9 | Fresh event question bank ratified | RED | Bishop + Founder |
| 10 | Marketing wave staged + awaiting Founder fire | AMBER | Bishop + Founder |
| 11 | Crow Feather + First-100 achievement registered | RED | Bishop + Knight |
| 12 | Dashboard dry-run + load test completed | RED | Knight + Bishop |

**GREEN: 1 · AMBER: 5 · RED: 6**

At T-2 today, 6 Sharps are RED. This is expected — the work sprint for T-1 and T-0 is exactly these 6. Bishop dispatches Knight yokes for Sharps 6, 7, 8, 11, 12 in sequence. Sharp 9 (question bank) Bishop drafts today. Founder actions required: Sharp 5 (secret deploy) + Sharp 10 (ratify and fire marketing) + Sharp 9 ratify.

**Event slip trigger:** Any Sharp still RED at Saturday T-0 = event slips to Sunday 2026-06-21. Founder call is final. Bishop does not manufacture a "clean event" from unverified infrastructure.

---

*BP086 · Sonnet 4.6 · Bishop SEG · §14+§16 BLOOD*
