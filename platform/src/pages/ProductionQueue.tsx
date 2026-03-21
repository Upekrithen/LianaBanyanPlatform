import { ProductionQueueDisplay } from "@/components/ProductionQueueDisplay";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function ProductionQueue() {
  const { toast } = useToast();
  const [calculating, setCalculating] = useState(false);

  const handleRecalculate = async () => {
    setCalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-value-ratings');
      
      if (error) throw error;
      
      toast({
        title: "Queue Updated!",
        description: `Recalculated ${data.ratings_calculated} product ratings`,
      });
    } catch (error: any) {
      console.error('Error recalculating:', error);
      toast({
        title: "Calculation Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <PortalPageLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Production Queue</h1>
          <p className="text-muted-foreground">
            Transparent, AI-optimized scheduling based on real demand
          </p>
        </div>
        <Button 
          onClick={handleRecalculate} 
          disabled={calculating}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${calculating ? 'animate-spin' : ''}`} />
          {calculating ? 'Calculating...' : 'Recalculate Queue'}
        </Button>
      </div>

      <ProductionQueueDisplay />
    </PortalPageLayout>
  );
}