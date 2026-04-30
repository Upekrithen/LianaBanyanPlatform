"""
Pawn-via-API — Component 2: Anthropic SDK Client
KN018 / ShadowBishop Cylinder 7

Wraps the Anthropic SDK for Pawn dispatch. Uses substrate context
pre-injected into system prompt (per Wrasse pattern).

When ANTHROPIC_API_KEY is not set, operates in STUB mode:
  - Returns a realistic stub response
  - Reports token_used=0 and model="stub"
  - Marks result as stub_mode=True

This allows tests to run without live API access.
Toolsmith log: TS-PAWN-VIA-API-MCP-WRAPPER-KN018-BP002
"""

from __future__ import annotations

import hashlib
import json
import os
from typing import Any, Dict, Optional

_CONFIG_PATH_DEFAULT = None


def _load_config() -> Dict[str, Any]:
    try:
        from pathlib import Path
        cfg_path = Path(__file__).parent / "pawn_api_config.json"
        if cfg_path.exists():
            return json.loads(cfg_path.read_text(encoding="utf-8"))
    except Exception:
        pass
    return {
        "default_model": "claude-sonnet-4-6",
        "default_max_tokens": 4096,
        "default_temperature": 0.3,
        "system_prompt_template": "{{SUBSTRATE_CONTEXT}}\n\n{{TASK}}",
    }


def _build_system_prompt(substrate_context: str, template: str) -> str:
    return template.replace("{{SUBSTRATE_CONTEXT}}", substrate_context).replace("{{TASK}}", "")


def _hash_system_prompt(prompt: str) -> str:
    return hashlib.sha256(prompt.encode()).hexdigest()[:16]


def call_pawn_api(
    task: str,
    substrate_context: str,
    model: Optional[str] = None,
    max_tokens: Optional[int] = None,
    temperature: Optional[float] = None,
    cost_cap_usd: float = 5.0,
) -> Dict[str, Any]:
    """
    Call the Anthropic API with Pawn dispatch semantics.

    Returns:
    {
      result_text, model, tokens_used_input, tokens_used_output, tokens_used_total,
      estimated_cost_usd, system_prompt_hash, stub_mode, provenance
    }
    """
    config = _load_config()
    model = model or config.get("default_model", "claude-sonnet-4-6")
    max_tokens = max_tokens or config.get("default_max_tokens", 4096)
    temperature = temperature if temperature is not None else config.get("default_temperature", 0.3)
    template = config.get("system_prompt_template", "{{SUBSTRATE_CONTEXT}}\n\n{{TASK}}")

    system_prompt = _build_system_prompt(substrate_context, template)
    system_prompt_hash = _hash_system_prompt(system_prompt)

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")

    if not api_key:
        # STUB mode — no live API call
        stub_result = (
            f"[STUB MODE — no ANTHROPIC_API_KEY set]\n\n"
            f"Research task: {task}\n\n"
            f"Substrate context: {len(substrate_context)} chars loaded.\n\n"
            f"In production, Pawn-via-API would call {model} with substrate context pre-injected "
            f"and return a structured research response."
        )
        return {
            "result_text": stub_result,
            "model": "stub",
            "tokens_used_input": 0,
            "tokens_used_output": 0,
            "tokens_used_total": 0,
            "estimated_cost_usd": 0.0,
            "system_prompt_hash": system_prompt_hash,
            "stub_mode": True,
            "provenance": {
                "model": "stub",
                "temperature": temperature,
                "system_prompt_hash": system_prompt_hash,
                "substrate_context_chars": len(substrate_context),
            },
        }

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": task}],
        )
        result_text = response.content[0].text if response.content else ""
        tokens_in = response.usage.input_tokens
        tokens_out = response.usage.output_tokens
        tokens_total = tokens_in + tokens_out

        # Rough cost estimate (Sonnet 4.6 pricing as default)
        cost_per_1k_in = 0.003
        cost_per_1k_out = 0.015
        est_cost = (tokens_in / 1000 * cost_per_1k_in) + (tokens_out / 1000 * cost_per_1k_out)

        return {
            "result_text": result_text,
            "model": model,
            "tokens_used_input": tokens_in,
            "tokens_used_output": tokens_out,
            "tokens_used_total": tokens_total,
            "estimated_cost_usd": round(est_cost, 6),
            "system_prompt_hash": system_prompt_hash,
            "stub_mode": False,
            "provenance": {
                "model": model,
                "temperature": temperature,
                "system_prompt_hash": system_prompt_hash,
                "substrate_context_chars": len(substrate_context),
            },
        }
    except Exception as e:
        return {
            "result_text": "",
            "model": model,
            "tokens_used_input": 0,
            "tokens_used_output": 0,
            "tokens_used_total": 0,
            "estimated_cost_usd": 0.0,
            "system_prompt_hash": system_prompt_hash,
            "stub_mode": False,
            "error": str(e),
            "provenance": {
                "model": model,
                "temperature": temperature,
                "system_prompt_hash": system_prompt_hash,
            },
        }
