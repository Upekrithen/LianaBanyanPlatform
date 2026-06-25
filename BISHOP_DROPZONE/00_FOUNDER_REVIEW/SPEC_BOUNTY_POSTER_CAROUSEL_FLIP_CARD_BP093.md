---
title: "UX SPEC ADDENDUM -- Bounty Poster Carousel + Flip-Card Pattern"
session: BP093
status: STAGED · FOUNDER REVIEW REQUIRED
addendum_to: "Phase 5 of SEG-BH Knight Marathon unified paste (KNIGHT_CUE_DECK_UNIFIED_SYSTEM_GAP_CLOSURE_PLUS_CREW_BROCHURE_BP093.md)"
note: "This is a SEPARATE ADDENDUM. Bishop does not amend SEG-BH's paste directly. Founder pastes both together OR Bishop merges on Founder directive."
---

# BOUNTY POSTER CAROUSEL + FLIP-CARD · UX SPEC ADDENDUM · BP093

## 1. What It Is

An auto-rotating carousel of Bounty Posters displayed on the mnemosynec.org brochure. Placement: below the Crew / Substrate Network submission form, in its own named section ("Open Bounties"). Each card in the carousel represents one active bounty poster. The carousel rotates automatically at 5-second intervals. Numbered indicator dots below the carousel show position and allow manual navigation.

This is the streaming-service "show ads with clickable dots" interaction pattern, applied to bounty recruitment.

---

## 2. UX Behavior (Founder-Direct BP093)

- Carousel rotates every 5 seconds automatically
- Numbered circles below the carousel, one per poster; the current poster's circle is highlighted (gold accent)
- Clicking a numbered circle jumps to that poster and stops auto-rotation while the user is interacting
- Clicking the poster card itself triggers a CSS 3D flip animation; the back face reveals: full bounty description + "Learn More" link to the full bounty page + Apply CTA
- Clicking the card again, or clicking an explicit flip-back button on the back face, returns to the front face
- Auto-rotation resumes 30 seconds after the last user interaction

---

## 3. HTML Structure

```html
<section class="bounty-carousel-section" aria-label="Open Bounties">
  <div class="bounty-carousel" data-rotate-ms="5000">
    <div class="bounty-track">

      <div class="bounty-card" data-index="0" role="button" tabindex="0"
           aria-label="Bounty: 12 Cities Competition. Press Enter to see details.">
        <div class="bounty-front">
          [poster image or illustrative graphic]
          [title]
          [short hook -- max 200 chars]
        </div>
        <div class="bounty-back">
          [full description]
          <a href="/bounties/12-cities/" class="bounty-learn-more">Learn More</a>
          <a href="/bounties/12-cities/#apply" class="bounty-apply-cta">Apply</a>
          <button class="bounty-flip-back" aria-label="Return to poster front">Back</button>
        </div>
      </div>

      <!-- repeat for each poster -->

    </div>

    <div class="bounty-dots" role="tablist" aria-label="Bounty poster navigation">
      <button data-jump="0" class="active" role="tab"
              aria-selected="true" aria-label="Poster 1: 12 Cities Competition"></button>
      <button data-jump="1" role="tab"
              aria-selected="false" aria-label="Poster 2: Developer Team NOIDS"></button>
      <button data-jump="2" role="tab"
              aria-selected="false" aria-label="Poster 3: Make a Better Website"></button>
      <button data-jump="3" role="tab"
              aria-selected="false" aria-label="Poster 4: Empress Campaign"></button>
    </div>
  </div>
</section>
```

---

## 4. CSS Specs

```css
/* Carousel container */
.bounty-carousel {
  max-width: var(--content-max-width); /* matches brochure content container */
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

/* Track holds all cards side-by-side */
.bounty-track {
  display: flex;
  transition: transform 0.4s ease-in-out;
}

/* Each card: 3D flip container */
.bounty-card {
  flex: 0 0 100%;
  perspective: 1200px;
  cursor: pointer;
  min-height: 320px;
}

.bounty-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s ease-in-out;
}

.bounty-card.flipped .bounty-card-inner {
  transform: rotateY(180deg);
}

/* Front and back faces */
.bounty-front,
.bounty-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  padding: 2rem;
  box-sizing: border-box;
}

.bounty-back {
  transform: rotateY(180deg);
}

/* Dots */
.bounty-dots {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 1rem;
}

.bounty-dots button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: var(--color-muted);
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}

.bounty-dots button.active,
.bounty-dots button[aria-selected="true"] {
  background: var(--color-gold-accent);
}

/* Reduced motion: disable auto-rotate and flip animation */
@media (prefers-reduced-motion: reduce) {
  .bounty-card-inner {
    transition: none;
  }
  .bounty-track {
    transition: none;
  }
}
```

---

## 5. JavaScript Behavior

Vanilla JS only. No framework dependency. No build step required.

```javascript
(function () {
  'use strict';

  const ROTATE_MS = 5000;
  const RESUME_AFTER_MS = 30000;

  function initCarousel(carousel) {
    const track = carousel.querySelector('.bounty-track');
    const cards = Array.from(track.querySelectorAll('.bounty-card'));
    const dots = Array.from(carousel.querySelectorAll('.bounty-dots button'));
    const liveRegion = carousel.querySelector('[aria-live]');

    let current = 0;
    let rotateTimer = null;
    let resumeTimer = null;

    function goTo(index) {
      cards[current].classList.remove('active');
      dots[current].classList.remove('active');
      dots[current].setAttribute('aria-selected', 'false');

      current = (index + cards.length) % cards.length;

      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots[current].classList.add('active');
      dots[current].setAttribute('aria-selected', 'true');

      if (liveRegion) {
        liveRegion.textContent = 'Showing bounty ' + (current + 1) + ' of ' + cards.length;
      }
    }

    function startRotate() {
      if (rotateTimer) return;
      rotateTimer = setInterval(function () {
        goTo(current + 1);
      }, ROTATE_MS);
    }

    function stopRotate() {
      clearInterval(rotateTimer);
      rotateTimer = null;
    }

    function userInteracted() {
      stopRotate();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startRotate, RESUME_AFTER_MS);
    }

    // Dot navigation
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goTo(i);
        userInteracted();
      });
    });

    // Card flip on click or Enter
    cards.forEach(function (card) {
      function flipCard(e) {
        // Do not flip if the click target is a link, button inside the card (other than the card itself)
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
        card.classList.toggle('flipped');
        userInteracted();
      }
      card.addEventListener('click', flipCard);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') flipCard(e);
        if (e.key === 'Escape') card.classList.remove('flipped');
        if (e.key === 'ArrowRight') { goTo(current + 1); userInteracted(); }
        if (e.key === 'ArrowLeft') { goTo(current - 1); userInteracted(); }
      });
    });

    // Flip-back buttons
    carousel.querySelectorAll('.bounty-flip-back').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        btn.closest('.bounty-card').classList.remove('flipped');
      });
    });

    // Lazy-load poster images
    if ('IntersectionObserver' in window) {
      const imgObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              imgObserver.unobserve(img);
            }
          }
        });
      });
      carousel.querySelectorAll('img[data-src]').forEach(function (img) {
        imgObserver.observe(img);
      });
    }

    // Respect prefers-reduced-motion: no auto-rotate
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      startRotate();
    }
  }

  document.querySelectorAll('.bounty-carousel').forEach(initCarousel);
})();
```

---

## 6. Posters in v1 Carousel

| Index | Poster | Source |
|-------|--------|--------|
| 0 | 12 Cities Competition | SEG-BD · BP093 |
| 1 | MnemosyneC Developer Team / NOIDS | SEG-BD · BP-BJ enhanced · BP093 |
| 2 | Make a Better Website than THIS | SEG-BI · BP093 |
| 3 | Name the Empress. Stop the Nothing. | SEG-BL · BP093 · canon_empress_naming_campaign_go_live_ratification_bp092 |
| 4+ | Future bounties (auto-added via admin path below) | rolling |

**Bishop recommendation on rotation order:** The Empress poster (index 3) should rotate INTO position last in each full cycle. The Bastion-in-Storms tagline is the highest-cultural-weight line in the entire carousel. When the visitor reaches poster 4 (index 3) and sees "Name the Empress. Stop the Nothing. Be a Bastion, in a Time of Storms." as the final card before the cycle repeats, that is the last thing they read before deciding whether to scroll further. Last position in a loop is the position that lands in working memory. The operational posters (12 Cities, NOIDS, Better Website) warm the visitor toward participation; the Empress poster closes the loop by naming what all that participation is in service of. Knight should set sort_order for the Empress poster to the highest value among v1 posters in the bounty_posters table to guarantee last-in-cycle placement.

---

## 7. Admin Path · `bounty_posters` Table (Proposed Schema)

Knight builds this table in Phase 1 OR Phase 5 of the SEG-BH Marathon paste. Postgres only. No SQLite primitives.

```sql
CREATE TABLE bounty_posters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  hook_short      TEXT NOT NULL CHECK (char_length(hook_short) <= 200),
  description_full TEXT NOT NULL,
  poster_url      TEXT,          -- path to markdown poster file in repo
  image_url       TEXT,          -- nullable; visual representation for carousel front face
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ    -- nullable; NULL = no expiry
);

CREATE INDEX idx_bounty_posters_active_sort ON bounty_posters (active, sort_order);
```

The carousel JS fetches active posters ordered by `sort_order` at page load (or at build time for static Hugo generation). Adding a new poster to this table and setting `active = TRUE` is sufficient for the carousel to pick it up on next build or page load.

---

## 8. Composes With SEG-BH Phase 5

Phase 5 of the SEG-BH Marathon paste handles bounty poster attachment to Crew invite emails. Each poster in the `bounty_posters` table can be one-click-attached to a Crew invite because the table stores `poster_url` (the canonical markdown content) and `hook_short` (the at-a-glance text for the email preview). The carousel and the email attachment share the same data source. No duplication of poster content.

This spec does NOT amend SEG-BH's paste. It is a parallel addendum. Founder pastes both together or directs Bishop to merge.

---

## 9. Accessibility

- Each dot: `aria-label="Poster N: [title]"` + `role="tab"` + `aria-selected` state
- Carousel container: `aria-label="Open Bounties"` on the section
- `aria-live="polite"` region inside the carousel announces rotation changes to screen readers
- Each card: `role="button"` + `tabindex="0"` + descriptive `aria-label` with flip instruction
- Keyboard: Arrow Left / Arrow Right navigate between posters; Enter flips the focused card; Escape flips back
- `prefers-reduced-motion`: auto-rotation is disabled; flip animation transition is set to `none`; user can still navigate manually via dots and keyboard

---

## 10. Estimated Knight Build Time

3 to 5 hours of additional build time on top of the 16 to 20 hour SEG-BH Marathon estimate.

Total Marathon estimate with this addendum: approximately 20 to 25 hours.

This addendum is scoped conservatively: the HTML structure, CSS, and JS above are production-ready starting points, not pseudocode. Knight's actual build time depends on integration with the Hugo template system and the Supabase `bounty_posters` table query.

---

*UX Spec Addendum staged BP093 · Founder review required before dispatch to Knight*
*Session: BP093 · Bishop SEG-BI · Sonnet 4.6*
