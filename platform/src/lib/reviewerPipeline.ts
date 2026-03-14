/**
 * Reviewer Pipeline — "The Harper's Eye"
 * Helpers to submit content to the review queue and run SEC auto-scan.
 * Use from Marketplace, ProposalDetail, recipe submission, business plan adoption, etc.
 */

import { supabase } from "@/integrations/supabase/client";

export type ReviewQueueContentType =
  | "portfolio_item"
  | "recipe"
  | "business_plan"
  | "proposal"
  | "marketplace_listing"
  | "cue_card"
  | "testimonial"
  | "other";

export interface SECFlag {
  term: string;
  category: string;
  suggestion: string;
  severity: "critical" | "warning" | "info";
  location?: string;
}

/**
 * Fetch active SEC dangerous terms and scan text for matches.
 * Returns flags for populating review_queue.sec_flags and sec_flag_count.
 */
export async function runSECScan(text: string): Promise<SECFlag[]> {
  if (!text || typeof text !== "string") return [];
  const { data: terms } = await supabase
    .from("sec_dangerous_terms")
    .select("term, category, suggestion, severity")
    .eq("is_active", true);
  if (!terms?.length) return [];
  const lower = text.toLowerCase();
  const flags: SECFlag[] = [];
  for (const t of terms) {
    const termLower = t.term.toLowerCase();
    let idx = 0;
    while (idx < lower.length) {
      const pos = lower.indexOf(termLower, idx);
      if (pos === -1) break;
      const wordStart = pos === 0 || !/\w/.test(text[pos - 1]);
      const wordEnd = pos + termLower.length >= text.length || !/\w/.test(text[pos + termLower.length]);
      if (wordStart && wordEnd) {
        flags.push({
          term: t.term,
          category: t.category,
          suggestion: t.suggestion,
          severity: t.severity as "critical" | "warning" | "info",
        });
      }
      idx = pos + 1;
    }
  }
  return flags;
}

/**
 * Submit content to the review queue. Runs SEC scan on text fields in content_snapshot.
 * Call after create/update in Marketplace, ProposalDetail, recipe submission, etc.
 */
export async function submitToReviewQueue(
  contentType: ReviewQueueContentType,
  contentId: string,
  contentTable: string,
  contentSnapshot: Record<string, unknown>,
  userId: string
): Promise<{ id?: string; error?: Error }> {
  const textParts: string[] = [];
  for (const v of Object.values(contentSnapshot)) {
    if (typeof v === "string") textParts.push(v);
    else if (v && typeof v === "object" && !Array.isArray(v)) {
      textParts.push(JSON.stringify(v));
    }
  }
  const text = textParts.join(" ");
  const secFlags = await runSECScan(text);

  const { data, error } = await supabase
    .from("review_queue")
    .insert({
      content_type: contentType,
      content_id: contentId,
      content_table: contentTable,
      content_snapshot: contentSnapshot,
      submitted_by: userId,
      sec_flags: secFlags.length ? secFlags : null,
      sec_flag_count: secFlags.length,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { error };
  return { id: data?.id };
}
