import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Rocket, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ImportPreview } from './ImportPreview';
import { useCreateImport, useConvertImport } from '@/hooks/useSocialImport';
import { useCreateTurnKey } from '@/hooks/useCreateTurnKey';
import { useToast } from '@/hooks/use-toast';

interface ImportToProjectWizardProps {
  title: string;
  description: string;
  images: string[];
  platform: string;
  sourceUrl: string;
  onBack: () => void;
}

const CATEGORIES = [
  'Electronics', 'Clothing', 'Home & Garden', 'Toys & Games', 'Art & Craft',
  'Food & Beverage', 'Furniture', 'Jewelry', 'Tools', 'Outdoor', 'Digital', 'Other',
];

export function ImportToProjectWizard({
  title: initialTitle, description: initialDescription, images,
  platform, sourceUrl, onBack,
}: ImportToProjectWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [category, setCategory] = useState('');
  const [earlyAdopterSlots, setEarlyAdopterSlots] = useState(50);
  const [creatorBacking, setCreatorBacking] = useState(100);

  const createImport = useCreateImport();
  const convertImport = useConvertImport();
  const createTurnKey = useCreateTurnKey();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isConverting = createImport.isPending || createTurnKey.isPending || convertImport.isPending;

  const handleLaunch = async () => {
    if (!title.trim() || !category) return;

    try {
      const imp = await createImport.mutateAsync({
        source_platform: platform,
        source_url: sourceUrl,
        source_title: title,
        source_description: description,
        source_images: images,
      });

      const project = await createTurnKey.mutateAsync({
        title,
        category,
        description,
        images,
        production_method: null,
        stl_file_url: null,
        creator_backing_credits: creatorBacking,
        matching_cap: creatorBacking * 2,
        early_adopter_slots: earlyAdopterSlots,
        cue_card_id: null,
      });

      await convertImport.mutateAsync({ importId: imp.id, projectId: project.id });

      toast({ title: 'Project launched!', description: `"${title}" is now live.` });
      navigate(`/projects/${project.slug}`);
    } catch (err) {
      toast({ title: 'Error', description: 'Could not create project. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
          </div>
          <span className="text-sm font-medium">Confirm Details</span>
        </div>
        <div className="flex-1 h-px bg-border" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</div>
          <span className="text-sm font-medium">Set Up & Launch</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <ImportPreview
            title={title}
            description={description}
            images={images}
            platform={platform}
            sourceUrl={sourceUrl}
            editable
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(2)} disabled={!title.trim()}>
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Early Adopter Slots</Label>
                  <Input type="number" min={5} max={500} value={earlyAdopterSlots}
                    onChange={e => setEarlyAdopterSlots(Number(e.target.value))} />
                  <p className="text-xs text-muted-foreground mt-1">First backers get the best price</p>
                </div>
                <div>
                  <Label>Your Backing (Credits)</Label>
                  <Input type="number" min={0} value={creatorBacking}
                    onChange={e => setCreatorBacking(Number(e.target.value))} />
                  <p className="text-xs text-muted-foreground mt-1">Matched by community up to 2x</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button className="flex-1" onClick={handleLaunch} disabled={isConverting || !category}>
              {isConverting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
              ) : (
                <><Rocket className="w-4 h-4 mr-2" /> Launch Project</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
