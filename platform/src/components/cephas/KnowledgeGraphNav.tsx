import { useRelatedFeatures, useRelatedArticles, type KnowledgeEdge } from "@/hooks/useCephasKnowledge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  ArrowRight, BookOpen, Sparkles, Compass, ExternalLink, Loader2,
} from "lucide-react";

const EDGE_LABELS: Record<string, string> = {
  explains: "Explains",
  references: "References",
  teaches: "Teaches",
  extends: "Extends",
  implements: "Implements",
  related: "Related",
};

const CEPHAS_BASE = "/cephas";

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function FeatureCard({ edge }: { edge: KnowledgeEdge }) {
  const path = edge.source_type === "platform_feature" ? edge.source_id : edge.target_id;
  return (
    <Link to={path}>
      <div className="border rounded-lg p-3 hover:shadow-md transition-shadow hover:border-primary/40 group">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm group-hover:text-primary transition-colors">
              {slugToTitle(path.replace(/^\//, ""))}
            </p>
            <Badge variant="secondary" className="text-xs mt-1">
              {EDGE_LABELS[edge.edge_type] ?? edge.edge_type}
            </Badge>
          </div>
          <ArrowRight className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
        </div>
        <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs text-primary">
          Try it now <Sparkles className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </Link>
  );
}

function ArticleCard({ edge }: { edge: KnowledgeEdge }) {
  const slug = edge.target_type === "cephas_article" ? edge.target_id : edge.source_id;
  return (
    <a
      href={`${CEPHAS_BASE}/${slug}`}
    >
      <div className="border rounded-lg p-3 hover:shadow-md transition-shadow hover:border-primary/40 group">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm group-hover:text-primary transition-colors">
              {slugToTitle(slug)}
            </p>
            <Badge variant="secondary" className="text-xs mt-1">
              {EDGE_LABELS[edge.edge_type] ?? edge.edge_type}
            </Badge>
          </div>
          <ExternalLink className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
        </div>
        <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs text-primary">
          Learn more <BookOpen className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </a>
  );
}

interface KnowledgeGraphNavProps {
  articleSlug?: string;
  featurePath?: string;
}

export function KnowledgeGraphNav({ articleSlug, featurePath }: KnowledgeGraphNavProps) {
  const { data: features, isLoading: loadingF } = useRelatedFeatures(articleSlug);
  const { data: articles, isLoading: loadingA } = useRelatedArticles(featurePath);

  const isLoading = loadingF || loadingA;
  const hasFeatures = (features?.length ?? 0) > 0;
  const hasArticles = (articles?.length ?? 0) > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasFeatures && !hasArticles) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Compass className="w-4 h-4 text-primary" />
          Knowledge Graph
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasFeatures && (
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary/80 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Related Features
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {features!.map((e) => (
                <FeatureCard key={e.id} edge={e} />
              ))}
            </div>
          </section>
        )}
        {hasArticles && (
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary/80 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Related Articles
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {articles!.map((e) => (
                <ArticleCard key={e.id} edge={e} />
              ))}
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
