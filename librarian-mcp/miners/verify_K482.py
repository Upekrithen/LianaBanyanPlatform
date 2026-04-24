"""
Phase C Verifier — K482.

Checks all seven structural requirements:
  1. Root Miner instantiated + ≥1 bedrock tablet
  2. ≥1 mitosis event fired; daughters spawned whole
  3. Daughter Miners produced their own bedrock tablets
  4. Every tablet has complete provenance_chain traceable to Root
  5. All serial numbers unique + Cathedral-prefixed (LB-CAT.M-)
  6. IP-ledger hash-chain audits end-to-end clean
  7. Bedrock tablets contain no LB-cathedral-specific schema fields beyond provenance

Usage:
    python verify_K482.py
"""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

LEDGER_PATH = Path(__file__).parent / "ip_ledger.jsonl"
BEDROCK_DIR = Path(__file__).parent / "bedrock"
SUMMARY_PATH = Path(__file__).parent / "run_summary_K482.json"

REQUIRED_TABLET_FIELDS = {
    "tablet_id", "miner_serial", "source_file", "source_offset",
    "extracted_content", "keywords", "depth_level", "timestamp",
    "provenance_chain",
}
CATHEDRAL_SPECIFIC_DISALLOWED = {"lb_scribe_id", "cathedral_id", "scribe_topic"}


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def check_1_root_and_tablets() -> tuple[bool, str]:
    if not SUMMARY_PATH.exists():
        return False, "run_summary_K482.json not found — run Phase B first"
    summary = json.loads(SUMMARY_PATH.read_text(encoding="utf-8"))
    root_serial = summary.get("root_serial")
    if not root_serial:
        return False, "No root_serial in summary"
    root_bedrock = BEDROCK_DIR / f"{root_serial}.jsonl"
    if not root_bedrock.exists():
        return False, f"Root bedrock file missing: {root_bedrock}"
    lines = [l for l in root_bedrock.read_text(encoding="utf-8").splitlines() if l.strip()]
    if not lines:
        return False, "Root Miner produced zero bedrock tablets"
    return True, f"Root {root_serial} produced {len(lines)} tablet(s)"


def check_2_mitosis() -> tuple[bool, str]:
    summary = json.loads(SUMMARY_PATH.read_text(encoding="utf-8"))
    events = summary.get("mitosis_log", [])
    if not events:
        return False, "No mitosis events recorded"
    # Verify daughters appear in miner_table
    table = {m["serial"]: m for m in summary.get("miner_table", [])}
    for ev in events:
        ds = ev["daughter_serial"]
        if ds not in table:
            return False, f"Daughter {ds} not in miner_table"
        d = table[ds]
        if d.get("primary_topic") is None:
            return False, f"Daughter {ds} has no primary_topic (not whole)"
    return True, f"{len(events)} mitosis event(s); all daughters appear whole"


def check_3_daughter_tablets() -> tuple[bool, str]:
    summary = json.loads(SUMMARY_PATH.read_text(encoding="utf-8"))
    events = summary.get("mitosis_log", [])
    if not events:
        return False, "No mitosis events (cannot check daughter tablets)"
    failures = []
    for ev in events:
        ds = ev["daughter_serial"]
        path = BEDROCK_DIR / f"{ds}.jsonl"
        if not path.exists():
            failures.append(f"{ds}: bedrock file missing")
            continue
        lines = [l for l in path.read_text(encoding="utf-8").splitlines() if l.strip()]
        if not lines:
            failures.append(f"{ds}: zero tablets")
    if failures:
        return False, "; ".join(failures)
    return True, f"All {len(events)} daughter Miner(s) produced bedrock tablets"


def check_4_provenance_chains() -> tuple[bool, str]:
    summary = json.loads(SUMMARY_PATH.read_text(encoding="utf-8"))
    root_serial = summary["root_serial"]
    failures = []
    total = 0
    for bf in BEDROCK_DIR.glob("*.jsonl"):
        for line in bf.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            tablet = json.loads(line)
            total += 1
            chain = tablet.get("provenance_chain", [])
            if not chain:
                failures.append(f"{tablet['tablet_id']}: empty provenance_chain")
            elif chain[0] != root_serial:
                failures.append(
                    f"{tablet['tablet_id']}: chain root is {chain[0]!r}, "
                    f"expected {root_serial!r}"
                )
            miner_serial = tablet.get("miner_serial")
            if chain[-1] != miner_serial:
                failures.append(
                    f"{tablet['tablet_id']}: chain tail {chain[-1]!r} "
                    f"≠ miner_serial {miner_serial!r}"
                )
    if failures:
        return False, f"{len(failures)} provenance failures:\n  " + "\n  ".join(failures[:5])
    return True, f"All {total} tablet(s) have valid provenance chains"


def check_5_serial_numbers() -> tuple[bool, str]:
    summary = json.loads(SUMMARY_PATH.read_text(encoding="utf-8"))
    serials = [m["serial"] for m in summary.get("miner_table", [])]
    seen: set[str] = set()
    for s in serials:
        if not s.startswith("LB-CAT.M-"):
            return False, f"Serial {s!r} missing Cathedral prefix 'LB-CAT.M-'"
        if s in seen:
            return False, f"Duplicate serial: {s}"
        seen.add(s)
    return True, f"{len(serials)} unique Cathedral-prefixed serial(s)"


def check_6_hash_chain() -> tuple[bool, str]:
    if not LEDGER_PATH.exists():
        return False, "ip_ledger.jsonl not found"
    lines = [l.strip() for l in LEDGER_PATH.read_text(encoding="utf-8").splitlines() if l.strip()]
    if not lines:
        return False, "Ledger is empty"
    prev_hash = "GENESIS"
    failures = []
    for i, line in enumerate(lines):
        record = json.loads(line)
        prior = record.get("prior_hash", "")
        current = record.get("current_hash", "")
        ts = record.get("timestamp", "")
        if prior != prev_hash:
            failures.append(
                f"Line {i+1}: prior_hash {prior[:16]}… ≠ expected {prev_hash[:16]}…"
            )
        # Re-derive current_hash
        payload_keys = {k for k in record if k not in ("prior_hash", "current_hash", "timestamp")}
        payload = json.dumps({k: record[k] for k in payload_keys}, sort_keys=True)
        expected = _sha256(prior + payload + ts)
        if expected != current:
            failures.append(
                f"Line {i+1}: current_hash mismatch (re-derived: {expected[:16]}…, stored: {current[:16]}…)"
            )
        prev_hash = current
    if failures:
        return False, f"{len(failures)} chain failure(s):\n  " + "\n  ".join(failures[:3])
    return True, f"Hash-chain audits clean across {len(lines)} ledger entries"


def check_7_cathedral_agnostic() -> tuple[bool, str]:
    violations = []
    for bf in BEDROCK_DIR.glob("*.jsonl"):
        for line in bf.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            tablet = json.loads(line)
            extra = set(tablet.keys()) - REQUIRED_TABLET_FIELDS
            bad = extra & CATHEDRAL_SPECIFIC_DISALLOWED
            if bad:
                violations.append(f"{tablet['tablet_id']}: disallowed fields {bad}")
    if violations:
        return False, "\n  ".join(violations[:5])
    return True, "All bedrock tablets are cathedral-agnostic (no disallowed LB-specific fields)"


def main() -> None:
    checks = [
        ("1 Root instantiated + >=1 tablet", check_1_root_and_tablets),
        ("2 >=1 mitosis event; daughters whole", check_2_mitosis),
        ("3 Daughter tablets produced", check_3_daughter_tablets),
        ("4 Provenance chains traceable to Root", check_4_provenance_chains),
        ("5 Serial numbers unique + Cathedral-prefixed", check_5_serial_numbers),
        ("6 IP-ledger hash-chain end-to-end clean", check_6_hash_chain),
        ("7 Bedrock tablets cathedral-agnostic", check_7_cathedral_agnostic),
    ]
    print("=" * 70)
    print("Phase C Verification - K482 Miner Prototype")
    print("=" * 70)
    passed = 0
    for label, fn in checks:
        ok, msg = fn()
        status = "PASS" if ok else "FAIL"
        print(f"\n[{status}] Check {label}")
        print(f"   {msg}")
        if ok:
            passed += 1
    print()
    print("=" * 70)
    print(f"Result: {passed}/{len(checks)} checks passed")
    print("=" * 70)
    if passed < len(checks):
        sys.exit(1)


if __name__ == "__main__":
    main()
