import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useConfirmDelivery() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      confirmed,
      issueReported,
    }: {
      assignmentId: string;
      confirmed: boolean;
      issueReported?: string;
    }) => {
      if (!user) throw new Error("Must be signed in");

      const { data, error } = await supabase
        .from("delivery_confirmations")
        .upsert(
          {
            assignment_id: assignmentId,
            user_id: user.id,
            confirmed,
            issue_reported: issueReported ?? null,
          },
          { onConflict: "assignment_id,user_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      toast.success(vars.confirmed ? "Delivery confirmed!" : "Issue reported.");
      qc.invalidateQueries({ queryKey: ["captain-orders"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
