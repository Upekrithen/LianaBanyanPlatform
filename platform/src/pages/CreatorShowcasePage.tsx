/**
 * LB-Native Creator Showcase — Grid of all creators (creator_type set)
 * Route: /creators (ExplorerRoute). Founder: ready FROM LAUNCH.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Palette,
  Utensils,
  Music,
  Lightbulb,
  User,
  ExternalLink,
} from "lucide-react";
import { InviteCreatorCard } from "@/components/cue-cards/InviteCreatorCard";

const CREATOR_TYPES = [
  { value: "all", label: "All" },
  { value: "physical", label: "Physical" },
  { value: "art", label: "Art" },
  { value: "food", label: "Food" },
  { value: "music", label: "Music" },
  { value: "business", label: "Business" },
] as const;

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  physical: Package,
  art: Palette,
  food: Utensils,
  music: Music,
  business: Lightbulb,
};

type SortOption = "newest" | "backed" | "name";

interface CreatorRow {
  id: string;
  user_id: string | null;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  creator_type: string | null;
  creator_external_url: string | null;
  created_at: string | null;
}

export default function CreatorShowcasePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const { data: creators, isLoading } = useQuery({
    queryKey: ["creators-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, display_name, avatar_url, creator_type, creator_external_url, created_at")
        .not("creator_type", "is", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as CreatorRow[];
    },
  });

  const { data: backerCounts } = useQuery({
    queryKey: ["creator-backer-counts", creators?.map((c) => c.user_id).filter(Boolean)],
    queryFn: async () => {
      if (!creators?.length) return {};
      const userIds = creators.map((c) => c.user_id).filter(Boolean) as string[];
      const { data: projects } = await supabase
        .from("projects")
        .select("id, owner_id")
        .in("owner_id", userIds);
      const projectIdsByOwner: Record<string, string[]> = {};
      userIds.forEach((u) => { projectIdsByOwner[u] = []; });
      projects?.forEach((p: { id: string; owner_id: string }) => {
        if (projectIdsByOwner[p.owner_id]) projectIdsByOwner[p.owner_id].push(p.id);
      });
      const allProjectIds = (projects || []).map((p: { id: string }) => p.id);
      if (allProjectIds.length === 0) return Object.fromEntries(userIds.map((u) => [u, 0]));
      const { data: backings } = await supabase
        .from("project_backings")
        .select("project_id")
        .in("project_id", allProjectIds);
      const countByProject: Record<string, number> = {};
      allProjectIds.forEach((id) => { countByProject[id] = 0; });
      backings?.forEach((b: { project_id: string }) => {
        countByProject[b.project_id] = (countByProject[b.project_id] || 0) + 1;
      });
      const map: Record<string, number> = {};
      userIds.forEach((uid) => {
        map[uid] = (projectIdsByOwner[uid] || []).reduce((s, pid) => s + (countByProject[pid] || 0), 0);
      });
      return map;
    },
    enabled: !!creators?.length,
  });

  const filtered = (creators || []).filter(
    (c) => typeFilter === "all" || c.creator_type === typeFilter
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") {
      const na = (a.display_name || a.full_name || "").toLowerCase();
      const nb = (b.display_name || b.full_name || "").toLowerCase();
      return na.localeCompare(nb);
    }
    if (sort === "backed") {
      const ba = backerCounts?.[a.user_id || ""] ?? 0;
      const bb = backerCounts?.[b.user_id || ""] ?? 0;
      return bb - ba;
    }
    return (
      new Date((b.created_at || 0) as string).getTime() -
      new Date((a.created_at || 0) as string).getTime()
    );
  });

  return (
    <div className="min-h-screen bg-background" data-xray-id="creator-showcase-page">
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Creators</h1>
          <p className="text-muted-foreground">
            Your craft deserves a cooperative home. Cost+20 — you keep 83.3%.
          </p>
          {!user && (
            <Button asChild>
              <Link to="/join/creator">Join as Creator</Link>
            </Button>
          )}
        </header>

        <div className="flex flex-wrap gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {CREATOR_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="backed">Most backed</SelectItem>
              <SelectItem value="name">A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader><div className="h-6 bg-muted rounded" /></CardHeader>
                <CardContent><div className="h-24 bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No creators yet. Be the first — join as a creator.</p>
              <Button asChild className="mt-4">
                <Link to="/join/creator">Join as Creator</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((creator) => {
              const TypeIcon = TYPE_ICONS[creator.creator_type || ""] || User;
              const name = creator.display_name || creator.full_name || "Creator";
              return (
                <Card
                  key={creator.id}
                  className="overflow-hidden hover:border-primary/30 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      {creator.avatar_url ? (
                        <img
                          src={creator.avatar_url}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{name}</p>
                        <Badge variant="secondary" className="gap-1 mt-1">
                          <TypeIcon className="w-3 h-3" />
                          {CREATOR_TYPES.find((t) => t.value === creator.creator_type)?.label ?? creator.creator_type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Cost+20</span>
                      {(backerCounts?.[creator.user_id || ""] ?? 0) > 0 && (
                        <span>{(backerCounts?.[creator.user_id || ""] ?? 0)} backings</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/creators/${creator.user_id ?? creator.id}`)}
                      >
                        View Creator
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/creators/${creator.user_id ?? creator.id}?back=1`)}
                      >
                        Back this Creator
                      </Button>
                    </div>
                    {creator.creator_external_url && (
                      <a
                        href={creator.creator_external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        See their work
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <section className="pt-8 border-t">
          <InviteCreatorCard />
        </section>
      </div>
    </div>
  );
}
