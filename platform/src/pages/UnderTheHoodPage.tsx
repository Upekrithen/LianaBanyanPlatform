/**
 * Under the Hood — Technical transparency index (Session 19, fixed B037)
 * Lists Cephas documents with technical summary. Links to cephas.lianabanyan.com or registry detail.
 * Uses direct fetch to bypass Supabase JS client issues with unauthenticated users.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, ChevronDown, ChevronUp, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// All links stay in-platform. Cephas Hugo site is a future SEO mirror, not the source of truth.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface RegistryItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  technical_summary: string | null;
  implementation_status: string | null;
  source_path: string;
}

interface SystemSnapshot {
  id: string;
  slug: string;
  title: string;
  content_markdown: string | null;
  technical_summary: string | null;
  creation_context: string | null;
  bishop_session: string | null;
  knight_session: string | null;
  created_at: string;
}

export default function UnderTheHoodPage() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [snapshots, setSnapshots] = useState<SystemSnapshot[]>([]);
  const [expandedSnapshot, setExpandedSnapshot] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [regRes, snapRes] = await Promise.all([
          fetch(
            `${SUPABASE_URL}/rest/v1/cephas_content_registry?select=id,slug,title,category,technical_summary,implementation_status,source_path&order=title`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
          ),
          fetch(
            `${SUPABASE_URL}/rest/v1/cephas_content_registry?select=id,slug,title,content_markdown,technical_summary,creation_context,bishop_session,knight_session,created_at&category=eq.under_the_hood&order=created_at.desc&limit=10`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
          ),
        ]);
        if (!regRes.ok) throw new Error(`HTTP ${regRes.status}`);
        const data: RegistryItem[] = await regRes.json();
        const snapData: SystemSnapshot[] = snapRes.ok ? await snapRes.json() : [];
        if (!cancelled) {
          setItems(data);
          setSnapshots(snapData);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("[UnderTheHood] fetch error:", err);
        if (!cancelled) {
          setIsError(true);
          setIsLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = items.filter(
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

      {/* System Snapshots from auto-wire pipeline */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            System Snapshots
          </CardTitle>
          <CardDescription>Automated technical snapshots from the build pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              System snapshots will appear here once the auto-wire pipeline publishes its first Under the Hood entry.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Latest snapshot — full display */}
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{snapshots[0].title}</CardTitle>
                    <div className="flex gap-1 shrink-0">
                      {snapshots[0].bishop_session && <Badge variant="outline" className="text-xs">Bishop {snapshots[0].bishop_session}</Badge>}
                      {snapshots[0].knight_session && <Badge variant="outline" className="text-xs">Knight {snapshots[0].knight_session}</Badge>}
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {new Date(snapshots[0].created_at).toLocaleString()}
                    {snapshots[0].creation_context && ` — ${snapshots[0].creation_context}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {snapshots[0].content_markdown ? (
                    <div className="text-sm whitespace-pre-wrap max-h-64 overflow-y-auto p-3 bg-muted/50 rounded-lg">
                      {snapshots[0].content_markdown}
                    </div>
                  ) : snapshots[0].technical_summary ? (
                    <p className="text-sm text-muted-foreground">{snapshots[0].technical_summary}</p>
                  ) : null}
                </CardContent>
              </Card>

              {/* Historical snapshots — expandable */}
              {snapshots.length > 1 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Previous Snapshots</p>
                  {snapshots.slice(1).map(snap => (
                    <div key={snap.id}>
                      <Button
                        variant="ghost" size="sm"
                        className="w-full justify-between text-xs h-8"
                        onClick={() => setExpandedSnapshot(expandedSnapshot === snap.id ? null : snap.id)}
                      >
                        <span className="truncate">{snap.title}</span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="text-muted-foreground">{new Date(snap.created_at).toLocaleDateString()}</span>
                          {expandedSnapshot === snap.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </span>
                      </Button>
                      {expandedSnapshot === snap.id && (
                        <div className="ml-2 pl-3 border-l border-border text-xs text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto p-2">
                          {snap.content_markdown || snap.technical_summary || 'No content available'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Input
        placeholder="Search by title or technical summary..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md pl-10"
      />

      {isLoading ? (
        <div className="text-muted-foreground animate-pulse">Loading registry…</div>
      ) : isError ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Registry not available. Please try again later.</p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>{search ? "No documents match your search." : "No registry entries yet."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map((row) => (
            <Card key={row.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">
                    <a
                      href={`/cephas/${row.category}/${row.slug}`}
                      className="hover:underline"
                    >
                      {row.title}
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
