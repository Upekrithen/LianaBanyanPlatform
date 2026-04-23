# Show HN Template — librarian-mcp

## Title

Show HN: The Librarian – MCP server that gives AI models curated memory (86pp accuracy lift)

## Body

I built an MCP server that solves the "AI forgets everything by prompt #21" problem through pre-curated canonical memory instead of bigger context windows.

**What it does:** Five tools — intent-routed memory packets from curated preload files, prose provenance drift detection, and benchmark metrics logging. You point it at your canonical documents, it loads the right ones based on query intent, and the model gets accurate context instead of hallucinating.

**Benchmark (independently measured):** Eyewitness Benchmark R10 — 8 models × 4 vendors × 1,200 graded calls. Mean accuracy went from 8.7% (without) to 94.8% (with). That's 86.1 percentage points of lift. Inter-rater κ = 0.883. The cheapest model (Haiku 4.5 at $0.007/query) tied the most expensive (Opus 4.7 at $0.13/query). Total study cost: ~$18.

**Install:**
```
pip install librarian-mcp
python -m librarian_mcp
```

Works with Claude Code, Cursor, Continue, and any MCP-capable client.

**Live demo:** https://librarian.the2ndsecond.com — try it without installing.

**Code:** https://github.com/liana-banyan/librarian-mcp

**License:** AGPL-3.0 + Pledged Commons (free forever for nonprofits, cooperatives, academic institutions).

Chapter 2 (Mellon) — multilingual retrieval across 110 languages — coming soon.

<!-- FOUNDER: Personalize the opening with your story. The barracks/Pine Books angle, the 37 years developing this system, the aviation/IT background — whatever feels right for HN. They reward authenticity. -->

---

*STAGE ONLY. Founder posts when ready. Do NOT submit from Knight.*
