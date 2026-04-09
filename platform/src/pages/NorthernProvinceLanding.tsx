import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Snowflake, Landmark, Shield, Castle, ScrollText, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBuilderMode } from "@/components/builder/BuilderModeContext";
import { useNorthernAccess } from "@/hooks/useNorthernAccess";
import { NorthernAccessGate } from "@/components/northern/NorthernAccessGate";

type DocLite = {
  id: string;
  slug: string;
  title: string;
  family_name: string | null;
  section: string | null;
};

const AREAS = [
  { path: "/northern/galactic-empire", title: "Galactic Empire Archive", icon: Landmark },
  { path: "/northern/senate-complex", title: "Imperial Senate Complex", icon: Shield },
  { path: "/northern/defense-klaus", title: "Defense Klaus", icon: Shield },
  { path: "/northern/castle", title: "Castle / Developer Ecosystem", icon: Castle },
  { path: "/northern/chroniclers-hall", title: "Chronicler's Hall", icon: ScrollText },
] as const;

export default function NorthernProvinceLanding() {
  const { setProvince } = useBuilderMode();
  const access = useNorthernAccess();

  useEffect(() => {
    setProvince("northern");
  }, [setProvince]);

  const { data: docs = [] } = useQuery({
    queryKey: ["northern-province-docs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compiled_documents" as never)
        .select("id, slug, title, family_name, section")
        .order("compiled_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as DocLite[];
    },
    staleTime: 60_000,
  });

  const northernDocs = useMemo(
    () =>
      docs.filter((d) =>
        `${d.slug} ${d.title} ${d.family_name ?? ""} ${d.section ?? ""}`
          .toLowerCase()
          .match(/hexisle|galactic|senate|klaus|chronicler|castle|company island|noid/),
      ),
    [docs],
  );

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="northern-province-landing">
      <div className="space-y-6 rounded-xl border border-sky-400/20 bg-slate-950/70 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-300/80 flex items-center gap-2">
            <Snowflake className="w-3 h-3" />
            Northern Province
          </p>
          <h1 className="text-3xl font-bold text-slate-100">Beyond the Snow Gate</h1>
          <p className="text-slate-300 max-w-3xl">
            The hen showed you the way. The philosopher shows you what it means. Galactic Empire
            governance, Company Islands, and advanced systems architecture live here.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline" className="border-sky-400/30 text-sky-200">Denken Active</Badge>
            <Badge variant="outline" className="border-sky-400/30 text-sky-200">
              {northernDocs.length} linked archive docs
            </Badge>
            <Badge variant="outline" className="border-sky-400/30 text-sky-200">
              Access: {access.locksCompleted}/12 locks, L{access.level}
            </Badge>
          </div>
        </div>

        {!access.hasAccess ? (
          <NorthernAccessGate previewCount={northernDocs.length} />
        ) : (
          <Card className="border-sky-400/20 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sky-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Northern Archives Unlocked
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Snow Gate requirements met. Full Northern Province reading routes are active.
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {AREAS.map((area) => {
            const Icon = area.icon;
            return (
              <Link key={area.path} to={area.path}>
                <Card className="h-full border-sky-400/20 bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Icon className="w-5 h-5 text-sky-300" />
                    <span className="text-slate-100">{area.title}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card className="border-sky-400/20 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-100">NOID Tier Paths</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["rebel", "colony", "kingdom", "empire"].map((tier) => (
              <Link key={tier} to={`/northern/noid/${tier}`}>
                <Badge variant="outline" className="border-sky-400/30 text-sky-200">
                  {tier[0].toUpperCase() + tier.slice(1)}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}

