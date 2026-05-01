"""
Tests KN070 — VisualTimelinePanel /timeline route
8 tests covering all Phase D requirements.
Bean: KN070 / BP006 / Pod EE

Tests validate the TSX component structurally (file analysis).
"""

import re
import sys
import unittest
from pathlib import Path

_WORKSPACE = Path(__file__).parent.parent
_PWA_SRC = _WORKSPACE / "librarian-mcp-helm-pwa" / "src" / "renderer" / "src"
_COMPONENT = _PWA_SRC / "components" / "VisualTimelinePanel.tsx"
_APP = _PWA_SRC / "App.tsx"


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


class T01_RouteRegistered(unittest.TestCase):
    """Route renders: App.tsx imports + renders VisualTimelinePanel on 'timeline' view."""

    def test_import_present(self):
        src = _read(_APP)
        self.assertIn("VisualTimelinePanel", src,
                      "App.tsx must import VisualTimelinePanel")

    def test_view_type_includes_timeline(self):
        src = _read(_APP)
        self.assertIn("'timeline'", src,
                      "View type must include 'timeline'")

    def test_render_branch_present(self):
        src = _read(_APP)
        self.assertIn("view === 'timeline'", src,
                      "App.tsx must render VisualTimelinePanel when view === 'timeline'")

    def test_nav_item_present(self):
        src = _read(_APP)
        self.assertIn("Timeline", src,
                      "App.tsx sidebar must have a Timeline nav item")


class T02_DataAggregationCorrectness(unittest.TestCase):
    """Data-aggregation correctness: all canonical data sources represented."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def test_prov_13_present(self):
        self.assertIn("64/036,646", self.src,
                      "Prov 13 App# must be present (USPTO filing receipt)")

    def test_prov_14_present(self):
        self.assertIn("64/052,602", self.src,
                      "Prov 14 App# (Conf 8616) must be present")

    def test_prov_15_present(self):
        self.assertIn("64/052,618", self.src,
                      "Prov 15 App# (Conf 8746) must be present")

    def test_kn052_receipt_present(self):
        self.assertIn("875ecd6", self.src,
                      "KN052 commit hash must be present (empirical-velocity receipt anchor)")

    def test_monolith_1_b133(self):
        self.assertIn("B133", self.src,
                      "Monolith #1 B133 must be present")

    def test_monolith_2_bp002(self):
        self.assertIn("BP002", self.src,
                      "Monolith #2 BP002 must be present")

    def test_monolith_3_bp005(self):
        self.assertIn("BP005", self.src,
                      "Monolith #3 BP005 (close) must be present")

    def test_events_array_defined(self):
        self.assertIn("const EVENTS: TimelineEvent[]", self.src,
                      "EVENTS array must be typed as TimelineEvent[]")

    def test_min_event_count(self):
        count = len(re.findall(r"^\s+id:\s+'[^']+',", self.src, re.MULTILINE))
        self.assertGreaterEqual(count, 15,
                                f"Timeline must have 15+ events; found {count}")


class T03_MarkersDisplay(unittest.TestCase):
    """Markers display correctly: all marker types defined with correct colors."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def test_patent_marker_type(self):
        self.assertIn("'patent'", self.src,
                      "Patent marker type must be defined")

    def test_patent_marker_gold(self):
        self.assertIn("#f59e0b", self.src,
                      "Patent markers must be gold (#f59e0b) per spec")

    def test_monolith_marker_type(self):
        self.assertIn("'monolith'", self.src,
                      "Monolith marker type must be defined")

    def test_bean_marker_type(self):
        self.assertIn("'bean'", self.src,
                      "Bean marker type must be defined")

    def test_conference_marker_type(self):
        self.assertIn("'conference'", self.src,
                      "Conference marker type must be defined")

    def test_pcc_bangkok_present(self):
        self.assertIn("Bangkok", self.src,
                      "PCC Bangkok conference marker must be present")

    def test_indl9_geneva_present(self):
        self.assertIn("Geneva", self.src,
                      "INDL-9 Geneva conference marker must be present")

    def test_consecutive_clean_counter(self):
        self.assertIn("95+", self.src,
                      "95+ consecutive clean bean counter must be shown on timeline")


class T04_HoverTooltips(unittest.TestCase):
    """Hover-tooltips / detail panel: selected event shows detail card."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def test_selected_state_present(self):
        self.assertIn("selectedId", self.src,
                      "selectedId state must exist for click-to-select behavior")

    def test_detail_card_present(self):
        self.assertIn("detailCard", self.src,
                      "Detail card style must exist for selected event display")

    def test_on_select_handler(self):
        self.assertIn("onSelect", self.src,
                      "onSelect handler must exist for marker click events")

    def test_detail_shows_description(self):
        self.assertIn("detailDesc", self.src,
                      "Detail card must show event description (detailDesc)")

    def test_aria_label_on_markers(self):
        self.assertIn("aria-label", self.src,
                      "Timeline markers must have aria-label for accessibility")


class T05_ResponsiveOnMobile(unittest.TestCase):
    """Responsive on mobile: overflowX auto + flexWrap for controls."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def test_overflow_x_auto(self):
        self.assertIn("overflowX: 'auto'", self.src,
                      "Timeline wrapper must have overflowX: auto for horizontal scroll on mobile")

    def test_flexwrap_controls(self):
        self.assertIn("flexWrap: 'wrap'", self.src,
                      "Controls row must flexWrap for mobile responsiveness")

    def test_min_svg_width(self):
        self.assertIn("Math.max(900", self.src,
                      "SVG width must have a minimum of 900px (expands for more events)")

    def test_svg_role_img(self):
        self.assertIn('role="img"', self.src,
                      "SVG must have role='img' for accessibility")


class T06_DateRangeFilter(unittest.TestCase):
    """Date-range filter: useMemo filter on dateFrom/dateTo."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def test_date_from_state(self):
        self.assertIn("dateFrom", self.src,
                      "dateFrom state must be present for date range filter")

    def test_date_to_state(self):
        self.assertIn("dateTo", self.src,
                      "dateTo state must be present for date range filter")

    def test_date_inputs_present(self):
        count = self.src.count('type="date"')
        self.assertGreaterEqual(count, 2,
                                "Must have at least 2 date inputs (from + to)")

    def test_usememo_filter(self):
        self.assertIn("useMemo", self.src,
                      "Filtered events must use useMemo for performance")

    def test_filter_aria_labels(self):
        self.assertIn("Filter start date", self.src,
                      "Date inputs must have aria-labels for accessibility")


class T07_PatentMarkerClickthrough(unittest.TestCase):
    """Patent-marker clickthrough to USPTO Patent Center."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def test_uspto_url_present(self):
        self.assertIn("patentcenter.uspto.gov", self.src,
                      "USPTO Patent Center URL must be present for patent marker clickthrough")

    def test_url_field_in_events(self):
        self.assertIn("url?: string", self.src,
                      "TimelineEvent interface must have optional url field")

    def test_url_onclick_opens_external(self):
        self.assertIn("window.open", self.src,
                      "Patent marker URL must open via window.open for external navigation")

    def test_conversion_deadline_present(self):
        self.assertIn("2026-11-26", self.src,
                      "Conversion deadline (2026-11-26) must be on the timeline")


class T08_MonolithMarkerSummary(unittest.TestCase):
    """Monolith-marker shows session-closeout summary."""

    def setUp(self):
        self.src = _read(_COMPONENT)

    def test_monolith_type_in_events(self):
        monolith_events = re.findall(r"type:\s+'monolith'", self.src)
        self.assertGreaterEqual(len(monolith_events), 3,
                                "Must have at least 3 monolith events (B133 / BP002 / BP005)")

    def test_monolith_descriptions_substantive(self):
        # Verify at least one monolith has a description containing session data
        self.assertIn("consecutive clean", self.src,
                      "Monolith #3 (BP005) description must mention consecutive clean beans")

    def test_monolith_color_purple(self):
        self.assertIn("'#8b5cf6'", self.src,
                      "Monolith markers must be purple (#8b5cf6) to distinguish from patent gold")

    def test_empirical_velocity_callout(self):
        self.assertIn("84 sessions in 12 days", self.src,
                      "Empirical-velocity callout must show '84 sessions in 12 days'")

    def test_empirical_velocity_baseline(self):
        self.assertIn("421 sessions", self.src,
                      "Empirical-velocity callout must show '421 sessions' baseline for comparison")

    def test_cross_link_to_glossary(self):
        self.assertIn("onNavigate?.('glossary')", self.src,
                      "Timeline must cross-link to glossary view (KN069 compose)")


if __name__ == "__main__":
    result = unittest.main(verbosity=2, exit=False)
    n = result.result.testsRun
    failures = len(result.result.failures) + len(result.result.errors)
    print(f"\n{'='*60}")
    print(f"KN070 VisualTimelinePanel Tests: {n - failures}/{n} passed")
    if failures:
        sys.exit(1)
