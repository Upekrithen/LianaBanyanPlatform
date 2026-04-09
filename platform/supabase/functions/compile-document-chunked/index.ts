import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CompileDocumentChunkedPayload {
  slug: string;
  title: string;
  family_name: string;
  section?: string | null;
  category?: string | null;
  section_librarian?: number | null;
  chunk_index: number;
  chunk_total: number;
  chunk_content: string;
  source_count?: number;
  source_files?: unknown[];
  unique_variants?: number;
  compilation_notes?: string | null;
  compiled_by?: string | null;
  founder_corrections_applied?: string[] | null;
  supersedes?: string[] | null;
  superseded_by?: string | null;
}

type AppendChunkResult = {
  id: string;
  slug: string;
  content_size_bytes: number | null;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as CompileDocumentChunkedPayload;

    if (
      !payload.slug ||
      !payload.title ||
      !payload.family_name ||
      typeof payload.chunk_index !== "number" ||
      typeof payload.chunk_total !== "number" ||
      typeof payload.chunk_content !== "string"
    ) {
      return jsonResponse(
        {
          error:
            "slug, title, family_name, chunk_index, chunk_total, and chunk_content are required",
        },
        400,
      );
    }

    if (payload.chunk_index < 0 || payload.chunk_total < 1 || payload.chunk_index >= payload.chunk_total) {
      return jsonResponse({ error: "Invalid chunk_index/chunk_total combination" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const sourceFiles = Array.isArray(payload.source_files) ? payload.source_files : [];
    const chunkBytes = new TextEncoder().encode(payload.chunk_content).length;
    const isFinalChunk = payload.chunk_index === payload.chunk_total - 1;
    const progressNote = `Chunked compilation in progress (${payload.chunk_index + 1}/${payload.chunk_total})`;

    let contentSizeBytes = chunkBytes;

    if (payload.chunk_index === 0) {
      const { error } = await supabase
        .from("compiled_documents")
        .upsert(
          {
            slug: payload.slug,
            title: payload.title,
            family_name: payload.family_name,
            section: payload.section ?? null,
            category: payload.category ?? null,
            section_librarian: payload.section_librarian ?? null,
            compiled_markdown: payload.chunk_content,
            source_count: payload.source_count ?? sourceFiles.length,
            source_files: sourceFiles,
            unique_variants: payload.unique_variants ?? 0,
            compilation_notes: isFinalChunk
              ? payload.compilation_notes ?? null
              : payload.compilation_notes ?? progressNote,
            compiled_by: payload.compiled_by ?? "KNIGHT",
            founder_corrections_applied: payload.founder_corrections_applied ?? [],
            status: isFinalChunk ? "draft" : "draft",
            supersedes: payload.supersedes ?? [],
            superseded_by: payload.superseded_by ?? null,
            is_lode: true,
            content_size_bytes: chunkBytes,
            compiled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slug" },
        );
      if (error) throw error;
    } else {
      const { data, error } = await supabase.rpc("append_compiled_document_chunk", {
        p_slug: payload.slug,
        p_chunk_content: payload.chunk_content,
        p_chunk_bytes: chunkBytes,
        p_mark_lode: true,
      });
      if (error) throw error;

      const appended = (data as AppendChunkResult[] | null)?.[0];
      if (!appended) {
        return jsonResponse({ error: `Compiled document not found for slug ${payload.slug}` }, 404);
      }
      contentSizeBytes = appended.content_size_bytes ?? chunkBytes;

      if (!isFinalChunk) {
        const { error: updateError } = await supabase
          .from("compiled_documents")
          .update({
            compilation_notes: payload.compilation_notes ?? progressNote,
            updated_at: new Date().toISOString(),
          })
          .eq("slug", payload.slug);
        if (updateError) throw updateError;
      }
    }

    if (isFinalChunk) {
      const finalNote = payload.compilation_notes
        ? `${payload.compilation_notes} | Chunked complete: ${contentSizeBytes} bytes across ${payload.chunk_total} chunks`
        : `Chunked complete: ${contentSizeBytes} bytes across ${payload.chunk_total} chunks`;
      const { error: finalizeError } = await supabase
        .from("compiled_documents")
        .update({
          status: "draft",
          is_lode: true,
          content_size_bytes: contentSizeBytes,
          compilation_notes: finalNote,
          compiled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("slug", payload.slug);
      if (finalizeError) throw finalizeError;
    }

    return jsonResponse({
      success: true,
      slug: payload.slug,
      chunk_index: payload.chunk_index,
      chunk_total: payload.chunk_total,
      is_final: isFinalChunk,
      content_size_bytes: contentSizeBytes,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
});
