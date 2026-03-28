/**
 * BillSearch — live debounced search against Congress.gov API.
 * Shows results as cards with "Track This Bill" action.
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, Loader2, Bookmark, AlertCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  introduced: 'bg-slate-500 text-white',
  committee: 'bg-amber-600 text-white',
  passed_house: 'bg-blue-600 text-white',
  passed_senate: 'bg-indigo-600 text-white',
  signed: 'bg-green-700 text-white',
  vetoed: 'bg-red-700 text-white',
};

const STATUS_LABELS: Record<string, string> = {
  introduced: 'Introduced',
  committee: 'In Committee',
  passed_house: 'Passed House',
  passed_senate: 'Passed Senate',
  signed: 'Signed Into Law',
  vetoed: 'Vetoed',
};

interface SearchResult {
  bill_number: string;
  title: string;
  congress: number;
  bill_type: string;
  sponsor: string | null;
  sponsor_party: string | null;
  status: string;
  introduced_date: string | null;
  last_action_date: string | null;
  last_action: string | null;
  policy_area: string | null;
  congress_url: string | null;
}

export default function BillSearch() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingIds, setTrackingIds] = useState<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim() || query.length < 3) {
      setResults([]);
      setError(null);
      return;
    }
    timerRef.current = setTimeout(() => doSearch(query.trim()), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const doSearch = async (q: string) => {
    setSearching(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('congress-api-sync', {
        body: {},
        headers: {},
      });
      // Use the query parameter approach
      const resp = await fetch(
        `${(supabase as any).supabaseUrl}/functions/v1/congress-api-sync?mode=search&q=${encodeURIComponent(q)}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!resp.ok) throw new Error(`Search failed (${resp.status})`);
      const json = await resp.json();
      setResults(json.results || []);
    } catch (e: any) {
      setError('Search unavailable — showing cached bills');
      setResults([]);
    }
    setSearching(false);
  };

  const handleTrack = async (result: SearchResult) => {
    if (!user) { toast.error('Sign in to track bills'); return; }
    const key = result.bill_number;
    if (trackingIds.has(key)) return;
    setTrackingIds(prev => new Set(prev).add(key));

    try {
      // Check if bill already exists
      const { data: existing } = await (supabase as any)
        .from('tracked_bills')
        .select('id')
        .eq('bill_number', result.bill_number)
        .limit(1);

      let billId: string;
      if (existing && existing.length > 0) {
        billId = existing[0].id;
      } else {
        const { data: inserted, error } = await (supabase as any)
          .from('tracked_bills')
          .insert({
            bill_number: result.bill_number,
            title: result.title,
            congress: result.congress,
            bill_type: result.bill_type,
            status: result.status,
            sponsor_name: result.sponsor,
            sponsor_party: result.sponsor_party,
            introduced_date: result.introduced_date,
            last_action_date: result.last_action_date,
            last_action: result.last_action,
            policy_area: result.policy_area,
            congress_url: result.congress_url,
            is_live: true,
            last_synced_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        if (error) throw error;
        billId = inserted.id;
      }

      await (supabase as any).from('member_bill_tracking').upsert({
        user_id: user.id,
        bill_id: billId,
      }, { onConflict: 'user_id,bill_id' });

      toast.success(`Now tracking ${result.bill_number}`);
      queryClient.invalidateQueries({ queryKey: ['tracked-bills'] });
      queryClient.invalidateQueries({ queryKey: ['member-bill-tracking'] });
    } catch (e: any) {
      toast.error(e.message || 'Failed to track bill');
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search Congress.gov — e.g. 'cooperative', 'housing', 'food security'..."
          className="pl-10"
        />
        {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-400">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''} from Congress.gov</p>
          {results.map((r, i) => (
            <Card key={`${r.bill_number}-${i}`} className="bg-card border-border">
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className="bg-blue-600 text-white text-xs">{r.bill_number}</Badge>
                      {r.status && (
                        <Badge className={`text-xs ${STATUS_COLORS[r.status] || 'bg-slate-500 text-white'}`}>
                          {STATUS_LABELS[r.status] || r.status}
                        </Badge>
                      )}
                      {r.policy_area && (
                        <Badge variant="outline" className="text-[10px]">{r.policy_area}</Badge>
                      )}
                    </div>
                    <p className="font-medium text-sm text-foreground line-clamp-2">{r.title}</p>
                    {r.sponsor && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Sponsor: {r.sponsor} {r.sponsor_party ? `(${r.sponsor_party})` : ''}
                      </p>
                    )}
                  </div>
                  {user && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-xs"
                      disabled={trackingIds.has(r.bill_number)}
                      onClick={() => handleTrack(r)}
                    >
                      <Bookmark className="h-3 w-3 mr-1" />
                      {trackingIds.has(r.bill_number) ? 'Tracked' : 'Track'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
