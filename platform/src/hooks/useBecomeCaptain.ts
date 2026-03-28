import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BecomeCaptainInput {
  marks_staked: number;
  region: string;
  city: string;
}

export function useBecomeCaptain() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: BecomeCaptainInput) => {
      if (!user) throw new Error("Must be signed in");
      if (input.marks_staked < 100) throw new Error("Minimum 100 Marks required");

      const { data, error } = await supabase
        .from("captains")
        .insert({
          user_id: user.id,
          marks_staked: input.marks_staked,
          joules_backing: Math.floor(input.marks_staked * 0.8),
          region: input.region,
          city: input.city,
          level: "captain_10",
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Welcome aboard, Captain! Your ship awaits.");
      qc.invalidateQueries({ queryKey: ["captain-profile"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
