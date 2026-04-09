# KNIGHT HOTFIX — Red Carpet Stats + Emoji Fix + Helm Content Access
## Priority: HIGH — Do before K167
## Three quick fixes, one feature add

---

## FIX 1: Emoji Rendering (the "???" issue)

The Red Carpet walkthrough shows "???" where emoji should be. The font doesn't support these Unicode characters.

**Fix:** Replace all emoji in RedCarpet.tsx and RedCarpetWalkthrough.tsx with Lucide React icons or plain text:

| Current (broken) | Replace With |
|-------------------|-------------|
| Emoji icons showing as ??? | Lucide icons: `<KeyRound />`, `<Link2 />`, `<MapPin />`, `<BookOpen />`, `<Shield />` etc. |
| Any remaining emoji in section headers | Plain text or Lucide equivalents |

Search ALL Red Carpet components for emoji characters and replace systematically.

---

## FIX 2: Stale Innovation Count

Red Carpet says "2,007+ innovations." Current count is **2,100**.

**Fix:** Update the innovation count in RedCarpetWalkthrough.tsx (or wherever the "2,007" string lives) to **2,100**.

Also update:
- "8 With No Prior Art" → Keep this (still accurate for formal Crown Jewels)
- Production systems count → **31**
- Patent applications → **11 provisional**
- Patent claims → **1,500+**
- Charitable initiatives → **16**

Search the entire Red Carpet component tree for any hardcoded numbers and update all of them.

---

## FIX 3: Hugo Archival Prep

Per Founder decision: Hugo gets ONE final update when the launch trigger is pulled, then becomes purely archival (never updated again — all content served from DB).

**No action now** — just note in code comments:
```typescript
// Hugo is ARCHIVAL ONLY after final sync.
// All content served from cephas_content_registry (DB).
// Do NOT run Hugo builds for new content.
```

---

## FEATURE: Helm Content Library

**Founder wants:** All academic papers, pudding articles, letters, and the business plan accessible from his Helm on his phone.

**Build a "Content Library" section in the Helm dashboard:**

```typescript
// New component: HelmContentLibrary.tsx
// Location: Founder's Helm → new tab or section

interface ContentItem {
  id: string;
  title: string;
  type: 'paper' | 'article' | 'letter' | 'plan' | 'dispatch';
  slug: string;
  content_markdown: string;
  created_at: string;
  category: string;
}
```

**Content sources (query from cephas_content_registry):**

| Type | Count | Source |
|------|-------|--------|
| Academic papers | 6 | cephas_content_registry where content_type = 'academic' |
| Academic TL;DRs | 6 | cephas_content_registry where content_type = 'academic-tldr' |
| Pudding articles | 17 | cephas_content_registry where content_type = 'pudding' |
| Letters | ~90 | cephas_content_registry where content_type = 'letter' |
| Business Plan | 1 | NEW — seed "How to Save the World in 6 Easy Steps" |

**If content is NOT yet in cephas_content_registry** (many letters aren't — see Cephas Audit B046), seed it now:
- Create migration to insert the business plan into cephas_content_registry
- Seed academic TL;DRs if not already there
- Seed as many letters as possible from Hugo content files

**UI:**
- Tabs or filter chips: Papers | Articles | Letters | Plans
- Each item opens as a full-screen readable view (mobile-optimized)
- Search/filter by title
- Offline-capable if possible (service worker cache)

**Mobile-first:** This MUST work well on a phone. The Founder will read papers on his phone. Large text, comfortable reading width, no tiny fonts.

---

## DEPLOY

1. Fix emoji → build → deploy
2. Fix stats → build → deploy  
3. Add Helm Content Library → build → deploy
4. All 8 targets

---

*Knight Hotfix — Bishop (Foreman), B046*
*FOR THE KEEP!*
