# KNIGHT SESSION 231 — Cephas Dual-Render Publication System
## Priority: HIGH | Complexity: MEDIUM (1 session)
## Context: Opening Gambit letters are LIVE. Academic recipients (Brynjolfsson, Scholz, Schneider, etc.) will visit Cephas.LianaBanyan.org within days.

---

## WHY THIS MATTERS NOW

Crown Letters point recipients to Cephas.LianaBanyan.org for documentation. Academics expect clean, professional formatting — not a blog. The current CephasContentDetailPage renders all content the same way. We need two render modes:

1. **Academic Mode**: Stanford/NBER-style layout for papers — proper abstract, section numbering, citations, clean serif typography, PDF-exportable
2. **Member Mode**: Progressive disclosure with expandable sections, friendly tone, casual typography

The content_type field on cephas content already distinguishes papers from articles from pudding. Use it.

---

## DELIVERABLES

### 1. Academic Render Component
**File**: `platform/src/components/cephas/AcademicRenderer.tsx`

Layout:
- Clean serif font (Georgia or similar) for body text
- Title + subtitle centered, large
- Author line: "Jonathan Jones — Liana Banyan Corporation"
- Date line from published_at
- Abstract block (if content starts with "## Abstract" or similar heading)
- Section numbers auto-generated (1., 1.1, 1.2, 2., etc.)
- Footnotes/citations rendered in smaller text at bottom
- Page max-width: 720px (like academic papers)
- Print/PDF-friendly styles (@media print)
- Light gray header with "Cephas — Liana Banyan" watermark

### 2. Member Render Component
**File**: `platform/src/components/cephas/MemberRenderer.tsx`

Layout:
- Current progressive-disclosure style (collapsible sections)
- Sans-serif (system default)
- Friendly cards for key stats
- "Related Content" sidebar or bottom section
- Dynamic stats template rendering (existing `{{variableName}}` system)

### 3. Update CephasContentDetailPage.tsx
**File**: `platform/src/pages/CephasContentDetailPage.tsx`

Logic:
```typescript
// Determine render mode from content_type
const isAcademic = ['paper', 'whitepaper', 'academic'].includes(content?.content_type);

// Also allow URL param override: ?mode=academic or ?mode=member
const searchParams = new URLSearchParams(location.search);
const modeOverride = searchParams.get('mode');

const renderMode = modeOverride || (isAcademic ? 'academic' : 'member');
```

- Add a subtle toggle button in top-right: "Academic View" / "Member View"
- Default based on content_type
- Preserve existing URL structure

### 4. Print/Export Button
- Add "Export PDF" button on academic view that triggers `window.print()` with print-optimized CSS
- Academic papers should print cleanly on Letter/A4

### 5. Update CephasGatewayPage.tsx
- Add visual indicator for content_type (small badge: "Paper", "Article", "Pudding", etc.)
- Sort papers first when arriving from a letter link

---

## CONTENT TYPES TO MAP

| content_type | Render Mode | Count (approx) |
|---|---|---|
| paper, whitepaper, academic | Academic | ~30 |
| article | Member | ~12 Cephas + ~17 standalone |
| pudding | Member | 100 |
| blueprint | Member | varies |
| letter | Neither (not public) | N/A |

---

## STYLING REFERENCE

Academic mode should evoke:
- NBER working papers (nber.org/papers)
- Stanford HAI research papers
- Clean, credible, no-nonsense

Key CSS:
```css
.academic-renderer {
  font-family: Georgia, 'Times New Roman', serif;
  max-width: 720px;
  margin: 0 auto;
  line-height: 1.8;
  color: #1a1a1a;
}
.academic-renderer h1 {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
}
.academic-renderer .author-line {
  text-align: center;
  color: #555;
  font-style: italic;
  margin-bottom: 2rem;
}
.academic-renderer .abstract {
  background: #f8f8f8;
  padding: 1.5rem;
  border-left: 3px solid #333;
  margin: 2rem 0;
  font-size: 0.95rem;
}
@media print {
  .no-print { display: none; }
  .academic-renderer { max-width: 100%; }
}
```

---

## TESTING

1. Navigate to a paper on Cephas → should render in Academic mode
2. Navigate to a Pudding article → should render in Member mode
3. Toggle between modes using the button
4. Click "Export PDF" → clean print preview
5. Verify `{{variableName}}` template rendering still works in both modes
6. Check mobile responsive (academic mode should still be readable)

---

## MANDATORY: Rebuild Librarian index after
```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

---

*Opening Gambit recipients will judge us by what they see on Cephas. Make it look like we belong in their world.*

*FOR THE KEEP!*
