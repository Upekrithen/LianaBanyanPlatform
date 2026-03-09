/**
 * CONTENT CONTROLS PANEL
 * ======================
 * Imgur-inspired topic-based content filtering — the HORIZONTAL layer
 * on top of the Shirley Temple Policy's VERTICAL rating system.
 *
 * The Shirley Temple Policy gates content by maturity level (ST→UV).
 * This adds per-topic preferences so users can filter what they
 * see based on SUBJECT MATTER, independent of rating level.
 *
 * A GA-rated user who doesn't want to see politics or horror
 * can set those topics to "reduced" or "hidden" here.
 *
 * Layout mirrors Imgur's Content Controls page:
 *   - Topic Preferences (toggleable categories)
 *   - Blocked Tags (free-form, max 100)
 *   - Integration with existing RatingBadge + GateContext
 *
 * Used in: /content-controls route (Settings section)
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Eye,
  EyeOff,
  MinusCircle,
  Tag,
  X,
  Plus,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGate, RATING_LABELS, type RatingLevel } from "@/components/Gates/GateContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContentTopic {
  id: string;
  slug: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  category: string;
  is_default_hidden: boolean;
  display_order: number;
}

type TopicVisibility = "normal" | "reduced" | "hidden";

interface UserTopicPreference {
  id: string;
  topic_id: string;
  visibility: TopicVisibility;
}

interface BlockedTag {
  id: string;
  tag: string;
}

const VISIBILITY_OPTIONS: { value: TopicVisibility; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "normal", label: "Show", icon: <Eye className="h-4 w-4" />, description: "Show normally in feeds" },
  { value: "reduced", label: "Reduce", icon: <MinusCircle className="h-4 w-4" />, description: "Show less of this topic" },
  { value: "hidden", label: "Hide", icon: <EyeOff className="h-4 w-4" />, description: "Don't show unless searched" },
];

const CATEGORY_LABELS: Record<string, { label: string; description: string }> = {
  sensitivity: {
    label: "Sensitivity Topics",
    description: "Content areas that some users may want to see less of. De-prioritized, never hard-blocked — you can always search for it.",
  },
  preference: {
    label: "Interest Topics",
    description: "Personal interest areas. Reducing these just means fewer suggestions — they're never hidden from search.",
  },
  safety: {
    label: "Safety Topics",
    description: "Content with safety considerations. Settings here work alongside your Shirley Temple rating level.",
  },
};

// ─── Topic Preferences Section ────────────────────────────────────────────────

function TopicRow({
  topic,
  visibility,
  onVisibilityChange,
  saving,
}: {
  topic: ContentTopic;
  visibility: TopicVisibility;
  onVisibilityChange: (topicId: string, visibility: TopicVisibility) => void;
  saving: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-2 hover:bg-muted/30 rounded-md transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-xl flex-shrink-0" role="img" aria-label={topic.display_name}>
          {topic.icon || "📌"}
        </span>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{topic.display_name}</p>
          {topic.description && (
            <p className="text-xs text-muted-foreground truncate">{topic.description}</p>
          )}
        </div>
      </div>
      <Select
        value={visibility}
        onValueChange={(v) => onVisibilityChange(topic.id, v as TopicVisibility)}
        disabled={saving}
      >
        <SelectTrigger className="w-[130px] flex-shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {VISIBILITY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <div className="flex items-center gap-2">
                {opt.icon}
                <span>{opt.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Blocked Tags Section ─────────────────────────────────────────────────────

function BlockedTagsSection({
  tags,
  onAdd,
  onRemove,
  maxTags,
}: {
  tags: BlockedTag[];
  onAdd: (tag: string) => void;
  onRemove: (id: string) => void;
  maxTags: number;
}) {
  const [newTag, setNewTag] = useState("");

  const handleAdd = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (!trimmed) return;
    if (tags.some((t) => t.tag === trimmed)) return;
    if (tags.length >= maxTags) return;
    onAdd(trimmed);
    setNewTag("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tag className="h-5 w-5" />
          Blocked Tags
        </CardTitle>
        <CardDescription>
          Block specific tags to filter them from your feeds. Content with blocked tags
          is de-prioritized (not hard-blocked — you can still find it via search).
          <span className="block mt-1 text-xs">
            {tags.length} / {maxTags} tags used
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new tag */}
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a tag to block..."
            disabled={tags.length >= maxTags}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!newTag.trim() || tags.length >= maxTags}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {tags.length >= maxTags && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs">
            <AlertTriangle className="h-3 w-3" />
            Maximum {maxTags} blocked tags reached
          </div>
        )}

        {/* Tag list */}
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="pl-2 pr-1 py-1 text-sm flex items-center gap-1 group"
              >
                {tag.tag}
                <button
                  onClick={() => onRemove(tag.id)}
                  className="ml-1 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                  aria-label={`Remove blocked tag: ${tag.tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No blocked tags yet. Add tags above to filter specific content from your feeds.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContentControlsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userRating, getRatingLabel } = useGate();
  const [savingTopics, setSavingTopics] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["sensitivity", "preference", "safety"])
  );

  // ─── Fetch all content topics ────────────────────────────────────────────

  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ["content-topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_topics")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as ContentTopic[];
    },
  });

  // ─── Fetch user's topic preferences ──────────────────────────────────────

  const { data: preferences = [], isLoading: prefsLoading } = useQuery({
    queryKey: ["user-topic-preferences", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_topic_preferences")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return (data || []) as UserTopicPreference[];
    },
    enabled: !!user,
  });

  // ─── Fetch blocked tags ─────────────────────────────────────────────────

  const { data: blockedTags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ["user-blocked-tags", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_blocked_tags")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as BlockedTag[];
    },
    enabled: !!user,
  });

  // ─── Fetch max blocked tags from DNA_LOCK ──────────────────────────────

  const { data: maxBlockedTags = 100 } = useQuery({
    queryKey: ["dna-lock-max-blocked-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dna_lock")
        .select("parameter_value")
        .eq("parameter_key", "content_topic_max_blocked")
        .single();

      if (error) return 100;
      return parseInt(data?.parameter_value || "100", 10);
    },
  });

  // ─── Mutations ──────────────────────────────────────────────────────────

  const upsertPreferenceMutation = useMutation({
    mutationFn: async ({
      topicId,
      visibility,
    }: {
      topicId: string;
      visibility: TopicVisibility;
    }) => {
      if (!user) return;

      if (visibility === "normal") {
        // Remove the preference row (normal = default, no row needed)
        await supabase
          .from("user_topic_preferences")
          .delete()
          .eq("user_id", user.id)
          .eq("topic_id", topicId);
      } else {
        // Upsert the preference
        const { error } = await supabase
          .from("user_topic_preferences")
          .upsert(
            {
              user_id: user.id,
              topic_id: topicId,
              visibility,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,topic_id" }
          );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-topic-preferences"] });
    },
    onError: () => {
      toast({
        title: "Failed to save preference",
        description: "Could not update your topic preference. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addBlockedTagMutation = useMutation({
    mutationFn: async (tag: string) => {
      if (!user) return;
      const { error } = await supabase
        .from("user_blocked_tags")
        .insert({ user_id: user.id, tag });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-blocked-tags"] });
      toast({ title: "Tag blocked", description: "Content with this tag will be de-prioritized." });
    },
    onError: (error: any) => {
      if (error?.code === "23505") {
        toast({ title: "Already blocked", description: "This tag is already in your block list." });
      } else {
        toast({ title: "Failed to block tag", variant: "destructive" });
      }
    },
  });

  const removeBlockedTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from("user_blocked_tags")
        .delete()
        .eq("id", tagId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-blocked-tags"] });
    },
    onError: () => {
      toast({ title: "Failed to unblock tag", variant: "destructive" });
    },
  });

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleVisibilityChange = useCallback(
    (topicId: string, visibility: TopicVisibility) => {
      setSavingTopics((prev) => new Set(prev).add(topicId));
      upsertPreferenceMutation.mutate(
        { topicId, visibility },
        {
          onSettled: () => {
            setSavingTopics((prev) => {
              const next = new Set(prev);
              next.delete(topicId);
              return next;
            });
          },
        }
      );
    },
    [upsertPreferenceMutation]
  );

  const getTopicVisibility = useCallback(
    (topicId: string): TopicVisibility => {
      const pref = preferences.find((p) => p.topic_id === topicId);
      return (pref?.visibility as TopicVisibility) || "normal";
    },
    [preferences]
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // ─── Group topics by category ──────────────────────────────────────────

  const topicsByCategory = topics.reduce<Record<string, ContentTopic[]>>(
    (acc, topic) => {
      if (!acc[topic.category]) acc[topic.category] = [];
      acc[topic.category].push(topic);
      return acc;
    },
    {}
  );

  // ─── Active filter count ───────────────────────────────────────────────

  const activeFilterCount = preferences.filter(
    (p) => p.visibility !== "normal"
  ).length;

  // ─── Loading state ─────────────────────────────────────────────────────

  if (topicsLoading || prefsLoading || tagsLoading) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-violet-600 rounded-full text-white">
          <Shield className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Content Controls
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Choose what topics appear in your feeds. Your{" "}
            <Badge variant="outline" className="ml-1">
              {getRatingLabel(userRating.currentRating as RatingLevel)}
            </Badge>{" "}
            rating sets the vertical boundary — these controls let you fine-tune horizontally.
          </p>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(activeFilterCount > 0 || blockedTags.length > 0) && (
        <div className="mb-6 p-4 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-200 dark:border-violet-900">
          <div className="flex items-center gap-2 text-sm text-violet-700 dark:text-violet-300">
            <Info className="h-4 w-4" />
            <span>
              <strong>{activeFilterCount}</strong> topic filter{activeFilterCount !== 1 ? "s" : ""} active
              {blockedTags.length > 0 && (
                <>, <strong>{blockedTags.length}</strong> tag{blockedTags.length !== 1 ? "s" : ""} blocked</>
              )}
              . Content is de-prioritized, never hard-blocked — you can always find it via search.
            </span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Topic Preferences by Category */}
        {Object.entries(CATEGORY_LABELS).map(([categoryKey, categoryInfo]) => {
          const categoryTopics = topicsByCategory[categoryKey] || [];
          if (categoryTopics.length === 0) return null;
          const isExpanded = expandedCategories.has(categoryKey);

          return (
            <Card key={categoryKey}>
              <CardHeader
                className="cursor-pointer select-none"
                onClick={() => toggleCategory(categoryKey)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{categoryInfo.label}</CardTitle>
                    <CardDescription className="text-sm">
                      {categoryInfo.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Count of non-normal preferences in this category */}
                    {categoryTopics.filter(
                      (t) => getTopicVisibility(t.id) !== "normal"
                    ).length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {
                          categoryTopics.filter(
                            (t) => getTopicVisibility(t.id) !== "normal"
                          ).length
                        }{" "}
                        filtered
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="divide-y divide-border/50">
                    {categoryTopics.map((topic) => (
                      <TopicRow
                        key={topic.id}
                        topic={topic}
                        visibility={getTopicVisibility(topic.id)}
                        onVisibilityChange={handleVisibilityChange}
                        saving={savingTopics.has(topic.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        <Separator />

        {/* Blocked Tags */}
        <BlockedTagsSection
          tags={blockedTags}
          onAdd={(tag) => addBlockedTagMutation.mutate(tag)}
          onRemove={(id) => removeBlockedTagMutation.mutate(id)}
          maxTags={maxBlockedTags}
        />

        {/* Shirley Temple Policy Integration Note */}
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  Shirley Temple Policy
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Your content rating ({getRatingLabel(userRating.currentRating as RatingLevel)})
                  controls the <strong>vertical</strong> boundary — what maturity level of content
                  you can access. These Content Controls add a <strong>horizontal</strong> layer
                  — letting you tune which <em>topics</em> appear, regardless of rating level.
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
                  All filtering de-prioritizes content in feeds. Nothing is ever truly
                  hard-blocked — you can always find it via direct search. This is by design:
                  we filter, we don't censor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
