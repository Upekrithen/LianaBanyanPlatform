---
title: Replicator Onboarding Flow — Substrate Awakens
session: BP086
date: 2026-06-18
status: DRAFT — Founder ratify before publish
canonical_url: mnemosynec.ai/live/substrate-awakens/
---

# Replicator Onboarding Flow · Substrate Awakens · 2026-06-20

**Who this is for:** Anyone who wants to BE in the mesh, not just watch it. You run a live shard on your machine. Your results become part of the receipt. Your name goes on the ledger permanently.

**Base tier is free.** You do not need a paid membership to participate. You download the app, connect, run. That is the whole gate.

---

## Before the Event (T-3 through T-1)

### Step 1 — Visit the kit page

`mnemosynec.ai/live/substrate-awakens/kit/`

The kit page has everything. Do not hunt for pieces across the site. It is all there.

### Step 2 — Run the preflight check

Download `setup-helper.ps1` (Windows) or `setup-helper.sh` (Mac/Linux).

Run it. It checks:
- Node.js 18+ installed
- Ollama installed and running
- `gemma4:12b` model pulled (or `gemma2:2b` if you have under 8 GB RAM)
- Available disk space (min 15 GB for gemma4:12b)
- Network: outbound HTTPS to `relay.lianabanyan.com` reachable

The script outputs a preflight receipt: `PASS / FAIL` per item. Fix any FAIL before the event. If you cannot fix it, `gemma2:2b` is an accepted fallback — your results will be tagged as `gemma2:2b` tier in the receipt.

### Step 3 — Download MnemosyneC v0.5.3 or later

Download the installer from the kit page. Run it. Launch the app.

If you already have MnemosyneC installed, auto-update will pull v0.5.3. Confirm your version shows 0.5.3 or later in the top menu bar.

### Step 4 — Register your spot (optional but recommended)

Registration page on the kit page. Two fields:
- Pseudonym (optional — leave blank for "Peer [auto-ID]")
- Email (optional — used only to deliver your heartbeat token and post-event Crow Feather)

Submit. You receive a one-time heartbeat token by email (if you provided one). The token ties your machine to your pseudonym on the event roster.

If you skip registration entirely, you can still participate on event day — you will join as an anonymous base peer. You will still earn the Crow Feather if you complete a shard, but you will need to claim it later by proving peer_id ownership. Registration makes this automatic.

### Step 5 — Confirm "Connected (Base)" in the Pipeline tab

Open MnemosyneC. Go to the Pipeline tab. Confirm the status dot is green and reads "Connected (Base)" or "Connected (Member)" if you have a paid membership.

If it reads "Disconnected" or shows an error, check:
- Ollama is running (`ollama list` in terminal — should show your model)
- Outbound HTTPS to relay.lianabanyan.com is not blocked by firewall
- You are on v0.5.3 minimum (earlier versions had a connection gate at base tier — they will not connect)

The app does not need to run between registration and the event. Close it after confirming the connection. Relaunch on event day.

---

## Event Day — T-0

The event fires on Saturday 2026-06-20. It is event-driven, not time-driven. The dashboard at `mnemosynec.ai/live/substrate-awakens/` will show a LIVE banner when it begins. There is no scheduled time — watch the dashboard.

### Step 6 — Watch the dashboard

Open `mnemosynec.ai/live/substrate-awakens/` in your browser. The page is live before the event begins, showing the constellation in STANDBY state. Watch for the LIVE banner.

You do not need to refresh. The page is WebSocket-subscribed — it updates itself.

### Step 7 — Launch MnemosyneC when the LIVE banner appears

Open MnemosyneC. The Pipeline tab will show a banner:

**"Substrate Awakens — ready to participate."**

Click "Participate." The app:
1. Sends your Thorax heartbeat to `relay.lianabanyan.com`
2. Registers your peer in `peer_presence` as `tier='base'` (or `tier='member'`)
3. Receives a shard assignment from the MIC Conductor on M0 — one domain from the live event question bank
4. Your shape appears on the dashboard constellation map

### Step 8 — Run your shard

The app runs the shard automatically via Ollama on your machine. You do not need to do anything. The Pipeline tab shows:

- Domain name
- Progress: questions completed / total
- Live accuracy percentage
- Quarantine count (questions the Andon-Cord flagged as uncertain — this is normal and expected)

Let it run. Do not close the app mid-run. If your machine loses connection mid-run, the partial results are saved. The MIC Conductor will handle partial receipts gracefully — your contribution is not lost.

### Step 9 — Watch your results appear on the dashboard

As your shard runs, the Live Ticker on the dashboard updates in real time. When your run completes, the Replicator Roster shows your status as "Complete."

---

## After the Event

### Step 10 — Receipt published to the cooperative ledger

Within 24 hours of the event, the full receipt is published at `mnemosynec.ai/proofs/`. The receipt includes per-peer results, aggregate scores, quarantine counts, and your permanent attribution entry.

### Step 11 — Crow Feather delivered

If you provided an email during registration, your Crow Feather arrives by email:

**"First Live Mesh · Substrate Awakens"**

The Crow Feather eblet is permanently stored in the cooperative ledger. It references:
- Your pseudonym or peer_id
- The event receipt
- Your tier at participation (BASE or MEMBER — both earn the Feather)
- Your shard domain and completion status

### Step 12 — 100 Marks credited

100 Marks are credited to your cooperative account. If you do not yet have a cooperative account (base tier), the Marks are held in reserve against your peer_id. They activate when you upgrade to paid membership — they do not expire.

### Step 13 — First-100 Founding-Replicator status (if applicable)

The first 100 Replicators who complete a shard earn First-100 Founding-Replicator status. This is a separate permanent badge from the Crow Feather. It is recorded on the cooperative ledger and never removed.

**How you know if you made it:** The dashboard shows the live First-100 counter. If your name appears in the Roster while the counter is below 100, you are in.

---

## If Something Goes Wrong

**"Connected (Base)" shows but shard never assigns:**
The MIC Conductor may be at capacity in that moment. Wait 60 seconds and click "Participate" again. If still no shard after 3 attempts, post in the cooperative channel — Bishop monitors it during the event.

**App crashes mid-shard:**
Relaunch and click "Participate" again. The Conductor will re-assign your shard from where it left off if the partial result was received. If it assigns a fresh shard, run it — two completed shards count as two contributions.

**Relay fails mid-event:**
The dashboard will show a "Relay degraded — distributed mode active" banner. The app switches to CLI plow mode automatically. Your shard continues running locally. Results are captured and will be relay-merged after relay recovery. This scenario is documented in the event graceful failure canon — it is not a failure of the cooperative; it is the cooperative being honest about infrastructure.

**You cannot participate on Saturday:**
Sunday 2026-06-21 is the slip day. If the event slips, the DELAYED banner appears on the dashboard. Same onboarding flow applies.

---

## What You Are Part Of

You are not using a product. You are running a node in a cooperative mesh that did not exist before this run.

The receipt from this event will be public, permanent, and verifiable. Your peer_id will be in it. If your Andon-Cord quarantined some answers, that is in the receipt too — visible, not hidden. The cooperative pays its critics and trusts its peers to run honestly. That is the whole design.

Free base. Paid premium. Both real.

---

*BP086 · Sonnet 4.6 · Bishop SEG · Replicator onboarding flow for Founder ratify*
