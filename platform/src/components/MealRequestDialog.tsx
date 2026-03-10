/**
 * MEAL REQUEST DIALOG — Mark-Backed Bounty System
 * ================================================
 * Members can request meals they want to see offered.
 * 
 * Two modes:
 * 1. GENERAL REQUEST — "I'd like burgers this week in my area"
 *    - Browse The Pantry for recipes, vote with Marks
 *    - Marks locked for duration (backed by Joules)
 *    - If meal is offered and you decline: Marks returned (no penalty)
 *    - Early withdrawal: 10% penalty per day early
 *    - Full return after timeframe expires
 * 
 * 2. SPECIFIC REQUEST — "I want 10 burgers delivered Thursday"
 *    - Commit to buying if offered
 *    - If meal is offered and you don't buy: LOSE the Marks
 *    - Higher signal to chefs = higher priority
 * 
 * Minimum: 5 Marks for any request
 * Must have Joules backing in Stake Account
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  ChefHat,
  Calendar,
  MapPin,
  Coins,
  AlertTriangle,
  BookOpen,
  Target,
  Clock,
  Info,
} from "lucide-react";
import { getMemberCurrency, type MemberCurrency } from "@/lib/currencyService";

interface MealRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedDate?: Date;
}

interface PantryRecipe {
  id: string;
  title: string;
  cuisine: string | null;
  meal_type: string | null;
  total_time_minutes: number | null;
  photo_url: string | null;
}

const MIN_MARKS = 5;
const MAX_DURATION_DAYS = 7;
const EARLY_WITHDRAWAL_PENALTY_PER_DAY = 0.10; // 10% per day early

export function MealRequestDialog({ open, onOpenChange, preselectedDate }: MealRequestDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const queryClient = useQueryClient();
  
  // State
  const [requestType, setRequestType] = useState<"general" | "specific">("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<PantryRecipe | null>(null);
  const [customMealName, setCustomMealName] = useState("");
  const [marksAmount, setMarksAmount] = useState(MIN_MARKS);
  const [durationDays, setDurationDays] = useState(7);
  const [specificDate, setSpecificDate] = useState<Date>(preselectedDate || addDays(new Date(), 1));
  const [portionCount, setPortionCount] = useState(1);
  const [postalCode, setPostalCode] = useState("");
  
  // Fetch member currency (to check available Marks/Joules)
  const { data: currency, isLoading: currencyLoading } = useQuery({
    queryKey: ['member-currency'],
    queryFn: getMemberCurrency,
    enabled: !!user,
  });
  
  // Search Pantry recipes
  const { data: recipes, isLoading: recipesLoading } = useQuery({
    queryKey: ['pantry-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('pantry_recipes')
        .select('id, title, cuisine, meal_type, total_time_minutes, photo_url')
        .or(`title.ilike.%${searchQuery}%,cuisine.ilike.%${searchQuery}%`)
        .limit(10);
      
      if (error) throw error;
      return data as PantryRecipe[];
    },
    enabled: searchQuery.length >= 2,
  });
  
  // Submit request mutation
  const submitRequest = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      if (!currency) throw new Error("Currency data not loaded");
      
      const mealName = selectedRecipe?.title || customMealName;
      if (!mealName) throw new Error("Please select or enter a meal name");
      
      // Verify sufficient Marks backed by Joules
      if (marksAmount > currency.joules) {
        throw new Error(`You need ${marksAmount} Joules in your Stake Account to back this request. You have ${currency.joules}.`);
      }
      
      // Create the request
      const { error } = await supabase
        .from('lmd_meal_requests')
        .insert({
          requester_id: user.id,
          meal_name: mealName,
          pantry_recipe_id: selectedRecipe?.id || null,
          request_type: requestType,
          marks_committed: marksAmount,
          duration_days: requestType === 'general' ? durationDays : null,
          specific_date: requestType === 'specific' ? format(specificDate, 'yyyy-MM-dd') : null,
          portion_count: requestType === 'specific' ? portionCount : null,
          postal_code: postalCode || null,
          status: 'active',
          expires_at: format(
            requestType === 'general' 
              ? addDays(new Date(), durationDays) 
              : specificDate,
            'yyyy-MM-dd'
          ),
        });
      
      if (error) throw error;
      
      // Lock the Marks (create transaction)
      const { error: txError } = await supabase
        .from('marks_transactions')
        .insert({
          user_id: user.id,
          amount: -marksAmount,
          reason: `Meal request: ${mealName}`,
          reason_type: 'meal_request_lock',
        });
      
      if (txError) throw txError;
    },
    onSuccess: () => {
      toast.success("Request submitted! Chefs in your area can now see it.");
      queryClient.invalidateQueries({ queryKey: ['member-currency'] });
      queryClient.invalidateQueries({ queryKey: ['lmd-requests'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  
  // Calculate early withdrawal penalty
  const calculateWithdrawalPenalty = (daysRemaining: number, totalDays: number) => {
    const daysEarly = totalDays - daysRemaining;
    const penalty = Math.min(daysEarly * EARLY_WITHDRAWAL_PENALTY_PER_DAY, 1);
    return Math.round(marksAmount * penalty);
  };
  
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              Request a Meal
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Join for $5/year to request meals and back them with Marks.
            </p>
            <Button onClick={() => openOnboard({ reason: "request meals", actionLabel: "Join", membershipIncluded: true })}>
              Join Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  const hasEnoughJoules = currency && marksAmount <= currency.joules;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            Request a Meal
          </DialogTitle>
          <DialogDescription>
            Put Marks behind your request. Chefs see demand and know it's real.
          </DialogDescription>
        </DialogHeader>
        
        {/* Currency Status */}
        <div className="flex gap-4 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-sm">
              <strong>{currency?.marks ?? 0}</strong> Marks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              <strong>{currency?.joules ?? 0}</strong> Joules (backing)
            </span>
          </div>
        </div>
        
        {/* Request Type Tabs */}
        <Tabs value={requestType} onValueChange={(v) => setRequestType(v as "general" | "specific")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="gap-2">
              <BookOpen className="h-4 w-4" />
              General Vote
            </TabsTrigger>
            <TabsTrigger value="specific" className="gap-2">
              <Target className="h-4 w-4" />
              Specific Order
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm">
              <Info className="h-4 w-4 inline mr-2 text-blue-400" />
              <strong>General Vote:</strong> Show chefs what you want. Marks locked for your timeframe.
              If a chef offers the meal, you can buy with Credits or pass — no penalty for passing.
            </div>
            
            {/* Duration Selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                How long should this request stay active?
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[durationDays]}
                  onValueChange={([v]) => setDurationDays(v)}
                  min={1}
                  max={MAX_DURATION_DAYS}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="outline" className="min-w-[80px] justify-center">
                  {durationDays} day{durationDays > 1 ? 's' : ''}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Early withdrawal: 10% penalty per day early. Full return after {durationDays} days.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="specific" className="space-y-4 mt-4">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm">
              <AlertTriangle className="h-4 w-4 inline mr-2 text-amber-400" />
              <strong>Specific Order:</strong> Commit to buying. If a chef offers this meal on your date
              and you don't purchase it, you <strong>lose your Marks</strong>.
            </div>
            
            {/* Specific Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                What date do you need this meal?
              </Label>
              <Input
                type="date"
                value={format(specificDate, 'yyyy-MM-dd')}
                onChange={(e) => setSpecificDate(new Date(e.target.value))}
                min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              />
            </div>
            
            {/* Portion Count */}
            <div className="space-y-2">
              <Label>How many portions?</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[portionCount]}
                  onValueChange={([v]) => setPortionCount(v)}
                  min={1}
                  max={20}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="outline" className="min-w-[80px] justify-center">
                  {portionCount} portion{portionCount > 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Meal Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            What meal do you want?
          </Label>
          
          {/* Search The Pantry */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search The Pantry for recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Search Results */}
          {recipes && recipes.length > 0 && (
            <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
              {recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setCustomMealName("");
                    setSearchQuery("");
                  }}
                  className={`w-full p-3 text-left hover:bg-muted/50 flex items-center gap-3 ${
                    selectedRecipe?.id === recipe.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                  }`}
                >
                  {recipe.photo_url ? (
                    <img src={recipe.photo_url} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                      <ChefHat className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{recipe.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {recipe.cuisine} • {recipe.total_time_minutes || '?'} min
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Selected Recipe Display */}
          {selectedRecipe && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3">
              {selectedRecipe.photo_url ? (
                <img src={selectedRecipe.photo_url} alt="" className="w-12 h-12 rounded object-cover" />
              ) : (
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium">{selectedRecipe.title}</div>
                <div className="text-xs text-muted-foreground">{selectedRecipe.cuisine}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRecipe(null)}>
                Change
              </Button>
            </div>
          )}
          
          {/* Or custom meal name */}
          {!selectedRecipe && (
            <div className="space-y-2">
              <div className="text-center text-xs text-muted-foreground">— or describe what you want —</div>
              <Input
                placeholder="e.g., 'Homemade lasagna' or 'Healthy chicken bowl'"
                value={customMealName}
                onChange={(e) => setCustomMealName(e.target.value)}
              />
            </div>
          )}
        </div>
        
        {/* Location */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Your area (optional)
          </Label>
          <Input
            placeholder="ZIP / Postal code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            maxLength={10}
          />
          <p className="text-xs text-muted-foreground">
            Helps match you with nearby chefs
          </p>
        </div>
        
        {/* Marks Commitment */}
        <div className="space-y-3 p-4 rounded-lg border-2 border-dashed border-amber-500/30 bg-amber-500/5">
          <Label className="flex items-center gap-2 text-amber-200">
            <Coins className="h-4 w-4 text-amber-400" />
            How many Marks to commit?
          </Label>
          
          <div className="flex items-center gap-4">
            <Slider
              value={[marksAmount]}
              onValueChange={([v]) => setMarksAmount(v)}
              min={MIN_MARKS}
              max={Math.max(MIN_MARKS, currency?.joules || MIN_MARKS)}
              step={1}
              className="flex-1"
            />
            <Badge 
              variant="outline" 
              className={`min-w-[100px] justify-center ${!hasEnoughJoules ? 'border-red-500 text-red-400' : 'border-amber-500 text-amber-400'}`}
            >
              {marksAmount} Marks
            </Badge>
          </div>
          
          {!hasEnoughJoules && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Not enough Joules in Stake Account. You have {currency?.joules || 0}.
            </p>
          )}
          
          <p className="text-xs text-muted-foreground">
            Higher Marks = higher priority for chefs. Minimum: {MIN_MARKS} Marks.
            <br />
            Your Marks are backed 1:1 by Joules in your Stake Account.
          </p>
        </div>
        
        {/* Summary */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
          <div className="font-medium">Summary</div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Request type:</span>
            <span>{requestType === 'general' ? 'General Vote' : 'Specific Order'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Meal:</span>
            <span>{selectedRecipe?.title || customMealName || '(not selected)'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Marks committed:</span>
            <span className="text-amber-400">{marksAmount} Marks</span>
          </div>
          {requestType === 'general' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span>{durationDays} days</span>
            </div>
          )}
          {requestType === 'specific' && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span>{format(specificDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Portions:</span>
                <span>{portionCount}</span>
              </div>
            </>
          )}
          
          {requestType === 'specific' && (
            <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs">
              <AlertTriangle className="h-3 w-3 inline mr-1 text-amber-400" />
              If the meal is offered and you don't buy, you lose {marksAmount} Marks.
            </div>
          )}
        </div>
        
        {/* Submit */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => submitRequest.mutate()}
            disabled={
              submitRequest.isPending ||
              (!selectedRecipe && !customMealName) ||
              !hasEnoughJoules
            }
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {submitRequest.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
