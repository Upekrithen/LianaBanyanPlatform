"""
K488 Phase D — Ghost Miner Triage → Catacombs Disposition

K487 produced 151 ghost Miners (capped at the Miner-50 limit). These are
Miners that were spawned during mitosis events but never got to mine any
tablets because the active-Miner population was already at capacity.

Per Bishop B123 architectural insight (K488 prompt):
  Ghost Miners are dormant Scribes. They map exactly to the Catacombs
  architecture (#2285 + project_catacombs_dormant_scribe_repository.md).

This script:
  1. Reads the ledger to find mitosis_trigger events for each ghost
  2. Extracts: topic anchor, parent serial, trigger timestamp,
     trigger keywords, trigger tablet reference (where the wake-event lives)
  3. Creates Catacombs entries at:
     librarian-mcp/miners/catacombs/<ghost_serial>.jsonl
  4. Ranks ghosts by activation priority (overlap with Rhetorical Keystones)
  5. Writes audit_log_K488_phase_d.json + topic distribution report

K488 · B123 · Phase D
"""

from __future__ import annotations

import json
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

MINERS_DIR = Path(__file__).parent.parent
LEDGER_PATH = MINERS_DIR / "ip_ledger.jsonl"
SNAP = MINERS_DIR / "miner_population_snapshot_K487.jsonl"
CATACOMBS_DIR = MINERS_DIR / "catacombs"
CLEANUP_DIR = Path(__file__).parent
AUDIT_LOG = CLEANUP_DIR / "audit_log_K488_phase_d.json"
TOPIC_REPORT = CLEANUP_DIR / "ghost_miner_topic_distribution.json"

# Rhetorical Keystones — high-priority domains for activation detection
# (Sourced from The Sweet Sixteen Initiatives and canonical platform domains)
RHETORICAL_KEYSTONES = {
    "food", "dinner", "groceries", "shopping", "household",
    "health", "cooperative", "education", "credit", "credits",
    "political", "platform", "innovation", "patent", "founder",
    "liana", "banyan", "bread", "harper", "music", "jukebox",
    "academic", "people", "letters", "market",
}


def load_ghosts(snap_path: Path) -> list[dict]:
    """Return all Miners with tablet_count == 0 (ghost Miners)."""
    ghosts = []
    with snap_path.open() as f:
        for line in f:
            m = json.loads(line)
            if m.get("tablet_count", 0) == 0:
                ghosts.append(m)
    return ghosts


def load_mitosis_events(ledger_path: Path) -> dict[str, dict]:
    """
    Read ledger and extract mitosis_trigger events for all ghost serials.
    Returns dict: ghost_serial -> {parent_serial, trigger_tablet_id, trigger_keywords, timestamp}
    """
    events: dict[str, dict] = {}
    with ledger_path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if entry.get("event_type") == "mitosis_trigger":
                daughter_serial = entry.get("daughter_serial", "")
                if daughter_serial and daughter_serial not in events:
                    events[daughter_serial] = {
                        "parent_serial": entry.get("miner_serial"),
                        "trigger_tablet_id": entry.get("tablet_id"),
                        "trigger_keywords": entry.get("seed_keywords", []),
                        "new_category_primary": entry.get("new_category_primary"),
                        "timestamp": entry.get("timestamp"),
                    }
    return events


def load_daughter_seeded_events(ledger_path: Path) -> dict[str, list[str]]:
    """
    Read ledger for daughter_seeded events (contains seed_keywords).
    Returns dict: ghost_serial -> seed_keywords list
    """
    seeds: dict[str, list[str]] = {}
    with ledger_path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if entry.get("event_type") == "daughter_seeded":
                serial = entry.get("miner_serial", "")
                kws = entry.get("seed_keywords", [])
                if serial and kws:
                    seeds[serial] = kws
    return seeds


def activation_priority(topic: str, seed_keywords: list[str]) -> str:
    """
    Rate activation priority based on overlap with Rhetorical Keystones.
    Returns: 'HIGH' | 'MEDIUM' | 'LOW'
    """
    if not topic and not seed_keywords:
        return "LOW"
    all_terms = {topic or ""} | set(seed_keywords)
    overlap = len(all_terms & RHETORICAL_KEYSTONES)
    if overlap >= 2:
        return "HIGH"
    elif overlap == 1:
        return "MEDIUM"
    return "LOW"


def build_catacombs_entry(
    ghost: dict,
    mitosis_event: dict | None,
    seed_keywords: list[str],
) -> dict:
    """Build a Catacombs entry for a ghost Miner (per #2285 schema)."""
    topic = ghost.get("primary_topic") or ""
    parent = ghost.get("parent_serial") or ""
    serial = ghost["serial"]

    wake_timestamp = None
    trigger_tablet_id = None
    trigger_keywords = seed_keywords or []

    if mitosis_event:
        wake_timestamp = mitosis_event.get("timestamp")
        trigger_tablet_id = mitosis_event.get("trigger_tablet_id")
        if not trigger_keywords:
            trigger_keywords = mitosis_event.get("trigger_keywords", [])

    priority = activation_priority(topic, trigger_keywords)

    return {
        # Identity
        "serial": serial,
        "parent_serial": parent,
        "primary_topic": topic,
        "branch": serial.split(".")[-1] if "." in serial else None,
        "provenance_chain": ghost.get("provenance_chain", [serial]),

        # Catacombs-specific (#2285 schema)
        "scribe_state": "dormant",
        "inception_mode": "ghost-capped",  # per Bishop B123 schema extension
        "inception_session": "K487",
        "catacombs_entry_session": "K488",

        # Wake-event reference
        "wake_event": {
            "trigger_tablet_id": trigger_tablet_id,
            "parent_serial": parent,
            "timestamp": wake_timestamp,
            "trigger_keywords": trigger_keywords,
            "note": (
                "Parent miner reached MAX_DAUGHTERS_PER_MINER=4 cap; "
                "this ghost was allocated but never mined. "
                "Wake-event content lives in parent's bedrock files."
            ),
        },

        # Domain anchor for future re-activation
        "domain_anchor": {
            "primary_topic": topic,
            "seed_keywords": trigger_keywords,
            "activation_priority": priority,
            "activation_condition": (
                "Future query touching this domain triggers retroactive Miner-spawn "
                "+ cross-reference claim via multi_well_scores mechanism."
            ),
            "keystone_overlap": len(({topic} | set(trigger_keywords)) & RHETORICAL_KEYSTONES),
        },

        # Metadata
        "tablet_count": 0,
        "cross_ref_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def main() -> None:
    t_start = time.time()
    print("[PhaseD] K488 Phase D -- Ghost Miner Triage -> Catacombs Disposition")
    print()

    CATACOMBS_DIR.mkdir(parents=True, exist_ok=True)

    # ── Step 1: Load ghost Miners ─────────────────────────────────────────────
    print("[PhaseD] Step 1: Loading ghost Miners from snapshot...")
    ghosts = load_ghosts(SNAP)
    print(f"[PhaseD]   Ghost Miners: {len(ghosts)}")

    # ── Step 2: Read ledger for mitosis events ────────────────────────────────
    print("[PhaseD] Step 2: Reading ledger for mitosis_trigger events...")
    t2 = time.time()
    mitosis_events = load_mitosis_events(LEDGER_PATH)
    print(f"[PhaseD]   mitosis_trigger events found: {len(mitosis_events)} in {time.time()-t2:.1f}s")

    print("[PhaseD] Step 2b: Reading ledger for daughter_seeded events...")
    t2b = time.time()
    seeded_events = load_daughter_seeded_events(LEDGER_PATH)
    print(f"[PhaseD]   daughter_seeded events found: {len(seeded_events)} in {time.time()-t2b:.1f}s")

    # ── Step 3: Build + write Catacombs entries ────────────────────────────────
    print(f"[PhaseD] Step 3: Building Catacombs entries for {len(ghosts)} ghosts...")
    entries_written = 0
    entries_skipped_existing = 0
    priority_counts = Counter()
    topic_counts = Counter()

    for ghost in ghosts:
        serial = ghost["serial"]
        catacombs_path = CATACOMBS_DIR / f"{serial}.jsonl"

        if catacombs_path.exists():
            entries_skipped_existing += 1
            continue

        mitosis_ev = mitosis_events.get(serial)
        seed_kws = seeded_events.get(serial, [])

        entry = build_catacombs_entry(ghost, mitosis_ev, seed_kws)

        with catacombs_path.open("w", encoding="utf-8") as fh:
            fh.write(json.dumps(entry) + "\n")

        entries_written += 1
        priority_counts[entry["domain_anchor"]["activation_priority"]] += 1
        topic_counts[entry["primary_topic"] or "unknown"] += 1

    print(f"[PhaseD]   Written: {entries_written} | Skipped (existing): {entries_skipped_existing}")
    print(f"[PhaseD]   Priority distribution: HIGH={priority_counts['HIGH']} "
          f"MEDIUM={priority_counts['MEDIUM']} LOW={priority_counts['LOW']}")
    print()

    # ── Step 4: Topic distribution report ─────────────────────────────────────
    print("[PhaseD] Step 4: Topic distribution report...")
    topic_dist = []
    for ghost in ghosts:
        topic_dist.append({
            "serial": ghost["serial"],
            "parent_serial": ghost.get("parent_serial"),
            "primary_topic": ghost.get("primary_topic"),
            "mitosis_event_found": ghost["serial"] in mitosis_events,
            "seed_keywords_found": ghost["serial"] in seeded_events,
            "activation_priority": activation_priority(
                ghost.get("primary_topic") or "",
                seeded_events.get(ghost["serial"], [])
            ),
        })

    with TOPIC_REPORT.open("w", encoding="utf-8") as fh:
        json.dump({
            "session": "K488",
            "total_ghosts": len(ghosts),
            "topic_frequency": dict(topic_counts.most_common()),
            "priority_distribution": dict(priority_counts),
            "ghost_table": sorted(topic_dist, key=lambda x: x["activation_priority"]),
        }, fh, indent=2)
    print(f"[PhaseD]   Topic report -> {TOPIC_REPORT.name}")

    # ── Step 5: Audit log ─────────────────────────────────────────────────────
    elapsed = time.time() - t_start
    audit = {
        "session": "K488",
        "phase": "D",
        "description": "Ghost Miner Catacombs disposition",
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "elapsed_sec": round(elapsed, 1),
        "ghost_count": len(ghosts),
        "catacombs_entries_written": entries_written,
        "catacombs_entries_skipped": entries_skipped_existing,
        "catacombs_dir": str(CATACOMBS_DIR),
        "mitosis_events_matched": sum(1 for g in ghosts if g["serial"] in mitosis_events),
        "seed_keywords_matched": sum(1 for g in ghosts if g["serial"] in seeded_events),
        "priority_distribution": dict(priority_counts),
        "topic_frequency": dict(topic_counts.most_common()),
        "schema_used": "#2285 Catacombs + inception_mode: ghost-capped extension (B123)",
        "architectural_note": (
            "Ghost Miner → Catacombs disposition is the first operational connection "
            "between two previously-separate architectural lines: "
            "(1) Miner mitosis-cap producing ghost Miners, "
            "(2) Catacombs dormant-Scribe-repository (#2285). "
            "K488 is where these two lines connect operationally. "
            "Claim-candidate for #2298 or future CJ — flag for Bishop follow-up."
        ),
    }

    with AUDIT_LOG.open("w", encoding="utf-8") as fh:
        json.dump(audit, fh, indent=2)
    print(f"[PhaseD]   Audit log -> {AUDIT_LOG.name}")

    print()
    print("=" * 60)
    print(f"[PhaseD] Phase D COMPLETE in {elapsed:.1f}s")
    print(f"[PhaseD]   {entries_written} ghosts -> Catacombs entries written")
    print(f"[PhaseD]   HIGH priority activation candidates: {priority_counts['HIGH']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
