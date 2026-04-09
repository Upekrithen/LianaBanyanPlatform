import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Plus,
  TrendingUp,
  DollarSign,
  Heart,
  Calendar,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  Sparkles,
} from "lucide-react";

interface MSAAccount {
  id: string;
  user_id: string;
  balance: number;
  total_contributed: number;
  total_matched: number;
  total_withdrawn: number;
  monthly_contribution_target: number;
  created_at: string;
}

interface MSATransaction {
  id: string;
  type: "contribution" | "match" | "withdrawal" | "interest";
  amount: number;
  description: string;
  created_at: string;
}

export function MSADashboard() {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const queryClient = useQueryClient();
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);

  // Fetch MSA account
  const { data: msaAccount, isLoading: accountLoading } = useQuery({
    queryKey: ["msa-account", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("msa_accounts")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as MSAAccount | null;
    },
    enabled: !!user,
  });

  // Fetch MSA transactions
  const { data: transactions } = useQuery({
    queryKey: ["msa-transactions", msaAccount?.id],
    queryFn: async () => {
      if (!msaAccount) return [];

      const { data, error } = await supabase
        .from("msa_transactions")
        .select("*")
        .eq("account_id", msaAccount.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as MSATransaction[];
    },
    enabled: !!msaAccount,
  });

  // Create MSA account mutation
  const createAccount = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("msa_accounts")
        .insert({
          user_id: user.id,
          balance: 0,
          total_contributed: 0,
          total_matched: 0,
          total_withdrawn: 0,
          monthly_contribution_target: 100,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("MSA account created!");
      queryClient.invalidateQueries({ queryKey: ["msa-account"] });
    },
    onError: (error) => {
      toast.error(`Failed to create account: ${error.message}`);
    },
  });

  // Contribute mutation
  const contribute = useMutation({
    mutationFn: async (amount: number) => {
      if (!user || !msaAccount) throw new Error("Account required");

      // Calculate platform match (5% up to $50/month)
      const matchPercent = 5;
      const maxMatch = 50;
      const matchAmount = Math.min(amount * (matchPercent / 100), maxMatch);

      // Record contribution transaction
      const { error: txError } = await supabase
        .from("msa_transactions")
        .insert({
          account_id: msaAccount.id,
          type: "contribution",
          amount: amount,
          description: `Monthly contribution`,
        });

      if (txError) throw txError;

      // Record match transaction
      if (matchAmount > 0) {
        const { error: matchError } = await supabase
          .from("msa_transactions")
          .insert({
            account_id: msaAccount.id,
            type: "match",
            amount: matchAmount,
            description: `Platform match (${matchPercent}%)`,
          });

        if (matchError) throw matchError;
      }

      // Update account balance
      const { error: updateError } = await supabase
        .from("msa_accounts")
        .update({
          balance: msaAccount.balance + amount + matchAmount,
          total_contributed: msaAccount.total_contributed + amount,
          total_matched: msaAccount.total_matched + matchAmount,
        })
        .eq("id", msaAccount.id);

      if (updateError) throw updateError;

      return { contribution: amount, match: matchAmount };
    },
    onSuccess: (data) => {
      toast.success(
        `Contributed $${data.contribution}! Platform matched $${data.match.toFixed(2)}`
      );
      setContributionDialogOpen(false);
      setContributionAmount("");
      queryClient.invalidateQueries({ queryKey: ["msa-account"] });
      queryClient.invalidateQueries({ queryKey: ["msa-transactions"] });
    },
    onError: (error) => {
      toast.error(`Contribution failed: ${error.message}`);
    },
  });

  const handleContribute = () => {
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    contribute.mutate(amount);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-3">Your Medical Savings Account helps you set aside funds for healthcare needs.</p>
          <Button variant="outline" size="sm" onClick={() => openOnboard({ reason: "Access your Medical Savings Account", actionLabel: "Open MSA" })}>
            Get Started
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (accountLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2 mx-auto" />
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!msaAccount) {
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            Medical Savings Account
          </CardTitle>
          <CardDescription>
            Save for medical expenses with platform matching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg border">
              <Gift className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="font-bold text-lg">5%</p>
              <p className="text-xs text-muted-foreground">Platform Match</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="font-bold text-lg">$50</p>
              <p className="text-xs text-muted-foreground">Max Match/Month</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <Heart className="w-8 h-8 mx-auto mb-2 text-rose-500" />
              <p className="font-bold text-lg">100%</p>
              <p className="text-xs text-muted-foreground">Your Money</p>
            </div>
          </div>

          <div className="p-4 bg-green-100 rounded-lg">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              How It Works
            </h4>
            <ul className="text-sm space-y-1 text-green-800">
              <li>• Contribute any amount monthly</li>
              <li>• Platform matches 5% (up to $50/month)</li>
              <li>• Use funds for any medical expense</li>
              <li>• Funds roll over — never expire</li>
            </ul>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => createAccount.mutate()}
            disabled={createAccount.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            {createAccount.isPending ? "Creating..." : "Open MSA Account"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const monthlyProgress = msaAccount.monthly_contribution_target > 0
    ? (msaAccount.total_contributed / msaAccount.monthly_contribution_target) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card className="border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                Medical Savings Account
              </CardTitle>
              <CardDescription>Your health safety net</CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Current Balance */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="pt-6">
                <p className="text-green-100 text-sm">Current Balance</p>
                <p className="text-3xl font-bold">${msaAccount.balance.toLocaleString()}</p>
              </CardContent>
            </Card>

            {/* Total Contributed */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm">Contributed</span>
                </div>
                <p className="text-2xl font-bold">${msaAccount.total_contributed.toLocaleString()}</p>
              </CardContent>
            </Card>

            {/* Platform Match */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Gift className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Platform Match</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  ${msaAccount.total_matched.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Withdrawn */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <ArrowDownLeft className="w-4 h-4" />
                  <span className="text-sm">Withdrawn</span>
                </div>
                <p className="text-2xl font-bold">${msaAccount.total_withdrawn.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contribute */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Make a Contribution</CardTitle>
            <CardDescription>
              Add to your MSA and receive platform matching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={contributionDialogOpen} onOpenChange={setContributionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Contribute
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Contribute to MSA</DialogTitle>
                  <DialogDescription>
                    Your contribution will be matched at 5% (up to $50/month)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Contribution Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="100"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  {contributionAmount && parseFloat(contributionAmount) > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>Your Contribution</span>
                        <span className="font-medium">${parseFloat(contributionAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2 text-green-600">
                        <span>Platform Match (5%)</span>
                        <span className="font-medium">
                          +${Math.min(parseFloat(contributionAmount) * 0.05, 50).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold">
                        <span>Total Added</span>
                        <span>
                          ${(parseFloat(contributionAmount) + Math.min(parseFloat(contributionAmount) * 0.05, 50)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={handleContribute}
                    disabled={contribute.isPending}
                  >
                    {contribute.isPending ? "Processing..." : "Confirm Contribution"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Withdraw */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Withdrawal</CardTitle>
            <CardDescription>
              Use your MSA funds for medical expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Withdrawals require receipt upload for medical expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your MSA activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          tx.type === "contribution"
                            ? "border-blue-200 text-blue-700"
                            : tx.type === "match"
                            ? "border-green-200 text-green-700"
                            : tx.type === "withdrawal"
                            ? "border-amber-200 text-amber-700"
                            : "border-purple-200 text-purple-700"
                        }
                      >
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{tx.description}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        tx.type === "withdrawal" ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {tx.type === "withdrawal" ? "-" : "+"}${tx.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Make your first contribution to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">About Your MSA</p>
              <ul className="mt-2 space-y-1">
                <li>• Funds never expire and roll over year to year</li>
                <li>• Platform matches 5% of contributions (max $50/month)</li>
                <li>• Use for any legitimate medical expense</li>
                <li>• Withdrawals require receipt documentation</li>
                <li>• Your money is always yours — 100% portable</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MSADashboard;
