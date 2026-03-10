import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Check if user is in ghost mode (localStorage flag)
function isGhostMode(): boolean {
  return localStorage.getItem('ghost_mode') === 'true';
}

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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
    // Save where they were trying to go so Auth can bring them back
    sessionStorage.setItem('lb_auth_return_path', location.pathname + location.search);
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

/**
 * ExplorerRoute — Allows ghost users to VIEW pages but shows a join prompt for actions
 * Use this for pages that should be explorable without authentication
 */
export const ExplorerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  // Allow authenticated users through
  if (user) {
    return <>{children}</>;
  }

  // Ghost banner — used for both existing and new ghost users
  const ghostBanner = (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)',
        color: 'white',
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        zIndex: 1000,
        fontSize: '0.85rem'
      }}
    >
      <span>👻 Exploring freely — your progress saves when you join</span>
      <a
        href="/auth"
        onClick={(e) => {
          e.preventDefault();
          // Save return path so Auth sends them back here after signup
          sessionStorage.setItem('lb_auth_return_path', location.pathname + location.search);
          window.location.href = '/auth';
        }}
        style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '0.35rem 0.75rem',
          borderRadius: '6px',
          color: 'white',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.8rem'
        }}
      >
        Join for $5/year →
      </a>
    </div>
  );

  // Allow ghost mode users through
  if (isGhostMode()) {
    return (
      <>
        {children}
        {ghostBanner}
      </>
    );
  }

  // Not logged in and not ghost mode — enable ghost mode so they can explore
  localStorage.setItem('ghost_mode', 'true');
  localStorage.setItem('ghost_entry_path', location.pathname);
  return (
    <>
      {children}
      {ghostBanner}
    </>
  );
};
