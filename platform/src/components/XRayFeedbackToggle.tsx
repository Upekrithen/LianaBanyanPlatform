import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Glasses, X, Send, Bug, HelpCircle, Lightbulb, PenTool, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const CATEGORIES = [
  { value: 'bug', label: 'Bug', icon: Bug, color: 'text-red-400 bg-red-500/20' },
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'text-blue-400 bg-blue-500/20' },
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-amber-400 bg-amber-500/20' },
  { value: 'correction', label: 'Correction', icon: PenTool, color: 'text-orange-400 bg-orange-500/20' },
  { value: 'praise', label: 'Praise', icon: ThumbsUp, color: 'text-green-400 bg-green-500/20' },
] as const;

const CATEGORY_DOT_COLORS: Record<string, string> = {
  bug: 'bg-red-500',
  question: 'bg-blue-500',
  suggestion: 'bg-amber-500',
  correction: 'bg-orange-500',
  praise: 'bg-green-500',
};

interface FeedbackPin {
  id: string;
  x: number;
  y: number;
  category: string;
}

export function XRayFeedbackToggle() {
  const { user } = useAuth();
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [pins, setPins] = useState<FeedbackPin[]>([]);
  const [droppingPin, setDroppingPin] = useState<{ x: number; y: number } | null>(null);
  const [category, setCategory] = useState<string>('suggestion');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Load existing pins for this page
  useEffect(() => {
    if (!active || !user) return;
    (async () => {
      const { data } = await supabase
        .from('xray_feedback' as never)
        .select('id, pin_x, pin_y, category')
        .eq('user_id', user.id)
        .eq('page_url', location.pathname) as { data: Array<{ id: string; pin_x: number; pin_y: number; category: string }> | null };
      if (data) {
        setPins(data.map(d => ({ id: d.id, x: d.pin_x, y: d.pin_y, category: d.category })));
      }
    })();
  }, [active, user, location.pathname]);

  // Reset on page change
  useEffect(() => {
    setActive(false);
    setDroppingPin(null);
    setPins([]);
  }, [location.pathname]);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!active) return;
    if ((e.target as HTMLElement).closest('.xray-form-container')) return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setDroppingPin({ x: xPct, y: yPct });
    setMessage('');
    setCategory('suggestion');
    setSubmitted(false);
  }, [active]);

  const handleSubmit = useCallback(async () => {
    if (!user || !droppingPin || !message.trim()) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('xray_feedback' as never)
        .insert({
          user_id: user.id,
          page_url: location.pathname,
          page_title: document.title,
          category,
          message: message.trim(),
          pin_x: droppingPin.x,
          pin_y: droppingPin.y,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
          user_agent: navigator.userAgent,
        } as never)
        .select('id')
        .single();

      if (!error && data) {
        setPins(prev => [...prev, { id: (data as { id: string }).id, x: droppingPin.x, y: droppingPin.y, category }]);
        setSubmitted(true);
        setTimeout(() => {
          setDroppingPin(null);
          setSubmitted(false);
        }, 1200);
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }, [user, droppingPin, message, category, location.pathname]);

  if (!user) return null;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setActive(prev => !prev)}
        className={`fixed bottom-6 right-6 z-[9998] p-3 rounded-full shadow-lg transition-all ${
          active
            ? 'bg-green-500 text-white ring-2 ring-green-400/50 scale-110'
            : 'bg-white/10 text-white/60 hover:bg-white/20 backdrop-blur-md border border-white/20'
        }`}
        title={active ? 'Exit X-Ray Feedback' : 'X-Ray Feedback'}
      >
        {active ? <X className="w-5 h-5" /> : <Glasses className="w-5 h-5" />}
      </button>

      {/* Overlay portal */}
      {active && createPortal(
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[9997] pointer-events-auto"
          style={{ backgroundColor: 'rgba(0, 200, 100, 0.06)', cursor: 'crosshair' }}
        >
          {/* Existing pins */}
          {pins.map(pin => (
            <div
              key={pin.id}
              className={`absolute w-3.5 h-3.5 rounded-full ${CATEGORY_DOT_COLORS[pin.category] || 'bg-white'} ring-2 ring-white/40 pointer-events-none`}
              style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -50%)' }}
            />
          ))}

          {/* Active pin + form */}
          <AnimatePresence>
            {droppingPin && (
              <>
                {/* Pin marker */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute w-4 h-4 rounded-full ${CATEGORY_DOT_COLORS[category] || 'bg-white'} ring-2 ring-white/60`}
                  style={{ left: `${droppingPin.x}%`, top: `${droppingPin.y}%`, transform: 'translate(-50%, -50%)' }}
                />

                {/* Feedback form */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="xray-form-container absolute z-10"
                  style={{
                    left: `min(${droppingPin.x}%, calc(100% - 320px))`,
                    top: `calc(${droppingPin.y}% + 20px)`,
                    maxWidth: 300,
                  }}
                >
                  <div className="p-4 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/20 shadow-2xl" onClick={e => e.stopPropagation()}>
                    {submitted ? (
                      <div className="text-center py-4">
                        <ThumbsUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <div className="text-sm text-white/70">Feedback submitted!</div>
                      </div>
                    ) : (
                      <>
                        {/* Category selector */}
                        <div className="flex gap-1.5 mb-3">
                          {CATEGORIES.map(cat => (
                            <button
                              key={cat.value}
                              onClick={() => setCategory(cat.value)}
                              className={`p-1.5 rounded-lg transition-all ${
                                category === cat.value
                                  ? `${cat.color} ring-1 ring-current`
                                  : 'bg-white/5 text-white/40 hover:bg-white/10'
                              }`}
                              title={cat.label}
                            >
                              <cat.icon className="w-4 h-4" />
                            </button>
                          ))}
                        </div>

                        {/* Message */}
                        <textarea
                          value={message}
                          onChange={e => setMessage(e.target.value.slice(0, 500))}
                          placeholder="What do you see?"
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 resize-none mb-2"
                          autoFocus
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/30">{message.length}/500</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setDroppingPin(null)}
                              className="px-3 py-1.5 rounded-lg bg-white/10 text-white/60 text-sm hover:bg-white/20"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSubmit}
                              disabled={!message.trim() || submitting}
                              className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium flex items-center gap-1.5 disabled:opacity-40"
                            >
                              <Send className="w-3.5 h-3.5" />
                              {submitting ? '...' : 'Submit'}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Mode indicator */}
          <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-medium border border-green-500/30 pointer-events-none">
            X-Ray Mode — Click anywhere to drop feedback
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
