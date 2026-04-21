# Portal Routing Strategy

**Created**: 2025-01-14
**Status**: Implementation Ready

## Overview

This document defines the routing architecture for LianaBanyan's two-portal system, enabling domain-based portal selection and role-based access control.

---

## Portal Entry Points

### Marketplace Portal (lianabanyan.com)
- **Entry File**: `src/main.tsx` → `src/App.tsx`
- **Primary Routes**: Public-facing features
- **Authentication**: Optional (enhanced experience when logged in)

### Business Portal (lianabanyan.biz)
- **Entry File**: `src/main.tsx` → `src/BusinessApp.tsx`
- **Primary Routes**: Operations and member services
- **Authentication**: Required for all routes

---

## Routing Architecture

### 1. Domain Detection Layer
```typescript
// src/utils/portalDetector.ts
export const detectPortal = (): 'marketplace' | 'business' => {
  const hostname = window.location.hostname;

  // Business portal detection
  if (hostname.includes('lianabanyan.biz') ||
      hostname.includes('business.') ||
      hostname === 'localhost:5174') { // Dev environment
    return 'business';
  }

  // Default to marketplace
  return 'marketplace';
};
```

### 2. Main Entry Point
```typescript
// src/main.tsx
import { detectPortal } from './utils/portalDetector';
import MarketplaceApp from './App';
import BusinessApp from './BusinessApp';

const portal = detectPortal();
const AppComponent = portal === 'business' ? BusinessApp : MarketplaceApp;

createRoot(document.getElementById("root")!).render(
  <Web3Provider>
    <AppComponent />
  </Web3Provider>
);
```

### 3. Portal-Specific App Components

#### Marketplace App (`src/App.tsx`)
```typescript
// Existing App.tsx becomes Marketplace portal
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<Index />} />
  <Route path="/auth" element={<Auth />} />
  <Route path="/marketplace" element={<Marketplace />} />
  <Route path="/projects" element={<Projects />} />
  <Route path="/project/:id" element={<ProjectView />} />
  <Route path="/product/:id" element={<ProductDetail />} />

  {/* Protected Backer Routes */}
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
  <Route path="/blockchain-explorer" element={<ProtectedRoute><BlockchainExplorer /></ProtectedRoute>} />

  {/* Redirect business routes to business portal */}
  <Route path="/positions/*" element={<Navigate to="https://lianabanyan.biz/positions" replace />} />
  <Route path="/manage-positions/*" element={<Navigate to="https://lianabanyan.biz/manage-positions" replace />} />
</Routes>
```

#### Business App (`src/BusinessApp.tsx`)
```typescript
// New file: Business portal with auth-required routes
<Routes>
  {/* Auth Route */}
  <Route path="/auth" element={<Auth />} />

  {/* All business routes require authentication */}
  <Route path="/" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />

  {/* Member Routes */}
  <Route path="/positions" element={<ProtectedRoute><ContractPositions /></ProtectedRoute>} />
  <Route path="/applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
  <Route path="/member-resources" element={<ProtectedRoute><MemberResources /></ProtectedRoute>} />

  {/* HR Routes (role-based access) */}
  <Route path="/manage-positions" element={<ProtectedRoute role="hr"><ManagePositions /></ProtectedRoute>} />
  <Route path="/review-applications" element={<ProtectedRoute role="hr"><ApplicationReview /></ProtectedRoute>} />

  {/* Steward Routes */}
  <Route path="/admin-project/:id" element={<ProtectedRoute role="steward"><AdminProject /></ProtectedRoute>} />
  <Route path="/task-list" element={<ProtectedRoute role="steward"><TaskList /></ProtectedRoute>} />

  {/* Admin Routes */}
  <Route path="/subdomain-manager" element={<ProtectedRoute role="admin"><SubdomainManager /></ProtectedRoute>} />
  <Route path="/client-api-manager" element={<ProtectedRoute role="admin"><ClientAPIManager /></ProtectedRoute>} />
</Routes>
```

---

## Shared Component Library

### Directory Structure
```
src/
├── shared/             # Shared across both portals
│   ├── components/     # Reusable UI components
│   │   ├── ui/        # shadcn components
│   │   ├── layouts/   # Shared layouts
│   │   └── common/    # Common features
│   ├── contexts/      # Shared contexts (Auth, Web3)
│   ├── hooks/         # Shared hooks
│   ├── lib/           # Utilities
│   └── integrations/  # Supabase client
├── marketplace/       # Marketplace-specific
│   ├── components/
│   ├── pages/
│   └── routes/
├── business/          # Business-specific
│   ├── components/
│   ├── pages/
│   └── routes/
├── App.tsx           # Marketplace entry
├── BusinessApp.tsx   # Business entry
└── main.tsx          # Portal detector & loader
```

### Shared Components
- **Authentication**: `AuthContext`, `AuthProvider`, `ProtectedRoute`
- **Web3**: `Web3Provider`, `WalletConnectButton`
- **UI Components**: All shadcn components from `components/ui/`
- **Common Features**:
  - `BlockchainVerificationBadge`
  - `MedallionBadge`
  - `MedallionUserCard`
  - `SyncStatusIndicator`
  - Navigation components

### Marketplace-Only Components
- `Marketplace`
- `Projects`
- `ProductDetail`
- `Portfolio`
- `ROICalculator`
- `InvestmentTimeline`
- `VotingDialog`
- `CircularCategories`

### Business-Only Components
- `ContractPositions`
- `ManagePositions`
- `ApplicationReviewManager`
- `PositionApplicationDialog`
- `PositionAssignmentDialog`
- `PositionActivationManager`
- `ContractAssignmentSimulator`
- `AgentAuditLog`

---

## Role-Based Access Control

### Enhanced ProtectedRoute Component
```typescript
// src/shared/components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'member' | 'hr' | 'steward' | 'owner' | 'admin';
}

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const userRole = useUserRole(user?.id); // Query user role from DB

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;

  // Role-based access check
  if (role && !hasRequiredRole(userRole, role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### Role Hierarchy
```
Admin > Owner > Steward > HR > Member
```
- **Admin**: Full platform access (all features)
- **Owner**: Full project ownership and control
- **Steward**: Project lifecycle and process management
- **HR**: Position and application management
- **Member**: Own applications and contracts only

---

## Cross-Portal Navigation

### Shared Header Component
```typescript
// src/shared/components/layouts/Header.tsx
export const Header = () => {
  const portal = detectPortal();

  return (
    <header>
      {/* Portal Switcher */}
      <nav>
        <a href="https://lianabanyan.com"
           className={portal === 'marketplace' ? 'active' : ''}>
          Marketplace
        </a>
        <a href="https://lianabanyan.biz"
           className={portal === 'business' ? 'active' : ''}>
          Business Portal
        </a>
      </nav>

      {/* Portal-specific navigation */}
      {portal === 'marketplace' ? <MarketplaceNav /> : <BusinessNav />}
    </header>
  );
};
```

---

## Development Environment

### Local Development URLs
- **Marketplace**: `http://localhost:5173` (default Vite port)
- **Business**: `http://localhost:5174` (add `--port 5174` flag)

### Environment Detection
```typescript
export const getPortalBaseUrl = (): string => {
  if (import.meta.env.DEV) {
    return detectPortal() === 'business'
      ? 'http://localhost:5174'
      : 'http://localhost:5173';
  }

  return detectPortal() === 'business'
    ? 'https://lianabanyan.biz'
    : 'https://lianabanyan.com';
};
```

---

## Migration Strategy

### Phase 1: Preparation ✅
- [x] Create routing strategy document
- [x] Define shared component structure

### Phase 2: Structure Setup (Next)
1. Create `src/shared/` directory and move common components
2. Create `src/marketplace/` and `src/business/` directories
3. Create `src/BusinessApp.tsx` as copy of `App.tsx`
4. Create portal detection utility

### Phase 3: Component Migration
1. Move marketplace components to `src/marketplace/`
2. Move business components to `src/business/`
3. Update import paths across codebase
4. Test both portals independently

### Phase 4: Route Implementation
1. Implement marketplace routes in `App.tsx`
2. Implement business routes in `BusinessApp.tsx`
3. Add cross-portal redirects
4. Test navigation flows

### Phase 5: Deployment
1. Configure DNS for both domains
2. Deploy marketplace to lianabanyan.com
3. Deploy business portal to lianabanyan.biz
4. Test SSO across portals
5. Monitor and iterate

---

## Testing Checklist

### Marketplace Portal
- [ ] Public pages accessible without auth
- [ ] Auth flows work correctly
- [ ] Portfolio and dashboard require login
- [ ] Business route redirects work
- [ ] PWA installation works

### Business Portal
- [ ] All routes require authentication
- [ ] Role-based access enforced
- [ ] Navigation appropriate for user role
- [ ] Cross-portal links work
- [ ] Data persistence across portals

### Cross-Portal
- [ ] Single sign-on works
- [ ] User roles consistent
- [ ] Navigation between portals seamless
- [ ] Session maintained across domains
- [ ] Logout works from both portals

---

## Next Steps

1. **Immediate**: Create portal detector utility
2. **Next**: Set up shared component directory structure
3. **Then**: Create BusinessApp.tsx and implement routing
4. **After**: Migrate components to portal-specific directories
5. **Finally**: Test and deploy both portals

Ready for Phase 2 implementation! 🚀
