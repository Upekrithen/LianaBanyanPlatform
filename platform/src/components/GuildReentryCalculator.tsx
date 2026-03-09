import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, DollarSign, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface GuildReentryCalculatorProps {
  targetTier: string;
  targetClass: number;
  onProceed?: (cost: number) => void;
}

export const GuildReentryCalculator = ({ targetTier, targetClass, onProceed }: GuildReentryCalculatorProps) => {
  const { data: reentryCost, isLoading } = useQuery({
    queryKey: ['guild-reentry-cost', targetTier, targetClass],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('calculate_reentry_cost', {
        _user_id: user.id,
        _target_tier: targetTier,
        _target_class: targetClass
      });

      if (error) throw error;
      return data as {
        reentry_cost: number;
        upfront_payment: number;
        deferred_payment: number;
        total_required_stake: number;
        previous_stake_paid: number;
        message: string;
        error?: string;
      };
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (reentryCost?.error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{reentryCost.error}</AlertDescription>
      </Alert>
    );
  }

  const isAlreadyPaid = reentryCost?.reentry_cost === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Guild Re-Entry Cost
        </CardTitle>
        <CardDescription>
          Rejoining {targetTier} Class {targetClass}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAlreadyPaid ? (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Good news! You've already paid the required stake.</p>
                <p className="text-sm text-muted-foreground">
                  However, you lost guild benefits during your absence (benefit sharing, reputation bonuses, etc.)
                </p>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Previous Stake Paid:</span>
                <span className="font-medium">${reentryCost?.previous_stake_paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Required for This Level:</span>
                <span className="font-medium">${reentryCost?.total_required_stake.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Re-Entry Cost:</span>
                  <Badge variant="secondary" className="text-lg">
                    ${reentryCost?.reentry_cost.toFixed(2)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-sm">Payment Terms</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pay Now (33%):</span>
                  <span className="font-medium text-primary">
                    ${reentryCost?.upfront_payment.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">From Future Earnings (67%):</span>
                  <span className="font-medium text-muted-foreground">
                    ${reentryCost?.deferred_payment.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                {reentryCost?.message}
              </AlertDescription>
            </Alert>
          </>
        )}

        {onProceed && (
          <Button 
            onClick={() => onProceed(reentryCost?.upfront_payment || 0)}
            className="w-full"
            size="lg"
          >
            {isAlreadyPaid ? 'Rejoin Guild (No Payment Required)' : `Pay $${reentryCost?.upfront_payment.toFixed(2)} & Rejoin`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
