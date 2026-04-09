# KNIGHT SESSION 139 — Canister System Configurator
## Interactive Product Builder for Modular Injection Molding System
**Innovation:** #2022 | **Bishop:** 035 | **Date:** March 27, 2026
**Revision:** V1.1 — S piston as designated thermoplastic workhorse

---

## CONTEXT
The Canister System is a physical product the cooperative can manufacture and sell. This session builds the CONFIGURATOR — an interactive tool that lets makers:
1. Select canister sizes (S/M/L/XL)
2. Configure stack height (1-6 for gravity, 1-3 for screw press)
3. Choose pressure method (gravity/screw press) — **S canister auto-suggests screw press**
4. Choose screw press handle length (6"/8"/10") if applicable
5. See calculated pressure for their configuration
6. Browse compatible materials based on achievable pressure (GREEN/YELLOW/RED)
7. View pricing (starter kit, add-ons, custom A/B mold pairs)

**IMPORTANT DESIGN PRINCIPLE:** The S piston is the THERMOPLASTIC WORKHORSE. Its small area (3.14 in²) converts modest hand force into 1,500-5,200+ PSI — EXCEEDING desktop injection molders like Galomb ($1,100) and LNS ($1,800). The configurator should guide users toward S + screw press when they select thermoplastic materials, and toward M/L/XL + gravity when they select casting materials.

This lives on The 2nd Second (the2ndsecond.com) — the Decentralized Factory portal.

## DELIVERABLES

### Deliverable 1: Migration
Create `20260327000010_canister_system.sql`:

**Table: canister_configurations**
- id UUID PK
- user_id UUID REFERENCES profiles(id)
- name TEXT NOT NULL
- canister_size TEXT CHECK ('S','M','L','XL')
- stack_count INTEGER CHECK (1-6)
- pressure_method TEXT CHECK ('gravity','screw_press')
- weight_kg NUMERIC — for gravity method
- handle_length_inches NUMERIC DEFAULT 8 — for screw press (6, 8, or 10)
- hand_force_lbs NUMERIC DEFAULT 30 — for screw press
- materials_compatible JSONB — computed
- estimated_pressure_psi NUMERIC — computed
- total_cost_estimate NUMERIC — computed
- created_at TIMESTAMPTZ DEFAULT now()
- RLS: owner only

**Table: canister_products**
- id UUID PK
- product_type TEXT CHECK ('gravity_kit','thermoplastic_kit','combined_kit','canister_pair','screw_press','heated_barrel','sleeve','base','cap','sprue_plug','mold_library')
- size TEXT CHECK ('S','M','L','XL','universal')
- name TEXT NOT NULL
- description TEXT
- price_credits NUMERIC
- price_usd NUMERIC
- bom_cost NUMERIC
- in_stock BOOLEAN DEFAULT false
- created_at TIMESTAMPTZ DEFAULT now()
- RLS: anyone can read

Seed products (Cost + 20% pricing):
```
-- Kits
('gravity_kit', 'M', 'Gravity Starter Kit (M/L)', 'Resin, wax, slip, silicone — M and L sleeves + canisters', null, 249, 168)
('thermoplastic_kit', 'S', 'Thermoplastic Kit (S + Screw Press)', 'PE, PP, ABS — S sleeve + screw press + heated barrel', null, 329, 224)
('combined_kit', 'universal', 'Complete System', 'Both gravity and thermoplastic capabilities', null, 499, 340)

-- Canister pairs
('canister_pair', 'S', 'Custom A/B Canister Pair (S)', '3D printed SLA, max 25cm³ cavity', null, 29, 18)
('canister_pair', 'M', 'Custom A/B Canister Pair (M)', '3D printed SLA, max 100cm³ cavity', null, 39, 24)
('canister_pair', 'L', 'Custom A/B Canister Pair (L)', '3D printed SLA, max 400cm³ cavity', null, 59, 38)
('canister_pair', 'XL', 'Custom A/B Canister Pair (XL)', '3D printed SLA, max 1200cm³ cavity', null, 79, 52)

-- Add-ons
('screw_press', 'S', 'Screw Press (8" handle)', '1/2" ACME thread, 327:1 effective MA, up to 5,207 PSI', null, 99, 60)
('heated_barrel', 'S', 'Heated Barrel Module', 'PID controller + heating band + thermocouple, 180-260°C', null, 129, 80)
('sleeve', 'S', 'Extra Sleeve (S)', 'For stacking or parallel runs', null, 19, 12)
('sleeve', 'M', 'Extra Sleeve (M)', 'For stacking or parallel runs', null, 29, 18)
('sleeve', 'L', 'Extra Sleeve (L)', 'For stacking or parallel runs', null, 39, 24)

-- Mold libraries
('mold_library', 'S', 'HexIsle Terrain Library (10 tiles)', '10 standard hex terrain A/B pairs', null, 149, 95)
```

### Deliverable 2: Hooks
Create `platform/src/hooks/useCanisterSystem.ts`:

```typescript
// Piston areas by size (square inches)
const PISTON_AREAS = { S: 3.14, M: 7.07, L: 15.90, XL: 33.18 };

// Screw press MA by handle length
const SCREW_MA = {
  6: 245,   // (2π × 6) / 0.1 × 0.65
  8: 327,   // (2π × 8) / 0.1 × 0.65
  10: 408,  // (2π × 10) / 0.1 × 0.65
};

const VACUUM_ASSIST_PSI = 7;

// Material compatibility thresholds
const MATERIALS = [
  { name: 'Epoxy Resin', minPsi: 0, maxPsi: 15, category: 'casting' },
  { name: 'Polyurethane Resin', minPsi: 0, maxPsi: 30, category: 'casting' },
  { name: 'Casting Wax', minPsi: 5, maxPsi: 50, category: 'casting' },
  { name: 'Ceramic Slip', minPsi: 0, maxPsi: 10, category: 'casting' },
  { name: 'RTV Silicone', minPsi: 0, maxPsi: 20, category: 'casting' },
  { name: 'Low-Melt Alloy', minPsi: 5, maxPsi: 30, category: 'casting' },
  { name: 'Melted Salt', minPsi: 5, maxPsi: 20, category: 'casting' },
  { name: 'Hot Glue / EVA', minPsi: 30, maxPsi: 80, category: 'marginal' },
  { name: 'Polyethylene (LDPE)', minPsi: 500, maxPsi: 2000, category: 'thermoplastic' },
  { name: 'Polypropylene', minPsi: 1000, maxPsi: 3000, category: 'thermoplastic' },
  { name: 'ABS (high barrel temp)', minPsi: 3000, maxPsi: 5000, category: 'thermoplastic' },
  { name: 'Standard ABS', minPsi: 5000, maxPsi: 15000, category: 'thermoplastic' },
  { name: 'Nylon (heated)', minPsi: 3000, maxPsi: 8000, category: 'thermoplastic' },
  { name: 'Polycarbonate', minPsi: 10000, maxPsi: 20000, category: 'industrial' },
];

function gravityPSI(weightKg: number, size: string): number {
  return (weightKg * 2.205) / PISTON_AREAS[size] + VACUUM_ASSIST_PSI;
}

function screwPressPSI(forceLbs: number, handleInches: number, size: string): number {
  const ma = SCREW_MA[handleInches] || SCREW_MA[8];
  return (forceLbs * ma) / PISTON_AREAS[size];
}

// Returns GREEN / YELLOW / RED for each material
function materialStatus(achievablePsi: number, material): 'green' | 'yellow' | 'red' {
  if (achievablePsi >= material.maxPsi) return 'green';
  if (achievablePsi >= material.minPsi) return 'yellow';
  return 'red';
}
```

Hooks:
- useCanisterProducts(size?, type?) — browse products with filters
- usePressureCalculator(size, method, weightKg?, handleInches?, forceLbs?) — compute PSI
- useMaterialCompatibility(pressurePsi) — return materials with GREEN/YELLOW/RED status
- useSaveConfiguration() — save a configuration
- useMyConfigurations() — list saved configs
- useRecommendedSetup(targetMaterial) — given a material, recommend size + method + handle

### Deliverable 3: CanisterConfigurator Page
Create `platform/src/pages/CanisterConfigurator.tsx` at `/factory/canister`:

**Step 1: "What do you want to make?"**
- Two large cards:
  - 🎨 **Casting** (resin, wax, silicone, slip, alloys) — "Gravity mode. No electricity. Stack up to 6."
  - 🔧 **Thermoplastic** (PE, PP, ABS) — "Screw press mode. S piston. Up to 5,200 PSI."
- Selecting Casting auto-suggests M/L sizes. Selecting Thermoplastic auto-selects S.

**Step 2: Configure**
- Size selector (4 cards with dimensions, max volume, primary mode badge)
- Stack height slider (1-6 for gravity, 1-3 for screw press — ENFORCE this)
- If screw press: handle length selector (6"/8"/10") + force slider (10-50 lbs)
- If gravity: weight slider (5-200 kg)

**Step 3: Results Dashboard**
- **Pressure gauge** — animated arc showing achievable PSI
- **Material compatibility table** — all materials with GREEN/YELLOW/RED badges
- **Cost breakdown** — recommended kit + add-ons + estimated total
- **Comparison callout** — "Your S + Screw Press achieves X PSI — that's [MORE/LESS] than a Galomb B100 ($1,100)"
- **Save Configuration** button
- **Order** CTA linking to product catalog

**Step 4: Visual**
- CanisterStackDiagram (Deliverable 5) showing the configured stack with animated material flow

### Deliverable 4: CanisterProductCatalog Page
Create `platform/src/pages/CanisterProductCatalog.tsx` at `/factory/canister/shop`:
- Tab layout: Kits | Canisters | Add-ons | Mold Libraries
- Product cards with: name, price (USD), description, size badge, stock indicator
- "Custom Mold Request" form for bespoke A/B pairs
- Comparison table: Canister System vs. Galomb vs. LNS vs. Holipress

### Deliverable 5: Visual Stack Diagram Component
Create `platform/src/components/factory/CanisterStackDiagram.tsx`:
- SVG/CSS visual showing stacked canisters in cross-section
- Animates as stack count changes (canisters slide in/out)
- Shows material flow arrows (bottom → up through sprue chain)
- Labels: Cap, Sleeve, A/B Canister, Sprue Plug, Base, Piston/Screw
- Color-coded: S=blue, M=green, L=amber, XL=purple
- If screw press: show handle and screw thread
- If gravity: show weight plates

### Deliverable 6: Routes + Navigation
Add to App.tsx:
- `/factory/canister` — CanisterConfigurator (ExplorerRoute)
- `/factory/canister/shop` — CanisterProductCatalog (ExplorerRoute)

Add to UnifiedNavigation.tsx:
- "Canister System" under factory/manufacturing section (Wrench icon)

### Deliverable 7: Canonical Stats
Update useCanonicalStats.ts:
- innovationCount: += 1 (adding #2022)
- productionSystems: stays 27

## RULES
- Credits NEVER cash out. One-way valve.
- C+20 constitutional floor on all product pricing.
- No securities language.
- HexIsle compatibility highlighted but NOT the only use case.
- S + screw press EXCEEDS Galomb and LNS on max pressure — this is a selling point, display it prominently.
- Stack limit for thermoplastics: 3 max (pressure drop through sprue chain).
- Stack limit for gravity: 6+ (pressure drop negligible at low PSI).
- The Canister System is a PRODUCT, not a production system.

## BUILD ORDER
1. Migration → 2. Hooks → 3. CanisterStackDiagram → 4. CanisterConfigurator → 5. CanisterProductCatalog → 6. Routes → 7. Stats → Build → Deploy

FOR THE KEEP!
