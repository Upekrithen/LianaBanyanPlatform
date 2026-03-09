import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Building2, FileCheck, DollarSign } from "lucide-react";

export function LegalFormationStatus() {
  const { data: formation, isLoading } = useQuery({
    queryKey: ['legal-formation'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('legal_formation_tracking')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading legal status...</div>;
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      sole_proprietor: { label: 'Sole Proprietor', variant: 'secondary' as const },
      llc_pending: { label: 'LLC Pending', variant: 'default' as const },
      llc_active: { label: 'LLC Active', variant: 'default' as const },
      corp_active: { label: 'Corporation', variant: 'default' as const },
    };
    return badges[status as keyof typeof badges] || badges.sole_proprietor;
  };

  const statusBadge = formation ? getStatusBadge(formation.current_status) : null;
  const paymentProgress = formation 
    ? (formation.amount_paid / Math.max(formation.formation_cost_usd, 1)) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Legal Formation Status
        </CardTitle>
        <CardDescription>
          Your business entity status and formation progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!formation ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Start your journey as a professional business entity
            </p>
            <Button>Request Formation Setup</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Status</span>
              {statusBadge && (
                <Badge variant={statusBadge.variant}>
                  {statusBadge.label}
                </Badge>
              )}
            </div>

            {formation.ein_number && (
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">EIN</div>
                  <div className="text-sm text-muted-foreground">
                    {formation.ein_number}
                  </div>
                </div>
              </div>
            )}

            {formation.formation_cost_usd > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Formation Cost</div>
                    <div className="text-sm text-muted-foreground">
                      ${formation.amount_paid.toFixed(2)} of ${formation.formation_cost_usd.toFixed(2)} paid
                    </div>
                  </div>
                </div>
                <Progress value={paymentProgress} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Paying {formation.payment_percentage}% of earnings
                </div>
              </div>
            )}

            {formation.current_status === 'sole_proprietor' && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Ready to upgrade to LLC? Once you've earned enough, you can transition to limited liability protection.
                </p>
                <Button variant="outline" size="sm">
                  Check Eligibility
                </Button>
              </div>
            )}

            {formation.notes && (
              <div className="pt-4 border-t">
                <div className="text-sm font-medium mb-1">Notes</div>
                <div className="text-sm text-muted-foreground">
                  {formation.notes}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
