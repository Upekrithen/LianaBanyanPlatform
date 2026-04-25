"""
K487 Post-Mining Recovery Script

Mining completed all 16,176 files but crashed before the post-mining steps
(cross-reference, population snapshot, run summary) due to a CP1252 Unicode
encoding error on box-drawing chars in the summary banner.

This script:
  1. Reads ip_ledger.jsonl to reconstruct the K487 Miner population
     (serials, parent relationships, topics, tablet counts) from the
     M-0002 family entries
  2. Instantiates Daughter Miner objects with just enough state to run
     claim_cross_references()
  3. Runs claim_cross_references() for all daughters
  4. Counts tablets from bedrock JSONL files
  5. Writes miner_population_snapshot_K487.jsonl + run_summary_K487.json

K487 · B123 · Post-mining recovery
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path
from dataclasses import dataclass, field
from collections import Counter
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).parent.parent))

from miners.miner import (
    BEDROCK_DIR,
    CROSSREF_DIR,
    LEDGER_PATH,
    Miner,
    bootstrap_serial_registry_from_bedrock,
    _bootstrap_ledger_chain,
    get_active_wells,
)

SESSION = "K487"
BISHOP_SESSION = "B123"
CORPUS_DIR = r"C:\Users\Administrator\Documents\LianaBanyanPlatform"
DEFAULT_CROSSREF_THRESHOLD = 0.40


def read_ledger_k487() -> dict:
    """
    Parse ip_ledger.jsonl to extract K487 Miner population.
    K487 serials all start with LB-CAT.M-0002.
    Returns dict keyed by serial with {parent_serial, primary_topic, tablet_count}.

    Topic sourcing:
    - Root miner: topic_anchor event (written when primary_topic starts as None)
      OR the Bloodhound top-well if root was pre-anchored and topic_anchor is absent.
    - Daughter miners: mitosis_trigger event on the parent contains
      daughter_serial + new_category_primary -- this is the canonical topic source.
    """
    miners_info: dict[str, dict] = {}
    tablet_counts: Counter = Counter()

    if not LEDGER_PATH.exists():
        print(f"[Recovery] ERROR: {LEDGER_PATH} not found")
        return {}

    with LEDGER_PATH.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue

            serial = entry.get("miner_serial", "")
            event = entry.get("event_type", "")

            # Always register instantiate for M-0002 family
            if serial.startswith("LB-CAT.M-0002") and event == "instantiate":
                if serial not in miners_info:
                    miners_info[serial] = {
                        "serial": serial,
                        "parent_serial": entry.get("parent_serial"),
                        "primary_topic": None,
                    }

            # topic_anchor: only fires for root (pre-anchored daughters skip this)
            elif serial.startswith("LB-CAT.M-0002") and event == "topic_anchor":
                if serial in miners_info:
                    miners_info[serial]["primary_topic"] = entry.get("primary_topic")

            # mitosis_trigger: fired by PARENT; contains daughter serial and topic
            # This is the canonical topic source for daughters
            elif event == "mitosis_trigger":
                daughter_serial = entry.get("daughter_serial", "")
                new_topic = entry.get("new_category_primary")
                if daughter_serial.startswith("LB-CAT.M-0002") and new_topic:
                    if daughter_serial not in miners_info:
                        miners_info[daughter_serial] = {
                            "serial": daughter_serial,
                            "parent_serial": serial,
                            "primary_topic": None,
                        }
                    miners_info[daughter_serial]["primary_topic"] = new_topic

            elif serial.startswith("LB-CAT.M-0002") and event == "mine_tablet":
                tablet_counts[serial] += 1

    # Merge tablet counts
    for serial, info in miners_info.items():
        info["tablet_count"] = tablet_counts.get(serial, 0)

    # Fallback for root: if still None, use Bloodhound report
    root_serial = "LB-CAT.M-0002"
    if root_serial in miners_info and miners_info[root_serial]["primary_topic"] is None:
        bh_path = Path(__file__).parent / f"bloodhound_report_{SESSION}.json"
        if bh_path.exists():
            try:
                bh = json.loads(bh_path.read_text(encoding="utf-8"))
                miners_info[root_serial]["primary_topic"] = bh.get("top_well")
            except Exception:
                pass
        if miners_info[root_serial]["primary_topic"] is None:
            miners_info[root_serial]["primary_topic"] = "technical"  # known from run log

    return miners_info


def reconstruct_bedrock_stats(serial: str) -> dict:
    """
    Count tablets and depth distribution from bedrock JSONL file for a serial.
    """
    bedrock_path = BEDROCK_DIR / f"{serial}.jsonl"
    depth_dist = {i: 0 for i in range(1, 7)}
    tablet_count = 0
    kw_pool: Counter = Counter()

    if not bedrock_path.exists():
        return {"tablet_count": 0, "depth_distribution": depth_dist, "top_keywords": []}

    try:
        with bedrock_path.open("r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    tablet = json.loads(line)
                    tablet_count += 1
                    depth = tablet.get("depth_level", 6)
                    if depth in depth_dist:
                        depth_dist[depth] += 1
                    kw_pool.update(tablet.get("keywords", []))
                except json.JSONDecodeError:
                    continue
    except Exception as e:
        print(f"[Recovery] Warning: could not read bedrock for {serial}: {e}")

    top_kws = [kw for kw, _ in kw_pool.most_common(10)]
    return {
        "tablet_count": tablet_count,
        "depth_distribution": depth_dist,
        "top_keywords": top_kws,
    }


def count_crossrefs(serial: str) -> int:
    """Count existing cross-reference entries for a serial."""
    crossref_path = CROSSREF_DIR / f"{serial}.jsonl"
    if not crossref_path.exists():
        return 0
    try:
        with crossref_path.open("r", encoding="utf-8") as fh:
            return sum(1 for line in fh if line.strip())
    except Exception:
        return 0


def main() -> None:
    t_start = time.time()
    print(f"[Recovery] K487 Post-Mining Recovery Script")
    print(f"[Recovery] Reading ip_ledger to reconstruct Miner population...")

    # Bootstrap serial registry (needed for Miner instantiation)
    bootstrap_serial_registry_from_bedrock(BEDROCK_DIR)
    _bootstrap_ledger_chain()

    miners_info = read_ledger_k487()
    if not miners_info:
        print("[Recovery] ERROR: No K487 Miner entries found in ip_ledger. Exiting.")
        sys.exit(1)

    print(f"[Recovery] Found {len(miners_info)} K487 Miners in ip_ledger")

    # Separate roots and daughters
    roots = {s: info for s, info in miners_info.items() if info["parent_serial"] is None}
    daughters = {s: info for s, info in miners_info.items() if info["parent_serial"] is not None}
    print(f"[Recovery] Roots: {len(roots)} | Daughters: {len(daughters)}")
    print()

    # Register active wells (needed for ledger entries in claim_cross_references)
    for serial, info in miners_info.items():
        topic = info.get("primary_topic") or ""
        from miners.miner import register_active_well
        register_active_well(serial, topic)

    # Build Daughter Miner objects for cross-reference
    daughter_objects: list[Miner] = []
    for serial, info in daughters.items():
        parent = info["parent_serial"]
        topic = info.get("primary_topic")

        # Find provenance chain: walk up parent chain
        chain = [serial]
        cur = parent
        while cur and cur in miners_info:
            chain.insert(0, cur)
            cur = miners_info[cur].get("parent_serial")

        try:
            m = Miner(
                serial=serial,
                parent_serial=parent,
                primary_topic=topic,
                provenance_chain=chain,
            )
            m.tablet_count = info.get("tablet_count", 0)
            daughter_objects.append(m)
        except Exception as e:
            print(f"[Recovery] Warning: could not instantiate {serial}: {e}")

    print(f"[Recovery] Instantiated {len(daughter_objects)} daughter Miner objects")
    print()

    # ── Cross-reference ───────────────────────────────────────────────────────

    print("[CrossRef] Building daughter cross-reference indices...")
    crossref_stats: list[dict] = []

    for d in sorted(daughter_objects, key=lambda m: m.serial):
        # Skip ghost Miners (spawned during capped mitosis, never actually mined)
        bedrock_path = BEDROCK_DIR / f"{d.serial}.jsonl"
        if not bedrock_path.exists():
            continue

        # Skip if no topic (can't cross-reference without a primary topic)
        if not d.primary_topic:
            print(f"[CrossRef] {d.serial} — no topic, skipping")
            continue

        # Skip if already has cross-refs (e.g. from a prior partial run)
        existing = count_crossrefs(d.serial)
        if existing > 0:
            print(f"[CrossRef] {d.serial} already has {existing:,} cross-refs — skipping")
            crossref_stats.append({
                "daughter_serial": d.serial,
                "daughter_primary_topic": d.primary_topic,
                "cross_ref_count": existing,
                "elapsed_sec": 0.0,
                "skipped_existing": True,
            })
            continue

        t_cr = time.time()
        claimed = d.claim_cross_references(threshold=DEFAULT_CROSSREF_THRESHOLD)
        elapsed_cr = time.time() - t_cr
        print(
            f"[CrossRef] {d.serial} (topic={d.primary_topic!r}) "
            f"-> {claimed:,} tablets claimed in {elapsed_cr:.1f}s"
        )
        crossref_stats.append({
            "daughter_serial": d.serial,
            "daughter_primary_topic": d.primary_topic,
            "cross_ref_count": claimed,
            "elapsed_sec": round(elapsed_cr, 2),
            "skipped_existing": False,
        })

    total_crossrefs = sum(s["cross_ref_count"] for s in crossref_stats)
    print()
    print(f"[CrossRef] Done. Total cross-references: {total_crossrefs:,}")
    print()

    # ── Population snapshot ───────────────────────────────────────────────────

    print("[Recovery] Building population snapshot from bedrock files...")
    miner_table = []
    total_tablets = 0

    for serial, info in sorted(miners_info.items()):
        stats = reconstruct_bedrock_stats(serial)
        total_tablets += stats["tablet_count"]

        # Find daughters of this miner
        daughter_serials = [
            s for s, di in miners_info.items()
            if di.get("parent_serial") == serial
        ]

        xref_count = count_crossrefs(serial)

        snap = {
            "serial": serial,
            "parent_serial": info.get("parent_serial"),
            "primary_topic": info.get("primary_topic"),
            "branch": serial.split(".")[-1] if "." in serial else None,
            "provenance_chain": [serial],
            "tablet_count": stats["tablet_count"],
            "depth_distribution": stats["depth_distribution"],
            "connection_count": 0,
            "daughter_serials": daughter_serials,
            "top_keywords": stats["top_keywords"],
            "primary_sig_locked": True,
            "primary_sig_size": 30,
            "cross_ref_count": xref_count,
            "recovered": True,
        }
        miner_table.append(snap)

    snapshot_path = Path(__file__).parent / f"miner_population_snapshot_{SESSION}.jsonl"
    with snapshot_path.open("w", encoding="utf-8") as fh:
        for snap in miner_table:
            fh.write(json.dumps(snap) + "\n")
    print(f"[Recovery] Population snapshot -> {snapshot_path.name}")
    print(f"[Recovery] Total tablets across all miners: {total_tablets:,}")
    print()

    # ── Summary ───────────────────────────────────────────────────────────────

    elapsed_total = time.time() - t_start

    # Try to load bloodhound report
    bh_report_path = Path(__file__).parent / f"bloodhound_report_{SESSION}.json"
    scout_report_dict = {}
    if bh_report_path.exists():
        try:
            with bh_report_path.open("r", encoding="utf-8") as fh:
                scout_report_dict = json.load(fh)
        except Exception:
            pass

    summary = {
        "session": SESSION,
        "bishop_session": BISHOP_SESSION,
        "corpus_dir": CORPUS_DIR,
        "recovery_script": "run_k487_post_mining.py",
        "mining_completed": True,
        "mining_crashed_at": "post-mining banner print (CP1252 Unicode error)",
        "files_discovered": 16176,
        "files_processed": 16176,
        "elapsed_mining_sec": 1919,
        "miner_population": len(miners_info),
        "root_count": len(roots),
        "daughter_count": len(daughters),
        "mitosis_events": len(daughters),
        "total_tablets": total_tablets,
        "root_serial": "LB-CAT.M-0002",
        "root_anchor_topic": "technical",
        "bloodhound_report": scout_report_dict,
        "crossref_enabled": True,
        "crossref_threshold": DEFAULT_CROSSREF_THRESHOLD,
        "crossref_stats": crossref_stats,
        "total_crossrefs": total_crossrefs,
        "miner_table": miner_table,
        "recovered_at": datetime.now(timezone.utc).isoformat(),
    }

    summary_path = Path(__file__).parent / f"run_summary_{SESSION}.json"
    with summary_path.open("w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2)
    print(f"[Recovery] Run summary -> {summary_path.name}")

    # ── Per-Miner table ───────────────────────────────────────────────────────

    print()
    print("=" * 95)
    print(
        f"{'Serial':<35} {'Topic':<22} {'Tablets':>8} {'Daughters':>10} {'CrossRefs':>10}"
    )
    print("-" * 95)
    for snap in sorted(miner_table, key=lambda s: s["serial"]):
        print(
            f"{snap['serial']:<35} "
            f"{(snap['primary_topic'] or 'TBD')[:20]:<22} "
            f"{snap['tablet_count']:>8,} "
            f"{len(snap['daughter_serials']):>10} "
            f"{snap['cross_ref_count']:>10,}"
        )
    print("=" * 95)
    print()
    print(f"[Recovery] Done in {time.time() - t_start:.1f}s. K487 recovery complete.")
    print("[Recovery] All post-mining artifacts written. Mining run is fully landed.")


if __name__ == "__main__":
    main()
