import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileCheck, Clock, Award, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function PrototypingContracts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("available");

  const { data: availableContracts } = useQuery({
    queryKey: ["prototyping-contracts-available"],
    queryFn: async () => {
      const { data: assets } = await supabase
        .from("lb_asset_library")
        .select("*")
        .eq("requires_prototyping", true)
        .lt("prototype_slots_filled", "prototype_slots_total" as any)
        .eq("status", "active");

      return assets;
    }
  });

  const { data: myContracts } = useQuery({
    queryKey: ["my-prototyping-contracts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("asset_prototyping_contracts")
        .select(`
          *,
          asset:lb_asset_library(asset_name, creator_name, thumbnail_url)
        `)
        .eq("contractor_id", user.id)
        .order("created_at", { ascending: false });

      return data;
    },
    enabled: !!user
  });

  const claimContractMutation = useMutation({
    mutationFn: async ({ assetId, slotNumber }: { assetId: string; slotNumber: number }) => {
      if (!user) throw new Error("Must be logged in");

      // Check how many slots are taken
      const { data: existingContracts } = await supabase
        .from("asset_prototyping_contracts")
        .select("slot_number")
        .eq("asset_id", assetId)
        .in("status", ["active", "submitted"]);

      const nextSlot = (existingContracts?.length || 0) + 1;

      if (nextSlot > 3) {
        throw new Error("All slots filled");
      }

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 14); // 2 weeks

      const { error } = await supabase
        .from("asset_prototyping_contracts")
        .insert({
          asset_id: assetId,
          contractor_id: user.id,
          slot_number: nextSlot,
          deadline: deadline.toISOString(),
          is_backup: nextSlot === 3
        });

      if (error) throw error;

      // Update asset slots filled
      await supabase
        .from("lb_asset_library")
        .update({ prototype_slots_filled: nextSlot })
        .eq("id", assetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prototyping-contracts-available"] });
      queryClient.invalidateQueries({ queryKey: ["my-prototyping-contracts"] });
      toast({ title: "Contract claimed! Check deadline and requirements." });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to claim contract",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const submitProofMutation = useMutation({
    mutationFn: async ({ contractId, proofUrls, feedback }: any) => {
      const { error } = await supabase
        .from("asset_prototyping_contracts")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
          proof_urls: proofUrls,
          feedback
        })
        .eq("id", contractId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-prototyping-contracts"] });
      toast({ title: "Prototype proof submitted for review!" });
    }
  });

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prototyping Contracts</h1>
        <p className="text-muted-foreground">
          Pick up constant contracts to prototype designs, earn credits & reputation
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="available">
            Available Contracts ({availableContracts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="my-contracts">
            My Contracts ({myContracts?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableContracts?.map((asset: any) => (
              <Card key={asset.id}>
                {asset.thumbnail_url && (
                  <div className="aspect-video bg-muted">
                    <img
                      src={asset.thumbnail_url}
                      alt={asset.asset_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{asset.asset_name}</CardTitle>
                  <CardDescription>by {asset.creator_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="secondary">
                      Slots: {asset.prototype_slots_filled}/{asset.prototype_slots_total}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      10 credits
                    </span>
                  </div>

                  {asset.prototype_requirements && (
                    <div>
                      <p className="text-sm font-medium mb-2">Requirements:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                        {asset.prototype_requirements.steps?.map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => claimContractMutation.mutate({
                      assetId: asset.id,
                      slotNumber: asset.prototype_slots_filled + 1
                    })}
                    disabled={!user}
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Claim Contract
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-contracts" className="space-y-4">
          <div className="grid gap-4">
            {myContracts?.map((contract: any) => (
              <Card key={contract.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{(contract.asset as any)?.asset_name}</CardTitle>
                      <CardDescription>
                        Slot {contract.slot_number} {contract.is_backup && "(Backup)"}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        contract.status === "completed" ? "default" :
                        contract.status === "expired" ? "destructive" :
                        "secondary"
                      }
                    >
                      {contract.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Deadline: {new Date(contract.deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {contract.credits_reward} credits
                    </span>
                  </div>

                  {contract.status === "active" && (
                    <Button
                      onClick={() => {
                        // In real implementation, would open upload dialog
                        const mockProofUrls = ["proof1.jpg", "proof2.jpg"];
                        submitProofMutation.mutate({
                          contractId: contract.id,
                          proofUrls: mockProofUrls,
                          feedback: "Completed prototype testing"
                        });
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Proof
                    </Button>
                  )}

                  {contract.is_backup && contract.status === "active" && (
                    <p className="text-sm text-muted-foreground">
                      As backup, you'll receive {contract.backup_compensation_credits} credits even if not called upon.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
