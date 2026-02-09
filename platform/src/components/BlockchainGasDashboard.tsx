import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fuel, TrendingUp, DollarSign, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GasStats {
  totalGasSpent: number;
  availableBudget: number;
  gasPercentage: number;
  recentTransactions: Array<{
    id: string;
    transaction_type: string;
    total_cost_usd: number;
    created_at: string;
    transaction_hash: string | null;
  }>;
}

interface BlockchainGasDashboardProps {
  projectId?: string;
}

export function BlockchainGasDashboard({ projectId }: BlockchainGasDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GasStats | null>(null);

  useEffect(() => {
    loadGasStats();
  }, [projectId]);

  const loadGasStats = async () => {
    try {
      setLoading(true);

      // Get gas budget from LB pool
      const { data: poolData, error: poolError } = await supabase
        .from("lb_funding_pool")
        .select("total_pool_amount, allocated_to_gas, gas_budget_percentage")
        .single();

      if (poolError) throw poolError;

      const totalBudget = (poolData.total_pool_amount * poolData.gas_budget_percentage) / 100;
      const availableBudget = totalBudget - poolData.allocated_to_gas;

      // Get recent gas transactions
      let query = supabase
        .from("blockchain_gas_costs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data: gasData, error: gasError } = await query;

      if (gasError) throw gasError;

      setStats({
        totalGasSpent: poolData.allocated_to_gas,
        availableBudget,
        gasPercentage: poolData.gas_budget_percentage,
        recentTransactions: gasData || [],
      });
    } catch (error) {
      console.error("Error loading gas stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const getTxTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      contract_deploy: "Contract Deploy",
      batch_mint: "Batch Mint",
      transfer: "Transfer",
      metadata_update: "Metadata Update",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Blockchain Gas Budget
          </CardTitle>
          <CardDescription>
            Funded from LB Pool ({stats.gasPercentage}% allocation)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Total Spent</span>
              </div>
              <p className="text-2xl font-bold">{formatUSD(stats.totalGasSpent)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Available Budget</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {formatUSD(stats.availableBudget)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Transactions</span>
              </div>
              <p className="text-2xl font-bold">{stats.recentTransactions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats.recentTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Gas Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{getTxTypeLabel(tx.transaction_type)}</Badge>
                    {tx.transaction_hash && (
                      <a
                        href={`https://basescan.org/tx/${tx.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        {tx.transaction_hash.substring(0, 10)}...
                      </a>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatUSD(tx.total_cost_usd)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
