import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Palette, Type, Layout, Save } from "lucide-react";

interface ProjectThemeEditorProps {
  projectId: string;
}

export function ProjectThemeEditor({ projectId }: ProjectThemeEditorProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    primary_color: "hsl(221.2 83.2% 53.3%)",
    secondary_color: "hsl(212 95% 68%)",
    background_color: "hsl(0 0% 100%)",
    text_color: "hsl(222.2 84% 4.9%)",
    font_heading: "Inter",
    font_body: "Inter",
    logo_url: "",
    banner_url: "",
    layout_style: "modern",
    card_style: "elevated",
    custom_css: "",
  });

  const { data: theme, isLoading } = useQuery({
    queryKey: ["project-theme", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_themes" as any)
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        const themeData = data as any;
        setFormData({
          primary_color: themeData.primary_color || formData.primary_color,
          secondary_color: themeData.secondary_color || formData.secondary_color,
          background_color: themeData.background_color || formData.background_color,
          text_color: themeData.text_color || formData.text_color,
          font_heading: themeData.font_heading || formData.font_heading,
          font_body: themeData.font_body || formData.font_body,
          logo_url: themeData.logo_url || "",
          banner_url: themeData.banner_url || "",
          layout_style: themeData.layout_style || formData.layout_style,
          card_style: themeData.card_style || formData.card_style,
          custom_css: themeData.custom_css || "",
        });
      }
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = theme
        ? await supabase
            .from("project_themes" as any)
            .update(data)
            .eq("project_id", projectId)
        : await supabase
            .from("project_themes" as any)
            .insert({ ...data, project_id: projectId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-theme", projectId] });
      toast.success("Theme saved successfully!");
    },
    onError: (error) => {
      toast.error("Failed to save theme", { description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return <div>Loading theme settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Project Theme Customization
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your project page. Changes will be visible to all visitors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Colors Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color Palette
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color (HSL)</Label>
                <Input
                  id="primary_color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  placeholder="hsl(221.2 83.2% 53.3%)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary Color (HSL)</Label>
                <Input
                  id="secondary_color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  placeholder="hsl(212 95% 68%)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="background_color">Background Color (HSL)</Label>
                <Input
                  id="background_color"
                  value={formData.background_color}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  placeholder="hsl(0 0% 100%)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text_color">Text Color (HSL)</Label>
                <Input
                  id="text_color"
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  placeholder="hsl(222.2 84% 4.9%)"
                />
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Type className="h-4 w-4" />
              Typography
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="font_heading">Heading Font</Label>
                <Input
                  id="font_heading"
                  value={formData.font_heading}
                  onChange={(e) => setFormData({ ...formData, font_heading: e.target.value })}
                  placeholder="Inter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="font_body">Body Font</Label>
                <Input
                  id="font_body"
                  value={formData.font_body}
                  onChange={(e) => setFormData({ ...formData, font_body: e.target.value })}
                  placeholder="Inter"
                />
              </div>
            </div>
          </div>

          {/* Branding Assets */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Branding Assets</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner_url">Banner Image URL</Label>
                <Input
                  id="banner_url"
                  value={formData.banner_url}
                  onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Layout Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Layout Style
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="layout_style">Layout Style</Label>
                <Select value={formData.layout_style} onValueChange={(value) => setFormData({ ...formData, layout_style: value })}>
                  <SelectTrigger id="layout_style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="card_style">Card Style</Label>
                <Select value={formData.card_style} onValueChange={(value) => setFormData({ ...formData, card_style: value })}>
                  <SelectTrigger id="card_style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="elevated">Elevated</SelectItem>
                    <SelectItem value="outlined">Outlined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="space-y-2">
            <Label htmlFor="custom_css">Custom CSS (Advanced)</Label>
            <Textarea
              id="custom_css"
              value={formData.custom_css}
              onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}
              placeholder="/* Custom CSS overrides */"
              rows={6}
            />
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {mutation.isPending ? "Saving..." : "Save Theme"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
