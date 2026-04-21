import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Check, X, ArrowLeft, Lock, FileText, Hash } from "lucide-react";
import { toast } from "sonner";
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface ModuleData {
  id: string;
  module_version: number;
  previous_hash: string | null;
  current_hash: string;
  is_verified: boolean;
  signed_at: string;
  tamper_detected: boolean;
  created_at: string;
}

interface VerificationResult {
  module_id: string;
  version: number;
  is_valid: boolean;
  expected_hash: string;
  actual_hash: string;
  error_message: string | null;
}

export default function BlockchainExplorer() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectSku, setProjectSku] = useState("");
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [overallValid, setOverallValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (projectId) {
      loadBlockchainData();
    }
  }, [projectId]);

  const loadBlockchainData = async () => {
    try {
      setLoading(true);

      // Get project info
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("name, project_sku")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;

      setProjectName(project.name);
      setProjectSku(project.project_sku || "PENDING");

      // Get all modules
      const { data: moduleData, error: moduleError } = await supabase
        .from("project_modules")
        .select("*")
        .eq("project_id", projectId)
        .order("module_version", { ascending: true });

      if (moduleError) throw moduleError;

      setModules(moduleData || []);
    } catch (error) {
      console.error("Error loading blockchain data:", error);
      toast.error("Failed to load blockchain data");
    } finally {
      setLoading(false);
    }
  };

  const verifyChain = async () => {
    try {
      setVerifying(true);

      const { data, error } = await supabase.rpc("verify_module_chain", {
        _project_id: projectId,
      });

      if (error) throw error;

      setVerificationResults(data || []);

      const allValid = data?.every((r: VerificationResult) => r.is_valid) ?? false;
      setOverallValid(allValid);

      if (allValid) {
        toast.success("Blockchain verified! No tampering detected.");
      } else {
        toast.error("Tampering detected in blockchain!");
      }

      // Log verification
      await supabase.rpc("log_blockchain_verification", {
        _project_id: projectId,
        _performed_by: (await supabase.auth.getUser()).data.user?.id,
        _verification_result: { results: data, all_valid: allValid },
        _notes: allValid ? "Chain integrity verified" : "Tampering detected",
      });
    } catch (error) {
      console.error("Error verifying chain:", error);
      toast.error("Failed to verify blockchain");
    } finally {
      setVerifying(false);
    }
  };

  const formatHash = (hash: string | null) => {
    if (!hash) return "GENESIS (First Block)";
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <PortalPageLayout maxWidth="xl" xrayId="blockchain-explorer">
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="xl" xrayId="blockchain-explorer">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Blockchain Explorer</h1>
          </div>
          <p className="text-muted-foreground">
            {projectName} ({projectSku})
          </p>
        </div>

        <Button onClick={verifyChain} disabled={verifying || modules.length === 0}>
          {verifying ? (
            <>Verifying Chain...</>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Verify Blockchain
            </>
          )}
        </Button>
      </div>

      {overallValid !== null && (
        <Alert variant={overallValid ? "default" : "destructive"}>
          <div className="flex items-center gap-2">
            {overallValid ? (
              <>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Blockchain integrity verified. All {modules.length} version(s) are valid and tamper-proof.
                </AlertDescription>
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                <AlertDescription>
                  Tampering detected! One or more versions have invalid hashes.
                </AlertDescription>
              </>
            )}
          </div>
        </Alert>
      )}

      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No blockchain modules found for this project.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((module, index) => {
            const verification = verificationResults.find(
              (v) => v.module_id === module.id
            );

            return (
              <Card key={module.id} className="relative">
                <div className="absolute top-4 right-4">
                  {verification ? (
                    verification.is_valid ? (
                      <Badge variant="default" className="gap-1">
                        <Check className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <X className="h-3 w-3" />
                        Invalid
                      </Badge>
                    )
                  ) : module.is_verified ? (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Signed
                    </Badge>
                  ) : null}
                </div>

                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Version {module.module_version}
                    {index === 0 && <Badge variant="secondary">Genesis Block</Badge>}
                  </CardTitle>
                  <CardDescription>
                    Created: {formatDate(module.created_at)} | Signed: {formatDate(module.signed_at)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Previous Hash</label>
                      <code className="block mt-1 p-2 bg-muted rounded text-xs font-mono break-all">
                        {formatHash(module.previous_hash)}
                      </code>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Current Hash (SHA-256)</label>
                      <code className="block mt-1 p-2 bg-muted rounded text-xs font-mono break-all">
                        {module.current_hash}
                      </code>
                    </div>

                    {verification && !verification.is_valid && (
                      <Alert variant="destructive">
                        <X className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Hash Mismatch:</strong> {verification.error_message}
                          <div className="mt-2 text-xs font-mono">
                            <div>Expected: {formatHash(verification.expected_hash)}</div>
                            <div>Actual: {formatHash(verification.actual_hash)}</div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {index < modules.length - 1 && (
                    <div className="flex justify-center">
                      <div className="w-0.5 h-8 bg-border" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </div>
    </PortalPageLayout>
  );
}
