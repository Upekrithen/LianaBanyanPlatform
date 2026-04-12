"""
TouchStone v1 — Verification Engine
====================================
Deterministic predicate runner. Zero AI. Zero heuristics.
Loads the manifest, runs predicates, returns pass/fail verdicts.
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

TOUCHSTONE_DIR = Path(__file__).resolve().parent
MANIFEST_PATH = TOUCHSTONE_DIR / "manifest.json"

# Import the predicate registry
sys.path.insert(0, str(TOUCHSTONE_DIR))
from predicates import PREDICATE_REGISTRY


def load_manifest() -> dict:
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def save_manifest(manifest: dict) -> None:
    manifest["updated_at"] = datetime.now(timezone.utc).isoformat()
    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def find_deliverable(manifest: dict, deliverable_id: str) -> Optional[dict]:
    for d in manifest.get("deliverables", []):
        if d["id"] == deliverable_id:
            return d
    return None


def check_dependencies(manifest: dict, deliverable: dict) -> list:
    """Return list of unmet dependency IDs."""
    unmet = []
    for dep_id in deliverable.get("depends_on", []):
        dep = find_deliverable(manifest, dep_id)
        if not dep or dep.get("status") != "completed":
            unmet.append(dep_id)
    return unmet


def verify_deliverable(deliverable_id: str) -> dict:
    """Run all predicates for a deliverable. ALL must pass."""
    manifest = load_manifest()
    deliverable = find_deliverable(manifest, deliverable_id)

    if not deliverable:
        return {
            "passed": False,
            "deliverable_id": deliverable_id,
            "predicate_results": [],
            "blocking_failures": [f"Deliverable '{deliverable_id}' not found in manifest"],
        }

    unmet_deps = check_dependencies(manifest, deliverable)
    if unmet_deps:
        return {
            "passed": False,
            "deliverable_id": deliverable_id,
            "predicate_results": [],
            "blocking_failures": [f"Unmet dependencies: {', '.join(unmet_deps)}"],
        }

    predicate_results = []
    blocking_failures = []

    for v in deliverable.get("verification", []):
        predicate_name = v.get("predicate", "")
        predicate_args = v.get("args", {})

        if predicate_name not in PREDICATE_REGISTRY:
            result = {
                "predicate": predicate_name,
                "passed": False,
                "observed": None,
                "message": f"Unknown predicate: {predicate_name}",
            }
            predicate_results.append(result)
            blocking_failures.append(result["message"])
            continue

        try:
            check_fn = PREDICATE_REGISTRY[predicate_name]
            result = check_fn(predicate_args)
            result["predicate"] = predicate_name
        except Exception as e:
            result = {
                "predicate": predicate_name,
                "passed": False,
                "observed": str(e),
                "message": f"Predicate raised exception: {e}",
            }

        predicate_results.append(result)
        if not result.get("passed", False):
            blocking_failures.append(result.get("message", "Unknown failure"))

    all_passed = len(blocking_failures) == 0

    return {
        "passed": all_passed,
        "deliverable_id": deliverable_id,
        "predicate_results": predicate_results,
        "blocking_failures": blocking_failures,
    }


def verify_all() -> dict:
    """Run verify_deliverable on every deliverable. Return a full report."""
    manifest = load_manifest()
    deliverables = manifest.get("deliverables", [])

    results = []
    passed_count = 0
    failed_count = 0
    pending_count = 0
    blocked_count = 0
    by_owner = {}

    for d in deliverables:
        did = d["id"]
        owner = d.get("owner", "unknown")
        status = d.get("status", "pending")

        if owner not in by_owner:
            by_owner[owner] = {"total": 0, "passed": 0, "failed": 0, "pending": 0}
        by_owner[owner]["total"] += 1

        if status == "completed":
            # Re-verify even completed items
            vr = verify_deliverable(did)
            if vr["passed"]:
                passed_count += 1
                by_owner[owner]["passed"] += 1
            else:
                failed_count += 1
                by_owner[owner]["failed"] += 1
            vr["title"] = d.get("title", "")
            vr["status"] = status
            results.append(vr)
        elif status == "blocked":
            blocked_count += 1
            by_owner[owner]["pending"] += 1
            results.append({
                "deliverable_id": did,
                "title": d.get("title", ""),
                "status": "blocked",
                "passed": False,
                "predicate_results": [],
                "blocking_failures": ["Status is 'blocked'"],
            })
        else:
            # pending or in_progress — try verifying
            vr = verify_deliverable(did)
            if vr["passed"]:
                passed_count += 1
                by_owner[owner]["passed"] += 1
            else:
                pending_count += 1
                by_owner[owner]["pending"] += 1
            vr["title"] = d.get("title", "")
            vr["status"] = status
            results.append(vr)

    return {
        "total": len(deliverables),
        "passed": passed_count,
        "failed": failed_count,
        "pending": pending_count,
        "blocked": blocked_count,
        "by_owner": by_owner,
        "results": results,
        "verified_at": datetime.now(timezone.utc).isoformat(),
    }


# ── CLI entry point ──
if __name__ == "__main__":
    if len(sys.argv) > 1:
        did = sys.argv[1]
        result = verify_deliverable(did)
    else:
        result = verify_all()

    print(json.dumps(result, indent=2, ensure_ascii=False))
