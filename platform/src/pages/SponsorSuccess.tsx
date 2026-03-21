/**
 * SPONSOR SUCCESS PAGE
 * =====================
 * Shown after Stripe checkout for sponsoring memberships.
 * Records the sponsorship and creates pending recipient slots.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, TreePine } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function SponsorSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [count, setCount] = useState(0);

  const sessionId = searchParams.get("session_id");
  const memberships = searchParams.get("count");

  useEffect(() => {
    if (sessionId && memberships && user) {
      setCount(Number(memberships));
      recordSponsorship();
    } else if (!user) {
      // Wait for auth
    } else {
      setStatus("error");
      setErrorMsg("Missing session information");
    }
  }, [sessionId, memberships, user]);

  const recordSponsorship = async () => {
    try {
      const membershipCount = Number(memberships);
      const amount = membershipCount * 5;

      // Upsert sponsor profile
      const { data: profile, error: profileError } = await supabase
        .from("sponsor_profiles")
        .upsert({
          user_id: user!.id,
          display_name: user!.user_metadata?.full_name || user!.email?.split("@")[0] || "Sponsor",
          total_contributed: amount,
          total_members_sponsored: membershipCount,
          participation_level: amount >= 500 ? "Grove" : amount >= 100 ? "Sapling" : "Seedling",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create commitment record
      const { data: commitment, error: commitError } = await supabase
        .from("sponsor_commitments")
        .insert({
          sponsor_id: profile.id,
          commitment_type: "one_time",
          amount_per_period: amount,
          memberships_per_period: membershipCount,
          stripe_session_id: sessionId,
          status: "active",
        })
        .select()
        .single();

      if (commitError) throw commitError;

      // Create pending recipient slots
      const recipientSlots = Array.from({ length: membershipCount }, () => ({
        sponsor_commitment_id: commitment.id,
        status: "pending",
      }));

      await supabase.from("sponsored_recipients").insert(recipientSlots);

      setStatus("success");
    } catch (err) {
      console.error("Sponsor verification error:", err);
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to record sponsorship");
    }
  };

  return (
    <PortalPageLayout>
      <Card className="max-w-md w-full mx-4">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          {status === "verifying" && (
            <>
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-green-500" />
              <h2 className="text-2xl font-bold">Processing Sponsorship...</h2>
              <p className="text-muted-foreground">Creating {memberships} membership slots.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h2 className="text-2xl font-bold text-green-600">Seeds Planted!</h2>
              <p className="text-muted-foreground">
                You just sponsored <strong>{count} membership{count > 1 ? "s" : ""}</strong>.
                That's {count} {count > 1 ? "people" : "person"} who {count > 1 ? "get" : "gets"} a
                real shot at building something.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button onClick={() => navigate("/sponsor")} className="gap-2">
                  <TreePine className="w-4 h-4" />
                  Sponsor Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  My Dashboard
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 mx-auto text-red-500" />
              <h2 className="text-2xl font-bold text-red-600">Something Went Wrong</h2>
              <p className="text-muted-foreground">{errorMsg}</p>
              <p className="text-sm text-muted-foreground">
                Don't worry — if payment was charged, your sponsorship will be recorded.
                Contact support if this persists.
              </p>
              <Button onClick={() => navigate("/sponsor")} className="mt-4">
                Back to Sponsor Portal
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
