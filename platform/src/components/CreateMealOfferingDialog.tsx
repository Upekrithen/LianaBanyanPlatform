/**
 * Create Meal Offering Dialog
 * ===========================
 * For chefs to offer meals, packed lunches, or baked goods.
 * 
 * Pricing is AUTOMATIC based on lead time:
 * - $5 preorder (48+ hrs)
 * - $10 day-before (6-48 hrs)
 * - $15 rush (under 6 hrs)
 * 
 * Bulk orders get volume discounts:
 * - 5+ units: 5% off
 * - 10+ units: 10% off
 * - 20+ units: 15% off
 * - 40+ units: 20% off
 * 
 * Chefs keep 83.3% — locked forever.
 */

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Info, Package, Cookie, ChefHat, Users } from "lucide-react";
import { LMD_PRICING, calculateChefEarnings } from "@/lib/lmdPricing";
import { 
  type OfferingType, 
  BAKED_GOODS_CATEGORIES, 
  DEFAULT_VOLUME_TIERS,
  formatVolumeTiers 
} from "@/lib/bulkPricing";

interface CreateMealOfferingDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateMealOfferingDialog({ 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange,
  trigger 
}: CreateMealOfferingDialogProps) {
  // Support both controlled and uncontrolled modes
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCharity, setIsCharity] = useState(false);
  const [offeringType, setOfferingType] = useState<OfferingType>('standard');
  const [bakedGoodsCategory, setBakedGoodsCategory] = useState<string>('');
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Ensure chef profile exists (upsert)
      await supabase
        .from('lmd_chefs')
        .upsert({
          user_id: user.id,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Chef',
          is_active: true,
        }, { onConflict: 'user_id' });

      // Get chef ID
      const { data: chef } = await supabase
        .from('lmd_chefs')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!chef) throw new Error('Chef profile not found');

      const portionsAvailable = parseInt(formData.get('portions') as string);
      const allergenStr = formData.get('allergens') as string;

      // Build bulk increment based on offering type
      const bulkIncrement = offeringType === 'packed_lunch' ? 5 : 
                           offeringType === 'baked_goods' ? 6 : 1;

      // For auto-pricing, we store 0 as price_per_portion (calculated dynamically)
      // The actual price is computed at order time based on lead time
      const { error } = await supabase
        .from('lmd_meals')
        .insert({
          chef_id: chef.id,
          meal_name: formData.get('meal_name') as string,
          description: formData.get('description') as string || null,
          cuisine: formData.get('cuisine') as string || null,
          allergens: allergenStr ? allergenStr.split(',').map(a => a.trim()) : null,
          portions_available: portionsAvailable,
          portions_claimed: 0,
          price_per_portion: 0, // Dynamic pricing - calculated at order time
          pickup_date: formData.get('pickup_date') as string,
          pickup_time: formData.get('pickup_time') as string || null,
          pickup_location: formData.get('pickup_location') as string || null,
          pickup_instructions: formData.get('pickup_instructions') as string || null,
          is_charity: isCharity,
          status: 'available',
          // New bulk/baked goods fields
          offering_type: offeringType,
          bulk_minimum: offeringType === 'catering' ? 10 : 1,
          bulk_increment: bulkIncrement,
          cottage_law_category: offeringType === 'baked_goods' ? bakedGoodsCategory : null,
          volume_discount_tiers: JSON.stringify(DEFAULT_VOLUME_TIERS),
        });

      if (error) throw error;

      toast.success('Meal offering created!');
      queryClient.invalidateQueries({ queryKey: ['lmd-meals'] });
      setOpen(false);
      e.currentTarget.reset();
      setIsCharity(false);
      setOfferingType('standard');
      setBakedGoodsCategory('');
    } catch (error: any) {
      toast.error('Failed to create meal offering: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  const dialogContent = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Offer a Meal</DialogTitle>
        <DialogDescription>
          Share a homemade meal with your community. Chefs keep 83.3% — locked forever.
        </DialogDescription>
      </DialogHeader>

      {/* Offering Type Selection */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setOfferingType('standard')}
          className={`p-3 rounded-lg border text-center transition-colors ${
            offeringType === 'standard' 
              ? 'bg-primary/10 border-primary' 
              : 'bg-muted/50 border-muted hover:border-primary/50'
          }`}
        >
          <ChefHat className="h-5 w-5 mx-auto mb-1" />
          <div className="text-xs font-medium">Standard</div>
        </button>
        <button
          type="button"
          onClick={() => setOfferingType('packed_lunch')}
          className={`p-3 rounded-lg border text-center transition-colors ${
            offeringType === 'packed_lunch' 
              ? 'bg-primary/10 border-primary' 
              : 'bg-muted/50 border-muted hover:border-primary/50'
          }`}
        >
          <Package className="h-5 w-5 mx-auto mb-1" />
          <div className="text-xs font-medium">Packed Lunch</div>
        </button>
        <button
          type="button"
          onClick={() => setOfferingType('baked_goods')}
          className={`p-3 rounded-lg border text-center transition-colors ${
            offeringType === 'baked_goods' 
              ? 'bg-primary/10 border-primary' 
              : 'bg-muted/50 border-muted hover:border-primary/50'
          }`}
        >
          <Cookie className="h-5 w-5 mx-auto mb-1" />
          <div className="text-xs font-medium">Baked Goods</div>
        </button>
        <button
          type="button"
          onClick={() => setOfferingType('catering')}
          className={`p-3 rounded-lg border text-center transition-colors ${
            offeringType === 'catering' 
              ? 'bg-primary/10 border-primary' 
              : 'bg-muted/50 border-muted hover:border-primary/50'
          }`}
        >
          <Users className="h-5 w-5 mx-auto mb-1" />
          <div className="text-xs font-medium">Catering</div>
        </button>
      </div>

      {/* Baked Goods Category */}
      {offeringType === 'baked_goods' && (
        <div>
          <Label htmlFor="baked_category">Baked Goods Category</Label>
          <Select value={bakedGoodsCategory} onValueChange={setBakedGoodsCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {BAKED_GOODS_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Most baked goods are covered under cottage food laws — no permit needed for small batches!
          </p>
        </div>
      )}

      {/* Pricing Info Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Info className="h-4 w-4 text-primary" />
          Automatic Pricing Based on Order Lead Time
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-emerald-500/10 rounded p-2">
            <div className="font-bold text-emerald-600">$5</div>
            <div className="text-xs text-muted-foreground">48+ hrs ahead</div>
            <div className="text-xs text-emerald-600">You earn ${calculateChefEarnings(5)}</div>
          </div>
          <div className="bg-amber-500/10 rounded p-2">
            <div className="font-bold text-amber-600">$10</div>
            <div className="text-xs text-muted-foreground">6-48 hrs ahead</div>
            <div className="text-xs text-amber-600">You earn ${calculateChefEarnings(10)}</div>
          </div>
          <div className="bg-rose-500/10 rounded p-2">
            <div className="font-bold text-rose-600">$15</div>
            <div className="text-xs text-muted-foreground">Under 6 hrs</div>
            <div className="text-xs text-rose-600">You earn ${calculateChefEarnings(15)}</div>
          </div>
        </div>

        {/* Volume Discount Info */}
        {(offeringType === 'packed_lunch' || offeringType === 'baked_goods' || offeringType === 'catering') && (
          <div className="pt-2 border-t border-primary/20">
            <div className="text-xs font-medium mb-1">Volume Discounts for Bulk Orders:</div>
            <div className="grid grid-cols-4 gap-1 text-xs text-center">
              <div className="bg-blue-500/10 rounded p-1">5+: 5% off</div>
              <div className="bg-blue-500/10 rounded p-1">10+: 10% off</div>
              <div className="bg-blue-500/10 rounded p-1">20+: 15% off</div>
              <div className="bg-blue-500/10 rounded p-1">40+: 20% off</div>
            </div>
            {offeringType === 'packed_lunch' && (
              <p className="text-xs text-muted-foreground mt-1">
                Packed lunches come in brown bag packaging, perfect for offices and events!
              </p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="meal_name">Meal Name *</Label>
          <Input id="meal_name" name="meal_name" placeholder="e.g., Homemade Lasagna" required />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="What makes this meal special?" rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cuisine">Cuisine Type</Label>
            <Input id="cuisine" name="cuisine" placeholder="e.g., Italian, Mexican, Soul Food" />
          </div>
          <div>
            <Label htmlFor="allergens">Allergens (comma-separated)</Label>
            <Input id="allergens" name="allergens" placeholder="e.g., dairy, nuts, gluten" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="portions">Portions Available *</Label>
            <Input id="portions" name="portions" type="number" min="1" placeholder="4" required />
          </div>
          <div>
            <Label htmlFor="pickup_date">Pickup Date *</Label>
            <Input id="pickup_date" name="pickup_date" type="date" min={today} required />
          </div>
          <div>
            <Label htmlFor="pickup_time">Pickup Time *</Label>
            <Input id="pickup_time" name="pickup_time" type="time" required />
          </div>
        </div>

        <div>
          <Label htmlFor="pickup_location">Pickup Location *</Label>
          <Input id="pickup_location" name="pickup_location" placeholder="e.g., 123 Main St, Porch pickup" required />
        </div>

        <div>
          <Label htmlFor="pickup_instructions">Pickup Instructions</Label>
          <Textarea id="pickup_instructions" name="pickup_instructions" placeholder="Ring doorbell, containers provided, etc." rows={2} />
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-rose-500/5 border border-rose-500/20">
          <Switch checked={isCharity} onCheckedChange={setIsCharity} />
          <div>
            <Label className="text-base">Charity Meal</Label>
            <p className="text-sm text-muted-foreground">
              Offer this meal for free to those who need it. Funded by the community charitable pool.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Offering'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  // If controlled externally (no trigger needed)
  if (controlledOpen !== undefined) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  // Uncontrolled with trigger button
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Offer a Meal
          </Button>
        )}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
