import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Bot, Mail, CheckSquare, Megaphone, Scan, ArrowLeft, Settings, Plus,
  Calendar, Star, Check, Clock, Send, AlertCircle, RefreshCw, Zap, Loader2, ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface InboxItem {
  id: string;
  sender_name: string | null;
  sender_email: string | null;
  subject: string | null;
  body_preview: string | null;
  category: string;
  priority: number;
  status: string;
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
  posted_at?: string | null;
  post_url?: string | null;
}

interface DispatchItem {
  id: string;
  title: string | null;
  target_channel: string | null;
  status: string | null;
  approved_at: string | null;
  dispatched_at: string | null;
}

export default function MoneyPenny() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [drafts, setDrafts] = useState<SocialDraft[]>([]);
  const [dispatches, setDispatches] = useState<DispatchItem[]>([]);
  const [newAction, setNewAction] = useState('');
  const [postingId, setPostingId] = useState<string | null>(null);
  const [autoPosting, setAutoPosting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [inboxRes, actionsRes, draftsRes, dispatchRes] = await Promise.all([
      supabase.from('moneypenny_inbox').select('*').order('priority').order('received_at', { ascending: false }).limit(30),
      supabase.from('moneypenny_actions').select('*').neq('status', 'dismissed').order('status').order('priority').limit(50),
      supabase.from('moneypenny_social_drafts').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('outbound_dispatch').select('id, title, target_channel, status, approved_at, dispatched_at').order('created_at', { ascending: false }).limit(20),
    ]);
    if (inboxRes.data) setInbox(inboxRes.data as any);
    if (actionsRes.data) setActions(actionsRes.data as any);
    if (draftsRes.data) setDrafts(draftsRes.data as any);
    if (dispatchRes.data) setDispatches(dispatchRes.data as any);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

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

  const updateInboxStatus = async (id: string, status: string) => {
    await supabase.from('moneypenny_inbox').update({ status }).eq('id', id);
    setInbox(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const approveAndPost = async (draftId: string) => {
    setPostingId(draftId);
    try {
      await supabase.from('moneypenny_social_drafts').update({
        status: 'approved', approved_at: new Date().toISOString()
      }).eq('id', draftId);

      const { data } = await supabase.functions.invoke('moneypenny-auto-post', {
        body: { draftId },
      });

      if (data?.success && data.draftsPosted > 0) {
        const detail = data.details?.[0];
        setDrafts(prev => prev.map(d => d.id === draftId
          ? { ...d, status: 'posted', posted_at: new Date().toISOString(), post_url: detail?.postUrl || null }
          : d));
      } else {
        setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, status: 'approved' } : d));
      }
    } catch { setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, status: 'approved' } : d)); }
    setPostingId(null);
  };

  const postAllApproved = async () => {
    setAutoPosting(true);
    try {
      const { data } = await supabase.functions.invoke('moneypenny-auto-post', { body: {} });
      if (data?.success) await fetchAll();
    } catch { /* fallback: refresh */ await fetchAll(); }
    setAutoPosting(false);
  };

  const needsAction = inbox.filter(i => i.status === 'needs-action' || i.status === 'new');
  const pendingActions = actions.filter(a => a.status === 'pending');
  const pendingDrafts = drafts.filter(d => d.status === 'draft');

  const STATUS_ICONS: Record<string, React.ReactNode> = {
    'needs-action': <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
    'new': <Mail className="h-3.5 w-3.5 text-blue-500" />,
    'read': <Check className="h-3.5 w-3.5 text-slate-400" />,
    'replied': <Send className="h-3.5 w-3.5 text-green-500" />,
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            MoneyPenny
          </h1>
          <p className="text-muted-foreground">Your virtual administrative assistant</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="default" size="sm" className="gap-2" onClick={() => navigate('/moneypenny/briefing')}>
            <Calendar className="h-4 w-4" /> Morning Briefing
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/moneypenny/spotlight')}>
            <Star className="h-4 w-4" /> Spotlight Manager
          </Button>
          <Button variant="ghost" size="sm" className="gap-1" onClick={fetchAll}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="py-3">
            Overview
          </TabsTrigger>
          <TabsTrigger value="invitations" className="py-3">
            Inbox {needsAction.length > 0 && <Badge variant="destructive" className="ml-1.5 h-5 min-w-5 text-[10px]">{needsAction.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="communications" className="py-3">
            Social {pendingDrafts.length > 0 && <Badge className="ml-1.5 h-5 min-w-5 text-[10px] bg-purple-500">{pendingDrafts.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="publications" className="py-3">
            Dispatch
          </TabsTrigger>
          <TabsTrigger value="tasks" className="py-3">
            Tasks {pendingActions.length > 0 && <Badge className="ml-1.5 h-5 min-w-5 text-[10px] bg-amber-500">{pendingActions.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* === OVERVIEW TAB === */}
        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading dashboard...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-500" />
                    Inbox
                    {needsAction.length > 0 && <Badge variant="destructive" className="ml-2">{needsAction.length} need attention</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {inbox.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No inbound messages yet. Deploy <code>moneypenny-intake</code> and forward Gmail to its webhook URL to start receiving.</p>
                  ) : (
                    <div className="space-y-2">
                      {inbox.slice(0, 3).map(item => (
                        <div key={item.id} className="p-3 bg-muted/50 rounded-lg flex items-start gap-2">
                          {STATUS_ICONS[item.status] || <Mail className="h-3.5 w-3.5" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{item.sender_name || item.sender_email}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.subject}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] flex-shrink-0">{item.category}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="link" className="px-0 mt-2" onClick={() => setActiveTab("invitations")}>View all inbox &rarr;</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Scan className="h-5 w-5 text-green-500" />
                    Spotlight Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">Manage spotlight carousel content, view impression stats, and adjust card priority.</p>
                  </div>
                  <Button variant="link" className="px-0 mt-2" onClick={() => navigate("/moneypenny/spotlight")}>Open Spotlight Manager &rarr;</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-purple-500" />
                    Social Drafts
                    {pendingDrafts.length > 0 && <Badge className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">{pendingDrafts.length} pending</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingDrafts.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No pending drafts. System-generated posts will appear here after milestones.</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingDrafts.slice(0, 2).map(d => (
                        <div key={d.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">{d.platform}</Badge>
                            {d.content_source && <span className="text-xs text-muted-foreground">{d.content_source}</span>}
                          </div>
                          <p className="text-sm truncate">{d.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="link" className="px-0 mt-2" onClick={() => setActiveTab("communications")}>Manage social &rarr;</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-amber-500" />
                    Tasks
                    {pendingActions.length > 0 && <Badge className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{pendingActions.length} pending</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {actions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No tasks. Add manually or let Edge Functions generate them.</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingActions.slice(0, 3).map(a => (
                        <div key={a.id} className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                          <button
                            onClick={() => markActionDone(a.id)}
                            className="h-4 w-4 rounded border border-slate-300 flex-shrink-0 hover:border-green-500"
                          />
                          <span className="text-sm flex-1 truncate">{a.title}</span>
                          <Badge variant="outline" className="text-[10px]">{a.priority}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="link" className="px-0 mt-2" onClick={() => setActiveTab("tasks")}>View task board &rarr;</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* === INBOX TAB === */}
        <TabsContent value="invitations" className="space-y-4">
          <h2 className="text-xl font-semibold">Inbox — Inbound Messages</h2>
          {inbox.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No inbound messages. The <code>moneypenny-intake</code> Edge Function routes emails here when connected.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {inbox.map(item => (
                    <div key={item.id} className={`p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors ${
                      item.status === 'needs-action' ? 'bg-red-50/50 dark:bg-red-950/10' : ''
                    }`}>
                      {STATUS_ICONS[item.status] || <Mail className="h-3.5 w-3.5 mt-1" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.sender_name || item.sender_email || 'Unknown'}</span>
                          <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                          <Badge variant="outline" className="text-[10px]">P{item.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.subject}</p>
                        {item.body_preview && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.body_preview}</p>}
                        <span className="text-xs text-muted-foreground">{new Date(item.received_at).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
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
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* === SOCIAL TAB === */}
        <TabsContent value="communications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Social Media Drafts</h2>
            {drafts.some(d => d.status === 'approved' && !d.posted_at) && (
              <Button size="sm" className="gap-2" onClick={postAllApproved} disabled={autoPosting}>
                {autoPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Post All Approved
              </Button>
            )}
          </div>
          {drafts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No social drafts. The <code>moneypenny-daily-digest</code> function generates milestone posts automatically.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {drafts.map(draft => (
                <Card key={draft.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs capitalize">{draft.platform}</Badge>
                      <Badge variant={draft.status === 'draft' ? 'default' : draft.status === 'approved' ? 'secondary' : 'outline'} className="text-xs">
                        {draft.status}
                      </Badge>
                      {draft.content_source && <span className="text-xs text-muted-foreground">Source: {draft.content_source}</span>}
                    </div>
                    <p className="text-sm whitespace-pre-wrap mb-3">{draft.content}</p>
                    {draft.status === 'draft' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-1" onClick={async () => {
                          await navigator.clipboard.writeText(draft.content);
                          await supabase.from('moneypenny_social_drafts').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', draft.id);
                          setDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, status: 'approved' } : d));
                        }}>
                          <Check className="h-3.5 w-3.5" /> Approve & Copy
                        </Button>
                        <Button size="sm" variant="default" className="gap-1 bg-green-600 hover:bg-green-700"
                          disabled={postingId === draft.id}
                          onClick={() => approveAndPost(draft.id)}>
                          {postingId === draft.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Zap className="h-3.5 w-3.5" />}
                          Approve & Post
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={async () => {
                          await supabase.from('moneypenny_social_drafts').update({ status: 'rejected' }).eq('id', draft.id);
                          setDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, status: 'rejected' } : d));
                        }}>
                          Reject
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{new Date(draft.created_at).toLocaleString()}</span>
                      {draft.status === 'posted' && draft.post_url && (
                        <a href={draft.post_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> View post
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* === DISPATCH TAB === */}
        <TabsContent value="publications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Outbound Dispatch Queue</h2>
            <Button size="sm" className="gap-2" onClick={() => navigate('/dispatch')}>
              <Send className="h-4 w-4" /> Open Dispatch
            </Button>
          </div>
          {dispatches.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No dispatch items found. Create articles and outreach in the Dispatch system.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {dispatches.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.title || 'Untitled'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.target_channel && <Badge variant="outline" className="text-[10px]">{item.target_channel}</Badge>}
                          <Badge variant={item.status === 'dispatched' ? 'default' : 'secondary'} className="text-[10px]">{item.status || 'draft'}</Badge>
                        </div>
                      </div>
                      {item.dispatched_at && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {new Date(item.dispatched_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* === TASKS TAB === */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Action Items ({pendingActions.length} pending)</h2>
          </div>
          <div className="flex gap-2 mb-2">
            <Input
              value={newAction}
              onChange={e => setNewAction(e.target.value)}
              placeholder="Add a new action item..."
              className="text-sm"
              onKeyDown={e => e.key === 'Enter' && addAction()}
            />
            <Button size="sm" onClick={addAction} disabled={!newAction.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {actions.map(task => (
                  <div key={task.id} className={`p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors ${
                    task.status === 'done' ? 'opacity-50' : ''
                  }`}>
                    <button
                      onClick={() => task.status !== 'done' && markActionDone(task.id)}
                      className={`h-5 w-5 rounded border flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                        task.status === 'done'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-primary/50 hover:bg-primary/20'
                      }`}
                    >
                      {task.status === 'done' && <Check className="h-3 w-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${task.status === 'done' ? 'line-through' : ''}`}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{task.source}</Badge>
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {task.due_date}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant={task.priority === 'urgent' ? 'destructive' : 'secondary'} className="flex-shrink-0">{task.priority}</Badge>
                  </div>
                ))}
                {actions.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No action items. Add one above or let Edge Functions auto-generate them.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
