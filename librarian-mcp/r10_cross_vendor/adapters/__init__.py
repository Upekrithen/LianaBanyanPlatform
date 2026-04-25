"""
R10 Cross-Vendor Adapters
Each adapter exposes: call(model, system_prompt, user_prompt) -> AdapterResponse
"""

from dataclasses import dataclass


@dataclass
class AdapterResponse:
    text: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    latency_s: float
