# KNIGHT SESSION SEQUENCING — K197 through K199
## Bishop B052

---

## BUILD ORDER (Sequential — each depends on prior)

| Session | Title | Depends On | Innovations | Deploy? |
|---------|-------|------------|-------------|---------|
| **K197** | Action Portal + Beacons + Crow's Nest Trail Map | None | #2119 | YES |
| **K198** | Grand Tour Packages | K197 (Trail Map) | #2120 | YES |
| **K199** | Marks Milestone + Prize Panel | K198 (Tour Marks) | #2121 (CJ) | YES |

---

## WHY THIS ORDER

1. **K197 first**: Renames Portal, adds beacon guidance, builds the Trail Map visual that K198 and K199 populate. Foundation layer.

2. **K198 second**: Grand Tour packages need the Trail Map to show completion stops. Tour completion awards Marks — which feeds K199.

3. **K199 last**: Marks Milestone system needs Marks to actually be earned (from K198 tours or other activity). The Prize Panel routes members back into project backing — closing the loop.

---

## CRITICAL NOTES

- **K197 Trail Marker icons**: Use existing `/images/` directory for preset icons. Ghost icon should be the default. BrandBountyPanel.tsx already handles community-designed icons.
- **K198 Tour stop slugs**: Must match actual `cephas_content_registry` slugs. Verify these exist before seeding. If a slug is missing, create a placeholder entry.
- **K199 Prize rotation**: The contextual prize logic should be simple — query `mark_work_records` grouped by category, pick the top category, map to prize set. Fallback: general prizes.
- **All three**: Deploy after each session — don't batch. Each should work independently even if the next hasn't been built yet.

---

*Sequencing Doc — K197 through K199 — Bishop B052*
*FOR THE KEEP!*
