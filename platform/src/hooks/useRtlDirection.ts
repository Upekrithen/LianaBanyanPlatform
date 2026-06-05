/**
 * useRtlDirection -- Wave 10 / Phase D3
 * ======================================
 * Sets document.documentElement.dir and lang based on active i18n locale.
 * RTL locales: Arabic (ar), Hebrew (he), Persian (fa), Urdu (ur).
 * Must be called high in the component tree (AppShell or App root).
 *
 * At 375px viewport, RTL reversal verified via Flexbox/Grid layout swap.
 * CSS `dir="rtl"` on <html> triggers browser's built-in text direction.
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// RTL languages from languages.json: Arabic script (ar, ur, fa, ps, sd, ug, ckb),
// Hebrew script (he, yi), Thaana script (dv).
const RTL_LOCALES = new Set(["ar", "he", "fa", "ur", "ps", "sd", "ug", "yi", "ckb", "dv"]);

export function useRtlDirection(): boolean {
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";
  // Strip region subtag for matching: "ar-SA" -> "ar"
  const baseCode = lang.split("-")[0];
  const isRtl = RTL_LOCALES.has(baseCode);

  useEffect(() => {
    const root = document.documentElement;
    root.dir = isRtl ? "rtl" : "ltr";
    root.lang = lang;
  }, [lang, isRtl]);

  return isRtl;
}
