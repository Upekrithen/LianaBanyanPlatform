import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Ghost,
  Sparkles,
  Clock,
  TrendingUp,
  TrendingDown,
  Info,
  History,
  AlertCircle,
} from "lucide-react";
import { GhostCreditTermsModal, useGhostCreditTermsStatus } from "./GhostCreditTermsModal";

interface GhostCreditTransaction {
  id: string;
  amount: number;
  balance_after: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

const TRANSACTION_TYPE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  initial_grant: { label: "Welcome Bonus", icon: Sparkles, color: "text-green-500" },
  weekly_topoff: { label: "Weekly Refresh", icon: Clock, color: "text-blue-500" },
  practice_spend: { label: "Spent", icon: TrendingDown, color: "text-red-500" },
  practice_earn: { label: "Earned", icon: TrendingUp, color: "text-green-500" },
  expiration: { label: "Expired", icon: Clock, color: "text-gray-500" },
  admin_adjustment: { label: "Adjustment", icon: Info, color: "text-orange-500" },
  crow_feather_bonus: { label: "Crow Feather Bonus", icon: Sparkles, color: "text-purple-500" },
};

export function GhostCreditBalance({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const { data: termsStatus } = useGhostCreditTermsStatus();

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ["ghost-credit-balance", user?.id],
    queryFn: async () => {
      if (!user) return { current_balance: 0, total_transactions: 0 };

      const { data, error } = await supabase
        .from("v_ghost_credit_balances")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return { current_balance: 0, total_transactions: 0 };
        }
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ["ghost-credit-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("ghost_credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as GhostCreditTransaction[];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 text-muted-foreground text-sm font-medium cursor-help">
            <Sparkles className="w-4 h-4" />
            <span>0</span>
            <span className="hidden sm:inline">feathers</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p>What are these?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Ghost Credits (feathers) track your exploration. Sign in or convert to member to earn and keep them.
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const needsTermsAcceptance = !termsStatus?.accepted;
  const currentBalance = balance?.current_balance || 0;
  const maxBalance = 500;
  const percentFull = (currentBalance / maxBalance) * 100;

  if (compact) {
    return (
      <>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Ghost className="w-4 h-4 text-purple-500" />
              <span className="font-mono font-bold">{currentBalance}</span>
              {needsTermsAcceptance && (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <Ghost className="w-4 h-4 text-purple-500" />
                  Ghost Credits
                </h4>
                <Badge variant="outline">{currentBalance} / {maxBalance}</Badge>
              </div>

              {needsTermsAcceptance ? (
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="pt-3">
                    <p className="text-sm text-amber-800 mb-2">
                      Accept terms to receive your initial 200 Ghost Credits!
                    </p>
                    <Button size="sm" onClick={() => setTermsModalOpen(true)}>
                      Accept Terms
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all"
                      style={{ width: `${percentFull}%` }}
                    />
                  </div>

                  {recentTransactions && recentTransactions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Recent Activity</p>
                      {recentTransactions.slice(0, 3).map((txn) => {
                        const typeConfig = TRANSACTION_TYPE_LABELS[txn.transaction_type];
                        const Icon = typeConfig?.icon || Info;
                        return (
                          <div key={txn.id} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1">
                              <Icon className={`w-3 h-3 ${typeConfig?.color || ""}`} />
                              {typeConfig?.label || txn.transaction_type}
                            </span>
                            <span className={txn.amount >= 0 ? "text-green-600" : "text-red-600"}>
                              {txn.amount >= 0 ? "+" : ""}{txn.amount}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Ghost Credits have no cash value and cannot be converted to money.
                  </p>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <GhostCreditTermsModal
          open={termsModalOpen}
          onOpenChange={setTermsModalOpen}
          onAccepted={() => {
            setTermsModalOpen(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Ghost className="w-5 h-5 text-purple-500" />
              Ghost Credits
            </span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Ghost Credits are for practice mode only. They have no cash value
                  and cannot be converted to money.
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            Practice mode currency for Ghost World
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {needsTermsAcceptance ? (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Terms Required</p>
                    <p className="text-sm text-amber-700 mb-3">
                      Accept the Ghost Credit terms to receive your initial 200 credits
                      and start exploring Ghost World!
                    </p>
                    <Button onClick={() => setTermsModalOpen(true)}>
                      <Ghost className="w-4 h-4 mr-2" />
                      Accept Terms
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Balance Display */}
              <div className="text-center py-4">
                <div className="text-5xl font-bold font-mono text-purple-600">
                  {balanceLoading ? "..." : currentBalance}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  of {maxBalance} maximum
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all"
                    style={{ width: `${percentFull}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>{maxBalance}</span>
                </div>
              </div>

              {/* Recent Transactions */}
              {recentTransactions && recentTransactions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Recent Activity
                  </h4>
                  <div className="space-y-1">
                    {recentTransactions.map((txn) => {
                      const typeConfig = TRANSACTION_TYPE_LABELS[txn.transaction_type];
                      const Icon = typeConfig?.icon || Info;
                      return (
                        <div
                          key={txn.id}
                          className="flex items-center justify-between py-1 px-2 rounded bg-muted/50"
                        >
                          <span className="flex items-center gap-2 text-sm">
                            <Icon className={`w-4 h-4 ${typeConfig?.color || ""}`} />
                            {typeConfig?.label || txn.transaction_type}
                          </span>
                          <span className={`font-mono font-medium ${
                            txn.amount >= 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {txn.amount >= 0 ? "+" : ""}{txn.amount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info */}
              <Card className="bg-muted/50">
                <CardContent className="pt-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Weekly Refresh:</strong> Ghost Credits are topped off weekly up to {maxBalance}.
                    Use them to explore Ghost World and practice platform features without financial commitment.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>

      <GhostCreditTermsModal
        open={termsModalOpen}
        onOpenChange={setTermsModalOpen}
        onAccepted={() => {
          setTermsModalOpen(false);
        }}
      />
    </>
  );
}

export default GhostCreditBalance;
