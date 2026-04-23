# modelcontextprotocol/servers Community List PR — librarian-mcp

## Submission method

PR to [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) — the Anthropic-maintained community server list. This is the institutional validation layer.

## Where to add

In `README.md` under the **Community Servers** section, alphabetical by name:

```markdown
- **[Librarian MCP](https://github.com/liana-banyan/librarian-mcp)** — Intent-aware canonical memory + prose provenance. Pre-curated preload content scoped by query intent, with deterministic drift detection between document versions. Independently benchmarked: 86.1pp accuracy lift across 8 models × 4 vendors × 1,200 calls ([live demo](https://librarian.the2ndsecond.com)).
```

## PR title

`Add librarian-mcp: intent-aware canonical memory + prose provenance server`

## PR body

### What this server does

`librarian-mcp` is an MCP server that delivers pre-curated canonical memory packets and prose provenance checking. Five tools:

1. **`librarian_context`** — Intent-routed canonical memory. Loads curated preload content scoped to query intent (outreach, architecture, benchmark, founder voice, etc.). Returns a structured packet with sections, token count, and source version.
2. **`prose_provenance`** — Deterministic drift detection between two document versions. Catches silently-removed anchors, stale canonical numbers, section changes, and register shifts.
3. **`record_measurement`** — Log a benchmark measurement (vendor, model, condition, accuracy, cost, latency) to local JSONL.
4. **`metrics_summary`** — Per-vendor and per-model aggregation of recorded measurements.
5. **`opt_in_share`** — Toggle anonymous metrics sharing (default OFF).

### Benchmark results

Eyewitness Benchmark R10 (April 2026):
- 8 models × 4 vendors × 1,200 graded calls
- Mean accuracy: 94.8% HOT vs 8.7% COLD — **86.1 percentage-point lift**
- Inter-rater agreement: κ = 0.883 (Haiku/Opus spot-check), κ = 0.850 (Haiku/Gemini cross-grader)
- Cheapest model (Haiku 4.5) ties most expensive (Opus 4.7) at 19× cost difference
- Total study cost: ~$18

### Links

- **Repository:** https://github.com/liana-banyan/librarian-mcp
- **PyPI:** https://pypi.org/project/librarian-mcp/
- **Live demo:** https://librarian.the2ndsecond.com
- **License:** AGPL-3.0

### Install

```bash
pip install librarian-mcp
python -m librarian_mcp
```

Works with Claude Code, Cursor, Continue (VSCode/JetBrains), and any MCP-capable client.

---

*Founder submits this PR manually. Submit third (after Smithery and Glama) so we can cite both registry listings in this PR.*
