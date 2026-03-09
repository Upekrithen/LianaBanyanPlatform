/**
 * C+20 BALANCE DISPLAY
 * ====================
 * Innovation #1347: C+20 Reciprocity Balance System
 * 
 * Displays the user's C+20 reciprocity balance in various contexts:
 * - Header/navbar compact view
 * - Wallet expanded view
 * - Checkout integration
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

import { getReciprocitySummary, C20ReciprocitySummary } from '@/lib/c20ReciprocityService';
import { JouleToC20Converter } from './JouleToC20Converter';

import {
  DollarSign,
  TrendingUp,
  Package,
  ArrowRight,
  Sparkles,
  Zap,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface C20BalanceDisplayProps {
  variant?: 'compact' | 'full' | 'checkout';
  className?: string;
}

export function C20BalanceDisplay({ variant = 'compact', className }: C20BalanceDisplayProps) {
  const { user } = useAuth();
  const [anchor, setAnchor] = useState<any>(null);
  const [summary, setSummary] = useState<C20ReciprocitySummary | null>(null);
  const [jouleBalance, setJouleBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get user's anchor
      const { data: anchorData } = await supabase
        .from('anchors')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (anchorData) {
        setAnchor(anchorData);
        
        // Get reciprocity summary
        const summaryData = await getReciprocitySummary(anchorData.id);
        setSummary(summaryData);
      }

      // Get Joule balance from user_credits
      const { data: credits } = await supabase
        .from('user_credits')
        .select('joules')
        .eq('user_id', user.id)
        .single();

      if (credits) {
        setJouleBalance(credits.joules || 0);
      }
    } catch (error) {
      console.error('Error loading C+20 balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const c20Balance = summary?.reciprocity_balance || anchor?.c20_reciprocity_balance || 0;

  // Compact variant - for navbar/header
  if (variant === 'compact') {
    if (!anchor || c20Balance === 0) return null;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10",
              className
            )}
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-3 h-3" />
            </div>
            <span className="font-medium">{formatCurrency(c20Balance)}</span>
            <Badge variant="outline" className="text-[10px] px-1 py-0 border-emerald-500/30 text-emerald-400">
              C+20
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-slate-900 border-slate-700" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-white">C+20 Reciprocity Balance</h4>
              <Button variant="ghost" size="sm" onClick={loadData} className="h-6 w-6 p-0">
                <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
              </Button>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-lg p-4 border border-emerald-500/30">
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(c20Balance)}</p>
              <p className="text-xs text-emerald-300/60 mt-1">Available to spend on C+20 products</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-800/50 rounded p-2">
                <p className="text-slate-500 text-xs">Contributed</p>
                <p className="text-blue-400 font-medium">
                  {formatCurrency(summary?.total_margin_contributed || 0)}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded p-2">
                <p className="text-slate-500 text-xs">Products</p>
                <p className="text-purple-400 font-medium">
                  {summary?.products_at_c20 || 0}
                </p>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-slate-400">Joules: {formatCurrency(jouleBalance)}</span>
              </div>
              {anchor && jouleBalance > 0 && (
                <JouleToC20Converter
                  anchorId={anchor.id}
                  jouleBalance={jouleBalance}
                  c20Balance={c20Balance}
                  onConversionComplete={() => loadData()}
                />
              )}
            </div>

            <Link to="/c20" className="block">
              <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-800">
                Manage C+20 Pilot
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Full variant - for wallet page
  if (variant === 'full') {
    return (
      <Card className={cn("bg-slate-900/50 border-slate-700", className)}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            C+20 Reciprocity Balance
          </CardTitle>
          <CardDescription>
            Purchasing power earned from margin contributions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            </div>
          ) : !anchor ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Register a business to earn C+20 balance</p>
              <Link to="/build-a-business">
                <Button variant="outline" className="border-slate-600">
                  Register Business
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-lg p-6 border border-emerald-500/30">
                <p className="text-4xl font-bold text-emerald-400">{formatCurrency(c20Balance)}</p>
                <p className="text-sm text-emerald-300/60 mt-1">Available C+20 purchasing power</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Contributed
                  </div>
                  <p className="text-lg font-bold text-blue-400">
                    {formatCurrency(summary?.total_margin_contributed || 0)}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                    <DollarSign className="w-4 h-4 text-red-400" />
                    Spent
                  </div>
                  <p className="text-lg font-bold text-red-400">
                    {formatCurrency(summary?.total_balance_spent || 0)}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                    <Package className="w-4 h-4 text-purple-400" />
                    Products
                  </div>
                  <p className="text-lg font-bold text-purple-400">
                    {summary?.products_at_c20 || 0}
                  </p>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Joule Balance</p>
                    <p className="text-lg font-bold text-amber-400">{formatCurrency(jouleBalance)}</p>
                  </div>
                </div>
                {jouleBalance > 0 && (
                  <JouleToC20Converter
                    anchorId={anchor.id}
                    jouleBalance={jouleBalance}
                    c20Balance={c20Balance}
                    onConversionComplete={() => loadData()}
                  />
                )}
              </div>

              <div className="flex gap-2">
                <Link to="/c20" className="flex-1">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500">
                    Manage C+20 Pilot
                  </Button>
                </Link>
                <Link to="/c20/leaderboard">
                  <Button variant="outline" className="border-slate-600">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Checkout variant - for checkout flow
  if (variant === 'checkout') {
    if (!anchor || c20Balance === 0) return null;

    return (
      <div className={cn(
        "bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4",
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-emerald-300">C+20 Balance Available</p>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(c20Balance)}</p>
            </div>
          </div>
          <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
            Apply to Order
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

export default C20BalanceDisplay;
