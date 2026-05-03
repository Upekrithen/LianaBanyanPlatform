"""
Phase D Verification — Bushel 1 Knight 1 PUDDINGs Synthesis
TITAN BP018 | synthesis_class=reckoning_bishop_finding

T1:  >= 80% of PUDDINGs in 05_Puddings/ have synthesis entries in ledger
T2:  Each synthesis entry has all required fields populated
T3:  HMAC + Chronos signatures present and non-empty on every entry
T4:  No duplicate (pudding_number, filename) pairs in ledger
T5:  >= 50% of entries have Founder voice quotes
T6:  Cross-references populated on >= 30% of entries (realistic: many Puddings reference related concepts)
T7:  Stratum recommendations distributed reasonably (not all one value)
T8:  Stats-Capture bookend populated (stats file present with timing)
T9:  Cost-accounting fields present on all entries
T10: Ledger sortable by pudding_number with no JSON parse errors
"""

import json
import re
import os
from pathlib import Path
from collections import Counter

import pytest

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
PUDDINGS_DIR = WORKSPACE / "BISHOP_DROPZONE" / "05_Puddings"
LEDGER_PATH = Path(r"C:\Users\Administrator\.claude\state\reckoning\knight_1_puddings.synthesis.jsonl")
STATS_PATH = Path(r"C:\Users\Administrator\.claude\state\reckoning\knight_1_stats.json")

REQUIRED_FIELDS = [
    "synthesis_class",
    "source_file",
    "title",
    "canonical_topic",
    "hmac",
    "chronos",
    "pudding_number",
    "stratum_recommendation",
    "ts",
    "cohort_class",
]


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def ledger_entries():
    """Load all JSONL entries from ledger."""
    assert LEDGER_PATH.exists(), f"Ledger not found: {LEDGER_PATH}"
    entries = []
    with LEDGER_PATH.open(encoding="utf-8") as fh:
        for i, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                entries.append(entry)
            except json.JSONDecodeError as e:
                pytest.fail(f"JSON parse error on ledger line {i}: {e}")
    return entries


@pytest.fixture(scope="session")
def pudding_files():
    """Discover numbered PUDDING files from canonical source."""
    assert PUDDINGS_DIR.exists(), f"05_Puddings dir not found: {PUDDINGS_DIR}"
    files = [
        f for f in PUDDINGS_DIR.iterdir()
        if f.is_file() and re.match(r"PUDDING_\d+", f.name)
    ]
    return files


@pytest.fixture(scope="session")
def stats():
    """Load stats JSON."""
    if not STATS_PATH.exists():
        return {}
    with STATS_PATH.open(encoding="utf-8") as fh:
        return json.load(fh)


# ---------------------------------------------------------------------------
# T1: Coverage >= 80%
# ---------------------------------------------------------------------------

class TestT1Coverage:
    def test_coverage_at_least_80_percent(self, ledger_entries, pudding_files):
        """T1: At least 80% of PUDDINGs in 05_Puddings/ have synthesis entries."""
        total_files = len(pudding_files)
        synthesized_filenames = {e.get("filename", "") for e in ledger_entries}
        covered = sum(1 for f in pudding_files if f.name in synthesized_filenames)
        coverage_pct = (covered / total_files * 100) if total_files > 0 else 0

        print(f"\n  T1: {covered}/{total_files} files covered ({coverage_pct:.1f}%)")
        assert coverage_pct >= 80.0, (
            f"Coverage {coverage_pct:.1f}% is below the 80% threshold. "
            f"Missing: {[f.name for f in pudding_files if f.name not in synthesized_filenames][:10]}"
        )

    def test_coverage_count_matches_stats(self, ledger_entries, stats):
        """T1b: Ledger entry count matches stats file reporting."""
        if not stats:
            pytest.skip("Stats file not present")
        written = stats.get("entries_written", 0)
        actual = len(ledger_entries)
        assert actual == written, (
            f"Stats reported {written} entries but ledger has {actual}"
        )


# ---------------------------------------------------------------------------
# T2: Required fields populated
# ---------------------------------------------------------------------------

class TestT2RequiredFields:
    def test_all_required_fields_present(self, ledger_entries):
        """T2: Every synthesis entry has all required fields populated."""
        failures = []
        for entry in ledger_entries:
            pudding = entry.get("pudding_number", "?")
            filename = entry.get("filename", "?")
            missing = [f for f in REQUIRED_FIELDS if not entry.get(f)]
            if missing:
                failures.append(f"Pudding #{pudding} ({filename}): missing {missing}")

        print(f"\n  T2: {len(ledger_entries) - len(failures)}/{len(ledger_entries)} entries fully populated")
        assert not failures, f"Entries with missing required fields:\n" + "\n".join(failures[:20])

    def test_synthesis_class_is_correct(self, ledger_entries):
        """T2b: synthesis_class is 'reckoning_bishop_finding' on all entries."""
        wrong = [e for e in ledger_entries if e.get("synthesis_class") != "reckoning_bishop_finding"]
        assert not wrong, f"{len(wrong)} entries have wrong synthesis_class"

    def test_cohort_class_is_federation_member(self, ledger_entries):
        """T2c: cohort_class is 'federation_member' on all entries."""
        wrong = [e for e in ledger_entries if e.get("cohort_class") != "federation_member"]
        assert not wrong, f"{len(wrong)} entries have wrong cohort_class"


# ---------------------------------------------------------------------------
# T3: HMAC + Chronos signatures
# ---------------------------------------------------------------------------

class TestT3Signatures:
    def test_hmac_present_and_non_empty(self, ledger_entries):
        """T3a: HMAC field present and non-empty on every entry."""
        missing = [e.get("filename", e.get("pudding_number", "?")) for e in ledger_entries
                   if not e.get("hmac")]
        assert not missing, f"Missing HMAC on: {missing[:10]}"

    def test_chronos_present_and_non_empty(self, ledger_entries):
        """T3b: Chronos field present and non-empty on every entry."""
        missing = [e.get("filename", e.get("pudding_number", "?")) for e in ledger_entries
                   if not e.get("chronos")]
        assert not missing, f"Missing chronos on: {missing[:10]}"

    def test_hmac_format_is_sha256(self, ledger_entries):
        """T3c: HMAC values are in sha256:<hex64> format."""
        invalid = []
        for e in ledger_entries:
            hmac = e.get("hmac", "")
            if not re.match(r"^sha256:[0-9a-f]{64}$", hmac):
                invalid.append((e.get("pudding_number"), hmac[:30]))
        assert not invalid, f"Invalid HMAC format on: {invalid[:5]}"

    def test_chronos_format_is_hex16(self, ledger_entries):
        """T3d: Chronos values are 16-char hex strings."""
        invalid = []
        for e in ledger_entries:
            chronos = e.get("chronos", "")
            if not re.match(r"^[0-9a-f]{16}$", chronos):
                invalid.append((e.get("pudding_number"), chronos))
        assert not invalid, f"Invalid chronos format: {invalid[:5]}"


# ---------------------------------------------------------------------------
# T4: No duplicate entries
# ---------------------------------------------------------------------------

class TestT4Duplicates:
    def test_no_duplicate_filenames(self, ledger_entries):
        """T4: Each source filename appears at most once in ledger."""
        filenames = [e.get("filename", "") for e in ledger_entries]
        counts = Counter(filenames)
        duplicates = {k: v for k, v in counts.items() if v > 1}
        # Legitimate duplicates exist (e.g., PUDDING_131_BATTERY vs PUDDING_131_THERE_IS_NO_SPOON)
        # The check: same filename should not appear more than once
        assert not duplicates, (
            f"Duplicate filenames in ledger: {duplicates}"
        )

    def test_no_exact_duplicate_pudding_filename_pairs(self, ledger_entries):
        """T4b: (pudding_number, filename) pairs are unique."""
        pairs = [(e.get("pudding_number"), e.get("filename")) for e in ledger_entries]
        pair_counts = Counter(pairs)
        dups = {k: v for k, v in pair_counts.items() if v > 1}
        assert not dups, f"Duplicate (number, filename) pairs: {dups}"


# ---------------------------------------------------------------------------
# T5: Founder voice quotes >= 50%
# ---------------------------------------------------------------------------

class TestT5FounderVoice:
    def test_founder_voice_coverage(self, ledger_entries):
        """T5: At least 50% of entries have at least one Founder voice quote."""
        with_quotes = [e for e in ledger_entries if e.get("founder_voice_quotes")]
        pct = len(with_quotes) / len(ledger_entries) * 100 if ledger_entries else 0
        print(f"\n  T5: {len(with_quotes)}/{len(ledger_entries)} entries have Founder voice quotes ({pct:.1f}%)")
        assert pct >= 50.0, (
            f"Only {pct:.1f}% of entries have Founder voice quotes (need >= 50%)"
        )


# ---------------------------------------------------------------------------
# T6: Cross-references on >= 30% of entries
# ---------------------------------------------------------------------------

class TestT6CrossReferences:
    def test_cross_reference_coverage(self, ledger_entries):
        """T6: At least 30% of entries have cross-references populated."""
        with_refs = [e for e in ledger_entries if e.get("cross_references")]
        pct = len(with_refs) / len(ledger_entries) * 100 if ledger_entries else 0
        print(f"\n  T6: {len(with_refs)}/{len(ledger_entries)} entries have cross-refs ({pct:.1f}%)")
        assert pct >= 30.0, (
            f"Only {pct:.1f}% of entries have cross-references (need >= 30%)"
        )


# ---------------------------------------------------------------------------
# T7: Stratum distribution is reasonable
# ---------------------------------------------------------------------------

class TestT7StratumDistribution:
    VALID_STRATA = {"sand", "soil", "sediment", "sandstone", "limestone", "granite", "bedrock"}

    def test_all_strata_valid(self, ledger_entries):
        """T7a: All stratum_recommendation values are valid stratum names."""
        invalid = [
            (e.get("pudding_number"), e.get("stratum_recommendation"))
            for e in ledger_entries
            if e.get("stratum_recommendation") not in self.VALID_STRATA
        ]
        assert not invalid, f"Invalid stratum values: {invalid[:10]}"

    def test_stratum_not_monolithic(self, ledger_entries):
        """T7b: Strata are distributed across at least 3 levels (not all same)."""
        strata = Counter(e.get("stratum_recommendation") for e in ledger_entries)
        print(f"\n  T7 distribution: {dict(strata)}")
        assert len(strata) >= 3, (
            f"Only {len(strata)} distinct strata used. Expected diverse distribution. Got: {dict(strata)}"
        )

    def test_not_all_bedrock(self, ledger_entries):
        """T7c: Not more than 75% of entries classified as 'bedrock'."""
        bedrock_count = sum(1 for e in ledger_entries if e.get("stratum_recommendation") == "bedrock")
        pct = bedrock_count / len(ledger_entries) * 100 if ledger_entries else 100
        assert pct <= 75.0, (
            f"{pct:.1f}% classified as bedrock — too concentrated (max 75%)"
        )

    def test_not_all_sand(self, ledger_entries):
        """T7d: Not more than 50% of entries classified as 'sand'."""
        sand_count = sum(1 for e in ledger_entries if e.get("stratum_recommendation") == "sand")
        pct = sand_count / len(ledger_entries) * 100 if ledger_entries else 0
        assert pct <= 50.0, f"{pct:.1f}% classified as sand — too concentrated"


# ---------------------------------------------------------------------------
# T8: Stats-Capture telemetry bookend
# ---------------------------------------------------------------------------

class TestT8StatsCapture:
    def test_stats_file_exists(self):
        """T8a: Stats file exists (bookend emission)."""
        assert STATS_PATH.exists(), f"Stats file not found: {STATS_PATH}"

    def test_stats_has_timing(self, stats):
        """T8b: Stats file has ts_start and ts_end (bookend timing)."""
        if not stats:
            pytest.skip("Stats file empty")
        assert "ts_start" in stats, "Stats missing ts_start"
        assert "ts_end" in stats, "Stats missing ts_end"

    def test_stats_session_id_correct(self, stats):
        """T8c: Stats session ID is correct."""
        if not stats:
            pytest.skip("Stats file empty")
        assert stats.get("session") == "K_BUSHEL1_RECKONING_KNIGHT1"

    def test_stats_error_count_zero(self, stats):
        """T8d: No errors reported in stats."""
        if not stats:
            pytest.skip("Stats file empty")
        assert stats.get("errors") == [], f"Stats reports errors: {stats.get('errors')}"


# ---------------------------------------------------------------------------
# T9: Cost-accounting fields
# ---------------------------------------------------------------------------

class TestT9CostAccounting:
    def test_cost_accounting_fields_present(self, ledger_entries):
        """T9: vendor_api_spend_usd + counterfactual_cost_estimate_usd on all entries."""
        missing_spend = [e.get("filename") for e in ledger_entries
                         if "vendor_api_spend_usd" not in e]
        missing_counterfactual = [e.get("filename") for e in ledger_entries
                                   if "counterfactual_cost_estimate_usd" not in e]
        assert not missing_spend, f"Missing vendor_api_spend_usd: {missing_spend[:5]}"
        assert not missing_counterfactual, f"Missing counterfactual_cost_estimate_usd: {missing_counterfactual[:5]}"

    def test_counterfactual_cost_is_positive(self, ledger_entries):
        """T9b: counterfactual_cost_estimate_usd is non-negative on all entries."""
        negative = [
            (e.get("pudding_number"), e.get("counterfactual_cost_estimate_usd"))
            for e in ledger_entries
            if e.get("counterfactual_cost_estimate_usd", 0) < 0
        ]
        assert not negative, f"Negative counterfactual costs: {negative}"

    def test_total_counterfactual_cost(self, ledger_entries):
        """T9c: Print total counterfactual cost estimate."""
        total = sum(e.get("counterfactual_cost_estimate_usd", 0) for e in ledger_entries)
        print(f"\n  T9: Total counterfactual cost estimate: ${total:.4f}")
        # Just informational — no assertion
        assert total >= 0


# ---------------------------------------------------------------------------
# T10: Ledger parseable + sortable by pudding_number
# ---------------------------------------------------------------------------

class TestT10LedgerIntegrity:
    def test_all_entries_parse_clean(self, ledger_entries):
        """T10a: All ledger lines parse as valid JSON (tested implicitly by fixture)."""
        assert len(ledger_entries) > 0, "Ledger is empty"
        print(f"\n  T10: {len(ledger_entries)} entries parse cleanly")

    def test_sortable_by_pudding_number(self, ledger_entries):
        """T10b: Entries are sortable by pudding_number without error."""
        try:
            sorted_entries = sorted(
                ledger_entries,
                key=lambda e: (e.get("pudding_number") or 9999, e.get("filename", ""))
            )
            assert len(sorted_entries) == len(ledger_entries)
        except Exception as e:
            pytest.fail(f"Could not sort ledger by pudding_number: {e}")

    def test_skipping_stones_layers_present(self, ledger_entries):
        """T10c: skipping_stones_layers has all three tiers on all entries."""
        failures = []
        for e in ledger_entries:
            layers = e.get("skipping_stones_layers", {})
            if not all(k in layers for k in ("at_a_glance", "more_details", "in_depth")):
                failures.append(e.get("filename"))
        assert not failures, f"Entries missing Skipping Stones tiers: {failures[:5]}"

    def test_ledger_entry_count_meaningful(self, ledger_entries, pudding_files):
        """T10d: Ledger has at least as many entries as canonical PUDDING files."""
        # Ledger may have more entries due to duplicates (e.g., PUDDING_131 has two variants)
        assert len(ledger_entries) >= len(pudding_files), (
            f"Ledger has {len(ledger_entries)} entries but {len(pudding_files)} source files exist"
        )

    def test_wading_diving_in_layer_present(self, ledger_entries):
        """T10e: wading_diving_in_layer present and non-empty on all entries."""
        missing = [e.get("filename") for e in ledger_entries if not e.get("wading_diving_in_layer")]
        assert not missing, f"Missing wading_diving_in_layer: {missing[:5]}"
