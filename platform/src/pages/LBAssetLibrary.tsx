import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Download, DollarSign, Tag, FileType } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from '@/components/PortalPageLayout';

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
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory as any);
      }

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const downloadAssetMutation = useMutation({
    mutationFn: async ({ assetId, fee }: { assetId: string; fee: number }) => {
      // Check credits if fee > 0
      if (fee > 0) {
        const { data: credits } = await supabase
          .from("user_credits")
          .select("total_credits, used_credits")
          .eq("user_id", user?.id)
          .single();

        if (!credits || ((credits.total_credits ?? 0) - (credits.used_credits ?? 0)) < fee) {
          throw new Error("Insufficient credits");
        }

        // Deduct credits
        await supabase
          .from("user_credits")
          .update({ used_credits: (credits.used_credits ?? 0) + fee })
          .eq("user_id", user?.id);
      }

      // Increment download count on the asset
      const { data: asset } = await supabase
        .from("lb_asset_library")
        .select("download_count")
        .eq("id", assetId)
        .single();

      if (asset) {
        await supabase
          .from("lb_asset_library")
          .update({
            download_count: (asset.download_count ?? 0) + 1
          })
          .eq("id", assetId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lb-asset-library"] });
      queryClient.invalidateQueries({ queryKey: ["user-credits"] });
      toast({ title: "Asset downloaded! Transaction logged." });
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
    ? (userCredits.total_credits ?? 0) - (userCredits.used_credits ?? 0)
    : 0;

  const isFree = (cost: number | null) => !cost || cost === 0;

  return (
    <PortalPageLayout>
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
          ) : assets?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No assets found{selectedCategory !== "all" ? " in this category" : ""}.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets?.map((asset: any) => (
                <Card key={asset.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    {asset.file_type && (
                      <CardDescription className="flex items-center gap-1">
                        <FileType className="w-3 h-3" />
                        {asset.file_type.toUpperCase()}
                        {asset.category && ` \u2022 ${asset.category}`}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {asset.description && (
                      <p className="text-sm text-muted-foreground">{asset.description}</p>
                    )}

                    {asset.tags && asset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {asset.tags.slice(0, 5).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {asset.tags.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{asset.tags.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {asset.download_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {isFree(asset.download_cost)
                          ? "Free"
                          : `${asset.download_cost} credits`}
                      </span>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => downloadAssetMutation.mutate({
                        assetId: asset.id,
                        fee: asset.download_cost ?? 0
                      })}
                      disabled={!user || (!isFree(asset.download_cost) && (asset.download_cost ?? 0) > availableCredits)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isFree(asset.download_cost)
                        ? "Download Free"
                        : `Download (${asset.download_cost}c)`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
