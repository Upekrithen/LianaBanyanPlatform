import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PenLine, ArrowRight } from "lucide-react";
import { useSubmitEntry } from "@/hooks/useContests";
import { useTurnKeyProjects } from "@/hooks/useTurnKeyProjects";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  contestId: string;
  contestSlug: string;
}

export function ContestEntryForm({ contestId, contestSlug }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const submit = useSubmitEntry();
  const { data: projects, isLoading } = useTurnKeyProjects();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [statement, setStatement] = useState("");

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            You need an account to enter this contest.
          </p>
          <Button onClick={() => navigate("/auth")}>
            Sign Up / Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  const myProjects = (projects ?? []).filter(
    (p: any) => p.creator_id === user.id && p.status !== "paused"
  );

  const handleSubmit = async () => {
    if (!selectedProject) {
      toast.error("Select a Turn-Key project to enter");
      return;
    }
    try {
      await submit.mutateAsync({
        contestId,
        projectId: selectedProject,
        entryStatement: statement || undefined,
      });
      toast.success("Entry submitted!");
      navigate(`/contests/${contestSlug}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit entry");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PenLine className="h-5 w-5" />
          Submit Your Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading your projects…</p>
        ) : myProjects.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You don't have a Turn-Key project yet. Create one first, then come back to enter.
            </p>
            <Button
              onClick={() =>
                navigate(`/projects/create?contest_id=${contestId}`)
              }
              className="gap-1.5"
            >
              Create a Project <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Select Your Project</Label>
              <div className="grid gap-2">
                {myProjects.map((p: any) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProject(p.id)}
                    className={`rounded-lg border-2 p-3 text-left text-sm transition-all min-h-[44px] w-full break-words touch-manipulation ${
                      selectedProject === p.id
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/40"
                    }`}
                  >
                    <span className="font-medium">{p.title}</span>
                    {p.description && (
                      <span className="block text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {p.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-statement">Why I Designed This (optional)</Label>
              <Textarea
                id="entry-statement"
                placeholder="Share the story behind your design…"
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!selectedProject || submit.isPending}
              className="w-full"
            >
              {submit.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Entry"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
