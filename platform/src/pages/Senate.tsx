/**
 * SENATE — Governance Navigation Hub
 * ===================================
 * MYST-style navigation through the governance halls.
 * 
 * Structure:
 * - Hexagon Hub (center) — Main navigation
 * - Six Corridors:
 *   1. Hall of Records (The Pnyx) — Academic papers, letters
 *   2. Hall of Innovations — Patent registry, voting on prosecution
 *   3. Hall of Projects — Member-submitted projects
 *   4. Hall of Initiatives — Charitable programs
 *   5. Salt Mines — Work offerings, job postings
 *   6. Tower of Peace — Political Expedition, Assembly Hall
 *
 * Tower of Peace Structure:
 * - Base: Senate hexagon hub
 * - Mid: Wide staircase (MYST-style navigation)
 * - Top: Balcony (academics, "College of Hard Knocks")
 * - Suspended: BrainStorm room (ideas challenged)
 * - Above: Observatory with glass dome
 *
 * Navigation: Click to teleport (not animated walk)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen, Lightbulb, FolderKanban, Heart, Pickaxe, Building2,
  ArrowRight, Eye, Users, Vote, FileText, Telescope, Cloud,
  GraduationCap, MessageSquare, ChevronUp, Home
} from "lucide-react";
import "./Senate.css";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

type HallId = "records" | "innovations" | "projects" | "initiatives" | "saltmines" | "tower";
type TowerLevel = "base" | "staircase" | "balcony" | "brainstorm" | "observatory";

interface Hall {
  id: HallId;
  name: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  route: string;
  features: string[];
}

interface TowerRoom {
  level: TowerLevel;
  name: string;
  description: string;
  icon: React.ElementType;
  features: string[];
}

const HALLS: Hall[] = [
  {
    id: "records",
    name: "Hall of Records",
    subtitle: "The Pnyx",
    description: "Academic papers, letters, and historical documents",
    icon: BookOpen,
    color: "from-amber-500/20 to-amber-600/10",
    route: "/senate/records",
    features: ["Academic Papers", "Crown Letters", "Platform History", "Research Archive"],
  },
  {
    id: "innovations",
    name: "Hall of Innovations",
    subtitle: "Patent Registry",
    description: "2,128 innovations. Vote on which patents to prosecute. Bucket pedestals for IP Load Balancing.",
    icon: Lightbulb,
    color: "from-yellow-500/20 to-yellow-600/10",
    route: "/senate/innovations",
    features: ["Innovation Registry", "Patent Buckets", "IP Load Balancing", "Prosecution Queue"],
  },
  {
    id: "projects",
    name: "Hall of Projects",
    subtitle: "Member Submissions",
    description: "Projects submitted by members for community review",
    icon: FolderKanban,
    color: "from-blue-500/20 to-blue-600/10",
    route: "/senate/projects",
    features: ["Project Proposals", "Community Voting", "Funding Decisions", "Progress Tracking"],
  },
  {
    id: "initiatives",
    name: "Hall of Initiatives",
    subtitle: "The Sweet Sixteen",
    description: "Charitable programs and community initiatives",
    icon: Heart,
    color: "from-pink-500/20 to-pink-600/10",
    route: "/initiatives",
    features: ["16 Initiatives", "Crown Leadership", "Launch Status", "Resource Allocation"],
  },
  {
    id: "saltmines",
    name: "Salt Mines",
    subtitle: "Work Offerings",
    description: "Job postings, bounties, and work opportunities",
    icon: Pickaxe,
    color: "from-gray-500/20 to-gray-600/10",
    route: "/senate/saltmines",
    features: ["Job Postings", "Bounty Board", "Skill Matching", "Contract Work"],
  },
  {
    id: "tower",
    name: "Tower of Peace",
    subtitle: "Political Expedition",
    description: "Where politics happens — OUTSIDE the main platform",
    icon: Building2,
    color: "from-purple-500/20 to-purple-600/10",
    route: "/senate/tower",
    features: ["Assembly Hall", "BrainStorm Room", "Observatory", "Academic Balcony"],
  },
];

const TOWER_ROOMS: TowerRoom[] = [
  {
    level: "observatory",
    name: "Observatory",
    description: "Glass dome with personalized view. Bifrost connection to other realms.",
    icon: Telescope,
    features: ["Personalized Dashboard", "Bifrost Portal", "Star Map", "Cosmic View"],
  },
  {
    level: "brainstorm",
    name: "BrainStorm Room",
    description: "Suspended chamber where ideas are challenged and refined.",
    icon: Cloud,
    features: ["Idea Challenges", "Devil's Advocate", "Stress Testing", "Refinement"],
  },
  {
    level: "balcony",
    name: "Academic Balcony",
    description: "Circular walkway for the College of Hard Knocks. Look down on the Assembly.",
    icon: GraduationCap,
    features: ["Academic Ring", "Research Oversight", "Peer Review", "Scholarly Debate"],
  },
  {
    level: "staircase",
    name: "Grand Staircase",
    description: "Wide MYST-style staircase connecting all levels.",
    icon: ChevronUp,
    features: ["Level Navigation", "Ambient Lighting", "Echo Chamber", "Transition Space"],
  },
  {
    level: "base",
    name: "Assembly Hall",
    description: "Where political discussions happen. Switzerland Protocol applies.",
    icon: MessageSquare,
    features: ["Political Discussion", "Shirley Temple Protocol", "Expedition Staging", "Outside the Gates"],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HEXAGON HUB COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface HexagonHubProps {
  onHallSelect: (hall: Hall) => void;
  selectedHall: HallId | null;
}

function HexagonHub({ onHallSelect, selectedHall }: HexagonHubProps) {
  return (
    <div className="senate-hexagon-hub">
      {/* Center piece */}
      <div className="senate-center">
        <div className="senate-center-inner">
          <Vote className="h-8 w-8 text-primary" />
          <span className="text-xs font-medium mt-1">Senate</span>
        </div>
      </div>
      
      {/* Six halls arranged in hexagon */}
      {HALLS.map((hall, index) => {
        const angle = (index * 60 - 90) * (Math.PI / 180); // Start from top
        const radius = 140; // Distance from center
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <button
            key={hall.id}
            className={`senate-hall-button ${selectedHall === hall.id ? 'selected' : ''}`}
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
            onClick={() => onHallSelect(hall)}
          >
            <div className={`senate-hall-icon bg-gradient-to-br ${hall.color}`}>
              <hall.icon className="h-6 w-6" />
            </div>
            <span className="senate-hall-name">{hall.name}</span>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOWER OF PEACE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface TowerOfPeaceProps {
  onRoomSelect: (room: TowerRoom) => void;
  onBack: () => void;
}

function TowerOfPeace({ onRoomSelect, onBack }: TowerOfPeaceProps) {
  return (
    <div className="tower-of-peace">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <Home className="h-4 w-4 mr-2" />
        Back to Senate
      </Button>
      
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Building2 className="h-6 w-6" />
        Tower of Peace
      </h2>
      
      <div className="tower-structure">
        {TOWER_ROOMS.map((room, index) => (
          <Card 
            key={room.level}
            className={`tower-room tower-room-${room.level} cursor-pointer hover:shadow-lg transition-all`}
            onClick={() => onRoomSelect(room)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <room.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">{room.name}</h3>
                  <p className="text-xs text-muted-foreground">{room.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {room.features.map(f => (
                  <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Switzerland Protocol Notice */}
      <Card className="mt-6 border-amber-500/30 bg-amber-500/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🇨🇭</span>
            <div>
              <h4 className="font-bold text-amber-700">Switzerland Protocol</h4>
              <p className="text-sm text-muted-foreground">
                The Tower of Peace operates OUTSIDE the main platform. Political discussions 
                happen here, not inside Liana Banyan proper. Use the Shirley Temple Protocol — 
                represent yourself, not the platform.
              </p>
              <div className="mt-4 pt-4 border-t border-amber-200/50">
                <p className="text-sm italic text-muted-foreground leading-relaxed">
                  "But to every mind there openeth,<br />
                  A way, and way, and away,<br />
                  A high soul climbs the highway,<br />
                  And the low soul gropes the low,<br />
                  And in between on the misty flats,<br />
                  The rest drift to and fro.<br />
                  <br />
                  But to every man there openeth,<br />
                  A high way and a low,<br />
                  And every mind decideth,<br />
                  The way his soul shall go.<br />
                  <br />
                  One ship sails East,<br />
                  And another West,<br />
                  By the self-same winds that blow,<br />
                  'Tis the set of the sails<br />
                  And not the gales,<br />
                  That tells the way we go.<br />
                  <br />
                  Like the winds of the sea<br />
                  Are the waves of time,<br />
                  As we journey along through life,<br />
                  'Tis the set of the soul,<br />
                  That determines the goal,<br />
                  And not the calm or the strife."<br />
                  <span className="text-amber-700 font-medium mt-2 block">— Ella Wheeler Wilcox</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HALL DETAIL DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

interface HallDetailProps {
  hall: Hall | null;
  open: boolean;
  onClose: () => void;
  onEnter: () => void;
}

function HallDetail({ hall, open, onClose, onEnter }: HallDetailProps) {
  if (!hall) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <hall.icon className="h-5 w-5" />
            {hall.name}
          </DialogTitle>
          <DialogDescription>{hall.subtitle}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <p>{hall.description}</p>
          
          <div>
            <h4 className="font-medium mb-2">What You'll Find</h4>
            <div className="flex flex-wrap gap-2">
              {hall.features.map(f => (
                <Badge key={f} variant="secondary">{f}</Badge>
              ))}
            </div>
          </div>
          
          {hall.name === "Tower of Peace" && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm italic text-muted-foreground leading-relaxed">
                "But to every mind there openeth,<br />
                A way, and way, and away,<br />
                A high soul climbs the highway,<br />
                And the low soul gropes the low,<br />
                And in between on the misty flats,<br />
                The rest drift to and fro.<br />
                <br />
                But to every man there openeth,<br />
                A high way and a low,<br />
                And every mind decideth,<br />
                The way his soul shall go.<br />
                <br />
                One ship sails East,<br />
                And another West,<br />
                By the self-same winds that blow,<br />
                'Tis the set of the sails<br />
                And not the gales,<br />
                That tells the way we go.<br />
                <br />
                Like the winds of the sea<br />
                Are the waves of time,<br />
                As we journey along through life,<br />
                'Tis the set of the soul,<br />
                That determines the goal,<br />
                And not the calm or the strife."<br />
                <span className="text-purple-500 font-medium mt-2 block">— Ella Wheeler Wilcox</span>
              </p>
            </div>
          )}
          
          <Button onClick={onEnter} className="w-full gap-2">
            Enter {hall.name}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SENATE PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function Senate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedHall, setSelectedHall] = useState<HallId | null>(null);
  const [showHallDetail, setShowHallDetail] = useState(false);
  const [showTower, setShowTower] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<TowerRoom | null>(null);

  const handleHallSelect = (hall: Hall) => {
    if (hall.id === "tower") {
      setShowTower(true);
    } else {
      setSelectedHall(hall.id);
      setShowHallDetail(true);
    }
  };

  const handleEnterHall = () => {
    const hall = HALLS.find(h => h.id === selectedHall);
    if (hall) {
      navigate(hall.route);
    }
    setShowHallDetail(false);
  };

  const handleRoomSelect = (room: TowerRoom) => {
    setSelectedRoom(room);
    // Navigate to room-specific route
    navigate(`/senate/tower/${room.level}`);
  };

  const currentHall = HALLS.find(h => h.id === selectedHall);

  return (
    <div className="senate-page">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Vote className="h-10 w-10 text-primary" />
          The Senate
        </h1>
        <p className="text-muted-foreground mt-2">
          Governance hub. Click a hall to enter.
        </p>
      </div>

      {/* Main Content */}
      {showTower ? (
        <TowerOfPeace 
          onRoomSelect={handleRoomSelect}
          onBack={() => setShowTower(false)}
        />
      ) : (
        <>
          {/* Hexagon Navigation */}
          <div className="flex justify-center mb-8">
            <HexagonHub 
              onHallSelect={handleHallSelect}
              selectedHall={selectedHall}
            />
          </div>

          {/* Hall Cards (alternative navigation) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {HALLS.map(hall => (
              <Card 
                key={hall.id}
                className={`cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br ${hall.color}`}
                onClick={() => handleHallSelect(hall)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <hall.icon className="h-5 w-5" />
                    {hall.name}
                  </CardTitle>
                  <CardDescription>{hall.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{hall.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {hall.features.slice(0, 3).map(f => (
                      <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                    {hall.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{hall.features.length - 3}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Hall Detail Dialog */}
      <HallDetail
        hall={currentHall || null}
        open={showHallDetail}
        onClose={() => setShowHallDetail(false)}
        onEnter={handleEnterHall}
      />

      {/* Quick Stats */}
      <Card className="mt-8">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">6</p>
              <p className="text-xs text-muted-foreground">Halls</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">2,097</p>
              <p className="text-xs text-muted-foreground">Patent Claims</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">16</p>
              <p className="text-xs text-muted-foreground">Initiatives</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">10</p>
              <p className="text-xs text-muted-foreground">Provisional Apps</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
