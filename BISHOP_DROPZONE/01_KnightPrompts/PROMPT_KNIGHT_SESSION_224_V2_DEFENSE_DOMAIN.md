# KNIGHT SESSION 224 — v2 Defense Domain Migration
## Priority: LOW | Complexity: LOW (2 sessions)

---

## V1 INVENTORY
- **Tables**: defense_klaus_vouchers (proxy_id DF-format, email_hash SHA-256, voucher types: bracelet/membership/both, 5000 slot limit)
- **Edge Functions (2)**: handle-defense-klaus-webhook (Stripe), handle-rally-webhook (Stripe)
- **Pages (4)**: DefenseKlausPage ("For Someone You Love" — safety fashion, 24/7 monitoring, legal fund), DefenseClawsPage, DefenseKlausSubmarineDoor, RallyGroupPage
- **Components (7)**: DefenseKlausColdStart, DefenseKlausDaisyChain, DefenseKlausLawyerBounty, DefenseKlausTreasureMap, DefenseKlausWildFireDemo, DefenseClawsCoverageCheck, DefenseClawsPreorder

## V2 STRUCTURE
```
platform-v2/src/domains/defense/
├── pages/
│   ├── DefenseKlausPage.tsx       # "For Someone You Love" (FocusShell — public/conversion)
│   ├── DefenseClawsPage.tsx       # Coverage details (AppShell)
│   ├── RallyGroupPage.tsx         # Rally Group initiative (FocusShell)
│   └── SubmarineDoorPage.tsx      # Internal access point (AppShell)
├── components/
│   ├── ColdStartWidget.tsx, DaisyChainVisualizer.tsx, LawyerBountyBoard.tsx
│   ├── CoverageCheck.tsx, PreorderFlow.tsx, WildfireDemo.tsx
├── hooks/
│   ├── useDefenseKlaus.ts, useRallyGroup.ts
├── lib/
│   ├── defenseTypes.ts, voucherRules.ts (5000 slot limit, 3 types)
├── routes.tsx
└── index.ts
```

## KEY RULES
- Defense Klaus: safety fashion + 24/7 monitoring + legal fund. "For Someone You Love."
- Rally Group: Underground Railroad model for safety coordination
- DefenseKlausPage and RallyGroupPage are FocusShell (public-facing conversion)
- 5,000 cold start voucher limit

## MANDATORY: `cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js`

*FOR THE KEEP!*
