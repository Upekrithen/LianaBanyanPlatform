import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function BusinessPlan() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/LIANA_BANYAN_BUSINESS_PLAN.md')
      .then(res => res.text())
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load business plan:', err);
        toast.error('Failed to load business plan');
        setLoading(false);
      });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Liana_Banyan_Business_Plan.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Business plan downloaded');
  };

  if (loading) {
    return (
      <PortalPageLayout maxWidth="xl" xrayId="business-plan">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading business plan...</p>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="xl" xrayId="business-plan">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl">Liana Banyan Business Plan</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Comprehensive business plan including financial projections, market analysis, and operational strategy
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{content}</pre>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
