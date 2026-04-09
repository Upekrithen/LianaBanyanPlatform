# Knight Session 49 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: TBD (Knight 48 latest)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

This session bundles TWO tasks. Priority: Task A first, then Task B.

> **NotCents Economy context**: The three-currency system (Credits/Marks/Joules) is branded "The NotCents Economy." The Anvil (Ↄ‖) is the currency symbol. "Powered by NotCents™" should be in the site footer.

---

## TASK A: HexIsle/Tereno Compatibility Certification System

### Context

HexIsle is the platform's flagship physical product — modular hexagonal terrain tiles for tabletop gaming, education, and water management demonstrations. "Tereno" is the crown-standard certification for tiles that fully integrate with the water table system. The six-tier certification creates a structured ecosystem where third-party makers can participate at various quality and compatibility levels.

**The Six Tiers:**
1. **Tereno Certified — Crown Standard** (gold): Requires ALL six criteria: lithographic manufacturing, compliant mechanisms only (no magnets/springs/electronics), cost under ceiling, 60mm flat-to-flat dimensions, water-safe materials, full stack compatible
2. **Tereno Approved — Near Standard** (silver): Meets 5 of 6 criteria, minor deviation documented
3. **HexIsle Official — Cooperative Made** (blue): Made within the LB cooperative, may deviate from Tereno spec
4. **HexIsle Compatible — Third Party** (green): Third-party made, works with the ecosystem but not Tereno-spec
5. **HexIsle Adaptable — Adapter Required** (amber): Works with the ecosystem only with an adapter piece
6. **HexIsle Inspired — Ecosystem** (gray): Thematic/aesthetic compatibility, no mechanical integration

**Piggy-Back Protocol:** Third-party makers submit designs for tier classification. They receive an IP ledger entry and tier-scaled deferred payment for design services rendered (NOT "revenue share" — this is SEC-safe as deferred compensation, like actors working for scale plus backend).

**Process-to-tier mapping:** SLA/injection → Tier 1-3; FDM → Tier 3-4; CNC → Tier 2-3; slip casting → Tier 2-3

**Exclusions (NO tier awarded):** Electronics near water, water-soluble materials, designs that damage other pieces, hydraulic channel obstruction

### Steps:

1. **Create migration** `20260319000033_tereno_certifications.sql` for `tereno_certifications` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `product_name` (text, NOT NULL)
   - `product_description` (text, NOT NULL)
   - `designer_user_id` (uuid, FK to auth.users, nullable)
   - `designer_name` (text, NOT NULL)
   - `tier` (integer, NOT NULL, CHECK (tier >= 1 AND tier <= 6))
   - `tier_name` (text, NOT NULL, CHECK in ('Tereno Certified', 'Tereno Approved', 'HexIsle Official', 'HexIsle Compatible', 'HexIsle Adaptable', 'HexIsle Inspired'))
   - `manufacturing_process` (text, NOT NULL) — SLA, injection, FDM, CNC, slip casting, etc.
   - `dimensions_compliant` (boolean, NOT NULL, default false) — 60mm flat-to-flat
   - `water_safe` (boolean, NOT NULL, default false)
   - `stack_compatible` (boolean, NOT NULL, default false)
   - `compliant_mechanisms` (boolean, NOT NULL, default false) — no magnets/springs/electronics
   - `cost_under_ceiling` (boolean, NOT NULL, default false)
   - `lithographic_manufacturing` (boolean, NOT NULL, default false)
   - `deviation_notes` (text, nullable) — for Tier 2+, what doesn't meet Tereno spec
   - `status` (text, NOT NULL, CHECK in ('submitted', 'reviewing', 'certified', 'rejected'), default 'submitted')
   - `rejection_reason` (text, nullable)
   - `ip_ledger_entry` (text, nullable) — reference to IP ledger
   - `deferred_payment` (numeric, NOT NULL, default 0)
   - `image_url` (text, nullable)
   - `created_at` (timestamptz, NOT NULL, default now())
   - `certified_at` (timestamptz, nullable)

2. **Create migration** `20260319000034_tereno_exclusions.sql` for `tereno_exclusions` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `product_name` (text, NOT NULL)
   - `designer_name` (text, NOT NULL)
   - `exclusion_reason` (text, NOT NULL, CHECK in ('electronics_near_water', 'water_soluble', 'damages_other_pieces', 'hydraulic_obstruction', 'other'))
   - `details` (text, NOT NULL)
   - `reviewed_at` (timestamptz, NOT NULL, default now())

3. **RLS policies**:
   - `tereno_certifications`: All authenticated users can SELECT (browse the catalog). Designer can SELECT/INSERT/UPDATE own submissions (`designer_user_id = auth.uid()`). Admin can CRUD all.
   - `tereno_exclusions`: All authenticated can SELECT. Admin can INSERT/UPDATE/DELETE.

4. **Seed data**: Insert 8 sample certifications across all 6 tiers:
   - Tier 1: "Founder's Compliant Mechanism Flip-Top" (SLA, all 6 criteria met, certified)
   - Tier 1: "Standard River Channel Tile" (injection mold, all criteria met, certified)
   - Tier 2: "Near-Spec Mountain Tile" (SLA, 5 of 6 — slightly over cost ceiling, certified)
   - Tier 3: "Cooperative Forest Hex" (FDM, cooperative-made, certified)
   - Tier 4: "@fusefoxdesign Magnetic Terrain" (FDM, third-party, uses magnets instead of compliant mechanisms, certified)
   - Tier 5: "Oversized Display Hex (80mm)" (CNC, needs adapter ring for 60mm stack, certified)
   - Tier 6: "Decorative Crystal Hex" (resin art, aesthetic only, certified)
   - 1 submitted (awaiting review)
   - Insert 2 exclusions: one electronics-near-water, one water-soluble material

5. **Build `src/pages/TerenoCertification.tsx`** at route `/tereno-certification`:

   **Header:**
   - "Tereno Certification — The Gold Standard" with Award icon (use Lucide `Award`)
   - Subtitle: "Six tiers of compatibility. One ecosystem."

   **Six-Tier Display:**
   - Six visual cards in a responsive grid (3×2 on desktop, 2×3 on tablet, 1×6 on mobile)
   - Each card:
     - Tier number (large) + tier name
     - Distinct border color: gold, silver, blue, green, amber, gray
     - Icon representing the tier (Crown for Tier 1, Shield for Tier 2, etc.)
     - Brief description of what qualifies
     - Count of certified products at this tier
   - Click a tier card to filter the product gallery below

   **Certified Products Gallery:**
   - Grid of product cards
   - Each card: product name, designer name, tier badge (colored), manufacturing process, image placeholder, certification date
   - Filter by tier (clickable tier badges)
   - Sort by: newest, tier, designer

   **"Submit for Certification" Form:**
   - Product name + description
   - Manufacturing process (select from: SLA, Injection Mold, FDM, CNC, Slip Casting, Sand Casting, Laser Cutting, Other)
   - Six compliance checkboxes:
     - Lithographic manufacturing
     - Compliant mechanisms only (no magnets/springs/electronics)
     - Cost under ceiling
     - 60mm flat-to-flat dimensions
     - Water-safe materials
     - Full stack compatible
   - Auto-suggest tier based on checked criteria (all 6 = Tier 1, 5 = Tier 2, etc.)
   - Image upload placeholder
   - Submit button: "Request Certification"

   **Process-to-Tier Mapping Table:**
   - Visual reference table showing which manufacturing processes typically achieve which tiers
   - Columns: Process | Tier Range | Notes
   - SLA/Injection → 1-3 | "Highest precision, best for Tereno spec"
   - FDM → 3-4 | "Good for prototyping and cooperative production"
   - CNC → 2-3 | "High precision, limited by material"
   - Slip Casting → 2-3 | "Ceramic specialty, excellent for water-safe"

   **Exclusions List:**
   - Warning-styled card: "These categories cannot be certified at ANY tier"
   - Four exclusion types with icons:
     - Electronics near water (Zap icon, red)
     - Water-soluble materials (Droplets icon, red)
     - Designs that damage other pieces (AlertTriangle icon, red)
     - Hydraulic channel obstruction (Ban icon, red)

   **Piggy-Back Protocol Explainer:**
   - Card: "Third-Party Maker? Welcome to the Ecosystem"
   - "Submit your design → receive tier classification → earn IP ledger entry → receive tier-scaled deferred payment for design services"
   - "This is deferred compensation for services rendered — not revenue share"
   - Link to academic paper on IP Load Balancing if available

6. **Add route** to `App.tsx`: `/tereno-certification` → `TerenoCertification` (lazy loaded)
7. **Add sidebar navigation** entry

---

## TASK B: Modular Manufacturing Hub (The Forge)

### Context

The Forge is the platform's vertically integrated manufacturing system with swappable process modules. Think of it as an assembly line where each station can be swapped out: today it's slip casting, tomorrow it's injection molding. Makers claim stations based on their expertise via "Crew Call" (film production-style recruitment).

**Key concepts:**
- Modular switch-out process modules: each manufacturing method is a discrete, swappable station
- Crew Call: "We Need You To Do What You're Already Good At" — makers volunteer for stations matching their skills
- Primary/Secondary/Backup: tiered commitment system for each station ensuring production continuity. Natural mentorship chains form (Primary teaches Secondary, Secondary teaches Backup)
- Process Pioneer: first-mover recognition in the IP ledger for a specific manufacturing category. Not exclusionary — just establishes expert status.

### Steps:

1. **Create migration** `20260319000035_manufacturing_modules.sql` for `manufacturing_modules` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `module_type` (text, NOT NULL, UNIQUE, CHECK in ('slip_casting', 'sand_casting', 'sls', 'sla', 'injection_mold', 'desktop_extrusion', 'cnc', 'laser_cutting'))
   - `display_name` (text, NOT NULL)
   - `description` (text, NOT NULL)
   - `primary_operator_user_id` (uuid, FK to auth.users, nullable)
   - `secondary_operator_user_id` (uuid, FK to auth.users, nullable)
   - `backup_operator_user_id` (uuid, FK to auth.users, nullable)
   - `capacity_per_day` (integer, NOT NULL, default 0)
   - `current_queue` (integer, NOT NULL, default 0)
   - `process_pioneer_user_id` (uuid, FK to auth.users, nullable)
   - `process_pioneer_name` (text, nullable)
   - `status` (text, NOT NULL, CHECK in ('active', 'inactive', 'maintenance'), default 'inactive')
   - `location` (text, nullable)
   - `created_at` (timestamptz, NOT NULL, default now())

2. **Create migration** `20260319000036_crew_call_applications.sql` for `crew_call_applications` table:
   - `id` (uuid, PK, default gen_random_uuid())
   - `user_id` (uuid, FK to auth.users, NOT NULL)
   - `module_id` (uuid, FK to manufacturing_modules, NOT NULL)
   - `role_requested` (text, NOT NULL, CHECK in ('primary', 'secondary', 'backup'))
   - `experience_description` (text, NOT NULL)
   - `equipment_owned` (text, nullable)
   - `availability` (text, NOT NULL)
   - `status` (text, NOT NULL, CHECK in ('applied', 'accepted', 'rejected', 'waitlisted'), default 'applied')
   - `created_at` (timestamptz, NOT NULL, default now())
   - `reviewed_at` (timestamptz, nullable)

3. **RLS policies**:
   - `manufacturing_modules`: All authenticated can SELECT. Admin can CRUD all. Operators can UPDATE their own module (where their user_id matches any operator field).
   - `crew_call_applications`: Applicant can SELECT/INSERT own. Admin can CRUD all. No UPDATE by applicant (submit and wait for review).

4. **Seed data**:
   - 8 manufacturing modules (one per type): slip casting (active, has primary operator), SLA (active, has primary + secondary), injection mold (inactive, no operators), desktop extrusion (active, full crew), CNC (maintenance), laser cutting (active, primary only), sand casting (inactive), SLS (inactive)
   - 2 modules with Process Pioneers assigned
   - 6 crew call applications at various stages

5. **Build `src/pages/ModularManufacturing.tsx`** at route `/manufacturing`:

   **Header:**
   - "The Forge — Modular Manufacturing" with Factory icon (use Lucide `Factory`)
   - Subtitle: "Swappable stations. Expert operators. Continuous production."

   **Process Module Grid:**
   - 8 cards in a responsive grid (4×2 on desktop, 2×4 on tablet, 1×8 on mobile)
   - Each card represents one manufacturing module:
     - Module icon (unique per type — use appropriate Lucide icons)
     - Module name (e.g., "SLA — Stereolithography")
     - Status badge: Active (green), Inactive (gray), Maintenance (amber)
     - Crew roster:
       - Primary: name or "OPEN — Apply Now"
       - Secondary: name or "OPEN"
       - Backup: name or "OPEN"
     - Capacity: X units/day
     - Queue: X items waiting
     - Process Pioneer badge (if assigned): star icon + pioneer name
   - Click a card to expand details or navigate to crew call

   **Assembly Line Visualization:**
   - Horizontal flow diagram showing how modules connect in a production pipeline
   - Arrows between modules representing material flow
   - Active modules highlighted, inactive ones dimmed
   - Shows which modules are currently bottlenecks (queue > capacity)

   **Crew Call Section:**
   - "We Need You To Do What You're Already Good At"
   - List of open positions across all modules (filter by role: Primary/Secondary/Backup)
   - Application form:
     - Select module (dropdown)
     - Select role (Primary/Secondary/Backup)
     - Experience description (textarea): "What's your background with this process?"
     - Equipment owned (optional): "Do you own any relevant equipment?"
     - Availability (text): "How many hours/week can you dedicate?"
     - Submit: "Answer the Crew Call"

   **Process Pioneer Badges:**
   - Section showcasing pioneers: "These makers blazed the trail"
   - Card per pioneer: name, process they pioneered, date of recognition
   - "Pioneer a process — be the first to operate an unclaimed station"

   **Production Calendar:**
   - Weekly view showing scheduled production runs per module
   - Color-coded by module type
   - Shows: product being produced, units planned, operator assigned, estimated completion
   - Placeholder: "Production scheduling launches with first active campaigns"

6. **Add route** to `App.tsx`: `/manufacturing` → `ModularManufacturing` (lazy loaded)
7. **Add sidebar navigation** entry

---

## Standard Knight Instructions

- **Build check**: Run `npm run build` before every commit. Fix any errors.
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md` with what you built.
- **Commits**: Separate commits per task (one for Task A, one for Task B).
- **Deploy**: Deploy to Firebase when both tasks complete.
- **Patterns**: Follow existing codebase patterns for components, hooks, and Supabase queries.
- **Migration numbering**: Continues sequentially from 20260319000033 (Session 48 used 000031-000032).
- **NotCents branding**: Use Anvil symbol (Ↄ‖) for currency displays. "Powered by NotCents™" in footer.

**FOR THE KEEP!**
