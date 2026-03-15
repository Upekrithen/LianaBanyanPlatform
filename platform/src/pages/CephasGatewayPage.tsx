/**
 * Cephas Gateway — Links to Cephas docs, Under the Hood, Fly on the Wall (Session 19)
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Wrench, Eye, ExternalLink, FileText } from "lucide-react";

const CEPHAS_BASE = "https://cephas.lianabanyan.com";

export default function CephasGatewayPage() {
  return (
    <div className="container max-w-3xl mx-auto p-6 space-y-8" data-xray-id="cephas-gateway-page">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Cephas</h1>
        <p className="text-muted-foreground mt-2">
          Searchable document library — papers, letters, system design, initiatives. Clean prose for academic; pudding styles for the rest.
        </p>
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
          <CardDescription>Academic papers (clean prose), crown letters, initiatives, and more at cephas.lianabanyan.com.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full sm:w-auto">
            <a href={CEPHAS_BASE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
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
    </div>
  );
}
