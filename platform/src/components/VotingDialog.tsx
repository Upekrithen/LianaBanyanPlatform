import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Clock, TrendingUp } from 'lucide-react';
import { ReferralCodeInput } from './ReferralCodeInput';

interface ProductionLevel {
  id: string;
  level_number: number;
  level_name: string;
  units_count: number;
  unit_price: number;
  votes_needed: number;
  current_votes: number;
}

interface VotingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productionLevels: ProductionLevel[];
  availableCredits: number;
  onVoteSuccess: () => void;
}

export function VotingDialog({
  open,
  onOpenChange,
  productId,
  productName,
  productionLevels,
  availableCredits,
  onVoteSuccess
}: VotingDialogProps) {
  const { user } = useAuth();
  const [votes, setVotes] = useState<{ [key: string]: string }>({});
  const [timeCommitments, setTimeCommitments] = useState<{ [key: string]: number }>({});
  const [equityRatios, setEquityRatios] = useState<{ [key: string]: { equity: number; cash: number } }>({});
  const [votingConfig, setVotingConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [referralCode, setReferralCode] = useState<string>('');

  // Load project voting config
  useEffect(() => {
    const loadVotingConfig = async () => {
      // First get the project_id from the product
      const { data: product } = await supabase
        .from('products')
        .select('project_id')
        .eq('id', productId)
        .single();

      if (product) {
        // Then fetch the voting config for that project
        const { data: config } = await supabase
          .from('project_voting_configs')
          .select('*')
          .eq('project_id', product.project_id)
          .maybeSingle();

        if (config) {
          // Parse time_commitment_options from JSONB
          const parsedOptions = Array.isArray(config.time_commitment_options) 
            ? config.time_commitment_options 
            : JSON.parse(config.time_commitment_options as string);
          
          setVotingConfig({
            ...config,
            time_commitment_options: parsedOptions
          });
        } else {
          // Use defaults if no config exists
          setVotingConfig({
            product_lead_time_days: 180,
            min_equity_ratio: 0.1,
            max_equity_ratio: 0.9,
            time_commitment_options: [
              { days: 7, label: '1 Week' },
              { days: 14, label: '2 Weeks' },
              { days: 30, label: '1 Month' },
              { days: 60, label: '2 Months' },
              { days: 90, label: '3 Months' },
              { days: 180, label: '6 Months' },
            ]
          });
        }
      }
      setLoadingConfig(false);
    };

    if (open) {
      loadVotingConfig();
    }
  }, [open, productId]);

  // Calculate equity/cash ratio when commitment changes
  useEffect(() => {
    if (!votingConfig) return;

    Object.entries(timeCommitments).forEach(([levelId, days]) => {
      const ratioFactor = Math.min(1.0, Math.max(0.0, days / votingConfig.product_lead_time_days));
      const minEquity = Number(votingConfig.min_equity_ratio);
      const maxEquity = Number(votingConfig.max_equity_ratio);
      const equity = minEquity + (ratioFactor * (maxEquity - minEquity));
      const cash = 1 - equity;
      
      setEquityRatios(prev => ({
        ...prev,
        [levelId]: { equity, cash }
      }));
    });
  }, [timeCommitments, votingConfig]);

  const handleVoteChange = (levelId: string, value: string) => {
    setVotes(prev => ({ ...prev, [levelId]: value }));
  };

  const handleCommitmentChange = (levelId: string, days: number) => {
    setTimeCommitments(prev => ({ ...prev, [levelId]: days }));
  };

  const handleSubmitVote = async (levelId: string) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    const voteAmount = parseFloat(votes[levelId] || '0');
    if (isNaN(voteAmount) || voteAmount <= 0) {
      toast.error('Please enter a valid vote amount');
      return;
    }

    if (voteAmount > availableCredits) {
      toast.error('Insufficient credits');
      return;
    }

    const timeCommitmentDays = timeCommitments[levelId];
    if (!timeCommitmentDays) {
      toast.error('Please select a time commitment');
      return;
    }

    const ratios = equityRatios[levelId];
    if (!ratios) {
      toast.error('Unable to calculate ratios');
      return;
    }

    // Calculate commitment deadline
    const commitmentDeadline = new Date();
    commitmentDeadline.setDate(commitmentDeadline.getDate() + timeCommitmentDays);

    const { error } = await supabase
      .from('user_votes')
      .insert({
        user_id: user.id,
        production_level_id: levelId,
        vote_amount: voteAmount,
        source: 'initial_credit',
        time_commitment_days: timeCommitmentDays,
        commitment_deadline: commitmentDeadline.toISOString(),
        equity_ratio: ratios.equity,
        cash_ratio: ratios.cash,
        status: 'active'
      });

    if (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote');
    } else {
      // Process referral credit matching if code was provided
      if (referralCode) {
        try {
          const { data, error: matchError } = await supabase.functions.invoke('process-credit-match', {
            body: {
              referralCode,
              pledgeAmount: voteAmount,
              refereeId: user.id,
              productionLevelId: levelId
            }
          });

          if (matchError) {
            console.error('Credit match error:', matchError);
            toast.warning('Vote submitted but referral matching failed');
          } else if (data?.success) {
            toast.success(`Vote submitted! ${data.message}`);
          }
        } catch (matchErr) {
          console.error('Error processing credit match:', matchErr);
        }
      } else {
        toast.success(`Vote submitted! ${(ratios.equity * 100).toFixed(0)}% equity, ${(ratios.cash * 100).toFixed(0)}% cash`);
      }

      setVotes(prev => ({ ...prev, [levelId]: '' }));
      setTimeCommitments(prev => ({ ...prev, [levelId]: undefined as any }));
      onVoteSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vote on {productName}</DialogTitle>
          <DialogDescription>
            Cast your votes to help reach production levels. Your contribution follows the 1/3 rule: 1/3 supports other projects (Lianas), 1/3 goes to Medallion matching funds, and 1/3 directly funds this campaign.
          </DialogDescription>
        </DialogHeader>

        {loadingConfig ? (
          <div className="flex justify-center py-8">Loading voting options...</div>
        ) : (
          <div className="space-y-4 mt-4">
          <ReferralCodeInput 
            onCodeApplied={setReferralCode}
            disabled={Object.keys(votes).length > 0}
          />
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs">
              <strong>The Banyan Model:</strong> Every dollar you pledge helps jumpstart multiple projects. 
              This project is a Liana supported by the Banyan trunk, while supporting other Lianas through shared resources.
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Available Credits:</span>
              <span className="text-lg font-bold text-primary">
                ${availableCredits.toFixed(2)}
              </span>
            </div>
          </div>

          {productionLevels.map((level) => {
            const displayUnits = level.level_number === 1 ? 5 : level.units_count;
            const displayPrice = level.level_number === 1 ? 1000.00 : Number(level.unit_price);
            const currentRatios = equityRatios[level.id];
            const selectedCommitment = timeCommitments[level.id];
            
            return (
              <div key={level.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{level.level_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {displayUnits} units @ ${displayPrice.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ${Number(level.current_votes || 0).toFixed(0)} / ${Number(level.votes_needed || 0).toFixed(0)}
                  </span>
                </div>
                <Progress 
                  value={
                    level.votes_needed > 0 
                      ? (Number(level.current_votes || 0) / Number(level.votes_needed)) * 100 
                      : 0
                  } 
                />
                
                {/* Time Commitment Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Commitment
                  </label>
                  <Select
                    value={selectedCommitment?.toString()}
                    onValueChange={(value) => handleCommitmentChange(level.id, parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select commitment period" />
                    </SelectTrigger>
                    <SelectContent>
                      {votingConfig?.time_commitment_options?.map((option: any) => (
                        <SelectItem key={option.days} value={option.days.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Equity/Cash Ratio Display */}
                {currentRatios && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      Commitment Allocation
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Equity</div>
                        <div className="text-lg font-bold text-primary">
                          {(currentRatios.equity * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Cash Value</div>
                        <div className="text-lg font-bold">
                          {(currentRatios.cash * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Longer commitment = more equity. If goal isn't met by deadline, votes revert to your account.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={votes[level.id] || ''}
                    onChange={(e) => handleVoteChange(level.id, e.target.value)}
                  />
                  <Button 
                    onClick={() => handleSubmitVote(level.id)}
                    disabled={
                      !votes[level.id] || 
                      parseFloat(votes[level.id]) <= 0 || 
                      !timeCommitments[level.id]
                    }
                  >
                    Vote
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
