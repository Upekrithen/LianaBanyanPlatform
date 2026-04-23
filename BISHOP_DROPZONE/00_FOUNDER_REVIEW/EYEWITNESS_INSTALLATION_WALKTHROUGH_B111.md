# The Eyewitness Installation Walkthrough
## How to install the Librarian MCP + Eyewitness Benchmark on your machine
## B111, April 20, 2026 — v1, public-friendly

**Who this is for:** anyone who wants to install the **Librarian MCP** (the memory-packet AI tool) or run the **Eyewitness Benchmark** (the 75-question cross-vendor replication study) on their own computer. Three paths — pick the one that fits.

**Time required:** Path A 5 min · Path B 30 min · Path C 3–4 hours

**Cost:** Path A free · Path B ~$5–$40 in your own API credits depending on vendors chosen · Path C cost of an external backup drive ($30–$60) + your time

---

## Pick your path

| Path | What you get | Who it's for |
|---|---|---|
| **A — Try the tool** | `librarian-mcp` installed; basic MCP server you can point your AI at | Curious. "I read about this and want to see what it is." |
| **B — Run the benchmark** *(default)* | All of A + the 75-question Eyewitness Benchmark runner + R9-v2 memory-packet preload | Volunteers. "I want to be an Eyewitness replicator and contribute cross-vendor data." |
| **C — Fresh OS + full stack** | Ubuntu 24.04 LTS installed from scratch + all of B + external-drive data isolation | Dedicated machines. "I'm wiping this box and making it a cooperative-contribution node." |

**If you're unsure — Path B is the right default.** It's what most Eyewitness Program participants want.

---

> **Note on install source (B111):** Until the Librarian MCP is published on PyPI (target May 2026, K424 scope), installs come directly from GitHub via `pip install git+https://github.com/Upekrithen/librarian-mcp.git`. Once PyPI publishes, the shorter `pip install librarian-mcp` works.

## Prerequisites (all paths)

- **Operating system:** macOS 11+, Linux (Ubuntu / Fedora / Arch), or Windows 10+ (via WSL2 for the smoothest experience, or native Python on Windows with some friction)
- **Python 3.10 or newer.** Check: `python3 --version`. If you see 3.9 or older, install 3.10+ first.
- **Internet connection** for downloading packages and for API calls during the benchmark.
- **At least one AI API key** (for Path B specifically). Free trials or low-credit accounts are fine:
  - Anthropic (for Claude): [console.anthropic.com](https://console.anthropic.com)
  - OpenAI (for GPT-4o): [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
  - Google Gemini: [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (free tier available)
  - Perplexity (for Sonar): [perplexity.ai/settings/api](https://perplexity.ai/settings/api)

---

## Path A — Try the tool (5 min)

```bash
pip install git+https://github.com/Upekrithen/librarian-mcp.git
python -m librarian_mcp --help
```

That's it. The `librarian-mcp` MCP server is installed and runs on demand. Point your MCP-compatible AI client at it and start a conversation. Exposed tools (in v0.1.0-alpha):

- `librarian_context` — returns a stub memory packet (full R9 context lands in v0.2.0, ~May 2026)
- `prose_provenance` — checks a prose draft for canonical-phrase drift and Keystone preservation

**Verify it worked:**
```bash
python -c "import librarian_mcp; print('OK:', librarian_mcp.__version__)"
```

You should see something like `OK: 0.1.0`. If you see an import error, re-run the `pip install` step.

**That's the whole path.** If you're curious about the benchmark too, continue to Path B.

---

## Path B — Run the Eyewitness Benchmark (30 min)

**This is the default path for Eyewitness Program volunteers.** You'll install everything from Path A, plus the benchmark runner and the R9-v2 preload (the ~87,000-token memory packet that gets loaded into the AI before each question).

### Step 1 — Install Path A first

```bash
pip install git+https://github.com/Upekrithen/librarian-mcp.git
```

### Step 2 — Clone the benchmark repo

```bash
git clone https://github.com/Upekrithen/librarian-mcp.git
cd librarian-mcp/r10_cross_vendor
pip install -r requirements.txt
```

This installs the 4 vendor SDKs you'll need (Anthropic, Google Gemini, OpenAI, Perplexity). About 2–3 minutes on a normal connection.

### Step 3 — Set your API keys

Create a file called `.env` in the `r10_cross_vendor/` directory with whichever vendors you want to test. You do NOT need all four — the benchmark will only run the vendors whose keys you provide.

```
ANTHROPIC_API_KEY=your-anthropic-key-here
OPENAI_API_KEY=your-openai-key-here
GOOGLE_API_KEY=your-gemini-key-here
PERPLEXITY_API_KEY=your-perplexity-key-here
```

Load them into your shell:

```bash
# macOS/Linux:
export $(cat .env | xargs)

# Windows PowerShell:
Get-Content .env | ForEach-Object { if ($_ -match "^([A-Z_]+)=(.+)$") { [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process") } }
```

### Step 4 — Run a dry run first (free, no API calls)

```bash
python run_benchmark.py --dry-run
```

You should see a summary like *"1,200 calls planned across 4 vendors × 2 tiers × 2 conditions × 75 questions."* If so, the runner is wired correctly.

### Step 5 — Run the real benchmark

**Recommended for first-timers:** start with just Anthropic Haiku to verify end-to-end cost and quality before committing to larger spend.

```bash
python run_benchmark.py --vendor anthropic --model claude-haiku-4-5-20251001 --n 10
```

This runs 10 questions × 2 conditions = 20 calls on Anthropic Haiku only. Cost: ~$0.10. Takes ~2 minutes. If the output looks reasonable, fire the full run:

```bash
python run_benchmark.py
```

Full run = all vendors whose keys you provided × both tiers × 75 questions × 2 conditions. Cost: ~$5–$40 depending on which vendors. Wall clock: 2–4 hours.

### Step 6 — See your results

Results land in `r10_cross_vendor/results/run_<timestamp>/`:

- `summary.json` — your accuracy numbers
- `cost_log.csv` — every API call with its cost
- `EYEWITNESS_BENCHMARK_RESULTS_<your-handle>.md` — human-readable table you can share
- `per_question.jsonl` — one row per call, for deep inspection

### Step 7 — Share your results (optional, your choice)

Three sharing options. You pick:

- **Keep private.** Your numbers stay on your machine. That's fine and honored.
- **Share anonymized.** Rename your summary file with a pseudonym, email it to eyewitness@lianabanyan.com. Your numbers go into the commons dashboard without your name.
- **Share public.** Include your name. If your numbers land in Paper #49 (*The Eyewitness Benchmark: Cross-Vendor R9 Replication Analysis*), you're a co-author.

**Your data, your choice. No upload happens automatically. Nothing pings home without you choosing it.**

---

## Path C — Fresh OS + full stack (3–4 hours)

**This is for people who want a dedicated machine for cooperative contribution — a clean Ubuntu box with nothing else on it.** Also the recommended setup for Red Carpet physical-machine recipients and for anyone wiping an old Windows/Mac to repurpose it.

### Step 0 — Back up everything first

**Critical.** A fresh install erases the drive. Before you wipe:

- Use an online backup service (Backblaze, Carbonite, iDrive) OR copy your data to an external USB drive
- Verify the backup completed. Open a file from the backup to be sure.
- Document any software licenses / activation keys you might need to reinstall later (Photoshop, Office, etc.)

### Step 1 — Download Ubuntu 24.04 LTS

- Go to [ubuntu.com/download/desktop](https://ubuntu.com/download/desktop)
- Download the 24.04 LTS Desktop ISO (about 5 GB)
- Verify checksum (optional but recommended — ubuntu.com publishes SHA256 hashes)

### Step 2 — Create a bootable USB drive

- You'll need a USB drive with at least 8 GB, which will be erased
- On Mac: use [balenaEtcher](https://etcher.balena.io) — free
- On Windows: use [Rufus](https://rufus.ie) — free
- On Linux: use `dd if=ubuntu-24.04-desktop-amd64.iso of=/dev/sdX bs=4M status=progress` where `sdX` is your USB (be careful; wrong device name overwrites your working drive)

### Step 3 — Install Ubuntu

- Plug the USB into the target machine
- Boot from USB (usually F12 or DEL at boot-time to select boot device)
- Follow the Ubuntu installer. When asked:
  - Language: your preference
  - Keyboard layout: your preference
  - "Erase disk and install Ubuntu" (since you backed up in Step 0)
  - Timezone: your preference
  - Username + password: pick something you'll remember

Installation takes 15–30 minutes. The machine reboots when done.

### Step 4 — External-drive data isolation (recommended, especially if shipping)

If this machine will eventually ship to someone else OR you want to keep personal files separate from the shipping-image:

```bash
# After first login:
sudo mkdir /mnt/external
# Plug in your external USB drive, find its device (usually /dev/sdb1 or similar):
lsblk
# Mount it:
sudo mount /dev/sdb1 /mnt/external
# Add to fstab for auto-mount on boot (get UUID first):
sudo blkid /dev/sdb1  # copy the UUID value
echo "UUID=<paste-uuid-here> /mnt/external ext4 defaults 0 2" | sudo tee -a /etc/fstab
```

Then create a user account whose home directory lives on the external drive:

```bash
sudo useradd -m -d /mnt/external/jonathan -s /bin/bash jonathan
sudo passwd jonathan
sudo usermod -aG sudo jonathan
```

Log out, log in as `jonathan`. Everything you save in your home folder lives on the external drive. Unplug → gone.

**If you're shipping this machine:** keep a separate account called `eyewitness` or similar with its home on the internal drive. That's the account the recipient will use. Before shipping, delete your own account: `sudo userdel -r jonathan`.

### Step 5 — Install Python + the Eyewitness stack

```bash
sudo apt update
sudo apt install -y python3-pip python3-venv git

# Create a virtual environment so the install is clean:
python3 -m venv ~/eyewitness
source ~/eyewitness/bin/activate

# Install librarian-mcp:
pip install git+https://github.com/Upekrithen/librarian-mcp.git

# Clone the benchmark:
git clone https://github.com/Upekrithen/librarian-mcp.git ~/librarian-mcp
cd ~/librarian-mcp/r10_cross_vendor
pip install -r requirements.txt
```

### Step 6 — Hardware stability check

If this is a repurposed machine that's shown freezes or instability, verify it's not a hardware issue BEFORE shipping:

```bash
sudo apt install -y stress-ng
stress-ng --cpu 4 --timeout 10m  # stress CPU for 10 minutes
stress-ng --vm 1 --vm-bytes 2G --timeout 5m  # stress RAM for 5 minutes
```

If either freezes the machine, it's hardware — diagnose (bad RAM, thermal paste, failing drive) before shipping. If both complete clean, your earlier freezes were software-side and Ubuntu fixed them.

### Step 7 — Set up keys + test

Same as Path B Step 3. Create `.env`, load into shell, run a dry run, then a small test, then the full benchmark.

### Step 8 — Shipping (if applicable)

When you're ready to ship:

1. Unplug the external drive.
2. Delete your personal user account (`sudo userdel -r jonathan`).
3. Verify the `eyewitness` user account works: `sudo su - eyewitness`, confirm `cd ~/librarian-mcp/r10_cross_vendor && python run_benchmark.py --dry-run` works.
4. Clear bash history for the root account: `sudo bash -c 'cat /dev/null > /root/.bash_history && history -c'`
5. Shut down. Box up with the included setup doc (`welcome_eyewitness.md`) on the desktop.
6. FedEx Priority Overnight with declared-value insurance covering the machine's replacement cost.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `ModuleNotFoundError: No module named 'anthropic'` | Path B Step 2 incomplete | `cd librarian-mcp/r10_cross_vendor && pip install -r requirements.txt` |
| `Environment variable ANTHROPIC_API_KEY not set` | Keys not loaded into shell | Re-run the `export` or PowerShell command from Path B Step 3 |
| `401 Unauthorized` from Perplexity | Key is invalid or quota exhausted | Check perplexity.ai/settings/api, rotate key, top up credits |
| Benchmark runs but all answers are wrong | R9-v2 preload may be corrupt | Re-clone the repo: `rm -rf librarian-mcp && git clone ...` |
| Ubuntu install freezes mid-installation | Hardware issue | Run memtest86+ from the Ubuntu live USB to check RAM; if clean, try reseating RAM and cables |
| Cost way higher than expected | `--n 75` ran with Opus tier on all vendors | Use `--vendor anthropic --model claude-haiku-4-5-20251001 --n 10` for small tests before committing to full runs |

---

## Community + support

- Report benchmark results / ask installation questions: `eyewitness@lianabanyan.com` (once set up)
- GitHub issues: [github.com/Upekrithen/librarian-mcp/issues](https://github.com/Upekrithen/librarian-mcp/issues)
- The Eyewitness Program: [lianabanyan.com/eyewitness](https://lianabanyan.com/eyewitness) (pending launch)

---

## What you're actually doing (philosophy note)

Running this benchmark makes you a scientific replicator of a cooperative-commons architecture. Your numbers — whether you share them or not — are ground truth that the authors of this project did not produce. The measurement belongs to everyone who runs it.

If you share your results, you're a co-author on Paper #49 (if cited). If you don't, the tool is still yours, forever, under AGPL-3.0 + Pledged Commons grant. There's no dark pattern anywhere in this stack, by design and by bylaw.

**Thank you for running it. We have cookies. And chocolate.**

— Jonathan Jones, Founder, Liana Banyan Corporation
