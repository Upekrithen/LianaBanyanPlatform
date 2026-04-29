"""
Perplexity adapter — Sonar models via OpenAI-compatible API.
Env var: PERPLEXITY_API_KEY

Perplexity uses an OpenAI-compatible chat completions endpoint
at https://api.perplexity.ai
"""

import os
import time
from . import AdapterResponse
from r10_cross_vendor.vendor_tablet_capture import capture_vendor_call

PRICING = {
    "sonar":     {"input": 1.00, "output": 1.00},
    "sonar-pro": {"input": 3.00, "output": 15.00},
}

DEFAULT_PRICING = {"input": 3.00, "output": 15.00}


def _get_pricing(model: str) -> dict:
    return PRICING.get(model, DEFAULT_PRICING)


def call(model: str, system_prompt: str, user_prompt: str) -> AdapterResponse:
    from openai import OpenAI

    api_key = os.environ.get("PERPLEXITY_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "PERPLEXITY_API_KEY not set. "
            "Key is labeled 'PawnKEY' in the vault (DOUBLESECRET.env)."
        )

    client = OpenAI(
        api_key=api_key,
        base_url="https://api.perplexity.ai",
    )
    pricing = _get_pricing(model)

    request_body = {
        "model": model,
        "max_tokens": 2048,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    t0 = time.perf_counter()
    with capture_vendor_call("perplexity", model, "chat.completions.create") as cap:
        response = client.chat.completions.create(
            model=model,
            max_tokens=2048,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        latency = time.perf_counter() - t0

        usage = response.usage
        input_tokens = usage.prompt_tokens if usage else 0
        output_tokens = usage.completion_tokens if usage else 0
        cost = (input_tokens / 1_000_000) * pricing["input"] + \
               (output_tokens / 1_000_000) * pricing["output"]
        text = response.choices[0].message.content if response.choices else ""

        cap.record(
            request=request_body,
            response={
                "choices": [{
                    "message": {"content": text},
                    "finish_reason": response.choices[0].finish_reason if response.choices else None,
                }],
                "model": getattr(response, "model", model),
            },
            usage={
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "cost_usd_industry_term_membership_orthogonal": round(cost, 6),
            },
        )

    return AdapterResponse(
        text=text,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=round(cost, 6),
        latency_s=round(latency, 3),
    )
