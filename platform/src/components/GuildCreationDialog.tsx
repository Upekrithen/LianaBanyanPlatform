import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface GuildCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentGuildId?: string;
}

export function GuildCreationDialog({ open, onOpenChange, parentGuildId }: GuildCreationDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [customName, setCustomName] = useState('guild');
  const [description, setDescription] = useState('');
  const [guildType, setGuildType] = useState<'division' | 'industry' | 'skill'>('skill');
  const [submitting, setSubmitting] = useState(false);

  const { data: nameTypes } = useQuery({
    queryKey: ['guild-name-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guild_name_types')
        .select('*')
        .eq('is_active', true)
        .order('name_type');
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your guild",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a guild",
          variant: "destructive"
        });
        return;
      }

      // Create guild
      const { data: guild, error: guildError } = await supabase
        .from('guilds')
        .insert({
          name,
          display_name: name,
          custom_name: customName,
          guild_type: guildType,
          parent_guild_id: parentGuildId || null,
          description,
          created_by: user.id,
          is_official: false
        })
        .select()
        .single();

      if (guildError) throw guildError;

      // Auto-join creator as member
      const { error: memberError } = await supabase
        .from('guild_members')
        .insert({
          guild_id: guild.id,
          user_id: user.id
        });

      if (memberError) throw memberError;

      toast({
        title: `${customName.charAt(0).toUpperCase() + customName.slice(1)} created!`,
        description: `Your ${customName} "${name}" has been created. You can now invite members.`
      });

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error creating guild",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCustomName('guild');
    setDescription('');
    setGuildType('skill');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Your {customName.charAt(0).toUpperCase() + customName.slice(1)}</DialogTitle>
          <DialogDescription>
            Start your own collective within the Liana Banyan network. Choose your preferred name and structure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Custom Name Type */}
          <div>
            <Label htmlFor="custom-name">What would you like to call it?</Label>
            <Select value={customName} onValueChange={setCustomName}>
              <SelectTrigger id="custom-name">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {nameTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.name_type}>
                    <div>
                      <div className="font-medium">{type.name_type}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Guild Name */}
          <div>
            <Label htmlFor="name">{customName.charAt(0).toUpperCase() + customName.slice(1)} Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter your ${customName} name...`}
            />
          </div>

          {/* Guild Type */}
          <div>
            <Label htmlFor="guild-type">Type</Label>
            <Select value={guildType} onValueChange={(v: any) => setGuildType(v)}>
              <SelectTrigger id="guild-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skill">Skill-Based (e.g., Woodworking, 3D Printing)</SelectItem>
                <SelectItem value="industry">Industry-Based (e.g., Manufacturing, Design)</SelectItem>
                <SelectItem value="division">Division (Top-Level Organization)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Describe your ${customName}'s purpose and focus...`}
              rows={4}
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-muted rounded-lg text-sm">
            <div className="font-medium mb-1">Become a Trunk in the Liana Banyan</div>
            <div className="text-muted-foreground">
              Your {customName} can grow into a full trunk with branches connecting to all other parts of the network. 
              Create a charter to pool resources, establish B2B contracts, or form affiliated businesses.
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
              {submitting ? 'Creating...' : `Create ${customName.charAt(0).toUpperCase() + customName.slice(1)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
