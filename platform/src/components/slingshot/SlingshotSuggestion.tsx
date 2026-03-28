import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Eye, Paintbrush, X } from 'lucide-react';

interface SlingshotSlot {
  id: string;
  shepherd_id: string;
  origin_business_id: string;
  service_type: string;
}

export default function SlingshotSuggestion({ onFilterDesigner }: { onFilterDesigner?: (designerId: string) => void }) {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const { data: suggestion } = useQuery({
    queryKey: ['slingshot-suggestion', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Find parent storefront (businesses the user has ordered from)
      const { data: orders } = await supabase
        .from('menu_orders' as never)
        .select('storefront_id')
        .eq('customer_id', user.id)
        .limit(5) as { data: { storefront_id: string }[] | null };

      if (!orders || orders.length === 0) return null;

      const parentIds = [...new Set(orders.map(o => o.storefront_id))];

      // Look for active slingshot slots for those businesses
      for (const bizId of parentIds) {
        const { data: slot } = await supabase
          .from('slingshot_slots' as never)
          .select('id, shepherd_id, origin_business_id, service_type')
          .eq('origin_business_id', bizId)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle() as { data: SlingshotSlot | null };

        if (slot) {
          // Get shepherd name
          const { data: shepherdProfile } = await supabase
            .from('member_profiles' as never)
            .select('display_name')
            .eq('user_id', slot.shepherd_id)
            .maybeSingle() as { data: { display_name: string } | null };

          // Get business name
          const { data: biz } = await supabase
            .from('storefronts' as never)
            .select('name')
            .eq('id', slot.origin_business_id)
            .maybeSingle() as { data: { name: string } | null };

          return {
            slot,
            designerName: shepherdProfile?.display_name || 'A designer',
            businessName: biz?.name || 'a business',
          };
        }
      }

      return null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  if (dismissed || !suggestion) return null;

  const serviceLabel: Record<string, string> = {
    cue_card: 'cue card',
    logo: 'logo',
    menu_template: 'menu template',
    branding: 'branding',
    general: 'design work',
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent" data-xray-id="slingshot-suggestion">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">Recommended for you</p>
                <p className="text-sm text-muted-foreground">
                  <strong>{suggestion.designerName}</strong> designed the{' '}
                  {serviceLabel[suggestion.slot.service_type] || 'design work'} for{' '}
                  <strong>{suggestion.businessName}</strong>.
                  They're available to design yours too.
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setDismissed(true)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {onFilterDesigner && (
                <Button size="sm" variant="outline" onClick={() => onFilterDesigner(suggestion.slot.shepherd_id)}>
                  <Eye className="h-3 w-3 mr-1" /> View Their Work
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => {
                if (onFilterDesigner) onFilterDesigner(suggestion.slot.shepherd_id);
              }}>
                <Paintbrush className="h-3 w-3 mr-1" /> Commission Them
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
                Browse Others
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
