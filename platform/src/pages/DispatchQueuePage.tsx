import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getUserPlugs, type SocialPlug, type SocialPlatform } from '@/lib/socialPlugSystem';
import { getBatteryDispatchAccessStatus, SOURCE_LABELS } from '@/lib/batteryDispatchAccess';
import { BatteryDispatchUpgradeCard } from '@/components/dispatch/BatteryDispatchUpgradeCard';
import {
  PLATFORM_DISPLAY,
  PLATFORM_GUARDRAILS,
  formatInterval,
} from '@/lib/dispatchGuardrails';
import { SchedulingControlPanel } from '@/components/scheduling/SchedulingControlPanel';
import { ScheduleRotator } from '@/components/scheduling/ScheduleRotator';
import type { SchedulingEntry } from '@/components/scheduling/types';
import {
  Radio, Clock, Send, RefreshCw, XCircle, ExternalLink, CheckCircle,
  AlertTriangle, Wifi, WifiOff, Loader2, Plus, Inbox, BarChart3,
} from 'lucide-react';

interface ScheduledPost {
  id: string;
  content: string;
  platform: string;
  scheduled_for: string;
  posted_at: string | null;
  status: string;
  dispatch_mode: string | null;
  dispatch_batch_id: string | null;
  platform_post_url: string | null;
  error_message: string | null;
  retry_count: number;
  disclosure_tags: string[] | null;
  created_at: string;
}

type TabView = 'pending' | 'sent' | 'health';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  scheduled: { label: 'Scheduled', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30', icon: Clock },
  pending:   { label: 'Sending',   color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30', icon: Loader2 },
  posted:    { label: 'Delivered', color: 'text-green-600 bg-green-50 dark:bg-green-950/30', icon: CheckCircle },
  failed:    { label: 'Failed',    color: 'text-red-600 bg-red-50 dark:bg-red-950/30', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', color: 'text-gray-500 bg-gray-50 dark:bg-gray-950/30', icon: XCircle },
  suspended: { label: 'Suspended', color: 'text-orange-700 bg-orange-50 dark:bg-orange-950/30', icon: AlertTriangle },
};

export default function DispatchQueuePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabView>('pending');
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [plugs, setPlugs] = useState<SocialPlug[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeSources, setActiveSources] = useState<string[]>([]);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('member_scheduled_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: false })
      .limit(100);
    setPosts((data as ScheduledPost[] | null) || []);
  }, [user]);

  const fetchPlugs = useCallback(async () => {
    if (!user) return;
    const data = await getUserPlugs(user.id);
    setPlugs(data);
  }, [user]);

  useEffect(() => {
    Promise.all([fetchPosts(), fetchPlugs()]).then(() => setLoading(false));
  }, [fetchPosts, fetchPlugs]);

  useEffect(() => {
    if (!user) return;
    setAccessLoading(true);
    getBatteryDispatchAccessStatus(user.id)
      .then((status) => {
        setHasAccess(status.hasAccess);
        setActiveSources(status.activeSources);
      })
      .finally(() => setAccessLoading(false));
  }, [user]);

  const refresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const cancelPost = async (postId: string) => {
    await supabase
      .from('member_scheduled_posts')
      .update({ status: 'cancelled' })
      .eq('id', postId)
      .eq('user_id', user!.id);
    await fetchPosts();
  };

  const retryPost = async (postId: string) => {
    await supabase
      .from('member_scheduled_posts')
      .update({ status: 'pending', error_message: null, retry_count: 0 })
      .eq('id', postId)
      .eq('user_id', user!.id);
    await fetchPosts();
  };

  const sendNow = async (postId: string) => {
    await supabase
      .from('member_scheduled_posts')
      .update({ status: 'pending', scheduled_for: new Date().toISOString() })
      .eq('id', postId)
      .eq('user_id', user!.id);
    await fetchPosts();
  };

  const pendingPosts = posts.filter(p => p.status === 'scheduled' || p.status === 'pending');
  const sentPosts = posts.filter(
    p => p.status === 'posted' || p.status === 'failed' || p.status === 'cancelled' || p.status === 'suspended'
  );
  const pendingSchedulingEntries: SchedulingEntry[] = pendingPosts
    .filter((post) => Boolean(post.scheduled_for))
    .map((post) => ({
      id: post.id,
      contentType: 'distribution_post',
      contentId: post.id,
      contentTitle: `${PLATFORM_DISPLAY[post.platform as SocialPlatform]?.name ?? post.platform} dispatch`,
      scheduledAt: new Date(post.scheduled_for),
      target: 'cue-card-dispatch',
    }));

  const platformStats = plugs.map(plug => {
    const platform = plug.platform as SocialPlatform;
    const display = PLATFORM_DISPLAY[platform];
    const guardrail = PLATFORM_GUARDRAILS[platform];
    const recentPosts = posts.filter(
      p => p.platform === platform && p.status === 'posted' &&
      p.posted_at && new Date(p.posted_at).getTime() > Date.now() - 3600_000
    );
    const lastPost = posts.find(p => p.platform === platform && p.status === 'posted');

    return {
      platform,
      display,
      guardrail,
      plug,
      postsThisHour: recentPosts.length,
      remainingThisHour: Math.max(0, guardrail.maxPerHour - recentPosts.length),
      lastPostTime: lastPost?.posted_at ? new Date(lastPost.posted_at) : null,
      isTokenValid: !plug.lastUsedAt || true,
    };
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Sign in to view your dispatch queue.</p>
      </div>
    );
  }

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Checking Battery Dispatch access...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <BatteryDispatchUpgradeCard
        title="Dispatch Queue requires an active Battery Dispatch path"
        subtitle="Your queue reappears immediately when any qualifying path is active again."
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dispatch Queue</h1>
            <p className="text-sm text-muted-foreground">Track pending and sent dispatches</p>
            {activeSources.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Active via: {activeSources.map((source) => SOURCE_LABELS[source as keyof typeof SOURCE_LABELS] ?? source).join(', ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border hover:bg-accent transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/dashboard/dispatch')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            New Dispatch
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted">
        {([
          { key: 'pending' as const, label: 'Pending', count: pendingPosts.length },
          { key: 'sent' as const, label: 'Recent', count: sentPosts.length },
          { key: 'health' as const, label: 'Platform Health', count: plugs.length },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              tab === t.key ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-amber-100 text-amber-700' : 'bg-muted-foreground/20'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Pending tab */}
          {tab === 'pending' && (
            <div className="space-y-3">
              <div className="grid gap-3 lg:grid-cols-2">
                <SchedulingControlPanel
                  title="Dispatch Scheduling Control Panel"
                  description="Upcoming scheduled dispatches."
                  entries={pendingSchedulingEntries}
                />
                <ScheduleRotator entries={pendingSchedulingEntries} title="Dispatch Rotation" />
              </div>
              {pendingPosts.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-muted-foreground">No pending dispatches</p>
                  <button
                    onClick={() => navigate('/dashboard/dispatch')}
                    className="text-sm text-amber-600 hover:underline"
                  >
                    Compose a new dispatch →
                  </button>
                </div>
              ) : (
                pendingPosts.map(post => {
                  const display = PLATFORM_DISPLAY[post.platform as SocialPlatform] || { name: post.platform, icon: '?', color: '#888' };
                  const status = STATUS_CONFIG[post.status] || STATUS_CONFIG.scheduled;
                  const StatusIcon = status.icon;

                  return (
                    <div key={post.id} className="rounded-xl border bg-card p-4 space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0 mt-0.5">{display.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{display.name}</span>
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                              <StatusIcon className="w-2.5 h-2.5" />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{post.content}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Scheduled for {new Date(post.scheduled_for).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t">
                        <button
                          onClick={() => sendNow(post.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-md border hover:bg-accent transition-colors"
                        >
                          <Send className="w-2.5 h-2.5" /> Send Now
                        </button>
                        <button
                          onClick={() => cancelPost(post.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-md border hover:bg-accent transition-colors text-muted-foreground"
                        >
                          <XCircle className="w-2.5 h-2.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Sent / Recent tab */}
          {tab === 'sent' && (
            <div className="space-y-3">
              {sentPosts.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-muted-foreground">No dispatches sent yet</p>
                </div>
              ) : (
                sentPosts.map(post => {
                  const display = PLATFORM_DISPLAY[post.platform as SocialPlatform] || { name: post.platform, icon: '?', color: '#888' };
                  const status = STATUS_CONFIG[post.status] || STATUS_CONFIG.posted;
                  const StatusIcon = status.icon;

                  return (
                    <div key={post.id} className="rounded-xl border bg-card p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0 mt-0.5">{display.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{display.name}</span>
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                              <StatusIcon className="w-2.5 h-2.5" />
                              {status.label}
                            </span>
                            {post.posted_at && (
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(post.posted_at).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{post.content}</p>
                          {post.error_message && (
                            <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {post.error_message}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {post.platform_post_url && (
                            <a
                              href={post.platform_post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md hover:bg-accent transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                            </a>
                          )}
                          {post.status === 'failed' && (
                            <button
                              onClick={() => retryPost(post.id)}
                              className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-md border hover:bg-accent transition-colors"
                            >
                              <RefreshCw className="w-2.5 h-2.5" /> Retry
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Platform Health tab */}
          {tab === 'health' && (
            <div className="space-y-3">
              {platformStats.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <WifiOff className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-muted-foreground">No platforms connected</p>
                  <button
                    onClick={() => navigate('/dashboard/dispatch')}
                    className="text-sm text-amber-600 hover:underline"
                  >
                    Connect platforms →
                  </button>
                </div>
              ) : (
                platformStats.map(stat => (
                  <div key={stat.platform} className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{stat.display.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{stat.display.name}</span>
                          {stat.plug.isEnabled ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full font-medium">
                              <Wifi className="w-2.5 h-2.5" /> Connected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 dark:bg-gray-950/30 px-2 py-0.5 rounded-full font-medium">
                              <WifiOff className="w-2.5 h-2.5" /> Disabled
                            </span>
                          )}
                        </div>
                        {stat.plug.platformUsername && (
                          <p className="text-xs text-muted-foreground">@{stat.plug.platformUsername}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs">
                          <BarChart3 className="w-3 h-3 text-muted-foreground" />
                          <span className={stat.remainingThisHour === 0 ? 'text-red-500 font-bold' : 'text-muted-foreground'}>
                            {stat.remainingThisHour}/{stat.guardrail.maxPerHour} remaining
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Min interval: {formatInterval(stat.guardrail.minIntervalMs)}
                        </p>
                        {stat.lastPostTime && (
                          <p className="text-[10px] text-muted-foreground">
                            Last: {stat.lastPostTime.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
