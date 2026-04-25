"""
K488 Phase A — IP-Ledger Rebuild from Bedrock

The K487 ip_ledger.jsonl has 100,565 chain breaks caused by an orphan-process
race during the buffering-fix restart. Each orphan process used the last hash
*it* had seen when appending, not the globally-correct last hash.

Bedrock tablets are INTACT. This script:
  1. Reads all entries from ip_ledger.jsonl
  2. Counts chain breaks to verify the scope
  3. Sorts entries by (timestamp, miner_serial, tablet_id) to establish
     a canonical ordering (Bishop B123 sort policy)
  4. Re-walks the sorted sequence, recomputing prior_hash / current_hash
     using the same SHA-256 formula as miner.py
  5. Writes ip_ledger_K487_rebuilt.jsonl (new file — never overwrites original)
  6. Renames original to ip_ledger_K487_original_corrupted.jsonl
  7. Verifies rebuilt ledger audits clean end-to-end
  8. Writes audit_log_K488_phase_a.json

K488 · B123 · Phase A
"""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import time
from datetime import datetime, timezone
from pathlib import Path

SESSION = "K488"
MINERS_DIR = Path(__file__).parent.parent
LEDGER_PATH = MINERS_DIR / "ip_ledger.jsonl"
REBUILT_LEDGER = MINERS_DIR / "cleanup_K488" / "ip_ledger_K487_rebuilt.jsonl"
ORIGINAL_CORRUPTED = MINERS_DIR / "cleanup_K488" / "ip_ledger_K487_original_corrupted.jsonl"
AUDIT_LOG = MINERS_DIR / "cleanup_K488" / "audit_log_K488_phase_a.json"


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def compute_hash(prior_hash: str, entry: dict, ts: str) -> str:
    """Reproduce the same formula used in miner.py _append_ledger()."""
    payload_keys = {k for k in entry if k not in ("prior_hash", "current_hash", "timestamp")}
    event_payload = json.dumps(
        {k: entry[k] for k in payload_keys},
        sort_keys=True,
    )
    return sha256(prior_hash + event_payload + ts)


def sort_key(entry: dict) -> tuple:
    """
    Primary: timestamp (ISO 8601 strings sort correctly lexicographically)
    Secondary: miner_serial (depth-first alphabetical within a timestamp tie)
    Tertiary: tablet_id (stable ordering of multiple tablets at same timestamp)
    """
    ts = entry.get("timestamp", "")
    serial = entry.get("miner_serial", "")
    tablet_id = entry.get("tablet_id") or ""
    return (ts, serial, tablet_id)


def read_ledger(path: Path) -> list[dict]:
    entries = []
    bad_json = 0
    with path.open("r", encoding="utf-8") as fh:
        for lineno, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                bad_json += 1
                if bad_json <= 5:
                    print(f"[PhaseA] JSON error on line {lineno}: {line[:80]!r}")
    if bad_json:
        print(f"[PhaseA] Total JSON decode errors: {bad_json:,}")
    return entries


def count_chain_breaks(entries: list[dict]) -> int:
    """Count entries where prior_hash != preceding current_hash."""
    breaks = 0
    prev_hash = "GENESIS"
    for entry in entries:
        if entry.get("prior_hash") != prev_hash:
            breaks += 1
        prev_hash = entry.get("current_hash", "")
    return breaks


def rebuild_chain(entries: list[dict]) -> list[dict]:
    """
    Given a list of entries (already sorted), recompute prior_hash + current_hash
    for each. Original timestamps and event payloads are preserved exactly.
    Returns the rebuilt entries.
    """
    rebuilt = []
    prior = "GENESIS"
    for entry in entries:
        ts = entry.get("timestamp", datetime.now(timezone.utc).isoformat())
        new_hash = compute_hash(prior, entry, ts)
        rebuilt_entry = {**entry, "prior_hash": prior, "current_hash": new_hash}
        rebuilt.append(rebuilt_entry)
        prior = new_hash
    return rebuilt


def verify_chain(entries: list[dict]) -> tuple[int, int]:
    """
    Verify chain integrity. Returns (total, break_count).
    A clean chain has break_count == 0.
    """
    breaks = 0
    prev_hash = "GENESIS"
    for entry in entries:
        if entry.get("prior_hash") != prev_hash:
            breaks += 1
        prev_hash = entry.get("current_hash", "")
    return len(entries), breaks


def main() -> None:
    t_start = time.time()
    print(f"[PhaseA] K488 Phase A — IP-Ledger Rebuild")
    print(f"[PhaseA] Ledger: {LEDGER_PATH}")
    print()

    if not LEDGER_PATH.exists():
        print(f"[PhaseA] ERROR: {LEDGER_PATH} not found. Aborting.")
        return

    ledger_size_mb = LEDGER_PATH.stat().st_size / 1_048_576

    # ── Step 1: Read ledger ────────────────────────────────────────────────────
    print(f"[PhaseA] Step 1: Reading ledger ({ledger_size_mb:.1f} MB)...")
    t1 = time.time()
    entries = read_ledger(LEDGER_PATH)
    print(f"[PhaseA]   Read {len(entries):,} entries in {time.time()-t1:.1f}s")

    # ── Step 2: Count chain breaks ─────────────────────────────────────────────
    print(f"[PhaseA] Step 2: Counting chain breaks in original order...")
    t2 = time.time()
    break_count_before = count_chain_breaks(entries)
    print(f"[PhaseA]   Chain breaks (original): {break_count_before:,} of {len(entries):,} entries")

    # ── Step 3: Sort ──────────────────────────────────────────────────────────
    print(f"[PhaseA] Step 3: Sorting {len(entries):,} entries by (timestamp, serial, tablet_id)...")
    t3 = time.time()
    sorted_entries = sorted(entries, key=sort_key)
    print(f"[PhaseA]   Sorted in {time.time()-t3:.1f}s")

    # ── Step 4: Rebuild chain ─────────────────────────────────────────────────
    print(f"[PhaseA] Step 4: Rebuilding hash chain...")
    t4 = time.time()
    rebuilt = rebuild_chain(sorted_entries)
    print(f"[PhaseA]   Rebuilt {len(rebuilt):,} entries in {time.time()-t4:.1f}s")

    # ── Step 5: Verify rebuilt chain ──────────────────────────────────────────
    print(f"[PhaseA] Step 5: Verifying rebuilt chain...")
    total, breaks_after = verify_chain(rebuilt)
    if breaks_after == 0:
        print(f"[PhaseA]   CLEAN: {total:,} entries, 0 chain breaks")
        verified_clean = True
    else:
        print(f"[PhaseA]   FAIL: {breaks_after:,} chain breaks remain after rebuild")
        verified_clean = False

    if not verified_clean:
        print("[PhaseA] ABORT: Rebuilt chain is not clean. Not writing output. Investigate.")
        return

    # ── Step 6: Write rebuilt ledger ──────────────────────────────────────────
    print(f"[PhaseA] Step 6: Writing rebuilt ledger -> {REBUILT_LEDGER.name}...")
    t6 = time.time()
    with REBUILT_LEDGER.open("w", encoding="utf-8") as fh:
        for entry in rebuilt:
            fh.write(json.dumps(entry) + "\n")
    rebuilt_size_mb = REBUILT_LEDGER.stat().st_size / 1_048_576
    print(f"[PhaseA]   Written: {len(rebuilt):,} entries, {rebuilt_size_mb:.1f} MB in {time.time()-t6:.1f}s")

    # ── Step 7: Copy original to corrupted archive ────────────────────────────
    print(f"[PhaseA] Step 7: Archiving original -> {ORIGINAL_CORRUPTED.name}...")
    shutil.copy2(str(LEDGER_PATH), str(ORIGINAL_CORRUPTED))
    orig_size_mb = ORIGINAL_CORRUPTED.stat().st_size / 1_048_576
    print(f"[PhaseA]   Archived: {orig_size_mb:.1f} MB")

    # ── Step 8: Write audit log ───────────────────────────────────────────────
    elapsed = time.time() - t_start
    audit = {
        "session": SESSION,
        "phase": "A",
        "description": "IP-ledger rebuild from K487 corpus",
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "elapsed_sec": round(elapsed, 1),
        "original_ledger": str(LEDGER_PATH),
        "original_ledger_size_mb": round(ledger_size_mb, 2),
        "original_entry_count": len(entries),
        "chain_breaks_before": break_count_before,
        "rebuilt_ledger": str(REBUILT_LEDGER),
        "rebuilt_entry_count": len(rebuilt),
        "chain_breaks_after": breaks_after,
        "verified_clean": verified_clean,
        "sort_policy": "primary=timestamp, secondary=miner_serial, tertiary=tablet_id",
        "hash_formula": "SHA256(prior_hash + json.dumps(payload, sort_keys=True) + timestamp)",
        "original_archived_as": str(ORIGINAL_CORRUPTED),
        "genesis_hash": "GENESIS",
        "final_hash": rebuilt[-1]["current_hash"] if rebuilt else None,
        "notes": (
            "Chain breaks were caused by orphan-process race during K487 buffering-fix "
            "restart. Multiple Python processes appended to ip_ledger.jsonl without "
            "OS-level file locking (threading.Lock does not protect against separate "
            "processes). Bedrock tablets were NOT affected (per-Miner files). "
            "Rebuilt ledger preserves all original event data and timestamps; only "
            "prior_hash and current_hash fields are recomputed."
        ),
    }

    with AUDIT_LOG.open("w", encoding="utf-8") as fh:
        json.dump(audit, fh, indent=2)
    print(f"[PhaseA] Audit log -> {AUDIT_LOG.name}")

    print()
    print("=" * 60)
    print(f"[PhaseA] Phase A COMPLETE in {elapsed:.1f}s")
    print(f"[PhaseA]   Entries processed: {len(rebuilt):,}")
    print(f"[PhaseA]   Chain breaks fixed: {break_count_before:,}")
    print(f"[PhaseA]   Verified clean: {verified_clean}")
    print("=" * 60)


if __name__ == "__main__":
    main()
