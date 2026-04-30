"""
KN042 — Wrasse Registry CANON Eblet Expansion (BP005)
Pod O · single bean · KN042

Appends 8 new entries W-313 through W-320 to wrasse_registry.jsonl.
Covers all BP005 CANON-tier triggers: golden eblet, ring of three, canon eblet,
platform rules, project rules, deck card medallion, furnace federation,
multi-layer authority, social-authority DAG, pheromone-anchored decision,
skipping stones, wading, diving in, pudding tier, AI tuning, aviator symphony,
extension of self, hugo parallel double, supabase authority.

EBLET_PATH trigger class declared in-scope (KN042); schema updated;
wrasse_registry_writer._classify_trigger extended.
KN043 to add dedicated wrasse_lookup.py routing for eblet_path class.

canonical_resolution size: 200-400 tokens per entry (per K544 MAX_INJECTION_TOKENS=2000 cap).
Run: python expand_registry_KN042.py [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

REGISTRY_PATH = Path(__file__).parent / "wrasse_registry.jsonl"
LOCK_PATH = Path(__file__).parent / ".wrasse_registry.lock"

SESSION = "KN042-BP005"
TS = datetime.now(timezone.utc).isoformat()

ENTRIES: list[dict] = [
    {
        "trigger_id": "W-313",
        "trigger_class": "vocabulary",
        "trigger_pattern": "golden eblet",
        "trigger_regex": "\\bgolden\\s+eblet\\b|\\bring\\s+of\\s+three\\b|\\bcanon\\s+eblet\\b",
        "canonical_resolution": (
            "Ring of Three Golden Eblets — Founder-ratified BP005 authority architecture: "
            "three physical/UI Deck Card Medallions (1_canon / 2_platform_rules / 3_project_rules). "
            "Each Eblet = Emblem + QR code anchored to an IP Ledger; QR scan routes to Furnace "
            "for hash-verifiable verification. GOLDEN Eblets at "
            "~/.claude/state/eblets/CANON/GOLDEN/{1_canon,2_platform_rules,3_project_rules}.eblet.md. "
            "MARKED EXCEPTION: LB-source Eblet QR ALWAYS routes to Canon/Lore/Rules (non-overrideable). "
            "Project-owner Eblets use owner brand/stamps, route to owner-decided destinations. "
            "Project Rules split: Part A (LB-substrate-enforced floor, non-overrideable) + "
            "Part B (project-owner-sovereign). Prov 16 candidate (method+system). "
            "Full canon: ~/.claude/projects/C--Users-Administrator-Documents/memory/"
            "project_ring_of_three_golden_eblets_deck_card_medallion_federation_canon.md."
        ),
        "last_verified_ts": TS,
        "verification_count": 1,
        "source_session": SESSION,
        "scope": "public",
    },
    {
        "trigger_id": "W-314",
        "trigger_class": "vocabulary",
        "trigger_pattern": "deck card medallion",
        "trigger_regex": "\\bdeck\\s+card\\s+medallion\\b|\\bfurnace\\s+federation\\b|\\bfurnace\\s+verification\\b|\\bemblem.*qr\\b|\\bqr.*emblem\\b",
        "canonical_resolution": (
            "Deck Card Medallion — physical/UI delivery mechanism for the Ring of Three Golden Eblets "
            "(BP005 ratification). Standard 5:7 playing-card ratio, Frame Lock. "
            "Each Golden Eblet IS a Deck Card Medallion: "
            "Emblem (visual identity; LB Banyan Logo for LB-source Eblets; project-owner brand otherwise) + "
            "QR Code (routes to Furnace). Furnace = live verification + immutable public ledger stamping "
            "IP Ledger entries. Scanning a Medallion QR → Furnace verifies IP Ledger entry → "
            "returns verification receipt. Furnace-every-click (R2 closure): every badge/stamp click "
            "re-verifies; mismatch → soft-deflect with small-Mark compensation. "
            "Composes with: Slow Blade V2, #2260 Cooperative Defensive Patent Pledge, "
            "Battery-dispatch register, Deck Card system (B089), Medallion Sponsorship (not WWWWW). "
            "Full canon: project_ring_of_three_golden_eblets_deck_card_medallion_federation_canon.md "
            "(APPEND 1 section)."
        ),
        "last_verified_ts": TS,
        "verification_count": 1,
        "source_session": SESSION,
        "scope": "public",
    },
    {
        "trigger_id": "W-315",
        "trigger_class": "vocabulary",
        "trigger_pattern": "multi-layer authority",
        "trigger_regex": "\\bmulti[\\-\\s]layer\\s+authority\\b|\\bsuccessive\\s+layer\\s+of\\s+authority\\b|\\brecursive\\s+ring\\b|\\bL1.*L2.*substrate\\b",
        "canonical_resolution": (
            "Multi-Layer Authority Recursion — BP005 Founder extension of Ring of Three Golden Eblets "
            "(\"And each successive layer of authority\"). Ring pattern is RECURSIVE: "
            "L1 (LB Corp) → L2 (Upekrithen LLC) → L3 (Project owner) → L4 (Steward) → "
            "L5 (Member Helm) → L_n. Each layer instantiates own Ring with own brand/stamps/QR/IP Ledger. "
            "Rules-stack compounds: Effective Rules at L_k = Σ(Part A from L_1…L_{k-1}) + "
            "(Part A + Part B at L_k). Parent Part A non-overrideable by all child layers. "
            "Marked Exception at EACH LAYER (each layer's source-Eblet QR pinned to its Canon). "
            "One shared multi-tenant Furnace verification authority across all N layers "
            "(QR encodes which layer's IP Ledger to look up). "
            "Prov 16 method+system claim extension (recursive federation). "
            "Full canon: project_ring_of_three_golden_eblets_deck_card_medallion_federation_canon.md "
            "(APPEND BP005 turn-N+1 section)."
        ),
        "last_verified_ts": TS,
        "verification_count": 1,
        "source_session": SESSION,
        "scope": "public",
    },
    {
        "trigger_id": "W-316",
        "trigger_class": "vocabulary",
        "trigger_pattern": "social-authority DAG",
        "trigger_regex": "\\bsocial[\\-\\s]authority\\s+DAG\\b|\\bpheromone[\\-\\s]anchored\\s+decision\\b|\\bguild.*decide.*whom\\b|\\bdecide.*themselves\\b|\\bgolden\\s+tablet.*pheromone\\b",
        "canonical_resolution": (
            "Social-Authority DAG + Pheromone-Anchored Decisions — BP005 Founder extension "
            "(\"This flows naturally with Guilds, and Tribes, and even Families, for decisions "
            "— that each decide upon themselves how to choose, or whom to choose. "
            "But then it is recorded here, on that golden tablet. OR more accurately "
            "Pheromone anchored to it. Right?\"). Cross-cutting social-authority units "
            "(Guild / Tribe / Family / Helm) overlay the recursive Ring hierarchy as a DAG. "
            "Each unit has own Ring of Three, decides HOW (election/consensus/decree/quorum) "
            "and WHOM. Decisions are Pheromone-anchored, NOT Tablet-edited: each decision = "
            "first-class Pheromone record pointing UP to Golden Tablet anchor field. "
            "Keeps Tablets clean as authority-anchors; decisions accumulate as queryable substrate. "
            "Bidirectional discovery: Tablet→all anchored decisions; decision→Tablet authority chain. "
            "Furnace verifies decision reached via mechanism declared in Part B (XP×Rep vote / etc.). "
            "Prov 16 claim extension (social-authority cross-cutting overlay). "
            "Full canon: project_ring_of_three_golden_eblets_deck_card_medallion_federation_canon.md "
            "(APPEND BP005 turn-N+2 section)."
        ),
        "last_verified_ts": TS,
        "verification_count": 1,
        "source_session": SESSION,
        "scope": "public",
    },
    {
        "trigger_id": "W-317",
        "trigger_class": "vocabulary",
        "trigger_pattern": "skipping stones",
        "trigger_regex": "\\bskipping\\s+stones\\b|\\bwading\\b|\\bdiving\\s+in\\b|\\bpudding\\s+tier\\b|\\bproof\\s+in\\s+the\\s+pudding\\b|\\bat\\s+a\\s+glance.*more\\s+details.*in\\s+depth\\b",
        "canonical_resolution": (
            "Skipping Stones — canonical paper/document navigation pattern on Cephas "
            "(B055-era authority; Supabase source of truth; project_skipping_stones.md). "
            "TWO AXES: (1) Sink deeper: At a Glance → More Details → In Depth; "
            "(2) Skip to next: daisy-chain cross-refs (min 2 per doc). "
            "BP005 Pudding-anchor + Wading-name EXTENSION (NOT new A&A — extension of existing): "
            "At a Glance = Skipping Stones tier (sub-30s skim, Stone Soup anchor); "
            "More Details = Wading (5-10min read, Bread/Pudding mid-tier); "
            "In Depth = Diving In / Proof-in-the-Pudding (full-evening read, Spoonfuls / pudding itself). "
            "Pudding-tier IS the empirical receipt; Tier 3 carries the full proof. "
            "Write Tier 3 first (anchor); compress to Tier 2; compress to Tier 1. "
            "Extension file: project_skipping_stones_bp005_pudding_wading_extension.md. "
            "BP005 Three-Tier Eblet: ~/.claude/state/eblets/CANON/three_tier_paper_structure.eblet.md."
        ),
        "last_verified_ts": TS,
        "verification_count": 1,
        "source_session": SESSION,
        "scope": "public",
    },
    {
        "trigger_id": "W-318",
        "trigger_class": "vocabulary",
        "trigger_pattern": "aviator symphony",
        "trigger_regex": "\\baviator\\s+symphony\\b|\\bAI\\s+tuning\\b|\\bextension\\s+of\\s+self\\b|\\bcapability\\s+granted\\b|\\bfeels\\s+the\\s+machine\\b|\\bworks\\s+in\\s+symphony\\b",
        "canonical_resolution": (
            "AI Tuning — Aviator-Symphony articulation (Founder, BP005): "
            "'A good aviator feels the machine, just like riding a horse, and works in symphony "
            "with it to get the most out of it. So that it is an extension of self, "
            "a capability granted, so to speak.' Founder = FAA IFR-rated Aviation 15A (literal aviator). "
            "Three-component structure: (1) Metaphor (aviator-symphony-extension = Tuner's mental model); "
            "(2) Receipt (11→1 INDEX-file reduction via 'Spicy Sauce' Wrasse-Eblet redirect; "
            "more-often-than-not agreement as compounding signal); "
            "(3) Architectural insight (Substrate-Routed Memory Expansion: index cost decoupled from "
            "topic count via Wrasse pre-injection — UNLIMITED MEMORY per Founder ratification). "
            "Maps to: Tuner=DragonRider (B133), Pied Piper of Dragons, Aston Martin Straight Six. "
            "Paper candidate: AI Cake or No Atomo (three-tier structure applies). "
            "Full canon: project_ai_tuning_bp005_aviator_symphony_canon.md."
        ),
        "last_verified_ts": TS,
        "verification_count": 1,
        "source_session": SESSION,
        "scope": "public",
    },
    {
        "trigger_id": "W-319",
        "trigger_class": "vocabulary",
        "trigger_pattern": "hugo parallel double",
        "trigger_regex": "\\bhugo\\s+parallel\\s+double\\b|\\bsupabase\\s+authority\\b|\\blaunch\\s+moment\\b|\\bcephas.*supabase\\b|\\bsupabase.*cephas\\b",
        "canonical_resolution": (
            "Supabase Authority + Hugo Parallel Double (BP005 clarification): "
            "Supabase is the source of truth for Cephas content; "
            "Hugo runs as PARALLEL DOUBLE of Supabase-fed Cephas site until Launch Moment. "
            "Authority chain: Supabase (source of truth) → Cephas (consumer/renderer, front-of-house) "
            "→ Hugo (parallel until Launch Moment, then retired). "
            "After Launch Moment: Hugo retired; Supabase-fed Cephas is sole live channel. "
            "Applies to: Skipping Stones navigation pattern, all Cephas letters, all articles, "
            "all canon-content. NEVER update Hugo-only content without mirroring to Supabase "
            "(Letter Sync Protocol applies). "
            "Related: project_skipping_stones_bp005_pudding_wading_extension.md "
            "(authority chain section); project_skipping_stones.md (primary canon)."
        ),
        "last_verified_ts": TS,
        "verification_count": 1,
        "source_session": SESSION,
        "scope": "public",
    },
    {
        "trigger_id": "W-320",
        "trigger_class": "eblet_path",
        "trigger_pattern": "state/eblets/CANON",
        "trigger_regex": "state/eblets/CANON|CANON/GOLDEN|CANON.three_tier_paper_structure",
        "canonical_resolution": (
            "CANON Eblet directory — permanent Founder-ratified authority Eblets at "
            "~/.claude/state/eblets/CANON/. "
            "GOLDEN Ring of Three: "
            "{1_canon,2_platform_rules,3_project_rules}.eblet.md (BP005 base ratification). "
            "Three-tier paper structure: three_tier_paper_structure.eblet.md (BP005 extension). "
            "CANON Eblets are Stone-Tablet-Imperative-protected (append-only, no in-place edits). "
            "Distinguished from session-scoped Eblets (~/.claude/state/eblets/<session-id>/) "
            "by CANON/ path prefix. Promoted via explicit promote-eblet command (BRIDLE R2). "
            "KN042 declares EBLET_PATH trigger class in Wrasse engine (schema updated). "
            "Any path matching state/eblets/ is now eblet_path class-eligible. "
            "KN043 to add dedicated wrasse_lookup.py routing for eblet_path class "
            "(currently falls through to vocabulary-class routing — correct but non-optimized). "
            "New eblet_path entries: W-320 (CANON root) is the seed entry for the class."
        ),
        "last_verified_ts": TS,
        "verification_count": 1,
        "source_session": SESSION,
        "scope": "public",
    },
]


def _acquire_lock(timeout_s: float = 5.0) -> bool:
    """Filename-based advisory lock (cross-platform)."""
    import time as _time
    deadline = _time.monotonic() + timeout_s
    while _time.monotonic() < deadline:
        try:
            fd = os.open(str(LOCK_PATH), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, str(os.getpid()).encode())
            os.close(fd)
            return True
        except FileExistsError:
            _time.sleep(0.05)
    return False


def _release_lock() -> None:
    try:
        LOCK_PATH.unlink(missing_ok=True)
    except OSError:
        pass


def expand(dry_run: bool = False) -> dict:
    """Append 8 entries W-313..W-320 to the registry. Returns summary."""
    # Verify expected tail
    existing_ids: set[str] = set()
    last_w_num = 0
    with REGISTRY_PATH.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            tid = obj.get("trigger_id", "")
            if tid:
                existing_ids.add(tid)
            import re
            m = re.match(r"W-(\d+)", tid)
            if m:
                n = int(m.group(1))
                if n > last_w_num:
                    last_w_num = n

    print(f"[KN042] Current registry last W-num: {last_w_num}")

    # Check for conflicts
    conflicts = [e for e in ENTRIES if e["trigger_id"] in existing_ids]
    if conflicts:
        print(f"[KN042] CONFLICT: {[c['trigger_id'] for c in conflicts]} already in registry")
        return {"status": "conflict", "conflicts": [c["trigger_id"] for c in conflicts]}

    if dry_run:
        print("[KN042] DRY RUN — entries NOT written")
        for e in ENTRIES:
            print(f"  {e['trigger_id']} {e['trigger_class']} '{e['trigger_pattern']}'")
            print(f"    resolution_len: {len(e['canonical_resolution'])} chars")
        return {"status": "dry_run", "count": len(ENTRIES)}

    # Acquire lock + append
    if not _acquire_lock():
        print("[KN042] LOCK TIMEOUT — aborting")
        return {"status": "lock_timeout"}

    try:
        with REGISTRY_PATH.open("a", encoding="utf-8", buffering=1) as fh:
            for entry in ENTRIES:
                line = json.dumps(entry, ensure_ascii=False) + "\n"
                fh.write(line)
                fh.flush()
                os.fsync(fh.fileno())
                print(f"[KN042] appended {entry['trigger_id']} '{entry['trigger_pattern']}'")
    finally:
        _release_lock()

    # Verify
    verified = []
    with REGISTRY_PATH.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            if obj.get("trigger_id", "") in {e["trigger_id"] for e in ENTRIES}:
                verified.append(obj["trigger_id"])

    print(f"\n[KN042] VERIFY: {len(verified)}/8 entries confirmed in registry")
    if len(verified) == 8:
        print("[KN042] ✓ All 8 entries written + verified")
    else:
        missing = [e["trigger_id"] for e in ENTRIES if e["trigger_id"] not in verified]
        print(f"[KN042] ✗ MISSING: {missing}")

    return {
        "status": "ok" if len(verified) == 8 else "partial",
        "written": len(ENTRIES),
        "verified": len(verified),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    result = expand(dry_run=args.dry_run)
    sys.exit(0 if result.get("status") in ("ok", "dry_run") else 1)
