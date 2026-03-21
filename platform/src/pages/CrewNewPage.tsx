/**
 * CREW NEW — Protected route that renders the Crew Creation Wizard
 */

import { CrewCreationWizard } from "@/components/crew/CrewCreationWizard";
import { PortalPageLayout } from "@/components/PortalPageLayout";

export default function CrewNewPage() {
  return (
    <PortalPageLayout maxWidth="sm" xrayId="crew-new">
      <CrewCreationWizard />
    </PortalPageLayout>
  );
}
