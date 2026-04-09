# KNIGHT SESSION 256 — Landing Page Stats Fix + CueCard Submit Buttons
## Bishop B075 | April 4, 2026

---

## MISSION

Two fixes:

1. **Index.tsx** — Update the "Built to Last" spotlight card: fix stale numbers and add Crown Jewels stat
2. **CueCardLanding.tsx** — Make the "How to Submit" step cards interactive: clicking a step flips the Requirements box above to show details for that step, with Back and action buttons

---

## FIX 1: Built to Last Stats (Index.tsx, lines ~2083-2112)

### Current (STALE):
```
11 Patent Applications
2,128 Innovations
47 Creators Identified
```

### Change to (4 stats, update grid):

```
12 Patent Applications
2,144 Innovations
182 Crown Jewels
47 Creators Identified
```

**Exact edits in `platform/src/pages/Index.tsx`:**

1. Change `gridTemplateColumns` to handle 4 items: `'repeat(auto-fit, minmax(120px, 1fr))'` (shrink minmax slightly)

2. Change the first stat from `11` to `12` (Prov 12 filing today):
```tsx
<div style={{ fontSize: '2rem', fontWeight: 700, color: '#38a169' }}>12</div>
<div style={{ fontSize: '0.8rem', color: 'rgba(250,245,235,0.7)' }}>Patent Applications</div>
```

3. Change the second stat from `2,128` to `2,144`:
```tsx
<div style={{ fontSize: '2rem', fontWeight: 700, color: '#38a169' }}>2,144</div>
<div style={{ fontSize: '0.8rem', color: 'rgba(250,245,235,0.7)' }}>Innovations</div>
```

4. Add a NEW stat card AFTER the Innovations card and BEFORE the Creators card:
```tsx
<div style={{ background: 'rgba(56,161,105,0.1)', border: '1px solid rgba(56,161,105,0.3)', borderRadius: '0.75rem', padding: '1rem' }}>
  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#38a169' }}>182</div>
  <div style={{ fontSize: '0.8rem', color: 'rgba(250,245,235,0.7)' }}>Crown Jewels</div>
</div>
```

5. Keep `47 Creators Identified` unchanged.

---

## FIX 2: How to Submit Interactive Steps (CueCardLanding.tsx, lines ~234-262)

### Current behavior:
The 4 step cards (Join, Create, Submit, Get paid) are static `<div>` elements. Not clickable. The Requirements box above them (lines ~220-232) shows a static list.

### Desired behavior:
1. Each step card becomes a **clickable button**
2. When clicked, the **Requirements box flips** (animates) to show **detailed info about that step**
3. The flipped view includes:
   - A **Back button** (← Requirements) to return to the requirements list
   - A **contextual action button** with step-specific label and action:
     - Step 1 "Join for $5/year" → action button: **"Join Now"** → navigates to `/join` or signup
     - Step 2 "Create your artwork" → action button: **"View Guidelines"** → scrolls to guidelines or shows them
     - Step 3 "Submit via Salt Mines" → action button: **"Go to Salt Mines"** → navigates to `/salt-mines`
     - Step 4 "Get paid + credited" → action button: **"Learn More"** → shows payment info

### Implementation:

**Add state** to the `GateBountyCard` component (or wherever this section lives):
```tsx
const [activeStep, setActiveStep] = useState<number | null>(null);
```

**Define step details:**
```tsx
const stepDetails = [
  {
    title: "Join for $5/year",
    description: "Membership gives you full platform access — submit work, earn Credits and Marks, build your portable reputation. One price. No tiers. No hidden fees.",
    actionLabel: "Join Now",
    action: () => navigate('/join'),
  },
  {
    title: "Create your artwork",
    description: "Design a cue card using the provided dimensions (3.5\" × 2\"). Follow the brand guidelines for colors, typography, and layout. Your name stays on every card printed.",
    actionLabel: "View Guidelines",
    action: () => { /* scroll to guidelines section or open modal */ },
  },
  {
    title: "Submit via Salt Mines",
    description: "Post your completed design as a bounty fulfillment in the Salt Mines. The review team will verify dimensions, brand compliance, and print readiness.",
    actionLabel: "Go to Salt Mines",
    action: () => navigate('/salt-mines'),
  },
  {
    title: "Get paid + credited",
    description: "Approved designs earn Credits at the posted bounty rate. Your name is permanently credited on the card. Every print run pays you again — passive income from a single design.",
    actionLabel: "Learn More",
    action: () => { /* show payment details or navigate */ },
  },
];
```

**Replace the Requirements box** with a conditional render:
```tsx
{activeStep === null ? (
  {/* Original Requirements list — unchanged */}
  <motion.div ...>
    <h2>Requirements</h2>
    {bounty.requirements.map(...)}
  </motion.div>
) : (
  <motion.div
    key={`step-${activeStep}`}
    initial={{ rotateY: 90, opacity: 0 }}
    animate={{ rotateY: 0, opacity: 1 }}
    exit={{ rotateY: -90, opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10"
  >
    <button
      onClick={() => setActiveStep(null)}
      className="text-white/50 hover:text-white/70 text-sm mb-4 flex items-center gap-1"
    >
      ← Requirements
    </button>
    <h2 className="text-xl font-semibold text-white mb-2">
      Step {activeStep + 1}: {stepDetails[activeStep].title}
    </h2>
    <p className="text-white/70 mb-6 leading-relaxed">
      {stepDetails[activeStep].description}
    </p>
    <button
      onClick={stepDetails[activeStep].action}
      className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold transition-colors"
    >
      {stepDetails[activeStep].actionLabel}
    </button>
  </motion.div>
)}
```

**Make the step cards clickable:**
Replace each `<div className="p-4 rounded-xl bg-white/5">` with:
```tsx
<button
  onClick={() => setActiveStep(index)}
  className={`p-4 rounded-xl transition-all cursor-pointer ${
    activeStep === index
      ? 'bg-amber-500/20 border border-amber-500/50 scale-105'
      : 'bg-white/5 hover:bg-white/10 border border-transparent'
  }`}
>
  <div className="text-2xl mb-2">{step.emoji}</div>
  <div className="text-sm text-white/60">{step.title}</div>
</button>
```

Use a `.map()` over the stepDetails array instead of 4 hardcoded divs.

---

## ACCEPTANCE CRITERIA

- [ ] Built to Last shows: 12 Patents, 2,144 Innovations, 182 Crown Jewels, 47 Creators
- [ ] 4 stats fit cleanly in the grid (no overflow on mobile)
- [ ] How to Submit step cards are clickable
- [ ] Clicking a step flips the Requirements box to show step details
- [ ] Each step detail view has a "← Requirements" back button
- [ ] Each step detail view has a contextual action button
- [ ] Animations are smooth (use framer-motion AnimatePresence if available)
- [ ] `npm run build` passes clean

---

## DO NOT

- Change the 47 Creators number
- Modify any other spotlight cards
- Change the "View Portfolio" link behavior
- Remove the Requirements list content — it still shows when no step is selected
