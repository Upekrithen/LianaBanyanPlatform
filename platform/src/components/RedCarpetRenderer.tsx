import { Suspense, lazy } from 'react';
import type { DoorRule } from '@/hooks/useDurinsDoor';

const BusinessPitchRedCarpet = lazy(() => import('./red-carpet/BusinessPitchRedCarpet'));
const MemberInviteRedCarpet = lazy(() => import('./red-carpet/MemberInviteRedCarpet'));
const FamilyInviteRedCarpet = lazy(() => import('./red-carpet/FamilyInviteRedCarpet'));
const DriverRecruitRedCarpet = lazy(() => import('./red-carpet/DriverRecruitRedCarpet'));
const GenericWelcomeRedCarpet = lazy(() => import('./red-carpet/GenericWelcomeRedCarpet'));
const MedallionScanRedCarpet = lazy(() => import('./red-carpet/MedallionScanRedCarpet'));

interface RedCarpetRendererProps {
  experience: DoorRule['experience_data'] & { template?: string };
  sponsorName?: string;
  sponsorId?: string;
  activationCode?: string;
}

const Loading = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-pulse text-white/40">Loading your experience...</div>
  </div>
);

export function RedCarpetRenderer({ experience, sponsorName, sponsorId, activationCode }: RedCarpetRendererProps) {
  const template = experience.template as string || 'generic_welcome';
  const sharedProps = {
    experience,
    sponsorName,
    sponsorId,
    activationCode,
  };

  return (
    <Suspense fallback={<Loading />}>
      {template === 'business_pitch' && <BusinessPitchRedCarpet {...sharedProps} />}
      {template === 'member_invite' && <MemberInviteRedCarpet {...sharedProps} />}
      {template === 'family_invite' && <FamilyInviteRedCarpet {...sharedProps} />}
      {template === 'driver_recruit' && <DriverRecruitRedCarpet {...sharedProps} />}
      {template === 'medallion_scan' && <MedallionScanRedCarpet {...sharedProps} />}
      {!['business_pitch', 'member_invite', 'family_invite', 'driver_recruit', 'medallion_scan'].includes(template) && (
        <GenericWelcomeRedCarpet {...sharedProps} />
      )}
    </Suspense>
  );
}
