# K346: Hugo Cross-Link Shortcodes for Puddings and Papers
# Priority: HIGH — makes DB-level links visible in rendered Hugo content
# Bishop: B084 | Date: 2026-04-06

## THE PROBLEM

K343 backfilled `innovations_referenced` in `cephas_puddings` and created `content_source_links`. The React UI (InnovationSourceLinks, CephasContentDetailPage) renders these links. But the Cephas Hugo site renders puddings and papers as static markdown — it doesn't query Supabase.

When a member reads Pudding #169 (SCaaS) on the Hugo-rendered Cephas site, they see no link to Innovation #2176 or to the source document `STAR CHAMBER AS A SERVICE (SCaaS).docx`. The content exists in isolation.

## OBJECTIVE

Add Hugo shortcodes and frontmatter-driven rendering so that pudding and paper pages display:
1. **Related Innovations** — linked to `/innovations/:number` or inline cards
2. **Source Documents** — linked to `/cephas/archive/:slug` (K344 creates this route)
3. **Related Content** — other puddings/papers that share innovations

## PHASE 1: Hugo Shortcodes

Create these shortcodes in `Cephas/cephas-hugo/layouts/shortcodes/`:

### pudding-innovations.html
```html
<!-- Reads from frontmatter: innovations: [2176, 2220] -->
<!-- Renders: "This article explains Innovation #2176 (SCaaS) and Innovation #2220 (Compensation Slider)" -->
<!-- Links to /innovations/:number on the React app, or inline display -->
{{ $innovations := .Page.Params.innovations }}
{{ if $innovations }}
<div class="pudding-innovations">
  <h3>Innovations Explained</h3>
  <ul>
    {{ range $innovations }}
    <li><a href="/innovations/{{ . }}">Innovation #{{ . }}</a></li>
    {{ end }}
  </ul>
</div>
{{ end }}
```

### pudding-source-docs.html
```html
<!-- Reads from frontmatter: source_docs: [{slug: "the-senate-architecture", title: "The Senate Architecture"}] -->
{{ $docs := .Page.Params.source_docs }}
{{ if $docs }}
<div class="pudding-source-docs">
  <h3>Source Documents</h3>
  <ul>
    {{ range $docs }}
    <li><a href="/cephas/archive/{{ .slug }}">{{ .title }}</a></li>
    {{ end }}
  </ul>
</div>
{{ end }}
```

### pudding-related.html
```html
<!-- Reads from frontmatter: related_puddings: ["the-ratchet", "the-flywheel"] -->
{{ $related := .Page.Params.related_puddings }}
{{ if $related }}
<div class="pudding-related">
  <h3>Related Articles</h3>
  <ul>
    {{ range $related }}
    {{ $page := $.Site.GetPage (printf "/pudding/%s" .) }}
    {{ if $page }}
    <li><a href="{{ $page.Permalink }}">{{ $page.Title }}</a></li>
    {{ end }}
    {{ end }}
  </ul>
</div>
{{ end }}
```

## PHASE 2: Update Pudding Frontmatter

Add cross-link data to all 46 pudding Hugo files. Use the `innovations_referenced` data from Supabase to populate:

```yaml
---
title: "SCaaS: Star Chamber as a Service"
# ... existing frontmatter ...
innovations: [2176]
source_docs:
  - slug: "star-chamber-as-a-service-scaas"
    title: "Star Chamber as a Service (SCaaS)"
related_puddings: ["the-ratchet", "the-flywheel"]
---
```

Write a script that:
1. Reads each pudding Hugo file
2. Queries the Supabase migration data (or the migration SQL) for `innovations_referenced`
3. Maps innovation numbers to source document slugs via `content_source_links`
4. Finds related puddings that share innovations
5. Injects the frontmatter fields
6. Writes the updated file

## PHASE 3: Update Paper Frontmatter

Same for the 6 paper Hugo files in `Cephas/cephas-hugo/content/academics/`:

```yaml
---
title: "Wave-Based Pricing..."
# ... existing frontmatter ...
innovations: [2212]
source_docs:
  - slug: "the-galactic-empire-of-liana-banyan"
    title: "The Galactic Empire of Liana Banyan"
related_papers: ["corporate-island-b2b-integration"]
---
```

## PHASE 4: Hugo Template Integration

Update the pudding and paper templates to automatically render the shortcodes:

In `Cephas/cephas-hugo/layouts/pudding/single.html` (or equivalent):
```html
{{ partial "pudding-innovations.html" . }}
{{ partial "pudding-source-docs.html" . }}
{{ partial "pudding-related.html" . }}
```

## PHASE 5: CSS Styling

Style the cross-link sections to match the existing Cephas design:
- Innovation links: badge-style with `#` prefix
- Source document links: book icon + title
- Related content: card-style previews with title + description snippet

## VALIDATION

1. `hugo build` completes without errors
2. Rendered pudding pages show "Innovations Explained" section with links
3. Rendered pudding pages show "Source Documents" section linking to archive
4. Rendered pudding pages show "Related Articles" section
5. Paper pages show same cross-links
6. Links route correctly (innovations → React app, archive → K344 reader, related → other Hugo pages)

## REFERENCE

- Hugo site: `Cephas/cephas-hugo/`
- Existing shortcodes: `Cephas/cephas-hugo/layouts/shortcodes/pudding-*.html`
- Pudding files: `Cephas/cephas-hugo/content/pudding/` (46 files)
- Paper files: `Cephas/cephas-hugo/content/academics/` (6 files)
- innovations_referenced data: migration `20260406200004_k343_source_linking_integration_b084.sql`
- content_source_links: same migration
- K344 archive reader route: `/cephas/archive/:slug`
