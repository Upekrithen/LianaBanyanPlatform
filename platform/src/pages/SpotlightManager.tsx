import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, BarChart3, Save, X,
  TrendingUp, MousePointerClick, Clock, Star
} from 'lucide-react';

interface SpotlightRow {
  id: string;
  category: string;
  title: string;
  subtitle: string | null;
  body_preview: string;
  body_full: string | null;
  stats: any;
  cta_label: string | null;
  cta_route: string | null;
  priority: number;
  valid_from: string | null;
  valid_until: string | null;
  time_of_day_bias: string | null;
  page_context: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ImpressionStats {
  card_id: string;
  impressions: number;
  clicks: number;
  cta_clicks: number;
  dismissals: number;
  avg_dwell_ms: number;
}

const CATEGORIES = ['featured', 'campaigns', 'benefits', 'announcements', 'makers', 'projects'];
const TIME_BIASES = [null, 'morning', 'afternoon', 'evening'];

const EMPTY_CARD: Partial<SpotlightRow> = {
  category: 'featured',
  title: '',
  subtitle: null,
  body_preview: '',
  body_full: null,
  stats: null,
  cta_label: null,
  cta_route: null,
  priority: 50,
  valid_from: null,
  valid_until: null,
  time_of_day_bias: null,
  page_context: 'landing',
  is_active: true,
  created_by: 'founder',
};

export default function SpotlightManager() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<SpotlightRow[]>([]);
  const [impressionStats, setImpressionStats] = useState<Record<string, ImpressionStats>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<SpotlightRow> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('spotlight_content' as any)
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    if (data) setCards(data as any);
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    const { data } = await supabase
      .from('spotlight_impressions' as any)
      .select('card_id, action, dwell_ms');

    if (!data) return;
    const map: Record<string, ImpressionStats> = {};
    for (const row of data as any[]) {
      if (!map[row.card_id]) {
        map[row.card_id] = { card_id: row.card_id, impressions: 0, clicks: 0, cta_clicks: 0, dismissals: 0, avg_dwell_ms: 0 };
      }
      const s = map[row.card_id];
      if (row.action === 'impression') s.impressions++;
      else if (row.action === 'click' || row.action === 'spotlight') s.clicks++;
      else if (row.action === 'cta_click') s.cta_clicks++;
      else if (row.action === 'dismiss') s.dismissals++;
      if (row.dwell_ms) s.avg_dwell_ms = (s.avg_dwell_ms * (s.impressions - 1) + row.dwell_ms) / s.impressions;
    }
    setImpressionStats(map);
  }, []);

  useEffect(() => { fetchCards(); fetchStats(); }, [fetchCards, fetchStats]);

  const saveCard = async () => {
    if (!editing || !editing.title?.trim() || !editing.body_preview?.trim()) return;

    if (isNew) {
      const { title, subtitle, body_preview, body_full, category, stats, cta_label, cta_route, priority, valid_from, valid_until, time_of_day_bias, page_context, is_active, created_by } = editing;
      await supabase.from('spotlight_content' as any).insert({
        title, subtitle, body_preview, body_full, category, stats,
        cta_label, cta_route, priority, valid_from, valid_until,
        time_of_day_bias, page_context, is_active, created_by
      });
    } else {
      const { id, created_at, updated_at, ...rest } = editing as SpotlightRow;
      await supabase.from('spotlight_content' as any).update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id);
    }
    setEditing(null);
    setIsNew(false);
    fetchCards();
  };

  const toggleActive = async (card: SpotlightRow) => {
    await supabase.from('spotlight_content' as any).update({ is_active: !card.is_active }).eq('id', card.id);
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, is_active: !c.is_active } : c));
  };

  const deleteCard = async (id: string) => {
    if (!confirm('Delete this spotlight card permanently?')) return;
    await supabase.from('spotlight_content' as any).delete().eq('id', id);
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const filtered = filter === 'all' ? cards : cards.filter(c => c.category === filter);

  const totalImpressions = Object.values(impressionStats).reduce((s, v) => s + v.impressions, 0);
  const totalClicks = Object.values(impressionStats).reduce((s, v) => s + v.clicks + v.cta_clicks, 0);
  const overallCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/moneypenny')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Star className="h-7 w-7 text-yellow-500" />
              Spotlight Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage carousel cards across the platform · {cards.length} cards total
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowStats(!showStats)}>
            <BarChart3 className="h-3.5 w-3.5" /> {showStats ? 'Hide Stats' : 'Show Stats'}
          </Button>
          <Button size="sm" className="gap-1" onClick={() => { setEditing({ ...EMPTY_CARD }); setIsNew(true); }}>
            <Plus className="h-3.5 w-3.5" /> New Card
          </Button>
        </div>

        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Impressions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MousePointerClick className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Clicks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                <p className="text-2xl font-bold">{overallCTR}%</p>
                <p className="text-xs text-muted-foreground">Overall CTR</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                <p className="text-2xl font-bold">{cards.filter(c => c.is_active).length}</p>
                <p className="text-xs text-muted-foreground">Active Cards</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', ...CATEGORIES].map(cat => (
            <Button
              key={cat}
              variant={filter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Edit form */}
        {editing && (
          <Card className="mb-6 border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{isNew ? 'Create New Card' : 'Edit Card'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Title *</label>
                  <Input value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Card title" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <select
                    value={editing.category || 'featured'}
                    onChange={e => setEditing({ ...editing, category: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm bg-background"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Body Preview *</label>
                  <Textarea value={editing.body_preview || ''} onChange={e => setEditing({ ...editing, body_preview: e.target.value })} placeholder="Short preview text shown in carousel" className="min-h-[60px]" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Body Full (optional)</label>
                  <Textarea value={editing.body_full || ''} onChange={e => setEditing({ ...editing, body_full: e.target.value })} placeholder="Extended text for spotlight view" className="min-h-[60px]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">CTA Label</label>
                  <Input value={editing.cta_label || ''} onChange={e => setEditing({ ...editing, cta_label: e.target.value })} placeholder="e.g. Learn More" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">CTA Route</label>
                  <Input value={editing.cta_route || ''} onChange={e => setEditing({ ...editing, cta_route: e.target.value })} placeholder="e.g. /patent-portfolio" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Priority (1-100)</label>
                  <Input type="number" min={1} max={100} value={editing.priority ?? 50} onChange={e => setEditing({ ...editing, priority: parseInt(e.target.value) || 50 })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Time of Day Bias</label>
                  <select
                    value={editing.time_of_day_bias || ''}
                    onChange={e => setEditing({ ...editing, time_of_day_bias: e.target.value || null })}
                    className="w-full border rounded px-3 py-2 text-sm bg-background"
                  >
                    <option value="">None</option>
                    {TIME_BIASES.filter(Boolean).map(t => <option key={t!} value={t!}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Page Context</label>
                  <Input value={editing.page_context || 'landing'} onChange={e => setEditing({ ...editing, page_context: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Subtitle (optional)</label>
                  <Input value={editing.subtitle || ''} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Valid From</label>
                  <Input type="datetime-local" value={editing.valid_from?.slice(0, 16) || ''} onChange={e => setEditing({ ...editing, valid_from: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Valid Until</label>
                  <Input type="datetime-local" value={editing.valid_until?.slice(0, 16) || ''} onChange={e => setEditing({ ...editing, valid_until: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="gap-1" onClick={saveCard}><Save className="h-3.5 w-3.5" /> Save</Button>
                <Button size="sm" variant="ghost" className="gap-1" onClick={() => { setEditing(null); setIsNew(false); }}><X className="h-3.5 w-3.5" /> Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards list */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading spotlight cards...</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(card => {
              const stats = impressionStats[card.id];
              const ctr = stats && stats.impressions > 0 ? (((stats.clicks + stats.cta_clicks) / stats.impressions) * 100).toFixed(1) : null;
              return (
                <Card key={card.id} className={`transition-opacity ${!card.is_active ? 'opacity-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{card.title}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">{card.category}</Badge>
                          <Badge variant={card.is_active ? 'default' : 'secondary'} className="text-[10px]">
                            {card.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">P:{card.priority}</Badge>
                          {card.time_of_day_bias && (
                            <Badge variant="outline" className="text-[10px]">
                              <Clock className="h-2.5 w-2.5 mr-0.5" />{card.time_of_day_bias}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{card.body_preview}</p>
                        {card.cta_label && (
                          <span className="text-xs text-primary">{card.cta_label} → {card.cta_route}</span>
                        )}
                        {showStats && stats && (
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{stats.impressions} views</span>
                            <span>{stats.clicks + stats.cta_clicks} clicks</span>
                            {ctr && <span>{ctr}% CTR</span>}
                            {stats.avg_dwell_ms > 0 && <span>{(stats.avg_dwell_ms / 1000).toFixed(1)}s avg dwell</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(card)}>
                          {card.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing({ ...card }); setIsNew(false); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteCard(card.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No cards in this category. Click "New Card" to create one.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
