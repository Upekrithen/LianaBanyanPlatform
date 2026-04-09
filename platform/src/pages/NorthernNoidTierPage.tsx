import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Snowflake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBuilderMode } from "@/components/builder/BuilderModeContext";

type Tier = "rebel" | "colony" | "kingdom" | "empire";
type DocLite = { id: string; slug: string; title: string; family_name: string | null; section: string | null };

const TIER_CONFIG: Record<Tier, { title: string; description: string; keywords: string[] }> = {
  rebel: {
    title: "Rebel NOID Tier",
    description: "Entry tier and orientation route into Corporate Island participation.",
    keywords: ["rebel", "company island", "noid", "corporate island"],
  },
  colony: {
    title: "Colony NOID Tier",
    description: "Bounded dedication and early corporate integration tier.",
    keywords: ["colony", "company island", "dedication", "trade route"],
  },
  kingdom: {
    title: "Kingdom NOID Tier",
    description: "Mid-market tier with stronger trade-route and governance footprint.",
    keywords: ["kingdom", "company island", "governance", "trade route"],
  },
  empire: {
    title: "Empire NOID Tier",
    description: "Anchor-tier participation with full ecosystem orchestration.",
    keywords: ["empire", "company island", "galactic empire", "trade routes"],
  },
};

export default function NorthernNoidTierPage() {
  const { tier } = useParams<{ tier: Tier }>();
  const safeTier: Tier = (tier && tier in TIER_CONFIG ? tier : "rebel") as Tier;
  const cfg = TIER_CONFIG[safeTier];
  const { setProvince } = useBuilderMode();

  useEffect(() => {
    setProvince("northern");
  }, [setProvince]);

  const { data: docs = [] } = useQuery({
    queryKey: ["northern-noid-docs", safeTier],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compiled_documents" as never)
        .select("id, slug, title, family_name, section")
        .order("compiled_at", { ascending: false })
        .limit(250);
      if (error) throw error;
      return (data ?? []) as DocLite[];
    },
    staleTime: 60_000,
  });

  const matched = useMemo(() => {
    const re = new RegExp(cfg.keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
    return docs.filter((d) => re.test(`${d.slug} ${d.title} ${d.family_name ?? ""} ${d.section ?? ""}`));
  }, [cfg.keywords, docs]);

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId={`northern-noid-${safeTier}`}>
      <div className="space-y-5 rounded-xl border border-sky-400/20 bg-slate-950/70 p-6">
        <div className="text-xs text-sky-300/80 uppercase tracking-[0.2em] flex items-center gap-2">
          <Snowflake className="w-3 h-3" />
          <Link to="/northern" className="hover:text-sky-200">Northern Province</Link>
          <span>/</span>
          <Link to="/northern/galactic-empire" className="hover:text-sky-200">Galactic Empire</Link>
          <span>/</span>
          <span>{cfg.title}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">{cfg.title}</h1>
        <p className="text-slate-300">{cfg.description}</p>
        <div className="flex flex-wrap gap-2">
          {(["rebel", "colony", "kingdom", "empire"] as Tier[]).map((t) => (
            <Link key={t} to={`/northern/noid/${t}`}>
              <Badge
                variant="outline"
                className={
                  t === safeTier
                    ? "border-sky-300/60 text-sky-100 bg-sky-900/30"
                    : "border-sky-400/30 text-sky-200"
                }
              >
                {t[0].toUpperCase() + t.slice(1)}
              </Badge>
            </Link>
          ))}
        </div>
        <div className="space-y-3">
          {matched.length === 0 ? (
            <Card className="border-sky-400/20 bg-slate-900/50">
              <CardContent className="py-5 text-slate-300">No matched archive docs yet for this tier.</CardContent>
            </Card>
          ) : (
            matched.map((doc) => (
              <Link key={doc.id} to={`/cephas/archive/${doc.slug}`}>
                <Card className="border-sky-400/20 bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
                  <CardContent className="py-4">
                    <p className="text-slate-100 font-medium">{doc.title}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {doc.family_name ? (
                        <Badge variant="outline" className="border-sky-400/30 text-sky-200">{doc.family_name}</Badge>
                      ) : null}
                      {doc.section ? (
                        <Badge variant="outline" className="border-sky-400/30 text-sky-200">{doc.section}</Badge>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </PortalPageLayout>
  );
}

