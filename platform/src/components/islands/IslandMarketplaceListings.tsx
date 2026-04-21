import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Users, DollarSign } from "lucide-react";

interface IslandMarketplaceListingsProps {
  islandId: string;
}

export const IslandMarketplaceListings = ({ islandId }: IslandMarketplaceListingsProps) => {
  const { data: listings, isLoading } = useQuery({
    queryKey: ["island-listings", islandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("island_marketplace_listings")
        .select("*")
        .eq("island_id", islandId)
        .eq("status", "active")
        .order("total_views", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: metrics } = useQuery({
    queryKey: ["island-metrics", islandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("island_exposure_metrics")
        .select("*")
        .eq("island_id", islandId)
        .order("metric_date", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      aquatic_beach: "🏖️",
      family_services: "👶",
      influencer_creator: "⭐",
      general_business: "🏪",
      other: "💼",
    };
    return icons[category] || "💼";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      aquatic_beach: "Aquatic & Beach",
      family_services: "Family Services",
      influencer_creator: "Influencer & Creator",
      general_business: "General Business",
      other: "Other",
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return <div>Loading marketplace...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Island Exposure Stats */}
      {metrics && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <h3 className="text-xl font-bold mb-4">Island Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <Users className="w-6 h-6 mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{metrics.monthly_visitors || 0}</div>
              <div className="text-xs text-muted-foreground">Monthly Visitors</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <TrendingUp className="w-6 h-6 mb-2 text-green-600" />
              <div className="text-2xl font-bold">{metrics.proximity_score?.toFixed(1) || "0.0"}</div>
              <div className="text-xs text-muted-foreground">Proximity Score</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <DollarSign className="w-6 h-6 mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{metrics.total_marketplace_revenue || 0}</div>
              <div className="text-xs text-muted-foreground">Revenue Generated</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <ExternalLink className="w-6 h-6 mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{metrics.conversion_rate?.toFixed(1) || "0.0"}%</div>
              <div className="text-xs text-muted-foreground">Conversion Rate</div>
            </div>
          </div>
        </Card>
      )}

      {/* Active Listings */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Active Business Listings</h3>
        {!listings || listings.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No active listings yet. Be the first to claim your space!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing: any) => (
              <Card key={listing.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(listing.business_category)}</span>
                    <Badge variant="secondary">{getCategoryLabel(listing.business_category)}</Badge>
                  </div>
                  <Badge variant={listing.listing_type === "rental" ? "default" : "outline"}>
                    {listing.listing_type === "rental" ? "For Rent" : "For Sale"}
                  </Badge>
                </div>

                <h4 className="font-bold text-lg mb-2">{listing.business_name}</h4>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {listing.business_description || "No description provided"}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold">{listing.price_credits} credits</span>
                  </div>
                  {listing.rental_period_days && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Period:</span>
                      <span>{Math.floor(listing.rental_period_days / 30)} months</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Views:</span>
                    <span>{listing.total_views || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Clicks:</span>
                    <span>{listing.total_clicks || 0}</span>
                  </div>
                </div>

                {listing.listing_url && (
                  <Button asChild className="w-full" size="sm">
                    <a href={listing.listing_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Business
                    </a>
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
