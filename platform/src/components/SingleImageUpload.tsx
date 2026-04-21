import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SingleImageUploadProps {
  onUpload: (url: string) => void;
  label?: string;
  description?: string;
  currentImageUrl?: string;
}

export default function SingleImageUpload({
  onUpload,
  label = "Upload Image",
  description,
  currentImageUrl
}: SingleImageUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);

      onUpload(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`single-image-upload-${label}`} className="cursor-pointer">
        <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary transition-colors text-center">
          {uploading ? (
            <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-primary" />
          ) : (
            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          )}
          <p className="text-sm font-medium mb-1">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </Label>
      <Input
        id={`single-image-upload-${label}`}
        type="file"
        accept="image/*,.svg"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
}
