import { ExternalServiceLinksManager } from "@/components/ExternalServiceLinksManager";
import { ExternalCollaboratorManager } from "@/components/ExternalCollaboratorManager";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ExternalServices() {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('externalServices.title')}</h1>
        <p className="text-muted-foreground">
          {t('externalServices.description')}
        </p>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">Service Links</TabsTrigger>
          <TabsTrigger value="collaborators">Collaborator Agreements</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-6">
          <ExternalServiceLinksManager />
        </TabsContent>

        <TabsContent value="collaborators" className="mt-6">
          <ExternalCollaboratorManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}