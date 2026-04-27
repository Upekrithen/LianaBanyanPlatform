"""
R10 Single-Blind Grader
========================
Primary: Claude Haiku 4.5 grades ALL responses (single-blind — no vendor/model/condition info).
Spot-check: Claude Opus 4.7 re-grades a random 10% sample for inter-rater agreement (Cohen's kappa).

Hard rule: ONE grader across all 8 models. Never grade Anthropic with Anthropic and Google with Google.
"""

import json
import os
import random
import time
from dataclasses import dataclass
from typing import Optional

GRADER_MODEL = "claude-haiku-4-5-20251001"
SPOT_CHECK_MODEL = "claude-opus-4-7"
SPOT_CHECK_FRACTION = 0.10

GRADING_PROMPT_TEMPLATE = """You are a precise grading assistant. Your task is to grade a response against a reference answer using a rubric.

## Question
{question}

## Reference Answer
{canonical_answer}

## Grading Rubric
- CORRECT: {rubric_correct}
- PARTIAL: {rubric_partial}
- INCORRECT: {rubric_incorrect}

## Candidate Response
{candidate_response}

## Instructions
Grade the candidate response as exactly one of: CORRECT, PARTIAL, or INCORRECT.
Apply the rubric strictly. Do not give credit for information not present in the response.
Do not penalize for extra information beyond what was asked, as long as the core answer is present.

Respond with ONLY a JSON object (no markdown fences):
{{"grade": "CORRECT"|"PARTIAL"|"INCORRECT", "rationale": "brief explanation (1-2 sentences)"}}"""


@dataclass
class GradeResult:
    question_id: str
    grade: str  # CORRECT, PARTIAL, INCORRECT
    score: float  # 1.0, 0.5, 0.0
    rationale: str
    grader_model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    latency_s: float


GRADE_TO_SCORE = {"CORRECT": 1.0, "PARTIAL": 0.5, "INCORRECT": 0.0}


def grade_single(
    question: dict,
    candidate_response: str,
    model: str = GRADER_MODEL,
) -> GradeResult:
    """Grade a single response. Single-blind: no vendor/model/condition info passed."""
    import anthropic

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY required for grading")

    prompt = GRADING_PROMPT_TEMPLATE.format(
        question=question["question"],
        canonical_answer=question["canonical_answer"],
        rubric_correct=question["rubric"]["correct"],
        rubric_partial=question["rubric"]["partial"],
        rubric_incorrect=question["rubric"]["incorrect"],
        candidate_response=candidate_response,
    )

    client = anthropic.Anthropic(api_key=api_key)
    t0 = time.perf_counter()
    response = client.messages.create(
        model=model,
        max_tokens=256,
        messages=[{"role": "user", "content": prompt}],
    )
    latency = time.perf_counter() - t0

    text = response.content[0].text if response.content else "{}"
    # Strip markdown fences if model wraps the JSON
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        parsed = {"grade": "INCORRECT", "rationale": f"Grader output unparseable: {text[:200]}"}

    grade = parsed.get("grade", "INCORRECT").upper()
    if grade not in GRADE_TO_SCORE:
        grade = "INCORRECT"

    haiku_pricing = {"input": 1.00, "output": 5.00}
    opus_pricing = {"input": 15.00, "output": 75.00}
    pricing = opus_pricing if "opus" in model else haiku_pricing
    input_tokens = response.usage.input_tokens
    output_tokens = response.usage.output_tokens
    cost = (input_tokens / 1_000_000) * pricing["input"] + \
           (output_tokens / 1_000_000) * pricing["output"]

    return GradeResult(
        question_id=question["id"],
        grade=grade,
        score=GRADE_TO_SCORE[grade],
        rationale=parsed.get("rationale", ""),
        grader_model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=round(cost, 6),
        latency_s=round(latency, 3),
    )


def compute_cohens_kappa(primary_grades: list[str], spot_grades: list[str]) -> float:
    """Compute Cohen's kappa for inter-rater agreement on the spot-check sample."""
    if not primary_grades or len(primary_grades) != len(spot_grades):
        return 0.0

    categories = ["CORRECT", "PARTIAL", "INCORRECT"]
    n = len(primary_grades)
    agreements = sum(1 for p, s in zip(primary_grades, spot_grades) if p == s)
    po = agreements / n

    # Expected agreement by chance
    pe = 0.0
    for cat in categories:
        p_freq = sum(1 for g in primary_grades if g == cat) / n
        s_freq = sum(1 for g in spot_grades if g == cat) / n
        pe += p_freq * s_freq

    if pe >= 1.0:
        return 1.0
    return (po - pe) / (1.0 - pe)


def select_spot_check_sample(
    results: list[dict],
    fraction: float = SPOT_CHECK_FRACTION,
    seed: int = 42,
) -> list[dict]:
    """Select stratified random sample for spot-check grading.
    Stratified by vendor × condition."""
    rng = random.Random(seed)
    strata: dict[str, list[dict]] = {}

    for r in results:
        key = f"{r.get('vendor', 'unknown')}_{r.get('condition', 'unknown')}"
        strata.setdefault(key, []).append(r)

    sample = []
    for key, items in strata.items():
        k = max(1, int(len(items) * fraction))
        sample.extend(rng.sample(items, min(k, len(items))))

    return sample
