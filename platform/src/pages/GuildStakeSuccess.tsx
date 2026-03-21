import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function GuildStakeSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-guild-stake-payment", {
          body: { session_id: sessionId },
        });

        if (error) throw error;

        if (data.verified) {
          setSuccess(true);
          setPaymentInfo(data);
          toast.success("Guild stake payment successful!");
        } else {
          toast.error("Payment verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast.error("Failed to verify payment");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (verifying) {
    return (
      <PortalPageLayout>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying Guild Stake Payment...
            </CardTitle>
            <CardDescription>
              Please wait while we confirm your stake payment and update your progression
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-20">
      <Card className={success ? "border-green-500/50 bg-green-500/5" : "border-destructive/50 bg-destructive/5"}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {success ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
            <CardTitle className="text-2xl">
              {success ? "Guild Progression Unlocked!" : "Payment Verification Failed"}
            </CardTitle>
          </div>
          <CardDescription>
            {success
              ? "Your stake has been confirmed and progression updated"
              : "We couldn't verify your payment"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {success && paymentInfo ? (
            <>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <p className="font-semibold">New Progression Status</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tier</p>
                    <p className="font-semibold capitalize">{paymentInfo.tier}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Class</p>
                    <p className="font-semibold">Class {paymentInfo.class_level}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stake Paid</p>
                    <p className="font-semibold">${paymentInfo.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Stake</p>
                    <p className="font-semibold">${paymentInfo.cumulative.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Benefits Unlocked:</p>
                <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Higher margin percentage on all contracts</li>
                  <li>Access to {paymentInfo.tier === "journeyman" ? "individual bonuses (+5%)" : "enhanced bonuses (+10%)"}</li>
                  <li>Shared pool bonus participation</li>
                  <li>Voting rights in Guild Sponsorship Fund</li>
                  {paymentInfo.tier === "master" && (
                    <li>Project participation eligibility (10,000+ credits)</li>
                  )}
                </ul>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button onClick={() => navigate("/dashboard")} className="w-full" size="lg">
                  View Dashboard
                </Button>
                <Button 
                  onClick={() => navigate("/guilds")} 
                  variant="outline" 
                  className="w-full"
                >
                  Explore Guilds
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                If you completed the payment but see this message, please contact support with your session ID.
              </p>
              {sessionId && (
                <p className="text-xs font-mono bg-muted p-2 rounded">
                  Session: {sessionId}
                </p>
              )}
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Return to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
