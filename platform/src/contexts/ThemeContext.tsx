import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ThemeContextType {
  currentTheme: string;
  setTheme: (themeId: string) => void;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const availableThemes = [
    'default',
    'raw-materials',
    'christopher-ireland',
    'duna',
    'reducto',
    'brainfish',
    'dynamix',
    'zerorez',
    'phamily',
    'langarica',
    'grabandgo'
  ];

  useEffect(() => {
    // Get current user and load their preferences
    const loadUserPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        
        // Load theme from database
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferred_theme')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data && !error) {
          const theme = data.preferred_theme || 'default';
          setCurrentTheme(theme);
          applyThemeToDOM(theme);
        } else {
          // Fall back to localStorage
          const savedTheme = localStorage.getItem('selected-theme') || 'default';
          setCurrentTheme(savedTheme);
          applyThemeToDOM(savedTheme);
        }
      } else {
        // Anonymous user - use localStorage
        const savedTheme = localStorage.getItem('selected-theme') || 'default';
        setCurrentTheme(savedTheme);
        applyThemeToDOM(savedTheme);
      }
    };

    loadUserPreferences();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadUserPreferences();
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        const savedTheme = localStorage.getItem('selected-theme') || 'default';
        setCurrentTheme(savedTheme);
        applyThemeToDOM(savedTheme);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const applyThemeToDOM = (themeId: string) => {
    const root = document.documentElement;
    
    if (themeId === 'default') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', themeId);
    }
  };

  const setTheme = async (themeId: string) => {
    // Update localStorage immediately
    localStorage.setItem('selected-theme', themeId);
    setCurrentTheme(themeId);
    applyThemeToDOM(themeId);

    // Save to database if logged in
    if (userId) {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferred_theme: themeId
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving theme preference:', error);
        toast({
          title: 'Theme applied locally',
          description: 'Could not sync to your account. Changes saved to this device only.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Theme updated',
          description: 'Your theme preference has been saved to your account.'
        });
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
