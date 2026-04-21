import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, TrendingUp, Database, Zap, HardDrive, Activity } from "lucide-react";
import { toast } from "sonner";

interface CostSummary {
  total_cost_usd: number;
  db_cost_usd: number;
  api_cost_usd: number;
  storage_cost_usd: number;
  gas_cost_usd: number;
  total_api_calls: number;
  total_db_operations: number;
  total_storage_bytes: number;
  period_month: string;
}

interface ResourceUsage {
  portal: string;
  resource_type: string;
  usage_count: number;
  cost_usd: number;
  period_start: string;
}

interface ApiUsageLog {
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  bytes_transferred: number;
  created_at: string;
}

export default function ProjectCostDashboard({ projectId }: { projectId: string }) {
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) + '-01'
  );

  useEffect(() => {
    loadCostData();
  }, [projectId, selectedMonth]);

  const loadCostData = async () => {
    try {
      setLoading(true);

      // Load cost summary
      const { data: summary, error: summaryError } = await supabase
        .from('project_cost_summary')
        .select('*')
        .eq('project_id', projectId)
        .eq('period_month', selectedMonth)
        .maybeSingle();

      if (summaryError) throw summaryError;
      setCostSummary(summary);

      // Load resource usage breakdown
      const monthStart = new Date(selectedMonth);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);

      const { data: usage, error: usageError } = await supabase
        .from('project_resource_usage')
        .select('portal, resource_type, usage_count, cost_usd, period_start')
        .eq('project_id', projectId)
        .gte('period_start', monthStart.toISOString())
        .lt('period_start', monthEnd.toISOString())
        .order('period_start', { ascending: false });

      if (usageError) throw usageError;
      setResourceUsage(usage || []);

      // Load API logs using RPC function
      const { data: logs, error: logsError } = await supabase
        .rpc('get_project_api_logs', {
          _project_id: projectId,
          _limit: 100
        });

      if (logsError) {
        console.error('Error loading API logs:', logsError);
      }
      setApiLogs(logs || []);

    } catch (error: any) {
      console.error('Error loading cost data:', error);
      toast.error('Failed to load cost data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(amount);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const groupByPortal = () => {
    const portalGroups: Record<string, { cost: number; calls: number }> = {};
    resourceUsage.forEach((usage) => {
      if (!portalGroups[usage.portal]) {
        portalGroups[usage.portal] = { cost: 0, calls: 0 };
      }
      portalGroups[usage.portal].cost += usage.cost_usd;
      if (usage.resource_type === 'api_calls') {
        portalGroups[usage.portal].calls += usage.usage_count;
      }
    });
    return portalGroups;
  };

  const portalColors: Record<string, string> = {
    marketplace: 'bg-blue-500',
    business: 'bg-green-500',
    nonprofit: 'bg-purple-500',
    network: 'bg-orange-500',
  };

  if (loading) {
    return <div className="text-center p-8">Loading cost data...</div>;
  }

  const portalBreakdown = groupByPortal();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart className="h-6 w-6" />
          Project Cost Attribution
        </h2>
        <input
          type="month"
          value={selectedMonth.slice(0, 7)}
          onChange={(e) => setSelectedMonth(e.target.value + '-01')}
          className="px-4 py-2 border rounded-md"
        />
      </div>

      {costSummary ? (
        <>
          {/* Cost Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(costSummary.total_cost_usd)}</div>
                <p className="text-xs text-muted-foreground mt-1">All resources</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">API Costs</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(costSummary.api_cost_usd)}</div>
                <p className="text-xs text-muted-foreground mt-1">{costSummary.total_api_calls.toLocaleString()} calls</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(costSummary.db_cost_usd)}</div>
                <p className="text-xs text-muted-foreground mt-1">{costSummary.total_db_operations.toLocaleString()} operations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Blockchain Gas</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(costSummary.gas_cost_usd)}</div>
                <p className="text-xs text-muted-foreground mt-1">From LB pool</p>
              </CardContent>
            </Card>
          </div>

          {/* Portal Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Cost by Portal</CardTitle>
              <CardDescription>Resource usage across all four portals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(portalBreakdown).map(([portal, data]) => (
                  <div key={portal} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${portalColors[portal]}`} />
                      <div>
                        <div className="font-medium capitalize">{portal}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.calls.toLocaleString()} API calls
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(data.cost)}</div>
                      <div className="text-xs text-muted-foreground">
                        {((data.cost / costSummary.total_cost_usd) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Tabs */}
          <Tabs defaultValue="usage" className="w-full">
            <TabsList>
              <TabsTrigger value="usage">Resource Usage</TabsTrigger>
              <TabsTrigger value="api">API Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="usage">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {resourceUsage.slice(0, 20).map((usage, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 border-b">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{usage.portal}</Badge>
                          <span className="text-sm">{usage.resource_type}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(usage.cost_usd)}</div>
                          <div className="text-xs text-muted-foreground">
                            {usage.usage_count.toLocaleString()} units
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>Recent API Calls</CardTitle>
                  <CardDescription>Last 100 API requests to .net lockbox</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {apiLogs.map((log, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 border-b text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant={log.status_code === 200 ? 'default' : 'destructive'}>
                            {log.status_code}
                          </Badge>
                          <span className="font-mono">{log.method}</span>
                          <span>{log.endpoint}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{log.response_time_ms}ms</span>
                          <span>{formatBytes(log.bytes_transferred)}</span>
                          <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No cost data available for this period</p>
            <p className="text-sm text-muted-foreground mt-2">
              Resource usage will appear here once your project has activity
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
