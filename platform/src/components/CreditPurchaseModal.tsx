import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CreditCard, Sparkles, TrendingUp, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trackCreditPurchase } from "@/lib/analytics";

interface CreditPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete?: () => void;
}

const CREDIT_PACKAGES = [
  {
    id: "small",
    credits: 10,
    price: "$10",
    priceValue: 10,
    description: "Perfect for membership stake",
    popular: false
  },
  {
    id: "medium",
    credits: 50,
    price: "$50",
    priceValue: 50,
    description: "Great for guild progression",
    popular: true
  },
  {
    id: "large",
    credits: 100,
    price: "$100",
    priceValue: 100,
    description: "Best value for projects",
    popular: false
  },
];

export const CreditPurchaseModal = ({ open, onOpenChange, onPurchaseComplete }: CreditPurchaseModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [bonusInfo, setBonusInfo] = useState<any>(null);
  const [isLoadingBonus, setIsLoadingBonus] = useState(true);

  useEffect(() => {
    if (open) {
      loadBonusInfo();
    }
  }, [open]);

  const loadBonusInfo = async () => {
    setIsLoadingBonus(true);
    try {
      const { data, error } = await supabase.rpc('calculate_user_bonus_percentage', {
        _user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;
      setBonusInfo(data);
    } catch (error) {
      console.error('Error loading bonus info:', error);
      // Set fallback so UI doesn't get stuck in loading state
      setBonusInfo(null);
    } finally {
      setIsLoadingBonus(false);
    }
  };

  const calculateBonusCredits = (baseCredits: number) => {
    if (!bonusInfo || !bonusInfo.can_purchase) return baseCredits;
    return Math.floor(baseCredits * (1 + bonusInfo.bonus_percentage / 100));
  };

  const handlePurchase = async (packageSize: string) => {
    setIsProcessing(true);
    setSelectedPackage(packageSize);

    try {
      const { data, error } = await supabase.functions.invoke("create-credit-checkout", {
        body: { package_size: packageSize },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.url) {
        const pkg = CREDIT_PACKAGES.find((p) => p.id === packageSize);
        trackCreditPurchase(pkg?.credits || 0, pkg?.priceValue || 0);
        window.open(data.url, "_blank");
        toast.info("Complete payment in the new tab to receive your credits");
        onOpenChange(false);
        if (onPurchaseComplete) {
          setTimeout(onPurchaseComplete, 2000);
        }
      }
    } catch (error) {
      console.error("Credit purchase error:", error);
      toast.error("Failed to create checkout session");
    } finally {
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Purchase LB Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package. Credits are used for membership stakes, guild progression, and more.
          </DialogDescription>
        </DialogHeader>

        {bonusInfo && !bonusInfo.can_purchase && (
          <Alert className="mb-4">
            <AlertDescription>{bonusInfo.message}</AlertDescription>
          </Alert>
        )}

        {bonusInfo && bonusInfo.can_purchase && bonusInfo.bonus_percentage > 0 && (
          <Alert className="mb-4 bg-primary/10 border-primary">
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <div className="font-semibold">Active Bonus: {bonusInfo.bonus_percentage}%</div>
              <div className="text-xs mt-1 space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Base bonus: {bonusInfo.base_bonus}% (Purchase #{bonusInfo.purchase_count + 1})
                </div>
                {bonusInfo.reputation_bonus > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-3 w-3" />
                    Reputation bonus: +{bonusInfo.reputation_bonus}% (Score: {bonusInfo.reputation_score.toFixed(1)})
                  </div>
                )}
                {bonusInfo.guild_bonus > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Guild member bonus: +{bonusInfo.guild_bonus}%
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {CREDIT_PACKAGES.map((pkg) => {
            const totalCredits = calculateBonusCredits(pkg.credits);
            const bonusCredits = totalCredits - pkg.credits;

            return (
              <Card
                key={pkg.id}
                className={`relative ${pkg.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Best Value
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {totalCredits} Credits
                    {bonusCredits > 0 && (
                      <span className="text-sm text-primary ml-2">+{bonusCredits} bonus</span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xl font-bold text-foreground">
                    {pkg.price}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {pkg.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    ${(pkg.priceValue / totalCredits).toFixed(2)} per credit
                  </div>
                  <Button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isProcessing || isLoadingBonus || (bonusInfo && !bonusInfo.can_purchase)}
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                  >
                    {isProcessing && selectedPackage === pkg.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Purchase"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Secure payment via Stripe • Credits never expire • International currencies supported
        </p>
      </DialogContent>
    </Dialog>
  );
};
