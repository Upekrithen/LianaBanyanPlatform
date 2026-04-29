# -*- coding: utf-8 -*-
"""
Multi-Vendor Cathedral Adapter (K455a / B121)
=============================================
Extends cross-Cathedral retrieval to non-Anthropic vendors.

Each vendor gets R11 corpus facts via consult_scribes(cathedral=...), injected
into a vendor-appropriate system prompt, then calls that vendor's completion API.

Supported vendor × cathedral combinations:
  openai   + gpt-4o-mini + bishop  → anthropic_4omini_bishop condition
  google   + gemini-2.5-flash + bishop → google_flash_bishop condition
  perplexity + sonar + bishop      → perplexity_sonar_bishop condition

The Anthropic + Cathedral conditions are handled by cross_cathedral_adapter.py.

Env vars: OPENAI_API_KEY, GOOGLE_API_KEY (or GEMINI_API_KEY), PERPLEXITY_API_KEY
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
    # OpenAI
    "gpt-4o-mini":          {"input": 0.15,  "output": 0.60},
    "gpt-4o":               {"input": 2.50,  "output": 10.00},
    # Google
    "gemini-2.5-flash":     {"input": 0.15,  "output": 0.60},
    "gemini-2.5-pro":       {"input": 1.25,  "output": 5.00},
    # Perplexity
    "sonar":                {"input": 1.00,  "output": 1.00},
    "sonar-pro":            {"input": 3.00,  "output": 15.00},
}

SCRIPT_DIR = Path(__file__).resolve().parent.parent
CONSULT_CLI_PATH = SCRIPT_DIR / "consult_scribes_cli.mjs"
R9_PRELOAD_PATH = (
    SCRIPT_DIR.parent.parent / "librarian-mcp-public" / "preload" / "r9v2_base.md"
)


# ─── System prompt templates ──────────────────────────────────────────────

CATHEDRAL_SYS_TEMPLATE = """\
You are a knowledge assistant with access to the Scribes Cathedral (a domain-indexed
knowledge store). Use the base preload AND the most-relevant Scribe entries below to
answer questions. Reproduce exact values when present. If neither contains the answer,
say "I don't know" — do NOT invent facts.

--- R9-v2 BASE PRELOAD ---

{preload}

--- SCRIBES CATHEDRAL (retrieved entries) ---

{cathedral_md}
"""

COLD_SYS = (
    "You are a helpful assistant. Answer the user's question to the best of your "
    "ability. If you don't know, say so. Do NOT invent facts."
)


# ─── ConsultClient (reuses cross_cathedral_adapter pattern) ───────────────

class MultiCathedralConsultClient:
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

    def consult(
        self,
        topic: str,
        cathedral: str = "bishop",
        scope: str = "public",
        max_entries: int = 100,
    ) -> dict:
        if self.proc.stdin is None or self.proc.stdout is None:
            raise RuntimeError("consult subprocess not initialized")
        # max_entries=100 ensures all 50 R11 corpus facts are retrieved.
        # The CLI defaults to 10 if not specified; corpus-mode Scribes need explicit
        # expansion to serve the full reference corpus (K466 architecture note).
        payload = json.dumps({
            "topic": topic,
            "cathedral": cathedral,
            "scope": scope,
            "max_entries": max_entries,
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
        f"{c['scribe_id']}(score={c['score']},n={c['entries_returned']},mode={c.get('mode','?')})"
        for c in consulted
    )
    lines.append(f"Scribes consulted: {summary}")
    lines.append(f"Cathedral: {result.get('cathedral', '?')}")
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


def _load_preload() -> str:
    if not R9_PRELOAD_PATH.exists():
        return "(R9 preload not available — answering from Cathedral only)"
    return R9_PRELOAD_PATH.read_text(encoding="utf-8")


def answer(
    question: str,
    vendor: Literal["openai", "google", "perplexity"],
    model: str,
    cathedral: str = "bishop",
    consult_client: "MultiCathedralConsultClient | None" = None,
) -> tuple[AdapterResponse, list[str]]:
    """
    Retrieve from the specified Cathedral then call the vendor's API.

    Returns (AdapterResponse, scribe_ids_consulted).
    """
    if consult_client is None:
        if not CONSULT_CLI_PATH.exists():
            raise FileNotFoundError(f"consult_scribes_cli.mjs not found: {CONSULT_CLI_PATH}")
        consult_client = MultiCathedralConsultClient(CONSULT_CLI_PATH)

    # K535 Fix: max_entries=200 ensures all 150 R11 corpus facts are retrievable.
    # Default max_entries=100 silently truncated RC (positions 100-124) and HP (125-149).
    cresp = consult_client.consult(question, cathedral=cathedral, scope="public", max_entries=200)
    cathedral_md, scribe_ids = _render_cathedral_block(cresp)
    preload = _load_preload()
    system_prompt = CATHEDRAL_SYS_TEMPLATE.format(
        preload=preload,
        cathedral_md=cathedral_md,
    )

    if vendor == "openai":
        return _call_openai(question, system_prompt, model), scribe_ids
    elif vendor == "google":
        return _call_google(question, system_prompt, model), scribe_ids
    elif vendor == "perplexity":
        return _call_perplexity(question, system_prompt, model), scribe_ids
    else:
        raise ValueError(f"Unsupported vendor: {vendor}")


def _get_pricing(model: str, default_pricing: dict) -> dict:
    return PRICING.get(model, default_pricing)


def _call_openai(question: str, system_prompt: str, model: str) -> AdapterResponse:
    from openai import OpenAI

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY not set")

    client = OpenAI(api_key=api_key)
    pricing = _get_pricing(model, {"input": 0.15, "output": 0.60})

    t0 = time.perf_counter()
    response = client.chat.completions.create(
        model=model,
        max_tokens=512,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
    )
    latency = time.perf_counter() - t0

    usage = response.usage
    input_tokens = usage.prompt_tokens if usage else 0
    output_tokens = usage.completion_tokens if usage else 0
    cost = (input_tokens / 1_000_000) * pricing["input"] + \
           (output_tokens / 1_000_000) * pricing["output"]
    text = response.choices[0].message.content if response.choices else ""

    return AdapterResponse(
        text=text or "",
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=round(cost, 6),
        latency_s=round(latency, 3),
    )


def _call_google(question: str, system_prompt: str, model: str) -> AdapterResponse:
    from google import genai

    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("GOOGLE_API_KEY or GEMINI_API_KEY not set")

    client = genai.Client(api_key=api_key)
    pricing = _get_pricing(model, {"input": 0.15, "output": 0.60})

    t0 = time.perf_counter()
    response = client.models.generate_content(
        model=model,
        contents=question,
        config=genai.types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=512,
        ),
    )
    latency = time.perf_counter() - t0

    usage = response.usage_metadata
    input_tokens = (usage.prompt_token_count or 0) if usage else 0
    output_tokens = (usage.candidates_token_count or 0) if usage else 0
    cost = (input_tokens / 1_000_000) * pricing["input"] + \
           (output_tokens / 1_000_000) * pricing["output"]
    text = response.text or ""

    return AdapterResponse(
        text=text,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=round(cost, 6),
        latency_s=round(latency, 3),
    )


def _call_perplexity(question: str, system_prompt: str, model: str) -> AdapterResponse:
    from openai import OpenAI

    api_key = os.environ.get("PERPLEXITY_API_KEY")
    if not api_key:
        raise EnvironmentError("PERPLEXITY_API_KEY not set")

    client = OpenAI(api_key=api_key, base_url="https://api.perplexity.ai")
    pricing = _get_pricing(model, {"input": 1.00, "output": 1.00})

    t0 = time.perf_counter()
    response = client.chat.completions.create(
        model=model,
        max_tokens=512,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
    )
    latency = time.perf_counter() - t0

    usage = response.usage
    input_tokens = usage.prompt_tokens if usage else 0
    output_tokens = usage.completion_tokens if usage else 0
    cost = (input_tokens / 1_000_000) * pricing["input"] + \
           (output_tokens / 1_000_000) * pricing["output"]
    choice = response.choices[0] if response.choices else None
    text = (choice.message.content or "") if choice else ""

    return AdapterResponse(
        text=text,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=round(cost, 6),
        latency_s=round(latency, 3),
    )
