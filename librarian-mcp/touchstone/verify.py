"""
TouchStone v1 — Verification Engine
====================================
Deterministic predicate runner. Zero AI. Zero heuristics.
Loads the manifest, runs predicates, returns pass/fail verdicts.

K442 (B117) extension: deliverables may declare an ordered ``predicate_ladder``
of predicate-strings (e.g. ``["letter_drafted", "letter_locked",
"letter_dispatched", "response_received_within:14d"]``). When present, the
engine evaluates each rung with ``letter_recipient`` injected from the
deliverable's top-level ``letter_recipient`` field, and exposes the highest
rung that passed as ``letter_state`` (drafted / locked / dispatched /
response_received). The legacy ``verification`` array path is unchanged.
"""

import json
import re
import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

TOUCHSTONE_DIR = Path(__file__).resolve().parent
MANIFEST_PATH = TOUCHSTONE_DIR / "manifest.json"

sys.path.insert(0, str(TOUCHSTONE_DIR))
from predicates import PREDICATE_REGISTRY  # noqa: E402

# Ordered ladder rung -> human-friendly state name. Used when computing
# letter_state from a predicate_ladder result.
LADDER_STATE_MAP = {
    "letter_drafted": "drafted",
    "letter_locked": "locked",
    "letter_dispatched": "dispatched",
    "response_received_within": "response_received",
}

# Suffix sugar: "response_received_within:14d" / ":72h" -> kwargs override.
_RUNG_RE = re.compile(r"^([a-z_]+)(?::(\d+)([dh]))?$")


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


def _parse_rung(rung: str, recipient: str) -> tuple[str, dict]:
    """
    Parse a ladder rung string. Returns (predicate_name, args_dict).

    Forms supported:
        "letter_drafted"             -> ("letter_drafted", {"letter_recipient": ...})
        "response_received_within:14d" -> (..., {..., "max_days": 14})
        "response_received_within:72h" -> (..., {..., "max_hours": 72})
    """
    m = _RUNG_RE.match(rung.strip())
    if not m:
        return rung, {"letter_recipient": recipient}
    name, qty, unit = m.group(1), m.group(2), m.group(3)
    args = {"letter_recipient": recipient}
    if qty and unit:
        if unit == "d":
            args["max_days"] = int(qty)
        elif unit == "h":
            args["max_hours"] = int(qty)
    return name, args


def _evaluate_ladder(deliverable: dict) -> dict:
    """
    Evaluate predicate_ladder, return dict with:
        ladder_results: list of {rung, predicate, passed, observed, message}
        letter_state:   highest passing rung (mapped) or "pending" / "blocked"
        passed:         True iff every rung passed
        blocking_failures: list of failure messages (only populated when ladder fails)
        resolved_path:  file path captured from letter_drafted, if any
    """
    recipient = (deliverable.get("letter_recipient") or "").strip()
    ladder = deliverable.get("predicate_ladder", []) or []

    # Status-level override: explicit "blocked" wins over ladder evaluation.
    if deliverable.get("status") == "blocked":
        reason = deliverable.get("blocked_reason") or deliverable.get("notes") or "Status is 'blocked'"
        return {
            "ladder_results": [],
            "letter_state": "blocked",
            "passed": False,
            "blocking_failures": [f"Blocked: {reason}"],
            "resolved_path": None,
        }

    if not recipient:
        return {
            "ladder_results": [],
            "letter_state": "pending",
            "passed": False,
            "blocking_failures": [
                "Deliverable has predicate_ladder but no top-level letter_recipient"
            ],
            "resolved_path": None,
        }

    ladder_results: list = []
    blocking_failures: list = []
    highest_state: str = "pending"
    resolved_path: Optional[str] = None
    all_passed = True

    for rung in ladder:
        name, args = _parse_rung(rung, recipient)
        if name not in PREDICATE_REGISTRY:
            res = {
                "rung": rung,
                "predicate": name,
                "passed": False,
                "observed": None,
                "message": f"Unknown predicate: {name}",
            }
            ladder_results.append(res)
            blocking_failures.append(res["message"])
            all_passed = False
            continue

        try:
            r = PREDICATE_REGISTRY[name](args)
        except Exception as e:  # noqa: BLE001 — predicates are sandboxed
            r = {"passed": False, "observed": str(e), "message": f"Predicate raised: {e}"}

        rung_result = {
            "rung": rung,
            "predicate": name,
            "passed": bool(r.get("passed")),
            "observed": r.get("observed"),
            "message": r.get("message", ""),
        }
        ladder_results.append(rung_result)

        if rung_result["passed"]:
            mapped = LADDER_STATE_MAP.get(name)
            if mapped:
                highest_state = mapped
            if name == "letter_drafted" and isinstance(r.get("observed"), str):
                resolved_path = r["observed"]
        else:
            all_passed = False
            blocking_failures.append(rung_result["message"])

    return {
        "ladder_results": ladder_results,
        "letter_state": highest_state,
        "passed": all_passed,
        "blocking_failures": blocking_failures,
        "resolved_path": resolved_path,
    }


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

    # K442 path: ladder takes precedence when present.
    if deliverable.get("predicate_ladder"):
        ladder = _evaluate_ladder(deliverable)
        return {
            "passed": ladder["passed"],
            "deliverable_id": deliverable_id,
            "predicate_results": ladder["ladder_results"],
            "blocking_failures": ladder["blocking_failures"],
            "letter_state": ladder["letter_state"],
            "resolved_path": ladder["resolved_path"],
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
        except Exception as e:  # noqa: BLE001
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
    by_owner: dict[str, dict[str, int]] = {}
    letter_state_counts = {
        "pending": 0,
        "drafted": 0,
        "locked": 0,
        "dispatched": 0,
        "response_received": 0,
        "blocked": 0,
    }

    for d in deliverables:
        did = d["id"]
        owner = d.get("owner", "unknown")
        status = d.get("status", "pending")

        by_owner.setdefault(owner, {"total": 0, "passed": 0, "failed": 0, "pending": 0})
        by_owner[owner]["total"] += 1

        if status == "completed":
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
            vr = verify_deliverable(did)
            blocked_count += 1
            by_owner[owner]["pending"] += 1
            vr["title"] = d.get("title", "")
            vr["status"] = status
            results.append(vr)
        else:
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

        if "letter_state" in vr and vr["letter_state"] in letter_state_counts:
            letter_state_counts[vr["letter_state"]] += 1

    return {
        "total": len(deliverables),
        "passed": passed_count,
        "failed": failed_count,
        "pending": pending_count,
        "blocked": blocked_count,
        "by_owner": by_owner,
        "letter_states": letter_state_counts,
        "results": results,
        "verified_at": datetime.now(timezone.utc).isoformat(),
    }


def letters_state_summary() -> dict:
    """
    Compact summary of every letter-bearing deliverable's current `letter_state`.

    Returns:
        {
            "by_state": {"drafted": N, "locked": N, ...},
            "by_recipient": [{"id": ..., "recipient": ..., "state": ..., "resolved_path": ...}, ...],
        }

    Used by brief_me to replace the legacy "POSSIBLY COMPLETED" block.
    """
    manifest = load_manifest()
    by_state = {
        "pending": 0, "drafted": 0, "locked": 0,
        "dispatched": 0, "response_received": 0, "blocked": 0,
    }
    rows: list = []

    for d in manifest.get("deliverables", []):
        if not d.get("predicate_ladder"):
            continue
        vr = verify_deliverable(d["id"])
        state = vr.get("letter_state", "pending")
        if state in by_state:
            by_state[state] += 1
        rows.append({
            "id": d["id"],
            "title": d.get("title", ""),
            "recipient": d.get("letter_recipient", ""),
            "state": state,
            "resolved_path": vr.get("resolved_path"),
        })

    return {"by_state": by_state, "by_recipient": rows}


# ── CLI entry point ──
if __name__ == "__main__":
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg == "--letters-summary":
            result = letters_state_summary()
        else:
            result = verify_deliverable(arg)
    else:
        result = verify_all()

    print(json.dumps(result, indent=2, ensure_ascii=False))
