"""Predicate: supabase_row_exists — read-only SELECT against Supabase.

Runs via the supabase CLI to avoid needing direct DB credentials in the
Python layer. The query is always a read-only SELECT with a WHERE clause.
"""

import subprocess
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
PLATFORM_DIR = REPO_ROOT / "platform"


def check(args: dict) -> dict:
    table = args.get("table", "")
    where = args.get("where", "")

    if not table or not where:
        return {
            "passed": False,
            "observed": None,
            "message": "Missing required args: table, where",
        }

    # Sanitize: only allow SELECT-safe WHERE clauses
    dangerous = ["DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "TRUNCATE", "EXEC"]
    upper_where = where.upper()
    for kw in dangerous:
        if kw in upper_where:
            return {
                "passed": False,
                "observed": None,
                "message": f"Rejected: WHERE clause contains dangerous keyword '{kw}'",
            }

    query = f"SELECT COUNT(*) AS cnt FROM {table} WHERE {where};"

    try:
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
            return {
                "passed": False,
                "observed": result.stderr.strip(),
                "message": f"Supabase query failed: {result.stderr.strip()[:200]}",
            }

        output = result.stdout.strip()
        # Parse the JSON output from supabase db query
        try:
            data = json.loads(output)
            rows = data.get("rows", [])
            count = int(rows[0]["cnt"]) if rows else 0
        except (json.JSONDecodeError, IndexError, KeyError, ValueError):
            # Try to find count in raw output
            count = 0
            if "cnt" in output:
                for line in output.split("\n"):
                    if "cnt" in line.lower():
                        try:
                            count = int("".join(c for c in line if c.isdigit()))
                        except ValueError:
                            pass

        if count >= 1:
            return {
                "passed": True,
                "observed": count,
                "message": f"Row exists: {count} row(s) match WHERE {where} in {table}",
            }
        else:
            return {
                "passed": False,
                "observed": 0,
                "message": f"No rows match WHERE {where} in {table}",
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
