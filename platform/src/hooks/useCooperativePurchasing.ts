import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CooperativePurchase {
  id: string;
  tip_id: string | null;
  initiator_id: string;
  title: string;
  description: string | null;
  store_name: string | null;
  store_location: string | null;
  unit_price_retail: number | null;
  unit_price_cooperative: number | null;
  savings_percentage: number | null;
  target_quantity: number;
  threshold_quantity: number;
  current_quantity: number;
  status: string;
  participants: Participant[];
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  member_id: string;
  quantity: number;
  joined_at: string;
}

interface StartGroupBuyOptions {
  tipId?: string;
  title: string;
  description?: string;
  storeName?: string;
  storeLocation?: string;
  unitPriceRetail?: number;
  unitPriceCooperative?: number;
  targetQuantity: number;
  thresholdQuantity?: number;
  expiresInHours?: number;
}

export function useCooperativePurchasing(filters?: { tipId?: string; status?: string[] }) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: groupBuys, isLoading } = useQuery({
    queryKey: ["cooperative-purchases", filters],
    queryFn: async () => {
      let query = supabase
        .from("cooperative_purchases" as never)
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.tipId) {
        query = query.eq("tip_id", filters.tipId);
      }
      if (filters?.status?.length) {
        query = query.in("status", filters.status);
      }

      const { data, error } = await query;
      if (error) return [];
      return (data ?? []) as CooperativePurchase[];
    },
  });

  const startGroupBuy = useMutation({
    mutationFn: async (opts: StartGroupBuyOptions) => {
      if (!user) throw new Error("Sign in to start a group buy");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (opts.expiresInHours ?? 72));

      const { data, error } = await supabase
        .from("cooperative_purchases" as never)
        .insert({
          tip_id: opts.tipId ?? null,
          initiator_id: user.id,
          title: opts.title,
          description: opts.description ?? null,
          store_name: opts.storeName ?? null,
          store_location: opts.storeLocation ?? null,
          unit_price_retail: opts.unitPriceRetail ?? null,
          unit_price_cooperative: opts.unitPriceCooperative ?? null,
          target_quantity: opts.targetQuantity,
          threshold_quantity: opts.thresholdQuantity ?? 5,
          current_quantity: 0,
          participants: [],
          expires_at: expiresAt.toISOString(),
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data as CooperativePurchase;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cooperative-purchases"] });
    },
  });

  const joinGroupBuy = useMutation({
    mutationFn: async ({ purchaseId, quantity }: { purchaseId: string; quantity: number }) => {
      if (!user) throw new Error("Sign in to join");

      const { data: current, error: fetchErr } = await supabase
        .from("cooperative_purchases" as never)
        .select("participants, current_quantity, status")
        .eq("id", purchaseId)
        .single();
      if (fetchErr) throw fetchErr;
      const row = current as CooperativePurchase;
      if (row.status !== "gathering" && row.status !== "threshold_met")
        throw new Error("This group buy is no longer accepting members");

      const participants = (row.participants ?? []) as Participant[];
      const existing = participants.find((p) => p.member_id === user.id);
      let updatedParticipants: Participant[];
      let qtyDelta: number;

      if (existing) {
        qtyDelta = quantity - existing.quantity;
        updatedParticipants = participants.map((p) =>
          p.member_id === user.id ? { ...p, quantity } : p
        );
      } else {
        qtyDelta = quantity;
        updatedParticipants = [
          ...participants,
          { member_id: user.id, quantity, joined_at: new Date().toISOString() },
        ];
      }

      const newQty = (row.current_quantity ?? 0) + qtyDelta;
      const thresholdMet = newQty >= (row as unknown as CooperativePurchase).threshold_quantity;

      const { error: updateErr } = await supabase
        .from("cooperative_purchases" as never)
        .update({
          participants: updatedParticipants,
          current_quantity: newQty,
          ...(thresholdMet && row.status === "gathering" ? { status: "threshold_met" } : {}),
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", purchaseId);
      if (updateErr) throw updateErr;

      return { newQty, thresholdMet };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cooperative-purchases"] });
    },
  });

  const leaveGroupBuy = useMutation({
    mutationFn: async (purchaseId: string) => {
      if (!user) throw new Error("Sign in");

      const { data: current, error: fetchErr } = await supabase
        .from("cooperative_purchases" as never)
        .select("participants, current_quantity, threshold_quantity")
        .eq("id", purchaseId)
        .single();
      if (fetchErr) throw fetchErr;
      const row = current as CooperativePurchase;

      const participants = (row.participants ?? []) as Participant[];
      const me = participants.find((p) => p.member_id === user.id);
      if (!me) return;

      const updatedParticipants = participants.filter((p) => p.member_id !== user.id);
      const newQty = Math.max(0, (row.current_quantity ?? 0) - me.quantity);
      const backToGathering = newQty < row.threshold_quantity;

      const { error } = await supabase
        .from("cooperative_purchases" as never)
        .update({
          participants: updatedParticipants,
          current_quantity: newQty,
          ...(backToGathering ? { status: "gathering" } : {}),
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", purchaseId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cooperative-purchases"] });
    },
  });

  const getActiveGroupBuys = useQuery({
    queryKey: ["cooperative-purchases-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cooperative_purchases" as never)
        .select("*")
        .in("status", ["gathering", "threshold_met"])
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) return [];
      return (data ?? []) as CooperativePurchase[];
    },
  });

  const getGroupBuyForTip = (tipId: string) => {
    return (groupBuys ?? []).find(
      (gb) => gb.tip_id === tipId && (gb.status === "gathering" || gb.status === "threshold_met")
    );
  };

  const myParticipation = (purchase: CooperativePurchase) => {
    if (!user) return null;
    return (purchase.participants ?? []).find((p) => p.member_id === user.id) ?? null;
  };

  return {
    groupBuys: groupBuys ?? [],
    activeGroupBuys: getActiveGroupBuys.data ?? [],
    isLoading,
    startGroupBuy,
    joinGroupBuy,
    leaveGroupBuy,
    getGroupBuyForTip,
    myParticipation,
  };
}
