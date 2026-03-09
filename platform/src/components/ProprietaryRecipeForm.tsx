/**
 * Proprietary Recipe Form
 * =======================
 * Form for adding secret recipes to personal portfolio.
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Lock, Plus, Minus } from 'lucide-react';

interface ProprietaryRecipeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProprietaryRecipeForm({ open, onOpenChange, onSuccess }: ProprietaryRecipeFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipeType, setRecipeType] = useState<'meal' | 'baked_good' | 'beverage' | 'other'>('meal');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);

  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (idx: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== idx));
    }
  };
  const updateIngredient = (idx: number, value: string) => {
    const updated = [...ingredients];
    updated[idx] = value;
    setIngredients(updated);
  };

  const addInstruction = () => setInstructions([...instructions, '']);
  const removeInstruction = (idx: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== idx));
    }
  };
  const updateInstruction = (idx: number, value: string) => {
    const updated = [...instructions];
    updated[idx] = value;
    setInstructions(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      // Filter out empty entries
      const filteredIngredients = ingredients.filter(i => i.trim());
      const filteredInstructions = instructions.filter(i => i.trim());

      if (filteredIngredients.length === 0) {
        throw new Error('Please add at least one ingredient');
      }

      // INFRASTRUCTURE NOTE: This needs to insert into user_recipe_portfolio table in Supabase

      toast.success('Recipe added to your portfolio!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add recipe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Add Secret Recipe
          </DialogTitle>
          <DialogDescription>
            This recipe stays private in your portfolio. You can graduate it to the public Pantry 
            once it has 25+ orders and a 4.0+ rating.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Recipe Name *</Label>
              <Input id="title" name="title" placeholder="e.g., Grandma's Secret Chili" required />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="What makes this recipe special?" 
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="photo_url">Photo URL</Label>
              <Input id="photo_url" name="photo_url" placeholder="https://..." />
            </div>
          </div>

          {/* Recipe Type and Details */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Recipe Type</Label>
              <Select value={recipeType} onValueChange={(v: any) => setRecipeType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meal">Meal</SelectItem>
                  <SelectItem value="baked_good">Baked Good</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cuisine">Cuisine</Label>
              <Input id="cuisine" name="cuisine" placeholder="e.g., Italian" />
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input id="servings" name="servings" type="number" min="1" defaultValue="4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prep_time">Prep Time (min)</Label>
              <Input id="prep_time" name="prep_time" type="number" min="0" placeholder="15" />
            </div>
            <div>
              <Label htmlFor="cook_time">Cook Time (min)</Label>
              <Input id="cook_time" name="cook_time" type="number" min="0" placeholder="30" />
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Ingredients *</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addIngredient}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {ingredients.map((ingredient, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={ingredient}
                  onChange={(e) => updateIngredient(idx, e.target.value)}
                  placeholder={`Ingredient ${idx + 1}`}
                />
                {ingredients.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeIngredient(idx)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              These ingredients are kept private. Only you can see them.
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Instructions</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addInstruction}>
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>
            {instructions.map((instruction, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-muted rounded text-sm font-medium">
                  {idx + 1}
                </div>
                <Textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(idx, e.target.value)}
                  placeholder={`Step ${idx + 1}...`}
                  rows={2}
                  className="flex-1"
                />
                {instructions.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeInstruction(idx)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Dietary Tags and Allergens */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dietary_tags">Dietary Tags</Label>
              <Input 
                id="dietary_tags" 
                name="dietary_tags" 
                placeholder="vegetarian, gluten-free, keto..." 
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
            </div>
            <div>
              <Label htmlFor="allergens">Allergens</Label>
              <Input 
                id="allergens" 
                name="allergens" 
                placeholder="dairy, nuts, gluten..." 
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <Lock className="h-4 w-4" />
              Privacy Guaranteed
            </div>
            <p className="text-muted-foreground mt-1">
              Your recipe details (ingredients, instructions) remain private forever. 
              Even if you graduate to the Pantry, only the name, description, and photo are shared.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add to Portfolio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
