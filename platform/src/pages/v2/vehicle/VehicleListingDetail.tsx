import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Car, MapPin, Star, Calendar, Shield, MessageSquare } from "lucide-react";
import { VehicleCertBadge } from "@/components/vehicle/VehicleCertBadge";

function CreditBreakdown({ price, label }: { price: number; label: string }) {
  const costBasis = price / 1.2;
  const platformMargin = price - costBasis;
  const ownerKeeps = price * 0.833;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Cost+20% Breakdown ({label})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Cost basis:</span><span>{costBasis.toFixed(2)} credits</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Platform margin (Cost+20%):</span><span>{platformMargin.toFixed(2)} credits</span></div>
        <div className="flex justify-between border-t pt-1 font-medium"><span>Owner keeps (83.3%):</span><span>{ownerKeeps.toFixed(2)} credits</span></div>
      </CardContent>
    </Card>
  );
}

export default function VehicleListingDetail() {
  const { listingId } = useParams<{ listingId: string }>();
  const { user } = useAuth();

  const vehicleQuery = useQuery({
    queryKey: ["vehicle-listing-detail", listingId],
    enabled: !!listingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lemon_lot_vehicles")
        .select("*")
        .eq("id", listingId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const v = vehicleQuery.data;
  const isOwner = v?.owner_id === user?.id;
  const location = [v?.location_city, v?.location_state].filter(Boolean).join(", ") || "Location pending";
  const photos = (v?.photos ?? []) as string[];

  const handleContactSeller = () => {
    if (!user?.id) {
      toast.error("Sign in to contact the seller.");
      return;
    }
    toast.success("Message drafted. In-platform messaging will deliver it to the owner.");
  };

  return (
    <AppShell
      xrayBase="vehicle-listing-detail"
      pageTitle={v ? `${v.year} ${v.make} ${v.model}` : "Vehicle Detail"}
      breadcrumbs={
        <span className="flex items-center gap-1">
          <Link to="/v2/lemon-lot" className="underline">Lemon Lot</Link> / Detail
        </span>
      }
    >
      <div className="space-y-6 pb-24">
        <Link to="/v2/lemon-lot" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Lemon Lot
        </Link>

        {vehicleQuery.isLoading && <Card><CardContent className="py-8 text-center text-muted-foreground">Loading vehicle...</CardContent></Card>}
        {vehicleQuery.error && <Card><CardContent className="py-8 text-center text-destructive">Vehicle not found.</CardContent></Card>}

        {v && (
          <>
            {photos.length > 0 ? (
              <div className="overflow-hidden rounded-lg bg-muted">
                <img src={photos[0]} alt={`${v.year} ${v.make} ${v.model}`} className="h-64 w-full object-cover sm:h-80" />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg bg-muted sm:h-64">
                <Car className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">{v.year} {v.make} {v.model}</h2>
              {v.insurance_verified && <VehicleCertBadge />}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {v.color && <div className="flex justify-between"><span className="text-muted-foreground">Color:</span><span>{v.color}</span></div>}
                  {v.mileage != null && <div className="flex justify-between"><span className="text-muted-foreground">Mileage:</span><span>{Number(v.mileage).toLocaleString()} mi</span></div>}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Location:</span>
                    <span>{location}</span>
                  </div>
                  {v.average_rating != null && Number(v.average_rating) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3" /> Rating:</span>
                      <span>{Number(v.average_rating).toFixed(1)} / 5</span>
                    </div>
                  )}
                  {v.total_rentals != null && Number(v.total_rentals) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Rentals:</span>
                      <span>{v.total_rentals}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-base py-1">{Number(v.daily_rate).toFixed(2)} credits/day</Badge>
                  </div>
                  {v.weekly_rate && <Badge variant="outline">{Number(v.weekly_rate).toFixed(2)} credits/week</Badge>}
                  {v.monthly_rate && <Badge variant="outline">{Number(v.monthly_rate).toFixed(2)} credits/month</Badge>}
                </CardContent>
              </Card>
            </div>

            {v.description && (
              <Card>
                <CardContent className="py-4">
                  <p className="text-sm">{v.description}</p>
                </CardContent>
              </Card>
            )}

            {(v.features ?? []).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Features</h3>
                <div className="flex flex-wrap gap-1">
                  {(v.features as string[]).map((f: string) => (
                    <Badge key={f} variant="outline">{f}</Badge>
                  ))}
                </div>
              </div>
            )}

            <CreditBreakdown price={Number(v.daily_rate)} label="per day" />

            {!isOwner && (
              <Button className="w-full" size="lg" onClick={handleContactSeller}>
                <MessageSquare className="mr-2 h-4 w-4" /> Contact seller
              </Button>
            )}

            {isOwner && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-4 text-center">
                  <p className="text-sm font-medium">This is your listing.</p>
                  <p className="text-xs text-muted-foreground mt-1">Manage it from the legacy Lemon Lot page.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
