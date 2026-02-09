import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function CreateMealOfferingDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const mealData = {
      meal_name: formData.get('meal_name') as string,
      description: formData.get('description') as string,
      ingredients: JSON.parse(formData.get('ingredients') as string || '[]'),
      recipe: formData.get('recipe') as string,
      portions_total: parseInt(formData.get('portions') as string),
      portions_available: parseInt(formData.get('portions') as string),
      ready_at: formData.get('ready_at') as string,
      pickup_location: formData.get('pickup_location') as string,
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the Let's Make Dinner initiative ID
      const { data: initiative } = await supabase
        .from('initiative_projects')
        .select('id')
        .eq('category', 'lets_make_dinner')
        .single();

      if (!initiative) throw new Error('Initiative not found');

      const { error } = await supabase
        .from('meal_offerings')
        .insert({
          ...mealData,
          provider_id: user.id,
          initiative_id: initiative.id,
          status: 'available',
        });

      if (error) throw error;

      toast.success('Meal offering created!');
      queryClient.invalidateQueries({ queryKey: ['meal-offerings'] });
      setOpen(false);
      e.currentTarget.reset();
    } catch (error: any) {
      toast.error('Failed to create meal offering: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Offer a Meal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Meal Offering</DialogTitle>
          <DialogDescription>
            Share a homemade meal with your community. You'll earn 5 credits per portion sold.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="meal_name">Meal Name *</Label>
            <Input
              id="meal_name"
              name="meal_name"
              placeholder="e.g., Homemade Lasagna"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description of your meal"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="ingredients">Ingredients (JSON array) *</Label>
            <Textarea
              id="ingredients"
              name="ingredients"
              placeholder='["pasta", "tomato sauce", "cheese", "ground beef"]'
              required
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter ingredients as a JSON array
            </p>
          </div>

          <div>
            <Label htmlFor="recipe">Recipe (optional)</Label>
            <Textarea
              id="recipe"
              name="recipe"
              placeholder="Share your recipe if you'd like..."
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="portions">Number of Portions *</Label>
              <Input
                id="portions"
                name="portions"
                type="number"
                min="1"
                placeholder="4"
                required
              />
            </div>

            <div>
              <Label htmlFor="ready_at">Ready At *</Label>
              <Input
                id="ready_at"
                name="ready_at"
                type="datetime-local"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pickup_location">Pickup Location</Label>
            <Input
              id="pickup_location"
              name="pickup_location"
              placeholder="e.g., Downtown Node, 123 Main St"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Offering'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
