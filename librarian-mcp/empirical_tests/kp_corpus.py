"""
Knowledge Pump Empirical Test — Pilot Corpus (Phase B, K538)

20 R11-v2 facts tagged with cross-domain bridge markers for Test 2
(mastery-aware retrieval). Hybrid corpus: facts are canonical R11 content
(substrate-true); tags are manually applied for the pilot (LLM-assisted
at 150-fact scale post-Phase E).

Domain bridge tags encode structural parallels between cooperative-economics
concepts and mastery-domain patterns. A member with mastery in domain X gets
bridge-weighted retrieval — their existing mental models are pumped into context.

Five mastery domains:
  chess      — positional advantage, resource tradeoffs, threshold decisions
  military   — readiness metrics, command hierarchy, logistics, mission planning
  culinary   — recipe ratios, brigade coordination, mise en place, allocation
  music      — ensemble coordination, compositional structure, voice leading
  linguistics — grammar aspect/tense, cognate patterns, cross-language transfer

Each fact carries:
  fact_id        — canonical R11 identifier
  title          — human label
  category       — R11 category (canonical_statistics, architecture_mechanics, etc.)
  key_number     — the canonical figure that defines this fact (for HOT grading)
  key_phrase     — the canonical phrase for this fact (alt HOT grading)
  domain_bridges — list of mastery domains with structural parallels
  bridge_rationale — why each domain bridges to this fact (for transparency)
  observation_excerpt — first 600 chars of the full R11 observation (context window)

Stone Tablet Imperative: full payload preserved in results records. No
summarize-and-discard. Each bridge_rationale is part of the Stone Tablet.

Filed: B132, 2026-04-28 by Knight (K538).
"""

from __future__ import annotations
from dataclasses import dataclass, field
import json
from pathlib import Path

_SCRIBE_PATH = Path(__file__).parent.parent / "stitchpunks" / "scribes" / "scribe_R11.jsonl"

MASTERY_DOMAINS = ["chess", "military", "culinary", "music", "linguistics"]


@dataclass
class KPFact:
    """One pilot corpus fact with Knowledge Pump cross-domain bridge tags."""
    fact_id: str
    title: str
    category: str
    key_number: str          # canonical figure — must appear in HOT-graded answers
    key_phrase: str          # canonical phrase — alternate HOT anchor
    domain_bridges: list[str]
    bridge_rationale: dict[str, str]   # {domain: rationale_sentence}
    observation_excerpt: str = ""      # first ~600 chars of R11 observation


def _load_r11_excerpts(fact_ids: list[str]) -> dict[str, str]:
    """Load observation excerpts from the R11 scribe for the pilot fact IDs."""
    excerpts: dict[str, str] = {}
    if not _SCRIBE_PATH.exists():
        return excerpts
    with _SCRIBE_PATH.open(encoding="utf-8") as fh:
        for line in fh:
            try:
                d = json.loads(line)
            except json.JSONDecodeError:
                continue
            if d.get("type") == "header":
                continue
            fid = d.get("fact_id", "")
            if fid in fact_ids:
                obs = d.get("observation", "")
                excerpts[fid] = obs[:600]
    return excerpts


# ---------------------------------------------------------------------------
# Pilot corpus definition — 20 facts, 6 categories
# ---------------------------------------------------------------------------

_PILOT_FACTS_RAW: list[dict] = [
    # --- canonical_statistics (5 facts) ---
    {
        "fact_id": "CS-01",
        "title": "Verdania Membership",
        "category": "canonical_statistics",
        "key_number": "847,293",
        "key_phrase": "active member-owners as of Q3 2025",
        "domain_bridges": ["chess", "military"],
        "bridge_rationale": {
            "chess": "Active-piece counting: the 90-day activity window mirrors counting pieces still in play (not pieces ever placed). Material strength = active material only.",
            "military": "Readiness reporting: the identity-verified + trailing-90-day-activity protocol parallels unit strength reporting — only soldiers who showed up to formation count toward combat-ready strength.",
        },
    },
    {
        "fact_id": "CS-03",
        "title": "Amendment Supermajority Threshold",
        "category": "canonical_statistics",
        "key_number": "66.7%",
        "key_phrase": "supermajority threshold for constitutional amendments",
        "domain_bridges": ["chess", "linguistics"],
        "bridge_rationale": {
            "chess": "Decisive-advantage threshold: 66.7% mirrors the two-thirds positional control required before converting to an endgame. Below threshold, the position remains contested — conversion is premature.",
            "linguistics": "Grammatical agreement rules require supermajority consensus across inflected forms. A singular subject controls the verb form only when all forms 'agree' — no isolated actor can override the paradigm.",
        },
    },
    {
        "fact_id": "CS-06",
        "title": "Member Economic Surplus",
        "category": "canonical_statistics",
        "key_number": "$312",
        "key_phrase": "per active member-owner economic surplus",
        "domain_bridges": ["military", "music"],
        "bridge_rationale": {
            "military": "Unit budget allocation: surplus per member parallels per-soldier operational budget — the equitable distribution of mission resources across the unit, not concentrated at command.",
            "music": "Ensemble revenue sharing: the per-performer split after a concert mirrors the per-member surplus — the value created collectively flows back to each contributor proportionally.",
        },
    },
    {
        "fact_id": "CS-08",
        "title": "Maximum Voting Weight Cap",
        "category": "canonical_statistics",
        "key_number": "2.3%",
        "key_phrase": "maximum voting weight cap",
        "domain_bridges": ["chess", "music"],
        "bridge_rationale": {
            "chess": "Piece value caps: no single piece (even the queen) controls more than ~2-3% of all possible board influence. The cap prevents any single piece from dominating the entire game state.",
            "music": "Ensemble balance: no single instrument overwhelms the texture — the conductor enforces dynamic balance so the ensemble voice emerges from all parts, not the loudest soloist.",
        },
    },
    {
        "fact_id": "CS-21",
        "title": "Member AI Interaction Frequency",
        "category": "canonical_statistics",
        "key_number": "12.3",
        "key_phrase": "AI assistance queries per month",
        "domain_bridges": ["linguistics", "culinary"],
        "bridge_rationale": {
            "linguistics": "Vocabulary maintenance frequency: the spaced-repetition literature recommends 10-15 daily practice encounters per vocabulary item per month for consolidation — exactly the range that substrate interaction hits.",
            "culinary": "Daily mise en place: the 12.3-queries-per-month rhythm parallels the daily kitchen prep check — small regular investments that keep operational readiness high without overwhelming the prep cycle.",
        },
    },
    # --- architecture_mechanics (4 facts) ---
    {
        "fact_id": "AM-01",
        "title": "Thornwick Dense-Sparse Hybrid Ratio",
        "category": "architecture_mechanics",
        "key_number": "0.73:0.27",
        "key_phrase": "dense-to-sparse weighting ratio",
        "domain_bridges": ["chess", "music"],
        "bridge_rationale": {
            "chess": "Opening density vs endgame sparsity: the 0.73:0.27 ratio mirrors opening-book density (high semantic richness per position) versus endgame tablebase sparsity (fewer but more decisive patterns). Dense retrieval = opening; sparse retrieval = endgame precision.",
            "music": "Harmonic texture ratio: dense harmonic passages (tutti) vs sparse melodic lines (solo) in roughly 3:1 proportion mirrors the dense-sparse hybrid — rich context for complex queries, precise pointedness for simple lookups.",
        },
    },
    {
        "fact_id": "AM-03",
        "title": "Top-K Retrieval Default",
        "category": "architecture_mechanics",
        "key_number": "10",
        "key_phrase": "top-10 retrieval default",
        "domain_bridges": ["military", "culinary"],
        "bridge_rationale": {
            "military": "Intelligence triage: the analyst surfaces the top-10 actionable intelligence reports from hundreds of signals — more than 10 creates decision fatigue; fewer than 5 misses critical context. Top-K is a mission-planning tool.",
            "culinary": "Tasting selection: a chef evaluating a menu tastes 7-12 dishes before finalizing — enough to establish pattern and range without overwhelming the palate. Top-10 retrieval is the chef's tasting flight for the AI's context window.",
        },
    },
    {
        "fact_id": "AM-07",
        "title": "Membership Score Decay Function",
        "category": "architecture_mechanics",
        "key_number": "180 days",
        "key_phrase": "logarithmic decay function with a half-life of 180 days",
        "domain_bridges": ["chess", "linguistics"],
        "bridge_rationale": {
            "chess": "Positional advantage decay: an unused positional advantage dissipates — the opponent corrects their position over time. Logarithmic decay means early activity counts most; stale activity still counts but at diminishing weight, just as an old positional edge fades but never vanishes instantly.",
            "linguistics": "Language attrition curve: vocabulary retention follows a logarithmic decay curve — half of unused vocabulary is accessible after ~180 days, then progressively less. Spaced repetition practice resets the decay clock, just as new platform activity resets the membership score.",
        },
    },
    {
        "fact_id": "AM-18",
        "title": "Consensus Quorum Percentage",
        "category": "architecture_mechanics",
        "key_number": "51.0%",
        "key_phrase": "consensus quorum for federated node agreement",
        "domain_bridges": ["chess", "military"],
        "bridge_rationale": {
            "chess": "Majority control threshold: in endgame pawn structures, controlling 51%+ of the pawn majorities ensures promotion access. Below 51%, the opponent can achieve counterplay. The quorum mirrors the minimum-winning-threshold concept.",
            "military": "Command consensus: 51% quorum mirrors the minimum command-level agreement required before a multi-unit operation launches. Below quorum = mission abort; at or above = proceed with full authority.",
        },
    },
    # --- economic_governance (4 facts) ---
    {
        "fact_id": "EG-01",
        "title": "Patronage Allocation Formula",
        "category": "economic_governance",
        "key_number": "70/30",
        "key_phrase": "70% by transaction volume and 30% equally per active member",
        "domain_bridges": ["culinary", "music"],
        "bridge_rationale": {
            "culinary": "Tip distribution in a restaurant brigade: 70% allocated by covers served (output volume) and 30% split equally across kitchen staff mirrors the patronage formula — high performers earn more, but base equity ensures every contributor is valued.",
            "music": "Royalty split: the 70/30 formula parallels streaming royalty allocation — 70% to the track's proportional play share, 30% as a baseline per-track floor that ensures minority voices aren't crushed by hits.",
        },
    },
    {
        "fact_id": "EG-03",
        "title": "Tier Classifications",
        "category": "economic_governance",
        "key_number": "$1B",
        "key_phrase": "Tier 1 annual volume greater than or equal to $1 billion",
        "domain_bridges": ["chess", "military"],
        "bridge_rationale": {
            "chess": "Rating tier bands: the Tier 1-4 classification parallels chess rating bands (2000+, 1600-1999, 1200-1599, <1200). Each band carries different compliance obligations just as each rating band carries different tournament access rights.",
            "military": "Rank structure: the four-tier platform classification mirrors officer rank groupings — Tier 1 platforms have O-6+ obligations (statutory audit, full transparency), Tier 4 platforms have E1 obligations (basic compliance). Each tier earns its obligations through demonstrated scale.",
        },
    },
    {
        "fact_id": "EG-05",
        "title": "Exit Rights Minimum Notice Period",
        "category": "economic_governance",
        "key_number": "60",
        "key_phrase": "60 calendar days minimum exit notice period",
        "domain_bridges": ["military", "culinary"],
        "bridge_rationale": {
            "military": "Lawful separation procedures: the 60-day exit notice mirrors the military's ETS (Expiration Term of Service) out-processing window — sufficient time to conduct property accountability, benefit transitions, and knowledge transfer without mission disruption.",
            "culinary": "Kitchen departure protocol: a chef leaving a brigade gives notice equal to the time needed to train a replacement and complete the mise en place handoff — typically 30-90 days. The 60-day standard ensures the kitchen doesn't lose institutional knowledge overnight.",
        },
    },
    {
        "fact_id": "EG-20",
        "title": "Surplus Distribution Trigger Threshold",
        "category": "economic_governance",
        "key_number": "110%",
        "key_phrase": "110% of the reserve floor triggers surplus distribution",
        "domain_bridges": ["chess", "military"],
        "bridge_rationale": {
            "chess": "Converting positional to material advantage: a grandmaster waits until the positional advantage reaches the conversion threshold (110% of minimum winning margin) before cashing in. Premature conversion below threshold leaves the advantage unrealized.",
            "military": "Mission success threshold: resources are redistributed to the next mission phase only after the current objective is secured to 110% of the minimum defensible standard. Distributing before the reserve floor is secure risks losing the consolidated gain.",
        },
    },
    # --- member_journey (9 facts — 3 original + 6 b-variant expanded, K-MJ-Variant) ---
    {
        "fact_id": "MJ-01",
        "title": "Application Processing Time Standard",
        "category": "member_journey",
        "key_number": "10",
        "key_phrase": "10 business days application processing standard",
        "domain_bridges": ["culinary", "military"],
        "bridge_rationale": {
            "culinary": "Mise en place timing standard: a kitchen sets up its mise en place in exactly the time available before service — too slow and service quality drops; too fast and the prep is wasted. The 10-day standard is the cooperative sector's mise en place window.",
            "military": "Recruit induction processing: the military's induction processing standard (medical, administrative, equipment issue) fits a similar ~10-business-day window before a new soldier is mission-ready. Speed signals organizational capability.",
        },
    },
    {
        "fact_id": "MJ-05",
        "title": "Mentorship Program Pairing Standard",
        "category": "member_journey",
        "key_number": "15",
        "key_phrase": "15 business days to complete mentor-mentee pairing",
        "domain_bridges": ["chess", "linguistics"],
        "bridge_rationale": {
            "chess": "Club mentorship pairing: a chess club pairs stronger players with developing players within 2-3 club meetings (15 business days). The pairing algorithm matches rating proximity + schedule compatibility, exactly as cooperative mentor matching does.",
            "linguistics": "Native-speaker pairing in language exchange: language programs pair native speakers with learners within 15 days of enrollment — the window balances urgency (learners lose motivation if pairing delays) with quality (rushed pairings misfire).",
        },
    },
    {
        "fact_id": "MJ-10",
        "title": "Time to First Transaction and Early-Cohort Churn Reduction",
        "category": "member_journey",
        "key_number": "67%",
        "key_phrase": "67% lower first-year churn for members transacting within 5 days vs 14+ days",
        "domain_bridges": ["chess", "military"],
        "bridge_rationale": {
            "chess": "Time-pressure performance: players who make their first decisive move within the first 5 moves of a critical position consistently show lower error rates in the rest of the game — the early commitment signal predicts long-term quality just as early transaction predicts retention.",
            "military": "Time to first operational contact: units that make first contact with their operational environment within 4-5 days of arrival show dramatically higher mission cohesion. The 67% churn-reduction maps directly to the unit-bonding effect of early operational engagement.",
        },
    },
    {
        "fact_id": "MJ-12",
        "title": "Member Satisfaction NPS Target and Genuinely-Cooperative Band",
        "category": "member_journey",
        "key_number": "50-65",
        "key_phrase": "NPS range 50-65 for platforms assessed as genuinely cooperative in governance",
        "domain_bridges": ["music", "culinary"],
        "bridge_rationale": {
            "music": "Ensemble quality NPS: concert venues that prioritize ensemble voice over soloist prominence consistently achieve NPS in the 55-65 range — the 'genuinely cooperative' governance assessment maps to the same ensemble-over-individual quality dimension.",
            "culinary": "Michelin NPS band: restaurants assessed as expressing the chef's genuine culinary philosophy (vs commercial formula) cluster in the NPS 50-65 range. The authenticity assessment maps onto 'genuinely cooperative in governance' — authentic governance, authentic NPS.",
        },
    },
    {
        "fact_id": "MJ-16",
        "title": "Governance Training Completion Target and Voting Multiplier",
        "category": "member_journey",
        "key_number": "3.4",
        "key_phrase": "3.4x more likely to vote in first annual election for members completing governance training",
        "domain_bridges": ["chess", "linguistics"],
        "bridge_rationale": {
            "chess": "Training commitment and tournament participation: players who complete a structured training program in their first 90 days at a club are 3-4x more likely to enter their first rated tournament than players who skip structured training. The training commitment signal predicts the participation commitment signal.",
            "linguistics": "Language learning outcomes: learners who complete structured grammar instruction in their first 90 days of study show 3-4x higher conversation participation rates than those who skip formal instruction and start conversationally. Training investment predicts participation confidence.",
        },
    },
    {
        "fact_id": "MJ-19",
        "title": "Patronage Statement Delivery Timeline and Cash Payment Requirement",
        "category": "member_journey",
        "key_number": "20%",
        "key_phrase": "20% of patronage distributions paid in cash within current tax year for qualified-notice treatment",
        "domain_bridges": ["military", "culinary"],
        "bridge_rationale": {
            "military": "Mission resource allocation — cash vs deferred: a minimum cash percentage for operational expenses mirrors the military's requirement that at least a fraction of mission resources be immediately liquid rather than deferred to future appropriations. The 20% floor prevents patronage from being entirely deferred equity.",
            "culinary": "Restaurant cash-flow management: a chef managing a brigade knows that at least 20% of the weekly payroll must flow as immediate cash — the rest can be structured as tips or deferred bonuses. The 20% cash minimum mirrors the kitchen's operational cash-flow discipline.",
        },
    },
    {
        "fact_id": "MJ-22",
        "title": "Account Inactivity Warning Threshold and AI Governance Participation Multiplier",
        "category": "member_journey",
        "key_number": "2.4",
        "key_phrase": "2.4x governance participation rate for AI governance assistant users vs non-users",
        "domain_bridges": ["chess", "linguistics"],
        "bridge_rationale": {
            "chess": "Computer-aided analysis adoption: players who adopt computer-aided analysis tools in their first year show 2-3x higher participation in club tournaments and correspondence events. The AI tool adoption signal predicts engagement depth — members who invest in AI assistance become more engaged participants.",
            "linguistics": "AI-assisted language learning: learners who adopt AI conversation partners show 2-4x higher participation in advanced-level discussion groups. The AI tool lowers the participation barrier by providing scaffolding — the same mechanism drives the 2.4x governance participation effect.",
        },
    },
    {
        "fact_id": "MJ-24",
        "title": "Grievance Escalation Timeline and Trust Rating at High CHS",
        "category": "member_journey",
        "key_number": "91%",
        "key_phrase": "91% of members at CHS-above-80 platforms rate their platform as trustworthy",
        "domain_bridges": ["chess", "military"],
        "bridge_rationale": {
            "chess": "High-trust club culture: chess clubs with a Cooperative Health Score equivalent (organized governance, fair pairing, clear dispute resolution) achieve 90%+ member satisfaction ratings. The 10-business-day grievance escalation timeline maps to the 'fair pairing dispute' resolution speed that drives club trust.",
            "military": "Unit cohesion at high operational effectiveness: units rated above 80 on operational effectiveness metrics show 90%+ member-cohesion scores. The CHS-80 trust correlation mirrors how operational health translates to unit trust — members trust the institution when the institution functions well.",
        },
    },
    # --- regulatory_compliance (2 facts) ---
    {
        "fact_id": "RC-04",
        "title": "Incident Response Notification Window",
        "category": "regulatory_compliance",
        "key_number": "72 hours",
        "key_phrase": "72-hour member notification window for security incidents",
        "domain_bridges": ["military", "chess"],
        "bridge_rationale": {
            "military": "CCIR reporting (Commander's Critical Information Requirements): the 72-hour notification parallels the military's battle-damage assessment and SALUTE report obligation — critical incident information must reach command within the operational window, not whenever convenient.",
            "chess": "Touch-move obligation: once you touch a piece you must move it — the 72-hour window is the cooperative equivalent. Once an incident is identified, the notification obligation is triggered and the clock runs; there is no 'I was going to report it later' defense.",
        },
    },
    {
        "fact_id": "RC-07",
        "title": "AML Transaction Monitoring Threshold",
        "category": "regulatory_compliance",
        "key_number": "$15,000",
        "key_phrase": "AML automated monitoring threshold at $15,000",
        "domain_bridges": ["military", "chess"],
        "bridge_rationale": {
            "military": "Intelligence escalation threshold: in signals intelligence, a signal crossing the minimum reportable threshold triggers mandatory escalation. The $15,000 AML threshold mirrors the minimum actionable signal — below it, it's noise; above it, it's mandatory action.",
            "chess": "Threat assessment threshold: a chess engine flags threats above a centipawn evaluation threshold — below the threshold, the position is equal and no response is required; above it, forced action. AML threshold is the centipawn evaluation of financial activity.",
        },
    },
    # --- historical_precedent (2 facts) ---
    {
        "fact_id": "HP-02",
        "title": "The Verdania Receivership and Recovery",
        "category": "historical_precedent",
        "key_number": "fourteen months",
        "key_phrase": "Verdania entered receivership Q2 2021 and recovered in fourteen months",
        "domain_bridges": ["military", "chess"],
        "bridge_rationale": {
            "military": "Unit recovery after defeat: a combat unit that suffers significant losses enters reconstitution — a structured recovery phase with external oversight before returning to operations. Verdania's receivership parallels the reconstitution period: external stewardship, root-cause analysis, controlled re-entry.",
            "chess": "Material deficit recovery: a grandmaster down material doesn't resign immediately — they enter a defensive holding strategy, trading off weaknesses, and look for the one tactical sequence that converts defense to counterattack. Verdania's fourteen-month recovery is the cooperative equivalent of an endgame grind.",
        },
    },
    {
        "fact_id": "HP-06",
        "title": "The Thornwick Architecture Discovery",
        "category": "historical_precedent",
        "key_number": "November 2024",
        "key_phrase": "Thornwick Cooperative Research Institute, Birmingham, UK, published November 2024",
        "domain_bridges": ["linguistics", "chess"],
        "bridge_rationale": {
            "linguistics": "Discovering grammatical structure in a new language: a linguist studying an undocumented language identifies the underlying grammar by pattern-matching surface forms — the Thornwick discovery moment parallels the researcher who suddenly sees the dense-sparse hybrid architecture in the retrieval data, just as a linguist sees the aspectual system hidden in verb forms.",
            "chess": "Discovering a new opening theory: a chess researcher in blitz sessions stumbles on a novelty that reframes opening theory — the Thornwick team's discovery has the same character: empirical play (live retrieval experiments) revealed a structural truth that formal analysis had missed.",
        },
    },
]


def build_pilot_corpus(load_excerpts: bool = True) -> list[KPFact]:
    """
    Build the 20-fact pilot corpus with observation excerpts loaded from the R11 scribe.

    Args:
        load_excerpts: If True, load observation excerpts from scribe_R11.jsonl.
                       Set False for tests that don't need the full text.
    Returns:
        List of KPFact dataclass instances.
    """
    ids = [r["fact_id"] for r in _PILOT_FACTS_RAW]
    excerpts = _load_r11_excerpts(ids) if load_excerpts else {}

    corpus: list[KPFact] = []
    for raw in _PILOT_FACTS_RAW:
        fid = raw["fact_id"]
        corpus.append(KPFact(
            fact_id=fid,
            title=raw["title"],
            category=raw["category"],
            key_number=raw["key_number"],
            key_phrase=raw["key_phrase"],
            domain_bridges=raw["domain_bridges"],
            bridge_rationale=raw["bridge_rationale"],
            observation_excerpt=excerpts.get(fid, ""),
        ))
    return corpus


def corpus_as_dict(corpus: list[KPFact]) -> dict[str, KPFact]:
    """Index corpus by fact_id."""
    return {f.fact_id: f for f in corpus}


def facts_for_domain(corpus: list[KPFact], domain: str) -> list[KPFact]:
    """Return all facts that have a bridge to the given mastery domain."""
    return [f for f in corpus if domain in f.domain_bridges]


if __name__ == "__main__":
    corpus = build_pilot_corpus()
    print(f"Pilot corpus: {len(corpus)} facts")
    for domain in MASTERY_DOMAINS:
        matched = facts_for_domain(corpus, domain)
        print(f"  {domain}: {len(matched)} facts with bridge")
    print()
    for f in corpus:
        print(f"  {f.fact_id} | {f.title} | bridges={f.domain_bridges}")
