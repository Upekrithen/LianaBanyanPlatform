import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ShoppingCart } from "lucide-react";

interface MealOrderDialogProps {
  mealId: string;
  mealName: string;
  mealPrice: number;
  providerId: string;
}

export function MealOrderDialog({ mealId, mealName, mealPrice, providerId }: MealOrderDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"immediate" | "tab" | "donation" | "grant">("tab");
  const [profitPercentage, setProfitPercentage] = useState(5);

  const orderMealMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      // Create meal order record
      const { data: order, error: orderError } = await supabase
        .from("meal_orders")
        .insert({
          meal_offering_id: mealId,
          recipient_id: user.id,
          payment_method: paymentMethod,
          profit_percentage_repayment: paymentMethod === "tab" ? profitPercentage : null,
          order_status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // If tab method, update charitable loan account
      if (paymentMethod === "tab") {
        const { error: loanError } = await supabase
          .from("charitable_loan_accounts")
          .update({
            total_borrowed: supabase.sql`total_borrowed + ${mealPrice}`,
            current_balance: supabase.sql`current_balance + ${mealPrice}`,
          })
          .eq("user_id", user.id);

        if (loanError) throw loanError;
      }

      return order;
    },
    onSuccess: () => {
      toast({
        title: "Order Placed!",
        description: `Your order for ${mealName} has been placed successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["meal-orders"] });
      queryClient.invalidateQueries({ queryKey: ["charitable-loan-account"] });
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
      <Button variant="outline" onClick={() => toast({ title: "Please sign in to order meals" })}>
        <ShoppingCart className="h-4 w-4 mr-2" />
        Order Meal
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Order Meal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Order {mealName}</DialogTitle>
          <DialogDescription>
            Choose how you'd like to pay for this meal (${mealPrice.toFixed(2)})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                  Add to your charitable loan account, repay from future profits
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
                      This percentage of your future profits will go toward repaying this meal
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
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => orderMealMutation.mutate()} disabled={orderMealMutation.isPending}>
            {orderMealMutation.isPending ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
