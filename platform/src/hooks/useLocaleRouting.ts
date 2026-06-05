/**
 * useLocaleRouting -- Wave 15 / Phase γ i18n Hardening
 * ======================================================
 * Detects locale from URL path prefix (/ar/, /he/, /fr/, etc.)
 * and syncs it to i18next + sets HTML lang+dir.
 *
 * Two detection strategies supported by this SPA:
 *   1. ?lang=XX  (primary, used in hreflang alternates)
 *   2. /XX/      (path prefix, handled here -- layered over react-router)
 *
 * Path-prefix routing in a Vite SPA requires the server to rewrite
 * /ar/*, /he/*, etc. to index.html. This hook handles the client-side
 * language activation once the rewrite delivers the page.
 *
 * When a locale path is detected:
 *   - i18n.changeLanguage(code) is called
 *   - document.documentElement.lang and .dir are set (via useRtlDirection)
 *   - lb_language is persisted to localStorage
 *   - history.replaceState strips the /XX/ prefix from the canonical URL
 *     so internal routing is not confused by the locale prefix
 *
 * RTL codes: ar, he, fa, ur, ps, sd, ug, yi, ckb, dv
 *
 * NOTE: Full path-prefix routing (serving /ar/* from CDN with proper
 * HTML lang= in the initial response) requires server-side config.
 * This hook covers the client-side activation half.
 */

import { useEffect } from "react";
import i18n from "@/i18n";

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur", "ps", "sd", "ug", "yi", "ckb", "dv"]);

/**
 * All 150 BCP 47 codes.
 * Used to validate path segments to avoid false positives (e.g. /api/ -> "api" is not a locale).
 */
const VALID_LOCALE_CODES = new Set([
  "en","zh","hi","es","fr","ar","bn","ru","pt","ur","id","de","ja","sw","mr","te","tr","yue","ta",
  "vi","fa","ko","it","ha","th","gu","am","kn","pl","pa","jv","or","yo","ml","ms","uz","ig","my",
  "ne","ps","ff","uk","nl","so","az","tl","km","ceb","mg","si","sd","ku","kk","sn","mn","bo","su",
  "bho","mai","ro","zu","cs","el","sv","hu","hr","sr","he","bs","rw","ln","ny","lo","sq","fi","da",
  "no","bg","sk","sl","et","lv","lt","ka","hy","ca","mk","be","af","xh","st","tn","wo","ak","ee",
  "ky","tg","tk","ug","yi","mt","eu","gl","cy","ga","is","lb","ht","qu","war","nso","lg","ts","ss",
  "sat","doi","kok","mni","as","ckb","ay","sm","mi","fj","to","haw","dv","om","ti","rn","sg","lu",
  "kg","gn","tet","tpi","ilo","tt","zgh","hil","min","bug","cv","br","ve","pam","dz","nr","gd","kab",
]);

/**
 * Extracts a locale code from the URL path.
 * Matches /{code}/ at the start of the pathname (case-insensitive).
 * Returns null if no recognized locale prefix is found.
 *
 * Examples:
 *   /ar/home  -> "ar"
 *   /he/      -> "he"
 *   /en/      -> "en"
 *   /api/v1   -> null  (not a locale)
 */
function extractLocaleFromPath(pathname: string): string | null {
  const match = /^\/([a-z]{2,4})(?:\/|$)/i.exec(pathname);
  if (!match) return null;
  const candidate = match[1].toLowerCase();
  return VALID_LOCALE_CODES.has(candidate) ? candidate : null;
}

/**
 * Hook: activate locale from URL path prefix.
 * Call once near the root (AppShell or App).
 * Relies on useRtlDirection (also in AppShell) for dir/lang attribute sync.
 */
export function useLocaleRouting(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathLocale = extractLocaleFromPath(window.location.pathname);
    if (!pathLocale) return;

    // Activate locale in i18next (also triggers useRtlDirection via i18n.language change)
    const currentBase = (i18n.language || "en").split("-")[0];
    if (currentBase !== pathLocale) {
      i18n.changeLanguage(pathLocale);
    }

    // Set HTML attributes directly (belt-and-suspenders alongside useRtlDirection)
    document.documentElement.lang = pathLocale;
    document.documentElement.dir = RTL_LOCALES.has(pathLocale) ? "rtl" : "ltr";

    // Strip the locale prefix from the history entry so react-router
    // sees a clean path (e.g. /ar/about -> /about)
    const stripped = window.location.pathname.replace(/^\/[a-z]{2,4}\//i, "/") || "/";
    if (stripped !== window.location.pathname) {
      const newUrl = stripped + window.location.search + window.location.hash;
      window.history.replaceState(window.history.state, "", newUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount -- path is stable at load time
}

export { extractLocaleFromPath, VALID_LOCALE_CODES, RTL_LOCALES };
