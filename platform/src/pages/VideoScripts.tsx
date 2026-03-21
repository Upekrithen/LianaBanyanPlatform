import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, DollarSign, Users, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function VideoScripts() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <PortalPageLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Video Production Scripts</h1>
        <p className="text-muted-foreground">
          Production-ready explainer video scripts with AI generation prompts
        </p>
        <div className="mt-3 p-3 bg-muted/50 rounded-md border">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> All AI-generated content in these scripts follows the{" "}
            <a 
              href="/docs/LIANA_BANYAN_CHARTER.md" 
              target="_blank"
              className="underline hover:text-primary"
            >
              Liana Banyan Charter AI Usage Policy
            </a>
            —AI artwork is used as placeholder only, except for charts, graphs, icons, and functional applications.
          </p>
        </div>
      </div>

      <Tabs defaultValue="fable" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-10 gap-1">
          <TabsTrigger value="fable" className="gap-2 text-xs">
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">LB Fable</span>
          </TabsTrigger>
          <TabsTrigger value="credits" className="gap-2 text-xs">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Credits</span>
          </TabsTrigger>
          <TabsTrigger value="guild" className="gap-2 text-xs">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Guild</span>
          </TabsTrigger>
          <TabsTrigger value="hexisle" className="gap-2 text-xs">
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">Hexisle</span>
          </TabsTrigger>
          <TabsTrigger value="tereno" className="gap-2 text-xs">
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">Tereno</span>
          </TabsTrigger>
          <TabsTrigger value="hotwater" className="gap-2 text-xs">
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">Hot Water</span>
          </TabsTrigger>
          <TabsTrigger value="lrh" className="gap-2 text-xs">
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">LRH</span>
          </TabsTrigger>
          <TabsTrigger value="axe" className="gap-2 text-xs">
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">Axe Soup</span>
          </TabsTrigger>
          <TabsTrigger value="seed" className="gap-2 text-xs">
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">A&G Seed</span>
          </TabsTrigger>
          <TabsTrigger value="capitalism" className="gap-2 text-xs">
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">Capitalism</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fable" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>The Liana Banyan Fable - Origin Story</CardTitle>
              <CardDescription>
                2-3 minutes | Animated nature documentary | David Attenborough-style narration
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="flex justify-between items-center mb-4 not-prose">
                <div className="flex gap-4 text-sm">
                  <span className="badge">Duration: 2-3 min</span>
                  <span className="badge">Style: Documentary</span>
                  <span className="badge">Voice: George (Warm)</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Script
                  </Button>
                </div>
              </div>

              <h3>Concept</h3>
              <p>
                A cinematic journey through a tropical Indian forest, revealing the Banyan tree's remarkable life cycle. 
                Starting as a tiny seed deposited by a bird, the strangler fig grows aerial roots that descend from branches, 
                eventually forming new trunks. These prop roots create an ever-expanding network—a single tree becoming 
                a forest unto itself. The Liana metaphor represents the flexible, interconnected growth that enables 
                the Banyan's magnificent canopy. Together, they illustrate collaborative expansion and mutual support.
              </p>

              <h3>Source Reference</h3>
              <p className="text-sm text-muted-foreground italic">
                Scientific and cultural information sourced from: "The Banyan Tree: A World Of Its Own" 
                by Parul Jauhari, Rachnakar.com (2021)
              </p>

              <h3>Key Scenes</h3>
              <ul>
                <li><strong>Scene 1 (0:00-0:20):</strong> The Seed's Journey - Bird deposits banyan seed in host tree's crevice</li>
                <li><strong>Scene 2 (0:20-0:45):</strong> The Strangler's Growth - Young banyan wraps around host tree, growing skyward</li>
                <li><strong>Scene 3 (0:45-1:10):</strong> Aerial Roots Descend - Prop roots drop from branches like living ropes</li>
                <li><strong>Scene 4 (1:10-1:40):</strong> New Trunks Form - Prop roots thicken, becoming indistinguishable from the main trunk</li>
                <li><strong>Scene 5 (1:40-2:05):</strong> A Forest From One Tree - The canopy expands infinitely, creating shelter for countless species</li>
                <li><strong>Scene 6 (2:05-2:30):</strong> The Ecosystem Thrives - Birds, insects, and life flourishing in this "world of its own"</li>
                <li><strong>Scene 7 (2:30-2:50):</strong> The Metaphor Revealed - Transition to human network visualization, Liana Banyan logo</li>
              </ul>

              <h3>Production Strategy</h3>
              <ul>
                <li><strong>Tool:</strong> Runway Gen-3 for photorealistic nature scenes</li>
                <li><strong>Editing:</strong> Adobe Premiere Pro for final assembly</li>
                <li><strong>Voiceover:</strong> ElevenLabs (George voice, multilingual_v2)</li>
                <li><strong>Music:</strong> Orchestral - gentle to triumphant build</li>
                <li><strong>Cost:</strong> ~$50-70 for Runway credits</li>
              </ul>

              <h3>Opening Narration</h3>
              <blockquote>
                "Deep in the tropical forests of India, there exists a remarkable partnership—one that thrives 
                and recreates itself over and over. This is the story of the Liana and the Banyan tree. 
                Not a partnership between two separate organisms, but a metaphor for how interconnected growth 
                creates something magnificent. The Banyan, known scientifically as Ficus benghalensis, begins 
                as a tiny seed—carried by a bird, deposited in the crevice of a host tree. From this humble 
                beginning, it will become a world of its own."
              </blockquote>

              <h3>Core Narration (Mid-Section)</h3>
              <blockquote>
                "Watch as aerial roots descend from branches like living ropes, reaching for the earth below. 
                These prop roots—what we call the Lianas—provide structural support, enabling the canopy to 
                expand infinitely. When they touch the ground, they thicken and transform, becoming new trunks 
                indistinguishable from the original. One tree becomes many. One trunk becomes a forest. 
                This is collaborative growth in its purest form—each new root strengthening the whole, 
                each branch reaching higher because of the support below."
              </blockquote>

              <h3>Closing Narration</h3>
              <blockquote>
                "The Banyan tree is called 'A World Of Its Own' because beneath its canopy, entire ecosystems 
                flourish. Birds nest in its branches. Insects pollinate its figs. Life thrives in the shelter 
                it provides. In Indian philosophy, the Banyan represents immortality and permanence—a cosmic 
                tree whose roots reach toward the sky, carrying divine blessings to Earth. Join us. Whether 
                you're a Banyan seeking new heights, or a Liana ready to support—together, we'll build 
                something extraordinary. Welcome to the Liana Banyan network."
              </blockquote>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How Credits Work - System Explainer</CardTitle>
              <CardDescription>
                1.5-2 minutes | Motion graphics | Clear educational narration
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="flex justify-between items-center mb-4 not-prose">
                <div className="flex gap-4 text-sm">
                  <span className="badge">Duration: 1.5-2 min</span>
                  <span className="badge">Style: Motion Graphics</span>
                  <span className="badge">Voice: Sarah (Clear)</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Script
                  </Button>
                </div>
              </div>

              <h3>Concept</h3>
              <p>
                Fast-paced motion graphics explainer showing how the three-credit system works: 
                Contribution Credits (purchased), Earned Credits (work), and EOI Credits (participation of interest).
                Emphasizes simplicity and fairness.
              </p>

              <h3>Key Scenes</h3>
              <ul>
                <li><strong>Scene 1 (0:00-0:15):</strong> The Problem - Traditional payment friction</li>
                <li><strong>Scene 2 (0:15-0:35):</strong> The Solution - LB Credits introduction</li>
                <li><strong>Scene 3 (0:35-0:55):</strong> Three Ways to Earn - Purchase, work, participation</li>
                <li><strong>Scene 4 (0:55-1:15):</strong> Value & Fairness - 1 credit = $1 USD</li>
                <li><strong>Scene 5 (1:15-1:35):</strong> Using Credits - Ecosystem marketplace</li>
                <li><strong>Scene 6 (1:35-1:50):</strong> EOI Conversion - Participation conversion explanation</li>
                <li><strong>Scene 7 (1:50-2:10):</strong> Your Stake - Membership message</li>
                <li><strong>Scene 8 (2:10-2:20):</strong> Call to Action - Sign up bonus</li>
              </ul>

              <h3>Production Strategy</h3>
              <ul>
                <li><strong>Tool:</strong> Adobe After Effects (pure motion graphics - fastest)</li>
                <li><strong>Editing:</strong> Adobe Premiere Pro for final polish</li>
                <li><strong>Voiceover:</strong> ElevenLabs (Sarah voice, clear & educational)</li>
                <li><strong>Icons:</strong> Lucide React icon set for consistency</li>
                <li><strong>Cost:</strong> $0 (owned software) + $11 ElevenLabs</li>
              </ul>

              <h3>Opening Narration</h3>
              <blockquote>
                "Traditional payment systems are slow, expensive, and complicated. Banks charge fees. 
                Wire transfers take days. Payment processors take their cut. There has to be a better way."
              </blockquote>

              <h3>Core Message</h3>
              <blockquote>
                "With Liana Banyan Credits, you're not just buying currency—you're earning membership.
                You're joining a collaborative economy where your participation has real value."
              </blockquote>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guild" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guild Progression Journey - Membership Path</CardTitle>
              <CardDescription>
                2-3 minutes | Character animation | Inspirational narration
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="flex justify-between items-center mb-4 not-prose">
                <div className="flex gap-4 text-sm">
                  <span className="badge">Duration: 2-3 min</span>
                  <span className="badge">Style: Character Animation</span>
                  <span className="badge">Voice: Aria (Inspirational)</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Script
                  </Button>
                </div>
              </div>

              <h3>Concept</h3>
              <p>
                Follow a character's journey from Apprentice to Master through the 18-tier guild system. 
                Shows increasing contribution, responsibility, and influence. Emphasizes community support
                and mentorship at every level.
              </p>

              <h3>Key Scenes</h3>
              <ul>
                <li><strong>Scene 1 (0:00-0:20):</strong> The Journey Begins - Introduction to guild path</li>
                <li><strong>Scene 2 (0:20-0:45):</strong> Apprentice Tier - $50 stake, learning phase</li>
                <li><strong>Scene 3 (0:45-1:15):</strong> Journeyman Advancement - Up to $500, leadership emerges</li>
                <li><strong>Scene 4 (1:15-1:50):</strong> Master Level - $5,000 contribution, mentoring others</li>
                <li><strong>Scene 5 (1:50-2:15):</strong> The Full System - 18 tiers visualization</li>
                <li><strong>Scene 6 (2:15-2:35):</strong> Exclusive Benefits - Higher tier perks</li>
                <li><strong>Scene 7 (2:35-2:50):</strong> Community Focus - Rising together message</li>
                <li><strong>Scene 8 (2:50-3:00):</strong> The Invitation - Join your guild today</li>
              </ul>

              <h3>Production Strategy</h3>
              <ul>
                <li><strong>Tool:</strong> Toony for fast character animation, After Effects polish</li>
                <li><strong>Editing:</strong> Adobe Premiere Pro for final assembly</li>
                <li><strong>Voiceover:</strong> ElevenLabs (Aria voice, inspirational tone)</li>
                <li><strong>Style:</strong> Warm, encouraging, showing upward progression</li>
                <li><strong>Cost:</strong> $0 (owned software) + ElevenLabs included</li>
              </ul>

              <h3>Opening Narration</h3>
              <blockquote>
                "Every master was once a beginner. Every expert started with a single step. 
                This is your journey—from apprentice to master, in the guild system that grows with you."
              </blockquote>

              <h3>Core Message</h3>
              <blockquote>
                "In our guilds, we don't climb alone. When one member rises, we all rise. 
                When one member succeeds, the entire guild celebrates. This is collaborative growth."
              </blockquote>

              <h3>Tier Progression</h3>
              <ul>
                <li><strong>Apprentice (Tiers 1-6):</strong> $50-500 contribution range</li>
                <li><strong>Journeyman (Tiers 7-12):</strong> $500-2,500 contribution range</li>
                <li><strong>Master (Tiers 13-18):</strong> $2,500-5,000+ contribution range</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hexisle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hexisle Game - Kickstarter Campaign</CardTitle>
              <CardDescription>
                1-2 minutes | Game trailer style | Energetic narration
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="flex justify-between items-center mb-4 not-prose">
                <div className="flex gap-4 text-sm">
                  <span className="badge">Duration: 1-2 min</span>
                  <span className="badge">Style: Game Trailer</span>
                  <span className="badge">Voice: Marcus (Energetic)</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Script
                  </Button>
                </div>
              </div>

              <h3>Concept</h3>
              <p>
                High-energy campaign video showcasing Hexisle as a strategic territory-building game 
                where players expand hexagonal islands, manage resources, and collaborate or compete. 
                Emphasizes the Kickstarter opportunity to join early and shape the game's future.
              </p>

              <h3>Key Scenes</h3>
              <ul>
                <li><strong>Scene 1 (0:00-0:15):</strong> The Island Awakens - First hex placement</li>
                <li><strong>Scene 2 (0:15-0:30):</strong> Build Your Empire - Territory expansion</li>
                <li><strong>Scene 3 (0:30-0:50):</strong> Strategic Gameplay - Resource management</li>
                <li><strong>Scene 4 (0:50-1:10):</strong> Multiplayer Action - Competition & collaboration</li>
                <li><strong>Scene 5 (1:10-1:30):</strong> Community Building - Early backer benefits</li>
                <li><strong>Scene 6 (1:30-1:50):</strong> The Vision - Roadmap preview</li>
                <li><strong>Scene 7 (1:50-2:00):</strong> Back Us Now - Kickstarter CTA</li>
              </ul>

              <h3>Production Strategy</h3>
              <ul>
                <li><strong>Tool:</strong> After Effects + game mockup footage</li>
                <li><strong>Style:</strong> Fast cuts, upbeat music, gameplay highlights</li>
                <li><strong>Voiceover:</strong> ElevenLabs (Marcus voice, high energy)</li>
                <li><strong>Music:</strong> Epic electronic/orchestral hybrid</li>
              </ul>

              <h3>Opening Hook</h3>
              <blockquote>
                "What if you could build an empire, one hex at a time? Welcome to Hexisle—where strategy 
                meets creativity, and every decision shapes your world."
              </blockquote>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tereno" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tereno Hexel Platform - Modular Space System</CardTitle>
              <CardDescription>
                2-3 minutes | Technical animation | Architectural narration
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="flex justify-between items-center mb-4 not-prose">
                <div className="flex gap-4 text-sm">
                  <span className="badge">Duration: 2-3 min</span>
                  <span className="badge">Style: Technical</span>
                  <span className="badge">Voice: Daniel (Architectural)</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Script
                  </Button>
                </div>
              </div>

              <h3>Concept</h3>
              <p>
                Architectural showcase of the Tereno Hexel Platform—a modular hexagonal space framework 
                that adapts to diverse needs. Shows how hexagonal tiles create flexible, scalable environments 
                for work, living, and community spaces.
              </p>

              <h3>Key Scenes</h3>
              <ul>
                <li><strong>Scene 1 (0:00-0:20):</strong> The Grid - Hexagonal tessellation beauty</li>
                <li><strong>Scene 2 (0:20-0:45):</strong> Single Hexel - Modular unit showcase</li>
                <li><strong>Scene 3 (0:45-1:15):</strong> Configuration Options - Flexible arrangements</li>
                <li><strong>Scene 4 (1:15-1:45):</strong> Real Applications - Office, workshop, living spaces</li>
                <li><strong>Scene 5 (1:45-2:15):</strong> Scalability - From small to large installations</li>
                <li><strong>Scene 6 (2:15-2:35):</strong> Integration - Tech & sustainability features</li>
                <li><strong>Scene 7 (2:35-2:50):</strong> Your Platform - Customization invitation</li>
              </ul>

              <h3>Production Strategy</h3>
              <ul>
                <li><strong>Tool:</strong> Blender 3D + After Effects</li>
                <li><strong>Style:</strong> Architectural visualization, clean design</li>
                <li><strong>Voiceover:</strong> ElevenLabs (Daniel voice, professional)</li>
                <li><strong>Visuals:</strong> 3D hexagonal animations, real mockups</li>
              </ul>

              <h3>Core Message</h3>
              <blockquote>
                "Space should adapt to you, not the other way around. The Tereno Hexel Platform 
                brings modular flexibility to every environment—one hexagon at a time."
              </blockquote>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotwater" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>The Hot Water Company - Sustainable Water Innovation</CardTitle>
              <CardDescription>
                2-3 minutes | Documentary style | Educational narration
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="flex justify-between items-center mb-4 not-prose">
                <div className="flex gap-4 text-sm">
                  <span className="badge">Duration: 2-3 min</span>
                  <span className="badge">Style: Documentary</span>
                  <span className="badge">Voice: Sarah (Educational)</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Script
                  </Button>
                </div>
              </div>

              <h3>Concept</h3>
              <p>
                Technical explainer showcasing The Hot Water Company's Stirling cycle engine innovation 
                for sustainable water stations. Focuses on the Tereno Water Table concept, physics principles 
                (hydraulics, pneumatics, temperature differential), and real-world humanitarian impact.
              </p>

              <h3>Key Scenes</h3>
              <ul>
                <li><strong>Scene 1 (0:00-0:20):</strong> The Water Crisis - Global need</li>
                <li><strong>Scene 2 (0:20-0:45):</strong> Stirling Cycle Basics - Physics explanation</li>
                <li><strong>Scene 3 (0:45-1:15):</strong> Temperature Differential - Power generation</li>
                <li><strong>Scene 4 (1:15-1:45):</strong> Tereno Water Table - System design & principles</li>
                <li><strong>Scene 5 (1:45-2:15):</strong> Sustainable Operation - Self-powered sanitary stations</li>
                <li><strong>Scene 6 (2:15-2:35):</strong> Impact Vision - Communities transformed</li>
                <li><strong>Scene 7 (2:35-2:50):</strong> Join the Mission - First nonprofit member</li>
              </ul>

              <h3>Production Strategy</h3>
              <ul>
                <li><strong>Tool:</strong> After Effects + technical diagrams</li>
                <li><strong>Style:</strong> Clean, educational, inspiring</li>
                <li><strong>Voiceover:</strong> ElevenLabs (Sarah voice, clear & authoritative)</li>
                <li><strong>Visuals:</strong> 3D physics simulations, real-world footage</li>
              </ul>

              <h3>Core Message</h3>
              <blockquote>
                "Clean water shouldn't be a luxury. With the Stirling cycle, hydraulics, and temperature 
                differential physics, The Hot Water Company is bringing sustainable, fresh water solutions 
                to communities that need them most—powered by nature itself."
              </blockquote>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lrh" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>The Little Red Hen - Collaboration Fable</CardTitle>
              <CardDescription>
                2 minutes | Animated fable | Warm narration with lesson
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="flex justify-between items-center mb-4 not-prose">
                <div className="flex gap-4 text-sm">
                  <span className="badge">Duration: 2 min</span>
                  <span className="badge">Style: Animated Fable</span>
                  <span className="badge">Voice: Aria (Warm)</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Script
                  </Button>
                </div>
              </div>

              <h3>Concept</h3>
              <p>
                Classic tale reimagined: The Little Red Hen asks "Who will help me make this bread?" 
                but this time, the story shows the value of contribution and shared rewards in a 
                collaborative economy. Bridges traditional fable wisdom with modern teamwork principles.
              </p>

              <h3>Key Scenes</h3>
              <ul>
                <li><strong>Scene 1 (0:00-0:20):</strong> The Discovery - Hen finds wheat seeds</li>
                <li><strong>Scene 2 (0:20-0:40):</strong> The Asking - "Who will help me?"</li>
                <li><strong>Scene 3 (0:40-1:00):</strong> The Refusal - Others decline to help</li>
                <li><strong>Scene 4 (1:00-1:20):</strong> The Work - Hen does it all alone</li>
                <li><strong>Scene 5 (1:20-1:40):</strong> The Question - "Who will help me eat?"</li>
                <li><strong>Scene 6 (1:40-1:50):</strong> The Lesson - Contribution earns reward</li>
                <li><strong>Scene 7 (1:50-2:00):</strong> Modern Parallel - LB collaborative model</li>
              </ul>

              <h3>Production Strategy</h3>
              <ul>
                <li><strong>Tool:</strong> Toony for character animation</li>
                <li><strong>Style:</strong> Classic storybook aesthetic</li>
                <li><strong>Voiceover:</strong> ElevenLabs (Aria voice, storyteller tone)</li>
                <li><strong>Music:</strong> Folk-inspired, building to revelation</li>
              </ul>

              <h3>The Moral</h3>
              <blockquote>
                "Those who share the work, share the reward. At Liana Banyan, we believe in contribution—
                when you help build something great, you earn your place at the table."
              </blockquote>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="axe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stone Soup - Collective Resources</CardTitle>
              <CardDescription>
                2-3 minutes | Animated story | Community-focused narration
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="flex justify-between items-center mb-4 not-prose">
                <div className="flex gap-4 text-sm">
                  <span className="badge">Duration: 2-3 min</span>
                  <span className="badge">Style: Community Fable</span>
                  <span className="badge">Voice: George (Warm)</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Script
                  </Button>
                </div>
              </div>

              <h3>Concept</h3>
              <p>
                The classic Stone Soup (or Axe/Nail Soup) tale showing how collective small contributions 
                create abundance. A traveler arrives with nothing but a stone/axe, and through community 
                participation, creates a feast. Perfect metaphor for collaborative resource pooling.
              </p>

              <h3>Key Scenes</h3>
              <ul>
                <li><strong>Scene 1 (0:00-0:20):</strong> The Arrival - Traveler enters village</li>
                <li><strong>Scene 2 (0:20-0:40):</strong> The Stone - "I'll make soup from this!"</li>
                <li><strong>Scene 3 (0:40-1:10):</strong> The Contributions - Each adds an ingredient</li>
                <li><strong>Scene 4 (1:10-1:40):</strong> The Transformation - Simple to abundant</li>
                <li><strong>Scene 5 (1:40-2:05):</strong> The Feast - Community shares together</li>
                <li><strong>Scene 6 (2:05-2:25):</strong> The Revelation - Power of pooled resources</li>
                <li><strong>Scene 7 (2:25-2:40):</strong> The Connection - LB resource model</li>
              </ul>

              <h3>Production Strategy</h3>
              <ul>
                <li><strong>Tool:</strong> Toony or After Effects character animation</li>
                <li><strong>Style:</strong> Warm village aesthetic, folk art inspired</li>
                <li><strong>Voiceover:</strong> ElevenLabs (George voice, community warmth)</li>
                <li><strong>Music:</strong> Acoustic folk building to celebration</li>
              </ul>

              <h3>The Message</h3>
              <blockquote>
                "When everyone brings a little, everyone gains a lot. Stone Soup isn't magic—it's the power 
                of collective contribution. That's the Liana Banyan way: small contributions from many create
                abundance for all."
              </blockquote>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>A Bug's Life - "This is a Seed" Speech</CardTitle>
              <CardDescription>
                2-3 minutes | Inspirational animation | Inventor narrative
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="flex justify-between items-center mb-4 not-prose">
                <div className="flex gap-4 text-sm">
                  <span className="badge">Duration: 2-3 min</span>
                  <span className="badge">Style: Inspirational</span>
                  <span className="badge">Voice: Marcus (Inspirational)</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Script
                  </Button>
                </div>
              </div>

              <h3>Concept</h3>
              <p>
                Inspired by Flick's iconic "Pretend this is a seed" speech from A Bug's Life. Focus on 
                the inventor mindset, collective strength ("we're all ants!"), and how small things grow 
                into mighty trees. Metaphor: ants cultivating the Banyan tree, Lianas becoming trunks—
                collective growth through innovation and unity.
              </p>

              <h3>Key Scenes</h3>
              <ul>
                <li><strong>Scene 1 (0:00-0:25):</strong> The Problem - Grasshoppers dominate (old system)</li>
                <li><strong>Scene 2 (0:25-0:50):</strong> The Inventor - Flick-inspired character with idea</li>
                <li><strong>Scene 3 (0:50-1:20):</strong> "Pretend This is a Seed" - The powerful metaphor</li>
                <li><strong>Scene 4 (1:20-1:50):</strong> Collective Strength - "We're all ants!"</li>
                <li><strong>Scene 5 (1:50-2:15):</strong> Growing the Tree - Cultivation metaphor visual</li>
                <li><strong>Scene 6 (2:15-2:35):</strong> Liana to Trunk - Growth transformation</li>
                <li><strong>Scene 7 (2:35-2:50):</strong> United We Grow - Community triumph</li>
              </ul>

              <h3>Production Strategy</h3>
              <ul>
                <li><strong>Tool:</strong> Character animation (original assets, not Pixar)</li>
                <li><strong>Style:</strong> Inspirational, focusing on ideas not IP</li>
                <li><strong>Voiceover:</strong> ElevenLabs (Marcus voice, inspirational)</li>
                <li><strong>Music:</strong> Building orchestral, triumph at climax</li>
                <li><strong>Legal:</strong> Original characters, inspired by themes only</li>
              </ul>

              <h3>The Speech</h3>
              <blockquote>
                "Pretend—pretend this is a seed. A tiny seed. But when we work together, when we all 
                contribute, that seed becomes a sapling. That sapling becomes a mighty tree. And we? 
                We're the ants who cultivate the forest. At Liana Banyan, we don't just climb—we grow 
                together. Each member a Liana, each contribution building the trunk. United, we become 
                the Banyan—unshakeable, interconnected, thriving."
              </blockquote>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capitalism" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How Capitalism Actually Works</CardTitle>
              <CardDescription>
                3-4 minutes | Educational explainer | Clear analytical narration
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="flex justify-between items-center mb-4 not-prose">
                <div className="flex gap-4 text-sm">
                  <span className="badge">Duration: 3-4 min</span>
                  <span className="badge">Style: Educational</span>
                  <span className="badge">Voice: Sarah (Analytical)</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Script
                  </Button>
                </div>
              </div>

              <h3>Concept</h3>
              <p>
                Balanced educational video explaining capitalism's mechanisms: private ownership, profit 
                motive, market competition, capital accumulation. Covers both strengths (innovation, 
                efficiency) and criticisms (inequality, externalities). Positions collaborative models 
                like LB as evolution, not rejection.
              </p>

              <h3>Key Scenes</h3>
              <ul>
                <li><strong>Scene 1 (0:00-0:30):</strong> Core Principles - Defining capitalism</li>
                <li><strong>Scene 2 (0:30-1:00):</strong> Private Ownership - Capital & means of production</li>
                <li><strong>Scene 3 (1:00-1:30):</strong> Profit Motive - Incentive structures</li>
                <li><strong>Scene 4 (1:30-2:00):</strong> Market Competition - Supply, demand, price</li>
                <li><strong>Scene 5 (2:00-2:30):</strong> The Strengths - Innovation & efficiency</li>
                <li><strong>Scene 6 (2:30-3:00):</strong> The Criticisms - Inequality & externalities</li>
                <li><strong>Scene 7 (3:00-3:30):</strong> Evolution Not Revolution - Collaborative capitalism</li>
                <li><strong>Scene 8 (3:30-4:00):</strong> Better Together - LB synthesis model</li>
              </ul>

              <h3>Production Strategy</h3>
              <ul>
                <li><strong>Tool:</strong> After Effects with infographics and data viz</li>
                <li><strong>Style:</strong> Clean, educational, balanced perspective</li>
                <li><strong>Voiceover:</strong> ElevenLabs (Sarah voice, clear & analytical)</li>
                <li><strong>Graphics:</strong> Charts, flows, historical context</li>
                <li><strong>Music:</strong> Neutral, thoughtful background</li>
              </ul>

              <h3>Opening Frame</h3>
              <blockquote>
                "Capitalism. It's been praised as the engine of prosperity and criticized as the root of 
                inequality. But what is it, really? Let's break it down without the ideology—just the 
                mechanics, the outcomes, and what comes next."
              </blockquote>

              <h3>Closing Message</h3>
              <blockquote>
                "Capitalism isn't inherently good or evil—it's a tool. The question is: can we evolve it? 
                Can we keep the innovation and efficiency while building in equity and collaboration? 
                At Liana Banyan, we believe the answer is yes. Not revolution—evolution."
              </blockquote>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Production Overview</CardTitle>
          <CardDescription>Ready for external production workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Total Timeline</h3>
              <p className="text-2xl font-bold text-primary">4-5 days</p>
              <p className="text-sm text-muted-foreground">Fastest iteration strategy</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Estimated Cost</h3>
              <p className="text-2xl font-bold text-primary">$100-150</p>
              <p className="text-sm text-muted-foreground">Runway + ElevenLabs</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tools Required</h3>
              <p className="text-2xl font-bold text-primary">5 tools</p>
              <p className="text-sm text-muted-foreground">3 owned, 2 subscriptions</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">External Tools:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Runway Gen-3 (video generation for Fable)</li>
              <li>ElevenLabs ($11/month for all voiceovers)</li>
              <li>Adobe After Effects (owned - motion graphics)</li>
              <li>Toony (owned - character animation)</li>
              <li>Adobe Premiere Pro (owned - final editing)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
