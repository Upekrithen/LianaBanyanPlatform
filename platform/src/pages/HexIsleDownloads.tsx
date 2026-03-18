/**
 * HexIsleDownloads — STL File Library with Tier Classification
 * =============================================================
 * /hexisle/downloads — Browse, download, and submit improvements
 * for all 27 canonical Hexel pieces.
 *
 * Tier system (Tereno Compatibility):
 *   🥇 Tereno Certified (Gold)
 *   🥈 Tereno Approved (Silver)
 *   🔵 HexIsle Official (Blue)
 *   🟢 HexIsle Compatible (Green)
 *   🟡 HexIsle Adaptable (Yellow)
 *   ⚪ HexIsle Inspired (White)
 *
 * Bishop Session 011 / Knight Session 29
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, Search, Hexagon, ChevronRight, ArrowLeft,
  Upload, Filter, Wrench, Hash, Award, ExternalLink,
} from 'lucide-react';

// ─── TYPES ───

type TierLevel = 'certified' | 'approved' | 'official' | 'compatible' | 'adaptable' | 'inspired';

interface HexelDownloadPiece {
  id: string;
  name: string;
  layer: string;
  description: string;
  role: string;
  tier: TierLevel;
  innovationNumber: number;
  stlAvailable: boolean;
  communityVersions: number;
}

// ─── TIER CONFIG ───

const TIER_CONFIG: Record<TierLevel, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  certified:  { label: 'Tereno Certified',  emoji: '🥇', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30' },
  approved:   { label: 'Tereno Approved',   emoji: '🥈', color: 'text-slate-300',   bg: 'bg-slate-400/10',   border: 'border-slate-400/30' },
  official:   { label: 'HexIsle Official',  emoji: '🔵', color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30' },
  compatible: { label: 'HexIsle Compatible', emoji: '🟢', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  adaptable:  { label: 'HexIsle Adaptable', emoji: '🟡', color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30' },
  inspired:   { label: 'HexIsle Inspired',  emoji: '⚪', color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/30' },
};

// ─── PIECE DATA (from hexelPieceGrammar.ts) ───

const PIECES: HexelDownloadPiece[] = [
  { id: 'swan-neck', name: 'Swan Neck', layer: 'L0 Inter-Hexel', description: 'Dual-channel hydraulic connector between adjacent Hexels', role: 'Routes water between tiles — the plumbing between rooms', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'snap-cap-connector', name: 'Snap-Cap Connector', layer: 'L0 Inter-Hexel', description: 'Waterproof snap-fit coupling for Swan Neck', role: 'Weatherproof seal — tool-free assembly', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'channel-lock', name: 'Channel Lock', layer: 'L1 Base', description: '60mm diameter, 9mm tall, three grooves', role: 'Foundation — channels inflow from Swan Neck upward', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'hollow-log', name: 'Hollow Log', layer: 'L2 Column', description: 'Central fluid column, 15.5mm diameter', role: 'Main water highway through the Hexel', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'clamshell', name: 'Clamshell', layer: 'L3+L5 Housing', description: 'SnapCap/SnapBottom waterproof housing', role: 'Encloses Golden Lotus + Rotor — no adhesive', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'golden-lotus', name: 'Golden Lotus', layer: 'L4 Actuator', description: '6 Tesla-valve cups with Rooster Teeth', role: 'AC→DC flow conversion — the heart of every Hexel', tier: 'certified', innovationNumber: 1537, stlAvailable: true, communityVersions: 2 },
  { id: 'rooster-teeth', name: 'Rooster Teeth', layer: 'L4 Sub', description: 'Flow-directing ratchet teeth', role: 'Mechanical rectifier inside the Golden Lotus', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'rotor', name: 'Rotor', layer: 'L6 Rotor', description: '18 closed cavities, 12mm height', role: 'Spins with converted water flow — bonded to Ouralis', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'ouralis', name: 'Ouralis', layer: 'L7 Primary Gear', description: '20-tooth dual-level gear, 3 cam slopes', role: 'Primary gear connecting water power to mechanism', tier: 'certified', innovationNumber: 1537, stlAvailable: true, communityVersions: 1 },
  { id: 'pgear', name: 'PGear', layer: 'L8 Peripheral', description: 'Three per Hexel, mushroom-head shafts', role: '6.67× Ouralis speed at Hexel vertices', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'needle-valve', name: 'Needle Valve', layer: 'L8 Sub', description: 'Precision flow control at PGear center', role: 'Per-vertex flow tuning for variable speeds', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'sawtooth-coral', name: 'Sawtooth Coral', layer: 'L9 Terrain Gear', description: 'Ship keel engagement, 6 angles', role: 'Ships slot in to move across water Hexels', tier: 'certified', innovationNumber: 1537, stlAvailable: true, communityVersions: 3 },
  { id: 'timing-belt', name: 'Timing Belt', layer: 'L9 Timer', description: 'Hidden countdown mechanism', role: 'Counts revolutions → triggers traps/portals', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'main-gear', name: 'Main Gear', layer: 'L10 Output', description: 'Driven at 12× Ouralis speed', role: 'High-speed output for waves and traps', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'cradle', name: 'Cradle', layer: 'L11 Dynamic', description: 'Up-and-down dynamic platform', role: 'Creates waves or triggers traps via flip', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'football', name: 'Football', layer: 'L11 Cam', description: 'Cam follower for wave generation', role: 'Rotation→oscillation converter in Cradle', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'capstone', name: 'Capstone', layer: 'L12 Surface', description: 'Static terrain surface', role: 'The ground game pieces stand on — swappable biomes', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'capwave', name: 'Capwave', layer: 'L12 Surface', description: 'Moving water surface', role: 'Oscillates for visible ocean waves', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'slotted-top', name: 'Slotted Top', layer: 'L11 Terrain', description: 'Flying Buttress slots for buildings', role: 'Mounting points for game structures', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'gorgon', name: 'Gorgon', layer: 'L12 Decoration', description: 'Decorative crown piece', role: 'Aesthetic accent — varies by biome', tier: 'compatible', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'roots', name: 'Roots', layer: 'Pneumatic', description: 'Player-controlled direction system', role: 'Decision point — choose which plant grows', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'telescoping-plant', name: 'Telescoping Plant', layer: 'Pneumatic', description: 'Ratchet segments that extend', role: 'Physical plant growth via air pressure', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'nue-wall', name: 'Nue Wall', layer: 'L11 Terrain', description: 'Defensive terrain wall', role: 'Elevation changes and defensive positions', tier: 'compatible', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'ring-of-power', name: 'Ring of Power', layer: 'L10 Interaction', description: 'Magnetic influence zone', role: 'Characters within Ring trigger Hexel events', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'one-way-valve', name: 'One-Way Valve', layer: 'Pneumatic', description: 'Ball valve preventing backflow', role: 'Ensures air builds in one direction only', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'tripod-vertices-anchor', name: 'Tripod Vertices Anchor', layer: 'L8 Structural', description: 'Three-point mounting at vertices', role: 'Rigid mount for PGear shafts + terrain', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
  { id: 'snap-base', name: 'Snap Base', layer: 'L11 Mounting', description: 'Quick-connect for characters', role: 'Snap into SlottedTop — no tools needed', tier: 'official', innovationNumber: 1537, stlAvailable: false, communityVersions: 0 },
];

// ─── COMPONENT ───

const HexIsleDownloads: React.FC = () => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<TierLevel | 'all'>('all');
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const filtered = useMemo(() => {
    return PIECES.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.layer.toLowerCase().includes(search.toLowerCase());
      const matchTier = tierFilter === 'all' || p.tier === tierFilter;
      return matchSearch && matchTier;
    });
  }, [search, tierFilter]);

  const availableCount = PIECES.filter(p => p.stlAvailable).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" data-xray-id="hexisle">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link to="/hexisle" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> HexIsle
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-cyan-400">Downloads</span>
        </div>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <Download className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">HexIsle Downloads</h1>
              <p className="text-slate-400 text-sm">
                {PIECES.length} canonical pieces · {availableCount} STLs available · Open IP model
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            Submit Improvement
          </button>
        </div>

        {/* Tier Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.entries(TIER_CONFIG) as [TierLevel, typeof TIER_CONFIG[TierLevel]][]).map(([key, cfg]) => (
            <span key={key} className={`text-xs px-2 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
              {cfg.emoji} {cfg.label}
            </span>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pieces by name, layer, or description..."
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as TierLevel | 'all')}
              className="bg-slate-800/60 border border-slate-700/60 rounded-lg pl-10 pr-8 py-2.5 text-sm text-slate-200 appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Tiers</option>
              {(Object.entries(TIER_CONFIG) as [TierLevel, typeof TIER_CONFIG[TierLevel]][]).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.emoji} {cfg.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Piggy-Back Submission Form ── */}
      {showSubmitForm && (
        <div className="max-w-6xl mx-auto px-4 mb-6" id="submit">
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
            <h3 className="text-sm font-bold text-orange-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Piggy-Back Improvement Submission
            </h3>
            <p className="text-slate-400 text-xs mb-4">
              Upload your improved version of a HexIsle piece. Best improvements become official products.
              Approved submissions earn an IP Ledger entry and Marks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Original Piece</label>
                <select className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200">
                  <option value="">Select piece...</option>
                  {PIECES.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.layer})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Self-Declared Tier</label>
                <select className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200">
                  {(Object.entries(TIER_CONFIG) as [TierLevel, typeof TIER_CONFIG[TierLevel]][]).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.emoji} {cfg.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Description of Improvement</label>
                <textarea
                  rows={3}
                  placeholder="What did you improve? Why? What problem does it solve?"
                  className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Upload STL/OBJ File</label>
                <div className="bg-slate-800/60 border border-dashed border-slate-600/60 rounded-lg p-4 text-center">
                  <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Drag & drop or click to browse</p>
                  <p className="text-[10px] text-slate-600">.stl, .obj — max 50MB</p>
                </div>
              </div>
              <div className="flex items-end">
                <button className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" /> Submit for Review
                </button>
              </div>
            </div>
            <p className="text-slate-600 text-[10px] mt-3">
              Submissions are reviewed by the Star Chamber (5/7 AI consensus) before tier classification.
              Approved improvements automatically create an IP Ledger entry.
            </p>
          </div>
        </div>
      )}

      {/* ── Piece Grid ── */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <p className="text-slate-500 text-xs mb-3">{filtered.length} piece{filtered.length !== 1 ? 's' : ''} shown</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((piece) => {
            const tier = TIER_CONFIG[piece.tier];
            return (
              <div
                key={piece.id}
                className={`rounded-xl border p-4 transition-all hover:border-cyan-500/40 ${tier.bg} ${tier.border}`}
                data-xray-id={`hexisle-${piece.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Hexagon className={`w-5 h-5 ${tier.color}`} />
                    <h3 className="font-bold text-sm text-slate-200">{piece.name}</h3>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tier.bg} ${tier.border} ${tier.color}`}>
                    {tier.emoji} {tier.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{piece.layer}</span>
                <p className="text-slate-400 text-xs mt-1 mb-2">{piece.description}</p>
                <p className="text-slate-500 text-[11px] italic mb-3">{piece.role}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-purple-400 text-[10px]">
                      <Hash className="w-3 h-3" /> {piece.innovationNumber}
                    </span>
                    {piece.communityVersions > 0 && (
                      <span className="text-[10px] text-slate-500">
                        {piece.communityVersions} community version{piece.communityVersions !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {piece.stlAvailable ? (
                    <button className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                      <Download className="w-3.5 h-3.5" /> STL
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-600 bg-slate-800/60 px-2 py-1 rounded-full">Coming Soon</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Hexagon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No pieces match your search.</p>
            <button
              onClick={() => { setSearch(''); setTierFilter('all'); }}
              className="text-cyan-400 text-sm mt-2 hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* ── How Tiers Work ── */}
        <section className="mt-8 rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            How Tier Classification Works
          </h2>
          <div className="space-y-2 text-xs text-slate-400">
            <p><span className="text-amber-400 font-bold">🥇 Tereno Certified</span> — Manufactured by LB Factory Nodes. Full QC, patent-backed, guaranteed compatibility.</p>
            <p><span className="text-slate-300 font-bold">🥈 Tereno Approved</span> — Community design reviewed and validated by the Founder. Official dimensions confirmed.</p>
            <p><span className="text-blue-400 font-bold">🔵 HexIsle Official</span> — Published by the Founder or core team. Reference implementation.</p>
            <p><span className="text-emerald-400 font-bold">🟢 HexIsle Compatible</span> — Community-verified to fit the standard. May have creative modifications.</p>
            <p><span className="text-yellow-400 font-bold">🟡 HexIsle Adaptable</span> — Works with modifications. May require adapter pieces or filing.</p>
            <p><span className="text-slate-400 font-bold">⚪ HexIsle Inspired</span> — Creative interpretation. Shares the concept but may not fit standard Hexels.</p>
          </div>
          <p className="text-slate-500 text-[10px] mt-3">
            Submit improvements via the Piggy-Back Protocol. Star Chamber reviews submissions for tier classification.
            Accepted improvements earn IP Ledger entries and Marks.
          </p>
        </section>

        {/* Cross-links */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Link to="/chain" className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
            Chain Dashboard <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link to="/hexisle" className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
            HexIsle Portal <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link to="/crew-call" className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
            Crew Call Bounties <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HexIsleDownloads;
