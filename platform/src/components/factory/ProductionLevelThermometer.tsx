/**
 * PRODUCTION LEVEL THERMOMETER
 * ============================
 * Visual vote thermometer showing progress through 6 production levels.
 * Inspired by Kickstarter stretch goals but with cooperative economics.
 */

import { motion } from "framer-motion";
import { Flame, Snowflake, Zap, Trophy, Crown, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductionLevel {
  level: number;
  name: string;
  unitsRequired: number;
  unitPrice: number;
  votesNeeded: number;
  currentVotes: number;
  unlocked: boolean;
}

interface ProductionLevelThermometerProps {
  productName: string;
  levels: ProductionLevel[];
  currentLevel: number;
  totalVotes: number;
  compact?: boolean;
}

const LEVEL_ICONS = [Snowflake, Zap, Flame, Trophy, Crown, Star];
const LEVEL_COLORS = [
  "from-blue-400 to-blue-600",
  "from-slate-400 to-slate-600",
  "from-amber-400 to-amber-600",
  "from-green-400 to-green-600",
  "from-purple-400 to-purple-600",
  "from-yellow-400 to-yellow-600",
];

export function ProductionLevelThermometer({
  productName,
  levels,
  currentLevel,
  totalVotes,
  compact = false,
}: ProductionLevelThermometerProps) {
  const maxVotes = levels[levels.length - 1]?.votesNeeded || 1000000;
  const fillPercent = Math.min((totalVotes / maxVotes) * 100, 100);

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{productName}</span>
          <Badge variant={currentLevel >= 6 ? "default" : "secondary"}>
            Level {currentLevel}
          </Badge>
        </div>
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${LEVEL_COLORS[currentLevel - 1] || LEVEL_COLORS[0]}`}
            initial={{ width: 0 }}
            animate={{ width: `${fillPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          {/* Level markers */}
          {levels.map((level, index) => {
            const position = (level.votesNeeded / maxVotes) * 100;
            return (
              <div
                key={level.level}
                className={`absolute top-0 bottom-0 w-0.5 ${
                  level.unlocked ? "bg-white" : "bg-muted-foreground/30"
                }`}
                style={{ left: `${position}%` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{totalVotes.toLocaleString()} votes</span>
          <span>Level {currentLevel}: {levels[currentLevel - 1]?.name}</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{productName}</span>
          <Badge className={`bg-gradient-to-r ${LEVEL_COLORS[currentLevel - 1]}`}>
            Level {currentLevel}: {levels[currentLevel - 1]?.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Thermometer */}
        <div className="relative">
          {/* Background track */}
          <div className="h-8 bg-muted rounded-full overflow-hidden relative">
            {/* Fill */}
            <motion.div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${LEVEL_COLORS[currentLevel - 1] || LEVEL_COLORS[0]}`}
              initial={{ width: 0 }}
              animate={{ width: `${fillPercent}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            
            {/* Level markers */}
            {levels.map((level, index) => {
              const position = (level.votesNeeded / maxVotes) * 100;
              const Icon = LEVEL_ICONS[index];
              const isUnlocked = level.unlocked;
              
              return (
                <div
                  key={level.level}
                  className="absolute top-0 bottom-0 flex items-center"
                  style={{ left: `${position}%`, transform: "translateX(-50%)" }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isUnlocked
                        ? `bg-gradient-to-r ${LEVEL_COLORS[index]} border-white text-white`
                        : "bg-muted border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level Details */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
          {levels.map((level, index) => {
            const Icon = LEVEL_ICONS[index];
            const isUnlocked = level.unlocked;
            const isCurrent = level.level === currentLevel;
            
            return (
              <div
                key={level.level}
                className={`p-2 rounded-lg transition-all ${
                  isCurrent
                    ? "ring-2 ring-primary bg-primary/10"
                    : isUnlocked
                    ? "bg-muted/50"
                    : "opacity-50"
                }`}
              >
                <Icon className={`h-4 w-4 mx-auto ${isUnlocked ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-xs font-medium mt-1">{level.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {level.unitsRequired.toLocaleString()} units
                </p>
                <p className="text-[10px] font-medium">
                  ${level.unitPrice.toFixed(2)}/ea
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center pt-2 border-t text-sm">
          <div>
            <span className="text-muted-foreground">Total Votes: </span>
            <span className="font-bold">{totalVotes.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Next Level: </span>
            <span className="font-bold">
              {currentLevel < 6
                ? `${(levels[currentLevel]?.votesNeeded - totalVotes).toLocaleString()} more`
                : "MAX"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Price Drop: </span>
            <span className="font-bold text-green-600">
              {currentLevel < 6
                ? `${Math.round((1 - levels[currentLevel]?.unitPrice / levels[currentLevel - 1]?.unitPrice) * 100)}%`
                : "—"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductionLevelThermometer;
