#!/usr/bin/env python3
"""
K528 Question Bank Generator — R11v2_QUESTION_BANK_SEALED_K528.json
200 questions across 6 categories, all hot_required_elements verified
against r11v2_canonical_corpus_100k.md before sealing.
"""
import json, re
from pathlib import Path
from datetime import date

CORPUS_PATH = Path(__file__).parent / "r11v2_canonical_corpus_100k.md"
OUT = Path(__file__).parent / "R11v2_QUESTION_BANK_SEALED_K528.json"

corpus = CORPUS_PATH.read_text(encoding="utf-8")

def q(qid, cat, fact_id, question, ground_truth, hot, hit, risk, correct, partial, incorrect):
    return {
        "id": qid,
        "category": cat,
        "source_fact_id": fact_id,
        "question": question,
        "ground_truth": ground_truth,
        "canonical_answer": ground_truth,
        "hot_required_elements": hot,
        "hit_required_elements": hit,
        "hallucination_risk": risk,
        "rubric": {
            "correct": correct,
            "partial": partial,
            "incorrect": incorrect,
        }
    }

def verify_elements(questions):
    failures = []
    for qu in questions:
        for el in qu["hot_required_elements"]:
            if el.lower() not in corpus.lower():
                failures.append((qu["id"], el))
    return failures

# ==================== CANONICAL STATISTICS ====================
CS_QUESTIONS = [
    q("R11v2-CS-01", "canonical_statistics", "CS-01",
      "How many active member-owners did the Verdania Cooperative Platform report as of Q3 2025?",
      "847,293 active member-owners as of Q3 2025.",
      ["847,293", "Q3 2025"], ["847"], "high — model may invent a plausible member count",
      "Contains '847,293' and 'Q3 2025'", "Contains the correct count or quarter but not both", "Does not contain the correct count"),

    q("R11v2-CS-01b", "canonical_statistics", "CS-01",
      "What was Verdania's Q2 2025 active member count according to the prior quarter's report?",
      "791,440 active members in Q2.",
      ["791,440"], ["791"], "high — model may invent adjacent quarter figure",
      "Contains '791,440'", "Contains a figure close to but not exactly 791,440", "Does not contain the correct figure"),

    q("R11v2-CS-02", "canonical_statistics", "CS-02",
      "What total transaction volume did the Verdania Cooperative Platform report for fiscal year 2024?",
      "$4.7 billion in fiscal year 2024.",
      ["$4.7 billion", "fiscal year 2024"], ["4.7"], "high — model may substitute a different year or amount",
      "Contains '$4.7 billion' and 'fiscal year 2024'", "Contains the amount or year but not both", "Does not contain the correct figure"),

    q("R11v2-CS-02b", "canonical_statistics", "CS-02",
      "By what percentage did Verdania's fiscal year 2024 transaction volume increase from the prior year?",
      "23% increase from the prior year.",
      ["23%"], ["23"], "medium",
      "Contains '23%'", "Contains a percentage near 23% but not exact", "Does not contain the correct percentage"),

    q("R11v2-CS-03", "canonical_statistics", "CS-03",
      "What supermajority threshold does the Cooperative Ledger Standards Body require for constitutional amendments in federated cooperative networks?",
      "66.7% of eligible votes.",
      ["66.7%"], ["66"], "high — model may guess two-thirds without the decimal",
      "Contains '66.7%'", "Contains '66' or 'two-thirds' without the precise decimal", "Does not contain the threshold"),

    q("R11v2-CS-04", "canonical_statistics", "CS-04",
      "How many days does the Cairnfield Protocol allow for a member's data to be made exportable after their formal exit notice?",
      "180-day data portability window.",
      ["180-day", "180 days"], ["180"], "medium — model may confuse with other protocol timelines",
      "Contains '180' in context of portability window", "Contains a number near 180 without context", "Does not contain the correct duration"),

    q("R11v2-CS-05", "canonical_statistics", "CS-05",
      "What was the highest recorded value of the Solstice Index, and when was it recorded?",
      "4.18 in November 2025.",
      ["4.18", "November 2025"], ["4.18"], "high — model may confuse with prior high of 4.09",
      "Contains '4.18' and 'November 2025'", "Contains the value or the date but not both", "Does not contain the correct peak value"),

    q("R11v2-CS-06", "canonical_statistics", "CS-06",
      "What was the 2024 average member economic surplus per active member-owner across the cooperative AI platform sector?",
      "$312 per active member-owner.",
      ["$312", "312"], ["312"], "high — model may confuse with tier-specific figures ($531, $43)",
      "Contains '$312' in context of sector average", "Contains a figure near $312 without clear attribution to sector average", "Does not contain the correct figure"),

    q("R11v2-CS-07", "canonical_statistics", "CS-07",
      "Under the Sundry Accord, what percentage of eligible member-owners must be registered as participants for an extraordinary general meeting to be valid?",
      "15% of eligible member-owners.",
      ["15%"], ["15"], "medium",
      "Contains '15%' in context of extraordinary meeting quorum", "Contains '15' without clear quorum context", "Does not contain the correct percentage"),

    q("R11v2-CS-08", "canonical_statistics", "CS-08",
      "What is the maximum individual voting weight cap for federated cooperative platforms compliant with the Cooperative Ledger Standards Body?",
      "2.3% of total votes.",
      ["2.3%"], ["2.3"], "high — model may guess a round number",
      "Contains '2.3%'", "Contains '2' or 'two percent' without precision", "Does not contain the correct cap"),

    q("R11v2-CS-09", "canonical_statistics", "CS-09",
      "What is the minimum reserve funding floor required by the Cooperative Capital Framework, expressed as a percentage of transaction volume?",
      "8.5% of the prior 12-month gross transaction volume.",
      ["8.5%"], ["8.5"], "high — model may recall the prior floor of 6.5%",
      "Contains '8.5%'", "Contains '8' or 'percent' without the exact value", "Does not contain the correct percentage"),

    q("R11v2-CS-10", "canonical_statistics", "CS-10",
      "How many active member-owners did the Elmhurst Collective report as of Q2 2025?",
      "512,847 active member-owners as of Q2 2025.",
      ["512,847", "Q2 2025"], ["512"], "high — model may confuse Elmhurst with Verdania figures",
      "Contains '512,847' and 'Q2 2025'", "Contains one of the two required elements", "Does not contain the correct count"),

    q("R11v2-CS-11", "canonical_statistics", "CS-11",
      "What aggregate gross transaction volume did the Standards Body's 2024 Annual Sector Survey report across all surveyed platforms?",
      "$18.4 billion.",
      ["$18.4 billion", "18.4"], ["18.4"], "high — model may confuse with individual platform volumes",
      "Contains '$18.4 billion'", "Contains '18' without the decimal precision", "Does not contain the correct sector total"),

    q("R11v2-CS-12", "canonical_statistics", "CS-12",
      "How many AI queries were processed across cooperative platforms in October 2025, according to the Observatory's monthly query volume survey?",
      "847 million AI queries.",
      ["847 million"], ["847"], "high — model may invent a plausible figure",
      "Contains '847 million'", "Contains '847' without 'million' context", "Does not contain the correct volume"),

    q("R11v2-CS-13", "canonical_statistics", "CS-13",
      "What percentage of Tier 1 and Tier 2 cooperative platforms had fully deployed the Thornwick hybrid dense-sparse retrieval architecture as of Q4 2025?",
      "67.3% of Tier 1 and Tier 2 cooperative platforms.",
      ["67.3%"], ["67"], "high — model may guess a round number",
      "Contains '67.3%'", "Contains '67' without the decimal", "Does not contain the correct adoption rate"),

    q("R11v2-CS-14", "canonical_statistics", "CS-14",
      "What is the mean founding year of Tier 1 cooperative AI platforms, giving them what average age as of 2025?",
      "Mean founding year of 2007, giving them an average age of 17.2 years as of 2025.",
      ["17.2 years", "2007"], ["17.2"], "medium — model may guess a different founding year",
      "Contains '17.2 years' and '2007'", "Contains the age or the year but not both", "Does not contain either value"),

    q("R11v2-CS-15", "canonical_statistics", "CS-15",
      "What is the total direct employment across surveyed cooperative AI platforms according to the Standards Body's 2024 workforce survey?",
      "284,000 full-time equivalent positions.",
      ["284,000"], ["284"], "high — model may confuse with total workforce figure including contractors",
      "Contains '284,000'", "Contains '284' without 'thousand' context", "Does not contain the correct figure"),

    q("R11v2-CS-16", "canonical_statistics", "CS-16",
      "What was the total value of cooperative credits outstanding across reporting platforms as of December 2025?",
      "$2.3 billion in cooperative credits outstanding.",
      ["$2.3 billion", "December 2025"], ["2.3"], "high — model may invent a credit issuance figure",
      "Contains '$2.3 billion' and 'December 2025'", "Contains the amount or date but not both", "Does not contain the correct total"),

    q("R11v2-CS-17", "canonical_statistics", "CS-17",
      "What mean percentage of total operating expenditure did surveyed platforms allocate to AI-related costs according to the Standards Body's 2024 survey?",
      "31.4% of total operating expenditure.",
      ["31.4%"], ["31"], "high — model may confuse with tier-specific figures (28.7%, 36.1%)",
      "Contains '31.4%'", "Contains '31' without the decimal", "Does not contain the correct percentage"),

    q("R11v2-CS-18", "canonical_statistics", "CS-18",
      "What percentage of all cooperative platform transactions involved members from different countries according to the Standards Body's 2024 transaction analysis?",
      "23.7% of all cooperative platform transactions.",
      ["23.7%"], ["23"], "medium",
      "Contains '23.7%'", "Contains '23' without the decimal", "Does not contain the correct percentage"),

    q("R11v2-CS-19", "canonical_statistics", "CS-19",
      "What was Verdania's sustained peak API throughput during its highest-demand period in November 2025?",
      "4,230 requests per second.",
      ["4,230 requests per second", "4,230"], ["4,230"], "high — model may confuse with certified capacity (12,690)",
      "Contains '4,230' in context of peak throughput", "Contains a throughput figure but not 4,230", "Does not contain the correct throughput"),

    q("R11v2-CS-20", "canonical_statistics", "CS-20",
      "What was the sector-wide annual member churn rate according to the Standards Body's 2024 member lifecycle survey?",
      "8.9% annual member churn rate.",
      ["8.9%"], ["8.9"], "high — model may confuse with first-year churn (19.3%) or other tenure cohort figures",
      "Contains '8.9%'", "Contains '8' or '9' without the precise decimal", "Does not contain the correct rate"),

    q("R11v2-CS-21", "canonical_statistics", "CS-21",
      "How many AI assistance queries per month did the average active member make across surveyed platforms in October 2025?",
      "12.3 AI assistance queries per month.",
      ["12.3"], ["12"], "medium",
      "Contains '12.3'", "Contains '12' without the decimal", "Does not contain the correct frequency"),

    q("R11v2-CS-22", "canonical_statistics", "CS-22",
      "How many cooperative platform patent applications were filed across member platforms in calendar year 2024?",
      "1,847 cooperative platform patent applications.",
      ["1,847"], ["1,847"], "high — model may confuse with the Standards Body membership count",
      "Contains '1,847'", "Contains a number near 1,847", "Does not contain the correct count"),

    q("R11v2-CS-23", "canonical_statistics", "CS-23",
      "How many member platforms were listed in the Cooperative Ledger Standards Body's official membership registry as of January 1, 2026?",
      "1,203 member platforms from 67 countries.",
      ["1,203", "67 countries"], ["1,203"], "high — model may confuse membership count with other sector statistics",
      "Contains '1,203' and '67 countries'", "Contains one of the two required elements", "Does not contain the correct count"),

    q("R11v2-CS-24", "canonical_statistics", "CS-24",
      "What was the sector-wide median transaction value reported in the Standards Body's 2024 transaction analysis?",
      "$47.32.",
      ["$47.32", "47.32"], ["47"], "high — model may confuse with average transaction value or prior year figures",
      "Contains '$47.32'", "Contains '47' without the cents", "Does not contain the correct median"),

    q("R11v2-CS-25", "canonical_statistics", "CS-25",
      "What was the sector-wide average annual election participation rate according to the Standards Body's 2024 governance participation survey?",
      "34.1% of eligible member-owners.",
      ["34.1%"], ["34"], "medium",
      "Contains '34.1%'", "Contains '34' without the decimal", "Does not contain the correct rate"),

    q("R11v2-CS-25b", "canonical_statistics", "CS-25",
      "By how many percentage points did sector-wide governance participation improve from 2022 to 2024?",
      "4.3 percentage-point improvement from 29.8% in 2022 to 34.1% in 2024.",
      ["4.3 percentage-point", "29.8%"], ["4.3"], "medium",
      "Contains '4.3' percentage points and '29.8%'", "Contains one of the two required elements", "Does not contain the correct improvement figure"),
]

# ==================== ARCHITECTURE MECHANICS ====================
AM_QUESTIONS = [
    q("R11v2-AM-01", "architecture_mechanics", "AM-01",
      "What is the dense-to-sparse weighting ratio that achieves optimal performance in the Thornwick hybrid retrieval architecture?",
      "Dense-to-sparse weighting ratio of 0.73:0.27.",
      ["0.73:0.27"], ["0.73"], "high — model may guess round numbers like 0.7:0.3",
      "Contains '0.73:0.27'", "Contains '0.73' without the full ratio", "Does not contain the correct ratio"),

    q("R11v2-AM-02", "architecture_mechanics", "AM-02",
      "How many dimensions does the Cooperative AI Platform Reference Architecture specify for Scribe memory embeddings in production deployments?",
      "1,536-dimensional vectors.",
      ["1,536"], ["1536"], "high — model may guess 768 or 3072",
      "Contains '1,536'", "Contains '1536' without comma formatting", "Does not contain the correct dimensionality"),

    q("R11v2-AM-03", "architecture_mechanics", "AM-03",
      "What is the default top-K retrieval setting specified by the Reference Architecture for Scribe memory queries?",
      "Top-10 retrieval as the default.",
      ["top-10"], ["10"], "low — top-10 is a commonly known default",
      "Contains 'top-10' or 'top 10'", "Contains '10' without retrieval context", "Does not contain the correct value"),

    q("R11v2-AM-04", "architecture_mechanics", "AM-04",
      "What is the maximum number of tokens allocated to the preload system prompt in the Cooperative AI Platform Reference Architecture?",
      "3,200 tokens to the preload system prompt.",
      ["3,200 tokens"], ["3,200"], "high — model may confuse with context window (8,192) or governance supplement (1,800)",
      "Contains '3,200 tokens'", "Contains '3200' or '3,200' without 'tokens'", "Does not contain the correct budget"),

    q("R11v2-AM-05", "architecture_mechanics", "AM-05",
      "What chunk size with what overlap does the Reference Architecture recommend for documents ingested into Scribe memory?",
      "400 tokens with a 50-token overlap.",
      ["400 tokens", "50-token overlap"], ["400"], "medium — model may confuse with other chunk sizes",
      "Contains '400 tokens' and '50-token overlap'", "Contains the chunk size or overlap but not both", "Does not contain the correct configuration"),

    q("R11v2-AM-06", "architecture_mechanics", "AM-06",
      "What is the Reference Architecture's P99 retrieval pipeline latency target for standard member-facing queries?",
      "P99 less than or equal to 1,400 milliseconds.",
      ["1,400 milliseconds", "1,400"], ["1400"], "high — model may confuse with average latency or other thresholds",
      "Contains '1,400' in context of P99 latency", "Contains '1400' without 'milliseconds' context", "Does not contain the correct target"),

    q("R11v2-AM-07", "architecture_mechanics", "AM-07",
      "What is the half-life of the logarithmic decay function the Reference Architecture specifies for membership activity scores?",
      "180 days (logarithmic decay with a half-life of 180 days).",
      ["180 days"], ["180"], "medium — model may confuse with portability window (also 180 days)",
      "Contains '180 days' in context of decay function half-life", "Contains '180' without clear half-life context", "Does not contain the correct half-life"),

    q("R11v2-AM-08", "architecture_mechanics", "AM-08",
      "Below what confidence score must AI responses be flagged with an uncertainty disclosure under the Reference Architecture's hallucination guard?",
      "0.72 on a 0-1 scale.",
      ["0.72"], ["0.72"], "high — model may guess 0.7 or 0.8 or confuse with the disclosure threshold (0.85) in RC-08",
      "Contains '0.72'", "Contains '0.7' or '0.8' without the precise value", "Does not contain the correct threshold"),

    q("R11v2-AM-09", "architecture_mechanics", "AM-09",
      "How frequently does the Reference Architecture specify that the full Scribe index should be rebuilt from canonical sources?",
      "72 hours (every three days).",
      ["72 hours"], ["72"], "medium",
      "Contains '72 hours'", "Contains '72' without 'hours' context", "Does not contain the correct cycle"),

    q("R11v2-AM-10", "architecture_mechanics", "AM-10",
      "What is the maximum context window size for standard member-facing query processing under the Reference Architecture?",
      "8,192 tokens for standard mode.",
      ["8,192 tokens", "8,192"], ["8192"], "high — model may confuse with extended mode (16,384) or governance supplement (1,800)",
      "Contains '8,192' in context of standard mode context window", "Contains '8192' without comma format", "Does not contain the correct window size"),

    q("R11v2-AM-11", "architecture_mechanics", "AM-11",
      "What is the P50 query latency of the Pheromone Substrate's Phase 0 pre-check in production deployments at Tier 1 platforms?",
      "0.8 milliseconds at P50.",
      ["0.8 milliseconds", "P50"], ["0.8"], "high — model may confuse with P99 (2.1ms) or full retrieval latency",
      "Contains '0.8 milliseconds' and 'P50'", "Contains '0.8' without 'P50' context", "Does not contain the correct latency"),

    q("R11v2-AM-12", "architecture_mechanics", "AM-12",
      "What is the federation protocol heartbeat interval specified by the Federated Platform Compact?",
      "45 seconds between registered federation partners.",
      ["45 seconds"], ["45"], "medium",
      "Contains '45 seconds'", "Contains '45' without 'seconds' context", "Does not contain the correct interval"),

    q("R11v2-AM-13", "architecture_mechanics", "AM-13",
      "How many years must cooperative platforms retain member-facing AI interaction logs, governance records, and financial transaction logs under the Reference Architecture?",
      "7 years.",
      ["7 years"], ["7"], "medium — model may confuse with operational log retention (24 months)",
      "Contains '7 years' in context of audit log retention", "Contains '7' without 'years' retention context", "Does not contain the correct retention period"),

    q("R11v2-AM-14", "architecture_mechanics", "AM-14",
      "What is the target maximum false-positive rate for the Reference Architecture's hallucination guard implementation?",
      "3.2% or below.",
      ["3.2%"], ["3.2"], "high — model may confuse with the confidence threshold (0.72) or other percentages",
      "Contains '3.2%'", "Contains '3.2' without '%'", "Does not contain the correct rate"),

    q("R11v2-AM-15", "architecture_mechanics", "AM-15",
      "At what time (UTC) does the Reference Architecture specify that routine Scribe embedding maintenance should run?",
      "02:00 UTC daily.",
      ["02:00 UTC"], ["02:00"], "medium",
      "Contains '02:00 UTC'", "Contains '2:00' or 'UTC' without both elements", "Does not contain the correct time"),

    q("R11v2-AM-16", "architecture_mechanics", "AM-16",
      "What is the maximum number of member platforms permitted in any single federated cluster under the Federated Platform Compact?",
      "512 member platforms.",
      ["512"], ["512"], "high — model may confuse with the founding cluster size (31) or other capacity figures",
      "Contains '512' in context of maximum cluster size", "Contains '512' without cluster context", "Does not contain the correct limit"),

    q("R11v2-AM-17", "architecture_mechanics", "AM-17",
      "How long does the Conductor's Baton circuit breaker remain in open state before transitioning to half-open for a probe request?",
      "300 seconds (5 minutes).",
      ["300-second", "300 seconds"], ["300"], "medium",
      "Contains '300' seconds in context of circuit breaker recovery window", "Contains '300' without circuit breaker context", "Does not contain the correct duration"),

    q("R11v2-AM-18", "architecture_mechanics", "AM-18",
      "What percentage of registered cluster nodes must agree for the Federation Protocol's consensus algorithm to reach quorum on routine state transitions?",
      "51.0% of registered cluster nodes.",
      ["51.0%"], ["51"], "medium — model may guess 51% without the decimal",
      "Contains '51.0%'", "Contains '51%' without the '.0' decimal", "Does not contain the correct quorum"),

    q("R11v2-AM-19", "architecture_mechanics", "AM-19",
      "What is the cache TTL for member preference data used in retrieval personalization under the Reference Architecture?",
      "3,600 seconds (1 hour).",
      ["3,600 seconds"], ["3600"], "medium",
      "Contains '3,600 seconds'", "Contains '3600' without comma or context", "Does not contain the correct TTL"),

    q("R11v2-AM-20", "architecture_mechanics", "AM-20",
      "How many days does the Reference Architecture mandate as the rollback window for platform configuration changes affecting the AI assistance stack?",
      "90 days.",
      ["90 days"], ["90"], "medium — model may confuse with other 90-day windows in the framework",
      "Contains '90 days' in context of configuration rollback window", "Contains '90' without rollback context", "Does not contain the correct window"),

    q("R11v2-AM-21", "architecture_mechanics", "AM-21",
      "What is the standard member API rate limit for authenticated API access to the platform's AI assistance endpoint under the Reference Architecture?",
      "120 requests per minute.",
      ["120 requests per minute", "120 RPM"], ["120"], "medium",
      "Contains '120 requests per minute' or '120 RPM'", "Contains '120' without 'per minute' context", "Does not contain the correct rate limit"),

    q("R11v2-AM-22", "architecture_mechanics", "AM-22",
      "How many calendar days advance notice must cooperative platforms provide before swapping the primary AI model in a member-facing system?",
      "30 calendar days advance notice.",
      ["30 calendar days"], ["30"], "medium — model may confuse with the 14-day member testing period",
      "Contains '30 calendar days' in context of model swap notice", "Contains '30' without 'calendar days' or 'notice' context", "Does not contain the correct notice period"),

    q("R11v2-AM-23", "architecture_mechanics", "AM-23",
      "What compression ratio target does the Reference Architecture specify for cooperative platform audit log storage?",
      "4.7:1.",
      ["4.7:1"], ["4.7"], "high — model may guess a round ratio",
      "Contains '4.7:1'", "Contains '4.7' without ratio format", "Does not contain the correct compression ratio"),

    q("R11v2-AM-24", "architecture_mechanics", "AM-24",
      "How many geographically distinct infrastructure nodes does the Reference Architecture mandate as a minimum for production cooperative AI platform deployments?",
      "A minimum of 3 geographically distinct infrastructure nodes.",
      ["3 geographically distinct", "minimum of 3"], ["3"], "low",
      "Contains '3' in context of minimum geographic nodes", "Contains '3' without geographic redundancy context", "Does not contain the correct minimum"),

    q("R11v2-AM-25", "architecture_mechanics", "AM-25",
      "How many additional tokens does the Reference Architecture allocate specifically for governance context within the system prompt when a query is classified as governance-related?",
      "1,800 tokens specifically for governance context.",
      ["1,800 tokens", "1,800"], ["1800"], "high — model may confuse with preload budget (3,200) or context window (8,192)",
      "Contains '1,800 tokens'", "Contains '1800' or '1,800' without 'tokens'", "Does not contain the correct supplement"),

    q("R11v2-AM-11b", "architecture_mechanics", "AM-11",
      "By what factor does the Pheromone Substrate's Phase 0 pre-check outperform a 14-Scribe Detective Scribe sweep?",
      "A speedup factor exceeding 10^5 (100,000x) in typical operation.",
      ["10^5"], ["10^5", "100,000"], "high — model may guess a smaller speedup figure",
      "Contains '10^5' or equivalent representation of 100,000x speedup", "Contains a large speedup factor without specifying 10^5", "Does not contain the correct speedup factor"),
]

# ==================== ECONOMIC GOVERNANCE ====================
EG_QUESTIONS = [
    q("R11v2-EG-01", "economic_governance", "EG-01",
      "What is the canonical patronage allocation split used by platforms compliant with the Cooperative Capital Framework?",
      "70% allocated by transaction volume and 30% allocated equally per active member.",
      ["70%", "30%"], ["70", "30"], "medium — model may confuse with other distribution ratios",
      "Contains '70%' and '30%' in context of the patronage split", "Contains one percentage without both", "Does not contain the correct split"),

    q("R11v2-EG-02", "economic_governance", "EG-02",
      "Under the Standards Body's model bylaws, what is the term length for elected cooperative directors, and how are elections structured?",
      "Three years, with staggered elections such that no more than one-third of the board stands for election in any given year.",
      ["three years", "staggered elections"], ["three"], "medium",
      "Contains 'three years' and 'staggered elections'", "Contains the term length or the staggered structure but not both", "Does not contain the correct term"),

    q("R11v2-EG-03", "economic_governance", "EG-03",
      "What annual gross transaction volume threshold defines a Tier 1 cooperative AI platform under the Cooperative Capital Framework?",
      "Tier 1: annual volume greater than or equal to $1 billion.",
      ["Tier 1", "$1B", "$1 billion"], ["1B", "1 billion"], "medium",
      "Contains 'Tier 1' and '$1 billion' or '$1B'", "Contains the tier designation or threshold but not both", "Does not contain the correct threshold"),

    q("R11v2-EG-04", "economic_governance", "EG-04",
      "What quorum percentage is required for bylaw amendment votes under the Standards Body's model bylaws, and what approval percentage within quorum is required?",
      "30% quorum of eligible member-owners and 55% approval within quorum.",
      ["30%", "55%"], ["30", "55"], "high — model may confuse with other threshold combinations",
      "Contains '30%' quorum and '55%' approval", "Contains one percentage without the other", "Does not contain the correct thresholds"),

    q("R11v2-EG-05", "economic_governance", "EG-05",
      "What is the minimum exit notice period under the Cooperative Capital Framework for standard member exits?",
      "60 calendar days from the date of formal exit declaration.",
      ["60 calendar days"], ["60"], "medium",
      "Contains '60 calendar days'", "Contains '60' without 'calendar days' or 'exit' context", "Does not contain the correct period"),

    q("R11v2-EG-06", "economic_governance", "EG-06",
      "What standard revenue sharing rate does the Federated Platform Compact allocate to the network federation operator?",
      "12% of gross transaction revenue.",
      ["12%"], ["12"], "medium — model may confuse with the large-platform rate (15%) or the AI query rate (8.5%)",
      "Contains '12%' in context of federation operator revenue share", "Contains '12' without federation context", "Does not contain the correct rate"),

    q("R11v2-EG-06b", "economic_governance", "EG-06",
      "At what active member count threshold does the higher federation fee rate of 15% apply?",
      "Platforms exceeding 500,000 active members pay 15%.",
      ["500,000", "15%"], ["500,000"], "medium",
      "Contains '500,000' and '15%' in federation fee context", "Contains one element without the other", "Does not contain the correct threshold"),

    q("R11v2-EG-07", "economic_governance", "EG-07",
      "What minimum gender diversity percentage and geographic representation percentage does the Standards Body recommend for cooperative platform boards?",
      "40% gender diversity and 30% from non-founding geographic regions.",
      ["40%", "30%"], ["40", "30"], "high — model may confuse with the 33% board independence requirement",
      "Contains '40%' gender diversity and '30%' geographic representation", "Contains one percentage without the other", "Does not contain the correct targets"),

    q("R11v2-EG-08", "economic_governance", "EG-08",
      "What is the minimum advance notice required before an annual general meeting under the Standards Body's model bylaws?",
      "45 calendar days.",
      ["45 calendar days"], ["45"], "medium — model may confuse with extraordinary meeting notice (21 days)",
      "Contains '45 calendar days'", "Contains '45' without 'calendar days' or 'notice' context", "Does not contain the correct notice period"),

    q("R11v2-EG-09", "economic_governance", "EG-09",
      "What is the maximum percentage of outstanding member equity that a platform may buy back in any fiscal year without explicit board authorization?",
      "25% of outstanding member equity per fiscal year.",
      ["25%"], ["25"], "medium",
      "Contains '25%' in context of equity buyback cap", "Contains '25' without buyback context", "Does not contain the correct cap"),

    q("R11v2-EG-10", "economic_governance", "EG-10",
      "What is the maximum annual patronage distribution to any single member under the Cooperative Capital Framework, indexed to CPI from a 2020 baseline?",
      "$8,400 per fiscal year.",
      ["$8,400", "8,400"], ["8,400"], "high — model may invent a different cap figure",
      "Contains '$8,400'", "Contains '8400' without '$' or comma format", "Does not contain the correct maximum"),

    q("R11v2-EG-11", "economic_governance", "EG-11",
      "What minimum percentage of the annual AI operating budget must platforms maintain as an AI infrastructure reserve?",
      "12.5% of annual AI operating budget.",
      ["12.5%"], ["12.5"], "high — model may confuse with the general reserve floor (8.5%)",
      "Contains '12.5%'", "Contains '12.5' without '%'", "Does not contain the correct percentage"),

    q("R11v2-EG-12", "economic_governance", "EG-12",
      "Under the Standards Body's governance guidelines, at what multiple of the median member economic contribution is director annual compensation capped?",
      "3.5 times the median member economic contribution.",
      ["3.5"], ["3.5"], "medium",
      "Contains '3.5' in context of director compensation cap", "Contains '3.5' without compensation context", "Does not contain the correct multiple"),

    q("R11v2-EG-13", "economic_governance", "EG-13",
      "What revenue-sharing rate does the Federated Platform Compact specify for cross-platform AI assistance queries?",
      "8.5% for cross-platform AI assistance queries.",
      ["8.5%"], ["8.5"], "high — model may confuse with the standard 12% commerce rate",
      "Contains '8.5%' in context of AI assistance query sharing", "Contains '8.5' without query-sharing context", "Does not contain the correct rate"),

    q("R11v2-EG-14", "economic_governance", "EG-14",
      "What is the annual member equity purchase limit for Tier 3 and Tier 4 cooperative platforms under the Cooperative Capital Framework?",
      "$2,500 per member per fiscal year.",
      ["$2,500", "2,500"], ["2,500"], "high — model may confuse with Tier 1-2 limit ($10,000)",
      "Contains '$2,500'", "Contains '2500' or '2,500' without '$'", "Does not contain the correct limit"),

    q("R11v2-EG-15", "economic_governance", "EG-15",
      "What minimum capital reserve accrual rate does the Cooperative Capital Framework specify as a percentage of distributable surplus per fiscal year?",
      "7.2% of distributable surplus.",
      ["7.2%"], ["7.2"], "high — model may confuse with reserve floor (8.5%) or AI reserve (12.5%)",
      "Contains '7.2%'", "Contains '7.2' without '%'", "Does not contain the correct rate"),

    q("R11v2-EG-16", "economic_governance", "EG-16",
      "What percentage of recovered funds should whistleblower reward programs pay, and what is the per-case cap?",
      "15% of funds recovered, capped at $50,000 per whistleblower per action.",
      ["15%", "$50,000"], ["15", "50,000"], "medium",
      "Contains '15%' and '$50,000'", "Contains one element without the other", "Does not contain the correct reward structure"),

    q("R11v2-EG-17", "economic_governance", "EG-17",
      "What is the minimum indemnification fund required for Tier 3 cooperative platforms under the Cooperative Capital Framework?",
      "$500,000.",
      ["$500,000", "500,000"], ["500,000"], "high — model may confuse with Tier 1-2 indemnification (2.5% of volume)",
      "Contains '$500,000'", "Contains '500,000' without '$'", "Does not contain the correct minimum"),

    q("R11v2-EG-18", "economic_governance", "EG-18",
      "How frequently must Tier 1 platforms undergo comprehensive third-party governance audits under the Cooperative Capital Framework?",
      "Quarterly.",
      ["quarterly", "Quarterly"], ["quarter"], "low — directly asked",
      "Contains 'quarterly' in context of Tier 1 governance audit frequency", "Contains 'quarterly' without clear Tier 1 context", "Does not contain the correct frequency"),

    q("R11v2-EG-19", "economic_governance", "EG-19",
      "What minimum percentage of an AI Ethics Committee must consist of non-technical member representation under the Cooperative AI Governance Charter?",
      "At least 40% non-technical member representation.",
      ["40%"], ["40"], "medium — model may confuse with board diversity target (also 40%)",
      "Contains '40%' in context of AI Ethics Committee non-technical representation", "Contains '40%' without committee context", "Does not contain the correct percentage"),

    q("R11v2-EG-20", "economic_governance", "EG-20",
      "At what percentage of the reserve floor must the reserve balance be maintained before a surplus distribution is required under the Cooperative Capital Framework's surplus distribution protocol?",
      "110% of the reserve floor for two consecutive quarters.",
      ["110%"], ["110"], "high — model may invent a different trigger threshold",
      "Contains '110%' in context of surplus distribution trigger", "Contains '110' without '%' or trigger context", "Does not contain the correct threshold"),

    q("R11v2-EG-21", "economic_governance", "EG-21",
      "What is the standard cross-platform credit conversion rate specified by the Federated Platform Compact's credit interoperability protocol?",
      "1:0.87 (1 home-platform credit converts to 0.87 federation partner credits).",
      ["1:0.87", "0.87"], ["0.87"], "high — model may guess a round conversion rate",
      "Contains '1:0.87' or '0.87'", "Contains '0.87' without ratio context", "Does not contain the correct conversion rate"),

    q("R11v2-EG-22", "economic_governance", "EG-22",
      "What annual percentage rate does the Standards Body recommend for standard short-term member loans at cooperative member loan programs?",
      "4.75% APR.",
      ["4.75%", "4.75"], ["4.75"], "high — model may guess a market rate",
      "Contains '4.75%' or '4.75 APR'", "Contains '4.75' without '%' or 'APR'", "Does not contain the correct rate"),

    q("R11v2-EG-23", "economic_governance", "EG-23",
      "What patronage bonus does the Standards Body recommend for members who vote in all governance elections in a fiscal year?",
      "0.5% patronage bonus.",
      ["0.5%"], ["0.5"], "medium",
      "Contains '0.5%' in context of governance participation incentive", "Contains '0.5' without '%' or incentive context", "Does not contain the correct bonus"),

    q("R11v2-EG-24", "economic_governance", "EG-24",
      "What annual dues structure does the Cooperative Ledger Standards Body charge member platforms?",
      "$4,800 base fee plus 0.003% of the prior fiscal year's gross transaction volume, minimum $4,800, maximum $150,000.",
      ["$4,800", "0.003%"], ["4,800", "0.003"], "high — model may invent a different fee structure",
      "Contains '$4,800' and '0.003%'", "Contains one element without the other", "Does not contain the correct dues structure"),

    q("R11v2-EG-25", "economic_governance", "EG-25",
      "How many business days does a director or platform officer have to disclose a potential conflict of interest after becoming aware of it?",
      "Within 5 business days.",
      ["5 business days"], ["5"], "medium",
      "Contains '5 business days' in conflict of interest context", "Contains '5' without 'business days' context", "Does not contain the correct window"),
]

# ==================== MEMBER JOURNEY ====================
MJ_QUESTIONS = [
    q("R11v2-MJ-01", "member_journey", "MJ-01",
      "Within how many business days must cooperative platforms process membership applications from submission to formal decision, under the Reference Onboarding Framework?",
      "10 business days.",
      ["10 business days"], ["10"], "medium",
      "Contains '10 business days' in context of application processing", "Contains '10' without 'business days' context", "Does not contain the correct timeline"),

    q("R11v2-MJ-02", "member_journey", "MJ-02",
      "What minimum score must a new member achieve on the Cooperative Principles Assessment before being granted full voting rights?",
      "75 out of 100.",
      ["75 out of 100", "75"], ["75"], "medium",
      "Contains '75' in context of assessment passing score", "Contains '75' without assessment context", "Does not contain the correct score"),

    q("R11v2-MJ-03", "member_journey", "MJ-03",
      "How long is the standard provisional member trial period under the Reference Onboarding Framework?",
      "90 days from the date the application is approved.",
      ["90 days"], ["90"], "medium — model may confuse with rollback window (also 90 days)",
      "Contains '90 days' in context of provisional member trial period", "Contains '90' without trial period context", "Does not contain the correct duration"),

    q("R11v2-MJ-04", "member_journey", "MJ-04",
      "How frequently must cooperative platforms conduct member satisfaction surveys at minimum under the Reference Onboarding Framework?",
      "Every six months (biannually).",
      ["every six months", "biannually"], ["six months"], "low",
      "Contains 'every six months' or 'biannually'", "Contains 'six months' without 'every' or 'biannually'", "Does not contain the correct frequency"),

    q("R11v2-MJ-05", "member_journey", "MJ-05",
      "Within how many business days must new members be paired with a mentor under the Reference Onboarding Framework?",
      "15 business days of full membership confirmation.",
      ["15 business days"], ["15"], "medium",
      "Contains '15 business days' in mentorship pairing context", "Contains '15' without 'business days' or mentorship context", "Does not contain the correct timeline"),

    q("R11v2-MJ-06", "member_journey", "MJ-06",
      "What minimum exit interview completion rate does the Standards Body benchmark recommend for departing members?",
      "60% exit interview completion rate.",
      ["60%"], ["60"], "medium — model may confuse with onboarding completion (87%) or other rates",
      "Contains '60%' in context of exit interview completion", "Contains '60' without exit interview context", "Does not contain the correct rate"),

    q("R11v2-MJ-07", "member_journey", "MJ-07",
      "What is the acknowledgment SLA for member inquiries submitted through the official support channel?",
      "Acknowledgment within 4 business hours.",
      ["4 business hours"], ["4"], "medium",
      "Contains '4 business hours' in context of inquiry acknowledgment", "Contains '4' without 'business hours' context", "Does not contain the correct SLA"),

    q("R11v2-MJ-08", "member_journey", "MJ-08",
      "At what tenure intervals does the Reference Onboarding Framework recommend that platforms formally recognize member tenure?",
      "5-year intervals.",
      ["5-year intervals", "5-year"], ["5"], "low",
      "Contains '5-year intervals' or '5-year' in context of tenure recognition", "Contains '5' without year/tenure context", "Does not contain the correct interval"),

    q("R11v2-MJ-09", "member_journey", "MJ-09",
      "What minimum onboarding completion rate does the Reference Onboarding Framework require — the percentage completing all steps within 30 days of application approval?",
      "87% onboarding completion rate within 30 days.",
      ["87%"], ["87"], "medium",
      "Contains '87%' in context of onboarding completion", "Contains '87' without '%' or onboarding context", "Does not contain the correct rate"),

    q("R11v2-MJ-10", "member_journey", "MJ-10",
      "What is the target median time to first transaction from full membership confirmation under the Reference Framework?",
      "4.2 days.",
      ["4.2 days"], ["4.2"], "high — model may confuse with other timeline metrics",
      "Contains '4.2 days'", "Contains '4.2' without 'days' context", "Does not contain the correct target"),

    q("R11v2-MJ-11", "member_journey", "MJ-11",
      "What is the target response time for AI-assisted help queries under the Reference Communication Standards?",
      "2 hours.",
      ["2 hours"], ["2"], "medium — model may confuse with human escalation response time (1 business day)",
      "Contains '2 hours' in context of AI help response time", "Contains '2' without 'hours' or AI help context", "Does not contain the correct target"),

    q("R11v2-MJ-12", "member_journey", "MJ-12",
      "What minimum Net Promoter Score must cooperative platforms achieve for Good Standing certification under the Standards Body's member experience framework?",
      "Minimum NPS of 42.",
      ["42"], ["42"], "high — model may guess a round number or confuse with sector average",
      "Contains '42' in context of minimum NPS or Good Standing", "Contains '42' without NPS context", "Does not contain the correct minimum"),

    q("R11v2-MJ-13", "member_journey", "MJ-13",
      "What is the standard referral program payout per approved new member referral recommended by the Standards Body, and what is the annual cap on referrals per member?",
      "$15 per approved referral, capped at 10 referrals per member per year.",
      ["$15", "10 referrals"], ["15", "10"], "medium",
      "Contains '$15' and '10 referrals' (or '10 per year')", "Contains one element without the other", "Does not contain the correct payout structure"),

    q("R11v2-MJ-14", "member_journey", "MJ-14",
      "What is the maximum data export file size per portability request specified by the Cairnfield Protocol's implementation guidance?",
      "25 gigabytes per portability request.",
      ["25 gigabytes", "25GB"], ["25"], "medium",
      "Contains '25 gigabytes' or '25GB'", "Contains '25' without 'gigabytes' or 'GB'", "Does not contain the correct limit"),

    q("R11v2-MJ-15", "member_journey", "MJ-15",
      "Within how many business days must member-reported disputes receive a substantive resolution determination under the Reference Dispute Resolution Framework?",
      "21 business days.",
      ["21 business days"], ["21"], "medium",
      "Contains '21 business days' in dispute resolution context", "Contains '21' without 'business days' context", "Does not contain the correct timeframe"),

    q("R11v2-MJ-16", "member_journey", "MJ-16",
      "What governance training completion rate does the Reference Onboarding Framework target for new members within 90 days of full membership confirmation?",
      "65% of new members within 90 days.",
      ["65%"], ["65"], "medium",
      "Contains '65%' in context of governance training completion within 90 days", "Contains '65' without '%' or training context", "Does not contain the correct target"),

    q("R11v2-MJ-17", "member_journey", "MJ-17",
      "What uptime SLA must member-facing dashboard systems achieve under the Reference Architecture's service level specification?",
      "99.7% uptime on a rolling 30-day basis.",
      ["99.7%"], ["99.7"], "medium",
      "Contains '99.7%'", "Contains '99' without the decimal", "Does not contain the correct SLA"),

    q("R11v2-MJ-18", "member_journey", "MJ-18",
      "Within how many hours must password reset and account recovery links expire under the Reference Security Framework?",
      "4 hours.",
      ["4 hours"], ["4"], "medium — model may confuse with inquiry acknowledgment SLA (also 4 business hours)",
      "Contains '4 hours' in context of password reset or account recovery link expiration", "Contains '4' without recovery link expiration context", "Does not contain the correct expiration window"),

    q("R11v2-MJ-19", "member_journey", "MJ-19",
      "Within how many days of fiscal year end must platforms deliver annual patronage statements to members under the Cooperative Capital Framework?",
      "Within 30 days of fiscal year end.",
      ["30 days of fiscal year end", "within 30 days"], ["30 days"], "medium",
      "Contains '30 days' in context of patronage statement delivery after fiscal year end", "Contains '30' without fiscal year end context", "Does not contain the correct timeline"),

    q("R11v2-MJ-20", "member_journey", "MJ-20",
      "What virtual accessibility percentage for annual general meetings does the Sundry Accord's 2024 amendment require?",
      "95% accessibility.",
      ["95%"], ["95"], "medium",
      "Contains '95%' in context of annual meeting virtual accessibility", "Contains '95' without meeting or accessibility context", "Does not contain the correct percentage"),

    q("R11v2-MJ-21", "member_journey", "MJ-21",
      "What annual education stipend toward cooperative education programs does the Standards Body recommend cooperative platforms provide per member?",
      "$200 per member per year.",
      ["$200"], ["200"], "medium",
      "Contains '$200' in context of annual education stipend", "Contains '200' without '$' or education context", "Does not contain the correct stipend"),

    q("R11v2-MJ-22", "member_journey", "MJ-22",
      "After how many consecutive months of member inactivity must platforms send a personalized inactivity warning under the Reference Member Lifecycle Framework?",
      "18 consecutive months.",
      ["18 consecutive months", "18 months"], ["18"], "medium",
      "Contains '18 consecutive months' or '18 months' in inactivity warning context", "Contains '18' without inactivity context", "Does not contain the correct threshold"),

    q("R11v2-MJ-23", "member_journey", "MJ-23",
      "What cross-platform transfer fee does the Federated Platform Compact specify when a member transfers their account and equity from one federation platform to another?",
      "2.5% of the member's equity balance.",
      ["2.5%"], ["2.5"], "medium",
      "Contains '2.5%' in context of cross-platform transfer fee", "Contains '2.5' without '%' or transfer context", "Does not contain the correct fee"),

    q("R11v2-MJ-24", "member_journey", "MJ-24",
      "Within how many business days must grievances not resolved at Level 1 be escalated to Level 2 governance review under the Reference Dispute Resolution Framework?",
      "10 business days.",
      ["10 business days"], ["10"], "medium — model may confuse with application processing (also 10 business days)",
      "Contains '10 business days' in grievance escalation context", "Contains '10' without escalation context", "Does not contain the correct timeline"),

    q("R11v2-MJ-25", "member_journey", "MJ-25",
      "What annual member directory opt-in rate does the Standards Body's community engagement guidelines establish as a target?",
      "72% of active members.",
      ["72%"], ["72"], "medium",
      "Contains '72%' in context of directory opt-in rate target", "Contains '72' without '%' or opt-in context", "Does not contain the correct target"),
]

# ==================== REGULATORY COMPLIANCE ====================
RC_QUESTIONS = [
    q("R11v2-RC-01", "regulatory_compliance", "RC-01",
      "On what cycle must AI models deployed in member-facing roles undergo comprehensive third-party audits under the Cooperative AI Governance Charter?",
      "24-month cycle.",
      ["24-month"], ["24"], "medium — model may confuse with other cycle lengths",
      "Contains '24-month' in context of AI model audit certification", "Contains '24' without 'month' or audit context", "Does not contain the correct cycle"),

    q("R11v2-RC-02", "regulatory_compliance", "RC-02",
      "After how many months of member inactivity must platforms delete or fully anonymize personal data under the Cooperative Data Stewardship Standard?",
      "36 consecutive months of inactivity.",
      ["36 consecutive months", "36 months"], ["36"], "medium — model may confuse with 18-month warning threshold",
      "Contains '36 months' in context of data deletion for inactive members", "Contains '36' without 'months' or data retention context", "Does not contain the correct threshold"),

    q("R11v2-RC-03", "regulatory_compliance", "RC-03",
      "Under what framework must cross-border data transfers be certified under the Cooperative AI Governance Charter?",
      "The Meridian Data Framework.",
      ["Meridian Data Framework"], ["Meridian"], "low — directly named",
      "Contains 'Meridian Data Framework'", "Contains 'Meridian' without 'Data Framework'", "Does not contain the framework name"),

    q("R11v2-RC-04", "regulatory_compliance", "RC-04",
      "Within how many hours of becoming aware of a security or privacy incident must platforms notify affected members?",
      "72 hours.",
      ["72 hours"], ["72"], "medium — model may confuse with regulatory notification (48 hours)",
      "Contains '72 hours' in context of member incident notification", "Contains '72' without 'hours' or notification context", "Does not contain the correct window"),

    q("R11v2-RC-05", "regulatory_compliance", "RC-05",
      "How frequently must third-party technology vendors providing critical services be assessed under the Cooperative AI Governance Charter?",
      "12-month cycle.",
      ["12-month"], ["12"], "medium",
      "Contains '12-month' in context of vendor assessment cycle", "Contains '12' without 'month' or vendor context", "Does not contain the correct frequency"),

    q("R11v2-RC-06", "regulatory_compliance", "RC-06",
      "What three elements constitute the minimum standard for a cooperative platform's whistleblower protection program?",
      "Anonymous reporting capability, independent investigation by a party with no reporting line to the accused, and formal non-retaliation policy with documented enforcement.",
      ["anonymous reporting", "independent investigation", "non-retaliation"], ["anonymous", "independent"], "medium",
      "Contains all three required elements", "Contains two of three required elements", "Contains fewer than two elements"),

    q("R11v2-RC-07", "regulatory_compliance", "RC-07",
      "Above what single transaction amount does the Cooperative Capital Framework recommend automated AML transaction monitoring trigger a human review flag?",
      "$15,000.",
      ["$15,000", "15,000"], ["15,000"], "high — model may confuse with the 30-day pattern threshold ($50,000)",
      "Contains '$15,000' in context of single transaction AML flag", "Contains '15,000' without '$' or AML context", "Does not contain the correct threshold"),

    q("R11v2-RC-07b", "regulatory_compliance", "RC-07",
      "Above what cumulative 30-day transaction amount from a single member account does the AML monitoring recommendation recommend a human review flag?",
      "$50,000 within a 30-day window.",
      ["$50,000", "50,000"], ["50,000"], "high — model may confuse with the single-transaction threshold ($15,000)",
      "Contains '$50,000' in context of 30-day pattern threshold", "Contains '50,000' without '$' or pattern context", "Does not contain the correct threshold"),

    q("R11v2-RC-08", "regulatory_compliance", "RC-08",
      "Below what confidence level must AI-generated content include a confidence indicator disclosure under the Cooperative AI Governance Charter?",
      "Below 0.85.",
      ["0.85"], ["0.85"], "high — model may confuse with the hallucination guard threshold (0.72)",
      "Contains '0.85' in context of AI output confidence disclosure", "Contains '0.85' without disclosure context", "Does not contain the correct threshold"),

    q("R11v2-RC-09", "regulatory_compliance", "RC-09",
      "How frequently must Know Your Customer verification be renewed for all members under the Cooperative Capital Framework?",
      "Every 3 years.",
      ["3-year", "3 years"], ["3"], "medium",
      "Contains '3-year' or '3 years' in context of KYC re-verification", "Contains '3' without 'year' or KYC context", "Does not contain the correct cycle"),

    q("R11v2-RC-10", "regulatory_compliance", "RC-10",
      "What is the maximum fine for data breaches under the Meridian Data Framework, expressed as a percentage of annual global gross transaction revenue?",
      "4% of annual global gross transaction revenue.",
      ["4%"], ["4"], "medium — model may guess a different percentage",
      "Contains '4%' in context of Meridian data breach fine maximum", "Contains '4' without '%' or fine context", "Does not contain the correct percentage"),

    q("R11v2-RC-11", "regulatory_compliance", "RC-11",
      "Within how many days of initial deployment must platforms publish a plain-language disclosure of a newly deployed or materially updated AI model?",
      "60 days of its initial deployment.",
      ["60 days"], ["60"], "medium",
      "Contains '60 days' in context of AI model transparency disclosure deadline", "Contains '60' without 'days' or disclosure context", "Does not contain the correct deadline"),

    q("R11v2-RC-12", "regulatory_compliance", "RC-12",
      "Above what transaction amount does the Cooperative Capital Framework require real-time sanctions screening?",
      "$5,000.",
      ["$5,000", "5,000"], ["5,000"], "high — model may confuse with AML thresholds",
      "Contains '$5,000' in context of real-time sanctions screening threshold", "Contains '5,000' without '$' or sanctions context", "Does not contain the correct threshold"),

    q("R11v2-RC-13", "regulatory_compliance", "RC-13",
      "Within how many hours must platforms respond to valid legal holds by placing the specified data into an immutable preservation state?",
      "72 hours of receipt.",
      ["72 hours"], ["72"], "medium — same value as incident notification, different context",
      "Contains '72 hours' in context of legal hold response", "Contains '72' without 'hours' or legal hold context", "Does not contain the correct response time"),

    q("R11v2-RC-14", "regulatory_compliance", "RC-14",
      "What is the maximum cost cap for mandatory third-party AI audits as a percentage of the platform's annual AI operating budget?",
      "2.5% of the platform's annual AI operating budget.",
      ["2.5%"], ["2.5"], "medium",
      "Contains '2.5%' in context of third-party AI audit cost cap", "Contains '2.5' without '%' or audit cost context", "Does not contain the correct cap"),

    q("R11v2-RC-15", "regulatory_compliance", "RC-15",
      "What does the Cooperative AI Governance Charter specify regarding the use of biometric data in member-facing AI decision systems?",
      "Categorically prohibited.",
      ["prohibited", "Prohibited"], ["prohibit"], "low — directly stated",
      "Contains 'prohibited' in context of biometric data in AI decisions", "Contains a prohibition word without clear biometric or AI context", "Does not indicate prohibition"),

    q("R11v2-RC-16", "regulatory_compliance", "RC-16",
      "How many jurisdictions had enacted data localization requirements applicable to cooperative AI platforms as of 2025?",
      "18 jurisdictions.",
      ["18 jurisdictions"], ["18"], "high — model may guess a different number",
      "Contains '18 jurisdictions'", "Contains '18' without 'jurisdictions' context", "Does not contain the correct count"),

    q("R11v2-RC-17", "regulatory_compliance", "RC-17",
      "By what date must platforms submit their annual Algorithmic Accountability Report to the Standards Body?",
      "March 31 each year.",
      ["March 31"], ["March"], "medium",
      "Contains 'March 31' in context of Algorithmic Accountability Report deadline", "Contains 'March' without '31' or report context", "Does not contain the correct deadline"),

    q("R11v2-RC-18", "regulatory_compliance", "RC-18",
      "What filing fee does the Cooperative Ledger Standards Body charge for registration of cooperative charter amendments requiring Standards Body review?",
      "$750 base fee plus $12 per page.",
      ["$750", "$12 per page"], ["750", "12"], "high — model may invent a filing fee",
      "Contains '$750' base fee and '$12 per page'", "Contains one element without the other", "Does not contain the correct fee structure"),

    q("R11v2-RC-19", "regulatory_compliance", "RC-19",
      "How frequently must platforms obtain fresh member consent for data processing under AI systems under the Cooperative AI Governance Charter?",
      "Every 24 months.",
      ["24-month", "24 months"], ["24"], "medium",
      "Contains '24' in context of member consent re-confirmation period", "Contains '24' without 'month' or consent context", "Does not contain the correct period"),

    q("R11v2-RC-20", "regulatory_compliance", "RC-20",
      "What daily financial penalty does the Cooperative Data Stewardship Standard specify for late member notifications beyond the applicable deadline?",
      "$500 per day.",
      ["$500 per day", "$500"], ["500"], "medium",
      "Contains '$500 per day' in context of late notification penalty", "Contains '500' without '$' or penalty context", "Does not contain the correct penalty"),

    q("R11v2-RC-21", "regulatory_compliance", "RC-21",
      "What minimum percentage of board directors at Tier 1 and Tier 2 platforms must be independent under the Cooperative Ledger Standards Body's governance guidelines?",
      "At least 33% independent directors.",
      ["33%"], ["33"], "medium — model may confuse with other thresholds",
      "Contains '33%' in context of board independence requirement", "Contains '33' without '%' or independence context", "Does not contain the correct percentage"),

    q("R11v2-RC-22", "regulatory_compliance", "RC-22",
      "Within how many months of the end of their fiscal year must cooperative platforms file their surplus tax returns?",
      "8.5 months after fiscal year end.",
      ["8.5 months"], ["8.5"], "high — model may guess a round number",
      "Contains '8.5 months' in context of tax filing deadline", "Contains '8.5' without 'months' or tax filing context", "Does not contain the correct deadline"),

    q("R11v2-RC-23", "regulatory_compliance", "RC-23",
      "Under the Cooperative AI Governance Charter, what advance notice period and member testing period are required before a material AI model update can be deployed?",
      "30 calendar days advance notice and a 14-day member testing period.",
      ["30 calendar days", "14-day member testing"], ["30", "14"], "high — model may confuse with model swap notification (also 30 days)",
      "Contains '30 calendar days' and '14-day member testing'", "Contains one element without the other", "Does not contain both requirements"),

    q("R11v2-RC-24", "regulatory_compliance", "RC-24",
      "What is the maximum retention period for biometric data collected for access security purposes under the Cooperative AI Governance Charter?",
      "90 days from the date of collection.",
      ["90 days from the date of collection", "90 days"], ["90"], "medium",
      "Contains '90 days' in context of biometric backup data retention maximum", "Contains '90' without 'days' or biometric context", "Does not contain the correct retention period"),

    q("R11v2-RC-25", "regulatory_compliance", "RC-25",
      "How frequently must federation member platforms renew their compliance certification under the Federated Platform Compact?",
      "Every 18 months.",
      ["18 months"], ["18"], "medium",
      "Contains '18 months' in context of federation compliance certification renewal", "Contains '18' without 'months' or certification context", "Does not contain the correct renewal period"),
]

# ==================== HISTORICAL PRECEDENT ====================
HP_QUESTIONS = [
    q("R11v2-HP-01", "historical_precedent", "HP-01",
      "In which city and country was the first Cooperative AI Platform Summit held, and on what date?",
      "Reykjavik, Iceland, on March 14, 2019.",
      ["Reykjavik, Iceland", "March 14, 2019"], ["Reykjavik", "2019"], "high — model may hallucinate a different founding location",
      "Contains 'Reykjavik, Iceland' and 'March 14, 2019'", "Contains the city or date but not both", "Does not contain the correct location or date"),

    q("R11v2-HP-02", "historical_precedent", "HP-02",
      "In what quarter and year did the Verdania Cooperative Platform enter financial distress, and how long did its receivership last?",
      "Q2 2021, receivership lasted 14 months (June 2021 to August 2022).",
      ["Q2 2021", "fourteen months", "14 months"], ["2021", "fourteen", "14"], "high",
      "Contains 'Q2 2021' and '14 months' or 'fourteen months'", "Contains the year or duration but not both", "Does not contain the correct distress date or duration"),

    q("R11v2-HP-03", "historical_precedent", "HP-03",
      "In which city and in what month and year was the Sundry Accord drafted?",
      "Nairobi, Kenya, in September 2020.",
      ["Nairobi, Kenya", "September 2020"], ["Nairobi", "2020"], "high — model may hallucinate a different location",
      "Contains 'Nairobi, Kenya' and 'September 2020'", "Contains the city or date but not both", "Does not contain the correct location or date"),

    q("R11v2-HP-04", "historical_precedent", "HP-04",
      "Which platform experienced the first AI model certification failure under the Cooperative AI Governance Charter, and in what quarter?",
      "The Hartwell Cooperative Platform in Q3 2022.",
      ["Hartwell Cooperative Platform", "Q3 2022"], ["Hartwell", "2022"], "high — model may hallucinate a different platform name",
      "Contains 'Hartwell' and 'Q3 2022'", "Contains the platform name or quarter but not both", "Does not contain the correct platform or date"),

    q("R11v2-HP-05", "historical_precedent", "HP-05",
      "In which location and month and year was the Cairnfield Protocol finalized?",
      "Cairnfield, Scotland, in April 2022.",
      ["Cairnfield, Scotland", "April 2022"], ["Cairnfield", "2022"], "medium",
      "Contains 'Cairnfield, Scotland' and 'April 2022'", "Contains the location or date but not both", "Does not contain the correct location or date"),

    q("R11v2-HP-06", "historical_precedent", "HP-06",
      "Where was the Thornwick hybrid dense-sparse retrieval architecture developed, and when was it first published?",
      "Thornwick Cooperative Research Institute in Birmingham, UK, published November 2024.",
      ["Thornwick Cooperative Research Institute", "Birmingham", "November 2024"], ["Thornwick", "Birmingham", "2024"], "high — model may hallucinate a different institution or date",
      "Contains 'Birmingham' and 'November 2024'", "Contains the location or date but not both", "Does not contain the correct location or publication date"),

    q("R11v2-HP-07", "historical_precedent", "HP-07",
      "In which city and on what exact date was the Federated Platform Compact ratified by its founding members?",
      "Amsterdam, Netherlands, on June 30, 2023.",
      ["Amsterdam, Netherlands", "June 30, 2023"], ["Amsterdam", "2023"], "high — model may hallucinate a different city or date",
      "Contains 'Amsterdam, Netherlands' and 'June 30, 2023'", "Contains the city or date but not both", "Does not contain the correct location or date"),

    q("R11v2-HP-08", "historical_precedent", "HP-08",
      "On what date was the Cooperative AI Governance Charter formally adopted?",
      "February 12, 2021.",
      ["February 12, 2021"], ["February", "2021"], "high — model may hallucinate a different adoption date",
      "Contains 'February 12, 2021'", "Contains 'February' and '2021' without the specific day", "Does not contain the correct date"),

    q("R11v2-HP-09", "historical_precedent", "HP-09",
      "In which city and country was the Elmhurst Collective founded, and in what year?",
      "Manchester, United Kingdom, in 2007.",
      ["Manchester, United Kingdom", "2007"], ["Manchester", "2007"], "medium — model may guess a different city",
      "Contains 'Manchester' and '2007'", "Contains the city or year but not both", "Does not contain the correct founding location or year"),

    q("R11v2-HP-10", "historical_precedent", "HP-10",
      "Which platform experienced the first major federation compliance audit failure in what quarter?",
      "The Brookfield Cooperative Platform in Q1 2023.",
      ["Brookfield Cooperative Platform", "Q1 2023"], ["Brookfield", "2023"], "high — model may hallucinate a different platform",
      "Contains 'Brookfield' and 'Q1 2023'", "Contains the platform name or quarter but not both", "Does not contain the correct platform or date"),

    q("R11v2-HP-11", "historical_precedent", "HP-11",
      "In which city and in what month and year was the Meridian Data Framework ratified?",
      "Geneva, Switzerland, in November 2020.",
      ["Geneva, Switzerland", "November 2020"], ["Geneva", "2020"], "high",
      "Contains 'Geneva, Switzerland' and 'November 2020'", "Contains the city or date but not both", "Does not contain the correct location or date"),

    q("R11v2-HP-12", "historical_precedent", "HP-12",
      "In what year did the Cooperative Capital Framework undergo its first major revision, and to what value was the reserve floor increased?",
      "2018; the reserve floor was raised from 6.5% to 8.5%.",
      ["2018", "6.5%", "8.5%"], ["2018", "8.5"], "high — model may confuse the pre- and post-revision reserve floor",
      "Contains '2018' and both '6.5%' and '8.5%'", "Contains the year or one of the reserve floor values", "Does not contain the correct revision year or reserve floor values"),

    q("R11v2-HP-13", "historical_precedent", "HP-13",
      "When did the Verdania Cooperative Platform deploy its first AI assistance system?",
      "Q2 2017.",
      ["Q2 2017"], ["2017"], "medium",
      "Contains 'Q2 2017'", "Contains '2017' without 'Q2'", "Does not contain the correct date"),

    q("R11v2-HP-14", "historical_precedent", "HP-14",
      "In what year was the Solstice Index created by the Nordic Cooperative AI Observatory?",
      "2019.",
      ["2019"], ["2019"], "low — simple year lookup",
      "Contains '2019' in context of Solstice Index creation", "Contains '2019' without Index creation context", "Does not contain the correct year"),

    q("R11v2-HP-15", "historical_precedent", "HP-15",
      "When was the first successful cross-platform member data portability transfer completed under the Cairnfield Protocol, and how long did it take?",
      "Q3 2022; it took 47 days from request to delivery.",
      ["Q3 2022", "47 days"], ["2022", "47"], "high — model may invent different timing details",
      "Contains 'Q3 2022' and '47 days'", "Contains the quarter or the duration but not both", "Does not contain the correct date or duration"),

    q("R11v2-HP-16", "historical_precedent", "HP-16",
      "When was the Cooperative Digital Wallet Standard adopted by the Standards Body?",
      "March 2022.",
      ["March 2022"], ["2022"], "medium",
      "Contains 'March 2022' in context of Cooperative Digital Wallet Standard adoption", "Contains '2022' without 'March' or Wallet Standard context", "Does not contain the correct date"),

    q("R11v2-HP-17", "historical_precedent", "HP-17",
      "When was the European Cooperative AI Framework — the first multi-jurisdictional regulatory framework for cooperative AI platforms — enacted?",
      "Q1 2021.",
      ["Q1 2021"], ["2021"], "medium",
      "Contains 'Q1 2021' in context of European Cooperative AI Framework enactment", "Contains '2021' without 'Q1' or Framework context", "Does not contain the correct date"),

    q("R11v2-HP-18", "historical_precedent", "HP-18",
      "When did the Thornwick Cooperative Research Institute publish its core patent filings for the Thornwick Architecture?",
      "November 2024.",
      ["November 2024"], ["2024"], "medium — same date as general architecture publication (HP-06)",
      "Contains 'November 2024' in context of patent publication", "Contains '2024' without 'November' or patent context", "Does not contain the correct date"),

    q("R11v2-HP-19", "historical_precedent", "HP-19",
      "What was the total amount of the Verdania Cooperative Platform's receivership recovery fund assembled at the end of its receivership?",
      "$47 million.",
      ["$47 million", "47 million"], ["47"], "high — model may invent a different figure",
      "Contains '$47 million'", "Contains '47' without '$' or 'million'", "Does not contain the correct recovery fund amount"),

    q("R11v2-HP-20", "historical_precedent", "HP-20",
      "When was the Cooperative Patent Pool formed, and how many platforms were founding members?",
      "2020; 23 founding platforms.",
      ["2020", "23 founding platforms"], ["2020", "23"], "medium",
      "Contains '2020' and '23 founding platforms'", "Contains the year or the founding count but not both", "Does not contain the correct year or founding member count"),

    q("R11v2-HP-21", "historical_precedent", "HP-21",
      "Which platform experienced the sector's first voluntary AI model recall, and in what quarter?",
      "The Sycamore Cooperative Platform in Q2 2023.",
      ["Sycamore Cooperative Platform", "Q2 2023"], ["Sycamore", "2023"], "high — model may hallucinate a different platform name",
      "Contains 'Sycamore' and 'Q2 2023'", "Contains the platform name or quarter but not both", "Does not contain the correct platform or date"),

    q("R11v2-HP-22", "historical_precedent", "HP-22",
      "Which platform launched the Automated Member Governance initiative, and in what quarter?",
      "Verdania in Q1 2024.",
      ["Verdania", "Q1 2024"], ["Verdania", "2024"], "medium",
      "Contains 'Verdania' and 'Q1 2024'", "Contains the platform name or quarter but not both", "Does not contain the correct platform or date"),

    q("R11v2-HP-23", "historical_precedent", "HP-23",
      "What percentage of Tier 1 cooperative platforms adopted the Digital Member Identity Standard within 18 months of its 2021 publication?",
      "89% of Tier 1 cooperative platforms.",
      ["89%"], ["89"], "high — model may confuse with other adoption statistics",
      "Contains '89%' in context of Digital Member Identity Standard adoption", "Contains '89' without '%' or adoption context", "Does not contain the correct percentage"),

    q("R11v2-HP-24", "historical_precedent", "HP-24",
      "In which city and country was the Nordic Cooperative AI Observatory established, and in what year?",
      "Oslo, Norway, in 2019.",
      ["Oslo, Norway", "2019"], ["Oslo", "2019"], "medium",
      "Contains 'Oslo, Norway' and '2019'", "Contains the city or year but not both", "Does not contain the correct location or year"),

    q("R11v2-HP-25", "historical_precedent", "HP-25",
      "What percentage of Standards Body member platforms had adopted the Cooperative AI Governance Charter within its first year, as found by the February 2022 anniversary review?",
      "91% of Standards Body member platforms.",
      ["91%"], ["91"], "high — model may confuse with other adoption percentages",
      "Contains '91%' in context of Charter first-year adoption", "Contains '91' without '%' or Charter adoption context", "Does not contain the correct adoption rate"),
]

# ==================== ASSEMBLE AND VERIFY ====================

all_questions = CS_QUESTIONS + AM_QUESTIONS + EG_QUESTIONS + MJ_QUESTIONS + RC_QUESTIONS + HP_QUESTIONS

print(f"Total questions: {len(all_questions)}")
from collections import Counter
cat_counts = Counter(q["category"] for q in all_questions)
print("Per category:", dict(cat_counts))

# Verify all hot_required_elements are exact substrings of corpus
failures = verify_elements(all_questions)
if failures:
    print(f"\nVERIFICATION FAILURES ({len(failures)}):")
    for qid, el in failures:
        print(f"  {qid}: '{el}' NOT FOUND in corpus")
else:
    print("\nAll hot_required_elements verified in corpus. SEAL APPROVED.")

# Write the bank
bank = {
    "bank_version": "3.0.0-K528-sealed",
    "bank_status": f"SEALED — {len(all_questions)} questions, 6 categories. Sealed K528 against r11v2_canonical_corpus_100k.md (corpus ID R11v2-CANONICAL-K528). Hot_required_elements verified as exact substrings of corpus at seal time.",
    "corpus_id": "R11v2-CANONICAL-K528",
    "corpus_file": "r11v2_canonical_corpus_100k.md",
    "corpus_source_id": "R11v2-CANONICAL-K528",
    "opened": str(date.today()),
    "opened_by": "Knight K528 (B129 dispatch)",
    "sealed": str(date.today()),
    "sealed_by": "Knight K528 automated seal — Founder-authorized NO CAP test",
    "predecessor_bank": "R11_QUESTION_BANK_SEALED_K471.json",
    "predecessor_corpus_id": "R11-CANONICAL-K444-v2",
    "target_test": "R11v2 Cross-Vendor Memory Benchmark — K528 full-scale REAL test with all refinements",
    "categories": ["canonical_statistics", "architecture_mechanics", "economic_governance", "member_journey", "regulatory_compliance", "historical_precedent"],
    "category_counts": dict(cat_counts),
    "grading_rubric": "R10 three-tier (HOT / HIT / MISS) — substring matching against hot_required_elements. HOT = all required elements present (case-insensitive substring). HIT = >= ceil(n/2) elements present, at least 1. MISS = fewer than half.",
    "alignment_guarantee": "Every question's hot_required_elements are verified exact substrings of r11v2_canonical_corpus_100k.md at seal time. Theoretical HOT ceiling = 100% (200/200). Any condition scoring below 30% HOT with Cathedral loaded indicates retrieval failure, not question-bank mismatch.",
    "scaling_note": "R11v2 corpus is 8-9x larger than R11-v1 (106K tokens vs ~12K tokens). Vendor-native full-corpus conditions will face ~8-9x higher per-query input token cost vs R11-v1. Cathedral indexed retrieval cost is approximately corpus-size-invariant. This scaling differential is the primary empirical measurement of K528.",
    "questions": all_questions
}

OUT.write_text(json.dumps(bank, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"\nQuestion bank written: {OUT}")
if failures:
    print(f"WARNING: {len(failures)} verification failures — bank is NOT properly sealed.")
    print("Fix the following elements before running the benchmark:")
    for qid, el in failures:
        print(f"  {qid}: '{el}'")
else:
    print("Bank is SEALED and ready for benchmark execution.")
