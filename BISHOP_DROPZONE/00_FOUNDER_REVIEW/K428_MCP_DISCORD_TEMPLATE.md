# MCP Discord / Anthropic Discord Announcement Template

## Channel

Post in the MCP Discord `#showcase` channel (or equivalent community channel). If Anthropic Discord has an `#mcp-servers` or `#community-projects` channel, cross-post there.

## Message

**The Librarian — intent-aware canonical memory via MCP**

Just shipped `librarian-mcp` v0.2.0 on PyPI. Five tools:

• `librarian_context` — intent-routed memory packets from curated preload. Tell it what you're doing (outreach, architecture, benchmark, etc.) and it loads the right canonical docs.
• `prose_provenance` — drift detection between document versions. Catches silently-removed sections, stale numbers, register shifts.
• `record_measurement` / `metrics_summary` — benchmark logging + aggregation.
• `opt_in_share` — anonymous commons participation toggle (default off).

**Benchmark (Eyewitness R10):** 8 models × 4 vendors × 1,200 graded calls. 86.1pp accuracy lift (8.7% → 94.8%). Inter-rater κ 0.883/0.850. Cheapest model tied most expensive. Study cost: ~$18.

**Install:**
```
pip install librarian-mcp
python -m librarian_mcp
```

Works with Claude Code, Cursor, Continue, any MCP client.

**Try without installing:** https://librarian.the2ndsecond.com
**GitHub:** https://github.com/liana-banyan/librarian-mcp
**License:** AGPL-3.0 + Pledged Commons

Bounty program open for code contributions, corpus preloads, benchmark replications, and research extensions. Details in BOUNTIES.md.

Chapter 2 (Mellon — multilingual retrieval, 110 languages) coming soon.

<!-- FOUNDER: Discord is casual. Lead with what it does, not the corporate framing. If you've been active in MCP Discord already, reference prior conversations. The community notices when you show up before you ship. -->

---

*STAGE ONLY. Founder posts when ready. Do NOT submit from Knight.*
