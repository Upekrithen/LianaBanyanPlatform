import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Coins, ArrowRight, ShieldCheck, Gamepad2, Map, Snowflake, Lock, Compass } from "lucide-react";
import { useNavigate } from 'react-router-dom';

import { LarkWrapper } from '@/components/builder/LarkWrapper';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function KeepsLobby() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout>
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6 border-b border-slate-800 pb-12">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
            HexIsle Community Campaigns
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-100">
            The Keeps
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            The Main Campaign is written by the Founder's son. But the world belongs to you. 
            Build a Keep to host your own Tabletop RPG campaigns, custom rulesets, and game nights.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <LarkWrapper componentId="keeps-create" bountyCredits={100} className="md:col-span-2">
            <Card className="bg-slate-900 border-slate-800 h-full">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Building className="w-6 h-6 text-primary" />
                  Establish a Keep
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your private lobby for your gaming group.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-slate-300">
                  A Keep is your hub in the Ghost World. Here, you can use the Deck Card Studio to print custom rules, 
                  design custom characters, and map out your own campaigns using our modular Hex tiles.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4" /> Game Master Tools
                    </h4>
                    <p className="text-sm text-slate-400">
                      Set up encounters, manage the Treasury, and assign fitted coffers to your players.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <h4 className="font-semibold text-amber-500 mb-2 flex items-center gap-2">
                      <Coins className="w-4 h-4" /> Earn Credits
                    </h4>
                    <p className="text-sm text-slate-400">
                      If you publish your campaign and other groups play it, you earn Credits backed by the platform.
                    </p>
                  </div>
                </div>
                <Button className="w-full sm:w-auto">
                  Found Your Keep <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </LarkWrapper>

          <LarkWrapper componentId="keeps-join" bountyCredits={50}>
            <Card className="bg-slate-900 border-slate-800 h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Join a Campaign
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-slate-400 mb-6">
                  Looking for a group? Browse public Keeps and apply to join an ongoing campaign.
                </p>
                <div className="mt-auto space-y-3">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                    <div className="text-sm">
                      <div className="font-medium text-slate-200">The Obsidian Order</div>
                      <div className="text-xs text-slate-500">4/6 Players • Hard</div>
                    </div>
                    <Button variant="outline" size="sm">Apply</Button>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                    <div className="text-sm">
                      <div className="font-medium text-slate-200">Merchants of Harvest</div>
                      <div className="text-xs text-slate-500">2/4 Players • Easy</div>
                    </div>
                    <Button variant="outline" size="sm">Apply</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </LarkWrapper>
        </div>

        {/* Example Keep */}
        <Card className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-emerald-500/30">
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Compass className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-100 mb-2">Example Keep — Tutorial Fortress</h3>
              <p className="text-slate-400 text-sm">
                An explorable 3-hex fortified cluster in Verdana. Walk through a guided tutorial
                showing how Keeps work: creating rooms, placing encounters, managing the Treasury,
                and publishing campaigns. The perfect introduction before founding your own.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="text-emerald-400/80 border-emerald-500/30 text-[10px]">
                  Interactive Tutorial
                </Badge>
                <Badge variant="outline" className="text-emerald-400/80 border-emerald-500/30 text-[10px]">
                  Verdana — The Port City
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-950 shrink-0"
              onClick={() => navigate('/hexisle/world-3d')}
            >
              Visit in 3D <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Founder's Keep */}
        <Card className="bg-gradient-to-r from-sky-900/20 to-cyan-900/20 border-sky-400/20 relative overflow-hidden">
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 opacity-10 animate-pulse"
            style={{
              background: "linear-gradient(135deg, transparent 40%, #b8d4e3 50%, transparent 60%)",
              backgroundSize: "200% 200%",
            }}
          />
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0 border border-sky-400/30">
              <Snowflake className="w-8 h-8 text-sky-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-slate-100">Founder's Keep</h3>
                <Badge className="bg-sky-500/10 text-sky-400 border-sky-400/20 text-[10px]">
                  <Lock className="w-3 h-3 mr-1" /> Level 60
                </Badge>
              </div>
              <p className="text-slate-400 text-sm">
                In the far North, beyond the last accessible island, a shimmer of ice and snow marks
                the Snow Gate. Twelve locks guard this Keep — six at the corners, six along the sides.
                All must be solved to enter. Inside, the Founder's story awaits.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="text-sky-300/70 border-sky-400/20 text-[10px]">
                  Snow Gate
                </Badge>
                <Badge variant="outline" className="text-sky-300/70 border-sky-400/20 text-[10px]">
                  12 Locks (6 Corner + 6 Side)
                </Badge>
                <Badge variant="outline" className="text-sky-300/70 border-sky-400/20 text-[10px]">
                  Shimmer: #b8d4e3
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DM Game Night Treasure Map Builder Teaser */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
              <Map className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-100 mb-2">DM Game Night: Treasure Map Builder</h3>
              <p className="text-slate-400 text-sm">
                As a Member with 30-days rolling persistence, you can design interactive Treasure Maps.
                Pre-record actions at specific beacons so when your players arrive and perform an action
                (e.g., "Knock three times and say 'Mellon'"), a Deck Card reveals your custom script or loot.
              </p>
            </div>
            <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-950 shrink-0" onClick={() => navigate('/create-map')}>
              Open Map Builder <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

      </div>
    </PortalPageLayout>
  );
}
