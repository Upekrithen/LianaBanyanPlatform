# KNIGHT SESSION 145 — HEOHO Business Owner Pages + Cue Card Templates + Pawn BOM Integration
## Bishop 036 | March 27, 2026
## Innovations: #2034-#2037

---

## CONTEXT

The Founder declared: "Every member who starts a project becomes a BUSINESS OWNER. This is the save-the-world part." This session wires that into the platform:

1. Update HEOHO pages with the business owner messaging
2. Add Project-Entity formation flow (sole prop / LLC requirement)
3. New Cue Card template: "WE DON'T GIVE PEOPLE JOBS — WE GIVE THEM BUSINESSES"
4. Sponsored Business Starter Kit page ($100 kit, 10,000 target)
5. S Piston BOM page (real McMaster-Carr part numbers from Pawn B26)

**Depends on:** K144 (Chain + Medallion), K143 (2nd Second Landing + Manufacturing Ladder), K142 (Production Projects), K131 (CueCardGeneratorV2).

---

## DELIVERABLE 1: HEOHO Page Update

Modify the existing HEOHO / Interdependence page(s) to add a prominent section:

**New Section: "Business Owners, Not Employees"**

> Every member who starts a project becomes a business owner.
>
> Not a gig worker. Not a contractor waiting for assignments. A business owner — with their own entity, their own products, their own customers, and their own revenue.
>
> We don't give people jobs. We give them businesses.
>
> The cooperative provides the infrastructure: marketplace, payment rails, quality standards, equipment co-funding, patent protection. You provide the work.
>
> Sole proprietorship to start. LLC when you're ready. Factory Node when you've earned it.
>
> 10,000 Business Starter Kits. $100 each. Backed by our patent portfolio.
> Every kit turns a person into a business owner on the spot.

Add a CTA: "Start Your Business" → `/production`

---

## DELIVERABLE 2: Project-Entity Formation Component — `ProjectEntitySetup.tsx`

Create `/src/components/projects/ProjectEntitySetup.tsx`:

A step in the project creation flow that collects entity information:

**Step 1: Entity Type**
- Radio buttons: Sole Proprietorship (recommended to start) / LLC (recommended for growth) / Corporation (advanced)
- Brief explanation of each with pros/cons
- "Not sure? Start with Sole Proprietorship — you can upgrade anytime."

**Step 2: Entity Details**
- Entity name (business name or personal name for sole prop)
- State of formation (dropdown, default Wyoming for LLC)
- EIN or SSN (with note: "Required for 1099 contractor payments. Never shared publicly.")

**Step 3: Confirmation**
- Summary of entity info
- "Your project will operate through [Entity Name] ([Entity Type])"
- Link to the full Business Formation Guide (Pawn B26 #6 will provide content)

Store in a new `project_entities` column on the `projects` table or a linked `project_entities` table.

---

## DELIVERABLE 3: Cue Card Templates — Update CueCardGeneratorV2

Add 2 new templates:

**Template: "BUSINESS OWNER"**
- Front: "WE DON'T GIVE PEOPLE JOBS. WE GIVE THEM BUSINESSES."
- Subtitle: "Liana Banyan Cooperative"
- QR code → `/production`
- Back: "Sole prop to start. LLC when ready. Factory Node when earned. Start at lianabanyan.com/production"

**Template: "STARTER KIT"**
- Front: "$100 BUSINESS STARTER KIT"
- Subtitle: "Everything you need to become a business owner today."
- QR code → `/starter-kit`
- Back: "Includes: 1 year membership + $50 LB Card + 500 Marks + Business formation guide + Your first bounty"

Add with `category: 'recruitment'` tag.

---

## DELIVERABLE 4: Business Starter Kit Page — `StarterKitPage.tsx`

Create `/src/pages/StarterKitPage.tsx` at route `/starter-kit`:

**Hero:**
- "The $100 Business Starter Kit"
- "Everything you need to become a business owner. Today."
- Progress bar: "X of 10,000 kits sponsored" (from DB counter)

**What's In The Kit:**
- Card grid showing the 5 components:
  1. LB Membership (1 year, $5 value)
  2. LB Card with $50 cash preloaded
  3. 500 starter Marks
  4. Business Formation Guide
  5. Physical Cue Card with your QR code

**Sponsor A Kit:**
- "Fund a kit for someone who needs it. $100 backs a new business owner."
- "Backed by our patent portfolio: 10 provisionals, 1,511 formal claims."
- Sponsor button → pledge flow (like production level pledges)

**Claim A Kit (if sponsored):**
- "A kit has been sponsored for you. Claim it now."
- Claim flow → creates account + loads LB Card + grants Marks + generates Cue Card

**Stats:**
- Kits sponsored / Kits claimed / Businesses started from kits

---

## DELIVERABLE 5: S Piston BOM Reference Page — `CanisterBOMPage.tsx`

Create `/src/pages/CanisterBOMPage.tsx` at route `/canister/bom`:

Display the real, buyable BOM from Pawn B26 #5:

**Component Table:**
| Component | Part Number | Source | Qty | Unit Price | Notes |
|-----------|------------|--------|-----|------------|-------|
| 1/2"-10 ACME Lead Screw, 3ft | 99030A005 | McMaster-Carr | 1 | $17.84 | Cut to length |
| Bronze ACME Nut (Precision) | 1343K134 | McMaster-Carr | 1 | $51.53 | 1,300 lb thrust rated |
| 2" Steel Round Bar (piston disc) | — | Metal supplier | 1 | ~$15.00 | Machine to disc |
| PTFE O-Ring Dash-222 | Dash-222 | McMaster-Carr | 2 | ~$7.00 | 2" bore seal |
| Steel Cylinder (2" ID, machined) | Custom | Local shop / Xometry | 1 | ~$150.00 | Thick wall |
| Silicone Heater Band 50mm 200W | — | AliExpress | 1 | ~$38.00 | 110/220V |
| Inkbird PID ITC-106VH Kit | ITC-106VH | Amazon/Inkbird | 1 | ~$60.00 | With K-type + SSR |
| Thrust bearing 1/2" | — | McMaster/Amazon | 1 | ~$15.00 | Screw support |
| Frame/brackets/misc | — | Metal supplier | 1 set | ~$40.00 | Steel plate |
| **TOTAL** | | | | **~$430-450** | |

**Comparison Section:**
- Holipress: ~$800-1,200 (turnkey but less customizable)
- Alibaba Manual Press: ~$460-1,000 (hydraulic, not screw-driven)
- Morgan Press: ~$1,200+ (highest-rated desktop, 5,000 PSI)
- **S Piston Prototype: ~$430-450** (matching Morgan Press PSI at 1/3 the cost)

**CTA:** "Build one yourself — claim the bounty: 500 Marks" → link to bounty

---

## DELIVERABLE 6: Routes and Navigation

**Routes:**
```
/starter-kit → StarterKitPage
/canister/bom → CanisterBOMPage
```

**Navigation:**
- HEOHO section: link to /starter-kit
- Canister System project page: link to /canister/bom
- 2nd Second landing: link to /starter-kit in "How It Works" section

---

## FILE SUMMARY

| # | File | Action |
|---|------|--------|
| 1 | HEOHO page(s) | MODIFY (business owner section) |
| 2 | `src/components/projects/ProjectEntitySetup.tsx` | CREATE |
| 3 | `src/pages/tools/CueCardGeneratorV2.tsx` | MODIFY (2 templates) |
| 4 | `src/pages/StarterKitPage.tsx` | CREATE |
| 5 | `src/pages/CanisterBOMPage.tsx` | CREATE |
| 6 | `src/App.tsx` | MODIFY (routes) |

**6 files (3 new, 3 modified).**

---

**FOR THE KEEP.** 🏰
