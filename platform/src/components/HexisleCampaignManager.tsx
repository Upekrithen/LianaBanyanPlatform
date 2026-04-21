import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SingleImageUpload from "@/components/SingleImageUpload";
import { Download, Image as ImageIcon } from "lucide-react";
import harvestAI from "@/assets/hexisle-1-harvest.jpg";
import harvestOriginal from "@/assets/hexisle-doc-1-harvest.png";
import navigateAI from "@/assets/hexisle-2-navigate.jpg";
import navigateOriginal from "@/assets/hexisle-doc-2-navigate.png";
import engineerAI from "@/assets/hexisle-3-engineer.jpg";
import engineerOriginal from "@/assets/hexisle-doc-3-engineer.png";
import battleAI from "@/assets/hexisle-4-battle.jpg";
import battleOriginal from "@/assets/hexisle-doc-4-battle.png";
import seekAI from "@/assets/hexisle-5-seek.jpg";
import seekOriginal from "@/assets/hexisle-doc-5-seek.png";
import magicAI from "@/assets/hexisle-6-magic.jpg";
import magicOriginal from "@/assets/hexisle-doc-6-magic.png";
import trainAI from "@/assets/hexisle-7-train.jpg";
import trainOriginal from "@/assets/hexisle-doc-7-train.png";

interface CampaignStage {
  id: number;
  title: string;
  theme: string;
  narrative: string;
  aiImage: string;
  originalImage: string;
}

const campaignStages: CampaignStage[] = [
  {
    id: 1,
    title: "Harvest",
    theme: "Survival • Resource Gathering • First Steps",
    narrative: "You awake to the sound of waves.\n\nWiping the sand from your face and clothes, you exit your small shelter and take in your surroundings. An enormous beach stretches out before you, desolate and rocky. Small shrubs and grasses cling to the stones, clawing at whatever resources this barren place can provide. Among them are shelters, cobbled from driftwood and debris, and filled with haggard and starving people: your subjects. They look up from their sputtering campfires as you pass. You, their king. You have all been left here to die in this lifeless place, a slow and honorless death. Your gaze moves from them to the greater beach, following its ascent upwards as the landscape rises from the sea into the distance. On a small hill many miles away, a small, thin tree sticks out from the horizon, stubbornly growing from the desolate landscape into the sky. You may have been left here to die, but you're not dead yet. You take a deep breath, and take your first steps into the island.",
    aiImage: harvestAI,
    originalImage: harvestOriginal,
  },
  {
    id: 2,
    title: "Navigate",
    theme: "Exploration • Navigation • Danger",
    narrative: "(Implied to be an extension of the same island, as a canoe isn't strong enough to survive the open sea, but it's treated as a different level all the same)\n\nAs your people paddle their canoes across the coast along the island, the land seems to rise from the sea: cliffs. The land here is jagged and hostile, separated into mesas by fjords that snake through them, forming a great stone maze. The water between them swirls hungrily with whirlpools, and the skeletal remains of shipwrecks stick out from below; other exiles. Yours are not the first people to sail these waters, or die in them. From the tops of the cliffs you see the branches of trees growing. The resources found above could be useful, should you find a way to reach them…",
    aiImage: navigateAI,
    originalImage: navigateOriginal,
  },
  {
    id: 3,
    title: "Engineer",
    theme: "Construction • Problem Solving • Scale",
    narrative: "Sailing your longship far away from the desert island, you encounter great towers reaching from the sea. Massive fossilized tree stumps, remains of what was once a great forest, serve as the landscape here. Smaller trees yet grow from their walls, reaching from one another like bridges connecting the spires together. Small creatures can be seen crossing them, apelike and large enough to pose a threat. As you dock along the side of one of the large roots, you look upwards to the groves above and wonder how one might reach them.",
    aiImage: engineerAI,
    originalImage: engineerOriginal,
  },
  {
    id: 4,
    title: "Battle",
    theme: "Combat • Enemies • Weather",
    narrative: "Your fleet follows the trail of shipwrecks, chasing the signs of life until a dark shape rises over the horizon, and you can hear it before you see it. A thunderhead. This island is permanently covered by storms which wrack its beaches with fierce winds and torrential rain. The weathered landscape is covered in discarded weapons and armor, which are so plentiful they seem to grow from the sand like grass. But as you observe your surroundings, a wailing can be heard through the storm. Scores of bright eyes gaze at your ship from just beyond your limited field of vision, their approach covered by the veil of the rain. Arm yourself, for you are not alone here.",
    aiImage: battleAI,
    originalImage: battleOriginal,
  },
  {
    id: 5,
    title: "Seek",
    theme: "Discovery • Quest • Mystery",
    narrative: "From the cave atop the great stormy mountain, you can see the world stretch out before you. A chain of islands can be observed from here, crowned by white glaciers far to the north. \"Seek the keys\" instructed the writings in the cave, and indeed the five islands they are said to be housed on are clearly in view from here. You take one last breath of the cold alpine air and gather your things to move back down the mountain. Your ships and people await on the shore for news, and soon they will set sail again to the chain of islands beyond. The journey is far from over.",
    aiImage: seekAI,
    originalImage: seekOriginal,
  },
  {
    id: 6,
    title: "Magic",
    theme: "Ancient Knowledge • Hidden City • Portal",
    narrative: "The keys gathered, your people rallied, and a course set for the center of the archipelago, you have nearly arrived at the destination told to you by the cave atop the mountain. Supposedly this was once the home of great knowledge and magic. But where is it? Suddenly the sea seems to churn as if alive, and a massive whirlpool can be spotted just beyond the waves. But the water pours not into it, but out, moving upward from the depths as if in reverse as great spires rise from the water. The hidden city of magic has revealed itself to you, now all that is left is to enter it.",
    aiImage: magicAI,
    originalImage: magicOriginal,
  },
  {
    id: 7,
    title: "Train",
    theme: "Finale • Mystery • Homecoming",
    narrative: "A great siege engine lies capsized in the water, its build larger than any human civilization you know could ever have created. It is miles long, its form stretching so far into the sky that the clouds are halted against it. Its deck is a country. Its hull is like the crust of the earth. A great feat of engineering that could humble the very gods. And yet it lies crumbled and ruined all the same, reclaimed by nature and sticking out from the sea like a gargantuan shadow. But more than just nature lives here, as strange life forms vanish into its portholes at your fleet's approach. Whispering is heard all around, eyes peek from darkened openings, and strange humming from deep in your mind seems to call out to you from within it. A door, the hum tells you. A door that pierces through the dark sea. A door that can take you home. The whispers grow louder as you dock along the side of the great machine, and delve into its depths.",
    aiImage: trainAI,
    originalImage: trainOriginal,
  },
];

export const HexisleCampaignManager = () => {
  const [uploadedImages, setUploadedImages] = useState<Record<number, string>>({});
  const [selectedImages, setSelectedImages] = useState<Record<number, "ai" | "google-doc" | "uploaded">>({});

  const handleImageUpload = (stageId: number, url: string) => {
    setUploadedImages(prev => ({ ...prev, [stageId]: url }));
    setSelectedImages(prev => ({ ...prev, [stageId]: "uploaded" }));
  };

  const handleExport = () => {
    const exportData = campaignStages.map(stage => {
      let imageUrl = stage.aiImage;
      if (selectedImages[stage.id] === "google-doc") {
        imageUrl = stage.originalImage;
      } else if (selectedImages[stage.id] === "uploaded") {
        imageUrl = uploadedImages[stage.id] || stage.aiImage;
      }

      return {
        stage: stage.id,
        title: stage.title,
        theme: stage.theme,
        narrative: stage.narrative,
        selectedImage: selectedImages[stage.id] || "ai",
        imageUrl,
      };
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hexisle-campaign-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hexisle Campaign - Liana Banyan Branch</CardTitle>
              <CardDescription>
                "Scarce Resources. An Army of Farmers. And a Throne to Reclaim"
              </CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Badge variant="secondary">Branch Project</Badge>
            <Badge variant="outline">3D Printed Miniatures</Badge>
            <Badge variant="outline">Tabletop Gaming</Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="1" className="w-full">
        <TabsList className="w-full grid grid-cols-7">
          {campaignStages.map(stage => (
            <TabsTrigger key={stage.id} value={stage.id.toString()}>
              Stage {stage.id}
            </TabsTrigger>
          ))}
        </TabsList>

        {campaignStages.map(stage => (
          <TabsContent key={stage.id} value={stage.id.toString()} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{stage.id}. {stage.title}</CardTitle>
                <CardDescription className="text-base">{stage.theme}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Narrative */}
                <div>
                  <h3 className="font-semibold mb-2">Narrative</h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {stage.narrative}
                  </p>
                </div>

                {/* Image Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Stage Artwork - Compare & Select</h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* AI Generated */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">AI Generated</label>
                        <Button
                          size="sm"
                          variant={selectedImages[stage.id] === "ai" || !selectedImages[stage.id] ? "default" : "outline"}
                          onClick={() => setSelectedImages(prev => ({ ...prev, [stage.id]: "ai" }))}
                        >
                          {selectedImages[stage.id] === "ai" || !selectedImages[stage.id] ? "✓" : "Select"}
                        </Button>
                      </div>
                      <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-muted">
                        <img
                          src={stage.aiImage}
                          alt={`${stage.title} - AI Generated`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Flux.dev model</p>
                    </div>

                    {/* Google Doc Original */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Google Doc Original</label>
                        <Button
                          size="sm"
                          variant={selectedImages[stage.id] === "google-doc" ? "default" : "outline"}
                          onClick={() => setSelectedImages(prev => ({ ...prev, [stage.id]: "google-doc" }))}
                        >
                          {selectedImages[stage.id] === "google-doc" ? "✓" : "Select"}
                        </Button>
                      </div>
                      <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-muted">
                        <img
                          src={stage.originalImage}
                          alt={`${stage.title} - Google Doc`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Original artwork</p>
                    </div>

                    {/* Custom Upload */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Custom Upload</label>
                        {uploadedImages[stage.id] && (
                          <Button
                            size="sm"
                            variant={selectedImages[stage.id] === "uploaded" ? "default" : "outline"}
                            onClick={() => setSelectedImages(prev => ({ ...prev, [stage.id]: "uploaded" }))}
                          >
                            {selectedImages[stage.id] === "uploaded" ? "✓" : "Select"}
                          </Button>
                        )}
                      </div>
                      {uploadedImages[stage.id] ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary">
                          <img
                            src={uploadedImages[stage.id]}
                            alt={`${stage.title} - Custom`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
                          <div className="text-center p-4">
                            <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground mb-2">
                              Upload your own version
                            </p>
                            <SingleImageUpload
                              onUpload={(url) => handleImageUpload(stage.id, url)}
                              label=""
                              description=""
                            />
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {uploadedImages[stage.id] ? "Your custom artwork" : "Optional"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
