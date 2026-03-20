import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import {
  Radio,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  MessageCircle,
  Globe,
  Youtube,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Edit3,
  ArrowUpRight,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  Sparkles,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  fetchSocialInbox,
  fetchSocialStats,
  fetchDailyDigest,
  approveDraft,
  editDraft,
  rejectDraft,
  markAsNoResponse,
  bulkApprove,
  bulkReject,
  bulkMarkNoResponse,
  CHANNEL_CONFIG,
  type SocialInteraction,
  type SocialMediaStats,
  type DailyDigest,
  type SocialChannel,
  type Priority,
  type ResponseStatus,
  type Sentiment,
} from "@/lib/socialMediaService";

// ─── CHANNEL ICONS ─────────────────────────────────────────────────

const CHANNEL_ICONS: Record<SocialChannel, React.ComponentType<{ className?: string }>> = {
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: TrendingUp,
  discord: MessageCircle,
  reddit: Globe,
  youtube: Youtube,
};

// ─── BADGE HELPERS ─────────────────────────────────────────────────

function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const cfg: Record<Sentiment, { label: string; cls: string }> = {
    positive: { label: "Positive", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    neutral: { label: "Neutral", cls: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
    negative: { label: "Negative", cls: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    hostile: { label: "Hostile", cls: "bg-red-500/20 text-red-300 border-red-500/30" },
  };
  const c = cfg[sentiment];
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${c.cls}`}>{c.label}</span>;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg: Record<Priority, { label: string; cls: string }> = {
    urgent: { label: "URGENT", cls: "bg-red-500/20 text-red-300 border-red-500/30 animate-pulse" },
    high: { label: "High", cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    medium: { label: "Medium", cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    low: { label: "Low", cls: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
    ignore: { label: "Ignore", cls: "bg-slate-700/20 text-slate-500 border-slate-700/30" },
  };
  const c = cfg[priority];
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${c.cls}`}>{c.label}</span>;
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    question: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    praise: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    complaint: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    feature_request: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    partnership_inquiry: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    press: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    spam: "bg-red-700/20 text-red-400 border-red-700/30",
    troll: "bg-slate-600/20 text-slate-400 border-slate-600/30",
    general: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };
  const label = category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colors[category] || colors.general}`}>{label}</span>;
}

function StatusIndicator({ status }: { status: ResponseStatus }) {
  const cfg: Record<ResponseStatus, { label: string; cls: string }> = {
    new: { label: "New", cls: "text-blue-400" },
    ai_drafted: { label: "AI Drafted", cls: "text-violet-400" },
    pending_review: { label: "Pending Review", cls: "text-yellow-400" },
    approved: { label: "Approved", cls: "text-emerald-400" },
    published: { label: "Published", cls: "text-green-400" },
    rejected: { label: "Rejected", cls: "text-red-400" },
    no_response_needed: { label: "No Response", cls: "text-slate-400" },
  };
  const c = cfg[status];
  return <span className={`text-xs font-medium ${c.cls}`}>{c.label}</span>;
}

// ─── SENTIMENT BAR ─────────────────────────────────────────────────

function SentimentBar({ stats }: { stats: SocialMediaStats }) {
  const total = stats.bySentiment.positive + stats.bySentiment.neutral + stats.bySentiment.negative + stats.bySentiment.hostile;
  if (total === 0) return null;
  const pct = (n: number) => `${((n / total) * 100).toFixed(0)}%`;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Sentiment</span>
      </div>
      <div className="flex h-3 w-full rounded-full overflow-hidden">
        <div className="bg-emerald-500 transition-all" style={{ width: pct(stats.bySentiment.positive) }} title={`Positive: ${stats.bySentiment.positive}`} />
        <div className="bg-slate-400 transition-all" style={{ width: pct(stats.bySentiment.neutral) }} title={`Neutral: ${stats.bySentiment.neutral}`} />
        <div className="bg-orange-500 transition-all" style={{ width: pct(stats.bySentiment.negative) }} title={`Negative: ${stats.bySentiment.negative}`} />
        <div className="bg-red-500 transition-all" style={{ width: pct(stats.bySentiment.hostile) }} title={`Hostile: ${stats.bySentiment.hostile}`} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span className="text-emerald-400">{stats.bySentiment.positive} positive</span>
        <span className="text-slate-400">{stats.bySentiment.neutral} neutral</span>
        <span className="text-orange-400">{stats.bySentiment.negative} negative</span>
        <span className="text-red-400">{stats.bySentiment.hostile} hostile</span>
      </div>
    </div>
  );
}

// ─── INTERACTION CARD ──────────────────────────────────────────────

function InteractionCard({
  interaction,
  isSelected,
  onSelect,
  onApprove,
  onEdit,
  onReject,
  onNoResponse,
}: {
  interaction: SocialInteraction;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onApprove: (id: string) => void;
  onEdit: (id: string, draft: string) => void;
  onReject: (id: string) => void;
  onNoResponse: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(interaction.draftResponse);
  const [notesOpen, setNotesOpen] = useState(false);
  const ChannelIcon = CHANNEL_ICONS[interaction.channel];
  const channelCfg = CHANNEL_CONFIG[interaction.channel];
  const isResolved = ["approved", "published", "rejected", "no_response_needed"].includes(interaction.responseStatus);

  return (
    <Card className={`bg-slate-900/60 border-slate-700/50 ${isResolved ? "opacity-60" : ""}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(interaction.id, !!checked)}
            className="mt-1 border-slate-600"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <ChannelIcon className={`h-4 w-4 ${channelCfg.color}`} />
              <span className="font-semibold text-white text-sm">{interaction.authorName}</span>
              <span className="text-slate-400 text-xs">{interaction.authorHandle}</span>
              {interaction.authorFollowers && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-slate-600 text-slate-400">
                  <Users className="h-2.5 w-2.5 mr-0.5" />
                  {interaction.authorFollowers >= 1000
                    ? `${(interaction.authorFollowers / 1000).toFixed(interaction.authorFollowers >= 10000 ? 0 : 1)}K`
                    : interaction.authorFollowers}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <SentimentBadge sentiment={interaction.sentiment} />
              <PriorityBadge priority={interaction.priority} />
              <CategoryBadge category={interaction.category} />
              <StatusIndicator status={interaction.responseStatus} />
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-slate-500">
              {new Date(interaction.receivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        {/* Original content */}
        <div className="pl-8 text-sm text-slate-200 bg-slate-800/40 rounded-lg p-3 border border-slate-700/30">
          {interaction.content}
        </div>

        {/* AI Notes (collapsible) */}
        <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
          <CollapsibleTrigger asChild>
            <button className="pl-8 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
              <Sparkles className="h-3 w-3" />
              AI Analysis
              <ChevronDown className={`h-3 w-3 transition-transform ${notesOpen ? "rotate-180" : ""}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pl-8 mt-1 text-xs text-slate-400 bg-violet-950/20 rounded-lg p-3 border border-violet-500/10">
              {interaction.aiNotes}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Draft response + actions */}
        {interaction.draftResponse && (
          <div className="pl-8">
            <div className="text-xs text-slate-400 mb-1 font-medium">Draft Response:</div>
            {editing ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-slate-200 text-sm min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => { onEdit(interaction.id, editText); setEditing(false); }}
                    className="bg-blue-600 hover:bg-blue-700 text-xs"
                  >
                    Save Draft
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditText(interaction.draftResponse); setEditing(false); }}
                    className="text-xs text-slate-400"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-emerald-200/80 bg-emerald-950/20 rounded-lg p-3 border border-emerald-500/10">
                {interaction.draftResponse}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {!isResolved && (
          <div className="pl-8 flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => onApprove(interaction.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1"
            >
              <CheckCircle2 className="h-3 w-3" />
              Approve & Publish
            </Button>
            {!editing && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 text-xs gap-1"
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(interaction.id)}
              className="border-red-700/50 text-red-400 hover:bg-red-950/30 text-xs gap-1"
            >
              <XCircle className="h-3 w-3" />
              Reject
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNoResponse(interaction.id)}
              className="text-slate-400 hover:text-slate-300 text-xs gap-1"
            >
              <EyeOff className="h-3 w-3" />
              No Response
            </Button>
            {interaction.relatedQAId && (
              <Button
                size="sm"
                variant="ghost"
                className="text-violet-400 hover:text-violet-300 text-xs gap-1"
              >
                <ArrowUpRight className="h-3 w-3" />
                Escalate to Q&A
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── CHANNEL HEALTH SIDEBAR ────────────────────────────────────────

function ChannelHealthSidebar({ stats }: { stats: SocialMediaStats }) {
  const channels = Object.entries(stats.byChannel).sort((a, b) => b[1] - a[1]);
  return (
    <Card className="bg-slate-900/60 border-slate-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-slate-300">Channel Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {channels.map(([ch, count]) => {
          const channel = ch as SocialChannel;
          const Icon = CHANNEL_ICONS[channel];
          const cfg = CHANNEL_CONFIG[channel];
          return (
            <div key={ch} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                <span className="text-slate-300">{cfg.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={count > 0 ? "text-white font-medium" : "text-slate-600"}>{count}</span>
                {count === 0 && <span className="text-slate-600 text-[10px]">Quiet</span>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── MAIN PAGE COMPONENT ───────────────────────────────────────────

export default function MoneyPennySocial() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [inbox, setInbox] = useState<SocialInteraction[]>([]);
  const [stats, setStats] = useState<SocialMediaStats | null>(null);
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [channelFilter, setChannelFilter] = useState<SocialChannel | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ResponseStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "priority" | "sentiment" | "channel">("priority");
  const [searchQuery, setSearchQuery] = useState("");

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Confirm dialog state
  const [confirmBulk, setConfirmBulk] = useState<null | "approve" | "reject" | "noresponse">(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [inboxData, statsData, digestData] = await Promise.all([
        fetchSocialInbox({ channel: channelFilter, priority: priorityFilter, status: statusFilter, sortBy, searchQuery: searchQuery || undefined }),
        fetchSocialStats(),
        fetchDailyDigest(),
      ]);
      setInbox(inboxData);
      setStats(statsData);
      setDigest(digestData);
    } catch (err) {
      toast({ title: "Error loading data", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [channelFilter, priorityFilter, statusFilter, sortBy, searchQuery, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelect = (id: string, checked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const actionable = inbox.filter(i => !["approved", "published", "rejected", "no_response_needed"].includes(i.responseStatus));
      setSelected(new Set(actionable.map(i => i.id)));
    } else {
      setSelected(new Set());
    }
  };

  const handleApprove = async (id: string) => {
    await approveDraft(id);
    toast({ title: "As You Wish", description: "Response approved and queued for publishing." });
    loadData();
  };

  const handleEdit = async (id: string, draft: string) => {
    await editDraft(id, draft);
    toast({ title: "Draft updated", description: "Edited draft saved for review." });
    loadData();
  };

  const handleReject = async (id: string) => {
    await rejectDraft(id);
    toast({ title: "Rejected", description: "Response rejected. No reply will be sent." });
    loadData();
  };

  const handleNoResponse = async (id: string) => {
    await markAsNoResponse(id);
    toast({ title: "Noted", description: "Marked as no response needed." });
    loadData();
  };

  const handleBulkAction = async (action: "approve" | "reject" | "noresponse") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (action === "approve") {
      const count = await bulkApprove(ids);
      toast({ title: "As You Wish", description: `${count} responses approved and queued for publishing.` });
    } else if (action === "reject") {
      const count = await bulkReject(ids);
      toast({ title: "Bulk rejected", description: `${count} interactions rejected.` });
    } else {
      const count = await bulkMarkNoResponse(ids);
      toast({ title: "Bulk marked", description: `${count} interactions marked as no response needed.` });
    }
    setSelected(new Set());
    setConfirmBulk(null);
    loadData();
  };

  const handleBulkApproveAll = async () => {
    const aiRecommended = inbox.filter(i =>
      ["pending_review", "ai_drafted"].includes(i.responseStatus) &&
      i.draftResponse &&
      i.category !== "spam" &&
      i.category !== "troll" &&
      i.sentiment !== "hostile"
    );
    if (aiRecommended.length === 0) {
      toast({ title: "Nothing to approve", description: "No AI-recommended drafts pending." });
      return;
    }
    const count = await bulkApprove(aiRecommended.map(i => i.id));
    toast({ title: "As You Wish", description: `${count} AI-recommended responses approved.` });
    loadData();
  };

  const pendingCount = inbox.filter(i => !["approved", "published", "rejected", "no_response_needed"].includes(i.responseStatus)).length;
  const estimatedMinutes = Math.max(1, Math.round(pendingCount * 1.5));

  const allChannels: (SocialChannel | "all")[] = ["all", "twitter", "instagram", "facebook", "linkedin", "tiktok", "discord", "reddit", "youtube"];

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="moneypenny-social">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Radio className="h-8 w-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Social Media Command Center</h1>
            <p className="text-sm text-slate-400">
              MoneyPenny reads it. AI drafts it. You approve it. Nothing goes out without your say.
            </p>
          </div>
        </div>

        <Separator className="my-4 bg-slate-700/50" />

        {/* Daily Digest */}
        {digest && (
          <Card className="bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-violet-950/40 border-cyan-500/20 mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-cyan-300 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Daily Briefing — {new Date(digest.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-1">
                    {digest.totalInteractions} new interactions across {Object.values(digest.channelBreakdown).filter(v => v > 0).length} channels
                    {" "} | {digest.requiresResponse} require response
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    Est. review: ~{estimatedMinutes} min
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="space-y-1">
                {digest.highlights.map((h, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5 shrink-0">-</span>
                    {h}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleBulkApproveAll}
                  className="bg-cyan-600 hover:bg-cyan-700 text-sm gap-1"
                  size="sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Bulk Approve AI-Recommended
                </Button>
                <Button
                  onClick={loadData}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 text-sm gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-white">{stats.totalInbox}</div>
                <div className="text-xs text-slate-400">Total Inbox</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.pendingReview}</div>
                <div className="text-xs text-slate-400">Pending Review</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">{stats.publishedToday}</div>
                <div className="text-xs text-slate-400">Published Today</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-slate-700/50">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  {Object.entries(stats.byChannel).filter(([, c]) => c > 0).map(([ch, c]) => {
                    const Icon = CHANNEL_ICONS[ch as SocialChannel];
                    const cfg = CHANNEL_CONFIG[ch as SocialChannel];
                    return (
                      <span key={ch} className={`inline-flex items-center gap-0.5 text-xs ${cfg.color}`} title={cfg.label}>
                        <Icon className="h-3 w-3" />{c}
                      </span>
                    );
                  })}
                </div>
                <div className="text-xs text-slate-400 mt-1">By Channel</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sentiment bar */}
        {stats && (
          <div className="mb-6">
            <SentimentBar stats={stats} />
          </div>
        )}

        {/* Main content: inbox + sidebar */}
        <div className="flex gap-6">
          {/* Inbox */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Channel tabs */}
            <Tabs value={channelFilter} onValueChange={(v) => setChannelFilter(v as SocialChannel | "all")}>
              <TabsList className="bg-slate-800/50 border border-slate-700/50 flex-wrap h-auto gap-0.5 p-1">
                {allChannels.map(ch => {
                  const label = ch === "all" ? "All" : CHANNEL_CONFIG[ch].label;
                  const Icon = ch === "all" ? null : CHANNEL_ICONS[ch];
                  return (
                    <TabsTrigger key={ch} value={ch} className="text-xs data-[state=active]:bg-slate-700 gap-1 px-2 py-1">
                      {Icon && <Icon className="h-3 w-3" />}
                      {label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            {/* Secondary filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | "all")}>
                <SelectTrigger className="w-[130px] h-8 text-xs bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ResponseStatus | "all")}>
                <SelectTrigger className="w-[140px] h-8 text-xs bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="ai_drafted">AI Drafted</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[120px] h-8 text-xs bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="sentiment">Sentiment</SelectItem>
                  <SelectItem value="channel">Channel</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search interactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-7 pr-3 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>
            </div>

            {/* Select all */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Checkbox
                checked={selected.size > 0 && selected.size === inbox.filter(i => !["approved", "published", "rejected", "no_response_needed"].includes(i.responseStatus)).length}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                className="border-slate-600"
              />
              <span>Select all actionable ({pendingCount})</span>
              {selected.size > 0 && <span className="text-cyan-400 font-medium">{selected.size} selected</span>}
            </div>

            {/* Interaction list */}
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                Loading inbox...
              </div>
            ) : inbox.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No interactions match your filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inbox.map(interaction => (
                  <InteractionCard
                    key={interaction.id}
                    interaction={interaction}
                    isSelected={selected.has(interaction.id)}
                    onSelect={handleSelect}
                    onApprove={handleApprove}
                    onEdit={handleEdit}
                    onReject={handleReject}
                    onNoResponse={handleNoResponse}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Channel Health Sidebar (desktop) */}
          {stats && (
            <div className="hidden lg:block w-56 shrink-0 space-y-4">
              <ChannelHealthSidebar stats={stats} />
              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300">Review Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg review time</span>
                    <span className="text-white">{stats.avgReviewTimeMinutes} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Urgent items</span>
                    <span className="text-red-400 font-medium">{stats.byPriority.urgent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">High priority</span>
                    <span className="text-amber-400">{stats.byPriority.high}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Batch operations bar (sticky bottom) */}
        {selected.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-700 backdrop-blur-sm z-50">
            <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-slate-300">
                <span className="text-cyan-400 font-bold">{selected.size}</span> item{selected.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                {confirmBulk === "approve" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-yellow-400">Approve {selected.size} items?</span>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={() => handleBulkAction("approve")}>
                      As You Wish
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs text-slate-400" onClick={() => setConfirmBulk(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : confirmBulk === "reject" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-yellow-400">Reject {selected.size} items?</span>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs" onClick={() => handleBulkAction("reject")}>
                      Confirm
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs text-slate-400" onClick={() => setConfirmBulk(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : confirmBulk === "noresponse" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-yellow-400">Mark {selected.size} as no response?</span>
                    <Button size="sm" className="bg-slate-600 hover:bg-slate-700 text-xs" onClick={() => handleBulkAction("noresponse")}>
                      Confirm
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs text-slate-400" onClick={() => setConfirmBulk(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1" onClick={() => setConfirmBulk("approve")}>
                      <CheckCircle2 className="h-3 w-3" />
                      Approve Selected
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-700/50 text-red-400 text-xs gap-1" onClick={() => setConfirmBulk("reject")}>
                      <XCircle className="h-3 w-3" />
                      Reject Selected
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-400 text-xs gap-1" onClick={() => setConfirmBulk("noresponse")}>
                      <EyeOff className="h-3 w-3" />
                      Mark No Response
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
    </PortalPageLayout>
  );
}
