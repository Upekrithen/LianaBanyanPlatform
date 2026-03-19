import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileSignature,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

export const PeerContractList = () => {
  const queryClient = useQueryClient();

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["peer-contracts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("peer_member_contracts")
        .select(`
          *,
          initiator:initiator_id (id, email),
          recipient:recipient_id (id, email)
        `)
        .or(`initiator_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      contractId,
      status,
    }: {
      contractId: string;
      status: string;
    }) => {
      const updateData: any = { status };
      if (status === "accepted") {
        updateData.accepted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("peer_member_contracts")
        .update(updateData)
        .eq("id", contractId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contract status updated");
      queryClient.invalidateQueries({ queryKey: ["peer-contracts"] });
    },
    onError: (error) => {
      toast.error("Failed to update contract");
      console.error(error);
    },
  });

  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  if (isLoading || !userData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const userId = userData.id;

  const incomingContracts = contracts?.filter(
    (c) => c.recipient_id === userId && c.status === "pending"
  );
  const outgoingContracts = contracts?.filter(
    (c) => c.initiator_id === userId && c.status === "pending"
  );
  const activeContracts = contracts?.filter((c) => c.status === "active");
  const completedContracts = contracts?.filter((c) => c.status === "completed");

  const renderContract = (contract: any, isIncoming: boolean) => {
    const otherParty = isIncoming ? contract.initiator : contract.recipient;
    const deliverables = contract.deliverables as any[];

    return (
      <Card key={contract.id} className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{contract.contract_title}</CardTitle>
              <CardDescription>
                {isIncoming ? "From" : "To"}: {otherParty.email}
              </CardDescription>
            </div>
            <Badge
              variant={
                contract.status === "pending"
                  ? "secondary"
                  : contract.status === "active"
                  ? "default"
                  : "outline"
              }
            >
              {contract.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {contract.contract_description && (
            <p className="text-sm text-muted-foreground">
              {contract.contract_description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Compensation:</span>
              <div className="mt-1">
                {contract.compensation_type === "cash" && (
                  <span>${contract.cash_amount}</span>
                )}
                {contract.compensation_type === "participation" && (
                  <span>{contract.participation_percentage}% Participation</span>
                )}
                {contract.compensation_type === "hybrid" && (
                  <span>
                    ${contract.cash_amount} + {contract.participation_percentage}% Participation
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium">Time Commitment:</span>
              <div className="mt-1">{contract.time_commitment_days} days</div>
            </div>
          </div>

          {deliverables && deliverables.length > 0 && (
            <div>
              <span className="font-medium text-sm">Deliverables:</span>
              <ul className="mt-2 space-y-1">
                {deliverables.map((d: any, idx: number) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{d.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Created: {format(new Date(contract.created_at), "MMM d, yyyy")}
          </div>

          {isIncoming && contract.status === "pending" && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() =>
                  updateStatusMutation.mutate({
                    contractId: contract.id,
                    status: "accepted",
                  })
                }
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateStatusMutation.mutate({
                    contractId: contract.id,
                    status: "rejected",
                  })
                }
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Tabs defaultValue="incoming" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="incoming">
          <Clock className="w-4 h-4 mr-2" />
          Incoming ({incomingContracts?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="outgoing">
          <FileSignature className="w-4 h-4 mr-2" />
          Outgoing ({outgoingContracts?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="active">
          <TrendingUp className="w-4 h-4 mr-2" />
          Active ({activeContracts?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="completed">
          <CheckCircle className="w-4 h-4 mr-2" />
          Completed ({completedContracts?.length || 0})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="incoming" className="mt-4">
        {incomingContracts?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No incoming contract offers
            </CardContent>
          </Card>
        ) : (
          incomingContracts?.map((c) => renderContract(c, true))
        )}
      </TabsContent>

      <TabsContent value="outgoing" className="mt-4">
        {outgoingContracts?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No outgoing contract offers
            </CardContent>
          </Card>
        ) : (
          outgoingContracts?.map((c) => renderContract(c, false))
        )}
      </TabsContent>

      <TabsContent value="active" className="mt-4">
        {activeContracts?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No active contracts
            </CardContent>
          </Card>
        ) : (
          activeContracts?.map((c) =>
            renderContract(c, c.recipient_id === userId)
          )
        )}
      </TabsContent>

      <TabsContent value="completed" className="mt-4">
        {completedContracts?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No completed contracts
            </CardContent>
          </Card>
        ) : (
          completedContracts?.map((c) =>
            renderContract(c, c.recipient_id === userId)
          )
        )}
      </TabsContent>
    </Tabs>
  );
};
