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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, ExternalLink, Edit, Trash2, Store } from "lucide-react";

interface ExternalPlatformManagerProps {
  projectId: string;
}

const PLATFORM_TYPES = [
  { value: "etsy", label: "Etsy" },
  { value: "shopify", label: "Shopify" },
  { value: "personal_website", label: "Personal Website" },
  { value: "kickstarter", label: "Kickstarter" },
  { value: "other", label: "Other" },
];

export function ExternalPlatformManager({ projectId }: ExternalPlatformManagerProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<any>(null);
  const [formData, setFormData] = useState({
    platform_type: "etsy",
    platform_url: "",
    platform_username: "",
    badge_text: "Also Available At",
    show_on_project_page: true,
    is_active: true,
  });

  const { data: platforms, isLoading } = useQuery({
    queryKey: ["external-platforms", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_external_platforms" as any)
        .select("*")
        .eq("project_id", projectId)
        .order("display_order");
      
      if (error) throw error;
      return data as any[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("project_external_platforms" as any)
        .insert({
          ...data,
          project_id: projectId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-platforms", projectId] });
      toast.success("Platform added!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add platform", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from("project_external_platforms" as any)
        .update(data)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-platforms", projectId] });
      toast.success("Platform updated!");
      setEditingPlatform(null);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error} = await supabase
        .from("project_external_platforms" as any)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-platforms", projectId] });
      toast.success("Platform removed!");
    },
  });

  const resetForm = () => {
    setFormData({
      platform_type: "etsy",
      platform_url: "",
      platform_username: "",
      badge_text: "Also Available At",
      show_on_project_page: true,
      is_active: true,
    });
    setEditingPlatform(null);
  };

  const handleEdit = (platform: any) => {
    setEditingPlatform(platform);
    setFormData(platform);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlatform) {
      updateMutation.mutate({ id: editingPlatform.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div>Loading external platforms...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                External Platform Integration
              </CardTitle>
              <CardDescription>
                Link your Etsy, Shopify, or other sales channels. Drive traffic between platforms.
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Platform
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPlatform ? "Edit" : "Add"} External Platform</DialogTitle>
                  <DialogDescription>
                    Connect your project to existing sales channels
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform_type">Platform Type</Label>
                    <Select value={formData.platform_type} onValueChange={(value) => setFormData({ ...formData, platform_type: value })}>
                      <SelectTrigger id="platform_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORM_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform_url">Platform URL</Label>
                    <Input
                      id="platform_url"
                      type="url"
                      value={formData.platform_url}
                      onChange={(e) => setFormData({ ...formData, platform_url: e.target.value })}
                      placeholder="https://www.etsy.com/shop/yourshop"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform_username">Shop/Username (optional)</Label>
                    <Input
                      id="platform_username"
                      value={formData.platform_username}
                      onChange={(e) => setFormData({ ...formData, platform_username: e.target.value })}
                      placeholder="YourShopName"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge_text">Badge Text</Label>
                    <Input
                      id="badge_text"
                      value={formData.badge_text}
                      onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                      placeholder="Also Available At"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show_on_project_page">Show on Project Page</Label>
                    <Switch
                      id="show_on_project_page"
                      checked={formData.show_on_project_page}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_on_project_page: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Active</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>

                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
                    {editingPlatform ? "Update Platform" : "Add Platform"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {platforms && platforms.length > 0 ? (
            <div className="space-y-3">
              {platforms.map((platform) => (
                <Card key={platform.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Store className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{PLATFORM_TYPES.find(t => t.value === platform.platform_type)?.label}</span>
                          <Badge variant={platform.is_active ? "default" : "secondary"} className="text-xs">
                            {platform.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <a href={platform.platform_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                            {platform.platform_username || platform.platform_url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {platform.badge_text} • {platform.referral_count} referrals
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(platform)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteMutation.mutate(platform.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No external platforms connected yet</p>
              <p className="text-sm mt-2">Add your Etsy, Shopify, or other sales channels to drive cross-platform traffic</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategic Guidance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">💡 Integration Strategy</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Etsy =</strong> Retail channel (individual sales at retail pricing)</p>
          <p><strong>LB =</strong> Production engine (wave-based runs, IP tracking, service participation)</p>
          <p className="text-xs text-muted-foreground mt-3">
            Add "Powered by Liana Banyan" badge to your Etsy listings with QR code linking back here for bulk orders.
            LB handles manufacturing, Etsy handles retail. Best of both worlds!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
