import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, ProofStripItem, StickyMobileCTA } from "@/components/v2";
import {
  FeaturedCharters,
  FormingGuildsRail,
  GuildCard,
  GuildCardData,
  GuildCompareTool,
  GuildDetailPanel,
  GuildFilters,
  GuildJoinStakingFlow,
  GuildSearchFilters,
  GuildVsTribeExplainer,
  HarperGuildHighlight,
} from "@/components/v2/guilds";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PROOF_STRIP: ProofStripItem[] = [
  "many-to-many membership",
  "charter-based governance",
  "staked Marks",
  "elected representatives",
  "Harper Guild oversight",
];

const DEFAULT_FILTERS: GuildFilters = {
  query: "",
  discipline: "all",
  standing: "all",
};

type GuildRow = {
  id: string;
  slug: string;
  name: string;
  guild_type: string;
  description: string | null;
  quality_standards: string | null;
  rules_document: string | null;
  monthly_phase_fee: number | null;
  dues_amount: number | null;
  member_count: number | null;
  council_size: number | null;
  status: string | null;
};

function mapGuild(row: GuildRow): GuildCardData {
  const standing = String(row.status ?? "active").toLowerCase().includes("forming") ? "forming" : "active";
  const thresholdMarks = Math.max(0, Number(row.monthly_phase_fee ?? row.dues_amount ?? 25));
  const stakeMarks = Math.max(0, Math.round(thresholdMarks || 25));
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    discipline: row.guild_type || "General",
    charterFocus: row.quality_standards || row.description || "Charter focus pending publication.",
    thresholdMarks,
    stakeMarks,
    memberCount: Number(row.member_count ?? 0),
    representativeCount: Number(row.council_size ?? 0),
    standing,
    rulesDocument: row.rules_document,
  };
}

export default function GuildDirectoryV2Page() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tourTarget = useTourTarget("guilds");

  const [filters, setFilters] = useState<GuildFilters>(DEFAULT_FILTERS);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [joinTargetId, setJoinTargetId] = useState<string | null>(null);

  const guildsQuery = useQuery({
    queryKey: ["guild-directory-v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guilds" as any)
        .select("id,slug,name,guild_type,description,quality_standards,rules_document,monthly_phase_fee,dues_amount,member_count,council_size,status")
        .order("member_count", { ascending: false });
      if (error) throw error;
      return (data ?? []) as GuildRow[];
    },
  });

  const guildMembersQuery = useQuery({
    queryKey: ["guild-members-v2-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guild_members")
        .select("guild_id,id");
      if (error) return [];
      return (data ?? []) as Array<{ guild_id: string }>;
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (guild: GuildCardData) => {
      if (!user?.id) throw new Error("Please sign in.");

      const membershipInsert = await supabase.from("guild_members").insert({
        guild_id: guild.id,
        user_id: user.id,
        role: "member",
        status: "active",
      } as any);

      if (membershipInsert.error) throw membershipInsert.error;

      // Prompt requires marks_stakes; if table is absent, fallback to guild_stakes.
      const marksStakeAttempt = await supabase.from("marks_stakes" as any).insert({
        user_id: user.id,
        guild_id: guild.id,
        stake_amount: guild.stakeMarks,
        status: "active",
      });

      if (marksStakeAttempt.error) {
        const fallbackStake = await supabase.from("guild_stakes" as any).insert({
          user_id: user.id,
          guild_id: guild.id,
          stake_amount: guild.stakeMarks,
        });
        if (fallbackStake.error) throw fallbackStake.error;
      }
    },
    onSuccess: () => {
      toast.success("Guild stake recorded. As You Wish.");
      queryClient.invalidateQueries({ queryKey: ["guild-directory-v2"] });
      queryClient.invalidateQueries({ queryKey: ["guild-members-v2-count"] });
      setJoinTargetId(null);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not complete guild join stake."),
  });

  const allGuilds = useMemo(() => (guildsQuery.data ?? []).map(mapGuild), [guildsQuery.data]);

  const representativeCountByGuild = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of guildMembersQuery.data ?? []) {
      map.set(row.guild_id, (map.get(row.guild_id) ?? 0) + 1);
    }
    return map;
  }, [guildMembersQuery.data]);

  const decoratedGuilds = useMemo(
    () =>
      allGuilds.map((guild) => ({
        ...guild,
        representativeCount: guild.representativeCount > 0 ? guild.representativeCount : representativeCountByGuild.get(guild.id) ?? 0,
      })),
    [allGuilds, representativeCountByGuild],
  );

  const disciplines = useMemo(
    () => Array.from(new Set(decoratedGuilds.map((guild) => guild.discipline))).sort((a, b) => a.localeCompare(b)),
    [decoratedGuilds],
  );

  const filteredGuilds = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return decoratedGuilds.filter((guild) => {
      if (filters.discipline !== "all" && guild.discipline !== filters.discipline) return false;
      if (filters.standing !== "all" && guild.standing !== filters.standing) return false;
      if (!query) return true;
      const blob = `${guild.name} ${guild.charterFocus} ${guild.discipline}`.toLowerCase();
      return blob.includes(query);
    });
  }, [decoratedGuilds, filters]);

  const compareGuilds = useMemo(
    () => decoratedGuilds.filter((guild) => compareIds.includes(guild.id)).slice(0, 4),
    [compareIds, decoratedGuilds],
  );

  const joinTarget = useMemo(
    () => decoratedGuilds.find((guild) => guild.id === joinTargetId) ?? null,
    [decoratedGuilds, joinTargetId],
  );

  const harperGuild = useMemo(
    () => decoratedGuilds.find((guild) => guild.name.toLowerCase().includes("harper")) ?? null,
    [decoratedGuilds],
  );

  return (
    <AppShell
      xrayBase="guilds"
      pageTitle="Guild Directory"
      breadcrumbs="Member workspace / Guilds"
      hero={
        <Hero
          variant="app"
          eyebrow="Guild Directory"
          headline="Find the professional bodies that fit your work."
          body="Browse guilds by discipline, threshold, charter, and representation structure to identify where your professional contribution belongs."
          primaryCTA={{ label: "Browse guilds", href: "#guild-grid" }}
          secondaryCTA={{ label: "Compare charters", href: "#guild-compare-tool" }}
          proofStrip={PROOF_STRIP}
        />
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />

        <GuildSearchFilters filters={filters} disciplines={disciplines} onChange={setFilters} />

        <HarperGuildHighlight guild={harperGuild} />

        <section id="guild-grid" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredGuilds.map((guild) => (
            <div key={guild.id}>
              <GuildCard
                guild={guild}
                onViewCharter={(row) => {
                  if (row.rulesDocument) {
                    window.open(row.rulesDocument, "_blank", "noopener,noreferrer");
                    return;
                  }
                  setExpandedId((current) => (current === row.id ? null : row.id));
                }}
                onCompare={(row) => {
                  setCompareIds((current) => {
                    if (current.includes(row.id)) return current.filter((id) => id !== row.id);
                    return [...current, row.id].slice(-4);
                  });
                }}
                onJoin={(row) => setJoinTargetId(row.id)}
              />
              {expandedId === guild.id ? <GuildDetailPanel guild={guild} /> : null}
            </div>
          ))}
        </section>

        <GuildCompareTool
          selected={compareGuilds}
          onRemove={(guildId) => setCompareIds((current) => current.filter((id) => id !== guildId))}
        />

        <FeaturedCharters guilds={decoratedGuilds} />
        <FormingGuildsRail guilds={decoratedGuilds} />

        <GuildJoinStakingFlow
          guild={joinTarget}
          busy={joinMutation.isPending}
          onConfirm={async (guild) => {
            await joinMutation.mutateAsync(guild);
          }}
        />

        <GuildVsTribeExplainer />

        <StickyMobileCTA
          primary={{ label: "Browse guilds", href: "#guild-grid" }}
          secondary={{ label: "Compare charters", href: "#guild-compare-tool" }}
        />
      </div>
    </AppShell>
  );
}
