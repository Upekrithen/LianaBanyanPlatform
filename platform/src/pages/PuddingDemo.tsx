import { useState } from 'react';
import {
  ExpandableBlock,
  ImageCarousel,
  HoverPreviewGrid,
  RevealBlock,
  DataVizBar,
  ComparisonBar
} from '../components/pudding';

const DEMO_CAROUSEL_ITEMS = [
  {
    id: '1',
    title: 'Peasant',
    description: 'The foundation of every army. Simple, reliable, essential.',
    tag: 'Basic Unit',
    caption: 'From the HexIsle collection'
  },
  {
    id: '2',
    title: 'Farmer',
    description: 'Produces resources. The backbone of your economy.',
    tag: 'Economic Unit',
    caption: 'From the HexIsle collection'
  },
  {
    id: '3',
    title: 'Warrior',
    description: 'Trained for combat. Protects what matters.',
    tag: 'Military Unit',
    caption: 'From the HexIsle collection'
  }
];

const DEMO_GRID_ITEMS = [
  { id: '1', label: 'Let\'s Make Dinner', icon: '🍽️', category: 'Food', color: '#ef4444', description: 'Neighbors feeding neighbors' },
  { id: '2', label: 'Let\'s Get Groceries', icon: '🛒', category: 'Food', color: '#f97316', description: 'Volume purchasing power' },
  { id: '3', label: 'Let\'s Go Shopping', icon: '🛍️', category: 'Commerce', color: '#eab308', description: 'Cooperative buying power' },
  { id: '4', label: 'Household Concierge', icon: '🏠', category: 'Home', color: '#22c55e', description: 'World-class home management' },
  { id: '5', label: 'The Family Table', icon: '👨‍👩‍👧‍👦', category: 'Community', color: '#14b8a6', description: 'Intergenerational connection' },
  { id: '6', label: 'Tatiana Schlossburg Health Accords', icon: '💊', category: 'Health', color: '#3b82f6', description: 'The Health Accords' },
  { id: '7', label: 'MSA', icon: '🏥', category: 'Health', color: '#6366f1', description: 'Medical Savings Accounts' },
  { id: '8', label: 'Defense Klaus', icon: '🛡️', category: 'Safety', color: '#8b5cf6', description: 'For Someone You Love' },
  { id: '9', label: 'Rally Group', icon: '🚨', category: 'Safety', color: '#a855f7', description: 'Crisis response everywhere' },
  { id: '10', label: 'VSL', icon: '💰', category: 'Finance', color: '#ec4899', description: 'Vouched Short Loans' },
  { id: '11', label: 'Let\'s Make Bread', icon: '🍞', category: 'Business', color: '#f43f5e', description: '$5 business simulator' },
  { id: '12', label: 'Harper Guild', icon: '⚖️', category: 'Business', color: '#78716c', description: 'HR & ethics support' },
  { id: '13', label: 'JukeBox', icon: '🎵', category: 'Creative', color: '#0ea5e9', description: 'Fair music licensing' },
  { id: '14', label: 'Didasko', icon: '📚', category: 'Education', color: '#84cc16', description: 'College of Hard Knocks' },
  { id: '15', label: 'Brass Tacks', icon: '🔧', category: 'Manufacturing', color: '#64748b', description: 'Cooperative manufacturing' },
  { id: '16', label: 'Power to the People', icon: '✊', category: 'Civic', color: '#1e293b', description: 'Outside the Gates' }
];

const DEMO_BAR_DATA = [
  { label: 'Creator keeps', value: 83.3, color: '#22c55e', icon: '💰' },
  { label: 'Platform margin', value: 16.7, color: '#f97316', icon: '🏛️' }
];

export default function PuddingDemo() {
  const [votes, setVotes] = useState({ up: 342, down: 58 });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pudding-Style Component Library
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Interactive, scroll-driven storytelling components for Liana Banyan
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            1. Expandable Blocks
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click to expand and reveal more content. Perfect for FAQs and detailed explanations.
          </p>

          <ExpandableBlock
            title="What is Cost + 20%?"
            subtitle="The foundation of fair economics"
            preview="Click to learn how creators and workers keep 83.3% of every dollar..."
            accentColor="#f97316"
          >
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Cost + 20%</strong> is the pricing model that powers Liana Banyan. 
              Instead of taking 30-50% like traditional platforms, we only add a 20% margin 
              on top of the creator's costs.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This means on a $500 transaction:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Creator/Worker receives:</strong> $416.67 (83.3%)</li>
              <li><strong>Platform keeps:</strong> $83.33 (16.7%)</li>
            </ul>
          </ExpandableBlock>

          <ExpandableBlock
            title="The Three-Gear Currency Differential"
            subtitle="Equalizing global economies"
            preview="How Credits, Marks, and Joules work together..."
            accentColor="#3b82f6"
          >
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The system uses three interlocking currencies — <strong>Credits</strong>, 
              <strong>Marks</strong>, and <strong>Joules</strong> — that function like 
              an automotive differential.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              External currencies turn at different speeds (exchange rates), but the 
              internal platform economy maintains stability. Bob in Greece and Mary in 
              Switzerland both get exactly 1 Credit worth of value.
            </p>
          </ExpandableBlock>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            2. Image Carousel
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Navigate through images with left/right arrows. Great for showcasing products or steps.
          </p>

          <ImageCarousel items={DEMO_CAROUSEL_ITEMS} />
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            3. Hover Preview Grid
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Hover to preview, click to expand as a card, click again to flip. 
            Searchable and filterable.
          </p>

          <HoverPreviewGrid
            items={DEMO_GRID_ITEMS}
            columns={8}
            searchable={true}
            filterable={true}
            categories={['Food', 'Commerce', 'Home', 'Community', 'Health', 'Safety', 'Finance', 'Business', 'Creative', 'Education', 'Manufacturing', 'Civic']}
          />
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            4. Reveal Block with Voting
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Shows summary first, then reveals details and voting interface on click.
            Perfect for proposals and pedestals.
          </p>

          <RevealBlock
            title="Proposal: Community Garden Initiative"
            summary={
              <p>
                A member has proposed using $2,500 from the general fund to establish 
                a community garden in the downtown area. The garden would provide fresh 
                produce to local families and serve as an educational space.
              </p>
            }
            details={
              <div className="space-y-4">
                <h4 className="font-bold">Budget Breakdown:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Land preparation: $800</li>
                  <li>Seeds and plants: $400</li>
                  <li>Tools and equipment: $600</li>
                  <li>Water system: $500</li>
                  <li>Signage and fencing: $200</li>
                </ul>
                <h4 className="font-bold mt-4">Timeline:</h4>
                <p>Implementation would begin in Spring 2026 with first harvest expected by Summer.</p>
                <h4 className="font-bold mt-4">Impact:</h4>
                <p>Expected to serve 50+ families and provide hands-on learning for local schools.</p>
              </div>
            }
            votingEnabled={true}
            currentVotes={votes}
            onVote={(vote) => {
              setVotes(prev => ({
                ...prev,
                [vote === 'up' ? 'up' : 'down']: prev[vote === 'up' ? 'up' : 'down'] + 1
              }));
            }}
            accentColor="#22c55e"
          />
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            5. Data Visualization Bars
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Animated bar charts for showing data comparisons.
          </p>

          <DataVizBar
            title="Revenue Distribution"
            subtitle="How every dollar is split"
            data={DEMO_BAR_DATA}
            maxValue={100}
            showPercentages={true}
            height={32}
          />

          <ComparisonBar
            title="Community Vote Results"
            leftLabel="Support"
            rightLabel="Oppose"
            leftValue={votes.up}
            rightValue={votes.down}
            leftColor="#22c55e"
            rightColor="#ef4444"
          />
        </section>

        <section className="mb-16 p-8 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            How These Components Will Be Used
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-2">
                Cue Cards (Hofund)
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                HoverPreviewGrid → Small icons that expand to full cards with 3D flip
              </p>
            </div>
            <div>
              <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-2">
                Voting & Pedestals
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                RevealBlock → Summary first, then details + voting interface
              </p>
            </div>
            <div>
              <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-2">
                Explainers
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                ExpandableBlock → Progressive disclosure of complex concepts
              </p>
            </div>
            <div>
              <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-2">
                Kickstarter / Product Showcase
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                ImageCarousel + ScrollySection → Scroll-driven product story
              </p>
            </div>
          </div>
        </section>

        <footer className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Inspired by <a href="https://pudding.cool" className="text-orange-500 hover:underline">The Pudding</a></p>
          <p className="mt-2">FOR THE KEEP! ⚔️</p>
        </footer>
      </div>
    </div>
  );
}
