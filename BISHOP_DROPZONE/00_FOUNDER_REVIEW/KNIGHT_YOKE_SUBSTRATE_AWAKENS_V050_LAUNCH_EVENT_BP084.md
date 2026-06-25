# KNIGHT YOKE · Substrate Awakens · v0.5.0 First Live Mesh Event · BP084

**Session:** BP084
**Date:** 2026-06-15
**Event name:** **Substrate Awakens** (Founder-locked)
**Target day:** Saturday 2026-06-20 (governance: **event-driven, not time-driven**)
**Founder ratify:** DIRECT — *"Substrate Awakens. And event driven, not time driven. So when we finish X we will do it. But say the day. Saturday, I'd say"*

---

## 🩸 HARD BINDING — Sonnet 4.6 SEGs only

**USE Sonnet 4.6 SEGs FOR ALL WORK. DO NOT USE COMPOSER 2.5 OR ANY OTHER MODEL.**

Every SEG `model: 'sonnet'`. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## Event-Driven Governance — CRITICAL

The TARGET day is Saturday 2026-06-20. The actual go/no-go is gated by **9 readiness Sharps** (12 total readiness items; 3 are Founder-only). If ANY Sharp is RED on Saturday morning, event slips ONE DAY. NEVER fake go-live. Truth-Always > polished lie.

Marketing wave language: *"Saturday-ish — we ship when she wakes up clean."*

---

## SEG-1 — v0.5.0 binary build + Tower of Peace 🟡 LATEST (Sonnet 4.6 SEG)

Build v0.5.0 from `main` (commit `f38e90e` per Mesh WAN/NAT long-haul return). Bump package.json version. electron-builder. Output: `MnemosyneC-Setup-0.5.0.exe` + `latest.yml`.

Deploy:
- Self-host: `Cephas\cephas-hugo\static\download\` + Firebase static (atomic-deploy.ps1 from v0.4.3)
- Tower of Peace `/download/`: promote v0.5.0 to 🟡 LATEST · demote v0.4.3 to 🔵 HISTORICAL
- GitHub mirror: small "Try the GitHub mirror →" link preserved per BP081 distribution canon

**Sharp:** `curl -sI https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.0.exe` → HTTP/1.1 200 + Content-Length matches latest.yml. Tower of Peace badge updated.

---

## SEG-2 — Live Dashboard at `/live/SubstrateAwakens/` (Sonnet 4.6 SEG)

**Path:** `Cephas\cephas-hugo\content-mnemosynec\live\SubstrateAwakens\_index.md` + custom layout.

**Architecture:** WebSocket-subscribed to Supabase `peer_presence` table. NO video. NO narration. Pure data visualization.

**Components:**

1. **Constellation Switchboard map** — peers as ▢ △ ◯ shapes per [[canon-package-store-bakery-confectionary-kitchen-constellation-switchboard-bp083]]. Filled/outline = lit/unlit. Glow animation on each answer. Dim on quarantine. Dark on dropout.
2. **Per-peer ticker** — `{node_id} · {domain} {current}/{total} · {accuracy}% · {quarantined} quarantined · {ETA}` updating per peer's latest heartbeat
3. **Aggregate score banner** — running total: `1,847 / 2,000 questions answered · 96.4% accuracy of non-quarantined · 312 self-quarantined`
4. **Replicator roster** — sortable list, newest joins at top: *"Welcome [display_name] · shard m6 assigned · biology 0/200 · joined 14:23 UTC · attribution permanent"*
5. **Truth-Always footer** — always visible: `Andon-Cord active · X quarantined · Y peers connected · Z peers dropped (handled)`
6. **Failure-mode banners** — auto-display if: relay degrades, aggregate stalls >2min, peer count drops >20% in 60s

**Tech:**
- Supabase realtime subscription (`peer_presence` channel) — no polling
- Pure HTML/CSS/vanilla JS — no SPA framework
- Heartbeat-attested data only (per [[canon-fork-derivative-cooperative-access-thorax-heartbeat-enforcement-bp084]])
- Mobile-responsive (no horizontal scroll per BP081)
- `mimic-trunk-eligible: true` frontmatter — designers can fork and ship better dashboard

---

## SEG-3 — Watch-and-Replicate kit (Sonnet 4.6 SEG)

**Hosted at:** `mnemosynec.ai/live/SubstrateAwakens/kit/`

Contents:
- **MnemosyneC-Setup-0.5.0.exe** download button (same binary as Tower of Peace LATEST)
- **`setup-helper.ps1`** (reuses the one from Task #15 LAN omnibus yoke — Node + Ollama + gemma4:12b precheck)
- **One-page replication guide:**
  1. Install MnemosyneC v0.5.0
  2. Open `mnemosynec.ai/live/SubstrateAwakens/register` and enter email
  3. Receive one-time heartbeat token by email
  4. Launch MnemosyneC → Settings → Join Live Event → paste token
  5. App auto-handshakes, fetches a shard, runs plow against your local Gemma
  6. Your results stream back to the dashboard. Your name + attribution appear in the roster.
  7. Earn Crow Feather "First Live Mesh · Substrate Awakens" + 100 Marks + First-100 Founding-Replicator status
- **FAQ:** what's required (Node, Ollama, gemma4:12b, ~10 GB free), what's collected (heartbeat-attested results only, no PII beyond email), what's NOT (no telemetry beyond mesh participation), graceful failure handling

---

## SEG-4 — Registration form + heartbeat token issuance (Sonnet 4.6 SEG)

**Path:** `Cephas\cephas-hugo\content-mnemosynec\live\SubstrateAwakens\register\_index.md` + Supabase edge function `register-SubstrateAwakens`.

Form:
- email (required, validated)
- display_name (optional, defaults to email-local-part)
- declared_ram_tier (lightweight / standard / premium / heavy / unknown)
- agree to Truth-Always terms (cooperative-class etiquette: don't game the mesh, honor Andon-Cord, etc.)

Submission:
- Edge function `register-SubstrateAwakens` creates a `substrate_awakens_registrations` row + emits a one-time heartbeat token (HMAC over `(email || event_slug || nonce)` keyed by `COMMENTS_HMAC_SECRET` reused)
- Sends email via Supabase email or Resend (Founder picks — see Founder action checklist)
- Email contains the token + Quick Start link to `mnemosynec.ai/live/SubstrateAwakens/kit/`

Throttle: 1 token per email address. Re-request resets to new token (24h cooldown to prevent abuse).

Migration: `platform\supabase\migrations\20260616000002_substrate_awakens.sql` — `substrate_awakens_registrations` table.

---

## SEG-5 — Live event question bank (Sonnet 4.6 SEG)

**Critical:** the event MUST use FRESH questions, NOT tonight's 1,400-q distributed-eval bank. Replicators see ORIGINAL questions or it's just a recorded re-run.

Approach:
- Pull 2,000 fresh MMLU-Pro questions from the master bank (not in tonight's shards)
- Shard them dynamically per registered replicator at event-time based on declared RAM tier + connection latency
- gemma4:12b tier → harder symbolic domains
- gemma2:2b tier → verbal-heavy domains where small models perform better

Question manifest: `Asteroid-ProofVault\PAPERS\substrate_awakens_question_bank.jsonl` — sealed, hash-attested before event so no one can claim post-hoc shuffling.

---

## SEG-6 — Pre-event marketing wave (DRAFTED ONLY · BP078 BLOOD) (Sonnet 4.6 SEG)

**Founder explicit ratify required before publish per BP078 explicit-ratify-before-publish canon.** Knight DRAFTS, files to `BISHOP_DROPZONE\00_FOUNDER_REVIEW\SUBSTRATE_AWAKENS_MARKETING_WAVE\`:

| T- day | Channel | File | Status |
|---|---|---|---|
| T-7 (Sun 6/14) | Substack/FounderDenken anchor | `SUBSTACK_SUBSTRATE_AWAKENS_T7_ANCHOR.md` | DRAFT |
| T-7 | Medium cross-publish | `MEDIUM_SUBSTRATE_AWAKENS_T7.md` (with canonical-link footer to Substack) | DRAFT |
| T-7 | Cephas + lianabanyan.com banner | `CEPHAS_BANNER_SUBSTRATE_AWAKENS.html` | DRAFT |
| T-5 | Show HN | `SHOW_HN_SUBSTRATE_AWAKENS_T5.md` | DRAFT |
| T-5 | r/LocalLLaMA + r/MachineLearning | `REDDIT_SUBSTRATE_AWAKENS_T5_LOCALLAMA.md` + `REDDIT_SUBSTRATE_AWAKENS_T5_ML.md` | DRAFT |
| T-3 (Wed 6/17) | Watch-and-Replicate kit drop | (handled by SEG-3) | — |
| T-1 (Fri 6/19) | Battery Dispatch fanout reminder | `BATTERY_DISPATCH_SUBSTRATE_AWAKENS_T1.md` | DRAFT |
| T-0 (Sat 6/20) | Event | — | — |
| T+1 (Sun 6/21) | Receipt mint + canon eblet + cross-publish | (handled post-event) | — |

Hero copy across all channels carries the **"Substrate Awakens"** name + the **"event-driven, not time-driven"** framing — *"Saturday-ish — we ship when she wakes up clean."*

---

## SEG-7 — Crow Feather "First Live Mesh · Substrate Awakens" achievement (Sonnet 4.6 SEG)

Per [[reference-feather-system-canon]] — register new Crow Feather variant in achievements system:

- Slug: `crow-feather-first-live-mesh-SubstrateAwakens`
- Trigger: replicator's heartbeat-attested result stream appears in event dashboard with at least 1 verified-correct answer
- Visual: Crow Feather base + small substrate-glow flourish + event date stamp
- Carries: 100 Marks + First-100 Founding-Replicator status (slot # locked at participation order)

Founding-Replicator roster: separate `substrate_awakens_replicators` table tracking slot # 1-100 in arrival order. First 100 to successfully contribute results get permanent founding-100 attribution per [[guild-node-voting-thresholds-founder-seed-proposal-bp082]].

---

## SEG-8 — Dashboard dry-run + load test (Sonnet 4.6 SEG)

Before event-day go/no-go:

1. Spawn 50+ simulated peers (lightweight node script that mocks heartbeat publish + result stream at realistic intervals)
2. Verify WebSocket subscription remains stable
3. Verify aggregate ticker math is honest under simulated load
4. Verify failure-mode banners trigger correctly on simulated peer dropout (kill a sim peer mid-run, expect banner within 30s)
5. Verify dashboard renders correctly on mobile + desktop + tablet
6. NO horizontal scroll anywhere (BP081 canon)
7. Measure latency: time-from-result-write-to-dashboard-update should stay under 2s p95

Output: `BISHOP_DROPZONE\00_FOUNDER_REVIEW\YOKE_RETURN_SUBSTRATE_AWAKENS_DRY_RUN.md` with load-test receipts.

---

## SEG-9 — Deploy + Readiness Sharps (Sonnet 4.6 SEG)

12 readiness Sharps per the canon. Knight verifies 9 (Knight-side); Founder verifies 3 (Founder-side):

**Knight verifies (must be GREEN on Saturday morning):**
- Sharp 1: Tonight's distributed-eval receipt published cleanly to `mnemosynec.ai/proofs/` (carries over from BP084)
- Sharp 2: `curl -sI https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.0.exe` → 200 + Tower LATEST badge
- Sharp 6: `curl -sI https://mnemosynec.ai/live/SubstrateAwakens/` → 200 + WebSocket subscription proves live in headless test
- Sharp 7: `curl -sI https://mnemosynec.ai/live/SubstrateAwakens/kit/` → 200 + all 3 components present
- Sharp 8: `curl -sI https://mnemosynec.ai/live/SubstrateAwakens/register` → 200 + form submit → token email delivered to test address within 30s
- Sharp 9: Question bank hash sealed + checked into Asteroid-ProofVault
- Sharp 10: All 7 marketing wave drafts present in BISHOP_DROPZONE awaiting Founder ratify (NOT yet published)
- Sharp 11: Crow Feather variant registered + roster table migrated
- Sharp 12: Dry-run load test results posted with 50+ peer simulation passed

**Founder verifies (must be GREEN — Knight cannot do):**
- Sharp 3: relay.lianabanyan.com CNAME live at Squarespace + Supabase custom domain TXT verified
- Sharp 4: peer_presence migration applied to production Supabase
- Sharp 5: COMMENTS_HMAC_SECRET in Supabase env vars (also used for SUBSTRATE_AWAKENS heartbeat tokens)

If any RED on Saturday morning: event slips one day. Bishop announces slip via Battery Dispatch ("Saturday-ish — she's not awake yet — back Sunday").

NO COSMETIC-GREEN. NO TIMEOUT-SWALLOWED-YELLOW. HONEST RED if any 302 or 500. Truth-Always BLOOD.

---

## Founder action checklist (Bishop relays)

Knight cannot do these:

1. ✅ Tonight: complete distributed-eval receipt aggregation (covered by tonight's run)
2. Squarespace DNS: add CNAME `relay.lianabanyan.com` → `ruuxzilgmuwddcofqecc.supabase.co`
3. Supabase Dashboard: add custom domain `relay.lianabanyan.com` + TXT challenge
4. Supabase Dashboard: apply `peer_presence` migration (from Mesh WAN/NAT yoke) + apply `substrate_awakens_registrations` migration (this yoke)
5. Supabase env vars: confirm `COMMENTS_HMAC_SECRET` set (yoke reuses for event heartbeat tokens) — or set distinct `SUBSTRATE_AWAKENS_HMAC_SECRET`
6. Email provider decision: Supabase Auth email (built-in) vs Resend (paid, better deliverability) — Knight defaults to Supabase Auth unless Founder rules otherwise
7. Per-piece marketing wave RATIFY per BP078 — each of 7 drafts gets an individual Founder fire signal before publish
8. Event day: be at desk watching dashboard like everyone else (no on-camera role per Founder direct)

---

## Yoke-return spec

Each SEG status + commits + 9 Knight-side Sharps with literal HTTP codes + dry-run load test receipts + verbatim "Sonnet 4.6". Drafts filed to BISHOP_DROPZONE\00_FOUNDER_REVIEW\SUBSTRATE_AWAKENS_MARKETING_WAVE\.

---

**FOR THE KEEP.**

Substrate Awakens. The cooperative shows itself.
