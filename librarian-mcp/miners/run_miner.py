"""
K482 Run Harness -- Phase B: Seed Root Miner on Bishop memory corpus and run.

Usage:
    python run_miner.py [--corpus-dir PATH] [--max-files N] [--time-cap-sec S]

Defaults seed on the Bishop memory directory.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from miners.miner import (
    LEDGER_PATH,
    REGISTRY,
    Miner,
    _bootstrap_ledger_chain,
)

BISHOP_MEMORY_DIR = Path(
    r"C:\Users\Administrator\.claude\projects\C--Users-Administrator-Documents\memory"
)

DEFAULT_TIME_CAP_SEC = 900  # 15 minutes
GLOBAL_MINER_CAP = 12       # hard cap on total Miner population


def collect_corpus(corpus_dir: Path) -> list[Path]:
    return sorted(corpus_dir.glob("*.md"))


def run(corpus_dir: Path, max_files: int | None, time_cap_sec: int) -> None:
    _bootstrap_ledger_chain()

    files = collect_corpus(corpus_dir)
    if max_files:
        files = files[:max_files]

    print(f"[Miner] Corpus: {corpus_dir}")
    print(f"[Miner] Files to mine: {len(files)}")
    print(f"[Miner] Time cap: {time_cap_sec}s")
    print()

    # Instantiate Root Miner
    root_serial = REGISTRY.next_root()
    root = Miner(
        serial=root_serial,
        parent_serial=None,
        primary_topic=None,
        provenance_chain=[root_serial],
    )
    print(f"[Miner] Root Miner instantiated: {root_serial}")

    # active: ordered list of (Miner, start_file_index)
    # Root starts at file 0; daughters start at their trigger file index.
    active_miners: list[tuple[Miner, int]] = [(root, 0)]
    # flat dict for quick lookup
    active: dict[str, Miner] = {root_serial: root}

    mitosis_events: list[dict] = []
    start_time = time.time()

    for file_idx, fpath in enumerate(files):
        elapsed = time.time() - start_time
        if elapsed > time_cap_sec:
            print(f"[Miner] Time cap reached ({elapsed:.0f}s). Stopping.")
            break

        # Mine with every Miner whose start_file_index <= current file_idx
        for miner, start_idx in list(active_miners):
            if file_idx < start_idx:
                continue
            if len(active) >= GLOBAL_MINER_CAP:
                # Hard cap: don't spawn more, but keep mining
                _ = miner.mine_file(fpath)
                continue

            new_daughters = miner.mine_file(fpath)
            for daughter in new_daughters:
                active[daughter.serial] = daughter
                # Daughter starts mining from the NEXT file (she was seeded on trigger)
                active_miners.append((daughter, file_idx + 1))
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
                print(f"[Mitosis #{len(mitosis_events)}] "
                      f"{daughter.parent_serial} -> {daughter.serial} "
                      f"topic='{daughter.primary_topic}' "
                      f"file={fpath.name}")

        if (file_idx + 1) % 20 == 0:
            print(f"  ... {file_idx+1}/{len(files)} files | "
                  f"{len(active)} active Miners | "
                  f"{len(mitosis_events)} mitosis events")

    elapsed_total = time.time() - start_time
    print()
    print(f"[Miner] Run complete. {len(files)} files in {elapsed_total:.1f}s.")
    print(f"[Miner] Miner population: {len(active)}")
    print(f"[Miner] Mitosis events: {len(mitosis_events)}")
    print()

    # Dump population snapshot
    snapshot_path = Path(__file__).parent / "miner_population_snapshot.jsonl"
    with snapshot_path.open("w", encoding="utf-8") as fh:
        for miner in active.values():
            fh.write(json.dumps(miner.snapshot()) + "\n")
    print(f"[Miner] Population snapshot -> {snapshot_path}")

    # Dump run summary
    summary = {
        "session": "K482",
        "bishop_session": "B123",
        "corpus_dir": str(corpus_dir),
        "files_processed": len(files),
        "elapsed_sec": round(elapsed_total, 2),
        "miner_population": len(active),
        "mitosis_events": len(mitosis_events),
        "root_serial": root_serial,
        "mitosis_log": mitosis_events,
        "miner_table": [m.snapshot() for m in active.values()],
    }
    summary_path = Path(__file__).parent / "run_summary_K482.json"
    with summary_path.open("w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2)
    print(f"[Miner] Run summary -> {summary_path}")

    # Print per-Miner table
    print()
    print("=" * 76)
    print(f"{'Serial':<30} {'Topic':<28} {'Tablets':>7} {'Daughters':>9}")
    print("-" * 76)
    for miner in active.values():
        print(
            f"{miner.serial:<30} "
            f"{(miner.primary_topic or 'TBD')[:26]:<28} "
            f"{miner.tablet_count:>7} "
            f"{len(miner.daughters):>9}"
        )
    print("=" * 76)


def main() -> None:
    parser = argparse.ArgumentParser(description="K482 Miner run harness")
    parser.add_argument(
        "--corpus-dir", type=Path, default=BISHOP_MEMORY_DIR,
    )
    parser.add_argument("--max-files", type=int, default=None)
    parser.add_argument("--time-cap-sec", type=int, default=DEFAULT_TIME_CAP_SEC)
    args = parser.parse_args()
    run(args.corpus_dir, args.max_files, args.time_cap_sec)


if __name__ == "__main__":
    main()
