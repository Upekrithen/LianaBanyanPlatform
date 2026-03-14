/**
 * Meal Order Dialog
 * =================
 * Orders meals with dynamic pricing based on lead time.
 * Price is calculated at order time, not stored in the meal.
 * 
 * Supports bulk ordering with volume discounts for:
 * - Packed Lunches (order in 5s)
 * - Baked Goods (order by the dozen)
 * - Catering (minimum 10)
 */

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ShoppingCart, Heart, Clock, Info, Package, Minus, Plus as PlusIcon, Percent } from "lucide-react";
import { calculateMealPrice, calculateChefEarnings, formatHoursUntilPickup, type PriceTierInfo } from "@/lib/lmdPricing";
import { 
  calculateBulkOrder, 
  getNextTierSuggestion, 
  formatBulkPricing,
  type OfferingType,
  type VolumeDiscountTier,
  DEFAULT_VOLUME_TIERS
} from "@/lib/bulkPricing";
import { cn } from "@/lib/utils";

interface MealOrderDialogProps {
  mealId: string;
  mealName: string;
  mealPrice: number; // Calculated price based on lead time
  providerId: string;
  pickupDate?: string;
  pickupTime?: string | null;
  isCharity?: boolean;
  // Bulk ordering props
  offeringType?: OfferingType;
  portionsAvailable?: number;
  bulkMinimum?: number;
  bulkIncrement?: number;
  volumeDiscountTiers?: VolumeDiscountTier[];
}

export function MealOrderDialog({ 
  mealId, 
  mealName, 
  mealPrice, 
  providerId,
  pickupDate,
  pickupTime,
  isCharity = false,
  offeringType = 'standard',
  portionsAvailable = 1,
  bulkMinimum = 1,
  bulkIncrement = 1,
  volumeDiscountTiers = DEFAULT_VOLUME_TIERS
}: MealOrderDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"immediate" | "tab" | "donation" | "grant">("immediate");
  const [profitPercentage, setProfitPercentage] = useState(5);
  const [quantity, setQuantity] = useState(bulkMinimum);

  const isBulkOrder = offeringType !== 'standard';

  // Recalculate price at dialog open to ensure freshness
  const currentPricing: PriceTierInfo = pickupDate 
    ? calculateMealPrice(pickupDate, pickupTime, isCharity)
    : { price: mealPrice, tier: isCharity ? 'charity' : 'rush', label: isCharity ? 'Charity' : 'Current', hoursOut: 0, color: '', bgColor: '', description: '' };

  const unitPrice = currentPricing.price;
  
  // Calculate bulk order pricing
  const bulkCalc = useMemo(() => 
    calculateBulkOrder(quantity, unitPrice, offeringType, volumeDiscountTiers),
    [quantity, unitPrice, offeringType, volumeDiscountTiers]
  );
  
  // Get suggestion for next discount tier
  const nextTierSuggestion = useMemo(() => 
    getNextTierSuggestion(quantity, unitPrice, volumeDiscountTiers),
    [quantity, unitPrice, volumeDiscountTiers]
  );

  const actualPrice = isBulkOrder ? bulkCalc.finalTotal : unitPrice;
  const chefEarnings = calculateChefEarnings(actualPrice);

  // Quantity adjustment helpers
  const incrementQuantity = () => {
    const next = quantity + bulkIncrement;
    if (next <= portionsAvailable) setQuantity(next);
  };
  
  const decrementQuantity = () => {
    const next = quantity - bulkIncrement;
    if (next >= bulkMinimum) setQuantity(next);
  };

  const setQuantityDirect = (val: number) => {
    const clamped = Math.max(bulkMinimum, Math.min(portionsAvailable, val));
    setQuantity(clamped);
  };

  const orderMealMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      // Create meal order record with the calculated price
      const { data: order, error: orderError } = await supabase
        .from("meal_orders")
        .insert({
          meal_offering_id: mealId,
          recipient_id: user.id,
          payment_method: paymentMethod,
          service_credit_percentage_repayment: paymentMethod === "tab" ? profitPercentage : null,
          order_status: "pending",
          // Store quantity and pricing details
          quantity: quantity,
          unit_price: unitPrice,
          bulk_discount_percent: bulkCalc.discountPercent,
          bulk_discount_amount: bulkCalc.discountAmount,
          total_price: actualPrice,
          // Legacy field
          order_price: actualPrice,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Update portions claimed (by quantity, not just 1)
      const { error: updateError } = await supabase
        .rpc('increment_portions_claimed', { meal_id: mealId, amount: quantity });
      
      // Fallback if RPC doesn't exist or doesn't support amount param
      if (updateError) {
        await supabase
          .from('lmd_meals')
          .update({ 
            portions_claimed: supabase.sql`portions_claimed + ${quantity}` 
          })
          .eq('id', mealId);
      }

      // If tab method, update charitable loan account
      if (paymentMethod === "tab" && actualPrice > 0) {
        const { error: loanError } = await supabase
          .from("lmd_charity_accounts")
          .upsert({
            user_id: user.id,
            total_borrowed: actualPrice,
            current_balance: actualPrice,
            repayment_percentage: profitPercentage,
          }, { 
            onConflict: 'user_id',
            // If exists, increment instead
          });

        // If upsert fails, try updating existing
        if (loanError) {
          await supabase
            .from("lmd_charity_accounts")
            .update({
              total_borrowed: supabase.sql`total_borrowed + ${actualPrice}`,
              current_balance: supabase.sql`current_balance + ${actualPrice}`,
            })
            .eq("user_id", user.id);
        }
      }

      return order;
    },
    onSuccess: (order: { id: string; meal_offering_id?: string } | undefined) => {
      const orderId = order?.id;
      const reviewMealId = order?.meal_offering_id ?? mealId;
      toast({
        title: isCharity ? "Charity Meal Reserved!" : "Order Placed!",
        description: orderId ? (
          <span>
            Your order for {quantity > 1 ? `${quantity}x ` : ""}{mealName} has been placed successfully.
            {!isCharity && ` Total: $${actualPrice.toFixed(2)}`}
            {bulkCalc.savings > 0 && ` (Saved $${bulkCalc.savings.toFixed(2)}!)`}
            <br />
            <span className="text-muted-foreground text-sm mt-2 block">
              Remember to review this meal within 72 hours to earn 5 Marks (service value for participation, not investment return).{" "}
              <a href={`/initiatives/lets-make-dinner/review/${reviewMealId}?orderId=${orderId}`} className="underline text-primary">Review now</a>
            </span>
          </span>
        ) : `Your order for ${quantity > 1 ? `${quantity}x ` : ""}${mealName} has been placed successfully.${!isCharity ? ` Total: $${actualPrice.toFixed(2)}` : ""}${bulkCalc.savings > 0 ? ` (Saved $${bulkCalc.savings.toFixed(2)}!)` : ""}`,
      });
      queryClient.invalidateQueries({ queryKey: ["meal-orders"] });
      queryClient.invalidateQueries({ queryKey: ["lmd-meals"] });
      queryClient.invalidateQueries({ queryKey: ["charitable-loan-account"] });
      queryClient.invalidateQueries({ queryKey: ["lmd-orders-to-review"] });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => toast({ title: "Please sign in to order meals" })}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Sign in to Order
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full">
          {isCharity ? (
            <>
              <Heart className="h-4 w-4 mr-2" />
              Reserve (Free)
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Order — ${actualPrice}
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Order {mealName}</DialogTitle>
          <DialogDescription>
            {isCharity 
              ? "This is a charity meal — free for those who need it."
              : `${currentPricing.label} pricing: $${actualPrice} per portion`
            }
          </DialogDescription>
        </DialogHeader>

        {/* Quantity Selector for Bulk Orders */}
        {isBulkOrder && !isCharity && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Quantity</Label>
              <span className="text-sm text-muted-foreground">
                {portionsAvailable} available
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= bulkMinimum}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantityDirect(parseInt(e.target.value) || bulkMinimum)}
                min={bulkMinimum}
                max={portionsAvailable}
                step={bulkIncrement}
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity + bulkIncrement > portionsAvailable}
                aria-label="Increase quantity"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
              
              {/* Quick quantity buttons */}
              <div className="flex gap-1 ml-2">
                {[5, 10, 20, 40].filter(q => q <= portionsAvailable).map(q => (
                  <Button
                    key={q}
                    type="button"
                    variant={quantity === q ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setQuantity(q)}
                    className="text-xs px-2"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Volume discount applied */}
            {bulkCalc.discountPercent > 0 && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-500/10 rounded-lg p-2">
                <Percent className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {bulkCalc.bulkDiscount}% volume discount applied! Saving ${bulkCalc.savings.toFixed(2)}
                </span>
              </div>
            )}
            
            {/* Next tier suggestion */}
            {nextTierSuggestion && bulkCalc.discountPercent < 20 && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                <Info className="h-3 w-3 inline mr-1" />
                Order {nextTierSuggestion.additionalNeeded} more for {nextTierSuggestion.nextTier.discount_percent}% off!
              </div>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        {!isCharity && (
          <div className={cn(
            "rounded-lg p-3 border",
            currentPricing.bgColor,
            currentPricing.tier === 'preorder' && "border-emerald-500/30",
            currentPricing.tier === 'day-before' && "border-amber-500/30",
            currentPricing.tier === 'rush' && "border-rose-500/30"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {currentPricing.hoursOut > 0 
                    ? `Pickup in ${formatHoursUntilPickup(currentPricing.hoursOut)}`
                    : "Pickup time passed"
                  }
                </span>
              </div>
              <span className={cn("font-bold", currentPricing.color)}>
                ${unitPrice}/ea
              </span>
            </div>
            
            {/* Bulk pricing breakdown */}
            {isBulkOrder && quantity > 1 && (
              <div className="mt-2 pt-2 border-t border-current/10 space-y-1">
                {bulkCalc.bulkUnits > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{bulkCalc.bulkUnits} × ${bulkCalc.bulkUnitPrice.toFixed(2)} ({bulkCalc.bulkDiscount}% off)</span>
                    <span>${bulkCalc.bulkTotal.toFixed(2)}</span>
                  </div>
                )}
                {bulkCalc.individualUnits > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{bulkCalc.individualUnits} × ${unitPrice.toFixed(2)} (full price)</span>
                    <span>${bulkCalc.individualTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-1 border-t">
                  <span>Total ({quantity} items)</span>
                  <span>${actualPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground mt-1">
              {currentPricing.description} • Chef earns ${chefEarnings.toFixed(2)}
            </div>
          </div>
        )}

        {/* Charity Info */}
        {isCharity && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-rose-500">
              <Heart className="h-4 w-4" />
              <span className="font-medium">Charity Meal</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              This meal is provided free through the community charitable pool.
            </p>
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Payment method only shown for non-charity meals */}
          {!isCharity && (
            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="immediate" id="immediate" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="immediate" className="font-medium">
                    Pay Now
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Pay immediately with available credits
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <RadioGroupItem value="tab" id="tab" />
                <div className="grid gap-1.5 leading-none w-full">
                  <Label htmlFor="tab" className="font-medium">
                    Charitable Tab
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add to your charitable loan account, repay from future earnings
                  </p>
                  {paymentMethod === "tab" && (
                    <div className="mt-3 space-y-2">
                      <Label>Repayment Percentage (Minimum 5%)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[profitPercentage]}
                          onValueChange={(value) => setProfitPercentage(value[0])}
                          min={5}
                          max={50}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-12">{profitPercentage}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This percentage of your future earnings will go toward repaying this meal
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <RadioGroupItem value="donation" id="donation" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="donation" className="font-medium">
                    Request Donation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ask another member to donate to cover this meal
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <RadioGroupItem value="grant" id="grant" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="grant" className="font-medium">
                    Request Grant
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Apply for coverage from your Tribe, Guild, or LB
                  </p>
                </div>
              </div>
            </RadioGroup>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => orderMealMutation.mutate()} 
            disabled={orderMealMutation.isPending}
          >
            {orderMealMutation.isPending 
              ? "Placing Order..." 
              : isCharity 
                ? "Reserve Meal"
                : `Pay $${actualPrice.toFixed(2)}${quantity > 1 ? ` for ${quantity}` : ''}`
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
