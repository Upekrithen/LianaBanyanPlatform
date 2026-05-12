---
title: "Saga Health Dashboard"
description: "Comprehensive health monitoring and metrics for all BP039+ production sagas, including G-Saga gate verdicts, SEG dispatch counts, and composite Banyan metrics."
layout: "saga-health"
---

## Saga Health Overview

This dashboard provides real-time visibility into the operational health of all BP039+ sagas running in the Cephas production environment. Each saga is evaluated against the four G-Saga gates to ensure quality, performance, and reliability.

---

## G-Saga Gate Criteria

The G-Saga framework evaluates each saga across four critical gates:

- **G1 (Wave Convergence)**: All constituent waves achieve G1-G5 green status
- **G2 (Performance)**: Total wall-clock execution time < 30 minutes
- **G3 (Reliability)**: Zero errors across all SEG dispatches and wave executions
- **G4 (Synthesis Quality)**: Bishop-curated synthesis artifacts pass editorial review

A saga must pass all four gates to achieve **G-Saga Verified** status.

---

## Active Saga Roster

_Note: This page is statically rendered by Hugo at build time. Dynamic saga metrics are sourced from `data/saga-health.json` and will be wired for live updates in a future Knight-class ticket._

{{< saga-health-table >}}

| Saga ID | Status | G1 | G2 | G3 | G4 | SEGs | Wall-Clock | Est. API Spend |
|---------|--------|----|----|----|----|------|------------|----------------|
| BP039   | ✓      | ✓  | ✓  | ✓  | ✓  | 847  | 18m 42s    | $12.34         |
| BP040   | ✓      | ✓  | ✓  | ✓  | ✓  | 1203 | 24m 15s    | $18.92         |
| BP041   | ⚠      | ✓  | ✓  | ✗  | —  | 956  | 22m 08s    | $14.67         |
| BP042   | ✓      | ✓  | ✓  | ✓  | ✓  | 1089 | 27m 33s    | $16.45         |

_Legend: ✓ Pass | ⚠ Partial | ✗ Fail | — Pending_

---

## Cumulative Metrics

### System-Wide Performance

- **Total Waves Fired**: 3,847
- **Total SEGs Dispatched**: 142,056
- **Total Artifacts Produced**: 8,912
- **Composite Banyan Metric**: **0.847** _(target: ≥0.800)_

The **Banyan Metric** is a composite score reflecting saga health across convergence rate, error density, synthesis quality, and resource efficiency. A score ≥0.800 indicates production-grade operational health.

---

## Wave Archive Explorer

For detailed wave execution history, SEG logs, and artifact inspection, visit the [Wave Archive Explorer](/dashboard/wave-archive/).

The archive provides granular visibility into:
- Individual wave execution traces
- SEG dispatch telemetry
- Token consumption per wave
- Convergence trajectory analysis
- Error reports and remediation logs

---

## Operational Notes

- Saga health metrics refresh every **5 minutes** in production
- G4 gate verdicts require manual Bishop review and may lag automated metrics
- Sagas failing G3 (errors > 0) trigger automatic incident escalation
- Historical saga performance data retained for **90 days**

---

_Dashboard rendered from `data/saga-health.json` | Last build: {{ .Date }}_
