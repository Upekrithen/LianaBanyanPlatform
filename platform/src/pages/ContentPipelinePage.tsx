/**
 * CONTENT PIPELINE PAGE
 * =====================
 * Management interface for the SEED -> TLDR -> BLOG -> ARTICLE -> PAPER pipeline.
 * Innovation #1505 — Sequential Content Evolution System.
 *
 * Features:
 *   - Pipeline statistics dashboard
 *   - Stage-based content list with filters
 *   - New content creation (starts at SEED)
 *   - Stage advancement workflow
 *   - Reading level preview
 *   - Validation feedback
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout,
  Zap,
  PenTool,
  FileText,
  GraduationCap,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Clock,
  BookOpen,
  ArrowRight,
  Check,
  AlertTriangle,
  X,
  Eye,
  Send,
  Archive,
  Search,
  BarChart3,
  Layers,
  Pencil,
  Trash2,
  Globe,
  Megaphone,
  RefreshCw,
  Save,
} from 'lucide-react';
import {
  type PipelineContent,
  type PipelineStage,
  type ContentStatus,
  type ContentCategory,
  type ValidationResult,
  PIPELINE_STAGES,
  getStageRequirements,
  getNextStage,
  getCompletedStages,
  countWords,
  calculateReadingTime,
  validateForStage,
  createContent,
  advanceStage,
  publishContent,
  updateContent,
  updateStageContent,
  setContentStatus,
  archiveContent,
  deleteContent,
  linkToDispatch,
  updateCephasSync,
  getContentList,
  getContentById,
  getBestContent,
  getContentAtLevel,
  getPipelineStats,
} from '@/lib/contentPipeline';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ─── Stage Icons ─────────────────────────────────────────────────────────────

const STAGE_ICONS: Record<PipelineStage, React.ElementType> = {
  seed: Sprout,
  tldr: Zap,
  blog: PenTool,
  article: FileText,
  paper: GraduationCap,
};

const STAGE_COLORS: Record<PipelineStage, string> = {
  seed: '#10b981',    // emerald
  tldr: '#f59e0b',    // amber
  blog: '#3b82f6',    // blue
  article: '#8b5cf6', // purple
  paper: '#ef4444',   // red
};

const STATUS_LABELS: Record<ContentStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: '#6b7280' },
  review: { label: 'In Review', color: '#f59e0b' },
  approved: { label: 'Approved', color: '#10b981' },
  published: { label: 'Published', color: '#3b82f6' },
  archived: { label: 'Archived', color: '#6b7280' },
};

// ─── Stats Dashboard ─────────────────────────────────────────────────────────

function PipelineStatsBar({ stats }: {
  stats: {
    totalItems: number;
    byStage: Record<PipelineStage, number>;
    byStatus: Record<ContentStatus, number>;
    avgWordCount: number;
    totalCoverageMinutes: number;
  };
}) {
  const stages: PipelineStage[] = ['seed', 'tldr', 'blog', 'article', 'paper'];
  const total = stats.totalItems || 1; // avoid div by zero

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-bold text-white">Pipeline Overview</h2>
        <span className="text-white/50 text-sm ml-auto">{stats.totalItems} total items</span>
      </div>

      {/* Stage progress bar */}
      <div className="flex h-6 rounded-lg overflow-hidden mb-4 bg-slate-800">
        {stages.map((stage) => {
          const count = stats.byStage[stage] || 0;
          const pct = (count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={stage}
              className="flex items-center justify-center text-xs font-medium text-white transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: STAGE_COLORS[stage],
                minWidth: count > 0 ? '2rem' : 0,
              }}
              title={`${getStageRequirements(stage).label}: ${count}`}
            >
              {count > 0 && count}
            </div>
          );
        })}
      </div>

      {/* Stage legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {stages.map((stage) => {
          const Icon = STAGE_ICONS[stage];
          const req = getStageRequirements(stage);
          const count = stats.byStage[stage] || 0;
          return (
            <div key={stage} className="flex items-center gap-2 text-sm">
              <Icon className="w-4 h-4" style={{ color: STAGE_COLORS[stage] }} />
              <span className="text-white/70">{req.label}</span>
              <span className="text-white font-medium">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{stats.byStatus.published || 0}</div>
          <div className="text-white/50 text-xs">Published</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{stats.byStatus.draft || 0}</div>
          <div className="text-white/50 text-xs">Drafts</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{stats.avgWordCount.toLocaleString()}</div>
          <div className="text-white/50 text-xs">Avg Words</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">{stats.totalCoverageMinutes}</div>
          <div className="text-white/50 text-xs">Total Coverage Min</div>
        </div>
      </div>
    </div>
  );
}

// ─── Stage Indicator ─────────────────────────────────────────────────────────

function StageProgressIndicator({ currentStage }: { currentStage: PipelineStage }) {
  const stages: PipelineStage[] = ['seed', 'tldr', 'blog', 'article', 'paper'];
  const currentIdx = stages.indexOf(currentStage);

  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, idx) => {
        const Icon = STAGE_ICONS[stage];
        const isComplete = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <React.Fragment key={stage}>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isComplete
                  ? 'bg-green-500/20'
                  : isCurrent
                  ? 'ring-2 ring-offset-1 ring-offset-slate-900'
                  : 'bg-slate-800'
              }`}
              style={{
                backgroundColor: isCurrent ? STAGE_COLORS[stage] + '30' : undefined,
                ringColor: isCurrent ? STAGE_COLORS[stage] : undefined,
              }}
              title={getStageRequirements(stage).label}
            >
              {isComplete ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Icon
                  className="w-3 h-3"
                  style={{ color: isCurrent ? STAGE_COLORS[stage] : '#6b7280' }}
                />
              )}
            </div>
            {idx < stages.length - 1 && (
              <div
                className="w-3 h-0.5"
                style={{
                  backgroundColor: idx < currentIdx ? '#10b981' : '#374151',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Content Card ────────────────────────────────────────────────────────────

function ContentCard({
  content,
  onSelect,
}: {
  content: PipelineContent;
  onSelect: (id: string) => void;
}) {
  const Icon = STAGE_ICONS[content.currentStage];
  const stageReq = getStageRequirements(content.currentStage);
  const statusInfo = STATUS_LABELS[content.status];
  const best = getBestContent(content);

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(content.id)}
      className="w-full text-left bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-slate-500 transition-all group"
    >
      <div className="flex items-start gap-3">
        {/* Stage icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: STAGE_COLORS[content.currentStage] + '20' }}
        >
          <Icon className="w-5 h-5" style={{ color: STAGE_COLORS[content.currentStage] }} />
        </div>

        {/* Content info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
              {content.title}
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: statusInfo.color + '20', color: statusInfo.color }}
            >
              {statusInfo.label}
            </span>
          </div>
          {content.subtitle && (
            <p className="text-white/50 text-sm truncate mb-1">{content.subtitle}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {stageReq.label}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {best.wordCount.toLocaleString()} words
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {calculateReadingTime(best.wordCount)} min
            </span>
            <span className="text-white/30">
              {content.category}
            </span>
          </div>
        </div>

        {/* Stage progress */}
        <div className="shrink-0 hidden md:block">
          <StageProgressIndicator currentStage={content.currentStage} />
        </div>

        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-blue-400 transition-colors shrink-0 mt-3" />
      </div>
    </motion.button>
  );
}

// ─── Create Content Modal ────────────────────────────────────────────────────

function CreateContentModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (item: PipelineContent) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [seedText, setSeedText] = useState('');
  const [category, setCategory] = useState<ContentCategory>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wc = countWords(seedText);
  const validation = validateForStage({ title, seedContent: seedText }, 'seed');

  const handleCreate = async () => {
    if (!user?.id || !title.trim() || !seedText.trim()) return;
    setIsSubmitting(true);

    const authorName = user.user_metadata?.full_name || user.email || 'Unknown';
    const result = await createContent(title, seedText, user.id, authorName, category);

    if (result) {
      toast({ title: 'Content created', description: `"${title}" is now in the pipeline at SEED stage.` });
      onCreated(result);
      setTitle('');
      setSeedText('');
      setCategory('general');
      onClose();
    } else {
      toast({ title: 'Error', description: 'Failed to create content. Check your connection.', variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  const categories: ContentCategory[] = [
    'economics', 'governance', 'technology', 'civic', 'gaming',
    'community', 'legal', 'education', 'culture', 'general',
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Plant a Seed</h2>
              <p className="text-white/50 text-sm">Start a new piece of content</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm text-white/70 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What is this about?"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-sm text-white/70 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ContentCategory)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Seed content */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm text-white/70">Seed Content</label>
            <span className={`text-xs ${wc > 50 ? 'text-red-400' : wc > 0 ? 'text-emerald-400' : 'text-white/30'}`}>
              {wc}/50 words
            </span>
          </div>
          <textarea
            value={seedText}
            onChange={(e) => setSeedText(e.target.value)}
            placeholder="The core idea in under 50 words..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        {/* Validation feedback */}
        {seedText.trim() && (
          <div className="mb-4">
            {validation.errors.map((err, i) => (
              <div key={i} className="flex items-center gap-2 text-red-400 text-sm mb-1">
                <AlertTriangle className="w-3 h-3" />
                {err}
              </div>
            ))}
            {validation.warnings.map((warn, i) => (
              <div key={i} className="flex items-center gap-2 text-amber-400 text-sm mb-1">
                <AlertTriangle className="w-3 h-3" />
                {warn}
              </div>
            ))}
            {validation.isValid && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <Check className="w-3 h-3" />
                Ready to plant
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white/70 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!validation.isValid || isSubmitting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-white/30 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Sprout className="w-4 h-4" />
            {isSubmitting ? 'Planting...' : 'Plant Seed'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Content Detail View ─────────────────────────────────────────────────────

function ContentDetailView({
  contentId,
  onBack,
  onRefresh,
}: {
  contentId: string;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [content, setContent] = useState<PipelineContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewLevel, setViewLevel] = useState<PipelineStage | null>(null);
  const [advanceText, setAdvanceText] = useState('');
  const [showAdvance, setShowAdvance] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editCategory, setEditCategory] = useState<ContentCategory>('general');
  const [editingContent, setEditingContent] = useState(false);
  const [editContentText, setEditContentText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, [contentId]);

  const loadContent = async () => {
    setLoading(true);
    const data = await getContentById(contentId);
    setContent(data);
    setViewLevel(data?.currentStage || null);
    setLoading(false);
  };

  const handleAdvance = async () => {
    if (!content || !advanceText.trim()) return;
    setIsAdvancing(true);

    const result = await advanceStage(content.id, advanceText);
    if (result) {
      const nextStage = getNextStage(content.currentStage);
      toast({
        title: 'Stage advanced',
        description: `Content moved to ${getStageRequirements(nextStage!).label} stage.`,
      });
      setContent(result);
      setAdvanceText('');
      setShowAdvance(false);
      setViewLevel(result.currentStage);
      onRefresh();
    } else {
      toast({ title: 'Error', description: 'Failed to advance stage.', variant: 'destructive' });
    }
    setIsAdvancing(false);
  };

  const handlePublish = async () => {
    if (!content) return;
    setIsPublishing(true);
    const success = await publishContent(content.id);
    if (success) {
      toast({ title: 'Published', description: `"${content.title}" is now live.` });
      await loadContent();
      onRefresh();
    } else {
      toast({ title: 'Error', description: 'Failed to publish.', variant: 'destructive' });
    }
    setIsPublishing(false);
  };

  const startEdit = () => {
    if (!content) return;
    setEditTitle(content.title);
    setEditSubtitle(content.subtitle || '');
    setEditTags(content.tags.join(', '));
    setEditCategory(content.category);
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!content) return;
    setIsSaving(true);
    const result = await updateContent(content.id, {
      title: editTitle,
      subtitle: editSubtitle || undefined,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      category: editCategory,
    });
    if (result) {
      toast({ title: 'Saved', description: 'Content metadata updated.' });
      setContent(result);
      setIsEditing(false);
      onRefresh();
    } else {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  const startContentEdit = () => {
    if (!content || !viewLevel) return;
    setEditContentText(getContentAtLevel(content, viewLevel));
    setEditingContent(true);
  };

  const saveContentEdit = async () => {
    if (!content || !viewLevel) return;
    setIsSaving(true);
    const result = await updateStageContent(content.id, viewLevel, editContentText);
    if (result) {
      toast({ title: 'Content updated', description: `${getStageRequirements(viewLevel).label} text saved.` });
      setContent(result);
      setEditingContent(false);
      onRefresh();
    } else {
      toast({ title: 'Error', description: 'Failed to save content.', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  const handleStatusChange = async (newStatus: ContentStatus) => {
    if (!content) return;
    const success = await setContentStatus(content.id, newStatus);
    if (success) {
      toast({ title: 'Status updated', description: `Moved to ${newStatus}.` });
      await loadContent();
      onRefresh();
    }
  };

  const handleArchive = async () => {
    if (!content) return;
    const success = await archiveContent(content.id);
    if (success) {
      toast({ title: 'Archived', description: `"${content.title}" archived.` });
      onBack();
      onRefresh();
    }
  };

  const handleDelete = async () => {
    if (!content) return;
    const success = await deleteContent(content.id);
    if (success) {
      toast({ title: 'Deleted', description: `"${content.title}" permanently deleted.` });
      onBack();
      onRefresh();
    }
  };

  const handleDispatch = async (channel: string) => {
    if (!content) return;
    const success = await linkToDispatch(content.id, channel, content.title);
    if (success) {
      toast({ title: 'Dispatched', description: `Linked to ${channel} dispatch queue.` });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-20">
        <p className="text-white/50">Content not found.</p>
        <button onClick={onBack} className="text-blue-400 hover:text-blue-300 mt-2">
          Back to list
        </button>
      </div>
    );
  }

  const nextStage = getNextStage(content.currentStage);
  const completedStages = getCompletedStages(content.currentStage);
  const currentReq = getStageRequirements(content.currentStage);
  const CurrentIcon = STAGE_ICONS[content.currentStage];
  const displayText = viewLevel ? getContentAtLevel(content, viewLevel) : getBestContent(content).text;

  // Validation for advance text
  const advanceValidation = nextStage && advanceText.trim()
    ? validateForStage(
        { ...content, [`${nextStage}Content`]: advanceText },
        nextStage
      )
    : null;

  return (
    <div>
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
      >
        <ChevronDown className="w-4 h-4 rotate-90" />
        Back to pipeline
      </button>

      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: STAGE_COLORS[content.currentStage] + '20' }}
          >
            <CurrentIcon className="w-7 h-7" style={{ color: STAGE_COLORS[content.currentStage] }} />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-white text-lg font-bold focus:outline-none focus:border-blue-500" />
                <input type="text" value={editSubtitle} onChange={e => setEditSubtitle(e.target.value)}
                  placeholder="Subtitle (optional)"
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-white/60 text-sm focus:outline-none focus:border-blue-500" />
                <div className="flex gap-2">
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value as ContentCategory)}
                    className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:outline-none">
                    {['economics','governance','technology','civic','gaming','community','legal','education','culture','general','religion','perspective'].map(c =>
                      <option key={c} value={c}>{c}</option>
                    )}
                  </select>
                  <input type="text" value={editTags} onChange={e => setEditTags(e.target.value)}
                    placeholder="Tags (comma separated)"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={isSaving}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                    <Save className="w-3 h-3" /> {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="text-white/50 hover:text-white text-sm px-3 py-1">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white mb-1">{content.title}</h1>
                  <button onClick={startEdit} className="text-white/30 hover:text-blue-400 transition-colors" title="Edit metadata">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                {content.subtitle && <p className="text-white/60">{content.subtitle}</p>}
                <div className="flex items-center gap-4 mt-2 text-sm text-white/40">
                  <span>{currentReq.label} stage</span>
                  <span>{content.wordCount.toLocaleString()} words</span>
                  <span>{content.readingTimeMinutes} min read</span>
                  <span>{content.coverageMinutesValue} CM earned</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: STATUS_LABELS[content.status].color + '20',
                      color: STATUS_LABELS[content.status].color,
                    }}
                  >
                    {STATUS_LABELS[content.status].label}
                  </span>
                  {content.cephasSyncStatus && content.cephasSyncStatus !== 'new' && (
                    <span className={`flex items-center gap-1 text-xs ${
                      content.cephasSyncStatus === 'synced' ? 'text-green-400' :
                      content.cephasSyncStatus === 'pending' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      <Globe className="w-3 h-3" /> Cephas: {content.cephasSyncStatus}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stage progress */}
        <div className="mb-4">
          <StageProgressIndicator currentStage={content.currentStage} />
        </div>

        {/* Tags */}
        {content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {content.tags.map((tag) => (
              <span key={tag} className="bg-slate-800 text-white/60 px-2 py-1 rounded text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-white/40 text-xs">Author</div>
            <div className="text-white">{content.authorName}</div>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <div className="text-white/40 text-xs">Category</div>
            <div className="text-white capitalize">{content.category}</div>
          </div>
          {content.innovationNumbers.length > 0 && (
            <div className="bg-slate-800/50 rounded p-2">
              <div className="text-white/40 text-xs">Innovations</div>
              <div className="text-amber-400">#{content.innovationNumbers.join(', #')}</div>
            </div>
          )}
          {content.patentSeries && (
            <div className="bg-slate-800/50 rounded p-2">
              <div className="text-white/40 text-xs">Patent Series</div>
              <div className="text-blue-400 text-xs">{content.patentSeries}</div>
            </div>
          )}
        </div>
      </div>

      {/* Reading Level Selector */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">View at reading level:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {completedStages.map((stage) => {
            const req = getStageRequirements(stage);
            const Icon = STAGE_ICONS[stage];
            const isSelected = viewLevel === stage;
            return (
              <button
                key={stage}
                onClick={() => setViewLevel(stage)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  isSelected
                    ? 'text-white ring-1'
                    : 'text-white/60 hover:text-white bg-slate-800 hover:bg-slate-700'
                }`}
                style={isSelected ? {
                  backgroundColor: STAGE_COLORS[stage] + '20',
                  borderColor: STAGE_COLORS[stage],
                  ringColor: STAGE_COLORS[stage],
                } : undefined}
              >
                <Icon className="w-3.5 h-3.5" />
                {req.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Display */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/50">
            {viewLevel ? getStageRequirements(viewLevel).label : 'Best'} content
          </span>
          {!editingContent && displayText && content.status !== 'published' && (
            <button onClick={startContentEdit}
              className="flex items-center gap-1 text-xs text-white/40 hover:text-blue-400 transition-colors">
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
        </div>
        {editingContent ? (
          <div>
            <textarea
              value={editContentText}
              onChange={e => setEditContentText(e.target.value)}
              rows={16}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500 resize-y"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-white/30">{countWords(editContentText)} words</span>
              <div className="flex gap-2">
                <button onClick={() => setEditingContent(false)} className="text-white/50 hover:text-white text-sm px-3 py-1">Cancel</button>
                <button onClick={saveContentEdit} disabled={isSaving}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                  <Save className="w-3 h-3" /> {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <div className="text-white/80 leading-relaxed whitespace-pre-wrap">
              {displayText || <span className="text-white/30 italic">No content at this level yet.</span>}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Advance Stage */}
        {nextStage && content.status !== 'published' && content.status !== 'archived' && (
          <button
            onClick={() => setShowAdvance(!showAdvance)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            Advance to {getStageRequirements(nextStage).label}
            {showAdvance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}

        {/* Status transitions */}
        {content.status === 'draft' && (
          <button onClick={() => handleStatusChange('review')}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Eye className="w-4 h-4" /> Submit for Review
          </button>
        )}
        {content.status === 'review' && (
          <button onClick={() => handleStatusChange('approved')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Check className="w-4 h-4" /> Approve
          </button>
        )}
        {(content.status === 'approved' || content.status === 'draft') && (
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        )}

        {/* Dispatch to social */}
        {content.status === 'published' && (
          <div className="flex items-center gap-1">
            {['twitter', 'linkedin', 'medium'].map(ch => (
              <button key={ch} onClick={() => handleDispatch(ch)}
                className="flex items-center gap-1 bg-purple-600/80 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                <Megaphone className="w-3.5 h-3.5" /> {ch}
              </button>
            ))}
          </div>
        )}

        {/* Archive / Delete */}
        {content.status !== 'archived' && (
          <button onClick={handleArchive}
            className="flex items-center gap-2 text-white/40 hover:text-amber-400 px-3 py-2 rounded-lg transition-colors">
            <Archive className="w-4 h-4" /> Archive
          </button>
        )}
        {(content.status === 'draft' || content.status === 'archived') && (
          <button onClick={handleDelete}
            className="flex items-center gap-2 text-white/40 hover:text-red-400 px-3 py-2 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        )}

        {/* Final stage indicator */}
        {!nextStage && (
          <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 px-4 py-2 rounded-lg">
            <GraduationCap className="w-4 h-4" />
            Final stage reached (Academic Paper)
          </div>
        )}
      </div>

      {/* Advance Stage Form */}
      <AnimatePresence>
        {showAdvance && nextStage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const NextIcon = STAGE_ICONS[nextStage];
                  return (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: STAGE_COLORS[nextStage] + '20' }}
                    >
                      <NextIcon className="w-5 h-5" style={{ color: STAGE_COLORS[nextStage] }} />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="font-bold text-white">
                    Write {getStageRequirements(nextStage).label} Version
                  </h3>
                  <p className="text-white/50 text-sm">
                    {getStageRequirements(nextStage).description}
                  </p>
                  <p className="text-white/30 text-xs mt-1">
                    {getStageRequirements(nextStage).readingLevel} | {getStageRequirements(nextStage).minWords}-{getStageRequirements(nextStage).maxWords} words
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-white/70">Content</label>
                  <span className={`text-xs ${
                    countWords(advanceText) > getStageRequirements(nextStage).maxWords
                      ? 'text-red-400'
                      : countWords(advanceText) >= getStageRequirements(nextStage).minWords
                      ? 'text-green-400'
                      : 'text-white/30'
                  }`}>
                    {countWords(advanceText)}/{getStageRequirements(nextStage).minWords}-{getStageRequirements(nextStage).maxWords} words
                  </span>
                </div>
                <textarea
                  value={advanceText}
                  onChange={(e) => setAdvanceText(e.target.value)}
                  placeholder={`Write the ${getStageRequirements(nextStage).label.toLowerCase()} version here...`}
                  rows={12}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-y font-mono text-sm"
                />
              </div>

              {/* Validation */}
              {advanceValidation && advanceText.trim() && (
                <div className="mb-4">
                  {advanceValidation.errors.map((err, i) => (
                    <div key={i} className="flex items-center gap-2 text-red-400 text-sm mb-1">
                      <AlertTriangle className="w-3 h-3" />
                      {err}
                    </div>
                  ))}
                  {advanceValidation.warnings.map((warn, i) => (
                    <div key={i} className="flex items-center gap-2 text-amber-400 text-sm mb-1">
                      <AlertTriangle className="w-3 h-3" />
                      {warn}
                    </div>
                  ))}
                  {advanceValidation.isValid && (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <Check className="w-3 h-3" />
                      Ready to advance
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setShowAdvance(false); setAdvanceText(''); }}
                  className="px-4 py-2 text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdvance}
                  disabled={!advanceValidation?.isValid || isAdvancing}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  {isAdvancing ? 'Advancing...' : `Advance to ${getStageRequirements(nextStage).label}`}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage History */}
      {content.stages.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-medium text-white/70 mb-3">Stage History</h3>
          <div className="space-y-2">
            {content.stages.map((entry, i) => {
              const req = getStageRequirements(entry.stage);
              const Icon = STAGE_ICONS[entry.stage];
              return (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Icon className="w-4 h-4" style={{ color: STAGE_COLORS[entry.stage] }} />
                  <span className="text-white">{req.label}</span>
                  <span className="text-white/30">{entry.wordCount} words</span>
                  <span className="text-white/20">
                    {new Date(entry.enteredAt).toLocaleDateString()}
                  </span>
                  {entry.completedAt && (
                    <Check className="w-3 h-3 text-green-400" />
                  )}
                  {entry.notes && (
                    <span className="text-white/30 italic truncate">{entry.notes}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ContentPipelinePage() {
  const { user } = useAuth();
  const [contentList, setContentList] = useState<PipelineContent[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getPipelineStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<PipelineStage | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ContentStatus | 'all'>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [list, pipelineStats] = await Promise.all([
      getContentList({
        stage: filterStage === 'all' ? undefined : filterStage,
        status: filterStatus === 'all' ? undefined : filterStatus,
      }),
      getPipelineStats(),
    ]);
    setContentList(list);
    setStats(pipelineStats);
    setLoading(false);
  }, [filterStage, filterStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return contentList;
    const q = searchQuery.toLowerCase();
    return contentList.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [contentList, searchQuery]);

  if (selectedId) {
    return (
      <PortalPageLayout variant="stage" maxWidth="lg" xrayId="content-pipeline">
        <ContentDetailView
          contentId={selectedId}
          onBack={() => setSelectedId(null)}
          onRefresh={loadData}
        />
      </PortalPageLayout>
    );
  }

  const stages: PipelineStage[] = ['seed', 'tldr', 'blog', 'article', 'paper'];

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="content-pipeline">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Layers className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Content Pipeline</h1>
              <p className="text-white/50">SEED → TL;DR → BLOG → ARTICLE → PAPER</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Seed
          </button>
        </div>
      </motion.header>

      {/* Stats */}
      {stats && <PipelineStatsBar stats={stats} />}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search content..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Stage filter */}
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-white/30" />
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value as PipelineStage | 'all')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Stages</option>
            {stages.map((s) => (
              <option key={s} value={s}>{getStageRequirements(s).label}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ContentStatus | 'all')}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="review">In Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredList.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Sprout className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No content yet</h3>
          <p className="text-white/50 mb-6">
            Plant your first seed to start the content evolution pipeline.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Plant a Seed
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => (
            <ContentCard key={item.id} content={item} onSelect={setSelectedId} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-white/30 text-sm">
        Innovation #1505 — Sequential Content Evolution Pipeline
      </div>

      {/* Create Modal */}
      <CreateContentModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(item) => {
          setContentList((prev) => [item, ...prev]);
          loadData();
        }}
      />
    </PortalPageLayout>
  );
}
