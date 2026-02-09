import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { DollarSign, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MSAContributionCard() {
  const { toast } = useToast();
  const [contributionPct, setContributionPct] = useState(1);

  const { data: msaAccount } = useQuery({
    queryKey: ["msa-account"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("msa_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleUpdateContribution = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("msa_accounts")
      .upsert({
        user_id: user.id,
        auto_contribution_percentage: contributionPct,
        is_active: true,
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "MSA contribution updated" });
    }
  };

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-yellow-500/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-amber-500" />
          <CardTitle>Medical Savings Account (MSA)</CardTitle>
        </div>
        <CardDescription>
          LB matches your contribution from earnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Your Balance</span>
            <span className="font-medium">${msaAccount?.member_balance?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">LB Matched Balance</span>
            <span className="font-medium">${msaAccount?.lb_matched_balance?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span>Total Available</span>
            <span>${((msaAccount?.member_balance || 0) + (msaAccount?.lb_matched_balance || 0)).toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <label className="text-sm font-medium">Auto-Contribution from Earnings</label>
          <div className="flex items-center gap-4">
            <Slider
              value={[contributionPct]}
              onValueChange={(v) => setContributionPct(v[0])}
              min={1}
              max={50}
              step={1}
              className="flex-1"
            />
            <span className="text-sm font-medium w-12">{contributionPct}%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            <Heart className="h-3 w-3 inline mr-1" />
            LB will match this percentage from your earnings
          </p>
          <Button onClick={handleUpdateContribution} size="sm" className="w-full">
            Update Contribution
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-2 border-t">
          Your MSA funds are available for medical expenses. LB matches your contribution to help you save for healthcare needs.
        </p>
      </CardContent>
    </Card>
  );
}
