import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, DollarSign, Eye, QrCode, Store, Crown, Shield } from 'lucide-react';

export default function CreatorRedCarpet() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const displayHandle = handle?.startsWith('@') ? handle : `@${handle}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-16 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-6 border-amber-500/50 text-amber-400 px-4 py-1 text-sm">
            Creator Program Invite
          </Badge>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome, <span className="text-amber-400">{displayHandle}</span>
          </h1>
          <p className="text-lg text-slate-300 mb-2">
            You were selected for the Liana Banyan Creator Program.
          </p>
        </motion.div>
      </div>

      {/* Cooperative Explanation */}
      <motion.div
        className="max-w-2xl mx-auto px-4 pb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-amber-400 flex items-center gap-2">
              <Users className="w-5 h-5" />
              What Is This?
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Liana Banyan is a cooperative platform where creators keep 83.3% of every
              transaction — not because of a temporary promotion, but because the
              economic architecture is locked by patent. The platform charges a flat
              Cost+20% margin that can never increase.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Members own the platform together. There are no venture capitalists, no
              ad revenue, and no algorithmic suppression. Your audience is yours.
            </p>
            <p className="text-slate-300 leading-relaxed">
              We found you because your work stood out. This is not a mass-blast —
              every creator in this program was hand-selected from the Factor-y
              collection.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* What You Get */}
      <motion.div
        className="max-w-2xl mx-auto px-4 pb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-amber-400 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" />
              What You Get
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-slate-300">
                  <strong className="text-white">83.3% retention</strong> — you keep five-sixths
                  of every dollar. The platform margin is locked at Cost+20%, forever.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-slate-300">
                  <strong className="text-white">$5/year membership</strong> — that is the entire
                  cost. No tiered pricing, no premium upsells, no transaction surprises.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <span className="text-slate-300">
                  <strong className="text-white">Pioneer bonuses</strong> — early creators earn
                  diminishing-reward Marks through the Cue Card Pioneer Program. First
                  movers benefit most.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Your Cue Card Preview */}
      <motion.div
        className="max-w-2xl mx-auto px-4 pb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-slate-800/60 border-slate-700 overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-amber-400 flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5" />
              Your Cue Card
            </h2>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Card preview */}
              <div className="flex-shrink-0 w-48 h-64 mx-auto sm:mx-0 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-800 to-slate-900 border border-amber-500/30 flex flex-col items-center justify-center p-4 text-center">
                <Crown className="w-8 h-8 text-amber-400 mb-2" />
                <div className="text-sm font-bold text-white mb-1">{displayHandle}</div>
                <div className="text-xs text-slate-400 mb-3">Liana Banyan Creator</div>
                <div className="w-20 h-20 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-white/40" />
                </div>
                <div className="text-[10px] text-slate-500 mt-2">Scan to visit storefront</div>
              </div>
              {/* Card benefits */}
              <div className="flex-1 space-y-3">
                <p className="text-slate-300 text-sm leading-relaxed">
                  When you join, you get a personalized cue card — a scannable business
                  card that links directly to your storefront. Hand it out, post the QR
                  on social, or embed it in your bio.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-slate-300">
                    <Store className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>Your own storefront at lianabanyan.com/member/{handle}</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <QrCode className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>Scannable QR code — physical cards available</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <Shield className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>Every click tracked — earn Marks when people scan your card</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTAs */}
      <motion.div
        className="max-w-2xl mx-auto px-4 pb-20 flex flex-col sm:flex-row gap-4 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Button
          size="lg"
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8"
          onClick={() => navigate(`/membership?ref=creator-${handle}`)}
        >
          Claim Your Spot
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8"
          onClick={() => navigate('/ghost')}
        >
          <Eye className="w-4 h-4 mr-2" />
          Browse First (Ghost Mode)
        </Button>
      </motion.div>
    </div>
  );
}
