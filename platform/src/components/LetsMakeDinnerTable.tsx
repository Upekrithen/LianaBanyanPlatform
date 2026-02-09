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
import { Calendar as CalendarIcon, ChefHat, Clock, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { MealOrderDialog } from "@/components/MealOrderDialog";

interface MealOffering {
  id: string;
  meal_name: string;
  description: string;
  photo_url: string | null;
  ingredients: any;
  portions_available: number;
  ready_at: string;
  pickup_location: string;
  preorder_price_credits: number;
  provider_id: string;
  profiles: {
    full_name: string;
  };
}

export function LetsMakeDinnerTable() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: meals, isLoading } = useQuery({
    queryKey: ['meal-offerings', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('meal_offerings')
        .select(`
          *,
          profiles:provider_id (full_name)
        `)
        .eq('status', 'available')
        .gte('ready_at', startOfDay.toISOString())
        .lte('ready_at', endOfDay.toISOString())
        .order('ready_at', { ascending: true });
      
      if (error) throw error;
      return data as MealOffering[];
    }
  });


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
                    "border-2 hover:border-primary/50"
                  )}
                >
                  <div className="relative h-48 bg-muted">
                    {meal.photo_url ? (
                      <img 
                        src={meal.photo_url} 
                        alt={meal.meal_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-background/90 backdrop-blur">
                        <Users className="h-3 w-3 mr-1" />
                        {meal.portions_available} left
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {meal.meal_name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {meal.description}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ChefHat className="h-4 w-4" />
                        <span className="truncate">{meal.profiles?.full_name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(meal.ready_at), 'h:mm a')}</span>
                      </div>
                      {meal.pickup_location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{meal.pickup_location}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        ${meal.preorder_price_credits} <span className="text-sm text-muted-foreground font-normal">per portion</span>
                      </div>
                      <MealOrderDialog
                        mealId={meal.id}
                        mealName={meal.meal_name}
                        mealPrice={meal.preorder_price_credits}
                        providerId={meal.provider_id}
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
