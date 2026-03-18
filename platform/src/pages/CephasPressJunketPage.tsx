/**
 * Press Junket — published articles, pending submissions, embargoed content, press kit (Session 20)
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Send, Lock, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";

const INNOVATION_COUNT = "1,748";
const PATENT_CLAIMS = "1,336";
const PROVISIONAL_APPS = "6";

export default function CephasPressJunketPage() {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8" data-xray-id="cephas-press-junket">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Megaphone className="w-8 h-8 text-primary" />
          Press Junket
        </h1>
        <p className="text-muted-foreground mt-1">
          Press kit, publication targets, and Golden Key embed system for media and partners.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Press kit
          </CardTitle>
          <CardDescription>Logo, Founder bio, key facts. Download for coverage and partnerships.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Liana Banyan logo (PNG/SVG)</li>
            <li>Founder bio: 52-year-old Army veteran (11B + 15A), FAA Commercial Rotary Wing IFR, father of eight, 21 years IT, 37 years developing this system (1989–2026)</li>
            <li>Key facts: {INNOVATION_COUNT} innovations, {PATENT_CLAIMS} patent claims across {PROVISIONAL_APPS} provisional applications, 83.3% to creators (Cost + 20%), $5/year membership, 16 initiatives</li>
          </ul>
          <Button variant="outline" size="sm" asChild>
            <a href="https://cephas.lianabanyan.com/press-kit/" target="_blank" rel="noopener noreferrer">
              Open press kit (Cephas)
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Publication targets
          </CardTitle>
          <CardDescription>Where we submit and publish. Credit voting for published pieces.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Academic and industry targets per CONTEXT_MANAGEMENT and Bishop handoffs. Published articles appear with Credit voting; pending submissions and embargoed content listed in Cephas when available.
          </p>
          <Link to="/cephas/articles" className="text-primary text-sm hover:underline mt-2 inline-block">
            View articles & thought leadership →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Embargoed content
          </CardTitle>
          <CardDescription>Under embargo until launch. Staged for Day 1–2 letter sequence.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Day 1 letters (AA/AB/AC) and Day 2 letters (BA/BB/BC), trigger-based (e.g. Buffett at 100 signups), and hold letters per OPENING_GAMBIT. All SEC-clean, 16 initiatives, innovation count {INNOVATION_COUNT}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Golden Key embed system</CardTitle>
          <CardDescription>Documented in Under the Hood. Enables third-party sites to surface Liana Banyan content with proper attribution.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" asChild>
            <Link to="/cephas/under-the-hood">Under the Hood</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
