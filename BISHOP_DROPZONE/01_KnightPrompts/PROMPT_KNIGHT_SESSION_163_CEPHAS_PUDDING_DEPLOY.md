# Knight Session 163 — Cephas Pudding Article Deployment

**Priority:** HIGH — 10 new member-facing articles
**Dispatched by:** Bishop (Foreman) B044 | **Date:** March 29, 2026
**Estimated scope:** Half session

---

## TASK: Deploy 10 New Pudding Articles to Cephas

Bishop B044 wrote 10 pudding-style member-facing articles to fill confirmed content gaps. These need to be added to the Cephas content registry and deployed to the2ndsecond.com.

### Articles to Deploy

| File in BISHOP_DROPZONE | Slug | Category | Priority |
|------------------------|------|----------|----------|
| CEPHAS_PUDDING_THREE_CURRENCY_INTRO.md | three-currencies | pudding | HIGH |
| CEPHAS_PUDDING_CAPTAIN_SYSTEM.md | captain-system | pudding | HIGH |
| CEPHAS_PUDDING_COLD_START_HUB.md | cold-start-hub | pudding | HIGH |
| CEPHAS_PUDDING_MONEYPENNY_RECEPTIONIST.md | moneypenny-receptionist | pudding | MEDIUM |
| CEPHAS_PUDDING_LB_CARD.md | lb-card | pudding | MEDIUM |
| CEPHAS_PUDDING_GUEST_MARKS_WALLET.md | guest-marks-wallet | pudding | MEDIUM |
| CEPHAS_PUDDING_PATHFINDER_JOURNAL.md | pathfinder-journal | pudding | MEDIUM |
| CEPHAS_PUDDING_MARKS_PAYBACK.md | marks-payback | pudding | MEDIUM |
| CEPHAS_PUDDING_BACKER_ELECTION.md | backer-election | pudding | LOW |
| CEPHAS_PUDDING_GHOST_WORLD.md | ghost-world | pudding | LOW |

### Steps

1. **Create Hugo content files** for each article:
   ```
   Cephas/cephas-hugo/content/pudding/{slug}.md
   ```
   Use the existing pudding front matter format (see `battery-dispatch-universal-remote.md` for template).

2. **Add to `cephas_content_registry`** via migration:
   ```sql
   INSERT INTO cephas_content_registry (slug, title, category, subcategory, style, content_markdown, implementation_status)
   VALUES
   ('three-currencies', 'Three Currencies, One Cooperative', 'articles', 'how-it-works', 'pudding', '...', 'published'),
   -- ... repeat for all 10
   ```

3. **Build and deploy Cephas:**
   ```
   cd Cephas/cephas-hugo && hugo --minify
   firebase deploy --only hosting:the2ndsecond-trunk -P default
   ```

4. **Verify** all 10 articles are accessible at `the2ndsecond.com/pudding/{slug}/`

### Also: Update Cephas Articles with Renumbered Innovation References

Per B044 reconciliation, two existing Cephas articles reference old B035/B036 innovation numbers. If not already handled by K162:

- `CEPHAS_ARTICLE_2ND_SECOND_REVOLUTION.md` — Update #2022→#2040, #2029→#2047, #2030→#2048, #2031→#2050/#2051, #2032→#2051
- `CEPHAS_ARTICLE_DO_THE_WORK.md` — Update #2022→#2040, #2029→#2047, #2030→#2048

---

## DO NOT
- Do not change article content (Bishop wrote these for a reason)
- Do not skip the content registry entries (Librarian needs them)
- 83.3% is exact — never rounded
- Entity: Liana Banyan Corporation, EIN 41-2797446, Wyoming C-Corp

---

*Dispatched by Bishop (Foreman), Session B044*
*FOR THE KEEP!*
