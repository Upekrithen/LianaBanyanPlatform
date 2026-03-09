/**
 * FACTORY PIPELINE — Decentralized Manufacturing
 * ===============================================
 * Idea → Prototype → Vote → Produce → Ship
 * 
 * The full manufacturing pipeline visualization with:
 * - Stage progression
 * - Production levels (6 tiers)
 * - Pioneer node benefits
 * - Design Battle integration
 * - Blueprint scroll visualization
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lightbulb, Wrench, Vote, Factory, Truck, 
  ChevronRight, Users, Trophy, Clock, Zap,
  Scroll, Map, Star, Shield, Crown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Pipeline stages
const PIPELINE_STAGES = [
  { 
    id: "idea", 
    name: "Idea", 
    icon: Lightbulb, 
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    description: "Submit your product concept"
  },
  { 
    id: "prototype", 
    name: "Prototype", 
    icon: Wrench, 
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Design Battle or bounty creation"
  },
  { 
    id: "vote", 
    name: "Vote", 
    icon: Vote, 
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Community validates demand"
  },
  { 
    id: "produce", 
    name: "Produce", 
    icon: Factory, 
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    description: "Distributed manufacturing"
  },
  { 
    id: "ship", 
    name: "Ship", 
    icon: Truck, 
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    description: "Delivery to members"
  },
];

// Production level tiers
const PRODUCTION_LEVELS = [
  { level: 1, name: "Prototype", units: 10, priceMultiplier: 5.0, color: "bg-amber-600" },
  { level: 2, name: "Small Batch", units: 100, priceMultiplier: 3.0, color: "bg-slate-400" },
  { level: 3, name: "Medium Run", units: 1000, priceMultiplier: 2.0, color: "bg-amber-400" },
  { level: 4, name: "Production", units: 10000, priceMultiplier: 1.5, color: "bg-slate-300" },
  { level: 5, name: "Mass Market", units: 100000, priceMultiplier: 1.2, color: "bg-yellow-400" },
  { level: 6, name: "Commodity", units: 1000000, priceMultiplier: 1.0, color: "bg-cyan-400" },
];

// Pioneer node benefits
const PIONEER_BENEFITS = [
  { icon: Zap, title: "Priority Bounties", description: "First access to manufacturing bounties" },
  { icon: Trophy, title: "Higher Joules", description: "1.5× Joule allocation for work" },
  { icon: Shield, title: "Equipment Subsidy", description: "Up to $500 toward 3D printer" },
  { icon: Crown, title: "Governance Weight", description: "2× voting power on manufacturing decisions" },
];

interface PipelineItem {
  id: string;
  name: string;
  stage: string;
  currentVotes: number;
  votesNeeded: number;
  productionLevel: number;
  creator: string;
  createdAt: string;
  designBattleActive?: boolean;
}

interface FactoryPipelineProps {
  items?: PipelineItem[];
  pioneerCount?: number;
  userIsPioneer?: boolean;
}

export function FactoryPipeline({ 
  items = [], 
  pioneerCount = 47,
  userIsPioneer = false 
}: FactoryPipelineProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const itemsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = items.filter(item => item.stage === stage.id);
    return acc;
  }, {} as Record<string, PipelineItem[]>);

  return (
    <div className="space-y-8">
      {/* Pipeline Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Factory className="h-8 w-8 text-primary" />
          The Factory
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Decentralized manufacturing pipeline. From idea to your doorstep.
          <br />
          <span className="text-sm">95% cost reduction vs traditional manufacturing. Creators keep 83.3%.</span>
        </p>
      </div>

      {/* Pipeline Stages */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-purple-500 to-orange-500 -translate-y-1/2 hidden md:block" />
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
          {PIPELINE_STAGES.map((stage, index) => {
            const StageIcon = stage.icon;
            const stageItems = itemsByStage[stage.id] || [];
            const isSelected = selectedStage === stage.id;
            
            return (
              <motion.div
                key={stage.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card 
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                  } ${stage.bgColor}`}
                  onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                >
                  <CardContent className="pt-6 text-center">
                    <div className={`w-12 h-12 mx-auto rounded-full ${stage.bgColor} flex items-center justify-center mb-3`}>
                      <StageIcon className={`h-6 w-6 ${stage.color}`} />
                    </div>
                    <h3 className="font-semibold">{stage.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
                    {stageItems.length > 0 && (
                      <Badge variant="secondary" className="mt-2">
                        {stageItems.length} active
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stage Details */}
      <AnimatePresence>
        {selectedStage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const stage = PIPELINE_STAGES.find(s => s.id === selectedStage);
                    const Icon = stage?.icon || Factory;
                    return <Icon className={`h-5 w-5 ${stage?.color}`} />;
                  })()}
                  {PIPELINE_STAGES.find(s => s.id === selectedStage)?.name} Stage
                </CardTitle>
                <CardDescription>
                  {itemsByStage[selectedStage]?.length || 0} items in this stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {itemsByStage[selectedStage]?.length > 0 ? (
                  <div className="space-y-3">
                    {itemsByStage[selectedStage].map(item => (
                      <div 
                        key={item.id}
                        className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">by {item.creator}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={item.designBattleActive ? "default" : "outline"}>
                              {item.designBattleActive ? "⚔️ Battle Active" : `Level ${item.productionLevel}`}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.currentVotes}/{item.votesNeeded} votes
                            </p>
                          </div>
                        </div>
                        {expandedItem === item.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 pt-4 border-t"
                          >
                            <Progress 
                              value={(item.currentVotes / item.votesNeeded) * 100} 
                              className="h-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                              <span>{Math.round((item.currentVotes / item.votesNeeded) * 100)}% funded</span>
                              <span>{item.votesNeeded - item.currentVotes} votes to go</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No items in this stage yet.</p>
                    <Button variant="outline" className="mt-4">
                      Submit an Idea
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Production Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scroll className="h-5 w-5" />
            Production Levels
          </CardTitle>
          <CardDescription>
            As demand grows, unit costs drop. Early supporters get the best multipliers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PRODUCTION_LEVELS.map((level) => (
              <div 
                key={level.level}
                className="text-center p-4 rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 mx-auto rounded-full ${level.color} flex items-center justify-center text-white font-bold mb-2`}>
                  {level.level}
                </div>
                <h4 className="font-medium text-sm">{level.name}</h4>
                <p className="text-xs text-muted-foreground">{level.units.toLocaleString()} units</p>
                <Badge variant="secondary" className="mt-2">
                  {level.priceMultiplier}× price
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Level 1 supporters pay 5× but receive 5× value in Forever Stamps when Level 6 is reached.
          </p>
        </CardContent>
      </Card>

      {/* Pioneer Nodes */}
      <Card className={userIsPioneer ? "ring-2 ring-yellow-500" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Pioneer Nodes
            {userIsPioneer && <Badge className="bg-yellow-500">You're a Pioneer!</Badge>}
          </CardTitle>
          <CardDescription>
            First 100 manufacturing nodes get enhanced benefits. {100 - pioneerCount} spots remaining.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Progress value={pioneerCount} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {pioneerCount}/100 Pioneer slots claimed
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PIONEER_BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="p-4 rounded-lg bg-muted/50 text-center">
                  <Icon className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                  <h4 className="font-medium text-sm">{benefit.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          {!userIsPioneer && pioneerCount < 100 && (
            <div className="text-center mt-6">
              <Button className="gap-2">
                <Star className="h-4 w-4" />
                Become a Pioneer Node
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Requires 3D printer or manufacturing capability
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blueprint Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Blueprint Journey
          </CardTitle>
          <CardDescription>
            Track your product's journey from idea to reality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative py-8">
            {/* Dashed path */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              <path
                d="M 50 50 Q 150 20, 250 50 T 450 50 T 650 50 T 850 50"
                fill="none"
                stroke="currentColor"
                strokeDasharray="8 4"
                className="text-muted-foreground/30"
                strokeWidth="2"
              />
            </svg>
            
            <div className="relative flex justify-between items-center px-8">
              {PIPELINE_STAGES.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <div key={stage.id} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full ${stage.bgColor} flex items-center justify-center border-2 border-background shadow-md`}>
                      <Icon className={`h-5 w-5 ${stage.color}`} />
                    </div>
                    <span className="text-xs mt-2 font-medium">{stage.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="text-center">
            <Button variant="outline" className="gap-2">
              <Scroll className="h-4 w-4" />
              View Full Blueprint
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FactoryPipeline;
