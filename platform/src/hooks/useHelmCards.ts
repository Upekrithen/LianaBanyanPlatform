import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface HelmCard {
  id: string;
  type: "stats" | "project" | "role" | "subscription" | "beacon";
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  frontData: Record<string, string | number>;
  backData: Record<string, string | number>;
  ctaLinks: Array<{ label: string; href: string }>;
  elbowGreaseLevel?: number;
  priority: number;
}

const ROLE_ICONS: Record<string, string> = {
  photographer: "📸",
  pearl_diver: "🐚",
  teacher: "📚",
  cook: "🍽️",
  driver: "🚗",
  builder: "🔨",
  designer: "🎨",
  captain: "⚓",
};

const BEACON_COLORS: Record<string, string> = {
  green: "🟢",
  gold: "🟡",
  red: "🔴",
  blue: "🔵",
};

function buildStatsCard(currencies: {
  marksEarned: number;
  marksBacked: number;
  joules: number;
  credits: number;
}, mapProgress: { completed: number; total: number } | null, memberSince: string | null): HelmCard {
  return {
    id: "stats",
    type: "stats",
    icon: "⚓",
    title: "Your Helm",
    subtitle: `${currencies.marksEarned} Marks earned`,
    frontData: {
      "Total Marks": currencies.marksEarned,
      "Trail Map": mapProgress ? `${mapProgress.completed}/${mapProgress.total} stops` : "Not started",
      "Member since": memberSince || "—",
    },
    backData: {
      "Marks Earned": currencies.marksEarned,
      "Marks Backed": currencies.marksBacked,
      "Joules": currencies.joules,
      "Credits": currencies.credits,
    },
    ctaLinks: [
      { label: "View Trail Map →", href: "/treasure-map" },
      { label: "View Earnings →", href: "/earnings" },
    ],
    priority: 0,
  };
}

function buildProjectCards(projects: any[]): HelmCard[] {
  return projects.map((p, i) => ({
    id: `project-${p.id}`,
    type: "project" as const,
    icon: p.category === "food" ? "🍽️" : p.category === "shopping" ? "🛍️" : "🏔️",
    title: p.title,
    subtitle: p.status === "active" ? "Active" : p.status,
    badge: p.status === "active" ? "Active" : p.status === "backed" ? "Backed" : undefined,
    frontData: {
      Status: p.status,
      Backers: p.backer_count || 0,
      Pledged: p.total_pledged || 0,
    },
    backData: {
      "Total Pledged": p.total_pledged || 0,
      Backers: p.backer_count || 0,
      Created: new Date(p.created_at).toLocaleDateString(),
    },
    ctaLinks: [
      { label: "Go to Bridge →", href: `/bridge/${p.slug}` },
      { label: "Invite Crew", href: `/bridge/${p.slug}?invite=1` },
    ],
    priority: 10 + i,
  }));
}

function buildRoleCards(marks: { amount: number; mark_type: string }[]): HelmCard[] {
  const byType = new Map<string, number>();
  for (const m of marks) {
    if (m.amount > 0) {
      const existing = byType.get(m.mark_type) || 0;
      byType.set(m.mark_type, existing + m.amount);
    }
  }

  return Array.from(byType.entries()).map(([markType, total], i) => ({
    id: `role-${markType}`,
    type: "role" as const,
    icon: ROLE_ICONS[markType] || "⭐",
    title: markType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    subtitle: `${total} Marks earned`,
    frontData: { "Marks Earned": total },
    backData: { "Total Marks": total },
    ctaLinks: [
      { label: "Find Bounties →", href: "/bounties" },
      { label: "View Earnings", href: "/earnings" },
    ],
    priority: 20 + i,
  }));
}

function buildBeaconCard(): HelmCard | null {
  try {
    const raw = localStorage.getItem("lb-beacons");
    if (!raw) return null;
    const beacons: { color: string; title: string; href: string }[] = JSON.parse(raw);
    if (!beacons.length) return null;

    const colorCounts: Record<string, number> = {};
    for (const b of beacons) {
      colorCounts[b.color] = (colorCounts[b.color] || 0) + 1;
    }

    const colorSummary = Object.entries(colorCounts)
      .map(([c, n]) => `${BEACON_COLORS[c] || "⚪"} ${n}`)
      .join("  ");

    return {
      id: "beacons",
      type: "beacon",
      icon: "🔖",
      title: "Beacons",
      subtitle: `${beacons.length} saved`,
      frontData: {
        Count: beacons.length,
        Colors: colorSummary,
        Latest: beacons[beacons.length - 1]?.title || "—",
      },
      backData: Object.fromEntries(
        beacons.slice(-5).map((b, i) => [`${i + 1}. ${b.title}`, b.color])
      ),
      ctaLinks: [
        { label: "View All Beacons →", href: "/beacons" },
      ],
      priority: 50,
    };
  } catch {
    return null;
  }
}

export function useHelmCards(): { cards: HelmCard[]; loading: boolean } {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["helm-cards", user?.id],
    queryFn: async (): Promise<HelmCard[]> => {
      if (!user) return [];

      const [
        projectsRes,
        earningsRes,
        marksRes,
        joulesRes,
        mapProgressRes,
        mapsRes,
        profileRes,
      ] = await Promise.all([
        supabase
          .from("turnkey_projects" as never)
          .select("id, title, slug, status, category, community_matched, early_adopter_filled, created_at")
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20) as { data: any[] | null; error: any },

        supabase
          .from("credit_wallets" as never)
          .select("lifetime_earned")
          .eq("user_id", user.id)
          .maybeSingle() as { data: { lifetime_earned: number } | null; error: any },

        supabase
          .from("shadow_marks_ledger" as never)
          .select("amount, mark_type")
          .eq("user_id", user.id) as { data: { amount: number; mark_type: string }[] | null; error: any },

        supabase
          .from("joule_balances" as never)
          .select("balance")
          .eq("user_id", user.id)
          .maybeSingle() as { data: { balance: number } | null; error: any },

        supabase
          .from("craft_treasure_map_progress" as never)
          .select("treasure_map_id, completed_steps, current_step")
          .eq("user_id", user.id)
          .order("last_activity", { ascending: false })
          .limit(1)
          .maybeSingle() as { data: { treasure_map_id: string; completed_steps: number[]; current_step: number } | null; error: any },

        supabase
          .from("craft_treasure_maps" as never)
          .select("id, title, steps")
          .limit(50) as { data: { id: string; title: string; steps: any[] }[] | null; error: any },

        supabase
          .from("profiles" as never)
          .select("created_at")
          .eq("id", user.id)
          .maybeSingle() as { data: { created_at: string } | null; error: any },
      ]);

      const marksEntries = marksRes.data || [];
      const marksEarned = marksEntries.filter((m) => m.amount > 0).reduce((s, m) => s + m.amount, 0);
      const marksBacked = marksEntries.filter((m) => m.mark_type === "backed").reduce((s, m) => s + Math.abs(m.amount), 0);

      let mapProgress: { completed: number; total: number } | null = null;
      if (mapProgressRes.data && mapsRes.data) {
        const activeMap = mapsRes.data.find((m) => m.id === mapProgressRes.data!.treasure_map_id);
        if (activeMap) {
          mapProgress = {
            completed: mapProgressRes.data.completed_steps?.length || 0,
            total: Array.isArray(activeMap.steps) ? activeMap.steps.length : 0,
          };
        }
      }

      const memberSince = profileRes.data?.created_at
        ? new Date(profileRes.data.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : null;

      const cards: HelmCard[] = [];

      cards.push(buildStatsCard(
        { marksEarned, marksBacked, joules: joulesRes.data?.balance || 0, credits: earningsRes.data?.lifetime_earned || 0 },
        mapProgress,
        memberSince,
      ));

      const projects = (projectsRes.data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        status: p.status,
        category: p.category,
        backer_count: p.early_adopter_filled || 0,
        total_pledged: p.community_matched || 0,
        created_at: p.created_at,
      }));
      cards.push(...buildProjectCards(projects));
      cards.push(...buildRoleCards(marksEntries));

      const beaconCard = buildBeaconCard();
      if (beaconCard) cards.push(beaconCard);

      cards.sort((a, b) => a.priority - b.priority);
      return cards;
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  return { cards: data || [], loading: isLoading };
}
