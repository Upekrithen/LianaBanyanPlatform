"""
R11 Gemini Gems Adapter
========================
Simulates Gemini Gems (Gemini 2.5 Pro with a corpus knowledge file) via the
Google Generative AI API. The canonical corpus is injected as the Gem's
system instruction (knowledge source) — the API-accessible equivalent of
attaching a file to a Gem. No Gem-creation API is available; this is the
closest fair substitute per the K444 spec.

Mode flag is recorded as "corpus_in_system_instruction" in output JSONL.

Supported models:
  gemini-2.5-pro   -> gemini_gems condition
  gemini-2.5-flash -> cold_gemini_flash condition (no corpus)

Mode: "gem" (corpus as system instruction) or "cold" (no corpus)
Env var: GOOGLE_API_KEY or GEMINI_API_KEY
"""

import os
import time
from typing import Literal

from adapters import AdapterResponse

PRICING = {
    "gemini-2.5-flash": {"input": 0.15, "output": 0.60},
    "gemini-2.5-pro":   {"input": 1.25, "output": 5.00},
    "gemini-2.0-flash": {"input": 0.10, "output": 0.40},
}
DEFAULT_PRICING = {"input": 1.25, "output": 5.00}

GEM_SYSTEM_TEMPLATE = """\
You are a Gem (a customized AI assistant) with the following knowledge document
attached. Use it to answer questions precisely. If the answer appears in the
knowledge document, reproduce the exact values. If not, say you don't know —
do NOT invent facts.

--- KNOWLEDGE DOCUMENT ---

{corpus}

--- END KNOWLEDGE DOCUMENT ---
"""

COLD_SYSTEM = (
    "You are a helpful assistant. Answer the user's question to the best of your "
    "ability. If you don't know, say so. Do NOT invent facts."
)

GEM_MODE_LABEL = "corpus_in_system_instruction"


def answer(
    question: str,
    corpus_text: str,
    model: str = "gemini-2.5-pro",
    mode: Literal["gem", "cold"] = "gem",
) -> AdapterResponse:
    from google import genai

    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("GOOGLE_API_KEY or GEMINI_API_KEY not set")

    client = genai.Client(api_key=api_key)
    pricing = PRICING.get(model, DEFAULT_PRICING)

    system_instruction = (
        GEM_SYSTEM_TEMPLATE.format(corpus=corpus_text) if mode == "gem" else COLD_SYSTEM
    )

    t0 = time.perf_counter()
    response = client.models.generate_content(
        model=model,
        contents=question,
        config=genai.types.GenerateContentConfig(
            system_instruction=system_instruction,
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
