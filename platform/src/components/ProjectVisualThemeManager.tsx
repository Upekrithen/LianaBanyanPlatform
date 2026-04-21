import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SingleImageUpload from '@/components/SingleImageUpload';
import { toast } from 'sonner';
import { Loader2, Save, RefreshCw } from 'lucide-react';

interface ProjectVisualThemeManagerProps {
  projectId: string;
}

interface StageIcon {
  stage: string;
  icon_url: string | null;
  display_name: string;
}

interface ThemeColors {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_pattern: string | null;
}

export function ProjectVisualThemeManager({ projectId }: ProjectVisualThemeManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stageIcons, setStageIcons] = useState<StageIcon[]>([
    { stage: 'germination', icon_url: null, display_name: 'Germination (Idea)' },
    { stage: 'seed', icon_url: null, display_name: 'Seed (Design)' },
    { stage: 'sprout', icon_url: null, display_name: 'Sprout (Illustration)' },
    { stage: 'seedling', icon_url: null, display_name: 'Seedling (Prototype)' },
    { stage: 'plant_no_flowers', icon_url: null, display_name: 'Plant (Marketing)' },
    { stage: 'plant_with_flowers', icon_url: null, display_name: 'Plant (Manufacturing)' },
    { stage: 'plant_with_fruit', icon_url: null, display_name: 'Plant (Delivery)' },
  ]);
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    primary_color: '#10b981',
    secondary_color: '#059669',
    accent_color: '#34d399',
    background_pattern: null,
  });

  useEffect(() => {
    loadThemeData();
  }, [projectId]);

  const loadThemeData = async () => {
    try {
      setLoading(true);

      // Load custom stage icons
      const { data: iconData } = await supabase
        .from('project_lifecycle_theme_icons')
        .select('*')
        .eq('project_id', projectId);

      if (iconData && iconData.length > 0) {
        setStageIcons(prev => prev.map(stage => {
          const customIcon = iconData.find(icon => icon.stage === stage.stage);
          return customIcon ? { ...stage, icon_url: customIcon.icon_url } : stage;
        }));
      }

      // Load theme colors
      const { data: colorData } = await supabase
        .from('project_visual_themes')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (colorData) {
        setThemeColors({
          primary_color: colorData.primary_color || '#10b981',
          secondary_color: colorData.secondary_color || '#059669',
          accent_color: colorData.accent_color || '#34d399',
          background_pattern: colorData.background_pattern,
        });
      }
    } catch (error) {
      console.error('Error loading theme data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIconUpload = async (stage: string, url: string) => {
    setStageIcons(prev => prev.map(s =>
      s.stage === stage ? { ...s, icon_url: url } : s
    ));
  };

  const handleSaveTheme = async () => {
    try {
      setSaving(true);

      // Save stage icons
      for (const stage of stageIcons) {
        if (stage.icon_url) {
          await supabase
            .from('project_lifecycle_theme_icons')
            .upsert({
              project_id: projectId,
              stage: stage.stage,
              icon_url: stage.icon_url,
            }, {
              onConflict: 'project_id,stage'
            });
        }
      }

      // Save theme colors
      await supabase
        .from('project_visual_themes')
        .upsert({
          project_id: projectId,
          ...themeColors,
        }, {
          onConflict: 'project_id'
        });

      toast.success('Visual theme saved successfully!');
    } catch (error) {
      console.error('Error saving theme:', error);
      toast.error('Failed to save visual theme');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    try {
      setSaving(true);

      // Delete custom icons
      await supabase
        .from('project_lifecycle_theme_icons')
        .delete()
        .eq('project_id', projectId);

      // Delete custom colors
      await supabase
        .from('project_visual_themes')
        .delete()
        .eq('project_id', projectId);

      // Reset local state
      setStageIcons(prev => prev.map(s => ({ ...s, icon_url: null })));
      setThemeColors({
        primary_color: '#10b981',
        secondary_color: '#059669',
        accent_color: '#34d399',
        background_pattern: null,
      });

      toast.success('Reset to default theme');
    } catch (error) {
      console.error('Error resetting theme:', error);
      toast.error('Failed to reset theme');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual Theme Customization</CardTitle>
        <CardDescription>
          Customize the icons, colors, and visual elements for this project.
          Upload custom line drawings (like Banyan tree stages) to replace default icons.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="icons" className="space-y-4">
          <TabsList>
            <TabsTrigger value="icons">Stage Icons</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
          </TabsList>

          <TabsContent value="icons" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {stageIcons.map((stage) => (
                <Card key={stage.stage}>
                  <CardHeader>
                    <CardTitle className="text-base">{stage.display_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stage.icon_url ? (
                      <div className="aspect-square rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                        <img
                          src={stage.icon_url}
                          alt={stage.display_name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg border bg-muted flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">No custom icon</p>
                      </div>
                    )}
                    <SingleImageUpload
                      onUpload={(url) => handleIconUpload(stage.stage, url)}
                      label="Upload Custom Icon"
                      description="SVG or PNG recommended"
                      currentImageUrl={stage.icon_url || undefined}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={themeColors.primary_color}
                    onChange={(e) => setThemeColors(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={themeColors.primary_color}
                    onChange={(e) => setThemeColors(prev => ({ ...prev, primary_color: e.target.value }))}
                    placeholder="#10b981"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={themeColors.secondary_color}
                    onChange={(e) => setThemeColors(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={themeColors.secondary_color}
                    onChange={(e) => setThemeColors(prev => ({ ...prev, secondary_color: e.target.value }))}
                    placeholder="#059669"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent_color">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent_color"
                    type="color"
                    value={themeColors.accent_color}
                    onChange={(e) => setThemeColors(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={themeColors.accent_color}
                    onChange={(e) => setThemeColors(prev => ({ ...prev, accent_color: e.target.value }))}
                    placeholder="#34d399"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_pattern">Background Pattern</Label>
                <SingleImageUpload
                  onUpload={(url) => setThemeColors(prev => ({ ...prev, background_pattern: url }))}
                  label="Upload Background Pattern"
                  description="Subtle pattern or texture"
                  currentImageUrl={themeColors.background_pattern || undefined}
                />
                {themeColors.background_pattern && (
                  <div className="mt-2 h-20 rounded border" style={{ backgroundImage: `url(${themeColors.background_pattern})`, backgroundSize: 'cover' }} />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSaveTheme} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Theme
          </Button>
          <Button variant="outline" onClick={handleResetToDefaults} disabled={saving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
