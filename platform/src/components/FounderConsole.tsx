/**
 * FounderConsole — Founder-only utility panel on Dashboard
 * =========================================================
 * Shows only for users with role === 'founder'.
 * Contains one-click maintenance buttons so the Founder
 * never has to touch a terminal for routine API pings.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, CheckCircle, XCircle, Loader2, Shield } from 'lucide-react';

interface FounderConsoleProps {
  userId?: string;
}

export function FounderConsole({ userId }: FounderConsoleProps) {
  const [isFounder, setIsFounder] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mercury keepalive state
  const [mercuryStatus, setMercuryStatus] = useState<'idle' | 'pinging' | 'success' | 'error'>('idle');
  const [mercuryMessage, setMercuryMessage] = useState('');
  const [lastPinged, setLastPinged] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const checkRole = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      setIsFounder(data?.role === 'founder');
      setLoading(false);
    };
    checkRole();
  }, [userId]);

  const pingMercury = async () => {
    setMercuryStatus('pinging');
    setMercuryMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('mercury-keepalive');

      if (error) {
        setMercuryStatus('error');
        setMercuryMessage(error.message || 'Edge function error');
        return;
      }

      if (data?.success) {
        setMercuryStatus('success');
        setMercuryMessage(data.message || 'Token kept alive');
        setLastPinged(data.pinged_at);
      } else {
        setMercuryStatus('error');
        setMercuryMessage(data?.error || 'Unknown error');
      }
    } catch (err: any) {
      setMercuryStatus('error');
      setMercuryMessage(err.message || 'Network error');
    }
  };

  // Don't render for non-founders
  if (loading || !isFounder) return null;

  return (
    <Card className="border-amber-500/30 bg-amber-950/10 mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-400 text-lg">
          <Shield className="w-5 h-5" />
          Founder Console
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mercury Keepalive */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={pingMercury}
            disabled={mercuryStatus === 'pinging'}
            variant="outline"
            className="border-amber-500/50 hover:bg-amber-500/10 text-amber-300"
          >
            {mercuryStatus === 'pinging' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : mercuryStatus === 'success' ? (
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
            ) : mercuryStatus === 'error' ? (
              <XCircle className="w-4 h-4 mr-2 text-red-400" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {mercuryStatus === 'pinging' ? 'Pinging...' : 'Keep Mercury Alive'}
          </Button>

          {mercuryMessage && (
            <span className={`text-sm ${mercuryStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {mercuryMessage}
            </span>
          )}

          {lastPinged && (
            <span className="text-xs text-slate-500">
              Last: {new Date(lastPinged).toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
