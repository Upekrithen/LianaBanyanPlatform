# Four-Portal Architecture

## Overview

LianaBanyan operates as a **four-portal ecosystem**, each serving distinct user groups and business functions:

| Portal | Domain | Dev Port | Purpose | Primary Users |
|--------|--------|----------|---------|---------------|
| **Marketplace** | lianabanyan.com | 5173 | Public discovery & investment | General public, investors, customers |
| **Business** | lianabanyan.biz | 5174 | HR & project operations | Project owners, members, HR, stewards |
| **Non-Profit** | lianabanyan.org | 5175 | Financial services & benefits | All LianaBanyan members |
| **Business Network** | lianabanyan.net | 5176 | B2B production & contracts | Member businesses, partners |

---

## Portal Details

### 1. Marketplace Portal (.com)
**Public-facing investment and discovery platform**

**Features:**
- Project browsing & search
- Product marketplace
- Voting & pledging
- Portfolio tracking
- Investment explainer
- Public blockchain verification

**User Actions:**
- Create accounts
- Browse projects/products
- Make pledges & votes
- Track investments
- View medallion status

**Tech Stack:**
- React + Vite
- Supabase (read-heavy)
- PWA-enabled
- Public RLS policies

---

### 2. Business Portal (.biz)
**Internal operations & member management**

**Features:**
- Position management (create, activate, assign)
- Application workflows (review, approve, reject)
- Contract assignment & compensation configuration
- HR dashboard & steward tools
- Task lists & project administration
- Member onboarding

**User Roles:**
- Project Owners
- Stewards
- HR personnel
- Members
- Applicants

**Tech Stack:**
- React + Vite
- Supabase (write-heavy)
- Role-based access control
- Protected routes (authentication required)

---

### 3. Non-Profit Portal (.org)
**Financial services & member benefits administration**

**Features:**
- **LB Funding Pool Management**
  - Track 1/3 medallion contributions
  - Monitor EOI vesting allocations
  - Gas fee budget tracking
- **Loan Administration**
  - Zero-interest loans (based on historical earnings)
  - Equipment & supply loan tracking
  - Approval workflows
- **Member Benefits**
  - MSA medical savings plans
  - Benefit eligibility calculators
  - Member perks dashboard
- **Gas Fee Fronting**
  - Blockchain transaction cost tracking
  - Pool allocation for minting/operations

**User Access:**
- All LianaBanyan members (authenticated)
- Non-profit administrators
- Financial stewards

**Tech Stack:**
- React + Vite
- Supabase (financial data with strict RLS)
- Audit logging for all transactions
- Member-only access

---

### 4. Business Network Portal (.net)
**B2B execution layer & production coordination**

**Features:**
- **Production Schedules & Manifests**
  - Multi-business coordination
  - Supply chain tracking
  - Delivery timelines
- **B2B Contracts**
  - Inter-business agreements
  - Contract templates & execution
  - Performance tracking
- **Industry Pricing Sync**
  - Aggregate pricing data
  - Volume discount calculations
  - Market trend analysis
- **XML Lockbox API** 🔐
  - Secure project data exposure
  - Client API key management
  - Custom domain/subdomain routing
  - Read-only project snapshots

**User Access:**
- Member businesses
- Production partners
- API clients (via credentials)

**Tech Stack:**
- React + Vite
- Supabase (B2B data + API auth)
- Edge functions for XML generation
- Secure credential management

---

## Cross-Portal Navigation

Each portal includes navigation to other portals based on user authentication:

```typescript
// Example portal switcher
<PortalNav>
  <PortalLink to="marketplace">Browse Projects</PortalLink>
  {isAuthenticated && (
    <>
      <PortalLink to="business">My Positions</PortalLink>
      <PortalLink to="nonprofit">Member Benefits</PortalLink>
      <PortalLink to="network">B2B Dashboard</PortalLink>
    </>
  )}
</PortalNav>
```

---

## Data Access Patterns

| Portal | Read Access | Write Access | Auth Required |
|--------|-------------|--------------|---------------|
| **.com** | Public projects/products | User pledges/votes | Optional (for voting) |
| **.biz** | Role-based (HR/Steward/Owner) | Role-based | Yes |
| **.org** | Member-only | Admin/Steward-only | Yes |
| **.net** | API key or member auth | Business partners only | Yes |

---

## Routing Implementation

### Portal Detection
```typescript
// src/utils/portalDetector.ts
export const detectPortal = (): PortalType => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  if (hostname.includes('lianabanyan.org') || port === '5175') return 'nonprofit';
  if (hostname.includes('lianabanyan.net') || port === '5176') return 'network';
  if (hostname.includes('lianabanyan.biz') || port === '5174') return 'business';
  return 'marketplace'; // .com default
};
```

### App Loading
```typescript
// src/main.tsx
const portal = detectPortal();
const AppComponent = {
  marketplace: MarketplaceApp,
  business: BusinessApp,
  nonprofit: NonProfitApp,
  network: NetworkApp
}[portal];
```

---

## Security Model

### Marketplace (.com)
- Public data access
- Anonymous browsing allowed
- Authentication for voting/pledging
- Rate limiting on public APIs

### Business (.biz)
- Strict role-based access
- All routes protected
- Audit logging on sensitive operations
- No anonymous access

### Non-Profit (.org)
- Member-only access
- Financial data encrypted
- Strict RLS policies on loans/benefits
- Admin approval for high-value operations

### Business Network (.net)
- API key authentication for XML lockbox
- IP whitelisting for production partners
- Rate limiting per client
- Audit trail for all API access

---

## Deployment Strategy

Each portal deploys independently but shares:
- Single Supabase instance
- Shared authentication system
- Common database schema
- Unified edge functions

**Benefits:**
- Independent scaling per portal
- Isolated deployments (no cross-portal downtime)
- Optimized caching strategies per audience
- Clear separation of concerns

---

## Next Steps

1. **Immediate:**
   - [ ] Create `NonProfitApp.tsx` with .org routes
   - [ ] Create `NetworkApp.tsx` with .net routes + XML lockbox
   - [ ] Update `main.tsx` to load all 4 portals

2. **Phase 3:**
   - [ ] Build non-profit dashboard components
   - [ ] Build B2B production schedule components
   - [ ] Implement XML lockbox edge function routing

3. **Testing:**
   - [ ] Test cross-portal navigation
   - [ ] Verify authentication across domains
   - [ ] Validate RLS policies per portal
