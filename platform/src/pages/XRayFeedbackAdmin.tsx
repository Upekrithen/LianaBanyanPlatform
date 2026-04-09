import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bug, HelpCircle, Lightbulb, PenTool, ThumbsUp,
  Filter, ExternalLink, CheckCircle, XCircle, Eye, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface XRayFeedback {
  id: string;
  user_id: string;
  page_url: string;
  page_title: string | null;
  category: string;
  message: string;
  pin_x: number | null;
  pin_y: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  status: string;
  resolution_notes: string | null;
  created_at: string;
}

const CATEGORY_META: Record<string, { icon: typeof Bug; color: string; label: string }> = {
  bug: { icon: Bug, label: 'Bug', color: 'text-red-400 bg-red-500/20' },
  question: { icon: HelpCircle, label: 'Question', color: 'text-blue-400 bg-blue-500/20' },
  suggestion: { icon: Lightbulb, label: 'Suggestion', color: 'text-amber-400 bg-amber-500/20' },
  correction: { icon: PenTool, label: 'Correction', color: 'text-orange-400 bg-orange-500/20' },
  praise: { icon: ThumbsUp, label: 'Praise', color: 'text-green-400 bg-green-500/20' },
};

const STATUS_META: Record<string, { color: string; label: string }> = {
  new: { color: 'bg-blue-500/20 text-blue-400', label: 'New' },
  reviewed: { color: 'bg-amber-500/20 text-amber-400', label: 'Reviewed' },
  resolved: { color: 'bg-green-500/20 text-green-400', label: 'Resolved' },
  wontfix: { color: 'bg-white/10 text-white/40', label: "Won't Fix" },
};

export default function XRayFeedbackAdmin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPage, setFilterPage] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['xray-feedback-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xray_feedback' as never)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200) as { data: XRayFeedback[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as XRayFeedback[];
    },
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const update: Record<string, unknown> = { status };
      if (notes !== undefined) update.resolution_notes = notes;
      if (user) update.resolved_by = user.id;
      await supabase.from('xray_feedback' as never).update(update as never).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['xray-feedback-admin'] }),
  });

  const filtered = useMemo(() => {
    return feedback.filter(f => {
      if (filterCategory !== 'all' && f.category !== filterCategory) return false;
      if (filterStatus !== 'all' && f.status !== filterStatus) return false;
      if (filterPage && !f.page_url.includes(filterPage)) return false;
      return true;
    });
  }, [feedback, filterCategory, filterStatus, filterPage]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { new: 0, reviewed: 0, resolved: 0, wontfix: 0 };
    for (const f of feedback) c[f.status] = (c[f.status] || 0) + 1;
    return c;
  }, [feedback]);

  const uniquePages = useMemo(() => {
    return [...new Set(feedback.map(f => f.page_url))].sort();
  }, [feedback]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">X-Ray Feedback</h1>
        <p className="text-white/50 mb-8">All member-submitted page feedback</p>

        {/* Status summary */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
              className={`p-4 rounded-xl border transition-all text-center ${
                filterStatus === key ? 'border-primary/50 bg-primary/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-2xl font-bold text-white">{statusCounts[key] || 0}</div>
              <div className={`text-sm ${meta.color.split(' ')[1]}`}>{meta.label}</div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none"
            >
              <option value="all" className="bg-slate-900">All Categories</option>
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <option key={key} value={key} className="bg-slate-900">{meta.label}</option>
              ))}
            </select>
          </div>

          <select
            value={filterPage}
            onChange={e => setFilterPage(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none max-w-xs"
          >
            <option value="" className="bg-slate-900">All Pages</option>
            {uniquePages.map(p => (
              <option key={p} value={p} className="bg-slate-900">{p}</option>
            ))}
          </select>

          <span className="text-sm text-white/40 self-center ml-auto">
            {filtered.length} of {feedback.length} items
          </span>
        </div>

        {/* Feedback list */}
        {isLoading ? (
          <div className="text-center text-white/50 py-12">Loading feedback...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Eye className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Feedback Yet</h2>
            <p className="text-white/50">When members submit X-Ray feedback, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((f, i) => {
              const catMeta = CATEGORY_META[f.category] || CATEGORY_META.suggestion;
              const CatIcon = catMeta.icon;
              const statusMeta = STATUS_META[f.status] || STATUS_META.new;
              const isExpanded = expandedId === f.id;

              return (
                <motion.div
                  key={f.id}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className={`rounded-xl border transition-all ${
                    isExpanded ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : f.id)}
                    className="w-full p-4 flex items-start gap-3 text-left"
                  >
                    <div className={`p-1.5 rounded-lg ${catMeta.color} flex-shrink-0`}>
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusMeta.color}`}>{statusMeta.label}</span>
                        <span className="text-xs text-white/30 font-mono">{f.page_url}</span>
                      </div>
                      <p className="text-sm text-white/80 line-clamp-2">{f.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(f.created_at).toLocaleString()}</span>
                        {f.pin_x != null && <span>Pin: {f.pin_x.toFixed(0)}%, {f.pin_y?.toFixed(0)}%</span>}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                      <div className="text-sm text-white/70 whitespace-pre-wrap">{f.message}</div>

                      {f.page_url && (
                        <a
                          href={`${f.page_url}${f.pin_x != null ? `?xray_pin=${f.id}` : ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open page with pin
                        </a>
                      )}

                      {f.resolution_notes && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-white/70">
                          <div className="text-xs text-green-400 mb-1">Resolution</div>
                          {f.resolution_notes}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 items-center">
                        <input
                          type="text"
                          value={resolutionNotes}
                          onChange={e => setResolutionNotes(e.target.value)}
                          placeholder="Resolution notes (optional)"
                          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            updateMutation.mutate({ id: f.id, status: 'reviewed' });
                            setResolutionNotes('');
                          }}
                          className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/30 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Reviewed
                        </button>
                        <button
                          onClick={() => {
                            updateMutation.mutate({ id: f.id, status: 'resolved', notes: resolutionNotes || undefined });
                            setResolutionNotes('');
                          }}
                          className="px-3 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Resolve
                        </button>
                        <button
                          onClick={() => {
                            updateMutation.mutate({ id: f.id, status: 'wontfix', notes: resolutionNotes || undefined });
                            setResolutionNotes('');
                          }}
                          className="px-3 py-2 rounded-lg bg-white/10 text-white/50 text-sm hover:bg-white/20 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Won't Fix
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
