import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Lock, CheckCircle, RefreshCw } from "lucide-react";

interface MembershipStakePaymentProps {
  hasPaid: boolean;
  onPaymentSuccess?: () => void;
}

const SUPABASE_URL = "https://ruuxzilgmuwddcofqecc.supabase.co";

export const MembershipStakePayment = ({ hasPaid, onPaymentSuccess }: MembershipStakePaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);
  const { t } = useTranslation();

  const handlePayment = () => {
    setIsProcessing(true);

    // Read token directly from localStorage — zero network calls
    let token: string | null = null;
    try {
      const raw = localStorage.getItem("sb-ruuxzilgmuwddcofqecc-auth-token");
      if (raw) {
        const parsed = JSON.parse(raw);
        token = parsed?.access_token ?? null;
      }
    } catch {
      // parse failed
    }

    if (!token) {
      toast.error("Session expired — please log in again.");
      setIsProcessing(false);
      return;
    }

    // BP065 PART 0: pass autoRenew to the edge fn (POST body)
    const target = `${SUPABASE_URL}/functions/v1/create-membership-checkout`;
    fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ autoRenew }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error(data.error || "Could not start checkout");
          setIsProcessing(false);
        }
      })
      .catch(() => {
        toast.error("Checkout request failed — please try again.");
        setIsProcessing(false);
      });
  };

  if (hasPaid) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">{t('membershipPayment.active')}</CardTitle>
          </div>
          <CardDescription>
            {t('membershipPayment.fullAccess')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{t('membershipPayment.inactive')}</CardTitle>
        </div>
        <CardDescription>
          {t('membershipPayment.oneTimeFee')} $5 {t('membershipPayment.unlockAccess')} Business, Network, {t('common.create')} Non-Profit portals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <p className="font-semibold">{t('membership.title')}:</p>
          <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
            <li>{t('membershipPayment.businessPortal')}</li>
            <li>{t('membershipPayment.networkPortal')}</li>
            <li>{t('membershipPayment.nonprofitPortal')}</li>
          </ul>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('membershipPayment.processing')}
            </>
          ) : (
            <>
              {t('membershipPayment.payNow')} $5
            </>
          )}
        </Button>

        {/* BP065 PART 0: Auto-renew opt-in checkbox (default unchecked — no dark-pattern pre-check) */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoRenew}
            onChange={(e) => setAutoRenew(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Auto-renew annually at $5/year — cancel anytime
          </span>
        </label>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Your pledge will be charged today and held by our independent payment processor until it is released to this project under our program terms. While your pledge is held, funds are not available for us to spend and may be returned or adjusted if the transaction cannot be completed. By confirming, you authorize this charge and acknowledge that the payment processor, not our company, holds the funds during this period.
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Secure payment via Stripe • Non-refundable • One-time payment
        </p>
      </CardContent>
    </Card>
  );
};
