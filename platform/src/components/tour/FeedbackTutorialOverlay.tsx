import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, CheckCircle2, PenLine } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatSubmissionNumber } from '@/lib/formatSubmissionNumber';

type TutorialStep = 'welcome' | 'click_item' | 'write_submit' | 'thank_you';

interface FeedbackTutorialOverlayProps {
  onDismiss: () => void;
}

export function FeedbackTutorialOverlay({ onDismiss }: FeedbackTutorialOverlayProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<TutorialStep>('welcome');
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionNumber, setSubmissionNumber] = useState<number | null>(null);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);
  const [fableRect, setFableRect] = useState<DOMRect | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const findTargetElement = useCallback((): HTMLElement | null => {
    // Primary: WelcomeGate fable (first-visit only)
    // Fallback: hero-card on landing page (return visits)
    return (
      document.querySelector('[data-xray-id="welcomegate-fable"]') as HTMLElement | null
    ) ?? (
      document.querySelector('[data-xray-id="hero-card"]') as HTMLElement | null
    );
  }, []);

  // When entering click_item step, if no target element found, skip straight to write_submit
  useEffect(() => {
    if (step !== 'click_item') return;
    const el = findTargetElement();
    if (!el) {
      // No spotlight target available — skip to write step
      setStep('write_submit');
      return;
    }
    // Scroll target into view if needed
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [step, findTargetElement]);

  useEffect(() => {
    const updateRect = () => {
      const el = findTargetElement();
      if (el) setFableRect(el.getBoundingClientRect());
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [findTargetElement, step]);

  useEffect(() => {
    if (step === 'write_submit' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [step]);

  const handleFableClick = useCallback(() => {
    if (step === 'click_item') {
      setStep('write_submit');
    }
  }, [step]);

  const handleSubmitNote = useCallback(async () => {
    setSubmitting(true);
    // Always advance to thank_you after 5 seconds max (safety net)
    const safetyTimer = setTimeout(() => {
      setSubmitting(false);
      setStep('thank_you');
    }, 5000);

    try {
      if (user && draft.trim()) {
        const { data } = await supabase
          .from('tour_notes_submitted' as never)
          .insert({
            user_id: user.id,
            item_slug: 'tutorial-feedback',
            item_title: 'Tutorial Feedback',
            content: draft.trim(),
            detail_level: 'tutorial',
          } as never)
          .select('submission_number')
          .single();
        if (data) {
          setSubmissionNumber((data as { submission_number: number }).submission_number);
        }
      }
    } catch {
      // Insert failed — still advance to thank you
    }

    clearTimeout(safetyTimer);
    setSubmitting(false);
    setStep('thank_you');
  }, [user, draft]);

  const handleDismiss = useCallback(async () => {
    if (doNotShowAgain) {
      localStorage.setItem('feedback_tutorial_dismissed', 'true');
      if (user) {
        try {
          await supabase
            .from('user_preferences' as never)
            .upsert({
              user_id: user.id,
              key: 'feedback_tutorial_dismissed',
              value: true,
              updated_at: new Date().toISOString(),
            } as never, { onConflict: 'user_id,key' });
        } catch { /* silent */ }
      }
    }
    onDismiss();
  }, [doNotShowAgain, user, onDismiss]);

  const spotlightPad = 12;

  return createPortal(
    <div className="fixed inset-0 z-[9980]" style={{ isolation: 'isolate' }}>
      {/* Semi-transparent backdrop — changes per step */}
      {step === 'click_item' && fableRect ? (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={fableRect.left - spotlightPad}
                y={fableRect.top - spotlightPad}
                width={fableRect.width + spotlightPad * 2}
                height={fableRect.height + spotlightPad * 2}
                rx="16"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0" y="0" width="100%" height="100%"
            fill="rgba(0,0,0,0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      ) : step === 'write_submit' ? (
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1 }} />
      ) : (
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1 }} />
      )}

      {/* Clickable layer for spotlight step */}
      {step === 'click_item' && fableRect && (
        <div
          className="absolute cursor-pointer"
          style={{
            left: fableRect.left - spotlightPad,
            top: fableRect.top - spotlightPad,
            width: fableRect.width + spotlightPad * 2,
            height: fableRect.height + spotlightPad * 2,
            zIndex: 5,
            borderRadius: 16,
            boxShadow: '0 0 0 4px rgba(251, 191, 36, 0.5), 0 0 30px rgba(251, 191, 36, 0.2)',
          }}
          onClick={handleFableClick}
        />
      )}

      {/* Step 1: Welcome */}
      {step === 'welcome' && (
        <div className="absolute inset-0 flex items-start justify-center pt-8 sm:pt-16 px-4" style={{ zIndex: 10 }}>
          <div
            className="w-full max-w-lg rounded-2xl p-6 sm:p-8 text-center"
            style={{
              background: 'rgba(15, 23, 42, 0.97)',
              border: '2px solid rgba(251, 191, 36, 0.5)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(251, 191, 36, 0.1)',
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <PenLine className="w-5 h-5 text-amber-400" />
              <h2 className="text-amber-400 font-bold text-xl tracking-wide uppercase">
                Feedback Requested
              </h2>
            </div>

            <p className="text-slate-300 leading-relaxed mb-2">
              You're exploring a live alpha preview that actually works, but we need{' '}
              <span className="text-white font-semibold">YOUR</span> feedback to shape how we continue.
            </p>

            <p className="text-slate-400 text-sm mb-6">
              Let us show you how easy it is.
            </p>

            <button
              onClick={() => setStep('click_item')}
              className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#1e293b',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
              }}
            >
              Show Me How
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Click Item — Animated arrow pointing at fable */}
      {step === 'click_item' && fableRect && (
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: fableRect.left + fableRect.width / 2,
            top: fableRect.top - spotlightPad - 90,
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <div
            className="px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide mb-2"
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '2px solid rgba(251, 191, 36, 0.6)',
              color: '#fbbf24',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap',
            }}
          >
            Click This Item
          </div>
          <ArrowDown
            className="w-10 h-10 text-amber-400"
            style={{
              animation: 'tutorialBounce 1s ease-in-out infinite',
              filter: 'drop-shadow(0 2px 8px rgba(251, 191, 36, 0.4))',
            }}
          />
        </div>
      )}

      {/* Step 3: Write & Submit */}
      {step === 'write_submit' && (
        <div className="absolute inset-0 flex items-center justify-center px-4" style={{ zIndex: 10 }}>
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl w-full items-start">
            {/* Instructional text */}
            <div
              className="flex-shrink-0 sm:w-56 p-5 rounded-xl"
              style={{
                background: 'rgba(15, 23, 42, 0.97)',
                border: '2px solid rgba(251, 191, 36, 0.4)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              }}
            >
              <p className="text-amber-300 font-semibold text-sm mb-2">How it works:</p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Write what you want in the textbox, and hit{' '}
                <span className="text-amber-400 font-bold">"Ok"</span> to submit.
              </p>
              <p className="text-slate-500 text-xs mt-3">
                You can leave it blank to skip.
              </p>
            </div>

            {/* Notes panel */}
            <div
              className="flex-1 min-w-0 rounded-xl overflow-hidden"
              style={{
                background: 'rgba(15, 23, 42, 0.98)',
                border: '1px solid rgba(251, 191, 36, 0.5)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(251, 191, 36, 0.1)',
              }}
            >
              {/* Title bar */}
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
                }}
              >
                <PenLine className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="text-amber-300 font-semibold text-xs truncate">
                  Notes: Write what you think about what you clicked on
                </span>
              </div>

              {/* Body */}
              <div className="p-4">
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write your feedback... (or leave blank to skip)"
                  rows={4}
                  className="w-full rounded-lg p-3 text-sm resize-vertical outline-none"
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    color: '#e2e8f0',
                    fontFamily: 'inherit',
                  }}
                />

                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSubmitNote}
                    disabled={submitting}
                    className="px-8 py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-105 disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#1e293b',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Ok'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Thank You */}
      {step === 'thank_you' && (
        <div className="absolute inset-0 flex items-center justify-center px-4" style={{ zIndex: 10 }}>
          <div
            className="w-full max-w-md rounded-2xl p-6 sm:p-8 text-center"
            style={{
              background: 'rgba(15, 23, 42, 0.97)',
              border: '2px solid rgba(34, 197, 94, 0.5)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(34, 197, 94, 0.1)',
            }}
          >
            {submissionNumber != null ? (
              <>
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h3 className="text-green-400 font-bold text-lg tracking-wide mb-2">
                  SAVED as {formatSubmissionNumber(submissionNumber)}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-1">
                  Your feedback has been received and will be reviewed by our team.
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h3 className="text-green-400 font-bold text-lg tracking-wide mb-2">
                  Thank you!
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-1">
                  You can submit feedback anytime.
                </p>
              </>
            )}

            <p className="text-slate-400 text-xs mt-3 mb-6">
              You can leave feedback on ANY item, anytime, by clicking the{' '}
              <PenLine className="inline w-3.5 h-3.5 text-amber-400" /> icon or pressing{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-amber-300 text-xs font-mono">N</kbd>.
            </p>

            {/* Do not show again checkbox */}
            <label className="flex items-center justify-center gap-2 mb-5 cursor-pointer group">
              <input
                type="checkbox"
                checked={doNotShowAgain}
                onChange={(e) => setDoNotShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30"
              />
              <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                Do not show these directions again
              </span>
            </label>

            <button
              onClick={handleDismiss}
              className="px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* CSS animation for bouncing arrow */}
      <style>{`
        @keyframes tutorialBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(12px); }
        }
      `}</style>
    </div>,
    document.body
  );
}
