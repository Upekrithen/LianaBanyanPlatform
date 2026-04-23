# Red Carpet Ship — Printed One-Pager (two variants)
## B112, April 21, 2026 — Founder voice pass pending
## For: The Surface laptop ship to Trebor Scholz (or alternate)

**Purpose:** The single sheet of paper tucked inside the laptop lid. Recipient opens the box, opens the laptop, finds this page on the keyboard. Sets the register for the first 30 seconds — then they boot.

**Format target:** 1 page printed. ~350 words. Founder signature handwritten below the typed text.

**Two variants written in parallel below.** Founder picks one. If LinkedIn outreach to Trebor goes well and he's primed for the ship, use **VARIANT A (recipient-specific)**. If the ship gets redirected to an alternate recipient (Doctorow / Newmark / another Crown figure), use **VARIANT B (generic)** with a one-line personalization added to the opening.

**Address & delivery:** The Pawn source file for Trebor does not contain a street address — only "Associate Professor, The New School; Founding Director, Platform Cooperativism Consortium; Faculty Associate, Berkman Klein Center." Three plausible ship addresses:

1. **Trebor Scholz, c/o The New School, 66 West 12th Street, New York, NY 10011** (main campus, Media Studies)
2. **Trebor Scholz, c/o Platform Cooperativism Consortium, 79 Fifth Avenue, 16th Floor, New York, NY 10003** (PCC office)
3. **Ask him directly via LinkedIn** (Founder's preferred vector per B112 prompt) — this is the lowest-friction path and matches his own preference for being reached on LinkedIn.

**Bishop recommendation:** Founder's LinkedIn message includes *"I have a demo machine ready to ship to you. Which address do you prefer?"* — then ship to the answer. Avoids guessing wrong with a $2k package.

---

## VARIANT A — Trebor Scholz (recipient-specific)

> **Professor Scholz,**
>
> You and Mark Esposito wrote in *Stanford Social Innovation Review* that a democratic AI cannot rent space on the extraction stack — that workers, communities, cooperatives, and public institutions have to reclaim the infrastructure itself, **layer by layer, from the earth to the cloud.**
>
> This laptop is one of those layers, built.
>
> On it is the **Librarian** — the memory-packet architecture that reduces AI inference cost by roughly an order of magnitude — plus the Eyewitness Benchmark that proves it across all four major AI vendor families. Eight models. Twelve hundred calls. Mean accuracy 94.8 percent with the preload, 8.7 percent without. At the top of the table, Claude Haiku 4.5 ties Claude Opus 4.7 at 98.7 percent — for one-nineteenth the cost.
>
> You already named the architecture I'm trying to build. I've been working on it for nearly ten years. Eight days ago I shipped the thermometer. Now I'm shipping the machine the thermometer runs on.
>
> Double-click **`demo.sh`** on the desktop. The 8-model table comes up, the preload runs against your own terminal, the cost number is yours to keep. No account. No upload unless you choose it.
>
> **The laptop is yours.** Wipe it, reinstall anything, use it for email forever, sell it, gift it to a student. No strings. No follow-up obligation. The only thing I ask is that if you install the Librarian on your own research machine and the number matches ours, you let it show up in a footnote the next time you write about cooperative infrastructure.
>
> *"Help each other help ourselves."* You built the intellectual foundation with Nathan Schneider in 2015. I spent the last decade constructing on it. This is what it looks like when it's operational, packed in a box you can touch.
>
> Respectfully,
>
> **Jonathan Jones**
> Founder & General Manager, Liana Banyan Corporation
> Founder@LianaBanyan.com · 406-578-1232
> [handwritten signature]
>
> *P.S. — LUKS passphrase + user password are printed on the back of this sheet. Change both on first boot. Repo: github.com/Upekrithen/librarian-mcp*

---

## VARIANT B — Generic (redirect to any recipient, with a one-line opening personalization)

> **[RECIPIENT NAME],**
>
> [ONE-LINE PERSONALIZATION — one sentence naming why *this* recipient gets *this* machine. Example for Doctorow: "You named enshittification. This is the thermometer against it, running on its own hardware." Example for Newmark: "You've spent a career funding the infrastructure underneath journalism. This is the architecture underneath cooperative AI, and it measures its own cost."]
>
> On this laptop is the **Librarian** — the memory-packet architecture that reduces AI inference cost by roughly an order of magnitude — plus the Eyewitness Benchmark that proves it across all four major AI vendor families. Eight models. Twelve hundred calls. Mean accuracy 94.8 percent with the preload, 8.7 percent without. At the top of the table, Claude Haiku 4.5 ties Claude Opus 4.7 at 98.7 percent — for one-nineteenth the cost.
>
> The invisible tax every AI company is paying, measured. In your hand.
>
> Double-click **`demo.sh`** on the desktop. The 8-model table comes up, the preload runs against your own terminal, the cost number is yours to keep. No account. No upload unless you choose it. Your number, visible to you.
>
> **The laptop is yours.** Wipe it, reinstall anything, use it forever, sell it, gift it. No strings. No follow-up obligation. The only thing I ask is that if you install the Librarian on your own machine and the number matches ours, you mention it the next time you write or talk about AI cost, cooperative infrastructure, or the direction the industry is headed.
>
> *"Help each other help ourselves."*
>
> Respectfully,
>
> **Jonathan Jones**
> Founder & General Manager, Liana Banyan Corporation
> Founder@LianaBanyan.com · 406-578-1232
> [handwritten signature]
>
> *P.S. — LUKS passphrase + user password are printed on the back of this sheet. Change both on first boot. Repo: github.com/Upekrithen/librarian-mcp*

---

## BACK SIDE OF THE PAGE (same sheet, printed on the reverse)

> **First-boot credentials (change these immediately after first boot):**
>
> LUKS passphrase: `[GENERATED AT INSTALL — fill in before sealing the box]`
> User: `eyewitness`
> User password: `[GENERATED AT INSTALL — fill in before sealing the box]`
>
> **Five-command tour:**
>
> 1. `~/demo.sh` — plays the 8-model table + one live preload run
> 2. `python -c "from librarian_mcp import librarian_context; print(len(librarian_context()['packet']))"` — confirms the preload loads (~87,000 tokens)
> 3. `cat ~/librarian-mcp-repo/r10_cross_vendor/README.md` — the full methodology
> 4. `cd ~/librarian-mcp-repo/r10_cross_vendor && python demo_smoke.py` — runs one question against your own API key (add your key to `.env` first)
> 5. `gunzip -k ~/librarian-mcp-repo/r10_cross_vendor/results/run_20260421_010021/all_graded.jsonl.gz` — unpacks the 1,200-call grading ledger for your own inspection
>
> **If anything is broken:** email Founder@LianaBanyan.com with the error text. No expectation of diagnosing for us. The laptop is yours.

---

## TREBOR LINKEDIN MESSAGE (draft — paste into LinkedIn DM)

**Register:** warm, respectful, skimmable in 10 seconds. Not a pitch. The address-ask is the functional payload; the ship offer is the hook. Reference the SSIR piece so he immediately clocks that I know his recent work. Expect ~15% Founder rewrite.

**Length target:** ~120 words. LinkedIn DM previews truncate around 100 chars — first sentence has to carry.

---

> **Subject (if LinkedIn surfaces it):** A demo machine, shipped — about the solidarity stack
>
> Professor Scholz — Jonathan Jones, Liana Banyan. Your SSIR piece with Mark Esposito, on reclaiming the stack layer by layer, named exactly the architecture I've been building for nearly a decade.
>
> Eight days ago I shipped an open-source thermometer for AI inference cost. Eight models across Anthropic, Google, OpenAI, Perplexity — mean accuracy 94.8% with the preload, 8.7% without. At the top, Claude Haiku ties Claude Opus at 98.7% — one-nineteenth the cost. Repo: `github.com/Upekrithen/librarian-mcp`.
>
> I have a demo laptop ready to ship to you — Xubuntu, full stack pre-installed, runs the benchmark live when you open it. **Which address do you prefer?** No strings. Wipe it, use it, gift it. If the numbers match ours on your hardware, a footnote the next time you write about cooperative infrastructure is the only ask.
>
> — Jonathan Jones
> Founder@LianaBanyan.com

---

**Why this shape:**
- Opens with his SSIR co-authorship, not mine. He'll read three more sentences.
- Repo URL *before* the ship offer — lets him `pip install` immediately even if he declines the laptop.
- Headline number (Haiku = Opus, 19× cost) is the sharpest structural-enshittification hook he can forward to Nathan Schneider or cite in the next PCC talk.
- Address-ask is the functional step. Lowest-friction way to get the right shipping destination.
- Footnote ask is soft — it's what he was going to do anyway if the tool works.

**If LinkedIn message length gets cut:** the hard floor is the first paragraph + the address-ask. Everything else is recoverable via the repo URL.

---

## DISPATCH CHECKLIST

- [ ] Founder picks Variant A or B (A default for Trebor)
- [ ] Founder voice pass on chosen variant (expect light rewrite — this is already short and most of the voice-bearing lines are Founder anchors)
- [ ] Personalization line filled in if Variant B
- [ ] LUKS passphrase + user password generated at install, written by hand on the back side (NOT typed into a digital file)
- [ ] Printed on stiff letterhead-weight paper, single-sided front + back
- [ ] Handwritten signature over typed "Jonathan Jones"
- [ ] Placed face-up on laptop keyboard before closing lid
- [ ] Outside box: handwritten address label + return address + tracking + signature-required

## KEYSTONE NOTES

- Variant A uses the *"layer by layer, from the earth to the cloud"* anchor which is Scholz's own phrase — not a Liana Banyan Keystone. Strengthens the "I read your work" authenticity without co-opting his language.
- *"Help each other help ourselves"* is the Liana Banyan tagline and works in both variants.
- The thermometer sentence — *"The invisible tax every AI company is paying, measured. In your hand."* — is a candidate Keystone. If this one-pager lands with recipients in a way that gets quoted back, promote. For now, Variant B use only.
- Newmark-territorial Keystone D *"friendly fire"* is NOT in either variant.

---

*Saved B112, April 21, 2026. Bishop (Claude Opus 4.7, 1M context). Paired with `FOUNDER_SURFACE_XUBUNTU_PLAN_B112.md` — this one-pager is Stage 5b of that plan.*
