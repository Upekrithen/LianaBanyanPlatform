import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useResourceLinks,
  useSubmitResource,
  useVoteOnResource,
  type CephasResource,
  type ResourceType,
} from "@/hooks/useCephasKnowledge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ThumbsUp, ThumbsDown, Flag, ExternalLink, Plus, Star, Award, Users,
  BookOpen, Video, Headphones, Wrench, Code, FileText, HelpCircle, Loader2,
} from "lucide-react";

const TYPE_OPTIONS: { value: ResourceType; label: string; icon: React.ReactNode }[] = [
  { value: "tutorial", label: "Tutorial", icon: <BookOpen className="w-3 h-3" /> },
  { value: "tool", label: "Tool", icon: <Wrench className="w-3 h-3" /> },
  { value: "example", label: "Example", icon: <Code className="w-3 h-3" /> },
  { value: "documentation", label: "Docs", icon: <FileText className="w-3 h-3" /> },
  { value: "video", label: "Video", icon: <Video className="w-3 h-3" /> },
  { value: "podcast", label: "Podcast", icon: <Headphones className="w-3 h-3" /> },
  { value: "book", label: "Book", icon: <BookOpen className="w-3 h-3" /> },
  { value: "other", label: "Other", icon: <HelpCircle className="w-3 h-3" /> },
];

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  featured: { label: "Featured", icon: <Star className="w-3.5 h-3.5" />, color: "text-amber-600 bg-amber-50 border-amber-200" },
  recommended: { label: "Recommended", icon: <Award className="w-3.5 h-3.5" />, color: "text-blue-600 bg-blue-50 border-blue-200" },
  community: { label: "Community", icon: <Users className="w-3.5 h-3.5" />, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
};

function ResourceCard({
  resource,
  articleSlug,
}: {
  resource: CephasResource;
  articleSlug: string;
}) {
  const { user } = useAuth();
  const vote = useVoteOnResource();
  const myVote = resource.my_vote;

  const castVote = (v: -1 | 0 | 1) => {
    if (!user) return;
    vote.mutate({ resourceId: resource.id, articleSlug, vote: v });
  };

  const meta = STATUS_META[resource.status];

  return (
    <div className="border rounded-lg p-3 space-y-2 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <a
            href={resource.url}
            className="font-medium text-sm hover:text-primary inline-flex items-center gap-1"
          >
            {resource.title}
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
          {resource.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {resource.description}
            </p>
          )}
        </div>
        {meta && (
          <Badge variant="outline" className={`shrink-0 text-xs gap-1 ${meta.color}`}>
            {meta.icon} {meta.label}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs">
        {resource.resource_type && (
          <Badge variant="secondary" className="text-xs">
            {resource.resource_type}
          </Badge>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-1.5 ${myVote === 1 ? "text-green-600 bg-green-50" : ""}`}
            onClick={() => castVote(1)}
            disabled={!user || vote.isPending}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="ml-0.5">{resource.upvotes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-1.5 ${myVote === -1 ? "text-red-600 bg-red-50" : ""}`}
            onClick={() => castVote(-1)}
            disabled={!user || vote.isPending}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span className="ml-0.5">{resource.downvotes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-1.5 ${myVote === 0 ? "text-orange-600 bg-orange-50" : ""}`}
            onClick={() => castVote(0)}
            disabled={!user || vote.isPending}
          >
            <Flag className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SubmitForm({ articleSlug, onDone }: { articleSlug: string; onDone: () => void }) {
  const submit = useSubmitResource();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<ResourceType>("other");

  const isValid = url.startsWith("http") && title.trim().length > 2;

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <h4 className="text-sm font-semibold">Submit a Resource</h4>
      <div className="space-y-2">
        <div>
          <Label className="text-xs">URL</Label>
          <Input
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Title</Label>
          <Input
            placeholder="Resource title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Description (optional)</Label>
          <Textarea
            placeholder="Why is this helpful?"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="text-sm min-h-[60px]"
          />
        </div>
        <div>
          <Label className="text-xs">Type</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {TYPE_OPTIONS.map((t) => (
              <Badge
                key={t.value}
                variant={type === t.value ? "default" : "outline"}
                className="cursor-pointer text-xs gap-1"
                onClick={() => setType(t.value)}
              >
                {t.icon} {t.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!isValid || submit.isPending}
          onClick={() =>
            submit.mutate(
              { article_slug: articleSlug, url, title, description: desc || undefined, resource_type: type },
              { onSuccess: onDone },
            )
          }
        >
          {submit.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
          Submit
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

interface CephasResourcePanelProps {
  articleSlug: string;
}

export function CephasResourcePanel({ articleSlug }: CephasResourcePanelProps) {
  const { data: resources, isLoading } = useResourceLinks(articleSlug);
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const featured = resources?.filter((r) => r.status === "featured") ?? [];
  const recommended = resources?.filter((r) => r.status === "recommended") ?? [];
  const community = resources?.filter((r) => r.status === "community") ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Community Resources
          </CardTitle>
          {user && !showForm && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowForm(true)}>
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && <SubmitForm articleSlug={articleSlug} onDone={() => setShowForm(false)} />}

        {featured.length > 0 && (
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 flex items-center gap-1">
              <Star className="w-3 h-3" /> Featured
            </h4>
            {featured.map((r) => (
              <ResourceCard key={r.id} resource={r} articleSlug={articleSlug} />
            ))}
          </section>
        )}
        {recommended.length > 0 && (
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1">
              <Award className="w-3 h-3" /> Recommended
            </h4>
            {recommended.map((r) => (
              <ResourceCard key={r.id} resource={r} articleSlug={articleSlug} />
            ))}
          </section>
        )}
        {community.length > 0 && (
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <Users className="w-3 h-3" /> Community
            </h4>
            {community.map((r) => (
              <ResourceCard key={r.id} resource={r} articleSlug={articleSlug} />
            ))}
          </section>
        )}

        {!featured.length && !recommended.length && !community.length && !showForm && (
          <div className="text-center py-6">
            <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground mb-1">No resources yet</p>
            <p className="text-xs text-muted-foreground/70">
              {user ? "Be the first to share a helpful resource!" : "Sign in to contribute resources."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
