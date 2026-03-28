import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useMembershipStatus } from '@/hooks/useMembershipStatus';
import { useCueCardCampaign } from '@/hooks/useCueCardCampaign';
import { useCreateTurnKey } from '@/hooks/useCreateTurnKey';
import { MatchedFundingBar } from './MatchedFundingBar';
import { toast } from 'sonner';
import { Rocket, ArrowLeft, ArrowRight, X } from 'lucide-react';

const CATEGORIES = [
  'Tabletop Terrain', 'Leather Goods', 'Food & Kitchen', 'Jewelry',
  'Board Games', 'Woodworking', 'Digital Design', 'Other',
];

const PRODUCTION_METHODS = [
  { value: 'fdm', label: 'FDM (3D Print)' },
  { value: 'sla', label: 'SLA (Resin)' },
  { value: 'sls', label: 'SLS (Powder)' },
  { value: 'injection', label: 'Injection Mold' },
  { value: 'handmade', label: 'Handmade' },
  { value: 'digital', label: 'Digital' },
  { value: 'mixed', label: 'Mixed' },
];

export default function TurnKeyWizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { status: membershipLevel, isLoading: memberLoading } = useMembershipStatus();
  const createMutation = useCreateTurnKey();

  const cueCardSlug = searchParams.get('cue_card') || undefined;
  const { data: cueCard } = useCueCardCampaign(cueCardSlug);

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [hasPrototype, setHasPrototype] = useState(false);
  const [productionMethod, setProductionMethod] = useState<string | null>(null);
  const [stlUrl, setStlUrl] = useState('');
  const [backingCredits, setBackingCredits] = useState(200);
  const [earlyAdopterSlots, setEarlyAdopterSlots] = useState(50);
  const [usingCueCard, setUsingCueCard] = useState(!!cueCardSlug);

  useEffect(() => {
    if (cueCard && usingCueCard) {
      setCategory(cueCard.craft_type);
      setDescription(cueCard.description_template);
      setBackingCredits(cueCard.recommended_backing_min);
      setEarlyAdopterSlots(cueCard.early_adopter_slots);
    }
  }, [cueCard, usingCueCard]);

  const unitPrice = Math.ceil(backingCredits * 1.2);
  const canStep2 = title.trim().length > 0 && category.length > 0;
  const canStep3 = true;
  const canStep4 = backingCredits >= 25;
  const isPaidMember = membershipLevel !== 'free';

  function clearCueCard() {
    setUsingCueCard(false);
    setCategory('');
    setDescription('');
    setBackingCredits(200);
  }

  async function handleLaunch() {
    try {
      const project = await createMutation.mutateAsync({
        title,
        category,
        description,
        images,
        production_method: productionMethod,
        stl_file_url: stlUrl || null,
        creator_backing_credits: backingCredits,
        matching_cap: backingCredits,
        early_adopter_slots: earlyAdopterSlots,
        cue_card_id: usingCueCard ? cueCard?.id ?? null : null,
      });
      toast.success('Project launched!');
      navigate(`/projects/${project.slug}`);
    } catch {
      toast.error('Failed to launch project.');
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Rocket className="w-6 h-6" /> Create Your Project</h1>
        <Progress value={(step / 4) * 100} className="mt-3 h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span className={step >= 1 ? 'text-primary font-medium' : ''}>1. What</span>
          <span className={step >= 2 ? 'text-primary font-medium' : ''}>2. Prototype</span>
          <span className={step >= 3 ? 'text-primary font-medium' : ''}>3. Backing</span>
          <span className={step >= 4 ? 'text-primary font-medium' : ''}>4. Launch</span>
        </div>
      </div>

      {usingCueCard && cueCard && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-sm">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-lg shrink-0">{cueCard.icon}</span>
            <span className="font-medium truncate">Using Cue Card: {cueCard.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={clearCueCard} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-muted-foreground hover:text-foreground touch-manipulation"><X className="w-4 h-4" /></button>
            <button onClick={clearCueCard} className="text-xs text-muted-foreground underline min-h-[44px] inline-flex items-center touch-manipulation">Start from Scratch</button>
          </div>
        </div>
      )}

      {/* Step 1: What are you making? */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>What are you making?</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="My awesome creation" maxLength={100} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Pick a category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description <span className="text-muted-foreground text-xs">({description.length}/500)</span></Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 500))} placeholder="Tell people what you're making..." rows={4} />
            </div>
            <div>
              <Label>Images (paste URLs, comma-separated)</Label>
              <Input
                value={images.join(', ')}
                onChange={e => setImages(e.target.value.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5))}
                placeholder="https://example.com/photo1.jpg, https://..."
              />
              <p className="text-xs text-muted-foreground mt-1">Up to 5 image URLs</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Show your prototype */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle>Show your prototype</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Production Method</Label>
              <Select value={productionMethod || ''} onValueChange={v => setProductionMethod(v || null)}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  {PRODUCTION_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>STL/OBJ File URL (optional)</Label>
              <Input value={stlUrl} onChange={e => setStlUrl(e.target.value)} placeholder="https://..." />
              <p className="text-xs text-muted-foreground mt-1">For physical products — Early Adopters can print it themselves</p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={hasPrototype} onCheckedChange={v => setHasPrototype(!!v)} id="has-proto" />
              <Label htmlFor="has-proto" className="text-sm cursor-pointer">I already have a prototype</Label>
            </div>
            {!hasPrototype && usingCueCard && cueCard && (
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium">Estimated prototype path:</p>
                <p className="text-muted-foreground mt-1">{cueCard.default_production_path}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Back your project */}
      {step === 3 && (
        <Card>
          <CardHeader><CardTitle>Back your project</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>How many Credits are you putting in?</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="range"
                  min={25}
                  max={5000}
                  step={25}
                  value={backingCredits}
                  onChange={e => setBackingCredits(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-lg font-bold w-20 text-right">{backingCredits.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm">
              You put in <strong>{backingCredits.toLocaleString()} Credits</strong>.
              The community can match up to <strong>{backingCredits.toLocaleString()} more</strong>.
            </div>

            <MatchedFundingBar
              creatorBacking={backingCredits}
              communityMatched={0}
              matchingCap={backingCredits}
            />

            <div className="p-3 rounded-lg border bg-card text-sm space-y-1">
              <div className="flex justify-between"><span>Cost+20% price per unit:</span><strong>{unitPrice.toLocaleString()} Credits</strong></div>
              <div className="flex justify-between"><span>Early Adopter slots:</span><strong>{earlyAdopterSlots}</strong></div>
            </div>

            <div>
              <Label>Early Adopter Slots</Label>
              <Input type="number" min={10} max={500} value={earlyAdopterSlots} onChange={e => setEarlyAdopterSlots(Number(e.target.value))} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Launch */}
      {step === 4 && (
        <Card>
          <CardHeader><CardTitle>Launch Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Title:</span> <strong>{title}</strong></div>
              <div><span className="text-muted-foreground">Category:</span> <Badge variant="secondary">{category}</Badge></div>
              <div><span className="text-muted-foreground">Your Backing:</span> <strong>{backingCredits.toLocaleString()} Credits</strong></div>
              <div><span className="text-muted-foreground">Match Cap:</span> <strong>{backingCredits.toLocaleString()} Credits</strong></div>
              <div><span className="text-muted-foreground">Early Adopter Price:</span> <strong>{unitPrice.toLocaleString()} Credits</strong></div>
              <div><span className="text-muted-foreground">Production:</span> <strong>{productionMethod || 'TBD'}</strong></div>
            </div>

            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded" />
                ))}
              </div>
            )}

            {!isPaidMember && !memberLoading && (
              <div className="p-4 rounded-lg border-2 border-amber-300 bg-amber-50 text-center space-y-2">
                <p className="font-semibold">Membership Required</p>
                <p className="text-sm text-muted-foreground">For $5/year, you get all of this — launch projects, back others, earn Credits.</p>
                <Button variant="outline" onClick={() => navigate('/join')}>Become a Member — $5/year</Button>
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              disabled={!isPaidMember || createMutation.isPending}
              onClick={handleLaunch}
            >
              {createMutation.isPending ? 'Launching...' : '🚀 Launch Project'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6 gap-3">
        <Button variant="outline" size="lg" className="touch-manipulation min-h-[44px]" onClick={() => step === 1 ? navigate(-1) : setStep(s => s - 1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        {step < 4 && (
          <Button
            size="lg"
            className="touch-manipulation min-h-[44px]"
            onClick={() => setStep(s => s + 1)}
            disabled={(step === 1 && !canStep2) || (step === 2 && !canStep3) || (step === 3 && !canStep4)}
          >
            Next <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
