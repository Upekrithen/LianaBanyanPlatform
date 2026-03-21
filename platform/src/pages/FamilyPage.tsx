/**
 * FAMILY PAGE — Family Management Dashboard
 * ==========================================
 * Lists user's families and allows creating new ones.
 * Entry point to the Family Table system.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { 
  Users, Plus, ArrowLeft, Heart, Calendar, Gift, 
  Settings, ChevronRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateFamilyDialog } from "@/components/family/CreateFamilyDialog";
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface Family {
  id: string;
  name: string;
  display_name: string;
  created_at: string;
  member_count?: number;
  my_role?: string;
  my_nickname?: string;
  my_symbol?: string;
}

export default function FamilyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch user's families
  const { data: families, isLoading } = useQuery({
    queryKey: ['my-families'],
    queryFn: async () => {
      if (!user) return [];

      // Get families where user is a member
      const { data: memberships, error } = await supabase
        .from('family_members')
        .select(`
          family_id,
          role,
          nickname,
          symbol,
          families (
            id,
            name,
            display_name,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      // Get member counts for each family
      const familiesWithCounts: Family[] = await Promise.all(
        (memberships || []).map(async (m) => {
          const { count } = await supabase
            .from('family_members')
            .select('*', { count: 'exact', head: true })
            .eq('family_id', m.family_id)
            .eq('is_active', true);

          return {
            id: m.families?.id || m.family_id,
            name: m.families?.name || 'Unknown',
            display_name: m.families?.display_name || 'Family',
            created_at: m.families?.created_at || '',
            member_count: count || 1,
            my_role: m.role,
            my_nickname: m.nickname,
            my_symbol: m.symbol,
          };
        })
      );

      return familiesWithCounts;
    },
    enabled: !!user,
  });

  const handleFamilyCreated = (family: any) => {
    navigate(`/family/${family.id}`);
  };

  return (
    <PortalPageLayout>
      {/* Brand Title */}
      <div className="landing-title">
        <span className="liana">Liana</span>
        <span className="banyan">Banyan</span>
      </div>

      {/* Back button - goes to initiatives list on main page */}
      <button 
        onClick={() => navigate('/?view=initiatives')}
        className="ghost-toggle"
        style={{ left: 20 }}
      >
        <ArrowLeft className="inline h-4 w-4 mr-1" />
        Back to Initiatives
      </button>

      <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <header className="landing-header" style={{ marginTop: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            <Heart className="inline h-12 w-12" style={{ marginRight: '0.5rem' }} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            The Family Table
          </h1>
          <p style={{ opacity: 0.8, maxWidth: 500, margin: '0 auto' }}>
            Your families, crews, and chosen circles. Share calendars, coordinate gifts, 
            and stay connected with the people who matter most.
          </p>
        </header>

        {/* Not signed in */}
        {!user ? (
          <div className="trunk-info" style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem' }}>
            <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h2 style={{ marginBottom: '1rem' }}>Sign in to access Family Table</h2>
            <p style={{ opacity: 0.6, marginBottom: '1.5rem' }}>
              Create families, share calendars, and coordinate gift lists.
            </p>
            <Button onClick={() => openOnboard({ reason: "access Family Table", actionLabel: "Join", membershipIncluded: true })} className="bg-purple-600 hover:bg-purple-700">
              Sign In
            </Button>
          </div>
        ) : isLoading ? (
          <div className="trunk-info" style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem' }}>
            <div className="animate-pulse">Loading your families...</div>
          </div>
        ) : families && families.length > 0 ? (
          <>
            {/* Family List */}
            <div className="trunk-info" style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#c4b5fd' }}>Your Families</h2>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Family
                </Button>
              </div>

              <div className="space-y-3">
                {families.map((family) => (
                  <Card 
                    key={family.id}
                    className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/family/${family.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Symbol */}
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center text-2xl">
                          {family.my_symbol || '👨‍👩‍👧‍👦'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{family.name}</h3>
                            {family.my_role === 'founder' && (
                              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
                                Founder
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {family.member_count} {family.member_count === 1 ? 'member' : 'members'} · {family.display_name}
                          </p>
                        </div>

                        {/* Actions Preview */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <Gift className="h-4 w-4" />
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* No Families Yet */
          <div className="trunk-info" style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem' }}>
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-400 opacity-60" />
            <h2 style={{ marginBottom: '0.5rem' }}>No families yet</h2>
            <p style={{ opacity: 0.6, marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
              Create your first family to start sharing calendars, 
              coordinating gift lists, and staying connected.
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Family
            </Button>
          </div>
        )}

        {/* Features Overview */}
        <div className="trunk-info" style={{ marginTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#c4b5fd' }}>
            What You Can Do
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem'
          }}>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-400" />
              <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Chosen Family</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                Add members with unanimous approval from everyone
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Shared Calendar</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                Sync with Google Calendar, track birthdays & events
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <Gift className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
              <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Secret Gift Lists</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                Wishlists where claims are hidden from the recipient
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Family Dialog */}
      <CreateFamilyDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleFamilyCreated}
      />
    </PortalPageLayout>
  );
}
