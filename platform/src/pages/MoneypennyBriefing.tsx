import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Bot, Mail, CheckSquare, Megaphone, Lightbulb, Calendar, ArrowLeft, Plus,
  Send, Copy, Trash2, Check, Clock, AlertCircle, ChevronRight, RefreshCw, Sparkles
} from 'lucide-react';

interface InboxItem {
  id: string;
  sender_name: string | null;
  sender_email: string | null;
  subject: string | null;
  body_preview: string | null;
  category: string;
  priority: number;
  status: string;
  action_notes: string | null;
  received_at: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  source: string;
  priority: string;
  status: string;
  due_date: string | null;
  completed_at: string | null;
}

interface SocialDraft {
  id: string;
  platform: string;
  content: string;
  content_source: string | null;
  status: string;
  created_at: string;
}

interface IdeaItem {
  id: string;
  content: string;
  relay_to: string;
  status: string;
  created_at: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  category: string;
  status: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  'needs-action': <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
  'new': <Mail className="h-3.5 w-3.5 text-blue-500" />,
  'read': <Check className="h-3.5 w-3.5 text-slate-400" />,
  'replied': <Send className="h-3.5 w-3.5 text-green-500" />,
  'archived': <Trash2 className="h-3.5 w-3.5 text-slate-300" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  patent: 'border-purple-500 bg-purple-50 dark:bg-purple-950/20',
  deploy: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
  outreach: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
  personal: 'border-green-500 bg-green-50 dark:bg-green-950/20',
  general: 'border-slate-300 bg-slate-50 dark:bg-slate-800',
};

export default function MoneypennyBriefing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [drafts, setDrafts] = useState<SocialDraft[]>([]);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiBriefing, setAiBriefing] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [newAction, setNewAction] = useState('');
  const [newIdea, setNewIdea] = useState('');
  const [ideaRelay, setIdeaRelay] = useState('bishop');
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [inboxRes, actionsRes, draftsRes, ideasRes, scheduleRes] = await Promise.all([
      supabase.from('moneypenny_inbox').select('*').order('priority').order('received_at', { ascending: false }).limit(20),
      supabase.from('moneypenny_actions').select('*').neq('status', 'dismissed').order('status').order('priority').limit(30),
      supabase.from('moneypenny_social_drafts').select('*').eq('status', 'draft').order('created_at', { ascending: false }).limit(10),
      supabase.from('moneypenny_ideas').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('moneypenny_schedule').select('*').neq('status', 'done').order('due_date').limit(20),
    ]);
    if (inboxRes.data) setInbox(inboxRes.data as any);
    if (actionsRes.data) setActions(actionsRes.data as any);
    if (draftsRes.data) setDrafts(draftsRes.data as any);
    if (ideasRes.data) setIdeas(ideasRes.data as any);
    if (scheduleRes.data) setSchedule(scheduleRes.data as any);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchAIBriefing = async () => {
    setBriefingLoading(true);
    try {
      const context = [
        `Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
        `Pending inbox items: ${inbox.filter(i => i.status === 'new' || i.status === 'needs-action').length}`,
        `Pending action items: ${actions.filter(a => a.status === 'pending').length}`,
        `Social drafts to review: ${drafts.length}`,
        `Schedule items: ${schedule.length}`,
        `Overdue items: ${schedule.filter(s => s.due_date < new Date().toISOString().split('T')[0] && s.status !== 'done').length}`,
      ].join('\n');

      const { data, error } = await supabase.functions.invoke('moneypenny-ai-draft', {
        body: { task_type: 'generate_briefing', context },
      });
      if (!error && data?.result) {
        setAiBriefing(data.result);
      }
    } catch (err) {
      console.warn('AI briefing failed:', err);
    }
    setBriefingLoading(false);
  };

  const markActionDone = async (id: string) => {
    await supabase.from('moneypenny_actions').update({ status: 'done', completed_at: new Date().toISOString() }).eq('id', id);
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: 'done', completed_at: new Date().toISOString() } : a));
  };

  const addAction = async () => {
    if (!newAction.trim()) return;
    const { data } = await supabase.from('moneypenny_actions').insert({ title: newAction, source: 'manual', priority: 'normal' }).select().single();
    if (data) setActions(prev => [data as any, ...prev]);
    setNewAction('');
  };

  const approveDraft = async (id: string) => {
    const draft = drafts.find(d => d.id === id);
    if (draft) {
      await navigator.clipboard.writeText(draft.content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      await supabase.from('moneypenny_social_drafts').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id);
      setDrafts(prev => prev.filter(d => d.id !== id));
    }
  };

  const captureIdea = async () => {
    if (!newIdea.trim()) return;
    const { data } = await supabase.from('moneypenny_ideas').insert({ content: newIdea, relay_to: ideaRelay }).select().single();
    if (data) setIdeas(prev => [data as any, ...prev]);
    setNewIdea('');
  };

  const addScheduleItem = async () => {
    if (!newScheduleTitle.trim() || !newScheduleDate) return;
    const { data } = await supabase.from('moneypenny_schedule').insert({ title: newScheduleTitle, due_date: newScheduleDate, category: 'general' }).select().single();
    if (data) setSchedule(prev => [...prev, data as any].sort((a, b) => a.due_date.localeCompare(b.due_date)));
    setNewScheduleTitle('');
    setNewScheduleDate('');
  };

  const markScheduleDone = async (id: string) => {
    await supabase.from('moneypenny_schedule').update({ status: 'done' }).eq('id', id);
    setSchedule(prev => prev.filter(s => s.id !== id));
  };

  const updateInboxStatus = async (id: string, status: string) => {
    await supabase.from('moneypenny_inbox').update({ status }).eq('id', id);
    setInbox(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const today = new Date().toISOString().split('T')[0];
  const overdue = schedule.filter(s => s.due_date < today && s.status !== 'done');
  const pendingActions = actions.filter(a => a.status === 'pending');
  const needsAction = inbox.filter(i => i.status === 'needs-action' || i.status === 'new');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/moneypenny')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="h-7 w-7 text-primary" />
              Morning Briefing
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {' '}&middot;{' '}
              {needsAction.length} items need attention
              {overdue.length > 0 && <span className="text-red-500"> &middot; {overdue.length} overdue</span>}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={fetchAll}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        {/* AI Narrative Briefing */}
        {!loading && (
          <Card className="mb-6 bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border-violet-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  MoneyPenny AI Briefing
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={fetchAIBriefing} disabled={briefingLoading} className="text-violet-400 hover:text-violet-300">
                  {briefingLoading ? 'Thinking...' : aiBriefing ? 'Refresh' : 'Generate Briefing'}
                </Button>
              </div>
            </CardHeader>
            {aiBriefing && (
              <CardContent>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{aiBriefing}</p>
              </CardContent>
            )}
          </Card>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading briefing...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Response Tracker + Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Panel 1: Response Tracker */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-500" />
                    Response Tracker
                    {needsAction.length > 0 && (
                      <Badge variant="destructive" className="ml-2">{needsAction.length} new</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {inbox.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No inbound messages yet. When Edge Functions are connected, emails to @lianabanyan.com will appear here.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {inbox.map(item => (
                        <div key={item.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          item.status === 'needs-action' ? 'border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/10' : 'border-transparent hover:bg-muted/50'
                        }`}>
                          {STATUS_ICONS[item.status] || <Mail className="h-3.5 w-3.5" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{item.sender_name || item.sender_email || 'Unknown'}</span>
                              <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{item.subject}</p>
                          </div>
                          <div className="flex gap-1">
                            {item.status !== 'replied' && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => updateInboxStatus(item.id, 'replied')}>
                                Replied
                              </Button>
                            )}
                            {item.status === 'new' && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600" onClick={() => updateInboxStatus(item.id, 'needs-action')}>
                                Action
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Panel 2: Action Items Queue */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-amber-500" />
                    Action Items
                    {pendingActions.length > 0 && (
                      <Badge className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{pendingActions.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newAction}
                      onChange={e => setNewAction(e.target.value)}
                      placeholder="Add action item..."
                      className="text-sm"
                      onKeyDown={e => e.key === 'Enter' && addAction()}
                    />
                    <Button size="sm" onClick={addAction} disabled={!newAction.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {actions.map(action => (
                      <div key={action.id} className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                        action.status === 'done' ? 'opacity-50' : 'hover:bg-muted/50'
                      }`}>
                        <button
                          onClick={() => action.status !== 'done' && markActionDone(action.id)}
                          className={`h-5 w-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                            action.status === 'done'
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-slate-300 hover:border-primary'
                          }`}
                        >
                          {action.status === 'done' && <Check className="h-3 w-3" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${action.status === 'done' ? 'line-through' : ''}`}>{action.title}</span>
                          {action.due_date && (
                            <span className="text-xs text-muted-foreground ml-2">
                              <Clock className="h-3 w-3 inline" /> {action.due_date}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[action.priority] || ''}`}>
                          {action.priority}
                        </Badge>
                      </div>
                    ))}
                    {actions.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No action items. Add one above.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Panel 3: Social Media Draft Station */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-purple-500" />
                    Social Media Drafts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {drafts.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No pending drafts. When content milestones trigger, draft posts will appear here for your approval.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {drafts.map(draft => (
                        <div key={draft.id} className="p-3 bg-muted/30 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">{draft.platform}</Badge>
                            {draft.content_source && <span className="text-xs text-muted-foreground">from {draft.content_source}</span>}
                          </div>
                          <p className="text-sm mb-3 whitespace-pre-wrap">{draft.content}</p>
                          <div className="flex gap-2">
                            <Button size="sm" className="gap-1" onClick={() => approveDraft(draft.id)}>
                              {copiedId === draft.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              {copiedId === draft.id ? 'Copied!' : 'Approve & Copy'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500"
                              onClick={async () => {
                                await supabase.from('moneypenny_social_drafts').update({ status: 'rejected' }).eq('id', draft.id);
                                setDrafts(prev => prev.filter(d => d.id !== draft.id));
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Ideas + Schedule */}
            <div className="space-y-6">
              {/* Panel 4: Idea Capture + Relay */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Idea Capture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={newIdea}
                    onChange={e => setNewIdea(e.target.value)}
                    placeholder="Tell Bishop to... / New idea: ..."
                    className="text-sm mb-2 min-h-[80px]"
                  />
                  <div className="flex gap-2 mb-4">
                    <select
                      value={ideaRelay}
                      onChange={e => setIdeaRelay(e.target.value)}
                      className="text-xs border rounded px-2 py-1 bg-background"
                    >
                      <option value="bishop">Relay to Bishop</option>
                      <option value="knight">Relay to Knight</option>
                      <option value="rook">Relay to Rook</option>
                      <option value="founder-review">Founder Review</option>
                    </select>
                    <Button size="sm" className="gap-1 ml-auto" onClick={captureIdea} disabled={!newIdea.trim()}>
                      <Send className="h-3.5 w-3.5" /> Capture
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ideas.map(idea => (
                      <div key={idea.id} className="text-xs p-2 bg-muted/30 rounded border-l-2 border-yellow-400">
                        <div className="flex items-center gap-1 mb-1">
                          <Badge variant="outline" className="text-[9px]">{idea.relay_to}</Badge>
                          <span className="text-muted-foreground">{new Date(idea.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{idea.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Panel 5: Schedule View */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    Schedule
                    {overdue.length > 0 && (
                      <Badge variant="destructive" className="ml-2">{overdue.length} overdue</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newScheduleTitle}
                      onChange={e => setNewScheduleTitle(e.target.value)}
                      placeholder="Deadline title..."
                      className="text-sm"
                    />
                    <Input
                      type="date"
                      value={newScheduleDate}
                      onChange={e => setNewScheduleDate(e.target.value)}
                      className="text-sm w-36"
                    />
                    <Button size="sm" onClick={addScheduleItem} disabled={!newScheduleTitle.trim() || !newScheduleDate}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {schedule.map(item => {
                      const isOverdue = item.due_date < today;
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border-l-3 ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general} ${
                            isOverdue ? 'border-l-red-500' : ''
                          }`}
                        >
                          <button
                            onClick={() => markScheduleDone(item.id)}
                            className="h-4 w-4 rounded border border-slate-300 flex-shrink-0 hover:border-green-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs ${isOverdue ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                                {item.due_date}
                              </span>
                              <Badge variant="outline" className="text-[9px]">{item.category}</Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {schedule.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick nav */}
              <Card className="bg-muted/30">
                <CardContent className="p-4 space-y-2">
                  <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={() => navigate('/moneypenny')}>
                    <Bot className="h-4 w-4" /> Full Moneypenny Dashboard <ChevronRight className="h-3 w-3 ml-auto" />
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={() => navigate('/launch-tracker')}>
                    <Calendar className="h-4 w-4" /> Launch Tracker <ChevronRight className="h-3 w-3 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
