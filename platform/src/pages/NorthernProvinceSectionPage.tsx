import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Snowflake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  status: string | null;
};

const SECTION_CONFIG: Record<
  string,
  { title: string; keywords: string[]; description: string }
> = {
  "galactic-empire": {
    title: "Galactic Empire Archive",
    keywords: ["galactic", "empire", "company island", "noid", "2162", "2191", "2195"],
    description: "Company Islands, NOID tiers, custom currencies, and imperial trade routes.",
  },
  "senate-complex": {
    title: "Imperial Senate Complex",
    keywords: ["senate", "chamber", "deliberation", "governance"],
    description: "Senate architecture, deliberation systems, and procedural governance.",
  },
  "defense-klaus": {
    title: "Defense Klaus",
    keywords: ["defense klaus", "klaus", "for someone you love", "shield"],
    description: "Defense Klaus doctrine and protective systems integration documents.",
  },
  castle: {
    title: "Castle / Developer Ecosystem",
    keywords: ["castle", "developer", "ecosystem", "guild tower"],
    description: "Castle architecture and developer-operational ecosystem documentation.",
  },
  "chroniclers-hall": {
    title: "Chronicler's Hall",
    keywords: ["chronicler", "chronicle", "hall", "boaz", "seven-stage"],
    description: "Chronicle lifecycle and archival memory systems in seven stages.",
  },
  overlook: {
    title: "Northern Province Overlook",
    keywords: ["northern", "galactic", "hexisle", "senate"],
    description: "Preview overlook for members taking the Crow's Nest path around Snow Gate.",
  },
};

function pickSection(pathname: string) {
  const slug = pathname.split("/").filter(Boolean)[1] || "";
  return SECTION_CONFIG[slug] ? slug : "galactic-empire";
}

export default function NorthernProvinceSectionPage() {
  const location = useLocation();
  const sectionKey = pickSection(location.pathname);
  const section = SECTION_CONFIG[sectionKey];
  const { setProvince } = useBuilderMode();
  const access = useNorthernAccess();

  useEffect(() => {
    setProvince("northern");
  }, [setProvince]);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["northern-section-docs", sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compiled_documents" as never)
        .select("id, slug, title, family_name, section, status")
        .order("compiled_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as DocLite[];
    },
    staleTime: 60_000,
  });

  const matched = useMemo(() => {
    const re = new RegExp(section.keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
    return docs.filter((d) => re.test(`${d.slug} ${d.title} ${d.family_name ?? ""} ${d.section ?? ""}`));
  }, [docs, section.keywords]);

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId={`northern-${sectionKey}`}>
      <div className="space-y-6 rounded-xl border border-sky-400/20 bg-slate-950/70 p-6">
        <div className="space-y-2">
          <div className="text-xs text-sky-300/80 uppercase tracking-[0.2em] flex items-center gap-2">
            <Snowflake className="w-3 h-3" />
            <Link to="/northern" className="hover:text-sky-200">Northern Province</Link>
            <span>/</span>
            <span>{section.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{section.title}</h1>
          <p className="text-slate-300">{section.description}</p>
        </div>

        {!access.hasAccess ? <NorthernAccessGate previewCount={matched.length} /> : null}

        <div className="space-y-3">
          {sectionKey === "galactic-empire" ? (
            <Card className="border-sky-400/20 bg-slate-900/50">
              <CardContent className="py-4 flex flex-wrap gap-2">
                {["rebel", "colony", "kingdom", "empire"].map((tier) => (
                  <Link key={tier} to={`/northern/noid/${tier}`}>
                    <Badge variant="outline" className="border-sky-400/30 text-sky-200">
                      {tier[0].toUpperCase() + tier.slice(1)} NOID
                    </Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}
          {isLoading ? (
            <p className="text-slate-300">Loading northern archive slice...</p>
          ) : matched.length === 0 ? (
            <Card className="border-sky-400/20 bg-slate-900/50">
              <CardContent className="py-6 text-slate-300">
                No matching documents found yet for this section.
              </CardContent>
            </Card>
          ) : (
            matched.map((doc) => (
              <Link key={doc.id} to={`/cephas/archive/${doc.slug}`}>
                <Card className="border-sky-400/20 bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
                  <CardContent className="py-4 space-y-1">
                    <p className="text-slate-100 font-medium">{doc.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {doc.family_name ? (
                        <Badge variant="outline" className="border-sky-400/30 text-sky-200">{doc.family_name}</Badge>
                      ) : null}
                      {doc.section ? (
                        <Badge variant="outline" className="border-sky-400/30 text-sky-200">{doc.section}</Badge>
                      ) : null}
                      {doc.status ? (
                        <Badge variant="outline" className="border-sky-400/30 text-sky-200">{doc.status}</Badge>
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

