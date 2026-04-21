import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingDown, TrendingUp } from "lucide-react";

export function CharitableLoanAccount() {
  const { data: account, isLoading, isError } = useQuery({
    queryKey: ['lmd-charity-account'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('lmd_charity_accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      // Create account if it doesn't exist
      if (!data) {
        const { data: newAccount, error: createError } = await supabase
          .from('lmd_charity_accounts')
          .insert({
            user_id: user.id,
            balance: 0,
            total_received: 0,
            total_repaid: 0,
            auto_repay_percentage: 5,
          })
          .select()
          .single();

        if (createError) throw createError;
        return newAccount;
      }

      return data;
    }
  });

  if (isLoading) {
    return <div>Loading account...</div>;
  }

  if (isError || !account) {
    return <div className="text-muted-foreground p-4">Unable to load charitable loan account.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Charitable Loan Account
        </CardTitle>
        <CardDescription>
          Community support for meals when you need it most
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total Received</div>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <div className="text-2xl font-bold">
                ${Number(account.total_received || 0).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total Repaid</div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold">
                ${Number(account.total_repaid || 0).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Balance</div>
            <div className="text-2xl font-bold">
              ${Number(account.balance || 0).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              No Collection Enforcement
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Auto-repay: {account.auto_repay_percentage || 5}%
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>How it works:</strong> If you can't afford a meal, it can be put on your charitable loan account.
              You won't get to choose the specific meal (first-come-first-serve), but dietary restrictions and allergies are honored.
            </p>
            <p>
              <strong>No pressure:</strong> Repay when you can. When you earn from the platform,
              {account.auto_repay_percentage}% is automatically applied to your balance.
              This account is funded by community donations and the platform's charitable fund.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
