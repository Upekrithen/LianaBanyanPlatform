import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Package, ShoppingCart, TrendingDown, Users } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShoppingOrder {
  id: string;
  event_name: string;
  category: string;
  product_name: string;
  product_description: string;
  product_image_url?: string;
  unit_price: number;
  min_quantity_threshold: number;
  current_quantity: number;
  volume_discount_tiers: Array<{ min_qty: number; discount_pct: number }>;
  status: string;
  closes_at: string;
  organizer_id: string;
}

interface ShoppingOrderCardProps {
  order: ShoppingOrder;
  onJoin?: () => void;
}

export function ShoppingOrderCard({ order, onJoin }: ShoppingOrderCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const progress = (order.current_quantity / order.min_quantity_threshold) * 100;
  const thresholdMet = order.current_quantity >= order.min_quantity_threshold;

  const getCurrentDiscount = () => {
    const sorted = [...order.volume_discount_tiers].sort((a, b) => b.min_qty - a.min_qty);
    for (const tier of sorted) {
      if (order.current_quantity >= tier.min_qty) {
        return tier.discount_pct;
      }
    }
    return 0;
  };

  const currentDiscount = getCurrentDiscount();
  const discountedPrice = order.unit_price * (1 - currentDiscount / 100);
  const totalCost = discountedPrice * quantity;

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("shopping_participants").insert({
        shopping_order_id: order.id,
        user_id: user.id,
        quantity: quantity,
        total_cost: totalCost,
      });

      if (error) throw error;

      toast({
        title: "Joined Order!",
        description: `You've joined the ${order.event_name} order for ${quantity} ${order.product_name}`,
      });

      onJoin?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {order.product_name}
            </CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline">{order.event_name}</Badge>
              <span className="ml-2 text-xs">
                Closes {new Date(order.closes_at).toLocaleDateString()}
              </span>
            </CardDescription>
          </div>
          {thresholdMet && (
            <Badge className="bg-green-500">Threshold Met!</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {order.product_image_url && (
          <img src={order.product_image_url} alt={order.product_name} className="w-full h-48 object-cover rounded-md" />
        )}
        
        <p className="text-sm text-muted-foreground">{order.product_description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Progress
            </span>
            <span className="font-medium">
              {order.current_quantity} / {order.min_quantity_threshold} units
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {currentDiscount > 0 && (
          <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-md">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              {currentDiscount}% Volume Discount Active!
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Unit Price</p>
            <p className="text-lg font-bold">
              {currentDiscount > 0 && (
                <span className="text-sm line-through text-muted-foreground mr-2">
                  ${order.unit_price.toFixed(2)}
                </span>
              )}
              ${discountedPrice.toFixed(2)}
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Join Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join {order.event_name} Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex justify-between text-sm border-t pt-4">
                  <span>Total Cost:</span>
                  <span className="font-bold text-lg">${totalCost.toFixed(2)}</span>
                </div>
                <Button onClick={handleJoin} disabled={isJoining} className="w-full">
                  {isJoining ? "Joining..." : "Confirm & Join"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
