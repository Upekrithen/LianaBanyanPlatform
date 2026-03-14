/**
 * SEC LANGUAGE HIGHLIGHTER — Scans text against sec_dangerous_terms and highlights matches.
 * data-xray-id: sec-language-highlighter
 */

import { useEffect, useState, useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

export interface SECFlag {
  term: string;
  category: string;
  suggestion: string;
  severity: "critical" | "warning" | "info";
  position: { start: number; end: number };
}

export interface SECLanguageHighlighterProps {
  text: string;
  onFlagsFound?: (flags: SECFlag[]) => void;
  className?: string;
}

interface SecTerm {
  term: string;
  category: string;
  suggestion: string;
  severity: "critical" | "warning" | "info";
}

const severityClass = {
  critical: "bg-red-200 dark:bg-red-900/50",
  warning: "bg-yellow-200 dark:bg-yellow-900/50",
  info: "underline decoration-blue-500",
};

export function SECLanguageHighlighter({
  text,
  onFlagsFound,
  className,
}: SECLanguageHighlighterProps) {
  const [terms, setTerms] = useState<SecTerm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("sec_dangerous_terms")
        .select("term, category, suggestion, severity")
        .eq("is_active", true);
      if (!cancelled && data) setTerms(data as SecTerm[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const { segments, flags } = useMemo(() => {
    if (!text || terms.length === 0) {
      return { segments: [{ text, flag: null }], flags: [] as SECFlag[] };
    }
    const flags: SECFlag[] = [];
    const lower = text.toLowerCase();
    type Match = { start: number; end: number; term: string; suggestion: string; category: string; severity: "critical" | "warning" | "info" };
    const matches: Match[] = [];
    for (const t of terms) {
      const termLower = t.term.toLowerCase();
      let idx = 0;
      while (idx < lower.length) {
        const pos = lower.indexOf(termLower, idx);
        if (pos === -1) break;
        const wordStart = pos === 0 || !/\w/.test(text[pos - 1]);
        const wordEnd = pos + termLower.length >= text.length || !/\w/.test(text[pos + termLower.length]);
        if (wordStart && wordEnd) {
          matches.push({
            start: pos,
            end: pos + termLower.length,
            term: t.term,
            suggestion: t.suggestion,
            category: t.category,
            severity: t.severity as "critical" | "warning" | "info",
          });
          flags.push({
            term: t.term,
            category: t.category,
            suggestion: t.suggestion,
            severity: t.severity as "critical" | "warning" | "info",
            position: { start: pos, end: pos + termLower.length },
          });
        }
        idx = pos + 1;
      }
    }
    matches.sort((a, b) => a.start - b.start);
    const merged: Match[] = [];
    for (const m of matches) {
      const last = merged[merged.length - 1];
      if (last && m.start <= last.end) {
        last.end = Math.max(last.end, m.end);
      } else {
        merged.push({ ...m });
      }
    }
    const segments: { text: string; flag: Match | null }[] = [];
    let i = 0;
    for (const r of merged) {
      if (r.start > i) {
        segments.push({ text: text.slice(i, r.start), flag: null });
      }
      segments.push({ text: text.slice(r.start, r.end), flag: r });
      i = r.end;
    }
    if (i < text.length) {
      segments.push({ text: text.slice(i), flag: null });
    }
    onFlagsFound?.(flags);
    return { segments, flags };
  }, [text, terms, onFlagsFound]);

  if (loading) {
    return <span className={className}>{text}</span>;
  }

  return (
    <TooltipProvider>
      <span className={className} data-xray-id="sec-language-highlighter">
        {segments.map((seg, idx) =>
          seg.flag ? (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <mark
                  className={severityClass[seg.flag.severity]}
                  data-severity={seg.flag.severity}
                >
                  {seg.text}
                </mark>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{seg.flag.term}</p>
                <p className="text-sm">Use: {seg.flag.suggestion}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span key={idx}>{seg.text}</span>
          )
        )}
      </span>
    </TooltipProvider>
  );
}
