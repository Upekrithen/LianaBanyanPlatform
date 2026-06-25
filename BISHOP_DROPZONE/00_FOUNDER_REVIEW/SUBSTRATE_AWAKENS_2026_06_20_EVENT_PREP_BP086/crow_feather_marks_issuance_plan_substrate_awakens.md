---
title: Crow Feather + Marks Issuance Plan — Substrate Awakens
session: BP086
date: 2026-06-18
status: DRAFT — Knight must register achievement in system before T-0
event: Substrate Awakens · First Live Mesh · 2026-06-20
---

# Crow Feather + Marks Issuance Plan · Substrate Awakens

**Canon anchor:** Every replicator who completes a shard earns three things: a Crow Feather, 100 Marks, and (if in the first 100) First-100 Founding-Replicator status. Base tier and paid member tier earn identically. The cooperative does not give lesser recognition for free-tier participation — both ran real compute on a real mesh.

---

## 1. Crow Feather Eblet Schema

One eblet per replicator. Minted post-event by Bishop after receipt is confirmed clean (or confirmed honest-partial).

```yaml
---
name: crow-feather-first-live-mesh-substrate-awakens-[peer_id_short]
type: crow_feather
achievement_id: FIRST_LIVE_MESH_SUBSTRATE_AWAKENS_2026_06_20
session: BP086
minted: [ISO timestamp of issuance]
status: active
---

## Achievement

**Crow Feather: First Live Mesh · Substrate Awakens**

Earned by: [Pseudonym or "Peer [short_id]"]
Peer ID: [peer_id — full UUID]
Email hash: [SHA256 of email, or "anonymous" if no email provided]
Tier at participation: [base | member]

## Event Reference

Event: Substrate Awakens · First Live Mesh · v0.5.0
Event date: 2026-06-20
Event receipt: [canonical URL at mnemosynec.ai/proofs/]
Receipt hash: [SHA256 of receipt content for tamper-evidence]

## Participation Record

Shard domain: [e.g., mathematics]
Questions completed: [N] / [total assigned]
Accuracy: [percentage]
Quarantine count: [N]
Run duration: [seconds]
Relay route confirmed: relay.lianabanyan.com (LAN-as-WAN · no shortcut)
Peer state at completion: [active | partial | dropped-then-recovered]

## Provenance

Minted by: Bishop (Sonnet 4.6)
Ratified by: Cooperative ledger automated issuance on receipt confirmation
Cross-links: [event-receipt-eblet] · [first-100-roster-eblet if applicable] · [marks-ledger-entry]

## KNOWN

- Participation was real: live compute on replicator's hardware, not replay
- Receipt referenced above is the canonical proof; this Feather is derivative
- Tier does not affect Feather quality — base and member Feathers are identical in standing

## THEORIES_OPEN

- Long-term display surface: Feather visible in cooperative profile UI (v0.6.x)
- Cross-cooperative recognition: whether Feathers are portable to Mimic Trunk forks

## ELIMINATED

- NOT issued for watching only — Feather requires completed shard, not passive dashboard view
- NOT revocable once issued (receipt is permanent, Feather is permanent)
```

---

## 2. Marks Issuance — 100 Marks Per Replicator

**Trigger:** Shard completed AND result recorded in event receipt (partial completion counts if peer dropped and partial was captured).

**Ledger entry schema:**

```yaml
marks_ledger_entry:
  entry_id: [UUID]
  peer_id: [full peer UUID]
  email_hash: [SHA256 or "anonymous"]
  tier: [base | member]
  event_id: SUBSTRATE_AWAKENS_2026_06_20
  marks_type: participation
  marks_amount: 100
  marks_class: event_participation
  issued_at: [ISO timestamp]
  issued_by: cooperative_ledger_automated
  rationale: "Substrate Awakens First Live Mesh — shard completion"
  receipt_reference: [event receipt URL]
  status: [active | held_in_reserve]
```

**Status logic:**
- `tier='member'`: status = `active` — Marks immediately spendable in Marks economy
- `tier='base'`: status = `held_in_reserve` — Marks held against peer_id, activate on membership upgrade, do not expire

**Base-tier Marks reserve canon:** Base-tier participants earned these Marks by running real compute. The Marks economy is a member feature, but the earning event is real. Held-in-reserve is not a demotion — it is a deferred activation. When the peer upgrades to membership, 100 Marks appear in their account on day one. This is part of the "membership is obviously better" self-evidence: you have Marks waiting for you.

**Issuance batch process:**
1. Bishop queries `peer_presence` for all peers with `state='completed'` or `state='partial_complete'` for event_id SUBSTRATE_AWAKENS_2026_06_20
2. For each peer: create ledger entry with above schema
3. For `tier='base'` peers: write `held_in_reserve` record to Vault with clear peer_id reference for future activation lookup
4. Confirmation to each registered email: "100 Marks credited (or held in reserve for [your pseudonym] · activate on membership)"

---

## 3. First-100 Founding-Replicator Status

**Separate from the Crow Feather.** A distinct record type. The first 100 peers to complete a shard earn this status regardless of tier.

**Roster eblet (one per event, not per person):**

```yaml
---
name: first-100-founding-replicators-substrate-awakens-2026-06-20
type: founding_roster
event: Substrate Awakens · First Live Mesh
date: 2026-06-20
status: [open_during_event | locked_post_event]
---

## First-100 Founding-Replicator Roster

Event: Substrate Awakens · First Live Mesh · v0.5.0
Locked at: [ISO timestamp when 100th replicator completed]

### Roster

| Position | Pseudonym | Peer ID (short) | Tier | Shard Domain | Completed At |
|---|---|---|---|---|---|
| 1 | [pseudonym] | [short_id] | [base/member] | [domain] | [timestamp] |
| 2 | ... | | | | |
| ... | | | | | |
| 100 | [pseudonym] | [short_id] | [base/member] | [domain] | [timestamp] |

### Governance

- Roster is immutable once locked (100th entry confirmed)
- Position number is assigned by shard-completion timestamp (first to complete shard, not first to register)
- Ties (same-second completion): ordered by peer_presence INSERT timestamp
- Roster is publicly visible at mnemosynec.ai/live/substrate-awakens/ (Replicator Roster panel) and permanently at the event receipt page
```

**Per-person status record (wallet entry):**

```yaml
founding_replicator_status:
  peer_id: [full UUID]
  email_hash: [SHA256 or "anonymous"]
  event_id: SUBSTRATE_AWAKENS_2026_06_20
  position: [1-100]
  status: FIRST_100_FOUNDING_REPLICATOR
  locked_at: [ISO timestamp of roster lock]
  display_badge: "First Live Mesh · Substrate Awakens · Founding Replicator #[position]"
  permanent: true
  revocable: false
```

---

## 4. Provenance Trail Requirements

Every Crow Feather, Marks entry, and Founding-Replicator record MUST reference:

1. **Event receipt URL** — canonical proof at `mnemosynec.ai/proofs/`
2. **Receipt hash** — SHA256 of receipt content for tamper-evidence
3. **Peer_id** — full UUID from `peer_presence` table
4. **Tier at participation** — `base` or `member` (not retroactively upgradeable for the Feather record)
5. **Relay route** — verbatim: "relay.lianabanyan.com · LAN-as-WAN · no shortcut" (THUNDERCLAP canon requirement)
6. **Shard domain and completion status** — partial completions are noted honestly, not rounded up

**Why provenance matters:** The Crow Feather "First Live Mesh · Substrate Awakens" will be the rarest Feather in the cooperative for years. It has verifiable proof requirements. Anyone who earns it in this event can prove it by pointing to the receipt. Anyone claiming it without proof cannot. The provenance trail is what makes the achievement non-gameable.

---

## 5. Replicator's Wallet Entry — Summary View

After issuance, a replicator's cooperative wallet shows:

```
Crow Feather: First Live Mesh · Substrate Awakens  [2026-06-20]
  Receipt: mnemosynec.ai/proofs/substrate-awakens-2026-06-20
  Shard: mathematics · 187/200 · 93% · 14 quarantined

Marks: +100  [held in reserve — activate on membership]  OR  [active — 2026-06-20]

Founding-Replicator: First-100 · Position #[N]  [if applicable, 2026-06-20]
```

---

## 6. Pre-Event Registration: Achievement System Must Be Ready

Knight yoke action required before T-0:

1. Register achievement `FIRST_LIVE_MESH_SUBSTRATE_AWAKENS_2026_06_20` in the achievements system
2. Create First-100 roster record (status: `open`, no entries yet)
3. Confirm Marks ledger can accept `held_in_reserve` status entries
4. Test issuance: create one test Crow Feather eblet for a test peer_id, confirm queryable, confirm receipt reference field accepts URL, delete test record
5. Test Marks entry: +100 `held_in_reserve` to test peer_id, confirm record, reverse

Bishop reviews Knight's test results before signing off Sharp 11 as GREEN.

---

*BP086 · Sonnet 4.6 · Bishop SEG · Crow Feather + Marks issuance plan*
