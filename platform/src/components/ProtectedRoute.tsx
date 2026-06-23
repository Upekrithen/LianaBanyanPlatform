import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCaptain } from '@/hooks/useCaptain';
import { useGhostSession } from '@/hooks/useGhostSession';

/**
 * Context-aware auth gating. Pass `gateContext` so the mascot can say
 * "To [gateContext], you'll need to sign in so we know it's you."
 * Stored to sessionStorage under `lb_auth_gate_context` and read by
 * the Auth page to pass through to <MascotAuthGate />.
 */
export const AUTH_GATE_CONTEXT_KEY = 'lb_auth_gate_context';

export const ProtectedRoute = ({
  children,
  gateContext,
}: {
  children: React.ReactNode;
  gateContext?: string;
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    sessionStorage.setItem('lb_auth_return_path', location.pathname + location.search);
    if (gateContext) {
      sessionStorage.setItem(AUTH_GATE_CONTEXT_KEY, gateContext);
    } else {
      sessionStorage.removeItem(AUTH_GATE_CONTEXT_KEY);
    }
    return <Navigate to="/join" replace />;
  }

  return <>{children}</>;
};

/**
 * ExplorerRoute — Allows ghost users to VIEW pages but shows a join prompt for actions.
 * Integrates with useGhostSession for temp Marks tracking and page visit logging.
 */
export const ExplorerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { tempMarks, isFading, trackPageVisit } = useGhostSession();
  const location = useLocation();
  const trackedPath = useRef('');

  useEffect(() => {
    if (!user && !loading && location.pathname !== trackedPath.current) {
      trackedPath.current = location.pathname;
      trackPageVisit(location.pathname);
      localStorage.setItem('ghost_mode', 'true');
    }
  }, [user, loading, location.pathname, trackPageVisit]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  const marksDisplay = tempMarks > 0
    ? `👻 ${tempMarks} Marks earned — join to keep them`
    : '👻 Exploring freely — your progress saves when you join';

  const fadingWarning = isFading ? ' ⚠️ Your Marks are fading!' : '';

  return (
    <>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: isFading
            ? 'linear-gradient(90deg, #dc2626 0%, #f87171 100%)'
            : 'linear-gradient(90deg, #1e3a5f 0%, #2d5a87 100%)',
          color: 'white',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          zIndex: 1000,
          fontSize: '0.85rem',
          flexWrap: 'wrap',
        }}
      >
        <span>{marksDisplay}{fadingWarning}</span>
        <a
          href="/join"
          onClick={(e) => {
            e.preventDefault();
            sessionStorage.setItem('lb_auth_return_path', location.pathname + location.search);
            window.location.href = '/join';
          }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            color: 'white',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
          }}
        >
          Join for $5/year →
        </a>
      </div>
    </>
  );
};

export const CaptainRoute = ({
  children,
  gateContext,
}: {
  children: React.ReactNode;
  gateContext?: string;
}) => {
  const { user, loading } = useAuth();
  const { isCaptain, isLoading } = useCaptain();
  const location = useLocation();

  if (loading || (user && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    sessionStorage.setItem('lb_auth_return_path', location.pathname + location.search);
    if (gateContext) {
      sessionStorage.setItem(AUTH_GATE_CONTEXT_KEY, gateContext);
    } else {
      sessionStorage.removeItem(AUTH_GATE_CONTEXT_KEY);
    }
    return <Navigate to="/join" replace />;
  }

  if (!isCaptain) {
    return <Navigate to="/captain/become" replace />;
  }

  return <>{children}</>;
};
