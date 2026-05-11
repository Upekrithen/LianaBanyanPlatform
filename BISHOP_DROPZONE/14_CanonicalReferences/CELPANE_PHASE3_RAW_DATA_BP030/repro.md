# Repro Instructions — CelPane Phase 3 Browser-Tier Benchmark (BP030)

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\amplify-computer

# One-time setup
npm install --save-dev @playwright/test
npx playwright install chromium

# Run benchmark (240 runs ~ 19 s on dev workstation)
node tests\celpane-phase3\runner.mjs --n 30

# Analyze
node tests\celpane-phase3\analyze.mjs
```

CLI args for runner:
- `--n <int>` runs per (impl × category) cell (default 30)
- `--categories cold,warm,update,borrow` subset selector

Outputs (this directory):
- `raw_runs.jsonl` — one JSON per run
- `summary.csv` — median/MAD/p95/trimmed-mean per cell
- `ratios.csv` — substrate/baseline ratios with bootstrap CI + Mann-Whitney
- `verdict.json` — machine-readable pass/fail per category
- `analysis_plan.md` — pre-registered plan (committed before data collection)

Versions pinned: Node v24.11.0; @playwright/test 1.59.1; Chromium 141 (Playwright bundled); Windows 11 Pro 10.0.26200.
