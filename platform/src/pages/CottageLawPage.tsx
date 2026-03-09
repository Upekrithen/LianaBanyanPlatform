/**
 * Cottage Law Compliance Page
 * ============================
 * Helps makers understand and comply with cottage food laws by state.
 * 
 * Features:
 * - State-specific rules lookup
 * - Community-contributed guides
 * - Permit threshold tracking
 * - Step-by-step compliance help
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  MapPin, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  Tag,
  DollarSign,
  Star,
  Clock,
  Users
} from 'lucide-react';
import { 
  getStateCottageLawRules, 
  checkPermitRequirement,
  getComplianceChecklist,
  generateLabelContent,
  COMMON_COTTAGE_FOODS,
  TYPICALLY_PROHIBITED,
  type CottageLawRule,
} from '@/lib/cottageLawService';

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];

export default function CottageLawPage() {
  const { user } = useAuth();
  const [selectedState, setSelectedState] = useState<string>('');
  const [weeklyOutput, setWeeklyOutput] = useState<number>(0);
  const [annualRevenue, setAnnualRevenue] = useState<number>(0);

  // Fetch state rules
  const { data: rules, isLoading: rulesLoading } = useQuery({
    queryKey: ['cottage-law-rules', selectedState],
    queryFn: () => getStateCottageLawRules(selectedState),
    enabled: !!selectedState,
  });

  const permitCheck = rules 
    ? checkPermitRequirement(rules, weeklyOutput, 0, annualRevenue)
    : null;

  const checklist = rules ? getComplianceChecklist(rules) : [];

  return (
    <div className="landing-page min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="h-8 w-8" />
            Cottage Food Law Compliance
          </h1>
          <p className="text-muted-foreground mt-1">
            Sell homemade food legally. We'll guide you through the rules.
          </p>
        </div>

        {/* State Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Your State
            </CardTitle>
            <CardDescription>
              Select your state to see specific cottage food laws
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Select your state..." />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(state => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* State Rules */}
        {rules && (
          <>
            {/* Overview */}
            <Card className={rules.is_allowed ? 'border-emerald-500/30' : 'border-rose-500/30'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {rules.is_allowed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-500" />
                  )}
                  {rules.state_name} Cottage Food Laws
                </CardTitle>
                <CardDescription>
                  {rules.is_allowed 
                    ? 'Cottage food operations are allowed in this state!'
                    : 'Cottage food sales may be restricted in this state.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {rules.annual_revenue_limit && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground">Annual Revenue Limit</div>
                      <div className="font-bold">${rules.annual_revenue_limit.toLocaleString()}</div>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground">Registration Required</div>
                    <div className="font-bold">{rules.registration_required ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground">Permit Required</div>
                    <div className="font-bold">{rules.permit_required ? 'Yes' : 'Varies'}</div>
                  </div>
                </div>

                {rules.official_url && (
                  <Button variant="outline" className="mt-4" asChild>
                    <a href={rules.official_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Official State Guidelines
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Tabs for Details */}
            <Tabs defaultValue="allowed">
              <TabsList>
                <TabsTrigger value="allowed">Allowed Foods</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="tracking">Your Tracking</TabsTrigger>
                <TabsTrigger value="guides">Community Guides</TabsTrigger>
              </TabsList>

              <TabsContent value="allowed" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      Generally Allowed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_COTTAGE_FOODS.map(food => (
                        <Badge key={food} variant="secondary" className="bg-emerald-500/10 text-emerald-700">
                          {food.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      These are typically allowed, but check your state's specific list.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-rose-500" />
                      Typically Prohibited
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {TYPICALLY_PROHIBITED.map(food => (
                        <Badge key={food} variant="secondary" className="bg-rose-500/10 text-rose-700">
                          {food.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      These usually require commercial kitchen and permits.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Compliance Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {checklist.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-medium">{item.item}</div>
                            {item.required && (
                              <Badge variant="outline" className="text-xs mt-1">Required</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Labeling Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Labeling Requirements
                    </CardTitle>
                    <CardDescription>
                      Most states require these on cottage food products
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {rules.required_label_items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          {item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tracking" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" />
                      Your Compliance Status
                    </CardTitle>
                    <CardDescription>
                      Track your output to stay within legal limits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weekly">Weekly Output (items)</Label>
                        <Input
                          id="weekly"
                          type="number"
                          value={weeklyOutput}
                          onChange={(e) => setWeeklyOutput(parseInt(e.target.value) || 0)}
                          min={0}
                        />
                      </div>
                      <div>
                        <Label htmlFor="annual">Annual Revenue ($)</Label>
                        <Input
                          id="annual"
                          type="number"
                          value={annualRevenue}
                          onChange={(e) => setAnnualRevenue(parseInt(e.target.value) || 0)}
                          min={0}
                        />
                      </div>
                    </div>

                    {/* Permit Status */}
                    {permitCheck && (
                      <div className={`p-4 rounded-lg border ${
                        permitCheck.urgency === 'exceeded' ? 'bg-rose-500/10 border-rose-500/30' :
                        permitCheck.urgency === 'approaching' ? 'bg-amber-500/10 border-amber-500/30' :
                        'bg-emerald-500/10 border-emerald-500/30'
                      }`}>
                        <div className="flex items-center gap-2">
                          {permitCheck.urgency === 'exceeded' ? (
                            <AlertTriangle className="h-5 w-5 text-rose-500" />
                          ) : permitCheck.urgency === 'approaching' ? (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          )}
                          <span className="font-medium">
                            {permitCheck.required 
                              ? 'Permit may be required'
                              : permitCheck.urgency === 'approaching'
                                ? 'Approaching limit'
                                : 'You\'re within limits!'}
                          </span>
                        </div>
                        {permitCheck.threshold && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {permitCheck.threshold}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Revenue Progress */}
                    {rules.annual_revenue_limit && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Annual Revenue Limit</span>
                          <span>${annualRevenue.toLocaleString()} / ${rules.annual_revenue_limit.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={(annualRevenue / rules.annual_revenue_limit) * 100} 
                          className="h-2" 
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="guides" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Community Guides for {rules.state_name}
                    </CardTitle>
                    <CardDescription>
                      Detailed guides written by local makers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium">No guides yet for {rules.state_name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Be the first to contribute! Earn Icing for helpful guides.
                      </p>
                      <Button>
                        Write a Guide
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Call to Action when no state selected */}
        {!selectedState && (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Select Your State</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Each state has different cottage food laws. Select your state above to see 
                what's allowed, what permits you need, and how to stay compliant.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
