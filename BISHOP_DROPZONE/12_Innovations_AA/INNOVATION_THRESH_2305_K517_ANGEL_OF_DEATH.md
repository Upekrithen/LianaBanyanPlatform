# THRESH — A&A #2305 — Angel of Death (Bury Mode)

**Status:** SHIPPED (K517 reduction-to-practice, 2026-04-26)
**Class:** Crown Jewel candidate
**Filed:** B126 / K517
**A&A Domain:** Bishop Wing / Discipline Plane / Catacombs / Severance Class

**Cultural Anchor:** Terry Gilliam's *The Adventures of Baron Munchausen* (1988) — the Angel of Death: not the antagonist; constrained by moment; final; coexists with vitality.

---

## What it is

**Angel of Death — Bury Mode** is the forensic-preservation arm of the Severance Class. When the Bishop Wing Consensus Layer rejects a Dragonrider Phase-Shift snapshot (i.e., the action was borderline-warn, Dragonrider evaluated it in sandbox, and the Dragonrider escalated warn→block with predicted harm), the Angel buries the Dragonrider snapshot in the Catacombs rather than discarding it.

**Two modes (Founder B123-late ratification):**

| Mode | When invoked | What happens |
|---|---|---|
| **Sever** (domain: future) | Clear-cut rejection; dead code; aged-out entries | Remove from active substrate; audit record preserved |
| **Bury** (K517 implementation) | After significant evaluation, choosing one path over another | Relocate to dormant Catacombs; forensic-recoverable; not in active operations |

K517 ships Bury mode. Sever mode is defined architecturally (K-future).

---

## Core mechanism

1. **Bury** (`bury(snapshot_data, bury_reason, session, source)`):
   - Writes `~/.claude/state/catacombs/buried/<session>/<burial_id>.json` — full snapshot + provenance
   - Appends to `burial_audit.jsonl` (append-only; every bury + rehydrate event)
   - Sanction-required: only called when Wing explicitly sanctions (block decision + Dragonrider escalation)
   - Returns `burial_id` (8-char UUID prefix) for subsequent reference

2. **Query** (`query_buried(session, bury_reason, since_date, limit)`):
   - Walks Catacombs directory; returns burial summaries (no snapshot_data — rehydrate for that)
   - Filters: by session, by bury_reason, by since_date

3. **Rehydrate** (`rehydrate(burial_id, rehydrate_reason, operator)`):
   - Governance-only manual retrieval path
   - Adds rehydrate record to burial file audit trail (does NOT remove from Catacombs)
   - Returns full snapshot_data + rehydrate_history
   - Sanction-required: operator and reason required for audit trail

4. **MCP Tools**: `angel_of_death_buried` (query), `angel_of_death_rehydrate` (governance retrieval)

---

## Catacombs topology (B121 architecture, extended K517)

```
Cathedral (above)  ← active Scribes / active Wing operations
     ↓ [Angel of Death Bury — sanctioned transfer]
Catacombs (below)  ← buried Dragonrider snapshots; forensic-recoverable; never active spontaneously
     ↓ [Rehydrate — manual governance path]
Manual retrieval   ← Founder/governance explicitly calls rehydrate(); audit trail preserved
```

---

## K517 Reduction-to-Practice

**Implementation:** `discipline_wing/angel_of_death.py`
**Verification:** `discipline_wing/tests_k517.py` — C.4 through C.8 (15/15 sub-checks PASSED)

### Key verified behaviors
- C.4: Dragonrider-rejected snapshot correctly routed to Bury (not Sever); burial file created
- C.5: Full provenance metadata preserved: burial_id, bury_ts, bury_reason, session, snapshot_data, rehydrate_history initialized empty
- C.6: Query with filter support (session, bury_reason, since_date) all functioning
- C.7: No background threads; burial_status remains "buried" without explicit rehydration
- C.8: rehydrate() returns snapshot_data, appends to rehydrate_history, updates burial_status, writes to audit log

---

## Claim space

- Sanction-constrained multi-domain substrate cleanup agent operating in Bury mode: relocates rejected substrate to forensic-recoverable dormant archive without destructive removal
- Non-autonomous: Angel never initiates; only acts under explicit Wing sanction (block decision)
- Rehydrate path: governance-only retrieval with audit-trail requirement (operator + reason recorded)
- Catacombs as destination: same substrate as dormant Scribe repository (#2258); Angel Bury extends Catacombs to accept Wing-rejected operational snapshots, not only aging Scribes
- Audit ledger non-severability: burial_audit.jsonl is append-only; every bury + rehydrate event preserved regardless of subsequent rehydration

---

## Related Innovations

- **#2301** (Dragonriders) — produces the snapshots that Angel of Death buries
- **#2302** (TimeWave Security) — produces the security events that contextualize what was rejected
- **#2258** (Tower of Peace / Catacombs) — the dormant-archive substrate that receives buried entries
- **#2295** (Augur MAJCOM Hierarchy) — the Wing evaluation framework within which Angel acts

---

*Filed K517 / B126, 2026-04-26*
