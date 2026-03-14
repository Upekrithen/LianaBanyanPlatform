import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCrownLetterInvitationId(recipientSlug: string | undefined) {
  const queryClient = useQueryClient();

  const { data: invitation, isLoading } = useQuery({
    queryKey: ["crown-letter-invitation", recipientSlug],
    queryFn: async () => {
      if (!recipientSlug) return null;
      const { data, error } = await supabase
        .from("crown_letter_invitations")
        .select("id")
        .eq("recipient_slug", recipientSlug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!recipientSlug,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!recipientSlug) throw new Error("No recipient");
      const { data, error } = await supabase
        .from("crown_letter_invitations")
        .insert({ recipient_slug: recipientSlug })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["crown-letter-invitation", recipientSlug], data);
    },
  });

  useEffect(() => {
    if (!recipientSlug || invitation != null || isLoading || createMutation.isPending || createMutation.isSuccess) return;
    createMutation.mutate();
  }, [recipientSlug, invitation, isLoading, createMutation.isPending, createMutation.isSuccess]);

  return invitation?.id ?? (createMutation.data as { id: string } | undefined)?.id ?? null;
}
