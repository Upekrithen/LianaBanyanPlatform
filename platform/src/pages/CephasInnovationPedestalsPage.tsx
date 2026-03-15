/**
 * Cephas Innovation Pedestals — browsable list of all expanded innovations
 * with three-level reading (At a Glance / More Info / Full Detail).
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { InnovationPedestal } from "@/components/cephas/InnovationPedestal";
import { Loader2, Search } from "lucide-react";

export default function CephasInnovationPedestalsPage() {
  const [search, setSearch] = useState("");

  const { data: innovations, isLoading, isError } = useQuery({
    queryKey: ["cephas-innovation-pedestals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("*")
        .eq("category", "innovation")
        .order("title", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (innovations ?? []).filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (row.title ?? "").toLowerCase().includes(q) ||
      (row.content_markdown ?? "").toLowerCase().includes(q) ||
      (row.subcategory ?? "").toLowerCase().includes(q)
    );
  });

  function parseInnovationNumber(title: string): number {
    const m = title.match(/#(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  function parseRelatedIds(content: string): string[] {
    const m = content.match(/Related:\s*([^.]+)/);
    if (!m) return [];
    return m[1].match(/#\d+/g) ?? [];
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Innovation Pedestals</h1>
        <p className="text-muted-foreground mt-1">
          Every innovation in the portfolio with full patent-quality specifications.
          Three reading levels: At a Glance, More Info, and Full Detail.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search innovations by title, keyword, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading pedestals...
        </div>
      )}

      {isError && (
        <p className="text-red-500">Failed to load innovations. The content registry may need the ingestion script run first.</p>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="text-muted-foreground py-4">
          {search ? "No innovations match your search." : "No innovation pedestals found. Run the ingestion script to populate."}
        </p>
      )}

      <div className="space-y-4">
        {filtered.map((row) => (
          <InnovationPedestal
            key={row.slug}
            innovationNumber={parseInnovationNumber(row.title)}
            title={row.title.replace(/^#\d+:\s*/, "")}
            fullSpec={row.content_markdown ?? ""}
            category={row.subcategory ?? undefined}
            patentBag={row.related_patents?.[0] ?? undefined}
            relatedIds={parseRelatedIds(row.content_markdown ?? "")}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-4">
        {filtered.length} of {innovations?.length ?? 0} innovations displayed
      </p>
    </div>
  );
}
