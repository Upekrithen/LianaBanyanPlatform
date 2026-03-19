import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, XCircle, Package } from "lucide-react";
import { toast } from "sonner";

export default function PreOrderSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      return;
    }
    verifyPayment(sessionId);
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-preorder-payment", {
        body: { session_id: sessionId },
      });

      if (error) throw error;

      if (data.verified && data.status === "paid") {
        setTotalAmount(data.total_amount);
        setStatus("success");
        toast.success("Pre-order confirmed! Welcome to the Founding Run, Pioneer.");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background" data-xray-id="preorder-success">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {status === "verifying" && <Loader2 className="w-12 h-12 mx-auto animate-spin text-muted-foreground" />}
          {status === "success" && <CheckCircle className="w-12 h-12 mx-auto text-green-500" />}
          {status === "error" && <XCircle className="w-12 h-12 mx-auto text-red-500" />}
          <CardTitle className="mt-4">
            {status === "verifying" && "Verifying your payment..."}
            {status === "success" && "Pledge Confirmed!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "success" && (
            <>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <Package className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold">${totalAmount}</p>
                <p className="text-sm text-muted-foreground">Founding Run pledge confirmed</p>
              </div>
              <p className="text-sm text-muted-foreground">
                You're officially a Pioneer. Follow the Build Journal for production updates.
                Estimated delivery: 8–12 weeks from funding threshold.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate("/hexisle/founding-run")}>
                  View Founding Run
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
              </div>
            </>
          )}
          {status === "error" && (
            <>
              <p className="text-sm text-muted-foreground">
                We couldn't verify your payment. If you were charged, please contact support — your pledge is safe.
              </p>
              <Button onClick={() => navigate("/hexisle/founding-run")}>
                Back to Founding Run
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
