import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Download, Save, FileText, Calculator } from "lucide-react";
import jsPDF from "jspdf";

interface ScenarioData {
  projectName: string;
  productName: string;
  unitsCount: number;
  unitPrice: number;
  volumeDiscount: number;
  participationPercentage: number;
  cashPercentage: number;
  votesNeeded: number;
}

export default function Simulator() {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const { toast } = useToast();
  const [scenarioName, setScenarioName] = useState("");
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  
  const [data, setData] = useState<ScenarioData>({
    projectName: "Sample Project",
    productName: "Sample Product",
    unitsCount: 100,
    unitPrice: 50,
    volumeDiscount: 0,
    participationPercentage: 50,
    cashPercentage: 50,
    votesNeeded: 1000,
  });

  const [results, setResults] = useState({
    totalRevenue: 0,
    discountedRevenue: 0,
    participationValue: 0,
    cashValue: 0,
    pricePerUnit: 0,
  });

  useEffect(() => {
    loadScenarios();
  }, [user]);

  useEffect(() => {
    calculateResults();
  }, [data]);

  const loadScenarios = async () => {
    if (!user) return;
    
    const { data: scenariosData, error } = await supabase
      .from("test_scenarios")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading scenarios", description: error.message, variant: "destructive" });
      return;
    }

    setScenarios(scenariosData || []);
  };

  const calculateResults = () => {
    const totalRevenue = data.unitsCount * data.unitPrice;
    const discountAmount = (totalRevenue * data.volumeDiscount) / 100;
    const discountedRevenue = totalRevenue - discountAmount;
    const participationValue = (discountedRevenue * data.participationPercentage) / 100;
    const cashValue = (discountedRevenue * data.cashPercentage) / 100;
    const pricePerUnit = discountedRevenue / data.unitsCount;

    setResults({
      totalRevenue,
      discountedRevenue,
      participationValue,
      cashValue,
      pricePerUnit,
    });
  };

  const generateXML = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<ProjectModule>
  <ProjectName>${data.projectName}</ProjectName>
  <Products>
    <Product>
      <Name>${data.productName}</Name>
      <ProductionLevel>
        <UnitsCount>${data.unitsCount}</UnitsCount>
        <UnitPrice>${data.unitPrice.toFixed(2)}</UnitPrice>
        <VolumeDiscount>${data.volumeDiscount}%</VolumeDiscount>
        <DiscountedPricePerUnit>${results.pricePerUnit.toFixed(2)}</DiscountedPricePerUnit>
        <TotalRevenue>${results.totalRevenue.toFixed(2)}</TotalRevenue>
        <DiscountedRevenue>${results.discountedRevenue.toFixed(2)}</DiscountedRevenue>
        <VotesNeeded>${data.votesNeeded}</VotesNeeded>
      </ProductionLevel>
      <Funding>
        <ParticipationPercentage>${data.participationPercentage}%</ParticipationPercentage>
        <ParticipationValue>${results.participationValue.toFixed(2)}</ParticipationValue>
        <CashPercentage>${data.cashPercentage}%</CashPercentage>
        <CashValue>${results.cashValue.toFixed(2)}</CashValue>
      </Funding>
    </Product>
  </Products>
</ProjectModule>`;
  };

  const saveScenario = async () => {
    if (!user) {
      openOnboard({ reason: "Save your simulation scenarios", actionLabel: "Save Scenario" });
      return;
    }

    if (!scenarioName) {
      toast({ title: "Please enter a scenario name", variant: "destructive" });
      return;
    }

    const xmlOutput = generateXML();

    const scenarioPayload: any = {
      user_id: user.id,
      scenario_name: scenarioName,
      scenario_data: data,
      xml_output: xmlOutput,
      updated_at: new Date().toISOString(),
    };

    if (selectedScenarioId) {
      scenarioPayload.id = selectedScenarioId;
    }

    const { error } = await supabase
      .from("test_scenarios")
      .upsert(scenarioPayload);

    if (error) {
      toast({ title: "Error saving scenario", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Scenario saved successfully" });
    loadScenarios();
  };

  const loadScenario = async (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    setSelectedScenarioId(scenarioId);
    setScenarioName(scenario.scenario_name);
    setData(scenario.scenario_data);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Project Scenario Analysis", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Scenario: ${scenarioName || "Untitled"}`, 20, 35);
    
    doc.setFontSize(10);
    let y = 50;
    
    doc.text("Project Parameters:", 20, y);
    y += 10;
    doc.text(`Project Name: ${data.projectName}`, 25, y);
    y += 7;
    doc.text(`Product Name: ${data.productName}`, 25, y);
    y += 7;
    doc.text(`Units: ${data.unitsCount}`, 25, y);
    y += 7;
    doc.text(`Unit Price: $${data.unitPrice}`, 25, y);
    y += 7;
    doc.text(`Volume Discount: ${data.volumeDiscount}%`, 25, y);
    y += 7;
    doc.text(`Votes Needed: ${data.votesNeeded}`, 25, y);
    
    y += 15;
    doc.text("Funding Split:", 20, y);
    y += 10;
    doc.text(`Participation: ${data.participationPercentage}%`, 25, y);
    y += 7;
    doc.text(`Cash: ${data.cashPercentage}%`, 25, y);
    
    y += 15;
    doc.text("Calculated Results:", 20, y);
    y += 10;
    doc.text(`Total Revenue: $${results.totalRevenue.toFixed(2)}`, 25, y);
    y += 7;
    doc.text(`Discounted Revenue: $${results.discountedRevenue.toFixed(2)}`, 25, y);
    y += 7;
    doc.text(`Price Per Unit (after discount): $${results.pricePerUnit.toFixed(2)}`, 25, y);
    y += 7;
    doc.text(`Participation Value: $${results.participationValue.toFixed(2)}`, 25, y);
    y += 7;
    doc.text(`Cash Value: $${results.cashValue.toFixed(2)}`, 25, y);
    
    doc.save(`scenario-${scenarioName || "untitled"}.pdf`);
    toast({ title: "PDF downloaded successfully" });
  };

  const downloadXML = () => {
    const xml = generateXML();
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scenario-${scenarioName || "untitled"}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "XML downloaded successfully" });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Simulator</h1>
          <p className="text-muted-foreground">Test different scenarios with sample data</p>
        </div>
        <Calculator className="w-8 h-8 text-primary" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Scenario Settings</CardTitle>
            <CardDescription>Configure your test scenario parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="scenarioName">Scenario Name</Label>
              <Input
                id="scenarioName"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="Enter scenario name"
              />
            </div>

            {scenarios.length > 0 && (
              <div>
                <Label htmlFor="loadScenario">Load Previous Scenario</Label>
                <Select onValueChange={loadScenario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.scenario_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={data.projectName}
                onChange={(e) => setData({ ...data, projectName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={data.productName}
                onChange={(e) => setData({ ...data, productName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="unitsCount">Units Count</Label>
              <Input
                id="unitsCount"
                type="number"
                value={data.unitsCount}
                onChange={(e) => setData({ ...data, unitsCount: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="unitPrice">Unit Price ($)</Label>
              <Input
                id="unitPrice"
                type="number"
                value={data.unitPrice}
                onChange={(e) => setData({ ...data, unitPrice: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="votesNeeded">Votes Needed</Label>
              <Input
                id="votesNeeded"
                type="number"
                value={data.votesNeeded}
                onChange={(e) => setData({ ...data, votesNeeded: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label>Volume Discount: {data.volumeDiscount}%</Label>
              <Slider
                value={[data.volumeDiscount]}
                onValueChange={([value]) => setData({ ...data, volumeDiscount: value })}
                max={50}
                step={1}
              />
            </div>

            <div>
              <Label>Participation Split: {data.participationPercentage}%</Label>
              <Slider
                value={[data.participationPercentage]}
                onValueChange={([value]) => {
                  setData({ 
                    ...data, 
                    participationPercentage: value,
                    cashPercentage: 100 - value 
                  });
                }}
                max={100}
                step={1}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Cash: {data.cashPercentage}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calculated Results</CardTitle>
            <CardDescription>See the impact of your parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${results.totalRevenue.toFixed(2)}</p>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">After Discount</p>
                <p className="text-2xl font-bold">${results.discountedRevenue.toFixed(2)}</p>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Price Per Unit</p>
                <p className="text-2xl font-bold">${results.pricePerUnit.toFixed(2)}</p>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Discount Amount</p>
                <p className="text-2xl font-bold">
                  ${(results.totalRevenue - results.discountedRevenue).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Funding Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Participation ({data.participationPercentage}%)</span>
                  <span className="font-bold">${results.participationValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cash ({data.cashPercentage}%)</span>
                  <span className="font-bold">${results.cashValue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">XML Preview</h3>
              <pre className="text-xs bg-secondary p-3 rounded-lg overflow-auto max-h-40">
                {generateXML()}
              </pre>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={saveScenario} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Scenario
              </Button>
              <Button onClick={downloadPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={downloadXML} variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                XML
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
