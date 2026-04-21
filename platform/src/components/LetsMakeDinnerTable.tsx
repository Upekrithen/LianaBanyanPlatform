import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChefHat, Clock, MapPin, Users, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { MealOrderDialog } from "@/components/MealOrderDialog";

interface LmdMeal {
  id: string;
  chef_id: string;
  meal_name: string;
  description: string | null;
  cuisine: string | null;
  allergens: string[] | null;
  portions_available: number;
  portions_claimed: number;
  price_per_portion: number;
  pickup_date: string;
  pickup_time: string | null;
  pickup_location: string | null;
  pickup_instructions: string | null;
  is_charity: boolean;
  status: string;
  lmd_chefs: {
    display_name: string;
    rating: number | null;
    is_verified: boolean;
  } | null;
}

export function LetsMakeDinnerTable() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: meals, isLoading } = useQuery({
    queryKey: ['lmd-meals', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('lmd_meals')
        .select(`
          *,
          lmd_chefs:chef_id (display_name, rating, is_verified)
        `)
        .eq('status', 'available')
        .eq('pickup_date', dateStr)
        .order('pickup_time', { ascending: true });

      if (error) throw error;
      return data as LmdMeal[];
    }
  });

  const remaining = (meal: LmdMeal) => meal.portions_available - meal.portions_claimed;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Let's Make Dinner
            </CardTitle>
            <CardDescription>
              Browse homemade meals from your community
            </CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12">Loading meals...</div>
        ) : !meals || meals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No meals available for {format(selectedDate, 'MMMM d, yyyy')}
          </div>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {meals.map((meal) => (
                <Card
                  key={meal.id}
                  className={cn(
                    "flex-shrink-0 w-[280px] overflow-hidden transition-all hover:shadow-lg",
                    "border-2 hover:border-primary/50",
                    meal.is_charity && "border-red-500/20 bg-red-500/5"
                  )}
                >
                  <div className="relative h-48 bg-muted">
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      {meal.is_charity && (
                        <Badge className="bg-red-500/90">
                          <Heart className="h-3 w-3 mr-1" />
                          Charity
                        </Badge>
                      )}
                      <Badge className="bg-background/90 backdrop-blur">
                        <Users className="h-3 w-3 mr-1" />
                        {remaining(meal)} left
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {meal.meal_name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {meal.description || meal.cuisine || "Homemade meal"}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ChefHat className="h-4 w-4" />
                        <span className="truncate">
                          {meal.lmd_chefs?.display_name || 'Community Chef'}
                          {meal.lmd_chefs?.is_verified && ' ✓'}
                        </span>
                      </div>
                      {meal.pickup_time && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{meal.pickup_time}</span>
                        </div>
                      )}
                      {meal.pickup_location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{meal.pickup_location}</span>
                        </div>
                      )}
                    </div>

                    {meal.allergens && meal.allergens.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {meal.allergens.map((a) => (
                          <Badge key={a} variant="outline" className="text-xs">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {meal.is_charity ? (
                          <span className="text-red-500">Free</span>
                        ) : (
                          <>
                            ${meal.price_per_portion}{" "}
                            <span className="text-sm text-muted-foreground font-normal">
                              per portion
                            </span>
                          </>
                        )}
                      </div>
                      <MealOrderDialog
                        mealId={meal.id}
                        mealName={meal.meal_name}
                        mealPrice={meal.price_per_portion}
                        providerId={meal.chef_id}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
