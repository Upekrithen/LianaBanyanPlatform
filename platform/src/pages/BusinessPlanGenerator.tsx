import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, FileText, TrendingUp, DollarSign, Target, Cog, Globe, Users, Briefcase, FileCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdvancedThemeSwitcher } from "@/components/AdvancedThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const BusinessPlanGenerator = () => {
  const [projectName, setProjectName] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const generateSection = async (section: string) => {
    if (!projectName || !industry || !targetMarket || !fundingGoal) {
      toast({
        title: "Missing Information",
        description: "Please fill in all project details before generating sections.",
        variant: "destructive"
      });
      return;
    }

    setLoading(section);
    try {
      const { data, error } = await supabase.functions.invoke('generate-business-plan', {
        body: {
          projectName,
          industry,
          targetMarket,
          fundingGoal: parseFloat(fundingGoal),
          section
        }
      });

      if (error) throw error;

      setSections(prev => ({ ...prev, [section]: data.content }));
      toast({
        title: "Section Generated",
        description: `${getSectionTitle(section)} has been generated successfully.`
      });
    } catch (error) {
      console.error('Error generating section:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate section. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const generateAllSections = async () => {
    const sectionsList = [
      'executive_summary', 
      'market_analysis', 
      'financial_projections', 
      'marketing_strategy', 
      'operations_plan',
      'portal_architecture',
      'service_delivery_model',
      'lb_services_integration',
      'system_analysis'
    ];
    for (const section of sectionsList) {
      await generateSection(section);
    }
  };

  const getSectionTitle = (section: string) => {
    const titles: Record<string, string> = {
      executive_summary: "Executive Summary",
      market_analysis: "Market Analysis",
      financial_projections: "Financial Projections",
      marketing_strategy: "Marketing Strategy",
      operations_plan: "Operations Plan",
      portal_architecture: "Multi-Portal Architecture",
      service_delivery_model: "Service Delivery Model",
      lb_services_integration: "LB Services Integration",
      project_charter_governance: "Project Charter & Governance",
      system_analysis: "System Architecture Analysis"
    };
    return titles[section] || section;
  };

  const getSectionIcon = (section: string) => {
    const icons: Record<string, any> = {
      executive_summary: FileText,
      market_analysis: TrendingUp,
      financial_projections: DollarSign,
      marketing_strategy: Target,
      operations_plan: Cog,
      portal_architecture: Globe,
      service_delivery_model: Users,
      lb_services_integration: Briefcase,
      project_charter_governance: FileCheck
    };
    const Icon = icons[section] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const downloadPlan = () => {
    const content = Object.entries(sections)
      .map(([key, value]) => `# ${getSectionTitle(key)}\n\n${value}\n\n`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_business_plan.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">AI Business Plan Generator</h1>
          <p className="text-muted-foreground">
            Powered by Perplexity AI - Generate comprehensive, data-driven business plan sections
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <AdvancedThemeSwitcher variant="select" className="flex-shrink-0" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Provide information about your project to generate tailored business plan sections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="My Startup"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="SaaS, E-commerce, etc."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetMarket">Target Market</Label>
              <Input
                id="targetMarket"
                placeholder="Small businesses, Gen Z consumers, etc."
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fundingGoal">Funding Goal ($)</Label>
              <Input
                id="fundingGoal"
                type="number"
                placeholder="50000"
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generateAllSections} 
              disabled={loading !== null}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Complete Plan"
              )}
            </Button>
            {Object.keys(sections).length > 0 && (
              <Button onClick={downloadPlan} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="executive_summary" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="grid w-full grid-cols-10 mb-4">
            <TabsTrigger value="executive_summary">Summary</TabsTrigger>
            <TabsTrigger value="market_analysis">Market</TabsTrigger>
            <TabsTrigger value="financial_projections">Financials</TabsTrigger>
            <TabsTrigger value="marketing_strategy">Marketing</TabsTrigger>
            <TabsTrigger value="operations_plan">Operations</TabsTrigger>
            <TabsTrigger value="portal_architecture">Portals</TabsTrigger>
            <TabsTrigger value="service_delivery_model">Services</TabsTrigger>
            <TabsTrigger value="lb_services_integration">LB Integration</TabsTrigger>
            <TabsTrigger value="project_charter_governance">Charter</TabsTrigger>
            <TabsTrigger value="system_analysis">Analysis</TabsTrigger>
          </TabsList>
        </ScrollArea>

        {['executive_summary', 'market_analysis', 'financial_projections', 'marketing_strategy', 'operations_plan', 'portal_architecture', 'service_delivery_model', 'lb_services_integration', 'project_charter_governance', 'system_analysis'].map((section) => (
          <TabsContent key={section} value={section}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSectionIcon(section)}
                    <CardTitle>{getSectionTitle(section)}</CardTitle>
                  </div>
                  <Button
                    onClick={() => generateSection(section)}
                    disabled={loading !== null}
                    size="sm"
                  >
                    {loading === section ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      sections[section] ? "Regenerate" : "Generate"
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sections[section] ? (
                  <Textarea
                    value={sections[section]}
                    onChange={(e) => setSections(prev => ({ ...prev, [section]: e.target.value }))}
                    className="min-h-[400px] font-mono text-sm"
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Click "Generate" to create this section using AI-powered research
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default BusinessPlanGenerator;
