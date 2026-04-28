"""
lb-reproducibility-pack — Local Cathedral Adapter
==================================================
Standalone Python implementation of Cathedral indexed retrieval.
No Node.js. No LB server. No network calls except to AI vendor APIs.

Implements:
  - LocalCathedralClient: BM25-style in-memory index over corpus segments
  - answer(question, corpus_text, model, client): returns (AdapterResponse, context_str)

The local Cathedral:
  1. At initialization: splits the corpus into paragraph-level segments,
     builds a TF-IDF / BM25 inverted index over them.
  2. At query time: retrieves the top-N most relevant segments for the question,
     injects them as Cathedral context into the model prompt.

This is the sovereignty-contract-critical component: it runs entirely locally.
Outbound network calls = AI vendor API only (Anthropic / OpenAI / Google).
LB infrastructure = NOT in the loop.

Supported models:
  - claude-haiku-4-5-20251001, claude-sonnet-4-6 (Anthropic)
  - gpt-4o-mini, gpt-4o (OpenAI)
  - gemini-2.5-flash (Google)

Sovereignty contract verified:
  - No calls to LB servers, no telemetry endpoints
  - Corpus segments never leave the local process
  - Results written to local disk only
"""
from __future__ import annotations

import math
import os
import re
import time
from collections import Counter
from dataclasses import dataclass
from typing import Optional

from adapters import AdapterResponse


PRICING: dict[str, dict[str, float]] = {
    "claude-haiku-4-5-20251001":  {"input": 1.00,  "output": 5.00},
    "claude-haiku-4-5":           {"input": 1.00,  "output": 5.00},
    "claude-sonnet-4-6":          {"input": 3.00,  "output": 15.00},
    "claude-opus-4-7":            {"input": 15.00, "output": 75.00},
    "gpt-4o-mini":                {"input": 0.15,  "output": 0.60},
    "gpt-4o":                     {"input": 2.50,  "output": 10.00},
    "gemini-2.5-flash":           {"input": 0.075, "output": 0.30},
}

SYSTEM_PREFIX = (
    "You are a cooperative AI platform knowledge assistant. Answer using ONLY the "
    "context passages below. If the context does not contain the answer, say "
    "'I don't know' — do NOT invent facts.\n\n"
    "--- LOCAL CATHEDRAL CONTEXT (top relevant passages) ---\n\n"
)
SYSTEM_SUFFIX = "\n\n--- END OF CONTEXT ---\n\nAnswer the question using only the information above."

TOP_K = 8  # Number of corpus segments to retrieve per query
MIN_SEGMENT_WORDS = 15  # Minimum words for a segment to be indexed


@dataclass
class IndexedSegment:
    segment_id: int
    text: str
    tokens: list[str]
    tf: dict[str, float]


class LocalCathedralClient:
    """
    In-memory BM25 Cathedral over an arbitrary corpus text.

    Usage:
        client = LocalCathedralClient(corpus_text)
        context, segments = client.retrieve(question, top_k=8)
    """

    # BM25 parameters
    K1 = 1.5
    B = 0.75

    def __init__(self, corpus_text: str) -> None:
        self._segments = self._parse_segments(corpus_text)
        self._idf = self._build_idf()
        self.index_size = len(self._segments)

    # ------------------------------------------------------------------
    # Corpus parsing
    # ------------------------------------------------------------------

    def _tokenize(self, text: str) -> list[str]:
        """Lowercase word tokens, stripping punctuation."""
        return re.findall(r"\b[a-z0-9][a-z0-9'\-]*[a-z0-9]\b|[a-z0-9]", text.lower())

    def _parse_segments(self, corpus_text: str) -> list[IndexedSegment]:
        """
        Split corpus into indexable segments. Strategy:
          1. Split on --- separators (fact boundaries) first.
          2. Each resulting block: split into paragraphs.
          3. Minimum-length filter.
        """
        segments: list[IndexedSegment] = []
        seg_id = 0

        # Primary: split on fact separators
        blocks = re.split(r'\n---+\n', corpus_text)

        for block in blocks:
            # Secondary: split on double newlines (paragraphs within a fact block)
            paragraphs = re.split(r'\n\n+', block.strip())
            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue
                words = para.split()
                if len(words) < MIN_SEGMENT_WORDS:
                    continue
                tokens = self._tokenize(para)
                if not tokens:
                    continue
                tf: dict[str, float] = {}
                counts = Counter(tokens)
                total = len(tokens)
                for tok, cnt in counts.items():
                    tf[tok] = cnt / total
                segments.append(IndexedSegment(
                    segment_id=seg_id,
                    text=para,
                    tokens=tokens,
                    tf=tf,
                ))
                seg_id += 1

        return segments

    def _build_idf(self) -> dict[str, float]:
        """Compute BM25 IDF for all vocabulary terms."""
        N = len(self._segments)
        if N == 0:
            return {}
        df: dict[str, int] = Counter()
        for seg in self._segments:
            for tok in set(seg.tokens):
                df[tok] += 1
        idf: dict[str, float] = {}
        for tok, freq in df.items():
            idf[tok] = math.log((N - freq + 0.5) / (freq + 0.5) + 1)
        return idf

    # ------------------------------------------------------------------
    # Retrieval
    # ------------------------------------------------------------------

    def retrieve(self, question: str, top_k: int = TOP_K) -> tuple[str, list[int]]:
        """
        BM25 retrieval: returns (context_str, [segment_ids]).
        context_str is ready to inject into the model system prompt.
        """
        query_tokens = self._tokenize(question)
        if not query_tokens or not self._segments:
            return ("(no context available)", [])

        avg_dl = sum(len(s.tokens) for s in self._segments) / len(self._segments)
        scores: list[tuple[float, int]] = []

        for seg in self._segments:
            dl = len(seg.tokens)
            score = 0.0
            for qt in set(query_tokens):
                if qt not in self._idf:
                    continue
                idf = self._idf[qt]
                tf = seg.tf.get(qt, 0.0) * dl  # raw count approximation
                numerator = tf * (self.K1 + 1)
                denominator = tf + self.K1 * (1 - self.B + self.B * dl / avg_dl)
                score += idf * (numerator / denominator)
            if score > 0:
                scores.append((score, seg.segment_id))

        scores.sort(key=lambda x: -x[0])
        top_ids = [sid for _, sid in scores[:top_k]]

        # Reconstruct in document order for coherent context
        top_ids_set = set(top_ids)
        ordered = [seg for seg in self._segments if seg.segment_id in top_ids_set]
        context_parts = [f"[Passage {i+1}]\n{seg.text}" for i, seg in enumerate(ordered)]
        context_str = "\n\n".join(context_parts)

        return context_str, top_ids


# ---------------------------------------------------------------------------
# answer() — the primary interface called by run_benchmark.py
# ---------------------------------------------------------------------------

def answer(
    question: str,
    corpus_text: str,
    model: str = "claude-haiku-4-5-20251001",
    client: "LocalCathedralClient | None" = None,
) -> tuple[AdapterResponse, str]:
    """
    Run one question through the local Cathedral.

    Returns (AdapterResponse, context_str_used).
    The context_str is the retrieved passages injected into the prompt.

    Sovereignty guarantee: only outbound calls are to AI vendor APIs using env API keys.
    No LB server calls. No telemetry.
    """
    if client is None:
        client = LocalCathedralClient(corpus_text)

    context_str, _ = client.retrieve(question, top_k=TOP_K)
    system_prompt = SYSTEM_PREFIX + context_str + SYSTEM_SUFFIX

    pricing = PRICING.get(model, {"input": 3.00, "output": 15.00})

    t0 = time.perf_counter()

    # Route to the correct vendor SDK
    if model.startswith("claude"):
        resp = _call_anthropic(model, system_prompt, question, pricing)
    elif model.startswith("gpt") or model.startswith("o1") or model.startswith("o3"):
        resp = _call_openai(model, system_prompt, question, pricing)
    elif model.startswith("gemini"):
        resp = _call_google(model, system_prompt, question, pricing)
    else:
        raise ValueError(f"local_cathedral_adapter: unsupported model '{model}'. "
                         "Add vendor routing or use claude-haiku-4-5-20251001.")

    latency = time.perf_counter() - t0
    resp.latency_s = round(latency, 3)
    return resp, context_str


def _call_anthropic(model: str, system: str, question: str, pricing: dict) -> AdapterResponse:
    import anthropic  # noqa: PLC0415
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY not set — add to .env")
    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model=model, max_tokens=512,
        system=system,
        messages=[{"role": "user", "content": question}],
    )
    in_tok = response.usage.input_tokens
    out_tok = response.usage.output_tokens
    cost = (in_tok / 1_000_000) * pricing["input"] + (out_tok / 1_000_000) * pricing["output"]
    text = response.content[0].text if response.content else ""
    return AdapterResponse(text=text, input_tokens=in_tok, output_tokens=out_tok,
                           cost_usd=round(cost, 6), latency_s=0.0)


def _call_openai(model: str, system: str, question: str, pricing: dict) -> AdapterResponse:
    import openai  # noqa: PLC0415
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY not set — add to .env")
    client = openai.OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model=model, max_tokens=512,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": question},
        ],
    )
    in_tok = response.usage.prompt_tokens if response.usage else 0
    out_tok = response.usage.completion_tokens if response.usage else 0
    cost = (in_tok / 1_000_000) * pricing["input"] + (out_tok / 1_000_000) * pricing["output"]
    text = response.choices[0].message.content or "" if response.choices else ""
    return AdapterResponse(text=text, input_tokens=in_tok, output_tokens=out_tok,
                           cost_usd=round(cost, 6), latency_s=0.0)


def _call_google(model: str, system: str, question: str, pricing: dict) -> AdapterResponse:
    import google.generativeai as genai  # noqa: PLC0415
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("GOOGLE_API_KEY or GEMINI_API_KEY not set — add to .env")
    genai.configure(api_key=api_key)
    gmodel = genai.GenerativeModel(
        model_name=model,
        system_instruction=system,
    )
    response = gmodel.generate_content(question)
    text = response.text if hasattr(response, "text") else ""
    # Google doesn't always return token counts in all SDK versions
    in_tok = getattr(getattr(response, "usage_metadata", None), "prompt_token_count", 0) or 0
    out_tok = getattr(getattr(response, "usage_metadata", None), "candidates_token_count", 0) or 0
    cost = (in_tok / 1_000_000) * pricing["input"] + (out_tok / 1_000_000) * pricing["output"]
    return AdapterResponse(text=text, input_tokens=in_tok, output_tokens=out_tok,
                           cost_usd=round(cost, 6), latency_s=0.0)
