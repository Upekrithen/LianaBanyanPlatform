"""
Sculptor -- K483/B123 prototype implementation.

Crown Jewel candidate #2297: Sculptors -- IP-as-Filter (Keystone #28).
"They do what IP does — pass it on, as a filter."

Three-mode structure (per Founder B123 clarification):
  1. Anticipate   — always-on, demand-profile-fed pre-ranking
  2. Curate       — Three-Fates-mirror (Clotho / Lachesis / Atropos)
  3. Sculpt       — active craft: audience-differentiated artifact composition

Provenance chain appended at every Sculptor operation.
Filter-decision log: append-only JSONL audit surface.
Scope classes: public | guild | private

Architecture reference: INNOVATION_THRESH_2297_B123_SCULPTORS_IP_AS_FILTER.md
First empirical reduction-to-practice. K483 · B123.
"""

from __future__ import annotations

import json
import math
import re
import uuid
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Constants / tunables
# ---------------------------------------------------------------------------

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

# Scope inference keyword sets
_PRIVATE_KEYWORDS = {
    "secret", "password", "key", "token", "rotation", "credential",
    "attorney", "counsel", "pii", "confidential", "private", "lockbox",
    "doublesecret", "founder", "ein", "ssn", "dob", "legal",
    "attorney-client", "privileged", "certificate", "signing",
}

_GUILD_KEYWORDS = {
    "api", "schema", "database", "migration", "mcp", "librarian",
    "architecture", "miner", "scribe", "cathedral", "typescript",
    "python", "javascript", "node", "npm", "supabase", "firebase",
    "deployment", "build", "dist", "indexing", "synapse", "toolsmith",
    "bedrock", "hash", "ledger", "provenance", "jsonl", "struct",
    "dataclass", "class", "function", "method", "endpoint", "hook",
    "commit", "branch", "git", "workflow", "rebuild", "stitchpunk",
}

# Minimum score thresholds by scope
DEFAULT_MIN_SCORE_BY_SCOPE = {
    "public": 0.05,
    "guild":  0.10,
    "private": 0.15,
}

# Distinctiveness weight: how much uniqueness-vs-corpus boosts a tablet
DISTINCTIVENESS_WEIGHT = 0.3

# Demand-match weight: how much cathedral topic-alignment boosts a tablet
DEMAND_WEIGHT = 0.5

# Depth-level weight: shallower depth = more primary topic = more relevant
DEPTH_WEIGHT = 0.2


# ---------------------------------------------------------------------------
# Scope inference
# ---------------------------------------------------------------------------

def infer_scope(tablet: dict) -> str:
    """
    Infer scope class for a tablet that lacks explicit scope metadata.
    Returns 'public' | 'guild' | 'private'.

    Strategy: keyword-overlap with known sensitive/technical keyword sets.
    Heuristic: overlap with private-set wins over guild, guild wins over public.
    """
    keywords = set(kw.lower() for kw in tablet.get("keywords", []))
    content_tokens = set(re.findall(r"[a-zA-Z][a-zA-Z0-9_\-]*",
                                    tablet.get("extracted_content", "").lower()))
    all_tokens = keywords | content_tokens

    private_overlap = len(all_tokens & _PRIVATE_KEYWORDS)
    guild_overlap = len(all_tokens & _GUILD_KEYWORDS)

    if private_overlap >= 2:
        return "private"
    if guild_overlap >= 3:
        return "guild"
    return "public"


# ---------------------------------------------------------------------------
# Keyword extraction (reused from miner.py style)
# ---------------------------------------------------------------------------

def _tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9_\-]*", text.lower())
    return [t for t in tokens if t not in STOP_WORDS and len(t) > 2]


def extract_keywords(text: str, n: int = 20) -> list[str]:
    tokens = _tokenize(text)
    if not tokens:
        return []
    freq = Counter(tokens)
    scored = {tok: count * math.log(1 + len(tok)) for tok, count in freq.items()}
    return [tok for tok, _ in sorted(scored.items(), key=lambda x: -x[1])[:n]]


# ---------------------------------------------------------------------------
# Cathedral profile schema
# ---------------------------------------------------------------------------

@dataclass
class CathedralProfile:
    """Per-cathedral configuration for a Sculptor instance."""

    cathedral_name: str
    audience_scope: str                    # highest scope this cathedral can receive
    scope_classes_allowed: list[str]       # subset of [public, guild, private]
    preferred_sculpt_form: str             # summary | full_tablet | per_topic_rollup
    min_score: float                       # Lachesis minimum score to dispatch

    @classmethod
    def from_dict(cls, d: dict) -> "CathedralProfile":
        return cls(
            cathedral_name=d["cathedral_name"],
            audience_scope=d["audience_scope"],
            scope_classes_allowed=d["scope_classes_allowed"],
            preferred_sculpt_form=d["preferred_sculpt_form"],
            min_score=d.get("min_score", 0.1),
        )


# ---------------------------------------------------------------------------
# Demand profile (mock for K483; production = Fates-via-Hounds telemetry)
# ---------------------------------------------------------------------------

@dataclass
class DemandProfile:
    """
    Per-cathedral anticipated demand profile.
    Production: populated from Three Fates / Hounds telemetry.
    K483 prototype: mocked from cathedral_demand_profile.json.

    Interface spec recorded here so K486+ can replace mock with live.
    """

    cathedral_name: str
    frequent_topics: list[str]           # topic labels in demand order (most → least)
    topic_weights: dict[str, float]      # topic_label -> demand weight (0.0–1.0)
    preferred_depth_levels: list[int]    # preferred depth levels (1=primary, 6=ancillary)

    @classmethod
    def from_dict(cls, d: dict) -> "DemandProfile":
        return cls(
            cathedral_name=d["cathedral_name"],
            frequent_topics=d.get("frequent_topics", []),
            topic_weights=d.get("topic_weights", {}),
            preferred_depth_levels=d.get("preferred_depth_levels", [1, 2, 3]),
        )

    def demand_score(self, keywords: list[str], depth_level: int) -> float:
        """
        Return [0, 1] demand score for a tablet based on this profile.
        Higher = cathedral wants this content more.
        """
        kw_set = set(keywords)
        topic_score = 0.0
        for topic, weight in self.topic_weights.items():
            topic_tokens = set(_tokenize(topic))
            overlap = len(kw_set & topic_tokens) / max(1, len(topic_tokens))
            topic_score += overlap * weight
        topic_score = min(1.0, topic_score)

        depth_score = 1.0 if depth_level in self.preferred_depth_levels else 0.3
        return round(topic_score * 0.7 + depth_score * 0.3, 4)


# ---------------------------------------------------------------------------
# Filter decision log
# ---------------------------------------------------------------------------

_filter_log_path: Optional[Path] = None


def _set_filter_log_path(path: Path) -> None:
    global _filter_log_path
    _filter_log_path = path
    _filter_log_path.parent.mkdir(parents=True, exist_ok=True)


def _append_filter_decision(entry: dict) -> None:
    if _filter_log_path is None:
        return
    record = {**entry, "timestamp": datetime.now(timezone.utc).isoformat()}
    with _filter_log_path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")


# ---------------------------------------------------------------------------
# Sculptor
# ---------------------------------------------------------------------------

@dataclass
class Sculptor:
    """
    A cathedral-specific IP filter (#2297).

    Keystone #28: "They do what IP does — pass it on, as a filter."

    Every tablet that passes this Sculptor's filter acquires a new
    provenance-chain entry: the filter passage is recorded.
    """

    sculptor_id: str
    cathedral_profile: CathedralProfile
    demand_profile: DemandProfile

    # Corpus-level keyword pool — built during anticipate() to compute distinctiveness
    _corpus_pool: Counter = field(default_factory=Counter)
    _anticipation_ranks: dict[str, float] = field(default_factory=dict)  # tablet_id -> rank score

    def __post_init__(self) -> None:
        pass

    # ------------------------------------------------------------------
    # MODE 1: Anticipate (always-on background loop; mocked in K483)
    # ------------------------------------------------------------------

    def anticipate(self, tablets: list[dict]) -> list[dict]:
        """
        Pre-rank tablets by anticipated cathedral demand BEFORE any curate request.

        Production: demand_profile would come from Fates-via-Hounds telemetry.
        K483 prototype: demand_profile is pre-populated from mock JSON file.

        Side-effect: populates self._anticipation_ranks and self._corpus_pool.
        Returns tablets sorted by anticipation score (highest first).

        Mock telemetry format recorded here for K486+ replacement:
        {
          "cathedral_name": str,
          "frequent_topics": [str, ...],
          "topic_weights": {topic: float, ...},
          "preferred_depth_levels": [int, ...]
        }
        """
        # Build corpus-level keyword pool for distinctiveness computation
        for t in tablets:
            self._corpus_pool.update(t.get("keywords", []))

        # Score and rank
        ranked: list[tuple[float, dict]] = []
        for tablet in tablets:
            score = self._anticipation_score(tablet)
            self._anticipation_ranks[tablet["tablet_id"]] = score
            ranked.append((score, tablet))

        ranked.sort(key=lambda x: -x[0])
        return [t for _, t in ranked]

    def _anticipation_score(self, tablet: dict) -> float:
        """
        Composite anticipation score = demand_match + distinctiveness + depth_fit.
        All components are [0, 1]; final is weighted combination.
        """
        keywords = tablet.get("keywords", [])
        depth = tablet.get("depth_level", 6)

        demand_match = self.demand_profile.demand_score(keywords, depth)

        # Distinctiveness: how rare are this tablet's keywords vs the whole corpus?
        kw_set = set(keywords)
        if kw_set and self._corpus_pool:
            corpus_total = max(1, sum(self._corpus_pool.values()))
            avg_freq = sum(self._corpus_pool.get(kw, 0) for kw in kw_set) / max(1, len(kw_set))
            distinctiveness = 1.0 - min(1.0, avg_freq / (corpus_total / max(1, len(self._corpus_pool))))
        else:
            distinctiveness = 0.5

        # Depth fit: preferred depths score higher
        depth_fit = 1.0 if depth in self.demand_profile.preferred_depth_levels else 0.4

        score = (
            DEMAND_WEIGHT * demand_match
            + DISTINCTIVENESS_WEIGHT * distinctiveness
            + DEPTH_WEIGHT * depth_fit
        )
        return round(min(1.0, score), 4)

    # ------------------------------------------------------------------
    # MODE 2: Curate (Three-Fates-mirror)
    # ------------------------------------------------------------------

    def curate(self, tablets: list[dict]) -> tuple[list[dict], list[dict]]:
        """
        Filter tablets for this cathedral using the Three-Fates-symmetric mirror.

        Clotho  → extract theme / distinctiveness from each tablet
        Lachesis → score against cathedral-profile + anticipation-priority
        Atropos  → dispatch (include) or cut (exclude)

        Returns (included, excluded) tablet lists.
        Each included tablet has its provenance_chain extended with the sculptor_id.
        """
        included: list[dict] = []
        excluded: list[dict] = []

        for tablet in tablets:
            # --- Clotho: extract theme and distinctiveness ---
            themes = self._clotho_extract(tablet)

            # --- Lachesis: score ---
            score, reason = self._lachesis_score(tablet, themes)

            # --- Atropos: dispatch or cut ---
            decision = self._atropos_dispatch(tablet, score)

            _append_filter_decision({
                "sculptor_id": self.sculptor_id,
                "tablet_id": tablet["tablet_id"],
                "cathedral_name": self.cathedral_profile.cathedral_name,
                "decision": "include" if decision else "exclude",
                "scope_class": themes.get("scope_class", "public"),
                "lachesis_score": score,
                "reason": reason,
                "depth_level": tablet.get("depth_level"),
                "anticipation_rank": self._anticipation_ranks.get(tablet["tablet_id"], 0.0),
            })

            if decision:
                # Append sculptor provenance entry — the filter-passage is the IP act
                enriched = dict(tablet)
                enriched["provenance_chain"] = list(tablet.get("provenance_chain", [])) + [self.sculptor_id]
                enriched["scope_class"] = themes.get("scope_class", "public")
                enriched["clotho_themes"] = themes
                enriched["lachesis_score"] = score
                included.append(enriched)
            else:
                excluded.append(tablet)

        return included, excluded

    def _clotho_extract(self, tablet: dict) -> dict:
        """
        Clotho analog: extract theme and distinctiveness metadata from a tablet.

        Returns a dict with:
          - primary_theme: dominant keyword
          - secondary_themes: next 4 keywords
          - scope_class: public | guild | private
          - distinctiveness: [0, 1] rarity vs corpus
          - keyword_count: number of keywords
        """
        keywords = tablet.get("keywords", [])
        primary_theme = keywords[0] if keywords else "unknown"
        secondary_themes = keywords[1:5] if len(keywords) > 1 else []

        scope_class = tablet.get("scope_class") or infer_scope(tablet)

        kw_set = set(keywords)
        if kw_set and self._corpus_pool:
            avg_freq = sum(self._corpus_pool.get(kw, 0) for kw in kw_set) / max(1, len(kw_set))
            corpus_avg = sum(self._corpus_pool.values()) / max(1, len(self._corpus_pool))
            distinctiveness = round(1.0 - min(1.0, avg_freq / max(1, corpus_avg)), 4)
        else:
            distinctiveness = 0.5

        return {
            "primary_theme": primary_theme,
            "secondary_themes": secondary_themes,
            "scope_class": scope_class,
            "distinctiveness": distinctiveness,
            "keyword_count": len(keywords),
        }

    def _lachesis_score(self, tablet: dict, themes: dict) -> tuple[float, str]:
        """
        Lachesis analog: score tablet for this cathedral.

        Dimensions:
          1. Scope eligibility (hard gate) — not in allowed scope → immediate 0
          2. Audience-fit score — demand match + depth fit
          3. Anticipation-priority weighting — pre-computed anticipation rank
          4. Distinctiveness bonus

        Returns (score [0,1], reason_string).
        """
        scope_class = themes.get("scope_class", "public")

        # Hard scope gate
        if scope_class not in self.cathedral_profile.scope_classes_allowed:
            return 0.0, f"scope_excluded:{scope_class}_not_in_{self.cathedral_profile.scope_classes_allowed}"

        keywords = tablet.get("keywords", [])
        depth = tablet.get("depth_level", 6)

        demand = self.demand_profile.demand_score(keywords, depth)
        anticipation = self._anticipation_ranks.get(tablet["tablet_id"], 0.0)
        distinctiveness = themes.get("distinctiveness", 0.5)

        score = round(
            0.4 * demand
            + 0.3 * anticipation
            + 0.2 * distinctiveness
            + 0.1 * (1.0 - (depth - 1) / 5),  # shallower depth bonus
            4
        )

        reason = (
            f"demand={demand:.3f};"
            f"anticipation={anticipation:.3f};"
            f"distinctiveness={distinctiveness:.3f};"
            f"depth={depth}"
        )
        return score, reason

    def _atropos_dispatch(self, tablet: dict, score: float) -> bool:
        """
        Atropos analog: include or cut.

        Returns True (include) if score >= cathedral's min_score threshold.
        """
        return score >= self.cathedral_profile.min_score

    # ------------------------------------------------------------------
    # MODE 3: Sculpt (active craft)
    # ------------------------------------------------------------------

    def sculpt(self, included_tablets: list[dict]) -> dict:
        """
        Compose selected tablets into cathedral-specific delivery form.

        Forms:
          summary          → brief abstract per tablet, thematically grouped
          full_tablet      → complete tablet content, sorted by Lachesis score
          per_topic_rollup → tablets grouped by primary_theme, with rollup summaries

        Each sculpt operation appends a 'sculpt:' provenance entry to each tablet.
        Provenance chain is preserved end-to-end queryable.
        """
        sculpt_form = self.cathedral_profile.preferred_sculpt_form
        cathedral_name = self.cathedral_profile.cathedral_name
        ts = datetime.now(timezone.utc).isoformat()

        # Stamp sculpt provenance on all tablets
        sculpted_tablets = []
        for t in included_tablets:
            st = dict(t)
            st["provenance_chain"] = list(t.get("provenance_chain", [])) + [
                f"sculpt:{self.sculptor_id}"
            ]
            sculpted_tablets.append(st)

        if sculpt_form == "summary":
            artifact = self._sculpt_summary(sculpted_tablets)
        elif sculpt_form == "full_tablet":
            artifact = self._sculpt_full_tablet(sculpted_tablets)
        else:  # per_topic_rollup
            artifact = self._sculpt_per_topic_rollup(sculpted_tablets)

        return {
            "sculptor_id": self.sculptor_id,
            "cathedral_name": cathedral_name,
            "sculpt_form": sculpt_form,
            "tablet_count": len(sculpted_tablets),
            "generated_at": ts,
            "artifact": artifact,
        }

    def _sculpt_summary(self, tablets: list[dict]) -> dict:
        """Summary form: brief abstract per tablet, sorted by score."""
        sorted_tablets = sorted(tablets, key=lambda t: -t.get("lachesis_score", 0.0))
        summaries = []
        for t in sorted_tablets:
            content = t.get("extracted_content", "")
            brief = content[:200].strip().replace("\n", " ")
            summaries.append({
                "tablet_id": t["tablet_id"],
                "miner_serial": t.get("miner_serial"),
                "primary_theme": t.get("clotho_themes", {}).get("primary_theme", ""),
                "scope_class": t.get("scope_class", "public"),
                "lachesis_score": t.get("lachesis_score"),
                "brief": brief,
                "provenance_chain": t.get("provenance_chain"),
            })
        return {"form": "summary", "entries": summaries}

    def _sculpt_full_tablet(self, tablets: list[dict]) -> dict:
        """Full-tablet form: complete tablet content sorted by Lachesis score."""
        sorted_tablets = sorted(tablets, key=lambda t: -t.get("lachesis_score", 0.0))
        return {
            "form": "full_tablet",
            "tablets": sorted_tablets,
        }

    def _sculpt_per_topic_rollup(self, tablets: list[dict]) -> dict:
        """Per-topic rollup: group tablets by primary_theme with rollup summary."""
        by_topic: dict[str, list[dict]] = defaultdict(list)
        for t in tablets:
            theme = t.get("clotho_themes", {}).get("primary_theme", "unknown")
            by_topic[theme].append(t)

        rollups = {}
        for topic, topic_tablets in sorted(by_topic.items()):
            avg_score = sum(t.get("lachesis_score", 0.0) for t in topic_tablets) / max(1, len(topic_tablets))
            all_kws = []
            for t in topic_tablets:
                all_kws.extend(t.get("keywords", []))
            top_kws = [kw for kw, _ in Counter(all_kws).most_common(10)]

            combined = " ".join(
                t.get("extracted_content", "")[:100]
                for t in topic_tablets[:3]
            ).replace("\n", " ")[:400]

            rollups[topic] = {
                "topic": topic,
                "tablet_count": len(topic_tablets),
                "avg_lachesis_score": round(avg_score, 4),
                "top_keywords": top_kws,
                "rollup_text": combined,
                "tablet_ids": [t["tablet_id"] for t in topic_tablets],
                "scope_classes": list({t.get("scope_class", "public") for t in topic_tablets}),
            }

        return {"form": "per_topic_rollup", "topics": rollups}

    # ------------------------------------------------------------------
    # Full pipeline
    # ------------------------------------------------------------------

    def run(self, bedrock_paths: list[Path], output_dir: Path) -> dict:
        """
        Full pipeline: anticipate → curate → sculpt → write output artifact.
        Returns summary dict for the session report.
        """
        # Load all tablets
        tablets: list[dict] = []
        for bp in bedrock_paths:
            if not bp.exists():
                continue
            with bp.open("r", encoding="utf-8") as fh:
                for line in fh:
                    line = line.strip()
                    if line:
                        try:
                            tablets.append(json.loads(line))
                        except json.JSONDecodeError:
                            pass

        total_input = len(tablets)

        # Mode 1: Anticipate
        ranked_tablets = self.anticipate(tablets)

        # Mode 2: Curate
        included, excluded = self.curate(ranked_tablets)

        # Mode 3: Sculpt
        artifact = self.sculpt(included)

        # Write output artifact
        output_dir.mkdir(parents=True, exist_ok=True)
        artifact_path = output_dir / f"{self.sculptor_id}_{self.cathedral_profile.cathedral_name}.json"
        with artifact_path.open("w", encoding="utf-8") as fh:
            json.dump(artifact, fh, indent=2, default=str)

        return {
            "sculptor_id": self.sculptor_id,
            "cathedral_name": self.cathedral_profile.cathedral_name,
            "audience_scope": self.cathedral_profile.audience_scope,
            "scope_classes_allowed": self.cathedral_profile.scope_classes_allowed,
            "preferred_sculpt_form": self.cathedral_profile.preferred_sculpt_form,
            "total_input_tablets": total_input,
            "included_count": len(included),
            "excluded_count": len(excluded),
            "inclusion_rate": round(len(included) / max(1, total_input), 4),
            "artifact_path": str(artifact_path),
        }


# ---------------------------------------------------------------------------
# Factory helpers
# ---------------------------------------------------------------------------

def load_sculptor(
    sculptor_id: str,
    profile_dict: dict,
    demand_dict: dict,
) -> Sculptor:
    """Instantiate a Sculptor from raw config dicts."""
    cathedral_profile = CathedralProfile.from_dict(profile_dict)
    demand_profile = DemandProfile.from_dict(demand_dict)
    return Sculptor(
        sculptor_id=sculptor_id,
        cathedral_profile=cathedral_profile,
        demand_profile=demand_profile,
    )
