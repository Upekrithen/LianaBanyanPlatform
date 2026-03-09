/**
 * Recipe Submission Form
 * ======================
 * For adding recipes to The Pantry.
 * Requires: photo, title, ingredients, steps
 * 
 * Now includes Shadow Marks bounty preview based on category selection!
 */

import { useState, useEffect, useMemo } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Minus, Upload, Camera, Info, Sparkles, TrendingUp } from "lucide-react";
import { CREDIT_CONSTANTS, formatCredits } from "@/lib/pantryCredits";
import { getCategoryBounties, BOUNTY_TIERS, type CategoryBounty } from "@/lib/shadowMarksService";
import { cn } from "@/lib/utils";

interface RecipeSubmissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedCuisine?: string;
  preselectedMealType?: string;
}

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  preparation?: string;
}

interface Step {
  instruction: string;
  tip?: string;
}

const UNITS = [
  'cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l',
  'piece', 'clove', 'whole', 'slice', 'pinch', 'dash', 'to taste'
];

const CUISINES = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese',
  'Thai', 'Mediterranean', 'Soul Food', 'French', 'Korean', 'Vietnamese',
  'Greek', 'Spanish', 'Middle Eastern', 'Caribbean', 'African', 'Other'
];

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'appetizer', label: 'Appetizer' },
  { value: 'side', label: 'Side Dish' },
  { value: 'beverage', label: 'Beverage' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy (< 30 min, basic skills)' },
  { value: 'medium', label: 'Medium (30-60 min, some skill)' },
  { value: 'hard', label: 'Hard (1-2 hrs, experienced)' },
  { value: 'expert', label: 'Expert (2+ hrs, professional)' },
];

const DIETARY_TAGS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 
  'Low-Carb', 'Paleo', 'Whole30', 'Nut-Free', 'Kosher', 'Halal'
];

const ALLERGENS = [
  'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts',
  'Wheat', 'Soy', 'Sesame'
];

export function RecipeSubmissionForm({ 
  open, 
  onOpenChange,
  preselectedCuisine,
  preselectedMealType, 
}: RecipeSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: '', unit: 'cup' }
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { instruction: '' }
  ]);
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState(preselectedCuisine || '');
  const [selectedMealType, setSelectedMealType] = useState(preselectedMealType || '');
  const queryClient = useQueryClient();

  // Fetch category bounties to show Shadow Marks preview
  const { data: bounties } = useQuery({
    queryKey: ['category-bounties'],
    queryFn: getCategoryBounties,
  });

  // Find matching bounty for selected cuisine/meal type
  const matchingBounty = useMemo(() => {
    if (!bounties || !selectedCuisine || !selectedMealType) return null;
    
    // Try exact match first
    let match = bounties.find(b => 
      b.cuisine.toLowerCase() === selectedCuisine.toLowerCase() &&
      b.mealType.toLowerCase() === selectedMealType.toLowerCase()
    );
    
    // Fall back to "Any" cuisine match
    if (!match) {
      match = bounties.find(b => 
        b.cuisine === 'Any' &&
        b.mealType.toLowerCase() === selectedMealType.toLowerCase()
      );
    }
    
    return match;
  }, [bounties, selectedCuisine, selectedMealType]);

  // Update selections when preselected values change
  useEffect(() => {
    if (preselectedCuisine) setSelectedCuisine(preselectedCuisine);
    if (preselectedMealType) setSelectedMealType(preselectedMealType);
  }, [preselectedCuisine, preselectedMealType]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: 'cup' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, { instruction: '' }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, field: keyof Step, value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const toggleDietaryTag = (tag: string) => {
    if (selectedDietaryTags.includes(tag)) {
      setSelectedDietaryTags(selectedDietaryTags.filter(t => t !== tag));
    } else {
      setSelectedDietaryTags([...selectedDietaryTags, tag]);
    }
  };

  const toggleAllergen = (allergen: string) => {
    if (selectedAllergens.includes(allergen)) {
      setSelectedAllergens(selectedAllergens.filter(a => a !== allergen));
    } else {
      setSelectedAllergens([...selectedAllergens, allergen]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to submit recipes');

      // Validate required fields
      const title = formData.get('title') as string;
      if (!title) throw new Error('Recipe title is required');

      const validIngredients = ingredients.filter(i => i.name.trim());
      if (validIngredients.length === 0) throw new Error('At least one ingredient is required');

      const validSteps = steps.filter(s => s.instruction.trim());
      if (validSteps.length === 0) throw new Error('At least one step is required');

      // Create recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('pantry_recipes')
        .insert({
          creator_id: user.id,
          title,
          description: formData.get('description') as string || null,
          photo_url: photoUrl || null,
          prep_time_minutes: parseInt(formData.get('prep_time') as string) || null,
          cook_time_minutes: parseInt(formData.get('cook_time') as string) || null,
          servings: parseInt(formData.get('servings') as string) || 4,
          difficulty: formData.get('difficulty') as string || null,
          cuisine: formData.get('cuisine') as string || null,
          meal_type: formData.get('meal_type') as string || null,
          dietary_tags: selectedDietaryTags,
          allergens: selectedAllergens,
          status: 'pending',
          is_approved: false,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Add ingredients
      if (validIngredients.length > 0) {
        const { error: ingredientsError } = await supabase
          .from('pantry_recipe_ingredients')
          .insert(
            validIngredients.map((ing, index) => ({
              recipe_id: recipe.id,
              ingredient_name: ing.name.trim(),
              quantity: parseFloat(ing.quantity) || null,
              unit: ing.unit,
              preparation: ing.preparation?.trim() || null,
              normalized_name: ing.name.trim().toLowerCase(),
              sort_order: index,
            }))
          );

        if (ingredientsError) throw ingredientsError;
      }

      // Add steps
      if (validSteps.length > 0) {
        const { error: stepsError } = await supabase
          .from('pantry_recipe_steps')
          .insert(
            validSteps.map((step, index) => ({
              recipe_id: recipe.id,
              step_number: index + 1,
              instruction: step.instruction.trim(),
              tip: step.tip?.trim() || null,
            }))
          );

        if (stepsError) throw stepsError;
      }

      toast.success('Recipe submitted! It will appear after approval.');
      queryClient.invalidateQueries({ queryKey: ['pantry-recipes'] });
      onOpenChange(false);
      
      // Reset form
      setPhotoUrl('');
      setIngredients([{ name: '', quantity: '', unit: 'cup' }]);
      setSteps([{ instruction: '' }]);
      setSelectedDietaryTags([]);
      setSelectedAllergens([]);
    } catch (error: any) {
      toast.error('Failed to submit recipe: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share a Recipe</DialogTitle>
          <DialogDescription>
            Add your recipe to The Pantry. Earn credits when others cook it!
          </DialogDescription>
        </DialogHeader>

        {/* Credit Info */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-emerald-500" />
            <span>
              Earn {formatCredits(CREDIT_CONSTANTS.BASE_RATE)}-{formatCredits(CREDIT_CONSTANTS.BASE_RATE * CREDIT_CONSTANTS.MAX_VOTE_MULTIPLIER)} per use, up to {formatCredits(CREDIT_CONSTANTS.LIFETIME_CAP)} lifetime
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Recipe Title *</Label>
              <Input id="title" name="title" placeholder="e.g., Grandma's Chicken Pot Pie" required />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="What makes this recipe special? Any story behind it?" rows={3} />
            </div>

            {/* Photo URL (simplified for now - could add upload later) */}
            <div>
              <Label htmlFor="photo_url">Photo URL</Label>
              <div className="flex gap-2">
                <Input 
                  id="photo_url" 
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg" 
                />
                <Button type="button" variant="outline" size="icon">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Paste an image URL or upload coming soon
              </p>
            </div>
          </div>

          {/* Time & Servings */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="prep_time">Prep Time (min)</Label>
              <Input id="prep_time" name="prep_time" type="number" min="0" placeholder="15" />
            </div>
            <div>
              <Label htmlFor="cook_time">Cook Time (min)</Label>
              <Input id="cook_time" name="cook_time" type="number" min="0" placeholder="30" />
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input id="servings" name="servings" type="number" min="1" defaultValue="4" />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select name="difficulty">
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Classification + Shadow Marks Preview */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cuisine">Cuisine</Label>
                <Select 
                  name="cuisine" 
                  value={selectedCuisine}
                  onValueChange={setSelectedCuisine}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUISINES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="meal_type">Meal Type</Label>
                <Select 
                  name="meal_type"
                  value={selectedMealType}
                  onValueChange={setSelectedMealType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Shadow Marks Bounty Preview */}
            {matchingBounty && matchingBounty.shadowMarksAvailable > 0 && (
              <div className={cn(
                "p-3 rounded-lg border transition-all animate-in fade-in-50 duration-300",
                BOUNTY_TIERS[matchingBounty.shelfStatus].bg,
                "border-amber-500/30"
              )}>
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">You'll earn</span>
                      <Badge className={cn(
                        "font-bold",
                        BOUNTY_TIERS[matchingBounty.shelfStatus].bg,
                        BOUNTY_TIERS[matchingBounty.shelfStatus].color
                      )}>
                        {matchingBounty.shadowMarksAvailable} Shadow Marks
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {matchingBounty.bountyMessage}
                      {matchingBounty.recipeCount === 0 && " — Be the pioneer!"}
                      {matchingBounty.recipeCount > 0 && ` (${matchingBounty.recipeCount} recipes in category)`}
                    </p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
                </div>
              </div>
            )}

            {/* No bounty available message */}
            {matchingBounty && matchingBounty.shadowMarksAvailable === 0 && (
              <div className="p-3 rounded-lg bg-muted/30 border border-muted text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  This category is well-stocked ({matchingBounty.recipeCount} recipes). 
                  No bonus Shadow Marks, but you'll still earn credits per use!
                </span>
              </div>
            )}
          </div>

          {/* Dietary Tags */}
          <div>
            <Label>Dietary Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DIETARY_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleDietaryTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedDietaryTags.includes(tag)
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Allergens */}
          <div>
            <Label>Contains Allergens</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ALLERGENS.map(allergen => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => toggleAllergen(allergen)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedAllergens.includes(allergen)
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Ingredients *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Quantity"
                    value={ing.quantity}
                    onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                    className="w-20"
                  />
                  <Select 
                    value={ing.unit} 
                    onValueChange={(val) => updateIngredient(index, 'unit', val)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Ingredient name"
                    value={ing.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Prep (optional)"
                    value={ing.preparation || ''}
                    onChange={(e) => updateIngredient(index, 'preparation', e.target.value)}
                    className="w-28"
                  />
                  {ingredients.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Instructions *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder={`Step ${index + 1} instructions...`}
                      value={step.instruction}
                      onChange={(e) => updateStep(index, 'instruction', e.target.value)}
                      rows={2}
                    />
                    <Input
                      placeholder="Pro tip (optional)"
                      value={step.tip || ''}
                      onChange={(e) => updateStep(index, 'tip', e.target.value)}
                    />
                  </div>
                  {steps.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Recipe'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
