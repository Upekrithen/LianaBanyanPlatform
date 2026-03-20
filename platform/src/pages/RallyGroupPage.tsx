import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, HeartHandshake, Map, ShieldAlert, ArrowRight, HandHeart, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpandableBlock } from "@/components/pudding";
import { AnonymousVolumeExplainer } from "@/components/AnonymousVolumeExplainer";
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function RallyGroupPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'chalkboard' | 'swoop' | 'railroad'>('chalkboard');

  return (
    <LaunchConditionOverlay initiativeSlug="rally-group" initiativeName="Rally Group">
    <PortalPageLayout maxWidth="xl" xrayId="rally-group-page">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-purple-600 border-purple-600">Initiative #9</Badge>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl flex items-center justify-center gap-3">
            <Users className="h-10 w-10 text-purple-600" />
            Rally Group
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Community action, "In My Backyard" neighborhood support, The Swoop, and the Underground Railroad. 
            When disaster strikes or a neighbor needs help, the Rally Group moves.
          </p>
        </div>

        {/* Interactive Dashboard Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button 
            variant={activeTab === 'chalkboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('chalkboard')}
            className={activeTab === 'chalkboard' ? 'bg-purple-600' : ''}
          >
            <MessageSquare className="mr-2 h-4 w-4" /> Community Chalkboard
          </Button>
          <Button 
            variant={activeTab === 'swoop' ? 'default' : 'outline'}
            onClick={() => setActiveTab('swoop')}
            className={activeTab === 'swoop' ? 'bg-purple-600' : ''}
          >
            <HeartHandshake className="mr-2 h-4 w-4" /> The Swoop
          </Button>
          <Button 
            variant={activeTab === 'railroad' ? 'default' : 'outline'}
            onClick={() => setActiveTab('railroad')}
            className={activeTab === 'railroad' ? 'bg-purple-600' : ''}
          >
            <ShieldAlert className="mr-2 h-4 w-4" /> Underground Railroad
          </Button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-8 mb-16 min-h-[500px]">
          
          {activeTab === 'chalkboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">The Community Chalkboard</h2>
                  <p className="text-muted-foreground">The 3-Step Spark to Wildfire progression for local resource sharing.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <Card className="border-l-4 border-l-amber-400">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-800">Step 1: Spark</Badge>
                      The Digital Chalkboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    Neighbors log into the local portal and simply list "Haves" and "Wants" without forcing immediate transactions. 
                    <em>"I have a pickup truck," "I have extra lemons," "I need a lawnmower for Saturday."</em> 
                    Once a neighborhood hits 50 active Haves/Wants, the Spark is lit.
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className="bg-orange-100 text-orange-800">Step 2: Ember</Badge>
                      The Block Swap
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    A local Captain steps up and organizes a physical weekend event—an aggregated neighborhood Garage Sale + Tool Swap + Potluck. 
                    Neighbors meet face-to-face to fulfill the "Haves/Wants" they saw on the digital chalkboard.
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800">Step 3: Wildfire</Badge>
                      The Continuous Local Larder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    The exchange becomes a self-sustaining continuous marketplace. The Captain acts as the local escrow. 
                    If someone needs to lend a tool, they drop it at the Captain's porch (the "Local Larder") for asynchronous pickup.
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'swoop' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <HeartHandshake className="h-8 w-8 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">The Swoop</h2>
                  <p className="text-muted-foreground">Community-driven crisis and life-event support.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-lg text-foreground mb-4">
                    The Swoop is how a community rallies around a family in need. Whether it's a new baby, a medical emergency, or a sudden loss, the community uses The Swoop to organize help.
                  </p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2"><HandHeart className="h-5 w-5 text-pink-500" /> Meal trains automatically integrated with local prep.</li>
                    <li className="flex items-center gap-2"><HandHeart className="h-5 w-5 text-pink-500" /> Financial pooling without platform extraction fees.</li>
                    <li className="flex items-center gap-2"><HandHeart className="h-5 w-5 text-pink-500" /> Service donations (lawn care, babysitting).</li>
                  </ul>
                </div>
                <div className="bg-muted/50 rounded-lg p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Integration with The Family Table</h3>
                  <p className="text-sm text-muted-foreground">
                    While The Swoop is organized here in the Rally Group by the community, the receiving family manages the incoming support privately through their <strong>Family Table</strong> dashboard, ensuring they are never overwhelmed by the logistics of accepting help.
                  </p>
                </div>
              </div>

              {/* Anonymous Volume Aggregation — Dignity Preserved */}
              <div className="mt-8">
                <AnonymousVolumeExplainer variant="card" showComparison={false} />
              </div>
            </div>
          )}

          {activeTab === 'railroad' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-800 rounded-lg">
                  <ShieldAlert className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">The Underground Railroad</h2>
                  <p className="text-muted-foreground">Emergency extraction and safe-harbor networks.</p>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-300 rounded-lg p-8">
                <p className="text-lg mb-6">
                  For situations requiring immediate, discreet extraction—domestic violence, sudden displacement, or severe crisis. The Underground Railroad utilizes the network of verified Captains and safe-houses to move people to safety.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-800 p-4 rounded-md">
                    <div className="font-bold text-white mb-1">Verified Safe Nodes</div>
                    <div className="text-sm">Vetted community members offering temporary shelter.</div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-md">
                    <div className="font-bold text-white mb-1">Transport Relays</div>
                    <div className="text-sm">Coordinated movement across state lines.</div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-md">
                    <div className="font-bold text-white mb-1">Burner Comms</div>
                    <div className="text-sm">Untraceable communication channels for extraction.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

    </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
