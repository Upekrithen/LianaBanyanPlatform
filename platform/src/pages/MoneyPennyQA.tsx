import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, MessageCircle, Star, ChevronDown, ChevronUp, Search, Check, X, Edit3, Tag, Award, TrendingUp, Clock, Users, Sparkles, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrencyAmount } from "@/components/CreditSymbol";
import {
  fetchQAEntries,
  fetchQAStats,
  approveResponse,
  rejectResponse,
  fetchMilestoneReports,
  awardFollowUpBonus,
  CLASSIFICATION_CONFIG,
  CHANNEL_CONFIG,
  AI_RESPONDER_CONFIG,
  STATUS_CONFIG,
  MILESTONES,
  type QAEntry,
  type QAStats,
  type QAMilestoneReport,
  type QAFilters,
} from "@/lib/moneyPennyQAService";

// ─── Stats Dashboard ──────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: any; accent?: string }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider">
        <Icon className={`h-3.5 w-3.5 ${accent || 'text-slate-500'}`} />
        {label}
      </div>
      <div className={`text-2xl font-bold ${accent || 'text-white'}`}>{value}</div>
    </div>
  );
}

// ─── Classification Badge ─────────────────────────────────────────────

function ClassificationBadge({ classification }: { classification: QAEntry['classification'] }) {
  const cfg = CLASSIFICATION_CONFIG[classification];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bgColor}`}>
      {cfg.label}
    </span>
  );
}

function ChannelBadge({ channel }: { channel: QAEntry['channel'] }) {
  const cfg = CHANNEL_CONFIG[channel];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function AIBadge({ responder }: { responder: QAEntry['aiResponder'] }) {
  const cfg = AI_RESPONDER_CONFIG[responder];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: QAEntry['status'] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── QA Entry Card ────────────────────────────────────────────────────

function QAEntryCard({ entry, onApprove, onReject, onAwardBonus }: {
  entry: QAEntry;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onAwardBonus: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(entry.answerText);

  return (
    <Card className="bg-slate-800/40 border-slate-700/50 hover:border-slate-600/60 transition-colors">
      <CardContent className="p-5">
        {/* Top row: badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <ClassificationBadge classification={entry.classification} />
          <ChannelBadge channel={entry.channel} />
          <AIBadge responder={entry.aiResponder} />
          <StatusBadge status={entry.status} />
          {entry.isNovel && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Star className="h-3 w-3" /> Novel
            </span>
          )}
        </div>

        {/* Question */}
        <div className="mb-3">
          <p className="text-sm text-slate-400 mb-1">
            <span className="font-medium text-slate-300">{entry.askerName}</span>
            {entry.askerEmail && <span className="ml-1 text-slate-500">({entry.askerEmail})</span>}
            <span className="mx-2 text-slate-600">|</span>
            <span className="text-slate-500">{new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </p>
          <p className="text-white text-base font-medium leading-relaxed">{entry.questionText}</p>
        </div>

        {/* Answer (collapsible) */}
        {entry.answerText && (
          <div className="mb-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-300 transition-colors mb-1"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              AI Response
            </button>
            {expanded && (
              <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-4 mt-1">
                {editing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="border-slate-600 text-slate-300">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => setEditing(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Save Edit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 text-sm leading-relaxed">{entry.answerText}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Similar questions */}
        {entry.similarQuestionIds.length > 0 && (
          <div className="mb-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-xs text-yellow-400 font-medium">
              Similar to: {entry.similarQuestionIds.join(', ')}
            </p>
          </div>
        )}

        {/* Mark rewards */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {entry.marksAwarded > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CurrencyAmount amount={entry.marksAwarded} currency="marks" size="sm" /> Marks
            </span>
          )}
          {entry.followUpMarksAwarded > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <CurrencyAmount amount={entry.followUpMarksAwarded} currency="marks" size="sm" /> BONUS
            </span>
          )}
        </div>

        {/* Follow-up text */}
        {entry.followUpReceived && entry.followUpText && (
          <div className="mb-3 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
            <p className="text-xs text-purple-400 font-medium mb-1">Follow-Up from {entry.askerName}:</p>
            <p className="text-sm text-purple-300">{entry.followUpText}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700/40">
          {entry.status === 'pending_review' && (
            <>
              <Button size="sm" onClick={() => onApprove(entry.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Check className="h-3.5 w-3.5 mr-1" /> Approve & Send
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setExpanded(true); setEditing(true); }} className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Response
              </Button>
              <Button size="sm" variant="outline" onClick={() => onReject(entry.id)} className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                <X className="h-3.5 w-3.5 mr-1" /> Reject
              </Button>
            </>
          )}
          {entry.status === 'approved' && (
            <Button size="sm" variant="outline" onClick={() => onApprove(entry.id)} className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
              <ArrowRight className="h-3.5 w-3.5 mr-1" /> Send Now
            </Button>
          )}
          {entry.followUpReceived && entry.followUpMarksAwarded === 0 && (
            <Button size="sm" onClick={() => onAwardBonus(entry.id)} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Award className="h-3.5 w-3.5 mr-1" /> Award 25 Mark Bonus
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Classification Breakdown ─────────────────────────────────────────

function ClassificationBreakdown({ entries }: { entries: QAEntry[] }) {
  const total = entries.length;
  if (total === 0) return null;

  const counts = {
    worthwhile: entries.filter(e => e.classification === 'worthwhile').length,
    duplicate: entries.filter(e => e.classification === 'duplicate').length,
    throwaway: entries.filter(e => e.classification === 'throwaway').length,
    flamer: entries.filter(e => e.classification === 'flamer').length,
    troll: entries.filter(e => e.classification === 'troll').length,
    bot: entries.filter(e => e.classification === 'bot').length,
  };

  const healthScore = Math.round((counts.worthwhile / total) * 100);
  const healthColor = healthScore >= 60 ? 'text-emerald-400' : healthScore >= 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-blue-400" />
        Classification Breakdown
      </h3>
      <div className="space-y-3">
        {(Object.keys(counts) as Array<keyof typeof counts>).map(key => {
          const pct = Math.round((counts[key] / total) * 100);
          const cfg = CLASSIFICATION_CONFIG[key];
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className={cfg.color}>{cfg.label}</span>
                <span className="text-slate-400">{counts[key]} ({pct}%)</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${cfg.bgColor.split(' ')[0].replace('/20', '/60')}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-700/40 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Health Score</p>
        <p className={`text-3xl font-bold ${healthColor}`}>{healthScore}%</p>
        <p className="text-xs text-slate-500 mt-1">worthwhile / total ratio</p>
      </div>
    </div>
  );
}

// ─── Milestone Report Card ────────────────────────────────────────────

function MilestoneReportCard({ report }: { report: QAMilestoneReport }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-slate-800/40 border-slate-700/50">
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            <span className="text-white">{report.milestone.toLocaleString()} Questions Milestone</span>
          </span>
          <span className="text-xs text-slate-400">
            {new Date(report.reachedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {expanded ? <ChevronUp className="h-4 w-4 inline ml-2" /> : <ChevronDown className="h-4 w-4 inline ml-2" />}
          </span>
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">Worthwhile</p>
              <p className="text-lg font-bold text-emerald-400">{report.worthwhilePct}%</p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">Follow-Up Rate</p>
              <p className="text-lg font-bold text-purple-400">{report.followUpRate}%</p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">Marks Awarded</p>
              <p className="text-lg font-bold text-amber-400">{report.totalMarksAwarded.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">Avg Response</p>
              <p className="text-lg font-bold text-blue-400">{report.avgResponseTime}</p>
            </div>
          </div>

          {/* Classification breakdown bars */}
          <div className="mb-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Classification Breakdown</p>
            <div className="flex h-4 rounded-full overflow-hidden">
              <div className="bg-emerald-500/60" style={{ width: `${report.worthwhilePct}%` }} title={`Worthwhile: ${report.worthwhileCount}`} />
              <div className="bg-yellow-500/60" style={{ width: `${(report.duplicateCount / report.totalQuestions) * 100}%` }} title={`Duplicate: ${report.duplicateCount}`} />
              <div className="bg-slate-500/60" style={{ width: `${(report.throwawayCount / report.totalQuestions) * 100}%` }} title={`Throwaway: ${report.throwawayCount}`} />
              <div className="bg-orange-500/60" style={{ width: `${(report.flamerCount / report.totalQuestions) * 100}%` }} title={`Flamer: ${report.flamerCount}`} />
              <div className="bg-red-500/60" style={{ width: `${(report.trollCount / report.totalQuestions) * 100}%` }} title={`Troll: ${report.trollCount}`} />
              <div className="bg-purple-500/60" style={{ width: `${(report.botCount / report.totalQuestions) * 100}%` }} title={`Bot: ${report.botCount}`} />
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
              <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />Worthwhile {report.worthwhileCount}</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1" />Duplicate {report.duplicateCount}</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-slate-500 mr-1" />Throwaway {report.throwawayCount}</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1" />Flamer {report.flamerCount}</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />Troll {report.trollCount}</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-1" />Bot {report.botCount}</span>
            </div>
          </div>

          {/* Top categories */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Top Question Categories</p>
            <div className="space-y-1.5">
              {report.topQuestionCategories.map(cat => (
                <div key={cat.category} className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-700/40 rounded-full h-2">
                    <div
                      className="bg-blue-500/60 h-2 rounded-full"
                      style={{ width: `${(cat.count / report.totalQuestions) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-300 w-40 truncate">{cat.category}</span>
                  <span className="text-xs text-slate-500 w-8 text-right">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function MoneyPennyQA() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<QAEntry[]>([]);
  const [stats, setStats] = useState<QAStats | null>(null);
  const [milestones, setMilestones] = useState<QAMilestoneReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMilestones, setShowMilestones] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [entriesData, statsData, milestonesData] = await Promise.all([
      fetchQAEntries(),
      fetchQAStats(),
      fetchMilestoneReports(),
    ]);
    setEntries(entriesData);
    setStats(statsData);
    setMilestones(milestonesData);
    setLoading(false);
  }

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (statusFilter !== 'all') {
      result = result.filter(e => e.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.questionText.toLowerCase().includes(q) ||
        e.answerText.toLowerCase().includes(q) ||
        e.askerName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [entries, statusFilter, searchQuery]);

  const followUpPending = useMemo(() =>
    entries.filter(e => e.followUpReceived && e.followUpMarksAwarded === 0),
    [entries]
  );

  async function handleApprove(id: string) {
    await approveResponse(id);
    await loadData();
  }

  async function handleReject(id: string) {
    await rejectResponse(id);
    await loadData();
  }

  async function handleAwardBonus(id: string) {
    await awardFollowUpBonus(id);
    await loadData();
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Loading Q&A Intelligence...</div>
      </div>
    );
  }

  const worthwhilePct = stats.totalQuestions > 0 ? Math.round((stats.worthwhile / stats.totalQuestions) * 100) : 0;
  const followUpPct = stats.worthwhile > 0 ? Math.round((stats.followUps / stats.worthwhile) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-fuchsia-500/20 rounded-lg">
              <Brain className="h-6 w-6 text-fuchsia-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                MoneyPenny Q&A Intelligence
                <MessageCircle className="h-5 w-5 text-fuchsia-400" />
              </h1>
              <p className="text-sm text-slate-400">Every question is a gift. The good ones earn Marks.</p>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard label="Total Questions" value={stats.totalQuestions} icon={MessageCircle} />
          <StatCard label="Pending Review" value={stats.pendingReview} icon={Clock} accent="text-amber-400" />
          <StatCard label="Worthwhile" value={`${worthwhilePct}%`} icon={TrendingUp} accent="text-emerald-400" />
          <StatCard label="Novel Questions" value={stats.novel} icon={Sparkles} accent="text-amber-400" />
          <StatCard label="Follow-Up Rate" value={`${followUpPct}%`} icon={Users} accent="text-purple-400" />
          <StatCard label="Marks Awarded" value={stats.totalMarksAwarded.toLocaleString()} icon={Award} accent="text-fuchsia-400" />
        </div>

        {/* Milestone Progress Bar */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-300 font-medium">Milestone Progress</span>
            <span className="text-slate-400">
              {stats.totalQuestions.toLocaleString()} / {stats.nextMilestone.toLocaleString()} — next report at {stats.nextMilestone.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-fuchsia-500 to-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${stats.progressToMilestone}%` }}
            />
          </div>
        </div>

        {/* Main Content: 2-column on desktop */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left: Review Queue */}
          <div className="flex-1 min-w-0">

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search questions, answers, or askers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/60 border-slate-700/50 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Tab Filters */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
              <TabsList className="bg-slate-800/60 border border-slate-700/50">
                <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
                  All ({entries.length})
                </TabsTrigger>
                <TabsTrigger value="pending_review" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-slate-400">
                  Pending ({entries.filter(e => e.status === 'pending_review').length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-slate-400">
                  Approved ({entries.filter(e => e.status === 'approved').length})
                </TabsTrigger>
                <TabsTrigger value="sent" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-slate-400">
                  Sent ({entries.filter(e => e.status === 'sent').length})
                </TabsTrigger>
                <TabsTrigger value="followed_up" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-slate-400">
                  Followed Up ({entries.filter(e => e.status === 'followed_up').length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Entry Cards */}
            <div className="space-y-4">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No questions match your filters.
                </div>
              ) : (
                filteredEntries.map(entry => (
                  <QAEntryCard
                    key={entry.id}
                    entry={entry}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onAwardBonus={handleAwardBonus}
                  />
                ))
              )}
            </div>

            {/* Follow-Up Tracking Section */}
            {followUpPending.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Follow-Up Bonus Pending ({followUpPending.length})
                </h2>
                <div className="space-y-3">
                  {followUpPending.map(entry => (
                    <Card key={entry.id} className="bg-purple-500/10 border-purple-500/20">
                      <CardContent className="p-4">
                        <p className="text-sm text-white font-medium mb-1">{entry.questionText}</p>
                        {entry.followUpText && (
                          <p className="text-sm text-purple-300 mb-2 italic">Follow-up: "{entry.followUpText}"</p>
                        )}
                        <Button size="sm" onClick={() => handleAwardBonus(entry.id)} className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Award className="h-3.5 w-3.5 mr-1" /> Award 25 Mark Bonus
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Milestone Reports Section */}
            <div className="mt-8">
              <button
                onClick={() => setShowMilestones(!showMilestones)}
                className="flex items-center gap-2 text-lg font-semibold text-white mb-4 hover:text-slate-300 transition-colors"
              >
                <Award className="h-5 w-5 text-amber-400" />
                Milestone Reports
                {showMilestones ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showMilestones && (
                <div className="space-y-4">
                  {milestones.length > 0 ? (
                    milestones.map(report => (
                      <MilestoneReportCard key={report.milestone} report={report} />
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No milestones reached yet. First report at 100 questions.</p>
                  )}
                  {/* Next milestone indicator */}
                  <div className="bg-slate-800/30 border border-dashed border-slate-700/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-500">
                      Next milestone: <span className="text-white font-medium">{stats.nextMilestone.toLocaleString()} questions</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {stats.nextMilestone - stats.totalQuestions} more to go
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar: Classification Breakdown */}
          <div className="w-full lg:w-72 shrink-0">
            <ClassificationBreakdown entries={entries} />
          </div>
        </div>
      </div>
    </div>
  );
}
