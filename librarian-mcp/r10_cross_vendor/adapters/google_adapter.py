"""
Google adapter — Gemini models via the google-genai SDK.
Env var: GOOGLE_API_KEY
"""

import os
import time
from . import AdapterResponse

PRICING = {
    "gemini-2.5-flash":              {"input": 0.15, "output": 0.60},
    "gemini-2.5-pro":                {"input": 1.25, "output": 5.00},
    "gemini-2.0-flash":              {"input": 0.10, "output": 0.40},
    "gemini-3-flash-preview":        {"input": 0.50, "output": 3.00},
    "gemini-3.1-flash-lite-preview": {"input": 0.25, "output": 1.50},
    "gemini-3.1-pro-preview":        {"input": 2.00, "output": 12.00},
}

DEFAULT_PRICING = {"input": 2.00, "output": 12.00}


def _get_pricing(model: str) -> dict:
    return PRICING.get(model, DEFAULT_PRICING)


def call(model: str, system_prompt: str, user_prompt: str) -> AdapterResponse:
    from google import genai

    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "GOOGLE_API_KEY or GEMINI_API_KEY not set. Get one at https://aistudio.google.com/apikey"
        )

    client = genai.Client(api_key=api_key)
    pricing = _get_pricing(model)

    t0 = time.perf_counter()
    response = client.models.generate_content(
        model=model,
        contents=user_prompt,
        config=genai.types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=2048,
        ),
    )
    latency = time.perf_counter() - t0

    usage = response.usage_metadata
    input_tokens = usage.prompt_token_count or 0
    output_tokens = usage.candidates_token_count or 0
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
