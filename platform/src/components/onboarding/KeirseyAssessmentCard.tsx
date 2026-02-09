import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Brain, Users, Lightbulb, Cog, Info } from "lucide-react";

export function KeirseyAssessmentCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          About the Keirsey Temperament Sorter
        </CardTitle>
        <CardDescription>
          A personality assessment tool that identifies your temperament type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The Keirsey Temperament Sorter is a widely-used personality assessment that categorizes individuals 
            into four temperaments and 16 variants. This helps LianaBanyan understand how to best support your 
            work style, communication preferences, and team dynamics.
          </p>
        </div>

        {/* Four Temperaments */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">The Four Temperaments:</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Guardian (SJ)</span>
              </div>
              <p className="text-xs text-muted-foreground">Responsible, organized, traditional</p>
            </div>
            
            <div className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-1">
                <Cog className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-sm">Artisan (SP)</span>
              </div>
              <p className="text-xs text-muted-foreground">Practical, spontaneous, adaptable</p>
            </div>
            
            <div className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Idealist (NF)</span>
              </div>
              <p className="text-xs text-muted-foreground">Empathetic, imaginative, authentic</p>
            </div>
            
            <div className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm">Rational (NT)</span>
              </div>
              <p className="text-xs text-muted-foreground">Logical, strategic, innovative</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Time Required:</strong> 10-15 minutes<br/>
            <strong>Questions:</strong> 70 items<br/>
            <strong>Cost:</strong> Free basic assessment available
          </AlertDescription>
        </Alert>

        {/* Assessment Links */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Take the Assessment:</h4>
          <div className="flex flex-col gap-2">
            <Button 
              asChild 
              className="w-full justify-between"
            >
              <a 
                href="https://www.keirsey.com/temperament-assessment/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <span>Official Keirsey.com Assessment</span>
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="w-full justify-between"
            >
              <a 
                href="https://www.16personalities.com/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <span>Alternative: 16Personalities (MBTI-based)</span>
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Note: While we primarily use Keirsey, the 16Personalities test is also accepted as it 
            uses similar MBTI-based typing that can be mapped to Keirsey temperaments.
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Privacy & Usage
          </h4>
          <p className="text-xs text-muted-foreground">
            Your assessment results are confidential and stored in your HR file. They are used solely for:
          </p>
          <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-4">
            <li>• Team composition and dynamics</li>
            <li>• Communication style optimization</li>
            <li>• Project role assignments</li>
            <li>• Professional development planning</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
