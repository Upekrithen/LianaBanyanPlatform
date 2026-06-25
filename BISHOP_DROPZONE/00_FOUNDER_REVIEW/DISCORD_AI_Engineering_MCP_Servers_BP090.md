---
target_publication: Discord — AI Engineering / MCP Servers community
channel: #tips-and-tricks
format: discord-post
anchor: Plow-Loop + Dragon-Harness + Individual-Domain-Pattern + M12
status: DRAFT — FOUNDER DISPATCH AUTHORIZATION REQUIRED
filed: 2026-06-22
nyt_exclusivity_check: CLEAR — no essay prose, no personal narrative, no Alford/sister/chess framing
---

# Channel: #tips-and-tricks

Posting a mesh orchestration receipt that might be useful if you're thinking about multi-agent routing patterns.

**Dragon Harness architecture (Marathon 12, June 21–22):**

4-peer mesh: Bishop (orchestrator) + 3 Rooks (domain workers). Each question routes through the **Individual Domain Pattern** — a per-domain router that selects model and timeout threshold based on subject area (math vs. law vs. chemistry respond differently under time pressure). Low-confidence responses escalate to **Star Chamber**: 4-agent parallel consensus run, double-blind, variance-to-risk scoring. High-variance output gets flagged before it counts.

**The Plow Loop** underneath it:
1. Classify domain
2. Pull substrate Unfair Advantage bundle for that domain (Pheromone lookup, sub-ms)
3. Prime the model with domain-specific context
4. Dispatch + collect
5. If confidence < threshold → Star Chamber escalation
6. Council vote on contested outputs

**Result:** `{{ M12_ENSEMBLE }}`% on MMLU-Pro 70Q. Delta vs. Marathon 10: +`{{ M12_DELTA_VS_M10 }}` pp. Models didn't change. The routing and timeout discipline is where the gain lives.

The substrate layer (Pheromone index, 21–51× faster than RPC, K528 empirical) is what makes per-domain context priming cheap enough to run at question-level granularity. Without sub-ms lookup, the routing overhead swamps the benefit.

Reproducible: TIGER-Lab MMLU-Pro, commit 80cd33a, lb-reproducibility-pack. SSPL + Pledge #2260. mnemosynec.org
