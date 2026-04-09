import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  PLATFORM_DISPLAY,
  PLATFORM_GUARDRAILS,
  calculateStaggerSchedule,
  type DispatchPlatformContent,
  type DispatchMode,
} from '@/lib/dispatchGuardrails';
import type { SocialPlatform } from '@/lib/socialPlugSystem';
import { Check, X, Edit3, SkipForward, Send, Loader2, AlertTriangle, Shield } from 'lucide-react';

interface StampToSendModalProps {
  platformContents: DispatchPlatformContent[];
  dispatchMode: DispatchMode;
  scheduledTime?: Date;
  userId: string;
  onClose: () => void;
  onComplete: () => void;
}

export function StampToSendModal({
  platformContents: initialContents,
  dispatchMode,
  scheduledTime,
  userId,
  onClose,
  onComplete,
}: StampToSendModalProps) {
  const [contents, setContents] = useState<DispatchPlatformContent[]>(
    initialContents.map(c => ({ ...c }))
  );
  const [editingPlatform, setEditingPlatform] = useState<SocialPlatform | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeContents = contents.filter(c => !c.skipped);
  const allApproved = activeContents.length > 0 && activeContents.every(c => c.approved);

  const toggleApproval = useCallback((platform: SocialPlatform) => {
    setContents(prev =>
      prev.map(c =>
        c.platform === platform ? { ...c, approved: !c.approved } : c
      )
    );
  }, []);

  const skipPlatform = useCallback((platform: SocialPlatform) => {
    setContents(prev =>
      prev.map(c =>
        c.platform === platform ? { ...c, skipped: true, approved: false } : c
      )
    );
  }, []);

  const startEdit = useCallback((platform: SocialPlatform) => {
    const item = contents.find(c => c.platform === platform);
    if (item) {
      setEditingPlatform(platform);
      setEditBuffer(item.content);
    }
  }, [contents]);

  const saveEdit = useCallback(() => {
    if (!editingPlatform) return;
    setContents(prev =>
      prev.map(c =>
        c.platform === editingPlatform
          ? { ...c, content: editBuffer, approved: false }
          : c
      )
    );
    setEditingPlatform(null);
    setEditBuffer('');
  }, [editingPlatform, editBuffer]);

  const handleDispatch = async () => {
    if (!allApproved || dispatching) return;
    setDispatching(true);
    setError(null);

    try {
      const batchId = crypto.randomUUID();
      const baseTime = dispatchMode === 'scheduled' && scheduledTime
        ? scheduledTime
        : new Date();

      const activePlatforms = activeContents.map(c => c.platform);

      const staggerSchedule = dispatchMode === 'stagger'
        ? calculateStaggerSchedule(activePlatforms, baseTime)
        : null;

      const records = activeContents.map((c, i) => {
        let scheduledFor: string;
        if (dispatchMode === 'stagger' && staggerSchedule) {
          scheduledFor = staggerSchedule[i].scheduledFor.toISOString();
        } else if (dispatchMode === 'scheduled' && scheduledTime) {
          scheduledFor = scheduledTime.toISOString();
        } else {
          scheduledFor = new Date().toISOString();
        }

        return {
          user_id: userId,
          content: c.content,
          adapted_content: c.content,
          media_urls: c.mediaUrls,
          platform: c.platform,
          scheduled_for: scheduledFor,
          status: dispatchMode === 'now' ? 'pending' : 'scheduled',
          dispatch_mode: dispatchMode,
          dispatch_batch_id: batchId,
          disclosure_tags: c.disclosureTags,
        };
      });

      const { error: insertError } = await supabase
        .from('member_scheduled_posts')
        .insert(records);

      if (insertError) throw insertError;

      await supabase.from('dispatch_audit_log').insert({
        user_id: userId,
        batch_id: batchId,
        dispatch_mode: dispatchMode,
        platform_count: activePlatforms.length,
        platforms: activePlatforms,
        base_content: activeContents[0]?.content?.slice(0, 500),
      });

      onComplete();
    } catch (err: any) {
      console.error('Dispatch failed:', err);
      setError(err.message || 'Dispatch failed. Please try again.');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-card border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="font-bold text-lg">Stamp-to-Send</h2>
              <p className="text-xs text-muted-foreground">
                Review and approve each platform before dispatch
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Stack */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {contents.map(item => {
            const display = PLATFORM_DISPLAY[item.platform];
            const guardrail = PLATFORM_GUARDRAILS[item.platform];
            const isEditing = editingPlatform === item.platform;

            if (item.skipped) {
              return (
                <div key={item.platform} className="flex items-center gap-3 p-3 rounded-lg border border-dashed opacity-50">
                  <span className="text-lg">{display.icon}</span>
                  <span className="text-sm text-muted-foreground line-through">{display.name} — skipped</span>
                  <button
                    onClick={() => setContents(prev => prev.map(c =>
                      c.platform === item.platform ? { ...c, skipped: false } : c
                    ))}
                    className="ml-auto text-xs text-amber-600 hover:underline"
                  >
                    Restore
                  </button>
                </div>
              );
            }

            return (
              <div
                key={item.platform}
                className={`rounded-xl border-2 transition-all ${
                  item.approved
                    ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                    : 'border-border'
                }`}
              >
                {/* Platform header */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/30">
                  <span className="text-lg">{display.icon}</span>
                  <span className="text-sm font-semibold">{display.name}</span>
                  <span className={`text-xs ml-auto ${
                    item.content.length > guardrail.charLimit ? 'text-red-500 font-bold' : 'text-muted-foreground'
                  }`}>
                    {item.content.length}/{guardrail.charLimit}
                  </span>
                </div>

                {/* Content preview or editor */}
                <div className="p-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editBuffer}
                        onChange={(e) => setEditBuffer(e.target.value)}
                        className="w-full min-h-[100px] rounded-lg border bg-background p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setEditingPlatform(null)}
                          className="px-3 py-1 text-xs rounded-md border hover:bg-accent"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1 text-xs rounded-md bg-amber-500 text-white hover:bg-amber-600"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.content}</p>
                  )}

                  {/* Disclosure tags */}
                  {item.disclosureTags.length > 0 && !isEditing && (
                    <div className="flex gap-1.5 mt-2">
                      {item.disclosureTags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Exceeds limit warning */}
                  {item.exceedsLimit && !isEditing && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600">
                      <AlertTriangle className="w-3 h-3" />
                      Content exceeds {display.name}'s character limit — it will be truncated
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-2 px-4 py-2.5 border-t bg-muted/20">
                    <button
                      onClick={() => toggleApproval(item.platform)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        item.approved
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'border border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      {item.approved ? 'Approved ✓' : 'Approve'}
                    </button>
                    <button
                      onClick={() => startEdit(item.platform)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border hover:bg-accent transition-colors"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => skipPlatform(item.platform)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border hover:bg-accent transition-colors ml-auto text-muted-foreground"
                    >
                      <SkipForward className="w-3 h-3" /> Skip
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/20">
          {error && (
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {activeContents.filter(c => c.approved).length}/{activeContents.length} platforms approved
            </p>
            <button
              onClick={handleDispatch}
              disabled={!allApproved || dispatching}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {dispatching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {dispatching ? 'Dispatching...' : `Dispatch to ${activeContents.length} Platform${activeContents.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
