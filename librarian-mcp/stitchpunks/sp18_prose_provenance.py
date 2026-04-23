"""
SP-18 — Prose Provenance System
Stitchpunk Corps, Liana Banyan Platform

Deterministic drift-detection between two versions of a letter (or any prose doc).
Surfaces: missing Keystones, mutated canonical numbers, changed section structure.

Usage (CLI):
    python sp18_prose_provenance.py \\
        --canonical path/to/LOCKED01.md \\
        --candidate path/to/LOCKED03.md \\
        [--keystones path/to/keystones.json] \\
        [--canonical-numbers path/to/numbers.json] \\
        [--out path/to/report.md]

Designed for the long haul:
  * Keystones are loaded from JSON config (default: project_rhetorical_keystones.md parser).
  * Canonical numbers list is extensible (same JSON).
  * Report is Markdown — reads in any editor, diffs cleanly in git.
  * Optional Opus grader hook (stub — wire up when budget permits; currently deterministic-only).

Surfaced B110 by SP-16 Creative Recombiner as one of three arms of a unified
"Prose Provenance System" (alongside the Scrambler #2263 and the Keystones registry).

Author: Bishop (Claude Opus 4.7), session B110, 2026-04-20.
"""

from __future__ import annotations
import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

try:
    import anthropic  # type: ignore
    _HAS_ANTHROPIC = True
except ImportError:
    _HAS_ANTHROPIC = False

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Per-model pricing for run-cost reporting ($/M tokens) — matches sp16_recombiner.py
MODEL_PRICING = {
    "claude-haiku-4-5-20251001": (0.80, 4.00),
    "claude-sonnet-4-6":         (3.00, 15.00),
    "claude-opus-4-7":           (15.00, 75.00),
}
OPUS_MODEL = "claude-opus-4-7"
OPUS_MAX_TOKENS = 2000

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent


def _load_api_key() -> Optional[str]:
    """Match sp16_recombiner.py auth pattern: env var first, then LockBox SDS.env fallback."""
    key = os.environ.get("ANTHROPIC_API_KEY")
    if key:
        return key
    sds_path = PROJECT_ROOT / "Asteroid-ProofVault" / "LockBox" / "SDS.env"
    if sds_path.exists():
        for line in sds_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("ANTHROPIC_API_KEY="):
                return line.split("=", 1)[1].strip()
    return None


# ------- doc-type awareness ---------------------------------------------------

# Per doc-type: check toggles + score weights. Scaffolds and proposals shouldn't
# be scored the same way as dispatch-ready letters.
DOC_TYPE_PROFILES: dict[str, dict] = {
    "letter": {
        "run_keystones": True,
        "run_numbers": True,
        "run_structure": True,
        "keystone_weight": 5,
        "numbers_weight": 3,
        "structure_weight": 1,
        "paragraph_tolerance": 5,
        "description": "Dispatch-ready letter. Full drift checks at normal weights.",
    },
    "scaffold": {
        "run_keystones": True,
        "run_numbers": True,
        "run_structure": False,
        "keystone_weight": 2,  # scaffolds expect Founder to add Keystones in prose pass
        "numbers_weight": 2,
        "structure_weight": 0,
        "paragraph_tolerance": 999,  # any paragraph count; scaffolds restructure freely
        "description": "Structural template awaiting Founder prose pass. De-weighted.",
    },
    "proposal": {
        "run_keystones": False,  # proposals are meta-docs, don't contain full letter body
        "run_numbers": True,
        "run_structure": False,
        "keystone_weight": 0,
        "numbers_weight": 2,
        "structure_weight": 0,
        "paragraph_tolerance": 999,
        "description": "Meta-document proposing an edit. Only numbers are checked.",
    },
    "tribute": {
        "run_keystones": True,
        "run_numbers": True,
        "run_structure": True,
        "keystone_weight": 5,
        "numbers_weight": 3,
        "structure_weight": 1,
        "paragraph_tolerance": 5,
        "description": "Cephas-facing memorial / tribute. Full checks.",
    },
    "generic": {
        "run_keystones": True,
        "run_numbers": True,
        "run_structure": True,
        "keystone_weight": 5,
        "numbers_weight": 3,
        "structure_weight": 1,
        "paragraph_tolerance": 5,
        "description": "Unspecified document. Full checks at default weights.",
    },
}


def _infer_doc_type(candidate_path: Path) -> str:
    """Best-effort doc-type inference from filename if no --doc-type flag is given."""
    name = candidate_path.name.lower()
    if "scaffold" in name:
        return "scaffold"
    if "proposed" in name or "proposal" in name:
        return "proposal"
    if "tribute" in name or "/tributes/" in str(candidate_path).lower():
        return "tribute"
    if "letter" in name or "crown_letter" in name:
        return "letter"
    return "generic"


# ------- defaults -------------------------------------------------------------

DEFAULT_KEYSTONES: list[dict] = [
    {"id": 1, "phrase": "Every AI company is currently paying a tax they don't know they're paying", "scope": "cross-letter"},
    {"id": 2, "phrase": "Especially from friendly fire", "scope": "cross-letter"},
    {"id": 3, "phrase": "I pray for potatoes at the end of a hoe handle", "scope": "cross-letter"},
    {"id": 4, "phrase": "And I have two suits", "scope": "cross-letter"},
    {"id": 5, "phrase": "I know enough to know I don't know enough", "scope": "cross-letter"},
    {"id": 6, "phrase": "Nothing about us without us", "scope": "cross-letter"},
    {"id": 7, "phrase": "The eighty percent is the only number where cooperation costs less than defection", "scope": "cross-letter"},
    {"id": 8, "phrase": "What we need is people and leadership; the money will follow", "scope": "cross-letter"},
    {"id": 9, "phrase": "No Plan Survives First Contact", "scope": "cross-letter"},
    {"id": 10, "phrase": "The medallions are minted", "scope": "cross-letter"},
    {"id": 11, "phrase": "Help each other help ourselves", "scope": "cross-letter"},
    {"id": 12, "phrase": "I read a lot, and I am good at chess", "scope": "cross-letter"},
]

# Canonical numbers (extensible). Any candidate that contains a listed "stale" form
# raises a stale-reintroduction flag.
DEFAULT_CANONICAL_NUMBERS: list[dict] = [
    {"name": "innovation_count", "canonical": "2,265", "stale": ["2,263", "2,262", "2,260"]},
    {"name": "crown_jewel_count", "canonical": "222", "stale": ["221", "220"]},
    {"name": "patent_provisionals_filed", "canonical": "13", "stale": ["12", "11", "10"]},
    {"name": "initiative_count", "canonical": "16", "stale": ["14", "15", "17", "18"]},
    {"name": "ip_allocation", "canonical": "60/20/10/10", "stale": ["60/20/20"]},
    {"name": "scott_grantees", "canonical": "2,300", "stale": ["1,300"]},
    {"name": "membership_price", "canonical": "$5/yr", "stale": []},
    {"name": "creator_keep", "canonical": "83.3%", "stale": ["80%", "85%"]},
]


# ------- data models ----------------------------------------------------------

@dataclass
class DriftReport:
    canonical_path: str
    candidate_path: str
    keystones_missing: list[dict] = field(default_factory=list)
    keystones_preserved: list[dict] = field(default_factory=list)
    stale_numbers_reintroduced: list[dict] = field(default_factory=list)
    canonical_numbers_preserved: list[dict] = field(default_factory=list)
    section_header_delta: dict = field(default_factory=dict)
    paragraph_count_delta: int = 0
    drift_score: int = 0
    opus_grader_result: Optional[dict] = None  # populated when --opus-grader is passed

    def to_markdown(self) -> str:
        doc_type = getattr(self, "doc_type", "generic")
        profile_desc = DOC_TYPE_PROFILES.get(doc_type, DOC_TYPE_PROFILES["generic"])["description"]
        lines = [
            "# Prose Provenance Drift Report",
            "",
            f"**Canonical:** `{self.canonical_path}`",
            f"**Candidate:** `{self.candidate_path}`",
            f"**Doc type:** `{doc_type}` — {profile_desc}",
            f"**Drift score:** **{self.drift_score}** (0 = no drift; higher = more drift)",
            "",
            "---",
            "",
            "## Keystones",
            "",
        ]
        if self.keystones_missing:
            lines.append("### ⚠ Dropped from candidate")
            for ks in self.keystones_missing:
                lines.append(f"- **#{ks['id']}** *\"{ks['phrase']}\"* ({ks['scope']})")
            lines.append("")
        else:
            lines.append("_All ratified Keystones present in canonical are also present in candidate._")
            lines.append("")
        if self.keystones_preserved:
            lines.append(f"### ✓ Preserved ({len(self.keystones_preserved)})")
            for ks in self.keystones_preserved:
                lines.append(f"- #{ks['id']} *\"{ks['phrase'][:60]}{'…' if len(ks['phrase']) > 60 else ''}\"*")
            lines.append("")

        lines.extend(["## Canonical numbers", ""])
        if self.stale_numbers_reintroduced:
            lines.append("### ⚠ Stale numbers reintroduced in candidate")
            for n in self.stale_numbers_reintroduced:
                lines.append(f"- **{n['name']}** — found stale form `{n['found']}` (canonical: `{n['canonical']}`)")
            lines.append("")
        else:
            lines.append("_No stale canonical numbers detected in candidate._")
            lines.append("")

        lines.extend([
            "## Structure",
            "",
            f"- Section headers in canonical: {self.section_header_delta.get('canonical_count', 0)}",
            f"- Section headers in candidate: {self.section_header_delta.get('candidate_count', 0)}",
            f"- Delta: {self.section_header_delta.get('delta', 0)}",
            f"- Paragraph-count delta (candidate − canonical): {self.paragraph_count_delta}",
            "",
        ])
        added = self.section_header_delta.get("added", [])
        removed = self.section_header_delta.get("removed", [])
        if added:
            lines.append("### Headers added in candidate")
            for h in added:
                lines.append(f"- `{h}`")
            lines.append("")
        if removed:
            lines.append("### Headers removed from candidate")
            for h in removed:
                lines.append(f"- `{h}`")
            lines.append("")

        if self.opus_grader_result:
            og = self.opus_grader_result
            lines.extend([
                "---",
                "",
                "## Opus Semantic Grader",
                "",
                og.get("report", "").strip(),
                "",
                f"*Opus pass used {og.get('input_tokens', 0):,} input tokens "
                f"({og.get('cache_read_tokens', 0):,} cache-read, {og.get('cache_creation_tokens', 0):,} cache-write), "
                f"{og.get('output_tokens', 0):,} output tokens. Cost: ${og.get('cost_usd', 0):.4f}. "
                f"LLM drift score: {og.get('llm_drift_score', 0)} (additive).*",
                "",
            ])

        lines.extend([
            "---",
            "",
            "## Verdict",
            "",
            self._verdict_line(),
            "",
            f"_Generated by `sp18_prose_provenance.py`. "
            f"{'Opus-assisted check.' if self.opus_grader_result else 'Deterministic check only — pass --opus-grader for semantic review.'}_",
        ])
        return "\n".join(lines)

    def _verdict_line(self) -> str:
        if self.drift_score == 0:
            return "**CLEAN.** No Keystones dropped, no stale numbers reintroduced, structure within tolerance. Candidate is safe to send."
        if self.drift_score < 5:
            return "**MINOR DRIFT.** Review flagged items before dispatch; may be intentional edits."
        if self.drift_score < 15:
            return "**SIGNIFICANT DRIFT.** Founder review required before dispatch. Possible LOCKED03-class regression."
        return "**SEVERE DRIFT.** Do not dispatch. Candidate has silently undone canonical work; treat as stale."


# ------- core checks ----------------------------------------------------------

def _normalize(text: str) -> str:
    """Lowercase + squash whitespace for phrase-presence checks."""
    return re.sub(r"\s+", " ", text.lower()).strip()


def check_keystones(
    canonical_text: str,
    candidate_text: str,
    keystones: list[dict],
) -> tuple[list[dict], list[dict]]:
    """Return (missing_from_candidate, preserved_in_candidate) — only Keystones that were in canonical count."""
    cn = _normalize(canonical_text)
    cd = _normalize(candidate_text)
    missing, preserved = [], []
    for ks in keystones:
        phrase_n = _normalize(ks["phrase"])
        if phrase_n in cn:
            if phrase_n in cd:
                preserved.append(ks)
            else:
                missing.append(ks)
    return missing, preserved


def check_canonical_numbers(
    candidate_text: str,
    canonical_numbers: list[dict],
) -> list[dict]:
    """Return stale-form hits in the candidate."""
    hits = []
    for n in canonical_numbers:
        for stale in n.get("stale", []):
            # whole-word-ish match on the stale form
            if re.search(rf"(?<![\d.]){re.escape(stale)}(?![\d.])", candidate_text):
                hits.append({"name": n["name"], "found": stale, "canonical": n["canonical"]})
    return hits


def check_structure(canonical_text: str, candidate_text: str) -> tuple[dict, int]:
    """Return (header_delta_dict, paragraph_count_delta)."""
    header_re = re.compile(r"^(#{1,6})\s+(.+?)\s*$", re.MULTILINE)
    can_headers = [m.group(0).strip() for m in header_re.finditer(canonical_text)]
    cand_headers = [m.group(0).strip() for m in header_re.finditer(candidate_text)]
    added = [h for h in cand_headers if h not in can_headers]
    removed = [h for h in can_headers if h not in cand_headers]

    def _paragraphs(t: str) -> int:
        return len([p for p in re.split(r"\n\s*\n", t) if p.strip()])

    return (
        {
            "canonical_count": len(can_headers),
            "candidate_count": len(cand_headers),
            "delta": len(cand_headers) - len(can_headers),
            "added": added,
            "removed": removed,
        },
        _paragraphs(candidate_text) - _paragraphs(canonical_text),
    )


def compute_drift_score(report: DriftReport, profile: dict) -> int:
    """Composite score using doc-type profile weights. Adds Opus LLM drift score
    if the Opus grader ran."""
    score = 0
    score += profile["keystone_weight"] * len(report.keystones_missing)
    score += profile["numbers_weight"] * len(report.stale_numbers_reintroduced)
    score += profile["structure_weight"] * abs(report.section_header_delta.get("delta", 0))
    tol = profile["paragraph_tolerance"]
    if tol and tol < 999:
        score += abs(report.paragraph_count_delta) // tol
    if report.opus_grader_result:
        score += int(report.opus_grader_result.get("llm_drift_score", 0))
    return score


# ------- Opus grader (LLM-assisted semantic drift check) ----------------------

OPUS_SYSTEM_PROMPT = """You are the Prose Provenance System's LLM-assisted grader. You review two versions of a Liana Banyan document — a canonical predecessor and a candidate — to detect subtle drift that deterministic checks miss.

Focus on these categories:

1. **Semantic Keystone drift** — Founder voice anchors that were paraphrased rather than preserved verbatim. A paraphrased Keystone is almost always drift; exact wording carries the weight. Known Keystones include variations of: "Especially from friendly fire," "I have two suits," "potatoes at the end of a hoe handle," "I know enough to know I don't know enough," "Nothing about us without us," "the eighty percent is the only number where cooperation costs less than defection," "What we need is people and leadership; the money will follow," "No Plan Survives First Contact," "The medallions are minted," "Help each other help ourselves," "I read a lot, and I am good at chess."

2. **Register shifts** — tone moving from unvarnished to polished; specific to abstract; warm to transactional; first-person-concrete to third-person-generic.

3. **Softened stakes** — declarative → hedged ("I am unwilling" → "I prefer not"; "will agonize" → "will regret"; Founder voice is deliberately un-hedged).

4. **Specificity loss** — concrete anecdotes, named individuals, exact figures being generalized away.

5. **Disclaimer insertion** — hedges, caveats, or "just my opinion" frames added where canonical had none.

Output a tight Markdown section with:
- **Semantic drift flags** — bulleted list, each citing a canonical phrase and its candidate-version drift
- **LLM drift score** — integer 0 (none) to 10 (severe). Additive to the deterministic score.
- **Dispatch recommendation** — one sentence.

Be terse. Cite concrete examples only. Skip categories with no drift — do not write "none found" for every category.
"""


def opus_grader_available() -> bool:
    """Returns True only if we have the SDK and can load a key (env or SDS.env)."""
    return _HAS_ANTHROPIC and bool(_load_api_key())


def opus_grader_pass(canonical_text: str, candidate_text: str) -> Optional[dict]:
    """Call Opus to surface semantic drift deterministic checks miss.
    Returns dict with report text, token usage, and computed cost.
    Returns None if grader isn't available."""
    key = _load_api_key()
    if not (_HAS_ANTHROPIC and key):
        return None

    client = anthropic.Anthropic(api_key=key)
    response = client.messages.create(
        model=OPUS_MODEL,
        max_tokens=OPUS_MAX_TOKENS,
        system=[
            {
                "type": "text",
                "text": OPUS_SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},  # system prompt is stable across runs
            }
        ],
        messages=[
            {
                "role": "user",
                "content": (
                    f"## CANONICAL (predecessor):\n\n{canonical_text}\n\n---\n\n"
                    f"## CANDIDATE (to grade):\n\n{candidate_text}\n\n---\n\n"
                    "Grade the candidate for drift from canonical per the categories in your system prompt. "
                    "Report only what you find — skip categories with no drift."
                ),
            }
        ],
    )
    report_text = response.content[0].text if response.content else ""

    # Cost math — use cached-input rate where applicable
    in_price, out_price = MODEL_PRICING[OPUS_MODEL]
    usage = response.usage
    cache_read = getattr(usage, "cache_read_input_tokens", 0) or 0
    cache_create = getattr(usage, "cache_creation_input_tokens", 0) or 0
    regular_in = usage.input_tokens - cache_read - cache_create
    # Cache read = 10% of input; cache write = 125% of input (Anthropic prompt caching rates)
    cost = (
        (regular_in * in_price / 1_000_000)
        + (cache_read * in_price * 0.10 / 1_000_000)
        + (cache_create * in_price * 1.25 / 1_000_000)
        + (usage.output_tokens * out_price / 1_000_000)
    )

    # Extract LLM drift score. Prefer "LLM drift score" explicitly (handles Opus's ** bolding + whitespace);
    # fall back to bare "drift score" only if no LLM-labeled match exists.
    score_match = re.search(r"LLM drift score[:\s*]+(\d+)", report_text, re.IGNORECASE)
    if not score_match:
        score_match = re.search(r"drift score[:\s*]+(\d+)", report_text, re.IGNORECASE)
    llm_drift_score = int(score_match.group(1)) if score_match else 0

    return {
        "report": report_text,
        "input_tokens": usage.input_tokens,
        "output_tokens": usage.output_tokens,
        "cache_read_tokens": cache_read,
        "cache_creation_tokens": cache_create,
        "cost_usd": cost,
        "llm_drift_score": llm_drift_score,
    }


# ------- driver ---------------------------------------------------------------

def run(
    canonical_path: Path,
    candidate_path: Path,
    keystones: list[dict],
    canonical_numbers: list[dict],
    use_opus_grader: bool = False,
    doc_type: str = "generic",
) -> DriftReport:
    canonical_text = canonical_path.read_text(encoding="utf-8")
    candidate_text = candidate_path.read_text(encoding="utf-8")
    profile = DOC_TYPE_PROFILES.get(doc_type, DOC_TYPE_PROFILES["generic"])

    # run checks conditionally per profile
    missing, preserved = ([], [])
    if profile["run_keystones"]:
        missing, preserved = check_keystones(canonical_text, candidate_text, keystones)

    stale = []
    if profile["run_numbers"]:
        stale = check_canonical_numbers(candidate_text, canonical_numbers)

    struct_delta, para_delta = ({}, 0)
    if profile["run_structure"]:
        struct_delta, para_delta = check_structure(canonical_text, candidate_text)
    else:
        # still record the counts but don't penalize
        struct_delta, para_delta = check_structure(canonical_text, candidate_text)

    report = DriftReport(
        canonical_path=str(canonical_path),
        candidate_path=str(candidate_path),
        keystones_missing=missing,
        keystones_preserved=preserved,
        stale_numbers_reintroduced=stale,
        canonical_numbers_preserved=[],
        section_header_delta=struct_delta,
        paragraph_count_delta=para_delta,
    )
    report.doc_type = doc_type  # type: ignore

    if use_opus_grader:
        if not opus_grader_available():
            print("WARNING: --opus-grader requested but anthropic SDK and/or ANTHROPIC_API_KEY not available. Skipping.", file=sys.stderr)
        else:
            report.opus_grader_result = opus_grader_pass(canonical_text, candidate_text)

    report.drift_score = compute_drift_score(report, profile)
    return report


def _load_json_if_given(path: Optional[str], fallback: list[dict]) -> list[dict]:
    if not path:
        return fallback
    return json.loads(Path(path).read_text(encoding="utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser(description="SP-18 Prose Provenance drift check")
    parser.add_argument("--canonical", required=True, type=Path)
    parser.add_argument("--candidate", required=True, type=Path)
    parser.add_argument("--keystones", default=None, help="JSON list of Keystones to override defaults")
    parser.add_argument("--canonical-numbers", default=None, help="JSON list of canonical numbers to override defaults")
    parser.add_argument("--out", default=None, type=Path, help="Write report to this path instead of stdout")
    parser.add_argument("--opus-grader", action="store_true", help="Also run an Opus LLM semantic-drift pass (~$0.02-0.10 per check)")
    parser.add_argument("--doc-type", default=None, choices=list(DOC_TYPE_PROFILES.keys()) + [None],
                        help="Document type for score weighting: letter | scaffold | proposal | tribute | generic. Inferred from filename if not specified.")
    args = parser.parse_args()

    keystones = _load_json_if_given(args.keystones, DEFAULT_KEYSTONES)
    canonical_numbers = _load_json_if_given(args.canonical_numbers, DEFAULT_CANONICAL_NUMBERS)

    doc_type = args.doc_type or _infer_doc_type(args.candidate)

    report = run(args.canonical, args.candidate, keystones, canonical_numbers,
                 use_opus_grader=args.opus_grader, doc_type=doc_type)
    output = report.to_markdown()

    if args.out:
        args.out.write_text(output, encoding="utf-8")
        print(f"Report written to {args.out}")
    else:
        print(output)

    # Exit code: 0 clean, 1 minor, 2 significant, 3 severe
    if report.drift_score == 0:
        return 0
    if report.drift_score < 5:
        return 1
    if report.drift_score < 15:
        return 2
    return 3


if __name__ == "__main__":
    sys.exit(main())
