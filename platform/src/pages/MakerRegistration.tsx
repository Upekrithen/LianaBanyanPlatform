import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useToast } from '@/hooks/use-toast';
import { Hammer, Loader2, CheckCircle2 } from 'lucide-react';

const CAPABILITY_OPTIONS = [
  { value: '3d_printing', label: '3D Printing (FDM/FFF)' },
  { value: 'resin', label: 'Resin Printing (SLA/DLP)' },
  { value: 'cnc', label: 'CNC Machining' },
  { value: 'laser', label: 'Laser Cutting/Engraving' },
  { value: 'woodwork', label: 'Woodworking' },
  { value: 'metalwork', label: 'Metalworking' },
  { value: 'electronics', label: 'Electronics Assembly' },
  { value: 'sewing', label: 'Sewing/Textiles' },
  { value: 'casting', label: 'Casting/Molding' },
];

export default function MakerRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [capacity, setCapacity] = useState('');
  const [equipmentText, setEquipmentText] = useState('');

  const toggleCapability = (val: string) => {
    setCapabilities(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    );
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Please sign in first');
      if (!businessName.trim()) throw new Error('Business name is required');
      if (capabilities.length === 0) throw new Error('Select at least one capability');

      const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const equipment = equipmentText
        .split('\n')
        .filter(Boolean)
        .map(line => {
          const parts = line.split('|').map(s => s.trim());
          return { name: parts[0] || line, type: parts[1] || 'general', specs: parts[2] || '' };
        });

      const { error } = await supabase.from('makers').insert({
        user_id: user.id,
        business_name: businessName.trim(),
        slug,
        description: description.trim() || null,
        capabilities,
        equipment,
        location_city: city.trim() || null,
        location_state: state.trim() || null,
        capacity_weekly: capacity ? parseInt(capacity) : null,
      });
      if (error) throw error;
      return slug;
    },
    onSuccess: (slug) => {
      toast({ title: 'Welcome to the Forge!', description: 'Your maker profile is live.' });
      navigate(`/makers/${slug}`);
    },
    onError: (err: Error) => {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
    },
  });

  if (!user) {
    return (
      <PortalPageLayout title="Register as a Maker">
        <div className="text-center py-20 space-y-3">
          <Hammer className="w-16 h-16 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">Please sign in to register as a maker.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout title="Register as a Maker" subtitle="Join the Forge and start taking production orders. All pricing at Cost+20%." backButton>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hammer className="w-5 h-5" />Maker Registration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="business-name">Business Name *</Label>
            <Input
              id="business-name"
              placeholder="e.g. PrintShop Texas"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell potential clients about your shop, specialties, and experience..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Capabilities *</Label>
            <div className="grid grid-cols-2 gap-2">
              {CAPABILITY_OPTIONS.map(opt => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`cap-${opt.value}`}
                    checked={capabilities.includes(opt.value)}
                    onCheckedChange={() => toggleCapability(opt.value)}
                  />
                  <label htmlFor={`cap-${opt.value}`} className="text-sm cursor-pointer">{opt.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="San Antonio" value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="TX" value={state} onChange={e => setState(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Weekly Capacity (units)</Label>
            <Input
              id="capacity"
              type="number"
              placeholder="e.g. 200"
              value={capacity}
              onChange={e => setCapacity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment (one per line, use | to separate name|type|specs)</Label>
            <Textarea
              id="equipment"
              placeholder="Creality Ender 3 V3|3d_printing|220×220×250mm&#10;Ortur Laser Master 2|laser|400×430mm"
              value={equipmentText}
              onChange={e => setEquipmentText(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() => registerMutation.mutate()}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registering...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4 mr-2" />Register My Shop</>
            )}
          </Button>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
