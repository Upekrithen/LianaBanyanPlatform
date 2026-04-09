import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Clock,
  MessageSquare,
  Download,
  ExternalLink,
  Building2,
  Sparkles,
  Send,
} from 'lucide-react';
import { useCanonicalStats } from '@/hooks/useCanonicalStats';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function PressJunket() {
  const stats = useCanonicalStats();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', outlet: '', email: '', question: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.question) return;
    setSubmitting(true);
    try {
      await supabase.from('moneypenny_inbox' as never).insert({
        sender_name: form.name,
        sender_email: form.email,
        subject: `Press Inquiry from ${form.outlet || 'Independent'}`,
        body: form.question,
        category: 'press',
        priority: 'high',
      } as never);
      toast({ title: 'Question submitted', description: 'We will respond within 24 hours.' });
      setForm({ name: '', outlet: '', email: '', question: '' });
    } catch {
      toast({ title: 'Error', description: 'Could not submit. Please email press@lianabanyan.com.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Badge variant="outline" className="mb-4 text-sm px-4 py-1">Press Room</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            Liana Banyan Press Junket
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to cover the cooperative platform that cannot enshittify.
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-8 pb-20">
        {/* Quick Facts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Quick Facts
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Innovations', value: stats.innovationCount.toLocaleString() },
                  { label: 'Crown Jewels', value: stats.crownJewels.toLocaleString() },
                  { label: 'Patent Applications', value: stats.patentApplications.toLocaleString() },
                  { label: 'Formal Claims', value: `~${stats.patentClaims.toLocaleString()}` },
                  { label: 'Creator Retention', value: `${stats.creatorKeepsPct}%` },
                  { label: 'Annual Membership', value: `$${stats.membershipCost}` },
                  { label: 'Production Systems', value: stats.productionSystems.toLocaleString() },
                  { label: 'Academic Papers', value: stats.academicPapers.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">{value}</div>
                    <div className="text-xs text-slate-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* The Story */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                The Story
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Liana Banyan is a cooperative platform corporation built over two decades
                by a U.S. Army veteran and father of eight. It locks creator economics at
                83.3% retention through patented Cost+20% architecture that cannot be
                changed by future leadership. The platform spans food, manufacturing,
                services, local business, guilds, and tribes — with {stats.innovationCount.toLocaleString()} documented
                innovations, {stats.patentApplications} patent applications containing approximately {stats.patentClaims.toLocaleString()} formal
                claims, and {stats.productionSystems} production systems live today. Membership costs $5
                per year. There are no ads, no venture capital, and no extraction mechanics.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Press Kit */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-500" />
                Press Kit
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: 'One-Pager (PDF)', href: '/press-kit/one-pager.pdf' },
                  { label: 'Founder Bio', href: '/press-kit/founder-bio.pdf' },
                  { label: 'Logo Pack (SVG/PNG)', href: '/press-kit/logos.zip' },
                  { label: 'Economic Architecture Overview', href: '/press-kit/economics.pdf' },
                  { label: 'Patent Portfolio Summary', href: '/press-kit/patents.pdf' },
                  { label: 'Brand Guidelines', href: '/press-kit/brand.pdf' },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700">{label}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 ml-auto shrink-0" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Guided Tour */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-500" />
                Guided Tour
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Choose your depth. Every tour is founder-led, on the record, no NDA required.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { time: '15 min', label: 'Quick Hit', desc: 'Economics + one initiative deep dive' },
                  { time: '45 min', label: 'Full Story', desc: 'Architecture, patents, governance, and demo' },
                  { time: '90 min', label: 'Deep Dive', desc: 'Everything. Code, economics, roadmap, Q&A' },
                ].map(({ time, label, desc }) => (
                  <a
                    key={time}
                    href="https://calendly.com/lianabanyan/press"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 transition-colors text-center"
                  >
                    <div className="text-2xl font-bold text-slate-900">{time}</div>
                    <div className="text-sm font-medium text-violet-600 mt-1">{label}</div>
                    <div className="text-xs text-slate-500 mt-1">{desc}</div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ask Questions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                Ask Questions
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="Outlet / Publication"
                    value={form.outlet}
                    onChange={(e) => setForm(f => ({ ...f, outlet: e.target.value }))}
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
                <Textarea
                  placeholder="Your question(s) for the founder..."
                  rows={4}
                  value={form.question}
                  onChange={(e) => setForm(f => ({ ...f, question: e.target.value }))}
                  required
                />
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Sending...' : 'Submit Question'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Schedule Interview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <div className="text-center">
            <a
              href="https://calendly.com/lianabanyan/press"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="px-8">
                <Clock className="w-4 h-4 mr-2" />
                Schedule an Interview
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Large Outlets Note */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-amber-900">
                <Building2 className="w-5 h-5 text-amber-600" />
                For Large Outlets
              </h2>
              <p className="text-sm text-amber-800 leading-relaxed">
                If you represent a major publication (print, broadcast, or digital with
                over 1M monthly reach), we offer priority scheduling, exclusive data
                access, and a dedicated press liaison. Contact{' '}
                <a href="mailto:press@lianabanyan.com" className="underline font-medium">
                  press@lianabanyan.com
                </a>{' '}
                with your outlet name and deadline. We respond within 4 hours during
                business days.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
