# KNIGHT SESSION 193 — Content Command Center Template Rendering
## Priority: MEDIUM (Pre-launch polish)
## Depends on: K170 (Dynamic Stats Templates), K190 (Content Command Center)
## Bishop B051

---

## CONTEXT

K170 built the Dynamic Stats Template System: `{{variableName}}` syntax in Cephas articles, auto-replacing from `platform_canonical`. K190 built the Content Command Center where the Founder reviews ~300 outbound documents.

**Problem**: The letter files in `01 MarkupFiles/` still have hardcoded stats (e.g., "2,109 innovations", "161 Crown Jewels"). These were seeded into `helm_content_queue` with stale numbers. When the Founder reviews them, the stats will be wrong.

**Solution**: Apply K170's template rendering in the Content Command Center's markdown viewer so that `{{innovationCount}}` etc. auto-resolve to current values.

---

## TASK 1: Add Template Rendering to HelmContentCenter

In `HelmContentCenter.tsx`, wherever the markdown content is displayed:

1. Import `useCanonicalStats` (already exists from K170)
2. Before passing content to `react-markdown`, run template replacement:

```typescript
const { stats } = useCanonicalStats();

function renderTemplates(content: string): string {
  if (!stats || !content) return content;
  return content
    .replace(/\{\{innovationCount\}\}/g, stats.innovationCount?.toLocaleString() ?? '')
    .replace(/\{\{crownJewelCount\}\}/g, stats.crownJewelCount?.toLocaleString() ?? '')
    .replace(/\{\{provisionalApps\}\}/g, stats.provisionalApps?.toString() ?? '')
    .replace(/\{\{formalClaimsCount\}\}/g, stats.formalClaimsCount?.toLocaleString() ?? '')
    .replace(/\{\{initiativeCount\}\}/g, stats.initiativeCount?.toString() ?? '')
    .replace(/\{\{membershipCost\}\}/g, stats.membershipCost ?? '$5/year')
    .replace(/\{\{creatorKeeps\}\}/g, stats.creatorKeeps ?? '83.3%')
    .replace(/\{\{platformMargin\}\}/g, stats.platformMargin ?? 'Cost + 20%');
}

// In the markdown viewer:
<ReactMarkdown>{renderTemplates(item.content)}</ReactMarkdown>
```

---

## TASK 2: Templatize the 30 Letter Files with Hardcoded Stats

Run a find-and-replace across `01 MarkupFiles/` for these patterns:

| Find | Replace With |
|------|-------------|
| `2,109 innovations` | `{{innovationCount}} innovations` |
| `2,112 innovations` | `{{innovationCount}} innovations` |
| `2,113 innovations` | `{{innovationCount}} innovations` |
| `161 Crown Jewels` | `{{crownJewelCount}} Crown Jewels` |
| `161 crown jewels` | `{{crownJewelCount}} crown jewels` |
| `11 provisional` | `{{provisionalApps}} provisional` |
| `2,081 formal claims` | `{{formalClaimsCount}} formal claims` |
| `2,085 formal claims` | `{{formalClaimsCount}} formal claims` |
| `16 charitable initiatives` | `{{initiativeCount}} charitable initiatives` |
| `$5/year` or `$5 per year` | `{{membershipCost}}` (only in stat contexts, NOT in prose) |
| `83.3%` | `{{creatorKeeps}}` (only in stat contexts) |

**DO NOT** templatize:
- LOCKED letters (these are finalized and should not change)
- The `{{variableName}}` pattern itself (don't double-replace)
- Numbers in non-stat contexts (e.g., "16 years old" is NOT an initiative count)

After replacement, re-seed the `helm_content_queue` with updated content.

---

## TASK 3: Add "Stats Stale" Warning

In the Content Command Center, show a yellow banner if any displayed content contains hardcoded stat numbers that don't match current canonical values. This helps the Founder catch any letters that weren't templatized.

---

## ACCEPTANCE CRITERIA
- [ ] Content Command Center renders `{{template}}` variables with live stats
- [ ] ~30 letter files converted from hardcoded to template syntax
- [ ] LOCKED letters untouched
- [ ] Stale stats warning banner in Content Center
- [ ] Build passes
- [ ] Deploy all 8 targets

---

*Knight Session 193 — Content Center Template Rendering*
*Last mile for letter stats accuracy before Opening Gambit.*
*FOR THE KEEP!*
