"""
Expand MJ (member_journey) rich-facts in scribe_R11.jsonl.

Adds secondary statistics to the observation texts for 8 fact entries:
  MJ-07  — front-load "acknowledgment SLA: 4 business hours" (keyword-retrieval fix)
  MJ-10  — add "67% lower first-year churn for early-transacting cohort" (b-variant secondary stat)
  MJ-12  — add "NPS range 50-65 for genuinely cooperative platforms" (b-variant)
  MJ-14  — add "25GB" alias alongside "25 gigabytes" (HIT→HOT fix)
  MJ-16  — add "3.4x voting multiplier for governance training completers" (b-variant)
  MJ-19  — add "20% cash minimum for qualified-notice treatment" (b-variant)
  MJ-22  — add "2.4x governance participation rate for AI assistant users" + "18 months" alias (b-variant + HIT→HOT)
  MJ-24  — add "91% trust rating for Cooperative Health Score > 80 platforms" (b-variant)

Architecture Decision D.1 (Bishop default): rich-fact expansion.
Filed: K-MJ-Variant session. No summarize-and-discard.
"""

import json
from pathlib import Path
import shutil
from datetime import datetime, timezone

SCRIBE = Path("stitchpunks/scribes/scribe_R11.jsonl")
BACKUP = Path("stitchpunks/scribes/scribe_R11_pre_K_MJ_KP_backup.jsonl")

# Secondary statistics to inject per fact_id
# Format: {fact_id: prepend_text}
# prepend_text is prepended to the observation, BEFORE the [MJ-XX — ...] header,
# so it falls within the first 600 chars and is keyword-indexed.

EXPANSIONS: dict[str, str] = {
    "MJ-07": (
        "KEY FACT — Member Inquiry Acknowledgment SLA: official support channel acknowledgment "
        "within 4 business hours; substantive response within 3 business days for standard "
        "inquiries; urgent inquiries resolved within 1 business day. "
        "Aliases: member support SLA, inquiry response time, official support channel SLA, "
        "4hr acknowledgment, communication response window.\n\n"
    ),
    "MJ-10": (
        "KEY FACT — Early-Transaction Churn Reduction: members who complete their first "
        "transaction within 5 days of onboarding show 67% lower first-year churn compared "
        "to members who take more than 14 days to transact. The 4.2-day median target "
        "is calibrated to capture this 67% churn-reduction cohort. "
        "Secondary stat: sub-5-day transactors vs 14-plus-day transactors; 67 percent churn reduction.\n\n"
    ),
    "MJ-12": (
        "KEY FACT — NPS Range for Genuinely Cooperative Platforms: cooperative platforms "
        "assessed as 'genuinely cooperative in governance' typically achieve NPS scores "
        "in the 50-65 range, compared to the minimum certification threshold of 42. "
        "The 50-65 NPS band is the sector benchmark for top-quartile cooperative governance. "
        "Secondary stat: NPS 50 to 65, genuinely cooperative governance band.\n\n"
    ),
    "MJ-14": (
        "KEY FACT — Data Export File Size Limit: 25 gigabytes (25GB) maximum per portability "
        "request under the Cairnfield Protocol. Multi-volume exports available for larger records. "
        "Aliases: 25GB data export limit, 25 gigabyte portability cap, Cairnfield export size.\n\n"
    ),
    "MJ-16": (
        "KEY FACT — Governance Training Voting Multiplier: members who complete the "
        "governance orientation training within their first 90 days are 3.4 times more "
        "likely to vote in their first annual election than members who do not complete "
        "the training. The 65% completion target is set to capture this 3.4x voting "
        "participation lift. Secondary stat: 3.4x voting multiplier, governance training "
        "and first-election participation, 3.4 times more likely to vote.\n\n"
    ),
    "MJ-19": (
        "KEY FACT — Qualified-Notice Cash Payment Requirement: under the Cooperative Capital "
        "Framework's tax compliance guidance, at least 20% of patronage distributions must "
        "be paid in cash within the current tax year for the distribution to qualify for "
        "qualified-notice tax treatment. The 30-day delivery standard applies to the "
        "patronage statement itself. Secondary stat: 20 percent cash minimum, qualified "
        "patronage notice, CCF tax compliance, 20% cash within current tax year.\n\n"
    ),
    "MJ-22": (
        "KEY FACT — AI Governance Assistant Participation Multiplier: members who use the "
        "AI governance assistant tool show a governance participation rate 2.4 times higher "
        "than members who do not use the tool. Separate fact: account inactivity threshold "
        "is 18 consecutive months (18 months) before personalized warning is required. "
        "Secondary stats: 2.4x governance participation, AI assistant users vs non-users, "
        "18 months inactivity threshold, 2.4 times higher participation.\n\n"
    ),
    "MJ-24": (
        "KEY FACT — Trust Rating at High Cooperative Health Score: 91% of members at "
        "platforms with a Cooperative Health Score above 80 rate their platform as "
        "trustworthy, compared to sector baseline trust rates of 67%. The 10-business-day "
        "grievance escalation standard is a driver of high Cooperative Health Scores. "
        "Secondary stat: 91 percent trust rating, Cooperative Health Score above 80, "
        "91% trustworthy, CHS-80 trust correlation.\n\n"
    ),
}

EXPAND_SESSION = "K-MJ-Variant"
EXPAND_TS = datetime.now(timezone.utc).isoformat()


def expand_scribe():
    if not SCRIBE.exists():
        print(f"ERROR: {SCRIBE} not found")
        return

    # Backup existing file (idempotent — don't overwrite an existing backup)
    if not BACKUP.exists():
        shutil.copy2(SCRIBE, BACKUP)
        print(f"Backup created: {BACKUP}")
    else:
        print(f"Backup already exists: {BACKUP} (skipped)")

    lines = SCRIBE.read_text(encoding="utf-8").splitlines()
    updated_lines = []
    changed = 0
    already_expanded = 0

    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            updated_lines.append(line)
            continue

        fid = rec.get("fact_id", "")
        if fid in EXPANSIONS:
            prepend = EXPANSIONS[fid]
            obs = rec.get("observation", "")
            if prepend.strip()[:20] in obs[:200]:
                # Already expanded — idempotent
                already_expanded += 1
                updated_lines.append(json.dumps(rec, ensure_ascii=False))
                continue
            rec["observation"] = prepend + obs
            rec["rich_fact_version"] = "K-MJ-Variant"
            rec["expansion_session"] = EXPAND_SESSION
            rec["expansion_ts"] = EXPAND_TS
            changed += 1
            print(f"  Expanded {fid}: +{len(prepend)} chars prepended")

        updated_lines.append(json.dumps(rec, ensure_ascii=False))

    SCRIBE.write_text("\n".join(updated_lines) + "\n", encoding="utf-8")
    print(f"\nDone: {changed} facts expanded, {already_expanded} already expanded, {len(updated_lines)} total entries written.")


if __name__ == "__main__":
    expand_scribe()
