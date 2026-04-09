# KNIGHT SESSION 253 — Yvaine Quote + Star SHINE Effect + Second Star Easter Egg
## Dispatched by: Bishop B074
## Date: April 4, 2026
## Priority: HIGH — Visual storytelling on landing page. Easter egg links to the2ndsecond.com.

---

## MISSION

Add the Great-Aunt Yvaine quote to the landing page quote carousel and create a dramatic visual effect when it appears:
1. Add quote as the **3rd entry** in the RotatingQuotes QUOTES array
2. When that quote is active: background stars SHINE bright → page washes to ~70% white → fades back
3. After fade: the word "your" in "Own **your** Work" and "**Your** ideas/services/products" stays glowing
4. Two stars persist on the right side of the page after the effect
5. Clicking the **second star to the right** navigates to `https://the2ndsecond.com`

---

## CONTEXT

### The Quote (exact text)
```
"In the darkest moments, when all seems lost, remember what my Great-Aunt Yvaine, Queen of Stormhold, said: 'What do stars do? They SHINE.'"
— The Founder, Liana Banyan
```

### Why "The Second Star to the Right"
Peter Pan: "Second star to the right, and straight on till morning." The destination is **The 2nd Second** (the2ndsecond.com) — the platform's Decentralized Factory portal. The name IS the Easter egg.

### Files to Modify
- `platform/src/components/RotatingQuotes.tsx` — Add quote + emit event when active
- `platform/src/pages/Index.tsx` — Listen for event, trigger star effect, persist two stars, make "your" glow
- `platform/src/styles/landing.css` — Add keyframes for wash effect + star persist + "your" glow

### Current Quote Array Position
The QUOTES array in RotatingQuotes.tsx currently has 30 entries. Insert the Yvaine quote as **index 2** (3rd position, after Reid Hoffman and The Doors):

```typescript
// Position 0: Reid Hoffman
// Position 1: The Doors
// Position 2: ★ NEW — Great-Aunt Yvaine
// Position 3: Empire Records (was position 2)
// ... rest shifts down by 1
```

---

## IMPLEMENTATION

### 1. Add Quote to RotatingQuotes.tsx

Insert at position 2 in the QUOTES array:

```typescript
// 3. Great-Aunt Yvaine (Stardust) — triggers star effect
{
  text: "In the darkest moments, when all seems lost, remember what my Great-Aunt Yvaine, Queen of Stormhold, said: 'What do stars do? They SHINE.'",
  author: "The Founder, Liana Banyan",
  isYvaine: true,  // flag for star effect trigger
},
```

Add `isYvaine?: boolean` to the Quote interface.

### 2. Emit Event When Yvaine Quote Is Active

In RotatingQuotes.tsx, when the current quote has `isYvaine: true`, dispatch a custom event:

```typescript
useEffect(() => {
  if (QUOTES[currentIndex]?.isYvaine) {
    // Small delay so quote text is visible before effect starts
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('yvaine-shine'));
    }, 1500); // 1.5s after quote appears
    return () => clearTimeout(timer);
  }
}, [currentIndex]);
```

### 3. Star SHINE Effect in Index.tsx

Listen for the `yvaine-shine` event on the landing page:

```typescript
const [isShining, setIsShining] = useState(false);
const [showPersistentStars, setShowPersistentStars] = useState(false);
const [yourGlowing, setYourGlowing] = useState(false);

useEffect(() => {
  const handleShine = () => {
    setIsShining(true);

    // Phase 1: Stars brighten + page washes to 70% white (1.5s)
    // Phase 2: Hold at peak (1s)
    // Phase 3: Fade back (1.5s)
    // Phase 4: Two stars persist + "your" glows

    setTimeout(() => {
      setIsShining(false);
      setShowPersistentStars(true);
      setYourGlowing(true);
    }, 4000); // total effect duration

    // "your" glow fades after 10 seconds (or next quote transition)
    setTimeout(() => {
      setYourGlowing(false);
    }, 14000);
  };

  window.addEventListener('yvaine-shine', handleShine);
  return () => window.removeEventListener('yvaine-shine', handleShine);
}, []);
```

### 4. The White Wash Overlay

Add a full-page overlay div that activates during the shine:

```tsx
{/* Yvaine SHINE overlay */}
<div
  className={`yvaine-wash ${isShining ? 'active' : ''}`}
  style={{
    position: 'fixed',
    inset: 0,
    backgroundColor: 'white',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 50, // above bg text, below content
    transition: 'opacity 1.5s ease-in-out',
  }}
/>
```

When `isShining` is true, the overlay transitions to opacity 0.7 (70% white wash), then back to 0.

### 5. Background Stars Brighten

The background "stars" are actually the `.landing-bg-text` crawling text. During the shine effect:

```css
/* When shining, make the bg text super bright white */
.landing-bg-text.shining .line {
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 0 0 20px white, 0 0 40px white, 0 0 80px white;
  transition: color 1s ease-in, text-shadow 1s ease-in;
}
```

Add/remove the `shining` class on the `.landing-bg-text` div based on `isShining` state.

### 6. Two Persistent Stars

After the wash fades, render two star elements on the right side:

```tsx
{/* Persistent stars after Yvaine effect */}
{showPersistentStars && (
  <div style={{ position: 'fixed', right: '8%', top: '25%', zIndex: 15 }}>
    {/* First star — decorative */}
    <div className="persistent-star" style={{
      fontSize: '2rem',
      color: 'rgba(255, 255, 255, 0.7)',
      textShadow: '0 0 10px rgba(255,255,255,0.5)',
      marginBottom: '3rem',
      animation: 'star-twinkle 3s ease-in-out infinite',
    }}>
      ✦
    </div>

    {/* Second star to the right — clickable → the2ndsecond.com */}
    <a
      href="https://the2ndsecond.com"
      target="_blank"
      rel="noopener noreferrer"
      className="persistent-star second-star"
      style={{
        fontSize: '2rem',
        color: 'rgba(255, 255, 255, 0.9)',
        textShadow: '0 0 15px rgba(255,255,255,0.7), 0 0 30px rgba(255,255,255,0.3)',
        display: 'block',
        cursor: 'pointer',
        animation: 'star-twinkle 2.5s ease-in-out infinite 0.5s',
        transition: 'all 0.3s ease',
      }}
      title="Second star to the right..."
    >
      ✦
    </a>
  </div>
)}
```

The second star (lower one) is slightly brighter, clickable, and links to the2ndsecond.com. On hover, it should pulse/glow brighter.

### 7. "Your" Glow Effect

The word "your" in two places needs to glow after the wash:

**Line 1**: "Own **your** Work. Member-Governed." (~line 2277 in Index.tsx)
**Line 2**: "**Your** ideas/services/products" (~line 2287 in Index.tsx)

Wrap the word "your"/"Your" in a span with conditional glow class:

```tsx
// Line 1
<p>Own <span className={yourGlowing ? 'your-shine' : ''}>your</span> Work. Member-Governed.</p>

// Line 2
<span style={{ display: 'block' }}>
  <span className={yourGlowing ? 'your-shine' : ''}>Your</span> ideas/services/products
</span>
```

### 8. CSS Keyframes

Add to `landing.css`:

```css
/* Yvaine SHINE wash overlay */
.yvaine-wash.active {
  opacity: 0.7 !important;
}

/* Star twinkle for persistent stars */
@keyframes star-twinkle {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

/* Second star hover */
.second-star:hover {
  text-shadow: 0 0 25px white, 0 0 50px white, 0 0 80px rgba(255,255,255,0.5) !important;
  transform: scale(1.3);
}

/* "Your" glow effect */
.your-shine {
  color: #ffffff !important;
  text-shadow: 0 0 8px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4);
  animation: your-pulse 2s ease-in-out infinite;
}

@keyframes your-pulse {
  0%, 100% { text-shadow: 0 0 8px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.3); }
  50% { text-shadow: 0 0 15px rgba(255,255,255,1), 0 0 30px rgba(255,255,255,0.5); }
}
```

### 9. Effect Timeline

```
t=0.0s  Yvaine quote appears (normal fade-in from AnimatePresence)
t=1.5s  yvaine-shine event fires
t=1.5s  Background stars start brightening (1s transition)
t=1.5s  White wash overlay starts fading in (1.5s to 70%)
t=3.0s  Peak brightness — page at ~70% white, stars blazing
t=4.0s  Hold peak (1s)
t=4.0s  isShining → false, wash starts fading out (1.5s)
t=4.0s  Two persistent stars appear (fade in)
t=4.0s  "your" starts glowing
t=5.5s  Wash fully gone, background text back to normal
t=5.5s  Two stars visible, "your" pulsing
t=14.0s "your" glow fades (or on next quote transition)
t=∞     Two stars remain until page refresh
```

---

## DELIVERABLES

1. Yvaine quote at position 3 in QUOTES array with `isYvaine` flag
2. Custom event dispatch when Yvaine quote is active
3. White wash overlay (0% → 70% → 0%) with 4-second total effect
4. Background stars brightening during wash
5. Two persistent stars on right side after effect, second one clickable → the2ndsecond.com
6. "your" glow on both "Own your Work" and "Your ideas" lines
7. CSS keyframes for twinkle, glow, and wash
8. Build passes (`npm run build`)

---

## IMPORTANT NOTES

- The effect should feel MAGICAL, not jarring. Smooth easing on everything.
- The 70% wash should NOT obscure the quote text itself — the quote card has a z-index above the wash.
- The two persistent stars should be subtle — not distracting, just... there. Waiting for someone curious enough to click.
- "Second star to the right" is a Peter Pan reference → The 2nd Second. Do not explain it. Let people discover it.
- The "your" glow is the thematic payoff: the stars SHINE, and then YOUR light stays. You are the star.
- The `isYvaine` flag approach keeps the effect self-contained — no hardcoded index dependencies.
- Clear the persistent stars and "your" glow on page navigation or component unmount.
- The show is about **Liana Banyan** — the star effect celebrates the cooperative, not the founder.
