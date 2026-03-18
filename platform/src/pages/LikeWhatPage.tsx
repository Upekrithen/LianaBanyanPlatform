/**
 * LIKE WHAT — Patent Portfolio Examples & Founder's Vernacular
 * =============================================================
 * Linked from Patent Portfolio page. Shows:
 * 1. HexIsle / Tereno project showcase (physical proof of IP)
 * 2. Founder's Vernacular glossary (the language we invented)
 * 3. Paper directory highlights
 *
 * Designed as an onboarding tool: "Okay... maybe this is real."
 * Can be incorporated into TL;DR Tour / Wildfire Beacon Run.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  BookOpen,
  Gamepad2,
  Droplets,
  Cog,
  Shield,
  Users,
  FileText,
  ArrowRight,
  Sparkles,
  Quote,
  ChevronDown,
  ChevronUp,
  Flame,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SocialShareBar } from '@/components/atti/SocialShareBar';
import { Badge } from '@/components/ui/badge';

// ─── VERNACULAR DATA ───
const VERNACULAR = [
  { term: 'Pollination', short: 'Propagating canonical numbers across all files', category: 'process' },
  { term: 'Threshing', short: 'Extracting innovations from raw content', category: 'process' },
  { term: 'GRAFTING Cycle', short: 'Full lifecycle: Thresh \u2192 Pollinate', category: 'process' },
  { term: 'Nervous System', short: "Platform's interconnected knowledge infrastructure", category: 'architecture' },
  { term: 'X-Ray Goggles', short: 'Overlay revealing mechanics under any element', category: 'architecture' },
  { term: 'Under the Hood', short: 'Cephas section where all mechanics are published', category: 'transparency' },
  { term: 'Cephas', short: 'Public transparency/documentation site ("rock")', category: 'transparency' },
  { term: 'Fly on the Wall', short: 'Raw real-time progress updates', category: 'transparency' },
  { term: 'Silver Candlesticks', short: 'Patent portfolio donation metaphor (Les Mis)', category: 'philosophy' },
  { term: '"There is no spoon"', short: 'Extractive valuation is a construct (Matrix)', category: 'philosophy' },
  { term: 'Arrows at Trees', short: 'Practice = pre-spent luck', category: 'philosophy' },
  { term: 'As You Wish', short: 'Universal transaction confirmation (Princess Bride)', category: 'culture' },
  { term: 'HEOHO', short: 'Help Each Other Help Ourselves = Interdependence', category: 'culture' },
  { term: 'Crown Letters', short: 'Targeted leadership invitation letters', category: 'operations' },
  { term: 'Cue Cards', short: 'Shareable viral recruitment cards', category: 'operations' },
  { term: 'Opening Gambit', short: 'Coordinated launch sequence', category: 'operations' },
  { term: 'Salary of Results', short: 'Zero-base performance compensation', category: 'economics' },
  { term: 'AI Tuner', short: "Founder's role with AI (McCaffrey's Crystal Singer)", category: 'culture' },
  { term: 'Rook/Knight/Bishop/Pawn', short: 'The four AI agents (chess pieces)', category: 'culture' },
  { term: 'Sweet Sixteen', short: 'All 16 cooperative initiatives', category: 'architecture' },
  { term: 'Forever Stamp', short: 'Joule exchange rate lock-in', category: 'economics' },
  { term: 'No Atomo. Superman!', short: 'Choice to be constructive, not extractive', category: 'philosophy' },
  { term: 'Cardboard Boots', short: 'The MacKenzie Scott letter', category: 'culture' },
];

const CATEGORY_COLORS: Record<string, string> = {
  process: 'bg-blue-500/20 text-blue-300',
  architecture: 'bg-purple-500/20 text-purple-300',
  transparency: 'bg-green-500/20 text-green-300',
  philosophy: 'bg-amber-500/20 text-amber-300',
  culture: 'bg-pink-500/20 text-pink-300',
  operations: 'bg-cyan-500/20 text-cyan-300',
  economics: 'bg-orange-500/20 text-orange-300',
};

// ─── HEXISLE SHOWCASE DATA ───
const HEXISLE_FEATURES = [
  {
    icon: <Gamepad2 className="h-6 w-6" />,
    title: 'No Dice, No Batteries, No Screens',
    desc: 'Attack wheels, coin-loaded HP, and compliant mechanisms replace randomness with aggregate consequence.',
    innovations: '30+ innovations',
    link: '/hexisle/battle-philosophy',
  },
  {
    icon: <Droplets className="h-6 w-6" />,
    title: 'Hydraulic Water Table',
    desc: '420 hexagonal tiles on a real water-powered terrain system. Pneumatic traps, wave generators, irrigation channels.',
    innovations: '200+ innovations',
    link: '/hexisle',
  },
  {
    icon: <Cog className="h-6 w-6" />,
    title: 'Snap-On Character Layers',
    desc: 'Same body, different equipment layers. Peasant to King in one miniature. 14 campaigns, each adding layers.',
    innovations: '17 innovations',
    link: '/chain',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Alliance Cairns & Brand Marks',
    desc: 'Physical diplomacy. Stack coin rolls, mount shields, store treasure. Trust you can see, touch, and break.',
    innovations: '9 innovations',
    link: '/hexisle/battle-philosophy',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Cooperative Economics Engine',
    desc: 'Three currencies (Credits, Marks, Joules), demand signaling, BandWagon backing, Steward management.',
    innovations: '500+ innovations',
    link: '/economics',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: '1,748 Documented Innovations',
    desc: '8 provisional patent applications. 1,336+ formal claims. Micro-entity filing cost: $0.34 per claim.',
    innovations: 'Full portfolio',
    link: '/patent-portfolio',
  },
];

// ─── PAPERS HIGHLIGHTS ───
const PAPERS = [
  { title: 'Paper 7: XP Score System', desc: 'Multiplicative accomplishment metrics replacing star ratings', versions: 3 },
  { title: 'Paper 8: Deterministic Chance', desc: 'How HexIsle proves "luck" is aggregate consequence', versions: 3 },
  { title: 'Paper 9: Silver Candlesticks', desc: 'Patent valuation: $116M equivalent, declared at $630K', versions: 2 },
  { title: 'The 20 Laws of Cost+20%', desc: 'Constitutional pricing mechanics for cooperative economics', versions: 1 },
  { title: 'HIVI: Cooperative Intelligence', desc: 'How interdependence scales without collectivism', versions: 1 },
  { title: 'IP Load Balancing', desc: 'Anti-concentration provisions preventing IP monopoly', versions: 1 },
  { title: 'Cold Start / Ship of Theseus', desc: 'How to launch when nothing exists yet', versions: 1 },
  { title: 'Non-Speculative Securities Defense', desc: 'Why this is NOT a security (targeting Stanford Tech Law Review)', versions: 1 },
];

export default function LikeWhatPage() {
  const [showAllVernacular, setShowAllVernacular] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredVernacular = selectedCategory
    ? VERNACULAR.filter(v => v.category === selectedCategory)
    : VERNACULAR;

  const displayedVernacular = showAllVernacular ? filteredVernacular : filteredVernacular.slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lightbulb className="h-10 w-10 text-amber-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Like What?
            </h1>
          </div>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            1,748 innovations sounds impossible. Here's what they look like — and the language we invented to build them.
          </p>
          <p className="text-sm text-white/40 mt-2">
            This page exists so you can say "Okay... maybe this is real" without reading everything.
          </p>
        </motion.div>

        {/* ─── SECTION 1: HEXISLE SHOWCASE ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-bold">The Projects</h2>
            <Badge variant="outline" className="text-amber-400 border-amber-400/30">HexIsle / Tereno</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HEXISLE_FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Link to={feature.link}>
                  <Card className="bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30 transition-all h-full group">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="text-amber-400">{feature.icon}</div>
                        <Badge variant="outline" className="text-xs text-white/40 border-white/20">
                          {feature.innovations}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg text-white group-hover:text-amber-400 transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-white/60">{feature.desc}</p>
                      <div className="flex items-center gap-1 mt-3 text-xs text-amber-400/60 group-hover:text-amber-400 transition-colors">
                        <span>Explore</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─── SECTION 2: FOUNDER'S VERNACULAR ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold">Founder's Vernacular</h2>
            <Badge variant="outline" className="text-purple-400 border-purple-400/30">23 terms</Badge>
          </div>
          <p className="text-sm text-white/50 mb-4">
            We made up a language. Here's what it means. Each term links to a full FAQ explanation.
          </p>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${!selectedCategory ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 hover:text-white/70'}`}
            >
              All
            </button>
            {Object.keys(CATEGORY_COLORS).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-3 py-1 rounded-full text-xs capitalize transition-colors ${selectedCategory === cat ? CATEGORY_COLORS[cat] : 'bg-white/5 text-white/40 hover:text-white/70'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Vernacular table */}
          <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="grid grid-cols-[1fr_2fr_auto] gap-0">
              {/* Header */}
              <div className="px-4 py-2 bg-slate-800/60 text-xs font-medium text-white/50 uppercase tracking-wider border-b border-slate-700/50">Term</div>
              <div className="px-4 py-2 bg-slate-800/60 text-xs font-medium text-white/50 uppercase tracking-wider border-b border-slate-700/50">What It Means</div>
              <div className="px-4 py-2 bg-slate-800/60 text-xs font-medium text-white/50 uppercase tracking-wider border-b border-slate-700/50">Type</div>

              {displayedVernacular.map((item, i) => (
                <React.Fragment key={item.term}>
                  <Link
                    to={`/faq#vernacular-${item.term.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`}
                    className="px-4 py-3 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors border-b border-slate-700/30"
                  >
                    {item.term}
                  </Link>
                  <div className="px-4 py-3 text-sm text-white/70 border-b border-slate-700/30">
                    {item.short}
                  </div>
                  <div className="px-4 py-3 border-b border-slate-700/30">
                    <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${CATEGORY_COLORS[item.category] || 'bg-white/10 text-white/50'}`}>
                      {item.category}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {filteredVernacular.length > 10 && (
            <button
              onClick={() => setShowAllVernacular(!showAllVernacular)}
              className="flex items-center gap-2 mt-3 text-sm text-white/50 hover:text-white/80 transition-colors mx-auto"
            >
              {showAllVernacular ? (
                <>Show less <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>Show all {filteredVernacular.length} terms <ChevronDown className="h-4 w-4" /></>
              )}
            </button>
          )}
        </motion.section>

        {/* ─── SECTION 3: PAPER ARSENAL ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-green-400" />
            <h2 className="text-2xl font-bold">The Papers</h2>
            <Badge variant="outline" className="text-green-400 border-green-400/30">Academic + Medium</Badge>
          </div>
          <p className="text-sm text-white/50 mb-4">
            Every claim is backed by published, peer-reviewable documentation. Three reading levels: PhD, college freshman, 6th grade.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PAPERS.map((paper, i) => (
              <div
                key={paper.title}
                className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-green-500/20 transition-colors"
              >
                <div className="mt-1 text-green-400/60">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white">{paper.title}</h3>
                  <p className="text-xs text-white/50 mt-0.5">{paper.desc}</p>
                </div>
                {paper.versions > 1 && (
                  <Badge variant="outline" className="text-xs text-white/30 border-white/10 shrink-0">
                    {paper.versions} versions
                  </Badge>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <Link to="/papers">
              <Button variant="outline" size="sm" className="text-green-400 border-green-400/30 hover:bg-green-500/10">
                <BookOpen className="h-4 w-4 mr-2" />
                Full Paper Directory
              </Button>
            </Link>
            <a href="https://cephas.lianabanyan.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-white/50 border-white/20 hover:bg-white/5">
                <ExternalLink className="h-4 w-4 mr-2" />
                Cephas Archive
              </Button>
            </a>
          </div>
        </motion.section>

        {/* ─── CLOSING ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center border-t border-slate-700/50 pt-8"
        >
          <blockquote className="text-lg text-white/60 italic max-w-2xl mx-auto mb-4">
            <Quote className="h-5 w-5 text-amber-400/40 inline mr-2" />
            "I'm not trying to be Valjean. I'm trying to be the Bishop — one of many — and these patents are my silver candlesticks. I don't have any silver spoons."
          </blockquote>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Link to="/patent-portfolio">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Back to Patent Portfolio
              </Button>
            </Link>
            <Link to="/wildfire">
              <Button variant="outline" className="border-amber-400/30 text-amber-400 hover:bg-amber-500/10">
                <Flame className="h-4 w-4 mr-2" />
                Take the TL;DR Tour
              </Button>
            </Link>
            <Link to="/faq">
              <Button variant="outline" className="border-white/20 text-white/60 hover:bg-white/5">
                Full FAQ
              </Button>
            </Link>
          </div>

          {/* Share */}
          <div className="mt-8 bg-slate-900/50 border border-slate-700 rounded-xl p-6 max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-medium text-white/70">Share this page</h3>
            </div>
            <SocialShareBar moment="general" initiativeName="Like What? — Innovation Examples" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
