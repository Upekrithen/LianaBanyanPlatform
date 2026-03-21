/**
 * COLD START DASHBOARD
 * ====================
 * Milestone 2: The Cold Start & Stewardship System
 * 
 * Main entry point for the Cold Start system showing:
 * - All 16 initiatives with their tier status
 * - Geographic heat map of demand signals
 * - "Claim Your Dukedom" CTA for each city
 * - Localized progress bars
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpandableBlock } from "@/components/pudding";
import { LocalColdStartDashboard } from "@/components/cold-start/LocalColdStartDashboard";
import { CareUnitSelector } from "@/components/cold-start/CareUnitSelector";
import { JesperDashboard } from "@/components/cold-start/JesperDashboard";
import { BecomeAStewardCard } from "@/components/cue-cards/BecomeAStewardCard";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { 
  Flame, MapPin, Users, Crown, ArrowRight, 
  Sparkles, TrendingUp, Globe, Building2, 
  Utensils, ShoppingCart, Home, Heart, Shield,
  Music, GraduationCap, Wrench, Anchor, Ship, Compass, Gift
} from "lucide-react";

// Initiative categories with icons
const INITIATIVE_CATEGORIES = [
  {
    name: 'Food & Home',
    icon: <Utensils className="w-4 h-4" />,
    initiatives: ['lets_make_dinner', 'lets_get_groceries', 'lets_go_shopping', 'household_concierge', 'family_table']
  },
  {
    name: 'Health & Safety',
    icon: <Heart className="w-4 h-4" />,
    initiatives: ['health_accords', 'msa', 'defense_klaus', 'rally_group']
  },
  {
    name: 'Finance & Work',
    icon: <Building2 className="w-4 h-4" />,
    initiatives: ['vsl', 'lets_make_bread', 'harper_guild']
  },
  {
    name: 'Creative & Learning',
    icon: <Music className="w-4 h-4" />,
    initiatives: ['jukebox', 'didasko']
  },
  {
    name: 'Growth',
    icon: <Globe className="w-4 h-4" />,
    initiatives: ['brass_tacks', 'power_to_the_people']
  }
];

const ColdStartDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCity = searchParams.get('city') || '';
  const initialState = searchParams.get('state') || '';
  const [activeTab, setActiveTab] = useState('local');

  return (
    <PortalPageLayout maxWidth="xl" xrayId="cold-start-dashboard" className="bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            <Flame className="w-3 h-3 mr-1 text-orange-500" />
            Milestone 2: Cold Start System
          </Badge>
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
            Spark to Wildfire
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch initiatives grow from a single spark to a wildfire of community action.
            Find your city. Claim your Dukedom. Light the beacon.
          </p>
          <div className="mt-6 max-w-md mx-auto">
            <BecomeAStewardCard />
          </div>
        </div>

        {/* Explainer */}
        <ExpandableBlock
          title="How Cold Start Works"
          preview="SPARK → EMBER → FLAME → FIRE → BLAZE → INFERNO → WILDFIRE"
          variant="info"
          className="mb-8"
        >
          <div className="space-y-4">
            <p>
              Every initiative starts as a <strong>SPARK</strong> — just an idea gathering interest. 
              As more families sign up and local leaders (<strong>Dukes</strong>) step forward, 
              the initiative progresses through tiers until it becomes a <strong>WILDFIRE</strong> 
              of sustainable community action.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-500/20 p-3 rounded-lg text-center">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <div className="font-bold">SPARK</div>
                <div className="text-xs text-muted-foreground">Gathering interest</div>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg text-center">
                <Flame className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                <div className="font-bold">EMBER</div>
                <div className="text-xs text-muted-foreground">Ready to launch</div>
              </div>
              <div className="bg-red-500/20 p-3 rounded-lg text-center">
                <Flame className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <div className="font-bold">FIRE</div>
                <div className="text-xs text-muted-foreground">Sustainable ops</div>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-lg text-center">
                <Flame className="w-6 h-6 mx-auto mb-2 text-yellow-400 animate-pulse" />
                <div className="font-bold">WILDFIRE</div>
                <div className="text-xs text-muted-foreground">Full deployment</div>
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mt-4">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Ship className="w-4 h-4 text-blue-500" />
                The 300: The Fleet (Naval Ranks)
              </h4>
              <p className="text-sm text-muted-foreground">
                Each initiative has a <strong>Fleet Admiral</strong> — a public figure who champions the national vision 
                (like Maneet Chauhan for Let's Make Dinner). But the real work happens locally through 
                <strong> Captains</strong> — members of "The 300" who command their own ship in their cities. 
                <strong> You can become a Captain</strong> and lead your community.
              </p>
              <div className="mt-3 text-xs text-muted-foreground border-t pt-3">
                <strong>Naval Progression:</strong> Captain (1 ship) → Commodore (3+ ships) → Rear Admiral → Vice Admiral → Admiral → Fleet Admiral
              </div>
            </div>
          </div>
        </ExpandableBlock>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="local" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              My City
            </TabsTrigger>
            <TabsTrigger value="initiatives" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              All Initiatives
            </TabsTrigger>
            <TabsTrigger value="captain" className="flex items-center gap-2">
              <Anchor className="w-4 h-4" />
              Become Captain
            </TabsTrigger>
            <TabsTrigger value="care-units" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Fund Care Units
            </TabsTrigger>
            <TabsTrigger value="jesper" className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-rose-500" />
              Jesper Dashboard
            </TabsTrigger>
          </TabsList>

          {/* Local City Tab */}
          <TabsContent value="local">
            <LocalColdStartDashboard 
              initialCity={initialCity}
              initialState={initialState}
              showSearch={true}
            />
          </TabsContent>

          {/* All Initiatives Tab */}
          <TabsContent value="initiatives">
            <div className="space-y-8">
              {INITIATIVE_CATEGORIES.map((category) => (
                <div key={category.name}>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    {category.icon}
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.initiatives.map((initId) => (
                      <InitiativeCard key={initId} initiativeId={initId} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Become Captain Tab */}
          <TabsContent value="captain">
            <Card className="border-2 border-blue-500/30">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="w-6 h-6 text-blue-500" />
                  Become a Captain
                </CardTitle>
                <CardDescription>
                  Join "The 300" — the fleet that makes initiatives happen in every port
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Ship className="w-4 h-4 text-blue-500" />
                      What Captains Do:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-primary mt-0.5" />
                        Command your ship — coordinate local families and resources
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-primary mt-0.5" />
                        Ensure quality and accountability in your port
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
                        Grow the initiative from SPARK to WILDFIRE
                      </li>
                      <li className="flex items-start gap-2">
                        <Anchor className="w-4 h-4 text-blue-500 mt-0.5" />
                        Earn Credits, build reputation, rise in rank
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Requirements:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-primary mt-0.5" />
                        Identity verification (Stripe Identity)
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-primary mt-0.5" />
                        Six-Person Verification (3 known + 3 random)
                      </li>
                      <li className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-primary mt-0.5" />
                        Financial backing pledge (min 100 Credits)
                      </li>
                      <li className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary mt-0.5" />
                        Local presence in your port city
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    Naval Rank Progression
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-background/50 p-2 rounded">
                      <div className="font-bold">Captain</div>
                      <div className="text-muted-foreground">1 ship (your own)</div>
                    </div>
                    <div className="bg-background/50 p-2 rounded">
                      <div className="font-bold">Commodore</div>
                      <div className="text-muted-foreground">3+ ships</div>
                    </div>
                    <div className="bg-background/50 p-2 rounded">
                      <div className="font-bold">Rear Admiral</div>
                      <div className="text-muted-foreground">Squadron (state)</div>
                    </div>
                    <div className="bg-background/50 p-2 rounded">
                      <div className="font-bold">Vice Admiral</div>
                      <div className="text-muted-foreground">Fleet division</div>
                    </div>
                    <div className="bg-background/50 p-2 rounded">
                      <div className="font-bold">Admiral</div>
                      <div className="text-muted-foreground">Full fleet</div>
                    </div>
                    <div className="bg-background/50 p-2 rounded">
                      <div className="font-bold">Fleet Admiral</div>
                      <div className="text-muted-foreground">The Crown</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-500" />
                    The Captain's Medallion
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    <em>"A ship in harbor is safe, but that is not what ships are for."</em>
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Every Captain receives a physical and digital <strong>Medallion Badge</strong>. By default, the front features the Ship's Wheel and our motto. The back features your personal branding and your unique Deck Card QR code.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Want a custom design for your Medallion? You can change it up, but that involves posting a <strong>Bounty</strong> for the community's creators to design and forge it for you.
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Ready to Command Your Ship?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    First, search for your city in the "My City" tab to see which initiatives need Captains. 
                    Then click "Become Captain" on any initiative that needs local leadership.
                  </p>
                  <Button onClick={() => setActiveTab('local')}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Find My Port
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Care Units Tab */}
          <TabsContent value="care-units">
            <CareUnitSelector
              onSelect={(type, amount) => {
                // INFRASTRUCTURE NOTE: This needs a checkout/escrow flow for care unit pledges
              }}
            />
          </TabsContent>

          {/* Jesper Dashboard Tab */}
          <TabsContent value="jesper">
            <JesperDashboard />
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <Card className="mt-8 border-primary/20 bg-gradient-to-r from-primary/5 to-orange-500/5">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Can't Find Your City?</h3>
                <p className="text-muted-foreground">
                  Be the first to light the beacon. Signal interest and we'll notify you when others join.
                </p>
              </div>
              <Button size="lg" onClick={() => navigate('/beacon')}>
                <Flame className="w-5 h-5 mr-2" />
                Light the Beacon
              </Button>
            </div>
          </CardContent>
        </Card>
    </PortalPageLayout>
  );
};

// Initiative Card Component
const InitiativeCard: React.FC<{ initiativeId: string }> = ({ initiativeId }) => {
  const navigate = useNavigate();
  
  const INITIATIVE_INFO: Record<string, { name: string; description: string; crown?: string; icon: React.ReactNode }> = {
    lets_make_dinner: { name: "Let's Make Dinner", description: 'Neighbors feeding neighbors', crown: 'Maneet Chauhan', icon: <Utensils className="w-5 h-5" /> },
    lets_get_groceries: { name: "Let's Get Groceries", description: 'Volume purchasing power', icon: <ShoppingCart className="w-5 h-5" /> },
    lets_go_shopping: { name: "Let's Go Shopping", description: 'Cooperative buying power', crown: 'Mary Beth Laughton', icon: <ShoppingCart className="w-5 h-5" /> },
    household_concierge: { name: 'Household Concierge', description: 'World-class home management', icon: <Home className="w-5 h-5" /> },
    family_table: { name: 'The Family Table', description: 'Private family operations', icon: <Users className="w-5 h-5" /> },
    health_accords: { name: 'Health Accords', description: 'Affordable prescriptions', icon: <Heart className="w-5 h-5" /> },
    msa: { name: 'MSA', description: 'Medical savings accounts', icon: <Heart className="w-5 h-5" /> },
    defense_klaus: { name: 'Defense Klaus', description: 'Personal safety', icon: <Shield className="w-5 h-5" /> },
    rally_group: { name: 'Rally Group', description: 'Community action and crisis response', crown: 'Kimberly A. Williams', icon: <Users className="w-5 h-5" /> },
    vsl: { name: 'VSL', description: 'Voucher Short Loans', crown: 'Cathie Mahon', icon: <Building2 className="w-5 h-5" /> },
    lets_make_bread: { name: "Let's Make Bread", description: 'Business incubator', icon: <Wrench className="w-5 h-5" /> },
    harper_guild: { name: 'Harper Guild', description: 'Ethics checking and truth-telling', icon: <Users className="w-5 h-5" /> },
    jukebox: { name: 'JukeBox', description: 'Music licensing and creator contracts', icon: <Music className="w-5 h-5" /> },
    didasko: { name: 'Didasko', description: 'BOUNTY K-12 curriculum', icon: <GraduationCap className="w-5 h-5" /> },
    brass_tacks: { name: 'Brass Tacks', description: 'Manufacturing cooperative', icon: <Wrench className="w-5 h-5" /> },
    power_to_the_people: { name: 'Power to the People', description: 'Political expedition and civic engagement', icon: <Globe className="w-5 h-5" /> },
  };

  const info = INITIATIVE_INFO[initiativeId] || { name: initiativeId, description: '', icon: <Sparkles className="w-5 h-5" /> };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/initiatives/${initiativeId}`)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {info.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold flex items-center gap-2">
              {info.name}
              {info.crown && <Crown className="w-3 h-3 text-yellow-500" />}
            </h4>
            <p className="text-xs text-muted-foreground">{info.description}</p>
            {info.crown && (
              <p className="text-xs text-yellow-600 mt-1">Crown: {info.crown}</p>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ColdStartDashboard;
