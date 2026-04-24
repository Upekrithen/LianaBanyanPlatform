# -*- coding: utf-8 -*-
"""
R11 Cross-Cathedral Adapter (K455c / B121)
==========================================
Two conditions for the cooperative-corpus flywheel test:

  lb_knight_cathedral_only_haiku
    Haiku 4.5 + R9 preload + consult_scribes(cathedral="knight", scope="public")
    Knight's Cathedral has NO R11 corpus → LOW expected accuracy (control arm)

  lb_knight_cross_bishop_haiku
    Haiku 4.5 + R9 preload + consult_scribes(cathedral="bishop", scope="public")
    Bishop's Cathedral HAS the R11 corpus → HIGH expected accuracy (treatment arm)

Cross-Cathedral lift = Arm2_HOT_pct - Arm1_HOT_pct

Env var: ANTHROPIC_API_KEY
Node.js + consult_scribes_cli.mjs must be available.
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
    "claude-haiku-4-5-20251001": {"input": 1.00, "output": 5.00},
    "claude-opus-4-7":           {"input": 15.00, "output": 75.00},
}

SCRIPT_DIR = Path(__file__).resolve().parent.parent
CONSULT_CLI_PATH = SCRIPT_DIR / "consult_scribes_cli.mjs"
R9_PRELOAD_PATH = (
    SCRIPT_DIR.parent.parent / "librarian-mcp-public" / "preload" / "r9v2_base.md"
)

# System prompt prefixes
R9_PREFIX = (
    "You are the Liana Banyan canonical memory assistant. "
    "Answer using ONLY the preload context below. "
    "If the context does not contain the answer, say 'I don't know' — do NOT invent facts.\n\n"
    "--- R9-v2 BASE PRELOAD ---\n\n"
)

CROSS_CATHEDRAL_PREFIX = (
    "You are the Liana Banyan canonical memory assistant with access to the "
    "Scribes Cathedral (domain-indexed working memory). "
    "Use the base preload AND the most-relevant Scribe entries below. "
    "If neither contains the answer, say 'I don't know'. Do NOT invent facts.\n\n"
    "--- R9-v2 BASE PRELOAD ---\n\n"
)
CROSS_CATHEDRAL_DIVIDER = "\n\n--- SCRIBES CATHEDRAL (top 10 most-relevant entries) ---\n\n"


class CrossCathedralConsultClient:
    """
    Persistent Node subprocess wrapper for consult_scribes_cli.mjs.
    Supports the cathedral parameter for cross-Cathedral consultation.
    """

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

    def consult(
        self,
        topic: str,
        max_entries: int = 10,
        cathedral: str = "bishop",
        scope: str = "public",
    ) -> dict:
        if self.proc.stdin is None or self.proc.stdout is None:
            raise RuntimeError("consult subprocess not initialized")
        payload = json.dumps({
            "topic": topic,
            "max_entries": max_entries,
            "cathedral": cathedral,
            "scope": scope,
        })
        self.proc.stdin.write(payload + "\n")
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
    cathedral_label = result.get("cathedral", "unknown")
    lines.append(f"Cathedral: {cathedral_label}")
    for e in entries:
        ts = e.get("ts") or e.get("timestamp") or "?"
        session = e.get("session") or e.get("source_session") or "?"
        obs = e.get("observation", "")
        lines.append(f"\n### Scribe {e.get('scribe_id', '?')} — {session} ({ts})")
        lines.append(obs)
        canonical_ref = e.get("canonical_ref") or e.get("source_document")
        if canonical_ref:
            lines.append(f"*ref: {canonical_ref}*")
    return ("\n".join(lines), scribe_ids)


def answer(
    question: str,
    corpus_text: str,
    model: str = "claude-haiku-4-5-20251001",
    mode: Literal["lb_knight_only", "lb_cross_bishop"] = "lb_cross_bishop",
    consult_client: "CrossCathedralConsultClient | None" = None,
) -> tuple[AdapterResponse, list[str]]:
    """
    Returns (AdapterResponse, scribe_ids_consulted).

    mode="lb_knight_only" (Arm 1, control):
      Consults Knight's Cathedral only — expects LOW accuracy on R11 questions
      because Knight's Cathedral contains no R11 corpus.

    mode="lb_cross_bishop" (Arm 2, treatment):
      Cross-Cathedral consultation of Bishop's Cathedral — expects HIGH accuracy
      because Bishop's Cathedral contains all 50 R11 facts.
    """
    import anthropic

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY not set")

    if not R9_PRELOAD_PATH.exists():
        raise FileNotFoundError(f"r9v2_base preload not found: {R9_PRELOAD_PATH}")
    preload = R9_PRELOAD_PATH.read_text(encoding="utf-8")

    scribe_ids: list[str] = []

    # Determine which Cathedral to consult
    if mode == "lb_knight_only":
        cathedral = "knight"
    else:  # lb_cross_bishop
        cathedral = "bishop"

    if consult_client is None:
        if not CONSULT_CLI_PATH.exists():
            raise FileNotFoundError(f"consult_scribes_cli.mjs not found: {CONSULT_CLI_PATH}")
        consult_client = CrossCathedralConsultClient(CONSULT_CLI_PATH)

    # max_entries=55 captures all 50 R11 facts from the Bishop scribe (51 entries incl header).
    # For Knight's Cathedral, there are no R11 facts so this returns the top-N Knight entries.
    cresp = consult_client.consult(question, max_entries=55, cathedral=cathedral, scope="public")
    cathedral_md, scribe_ids = _render_cathedral_block(cresp)
    system_prompt = CROSS_CATHEDRAL_PREFIX + preload + CROSS_CATHEDRAL_DIVIDER + cathedral_md

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
    cost = (
        (input_tokens / 1_000_000) * pricing["input"]
        + (output_tokens / 1_000_000) * pricing["output"]
    )
    text = response.content[0].text if response.content else ""

    return AdapterResponse(
        text=text,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=round(cost, 6),
        latency_s=round(latency, 3),
    ), scribe_ids
