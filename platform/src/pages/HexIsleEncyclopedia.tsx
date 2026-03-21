/**
 * HEXISLE ENCYCLOPEDIA — Crown Jewel #3: Tereno Hydraulic
 * ========================================================
 * The comprehensive detail page that renders ALL data from hexisleProjectSpec.ts
 * 33 patented innovations. 6 core mechanisms. Physics proofs. Manufacturing pipeline.
 * 7 islands. 12 cities. 3 characters. 6 Kickstarter campaigns.
 *
 * This page exists because hexisleProjectSpec.ts was ORPHANED — 450 lines of
 * painstakingly assembled data that nobody imported. Fixed.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  HEXISLE_IDENTITY,
  TERENO_PLATFORM,
  HEXEL,
  CORE_MECHANISMS,
  PHYSICS,
  SEVEN_ISLANDS,
  TWELVE_CITIES,
  CHARACTERS,
  HEXISLE_GAMES,
  PATENTED_INNOVATIONS,
  MANUFACTURING,
  KICKSTARTER_CAMPAIGNS,
  HEXISLE_DAISYCHAIN,
  ARCHIVE,
} from '@/lib/hexisleProjectSpec';
import { PortalPageLayout } from '@/components/PortalPageLayout';

const CATEGORY_COLORS = {
  mechanical: 'bg-blue-100 text-blue-800 border-blue-300',
  system: 'bg-purple-100 text-purple-800 border-purple-300',
  energy: 'bg-amber-100 text-amber-800 border-amber-300',
  manufacturing: 'bg-green-100 text-green-800 border-green-300',
};

const HexIsleEncyclopedia = () => {
  const navigate = useNavigate();
  const [innovationFilter, setInnovationFilter] = useState<string>('all');

  const filteredInnovations = innovationFilter === 'all'
    ? PATENTED_INNOVATIONS
    : PATENTED_INNOVATIONS.filter(i => i.category === innovationFilter);

  return (
    <PortalPageLayout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-cyan-800 to-blue-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-amber-500 text-black">Crown Jewel #3</Badge>
            <Badge className="bg-cyan-400 text-black">Brass Tacks (#16)</Badge>
            <Badge variant="outline" className="border-white text-white">Patent 63/938,216</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{HEXISLE_IDENTITY.name}</h1>
          <p className="text-xl md:text-2xl text-cyan-100 mb-2">{HEXISLE_IDENTITY.subtitle}</p>
          <p className="text-lg text-cyan-200 italic">{HEXISLE_IDENTITY.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg px-5 py-3 text-center">
              <div className="text-2xl font-bold">33</div>
              <div className="text-xs text-cyan-200">Patented Innovations</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-5 py-3 text-center">
              <div className="text-2xl font-bold">{MANUFACTURING.cadFileCount}</div>
              <div className="text-xs text-cyan-200">CAD Files</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-5 py-3 text-center">
              <div className="text-2xl font-bold">{HEXEL.partCount}</div>
              <div className="text-xs text-cyan-200">Parts Per Hexel</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-5 py-3 text-center">
              <div className="text-2xl font-bold">{PHYSICS.safetyMargin}</div>
              <div className="text-xs text-cyan-200">Safety Margin</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-5 py-3 text-center">
              <div className="text-2xl font-bold">{PHYSICS.totalHexels}</div>
              <div className="text-xs text-cyan-200">Hexels Total</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-5 py-3 text-center">
              <div className="text-2xl font-bold">7</div>
              <div className="text-xs text-cyan-200">Islands</div>
            </div>
          </div>
          <p className="mt-6 text-sm text-cyan-300 max-w-3xl">
            Creative Director: {HEXISLE_IDENTITY.creativeDirector} • Domain: {HEXISLE_IDENTITY.domain}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mechanisms">Mechanisms</TabsTrigger>
            <TabsTrigger value="innovations">33 Patents</TabsTrigger>
            <TabsTrigger value="world">World</TabsTrigger>
            <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
            <TabsTrigger value="physics">Physics</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          {/* ─── TAB 1: OVERVIEW ─── */}
          <TabsContent value="overview">
            <div className="space-y-8">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">What is HexIsle?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">{HEXISLE_IDENTITY.description}</p>
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 italic text-sm text-cyan-800">
                    {HEXISLE_IDENTITY.founderNote}
                  </div>
                </CardContent>
              </Card>

              {/* Tereno Platform */}
              <Card>
                <CardHeader>
                  <CardTitle>{TERENO_PLATFORM.name}</CardTitle>
                  <CardDescription>
                    Classification: {TERENO_PLATFORM.classification}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{TERENO_PLATFORM.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TERENO_PLATFORM.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-cyan-600 mt-0.5">●</span>
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>

                  {/* Ghost Items */}
                  <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Ghost Items System</h4>
                    <p className="text-sm text-purple-700 mb-2">{TERENO_PLATFORM.ghostItems.description}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {TERENO_PLATFORM.ghostItems.categories.map(cat => (
                        <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                      ))}
                    </div>
                    <div className="text-xs text-purple-600">
                      {TERENO_PLATFORM.ghostItems.variantsPerType.toLocaleString()}+ variants per item type
                    </div>
                    <div className="text-xs font-bold text-red-700 mt-2">
                      {TERENO_PLATFORM.ghostItems.criticalDistinction}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* The Hexel */}
              <Card>
                <CardHeader>
                  <CardTitle>The Hexel — Core Building Block</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Parts</div>
                      <div className="font-bold">{HEXEL.partCount}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Scale</div>
                      <div className="font-bold text-sm">{HEXEL.scale}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Material</div>
                      <div className="font-bold text-sm">{HEXEL.material}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2 md:col-span-3">
                      <div className="text-xs text-gray-500">Manufacturing Method</div>
                      <div className="font-bold text-sm">{HEXEL.manufacturingMethod}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">{HEXEL.mechanism}</p>
                </CardContent>
              </Card>

              {/* Games */}
              <Card>
                <CardHeader>
                  <CardTitle>Games Within HexIsle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(HEXISLE_GAMES).map((game) => (
                      <div key={game.name} className="p-4 border rounded-lg">
                        <h4 className="font-bold mb-1">{game.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{game.description}</p>
                        <p className="text-xs text-cyan-700 italic">{game.mechanic}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* DaisyChain — Physical AND Digital */}
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-amber-900">DaisyChainLink — Physical AND Digital</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Physical Chain</h4>
                      <p className="text-sm text-gray-700">{HEXISLE_DAISYCHAIN.physical.description}</p>
                      <p className="text-xs text-amber-700 mt-2 italic">Pattern: {HEXISLE_DAISYCHAIN.physical.pattern}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Digital Chain</h4>
                      <p className="text-sm text-gray-700">
                        Coaster Medallion auto-links to every project. Chain Voting Bonus: +{HEXISLE_DAISYCHAIN.digital.chainVotingBonus * 100}% per link.
                      </p>
                      <p className="text-xs text-amber-700 mt-2 italic">
                        The platform's architecture IS the product's architecture.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── TAB 2: MECHANISMS ─── */}
          <TabsContent value="mechanisms">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">6 Core Mechanisms</h2>
              <p className="text-gray-600">The engineering heart of HexIsle. Each mechanism is a patented innovation.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(CORE_MECHANISMS).map((mech) => (
                  <Card key={mech.name} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{mech.name}</CardTitle>
                      <CardDescription>{mech.role}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{mech.description}</p>
                      {'diameter' in mech && (
                        <div className="mt-2 text-xs text-cyan-700">Diameter: {(mech as typeof CORE_MECHANISMS.hollowLog).diameter}</div>
                      )}
                      {'rotations' in mech && (
                        <div className="mt-2 text-xs text-cyan-700">{(mech as typeof CORE_MECHANISMS.ouralis).rotations} rotations per cycle</div>
                      )}
                      {'innovation' in mech && (
                        <div className="mt-2 text-xs font-semibold text-amber-700">
                          Key insight: {(mech as typeof CORE_MECHANISMS.goldenLotus).innovation}
                        </div>
                      )}
                      {'depth' in mech && (
                        <div className="mt-2 text-xs text-cyan-700">
                          Depth: {(mech as typeof CORE_MECHANISMS.sawtooth60).depth} • Groove: {(mech as typeof CORE_MECHANISMS.sawtooth60).grooveDepth}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Mechanism Flow */}
              <Card className="bg-cyan-50 border-cyan-200">
                <CardHeader>
                  <CardTitle>How They Work Together</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                    <Badge className="bg-cyan-700">Water (gravity-fed)</Badge>
                    <span>→</span>
                    <Badge className="bg-cyan-600">ChannelLock (routes water)</Badge>
                    <span>→</span>
                    <Badge className="bg-cyan-600">HollowLog (central column)</Badge>
                    <span>→</span>
                    <Badge className="bg-cyan-500">Golden Lotus (flow → rotation)</Badge>
                    <span>→</span>
                    <Badge className="bg-cyan-500">Ouralis (12-rotation tide clock)</Badge>
                    <span>→</span>
                    <Badge className="bg-cyan-400 text-black">Sawtooth60 (directional current)</Badge>
                    <span>→</span>
                    <Badge className="bg-cyan-400 text-black">Rotor (visible game state)</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── TAB 3: 33 PATENTS ─── */}
          <TabsContent value="innovations">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">33 Patented Innovations</h2>
                  <p className="text-gray-600">Patent 63/938,216 • Filed December 10, 2025 • Micro Entity ($65)</p>
                </div>
                <div className="flex gap-2">
                  {['all', 'mechanical', 'system', 'energy', 'manufacturing'].map((cat) => (
                    <Button
                      key={cat}
                      variant={innovationFilter === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInnovationFilter(cat)}
                    >
                      {cat === 'all' ? 'All (33)' :
                       cat === 'mechanical' ? 'Mechanical (10)' :
                       cat === 'system' ? 'System (13)' :
                       cat === 'energy' ? 'Energy (4)' :
                       'Manufacturing (6)'}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredInnovations.map((innovation) => (
                  <div
                    key={innovation.number}
                    className={`p-4 border rounded-lg ${CATEGORY_COLORS[innovation.category]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl font-bold opacity-30 min-w-[2rem] text-right">
                        {innovation.number}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{innovation.name}</h4>
                        <p className="text-xs mt-1 opacity-80">{innovation.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-700">10</div>
                  <div className="text-xs text-blue-600">Mechanical</div>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-700">13</div>
                  <div className="text-xs text-purple-600">System</div>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-700">4</div>
                  <div className="text-xs text-amber-600">Energy</div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-700">6</div>
                  <div className="text-xs text-green-600">Manufacturing</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB 4: WORLD ─── */}
          <TabsContent value="world">
            <div className="space-y-8">
              {/* Seven Islands */}
              <div>
                <h2 className="text-2xl font-bold mb-2">The Seven Islands</h2>
                <p className="text-gray-600 mb-6">Each island teaches a real business skill through gameplay.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SEVEN_ISLANDS.map((island) => (
                    <Card
                      key={island.number}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-cyan-400"
                      onClick={() => navigate(`/hexisle/${island.name.split(' ')[0].toLowerCase()}`)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{island.name}</CardTitle>
                          <Badge variant="outline">#{island.number}</Badge>
                        </div>
                        <CardDescription>{island.theme}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">{island.businessSkill}</p>
                        <Button variant="ghost" size="sm" className="mt-2 text-cyan-700">
                          Explore Island →
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {/* The Keeps */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-amber-400 bg-amber-50"
                    onClick={() => navigate('/hexisle/keeps')}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">The Keeps</CardTitle>
                        <Badge className="bg-amber-200 text-amber-800">Hub</Badge>
                      </div>
                      <CardDescription>Guild Headquarters</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">Guild halls, shared resources, chapter headquarters</p>
                      <Button variant="ghost" size="sm" className="mt-2 text-amber-700">
                        Visit Keeps →
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Twelve Cities */}
              <Card>
                <CardHeader>
                  <CardTitle>The Twelve Cities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {TWELVE_CITIES.map((city) => (
                      <div key={city} className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-center">
                        <div className="font-semibold text-sm">{city}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Characters */}
              <div>
                <h3 className="text-xl font-bold mb-4">Characters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {CHARACTERS.map((char) => (
                    <Card key={char.name} className="border-2 hover:border-cyan-400 transition-colors">
                      <CardHeader>
                        <CardTitle>{char.name}</CardTitle>
                        <CardDescription>{char.title}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-3 italic">{char.trait}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Scale: {char.scale}</span>
                          <span>C{char.price}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {/* Design Your Own */}
                  <Card className="border-2 border-dashed border-cyan-300 bg-cyan-50 flex items-center justify-center">
                    <CardContent className="text-center py-8">
                      <div className="text-3xl mb-2">+</div>
                      <div className="font-semibold text-cyan-700">Design Your Own</div>
                      <div className="text-xs text-cyan-600 mt-1">Create a character for the HexIsle world</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB 5: MANUFACTURING ─── */}
          <TabsContent value="manufacturing">
            <div className="space-y-8">
              {/* POCF */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">{MANUFACTURING.pocf.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-800 mb-2">{MANUFACTURING.pocf.description}</p>
                  <p className="text-xs font-bold text-green-700 italic">{MANUFACTURING.pocf.slogan}</p>
                </CardContent>
              </Card>

              {/* 6 Production Levels */}
              <Card>
                <CardHeader>
                  <CardTitle>6 Production Levels</CardTitle>
                  <CardDescription>From prototype to mass production — price drops as volume increases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {MANUFACTURING.productionLevels.map((level) => (
                      <div key={level.level} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="text-2xl font-bold text-gray-300 w-8 text-center">{level.level}</div>
                        <div className="flex-1">
                          <div className="font-semibold">{level.name}</div>
                          <div className="text-xs text-gray-500">{level.method}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">${level.price}</div>
                          <div className="text-xs text-gray-500">{level.units.toLocaleString()} units</div>
                        </div>
                        {/* Progress bar */}
                        <div className="w-24">
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: level.level <= 1 ? '67%' : level.level <= 2 ? '28%' : '0%' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Formlabs */}
              <Card>
                <CardHeader>
                  <CardTitle>Formlabs Integration</CardTitle>
                  <CardDescription>Professional 3D printing for production-grade output</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(MANUFACTURING.formlabs).map(([key, value]) => (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                        <div className="text-sm font-medium mt-1">{value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pioneer Nodes */}
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle>{MANUFACTURING.distributedManufacturing.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-3">{MANUFACTURING.distributedManufacturing.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {MANUFACTURING.distributedManufacturing.requirements.map((req, i) => (
                      <Badge key={i} variant="outline">{req}</Badge>
                    ))}
                  </div>
                  <div className="text-sm font-semibold text-green-700">
                    Creator Share: {(MANUFACTURING.distributedManufacturing.creatorShare * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              {/* CAD Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-cyan-700">{MANUFACTURING.cadFileCount}</div>
                  <div className="text-xs text-cyan-600">CAD Files (F3D)</div>
                </div>
                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg text-center">
                  <div className="text-sm font-bold text-cyan-700">{MANUFACTURING.designSoftware}</div>
                  <div className="text-xs text-cyan-600">Design Software</div>
                </div>
                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg text-center">
                  <div className="text-sm font-bold text-cyan-700">{MANUFACTURING.mainAssemblyFile}</div>
                  <div className="text-xs text-cyan-600">Main Assembly</div>
                </div>
                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg text-center">
                  <div className="text-sm font-bold text-cyan-700">${MANUFACTURING.patentFilingCost}</div>
                  <div className="text-xs text-cyan-600">Patent Filing Cost</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB 6: PHYSICS ─── */}
          <TabsContent value="physics">
            <div className="space-y-8">
              <Card className="border-cyan-300 bg-gradient-to-r from-cyan-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="text-2xl text-cyan-900">The Physics Proof</CardTitle>
                  <CardDescription>Why HexIsle works. No batteries. No pumps. Just gravity.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {Object.entries(PHYSICS).map(([key, value]) => (
                      <div key={key} className="p-4 bg-white rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                        </div>
                        <div className="text-lg font-bold text-cyan-800">{String(value)}</div>
                      </div>
                    ))}
                  </div>

                  {/* The Key Proof */}
                  <div className="mt-8 p-6 bg-white rounded-lg border-2 border-green-300">
                    <h3 className="text-xl font-bold text-green-800 mb-4">The Key Calculation</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <span>Operating pressure at 3-foot head:</span>
                        <span className="font-mono font-bold">{PHYSICS.operatingPressure}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <span>Net torque per Hexel:</span>
                        <span className="font-mono font-bold">{PHYSICS.netTorquePerHexel}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <span>Required torque to operate:</span>
                        <span className="font-mono font-bold">{PHYSICS.requiredTorque}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-100 rounded border-2 border-green-400">
                        <span className="font-bold text-green-900">SAFETY MARGIN:</span>
                        <span className="font-mono font-bold text-2xl text-green-700">{PHYSICS.safetyMargin}</span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-green-700 font-medium">
                      3.0 in-lb available / 0.5 in-lb required = 6x margin. It doesn't just work. It works SIX TIMES OVER.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── TAB 7: CAMPAIGNS ─── */}
          <TabsContent value="campaigns">
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">6 Kickstarter Campaigns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {KICKSTARTER_CAMPAIGNS.map((campaign) => (
                  <Card key={campaign.number} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <CardDescription>{campaign.subtitle}</CardDescription>
                        </div>
                        <Badge variant="outline">#{campaign.number}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-3">{campaign.description}</p>
                      {campaign.goal && (
                        <div className="text-xs text-gray-500">
                          Goal: ${campaign.goal.toLocaleString()} • {campaign.category}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Archive Note */}
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Archive: {ARCHIVE.era}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-800">{ARCHIVE.contents}</p>
                  <p className="text-xs text-amber-600 mt-2">{ARCHIVE.pitchDeckReference}</p>
                  <p className="text-xs text-amber-600">{ARCHIVE.note}</p>
                  <p className="text-xs text-gray-500 mt-2 font-mono">{ARCHIVE.eDrivePath}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PortalPageLayout>
  );
};

export default HexIsleEncyclopedia;
