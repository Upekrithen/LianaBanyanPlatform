import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, Key, Loader2 } from 'lucide-react';

export default function MembershipGate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteCode = searchParams.get('invite') || '';

  const handlePayment = async () => {
    if (!user) {
      navigate(`/auth?redirect=/join${inviteCode ? `?invite=${inviteCode}` : ''}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        navigate(`/auth?redirect=/join${inviteCode ? `?invite=${inviteCode}` : ''}`);
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('create-membership-checkout', {
        body: { inviteCode: inviteCode || null, isRenewal: false },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        localStorage.setItem('lb_pending_membership', 'true');
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed';
      setError(msg);
      toast({ title: 'Payment Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Full audit trail — member-only access to the deep /proofs/ archive',
    'Vote in the cooperative — governance, realm-name decisions, leader confirms',
    'Earn Marks — adversarial testing, knowledge contributions, eblet mints (Code Breakers Guild eligible)',
    'Co-authorship eligibility on the next patent bag (PROV_23 — real attribution, not gestural credit)',
    'Mesh Test access — live when we hit 1,000 members, shooting for this week',
  ];

  const handleMaybeLater = () => {
    if (document.referrer && document.referrer !== window.location.href) {
      window.history.back();
    } else {
      window.location.href = 'https://mnemosynec.org';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-[500px]" data-xray-id="membership-gate">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Join the Cooperative — $5/year</h1>
          <p className="text-muted-foreground">
            The receipts are public. The full audit trail is for members.
            $5/year. Funds the substrate. Your membership is the cooperative.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-3">
            {benefits.map(benefit => (
              <div key={benefit} className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full text-lg py-6"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Processing...</>
            ) : (
              'Join the Cooperative →'
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-1">
            Your access key. $5/year funds the substrate.
          </p>

          <button
            type="button"
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2 mt-2"
            onClick={handleMaybeLater}
          >
            Maybe later
          </button>

          {error && (
            <div className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-lg">
              {error}
              <button
                className="block mx-auto mt-2 underline hover:no-underline"
                onClick={handlePayment}
              >
                Try again
              </button>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Already a member?{' '}
            <button
              className="underline hover:text-foreground"
              onClick={() => navigate('/auth')}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
