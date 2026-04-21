/**
 * CREATE FAMILY DIALOG
 * ====================
 * Dialog for creating a new family (or Crew, Troupe, etc.)
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateFamilyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (family: any) => void;
}

const DISPLAY_NAME_OPTIONS = [
  { value: 'Family', label: 'Family', description: 'Traditional family unit' },
  { value: 'Crew', label: 'Crew', description: 'Close-knit group of friends' },
  { value: 'Troupe', label: 'Troupe', description: 'Performance or creative group' },
  { value: 'Household', label: 'Household', description: 'People living together' },
  { value: 'Circle', label: 'Circle', description: 'Intimate support network' },
  { value: 'Clan', label: 'Clan', description: 'Extended family or community' },
];

const SYMBOL_SUGGESTIONS = [
  '👨‍👩‍👧‍👦', '🏠', '💜', '⭐', '🌟', '🎭', '🎨', '🎵', '🌳', '🦋',
  '🔥', '☀️', '🌙', '🌺', '🦊', '🐺', '🦅', '🌊', '⚡', '💫'
];

export function CreateFamilyDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateFamilyDialogProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("Family");
  const [founderNickname, setFounderNickname] = useState("");
  const [founderSymbol, setFounderSymbol] = useState("👤");

  const createFamily = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/family-create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            displayName,
            founderNickname,
            founderSymbol,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create family');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-families'] });
      toast.success(data.message);
      onOpenChange(false);
      resetForm();
      if (onSuccess) onSuccess(data.family);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setName("");
    setDisplayName("Family");
    setFounderNickname("");
    setFounderSymbol("👤");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !founderNickname.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    createFamily.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Your {displayName}
          </DialogTitle>
          <DialogDescription>
            Start a new family group where members share calendars, gift lists, and more.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Family Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {displayName} Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              placeholder={`e.g., The ${displayName === 'Family' ? 'Smith' : 'Awesome'} ${displayName}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Display Name Type */}
          <div className="space-y-2">
            <Label>What do you call your group?</Label>
            <Select value={displayName} onValueChange={setDisplayName}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISPLAY_NAME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Your Nickname */}
          <div className="space-y-2">
            <Label htmlFor="nickname">
              Your Nickname <span className="text-red-400">*</span>
            </Label>
            <Input
              id="nickname"
              placeholder="What should family members call you?"
              value={founderNickname}
              onChange={(e) => setFounderNickname(e.target.value)}
              required
            />
          </div>

          {/* Your Symbol */}
          <div className="space-y-2">
            <Label>Your Symbol</Label>
            <div className="flex flex-wrap gap-2">
              {SYMBOL_SUGGESTIONS.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => setFounderSymbol(symbol)}
                  className={`
                    w-10 h-10 rounded-lg text-xl flex items-center justify-center
                    transition-all
                    ${founderSymbol === symbol
                      ? 'bg-purple-500/30 ring-2 ring-purple-500'
                      : 'bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  {symbol}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              This symbol represents you within the {displayName.toLowerCase()}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createFamily.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {createFamily.isPending ? (
                <>Creating...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create {displayName}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
