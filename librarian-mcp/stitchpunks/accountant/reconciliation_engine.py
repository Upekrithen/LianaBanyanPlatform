"""
Reconciliation Engine — KN029 Component 1

Matches Liner Notes (KN027) + Shutterbug captures (KN028) + KN012 context
snapshots to construct per-bean cost observations.

Algorithm:
  1. Load Liner Notes for session → extract bean_start/bean_end markers
  2. Load Shutterbug manifest → count captures per bean time-window
  3. Load KN012 snapshot tablet → find context% readings per bean
  4. For each bean:
     - measured_pp = context_pct_after - context_pct_before
     - liner_notes_count = count of liner_note records during bean
     - brainscans_count = count of brainscan records during bean
     - screenshots_count = count of Shutterbug captures during bean time-window
  5. Compute pod-level aggregates

Bean attribution uses timestamps when both start+end have wall_time_iso.
Falls back to sequential attribution when timestamps absent.

Output: List[BeanLedgerRow] — fed to ledger_writer for CSV/JSONL/md output.

Toolsmith log: TS-ACCOUNTANT-SCRIBE-KN029-BP003
"""

from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE.parent))


def _parse_iso(ts: Optional[str]) -> Optional[float]:
    """Parse ISO timestamp to Unix float. Returns None on failure."""
    if not ts:
        return None
    try:
        dt = datetime.fromisoformat(ts.rstrip("Z").replace("+00:00", ""))
        return dt.replace(tzinfo=timezone.utc).timestamp()
    except Exception:
        return None


def _classify_session_position(bean_index: int, total_beans: int) -> str:
    """
    Classify session position per KN025 vocabulary.
    pod_first / pod_middle / pod_last
    """
    if total_beans <= 1:
        return "pod_first"
    if bean_index == 0:
        return "pod_first"
    if bean_index == total_beans - 1:
        return "pod_last"
    return "pod_middle"


class BeanLedgerRow:
    """Single bean's reconciled CheckBook entry."""

    COLUMNS = [
        "bean_id",
        "pod_id",
        "session_id",
        "bean_class",
        "session_position_class",
        "predicted_pp",
        "context_pct_before",
        "context_pct_after",
        "measured_pp",
        "residual_pp",
        "liner_notes_count",
        "brainscans_count",
        "screenshots_count",
        "files_changed",
        "insertions",
        "tests_passed",
        "tests_total",
        "outcome",
        "wall_time_start",
        "wall_time_end",
        "notes",
    ]

    def __init__(self, **kwargs: Any) -> None:
        for col in self.COLUMNS:
            setattr(self, col, kwargs.get(col, ""))
        # Ensure numeric fields default to 0 not ""
        for numeric in (
            "predicted_pp", "context_pct_before", "context_pct_after",
            "measured_pp", "residual_pp", "liner_notes_count",
            "brainscans_count", "screenshots_count",
            "files_changed", "insertions", "tests_passed", "tests_total",
        ):
            val = getattr(self, numeric)
            if val == "" or val is None:
                setattr(self, numeric, 0.0 if numeric.endswith("_pp") or numeric.startswith("context") else 0)

    def compute_derived(self) -> None:
        """Compute measured_pp and residual_pp from snapshots."""
        before = self.context_pct_before
        after = self.context_pct_after
        if isinstance(before, (int, float)) and isinstance(after, (int, float)) and after > 0:
            self.measured_pp = round(float(after) - float(before), 2)
        if isinstance(self.measured_pp, (int, float)) and isinstance(self.predicted_pp, (int, float)):
            self.residual_pp = round(float(self.measured_pp) - float(self.predicted_pp), 2)

    def to_dict(self) -> Dict[str, Any]:
        return {col: getattr(self, col) for col in self.COLUMNS}

    def to_csv_row(self) -> str:
        """Single CSV data row (no header)."""
        def _esc(v: Any) -> str:
            s = str(v) if v != "" else ""
            if "," in s or '"' in s or "\n" in s:
                return '"' + s.replace('"', '""') + '"'
            return s
        return ",".join(_esc(getattr(self, col)) for col in self.COLUMNS)

    @staticmethod
    def csv_header() -> str:
        return ",".join(BeanLedgerRow.COLUMNS)

    def to_md_row(self) -> str:
        """Single Markdown table row."""
        def _fmt(col: str, v: Any) -> str:
            if col in ("measured_pp", "residual_pp", "predicted_pp"):
                if isinstance(v, float):
                    return f"{v:+.2f}pp" if col == "residual_pp" else f"{v:.2f}pp"
            if col in ("context_pct_before", "context_pct_after"):
                return f"{v:.1f}%" if isinstance(v, (int, float)) and v else str(v)
            return str(v) if v != "" else "—"
        return "| " + " | ".join(_fmt(col, getattr(self, col)) for col in self.COLUMNS) + " |"

    @staticmethod
    def md_header() -> str:
        cols = BeanLedgerRow.COLUMNS
        header = "| " + " | ".join(cols) + " |"
        separator = "|" + "|".join("---" for _ in cols) + "|"
        return header + "\n" + separator


class ReconciliationEngine:
    """
    Reconciles three data sources into per-bean BeanLedgerRows.

    Sources:
      - Liner Notes JSONL (KN027): bean_start/bean_end/liner_note/brainscan records
      - Shutterbug manifest JSONL (KN028): per-capture records with timestamps
      - KN012 snapshot tablet: context% at threshold crossings

    All sources are optional — engine degrades gracefully when any is absent.
    """

    def __init__(
        self,
        session_id: str,
        pod_id: str = "",
        liner_notes_records: Optional[List[Dict[str, Any]]] = None,
        shutterbug_records: Optional[List[Dict[str, Any]]] = None,
        kn012_snapshot_records: Optional[List[Dict[str, Any]]] = None,
    ) -> None:
        self.session_id = session_id
        self.pod_id = pod_id
        self._liner_notes = liner_notes_records or []
        self._shutterbug = shutterbug_records or []
        self._kn012 = kn012_snapshot_records or []

    @classmethod
    def from_session(cls, session_id: str, pod_id: str = "") -> "ReconciliationEngine":
        """
        Load all three sources from the Stone Tablets on disk for a session.
        Gracefully handles missing sources.
        """
        liner_notes: List[Dict[str, Any]] = []
        shutterbug: List[Dict[str, Any]] = []
        kn012: List[Dict[str, Any]] = []

        # Load Liner Notes (KN027)
        try:
            from stenographer.liner_notes_writer import load_session
            liner_notes = load_session(session_id)
        except Exception as exc:
            print(f"[Accountant] Liner Notes load error: {exc}", file=sys.stderr)

        # Load Shutterbug manifest (KN028)
        try:
            from shutterbug.shutterbug_scribe import load_manifest
            shutterbug = load_manifest(session_id)
        except Exception as exc:
            print(f"[Accountant] Shutterbug manifest load error: {exc}", file=sys.stderr)

        # Load KN012 snapshot tablet
        try:
            from snapshot.snapshot_watcher import load_snapshots
            all_snaps = load_snapshots()
            # Filter to this session's snapshots
            kn012 = [
                s for s in all_snaps
                if s.get("session_id") == session_id or s.get("bean_id", "").startswith("KN")
            ]
        except Exception as exc:
            print(f"[Accountant] KN012 snapshot load error: {exc}", file=sys.stderr)

        return cls(
            session_id=session_id,
            pod_id=pod_id,
            liner_notes_records=liner_notes,
            shutterbug_records=shutterbug,
            kn012_snapshot_records=kn012,
        )

    def reconcile(self) -> List[BeanLedgerRow]:
        """
        Run the reconciliation. Returns one BeanLedgerRow per bean in declared order.
        """
        # Extract bean boundary records
        bean_starts = {
            r["bean_id"]: r
            for r in self._liner_notes
            if r.get("type") == "bean_start"
        }
        bean_ends = {
            r["bean_id"]: r
            for r in self._liner_notes
            if r.get("type") == "bean_end"
        }
        # Ordered list of bean IDs (by wall_time_iso of bean_start)
        ordered_beans = sorted(
            bean_starts.keys(),
            key=lambda b: bean_starts[b].get("wall_time_iso", ""),
        )

        if not ordered_beans:
            # Fallback: extract from session_open bean_sequence
            for r in self._liner_notes:
                if r.get("type") == "session_open":
                    ordered_beans = r.get("bean_sequence", [])
                    break

        rows: List[BeanLedgerRow] = []
        total_beans = len(ordered_beans)

        for idx, bean_id in enumerate(ordered_beans):
            start_rec = bean_starts.get(bean_id, {})
            end_rec = bean_ends.get(bean_id, {})

            # Context % from bean records
            ctx_before = start_rec.get("context_pct_before")
            ctx_after = end_rec.get("context_pct_after")

            # Fallback: scan KN012 snapshots by time window
            if ctx_before is None or ctx_after is None:
                ctx_before, ctx_after = self._infer_context_from_kn012(
                    start_rec.get("wall_time_iso"), end_rec.get("wall_time_iso")
                )

            # Count liner notes and brainscans within this bean's time window
            t_start = _parse_iso(start_rec.get("wall_time_iso"))
            t_end = _parse_iso(end_rec.get("wall_time_iso"))
            ln_count, bs_count = self._count_notes_in_window(bean_id, t_start, t_end)

            # Count Shutterbug captures in this time window
            screenshot_count = self._count_screenshots_in_window(t_start, t_end, bean_id)

            # Session position class
            position_class = (
                start_rec.get("session_position_class")
                or _classify_session_position(idx, total_beans)
            )

            row = BeanLedgerRow(
                bean_id=bean_id,
                pod_id=self.pod_id,
                session_id=self.session_id,
                bean_class=start_rec.get("bean_class", ""),
                session_position_class=position_class,
                predicted_pp=float(start_rec.get("predicted_pp") or 0.0),
                context_pct_before=ctx_before if ctx_before is not None else "",
                context_pct_after=ctx_after if ctx_after is not None else "",
                liner_notes_count=ln_count,
                brainscans_count=bs_count,
                screenshots_count=screenshot_count,
                files_changed=int(end_rec.get("files_changed") or 0),
                insertions=int(end_rec.get("insertions") or 0),
                tests_passed=int(end_rec.get("tests_passed") or 0),
                tests_total=int(end_rec.get("tests_total") or 0),
                outcome=end_rec.get("outcome", "unknown"),
                wall_time_start=start_rec.get("wall_time_iso", ""),
                wall_time_end=end_rec.get("wall_time_iso", ""),
            )
            row.compute_derived()
            rows.append(row)

        return rows

    def compute_pod_summary(self, rows: List[BeanLedgerRow]) -> Dict[str, Any]:
        """Aggregate statistics for the pod."""
        landed = [r for r in rows if r.outcome == "landed"]
        measured_pp_values = [
            r.measured_pp for r in rows
            if isinstance(r.measured_pp, (int, float)) and r.measured_pp > 0
        ]
        total_measured = round(sum(measured_pp_values), 2) if measured_pp_values else None
        mean_pp = (
            round(total_measured / len(measured_pp_values), 2)
            if measured_pp_values and total_measured is not None
            else None
        )
        total_predicted = round(
            sum(float(r.predicted_pp) for r in rows if r.predicted_pp), 2
        )

        scenario: str
        if measured_pp_values:
            if len(landed) == len(rows) and (mean_pp or 0) < 15:
                scenario = "A"
            elif len(landed) < len(rows) or (mean_pp or 0) > 25:
                scenario = "C"
            else:
                scenario = "B"
        else:
            scenario = "unknown"

        return {
            "session_id": self.session_id,
            "pod_id": self.pod_id,
            "total_beans": len(rows),
            "beans_landed": len(landed),
            "total_measured_pp": total_measured,
            "total_predicted_pp": total_predicted,
            "mean_pp_per_bean": mean_pp,
            "total_liner_notes": sum(int(r.liner_notes_count) for r in rows),
            "total_brainscans": sum(int(r.brainscans_count) for r in rows),
            "total_screenshots": sum(int(r.screenshots_count) for r in rows),
            "scenario_verdict": scenario,
        }

    # ── Private helpers ────────────────────────────────────────────────────────

    def _count_notes_in_window(
        self,
        bean_id: str,
        t_start: Optional[float],
        t_end: Optional[float],
    ) -> Tuple[int, int]:
        """Count (liner_notes, brainscans) for a bean, by bean_id attribution."""
        ln_count = 0
        bs_count = 0
        for r in self._liner_notes:
            if r.get("bean_id") != bean_id:
                continue
            if r.get("type") == "liner_note":
                ln_count += 1
            elif r.get("type") == "brainscan":
                bs_count += 1
        return ln_count, bs_count

    def _count_screenshots_in_window(
        self,
        t_start: Optional[float],
        t_end: Optional[float],
        bean_id: str,
    ) -> int:
        """Count Shutterbug captures for a bean by bean_id or time window."""
        count = 0
        for r in self._shutterbug:
            # Prefer bean_id attribution
            if r.get("bean_id") == bean_id:
                count += 1
                continue
            # Fallback: time window
            if t_start is not None and t_end is not None:
                t_cap = _parse_iso(r.get("wall_time_iso") or r.get("captured_at"))
                if t_cap is not None and t_start <= t_cap <= t_end:
                    count += 1
        return count

    def _infer_context_from_kn012(
        self,
        t_start_iso: Optional[str],
        t_end_iso: Optional[str],
    ) -> Tuple[Optional[float], Optional[float]]:
        """
        Infer context_pct_before and _after from KN012 snapshots within time window.
        Returns (first_in_window, last_in_window) context%.
        """
        t_start = _parse_iso(t_start_iso)
        t_end = _parse_iso(t_end_iso)
        if t_start is None or t_end is None:
            return None, None

        in_window = []
        for snap in self._kn012:
            t_snap = _parse_iso(snap.get("snapped_at"))
            if t_snap is not None and t_start <= t_snap <= t_end:
                pct = snap.get("context_budget_percent")
                if pct is not None:
                    in_window.append((t_snap, pct))

        if not in_window:
            return None, None
        in_window.sort(key=lambda x: x[0])
        return in_window[0][1], in_window[-1][1]
