/**
 * Crown Letters — Full inventory of all Crown positions across
 * 16 initiatives + 4 executive seats + Political Expedition.
 */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Users, Shield, Sparkles, Building2, Globe, Vote } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { FlipSection } from '@/components/FlipSection';
import { useState } from 'react';

interface CrownEntry {
  name: string;
  title: string;
  initiative: string;
  initiativeNumber?: number;
  bio: string;
  status: 'written' | 'locked' | 'seeking';
  category: 'executive' | 'initiative' | 'political-expedition';
}

const CROWN_ENTRIES: CrownEntry[] = [
  // ── EXECUTIVE CROWNS ──
  { name: 'Michael Seibel', title: 'Chief Executive Officer', initiative: 'Liana Banyan Corporation', bio: 'Former CEO of Y Combinator, launched Twitch', status: 'locked', category: 'executive' },
  { name: 'Tom Simon', title: 'Chief Financial Officer', initiative: 'Liana Banyan Corporation', bio: 'FBI forensic accountant, financial integrity expert', status: 'locked', category: 'executive' },
  { name: 'MacKenzie Scott', title: 'Board Chair', initiative: 'Liana Banyan Corporation', bio: 'Philanthropist, author, transformative giving pioneer', status: 'locked', category: 'executive' },
  { name: 'Craig Newmark', title: 'Infrastructure Chancellor', initiative: 'Liana Banyan Corporation', bio: 'Founder of Craigslist, civic tech philanthropist', status: 'locked', category: 'executive' },
  { name: 'Seeking', title: 'Chief Technology Officer', initiative: 'Liana Banyan Corporation', bio: 'Platform architecture, distributed systems, cooperative tech infrastructure', status: 'seeking', category: 'executive' },
  { name: 'Seeking', title: 'Chief Marketing Officer', initiative: 'Liana Banyan Corporation', bio: 'Community growth, cooperative brand, member acquisition without ads', status: 'seeking', category: 'executive' },

  // ── INITIATIVE CROWNS (Sweet 16) ──
  { name: 'Maneet Chauhan', title: 'Grand Chef', initiative: "Let's Make Dinner", initiativeNumber: 1, bio: 'Celebrity chef, James Beard nominee', status: 'written', category: 'initiative' },
  { name: 'José Andrés', title: 'Provisioner', initiative: "Let's Get Groceries", initiativeNumber: 2, bio: 'Founded World Central Kitchen, fed millions', status: 'written', category: 'initiative' },
  { name: 'Mary Beth Laughton', title: 'Merchant Mentor', initiative: "Let's Go Shopping", initiativeNumber: 3, bio: 'Former SVP at REI, scaled ethical retail', status: 'written', category: 'initiative' },
  { name: 'Marie Kondo', title: 'Steward Mentor', initiative: 'Household Concierge', initiativeNumber: 4, bio: 'Home organization icon, worldwide influence', status: 'written', category: 'initiative' },
  { name: 'Samin Nosrat', title: 'Table Keeper', initiative: 'The Family Table', initiativeNumber: 5, bio: 'Author of Salt Fat Acid Heat, food educator', status: 'written', category: 'initiative' },
  { name: 'Alex Oshmyansky', title: 'Apothecary', initiative: 'Tatiana Schlossburg Health Accords', initiativeNumber: 6, bio: 'Founded Cost Plus Drugs, slashed medication prices', status: 'written', category: 'initiative' },
  { name: 'Sallie Krawcheck', title: 'Treasury Mentor', initiative: 'MSA (Mutual Savings)', initiativeNumber: 7, bio: 'Former Wall Street exec, founded Ellevest', status: 'written', category: 'initiative' },
  { name: 'Ruth Glenn', title: 'First Shield', initiative: 'Defense Klaus', initiativeNumber: 8, bio: 'Led NCADV, national DV advocate', status: 'written', category: 'initiative' },
  { name: 'Kimberly A. Williams', title: 'Responder General', initiative: 'Rally Group', initiativeNumber: 9, bio: 'Emergency management leader', status: 'written', category: 'initiative' },
  { name: 'Cathie Mahon', title: 'Lender Mentor', initiative: 'VSL (Voucher Short Loans)', initiativeNumber: 10, bio: 'CEO of Inclusiv, credit union network leader', status: 'written', category: 'initiative' },
  { name: 'Dale Dougherty', title: 'Industry Chancellor', initiative: "Let's Make Bread", initiativeNumber: 11, bio: 'Founded Make Magazine, Maker Movement godfather', status: 'written', category: 'initiative' },
  { name: 'Brené Brown', title: 'Harper Prime', initiative: 'Harper Guild', initiativeNumber: 12, bio: 'Researcher on vulnerability and trust', status: 'written', category: 'initiative' },
  { name: 'Taylor Swift', title: 'Maestro Mentor', initiative: 'JukeBox', initiativeNumber: 13, bio: 'Artist who fought for creator rights', status: 'written', category: 'initiative' },
  { name: 'Sal Khan', title: 'Chancellor', initiative: 'Didasko', initiativeNumber: 14, bio: 'Founded Khan Academy, revolutionized education', status: 'locked', category: 'initiative' },
  { name: 'Muhammad Yunus', title: 'Commerce Secretary', initiative: 'International', initiativeNumber: 16, bio: 'Nobel laureate, Grameen Bank founder', status: 'written', category: 'initiative' },
  { name: 'Seeking', title: 'Manufacturing Mentor', initiative: 'Brass Tacks', initiativeNumber: 17, bio: 'Distributed manufacturing, supply chain, maker economy infrastructure', status: 'seeking', category: 'initiative' },

  // ── POLITICAL EXPEDITION (#15) — 4 Crown Council ──
  { name: 'Alexandria Ocasio-Cortez', title: 'Door-Opener (Left)', initiative: 'Power to the People', initiativeNumber: 15, bio: 'U.S. Representative, civic engagement champion', status: 'written', category: 'political-expedition' },
  { name: 'Arnold Schwarzenegger', title: 'Door-Opener (Right)', initiative: 'Power to the People', initiativeNumber: 15, bio: 'Former Governor, bipartisan civic advocate', status: 'written', category: 'political-expedition' },
  { name: 'Keanu Reeves', title: 'Builder (Culture)', initiative: 'Power to the People', initiativeNumber: 15, bio: 'Actor, quiet philanthropist, genuine humility', status: 'written', category: 'political-expedition' },
  { name: 'Sandra Bullock', title: 'Builder (Action)', initiative: 'Power to the People', initiativeNumber: 15, bio: 'Oscar winner, behind-the-scenes philanthropist', status: 'written', category: 'political-expedition' },
];

function CrownCard({ entry }: { entry: CrownEntry }) {
  const [flipped, setFlipped] = useState(false);

  const statusColor = entry.status === 'locked' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
    entry.status === 'written' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
    'bg-slate-500/20 text-slate-400 border-slate-500/30';

  const statusLabel = entry.status === 'locked' ? 'Locked' : entry.status === 'written' ? 'Written' : 'Seeking';

  return (
    <FlipSection
      isFlipped={flipped}
      className="h-full"
      front={
        <Card
          className="h-full cursor-pointer hover:border-amber-500/30 transition-colors bg-card"
          onClick={() => setFlipped(true)}
        >
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">👑</span>
                <div>
                  <p className="font-bold text-sm text-foreground">{entry.name}</p>
                  <p className="text-xs text-amber-500 font-medium">{entry.title}</p>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] ${statusColor}`}>{statusLabel}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2 flex-1">{entry.bio}</p>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                {entry.initiativeNumber ? `#${entry.initiativeNumber} ` : ''}{entry.initiative}
              </p>
              <span className="text-[10px] text-emerald-500">tap for details</span>
            </div>
          </CardContent>
        </Card>
      }
      back={
        <Card
          className="h-full cursor-pointer bg-card border-amber-500/20"
          onClick={() => setFlipped(false)}
        >
          <CardContent className="p-4 flex flex-col h-full">
            <p className="font-bold text-sm text-amber-400 mb-1">{entry.title}: {entry.name}</p>
            <p className="text-xs text-foreground font-medium mb-2">{entry.initiative}</p>
            <p className="text-xs text-muted-foreground mb-3 flex-1">
              {entry.category === 'executive' && 'Executive leadership position for the Liana Banyan Corporation. Letter locked and ready for delivery.'}
              {entry.category === 'initiative' && `Crown leadership for Initiative #${entry.initiativeNumber}. This person was chosen because their life's work aligns with this initiative's mission. Crown holders guide strategy, not operations — the cooperative runs itself.`}
              {entry.category === 'political-expedition' && 'Part of the 4-Crown Council for Political Expedition. Two Door-Openers (left and right) prove this is not partisan. Two Builders (culture and action) make the infrastructure real.'}
            </p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Hierarchy: Crown → Warden → Captain → Member</span>
              <span className="text-amber-500">← back</span>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}

export default function CrownLettersPage() {
  const executives = CROWN_ENTRIES.filter(e => e.category === 'executive');
  const initiatives = CROWN_ENTRIES.filter(e => e.category === 'initiative');
  const political = CROWN_ENTRIES.filter(e => e.category === 'political-expedition');

  return (
    <PortalPageLayout maxWidth="xl" xrayId="crown-letters-page">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Crown className="h-8 w-8 text-amber-500" />
          <h1 className="text-3xl font-bold text-foreground">Crown Letters</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Every initiative has a Crown — a leader chosen because their life's work
          aligns with the mission. Crowns guide strategy, not operations. The cooperative
          runs itself. Crown Letters across 6 executive seats, 16+ initiatives, and the
          Political Expedition's 4-Crown Council.
        </p>
      </div>

      {/* Executive Crowns */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-bold text-foreground">Executive Leadership</h2>
          <Badge variant="outline" className="text-amber-400 border-amber-500/30">4 positions</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {executives.map(e => <CrownCard key={e.name} entry={e} />)}
        </div>
      </div>

      {/* Political Expedition */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Vote className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-bold text-foreground">Political Expedition — Initiative #15</h2>
          <Badge variant="outline" className="text-purple-400 border-purple-500/30">4-Crown Council</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Not Left, Not Right — Forward Together. Two Door-Openers (one left, one right)
          prove cooperative economics is not partisan. Two Builders make the civic infrastructure real.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {political.map(e => <CrownCard key={e.name} entry={e} />)}
        </div>
      </div>

      {/* Initiative Crowns */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-emerald-500" />
          <h2 className="text-xl font-bold text-foreground">Initiative Crowns — The Sweet 16</h2>
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">{initiatives.length} positions</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {initiatives.map(e => <CrownCard key={e.name} entry={e} />)}
        </div>
      </div>

      {/* Summary stats */}
      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 justify-center text-center">
            <div>
              <p className="text-2xl font-bold text-amber-400">{CROWN_ENTRIES.length}</p>
              <p className="text-xs text-muted-foreground">Total Crown Positions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{CROWN_ENTRIES.filter(e => e.status !== 'seeking').length}</p>
              <p className="text-xs text-muted-foreground">Letters Written</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{CROWN_ENTRIES.filter(e => e.status === 'locked').length}</p>
              <p className="text-xs text-muted-foreground">Locked (Ready to Send)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">4</p>
              <p className="text-xs text-muted-foreground">Political Expedition Council</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
