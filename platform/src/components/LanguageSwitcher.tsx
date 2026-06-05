/**
 * LANGUAGE SWITCHER -- Wave 15 / Phase γ i18n Hardening
 * =======================================================
 * Expanded from 15 (Wave 10 D5) to 150 BCP 47 languages.
 * New in Wave 15:
 *   - All 150 languages from LANGUAGES data array (languages.ts)
 *   - Search/filter input for quick navigation
 *   - RTL badge indicator for RTL-script languages
 *   - Ratified badge for the 16 community-verified translations
 *   - Locale persistence to lb_language (localStorage)
 *
 * Bridges two systems:
 *   1. i18next (BCP 47 codes via i18n.changeLanguage) -- drives UI translations
 *   2. Durin's Door (language names via setLanguageFromDoor) -- drives password UX
 *
 * Appears as a floating button when page tools are enabled.
 * Quick-switch to English shown when any non-English locale is active.
 *
 * BOTTOM CLEARANCE: must clear LRH edge. See BP047 recurrence-class fix.
 */

import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Globe, Check, Search } from "lucide-react";
import { setLanguageFromDoor } from "@/lib/durinsDoor";
import i18n from "@/i18n";
import { LANGUAGES } from "@/data/languages";

/** Durin's Door doorName lookup for the 15 ratified Speak Friend languages. */
const DOOR_NAMES: Record<string, string> = {
  en: "english",    es: "spanish",   pt: "portuguese", fr: "french",
  de: "german",     zh: "mandarin",  ja: "japanese",   ko: "korean",
  ar: "arabic",     hi: "hindi",     ru: "russian",    it: "italian",
  nl: "dutch",      pl: "polish",    sv: "swedish",    he: "hebrew",
};

/**
 * Routes where the language picker is hidden.
 * /proofs is a Pinned Proof / evidence surface -- the widget is contextually
 * irrelevant there and conflicts visually with the LRH host icon (BP074-W3).
 */
const HIDDEN_ROUTES = ["/proofs"];

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const location = useLocation();
  const [currentCode, setCurrentCode] = useState<string>("en");
  const [showPageTools, setShowPageTools] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("lb_language");
    const detected = (stored || i18n.language || "en").split("-")[0];
    if (LANGUAGES.find((l) => l.code === detected)) {
      setCurrentCode(detected);
    }
  }, []);

  useEffect(() => {
    const check = () => {
      const stored = localStorage.getItem("lb_show_page_tools");
      setShowPageTools(stored === "true");
    };
    check();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "lb_show_page_tools") check();
    };
    const handleCustom = () => check();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("lb_page_tools_changed", handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("lb_page_tools_changed", handleCustom);
    };
  }, []);

  const handleSwitch = (code: string) => {
    i18n.changeLanguage(code);
    const doorName = DOOR_NAMES[code];
    if (doorName) setLanguageFromDoor(doorName);
    setCurrentCode(code);
    setSearchQuery("");
  };

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return LANGUAGES;
    const q = searchQuery.toLowerCase();
    return LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const current = LANGUAGES.find((l) => l.code === currentCode);
  const isNotEnglish = currentCode !== "en";

  if (!showPageTools) return null;

  // Option A (BP074-W3): hide on Pinned Proof / evidence surfaces.
  const isHiddenRoute = HIDDEN_ROUTES.some(
    (r) => location.pathname === r || location.pathname.startsWith(r + "/"),
  );
  if (isHiddenRoute) return null;

  return (
    // BOTTOM CLEARANCE: must clear LRH edge. See BP047 recurrence-class fix. Do NOT reduce bottom offset.
    <div className="fixed bottom-16 right-4 z-50 flex items-center gap-2">
      {isNotEnglish && (
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full shadow-lg gap-1.5 bg-background/90 backdrop-blur border"
          onClick={() => handleSwitch("en")}
        >
          🇺🇸 {t("languageSwitcher.quickEnglish")}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-lg w-10 h-10 bg-background/90 backdrop-blur"
            aria-label={t("languageSwitcher.changeLanguage")}
          >
            <Globe className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t("languageSwitcher.selectLanguage")}
            <span className="ml-auto text-xs text-muted-foreground font-normal">
              {current?.nativeName ?? currentCode}
              {current?.rtl && (
                <span className="ml-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-1 rounded">
                  RTL
                </span>
              )}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Search input */}
          <div className="px-2 py-1.5">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                className="w-full pl-6 pr-2 py-1 text-sm bg-muted rounded-md border-0 outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                placeholder={t("languageSwitcher.search", "Search 150 languages...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search languages"
              />
            </div>
          </div>
          <DropdownMenuSeparator />

          {/* Language list - scrollable */}
          <div className="max-h-72 overflow-y-auto">
            {filteredLanguages.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No languages match &quot;{searchQuery}&quot;
              </div>
            )}
            {filteredLanguages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleSwitch(lang.code)}
                className="flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-sm truncate">{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{lang.code}</span>
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  {lang.rtl && (
                    <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-1 rounded">
                      RTL
                    </span>
                  )}
                  {lang.ratified && (
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-1 rounded">
                      ✓
                    </span>
                  )}
                  {currentCode === lang.code && (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </span>
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            {filteredLanguages.length < LANGUAGES.length
              ? `${filteredLanguages.length} of ${LANGUAGES.length} languages`
              : t("languageSwitcher.tip", `${LANGUAGES.length} languages available`)}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
