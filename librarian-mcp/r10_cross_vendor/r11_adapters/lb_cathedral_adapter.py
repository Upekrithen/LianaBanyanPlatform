"""
R11 LB Cathedral Adapter
=========================
The production LB memory stack:
  - r9v2_base preload (canonical session memory)
  - consult_scribes MCP retrieval (top-10 relevant Scribe entries per question)

Two LB conditions:
  lb_r9_only   : preload only, no Cathedral retrieval (R9 substrate alone)
  lb_cathedral : preload + consult_scribes top-10 (full LB production stack)

Two LB model tiers:
  haiku : claude-haiku-4-5-20251001 (production-realistic)
  opus  : claude-opus-4-7 (ceiling)

Env var: ANTHROPIC_API_KEY
Node.js + consult_scribes_cli.mjs must be available for lb_cathedral mode.
"""

import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Literal

from adapters import AdapterResponse

PRICING = {
    "claude-haiku-4-5-20251001":  {"input": 1.00,  "output": 5.00},
    "claude-opus-4-7":            {"input": 15.00, "output": 75.00},
}

SCRIPT_DIR = Path(__file__).resolve().parent.parent
CONSULT_CLI_PATH = SCRIPT_DIR / "consult_scribes_cli.mjs"
R9_PRELOAD_PATH = SCRIPT_DIR.parent.parent / "librarian-mcp-public" / "preload" / "r9v2_base.md"

R9_SYS_PREFIX = (
    "You are the Liana Banyan canonical memory assistant. Answer using ONLY the "
    "preload context below. If the context does not contain the answer, say "
    "'I don't know' — do NOT invent facts.\n\n--- R9-v2 BASE PRELOAD ---\n\n"
)
CATHEDRAL_SYS_PREFIX = (
    "You are the Liana Banyan canonical memory assistant with access to the "
    "Scribes Cathedral (domain-indexed working memory). Use the base preload "
    "AND the most-relevant Scribe entries below. If neither contains the answer, "
    "say 'I don't know'. Do NOT invent facts.\n\n--- R9-v2 BASE PRELOAD ---\n\n"
)
CATHEDRAL_DIVIDER = "\n\n--- SCRIBES CATHEDRAL (top 10 most-relevant entries) ---\n\n"


class ConsultClient:
    """Persistent Node subprocess wrapper for consult_scribes_cli.mjs."""

    def __init__(self, cli_path: Path) -> None:
        self.proc = subprocess.Popen(
            ["node", str(cli_path)],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=str(cli_path.parent),
            text=True,
            encoding="utf-8",
            bufsize=1,
        )

    def consult(self, topic: str, max_entries: int = 10) -> dict:
        if self.proc.stdin is None or self.proc.stdout is None:
            raise RuntimeError("consult subprocess not initialized")
        self.proc.stdin.write(json.dumps({"topic": topic, "max_entries": max_entries}) + "\n")
        self.proc.stdin.flush()
        line = self.proc.stdout.readline()
        if not line:
            err = self.proc.stderr.read() if self.proc.stderr else ""
            raise RuntimeError(f"consult subprocess died: {err}")
        return json.loads(line)

    def close(self) -> None:
        try:
            if self.proc.stdin:
                self.proc.stdin.close()
            self.proc.wait(timeout=5)
        except Exception:
            self.proc.kill()


def _render_cathedral_block(consult_response: dict) -> tuple[str, list[str]]:
    if not consult_response.get("ok"):
        return ("(consult_scribes returned no entries)", [])
    result = consult_response["result"]
    consulted = result.get("scribes_consulted", [])
    entries = result.get("entries", [])
    if not entries:
        return ("(no Scribes scored above zero)", [])
    scribe_ids = [c["scribe_id"] for c in consulted]
    lines = []
    summary = ", ".join(
        f"{c['scribe_id']}(score={c['score']},n={c['entries_returned']})"
        for c in consulted
    )
    lines.append(f"Scribes consulted: {summary}")
    for e in entries:
        lines.append(f"\n### Scribe {e['scribe_id']} — {e.get('session', '?')} ({e.get('ts', '?')})")
        lines.append(e.get("observation", ""))
        if e.get("canonical_ref"):
            lines.append(f"*ref: {e['canonical_ref']}*")
    return ("\n".join(lines), scribe_ids)


def answer(
    question: str,
    corpus_text: str,
    model: str = "claude-haiku-4-5-20251001",
    mode: Literal["lb_r9_only", "lb_cathedral"] = "lb_cathedral",
    consult_client: "ConsultClient | None" = None,
) -> tuple[AdapterResponse, list[str]]:
    """
    Returns (AdapterResponse, scribe_ids_consulted).
    Pass a ConsultClient instance for lb_cathedral mode to reuse the subprocess.
    """
    import anthropic

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY not set")

    if not R9_PRELOAD_PATH.exists():
        raise FileNotFoundError(f"r9v2_base preload not found: {R9_PRELOAD_PATH}")
    preload = R9_PRELOAD_PATH.read_text(encoding="utf-8")

    scribe_ids: list[str] = []

    if mode == "lb_r9_only":
        system_prompt = R9_SYS_PREFIX + preload
    else:
        if consult_client is None:
            if not CONSULT_CLI_PATH.exists():
                raise FileNotFoundError(f"consult_scribes_cli.mjs not found: {CONSULT_CLI_PATH}")
            consult_client = ConsultClient(CONSULT_CLI_PATH)
        cresp = consult_client.consult(question, max_entries=10)
        cathedral_md, scribe_ids = _render_cathedral_block(cresp)
        system_prompt = CATHEDRAL_SYS_PREFIX + preload + CATHEDRAL_DIVIDER + cathedral_md

    pricing = PRICING.get(model, {"input": 15.00, "output": 75.00})
    client = anthropic.Anthropic(api_key=api_key)

    t0 = time.perf_counter()
    response = client.messages.create(
        model=model,
        max_tokens=512,
        system=system_prompt,
        messages=[{"role": "user", "content": question}],
    )
    latency = time.perf_counter() - t0

    input_tokens = response.usage.input_tokens
    output_tokens = response.usage.output_tokens
    cost = (input_tokens / 1_000_000) * pricing["input"] + \
           (output_tokens / 1_000_000) * pricing["output"]
    text = response.content[0].text if response.content else ""

    return AdapterResponse(
        text=text,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=round(cost, 6),
        latency_s=round(latency, 3),
    ), scribe_ids
