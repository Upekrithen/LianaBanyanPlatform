MnemosyneC Plow CLI — LAN Mesh Bundle · BP084
==============================================

Pick your node. Run setup-helper.ps1 first.

  M0  (Founder / Orchestrator)  →  node plow-cli.js shards\m0_shard.json --model gemma4:12b --out m0_results.jsonl
  M1  (LAN, 16GB)               →  node plow-cli.js shards\m1_shard.json --model gemma4:12b --out m1_results.jsonl
  M2  (LAN, 32GB)               →  node plow-cli.js shards\m2_shard.json --model gemma4:12b --out m2_results.jsonl
  M3  (LAN, 32GB)               →  node plow-cli.js shards\m3_shard.json --model gemma4:12b --out m3_results.jsonl
  M5  (WAN / Son, gemma2:2b)    →  node plow-cli.js shards\m5_shard.json --model gemma2:2b  --out m5_results.jsonl

When done, send mX_results.jsonl back to M0.
M0 runs: node aggregate.js m0_results.jsonl m1_results.jsonl ... --out aggregate_summary.json

For full instructions: https://mnemosynec.ai/tools/lan-mesh-cards/
