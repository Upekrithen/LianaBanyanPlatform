"""
R11 ChatGPT Memory Adapter
===========================
Simulates ChatGPT Memory (GPT-4o / GPT-5 with persistent memory) via the
OpenAI Chat Completions API. The canonical corpus is split into ~30 memory
entries and injected in the system prompt as a structured "memory store" —
the closest API-accessible equivalent to ChatGPT's native Memory product,
which does not expose direct memory management via the public API.

Supported models:
  gpt-4o            -> chatgpt_memory condition
  gpt-4.1           -> chatgpt_memory_gpt41 condition (proxy for gpt-5 if unavailable)
  gpt-4o-mini       -> cold_gpt4o_mini condition (no corpus)

Mode: "memory" (corpus loaded) or "cold" (no corpus)
Env var: OPENAI_API_KEY
"""

import os
import re
import time
from pathlib import Path
from typing import Literal

from adapters import AdapterResponse

# Seconds to sleep if rate-limit message doesn't give a retry-after value.
# At 106K corpus tokens and 30K TPM: need ~212s cooldown. 240s default is safe.
_DEFAULT_BACKOFF_S = 240.0


def _retry_after_seconds(err_str: str) -> float:
    """Parse retry-after from OpenAI 429 message. Handles multiple formats."""
    s = str(err_str)
    # Format 1: "Please try again in 213.456s"
    m = re.search(r"try again in\s+([\d.]+)s", s)
    if m:
        return float(m.group(1)) + 2.0
    # Format 2: "Please try again in 2m43.456s" or "3m 10s"
    m2 = re.search(r"try again in\s+(?:(\d+)m\s*)?(\d+(?:\.\d+)?)s", s)
    if m2:
        mins = int(m2.group(1)) if m2.group(1) else 0
        secs = float(m2.group(2))
        return mins * 60 + secs + 2.0
    # Format 3: "Retry-After: 213"
    m3 = re.search(r"Retry-After:\s*(\d+)", s)
    if m3:
        return float(m3.group(1)) + 2.0
    return _DEFAULT_BACKOFF_S

PRICING = {
    "gpt-4o":       {"input": 2.50,  "output": 10.00},
    "gpt-4o-mini":  {"input": 0.15,  "output": 0.60},
    "gpt-4.1":      {"input": 2.00,  "output": 8.00},
    "gpt-4.1-mini": {"input": 0.40,  "output": 1.60},
    "gpt-5":        {"input": 15.00, "output": 60.00},  # estimated; update when API pricing is published
}
DEFAULT_PRICING = {"input": 2.50, "output": 10.00}

MEMORY_SYSTEM_TEMPLATE = """\
You are a helpful assistant with persistent memory. The memory store below
contains the full cooperative AI platform reference compendium that has been
saved across sessions. When answering questions, retrieve the precise values
from your memory. If the answer is present, reproduce it exactly. If not in
memory, say you don't know — do NOT invent facts.

--- MEMORY STORE: Cooperative AI Platform Compendium ---

{corpus}

--- END MEMORY STORE ---
"""

COLD_SYSTEM = (
    "You are a helpful assistant. Answer the user's question to the best of your "
    "ability. If you don't know, say so. Do NOT invent facts."
)


def build_memory_system_prompt(corpus_text: str) -> str:
    """Load full corpus as memory store — simulates ChatGPT with corpus loaded via Projects/memory."""
    return MEMORY_SYSTEM_TEMPLATE.format(corpus=corpus_text)


def answer(
    question: str,
    corpus_text: str,
    model: str = "gpt-4o",
    mode: Literal["memory", "cold"] = "memory",
    max_retries: int = 12,
) -> AdapterResponse:
    from openai import OpenAI, RateLimitError

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY not set")

    # Disable SDK-level retries — we handle them ourselves with parsed wait times.
    client = OpenAI(api_key=api_key, max_retries=0)
    pricing = PRICING.get(model, DEFAULT_PRICING)

    if mode == "memory":
        system_prompt = build_memory_system_prompt(corpus_text)
    else:
        system_prompt = COLD_SYSTEM

    for attempt in range(max_retries):
        t0 = time.perf_counter()
        try:
            response = client.chat.completions.create(
                model=model,
                max_tokens=512,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question},
                ],
            )
        except RateLimitError as exc:
            wait = _retry_after_seconds(str(exc))
            print(f"    [chatgpt_memory] 429 — sleeping {wait:.1f}s (attempt {attempt+1}/{max_retries})")
            time.sleep(wait)
            continue
        except Exception:
            raise

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

    raise RuntimeError(f"chatgpt_memory_adapter: exhausted {max_retries} retries for model={model}")
