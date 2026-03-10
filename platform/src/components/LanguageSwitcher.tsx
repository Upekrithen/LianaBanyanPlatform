/**
 * LANGUAGE SWITCHER — Easy way to switch back to English (or any language)
 * ========================================================================
 * Appears as a small floating button when language is not English.
 * One click → back to English. Or open the menu to pick any language.
 * Language is set by Durin's Door passwords but can always be overridden here.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { getLanguagePreference, setLanguageFromDoor } from "@/lib/durinsDoor";

const LANGUAGES = [
  { code: "english", label: "English", flag: "🇺🇸" },
  { code: "spanish", label: "Español", flag: "🇪🇸" },
  { code: "french", label: "Français", flag: "🇫🇷" },
  { code: "german", label: "Deutsch", flag: "🇩🇪" },
  { code: "japanese", label: "日本語", flag: "🇯🇵" },
  { code: "mandarin", label: "中文", flag: "🇨🇳" },
  { code: "korean", label: "한국어", flag: "🇰🇷" },
  { code: "arabic", label: "العربية", flag: "🇸🇦" },
  { code: "hindi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "swahili", label: "Kiswahili", flag: "🇰🇪" },
  { code: "elvish", label: "Elvish (Sindarin)", flag: "🧝" },
  { code: "norse", label: "Norse", flag: "⚔️" },
  { code: "tolkien", label: "Tolkien Lore", flag: "📖" },
  { code: "liana", label: "Liana Banyan", flag: "🌿" },
];

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState("english");
  const [showPageTools, setShowPageTools] = useState(true);

  useEffect(() => {
    setCurrentLang(getLanguagePreference());
    
    // Check page tools visibility setting (default to hidden)
    const checkPageTools = () => {
      const stored = localStorage.getItem('lb_show_page_tools');
      setShowPageTools(stored === 'true'); // Only show if explicitly set to 'true'
    };
    checkPageTools();
    
    // Listen for storage changes (when user toggles in Index.tsx)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'lb_show_page_tools') {
        setShowPageTools(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);
    
    // Also listen for custom event for same-tab updates
    const handleCustomEvent = () => checkPageTools();
    window.addEventListener('lb_page_tools_changed', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lb_page_tools_changed', handleCustomEvent);
    };
  }, []);

  const handleSwitch = (langCode: string) => {
    setLanguageFromDoor(langCode);
    setCurrentLang(langCode);
  };

  const currentFlag = LANGUAGES.find(l => l.code === currentLang)?.flag || "🌐";
  const isNotEnglish = currentLang !== "english";

  // Hide if page tools are toggled off
  if (!showPageTools) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {/* Quick English button — only shows when NOT in English */}
      {isNotEnglish && (
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full shadow-lg gap-1.5 bg-background/90 backdrop-blur border"
          onClick={() => handleSwitch("english")}
        >
          🇺🇸 English
        </Button>
      )}

      {/* Full language menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-lg w-10 h-10 bg-background/90 backdrop-blur"
            aria-label="Change language"
          >
            <span className="text-lg">{currentFlag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Language (set by Durin's Door)
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleSwitch(lang.code)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
              {currentLang === lang.code && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            Tip: Use different language passwords at Durin's Door to unlock unique experiences!
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
