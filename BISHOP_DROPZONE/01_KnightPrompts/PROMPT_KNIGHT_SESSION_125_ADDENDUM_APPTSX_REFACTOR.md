# K125 ADDENDUM — App.tsx Refactoring into Manageable Chunks

## Context
App.tsx has grown large as Knight sessions K107-K121 added routes, providers, and layout components. It needs to be broken into smaller, manageable pieces. Add this as **Deliverable 5** to K125.

---

## Deliverable 5: App.tsx Route Splitting + Code Organization

### The Problem
App.tsx contains ALL route definitions, provider wrappers, and layout logic in a single file. As the platform has grown to 9 portals with 50+ routes, this file has become unwieldy and hard to maintain.

### The Fix — Split into Route Modules

Create route files by domain:

```
src/
├── App.tsx                          ← Slim: just providers + <RouterProvider>
├── routes/
│   ├── index.ts                     ← Re-exports all route configs
│   ├── publicRoutes.tsx             ← Landing, About, Terms, Privacy
│   ├── authRoutes.tsx               ← Login, Register, Forgot Password
│   ├── marketplaceRoutes.tsx        ← .com portal routes
│   ├── businessRoutes.tsx           ← .biz portal routes (Captain, Business Onboarding)
│   ├── charitableRoutes.tsx         ← .org portal routes
│   ├── networkRoutes.tsx            ← .net portal routes
│   ├── factoryRoutes.tsx            ← the2ndsecond.com routes
│   ├── hexisleRoutes.tsx            ← hexisle.com routes
│   ├── dssRoutes.tsx                ← dss.lianabanyan.com routes
│   ├── dashboardRoutes.tsx          ← All /dashboard/* routes (membership, earnings, etc.)
│   ├── adminRoutes.tsx              ← Admin/internal routes
│   └── toolRoutes.tsx               ← /tools/* routes (cue card generator, etc.)
```

### Each Route File Pattern

```tsx
// src/routes/marketplaceRoutes.tsx
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const Marketplace = lazy(() => import('@/pages/Marketplace'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
// ... etc

export const marketplaceRoutes: RouteObject[] = [
  { path: '/marketplace', element: <Marketplace /> },
  { path: '/product/:id', element: <ProductDetail /> },
  // ... etc
];
```

### Slim App.tsx

```tsx
// src/App.tsx — AFTER refactoring
import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CreditBalanceHeader } from '@/components/CreditBalanceHeader';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { publicRoutes } from '@/routes/publicRoutes';
import { authRoutes } from '@/routes/authRoutes';
import { marketplaceRoutes } from '@/routes/marketplaceRoutes';
import { businessRoutes } from '@/routes/businessRoutes';
import { dashboardRoutes } from '@/routes/dashboardRoutes';
// ... etc

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      ...publicRoutes,
      ...authRoutes,
      ...marketplaceRoutes,
      ...businessRoutes,
      ...dashboardRoutes,
      // ... etc
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <RouterProvider router={router} />
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Benefits
1. Each route file is small and focused (~20-50 lines)
2. Lazy loading via `React.lazy()` improves initial bundle size
3. Easy to find routes by domain/portal
4. New routes added to the appropriate file, not a monolith
5. Providers stay in App.tsx but routes move out

### Quality Checks
- [ ] App.tsx is under 50 lines after refactoring
- [ ] All existing routes still work (no broken links)
- [ ] Lazy loading works (check network tab for chunk loading)
- [ ] Build succeeds with zero errors
- [ ] Each route file handles its own lazy imports

---

FOR THE KEEP.
