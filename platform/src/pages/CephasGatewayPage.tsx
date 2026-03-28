/**
 * Cephas Gateway — Links to Cephas docs, Under the Hood, Fly on the Wall, category listings, search (Session 19/20)
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Wrench, Eye, ExternalLink, FileText, Search, Megaphone, Lightbulb } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

const CEPHAS_BASE = "/cephas";

const CATEGORIES: { path: string; label: string }[] = [
  { path: "papers", label: "Academic Papers" },
  { path: "letters", label: "Crown & Outreach Letters" },
  { path: "systems", label: "System Design" },
  { path: "initiatives", label: "Initiatives" },
  { path: "innovations", label: "Innovation Registry" },
  { path: "articles", label: "Articles & Thought Leadership" },
  { path: "vault", label: "Vault Archives" },
];

export default function CephasGatewayPage() {
  return (
    <PortalPageLayout maxWidth="md" xrayId="cephas-gateway-page">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Cephas</h1>
        <p className="text-muted-foreground mt-2">
          Searchable document library — papers, letters, system design, initiatives. Clean prose for academic; pudding styles for the rest.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button asChild variant="outline" size="sm">
          <Link to="/cephas/search" className="inline-flex items-center gap-1">
            <Search className="w-4 h-4" /> Search
          </Link>
        </Button>
        {CATEGORIES.map((c) => (
          <Button key={c.path} asChild variant="outline" size="sm">
            <Link to={`/cephas/${c.path}`}>{c.label}</Link>
          </Button>
        ))}
        <Button asChild variant="outline" size="sm">
          <Link to="/cephas/innovation-pedestals" className="inline-flex items-center gap-1">
            <Lightbulb className="w-4 h-4" /> Innovation Pedestals
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/cephas/press-junket" className="inline-flex items-center gap-1">
            <Megaphone className="w-4 h-4" /> Press Junket
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Under the Hood
            </CardTitle>
            <CardDescription>Technical transparency — how things work.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/cephas/under-the-hood">View index</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Fly on the Wall
            </CardTitle>
            <CardDescription>Public observation log — how decisions were made.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/cephas/fly-on-the-wall">View log</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Full Cephas site
          </CardTitle>
          <CardDescription>Academic papers (clean prose), crown letters, initiatives, and more at /cephas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full sm:w-auto">
            <a href={CEPHAS_BASE} className="inline-flex items-center gap-2">
              Open Cephas
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p>Platform papers directory (local):</p>
        <Button asChild variant="link" className="p-0 h-auto text-primary">
          <Link to="/papers" className="inline-flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Academic Papers Directory
          </Link>
        </Button>
      </div>
    </PortalPageLayout>
  );
}
