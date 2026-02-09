import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Anchor, Compass, Wrench, Swords, Search, Wand2, Dumbbell } from 'lucide-react';

const ISLANDS = [
  { key: 'harvest', label: 'Harvest Island', icon: Anchor, description: 'Documentation & Content' },
  { key: 'navigate', label: 'Navigate Island', icon: Compass, description: 'Marketing & Strategy' },
  { key: 'engineer', label: 'Engineer Island', icon: Wrench, description: 'Technical Development' },
  { key: 'battle', label: 'Battle Island', icon: Swords, description: 'Testing & QA' },
  { key: 'seek', label: 'Seek Island', icon: Search, description: 'Research & Discovery' },
  { key: 'magic', label: 'Magic Island', icon: Wand2, description: 'Design & Creativity' },
  { key: 'train', label: 'Train Island', icon: Dumbbell, description: 'Learning & Growth' },
];

interface ProjectIslandMapperProps {
  projectId: string;
}

export function ProjectIslandMapper({ projectId }: ProjectIslandMapperProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [primaryIsland, setPrimaryIsland] = useState<string>('');
  const [secondaryIslands, setSecondaryIslands] = useState<string[]>([]);
  const [countsAsRealStakes, setCountsAsRealStakes] = useState(false);

  // Fetch existing mapping
  const { data: mapping, isLoading } = useQuery({
    queryKey: ['project-island-mapping', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_hexisle_mapping' as any)
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Save mapping mutation
  const saveMappingMutation = useMutation({
    mutationFn: async () => {
      if (!primaryIsland) {
        throw new Error('Primary island is required');
      }

      const { error } = await supabase
        .from('project_hexisle_mapping' as any)
        .upsert({
          project_id: projectId,
          primary_island: primaryIsland,
          secondary_islands: secondaryIslands,
          counts_as_real_stakes: countsAsRealStakes,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Mapping Saved',
        description: 'Project island mapping has been updated',
      });
      queryClient.invalidateQueries({ queryKey: ['project-island-mapping', projectId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Initialize state from existing mapping
  useEffect(() => {
    if (mapping) {
      setPrimaryIsland((mapping as any).primary_island);
      setSecondaryIslands((mapping as any).secondary_islands || []);
      setCountsAsRealStakes((mapping as any).counts_as_real_stakes);
    }
  }, [mapping]);

  const toggleSecondaryIsland = (islandKey: string) => {
    setSecondaryIslands(prev =>
      prev.includes(islandKey)
        ? prev.filter(k => k !== islandKey)
        : [...prev, islandKey]
    );
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading island mapping...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>HexIsle Island Mapping</CardTitle>
        <CardDescription>
          Map your project to specific skill islands. Challenges will be organized by these islands.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Primary Island</Label>
          <Select value={primaryIsland} onValueChange={setPrimaryIsland}>
            <SelectTrigger>
              <SelectValue placeholder="Select primary island..." />
            </SelectTrigger>
            <SelectContent>
              {ISLANDS.map(island => {
                const Icon = island.icon;
                return (
                  <SelectItem key={island.key} value={island.key}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {island.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Secondary Islands</Label>
          <div className="grid grid-cols-2 gap-2">
            {ISLANDS.filter(i => i.key !== primaryIsland).map(island => {
              const Icon = island.icon;
              const isSelected = secondaryIslands.includes(island.key);
              return (
                <Button
                  key={island.key}
                  variant={isSelected ? 'default' : 'outline'}
                  className="justify-start h-auto py-3"
                  onClick={() => toggleSecondaryIsland(island.key)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{island.label}</div>
                    <div className="text-xs opacity-70">{island.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="real-stakes"
            checked={countsAsRealStakes}
            onCheckedChange={setCountsAsRealStakes}
          />
          <Label htmlFor="real-stakes">
            Counts as Real Stakes (verified project work)
          </Label>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Current Mapping</h4>
          <div className="space-y-2">
            {primaryIsland && (
              <div>
                <span className="text-sm text-muted-foreground">Primary: </span>
                <Badge variant="default">
                  {ISLANDS.find(i => i.key === primaryIsland)?.label}
                </Badge>
              </div>
            )}
            {secondaryIslands.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Secondary: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {secondaryIslands.map(key => (
                    <Badge key={key} variant="secondary">
                      {ISLANDS.find(i => i.key === key)?.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={() => saveMappingMutation.mutate()}
          disabled={!primaryIsland || saveMappingMutation.isPending}
          className="w-full"
        >
          {saveMappingMutation.isPending ? 'Saving...' : mapping ? 'Update Mapping' : 'Create Mapping'}
        </Button>
      </CardContent>
    </Card>
  );
}