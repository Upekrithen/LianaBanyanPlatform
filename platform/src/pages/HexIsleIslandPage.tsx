/**
 * HEXISLE ISLAND PAGE — Generic page for all 7 islands
 * Uses the island name from URL params to render the correct island.
 * Fixes the 6 dead navigation links from HexIsle.tsx.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  SEVEN_ISLANDS,
  CEPHAS_ISLAND_NAMES,
  TWELVE_CITIES,
  CHARACTERS,
  HEXISLE_GAMES,
  type Island,
} from '@/lib/hexisleProjectSpec';

const ISLAND_DESCRIPTIONS: Record<string, {
  fullDescription: string;
  quests: string[];
  resources: string[];
  buildings: string[];
  npcs: string[];
}> = {
  harvest: {
    fullDescription: 'Harvest Island is the manufacturing heartland of HexIsle. Here, players learn production planning, supply chain optimization, and resource management through hands-on farming and crafting mechanics. Build irrigation channels, plant crops that respond to the tide cycle, and harvest goods to trade across the archipelago.',
    quests: ['Plant Your First Crop', 'Build an Irrigation Channel', 'Complete the Harvest Cycle', 'Supply the Market at Navigate', 'Master the Tide-Planting Calendar'],
    resources: ['Timber', 'Stone', 'Iron Ore', 'Fertile Soil', 'Fresh Water', 'Seeds'],
    buildings: ['Sawmill', 'Granary', 'Smithy', 'Irrigation Hub', 'Trading Post', 'Pioneer Workshop'],
    npcs: ['Master Farmer', 'Supply Chain Coordinator', 'Quality Inspector'],
  },
  navigate: {
    fullDescription: 'Navigate Island is the commercial hub of HexIsle. Players learn sales, market dynamics, and trade route optimization. Ships powered by real water currents carry goods between islands. Master the tides to find the fastest routes. Negotiate prices at the marketplace. Build your trading empire.',
    quests: ['Launch Your First Ship', 'Complete a Trade Route', 'Negotiate a Bulk Deal', 'Map the Current Patterns', 'Build a Trading Fleet'],
    resources: ['Trade Goods', 'Ship Timber', 'Sail Cloth', 'Navigation Charts', 'Trade Contracts'],
    buildings: ['Harbor', 'Marketplace', 'Shipyard', 'Lighthouse', 'Trading House', 'Bank'],
    npcs: ['Harbor Master', 'Market Analyst', 'Ship Builder'],
  },
  engineer: {
    fullDescription: 'Engineer Island is the R&D laboratory of HexIsle. Players experiment with hydraulic mechanisms, design new tile configurations, and push the boundaries of what water can do. Build dams, design water locks, and create new mechanical devices. This is where invention happens.',
    quests: ['Build Your First Dam', 'Design a Water Lock', 'Create a Hydraulic Lift', 'Test a New Mechanism', 'Patent Your Invention'],
    resources: ['Precision Parts', 'Gears', 'Seals', 'Copper Tubing', 'Research Notes'],
    buildings: ['Laboratory', 'Workshop', 'Test Pool', 'Patent Office', 'Prototype Foundry', 'Library'],
    npcs: ['Chief Engineer', 'Research Director', 'Patent Clerk'],
  },
  battle: {
    fullDescription: 'Battle Island is the competitive arena of HexIsle. Players learn strategy, tactics, and competitive positioning through diceless combat powered by hydraulics. Water flow determines outcomes — not luck, not dice, but physics and planning. Control the current, control the battle.',
    quests: ['Win Your First Skirmish', 'Control a Water Junction', 'Defend a Fortified Position', 'Execute a Flanking Maneuver', 'Win a Tournament'],
    resources: ['Weapons', 'Armor', 'Fortification Materials', 'Battle Plans', 'War Machines'],
    buildings: ['Arena', 'Barracks', 'Fortress', 'War Room', 'Training Ground', 'Armory'],
    npcs: ['Battle Commander', 'Tactics Instructor', 'Arena Champion'],
  },
  seek: {
    fullDescription: 'Seek Island is the quality assurance frontier of HexIsle. Players learn investigation, testing, and quality control through exploration quests. Find hidden treasures, verify the quality of traded goods, and uncover mysteries buried in the water channels beneath the surface.',
    quests: ['Find the Hidden Spring', 'Test a Suspect Trade Good', 'Map an Underground Channel', 'Solve the Ancient Puzzle', 'Discover a Lost City'],
    resources: ['Maps', 'Testing Equipment', 'Diving Gear', 'Ancient Keys', 'Puzzle Pieces'],
    buildings: ['Observatory', 'Testing Lab', 'Archive', 'Dive Station', 'Explorer Lodge', 'Museum'],
    npcs: ['Chief Inspector', 'Treasure Hunter', 'Historian'],
  },
  magic: {
    fullDescription: 'Magic Island is the customer service and delight center of HexIsle. Here, players learn to create wonderful experiences through unexpected interactions. The "magic" is in the details — small hydraulic mechanisms that create delightful surprises when activated. Service excellence through wonder.',
    quests: ['Create a Water Fountain', 'Design a Musical Cascade', 'Build a Surprise Mechanism', 'Host a Festival', 'Earn Customer Loyalty'],
    resources: ['Crystal Water', 'Musical Stones', 'Light Prisms', 'Enchanted Seals', 'Festival Supplies'],
    buildings: ['Fountain Garden', 'Concert Hall', 'Festival Ground', 'Spa', 'Gift Shop', 'Wonder Workshop'],
    npcs: ['Wonder Maker', 'Festival Director', 'Service Champion'],
  },
  train: {
    fullDescription: 'Train Island is the leadership academy of HexIsle. Players develop team building, management, and mentorship skills. Train new players, organize guilds, and lead expeditions across the archipelago. The best leaders make everyone around them better.',
    quests: ['Mentor a New Player', 'Form a Guild Team', 'Lead a Multi-Island Expedition', 'Win a Cross-Island Competition', 'Earn the Leadership Badge'],
    resources: ['Training Manuals', 'Team Contracts', 'Leadership Tokens', 'Guild Charters', 'Expedition Maps'],
    buildings: ['Academy', 'Guild Hall', 'Council Chamber', 'Training Arena', 'Mentorship Center', 'Library of Leaders'],
    npcs: ['Headmaster', 'Guild Captain', 'Council Elder'],
  },
};

const HexIsleIslandPage = () => {
  const { islandName } = useParams<{ islandName: string }>();
  const navigate = useNavigate();

  const island = SEVEN_ISLANDS.find(
    (i) => i.name.split(' ')[0].toLowerCase() === islandName?.toLowerCase()
  );

  if (!island) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Island Not Found</CardTitle>
            <CardDescription>The island "{islandName}" doesn't exist in HexIsle.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/hexisle')}>Back to HexIsle</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const details = ISLAND_DESCRIPTIONS[islandName?.toLowerCase() || ''];
  const cephasName = CEPHAS_ISLAND_NAMES[island.number as keyof typeof CEPHAS_ISLAND_NAMES];

  // Assign 1-2 cities per island, plus distribute extras
  const citiesPerIsland = Math.floor(TWELVE_CITIES.length / SEVEN_ISLANDS.length);
  const startIdx = (island.number - 1) * citiesPerIsland;
  const islandCities = TWELVE_CITIES.slice(startIdx, startIdx + citiesPerIsland);

  // Get characters for this island
  const islandCharacters = CHARACTERS.filter((_, i) => i % SEVEN_ISLANDS.length === island.number - 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-blue-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-cyan-700 to-blue-800 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            className="text-cyan-200 hover:text-white mb-4"
            onClick={() => navigate('/hexisle/encyclopedia')}
          >
            ← Back to HexIsle
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-cyan-400 text-black">Island #{island.number}</Badge>
            <Badge variant="outline" className="border-white text-white">{island.theme}</Badge>
            {cephasName && (
              <Badge variant="outline" className="border-cyan-300 text-cyan-200">
                Cephas: {cephasName}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2">{island.name}</h1>
          <p className="text-xl text-cyan-100">{island.businessSkill}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        {/* Description */}
        {details && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed">{details.fullDescription}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quests */}
          {details?.quests && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {details.quests.map((quest, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-cyan-50 cursor-pointer">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs">
                        {i + 1}
                      </div>
                      <span className="text-sm">{quest}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Buildings */}
          {details?.buildings && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Buildings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {details.buildings.map((building) => (
                    <div key={building} className="p-3 bg-gray-50 border rounded-lg text-center text-sm">
                      {building}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resources */}
          {details?.resources && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {details.resources.map((resource) => (
                    <Badge key={resource} variant="outline" className="text-sm">
                      {resource}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* NPCs */}
          {details?.npcs && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Characters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {details.npcs.map((npc) => (
                    <div key={npc} className="flex items-center gap-2 text-sm">
                      <span className="text-cyan-600">●</span> {npc}
                    </div>
                  ))}
                  {islandCharacters.map((char) => (
                    <div key={char.name} className="flex items-center gap-2 text-sm">
                      <span className="text-amber-600">★</span>
                      <span className="font-medium">{char.name}</span> — {char.title}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cities on this island */}
        {islandCities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {islandCities.map((city) => (
                  <div key={city} className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg text-center min-w-[100px]">
                    <div className="font-semibold">{city}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Games available on all islands */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(HEXISLE_GAMES).map((game) => (
                <div key={game.name} className="p-4 border rounded-lg">
                  <h4 className="font-bold text-sm mb-1">{game.name}</h4>
                  <p className="text-xs text-gray-600">{game.mechanic}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation to other islands */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Other Islands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {SEVEN_ISLANDS.filter((i) => i.number !== island.number).map((otherIsland) => (
                <Button
                  key={otherIsland.number}
                  variant="outline"
                  onClick={() => navigate(`/hexisle/${otherIsland.name.split(' ')[0].toLowerCase()}`)}
                >
                  {otherIsland.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HexIsleIslandPage;
