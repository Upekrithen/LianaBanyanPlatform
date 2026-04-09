import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Car, Search } from "lucide-react";
import { VehicleListingCard, type VehicleListing } from "@/components/vehicle/VehicleListingCard";
import { VehicleCertBadge } from "@/components/vehicle/VehicleCertBadge";

const WILDFIRE_LISTINGS: VehicleListing[] = [
  { id: "wf-l1", year: 2019, make: "Toyota", model: "Camry", color: "Silver", dailyRate: 35, location: "Austin, TX", features: ["Bluetooth", "Backup Camera", "AC"], totalRentals: 12, certifiedByCrew: true, photos: [] },
  { id: "wf-l2", year: 2021, make: "Honda", model: "Civic", color: "Blue", dailyRate: 30, location: "Denver, CO", features: ["GPS", "AC", "Heated Seats"], totalRentals: 5, certifiedByCrew: false, photos: [] },
  { id: "wf-l3", year: 2017, make: "Ford", model: "F-150", color: "White", dailyRate: 50, location: "Portland, OR", features: ["4WD", "Tow Hitch", "Roof Rack"], totalRentals: 8, certifiedByCrew: true, photos: [] },
  { id: "wf-l4", year: 2020, make: "Tesla", model: "Model 3", color: "Red", dailyRate: 65, location: "Nashville, TN", features: ["Autopilot", "AC", "GPS", "Bluetooth"], totalRentals: 3, certifiedByCrew: true, photos: [] },
  { id: "wf-l5", year: 2018, make: "Subaru", model: "Outback", color: "Green", dailyRate: 40, location: "Boise, ID", features: ["4WD", "Roof Rack", "Heated Seats", "AC"], totalRentals: 15, certifiedByCrew: false, photos: [] },
];

function normalizeLocation(city?: string | null, state?: string | null) {
  return [city, state].filter(Boolean).join(", ") || "Location pending";
}

export default function LemonLotV2() {
  const tourTarget = useTourTarget("lemon-lot-v2");
  const { isRunning: isWildfireTour } = useWildfireRun();
  const [search, setSearch] = useState("");
  const [certFilter, setCertFilter] = useState(false);

  const listingsQuery = useQuery({
    queryKey: ["lemon-lot-v2-listings"],
    enabled: !isWildfireTour,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lemon_lot_vehicles")
        .select("id,year,make,model,color,daily_rate,location_city,location_state,owner_id,features,description,total_rentals,insurance_verified,photos")
        .eq("availability_status", "available")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const listings = useMemo<VehicleListing[]>(() => {
    if (isWildfireTour) return WILDFIRE_LISTINGS;
    return (listingsQuery.data ?? []).map((v: any) => ({
      id: v.id, year: v.year, make: v.make, model: v.model, color: v.color,
      dailyRate: Number(v.daily_rate), location: normalizeLocation(v.location_city, v.location_state),
      ownerId: v.owner_id, features: v.features ?? [], description: v.description,
      totalRentals: Number(v.total_rentals ?? 0), certifiedByCrew: v.insurance_verified === true,
      photos: v.photos ?? [],
    }));
  }, [isWildfireTour, listingsQuery.data]);

  const filtered = useMemo(() => {
    let result = listings;
    if (search) {
      const lc = search.toLowerCase();
      result = result.filter((l) =>
        `${l.year} ${l.make} ${l.model} ${l.location}`.toLowerCase().includes(lc)
      );
    }
    if (certFilter) {
      result = result.filter((l) => l.certifiedByCrew);
    }
    return result;
  }, [listings, search, certFilter]);

  const certCount = listings.filter((l) => l.certifiedByCrew).length;

  return (
    <AppShell
      xrayBase="lemon-lot-v2"
      pageTitle="Lemon Lot"
      breadcrumbs="Services / Mobility / Lemon Lot"
      hero={
        <Hero
          variant="app"
          eyebrow="Peer-to-peer vehicle sharing"
          headline="Browse, list, or rent vehicles cooperatively."
          body="Every listing shows transparent Cost+20% pricing. Crew-certified vehicles have been inspected by a local member."
          primaryCTA={{ label: "Browse listings", href: "#lemon-lot-grid" }}
          secondaryCTA={{ label: "Back to Vehicle Hub", href: "/v2/wheels" }}
          proofStrip={[`${listings.length} vehicle${listings.length === 1 ? "" : "s"}`, `${certCount} crew-certified`, "Cost+20% visible"]}
        />
      }
    >
      <div className="space-y-6 pb-24" {...tourTarget}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center" id="lemon-lot-grid">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search make, model, city..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Badge
            variant={certFilter ? "default" : "outline"}
            className="cursor-pointer w-fit"
            onClick={() => setCertFilter(!certFilter)}
          >
            <VehicleCertBadge label={certFilter ? "Certified only ✓" : "Show certified only"} className="bg-transparent text-inherit hover:bg-transparent p-0" />
          </Badge>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <Car className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No vehicles match your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing) => (
              <VehicleListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        <StickyMobileCTA
          primary={{ label: "Vehicle Hub", href: "/v2/wheels" }}
          secondary={{ label: "Rideshare Routes", href: "/v2/rideshare" }}
        />
      </div>
    </AppShell>
  );
}
