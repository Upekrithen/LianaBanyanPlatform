import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { PenLine, X, Save, Send, Clock, CheckCircle2, GripHorizontal, Key, Sparkles } from 'lucide-react';
import { useTourNotes } from '@/hooks/useTourNotes';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface NotesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  itemSlug: string;
  itemTitle: string;
  detailLevel: string;
  mode?: 'notes' | 'codebreaker';
  keyHint?: string;
  keyId?: string;
}

export function NotesOverlay({ isOpen, onClose, itemSlug, itemTitle, detailLevel, mode = 'notes', keyHint, keyId }: NotesOverlayProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { personalNotes, savePersonal, submitForReview } = useTourNotes(itemSlug);
  const [draft, setDraft] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [keyResult, setKeyResult] = useState<'correct' | 'incorrect' | null>(null);
  const [feathersEarned, setFeathersEarned] = useState(0);
  const [keySubmitting, setKeySubmitting] = useState(false);
  const draftTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [pos, setPos] = useState(() => ({
    x: isMobile ? 8 : window.innerWidth - 400,
    y: isMobile ? 60 : 80,
  }));
  const [dragging, setDragging] = useState<{ offsetX: number; offsetY: number } | null>(null);

  const isCodebreaker = mode === 'codebreaker';

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const lsKey = `lb_note_draft_${itemSlug}`;
    const existing = localStorage.getItem(lsKey);
    if (existing) setDraft(existing);

    draftTimerRef.current = setInterval(() => {
      const el = textareaRef.current;
      if (el && el.value.trim()) {
        localStorage.setItem(lsKey, el.value);
      }
    }, 5000);

    return () => {
      if (draftTimerRef.current) clearInterval(draftTimerRef.current);
    };
  }, [isOpen, itemSlug]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX - dragging.offsetX, y: e.clientY - dragging.offsetY });
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging]);

  const handleSave = useCallback(async () => {
    if (!draft.trim()) return;
    await savePersonal.mutateAsync({ content: draft, itemTitle, detailLevel });
    localStorage.removeItem(`lb_note_draft_${itemSlug}`);
    setDraft('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [draft, savePersonal, itemTitle, detailLevel, itemSlug]);

  const handleSubmit = useCallback(async () => {
    if (!draft.trim()) return;
    await submitForReview.mutateAsync({ content: draft, itemTitle, detailLevel });
    localStorage.removeItem(`lb_note_draft_${itemSlug}`);
    setDraft('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }, [draft, submitForReview, itemTitle, detailLevel, itemSlug]);

  const handleCodebreakerSubmit = useCallback(async () => {
    if (!draft.trim() || !user?.email) return;
    setKeySubmitting(true);
    try {
      const { data, error } = await supabase
        .from('key_submissions')
        .insert({ user_email: user.email, key_word: draft.trim().toUpperCase() })
        .select()
        .single();

      if (error) throw error;

      if ((data as any).is_correct) {
        setKeyResult('correct');
        setFeathersEarned((data as any).feathers_awarded || 0);
        setDraft('');
        queryClient.invalidateQueries({ queryKey: ['user-feathers'] });
        queryClient.invalidateQueries({ queryKey: ['treasure-keys-for-doc'] });
      } else {
        setKeyResult('incorrect');
      }
      setTimeout(() => setKeyResult(null), 5000);
    } catch (err: any) {
      setKeyResult('incorrect');
      setTimeout(() => setKeyResult(null), 3000);
    } finally {
      setKeySubmitting(false);
    }
  }, [draft, user, queryClient]);

  useEffect(() => {
    if (!isOpen) {
      setKeyResult(null);
      setFeathersEarned(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const notes = personalNotes.data ?? [];

  const themeColor = isCodebreaker ? { border: 'rgba(234, 179, 8, 0.6)', bg: 'rgba(234, 179, 8, 0.2)', borderSub: 'rgba(234, 179, 8, 0.4)', text: '#fbbf24', title: 'text-yellow-300' } : { border: 'rgba(251, 191, 36, 0.5)', bg: 'rgba(251, 191, 36, 0.1)', borderSub: 'rgba(251, 191, 36, 0.2)', text: '#fbbf24', title: 'text-amber-300' };

  const notesContent = (
    <>
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={isCodebreaker ? 'Type the key word...' : 'Write your notes...'}
        rows={isCodebreaker ? 2 : 4}
        onKeyDown={(e) => {
          if (isCodebreaker && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCodebreakerSubmit();
          }
        }}
        style={{
          width: '100%',
          background: 'rgba(30, 41, 59, 0.8)',
          border: `1px solid ${isCodebreaker ? 'rgba(234, 179, 8, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
          borderRadius: '0.5rem',
          padding: '0.5rem',
          color: '#e2e8f0',
          fontSize: isMobile ? '1rem' : '0.8rem',
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />

      {isCodebreaker && keyHint && (
        <div className="mt-2 p-2" style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '0.5rem' }}>
          <p style={{ color: '#fbbf24', fontSize: '0.7rem', fontWeight: 600, margin: 0 }}>Hint:</p>
          <p style={{ color: '#94a3b8', fontSize: '0.7rem', margin: '0.15rem 0 0 0' }}>{keyHint}</p>
        </div>
      )}

      {isCodebreaker && keyResult === 'correct' && (
        <div className="mt-2 p-2" style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '0.5rem', textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700 }}>KEY FOUND! +{feathersEarned} Feathers</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
        </div>
      )}

      {isCodebreaker && keyResult === 'incorrect' && (
        <div className="mt-2 p-2" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '0.5rem' }}>
          <p style={{ color: '#f87171', fontSize: '0.7rem', fontWeight: 600, margin: 0 }}>Not quite. Try again!</p>
          {keyHint && <p style={{ color: '#94a3b8', fontSize: '0.65rem', margin: '0.25rem 0 0 0' }}>Hint: {keyHint}</p>}
        </div>
      )}

      {!isCodebreaker && saved && (
        <div className="flex items-center gap-1.5 mt-2" style={{ color: '#4ade80', fontSize: '0.7rem' }}>
          <CheckCircle2 className="w-3.5 h-3.5" /> Note saved to your personal collection
        </div>
      )}
      {!isCodebreaker && submitted && (
        <div className="mt-2 p-2" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '0.5rem' }}>
          <p style={{ color: '#4ade80', fontSize: '0.7rem', fontWeight: 600, margin: 0 }}>Submitted for review by our Librarian team.</p>
          <p style={{ color: '#94a3b8', fontSize: '0.65rem', margin: '0.25rem 0 0 0' }}>If it's a question, you'll receive a response.</p>
        </div>
      )}

      {isCodebreaker ? (
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleCodebreakerSubmit}
            disabled={!draft.trim() || !user || keySubmitting}
            title={!user ? 'Sign in to submit key words' : ''}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
              padding: isMobile ? '0.75rem' : '0.5rem',
              background: draft.trim() && user ? 'rgba(234, 179, 8, 0.2)' : 'rgba(30, 41, 59, 0.5)',
              border: `1px solid ${draft.trim() && user ? 'rgba(234, 179, 8, 0.5)' : 'rgba(100, 116, 139, 0.2)'}`,
              borderRadius: '0.5rem',
              cursor: draft.trim() && user ? 'pointer' : 'default',
              color: draft.trim() && user ? '#eab308' : '#64748b',
              fontSize: '0.7rem', fontWeight: 600,
            }}
          >
            <Key className="w-3.5 h-3.5" />
            {keySubmitting ? 'Checking...' : 'Unlock'}
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSave}
            disabled={!draft.trim() || savePersonal.isPending}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
              padding: isMobile ? '0.75rem' : '0.5rem',
              background: draft.trim() ? 'rgba(251, 191, 36, 0.15)' : 'rgba(30, 41, 59, 0.5)',
              border: `1px solid ${draft.trim() ? 'rgba(251, 191, 36, 0.4)' : 'rgba(100, 116, 139, 0.2)'}`,
              borderRadius: '0.5rem',
              cursor: draft.trim() ? 'pointer' : 'default',
              color: draft.trim() ? '#fbbf24' : '#64748b',
              fontSize: '0.7rem', fontWeight: 600,
            }}
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
          <button
            onClick={handleSubmit}
            disabled={!draft.trim() || !user || submitForReview.isPending}
            title={!user ? 'Sign in to submit notes for review' : ''}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
              padding: isMobile ? '0.75rem' : '0.5rem',
              background: draft.trim() && user ? 'rgba(34, 211, 238, 0.15)' : 'rgba(30, 41, 59, 0.5)',
              border: `1px solid ${draft.trim() && user ? 'rgba(34, 211, 238, 0.4)' : 'rgba(100, 116, 139, 0.2)'}`,
              borderRadius: '0.5rem',
              cursor: draft.trim() && user ? 'pointer' : 'default',
              color: draft.trim() && user ? '#22d3ee' : '#64748b',
              fontSize: '0.7rem', fontWeight: 600,
            }}
          >
            <Send className="w-3.5 h-3.5" />
            Submit
          </button>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-4">
          <p style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Previous notes for this item:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {notes.map((note) => (
              <div
                key={note.id}
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(100, 116, 139, 0.2)',
                  borderRadius: '0.375rem',
                  padding: '0.4rem 0.5rem',
                }}
              >
                <p style={{ color: '#cbd5e1', fontSize: '0.7rem', margin: 0, lineHeight: 1.5 }}>{note.content}</p>
                <div className="flex items-center gap-1 mt-1" style={{ color: '#64748b', fontSize: '0.6rem' }}>
                  <Clock className="w-3 h-3" />
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return createPortal(
    <div className="fixed inset-0 z-[9990] pointer-events-none" style={{ isolation: 'isolate' }}>
      {/* Backdrop */}
      <div className="pointer-events-auto fixed inset-0" style={{ zIndex: 9990 }} onClick={onClose} />

      {isMobile ? (
        /* ── Mobile bottom-sheet ── */
        <div
          className="pointer-events-auto fixed bottom-0 left-0 right-0"
          style={{
            zIndex: 9995,
            background: 'rgba(15, 23, 42, 0.98)',
            borderTop: `1px solid ${themeColor.border}`,
            borderRadius: '0.75rem 0.75rem 0 0',
            boxShadow: `0 -8px 32px rgba(0, 0, 0, 0.5), 0 0 20px ${isCodebreaker ? 'rgba(234, 179, 8, 0.15)' : 'rgba(251, 191, 36, 0.1)'}`,
            maxHeight: '50vh',
            overflowY: 'auto',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: themeColor.bg,
              borderBottom: `1px solid ${themeColor.borderSub}`,
              position: 'sticky', top: 0, zIndex: 1,
            }}
          >
            {isCodebreaker ? (
              <Key className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            ) : (
              <PenLine className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            <span className={`font-semibold flex-1 truncate ${themeColor.title}`} style={{ fontSize: '0.8rem' }}>
              {isCodebreaker ? `Codebreaker: ${itemTitle}` : `Notes: ${itemTitle}`}
            </span>
            <button
              onClick={onClose}
              className="flex items-center justify-center text-slate-400 hover:text-amber-400 transition-colors flex-shrink-0"
              style={{ border: 'none', background: 'none', cursor: 'pointer', width: 44, height: 44 }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '0.75rem 1rem 1rem' }}>
            {notesContent}
          </div>
        </div>
      ) : (
        /* ── Desktop draggable panel ── */
        <div
          className="pointer-events-auto"
          style={{
            position: 'fixed',
            top: pos.y,
            left: pos.x,
            width: 360,
            zIndex: 9995,
            userSelect: dragging ? 'none' : 'auto',
          }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.98)',
              border: `1px solid ${themeColor.border}`,
              borderRadius: '0.75rem',
              boxShadow: isCodebreaker
                ? '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(234, 179, 8, 0.2)'
                : '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(251, 191, 36, 0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Title bar — draggable */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: themeColor.bg,
                borderBottom: `1px solid ${themeColor.borderSub}`,
                cursor: 'grab',
              }}
              onMouseDown={(e) => { e.preventDefault(); setDragging({ offsetX: e.clientX - pos.x, offsetY: e.clientY - pos.y }); }}
            >
              <GripHorizontal className="w-4 h-4 text-amber-500/50 flex-shrink-0" />
              {isCodebreaker ? (
                <Key className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              ) : (
                <PenLine className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              )}
              <span
                className={`font-semibold flex-1 truncate ${themeColor.title}`}
                style={{ fontSize: '0.75rem' }}
              >
                {isCodebreaker ? `Codebreaker: ${itemTitle}` : `Notes: ${itemTitle}`}
              </span>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-amber-400 transition-colors flex-shrink-0"
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {notesContent}
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

export function NoteIndicatorDot({ hasNotes }: { hasNotes: boolean }) {
  if (!hasNotes) return null;
  return (
    <span
      style={{
        display: 'inline-block',
        width: 6, height: 6,
        borderRadius: '50%',
        background: '#fbbf24',
        boxShadow: '0 0 6px rgba(251, 191, 36, 0.5)',
        marginLeft: 4,
        verticalAlign: 'middle',
      }}
    />
  );
}
