import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { StaffPageLayout } from "@/components/staff/StaffPageLayout";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { StaffAccessGate } from "@/components/staff/StaffAccessGate";
import { SpiceBadge } from "@/components/SpiceBadge";
import { SpiceDropdown } from "@/components/SpiceDropdown";
import { SpiceCheckboxGroup } from "@/components/SpiceCheckboxGroup";
import { SpiceDistributionBar } from "@/components/SpiceDistributionBar";
import { type SpiceType, SPICE_RACK, isSpiceType } from "@/lib/spiceRack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 50;

type Chapter = {
  id: string;
  chapter_number: number;
  title: string;
  episode_count: number;
};

type Episode = {
  id: string;
  sequence_number: number;
  content: string;
  primary_spice: SpiceType | null;
  secondary_spices: SpiceType[] | null;
  channel: "bst" | "spoonfuls" | "skipping_stones";
  tags: string[] | null;
};

type EpisodeDraft = {
  primary_spice: SpiceType | null;
  secondary_spices: SpiceType[];
};

export default function SpiceEditorPage() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();

  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<"all" | Episode["channel"]>("all");
  const [tagFilter, setTagFilter] = useState<"all" | "tagged" | "untagged">("all");
  const [spiceFilter, setSpiceFilter] = useState<"all" | SpiceType>("all");
  const [page, setPage] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, EpisodeDraft>>({});

  const { data: chapters = [] } = useQuery({
    queryKey: ["spice-editor-chapters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crewman_chapters" as never)
        .select("id, chapter_number, title, episode_count")
        .order("chapter_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Chapter[];
    },
  });

  useEffect(() => {
    if (!selectedChapterId && chapters.length > 0) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  const { data: allEpisodes = [], isLoading: episodesLoading } = useQuery({
    queryKey: ["spice-editor-episodes", selectedChapterId, selectedChannel, tagFilter],
    enabled: !!selectedChapterId,
    queryFn: async () => {
      let query = supabase
        .from("crewman_episodes" as never)
        .select("id, sequence_number, content, primary_spice, secondary_spices, channel, tags")
        .eq("chapter_id", selectedChapterId)
        .order("sequence_number", { ascending: true });

      if (selectedChannel !== "all") query = query.eq("channel", selectedChannel);
      if (tagFilter === "tagged") query = query.not("primary_spice", "is", null);
      if (tagFilter === "untagged") query = query.is("primary_spice", null);

      const { data, error } = query as unknown as { data: Episode[] | null; error: unknown };
      if (error) throw error;
      return data ?? [];
    },
  });

  const filteredEpisodes = useMemo(() => {
    if (spiceFilter === "all") return allEpisodes;
    return allEpisodes.filter((episode) => {
      const draft = drafts[episode.id];
      const primary = draft?.primary_spice ?? episode.primary_spice;
      const secondary = draft?.secondary_spices ?? normalizeSecondary(episode.secondary_spices);
      return primary === spiceFilter || secondary.includes(spiceFilter);
    });
  }, [allEpisodes, spiceFilter, drafts]);

  useEffect(() => {
    setPage(0);
  }, [selectedChapterId, selectedChannel, tagFilter, spiceFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEpisodes.length / PAGE_SIZE));
  const pagedEpisodes = filteredEpisodes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const originalById = useMemo(() => {
    return new Map(allEpisodes.map((episode) => [episode.id, episode]));
  }, [allEpisodes]);

  const dirtyIds = useMemo(() => {
    return Object.keys(drafts).filter((id) => {
      const original = originalById.get(id);
      if (!original) return false;
      const draft = drafts[id];
      const originalSecondary = normalizeSecondary(original.secondary_spices);
      const draftSecondary = normalizeSecondary(draft.secondary_spices);
      return (
        draft.primary_spice !== original.primary_spice ||
        draftSecondary.join("|") !== originalSecondary.join("|")
      );
    });
  }, [drafts, originalById]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (dirtyIds.length === 0) return { saved: 0, failed: 0 };

      let saved = 0;
      let failed = 0;

      for (const episodeId of dirtyIds) {
        const draft = drafts[episodeId];
        if (!draft?.primary_spice) continue;

        const { error } = await supabase.functions.invoke("tag-spice", {
          body: {
            episode_id: episodeId,
            primary_spice: draft.primary_spice,
            secondary_spices: draft.secondary_spices.slice(0, 3),
          },
        });

        if (error) {
          failed += 1;
        } else {
          saved += 1;
        }
      }

      return { saved, failed };
    },
    onSuccess: ({ saved, failed }) => {
      if (saved > 0) {
        toast.success(`Saved ${saved} episode spice tags.`);
      }
      if (failed > 0) {
        toast.error(`${failed} episodes failed to save.`);
      }
      setDrafts({});
      queryClient.invalidateQueries({ queryKey: ["spice-editor-episodes"] });
    },
    onError: () => toast.error("Failed saving spice tags."),
  });

  return (
    <StaffAccessGate>
      <StaffPageLayout maxWidth="xl" xrayId="staff-spice-editor">
        <div className="space-y-6">
        <Card>
          <CardHeader>
            <StaffPageHeader
              title="Spice Editor"
              description="Review and override auto-tagged episodes by chapter."
              actions={
                <>
                <Select value={selectedChapterId} onValueChange={setSelectedChapterId}>
                  <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={chapter.id}>
                        Ch {chapter.chapter_number}: {chapter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={dirtyIds.length === 0 || saveMutation.isPending}
                >
                  Save All ({dirtyIds.length})
                </Button>
                </>
              }
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <SpiceDistributionBar
              episodes={filteredEpisodes.map((episode) => ({
                primary_spice: drafts[episode.id]?.primary_spice ?? episode.primary_spice,
              }))}
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Select
                value={spiceFilter}
                onValueChange={(value) =>
                  setSpiceFilter(value === "all" ? "all" : (value as SpiceType))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Spices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Spices</SelectItem>
                  {SPICE_RACK.map((spice) => (
                    <SelectItem key={spice.spice} value={spice.spice}>
                      {spice.emoji} {spice.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedChannel}
                onValueChange={(value) => setSelectedChannel(value as "all" | Episode["channel"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="bst">BST</SelectItem>
                  <SelectItem value="spoonfuls">Spoonfuls</SelectItem>
                  <SelectItem value="skipping_stones">Skipping Stones</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={tagFilter}
                onValueChange={(value) => setTagFilter(value as "all" | "tagged" | "untagged")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tagged/Untagged" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="tagged">Tagged</SelectItem>
                  <SelectItem value="untagged">Untagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            {episodesLoading ? (
              <p className="text-sm text-muted-foreground">Loading episodes...</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">#</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead className="w-[220px]">Primary</TableHead>
                      <TableHead>Secondary (up to 3)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedEpisodes.map((episode) => {
                      const draft = drafts[episode.id];
                      const primary = draft?.primary_spice ?? episode.primary_spice;
                      const secondary = draft?.secondary_spices ?? normalizeSecondary(episode.secondary_spices);
                      const dirty = dirtyIds.includes(episode.id);

                      return (
                        <TableRow key={episode.id} data-state={dirty ? "selected" : undefined}>
                          <TableCell className="text-xs text-muted-foreground">
                            E{episode.sequence_number}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{truncateText(episode.content, 140)}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[11px] text-muted-foreground capitalize">
                                {episode.channel}
                              </span>
                              {primary && <SpiceBadge spice={primary} showTooltip={false} />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <SpiceDropdown
                              value={primary}
                              onChange={(nextPrimary) => {
                                const nextSecondary = secondary.filter((spice) => spice !== nextPrimary);
                                setDrafts((prev) => ({
                                  ...prev,
                                  [episode.id]: {
                                    primary_spice: nextPrimary,
                                    secondary_spices: nextSecondary,
                                  },
                                }));
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <SpiceCheckboxGroup
                              primarySpice={primary}
                              selected={secondary}
                              onChange={(nextSecondary) => {
                                setDrafts((prev) => ({
                                  ...prev,
                                  [episode.id]: {
                                    primary_spice: primary,
                                    secondary_spices: nextSecondary,
                                  },
                                }));
                              }}
                              maxSecondary={3}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-muted-foreground">
                    Showing {pagedEpisodes.length} of {filteredEpisodes.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Page {Math.min(page + 1, totalPages)} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        </div>
      </StaffPageLayout>
    </StaffAccessGate>
  );
}

function normalizeSecondary(spices: SpiceType[] | null): SpiceType[] {
  if (!spices) return [];
  return spices.filter((value): value is SpiceType => isSpiceType(value));
}

function truncateText(value: string, max: number) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}...`;
}
