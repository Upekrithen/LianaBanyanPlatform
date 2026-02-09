import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user and load their language preference
    const loadUserPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        
        // Load language from database
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferred_language')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data && !error && data.preferred_language) {
          i18n.changeLanguage(data.preferred_language);
        } else {
          // Fall back to localStorage
          const savedLang = localStorage.getItem('preferred-language') || i18n.language;
          i18n.changeLanguage(savedLang);
        }
      } else {
        // Anonymous user - use localStorage or default
        const savedLang = localStorage.getItem('preferred-language') || i18n.language;
        i18n.changeLanguage(savedLang);
      }
    };

    loadUserPreferences();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadUserPreferences();
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        const savedLang = localStorage.getItem('preferred-language') || 'en';
        i18n.changeLanguage(savedLang);
      }
    });

    return () => subscription.unsubscribe();
  }, [i18n]);

  const changeLanguage = async (lng: string) => {
    // Update immediately
    i18n.changeLanguage(lng);
    localStorage.setItem('preferred-language', lng);
    
    // Save to database if logged in
    if (userId) {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferred_language: lng
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving language preference:', error);
        toast({
          title: 'Language applied locally',
          description: 'Could not sync to your account. Changes saved to this device only.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Language updated',
          description: 'Your language preference has been saved to your account.'
        });
      }
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[160px]">
          <SelectValue>
            {languages.find(l => l.code === i18n.language)?.flag} {' '}
            {languages.find(l => l.code === i18n.language)?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
