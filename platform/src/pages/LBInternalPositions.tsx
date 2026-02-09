import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Users, Scale, Shield, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LBPosition {
  category: string;
  title: string;
  description: string;
  icon: any;
  priority: 'critical' | 'high' | 'medium';
  typicalCompensation: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
  desiredQualifications: string[];
}

const lbInternalPositions: LBPosition[] = [
  {
    category: 'accounting_services',
    title: 'Certified Public Accountant (CPA)',
    description: 'Primary accountant for LB operations, managing books, tax filings, and financial compliance',
    icon: Calculator,
    priority: 'critical',
    typicalCompensation: '$75-150/hr or 0.5-2% equity',
    keyResponsibilities: [
      'Maintain accurate books and records for LB operations',
      'Prepare and file all tax returns (corporate, sales, payroll)',
      'Ensure GAAP compliance for all financial statements',
      'Advise on tax strategy and entity structure',
      'Coordinate with CFO on financial reporting',
      'Manage relationships with IRS and state tax authorities'
    ],
    requiredSkills: [
      'Active CPA license',
      'Experience with multi-entity structures',
      'Knowledge of crowdfunding/equity accounting',
      'Tax strategy expertise',
      'GAAP/IFRS proficiency'
    ],
    desiredQualifications: [
      'Experience with cooperative or guild structures',
      'Blockchain/cryptocurrency accounting knowledge',
      'Prior work with manufacturing businesses',
      'Multi-state tax experience'
    ]
  },
  {
    category: 'accounting_services',
    title: 'Chief Financial Officer (CFO)',
    description: 'Strategic financial leadership for LB, overseeing all financial operations and planning',
    icon: Calculator,
    priority: 'high',
    typicalCompensation: '$100-200/hr or 2-5% equity',
    keyResponsibilities: [
      'Develop and execute financial strategy',
      'Oversee all financial operations and reporting',
      'Manage banking relationships and capital structure',
      'Financial forecasting and budgeting',
      'Investment and treasury management',
      'Work with CPA on compliance and tax strategy',
      'Financial due diligence for partnerships/acquisitions',
      'Funding pool management and allocation'
    ],
    requiredSkills: [
      'CFO or senior finance leadership experience',
      'Financial modeling and analysis',
      'Strategic planning',
      'Capital markets knowledge',
      'M&A experience'
    ],
    desiredQualifications: [
      'CPA or MBA',
      'Experience with cooperative or member-owned structures',
      'Crowdfunding platform financial management',
      'Blockchain/DeFi understanding'
    ]
  },
  {
    category: 'hr_staffing',
    title: 'Director of People Operations',
    description: 'Lead HR strategy and operations for LB member contracts and hiring',
    icon: Users,
    priority: 'high',
    typicalCompensation: '$75-125/hr or 1-3% equity',
    keyResponsibilities: [
      'Design and implement contract position system',
      'Oversee hiring and onboarding for all LB positions',
      'Manage member contracts and equity allocations',
      'Develop compensation frameworks',
      'Handle member relations and dispute resolution',
      'Build reputation system integration with hiring'
    ],
    requiredSkills: [
      'HR leadership experience',
      'Contract management',
      'Equity compensation expertise',
      'Employee relations',
      'Compliance (labor law, benefits)'
    ],
    desiredQualifications: [
      'Experience with gig/contract workers',
      'Cooperative governance knowledge',
      'Tech startup HR experience',
      'Understanding of guild/union structures'
    ]
  },
  {
    category: 'legal_services',
    title: 'General Counsel',
    description: 'Primary legal advisor for LB operations, contracts, IP, and compliance',
    icon: Scale,
    priority: 'critical',
    typicalCompensation: '$150-300/hr or 1-4% equity',
    keyResponsibilities: [
      'Review and draft all major contracts',
      'Advise on entity structure and governance',
      'Intellectual property protection',
      'Securities compliance for equity offerings',
      'Member agreement templates and enforcement',
      'Regulatory compliance (crowdfunding, financial)',
      'Dispute resolution and litigation management'
    ],
    requiredSkills: [
      'Licensed attorney (multiple states preferred)',
      'Business law expertise',
      'Securities law knowledge',
      'Contract drafting and negotiation',
      'IP law'
    ],
    desiredQualifications: [
      'Crowdfunding platform legal experience',
      'Cooperative/member organization expertise',
      'Blockchain/cryptocurrency law knowledge',
      'Manufacturing/product liability experience'
    ]
  },
  {
    category: 'steward_owner',
    title: 'Executive Steward (Board Member)',
    description: 'Governance and strategic oversight for LB as an organization',
    icon: Shield,
    priority: 'medium',
    typicalCompensation: 'Board stipend + 0.5-2% equity',
    keyResponsibilities: [
      'Strategic direction and planning',
      'Oversight of executive team',
      'Financial and operational oversight',
      'Risk management',
      'Member representation',
      'Major decision approval'
    ],
    requiredSkills: [
      'Board or executive leadership experience',
      'Strategic planning',
      'Governance expertise',
      'Financial literacy',
      'Reputation score 4.5+ / Sun level preferred'
    ],
    desiredQualifications: [
      'Cooperative or member organization governance',
      'Crowdfunding industry experience',
      'Manufacturing sector knowledge',
      'Guild representative or elected leader'
    ]
  }
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

  const criticalPositions = lbInternalPositions.filter(p => p.priority === 'critical');
  const highPriorityPositions = lbInternalPositions.filter(p => p.priority === 'high');
  const otherPositions = lbInternalPositions.filter(p => p.priority === 'medium');

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LB Internal Positions</h1>
          <p className="text-muted-foreground mt-1">
            Key roles for Liana Banyan operations - ready for hiring
          </p>
        </div>
        <Button onClick={() => navigate('/position-categories')}>
          View All Categories
        </Button>
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

      <Tabs defaultValue="critical" className="space-y-4">
        <TabsList>
          <TabsTrigger value="critical">Critical ({criticalPositions.length})</TabsTrigger>
          <TabsTrigger value="high">High Priority ({highPriorityPositions.length})</TabsTrigger>
          <TabsTrigger value="other">Other ({otherPositions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="critical" className="space-y-4">
          <PositionCards positions={criticalPositions} />
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          <PositionCards positions={highPriorityPositions} />
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <PositionCards positions={otherPositions} />
        </TabsContent>
      </Tabs>
    </div>
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
            <div>
              <div className="text-sm font-semibold mb-1">Category:</div>
              <Badge variant="outline">{position.category}</Badge>
            </div>

            <div>
              <div className="text-sm font-semibold mb-1">Typical Compensation:</div>
              <div className="text-sm text-muted-foreground">{position.typicalCompensation}</div>
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
