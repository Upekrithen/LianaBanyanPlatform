# KNIGHT SESSION 187 — Pioneer Integration Hooks
## Bishop B050 | Integration Completion Phase
## Wire assign_pioneer() into all 6 role pages

---

## CONTEXT

K184 created the Pioneer Program: `pioneers` table, `pioneer_tiers` table, and `assign_pioneer(p_member_id UUID, p_role TEXT)` PL/pgSQL function with advisory locks for safe concurrent assignment.

**PROBLEM:** `assign_pioneer()` is NEVER CALLED. Zero invocations in the entire codebase. No role page triggers pioneer assignment when a member first acts in a role.

5 tiers: Founders' Circle (#1-10, 50 Marks/mo × 12mo), Trailblazer (#11-100, 25/mo × 6mo), Pathfinder (#101-500, 15/mo × 3mo), Early Adopter (#501-1000, 5 one-time), Standard (#1001+, none).

---

## DELIVERABLE 1: Shared Pioneer Assignment Hook

**NEW FILE:** `src/hooks/usePioneerAssignment.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const TIER_LABELS: Record<string, string> = {
  founders_circle: "Founders' Circle",
  trailblazer: "Trailblazer",
  pathfinder: "Pathfinder",
  early_adopter: "Early Adopter",
  standard: "Standard",
};

const TIER_COLORS: Record<string, string> = {
  founders_circle: "bg-amber-100 text-amber-800 border-amber-300",
  trailblazer: "bg-blue-100 text-blue-800 border-blue-300",
  pathfinder: "bg-green-100 text-green-800 border-green-300",
  early_adopter: "bg-gray-100 text-gray-800 border-gray-300",
  standard: "bg-slate-100 text-slate-700 border-slate-300",
};

export function usePioneerAssignment(role: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if already a pioneer for this role
  const { data: existingPioneer, isLoading } = useQuery({
    queryKey: ["pioneer-status", role, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("pioneers")
        .select("*")
        .eq("member_id", user.id)
        .eq("role", role)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Assign pioneer on first action
  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!user || existingPioneer) return null;
      const { data, error } = await supabase.rpc("assign_pioneer", {
        p_member_id: user.id,
        p_role: role,
      });
      if (error) throw error;
      return data; // Returns the new pioneer record
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["pioneer-status", role] });
        const tierLabel = TIER_LABELS[data.tier] || data.tier;
        toast({
          title: `🏅 Welcome, Pioneer #${data.pioneer_number}!`,
          description: `You're in the ${tierLabel} tier for ${role.replace(/_/g, " ")}.`,
        });
      }
    },
  });

  return {
    pioneerNumber: existingPioneer?.pioneer_number,
    tier: existingPioneer?.tier,
    tierLabel: existingPioneer ? TIER_LABELS[existingPioneer.tier] : null,
    tierColor: existingPioneer ? TIER_COLORS[existingPioneer.tier] : null,
    isNewPioneer: !existingPioneer && !isLoading,
    isLoading,
    assignPioneer: assignMutation.mutateAsync,
    isAssigning: assignMutation.isPending,
  };
}
```

---

## DELIVERABLE 2: Wire Into 6 Role Pages

For each page, add the hook and call `assignPioneer()` after the first successful action:

### 1. BountyPhotographyPage.tsx
- Role: `"bounty_photographer"`
- Trigger: After first successful bounty claim submission
- Add pioneer badge display near page header

### 2. ResourceBoardPage.tsx
- Role: `"pearl_diver"`
- Trigger: After first successful deal tip submission (in the submit mutation's onSuccess)
- Add pioneer badge near the stats banner

### 3. TeacherSetupPage.tsx
- Role: `"home_teacher"`
- Trigger: After first successful teacher profile save
- Add pioneer badge near profile header

### 4. FreezerNodeSetup.tsx
- Role: `"freezer_node"`
- Trigger: After first successful node registration
- Add pioneer badge near setup header

### 5. RideshareRoutes.tsx
- Role: `"rideshare_driver"`
- Trigger: After first successful route posting
- Add pioneer badge near the route form

### 6. Captain Page (find the right page — likely CaptainDashboard, CaptainOnboarding, or similar)
- Role: `"captain"`
- Trigger: After first successful business onboarding
- Add pioneer badge

**Pattern for each page:**

```typescript
const { pioneerNumber, tierLabel, tierColor, assignPioneer, isNewPioneer } = usePioneerAssignment("role_name");

// In the existing mutation's onSuccess callback:
onSuccess: async (data) => {
  // ... existing success logic ...
  if (isNewPioneer) {
    await assignPioneer();
  }
},

// In the JSX, near the page header:
{pioneerNumber && (
  <Badge className={tierColor}>
    Pioneer #{pioneerNumber} — {tierLabel}
  </Badge>
)}
```

---

## DELIVERABLE 3: Pioneer Badge Component (optional reusable)

**NEW FILE:** `src/components/PioneerBadge.tsx`

```typescript
// Small reusable badge that shows pioneer status
// Props: role, className
// Uses usePioneerAssignment internally
// Renders nothing if not a pioneer
// Renders Badge with tier color + "Pioneer #X — Tier" if is a pioneer
// Links to /pioneers/:role/:number on click
```

---

## DELIVERABLE 4: Stats + Deploy

- Update useCanonicalStats: knightSessions=187
- Update canonical.json
- Build: zero errors
- Deploy all 8 targets

---

## CRITICAL RULES

- Single-level attribution ONLY. NEVER 2nd-degree. NOT MLM.
- Entity is Liana Banyan CORPORATION (Wyoming C-Corp). NOT an LLC.
- assign_pioneer() uses advisory locks — safe for concurrent calls. Don't add your own locking.

---

## BUILD + DEPLOY CHECKLIST

```
[ ] usePioneerAssignment.ts hook
[ ] PioneerBadge.tsx component
[ ] BountyPhotographyPage.tsx — wired
[ ] ResourceBoardPage.tsx — wired
[ ] TeacherSetupPage.tsx — wired
[ ] FreezerNodeSetup.tsx — wired
[ ] RideshareRoutes.tsx — wired
[ ] Captain page — wired
[ ] Update canonical stats
[ ] Build: zero errors
[ ] Deploy all 8 targets
```

---

*Knight Session 187 — Bishop (Foreman), B050*
*Pioneer hooks — make the program WORK, not just exist.*
*FOR THE KEEP!*