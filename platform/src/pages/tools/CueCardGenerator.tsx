import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Download, Store, QrCode, Palette, Eye, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { PrintableCueCard } from '@/components/cue-cards/PrintableCueCard';

interface StorefrontRow {
  id: string;
  name: string;
  slug: string;
  order_cutoff_time: string;
  delivery_window_start: string;
  delivery_window_end: string;
  business_location: string | null;
}

const TEMPLATES = [
  { id: 'classic', label: 'Classic', bg: '#1e293b', text: '#f8fafc', accent: '#f59e0b' },
  { id: 'clean', label: 'Clean White', bg: '#ffffff', text: '#1e293b', accent: '#7c3aed' },
  { id: 'bold', label: 'Bold Red', bg: '#991b1b', text: '#ffffff', accent: '#fcd34d' },
  { id: 'nature', label: 'Forest', bg: '#14532d', text: '#f0fdf4', accent: '#86efac' },
];

function formatTime(t: string | null): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function CueCardGenerator() {
  const { user } = useAuth();
  const [storefronts, setStorefronts] = useState<StorefrontRow[]>([]);
  const [selectedSf, setSelectedSf] = useState<string>('');
  const [template, setTemplate] = useState('classic');
  const [tagline, setTagline] = useState('Pre-order tonight. Pickup tomorrow.');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recruitBiz, setRecruitBiz] = useState('');
  const [recruitContact, setRecruitContact] = useState('');
  const frontCanvasRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('storefronts' as never)
        .select('id, name, slug, order_cutoff_time, delivery_window_start, delivery_window_end, business_location')
        .eq('user_id', user.id) as { data: StorefrontRow[] | null };
      setStorefronts(data || []);
      if (data && data.length > 0) setSelectedSf(data[0].id);
      setLoading(false);
    })();
  }, [user]);

  const sf = storefronts.find(s => s.id === selectedSf);
  const menuUrl = sf ? `https://lianabanyan.com/menu/${sf.slug}` : '';
  const tmpl = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];

  const generatePDF = async () => {
    if (!sf) return;
    setGenerating(true);

    try {
      const CARD_W = 3.5;
      const CARD_H = 2;
      const DPI = 300;
      const PX_W = CARD_W * DPI;
      const PX_H = CARD_H * DPI;

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [CARD_W, CARD_H] });

      // --- FRONT ---
      pdf.setFillColor(tmpl.bg);
      pdf.rect(0, 0, CARD_W, CARD_H, 'F');

      pdf.setTextColor(tmpl.text);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(sf.name, CARD_W / 2, 0.55, { align: 'center' });

      if (sf.business_location) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(sf.business_location, CARD_W / 2, 0.75, { align: 'center' });
      }

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(tagline, CARD_W / 2, 1.05, { align: 'center' });

      const cutoff = sf.order_cutoff_time === '00:00:00' ? 'Midnight' : formatTime(sf.order_cutoff_time);
      const window = `${formatTime(sf.delivery_window_start)}–${formatTime(sf.delivery_window_end)}`;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(tmpl.accent);
      pdf.text(`Order by ${cutoff}  |  Pickup ${window}`, CARD_W / 2, 1.35, { align: 'center' });

      pdf.setFontSize(7);
      pdf.setTextColor(tmpl.text);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Powered by Liana Banyan  |  Cost + 20% locked forever', CARD_W / 2, 1.75, { align: 'center' });

      // --- BACK ---
      pdf.addPage([CARD_W, CARD_H], 'landscape');

      pdf.setFillColor(tmpl.bg);
      pdf.rect(0, 0, CARD_W, CARD_H, 'F');

      // QR code
      const qrCanvas = document.querySelector('#qr-hidden canvas') as HTMLCanvasElement;
      if (qrCanvas) {
        const qrData = qrCanvas.toDataURL('image/png');
        const qrSize = 1.1;
        pdf.addImage(qrData, 'PNG', (CARD_W - qrSize) / 2, 0.2, qrSize, qrSize);
      }

      pdf.setFontSize(8);
      pdf.setTextColor(tmpl.text);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Scan to order', CARD_W / 2, 1.45, { align: 'center' });

      pdf.setFontSize(7);
      pdf.text(menuUrl, CARD_W / 2, 1.6, { align: 'center' });

      pdf.setFontSize(6);
      pdf.setTextColor(tmpl.accent);
      pdf.text('LIANA BANYAN', CARD_W / 2, 1.85, { align: 'center' });

      pdf.save(`cue-card-${sf.slug}.pdf`);
      toast.success('Cue Card PDF downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <PortalPageLayout variant="stage" maxWidth="lg" xrayId="cue-card-generator">
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-slate-400">Loading...</div>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="cue-card-generator">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="text-center mb-8">
        <CreditCard className="w-12 h-12 mx-auto mb-3 text-amber-400" />
        <h1 className="text-3xl font-bold mb-2" data-xray-id="cue-card-title">QR Cue Card Generator</h1>
        <p className="text-slate-400">Create printable business cards with QR codes for your storefronts</p>
      </div>

      {storefronts.length === 0 ? (
        <div className="text-center py-12">
          <Store className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-4">Create a storefront first to generate cue cards.</p>
          <Link to="/tools/storefront-builder">
            <Button className="bg-amber-600 hover:bg-amber-700">Build a Storefront</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle className="text-lg">Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Storefront</Label>
                  <Select value={selectedSf} onValueChange={setSelectedSf}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {storefronts.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Template</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => setTemplate(t.id)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          template === t.id ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-slate-700 hover:border-slate-600'
                        }`}
                        style={{ backgroundColor: t.bg, color: t.text }}>
                        <Palette className="w-4 h-4 mb-1" style={{ color: t.accent }} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input value={tagline} onChange={e => setTagline(e.target.value)} className="mt-1" maxLength={60} />
                  <p className="text-xs text-slate-500 mt-1">{60 - tagline.length} characters remaining</p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={generatePDF} disabled={!sf || generating} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg">
              <Download className="w-5 h-5 mr-2" />
              {generating ? 'Generating...' : 'Download PDF (3.5" × 2")'}
            </Button>

            {sf && (
              <p className="text-xs text-center text-slate-500">
                Links to: <a href={menuUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">{menuUrl}</a>
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2"><Eye className="w-4 h-4" /> Preview</h3>

            {/* Front */}
            <div ref={frontCanvasRef} className="rounded-xl border-2 border-slate-600 overflow-hidden" style={{ aspectRatio: '3.5/2' }}>
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                style={{ backgroundColor: tmpl.bg, color: tmpl.text }}>
                <h2 className="text-xl font-bold mb-1">{sf?.name || 'Your Business'}</h2>
                {sf?.business_location && <p className="text-xs opacity-70 mb-2">{sf.business_location}</p>}
                <p className="text-sm mb-3">{tagline}</p>
                <p className="text-xs font-bold" style={{ color: tmpl.accent }}>
                  Order by {sf?.order_cutoff_time === '00:00:00' ? 'Midnight' : formatTime(sf?.order_cutoff_time || '')} | Pickup {formatTime(sf?.delivery_window_start || '')}–{formatTime(sf?.delivery_window_end || '')}
                </p>
                <p className="text-[10px] opacity-50 mt-4">Powered by Liana Banyan | Cost + 20% locked forever</p>
              </div>
            </div>

            {/* Back */}
            <div className="rounded-xl border-2 border-slate-600 overflow-hidden" style={{ aspectRatio: '3.5/2' }}>
              <div className="w-full h-full flex flex-col items-center justify-center p-6"
                style={{ backgroundColor: tmpl.bg, color: tmpl.text }}>
                {menuUrl && (
                  <QRCodeCanvas value={menuUrl} size={120} bgColor={tmpl.bg} fgColor={tmpl.text}
                    level="M" includeMargin={false} />
                )}
                <p className="text-xs mt-2 opacity-70">Scan to order</p>
                <p className="text-[10px] opacity-50 mt-1">{menuUrl}</p>
                <p className="text-[10px] font-bold mt-2" style={{ color: tmpl.accent }}>LIANA BANYAN</p>
              </div>
            </div>

            <Badge variant="outline" className="border-slate-600 text-slate-400">
              <CreditCard className="w-3 h-3 mr-1" /> Standard business card: 3.5" × 2"
            </Badge>
          </div>
        </div>
      )}

      {/* ── Recruitment Business Card ── */}
      <div className="mt-12 pt-8 border-t border-slate-700">
        <div className="text-center mb-6">
          <Users className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
          <h2 className="text-xl font-bold mb-1" data-xray-id="recruit-business-card">Recruitment Business Card</h2>
          <p className="text-sm text-slate-400">
            Print cards to hand to businesses you want to recruit. Scan leads to their Red Carpet.
          </p>
        </div>
        <div className="max-w-md mx-auto space-y-4 mb-6">
          <div>
            <Label>Business Name</Label>
            <Input
              value={recruitBiz}
              onChange={e => setRecruitBiz(e.target.value)}
              placeholder="e.g. Main Street Bakery"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Your Contact Info (optional)</Label>
            <Input
              value={recruitContact}
              onChange={e => setRecruitContact(e.target.value)}
              placeholder="Phone or email"
              className="mt-1"
            />
          </div>
        </div>
        {recruitBiz.trim() && user && (
          <PrintableCueCard
            businessName={recruitBiz}
            businessSlug={recruitBiz.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
            memberName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member'}
            memberSlug={user.id}
            memberContact={recruitContact || undefined}
          />
        )}
      </div>

      {/* Hidden QR for PDF generation */}
      <div id="qr-hidden" className="hidden">
        {menuUrl && <QRCodeCanvas ref={qrRef as never} value={menuUrl} size={512} level="M" />}
      </div>
    </PortalPageLayout>
  );
}
