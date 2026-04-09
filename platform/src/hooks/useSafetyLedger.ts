import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StartTripInput {
  tripType: "rideshare" | "lemon_lot" | "local_wheels";
  tripId: string;
  passengerId?: string;
  driverPhotoUrl?: string;
  passengerPhotoUrl?: string;
  lat?: number;
  lng?: number;
}

interface EndTripInput {
  ledgerEntryId: string;
  lat?: number;
  lng?: number;
  notes?: string;
}

export function useSafetyLedger(tripType?: string, tripId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: activeEntry } = useQuery({
    queryKey: ["safety-ledger-active", tripType, tripId],
    queryFn: async () => {
      if (!tripType || !tripId || !user) return null;
      const { data, error } = await supabase
        .from("safety_ledger" as any)
        .select("*")
        .eq("trip_type", tripType)
        .eq("trip_id", tripId)
        .is("end_timestamp", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!tripType && !!tripId && !!user,
  });

  const startTrip = useMutation({
    mutationFn: async (input: StartTripInput) => {
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("safety_ledger" as any).insert({
        trip_type: input.tripType,
        trip_id: input.tripId,
        driver_id: user.id,
        passenger_id: input.passengerId || null,
        driver_photo_url: input.driverPhotoUrl || null,
        passenger_photo_url: input.passengerPhotoUrl || null,
        start_location_lat: input.lat || null,
        start_location_lng: input.lng || null,
        start_timestamp: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Trip started — safety log recorded.");
      qc.invalidateQueries({ queryKey: ["safety-ledger-active"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const endTrip = useMutation({
    mutationFn: async (input: EndTripInput) => {
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase
        .from("safety_ledger" as any)
        .update({
          end_location_lat: input.lat || null,
          end_location_lng: input.lng || null,
          end_timestamp: new Date().toISOString(),
          notes: input.notes || null,
        })
        .eq("id", input.ledgerEntryId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Trip ended — safety log updated.");
      qc.invalidateQueries({ queryKey: ["safety-ledger-active"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    activeEntry,
    startTrip,
    endTrip,
    isTripActive: !!activeEntry,
  };
}
