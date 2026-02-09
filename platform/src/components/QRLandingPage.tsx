import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditableContent } from './EditableContent';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRLandingPageProps {
  projectId: string;
  landingPageId?: string;
  variant?: string;
}

interface LandingPageContent {
  id?: string;
  project_id: string;
  variant: string;
  headline: string;
  subheadline: string;
  description: string;
  cta_text: string;
  cta_url: string;
  video_url?: string;
}

export function QRLandingPage({ projectId, landingPageId, variant = 'default' }: QRLandingPageProps) {
  const [content, setContent] = useState<LandingPageContent>({
    project_id: projectId,
    variant,
    headline: 'Welcome to Our Project',
    subheadline: 'Scan, Learn, and Join the Journey',
    description: 'This QR code brings you to an exclusive look at our project. Explore the vision, see the progress, and become part of the story.',
    cta_text: 'Explore Project',
    cta_url: `/project/${projectId}`,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [projectId, landingPageId, variant]);

  const loadContent = async () => {
    if (landingPageId) {
      const { data, error } = await supabase
        .from('qr_landing_pages')
        .select('*')
        .eq('id', landingPageId)
        .maybeSingle();

      if (data && !error) {
        setContent(data as LandingPageContent);
      }
    } else {
      const { data, error } = await supabase
        .from('qr_landing_pages')
        .select('*')
        .eq('project_id', projectId)
        .eq('variant', variant)
        .maybeSingle();

      if (data && !error) {
        setContent(data as LandingPageContent);
      }
    }
    setLoading(false);
  };

  const handleSave = async (field: keyof LandingPageContent, value: string) => {
    const updatedContent = { ...content, [field]: value };
    setContent(updatedContent);

    if (content.id) {
      const { error } = await supabase
        .from('qr_landing_pages')
        .update({ [field]: value })
        .eq('id', content.id);

      if (error) {
        toast.error('Failed to update content');
        console.error(error);
      } else {
        toast.success('Content updated');
      }
    } else {
      const { data, error } = await supabase
        .from('qr_landing_pages')
        .insert([updatedContent])
        .select()
        .single();

      if (error) {
        toast.error('Failed to save content');
        console.error(error);
      } else {
        setContent(data as LandingPageContent);
        toast.success('Content saved');
      }
    }
  };

  const landingUrl = `${window.location.origin}/qr/${content.id || 'preview'}`;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Landing Page - {variant}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <EditableContent
                content={content.headline}
                onSave={(value) => handleSave('headline', value)}
                label="Headline"
                contentType="text"
              >
                <h1 className="text-4xl font-bold">{content.headline}</h1>
              </EditableContent>

              <EditableContent
                content={content.subheadline || ''}
                onSave={(value) => handleSave('subheadline', value)}
                label="Subheadline"
                contentType="text"
              >
                <h2 className="text-xl text-muted-foreground">{content.subheadline}</h2>
              </EditableContent>

              <EditableContent
                content={content.description || ''}
                onSave={(value) => handleSave('description', value)}
                label="Description"
                contentType="textarea"
              >
                <p className="text-base">{content.description}</p>
              </EditableContent>

              <EditableContent
                content={content.cta_text}
                onSave={(value) => handleSave('cta_text', value)}
                label="Button Text"
                contentType="text"
              >
                <Button size="lg" className="w-full">
                  {content.cta_text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </EditableContent>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-muted rounded-lg">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={landingUrl} size={200} />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Scan to preview this landing page
              </p>
              <code className="text-xs bg-background px-3 py-1 rounded">
                {landingUrl}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
