/**
 * Shopping List Generator
 * =======================
 * Generates shopping lists from meal plans.
 * Aggregates ingredients across recipes.
 * Supports Tribe aggregation for volume discounts.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { 
  ShoppingCart, Check, Users, Store, Truck, ExternalLink, 
  Download, Share2, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShoppingListGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekStart: Date;
  tribeId?: string | null;
}

interface ShoppingListItem {
  id: string;
  ingredient_name: string;
  normalized_name: string | null;
  quantity: number | null;
  unit: string | null;
  category: string | null;
  is_checked: boolean;
  source_recipe_id: string | null;
}

interface AggregatedIngredient {
  ingredient_name: string;
  normalized_name: string | null;
  total_quantity: number;
  unit: string | null;
  category: string | null;
  recipe_count: number;
}

const INGREDIENT_CATEGORIES = [
  { id: 'produce', label: 'Produce', emoji: '🥬' },
  { id: 'dairy', label: 'Dairy', emoji: '🧀' },
  { id: 'meat', label: 'Meat', emoji: '🥩' },
  { id: 'seafood', label: 'Seafood', emoji: '🐟' },
  { id: 'bakery', label: 'Bakery', emoji: '🍞' },
  { id: 'pantry', label: 'Pantry', emoji: '🥫' },
  { id: 'frozen', label: 'Frozen', emoji: '❄️' },
  { id: 'beverages', label: 'Beverages', emoji: '🥤' },
  { id: 'other', label: 'Other', emoji: '📦' },
];

const FULFILLMENT_OPTIONS = [
  { 
    id: 'personal', 
    label: 'Shop Yourself', 
    description: 'Use as a checklist', 
    icon: ShoppingCart 
  },
  { 
    id: 'external_api', 
    label: 'Send to Store App', 
    description: 'HEB, Kroger, Instacart', 
    icon: Store 
  },
  { 
    id: 'lets_get_groceries', 
    label: 'Let\'s Get Groceries', 
    description: 'LB aggregate order', 
    icon: Users 
  },
  { 
    id: 'lets_go_shopping', 
    label: 'Let\'s Go Shopping', 
    description: 'Micro-local volume discount', 
    icon: Truck 
  },
];

const EXTERNAL_APIS = [
  { id: 'heb', label: 'HEB', available: true },
  { id: 'kroger', label: 'Kroger', available: true },
  { id: 'instacart', label: 'Instacart', available: true },
  { id: 'amazon_fresh', label: 'Amazon Fresh', available: true },
];

export function ShoppingListGenerator({ 
  open, 
  onOpenChange, 
  weekStart,
  tribeId 
}: ShoppingListGeneratorProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [fulfillmentMethod, setFulfillmentMethod] = useState('personal');
  const [externalApi, setExternalApi] = useState('heb');
  const [includeTribe, setIncludeTribe] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['produce', 'dairy', 'meat', 'pantry']));
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const weekEnd = addDays(weekStart, 6);

  // Fetch aggregated ingredients from meal plans
  const { data: ingredients, isLoading } = useQuery({
    queryKey: ['shopping-aggregation', format(weekStart, 'yyyy-MM-dd'), includeTribe, tribeId],
    queryFn: async () => {
      if (!user) return [];

      // Fetch meal plans for the week with recipe ingredients
      const { data: mealPlans, error: planError } = await supabase
        .from('family_meal_plans')
        .select(`
          id,
          servings,
          pantry_recipes:recipe_id (
            id,
            servings,
            pantry_recipe_ingredients (
              ingredient_name,
              normalized_name,
              quantity,
              unit,
              category
            )
          )
        `)
        .eq('user_id', user.id)
        .gte('meal_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('meal_date', format(weekEnd, 'yyyy-MM-dd'))
        .eq('include_in_shopping', true);

      if (planError) throw planError;

      // Aggregate ingredients
      const aggregation: Record<string, AggregatedIngredient> = {};

      mealPlans?.forEach(plan => {
        if (!plan.pantry_recipes) return;
        
        const recipe = plan.pantry_recipes as any;
        const ingredients = recipe.pantry_recipe_ingredients || [];
        const servingMultiplier = (plan.servings || 1) / (recipe.servings || 1);

        ingredients.forEach((ing: any) => {
          const key = (ing.normalized_name || ing.ingredient_name).toLowerCase();
          
          if (!aggregation[key]) {
            aggregation[key] = {
              ingredient_name: ing.ingredient_name,
              normalized_name: ing.normalized_name,
              total_quantity: 0,
              unit: ing.unit,
              category: ing.category || 'other',
              recipe_count: 0,
            };
          }

          aggregation[key].total_quantity += (ing.quantity || 1) * servingMultiplier;
          aggregation[key].recipe_count += 1;
        });
      });

      return Object.values(aggregation).sort((a, b) => 
        (a.category || 'other').localeCompare(b.category || 'other')
      );
    },
    enabled: !!user && open
  });

  // Group ingredients by category
  const groupedIngredients = ingredients?.reduce((acc, ing) => {
    const cat = ing.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ing);
    return acc;
  }, {} as Record<string, AggregatedIngredient[]>) || {};

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Toggle item check
  const toggleItem = (itemKey: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemKey)) {
      newChecked.delete(itemKey);
    } else {
      newChecked.add(itemKey);
    }
    setCheckedItems(newChecked);
  };

  // Generate shopping list mutation
  const generateList = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Please sign in');

      // Create shopping list
      const { data: list, error: listError } = await supabase
        .from('family_shopping_lists')
        .insert({
          user_id: user.id,
          tribe_id: includeTribe ? tribeId : null,
          week_start: format(weekStart, 'yyyy-MM-dd'),
          is_tribe_aggregated: includeTribe && !!tribeId,
          fulfillment_method: fulfillmentMethod,
          external_api: fulfillmentMethod === 'external_api' ? externalApi : null,
          status: 'finalized',
        })
        .select()
        .single();

      if (listError) throw listError;

      // Add items
      if (ingredients && ingredients.length > 0) {
        const { error: itemsError } = await supabase
          .from('family_shopping_list_items')
          .insert(
            ingredients.map(ing => ({
              shopping_list_id: list.id,
              ingredient_name: ing.ingredient_name,
              normalized_name: ing.normalized_name,
              quantity: ing.total_quantity,
              unit: ing.unit,
              category: ing.category,
              is_checked: false,
            }))
          );

        if (itemsError) throw itemsError;
      }

      return list;
    },
    onSuccess: (list) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      toast.success('Shopping list generated!');
      onOpenChange(false);
      
      // Handle fulfillment method
      if (fulfillmentMethod === 'external_api') {
        toast.info(`Ready to send to ${EXTERNAL_APIS.find(a => a.id === externalApi)?.label}. Integration coming soon!`);
      } else if (fulfillmentMethod === 'lets_get_groceries') {
        toast.info('Adding to Let\'s Get Groceries aggregate order...');
      } else if (fulfillmentMethod === 'lets_go_shopping') {
        toast.info('Adding to micro-local shopping group...');
      }
    },
    onError: (error) => {
      toast.error('Failed to generate list: ' + error.message);
    }
  });

  // Format quantity for display
  const formatQuantity = (qty: number, unit: string | null): string => {
    const rounded = Math.round(qty * 4) / 4; // Round to nearest quarter
    if (!unit) return `${rounded}`;
    return `${rounded} ${unit}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Shopping List</DialogTitle>
          <DialogDescription>
            Week of {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">Loading ingredients...</div>
        ) : !ingredients || ingredients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-40" />
            <p>No ingredients to shop for this week.</p>
            <p className="text-sm mt-1">Add meals to your calendar first!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tribe Aggregation Option */}
            {tribeId && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <Checkbox 
                  checked={includeTribe} 
                  onCheckedChange={(checked) => setIncludeTribe(!!checked)} 
                />
                <div>
                  <Label className="text-base">Include Tribe Members</Label>
                  <p className="text-sm text-muted-foreground">
                    Aggregate shopping lists with your Tribe for volume discounts
                  </p>
                </div>
              </div>
            )}

            {/* Ingredient List by Category */}
            <div className="space-y-2">
              <Label>Shopping List ({ingredients.length} items)</Label>
              
              {INGREDIENT_CATEGORIES.map(cat => {
                const items = groupedIngredients[cat.id];
                if (!items || items.length === 0) return null;
                
                const isExpanded = expandedCategories.has(cat.id);
                const checkedCount = items.filter(i => 
                  checkedItems.has(i.normalized_name || i.ingredient_name)
                ).length;

                return (
                  <div key={cat.id} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span className="font-medium">{cat.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {checkedCount}/{items.length}
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="p-2 space-y-1">
                        {items.map(item => {
                          const key = item.normalized_name || item.ingredient_name;
                          const isChecked = checkedItems.has(key);
                          
                          return (
                            <div 
                              key={key}
                              onClick={() => toggleItem(key)}
                              className={cn(
                                "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                                isChecked 
                                  ? "bg-emerald-500/10 line-through opacity-60" 
                                  : "hover:bg-white/5"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox checked={isChecked} />
                                <span>{item.ingredient_name}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {formatQuantity(item.total_quantity, item.unit)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Fulfillment Method */}
            <div className="space-y-3">
              <Label>How would you like to shop?</Label>
              <RadioGroup value={fulfillmentMethod} onValueChange={setFulfillmentMethod}>
                {FULFILLMENT_OPTIONS.map(option => (
                  <div 
                    key={option.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      fulfillmentMethod === option.id 
                        ? "bg-primary/10 border-primary/50" 
                        : "border-gray-700 hover:border-gray-500"
                    )}
                    onClick={() => setFulfillmentMethod(option.id)}
                  >
                    <RadioGroupItem value={option.id} />
                    <option.icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* External API Selection */}
            {fulfillmentMethod === 'external_api' && (
              <div className="space-y-3">
                <Label>Select Store</Label>
                <div className="grid grid-cols-2 gap-2">
                  {EXTERNAL_APIS.map(api => (
                    <button
                      key={api.id}
                      onClick={() => setExternalApi(api.id)}
                      className={cn(
                        "p-3 rounded-lg border text-center transition-colors",
                        externalApi === api.id 
                          ? "bg-primary/10 border-primary/50" 
                          : "border-gray-700 hover:border-gray-500"
                      )}
                    >
                      {api.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => generateList.mutate()}
                disabled={generateList.isPending}
              >
                {generateList.isPending ? 'Generating...' : 'Generate List'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
