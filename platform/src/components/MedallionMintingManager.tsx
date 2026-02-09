import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Coins } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MedallionMintingManagerProps {
  projectId: string;
}

export function MedallionMintingManager({ projectId }: MedallionMintingManagerProps) {
  const [contractAddress, setContractAddress] = useState("");
  const [network, setNetwork] = useState<"base" | "base-sepolia">("base-sepolia");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get eligible users count
  const { data: eligibleUsers, isLoading } = useQuery({
    queryKey: ["medallion-eligibility", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medallion_eligibility")
        .select("*")
        .eq("project_id", projectId)
        .eq("is_eligible", true)
        .eq("medallion_minted", false)
        .not("wallet_address", "is", null);

      if (error) throw error;
      return data;
    },
  });

  // Get gas budget
  const { data: gasInfo } = useQuery({
    queryKey: ["lb-funding-pool"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lb_funding_pool")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const mintMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mint-medallions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            contractAddress,
            network,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Medallions Minted!",
        description: `Successfully minted ${data.mintedCount} medallions. Gas cost: $${data.gasCostUSD.toFixed(2)}`,
      });
      queryClient.invalidateQueries({ queryKey: ["medallion-eligibility"] });
      queryClient.invalidateQueries({ queryKey: ["blockchain-gas-costs"] });
    },
    onError: (error) => {
      toast({
        title: "Minting Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const availableGasBudget = gasInfo
    ? (gasInfo.total_pool_amount * gasInfo.gas_budget_percentage / 100) - gasInfo.allocated_to_gas
    : 0;

  const estimatedGasCost = (eligibleUsers?.length || 0) * 0.02; // ~$0.02 per mint

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Medallion Minting Manager
        </CardTitle>
        <CardDescription>
          Batch mint medallion NFTs to eligible users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Alert>
              <AlertDescription>
                <div className="space-y-1 text-sm">
                  <p><strong>Eligible Users:</strong> {eligibleUsers?.length || 0}</p>
                  <p><strong>Available Gas Budget:</strong> ${availableGasBudget.toFixed(2)}</p>
                  <p><strong>Estimated Cost:</strong> ${estimatedGasCost.toFixed(2)}</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="contract-address">Contract Address</Label>
              <Input
                id="contract-address"
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Select value={network} onValueChange={(v) => setNetwork(v as any)}>
                <SelectTrigger id="network">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base-sepolia">Base Sepolia (Testnet)</SelectItem>
                  <SelectItem value="base">Base Mainnet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => mintMutation.mutate()}
              disabled={
                !contractAddress ||
                !eligibleUsers?.length ||
                mintMutation.isPending ||
                estimatedGasCost > availableGasBudget
              }
              className="w-full"
            >
              {mintMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mint {eligibleUsers?.length || 0} Medallions
            </Button>

            {estimatedGasCost > availableGasBudget && (
              <Alert variant="destructive">
                <AlertDescription>
                  Insufficient gas budget. Estimated cost exceeds available budget.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
