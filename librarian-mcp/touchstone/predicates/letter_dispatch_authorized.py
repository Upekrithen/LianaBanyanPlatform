"""TouchStone Predicate: letter_dispatch_authorized

Innovation #2262 The Glass Door — K412 / B099

Returns True iff the outreach letter's governance verdict permits dispatch
and the scheduled dispatch timestamp has arrived.

Args:
    letter_id (str): UUID of the outreach_letters row

Phase 1: advisory mode always passes; binding mode requires approval threshold.
"""

import subprocess
import json
from pathlib import Path
from datetime import datetime, timezone

REPO_ROOT = Path(__file__).resolve().parents[3]
PLATFORM_DIR = REPO_ROOT / "platform"


def _run_query(query: str) -> dict:
    """Execute a read-only Supabase query via CLI."""
    import shutil
    npx_path = shutil.which("npx") or r"C:\Program Files\nodejs\npx.cmd"
    result = subprocess.run(
        [npx_path, "supabase", "db", "query", query, "--linked"],
        cwd=str(PLATFORM_DIR),
        capture_output=True,
        text=True,
        timeout=30,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Supabase query failed: {result.stderr.strip()[:200]}")

    try:
        return json.loads(result.stdout.strip())
    except json.JSONDecodeError:
        raise RuntimeError(f"Could not parse query output: {result.stdout.strip()[:200]}")


def check(args: dict) -> dict:
    letter_id = args.get("letter_id", "")
    if not letter_id:
        return {
            "passed": False,
            "observed": None,
            "message": "Missing required arg: letter_id",
        }

    try:
        # Fetch letter
        letter_result = _run_query(
            f"SELECT state, voting_mode, scheduled_dispatch, "
            f"vote_threshold_approval_pct, vote_threshold_veto_pct "
            f"FROM outreach_letters WHERE letter_id = '{letter_id}';"
        )
        rows = letter_result.get("rows", [])
        if not rows:
            return {
                "passed": False,
                "observed": None,
                "message": f"Letter {letter_id} not found",
            }

        letter = rows[0]

        # State must be 'scheduled'
        if letter["state"] != "scheduled":
            return {
                "passed": False,
                "observed": letter["state"],
                "message": f"State is '{letter['state']}', must be 'scheduled'",
            }

        # Scheduled dispatch must have arrived
        if letter.get("scheduled_dispatch"):
            sched = datetime.fromisoformat(letter["scheduled_dispatch"].replace("Z", "+00:00"))
            if sched > datetime.now(timezone.utc):
                return {
                    "passed": False,
                    "observed": letter["scheduled_dispatch"],
                    "message": f"Scheduled dispatch {letter['scheduled_dispatch']} not yet reached",
                }

        # Compute verdict
        verdict_result = _run_query(
            f"SELECT * FROM compute_outreach_letter_verdict('{letter_id}');"
        )
        v_rows = verdict_result.get("rows", [])
        if not v_rows:
            return {
                "passed": False,
                "observed": None,
                "message": "Verdict computation returned no rows",
            }

        v = v_rows[0]

        # Advisory mode: always passes
        if letter["voting_mode"] == "advisory":
            return {
                "passed": True,
                "observed": v,
                "message": (
                    f"Advisory mode; verdict={v['verdict']} "
                    f"({v['approval_pct']}% approve, {v['veto_pct']}% veto)"
                ),
            }

        # Binding mode: verdict gates dispatch
        if v["verdict"] == "approved":
            return {
                "passed": True,
                "observed": v,
                "message": f"Binding approval ({v['approval_pct']}% approve)",
            }
        elif v["verdict"] == "vetoed":
            return {
                "passed": False,
                "observed": v,
                "message": f"Binding veto ({v['veto_pct']}% veto)",
            }
        else:
            return {
                "passed": False,
                "observed": v,
                "message": f"Binding pending; insufficient votes (verdict={v['verdict']})",
            }

    except subprocess.TimeoutExpired:
        return {
            "passed": False,
            "observed": "timeout",
            "message": "Supabase query timed out (30s)",
        }
    except FileNotFoundError:
        return {
            "passed": False,
            "observed": "no_npx",
            "message": "npx not found — supabase CLI unavailable",
        }
    except RuntimeError as e:
        return {
            "passed": False,
            "observed": str(e),
            "message": str(e),
        }
