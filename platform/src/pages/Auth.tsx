/**
 * Auth -- mascot-voiced auth gate.
 * ================================
 * Replaces the legacy "Sign in to access your dashboard" Card modal
 * with a context-aware, character-voiced <MascotAuthGate />.
 *
 * Reads gate-context from sessionStorage (set by ProtectedRoute when
 * redirecting) so the mascot can say exactly what the user was trying to do.
 *
 * Rebuilt B080.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { detectPortal } from '@/utils/portalDetector';
import { MascotAuthGate } from '@/components/v2/mascot';
import { useAuthGateContext } from '@/hooks/useAuthGateContext';

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const gateContext = useAuthGateContext();

  const getReturnPath = () => {
    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get('redirect');
    if (redirectParam && redirectParam !== '/auth') {
      return redirectParam;
    }
    const storedPath = sessionStorage.getItem('lb_auth_return_path');
    if (storedPath && storedPath !== '/auth') {
      sessionStorage.removeItem('lb_auth_return_path');
      return storedPath;
    }
    return null;
  };

  const portal = detectPortal();
  const defaultPostAuth = portal === 'upekrithen' ? '/' : '/dashboard';

  useEffect(() => {
    if (user) {
      const returnPath = getReturnPath();
      navigate(returnPath || defaultPostAuth, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, defaultPostAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <MascotAuthGate
          contextMessage={gateContext}
          onAuthed={() => {
            const returnPath = getReturnPath();
            navigate(returnPath || defaultPostAuth, { replace: true });
          }}
        />
      </div>
    </div>
  );
}
