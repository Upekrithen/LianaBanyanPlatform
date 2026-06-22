/**
 * MascotAuthGate — Progressive, character-voiced auth gate.
 * ==========================================================
 * Replaces the cold "Sign in to access your dashboard" modal with a
 * mascot-voiced, context-aware explanation bubble and progressive
 * form flow:
 *   1. Email entry
 *   2. [Sign In] → password reveal; [Sign Up] → 3D card flip to signup
 *   3. Signup side asks for password + confirm, then submits
 *
 * Wiring: uses existing Supabase auth client. Drop-in replacement
 * for the Auth page Card component.
 *
 * Introduced B080.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { Glasses } from 'lucide-react';
// MascotBubble kept as a reusable export — this gate inlines the same styling
// so the form lives INSIDE the speech bubble as one unified panel.

export interface MascotAuthGateProps {
  /**
   * Context-aware explanation of what gated the user.
   * Example: "To save those files" or "To go to your Dashboard Helm".
   * The mascot says: `{contextMessage}, you'll need to sign in so we know it's you.`
   */
  contextMessage?: string;
  /** Optional custom full message override (replaces the contextMessage template). */
  customMessage?: React.ReactNode;
  /** Called on successful sign-in or sign-up. */
  onAuthed?: () => void;
}

type Step = 'email' | 'signin-password' | 'signup-password' | 'email-sent';

const emailSchema = z.string().email('That email does not look right yet.');
const passwordSchema = z.string().min(6, 'Passwords need at least 6 characters.');

export const MascotAuthGate: React.FC<MascotAuthGateProps> = ({
  contextMessage,
  customMessage,
  onAuthed,
}) => {
  const [step, setStep] = useState<Step>('email');
  const [flipped, setFlipped] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordPrompt, setShowForgotPasswordPrompt] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for "Resend email" button
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const handleResendEmail = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    const redirectUrl = `${window.location.origin}/welcome`;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: emailSentTo,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      toast.error('Could not resend. Please try again.');
      return;
    }
    toast.success('Confirmation email resent.');
    setResendCountdown(30);
  };

  const bubbleMessage =
    customMessage ??
    (
      <>
        {contextMessage ? (
          <>
            {contextMessage.replace(/[.,!]$/, '')}, you'll need to sign in so we know
            it's you.
          </>
        ) : (
          <>You'll need to sign in so we know it's you.</>
        )}
      </>
    );

  // Contextual placeholder text — the mascot's "next prompt" lives in the field
  const emailPlaceholder = "Enter your email and we'll take it from there";
  const signinPasswordPlaceholder = 'Good. Now your password.';
  const signupPasswordPlaceholder = "Pick something you'll remember";
  const signupConfirmPlaceholder = 'Type it again';

  const handleEmailEnter = async () => {
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }
    setShowForgotPasswordPrompt(false);
    setLoading(true);
    try {
      // Auto-detect: does this email already exist?
      const { data, error } = await supabase.rpc('check_email_registered', {
        email_input: email,
      });
      setLoading(false);
      if (error) {
        // RPC not deployed yet or network issue — fall back to sign-in
        setStep('signin-password');
        setFlipped(false);
        return;
      }
      if (data === true) {
        // Existing member → sign-in flow
        setStep('signin-password');
        setFlipped(false);
      } else {
        // New email → auto-flip to sign-up
        setStep('signup-password');
        setFlipped(true);
      }
    } catch {
      setLoading(false);
      setStep('signin-password');
      setFlipped(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setSendingReset(false);
    if (error) {
      toast.error('Could not send reset link. Please try again.');
      return;
    }
    toast.success('Password reset link sent. Check your email.');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setShowForgotPasswordPrompt(true);
      toast.error('Sign-in failed. Check your password or use Forgot password.');
      return;
    }
    setShowForgotPasswordPrompt(false);
    toast.success('Signed in.');
    onAuthed?.();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/welcome`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      toast.error('Sign-up failed. Please try again.');
      return;
    }
    // Email confirmation required — show explicit success state.
    // Do NOT call onAuthed(); user must click email link first.
    setEmailSentTo(email);
    setStep('email-sent');
    setResendCountdown(30);
  };

  // Shared "dark speech bubble" styling — matches MascotBubble so the form
  // and mascot voice live inside the same panel.
  const bubblePanelStyle: React.CSSProperties = {
    background: 'rgba(15, 23, 42, 0.97)',
    border: '1.5px solid rgba(34, 211, 238, 0.45)',
    color: '#e2e8f0',
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    borderRadius: '0.75rem',
  };
  const inputOnDarkClass =
    'bg-slate-800/60 border-slate-600 text-slate-100 placeholder:text-slate-400 focus-visible:ring-cyan-500';
  const labelOnDarkClass = 'text-slate-200 text-xs';

  return (
    <div className="flex flex-col items-center">
      {step === 'email-sent' ? (
        /* ── Email-sent success panel ── */
        <div
          className="relative p-5 space-y-4 w-full"
          style={{
            maxWidth: 360,
            background: 'rgba(15, 23, 42, 0.97)',
            border: '1.5px solid rgba(34, 211, 238, 0.45)',
            color: '#e2e8f0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            borderRadius: '0.75rem',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Glasses className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="font-bold text-cyan-300 text-[13px]">Check your email</span>
          </div>
          <div className="text-slate-300 text-[12px] leading-snug space-y-2">
            <p>
              We sent a confirmation link to{' '}
              <span className="font-medium text-slate-100">{emailSentTo}</span>.
            </p>
            <p>Click the link to finish signing up — you can close this tab.</p>
          </div>
          <Button
            type="button"
            onClick={handleResendEmail}
            disabled={loading || resendCountdown > 0}
            variant="outline"
            className="w-full border-slate-500 text-slate-200 hover:bg-slate-700 text-[12px]"
          >
            {resendCountdown > 0
              ? `Resend email (${resendCountdown}s)`
              : loading
              ? 'Sending…'
              : 'Resend email'}
          </Button>
          <button
            type="button"
            className="text-[11px] text-slate-500 hover:text-slate-300 underline w-full text-center"
            onClick={() => {
              setStep('email');
              setFlipped(false);
              setPassword('');
              setConfirm('');
              setEmailSentTo('');
              setResendCountdown(0);
            }}
          >
            Use a different email
          </button>
          {/* Tail */}
          <div
            style={{
              position: 'absolute',
              bottom: -6,
              left: '50%',
              marginLeft: -6,
              width: 12,
              height: 12,
              transform: 'rotate(45deg)',
              background: 'rgba(15, 23, 42, 0.97)',
              borderRight: '1.5px solid rgba(34, 211, 238, 0.45)',
              borderBottom: '1.5px solid rgba(34, 211, 238, 0.45)',
            }}
          />
        </div>
      ) : (
        /* ── Existing 3D flip card (unchanged) ── */
        <div
        className="relative"
        style={{
          perspective: '1200px',
          width: '100%',
          maxWidth: 360,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT — Email → Password (sign in) */}
          <form
            onSubmit={handleSignIn}
            className="relative p-5 space-y-3"
            style={{
              ...bubblePanelStyle,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Glasses className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="font-bold text-cyan-300 text-[13px]">Welcome</span>
            </div>
            <div className="text-slate-300 text-[12px] leading-snug pb-2">
              {bubbleMessage}
            </div>
            {step === 'email' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="mascot-email" className={labelOnDarkClass}>Email</Label>
                  <Input
                    id="mascot-email"
                    type="email"
                    placeholder={emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEmailEnter(); } }}
                    className={inputOnDarkClass}
                    autoFocus
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleEmailEnter}
                  disabled={!email || loading}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  {loading ? 'Checking…' : 'Enter'}
                </Button>
              </>
            )}
            {step === 'signin-password' && (
              <>
                <div className="text-[11px] text-slate-400">
                  Signing in as <span className="font-medium text-slate-200">{email}</span>{' '}
                  <button
                    type="button"
                    className="ml-1 underline text-cyan-400 hover:text-cyan-300"
                    onClick={() => { setStep('email'); setPassword(''); }}
                  >
                    change
                  </button>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mascot-password" className={labelOnDarkClass}>Password</Label>
                  <Input
                    id="mascot-password"
                    type="password"
                    placeholder={signinPasswordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputOnDarkClass}
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
                <div className="text-[11px] text-slate-300">
                  Forgot your password?{' '}
                  <button
                    type="button"
                    className="underline text-cyan-400 hover:text-cyan-300"
                    onClick={handleForgotPassword}
                    disabled={sendingReset}
                  >
                    {sendingReset ? 'Sending reset link…' : 'Forgot password?'}
                  </button>
                </div>
                {showForgotPasswordPrompt ? (
                  <div className="rounded-md border border-cyan-700/50 bg-slate-900/60 p-2 text-[11px] text-slate-300">
                    Wrong password. Use the reset link above if needed.
                  </div>
                ) : null}
              </>
            )}
            {/* Tail — points bottom-right toward the mascot */}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                marginLeft: -6,
                width: 12,
                height: 12,
                transform: 'rotate(45deg)',
                background: 'rgba(15, 23, 42, 0.97)',
                borderRight: '1.5px solid rgba(34, 211, 238, 0.45)',
                borderBottom: '1.5px solid rgba(34, 211, 238, 0.45)',
              }}
            />
          </form>

          {/* BACK — Sign Up with password + confirm (same unified bubble styling) */}
          <form
            onSubmit={handleSignUp}
            className="relative p-5 space-y-3"
            style={{
              ...bubblePanelStyle,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Glasses className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="font-bold text-cyan-300 text-[13px]">Welcome aboard</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Signing up as <span className="font-medium text-slate-200">{email}</span>{' '}
              <button
                type="button"
                className="ml-1 underline text-cyan-400 hover:text-cyan-300"
                onClick={() => {
                  setStep('email');
                  setFlipped(false);
                  setPassword('');
                  setConfirm('');
                }}
              >
                change
              </button>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mascot-signup-password" className={labelOnDarkClass}>Password</Label>
              <Input
                id="mascot-signup-password"
                type="password"
                placeholder={signupPasswordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputOnDarkClass}
                autoFocus={step === 'signup-password'}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mascot-signup-confirm" className={labelOnDarkClass}>Confirm</Label>
              <Input
                id="mascot-signup-confirm"
                type="password"
                placeholder={signupConfirmPlaceholder}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputOnDarkClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="border-slate-500 text-slate-200 hover:bg-slate-700"
                onClick={() => {
                  setStep('email');
                  setFlipped(false);
                  setPassword('');
                  setConfirm('');
                }}
              >
                Try Again
              </Button>
              <Button
                type="submit"
                disabled={loading || !password || !confirm}
                className="bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                {loading ? 'Creating…' : 'Sign Up'}
              </Button>
            </div>
            {/* Tail */}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                marginLeft: -6,
                width: 12,
                height: 12,
                transform: 'rotate(45deg)',
                background: 'rgba(15, 23, 42, 0.97)',
                borderRight: '1.5px solid rgba(34, 211, 238, 0.45)',
                borderBottom: '1.5px solid rgba(34, 211, 238, 0.45)',
              }}
            />
          </form>
        </div>
      </div>
      )}
    </div>
  );
};

export default MascotAuthGate;
