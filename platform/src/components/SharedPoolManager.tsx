/**
 * SHARED POOL MANAGER — Keep & Tower Resource Sharing UI
 * ========================================================
 * Manages shared pool accounts for guild chapters and tribes.
 * Displays volume arbitrage benefits, member contributions,
 * and resource access levels.
 *
 * Variants:
 *   - dashboard: Full pool management view
 *   - compact:   Summary card for sidebar/profile
 *   - setup:     Pool creation wizard
 *
 * Innovation #1454 — Shared Pool Accounts
 * Innovation #1455 — Volume Arbitrage for Member Benefit
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Users, Zap, Shield, TrendingUp, DollarSign,
  Building2, Crown, Plus, ChevronRight,
  Check, AlertCircle, ArrowRight, Sparkles,
} from 'lucide-react';
import {
  type SharedPool,
  type PoolResource,
  type PoolMember,
  type PoolResourceTier,
  CLAUDE_AI_POOL,
  calculatePoolEconomics,
  calculateOptimalPoolSize,
  TRIBE_MINIMUM_MEMBERS,
} from '@/lib/sharedPoolAccounts';
import { CurrencyGlyph } from '@/components/CreditSymbol';

// ============================================================================
// TYPES
// ============================================================================

interface SharedPoolManagerProps {
  /** Display variant */
  variant?: 'dashboard' | 'compact' | 'setup';
  /** Existing pools for this chapter/tribe */
  pools?: SharedPool[];
  /** Current user's member info */
  currentUserId?: string;
  /** Chapter/tribe name */
  groupName?: string;
  /** Member count in the group */
  memberCount?: number;
  /** Callback when pool action is taken */
  onAction?: (action: string, data: unknown) => void;
  /** Optional className */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SharedPoolManager({
  variant = 'dashboard',
  pools = [],
  currentUserId,
  groupName = 'Your Chapter',
  memberCount = 10,
  onAction,
  className = '',
}: SharedPoolManagerProps) {
  const [selectedResource, setSelectedResource] = useState<string>('claude-ai');
  const [customMemberCount, setCustomMemberCount] = useState(memberCount);

  if (variant === 'compact') {
    return <CompactView pools={pools} groupName={groupName} className={className} />;
  }

  if (variant === 'setup') {
    return (
      <SetupWizard
        memberCount={customMemberCount}
        groupName={groupName}
        onAction={onAction}
        className={className}
      />
    );
  }

  // Dashboard variant
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Shared Pool — {groupName}
          </CardTitle>
          <CardDescription>
            Volume arbitrage: same price, better access. Pool resources across your chapter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold">{pools.length}</div>
              <div className="text-xs text-muted-foreground">Active Pools</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold">{memberCount}</div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                <CurrencyGlyph type="credit" size={16} />
                {pools.reduce((sum, p) => {
                  const perMember = p.monthlyPoolCost / Math.max(p.members.length, 1);
                  return sum + perMember;
                }, 0).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">Monthly Rent</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volume Arbitrage Explainer */}
      <VolumeArbitrageCard memberCount={memberCount} />

      {/* Claude AI Pool Demo */}
      <PoolResourceCard
        resource={CLAUDE_AI_POOL}
        memberCount={memberCount}
        isActive={pools.some(p => p.resource.id === 'claude-ai')}
      />

      {/* Pool Economics Calculator */}
      <EconomicsCalculator memberCount={memberCount} />

      {/* Active Pools */}
      {pools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Active Pools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pools.map(pool => (
              <ActivePoolRow key={pool.id} pool={pool} currentUserId={currentUserId} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* What Can Be Pooled */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-500" />
            What Can Be Pooled?
          </CardTitle>
          <CardDescription>
            Any resource with tiered pricing benefits from volume arbitrage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PoolableCategory
              icon="🤖"
              name="AI Tools"
              examples="Claude, GPT, Gemini, Perplexity"
              savings="2-5x usage boost"
            />
            <PoolableCategory
              icon="🎨"
              name="Software Licenses"
              examples="Adobe, Figma, Canva Pro"
              savings="40-60% savings"
            />
            <PoolableCategory
              icon="🔧"
              name="Physical Resources"
              examples="3D printers, workshop, equipment"
              savings="Shared access vs. ownership"
            />
            <PoolableCategory
              icon="⚖️"
              name="Professional Services"
              examples="Legal, accounting, shipping"
              savings="Volume rates for all"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function VolumeArbitrageCard({ memberCount }: { memberCount: number }) {
  const economics = calculatePoolEconomics(200, 100, memberCount, 20);

  return (
    <Card className="border-2 border-indigo-500/30 bg-indigo-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          The Volume Arbitrage Principle
        </CardTitle>
        <CardDescription>
          Same price. Better access. Everyone wins.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Individual */}
          <div className="p-4 rounded-lg bg-muted/30 border">
            <div className="text-xs font-semibold text-muted-foreground mb-2">INDIVIDUAL</div>
            <div className="text-2xl font-bold">$20<span className="text-sm font-normal">/mo</span></div>
            <div className="text-sm text-muted-foreground">Pro plan (1x usage)</div>
            <div className="mt-2 text-xs">
              <div className="flex justify-between">
                <span>Usage multiplier</span>
                <span className="font-medium">5x free</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="w-6 h-6 text-indigo-500 hidden md:block" />
              <Badge variant="secondary" className="text-[10px]">Pool it</Badge>
            </div>
          </div>

          {/* Pooled */}
          <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
            <div className="text-xs font-semibold text-indigo-500 mb-2">POOLED ({memberCount} MEMBERS)</div>
            <div className="text-2xl font-bold text-indigo-600">
              ${economics.costPerMember.toFixed(0)}<span className="text-sm font-normal">/mo</span>
            </div>
            <div className="text-sm text-indigo-500 font-medium">
              {economics.usageBoostVsIndividual} Pro equivalent!
            </div>
            <div className="mt-2 text-xs">
              <div className="flex justify-between">
                <span>Usage multiplier</span>
                <span className="font-medium">{economics.multiplierPerMember}x free</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Each member pays <strong>the same $20</strong> they'd pay for Pro,
          but gets <strong>{economics.usageBoostVsIndividual} the usage</strong> because
          LB buys the Ultra tier and splits it across the chapter.
        </div>

        {/* The Killshot Quote */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <blockquote className="text-sm font-medium italic text-center">
            "At <CurrencyGlyph type="credit" size={14} />20 per pool, a member in 4 pools
            pays <CurrencyGlyph type="credit" size={14} />80/month but gets 4x what they'd
            have individually. With strangers, even. The pool doesn't care WHO is in it,
            just that the economics work."
          </blockquote>
          <div className="text-xs text-muted-foreground text-center mt-2">
            Join a guild chapter, a tribe, a project, or go lone wolf — up to 4 pools at once.
          </div>
        </div>

        <div className="flex justify-center gap-3 flex-wrap">
          <Badge variant="outline">
            <Check className="w-3 h-3 mr-1" />
            Members win: more usage
          </Badge>
          <Badge variant="outline">
            <Check className="w-3 h-3 mr-1" />
            LB wins: member retention
          </Badge>
          <Badge variant="outline">
            <Check className="w-3 h-3 mr-1" />
            Provider wins: guaranteed seats
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function PoolResourceCard({
  resource,
  memberCount,
  isActive,
}: {
  resource: PoolResource;
  memberCount: number;
  isActive: boolean;
}) {
  const activeTier = resource.tiers.find(t => t.tier === resource.activeTier);
  if (!activeTier) return null;

  const economics = calculatePoolEconomics(
    activeTier.monthlyCost,
    activeTier.usageMultiplier,
    memberCount,
    activeTier.individualEquivalent,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {resource.iconUrl && <img src={resource.iconUrl} className="w-5 h-5" alt={resource.name} />}
            {resource.name}
            <Badge variant="secondary" className="text-[10px]">{resource.provider}</Badge>
          </CardTitle>
          {isActive && (
            <Badge className="bg-green-500/20 text-green-600">
              <Check className="w-3 h-3 mr-1" /> Active
            </Badge>
          )}
        </div>
        <CardDescription>
          Pooled {resource.activeTier} tier across {memberCount} chapter members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tier comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {resource.tiers.filter(t => t.tier !== 'enterprise').map(tier => {
              const isActive = tier.tier === resource.activeTier;
              return (
                <div
                  key={tier.tier}
                  className={`p-3 rounded-lg border text-center ${
                    isActive
                      ? 'border-indigo-500/50 bg-indigo-500/5'
                      : 'bg-muted/20'
                  }`}
                >
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1">
                    {tier.tier}
                    {isActive && ' ✓'}
                  </div>
                  <div className="text-lg font-bold">${tier.monthlyCost}/mo</div>
                  <div className="text-xs text-muted-foreground">{tier.usageMultiplier}x free usage</div>
                  {isActive && (
                    <div className="text-xs text-indigo-500 font-medium mt-1">
                      = ${(tier.monthlyCost / memberCount).toFixed(0)}/member
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Member benefit breakdown */}
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="text-sm font-medium mb-2">Per Member Breakdown</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">Monthly cost</div>
                <div className="font-medium text-base">${economics.costPerMember}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Usage multiplier</div>
                <div className="font-medium text-base">{economics.multiplierPerMember}x free</div>
              </div>
              <div>
                <div className="text-muted-foreground">vs. Individual Pro</div>
                <div className="font-medium text-base text-green-500">
                  {economics.usageBoostVsIndividual} better
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Pool viable?</div>
                <div className={`font-medium text-base ${economics.isViable ? 'text-green-500' : 'text-red-500'}`}>
                  {economics.isViable ? '✓ Yes' : '✗ No'}
                </div>
              </div>
            </div>
          </div>

          {!isActive && (
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Set Up {resource.name} Pool
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EconomicsCalculator({ memberCount: defaultCount }: { memberCount: number }) {
  const [members, setMembers] = useState(defaultCount);
  const economics = calculatePoolEconomics(200, 100, members, 20);
  const optimalSize = calculateOptimalPoolSize(100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-4 h-4 text-green-500" />
          Pool Economics Calculator
        </CardTitle>
        <CardDescription>
          Slide to see how member count affects the deal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium min-w-[80px]">Members:</label>
          <input
            type="range"
            min={TRIBE_MINIMUM_MEMBERS}
            max={30}
            value={members}
            onChange={(e) => setMembers(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-lg font-bold min-w-[30px] text-right">{members}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <div className="text-xs text-muted-foreground">Cost/Member</div>
            <div className="text-lg font-bold">${economics.costPerMember}</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <div className="text-xs text-muted-foreground">Usage Each</div>
            <div className="text-lg font-bold">{economics.multiplierPerMember}x</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <div className="text-xs text-muted-foreground">vs. Pro</div>
            <div className="text-lg font-bold text-green-500">{economics.usageBoostVsIndividual}</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <div className="text-xs text-muted-foreground">Pool Viable?</div>
            <div className={`text-lg font-bold ${economics.isViable ? 'text-green-500' : 'text-red-500'}`}>
              {economics.isViable ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Optimal pool size: {optimalSize} members (each gets 1x Pro equivalent).
          Sweet spot: {Math.floor(optimalSize / 2)} members (each gets 2x Pro).
        </div>

        {members <= 5 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-medium">Small pool bonus: </span>
              With only {members} members, each gets {economics.multiplierPerMember}x free usage —
              that's {economics.usageBoostVsIndividual} what Pro gives individually!
              Even a tribe of 2 benefits from pooling.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivePoolRow({
  pool,
  currentUserId,
}: {
  pool: SharedPool;
  currentUserId?: string;
}) {
  const member = pool.members.find(m => m.userId === currentUserId);
  const usagePercent = member ? (member.currentUsage / Math.max(member.maxUsage, 1)) * 100 : 0;

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {pool.resource.type === 'ai-tool' ? '🤖' :
             pool.resource.type === 'software' ? '🎨' :
             pool.resource.type === 'physical' ? '🔧' : '📦'}
          </span>
          <div>
            <div className="font-medium text-sm">{pool.resource.name}</div>
            <div className="text-xs text-muted-foreground">{pool.resource.provider}</div>
          </div>
        </div>
        <Badge variant={pool.isActive ? 'default' : 'secondary'}>
          {pool.isActive ? 'Active' : 'Paused'}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
        <div>
          <div className="text-muted-foreground">Members</div>
          <div className="font-medium">{pool.members.filter(m => m.status === 'active').length}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Pool Cost</div>
          <div className="font-medium">${pool.monthlyPoolCost}/mo</div>
        </div>
        <div>
          <div className="text-muted-foreground">Your Share</div>
          <div className="font-medium">
            ${member?.monthlyContribution || (pool.monthlyPoolCost / pool.members.length).toFixed(0)}/mo
          </div>
        </div>
      </div>

      {member && (
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Usage this period</span>
            <span>{usagePercent.toFixed(0)}%</span>
          </div>
          <Progress value={usagePercent} className="h-1.5" />
        </div>
      )}
    </div>
  );
}

function CompactView({
  pools,
  groupName,
  className,
}: {
  pools: SharedPool[];
  groupName: string;
  className: string;
}) {
  const totalRent = pools.reduce((sum, p) => {
    return sum + (p.monthlyPoolCost / Math.max(p.members.length, 1));
  }, 0);

  return (
    <Card className={className}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <div>
              <div className="text-sm font-medium">Pool Rent</div>
              <div className="text-xs text-muted-foreground">{groupName}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold flex items-center gap-1">
              <CurrencyGlyph type="credit" size={14} />
              {totalRent.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">/month</div>
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          {pools.map(pool => (
            <Badge key={pool.id} variant="outline" className="text-[10px]">
              {pool.resource.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SetupWizard({
  memberCount,
  groupName,
  onAction,
  className,
}: {
  memberCount: number;
  groupName: string;
  onAction?: (action: string, data: unknown) => void;
  className: string;
}) {
  const [step, setStep] = useState(1);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-green-500" />
          Set Up Shared Pool
        </CardTitle>
        <CardDescription>
          Step {step} of 3 — Configure resource sharing for {groupName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Select resource to pool:</div>
            <div className="space-y-2">
              {[
                { id: 'claude-ai', name: 'Claude AI', icon: '🤖', provider: 'Anthropic' },
                { id: 'chatgpt', name: 'ChatGPT Plus', icon: '🧠', provider: 'OpenAI' },
                { id: 'figma', name: 'Figma Pro', icon: '🎨', provider: 'Figma' },
                { id: 'custom', name: 'Custom Resource', icon: '📦', provider: 'Other' },
              ].map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                  onClick={() => setStep(2)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.provider}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Configure pool economics:</div>
            <VolumeArbitrageCard memberCount={memberCount} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-center py-4">
            <div className="text-4xl">✓</div>
            <div className="text-lg font-medium">Pool Ready to Launch</div>
            <div className="text-sm text-muted-foreground">
              {memberCount} members × $20/month = ${memberCount * 20} pool revenue
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onAction?.('create-pool', { resource: 'claude-ai', memberCount })}
              >
                Launch Pool
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PoolableCategory({
  icon,
  name,
  examples,
  savings,
}: {
  icon: string;
  name: string;
  examples: string;
  savings: string;
}) {
  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="font-medium text-sm">{name}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-1">{examples}</div>
      <Badge variant="outline" className="text-[10px]">
        <TrendingUp className="w-3 h-3 mr-1" />
        {savings}
      </Badge>
    </div>
  );
}

export default SharedPoolManager;
