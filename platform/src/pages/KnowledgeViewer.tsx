import { useParams } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { CephasResourcePanel, KnowledgeGraphNav } from "@/components/cephas";
import { BookOpen } from "lucide-react";

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function KnowledgeViewer() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;

  return (
    <PortalPageLayout
      title={
        <span className="inline-flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          {slugToTitle(slug)}
        </span>
      }
      subtitle="Community knowledge and related features"
      maxWidth="lg"
      xrayId="knowledge-viewer"
    >
      <div className="space-y-6 pb-12">
        <KnowledgeGraphNav articleSlug={slug} />
        <CephasResourcePanel articleSlug={slug} />
      </div>
    </PortalPageLayout>
  );
}
