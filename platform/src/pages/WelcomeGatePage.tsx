import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDurinsDoorForMedallion, isDoorConfigActive, type DoorRule } from '@/hooks/useDurinsDoor';
import { DurinsDoorGate } from '@/components/DurinsDoorGate';
import { RedCarpetRenderer } from '@/components/RedCarpetRenderer';
import { Clock, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function useMedallionProfile(medallionId: string | undefined) {
  return useQuery({
    queryKey: ['medallion-profile', medallionId],
    queryFn: async () => {
      if (!medallionId) return null;
      const { data } = await supabase
        .from('profiles' as never)
        .select('display_name, avatar_url')
        .eq('id', medallionId)
        .single() as { data: { display_name: string | null; avatar_url: string | null } | null };
      return data;
    },
    enabled: !!medallionId,
  });
}

export default function WelcomeGatePage() {
  const { medallionId } = useParams<{ medallionId: string }>();
  const { data: doorConfig, isLoading: doorLoading } = useDurinsDoorForMedallion(medallionId);
  const { data: profile } = useMedallionProfile(medallionId);
  const [selectedExperience, setSelectedExperience] = useState<DoorRule | null>(null);
  const [showDefault, setShowDefault] = useState(false);

  const sponsorName = profile?.display_name || 'A Liana Banyan member';

  if (doorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 30%, #0a0a0a 60%, #0a0a1a 100%)',
      }}>
        <div className="animate-pulse text-white/40">Loading...</div>
      </div>
    );
  }

  // Expired card
  if (doorConfig && !isDoorConfigActive(doorConfig)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 30%, #0a0a0a 60%, #0a0a1a 100%)',
      }}>
        <div className="max-w-sm text-center space-y-4">
          <Clock className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">This Card Has Expired</h1>
          <p className="text-white/50 text-sm">
            The invitation from {sponsorName} is no longer active.
            You can still join at <a href="/" className="text-emerald-400 hover:underline">lianabanyan.com</a>.
          </p>
        </div>
      </div>
    );
  }

  // Matched experience via Durin's Door
  if (selectedExperience) {
    return (
      <RedCarpetRenderer
        experience={{ ...selectedExperience.experience_data, template: selectedExperience.template }}
        sponsorName={sponsorName}
        sponsorId={medallionId}
      />
    );
  }

  // Default experience (skipped the door or no rules configured)
  if (showDefault || !doorConfig || doorConfig.rules.length === 0) {
    const defaultExperience = {
      template: doorConfig?.default_template || 'generic_welcome',
      ...(doorConfig?.default_data || {}),
    };
    return (
      <RedCarpetRenderer
        experience={defaultExperience}
        sponsorName={sponsorName}
        sponsorId={medallionId}
      />
    );
  }

  // No medallionId at all
  if (!medallionId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1f0d 30%, #0a0a0a 70%, #0d0d1f 100%)',
      }}>
        <div className="max-w-sm text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Invalid Card</h1>
          <p className="text-white/50 text-sm">
            This link appears to be incomplete.
            Visit <a href="/" className="text-emerald-400 hover:underline">lianabanyan.com</a> directly.
          </p>
        </div>
      </div>
    );
  }

  // Show the Durin's Door gate
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 30%, #0a0a0a 60%, #0a0a1a 100%)',
    }}>
      <div className="w-full max-w-md">
        <DurinsDoorGate
          rules={doorConfig.rules}
          sponsorName={sponsorName}
          onMatch={(rule) => setSelectedExperience(rule)}
          onSkip={() => setShowDefault(true)}
        />
      </div>
    </div>
  );
}
