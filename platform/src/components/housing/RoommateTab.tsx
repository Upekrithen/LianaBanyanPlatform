/**
 * Roommate Accountability Tab — Housing Mission TWO
 * Application form, active agreement dashboard, stamp filing/response
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Shield, FileCheck, AlertTriangle, Clock, Camera, Star,
  CheckCircle2, XCircle, Scale, Coins, CalendarDays, Gavel, Info
} from 'lucide-react';

type CommitmentTier = 'daily' | 'every_other_day' | '3x_week' | 'weekly';
type HygieneTier = 'after_each_use' | 'daily' | 'weekly';
type AreaTier = 'daily' | 'weekly';
type StampCategory = 'dishwashing' | 'garbage_removal' | 'kitchen_hygiene' | 'bathroom_hygiene' | 'common_area';

const TIER_LABELS: Record<string, string> = {
  daily: 'Daily',
  every_other_day: 'Every Other Day',
  '3x_week': '3×/Week',
  weekly: 'Weekly',
  after_each_use: 'After Each Use',
};

const TIER_SCORES: Record<string, number> = {
  daily: 5, after_each_use: 5, every_other_day: 4, '3x_week': 3, weekly: 2,
};

const CATEGORY_LABELS: Record<StampCategory, string> = {
  dishwashing: 'Dishwashing',
  garbage_removal: 'Garbage Removal',
  kitchen_hygiene: 'Kitchen Hygiene',
  bathroom_hygiene: 'Bathroom Hygiene',
  common_area: 'Common Areas',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'text-green-400 border-green-500/30',
  probation: 'text-yellow-400 border-yellow-500/30',
  completed: 'text-blue-400 border-blue-500/30',
  terminated: 'text-red-400 border-red-500/30',
  filed: 'text-yellow-400 border-yellow-500/30',
  contested: 'text-orange-400 border-orange-500/30',
  upheld: 'text-red-400 border-red-500/30',
  dismissed: 'text-green-400 border-green-500/30',
  resolved_by_steward: 'text-blue-400 border-blue-500/30',
  appealed: 'text-purple-400 border-purple-500/30',
};

function tierScore(commitments: Record<string, string>): number {
  const vals = Object.values(commitments).map(c => TIER_SCORES[c] || 2);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export default function RoommateTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [showApplication, setShowApplication] = useState(false);
  const [stampDialog, setStampDialog] = useState(false);
  const [respondDialog, setRespondDialog] = useState<string | null>(null);

  // Application form state
  const [selectedProperty, setSelectedProperty] = useState('');
  const [dishwashing, setDishwashing] = useState<CommitmentTier>('daily');
  const [garbage, setGarbage] = useState<CommitmentTier>('daily');
  const [kitchen, setKitchen] = useState<HygieneTier>('after_each_use');
  const [bathroom, setBathroom] = useState<HygieneTier>('after_each_use');
  const [commonArea, setCommonArea] = useState<AreaTier>('daily');

  // Application legal fields
  const [accommodationRequested, setAccommodationRequested] = useState(false);
  const [accommodationNotes, setAccommodationNotes] = useState('');
  const [consentToPhotograph, setConsentToPhotograph] = useState(false);

  // Stamp form state
  const [stampCategory, setStampCategory] = useState<StampCategory>('dishwashing');
  const [stampDescription, setStampDescription] = useState('');
  const [stampDate, setStampDate] = useState(new Date().toISOString().split('T')[0]);

  // Contest / appeal form state
  const [contestEvidence, setContestEvidence] = useState('');
  const [appealDialog, setAppealDialog] = useState<string | null>(null);
  const [appealReason, setAppealReason] = useState('');

  // Queries
  const { data: properties = [] } = useQuery({
    queryKey: ['housing-properties-available'],
    queryFn: async () => {
      const { data } = await supabase
        .from('housing_properties')
        .select('id, title, city, state')
        .in('status', ['owned', 'leased']);
      return data || [];
    },
  });

  const { data: myAgreement } = useQuery({
    queryKey: ['my-roommate-agreement', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('roommate_agreements')
        .select('*')
        .eq('member_id', user!.id)
        .in('status', ['active', 'probation'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: myApplication } = useQuery({
    queryKey: ['my-roommate-application', user?.id],
    enabled: !!user && !myAgreement,
    queryFn: async () => {
      const { data } = await supabase
        .from('roommate_applications')
        .select('*')
        .eq('applicant_id', user!.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: stamps = [] } = useQuery({
    queryKey: ['my-roommate-stamps', myAgreement?.id],
    enabled: !!myAgreement,
    queryFn: async () => {
      const { data } = await supabase
        .from('roommate_stamps')
        .select('*')
        .eq('agreement_id', myAgreement!.id)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const { data: appeals = [] } = useQuery({
    queryKey: ['roommate-stamp-appeals', myAgreement?.id],
    enabled: !!myAgreement,
    queryFn: async () => {
      const stampIds = stamps.map((s: any) => s.id);
      if (stampIds.length === 0) return [];
      const { data } = await supabase
        .from('roommate_stamp_appeals')
        .select('*')
        .in('stamp_id', stampIds)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const scorePreview = tierScore({
    dishwashing, garbage, kitchen, bathroom, commonArea,
  });

  // Mutations
  const submitApplication = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('roommate_applications').insert({
        applicant_id: user!.id,
        property_id: selectedProperty,
        dishwashing_commitment: dishwashing,
        garbage_removal_commitment: garbage,
        kitchen_hygiene_commitment: kitchen,
        bathroom_hygiene_commitment: bathroom,
        common_area_commitment: commonArea,
        weekly_marks_pledge: 10,
        roommate_score: scorePreview,
        accommodation_requested: accommodationRequested,
        accommodation_notes: accommodationRequested ? accommodationNotes : null,
        consent_to_photograph: consentToPhotograph,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Application Submitted', description: 'Your roommate application is pending review.' });
      setShowApplication(false);
      qc.invalidateQueries({ queryKey: ['my-roommate-application'] });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const fileStamp = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('roommate_stamps').insert({
        agreement_id: myAgreement!.id,
        stamper_id: user!.id,
        respondent_id: myAgreement!.member_id,
        category: stampCategory,
        description: stampDescription,
        incident_date: stampDate,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Stamp Filed', description: 'Your roommate has 72 hours to respond.' });
      setStampDialog(false);
      setStampDescription('');
      qc.invalidateQueries({ queryKey: ['my-roommate-stamps'] });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const contestStamp = useMutation({
    mutationFn: async (stampId: string) => {
      const { error } = await supabase.from('roommate_stamps').update({
        status: 'contested',
        contested_at: new Date().toISOString(),
        contest_evidence: contestEvidence,
      }).eq('id', stampId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Stamp Contested', description: 'A property steward will review this.' });
      setRespondDialog(null);
      setContestEvidence('');
      qc.invalidateQueries({ queryKey: ['my-roommate-stamps'] });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const acceptStamp = useMutation({
    mutationFn: async (stampId: string) => {
      const { error } = await supabase.from('roommate_stamps').update({
        status: 'upheld',
        resolved_at: new Date().toISOString(),
        resolution_notes: 'Accepted by respondent',
      }).eq('id', stampId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Stamp Accepted', description: 'Marks forfeit will proceed at next weekly processing.' });
      setRespondDialog(null);
      qc.invalidateQueries({ queryKey: ['my-roommate-stamps'] });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const fileAppeal = useMutation({
    mutationFn: async (stampId: string) => {
      const existingAppeals = appeals.filter((a: any) => a.stamp_id === stampId);
      const nextLevel = existingAppeals.length > 0
        ? Math.max(...existingAppeals.map((a: any) => a.appeal_level)) + 1
        : 1;
      if (nextLevel > 3) throw new Error('All appeal levels exhausted');
      const { error } = await supabase.from('roommate_stamp_appeals').insert({
        stamp_id: stampId,
        appeal_level: nextLevel,
        appellant_id: user!.id,
        appeal_reason: appealReason,
      });
      if (error) throw error;
      await supabase.from('roommate_stamps').update({ status: 'appealed' }).eq('id', stampId);
    },
    onSuccess: () => {
      toast({ title: 'Appeal Filed', description: 'Your appeal has been submitted for review.' });
      setAppealDialog(null);
      setAppealReason('');
      qc.invalidateQueries({ queryKey: ['my-roommate-stamps'] });
      qc.invalidateQueries({ queryKey: ['roommate-stamp-appeals'] });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Sign in to apply as a roommate.</p>
        </CardContent>
      </Card>
    );
  }

  // Active agreement dashboard
  if (myAgreement) {
    const cleanPct = myAgreement.total_weeks > 0
      ? Math.round((myAgreement.clean_weeks / myAgreement.total_weeks) * 100)
      : 100;
    const stampsFiled = stamps.filter((s: any) => s.stamper_id === user.id);
    const stampsAgainst = stamps.filter((s: any) => s.respondent_id === user.id);
    const pendingResponse = stampsAgainst.filter((s: any) =>
      s.status === 'filed' && new Date(s.grace_period_ends) > new Date()
    );

    return (
      <div className="space-y-6">
        {/* Score + Status */}
        <Card className="border-emerald-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Roommate Agreement
              <Badge variant="outline" className={`ml-auto text-xs ${STATUS_COLORS[myAgreement.status]}`}>
                {myAgreement.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-2xl font-bold">{myAgreement.roommate_score?.toFixed(1) ?? '—'}</p>
                <p className="text-[10px] text-muted-foreground">Roommate Score</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-2xl font-bold">{myAgreement.clean_weeks}/{myAgreement.total_weeks}</p>
                <p className="text-[10px] text-muted-foreground">Clean Weeks</p>
                <Progress value={cleanPct} className="mt-1.5 h-1.5" />
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-2xl font-bold">{myAgreement.current_escrow}</p>
                <p className="text-[10px] text-muted-foreground">Marks in Escrow</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <Scale className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-2xl font-bold">{myAgreement.total_forfeited}</p>
                <p className="text-[10px] text-muted-foreground">Total Forfeited</p>
              </div>
            </div>

            {/* Commitments */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { label: 'Dishes', val: myAgreement.dishwashing_commitment },
                { label: 'Garbage', val: myAgreement.garbage_removal_commitment },
                { label: 'Kitchen', val: myAgreement.kitchen_hygiene_commitment },
                { label: 'Bathroom', val: myAgreement.bathroom_hygiene_commitment },
                { label: 'Common', val: myAgreement.common_area_commitment },
              ].map(c => (
                <div key={c.label} className="text-center p-2 rounded bg-muted/20 text-xs">
                  <span className="text-muted-foreground">{c.label}</span>
                  <p className="font-medium mt-0.5">{TIER_LABELS[c.val] || c.val}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending responses */}
        {pendingResponse.length > 0 && (
          <Card className="border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-orange-400">
                <AlertTriangle className="w-4 h-4" />
                Stamps Requiring Your Response ({pendingResponse.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingResponse.map((s: any) => {
                const hoursLeft = Math.max(0, Math.round(
                  (new Date(s.grace_period_ends).getTime() - Date.now()) / 3600000
                ));
                return (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{CATEGORY_LABELS[s.category as StampCategory]}</p>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-orange-400" />
                        <span className="text-xs text-orange-400">{hoursLeft}h remaining</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setRespondDialog(s.id)}>
                        Contest
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => acceptStamp.mutate(s.id)}>
                        Accept
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Recent stamps */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="w-4 h-4" /> Recent Stamps
            </CardTitle>
            <Button size="sm" onClick={() => setStampDialog(true)}>
              <Camera className="w-4 h-4 mr-1" /> File a Stamp
            </Button>
          </CardHeader>
          <CardContent>
            {stamps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No stamps filed yet. A clean record!</p>
            ) : (
              <div className="space-y-2">
                {stamps.map((s: any) => {
                  const stampAppeals = appeals.filter((a: any) => a.stamp_id === s.id);
                  const maxAppealLevel = stampAppeals.length > 0 ? Math.max(...stampAppeals.map((a: any) => a.appeal_level)) : 0;
                  const canAppeal = (s.status === 'upheld' || s.status === 'appealed') && s.respondent_id === user.id && maxAppealLevel < 3;
                  const APPEAL_LABELS = ['', 'Steward Review', 'Ombudsperson', 'AAA Arbitration'];
                  return (
                    <div key={s.id} className="p-2.5 rounded-lg bg-muted/30 text-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{CATEGORY_LABELS[s.category as StampCategory]}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {s.stamper_id === user.id ? 'Filed by you' : 'Against you'}
                          </span>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.incident_date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {canAppeal && (
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setAppealDialog(s.id)}>
                              <Gavel className="w-3 h-3 mr-1" /> Appeal
                            </Button>
                          )}
                          <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[s.status] || ''}`}>
                            {s.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      {stampAppeals.length > 0 && (
                        <div className="pl-3 border-l-2 border-muted space-y-1">
                          {stampAppeals.map((a: any) => (
                            <div key={a.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Gavel className="w-3 h-3" />
                              <span>Level {a.appeal_level}: {APPEAL_LABELS[a.appeal_level]}</span>
                              {a.resolved_at ? (
                                <Badge variant="outline" className="text-[9px] ml-auto">{a.resolution || 'Resolved'}</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[9px] ml-auto text-yellow-400 border-yellow-500/30">Pending</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Stamp Dialog */}
        <Dialog open={stampDialog} onOpenChange={setStampDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>File a Stamp</DialogTitle>
              <DialogDescription>
                Report a commitment violation. Photo evidence strengthens your case.
                Forfeited Marks go to the housing cooperative fund, never to the complainer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Category</Label>
                <Select value={stampCategory} onValueChange={v => setStampCategory(v as StampCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Incident Date</Label>
                <Input type="date" value={stampDate} onChange={e => setStampDate(e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={stampDescription}
                  onChange={e => setStampDescription(e.target.value)}
                  placeholder="Describe the violation..."
                  rows={3}
                />
              </div>
              <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center space-y-1">
                <Camera className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Drag & drop photo here</p>
                <p className="text-[10px] text-muted-foreground/70">EXIF/GPS metadata stripped at upload (CCPA). Faces auto-blurred before storage (BIPA, 740 ILCS 14). Photos visible only to accountability relationship parties and stewards.</p>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Your roommate has <strong>72 hours</strong> to respond. If uncontested, the stamp is upheld and Marks are forfeited to the cooperative fund (max 30 Marks/month).</span>
              </div>
              <Button
                className="w-full"
                onClick={() => fileStamp.mutate()}
                disabled={!stampDescription || fileStamp.isPending}
              >
                {fileStamp.isPending ? 'Filing...' : 'File Stamp'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contest Stamp Dialog */}
        <Dialog open={!!respondDialog} onOpenChange={() => setRespondDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contest This Stamp</DialogTitle>
              <DialogDescription>
                Provide evidence that you fulfilled your commitment. A property steward will review.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Your Evidence / Explanation</Label>
                <Textarea
                  value={contestEvidence}
                  onChange={e => setContestEvidence(e.target.value)}
                  placeholder="Explain why this stamp is incorrect..."
                  rows={4}
                />
              </div>
              <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center space-y-1">
                <Camera className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Drag & drop counter-photo here</p>
                <p className="text-[10px] text-muted-foreground/70">EXIF/GPS metadata stripped at upload (CCPA). Faces auto-blurred before storage (BIPA, 740 ILCS 14). Photos visible only to accountability relationship parties and stewards.</p>
              </div>
              <Button
                className="w-full"
                onClick={() => respondDialog && contestStamp.mutate(respondDialog)}
                disabled={!contestEvidence || contestStamp.isPending}
              >
                {contestStamp.isPending ? 'Submitting...' : 'Submit Contest'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Appeal Dialog — 3-Level Process */}
        <Dialog open={!!appealDialog} onOpenChange={() => setAppealDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5" /> Appeal This Stamp
              </DialogTitle>
              <DialogDescription>
                Appeals follow a 3-level process: (1) Steward Review, (2) Ombudsperson, (3) AAA Arbitration.
                Each level must be exhausted before escalating.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {(() => {
                const currentAppeals = appeals.filter((a: any) => a.stamp_id === appealDialog);
                const nextLevel = currentAppeals.length > 0
                  ? Math.max(...currentAppeals.map((a: any) => a.appeal_level)) + 1
                  : 1;
                const levelNames = ['', 'Steward Review', 'Ombudsperson Review', 'AAA Arbitration'];
                return (
                  <>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-sm font-medium">Level {nextLevel}: {levelNames[nextLevel]}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {nextLevel === 1 && 'A property steward will review your case within 5 business days.'}
                        {nextLevel === 2 && 'An independent ombudsperson will review all evidence and prior decisions.'}
                        {nextLevel === 3 && 'Final binding arbitration through the American Arbitration Association.'}
                      </p>
                    </div>
                    <div>
                      <Label>Reason for Appeal</Label>
                      <Textarea
                        value={appealReason}
                        onChange={e => setAppealReason(e.target.value)}
                        placeholder="Explain why the previous decision should be reconsidered..."
                        rows={4}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => appealDialog && fileAppeal.mutate(appealDialog)}
                      disabled={!appealReason || fileAppeal.isPending}
                    >
                      {fileAppeal.isPending ? 'Submitting...' : `File Level ${nextLevel} Appeal`}
                    </Button>
                  </>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Pending application
  if (myApplication) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Application Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { label: 'Dishes', val: myApplication.dishwashing_commitment },
                { label: 'Garbage', val: myApplication.garbage_removal_commitment },
                { label: 'Kitchen', val: myApplication.kitchen_hygiene_commitment },
                { label: 'Bathroom', val: myApplication.bathroom_hygiene_commitment },
                { label: 'Common', val: myApplication.common_area_commitment },
              ].map(c => (
                <div key={c.label} className="text-center p-2 rounded bg-muted/20 text-xs">
                  <span className="text-muted-foreground">{c.label}</span>
                  <p className="font-medium mt-0.5">{TIER_LABELS[c.val] || c.val}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="w-4 h-4" />
              <span>Pledging {myApplication.weekly_marks_pledge} Marks/week</span>
              <span className="mx-1">•</span>
              <span>Score preview: {myApplication.roommate_score?.toFixed(1)}/5.0</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Submitted {new Date(myApplication.created_at).toLocaleDateString()}. A property steward will review your application.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Application form
  return (
    <div className="space-y-6">
      {/* Explainer */}
      <Card className="border-emerald-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-emerald-400 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Roommate Accountability System</h3>
              <p className="text-sm text-muted-foreground">
                Whatever you commit to, you do — or the Marks backing your application are forfeit.
                Choose your commitment tiers, pledge 10 Marks/week as an accountability deposit,
                and build your roommate reputation. Forfeited Marks go to the housing cooperative fund,
                never to the complaining roommate.
              </p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-400" /> Voluntary participation</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-yellow-400" /> 72hr grace period on complaints</span>
                <span className="flex items-center gap-1"><Scale className="w-3 h-3 text-blue-400" /> 30 Marks/mo forfeit cap</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> Feeds into reputation score</span>
                <span className="flex items-center gap-1"><Gavel className="w-3 h-3 text-purple-400" /> 3-level appeal process</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!showApplication ? (
        <div className="text-center py-8">
          <Button size="lg" onClick={() => setShowApplication(true)}>
            <FileCheck className="w-5 h-5 mr-2" /> Apply as Roommate
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" /> Roommate Application
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Property */}
            <div>
              <Label>Property</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger><SelectValue placeholder="Select a property..." /></SelectTrigger>
                <SelectContent>
                  {properties.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} — {p.city}{p.state ? `, ${p.state}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Commitment selectors */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Your Commitments</Label>
              <div className="grid md:grid-cols-2 gap-3">
                <CommitmentSelect
                  label="Dishwashing" value={dishwashing}
                  options={['daily', 'every_other_day', '3x_week', 'weekly']}
                  onChange={v => setDishwashing(v as CommitmentTier)}
                />
                <CommitmentSelect
                  label="Garbage Removal" value={garbage}
                  options={['daily', 'every_other_day', '3x_week', 'weekly']}
                  onChange={v => setGarbage(v as CommitmentTier)}
                />
                <CommitmentSelect
                  label="Kitchen Hygiene" value={kitchen}
                  options={['after_each_use', 'daily', 'weekly']}
                  onChange={v => setKitchen(v as HygieneTier)}
                />
                <CommitmentSelect
                  label="Bathroom Hygiene" value={bathroom}
                  options={['after_each_use', 'daily', 'weekly']}
                  onChange={v => setBathroom(v as HygieneTier)}
                />
                <CommitmentSelect
                  label="Common Areas" value={commonArea}
                  options={['daily', 'weekly']}
                  onChange={v => setCommonArea(v as AreaTier)}
                />
              </div>
            </div>

            {/* Pledge + score preview */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-bold">10 Marks/week</p>
                <p className="text-[10px] text-muted-foreground">Accountability deposit — refunded on clean weeks</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-lg font-bold">{scorePreview.toFixed(1)} / 5.0</p>
                <p className="text-[10px] text-muted-foreground">Estimated commitment score (20% of total)</p>
              </div>
            </div>

            {/* Reasonable Accommodation (FHA §3604(f)) — Full Bishop B042 Legal Copy */}
            <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 space-y-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Commitment Tiers & Reasonable Accommodations</p>
                  <p className="text-xs text-muted-foreground">
                    Commitment tiers within the Liana Banyan platform are <strong>aspirational benchmarks</strong> designed to recognize and reward participation. They are <strong>not</strong> eligibility requirements, pass/fail gates, or prerequisites for accessing housing or essential services.
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    No commitment tier score will be used as a pass/fail gate for housing eligibility.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    In accordance with the <strong>Fair Housing Act, 42 U.S.C. §3604(f)</strong>, Liana Banyan Corporation provides reasonable accommodations for individuals with disabilities, medical conditions, or other qualifying circumstances. A reasonable accommodation is a change, exception, or adjustment to a rule, policy, practice, or service that may be necessary to afford a person with a disability equal opportunity to use and enjoy housing-related services.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={accommodationRequested}
                  onCheckedChange={setAccommodationRequested}
                  id="accommodation-toggle"
                />
                <Label htmlFor="accommodation-toggle" className="text-sm cursor-pointer">
                  I would like to request a reasonable accommodation
                </Label>
              </div>
              {accommodationRequested && (
                <div className="space-y-2">
                  <Label className="text-xs">Accommodation Details (confidential)</Label>
                  <Textarea
                    value={accommodationNotes}
                    onChange={e => setAccommodationNotes(e.target.value)}
                    placeholder="Describe the accommodation you need (you are not required to disclose your specific diagnosis)..."
                    rows={3}
                    className="mt-1"
                  />
                  <div className="text-[10px] text-muted-foreground space-y-1 p-2 rounded bg-blue-500/5">
                    <p>• Your request is reviewed by a trained steward within <strong>48 hours</strong>, not by an automated system.</p>
                    <p>• Accommodations may include modified timelines, adjusted benchmarks, or exemptions from specific tier requirements.</p>
                    <p>• You will not face any penalty, score reduction, or negative consequence for requesting an accommodation.</p>
                    <p>• Your request is confidential — visible only to your assigned steward and administrators with a need to know.</p>
                    <p>• Liana Banyan Corporation prohibits retaliation against any member who requests a reasonable accommodation.</p>
                  </div>
                  <p className="text-[9px] text-muted-foreground/60">
                    If you believe you have been denied a reasonable accommodation, you may file a complaint with HUD at hud.gov or call 1-800-669-9777.
                  </p>
                </div>
              )}
            </div>

            {/* Photo Consent — Full Bishop B042 BIPA/CCPA Compliant Copy */}
            <div className="p-4 rounded-lg border border-muted space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Camera className="w-4 h-4 text-muted-foreground" /> Consent to Photograph Shared Living Spaces
              </p>
              <div className="text-[10px] text-muted-foreground space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <p>You consent to the photographing of <strong>shared living spaces</strong> (common areas such as kitchens, living rooms, shared bathrooms, hallways, and other communal areas) for accountability documentation within the Liana Banyan Housing program.</p>
                <p className="font-medium text-foreground/80">Privacy Protections:</p>
                <p>• <strong>EXIF and GPS metadata are stripped at upload.</strong> No geolocation, device, or timestamp metadata is stored. (CCPA: precise geolocation is sensitive personal information.)</p>
                <p>• <strong>Faces are blurred in uploaded images.</strong> Automated facial blurring is applied before storage or display. (BIPA, 740 ILCS 14: no biometric identifiers collected.)</p>
                <p className="font-medium text-foreground/80">Visibility:</p>
                <p>Uploaded photographs are visible <strong>only</strong> to parties in the accountability relationship and assigned stewards. No photos are visible to other members, the public, or third parties.</p>
                <p className="font-medium text-foreground/80">Exclusion:</p>
                <p>This does <strong>not</strong> authorize photographing private spaces (bedrooms, private bathrooms, closets) unless express additional consent is obtained in writing.</p>
                <p className="font-medium text-foreground/80">Revocation:</p>
                <p>You may revoke this consent at any time via written notice. Revocation is effective 24 hours after receipt.</p>
              </div>
              <div className="flex items-start gap-3 pt-2 border-t">
                <Checkbox
                  id="photo-consent"
                  checked={consentToPhotograph}
                  onCheckedChange={v => setConsentToPhotograph(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="photo-consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I consent to the photographing of shared living spaces under the terms described above.
                </Label>
              </div>
            </div>

            {/* Terms */}
            <div className="p-4 rounded-lg border border-muted text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground text-sm mb-2">Agreement Terms</p>
              <p>• Complaints include a <strong>72-hour grace period</strong> before any forfeit</p>
              <p>• Forfeited Marks go to the <strong>housing cooperative fund</strong>, never to the complainer</p>
              <p>• Monthly forfeit cap: <strong>30 Marks</strong> (steward review triggered at cap)</p>
              <p>• You may contest any stamp — a property steward makes the first call</p>
              <p>• <strong>3-level appeal process:</strong> Steward Review → Ombudsperson → AAA Arbitration</p>
              <p>• Your roommate score feeds into the platform reputation system</p>
              <p>• Ratings are subject to quarterly statistical audit. Minimum weight floor: 0.5×.</p>
            </div>

            <Button
              className="w-full"
              disabled={!selectedProperty || submitApplication.isPending}
              onClick={() => submitApplication.mutate()}
            >
              {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CommitmentSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
      <span className="text-sm font-medium">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o} value={o}>
              {TIER_LABELS[o]} ({TIER_SCORES[o]}/5)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
