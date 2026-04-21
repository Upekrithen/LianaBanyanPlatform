/**
 * GIFT SHOPPING AGGREGATION
 * ==========================
 * Component for creating shopping aggregations from gift list items.
 * "I'm buying this Nintendo Switch 2 on Thursday" - creates a cold start
 * that other family members can join for volume discounts.
 */

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShoppingCart, Calendar, Clock, Users, DollarSign,
  TrendingUp, CheckCircle2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

interface GiftShoppingAggregationProps {
  giftItemId?: string;
  giftItemName?: string;
  giftItemPrice?: number;
  giftItemUrl?: string;
  familyId: string;
  memberId: string;
}

const DISCOUNT_TIERS = [
  { min: 2, discount: '10%', label: '2+ shoppers' },
  { min: 5, discount: '15%', label: '5+ shoppers' },
  { min: 10, discount: '20%', label: '10+ shoppers' },
];

export function GiftShoppingAggregation({
  giftItemId,
  giftItemName,
  giftItemPrice,
  giftItemUrl,
  familyId,
  memberId,
}: GiftShoppingAggregationProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);

  // Form state
  const [productName, setProductName] = useState(giftItemName || "");
  const [productUrl, setProductUrl] = useState(giftItemUrl || "");
  const [productPrice, setProductPrice] = useState(giftItemPrice?.toString() || "");
  const [shoppingDate, setShoppingDate] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [shoppingTime, setShoppingTime] = useState("15:00");

  // Fetch active aggregations for this family
  const { data: aggregations } = useQuery({
    queryKey: ['family-shopping-aggregations', familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gift_shopping_aggregations')
        .select(`
          *,
          gift_shopping_participants (
            family_member_id,
            quantity
          )
        `)
        .eq('family_id', familyId)
        .eq('status', 'open')
        .gte('window_closes_at', new Date().toISOString())
        .order('shopping_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!familyId,
  });

  const createAggregation = useMutation({
    mutationFn: async () => {
      // Calculate window close time (2 hours before shopping time)
      const shoppingDateTime = new Date(`${shoppingDate}T${shoppingTime}:00`);
      const windowCloses = new Date(shoppingDateTime.getTime() - 2 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('gift_shopping_aggregations')
        .insert({
          gift_item_id: giftItemId || null,
          family_id: familyId,
          product_name: productName,
          product_url: productUrl || null,
          product_price: productPrice ? parseFloat(productPrice) : null,
          shopping_date: shoppingDate,
          shopping_time: shoppingTime,
          window_closes_at: windowCloses.toISOString(),
          created_by: memberId,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as first participant
      await supabase
        .from('gift_shopping_participants')
        .insert({
          aggregation_id: data.id,
          family_member_id: memberId,
          for_gift_item_id: giftItemId || null,
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-shopping-aggregations', familyId] });
      toast.success("Shopping aggregation created! Share with your family for volume discounts.");
      setShowDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const joinAggregation = useMutation({
    mutationFn: async (aggregationId: string) => {
      const { error } = await supabase
        .from('gift_shopping_participants')
        .insert({
          aggregation_id: aggregationId,
          family_member_id: memberId,
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error("You've already joined this aggregation");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-shopping-aggregations', familyId] });
      toast.success("You've joined the shopping aggregation!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    if (!giftItemName) setProductName("");
    if (!giftItemUrl) setProductUrl("");
    if (!giftItemPrice) setProductPrice("");
    setShoppingDate(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
    setShoppingTime("15:00");
  };

  const getDiscountTier = (participants: number) => {
    if (participants >= 10) return { discount: '20%', tier: 3 };
    if (participants >= 5) return { discount: '15%', tier: 2 };
    if (participants >= 2) return { discount: '10%', tier: 1 };
    return { discount: '0%', tier: 0 };
  };

  const hasJoined = (agg: any) => {
    return agg.gift_shopping_participants?.some(
      (p: any) => p.family_member_id === memberId
    );
  };

  return (
    <div className="space-y-4">
      {/* Create New Aggregation Button */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Start a Shopping Trip
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Start a Shopping Aggregation
            </DialogTitle>
            <DialogDescription>
              Let family members know when you're buying something.
              Others can join for volume discounts!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Name */}
            <div className="space-y-2">
              <Label>What are you buying? *</Label>
              <Input
                placeholder="e.g., Nintendo Switch 2"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>

            {/* Product URL */}
            <div className="space-y-2">
              <Label>Product Link</Label>
              <Input
                placeholder="https://..."
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label>
                <DollarSign className="h-4 w-4 inline mr-1" />
                Price
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
              />
            </div>

            {/* Shopping Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Shopping Date *
                </Label>
                <Input
                  type="date"
                  value={shoppingDate}
                  onChange={(e) => setShoppingDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>
                  <Clock className="h-4 w-4 inline mr-1" />
                  Time
                </Label>
                <Input
                  type="time"
                  value={shoppingTime}
                  onChange={(e) => setShoppingTime(e.target.value)}
                />
              </div>
            </div>

            {/* Discount Tiers Info */}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Volume Discounts
              </h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {DISCOUNT_TIERS.map((tier) => (
                  <div key={tier.min} className="text-center">
                    <div className="font-bold text-blue-400">{tier.discount}</div>
                    <div className="text-xs text-muted-foreground">{tier.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createAggregation.mutate()}
              disabled={!productName || !shoppingDate || createAggregation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createAggregation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Create Aggregation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Aggregations */}
      {aggregations && aggregations.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Shopping Trips
          </h3>

          {aggregations.map((agg) => {
            const participantCount = agg.gift_shopping_participants?.length || 1;
            const discountInfo = getDiscountTier(participantCount);
            const alreadyJoined = hasJoined(agg);

            return (
              <div
                key={agg.id}
                className="p-3 rounded-lg border border-white/10 bg-white/5 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{agg.product_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(agg.shopping_date), 'EEE, MMM d')}
                      {agg.shopping_time && ` at ${agg.shopping_time}`}
                    </p>
                  </div>
                  {discountInfo.tier > 0 && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      {discountInfo.discount} off!
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{participantCount} {participantCount === 1 ? 'person' : 'people'}</span>
                    {agg.product_price && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <DollarSign className="h-3 w-3" />
                        <span>{agg.product_price}</span>
                      </>
                    )}
                  </div>

                  {alreadyJoined ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Joined
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => joinAggregation.mutate(agg.id)}
                      disabled={joinAggregation.isPending}
                      className="hover:bg-blue-500/10 hover:text-blue-400"
                    >
                      Join Trip
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
