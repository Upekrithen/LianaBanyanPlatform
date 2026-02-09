import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, Compass, Wrench, Swords, Search, 
  Wand2, GraduationCap, Trophy, Users, Lock 
} from "lucide-react";
import { toast } from "sonner";

const ISLAND_CONFIG = {
  harvest: {
    name: "Harvest Island",
    icon: Sparkles,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    description: "Resource Management & Funding",
    skills: ["fundraising", "budgeting", "procurement", "financial-planning"]
  },
  navigate: {
    name: "Navigate Island",
    icon: Compass,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Strategy & Planning",
    skills: ["roadmapping", "market-analysis", "coordination", "project-management"]
  },
  engineer: {
    name: "Engineer Island",
    icon: Wrench,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    description: "Technical Development",
    skills: ["coding", "design", "architecture", "testing"]
  },
  battle: {
    name: "Battle Island",
    icon: Swords,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    description: "Operations & Execution",
    skills: ["delivery", "problem-solving", "crisis-management", "optimization"]
  },
  seek: {
    name: "Seek Island",
    icon: Search,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Research & Discovery",
    skills: ["user-research", "market-research", "data-analysis", "exploration"]
  },
  magic: {
    name: "Magic Island",
    icon: Wand2,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    description: "Innovation & Creativity",
    skills: ["ideation", "ux-design", "branding", "storytelling"]
  },
  train: {
    name: "Train Island",
    icon: GraduationCap,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    description: "Leadership & Growth",
    skills: ["mentoring", "team-building", "teaching", "culture"]
  }
};

export default function HexisleDashboard() {
  const [showRealStakes, setShowRealStakes] = useState(false);

  // Fetch user skills
  const { data: userSkills, isLoading } = useQuery({
    queryKey: ['user-hexisle-skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_hexisle_skills')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ['hexisle-preferences'],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from('user_hexisle_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch team skill profiles (guilds & clans)
  const { data: teamProfiles } = useQuery({
    queryKey: ['team-skill-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_skill_profiles')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const handleModeToggle = async (realStakesEnabled: boolean) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { error } = await supabase
      .from('user_hexisle_preferences')
      .upsert({
        user_id: userId,
        real_stakes_enabled: realStakesEnabled,
        preferred_mode: realStakesEnabled ? 'real_stakes' : 'casual'
      });

    if (error) {
      toast.error("Failed to update mode");
    } else {
      toast.success(realStakesEnabled 
        ? "Real Stakes mode enabled - Your project work will count!" 
        : "Casual mode enabled - Play for fun!");
      setShowRealStakes(realStakesEnabled);
    }
  };

  const getSkillData = (islandKey: string) => {
    const skill = userSkills?.find(s => s.island_name === islandKey);
    return skill || {
      skill_level: 0,
      xp_earned: 0,
      xp_to_next_level: 100,
      game_mode_progress: 0,
      real_stakes_progress: 0,
      island_unlocked: false
    };
  };

  if (isLoading) {
    return <div>Loading HexIsle...</div>;
  }

  const totalLevel = userSkills?.reduce((sum, s) => sum + s.skill_level, 0) || 0;
  const averageLevel = userSkills?.length ? Math.round(totalLevel / userSkills.length) : 0;
  const unlockedIslands = userSkills?.filter(s => s.island_unlocked).length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">HexIsle Progression</h1>
          <p className="text-muted-foreground">
            Your journey across the 7 skill islands
          </p>
        </div>
        
        {/* Mode Toggle */}
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Label htmlFor="real-stakes">Real Stakes Mode</Label>
            <Switch
              id="real-stakes"
              checked={preferences?.real_stakes_enabled || false}
              onCheckedChange={handleModeToggle}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {preferences?.real_stakes_enabled 
              ? "Project work counts as verified progress" 
              : "Playing casually for fun"}
          </p>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageLevel}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Islands Unlocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{unlockedIslands} / 7</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total XP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {userSkills?.reduce((sum, s) => sum + s.xp_earned, 0) || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={preferences?.real_stakes_enabled ? "default" : "secondary"}>
              {preferences?.preferred_mode || 'casual'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="islands" className="space-y-4">
        <TabsList>
          <TabsTrigger value="islands">Your Islands</TabsTrigger>
          <TabsTrigger value="team">Team Skills</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Islands Progress */}
        <TabsContent value="islands" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(ISLAND_CONFIG).map(([key, config]) => {
              const skillData = getSkillData(key);
              const Icon = config.icon;
              const progress = (skillData.xp_earned / skillData.xp_to_next_level) * 100;
              
              return (
                <Card key={key} className={skillData.island_unlocked ? '' : 'opacity-50'}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                          <Icon className={`h-6 w-6 ${config.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{config.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {config.description}
                          </CardDescription>
                        </div>
                      </div>
                      {!skillData.island_unlocked && (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Level {skillData.skill_level}</span>
                      <span className="text-muted-foreground">
                        {skillData.xp_earned} / {skillData.xp_to_next_level} XP
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    
                    {preferences?.real_stakes_enabled && (
                      <div className="flex gap-2 text-xs">
                        <div className="flex-1 p-2 bg-primary/5 rounded">
                          <div className="font-medium">Casual</div>
                          <div>{skillData.game_mode_progress} XP</div>
                        </div>
                        <div className="flex-1 p-2 bg-primary/10 rounded">
                          <div className="font-medium">Verified</div>
                          <div>{skillData.real_stakes_progress} XP</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {config.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Team Skills */}
        <TabsContent value="team" className="space-y-4">
          {teamProfiles && teamProfiles.length > 0 ? (
            <div className="grid gap-4">
              {teamProfiles.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {team.team_type === 'guild' ? 'Guild' : team.team_type === 'clan' ? 'Clan' : 'Project'} Team
                        </CardTitle>
                        <CardDescription>
                          Collective skill coverage across all islands
                        </CardDescription>
                      </div>
                      {team.balanced_team && (
                        <Badge className="gap-1">
                          <Trophy className="h-3 w-3" />
                          Balanced Team
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {Object.entries(ISLAND_CONFIG).map(([key, config]) => {
                        const coverage = team.skill_coverage?.[key];
                        const Icon = config.icon;
                        
                        return (
                          <div key={key} className="text-center">
                            <div className={`p-2 rounded-lg ${config.bgColor} mb-2`}>
                              <Icon className={`h-4 w-4 ${config.color} mx-auto`} />
                            </div>
                            <div className="text-xs font-medium">
                              {coverage?.member_count || 0} members
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Avg L{coverage?.avg_level || 0}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {team.skill_gaps && team.skill_gaps.length > 0 && (
                      <div className="mt-4 p-3 bg-destructive/5 rounded-lg">
                        <p className="text-sm font-medium">Skill Gaps:</p>
                        <p className="text-xs text-muted-foreground">
                          Missing coverage: {team.skill_gaps.join(', ')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Join a guild or clan to see team skill profiles
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Complete islands and projects to unlock achievements
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
