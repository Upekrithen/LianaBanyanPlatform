import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Download, DollarSign, Users, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const POSITION_CATEGORIES = [
  { value: "create_idea" as const, label: "Ideation & Creation" },
  { value: "define_describe_document" as const, label: "Documentation" },
  { value: "research_development" as const, label: "Research & Development" },
  { value: "prototype" as const, label: "Prototyping & Engineering" },
  { value: "legal_services" as const, label: "Legal Services" },
  { value: "logistics_blockchain" as const, label: "Logistics & Blockchain" },
  { value: "steward_owner" as const, label: "Stewardship & Leadership" },
  { value: "marketing_services" as const, label: "Marketing & Sales" },
  { value: "accounting_services" as const, label: "Accounting & Finance" },
  { value: "hr_staffing" as const, label: "HR & Staffing" },
  { value: "materials_sourcing" as const, label: "Materials & Sourcing" },
  { value: "manufacture_assembly" as const, label: "Manufacturing & Assembly" },
  { value: "kickstarter_campaign" as const, label: "Crowdfunding Campaign" },
  { value: "it_services" as const, label: "IT Services" },
  { value: "delivery" as const, label: "Delivery & Distribution" }
];

export default function LBAssetLibrary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: assets, isLoading } = useQuery({
    queryKey: ["lb-asset-library", selectedCategory, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("lb_asset_library")
        .select("*")
        .in("status", ["approved", "active"])
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory as any);
      }

      if (searchTerm) {
        query = query.ilike("asset_name", `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const downloadAssetMutation = useMutation({
    mutationFn: async ({ assetId, downloadType, fee }: { assetId: string; downloadType: string; fee: number }) => {
      // First check if user has enough credits (if fee > 0)
      if (fee > 0) {
        const { data: credits } = await supabase
          .from("user_credits")
          .select("total_credits, used_credits")
          .eq("user_id", user?.id)
          .single();

        if (!credits || (credits.total_credits - credits.used_credits) < fee) {
          throw new Error("Insufficient credits");
        }

        // Deduct credits
        await supabase
          .from("user_credits")
          .update({ used_credits: credits.used_credits + fee })
          .eq("user_id", user?.id);
      }

      // Log download for IP tracking
      const { error: downloadError } = await supabase
        .from("asset_downloads")
        .insert({
          asset_id: assetId,
          user_id: user?.id,
          download_type: downloadType,
          fee_paid: fee
        });

      if (downloadError) throw downloadError;

      // Update asset stats
      const { error: updateError } = await supabase.rpc(
        "increment_asset_downloads" as any,
        { asset_id: assetId, fee_amount: fee }
      );

      // If function doesn't exist, do manual update
      if (updateError) {
        const { data: asset } = await supabase
          .from("lb_asset_library")
          .select("total_downloads, total_royalties_earned")
          .eq("id", assetId)
          .single();

        if (asset) {
          await supabase
            .from("lb_asset_library")
            .update({
              total_downloads: asset.total_downloads + 1,
              total_royalties_earned: asset.total_royalties_earned + fee
            })
            .eq("id", assetId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lb-asset-library"] });
      queryClient.invalidateQueries({ queryKey: ["user-credits"] });
      toast({ title: "Asset downloaded! IP transaction logged." });
    },
    onError: (error: any) => {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const { data: userCredits } = useQuery({
    queryKey: ["user-credits"],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_credits")
        .select("total_credits, used_credits")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user
  });

  const availableCredits = userCredits
    ? userCredits.total_credits - userCredits.used_credits
    : 0;

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LB Asset Library</h1>
          <p className="text-muted-foreground">Download designs with IP tracking & nominal fees</p>
          {user && (
            <p className="text-sm mt-2">
              Available Credits: <span className="font-bold">{availableCredits}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All Categories</TabsTrigger>
          {POSITION_CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory}>
          {isLoading ? (
            <div>Loading assets...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets?.map((asset: any) => (
                <Card key={asset.id}>
                  {asset.thumbnail_url && (
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={asset.thumbnail_url}
                        alt={asset.asset_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{asset.asset_name}</CardTitle>
                    <CardDescription>by {asset.creator_name || "Anonymous"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{asset.description}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {asset.total_downloads}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {asset.download_fee_credits} credits
                      </span>
                      {asset.requires_prototyping && (
                        <Badge variant="secondary">
                          <Users className="w-3 h-3 mr-1" />
                          Prototyping: {asset.prototype_slots_filled}/{asset.prototype_slots_total}
                        </Badge>
                      )}
                    </div>

                    {asset.is_free_for_personal && (
                      <Badge variant="outline" className="w-full justify-center">
                        <Award className="w-3 h-3 mr-1" />
                        Free for Personal Use (LB Members)
                      </Badge>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => downloadAssetMutation.mutate({
                          assetId: asset.id,
                          downloadType: "personal_use",
                          fee: asset.is_free_for_personal ? 0 : asset.download_fee_credits
                        })}
                        disabled={!user || (asset.download_fee_credits > availableCredits && !asset.is_free_for_personal)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {asset.is_free_for_personal ? "Download Free" : `Download (${asset.download_fee_credits}c)`}
                      </Button>
                      {asset.requires_prototyping && asset.prototype_slots_filled < asset.prototype_slots_total && (
                        <Button
                          variant="outline"
                          onClick={() => window.location.href = `/prototyping?asset=${asset.id}`}
                        >
                          Prototype
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
