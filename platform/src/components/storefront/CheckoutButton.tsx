import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCreditWallet } from "@/hooks/useCreditWallet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ShoppingCart,
  CreditCard,
  Coins,
  Loader2,
  Check,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

type CheckoutButtonProps = {
  storefrontId: string;
  productId: string;
  productName: string;
  price: number;
  costBasis?: number | null;
  isService?: boolean;
  disabled?: boolean;
  onOrderComplete?: (orderId: string) => void;
};

export function CheckoutButton({
  storefrontId,
  productId,
  productName,
  price,
  costBasis,
  isService = false,
  disabled = false,
  onOrderComplete,
}: CheckoutButtonProps) {
  const { user } = useAuth();
  const { data: wallet } = useCreditWallet();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const totalPrice = price * quantity;
  const upfrontAmount = isService ? totalPrice * 0.5 : totalPrice;
  const escrowAmount = isService ? totalPrice - upfrontAmount : 0;
  const creatorKeeps = totalPrice * 0.833;
  const hasEnoughCredits = (wallet?.balance ?? 0) >= upfrontAmount;

  const handleCheckout = async (method: "credits" | "stripe") => {
    if (!user) {
      toast.error("Please sign in to place an order");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "storefront-checkout",
        {
          body: {
            storefront_id: storefrontId,
            product_id: productId,
            quantity,
            payment_method: method,
            is_service: isService,
          },
        }
      );

      if (error) throw new Error(error.message);

      if (method === "stripe" && data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      if (data?.success) {
        toast.success(`Order placed! "${productName}" confirmed.`);
        setOpen(false);
        onOrderComplete?.(data.order_id);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Checkout failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        className="w-full gap-2"
        disabled={disabled || !user}
        onClick={() => setOpen(true)}
      >
        <ShoppingCart className="w-4 h-4" />
        {isService ? "Book Service" : "Order"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {isService ? "Book Service" : "Place Order"}
            </DialogTitle>
            <DialogDescription>
              {productName} &mdash; As You Wish
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quantity selector */}
            {!isService && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-mono">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}

            {/* Cost breakdown */}
            <Card className="bg-muted/30">
              <CardContent className="py-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Price{!isService && quantity > 1 ? ` x${quantity}` : ""}
                  </span>
                  <span>{totalPrice.toFixed(2)} Credits</span>
                </div>
                {costBasis != null && costBasis > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Cost basis</span>
                    <span>{(costBasis * quantity).toFixed(2)} Credits</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Platform margin (Cost+20%)</span>
                  <span>
                    {(totalPrice - (costBasis ?? 0) * quantity).toFixed(2)}{" "}
                    Credits
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Creator keeps (83.3%)</span>
                  <span>{creatorKeeps.toFixed(2)} Credits</span>
                </div>
                {isService && (
                  <>
                    <div className="border-t pt-1 mt-1" />
                    <div className="flex justify-between text-amber-700">
                      <span>Pay now (50%)</span>
                      <span>{upfrontAmount.toFixed(2)} Credits</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>Held in escrow until completion (50%)</span>
                      <span>{escrowAmount.toFixed(2)} Credits</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment methods */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Pay with</p>

              <button
                onClick={() => handleCheckout("credits")}
                disabled={loading || !hasEnoughCredits}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:pointer-events-none text-left"
              >
                <Coins className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Credits</p>
                  <p className="text-xs text-muted-foreground">
                    Balance: {(wallet?.balance ?? 0).toFixed(2)} Credits
                    {!hasEnoughCredits && (
                      <span className="text-red-600 ml-1">(insufficient)</span>
                    )}
                  </p>
                </div>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hasEnoughCredits ? (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </button>

              <button
                onClick={() => handleCheckout("stripe")}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:pointer-events-none text-left"
              >
                <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Card (Stripe)</p>
                  <p className="text-xs text-muted-foreground">
                    {isService
                      ? `Charge $${upfrontAmount.toFixed(2)} now`
                      : `Charge $${totalPrice.toFixed(2)}`}
                  </p>
                </div>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>

            {isService && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-2 rounded-md">
                <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                <span>
                  50% is held in escrow until the service provider completes the
                  work and you confirm. Auto-releases after 72 hours.
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Badge variant="outline" className="text-xs">
              As You Wish
            </Badge>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
