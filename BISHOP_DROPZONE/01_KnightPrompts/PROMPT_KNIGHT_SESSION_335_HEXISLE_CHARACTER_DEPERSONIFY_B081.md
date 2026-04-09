# Knight Session K335 — HexIsle Character De-Personification
## Bishop B081 | April 5, 2026

---

## MISSION

Replace all human characters in HexIsle with animal/insect placeholders. The actual species choices come from Pawn B56 research (due April 10), but the code structure should be species-agnostic with clear constants that can be swapped.

## WHAT TO CHANGE

### Player Characters (hexisleProjectSpec.ts)
Replace:
- `Kai "The Navigator"` → `Navigator` (species TBD, placeholder: sea turtle)
- `Mira "The Engineer"` → `Engineer` (species TBD, placeholder: beaver)
- `Zephyr "The Wind Rider"` → `Scout` (species TBD, placeholder: hawk)

### Humanoid Progression Paths (hexisleProjectSpec.ts)
Replace Sword Path (strength/defense):
- `Peasant → Farmer → Warrior → King` → `Larva → Worker → Soldier → Queen` (insect metamorphosis)

Replace Crown Path (skill/craft):
- `Merchant → Healer → Assassin → Queen` → `Forager → Nurse → Scout → Matriarch` (ant colony roles)

### Harper Agents (hexRealEstate.ts — VERDANA_HARPERS)
Replace:
- `Old Barley` (Inn-Keeper) → species TBD, placeholder: badger
- `Lyric` (Canal Bard) → species TBD, placeholder: cricket
- `Quiet Tam` (Spice Merchant) → species TBD, placeholder: ant

### Named NPCs (npcShopkeeper.ts — VERDANA_NPCS)
Replace all human NPC names with animal/insect names. Keep role descriptions. Use placeholder species until B56 delivers.

### Horse Progression — NO CHANGE
`WildHorse → FarmHorse → WarHorse` is already animal. Keep as-is.

## CONSTRAINTS

- Create a `CREATURE_CONSTANTS.ts` file in `src/lib/` with all creature definitions in one place, so species can be swapped by changing one file
- Use the creature constant names throughout — never hardcode species names in component code
- Keep all game mechanics, stats, and progression logic identical — only the character identity changes
- No new images needed yet — use emoji or lucide icons as placeholders

## VALIDATION

- `grep -rE "Kai|Mira|Zephyr|Peasant|Merchant|Healer|Assassin|Old Barley|Lyric|Quiet Tam|Mercer Flint|Thaddeus Cork" platform/src/` returns ZERO results (except comments documenting the rename)
- `npm run build` passes
- Lint clean

---

*FOR THE KEEP!*
