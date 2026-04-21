import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, ArrowDownToLine, ArrowUpFromLine, History, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreditPurchaseModal } from "@/components/CreditPurchaseModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function TreasureIsland() {
  const [showPurchase, setShowPurchase] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: credits } = useQuery({
    queryKey: ["user-credits", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_credits")
        .select("available_credits")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ["recent-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <PortalPageLayout>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Coins className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Treasure Island</h1>
            <p className="text-muted-foreground">Your Credit Command Center</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Sign in to view your credit balance and transactions.
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Coins className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Treasure Island</h1>
          <p className="text-muted-foreground">Your Credit Command Center</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary flex items-center gap-2">
              <Coins className="h-6 w-6" />
              {credits?.available_credits?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Available Credits</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setShowPurchase(true)}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Purchase Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="font-semibold">Add Funds</p>
                <p className="text-xs text-muted-foreground">Buy more credits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/withdraw")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Withdraw</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <ArrowUpFromLine className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold">Cash Out</p>
                <p className="text-xs text-muted-foreground">Convert to USD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Protected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="font-semibold">Secure</p>
                <p className="text-xs text-muted-foreground">Verified ledger backed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest credit activity</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {tx.transaction_type === "purchase" ? (
                      <ArrowDownToLine className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowUpFromLine className="h-5 w-5 text-blue-500" />
                    )}
                    <div>
                      <p className="font-medium capitalize">{tx.transaction_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.transaction_type === "purchase" ? "text-green-500" : "text-blue-500"}`}>
                      {tx.transaction_type === "purchase" ? "+" : "-"}
                      {tx.credits_amount} credits
                    </p>
                    <p className="text-xs text-muted-foreground">${tx.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Start by purchasing some credits!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CreditPurchaseModal
        open={showPurchase}
        onOpenChange={setShowPurchase}
      />
    </PortalPageLayout>
  );
}
