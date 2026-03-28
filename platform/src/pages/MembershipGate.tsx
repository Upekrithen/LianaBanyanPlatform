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
    'Your own storefront (first one is free — costs LB $0.06/month)',
    'Ghost World island placement',
    'Design Arena submissions',
    'Crew Table participation',
    'Full calendar with 6 plug types',
    'Housing & vehicle listings',
    'Political Expedition tools',
    'Member Vacation Network access',
    '5 starter Credits upon joining',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-[500px]" data-xray-id="membership-gate">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Your Access Key</h1>
          <p className="text-muted-foreground">
            For $5 a year, you become a cooperative member with full access to every service.
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
              'Join for $5/year'
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Your Access Key to the cooperative.
          </p>

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
