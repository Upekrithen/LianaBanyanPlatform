import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { onboardNewMember } from '@/lib/onboardMember';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'sb-ruuxzilgmuwddcofqecc-auth-token';

function bootstrapSessionFromStorage(): { user: User; session: Session } | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.access_token || !parsed.user) return null;
    const expiresAt = parsed.expires_at ?? 0;
    if (expiresAt * 1000 < Date.now()) return null;
    return { user: parsed.user as User, session: parsed as Session };
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const bootstrapped = bootstrapSessionFromStorage();
  const [user, setUser] = useState<User | null>(bootstrapped?.user ?? null);
  const [session, setSession] = useState<Session | null>(bootstrapped?.session ?? null);
  const [loading, setLoading] = useState(!bootstrapped);
  const navigate = useNavigate();

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        clearTimeout(safetyTimer);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          if (!localStorage.getItem('lb_login_timestamp')) {
            localStorage.setItem('lb_login_timestamp', new Date().toISOString());
          }
          setTimeout(() => onboardNewMember(currentSession.user), 0);
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          localStorage.removeItem('lb_login_timestamp');
        }
      }
    );

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    localStorage.removeItem('lb_login_timestamp');
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setSession(null);
    try { await supabase.auth.signOut(); } catch {}
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
