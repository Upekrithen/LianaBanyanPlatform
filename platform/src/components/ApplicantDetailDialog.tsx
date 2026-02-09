import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Star, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ApplicantDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: any;
  onStatusUpdate: (applicationId: string, status: string) => void;
}

export const ApplicantDetailDialog = ({
  open,
  onOpenChange,
  application,
  onStatusUpdate
}: ApplicantDetailDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(3);
  const [recommendation, setRecommendation] = useState("pending");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [notes, setNotes] = useState("");
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    if (open && application) {
      loadExistingReview();
    }
  }, [open, application]);

  const loadExistingReview = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('application_reviews')
        .select('*')
        .eq('application_id', application.id)
        .eq('reviewer_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setExistingReview(data);
        setRating(data.rating || 3);
        setRecommendation(data.recommendation || "pending");
        setStrengths(data.strengths || "");
        setWeaknesses(data.weaknesses || "");
        setNotes(data.notes || "");
      }
    } catch (error) {
      console.error('Error loading review:', error);
    }
  };

  const handleSubmitReview = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const reviewData = {
        application_id: application.id,
        reviewer_id: user.user.id,
        reviewer_email: user.user.email!,
        rating,
        strengths,
        weaknesses,
        recommendation,
        notes
      };

      if (existingReview) {
        const { error } = await supabase
          .from('application_reviews')
          .update(reviewData)
          .eq('id', existingReview.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('application_reviews')
          .insert(reviewData);

        if (error) throw error;
      }

      // Update application status to reviewed
      onStatusUpdate(application.id, 'reviewed');

      toast({
        title: "Success",
        description: "Review submitted successfully"
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Applicant Review: {application.applicant_name}</DialogTitle>
          <DialogDescription>
            Review application materials and provide feedback
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="application" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="application">Application</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="review">Your Review</TabsTrigger>
          </TabsList>

          <TabsContent value="application" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Applicant Name</Label>
                  <p className="text-lg font-medium">{application.applicant_name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-muted-foreground">{application.applicant_email}</p>
                </div>
                <div>
                  <Label>Position Applied For</Label>
                  <p className="font-medium">
                    {application.contract_position_templates.position_title}
                  </p>
                </div>
                <div>
                  <Label>Applied Date</Label>
                  <p className="text-muted-foreground">
                    {new Date(application.applied_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge>{application.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {application.cover_letter && (
              <Card>
                <CardHeader>
                  <CardTitle>Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <p className="whitespace-pre-wrap">{application.cover_letter}</p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {application.application_data && Object.keys(application.application_data).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                    {JSON.stringify(application.application_data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Materials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.resume_url ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Resume/CV</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted with application
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No resume uploaded
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Review</CardTitle>
                <CardDescription>
                  Provide your assessment and recommendation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Rating (1-5)</Label>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        variant={rating >= value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRating(value)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Recommendation</Label>
                  <Select value={recommendation} onValueChange={setRecommendation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="hire_primary">Hire as Primary</SelectItem>
                      <SelectItem value="hire_secondary">Hire as Secondary</SelectItem>
                      <SelectItem value="hire_backup">Hire as Backup</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Strengths</Label>
                  <Textarea
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="What are the applicant's key strengths?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Areas for Improvement</Label>
                  <Textarea
                    value={weaknesses}
                    onChange={(e) => setWeaknesses(e.target.value)}
                    placeholder="What areas could use development?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional observations..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleSubmitReview} disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {existingReview ? 'Update Review' : 'Submit Review'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};