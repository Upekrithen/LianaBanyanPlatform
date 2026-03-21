import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Map, MapPin, Save, Plus, Trash2, ArrowLeft, Lock, Unlock, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { getOrCreateGhostSession } from "@/lib/ghostWorld";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// Mock data for system beacons
const SYSTEM_BEACONS = [
  { id: 'b1', name: 'The Mainland Hub', description: 'Central Megalopolis entrance' },
  { id: 'b2', name: 'Durin\'s Door', description: 'Hidden steganographic entry point' },
  { id: 'b3', name: 'Tower of Peace', description: 'Harvest Island central structure' },
  { id: 'b4', name: 'The Salt Mines', description: 'Bounty board and job listings' },
  { id: 'b5', name: 'Hall of Records', description: 'Patent pedestals and IP ledger' },
];

interface MapNode {
  id: string;
  beaconId: string;
  triggerAction: string; // e.g., "Knock 3 times", "Say 'Mellon'"
  revealScript: string;  // What the Deck Card says when opened
  loot: string;          // Optional loot
}

export default function TreasureMapBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const [hasAccess, setHasAccess] = useState(false);
  const [mapName, setMapName] = useState("My Game Night Campaign");
  const [nodes, setNodes] = useState<MapNode[]>([]);

  useEffect(() => {
    // Check access: Must be a Member OR have 30_days persistence in Ghost World
    if (user) {
      setHasAccess(true);
    } else {
      const ghostId = localStorage.getItem("lb_ghost_id") || "anonymous_ghost";
      const { session } = getOrCreateGhostSession(ghostId);
      if (session.persistenceTier === '30_days') {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    }
  }, [user]);

  const addNode = () => {
    setNodes([
      ...nodes,
      {
        id: `node-${Date.now()}`,
        beaconId: SYSTEM_BEACONS[0].id,
        triggerAction: '',
        revealScript: '',
        loot: ''
      }
    ]);
  };

  const updateNode = (id: string, field: keyof MapNode, value: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
  };

  if (!hasAccess) {
    return (
      <PortalPageLayout>
        <Card className="max-w-md w-full bg-slate-900 border-red-900/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-xl text-slate-100">Access Restricted</CardTitle>
            <CardDescription className="text-slate-400">
              The DM Game Night Treasure Map Builder requires advanced persistence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-slate-300">
              To design your own interactive campaigns, you must either:
            </p>
            <ul className="text-sm text-slate-400 text-left list-disc pl-6 space-y-2">
              <li>Become a full Member ($5/year)</li>
              <li>Reach the <strong>30-Days Rolling Persistence</strong> tier in Ghost World by completing quests and topping leaderboards.</li>
            </ul>
            <div className="pt-4 flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/ghost-world')}>Back to Ghost World</Button>
              <Button onClick={() => openOnboard({ reason: "build a treasure map", actionLabel: "Join", membershipIncluded: true })}>Become a Member</Button>
            </div>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/keeps')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                <Map className="w-8 h-8 text-purple-500" />
                Treasure Map Builder
              </h1>
              <p className="text-slate-400 text-sm mt-1">Design interactive DM Game Night campaigns</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-slate-700">
              <Play className="w-4 h-4 mr-2" /> Test Run
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Save className="w-4 h-4 mr-2" /> Save Map
            </Button>
          </div>
        </div>

        {/* Map Settings */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-1 block">Campaign Name</label>
              <Input 
                value={mapName} 
                onChange={(e) => setMapName(e.target.value)}
                className="bg-slate-950 border-slate-700 text-lg font-semibold"
              />
            </div>
            <p className="text-sm text-slate-400">
              Link system-created Beacons together. When your players visit these locations and perform the trigger action, 
              your custom Deck Card script will be revealed.
            </p>
          </CardContent>
        </Card>

        {/* Nodes List */}
        <div className="space-y-6">
          {nodes.map((node, index) => (
            <Card key={node.id} className="bg-slate-900 border-slate-800 relative overflow-visible">
              <div className="absolute -left-3 -top-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-sm border-4 border-slate-950">
                {index + 1}
              </div>
              <CardContent className="p-6 pt-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-full max-w-xs">
                    <label className="text-xs font-medium text-slate-400 mb-1 block uppercase tracking-wider">Location (System Beacon)</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-sm text-slate-200"
                      value={node.beaconId}
                      onChange={(e) => updateNode(node.id, 'beaconId', e.target.value)}
                    >
                      {SYSTEM_BEACONS.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {SYSTEM_BEACONS.find(b => b.id === node.beaconId)?.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-400" onClick={() => removeNode(node.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-400 mb-1 block uppercase tracking-wider">Trigger Action</label>
                      <Input 
                        placeholder="e.g., Knock 3 times and say 'Mellon'" 
                        value={node.triggerAction}
                        onChange={(e) => updateNode(node.id, 'triggerAction', e.target.value)}
                        className="bg-slate-950 border-slate-700"
                      />
                      <p className="text-xs text-slate-500 mt-1">What players must do to open the Deck Card.</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-400 mb-1 block uppercase tracking-wider">Loot / Reward (Optional)</label>
                      <Input 
                        placeholder="e.g., +50 Ghost Credits, 1x Crow Feather" 
                        value={node.loot}
                        onChange={(e) => updateNode(node.id, 'loot', e.target.value)}
                        className="bg-slate-950 border-slate-700"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block uppercase tracking-wider">Deck Card Script (The Reveal)</label>
                    <Textarea 
                      placeholder="Write the DM narration or character dialogue here..." 
                      value={node.revealScript}
                      onChange={(e) => updateNode(node.id, 'revealScript', e.target.value)}
                      className="bg-slate-950 border-slate-700 h-32 resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button 
            variant="outline" 
            className="w-full py-8 border-dashed border-2 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 hover:bg-slate-900/50"
            onClick={addNode}
          >
            <Plus className="w-5 h-5 mr-2" /> Add Next Waypoint
          </Button>
        </div>

      </div>
    </PortalPageLayout>
  );
}
