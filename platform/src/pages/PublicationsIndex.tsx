import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { ArrowRight } from "lucide-react";

const PUB_TYPES = [
  { key: "all",           label: "All",           icon: "" },
  { key: "paper",         label: "Papers",        icon: "📄" },
  { key: "article",       label: "Articles",      icon: "📰" },
  { key: "pudding",       label: "Pudding",       icon: "🍮" },
  { key: "formal",        label: "Formal",        icon: "⚖️" },
  { key: "business-plan", label: "Plans",         icon: "📊" },
  { key: "economics",     label: "Economics",     icon: "📈" },
] as const;

const TYPE_COLORS: Record<string, string> = {
  paper:           "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  article:         "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  pudding:         "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  formal:          "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
  "business-plan": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  economics:       "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
};

const TYPE_LABELS: Record<string, string> = {
  paper: "Working Paper",
  article: "Article",
  pudding: "Pudding",
  formal: "A&A Formal",
  "business-plan": "Business Plan",
  economics: "Economics",
};

export default function PublicationsIndex() {
  const [filter, setFilter] = useState("all");

  const { data: publications, isLoading } = useQuery({
    queryKey: ["publications-index"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("title, slug, category, technical_summary, publication_type, publication_date, paper_number, updated_at")
        .order("publication_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filtered = publications?.filter((p: any) => {
    if (filter === "all") return true;
    return (p.publication_type || "article") === filter;
  }) ?? [];

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="publications-index">
      <div className="space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-['Source_Sans_3',sans-serif]">
            Liana Banyan Corporation
          </p>
          <h1 className="text-3xl font-bold font-['Crimson_Pro',Georgia,serif]">
            Publications
          </h1>
          <p className="text-sm text-muted-foreground">
            Research, analysis, and documentation from the Liana Banyan platform
          </p>
        </header>

        {/* Type filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {PUB_TYPES.map((pt) => (
            <button
              key={pt.key}
              onClick={() => setFilter(pt.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === pt.key
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {pt.icon && <span className="mr-1">{pt.icon}</span>}
              {pt.label}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-sm text-muted-foreground text-center">
          Showing {filtered.length} publication{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* List */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading publications…</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((pub: any) => {
              const ptype = pub.publication_type || "article";
              const color = TYPE_COLORS[ptype] ?? TYPE_COLORS.article;
              const label = TYPE_LABELS[ptype] ?? "Article";
              const dateStr = pub.publication_date
                ? new Date(pub.publication_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                : pub.updated_at
                  ? new Date(pub.updated_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                  : "";

              return (
                <Link
                  key={pub.slug}
                  to={`/cephas/${pub.category}/${pub.slug}`}
                  className="block group rounded-lg border p-4 hover:border-foreground/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[0.65rem] font-medium ${color}`}>
                          {label}
                        </span>
                        {pub.paper_number && (
                          <span className="text-[0.65rem] text-muted-foreground">{pub.paper_number}</span>
                        )}
                      </div>
                      <h2 className="font-semibold font-['Crimson_Pro',Georgia,serif] group-hover:text-primary transition-colors truncate">
                        {pub.title}
                      </h2>
                      {pub.technical_summary && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {pub.technical_summary}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2 text-xs text-muted-foreground pt-1">
                      <span>{dateStr}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PortalPageLayout>
  );
}
