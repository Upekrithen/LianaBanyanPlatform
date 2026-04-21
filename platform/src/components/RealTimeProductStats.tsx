import { useRealTimeCalculations } from "@/hooks/useRealTimeCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingDown, Users, DollarSign, Clock, RefreshCw, AlertTriangle, WifiOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RealTimeProductStatsProps {
  productId: string;
}

export function RealTimeProductStats({ productId }: RealTimeProductStatsProps) {
  const { productCalcs, isLoading, productStaleness, realtimeConnected, refetch } = useRealTimeCalculations(productId);

  const getStalenessIndicator = () => {
    if (!realtimeConnected) {
      return (
        <span className="relative flex h-3 w-3" title="Connection lost - using polling">
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      );
    }

    switch (productStaleness.level) {
      case 'fresh':
        return (
          <span className="relative flex h-3 w-3" title="Live data">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        );
      case 'warning':
        return (
          <span className="relative flex h-3 w-3" title={`${productStaleness.secondsSinceUpdate}s since update`}>
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
          </span>
        );
      case 'stale':
      case 'critical':
        return (
          <span className="relative flex h-3 w-3" title={`${productStaleness.secondsSinceUpdate}s since update`}>
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!productCalcs) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStalenessIndicator()}
            Live Production Run Stats
          </CardTitle>
          {productStaleness.level === 'stale' || productStaleness.level === 'critical' || !realtimeConnected ? (
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

        {productStaleness.level === 'stale' && realtimeConnected && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Data may be outdated ({productStaleness.secondsSinceUpdate}s since last update).
              Click refresh to update manually.
            </AlertDescription>
          </Alert>
        )}

        {productStaleness.level === 'critical' && realtimeConnected && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Data is stale ({Math.floor(productStaleness.secondsSinceUpdate / 60)}m since last update).
              <Button variant="link" onClick={refetch} className="h-auto p-0 ml-1">
                Refresh now
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Volume Discount */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              <span>Volume Discount</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {productCalcs.currentVolumeDiscount}%
            </div>
            <p className="text-xs text-muted-foreground">
              Updates with each pledge
            </p>
          </div>

          {/* Units Preordered */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Units Preordered</span>
            </div>
            <div className="text-2xl font-bold">
              {productCalcs.totalUnitsPreordered.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Live count
            </p>
          </div>

          {/* Current Unit Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Current Price</span>
            </div>
            <div className="text-2xl font-bold">
              ${productCalcs.currentUnitPrice.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per unit
            </p>
          </div>

          {/* Time Remaining */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Time Remaining</span>
            </div>
            {productCalcs.timeRemaining ? (
              <>
                <div className="text-2xl font-bold font-mono">
                  {productCalcs.timeRemaining.days}d {productCalcs.timeRemaining.hours}h
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {productCalcs.timeRemaining.minutes}m {productCalcs.timeRemaining.seconds}s
                </p>
              </>
            ) : (
              <Badge variant="secondary">No deadline set</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
