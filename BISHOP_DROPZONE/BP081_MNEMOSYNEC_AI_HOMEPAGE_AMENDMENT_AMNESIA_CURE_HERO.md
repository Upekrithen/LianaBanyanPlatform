---
amendment: BP081_MNEMOSYNEC_AI_HOMEPAGE_AMENDMENT_AMNESIA_CURE_HERO
bp: BP081
composed_at: 2026-06-13
composed_by: Bishop Opus 4.7 (1M)
purpose: Amend the v0.1.60 homepage integration to lead with the Amnesia/Cure hero (Founder-ratified earlier this session as canonical brand opener); preserve all subsequent sections from BP081_MNEMOSYNEC_AI_HOMEPAGE_DRAFT.md
ratification: Founder direct BP081 2026-06-13 — "I want the amnesia cure framing, because it's the best, imo."
related_canon: feedback_amnesia_substrate_cure_dr_mnemosynec_canon_bp073 — Amnesia/Cure/Dr.MnemosyneC anchor (memory) — register diagnostic-positive, NOT critique
supersedes_section: §1 HERO of BP081_MNEMOSYNEC_AI_HOMEPAGE_DRAFT.md — replaces with §0 HERO Amnesia/Cure and demotes prior §1 to new §1 STRUCTURAL
status: ACTIVE — Knight integrates BEFORE finishing mnemosynec.ai homepage SEG
hard_bindings:
  - "Caithedral spelling enforced — never 'Cathedral'"
  - "Canonical numbers strict — 83.3% never '83', Cost+20%, $5/year"
  - "Mascot canon (BP073) — Dr. MnemosyneC = elephant white-coat stethoscope spectacles; diagnostic-positive register"
  - "Diagnostic-positive — NOT critique of other AI vendors; just naming the problem all AI shares"
---

# Homepage Amendment · Amnesia/Cure Hero · BP081

Knight — Bishop. Founder ratified the Amnesia/Cure framing as the canonical opener. Amend the v0.1.60 mnemosynec.ai homepage integration to lead with §0 HERO Amnesia/Cure, then the existing draft sections cascade as §1 STRUCTURAL through §7 FOOTER.

---

## §0 HERO — Amnesia / Cure (NEW, leads the page)

```markdown
# Your AI has Amnesia.

## Dr. MnemosyneC has the Cure.

Mnemosyne (neh-MOZ-uh-nee) is the Greek goddess of memory. **Dr. MnemosyneC inherited her Memory.**

Every time you start a new session, your AI forgets everything. Your projects, your preferences, your past conversations, gone. Dr. MnemosyneC gives your AI a permanent, private memory that actually stays.

[Download for Windows] [Six Pillars] [How it works]
```

**Voice register (BP073 canon — diagnostic-positive, NOT critique):**
- The amnesia is named as a problem of how AI WORKS, not a fault of any vendor
- Dr. MnemosyneC is the cure, not the attack
- Mascot anchored: elephant white-coat stethoscope spectacles (per `reference_amnesia_substrate_cure_dr_mnemosynec_canon_bp073`)
- Capitalize "Memory" in "inherited her Memory" — proper-noun-as-relic, intentional

---

## §1 STRUCTURAL — MnemosyneC remembers (DEMOTED FROM PRIOR §1 HERO)

The pitch line that was §1 HERO in the original draft moves to §1 STRUCTURAL. It now serves as the SECOND-pass for readers who hooked on the Amnesia/Cure framing and want the architectural framing.

```markdown
## MnemosyneC remembers.

You use AI all day across a dozen surfaces. Each one forgets every time.

**MnemosyneC remembers.** Every interaction with any AI grows your substrate. Every time you ask any AI a question, your substrate informs the answer.

The substrate is YOURS. SHA256-stamped. Append-only. Federated with anyone you choose. Free to copy if you want to fork. Cost+20% if you stay. Workers, Builders, Creators keep 83.3%. No ads. No VC.

**For the keep.**
```

---

## §2 — §7 unchanged from BP081_MNEMOSYNEC_AI_HOMEPAGE_DRAFT.md

- §2 Six Pillars (Good · Fast · Cheap · Private · Free · Yours)
- §3 How We Make Sure Things Are True (pheromone half-life → socceri triad → living-connection buoying → stone tablets)
- §4 How It Works (three-layer Reader/Verifier/Accumulator table)
- §5 Three Currencies (Credits · Marks · Joules · never-fiat)
- §6 Get Started (Download for Windows v0.1.60 + canonical numbers strict)
- §7 Footer (Founder signature pattern + key term glossary)

---

## Required canonical-voice grep checks at SHIP (unchanged + amnesia additions)

- `grep -c "Amnesia" content/<path>` → ≥1
- `grep -c "Dr. MnemosyneC" content/<path>` → ≥2 (header + body)
- `grep -c "inherited her Memory" content/<path>` → ≥1
- `grep -c "Mnemosyne (neh-MOZ-uh-nee)" content/<path>` → ≥1
- `grep -c "MnemosyneC remembers" content/<path>` → ≥1 (now in §1, not §0)
- `grep -c "Shadow E-Giant" content/<path>` → ≥3 (Six Pillars + How Truth Lives + How It Works)
- `grep -c "Caithedral" content/<path>` → ≥1
- `grep -c "Cathedral" content/<path>` → 0 (HARD — failure blocks SHIP)
- `grep -c "83.3%" content/<path>` → ≥1
- `grep -c "For the keep" content/<path>` → ≥1

## Bishop note on the layered structure

This works because every reader-type lands gracefully:

- **Cold first-visit:** hooks on Amnesia/Cure (the problem they instantly feel)
- **Engaged reader:** scrolls to "MnemosyneC remembers" structural framing (the substrate-OS thesis)
- **Pillars reader:** sees Six Pillars value framework
- **Architecture-curious:** reads How Truth Lives + How It Works
- **Convert:** Three Currencies + Get Started CTAs

Same content as the original draft + the Amnesia/Cure hero on top. The Amnesia/Cure is the cold opener; the substrate-OS pitch is the warm body. Both Founder-canon. Both ratified. Both ship.

— Bishop · BP081 · 2026-06-13
