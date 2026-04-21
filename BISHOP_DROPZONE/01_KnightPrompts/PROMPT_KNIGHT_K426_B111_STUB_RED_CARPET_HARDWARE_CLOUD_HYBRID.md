# Knight K426 — Red Carpet Hardware Prep + Cloud VM Hybrid — STUB
## B111, April 20, 2026 — Founder-ratified (budget-aware hybrid approach)
## Dispatched: after K423 Eyewitness Benchmark lands

**Status:** Stub — full prompt finalized after K423 results land and public Eyewitness Program launch decision is locked.
**Do NOT dispatch until:** K423 complete + Perplexity quota resolved OR 3-vendor partial run locked in OR Wave 2 Doctorow V04 sent.

---

## Why this exists

Letters currently promise *"I'll overnight you a machine already set up"* (Scholz reframing + potential Red Carpet upgrade for other top-tier academic recipients). That promise doesn't cash unless the machines exist in a deliverable state. Founder budget is tight at B111 (~$0 available for purchasing new hardware). Solution: **hybrid approach combining ONE physical machine (Founder-owned, currently has software-glitch issues) + cloud VMs for broader recipients.**

---

## Scope

### Part A — Physical machine prep (Founder's hardware fleet — multi-machine option ratified B111)

**Founder hardware inventory at B111 close (Founder-confirmed):**

| Machine | Specs | Role |
|---|---|---|
| Surface Gen 1 ("first of the good ones") | 4GB RAM, decent CPU, runs Windows 11 | **Primary physical-ship candidate → Scholz.** Xubuntu 24.04 LTS (XFCE) fits well at 4GB. ~$25 insured FedEx Priority Overnight. |
| Second Surface (broken wifi driver under Windows, works via ethernet) | Full specs TBD | **Secondary physical-ship candidate pending Ubuntu-wifi-fix test.** If Ubuntu Live USB boot shows wifi working, ship to Schneider or Brynjolfsson. If still broken, desk use only. |
| Watercooled desktop ($2k, original plan) | Watercooled, software glitches (freezes) | **Stays with Founder.** Used for Yale Apr 28 in-person demo (theater value beats any laptop). Dev + demo dual use. NOT shipping — watercooling + shipping risk (tilt, leak, academic unfamiliarity with maintenance). |
| HP Chromebook | ChromeOS | **Founder personal Eyewitness-testing machine.** Install Crostini (ChromeOS Linux subsystem) and run the benchmark on it as a third external-replication data point. "Ran on Chromebook Crostini = works" is a strong reproducibility anecdote for Paper #49 without requiring a reformat. Not for shipping. |

**Implications for the fleet strategy:**
- **Two potential physical ships** instead of one (Surface Gen 1 + broken-wifi Surface if Ubuntu fixes wifi)
- **Budget:** ~$50 total shipping vs original $80 projection, AND zero hardware-acquisition cost (everything Founder-owned)
- **Signal doubling:** if both Scholz AND a second academic (Schneider or Brynjolfsson) say yes, both get physical machines in the same week. Much stronger multi-recipient signal than single-ship.
- **Yale demo table Apr 28** uses the watercooled desktop IN PERSON — theatrical + memorable + captures the "oh this person actually builds" signal that a laptop cannot.

### Part A.1 — Xubuntu variant selection (Founder-ratified B111)

**NOT Ubuntu Desktop (GNOME) on 4GB** — GNOME will swap under benchmark load. Skip it.

**Recommended: Xubuntu 24.04 LTS (XFCE)** for both Surfaces:
- ~1.5GB idle, 2GB+ free for benchmark
- Full desktop experience; academic-friendly UI
- Lightweight enough for 4GB hardware
- Download: [xubuntu.org/download](https://xubuntu.org/download) — get the 24.04 LTS Desktop ISO

**Alternative: Ubuntu Server (headless)** — if a recipient prefers SSH-only workflow. ~500MB idle, 3.5GB free. But requires CLI comfort.

### Part A.2 — Fresh install steps (per Surface)

**Steps:**
1. **Full backup first.** External USB 3.0 drive, minimum 500GB. Image the current drive with Macrium Reflect Free (Windows) or `dd` (Linux). Preserve everything before wiping.
2. **Fresh Ubuntu 24.04 LTS install** (replaces current OS with its freeze issues). Ubuntu is academic-friendly, no Microsoft ads, boots fast, handles the librarian-mcp Python stack natively, and matches what most academic research machines run.
3. **Preinstall software stack:**
   - Python 3.11 via `apt`
   - `librarian-mcp` from PyPI (or install from GitHub if PyPI not yet published)
   - R10 cross-vendor / Eyewitness Benchmark runner from the K423 deliverable
   - Git + VS Code + Firefox
   - Pre-loaded GitHub SSH key so recipient can clone + contribute back if inspired
4. **Pre-load scoped API keys for the recipient.** DO NOT use Founder's main keys. Generate a dedicated key for the recipient on each vendor:
   - Anthropic: `scholz_eyewitness_key` (or recipient-specific)
   - Google: via AI Studio, recipient-specific
   - OpenAI: `scholz_eyewitness_key` via platform.openai.com
   - Perplexity: pending rotation per B111 leak
   - Each key scoped with a small budget cap ($20–$50 each) so total exposure is bounded
5. **Welcome doc pre-loaded on desktop:** `welcome_eyewitness.md` + `how_to_run_benchmark.md` + `what_this_is.md`
6. **Ship-ready state:** machine boots to a clean desktop with a terminal already at the benchmark directory. Recipient opens terminal, types `python run_benchmark.py`, gets results in their home directory. One-command experience.

### Part B — Cloud VM provisioning (broader Red Carpet + early Eyewitness Program replicators)

**Steps:**
1. **DigitalOcean droplet template** — Ubuntu 24.04 LTS, 2GB RAM, 50GB disk, ~$12/month. Or Linode equivalent.
2. **Pre-baked image** with all the software above pre-installed. One-click droplet creation from the image.
3. **Per-recipient provisioning flow:**
   - Founder or Bishop triggers a droplet spin-up via DigitalOcean CLI
   - Droplet gets a fresh hostname (e.g., `eyewitness-scholz.lianabanyan.com`)
   - Provisions scoped API keys on the droplet
   - Emails recipient: SSH public-key instructions + IP address + "you're in; run `python run_benchmark.py` to begin"
4. **Automated tear-down:** droplets expire after 30 days unless recipient requests extension. Keeps cloud costs bounded.

### Part C — Reservation logic (which recipients get physical vs. cloud)

**Recommended Founder rule:**
- **Physical machine:** held in reserve for the single highest-conversion Red Carpet recipient. Default candidate: Trebor Scholz (first academic eyewitness pitch). If Scholz declines or no-responds within 14 days, reassign to Nathan Schneider or Erik Brynjolfsson.
- **Cloud VM:** default for all other Red Carpet recipients (Newmark, Doctorow if he requests, academics beyond the top 3) AND for the broader Eyewitness Program community replicators.
- **Docker / self-install:** default for general public Eyewitness Program enrollees. No VM provisioning required; they run on their own hardware.

This tiers the fulfillment effort by expected signal value: most effort for the single highest-amplification recipient; medium effort for the next ~10; low effort for the broader community.

### Part D — Success metrics + tracking

- Physical machine shipment tracked (carrier + insurance + delivery confirmation)
- Cloud VM usage logged (per-droplet benchmark-run-completion events)
- Community replicator count tracked via JSONL submissions
- Goal by May 4, 2026 (first week post-launch): 1 physical machine shipped, 5 cloud VMs active, 25+ community Docker-path replicators

---

## Budget check

- **Physical machine:** $0 hardware cost (Founder-owned), ~$80 shipping + insurance (FedEx Priority Overnight with $2k insurance declared)
- **Cloud VMs:** ~$12/droplet/month × 5–10 active droplets = $60–$120/month active
- **Scoped API keys for recipients:** $20–$50 × 4 vendors × 10 recipients = $800–$2,000 cap total (most won't use full cap)
- **Total monthly cost during active recruitment period:** $60–$200 + shipping one-time

Well within "resource-efficient, Founder-doing-this" scope.

---

## Timing

Dispatch K426 after K423 Eyewitness Benchmark results are clean + Witness Program recruitment launches (target ~Apr 27, Wave 2). Physical machine prep should start simultaneously with K423 results review — Founder does the backup + fresh install during the K423→K424 handoff window (~Apr 25–26). Cloud VM template built same window by Knight.

---

## Cross-references

- K423 (Eyewitness Benchmark) — produces the benchmark binaries + preload that go onto the machines
- K424 (Librarian v0.2.0) — intent-aware `librarian_context` that recipients' machines can optionally use for deeper Librarian access
- K425 (Secrets canonicalization) — makes the per-recipient scoped-key provisioning cleanly automatable
- Witness Program recruitment doc — the "machine" promise is in the Scholz reframing specifically
- OPENING_GAMBIT_v2_B111.md — Circle priorities inform who gets physical vs. cloud

---

*Stub saved B111, April 20, 2026. Founder-authorized hybrid approach. Full prompt finalized after K423 lands + first Red Carpet response comes back.*
