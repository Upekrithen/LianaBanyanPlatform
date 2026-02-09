import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function CreateShoppingOrderDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    event_name: "",
    category: "holiday",
    product_name: "",
    product_description: "",
    product_image_url: "",
    unit_price: "",
    min_quantity_threshold: "10",
    closes_at: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: initiative } = await supabase
        .from("initiative_projects")
        .select("id")
        .eq("initiative_slug", "lets_go_shopping")
        .single();

      if (!initiative) throw new Error("Initiative not found");

      const { error } = await supabase.from("shopping_orders").insert({
        initiative_project_id: initiative.id,
        event_name: formData.event_name,
        category: formData.category,
        product_name: formData.product_name,
        product_description: formData.product_description,
        product_image_url: formData.product_image_url || null,
        unit_price: parseFloat(formData.unit_price),
        min_quantity_threshold: parseInt(formData.min_quantity_threshold),
        closes_at: new Date(formData.closes_at).toISOString(),
        organizer_id: user.id,
        volume_discount_tiers: [
          { min_qty: 50, discount_pct: 10 },
          { min_qty: 100, discount_pct: 15 },
          { min_qty: 200, discount_pct: 20 },
        ],
      });

      if (error) throw error;

      toast({
        title: "Order Created!",
        description: `Your ${formData.event_name} shopping order is now live`,
      });

      setOpen(false);
      setFormData({
        event_name: "",
        category: "holiday",
        product_name: "",
        product_description: "",
        product_image_url: "",
        unit_price: "",
        min_quantity_threshold: "10",
        closes_at: "",
      });
      onCreated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Shopping Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shopping Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Name *</Label>
              <Input
                required
                placeholder="Easter 2025"
                value={formData.event_name}
                onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="event">Special Event</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product Name *</Label>
            <Input
              required
              placeholder="Easter Egg Decorating Kits"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Complete egg decorating kit with dyes, stickers, and tools..."
              value={formData.product_description}
              onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Product Image URL</Label>
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.product_image_url}
              onChange={(e) => setFormData({ ...formData, product_image_url: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Unit Price ($) *</Label>
              <Input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="15.99"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Min Quantity *</Label>
              <Input
                required
                type="number"
                min="1"
                placeholder="10"
                value={formData.min_quantity_threshold}
                onChange={(e) => setFormData({ ...formData, min_quantity_threshold: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Closes At *</Label>
              <Input
                required
                type="date"
                value={formData.closes_at}
                onChange={(e) => setFormData({ ...formData, closes_at: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium mb-1">Auto Volume Discounts:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>50+ units: 10% off</li>
              <li>100+ units: 15% off</li>
              <li>200+ units: 20% off</li>
            </ul>
          </div>

          <Button type="submit" disabled={isCreating} className="w-full">
            {isCreating ? "Creating..." : "Create Shopping Order"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
