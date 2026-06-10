/**
 * WAVE B: CUE CARD BUILDER COMPONENT (BP079)
 * ==========================================
 * Shared component for building and sharing cue cards for food trucks and local businesses.
 * Generates short tokens, QR codes, and shareable URLs.
 *
 * Props:
 * - nodeType: 'food' | 'local-business'
 * - nodeTypeName: Display name (e.g., "Food Truck", "Local Business")
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy, Share2, Loader2 } from 'lucide-react';

interface CueCardBuilderProps {
  nodeType: 'food' | 'local-business';
  nodeTypeName: string;
}

interface CueCardTemplate {
  id: string;
  template_name: string;
  template_payload: Record<string, unknown>;
}

export function CueCardBuilder({ nodeType, nodeTypeName }: CueCardBuilderProps) {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [templates, setTemplates] = useState<CueCardTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [hookCopy, setHookCopy] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [generatedCard, setGeneratedCard] = useState<{
    id: string;
    short_token: string;
    qr_code_url: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [nodeType]);

  // Load existing card if :id param is set
  useEffect(() => {
    if (id && user) {
      loadExistingCard(id);
    }
  }, [id, user]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cue_card_templates')
        .select('id, template_name, template_payload')
        .eq('node_type', nodeType)
        .eq('system_owned', true)
        .order('template_name');

      if (error) throw error;

      setTemplates(data || []);
      if (data && data.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load card templates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingCard = async (cardId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('leviathan_cue_cards')
        .select('*')
        .eq('id', cardId)
        .eq('creator_user_id', user!.id)
        .single();

      if (error) throw error;

      if (data) {
        const payload = data.payload as Record<string, unknown>;
        setBusinessName((payload.business_name as string) || '');
        setOwnerName((payload.owner_name as string) || '');
        setHookCopy((payload.hook_copy as string) || '');
        setCoverImageUrl((payload.cover_image_url as string) || '');
        setContactPhone((payload.contact_phone as string) || '');
        setSelectedTemplateId(data.template_id);
        setGeneratedCard({
          id: data.id,
          short_token: data.short_token,
          qr_code_url: data.qr_code_url,
        });
      }
    } catch (error) {
      console.error('Failed to load card:', error);
      toast({
        title: 'Error',
        description: 'Failed to load existing card',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateShortToken = () => {
    // Generate random 8-char base62 token
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateCard = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate a card',
        variant: 'destructive',
      });
      return;
    }

    if (!businessName.trim() || !ownerName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Business name and owner name are required',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTemplateId) {
      toast({
        title: 'Template Required',
        description: 'Please select a template',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const shortToken = generateShortToken();
      const payload = {
        business_name: businessName.trim(),
        owner_name: ownerName.trim(),
        hook_copy: hookCopy.trim(),
        cover_image_url: coverImageUrl.trim() || null,
        contact_phone: contactPhone.trim() || null,
      };

      const { data, error } = await supabase
        .from('leviathan_cue_cards')
        .insert({
          creator_user_id: user.id,
          node_type: nodeType,
          template_id: selectedTemplateId,
          payload,
          short_token: shortToken,
          qr_code_url: null, // Could generate and upload QR code to storage here
        })
        .select()
        .single();

      if (error) throw error;

      setGeneratedCard({
        id: data.id,
        short_token: shortToken,
        qr_code_url: null,
      });

      toast({
        title: 'Card Generated!',
        description: 'Your cue card is ready to share',
      });
    } catch (error) {
      console.error('Failed to generate card:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate card',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const shareUrl = generatedCard
    ? `https://lianabanyan.com/cue-card/landing/${generatedCard.short_token}`
    : '';

  const copyShareUrl = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Copied!',
      description: 'Share URL copied to clipboard',
    });
  };

  const shareViaNavigator = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${businessName} - ${nodeTypeName} Cue Card`,
          text: `Check out ${businessName} on Liana Banyan!`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', error);
      }
    } else {
      copyShareUrl();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Create {nodeTypeName} Cue Card
          </h1>
          <p className="text-muted-foreground">
            Build a shareable card to promote your {nodeTypeName.toLowerCase()}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>Card Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selection */}
              {templates.length > 0 && (
                <div>
                  <Label htmlFor="template">Template</Label>
                  <select
                    id="template"
                    className="w-full px-3 py-2 rounded-md border border-border bg-background"
                    value={selectedTemplateId || ''}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.template_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Business Name */}
              <div>
                <Label htmlFor="business-name">Business Name *</Label>
                <Input
                  id="business-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g., Maria's Tacos"
                  disabled={isGenerating}
                />
              </div>

              {/* Owner Name */}
              <div>
                <Label htmlFor="owner-name">Owner Name *</Label>
                <Input
                  id="owner-name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g., Maria Rodriguez"
                  disabled={isGenerating}
                />
              </div>

              {/* Hook Copy */}
              <div>
                <Label htmlFor="hook-copy">Hook Copy</Label>
                <Textarea
                  id="hook-copy"
                  value={hookCopy}
                  onChange={(e) => setHookCopy(e.target.value)}
                  placeholder="What makes your business special?"
                  rows={3}
                  disabled={isGenerating}
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <Label htmlFor="cover-image">Cover Image URL (optional)</Label>
                <Input
                  id="cover-image"
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={isGenerating}
                />
              </div>

              {/* Contact Phone */}
              <div>
                <Label htmlFor="contact-phone">Contact Phone (optional)</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  disabled={isGenerating}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateCard}
                disabled={!businessName.trim() || !ownerName.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {generatedCard ? 'Update Card' : 'Generate Card'}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Card Preview */}
              <div className="p-6 rounded-lg border-2 border-border bg-card/50">
                {coverImageUrl && (
                  <img
                    src={coverImageUrl}
                    alt={businessName}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {businessName || 'Business Name'}
                </h3>
                <p className="text-muted-foreground mb-2">
                  by {ownerName || 'Owner Name'}
                </p>
                {hookCopy && (
                  <p className="text-sm text-muted-foreground italic">
                    "{hookCopy}"
                  </p>
                )}
                {contactPhone && (
                  <p className="text-sm text-muted-foreground mt-2">
                    📞 {contactPhone}
                  </p>
                )}
              </div>

              {/* Share Section */}
              {generatedCard && (
                <div className="space-y-4">
                  <div>
                    <Label>Share URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={shareUrl}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyShareUrl}
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={shareViaNavigator}
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <QRCodeSVG value={shareUrl} size={200} level="H" />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Scan QR code to open card
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
