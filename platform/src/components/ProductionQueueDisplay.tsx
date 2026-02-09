import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Calendar, Zap, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ValueRating {
  id: string;
  product_id: string;
  value_score: number;
  node_availability_score: number;
  priority_boost: number;
  demand_factor: number;
  cycle_fit_score: number;
  ghost_data_weight: number;
  preorder_count: number;
  never_produced: boolean;
  queue_position: number;
  calculation_details: any;
  products: {
    name: string;
    product_sku: string;
  };
}

export function ProductionQueueDisplay() {
  const [queueData, setQueueData] = useState<ValueRating[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadQueueData = async () => {
    try {
      const { data, error } = await supabase
        .from('production_value_ratings')
        .select(`
          *,
          products (name, product_sku)
        `)
        .order('queue_position', { ascending: true })
        .limit(20);

      if (error) throw error;
      setQueueData(data || []);
    } catch (error) {
      console.error('Error loading queue:', error);
      toast({
        title: "Error loading production queue",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueueData();

    // Set up realtime subscription
    const channel = supabase
      .channel('value-ratings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_value_ratings'
        },
        () => {
          loadQueueData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 40) return 'text-green-600';
    if (score >= 25) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-yellow-500">🥇 Next Up!</Badge>;
    if (position === 2) return <Badge className="bg-gray-400">🥈 Second</Badge>;
    if (position === 3) return <Badge className="bg-amber-700">🥉 Third</Badge>;
    if (position <= 10) return <Badge variant="secondary">Top 10</Badge>;
    return <Badge variant="outline">Position {position}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Production Queue...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Production Queue
          </CardTitle>
          <CardDescription>
            Real-time transparent scoring based on demand, availability, and priority. 
            Want to move your favorite product up? Place an order and watch it climb!
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {queueData.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{item.products.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{item.products.product_sku}</p>
                </div>
                {getPositionBadge(item.queue_position)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Value Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Value Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(item.value_score)}`}>
                    {item.value_score.toFixed(1)}
                  </span>
                </div>
                <Progress value={(item.value_score / 60) * 100} className="h-2" />
              </div>

              {/* Factor Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    Node Availability
                  </div>
                  <p className="text-sm font-semibold">
                    {(item.node_availability_score * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.calculation_details?.available_machine_slots || 0} slots
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Target className="h-3 w-3" />
                    Priority Boost
                  </div>
                  <p className="text-sm font-semibold">
                    {item.priority_boost.toFixed(1)}x
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.never_produced ? 'Never made' : 'Repeat run'}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Demand Factor
                  </div>
                  <p className="text-sm font-semibold">
                    {item.demand_factor.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.preorder_count} preorders
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Ghost Data
                  </div>
                  <p className="text-sm font-semibold">
                    {item.ghost_data_weight.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.calculation_details?.ghost_units || 0} projected
                  </p>
                </div>
              </div>

              {/* Impact Message */}
              {item.queue_position > 3 && (
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    💡 <strong>Need {Math.ceil((queueData[2].value_score - item.value_score) / 0.15)} more preorders</strong> to jump to Top 3!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}