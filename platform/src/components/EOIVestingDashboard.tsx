import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface VestingSchedule {
  id: string;
  project_id: string;
  eoi_amount: number;
  vesting_start_date: string;
  total_vesting_days: number;
  days_elapsed: number;
  amount_vested: number;
  equity_ratio: number;
  cash_ratio: number;
  ranking_score: number;
  status: string;
  project?: {
    name: string;
    project_sku: string;
  };
}

export function EOIVestingDashboard() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<VestingSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadVestingSchedules();
  }, [user]);

  const loadVestingSchedules = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("eoi_vesting_schedules")
      .select(`
        *,
        project:projects(name, project_sku)
      `)
      .eq("user_id", user.id)
      .order("vesting_start_date", { ascending: false });

    if (error) {
      console.error("Error loading vesting schedules:", error);
    } else {
      setSchedules(data || []);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading vesting schedules...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          EOI Vesting Schedules
        </CardTitle>
        <CardDescription>
          Track your Expression of Interest credits as they vest into real credits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No active vesting schedules</p>
            <p className="text-sm mt-2">Make an EOI pledge to start vesting credits</p>
          </div>
        ) : (
          schedules.map((schedule) => {
            const progress = (schedule.days_elapsed / schedule.total_vesting_days) * 100;
            const dailyAmount = schedule.eoi_amount / schedule.total_vesting_days;
            const remainingDays = schedule.total_vesting_days - schedule.days_elapsed;

            return (
              <Card key={schedule.id} className="border-2">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(schedule.status)}
                        <h3 className="font-semibold">
                          {schedule.project?.name || "Project"}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {schedule.project?.project_sku}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(schedule.status)}>
                      {schedule.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Vesting Progress</span>
                      <span className="font-medium">
                        {schedule.days_elapsed} / {schedule.total_vesting_days} days
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Total EOI</p>
                      <p className="text-lg font-semibold">{schedule.eoi_amount.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Vested</p>
                      <p className="text-lg font-semibold text-green-600">
                        {schedule.amount_vested.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Daily Rate</p>
                      <p className="text-lg font-semibold">{dailyAmount.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className="text-lg font-semibold">
                        {schedule.status === 'active' ? `${remainingDays}d` : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Participation Ratio</p>
                      <p className="text-sm font-medium">
                        {(schedule.equity_ratio * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Cash Ratio</p>
                      <p className="text-sm font-medium">
                        {(schedule.cash_ratio * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Ranking</p>
                      <p className="text-sm font-medium">#{schedule.ranking_score}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Started</p>
                      <p className="text-sm font-medium">
                        {format(new Date(schedule.vesting_start_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
