import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Castle, Users, Building2, Globe } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function IslandCreator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const [formData, setFormData] = useState({
    island_name: "",
    island_slug: "",
    description: "",
    island_size: "medium",
    ownership_type: "solo" as const,
    visibility: "public" as const,
    curation_level: "standard" as const,
    requires_approval: true,
    auto_moderation_enabled: true,
    age_restriction: 0,
    content_rating: "E",
    theme_config: {
      architecture_style: "modern",
      color_palette: ["#3b82f6", "#8b5cf6", "#ec4899"],
      ambient_music: null,
      weather_effects: true
    }
  });

  const handleGenerateWithAI = async () => {
    if (!formData.island_name || !formData.description) {
      toast({
        title: "AI Generation",
        description: "Please provide at least a name and description for AI generation",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      toast({
        title: "🤖 AI Island Generation",
        description: "Generating island aesthetics and progression paths...",
      });

      const { data, error } = await supabase.functions.invoke('generate-island-theme', {
        body: {
          islandName: formData.island_name,
          description: formData.description,
          currentTheme: formData.theme_config,
        }
      });

      if (error) throw error;

      if (data.success && data.theme) {
        setFormData(prev => ({
          ...prev,
          theme_config: {
            architecture_style: data.theme.architecture_style,
            color_palette: data.theme.color_palette,
            ambient_music: data.theme.recommended_music_genre,
            weather_effects: data.theme.weather_effects.length > 0,
          }
        }));

        toast({
          title: "✨ AI Complete!",
          description: `Generated ${data.theme.architecture_style} theme with ${data.theme.key_landmarks.length} landmarks`,
        });
      } else {
        throw new Error(data.error || 'Failed to generate theme');
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate island theme",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate slug if not provided
      const slug = formData.island_slug || formData.island_name.toLowerCase().replace(/\s+/g, '-');

      const { data: island, error: islandError } = await supabase
        .from('custom_islands')
        .insert({
          ...formData,
          island_slug: slug,
          owner_id: user.id
        })
        .select()
        .single();

      if (islandError) throw islandError;

      // Create charter
      const { error: charterError } = await supabase
        .from('island_charters')
        .insert({
          island_id: island.id,
          last_updated_by: user.id
        });

      if (charterError) throw charterError;

      toast({
        title: "Island Created!",
        description: `Welcome to ${formData.island_name}!`,
      });

      navigate(`/islands/${slug}`);
    } catch (error) {
      console.error("Island creation error:", error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Could not create island",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalPageLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create Your Island</h1>
        <p className="text-muted-foreground">
          Build your own custom island with unique rules, projects, and portals
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Basic Information</h2>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <Switch
                  checked={useAI}
                  onCheckedChange={setUseAI}
                />
                <Label>Use AI</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="island_size">Island Size *</Label>
              <Select
                value={formData.island_size}
                onValueChange={(value) => setFormData(prev => ({ ...prev, island_size: value }))}
              >
                <SelectTrigger id="island_size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (1 hex) - Focused community</SelectItem>
                  <SelectItem value="medium">Medium (3 hexes) - Balanced starter</SelectItem>
                  <SelectItem value="large">Large (7 hexes) - Expansive space</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Choose your island size. Animal Crossing style building available after creation.
              </p>
            </div>

            <div>
              <Label htmlFor="island_name">Island Name *</Label>
              <Input
                id="island_name"
                value={formData.island_name}
                onChange={(e) => setFormData(prev => ({ ...prev, island_name: e.target.value }))}
                placeholder="Mystic Archipelago"
                required
              />
            </div>

            <div>
              <Label htmlFor="island_slug">URL Slug</Label>
              <Input
                id="island_slug"
                value={formData.island_slug}
                onChange={(e) => setFormData(prev => ({ ...prev, island_slug: e.target.value }))}
                placeholder="mystic-archipelago (auto-generated if empty)"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A mystical island where creativity and commerce meet..."
                rows={4}
                required
              />
            </div>

            {useAI && (
              <Button type="button" onClick={handleGenerateWithAI} disabled={loading} variant="outline" className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Theme with AI
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Ownership & Access</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ownership_type">Ownership Type</Label>
              <Select
                value={formData.ownership_type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, ownership_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">
                    <div className="flex items-center gap-2">
                      <Castle className="h-4 w-4" />
                      Solo (Fortress of Solitude)
                    </div>
                  </SelectItem>
                  <SelectItem value="guild">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Guild Island
                    </div>
                  </SelectItem>
                  <SelectItem value="project">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Project-Sponsored
                    </div>
                  </SelectItem>
                  <SelectItem value="community">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Community Island
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, visibility: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="members_only">Members Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="curated">Curated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="curation_level">Curation Level</Label>
              <Select
                value={formData.curation_level}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, curation_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal (Laissez-Faire)</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="strict">Strict</SelectItem>
                  <SelectItem value="exclusive">Exclusive (Yacht Club)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="requires_approval">Require Project Approval</Label>
              <Switch
                id="requires_approval"
                checked={formData.requires_approval}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_approval: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto_moderation">Auto-Moderation (AI Enforcer)</Label>
              <Switch
                id="auto_moderation"
                checked={formData.auto_moderation_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_moderation_enabled: checked }))}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Safety & Content</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="age_restriction">Minimum Age</Label>
              <Input
                id="age_restriction"
                type="number"
                value={formData.age_restriction}
                onChange={(e) => setFormData(prev => ({ ...prev, age_restriction: parseInt(e.target.value) || 0 }))}
                min={0}
                max={21}
              />
            </div>

            <div>
              <Label htmlFor="content_rating">Content Rating</Label>
              <Select
                value={formData.content_rating}
                onValueChange={(value) => setFormData(prev => ({ ...prev, content_rating: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="E">E - Everyone</SelectItem>
                  <SelectItem value="E10+">E10+ - Everyone 10+</SelectItem>
                  <SelectItem value="T">T - Teen</SelectItem>
                  <SelectItem value="M">M - Mature 17+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Creating..." : "Create Island"}
          </Button>
        </div>
      </form>
    </PortalPageLayout>
  );
}
