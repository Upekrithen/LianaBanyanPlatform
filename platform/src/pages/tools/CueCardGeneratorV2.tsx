import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Users, Building2, User, Wand2, KeyRound, DollarSign, Send, Clock, Plus, Trash2, Eye, Factory, Hammer, Package, Briefcase, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateDoorConfig, useCreateDoorRule } from '@/hooks/useDurinsDoor';
import { useCreateSponsoredCard } from '@/hooks/useSponsoredCards';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';

type Audience = 'person' | 'business' | 'general';
type Template = 'business_pitch' | 'member_invite' | 'driver_recruit' | 'family_invite' | 'generic_welcome' | 'mfg_do_the_work' | 'mfg_build_factory' | 'mfg_canister' | 'medallion_scan' | 'recruit_business_owner' | 'recruit_starter_kit';
type Delivery = 'digital' | 'physical' | 'both';

interface DoorEntry {
  key_type: 'phrase' | 'email' | 'code';
  key_value: string;
  template: Template;
}

const TEMPLATES: { id: Template; label: string; icon: React.ReactNode; category?: string }[] = [
  { id: 'business_pitch', label: 'Business Pitch', icon: <Building2 className="w-4 h-4" /> },
  { id: 'member_invite', label: 'Member Invite', icon: <Users className="w-4 h-4" /> },
  { id: 'driver_recruit', label: 'Driver Recruit', icon: <Send className="w-4 h-4" /> },
  { id: 'family_invite', label: 'Family Invite', icon: <User className="w-4 h-4" /> },
  { id: 'generic_welcome', label: 'Generic Welcome', icon: <Wand2 className="w-4 h-4" /> },
  { id: 'mfg_do_the_work', label: 'DO THE WORK', icon: <Hammer className="w-4 h-4" />, category: 'manufacturing' },
  { id: 'mfg_build_factory', label: 'BUILD A FACTORY', icon: <Factory className="w-4 h-4" />, category: 'manufacturing' },
  { id: 'mfg_canister', label: 'CANISTER SYSTEM', icon: <Package className="w-4 h-4" />, category: 'manufacturing' },
  { id: 'medallion_scan', label: 'Medallion Scan', icon: <CreditCard className="w-4 h-4" />, category: 'manufacturing' },
  { id: 'recruit_business_owner', label: 'BUSINESS OWNER', icon: <Briefcase className="w-4 h-4" />, category: 'recruitment' },
  { id: 'recruit_starter_kit', label: 'STARTER KIT', icon: <Gift className="w-4 h-4" />, category: 'recruitment' },
];

const FUND_OPTIONS = [0, 5, 10, 25, 100];
const EXPIRY_OPTIONS = [
  { label: 'Never', days: 0 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

export default function CueCardGeneratorV2() {
  const { user } = useAuth();
  const createDoorConfig = useCreateDoorConfig();
  const createDoorRule = useCreateDoorRule();
  const createCard = useCreateSponsoredCard();

  // Step 1: Audience
  const [audience, setAudience] = useState<Audience>('general');

  // Step 2: Template
  const [template, setTemplate] = useState<Template>('generic_welcome');

  // Step 3: Personalize
  const [recipientName, setRecipientName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Step 4: Durin's Door phrases
  const [doors, setDoors] = useState<DoorEntry[]>([]);

  // Step 5: Funding
  const [fundAmount, setFundAmount] = useState(0);
  const [customFund, setCustomFund] = useState('');
  const [includeMembership, setIncludeMembership] = useState(false);

  // Step 6: Delivery
  const [delivery, setDelivery] = useState<Delivery>('digital');

  // Step 7: Schedule
  const [expiryDays, setExpiryDays] = useState(0);

  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const actualFund = customFund ? parseFloat(customFund) || 0 : fundAmount;
  const MFG_QR_MAP: Partial<Record<Template, string>> = {
    mfg_do_the_work: 'https://lianabanyan.com/production',
    mfg_build_factory: 'https://lianabanyan.com/production',
    mfg_canister: 'https://lianabanyan.com/production',
    recruit_business_owner: 'https://lianabanyan.com/production',
    recruit_starter_kit: 'https://lianabanyan.com/starter-kit',
  };
  const qrUrl = MFG_QR_MAP[template] ?? (user ? `https://lianabanyan.com/w/${user.id}` : '');

  const addDoor = () => {
    setDoors([...doors, { key_type: 'phrase', key_value: '', template }]);
  };

  const updateDoor = (i: number, field: keyof DoorEntry, value: string) => {
    setDoors((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));
  };

  const removeDoor = (i: number) => {
    setDoors((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleGenerate = async () => {
    if (!user) { toast.error('Sign in first'); return; }
    setGenerating(true);
    try {
      // Create door config if we have doors
      let doorConfigId: string | null = null;
      if (doors.length > 0) {
        const config = await createDoorConfig.mutateAsync({
          default_template: template,
          default_data: {
            recipient_name: recipientName,
            business_name: businessName,
            custom_message: customMessage,
          },
          active_until: expiryDays > 0
            ? new Date(Date.now() + expiryDays * 86400000).toISOString()
            : null,
        });
        doorConfigId = config.id;

        for (let i = 0; i < doors.length; i++) {
          const d = doors[i];
          if (!d.key_value.trim()) continue;
          await createDoorRule.mutateAsync({
            config_id: config.id,
            key_type: d.key_type,
            key_value: d.key_value.trim(),
            case_sensitive: false,
            single_use: false,
            template: d.template,
            experience_data: {
              recipient_name: recipientName,
              business_name: businessName,
              custom_message: customMessage,
              show_tiered_chart: template === 'business_pitch',
              tier_recommendation: 'C+40',
              preloaded_amount: actualFund,
            },
            intended_recipient: recipientName || null,
            sort_order: i,
          });
        }
      }

      // Create sponsored card
      const card = await createCard.mutateAsync({
        card_type: delivery,
        preloaded_amount: actualFund,
        include_membership: includeMembership,
        door_config_id: doorConfigId,
        expires_at: expiryDays > 0
          ? new Date(Date.now() + expiryDays * 86400000).toISOString()
          : null,
      });

      setGeneratedCode(card.activation_code);
      toast.success('Card generated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate card');
    } finally {
      setGenerating(false);
    }
  };

  if (generatedCode) {
    return (
      <PortalPageLayout variant="stage" maxWidth="md" xrayId="cue-card-v2-result">
        <div className="text-center space-y-6 py-12">
          <CreditCard className="w-16 h-16 mx-auto text-emerald-400" />
          <h1 className="text-3xl font-bold">Your Card Is Ready</h1>
          <div className="inline-block p-6 bg-white rounded-xl">
            <QRCodeCanvas value={qrUrl} size={200} level="M" />
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Activation Code</p>
            <code className="text-2xl font-mono font-bold text-amber-400 tracking-wider">{generatedCode}</code>
          </div>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Share this QR code or activation code. The recipient scans it, enters any phrase you configured, and gets a personalized welcome.
          </p>
          {actualFund > 0 && (
            <Badge className="bg-emerald-600 text-white text-sm">${actualFund.toFixed(2)} pre-loaded</Badge>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setGeneratedCode(null); setDoors([]); }} variant="outline">Create Another</Button>
            <Link to="/dashboard/cards"><Button>View My Cards</Button></Link>
          </div>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="cue-card-v2">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="text-center mb-8">
        <CreditCard className="w-12 h-12 mx-auto mb-3 text-amber-400" />
        <h1 className="text-3xl font-bold mb-2">Create a Calling Card</h1>
        <p className="text-slate-400">Personalized, optionally pre-funded onboarding cards with Durin's Door routing</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Step 1: Audience */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-base">Step 1: Who Is This For?</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {([['person', 'A Specific Person', User], ['business', 'A Business', Building2], ['general', 'General', Users]] as const).map(([id, label, Icon]) => (
                <button key={id} onClick={() => setAudience(id)}
                  className={`flex-1 p-3 rounded-lg border text-sm flex flex-col items-center gap-1 transition-colors ${
                    audience === id ? 'bg-amber-900/30 border-amber-600/50 text-amber-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}>
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Template */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-base">Step 2: Template</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-2 transition-colors ${
                    template === t.id ? 'bg-violet-900/30 border-violet-600/50 text-violet-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Personalize */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-base">Step 3: Personalize</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Recipient Name</Label>
                <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Optional" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Business Name</Label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Optional" className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Custom Message</Label>
              <Textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Optional personal message..." className="mt-1" rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Durin's Door Phrases */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              Step 4: Access Phrases (Durin's Door)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-slate-500 text-xs">
              Add secret phrases that unlock different experiences. Each phrase can route to a different template.
            </p>
            {doors.map((d, i) => (
              <div key={i} className="flex gap-2 items-start">
                <select value={d.key_type} onChange={(e) => updateDoor(i, 'key_type', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white w-24">
                  <option value="phrase">Phrase</option>
                  <option value="email">Email</option>
                  <option value="code">Code</option>
                </select>
                <Input value={d.key_value} onChange={(e) => updateDoor(i, 'key_value', e.target.value)}
                  placeholder={d.key_type === 'email' ? 'owner@example.com' : d.key_type === 'code' ? 'FRIEND10' : 'borrego'}
                  className="flex-1" />
                <span className="text-white/30 mt-2">→</span>
                <select value={d.template} onChange={(e) => updateDoor(i, 'template', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white w-36">
                  {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <Button variant="ghost" size="sm" onClick={() => removeDoor(i)} className="text-red-400 hover:text-red-300 px-2">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addDoor} className="text-xs">
              <Plus className="w-3 h-3 mr-1" /> Add Door
            </Button>
          </CardContent>
        </Card>

        {/* Step 5: Fund */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Step 5: Fund the Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-slate-500 text-xs">
              Pre-load money onto the card. Funded separately (direct deposit/bank transfer), NOT from Credits.
            </p>
            <div className="flex flex-wrap gap-2">
              {FUND_OPTIONS.map((amt) => (
                <button key={amt} onClick={() => { setFundAmount(amt); setCustomFund(''); }}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    fundAmount === amt && !customFund ? 'bg-emerald-900/30 border-emerald-600/50 text-emerald-300' : 'border-slate-700 text-slate-400'
                  }`}>
                  {amt === 0 ? 'Free' : `$${amt}`}
                </button>
              ))}
              <Input type="number" value={customFund} onChange={(e) => { setCustomFund(e.target.value); setFundAmount(0); }}
                placeholder="$___" className="w-24" min={0} step={5} />
            </div>
            {actualFund >= 5 && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeMembership} onChange={(e) => setIncludeMembership(e.target.checked)}
                  className="rounded border-slate-600" />
                <span className="text-white/70">Include $5 membership in balance</span>
              </label>
            )}
          </CardContent>
        </Card>

        {/* Step 6: Delivery */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-base">Step 6: Delivery</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {([['digital', 'Digital QR'], ['physical', 'Physical Card'], ['both', 'Both']] as const).map(([id, label]) => (
                <button key={id} onClick={() => setDelivery(id)}
                  className={`flex-1 p-3 rounded-lg border text-sm transition-colors ${
                    delivery === id ? 'bg-blue-900/30 border-blue-600/50 text-blue-300' : 'border-slate-700 text-slate-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 7: Schedule */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              Step 7: Expiration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {EXPIRY_OPTIONS.map((opt) => (
                <button key={opt.days} onClick={() => setExpiryDays(opt.days)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    expiryDays === opt.days ? 'bg-white/10 border-white/30 text-white' : 'border-slate-700 text-slate-400'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recruitment template preview */}
        {template.startsWith('recruit_') && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 space-y-3">
              <p className="text-xs text-amber-400 font-medium uppercase tracking-wider">Recruitment Card Preview</p>
              {template === 'recruit_business_owner' && (
                <div className="bg-zinc-900 rounded-lg p-4 text-center space-y-3">
                  <p className="text-2xl font-black text-white tracking-tight">WE DON'T GIVE PEOPLE JOBS.</p>
                  <p className="text-2xl font-black text-amber-400 tracking-tight">WE GIVE THEM BUSINESSES.</p>
                  <p className="text-xs text-zinc-400 font-medium tracking-widest uppercase mt-2">Liana Banyan Cooperative</p>
                  <div className="pt-3 border-t border-zinc-800 mt-3 text-left text-[11px] text-zinc-500 space-y-1">
                    <p>Sole prop to start. LLC when ready. Factory Node when earned.</p>
                    <p className="text-zinc-400">Start at lianabanyan.com/production</p>
                  </div>
                </div>
              )}
              {template === 'recruit_starter_kit' && (
                <div className="bg-zinc-900 rounded-lg p-4 text-center space-y-3">
                  <p className="text-3xl font-black text-emerald-400">$100</p>
                  <p className="text-lg font-bold text-white">BUSINESS STARTER KIT</p>
                  <p className="text-xs text-zinc-400">Everything you need to become a business owner today.</p>
                  <div className="pt-3 border-t border-zinc-800 mt-3 text-left text-[11px] text-zinc-500 space-y-1">
                    <p>✓ 1 year membership + $50 LB Card</p>
                    <p>✓ 500 Marks + Business formation guide</p>
                    <p>✓ Your first bounty</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manufacturing template preview */}
        {template.startsWith('mfg_') && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 space-y-3">
              <p className="text-xs text-amber-400 font-medium uppercase tracking-wider">Manufacturing Card Preview</p>
              {template === 'mfg_do_the_work' && (
                <div className="bg-zinc-900 rounded-lg p-4 text-center space-y-2">
                  <p className="text-xl font-black text-white">DO THE WORK = GET THE STATUS</p>
                  <p className="text-xs text-zinc-400">No resume. No interview. No application.</p>
                  <div className="pt-2 border-t border-zinc-800 mt-3 text-left text-[11px] text-zinc-500 space-y-1">
                    <p><span className="text-zinc-300">0–499</span> Bounty Hunter</p>
                    <p><span className="text-zinc-300">500–999</span> Contractor (1.5x)</p>
                    <p><span className="text-zinc-300">1,000–1,999</span> Senior Contractor (1.75x)</p>
                    <p><span className="text-zinc-300">2,000–4,999</span> Partner (2.0x + revenue share)</p>
                    <p><span className="text-zinc-300">5,000+</span> Senior Partner (2.5x + Factory Node)</p>
                  </div>
                </div>
              )}
              {template === 'mfg_build_factory' && (
                <div className="bg-zinc-900 rounded-lg p-4 text-center space-y-2">
                  <img
                    src="/images/medallion-2nd-second-side-b.png"
                    alt="The 2nd Second Medallion"
                    className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-amber-500/40"
                  />
                  <p className="text-xl font-black text-white">From $300 Kit to Factory Owner</p>
                  <p className="text-xs text-zinc-400">The 2nd Second Industrial Revolution</p>
                  <div className="pt-2 border-t border-zinc-800 mt-3 text-left text-[11px] text-zinc-500 space-y-1">
                    <p><span className="text-amber-400 font-bold">Kit</span> — Canister System · $250–400</p>
                    <p><span className="text-amber-400 font-bold">Bench</span> — Desktop Molder (Babyplast)</p>
                    <p><span className="text-amber-400 font-bold">Shop</span> — SLS Machine · Custom orders</p>
                    <p><span className="text-amber-400 font-bold">Factory</span> — Industrial Press · 50K+ parts/yr</p>
                  </div>
                </div>
              )}
              {template === 'mfg_canister' && (
                <div className="bg-zinc-900 rounded-lg p-4 text-center space-y-2">
                  <img
                    src="/images/medallion-2nd-second-side-b.png"
                    alt="The 2nd Second Medallion"
                    className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-amber-500/40"
                  />
                  <p className="text-xl font-black text-white">Injection Molding for $300</p>
                  <p className="text-xs text-zinc-400">5,207 PSI · 90% cheaper molds · Stackable</p>
                  <div className="pt-2 border-t border-zinc-800 mt-3 text-left text-[11px] text-zinc-500">
                    <p>3D print your molds for $5. Match the Morgan Press. Stack 6 high.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Preview + Generate */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12" disabled>
            <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
          <Button onClick={handleGenerate} disabled={generating || !user} className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-500 text-lg">
            {generating ? 'Generating...' : 'Generate Card →'}
          </Button>
        </div>
      </div>
    </PortalPageLayout>
  );
}
