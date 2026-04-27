#!/usr/bin/env python3
"""Adds 44 supplemental questions to reach 200 total."""
import json
from pathlib import Path

BANK_PATH = Path(__file__).parent / "R11v2_QUESTION_BANK_SEALED_K528.json"
CORPUS_PATH = Path(__file__).parent / "r11v2_canonical_corpus_100k.md"
corpus = CORPUS_PATH.read_text(encoding="utf-8")

bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))

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
        "rubric": {"correct": correct, "partial": partial, "incorrect": incorrect}
    }

SUPPLEMENTAL = [
    # CS supplements (6 more)
    q("R11v2-CS-09b","canonical_statistics","CS-09",
      "What percentage of trailing transaction volume must cooperative platforms maintain in liquid reserves under the Cooperative Capital Framework to remain in good governance standing?",
      "8.5% of the prior 12-month gross transaction volume.",
      ["8.5%","prior 12-month"],["8.5"],"high — same value, different phrasing",
      "Contains '8.5%' and 'prior 12-month'","Contains only '8.5%' without the 12-month qualifier","Does not contain the correct reserve floor"),
    q("R11v2-CS-03b","canonical_statistics","CS-03",
      "What two stages must both independently reach 66.7% approval for a constitutional amendment to pass in federated cooperative networks?",
      "The drafting committee stage and the membership-wide ratification vote.",
      ["drafting committee","ratification vote"],["66.7"],"medium",
      "Contains 'drafting committee' and 'ratification vote'","Contains one stage without the other","Does not describe both stages"),
    q("R11v2-CS-05b","canonical_statistics","CS-05",
      "What was the prior all-time high of the Solstice Index before November 2025, and when was it recorded?",
      "4.09 in Q1 2024.",
      ["4.09","Q1 2024"],["4.09"],"high — model may confuse with current high of 4.18",
      "Contains '4.09' and 'Q1 2024'","Contains the value or the quarter but not both","Does not contain the prior high"),
    q("R11v2-CS-11b","canonical_statistics","CS-11",
      "What was the sector aggregate transaction volume in the 2023 annual sector survey (the year before the 2024 survey)?",
      "$15.1 billion.",
      ["$15.1 billion","15.1"],["15.1"],"high — model may confuse with 2024 figure ($18.4B)",
      "Contains '$15.1 billion'","Contains '15.1' without '$' or 'billion'","Does not contain the correct 2023 total"),
    q("R11v2-CS-06b","canonical_statistics","CS-06",
      "What was the average member economic surplus per member at Tier 1 platforms (annual volume over $1 billion) in 2024?",
      "$531 per member.",
      ["$531"],["531"],"high — model may confuse with sector average ($312)",
      "Contains '$531'","Contains '531' without '$'","Does not contain the correct Tier 1 average"),
    q("R11v2-CS-20b","canonical_statistics","CS-20",
      "What annual churn rate do members who participate actively in governance (voting in at least one election in the prior year) experience?",
      "3.1% annual churn rate.",
      ["3.1%"],["3.1"],"high — model may confuse with overall churn (8.9%) or non-participant churn (10.4%)",
      "Contains '3.1%' in context of governance-participant churn","Contains '3.1' without '%' or governance context","Does not contain the correct churn rate"),

    # AM supplements (8 more)
    q("R11v2-AM-04b","architecture_mechanics","AM-04",
      "What are the four mandatory elements of the preload system prompt specified by the Reference Architecture, and what token budget does the first element (role definition) receive?",
      "Role definition and behavioral constraints (600-800 tokens), cooperative values and governance framework (600-700 tokens), output format and citation requirements (400-500 tokens), and factual canonical knowledge base (400-1,400 tokens).",
      ["600-800 tokens","600-700 tokens","400-500 tokens"],["600","400"],"medium",
      "Contains '600-800 tokens' and at least two other ranges","Contains one token range without others","Does not contain any specific token allocation"),
    q("R11v2-AM-05b","architecture_mechanics","AM-05",
      "What percentage overhead does the 50-token overlap create in Scribe ingestion chunking?",
      "Approximately 8% storage overhead.",
      ["8%"],["8"],"high — model may calculate incorrectly",
      "Contains '8%' in context of chunk overlap storage overhead","Contains '8' without '%' or overlap context","Does not contain the correct overhead percentage"),
    q("R11v2-AM-02b","architecture_mechanics","AM-02",
      "What retrieval quality degradation does the Reference Architecture observe when using 768-dimensional embeddings instead of 1,536?",
      "Average -8.3% versus the 1,536-dimensional standard.",
      ["-8.3%","8.3%"],["8.3"],"high — model may guess a different degradation figure",
      "Contains '-8.3%' or '8.3%' in context of 768-dimensional embedding degradation","Contains '8.3' without '%' context","Does not contain the correct degradation figure"),
    q("R11v2-AM-12b","architecture_mechanics","AM-12",
      "How many consecutive missed heartbeats trigger circuit-breaker activation for a federation partner, and what total time does that represent?",
      "Three consecutive missed heartbeats, representing 135 seconds without response.",
      ["three consecutive","135 seconds"],["135"],"medium",
      "Contains 'three consecutive' and '135 seconds'","Contains one element without the other","Does not contain the correct count or total time"),
    q("R11v2-AM-08b","architecture_mechanics","AM-08",
      "What hallucination rate do responses with self-assessed confidence between 0.72 and 0.85 show in benchmark evaluation?",
      "3.1-6.8% hallucination rate.",
      ["3.1","6.8"],["3.1","6.8"],"high — model may confuse with other confidence-rate pairs",
      "Contains '3.1' and '6.8' in context of hallucination rates in the 0.72-0.85 range","Contains one bound without the other","Does not contain the correct hallucination rate range"),
    q("R11v2-AM-06b","architecture_mechanics","AM-06",
      "What is the maximum context window available for complex multi-turn governance consultations (the extended mode)?",
      "16,384 tokens in extended mode.",
      ["16,384"],["16384"],"high — model may confuse with standard mode (8,192)",
      "Contains '16,384' in context of extended governance consultation mode","Contains '16384' without comma format","Does not contain the correct extended window size"),
    q("R11v2-AM-10b","architecture_mechanics","AM-10",
      "What context window priority-truncation protocol does the Reference Architecture specify when context assembly exceeds the maximum window?",
      "Conversation history is truncated first, retrieval results are reduced to top-5, and if still over budget the system prompt canonical knowledge section is reduced. Governance and safety instructions are never truncated.",
      ["conversation history","top-5","never truncated"],["conversation","top-5"],"medium",
      "Contains 'conversation history' truncated first, 'top-5', and 'never truncated'","Contains two of three elements","Does not describe the priority truncation protocol correctly"),
    q("R11v2-AM-07b","architecture_mechanics","AM-07",
      "What was the correlation between current and 180-day-prior query topics in the research that calibrated the decay half-life?",
      "Correlation of 0.64 between current and 180-day-prior query topics.",
      ["0.64"],["0.64"],"high — model may guess a different correlation value",
      "Contains '0.64' in context of query topic correlation at 180-day horizon","Contains '0.64' without correlation context","Does not contain the correct correlation"),

    # EG supplements (7 more)
    q("R11v2-EG-01b","economic_governance","EG-01",
      "What is the tax treatment advantage of cooperative patronage distributions compared to non-cooperative dividend payments?",
      "Approximately 15-22% additional effective value due to favorable tax treatment for qualified patronage distributions.",
      ["15-22%"],["15","22"],"medium",
      "Contains '15-22%' in context of tax treatment advantage","Contains one percentage without the range","Does not contain the correct tax advantage range"),
    q("R11v2-EG-04b","economic_governance","EG-04",
      "What compound percentage of all eligible members must support a bylaw amendment for it to pass (quorum times approval percentage)?",
      "At least 16.5% of all eligible members (30% quorum × 55% approval).",
      ["16.5%"],["16.5"],"high — model must calculate 30% × 55% = 16.5%",
      "Contains '16.5%'","Contains '16.5' without '%'","Does not contain the correct compound percentage"),
    q("R11v2-EG-06c","economic_governance","EG-06",
      "By what percentage did federated transaction volume grow annually since the Federated Platform Compact's adoption, versus non-federated volume growth?",
      "Federated volume grew at 34% annually versus 22% for non-federated volume.",
      ["34%","22%"],["34","22"],"medium",
      "Contains '34%' and '22%' in context of federated vs non-federated growth","Contains one percentage without the other","Does not contain the correct growth differential"),
    q("R11v2-EG-09b","economic_governance","EG-09",
      "From what two reserve sources must platforms fund equity buybacks, in what order of priority?",
      "Exit Reserve first, then from operating reserves second.",
      ["Exit Reserve"],["Exit Reserve","operating reserves"],"medium",
      "Contains 'Exit Reserve' as the first source","Contains one reserve type without the priority order","Does not describe the correct funding order"),
    q("R11v2-EG-24b","economic_governance","EG-24",
      "What is the maximum annual dues amount any single platform pays to the Cooperative Ledger Standards Body, regardless of transaction volume?",
      "$150,000.",
      ["$150,000","150,000"],["150,000"],"medium",
      "Contains '$150,000' in context of Standards Body maximum dues","Contains '150,000' without '$'","Does not contain the correct maximum"),
    q("R11v2-EG-20b","economic_governance","EG-20",
      "For how many consecutive quarters must the reserve balance exceed 110% of the reserve floor before a surplus distribution is required?",
      "Two consecutive quarters.",
      ["two consecutive quarters"],["two","2 consecutive"],"medium",
      "Contains 'two consecutive quarters'","Contains 'two' or '2' without 'consecutive quarters'","Does not contain the correct trigger duration"),
    q("R11v2-EG-03b","economic_governance","EG-03",
      "What annual gross transaction volume range defines a Tier 2 cooperative platform?",
      "$100M to $999M (between $100 million and $999 million).",
      ["Tier 2","$100M","$999M"],["100M","999M","100 million"],"medium",
      "Contains 'Tier 2' and both '$100M' and '$999M'","Contains the tier designation or one boundary","Does not contain the Tier 2 range"),

    # MJ supplements (8 more)
    q("R11v2-MJ-07b","member_journey","MJ-07",
      "What is the substantive response SLA for standard member inquiries under the Reference Communication Standards?",
      "3 business days for standard inquiries.",
      ["3 business days"],["3"],"medium — model may confuse with urgent (1 business day) or acknowledgment (4 hours)",
      "Contains '3 business days' in context of substantive response SLA","Contains '3' without 'business days' or response context","Does not contain the correct SLA"),
    q("R11v2-MJ-02b","member_journey","MJ-02",
      "What governance rights are withheld from a provisional member who has not yet passed the Cooperative Principles Assessment?",
      "Full voting rights are withheld until the member achieves a passing score of 75 out of 100.",
      ["voting rights","75 out of 100"],["voting","75"],"medium",
      "Contains 'voting rights' withheld and '75 out of 100'","Contains one element without the other","Does not describe what is withheld or the score threshold"),
    q("R11v2-MJ-15b","member_journey","MJ-15",
      "How many days does a typical transaction dispute require for evidence gathering, according to the Reference Dispute Resolution Framework's elaboration?",
      "2-3 days for transaction log analysis.",
      ["2-3 days"],["2-3"],"medium",
      "Contains '2-3 days' in context of transaction dispute evidence gathering","Contains a small number of days without 'transaction' context","Does not contain the correct evidence-gathering period"),
    q("R11v2-MJ-10b","member_journey","MJ-10",
      "By what factor do members who transact within 5 days of onboarding show lower first-year churn compared to those who take more than 14 days?",
      "67% lower first-year churn.",
      ["67%"],["67"],"high — model may invent a different churn reduction figure",
      "Contains '67%' in context of first-5-day transaction and churn reduction","Contains '67' without '%' or churn context","Does not contain the correct reduction factor"),
    q("R11v2-MJ-16b","member_journey","MJ-16",
      "By what factor are members who complete governance orientation training in their first 90 days more likely to vote in their first annual election?",
      "3.4 times more likely.",
      ["3.4"],["3.4"],"high — model may guess a different multiplier",
      "Contains '3.4' in context of governance training and first-election voting likelihood","Contains '3.4' without training or voting context","Does not contain the correct factor"),
    q("R11v2-MJ-12b","member_journey","MJ-12",
      "What NPS range do cooperative platforms that are assessed as 'genuinely cooperative in governance' typically achieve?",
      "50-65 NPS.",
      ["50-65"],["50","65"],"medium",
      "Contains '50-65' in context of NPS range for genuinely cooperative platforms","Contains one boundary without the range","Does not contain the correct NPS range"),
    q("R11v2-MJ-19b","member_journey","MJ-19",
      "Under the Cooperative Capital Framework's tax compliance guidance, what percentage of patronage distributions must be paid in cash within the current tax year for qualified-notice treatment?",
      "At least 20% of the distribution in cash within the current tax year.",
      ["20%"],["20"],"high — model may guess a different percentage",
      "Contains '20%' in context of minimum cash payout for qualified patronage notice treatment","Contains '20' without '%' or tax context","Does not contain the correct minimum cash percentage"),
    q("R11v2-MJ-22b","member_journey","MJ-22",
      "What governance participation rate do members who use the AI governance assistant show, compared to members who do not?",
      "2.4 times more likely to vote.",
      ["2.4"],["2.4"],"high — model may invent a different multiplier",
      "Contains '2.4' in context of governance assistant usage and voting likelihood","Contains '2.4' without governance assistant context","Does not contain the correct factor"),

    # RC supplements (7 more)
    q("R11v2-RC-04b","regulatory_compliance","RC-04",
      "What is the regulatory notification deadline for incidents (as distinct from the 72-hour member notification deadline) under the Reference Framework?",
      "Regulatory notification within 48 hours.",
      ["48 hours"],["48"],"high — model may confuse regulatory (48h) and member (72h) notification windows",
      "Contains '48 hours' in context of regulatory (not member) incident notification","Contains '48' without 'regulatory' or notification context","Does not contain the correct regulatory notification window"),
    q("R11v2-RC-10b","regulatory_compliance","RC-10",
      "Under what named data protection framework is the Meridian Data Framework's 4% data breach fine maximum derived?",
      "The EU General Data Protection Regulation (GDPR).",
      ["General Data Protection Regulation","GDPR"],["GDPR"],"low — directly named",
      "Contains 'General Data Protection Regulation' or 'GDPR'","Contains 'regulation' without identifying GDPR specifically","Does not mention GDPR or GDPR equivalent"),
    q("R11v2-RC-07c","regulatory_compliance","RC-07",
      "What AML monitoring approach does the Standards Body recommend for member accounts against updated sanctions lists on a daily basis?",
      "Batch screening of all member accounts at least daily.",
      ["batch screening"],["batch"],"medium",
      "Contains 'batch screening' in context of daily sanctions list monitoring","Contains 'daily' without 'batch screening'","Does not describe the daily batch screening approach"),
    q("R11v2-RC-18b","regulatory_compliance","RC-18",
      "How many pages would a 30-page cooperative charter amendment filing cost at the Standards Body's charter amendment fee structure?",
      "$750 base + 30 × $12 = $1,110.",
      ["$750","$12"],["750","12"],"high — model must know both components to calculate total",
      "Contains '$750' base and '$12 per page'","Contains one fee component without the other","Does not contain the fee structure elements"),
    q("R11v2-RC-01b","regulatory_compliance","RC-01",
      "What is the minimum number of AI model audits a Tier 1 platform must commission over a 5-year period if following the 24-month certification cycle?",
      "At least 2 full audits (approximately 2.5 cycles in 5 years, so minimum 2 complete certifications).",
      ["24-month"],["24"],"medium — requires understanding of cycle math",
      "Contains '24-month' in context of audit cycle","Contains '24' without 'month' or cycle context","Does not reference the certification cycle"),
    q("R11v2-RC-22b","regulatory_compliance","RC-22",
      "If a cooperative platform's fiscal year ends on December 31, by approximately what calendar date must it file its surplus tax returns?",
      "Approximately September 14 (8.5 months after December 31 fiscal year end).",
      ["8.5 months"],["8.5"],"medium — model must apply 8.5 months to December 31",
      "Contains '8.5 months' in context of fiscal year end filing","Contains '8.5' without 'months' or fiscal year context","Does not reference the 8.5-month filing deadline"),
    q("R11v2-RC-25b","regulatory_compliance","RC-25",
      "What is the period between annual financial audits and federation compliance certification renewals (18 months)?",
      "18 months falls between the 12-month annual audit cycle and the 24-month consent re-confirmation cycle.",
      ["18 months"],["18"],"medium — model must understand why 18 months was chosen relative to other cycles",
      "Contains '18 months' in context of federation compliance certification","Contains '18' without 'months' or certification context","Does not explain or identify the 18-month renewal period"),

    # HP supplements (8 more)
    q("R11v2-HP-02b","historical_precedent","HP-02",
      "What was the total amount of the Verdania receivership recovery fund, and what percentage came from the member equity assessment?",
      "$47 million total; $14.6 million (31.1%) from the member equity assessment.",
      ["$47 million","14.6 million","31.1%"],["47","14.6","31.1"],"high — model may invent fund distribution details",
      "Contains '$47 million' total and '$14.6 million' member equity assessment contribution","Contains the total without the member assessment breakdown","Does not contain the correct recovery fund total or composition"),
    q("R11v2-HP-07b","historical_precedent","HP-07",
      "How many platforms signed the Federated Platform Compact at its Amsterdam ratification ceremony?",
      "31 platforms.",
      ["31 platforms","31"],["31"],"medium",
      "Contains '31 platforms' or '31' in context of founding Compact signatories","Contains '31' without 'platforms' or Compact context","Does not contain the correct founding member count"),
    q("R11v2-HP-12b","historical_precedent","HP-12",
      "How many platform failures and near-failures did the 2018 Capital Framework revision incorporate lessons from?",
      "23 platform failures and near-failures.",
      ["23 platform failures","23"],["23"],"medium",
      "Contains '23' in context of platform failures informing the 2018 revision","Contains '23' without failure or revision context","Does not contain the correct count"),
    q("R11v2-HP-15b","historical_precedent","HP-15",
      "Which platforms were involved in the sector's first successful cross-platform data portability transfer in Q3 2022?",
      "A Verdania member transferred their data to the Elmhurst Collective.",
      ["Verdania","Elmhurst Collective"],["Verdania","Elmhurst"],"medium",
      "Contains 'Verdania' and 'Elmhurst Collective'","Contains one platform without the other","Does not identify the platforms involved"),
    q("R11v2-HP-19b","historical_precedent","HP-19",
      "How much did the Standards Body's emergency lending facility contribute to Verdania's $47 million recovery fund?",
      "$18.2 million.",
      ["$18.2 million","18.2 million"],["18.2"],"high — model may confuse with federation partner contribution ($14.2M) or total ($47M)",
      "Contains '$18.2 million' in context of Standards Body emergency lending contribution","Contains '18.2' without '$' or 'million'","Does not contain the correct Standards Body contribution amount"),
    q("R11v2-HP-06b","historical_precedent","HP-06",
      "Under what license was the Thornwick Architecture's reference implementation released?",
      "Cooperative Open License.",
      ["Cooperative Open License"],["Cooperative","Open License"],"medium",
      "Contains 'Cooperative Open License'","Contains 'Open License' or 'Cooperative' without both","Does not mention the Cooperative Open License"),
    q("R11v2-HP-22b","historical_precedent","HP-22",
      "By how many percentage points did Verdania's governance participation rate increase in 2024 after launching the Automated Member Governance initiative?",
      "6.8 percentage points.",
      ["6.8 percentage points","6.8"],["6.8"],"high — model may confuse with sector-wide improvement (4.3 pp)",
      "Contains '6.8' in context of Verdania governance participation increase from AI governance initiative","Contains '6.8' without 'governance' or initiative context","Does not contain the correct improvement figure"),
    q("R11v2-HP-01b","historical_precedent","HP-01",
      "How many platform representatives from how many countries participated in the first Cooperative AI Platform Summit in Reykjavik?",
      "Forty-three platform representatives from nineteen countries.",
      ["Forty-three","nineteen countries"],["43","nineteen","19"],"high — model may invent different participant numbers",
      "Contains 'Forty-three' (or '43') and 'nineteen countries' (or '19')","Contains the representative count or country count but not both","Does not contain the correct participant numbers"),
]

# Verify elements
failures = []
for qu in SUPPLEMENTAL:
    for el in qu["hot_required_elements"]:
        if el.lower() not in corpus.lower():
            failures.append((qu["id"], el))

if failures:
    print(f"VERIFICATION FAILURES ({len(failures)}):")
    for qid, el in failures:
        print(f"  {qid}: '{el}' NOT FOUND")
    # Remove failing questions
    good = [q for q in SUPPLEMENTAL if not any(el.lower() not in corpus.lower() for el in q["hot_required_elements"])]
    print(f"\nProceeding with {len(good)} verified questions (dropping {len(SUPPLEMENTAL)-len(good)} failures)")
    SUPPLEMENTAL = good
else:
    print(f"All {len(SUPPLEMENTAL)} supplemental questions verified in corpus.")

bank["questions"].extend(SUPPLEMENTAL)

from collections import Counter
counts = Counter(q["category"] for q in bank["questions"])
total = len(bank["questions"])
print(f"\nTotal questions: {total}")
print("Per category:", dict(counts))

bank["bank_status"] = f"SEALED — {total} questions, 6 categories. Sealed K528 against r11v2_canonical_corpus_100k.md."
bank["category_counts"] = dict(counts)

BANK_PATH.write_text(json.dumps(bank, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"\nUpdated bank written: {BANK_PATH}")
if not failures:
    print("SEALED and ready for benchmark execution.")
