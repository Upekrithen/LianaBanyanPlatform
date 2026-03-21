import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function MembershipConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newExpiration, setNewExpiration] = useState<string | null>(null);

  useEffect(() => {
    const confirmMembership = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('Missing confirmation token');
        setLoading(false);
        return;
      }

      try {
        const { data, error: confirmError } = await supabase.functions.invoke('confirm-membership', {
          body: { token },
        });

        if (confirmError) throw confirmError;

        if (data.success) {
          setSuccess(true);
          setNewExpiration(data.new_expiration);
        } else {
          setError(data.error || 'Failed to extend membership');
        }
      } catch (err: any) {
        console.error('Error confirming membership:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    confirmMembership();
  }, [searchParams]);

  return (
    <PortalPageLayout>
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {success && <CheckCircle className="h-5 w-5 text-green-600" />}
            {error && <XCircle className="h-5 w-5 text-red-600" />}
            Membership Confirmation
          </CardTitle>
          <CardDescription>
            {loading && 'Confirming your membership extension...'}
            {success && 'Your membership has been extended!'}
            {error && 'Unable to confirm membership'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <p className="text-center text-muted-foreground">
              Please wait while we process your confirmation...
            </p>
          )}

          {success && (
            <>
              <div className="bg-green-50 dark:bg-green-950 border border-green-500 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✅ Success! Your free membership has been extended by 30 days.
                </p>
                {newExpiration && (
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    New expiration: {new Date(newExpiration).toLocaleDateString()}
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                You'll receive another reminder 7 days before your membership expires.
              </p>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            </>
          )}

          {error && (
            <>
              <div className="bg-red-50 dark:bg-red-950 border border-red-500 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  ❌ {error}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                This confirmation link may have expired or already been used. Please contact support if you need assistance.
              </p>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                Return to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}