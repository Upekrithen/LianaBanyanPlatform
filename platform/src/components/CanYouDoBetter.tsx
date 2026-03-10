/**
 * CAN YOU DO BETTER? — CSS Zen Garden Button
 * =============================================
 * Appears on major UI elements. Opens a panel to:
 * - View current CSS for this element
 * - Submit your own CSS theme
 * - Vote on other submissions
 * - Link to bounties for design improvements
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Paintbrush, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface CanYouDoBetterProps {
  elementId: string; // data-zen attribute value
  elementLabel?: string;
}

export function CanYouDoBetter({ elementId, elementLabel }: CanYouDoBetterProps) {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCss, setNewCss] = useState("");

  // Load themes for this element
  const { data: themes } = useQuery({
    queryKey: ["zen-themes", elementId],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_themes")
        .select("*, profiles:user_id(full_name)")
        .eq("target_element", elementId)
        .eq("is_active", true)
        .order("vote_count", { ascending: false });
      return data || [];
    },
    enabled: open,
  });

  // Submit theme
  const submitTheme = useMutation({
    mutationFn: async () => {
      if (!user) { openOnboard({ reason: "Submit your CSS theme design", actionLabel: "Submit Theme" }); return; }
      if (!newName || !newCss) throw new Error("Name and CSS required");

      const { error } = await supabase.from("user_themes").insert({
        user_id: user.id,
        name: newName,
        target_element: elementId,
        css_content: newCss,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Theme submitted!");
      setNewName("");
      setNewCss("");
      queryClient.invalidateQueries({ queryKey: ["zen-themes", elementId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
  });

  // Vote
  const vote = useMutation({
    mutationFn: async ({ themeId, voteValue }: { themeId: string; voteValue: number }) => {
      if (!user) { openOnboard({ reason: "Vote on community themes", actionLabel: "Vote" }); return; }
      await supabase.from("theme_votes").upsert({
        user_id: user.id,
        theme_id: themeId,
        vote: voteValue,
      }, { onConflict: "user_id,theme_id" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["zen-themes", elementId] }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 backdrop-blur rounded-full p-1 border border-border hover:border-primary"
          title="Can You Do Better?"
        >
          <Paintbrush className="w-3 h-3 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paintbrush className="w-5 h-5" />
            Can You Do Better?
          </DialogTitle>
          <DialogDescription>
            {elementLabel || elementId} — Submit your own CSS, vote on others.
          </DialogDescription>
        </DialogHeader>

        {/* Existing themes */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Community Themes ({themes?.length || 0})</h4>
          {themes && themes.length > 0 ? (
            themes.map((theme: any) => (
              <div key={theme.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{theme.name}</span>
                  <Badge variant="outline">{theme.vote_count} votes</Badge>
                </div>
                <pre className="text-xs bg-background p-2 rounded overflow-x-auto max-h-20">
                  {theme.css_content.slice(0, 200)}...
                </pre>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => vote.mutate({ themeId: theme.id, voteValue: 1 })}
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" /> Up
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => vote.mutate({ themeId: theme.id, voteValue: -1 })}
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" /> Down
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No themes yet. Be the first!</p>
          )}
        </div>

        {/* Submit new */}
        {user && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-medium">Submit Your Theme</h4>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Theme name..."
            />
            <Textarea
              value={newCss}
              onChange={(e) => setNewCss(e.target.value)}
              placeholder={`/* CSS targeting [data-zen="${elementId}"] */\n[data-zen="${elementId}"] {\n  \n}`}
              rows={6}
              className="font-mono text-xs"
            />
            <Button
              onClick={() => submitTheme.mutate()}
              disabled={!newName || !newCss || submitTheme.isPending}
              className="w-full"
            >
              Submit Theme
            </Button>
          </div>
        )}

        {/* Bounty link */}
        <div className="border-t pt-3">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => { setOpen(false); navigate("/help-wanted"); }}
          >
            <ExternalLink className="w-4 h-4" />
            See Design Bounties on Help Wanted
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
