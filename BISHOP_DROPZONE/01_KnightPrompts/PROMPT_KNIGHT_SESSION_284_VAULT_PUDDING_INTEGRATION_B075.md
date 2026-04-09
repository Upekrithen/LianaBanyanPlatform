# KNIGHT SESSION 284 — Vault Feature Pudding Integration
## Bishop B075 | April 4, 2026

---

## MISSION

Convert 12 vault feature Puddings to System A structure, assign numbers #130-#141, and upsert into cephas_puddings. This integrates the vault's topic-based Pudding collection into the sequential numbering system.

---

## CONTEXT

`Asteroid-ProofVault/02_WRITTEN/06_Pudding_Articles/` contains 12 topic-named feature explainers that exist as platform-feature Puddings but have never been numbered or added to `cephas_puddings` table.

**Mapping plan**: See `BISHOP_DROPZONE/VAULT_FEATURE_PUDDINGS_INTEGRATION_PLAN_B075.md` for complete mapping table.

---

## THE 12 SOURCE FILES + TARGETS

```
CEPHAS_PUDDING_BACKER_ELECTION.md           → #130 The Backer Election (oregano)
CEPHAS_PUDDING_BATTERY_DISPATCH_UNIVERSAL_REMOTE.md → #131 Battery Dispatch (cumin)
CEPHAS_PUDDING_CAPTAIN_SYSTEM.md            → #132 The Captain System (paprika)
CEPHAS_PUDDING_COLD_START_HUB.md            → #133 Cold Start Hub (sugar)
CEPHAS_PUDDING_GHOST_WORLD.md               → #134 Ghost World (cinnamon)
CEPHAS_PUDDING_GUEST_MARKS_WALLET.md        → #135 The Guest Marks Wallet (garlic)
CEPHAS_PUDDING_LB_CARD.md                   → #136 The LB Card (garlic)
CEPHAS_PUDDING_MARKS_PAYBACK.md             → #137 Marks Payback (garlic)
CEPHAS_PUDDING_MONEYPENNY_RECEPTIONIST.md   → #138 MoneyPenny the Receptionist (oregano)
CEPHAS_PUDDING_PATHFINDER_JOURNAL.md        → #139 The Pathfinder Journal (basil)
CEPHAS_PUDDING_ROOMMATE_ACCOUNTABILITY.md   → #140 Roommate Accountability (pepper)
CEPHAS_PUDDING_YOURE_IN_CHARGE_OF_YOU.md    → #141 You're in Charge of You (paprika)
```

---

## STEP 1: Write Conversion Script

Create `platform/scripts/integrate-vault-puddings.ts`:

```typescript
// Reads 12 vault feature Puddings, wraps them in System A structure, upserts to DB

const mappings = [
  { source: 'CEPHAS_PUDDING_BACKER_ELECTION.md', number: 130, title: 'The Backer Election', slug: 'the-backer-election', primary_spice: 'oregano', secondary: ['paprika', 'pepper'] },
  { source: 'CEPHAS_PUDDING_BATTERY_DISPATCH_UNIVERSAL_REMOTE.md', number: 131, title: 'Battery Dispatch', slug: 'battery-dispatch', primary_spice: 'cumin', secondary: ['oregano', 'sugar'] },
  { source: 'CEPHAS_PUDDING_CAPTAIN_SYSTEM.md', number: 132, title: 'The Captain System', slug: 'the-captain-system', primary_spice: 'paprika', secondary: ['oregano', 'basil'] },
  { source: 'CEPHAS_PUDDING_COLD_START_HUB.md', number: 133, title: 'Cold Start Hub', slug: 'cold-start-hub', primary_spice: 'sugar', secondary: ['paprika', 'oregano'] },
  { source: 'CEPHAS_PUDDING_GHOST_WORLD.md', number: 134, title: 'Ghost World', slug: 'ghost-world', primary_spice: 'cinnamon', secondary: ['cumin', 'basil'] },
  { source: 'CEPHAS_PUDDING_GUEST_MARKS_WALLET.md', number: 135, title: 'The Guest Marks Wallet', slug: 'the-guest-marks-wallet', primary_spice: 'garlic', secondary: ['ginger', 'sugar'] },
  { source: 'CEPHAS_PUDDING_LB_CARD.md', number: 136, title: 'The LB Card', slug: 'the-lb-card', primary_spice: 'garlic', secondary: ['pepper', 'paprika'] },
  { source: 'CEPHAS_PUDDING_MARKS_PAYBACK.md', number: 137, title: 'Marks Payback', slug: 'marks-payback', primary_spice: 'garlic', secondary: ['oregano', 'paprika'] },
  { source: 'CEPHAS_PUDDING_MONEYPENNY_RECEPTIONIST.md', number: 138, title: 'MoneyPenny the Receptionist', slug: 'moneypenny-the-receptionist', primary_spice: 'oregano', secondary: ['cinnamon', 'basil'] },
  { source: 'CEPHAS_PUDDING_PATHFINDER_JOURNAL.md', number: 139, title: 'The Pathfinder Journal', slug: 'the-pathfinder-journal', primary_spice: 'basil', secondary: ['paprika', 'cinnamon'] },
  { source: 'CEPHAS_PUDDING_ROOMMATE_ACCOUNTABILITY.md', number: 140, title: 'Roommate Accountability', slug: 'roommate-accountability', primary_spice: 'pepper', secondary: ['oregano', 'paprika'] },
  { source: 'CEPHAS_PUDDING_YOURE_IN_CHARGE_OF_YOU.md', number: 141, title: 'You\'re in Charge of You', slug: 'youre-in-charge-of-you', primary_spice: 'paprika', secondary: ['basil', 'pepper'] },
];

// For each mapping:
// 1. Read source file
// 2. Extract narrative content
// 3. Write new file PUDDING_{NNN}_{SLUG_UPPER}_B075.md in BISHOP_DROPZONE
// 4. Insert/upsert into cephas_puddings table
```

## STEP 2: System A Structure Template

Each output file must follow this structure:

```markdown
# Pudding #{number} — {title}

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: {number}
**Author**: Bishop (integrated from vault) | **Session**: B075 (integration)
**Date**: April 4, 2026
**Source**: {source file path in vault}

---

## The Pudding

{Extracted narrative content from source file}

---

## This is NOT Pudding

{Description of source material + where the full technical docs live}

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | Full technical documentation + implementation details |
| 4 | Reading Beacon | Schedule your return |

---

## Spice Tags

| Tag | Type |
|-----|------|
| {primary_spice} (domain) | Primary |
| {secondary[0]} (domain) | Secondary |
| {secondary[1]} (domain) | Secondary |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (...)
VALUES (...)
ON CONFLICT (pudding_number) DO UPDATE SET ...;
```
```

## STEP 3: Run + Verify

```bash
cd platform
npx tsx scripts/integrate-vault-puddings.ts
```

Verify:
```sql
SELECT COUNT(*) FROM cephas_puddings WHERE pudding_number BETWEEN 130 AND 141;
-- Expected: 12

SELECT pudding_number, title, primary_spice FROM cephas_puddings WHERE pudding_number BETWEEN 130 AND 141 ORDER BY pudding_number;
-- Expected: 12 rows, one per integration mapping
```

---

## ACCEPTANCE CRITERIA

- [ ] 12 new PUDDING_*.md files in BISHOP_DROPZONE with System A structure
- [ ] 12 new rows in cephas_puddings with correct numbers + titles + spices
- [ ] No existing rows modified
- [ ] `SELECT MAX(pudding_number) FROM cephas_puddings` returns 141
- [ ] Contiguous 1-141 coverage verified (no gaps)
- [ ] `npm run build` passes

## DO NOT

- Modify the source vault files
- Overwrite existing cephas_puddings rows
- Change the spice assignments (Bishop pre-assigned)
- Skip the "This is NOT Pudding" section
- Reuse pudding_number values already taken
