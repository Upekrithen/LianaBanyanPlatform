import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Wallet } from "lucide-react";
import { format } from "date-fns";

interface FundingPool {
  id: string;
  total_pool_amount: number;
  allocated_to_eoi: number;
  allocated_to_gas: number;
  available_for_eoi: number;
  medallion_contribution_percentage: number;
  gas_budget_percentage: number;
  last_contribution_at: string | null;
}

export function LBFundingPoolDisplay() {
  const [pool, setPool] = useState<FundingPool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoolData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadPoolData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPoolData = async () => {
    const { data, error } = await supabase
      .from("lb_funding_pool")
      .select("*")
      .single();

    if (error) {
      console.error("Error loading pool data:", error);
    } else {
      setPool(data);
    }
    setLoading(false);
  };

  if (loading || !pool) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading pool data...</div>
        </CardContent>
      </Card>
    );
  }

  const utilizationRate = pool.total_pool_amount > 0
    ? (pool.allocated_to_eoi / pool.total_pool_amount) * 100
    : 0;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <CardTitle>LB Funding Pool</CardTitle>
          </div>
          <Badge variant="secondary" className="text-lg font-mono">
            {pool.medallion_contribution_percentage.toFixed(1)}%
          </Badge>
        </div>
        <CardDescription>
          Medallion pledges contribute {pool.medallion_contribution_percentage.toFixed(1)}% to fund EOI conversions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pool Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Total Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pool.total_pool_amount.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Credits accumulated</p>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {pool.available_for_eoi.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Ready for EOI conversion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">EOI Allocated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pool.allocated_to_eoi.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Currently vesting</p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Gas Allocated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${pool.allocated_to_gas.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">{pool.gas_budget_percentage}% budget</p>
            </CardContent>
          </Card>
        </div>

        {/* Utilization Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pool Utilization</span>
            <span className="font-medium">{utilizationRate.toFixed(1)}%</span>
          </div>
          <Progress value={utilizationRate} className="h-2" />
        </div>

        {/* Last Contribution */}
        {pool.last_contribution_at && (
          <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Last Contribution</span>
            <span className="font-medium">
              {format(new Date(pool.last_contribution_at), "MMM d, HH:mm")}
            </span>
          </div>
        )}

        {/* Info Box */}
        <div className="p-3 bg-muted/50 rounded-lg text-sm">
          <p className="font-medium mb-1">How the Pool Works:</p>
          <ul className="space-y-1 text-muted-foreground text-xs">
            <li>• {pool.medallion_contribution_percentage.toFixed(1)}% of all Medallion pledges go to this pool</li>
            <li>• Pool funds enable EOI credits to vest into real credits</li>
            <li>• {pool.gas_budget_percentage}% allocated for blockchain gas fees (Base L2)</li>
            <li>• Creates a sustainable, self-funding conversion system</li>
            <li>• Higher pool = more EOI conversions can happen simultaneously</li>
            <li>• No direct cost to LB - funded by project success</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
