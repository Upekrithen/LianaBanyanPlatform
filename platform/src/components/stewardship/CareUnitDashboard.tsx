import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StewardshipService } from "../../services/stewardshipService";
import { InitiativeCareUnit, AI_ADVISORS } from "../../types/stewardship";
import { AIAdvisorCard } from "./AIAdvisorCard";
import { Heart, TrendingUp, Users, Flame } from "lucide-react";

interface CareUnitDashboardProps {
  initiativeId: string;
}

export const CareUnitDashboard: React.FC<CareUnitDashboardProps> = ({ initiativeId }) => {
  const [careUnit, setCareUnit] = useState<InitiativeCareUnit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCU = async () => {
      try {
        // initiative_care_units table migration exists but hasn't been applied to live DB yet
        // When the table is live, this query will work automatically
        const data = await StewardshipService.getInitiativeCareUnit(initiativeId);
        if (data) {
          setCareUnit(data);
        }
      } catch (err) {
        // Table not yet available — component renders honest empty state
        console.log('[CareUnitDashboard] initiative_care_units table not yet available');
      }
      setLoading(false);
    };
    fetchCU();
  }, [initiativeId]);

  if (loading) return <div className="animate-pulse h-64 bg-muted rounded-xl"></div>;
  if (!careUnit) return (
    <Card className="border-2 border-dashed border-primary/20">
      <CardContent className="py-12 text-center">
        <Heart className="h-10 w-10 mx-auto mb-4 text-primary/30" />
        <h3 className="font-semibold text-lg mb-2">Care Unit System</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The Care Unit tracking system for this initiative is being set up.
          Each initiative defines its own minimum deployable unit of charitable impact,
          tracked from Spark tier through Wildfire.
        </p>
      </CardContent>
    </Card>
  );

  const advisor = AI_ADVISORS[careUnit.ai_advisor_name];
  const progressPercent = Math.min(100, (careUnit.total_cu_deployed / Math.max(1, careUnit.total_cu_funded)) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-2 border-primary/10">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                Care Unit Status
              </CardTitle>
              <CardDescription>Minimum deployable unit of charitable impact</CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 text-sm py-1">
              <Flame className="h-4 w-4 text-orange-500" />
              Tier: {careUnit.current_tier}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">1 Care Unit (CU) =</p>
              <p className="font-semibold">{careUnit.cu_definition}</p>
              <p className="text-xs text-primary mt-1">${careUnit.cost_per_cu.toFixed(2)} per CU</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Funded</p>
              <p className="text-2xl font-bold">{careUnit.total_cu_funded.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Care Units</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Deployment Progress</span>
              <span className="font-medium">{careUnit.total_cu_deployed.toLocaleString()} Deployed</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-muted-foreground text-right">
              {careUnit.total_cu_funded - careUnit.total_cu_deployed} CU pending deployment
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex items-start gap-3">
            <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Human Stewardship</h4>
              <p className="text-xs text-muted-foreground mt-1">
                This initiative is currently operating at the <strong>{careUnit.current_tier}</strong> tier. 
                All deployments are overseen by a vetted Human Steward, advised by the AI system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {advisor && (
        <AIAdvisorCard advisor={advisor} initiativeName={careUnit.name} />
      )}
    </div>
  );
};
