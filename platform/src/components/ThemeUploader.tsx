import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface ThemeUploaderProps {
  projectId: string;
  portalType?: 'marketplace' | 'business' | 'nonprofit' | 'network';
  onThemeUploaded?: () => void;
}

export function ThemeUploader({ projectId, portalType = 'marketplace', onThemeUploaded }: ThemeUploaderProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.css')) {
      toast.error('Please upload a CSS file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCssContent(content);
      if (!themeName) {
        setThemeName(file.name.replace('.css', ''));
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setPreviewImage(file);
    const url = URL.createObjectURL(file);
    setPreviewImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !themeName || !cssContent) {
      toast.error('Please provide theme name and CSS content');
      return;
    }

    setUploading(true);

    try {
      let uploadedImageUrl = '';

      // Upload preview image if provided
      if (previewImage) {
        const fileExt = previewImage.name.split('.').pop();
        const fileName = `${projectId}/${Date.now()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('theme-previews')
          .upload(fileName, previewImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('theme-previews')
          .getPublicUrl(fileName);

        uploadedImageUrl = publicUrl;
      }

      // If setting as default, unset other defaults first
      if (isDefault) {
        await supabase
          .from('project_themes')
          .update({ is_default: false })
          .eq('project_id', projectId);
      }

      const { error } = await supabase
        .from('project_themes')
        .insert({
          project_id: projectId,
          portal_type: portalType,
          theme_name: themeName,
          css_content: cssContent,
          is_default: isDefault,
          created_by: user.id,
          preview_image_url: uploadedImageUrl || null,
        });

      if (error) throw error;

      toast.success('Theme uploaded successfully');
      setOpen(false);
      setThemeName('');
      setCssContent('');
      setIsDefault(false);
      setPreviewImage(null);
      setPreviewImageUrl('');
      onThemeUploaded?.();
    } catch (error: any) {
      console.error('Error uploading theme:', error);
      toast.error(error.message || 'Failed to upload theme');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Upload Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload New Theme</DialogTitle>
            <DialogDescription>
              Upload a CSS stylesheet to customize your project's appearance
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="theme-name">Theme Name</Label>
              <Input
                id="theme-name"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="My Custom Theme"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="css-file">CSS File</Label>
              <Input
                id="css-file"
                type="file"
                accept=".css"
                onChange={handleFileUpload}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="preview-image">Preview Image</Label>
              <Input
                id="preview-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {previewImageUrl && (
                <div className="mt-2">
                  <img
                    src={previewImageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="css-content">CSS Content</Label>
              <Textarea
                id="css-content"
                value={cssContent}
                onChange={(e) => setCssContent(e.target.value)}
                placeholder="/* Your CSS here */&#10;.project-page { ... }"
                className="min-h-[200px] font-mono text-sm"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
              <Label htmlFor="is-default">Set as default theme</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Theme'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
