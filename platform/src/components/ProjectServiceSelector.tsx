import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ExternalLink, Plus, Trash2, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectServiceSelectorProps {
  projectId: string;
}

export function ProjectServiceSelector({ projectId }: ProjectServiceSelectorProps) {
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectionNotes, setSelectionNotes] = useState("");

  // Fetch service categories
  const { data: categories } = useQuery({
    queryKey: ["service-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("category_name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch service providers
  const { data: providers } = useQuery({
    queryKey: ["service-providers", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("category_id", selectedCategoryId)
        .eq("is_active", true)
        .order("provider_name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCategoryId,
  });

  // Fetch selected services for this project
  const { data: selectedServices } = useQuery({
    queryKey: ["project-selected-services", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_selected_services")
        .select(`
          *,
          service_provider:service_providers(
            *,
            category:service_categories(*)
          ),
          assigned_position:contract_position_templates(
            position_title
          )
        `)
        .eq("project_id", projectId);
      if (error) throw error;
      return data;
    },
  });

  // Fetch available contract positions
  const { data: positions } = useQuery({
    queryKey: ["contract-positions", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_position_templates")
        .select("*")
        .eq("project_id", projectId)
        .eq("is_active", true)
        .order("position_title");
      if (error) throw error;
      return data;
    },
  });

  // Add service mutation
  const addServiceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProviderId) {
        throw new Error("Please select a service provider");
      }

      const { error } = await supabase
        .from("project_selected_services")
        .insert({
          project_id: projectId,
          service_provider_id: selectedProviderId,
          selection_notes: selectionNotes || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-selected-services", projectId] });
      setSelectedProviderId("");
      setSelectionNotes("");
      toast.success("Service added to project");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add service");
    },
  });

  // Remove service mutation
  const removeServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from("project_selected_services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-selected-services", projectId] });
      toast.success("Service removed from project");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove service");
    },
  });

  // Assign position mutation
  const assignPositionMutation = useMutation({
    mutationFn: async ({ serviceId, positionId }: { serviceId: string; positionId: string | null }) => {
      const { error } = await supabase
        .from("project_selected_services")
        .update({ assigned_position_id: positionId })
        .eq("id", serviceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-selected-services", projectId] });
      toast.success("Position assigned to service");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign position");
    },
  });

  // Group selected services by category
  const groupedServices = selectedServices?.reduce((acc, service) => {
    const categoryName = service.service_provider?.category?.category_name || "Uncategorized";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(service);
    return acc;
  }, {} as Record<string, typeof selectedServices>);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="selected" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="selected">Selected Services</TabsTrigger>
          <TabsTrigger value="add">Add Services</TabsTrigger>
        </TabsList>

        <TabsContent value="selected" className="space-y-4">
          {!selectedServices || selectedServices.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No services selected yet. Add services to manage them and assign Stewards.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedServices || {}).map(([categoryName, services]) => (
                <Card key={categoryName}>
                  <CardHeader>
                    <CardTitle className="text-lg">{categoryName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {services.map((service: any) => (
                      <div
                        key={service.id}
                        className="flex items-start justify-between gap-4 p-4 border rounded-lg"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <h4 className="font-semibold">
                                {service.service_provider?.provider_name}
                              </h4>
                              {service.service_provider?.website_url && (
                                <a
                                  href={service.service_provider.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                                >
                                  Visit website <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {service.service_provider?.provider_description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {service.service_provider.provider_description}
                                </p>
                              )}
                              {service.selection_notes && (
                                <p className="text-sm mt-2">
                                  <strong>Notes:</strong> {service.selection_notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Assign to Position:</span>
                            <Select
                              value={service.assigned_position_id || "none"}
                              onValueChange={(value) =>
                                assignPositionMutation.mutate({
                                  serviceId: service.id,
                                  positionId: value === "none" ? null : value,
                                })
                              }
                            >
                              <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="No position assigned" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No position assigned</SelectItem>
                                {positions?.map((position) => (
                                  <SelectItem key={position.id} value={position.id}>
                                    {position.position_title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {service.assigned_position && (
                              <Badge variant="secondary">
                                {service.assigned_position.position_title}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeServiceMutation.mutate(service.id)}
                          disabled={removeServiceMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Service Provider</CardTitle>
              <CardDescription>
                Select a service category and provider to add to your project. You can assign a Steward position to manage this service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Category</label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategoryId && categories && (
                  <p className="text-sm text-muted-foreground">
                    {categories.find((c) => c.id === selectedCategoryId)?.category_description}
                  </p>
                )}
              </div>

              {selectedCategoryId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Provider</label>
                  <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers?.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.provider_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProviderId && providers && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {providers.find((p) => p.id === selectedProviderId)?.provider_description}
                      </p>
                      {providers.find((p) => p.id === selectedProviderId)?.website_url && (
                        <a
                          href={providers.find((p) => p.id === selectedProviderId)?.website_url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Visit website <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes about why you selected this service or specific requirements..."
                  value={selectionNotes}
                  onChange={(e) => setSelectionNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={() => addServiceMutation.mutate()}
                disabled={!selectedProviderId || addServiceMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service to Project
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
