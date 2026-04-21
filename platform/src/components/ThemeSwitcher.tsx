import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Palette } from 'lucide-react';
import { toast } from 'sonner';

interface Theme {
  id: string;
  theme_name: string;
  css_content: string;
  is_default: boolean;
  preview_image_url?: string;
}

interface ThemeSwitcherProps {
  projectId: string;
  portalType?: 'marketplace' | 'business' | 'nonprofit' | 'network';
}

export function ThemeSwitcher({ projectId, portalType = 'marketplace' }: ThemeSwitcherProps) {
  const { user } = useAuth();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThemes();
  }, [projectId, portalType, user]);

  const loadThemes = async () => {
    // Load themes for this portal
    const { data, error } = await supabase
      .from('project_themes')
      .select('*')
      .eq('project_id', projectId)
      .eq('portal_type', portalType)
      .order('is_default', { ascending: false });

    if (!error && data) {
      setThemes(data);

      // Check for user preference first
      if (user) {
        const { data: prefData } = await supabase
          .from('user_theme_preferences')
          .select('theme_id')
          .eq('user_id', user.id)
          .eq('project_id', projectId)
          .eq('portal_type', portalType)
          .single();

        if (prefData?.theme_id) {
          const preferredTheme = data.find(t => t.id === prefData.theme_id);
          if (preferredTheme) {
            setSelectedTheme(preferredTheme.id);
            applyTheme(preferredTheme.css_content);
            setLoading(false);
            return;
          }
        }
      }

      // Fall back to default theme
      const defaultTheme = data.find(t => t.is_default);
      if (defaultTheme) {
        setSelectedTheme(defaultTheme.id);
        applyTheme(defaultTheme.css_content);
      }
    }
    setLoading(false);
  };

  const applyTheme = (cssContent: string) => {
    let styleElement = document.getElementById('project-theme-style') as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'project-theme-style';
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = cssContent;
  };

  const handleThemeChange = async (themeId: string) => {
    setSelectedTheme(themeId);
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      applyTheme(theme.css_content);

      // Save user preference to database
      if (user) {
        const { error } = await supabase
          .from('user_theme_preferences')
          .upsert({
            user_id: user.id,
            project_id: projectId,
            portal_type: portalType,
            theme_id: themeId,
          }, {
            onConflict: 'user_id,project_id,portal_type'
          });

        if (error) {
          console.error('Error saving theme preference:', error);
          toast.error('Failed to save theme preference');
        } else {
          toast.success('Theme applied');
        }
      }
    }
  };

  if (loading) return null;

  if (themes.length === 0) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Palette className="h-4 w-4" />
        No themes available
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Palette className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedTheme} onValueChange={handleThemeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-50">
          {themes.map((theme) => (
            <SelectItem key={theme.id} value={theme.id}>
              {theme.theme_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
