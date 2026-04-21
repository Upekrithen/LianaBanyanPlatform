import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ViolationLog {
  id: string;
  hiring_member_id: string;
  hired_member_id: string;
  agreed_rate: number;
  lb_scale_rate: number;
  rate_compliant: boolean;
  violation_severity: string | null;
  reputation_penalty: number | null;
  created_at: string;
}

export function ServiceViolationDashboard() {
  const { t } = useTranslation();
  const [violations, setViolations] = useState<ViolationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    compliant: 0,
    violations: 0,
    totalPenalty: 0
  });

  useEffect(() => {
    loadViolations();
  }, []);

  const loadViolations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("lb_member_hiring_log")
        .select("*")
        .or(`hiring_member_id.eq.${user.id},hired_member_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const logs = data || [];
      setViolations(logs);

      // Calculate stats
      const totalContracts = logs.length;
      const compliantCount = logs.filter(l => l.rate_compliant).length;
      const violationCount = logs.filter(l => !l.rate_compliant).length;
      const totalPenalty = logs.reduce((sum, l) => sum + (l.reputation_penalty || 0), 0);

      setStats({
        total: totalContracts,
        compliant: compliantCount,
        violations: violationCount,
        totalPenalty
      });

    } catch (error: any) {
      toast.error("Failed to load violation history", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case "severe":
        return "destructive";
      case "major":
        return "destructive";
      case "minor":
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading compliance history...</p>
        </CardContent>
      </Card>
    );
  }

  if (violations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Perfect Compliance Record
          </CardTitle>
          <CardDescription>
            You have no recorded transactions yet. Start accepting LB contracts to build your reputation.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Contracts</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{stats.compliant}</p>
              <p className="text-sm text-muted-foreground">Compliant</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-destructive">{stats.violations}</p>
              <p className="text-sm text-muted-foreground">Violations</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-warning">-{stats.totalPenalty}</p>
              <p className="text-sm text-muted-foreground">Rep. Penalty</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Score */}
      {stats.total > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Compliance Rate</p>
              <Badge variant={stats.violations === 0 ? "default" : "secondary"}>
                {((stats.compliant / stats.total) * 100).toFixed(0)}%
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-success h-3 rounded-full transition-all"
                style={{ width: `${(stats.compliant / stats.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.violations === 0
                ? "Perfect compliance! Keep it up!"
                : `${stats.violations} violation${stats.violations > 1 ? 's' : ''} recorded. Review below.`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Violations */}
      {stats.violations > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Rate Compliance History
            </CardTitle>
            <CardDescription>
              Recent member-to-member contracts and compliance status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {violations.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border ${!log.rate_compliant ? 'border-destructive bg-destructive/5' : 'border-border'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {log.rate_compliant ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-medium">
                        {log.rate_compliant ? "Compliant Contract" : "Rate Violation"}
                      </span>
                    </div>
                    {log.violation_severity && (
                      <Badge variant={getSeverityColor(log.violation_severity)}>
                        {log.violation_severity}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Agreed Rate</p>
                      <p className="font-medium">${log.agreed_rate}/hr</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">LB Scale Rate</p>
                      <p className="font-medium">${log.lb_scale_rate}/hr</p>
                    </div>
                    {log.reputation_penalty !== null && log.reputation_penalty > 0 && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Reputation Penalty</p>
                        <p className="font-medium text-destructive">-{log.reputation_penalty} points</p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString()}
                  </p>

                  {!log.rate_compliant && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertDescription className="text-xs">
                        This contract violated LB rate minimums. Future violations may result in
                        suspension or removal from the platform.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
