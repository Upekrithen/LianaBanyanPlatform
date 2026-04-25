"""
Bloodhound -- K486/B123 Corpus Scout

Crown Jewel companion to Miners (#2296). The Bloodhound performs a light-touch
pre-pass over a corpus directory BEFORE the Root Miner anchors to its primary topic,
solving the K482 fragility: Root anchored to "shipped" because that was file-1's
dominant keyword, not because "shipped" was the corpus's highest-density topic.

The Bloodhound scout:
  1. Reads every .md file in the corpus directory
  2. Extracts keywords (same TF-IDF logic as miner.py)
  3. Accumulates a global keyword density map
  4. Clusters files by their dominant keyword (naive proximity clustering)
  5. Ranks clusters by total intra-cluster keyword density
  6. Returns an ordered list of WellCandidates (dense → sparse)

The Miner bootstrap uses candidate[0].well_name to pre-anchor the Root Miner's
primary_topic BEFORE seeing any files -- replacing the "first-file wins" fragility.

Design constraints:
  - No LLM calls. No mining. Stdlib only.
  - Light-touch: ~2MB corpus should complete in <5 seconds.
  - Deterministic output for same corpus (stable sort).

K486 · B123
"""

from __future__ import annotations

import json
import math
import re
import time
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

# ─── Stop words (identical to miner.py for consistency) ──────────────────────

STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "it", "its", "be", "was",
    "are", "were", "been", "has", "have", "had", "do", "does", "did",
    "will", "would", "could", "should", "may", "might", "this", "that",
    "these", "those", "i", "we", "you", "he", "she", "they", "not",
    "no", "so", "if", "then", "than", "when", "what", "which", "who",
    "how", "also", "about", "into", "out", "up", "can", "one", "two",
    "all", "more", "any", "each", "their", "there", "here", "his", "her",
    "our", "your", "my", "me", "us", "them", "s", "t", "re", "ve", "ll",
    "d", "m", "just", "only", "very", "well", "like", "get", "see",
    "new", "via", "per", "non",
}

TOP_KEYWORD_N = 20


# ─── Tokenizer (same as miner.py) ────────────────────────────────────────────

def _tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9_\-]*", text.lower())
    return [t for t in tokens if t not in STOP_WORDS and len(t) > 2]


def _extract_keywords(text: str, n: int = TOP_KEYWORD_N) -> list[str]:
    """Return top-N keywords by TF-weighted score (same formula as miner.py)."""
    tokens = _tokenize(text)
    if not tokens:
        return []
    freq = Counter(tokens)
    scored = {tok: count * math.log(1 + len(tok)) for tok, count in freq.items()}
    return [tok for tok, _ in sorted(scored.items(), key=lambda x: -x[1])[:n]]


# ─── Output types ────────────────────────────────────────────────────────────

@dataclass
class WellCandidate:
    """A topical cluster discovered by the Bloodhound scout-pass."""

    well_name: str             # The dominant keyword naming this Well
    density_score: float       # Normalized density score (0.0-1.0)
    file_count: int            # Number of corpus files assigned to this cluster
    sample_keywords: list[str] # Top co-occurring keywords in this cluster
    representative_files: list[str]  # Up to 5 most-representative filenames


@dataclass
class ScoutReport:
    """Full report from Bloodhound.scout()."""

    corpus_dir: str
    files_scanned: int
    elapsed_sec: float
    candidates: list[WellCandidate]   # ordered dense → sparse

    def top_well(self) -> Optional[str]:
        """Highest-density Well name; None if corpus is empty."""
        return self.candidates[0].well_name if self.candidates else None

    def to_dict(self) -> dict:
        return {
            "corpus_dir": self.corpus_dir,
            "files_scanned": self.files_scanned,
            "elapsed_sec": round(self.elapsed_sec, 3),
            "top_well": self.top_well(),
            "candidates": [
                {
                    "well_name": c.well_name,
                    "density_score": round(c.density_score, 4),
                    "file_count": c.file_count,
                    "sample_keywords": c.sample_keywords,
                    "representative_files": c.representative_files,
                }
                for c in self.candidates
            ],
        }


# ─── Bloodhound ───────────────────────────────────────────────────────────────

class Bloodhound:
    """
    Corpus scout. Call scout() once before the Root Miner bootstraps.

    Usage:
        hound = Bloodhound()
        report = hound.scout(corpus_dir)
        root_topic = report.top_well()   # pass to Miner pre-anchor
    """

    def __init__(
        self,
        extensions: tuple[str, ...] = (".md", ".txt", ".jsonl"),
        top_n_keywords: int = TOP_KEYWORD_N,
        min_cluster_files: int = 2,
    ) -> None:
        self._extensions = extensions
        self._top_n = top_n_keywords
        self._min_cluster_files = min_cluster_files

    def scout(self, corpus_dir: Path | str) -> ScoutReport:
        """
        Perform a light-touch keyword-density scout across all files in corpus_dir.

        Returns a ScoutReport with WellCandidates ordered dense → sparse.
        """
        corpus_dir = Path(corpus_dir)
        t0 = time.monotonic()

        # Collect files
        files = self._collect_files(corpus_dir)
        if not files:
            return ScoutReport(
                corpus_dir=str(corpus_dir),
                files_scanned=0,
                elapsed_sec=0.0,
                candidates=[],
            )

        # Pass 1: extract per-file keyword lists
        file_keywords: dict[str, list[str]] = {}
        global_counter: Counter = Counter()

        for fpath in files:
            try:
                text = fpath.read_text(encoding="utf-8", errors="replace")
            except Exception:
                continue
            kws = _extract_keywords(text, self._top_n)
            if kws:
                file_keywords[fpath.name] = kws
                global_counter.update(kws)

        if not file_keywords:
            return ScoutReport(
                corpus_dir=str(corpus_dir),
                files_scanned=len(files),
                elapsed_sec=time.monotonic() - t0,
                candidates=[],
            )

        # Pass 2: cluster files by dominant keyword
        # Cluster key = the file's top keyword (most prominent topic signal)
        cluster_files: dict[str, list[str]] = defaultdict(list)
        cluster_kw_pool: dict[str, Counter] = defaultdict(Counter)

        for fname, kws in file_keywords.items():
            dominant = kws[0]
            cluster_files[dominant].append(fname)
            cluster_kw_pool[dominant].update(kws)

        # Pass 3: score clusters
        # Density score = sum of within-cluster keyword frequencies,
        # normalized by max cluster score.
        cluster_scores: list[tuple[str, float]] = []
        for cluster_kw, pool in cluster_kw_pool.items():
            n_files = len(cluster_files[cluster_kw])
            if n_files < self._min_cluster_files:
                continue
            # Score: total keyword weight within cluster × file-count bonus
            raw_score = sum(
                count * math.log(1 + len(kw))
                for kw, count in pool.items()
            ) * math.log(1 + n_files)
            cluster_scores.append((cluster_kw, raw_score))

        # Include single-file clusters if we have very few multi-file clusters
        if len(cluster_scores) < 3:
            for cluster_kw, pool in cluster_kw_pool.items():
                if cluster_kw not in {k for k, _ in cluster_scores}:
                    n_files = len(cluster_files[cluster_kw])
                    raw_score = sum(
                        count * math.log(1 + len(kw)) for kw, count in pool.items()
                    ) * math.log(1 + n_files)
                    cluster_scores.append((cluster_kw, raw_score))

        if not cluster_scores:
            # Fallback: use global top keyword as the only Well
            top_kw = global_counter.most_common(1)[0][0]
            cluster_scores = [(top_kw, 1.0)]

        # Normalize scores
        max_score = max(s for _, s in cluster_scores)
        cluster_scores.sort(key=lambda x: -x[1])  # dense → sparse

        candidates: list[WellCandidate] = []
        for well_name, score in cluster_scores[:20]:  # cap at 20 candidates
            pool = cluster_kw_pool[well_name]
            sample_kws = [kw for kw, _ in pool.most_common(8) if kw != well_name][:6]
            # representative files: sorted by frequency of dominant keyword in file
            rep_files = sorted(
                cluster_files[well_name],
                key=lambda fn: file_keywords.get(fn, []).count(well_name),
                reverse=True,
            )[:5]

            candidates.append(WellCandidate(
                well_name=well_name,
                density_score=score / max_score,
                file_count=len(cluster_files[well_name]),
                sample_keywords=sample_kws,
                representative_files=rep_files,
            ))

        elapsed = time.monotonic() - t0
        return ScoutReport(
            corpus_dir=str(corpus_dir),
            files_scanned=len(files),
            elapsed_sec=elapsed,
            candidates=candidates,
        )

    def _collect_files(self, corpus_dir: Path) -> list[Path]:
        """Return sorted list of text files in the corpus directory."""
        files: list[Path] = []
        for ext in self._extensions:
            files.extend(corpus_dir.glob(f"*{ext}"))
        return sorted(set(files))


# ─── CLI entry point ──────────────────────────────────────────────────────────

def main() -> None:
    import argparse
    import sys

    parser = argparse.ArgumentParser(
        prog="bloodhound",
        description="Bloodhound corpus scout — ranks Wells by keyword density before Miner bootstraps.",
    )
    parser.add_argument(
        "--corpus-dir", type=Path, required=True,
        help="Directory to scout",
    )
    parser.add_argument(
        "--top", type=int, default=10,
        help="Number of Well candidates to display (default 10)",
    )
    parser.add_argument(
        "--output-json", type=Path, default=None,
        help="If set, write full report to this JSON file",
    )
    args = parser.parse_args()

    if not args.corpus_dir.is_dir():
        print(f"[Bloodhound] ERROR: {args.corpus_dir} is not a directory", file=sys.stderr)
        sys.exit(1)

    hound = Bloodhound()
    print(f"[Bloodhound] Scouting: {args.corpus_dir}")
    report = hound.scout(args.corpus_dir)

    print(f"[Bloodhound] Files scanned: {report.files_scanned}")
    print(f"[Bloodhound] Elapsed: {report.elapsed_sec:.2f}s")
    print(f"[Bloodhound] Top Well (Root anchor): {report.top_well()!r}")
    print()
    print(f"{'Rank':<5} {'Well':<28} {'Score':>8} {'Files':>7}  Sample keywords")
    print("-" * 78)
    for i, c in enumerate(report.candidates[:args.top], 1):
        sample = ", ".join(c.sample_keywords[:4])
        print(
            f"{i:<5} {c.well_name:<28} {c.density_score:>8.4f} {c.file_count:>7}  {sample}"
        )
    print()

    if args.output_json:
        with open(args.output_json, "w", encoding="utf-8") as f:
            json.dump(report.to_dict(), f, indent=2)
        print(f"[Bloodhound] Report -> {args.output_json}")


if __name__ == "__main__":
    main()
