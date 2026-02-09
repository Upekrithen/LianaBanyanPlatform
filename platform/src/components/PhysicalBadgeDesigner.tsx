import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Award, Upload, Package, CheckCircle2, Truck } from 'lucide-react';
import SingleImageUpload from '@/components/SingleImageUpload';

export function PhysicalBadgeDesigner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [designName, setDesignName] = useState('');
  const [designFile, setDesignFile] = useState<string | null>(null);

  const { data: badge } = useQuery({
    queryKey: ['physical-badge', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('physical_badge_designs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: milestones } = useQuery({
    queryKey: ['member-milestones', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('member_project_milestones')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createBadgeMutation = useMutation({
    mutationFn: async () => {
      const profileUrl = `${window.location.origin}/reputation/${user!.id}`;
      const { data, error } = await supabase
        .from('physical_badge_designs')
        .insert({
          user_id: user!.id,
          design_name: designName,
          design_file_path: designFile,
          qr_code_data: profileUrl,
          badge_status: 'designing',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physical-badge', user?.id] });
      toast({ title: 'Badge design saved!', description: 'You can now prepare it for production.' });
      setDesignName('');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from('physical_badge_designs')
        .update({ badge_status: newStatus })
        .eq('id', badge!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physical-badge', user?.id] });
      toast({ title: 'Badge status updated!' });
    },
  });

  const statusConfig = {
    designing: { label: 'Designing', icon: Award, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
    ready_for_production: { label: 'Ready', icon: CheckCircle2, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
    in_production: { label: 'In Production', icon: Package, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100' },
    shipped: { label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' },
    received: { label: 'Received', icon: CheckCircle2, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Please log in to design your physical badge
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Physical Member Badge
            </CardTitle>
            <CardDescription>
              Create your physical badge with QR code linking to your public profile
              {milestones && milestones.project_count < 10 && (
                <span className="block mt-1 text-amber-600 dark:text-amber-400">
                  Recommended: Complete within your first 10 projects ({milestones.project_count}/10)
                </span>
              )}
            </CardDescription>
          </div>
          {badge && (
            <Badge className={statusConfig[badge.badge_status as keyof typeof statusConfig].color}>
              {statusConfig[badge.badge_status as keyof typeof statusConfig].label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!badge ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="design-name">Badge Design Name</Label>
              <Input
                id="design-name"
                placeholder="e.g., My Professional Badge"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
              />
            </div>

            <div>
              <Label>Badge Design File (Optional)</Label>
              <SingleImageUpload
                currentImageUrl={designFile || undefined}
                onUpload={setDesignFile}
                label="Upload Badge Design"
                description="Upload your custom badge design or use our default template"
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Your Badge Will Include:</h4>
              <ul className="space-y-1 text-sm">
                <li>✓ QR code linking to your public profile</li>
                <li>✓ Your chosen moniker (display name)</li>
                <li>✓ Achievement icons and guild badges</li>
                <li>✓ Professional hexagonal design</li>
              </ul>
            </div>

            <Button
              onClick={() => createBadgeMutation.mutate()}
              disabled={!designName || createBadgeMutation.isPending}
              className="w-full"
            >
              Create Badge Design
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Badge Preview</h3>
              <div className="flex justify-center p-6 bg-muted rounded-lg">
                <QRCodeSVG
                  value={badge.qr_code_data || ''}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                QR Code links to: {badge.qr_code_data}
              </p>
            </div>

            {badge.design_file_path && (
              <div>
                <h4 className="font-semibold mb-2">Your Design</h4>
                <img
                  src={badge.design_file_path}
                  alt="Badge design"
                  className="w-full rounded-lg border"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              {badge.badge_status === 'designing' && (
                <Button
                  onClick={() => updateStatusMutation.mutate('ready_for_production')}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark Ready for Production
                </Button>
              )}
              {badge.badge_status === 'ready_for_production' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    Your badge is ready! Connect with a production partner to manufacture your physical badge.
                  </p>
                </div>
              )}
              {badge.badge_status === 'in_production' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    Your badge is being manufactured. You'll be notified when it ships.
                  </p>
                </div>
              )}
              {badge.badge_status === 'shipped' && (
                <Button
                  onClick={() => updateStatusMutation.mutate('received')}
                  disabled={updateStatusMutation.isPending}
                >
                  Confirm Badge Received
                </Button>
              )}
              {badge.badge_status === 'received' && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Badge Received!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Congratulations on your physical member badge! Share your QR code to showcase your achievements.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}