import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, ExternalLink, Edit, Trash2, TrendingUp, Users, DollarSign } from "lucide-react";

const COLLABORATOR_TYPES = [
  { value: "manufacturer", label: "Manufacturer", icon: "🏭", examples: "Slant3D, FormLabs, TeleportPod" },
  { value: "content_creator", label: "Content Creator", icon: "🎥", examples: "CNC Kitchen, MakersMuse, TeachingTech" },
  { value: "platform_partner", label: "Platform Partner", icon: "🏪", examples: "Etsy, Shopify" },
  { value: "service_provider", label: "Service Provider", icon: "🛠️", examples: "Other B2B services" },
];

const COMPENSATION_TYPES = [
  { value: "participation", label: "Participation Only", description: "Long-term cooperative membership" },
  { value: "revenue_share", label: "Revenue Share Only", description: "% of revenue generated" },
  { value: "hybrid", label: "Hybrid", description: "Participation + Revenue share" },
];

const METRIC_BASIS = [
  { value: "clickthrough", label: "Clickthrough", description: "Track clicks to LB" },
  { value: "conversion", label: "Conversion", description: "Track signups" },
  { value: "revenue", label: "Revenue", description: "Track purchases" },
  { value: "hybrid", label: "Hybrid", description: "All metrics combined" },
];

export function ExternalCollaboratorManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<any>(null);
  const [formData, setFormData] = useState({
    collaborator_name: "",
    collaborator_type: "manufacturer",
    collaborator_contact_email: "",
    collaborator_website: "",
    compensation_type: "participation",
    participation_percentage: 1.0,
    service_credit_percentage: 0,
    metric_basis: "hybrid",
    minimum_monthly_referrals: 10,
    participation_milestone_months: 12,
    status: "pending",
    notes: "",
  });

  const { data: collaborators, isLoading } = useQuery({
    queryKey: ["external-collaborators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("external_collaborator_agreements" as any)
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("external_collaborator_agreements" as any)
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-collaborators"] });
      toast.success("Collaborator agreement created!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create agreement", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from("external_collaborator_agreements" as any)
        .update(data)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-collaborators"] });
      toast.success("Agreement updated!");
      setEditingCollaborator(null);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("external_collaborator_agreements" as any)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-collaborators"] });
      toast.success("Agreement terminated!");
    },
  });

  const resetForm = () => {
    setFormData({
      collaborator_name: "",
      collaborator_type: "manufacturer",
      collaborator_contact_email: "",
      collaborator_website: "",
      compensation_type: "participation",
      participation_percentage: 1.0,
      service_credit_percentage: 0,
      metric_basis: "hybrid",
      minimum_monthly_referrals: 10,
      participation_milestone_months: 12,
      status: "pending",
      notes: "",
    });
    setEditingCollaborator(null);
  };

  const handleEdit = (collaborator: any) => {
    setEditingCollaborator(collaborator);
    setFormData(collaborator);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCollaborator) {
      updateMutation.mutate({ id: editingCollaborator.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div>Loading collaborator agreements...</div>;
  }

  const activeCollaborators = collaborators?.filter(c => c.status === 'active') || [];
  const pendingCollaborators = collaborators?.filter(c => c.status === 'pending') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                External Collaborator Agreements
              </CardTitle>
              <CardDescription>
                Manage participation and revenue-sharing with manufacturers, content creators, and platform partners
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Agreement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCollaborator ? "Edit" : "Create"} Collaborator Agreement</DialogTitle>
                  <DialogDescription>
                    Set up participation or revenue-sharing terms with external partners
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collaborator_name">Collaborator Name</Label>
                      <Input
                        id="collaborator_name"
                        value={formData.collaborator_name}
                        onChange={(e) => setFormData({ ...formData, collaborator_name: e.target.value })}
                        placeholder="Slant3D"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="collaborator_type">Type</Label>
                      <Select value={formData.collaborator_type} onValueChange={(value) => setFormData({ ...formData, collaborator_type: value })}>
                        <SelectTrigger id="collaborator_type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COLLABORATOR_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collaborator_contact_email">Contact Email</Label>
                      <Input
                        id="collaborator_contact_email"
                        type="email"
                        value={formData.collaborator_contact_email}
                        onChange={(e) => setFormData({ ...formData, collaborator_contact_email: e.target.value })}
                        placeholder="partner@slant3d.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="collaborator_website">Website</Label>
                      <Input
                        id="collaborator_website"
                        type="url"
                        value={formData.collaborator_website}
                        onChange={(e) => setFormData({ ...formData, collaborator_website: e.target.value })}
                        placeholder="https://slant3d.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compensation_type">Compensation Type</Label>
                    <Select value={formData.compensation_type} onValueChange={(value) => setFormData({ ...formData, compensation_type: value })}>
                      <SelectTrigger id="compensation_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPENSATION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{type.label}</span>
                              <span className="text-xs text-muted-foreground">{type.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {(/* TODO(SEC-RENAME): DB enum */ formData.compensation_type === 'equity' || formData.compensation_type === 'hybrid') && (
                      <div className="space-y-2">
                        <Label htmlFor="participation_percentage">Participation % (max 5%)</Label>
                        <Input
                          id="participation_percentage"
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={formData.participation_percentage}
                          onChange={(e) => setFormData({ ...formData, participation_percentage: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                    )}
                    {(formData.compensation_type === 'revenue_share' || formData.compensation_type === 'hybrid') && (
                      <div className="space-y-2">
                        <Label htmlFor="service_credit_percentage">Revenue Share %</Label>
                        <Input
                          id="service_credit_percentage"
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          value={formData.service_credit_percentage}
                          onChange={(e) => setFormData({ ...formData, service_credit_percentage: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metric_basis">Metric Basis</Label>
                    <Select value={formData.metric_basis} onValueChange={(value) => setFormData({ ...formData, metric_basis: value })}>
                      <SelectTrigger id="metric_basis">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {METRIC_BASIS.map((metric) => (
                          <SelectItem key={metric.value} value={metric.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{metric.label}</span>
                              <span className="text-xs text-muted-foreground">{metric.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minimum_monthly_referrals">Min Monthly Referrals</Label>
                      <Input
                        id="minimum_monthly_referrals"
                        type="number"
                        min="0"
                        value={formData.minimum_monthly_referrals}
                        onChange={(e) => setFormData({ ...formData, minimum_monthly_referrals: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="participation_milestone_months">Vesting Period (months)</Label>
                      <Input
                        id="participation_milestone_months"
                        type="number"
                        min="1"
                        max="48"
                        value={formData.participation_milestone_months}
                        onChange={(e) => setFormData({ ...formData, participation_milestone_months: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional terms, special conditions..."
                    />
                  </div>

                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
                    {editingCollaborator ? "Update Agreement" : "Create Agreement"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for Active/Pending */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active ({activeCollaborators.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCollaborators.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeCollaborators.length > 0 ? (
            activeCollaborators.map((collab) => (
              <Card key={collab.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {COLLABORATOR_TYPES.find(t => t.value === collab.collaborator_type)?.icon}
                        </span>
                        <div>
                          <h3 className="font-semibold text-lg">{collab.collaborator_name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{collab.collaborator_type.replace('_', ' ')}</p>
                        </div>
                        {collab.collaborator_website && (
                          <a href={collab.collaborator_website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Referrals</p>
                            <p className="font-medium">{collab.total_referrals}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Conversions</p>
                            <p className="font-medium">{collab.total_conversions}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                            <p className="font-medium">${collab.total_revenue_generated?.toLocaleString() || 0}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {collab.participation_percentage > 0 && (
                          <Badge variant="secondary">
                            {collab.participation_percentage}% Participation ({collab.participation_vested}% vested)
                          </Badge>
                        )}
                        {collab.service_credit_percentage > 0 && (
                          <Badge variant="secondary">
                            {collab.service_credit_percentage}% Revenue Share
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {collab.metric_basis}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(collab)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteMutation.mutate(collab.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active collaborator agreements yet</p>
                <p className="text-sm mt-2">Create agreements with manufacturers, content creators, and platform partners</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingCollaborators.length > 0 ? (
            pendingCollaborators.map((collab) => (
              <Card key={collab.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {COLLABORATOR_TYPES.find(t => t.value === collab.collaborator_type)?.icon}
                        </span>
                        <div>
                          <h3 className="font-semibold">{collab.collaborator_name}</h3>
                          <p className="text-sm text-muted-foreground">{collab.collaborator_contact_email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{collab.compensation_type}</Badge>
                        <Badge variant="outline">Awaiting approval</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(collab)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteMutation.mutate(collab.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                <p>No pending agreements</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Strategic Guidance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">💡 Integration Strategy</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div>
            <p className="font-medium">Manufacturers (Slant3D, FormLabs, TeleportPod)</p>
            <p className="text-xs text-muted-foreground">Participation: 0.5-2% vested over 12-24 months | Metric: Clickthrough → Project pledges</p>
          </div>
          <div>
            <p className="font-medium">Content Creators (CNC Kitchen, MakersMuse, TeachingTech)</p>
            <p className="text-xs text-muted-foreground">Participation: 0.25-0.75% + sponsorship fees | Metric: Viewers → Signups → Projects</p>
          </div>
          <div>
            <p className="font-medium">Platform Partners (Etsy, Shopify)</p>
            <p className="text-xs text-muted-foreground">Revenue share: 3-5% of cross-platform revenue | Metric: Referral conversions</p>
          </div>
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
            <strong>Why Participation &gt; Discount Codes:</strong> Cooperative participation aligns long-term incentives, prevents value leakage,
            and rewards actual conversions instead of just link sharing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
