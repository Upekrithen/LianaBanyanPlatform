"""
lb-reproducibility-pack — Adapters
===================================
Vendor adapters copied from K528 (r11_adapters/) plus the new local_cathedral_adapter.

Each adapter exposes: answer(question, corpus_text, model, mode) -> AdapterResponse
"""

from dataclasses import dataclass


@dataclass
class AdapterResponse:
    text: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    latency_s: float
