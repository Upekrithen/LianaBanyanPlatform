import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Copy, Mail, MessageSquare, QrCode, Users, Check, Clock, Link2, Sparkles } from 'lucide-react';

interface RoleMapping {
  role_key: string;
  display_name: string;
  primary_initiatives: string[];
  beacon_stop_keys: string[];
}

interface Invitation {
  id: string;
  invite_code: string;
  suggested_role: string | null;
  initiative_connection: string | null;
  personal_message: string | null;
  status: string;
  invitee_id: string | null;
  created_at: string;
}

interface Storefront {
  id: string;
  name: string;
}

const INITIATIVE_FRIENDLY: Record<string, string> = {
  rally_group: 'Rally Group',
  local_wheels: 'Local Wheels',
  crew_calls: 'Crew Calls',
  lets_make_bread: "Let's Make Bread",
  commerce_engine: 'Commerce Engine',
  stocked_local_larder: 'Stocked Local Larder',
  the_forge: 'The Forge',
  arena: 'Design Arena',
  mission_one: 'Mission ONE',
  lifeline: 'LifeLine',
  household_concierge: 'Household Concierge',
  family_table: 'Family Table',
  didasko: 'Didasko',
  academy: 'Academy',
  jukebox: 'JukeBox',
};

function generateInviteCode(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8);
}

function drawQR(canvas: HTMLCanvasElement, text: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const size = 200;
  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#18181b';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';

  const modules = 21;
  const cellSize = Math.floor((size - 20) / modules);
  const offset = Math.floor((size - cellSize * modules) / 2);

  const hash = Array.from(text).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      const isFinder =
        (r < 7 && c < 7) || (r < 7 && c >= modules - 7) || (r >= modules - 7 && c < 7);
      const isFinderInner =
        (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
        (r >= 2 && r <= 4 && c >= modules - 5 && c <= modules - 3) ||
        (r >= modules - 5 && r <= modules - 3 && c >= 2 && c <= 4);
      const isFinderBorder =
        isFinder &&
        (r === 0 || r === 6 || c === 0 || c === 6 ||
         r === modules - 7 || r === modules - 1 || c === modules - 7 || c === modules - 1);

      let fill = false;
      if (isFinderInner) fill = true;
      else if (isFinderBorder) fill = true;
      else if (isFinder) fill = false;
      else {
        const seed = ((hash + r * 31 + c * 17) >>> 0) % 100;
        fill = seed < 45;
      }

      if (fill) {
        ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
      }
    }
  }
}

export default function InviteGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedRole, setSelectedRole] = useState('');
  const [initiative, setInitiative] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const { data: roleMappings } = useQuery({
    queryKey: ['role-initiative-map'],
    queryFn: async () => {
      const { data } = await supabase
        .from('role_initiative_map' as never)
        .select('role_key, display_name, primary_initiatives, beacon_stop_keys')
        .order('display_name') as { data: RoleMapping[] | null };
      return data || [];
    },
  });

  const { data: storefronts } = useQuery({
    queryKey: ['my-storefronts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('storefronts' as never)
        .select('id, name')
        .eq('owner_id', user.id) as { data: Storefront[] | null };
      return data || [];
    },
    enabled: !!user,
  });

  const { data: invitations, refetch: refetchInvitations } = useQuery({
    queryKey: ['my-invitations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('invitations' as never)
        .select('*')
        .eq('inviter_id', user.id)
        .order('created_at', { ascending: false }) as { data: Invitation[] | null };
      return data || [];
    },
    enabled: !!user,
  });

  const selectedRoleData = roleMappings?.find(r => r.role_key === selectedRole);

  useEffect(() => {
    if (selectedRoleData?.primary_initiatives?.length) {
      setInitiative(selectedRoleData.primary_initiatives[0]);
    }
  }, [selectedRoleData]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      const code = generateInviteCode();

      const { error } = await supabase.from('invitations' as never).insert({
        inviter_id: user.id,
        invite_code: code,
        suggested_role: selectedRole || null,
        initiative_connection: initiative || null,
        personal_message: personalMessage || null,
        inviter_business_id: businessId || null,
      } as never);
      if (error) throw error;

      if (selectedRoleData?.beacon_stop_keys) {
        const stops = selectedRoleData.beacon_stop_keys.map((key, i) => ({
          invitation_id: null as unknown,
          beacon_key: key,
          priority_order: i + 1,
          is_required: i < 4,
        }));

        const { data: inv } = await supabase
          .from('invitations' as never)
          .select('id')
          .eq('invite_code', code)
          .single() as { data: { id: string } | null };

        if (inv) {
          for (const stop of stops) {
            await supabase.from('invitation_beacon_stops' as never).insert({
              invitation_id: inv.id,
              beacon_key: stop.beacon_key,
              priority_order: stop.priority_order,
              is_required: stop.is_required,
            } as never);
          }

          const slingshotRoles = ['storefront_owner', 'cook', 'delivery_driver'];
          if (businessId && slingshotRoles.includes(selectedRole)) {
            const serviceMap: Record<string, string> = {
              storefront_owner: 'general',
              cook: 'menu_template',
              delivery_driver: 'cue_card',
            };
            await supabase.from('slingshot_slots' as never).insert({
              shepherd_id: user.id,
              origin_business_id: businessId,
              service_type: serviceMap[selectedRole] || 'general',
              generation: 1,
              is_active: true,
            } as never);
          }
        }
      }

      return code;
    },
    onSuccess: (code) => {
      const link = `https://lianabanyan.com/welcome?invite=${code}`;
      setGeneratedLink(link);
      setGeneratedCode(code);
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
      toast({ title: 'Invitation Created!', description: 'Your personal link is ready to share.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({ title: 'Copied!', description: 'Link copied to clipboard.' });
  };

  const shareEmail = () => {
    const subject = encodeURIComponent('Join me on Liana Banyan');
    const body = encodeURIComponent(
      `${personalMessage || "I think you'd love this."}\n\nHere's your personal invitation:\n${generatedLink}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareSMS = () => {
    const body = encodeURIComponent(
      `${personalMessage || "Check this out!"} ${generatedLink}`
    );
    window.open(`sms:?body=${body}`);
  };

  useEffect(() => {
    if (!generatedLink) return;
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (canvas) drawQR(canvas, generatedLink);
  }, [generatedLink]);

  const totalInvited = invitations?.length || 0;
  const totalJoined = invitations?.filter(i => i.status === 'used').length || 0;
  const totalActive = invitations?.filter(i => i.status === 'active').length || 0;

  return (
    <PortalPageLayout
      portalKey="marketplace"
      title="Invite Someone"
      description="Every invitation is personal."
      icon={<UserPlus className="h-6 w-6" />}
    >
      <div className="space-y-6" data-xray-id="invite-generator">
        {/* Stats Banner */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Invited', value: totalInvited, icon: Users },
            { label: 'Joined', value: totalJoined, icon: Check },
            { label: 'Active Links', value: totalActive, icon: Link2 },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <s.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Generate Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Invite Someone to Liana Banyan
            </CardTitle>
            <CardDescription>Every invitation is personal. Choose a role and we'll build their path.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Who are you inviting?</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger><SelectValue placeholder="Select a role..." /></SelectTrigger>
                <SelectContent>
                  {roleMappings?.map(r => (
                    <SelectItem key={r.role_key} value={r.role_key}>{r.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRoleData && (
              <div className="space-y-2">
                <Label>What will they work on?</Label>
                <Select value={initiative} onValueChange={setInitiative}>
                  <SelectTrigger><SelectValue placeholder="Select initiative..." /></SelectTrigger>
                  <SelectContent>
                    {selectedRoleData.primary_initiatives.map(key => (
                      <SelectItem key={key} value={key}>
                        {INITIATIVE_FRIENDLY[key] || key.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {storefronts && storefronts.length > 0 && (
              <div className="space-y-2">
                <Label>Your business (optional)</Label>
                <Select value={businessId} onValueChange={setBusinessId}>
                  <SelectTrigger><SelectValue placeholder="Select storefront..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {storefronts.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Personal message (optional)</Label>
              <Textarea
                value={personalMessage}
                onChange={e => setPersonalMessage(e.target.value.slice(0, 280))}
                placeholder="Hey, I think you'd be great at..."
                maxLength={280}
              />
              <p className="text-xs text-muted-foreground text-right">{personalMessage.length}/280</p>
            </div>

            <Button
              onClick={() => generateMutation.mutate()}
              disabled={!selectedRole || generateMutation.isPending}
              className="w-full"
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate Invitation Link'}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Link Display */}
        {generatedLink && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Your invitation link is ready!</h3>
                <div className="flex items-center gap-2 bg-background rounded-lg p-3 border">
                  <Input value={generatedLink} readOnly className="border-0 bg-transparent text-sm" />
                  <Button size="sm" variant="outline" onClick={copyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={copyLink}>
                  <Copy className="h-4 w-4 mr-1" /> Copy Link
                </Button>
                <Button variant="outline" size="sm" onClick={shareEmail}>
                  <Mail className="h-4 w-4 mr-1" /> Email
                </Button>
                <Button variant="outline" size="sm" onClick={shareSMS}>
                  <MessageSquare className="h-4 w-4 mr-1" /> Text
                </Button>
              </div>

              <div className="flex justify-center">
                <canvas id="qr-canvas" className="border rounded-lg" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Invitations Dashboard */}
        {invitations && invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {invitations.map(inv => (
                  <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{inv.invite_code}</code>
                        {inv.suggested_role && (
                          <span className="text-xs text-muted-foreground">
                            {roleMappings?.find(r => r.role_key === inv.suggested_role)?.display_name || inv.suggested_role}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={
                      inv.status === 'used' ? 'default' :
                      inv.status === 'active' ? 'secondary' : 'outline'
                    }>
                      {inv.status === 'used' ? 'Joined' : inv.status === 'active' ? 'Active' : 'Expired'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalPageLayout>
  );
}
