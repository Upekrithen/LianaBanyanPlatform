/**
 * BillDetailDrawer — slide-out panel with full bill details,
 * action timeline, sponsor info, cosponsors, and tracking toggle.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  X, ExternalLink, Bookmark, BookmarkCheck, Mail,
  Users, Calendar, Building2, Clock,
} from 'lucide-react';

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

interface BillDetailDrawerProps {
  bill: any;
  isTracked: boolean;
  onTrack: (billId: string) => void;
  onClose: () => void;
  onWriteRep?: () => void;
}

export default function BillDetailDrawer({ bill, isTracked, onTrack, onClose, onWriteRep }: BillDetailDrawerProps) {
  const { data: sponsor } = useQuery({
    queryKey: ['bill-sponsor', bill.sponsor_bioguide],
    enabled: !!bill.sponsor_bioguide,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('rep_cache')
        .select('*')
        .eq('bioguide_id', bill.sponsor_bioguide)
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: cosponsors = [] } = useQuery({
    queryKey: ['bill-cosponsors', bill.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('bill_cosponsors')
        .select('*, rep:bioguide_id (name, party, state)')
        .eq('bill_id', bill.id)
        .order('cosponsor_date', { ascending: false });
      // rep is matched by bioguide_id — may not join directly, so handle gracefully
      return data || [];
    },
  });

  const actions: any[] = Array.isArray(bill.actions) ? bill.actions : [];
  const sortedActions = [...actions].sort((a, b) =>
    new Date(b.actionDate || b.date || 0).getTime() - new Date(a.actionDate || a.date || 0).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg bg-card border-l border-border h-full overflow-y-auto animate-in slide-in-from-right-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-foreground truncate pr-4">{bill.bill_number}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Title + status */}
          <div>
            <h3 className="text-xl font-bold text-foreground leading-tight">{bill.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className="text-xs bg-blue-600 text-white">{bill.bill_number}</Badge>
              {bill.congress && <Badge variant="outline" className="text-xs">{bill.congress}th Congress</Badge>}
              {bill.status && (
                <Badge className={`text-xs ${STATUS_COLORS[bill.status] || 'bg-slate-500 text-white'}`}>
                  {STATUS_LABELS[bill.status] || bill.status}
                </Badge>
              )}
              {bill.policy_area && (
                <Badge variant="outline" className="text-xs text-purple-400 border-purple-500/30">{bill.policy_area}</Badge>
              )}
              {bill.is_live && (
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">Live Data</Badge>
              )}
            </div>
          </div>

          {/* Sponsor */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {sponsor?.photo_url ? (
                <img src={sponsor.photo_url} alt={sponsor.name} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">{bill.sponsor_name || sponsor?.name || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">
                Sponsor {bill.sponsor_party ? `(${bill.sponsor_party})` : ''} {sponsor?.state || ''}
              </p>
            </div>
          </div>

          {/* Cosponsors */}
          {(bill.cosponsors_count > 0 || cosponsors.length > 0) && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                <Users className="w-4 h-4" /> {bill.cosponsors_count || cosponsors.length} Cosponsor{(bill.cosponsors_count || cosponsors.length) !== 1 ? 's' : ''}
              </p>
              {cosponsors.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {cosponsors.slice(0, 20).map((co: any) => (
                    <div key={co.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/20">
                      <span className="text-foreground">{co.bioguide_id}</span>
                      {co.cosponsor_date && <span className="text-muted-foreground">{co.cosponsor_date}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {bill.summary && (
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Summary</p>
              <p className="text-sm text-muted-foreground">{bill.summary}</p>
            </div>
          )}

          {/* LB Relevance */}
          {bill.lb_relevance && (
            <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-800">
              <p className="text-xs font-semibold text-emerald-300 mb-1">Why This Matters to LB Members</p>
              <p className="text-sm text-emerald-200">{bill.lb_relevance}</p>
            </div>
          )}

          {/* Action Timeline */}
          {sortedActions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Action Timeline
              </p>
              <div className="relative pl-4 border-l-2 border-border space-y-3">
                {sortedActions.map((action: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-muted border-2 border-border" />
                    <p className="text-xs text-muted-foreground">{action.actionDate || action.date}</p>
                    <p className="text-sm text-foreground">{action.text || action.description}</p>
                    {action.chamber && (
                      <Badge variant="outline" className="text-[10px] mt-1">
                        <Building2 className="w-3 h-3 mr-0.5" /> {action.chamber}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {bill.introduced_date && (
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Introduced: {bill.introduced_date}</span>
            )}
            {bill.last_action_date && (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last action: {bill.last_action_date}</span>
            )}
            {bill.last_synced_at && (
              <span className="flex items-center gap-1">Synced: {new Date(bill.last_synced_at).toLocaleString()}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Button
              onClick={() => onTrack(bill.id)}
              variant={isTracked ? 'secondary' : 'default'}
              className={!isTracked ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              {isTracked ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
              {isTracked ? 'Tracking' : 'Track This Bill'}
            </Button>
            {onWriteRep && (
              <Button variant="outline" onClick={onWriteRep}>
                <Mail className="w-4 h-4 mr-2" /> Write Your Rep About This
              </Button>
            )}
            {bill.congress_url && (
              <a href={bill.congress_url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="w-full text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" /> View on Congress.gov
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
