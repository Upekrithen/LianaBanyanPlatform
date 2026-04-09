import { useRef, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface PrintableCueCardProps {
  businessName: string;
  businessSlug: string;
  memberName: string;
  memberSlug: string;
  memberBrandUrl?: string;
  memberContact?: string;
}

const CARD_WIDTH = '3.5in';
const CARD_HEIGHT = '2in';

export function PrintableCueCard({
  businessName,
  businessSlug,
  memberName,
  memberSlug,
  memberBrandUrl,
  memberContact,
}: PrintableCueCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const redCarpetUrl = `https://lianabanyan.com/red-carpet?for=${businessSlug}&from=${memberSlug}`;

  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !cardRef.current) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cue Card — ${businessName}</title>
        <style>
          @page { size: 3.5in 2in; margin: 0; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { width: 3.5in; height: 2in; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .card { width: 3.5in; height: 2in; display: flex; flex-direction: column; justify-content: space-between; padding: 0.2in; background: #0f172a; color: #f8fafc; }
          .top { display: flex; align-items: center; gap: 0.1in; }
          .logo { width: 0.4in; height: 0.4in; object-fit: contain; border-radius: 4px; }
          .logo-placeholder { width: 0.4in; height: 0.4in; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; color: #0f172a; }
          .middle { display: flex; align-items: center; justify-content: space-between; }
          .biz-name { font-size: 11px; font-weight: 700; color: #fbbf24; max-width: 1.8in; }
          .scan-text { font-size: 6.5px; color: #94a3b8; max-width: 1.8in; line-height: 1.4; margin-top: 2px; }
          .qr-box { flex-shrink: 0; }
          .qr-box canvas { display: block; }
          .bottom { display: flex; justify-content: space-between; align-items: flex-end; }
          .tagline { font-size: 7px; color: #fbbf24; font-style: italic; font-weight: 600; }
          .member-info { font-size: 6.5px; color: #94a3b8; text-align: right; line-height: 1.4; }
        </style>
      </head>
      <body>
        ${cardRef.current.innerHTML}
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }, [businessName]);

  const handleDownloadPDF = useCallback(async () => {
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [3.5, 2] });

      pdf.setFillColor('#0f172a');
      pdf.rect(0, 0, 3.5, 2, 'F');

      // Logo text
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#f59e0b');
      pdf.text('LB', 0.4, 0.45);

      // Business name
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#fbbf24');
      pdf.text(businessName, 0.25, 0.95, { maxWidth: 1.8 });

      // Scan text
      pdf.setFontSize(6.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#94a3b8');
      pdf.text(
        `Scan to learn how ${businessName} can earn more with the cooperative.`,
        0.25,
        1.2,
        { maxWidth: 1.8 },
      );

      // QR Code
      const qrCanvas = qrRef.current;
      if (qrCanvas) {
        const qrData = qrCanvas.toDataURL('image/png');
        pdf.addImage(qrData, 'PNG', 2.35, 0.4, 0.9, 0.9);
      }

      // Tagline
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bolditalic');
      pdf.setTextColor('#fbbf24');
      pdf.text('Help Each Other Help Ourselves.', 0.25, 1.75);

      // Member info
      pdf.setFontSize(6.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#94a3b8');
      const memberLine = memberContact ? `${memberName} | ${memberContact}` : memberName;
      pdf.text(memberLine, 3.25, 1.75, { align: 'right' });

      pdf.save(`cue-card-${businessSlug}.pdf`);
      toast.success('Business card PDF downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  }, [businessName, businessSlug, memberName, memberContact]);

  return (
    <div className="space-y-4">
      {/* Live preview */}
      <div
        ref={cardRef}
        className="rounded-xl border-2 border-amber-500/30 overflow-hidden mx-auto"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <div className="card" style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '0.2in', background: '#0f172a', color: '#f8fafc',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          {/* Top: Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.1in' }}>
            {memberBrandUrl ? (
              <img src={memberBrandUrl} alt="" className="logo" style={{ width: '0.4in', height: '0.4in', objectFit: 'contain', borderRadius: 4 }} />
            ) : (
              <div style={{
                width: '0.4in', height: '0.4in', background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14, color: '#0f172a',
              }}>
                LB
              </div>
            )}
          </div>

          {/* Middle: Business name + QR */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ maxWidth: '1.8in' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>{businessName}</div>
              <div style={{ fontSize: 6.5, color: '#94a3b8', lineHeight: 1.4, marginTop: 2 }}>
                Scan to learn how {businessName} can earn more with the cooperative.
              </div>
            </div>
            <div className="qr-box" style={{ flexShrink: 0 }}>
              <QRCodeCanvas value={redCarpetUrl} size={64} bgColor="#0f172a" fgColor="#f8fafc" level="M" />
            </div>
          </div>

          {/* Bottom: Tagline + member */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 7, color: '#fbbf24', fontStyle: 'italic', fontWeight: 600 }}>
              Help Each Other Help Ourselves.
            </div>
            <div style={{ fontSize: 6.5, color: '#94a3b8', textAlign: 'right', lineHeight: 1.4 }}>
              {memberName}
              {memberContact && <><br />{memberContact}</>}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        <Button onClick={handlePrint} variant="outline" className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
          <Printer className="w-4 h-4 mr-1.5" />
          Print as Business Card
        </Button>
        <Button onClick={handleDownloadPDF} variant="outline" className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">
          <Download className="w-4 h-4 mr-1.5" />
          Download PDF
        </Button>
      </div>

      {/* Hidden QR for PDF generation at higher resolution */}
      <div style={{ position: 'absolute', left: -9999 }}>
        <QRCodeCanvas ref={qrRef as never} value={redCarpetUrl} size={512} level="M" bgColor="#0f172a" fgColor="#f8fafc" />
      </div>
    </div>
  );
}

export default PrintableCueCard;
