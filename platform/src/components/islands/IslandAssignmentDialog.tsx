import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface IslandAssignmentDialogProps {
  islandId: string;
  islandName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IslandAssignmentDialog = ({
  islandId,
  islandName,
  open,
  onOpenChange
}: IslandAssignmentDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: `Island Design: ${islandName}`,
    description: "",
    assignmentType: "full_island" as "full_island" | "section" | "asset_creation" | "consultation",
    compensationModel: "fixed_price" as "fixed_price" | "hourly" | "milestone",
    amount: "",
    estimatedHours: "",
    deliveryTimeline: ""
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // First create a contract opportunity
      const { data: opportunity, error: opportunityError } = await supabase
        .from("contract_opportunities" as any)
        .insert({
          title: data.title,
          description: data.description,
          compensation_model: data.compensationModel,
          total_credits: parseFloat(data.amount) || 0,
          status: "open"
        })
        .select()
        .single();

      if (opportunityError || !opportunity) throw opportunityError || new Error("Failed to create opportunity");

      // Then link it to the island
      const { error: linkError } = await supabase
        .from("island_assignments" as any)
        .insert({
          island_id: islandId,
          contract_opportunity_id: (opportunity as any).id,
          assignment_type: data.assignmentType,
          estimated_hours: parseFloat(data.estimatedHours) || null,
          delivery_timeline_days: parseFloat(data.deliveryTimeline) || null
        });

      if (linkError) throw linkError;

      return opportunity;
    },
    onSuccess: () => {
      toast({
        title: "Assignment Created!",
        description: "Your island design assignment has been posted."
      });
      queryClient.invalidateQueries({ queryKey: ["island-assignments"] });
      onOpenChange(false);
      setFormData({
        title: `Island Design: ${islandName}`,
        description: "",
        assignmentType: "full_island",
        compensationModel: "fixed_price",
        amount: "",
        estimatedHours: "",
        deliveryTimeline: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create assignment",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAssignmentMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Island Design Assignment</DialogTitle>
          <DialogDescription>
            Post a commission for designers to build or enhance your island.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you need designed or built..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignmentType">Assignment Type</Label>
              <Select
                value={formData.assignmentType}
                onValueChange={(value: any) => setFormData({ ...formData, assignmentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_island">Full Island Design</SelectItem>
                  <SelectItem value="section">Specific Section</SelectItem>
                  <SelectItem value="asset_creation">Asset Creation</SelectItem>
                  <SelectItem value="consultation">Design Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compensationModel">Compensation Model</Label>
              <Select
                value={formData.compensationModel}
                onValueChange={(value: any) => setFormData({ ...formData, compensationModel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_price">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="milestone">Milestone-Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Credits</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Est. Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryTimeline">Timeline (days)</Label>
              <Input
                id="deliveryTimeline"
                type="number"
                value={formData.deliveryTimeline}
                onChange={(e) => setFormData({ ...formData, deliveryTimeline: e.target.value })}
                placeholder="14"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAssignmentMutation.isPending}>
              {createAssignmentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Post Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
