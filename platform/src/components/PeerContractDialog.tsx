import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileSignature } from "lucide-react";

interface PeerContractDialogProps {
  recipientId: string;
  recipientName: string;
  trigger?: React.ReactNode;
}

export const PeerContractDialog = ({
  recipientId,
  recipientName,
  trigger,
}: PeerContractDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    contract_title: "",
    contract_description: "",
    compensation_type: "participation" as "participation" | "cash" | "hybrid",
    cash_amount: "",
    participation_percentage: "",
    time_commitment_days: "30",
    deliverables: "",
  });

  const queryClient = useQueryClient();

  const createContractMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const deliverables = formData.deliverables
        .split("\n")
        .filter((d) => d.trim())
        .map((d) => ({ description: d.trim() }));

      const { error } = await supabase.from("peer_member_contracts").insert({
        initiator_id: user.id,
        recipient_id: recipientId,
        contract_title: formData.contract_title,
        contract_description: formData.contract_description,
        compensation_type: formData.compensation_type,
        cash_amount: formData.cash_amount ? parseFloat(formData.cash_amount) : 0,
        participation_percentage: formData.participation_percentage
          ? parseFloat(formData.participation_percentage)
          : null,
        time_commitment_days: parseInt(formData.time_commitment_days),
        deliverables,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contract offer sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["peer-contracts"] });
      setOpen(false);
      setFormData({
        contract_title: "",
        contract_description: "",
        compensation_type: "participation",
        cash_amount: "",
        participation_percentage: "",
        time_commitment_days: "30",
        deliverables: "",
      });
    },
    onError: (error) => {
      toast.error("Failed to create contract offer");
      console.error(error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileSignature className="w-4 h-4 mr-2" />
            Propose Contract
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Peer Contract</DialogTitle>
          <DialogDescription>
            Propose a contract directly to {recipientName}. No LB approval required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Contract Title</Label>
            <Input
              id="title"
              value={formData.contract_title}
              onChange={(e) =>
                setFormData({ ...formData, contract_title: e.target.value })
              }
              placeholder="e.g., Website Design Contract"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.contract_description}
              onChange={(e) =>
                setFormData({ ...formData, contract_description: e.target.value })
              }
              placeholder="Describe the work to be done..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="compensation">Compensation Type</Label>
            <Select
              value={formData.compensation_type}
              onValueChange={(value: any) =>
                setFormData({ ...formData, compensation_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participation">Participation Only</SelectItem>
                <SelectItem value="cash">Cash Only</SelectItem>
                <SelectItem value="hybrid">Participation + Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.compensation_type === "cash" ||
            formData.compensation_type === "hybrid") && (
            <div>
              <Label htmlFor="cash">Cash Amount ($)</Label>
              <Input
                id="cash"
                type="number"
                step="0.01"
                value={formData.cash_amount}
                onChange={(e) =>
                  setFormData({ ...formData, cash_amount: e.target.value })
                }
                placeholder="0.00"
              />
            </div>
          )}

          {(formData.compensation_type === "participation" ||
            formData.compensation_type === "hybrid") && (
            <div>
              <Label htmlFor="participation">Participation Percentage (%)</Label>
              <Input
                id="participation"
                type="number"
                step="0.01"
                value={formData.participation_percentage}
                onChange={(e) =>
                  setFormData({ ...formData, participation_percentage: e.target.value })
                }
                placeholder="0.00"
              />
            </div>
          )}

          <div>
            <Label htmlFor="commitment">Time Commitment (days)</Label>
            <Select
              value={formData.time_commitment_days}
              onValueChange={(value) =>
                setFormData({ ...formData, time_commitment_days: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">1 Week</SelectItem>
                <SelectItem value="14">2 Weeks</SelectItem>
                <SelectItem value="30">1 Month</SelectItem>
                <SelectItem value="60">2 Months</SelectItem>
                <SelectItem value="90">3 Months</SelectItem>
                <SelectItem value="180">6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="deliverables">Deliverables (one per line)</Label>
            <Textarea
              id="deliverables"
              value={formData.deliverables}
              onChange={(e) =>
                setFormData({ ...formData, deliverables: e.target.value })
              }
              placeholder="Complete website design&#10;3 revision rounds&#10;Final assets delivery"
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createContractMutation.mutate()}
              disabled={
                !formData.contract_title ||
                !formData.time_commitment_days ||
                createContractMutation.isPending
              }
            >
              {createContractMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Send Contract Offer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
