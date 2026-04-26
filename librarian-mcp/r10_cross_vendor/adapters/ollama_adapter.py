"""
ollama_adapter.py — Local Ollama adapter for K511 Cathedral Effect benchmark.

Calls the Ollama chat completions API at http://localhost:11434/api/chat.
No API key required (local inference).
Cost is always $0.00 (compute-only; not tracked).

Target model: llama3.3:70b-instruct-q4_K_M
Endpoint: http://localhost:11434/api/chat
Temperature: 0.0 (deterministic)

K511 / B125
"""
from __future__ import annotations

import json
import time
import urllib.request
import urllib.error
from . import AdapterResponse

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL   = "llama3.3:70b-instruct-q4_K_M"

PRICING: dict[str, dict] = {}
DEFAULT_PRICING = {"input": 0.0, "output": 0.0}   # local — no cost


def health_check(timeout: int = 5) -> bool:
    """Returns True if Ollama is reachable."""
    try:
        with urllib.request.urlopen(f"{OLLAMA_BASE_URL}/api/tags", timeout=timeout) as r:
            return r.status == 200
    except Exception:
        return False


def list_models() -> list[str]:
    """Return list of pulled model names."""
    try:
        with urllib.request.urlopen(f"{OLLAMA_BASE_URL}/api/tags", timeout=10) as r:
            data = json.loads(r.read().decode())
            return [m["name"] for m in data.get("models", [])]
    except Exception:
        return []


def call(model: str, system_prompt: str, user_prompt: str, timeout: int = 600) -> AdapterResponse:
    """
    Call Ollama /api/chat with the given model, system prompt, and user prompt.

    Uses the chat format (system + user messages) to mirror the R13 harness protocol.
    Temperature 0.0 for deterministic output.
    num_predict=800 caps output tokens (matches R13 cloud adapter max_tokens).
    """
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        "stream": False,
        "options": {
            "temperature": 0.0,
            "num_predict": 800,
        },
    }
    body = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(
        f"{OLLAMA_BASE_URL}/api/chat",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
    except urllib.error.URLError as e:
        raise ConnectionError(f"Ollama unreachable at {OLLAMA_BASE_URL}: {e}") from e

    latency = time.perf_counter() - t0
    data = json.loads(raw)

    # /api/chat response shape:
    # { "model": ..., "message": {"role": "assistant", "content": "..."},
    #   "done": true, "eval_count": N, "prompt_eval_count": N, "total_duration": ns }
    text = data.get("message", {}).get("content", "")
    prompt_eval_count  = data.get("prompt_eval_count", 0)
    eval_count         = data.get("eval_count", 0)

    return AdapterResponse(
        text=text,
        input_tokens=prompt_eval_count,
        output_tokens=eval_count,
        cost_usd=0.0,        # local inference: $0
        latency_s=round(latency, 3),
    )
