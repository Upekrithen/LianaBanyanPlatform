import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeCalculations } from "@/hooks/useRealTimeCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, TrendingUp, Vote, RefreshCw, AlertTriangle, WifiOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export function RealTimeUserStats() {
  const { user } = useAuth();
  const { userCalcs, isLoading, userStaleness, realtimeConnected, refetch } = useRealTimeCalculations(undefined, user?.id);

  const getStalenessIndicator = () => {
    if (!realtimeConnected) {
      return (
        <span className="relative flex h-3 w-3" title="Connection lost - using polling">
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      );
    }

    switch (userStaleness.level) {
      case 'fresh':
        return (
          <span className="relative flex h-3 w-3" title="Live data">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        );
      case 'warning':
        return (
          <span className="relative flex h-3 w-3" title={`${userStaleness.secondsSinceUpdate}s since update`}>
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
          </span>
        );
      case 'stale':
      case 'critical':
        return (
          <span className="relative flex h-3 w-3" title={`${userStaleness.secondsSinceUpdate}s since update`}>
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        );
      default:
        return null;
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userCalcs) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStalenessIndicator()}
            Your Live Portfolio Stats
          </CardTitle>
          {userStaleness.level === 'stale' || userStaleness.level === 'critical' || !realtimeConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Staleness Warning */}
        {!realtimeConnected && (
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Real-time connection lost. Using fallback polling every 30 seconds.
            </AlertDescription>
          </Alert>
        )}

        {userStaleness.level === 'stale' && realtimeConnected && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Data may be outdated ({userStaleness.secondsSinceUpdate}s since last update).
              Click refresh to update manually.
            </AlertDescription>
          </Alert>
        )}

        {userStaleness.level === 'critical' && realtimeConnected && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Data is stale ({Math.floor(userStaleness.secondsSinceUpdate / 60)}m since last update).
              <Button variant="link" onClick={refetch} className="h-auto p-0 ml-1">
                Refresh now
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {/* Credit Value */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Available Credits</span>
            </div>
            <span className="text-2xl font-bold">
              ${userCalcs.totalCreditValue.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Updates in real-time with pledges and conversions
          </p>
        </div>

        {/* Voting Power */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Vote className="h-4 w-4" />
              <span>Total Voting Power</span>
            </div>
            <span className="text-2xl font-bold">
              {userCalcs.votingPower.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Combined across all projects
          </p>
        </div>

        {/* Project Participation Breakdown */}
        {Object.keys(userCalcs.participationPercentages).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Project Participation</span>
            </div>
            {Object.entries(userCalcs.participationPercentages).map(([projectId, percentage]) => (
              <div key={projectId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate">
                    Project {projectId.slice(0, 8)}...
                  </span>
                  <span className="font-mono font-bold">
                    {percentage.toFixed(4)}%
                  </span>
                </div>
                <Progress value={Math.min(percentage * 10, 100)} className="h-2" />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Updates with each vote cast on projects
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
