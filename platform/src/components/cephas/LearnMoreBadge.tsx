import { useRelatedArticles, type KnowledgeEdge } from "@/hooks/useCephasKnowledge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, HelpCircle, Loader2 } from "lucide-react";

const CEPHAS_BASE = "/cephas";

const EDGE_LABELS: Record<string, string> = {
  explains: "Explains",
  references: "References",
  teaches: "Teaches",
  extends: "Extends",
  implements: "Implements",
  related: "Related",
};

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function ArticleRow({ edge }: { edge: KnowledgeEdge }) {
  const slug = edge.target_type === "cephas_article" ? edge.target_id : edge.source_id;
  return (
    <a
      href={`${CEPHAS_BASE}/${slug}`}
      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors group"
    >
      <BookOpen className="w-4 h-4 text-primary shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
          {slugToTitle(slug)}
        </p>
        <p className="text-xs text-muted-foreground">
          {EDGE_LABELS[edge.edge_type] ?? edge.edge_type}
        </p>
      </div>
      <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
    </a>
  );
}

interface LearnMoreBadgeProps {
  featurePath: string;
  variant?: "icon" | "badge" | "text";
  className?: string;
}

export function LearnMoreBadge({
  featurePath,
  variant = "badge",
  className = "",
}: LearnMoreBadgeProps) {
  const { data: articles, isLoading } = useRelatedArticles(featurePath);

  if (!isLoading && (!articles || articles.length === 0)) return null;

  const trigger =
    variant === "icon" ? (
      <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 rounded-full ${className}`}>
        <HelpCircle className="w-4 h-4 text-primary" />
      </Button>
    ) : variant === "text" ? (
      <Button variant="link" size="sm" className={`h-auto p-0 text-xs gap-1 ${className}`}>
        <BookOpen className="w-3 h-3" /> Learn more
      </Button>
    ) : (
      <Badge
        variant="outline"
        className={`cursor-pointer hover:bg-primary/10 transition-colors text-xs gap-1 ${className}`}
      >
        <HelpCircle className="w-3 h-3" /> Learn more
      </Badge>
    );

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground px-2 pt-1 pb-0.5">
            Related Cephas Articles
          </p>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            articles?.map((e) => <ArticleRow key={e.id} edge={e} />)
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
