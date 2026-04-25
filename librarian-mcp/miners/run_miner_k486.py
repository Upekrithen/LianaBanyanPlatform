"""
K486 Run Harness -- Bloodhound Scout + Miner + Daughter Cross-Reference

Usage:
    python run_miner_k486.py [--corpus-dir PATH] [--max-files N] [--time-cap-sec S]
                             [--no-bloodhound] [--no-crossref] [--crossref-threshold F]

K486 additions over K482 run_miner.py:
  1. Bloodhound scout-pass BEFORE Root instantiation → Root anchors to dense Well
  2. register_active_well() called on every Miner spawn → multi_well_scores on tablets
  3. claim_cross_references() called on all daughters after mining completes
  4. Run summary includes Bloodhound scout results + cross-reference stats
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from miners.bloodhound import Bloodhound
from miners.miner import (
    LEDGER_PATH,
    REGISTRY,
    Miner,
    _bootstrap_ledger_chain,
    register_active_well,
    get_active_wells,
)

BISHOP_MEMORY_DIR = Path(
    r"C:\Users\Administrator\.claude\projects\C--Users-Administrator-Documents\memory"
)

DEFAULT_TIME_CAP_SEC = 900   # 15 minutes
GLOBAL_MINER_CAP = 12        # hard cap on total Miner population
DEFAULT_CROSSREF_THRESHOLD = 0.40


def collect_corpus(corpus_dir: Path) -> list[Path]:
    return sorted(corpus_dir.glob("*.md"))


def run(
    corpus_dir: Path,
    max_files: int | None,
    time_cap_sec: int,
    use_bloodhound: bool = True,
    use_crossref: bool = True,
    crossref_threshold: float = DEFAULT_CROSSREF_THRESHOLD,
) -> dict:
    """Run the full K486 pipeline. Returns the run summary dict."""

    _bootstrap_ledger_chain()

    files = collect_corpus(corpus_dir)
    if max_files:
        files = files[:max_files]

    print(f"[K486] Corpus: {corpus_dir}")
    print(f"[K486] Files to mine: {len(files)}")
    print(f"[K486] Time cap: {time_cap_sec}s")
    print(f"[K486] Bloodhound: {'enabled' if use_bloodhound else 'disabled'}")
    print(f"[K486] Cross-reference: {'enabled' if use_crossref else 'disabled'}")
    print()

    # ── Phase 1: Bloodhound scout-pass ───────────────────────────────────────

    scout_report_dict: dict = {}
    root_anchor_topic: str | None = None

    if use_bloodhound:
        print("[Bloodhound] Scouting corpus for dense Wells...")
        hound = Bloodhound()
        scout_report = hound.scout(corpus_dir)
        scout_report_dict = scout_report.to_dict()
        root_anchor_topic = scout_report.top_well()

        print(f"[Bloodhound] Files scanned: {scout_report.files_scanned}")
        print(f"[Bloodhound] Elapsed: {scout_report.elapsed_sec:.2f}s")
        print(f"[Bloodhound] Top Well (Root anchor): {root_anchor_topic!r}")
        print()
        print(f"{'Rank':<5} {'Well':<28} {'Score':>8} {'Files':>7}  Sample keywords")
        print("-" * 78)
        for i, c in enumerate(scout_report.candidates[:10], 1):
            sample = ", ".join(c.sample_keywords[:4])
            print(f"{i:<5} {c.well_name:<28} {c.density_score:>8.4f} {c.file_count:>7}  {sample}")
        print()

    # ── Phase 2: Root Miner instantiation ────────────────────────────────────

    root_serial = REGISTRY.next_root()
    root = Miner(
        serial=root_serial,
        parent_serial=None,
        primary_topic=root_anchor_topic,  # K486: pre-anchored by Bloodhound (None if disabled)
        provenance_chain=[root_serial],
    )

    if root_anchor_topic:
        print(f"[K486] Root Miner {root_serial} pre-anchored to Well: {root_anchor_topic!r}")
    else:
        print(f"[K486] Root Miner {root_serial} — no pre-anchor (first-file-wins)")

    register_active_well(root_serial, root_anchor_topic or "")

    active_miners: list[tuple[Miner, int]] = [(root, 0)]
    active: dict[str, Miner] = {root_serial: root}
    mitosis_events: list[dict] = []
    start_time = time.time()

    # ── Phase 3: Mining loop ─────────────────────────────────────────────────

    for file_idx, fpath in enumerate(files):
        elapsed = time.time() - start_time
        if elapsed > time_cap_sec:
            print(f"[K486] Time cap reached ({elapsed:.0f}s). Stopping.")
            break

        for miner, start_idx in list(active_miners):
            if file_idx < start_idx:
                continue
            if len(active) >= GLOBAL_MINER_CAP:
                _ = miner.mine_file(fpath)
                continue

            new_daughters = miner.mine_file(fpath)
            for daughter in new_daughters:
                active[daughter.serial] = daughter
                active_miners.append((daughter, file_idx + 1))

                # K486: register daughter's Well immediately so subsequent tablets
                # score against it (forward-only multi_well_scores)
                register_active_well(daughter.serial, daughter.primary_topic or "")

                event = {
                    "mitosis_index": len(mitosis_events) + 1,
                    "trigger_file": fpath.name,
                    "trigger_file_idx": file_idx,
                    "parent_serial": daughter.parent_serial,
                    "daughter_serial": daughter.serial,
                    "daughter_primary_topic": daughter.primary_topic,
                    "elapsed_sec": round(time.time() - start_time, 2),
                }
                mitosis_events.append(event)
                print(
                    f"[Mitosis #{len(mitosis_events)}] "
                    f"{daughter.parent_serial} -> {daughter.serial} "
                    f"topic={daughter.primary_topic!r} "
                    f"file={fpath.name}"
                )

        if (file_idx + 1) % 20 == 0:
            print(
                f"  ... {file_idx+1}/{len(files)} files | "
                f"{len(active)} active Miners | "
                f"{len(mitosis_events)} mitosis events"
            )

    elapsed_mining = time.time() - start_time
    total_tablets = sum(m.tablet_count for m in active.values())

    print()
    print(f"[K486] Mining complete. {len(files)} files in {elapsed_mining:.1f}s.")
    print(f"[K486] Miner population: {len(active)} | Mitosis events: {len(mitosis_events)}")
    print(f"[K486] Total tablets: {total_tablets}")
    print()

    # ── Phase 4: Daughter cross-reference ────────────────────────────────────

    crossref_stats: list[dict] = []

    if use_crossref:
        print("[CrossRef] Building daughter cross-reference indices...")
        daughters = [m for m in active.values() if m.parent_serial is not None]
        print(f"[CrossRef] Daughters to cross-reference: {len(daughters)}")
        print()

        for daughter in daughters:
            t_cr = time.time()
            claimed = daughter.claim_cross_references(threshold=crossref_threshold)
            elapsed_cr = time.time() - t_cr
            print(
                f"[CrossRef] {daughter.serial} (topic={daughter.primary_topic!r}) "
                f"→ {claimed} tablets claimed in {elapsed_cr:.1f}s"
            )
            crossref_stats.append({
                "daughter_serial": daughter.serial,
                "daughter_primary_topic": daughter.primary_topic,
                "cross_ref_count": claimed,
                "elapsed_sec": round(elapsed_cr, 2),
            })

        total_crossrefs = sum(s["cross_ref_count"] for s in crossref_stats)
        print()
        print(f"[CrossRef] Done. Total cross-references: {total_crossrefs}")
        print()

    # ── Phase 5: Dump artifacts ───────────────────────────────────────────────

    snapshot_path = Path(__file__).parent / "miner_population_snapshot_K486.jsonl"
    with snapshot_path.open("w", encoding="utf-8") as fh:
        for miner in active.values():
            fh.write(json.dumps(miner.snapshot()) + "\n")
    print(f"[K486] Population snapshot -> {snapshot_path.name}")

    summary = {
        "session": "K486",
        "bishop_session": "B123",
        "corpus_dir": str(corpus_dir),
        "files_processed": min(len(files), file_idx + 1) if files else 0,
        "elapsed_sec": round(time.time() - start_time, 2),
        "miner_population": len(active),
        "mitosis_events": len(mitosis_events),
        "total_tablets": total_tablets,
        "root_serial": root_serial,
        "root_anchor_topic": root_anchor_topic,
        "bloodhound_enabled": use_bloodhound,
        "bloodhound_report": scout_report_dict,
        "crossref_enabled": use_crossref,
        "crossref_threshold": crossref_threshold,
        "crossref_stats": crossref_stats,
        "mitosis_log": mitosis_events,
        "miner_table": [m.snapshot() for m in active.values()],
    }

    summary_path = Path(__file__).parent / "run_summary_K486.json"
    with summary_path.open("w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2)
    print(f"[K486] Run summary -> {summary_path.name}")

    # ── Phase 6: Print per-Miner table ───────────────────────────────────────

    print()
    print("=" * 90)
    print(
        f"{'Serial':<30} {'Topic':<22} {'Tablets':>7} "
        f"{'Daughters':>9} {'CrossRefs':>9}"
    )
    print("-" * 90)
    for miner in active.values():
        snap = miner.snapshot()
        print(
            f"{snap['serial']:<30} "
            f"{(snap['primary_topic'] or 'TBD')[:20]:<22} "
            f"{snap['tablet_count']:>7} "
            f"{len(snap['daughter_serials']):>9} "
            f"{snap['cross_ref_count']:>9}"
        )
    print("=" * 90)

    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="K486 Miner+Bloodhound+CrossRef run harness")
    parser.add_argument("--corpus-dir", type=Path, default=BISHOP_MEMORY_DIR)
    parser.add_argument("--max-files", type=int, default=None)
    parser.add_argument("--time-cap-sec", type=int, default=DEFAULT_TIME_CAP_SEC)
    parser.add_argument("--no-bloodhound", action="store_true",
                        help="Disable Bloodhound scout-pass (Root uses first-file-wins)")
    parser.add_argument("--no-crossref", action="store_true",
                        help="Disable daughter cross-reference step")
    parser.add_argument("--crossref-threshold", type=float, default=DEFAULT_CROSSREF_THRESHOLD,
                        help=f"Score threshold for daughter cross-reference claim (default {DEFAULT_CROSSREF_THRESHOLD})")
    args = parser.parse_args()

    run(
        corpus_dir=args.corpus_dir,
        max_files=args.max_files,
        time_cap_sec=args.time_cap_sec,
        use_bloodhound=not args.no_bloodhound,
        use_crossref=not args.no_crossref,
        crossref_threshold=args.crossref_threshold,
    )


if __name__ == "__main__":
    main()
