"""
Seer — LLM reasoning over the Eblet-indexed Pyramid.

K489 · B123 · Crown Jewel #2298 (Seer / Augur / Eblets — The Awareness Net)

Architecture:
  1. Initialization   — load EbletStore; build TF-IDF index over summaries
  2. Query handling   — TF-IDF relevance match → top-K Eblets → thought-bundle
  3. LLM reasoning    — Haiku-class call with query + thought-bundle in context
  4. Authority chain  — provenance footer: claim → Eblet → Synapse → source
  5. Pointer-resolution on demand — resolve Eblets to full Synapse content
     triggered by RESOLVE:<eblet_id> tokens in LLM response (virtual-context-expansion)

Design decisions (K489):
  - Relevance algorithm: TF-IDF (no external deps; deterministic; fast on 100s of Eblets)
  - Pointer-resolution trigger: explicit RESOLVE:<eblet_id> in LLM output
    (LLM signals when it needs more detail; Seer re-issues with expanded context)
  - Provenance footer: summary-trace (one line per claim anchor); full chain on request
  - Multi-Seer-ready: one class, instantiable per substrate (sets up Augur cleanly)

K492 update: domain_filter parameter for multi-Seer / Augur substrate partitioning.
  When provided, _load() applies it after loading all Eblets from the shared store.
  Augur instantiates Seer-A and Seer-B with distinct domain_filter functions without
  duplicating the EbletStore file.

REF Staff discipline: Seer reads Eblets / Synapses / bedrock;
  writes only conversational output (and optionally query log). No source modification.

Usage:
  from seers.seer import Seer
  seer = Seer(api_client=anthropic_client)
  result = seer.query("What is the Cathedral Effect?")
  print(result.answer)
  print(result.provenance_summary)
"""

from __future__ import annotations

import json
import math
import os
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Optional

# --- Path setup ---------------------------------------------------------------
_HERE = Path(__file__).parent
_LIBRARIAN_MCP = _HERE.parent
sys.path.insert(0, str(_LIBRARIAN_MCP.parent))
sys.path.insert(0, str(_LIBRARIAN_MCP))

# Force UTF-8 on Windows consoles (cp1252 can't encode arrows / special chars)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from eblets.eblet import Eblet, EbletStore, EBLET_STORE_PATH, EBLET_ACCESS_LOG_PATH, _get_synapse_text

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Number of top Eblets to load as thought-bundle (K489 default)
DEFAULT_TOP_K = 8

# Minimum relevance score to include in thought-bundle
MIN_RELEVANCE_SCORE = 0.005

# Maximum pointer-resolution attempts per query (cost discipline)
MAX_RESOLVE_DEPTH = 3

# LLM model for Seer reasoning (Haiku-class; cost-discipline default)
DEFAULT_MODEL = "claude-haiku-4-5"

# Honest-unknown threshold: if top Eblet score below this, report scope-boundary
HONEST_UNKNOWN_THRESHOLD = 0.008

# TF-IDF stop words
STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "it", "its", "be", "was",
    "are", "were", "been", "has", "have", "had", "do", "does", "did",
    "will", "would", "could", "should", "may", "might", "this", "that",
    "these", "those", "i", "we", "you", "he", "she", "they", "not",
    "no", "so", "if", "then", "than", "when", "what", "which", "who",
    "how", "also", "about", "into", "out", "up", "can", "one", "two",
    "all", "more", "any", "each", "their", "there", "here", "per",
    "via", "s", "t", "re", "ve", "ll", "d", "m",
}

# Pattern to detect RESOLVE requests from the LLM
_RESOLVE_RE = re.compile(r"RESOLVE:(EB-\d{6})", re.IGNORECASE)


# ---------------------------------------------------------------------------
# TF-IDF Index
# ---------------------------------------------------------------------------

def _tokenize(text: str) -> list[str]:
    """Simple word tokenizer; lowercased, filtered for stop words and length."""
    tokens = re.findall(r"[a-z][a-z0-9_\-]*", text.lower())
    return [t for t in tokens if t not in STOP_WORDS and len(t) > 2]


class TFIDFIndex:
    """
    Lightweight TF-IDF index over a set of documents (Eblet summaries).

    Built at Seer initialization time; O(N×V) memory where N=Eblet count, V=vocab size.
    Relevance of a query to a document is cosine similarity of TF-IDF vectors.
    """

    def __init__(self) -> None:
        self._doc_vectors: dict[str, dict[str, float]] = {}  # eblet_id → {term: tfidf}
        self._idf: dict[str, float] = {}
        self._doc_count = 0

    def build(self, eblets: list[Eblet]) -> None:
        """Build the index from a list of Eblets.

        K495 corpus-normalized IDF: IDF weights are computed from BEDROCK Eblets
        only (i.e., those without `synthetic_bridging=True` in metadata). Synthetic
        bridging Eblets still appear in search results and contribute TF to their own
        doc vectors, but they do NOT inflate document-frequency counts — which would
        dilute IDF weights on canonical bedrock-corpus terms and degrade recall for
        orphan keystones. (K494 finding; K495 fix default-on per Phase 0.3 decision.)
        """
        self._doc_count = len(eblets)
        if self._doc_count == 0:
            return

        # Partition: bedrock (IDF authority) vs synthetic (retrieval-only).
        # Uses Eblet.is_synthetic_bridging() for both K495+ metadata convention and
        # legacy K494 provenance_chain string "synthetic_bridging=true".
        bedrock_eblets = [e for e in eblets if not e.is_synthetic_bridging()]
        bedrock_count = len(bedrock_eblets)

        # Term frequencies per document (ALL Eblets — synthetic ones still retrievable)
        tf_raw: dict[str, dict[str, int]] = {}
        # DF counted over BEDROCK only — preserves IDF integrity for canonical terms
        df_bedrock: dict[str, int] = defaultdict(int)

        for eblet in eblets:
            doc_id = eblet.eblet_id
            tokens = _tokenize(eblet.summary_text)
            tf_counts = Counter(tokens)
            tf_raw[doc_id] = dict(tf_counts)

        for eblet in bedrock_eblets:
            tokens = set(_tokenize(eblet.summary_text))
            for term in tokens:
                df_bedrock[term] += 1

        # IDF: log(N_bedrock / max(df_bedrock[term], 1))
        # Terms appearing only in synthetic Eblets get log(N_bedrock / 1) — treated
        # as rare bedrock terms, which is conservative and correct since they were
        # never observed in the canonical corpus.
        n_idf = max(bedrock_count, 1)
        self._idf = {
            term: math.log(n_idf / max(count, 1))
            for term, count in df_bedrock.items()
        }
        # For terms that appear ONLY in synthetic Eblets, assign rare-term IDF
        all_terms: set[str] = set()
        for tf in tf_raw.values():
            all_terms.update(tf.keys())
        for term in all_terms:
            if term not in self._idf:
                self._idf[term] = math.log(n_idf / 1)

        # TF-IDF vectors (normalized)
        for eblet in eblets:
            doc_id = eblet.eblet_id
            tf = tf_raw.get(doc_id, {})
            total = max(1, sum(tf.values()))
            vec: dict[str, float] = {}
            for term, count in tf.items():
                vec[term] = (count / total) * self._idf.get(term, 0.0)
            # L2-normalize
            norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
            self._doc_vectors[doc_id] = {t: v / norm for t, v in vec.items()}

    def score(self, query: str) -> dict[str, float]:
        """
        Compute relevance scores for all indexed documents against `query`.
        Returns {eblet_id: cosine_similarity}. Higher = more relevant.
        """
        if not self._doc_vectors:
            return {}

        q_tokens = _tokenize(query)
        if not q_tokens:
            return {doc_id: 0.0 for doc_id in self._doc_vectors}

        # Query TF-IDF vector
        q_tf = Counter(q_tokens)
        q_total = max(1, sum(q_tf.values()))
        q_vec: dict[str, float] = {}
        for term, count in q_tf.items():
            idf = self._idf.get(term, math.log(self._doc_count / 1))
            q_vec[term] = (count / q_total) * idf

        q_norm = math.sqrt(sum(v * v for v in q_vec.values())) or 1.0
        q_vec = {t: v / q_norm for t, v in q_vec.items()}

        # Cosine similarity for each document
        scores: dict[str, float] = {}
        for doc_id, doc_vec in self._doc_vectors.items():
            dot = sum(q_vec.get(t, 0.0) * w for t, w in doc_vec.items())
            scores[doc_id] = round(dot, 6)

        return scores


# ---------------------------------------------------------------------------
# SeerResult
# ---------------------------------------------------------------------------

@dataclass
class SeerResult:
    """
    Complete Seer response for a single query.

    Fields:
      query            — the original user query
      answer           — the Seer's reasoned answer (LLM output, cleaned)
      top_eblets       — list of (Eblet, relevance_score) pairs used as thought-bundle
      resolved_eblets  — list of (Eblet, resolved_content_dict) pairs resolved during reasoning
      provenance_summary — one-line-per-cited-anchor provenance footer
      provenance_full  — verbose chain for each cited anchor (Eblet → Synapse → source)
      honest_unknown   — True if the Seer reported scope-boundary rather than answering
      model_used       — LLM model name
      tokens_in        — estimated input tokens
      tokens_out       — estimated output tokens
      cost_usd_est     — estimated LLM cost
      elapsed_s        — wall-clock time
      created_at       — ISO-8601 timestamp
    """
    query: str
    answer: str
    top_eblets: list[tuple[Eblet, float]]
    resolved_eblets: list[tuple[Eblet, dict]]
    provenance_summary: str
    provenance_full: str
    honest_unknown: bool
    model_used: str
    tokens_in: int
    tokens_out: int
    cost_usd_est: float
    elapsed_s: float
    created_at: str

    def to_dict(self) -> dict:
        return {
            "query": self.query,
            "answer": self.answer,
            "honest_unknown": self.honest_unknown,
            "model_used": self.model_used,
            "top_eblets": [
                {
                    "eblet_id": eb.eblet_id,
                    "synapse_pointer": eb.synapse_pointer,
                    "relevance_score": score,
                    "summary_excerpt": eb.summary_text[:150],
                }
                for eb, score in self.top_eblets
            ],
            "resolved_eblets": [
                {
                    "eblet_id": eb.eblet_id,
                    "synapse_pointer": eb.synapse_pointer,
                    "entry_count": content.get("entry_count", 0),
                }
                for eb, content in self.resolved_eblets
            ],
            "provenance_summary": self.provenance_summary,
            "provenance_full": self.provenance_full,
            "tokens_in": self.tokens_in,
            "tokens_out": self.tokens_out,
            "cost_usd_est": self.cost_usd_est,
            "elapsed_s": self.elapsed_s,
            "created_at": self.created_at,
        }


# ---------------------------------------------------------------------------
# Seer
# ---------------------------------------------------------------------------

class Seer:
    """
    The Seer: LLM reasoning over the Eblet-indexed Pyramid.

    Instantiate once per substrate (one Eblet store = one Seer).
    For multiple Cathedral substrates, instantiate multiple Seers.
    Multi-Seer-ready: each instance is fully independent (sets up Augur cleanly).

    Example:
        import anthropic
        client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        seer = Seer(api_client=client)
        result = seer.query("What is the Cathedral Effect?")
        print(result.answer)
    """

    def __init__(
        self,
        api_client: Optional[Any] = None,
        eblet_store_path: Path = EBLET_STORE_PATH,
        top_k: int = DEFAULT_TOP_K,
        model: str = DEFAULT_MODEL,
        seer_id: str = "Seer-K489",
        domain_filter: Optional[Callable[["Eblet"], bool]] = None,
        domain_name: str = "full",
    ) -> None:
        """
        Initialize the Seer.

        Args:
            api_client: anthropic.Anthropic() instance (caller-injected)
            eblet_store_path: path to eblets.jsonl (defaults to canonical store)
            top_k: number of top Eblets to load into thought-bundle
            model: LLM model for reasoning (Haiku-class default)
            seer_id: identifier for this Seer instance (multi-Seer support)
            domain_filter: optional Callable[[Eblet], bool]; when provided, only
                Eblets passing this filter are loaded into this Seer's substrate.
                Enables Augur-level substrate partitioning without file duplication.
                (K492: Seer-A uses arch_empirics_filter, Seer-B uses founder_voice_filter)
            domain_name: human-readable domain label (e.g. "arch_empirics",
                "founder_voice"); used in provenance and Augur routing reporting.
        """
        self.api_client = api_client
        self.store = EbletStore(eblet_store_path)
        self.top_k = top_k
        self.model = model
        self.seer_id = seer_id
        self.domain_filter = domain_filter
        self.domain_name = domain_name
        self._eblets: list[Eblet] = []
        self._eblet_map: dict[str, Eblet] = {}
        self._index = TFIDFIndex()
        self._query_log: list[dict] = []
        self._load()

    def _load(self) -> None:
        """Load Eblets from store, apply domain_filter if set, build TF-IDF index."""
        all_eblets = self.store.load_all()
        if self.domain_filter is not None:
            self._eblets = [eb for eb in all_eblets if self.domain_filter(eb)]
        else:
            self._eblets = all_eblets
        self._eblet_map = {eb.eblet_id: eb for eb in self._eblets}
        self._index.build(self._eblets)

    def reload(self) -> None:
        """Reload Eblets and rebuild index (call after live-feed adds new Eblets)."""
        self._load()

    @property
    def eblet_count(self) -> int:
        return len(self._eblets)

    # ------------------------------------------------------------------
    # Relevance matching
    # ------------------------------------------------------------------

    def rank_eblets(self, query: str) -> list[tuple[Eblet, float]]:
        """
        Return all Eblets sorted by TF-IDF relevance to `query`, descending.
        Filters out Eblets with score < MIN_RELEVANCE_SCORE (unless all are below, in which case returns top-K anyway).
        """
        scores = self._index.score(query)
        if not scores:
            return []

        ranked = sorted(
            [(self._eblet_map[eid], score) for eid, score in scores.items()],
            key=lambda x: -x[1],
        )
        # Filter low-relevance; always return at least top-3 for honest-unknown check
        filtered = [(eb, s) for eb, s in ranked if s >= MIN_RELEVANCE_SCORE]
        if not filtered:
            filtered = ranked[:3]  # fallback for sparse queries
        return filtered

    def select_thought_bundle(self, query: str) -> tuple[list[tuple[Eblet, float]], bool]:
        """
        Select top-K Eblets as the thought-bundle for a query.

        Returns:
            (thought_bundle, is_honest_unknown)
            is_honest_unknown=True if max relevance score < HONEST_UNKNOWN_THRESHOLD
        """
        ranked = self.rank_eblets(query)
        if not ranked:
            return [], True

        top_score = ranked[0][1]
        is_honest_unknown = top_score < HONEST_UNKNOWN_THRESHOLD

        thought_bundle = ranked[: self.top_k]
        return thought_bundle, is_honest_unknown

    # ------------------------------------------------------------------
    # Pointer resolution
    # ------------------------------------------------------------------

    def resolve_eblet(self, eblet: Eblet) -> dict:
        """
        Resolve an Eblet to its full Synapse cluster content.

        Returns the resolved cluster dict (see Eblet.resolve()).
        Records access in the EbletStore access log (K493 instrumentation).
        """
        try:
            result = eblet.resolve()
            self.store.record_access(eblet.eblet_id)
            return result
        except FileNotFoundError as exc:
            return {"error": str(exc), "eblet_id": eblet.eblet_id}

    # ------------------------------------------------------------------
    # Provenance chain builder
    # ------------------------------------------------------------------

    def _build_provenance(
        self,
        thought_bundle: list[tuple[Eblet, float]],
        resolved_eblets: list[tuple[Eblet, dict]],
        verbose: bool = False,
    ) -> tuple[str, str]:
        """
        Build provenance footer strings.

        Returns:
            (provenance_summary, provenance_full)
            summary: one line per anchor "EB-NNNNNN → synapse_K{N}.jsonl#{cluster}"
            full: verbose chain Eblet → Synapse entries → source file
        """
        resolved_ids = {eb.eblet_id for eb, _ in resolved_eblets}

        summary_lines = []
        full_lines = []

        for i, (eblet, score) in enumerate(thought_bundle, 1):
            is_resolved = eblet.eblet_id in resolved_ids
            resolve_flag = " [resolved->full]" if is_resolved else ""
            summary_lines.append(
                f"  [{i}] {eblet.eblet_id} -> {eblet.synapse_pointer} "
                f"(relevance={score:.4f}){resolve_flag}"
            )
            if verbose:
                full_lines.append(f"\n--- Eblet {i}: {eblet.eblet_id} ---")
                full_lines.append(f"  Synapse pointer: {eblet.synapse_pointer}")
                full_lines.append(f"  Summary: {eblet.summary_text[:200]}…")
                full_lines.append(f"  Scribe attributions: {', '.join(eblet.scribe_attributions)}")
                full_lines.append(f"  Keystone anchors: {', '.join(eblet.keystone_anchors) or 'none'}")
                full_lines.append(f"  Provenance chain: {' -> '.join(eblet.provenance_chain)}")
                if is_resolved:
                    for eb2, content in resolved_eblets:
                        if eb2.eblet_id == eblet.eblet_id:
                            full_lines.append(f"  Resolved entries: {content.get('entry_count', '?')}")
                            break

        summary_str = "Provenance (Eblet index):\n" + "\n".join(summary_lines) if summary_lines else ""
        full_str = "\n".join(full_lines) if full_lines else summary_str

        return summary_str, full_str

    # ------------------------------------------------------------------
    # System prompt builder
    # ------------------------------------------------------------------

    def _build_system_prompt(self, thought_bundle: list[tuple[Eblet, float]]) -> str:
        """Build the LLM system prompt with the thought-bundle loaded as context."""
        bundle_text_parts = []
        for i, (eblet, score) in enumerate(thought_bundle, 1):
            bundle_text_parts.append(
                f"[INDEX ENTRY {i} — {eblet.eblet_id} | relevance={score:.4f}]\n"
                f"Source: {eblet.synapse_pointer}\n"
                f"{eblet.summary_text}\n"
            )

        bundle_text = "\n---\n".join(bundle_text_parts)

        return (
            "You are the Seer — an AI reasoning over the Liana Banyan Pyramid's "
            "Eblet-indexed knowledge substrate.\n\n"
            "The following are index entries (Eblets) — compressed summaries of "
            "session reasoning moments. Each entry is a pointer into a larger body of "
            "archived reasoning. These ARE the authoritative sources you have access to.\n\n"
            "Rules:\n"
            "1. Answer from the index entries provided. Cite by [INDEX ENTRY N].\n"
            "2. If you need the full detail behind an entry (not just the summary), "
            "output RESOLVE:<eblet_id> (e.g., RESOLVE:EB-000042). The system will expand "
            "that entry and re-issue your query with full content. Use sparingly — cost discipline.\n"
            "3. If the index entries do not contain enough information to answer the query, "
            "say exactly: SCOPE-BOUNDARY: <brief explanation of what the index covers vs. "
            "what the query asks>. Do NOT synthesize from training data.\n"
            "4. Be precise, dense, and cite the index entries for every claim.\n\n"
            "=== THOUGHT BUNDLE (Eblet index entries) ===\n\n"
            + bundle_text
            + "\n=== END THOUGHT BUNDLE ==="
        )

    def _build_resolution_context(
        self,
        resolved_eblets: list[tuple[Eblet, dict]],
    ) -> str:
        """Build additional context block for resolved Eblets."""
        parts = []
        for eblet, content in resolved_eblets:
            entries = content.get("resolved_entries", [])
            entry_texts = []
            for e in entries:
                text = _get_synapse_text(e)
                if text:
                    entry_texts.append(text)
            combined = "\n\n".join(entry_texts[:5])  # cap at 5 entries to manage tokens
            parts.append(
                f"[FULL CONTENT — {eblet.eblet_id} | {eblet.synapse_pointer}]\n"
                f"{combined}\n"
            )
        return "\n---\n".join(parts)

    # ------------------------------------------------------------------
    # Core query method
    # ------------------------------------------------------------------

    def query(
        self,
        user_query: str,
        verbose_provenance: bool = False,
        max_resolve_depth: int = MAX_RESOLVE_DEPTH,
    ) -> SeerResult:
        """
        Issue a query to the Seer.

        1. Select top-K Eblets by TF-IDF relevance (thought-bundle).
        2. Check honest-unknown threshold.
        3. Issue LLM call with system-prompt + thought-bundle.
        4. Detect RESOLVE:<eblet_id> tokens → resolve those Eblets → re-issue (up to max_resolve_depth).
        5. Return SeerResult with answer + full provenance chain.

        Args:
            user_query: the user's question
            verbose_provenance: if True, provenance_full includes full chain detail
            max_resolve_depth: max pointer-resolution rounds (cost discipline)

        Returns:
            SeerResult with answer, provenance, and metadata.
        """
        import time as _time
        wall_start = _time.time()
        created_at = datetime.now(timezone.utc).isoformat()

        # Haiku pricing
        haiku_input_per_m = 0.80
        haiku_output_per_m = 4.00

        # Step 1: Select thought-bundle
        thought_bundle, is_honest_unknown = self.select_thought_bundle(user_query)

        # Step 2: honest-unknown fast path (no LLM call)
        if is_honest_unknown or not thought_bundle:
            domain_label = f" [{self.domain_name}]" if self.domain_name != "full" else ""
            answer = (
                f"SCOPE-BOUNDARY{domain_label}: The Pyramid's Eblet index ({self.seer_id}) "
                "does not contain sufficient coverage to answer this query. "
                f"This Seer's substrate ({self.domain_name}) covers "
                + (
                    "architecture/empirics: Cathedral Effect benchmarks, Miners/Sculptors, "
                    "Seer/Augur/Eblets technical implementation, R10/R11 methodology."
                    if self.domain_name == "arch_empirics"
                    else (
                        "founder-voice/biography: Rhetorical Keystones, Stone Tablets, "
                        "IP provenance chains, Keystone-Compounding Loop, Founder speech-acts."
                        if self.domain_name == "founder_voice"
                        else
                        "Liana Banyan Platform architecture, session reasoning (K475–K491+), "
                        "R10/R11 benchmark methodology, Cathedral systems, and related domains."
                    )
                )
                + f" Query asked: '{user_query[:200]}'. "
                "If this falls within expected coverage, the Eblet store may need rebuilding "
                "from updated Synapse files."
            )
            prov_summary, prov_full = self._build_provenance(
                thought_bundle, [], verbose_provenance
            )
            result = SeerResult(
                query=user_query,
                answer=answer,
                top_eblets=thought_bundle,
                resolved_eblets=[],
                provenance_summary=prov_summary or "(no Eblets matched above threshold)",
                provenance_full=prov_full or "(no Eblets matched above threshold)",
                honest_unknown=True,
                model_used=self.model,
                tokens_in=0,
                tokens_out=0,
                cost_usd_est=0.0,
                elapsed_s=round(_time.time() - wall_start, 2),
                created_at=created_at,
            )
            self._query_log.append(result.to_dict())
            return result

        if self.api_client is None:
            answer = (
                "[Seer: no API client configured — cannot issue LLM reasoning call. "
                "Thought-bundle loaded. Set api_client to enable reasoning.]"
            )
            prov_summary, prov_full = self._build_provenance(
                thought_bundle, [], verbose_provenance
            )
            return SeerResult(
                query=user_query,
                answer=answer,
                top_eblets=thought_bundle,
                resolved_eblets=[],
                provenance_summary=prov_summary,
                provenance_full=prov_full,
                honest_unknown=False,
                model_used=self.model,
                tokens_in=0,
                tokens_out=0,
                cost_usd_est=0.0,
                elapsed_s=round(_time.time() - wall_start, 2),
                created_at=created_at,
            )

        # Step 3: LLM call (with optional pointer-resolution loop)
        resolved_eblets: list[tuple[Eblet, dict]] = []
        resolve_depth = 0
        total_tokens_in = 0
        total_tokens_out = 0

        system_prompt = self._build_system_prompt(thought_bundle)
        messages = [{"role": "user", "content": user_query}]

        final_answer = ""
        while True:
            response = self.api_client.messages.create(
                model=self.model,
                max_tokens=1000,
                system=system_prompt,
                messages=messages,
            )
            answer_text = response.content[0].text.strip()

            # Token tracking from API response
            if hasattr(response, "usage") and response.usage:
                total_tokens_in += response.usage.input_tokens
                total_tokens_out += response.usage.output_tokens
            else:
                # Estimate
                total_tokens_in += max(1, int(len(system_prompt.split()) / 0.75))
                total_tokens_out += max(1, len(answer_text.split()))

            # Step 4: Check for RESOLVE requests
            resolve_matches = _RESOLVE_RE.findall(answer_text)

            if resolve_matches and resolve_depth < max_resolve_depth:
                # Perform pointer-resolution for requested Eblets
                newly_resolved: list[tuple[Eblet, dict]] = []
                resolved_ids_so_far = {eb.eblet_id for eb, _ in resolved_eblets}

                for eblet_id in resolve_matches:
                    eblet_id_upper = eblet_id.upper()
                    if eblet_id_upper in self._eblet_map and eblet_id_upper not in resolved_ids_so_far:
                        eblet = self._eblet_map[eblet_id_upper]
                        content = self.resolve_eblet(eblet)
                        newly_resolved.append((eblet, content))
                        resolved_ids_so_far.add(eblet_id_upper)

                if newly_resolved:
                    resolved_eblets.extend(newly_resolved)
                    resolve_depth += 1

                    # Append resolved content to the conversation for re-issue
                    resolution_ctx = self._build_resolution_context(newly_resolved)
                    messages.append({"role": "assistant", "content": answer_text})
                    messages.append({
                        "role": "user",
                        "content": (
                            "The following is the full Synapse content for the Eblets you requested. "
                            "Please now re-answer the original query with this expanded context:\n\n"
                            + resolution_ctx
                        ),
                    })
                    continue  # re-issue LLM call

            # No more RESOLVE requests or depth limit reached
            final_answer = answer_text
            break

        # Detect SCOPE-BOUNDARY in final answer
        honest_unknown = "SCOPE-BOUNDARY:" in final_answer

        # Cost estimate
        cost_usd = (
            total_tokens_in * haiku_input_per_m +
            total_tokens_out * haiku_output_per_m
        ) / 1_000_000

        # Provenance
        prov_summary, prov_full = self._build_provenance(
            thought_bundle, resolved_eblets, verbose_provenance
        )

        result = SeerResult(
            query=user_query,
            answer=final_answer,
            top_eblets=thought_bundle,
            resolved_eblets=resolved_eblets,
            provenance_summary=prov_summary,
            provenance_full=prov_full,
            honest_unknown=honest_unknown,
            model_used=self.model,
            tokens_in=total_tokens_in,
            tokens_out=total_tokens_out,
            cost_usd_est=round(cost_usd, 6),
            elapsed_s=round(_time.time() - wall_start, 2),
            created_at=created_at,
        )

        self._query_log.append(result.to_dict())
        return result

    # ------------------------------------------------------------------
    # Query log
    # ------------------------------------------------------------------

    def save_query_log(self, path: Optional[Path] = None) -> Path:
        """Save the session query log to a JSONL file."""
        if path is None:
            path = _HERE / f"query_log_K489_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}.jsonl"
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as fh:
            for entry in self._query_log:
                fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
        return path

    # ------------------------------------------------------------------
    # Repr
    # ------------------------------------------------------------------

    def __repr__(self) -> str:
        return (
            f"Seer(id={self.seer_id!r}, domain={self.domain_name!r}, "
            f"eblets={self.eblet_count}, top_k={self.top_k}, model={self.model!r})"
        )
