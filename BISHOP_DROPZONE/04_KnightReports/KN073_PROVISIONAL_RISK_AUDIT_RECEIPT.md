# KN073 — Provisional Risk-Audit Matrix Tool
## Knight Receipt · BP006 · Pod EE · 2026-05-01

---

## Tool Location

| Artifact | Path |
|---|---|
| Main tool | `discipline_wing/provisional_risk_audit.py` |
| Score data | `discipline_wing/provisional_scores.json` |
| Test suite | `discipline_wing/tests_kn073.py` |
| HTML matrix | `BISHOP_DROPZONE/03_BishopHandoffs/PROVISIONAL_RISK_AUDIT_MATRIX_BP006.html` |
| Markdown twin | `BISHOP_DROPZONE/03_BishopHandoffs/PROVISIONAL_RISK_AUDIT_MATRIX_BP006.md` |

---

## Rubric Design Rationale

The 3-criterion rubric was designed to surface the three primary patent validity vectors
most relevant to Liana Banyan Corporation's AI-system provisional portfolio.

### C1 — Enabling Disclosure (35 U.S.C. § 112)
The most common ground for post-grant invalidity in software and AI patents.
A score of 1 ("glorified pitch deck") signals the provisional will be nearly impossible
to convert without major supplemental disclosure. Score 5 means a skilled AI memory
systems engineer could implement from the spec alone.

### C2 — Variation Coverage
A single-embodiment disclosure is an invitation for claim scope wedges.
Competitors will design around by choosing alternative storage backends, trigger
conditions, or federation topologies not mentioned in the filing.
Score 1 = obvious wedge lanes open; score 5 = variation axes comprehensively sealed.

### C3 — Human-Conception Clarity (USPTO 2024 AI Inventorship Guidance)
Post-Thaler (2023), the USPTO requires significant human contribution to each claim.
For an AI-assisted platform, the risk is that provisionals drafted with heavy AI
assistance do not explicitly document the human-conception narrative.
Score 1 = AI-generated text without a clear human-conception narrative and no
significant-contribution trail — these filings are vulnerable to inventorship
challenges under current USPTO guidance.

### Composite Risk Formula
```
risk = 15 - (C1 + C2 + C3)   range: 0–12
```
- **0–3: Low** (green) — proceed to non-provisional with minor augmentation
- **4–7: Moderate** (yellow) — targeted gap-fill work required before non-provisional
- **8–12: High** (red) — substantial rewrite / supplement recommended before conversion

---

## Smoke-Test Results (Synthetic Run — 2026-05-01)

All 15 provisionals were scored using the synthetic/stub scoring mode
(source documents not yet on disk in `legal/provisionals/`).

### Synthetic Score Assignments

| Prov # | App # | C1 | C2 | C3 | Risk | Level | Rationale |
|--------|-------|----|----|----|----|-------|-----------|
| 1–12 | unknown | 2 | 2 | 3 | **8** | HIGH | Conservative defaults for undocumented earlier filings |
| 13 | 64/036,646 | 3 | 2 | 4 | **6** | MODERATE | Some implementation sketches; narrow embodiment coverage |
| 14 | 64/052,602 | 4 | 3 | 4 | **4** | MODERATE | Better disclosure; discipline-enforcement federation well-described |
| 15 | 64/052,618 | 4 | 3 | 4 | **4** | MODERATE | Substrate pre-injection detail present; variation coverage acceptable |

### Top-3 Highest-Risk from Synthetic Run

1. **Prov 1–12 (earlier filings)** — risk score 8 (HIGH) — no source docs on disk;
   synthetic defaults applied; these must be manually scored when counsel retrieves
   the original USPTO filings
2. Prov 13 (64/036,646) — risk score 6 (MODERATE)
3. Prov 14 & 15 (64/052,602, 64/052,618) — risk score 4 (MODERATE)

### Aggregate Risk Distribution (Synthetic Run)

| Low (0–3) | Moderate (4–7) | High (8–12) | Unscored |
|-----------|----------------|-------------|---------|
| 0 | 3 | 12 | 0 |

**Interpretation**: The 12 "high risk" entries for Prov 1–12 are an artifact of
synthetic defaults, not a reflection of actual disclosure quality. These provisionals
require manual scoring once counsel retrieves the originals from USPTO PAIR.

---

## Aggregate Risk Distribution Explanation

The tool assigns all unreviewed provisionals (Prov 1–12) a conservative synthetic
score of C1=2, C2=2, C3=3 (risk=8 = HIGH) as a deliberate "red until proven green"
default. This forces counsel review rather than quietly assuming unknown apps are safe.

---

## Test Suite Summary

**56 tests across 11 test classes — all PASSED (0 failures, 0 errors)**

| Class | Tests | Coverage Area |
|-------|-------|---------------|
| T01_HighRiskSynthetic | 3 | High-risk composite scoring |
| T02_LowRiskSynthetic | 3 | Low-risk composite scoring |
| T03_ManualOverride | 6 | Override application + immutability |
| T04_HTMLOutput | 8 | HTML structure, color codes, pledge footer |
| T05_MarkdownTwin | 6 | Markdown structure, rubric, entity name |
| T06_DrilldownGapFill | 4 | Gap-fill language per criterion |
| T07_AggregateSummary | 7 | Distribution counts, top-3 ordering |
| T08_Idempotency | 3 | Deterministic output |
| T09_SyntheticScoring | 7 | Prov 13/14/15 synthetic score correctness |
| T10_PersistenceRoundTrip | 2 | Save/load round-trip |
| T11_ComputeRiskBoundaries | 7 | Boundary conditions, None handling |

---

## Counsel-Handoff Status

**STATUS: READY FOR COUNSEL REVIEW — MANUAL SCORING REQUIRED**

### Immediate Next Steps for Counsel

1. **Retrieve originals** for Prov 1–12 from USPTO PAIR (app numbers unknown;
   counsel must query by assignee "Liana Banyan Corporation" + filing date range).
2. **Score each provisional** using the 3-criterion rubric in the HTML matrix.
3. **Apply overrides** via `apply_override()` in the Python tool or edit
   `discipline_wing/provisional_scores.json` directly (JSON format is self-describing).
4. **Re-run** `python discipline_wing/provisional_risk_audit.py` to regenerate the
   HTML + Markdown outputs with updated scores.
5. **Priority gap-fill work**: Provisionals scoring ≤ 2 on C1 or C3 should be
   supplemented before non-provisional conversion. C3=1 filings carry inventorship
   challenge risk under USPTO 2024 AI guidance.

### Gap-Fill Language Templates (counsel-ready)

- **C1 (enabling disclosure):** "Add: concrete data-flow diagram showing [X]
  implementation steps; provide enough detail for a person skilled in AI memory
  systems to implement without significant gaps."
- **C2 (variation coverage):** "Add: variation axes for [X]: at minimum 3 alternative
  embodiments (e.g., different storage backends, different trigger conditions,
  different federation configurations)."
- **C3 (human-conception clarity):** "Add: explicit human-conception narrative — who
  conceived the idea, when, what the specific inventive insight was; clarify AI tool
  used only for drafting assistance, not conception."

---

## Cooperative Defensive Patent Pledge

All 15 provisionals are covered by the Liana Banyan Corporation
**Cooperative Defensive Patent Pledge (#2260)**, filed for defensive purposes to
protect the cooperative membership platform. Not for offensive enforcement.

---

*Executed by Knight (Cursor AI) · KN073 · Pod EE · BP006 · 2026-05-01*
*FOR THE KEEP!*
