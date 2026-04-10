import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function depthFilter(query: any, depth?: string) {
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

export function useCephasMuseum(depth?: string, search?: string) {
  return useQuery({
    queryKey: ["cephas-museum", depth, search],
    queryFn: async () => {
      let query = supabase
        .from("cephas_content_registry")
        .select("id, title, slug, category, style, subcategory, abstract, technical_summary, publication_type, paper_number, updated_at")
        .order("updated_at", { ascending: false });

      query = depthFilter(query, depth);

      if (search && search.trim().length > 0) {
        const term = `%${search.trim()}%`;
        query = query.or(`title.ilike.${term},technical_summary.ilike.${term},abstract.ilike.${term}`);
      }

      query = query.limit(30);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    retry: false,
  });
}

export function useCephasDepthCount(depth: string) {
  return useQuery({
    queryKey: ["cephas-museum-count", depth],
    queryFn: async () => {
      let query = supabase
        .from("cephas_content_registry")
        .select("id", { count: "exact", head: true });

      query = depthFilter(query, depth);

      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 5 * 60 * 1000,
  });
}
