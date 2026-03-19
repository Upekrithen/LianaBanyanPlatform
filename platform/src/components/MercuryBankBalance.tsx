/**
 * MERCURY BANK BALANCE — Live Bank Balance Display
 * ==================================================
 * Fetches real-time bank balance from Mercury via Supabase Edge Function.
 * Displays aggregate balance + per-account breakdowns + sanitized transactions.
 *
 * MIGRATED FROM: escape-velocity site → SantaTransparency.tsx
 * EDGE FUNCTION: get-mercury-balance (calls Mercury API v1)
 *
 * The Edge Function sanitizes transaction descriptions for privacy:
 *   - Incoming: "Owner Deposit", "Stripe Payout (Donations)", "Internal Transfer"
 *   - Outgoing: "Gift Purchase", "Shipping Cost", "Expense"
 *
 * The Founder deposited $1K from the family emergency fund.
 * The Founder tested Stripe with 3× $5 payments ($15 total).
 * Both showed up in realtime via Mercury API.
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2, RefreshCw, TrendingUp, ArrowUpRight, ArrowDownRight,
  ShieldCheck, AlertCircle, Wallet,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

interface MercuryAccount {
  accountId: string;
  accountName: string;
  accountNumber: string; // Masked: "****1234"
  currentBalance: number;
  availableBalance: number;
  recentTransactions: MercuryTransaction[];
}

interface MercuryTransaction {
  id: string;
  date: string;
  amount: number;
  description: string; // Sanitized: "Owner Deposit", "Stripe Payout", etc.
  type: 'credit' | 'debit';
  status: string;
}

interface MercuryData {
  totalBalance: number;
  totalAvailable: number;
  accounts: MercuryAccount[];
}

interface StripeData {
  availableBalance: number;
  pendingBalance: number;
  totalBalance: number;
  totalReceived: number;
  totalDonors: number;
  totalGiftsFunded: number;
  totalVotes: number;
  recentTransactions: {
    id: string;
    date: string;
    type: string;
    amount: number;
    tier: string;
    description: string;
    donorName: string;
  }[];
}

// ============================================================================
// COMPONENT
// ============================================================================

interface MercuryBankBalanceProps {
  /** Show full dashboard or compact summary */
  variant?: 'full' | 'compact' | 'stripe-only';
  /** Auto-refresh interval in minutes (0 = no auto-refresh) */
  autoRefreshMinutes?: number;
  /** Optional className */
  className?: string;
}

export function MercuryBankBalance({
  variant = 'full',
  autoRefreshMinutes = 5,
  className = '',
}: MercuryBankBalanceProps) {
  const [mercuryData, setMercuryData] = useState<MercuryData | null>(null);
  const [stripeData, setStripeData] = useState<StripeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Fetch Mercury balance
    try {
      const { data: mercResp, error: mercErr } = await supabase.functions.invoke(
        'get-mercury-balance',
        { method: 'GET' }
      );
      if (!mercErr && mercResp?.mercury) {
        setMercuryData(mercResp.mercury);
      }
    } catch (e) {
      console.error('Mercury fetch error:', e);
      // Non-fatal — Mercury errors don't block the page
    }

    // Fetch Stripe transparency data
    try {
      const { data: stripeResp, error: stripeErr } = await supabase.functions.invoke(
        'get-transparency-data',
        { method: 'GET' }
      );
      if (!stripeErr && stripeResp?.stripe) {
        setStripeData(stripeResp.stripe);
      }
    } catch (e) {
      console.error('Stripe fetch error:', e);
    }

    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    if (autoRefreshMinutes > 0) {
      const interval = setInterval(fetchData, autoRefreshMinutes * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefreshMinutes]);

  if (variant === 'compact') {
    return (
      <CompactBalance
        mercury={mercuryData}
        stripe={stripeData}
        loading={loading}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Live Data Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">LIVE DATA</span>
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              Updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Mercury Bank Balance */}
      {mercuryData ? (
        <Card className="border-2 border-indigo-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Mercury Bank Account
              <Badge className="bg-indigo-600 text-xs">Mercury API</Badge>
            </CardTitle>
            <CardDescription>
              Real-time bank balance — no screenshots, just facts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Total Balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <div className="text-sm opacity-80">Current Balance</div>
                <div className="text-4xl font-bold mt-2">
                  ${mercuryData.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm mt-2 opacity-70">
                  Available: ${mercuryData.totalAvailable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Per-Account Breakdown */}
              <div className="space-y-3">
                {mercuryData.accounts.map(account => (
                  <div key={account.accountId} className="p-4 rounded-lg bg-muted/30 border">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">{account.accountName}</div>
                        <div className="text-xs text-muted-foreground">{account.accountNumber}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600">
                          ${account.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bank Transactions (Sanitized) */}
            {mercuryData.accounts[0]?.recentTransactions?.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-3">Recent Bank Activity</div>
                <div className="space-y-2">
                  {mercuryData.accounts[0].recentTransactions.slice(0, 5).map(tx => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center p-3 rounded-lg bg-muted/20 border"
                    >
                      <div className="flex items-center gap-2">
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        )}
                        <div>
                          <div className="text-sm">{tx.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="py-8 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <div className="text-lg font-medium">
              {loading ? 'Loading Mercury Bank...' : 'Mercury Bank Connection'}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {loading
                ? 'Fetching live bank balance...'
                : 'Connect Mercury API to display live bank balance.'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stripe Balance */}
      {stripeData && variant !== 'stripe-only' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" />
              Stripe Payment Processing
              <Badge variant="secondary" className="text-xs">Live</Badge>
            </CardTitle>
            <CardDescription>
              Payment gateway balance and donation tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-green-500/10 text-center">
                <div className="text-xs text-muted-foreground">Available</div>
                <div className="text-lg font-bold text-green-600">
                  ${stripeData.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 text-center">
                <div className="text-xs text-muted-foreground">Pending</div>
                <div className="text-lg font-bold text-amber-600">
                  ${stripeData.pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                <div className="text-xs text-muted-foreground">Total Received</div>
                <div className="text-lg font-bold text-blue-600">
                  ${stripeData.totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 text-center">
                <div className="text-xs text-muted-foreground">Donors</div>
                <div className="text-lg font-bold text-purple-600">
                  {stripeData.totalDonors}
                </div>
              </div>
            </div>

            {/* Recent Stripe Transactions */}
            {stripeData.recentTransactions.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Recent Donations</div>
                <div className="space-y-2">
                  {stripeData.recentTransactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-2 rounded bg-muted/20">
                      <div>
                        <div className="text-sm">{tx.description}</div>
                        <div className="text-xs text-muted-foreground">{tx.donorName} • {tx.date}</div>
                      </div>
                      <div className="font-medium text-green-600">
                        +${tx.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Boaz Principle Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="w-3 h-3" />
        Boaz Principle — All financial data published in real-time
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

function CompactBalance({
  mercury,
  stripe,
  loading,
  className,
}: {
  mercury: MercuryData | null;
  stripe: StripeData | null;
  loading: boolean;
  className: string;
}) {
  const totalBalance = (mercury?.totalBalance || 0) + (stripe?.totalBalance || 0);

  return (
    <Card className={className}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <div>
              <div className="text-sm font-medium">Total Balance</div>
              <div className="text-xs text-muted-foreground">Mercury + Stripe</div>
            </div>
          </div>
          <div className="text-right">
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-lg font-bold">
                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          {mercury && (
            <Badge variant="outline" className="text-[10px]">
              🏦 Mercury: ${mercury.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Badge>
          )}
          {stripe && (
            <Badge variant="outline" className="text-[10px]">
              💳 Stripe: ${stripe.totalBalance.toFixed(2)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MercuryBankBalance;
