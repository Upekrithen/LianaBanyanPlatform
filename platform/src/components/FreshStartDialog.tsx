/**
 * 70 TIMES 7 — Fresh Start Dialog
 *
 * Allows members to reset their reputation counters while keeping:
 * - Portfolio items
 * - Collected cards
 * - IP stakes
 * - Credits & Joules balances
 *
 * Cost: 1 Mark per reset
 * Limit: 490 total resets (70 × 7)
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FreshStartStats {
  fresh_start_count: number;
  marks_balance: number;
  reputation_score: number;
  guild_level: number;
  account_age_days: number;
}

export function FreshStartDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<FreshStartStats | null>(null);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadStats();
    }
  }, [isOpen, user]);

  async function loadStats() {
    const { data } = await supabase
      .from('profiles')
      .select('fresh_start_count, marks_balance, reputation_score, guild_level, account_age_days')
      .eq('id', user?.id)
      .single();

    if (data) {
      setStats(data as FreshStartStats);
    }
  }

  async function performFreshStart() {
    if (!user) return;
    if (confirmText !== 'FRESH START') {
      toast({
        title: "Confirmation required",
        description: "Please type 'FRESH START' to confirm.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('perform_fresh_start', {
        p_user_id: user.id
      });

      if (error) throw error;

      const result = data as any;

      if (result.success) {
        toast({
          title: "Fresh Start Complete 🌱",
          description: result.message,
        });
        setIsOpen(false);
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        toast({
          title: "Cannot start fresh",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const remainingResets = stats ? 490 - (stats.fresh_start_count || 0) : 490;
  const canReset = stats && stats.marks_balance >= 1 && remainingResets > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-600 hover:bg-yellow-50">
          🌱 70x7
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🌱 70 Times 7 — Fresh Start
          </DialogTitle>
          <DialogDescription>
            Reset your reputation counters. Keep your portfolio, cards, and IP stakes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-slate-600">Current Status</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Resets Used: <strong>{stats?.fresh_start_count || 0}</strong></div>
              <div>Remaining: <strong>{remainingResets}</strong></div>
              <div>Account Age: <strong>{stats?.account_age_days || 0} days</strong></div>
              <div>Marks Balance: <strong>{stats?.marks_balance || 0}</strong></div>
            </div>
          </div>

          {/* What Gets Reset */}
          <div className="border rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-red-600">What Gets Reset</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>❌ Reputation Score → 0</li>
              <li>❌ Guild Level → 1</li>
              <li>❌ Total Earned counter → 0</li>
              <li>❌ Referral count → 0</li>
              <li>❌ Discovery progress → Fresh</li>
              <li>❌ Active streak → 0 days</li>
            </ul>
          </div>

          {/* What You Keep */}
          <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-green-700">What You Keep</h4>
            <ul className="text-sm text-green-600 space-y-1">
              <li>✓ All portfolio items & purchases</li>
              <li>✓ Collected deck cards</li>
              <li>✓ IP stakes & patent participation</li>
              <li>✓ Credits balance (minus 1 Mark cost)</li>
              <li>✓ Joules balance (collateral)</li>
              <li>✓ Medallions earned</li>
            </ul>
          </div>

          {/* Cost */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Cost:</strong> 1 Mark per fresh start. You have {stats?.marks_balance || 0} Marks.
            </p>
          </div>

          {/* Confirmation */}
          {canReset && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Type "FRESH START" to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="FRESH START"
              />
            </div>
          )}

          {!canReset && stats?.marks_balance !== undefined && stats.marks_balance < 1 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                You need at least 1 Mark to start fresh. Earn Marks through platform activity.
              </p>
            </div>
          )}

          {remainingResets === 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-700">
                You've used all 490 resets (70 × 7). Your journey of forgiveness is complete.
                Build from here.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={performFreshStart}
            disabled={!canReset || confirmText !== 'FRESH START' || isLoading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isLoading ? 'Processing...' : '🌱 Start Fresh'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FreshStartDialog;
