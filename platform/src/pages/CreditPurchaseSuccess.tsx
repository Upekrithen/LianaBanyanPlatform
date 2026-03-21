import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function CreditPurchaseSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      setVerificationStatus("error");
      return;
    }

    verifyPayment(sessionId);
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-credit-payment", {
        body: { session_id: sessionId },
      });

      if (error) throw error;

      if (data.verified && data.status === "paid") {
        setCredits(data.credits);
        setVerificationStatus("success");
        toast.success(`${data.credits} credits added to your account!`);
      } else {
        setVerificationStatus("error");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("error");
      toast.error("Failed to verify payment");
    }
  };

  return (
    <PortalPageLayout>
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            {verificationStatus === "verifying" && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <CardTitle>Verifying Payment...</CardTitle>
              </>
            )}
            {verificationStatus === "success" && (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <CardTitle>Credits Added!</CardTitle>
              </>
            )}
            {verificationStatus === "error" && (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <CardTitle>Verification Failed</CardTitle>
              </>
            )}
          </div>
          <CardDescription>
            {verificationStatus === "verifying" && "Please wait while we confirm your payment..."}
            {verificationStatus === "success" && `${credits} credits have been added to your account`}
            {verificationStatus === "error" && "We couldn't verify your payment. Please contact support."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate("/dashboard")} 
            className="w-full"
            disabled={verificationStatus === "verifying"}
          >
            {verificationStatus === "verifying" ? "Verifying..." : "Go to Dashboard"}
          </Button>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
