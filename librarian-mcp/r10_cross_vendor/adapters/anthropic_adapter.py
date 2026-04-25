"""
Anthropic adapter — Claude models via the Anthropic SDK.
Env var: ANTHROPIC_API_KEY
"""

import os
import time
from . import AdapterResponse

PRICING = {
    "claude-haiku-4-5-20251001": {"input": 1.00, "output": 5.00},
    "claude-haiku-4-5":          {"input": 1.00, "output": 5.00},
    "claude-sonnet-4-6":         {"input": 3.00, "output": 15.00},
    "claude-sonnet-4-6-20260301": {"input": 3.00, "output": 15.00},
    "claude-opus-4-7":            {"input": 15.00, "output": 75.00},
}

# Per-million-token prices; default to Opus pricing for unknown models
DEFAULT_PRICING = {"input": 15.00, "output": 75.00}


def _get_pricing(model: str) -> dict:
    return PRICING.get(model, DEFAULT_PRICING)


def call(model: str, system_prompt: str, user_prompt: str) -> AdapterResponse:
    import anthropic

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY not set")

    client = anthropic.Anthropic(api_key=api_key)
    pricing = _get_pricing(model)

    t0 = time.perf_counter()
    response = client.messages.create(
        model=model,
        max_tokens=2048,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
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
    )
