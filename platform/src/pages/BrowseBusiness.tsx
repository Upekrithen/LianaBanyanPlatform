import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Code, Palette, Wrench, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";

export default function BrowseBusiness() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const positionCategories = [
    {
      titleKey: "browseBusiness.technical.title",
      descriptionKey: "browseBusiness.technical.description",
      icon: <Code className="h-8 w-8" />,
      openings: 8,
      avgParticipation: "5-15%"
    },
    {
      titleKey: "browseBusiness.creative.title",
      descriptionKey: "browseBusiness.creative.description",
      icon: <Palette className="h-8 w-8" />,
      openings: 5,
      avgParticipation: "3-10%"
    },
    {
      titleKey: "browseBusiness.operations.title",
      descriptionKey: "browseBusiness.operations.description",
      icon: <Briefcase className="h-8 w-8" />,
      openings: 6,
      avgParticipation: "10-20%"
    },
    {
      titleKey: "browseBusiness.trades.title",
      descriptionKey: "browseBusiness.trades.description",
      icon: <Wrench className="h-8 w-8" />,
      openings: 12,
      avgParticipation: "2-8%"
    },
    {
      titleKey: "browseBusiness.growth.title",
      descriptionKey: "browseBusiness.growth.description",
      icon: <TrendingUp className="h-8 w-8" />,
      openings: 4,
      avgParticipation: "4-12%"
    },
    {
      titleKey: "browseBusiness.hr.title",
      descriptionKey: "browseBusiness.hr.description",
      icon: <Users className="h-8 w-8" />,
      openings: 3,
      avgParticipation: "8-15%"
    }
  ];

  return (
    <PortalPageLayout maxWidth="xl" xrayId="browse-business-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('browseBusiness.title')}</h1>
        <p className="text-muted-foreground">{t('browseBusiness.subtitle')}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">{t('browseBusiness.positionCategories')}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {positionCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {category.icon}
                  </div>
                  <Badge variant="secondary">{category.openings} {t('browseBusiness.openings')}</Badge>
                </div>
                <CardTitle className="mt-4">{t(category.titleKey)}</CardTitle>
                <CardDescription>{t(category.descriptionKey)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('browseBusiness.avgParticipation')}: {category.avgParticipation}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => navigate('/contract-positions')}
                  >
                    {t('browseBusiness.viewPositions')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PortalPageLayout>
  );
}
