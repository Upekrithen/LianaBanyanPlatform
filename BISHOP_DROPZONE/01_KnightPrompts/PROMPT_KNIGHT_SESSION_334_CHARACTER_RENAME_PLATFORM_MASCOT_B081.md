# Knight Session K334 — Character Rename: Platform Mascot System
## Bishop B081 | April 5, 2026

---

## MISSION

Rename all "Denken" references across the platform to a generic, species-agnostic naming convention. The Founder has directed: NO human characters. Animals, insects, and chess pieces only. The mascot species will be chosen after Pawn B56 research (due April 10), but the CODE should be ready to accept any creature.

## WHAT TO CHANGE

### Component Renames
| Current | New |
|---|---|
| `DenkenMenu.tsx` | `MascotMenu.tsx` |
| `DenkenBubble.tsx` | `CharacterBubble.tsx` |
| `DenkenAuthGate.tsx` | `CharacterAuthGate.tsx` |
| `components/v2/denken/` | `components/v2/mascot/` |
| `components/v2/denken/index.ts` | `components/v2/mascot/index.ts` |

### Image References
| Current | New |
|---|---|
| `/images/founderDenken.png` | `/images/mascot-default.png` (placeholder) |
| `/images/Denken_Xray_Off.png` | `/images/mascot-xray-off.png` |
| `/images/Denken_Xray_On.png` | `/images/mascot-xray-on.png` |

### Code References (grep for all)
- `import.*Denken` → `import.*Mascot` or `import.*Character`
- `"Denken"` string literals in tooltips, aria-labels, comments
- `denken` in CSS class names
- `useAuthGateContext` hook reference to "Denken" in message text

### Files That Import Denken Components
- `App.tsx` — `<DenkenMenu />` → `<MascotMenu />`
- `Auth.tsx` — `<DenkenAuthGate />` → `<CharacterAuthGate />`
- `ProtectedRoute.tsx` — any Denken references
- `BuilderModeToggle.tsx` — image paths
- `BeaconBiteNudge.tsx` — already de-personified in B081, verify no remnants

### X-Ray Glossary
- Update any `xrayGlossary.ts` entries that mention "Denken" by name

## CONSTRAINTS

- Do NOT change the mascot's behavior or animation system (shimmer, monocle, scale transitions all stay)
- Do NOT remove the images — just rename them. The actual art replacement comes later.
- The placeholder `mascot-default.png` can be a copy of the current Denken image until the artist delivers new art.
- All component APIs stay the same — just rename the components and their imports.

## VALIDATION

- `grep -r "Denken\|denken\|DENKEN" platform/src/` should return ZERO results
- `npm run build` passes
- Lint clean

---

*FOR THE KEEP!*
