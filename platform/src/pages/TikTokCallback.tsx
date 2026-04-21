/**
 * TikTok OAuth Callback Page
 *
 * Handles the redirect from TikTok after user authorizes.
 * URL: /auth/tiktok/callback
 *
 * Flow:
 * 1. User clicks "Connect TikTok" in HofundStudio
 * 2. Redirected to TikTok authorization
 * 3. User approves
 * 4. TikTok redirects here with ?code=XXX
 * 5. We exchange code for access token
 * 6. Store token and redirect to success page
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

type CallbackStatus = 'processing' | 'success' | 'error';

export default function TikTokCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Check for errors from TikTok
    if (errorParam) {
      setStatus('error');
      setError(errorDescription || errorParam || 'Authorization was denied');
      return;
    }

    // Verify we have a code
    if (!code) {
      setStatus('error');
      setError('No authorization code received from TikTok');
      return;
    }

    // Verify state matches (CSRF protection)
    const savedState = sessionStorage.getItem('tiktok_oauth_state');
    if (state && savedState && state !== savedState) {
      setStatus('error');
      setError('Security validation failed. Please try again.');
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Store the code for after login
        sessionStorage.setItem('tiktok_pending_code', code);
        setStatus('error');
        setError('Please sign in to connect your TikTok account');
        return;
      }

      // Exchange code for access token via Edge Function
      const response = await supabase.functions.invoke('tiktok-oauth', {
        body: {
          action: 'exchange-code',
          code,
          userId: user.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to connect TikTok');
      }

      const data = response.data;

      if (data.success) {
        setUsername(data.username || 'TikTok User');
        setStatus('success');

        // Clear state
        sessionStorage.removeItem('tiktok_oauth_state');

        // Redirect after a moment
        setTimeout(() => {
          navigate('/hofund?connected=tiktok');
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to connect TikTok');
      }

    } catch (err: any) {
      console.error('TikTok callback error:', err);
      setStatus('error');
      setError(err.message || 'Failed to connect TikTok account');
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {status === 'processing' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Connecting TikTok...
              </h2>
              <p className="text-muted-foreground">
                Please wait while we complete the connection.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                TikTok Connected!
              </h2>
              <p className="text-muted-foreground mb-4">
                {username ? `Welcome, @${username}!` : 'Your account is now linked.'}
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to Hofund Studio...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Connection Failed
              </h2>
              <p className="text-muted-foreground mb-6">
                {error || 'Something went wrong. Please try again.'}
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate('/hofund')} variant="default">
                  Return to Hofund Studio
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
