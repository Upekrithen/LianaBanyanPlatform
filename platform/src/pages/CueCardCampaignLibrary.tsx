import { CueCardCampaignGrid } from '@/components/cue-cards/CueCardCampaignGrid';

export default function CueCardCampaignLibrary() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-3xl font-bold">What do you want to make?</h1>
        <p className="text-muted-foreground">Pick a Cue Card. We'll set up everything. You just add your idea.</p>
      </div>
      <CueCardCampaignGrid />
    </div>
  );
}
