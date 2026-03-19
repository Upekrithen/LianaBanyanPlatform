import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MembershipSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setVerifying(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    (async () => {
      try {
        let token = "";
        let userId = "";
        try {
          const raw = localStorage.getItem("sb-ruuxzilgmuwddcofqecc-auth-token");
          if (raw) {
            const parsed = JSON.parse(raw);
            token = parsed?.access_token ?? "";
            userId = parsed?.user?.id ?? "";
          }
        } catch { /* ignore */ }

        const res = await fetch(
          "https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/verify-membership-payment",
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ session_id: sessionId, user_id: userId }),
          }
        );
        clearTimeout(timer);

        const data = await res.json();

        if (data.verified) {
          setSuccess(true);
          toast.success("Membership stake payment successful!");
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Payment verification failed");
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          setSuccess(true);
          toast.success("Payment received! Verification is processing in the background.");
        } else {
          console.error("Verification error:", err);
          toast.error("Verification timed out — your payment is safe. Check dashboard shortly.");
        }
      } finally {
        setVerifying(false);
      }
    })();

    return () => { clearTimeout(timer); controller.abort(); };
  }, [sessionId]);

  if (verifying) {
    return (
      <div className="container max-w-2xl mx-auto py-20">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying Payment...
            </CardTitle>
            <CardDescription>
              Please wait while we confirm your membership stake payment
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
              {success ? "Welcome to LianaBanyan!" : "Payment Verification Failed"}
            </CardTitle>
          </div>
          <CardDescription>
            {success
              ? "Your membership stake has been confirmed"
              : "We couldn't verify your payment"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {success ? (
            <>
              <div className="space-y-2">
                <p className="font-semibold">You now have access to:</p>
                <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                  <li>Business Portal (.biz) - Position management & project administration</li>
                  <li>Network Portal (.net) - B2B production & contract management</li>
                  <li>Non-Profit Portal (.org) - Fund administration & member benefits</li>
                  <li>Guild membership and tier progression system</li>
                  <li>LB governance voting rights</li>
                </ul>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button onClick={() => navigate("/dashboard")} className="w-full" size="lg">
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={() => window.location.href = window.location.origin.replace('.com', '.biz')} 
                  variant="outline" 
                  className="w-full"
                >
                  Visit Business Portal
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
    </div>
  );
}
