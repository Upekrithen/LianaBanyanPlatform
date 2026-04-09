# KNIGHT SESSION 75 — HEOHO Cephas Hero Banner + Amplifier Clause in Crown Letter Pages
## Bishop Session 021 | March 23, 2026
## Author: Bishop (Claude Desktop)
## Scope: Lighter session — Cephas banner + copy updates

---

> **CONTEXT**: Knight completed 7 sessions in one day (70, 70b, 70c, 71, 72, 73, 74). Session 75 is deliberately lighter — a copy/styling task, not a feature build. The HEOHO definition (#1900) is constitutional-level. The Amplifier Clause (#1907) goes into all outreach pages.

---

## TASK 1: HEOHO Hero Banner on Cephas Homepage

### What
Add a hero section to the Cephas Hugo homepage template — the first thing every visitor sees when they land on `cephas.lianabanyan.org`.

### Where
`Cephas/cephas-hugo/layouts/index.html` (or the homepage template — check Hugo theme structure)

### Content

```html
<section class="heoho-hero">
  <div class="heoho-hero__content">
    <h1 class="heoho-hero__title" aria-label="Help Each Other Help Ourselves">
      HELP EACH OTHER HELP OURSELVES
    </h1>
    <p class="heoho-hero__tagline">
      Do the work. Eat the fruit. Earn the voice.
    </p>
    <div class="heoho-hero__body">
      <p>You help yourself by building something real.</p>
      <p>You earn directly from your work.</p>
      <p>AND you earn the right to shape what happens next.</p>
      <p class="heoho-hero__emphasis">
        The more you build, the more you eat<br>
        and the louder your voice.
      </p>
    </div>
    <p class="heoho-hero__scripture">
      <em>1 Corinthians 12:21-26</em><br>
      "The eye cannot say to the hand, 'I don't need you.'"
    </p>
    <p class="heoho-hero__amplifier">
      We amplify you. Your success is our success.
    </p>
  </div>
</section>
```

### Styling

```css
.heoho-hero {
  background-color: #1A1F36;
  padding: 80px 24px;
  text-align: center;
  width: 100%;
}

.heoho-hero__content {
  max-width: 720px;
  margin: 0 auto;
}

.heoho-hero__title {
  color: #D4A843;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 16px;
  line-height: 1.2;
}

.heoho-hero__tagline {
  color: #FFFFFF;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 32px;
}

.heoho-hero__body {
  color: #E2E8F0;
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 32px;
}

.heoho-hero__emphasis {
  font-weight: 600;
  margin-top: 16px;
}

.heoho-hero__scripture {
  color: rgba(212, 168, 67, 0.6);
  font-size: 0.9rem;
  font-style: italic;
  margin-bottom: 24px;
}

.heoho-hero__amplifier {
  color: #F59E0B;
  font-size: 1rem;
  font-weight: 600;
}

/* Mobile */
@media (max-width: 768px) {
  .heoho-hero {
    padding: 48px 16px;
  }
  .heoho-hero__title {
    font-size: 1.8rem;
    letter-spacing: 0.1em;
  }
  .heoho-hero__tagline {
    font-size: 1.1rem;
  }
  .heoho-hero__body {
    font-size: 0.95rem;
  }
}
```

### Notes
- Place ABOVE the article grid on the homepage
- Use pudding style — this is the accessible version, not academic
- Gold on dark navy. The 1 Corinthians reference is subdued — the foundation, not the headline.
- If Hugo has a `{{< pudding-hero >}}` shortcode or similar, use it. Otherwise, raw HTML in the homepage template works.

---

## TASK 2: Amplifier Clause on Crown Letter Living Update Pages

### What
Add the Amplifier Clause (#1907) to the 11 Crown Letter living update pages on Cephas.

### Where
`BISHOP_DROPZONE/CROWN_LETTER_UPDATE_CONTENT_ALL_11.md` has the current content for all 11 pages. Each page should get this section added before the closing:

### Content to Add (Universal — same for all 11)

```markdown
## How We Amplify You

Liana Banyan amplifies the people it serves. We drive our audience to your storefronts, your channels, your practices. We don't ask you to be our billboard. We ask to be your megaphone.

The louder you get, the louder we get — because your success is our revenue, and our revenue is your influence.

**We amplify you. You amplify makers. Makers amplify their communities. Everyone gets louder together.**
```

### Which Pages
All 11 Crown Letter living update pages currently on Cephas. Check `Cephas/cephas-hugo/content/letters/` for the directory structure.

---

## TASK 3: Update Innovation Count in Platform

### What
Update the displayed innovation count from 1,897 to 1,910.

### Where
Search the platform codebase for the hardcoded innovation count. It was set to 1,897 in Knight Session 74. Update to 1,910.

Likely locations:
- `platform/src/` — search for "1897" or "1,897" or "innovationCount"
- Any dashboard or stats display component

---

## TASK 4: Replace 4 Cephas Articles with Pudding Rewrites

### What
Bishop Session 021 produced pudding-style rewrites of 4 articles. Replace the originals:

| Original File | Replacement (in BISHOP_DROPZONE) |
|--------------|--------------------------------|
| `articles/academic-currency-differential.md` | `CEPHAS_PUDDING_REWRITE_CURRENCY_DIFFERENTIAL.md` (extract markdown between ``` fences) |
| `articles/anticipated-critiques.md` | `CEPHAS_PUDDING_REWRITE_ANTICIPATED_CRITIQUES.md` (extract markdown between ``` fences) |
| `articles/lifeline-medications-detailed.md` | `CEPHAS_PUDDING_REWRITE_LIFELINE_MEDICATIONS.md` (extract markdown between ``` fences) |
| `articles/more-than-me.md` | `CEPHAS_PUDDING_REWRITE_MORE_THAN_ME.md` (extract markdown between ``` fences) |

### Notes
- Each BISHOP_DROPZONE file contains the complete replacement markdown between ``` fences
- The replacement files include Hugo frontmatter, pudding shortcodes, and SEC-safe language
- Back up originals to `Asteroid-ProofVault` if not already there

---

## VERIFICATION

After deployment:
1. `cephas.lianabanyan.org` — hero banner visible, gold on navy, readable on mobile
2. All 4 replaced articles render with pudding shortcodes (no raw `{{</* */>}}` visible)
3. Innovation count shows 1,910 on platform
4. Crown Letter pages show Amplifier section

---

## SESSION WEIGHT: LIGHT
This is copy + styling. No new components. No new routes. No migrations. Knight earned a light session after the marathon.

---

**FOR THE KEEP.**
