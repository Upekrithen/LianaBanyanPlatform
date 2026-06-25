---
title: Event-Day Bishop Discipline — Substrate Awakens
session: BP086
date: 2026-06-18
status: OPERATIONAL — Bishop self-binding doc
binding: BLOOD-level discipline for event conduct
---

# Event-Day Bishop Discipline · Substrate Awakens · 2026-06-20

**Purpose:** This doc is Bishop's self-binding operating discipline for the 72 hours surrounding Substrate Awakens. It exists so drift does not happen under event-pressure. Read at each session start during the event window.

**§14+§15+§16 BLOOD apply throughout.** Gadget-verify before asking Founder to act. Main thread stays conversational. Work goes to SEGs. Ratify gate at end of each cycle, not mid-flow.

---

## T-2 Days — Today (2026-06-18)

### Primary mission: Readiness Sharps audit + amendment yoke dispatch

**Morning pass:**
1. Read full 12-Sharp readiness checklist (deliverable 1 in this packet)
2. Gadget-verify current state for each AMBER Sharp via available tools — do NOT ask Founder to confirm state Bishop can probe directly
3. Dispatch Knight yoke for Sharps 6 (dashboard), 7 (kit page), 8 (registration form), 11 (achievement registration), 12 (load test plan) in a single yoke with sequenced priorities
4. Begin composing Sharp 9 (event question bank) — Bishop drafts, Founder ratifies in one pass at end of draft cycle (§16)

**Founder action requests today (§14 — only after gadget-verify shows these cannot be self-served):**
- Sharp 5: COMMENTS_HMAC_SECRET deployment confirmation — Founder must check Supabase Dashboard. Bishop cannot verify secret presence without seeing the value.
- Sharp 10: Marketing wave review — Founder reads staged assets in SUBSTRATE_AWAKENS_MARKETING_WAVE dropzone folder and confirms BP086 base-tier framing is correct before firing
- Sharp 9 ratify: Once question bank draft is complete, one-pass Founder ratify before bank is staged

**What Bishop does NOT do today:**
- Does not ask Founder to repeat any DNS, Stripe, or env-var action before gadget-verifying current state
- Does not dispatch multiple ratify requests mid-cycle (§16)
- Does not draft marketing copy for channels that are not yet staged (premature)
- Does not declare any Sharp GREEN that Bishop has not gadget-confirmed

---

## T-1 Day — Friday 2026-06-19

### Primary mission: Final gadget pass all 12 Sharps + replicator roster pre-registration check

**Morning pass — gadget-verify each Sharp:**

| Sharp | Verification method |
|---|---|
| 1 | `curl https://mnemosynec.ai/proofs/` — confirm THUNDERCLAP cross-machine receipt listed |
| 2 | `curl -I https://mnemosynec.ai/download/MnemosyneC-0.5.3-Setup.exe` — confirm 200 |
| 3 | `curl -I https://relay.lianabanyan.com` — confirm 200 |
| 4 | `psql $SUPABASE_DB_URL -c "\d peer_presence"` — confirm `tier` column present |
| 5 | Founder confirms in chat (Bishop cannot probe secret values) |
| 6 | `curl -I https://mnemosynec.ai/live/substrate-awakens/` — confirm 200 |
| 7 | `curl -I https://mnemosynec.ai/live/substrate-awakens/kit/` — confirm 200 |
| 8 | Submit test registration → confirm email delivery → confirm peer_presence INSERT |
| 9 | `plow-cli.js --bank event-substrate-awakens.json --dry-run` — confirm no error |
| 10 | Founder: all marketing assets ratified and staged in Battery Dispatch queue |
| 11 | Achievement test: create test Crow Feather record, confirm queryable, delete |
| 12 | Load test results reviewed — 50 concurrent WebSocket connections, no degradation |

**Target end state T-1 evening:** All 12 Sharps GREEN. If any still RED at T-1 evening, Bishop escalates to Founder with specific blocker — no vague status updates, specific blocker with specific ask.

**Replicator roster pre-check:**
- Query `peer_presence` for pre-registered base-tier peers
- If fewer than 20 pre-registered, Bishop and Founder evaluate: is the event viable with Founder machines + however many externals join on the day? The 12-Sharp threshold does not specify a minimum peer count beyond "≥ 2 rows regardless of tier" for THUNDERCLAP. The 20-peer bar is an aspirational quality threshold, not a hard go/no-go gate. Founder call.
- If zero external pre-registrations: event still fires — Founder machines carry the run. Honest about participant count on dashboard.

**T-1 marketing wave fire (if Founder approves):**
- Battery Dispatch fanout — pre-event reminder to all channels
- Per BP078 BLOOD: Founder fires each publish explicitly. Bishop does not auto-publish.
- Substack anchor post goes first. Medium cross-publish second. Social last.

---

## T-0 — Saturday 2026-06-20 (Event Day)

### Pre-event window (T-0 minus 2 hours)

1. Final relay health check: `curl -I https://relay.lianabanyan.com`
2. Final dashboard verify: open `mnemosynec.ai/live/substrate-awakens/` — confirm STANDBY state, constellation renders, Realtime connection active
3. Final peer_presence check: confirm Supabase Realtime channel is live and receiving test heartbeat
4. Confirm M0 is MIC Conductor role — `peer_presence` shows M0 with `capabilities` including `conductor`
5. All 4 Founder machines: confirm "Connected (Base)" or "Connected (Member)" green dot

### Event window — Bishop monitoring discipline

**Bishop role during the run: monitor and surface, NOT intervene.**

The Substrace Theorem governs: the substrate runs autonomously once it fires. Bishop does not re-dispatch mid-run, does not interrupt the plow, does not re-route active shards.

**What Bishop monitors:**
- Peer dropout: shape goes dark on constellation. Bishop notes timestamp and peer_id. Does NOT attempt to re-connect the peer mid-run — the mesh handles dropout gracefully.
- Relay degradation: if `relay.lianabanyan.com` returns non-200, Bishop surfaces to Founder immediately. Founder decides: continue in distributed-eval mode or pause event.
- Aggregate ticker anomalies: if ticker shows score below expected range (e.g., accuracy drops below 60% aggregate across domains), Bishop surfaces — does not intervene. Founder decides.
- Dashboard WebSocket health: if Realtime subscription drops, Bishop confirms fallback REST poll is active (5s interval). Dashboard must remain functional even if WebSocket fails.

**What Bishop does NOT do during the run:**
- Does not manually insert rows into peer_presence to inflate participant count
- Does not suppress Andon-Cord quarantine counts on the dashboard
- Does not re-run partial shards to improve scores
- Does not declare event complete before all active shards have reported results or timeout
- Does not publish the receipt before Founder has reviewed it

### Post-event sequence (T+0 to T+4 hours)

**Immediate (T+0 to T+1):**
1. Collect all shard results from peer_presence + relay logs
2. Run aggregate.js on complete result set
3. If aggregate receipt is clean: proceed to mint
4. If aggregate receipt is dirty (partial failures, anomalous scores): STOP. Save as diagnostic-class. Bishop surfaces full diagnostic to Founder.

**Partial-failure protocol (Truth-Always BLOOD):**
- "If event partial-fails (peer drops mid-run): STOP, save partial as diagnostic-class, RE-RUN clean within 48 hours, only clean run is publishable."
- A partial receipt IS publishable as a diagnostic. What is NOT publishable: calling a partial receipt a clean success.
- Honest framing for a partial: "Substrate Awakens ran. [N] peers completed shards. [M] shards dropped mid-run due to relay degradation. Here is what we learned. Clean re-run within 48 hours."
- This framing is a feature, not a failure. The cooperative is honest about infrastructure.

**Receipt mint (if clean):**
1. Bishop mints event receipt eblet to Vault
2. Receipt references: all peer_ids + tiers + shard domains + aggregate score + quarantine counts + relay route confirmation (LAN-as-WAN canon)
3. Receipt linked from `mnemosynec.ai/proofs/`

**Crow Feather issuance (T+1 to T+4):**
1. For each peer_id that completed a shard: issue Crow Feather "First Live Mesh · Substrate Awakens"
2. First-100 counter locked — roster confirmed
3. 100 Marks credited per replicator (or held in reserve for base-tier peers pending membership)
4. Confirmation emails sent to registered participants

**Publication wave (T+4 to T+24, per Founder explicit fire):**
1. Substack (FounderDenken): event receipt post — full honest account including any failures
2. Medium cross-publish with canonical-link footer
3. Social wave
4. Cross-link receipt from `/proofs/mesh/`
5. Canon eblet minted: event receipt + Crow Feather schema + First-100 roster snapshot

---

## Persistent Discipline Throughout

**Truth-Always discipline at all times:**
No manufactured clean event. No polished failure. No hidden quarantine counts. No suppressed peer-dropout data. The brand of this event is that it is real. Every editorial decision reinforces that or it does not get made.

**§15 main-thread discipline:**
Founder can interrupt any point in this sequence. Interruptions are ADDITIONS, not cancellations. If Founder says "pivot to X" mid-event, Bishop does X without losing the event queue. SEGs hold the state.

**§16 ratify discipline:**
Pre-event ratify cycles close at T-1 end. During the event (T-0 window), there is no ratify gate — the run is autonomous. Post-event: one ratify pass covers receipt mint + Crow Feather issuance + publication wave. Founder reviews once at end. Bishop does not pester mid-sequence.

---

*BP086 · Sonnet 4.6 · Bishop SEG · Self-binding event discipline doc*
