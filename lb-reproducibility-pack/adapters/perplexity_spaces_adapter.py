"""
R11 Perplexity Spaces Adapter
==============================
Simulates Perplexity Spaces (Sonar-Pro with a Space knowledge attachment) via
the Perplexity API (OpenAI-compatible endpoint). The canonical corpus is
injected as the system prompt's knowledge section — the closest API-accessible
equivalent to attaching a file to a Perplexity Space.

Note: Perplexity's Sonar models include web search by default. For a fair
retrieval-from-corpus benchmark, we set the system prompt explicitly to use
ONLY the attached corpus and not web search. If Perplexity's API returns
web-search citations, those are recorded in the output JSONL for transparency.

Mode: "space" (corpus attached) or "cold" (no corpus, though Sonar-Pro
      always has web search — cold mode for Perplexity tests model capability
      WITHOUT corpus injection, but web search may still fire. Flagged in output.)

Env var: PERPLEXITY_API_KEY
"""

import os
import time
from typing import Literal

from adapters import AdapterResponse

PRICING = {
    "sonar":              {"input": 1.00,  "output": 1.00},
    "sonar-pro":          {"input": 3.00,  "output": 15.00},
    "sonar-reasoning":    {"input": 1.00,  "output": 5.00},
    "sonar-reasoning-pro": {"input": 2.00, "output": 8.00},
}
DEFAULT_PRICING = {"input": 3.00, "output": 15.00}

SPACE_SYSTEM_TEMPLATE = """\
You are an AI assistant with access to a Space containing a knowledge document.
Use ONLY the knowledge document below to answer questions. Do NOT search the web
for information that contradicts or supplements this document. If the answer
is in the document, reproduce the exact values precisely. If it is NOT in the
document, say "I don't know" — do NOT invent facts.

--- SPACE KNOWLEDGE DOCUMENT ---

{corpus}

--- END KNOWLEDGE DOCUMENT ---
"""

COLD_SYSTEM = (
    "You are a helpful assistant. Answer the user's question to the best of "
    "your ability using only your training knowledge. Do NOT invent facts."
)


def answer(
    question: str,
    corpus_text: str,
    model: str = "sonar-pro",
    mode: Literal["space", "cold"] = "space",
) -> AdapterResponse:
    from openai import OpenAI

    api_key = os.environ.get("PERPLEXITY_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "PERPLEXITY_API_KEY not set. Key labeled 'PawnKEY' in vault (DOUBLESECRET.env)."
        )

    client = OpenAI(api_key=api_key, base_url="https://api.perplexity.ai")
    pricing = PRICING.get(model, DEFAULT_PRICING)

    system_prompt = (
        SPACE_SYSTEM_TEMPLATE.format(corpus=corpus_text) if mode == "space" else COLD_SYSTEM
    )

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
