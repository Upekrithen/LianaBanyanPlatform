import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, ShoppingBag, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GroceryItem {
  name: string;
  quantity: number;
  unit_price: number;
}

export function GroceryOrderForm() {
  const [items, setItems] = useState<GroceryItem[]>([{ name: "", quantity: 1, unit_price: 0 }]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryPreference, setDeliveryPreference] = useState("node_pickup");
  const [integrationService, setIntegrationService] = useState("heb_curbside");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof GroceryItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: schedule } = await supabase
        .from("orders")
        .select("id")
        .eq("integration_service", integrationService)
        .eq("is_active", true)
        .single();

      const { error } = await supabase.from("orders").insert({
        schedule_id: schedule?.id,
        user_id: user.id,
        items: items,
        total_cost: totalCost,
        delivery_preference: deliveryPreference,
        delivery_date: deliveryDate,
      });

      if (error) throw error;

      toast({
        title: "Order Placed!",
        description: `Your grocery order for ${new Date(deliveryDate).toLocaleDateString()} has been submitted`,
      });

      setItems([{ name: "", quantity: 1, unit_price: 0 }]);
      setDeliveryDate("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Place Grocery Order
        </CardTitle>
        <CardDescription>
          Order groceries for scheduled delivery with volume pricing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Integration Service</Label>
              <Select value={integrationService} onValueChange={setIntegrationService}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heb_curbside">HEB Curbside</SelectItem>
                  <SelectItem value="heb_favor">HEB Favor Delivery</SelectItem>
                  <SelectItem value="instacart">Instacart</SelectItem>
                  <SelectItem value="amazon_fresh">Amazon Fresh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Delivery Date *</Label>
              <Input
                required
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Delivery Preference</Label>
            <Select value={deliveryPreference} onValueChange={setDeliveryPreference}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="node_pickup">Node Pickup</SelectItem>
                <SelectItem value="home_delivery">Home Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Grocery Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Input
                    required
                    placeholder="Item name (e.g., Milk, Eggs)"
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                  />
                </div>
                <div className="w-24 space-y-2">
                  <Input
                    required
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="w-28 space-y-2">
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="$0.00"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                  />
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              <Calendar className="h-4 w-4 mr-2" />
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
