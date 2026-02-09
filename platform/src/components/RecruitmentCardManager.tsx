import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, QrCode, Eye, MousePointerClick, Edit, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface RecruitmentCardManagerProps {
  projectId: string;
}

export function RecruitmentCardManager({ projectId }: RecruitmentCardManagerProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [formData, setFormData] = useState({
    card_name: "",
    card_slug: "",
    headline: "",
    subheadline: "",
    description: "",
    cta_text: "Learn More",
    cta_url: "",
    background_image_url: "",
    featured_image_url: "",
  });

  const { data: cards, isLoading } = useQuery({
    queryKey: ["recruitment-cards", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_recruitment_cards" as any)
        .select("*")
        .eq("project_id", projectId)
        .order("display_order");
      
      if (error) throw error;
      return data as any[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const slug = data.card_slug || data.card_name.toLowerCase().replace(/\s+/g, "-");
      const { error } = await supabase
        .from("project_recruitment_cards" as any)
        .insert({
          ...data,
          card_slug: slug,
          project_id: projectId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-cards", projectId] });
      toast.success("Recruitment card created!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create card", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from("project_recruitment_cards" as any)
        .update(data)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-cards", projectId] });
      toast.success("Card updated!");
      setEditingCard(null);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("project_recruitment_cards" as any)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-cards", projectId] });
      toast.success("Card deleted!");
    },
  });

  const resetForm = () => {
    setFormData({
      card_name: "",
      card_slug: "",
      headline: "",
      subheadline: "",
      description: "",
      cta_text: "Learn More",
      cta_url: "",
      background_image_url: "",
      featured_image_url: "",
    });
    setEditingCard(null);
  };

  const handleEdit = (card: any) => {
    setEditingCard(card);
    setFormData(card);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCard) {
      updateMutation.mutate({ id: editingCard.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getCardUrl = (slug: string) => {
    return `${window.location.origin}/recruit/${projectId}/${slug}`;
  };

  if (isLoading) {
    return <div>Loading recruitment cards...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recruitment Cards</h2>
          <p className="text-sm text-muted-foreground">Create QR-enabled landing pages for different marketing channels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCard ? "Edit" : "Create"} Recruitment Card</DialogTitle>
              <DialogDescription>
                Design a custom landing page for your project with trackable QR code
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card_name">Card Name</Label>
                  <Input
                    id="card_name"
                    value={formData.card_name}
                    onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                    placeholder="Convention Card"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card_slug">URL Slug (optional)</Label>
                  <Input
                    id="card_slug"
                    value={formData.card_slug}
                    onChange={(e) => setFormData({ ...formData, card_slug: e.target.value })}
                    placeholder="convention-card"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Join the Revolution"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subheadline">Subheadline</Label>
                <Input
                  id="subheadline"
                  value={formData.subheadline}
                  onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                  placeholder="Be part of something bigger"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the opportunity..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta_text">Button Text</Label>
                  <Input
                    id="cta_text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="Learn More"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta_url">Button URL</Label>
                  <Input
                    id="cta_url"
                    value={formData.cta_url}
                    onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                    placeholder="/projects/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_image_url">Background Image URL</Label>
                <Input
                  id="background_image_url"
                  value={formData.background_image_url}
                  onChange={(e) => setFormData({ ...formData, background_image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured_image_url">Featured Image URL</Label>
                <Input
                  id="featured_image_url"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
                {editingCard ? "Update Card" : "Create Card"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards?.map((card) => (
          <Card key={card.id}>
            <CardHeader>
              <CardTitle className="text-lg">{card.card_name}</CardTitle>
              <CardDescription>{card.headline}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center p-4 bg-white rounded">
                <QRCodeSVG value={getCardUrl(card.card_slug)} size={120} />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{card.view_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <QrCode className="h-4 w-4" />
                  <span>{card.scan_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MousePointerClick className="h-4 w-4" />
                  <span>{card.conversion_count}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant={card.is_active ? "default" : "secondary"}>
                  {card.is_active ? "Active" : "Inactive"}
                </Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(card)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => deleteMutation.mutate(card.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cards?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              No recruitment cards yet. Create your first card to start tracking!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
