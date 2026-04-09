import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import {
  CategoryFilterBar,
  MapListToggle,
  MyTribesRail,
  NearbyTribesSidebar,
  StartTribeInline,
  StartTribePayload,
  TribeCard,
  TribeCardData,
  TribeCategory,
  TribeDirectoryView,
  TribeMapView,
  TribeMapPoint,
} from "@/components/v2/tribes";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type TribeRow = {
  id: string;
  name: string;
  status?: string;
  slug?: string;
  description?: string;
  tribe_type?: string;
  member_count?: number;
  latitude?: number | null;
  longitude?: number | null;
  join_type?: string | null;
};

function canonicalCategory(value: string | null | undefined): Exclude<TribeCategory, "All"> {
  const text = (value ?? "").toLowerCase();
  if (text.includes("neigh")) return "Neighborhood";
  if (text.includes("hobby")) return "Hobby";
  if (text.includes("family")) return "Family";
  return "Interest";
}

function defaultViewForCategory(category: TribeCategory): TribeDirectoryView {
  if (category === "Neighborhood") return "map";
  if (category === "Interest" || category === "Hobby") return "list";
  return "list";
}

function activityLevel(memberCount: number) {
  if (memberCount >= 40) return "Very active";
  if (memberCount >= 15) return "Active";
  if (memberCount >= 5) return "Growing";
  return "Starting up";
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}

export default function TribeDirectoryV2Page() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tourTarget = useTourTarget("tribes");

  const [category, setCategory] = useState<TribeCategory>("Neighborhood");
  const [view, setView] = useState<TribeDirectoryView>(defaultViewForCategory("Neighborhood"));

  useEffect(() => {
    setView(defaultViewForCategory(category));
  }, [category]);

  const tribesQuery = useQuery({
    queryKey: ["tribe-directory-v2"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tribes" as any).select("*").order("member_count", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TribeRow[];
    },
  });

  const myTribesQuery = useQuery({
    queryKey: ["my-tribes-v2", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("tribe_memberships" as any)
        .select("id,tribe_id,tribe:tribes(id,name,slug,tribe_type)")
        .eq("member_id", user.id)
        .eq("is_active", true);
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        tribe_id: string;
        unread_count?: number | null;
        tribe?: { id: string; name: string; slug?: string; tribe_type?: string };
      }>;
    },
    enabled: !!user?.id,
  });

  const joinMutation = useMutation({
    mutationFn: async (tribeId: string) => {
      if (!user?.id) throw new Error("Please sign in.");
      const { error } = await supabase.from("tribe_memberships" as any).insert({
        tribe_id: tribeId,
        member_id: user.id,
        role: "member",
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Joined tribe.");
      queryClient.invalidateQueries({ queryKey: ["my-tribes-v2"] });
      queryClient.invalidateQueries({ queryKey: ["tribe-directory-v2"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not join tribe."),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: StartTribePayload) => {
      if (!user?.id) throw new Error("Please sign in.");
      const slug = slugify(payload.name);
      const tribeType = payload.category.toLowerCase();
      const { data, error } = await supabase
        .from("tribes" as any)
        .insert({
          name: payload.name,
          slug,
          tribe_type: tribeType,
          description: payload.charter,
          join_type: payload.joinType.toLowerCase(),
          leader_id: user.id,
          elder_id: user.id,
          status: "active",
          is_active: true,
          ledger_section_id: `tribe-${slug}`,
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("tribe_memberships" as any).insert({
        tribe_id: data.id,
        member_id: user.id,
        role: "elder",
        is_active: true,
      });
      return data as TribeRow;
    },
    onSuccess: () => {
      toast.success("Tribe started.");
      queryClient.invalidateQueries({ queryKey: ["my-tribes-v2"] });
      queryClient.invalidateQueries({ queryKey: ["tribe-directory-v2"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not start tribe."),
  });

  const myTribeIdSet = useMemo(
    () => new Set((myTribesQuery.data ?? []).map((item) => item.tribe_id)),
    [myTribesQuery.data],
  );

  const rows: TribeCardData[] = useMemo(
    () =>
      (tribesQuery.data ?? [])
        .filter((row) => (row.status ?? "active").toLowerCase() !== "archived")
        .map((row) => {
          const rowCategory = canonicalCategory(row.tribe_type);
          const open = String(row.join_type ?? "open").toLowerCase() !== "invite-only";
          return {
            id: row.id,
            name: row.name,
            slug: row.slug ?? row.id,
            category: rowCategory,
            charterExcerpt: (row.description ?? "A personal tribe with shared rhythms and mutual help.").slice(0, 140),
            memberCount: Number(row.member_count ?? 0),
            activityLevel: activityLevel(Number(row.member_count ?? 0)),
            joinType: open ? "Open" : "Invite-only",
            geoTag: rowCategory === "Neighborhood" ? "Neighborhood" : null,
          };
        }),
    [tribesQuery.data],
  );

  const filteredRows = useMemo(
    () => rows.filter((row) => (category === "All" ? true : row.category === category)),
    [category, rows],
  );

  const mapPoints: TribeMapPoint[] = useMemo(
    () =>
      (tribesQuery.data ?? [])
        .filter((row) => {
          if (category !== "All" && category !== "Neighborhood") return false;
          return row.latitude !== null && row.latitude !== undefined && row.longitude !== null && row.longitude !== undefined;
        })
        .map((row) => ({
          id: row.id,
          name: row.name,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          category: canonicalCategory(row.tribe_type),
        })),
    [category, tribesQuery.data],
  );

  const nearbyRows = useMemo(
    () => filteredRows.filter((row) => row.geoTag).slice(0, 3),
    [filteredRows],
  );

  return (
    <AppShell
      xrayBase="tribes"
      pageTitle="Tribe Directory"
      breadcrumbs="Member workspace / Tribes"
      hero={
        <div className="space-y-4">
          <Hero
            variant="app"
            eyebrow="Tribe Directory"
            headline="Find the people you share a table, a block, or a passion with."
            body="Tribes are personal — the neighbors, families, and fellow travelers who share your life outside of work."
            primaryCTA={{ label: "Browse tribes", href: "#tribe-results" }}
            secondaryCTA={{ label: "Start a tribe", href: "#start-tribe-inline" }}
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {["Neighborhood", "Interest", "Hobby", "Family", "Tribe ≠ Guild"].map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2">
                {index > 0 ? <span aria-hidden>&middot;</span> : null}
                <span>{item}</span>
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Tribe is personal. Guild is professional.
          </p>
        </div>
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />

        <div className="flex items-center justify-between gap-3">
          <CategoryFilterBar value={category} onChange={setCategory} />
          <MapListToggle value={view} onChange={setView} />
        </div>

        <MyTribesRail
          items={(myTribesQuery.data ?? []).map((row) => ({
            id: row.tribe_id,
            name: row.tribe?.name ?? "Tribe",
            category: canonicalCategory(row.tribe?.tribe_type),
            unreadCount: Number(row.unread_count ?? 0),
          }))}
          onOpen={(tribeId) => navigate(`/tribes/${tribeId}`)}
        />

        <section id="tribe-results">
          {view === "list" ? (
            filteredRows.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredRows.map((tribe) => (
                  <TribeCard
                    key={tribe.id}
                    tribe={tribe}
                    isMember={myTribeIdSet.has(tribe.id)}
                    onOpen={(row) => navigate(`/tribes/${row.slug}`)}
                    onJoin={(row) => joinMutation.mutate(row.id)}
                    onRequest={(row) => toast.message(`Request sent to ${row.name}.`)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">No tribes in this category yet.</p>
                <Button variant="outline" className="mt-3" onClick={() => setCategory("All")}>
                  Show all
                </Button>
              </div>
            )
          ) : (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <TribeMapView points={mapPoints} onSelect={(tribeId) => navigate(`/tribes/${tribeId}`)} />
              <NearbyTribesSidebar tribes={nearbyRows} onJoin={(tribeId) => joinMutation.mutate(tribeId)} />
            </div>
          )}
        </section>

        <StartTribeInline onSubmit={(payload) => createMutation.mutateAsync(payload).then(() => undefined)} />

        <StickyMobileCTA
          primary={{ label: "Browse tribes", href: "#tribe-results" }}
          secondary={{ label: "Start a tribe", href: "#start-tribe-inline" }}
        />
      </div>
    </AppShell>
  );
}
