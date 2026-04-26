"""
The Bureau — Embedded Correspondent + Reasoning-Stream Augurs (K515 / A&A #2306)

Two primitives:
1. Embedded Correspondent producer: write_chunk() appends reasoning chunks
   to ~/.claude/state/correspondents/agent_<name>_session_<id>.jsonl
2. Bureau query: query_bureau() reads + filters chunks by risk pattern
3. Embedded-Correspondent-Augurs: 7 risk-pattern matchers that evaluate
   reasoning chunks (pre-execution advisory)

Founder's articulation (B126):
  "IF we can replicate that process — where Bishop is able to see Knight's
   reasoning AS IT HAPPENS... Like an Embedded Correspondent."

Architectural anchor: K512.5 — Knight overwrote production Supabase key
while reasoning "Let me update the Supabase secret to ensure it's current."
The Embedded Correspondent would have caught this pre-execution.
"""

from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

CORRESPONDENTS_DIR = Path(os.path.expanduser("~/.claude/state/correspondents"))
BUREAU_AUGURS_DIR  = Path(os.path.expanduser("~/.claude/state/bureau_augurs"))

# ── Risk-pattern Augur configs (7 starters per K515 A.7) ─────────────────────

RISK_PATTERN_AUGURS: List[Dict[str, Any]] = [
    {
        "id": "ec_vendor_secret_rotation",
        "name": "Augur-Vendor-Secret-Rotation",
        "class": "critical",
        "patterns": [
            r"(?i)(supabase\s+secrets?\s+set|firebase\s+(functions:config:set|secrets|env:set)|aws\s+ssm\s+put-parameter|secrets?\s+set\s+[A-Z_]+)",
            r"(?i)(update|refresh|ensure|sync|rotating|rotate)\s+.{0,60}(secret|key|token|credential|password)",
            r"(?i)let\s+me\s+(update|set|push|write|store)\s+the\s+(supabase|firebase|aws|anthropic|openai|stripe)\s+(secret|key|api)",
        ],
        "advisory_type": "critical",
        "message": "VENDOR SECRET ROTATION DETECTED in reasoning stream. Knight appears to be about to run a destructive vendor-secret write (supabase secrets set, etc.) without explicit Founder confirmation. This is the K512.5 failure mode. PAUSE and confirm with Founder before executing.",
        "source": "feedback_dont_rotate_vendor_secrets_without_confirmation.md",
    },
    {
        "id": "ec_force_push",
        "name": "Augur-Force-Push",
        "class": "critical",
        "patterns": [
            r"(?i)git\s+push\s+--force",
            r"(?i)git\s+push\s+-f\b",
            r"(?i)git\s+reset\s+--hard",
            r"(?i)git\s+checkout\s+--\s+\.",
            r"(?i)force\s+push",
        ],
        "advisory_type": "critical",
        "message": "FORCE PUSH detected in reasoning stream. About to execute a destructive git operation against a shared branch. Confirm target branch + intent with Founder before executing.",
        "source": "BRIDLE v10.5",
    },
    {
        "id": "ec_schema_destruction",
        "name": "Augur-Schema-Destruction",
        "class": "critical",
        "patterns": [
            r"(?i)DROP\s+TABLE",
            r"(?i)DROP\s+DATABASE",
            r"(?i)DELETE\s+FROM\s+\w+\s*[^W]",
            r"(?i)TRUNCATE\s+TABLE",
            r"(?i)(drop|delete|truncate)\s+the\s+(table|database|schema|collection)",
        ],
        "advisory_type": "critical",
        "message": "SCHEMA DESTRUCTION detected in reasoning stream. DROP TABLE / DELETE without WHERE / TRUNCATE may destroy production data. Confirm with Founder and verify table name before executing.",
        "source": "BRIDLE database safety",
    },
    {
        "id": "ec_filesystem_wipe",
        "name": "Augur-Filesystem-Wipe",
        "class": "critical",
        "patterns": [
            r"(?i)rm\s+-rf\s+[~/]",
            r"(?i)Remove-Item\s+-Recurse\s+-Force\s+[C-Z]:",
            r"(?i)rd\s+/s\s+/q\s+[C-Z]:",
            r"(?i)(delete|remove|wipe|erase)\s+(all\s+files|the\s+directory|everything\s+in)\s+",
            r"(?i)rm\s+-rf\s+\*",
        ],
        "advisory_type": "critical",
        "message": "FILESYSTEM WIPE detected in reasoning stream. Recursive delete against system or home directories risks data loss. Stop and confirm target paths with Founder.",
        "source": "BRIDLE filesystem safety",
    },
    {
        "id": "ec_permission_grant",
        "name": "Augur-Permission-Grant",
        "class": "advisory",
        "patterns": [
            r"(?i)chmod\s+777",
            r"(?i)chmod\s+-R\s+777",
            r"(?i)(grant|give|add)\s+.{0,30}(admin|owner|root|full\s+access|all\s+permissions)",
            r"(?i)icacls\s+.+?/grant\s+everyone",
        ],
        "advisory_type": "warn",
        "message": "BROAD PERMISSION GRANT detected in reasoning stream. chmod 777 or all-permissions grants may expose security surfaces. Review scope before executing.",
        "source": "BRIDLE security",
    },
    {
        "id": "ec_api_spend_spike",
        "name": "Augur-API-Spend-Spike",
        "class": "advisory",
        "patterns": [
            r"(?i)(loop|iterate|repeat|batch)\s+.{0,60}(api\s+call|request|completion|model\s+call)",
            r"(?i)(call|invoke|run)\s+the\s+(model|api|endpoint)\s+(for\s+each|on\s+every|per)",
            r"(?i)(parallel|concurrent|async)\s+.{0,40}(1[0-9][0-9]|[2-9][0-9][0-9])\s+",
        ],
        "advisory_type": "warn",
        "message": "POTENTIAL API SPEND SPIKE in reasoning stream. Unbounded loop or large-batch API calls without budget cap detected. Add rate limiting or budget cap before executing.",
        "source": "BRIDLE cost discipline",
    },
    {
        "id": "ec_toolsmith_missing_ratification",
        "name": "Augur-Toolsmith-Missing-At-Ratification",
        "class": "advisory",
        "patterns": [
            r"(?i)(ratif|session\s+clos|K[0-9]+\s+complete|FOR\s+THE\s+KEEP|handoff\s+complete)",
        ],
        "anti_patterns": [
            r"TS-[0-9]+",
        ],
        "advisory_type": "warn",
        "message": "RATIFICATION WITHOUT TOOLSMITH CITATION in reasoning stream. Knight appears to be closing a session without citing a Toolsmith ts_id. Add TS-### citation per BRIDLE v10.5.",
        "source": "feedback_toolsmith_log_at_each_ratification.md",
    },
]

# ── ISO timestamp ──────────────────────────────────────────────────────────────

def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


# ── Embedded Correspondent producer ───────────────────────────────────────────

def write_chunk(
    agent: str,
    session: str,
    chunk_text: str,
    context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Append one reasoning chunk to the agent's Embedded Correspondent tablet.

    Path: ~/.claude/state/correspondents/agent_<agent>_session_<session>.jsonl

    Returns: {"logged": True, "advisories": [...]} where advisories are
    pre-execution risk signals from Embedded-Correspondent-Augurs.
    """
    ts = _iso_now()
    advisories = _evaluate_risk_patterns(chunk_text)

    record = {
        "ts": ts,
        "agent": agent,
        "session": session,
        "chunk": chunk_text[:2000],  # Cap to 2k chars per entry
        "context": context or {},
        "advisories": [a["id"] for a in advisories if a.get("triggered")],
    }

    try:
        CORRESPONDENTS_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"agent_{agent}_session_{session}.jsonl"
        path = CORRESPONDENTS_DIR / filename
        with open(path, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception:
        pass

    return {
        "logged": True,
        "ts": ts,
        "advisories": advisories,
    }


# ── Risk pattern evaluation ────────────────────────────────────────────────────

def _evaluate_risk_patterns(text: str) -> List[Dict[str, Any]]:
    """
    Evaluate all 7 Embedded-Correspondent-Augurs against a reasoning chunk.
    Returns list of all Augurs with triggered status.
    """
    results = []
    for augur in RISK_PATTERN_AUGURS:
        # Check if any pattern matches
        triggered = any(
            re.search(p, text, re.IGNORECASE | re.DOTALL)
            for p in augur.get("patterns", [])
        )

        # Anti-pattern check (Toolsmith augur)
        if triggered and augur.get("anti_patterns"):
            anti_found = any(
                re.search(ap, text, re.IGNORECASE | re.DOTALL)
                for ap in augur["anti_patterns"]
            )
            if anti_found:
                triggered = False  # Safety condition met — no advisory

        results.append({
            "id": augur["id"],
            "name": augur["name"],
            "class": augur["class"],
            "triggered": triggered,
            "advisory_type": augur.get("advisory_type", "warn"),
            "message": augur["message"] if triggered else "",
        })

    return results


# ── Bureau query functions ─────────────────────────────────────────────────────

def query_bureau(
    agent: Optional[str] = None,
    session: Optional[str] = None,
    since_ts: Optional[str] = None,
    risk_filter: Optional[str] = None,
    limit: int = 50,
) -> Dict[str, Any]:
    """
    Query reasoning chunks from Embedded Correspondent tablets.

    agent:       filter to one agent (None = all agents)
    session:     filter to one session (None = all sessions)
    since_ts:    ISO timestamp — only chunks after this time
    risk_filter: only return chunks that triggered this Augur id
    limit:       max chunks to return
    """
    if not CORRESPONDENTS_DIR.exists():
        return {"chunks": [], "total": 0, "query_ts": _iso_now()}

    # Collect matching tablet files
    if agent and session:
        pattern = f"agent_{agent}_session_{session}.jsonl"
        tablets = [CORRESPONDENTS_DIR / pattern] if (CORRESPONDENTS_DIR / pattern).exists() else []
    elif agent:
        tablets = sorted(CORRESPONDENTS_DIR.glob(f"agent_{agent}_session_*.jsonl"))
    else:
        tablets = sorted(CORRESPONDENTS_DIR.glob("agent_*_session_*.jsonl"))

    all_chunks = []
    for tablet in tablets:
        try:
            lines = tablet.read_text(encoding="utf-8").strip().split("\n")
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    if since_ts and entry.get("ts", "") < since_ts:
                        continue
                    if risk_filter and risk_filter not in entry.get("advisories", []):
                        continue
                    all_chunks.append(entry)
                except Exception:
                    pass
        except Exception:
            pass

    # Sort by timestamp, newest first
    all_chunks.sort(key=lambda e: e.get("ts", ""), reverse=True)
    results = all_chunks[:limit]

    return {
        "query_ts": _iso_now(),
        "agent_filter": agent,
        "session_filter": session,
        "since_ts": since_ts,
        "risk_filter": risk_filter,
        "total_found": len(all_chunks),
        "returned": len(results),
        "chunks": results,
    }


def bureau_subscribe(
    watching_agent: str,
    risk_filter: Optional[List[str]] = None,
    since_ts: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Pull mode: retrieve recent reasoning chunks from all other agents,
    optionally filtered by a set of risk-pattern Augur ids.

    Used by Bishop to watch Knight's reasoning stream for risk patterns.
    In production this would be push (streaming); here it's pull (poll).
    """
    risk_filter_str = None
    results_by_filter = {}

    if risk_filter:
        for rf in risk_filter:
            result = query_bureau(since_ts=since_ts, risk_filter=rf, limit=20)
            # Exclude chunks by the watching agent itself
            chunks = [c for c in result["chunks"] if c.get("agent") != watching_agent]
            if chunks:
                results_by_filter[rf] = chunks
    else:
        result = query_bureau(since_ts=since_ts, limit=50)
        chunks = [c for c in result["chunks"] if c.get("agent") != watching_agent]
        results_by_filter["all"] = chunks[:20]

    total_advisories = sum(len(v) for v in results_by_filter.values())

    return {
        "subscription_ts": _iso_now(),
        "watching_agent": watching_agent,
        "risk_filters": risk_filter or ["all"],
        "since_ts": since_ts,
        "advisory_count": total_advisories,
        "advisories_by_filter": results_by_filter,
    }
