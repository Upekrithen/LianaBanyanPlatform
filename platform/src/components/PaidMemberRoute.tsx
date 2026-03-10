/**
 * PAID MEMBER ROUTE — Gate behind actual payment
 * ================================================
 * Like ProtectedRoute, but stricter: requires not just authentication
 * but proof of payment (active membership or first_transaction_at).
 *
 * Use for: Withdraw/Bank pages, financial dashboards, anything that
 * only makes sense AFTER someone has paid for membership.
 *
 * Unauthenticated → seamless onboard dialog
 * Authenticated but unpaid → "Activate your membership" prompt
 * Authenticated + paid → renders children
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CreditCard } from "lucide-react";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";

export function PaidMemberRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { openOnboard } = useSeamlessOnboard();

  // Check membership status from profiles table
  const { data: membershipStatus, isLoading: profileLoading } = useQuery({
    queryKey: ["membership-status", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("membership_status")
        .eq("id", user.id)
        .single();
      return data?.membership_status || "inactive";
    },
    enabled: !!user,
  });

  // Loading state
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  // Not logged in → show onboard prompt (not a redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-2 text-muted-foreground/30" />
            <CardTitle>Membership Required</CardTitle>
            <CardDescription>
              This page is available to paid members. Join for $5/year to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => openOnboard({
                reason: "access your account",
                actionLabel: "Join",
                membershipIncluded: true,
              })}
              className="gap-2"
            >
              <CreditCard className="w-4 h-4" /> Join for $5/year
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in but membership not active → activate prompt
  if (membershipStatus !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-amber-500/50" />
            <CardTitle>Activate Your Membership</CardTitle>
            <CardDescription>
              Your account is set up, but your membership isn't active yet.
              Activate for $5/year to access your financial dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => openOnboard({
                reason: "activate your membership",
                actionLabel: "Activate",
                membershipIncluded: true,
              })}
              className="gap-2"
            >
              <CreditCard className="w-4 h-4" /> Activate for $5/year
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Paid member → render the page
  return <>{children}</>;
}
