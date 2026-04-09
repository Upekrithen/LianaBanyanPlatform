import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createViewingBeacon, type ViewingBeacon } from "@/lib/viewingBeaconService";
import type { SchedulingEntry } from "@/components/scheduling/types";

type UseSchedulingOptions = {
  onSubmitEntry?: (entry: SchedulingEntry) => Promise<{ id?: string } | void>;
  onSaved?: (result: ViewingBeacon | SchedulingEntry) => void;
};

export function useScheduling(options: UseSchedulingOptions = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const saveEntry = useCallback(
    async (entry: SchedulingEntry) => {
      if (!user) {
        throw new Error("Sign in required.");
      }

      setSaving(true);
      try {
        if (options.onSubmitEntry) {
          await options.onSubmitEntry(entry);
          options.onSaved?.(entry);
          toast({
            title: "Schedule saved",
            description: "Scheduling entry has been updated.",
          });
          return entry;
        }

        if (entry.target !== "helm-calendar") {
          options.onSaved?.(entry);
          toast({
            title: "Schedule saved",
            description: "Scheduling entry has been updated.",
          });
          return entry;
        }

        const beacon = await createViewingBeacon({
          memberId: user.id,
          contentType: toBeaconContentType(entry.contentType),
          contentId: entry.contentId,
          contentTitle: entry.contentTitle,
          contentUrl: entry.contentUrl ?? null,
          scheduledAt: entry.scheduledAt.toISOString(),
          reminderOffset: entry.reminderOffset ?? "15 minutes",
          recurrenceRule: entry.recurrenceRule ?? null,
          label: entry.label ?? null,
        });
        options.onSaved?.(beacon);
        toast({
          title: "Viewing beacon scheduled",
          description: "Saved to your Helm Calendar.",
        });
        return beacon;
      } finally {
        setSaving(false);
      }
    },
    [options, toast, user],
  );

  return { saveEntry, saving };
}

function toBeaconContentType(contentType: SchedulingEntry["contentType"]) {
  if (contentType === "distribution_post" || contentType === "cue_card") return "pudding";
  return contentType;
}
