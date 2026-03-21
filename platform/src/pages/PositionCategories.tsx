import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CandidateProfilePreview } from '@/components/CandidateProfilePreview';
import {
  Lightbulb, 
  FileText, 
  FlaskConical, 
  Boxes, 
  Scale, 
  Package, 
  Shield, 
  Megaphone, 
  Calculator, 
  Users, 
  ShoppingCart, 
  Wrench, 
  Rocket, 
  Cpu, 
  Truck,
  Plus
} from 'lucide-react';
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface PositionCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  typicalRoles: string[];
  keySkills: string[];
  examplePositions: string[];
}

const positionCategories: PositionCategory[] = [
  {
    id: 'create_idea',
    name: 'Idea Creation',
    description: 'Initial concept development and innovation',
    icon: Lightbulb,
    typicalRoles: ['Visionary', 'Innovator', 'Product Strategist'],
    keySkills: ['Creative Thinking', 'Market Analysis', 'Problem Solving'],
    examplePositions: ['Chief Innovation Officer', 'Product Visionary', 'Concept Developer']
  },
  {
    id: 'define_describe_document',
    name: 'Documentation & Definition',
    description: 'Detailed specification and documentation of products/processes',
    icon: FileText,
    typicalRoles: ['Technical Writer', 'Product Manager', 'Business Analyst'],
    keySkills: ['Technical Writing', 'Requirements Analysis', 'Documentation'],
    examplePositions: ['Technical Writer', 'Product Documentation Specialist', 'Requirements Analyst']
  },
  {
    id: 'research_development',
    name: 'Research & Development',
    description: 'Scientific research and product development',
    icon: FlaskConical,
    typicalRoles: ['R&D Engineer', 'Research Scientist', 'Product Developer'],
    keySkills: ['Scientific Research', 'Engineering', 'Experimentation'],
    examplePositions: ['R&D Engineer', 'Materials Scientist', 'Innovation Lab Lead']
  },
  {
    id: 'prototype',
    name: 'Prototyping',
    description: 'Creating working prototypes and proof of concepts',
    icon: Boxes,
    typicalRoles: ['Prototype Engineer', 'Maker', '3D Designer'],
    keySkills: ['CAD Design', '3D Printing', 'Rapid Prototyping'],
    examplePositions: ['Prototype Engineer', 'Product Designer', 'Maker']
  },
  {
    id: 'legal_services',
    name: 'Legal Services',
    description: 'Legal compliance, contracts, IP protection',
    icon: Scale,
    typicalRoles: ['Business Attorney', 'IP Lawyer', 'Compliance Officer'],
    keySkills: ['Business Law', 'Contract Law', 'Intellectual Property'],
    examplePositions: ['General Counsel', 'IP Attorney', 'Compliance Manager']
  },
  {
    id: 'logistics_blockchain',
    name: 'Logistics & Blockchain',
    description: 'Supply chain management and blockchain integration',
    icon: Package,
    typicalRoles: ['Logistics Coordinator', 'Blockchain Developer', 'Supply Chain Manager'],
    keySkills: ['Supply Chain', 'Blockchain', 'Smart Contracts'],
    examplePositions: ['Blockchain Integration Specialist', 'Supply Chain Analyst', 'Logistics Manager']
  },
  {
    id: 'steward_owner',
    name: 'Stewardship & Governance',
    description: 'Project governance and oversight',
    icon: Shield,
    typicalRoles: ['Project Steward', 'Product Owner', 'Executive'],
    keySkills: ['Leadership', 'Governance', 'Strategic Planning'],
    examplePositions: ['Project Steward', 'Product Owner', 'CEO', 'COO']
  },
  {
    id: 'marketing_services',
    name: 'Marketing Services',
    description: 'Marketing, branding, and customer acquisition',
    icon: Megaphone,
    typicalRoles: ['Marketing Manager', 'Brand Strategist', 'Growth Hacker'],
    keySkills: ['Digital Marketing', 'Brand Strategy', 'Content Creation'],
    examplePositions: ['Marketing Director', 'Brand Manager', 'Growth Lead']
  },
  {
    id: 'accounting_services',
    name: 'Accounting & Financial Services',
    description: 'Financial management, accounting, tax strategy, and CFO services',
    icon: Calculator,
    typicalRoles: ['CPA', 'CFO', 'Financial Analyst', 'Tax Strategist', 'Bookkeeper'],
    keySkills: ['Accounting', 'Financial Analysis', 'Tax Strategy', 'GAAP/IFRS', 'Financial Planning'],
    examplePositions: ['Certified Public Accountant (CPA)', 'Chief Financial Officer (CFO)', 'Tax Advisor', 'Financial Controller', 'Accounting Firm Partner']
  },
  {
    id: 'hr_staffing',
    name: 'HR & Staffing',
    description: 'Human resources, recruitment, and team building',
    icon: Users,
    typicalRoles: ['HR Manager', 'Recruiter', 'Talent Acquisition'],
    keySkills: ['Recruitment', 'HR Management', 'Employee Relations'],
    examplePositions: ['HR Director', 'Talent Acquisition Lead', 'People Operations Manager']
  },
  {
    id: 'materials_sourcing',
    name: 'Materials Sourcing',
    description: 'Procurement and materials acquisition',
    icon: ShoppingCart,
    typicalRoles: ['Procurement Specialist', 'Buyer', 'Sourcing Manager'],
    keySkills: ['Supplier Relations', 'Negotiation', 'Quality Control'],
    examplePositions: ['Procurement Manager', 'Materials Buyer', 'Sourcing Specialist']
  },
  {
    id: 'manufacture_assembly',
    name: 'Manufacturing & Assembly',
    description: 'Production, manufacturing, and assembly operations',
    icon: Wrench,
    typicalRoles: ['Manufacturing Engineer', 'Production Manager', 'Assembly Technician'],
    keySkills: ['Manufacturing', 'Quality Control', 'Process Optimization'],
    examplePositions: ['Manufacturing Manager', 'Production Engineer', 'Assembly Line Lead']
  },
  {
    id: 'kickstarter_campaign',
    name: 'Crowdfunding Campaigns',
    description: 'Kickstarter and crowdfunding campaign management',
    icon: Rocket,
    typicalRoles: ['Campaign Manager', 'Crowdfunding Specialist', 'Backer Relations'],
    keySkills: ['Campaign Management', 'Community Engagement', 'Fundraising'],
    examplePositions: ['Kickstarter Campaign Manager', 'Crowdfunding Strategist', 'Backer Success Manager']
  },
  {
    id: 'it_services',
    name: 'IT Services',
    description: 'Information technology and systems management',
    icon: Cpu,
    typicalRoles: ['IT Manager', 'Systems Admin', 'DevOps Engineer'],
    keySkills: ['System Administration', 'Network Management', 'Security'],
    examplePositions: ['IT Director', 'Systems Administrator', 'DevOps Lead']
  },
  {
    id: 'delivery',
    name: 'Delivery & Fulfillment',
    description: 'Order fulfillment and delivery operations',
    icon: Truck,
    typicalRoles: ['Fulfillment Manager', 'Delivery Coordinator', 'Warehouse Manager'],
    keySkills: ['Logistics', 'Inventory Management', 'Customer Service'],
    examplePositions: ['Fulfillment Director', 'Warehouse Manager', 'Delivery Operations Lead']
  }
];

export default function PositionCategories() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Position Categories</h1>
          <p className="text-muted-foreground mt-1">
            15 core categories covering all aspects of product development and business operations
          </p>
        </div>
        <Button onClick={() => navigate('/manage-positions')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Position
        </Button>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle>LB Internal Hiring</CardTitle>
          <CardDescription>
            Liana Banyan uses this same system to hire agents for our internal operations. When you create a position in any category,
            qualified members can apply and be assigned contracts based on participation/cash/time commitment preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>For LB Operations:</strong> We need positions like CPA, CFO, Legal Counsel, etc.</div>
            <div><strong>For Projects:</strong> Project owners create positions specific to their product needs</div>
            <div><strong>Compensation:</strong> All positions use the configurable participation/cash/time model with reputation-based vetting</div>
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/lb-positions')}>
                View LB Internal Positions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {positionCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <category.icon className="h-8 w-8 text-primary mb-2" />
                <Badge variant="outline">{category.id}</Badge>
              </div>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-semibold mb-2">Typical Roles:</div>
                <div className="flex flex-wrap gap-1">
                  {category.typicalRoles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">Key Skills:</div>
                <div className="flex flex-wrap gap-1">
                  {category.keySkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">Example Positions:</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {category.examplePositions.map((pos) => (
                    <li key={pos}>• {pos}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What Information Will Be Available?</CardTitle>
          <CardDescription>
            When you interview candidates, all this data is automatically compiled from their LB profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CandidateProfilePreview />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ready to Create Positions?</CardTitle>
          <CardDescription>
            Use these categories to create positions for LB operations or your projects. Each position can specify:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✅ <strong>Category:</strong> One of the 15 categories above</li>
            <li>✅ <strong>Compensation Type:</strong> Participation-based, cash-based, or hybrid</li>
            <li>✅ <strong>Requirements:</strong> Skills, reputation score, guild membership</li>
            <li>✅ <strong>Time Commitment:</strong> Options with participation/cash ratios</li>
            <li>✅ <strong>Lifecycle Stage:</strong> Required project stage (optional)</li>
          </ul>
          <Button className="mt-4" onClick={() => navigate('/manage-positions')}>
            Create Your First Position
          </Button>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
