/**
 * Fly on the Wall — Public observation log (Session 19)
 * Creation context, revision history, Bishop/Knight session, decision log per document.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, ExternalLink, History, Radio } from "lucide-react";
import { useState } from "react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

const CEPHAS_BASE = "/cephas";

export default function FlyOnTheWallPage() {
  const [search, setSearch] = useState("");

  const { data: sessionUpdates = [] } = useQuery({
    queryKey: ["cephas-fotw-session-updates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("id, slug, title, content_markdown, creation_context, bishop_session, knight_session, created_at")
        .eq("category", "fly_on_the_wall")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data || [];
    },
    retry: false,
  });

  const { data: items, isLoading, isError } = useQuery({
    queryKey: ["cephas-fly-on-the-wall"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("id, slug, title, category, creation_context, revision_history, bishop_session, knight_session, decision_log, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    retry: false,
  });

  const filtered = (items || []).filter(
    (i) =>
      !search ||
      (i.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.creation_context || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalPageLayout maxWidth="lg" xrayId="fly-on-the-wall-page">
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Eye className="w-8 h-8 text-primary" />
          Fly on the Wall
        </h1>
        <p className="text-muted-foreground mt-1">
          Public observation log — how decisions were made. Creation context and revision history for each document.
        </p>
      </div>

      {/* Session Updates from auto-wire pipeline */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Session Updates
          </CardTitle>
          <CardDescription>Live session progress from the auto-wire pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionUpdates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Session updates will appear here once the auto-wire pipeline publishes its first Fly on the Wall entry.
            </p>
          ) : (
            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-border">
              {sessionUpdates.map(update => (
                <div key={update.id} className="pl-8 relative">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{update.title}</span>
                      {update.bishop_session && <Badge variant="outline" className="text-xs">Bishop {update.bishop_session}</Badge>}
                      {update.knight_session && <Badge variant="outline" className="text-xs">Knight {update.knight_session}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(update.created_at).toLocaleString()}
                      {update.creation_context && ` — ${update.creation_context}`}
                    </p>
                    {update.content_markdown && (
                      <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted/50 rounded max-h-24 overflow-y-auto whitespace-pre-wrap">
                        {update.content_markdown.slice(0, 600)}{update.content_markdown.length > 600 ? '…' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Input
        placeholder="Search by title or creation context..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {isLoading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : isError ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Registry not available. Run migration 000020 and the ingestion script.</p>
            <a href={CEPHAS_BASE} className="text-primary hover:underline inline-flex items-center gap-1 mt-4">
              Open Cephas <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No registry entries yet. Run the Cephas ingestion script to populate.</p>
            <a
              href={CEPHAS_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 mt-4"
            >
              Open Cephas
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
                      href={`${CEPHAS_BASE}/${row.category.replace(/_/g, "-")}/${row.slug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      {row.title}
                      <ExternalLink className="w-4 h-4 shrink-0" />
                    </a>
                  </CardTitle>
                  <div className="flex gap-1 shrink-0">
                    {row.bishop_session && <Badge variant="outline">Bishop {row.bishop_session}</Badge>}
                    {row.knight_session && <Badge variant="outline">Knight {row.knight_session}</Badge>}
                  </div>
                </div>
                {row.creation_context && (
                  <CardDescription className="mt-1">{row.creation_context}</CardDescription>
                )}
              </CardHeader>
              {(row.revision_history?.length > 0 || row.decision_log?.length > 0) && (
                <CardContent className="pt-0 text-sm text-muted-foreground space-y-1">
                  {row.revision_history?.length > 0 && (
                    <p>Revisions: {row.revision_history.slice(0, 3).join(" · ")}</p>
                  )}
                  {row.decision_log?.length > 0 && (
                    <p>Decisions: {row.decision_log.slice(0, 2).join("; ")}</p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
      </div>
    </PortalPageLayout>
  );
}
