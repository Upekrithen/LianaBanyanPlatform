# KNIGHT YOKE · First-Install Live Mesh Empirical Test · BP084

**Session:** BP084 (afternoon continuation)
**Date:** 2026-06-16
**Founder ratify:** DIRECT — *"MAKE MESH WORK from the download. From the first install. I have two sons that live remotely to test it on. ... let's prove it with the 3 machines on my same LAN NOW ... The local lan ones can still use the WAN setup, like if one of them was serving a website as a server, and the other one went out to the outside net to find the url and connect to it. So we can test WAN on those as well, right?"*

**Goal:** A new user downloads MnemosyneC v0.5.0, runs the installer, and within ~5 minutes is on the live cooperative mesh — heartbeat-attested, MIC-discovered, receiving a shard. Zero PowerShell. Zero Node install. Zero USB stick. Zero "did you remember to..." instructions.

The 3 LAN boxes (M1/.64, M2/.45, M3/.156) test this path FIRST — and because every peer publishes/resolves via `relay.lianabanyan.com`, the LAN test IS a real WAN test. Each LAN box's traffic goes out to Supabase and back, identical to what Founder's two remote sons will experience.

---

## 🩸 HARD BINDING — Sonnet 4.6 SEGs only

**USE Sonnet 4.6 SEGs FOR ALL WORK. DO NOT USE COMPOSER 2.5 OR ANY OTHER MODEL.**

Every SEG `model: 'sonnet'`. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## Founder action checklist (Knight cannot do these)

These MUST be GREEN before Knight starts SEG-1 — they unblock everything downstream:

| # | Action | Status to verify | Estimated time |
|---|---|---|---|
| F1 | Squarespace DNS — fix `_acme-challenge.relay` TXT name (drop `.lianabanyan.com` suffix) | Bishop already diagnosed (this morning's chat) | 30 sec |
| F2 | Supabase Dashboard → Custom Domain `relay.lianabanyan.com` → Verify | Dialog turns GREEN | 1 min after F1 propagates |
| F3 | Supabase SQL Editor → paste contents of `platform/supabase/migrations/20260615000001_peer_presence.sql` | Table `peer_presence` exists in production | 2 min |
| F4 | Supabase SQL Editor → paste contents of `platform/supabase/migrations/20260616000002_substrate_awakens.sql` | Table `substrate_awakens_registrations` exists | 2 min |
| F5 | Supabase Dashboard → Edge Functions → Secrets → confirm `COMMENTS_HMAC_SECRET` is set (canonical, reused for heartbeat) | Set | already done per BP084 earlier |
| F6 | Supabase Dashboard → Database → Replication → enable Realtime on both new tables | Both tables have Realtime ON | 1 min |

If any F-action is RED, Bishop holds the yoke and surfaces. Knight does not begin SEG-1 until all F-actions are GREEN.

---

## SEG-1 — Smoke test the actual binary on M0 (Sonnet 4.6 SEG)

The v0.5.0 binary is built and uploaded to mnemosynec.ai. But **"code committed" ≠ "real packets flowing."** Knight's first job is to actually install it on M0 (fresh, side-by-side with current v0.4.3 install) and observe the empirical behavior.

Steps:
1. Download `MnemosyneC-Setup-0.5.0.exe` from `https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.0.exe`
2. Install it (use a SEPARATE profile if possible, e.g., `%APPDATA%/mnemosynec-test/` — don't pollute the canonical profile)
3. On first launch, observe what happens:
   - Does it show an onboarding screen?
   - Is there a "Join the Live Mesh" / "Join Substrate Awakens" CTA?
   - Does it publish a heartbeat to relay.lianabanyan.com?
   - Capture: screenshots + the first 60s of `server.log` + the first 60s of network traffic to `*.supabase.co` and `relay.lianabanyan.com`

Truth-Always: Knight reports what it ACTUALLY observed, not what it expected. If the install hangs or the UI is broken, that's an HONEST RED.

If onboarding doesn't surface the "Join the Live Mesh" path at all, Knight stops and flags `UI_GAP` for SEG-3.

---

## SEG-2 — Verify the relay endpoint actually responds to a real heartbeat (Sonnet 4.6 SEG)

Independent of the desktop app, write a small standalone Node script that:
- POSTs a synthetic heartbeat to `https://relay.lianabanyan.com/functions/v1/wan-relay-publish` (or whatever the canonical relay URL is post-CNAME)
- Includes the canonical HMAC signature using `COMMENTS_HMAC_SECRET` per the heartbeat enforcement canon
- Expects 200 OK + presence row inserted into `peer_presence`

Run it from M0. Then run it from a different network if possible (Knight's cloud, Founder's phone hotspot — whatever Knight has).

**Acceptance:** the same script run from two different network identities both succeed, AND the resulting `peer_presence` rows both show up via a quick `select * from peer_presence` query (against a SEG-3 dump endpoint OR via Bishop's psql access if Founder gives Bishop `SUPABASE_DB_URL` per yesterday's offer).

If the relay endpoint returns 401/403 because Thorax encryption is missing, fix or document.

---

## SEG-3 — Fix the "Join the Live Mesh" first-launch UI gap if SEG-1 surfaced it (Sonnet 4.6 SEG)

If the v0.5.0 install doesn't show a clean "Join Live Mesh" path on first launch:

- The Substrate Awakens registration form lives at `mnemosynec.ai/live/SubstrateAwakens/register/`
- The desktop app should have an in-app Settings → Constellation tab with a "Join Live Event" or "Join Cooperative Mesh" button that:
  - Asks: *"Email?"* (single field)
  - On submit → opens browser to the register page with email pre-filled OR registers via direct API call
  - Receives the one-time heartbeat token via email
  - User pastes the token back into the app
  - App handshakes to relay.lianabanyan.com → peer_presence row appears → constellation dashboard shows new peer

Knight wires whatever's missing. Includes:
- Settings UI surface
- Token paste field
- Handshake error handling (with visible feedback per BP078 every-click-feedback canon)
- "Connected to live mesh as [display_name]" confirmation

If the registration form needs an additional `display_name` field, add it.

---

## SEG-4 — Empirical proof on the 3 LAN boxes (Sonnet 4.6 SEG)

After SEG-1, SEG-2, SEG-3 are GREEN, install MnemosyneC v0.5.0 on:
- M0 (Founder's machine, 64 GB) — already installed via SEG-1
- M1 (.64, 16 GB)
- M2 (.45, 32 GB)
- M3 (.156, 32 GB)

For each LAN box, Knight gives Founder a 5-line install card:
```
1. Open browser → https://mnemosynec.ai/download/
2. Click "Download for Windows v0.5.0"
3. Run the installer
4. Launch MnemosyneC → Settings → Constellation → Join Live Mesh
5. Enter your email → paste the token from email → DONE
```

Critically: **NO Node install. NO PowerShell. NO USB stick. NO shard JSON files.** If any of those become necessary, the yoke is RED — go back to SEG-3 and fix the install flow until it's the 5 lines above.

After all 4 LAN boxes are installed + joined:
- The dashboard at `mnemosynec.ai/live/SubstrateAwakens/` shows 4 peers
- Each peer's `peer_presence` row shows capabilities (RAM tier, model, version)
- Each peer is reachable via relay (test by sending a synthetic dispatch from M0 → M1 — observe it land)
- Bonus: the LAN auto-discovery (UDP 7475) ALSO finds the same peers, populating the same constellation map — but the WAN path is what's being tested

---

## SEG-5 — Send Founder's two remote sons the 5-line card (Sonnet 4.6 SEG)

Once LAN boxes show GREEN on dashboard:
- Knight composes a short email Founder forwards to his two sons
- Each son: same 5-line card from SEG-4
- Both sons appear on dashboard within ~5 min of install
- That's the WAN proof — and the empirical receipt for the cooperative mesh

If either son hits friction, Knight observes from the dashboard (no peer presence row → install didn't reach handshake) and Founder pings Bishop with screenshot of son's error message.

---

## SEG-6 — Run a real distributed plow via MIC (Sonnet 4.6 SEG)

Once 6 peers are on the mesh (M0 + 3 LAN + 2 sons), Founder triggers a real MIC plow via the UI:
- M0 acts as Conductor
- MIC dispatcher partitions the 1,400-question bank capability-aware
- Shards stream to each peer via relay
- Results stream back via relay
- Dashboard shows live progress per peer
- Aggregate score appears in real time

**This is the empirical receipt the cooperative actually wants.** Not last night's manual CLI-shard run. The first real cooperative-mesh plow.

If MIC dispatcher is broken anywhere, fix or document. If the question bank is the same 1,400 as last night (carrying over), reuse — saves time. Or use the fresh 2,000-q Substrate Awakens event bank.

---

## SEG-7 — Truth-Always Sharps (Sonnet 4.6 SEG)

- Sharp 1: Fresh install of v0.5.0 on M0 reaches "Connected to live mesh" within 5 minutes of starting installer (clock starts when user double-clicks the .exe)
- Sharp 2: Same on M1 (16 GB box)
- Sharp 3: Same on M2 (32 GB box)
- Sharp 4: Same on M3 (32 GB box)
- Sharp 5: Each peer shows up on dashboard within 30 sec of handshake
- Sharp 6: Constellation map renders 4+ peers correctly with capability badges
- Sharp 7: MIC dispatch test (send a 5-q smoke shard to any peer) returns results within 1 min
- Sharp 8: NO PowerShell / NO Node install / NO USB / NO command-line at any user-facing step
- Sharp 9: Either remote son completes install + join from their location (WAN proof)
- Sharp 10: Real distributed plow returns aggregate receipt across all 6+ peers, no node returning dirty/empty data

NO COSMETIC-GREEN. NO TIMEOUT-SWALLOWED-YELLOW. HONEST RED if any Sharp fails — Knight fixes before moving on.

---

## SEG-8 — Yoke-return + canon receipt eblet (Sonnet 4.6 SEG)

Yoke-return at `BISHOP_DROPZONE\00_FOUNDER_REVIEW\YOKE_RETURN_FIRST_INSTALL_LIVE_MESH_EMPIRICAL_TEST_BP084.md` with:
- All SEG statuses + commits + verbatim "Sonnet 4.6"
- Truth-Always Sharps with literal observations
- Screenshot of dashboard with all peers visible
- The publishable receipt: *"The first real cooperative-class WAN mesh handshake — N peers, M questions across X domains, Y% accuracy, Z% Andon-quarantine, runtime W. Architecture: MIC dispatch via relay.lianabanyan.com + Thorax encryption + heartbeat-attested peer presence. Reproducible: download v0.5.0 → install → join → mesh."*

Mint canon eblet for the empirical receipt itself at `Asteroid-ProofVault\state\eblets\CANON\canon_first_live_mesh_empirical_receipt_bp084.eblet.md`. Composes with the existing Substrate Awakens canon — this is the dress rehearsal that earns the public event.

Send yoke-return pearl to Bishop via bridge.

---

## Bishop reminder

When Knight returns:
- The mesh works AND has an empirical receipt
- Saturday's Substrate Awakens public event is now the SECOND mesh handshake, not the first — much safer launch
- 68/70 stays the canonical Wave 1 receipt for letters per Founder ratify this afternoon
- New constellation receipt joins the Tower of Receipts as the FIRST LIVE MESH evidence

If any SEG hits a wall that requires Founder ratify or credential action, surface immediately. Knight does not invent paths or fake success per BP083 Truth-Always BLOOD.

**FOR THE KEEP.**

The cooperative shows itself. From the download. From the first install.
