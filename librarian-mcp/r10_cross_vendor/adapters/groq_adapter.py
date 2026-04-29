"""
groq_adapter.py — Groq cloud adapter for K521 Cathedral Effect benchmark.

Calls Groq's OpenAI-compatible API with llama-3.3-70b-versatile.
API key: GROQ_API_KEY environment variable (loaded from SDS.env).

Groq pricing (as of 2026-04-26):
  llama-3.3-70b-versatile: $0.59/M input, $0.79/M output tokens

Temperature: 0.0 (deterministic)
max_tokens: 200 (K521 Groq: 800 caused 413 — input+max_tokens must stay <12K TPM)
num_ctx equivalent: model handles long context natively (128K window)

K521 / B127
"""
from __future__ import annotations

import os
import time
from . import AdapterResponse
from r10_cross_vendor.vendor_tablet_capture import capture_vendor_call

# Pricing per million tokens (USD)
INPUT_PRICE_PER_M  = 0.59
OUTPUT_PRICE_PER_M = 0.79

DEFAULT_MODEL = "llama-3.3-70b-versatile"


def _get_client():
    from groq import Groq
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY not set — load SDS.env first")
    return Groq(api_key=api_key)


def health_check(timeout: int = 10) -> bool:
    """Returns True if Groq is reachable and key is valid."""
    try:
        client = _get_client()
        client.models.list()
        return True
    except Exception:
        return False


def call(model: str, system_prompt: str, user_prompt: str, timeout: int = 120) -> AdapterResponse:
    """
    Call Groq chat completions API.

    Temperature 0.0 for deterministic output.
    max_tokens=200 caps output. K521 Groq constraint: input(~11,741) + max_tokens must stay
    under 12,000 TPM limit. 200-token cap gives 11,941 projected total < 12,000.
    The 11.7K-token cathedral substrate fits well within Groq's 128K window
    — no num_ctx override needed (Groq handles it natively).
    """
    client = _get_client()

    request_body = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        "temperature": 0.0,
        "max_tokens": 200,
    }

    t0 = time.perf_counter()
    with capture_vendor_call("groq", model, "chat.completions.create") as cap:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            temperature=0.0,
            max_tokens=200,
            timeout=timeout,
        )
        latency = time.perf_counter() - t0

        text          = response.choices[0].message.content or ""
        input_tokens  = response.usage.prompt_tokens     if response.usage else 0
        output_tokens = response.usage.completion_tokens if response.usage else 0
        cost_usd = (
            (input_tokens  / 1_000_000) * INPUT_PRICE_PER_M +
            (output_tokens / 1_000_000) * OUTPUT_PRICE_PER_M
        )

        cap.record(
            request=request_body,
            response={
                "choices": [{"message": {"content": text}}],
                "model": model,
            },
            usage={
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "cost_usd_industry_term_membership_orthogonal": round(cost_usd, 6),
            },
        )

    return AdapterResponse(
        text=text,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=round(cost_usd, 6),
        latency_s=round(latency, 3),
    )
