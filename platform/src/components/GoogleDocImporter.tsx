import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GoogleDocImporterProps {
  projectId: string;
  workstationId?: string;
  onImportComplete?: () => void;
}

export const GoogleDocImporter = ({ projectId, workstationId, onImportComplete }: GoogleDocImporterProps) => {
  const [docUrl, setDocUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!docUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a Google Doc URL",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      // Fetch the Google Doc content
      const response = await fetch(`https://docs.google.com/document/d/${extractDocId(docUrl)}/export?format=txt`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch document. Make sure the document is publicly accessible.");
      }

      const content = await response.text();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to import documents");
      }

      // Create asset submission with locked status
      const { error: submitError } = await supabase
        .from("asset_submissions")
        .insert({
          project_id: projectId,
          workstation_id: workstationId,
          member_id: user.id,
          asset_type: "campaign_narrative",
          asset_title: "Imported from Google Doc",
          asset_content: {
            source_url: docUrl,
            imported_content: content,
            imported_at: new Date().toISOString(),
          },
          is_contribution_locked: true,
          status: "submitted",
        });

      if (submitError) throw submitError;

      toast({
        title: "Import Successful",
        description: "Document content has been imported and locked for authority on LB Portal",
      });

      setDocUrl("");
      onImportComplete?.();
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import document",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const extractDocId = (url: string): string => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error("Invalid Google Doc URL");
    }
    return match[1];
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-primary/20">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent/50 transition-colors shrink-0">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Google Doc Asset Importer
                </CardTitle>
                <CardDescription className="mt-1.5">
                  Import campaign content from Google Docs and lock it as authoritative source
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Paste Google Doc share link..."
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                disabled={isImporting}
              />
              <Button onClick={handleImport} disabled={isImporting || !docUrl.trim()}>
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Import & Lock
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>How it works:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Share your Google Doc with "Anyone with the link can view"</li>
                <li>Paste the share link above</li>
                <li>Content will be imported and locked with authority on LB Portal</li>
                <li>Locked assets prevent unauthorized edits and serve as manufacturing source</li>
              </ol>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
