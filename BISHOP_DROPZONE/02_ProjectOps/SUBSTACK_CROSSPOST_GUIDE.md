# Substack Cross-Post Guide — Liana Banyan

**Prepared by:** Knight/Sonnet 4.6, K478/B122  
**Date:** 2026-04-24  
**Status:** FOUNDER_REVIEW

---

## What This Is

`librarian-mcp/scripts/substack_crosspost.py` is a lightweight pipeline scaffold that takes an existing Pudding article from `BISHOP_DROPZONE/09_Articles/` and prepares a Substack-ready variant.

**What it does:**
1. Applies editorial-voice normalization (walled-garden → user-sovereignty framings)
2. Flags empirical claims that need methodology citations before publishing
3. Checks for Keystone preservation (known Keystones cannot be stripped)
4. Generates a Substack Notes candidates list from H2/H3 section headings
5. Prepends a publication metadata header (Founder fills in fields before posting)

**What it does NOT do:**
- Auto-publish (publication hold is IN FORCE)
- Create Substack accounts or access external APIs
- Rewrite content — it flags and suggests; Founder rewrites

---

## Installation & Setup

The script uses Python standard library only. No dependencies beyond Python 3.10+.

```bash
# From workspace root
python librarian-mcp/scripts/substack_crosspost.py <article.md>
```

Or from the scripts directory:
```bash
cd librarian-mcp/scripts
python substack_crosspost.py ../../BISHOP_DROPZONE/09_Articles/ARTICLE_CONDUCTOR_V03_WE_ARE_EACH_MORE_TOGETHER_B119.md
```

---

## Usage Examples

### Basic conversion
```bash
python librarian-mcp/scripts/substack_crosspost.py \
  BISHOP_DROPZONE/09_Articles/ARTICLE_CONDUCTOR_V03_WE_ARE_EACH_MORE_TOGETHER_B119.md
```
Output: `ARTICLE_CONDUCTOR_V03_WE_ARE_EACH_MORE_TOGETHER_B119_substack.md` (next to input)

### Custom output path
```bash
python librarian-mcp/scripts/substack_crosspost.py \
  BISHOP_DROPZONE/09_Articles/ARTICLE_CONDUCTOR_V03.md \
  --out BISHOP_DROPZONE/09_Articles/substack/conductor_v03_ready.md
```

### Dry run (check without writing)
```bash
python librarian-mcp/scripts/substack_crosspost.py \
  BISHOP_DROPZONE/09_Articles/ARTICLE_CONDUCTOR_V03.md \
  --dry-run
```

---

## Output Structure

Each output file contains:

```
<!-- SUBSTACK CROSSPOST SCAFFOLD -->
<!-- Founder reviews and publishes manually -->
<!-- ... metadata fields to fill ... -->

[NORMALIZED ARTICLE BODY]

---

## 📌 Substack Notes Candidates — Same-Week Spoonfuls
### Note 1: "[section heading]"
> [first sentence of that section]
*→ Full context in the main post. Link in Note body.*

---

## 🔍 Voice Normalization Report
*(Remove this section before publishing)*
### Anti-Pattern Hits (applied automatically)
- Line X: 'original text' → 'normalized text'
### Keystones Preserved ✓
- #17 reins
### Empirical Claims Needing Methodology Citations ⚠️
- Line Y: '... 86.1% accuracy ...'
  → Add: which benchmark (K475, R12, etc.), N, arms, rubric
```

---

## Voice Normalization Rules

The script applies the following transformations automatically:

| Detected pattern | Replacement |
|---|---|
| "we've built the best ai" | "we built a very fast horse" |
| "best ai for you" | "infrastructure you control" |
| "come inside our platform/ecosystem" | "the protocol is in the commons" |
| "our ai knows/decides/selects" | "the architecture routes" |
| "significantly better" | [FLAG: cite measurement] |
| "dramatically improved" | [FLAG: cite measurement] |
| "coming soon" | [FLAG: publication hold reminder] |

All normalized lines are flagged in the Voice Normalization Report so Founder can review the auto-replacements.

---

## Spoonful Notes Strategy

After the main post, publish 2–4 Substack Notes that week, each linked to the main post. Notes drive discovery — Substack surfaces them to non-subscribers.

**Cadence:**
- **Day 1 (Monday):** Main post email out
- **Day 3 (Wednesday):** First Note (key stat or Keystone quote from the post)
- **Day 5 (Friday):** Second Note (call to subscribe / related finding)

**Note format:**
- 1–3 paragraphs
- One key claim or Keystone
- Link to the full post
- Call to subscribe or recommend

The crosspost script's "Spoonful Notes Candidates" section gives you 4–6 ready headings. Founder picks 2–3 and writes the Note body (typically 100–300 words).

---

## Article → Post Mapping

### Which articles are ready for crosspost?

| Article | Readiness gate | Notes |
|---|---|---|
| `ARTICLE_CONDUCTOR_V03_WE_ARE_EACH_MORE_TOGETHER_B119.md` | Founder rewrite pass needed | Strong voice, needs K474/K475 empirics updated |
| `OP_ED_V01_CATHEDRAL_EFFECT_GO_FIRST_B121.md` | K475 results must land first | Will be the Cathedral Effect brief once empirics are final |
| `ARTICLE_MEDIUM_12_PATENTS_NO_VC.md` | Patent strategy — hold until Prov 14 | Publication hold applies directly |
| `TECHNICAL_BRIEF_CONDUCTORS_BATON_V02_B118.md` | Technical audience only | Fine for developer Substack Notes; check voice |

### When is an article clear for publication?

1. ✓ Founder rewrite complete (voice is Founder's, not scaffold's)
2. ✓ All empirical claims cite their methodology
3. ✓ No walled-garden framings remain
4. ✓ Publication hold cleared (Prov 14 receipt + Founder ratification)
5. ✓ Title and subtitle are final

---

## Running as Part of the Bishop Closeout

At each Bishop session close, if new articles are added to `09_Articles/`, run the crosspost script as a quick audit:

```bash
for article in BISHOP_DROPZONE/09_Articles/*.md; do
  python librarian-mcp/scripts/substack_crosspost.py "$article" --dry-run
done
```

This gives an instant voice-compliance snapshot without writing any files.

---

*K478/B122 — Knight/Sonnet 4.6 — April 24, 2026*
