import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Copy, Download, Share2, Mail,
  MessageSquare, QrCode, Check, Sparkles, Send, Eye,
  CreditCard, Rocket, Users, Lightbulb, Palette, Package
} from 'lucide-react';
import { useCueCardCampaigns, type CueCardCampaign } from '@/hooks/useCueCardCampaigns';
import { useAuth } from '@/contexts/AuthContext';
import { useSendEmail } from '@/hooks/useSendEmail';
import { supabase } from '@/integrations/supabase/client';
import QRCode from 'qrcode';

const ICON_MAP: Record<string, React.ReactNode> = {
  CreditCard: <CreditCard className="w-8 h-8" />,
  Rocket: <Rocket className="w-8 h-8" />,
  Users: <Users className="w-8 h-8" />,
  Lightbulb: <Lightbulb className="w-8 h-8" />,
  Palette: <Palette className="w-8 h-8" />,
  Package: <Package className="w-8 h-8" />,
  Sparkles: <Sparkles className="w-8 h-8" />,
};

const CTA_OPTIONS = [
  'Check This Out',
  'Join My Project',
  'Start Your Own',
  'Come See What We Built',
];

function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

interface ShareData {
  id: string;
  shortCode: string;
  qrDataUrl: string;
}

export default function CueCardCreator() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: campaigns = [], isLoading } = useCueCardCampaigns();
  const sendEmail = useSendEmail();

  const [step, setStep] = useState(1);
  const [selectedCampaign, setSelectedCampaign] = useState<CueCardCampaign | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [callToAction, setCallToAction] = useState(CTA_OPTIONS[0]);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const shareUrl = useMemo(
    () => shareData ? `${window.location.origin}/c/${shareData.shortCode}` : '',
    [shareData]
  );

  const handleSelectTemplate = useCallback((campaign: CueCardCampaign | null) => {
    setSelectedCampaign(campaign);
    setIsCustom(!campaign);
    setStep(2);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      const shortCode = generateShortCode();
      const { data, error } = await supabase
        .from('cue_card_shares' as never)
        .insert({
          creator_id: user.id,
          campaign_id: selectedCampaign?.id || null,
          short_code: shortCode,
          recipient_name: recipientName || null,
          personal_message: personalMessage || null,
          call_to_action: callToAction,
        } as never)
        .select('id')
        .single();

      if (error) throw error;

      const url = `${window.location.origin}/c/${shortCode}`;
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 900,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });

      setShareData({ id: (data as { id: string }).id, shortCode, qrDataUrl });
      setStep(3);

      // Send email + auto-register in Red Carpet if email provided
      if (recipientEmail.trim()) {
        sendEmail.mutate({
          email: recipientEmail.trim(),
          type: 'outreach',
          data: {
            recipientName: recipientName || undefined,
            senderName: user.user_metadata?.display_name || user.user_metadata?.full_name || 'A Liana Banyan member',
            subject: selectedCampaign?.title || 'You\'ve been sent a Cue Card on Liana Banyan',
            body: `${personalMessage || 'I wanted to share something exciting with you.'}\n\n<a href="${url}" style="color: #e94560; font-weight: bold;">${callToAction} &rarr;</a>`,
            cueCardType: selectedCampaign?.craft_type || 'personal',
          },
        }, {
          onSuccess: () => setEmailSent(true),
        });
      }
    } catch (err) {
      console.error('Failed to create cue card share:', err);
    } finally {
      setSaving(false);
    }
  }, [user, selectedCampaign, recipientName, recipientEmail, personalMessage, callToAction, sendEmail]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleDownloadQR = useCallback(() => {
    if (!shareData) return;
    const a = document.createElement('a');
    a.href = shareData.qrDataUrl;
    a.download = `cue-card-${shareData.shortCode}.png`;
    a.click();
  }, [shareData]);

  const handleShareNative = useCallback(() => {
    if (!navigator.share) return;
    navigator.share({
      title: selectedCampaign?.title || 'Check out Liana Banyan',
      text: personalMessage || 'I wanted to share this with you!',
      url: shareUrl,
    });
  }, [selectedCampaign, personalMessage, shareUrl]);

  const handleEmailShare = useCallback(() => {
    const subject = encodeURIComponent(selectedCampaign?.title || 'Check this out on Liana Banyan');
    const body = encodeURIComponent(
      `${recipientName ? `Hey ${recipientName}!\n\n` : ''}${personalMessage || "I thought you'd find this interesting."}\n\n${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }, [selectedCampaign, recipientName, personalMessage, shareUrl]);

  const handleTextShare = useCallback(() => {
    const body = encodeURIComponent(
      `${recipientName ? `Hey ${recipientName}! ` : ''}${personalMessage || 'Check this out!'} ${shareUrl}`
    );
    window.open(`sms:?body=${body}`);
  }, [recipientName, personalMessage, shareUrl]);

  const handleWhatsAppShare = useCallback(() => {
    const text = encodeURIComponent(
      `${recipientName ? `Hey ${recipientName}! ` : ''}${personalMessage || 'Check this out!'} ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`);
  }, [recipientName, personalMessage, shareUrl]);

  const previewGreeting = recipientName ? `Hey ${recipientName}!` : 'Hey there!';
  const previewMessage = personalMessage || 'I wanted to share something exciting with you.';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create a Cue Card</h1>
          <p className="text-white/60">Personalize and share with anyone — track every view and signup</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s === step ? 'bg-primary text-white scale-110' : s < step ? 'bg-green-500 text-white' : 'bg-white/10 text-white/40'
              }`}>
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-green-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Choose Template */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <h2 className="text-xl font-semibold text-white mb-6">Choose a Campaign Template</h2>
              {isLoading ? (
                <div className="text-white/50 text-center py-12">Loading campaigns...</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campaigns.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectTemplate(c)}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-primary/20 text-primary">
                          {ICON_MAP[c.icon] || <Sparkles className="w-8 h-8" />}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-primary transition-colors">{c.title}</div>
                          <div className="text-xs text-white/40">{c.craft_type}</div>
                        </div>
                      </div>
                      <p className="text-sm text-white/60 line-clamp-2">{c.description_template}</p>
                    </button>
                  ))}
                  {/* Custom option */}
                  <button
                    onClick={() => handleSelectTemplate(null)}
                    className="p-5 rounded-2xl border-2 border-dashed border-white/20 hover:border-primary/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-white/10 text-white/60">
                        <Palette className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-primary">Custom Cue Card</div>
                        <div className="text-xs text-white/40">Blank template</div>
                      </div>
                    </div>
                    <p className="text-sm text-white/60">Start from scratch with your own message</p>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: Personalize */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-white mb-2">Personalize Your Card</h2>

                  <div>
                    <label className="text-sm font-medium text-white/70 mb-1 block">Recipient Name (optional)</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Mom, Jake, Dr. Smith"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/70 mb-1 block">Recipient Email (optional — sends directly)</label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="e.g. friend@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none"
                    />
                    {recipientEmail.trim() && (
                      <p className="text-xs text-primary/70 mt-1">An email with your Cue Card will be sent + they'll get Red Carpet access</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/70 mb-1 block">
                      Personal Message
                      <span className="text-white/40 ml-2">{personalMessage.length}/280</span>
                    </label>
                    <textarea
                      value={personalMessage}
                      onChange={(e) => setPersonalMessage(e.target.value.slice(0, 280))}
                      placeholder="Hey! I've been working on something and I'd love your feedback..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/70 mb-1 block">Call to Action</label>
                    <select
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary/50 focus:outline-none"
                    >
                      {CTA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={saving}
                      className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? 'Creating...' : 'Generate Share Links'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <h3 className="text-sm font-medium text-white/40 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Live Preview
                  </h3>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/30">
                    <div className="text-2xl font-bold text-white mb-1">{previewGreeting}</div>
                    {selectedCampaign && (
                      <div className="text-sm text-primary/80 mb-3">{selectedCampaign.title}</div>
                    )}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 italic text-white/70">
                      "{previewMessage}"
                    </div>
                    {selectedCampaign && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                        <div className="text-sm text-white/50">Featured Campaign</div>
                        <div className="font-medium text-white">{selectedCampaign.title}</div>
                        <div className="text-xs text-white/40">{selectedCampaign.craft_type}</div>
                      </div>
                    )}
                    <div className="inline-block px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm">
                      {callToAction} →
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Share Links */}
          {step === 3 && shareData && (
            <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 mb-4">
                  <Check className="w-5 h-5" /> Cue Card Created!
                </div>
                {emailSent && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 mb-4 ml-2">
                    <Mail className="w-4 h-4" /> Email sent to {recipientEmail}
                  </div>
                )}
                <h2 className="text-2xl font-bold text-white">Share Your Cue Card</h2>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* QR Code + Link */}
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <img
                      src={shareData.qrDataUrl}
                      alt="QR Code"
                      className="w-48 h-48 mx-auto mb-4 rounded-xl"
                    />
                    <div className="text-sm text-white/40 mb-2">Scan or share this link</div>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                      <QrCode className="w-4 h-4 text-primary flex-shrink-0" />
                      <code className="text-sm text-white flex-1 truncate">{shareUrl}</code>
                      <button
                        onClick={handleCopyLink}
                        className="p-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary flex-shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleDownloadQR} className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2">
                      <Download className="w-4 h-4" /> Download QR
                    </button>
                    {typeof navigator.share === 'function' && (
                      <button onClick={handleShareNative} className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> Share
                      </button>
                    )}
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Send It</h3>

                  <button onClick={handleCopyLink} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all flex items-center gap-4 text-left">
                    <div className="p-2.5 rounded-lg bg-blue-500/20"><Copy className="w-5 h-5 text-blue-400" /></div>
                    <div>
                      <div className="font-medium text-white">Copy Link</div>
                      <div className="text-sm text-white/50">Paste anywhere — text, DMs, posts</div>
                    </div>
                  </button>

                  <button onClick={handleTextShare} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/40 transition-all flex items-center gap-4 text-left">
                    <div className="p-2.5 rounded-lg bg-green-500/20"><MessageSquare className="w-5 h-5 text-green-400" /></div>
                    <div>
                      <div className="font-medium text-white">Text Message</div>
                      <div className="text-sm text-white/50">Send via SMS/iMessage</div>
                    </div>
                  </button>

                  <button onClick={handleEmailShare} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all flex items-center gap-4 text-left">
                    <div className="p-2.5 rounded-lg bg-amber-500/20"><Mail className="w-5 h-5 text-amber-400" /></div>
                    <div>
                      <div className="font-medium text-white">Email</div>
                      <div className="text-sm text-white/50">Open email with pre-filled message</div>
                    </div>
                  </button>

                  <button onClick={handleWhatsAppShare} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all flex items-center gap-4 text-left">
                    <div className="p-2.5 rounded-lg bg-emerald-500/20"><Send className="w-5 h-5 text-emerald-400" /></div>
                    <div>
                      <div className="font-medium text-white">WhatsApp</div>
                      <div className="text-sm text-white/50">Share on WhatsApp</div>
                    </div>
                  </button>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => navigate('/dashboard/cue-cards')}
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
                    >
                      My Cue Cards
                    </button>
                    <button
                      onClick={() => { setStep(1); setShareData(null); setRecipientName(''); setRecipientEmail(''); setPersonalMessage(''); setEmailSent(false); }}
                      className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2"
                    >
                      Create Another <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
