import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploadProps {
  images: Array<{ id: string; url: string; caption: string }>;
  onImagesChange: (images: Array<{ id: string; url: string; caption: string }>) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onImagesChange, maxImages = 10 }: ImageUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user?.id}/${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('project-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('project-images')
            .getPublicUrl(fileName);

          return {
            id: crypto.randomUUID(),
            url: publicUrl,
            caption: '',
          };
        })
      );

      onImagesChange([...images, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (imageId: string) => {
    onImagesChange(images.filter(img => img.id !== imageId));
  };

  const updateCaption = (imageId: string, caption: string) => {
    onImagesChange(
      images.map(img => (img.id === imageId ? { ...img, caption } : img))
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-upload" className="cursor-pointer">
          <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary transition-colors text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">
              Click to upload images
            </p>
            <p className="text-xs text-muted-foreground">
              {images.length}/{maxImages} images
            </p>
          </div>
        </Label>
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          disabled={uploading || images.length >= maxImages}
          className="hidden"
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="space-y-2">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={image.url}
                  alt={image.caption || 'Uploaded image'}
                  className="object-cover w-full h-full"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeImage(image.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Input
                placeholder="Caption (optional)"
                value={image.caption}
                onChange={(e) => updateCaption(image.id, e.target.value)}
                className="text-xs"
              />
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Uploading images...</p>
        </div>
      )}
    </div>
  );
}
