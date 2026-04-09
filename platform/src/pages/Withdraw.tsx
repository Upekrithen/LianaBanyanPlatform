import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Clock, Zap, History, ExternalLink } from 'lucide-react';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useNavigate } from 'react-router-dom';

type WithdrawalType = 'contribution' | 'earned_instant' | 'earned_vested';

export default function Withdraw() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState('');
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>('contribution');
  const [calculation, setCalculation] = useState<any>(null);

  // Fetch user credits
  const { data: credits, isLoading: creditsLoading } = useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: async () => {
      // Real: user_credits (eoi_credits, eoi_used_credits, gleaning_credits_received, gleaning_credits_earned, is_gleaner, ...)
      const { data, error } = await supabase
        .from('user_credits')
        .select('eoi_credits, eoi_used_credits, gleaning_credits_received, gleaning_credits_earned, is_gleaner, first_transaction_at')
        .eq('user_id', user!.id)
        .single();
      
      if (error) throw error;
      // Map to what UI expects
      return {
        contribution_credits: data?.eoi_credits || 0,
        earned_credits: data?.gleaning_credits_earned || 0,
        initial_medallion_credit: 0,
        initial_medallion_granted_at: data?.first_transaction_at || null,
      };
    },
    enabled: !!user,
  });

  // Calculate medallion unlock date
  const medallionUnlockDate = credits?.initial_medallion_granted_at 
    ? new Date(new Date(credits.initial_medallion_granted_at).getTime() + 100 * 24 * 60 * 60 * 1000)
    : null;
  
  const isMedallionLocked = medallionUnlockDate && medallionUnlockDate > new Date();

  // Check if user has a Connect account for real payouts
  const { data: connectAcct } = useQuery({
    queryKey: ['withdraw-connect-account', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_connect_accounts' as any)
        .select('id, payouts_enabled, onboarding_status')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data as { id: string; payouts_enabled: boolean; onboarding_status: string } | null;
    },
    enabled: !!user,
  });

  const hasConnectPayout = connectAcct?.payouts_enabled === true;

  // Fetch withdrawal config
  const { data: config } = useQuery({
    queryKey: ['withdrawal-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawal_configs')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch withdrawal history
  const { data: history } = useQuery({
    queryKey: ['withdrawal-history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_withdrawals')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate withdrawal mutation
  const calculateMutation = useMutation({
    mutationFn: async (params: { amount: number; type: WithdrawalType }) => {
      const { data, error } = await supabase.rpc('calculate_withdrawal', {
        _user_id: user!.id,
        _amount: params.amount,
        _withdrawal_type: params.type,
      });
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: (data) => {
      if (data.eligible) {
        setCalculation(data);
      } else {
        toast({
          title: 'Cannot withdraw',
          description: data.error_message,
          variant: 'destructive',
        });
        setCalculation(null);
      }
    },
  });

  // Submit withdrawal mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!calculation) throw new Error('No calculation available');
      
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: {
          amount: parseFloat(amount),
          withdrawal_type: withdrawalType,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Withdrawal requested',
        description: 'Your withdrawal is being processed. Funds will arrive in 2-5 business days.',
      });
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-history'] });
      setAmount('');
      setCalculation(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Withdrawal failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCalculate = () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }
    calculateMutation.mutate({ amount: amountNum, type: withdrawalType });
  };

  if (creditsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <PortalPageLayout>
      <h1 className="text-3xl font-bold mb-6">Cash Out Credits</h1>

      {/* Connect account banner */}
      {!hasConnectPayout && (
        <Alert className="mb-6 border-amber-500/40 bg-amber-500/10">
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            <strong>Set up direct deposit first.</strong> Link your bank account or debit card so we can send your money.{' '}
            <Button variant="link" className="h-auto p-0 text-amber-700 dark:text-amber-400" onClick={() => navigate('/dashboard/payouts')}>
              Go to Payouts setup
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Balance Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Contribution Credits
            </CardTitle>
            <CardDescription>Your direct stakes (3% fee)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${credits?.contribution_credits?.toFixed(2) || '0.00'}
            </div>
            {isMedallionLocked && credits.initial_medallion_credit > 0 && (
              <Alert className="mt-4">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <div className="text-sm">
                    <strong>${credits.initial_medallion_credit.toFixed(2)}</strong> locked until{' '}
                    {medallionUnlockDate?.toLocaleDateString()}
                    <div className="text-xs text-muted-foreground mt-1">
                      Initial medallion credit vests after 100 days
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Earned Credits
            </CardTitle>
            <CardDescription>Matched credits (10% instant or vest 100 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${credits?.earned_credits?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
          <CardDescription>
            Minimum withdrawal: ${config?.min_withdrawal_amount || 10}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Withdrawal Type Selection */}
          <div className="space-y-3">
            <Label>Withdrawal Type</Label>
            <RadioGroup value={withdrawalType} onValueChange={(v) => setWithdrawalType(v as WithdrawalType)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="contribution" id="contribution" />
                <Label htmlFor="contribution" className="flex-1 cursor-pointer">
                  <div className="font-medium">Contribution Credits</div>
                  <div className="text-sm text-muted-foreground">
                    Instant • {config?.contribution_fee_percentage}% fee
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="earned_instant" id="earned_instant" />
                <Label htmlFor="earned_instant" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    Earned Credits - Instant <Zap className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Instant • {config?.earned_instant_fee_percentage}% fee
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer opacity-50">
                <RadioGroupItem value="earned_vested" id="earned_vested" disabled />
                <Label htmlFor="earned_vested" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    Earned Credits - Vested <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    100-day vesting • No fee
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min={config?.min_withdrawal_amount || 10}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setCalculation(null);
              }}
              placeholder={`Min $${config?.min_withdrawal_amount || 10}`}
            />
          </div>

          {/* Calculate Button */}
          <Button 
            onClick={handleCalculate} 
            disabled={!amount || calculateMutation.isPending}
            className="w-full"
          >
            Calculate Withdrawal
          </Button>

          {/* Calculation Result */}
          {calculation && (
            <Alert>
              <AlertDescription className="space-y-2">
                <div className="flex justify-between">
                  <span>Withdrawal Amount:</span>
                  <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Fee ({calculation.fee_percentage}%):</span>
                  <span>-${calculation.fee_amount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>You Receive:</span>
                  <span className="text-green-600">${calculation.net_amount.toFixed(2)}</span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          {calculation && (
            <Button 
              onClick={() => submitMutation.mutate()} 
              disabled={submitMutation.isPending}
              className="w-full"
              size="lg"
            >
              Confirm Withdrawal
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((withdrawal) => (
                <div key={withdrawal.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">${withdrawal.net_amount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    withdrawal.status === 'completed' ? 'bg-green-100 text-green-700' :
                    withdrawal.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {withdrawal.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PortalPageLayout>
  );
}
