import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CompileDocumentPayload {
  slug: string;
  title: string;
  family_name: string;
  section?: string | null;
  category?: string | null;
  section_librarian?: number | null;
  compiled_markdown: string;
  source_count?: number;
  source_files?: unknown[];
  unique_variants?: number;
  compilation_notes?: string | null;
  compiled_by?: string | null;
  founder_corrections_applied?: string[] | null;
  status?: "draft" | "reviewed" | "canonical" | "superseded";
  supersedes?: string[] | null;
  superseded_by?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json() as CompileDocumentPayload;

    if (!payload.slug || !payload.title || !payload.family_name || !payload.compiled_markdown) {
      return new Response(
        JSON.stringify({
          error: "slug, title, family_name, and compiled_markdown are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const sourceFiles = Array.isArray(payload.source_files) ? payload.source_files : [];

    const { data, error } = await supabase
      .from("compiled_documents")
      .upsert(
        {
          slug: payload.slug,
          title: payload.title,
          family_name: payload.family_name,
          section: payload.section ?? null,
          category: payload.category ?? null,
          section_librarian: payload.section_librarian ?? null,
          compiled_markdown: payload.compiled_markdown,
          source_count: payload.source_count ?? sourceFiles.length,
          source_files: sourceFiles,
          unique_variants: payload.unique_variants ?? 0,
          compilation_notes: payload.compilation_notes ?? null,
          compiled_by: payload.compiled_by ?? "KNIGHT",
          founder_corrections_applied: payload.founder_corrections_applied ?? [],
          status: payload.status ?? "draft",
          supersedes: payload.supersedes ?? [],
          superseded_by: payload.superseded_by ?? null,
          compiled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" },
      )
      .select("id, slug, status")
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true, document: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
