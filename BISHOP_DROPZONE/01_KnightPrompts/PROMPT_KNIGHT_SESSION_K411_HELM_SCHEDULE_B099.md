# Knight Prompt — K411: Helm Schedule / MoneyPenny Reminders (Phase 1)

**From:** Bishop B099
**Date:** 2026-04-11
**Spec:** `BISHOP_DROPZONE/HELM_SCHEDULE_MONEYPENNY_REMINDERS_SPEC_B099.md` — read this first
**Composes with:** #2248 Hemispheric Protocol, #2257 The Glove (MoneyPenny), #2238 TouchStone, K404b Open Water, K409 Response Playbook
**Counts as:** 1 of 3 Knight session features
**Estimated scope:** 1 migration + 2 edge functions + 1 hook + 1 component + 1 page integration + pg_cron registration

---

## Founder ask (verbatim, B098)

> "Put all that advice and timing into my Helm Schedule. So I can get email reminders about tasks — this is a MoneyPenny thing, I would think."

The Founder needs a persistent task scheduling system surfaced in his Helm Dashboard, dispatched via email reminders, that respects the Hemispheric Protocol grid for the launch wave. Crown letter follow-up reminders are the day-1 use case.

---

## Build steps

### Step 1 — Migration: `helm_tasks` schema

Create migration `platform/supabase/migrations/20260412000001_k411_helm_schedule.sql`:

```sql
-- K411 Helm Schedule / MoneyPenny Reminders (Phase 1)
-- Innovation #2248 (Hemispheric Protocol composition) + #2257 (Glove email channel)
-- Bishop B099 spec: HELM_SCHEDULE_MONEYPENNY_REMINDERS_SPEC_B099.md

CREATE TABLE IF NOT EXISTS helm_tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  fire_at TIMESTAMPTZ NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email'
    CHECK (channel IN ('email', 'sms', 'in_app', 'all')),
  priority_tier SMALLINT DEFAULT 5,
  state TEXT NOT NULL DEFAULT 'pending'
    CHECK (state IN ('pending', 'fired', 'snoozed', 'completed', 'cancelled', 'failed')),
  source_kind TEXT,
  source_ref TEXT,
  recurrence_rule TEXT,
  hemispheric_aware BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  fired_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_helm_tasks_member_state ON helm_tasks (member_id, state);
CREATE INDEX idx_helm_tasks_fire_at ON helm_tasks (fire_at) WHERE state = 'pending';

CREATE TABLE IF NOT EXISTS helm_task_dispatch_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES helm_tasks(task_id) ON DELETE CASCADE,
  dispatched_at TIMESTAMPTZ DEFAULT now(),
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  external_id TEXT
);

CREATE INDEX idx_helm_task_dispatch_log_task ON helm_task_dispatch_log (task_id);

-- Set Founder helm tasks to default hemispheric_aware = TRUE via trigger
CREATE OR REPLACE FUNCTION set_founder_hemispheric_aware()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_id = (SELECT id FROM auth.users WHERE email = 'jonathan@lianabanyan.com' LIMIT 1) THEN
    NEW.hemispheric_aware := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_helm_tasks_founder_hemispheric
BEFORE INSERT ON helm_tasks
FOR EACH ROW
EXECUTE FUNCTION set_founder_hemispheric_aware();

-- RLS
ALTER TABLE helm_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY helm_tasks_member_select ON helm_tasks FOR SELECT
  USING (auth.uid() = member_id);
CREATE POLICY helm_tasks_member_insert ON helm_tasks FOR INSERT
  WITH CHECK (auth.uid() = member_id);
CREATE POLICY helm_tasks_member_update ON helm_tasks FOR UPDATE
  USING (auth.uid() = member_id);
CREATE POLICY helm_tasks_member_delete ON helm_tasks FOR DELETE
  USING (auth.uid() = member_id);

ALTER TABLE helm_task_dispatch_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY helm_task_dispatch_log_member_select ON helm_task_dispatch_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM helm_tasks t
      WHERE t.task_id = helm_task_dispatch_log.task_id
        AND t.member_id = auth.uid()
    )
  );
```

### Step 2 — Hemispheric grid validator function

```sql
-- is_valid_hemispheric_slot(member_id, fire_at) -> BOOLEAN, NEXT_VALID_TIMESTAMPTZ
-- Phase 1: Founder's grid is hardcoded. Phase 2 will move to a member_schedule_grid table.

CREATE OR REPLACE FUNCTION is_valid_hemispheric_slot(
  p_member_id UUID,
  p_fire_at TIMESTAMPTZ
) RETURNS TABLE(is_valid BOOLEAN, next_valid TIMESTAMPTZ) AS $$
DECLARE
  v_local_time TIMESTAMPTZ;
  v_dow INT;
  v_hour INT;
  v_founder_id UUID;
BEGIN
  SELECT id INTO v_founder_id FROM auth.users WHERE email = 'jonathan@lianabanyan.com' LIMIT 1;

  -- Non-Founder members: always valid (Phase 1)
  IF p_member_id != v_founder_id THEN
    RETURN QUERY SELECT TRUE, p_fire_at;
    RETURN;
  END IF;

  -- Founder: enforce Hemispheric grid
  v_local_time := p_fire_at AT TIME ZONE 'America/Chicago';  -- TODO: move to member preference
  v_dow := EXTRACT(DOW FROM v_local_time);   -- 0=Sun, 6=Sat
  v_hour := EXTRACT(HOUR FROM v_local_time);

  -- Saturday and Sunday = family time (HARD STOP)
  IF v_dow IN (0, 6) THEN
    RETURN QUERY SELECT FALSE, date_trunc('day', v_local_time) + INTERVAL '1 day' + INTERVAL '8 hours';
    RETURN;
  END IF;

  -- Quiet hours: 10pm-6am local
  IF v_hour < 6 OR v_hour >= 22 THEN
    IF v_hour >= 22 THEN
      RETURN QUERY SELECT FALSE, date_trunc('day', v_local_time) + INTERVAL '1 day' + INTERVAL '8 hours';
    ELSE
      RETURN QUERY SELECT FALSE, date_trunc('day', v_local_time) + INTERVAL '8 hours';
    END IF;
    RETURN;
  END IF;

  -- All other slots valid in Phase 1
  RETURN QUERY SELECT TRUE, p_fire_at;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Step 3 — Edge function: `dispatch-helm-task`

Create `platform/supabase/functions/dispatch-helm-task/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { task_id } = await req.json();

  // Fetch task
  const { data: task, error: taskErr } = await supabase
    .from("helm_tasks")
    .select("*, member:auth.users(email)")
    .eq("task_id", task_id)
    .single();

  if (taskErr || !task) {
    return new Response(JSON.stringify({ error: "task not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Hemispheric check
  if (task.hemispheric_aware) {
    const { data: slot } = await supabase.rpc("is_valid_hemispheric_slot", {
      p_member_id: task.member_id,
      p_fire_at: task.fire_at,
    });
    if (slot && slot.length > 0 && !slot[0].is_valid) {
      // Reschedule
      await supabase
        .from("helm_tasks")
        .update({ fire_at: slot[0].next_valid, updated_at: new Date().toISOString() })
        .eq("task_id", task_id);
      return new Response(JSON.stringify({ rescheduled: true, next: slot[0].next_valid }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Dispatch by channel
  const channels = task.channel === "all" ? ["email", "sms", "in_app"] : [task.channel];
  const recipientEmail = task.member?.email;
  const dispatchResults = [];

  for (const ch of channels) {
    if (ch === "email" && recipientEmail) {
      const emailRes = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: recipientEmail,
            subject: `[Helm] ${task.title}`,
            template: "helm_reminder",
            data: {
              title: task.title,
              body: task.body || "",
              priority_tier: task.priority_tier,
              source_kind: task.source_kind,
              helm_link: `${Deno.env.get("APP_URL")}/helm#schedule`,
            },
          }),
        }
      );

      const emailData = await emailRes.json();
      await supabase.from("helm_task_dispatch_log").insert({
        task_id,
        channel: "email",
        recipient: recipientEmail,
        status: emailRes.ok ? "sent" : "failed",
        error_message: emailRes.ok ? null : JSON.stringify(emailData),
        external_id: emailData?.id || null,
      });
      dispatchResults.push({ channel: "email", ok: emailRes.ok });
    }

    if (ch === "in_app") {
      // Phase 1: write to a notifications table or use realtime channel
      // Stub for now; Phase 2 lights up the in-app badge
      dispatchResults.push({ channel: "in_app", ok: true, stub: true });
    }

    if (ch === "sms") {
      // Phase 2: route through #2257 Glove (send-sms-via-glove)
      dispatchResults.push({ channel: "sms", ok: false, deferred: "Phase 2" });
    }
  }

  // Mark fired
  await supabase
    .from("helm_tasks")
    .update({
      state: "fired",
      fired_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("task_id", task_id);

  return new Response(JSON.stringify({ dispatched: true, results: dispatchResults }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
```

### Step 4 — Edge function: `helm-task-dispatcher` (cron-callable)

Create `platform/supabase/functions/helm-task-dispatcher/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: pending } = await supabase
    .from("helm_tasks")
    .select("task_id")
    .eq("state", "pending")
    .lte("fire_at", new Date().toISOString())
    .limit(100);

  const results = [];
  for (const t of pending || []) {
    const res = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/dispatch-helm-task`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task_id: t.task_id }),
      }
    );
    results.push({ task_id: t.task_id, ok: res.ok });
  }

  return new Response(JSON.stringify({ count: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### Step 5 — pg_cron registration (separate migration)

```sql
-- 20260412000002_k411_helm_dispatcher_cron.sql
SELECT cron.schedule(
  'helm-task-dispatcher',
  '* * * * *',  -- every minute
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/helm-task-dispatcher',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

### Step 6 — React hook: `useHelmTasks`

Create `platform/src/hooks/useHelmTasks.ts`:

```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface HelmTask {
  task_id: string;
  title: string;
  body: string | null;
  fire_at: string;
  channel: "email" | "sms" | "in_app" | "all";
  priority_tier: number;
  state: "pending" | "fired" | "snoozed" | "completed" | "cancelled" | "failed";
  source_kind: string | null;
  source_ref: string | null;
  hemispheric_aware: boolean;
}

export function useHelmTasks(memberId: string | undefined) {
  const [tasks, setTasks] = useState<HelmTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) return;

    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("helm_tasks")
        .select("*")
        .eq("member_id", memberId)
        .in("state", ["pending", "snoozed", "fired"])
        .order("fire_at", { ascending: true });

      if (mounted && !error) {
        setTasks(data as HelmTask[]);
        setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel(`helm_tasks:${memberId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "helm_tasks", filter: `member_id=eq.${memberId}` },
        () => load()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [memberId]);

  const createTask = async (task: Partial<HelmTask> & { title: string; fire_at: string }) => {
    const { data, error } = await supabase
      .from("helm_tasks")
      .insert({ member_id: memberId, ...task })
      .select()
      .single();
    return { data, error };
  };

  const completeTask = async (task_id: string) => {
    return supabase
      .from("helm_tasks")
      .update({ state: "completed", completed_at: new Date().toISOString() })
      .eq("task_id", task_id);
  };

  const snoozeTask = async (task_id: string, hours: number) => {
    const newFireAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    return supabase
      .from("helm_tasks")
      .update({ state: "pending", fire_at: newFireAt })
      .eq("task_id", task_id);
  };

  return { tasks, loading, createTask, completeTask, snoozeTask };
}
```

### Step 7 — React component: `HelmScheduleCard.tsx`

Create `platform/src/components/helm/HelmScheduleCard.tsx`:

```typescript
import { useHelmTasks, HelmTask } from "@/hooks/useHelmTasks";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow } from "date-fns";

export function HelmScheduleCard() {
  const { user } = useAuth();
  const { tasks, loading, completeTask, snoozeTask } = useHelmTasks(user?.id);

  if (loading) return <Card><CardContent>Loading schedule…</CardContent></Card>;

  const todayTasks = tasks.filter((t) => isToday(new Date(t.fire_at)));
  const tomorrowTasks = tasks.filter((t) => isTomorrow(new Date(t.fire_at)));

  return (
    <Card className="helm-schedule-card">
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <Section title="Today" tasks={todayTasks} onComplete={completeTask} onSnooze={snoozeTask} />
        <Section title="Tomorrow" tasks={tomorrowTasks} onComplete={completeTask} onSnooze={snoozeTask} />
        {todayTasks.length + tomorrowTasks.length === 0 && (
          <p className="text-muted-foreground text-sm">No tasks scheduled for the next 48 hours.</p>
        )}
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  tasks,
  onComplete,
  onSnooze,
}: {
  title: string;
  tasks: HelmTask[];
  onComplete: (id: string) => void;
  onSnooze: (id: string, hours: number) => void;
}) {
  if (tasks.length === 0) return null;
  return (
    <div className="mb-4">
      <h4 className="font-semibold mb-2">{title}</h4>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.task_id} className="border rounded p-2 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge variant={t.priority_tier <= 1 ? "destructive" : "secondary"}>
                T{t.priority_tier}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(t.fire_at), "h:mm a")}
              </span>
              <span className="font-medium">{t.title}</span>
            </div>
            {t.body && <p className="text-sm text-muted-foreground line-clamp-1">{t.body}</p>}
            <div className="flex gap-2 mt-1">
              <Button size="sm" variant="ghost" onClick={() => onSnooze(t.task_id, 1)}>
                Snooze 1h
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onSnooze(t.task_id, 24)}>
                Snooze 1d
              </Button>
              <Button size="sm" variant="default" onClick={() => onComplete(t.task_id)}>
                Complete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Step 8 — Wire to Helm page

Add `<HelmScheduleCard />` to `platform/src/pages/helm/HelmPage.tsx` (or wherever the Helm dashboard cards are composed). Position prominently — Founder will use this card every day.

### Step 9 — K409 integration patch

In the K409 letter-send flow, after a Crown letter is dispatched, insert a `helm_tasks` row for the Founder:

```typescript
// In the post-send hook for Crown letters
const followupWindow = {
  1: 10 * 24 * 3600 * 1000,  // Tier 1: 10 days
  2: 5 * 24 * 3600 * 1000,   // Tier 2: 5 days
  3: 5 * 24 * 3600 * 1000,
  4: 3 * 24 * 3600 * 1000,
}[letter.tier] || 7 * 24 * 3600 * 1000;

await supabase.from("helm_tasks").insert({
  member_id: founderUserId,
  title: `Follow up: ${letter.recipient_name}`,
  body: `Crown letter sent ${formatDate(letter.sent_at)}. Response window closes ${formatDate(new Date(Date.now() + followupWindow))}.`,
  fire_at: new Date(Date.now() + followupWindow).toISOString(),
  channel: "email",
  priority_tier: letter.tier,
  source_kind: "crown_letter_followup",
  source_ref: letter.letter_id,
});
```

The `response_received_within` predicate from K409 should also auto-cancel the helm task when a response lands (set state to `cancelled`).

---

## Smoke tests

After deploy:

1. **Founder seed task:** Insert a test row for the Founder with `fire_at = now() + 2 minutes`, channel `email`. Wait. Confirm email arrives within 3 minutes. Confirm `state` flips to `fired`, `fired_at` is set, dispatch log row exists.

2. **Hemispheric reschedule test:** Insert a test row with `fire_at = next Saturday 10am` for the Founder. Wait until that time arrives (or fast-forward via direct dispatcher invocation). Confirm `fire_at` is rescheduled to the following Monday 8am, `state` stays `pending`.

3. **Helm UI render:** Log in as Founder, navigate to Helm. Confirm `<HelmScheduleCard />` renders with the test tasks. Click Snooze 1h on a pending task. Confirm `fire_at` updates and the row re-renders.

4. **K409 integration test:** Send a test Crown letter (any tier). Confirm a `helm_tasks` row is created with `source_kind = 'crown_letter_followup'` and `fire_at` matches the tier's follow-up window.

---

## Out of scope (Phase 2 — K412 or later)

- SMS dispatch via Glove (#2257)
- Recurring task templates with iCal RRULE builder
- Drag-rearrange in expanded view
- 7-day expanded view with hemispheric overlay
- Open Water + TouchStone source-linked task auto-creation
- Member-generalized Hemispheric grid (move out of hardcoded Founder constants)
- Mobile sync

---

## Deliverables on session close

- Migration applied (`20260412000001` and `20260412000002`)
- Two edge functions deployed
- pg_cron job registered and verified firing
- React hook + component shipped, wired to Helm page
- K409 integration patch applied
- Smoke tests 1, 2, 3, 4 all passing
- Brief deploy report at `BISHOP_DROPZONE/13_Ops_Deploy/K411_HELM_SCHEDULE_REPORT_B099.md`

---

**Counts as 1 of 3 Knight session features. Slow is smooth, smooth is fast. Roll.**
