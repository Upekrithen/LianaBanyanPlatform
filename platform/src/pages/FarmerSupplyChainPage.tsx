/**
 * FARMER SUPPLY CHAIN — "Literally use it tomorrow"
 * Let's Make Dinner (#1) + Let's Get Groceries (#2) + Brass Tacks (#16)
 *
 * Farm-fresh freeze-dried meals at $5/serving with advance ordering.
 * A business making and job creating machine.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  SAMPLE_KITS,
  VERTICAL_INTEGRATION_JOBS,
  FREEZE_DRY_EQUIPMENT,
  FIVE_DOLLAR_SERVING_MODEL,
  INITIATIVE_CONNECTIONS,
  type FreezeDriedKit,
} from '@/lib/farmerSupplyChain';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

const FarmerSupplyChainPage = () => {
  const [selectedKit, setSelectedKit] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-amber-500 text-black mb-4 text-sm">
            Let's Make Dinner + Let's Get Groceries
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Farm-Fresh Meals. $5 Per Serving.
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-2">
            Just add water and cook. 25-year shelf life.
          </p>
          <p className="text-lg text-green-200 mb-8">
            Real vegetables from real farmers. Freeze-dried and prepped. Order in advance, pick up at your local node.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-4 text-center">
              <div className="text-3xl font-bold">$5</div>
              <div className="text-sm text-green-200">per serving<br/>advance order</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-4 text-center">
              <div className="text-3xl font-bold">$4</div>
              <div className="text-sm text-green-200">per serving<br/>bulk (10+ kits/week)</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-4 text-center">
              <div className="text-3xl font-bold">25</div>
              <div className="text-sm text-green-200">year<br/>shelf life</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-4 text-center">
              <div className="text-3xl font-bold">15</div>
              <div className="text-sm text-green-200">minute<br/>cook time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Tabs defaultValue="kits" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="kits">Meal Kits</TabsTrigger>
            <TabsTrigger value="order">Order Now</TabsTrigger>
            <TabsTrigger value="business">Start a Business</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
          </TabsList>

          {/* ─── TAB 1: MEAL KITS ─── */}
          <TabsContent value="kits">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAMPLE_KITS.map((kit) => (
                <MealKitCard
                  key={kit.id}
                  kit={kit}
                  isSelected={selectedKit === kit.id}
                  onSelect={() => setSelectedKit(kit.id === selectedKit ? null : kit.id)}
                />
              ))}
            </div>

            {/* Pricing Breakdown */}
            <Card className="mt-8 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">Volume Pricing — The More You Order, The More You Save</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(FIVE_DOLLAR_SERVING_MODEL.pricingTiers).map(([key, tier]) => (
                    <div key={key} className={`p-6 rounded-lg border-2 ${
                      key === 'advance' ? 'border-green-500 bg-white shadow-lg' :
                      key === 'bulk' ? 'border-amber-500 bg-amber-50' :
                      'border-gray-300 bg-white'
                    }`}>
                      {key === 'advance' && (
                        <Badge className="bg-green-500 text-white mb-2">Best Value</Badge>
                      )}
                      <div className="text-4xl font-bold mb-1">
                        ${tier.perServing.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 mb-3">per serving</div>
                      <div className="text-sm font-medium mb-2">
                        {key === 'advance' ? 'Advance Order' :
                         key === 'walkUp' ? 'Walk-Up / Retail' :
                         'Bulk Advance'}
                      </div>
                      <div className="text-xs text-gray-600">{tier.condition}</div>
                      <div className="text-xs text-green-600 mt-1">{tier.discount}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── TAB 2: ORDER NOW ─── */}
          <TabsContent value="order">
            <div className="space-y-8">
              <Card className="border-green-300">
                <CardHeader>
                  <CardTitle className="text-2xl">Place an Advance Order — $5/Serving</CardTitle>
                  <CardDescription>
                    Order 48+ hours in advance. Pick up at your local distribution node.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Kit Selection */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">1. Choose Your Meals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {SAMPLE_KITS.map((kit) => (
                        <div key={kit.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-green-50 cursor-pointer">
                          <div>
                            <div className="font-medium">{kit.name}</div>
                            <div className="text-sm text-gray-500">{kit.servings} servings • {kit.cookTime}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-700">
                              ${(kit.pricing.advancePerServing * kit.servings).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              ${kit.pricing.advancePerServing.toFixed(2)}/serving
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">2. Choose Your Schedule</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['One-Time', 'Weekly', 'Bi-Weekly', 'Monthly'].map((freq) => (
                        <button key={freq} className="p-3 border-2 rounded-lg text-center hover:border-green-500 hover:bg-green-50 transition-colors">
                          <div className="font-medium">{freq}</div>
                          {freq !== 'One-Time' && (
                            <div className="text-xs text-green-600 mt-1">Standing order = guaranteed supply</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pickup Day */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">3. Choose Pickup Day</h3>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <button key={day} className="p-3 border rounded-lg text-center hover:border-green-500 hover:bg-green-50">
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Standing Order Benefits */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h4 className="font-semibold text-amber-900 mb-2">🌾 Why Standing Orders Are Better</h4>
                    <ul className="space-y-2 text-sm text-amber-800">
                      <li>• Farmers know exactly what to grow — zero food waste</li>
                      <li>• Your meals are made fresh for YOUR order, not sitting on a shelf</li>
                      <li>• Qualify for bulk pricing ($4/serving) at 10+ kits/week</li>
                      <li>• Guaranteed supply — your order is reserved before harvest</li>
                      <li>• Pause or cancel anytime with 48-hour notice</li>
                    </ul>
                  </div>

                  <Button className="w-full bg-green-700 hover:bg-green-800 text-lg py-6">
                    Place Advance Order — As You Wish
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── TAB 3: START A BUSINESS ─── */}
          <TabsContent value="business">
            <div className="space-y-8">
              {/* The Pitch */}
              <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50">
                <CardHeader>
                  <CardTitle className="text-2xl text-amber-900">
                    Start a Freeze-Dried Meal-Kit Business
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Supply your local area with &quot;just add water and cook&quot; meals made from real farm produce.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Revenue Calculator */}
                    <div className="bg-white rounded-lg p-6 border">
                      <h3 className="font-bold text-lg mb-4 text-green-900">Your Monthly Earnings</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Buy ingredients at C20:</span>
                          <span className="font-mono">~${FIVE_DOLLAR_SERVING_MODEL.distributorBusinessModel.ingredientCostPerServing.toFixed(2)}/serving</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sell at advance order price:</span>
                          <span className="font-mono">$5.00/serving</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Margin per 4-serving kit:</span>
                          <span className="font-mono font-bold text-green-700">
                            ${FIVE_DOLLAR_SERVING_MODEL.distributorBusinessModel.grossMarginPerKit.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>You keep (83.3%):</span>
                          <span className="font-mono font-bold text-green-700">
                            ${FIVE_DOLLAR_SERVING_MODEL.distributorBusinessModel.distributorEarningsPerKit.toFixed(2)}/kit
                          </span>
                        </div>
                        <hr className="my-3" />
                        <div className="flex justify-between">
                          <span>10 kits/day:</span>
                          <span className="font-mono">
                            ${FIVE_DOLLAR_SERVING_MODEL.distributorBusinessModel.dailyEarnings.toFixed(2)}/day
                          </span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-green-800">
                          <span>Monthly (25 days):</span>
                          <span className="font-mono">
                            ${FIVE_DOLLAR_SERVING_MODEL.distributorBusinessModel.monthlyEarnings.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="bg-white rounded-lg p-6 border">
                      <h3 className="font-bold text-lg mb-4 text-green-900">What You Need</h3>
                      <ul className="space-y-3">
                        {FIVE_DOLLAR_SERVING_MODEL.distributorBusinessModel.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">✓</span>
                            <span className="text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 p-4 bg-green-50 rounded-lg">
                        <div className="text-sm font-semibold text-green-800 mb-1">Zero Inventory Risk</div>
                        <div className="text-xs text-green-700">
                          {FIVE_DOLLAR_SERVING_MODEL.distributorBusinessModel.noInventoryRisk}
                        </div>
                      </div>
                      <div className="mt-3 p-4 bg-green-50 rounded-lg">
                        <div className="text-sm font-semibold text-green-800 mb-1">No Storefront Needed</div>
                        <div className="text-xs text-green-700">
                          {FIVE_DOLLAR_SERVING_MODEL.distributorBusinessModel.noStorefrontNeeded}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-8 bg-amber-600 hover:bg-amber-700 text-lg py-6">
                    Become a Local Distributor — As You Wish
                  </Button>
                </CardContent>
              </Card>

              {/* Equipment Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Freeze-Dry Equipment Options</CardTitle>
                  <CardDescription>
                    Use shared guild chapter equipment or buy your own. Either way, you keep 83.3%.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Guild Pool Option */}
                    <div className="p-6 border-2 border-green-400 rounded-lg bg-green-50">
                      <Badge className="bg-green-600 text-white mb-2">Recommended to Start</Badge>
                      <h3 className="font-bold text-lg mb-2">Guild Chapter Pool</h3>
                      <div className="text-3xl font-bold text-green-700 mb-1">
                        C{FREEZE_DRY_EQUIPMENT.poolModel.costPerMember}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        per member ({FREEZE_DRY_EQUIPMENT.poolModel.membersPerPool} members split ${FREEZE_DRY_EQUIPMENT.recommended.models[1].price})
                      </div>
                      <ul className="text-sm space-y-1">
                        <li>• Rotating {FREEZE_DRY_EQUIPMENT.poolModel.usageSchedule}</li>
                        <li>• {FREEZE_DRY_EQUIPMENT.poolModel.monthlyCapacity}</li>
                        <li>• No upfront equipment purchase</li>
                      </ul>
                    </div>

                    {/* Own Equipment */}
                    <div className="p-6 border rounded-lg">
                      <Badge className="bg-gray-200 text-gray-700 mb-2">Scale Up</Badge>
                      <h3 className="font-bold text-lg mb-2">Your Own Equipment</h3>
                      <div className="space-y-2">
                        {FREEZE_DRY_EQUIPMENT.recommended.models.map((model) => (
                          <div key={model.name} className="flex justify-between items-center text-sm">
                            <span>{model.name} ({model.capacity})</span>
                            <span className="font-mono font-bold">${model.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-3">
                        VSL (Voucher Short Loans) available for equipment financing
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── TAB 4: JOBS ─── */}
          <TabsContent value="jobs">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-green-900 mb-2">6 Job Types. Start Tomorrow.</h2>
                <p className="text-lg text-gray-600">Every role pays 83.3% to the worker. Every role starts immediately.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {VERTICAL_INTEGRATION_JOBS.map((job, i) => (
                  <Card key={i} className="border-green-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{job.role}</CardTitle>
                        {job.immediateStart && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Start Now</Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">{job.initiative}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{job.description}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Requires:</span>
                          <span className="text-right">{job.requirements}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Earnings:</span>
                          <span className="font-semibold text-green-700">{job.earnings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Frequency:</span>
                          <span>{job.frequency}</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4 text-green-700 border-green-300 hover:bg-green-50">
                        Apply — As You Wish
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB 5: HOW IT WORKS ─── */}
          <TabsContent value="how-it-works">
            <div className="space-y-8">
              {/* Vertical Integration Diagram */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">The Vertical Integration</CardTitle>
                  <CardDescription>
                    Farm → Driver → Node → You. Every step is a cooperative member earning 83.3%.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { emoji: '🌾', title: 'FARMER', desc: 'Grows fresh produce with guaranteed demand', share: '83.3%' },
                      { emoji: '🚛', title: 'DRIVER', desc: 'Picks up from farms, delivers to nodes', share: '83.3%' },
                      { emoji: '📦', title: 'NODE', desc: 'Stores, freeze-dries, distributes', share: '83.3%' },
                      { emoji: '🏠', title: 'YOU', desc: 'Order in advance, pick up, just add water', share: '$5/serving' },
                    ].map((step, i) => (
                      <div key={i} className="text-center p-6 border rounded-lg relative">
                        <div className="text-4xl mb-2">{step.emoji}</div>
                        <div className="font-bold text-lg mb-1">{step.title}</div>
                        <div className="text-sm text-gray-600 mb-2">{step.desc}</div>
                        <Badge className="bg-green-100 text-green-800">{step.share}</Badge>
                        {i < 3 && (
                          <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-2xl text-green-500">→</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* The advance order loop */}
                  <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                    <div className="text-lg font-semibold text-amber-900 mb-2">
                      The Secret: ADVANCE ORDERS
                    </div>
                    <div className="text-sm text-amber-800">
                      You order → Farmer KNOWS what to grow → Zero waste → Lower prices → More farmers join → More variety → More orders
                    </div>
                    <div className="text-xs text-amber-600 mt-2">
                      This is why $5/serving works. Advance orders eliminate the waste that makes food expensive.
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Freeze-Dried Extension */}
              <Card>
                <CardHeader>
                  <CardTitle>The Freeze-Dried Extension</CardTitle>
                  <CardDescription>
                    Fresh farm produce → freeze-dried → meal kits → 25-year shelf life
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">What is Freeze-Drying?</h4>
                      <ul className="text-sm space-y-2 text-gray-700">
                        <li>• Removes 98% of water at -40°F under vacuum</li>
                        <li>• Preserves nutrition, color, texture, and flavor</li>
                        <li>• 25-year shelf life when properly sealed</li>
                        <li>• Just add water to reconstitute in minutes</li>
                        <li>• Lighter weight than canned (easier to store and ship)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Why Local Farm Produce?</h4>
                      <ul className="text-sm space-y-2 text-gray-700">
                        <li>• Fresher = better freeze-dried quality</li>
                        <li>• Shorter supply chain = less handling</li>
                        <li>• Supports your local farmers directly</li>
                        <li>• Organic options available</li>
                        <li>• You can trace every ingredient to the farm that grew it</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Initiative Connections */}
              <Card>
                <CardHeader>
                  <CardTitle>Connected Initiatives</CardTitle>
                  <CardDescription>
                    This system connects 7 of the Sweet Sixteen initiatives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(INITIATIVE_CONNECTIONS).map(([key, init]) => (
                      <div key={key} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">#{init.number}</Badge>
                          <span className="font-semibold text-sm">{init.name}</span>
                        </div>
                        <div className="text-xs text-gray-600">{init.role}</div>
                        <div className="text-xs text-green-600 mt-1">{init.connection}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MEAL KIT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const MealKitCard = ({
  kit,
  isSelected,
  onSelect,
}: {
  kit: FreezeDriedKit;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <Card
    className={`cursor-pointer transition-all hover:shadow-lg ${
      isSelected ? 'ring-2 ring-green-500 shadow-lg' : ''
    }`}
    onClick={onSelect}
  >
    <CardHeader>
      <div className="flex justify-between items-start">
        <CardTitle className="text-lg">{kit.name}</CardTitle>
        <Badge variant="outline" className="text-green-700 border-green-300">
          {kit.servings} servings
        </Badge>
      </div>
      <CardDescription>{kit.description}</CardDescription>
    </CardHeader>
    <CardContent>
      {/* Price Display */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold text-green-700">
          ${kit.pricing.advancePerKit.toFixed(2)}
        </span>
        <span className="text-sm text-gray-500">
          (${kit.pricing.advancePerServing.toFixed(2)}/serving)
        </span>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-4 mb-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span>⏱</span> {kit.cookTime}
        </div>
        <div className="flex items-center gap-1">
          <span>📅</span> {kit.shelfLife} shelf life
        </div>
        <div className="flex items-center gap-1">
          <span>⭐</span> {kit.difficulty}
        </div>
      </div>

      {/* Ingredients */}
      {isSelected && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Ingredients</h4>
          <div className="space-y-1">
            {kit.ingredients.map((ing, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span>
                  {ing.name}
                  {ing.source === 'local-farm' && (
                    <span className="text-green-600 ml-1">🌱 local farm</span>
                  )}
                </span>
                <span className="text-gray-500">{ing.weight}</span>
              </div>
            ))}
          </div>

          {/* Revenue Breakdown */}
          <div className="mt-4 pt-3 border-t text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Farmer revenue:</span>
              <span className="text-green-700">${kit.farmerRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Host revenue:</span>
              <span className="text-green-700">${kit.prepHostRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Distributor earns:</span>
              <span className="text-green-700">${kit.distributorMargin.toFixed(2)}/kit</span>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tiers */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-green-50 rounded text-xs">
          <div className="font-bold text-green-700">${kit.pricing.advancePerServing}</div>
          <div className="text-gray-500">advance</div>
        </div>
        <div className="p-2 bg-gray-50 rounded text-xs">
          <div className="font-bold">${kit.pricing.walkUpPerServing}</div>
          <div className="text-gray-500">walk-up</div>
        </div>
        <div className="p-2 bg-amber-50 rounded text-xs">
          <div className="font-bold text-amber-700">${kit.pricing.bulkPerServing}</div>
          <div className="text-gray-500">bulk</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default FarmerSupplyChainPage;
