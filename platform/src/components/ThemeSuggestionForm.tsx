import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Palette } from 'lucide-react';

interface ThemeSuggestionFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function ThemeSuggestionForm({ projectId, onSuccess }: ThemeSuggestionFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [description, setDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#f59e0b');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to suggest themes');
      return;
    }

    if (!themeName.trim()) {
      toast.error('Please enter a theme name');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('theme_suggestions')
        .insert({
          project_id: projectId,
          suggested_by: user.id,
          theme_name: themeName,
          theme_description: description,
          color_scheme: {
            primary: primaryColor,
            secondary: secondaryColor,
            background: backgroundColor,
            accent: accentColor,
          },
        });

      if (error) throw error;

      toast.success('Theme suggestion submitted! It will be reviewed by the project team.');

      // Reset form
      setThemeName('');
      setDescription('');
      setPrimaryColor('#3b82f6');
      setSecondaryColor('#8b5cf6');
      setBackgroundColor('#ffffff');
      setAccentColor('#f59e0b');

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting theme:', error);
      toast.error('Failed to submit theme suggestion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Suggest a Theme
        </CardTitle>
        <CardDescription>
          Propose a new visual theme for this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme-name">Theme Name *</Label>
            <Input
              id="theme-name"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              placeholder="e.g., Ocean Breeze, Forest Dawn"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme-description">Description</Label>
            <Textarea
              id="theme-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the theme and its inspiration..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex gap-2">
                <input
                  id="secondary-color"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#8b5cf6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="background-color">Background Color</Label>
              <div className="flex gap-2">
                <input
                  id="background-color"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex gap-2">
                <input
                  id="accent-color"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#f59e0b"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className="p-6 rounded-lg border-2"
              style={{
                backgroundColor: backgroundColor,
                borderColor: primaryColor
              }}
            >
              <div className="space-y-2">
                <div
                  className="px-4 py-2 rounded font-semibold"
                  style={{
                    backgroundColor: primaryColor,
                    color: '#ffffff'
                  }}
                >
                  Primary Button
                </div>
                <div
                  className="px-4 py-2 rounded font-semibold"
                  style={{
                    backgroundColor: secondaryColor,
                    color: '#ffffff'
                  }}
                >
                  Secondary Button
                </div>
                <div
                  className="px-4 py-2 rounded font-semibold"
                  style={{
                    backgroundColor: accentColor,
                    color: '#ffffff'
                  }}
                >
                  Accent Element
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting...' : 'Submit Theme Suggestion'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
