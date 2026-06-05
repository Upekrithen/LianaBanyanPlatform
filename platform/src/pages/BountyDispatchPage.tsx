/**
 * BountyDispatchPage
 * Scope 29: Admin/bounty UI showing DeckCueCard + "Dispatch to Discord" button.
 *
 * Gate: Stripe/Marks must be operational for real Marks payouts.
 * Until then, dispatches are informational; Marks awarded manually.
 */

import React, { useState } from 'react';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DeckCueCard } from '@/components/DeckCueCard';
import { sendBatteryDispatch, broadcastBatteryDispatch } from '@/lib/batteryDispatch';
import { useToast } from '@/hooks/use-toast';
import { Zap, Send, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

const PLATFORM_BASE = window.location.origin;

export default function BountyDispatchPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '',
    description: '',
    marks: 50,
    category: 'Task',
    postedBy: '',
    expiresAt: '',
    webhookUrl: '',
    broadcastAll: false,
  });
  const [dispatching, setDispatching] = useState(false);
  const [bountyId] = useState(() => crypto.randomUUID());

  const claimUrl = `${PLATFORM_BASE}/bounties/claim/${bountyId}`;

  const set = (k: keyof typeof form, v: string | number | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const hasTitle = form.title.trim().length > 0;

  const handleDispatch = async () => {
    if (!hasTitle) return;
    setDispatching(true);

    const bounty = {
      title: form.title,
      description: form.description || undefined,
      marks: form.marks,
      claimUrl,
      postedBy: form.postedBy || undefined,
      category: form.category || undefined,
      expiresAt: form.expiresAt || undefined,
    };

    let result: { success?: boolean; sent?: number; failed?: number; error?: string };

    if (form.broadcastAll) {
      const r = await broadcastBatteryDispatch(bounty);
      result = { sent: r.sent, failed: r.failed };
    } else if (form.webhookUrl.trim()) {
      result = await sendBatteryDispatch(form.webhookUrl.trim(), bounty);
    } else {
      toast({ title: 'Provide a Discord webhook URL or enable Broadcast All', variant: 'destructive' });
      setDispatching(false);
      return;
    }

    if ('success' in result && !result.success) {
      toast({ title: 'Dispatch failed', description: result.error, variant: 'destructive' });
    } else {
      const sent = result.sent ?? 1;
      toast({ title: `Battery Dispatch fired`, description: `Sent to ${sent} Discord channel${sent === 1 ? '' : 's'}.` });
    }
    setDispatching(false);
  };

  return (
    <PortalPageLayout>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-amber-500" />
          Battery Dispatch
        </h1>
        <p className="text-muted-foreground mt-1">
          Post a bounty Deck Cue Card and dispatch to Discord. First-run: Mikey-hire test.
        </p>
      </div>

      {/* Stripe gate notice */}
      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          <strong>Gate:</strong> Marks are awarded manually until Stripe is fully operational. This dispatch is informational -- claim links are live, payouts follow once the Stripe/Marks integration completes (Scope 3).
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Bounty Details</CardTitle>
            <CardDescription>Fill in the bounty info. The Deck Cue Card updates live on the right.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Help Mikey film the intro video" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="What needs to be done?" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Marks Reward</Label>
                <Input
                  type="number"
                  value={form.marks}
                  min={1}
                  onChange={e => set('marks', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Input value={form.category} onChange={e => set('category', e.target.value)} placeholder="Task" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Posted By</Label>
              <Input value={form.postedBy} onChange={e => set('postedBy', e.target.value)} placeholder="Your name or @handle" />
            </div>
            <div className="space-y-1">
              <Label>Expires (optional)</Label>
              <Input type="date" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium">Discord Dispatch</p>
              <div className="space-y-1">
                <Label>Webhook URL (single channel)</Label>
                <Input
                  value={form.webhookUrl}
                  onChange={e => set('webhookUrl', e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.broadcastAll}
                  onChange={e => set('broadcastAll', e.target.checked)}
                  className="rounded"
                />
                Broadcast to all connected Discord channels
              </label>

              <Button
                className="w-full gap-2"
                onClick={handleDispatch}
                disabled={dispatching || !hasTitle}
              >
                <Send className="h-4 w-4" />
                {dispatching ? 'Dispatching...' : 'Fire Battery Dispatch'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live preview */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Deck Cue Card Preview</h3>
          {hasTitle ? (
            <DeckCueCard
              bountyId={bountyId}
              title={form.title}
              description={form.description || undefined}
              marks={form.marks}
              category={form.category || undefined}
              claimUrl={claimUrl}
              postedBy={form.postedBy || undefined}
              expiresAt={form.expiresAt || undefined}
            />
          ) : (
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center text-muted-foreground text-sm">
              Enter a bounty title to preview the Deck Cue Card
            </div>
          )}
        </div>
      </div>
    </PortalPageLayout>
  );
}
