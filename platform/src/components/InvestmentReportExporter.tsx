import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

export function ContributionReportExporter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const exportToPDF = async () => {
    if (!user) return;
    
    setExporting(true);
    try {
      // Fetch all contribution data
      const [votesRes, creditsRes, vestingRes] = await Promise.all([
        supabase
          .from('user_votes')
          .select(`
            id,
            vote_amount,
            created_at,
            production_levels (
              products (
                name,
                projects (
                  name
                )
              )
            )
          `)
          .eq('user_id', user.id),
        supabase.from('user_credits').select('*').eq('user_id', user.id).single(),
        supabase.from('eoi_vesting_schedules').select('*, projects(name)').eq('user_id', user.id)
      ]);

      const votes = votesRes.data || [];
      const credits = creditsRes.data;
      const vesting = vestingRes.data || [];

      // Create PDF
      const doc = new jsPDF();
      let yPos = 20;

      // Title
      doc.setFontSize(20);
      doc.text('Contribution Report', 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPos);
      yPos += 15;

      // Credits Summary
      doc.setFontSize(14);
      doc.text('Credits Summary', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      if (credits) {
        doc.text(`Available Credits: $${Number(credits.available_credits || 0).toFixed(2)}`, 20, yPos);
        yPos += 6;
        doc.text(`Used Credits: $${Number(credits.used_credits || 0).toFixed(2)}`, 20, yPos);
        yPos += 6;
        doc.text(`Total Credits: $${Number(credits.total_credits || 0).toFixed(2)}`, 20, yPos);
        yPos += 6;
        doc.text(`EOI Credits: $${Number(credits.eoi_credits || 0).toFixed(2)}`, 20, yPos);
        yPos += 10;
      }

      // Votes Summary
      doc.setFontSize(14);
      doc.text('Voting History', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      
      if (votes.length === 0) {
        doc.text('No votes recorded', 20, yPos);
        yPos += 10;
      } else {
        votes.forEach((vote: any, idx: number) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          const projectName = vote.production_levels?.products?.projects?.name || 'Unknown';
          const productName = vote.production_levels?.products?.name || 'Unknown';
          doc.text(`${idx + 1}. ${projectName} - ${productName}`, 20, yPos);
          yPos += 5;
          doc.text(`   Votes: ${vote.vote_amount || 0}`, 20, yPos);
          yPos += 7;
        });
      }

      // Vesting Summary
      if (vesting.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.text('EOI Vesting Schedules', 20, yPos);
        yPos += 8;
        doc.setFontSize(10);

        vesting.forEach((schedule: any, idx: number) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`${idx + 1}. ${schedule.projects?.name || 'Unknown'}`, 20, yPos);
          yPos += 5;
          doc.text(`   Total EOI: ${schedule.eoi_amount}`, 20, yPos);
          yPos += 5;
          doc.text(`   Vested: ${schedule.amount_vested}`, 20, yPos);
          yPos += 5;
          doc.text(`   Days: ${schedule.days_elapsed}/${schedule.total_vesting_days}`, 20, yPos);
          yPos += 7;
        });
      }

      // Save PDF
      doc.save(`contribution-report-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Report exported",
        description: "Your contribution report has been downloaded",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Could not generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <CardTitle>Contribution Reports</CardTitle>
        </div>
        <CardDescription>Export your complete contribution history</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={exportToPDF} disabled={exporting} className="w-full">
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export PDF Report
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Includes all votes, credits, and vesting schedules
        </p>
      </CardContent>
    </Card>
  );
}

/** @deprecated Use ContributionReportExporter instead */
export const InvestmentReportExporter = ContributionReportExporter;