/**
 * Under the Hood — Technical transparency index (Session 19, fixed B037)
 * Lists Cephas documents with technical summary. Links to cephas.lianabanyan.com or registry detail.
 * Uses direct fetch to bypass Supabase JS client issues with unauthenticated users.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
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

export default function UnderTheHoodPage() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/cephas_content_registry?select=id,slug,title,category,technical_summary,implementation_status,source_path&order=title`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: RegistryItem[] = await res.json();
        if (!cancelled) {
          setItems(data);
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
