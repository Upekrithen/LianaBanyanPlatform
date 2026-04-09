import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator, Users, Scale, Shield, Plus, Briefcase, Megaphone,
  Cog, Globe, HeartPulse, Palette, Wrench, BookOpen, Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PortalPageLayout } from '@/components/PortalPageLayout';

type PositionTier = 'c_suite' | 'workshop_crew' | 'guild_staff' | 'operations';

interface LBPosition {
  category: string;
  title: string;
  description: string;
  icon: any;
  priority: 'critical' | 'high' | 'medium';
  tier: PositionTier;
  typicalCompensation: string;
  /** Marks-based compensation (contribution records, not ownership claims) */
  marksCompensation?: string;
  /** Guild affiliation — which guild this role naturally aligns with */
  guildAffiliation?: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
  desiredQualifications: string[];
}

const lbInternalPositions: LBPosition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // C-SUITE — Corporate leadership, sought through The Handshake Protocol
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: 'steward_owner',
    title: 'Chief of Staff',
    description: 'Right hand to the Founder. Runs daily operations so the Founder can focus on building. The bridge needs its first officer.',
    icon: Building2,
    priority: 'critical',
    tier: 'c_suite',
    typicalCompensation: 'Marks-based + participation',
    marksCompensation: '500 Marks/month + 3-5% participation',
    guildAffiliation: 'The Quarterdeck',
    keyResponsibilities: [
      'Manage daily operations across all 16 initiatives',
      'Coordinate between guilds and ensure cross-guild alignment',
      'Represent the Founder in meetings and partner conversations',
      'Oversee Node network operations and coordination',
      'Drive hiring pipeline for all C-Suite and guild positions',
      'Steward Council liaison and governance coordination',
      'Manage the Workshop Crew and delegate task assignments',
    ],
    requiredSkills: [
      'Executive operations experience (COO/Chief of Staff)',
      'Multi-project coordination',
      'People management across distributed teams',
      'Strategic planning and prioritization',
      'Communication — clear, direct, no corporate speak',
    ],
    desiredQualifications: [
      'Military or cooperative organization leadership',
      'Experience with startup or early-stage operations',
      'Manufacturing or production management background',
      'Comfort with Marks-based compensation model',
    ],
  },
  {
    category: 'accounting_services',
    title: 'Chief Financial Officer (CFO)',
    description: 'Strategic financial leadership. Three-currency system (Credits, Marks, Joules). Cost+20% economics. 83.3% to creators.',
    icon: Calculator,
    priority: 'critical',
    tier: 'c_suite',
    typicalCompensation: 'Marks-based + participation',
    marksCompensation: '400 Marks/month + 2-5% participation',
    guildAffiliation: 'The Ledger',
    keyResponsibilities: [
      'Architect and maintain the three-currency system',
      'Ensure Cost+20% pricing compliance across all Nodes',
      'Financial forecasting, budgeting, and resource allocation',
      'Banking relationships and capital structure management',
      'Oversee transparent ledger reporting',
      'Treasury management for Credits, Marks, and Joules pools',
      'Coordinate with CPA on tax strategy and compliance',
      'VSL (Voucher Short Loans) fund management',
    ],
    requiredSkills: [
      'CFO or senior finance leadership experience',
      'Financial modeling and analysis',
      'Cooperative or member-owned structure experience',
      'Multi-currency or internal-token economics',
      'GAAP compliance',
    ],
    desiredQualifications: [
      'CPA or MBA',
      'Crowdfunding platform financial management',
      'Manufacturing business finance experience',
      'Understanding of Marks-based contribution systems',
    ],
  },
  {
    category: 'legal_services',
    title: 'General Counsel',
    description: 'Primary legal architect. Defense Klaus fund. IP protection for 2,097 patent claims. Harper Guild ethics oversight.',
    icon: Scale,
    priority: 'critical',
    tier: 'c_suite',
    typicalCompensation: 'Marks-based + participation',
    marksCompensation: '400 Marks/month + 1-4% participation',
    guildAffiliation: 'The Scale',
    keyResponsibilities: [
      'Design legal framework for cooperative operations',
      'Manage Defense Klaus legal protection fund',
      'IP strategy for 2,097 patent claims across multiple provisionals',
      'Review and draft all major contracts and member agreements',
      'Securities compliance — ensure Marks are not classified as securities',
      'Regulatory compliance (crowdfunding, financial, cooperative law)',
      'Harper Guild coordination — ethics oversight integration',
      'Dispute resolution and litigation management',
    ],
    requiredSkills: [
      'Licensed attorney (multiple states preferred)',
      'Business law and entity formation expertise',
      'Securities law knowledge',
      'IP law (utility patents, provisionals, micro-entity)',
      'Contract drafting and negotiation',
    ],
    desiredQualifications: [
      'Cooperative or member organization legal expertise',
      'Crowdfunding platform regulatory experience',
      'Manufacturing and product liability knowledge',
      'Experience with legal defense funds or mutual aid',
    ],
  },
  {
    category: 'marketing_services',
    title: 'Chief Marketing Officer (CMO)',
    description: 'Lead all outreach, social media, and brand positioning. Hofund Studio campaigns. Herald subscriptions. Community growth.',
    icon: Megaphone,
    priority: 'high',
    tier: 'c_suite',
    typicalCompensation: 'Marks-based + participation',
    marksCompensation: '350 Marks/month + 2-4% participation',
    guildAffiliation: 'The Quarterdeck',
    keyResponsibilities: [
      'Brand strategy and positioning across all platforms',
      'Oversee Hofund Studio cue card campaigns and social dispatches',
      'Herald subscription growth and content strategy',
      'Community growth — member acquisition and retention',
      'Media Blitz campaign coordination and scheduling',
      'Cue Card performance tracking and optimization',
      'Outreach to potential guild partners and collaborators',
      'Press relations and public communications',
    ],
    requiredSkills: [
      'Marketing leadership (CMO/VP Marketing experience)',
      'Social media strategy and execution',
      'Content creation and brand voice development',
      'Community building and engagement',
      'Analytics and campaign optimization',
    ],
    desiredQualifications: [
      'Experience marketing cooperative or mission-driven organizations',
      'TikTok and short-form video marketing expertise',
      'Understanding of Cost+20% transparent messaging',
      'Crowdfunding or platform launch marketing experience',
    ],
  },
  {
    category: 'it_services',
    title: 'Chief Technology Officer (CTO)',
    description: 'Platform architecture. React/Vite/Supabase stack. 8 Firebase hosting targets. AI agent coordination (Bishop, Knight, Rook, Pawn).',
    icon: Cog,
    priority: 'high',
    tier: 'c_suite',
    typicalCompensation: 'Marks-based + participation',
    marksCompensation: '400 Marks/month + 3-5% participation',
    guildAffiliation: "The Crow's Nest",
    keyResponsibilities: [
      'Platform architecture and technical roadmap',
      'Oversee React/TypeScript/Supabase/Firebase stack',
      'AI agent coordination (Bishop, Knight, Rook, Pawn)',
      'DevOps — CI/CD pipelines, deployment, monitoring',
      'Security — RLS policies, API key management, auth flows',
      'HexIsle technical systems (3D world, overworld, CAD pipeline)',
      'Scalability planning as membership grows',
      'Technical debt management and code quality standards',
    ],
    requiredSkills: [
      'Full-stack development (React, TypeScript, Node.js)',
      'Cloud infrastructure (Firebase, Supabase, or equivalent)',
      'Database architecture and security (Row Level Security)',
      'AI/ML integration and prompt engineering',
      'DevOps and deployment automation',
    ],
    desiredQualifications: [
      'Three.js / React Three Fiber experience (for HexIsle)',
      'Cooperative platform or marketplace development',
      'PWA and mobile-first development',
      'CAD/CAM software integration experience',
    ],
  },
  {
    category: 'hr_staffing',
    title: 'Chief People Officer (CPO)',
    description: 'Lead people strategy — guild membership, member contracts, Handshake Protocol coordination, reputation system.',
    icon: Users,
    priority: 'high',
    tier: 'c_suite',
    typicalCompensation: 'Marks-based + participation',
    marksCompensation: '350 Marks/month + 1-3% participation',
    guildAffiliation: 'The Quarterdeck',
    keyResponsibilities: [
      'Design guild membership and self-selection systems',
      'Coordinate The Handshake Protocol for all guild recruiting',
      'Member onboarding experience and retention strategy',
      'Contract position system oversight and compensation frameworks',
      'Reputation system integration with hiring and advancement',
      'Member relations, dispute resolution, and guild mediation',
      'Diversity, access, and inclusion — 20% free slots enforcement',
      'Ghost-to-member conversion pathway optimization',
    ],
    requiredSkills: [
      'HR leadership (CHRO/VP People experience)',
      'Contract and participation-based compensation',
      'Employee/member relations and conflict resolution',
      'Organizational design for distributed teams',
      'Compliance (labor law, cooperative regulations)',
    ],
    desiredQualifications: [
      'Cooperative or guild structure experience',
      'Gig economy / contractor management',
      'Military or volunteer organization HR',
      'Understanding of Marks-based contribution tracking',
    ],
  },
  {
    category: 'steward_owner',
    title: 'Executive Steward (Board Member)',
    description: 'Governance and strategic oversight. Steward Council seat. Member representation.',
    icon: Shield,
    priority: 'medium',
    tier: 'c_suite',
    typicalCompensation: 'Board stipend + 0.5-2% participation',
    marksCompensation: '100 Marks/month',
    guildAffiliation: 'The Quarterdeck',
    keyResponsibilities: [
      'Strategic direction and long-term planning',
      'Oversight of executive team and C-Suite',
      'Financial and operational oversight',
      'Risk management and crisis response',
      'Member representation on the Steward Council',
      'Major decision approval (budget, partnerships, IP)',
    ],
    requiredSkills: [
      'Board or executive leadership experience',
      'Strategic planning and governance',
      'Financial literacy and audit oversight',
      'Reputation score 4.5+ / Sun level preferred',
    ],
    desiredQualifications: [
      'Cooperative or member organization governance',
      'Manufacturing or technology sector board experience',
      'Guild representative or elected leadership background',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKSHOP CREW — Operational staff that keeps the machine running
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: 'accounting_services',
    title: 'Certified Public Accountant (CPA)',
    description: 'Primary accountant — books, tax filings, financial compliance. Works with CFO.',
    icon: Calculator,
    priority: 'critical',
    tier: 'workshop_crew',
    typicalCompensation: '$75-150/hr or Marks equivalent',
    marksCompensation: '200 Marks/month',
    guildAffiliation: 'The Ledger',
    keyResponsibilities: [
      'Maintain accurate books and records for LB operations',
      'Prepare and file all tax returns (corporate, sales, payroll)',
      'Ensure GAAP compliance for all financial statements',
      'Advise on tax strategy and entity structure',
      'Coordinate with CFO on financial reporting',
      'Manage relationships with IRS and state tax authorities',
    ],
    requiredSkills: [
      'Active CPA license',
      'Multi-entity structure experience',
      'Crowdfunding/participation accounting',
      'Tax strategy expertise',
      'GAAP/IFRS proficiency',
    ],
    desiredQualifications: [
      'Cooperative or guild structure accounting',
      'Verified ledger accounting',
      'Manufacturing business accounting',
      'Multi-state tax experience',
    ],
  },
  {
    category: 'it_services',
    title: 'Platform Engineer',
    description: 'Full-stack development. React/TypeScript. Supabase/Firebase. Feature implementation and bug resolution.',
    icon: Cog,
    priority: 'high',
    tier: 'workshop_crew',
    typicalCompensation: 'Marks-based + per-bounty Credits',
    marksCompensation: '150 Marks/month + bounty earnings',
    guildAffiliation: "The Crow's Nest",
    keyResponsibilities: [
      'Implement new features as specified by CTO and product roadmap',
      'Fix bugs and resolve technical debt',
      'Write and maintain tests for critical paths',
      'Review code from AI agents (Bishop, Knight) and other contributors',
      'Database migration authoring and deployment',
      'Performance optimization and monitoring',
    ],
    requiredSkills: [
      'React, TypeScript, Vite',
      'Supabase (PostgreSQL, Row Level Security, Edge Functions)',
      'Firebase hosting and deployment',
      'Git workflow and code review',
    ],
    desiredQualifications: [
      'Three.js / React Three Fiber (for HexIsle)',
      'PWA development experience',
      'Stripe/payment integration',
      'AI-assisted development workflows',
    ],
  },
  {
    category: 'marketing_services',
    title: 'Social Media Manager',
    description: 'Daily social presence. Hofund campaign execution. Cue card scheduling. Herald content creation.',
    icon: Megaphone,
    priority: 'high',
    tier: 'workshop_crew',
    typicalCompensation: 'Marks-based + per-campaign Credits',
    marksCompensation: '100 Marks/month + campaign bonuses',
    guildAffiliation: 'The Quarterdeck',
    keyResponsibilities: [
      'Execute daily social media posting schedule',
      'Create and dispatch cue card campaigns via Hofund Studio',
      'Monitor engagement and respond to community',
      'Coordinate Media Blitz campaigns',
      'Produce Herald newsletter content',
      'Track social metrics and report to CMO',
    ],
    requiredSkills: [
      'Social media management (TikTok, X, LinkedIn, Instagram)',
      'Content creation (copy, basic graphics)',
      'Scheduling tools and analytics',
      'Community engagement',
    ],
    desiredQualifications: [
      'Video production for short-form content',
      'Experience with cooperative or mission-driven brands',
      'Canva, Figma, or design tool proficiency',
    ],
  },
  {
    category: 'create_idea',
    title: 'Creative Director',
    description: 'Visual identity, design systems, brand consistency across all initiatives. Art direction for HexIsle and physical products.',
    icon: Palette,
    priority: 'high',
    tier: 'workshop_crew',
    typicalCompensation: 'Marks-based + participation',
    marksCompensation: '200 Marks/month + 1-2% participation',
    guildAffiliation: 'The Forge',
    keyResponsibilities: [
      'Maintain visual identity and brand consistency',
      'Art direction for HexIsle terrain, cards, and UI',
      'Design system management (shadcn/ui customization)',
      'Physical product design (Hexel packaging, bracelets, coasters)',
      'Gate Artwork bounty oversight and art approval',
      'Coordinate with Workshop Crew on design deliverables',
    ],
    requiredSkills: [
      'Visual design and art direction',
      'Brand identity systems',
      'UI/UX design (Figma, design tokens)',
      'Print and physical product design',
    ],
    desiredQualifications: [
      '3D modeling or CAD experience',
      'Game asset design (tabletop/board game)',
      'Typography and layout expertise',
      'Animation or motion design',
    ],
  },
  {
    category: 'manufacture_assembly',
    title: 'Manufacturing Coordinator',
    description: 'Manage Node manufacturing network. Quality control. Supply chain. 3D printing operations.',
    icon: Wrench,
    priority: 'high',
    tier: 'workshop_crew',
    typicalCompensation: 'Marks-based + per-unit production Credits',
    marksCompensation: '150 Marks/month + production bonuses',
    guildAffiliation: 'The Engine Room',
    keyResponsibilities: [
      'Coordinate decentralized manufacturing across Nodes',
      'Quality control standards and inspection protocols',
      'Supply chain management for raw materials',
      '3D printing operations — FDM, resin, SLS',
      'Production scheduling and capacity planning',
      'Cost+20% pricing verification for manufactured goods',
    ],
    requiredSkills: [
      'Manufacturing operations management',
      '3D printing (FDM, resin at minimum)',
      'Quality control and inspection',
      'Supply chain logistics',
    ],
    desiredQualifications: [
      'Injection molding or CNC experience',
      'ISO quality management systems',
      'Cooperative or distributed manufacturing',
      'Hexel/hex terrain production knowledge',
    ],
  },
  {
    category: 'define_describe_document',
    title: 'Documentation Lead',
    description: 'Technical writing. Process documentation. Cephas knowledge base. Academic paper formatting.',
    icon: BookOpen,
    priority: 'medium',
    tier: 'workshop_crew',
    typicalCompensation: 'Marks-based + per-document Credits',
    marksCompensation: '100 Marks/month + per-document bonuses',
    guildAffiliation: "The Crow's Nest",
    keyResponsibilities: [
      'Maintain Cephas knowledge base and documentation',
      'Format and publish academic papers',
      'Process documentation for all operational workflows',
      'Patent application drafting support (micro-entity filings)',
      'Member-facing help documentation and tutorials',
      'Coordinate documentation across all 16 initiatives',
    ],
    requiredSkills: [
      'Technical writing and documentation',
      'Markdown, Hugo, or static site content management',
      'Process documentation and workflow mapping',
      'Attention to detail and consistency',
    ],
    desiredQualifications: [
      'Academic paper formatting (APA, IEEE)',
      'Patent specification writing',
      'Video tutorial production',
      'Multi-language documentation experience',
    ],
  },
  {
    category: 'logistics_blockchain',
    title: 'Node Operations Manager',
    description: 'Manage the decentralized Node network. Onboard new Nodes. Enforce Cost+20% compliance.',
    icon: Globe,
    priority: 'medium',
    tier: 'workshop_crew',
    typicalCompensation: 'Marks-based + Node commission',
    marksCompensation: '150 Marks/month + Node activation bonuses',
    guildAffiliation: 'The Engine Room',
    keyResponsibilities: [
      'Onboard and activate new manufacturing/service Nodes',
      'Enforce Cost+20% pricing across all Node operations',
      'Monitor Node performance and member satisfaction',
      'Coordinate inter-Node logistics and transfers',
      'Transparent ledger verification for Node transactions',
      'Node dispute resolution and quality escalation',
    ],
    requiredSkills: [
      'Operations management or logistics',
      'Quality assurance and compliance monitoring',
      'Distributed team coordination',
      'Data analysis and reporting',
    ],
    desiredQualifications: [
      'Franchise or distributed operations experience',
      'Supply chain management',
      'Cooperative or co-op network management',
      'Transparent ledger experience',
    ],
  },
  {
    category: 'hr_staffing',
    title: 'Community Steward',
    description: 'Member support and onboarding. Ghost-to-member conversion. Guild orientation. Dispute mediation.',
    icon: HeartPulse,
    priority: 'medium',
    tier: 'workshop_crew',
    typicalCompensation: 'Marks-based',
    marksCompensation: '75 Marks/month',
    guildAffiliation: 'The Quarterdeck',
    keyResponsibilities: [
      'Welcome and onboard new members through seamless flow',
      'Guide Ghosts toward membership conversion',
      'Orient new members to guild self-selection',
      'Mediate member disputes and escalate to CPO when needed',
      'Monitor community health and engagement metrics',
      'Manage 20% free slot program — identify and support qualifying members',
    ],
    requiredSkills: [
      'Community management or customer support',
      'Empathy and conflict resolution',
      'Clear written and verbal communication',
      'Familiarity with cooperative principles',
    ],
    desiredQualifications: [
      'Experience with online community platforms',
      'Volunteer coordination or nonprofit operations',
      'Multilingual communication ability',
      'Understanding of Ghost mode and progressive disclosure',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GUILD STAFF — Positions that serve specific guild functions
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: 'research_development',
    title: 'Patent Filing Specialist',
    description: 'Provisional patent applications. Micro-entity filings ($65 each). 2,097 claims across 11 provisional applications.',
    icon: BookOpen,
    priority: 'high',
    tier: 'guild_staff',
    typicalCompensation: 'Marks per filing + Credits',
    marksCompensation: '25 Marks per provisional + Credits per filing',
    guildAffiliation: "The Crow's Nest",
    keyResponsibilities: [
      'Draft provisional patent applications from innovation descriptions',
      'File micro-entity patents ($65 per filing)',
      'Maintain patent portfolio tracking and renewal calendar',
      'Coordinate with General Counsel on IP strategy',
      'Organize claims across provisional bags',
      'Prior art research and freedom-to-operate analysis',
    ],
    requiredSkills: [
      'Patent application drafting',
      'USPTO filing procedures',
      'Technical writing for patent claims',
      'Prior art research',
    ],
    desiredQualifications: [
      'Patent agent or registered patent practitioner',
      'Mechanical engineering or manufacturing background',
      'Experience with micro-entity filings',
      'CAD/design patent illustration',
    ],
  },
  {
    category: 'legal_services',
    title: 'Defense Klaus Attorney',
    description: 'Member legal defense. $6 bracelet fund. Attorney network coordination. Harper Guild liaison.',
    icon: Shield,
    priority: 'high',
    tier: 'guild_staff',
    typicalCompensation: 'Competitive attorney rates + Marks',
    marksCompensation: '50 Marks per case + standard attorney compensation',
    guildAffiliation: 'The Scale',
    keyResponsibilities: [
      'Provide legal defense for Defense Klaus bracelet holders',
      'Manage case intake and triage from member requests',
      'Coordinate with attorney network for specialized cases',
      'Track Defense Klaus fund allocation and expenditures',
      'Report to General Counsel on case outcomes and trends',
      'Harper Guild liaison — ethics review coordination',
    ],
    requiredSkills: [
      'Active bar license',
      'Litigation or defense practice experience',
      'Case management and client communication',
      'Legal research and brief writing',
    ],
    desiredQualifications: [
      'Pro bono or legal aid experience',
      'Consumer protection law',
      'Employment law or civil rights',
      'Cooperative or mutual aid legal structures',
    ],
  },
  {
    category: 'prototype',
    title: 'CAD/CAM Technician',
    description: 'Hexel part design. Fusion 360. STL generation. Production-ready modeling for the Forge guild.',
    icon: Wrench,
    priority: 'high',
    tier: 'guild_staff',
    typicalCompensation: 'Marks per part + production Credits',
    marksCompensation: '20 Marks per completed part design',
    guildAffiliation: 'The Forge',
    keyResponsibilities: [
      'Design Hexel parts in Fusion 360 following the Piece Grammar',
      'Generate production-ready STL files for 3D printing',
      'Ensure dimensional accuracy (60mm flat-to-flat standard)',
      'Create assembly documentation for multi-part builds',
      'Test and validate printability across FDM and resin',
      'Coordinate with Manufacturing Coordinator on production specs',
    ],
    requiredSkills: [
      'Fusion 360 or equivalent parametric CAD',
      '3D printing design for manufacturing (DFM)',
      'Mechanical tolerance and fit knowledge',
      'STL/3MF file preparation',
    ],
    desiredQualifications: [
      'Hex terrain or tabletop gaming design experience',
      'Injection molding design knowledge',
      'GD&T proficiency',
      'Multi-material design experience',
    ],
  },
];

export default function LBInternalPositions() {
  const navigate = useNavigate();

  const { data: existingPositions } = useQuery({
    queryKey: ['lb-internal-positions'],
    queryFn: async () => {
      // Query for positions where project_id is null (LB internal) or project is LB
      const { data, error } = await supabase
        .from('contract_position_templates')
        .select(`
          *,
          applications:position_applications(count),
          assignments:position_assignments(count)
        `)
        .is('project_id', null) // LB internal positions
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const cSuitePositions = lbInternalPositions.filter(p => p.tier === 'c_suite');
  const workshopPositions = lbInternalPositions.filter(p => p.tier === 'workshop_crew');
  const guildStaffPositions = lbInternalPositions.filter(p => p.tier === 'guild_staff');

  return (
    <PortalPageLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LB Internal Positions</h1>
          <p className="text-muted-foreground mt-1">
            Corporate leadership, workshop crew, and guild specialists — all recruited through The Handshake
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/guilds/hub')}>
            View Guilds
          </Button>
          <Button onClick={() => navigate('/position-categories')}>
            All Categories
          </Button>
        </div>
      </div>

      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle>Next Steps for Hiring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <div className="font-medium">Review Position Details Below</div>
              <div className="text-sm text-muted-foreground">Understand the roles, responsibilities, and qualifications</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <div className="font-medium">Create Position Templates</div>
              <div className="text-sm text-muted-foreground">Use "Manage Positions" to formalize these as open positions</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <div className="font-medium">Members Apply & Get Assigned</div>
              <div className="text-sm text-muted-foreground">Qualified members apply, you review applications, assign contracts</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
            <div>
              <div className="font-medium">Information Ready for Interviews</div>
              <div className="text-sm text-muted-foreground">All pertinent data in their profile: reputation, past work, skills, guild memberships</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {existingPositions && existingPositions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active LB Positions</CardTitle>
            <CardDescription>Currently open positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {existingPositions.map((pos) => (
                <div key={pos.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{pos.position_title}</div>
                    <div className="text-sm text-muted-foreground">{pos.category}</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{pos.applications?.[0]?.count || 0} applications</span>
                    <span>{pos.assignments?.[0]?.count || 0} assigned</span>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/manage-positions?position=${pos.id}`)}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="c_suite" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="c_suite" className="gap-1">
            <Briefcase className="w-4 h-4" /> C-Suite ({cSuitePositions.length})
          </TabsTrigger>
          <TabsTrigger value="workshop" className="gap-1">
            <Wrench className="w-4 h-4" /> Workshop Crew ({workshopPositions.length})
          </TabsTrigger>
          <TabsTrigger value="guild_staff" className="gap-1">
            <Shield className="w-4 h-4" /> Guild Staff ({guildStaffPositions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="c_suite" className="space-y-4">
          <div className="rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 p-4 mb-4">
            <h3 className="font-semibold mb-1">Corporate Leadership — Recruited Through The Handshake</h3>
            <p className="text-sm text-muted-foreground">
              These positions are filled through the 30-day mutual exploration protocol.
              All C-Suite roles include Marks-based compensation and participation.
            </p>
          </div>
          <PositionCards positions={cSuitePositions} />
        </TabsContent>

        <TabsContent value="workshop" className="space-y-4">
          <div className="rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 p-4 mb-4">
            <h3 className="font-semibold mb-1">Workshop Crew — The Operational Engine</h3>
            <p className="text-sm text-muted-foreground">
              Hands-on roles that keep the cooperative running. Marks compensation + per-task Credits.
              Apply through the position system or contact the relevant guild directly.
            </p>
          </div>
          <PositionCards positions={workshopPositions} />
        </TabsContent>

        <TabsContent value="guild_staff" className="space-y-4">
          <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-violet-500/5 border border-purple-500/20 p-4 mb-4">
            <h3 className="font-semibold mb-1">Guild Specialists — Domain Expertise</h3>
            <p className="text-sm text-muted-foreground">
              Specialized roles within specific guilds. Marks per deliverable plus Credits.
              Join the relevant guild first, then apply for the position.
            </p>
          </div>
          <PositionCards positions={guildStaffPositions} />
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}

function PositionCards({ positions }: { positions: LBPosition[] }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {positions.map((position) => (
        <Card key={position.title}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <position.icon className="h-8 w-8 text-primary mb-2" />
              <Badge variant={position.priority === 'critical' ? 'destructive' : position.priority === 'high' ? 'default' : 'secondary'}>
                {position.priority}
              </Badge>
            </div>
            <CardTitle>{position.title}</CardTitle>
            <CardDescription>{position.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{position.category}</Badge>
              {position.guildAffiliation && (
                <Badge variant="secondary" className="gap-1">
                  <Users className="w-3 h-3" /> {position.guildAffiliation}
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold">Compensation:</div>
              <div className="text-sm text-muted-foreground">{position.typicalCompensation}</div>
              {position.marksCompensation && (
                <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  Marks: {position.marksCompensation}
                </div>
              )}
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Key Responsibilities:</div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {position.keyResponsibilities.slice(0, 4).map((resp) => (
                  <li key={resp}>• {resp}</li>
                ))}
                {position.keyResponsibilities.length > 4 && (
                  <li className="italic">+ {position.keyResponsibilities.length - 4} more...</li>
                )}
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Required Skills:</div>
              <div className="flex flex-wrap gap-1">
                {position.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => navigate(`/manage-positions?category=${position.category}&title=${encodeURIComponent(position.title)}`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create This Position
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
