"""
provisional_risk_audit.py — KN073 / BP006
Provisional Patent Risk-Audit Matrix Tool
Liana Banyan Corporation (Wyoming C-Corp)

Scores 15 filed provisional patent applications against a 3-criterion rubric
and outputs a sortable HTML matrix + Markdown twin, counsel-ready.

Rubric (each criterion scored 1–5):
  C1 Enabling disclosure
  C2 Variation coverage
  C3 Human-conception clarity

Composite risk = 15 - (C1 + C2 + C3)
  0-3  → low      (green)
  4-7  → moderate (yellow)
  8-12 → high     (red)
"""

from __future__ import annotations

import copy
import json
import os
from datetime import date
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Default provisional data (used as the canonical starting state)
# ---------------------------------------------------------------------------

PROVISIONALS_DEFAULT: list[dict] = [
    {
        "prov_num": 1,
        "app_num": "unknown",
        "filed": "2025-01-01",
        "title": "Provisional Application 1 (earlier filing)",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "",
    },
    {
        "prov_num": 2,
        "app_num": "unknown",
        "filed": "2025-01-01",
        "title": "Provisional Application 2 (earlier filing)",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "",
    },
    {
        "prov_num": 3,
        "app_num": "unknown",
        "filed": "2025-01-01",
        "title": "Provisional Application 3 (earlier filing)",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "",
    },
    {
        "prov_num": 4,
        "app_num": "unknown",
        "filed": "2025-01-01",
        "title": "Provisional Application 4 (earlier filing)",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "",
    },
    {
        "prov_num": 5,
        "app_num": "unknown",
        "filed": "2025-01-01",
        "title": "Provisional Application 5 (earlier filing)",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "",
    },
    {
        "prov_num": 6,
        "app_num": "unknown",
        "filed": "2025-01-01",
        "title": "Provisional Application 6 (earlier filing)",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "",
    },
    {
        "prov_num": 7,
        "app_num": "unknown",
        "filed": "2025-01-01",
        "title": "Provisional Application 7 (earlier filing)",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "",
    },
    {
        "prov_num": 8,
        "app_num": "unknown",
        "filed": "2025-01-01",
        "title": "Provisional Application 8 (earlier filing)",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "",
    },
    {
        "prov_num": 9,
        "app_num": "unknown",
        "filed": "2025-01-01",
        "title": "Provisional Application 9 (earlier filing)",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "",
    },
    {
        "prov_num": 10,
        "app_num": "unknown",
        "filed": "2025-01-01",
        "title": "Provisional Application 10 (earlier filing)",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "",
    },
    {
        "prov_num": 11,
        "app_num": "unknown",
        "filed": "2025-01-01",
        "title": "Provisional Application 11 (earlier filing)",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "",
    },
    {
        "prov_num": 12,
        "app_num": "unknown",
        "filed": "2025-01-01",
        "title": "Provisional Application 12 (earlier filing)",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "",
    },
    {
        "prov_num": 13,
        "app_num": "64/036,646",
        "filed": "2026-04-12",
        "title": "Cooperative-Platform AI Memory Infrastructure",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "First of the 2026 spring filings.",
    },
    {
        "prov_num": 14,
        "app_num": "64/052,602",
        "filed": "2026-04-29",
        "title": "Cooperative-Platform AI Memory Infrastructure with Discipline-Enforcement Federation",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "Discipline-enforcement federation variant.",
    },
    {
        "prov_num": 15,
        "app_num": "64/052,618",
        "filed": "2026-04-29",
        "title": "AI Memory Architecture with Substrate Pre-Injection, Vendor-Layer Capture, and Discipline Primitives",
        "c1": None, "c2": None, "c3": None,
        "c1_override_note": "", "c2_override_note": "", "c3_override_note": "",
        "notes": "Substrate pre-injection + vendor-layer capture variant.",
    },
]

# Gap-fill language templates keyed by criterion shortname
GAP_FILL = {
    "c1": (
        "Add: concrete data-flow diagram showing [X] implementation steps; "
        "provide enough detail for a person skilled in AI memory systems to "
        "implement without significant gaps."
    ),
    "c2": (
        "Add: variation axes for [X]: at minimum 3 alternative embodiments "
        "(e.g., different storage backends, different trigger conditions, "
        "different federation configurations)."
    ),
    "c3": (
        "Add: explicit human-conception narrative — who conceived the idea, "
        "when, what the specific inventive insight was; clarify AI tool used "
        "only for drafting assistance, not conception."
    ),
}

# Default synthetic scores for provisionals whose source docs are not on disk
_SYNTHETIC_SCORES: dict[int, tuple[int, int, int]] = {
    13: (3, 2, 4),
    14: (4, 3, 4),
    15: (4, 3, 4),
}
_DEFAULT_SYNTHETIC_SCORES: tuple[int, int, int] = (2, 2, 3)


# ---------------------------------------------------------------------------
# Core scoring logic
# ---------------------------------------------------------------------------

def compute_risk(c1: Optional[int], c2: Optional[int], c3: Optional[int]) -> tuple[Optional[int], str]:
    """Return (composite_risk, risk_level).

    If any criterion is None, returns (None, 'unscored').
    """
    if c1 is None or c2 is None or c3 is None:
        return None, "unscored"
    risk = 15 - (c1 + c2 + c3)
    if risk <= 3:
        level = "low"
    elif risk <= 7:
        level = "moderate"
    else:
        level = "high"
    return risk, level


# ---------------------------------------------------------------------------
# Persistence
# ---------------------------------------------------------------------------

def load_scores(path: str | Path) -> list[dict]:
    """Load provisional scores from JSON; return defaults if file not found."""
    p = Path(path)
    if not p.exists():
        return copy.deepcopy(PROVISIONALS_DEFAULT)
    with open(p, encoding="utf-8") as fh:
        data = json.load(fh)
    # Merge loaded data over defaults (handles partial files gracefully)
    defaults_by_num = {d["prov_num"]: copy.deepcopy(d) for d in PROVISIONALS_DEFAULT}
    for row in data:
        num = row.get("prov_num")
        if num in defaults_by_num:
            defaults_by_num[num].update(row)
    return list(defaults_by_num.values())


def save_scores(provisionals: list[dict], path: str | Path) -> None:
    """Persist current scores to JSON."""
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as fh:
        json.dump(provisionals, fh, indent=2)


# ---------------------------------------------------------------------------
# Synthetic scoring
# ---------------------------------------------------------------------------

def score_provisional_synthetic(prov_num: int) -> tuple[int, int, int]:
    """Return (c1, c2, c3) educated-guess scores for testing.

    Prov 13: C1=3, C2=2, C3=4 — concept-level disclosure, single embodiment,
             good human-conception trail.
    Prov 14: C1=4, C2=3, C3=4 — better disclosure, some variation coverage.
    Prov 15: C1=4, C2=3, C3=4 — similar to Prov 14.
    Others:  C1=2, C2=2, C3=3 — conservative defaults for unknown older apps.
    """
    return _SYNTHETIC_SCORES.get(prov_num, _DEFAULT_SYNTHETIC_SCORES)


def apply_synthetic_where_missing(provisionals: list[dict]) -> list[dict]:
    """Apply synthetic scores to any provisional that has no scores yet."""
    result = []
    for row in provisionals:
        r = copy.deepcopy(row)
        if r["c1"] is None and r["c2"] is None and r["c3"] is None:
            c1, c2, c3 = score_provisional_synthetic(r["prov_num"])
            r["c1"] = c1
            r["c2"] = c2
            r["c3"] = c3
            r["notes"] = (r.get("notes") or "") + " [synthetic scores applied]"
        result.append(r)
    return result


# ---------------------------------------------------------------------------
# Override
# ---------------------------------------------------------------------------

def apply_override(
    provisionals: list[dict],
    prov_num: int,
    criterion: str,
    score: int,
    note: str,
) -> list[dict]:
    """Apply a manual override to a provisional's score.

    criterion must be 'c1', 'c2', or 'c3'.
    Returns updated list (does not mutate input).
    """
    if criterion not in ("c1", "c2", "c3"):
        raise ValueError(f"criterion must be c1/c2/c3; got {criterion!r}")
    if not (1 <= score <= 5):
        raise ValueError(f"score must be 1-5; got {score}")
    result = copy.deepcopy(provisionals)
    for row in result:
        if row["prov_num"] == prov_num:
            row[criterion] = score
            row[f"{criterion}_override_note"] = note
            break
    return result


# ---------------------------------------------------------------------------
# Aggregate summary
# ---------------------------------------------------------------------------

def aggregate_summary(provisionals: list[dict]) -> dict:
    """Return distribution counts and top-3 highest-risk provisionals."""
    distribution = {"low": 0, "moderate": 0, "high": 0, "unscored": 0}
    scored_rows = []
    for row in provisionals:
        risk, level = compute_risk(row.get("c1"), row.get("c2"), row.get("c3"))
        distribution[level] = distribution.get(level, 0) + 1
        if risk is not None:
            scored_rows.append((risk, row["prov_num"], row["title"]))
    scored_rows.sort(key=lambda x: x[0], reverse=True)
    top_3 = [
        {"prov_num": pn, "title": t, "risk": r}
        for r, pn, t in scored_rows[:3]
    ]
    return {"distribution": distribution, "top_3_high_risk": top_3}


# ---------------------------------------------------------------------------
# HTML output
# ---------------------------------------------------------------------------

_RISK_COLORS = {
    "low": "#c6efce",       # green
    "moderate": "#ffeb9c",  # yellow
    "high": "#ffc7ce",      # red
    "unscored": "#f2f2f2",  # light grey
}

_RISK_TEXT_COLORS = {
    "low": "#276221",
    "moderate": "#9c5700",
    "high": "#9c0006",
    "unscored": "#666666",
}


def _criterion_drilldown(row: dict) -> str:
    """Build tooltip/drilldown HTML for a row showing gap-fill language."""
    parts = []
    for crit in ("c1", "c2", "c3"):
        score = row.get(crit)
        label = {"c1": "C1 Enabling Disclosure", "c2": "C2 Variation Coverage",
                 "c3": "C3 Human-Conception Clarity"}[crit]
        if score is not None and score <= 2:
            gap = GAP_FILL[crit]
            parts.append(
                f"<div class='gap-item'><strong>{label} [{score}/5]:</strong> "
                f"<span class='gap-text'>{gap}</span></div>"
            )
        elif score is not None:
            parts.append(
                f"<div class='gap-item ok'><strong>{label}:</strong> "
                f"<span class='gap-ok'>{score}/5 — adequate</span></div>"
            )
        else:
            parts.append(
                f"<div class='gap-item'><strong>{label}:</strong> "
                f"<span class='gap-unscored'>Not yet scored</span></div>"
            )
        override = row.get(f"{crit}_override_note", "")
        if override:
            parts.append(f"<div class='override-note'>Override note: {override}</div>")
    return "".join(parts)


def generate_html_matrix(provisionals: list[dict]) -> str:
    """Return HTML string of sortable, color-coded risk matrix."""
    today = date.today().isoformat()
    summary = aggregate_summary(provisionals)
    dist = summary["distribution"]
    top3 = summary["top_3_high_risk"]

    top3_html = "".join(
        f"<li>Prov {t['prov_num']} — {t['title']} (risk score: {t['risk']})</li>"
        for t in top3
    )

    rows_html_parts = []
    for row in sorted(provisionals, key=lambda r: r["prov_num"]):
        risk, level = compute_risk(row.get("c1"), row.get("c2"), row.get("c3"))
        bg = _RISK_COLORS[level]
        fg = _RISK_TEXT_COLORS[level]
        risk_display = str(risk) if risk is not None else "—"
        level_badge = level.upper()
        c1_display = str(row.get("c1")) if row.get("c1") is not None else "—"
        c2_display = str(row.get("c2")) if row.get("c2") is not None else "—"
        c3_display = str(row.get("c3")) if row.get("c3") is not None else "—"
        drilldown = _criterion_drilldown(row)
        row_id = f"prov-{row['prov_num']}"
        notes = row.get("notes", "") or ""

        rows_html_parts.append(f"""
        <tr style="background:{bg};color:{fg}" data-risk="{risk if risk is not None else 999}">
          <td class="prov-num">{row['prov_num']}</td>
          <td class="app-num">{row['app_num']}</td>
          <td class="filed">{row['filed']}</td>
          <td class="title-cell">
            <button class="drilldown-btn" onclick="toggleDrilldown('{row_id}')">&#9660;</button>
            {row['title']}
          </td>
          <td class="score-cell">{c1_display}</td>
          <td class="score-cell">{c2_display}</td>
          <td class="score-cell">{c3_display}</td>
          <td class="risk-cell" style="font-weight:bold">{risk_display}</td>
          <td class="level-cell"><span class="badge level-{level}">{level_badge}</span></td>
        </tr>
        <tr id="{row_id}" class="drilldown-row" style="display:none;background:{bg}">
          <td colspan="9">
            <div class="drilldown-inner">
              {drilldown}
              {"<div class='notes-row'><strong>Notes:</strong> " + notes + "</div>" if notes else ""}
            </div>
          </td>
        </tr>""")

    rows_html = "\n".join(rows_html_parts)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Provisional Risk-Audit Matrix — KN073 / BP006</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: "Segoe UI", Arial, sans-serif;
      background: #f8f9fa;
      color: #222;
      padding: 24px;
    }}
    header {{
      background: #1a1a2e;
      color: #fff;
      padding: 20px 28px;
      border-radius: 8px 8px 0 0;
      margin-bottom: 0;
    }}
    header h1 {{
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }}
    header p {{ font-size: 0.85rem; opacity: 0.8; margin-top: 4px; }}
    .summary-bar {{
      background: #16213e;
      color: #fff;
      padding: 14px 28px;
      display: flex;
      gap: 28px;
      flex-wrap: wrap;
      align-items: center;
      border-radius: 0;
    }}
    .badge-stat {{
      display: flex; align-items: center; gap: 6px; font-size: 0.88rem;
    }}
    .dot {{ width: 12px; height: 12px; border-radius: 50%; display: inline-block; }}
    .dot-low {{ background: #56c45e; }}
    .dot-moderate {{ background: #f0b429; }}
    .dot-high {{ background: #e53e3e; }}
    .dot-unscored {{ background: #aaa; }}
    .top3-panel {{
      background: #fff3cd;
      border-left: 4px solid #e53e3e;
      padding: 12px 20px;
      font-size: 0.88rem;
      margin-bottom: 16px;
    }}
    .top3-panel h3 {{ font-size: 0.9rem; margin-bottom: 6px; color: #9c0006; }}
    .top3-panel ul {{ padding-left: 18px; }}
    .controls {{
      display: flex; gap: 12px; margin: 12px 0 8px;
      flex-wrap: wrap;
    }}
    .controls button {{
      padding: 6px 14px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
      font-size: 0.83rem;
    }}
    .controls button:hover {{ background: #eee; }}
    .filter-active {{ background: #1a1a2e !important; color: #fff !important; border-color: #1a1a2e !important; }}
    .table-wrapper {{ overflow-x: auto; }}
    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 0.87rem;
      background: #fff;
      border-radius: 0 0 8px 8px;
      overflow: hidden;
    }}
    thead th {{
      background: #1a1a2e;
      color: #fff;
      padding: 10px 12px;
      text-align: left;
      cursor: pointer;
      white-space: nowrap;
      user-select: none;
    }}
    thead th:hover {{ background: #2a2a4e; }}
    thead th .sort-arrow {{ margin-left: 4px; opacity: 0.5; }}
    tbody tr {{ border-bottom: 1px solid rgba(0,0,0,0.08); transition: filter 0.1s; }}
    tbody tr:hover {{ filter: brightness(0.96); }}
    td {{ padding: 9px 12px; vertical-align: middle; }}
    .prov-num {{ font-weight: 700; text-align: center; min-width: 48px; }}
    .app-num {{ font-family: monospace; font-size: 0.82rem; white-space: nowrap; }}
    .filed {{ white-space: nowrap; }}
    .title-cell {{ min-width: 260px; }}
    .score-cell {{ text-align: center; font-weight: 600; min-width: 40px; }}
    .risk-cell {{ text-align: center; font-size: 1.05rem; min-width: 52px; }}
    .level-cell {{ text-align: center; min-width: 80px; }}
    .badge {{
      padding: 3px 9px; border-radius: 12px; font-size: 0.78rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
    }}
    .level-low {{ background: #c6efce; color: #276221; }}
    .level-moderate {{ background: #ffeb9c; color: #9c5700; }}
    .level-high {{ background: #ffc7ce; color: #9c0006; }}
    .level-unscored {{ background: #f2f2f2; color: #666; }}
    .drilldown-btn {{
      background: none; border: none; cursor: pointer;
      font-size: 0.8rem; margin-right: 6px; padding: 0 4px;
      color: inherit; opacity: 0.7;
    }}
    .drilldown-row td {{ padding: 0; }}
    .drilldown-inner {{
      padding: 12px 20px;
      border-top: 1px dashed rgba(0,0,0,0.2);
      font-size: 0.84rem;
    }}
    .gap-item {{ margin-bottom: 6px; }}
    .gap-item.ok .gap-ok {{ color: #276221; }}
    .gap-text {{ color: #9c0006; font-style: italic; }}
    .gap-unscored {{ color: #888; }}
    .override-note {{ color: #5a3e8f; font-size: 0.8rem; margin-left: 16px; }}
    .notes-row {{ margin-top: 8px; font-size: 0.83rem; color: #555; }}
    footer {{
      text-align: center; font-size: 0.78rem; color: #888;
      margin-top: 20px; padding: 12px;
    }}
    .pledge-note {{
      font-size: 0.78rem; color: #888;
      border-top: 1px solid #e0e0e0; padding-top: 8px; margin-top: 12px;
    }}
  </style>
</head>
<body>
  <header>
    <h1>Provisional Patent Risk-Audit Matrix</h1>
    <p>KN073 / BP006 &nbsp;·&nbsp; Liana Banyan Corporation (Wyoming C-Corp)
       &nbsp;·&nbsp; Generated: {today}</p>
  </header>

  <div class="summary-bar">
    <div class="badge-stat"><span class="dot dot-low"></span> Low risk: {dist.get('low', 0)}</div>
    <div class="badge-stat"><span class="dot dot-moderate"></span> Moderate: {dist.get('moderate', 0)}</div>
    <div class="badge-stat"><span class="dot dot-high"></span> High: {dist.get('high', 0)}</div>
    <div class="badge-stat"><span class="dot dot-unscored"></span> Unscored: {dist.get('unscored', 0)}</div>
  </div>

  <div class="top3-panel">
    <h3>Top-3 Highest-Risk Provisionals (from current run)</h3>
    <ul>{top3_html}</ul>
  </div>

  <div class="controls">
    <button onclick="filterRows('all')" id="btn-all" class="filter-active">All</button>
    <button onclick="filterRows('high')" id="btn-high">High Risk</button>
    <button onclick="filterRows('moderate')" id="btn-moderate">Moderate</button>
    <button onclick="filterRows('low')" id="btn-low">Low Risk</button>
    <button onclick="filterRows('unscored')" id="btn-unscored">Unscored</button>
    <button onclick="resetSort()" style="margin-left:auto">Reset Sort</button>
  </div>

  <div class="table-wrapper">
    <table id="auditTable">
      <thead>
        <tr>
          <th onclick="sortTable(0,'num')">Prov # <span class="sort-arrow">&#8597;</span></th>
          <th onclick="sortTable(1,'str')">App # <span class="sort-arrow">&#8597;</span></th>
          <th onclick="sortTable(2,'str')">Filed <span class="sort-arrow">&#8597;</span></th>
          <th onclick="sortTable(3,'str')">Title <span class="sort-arrow">&#8597;</span></th>
          <th onclick="sortTable(4,'num')">C1 <span class="sort-arrow">&#8597;</span></th>
          <th onclick="sortTable(5,'num')">C2 <span class="sort-arrow">&#8597;</span></th>
          <th onclick="sortTable(6,'num')">C3 <span class="sort-arrow">&#8597;</span></th>
          <th onclick="sortTable(7,'num')">Risk <span class="sort-arrow">&#8597;</span></th>
          <th onclick="sortTable(8,'str')">Level <span class="sort-arrow">&#8597;</span></th>
        </tr>
      </thead>
      <tbody id="tableBody">
        {rows_html}
      </tbody>
    </table>
  </div>

  <footer>
    <div class="pledge-note">
      Covered by the Liana Banyan Corporation Cooperative Defensive Patent Pledge (#2260).
      These provisionals are filed for defensive purposes to protect the cooperative membership platform.
      Not for offensive enforcement.
    </div>
    <p style="margin-top:8px">
      Rubric: C1 Enabling Disclosure · C2 Variation Coverage · C3 Human-Conception Clarity
      (each 1–5) · Composite Risk = 15 − (C1+C2+C3) · Range 0–12
    </p>
  </footer>

  <script>
    var currentSort = {{col: -1, dir: 1}};
    var currentFilter = 'all';

    function toggleDrilldown(id) {{
      var el = document.getElementById(id);
      if (el) el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
    }}

    function sortTable(col, type) {{
      var tbody = document.getElementById('tableBody');
      var rows = Array.from(tbody.querySelectorAll('tr:not(.drilldown-row)'));
      var dir = (currentSort.col === col) ? -currentSort.dir : 1;
      currentSort = {{col: col, dir: dir}};
      rows.sort(function(a, b) {{
        var aVal = a.cells[col] ? a.cells[col].textContent.trim() : '';
        var bVal = b.cells[col] ? b.cells[col].textContent.trim() : '';
        if (type === 'num') {{
          var aNum = parseFloat(aVal) || (dir > 0 ? 99999 : -99999);
          var bNum = parseFloat(bVal) || (dir > 0 ? 99999 : -99999);
          return (aNum - bNum) * dir;
        }}
        return aVal.localeCompare(bVal) * dir;
      }});
      rows.forEach(function(row) {{
        var drillId = row.querySelector('.drilldown-btn') ?
          row.querySelector('.drilldown-btn').getAttribute('onclick').match(/'([^']+)'/)[1] : null;
        tbody.appendChild(row);
        if (drillId) {{
          var dd = document.getElementById(drillId);
          if (dd) tbody.appendChild(dd);
        }}
      }});
      applyCurrentFilter();
    }}

    function resetSort() {{
      var tbody = document.getElementById('tableBody');
      var rows = Array.from(tbody.querySelectorAll('tr:not(.drilldown-row)'));
      rows.sort(function(a, b) {{
        return parseInt(a.cells[0].textContent) - parseInt(b.cells[0].textContent);
      }});
      rows.forEach(function(row) {{
        var drillId = row.querySelector('.drilldown-btn') ?
          row.querySelector('.drilldown-btn').getAttribute('onclick').match(/'([^']+)'/)[1] : null;
        tbody.appendChild(row);
        if (drillId) {{
          var dd = document.getElementById(drillId);
          if (dd) tbody.appendChild(dd);
        }}
      }});
      currentSort = {{col: -1, dir: 1}};
      applyCurrentFilter();
    }}

    function filterRows(level) {{
      currentFilter = level;
      document.querySelectorAll('.controls button[id^=btn-]').forEach(function(b) {{
        b.classList.remove('filter-active');
      }});
      var btn = document.getElementById('btn-' + level);
      if (btn) btn.classList.add('filter-active');
      applyCurrentFilter();
    }}

    function applyCurrentFilter() {{
      var tbody = document.getElementById('tableBody');
      tbody.querySelectorAll('tr:not(.drilldown-row)').forEach(function(row) {{
        var badge = row.querySelector('.badge');
        var levelClass = badge ? badge.className.replace('badge level-','').trim() : 'unscored';
        var show = (currentFilter === 'all' || levelClass === currentFilter);
        row.style.display = show ? '' : 'none';
        var drillBtn = row.querySelector('.drilldown-btn');
        if (drillBtn) {{
          var drillId = drillBtn.getAttribute('onclick').match(/'([^']+)'/)[1];
          var dd = document.getElementById(drillId);
          if (dd && !show) dd.style.display = 'none';
        }}
      }});
    }}
  </script>
</body>
</html>"""


# ---------------------------------------------------------------------------
# Markdown output
# ---------------------------------------------------------------------------

def generate_md_matrix(provisionals: list[dict]) -> str:
    """Return Markdown table of the risk matrix (counsel-ready twin)."""
    today = date.today().isoformat()
    summary = aggregate_summary(provisionals)
    dist = summary["distribution"]
    top3 = summary["top_3_high_risk"]

    lines = [
        "# Provisional Patent Risk-Audit Matrix",
        "",
        f"**KN073 / BP006** · Liana Banyan Corporation (Wyoming C-Corp) · Generated: {today}",
        "",
        "## Aggregate Summary",
        "",
        f"| Low Risk | Moderate | High Risk | Unscored |",
        f"|----------|----------|-----------|---------|",
        f"| {dist.get('low', 0)} | {dist.get('moderate', 0)} | {dist.get('high', 0)} | {dist.get('unscored', 0)} |",
        "",
        "### Top-3 Highest-Risk Provisionals",
        "",
    ]
    for t in top3:
        lines.append(f"- **Prov {t['prov_num']}** — {t['title']} (risk score: {t['risk']})")
    lines.append("")
    lines.append("## Risk Matrix")
    lines.append("")
    lines.append("| Prov # | App # | Filed | Title | C1 | C2 | C3 | Risk | Level |")
    lines.append("|--------|-------|-------|-------|----|----|----|------|-------|")

    for row in sorted(provisionals, key=lambda r: r["prov_num"]):
        risk, level = compute_risk(row.get("c1"), row.get("c2"), row.get("c3"))
        risk_display = str(risk) if risk is not None else "—"
        c1 = str(row.get("c1")) if row.get("c1") is not None else "—"
        c2 = str(row.get("c2")) if row.get("c2") is not None else "—"
        c3 = str(row.get("c3")) if row.get("c3") is not None else "—"
        lines.append(
            f"| {row['prov_num']} | {row['app_num']} | {row['filed']} | "
            f"{row['title']} | {c1} | {c2} | {c3} | {risk_display} | {level.upper()} |"
        )

    lines += [
        "",
        "## Rubric",
        "",
        "| Criterion | 1 (high risk) | 3 (moderate) | 5 (low risk) |",
        "|-----------|---------------|--------------|--------------|",
        "| **C1 Enabling Disclosure** | Glorified pitch deck — concept only | Some implementation sketches; significant gaps | Full enabling disclosure; skilled person could implement alone |",
        "| **C2 Variation Coverage** | Single embodiment; obvious scope-wedge variants uncovered | Some variations; some scope-wedges open | Comprehensive variation axes; scope-wedge defenses tight |",
        "| **C3 Human-Conception Clarity** | AI-generated text without clear human-conception narrative | Mixed AI/human authorship; trail partially documented | Clear human-vs-AI authorship; USPTO 2024 AI guidance compliant |",
        "",
        "**Composite Risk** = 15 − (C1 + C2 + C3) · Range 0–12",
        "- 0–3: Low (green) · 4–7: Moderate (yellow) · 8–12: High (red)",
        "",
        "---",
        "",
        "_Covered by the Liana Banyan Corporation Cooperative Defensive Patent Pledge (#2260)._",
        "_These provisionals are filed for defensive purposes to protect the cooperative membership platform._",
    ]
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main CLI entry point
# ---------------------------------------------------------------------------

def main() -> None:
    workspace = Path(__file__).parent.parent
    scores_path = Path(__file__).parent / "provisional_scores.json"
    html_out = workspace / "BISHOP_DROPZONE" / "03_BishopHandoffs" / "PROVISIONAL_RISK_AUDIT_MATRIX_BP006.html"
    md_out = workspace / "BISHOP_DROPZONE" / "03_BishopHandoffs" / "PROVISIONAL_RISK_AUDIT_MATRIX_BP006.md"

    provisionals = load_scores(scores_path)
    provisionals = apply_synthetic_where_missing(provisionals)
    save_scores(provisionals, scores_path)

    html_content = generate_html_matrix(provisionals)
    md_content = generate_md_matrix(provisionals)

    html_out.parent.mkdir(parents=True, exist_ok=True)
    html_out.write_text(html_content, encoding="utf-8")
    md_out.parent.mkdir(parents=True, exist_ok=True)
    md_out.write_text(md_content, encoding="utf-8")

    summary = aggregate_summary(provisionals)
    dist = summary["distribution"]
    top3 = summary["top_3_high_risk"]

    print(f"[KN073] Risk-audit matrix generated.")
    print(f"  HTML -> {html_out}")
    print(f"  MD   -> {md_out}")
    print(f"  Distribution: {dist}")
    print(f"  Top-3 high risk:")
    for t in top3:
        print(f"    Prov {t['prov_num']}: {t['title']} (risk={t['risk']})")


if __name__ == "__main__":
    main()
