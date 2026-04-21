/**
 * HEXISLE PROJECTS — Figure & Product Marketplace
 * ===================================================
 * Multiple sub-projects within the HexIsle universe:
 * - Figure miniatures (Navigator, Engineer, Tidecaller, + Make Your Own)
 * - Terrain tiles
 * - Accessories
 *
 * CRITICAL PATTERN: "Add Your Own" is ALWAYS the first card.
 * This establishes the participatory marketplace model.
 *
 * Innovation #1234: Decentralized Manufacturing Pipeline
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HexIsleShowcase } from "@/components/hexisle/HexIsleShowcase";
import {
  Plus, Waves, Users, Palette, Upload, ArrowRight, Sparkles,
  Crown, Sword, Compass, Wand2, Shield, Hammer, Package,
  Star, Heart, TrendingUp, Factory, ChevronRight, Hexagon, Droplets
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ProjectCard {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  status: "available" | "coming_soon" | "in_production" | "add_your_own";
  category: "character" | "terrain" | "accessory" | "custom";
  preOrderCount?: number;
  price?: string;
  creator?: string;
  features?: string[];
  backContent?: {
    details: string;
    specs?: string[];
    cta: string;
    ctaLink: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA — Figures
// The "Add Your Own" card is ALWAYS first in every collection
// ═══════════════════════════════════════════════════════════════════════════════

const CHARACTER_PROJECTS: ProjectCard[] = [
  // ALWAYS FIRST: Add Your Own
  {
    id: "add-your-own-character",
    name: "Design Your Own",
    tagline: "Your figure, your rules, your royalties",
    description: "Upload your figure design to the HexIsle universe. Get it manufactured, sold in the marketplace, and earn 83.3% of every sale.",
    icon: Plus,
    iconColor: "text-primary",
    status: "add_your_own",
    category: "custom",
    features: ["Upload CAD or sketch", "Community voting", "Factory pipeline", "83.3% royalties"],
    backContent: {
      details: "Submit your figure design through the Factory pipeline. If the community votes it in, we'll prototype, manufacture, and sell it — with you keeping 83.3% of every sale. Your IP, timestamped on the verified ledger.",
      specs: ["Any scale (28mm-75mm)", "STL, OBJ, or sketch accepted", "IP protected via Medallion"],
      cta: "Start Designing →",
      ctaLink: "/factory",
    },
  },
  // Navigator Frame
  {
    id: "navigator-frame",
    name: "Navigator Frame",
    tagline: "Current-reader archetype",
    description: "A navigation-focused figure platform tuned for route planning, current tracking, and map-led scenarios.",
    icon: Compass,
    iconColor: "text-cyan-500",
    status: "available",
    category: "character",
    preOrderCount: 47,
    price: "12 Credits",
    creator: "Liana Banyan Studio",
    features: ["28mm scale", "Water-effect base", "Compass accessory", "Detailed cape"],
    backContent: {
      details: "This figure includes a dynamic stance, transparent water-effect base, and modular compatibility across HexIsle terrain tiles.",
      specs: ["28mm heroic scale", "Multi-part assembly", "Resin (SLS printed)", "Includes stat card"],
      cta: "Pre-Order Navigator Frame →",
      ctaLink: "/hexisle/projects",
    },
  },
  // Engineer Frame
  {
    id: "engineer-frame",
    name: "Engineer Frame",
    tagline: "Mechanism-builder archetype",
    description: "A systems-focused figure platform built for hydraulic planning, tool-routing interactions, and build-heavy campaigns.",
    icon: Hammer,
    iconColor: "text-amber-500",
    status: "available",
    category: "character",
    preOrderCount: 62,
    price: "12 Credits",
    creator: "Liana Banyan Studio",
    features: ["28mm scale", "Tool belt detail", "Gear accessories", "Workshop base"],
    backContent: {
      details: "Includes interchangeable tool accessories and a workshop base with miniature hydraulic components.",
      specs: ["28mm heroic scale", "Modular tools", "Resin (SLS printed)", "Includes stat card"],
      cta: "Pre-Order Engineer Frame →",
      ctaLink: "/hexisle/projects",
    },
  },
  // Tidecaller Frame
  {
    id: "tidecaller-frame",
    name: "Tidecaller Frame",
    tagline: "Flow-channel archetype",
    description: "A wave-and-channel figure platform for pressure timing, flow control, and hybrid mechanical-magical encounters.",
    icon: Wand2,
    iconColor: "text-purple-500",
    status: "coming_soon",
    category: "character",
    preOrderCount: 89,
    price: "15 Credits",
    creator: "Liana Banyan Studio",
    features: ["28mm scale", "Magic effect parts", "Crystal staff", "Wave base"],
    backContent: {
      details: "Includes translucent effect parts and a dynamic wave base. The crystal staff is a separate piece for customization.",
      specs: ["28mm heroic scale", "Clear effect parts", "Resin (SLS printed)", "Includes spell cards"],
      cta: "Join Waitlist →",
      ctaLink: "/hexisle/projects",
    },
  },
];

const TERRAIN_PROJECTS: ProjectCard[] = [
  // ALWAYS FIRST: Add Your Own
  {
    id: "add-your-own-terrain",
    name: "Design Your Terrain",
    tagline: "Your island, your ecosystem",
    description: "Create a new hex tile for the HexIsle system. Design terrain, buildings, or environmental features that integrate with the hydraulic system.",
    icon: Plus,
    iconColor: "text-primary",
    status: "add_your_own",
    category: "custom",
    features: ["Hex-compatible", "Hydraulic integration", "Community voting", "83.3% royalties"],
    backContent: {
      details: "Design terrain that works with the Tereno hydraulic system. Water channels, elevation changes, and mechanical features all welcome. Your design, your IP, your royalties.",
      specs: ["Standard hex dimensions", "Water channel specs provided", "Mechanical integration guide"],
      cta: "Design Terrain →",
      ctaLink: "/factory",
    },
  },
  // Hexels — The Building Blocks
  {
    id: "hexels",
    name: "Hexels",
    tagline: "The atomic unit of HexIsle",
    description: "Modular hexagonal building blocks that snap together to create infinite terrain configurations. The foundation of every HexIsle world.",
    icon: Hexagon,
    iconColor: "text-cyan-500",
    status: "available",
    category: "terrain",
    preOrderCount: 234,
    price: "15 Credits (set of 7)",
    creator: "Liana Banyan Studio",
    features: ["Snap-fit edges", "Water channels", "Stackable", "Modular"],
    backContent: {
      details: "Hexels are the fundamental building blocks. Each hexel features integrated water channels, magnetic snap-fit edges, and stackable design for elevation. Set of 7 creates a starter island.",
      specs: ["Standard hex dimensions", "Integrated water routing", "Magnetic edge connectors", "Food-safe materials"],
      cta: "Pre-Order Hexels →",
      ctaLink: "/hexisle/projects",
    },
  },
  // The Tereno Platform (formerly Water Table)
    {
      id: "tereno-platform",
      name: "The Tereno Platform",
      tagline: "The hydraulically powered mechanical system",
      description: "A hydraulically powered mechanical tabletop system of hydraulics, gears, and pneumatics that enables physical computing and game logic without electricity, batteries, or electronics. Just physical physics, applied.",
      icon: Droplets,
      iconColor: "text-blue-500",
      status: "in_production",
      category: "terrain",
      preOrderCount: 89,
      price: "120 Credits",
      creator: "Liana Banyan Studio",
      features: ["Physical computing", "Reservoir system", "Pneumatic logic", "No batteries"],
      backContent: {
        details: "The Tereno Platform is the physical engine of the game. A manual pump creates water pressure, the reservoir stores and recirculates it, and channels route water to power terrain features, timers, and ship routes. It uses physical geometry to enforce rules—if it fits, it sits.",
        specs: ["24\" × 24\" base", "Hydraulic timer", "Pneumatic channel routing", "Drainage system included"],
        cta: "Pre-Order Platform →",
        ctaLink: "/hexisle/projects#tereno-platform",
      },
    },
  // Pneumatic Palm Tree
  {
    id: "pneumatic-palm",
    name: "Pneumatic Palm Tree",
    tagline: "Watch it grow",
    description: "A palm tree that literally grows during gameplay. Water pressure extends the trunk and unfurls the fronds. Pure hydraulic magic.",
    icon: Sparkles,
    iconColor: "text-green-500",
    status: "available",
    category: "terrain",
    preOrderCount: 156,
    price: "18 Credits",
    creator: "Liana Banyan Studio",
    features: ["Hydraulic growth", "Retractable fronds", "No batteries", "Terrain anchor"],
    backContent: {
      details: "Connect to any water channel. As pressure builds, the palm extends upward and fronds unfurl. Release pressure and it retracts. A living piece of your island that responds to gameplay.",
      specs: ["Extends 2\" to 6\"", "Hydraulic bellows mechanism", "Anchor base for hexels", "Replaceable frond tips"],
      cta: "Pre-Order Palm →",
      ctaLink: "/hexisle/projects#pneumatic-palm",
    },
  },
  {
    id: "volcanic-hex",
    name: "Volcanic Vent Hex",
    tagline: "Where fire meets water",
    description: "A hex tile featuring a working steam vent powered by the hydraulic system. Water in, steam effect out.",
    icon: Sparkles,
    iconColor: "text-orange-500",
    status: "in_production",
    category: "terrain",
    preOrderCount: 34,
    price: "25 Credits",
    creator: "Liana Banyan Studio",
    features: ["Steam effect", "Hydraulic powered", "Modular edges", "Lava detail"],
    backContent: {
      details: "The volcanic hex connects to the water system and produces a realistic steam effect through evaporation channels. No batteries required.",
      specs: ["Standard hex size", "Water-powered steam", "Heat-resistant materials"],
      cta: "Pre-Order →",
      ctaLink: "/hexisle/projects#volcanic-hex",
    },
  },
];

const ACCESSORY_PROJECTS: ProjectCard[] = [
  // ALWAYS FIRST: Add Your Own
  {
    id: "add-your-own-accessory",
    name: "Design Accessories",
    tagline: "The details that matter",
    description: "Create accessories, tokens, markers, or game aids for HexIsle. Small items, big impact.",
    icon: Plus,
    iconColor: "text-primary",
    status: "add_your_own",
    category: "custom",
    features: ["Any scale", "Game integration", "Community voting", "83.3% royalties"],
    backContent: {
      details: "Design tokens, markers, dice, card holders, or any accessory that enhances HexIsle gameplay. Small production runs welcome.",
      specs: ["Any reasonable size", "Game-compatible", "Material flexible"],
      cta: "Design Accessory →",
      ctaLink: "/factory",
    },
  },
  {
    id: "resource-tokens",
    name: "Resource Token Set",
    tagline: "Track your empire",
    description: "Physical tokens for Water, Credits, Materials, and Food. Weighted for satisfying gameplay.",
    icon: Package,
    iconColor: "text-blue-500",
    status: "available",
    category: "accessory",
    preOrderCount: 156,
    price: "8 Credits",
    creator: "Liana Banyan Studio",
    features: ["4 resource types", "Metal-weighted", "Stackable", "Storage box"],
    backContent: {
      details: "Set of 40 tokens (10 each of Water, Credits, Materials, Food) with metal inserts for satisfying weight. Includes magnetic storage box.",
      specs: ["20mm diameter", "Metal core", "Resin exterior"],
      cta: "Pre-Order Set →",
      ctaLink: "/hexisle/projects#resource-tokens",
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FLIPCARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ProjectFlipCard({ project }: { project: ProjectCard }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAddYourOwn = project.status === "add_your_own";

  const statusBadge = {
    available: { label: "Available", className: "bg-green-500/10 text-green-600 border-green-500/20" },
    coming_soon: { label: "Planned", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    in_production: { label: "In Production", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    add_your_own: { label: "Your Design Here", className: "bg-primary/10 text-primary border-primary/20" },
  }[project.status];

  return (
    <div onClick={() => setIsFlipped(!isFlipped)}>
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <Card
          className={`absolute w-full h-full backface-hidden ${
            isAddYourOwn
              ? "border-2 border-dashed border-primary/50 bg-primary/5"
              : "border"
          }`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg ${isAddYourOwn ? "bg-primary/10" : "bg-muted"}`}>
                <project.icon className={`h-6 w-6 ${project.iconColor}`} />
              </div>
              <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
            </div>
            <CardTitle className="text-lg mt-3">{project.name}</CardTitle>
            <CardDescription className="text-sm">{project.tagline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>

            {project.features && (
              <div className="flex flex-wrap gap-1">
                {project.features.slice(0, 3).map((f) => (
                  <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                ))}
                {project.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{project.features.length - 3}</Badge>
                )}
              </div>
            )}

            {!isAddYourOwn && (
              <div className="flex items-center justify-between text-sm pt-2">
                {project.price && <span className="font-medium">{project.price}</span>}
                {project.preOrderCount && (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> {project.preOrderCount} pre-orders
                  </span>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground text-right pt-2">
              tap to flip →
            </p>
          </CardContent>
        </Card>

        {/* BACK */}
        <Card
          className={`absolute w-full h-full backface-hidden rotate-y-180 ${
            isAddYourOwn
              ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30"
              : "bg-gradient-to-br from-muted/50 to-background"
          }`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {isAddYourOwn && <Sparkles className="h-4 w-4 text-primary" />}
              {project.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{project.backContent?.details}</p>

            {project.backContent?.specs && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Specifications:</p>
                <ul className="text-xs space-y-1">
                  {project.backContent.specs.map((spec, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.creator && (
              <p className="text-xs text-muted-foreground">
                Created by: <span className="font-medium">{project.creator}</span>
              </p>
            )}

            <Button
              className="w-full mt-4"
              variant={isAddYourOwn ? "default" : "secondary"}
              onClick={(e) => {
                e.stopPropagation();
                const link = project.backContent?.ctaLink;
                if (link && link.startsWith('/factory')) {
                  navigate(link);
                } else if (link) {
                  toast({
                    title: `${project.name}`,
                    description: project.status === 'coming_soon'
                      ? 'Join the waitlist by backing on Kickstarter.'
                      : 'Pre-orders open during the Kickstarter campaign. Stay tuned!',
                  });
                }
              }}
            >
              {project.backContent?.cta || "Learn More"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function HexIsleProjects() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Compute stats from actual project arrays (not hardcoded fiction)
  const allProjects = [...CHARACTER_PROJECTS, ...TERRAIN_PROJECTS, ...ACCESSORY_PROJECTS];
  const productProjects = allProjects.filter(p => p.status !== 'add_your_own');
  const totalPreOrders = productProjects.reduce((sum, p) => sum + (p.preOrderCount || 0), 0);
  const availableCount = productProjects.filter(p => p.status === 'available').length;
  const inProductionCount = productProjects.filter(p => p.status === 'in_production').length;

  return (
    <PortalPageLayout>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Waves className="h-10 w-10 text-cyan-500" />
          <h1 className="text-4xl font-bold">HexIsle Projects</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Figures, terrain, and accessories for the water-powered gaming universe.
          <br />
          <span className="text-primary font-medium">Design your own — earn 83.3%</span>
        </p>
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          <Crown className="w-3 h-3 mr-1" /> Crown Jewel #3: Tereno Hydraulic
        </Badge>
      </div>

      {/* The 6-Level Production Showcase */}
      <HexIsleShowcase />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-2xl font-bold">{totalPreOrders.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Pre-Orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Package className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <div className="text-2xl font-bold">{availableCount}</div>
            <div className="text-xs text-muted-foreground">Products Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Factory className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold">{inProductionCount}</div>
            <div className="text-xs text-muted-foreground">In Production</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Plus className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <div className="text-2xl font-bold">&infin;</div>
            <div className="text-xs text-muted-foreground">Your Designs Welcome</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="characters" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="characters" className="flex items-center gap-2">
            <Sword className="h-4 w-4" /> Figures ({CHARACTER_PROJECTS.length})
          </TabsTrigger>
          <TabsTrigger value="terrain" className="flex items-center gap-2">
            <Compass className="h-4 w-4" /> Terrain ({TERRAIN_PROJECTS.length})
          </TabsTrigger>
          <TabsTrigger value="accessories" className="flex items-center gap-2">
            <Package className="h-4 w-4" /> Accessories ({ACCESSORY_PROJECTS.length})
          </TabsTrigger>
        </TabsList>

        {/* Figures Tab */}
        <TabsContent value="characters" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Figure Miniatures</h2>
              <p className="text-muted-foreground">Archetypes of the HexIsle archipelago</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/factory")}>
              <Plus className="h-4 w-4 mr-2" /> Submit Your Design
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CHARACTER_PROJECTS.map((project) => (
              <ProjectFlipCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>

        {/* Terrain Tab */}
        <TabsContent value="terrain" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Terrain Tiles</h2>
              <p className="text-muted-foreground">Modular hex tiles with hydraulic integration</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/factory")}>
              <Plus className="h-4 w-4 mr-2" /> Submit Your Design
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TERRAIN_PROJECTS.map((project) => (
              <ProjectFlipCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>

        {/* Accessories Tab */}
        <TabsContent value="accessories" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Accessories</h2>
              <p className="text-muted-foreground">Tokens, markers, and game aids</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/factory")}>
              <Plus className="h-4 w-4 mr-2" /> Submit Your Design
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACCESSORY_PROJECTS.map((project) => (
              <ProjectFlipCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Factory CTA */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold">The Factory Pipeline</h3>
              <p className="text-muted-foreground">
                Every product here goes through our decentralized manufacturing system.
                Submit an idea → Community votes → We manufacture → You earn 83.3%.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/factory")}>
                <Factory className="h-4 w-4 mr-2" /> Enter The Factory
              </Button>
              <Button variant="outline" onClick={() => navigate("/hexisle")}>
                <Waves className="h-4 w-4 mr-2" /> HexIsle Game
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
