/**
 * MembershipGateModal — Inline modal shown when a Ghost attempts a membership-required action.
 *
 * Design principles per K166:
 * - Shows what they GAIN, not what they're blocked from
 * - Displays Ghost Marks count with conversion promise
 * - $5/year membership prominently displayed
 * - "Not ready? Keep browsing." always visible
 * - NO guilt, NO countdown timers, NO dark patterns
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Ghost, Sparkles, Key } from 'lucide-react';

interface MembershipGateModalProps {
  open: boolean;
  onClose: () => void;
  action?: string;
  ghostMarks?: number;
}

const BENEFITS = [
  'Keep your temporary Marks permanently',
  'Accept Crew Calls and earn Credits',
  'Start your own projects for $5',
  'Join 16 charitable initiatives',
  'Your own storefront (first one free)',
  'Full calendar with 6 plug types',
  'Housing & vehicle listings',
  'Political Expedition tools',
  '5 starter Credits upon joining',
];

const ACTION_LABELS: Record<string, string> = {
  'accept-crew-call': 'accept this Crew Call',
  'claim-bounty': 'claim this bounty',
  'create-beacon': 'create a beacon',
  'start-project': 'start a project',
  'list-vehicle': 'list a vehicle',
  'rent-vehicle': 'rent a vehicle',
  'apply-housing': 'apply for housing',
  'list-housing': 'list housing',
  'purchase': 'make a purchase',
  'submit-design': 'submit a design',
  'vote': 'cast a vote',
  'take-advocacy-action': 'take this advocacy action',
  'send-message': 'send a message',
  'collect-card': 'collect this card',
};

export function MembershipGateModal({ open, onClose, action, ghostMarks = 0 }: MembershipGateModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const actionLabel = action ? ACTION_LABELS[action] || action.replace(/-/g, ' ') : 'do that';

  const handleJoin = () => {
    sessionStorage.setItem('lb_auth_return_path', location.pathname + location.search);
    if (action) {
      sessionStorage.setItem('lb_ghost_pending_action', action);
    }
    onClose();
    navigate('/join');
  };

  const benefits = ghostMarks > 0
    ? [`Keep your ${ghostMarks} Marks permanently`, ...BENEFITS.slice(1)]
    : BENEFITS.slice(1);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-xl">Your Access Key</DialogTitle>
            </div>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            To {actionLabel}, you'll need a membership — and it's only <strong className="text-foreground">$5/year</strong>.
          </p>

          {ghostMarks > 0 && (
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Ghost className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-sm text-amber-200">
                You've earned <strong className="text-amber-400">{ghostMarks}</strong> temporary Marks.
                Join to keep them permanently.
              </span>
            </div>
          )}
        </div>

        {/* Benefits list */}
        <div className="px-6 py-4 space-y-2.5">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <Button size="lg" className="w-full text-base py-5 gap-2" onClick={handleJoin}>
            <Sparkles className="w-4 h-4" />
            Join for $5/year
          </Button>

          <button
            onClick={onClose}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Not ready? Keep browsing.
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * useGateAction — Helper hook for gating actions behind membership.
 * Returns a function that either runs the action (if member) or opens the gate modal.
 */
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGhostSession } from '@/hooks/useGhostSession';

export function useGateAction() {
  const { user } = useAuth();
  const { tempMarks, trackActionAttempted } = useGhostSession();
  const [gateOpen, setGateOpen] = useState(false);
  const [gateAction, setGateAction] = useState<string | undefined>();

  const gate = useCallback((actionName: string, memberAction: () => void) => {
    if (user) {
      memberAction();
    } else {
      trackActionAttempted(actionName);
      setGateAction(actionName);
      setGateOpen(true);
    }
  }, [user, trackActionAttempted]);

  const gateProps = {
    open: gateOpen,
    onClose: () => setGateOpen(false),
    action: gateAction,
    ghostMarks: tempMarks,
  };

  return { gate, gateProps, GateModal: MembershipGateModal };
}
