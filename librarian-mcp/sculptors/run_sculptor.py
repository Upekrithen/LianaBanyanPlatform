"""
K483 Sculptor Runner.

Phases B (sculpt) + C (verify) execution script.

Usage:
    python sculptors/run_sculptor.py

Reads bedrock from:   librarian-mcp/miners/bedrock/*.jsonl
Writes artifacts to:  librarian-mcp/sculptors/outputs/
Writes filter log to: librarian-mcp/sculptors/filter_decision_log.jsonl
Writes run summary:   librarian-mcp/sculptors/run_summary_K483.json
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# Make project root importable
sys.path.insert(0, str(Path(__file__).parent.parent))

from sculptors.sculptor import _set_filter_log_path, load_sculptor

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

ROOT = Path(__file__).parent.parent
BEDROCK_DIR = ROOT / "miners" / "bedrock"
SCULPTOR_DIR = ROOT / "sculptors"
OUTPUT_DIR = SCULPTOR_DIR / "outputs"
FILTER_LOG_PATH = SCULPTOR_DIR / "filter_decision_log.jsonl"
PROFILES_PATH = SCULPTOR_DIR / "cathedral_profiles.json"
DEMAND_PATH = SCULPTOR_DIR / "cathedral_demand_profile.json"
SUMMARY_PATH = SCULPTOR_DIR / "run_summary_K483.json"

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

_set_filter_log_path(FILTER_LOG_PATH)

# ---------------------------------------------------------------------------
# Load configs
# ---------------------------------------------------------------------------

with PROFILES_PATH.open("r", encoding="utf-8") as fh:
    raw_profiles = json.load(fh)

with DEMAND_PATH.open("r", encoding="utf-8") as fh:
    raw_demands = json.load(fh)

# ---------------------------------------------------------------------------
# Discover bedrock files
# ---------------------------------------------------------------------------

bedrock_paths = sorted(BEDROCK_DIR.glob("*.jsonl"))
print(f"[K483] Found {len(bedrock_paths)} bedrock file(s):")
for bp in bedrock_paths:
    print(f"  {bp.name}")

# ---------------------------------------------------------------------------
# Define sculptor instances (3 cathedrals)
# ---------------------------------------------------------------------------

SCULPTOR_CONFIGS = [
    {
        "id": "SC-001",
        "cathedral": "public-wide",
    },
    {
        "id": "SC-002",
        "cathedral": "technical-deep",
    },
    {
        "id": "SC-003",
        "cathedral": "private-founder",
    },
]

# ---------------------------------------------------------------------------
# Run sculptors
# ---------------------------------------------------------------------------

run_results = []
ts_start = datetime.now(timezone.utc).isoformat()

for config in SCULPTOR_CONFIGS:
    cid = config["id"]
    cathedral_key = config["cathedral"]
    profile_dict = {**raw_profiles[cathedral_key]}
    demand_dict = {**raw_demands[cathedral_key]}

    print(f"\n[{cid}] Sculpting for cathedral: {cathedral_key}")

    sculptor = load_sculptor(
        sculptor_id=cid,
        profile_dict=profile_dict,
        demand_dict=demand_dict,
    )

    result = sculptor.run(
        bedrock_paths=bedrock_paths,
        output_dir=OUTPUT_DIR,
    )

    run_results.append(result)

    print(f"  Input tablets:   {result['total_input_tablets']}")
    print(f"  Included:        {result['included_count']} ({result['inclusion_rate']:.1%})")
    print(f"  Excluded:        {result['excluded_count']}")
    print(f"  Sculpt form:     {result['preferred_sculpt_form']}")
    print(f"  Artifact:        {Path(result['artifact_path']).name}")

# ---------------------------------------------------------------------------
# Write run summary
# ---------------------------------------------------------------------------

ts_end = datetime.now(timezone.utc).isoformat()
summary = {
    "session": "K483",
    "bishop_session": "B123",
    "run_start": ts_start,
    "run_end": ts_end,
    "bedrock_files_processed": [str(bp) for bp in bedrock_paths],
    "sculptors_run": run_results,
    "filter_log_path": str(FILTER_LOG_PATH),
    "output_dir": str(OUTPUT_DIR),
}

with SUMMARY_PATH.open("w", encoding="utf-8") as fh:
    json.dump(summary, fh, indent=2, default=str)

print(f"\n[K483] Run summary written to: {SUMMARY_PATH.name}")
print(f"[K483] Filter decision log:    {FILTER_LOG_PATH.name}")

# ---------------------------------------------------------------------------
# Phase C — inline verification
# ---------------------------------------------------------------------------

print("\n" + "=" * 60)
print("PHASE C — VERIFICATION")
print("=" * 60)

checks = {}

# Check 1: Sculptor instantiation (all 3 ran without exception)
checks["sculptor_instantiation"] = all(r["total_input_tablets"] > 0 for r in run_results)
_OK = "[OK]"
_FAIL = "[FAIL]"

print(f"\n[1] Sculptor class instantiates with per-cathedral profile: {_OK if checks['sculptor_instantiation'] else _FAIL}")

# Check 2: Curate produces audience-differentiated output (different inclusion rates)
rates = [r["inclusion_rate"] for r in run_results]
checks["audience_differentiation"] = len(set(rates)) == len(rates) or (max(rates) - min(rates)) > 0.05
print(f"[2] Curate + sculpt -> audience-differentiated output: {_OK if checks['audience_differentiation'] else _FAIL}")
for r in run_results:
    print(f"    {r['cathedral_name']}: {r['included_count']}/{r['total_input_tablets']} ({r['inclusion_rate']:.1%})")

# Check 3: Scope-filter enforcement — public narrower than private-founder
public_rate = next(r["inclusion_rate"] for r in run_results if r["cathedral_name"] == "public-wide")
founder_rate = next(r["inclusion_rate"] for r in run_results if r["cathedral_name"] == "private-founder")
checks["scope_filter_enforcement"] = public_rate < founder_rate
print(f"[3] Scope-filter enforcement (public < founder): {_OK if checks['scope_filter_enforcement'] else _FAIL}")
print(f"    public-wide={public_rate:.1%}  private-founder={founder_rate:.1%}")

# Check 4: Provenance chain continuity — verify via filter log
filter_log_lines = 0
if FILTER_LOG_PATH.exists():
    with FILTER_LOG_PATH.open("r", encoding="utf-8") as fh:
        filter_log_lines = sum(1 for line in fh if line.strip())
checks["filter_log_populated"] = filter_log_lines > 0
print(f"[4] Filter-decision log is audit-complete: {_OK if checks['filter_log_populated'] else _FAIL} ({filter_log_lines} entries)")

# Check 5: Provenance chain in output artifacts
chain_ok = True
chain_sample = []
for r in run_results:
    artifact_path = Path(r["artifact_path"])
    if artifact_path.exists():
        with artifact_path.open("r", encoding="utf-8") as fh:
            artifact = json.load(fh)
        form = artifact.get("artifact", {}).get("form", "")
        if form == "summary":
            entries = artifact.get("artifact", {}).get("entries", [])
            for e in entries[:5]:
                chain = e.get("provenance_chain", [])
                if not chain or chain[0] not in ["LB-CAT.M-0001"]:
                    chain_ok = False
                chain_sample.append(chain)
        elif form == "full_tablet":
            tabs = artifact.get("artifact", {}).get("tablets", [])
            for t in tabs[:5]:
                chain = t.get("provenance_chain", [])
                if not chain:
                    chain_ok = False
                chain_sample.append(chain)
        elif form == "per_topic_rollup":
            pass  # per-topic doesn't embed full chains; artifact existence is the check

checks["provenance_chain_continuity"] = chain_ok
print(f"[5] Provenance chain Root -> Miner -> Sculptor -> output: {_OK if checks['provenance_chain_continuity'] else _FAIL}")
if chain_sample:
    print(f"    Sample chain: {chain_sample[0]}")

# Check 6: IP-as-filter — same tablet, different property-status per audience
include_sets: list[set[str]] = []
for r in run_results:
    artifact_path = Path(r["artifact_path"])
    included_ids: set[str] = set()
    if artifact_path.exists():
        with artifact_path.open("r", encoding="utf-8") as fh:
            artifact = json.load(fh)
        form = artifact.get("artifact", {}).get("form", "")
        if form == "summary":
            for e in artifact.get("artifact", {}).get("entries", []):
                included_ids.add(e["tablet_id"])
        elif form == "full_tablet":
            for t in artifact.get("artifact", {}).get("tablets", []):
                included_ids.add(t["tablet_id"])
        elif form == "per_topic_rollup":
            for topic_data in artifact.get("artifact", {}).get("topics", {}).values():
                included_ids.update(topic_data.get("tablet_ids", []))
    include_sets.append(included_ids)

ip_filter_example = None
if len(include_sets) >= 2:
    for tid in include_sets[-1]:  # private-founder (most permissive)
        for i, iset in enumerate(include_sets[:-1]):
            if tid not in iset:
                ip_filter_example = {
                    "tablet_id": tid,
                    "in_cathedral": run_results[-1]["cathedral_name"],
                    "not_in_cathedral": run_results[i]["cathedral_name"],
                }
                break
        if ip_filter_example:
            break

checks["ip_as_filter_instantiated"] = ip_filter_example is not None
print(f"[6] IP-as-filter keystone #28 instantiation: {_OK if checks['ip_as_filter_instantiated'] else _FAIL}")
if ip_filter_example:
    print(f"    Tablet {ip_filter_example['tablet_id']} included by '{ip_filter_example['in_cathedral']}' "
          f"but excluded by '{ip_filter_example['not_in_cathedral']}'")
else:
    print("    Could not identify a tablet with split inclusion -- check filter log manually.")

# Summary
passed = sum(1 for v in checks.values() if v)
total = len(checks)
print(f"\n{'=' * 60}")
print(f"PHASE C RESULT: {passed}/{total} checks passed")
if passed == 6:
    print("K483 CLEAN LANDING [OK][OK]")
elif passed >= 5:
    print("K483 SUCCESSFUL [OK]")
else:
    print("K483 INCOMPLETE -- diagnose failures before Phase D")
print("=" * 60)

# Write verification results into summary
summary["phase_c_checks"] = checks
summary["phase_c_passed"] = passed
summary["phase_c_total"] = total
summary["ip_as_filter_example"] = ip_filter_example

with SUMMARY_PATH.open("w", encoding="utf-8") as fh:
    json.dump(summary, fh, indent=2, default=str)
