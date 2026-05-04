# Bushel 27 — First Competition Cycle Receipt

**Status:** SCAFFOLD — awaiting first live competition events (first live find + harden = receipt locks as empirical)  
**Dated:** AD 2026-05-03  
**Session:** BP022 (Knight session Bushel 27)  
**G6 gate:** Populates when Red find + Blue harden both verified in production  

---

## Phase E Canonical Form

Per Bushel 27 Phase E spec: this receipt is the **Maintenance-Scribe canon-vs-implementation gate**. It is measured, not projected. Until a real Red Team member submits and verifies the first find event, and a Blue Team member submits and verifies the first harden event, this receipt holds the scaffold structure with empty empirical fields.

**Scaffold becomes empirical when**: `red_blue_competition_event` rows exist with `status = 'verified'` for both classes + `ip_ledger_stamp` rows exist for both.

---

## First Find Event (Red Team)

| Field | Value |
|---|---|
| `event_id` | _pending first live event_ |
| `member_id` | _pending_ |
| `team` | `red` |
| `event_class` | `find` |
| `event_subclass` | _pending_ |
| `submitted_at` | _pending_ |
| `verified_at` | _pending_ |
| `verifier_member_id` | _pending_ |
| `ip_stamp_id` | _pending_ |
| `marks_payout_amount` | _pending_ |
| `win_class_multiplier` | _pending_ |
| `first_finder_marker` | _pending_ |
| `canonical_artifact` | _pending (find description + reproduction steps)_ |

---

## First Harden Event (Blue Team)

| Field | Value |
|---|---|
| `event_id` | _pending first live event_ |
| `member_id` | _pending_ |
| `team` | `blue` |
| `event_class` | `harden` |
| `event_subclass` | _pending_ |
| `parent_event_id` | _pending (cross-team challenge ref to Red find above)_ |
| `submitted_at` | _pending_ |
| `verified_at` | _pending_ |
| `verifier_member_id` | _pending_ |
| `ip_stamp_id` | _pending_ |
| `marks_payout_amount` | _pending_ |
| `win_class_multiplier` | _pending_ |
| `first_hardener_marker` | _pending_ |
| `canonical_artifact` | _pending (harden description + before/after defense diff)_ |

---

## Scoreboard Snapshot

### Before first cycle (baseline)

```json
{
  "red": { "cumulative_wins": 0, "cumulative_marks": 0, "cumulative_ip_stamps": 0 },
  "blue": { "cumulative_wins": 0, "cumulative_marks": 0, "cumulative_ip_stamps": 0 }
}
```

### After first cycle (empirical — populates at G6)

```json
{
  "red": { "cumulative_wins": "_pending_", "cumulative_marks": "_pending_", "cumulative_ip_stamps": 1 },
  "blue": { "cumulative_wins": "_pending_", "cumulative_marks": "_pending_", "cumulative_ip_stamps": 1 }
}
```

---

## Cross-Team Challenge Composition Demonstration

The Blue Team first harden SHOULD reference the Red Team first find via `parent_event_id`.  
This produces the cross-team challenge composition per Phase D canon:
- Red Find (find-class) → `ip_ledger_stamp` (stamp_class: `red_team_find`)
- Blue Harden references Red Find via `parent_event_id` → `ip_ledger_stamp` (stamp_class: `blue_team_harden`)
- Both stamps share the same `canonical_artifact` lineage
- Both teams see both events in the dual-team-visible scoreboard

**Cross-team challenge composition demonstrated:** _pending first live cycle_

---

## Empirical Anchor Notes

Per Bushel 27 Phase E spec:

> *Empirical anchor IS the canon-vs-implementation gate per Maintenance-Scribe class — measured, not projected.*

This receipt becomes the measurement anchor for:
- **Bushel 26 H* hypothesis class**: Red/Blue verified-event throughput is a candidate Bushel 26 hypothesis
- **Compound-lift receipt**: Red/Blue competition × IP Ledger stamp generation × Marks payout × Cross-team transparency all firing together is the compound-lift signal
- **A&A formal candidate**: Red/Blue Team Competition + IP Ledger Stamp Surface architecture as standalone A&A formal (companion to existing canon Eblet at BP021)

---

## How to Lock This Receipt as Empirical

1. A Red Team member submits a find event via platform surface (`/helm/red-blue-leaderboard`)
2. Verifier approves → `verified_at` populated → trigger fires → `ip_ledger_stamp` row created → `status = ip_stamped`
3. A Blue Team member submits a harden referencing the find (cross-team challenge)
4. Verifier approves → same trigger chain fires for Blue event
5. Knight or Bishop fills in the empirical fields in this receipt from Supabase query:
   ```sql
   SELECT e.*, s.id as stamp_id, s.first_finder_marker, s.canonical_artifact
   FROM red_blue_competition_event e
   JOIN ip_ledger_stamp s ON s.competition_event_id = e.event_id
   ORDER BY e.submitted_at ASC LIMIT 2;
   ```
6. Mark this file `Status: EMPIRICAL` and commit

---

*Bushel 27 Phase E scaffold — AD 2026-05-03. BP022 Knight session. Locks as empirical at first live competition cycle. G6 gate.*
