# Portal Separation Architecture Plan

## Overview
This document outlines the strategic separation of LianaBanyan into two distinct portals with different purposes and access patterns.

---

## Portal Architecture

### 1. **Public Marketplace Portal** (Current Site + Project Modules)
**Domain:** `[project-sku].lianabanyan.com` (subdomains) + main marketplace
**Purpose:** Customer-facing discovery, investment, and project engagement
**Target Users:** General public, investors, customers, project backers

#### Features:
- **Project Discovery:**
  - Browse projects by category, lifecycle stage, funding status
  - Search and filter functionality
  - Trending/new/funded carousels

- **Product Marketplace:**
  - Product detail pages with real-time stats
  - Production level voting
  - Investment/pledge interface
  - Medallion purchase and tracking

- **Public Information:**
  - Project timelines and milestones
  - Blockchain verification badges
  - Public ROI calculators
  - Investment explainer content

- **User Actions:**
  - Create accounts (investors/backers)
  - Make pledges/investments
  - Vote on production levels
  - Track portfolio

#### Technical Stack:
- React + Vite (current)
- Supabase backend (read-heavy operations)
- RLS policies: Public read, authenticated write for user-specific data
- PWA-enabled for mobile installation

---

### 2. **Business Portal** (LianaBanyan.biz)
**Domain:** `lianabanyan.biz`
**Purpose:** Operations, member services, administration, and business management
**Target Users:** Project owners, members, contractors, HR, stewards, admins

#### Features:

##### Member Services:
- **Position Management:**
  - Browse available contract positions
  - Submit applications with resume/cover letter
  - Track application status
  - Contract assignment workflow
  - Vesting schedules and EOI tracking

- **Project Administration:**
  - Create/edit projects
  - Manage products and production levels
  - Configure voting and assignment settings
  - Invite team members
  - Manage project lifecycle stages

- **Contract Management:**
  - Position templates and compensation configs
  - Application reviews (HR/Steward workflow)
  - Assignment simulator
  - Contract completions and medallion QR tracking
  - Agent audit logs

- **Member Dashboard:**
  - Active contracts and positions
  - Credits and equity tracking
  - Task assignments
  - Project participation history

##### Administrative Tools:
- **HR Functions:**
  - Review applications
  - Manage position assignments
  - Track contract completions
  - Generate reports

- **Steward Functions:**
  - Lifecycle stage management
  - Process oversight
  - Resource allocation
  - Quality control

- **Owner Functions:**
  - Full project control
  - Financial management
  - Team management
  - Analytics and reporting

- **Platform Admin:**
  - User role management
  - System configuration
  - Audit log review
  - Platform-wide analytics

#### Technical Stack:
- React + Vite (shared codebase, different entry points)
- Supabase backend (write-heavy operations)
- RLS policies: Role-based access (admin, steward, hr, member)
- Authenticated access required for all features
- PWA-enabled for mobile management

---

## Data Access Patterns

### Marketplace Portal (Public-Facing):
```
├── Public READ:
│   ├── Projects (basic info, images, descriptions)
│   ├── Products (details, images, pricing)
│   ├── Production Levels (current votes, goals)
│   ├── Blockchain audit logs
│   └── Project lifecycle stages (current status)
│
└── Authenticated READ/WRITE:
    ├── User pledges
    ├── User votes
    ├── User portfolio
    └── User preferences
```

### Business Portal (Operations):
```
├── Member READ/WRITE:
│   ├── Own applications
│   ├── Own contracts
│   ├── Own assignments
│   └── Own credits/equity
│
├── HR/Steward READ/WRITE:
│   ├── Applications (review/manage)
│   ├── Position assignments
│   ├── Contract templates
│   └── Lifecycle management
│
├── Owner FULL ACCESS:
│   ├── Project configuration
│   ├── Team management
│   ├── Financial settings
│   └── Position creation
│
└── Admin FULL ACCESS:
    ├── All projects
    ├── User roles
    ├── System configs
    └── Audit logs
```

---

## Shared Infrastructure

### Database (Supabase):
- **Single source of truth** for all data
- Separate RLS policies for marketplace vs. business portal access
- Shared tables, different access patterns

### Authentication:
- Unified auth system (same Supabase Auth)
- Role-based permissions stored in `user_roles` table
- Users can access both portals with same credentials

### API/Edge Functions:
- Shared edge functions for common operations
- Portal-specific functions for unique workflows
- Example:
  - `api-submit-vote`: Marketplace
  - `process-vote-safe`: Business portal (admin)

---

## Implementation Strategy

### Phase 1: Preparation (Current)
- [x] Identify business-specific features in current codebase
- [x] Document portal separation architecture
- [ ] Create routing strategy for two portals
- [ ] Define shared component library

### Phase 2: Portal Structure
- [ ] Set up separate routing configurations:
  - `routes/marketplace.tsx`
  - `routes/business.tsx`
- [ ] Create portal entry points:
  - `App.tsx` → Marketplace
  - `BusinessApp.tsx` → Business Portal
- [ ] Configure subdomain detection and routing

### Phase 3: Component Migration
- [ ] Move business-specific components to `src/business/` directory:
  - Position management
  - Application workflows
  - Contract management
  - Admin dashboards
- [ ] Keep marketplace components in `src/pages/` and `src/components/`
- [ ] Extract shared components to `src/shared/`

### Phase 4: Access Control
- [ ] Implement portal-specific route guards
- [ ] Add role-based navigation (business portal)
- [ ] Configure domain-based redirects
- [ ] Test authentication flows

### Phase 5: Mobile Optimization
- [ ] Create separate PWA manifests:
  - `public/manifest-marketplace.json`
  - `public/manifest-business.json`
- [ ] Configure install prompts for each portal
- [ ] Test offline capabilities for both
- [ ] Optimize mobile layouts

### Phase 6: Deployment
- [ ] Set up domain configuration:
  - `lianabanyan.com` → Marketplace
  - `[sku].lianabanyan.com` → Project modules
  - `lianabanyan.biz` → Business Portal
- [ ] Configure DNS and SSL
- [ ] Deploy and test both portals
- [ ] Migration and user communication

---

## Benefits of Separation

### User Experience:
- **Clear purpose** for each portal
- **Focused navigation** (no clutter)
- **Appropriate context** for each user type
- **Faster load times** (less code per portal)

### Security:
- **Reduced attack surface** for public marketplace
- **Isolated admin functions** in business portal
- **Clear RLS boundaries** between portals
- **Role-based access** properly enforced

### Development:
- **Easier maintenance** (separate concerns)
- **Independent deployment** possible
- **Clearer code organization**
- **Better testing** (isolated features)

### Scalability:
- **Load distribution** between portals
- **Targeted optimization** per portal
- **Independent scaling** if needed
- **Cache strategies** tailored to use case

---

## Next Steps

1. **Review and approve** this architecture plan
2. **Create shared component library** for reusable UI
3. **Set up routing infrastructure** for portal detection
4. **Begin component migration** to new structure
5. **Implement role-based navigation** for business portal
6. **Configure PWA** for mobile access to both portals
7. **Test and deploy** portal separation

---

## Questions to Address

- [ ] Should business portal have its own visual theme?
- [ ] What features (if any) need to be accessible from both portals?
- [ ] Should we maintain a unified header/navigation or separate?
- [ ] How do we handle users who are both investors AND contractors?
- [ ] What's the initial rollout strategy (big bang vs. gradual)?

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-14  
**Status:** Planning Phase
