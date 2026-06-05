/**
 * SpotlightConsentPage -- "Eyewitness: Your Story"
 * Scope 30: Members consent to be featured and earn Marks.
 * Consent receipt is stamped to the Socceri IP Ledger.
 * Securities-clean: Marks represent participation, not equity or returns.
 */

import React, { useState } from 'react';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, BookOpen, Coins, Shield, FileText } from 'lucide-react';

const MARKS_GRANTED = 50;

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function SpotlightConsentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agreed, setAgreed] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [stamp, setStamp] = useState('');

  const handleSubmit = async () => {
    if (!user || !agreed) return;
    setSubmitting(true);

    const consentedAt = new Date().toISOString();
    const ipLedgerStamp = await sha256Hex(`${user.id}${consentedAt}`);

    const { error } = await supabase
      .from('spotlight_consents' as never)
      .insert({
        member_id: user.id,
        consented_at: consentedAt,
        marks_granted: MARKS_GRANTED,
        ip_ledger_stamp: ipLedgerStamp,
        story_title: storyTitle.trim() || null,
      } as never);

    if (error) {
      toast({ title: 'Submission failed', description: error.message, variant: 'destructive' });
    } else {
      setStamp(ipLedgerStamp);
      setSubmitted(true);
      toast({ title: `${MARKS_GRANTED} Marks earned`, description: 'Your consent is recorded. Thank you for sharing your story.' });
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <PortalPageLayout>
        <Card className="max-w-xl mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">Thank you for sharing your story.</h2>
            <p className="text-muted-foreground text-sm">
              Your consent has been recorded and stamped to the Socceri IP Ledger.
            </p>
            <div className="bg-muted rounded-lg p-4 text-left space-y-2">
              <p className="text-xs font-medium text-muted-foreground">IP Ledger Stamp (SHA-256)</p>
              <p className="text-xs font-mono break-all text-foreground">{stamp}</p>
            </div>
            <Badge className="bg-violet-100 text-violet-800 gap-1 text-sm px-3 py-1">
              <Coins className="h-3.5 w-3.5" />
              {MARKS_GRANTED} Marks Added to Your Account
            </Badge>
            <p className="text-xs text-muted-foreground">
              Marks represent your participation in the cooperative story -- not equity, shares, or investment returns.
            </p>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Hero */}
        <div className="text-center space-y-2">
          <BookOpen className="h-10 w-10 mx-auto text-amber-500" />
          <h1 className="text-2xl font-bold">Eyewitness: Your Story</h1>
          <p className="text-muted-foreground">
            The Liana Banyan Spotlight Program -- share your cooperative journey and earn Marks for your contribution.
          </p>
        </div>

        {/* What this is */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              What the Spotlight Program Is
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Members who agree to be featured in a cooperative case study or story earn <strong>{MARKS_GRANTED} Marks</strong> for their consent and contribution. Your experience helps other members understand what the cooperative looks like in practice.
            </p>
            <ul className="space-y-2 list-none">
              {[
                'We may publish your story on Cephas, in newsletters, or in educational materials.',
                'You control your name and details -- anonymous participation is available.',
                'You can revoke consent at any time by contacting the cooperative admin.',
                'Your story does not imply any financial endorsement or guarantee.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Securities disclaimer */}
        <div className="rounded-md bg-indigo-50 border border-indigo-200 p-4 flex items-start gap-3 text-sm text-indigo-800">
          <Shield className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            <strong>Marks are not equity, shares, or investment returns.</strong> They represent your participation in the cooperative's story and activities. Earning Marks does not give you any ownership interest, dividend rights, or financial claim against the cooperative.
          </p>
        </div>

        {/* Consent form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="h-4 w-4 text-amber-500" />
              Consent + Earn {MARKS_GRANTED} Marks
            </CardTitle>
            <CardDescription>
              Completing this form records your consent in the Socceri IP Ledger and immediately awards your Marks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                You must be signed in to participate in the Spotlight Program.
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">Your Story Title (optional)</label>
              <Input
                value={storyTitle}
                onChange={e => setStoryTitle(e.target.value)}
                placeholder='e.g. "How the cooperative helped me launch my food truck"'
                disabled={!user}
              />
              <p className="text-xs text-muted-foreground">A short title helps us organize your story. Leave blank for "Untitled".</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 rounded"
                disabled={!user}
              />
              <span className="text-sm">
                I agree to allow Liana Banyan Cooperative to feature my story in cooperative materials. I understand this consent is voluntary, I can revoke it at any time, and the {MARKS_GRANTED} Marks I receive represent participation in the cooperative -- not equity, shares, or investment returns.
              </span>
            </label>

            <Button
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={!user || !agreed || submitting}
            >
              <CheckCircle className="h-4 w-4" />
              {submitting ? 'Recording consent...' : `I Agree -- Earn ${MARKS_GRANTED} Marks`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
