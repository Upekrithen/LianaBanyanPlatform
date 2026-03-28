import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, Lightbulb, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PortalPageLayout } from '@/components/PortalPageLayout';

const CROWN_RECIPIENTS: Record<string, { name: string; title: string; sentDate: string; initiative: string }> = {
  scott: { name: 'MacKenzie Scott', title: 'Philanthropist & Author', sentDate: '2026-01-15', initiative: 'Platform-wide' },
  buffett: { name: 'Warren Buffett', title: 'Chairman, Berkshire Hathaway', sentDate: '2026-01-20', initiative: 'VSL / Economics' },
  khan: { name: 'Sal Khan', title: 'Founder, Khan Academy', sentDate: '2026-01-22', initiative: 'Didasko (Academic)' },
  dougherty: { name: 'Dale Dougherty', title: 'Founder, Make: Magazine', sentDate: '2026-02-01', initiative: "Let's Make Bread" },
  newmark: { name: 'Craig Newmark', title: 'Founder, Craigslist', sentDate: '2026-02-05', initiative: 'Platform Infrastructure' },
  glenn: { name: 'Ruth Glenn', title: 'DV Advocate', sentDate: '2026-02-10', initiative: 'Defense Klaus' },
  williams: { name: 'Kimberly A. Williams', title: 'Rally Group Crown', sentDate: '2026-02-12', initiative: 'Rally Group' },
  kaiser: { name: 'George Kaiser', title: 'Philanthropist', sentDate: '2026-02-15', initiative: 'VSL' },
  seibel: { name: 'Michael Seibel', title: 'Managing Director, YC', sentDate: '2026-02-18', initiative: 'Platform Growth' },
  simon: { name: 'David Simon', title: 'Creator, The Wire', sentDate: '2026-02-20', initiative: 'Harper Guild' },
  schlossberg: { name: 'Tatiana Schlossberg', title: 'Journalist & Author', sentDate: '2026-03-01', initiative: 'Health Accords' },
};

export default function CrownLetterUpdate() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const recipient = slug ? CROWN_RECIPIENTS[slug] : null;

  if (!recipient) {
    return (
      <PortalPageLayout variant="stage" maxWidth="lg" xrayId="crown-letter-update-404">
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold text-foreground mb-4">Crown Letter Not Found</h1>
          <p className="text-muted-foreground mb-6">
            No Crown Letter update exists for &ldquo;{slug}&rdquo;.
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </PortalPageLayout>
    );
  }

  const sentDate = new Date(recipient.sentDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId={`crown-letter-update-${slug}`}>
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <header className="mb-10">
        <Badge variant="outline" className="mb-3 text-amber-600 border-amber-600">Crown Letter Update</Badge>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">
          {recipient.name}
        </h1>
        <p className="text-xl text-muted-foreground">{recipient.title}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Letter sent {sentDate}</span>
          <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> {recipient.initiative}</span>
        </div>
      </header>

      {/* Timeline placeholder — Bishop will populate via DB */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Clock className="w-6 h-6" /> What&apos;s Changed Since Your Letter
        </h2>

        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">Timeline Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Updates for this Crown Letter recipient will appear here once
              Bishop populates the <code>crown_letter_updates</code> table.
              Each entry includes a date, headline, body, and relevance tags.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Current Platform State */}
      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Lightbulb className="w-6 h-6" /> Current Platform State
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-extrabold text-amber-600">1,828</p>
              <p className="text-sm text-muted-foreground mt-1">Innovations Protected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-extrabold text-emerald-600">1,511</p>
              <p className="text-sm text-muted-foreground mt-1">Formal Patent Claims</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-extrabold text-blue-600">8</p>
              <p className="text-sm text-muted-foreground mt-1">Provisional Applications</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Personalized section — placeholder */}
      <section className="mt-10 mb-12 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          What Changed That Matters To You
        </h2>
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              This section will be personalized for <strong>{recipient.name}</strong> based
              on their initiative alignment ({recipient.initiative}). Bishop will write
              this content based on the slug-specific relevance tags.
            </p>
          </CardContent>
        </Card>
      </section>
    </PortalPageLayout>
  );
}
