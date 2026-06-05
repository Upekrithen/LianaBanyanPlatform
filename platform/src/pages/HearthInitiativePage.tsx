import { useTranslation } from "react-i18next";
import { usePageSEO } from "@/hooks/usePageSEO";

export default function HearthInitiativePage() {
  usePageSEO({
    title: "Hearth Initiative | Liana Banyan",
    description: "Community warmth and home energy mutual aid. Cooperative winter preparedness and household support.",
    canonical: "https://lianabanyan.com/initiatives/hearth",
  });
  const { t } = useTranslation();
  return <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">Coming soon.</p></div>;
}
