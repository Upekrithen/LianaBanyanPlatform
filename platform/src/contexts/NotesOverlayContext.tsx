import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { NotesOverlay } from '@/components/tour/NotesOverlay';

interface NotesOverlayState {
  openNotes: (slug: string, title: string, detailLevel?: string) => void;
  openCodebreaker: (keyId: string, hint: string, documentTitle: string) => void;
}

const Ctx = createContext<NotesOverlayState>({ openNotes: () => {}, openCodebreaker: () => {} });

export function useNotesOverlay() {
  return useContext(Ctx);
}

export function NotesOverlayProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState({ slug: '', title: '', detailLevel: '' });
  const [mode, setMode] = useState<'notes' | 'codebreaker'>('notes');
  const [codebreakerPayload, setCodebreakerPayload] = useState({ keyId: '', hint: '' });

  const openNotes = useCallback((slug: string, title: string, detailLevel = 'full_detail') => {
    setCurrent({ slug, title, detailLevel });
    setMode('notes');
    setIsOpen(true);
  }, []);

  const openCodebreaker = useCallback((keyId: string, hint: string, documentTitle: string) => {
    setCurrent({ slug: `codebreaker-${keyId}`, title: documentTitle, detailLevel: 'full_detail' });
    setCodebreakerPayload({ keyId, hint });
    setMode('codebreaker');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setMode('notes');
  }, []);

  // Global "N" key shortcut to open/toggle notes overlay
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (isOpen) {
          setIsOpen(false);
          setMode('notes');
        } else {
          setCurrent({ slug: 'general-feedback', title: 'General Feedback', detailLevel: 'full_detail' });
          setMode('notes');
          setIsOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  return (
    <Ctx.Provider value={{ openNotes, openCodebreaker }}>
      {children}
      <NotesOverlay
        isOpen={isOpen}
        onClose={close}
        itemSlug={current.slug}
        itemTitle={current.title}
        detailLevel={current.detailLevel}
        mode={mode}
        keyHint={codebreakerPayload.hint}
        keyId={codebreakerPayload.keyId}
      />
    </Ctx.Provider>
  );
}
