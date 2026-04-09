import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import {
  CooperativePurchaseItem,
  CooperativePurchasingPanel,
  FamilyActivityFeed,
  FamilyActivityItem,
  FamilyCalendarEvent,
  FamilyFundCard,
  FamilyTask,
  LinkedFamilyMember,
  LinkedMembersRail,
  SharedFamilyCalendar,
  TaskBoard,
} from "@/components/v2/family-table";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type FamilyHubData = {
  fundAmount: number;
  fundGoal: number;
  fundContributors: string[];
  tasks: FamilyTask[];
  calendarEvents: FamilyCalendarEvent[];
  purchasing: CooperativePurchaseItem[];
  members: LinkedFamilyMember[];
  feed: FamilyActivityItem[];
};

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function normalizeTaskStatus(raw: string | null | undefined): FamilyTask["status"] {
  const status = (raw ?? "").toLowerCase();
  if (status.includes("done") || status.includes("complete")) return "done";
  if (status.includes("doing") || status.includes("progress")) return "doing";
  return "todo";
}

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateValue(...candidates: unknown[]) {
  for (const value of candidates) {
    if (!value) continue;
    const text = String(value);
    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) return text;
  }
  return null;
}

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] || value;
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

export default function FamilyTableHubV2Page() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tourTarget = useTourTarget("family-table");

  const hubQuery = useQuery({
    queryKey: ["family-table-v2-hub", user?.id],
    queryFn: async (): Promise<FamilyHubData> => {
      if (!user?.id) {
        return {
          fundAmount: 0,
          fundGoal: 0,
          fundContributors: [],
          tasks: [],
          calendarEvents: [],
          purchasing: [],
          members: [],
          feed: [],
        };
      }

      const sb = supabase as any;
      const fallback: FamilyHubData = {
        fundAmount: 0,
        fundGoal: 0,
        fundContributors: [],
        tasks: [],
        calendarEvents: [],
        purchasing: [],
        members: [],
        feed: [],
      };

      const membershipResult = await sb
        .from("family_members")
        .select("family_id, role")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (membershipResult.error || !membershipResult.data?.family_id) {
        return fallback;
      }

      const familyId = membershipResult.data.family_id as string;

      const [familyRes, membersRes, taskRes, fundRes, calendarRes] = await Promise.all([
        sb.from("families").select("*").eq("id", familyId).maybeSingle(),
        sb.from("family_members").select("*").eq("family_id", familyId).eq("is_active", true),
        sb.from("family_tasks").select("*").eq("family_id", familyId).order("created_at", { ascending: false }).limit(18),
        sb.from("family_fund_entries").select("*").eq("family_id", familyId).order("created_at", { ascending: false }).limit(40),
        sb
          .from("family_calendar_events")
          .select("*")
          .eq("family_id", familyId)
          .order("start_at", { ascending: true })
          .limit(30),
      ]);

      const membersRaw = (membersRes.data ?? []) as Array<Record<string, unknown>>;
      const userIds = unique(
        membersRaw
          .map((member) => (member.user_id ? String(member.user_id) : ""))
          .filter((value) => value.length > 0),
      );

      const xpRes =
        userIds.length > 0
          ? await sb.from("xp_scores").select("user_id,total_xp").in("user_id", userIds)
          : { data: [] as Array<{ user_id: string; total_xp: number | null }> };
      const xpByUserId = new Map<string, number>();
      for (const row of (xpRes.data ?? []) as Array<{ user_id: string; total_xp: number | null }>) {
        xpByUserId.set(row.user_id, numberValue(row.total_xp));
      }

      const members: LinkedFamilyMember[] = membersRaw.map((member) => {
        const nickname = String(member.nickname ?? "").trim();
        const fallbackName = String(member.email ?? "Member");
        const label = nickname || fallbackName;
        const avatarText = label
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.slice(0, 1).toUpperCase())
          .join("")
          .slice(0, 2);
        const role = String(member.role ?? "member");
        const userId = member.user_id ? String(member.user_id) : "";
        return {
          id: String(member.id ?? crypto.randomUUID()),
          label,
          role: titleCase(role),
          avatarText: avatarText || "FT",
          xp: userId ? xpByUserId.get(userId) ?? 0 : 0,
        };
      });

      const memberLabelById = new Map<string, string>();
      for (const member of membersRaw) {
        memberLabelById.set(String(member.id ?? ""), String(member.nickname ?? member.email ?? "Family member"));
      }

      const tasksRaw = (taskRes.data ?? []) as Array<Record<string, unknown>>;
      const tasks: FamilyTask[] = tasksRaw.map((task) => {
        const title = String(task.title ?? task.name ?? task.task ?? "Open task");
        const assigneeLabel =
          String(
            task.assignee_name ??
              task.assignee_label ??
              memberLabelById.get(String(task.assignee_member_id ?? "")) ??
              "Unassigned",
          ) || "Unassigned";
        return {
          id: String(task.id ?? `${title}-${Math.random().toString(36).slice(2)}`),
          title,
          assigneeLabel,
          status: normalizeTaskStatus(String(task.status ?? task.state ?? "todo")),
          dueAt: dateValue(task.due_date, task.due_at, task.deadline),
        };
      });

      const fundRaw = (fundRes.data ?? []) as Array<Record<string, unknown>>;
      const fundAmount = fundRaw.reduce((sum, row) => {
        const amount = numberValue(row.amount ?? row.value ?? row.delta);
        return sum + amount;
      }, 0);
      const fundContributors = unique(
        fundRaw
          .map((row) => String(row.contributor_name ?? row.member_name ?? row.note ?? ""))
          .filter((name) => name.length > 0)
          .slice(0, 6),
      );
      const familyGoal = numberValue((familyRes.data as Record<string, unknown> | null)?.fund_goal ?? 0);

      const calendarRaw = (calendarRes.data ?? []) as Array<Record<string, unknown>>;
      const calendarEvents: FamilyCalendarEvent[] = calendarRaw.map((event) => ({
        id: String(event.id ?? crypto.randomUUID()),
        title: String(event.title ?? event.name ?? "Family event"),
        startsAt: String(event.start_at ?? event.starts_at ?? event.start_time ?? new Date().toISOString()),
      }));

      const purchasing: CooperativePurchaseItem[] = tasks
        .filter((task) => {
          const text = task.title.toLowerCase();
          return text.includes("buy") || text.includes("shop") || text.includes("order") || text.includes("grocery");
        })
        .slice(0, 8)
        .map((task) => ({
          id: task.id,
          title: task.title,
          quantityLabel: "Shared buy request",
          pledgedBy: task.assigneeLabel ? [task.assigneeLabel] : [],
        }));

      const feed: FamilyActivityItem[] = [
        ...tasks.slice(0, 5).map((task) => ({
          id: `task-${task.id}`,
          timestamp: task.dueAt ?? new Date().toISOString(),
          sentence:
            task.status === "done"
              ? `${firstName(task.assigneeLabel)} completed ${task.title}.`
              : `${firstName(task.assigneeLabel)} is still open on ${task.title}.`,
        })),
        ...fundRaw.slice(0, 5).map((row, index) => {
          const amount = numberValue(row.amount ?? row.value ?? row.delta);
          const contributor = String(row.contributor_name ?? row.member_name ?? "A family member");
          return {
            id: `fund-${String(row.id ?? index)}`,
            timestamp: String(row.created_at ?? new Date().toISOString()),
            sentence: `Fund received ${amount.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })} from ${firstName(contributor)}.`,
          };
        }),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      return {
        fundAmount,
        fundGoal: familyGoal > 0 ? familyGoal : 500,
        fundContributors,
        tasks,
        calendarEvents,
        purchasing,
        members,
        feed,
      };
    },
    enabled: !!user?.id,
  });

  const data = hubQuery.data;
  const utilityStrip = useMemo(
    () => ["Shared fund", "Task board", "Weekly calendar", "Cooperative purchasing"],
    [],
  );

  return (
    <AppShell
      xrayBase="family-table"
      pageTitle="Family Table"
      breadcrumbs="Member workspace / Family Table"
      hero={
        <div className="space-y-4">
          <Hero
            variant="app"
            eyebrow="Family Table"
            headline="Run the household with everyone at the table."
            body="Shared fund, shared tasks, shared calendar, shared purchasing — all in one warm workspace where every family member has their own voice."
            primaryCTA={{ label: "Open Family Fund", href: "#family-fund-card" }}
            secondaryCTA={{ label: "Invite a family member", onClick: () => navigate("/family") }}
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {utilityStrip.map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2">
                {index > 0 ? <span aria-hidden>&middot;</span> : null}
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />

        <div className="grid gap-6 lg:grid-cols-2">
          <section id="family-fund-card">
            <FamilyFundCard
              amount={data?.fundAmount ?? 0}
              goal={data?.fundGoal ?? 500}
              contributors={data?.fundContributors ?? []}
            />
          </section>
          <TaskBoard tasks={data?.tasks ?? []} />
        </div>

        <SharedFamilyCalendar events={data?.calendarEvents ?? []} />
        <CooperativePurchasingPanel items={data?.purchasing ?? []} />
        <LinkedMembersRail members={data?.members ?? []} />
        <FamilyActivityFeed items={data?.feed ?? []} />

        <StickyMobileCTA primary={{ label: "Open Family Fund", href: "#family-fund-card" }} />
      </div>
    </AppShell>
  );
}
