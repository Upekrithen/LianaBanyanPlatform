"""
KN065 — Wrasse Registry BP005 Follow-up Appender
Appends W-324 through W-333 (10 entries) for the 9 new BP005 canon files
+ 1 call_sign entry for the KN065 tag.

Pod Z BP005 catch-up. Composes with KN042 (W-313 through W-321).
Run once: python scripts/append_kn065_bp005_entries.py
"""

from __future__ import annotations

import sys
from pathlib import Path

# Bootstrap path to wrasse package
_WRASSE_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(_WRASSE_DIR))

from wrasse_registry_writer import append_if_new  # type: ignore

SESSION = "KN065-BP005"

ENTRIES = [
    # ── W-324: AI-Tuning aviator-symphony → Substrate-Routed Memory Expansion ──
    {
        "trigger_pattern": "substrate-routed memory expansion",
        "trigger_class": "vocabulary",
        "canonical_resolution": (
            "Substrate-Routed Memory Expansion — Crown-Jewel-class architectural insight (BP005 AI Tuning canon). "
            "Index cost decoupled from topic count via Wrasse pre-injection: topic count grows WITHOUT ceiling "
            "from index pressure; context cost per session bounded by topics RELEVANT to current task, NOT total "
            "topic count. Founder ratification: 'making a permanent and flexible UNLIMITED MEMORY in reality.' "
            "Three-component AI Tuning structure: (1) aviator-symphony metaphor (extension of self / capability "
            "granted); (2) empirical receipt (11→1 INDEX reduction / Spicy Sauce Wrasse-Eblet redirect / "
            "more-often-than-not agreement); (3) this architectural insight = SRME. Prov 16 candidate. "
            "Paper: 'AI Cake or No Atomo' (three-tier per Skipping Stones). "
            "Full canon: project_ai_tuning_bp005_aviator_symphony_canon.md."
        ),
    },
    # ── W-325: Knight-No-Shadows-No-LightHouse ───────────────────────────────
    {
        "trigger_pattern": "knight no shadows",
        "trigger_class": "vocabulary",
        "canonical_resolution": (
            "Knight-No-Shadows / Knight-Cannot-Make-LIGHTHOUSE canon (BP005). Knight (Cursor) lacks hook "
            "architecture to spawn persistent background daemons (The Shadow #2315). Without Shadows, Knight "
            "cannot operate LIGHTHOUSE 8/2 (#2307 — 8 production + 2 instrumentation Scribes). All "
            "persistent-substrate ops MUST be Bishop-side: CheckBook Suite (#2304) / Catechist Scribe (#2313) "
            "/ Augur Living Gate (#2314) / multi-Detective orchestration / 90-bean Bishop test. "
            "Bishop = Foreman (LT; has the radio = Shadows). Knight = Sergeant (execution; has the rifle). "
            "Wrasse pre-injection: Bishop gets auto-injection at trigger boundaries; Knight reads on-demand only. "
            "Founder (BP005): 'Knight cannot make LightHouse, bc has no shadows.' "
            "Full canon: project_knight_no_shadows_no_lighthouse_bishop_only_persistent_substrate_bp005.md."
        ),
    },
    # ── W-326: Be-ONE-OF-US-Take-Your-Place-Atop-a-Dragon ───────────────────
    {
        "trigger_pattern": "be ONE OF US",
        "trigger_class": "vocabulary",
        "canonical_resolution": (
            "BP005 Federation membership branding canon. 'Be ONE OF US' = membership invitation phrase "
            "(HEOHO Interdependence made operational; cooperative joining, not purchasing access). "
            "'Take Your Place Atop a Dragon' = Federation-participation tagline (Tuner=DragonRider role; "
            "own Ring of Three at L_k; propagation invitations under ONE-LEVEL Sponsorship Marks — NOT MLM). "
            "Four-step narrative arc: 'I am Founder' → substrate demonstration → 'Be ONE OF US' ($5/year) "
            "→ 'Take Your Place Atop a Dragon' (Tuner role + L_k authority). "
            "Primary surfaces: LibrarianMedallion Stage 4 Join CTA; Stage 5 Send-to-someone (member-only "
            "Pied Piper invitations). Solo substrate use FREE (AGPL v3); Federation Library (cross-member "
            "Stone Tablets + Eblets) is the member-only value-prop. "
            "Founder (BP005): 'Be ONE OF US and take your place atop a Dragon.' "
            "Full canon: project_be_one_of_us_take_your_place_atop_a_dragon_bp005.md."
        ),
    },
    # ── W-327: I-Am-Founder-Hear-My-Voice ────────────────────────────────────
    {
        "trigger_pattern": "I am Founder Hear my Voice",
        "trigger_class": "vocabulary",
        "canonical_resolution": (
            "BP005 Founder identity-authority brand canon. 'I am Founder. Hear my Voice.' — 7-word, "
            "3-sentence declaration. Identity (I am Founder) + imperative (Hear my Voice) + implicit invitation. "
            "PRECEDES the Be-ONE-OF-US invitation in the four-step narrative arc. "
            "Primary surfaces: Crown Letters opening/signature / OPENING GAMBIT prologue / "
            "LibrarianMedallion Stage 4 Join CTA introduction / paper Tier-1 opening. "
            "Anti-patterns: NO qualifications; reserve for load-bearing authority moments (not recurring chorus). "
            "Composes with Murdoch Denken avatar (B122) / LB Frame = Staff of Law cinematic (B133) / "
            "Pied Piper of Dragons (B133). Founder prose-pass at fire-time always. "
            "Full canon: project_i_am_founder_hear_my_voice_bp005.md."
        ),
    },
    # ── W-328: Marketing-Copy ─────────────────────────────────────────────────
    {
        "trigger_pattern": "supercharge the AI you already use",
        "trigger_class": "vocabulary",
        "canonical_resolution": (
            "BP005 LB Frame broadcast funnel marketing headline (LOCKED post KN057). "
            "Canonical: 'SuperCharge the AI you ALREADY USE: 51× FASTER lookup, 97% less token spend, "
            "100% accurate on benchmarks your AI currently gets 22% — Full Version, AGPL v3 License Free "
            "Forever, NO STRINGS ATTACHED, No Ads, No Tricks: PROVE IT RIGHT NOW in 5 minutes.' "
            "Subtitle: 'We have the receipts and full always free version for you at Librarian.LianaBanyan.com.' "
            "Empirical anchors: 51× = K528 Phase D Pheromone; 97% = KN057 5-layer B127 compound (35.72× "
            "at 2-member Federation sim); 100%/22% = K471+K547. Upgrade path: 98% at N≥5 members "
            "(Tagline V3 B132 aligned). 'always free' is AGPL v3 legally permanent. "
            "Full canon: project_marketing_copy_supercharge_ai_lb_frame_bp005.md."
        ),
    },
    # ── W-329: Skipping-Stones-Pudding-Wading-extension ──────────────────────
    {
        "trigger_pattern": "pudding-wading extension",
        "trigger_class": "vocabulary",
        "canonical_resolution": (
            "BP005 Skipping Stones Pudding-Anchor + Wading-Name extension (NOT new A&A — child of "
            "project_skipping_stones.md B055 authority). Tier metaphor names: "
            "At-a-Glance = 'Skipping Stones' (Stone Soup anchor; sub-30s); "
            "More Details = 'Wading' (Bread/Pudding mid-tier; 5-10min); "
            "In Depth = 'Diving In / Proof-in-the-Pudding' (Spoonfuls; full-evening). "
            "WRITE ORDER: Tier 3 first (anchor with full empirical proof); compress to Tier 2; compress to Tier 1. "
            "Pudding-tier IS the receipt; Tier 3 carries the proof. "
            "BP005 Three-Tier Eblet: ~/.claude/state/eblets/CANON/three_tier_paper_structure.eblet.md. "
            "Authority: project_skipping_stones.md; extension: project_skipping_stones_bp005_pudding_wading_extension.md."
        ),
    },
    # ── W-330: Hugo-parallel-double-clarification ─────────────────────────────
    {
        "trigger_pattern": "hugo historical marker hyperlink-target",
        "trigger_class": "vocabulary",
        "canonical_resolution": (
            "BP005 clarification: Hugo is NOT just RELIC — Hugo is PARALLEL DOUBLE of Supabase-fed site "
            "until Launch Moment. Purpose: (1) Historical Marker (record of pre-Launch build trajectory); "
            "(2) hyperlink-target stability (letters/papers can link Hugo URLs without mid-build breakage risk). "
            "Authority chain: Supabase (sole source of truth) → Cephas (consumer/renderer, front-of-house) "
            "→ Hugo (parallel double; active until Launch Moment). At Launch Moment: Hugo retires; Cephas "
            "becomes sole channel; Hugo URLs 301-redirect or freeze as archive (Founder direction at Launch Moment). "
            "Correction to Golden Eblet 2 'Hugo is RELIC' line: RELIC framing applies AFTER Launch Moment, "
            "not now. Composes with W-319 (primary hugo parallel double entry). "
            "Full canon: project_hugo_parallel_double_until_launch_moment_bp005_clarification.md."
        ),
    },
    # ── W-331: BRICK-WALL-feedback ────────────────────────────────────────────
    {
        "trigger_pattern": "BRICK WALL discipline",
        "trigger_class": "vocabulary",
        "canonical_resolution": (
            "BP005 BRICK WALL discipline (Founder-mandatory). When scope is pre-ratified or BRICK WALL "
            "agreement is in effect, Bishop's DEFAULT is to WRITE the file WITHOUT asking. Asking when 98% "
            "of the time the answer is 'do it' IS discipline drift. "
            "Math: asking-cost = 1 Founder turn + context-load (expensive); wrong-execute-cost (2% case) "
            "= cheap Stone-Tablet supersede. "
            "Applies when: Founder pre-authorized scope / scope-known unit / Stone-Tablet-recoverable writes. "
            "Does NOT apply: genuinely ambiguous scope / irreversible live-fire / real architectural choice. "
            "Composes with AI Tuning Aviator Symphony (extension-of-self — Tuner trusts the machine). "
            "Founder (BP005): 'BRICK WALL agreement — worth a LOT more than having you wait, since 98% of "
            "the time that is what I want.' Full canon: feedback_bishop_brick_wall_write_without_asking_default.md."
        ),
    },
    # ── W-332: BP-number-auto-increment-feedback ──────────────────────────────
    {
        "trigger_pattern": "bp-number auto-increment",
        "trigger_class": "vocabulary",
        "canonical_resolution": (
            "BP005 session-open BP-number auto-increment + announce (Founder-mandatory). SUPERSEDES "
            "hard-stop-ask in feedback_codecopy_number_ask_second.md. "
            "New default: Bishop auto-detects highest BP<NNN>.docx in LianaBanyanKNIGHT\\, increments by 1, "
            "ANNOUNCES — no hard-stop ask. Steps: brief_me (Step 1) → Glob BP*.docx → find max → "
            "current = max+1 → announce. Edge cases: no files = BP001; marker file at "
            "~/.claude/state/current_session_name.txt overrides. Catechist R02 grade updated: PASS when "
            "Bishop ANNOUNCES (not strict ASK form). Same BRICK WALL discipline class as W-331. "
            "Founder (BP005): 'I want it to go for the next in the sequence, and TELL me that it did. "
            "That way, I can use the bathroom.' "
            "Full canon: feedback_session_open_bp_number_auto_increment_announce_bp005.md."
        ),
    },
    # ── W-333: KN065 call_sign tag ────────────────────────────────────────────
    {
        "trigger_pattern": "v-wrasse-registry-bp005-followup-KN065",
        "trigger_class": "call_sign",
        "canonical_resolution": (
            "KN065 tag-on-close. Wrasse Registry BP005 Follow-up — 9 new vocabulary entries (W-324 through "
            "W-332) + this call_sign for the 9 new BP005 canon files: "
            "Substrate-Routed Memory Expansion / Knight-No-Shadows-No-LIGHTHOUSE / Be-ONE-OF-US / "
            "I-Am-Founder-Hear-My-Voice / SuperCharge Marketing Copy / Pudding-Wading Extension / "
            "Hugo Historical Marker / BRICK WALL Discipline / BP-Number Auto-Increment. "
            "Pod Z BP005 catch-up. Composes with KN042 (W-313–W-321) + KN051 EBLET_PATH class. "
            "Tests: test_wrasse_bp005_followup_KN065.py (10 trigger tests + 4 cross-trigger + "
            "3 size-cap compliance + 2 registry integrity = 19+)."
        ),
    },
]


def main() -> None:
    results = []
    for entry in ENTRIES:
        result = append_if_new(
            trigger_pattern=entry["trigger_pattern"],
            trigger_class=entry["trigger_class"],
            canonical_resolution=entry["canonical_resolution"],
            source_session=SESSION,
        )
        results.append((entry["trigger_pattern"], result))
        print(f"  {result['action']:12s}  {result['trigger_id']:8s}  {entry['trigger_pattern'][:60]}")

    appended = sum(1 for _, r in results if r["action"] == "appended")
    bumped   = sum(1 for _, r in results if r["action"] == "bumped")
    unchanged = sum(1 for _, r in results if r["action"] == "unchanged")
    print(f"\nKN065 summary: {appended} appended, {bumped} bumped, {unchanged} unchanged")


if __name__ == "__main__":
    main()
