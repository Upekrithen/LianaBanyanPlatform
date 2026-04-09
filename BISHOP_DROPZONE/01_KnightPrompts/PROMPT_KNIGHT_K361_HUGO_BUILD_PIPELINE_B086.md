# Knight Session K361 — Hugo Build Pipeline + Cephas Deploy
# Bishop B086 | Priority: HIGH | Depends on: None

## CONTEXT
Cephas Hugo site is at `cephas/cephas-hugo/`. It has 45+ content directories under `content/`. Hugo is installed at `C:/Users/Administrator/AppData/Local/Microsoft/WinGet/Packages/Hugo.Hugo.Extended_Microsoft.Winget.Source_8wekyb3d8bbwe/hugo`. The site builds to `public/` and deploys via Firebase hosting target "main" (or dedicated Cephas target).

B084 added 46 Hugo pudding files, 6 paper Hugo files, and 6 letter Hugo files. K346 added cross-link shortcodes and frontmatter injection for 45 puddings + 6 papers. But no Hugo build has been run to render the cross-linked content.

## WHAT TO BUILD

### 1. Hugo Build Fix + Verification
- Run `hugo` in `cephas/cephas-hugo/` — fix any build errors
- Common issues: broken shortcodes, missing layouts, frontmatter YAML errors
- Target: clean build with 0 errors, 0 warnings
- Record build stats: pages generated, build time

### 2. Content Verification Script
Create `cephas/cephas-hugo/scripts/verify-content.sh`:
```bash
#!/bin/bash
echo "=== Cephas Content Verification ==="
echo "Pudding files: $(find content/pudding -name '*.md' | wc -l)"
echo "Paper files: $(find content/academic -name '*.md' 2>/dev/null; find content/academics -name '*.md' 2>/dev/null | wc -l)"
echo "Letter files: $(find content/letters -name '*.md' | wc -l)"
echo "Innovation files: $(find content/innovations -name '*.md' | wc -l)"
echo "Total content files: $(find content -name '*.md' | wc -l)"
echo ""
echo "=== Broken Links Check ==="
grep -r '\{\{.*ref.*\}\}' content/ | grep -v '.md:' || echo "No broken refs found"
echo ""
echo "=== Missing Frontmatter ==="
find content -name '*.md' -exec sh -c 'head -1 {} | grep -q "^---$" || echo "Missing frontmatter: {}"' \;
```

### 3. Firebase Deploy Configuration
Verify `firebase.json` in `cephas/cephas-hugo/` has correct hosting config:
```json
{
  "hosting": {
    "target": "main",
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```
If Cephas has its own Firebase target, use that instead.

### 4. Build Script
Create `cephas/cephas-hugo/scripts/build-and-verify.sh`:
```bash
#!/bin/bash
set -e
HUGO_PATH="C:/Users/Administrator/AppData/Local/Microsoft/WinGet/Packages/Hugo.Hugo.Extended_Microsoft.Winget.Source_8wekyb3d8bbwe/hugo"

echo "Building Cephas Hugo site..."
$HUGO_PATH --minify

echo ""
echo "Build complete. Stats:"
echo "Pages in public/: $(find public -name '*.html' | wc -l)"
echo "Total size: $(du -sh public/ | cut -f1)"
```

### 5. Menu/Navigation Fix
B084 noted a menu ambiguity: "Documentation as Democracy" was moved to Ops & Transparency. Verify the menu config in `config.toml` or `data/` directory reflects the correct section assignments for all 45+ content areas.

### 6. Cross-Link Rendering
K346 added shortcodes for cross-linking puddings ↔ papers. Verify:
- `{{< pudding-link slug="the-ratchet" >}}` resolves correctly
- `{{< paper-link slug="wave-based-pricing" >}}` resolves correctly
- Related content sections render at bottom of articles
- No broken internal links

## FILES TO CREATE/MODIFY
- `cephas/cephas-hugo/scripts/verify-content.sh` (NEW)
- `cephas/cephas-hugo/scripts/build-and-verify.sh` (NEW)
- `cephas/cephas-hugo/config.toml` — fix any menu issues
- Various `content/**/*.md` files — fix frontmatter/shortcode errors as found
- `cephas/cephas-hugo/firebase.json` — verify config

## CONSTRAINTS
- Hugo Extended is required (already installed)
- Do NOT delete any content files — fix errors in place
- Cross-links must resolve to real pages (no 404s)
- Build must complete with 0 errors before deploy
- Dynamic stats template system: `{{variableName}}` syntax must render via Hugo data templates

## DONE WHEN
- [ ] `hugo --minify` builds clean (0 errors)
- [ ] All pudding, paper, and letter content renders
- [ ] Cross-link shortcodes resolve correctly
- [ ] Content verification script confirms file counts match DB
- [ ] Menu structure clean (no ambiguous sections)
- [ ] Build script created for repeatable builds
- [ ] Firebase deploy config verified
