import { useTranslation } from "react-i18next";
import { PhysicalBadgeDesigner } from '@/components/PhysicalBadgeDesigner';
import { ProfileVisibilitySettings } from '@/components/ProfileVisibilitySettings';
import { LegalFormationStatus } from '@/components/LegalFormationStatus';
import { CharitableLoanAccount } from '@/components/CharitableLoanAccount';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function ProfileSettings() {
  const { t } = useTranslation();

  return (
    <PortalPageLayout>
      <div>
        <h1 className="text-3xl font-bold">{t('profileSettings.title')}</h1>
        <p className="text-muted-foreground">
          {t('profileSettings.subtitle')}
        </p>
      </div>

      <div className="grid gap-6">
        <ProfileVisibilitySettings />
        <PhysicalBadgeDesigner />
        <LegalFormationStatus />
        <CharitableLoanAccount />
      </div>
    </PortalPageLayout>
  );
}
