# Mesh Test Run Instructions -- v0.1.35
## Three-Node MMLU-Pro Benchmark

**Machines:**
- M1: Founder dev machine (this machine). Aggregator node.
- M2: 192.168.86.45
- M3: 192.168.86.64

**Estimated time:** Standard tier (~12K questions): 2 to 4 hours total across 3 nodes in parallel (each node processes ~4K questions). Diamond tier (~2K questions): 30 to 60 minutes.
**Resource budget:** CPU and RAM only. No GPU required. No API cost. $0.00.

---

**Step 1. Install v0.1.35 on M2 and M3**

Download: https://github.com/liana-banyan/mnemosynec-releases/releases/download/v0.1.35/MnemosyneC-Setup-0.1.35.exe

On M2 (192.168.86.45): copy the installer, run it, accept the SmartScreen prompt if it appears. MnemosyneC will launch to the Welcome screen.

Repeat on M3 (192.168.86.64).

**Step 2. Pull Gemma 4 12B on M2 and M3**

On M2: open MnemosyneC. Click "Just use it". Choose "Free heavy-duty AI, stronger local model using Gemma 4 12B." The model pull begins (~5 GB). A progress indicator appears.

Repeat on M3.

Do not close MnemosyneC during the pull. Wait for pull to complete on both machines before proceeding. Estimated: 10 to 30 minutes per machine depending on LAN speed.

**Step 3. Verify preconditions on M1**

On M1, run the diagnostic script:

```
python scripts/mesh_precondition_check.py
```

Expected output: PRECONDITION GATE: PASS for all three nodes. If any node fails, follow the remediation hint in the output and re-run.

**Step 4. Start the mesh test from M1**

On M1: open MnemosyneC. Click "Prove it with a test". Choose "Google benchmark set, standard" (MMLU-Pro Standard tier).

Before starting: verify M2 and M3 appear as active peers in the mesh status view.

Click Start. M1 will shard the dataset (~4K questions per node), send shard manifests to M2 and M3, and all three nodes run locally. M1 shows aggregation progress.

Do not close MnemosyneC on any machine during the run.

**Step 5. Monitor progress**

M1 receives progress events from M2 and M3 every 100 questions or 60 seconds. The progress view on M1 shows per-node completion counts.

If M2 or M3 goes offline mid-run: note the last progress event. The run can be resumed from the last checkpoint in a future session (v0.1.36 will add auto-resume -- for now, re-run from scratch if interrupted).

**Step 6. Review results**

When the run completes:

1. View the Big Numbers card: FAST (p50 latency), CHEAP ($0.00), GOOD (HOT accuracy lift).
2. Open the full results JSON: BISHOP_DROPZONE/00_FOUNDER_REVIEW/MESH_TEST_RESULTS_v0135_&lt;timestamp&gt;.json
3. Open the human-readable summary: BISHOP_DROPZONE/00_FOUNDER_REVIEW/MESH_TEST_SUMMARY_v0135_&lt;timestamp&gt;.md
4. View the SVG charts in the same dropzone folder.

**Step 7. Diamond tier (optional, run after Standard tier)**

Repeat Step 4, choosing "Google benchmark set, difficult" (MMLU-Pro Diamond tier). Estimated time: 30 to 60 minutes.

---

## Troubleshooting

**M2 or M3 not showing as peers:** Confirm all machines are on the same LAN (192.168.86.x subnet). Confirm MnemosyneC is running on all nodes. Check Windows Firewall -- the mesh port must be open for inbound connections.

**Gemma pull stalled:** Open a terminal and run `ollama pull gemma2:12b` directly. This is the same model, pulling via the Ollama CLI.

**SmartScreen warning on install:** Click "More info" then "Run anyway". The installer is from the liana-banyan/mnemosynec-releases GitHub repository.

**Mesh test not starting:** Run the precondition script (`python scripts/mesh_precondition_check.py`) and follow all remediation hints before retrying.

---

*BP078 -- v0.1.35 Mesh Test -- Knight SEG-T-7*
