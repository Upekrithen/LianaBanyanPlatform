import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Palette, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ThemeSuggestion {
  id: string;
  theme_name: string;
  theme_description: string;
  color_scheme: any; // JSONB from database
  status: string;
  created_at: string;
  suggested_by: string;
  project_id: string;
  projects: {
    name: string;
  };
  profiles: {
    email: string;
  };
}

export function ThemeReviewDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTheme, setSelectedTheme] = useState<ThemeSuggestion | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['theme-suggestions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('theme_suggestions')
        .select(`
          *,
          projects (name)
        `)
        .eq('assigned_to', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch suggester emails separately
      const suggestionsWithEmails = await Promise.all(
        (data || []).map(async (suggestion) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', suggestion.suggested_by)
            .single();
          
          return {
            ...suggestion,
            profiles: { email: profile?.email || 'Unknown' }
          };
        })
      );
      
      return suggestionsWithEmails as ThemeSuggestion[];
    },
    enabled: !!user,
  });

  const approveMutation = useMutation({
    mutationFn: async (themeId: string) => {
      const { error } = await supabase
        .from('theme_suggestions')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', themeId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Theme approved successfully');
      queryClient.invalidateQueries({ queryKey: ['theme-suggestions'] });
    },
    onError: () => {
      toast.error('Failed to approve theme');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ themeId, reason }: { themeId: string; reason: string }) => {
      const { error } = await supabase
        .from('theme_suggestions')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', themeId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Theme rejected');
      queryClient.invalidateQueries({ queryKey: ['theme-suggestions'] });
      setShowRejectDialog(false);
      setRejectionReason('');
    },
    onError: () => {
      toast.error('Failed to reject theme');
    },
  });

  const handleApprove = (theme: ThemeSuggestion) => {
    approveMutation.mutate(theme.id);
  };

  const handleRejectClick = (theme: ThemeSuggestion) => {
    setSelectedTheme(theme);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = () => {
    if (selectedTheme && rejectionReason.trim()) {
      rejectMutation.mutate({ 
        themeId: selectedTheme.id, 
        reason: rejectionReason 
      });
    } else {
      toast.error('Please provide a rejection reason');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Review Dashboard
          </CardTitle>
          <CardDescription>
            Review and approve theme suggestions for your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingSuggestions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending theme suggestions to review
            </p>
          ) : (
            <div className="space-y-4">
              {pendingSuggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{suggestion.theme_name}</CardTitle>
                        <CardDescription>
                          Suggested for {suggestion.projects.name} by {suggestion.profiles.email}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {suggestion.theme_description && (
                      <p className="text-sm text-muted-foreground">
                        {suggestion.theme_description}
                      </p>
                    )}

                    {/* Color Preview */}
                    <div 
                      className="p-4 rounded-lg border-2 space-y-2"
                      style={{ 
                        backgroundColor: suggestion.color_scheme.background,
                        borderColor: suggestion.color_scheme.primary 
                      }}
                    >
                      <div 
                        className="px-3 py-2 rounded font-semibold text-center"
                        style={{ 
                          backgroundColor: suggestion.color_scheme.primary,
                          color: '#ffffff'
                        }}
                      >
                        Primary
                      </div>
                      <div 
                        className="px-3 py-2 rounded font-semibold text-center"
                        style={{ 
                          backgroundColor: suggestion.color_scheme.secondary,
                          color: '#ffffff'
                        }}
                      >
                        Secondary
                      </div>
                      <div 
                        className="px-3 py-2 rounded font-semibold text-center"
                        style={{ 
                          backgroundColor: suggestion.color_scheme.accent,
                          color: '#ffffff'
                        }}
                      >
                        Accent
                      </div>
                    </div>

                    {/* Color Codes */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-semibold">Primary:</span> {suggestion.color_scheme.primary}
                      </div>
                      <div>
                        <span className="font-semibold">Secondary:</span> {suggestion.color_scheme.secondary}
                      </div>
                      <div>
                        <span className="font-semibold">Background:</span> {suggestion.color_scheme.background}
                      </div>
                      <div>
                        <span className="font-semibold">Accent:</span> {suggestion.color_scheme.accent}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleApprove(suggestion)}
                        disabled={approveMutation.isPending}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectClick(suggestion)}
                        disabled={rejectMutation.isPending}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Theme Suggestion</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this theme. This feedback will be shared with the suggester.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Reason for Rejection</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this theme doesn't fit..."
              rows={4}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectConfirm}>
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}