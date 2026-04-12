import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ContentType = "pudding" | "paper" | "letter" | "article" | "innovation" | "all";
export type Depth = "stones" | "wading" | "deep";
export type RenderMode = "member" | "academic";

const PAGE_SIZE = 20;

const CONTENT_TYPE_FILTERS: Record<Exclude<ContentType, "all">, string> = {
  pudding: "category.eq.pudding,style.eq.pudding",
  paper: "category.eq.academic_paper,category.eq.paper,style.eq.clean_academic",
  letter: "category.eq.crown_letter,category.eq.outreach_letter,category.eq.open_letter",
  article: "category.eq.article,category.eq.cephas_article,style.eq.article,style.eq.editorial",
  innovation: "category.eq.innovation,category.eq.system_design",
};

function applyDepthFilter(query: any, depth?: Depth) {
  if (depth === "stones") {
    return query.or("style.eq.pudding,category.eq.pudding,category.eq.spoonful,category.eq.skipping_stone");
  }
  if (depth === "wading") {
    return query.or("category.eq.article,category.eq.cephas_article,style.eq.article,style.eq.editorial");
  }
  if (depth === "deep") {
    return query.or("category.eq.academic_paper,category.eq.paper,style.eq.clean_academic");
  }
  return query;
}

function applyContentTypeFilter(query: any, contentType?: ContentType) {
  if (!contentType || contentType === "all") return query;
  const filter = CONTENT_TYPE_FILTERS[contentType];
  if (filter) return query.or(filter);
  return query;
}

export interface CephasMuseumFilters {
  depth?: Depth;
  contentType?: ContentType;
  domain?: string;
  search?: string;
  page?: number;
  renderMode?: RenderMode;
}

export interface CephasArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  style: string;
  subcategory: string | null;
  abstract: string | null;
  technical_summary: string | null;
  publication_type: string | null;
  paper_number: string | null;
  updated_at: string | null;
  related_slugs: string[] | null;
  source_path: string;
}

const SELECT_COLS =
  "id, title, slug, category, style, subcategory, abstract, technical_summary, publication_type, paper_number, updated_at, related_slugs, source_path";

export function useCephasMuseum(filters: CephasMuseumFilters = {}) {
  const { depth, contentType, domain, search, page = 0 } = filters;
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  return useQuery({
    queryKey: ["cephas-museum", depth, contentType, domain, search, page],
    queryFn: async () => {
      let query = supabase
        .from("cephas_content_registry" as any)
        .select(SELECT_COLS, { count: "exact" })
        .order("updated_at", { ascending: false })
        .range(from, to);

      query = applyDepthFilter(query, depth);
      query = applyContentTypeFilter(query, contentType);

      if (domain && domain !== "all") {
        query = query.eq("subcategory", domain);
      }

      if (search && search.trim().length > 0) {
        const term = `%${search.trim()}%`;
        query = query.or(`title.ilike.${term},technical_summary.ilike.${term},abstract.ilike.${term}`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return {
        articles: (data ?? []) as CephasArticle[],
        totalCount: count ?? 0,
        pageSize: PAGE_SIZE,
        page,
        totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
      };
    },
    retry: false,
    placeholderData: (prev: any) => prev,
  });
}

export function useCephasDepthCount(depth: Depth) {
  return useQuery({
    queryKey: ["cephas-museum-count", depth],
    queryFn: async () => {
      let query = supabase
        .from("cephas_content_registry" as any)
        .select("id", { count: "exact", head: true });

      query = applyDepthFilter(query, depth);

      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCephasDomains() {
  return useQuery({
    queryKey: ["cephas-domains"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cephas_content_registry" as any)
        .select("subcategory")
        .not("subcategory", "is", null);
      if (error) throw error;
      const unique = [...new Set((data ?? []).map((r: any) => r.subcategory as string).filter(Boolean))].sort();
      return unique;
    },
    staleTime: 10 * 60 * 1000,
  });
}
