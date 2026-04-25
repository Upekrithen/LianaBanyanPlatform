"""
OpenAI direct adapter — GPT models via the OpenAI SDK.
Env var: OPENAI_API_KEY

B111 note: Azure OpenAI was swapped to OpenAI direct per Founder decision.
Models enter the study through OpenAI's direct API, not via Azure wrapper.
"""

import os
import time
from . import AdapterResponse

PRICING = {
    "gpt-4o-mini":  {"input": 0.15, "output": 0.60},
    "gpt-4o":       {"input": 2.50, "output": 10.00},
    "gpt-4.1-mini": {"input": 0.40, "output": 1.60},
    "gpt-4.1":      {"input": 2.00, "output": 8.00},
    "gpt-5-mini":   {"input": 0.25, "output": 2.00},
    "gpt-5.4-mini": {"input": 0.75, "output": 4.50},
    "gpt-5.4-nano": {"input": 0.15, "output": 0.60},
    "gpt-5.4":      {"input": 2.50, "output": 10.00},
    "gpt-5.5":      {"input": 5.00, "output": 30.00},
    "gpt-5.5-pro":  {"input": 30.00, "output": 180.00},
}

DEFAULT_PRICING = {"input": 5.00, "output": 30.00}


def _get_pricing(model: str) -> dict:
    return PRICING.get(model, DEFAULT_PRICING)


def call(model: str, system_prompt: str, user_prompt: str) -> AdapterResponse:
    from openai import OpenAI

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "OPENAI_API_KEY not set. Founder should provision R10_LibrarianBenchKEY "
            "on platform.openai.com to separate usage tracking from Cursor."
        )

    client = OpenAI(api_key=api_key)
    pricing = _get_pricing(model)

    t0 = time.perf_counter()
    response = client.chat.completions.create(
        model=model,
        max_completion_tokens=2048,
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

    return AdapterResponse(
        text=text,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=round(cost, 6),
        latency_s=round(latency, 3),
    )
