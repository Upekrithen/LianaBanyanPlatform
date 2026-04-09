# Knight Session K369 — Replace 31-Step Guided Tour with Per-Page LRH Greeter
## Priority: HIGH — Current tour UX is annoying, per Founder
## Bishop B087 | April 7, 2026

---

## Context

The current Guided Tour system (`GuidedTourPage`, step-based walkthrough) presents a **31-step linear march** through the platform. The Founder says: "1 - 31? This is annoying." He's right. Nobody wants a museum audio guide.

**Replace with:** LRH (Little Red Hen) as a **per-page contextual greeter** that:
1. Pops up briefly when you land on a page
2. Explains what's on THIS page (not step 14 of 31)
3. Points at 3-4 key elements with chalk outlines (uses existing X-Ray `data-xray-id` system)
4. Can be toggled off — she stays quiet until you want her back
5. Can be toggled on — she re-explains the current page
6. Gets better over time based on feedback

**LRH's signature line** (Founder-approved exact wording):
> "I'm learning too. Every session your feedback helps me get a little better at explaining this place."

---

## TASK 1: Create LRH Per-Page Greeter Component

**File:** `platform/src/components/builder/LRHPageGreeter.tsx`

### Behavior

1. **On page mount** (first visit to this route in this session):
   - LRH slides in from bottom-right (near the mascot avatar)
   - Shows a speech bubble with:
     - Page name (from route or xray glossary)
     - 1-2 sentence explanation of what's on this page
     - "Let me show you around" button → activates X-Ray on this page's elements
     - "I'm good" button → dismisses, LRH slides back to mascot position
   - Auto-dismisses after 8 seconds if no interaction

2. **On page mount** (return visit to this route in this session):
   - LRH does NOT auto-pop. She's already explained this page.
   - But clicking the mascot avatar brings her back with the page explanation.

3. **Toggle behavior:**
   - "Let me show you around" → Activates X-Ray mode (toggleBuilderMode from BuilderModeContext)
   - Elements with `data-xray-id` get chalk outlines
   - LRH walks through them one at a time (highlight first element → show its glossary entry → "Next" button → highlight next → etc.)
   - After last element: "That's everything on this page! Navigate anywhere and I'll introduce you there too."
   - Then: **"I'm learning too. Every session your feedback helps me get a little better at explaining this place."**

4. **Persistence:**
   - Store visited pages in localStorage: `lrh-greeted-pages` = Set of route paths
   - On first session visit to any page → auto-greet
   - On return visit → quiet (but clickable)
   - Reset on new session (clear localStorage key on app load if session is new)

### Props

```typescript
interface LRHPageGreeterProps {
  pageId: string;           // matches data-xray-id of the page wrapper
  pageName: string;         // human-readable: "Mission ONE", "Gleaner's Corner"
  pageExplanation: string;  // 1-2 sentences about what this page does
  elementCount?: number;    // optional: "I found N things to show you on this page"
}
```

### Visual Design

- Speech bubble: dark bg (bg-zinc-900), cyan border (border-cyan-400/40), rounded
- LRH avatar: use existing mascot image from MascotMenu
- Slide-in animation: from bottom-right, 300ms ease-out
- Auto-dismiss: fade out after 8 seconds
- "Let me show you around" button: cyan/teal (matches X-Ray theme)
- "I'm good" button: muted/ghost style
- Learning quote in smaller italic text at bottom of the walk-through completion message

---

## TASK 2: Create Page Greeter Registry

**File:** `platform/src/data/lrhPageGreetings.ts`

A registry mapping route paths to LRH greetings. This is separate from the X-Ray glossary (which explains individual elements). This explains the PAGE as a whole.

```typescript
export interface LRHPageGreeting {
  pageId: string;
  pageName: string;
  explanation: string;
  elements?: string[];  // ordered list of data-xray-ids to walk through
}

export const LRH_PAGE_GREETINGS: Record<string, LRHPageGreeting> = {
  "/welcome": {
    pageId: "welcome-page",
    pageName: "Welcome",
    explanation: "This is your starting point. Six pathways, one cooperative. Pick what you want to build and the platform shapes around you.",
    elements: ["welcome-hero", "welcome-pathways", "welcome-how-it-works"],
  },
  "/mission-one": {
    pageId: "mission-one-page",
    pageName: "Mission ONE",
    explanation: "Everyone Eats Tonight. Bishop Myriel's principle: set another place at the table. No charity line. Same menu, same dignity.",
    elements: ["mission-one-hero", "mission-one-bishop-frame", "mission-one-how-it-works", "mission-one-contribute", "mission-one-next-missions"],
  },
  "/gleaners-corner": {
    pageId: "gleaners-corner-page",
    pageName: "Gleaner's Corner",
    explanation: "This is where the 3.3% goes. Every transaction feeds this fund. Members decide where it's deployed.",
    elements: ["gleaners-corner-hero", "gleaners-corner-explanation", "gleaners-corner-fund-distribution"],
  },
  "/cold-start": {
    pageId: "cold-start-page",
    pageName: "Cold Start Hub",
    explanation: "Six pathways into the cooperative. Food, Manufacturing, Service, Local Business, Guild, Tribe. Pick one. Branch later.",
  },
  "/housing": {
    pageId: "housing-page",
    pageName: "Cooperative Housing",
    explanation: "Housing at Cost+20%. Roommate accountability. Rent transparency. Mission TWO of the cooperative.",
  },
  "/political-expedition": {
    pageId: "political-expedition-page",
    pageName: "Political Expedition",
    explanation: "Power to the People. Pick an issue. Find your representative. Write a letter to Congress. The templates are live.",
  },
  "/helm": {
    pageId: "helm-page",
    pageName: "Your Helm",
    explanation: "This is your personal workspace. One Helm, many Bridges. Everything you build, earn, and track lives here.",
  },
  "/subscribe": {
    pageId: "subscribe-page",
    pageName: "Subscriptions",
    explanation: "Fund channels with Credits, Marks, or Joules. Creators keep 83.3%. The platform takes Cost+20%.",
  },
  // Add more pages as X-Ray instrumentation grows
};
```

---

## TASK 3: Wire LRH Greeter into App Layout

In the main App layout (wherever `MascotMenu` is rendered), add `LRHPageGreeter` that reads the current route and looks up the greeting:

```typescript
import { useLocation } from "react-router-dom";
import { LRH_PAGE_GREETINGS } from "@/data/lrhPageGreetings";

// Inside layout component:
const location = useLocation();
const greeting = LRH_PAGE_GREETINGS[location.pathname];

// Render:
{greeting && (
  <LRHPageGreeter
    pageId={greeting.pageId}
    pageName={greeting.pageName}
    pageExplanation={greeting.explanation}
  />
)}
```

---

## TASK 4: Disable the 31-Step Guided Tour

Do NOT delete the GuidedTourPage or tour infrastructure — just stop it from auto-triggering:

1. Find where the 31-step tour auto-launches (likely on first login or welcome page visit)
2. Comment out or disable the auto-launch trigger
3. Keep the `/guided-tour` route alive as a fallback
4. The LRH greeter replaces the tour's purpose

---

## TASK 5: Add Feedback Mechanism

After LRH finishes explaining a page's elements, show a small feedback widget:

```
Was this helpful?  👍  👎  [Skip]
```

- 👍 → Store `{pageId, helpful: true}` in localStorage
- 👎 → Store `{pageId, helpful: false}` + optional text input: "What would help?"
- Skip → No feedback stored
- This data can later feed into improving the glossary entries

After feedback (or skip), show LRH's signature line in italic:

> *"I'm learning too. Every session your feedback helps me get a little better at explaining this place."*

---

## Done-when Checklist

- [ ] LRHPageGreeter component created with slide-in, auto-dismiss, walk-through
- [ ] LRH_PAGE_GREETINGS registry created with 8+ page greetings
- [ ] Greeter wired into App layout, reads current route
- [ ] First visit to page → auto-greet. Return visit → quiet but clickable
- [ ] "Let me show you around" activates X-Ray on page elements
- [ ] Walk-through steps through elements in order using glossary entries
- [ ] Completion shows learning quote: "I'm learning too. Every session your feedback helps me get a little better at explaining this place."
- [ ] Feedback widget (👍👎 skip) after walk-through
- [ ] 31-step guided tour auto-launch disabled (route preserved)
- [ ] Visited pages persisted in localStorage
- [ ] TypeScript compiles cleanly
- [ ] Build passes

---

*Prompt written by Bishop (Claude Opus 4.6), Session B087, April 7, 2026*
*LRH doesn't march you through 31 steps. She greets you where you are.*
