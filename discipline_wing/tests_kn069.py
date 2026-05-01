"""
Tests KN069 — SubstrateGlossaryPanel + Cephas /substrate-glossary
8 tests covering all Phase D requirements.
Bean: KN069 / BP006 / Pod EE

Tests validate the TSX component structurally (file analysis) since
the Helm PWA uses Electron + Vite without a pytest-compatible JS test runner.
"""

import re
import sys
import unittest
from pathlib import Path

_WORKSPACE = Path(__file__).parent.parent
_PWA_SRC = _WORKSPACE / "librarian-mcp-helm-pwa" / "src" / "renderer" / "src"
_COMPONENT = _PWA_SRC / "components" / "SubstrateGlossaryPanel.tsx"
_APP = _PWA_SRC / "App.tsx"


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


class T01_RouteRegistered(unittest.TestCase):
    """Route renders: App.tsx imports + renders SubstrateGlossaryPanel on 'glossary' view."""

    def test_import_present(self):
        src = _read(_APP)
        self.assertIn("SubstrateGlossaryPanel", src,
                      "App.tsx must import SubstrateGlossaryPanel")

    def test_view_type_includes_glossary(self):
        src = _read(_APP)
        self.assertIn("'glossary'", src,
                      "View type must include 'glossary'")

    def test_render_branch_present(self):
        src = _read(_APP)
        self.assertIn("view === 'glossary'", src,
                      "App.tsx must render SubstrateGlossaryPanel when view === 'glossary'")

    def test_nav_item_present(self):
        src = _read(_APP)
        self.assertIn("Glossary", src,
                      "App.tsx sidebar must have a Glossary nav item")


class T02_EntriesDisplay(unittest.TestCase):
    """60+ entries display: component contains 60+ named entries across 8 classes."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def _count_entries(self) -> int:
        # Count objects that start with id: (each ENTRIES item has an id field)
        return len(re.findall(r"^\s+id:\s+'[^']+',", self.src, re.MULTILINE))

    def test_entry_count_gte_60(self):
        count = self._count_entries()
        self.assertGreaterEqual(count, 60,
                                f"Component must define 60+ entries; found {count}")

    def test_all_8_classes_present(self):
        src = self.src
        required_classes = [
            "Substrate Storage",
            "Architectural Substrate",
            "Verification",
            "Federation Architecture",
            "Discipline",
            "Stitchpunk Pantheon",
            "Brand Canon",
            "Empirical Receipts",
        ]
        for cls in required_classes:
            self.assertIn(cls, src,
                          f"Class '{cls}' must be present in component")

    def test_class_colors_defined(self):
        self.assertIn("CLASS_COLORS", self.src,
                      "CLASS_COLORS record must be defined for 8 classes")
        # Each class 1-8 should have a color
        for i in range(1, 9):
            self.assertIn(f"{i}:", self.src,
                          f"CLASS_COLORS must have entry for class {i}")

    def test_entries_array_exported(self):
        self.assertIn("const ENTRIES: GlossaryEntry[]", self.src,
                      "ENTRIES array must be typed as GlossaryEntry[]")


class T03_CrossLinksNavigate(unittest.TestCase):
    """Cross-links navigate: cross-link buttons call onNavigate prop."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def test_on_navigate_prop(self):
        self.assertIn("onNavigate", self.src,
                      "Component must accept onNavigate prop")

    def test_navigate_to_home(self):
        self.assertIn("onNavigate?.('home')", self.src,
                      "Cross-link must navigate to 'home' view")

    def test_navigate_to_timeline(self):
        self.assertIn("onNavigate?.('timeline')", self.src,
                      "Cross-link must navigate to 'timeline' view")

    def test_navigate_to_modules(self):
        self.assertIn("onNavigate?.('modules')", self.src,
                      "Cross-link must navigate to 'modules' (install) view")

    def test_navigate_to_wing(self):
        self.assertIn("onNavigate?.('wing')", self.src,
                      "Cross-link must navigate to 'wing' (federation) view")


class T04_SearchFilter(unittest.TestCase):
    """Search/filter works: component has search state + useMemo filter."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def test_search_state_present(self):
        self.assertIn("useState('')", self.src,
                      "Search state must be initialized as empty string")

    def test_search_input_present(self):
        self.assertIn("Search", self.src,
                      "Search input placeholder must be present")
        self.assertIn("aria-label", self.src,
                      "Search input must have aria-label for accessibility")

    def test_class_filter_present(self):
        self.assertIn("classFilter", self.src,
                      "Class filter state must be present")
        self.assertIn("All classes", self.src,
                      "Class filter must have 'All classes' option")

    def test_usememo_filter(self):
        self.assertIn("useMemo", self.src,
                      "Filtered entries must use useMemo for performance")
        self.assertIn("toLowerCase", self.src,
                      "Search must use toLowerCase for case-insensitive matching")


class T05_MobileResponsive(unittest.TestCase):
    """Mobile responsive: component uses flexible layout styles (no hardcoded px widths)."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def test_flexwrap_present(self):
        self.assertIn("flexWrap", self.src,
                      "Search row must flexWrap for mobile responsiveness")

    def test_flex_1_on_search_input(self):
        self.assertIn("flex: 1", self.src,
                      "Search input must use flex: 1 (not hardcoded width)")

    def test_minwidth_present(self):
        self.assertIn("minWidth", self.src,
                      "Search input must have minWidth to prevent overflow collapse")

    def test_overflow_auto(self):
        self.assertIn("overflowY: 'auto'", self.src,
                      "Panel must use overflowY: auto for scroll on small screens")


class T06_PheromoneClickTracking(unittest.TestCase):
    """Pheromone-anchor click-tracking: toggleEntry logs pheromone_anchor events."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def test_pheromone_anchor_present(self):
        self.assertIn("pheromone_anchor", self.src,
                      "Pheromone click-tracking anchor must be present in toggleEntry")

    def test_console_log_present(self):
        self.assertIn("console.log('[SubstrateGlossary]", self.src,
                      "Console.log must emit SubstrateGlossary namespace for tracking")

    def test_entry_id_in_tracking(self):
        self.assertIn("entry_id: id", self.src,
                      "Tracking must record the entry_id that was clicked")

    def test_timestamp_in_tracking(self):
        self.assertIn("ts: new Date().toISOString()", self.src,
                      "Tracking must record timestamp for Pheromone substrate write")


class T07_CanonSourceOfTruth(unittest.TestCase):
    """Canon source-of-truth: entries are inline (not duplicated from external fetch)."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def test_no_fetch_calls(self):
        self.assertNotIn("fetch(", self.src,
                         "Component must NOT fetch data at runtime — entries are canonical inline data")

    def test_no_axios(self):
        self.assertNotIn("axios", self.src,
                         "Component must not use axios — entries are canonical inline")

    def test_cooperative_pledge_footer(self):
        self.assertIn("Cooperative Defensive Patent Pledge", self.src,
                      "Component must include the Cooperative Defensive Patent Pledge (#2260) footer")
        self.assertIn("#2260", self.src,
                      "Component must reference patent pledge anchor #2260")

    def test_section_102a_reference(self):
        self.assertIn("102(a)", self.src,
                      "Component must reference § 102(a) prior-art coverage in defensive-value statement")


class T08_EntryStructureValid(unittest.TestCase):
    """New-entry-add workflow: GlossaryEntry interface has all required fields."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def test_interface_defined(self):
        self.assertIn("interface GlossaryEntry", self.src,
                      "GlossaryEntry interface must be defined")

    def test_required_fields_in_interface(self):
        required = ["id", "name", "cls", "clsNum", "def", "details", "composes"]
        for field in required:
            self.assertIn(f"  {field}:", self.src,
                          f"GlossaryEntry interface must include '{field}' field")

    def test_anchor_is_optional(self):
        self.assertIn("anchor?:", self.src,
                      "anchor field must be optional (anchor?:) in GlossaryEntry interface")

    def test_expand_collapse_mechanism(self):
        self.assertIn("expandedIds", self.src,
                      "Expand/collapse must use expandedIds Set")
        self.assertIn("aria-expanded", self.src,
                      "Expanded entries must set aria-expanded for accessibility")


if __name__ == "__main__":
    result = unittest.main(verbosity=2, exit=False)
    n = result.result.testsRun
    failures = len(result.result.failures) + len(result.result.errors)
    print(f"\n{'='*60}")
    print(f"KN069 SubstrateGlossaryPanel Tests: {n - failures}/{n} passed")
    if failures:
        sys.exit(1)
