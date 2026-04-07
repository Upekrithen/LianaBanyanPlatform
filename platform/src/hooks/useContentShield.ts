import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ContentShieldViolation {
  field_name: string;
  category: string;
  severity: "block" | "flag";
  pattern_id: string;
  description: string;
}

export interface ContentShieldFields {
  description?: string;
  welcome_message?: string;
  custom_css?: string;
  theme_config?: Record<string, unknown>;
  hero_image_url?: string;
}

const BLOCKED_CSS_SELECTORS = ["body", "html", "#root", '[class*="lb-"]', ".lb-platform-rules-badge"];
const MAX_Z_INDEX = 1000;

function sanitizeCss(raw: string): { scoped: string; violations: string[] } {
  const violations: string[] = [];
  let scoped = raw;

  for (const sel of BLOCKED_CSS_SELECTORS) {
    const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[},;\\s])${escaped}\\s*\\{`, "gim");
    if (re.test(scoped)) {
      violations.push(`Selector "${sel}" escapes neighborhood scope`);
    }
  }

  const fixedRe = /position\s*:\s*fixed/gi;
  if (fixedRe.test(scoped)) {
    violations.push("position: fixed is not allowed (escapes container)");
  }

  const zRe = /z-index\s*:\s*(\d+)/gi;
  let m: RegExpExecArray | null;
  while ((m = zRe.exec(scoped)) !== null) {
    if (parseInt(m[1], 10) > MAX_Z_INDEX) {
      violations.push(`z-index ${m[1]} exceeds maximum (${MAX_Z_INDEX})`);
    }
  }

  const importRe = /@import\s+url\s*\(/gi;
  if (importRe.test(scoped)) {
    violations.push("@import url() is not allowed");
  }

  const externalUrlRe = /url\s*\(\s*['"]?\s*https?:\/\//gi;
  if (externalUrlRe.test(scoped)) {
    violations.push("External URLs in CSS are not allowed");
  }

  if (violations.length === 0) {
    scoped = `.neighborhood-custom-scope { ${scoped} }`;
  }

  return { scoped, violations };
}

export function scopeCustomCss(raw: string): string {
  const { scoped, violations } = sanitizeCss(raw);
  return violations.length > 0 ? "" : scoped;
}

export function useContentShield() {
  const [violations, setViolations] = useState<ContentShieldViolation[]>([]);
  const [validating, setValidating] = useState(false);

  const validate = useCallback(async (fields: ContentShieldFields): Promise<ContentShieldViolation[]> => {
    setValidating(true);
    try {
      if (fields.custom_css) {
        const { violations: cssViolations } = sanitizeCss(fields.custom_css);
        if (cssViolations.length > 0) {
          const localViolations: ContentShieldViolation[] = cssViolations.map((v) => ({
            field_name: "custom_css",
            category: "css_escape",
            severity: "block" as const,
            pattern_id: "local",
            description: v,
          }));
          setViolations(localViolations);
          return localViolations;
        }
      }

      const { data, error } = await supabase.rpc("validate_neighborhood_content" as never, {
        p_description: fields.description || null,
        p_welcome_message: fields.welcome_message || null,
        p_custom_css: fields.custom_css || null,
        p_theme_config: fields.theme_config || null,
        p_hero_image_url: fields.hero_image_url || null,
      } as never);

      if (error) {
        console.error("Content shield validation error:", error);
        return [];
      }

      const results = (data ?? []) as unknown as ContentShieldViolation[];
      setViolations(results);
      return results;
    } finally {
      setValidating(false);
    }
  }, []);

  const clearViolations = useCallback(() => setViolations([]), []);

  const hasBlocks = violations.some((v) => v.severity === "block");
  const hasFlags = violations.some((v) => v.severity === "flag");

  return { validate, violations, validating, hasBlocks, hasFlags, clearViolations };
}
