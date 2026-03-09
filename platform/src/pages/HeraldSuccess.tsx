/**
 * HERALD SUCCESS PAGE
 * ====================
 * Shown after Stripe checkout for Herald subscription.
 * Verifies the payment and activates the subscription.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Megaphone } from "lucide-react";
import { verifyHeraldPayment, type HeraldTier } from "@/lib/heraldSystem";

export default function HeraldSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  const sessionId = searchParams.get("session_id");
  const tier = searchParams.get("tier") as HeraldTier;

  useEffect(() => {
    if (sessionId && tier) {
      verify();
    } else {
      setStatus("error");
      setErrorMsg("Missing session or tier information");
    }
  }, [sessionId, tier]);

  const verify = async () => {
    const result = await verifyHeraldPayment(sessionId!, tier);
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(result.error || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          {status === "verifying" && (
            <>
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
              <h2 className="text-2xl font-bold">Verifying Payment...</h2>
              <p className="text-muted-foreground">Activating your Herald subscription.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h2 className="text-2xl font-bold text-green-600">Subscription Active!</h2>
              <p className="text-muted-foreground">
                Your Herald subscription is now active. Don't break the chain!
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button onClick={() => navigate("/herald")} className="gap-2">
                  <Megaphone className="w-4 h-4" />
                  Go to Herald Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/hofund")}>
                  Open Hofund Studio
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 mx-auto text-red-500" />
              <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
              <p className="text-muted-foreground">{errorMsg}</p>
              <Button onClick={() => navigate("/herald")} className="mt-4">
                Back to Herald
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
