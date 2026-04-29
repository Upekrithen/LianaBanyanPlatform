"""
together_adapter.py — Together AI adapter for K521 Cathedral Effect benchmark.

Uses Together AI's OpenAI-compatible API with meta-llama/Llama-3.3-70B-Instruct-Turbo.
API key: TOGETHER_API_KEY environment variable (loaded from SDS.env).

Together AI pricing (as of 2026-04-27):
  meta-llama/Llama-3.3-70B-Instruct-Turbo: $0.88/M input, $0.88/M output tokens
  Context: 131,072 tokens
  Rate limits: paid tier — no TPM cap that blocks 11K-token cathedral calls

K521 / B127
"""
from __future__ import annotations

import os
import time
from . import AdapterResponse
from r10_cross_vendor.vendor_tablet_capture import capture_vendor_call

# Pricing per million tokens (USD)
INPUT_PRICE_PER_M  = 0.88
OUTPUT_PRICE_PER_M = 0.88

DEFAULT_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo"
TOGETHER_BASE_URL = "https://api.together.xyz/v1"


def _get_client():
    from openai import OpenAI
    api_key = os.environ.get("TOGETHER_API_KEY", "")
    if not api_key:
        raise RuntimeError("TOGETHER_API_KEY not set — load SDS.env first")
    return OpenAI(api_key=api_key, base_url=TOGETHER_BASE_URL)


def health_check(timeout: int = 15) -> bool:
    """Returns True if Together AI is reachable and key is valid."""
    try:
        client = _get_client()
        resp = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[{"role": "user", "content": "ping"}],
            max_tokens=1,
            temperature=0.0,
            timeout=timeout,
        )
        return bool(resp.choices)
    except Exception:
        return False


def call(model: str, system_prompt: str, user_prompt: str, timeout: int = 120) -> AdapterResponse:
    """
    Call Together AI chat completions API (OpenAI-compatible).

    Temperature 0.0 for deterministic output.
    max_tokens=200 caps output. Consistent with Groq-cap discovery (K521): answers
    are 15-80 tokens; 200 is generous and avoids per-request token-budget overflows.
    131K context window comfortably fits the 11.7K cathedral substrate.
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
    with capture_vendor_call("together", model, "chat.completions.create") as cap:
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
