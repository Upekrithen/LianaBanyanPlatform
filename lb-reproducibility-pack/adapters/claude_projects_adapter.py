"""
R11 Claude Projects Adapter
============================
Simulates Claude Projects (Sonnet 4.6 / Opus 4.7 with a project-scoped
reference document) via the Anthropic Messages API. The canonical corpus is
uploaded as a single reference document in the system prompt — the closest
API-accessible equivalent to Claude Projects' reference-document feature.

Anthropic prompt caching is enabled (cache_control) to reduce repeated corpus
token costs by ~90% after the first call in a session. This is methodologically
fair: Claude Projects natively caches the reference document across queries.

Supported models:
  claude-sonnet-4-6-20260301   -> claude_projects_sonnet condition
  claude-opus-4-7               -> claude_projects_opus condition
  claude-haiku-4-5-20251001     -> cold_haiku condition (no corpus)

Mode: "project" (corpus as reference doc) or "cold" (no corpus)
Env var: ANTHROPIC_API_KEY
"""

import os
import time
from typing import Literal

from adapters import AdapterResponse

PRICING = {
    "claude-haiku-4-5-20251001":   {"input": 1.00,  "output": 5.00},
    "claude-sonnet-4-6":           {"input": 3.00,  "output": 15.00},
    "claude-sonnet-4-6-20260301":  {"input": 3.00,  "output": 15.00},  # alias (404 — kept for compat)
    "claude-opus-4-7":             {"input": 15.00, "output": 75.00},
}
DEFAULT_PRICING = {"input": 15.00, "output": 75.00}

PROJECT_SYSTEM_TEMPLATE = """\
You are a helpful assistant. You have access to the following reference document
that has been uploaded to this project. Use it to answer questions precisely.
If the answer is in the document, reproduce the exact values. If it is NOT in
the document, say "I don't know" — do NOT invent facts.

--- REFERENCE DOCUMENT: Cooperative AI Platform Compendium ---

{corpus}

--- END REFERENCE DOCUMENT ---
"""

COLD_SYSTEM = (
    "You are a helpful assistant. Answer the user's question to the best of "
    "your ability. If you don't know, say so. Do NOT invent facts."
)


def answer(
    question: str,
    corpus_text: str,
    model: str = "claude-sonnet-4-6",
    mode: Literal["project", "cold"] = "project",
) -> AdapterResponse:
    import anthropic

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY not set")

    client = anthropic.Anthropic(api_key=api_key)
    pricing = PRICING.get(model, DEFAULT_PRICING)

    if mode == "project":
        system_content = PROJECT_SYSTEM_TEMPLATE.format(corpus=corpus_text)
        system_param = [
            {
                "type": "text",
                "text": system_content,
                "cache_control": {"type": "ephemeral"},
            }
        ]
    else:
        system_param = COLD_SYSTEM

    t0 = time.perf_counter()
    response = client.messages.create(
        model=model,
        max_tokens=512,
        system=system_param,
        messages=[{"role": "user", "content": question}],
    )
    latency = time.perf_counter() - t0

    input_tokens = response.usage.input_tokens
    output_tokens = response.usage.output_tokens
    cache_read = getattr(response.usage, "cache_read_input_tokens", 0) or 0
    cache_write = getattr(response.usage, "cache_creation_input_tokens", 0) or 0

    # Prompt cache pricing: reads at 10% of input, writes at 125% of input
    p = PRICING.get(model, DEFAULT_PRICING)
    cost = (
        (input_tokens / 1_000_000) * p["input"]
        + (output_tokens / 1_000_000) * p["output"]
        + (cache_read / 1_000_000) * p["input"] * 0.10
        + (cache_write / 1_000_000) * p["input"] * 1.25
    )

    text = response.content[0].text if response.content else ""

    return AdapterResponse(
        text=text,
        input_tokens=input_tokens + cache_read,
        output_tokens=output_tokens,
        cost_usd=round(cost, 6),
        latency_s=round(latency, 3),
    )
