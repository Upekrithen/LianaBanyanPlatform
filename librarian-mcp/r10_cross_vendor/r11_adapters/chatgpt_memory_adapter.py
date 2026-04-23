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
import time
from pathlib import Path
from typing import Literal

from adapters import AdapterResponse

PRICING = {
    "gpt-4o":       {"input": 2.50,  "output": 10.00},
    "gpt-4o-mini":  {"input": 0.15,  "output": 0.60},
    "gpt-4.1":      {"input": 2.00,  "output": 8.00},
    "gpt-4.1-mini": {"input": 0.40,  "output": 1.60},
    "gpt-5":        {"input": 15.00, "output": 60.00},  # estimated; update when API pricing is published
}
DEFAULT_PRICING = {"input": 2.50, "output": 10.00}

MEMORY_SYSTEM_PREAMBLE = """\
You are a helpful assistant with access to a memory store. The memory store
contains information that has been previously saved about cooperative AI
platform best practices. When answering questions, consult your memory store
first. If the answer is present in memory, state it precisely. If not in
memory, say you don't know — do NOT invent facts.

--- MEMORY STORE (30 entries) ---
"""

COLD_SYSTEM = (
    "You are a helpful assistant. Answer the user's question to the best of your "
    "ability. If you don't know, say so. Do NOT invent facts."
)


def _split_to_memory_entries(corpus_text: str, n: int = 30) -> list[str]:
    """Split corpus into approximately n paragraph-level memory entries."""
    paragraphs = [p.strip() for p in corpus_text.split("\n\n") if p.strip() and len(p.strip()) > 60]
    if len(paragraphs) <= n:
        return paragraphs
    step = len(paragraphs) // n
    return paragraphs[::step][:n]


def build_memory_system_prompt(corpus_text: str) -> str:
    entries = _split_to_memory_entries(corpus_text, 30)
    memory_block = "\n\n".join(f"[Memory {i+1}] {e}" for i, e in enumerate(entries))
    return MEMORY_SYSTEM_PREAMBLE + memory_block


def answer(
    question: str,
    corpus_text: str,
    model: str = "gpt-4o",
    mode: Literal["memory", "cold"] = "memory",
) -> AdapterResponse:
    from openai import OpenAI

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY not set")

    client = OpenAI(api_key=api_key)
    pricing = PRICING.get(model, DEFAULT_PRICING)

    if mode == "memory":
        system_prompt = build_memory_system_prompt(corpus_text)
    else:
        system_prompt = COLD_SYSTEM

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
