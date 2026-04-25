"""
K487 Run Harness — First Real-Scale Corpus Mining Run (65GB+)

Usage:
    python run_miner_k487.py --corpus-dir PATH [options]

    --corpus-dir PATH          Root of the 65GB+ corpus tree (REQUIRED)
    --max-files N              Limit total files processed (default: unlimited)
    --time-cap-sec S           Wall-time cap in seconds (default: 21600 = 6h)
    --no-bloodhound            Disable Bloodhound scout-pass (not recommended)
    --no-crossref              Disable daughter cross-reference step
    --crossref-threshold F     Cross-ref score threshold (default: 0.40)
    --extensions EXT [EXT...]  File extensions to mine (default: .md .txt)
    --progress-every N         Print progress every N files (default: 100)
    --bloodhound-max-bytes N   Max bytes per file in Bloodhound scout (default: 100000)

K487 additions over K486 run harness:
  1. Recursive file collection (rglob) instead of flat glob
  2. Multi-extension support (--extensions)
  3. Serial registry bootstrapped from existing bedrock to avoid collision with
     K482/K486 artifacts (LB-CAT.M-0001 family)
  4. Memory monitoring via psutil if available; warns at >80% RAM
  5. Configurable progress reporting interval
  6. Corpus-cleanliness counters (skipped, encoding-error, empty, too-small)
  7. Bloodhound report saved to miners/bloodhound_report_K487.json
  8. Run summary saved to miners/run_summary_K487.json
  9. Population snapshot saved to miners/miner_population_snapshot_K487.jsonl
  10. 6-hour default wall-time cap (vs 15-minute K486 cap)
  11. Global Miner cap raised to 50 to accommodate corpus diversity at scale

REF Staff safety verification: no writes touch the source corpus directory.
All output goes to librarian-mcp/miners/ (bedrock/, cross_references/,
ip_ledger.jsonl, run artifacts) and librarian-mcp/sculptors/ (not touched here).

K487 · B123
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
    BEDROCK_DIR,
    LEDGER_PATH,
    REGISTRY,
    Miner,
    _bootstrap_ledger_chain,
    bootstrap_serial_registry_from_bedrock,
    get_active_wells,
    register_active_well,
)

# ── Constants ─────────────────────────────────────────────────────────────────

SESSION = "K487"
BISHOP_SESSION = "B123"

DEFAULT_TIME_CAP_SEC = 21_600        # 6 hours
GLOBAL_MINER_CAP = 50                # raised from K486's 12 for corpus diversity
DEFAULT_CROSSREF_THRESHOLD = 0.40
DEFAULT_EXTENSIONS = (".md", ".txt")
DEFAULT_PROGRESS_EVERY = 100
DEFAULT_BLOODHOUND_MAX_BYTES = 100_000

# Directories to exclude from corpus collection (non-Founder content)
DEFAULT_EXCLUDE_DIRS = {
    "node_modules", ".git", "dist", "__pycache__", ".next", ".nuxt",
    "build", "coverage", ".venv", "venv", ".cache", ".tox",
}

# ── Memory monitor ────────────────────────────────────────────────────────────

try:
    import psutil as _psutil
    _HAVE_PSUTIL = True
except ImportError:
    _HAVE_PSUTIL = False


def _ram_percent() -> float | None:
    """Return RAM usage percent [0-100] or None if psutil unavailable."""
    if _HAVE_PSUTIL:
        return _psutil.virtual_memory().percent
    return None


def _check_memory(warn_threshold: float = 80.0) -> bool:
    """Return True if memory pressure is high (>warn_threshold %). Logs a warning."""
    pct = _ram_percent()
    if pct is not None and pct > warn_threshold:
        print(
            f"[{SESSION}] ⚠ RAM usage {pct:.1f}% > {warn_threshold:.0f}% threshold. "
            "Consider reducing --max-files or restarting with a lower GLOBAL_MINER_CAP."
        )
        return True
    return False


# ── Recursive file collection ─────────────────────────────────────────────────

def collect_corpus(
    corpus_dir: Path,
    extensions: tuple[str, ...] = DEFAULT_EXTENSIONS,
    exclude_dirs: set[str] | None = None,
) -> list[Path]:
    """
    Recursively collect all files with the given extensions under corpus_dir,
    skipping directories in exclude_dirs (e.g. node_modules, .git, dist).
    Returns a sorted, deduplicated list.
    """
    exc = exclude_dirs if exclude_dirs is not None else DEFAULT_EXCLUDE_DIRS
    files: list[Path] = []
    for ext in extensions:
        for fpath in corpus_dir.rglob(f"*{ext}"):
            # Skip if any parent directory component is in the exclude set
            if any(part in exc for part in fpath.parts):
                continue
            files.append(fpath)
    return sorted(set(files))


# ── Main run ──────────────────────────────────────────────────────────────────

def run(
    corpus_dir: Path,
    max_files: int | None,
    time_cap_sec: int,
    extensions: tuple[str, ...] = DEFAULT_EXTENSIONS,
    use_bloodhound: bool = True,
    use_crossref: bool = True,
    crossref_threshold: float = DEFAULT_CROSSREF_THRESHOLD,
    progress_every: int = DEFAULT_PROGRESS_EVERY,
    bloodhound_max_bytes: int = DEFAULT_BLOODHOUND_MAX_BYTES,
    exclude_dirs: set[str] | None = None,
) -> dict:
    """Run the full K487 pipeline. Returns the run summary dict."""

    t_global_start = time.time()

    # ── Pre-flight bootstraps ─────────────────────────────────────────────────

    _bootstrap_ledger_chain()

    preregistered = bootstrap_serial_registry_from_bedrock(BEDROCK_DIR)
    if preregistered:
        print(
            f"[{SESSION}] Serial registry bootstrapped: {preregistered} existing serials "
            f"pre-loaded (REGISTRY._counter={REGISTRY._counter}). "
            f"Next root will be LB-CAT.M-{REGISTRY._counter + 1:04d}."
        )

    # ── Corpus collection ─────────────────────────────────────────────────────

    exc = exclude_dirs if exclude_dirs is not None else DEFAULT_EXCLUDE_DIRS
    print(f"\n[{SESSION}] Collecting corpus files recursively from: {corpus_dir}")
    print(f"[{SESSION}] Extensions: {extensions}")
    print(f"[{SESSION}] Excluding dirs: {sorted(exc)}")
    t_collect = time.time()
    files = collect_corpus(corpus_dir, extensions, exc)
    elapsed_collect = time.time() - t_collect
    print(
        f"[{SESSION}] Files found: {len(files):,} in {elapsed_collect:.1f}s"
    )

    if not files:
        print(f"[{SESSION}] ERROR: No files found matching {extensions} under {corpus_dir}")
        print(f"[{SESSION}] Check the path and try again.")
        sys.exit(1)

    if max_files:
        files = files[:max_files]
        print(f"[{SESSION}] Capped to first {max_files:,} files (--max-files)")

    print(f"[{SESSION}] Files to mine: {len(files):,}")
    print(f"[{SESSION}] Time cap: {time_cap_sec}s ({time_cap_sec/3600:.1f}h)")
    print(f"[{SESSION}] Bloodhound: {'enabled' if use_bloodhound else 'disabled'}")
    print(f"[{SESSION}] Cross-reference: {'enabled' if use_crossref else 'disabled'}")
    print()

    # ── Phase B: Bloodhound scout-pass ────────────────────────────────────────

    scout_report_dict: dict = {}
    root_anchor_topic: str | None = None

    if use_bloodhound:
        print(f"[Bloodhound] Scouting corpus for dense Wells ({len(files):,} files)...")
        print(f"[Bloodhound] Max bytes per file: {bloodhound_max_bytes:,}")
        hound = Bloodhound(
            extensions=extensions,
            max_bytes_per_file=bloodhound_max_bytes,
            exclude_dirs=exc,
        )
        t_scout = time.time()
        scout_report = hound.scout(corpus_dir)
        elapsed_scout = time.time() - t_scout
        scout_report_dict = scout_report.to_dict()
        root_anchor_topic = scout_report.top_well()

        print(f"[Bloodhound] Files scanned: {scout_report.files_scanned:,}")
        print(f"[Bloodhound] Elapsed: {elapsed_scout:.1f}s")
        print(f"[Bloodhound] Top Well (Root anchor): {root_anchor_topic!r}")
        print()
        print(f"{'Rank':<5} {'Well':<28} {'Score':>8} {'Files':>7}  Sample keywords")
        print("-" * 78)
        for i, c in enumerate(scout_report.candidates[:20], 1):
            sample = ", ".join(c.sample_keywords[:4])
            print(
                f"{i:<5} {c.well_name:<28} {c.density_score:>8.4f} "
                f"{c.file_count:>7}  {sample}"
            )
        print()

        # Pause-gate: if top Well is suspicious (>50% of files all dominated by
        # the same filename-derived keyword), flag it for Founder review.
        if scout_report.candidates:
            top = scout_report.candidates[0]
            file_dominance = top.file_count / max(1, scout_report.files_scanned)
            if file_dominance > 0.50:
                print(
                    f"[{SESSION}] ⚠ CORPUS-CLEANLINESS ALERT: Top Well "
                    f"'{top.well_name}' dominates {file_dominance*100:.1f}% of all files "
                    f"({top.file_count:,} / {scout_report.files_scanned:,}). "
                    "This may indicate duplicate filenames or a poorly-structured corpus. "
                    "Review before drawing conclusions from the Well ranking."
                )

        # Save Bloodhound report
        bh_report_path = Path(__file__).parent / f"bloodhound_report_{SESSION}.json"
        with bh_report_path.open("w", encoding="utf-8") as fh:
            json.dump(scout_report_dict, fh, indent=2)
        print(f"[Bloodhound] Report -> {bh_report_path.name}")
        print()

    # ── Phase C: Root Miner instantiation ─────────────────────────────────────

    root_serial = REGISTRY.next_root()
    root = Miner(
        serial=root_serial,
        parent_serial=None,
        primary_topic=root_anchor_topic,
        provenance_chain=[root_serial],
    )

    if root_anchor_topic:
        print(
            f"[{SESSION}] Root Miner {root_serial} pre-anchored to Well: "
            f"{root_anchor_topic!r}"
        )
    else:
        print(f"[{SESSION}] Root Miner {root_serial} — no pre-anchor (first-file-wins)")

    register_active_well(root_serial, root_anchor_topic or "")

    active_miners: list[tuple[Miner, int]] = [(root, 0)]
    active: dict[str, Miner] = {root_serial: root}
    mitosis_events: list[dict] = []
    skipped_empty = 0
    skipped_error = 0
    start_time = time.time()

    # ── Phase C: Mining loop ──────────────────────────────────────────────────

    last_progress_ts = start_time
    for file_idx, fpath in enumerate(files):
        elapsed = time.time() - start_time
        if elapsed > time_cap_sec:
            print(f"\n[{SESSION}] Time cap reached ({elapsed:.0f}s / {time_cap_sec}s). Stopping.")
            break

        # Per-file: let every active Miner see it
        file_produced_tablets = False
        for miner, start_idx in list(active_miners):
            if file_idx < start_idx:
                continue
            if len(active) >= GLOBAL_MINER_CAP:
                # Cap reached: mine but don't spawn more daughters
                result = miner.mine_file(fpath)
                if result is None:
                    skipped_empty += 1
                elif isinstance(result, list):
                    pass  # daughters suppressed by cap
                file_produced_tablets = True
                continue

            new_daughters = miner.mine_file(fpath)
            if new_daughters is None:
                skipped_empty += 1
            else:
                file_produced_tablets = True
                for daughter in new_daughters:
                    active[daughter.serial] = daughter
                    active_miners.append((daughter, file_idx + 1))
                    register_active_well(daughter.serial, daughter.primary_topic or "")

                    event = {
                        "mitosis_index": len(mitosis_events) + 1,
                        "trigger_file": str(fpath),
                        "trigger_file_idx": file_idx,
                        "parent_serial": daughter.parent_serial,
                        "daughter_serial": daughter.serial,
                        "daughter_primary_topic": daughter.primary_topic,
                        "elapsed_sec": round(time.time() - start_time, 2),
                    }
                    mitosis_events.append(event)
                    print(
                        f"  [Mitosis #{len(mitosis_events)}] "
                        f"{daughter.parent_serial} -> {daughter.serial} "
                        f"topic={daughter.primary_topic!r}"
                    )

        if not file_produced_tablets:
            skipped_empty += 1

        # Progress report
        if (file_idx + 1) % progress_every == 0:
            now = time.time()
            rate = progress_every / max(0.1, now - last_progress_ts)
            elapsed_total = now - start_time
            eta_sec = (len(files) - file_idx - 1) / max(0.1, rate)
            ram_pct = _ram_percent()
            ram_str = f" | RAM {ram_pct:.0f}%" if ram_pct is not None else ""
            print(
                f"  [{SESSION}] {file_idx+1:>7,}/{len(files):>7,} files | "
                f"{len(active):>3} miners | "
                f"{len(mitosis_events):>4} mitosis | "
                f"{rate:.0f} files/s | "
                f"elapsed {elapsed_total:.0f}s | "
                f"ETA ~{eta_sec/60:.0f}m"
                f"{ram_str}"
            )
            last_progress_ts = now

            # Memory guard — warn only; throttling left to Founder judgment
            _check_memory(warn_threshold=80.0)

    elapsed_mining = time.time() - start_time
    total_tablets = sum(m.tablet_count for m in active.values())
    files_processed = min(len(files), file_idx + 1) if files else 0

    print()
    print(f"[{SESSION}] -- Mining complete --------------------------------------------------")
    print(f"[{SESSION}] Files processed:  {files_processed:,} / {len(files):,}")
    print(f"[{SESSION}] Elapsed:          {elapsed_mining:.1f}s ({elapsed_mining/3600:.2f}h)")
    print(f"[{SESSION}] Miner population: {len(active)}")
    print(f"[{SESSION}] Mitosis events:   {len(mitosis_events)}")
    print(f"[{SESSION}] Total tablets:    {total_tablets:,}")
    print(f"[{SESSION}] Skipped (empty/error): {skipped_empty}")
    print()

    # ── Phase D (partial): Daughter cross-reference ───────────────────────────

    crossref_stats: list[dict] = []

    if use_crossref:
        print(f"[CrossRef] Building daughter cross-reference indices...")
        daughters = [m for m in active.values() if m.parent_serial is not None]
        print(f"[CrossRef] Daughters to cross-reference: {len(daughters)}")
        print()

        for daughter in daughters:
            t_cr = time.time()
            claimed = daughter.claim_cross_references(threshold=crossref_threshold)
            elapsed_cr = time.time() - t_cr
            print(
                f"[CrossRef] {daughter.serial} (topic={daughter.primary_topic!r}) "
                f"→ {claimed:,} tablets claimed in {elapsed_cr:.1f}s"
            )
            crossref_stats.append({
                "daughter_serial": daughter.serial,
                "daughter_primary_topic": daughter.primary_topic,
                "cross_ref_count": claimed,
                "elapsed_sec": round(elapsed_cr, 2),
            })

        total_crossrefs = sum(s["cross_ref_count"] for s in crossref_stats)
        print()
        print(f"[CrossRef] Done. Total cross-references: {total_crossrefs:,}")
        print()

    # ── Dump artifacts ────────────────────────────────────────────────────────

    snapshot_path = Path(__file__).parent / f"miner_population_snapshot_{SESSION}.jsonl"
    with snapshot_path.open("w", encoding="utf-8") as fh:
        for miner in active.values():
            fh.write(json.dumps(miner.snapshot()) + "\n")
    print(f"[{SESSION}] Population snapshot -> {snapshot_path.name}")

    active_wells_snapshot = get_active_wells()
    summary = {
        "session": SESSION,
        "bishop_session": BISHOP_SESSION,
        "corpus_dir": str(corpus_dir),
        "extensions": list(extensions),
        "files_discovered": len(files),
        "files_processed": files_processed,
        "elapsed_sec": round(time.time() - t_global_start, 2),
        "elapsed_mining_sec": round(elapsed_mining, 2),
        "miner_population": len(active),
        "mitosis_events": len(mitosis_events),
        "total_tablets": total_tablets,
        "skipped_empty_or_error": skipped_empty,
        "root_serial": root_serial,
        "root_anchor_topic": root_anchor_topic,
        "global_miner_cap": GLOBAL_MINER_CAP,
        "preregistered_serials": preregistered,
        "bloodhound_enabled": use_bloodhound,
        "bloodhound_report": scout_report_dict,
        "crossref_enabled": use_crossref,
        "crossref_threshold": crossref_threshold,
        "crossref_stats": crossref_stats,
        "mitosis_log": mitosis_events,
        "active_wells": active_wells_snapshot,
        "miner_table": [m.snapshot() for m in active.values()],
    }

    summary_path = Path(__file__).parent / f"run_summary_{SESSION}.json"
    with summary_path.open("w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2)
    print(f"[{SESSION}] Run summary -> {summary_path.name}")

    # ── Per-Miner table ───────────────────────────────────────────────────────

    print()
    print("=" * 100)
    print(
        f"{'Serial':<35} {'Topic':<22} {'Tablets':>8} "
        f"{'Daughters':>10} {'CrossRefs':>10} {'Depth1pct':>10}"
    )
    print("-" * 100)
    for miner in sorted(active.values(), key=lambda m: m.serial):
        snap = miner.snapshot()
        depth_dist = snap["depth_distribution"]
        total_t = max(1, sum(depth_dist.values()))
        depth1_pct = round(depth_dist.get(1, 0) / total_t * 100, 1)
        print(
            f"{snap['serial']:<35} "
            f"{(snap['primary_topic'] or 'TBD')[:20]:<22} "
            f"{snap['tablet_count']:>8,} "
            f"{len(snap['daughter_serials']):>10} "
            f"{snap['cross_ref_count']:>10,} "
            f"{depth1_pct:>7.1f}%"
        )
    print("=" * 100)

    return summary


# ── CLI ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description=f"{SESSION} Miner+Bloodhound+CrossRef run harness (first real-scale 65GB+ corpus)"
    )
    parser.add_argument(
        "--corpus-dir", type=Path, required=True,
        help="Root of the 65GB+ corpus directory tree (REQUIRED)"
    )
    parser.add_argument(
        "--max-files", type=int, default=None,
        help="Limit total files processed (default: unlimited)"
    )
    parser.add_argument(
        "--time-cap-sec", type=int, default=DEFAULT_TIME_CAP_SEC,
        help=f"Wall-time cap in seconds (default: {DEFAULT_TIME_CAP_SEC} = 6h)"
    )
    parser.add_argument(
        "--no-bloodhound", action="store_true",
        help="Disable Bloodhound scout-pass (Root uses first-file-wins)"
    )
    parser.add_argument(
        "--no-crossref", action="store_true",
        help="Disable daughter cross-reference step"
    )
    parser.add_argument(
        "--crossref-threshold", type=float, default=DEFAULT_CROSSREF_THRESHOLD,
        help=f"Score threshold for daughter cross-reference claim (default {DEFAULT_CROSSREF_THRESHOLD})"
    )
    parser.add_argument(
        "--extensions", nargs="+", default=list(DEFAULT_EXTENSIONS),
        help=f"File extensions to mine (default: {list(DEFAULT_EXTENSIONS)})"
    )
    parser.add_argument(
        "--progress-every", type=int, default=DEFAULT_PROGRESS_EVERY,
        help=f"Print progress every N files (default: {DEFAULT_PROGRESS_EVERY})"
    )
    parser.add_argument(
        "--bloodhound-max-bytes", type=int, default=DEFAULT_BLOODHOUND_MAX_BYTES,
        help=f"Max bytes per file in Bloodhound scout (default: {DEFAULT_BLOODHOUND_MAX_BYTES})"
    )
    args = parser.parse_args()

    if not args.corpus_dir.is_dir():
        print(
            f"[{SESSION}] ERROR: '{args.corpus_dir}' is not a directory or does not exist.",
            file=sys.stderr,
        )
        sys.exit(1)

    run(
        corpus_dir=args.corpus_dir,
        max_files=args.max_files,
        time_cap_sec=args.time_cap_sec,
        extensions=tuple(args.extensions),
        use_bloodhound=not args.no_bloodhound,
        use_crossref=not args.no_crossref,
        crossref_threshold=args.crossref_threshold,
        progress_every=args.progress_every,
        bloodhound_max_bytes=args.bloodhound_max_bytes,
        exclude_dirs=DEFAULT_EXCLUDE_DIRS,
    )


if __name__ == "__main__":
    main()
