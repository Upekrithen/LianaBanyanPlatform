import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingDown, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface ContractScaleNegotiationManagerProps {
  projectId: string;
}

export function ContractScaleNegotiationManager({ projectId }: ContractScaleNegotiationManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    organization_type: "guild" as "guild" | "clan" | "council",
    organization_id: "",
    discount_percentage: "10",
    bulk_commitment_positions: "5",
    minimum_positions_required: "1",
    valid_until: null as Date | null,
    terms: "",
    notes: ""
  });

  // Fetch negotiations
  const { data: negotiations, isLoading } = useQuery({
    queryKey: ["contract-scale-negotiations", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_scale_negotiations")
        .select(`
          *,
          negotiated_by_profile:profiles!contract_scale_negotiations_negotiated_by_fkey(full_name, email),
          approved_by_profile:profiles!contract_scale_negotiations_approved_by_fkey(full_name, email)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch organizations for dropdown
  const { data: guilds } = useQuery({
    queryKey: ["guilds"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guilds").select("id, name, display_name");
      if (error) throw error;
      return data;
    }
  });

  const { data: clans } = useQuery({
    queryKey: ["clans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guilds").select("id, name, display_name");
      if (error) throw error;
      return data;
    }
  });

  // Create negotiation
  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("contract_scale_negotiations").insert({
        project_id: projectId,
        organization_type: formData.organization_type,
        organization_id: formData.organization_id,
        negotiated_by: user.id,
        discount_percentage: parseFloat(formData.discount_percentage),
        bulk_commitment_positions: parseInt(formData.bulk_commitment_positions),
        minimum_positions_required: parseInt(formData.minimum_positions_required),
        valid_until: formData.valid_until?.toISOString(),
        terms: formData.terms ? JSON.parse(formData.terms) : {},
        notes: formData.notes
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-scale-negotiations"] });
      toast({ title: "Negotiation created successfully" });
      setShowForm(false);
      setFormData({
        organization_type: "guild",
        organization_id: "",
        discount_percentage: "10",
        bulk_commitment_positions: "5",
        minimum_positions_required: "1",
        valid_until: null,
        terms: "",
        notes: ""
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update negotiation status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("contract_scale_negotiations")
        .update({
          status,
          approved_by: status === "approved" ? user.id : undefined
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-scale-negotiations"] });
      toast({ title: "Status updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-success" />;
      case "approved": return <CheckCircle className="h-4 w-4 text-success" />;
      case "rejected": return <XCircle className="h-4 w-4 text-destructive" />;
      case "expired": return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getOrganizationOptions = () => {
    switch (formData.organization_type) {
      case "guild":
        return guilds?.map(g => ({ value: g.id, label: g.display_name || g.name })) || [];
      case "clan":
        return clans?.map(c => ({ value: c.id, label: c.display_name || c.name })) || [];
      default:
        return [];
    }
  };

  if (isLoading) return <div>Loading negotiations...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Contract Scale Rate Negotiations
            </CardTitle>
            <CardDescription>
              Manage bulk pricing negotiations with guilds, clans, and councils
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "New Negotiation"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showForm && (
          <Card className="border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organization Type</Label>
                  <Select
                    value={formData.organization_type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, organization_type: value, organization_id: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guild">Guild</SelectItem>
                      <SelectItem value="clan">Clan</SelectItem>
                      <SelectItem value="council">Council</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Organization</Label>
                  <Select
                    value={formData.organization_id}
                    onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOrganizationOptions().map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Discount Percentage</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bulk Commitment (positions)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.bulk_commitment_positions}
                    onChange={(e) => setFormData({ ...formData, bulk_commitment_positions: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Minimum Required Positions</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.minimum_positions_required}
                    onChange={(e) => setFormData({ ...formData, minimum_positions_required: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valid Until (optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.valid_until ? format(formData.valid_until, "PPP") : "No expiration"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.valid_until || undefined}
                        onSelect={(date) => setFormData({ ...formData, valid_until: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this negotiation..."
                />
              </div>

              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Negotiation"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Negotiations List */}
        <div className="space-y-2">
          {negotiations?.map((negotiation) => (
            <Card key={negotiation.id} className="border-l-4" style={{
              borderLeftColor: negotiation.status === "active" ? "hsl(var(--success))" : "hsl(var(--muted))"
            }}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(negotiation.status)}
                      <Badge variant={negotiation.status === "active" ? "default" : "secondary"}>
                        {negotiation.organization_type}
                      </Badge>
                      <span className="font-semibold">{negotiation.discount_percentage}% Discount</span>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Bulk commitment: {negotiation.bulk_commitment_positions} positions</p>
                      <p>Minimum required: {negotiation.minimum_positions_required} positions</p>
                      {negotiation.valid_until && (
                        <p>Valid until: {format(new Date(negotiation.valid_until), "PPP")}</p>
                      )}
                      <p>Negotiated by: {negotiation.negotiated_by_profile?.full_name}</p>
                      {negotiation.approved_by_profile && (
                        <p>Approved by: {negotiation.approved_by_profile.full_name}</p>
                      )}
                      {negotiation.notes && <p className="italic">{negotiation.notes}</p>}
                    </div>
                  </div>

                  {negotiation.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateStatusMutation.mutate({ id: negotiation.id, status: "approved" })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatusMutation.mutate({ id: negotiation.id, status: "rejected" })}
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {negotiation.status === "approved" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: negotiation.id, status: "active" })}
                    >
                      Activate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
