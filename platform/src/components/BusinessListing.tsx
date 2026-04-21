/**
 * BUSINESS LISTING COMPONENT
 * ==========================
 * Displays businesses (anchors) with their C+20 certification status.
 * Used in Senate Hall of Businesses and other contexts.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

import { CostPlusBadge, CostPlusBadgeInline } from './CostPlusBadge';
import { getCostPlusTier, type Anchor } from '@/lib/costPlusService';

import {
  Building2,
  Search,
  ExternalLink,
  MapPin,
  Package,
  Users,
  ArrowRight,
  Filter,
  RefreshCw,
  Store,
  Sparkles,
} from 'lucide-react';

interface BusinessListingProps {
  variant?: 'grid' | 'list' | 'compact';
  showFilters?: boolean;
  limit?: number;
  filterC20Only?: boolean;
  className?: string;
}

export function BusinessListing({
  variant = 'grid',
  showFilters = true,
  limit = 20,
  filterC20Only = false,
  className,
}: BusinessListingProps) {
  const [businesses, setBusinesses] = useState<Anchor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showC20Only, setShowC20Only] = useState(filterC20Only);

  useEffect(() => {
    loadBusinesses();
  }, [showC20Only, limit]);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('anchors')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (showC20Only) {
        query = query.eq('verified_cost_plus', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBusinesses((data || []) as Anchor[]);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter((b) =>
    searchQuery
      ? b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const c20Count = businesses.filter((b) => getCostPlusTier(b) !== 'NONE').length;

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {showFilters && <Skeleton className="h-10 w-full" />}
        <div className={cn(
          variant === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"
        )}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className={variant === 'grid' ? "h-48" : "h-24"} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={showC20Only ? "default" : "outline"}
              onClick={() => setShowC20Only(!showC20Only)}
              className={cn(
                showC20Only
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "border-slate-600"
              )}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              C+20 Only ({c20Count})
            </Button>
            <Button variant="outline" onClick={loadBusinesses} className="border-slate-600">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {filteredBusinesses.length === 0 ? (
        <div className="text-center py-12">
          <Store className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No Businesses Found</h3>
          <p className="text-slate-500">
            {showC20Only
              ? "No C+20 certified businesses yet. Be the first!"
              : "No businesses match your search."}
          </p>
        </div>
      ) : variant === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : variant === 'list' ? (
        <div className="space-y-3">
          {filteredBusinesses.map((business) => (
            <BusinessRow key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBusinesses.map((business) => (
            <BusinessCompact key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
}

function BusinessCard({ business }: { business: Anchor }) {
  const tier = getCostPlusTier(business);
  const hasC20 = tier !== 'NONE';

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-lg",
      hasC20
        ? "bg-slate-900/50 border-emerald-500/30 hover:border-emerald-500/50"
        : "bg-slate-900/50 border-slate-700 hover:border-slate-600"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              hasC20 ? "bg-emerald-500/20" : "bg-slate-800"
            )}>
              <Building2 className={cn(
                "w-5 h-5",
                hasC20 ? "text-emerald-400" : "text-slate-400"
              )} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-white text-lg truncate">{business.name}</CardTitle>
              {business.category && (
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 mt-1">
                  {business.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {business.description && (
          <p className="text-sm text-slate-400 line-clamp-2">{business.description}</p>
        )}

        <div className="flex items-center justify-between">
          <CostPlusBadge anchor={business} size="sm" />
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            View
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BusinessRow({ business }: { business: Anchor }) {
  const tier = getCostPlusTier(business);
  const hasC20 = tier !== 'NONE';

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-lg border transition-all hover:bg-slate-800/50",
      hasC20
        ? "bg-slate-900/30 border-emerald-500/20 hover:border-emerald-500/40"
        : "bg-slate-900/30 border-slate-700 hover:border-slate-600"
    )}>
      <div className={cn(
        "p-2 rounded-lg flex-shrink-0",
        hasC20 ? "bg-emerald-500/20" : "bg-slate-800"
      )}>
        <Building2 className={cn(
          "w-5 h-5",
          hasC20 ? "text-emerald-400" : "text-slate-400"
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-white truncate">{business.name}</h4>
          {business.category && (
            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
              {business.category}
            </Badge>
          )}
        </div>
        {business.description && (
          <p className="text-sm text-slate-500 truncate">{business.description}</p>
        )}
      </div>

      <CostPlusBadge anchor={business} size="sm" />

      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white flex-shrink-0">
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function BusinessCompact({ business }: { business: Anchor }) {
  const tier = getCostPlusTier(business);
  const hasC20 = tier !== 'NONE';

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <Building2 className={cn(
          "w-4 h-4 flex-shrink-0",
          hasC20 ? "text-emerald-400" : "text-slate-500"
        )} />
        <span className="text-slate-300 truncate">{business.name}</span>
        {hasC20 && <CostPlusBadgeInline anchor={business} />}
      </div>
      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white h-6 px-2">
        <ExternalLink className="w-3 h-3" />
      </Button>
    </div>
  );
}

/**
 * Hall of Businesses - Full page component for Senate
 */
export function HallOfBusinesses() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Hall of Businesses</h2>
        <p className="text-slate-400">
          Member businesses in the cooperative ecosystem.
          Look for the <span className="text-emerald-400 font-medium">C+20</span> badge
          for transparent pricing.
        </p>
      </div>

      <BusinessListing variant="grid" showFilters={true} limit={50} />

      <div className="text-center pt-4">
        <Link to="/c20/leaderboard">
          <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
            <Sparkles className="w-4 h-4 mr-2" />
            View C+20 Leaderboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default BusinessListing;
