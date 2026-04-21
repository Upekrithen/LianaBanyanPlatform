import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Share2, Users, Award, Copy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function ReferralManager() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<any>(null);
  const [shareAmount, setShareAmount] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [activeReferrals, setActiveReferrals] = useState<any[]>([]);
  const [medallionEligibility, setMedallionEligibility] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Load user credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (creditsError && creditsError.code !== 'PGRST116') {
        console.error('Error loading credits:', creditsError);
      }
      setCredits(creditsData);

      // Load active referrals
      const { data: referrals, error: referralsError } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .eq('status', 'active');

      if (referralsError) {
        console.error('Error loading referrals:', referralsError);
      }
      setActiveReferrals(referrals || []);

      // Load medallion eligibility
      const { data: eligibility, error: eligibilityError } = await supabase
        .from('member_medallion_collection')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (eligibilityError) {
        console.error('Error loading medallion eligibility:', eligibilityError);
      }
      setMedallionEligibility(eligibility);
    } catch (err) {
      console.error('Referral data load failed:', err);
      toast.error('Unable to load referral data. Please refresh.');
    }
  };

  const handleCreateReferral = async () => {
    if (!user || !credits) return;

    const amount = parseFloat(shareAmount);
    if (isNaN(amount) || amount < 10) {
      toast.error('Minimum share amount is $10');
      return;
    }

    const availableCredits = Number(credits.total_credits) - Number(credits.used_credits);
    if (amount > availableCredits) {
      toast.error('Insufficient credits available');
      return;
    }

    // Generate unique referral code
    const code = `REF-${user.id.slice(0, 8)}-${Date.now().toString(36)}`.toUpperCase();

    const { error } = await supabase
      .from('user_referrals')
      .insert({
        referrer_id: user.id,
        referee_email: '',
        referral_code: code,
        shared_credit_amount: amount,
        max_uses: 9,
        status: 'active'
      } as any);

    if (error) {
      console.error('Error creating referral:', error);
      toast.error('Failed to create referral');
    } else {
      setReferralCode(code);
      toast.success('Referral code created!');
      loadData();
      setShareAmount('');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Referral code copied!');
  };

  const availableCredits = credits
    ? Number(credits.total_credits) - Number(credits.used_credits)
    : 0;

  const medallionProgress = medallionEligibility
    ? (Number(medallionEligibility.total_contribution) / 1000) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Medallion Eligibility Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Medallion Eligibility
          </CardTitle>
          <CardDescription>
            Reach $1,000 in contributions to earn a verified ledger-tracked medallion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">
                ${medallionEligibility?.total_contribution || 0} / $1,000
              </span>
            </div>
            <Progress value={Math.min(medallionProgress, 100)} />
          </div>

          {medallionEligibility && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Direct Pledges</div>
                <div className="font-medium">${medallionEligibility.total_direct_pledges}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Matched Credits</div>
                <div className="font-medium">${medallionEligibility.total_matched_credits}</div>
              </div>
            </div>
          )}

          {medallionEligibility?.is_eligible && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium text-primary">
                🎉 Eligible for Medallion! Will be minted in next production batch.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Referral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Credits & Form Your Tribe
          </CardTitle>
          <CardDescription>
            Share credits with up to 9 friends to form your tribe. When they pledge, you both get matched credits!
            Perfect for building your collaborative team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>Available to Share:</strong> ${availableCredits.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shareAmount">Amount to Share (min $10)</Label>
            <div className="flex gap-2">
              <Input
                id="shareAmount"
                type="number"
                step="0.01"
                min="10"
                placeholder="10.00"
                value={shareAmount}
                onChange={(e) => setShareAmount(e.target.value)}
              />
              <Button onClick={handleCreateReferral} disabled={!shareAmount}>
                Create Code
              </Button>
            </div>
          </div>

          {referralCode && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono font-bold">{referralCode}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(referralCode)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this code with up to 9 friends. Valid for one production cycle.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Referrals */}
      {activeReferrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeReferrals.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <code className="text-sm font-mono">{ref.referral_code}</code>
                    <div className="text-xs text-muted-foreground">
                      {ref.current_uses} / {ref.max_uses} uses • ${ref.shared_credit_amount} shared
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(ref.referral_code)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Credit Matching & Tribe Formation Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Share any amount over $10 with up to 9 friends (perfect tribe size: 2-10 members)</p>
          <p>2. When they use your code and pledge, their amount is matched (up to your shared amount)</p>
          <p>3. Both you and your friend receive matched credits toward medallion eligibility</p>
          <p>4. Reach $1,000 total to earn a verified ledger-tracked medallion</p>
          <p className="pt-2 font-medium">💡 Tip: Once you've shared with 9 people, consider forming a tribe together for 25% resource discounts!</p>
        </CardContent>
      </Card>
    </div>
  );
}
