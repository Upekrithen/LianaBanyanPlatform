# Smithery.ai Submission — librarian-mcp

## Submission method

PR to [smithery-ai/registry](https://github.com/smithery-ai/registry) (or use their web submission form if available).

## smithery.yaml (already in repo root)

```yaml
startCommand:
  type: stdio
  configSchema:
    type: object
    properties: {}
  commandFunction:
    - python
    - -m
    - librarian_mcp
```

## Listing metadata

| Field | Value |
|---|---|
| **Name** | librarian-mcp |
| **Display name** | The Librarian — Intent-Aware Canonical Memory |
| **Description** | Pre-curated canonical memory + prose provenance, delivered via MCP. 86.1pp accuracy lift across 8 models, 4 vendors, 1,200 graded calls (Eyewitness Benchmark R10, April 2026). Inter-rater κ 0.883/0.850. |
| **Repository** | https://github.com/liana-banyan/librarian-mcp |
| **Homepage** | https://librarian.the2ndsecond.com |
| **PyPI** | https://pypi.org/project/librarian-mcp/ |
| **License** | AGPL-3.0 |
| **Author** | Liana Banyan Corporation |
| **Tags** | `mcp`, `mcp-server`, `llm-context`, `retrieval`, `canonical-memory`, `provenance`, `benchmark` |

## PR body (for Smithery GitHub PR)

### Add librarian-mcp — intent-aware canonical memory server

**What it does:** Five MCP tools — `librarian_context` (intent-routed memory packets from curated preload), `prose_provenance` (deterministic drift detection between document versions), `record_measurement` / `metrics_summary` (benchmark logging), and `opt_in_share` (anonymous commons participation toggle).

**Why it matters:** Independently measured at 86.1pp accuracy lift across 8 models × 4 vendors × 1,200 graded calls (Eyewitness Benchmark R10, April 2026). Inter-rater agreement κ = 0.883 (Haiku/Opus) and 0.850 (Haiku/Gemini). Cheapest model ties most expensive at 19× cost difference.

**Install:** `pip install librarian-mcp` / `python -m librarian_mcp`

**Live demo:** https://librarian.the2ndsecond.com

**Repository:** https://github.com/liana-banyan/librarian-mcp

**License:** AGPL-3.0 + Cooperative Defensive Patent Pledge (Pledged Commons tier = $0 forever for nonprofits, cooperatives, academic institutions, and public-service organizations).

---

*Founder submits this PR manually. Knight does not have gh auth.*
