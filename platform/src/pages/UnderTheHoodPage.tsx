/**
 * Under the Hood — Technical transparency index (Session 19)
 * Lists Cephas documents with technical summary. Links to cephas.lianabanyan.com or registry detail.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wrench, ExternalLink } from "lucide-react";
import { useState } from "react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

const CEPHAS_BASE = "https://cephas.lianabanyan.com";

export default function UnderTheHoodPage() {
  const [search, setSearch] = useState("");

  const { data: items, isLoading, isError } = useQuery({
    queryKey: ["cephas-under-the-hood"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("id, slug, title, category, technical_summary, implementation_status, source_path")
        .order("title");
      if (error) throw error;
      return data || [];
    },
    retry: false,
  });

  const filtered = (items || []).filter(
    (i) =>
      !search ||
      (i.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.technical_summary || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalPageLayout maxWidth="lg" xrayId="under-the-hood-page">
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wrench className="w-8 h-8 text-primary" />
          Under the Hood
        </h1>
        <p className="text-muted-foreground mt-1">
          Technical transparency — how things work. Every Cephas document has an entry here.
        </p>
      </div>

      <Input
        placeholder="Search by title or technical summary..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md pl-10"
      />

      {isLoading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : isError ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Registry not available. Run migration 000020 and the Cephas ingestion script to populate.</p>
            <a
              href={`${CEPHAS_BASE}/under-the-hood/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 mt-4"
            >
              Open Cephas Under the Hood
              <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No registry entries yet. Run the Cephas ingestion script to populate from source documents.</p>
            <a
              href={`${CEPHAS_BASE}/under-the-hood/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 mt-4"
            >
              Open Cephas Under the Hood
              <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((row) => (
            <Card key={row.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">
                    <a
                      href={`${CEPHAS_BASE}/under-the-hood/${row.slug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      {row.title}
                      <ExternalLink className="w-4 h-4 shrink-0" />
                    </a>
                  </CardTitle>
                  <Badge variant="secondary">{row.implementation_status || "planned"}</Badge>
                </div>
                {row.category && (
                  <CardDescription>{row.category.replace(/_/g, " ")}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{row.technical_summary || "—"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </PortalPageLayout>
  );
}
