import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SampleDataXML() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sample data for HexIsle project
  const sampleProjectData = {
    id: 'sample-project-123',
    name: 'HexIsle',
    project_sku: 'HEXISLE-001',
    description: 'A modular island-building game system',
    products: [
      {
        id: 'medallion-product-123',
        name: 'Medallion',
        product_sku: 'MEDALLION-001',
        description: 'Hexagonal medallion with island terrain design',
        production_levels: [
          {
            id: 'level-1',
            level_number: 1,
            level_name: 'Prototype',
            units_count: 5,
            unit_price: 1000.00,
            votes_needed: 5000,
            current_votes: 3200
          },
          {
            id: 'level-2',
            level_number: 2,
            level_name: 'Small Batch',
            units_count: 50,
            unit_price: 125.00,
            votes_needed: 6250,
            current_votes: 4100
          },
          {
            id: 'level-3',
            level_number: 3,
            level_name: 'Production Run',
            units_count: 500,
            unit_price: 100.00,
            votes_needed: 50000,
            current_votes: 28000
          },
          {
            id: 'level-4',
            level_number: 4,
            level_name: 'Volume Production',
            units_count: 5000,
            unit_price: 75.00,
            votes_needed: 375000,
            current_votes: 150000
          },
          {
            id: 'level-5',
            level_number: 5,
            level_name: 'Mass Production',
            units_count: 15000,
            unit_price: 25.00,
            votes_needed: 375000,
            current_votes: 95000
          },
          {
            id: 'level-6',
            level_number: 6,
            level_name: 'Maximum Scale',
            units_count: 50000,
            unit_price: 25.00,
            votes_needed: 1250000,
            current_votes: 320000
          }
        ]
      }
    ]
  };

  const generateMedallionXML = () => {
    const projectData = sampleProjectData;
    const medallionProduct = projectData.products[0];
    
    // Sample data for member tracking
    const sampleAcceptedDate = new Date('2025-01-01');
    const currentDate = new Date();
    const daysSinceAcceptance = Math.floor((currentDate.getTime() - sampleAcceptedDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 100 - daysSinceAcceptance);
    const equityPercentage = Math.max(0, 100 - daysSinceAcceptance);
    const cashPercentage = Math.min(100, daysSinceAcceptance);
    const isCashOutEligible = daysSinceAcceptance >= 90;
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<MedallionModule>\n';
    xml += `  <ProjectID>${projectData.id}</ProjectID>\n`;
    xml += `  <ProjectName>${escapeXml(projectData.name)}</ProjectName>\n`;
    xml += `  <ProjectSKU>${projectData.project_sku || 'PENDING'}</ProjectSKU>\n`;
    
    // Member Credit & Equity Tracking
    xml += '  <MemberTracking>\n';
    xml += '    <InvitationDetails>\n';
    xml += '      <InvitationAccepted>true</InvitationAccepted>\n';
    xml += `      <AcceptedDate>${sampleAcceptedDate.toISOString()}</AcceptedDate>\n`;
    xml += '      <InitialCreditAmount>100.00</InitialCreditAmount>\n';
    xml += '    </InvitationDetails>\n';
    xml += '    <CreditAccount>\n';
    xml += '      <TotalCredits>100.00</TotalCredits>\n';
    xml += '      <UsedCredits>0.00</UsedCredits>\n';
    xml += '      <AvailableCredits>100.00</AvailableCredits>\n';
    xml += '      <EquityConversion>0.00</EquityConversion>\n';
    xml += '    </CreditAccount>\n';
    xml += '    <EquityCashTimer>\n';
    xml += `      <DaysSinceAcceptance>${daysSinceAcceptance}</DaysSinceAcceptance>\n`;
    xml += `      <DaysRemaining>${daysRemaining}</DaysRemaining>\n`;
    xml += `      <CurrentEquityPercentage>${equityPercentage}</CurrentEquityPercentage>\n`;
    xml += `      <CurrentCashPercentage>${cashPercentage}</CurrentCashPercentage>\n`;
    xml += `      <CashOutEligible>${isCashOutEligible}</CashOutEligible>\n`;
    xml += '      <CashOutEligibilityDay>90</CashOutEligibilityDay>\n';
    xml += '    </EquityCashTimer>\n';
    xml += '    <MemberChoices>\n';
    xml += '      <Choice id="1">\n';
    xml += '        <Type>ConvertToEquity</Type>\n';
    xml += '        <Description>Preorder any product to convert credits to equity</Description>\n';
    xml += '        <MinimumAmount>0.01</MinimumAmount>\n';
    xml += '        <MaximumAmount>100.00</MaximumAmount>\n';
    xml += '        <AutoSubscribesPortfolio>true</AutoSubscribesPortfolio>\n';
    xml += '        <CreatesBlockchainRecord>true</CreatesBlockchainRecord>\n';
    xml += '      </Choice>\n';
    xml += '      <Choice id="2">\n';
    xml += '        <Type>ShareCredits</Type>\n';
    xml += '        <Description>Share credits with new recipients</Description>\n';
    xml += '        <MinimumIncrementAmount>10.00</MinimumIncrementAmount>\n';
    xml += '        <AutomaticEquityForRecipient>true</AutomaticEquityForRecipient>\n';
    xml += '        <BypassesCountdownTimer>true</BypassesCountdownTimer>\n';
    xml += '        <MatchedEquityOnRecipientPreorder>true</MatchedEquityOnRecipientPreorder>\n';
    xml += '      </Choice>\n';
    xml += '      <Choice id="3">\n';
    xml += '        <Type>CashOut</Type>\n';
    xml += '        <Description>Wait 100 days and cash out full amount</Description>\n';
    xml += '        <EligibilityStartDay>90</EligibilityStartDay>\n';
    xml += '        <FullCashConversionDay>100</FullCashConversionDay>\n';
    xml += '        <Day90Conversion>90% cash, 10% equity</Day90Conversion>\n';
    xml += '        <Day100Conversion>100% cash ($100.00)</Day100Conversion>\n';
    xml += '      </Choice>\n';
    xml += '    </MemberChoices>\n';
    xml += '    <TransactionHistory>\n';
    xml += '      <Transaction id="1">\n';
    xml += '        <Type>InvitationAccepted</Type>\n';
    xml += '        <Amount>100.00</Amount>\n';
    xml += '        <Timestamp>2025-01-01T00:00:00Z</Timestamp>\n';
    xml += '        <BlockchainHash>0x1234567890abcdef</BlockchainHash>\n';
    xml += '        <Status>Confirmed</Status>\n';
    xml += '      </Transaction>\n';
    xml += '    </TransactionHistory>\n';
    xml += '    <Invitations>\n';
    xml += '      <SentInvitations>\n';
    xml += '        <Count>0</Count>\n';
    xml += '        <TotalAmountShared>0.00</TotalAmountShared>\n';
    xml += '      </SentInvitations>\n';
    xml += '      <AcceptedInvitations>\n';
    xml += '        <Count>0</Count>\n';
    xml += '        <TotalMatchedEquity>0.00</TotalMatchedEquity>\n';
    xml += '      </AcceptedInvitations>\n';
    xml += '    </Invitations>\n';
    xml += '  </MemberTracking>\n';
    
    // Product Details
    xml += '  <Product>\n';
    xml += `    <ProductID>${medallionProduct.id}</ProductID>\n`;
    xml += `    <ProductName>${escapeXml(medallionProduct.name)}</ProductName>\n`;
    xml += `    <ProductSKU>${medallionProduct.product_sku || 'PENDING'}</ProductSKU>\n`;
    xml += `    <Description>${escapeXml(medallionProduct.description || '')}</Description>\n`;
    xml += '    <QRCodeEnabled>true</QRCodeEnabled>\n';
    xml += '    <TracksKickstarterPledges>true</TracksKickstarterPledges>\n';
    
    if (medallionProduct.production_levels && medallionProduct.production_levels.length > 0) {
      xml += '    <ProductionLevels>\n';
      medallionProduct.production_levels
        .sort((a: any, b: any) => a.level_number - b.level_number)
        .forEach((level: any) => {
          const totalValue = Number(level.unit_price) * Number(level.units_count);
          const fundingPercentage = level.votes_needed > 0 
            ? Math.min(100, (Number(level.current_votes || 0) / Number(level.votes_needed)) * 100).toFixed(2)
            : '0.00';
          const isFullyFunded = Number(level.current_votes || 0) >= Number(level.votes_needed || 0);
          
          xml += '      <Level>\n';
          xml += `        <LevelNumber>${level.level_number}</LevelNumber>\n`;
          xml += `        <LevelName>${escapeXml(level.level_name)}</LevelName>\n`;
          xml += `        <UnitsCount>${level.units_count}</UnitsCount>\n`;
          xml += `        <UnitCost>${level.unit_price}</UnitCost>\n`;
          xml += `        <UnitPrice>${(Number(level.unit_price) * 1.2).toFixed(2)}</UnitPrice>\n`;
          xml += `        <Markup>20</Markup>\n`;
          xml += `        <VotesNeeded>${level.votes_needed || 0}</VotesNeeded>\n`;
          xml += `        <CurrentVotes>${level.current_votes || 0}</CurrentVotes>\n`;
          xml += `        <FundingPercentage>${fundingPercentage}</FundingPercentage>\n`;
          xml += `        <IsFullyFunded>${isFullyFunded}</IsFullyFunded>\n`;
          xml += `        <TotalValue>${totalValue}</TotalValue>\n`;
          
          // Special tracking for Prototype level (first level)
          if (level.level_number === 1) {
            xml += '        <SpecialTracking>\n';
            xml += '          <Type>Prototype</Type>\n';
            xml += '          <CountsKickstarterPledges>true</CountsKickstarterPledges>\n';
            xml += '          <RequiresRegistration>true</RequiresRegistration>\n';
            xml += '          <AutoSubscribesOnPreorder>true</AutoSubscribesOnPreorder>\n';
            xml += '        </SpecialTracking>\n';
          }
          
          xml += '      </Level>\n';
        });
      xml += '    </ProductionLevels>\n';
    }
    
    xml += '  </Product>\n';
    xml += '</MedallionModule>';
    
    return xml;
  };

  const generateFullProjectXML = () => {
    const projectData = sampleProjectData;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<ProjectModule>\n';
    xml += `  <ProjectID>${projectData.id}</ProjectID>\n`;
    xml += `  <ProjectName>${escapeXml(projectData.name)}</ProjectName>\n`;
    xml += `  <ProjectSKU>${projectData.project_sku || 'PENDING'}</ProjectSKU>\n`;
    xml += `  <Description>${escapeXml(projectData.description || '')}</Description>\n`;
    xml += '  <Products>\n';
    
    projectData.products.forEach((product: any) => {
      xml += '    <Product>\n';
      xml += `      <ProductID>${product.id}</ProductID>\n`;
      xml += `      <ProductName>${escapeXml(product.name)}</ProductName>\n`;
      xml += `      <ProductSKU>${product.product_sku || 'PENDING'}</ProductSKU>\n`;
      
      if (product.production_levels && product.production_levels.length > 0) {
        xml += '      <ProductionLevels>\n';
        product.production_levels
          .sort((a: any, b: any) => a.level_number - b.level_number)
          .forEach((level: any) => {
            xml += '        <Level>\n';
            xml += `          <LevelNumber>${level.level_number}</LevelNumber>\n`;
            xml += `          <LevelName>${escapeXml(level.level_name)}</LevelName>\n`;
            xml += `          <UnitsCount>${level.units_count}</UnitsCount>\n`;
            xml += `          <UnitPrice>${level.unit_price}</UnitPrice>\n`;
            xml += `          <VotesNeeded>${level.votes_needed || 0}</VotesNeeded>\n`;
            xml += `          <CurrentVotes>${level.current_votes || 0}</CurrentVotes>\n`;
            xml += '        </Level>\n';
          });
        xml += '      </ProductionLevels>\n';
      }
      
      xml += '    </Product>\n';
    });
    
    xml += '  </Products>\n';
    xml += '</ProjectModule>';
    
    return xml;
  };

  const escapeXml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const copyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: `${type} XML copied to clipboard`,
    });
  };

  const downloadXML = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: 'Downloaded!',
      description: `${filename} downloaded successfully`,
    });
  };

  const medallionXML = generateMedallionXML();
  const fullProjectXML = generateFullProjectXML();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              ← Back
            </Button>
            <h1 className="text-2xl font-bold">Sample Data XML</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="medallion" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="medallion">Medallion Product XML</TabsTrigger>
              <TabsTrigger value="full">Full Project XML</TabsTrigger>
            </TabsList>
            
            <TabsContent value="medallion">
              <Card>
                <CardHeader>
                  <CardTitle>Medallion Product XML Sample</CardTitle>
                  <CardDescription>
                    Sample XML for the Medallion product (first product) with QR code tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(medallionXML, 'Medallion')}
                      variant="outline"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy XML
                    </Button>
                    <Button
                      onClick={() => downloadXML(medallionXML, 'HexIsle_Medallion_Sample.xml')}
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download XML
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm font-mono">{medallionXML}</pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="full">
              <Card>
                <CardHeader>
                  <CardTitle>Full Project XML Sample</CardTitle>
                  <CardDescription>
                    Complete XML structure for HexIsle project with all products
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(fullProjectXML, 'Full Project')}
                      variant="outline"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy XML
                    </Button>
                    <Button
                      onClick={() => downloadXML(fullProjectXML, 'HexIsle_Full_Sample.xml')}
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download XML
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm font-mono">{fullProjectXML}</pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </main>
    </div>
  );
}
